import jwt from "jsonwebtoken";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/env.js";
import User from "../models/user.model.js";
import Admin from "../models/admin.model.js";
import Student from "../models/student.model.js";
import Institution from "../models/institution.model.js";
import Company from "../models/company.model.js";
import Notification from "../models/notification.model.js";

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

// Register new student with wallet (public endpoint)
export const registerStudent = async (req, res, next) => {
  try {
    const { name, wallet, institutionId, roleNumber, skills } = req.body;

    if (!name || !wallet || !institutionId || !roleNumber) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Check if wallet is already registered
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
      name,
      wallet,
      roleNumber,
      institutionId,
      skills: skills || [],
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
          skills: student.skills,
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

// Register new institution with wallet (public endpoint)
export const registerInstitution = async (req, res, next) => {
  try {
    const { name, wallet, website, location } = req.body;

    if (!name || !wallet || !website || !location) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, wallet, website, and location",
      });
    }

    // Check if wallet is already registered
    const existingWallet = await User.findByWallet(wallet);
    if (existingWallet) {
      return res.status(400).json({
        success: false,
        message: "User with this wallet already exists",
      });
    }

    // Create institution
    const institution = await Institution.create({
      name,
      wallet,
      website,
      location,
      authMethod: "wallet",
      isVerifiedByAdmin: false,
    });

    // Get all admin users to notify them
    const admins = await Admin.find({}, "_id");

    // Create notifications for all admins
    await Promise.all(
      admins.map((admin) =>
        Notification.createNewUserRegistered(
          admin._id,
          "Institution",
          institution._id
        )
      )
    );

    const token = jwt.sign(
      { id: institution._id, userType: institution.userType },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: institution._id,
          name: institution.name,
          wallet: institution.wallet,
          website: institution.website,
          location: institution.location,
          userType: institution.userType,
          isVerifiedByAdmin: institution.isVerifiedByAdmin,
          authMethod: institution.authMethod,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Register new company with wallet (public endpoint)
export const registerCompany = async (req, res, next) => {
  try {
    const { name, wallet, address, phone, website } = req.body;

    if (!name || !wallet || !website || !address || !phone) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, wallet, website, address, and phone",
      });
    }

    // Check if wallet is already registered
    const existingWallet = await User.findByWallet(wallet);
    if (existingWallet) {
      return res.status(400).json({
        success: false,
        message: "User with this wallet already exists",
      });
    }

    // Create company
    const company = await Company.create({
      name,
      wallet,
      address,
      phone,
      website,
      authMethod: "wallet",
      isVerifiedByAdmin: false,
    });

    // Get all admin users to notify them
    const admins = await Admin.find({}, "_id");

    // Create notifications for all admins
    await Promise.all(
      admins.map((admin) =>
        Notification.createNewUserRegistered(admin._id, "Company", company._id)
      )
    );

    const token = jwt.sign(
      { id: company._id, userType: company.userType },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: company._id,
          name: company.name,
          wallet: company.wallet,
          address: company.address,
          phone: company.phone,
          website: company.website,
          userType: company.userType,
          isVerifiedByAdmin: company.isVerifiedByAdmin,
          authMethod: company.authMethod,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Create new institution (admin only - for wallet auth)
export const createInstitution = async (req, res, next) => {
  try {
    const { name, wallet, website, location } = req.body;

    if (!name || !wallet || !website || !location) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, wallet address, website, and location",
      });
    }

    // Validate wallet address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid Ethereum wallet address",
      });
    }

    // Check if wallet is already registered
    const existingWallet = await User.findByWallet(wallet);
    if (existingWallet) {
      return res.status(400).json({
        success: false,
        message: "Institution with this wallet address already exists",
      });
    }

    // Create institution with wallet authentication
    const institution = await Institution.create({
      name,
      wallet,
      website,
      location,
      authMethod: "wallet",
      isVerifiedByAdmin: false,
    });

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: institution._id,
          name: institution.name,
          wallet: institution.wallet,
          website: institution.website,
          location: institution.location,
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
        message: "An institution with this wallet address already exists",
      });
    }

    next(error);
  }
};

// Create new company (admin only - for wallet auth)
export const createCompany = async (req, res, next) => {
  try {
    const { name, wallet, address, phone, website } = req.body;

    if (!name || !wallet || !website || !address || !phone) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide name, wallet address, website, address, and phone",
      });
    }

    // Validate wallet address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid Ethereum wallet address",
      });
    }

    // Check if wallet is already registered
    const existingWallet = await User.findByWallet(wallet);
    if (existingWallet) {
      return res.status(400).json({
        success: false,
        message: "Company with this wallet address already exists",
      });
    }

    // Create company with wallet authentication
    const company = await Company.create({
      name,
      wallet,
      address,
      phone,
      website,
      authMethod: "wallet",
      isVerifiedByAdmin: false,
    });

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: company._id,
          name: company.name,
          wallet: company.wallet,
          address: company.address,
          phone: company.phone,
          website: company.website,
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
        message: "A company with this wallet address already exists",
      });
    }

    next(error);
  }
};

// Login user with wallet (all user types)
export const loginWithWallet = async (req, res, next) => {
  try {
    const { wallet } = req.body;

    if (!wallet) {
      return res.status(400).json({
        success: false,
        message: "Wallet address is required",
      });
    }

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

    const token = jwt.sign(
      { id: user._id, userType: user.userType },
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRES_IN,
      }
    );

    // Return user data based on type
    let userData = {
      id: user._id,
      name: user.name,
      wallet: user.wallet,
      userType: user.userType,
      isVerified: user.isVerified,
      authMethod: user.authMethod,
    };

    // Add user type specific fields
    if (user.userType === "Student") {
      userData.roleNumber = user.roleNumber;
      userData.institutionId = user.institutionId;
      userData.skills = user.skills;
      userData.isVerifiedByInstitution = user.isVerifiedByInstitution;
    } else if (user.userType === "Institution") {
      userData.website = user.website;
      userData.location = user.location;
      userData.isVerifiedByAdmin = user.isVerifiedByAdmin;
    } else if (user.userType === "Company") {
      userData.address = user.address;
      userData.phone = user.phone;
      userData.website = user.website;
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
