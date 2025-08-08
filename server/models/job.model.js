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

// Define predefined job categories
const JOB_CATEGORIES = [
  "Software Development",
  "Data Science & Analytics",
  "Engineering & Manufacturing",
  "Healthcare & Medical",
  "Finance & Banking",
  "Marketing & Sales",
  "Education & Training",
  "Design & Creative",
  "Human Resources",
  "Operations & Management",
  "Other"
];

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
    category: {
      type: String,
      enum: JOB_CATEGORIES,
      default: "Other",
      required: true,
    },
    customCategory: {
      type: String,
      // Only required if category is "Other"
      validate: {
        validator: function(value) {
          // If category is "Other", customCategory is required
          if (this.category === "Other") {
            return value && value.trim().length > 0;
          }
          return true;
        },
        message: "Custom category is required when category is 'Other'"
      }
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

// Export both the model and the categories
export default Job;
export { JOB_CATEGORIES };
