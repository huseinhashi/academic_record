import mongoose from "mongoose";
import User from "./user.model.js";

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    phone: {
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

const Company = User.discriminator("Company", companySchema);

export default Company;
