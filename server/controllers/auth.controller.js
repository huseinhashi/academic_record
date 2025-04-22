import jwt from "jsonwebtoken";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/env.js";
import User from "../models/user.model.js";
import Admin from "../models/admin.model.js";
import Student from "../models/student.model.js";
import Institution from "../models/institution.model.js";
import Company from "../models/company.model.js";

// Create new admin (only callable by other admins)
export const createAdmin = async (req, res, next) => {
  try {
    const { wallet, name } = req.body;

    // Check if wallet already exists using case-insensitive search for wallet
    const existingWallet = await User.findByWallet(wallet);

    if (existingWallet) {
      return res.status(400).json({
        success: false,
        message: "User with this wallet already exists",
      });
    }

    // Create admin
    const admin = await Admin.create({
      wallet,
      name,
      authMethod: "wallet",
      isVerified: true, // Admins are auto-verified
    });

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: admin._id,
          name: admin.name,
          wallet: admin.wallet,
          userType: admin.userType,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Register new student (public endpoint)
export const registerStudent = async (req, res, next) => {
  try {
    const { wallet, name, institutionId, roleNumber } = req.body;

    // Check if wallet already exists using case-insensitive search for wallet
    const existingWallet = await User.findByWallet(wallet);

    if (existingWallet) {
      return res.status(400).json({
        success: false,
        message: "User with this wallet already exists",
      });
    }

    // Check if institution exists
    const institution = await Institution.findById(institutionId);
    if (!institution) {
      return res.status(400).json({
        success: false,
        message: "Institution not found",
      });
    }

    // Create student
    const student = await Student.create({
      wallet,
      name,
      roleNumber,
      institutionId,
      authMethod: "wallet",
      isVerifiedByInstitution: false,
    });

    const token = jwt.sign(
      { id: student._id, userType: student.userType },
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRES_IN,
      }
    );

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: student._id,
          name: student.name,
          wallet: student.wallet,
          roleNumber: student.roleNumber,
          userType: student.userType,
          institutionId: student.institutionId,
          isVerifiedByInstitution: student.isVerifiedByInstitution,
          authMethod: student.authMethod,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Create new institution (only callable by admin)
export const createInstitution = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, and password",
      });
    }

    // Check if email is already registered
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "Institution with this email already exists",
      });
    }

    // Create institution with email in the base User schema
    const institution = await Institution.create({
      name,
      email, // This will go to the User model
      password, // This will go to the User model
      authMethod: "password",
      isVerifiedByAdmin: false,
      wallet: null, // Explicitly set wallet to null for password auth
    });

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: institution._id,
          name: institution.name,
          email: institution.email,
          userType: institution.userType,
          isVerifiedByAdmin: institution.isVerifiedByAdmin,
          authMethod: institution.authMethod,
        },
      },
    });
  } catch (error) {
    console.error("Institution creation error:", error);

    // Handle MongoDB duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "An institution with this email already exists",
      });
    }

    next(error);
  }
};

// Create new company (only callable by admin)
export const createCompany = async (req, res, next) => {
  try {
    const { name, email, password, address, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, and password",
      });
    }

    // Check if email is already registered
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "Company with this email already exists",
      });
    }

    // Create company with email in the base User schema
    const company = await Company.create({
      name,
      email, // This will go to the User model
      password, // This will go to the User model
      address: address || "",
      phone: phone || "",
      authMethod: "password",
      isVerifiedByAdmin: false,
      wallet: null, // Explicitly set wallet to null for password auth
    });

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: company._id,
          name: company.name,
          email: company.email,
          address: company.address,
          phone: company.phone,
          userType: company.userType,
          isVerifiedByAdmin: company.isVerifiedByAdmin,
          authMethod: company.authMethod,
        },
      },
    });
  } catch (error) {
    console.error("Company creation error:", error);

    // Handle MongoDB duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "A company with this email already exists",
      });
    }

    next(error);
  }
};

// Login user with wallet
export const loginWithWallet = async (req, res, next) => {
  try {
    const { wallet } = req.body;

    // Use the custom findByWallet method for case-insensitive matching
    const user = await User.findByWallet(wallet);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user is wallet-based
    if (user.authMethod !== "wallet") {
      return res.status(400).json({
        success: false,
        message: "This account doesn't use wallet authentication",
      });
    }

    // Only allow students and admins to login with wallet
    if (user.userType !== "Student" && user.userType !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "Only students and admins can login with wallet",
      });
    }

    const token = jwt.sign(
      { id: user._id, userType: user.userType },
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRES_IN,
      }
    );

    // Determine which fields to return based on user type
    let userData = {
      id: user._id,
      wallet: user.wallet,
      userType: user.userType,
      isVerified: user.isVerified,
      authMethod: user.authMethod,
    };

    // Add user type specific fields
    if (user.userType === "Admin") {
      userData.name = user.name;
    } else if (user.userType === "Student") {
      userData.name = user.name;
      userData.roleNumber = user.roleNumber;
      userData.institutionId = user.institutionId;
      userData.isVerifiedByInstitution = user.isVerifiedByInstitution;
    }

    res.status(200).json({
      success: true,
      data: {
        user: userData,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Login user with email and password
export const loginWithPassword = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Find user by email and include the password field for verification
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if user is password-based
    if (user.authMethod !== "password") {
      return res.status(400).json({
        success: false,
        message: "This account doesn't use password authentication",
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      { id: user._id, userType: user.userType },
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRES_IN,
      }
    );

    // Determine which fields to return based on user type
    let userData = {
      id: user._id,
      email: user.email,
      userType: user.userType,
      isVerified: user.isVerified,
      authMethod: user.authMethod,
    };

    // Add user type specific fields
    if (user.userType === "Institution") {
      userData.name = user.name;
      userData.isVerifiedByAdmin = user.isVerifiedByAdmin;
    } else if (user.userType === "Company") {
      userData.name = user.name;
      userData.address = user.address;
      userData.phone = user.phone;
      userData.isVerifiedByAdmin = user.isVerifiedByAdmin;
    }

    res.status(200).json({
      success: true,
      data: {
        user: userData,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};
