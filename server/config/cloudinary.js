// config/cloudinary.js
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Configure storage options for academic records
const storageOptions = {
  folder: "academic_records",
  resource_type: "raw", // Important: Use 'raw' for PDFs and documents, not 'image'
  allowed_formats: ["pdf", "doc", "docx"],
  type: "private", // Use 'private' for secure files
  access_mode: "authenticated", // Require authentication for access
};

// Create CloudinaryStorage instance
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    ...storageOptions,
    public_id: (req, file) => {
      const uniqueFileName = `${uuidv4()}`;
      const format = file.originalname.split(".").pop().toLowerCase();
      const filename = `${uniqueFileName}.${format}`;
      file.cloudinaryPath = `academic_records/${filename}`;
      return filename;
    },
  },
});

// File filter for document types
const fileFilter = (req, file, cb) => {
  try {
    if (!file.originalname) {
      throw new Error("No file provided");
    }

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error(
        "Invalid file type. Only PDF, DOC, and DOCX files are allowed"
      );
    }

    cb(null, true);
  } catch (error) {
    cb(error, false);
  }
};

// Custom error handler for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        error: `File size too large. Maximum size is ${
          MAX_FILE_SIZE / (1024 * 1024)
        }MB`,
      });
    }
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }
  if (err.message) {
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }
  next(err);
};

// Configure multer upload
const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1, // Allow only 1 file
  },
  fileFilter,
}).single("document"); // Match your frontend field name "document"

// Wrapped upload middleware with error handling
export const uploadMiddleware = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      return handleMulterError(err, req, res, next);
    }
    next();
  });
};

// Utility functions for Cloudinary operations
export const cloudinaryUtils = {
  deleteFile: async (publicId) => {
    if (!publicId) return;
    try {
      await cloudinary.uploader.destroy(publicId, {
        resource_type: "raw",
        type: "private",
      });
    } catch (error) {
      console.error("Error deleting file from Cloudinary:", error);
    }
  },

  cleanupUpload: async (file) => {
    if (!file) return;
    try {
      const publicId =
        file.cloudinaryPath ||
        (file.filename ? `academic_records/${file.filename}` : null);

      if (publicId) {
        await cloudinaryUtils.deleteFile(publicId);
      }
    } catch (error) {
      console.error("Error cleaning up file:", error);
    }
  },

  // Generate a signed URL for secure access
  generateSignedUrl: async (publicId, expiresIn = 3600) => {
    if (!publicId) return null;
    try {
      const timestamp = Math.floor(Date.now() / 1000) + expiresIn;
      const format = publicId.includes(".") ? publicId.split(".").pop() : "pdf"; // Default to pdf if no extension

      return cloudinary.utils.private_download_url(publicId, format, {
        resource_type: "raw",
        type: "private",
        expires_at: timestamp,
        // attachment: true, // Force download instead of browser display
      });
    } catch (error) {
      console.error("URL Generation Error:", error);
      return null;
    }
  },
};
export default cloudinary;
