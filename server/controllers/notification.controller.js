import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import { asyncHandler } from "../middlewares/async.middleware.js";
import { ErrorResponse } from "../utils/errorResponse.js";

// @desc    Get all notifications for a user
// @route   GET /api/notifications
// @access  Private
export const getNotifications = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  const query = { recipient: req.user._id };

  // Filter by read status if provided
  if (req.query.isRead !== undefined) {
    query.isRead = req.query.isRead === "true";
  }

  // Filter by type if provided
  if (req.query.type) {
    query.type = req.query.type;
  }

  const total = await Notification.countDocuments(query);
  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .skip(startIndex)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: notifications.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    data: notifications,
  });
});

// @desc    Get unread notification count
// @route   GET /api/notifications/unread/count
// @access  Private
export const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({
    recipient: req.user._id,
    isRead: false,
  });

  res.status(200).json({
    success: true,
    count,
  });
});

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    recipient: req.user._id,
  });

  if (!notification) {
    throw new ErrorResponse("Notification not found", 404);
  }

  notification.isRead = true;
  await notification.save();

  res.status(200).json({
    success: true,
    data: notification,
  });
});

// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/read-all
// @access  Private
export const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, isRead: false },
    { $set: { isRead: true } }
  );

  res.status(200).json({
    success: true,
    message: "All notifications marked as read",
  });
});

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    recipient: req.user._id,
  });

  if (!notification) {
    throw new ErrorResponse("Notification not found", 404);
  }

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Delete all notifications
// @route   DELETE /api/notifications
// @access  Private
export const deleteAllNotifications = asyncHandler(async (req, res) => {
  await Notification.deleteMany({ recipient: req.user._id });

  res.status(200).json({
    success: true,
    message: "All notifications deleted",
  });
});

// @desc    Create a notification (admin only)
// @route   POST /api/notifications
// @access  Private/Admin
export const createNotification = asyncHandler(async (req, res) => {
  const { recipientId, type, title, message, data, priority } = req.body;

  // Verify recipient exists
  const recipient = await User.findById(recipientId);
  if (!recipient) {
    throw new ErrorResponse("Recipient not found", 404);
  }

  const notification = await Notification.create({
    recipient: recipientId,
    type,
    title,
    message,
    data,
    priority,
  });

  res.status(201).json({
    success: true,
    data: notification,
  });
});

// @desc    Create system-wide notification (admin only)
// @route   POST /api/notifications/system
// @access  Private/Admin
export const createSystemNotification = asyncHandler(async (req, res) => {
  const { type, title, message, data, priority } = req.body;

  // Get all users
  const users = await User.find({}, "_id");

  // Create notifications for all users
  const notifications = await Promise.all(
    users.map((user) =>
      Notification.create({
        recipient: user._id,
        type,
        title,
        message,
        data,
        priority,
      })
    )
  );

  res.status(201).json({
    success: true,
    count: notifications.length,
    message: "System notification created for all users",
  });
});
