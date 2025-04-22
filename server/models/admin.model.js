import mongoose from "mongoose";
import User from "./user.model.js";

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const Admin = User.discriminator("Admin", adminSchema);

export default Admin;
