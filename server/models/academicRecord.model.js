import mongoose from "mongoose";

const academicRecordSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
    },
    recordType: {
      type: String,
      enum: ["certificate", "degree", "course", "transcript"],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    filePublicId: {
      type: String,
      required: true,
    },
    hash: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    rejectionReason: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Add a compound index on hash and status to ensure uniqueness only for verified records
academicRecordSchema.index(
  { hash: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "verified" },
  }
);

const AcademicRecord = mongoose.model("AcademicRecord", academicRecordSchema);

export default AcademicRecord;
