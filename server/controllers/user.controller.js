import User from "../models/user.model.js";
import Admin from "../models/admin.model.js";
import Student from "../models/student.model.js";
import Institution from "../models/institution.model.js";
import Company from "../models/company.model.js";
import Notification from "../models/notification.model.js";
import bcrypt from "bcrypt";

// ============= Admin Management =============

// Get all admins (admin only)
export const getAllAdmins = async (req, res, next) => {
  try {
    const admins = await Admin.find().select("-__v");

    res.status(200).json({
      success: true,
      count: admins.length,
      data: admins,
    });
  } catch (error) {
    next(error);
  }
};

// Get admin by ID (admin only)
export const getAdminById = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.params.id).select("-__v");

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    res.status(200).json({
      success: true,
      data: admin,
    });
  } catch (error) {
    next(error);
  }
};

// Update admin (admin only)
export const updateAdmin = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.params.id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    // Prevent changing the admin's wallet address if it uses wallet auth
    if (
      admin.authMethod === "wallet" &&
      req.body.wallet &&
      req.body.wallet !== admin.wallet
    ) {
      return res.status(400).json({
        success: false,
        message: "Wallet address cannot be changed",
      });
    }

    const updatedAdmin = await Admin.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).select("-__v");

    res.status(200).json({
      success: true,
      data: updatedAdmin,
    });
  } catch (error) {
    next(error);
  }
};

// Delete admin (admin only)
export const deleteAdmin = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.params.id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    // Prevent deleting the last admin
    const adminCount = await Admin.countDocuments();
    if (adminCount <= 1) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete the last admin",
      });
    }

    await admin.deleteOne();

    res.status(200).json({
      success: true,
      message: "Admin deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// ============= Student Management =============

// Get all students (admin or institution only)
export const getAllStudents = async (req, res, next) => {
  try {
    let query = {};

    // If requester is an institution, only show students from that institution
    if (req.user.userType === "Institution") {
      query = { institutionId: req.user._id };
    }

    const students = await Student.find(query)
      .populate("institutionId", "name email")
      .select("-__v -password");

    res.status(200).json({
      success: true,
      count: students.length,
      data: students.map((student) => ({
        ...student.toObject(),
        skills: student.skills,
      })),
    });
  } catch (error) {
    next(error);
  }
};

// Get student by ID (admin or institution only)
export const getStudentById = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate("institutionId", "name email")
      .select("-__v -password");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Check if institution trying to access a student not from their institution
    if (
      req.user.userType === "Institution" &&
      student.institutionId._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this student's information",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        ...student.toObject(),
        skills: student.skills,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update student (admin or institution only)
export const updateStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Check if institution trying to update a student not from their institution
    if (
      req.user.userType === "Institution" &&
      student.institutionId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this student's information",
      });
    }

    // Check if trying to update email and if it's already in use
    if (req.body.email && req.body.email !== student.email) {
      const existingEmail = await User.findOne({
        email: req.body.email.toLowerCase(),
        _id: { $ne: student._id }, // Exclude current student
      });

      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: "Email is already in use by another account",
        });
      }
    }

    // Handle password update
    if (req.body.password) {
      // Hash the password before saving
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }

    // Only admin can change institutionId
    if (req.body.institutionId && req.user.userType !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "Only admin can change a student's institution",
      });
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("institutionId", "name email")
      .select("-__v -password");

    res.status(200).json({
      success: true,
      data: updatedStudent,
    });
  } catch (error) {
    next(error);
  }
};

// Verify student by institution
export const verifyStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Check if the institution is the one associated with the student
    if (student.institutionId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to verify this student",
      });
    }

    student.isVerifiedByInstitution = true;
    student.isVerified = true;

    await student.save();

    // Create notification for the student
    await Notification.createAccountApproved(student._id, "Student");

    res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

// Delete student (admin only)
export const deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    await student.deleteOne();

    res.status(200).json({
      success: true,
      message: "Student deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// ============= Institution Management =============

// Get all institutions (admin only)
export const getAllInstitutions = async (req, res, next) => {
  try {
    const institutions = await Institution.find().select("-__v -password");

    res.status(200).json({
      success: true,
      count: institutions.length,
      data: institutions.map((institution) => ({
        ...institution.toObject(),
        website: institution.website,
        location: institution.location,
      })),
    });
  } catch (error) {
    next(error);
  }
};

// Get institution by ID (admin only)
export const getInstitutionById = async (req, res, next) => {
  try {
    const institution = await Institution.findById(req.params.id).select(
      "-__v -password"
    );

    if (!institution) {
      return res.status(404).json({
        success: false,
        message: "Institution not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        ...institution.toObject(),
        website: institution.website,
        location: institution.location,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update institution (admin only)
export const updateInstitution = async (req, res, next) => {
  try {
    const institution = await Institution.findById(req.params.id);

    if (!institution) {
      return res.status(404).json({
        success: false,
        message: "Institution not found",
      });
    }

    // Check if trying to update email and if it's already in use
    if (req.body.email && req.body.email !== institution.email) {
      const existingEmail = await User.findOne({
        email: req.body.email.toLowerCase(),
        _id: { $ne: institution._id }, // Exclude current institution
      });

      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: "Email is already in use by another account",
        });
      }
    }

    // Handle password update
    if (req.body.password) {
      // Hash the password before saving
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedInstitution = await Institution.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).select("-__v -password");

    res.status(200).json({
      success: true,
      data: updatedInstitution,
    });
  } catch (error) {
    next(error);
  }
};

// Verify institution by admin
export const verifyInstitution = async (req, res, next) => {
  try {
    const institution = await Institution.findById(req.params.id);

    if (!institution) {
      return res.status(404).json({
        success: false,
        message: "Institution not found",
      });
    }

    institution.isVerifiedByAdmin = true;
    institution.isVerified = true;

    await institution.save();

    // Create notification for the institution
    await Notification.createAccountApproved(institution._id, "Institution");

    res.status(200).json({
      success: true,
      data: institution,
    });
  } catch (error) {
    next(error);
  }
};

// Delete institution (admin only)
export const deleteInstitution = async (req, res, next) => {
  try {
    const institution = await Institution.findById(req.params.id);

    if (!institution) {
      return res.status(404).json({
        success: false,
        message: "Institution not found",
      });
    }

    // Check if there are any students associated with this institution
    const studentsCount = await Student.countDocuments({
      institutionId: req.params.id,
    });

    if (studentsCount > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete institution with associated students",
      });
    }

    await institution.deleteOne();

    res.status(200).json({
      success: true,
      message: "Institution deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// ============= Company Management =============

// Get all companies (admin only)
export const getAllCompanies = async (req, res, next) => {
  try {
    const companies = await Company.find().select("-__v -password");

    res.status(200).json({
      success: true,
      count: companies.length,
      data: companies.map((company) => ({
        ...company.toObject(),
        website: company.website,
      })),
    });
  } catch (error) {
    next(error);
  }
};

// Get company by ID (admin only)
export const getCompanyById = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id).select(
      "-__v -password"
    );

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        ...company.toObject(),
        website: company.website,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update company (admin only)
export const updateCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    // Check if trying to update email and if it's already in use
    if (req.body.email && req.body.email !== company.email) {
      const existingEmail = await User.findOne({
        email: req.body.email.toLowerCase(),
        _id: { $ne: company._id }, // Exclude current company
      });

      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: "Email is already in use by another account",
        });
      }
    }

    // Handle password update
    if (req.body.password) {
      // Hash the password before saving
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedCompany = await Company.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).select("-__v -password");

    res.status(200).json({
      success: true,
      data: updatedCompany,
    });
  } catch (error) {
    next(error);
  }
};

// Verify company by admin
export const verifyCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    company.isVerifiedByAdmin = true;
    company.isVerified = true;

    await company.save();

    // Create notification for the company
    await Notification.createAccountApproved(company._id, "Company");

    res.status(200).json({
      success: true,
      data: company,
    });
  } catch (error) {
    next(error);
  }
};

// Delete company (admin only)
export const deleteCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    await company.deleteOne();

    res.status(200).json({
      success: true,
      message: "Company deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Get all verified public institutions (for student registration)
export const getPublicInstitutions = async (req, res, next) => {
  try {
    const institutions = await Institution.find({
      isVerified: true,
      isVerifiedByAdmin: true,
    }).select("_id name");

    res.status(200).json({
      success: true,
      count: institutions.length,
      data: institutions,
    });
  } catch (error) {
    next(error);
  }
};

// Change password for current user (all user types except admin) - Updated for wallet authentication
export const changePassword = async (req, res, next) => {
  try {
    const { newWallet } = req.body;

    if (!newWallet) {
      return res.status(400).json({
        success: false,
        message: "New wallet address is required",
      });
    }

    // Validate wallet address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(newWallet)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid Ethereum wallet address",
      });
    }

    // Check if wallet is already in use
    const existingUser = await User.findByWallet(newWallet);
    if (
      existingUser &&
      existingUser._id.toString() !== req.user._id.toString()
    ) {
      return res.status(400).json({
        success: false,
        message: "This wallet address is already in use by another account",
      });
    }

    // Get user based on type
    let user;
    let Model;
    switch (req.user.userType) {
      case "Student":
        Model = Student;
        break;
      case "Institution":
        Model = Institution;
        break;
      case "Company":
        Model = Company;
        break;
      default:
        return res.status(403).json({
          success: false,
          message: "Wallet change not allowed for this account type",
        });
    }

    // Find user
    user = await Model.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update wallet address
    user.wallet = newWallet;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Wallet address updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Update profile for current user (all user types)
export const updateProfile = async (req, res, next) => {
  try {
    const {
      name,
      email,
      companyName,
      industry,
      website,
      description,
      institutionName,
      institutionType,
      accreditation,
      firstName,
      lastName,
      roleNumber,
      skills,
      graduationYear,
      major,
    } = req.body;

    // Get the user based on their type
    let user;
    let Model;
    switch (req.user.userType) {
      case "Admin":
        Model = Admin;
        break;
      case "Student":
        Model = Student;
        break;
      case "Institution":
        Model = Institution;
        break;
      case "Company":
        Model = Company;
        break;
      default:
        return res.status(400).json({
          success: false,
          message: "Invalid user type",
        });
    }

    // Find user
    user = await Model.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update common fields
    if (name) user.name = name;
    if (email) user.email = email;

    // Update type-specific fields
    if (req.user.userType === "Company") {
      if (companyName) user.companyName = companyName;
      if (industry) user.industry = industry;
      if (website) user.website = website;
      if (description) user.description = description;
    } else if (req.user.userType === "Institution") {
      if (institutionName) user.institutionName = institutionName;
      if (institutionType) user.institutionType = institutionType;
      if (accreditation) user.accreditation = accreditation;
    } else if (req.user.userType === "Student") {
      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;
      if (roleNumber) user.roleNumber = roleNumber;
      if (skills) user.skills = skills;
      if (graduationYear) user.graduationYear = graduationYear;
      if (major) user.major = major;
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: user,
      message: "Profile updated successfully",
    });
  } catch (error) {
    next(error);
  }
};
