import express from "express";
import {
  createJob,
  getAllJobs,
  getMyJobs,
  getJobById,
  updateJob,
  closeJob,
  getJobApplications,
  hireApplicant,
  deleteJob,
} from "../controllers/job.controller.js";
import { protect, authorize } from "../middlewares/auth.middleware.js";
import { uploadMiddleware } from "../config/cloudinary.js";
import Job from "../models/job.model.js";
import { cloudinaryUtils } from "../config/cloudinary.js";

const router = express.Router();

// Protected routes
router.use(protect);
// Public routes
router.get("/", getAllJobs);
// Company routes
router.post("/", authorize("Company"), uploadMiddleware, createJob);
router.get("/my-jobs", authorize("Company"), getMyJobs);
router.put("/:id/status", authorize("Company"), closeJob);
router.get("/:jobId/applications", authorize("Company"), getJobApplications);
router.put("/:jobId/hire/:applicationId", authorize("Company"), hireApplicant);
router.put("/:id", authorize("Company"), uploadMiddleware, updateJob);
router.delete("/:id", authorize("Company"), deleteJob);

// Get specific job by ID - must come after other specific routes
router.get("/:id", getJobById);

// Get all jobs (admin only)
router.get("/admin/all", authorize("Admin"), async (req, res, next) => {
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

    // Add signed URLs to jobs with documents
    const jobsWithUrls = await Promise.all(
      jobs.map(async (job) => {
        const jobObj = job.toObject();
        if (jobObj.documentPublicId) {
          jobObj.signedUrl = await cloudinaryUtils.generateSignedUrl(
            jobObj.documentPublicId,
            3600
          );
        }
        return jobObj;
      })
    );

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobsWithUrls,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
