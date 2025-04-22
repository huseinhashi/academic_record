import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    coverLetter: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    academicRecords: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AcademicRecord",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure a student can only apply once to a job
applicationSchema.index({ jobId: 1, studentId: 1 }, { unique: true });

const Application = mongoose.model("Application", applicationSchema);

export default Application;
