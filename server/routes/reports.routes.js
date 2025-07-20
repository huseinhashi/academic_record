import express from "express";
import { protect, authorize } from "../middlewares/auth.middleware.js";
import {
  generateReport,
  generateCompanyReport,
  generateCompanySummary,
  generateInstitutionReport,
  generateInstitutionSummary,
  generateStudentReport,
  generateStudentSummary,
} from "../controllers/reports.controller.js";

const router = express.Router();

// Admin reports (existing)
router.get("/:type", protect, authorize("Admin"), generateReport);

// Company reports
router.get(
  "/company/:type",
  protect,
  authorize("Company"),
  generateCompanyReport
);
router.get(
  "/company/summary",
  protect,
  authorize("Company"),
  generateCompanySummary
);

// Institution reports
router.get(
  "/institution/:type",
  protect,
  authorize("Institution"),
  generateInstitutionReport
);
router.get(
  "/institution/summary",
  protect,
  authorize("Institution"),
  generateInstitutionSummary
);

// Student reports
router.get(
  "/student/:type",
  protect,
  authorize("Student"),
  generateStudentReport
);
router.get(
  "/student/summary",
  protect,
  authorize("Student"),
  generateStudentSummary
);

export default router;
