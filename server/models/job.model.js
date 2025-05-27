import mongoose from "mongoose";

const jobDocumentSchema = new mongoose.Schema({
  documentUrl: {
    type: String,
    required: true,
  },
  documentPublicId: {
    type: String,
    required: true,
  },
  documentName: {
    type: String,
    required: true,
  },
  documentType: {
    type: String,
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

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
    documents: {
      type: [jobDocumentSchema],
      validate: {
        validator: function (docs) {
          return docs.length > 0; // At least one document is required
        },
        message: "At least one document is required",
      },
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
