import User from "../models/user.model.js";
import Admin from "../models/admin.model.js";
import Student from "../models/student.model.js";
import Institution from "../models/institution.model.js";
import Company from "../models/company.model.js";
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
      .select("-__v");

    res.status(200).json({
      success: true,
      count: students.length,
      data: students,
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
      .select("-__v");

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
      data: student,
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

    // Prevent changing the student's wallet address
    if (
      student.authMethod === "wallet" &&
      req.body.wallet &&
      req.body.wallet !== student.wallet
    ) {
      return res.status(400).json({
        success: false,
        message: "Wallet address cannot be changed",
      });
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
      .select("-__v");

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
      data: institutions,
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
      data: institution,
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

// Change institution password (admin only)
export const changeInstitutionPassword = async (req, res, next) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }

    const institution = await Institution.findById(req.params.id);

    if (!institution) {
      return res.status(404).json({
        success: false,
        message: "Institution not found",
      });
    }

    // Update password
    institution.password = password;
    await institution.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
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
      data: companies,
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
      data: company,
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

// Change company password (admin only)
export const changeCompanyPassword = async (req, res, next) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }

    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    // Update password
    company.password = password;
    await company.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
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
