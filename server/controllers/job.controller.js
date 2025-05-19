import Job from "../models/job.model.js";
import Application from "../models/application.model.js";
import Company from "../models/company.model.js";
import { cloudinaryUtils } from "../config/cloudinary.js";
import Student from "../models/student.model.js";

// Add this helper function at the top of the file, after the imports
const addSignedUrlsToJobs = async (jobs) => {
  if (!jobs) return jobs;

  if (Array.isArray(jobs)) {
    // Handle array of jobs
    const jobsWithUrls = await Promise.all(
      jobs.map(async (job) => {
        const jobObj = job.toObject ? job.toObject() : job;
        if (jobObj.documentPublicId) {
          jobObj.signedUrl = await cloudinaryUtils.generateSignedUrl(
            jobObj.documentPublicId,
            3600 // URL valid for 1 hour
          );
        }
        return jobObj;
      })
    );
    return jobsWithUrls;
  } else {
    // Handle single job
    const jobObj = jobs.toObject ? jobs.toObject() : jobs;
    if (jobObj.documentPublicId) {
      jobObj.signedUrl = await cloudinaryUtils.generateSignedUrl(
        jobObj.documentPublicId,
        3600 // URL valid for 1 hour
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

    // Create the job
    const job = await Job.create({
      companyId,
      title,
      description,
      requirements: requirementsArray,
      location,
      salary,
      certificateRequirements: certificateRequirementsArray,
      documentUrl: req.file?.path,
      documentPublicId: req.file?.filename,
    });

    // Generate a signed URL for the document if it exists
    let signedUrl = null;
    if (job.documentPublicId) {
      signedUrl = await cloudinaryUtils.generateSignedUrl(
        job.documentPublicId,
        3600
      );
    }

    res.status(201).json({
      success: true,
      data: {
        ...job.toObject(),
        signedUrl,
      },
    });
  } catch (error) {
    // If there's an error, cleanup any uploaded file
    if (req.file) {
      await cloudinaryUtils.cleanupUpload(req.file);
    }
    next(error);
  }
};

// Get all jobs (public)
export const getAllJobs = async (req, res, next) => {
  try {
    // Filter by status if provided
    const { status } = req.query;
    const query = {};

    if (status && ["open", "closed", "filled"].includes(status)) {
      query.status = status;
    } else {
      // By default, only show open jobs
      query.status = "open";
    }

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

    // Filter by status if provided
    const { status } = req.query;
    const query = { companyId };

    if (status && ["open", "closed", "filled"].includes(status)) {
      query.status = status;
    }

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

    const updatedJob = await Job.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    // Add signed URL to updated job
    const jobWithUrl = await addSignedUrlsToJobs(updatedJob);

    res.status(200).json({
      success: true,
      data: jobWithUrl,
    });
  } catch (error) {
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
      .populate("studentId", "name wallet roleNumber")
      .populate("academicRecords");

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
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

// Get all jobs (admin only)
export const getAllJobsAdmin = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = {};

    if (status && ["open", "closed", "filled"].includes(status)) {
      query.status = status;
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
