import AcademicRecord from "../models/academicRecord.model.js";
import Student from "../models/student.model.js";
import Institution from "../models/institution.model.js";
import crypto from "crypto";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import { cloudinaryUtils } from "../config/cloudinary.js";
import Notification from "../models/notification.model.js";

// Helper function to add signed URLs to records
const addSignedUrlsToRecords = async (records) => {
  if (!records) return records;

  if (Array.isArray(records)) {
    // Handle array of records
    const recordsWithUrls = await Promise.all(
      records.map(async (record) => {
        const recordObj = record.toObject ? record.toObject() : record;
        if (recordObj.documents && recordObj.documents.length > 0) {
          recordObj.documents = await Promise.all(
            recordObj.documents.map(async (doc) => ({
              ...doc,
              signedUrl: await cloudinaryUtils.generateSignedUrl(
                doc.filePublicId,
            3600 // URL valid for 1 hour
              ),
            }))
          );
        }
        return recordObj;
      })
    );
    return recordsWithUrls;
  } else {
    // Handle single record
    const recordObj = records.toObject ? records.toObject() : records;
    if (recordObj.documents && recordObj.documents.length > 0) {
      recordObj.documents = await Promise.all(
        recordObj.documents.map(async (doc) => ({
          ...doc,
          signedUrl: await cloudinaryUtils.generateSignedUrl(
            doc.filePublicId,
        3600 // URL valid for 1 hour
          ),
        }))
      );
    }
    return recordObj;
  }
};

// Create a new academic record (by student)
export const createAcademicRecord = async (req, res, next) => {
  try {
    // Files are available as req.files thanks to multer middleware
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files were uploaded",
      });
    }

    const { recordType, title, institutionId, gpa } = req.body;

    // Validate GPA
    const gpaValue = parseFloat(gpa);
    if (isNaN(gpaValue) || gpaValue < 0 || gpaValue > 4.0) {
      return res.status(400).json({
        success: false,
        message: "Invalid GPA value. Must be between 0 and 4.0",
      });
    }

    // Get the student ID from the authenticated user
    const studentId = req.user._id;

    // Get student details
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Verify the institution exists
    const institution = await Institution.findById(institutionId);
    if (!institution) {
      return res.status(404).json({
        success: false,
        message: "Institution not found",
      });
    }

    // Generate a unique hash for this record
    const uniqueStr = `${studentId}_${institutionId}_${title}_${recordType}_${new Date().getTime()}_${Math.random()
      .toString(36)
      .substring(2, 15)}`;
    const hash = crypto.createHash("sha256").update(uniqueStr).digest("hex");

    // Process all uploaded files
    const documents = req.files.map((file) => ({
      fileUrl: file.path,
      filePublicId: file.filename,
      documentName: file.originalname,
      documentType: file.mimetype,
      uploadedAt: new Date(),
    }));

    // Create the academic record
    const academicRecord = await AcademicRecord.create({
      studentId,
      institutionId,
      recordType,
      title,
      gpa: gpaValue,
      documents,
      hash,
      status: "pending", // Initially pending until institution verifies
    });

    // Add signed URLs to documents
    const recordWithUrls = await addSignedUrlsToRecords(academicRecord);

    // Return the record with signed URLs
    res.status(201).json({
      success: true,
      data: recordWithUrls,
    });
  } catch (error) {
    // If there's an error, cleanup any uploaded files
    if (req.files) {
      await Promise.all(
        req.files.map((file) => cloudinaryUtils.cleanupUpload(file))
      );
    }
    console.error("Error in createAcademicRecord:", error);
    next(error);
  }
};

// Verify or reject an academic record (by institution)
export const verifyAcademicRecord = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action, rejectionReason } = req.body;

    if (!["verify", "reject"].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Invalid action. Use 'verify' or 'reject'.",
      });
    }

    const record = await AcademicRecord.findById(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Academic record not found",
      });
    }

    // Check if the institution is making this request
    const institutionId = req.user._id;

    if (record.institutionId.toString() !== institutionId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to verify/reject this record",
      });
    }

    // Update record status
    if (action === "verify") {
      record.status = "verified";
      record.rejectionReason = null;

      // Create notification for verified record
      await Notification.createRecordVerified(record.studentId, record._id);
    } else {
      if (!rejectionReason) {
        return res.status(400).json({
          success: false,
          message: "Rejection reason is required",
        });
      }
      record.status = "rejected";
      record.rejectionReason = rejectionReason;

      // Create notification for rejected record
      await Notification.create({
        recipient: record.studentId,
        type: "RECORD_REJECTED",
        title: "Academic Record Rejected",
        message: `Your academic record has been rejected. Reason: ${rejectionReason}`,
        data: { recordId: record._id },
        priority: "high",
      });
    }

    await record.save();

    // Add signed URL to the response
    const recordWithUrl = await addSignedUrlsToRecords(record);

    res.status(200).json({
      success: true,
      data: recordWithUrl,
    });
  } catch (error) {
    next(error);
  }
};

// Get all academic records for a student
export const getStudentAcademicRecords = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    // Check if the request is from the student, institution, or admin
    const isStudent =
      req.user.userType === "Student" && req.user._id.toString() === studentId;
    const isInstitution = req.user.userType === "Institution";
    const isAdmin = req.user.userType === "Admin";
    const isCompany = req.user.userType === "Company" && req.user.isVerified;

    if (!isStudent && !isInstitution && !isAdmin && !isCompany) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access these records",
      });
    }

    // For institution, only show records from their institution
    let query = { studentId };
    if (isInstitution) {
      query.institutionId = req.user._id;
    }

    // For companies, only show verified records
    if (isCompany) {
      query.status = "verified";
    }

    const records = await AcademicRecord.find(query)
      .populate("institutionId", "name email")
      .sort({ createdAt: -1 });

    // Add signed URLs to each record
    const recordsWithUrls = await addSignedUrlsToRecords(records);

    res.status(200).json({
      success: true,
      count: records.length,
      data: recordsWithUrls,
    });
  } catch (error) {
    next(error);
  }
};

// Get all academic records for current student
export const getMyAcademicRecords = async (req, res, next) => {
  try {
    const studentId = req.user._id;

    const records = await AcademicRecord.find({ studentId })
      .populate("institutionId", "name email")
      .sort({ createdAt: -1 });

    // Add signed URLs to each record
    const recordsWithUrls = await addSignedUrlsToRecords(records);

    res.status(200).json({
      success: true,
      count: records.length,
      data: recordsWithUrls,
    });
  } catch (error) {
    next(error);
  }
};

// Get all pending academic records for an institution
export const getPendingAcademicRecords = async (req, res, next) => {
  try {
    const institutionId = req.user._id;

    const records = await AcademicRecord.find({
      institutionId,
      status: "pending",
    })
      .populate("studentId", "name wallet roleNumber skills")
      .sort({ createdAt: -1 });

    // Add signed URLs to each record
    const recordsWithUrls = await addSignedUrlsToRecords(records);

    res.status(200).json({
      success: true,
      count: records.length,
      data: recordsWithUrls,
    });
  } catch (error) {
    next(error);
  }
};

// Get all academic records issued by an institution
export const getInstitutionAcademicRecords = async (req, res, next) => {
  try {
    const institutionId = req.params.institutionId || req.user._id;

    // Check authorization
    const isRequestingInstitution =
      req.user.userType === "Institution" &&
      req.user._id.toString() === institutionId.toString();
    const isAdmin = req.user.userType === "Admin";

    if (!isRequestingInstitution && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access these records",
      });
    }

    // Filter by status if provided
    const { status } = req.query;
    const query = { institutionId };

    if (status && ["pending", "verified", "rejected"].includes(status)) {
      query.status = status;
    }

    const records = await AcademicRecord.find(query)
      .populate("studentId", "name wallet roleNumber skills")
      .sort({ createdAt: -1 });

    // Add signed URLs to each record
    const recordsWithUrls = await addSignedUrlsToRecords(records);

    res.status(200).json({
      success: true,
      count: records.length,
      data: recordsWithUrls,
    });
  } catch (error) {
    next(error);
  }
};

// Get a single academic record by ID
export const getAcademicRecordById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const record = await AcademicRecord.findById(id)
      .populate("studentId", "name wallet roleNumber skills")
      .populate("institutionId", "name email");

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Academic record not found",
      });
    }

    // Check if the requester is authorized to view this record
    const isStudent =
      req.user.userType === "Student" &&
      req.user._id.toString() === record.studentId._id.toString();
    const isInstitution =
      req.user.userType === "Institution" &&
      req.user._id.toString() === record.institutionId._id.toString();
    const isAdmin = req.user.userType === "Admin";
    const isCompany = req.user.userType === "Company" && req.user.isVerified;

    // Companies can only view verified records
    if (isCompany && record.status !== "verified") {
      return res.status(403).json({
        success: false,
        message: "This record has not been verified by the institution",
      });
    }

    if (!isStudent && !isInstitution && !isAdmin && !isCompany) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this record",
      });
    }

    // Add signed URL to the record
    const recordWithUrl = await addSignedUrlsToRecords(record);

    res.status(200).json({
      success: true,
      data: recordWithUrl,
    });
  } catch (error) {
    next(error);
  }
};

// Update an academic record (student can only update if it's in 'rejected' status)
export const updateAcademicRecord = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Files are available as req.files thanks to multer middleware
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files were uploaded",
      });
    }

    const record = await AcademicRecord.findById(id);

    if (!record) {
      // Cleanup uploaded file if record not found
      await Promise.all(
        req.files.map((file) => cloudinaryUtils.cleanupUpload(file))
      );
      return res.status(404).json({
        success: false,
        message: "Academic record not found",
      });
    }

    // Check if the student owns this record
    if (record.studentId.toString() !== req.user._id.toString()) {
      // Cleanup uploaded file if not authorized
      await Promise.all(
        req.files.map((file) => cloudinaryUtils.cleanupUpload(file))
      );
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this record",
      });
    }

    // Check if the record is rejected
    if (record.status !== "rejected") {
      // Cleanup uploaded file if record not rejected
      await Promise.all(
        req.files.map((file) => cloudinaryUtils.cleanupUpload(file))
      );
      return res.status(400).json({
        success: false,
        message: "Only rejected records can be updated",
      });
    }

    // Delete the old documents from Cloudinary
    if (record.documents && record.documents.length > 0) {
      await Promise.all(
        record.documents.map((doc) => cloudinaryUtils.deleteFile(doc.filePublicId))
      );
    }

    // Process all uploaded files
    const documents = req.files.map((file) => ({
      fileUrl: file.path,
      filePublicId: file.filename,
      documentName: file.originalname,
      documentType: file.mimetype,
      uploadedAt: new Date(),
    }));

    // Update the record with new documents
    record.documents = documents;
    record.status = "pending"; // Reset status to pending for new verification
    record.rejectionReason = null; // Clear rejection reason

    await record.save();

    // Add signed URLs to documents
    const recordWithUrls = await addSignedUrlsToRecords(record);

    res.status(200).json({
      success: true,
      data: recordWithUrls,
    });
  } catch (error) {
    // If there's an error, cleanup any uploaded files
    if (req.files) {
      await Promise.all(
        req.files.map((file) => cloudinaryUtils.cleanupUpload(file))
      );
    }
    console.error("Error in updateAcademicRecord:", error);
    next(error);
  }
};

// Check hash validity
export const checkHashValidity = async (req, res, next) => {
  try {
    const { hash } = req.params;

    const record = await AcademicRecord.findOne({ hash })
      .populate("studentId", "name wallet roleNumber")
      .populate("institutionId", "name email");

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "No record found with this hash",
      });
    }

    // Only verified records can be validated by hash
    const isValid = record.status === "verified";

    let recordWithUrl = null;
    if (isValid) {
      // Add signed URL to the record if it's valid
      recordWithUrl = await addSignedUrlsToRecords(record);
    }

    res.status(200).json({
      success: true,
      data: {
        isValid,
        record: isValid ? recordWithUrl : null,
        message: isValid
          ? "Record is verified"
          : "Record has not been verified by the institution",
      },
    });
  } catch (error) {
    next(error);
  }
};

// Delete an academic record (admin or student if pending)
export const deleteAcademicRecord = async (req, res, next) => {
  try {
    const { id } = req.params;

    const record = await AcademicRecord.findById(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Academic record not found",
      });
    }

    // Check authorization
    const isStudent =
      req.user.userType === "Student" &&
      record.studentId.toString() === req.user._id.toString() &&
      record.status === "pending"; // Students can only delete pending records

    const isAdmin = req.user.userType === "Admin";

    if (!isStudent && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this record",
      });
    }

    // Delete documents from Cloudinary if they exist
    if (record.documents && record.documents.length > 0) {
      await Promise.all(
        record.documents.map((doc) => cloudinaryUtils.deleteFile(doc.filePublicId))
      );
    }

    await record.deleteOne();

    res.status(200).json({
      success: true,
      message: "Academic record deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Get all academic records (admin only)
export const getAllAcademicRecords = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = {};

    if (status && ["pending", "verified", "rejected"].includes(status)) {
      query.status = status;
    }

    const records = await AcademicRecord.find(query)
      .populate("studentId", "name wallet roleNumber skills")
      .populate("institutionId", "name email")
      .sort({ createdAt: -1 });

    // Add signed URLs to each record
    const recordsWithUrls = await addSignedUrlsToRecords(records);

    res.status(200).json({
      success: true,
      count: records.length,
      data: recordsWithUrls,
    });
  } catch (error) {
    next(error);
  }
};
