import express from "express";
import { protect, authorize } from "../middlewares/auth.middleware.js";
import { generateReport } from "../controllers/reports.controller.js";

const router = express.Router();

// Get report data
router.get("/:type", protect, authorize("Admin"), generateReport);

export default router;
