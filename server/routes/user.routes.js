import express from "express";
import {
  // Admin routes
  getAllAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,

  // Student routes
  getAllStudents,
  getStudentById,
  updateStudent,
  verifyStudent,
  deleteStudent,

  // Institution routes
  getAllInstitutions,
  getInstitutionById,
  updateInstitution,
  verifyInstitution,
  deleteInstitution,
  changeInstitutionPassword,

  // Company routes
  getAllCompanies,
  getCompanyById,
  updateCompany,
  verifyCompany,
  deleteCompany,
  changeCompanyPassword,

  // Public routes
  getPublicInstitutions,
} from "../controllers/user.controller.js";
import { protect, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public routes (no authentication required)
router.get("/public/institutions", getPublicInstitutions);

// Protected routes - all require authentication
router.use(protect);

// Admin routes - admin access only
router.get("/admins", authorize("Admin"), getAllAdmins);
router.get("/admins/:id", authorize("Admin"), getAdminById);
router.put("/admins/:id", authorize("Admin"), updateAdmin);
router.delete("/admins/:id", authorize("Admin"), deleteAdmin);

// Student routes
router.get("/students", authorize("Admin", "Institution"), getAllStudents);
router.get("/students/:id", authorize("Admin", "Institution"), getStudentById);
router.put("/students/:id", authorize("Admin", "Institution"), updateStudent);
router.patch("/students/:id/verify", authorize("Institution"), verifyStudent);
router.delete("/students/:id", authorize("Admin"), deleteStudent);

// Institution routes
router.get("/institutions", authorize("Admin"), getAllInstitutions);
router.get("/institutions/:id", authorize("Admin"), getInstitutionById);
router.put("/institutions/:id", authorize("Admin"), updateInstitution);
router.patch(
  "/institutions/:id/password",
  authorize("Admin"),
  changeInstitutionPassword
);
router.patch("/institutions/:id/verify", authorize("Admin"), verifyInstitution);
router.delete("/institutions/:id", authorize("Admin"), deleteInstitution);

// Company routes
router.get("/companies", authorize("Admin"), getAllCompanies);
router.get("/companies/:id", authorize("Admin"), getCompanyById);
router.put("/companies/:id", authorize("Admin"), updateCompany);
router.patch(
  "/companies/:id/password",
  authorize("Admin"),
  changeCompanyPassword
);
router.patch("/companies/:id/verify", authorize("Admin"), verifyCompany);
router.delete("/companies/:id", authorize("Admin"), deleteCompany);

export default router;
