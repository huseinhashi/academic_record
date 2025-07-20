import express from "express";
import {
  createAdmin,
  registerStudent,
  registerInstitution,
  registerCompany,
  createInstitution,
  createCompany,
  loginWithWallet,
} from "../controllers/auth.controller.js";
import { protect, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public routes
router.post("/register/student", registerStudent);
router.post("/register/institution", registerInstitution);
router.post("/register/company", registerCompany);
router.post("/login/wallet", loginWithWallet);

// Protected routes - admin only
router.post("/admin/create", protect, authorize("Admin"), createAdmin);
router.post(
  "/institution/create",
  protect,
  authorize("Admin"),
  createInstitution
);
router.post("/company/create", protect, authorize("Admin"), createCompany);

export default router;
