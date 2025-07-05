import express from "express";
import {
  createInterview,
  getCompanyInterviews,
  getApplicationInterviews,
  updateInterview,
  deleteInterview,
  getInterview,
} from "../controllers/interview.controller.js";
import { protect, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

// All routes require authentication and company authorization
router.use(protect);
router.use(authorize("Company"));

// @route   POST /api/interviews
// @desc    Create a new interview
router.post("/", createInterview);

// @route   GET /api/interviews/company
// @desc    Get all interviews for a company
router.get("/company", getCompanyInterviews);

// @route   GET /api/interviews/application/:applicationId
// @desc    Get interviews for a specific application
router.get("/application/:applicationId", getApplicationInterviews);

// @route   GET /api/interviews/:id
// @desc    Get interview by ID
router.get("/:id", getInterview);

// @route   PUT /api/interviews/:id
// @desc    Update interview
router.put("/:id", updateInterview);

// @route   DELETE /api/interviews/:id
// @desc    Delete interview
router.delete("/:id", deleteInterview);

export default router;
