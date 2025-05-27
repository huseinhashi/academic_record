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
  getAllJobsAdmin,
} from "../controllers/job.controller.js";
import { protect, authorize } from "../middlewares/auth.middleware.js";
import { uploadMiddleware } from "../config/cloudinary.js";

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
router.get("/admin/all", authorize("Admin"), getAllJobsAdmin);

export default router;
