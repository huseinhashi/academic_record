import express from "express";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  createNotification,
  createSystemNotification,
} from "../controllers/notification.controller.js";
import { protect, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Protect all routes
router.use(protect);

// Get notifications and unread count
router.get("/", getNotifications);
router.get("/unread/count", getUnreadCount);

// Mark notifications as read
router.patch("/:id/read", markAsRead);
router.patch("/read-all", markAllAsRead);

// Delete notifications
router.delete("/:id", deleteNotification);
router.delete("/", deleteAllNotifications);

// Admin only routes
router.post("/", authorize("Admin"), createNotification);
router.post("/system", authorize("Admin"), createSystemNotification);

export default router;
