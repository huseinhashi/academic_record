import express from "express";
import {
  applyToJob,
  getMyApplications,
  getApplicationById,
  withdrawApplication,
  getHiredStudents,
  getCompanyApplications,
} from "../controllers/application.controller.js";
import { protect, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

// All routes are protected
router.use(protect);

// Student routes
router.post("/job/:jobId", authorize("Student"), applyToJob);
router.get("/my-applications", authorize("Student"), getMyApplications);

// Company routes
router.get("/hired-students", authorize("Company"), getHiredStudents);
router.get(
  "/company-applications",
  authorize("Company"),
  getCompanyApplications
);

// Routes with IDs - must come after specific paths
router.delete("/:id", authorize("Student"), withdrawApplication);
router.get(
  "/:id",
  authorize("Student", "Company", "Admin"),
  getApplicationById
);

export default router;
