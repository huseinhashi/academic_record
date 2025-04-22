import mongoose from "mongoose";
import User from "./user.model.js";

const institutionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    isVerifiedByAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const Institution = User.discriminator("Institution", institutionSchema);

export default Institution;
