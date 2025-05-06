import Application from "../models/application.model.js";
import Job from "../models/job.model.js";
import AcademicRecord from "../models/academicRecord.model.js";
import Student from "../models/student.model.js";
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

// Helper function to add signed URLs to applications with academic records
const addSignedUrlsToApplicationAcademicRecords = async (applications) => {
  if (!applications) return applications;

  const processRecords = async (records) => {
    if (!records || !Array.isArray(records) || records.length === 0)
      return records;

    return await Promise.all(
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
  };

  if (Array.isArray(applications)) {
    // Handle array of applications
    return await Promise.all(
      applications.map(async (application) => {
        const appObj = application.toObject
          ? application.toObject()
          : application;

        // Add signed URLs to academic records if they exist
        if (appObj.academicRecords && appObj.academicRecords.length > 0) {
          appObj.academicRecords = await processRecords(appObj.academicRecords);
        }

        return appObj;
      })
    );
  } else {
    // Handle single application
    const appObj = applications.toObject
      ? applications.toObject()
      : applications;

    // Add signed URLs to academic records if they exist
    if (appObj.academicRecords && appObj.academicRecords.length > 0) {
      appObj.academicRecords = await processRecords(appObj.academicRecords);
    }

    return appObj;
  }
};

// Apply to a job (student only)
export const applyToJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { coverLetter, academicRecordIds } = req.body;

    // Get student ID from authenticated user
    const studentId = req.user._id;

    // Check if job exists and is open
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    if (job.status !== "open") {
      return res.status(400).json({
        success: false,
        message: `Cannot apply to a job that is ${job.status}`,
      });
    }

    // Check if student has already applied to this job
    const existingApplication = await Application.findOne({ jobId, studentId });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: "You have already applied to this job",
      });
    }

    // Verify all academic records belong to this student and are verified
    if (academicRecordIds && academicRecordIds.length > 0) {
      const records = await AcademicRecord.find({
        _id: { $in: academicRecordIds },
        studentId,
        status: "verified", // Only allow verified records
      });

      if (records.length !== academicRecordIds.length) {
        return res.status(400).json({
          success: false,
          message: "Some academic records are invalid or not verified",
        });
      }
    } else {
      // Require at least one verified academic record
      const hasVerifiedRecords = await AcademicRecord.exists({
        studentId,
        status: "verified",
      });

      if (!hasVerifiedRecords) {
        return res.status(400).json({
          success: false,
          message:
            "You need at least one verified academic record to apply for jobs",
        });
      }
    }

    // Create the application
    const application = await Application.create({
      jobId,
      studentId,
      coverLetter,
      academicRecords: academicRecordIds || [],
      status: "pending",
    });

    res.status(201).json({
      success: true,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

// Get all applications for current student
export const getMyApplications = async (req, res, next) => {
  try {
    const studentId = req.user._id;

    const applications = await Application.find({ studentId })
      .populate({
        path: "jobId",
        populate: {
          path: "companyId",
          select: "name",
        },
      })
      .populate("academicRecords")
      .sort({ createdAt: -1 });

    // Add signed URLs to the academic records
    const processedApplications =
      await addSignedUrlsToApplicationAcademicRecords(applications);

    res.status(200).json({
      success: true,
      count: applications.length,
      data: processedApplications,
    });
  } catch (error) {
    next(error);
  }
};

// Get application details
export const getApplicationById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const application = await Application.findById(id)
      .populate({
        path: "jobId",
        populate: {
          path: "companyId",
          select: "name email",
        },
      })
      .populate("studentId", "name wallet roleNumber skills")
      .populate("academicRecords");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }
    //5320465
    // Check authorization
    const isOwnerStudent =
      req.user.userType === "Student" &&
      req.user._id.toString() === application.studentId._id.toString();

    const isOwnerCompany =
      req.user.userType === "Company" &&
      req.user._id.toString() === application.jobId.companyId._id.toString();

    const isAdmin = req.user.userType === "Admin";

    if (!isOwnerStudent && !isOwnerCompany && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this application",
      });
    }

    // Add signed URLs to the academic records
    const processedApplication =
      await addSignedUrlsToApplicationAcademicRecords(application);

    res.status(200).json({
      success: true,
      data: processedApplication,
    });
  } catch (error) {
    next(error);
  }
};

// Withdraw an application (student only)
export const withdrawApplication = async (req, res, next) => {
  try {
    const { id } = req.params;

    const application = await Application.findById(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // Check if the student owns this application
    if (application.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to withdraw this application",
      });
    }

    // Check if application can be withdrawn (only pending applications)
    if (application.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Cannot withdraw an application that is ${application.status}`,
      });
    }

    await application.deleteOne();

    res.status(200).json({
      success: true,
      message: "Application withdrawn successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Get all students who have been hired by a company
export const getHiredStudents = async (req, res, next) => {
  try {
    const companyId = req.user._id;

    // Find all jobs where a student has been hired
    const filledJobs = await Job.find({
      companyId,
      status: "filled",
      hiredApplicant: { $ne: null },
    });

    const hiredStudentIds = filledJobs.map((job) => job.hiredApplicant);

    // Get student details
    const hiredStudents = await Student.find({
      _id: { $in: hiredStudentIds },
    }).select("name wallet roleNumber");

    res.status(200).json({
      success: true,
      count: hiredStudents.length,
      data: hiredStudents,
    });
  } catch (error) {
    next(error);
  }
};

// Get all applications for jobs posted by the company
export const getCompanyApplications = async (req, res, next) => {
  try {
    const companyId = req.user._id;

    // Find all jobs posted by the company
    const jobs = await Job.find({ companyId });
    const jobIds = jobs.map((job) => job._id);

    // Find all applications for these jobs
    const applications = await Application.find({ jobId: { $in: jobIds } })
      .populate("jobId", "title status")
      .populate("studentId", "name roleNumber skills")
      .populate({
        path: "academicRecords",
        populate: {
          path: "institutionId",
          select: "name",
        },
      })
      .sort({ createdAt: -1 });

    // Add signed URLs to the academic records
    const processedApplications =
      await addSignedUrlsToApplicationAcademicRecords(applications);

    res.status(200).json({
      success: true,
      count: applications.length,
      data: processedApplications,
    });
  } catch (error) {
    next(error);
  }
};

// Update application status (accept/reject)
export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    if (!status || !["pending", "accepted", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be 'pending', 'accepted', or 'rejected'",
      });
    }

    // Find the application
    const application = await Application.findById(id)
      .populate("jobId")
      .populate("studentId", "name email")
      .populate("academicRecords");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // Check if the company owns the job associated with this application
    if (application.jobId.companyId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this application",
      });
    }

    // Update application status
    application.status = status;
    await application.save();

    // If accepting application and job is still open, consider updating job status
    if (status === "accepted" && application.jobId.status === "open") {
      // Optional: You could mark the job as filled here if needed
      const job = await Job.findById(application.jobId._id);
      job.status = "filled";
      job.hiredApplicant = application.studentId._id;
      await job.save();
    }

    // Add signed URLs to the academic records if they exist
    const processedApplication =
      await addSignedUrlsToApplicationAcademicRecords(application);

    res.status(200).json({
      success: true,
      data: processedApplication,
    });
  } catch (error) {
    next(error);
  }
};

// Get all applications (admin only)
export const getAllApplicationsAdmin = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = {};

    if (status && ["pending", "accepted", "rejected"].includes(status)) {
      query.status = status;
    }

    const applications = await Application.find(query)
      .populate("studentId", "name wallet roleNumber skills")
      .populate("jobId", "title description requirements")
      .populate({
        path: "jobId",
        populate: {
          path: "companyId",
          select: "name email",
        },
      })
      .populate("academicRecords")
      .sort({ createdAt: -1 });

    // Add signed URLs to academic records
    const applicationsWithUrls = await Promise.all(
      applications.map(async (application) => {
        const applicationObj = application.toObject();
        if (applicationObj.academicRecords?.length > 0) {
          applicationObj.academicRecords = await addSignedUrlsToRecords(
            applicationObj.academicRecords
          );
        }
        return applicationObj;
      })
    );

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applicationsWithUrls,
    });
  } catch (error) {
    next(error);
  }
};
