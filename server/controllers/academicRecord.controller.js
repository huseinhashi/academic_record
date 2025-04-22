import AcademicRecord from "../models/academicRecord.model.js";
import Student from "../models/student.model.js";
import Institution from "../models/institution.model.js";
import crypto from "crypto";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import { cloudinaryUtils } from "../config/cloudinary.js";

// Helper function to add signed URLs to records
const addSignedUrlsToRecords = async (records) => {
  if (!records) return records;

  if (Array.isArray(records)) {
    // Handle array of records
    const recordsWithUrls = await Promise.all(
      records.map(async (record) => {
        const recordObj = record.toObject ? record.toObject() : record;
        if (recordObj.filePublicId) {
          recordObj.signedUrl = await cloudinaryUtils.generateSignedUrl(
            recordObj.filePublicId,
            3600 // URL valid for 1 hour
          );
        }
        return recordObj;
      })
    );
    return recordsWithUrls;
  } else {
    // Handle single record
    const recordObj = records.toObject ? records.toObject() : records;
    if (recordObj.filePublicId) {
      recordObj.signedUrl = await cloudinaryUtils.generateSignedUrl(
        recordObj.filePublicId,
        3600 // URL valid for 1 hour
      );
    }
    return recordObj;
  }
};

// Create a new academic record (by student)
export const createAcademicRecord = async (req, res, next) => {
  try {
    // File is available as req.file thanks to multer middleware
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file was uploaded",
      });
    }

    const { recordType, title } = req.body;

    // Get the student ID from the authenticated user
    const studentId = req.user._id;

    // Get student details including institution
    const student = await Student.findById(studentId).populate("institutionId");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Get the institution ID from the student
    const institutionId = student.institutionId;

    if (!institutionId) {
      return res.status(400).json({
        success: false,
        message: "Student is not associated with any institution",
      });
    }

    // Generate a unique hash for this record
    // Include more entropy sources to ensure uniqueness
    const uniqueStr = `${studentId}_${institutionId}_${title}_${recordType}_${new Date().getTime()}_${Math.random()
      .toString(36)
      .substring(2, 15)}`;
    const hash = crypto.createHash("sha256").update(uniqueStr).digest("hex");

    const filePublicId = req.file.filename;

    // Generate a temporary signed URL (valid for 1 hour) to return to the client
    const signedUrl = await cloudinaryUtils.generateSignedUrl(
      filePublicId,
      3600
    );

    // Create the academic record
    const academicRecord = await AcademicRecord.create({
      studentId,
      institutionId,
      recordType,
      title,
      fileUrl: req.file.path, // This is the Cloudinary URL (but requires signing to access)
      filePublicId: filePublicId, // Store this for generating signed URLs later
      hash,
      status: "pending", // Initially pending until institution verifies
    });

    // Return the record with a temporary signed URL
    res.status(201).json({
      success: true,
      data: {
        ...academicRecord.toObject(),
        signedUrl: signedUrl, // Add temporary signed URL for immediate access
      },
    });
  } catch (error) {
    // If there's an error, cleanup any uploaded file
    if (req.file) {
      await cloudinaryUtils.cleanupUpload(req.file);
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
    } else {
      if (!rejectionReason) {
        return res.status(400).json({
          success: false,
          message: "Rejection reason is required",
        });
      }
      record.status = "rejected";
      record.rejectionReason = rejectionReason;
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
      .populate("studentId", "name wallet roleNumber")
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
      .populate("studentId", "name wallet roleNumber")
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
      .populate("studentId", "name wallet roleNumber")
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
      record.studentId.toString() === req.user._id.toString();

    // Students can only update rejected records with a new file
    if (isStudent) {
      if (record.status !== "rejected") {
        return res.status(403).json({
          success: false,
          message: "Can only update records that have been rejected",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file was uploaded",
        });
      }

      // Delete the old file from Cloudinary
      if (record.filePublicId) {
        await cloudinaryUtils.deleteFile(record.filePublicId);
      }

      // Generate a new unique hash for this updated record
      const uniqueStr = `${record.studentId}_${record.institutionId}_${
        record.title
      }_${record.recordType}_${new Date().getTime()}_${Math.random()
        .toString(36)
        .substring(2, 15)}`;
      const hash = crypto.createHash("sha256").update(uniqueStr).digest("hex");

      // Update record with new file info
      record.fileUrl = req.file.path;
      record.filePublicId = req.file.filename;
      record.hash = hash; // Set the new hash
      record.status = "pending"; // Reset to pending for re-verification
      record.rejectionReason = null;

      await record.save();

      // Generate a signed URL for the new file
      const signedUrl = await cloudinaryUtils.generateSignedUrl(
        record.filePublicId,
        3600
      );

      return res.status(200).json({
        success: true,
        data: {
          ...record.toObject(),
          signedUrl,
        },
      });
    }

    return res.status(403).json({
      success: false,
      message: "Not authorized to update this record",
    });
  } catch (error) {
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

    // Delete file from Cloudinary if it exists
    if (record.filePublicId) {
      await cloudinaryUtils.deleteFile(record.filePublicId);
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
