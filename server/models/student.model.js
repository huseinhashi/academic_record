import mongoose from "mongoose";
import User from "./user.model.js";

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    roleNumber: {
      type: String,
      required: true,
    },
    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
    },
    skills: [
      {
        type: String,
        required: true,
      },
    ],
    isVerifiedByInstitution: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const Student = User.discriminator("Student", studentSchema);

export default Student;
