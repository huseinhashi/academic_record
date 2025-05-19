import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    requirements: {
      type: [String],
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    salary: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["open", "closed", "filled"],
      default: "open",
    },
    documentUrl: {
      type: String,
    },
    documentPublicId: {
      type: String,
    },
    certificateRequirements: {
      type: [String],
      enum: ["specialty", "profession", "all"],
      default: ["all"],
    },
    hiredApplicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Job = mongoose.model("Job", jobSchema);

export default Job;
