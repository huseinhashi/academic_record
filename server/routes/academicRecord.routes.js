import express from "express";
import {
  createAcademicRecord,
  getStudentAcademicRecords,
  getInstitutionAcademicRecords,
  getAcademicRecordById,
  updateAcademicRecord,
  verifyAcademicRecord,
  deleteAcademicRecord,
  getMyAcademicRecords,
  getPendingAcademicRecords,
  checkHashValidity,
  getAllAcademicRecords,
} from "../controllers/academicRecord.controller.js";
import { protect, authorize } from "../middlewares/auth.middleware.js";
import { uploadMiddleware } from "../config/cloudinary.js";

const router = express.Router();

// Base route protection
router.use(protect);

// Create a new academic record (student only)
router.post("/", authorize("Student"), uploadMiddleware, createAcademicRecord);

// Get all my records (student only)
router.get("/my-records", authorize("Student"), getMyAcademicRecords);

// Get all pending records (institution only)
router.get("/pending", authorize("Institution"), getPendingAcademicRecords);

// Get all records for a student
router.get(
  "/student/:studentId",
  authorize("Admin", "Institution", "Student", "Company"),
  getStudentAcademicRecords
);

// Get all records issued by an institution
router.get(
  "/institution/:institutionId?",
  authorize("Admin", "Institution"),
  getInstitutionAcademicRecords
);

// Verify or reject a record (institution only)
router.put("/verify/:id", authorize("Institution"), verifyAcademicRecord);

// Get a single record by ID
router.get(
  "/:id",
  authorize("Admin", "Institution", "Student", "Company"),
  getAcademicRecordById
);

// Update a record (student only - for rejected records)
router.put(
  "/:id",
  authorize("Student"),
  uploadMiddleware,
  updateAcademicRecord
);

// Check record validity by hash (public)
router.get("/check-hash/:hash", checkHashValidity);

// Delete a record (admin or student if pending)
router.delete("/:id", authorize("Admin", "Student"), deleteAcademicRecord);

// Get all academic records (admin only)
router.get("/admin/all", authorize("Admin"), getAllAcademicRecords);

export default router;
