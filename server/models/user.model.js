import mongoose from "mongoose";
import bcrypt from "bcrypt";

const options = { discriminatorKey: "userType", timestamps: true };

// Base user schema with common fields
const userSchema = new mongoose.Schema(
  {
    wallet: {
      type: String,
      set: (value) => value, // Preserve case sensitivity
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      select: false, // Don't return password by default
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    authMethod: {
      type: String,
      enum: ["wallet", "password"],
      required: true,
      default: "wallet",
    },
  },
  options
);

// Using compound index for emails or wallets to avoid the duplicate null wallet issue
userSchema.index(
  {
    wallet: 1,
    authMethod: 1,
  },
  {
    unique: true,
    partialFilterExpression: { authMethod: "wallet" }, // Only apply uniqueness to wallet-based accounts
    collation: { locale: "en", strength: 2 }, // Case-insensitive index
  }
);

// Create a unique index on email (for password-based users)
userSchema.index(
  {
    email: 1,
    authMethod: 1,
  },
  {
    unique: true,
    partialFilterExpression: { authMethod: "password" }, // Only apply uniqueness to password-based accounts
  }
);

// Custom find by wallet that's case-insensitive
userSchema.statics.findByWallet = function (wallet) {
  return this.findOne({ wallet: new RegExp(`^${wallet}$`, "i") });
};

// Custom find by email
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Password comparison method
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

// Pre-save hook to hash password
userSchema.pre("save", async function (next) {
  const user = this;
  if (!user.isModified("password") || !user.password) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.model("User", userSchema);

export default User;
