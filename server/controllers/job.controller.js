import Job from "../models/job.model.js";
import Application from "../models/application.model.js";
import Company from "../models/company.model.js";

// Create a new job posting (company only)
export const createJob = async (req, res, next) => {
  try {
    const { title, description, requirements, location, salary } = req.body;

    // Get company ID from authenticated user
    const companyId = req.user._id;

    // Create the job
    const job = await Job.create({
      companyId,
      title,
      description,
      requirements,
      location,
      salary,
    });

    res.status(201).json({
      success: true,
      data: job,
    });
  } catch (error) {
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

    const jobs = await Job.find(query)
      .populate("companyId", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs,
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

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs,
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

    res.status(200).json({
      success: true,
      data: job,
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

    const updatedJob = await Job.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: updatedJob,
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
