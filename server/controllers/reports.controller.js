import User from "../models/user.model.js";
import AcademicRecord from "../models/academicRecord.model.js";
import Application from "../models/application.model.js";
import Job from "../models/job.model.js";
import Institution from "../models/institution.model.js";
import Company from "../models/company.model.js";
import Student from "../models/student.model.js";
import Interview from "../models/interview.model.js";

export const generateReport = async (req, res) => {
  try {
    const { type } = req.params;
    const { startDate, endDate } = req.query;

    // Validate date parameters
    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ message: "startDate and endDate are required" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Validate that dates are valid
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res
        .status(400)
        .json({ message: "Invalid date format. Use YYYY-MM-DD" });
    }

    // Set end date to end of day
    end.setHours(23, 59, 59, 999);

    let data = [];

    switch (type) {
      case "users":
        data = await generateUserReport(start, end);
        break;
      case "records":
        data = await generateRecordsReport(start, end);
        break;
      case "applications":
        data = await generateApplicationsReport(start, end);
        break;
      case "jobs":
        data = await generateJobsReport(start, end);
        break;
      case "verifications":
        data = await generateVerificationsReport(start, end);
        break;
      default:
        return res.status(400).json({ message: "Invalid report type" });
    }

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({ message: "Error generating report" });
  }
};

const generateUserReport = async (start, end) => {
  const [students, institutions, companies] = await Promise.all([
    Student.find({
      createdAt: { $gte: start, $lte: end },
    }).populate("institutionId", "name"),
    Institution.find({
      createdAt: { $gte: start, $lte: end },
    }),
    Company.find({
      createdAt: { $gte: start, $lte: end },
    }),
  ]);

  const studentData = students.map((student) => ({
    "User Type": "Student",
    "Full Name": student?.name || "N/A",
    "Wallet Address": student?.wallet
      ? `${student.wallet.substring(0, 6)}...${student.wallet.substring(
          student.wallet.length - 4
        )}`
      : "N/A",
    "Role Number": student?.roleNumber || "N/A",
    Institution: student?.institutionId?.name || "N/A",
    Skills: student?.skills?.join(", ") || "N/A",
    "Verification Status": student?.isVerifiedByInstitution
      ? "Verified"
      : "Pending",
    "Registration Date": student?.createdAt
      ? student.createdAt.toLocaleDateString()
      : "N/A",
  }));

  const institutionData = institutions.map((institution) => ({
    "User Type": "Institution",
    Name: institution?.name || "N/A",
    "Wallet Address": institution?.wallet
      ? `${institution.wallet.substring(0, 6)}...${institution.wallet.substring(
          institution.wallet.length - 4
        )}`
      : "N/A",
    Website: institution?.website || "N/A",
    Location: institution?.location || "N/A",
    "Verification Status": institution?.isVerifiedByAdmin
      ? "Verified"
      : "Pending",
    "Registration Date": institution?.createdAt
      ? institution.createdAt.toLocaleDateString()
      : "N/A",
  }));

  const companyData = companies.map((company) => ({
    "User Type": "Company",
    Name: company?.name || "N/A",
    "Wallet Address": company?.wallet
      ? `${company.wallet.substring(0, 6)}...${company.wallet.substring(
          company.wallet.length - 4
        )}`
      : "N/A",
    Website: company?.website || "N/A",
    Address: company?.address || "N/A",
    Phone: company?.phone || "N/A",
    "Verification Status": company?.isVerifiedByAdmin ? "Verified" : "Pending",
    "Registration Date": company?.createdAt
      ? company.createdAt.toLocaleDateString()
      : "N/A",
  }));

  return [...studentData, ...institutionData, ...companyData];
};

const generateRecordsReport = async (start, end) => {
  const records = await AcademicRecord.find({
    createdAt: { $gte: start, $lte: end },
  })
    .populate("studentId", "name wallet roleNumber")
    .populate("institutionId", "name");

  return records.map((record) => ({
    "Student Name": record?.studentId?.name || "N/A",
    "Student Wallet": record?.studentId?.wallet
      ? `${record.studentId.wallet.substring(
          0,
          6
        )}...${record.studentId.wallet.substring(
          record.studentId.wallet.length - 4
        )}`
      : "N/A",
    "Role Number": record?.studentId?.roleNumber || "N/A",
    Institution: record?.institutionId?.name || "N/A",
    "Record Type": record?.recordType || "N/A",
    Title: record?.title || "N/A",
    GPA: record?.gpa || "N/A",
    Status: record?.status || "N/A",
    "Verification Date": record?.verifiedAt
      ? record.verifiedAt.toLocaleDateString()
      : "N/A",
    "Creation Date": record?.createdAt
      ? record.createdAt.toLocaleDateString()
      : "N/A",
  }));
};

const generateApplicationsReport = async (start, end) => {
  const applications = await Application.find({
    createdAt: { $gte: start, $lte: end },
  })
    .populate("studentId", "name wallet roleNumber")
    .populate({
      path: "jobId",
      populate: { path: "companyId", select: "name" },
    })
    .populate("academicRecords");

  return applications.map((app) => ({
    "Student Name": app?.studentId?.name || "N/A",
    "Student Wallet": app?.studentId?.wallet
      ? `${app.studentId.wallet.substring(
          0,
          6
        )}...${app.studentId.wallet.substring(app.studentId.wallet.length - 4)}`
      : "N/A",
    "Role Number": app?.studentId?.roleNumber || "N/A",
    "Job Title": app?.jobId?.title || "N/A",
    Company: app?.jobId?.companyId?.name || "N/A",
    "Cover Letter": app?.coverLetter || "N/A",
    Status: app?.status || "N/A",
    "Academic Records": app?.academicRecords?.length || 0,
    "Application Date": app?.createdAt
      ? app.createdAt.toLocaleDateString()
      : "N/A",
    "Last Updated": app?.updatedAt ? app.updatedAt.toLocaleDateString() : "N/A",
  }));
};

const generateJobsReport = async (start, end) => {
  const jobs = await Job.find({
    createdAt: { $gte: start, $lte: end },
  })
    .populate("companyId", "name")
    .populate("hiredApplicant", "name wallet");

  return jobs.map((job) => ({
    Title: job?.title || "N/A",
    Company: job?.companyId?.name || "N/A",
    Description: job?.description || "N/A",
    Requirements: job?.requirements?.join(", ") || "N/A",
    Location: job?.location || "N/A",
    Salary: job?.salary || "N/A",
    Status: job?.status || "N/A",
    "Certificate Requirements":
      job?.certificateRequirements?.join(", ") || "N/A",
    "Hired Applicant": job?.hiredApplicant
      ? `${job.hiredApplicant.name} (${
          job.hiredApplicant.wallet
            ? `${job.hiredApplicant.wallet.substring(
                0,
                6
              )}...${job.hiredApplicant.wallet.substring(
                job.hiredApplicant.wallet.length - 4
              )}`
            : "N/A"
        })`
      : "None",
    "Posted Date": job?.createdAt ? job.createdAt.toLocaleDateString() : "N/A",
    "Last Updated": job?.updatedAt ? job.updatedAt.toLocaleDateString() : "N/A",
  }));
};

const generateVerificationsReport = async (start, end) => {
  const [institutions, companies] = await Promise.all([
    Institution.find({
      updatedAt: { $gte: start, $lte: end },
    }),
    Company.find({
      updatedAt: { $gte: start, $lte: end },
    }),
  ]);

  const institutionData = institutions.map((inst) => ({
    Name: inst?.name || "N/A",
    Type: "Institution",
    "Wallet Address": inst?.wallet
      ? `${inst.wallet.substring(0, 6)}...${inst.wallet.substring(
          inst.wallet.length - 4
        )}`
      : "N/A",
    Website: inst?.website || "N/A",
    Location: inst?.location || "N/A",
    Status: inst?.isVerifiedByAdmin ? "Verified" : "Pending",
    "Verification Date": inst?.updatedAt
      ? inst.updatedAt.toLocaleDateString()
      : "N/A",
  }));

  const companyData = companies.map((comp) => ({
    Name: comp?.name || "N/A",
    Type: "Company",
    "Wallet Address": comp?.wallet
      ? `${comp.wallet.substring(0, 6)}...${comp.wallet.substring(
          comp.wallet.length - 4
        )}`
      : "N/A",
    Website: comp?.website || "N/A",
    Address: comp?.address || "N/A",
    Phone: comp?.phone || "N/A",
    Status: comp?.isVerifiedByAdmin ? "Verified" : "Pending",
    "Verification Date": comp?.updatedAt
      ? comp.updatedAt.toLocaleDateString()
      : "N/A",
  }));

  return [...institutionData, ...companyData];
};

// Company Reports
export const generateCompanyReport = async (req, res) => {
  try {
    const { type } = req.params;
    const { startDate, endDate } = req.query;
    const companyId = req.user._id;

    // Validate date parameters
    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ message: "startDate and endDate are required" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Validate that dates are valid
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res
        .status(400)
        .json({ message: "Invalid date format. Use YYYY-MM-DD" });
    }

    // Set end date to end of day
    end.setHours(23, 59, 59, 999);

    let data = [];

    switch (type) {
      case "jobs":
        data = await generateCompanyJobsReport(companyId, start, end);
        break;
      case "applications":
        data = await generateCompanyApplicationsReport(companyId, start, end);
        break;
      case "interviews":
        data = await generateCompanyInterviewsReport(companyId, start, end);
        break;
      case "hiring":
        data = await generateCompanyHiringReport(companyId, start, end);
        break;
      default:
        return res.status(400).json({ message: "Invalid report type" });
    }

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error generating company report:", error);
    res.status(500).json({ message: "Error generating company report" });
  }
};

export const generateCompanySummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const companyId = req.user._id;

    // Validate date parameters
    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ message: "startDate and endDate are required" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Validate that dates are valid
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res
        .status(400)
        .json({ message: "Invalid date format. Use YYYY-MM-DD" });
    }

    // Set end date to end of day
    end.setHours(23, 59, 59, 999);

    const [
      totalJobs,
      activeJobs,
      totalApplications,
      pendingApplications,
      totalInterviews,
      upcomingInterviews,
      hiredCount,
    ] = await Promise.all([
      Job.countDocuments({ companyId, createdAt: { $gte: start, $lte: end } }),
      Job.countDocuments({ companyId, status: "active" }),
      Application.countDocuments({
        jobId: { $in: await Job.find({ companyId }).select("_id") },
        createdAt: { $gte: start, $lte: end },
      }),
      Application.countDocuments({
        jobId: { $in: await Job.find({ companyId }).select("_id") },
        status: "pending",
      }),
      Interview.countDocuments({
        companyId,
        createdAt: { $gte: start, $lte: end },
      }),
      Interview.countDocuments({
        companyId,
        status: "scheduled",
        scheduledDate: { $gte: new Date() },
      }),
      Job.countDocuments({
        companyId,
        hiredApplicant: { $exists: true, $ne: null },
      }),
    ]);

    const hiringRate =
      totalApplications > 0
        ? Math.round((hiredCount / totalApplications) * 100)
        : 0;

    res.json({
      success: true,
      data: {
        totalJobs,
        activeJobs,
        totalApplications,
        pendingApplications,
        totalInterviews,
        upcomingInterviews,
        totalHired: hiredCount,
        hiringRate,
      },
    });
  } catch (error) {
    console.error("Error generating company summary:", error);
    res.status(500).json({ message: "Error generating company summary" });
  }
};

// Institution Reports
export const generateInstitutionReport = async (req, res) => {
  try {
    const { type } = req.params;
    const { startDate, endDate } = req.query;
    const institutionId = req.user._id;

    // Validate date parameters
    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ message: "startDate and endDate are required" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Validate that dates are valid
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res
        .status(400)
        .json({ message: "Invalid date format. Use YYYY-MM-DD" });
    }

    // Set end date to end of day
    end.setHours(23, 59, 59, 999);

    let data = [];

    switch (type) {
      case "students":
        data = await generateInstitutionStudentsReport(
          institutionId,
          start,
          end
        );
        break;
      case "records":
        data = await generateInstitutionRecordsReport(
          institutionId,
          start,
          end
        );
        break;
      case "verifications":
        data = await generateInstitutionVerificationsReport(
          institutionId,
          start,
          end
        );
        break;
      case "graduations":
        data = await generateInstitutionGraduationsReport(
          institutionId,
          start,
          end
        );
        break;
      default:
        return res.status(400).json({ message: "Invalid report type" });
    }

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error generating institution report:", error);
    res.status(500).json({ message: "Error generating institution report" });
  }
};

export const generateInstitutionSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const institutionId = req.user._id;

    // Validate date parameters
    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ message: "startDate and endDate are required" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Validate that dates are valid
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res
        .status(400)
        .json({ message: "Invalid date format. Use YYYY-MM-DD" });
    }

    // Set end date to end of day
    end.setHours(23, 59, 59, 999);

    const [
      totalStudents,
      newStudents,
      totalRecords,
      pendingRecords,
      verifiedRecords,
      graduatedStudents,
    ] = await Promise.all([
      Student.countDocuments({ institutionId }),
      Student.countDocuments({
        institutionId,
        createdAt: { $gte: start, $lte: end },
      }),
      AcademicRecord.countDocuments({ institutionId }),
      AcademicRecord.countDocuments({ institutionId, status: "pending" }),
      AcademicRecord.countDocuments({ institutionId, status: "verified" }),
      Student.countDocuments({
        institutionId,
        graduationYear: { $lte: new Date().getFullYear() },
      }),
    ]);

    const verificationRate =
      totalRecords > 0 ? Math.round((verifiedRecords / totalRecords) * 100) : 0;
    const graduationRate =
      totalStudents > 0
        ? Math.round((graduatedStudents / totalStudents) * 100)
        : 0;

    res.json({
      success: true,
      data: {
        totalStudents,
        newStudents,
        totalRecords,
        pendingRecords,
        verifiedRecords,
        graduatedStudents,
        verificationRate,
        graduationRate,
      },
    });
  } catch (error) {
    console.error("Error generating institution summary:", error);
    res.status(500).json({ message: "Error generating institution summary" });
  }
};

// Student Reports
export const generateStudentReport = async (req, res) => {
  try {
    const { type } = req.params;
    const { startDate, endDate } = req.query;
    const studentId = req.user._id;

    // Validate date parameters
    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ message: "startDate and endDate are required" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Validate that dates are valid
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res
        .status(400)
        .json({ message: "Invalid date format. Use YYYY-MM-DD" });
    }

    // Set end date to end of day
    end.setHours(23, 59, 59, 999);

    let data = [];

    switch (type) {
      case "records":
        data = await generateStudentRecordsReport(studentId, start, end);
        break;
      case "applications":
        data = await generateStudentApplicationsReport(studentId, start, end);
        break;
      case "interviews":
        data = await generateStudentInterviewsReport(studentId, start, end);
        break;
      case "progress":
        data = await generateStudentProgressReport(studentId, start, end);
        break;
      default:
        return res.status(400).json({ message: "Invalid report type" });
    }

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error generating student report:", error);
    res.status(500).json({ message: "Error generating student report" });
  }
};

export const generateStudentSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const studentId = req.user._id;

    // Validate date parameters
    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ message: "startDate and endDate are required" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Validate that dates are valid
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res
        .status(400)
        .json({ message: "Invalid date format. Use YYYY-MM-DD" });
    }

    // Set end date to end of day
    end.setHours(23, 59, 59, 999);

    const [
      totalRecords,
      verifiedRecords,
      totalApplications,
      pendingApplications,
      totalInterviews,
      upcomingInterviews,
      acceptedOffers,
    ] = await Promise.all([
      AcademicRecord.countDocuments({ studentId }),
      AcademicRecord.countDocuments({ studentId, status: "verified" }),
      Application.countDocuments({
        studentId,
        createdAt: { $gte: start, $lte: end },
      }),
      Application.countDocuments({ studentId, status: "pending" }),
      Interview.countDocuments({
        studentId,
        createdAt: { $gte: start, $lte: end },
      }),
      Interview.countDocuments({
        studentId,
        status: "scheduled",
        scheduledDate: { $gte: new Date() },
      }),
      Application.countDocuments({ studentId, status: "accepted" }),
    ]);

    const successRate =
      totalApplications > 0
        ? Math.round((acceptedOffers / totalApplications) * 100)
        : 0;

    res.json({
      success: true,
      data: {
        totalRecords,
        verifiedRecords,
        totalApplications,
        pendingApplications,
        totalInterviews,
        upcomingInterviews,
        acceptedOffers,
        successRate,
      },
    });
  } catch (error) {
    console.error("Error generating student summary:", error);
    res.status(500).json({ message: "Error generating student summary" });
  }
};

// Helper functions for Company Reports
const generateCompanyJobsReport = async (companyId, start, end) => {
  const jobs = await Job.find({
    companyId,
    createdAt: { $gte: start, $lte: end },
  }).populate("hiredApplicant", "name email");

  return jobs.map((job) => ({
    "Job Title": job.title || "",
    Description: job.description || "",
    Requirements: job.requirements?.join(", ") || "",
    Location: job.location || "",
    Salary: job.salary || "",
    Status: job.status || "",
    Applications: job.applicationCount || 0,
    "Hired Applicant": job.hiredApplicant
      ? `${job.hiredApplicant.name} (${job.hiredApplicant.email})`
      : "None",
    "Posted Date": job.createdAt ? job.createdAt.toLocaleDateString() : "",
    "Last Updated": job.updatedAt ? job.updatedAt.toLocaleDateString() : "",
  }));
};

const generateCompanyApplicationsReport = async (companyId, start, end) => {
  const jobIds = await Job.find({ companyId }).select("_id");
  const applications = await Application.find({
    jobId: { $in: jobIds },
    createdAt: { $gte: start, $lte: end },
  })
    .populate("studentId", "name wallet roleNumber")
    .populate("jobId", "title");

  return applications.map((app) => ({
    "Student Name": app?.studentId?.name || "N/A",
    "Student Wallet": app?.studentId?.wallet
      ? `${app.studentId.wallet.substring(
          0,
          6
        )}...${app.studentId.wallet.substring(app.studentId.wallet.length - 4)}`
      : "N/A",
    "Role Number": app?.studentId?.roleNumber || "N/A",
    "Job Title": app?.jobId?.title || "N/A",
    "Cover Letter": app?.coverLetter || "N/A",
    Status: app?.status || "N/A",
    "Academic Records": app?.academicRecords?.length || 0,
    "Application Date": app?.createdAt
      ? app.createdAt.toLocaleDateString()
      : "N/A",
    "Last Updated": app?.updatedAt ? app.updatedAt.toLocaleDateString() : "N/A",
  }));
};

const generateCompanyInterviewsReport = async (companyId, start, end) => {
  const interviews = await Interview.find({
    companyId,
    createdAt: { $gte: start, $lte: end },
  })
    .populate("studentId", "name wallet")
    .populate("jobId", "title");

  return interviews.map((interview) => ({
    "Student Name": interview?.studentId?.name || "N/A",
    "Student Wallet": interview?.studentId?.wallet
      ? `${interview.studentId.wallet.substring(
          0,
          6
        )}...${interview.studentId.wallet.substring(
          interview.studentId.wallet.length - 4
        )}`
      : "N/A",
    "Job Title": interview?.jobId?.title || "N/A",
    "Interview Type": interview?.interviewType || "N/A",
    "Scheduled Date": interview?.scheduledDate
      ? interview.scheduledDate.toLocaleDateString()
      : "N/A",
    Status: interview?.status || "N/A",
    Notes: interview?.notes || "N/A",
    "Created Date": interview?.createdAt
      ? interview.createdAt.toLocaleDateString()
      : "N/A",
  }));
};

const generateCompanyHiringReport = async (companyId, start, end) => {
  const jobs = await Job.find({
    companyId,
    hiredApplicant: { $exists: true, $ne: null },
    updatedAt: { $gte: start, $lte: end },
  })
    .populate("hiredApplicant", "name wallet")
    .populate("companyId", "name");

  return jobs.map((job) => ({
    "Job Title": job?.title || "N/A",
    Company: job?.companyId?.name || "N/A",
    "Hired Applicant": job?.hiredApplicant
      ? `${job.hiredApplicant.name} (${
          job.hiredApplicant.wallet
            ? `${job.hiredApplicant.wallet.substring(
                0,
                6
              )}...${job.hiredApplicant.wallet.substring(
                job.hiredApplicant.wallet.length - 4
              )}`
            : "N/A"
        })`
      : "N/A",
    "Hiring Date": job?.updatedAt ? job.updatedAt.toLocaleDateString() : "N/A",
    "Position Type": job?.type || "N/A",
    Salary: job?.salary || "N/A",
  }));
};

// Helper functions for Institution Reports
const generateInstitutionStudentsReport = async (institutionId, start, end) => {
  const students = await Student.find({
    institutionId,
    createdAt: { $gte: start, $lte: end },
  });

  return students.map((student) => ({
    "Student Name": student?.name || "N/A",
    "Role Number": student?.roleNumber || "N/A",
    "Wallet Address": student?.wallet
      ? `${student.wallet.substring(0, 6)}...${student.wallet.substring(
          student.wallet.length - 4
        )}`
      : "N/A",
    Skills: student?.skills?.join(", ") || "N/A",
    Major: student?.major || "N/A",
    "Graduation Year": student?.graduationYear || "N/A",
    "Verification Status": student?.isVerifiedByInstitution
      ? "Verified"
      : "Pending",
    "Registration Date": student?.createdAt
      ? student.createdAt.toLocaleDateString()
      : "N/A",
  }));
};

const generateInstitutionRecordsReport = async (institutionId, start, end) => {
  const records = await AcademicRecord.find({
    institutionId,
    createdAt: { $gte: start, $lte: end },
  }).populate("studentId", "name wallet roleNumber");

  return records.map((record) => ({
    "Student Name": record?.studentId?.name || "N/A",
    "Student Wallet": record?.studentId?.wallet
      ? `${record.studentId.wallet.substring(
          0,
          6
        )}...${record.studentId.wallet.substring(
          record.studentId.wallet.length - 4
        )}`
      : "N/A",
    "Role Number": record?.studentId?.roleNumber || "N/A",
    "Record Type": record?.recordType || "N/A",
    Title: record?.title || "N/A",
    GPA: record?.gpa || "N/A",
    Status: record?.status || "N/A",
    "Verification Date": record?.verifiedAt
      ? record.verifiedAt.toLocaleDateString()
      : "N/A",
    "Creation Date": record?.createdAt
      ? record.createdAt.toLocaleDateString()
      : "N/A",
  }));
};

const generateInstitutionVerificationsReport = async (
  institutionId,
  start,
  end
) => {
  const records = await AcademicRecord.find({
    institutionId,
    updatedAt: { $gte: start, $lte: end },
  }).populate("studentId", "name wallet roleNumber");

  return records.map((record) => ({
    "Student Name": record?.studentId?.name || "N/A",
    "Student Wallet": record?.studentId?.wallet
      ? `${record.studentId.wallet.substring(
          0,
          6
        )}...${record.studentId.wallet.substring(
          record.studentId.wallet.length - 4
        )}`
      : "N/A",
    "Role Number": record?.studentId?.roleNumber || "N/A",
    "Record Type": record?.recordType || "N/A",
    Title: record?.title || "N/A",
    Status: record?.status || "N/A",
    "Verification Date": record?.verifiedAt
      ? record.verifiedAt.toLocaleDateString()
      : "N/A",
    "Last Updated": record?.updatedAt
      ? record.updatedAt.toLocaleDateString()
      : "N/A",
  }));
};

const generateInstitutionGraduationsReport = async (
  institutionId,
  start,
  end
) => {
  const students = await Student.find({
    institutionId,
    graduationYear: { $lte: new Date().getFullYear() },
  });

  return students.map((student) => ({
    "Student Name": student?.name || "N/A",
    "Role Number": student?.roleNumber || "N/A",
    "Wallet Address": student?.wallet
      ? `${student.wallet.substring(0, 6)}...${student.wallet.substring(
          student.wallet.length - 4
        )}`
      : "N/A",
    Major: student?.major || "N/A",
    "Graduation Year": student?.graduationYear || "N/A",
    Skills: student?.skills?.join(", ") || "N/A",
    "Verification Status": student?.isVerifiedByInstitution
      ? "Verified"
      : "Pending",
  }));
};

// Helper functions for Student Reports
const generateStudentRecordsReport = async (studentId, start, end) => {
  const records = await AcademicRecord.find({
    studentId,
    createdAt: { $gte: start, $lte: end },
  }).populate("institutionId", "name");

  return records.map((record) => ({
    "Record Type": record.recordType || "",
    Title: record.title || "",
    Institution: record.institutionId?.name || "",
    GPA: record.gpa || "",
    Status: record.status || "",
    "Verification Date": record.verifiedAt
      ? record.verifiedAt.toLocaleDateString()
      : "",
    "Creation Date": record.createdAt
      ? record.createdAt.toLocaleDateString()
      : "",
  }));
};

const generateStudentApplicationsReport = async (studentId, start, end) => {
  const applications = await Application.find({
    studentId,
    createdAt: { $gte: start, $lte: end },
  }).populate({
    path: "jobId",
    populate: { path: "companyId", select: "name" },
  });

  return applications.map((app) => ({
    "Job Title": app?.jobId?.title || "N/A",
    Company: app?.jobId?.companyId?.name || "N/A",
    "Cover Letter": app?.coverLetter || "N/A",
    Status: app?.status || "N/A",
    "Academic Records": app?.academicRecords?.length || 0,
    "Application Date": app?.createdAt
      ? app.createdAt.toLocaleDateString()
      : "N/A",
    "Last Updated": app?.updatedAt ? app.updatedAt.toLocaleDateString() : "N/A",
  }));
};

const generateStudentInterviewsReport = async (studentId, start, end) => {
  const interviews = await Interview.find({
    studentId,
    createdAt: { $gte: start, $lte: end },
  }).populate({
    path: "jobId",
    populate: { path: "companyId", select: "name" },
  });

  return interviews.map((interview) => ({
    "Job Title": interview?.jobId?.title || "N/A",
    Company: interview?.jobId?.companyId?.name || "N/A",
    "Interview Type": interview?.interviewType || "N/A",
    "Scheduled Date": interview?.scheduledDate
      ? interview.scheduledDate.toLocaleDateString()
      : "N/A",
    Status: interview?.status || "N/A",
    Notes: interview?.notes || "N/A",
    "Created Date": interview?.createdAt
      ? interview.createdAt.toLocaleDateString()
      : "N/A",
  }));
};

const generateStudentProgressReport = async (studentId, start, end) => {
  const student = await Student.findById(studentId);
  const records = await AcademicRecord.find({
    studentId,
    createdAt: { $gte: start, $lte: end },
  });

  return records.map((record) => ({
    "Record Type": record.recordType || "",
    Title: record.title || "",
    GPA: record.gpa || "",
    Status: record.status || "",
    "Verification Date": record.verifiedAt
      ? record.verifiedAt.toLocaleDateString()
      : "",
    "Creation Date": record.createdAt
      ? record.createdAt.toLocaleDateString()
      : "",
    "Student Name": student?.name || "",
    Major: student?.major || "",
    "Graduation Year": student?.graduationYear || "",
  }));
};
