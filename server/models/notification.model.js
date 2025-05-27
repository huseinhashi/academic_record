import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        // Account related
        "ACCOUNT_APPROVED",
        "ACCOUNT_REJECTED",
        "ACCOUNT_PENDING",
        // Academic Records
        "RECORD_VERIFIED",
        "RECORD_REJECTED",
        "RECORD_PENDING",
        // Job related
        "JOB_APPLICATION_RECEIVED",
        "JOB_APPLICATION_APPROVED",
        "JOB_APPLICATION_REJECTED",
        "JOB_HIRED",
        // Admin notifications
        "NEW_USER_REGISTERED",
        "NEW_COMPANY_REGISTERED",
        "NEW_INSTITUTION_REGISTERED",
        // System notifications
        "SYSTEM_UPDATE",
        "MAINTENANCE_NOTICE",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    expiresAt: {
      type: Date,
      default: () => new Date(+new Date() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ isRead: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Static method to create common notifications
notificationSchema.statics.createAccountApproved = async function (
  userId,
  userType
) {
  return this.create({
    recipient: userId,
    type: "ACCOUNT_APPROVED",
    title: "Account Approved",
    message: `Your ${userType.toLowerCase()} account has been approved. You can now access all features.`,
    priority: "high",
  });
};

notificationSchema.statics.createAccountRejected = async function (
  userId,
  userType,
  reason
) {
  return this.create({
    recipient: userId,
    type: "ACCOUNT_REJECTED",
    title: "Account Rejected",
    message: `Your ${userType.toLowerCase()} account has been rejected. Reason: ${reason}`,
    priority: "high",
  });
};

notificationSchema.statics.createRecordVerified = async function (
  userId,
  recordId
) {
  return this.create({
    recipient: userId,
    type: "RECORD_VERIFIED",
    title: "Academic Record Verified",
    message:
      "Your academic record has been verified and is now available for sharing.",
    data: { recordId },
    priority: "high",
  });
};

notificationSchema.statics.createJobApplicationReceived = async function (
  companyId,
  applicationId
) {
  return this.create({
    recipient: companyId,
    type: "JOB_APPLICATION_RECEIVED",
    title: "New Job Application",
    message: "You have received a new job application.",
    data: { applicationId },
    priority: "medium",
  });
};

notificationSchema.statics.createNewUserRegistered = async function (
  adminId,
  userType,
  userId
) {
  return this.create({
    recipient: adminId,
    type: "NEW_USER_REGISTERED",
    title: "New User Registration",
    message: `A new ${userType.toLowerCase()} has registered and requires approval.`,
    data: { userId },
    priority: "high",
  });
};

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
