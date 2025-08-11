import Job, { JOB_CATEGORIES } from "../models/job.model.js";
import Application from "../models/application.model.js";
import AcademicRecord from "../models/academicRecord.model.js";
import Company from "../models/company.model.js";
import { cloudinaryUtils } from "../config/cloudinary.js";
import Student from "../models/student.model.js";

// Add this helper function at the top of the file, after the imports
const addSignedUrlToRecord = async (record) => {
  if (!record) return record;
  const recordObj = record.toObject ? record.toObject() : record;
  if (recordObj.documents && recordObj.documents.length > 0) {
    recordObj.documents = await Promise.all(
      recordObj.documents.map(async (doc) => ({
        ...doc,
        signedUrl: await cloudinaryUtils.generateSignedUrl(
          doc.filePublicId,
          3600
        ),
      }))
    );
  }
  return recordObj;
};

const addSignedUrlsToJobs = async (jobs) => {
  if (!jobs) return jobs;

  if (Array.isArray(jobs)) {
    // Handle array of jobs
    const jobsWithUrls = await Promise.all(
      jobs.map(async (job) => {
        const jobObj = job.toObject ? job.toObject() : job;
        if (jobObj.documents && jobObj.documents.length > 0) {
          jobObj.documents = await Promise.all(
            jobObj.documents.map(async (doc) => ({
              ...doc,
              signedUrl: await cloudinaryUtils.generateSignedUrl(
                doc.documentPublicId,
                3600 // URL valid for 1 hour
              ),
            }))
          );
        }
        return jobObj;
      })
    );
    return jobsWithUrls;
  } else {
    // Handle single job
    const jobObj = jobs.toObject ? jobs.toObject() : jobs;
    if (jobObj.documents && jobObj.documents.length > 0) {
      jobObj.documents = await Promise.all(
        jobObj.documents.map(async (doc) => ({
          ...doc,
          signedUrl: await cloudinaryUtils.generateSignedUrl(
            doc.documentPublicId,
            3600 // URL valid for 1 hour
          ),
        }))
      );
    }
    return jobObj;
  }
};

// Create a new job posting (company only)
export const createJob = async (req, res, next) => {
  try {
    const {
      title,
      description,
      requirements,
      location,
      salary,
      certificateRequirements,
      category,
      customCategory,
      deadline,
    } = req.body;

    // Get company ID from authenticated user
    const companyId = req.user._id;

    // Check if company is verified by admin
    const company = await Company.findById(companyId);
    if (!company.isVerifiedByAdmin) {
      return res.status(403).json({
        success: false,
        message:
          "Your company account needs to be verified by an administrator before you can post jobs. Please contact support if you believe this is an error.",
      });
    }

    // Validate that at least one document was uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one document is required",
      });
    }

    // Parse requirements array if it's a string
    const requirementsArray = Array.isArray(requirements)
      ? requirements
      : JSON.parse(requirements);

    // Parse certificate requirements array if it's a string
    let certificateRequirementsArray;
    try {
      certificateRequirementsArray = Array.isArray(certificateRequirements)
        ? certificateRequirements
        : JSON.parse(certificateRequirements);

      // Validate certificate requirements
      if (
        !certificateRequirementsArray.every((req) =>
          ["specialty", "profession", "all"].includes(req)
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid certificate requirements. Must be one of: specialty, profession, all",
        });
      }
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid certificate requirements format",
      });
    }

    // Validate category
    const jobCategory = category || "Other";
    if (!JOB_CATEGORIES.includes(jobCategory)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Must be one of: ${JOB_CATEGORIES.join(", ")}`,
      });
    }

    // Validate custom category if needed
    if (jobCategory === "Other" && (!customCategory || !customCategory.trim())) {
      return res.status(400).json({
        success: false,
        message: "Custom category is required when category is 'Other'",
      });
    }

    // Validate deadline
    if (!deadline) {
      return res.status(400).json({
        success: false,
        message: "Deadline is required",
      });
    }

    const deadlineDate = new Date(deadline);
    if (isNaN(deadlineDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid deadline date format",
      });
    }

    if (deadlineDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Deadline must be in the future",
      });
    }

    // Process uploaded files
    const documents = req.files.map((file) => ({
      documentUrl: file.path,
      documentPublicId: file.filename,
      documentName: file.originalname,
      documentType: file.mimetype,
      uploadedAt: new Date(),
    }));

    // Create the job
    const job = await Job.create({
      companyId,
      title,
      description,
      requirements: requirementsArray,
      location,
      salary,
      category: jobCategory,
      customCategory: jobCategory === "Other" ? customCategory?.trim() : undefined,
      certificateRequirements: certificateRequirementsArray,
      deadline: deadlineDate,
      documents,
    });

    // Generate signed URLs for all documents
    const jobWithUrls = await addSignedUrlsToJobs(job);

    res.status(201).json({
      success: true,
      data: jobWithUrls,
    });
  } catch (error) {
    // If there's an error, cleanup any uploaded files
    if (req.files) {
      await Promise.all(
        req.files.map((file) => cloudinaryUtils.cleanupUpload(file))
      );
    }
    next(error);
  }
};

// Get all jobs (public)
export const getAllJobs = async (req, res, next) => {
  try {
    // Filter by status and category if provided
    const { status, category } = req.query;
    const query = {};

    if (status && ["open", "closed", "filled"].includes(status)) {
      query.status = status;
    } else {
      // By default, only show open jobs
      query.status = "open";
    }

    // Filter by category if provided
    if (category) {
      if (JOB_CATEGORIES.includes(category)) {
        query.category = category;
      } else {
        // If invalid category provided, return empty results with error message
        return res.status(400).json({
          success: false,
          message: `Invalid category. Must be one of: ${JOB_CATEGORIES.join(", ")}`,
        });
      }
    }

    // Filter out expired jobs (deadline has passed)
    query.deadline = { $gt: new Date() };

    // If the request is from a student, filter jobs based on their skills
    if (req.user?.userType === "Student") {
      // Get student's skills
      const student = await Student.findById(req.user._id);
      if (student && student.skills && student.skills.length > 0) {
        // Find jobs where at least one required skill matches the student's skills
        query.requirements = { $in: student.skills };
      }
    }

    const jobs = await Job.find(query)
      .populate("companyId", "name")
      .sort({ createdAt: -1 });

    // Add signed URLs to jobs
    const jobsWithUrls = await addSignedUrlsToJobs(jobs);

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobsWithUrls,
    });
  } catch (error) {
    next(error);
  }
};

// Get all jobs posted by authenticated company
export const getMyJobs = async (req, res, next) => {
  try {
    const companyId = req.user._id;

    // Filter by status and category if provided
    const { status, category } = req.query;
    const query = { companyId };

    if (status && ["open", "closed", "filled"].includes(status)) {
      query.status = status;
    }

    // Filter by category if provided
    if (category) {
      if (JOB_CATEGORIES.includes(category)) {
        query.category = category;
      } else {
        return res.status(400).json({
          success: false,
          message: `Invalid category. Must be one of: ${JOB_CATEGORIES.join(", ")}`,
        });
      }
    }

    // Filter out expired jobs (deadline has passed)
    query.deadline = { $gt: new Date() };

    const jobs = await Job.find(query).sort({ createdAt: -1 });

    // Add signed URLs to jobs
    const jobsWithUrls = await addSignedUrlsToJobs(jobs);

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobsWithUrls,
    });
  } catch (error) {
    next(error);
  }
};

// Get a single job by ID
export const getJobById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const job = await Job.findById(id)
      .populate("companyId", "name email")
      .populate("hiredApplicant", "name");

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Add signed URL to job
    const jobWithUrl = await addSignedUrlsToJobs(job);

    res.status(200).json({
      success: true,
      data: jobWithUrl,
    });
  } catch (error) {
    next(error);
  }
};

// Update a job (company only)
export const updateJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Check if the company owns this job
    if (job.companyId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this job",
      });
    }

    // Prevent changing critical fields
    const forbiddenUpdates = ["companyId", "hiredApplicant"];
    for (const field of forbiddenUpdates) {
      if (updates[field]) {
        delete updates[field];
      }
    }

    // If the job is already filled, don't allow updates
    if (job.status === "filled") {
      return res.status(400).json({
        success: false,
        message: "Cannot update a job that has been filled",
      });
    }

    // Handle certificate requirements if present
    if (updates.certificateRequirements) {
      try {
        const certificateRequirementsArray = Array.isArray(
          updates.certificateRequirements
        )
          ? updates.certificateRequirements
          : JSON.parse(updates.certificateRequirements);

        // Validate certificate requirements
        if (
          !certificateRequirementsArray.every((req) =>
            ["specialty", "profession", "all"].includes(req)
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid certificate requirements. Must be one of: specialty, profession, all",
          });
        }

        updates.certificateRequirements = certificateRequirementsArray;
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Invalid certificate requirements format",
        });
      }
    }

    // Handle requirements if present
    if (updates.requirements) {
      updates.requirements = Array.isArray(updates.requirements)
        ? updates.requirements
        : JSON.parse(updates.requirements);
    }

    // Handle category updates
    if (updates.category !== undefined) {
      if (!JOB_CATEGORIES.includes(updates.category)) {
        return res.status(400).json({
          success: false,
          message: `Invalid category. Must be one of: ${JOB_CATEGORIES.join(", ")}`,
        });
      }

      // If changing to "Other", ensure customCategory is provided
      if (updates.category === "Other" && (!updates.customCategory || !updates.customCategory.trim())) {
        return res.status(400).json({
          success: false,
          message: "Custom category is required when category is 'Other'",
        });
      }

      // If changing from "Other" to predefined category, clear customCategory
      if (updates.category !== "Other") {
        updates.customCategory = undefined;
      }
    }

    // Handle deadline updates
    if (updates.deadline) {
      const deadlineDate = new Date(updates.deadline);
      if (isNaN(deadlineDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid deadline date format",
        });
      }

      if (deadlineDate <= new Date()) {
        return res.status(400).json({
          success: false,
          message: "Deadline must be in the future",
        });
      }

      updates.deadline = deadlineDate;
    }

    // Handle customCategory updates
    if (updates.customCategory !== undefined) {
      const currentCategory = updates.category || job.category;
      if (currentCategory === "Other" && (!updates.customCategory || !updates.customCategory.trim())) {
        return res.status(400).json({
          success: false,
          message: "Custom category is required when category is 'Other'",
        });
      }
    }

    // Handle new document uploads if present
    if (req.files && req.files.length > 0) {
      const newDocuments = req.files.map((file) => ({
        documentUrl: file.path,
        documentPublicId: file.filename,
        documentName: file.originalname,
        documentType: file.mimetype,
        uploadedAt: new Date(),
      }));

      // Always append new documents to existing ones
      updates.documents = [...(job.documents || []), ...newDocuments];
    }

    const updatedJob = await Job.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    // Add signed URLs to updated job
    const jobWithUrls = await addSignedUrlsToJobs(updatedJob);

    res.status(200).json({
      success: true,
      data: jobWithUrls,
    });
  } catch (error) {
    // If there's an error, cleanup any uploaded files
    if (req.files) {
      await Promise.all(
        req.files.map((file) => cloudinaryUtils.cleanupUpload(file))
      );
    }
    next(error);
  }
};

// Update job status (open/closed)
export const closeJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["open", "closed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be 'open' or 'closed'",
      });
    }

    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Check if the company owns this job
    if (job.companyId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this job",
      });
    }

    // If the job is filled, don't allow status changes
    if (job.status === "filled") {
      return res.status(400).json({
        success: false,
        message: "Cannot update a job that has been filled",
      });
    }

    job.status = status;
    await job.save();

    res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

// Get all applications for a job (company only)
export const getJobApplications = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Check if the company owns this job
    if (job.companyId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view applications for this job",
      });
    }

    const applications = await Application.find({ jobId })
      .populate("studentId", "name firstName lastName email wallet roleNumber")
      .populate("academicRecords");

    // Add signed URLs to academic records for each application
    const applicationsWithSignedUrls = await Promise.all(
      applications.map(async (app) => {
        const appObj = app.toObject();
        if (Array.isArray(appObj.academicRecords) && appObj.academicRecords.length > 0) {
          appObj.academicRecords = await Promise.all(
            appObj.academicRecords.map(async (rec) => await addSignedUrlToRecord(rec))
          );
        }
        return appObj;
      })
    );

    res.status(200).json({
      success: true,
      count: applicationsWithSignedUrls.length,
      data: applicationsWithSignedUrls,
    });
  } catch (error) {
    next(error);
  }
};

// Hire an applicant (company only)
export const hireApplicant = async (req, res, next) => {
  try {
    const { jobId, applicationId } = req.params;

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Check if the company owns this job
    if (job.companyId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to hire for this job",
      });
    }

    // Check if job is open
    if (job.status !== "open") {
      return res.status(400).json({
        success: false,
        message: `Cannot hire for a job that is ${job.status}`,
      });
    }

    const application = await Application.findById(applicationId);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // Check if application is for this job
    if (application.jobId.toString() !== jobId) {
      return res.status(400).json({
        success: false,
        message: "Application is not for this job",
      });
    }

    // Update job status and set hired applicant
    job.status = "filled";
    job.hiredApplicant = application.studentId;
    await job.save();

    // Update application status
    application.status = "accepted";
    await application.save();

    // Reject all other applications for this job
    await Application.updateMany(
      { jobId, _id: { $ne: applicationId } },
      { status: "rejected" }
    );

    res.status(200).json({
      success: true,
      data: {
        job,
        application,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Delete a job (company only)
export const deleteJob = async (req, res, next) => {
  try {
    const { id } = req.params;

    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Check if the company owns this job
    if (job.companyId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this job",
      });
    }

    // Check if the job has applications
    const applicationCount = await Application.countDocuments({ jobId: id });

    if (applicationCount > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete a job that has applications. Close the job instead.",
      });
    }

    await job.deleteOne();

    res.status(200).json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Get available job categories
export const getJobCategories = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: JOB_CATEGORIES,
    });
  } catch (error) {
    next(error);
  }
};

// Get all jobs (admin only)
export const getAllJobsAdmin = async (req, res, next) => {
  try {
    const { status, category } = req.query;
    const query = {};

    if (status && ["open", "closed", "filled"].includes(status)) {
      query.status = status;
    }

    // Filter by category if provided
    if (category) {
      if (JOB_CATEGORIES.includes(category)) {
        query.category = category;
      } else {
        return res.status(400).json({
          success: false,
          message: `Invalid category. Must be one of: ${JOB_CATEGORIES.join(", ")}`,
        });
      }
    }

    const jobs = await Job.find(query)
      .populate("companyId", "name email")
      .populate("hiredApplicant", "name wallet roleNumber")
      .sort({ createdAt: -1 });
    // Add signed URLs to jobs
    const jobsWithUrls = await addSignedUrlsToJobs(jobs);
    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobsWithUrls,
    });
  } catch (error) {
    next(error);
  }
};
