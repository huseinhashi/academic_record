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

const router = express.Router();

// Public routes
router.get("/", getAllJobs);

// Protected routes
router.use(protect);

// Company routes
router.post("/", authorize("Company"), createJob);
router.get("/my-jobs", authorize("Company"), getMyJobs);
router.put("/:id/status", authorize("Company"), closeJob);
router.get("/:jobId/applications", authorize("Company"), getJobApplications);
router.put("/:jobId/hire/:applicationId", authorize("Company"), hireApplicant);
router.put("/:id", authorize("Company"), updateJob);
router.delete("/:id", authorize("Company"), deleteJob);

// Get specific job by ID - must come after other specific routes
router.get("/:id", getJobById);

export default router;
