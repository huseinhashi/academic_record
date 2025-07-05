import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema(
  {
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
    },
    interviewStage: {
      type: String,
      enum: ["phone_screen", "technical", "onsite", "final"],
      required: true,
    },
    interviewDate: {
      type: Date,
      required: true,
    },
    interviewerName: {
      type: String,
      required: true,
    },
    feedback: {
      type: String,
      default: "",
    },
    result: {
      type: String,
      enum: ["pass", "fail", "pending"],
      default: "pending",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
interviewSchema.index({ applicationId: 1, interviewStage: 1 });
interviewSchema.index({ result: 1 });

const Interview = mongoose.model("Interview", interviewSchema);

export default Interview;
