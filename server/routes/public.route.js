import express from "express";
import {
  // Institution routes
  getAllInstitutions,
} from "../controllers/user.controller.js";

const router = express.Router();

// Student routes
router.get("/institutions", getAllInstitutions);

export default router;
