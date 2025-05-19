import User from "../models/user.model.js";
import AcademicRecord from "../models/academicRecord.model.js";
import Application from "../models/application.model.js";
import Job from "../models/job.model.js";
import Institution from "../models/institution.model.js";
import Company from "../models/company.model.js";
import Student from "../models/student.model.js";

export const generateReport = async (req, res) => {
  try {
    const { type } = req.params;
    const { startDate, endDate } = req.query;

    const start = new Date(startDate);
    const end = new Date(endDate);

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
    "Full Name": `${student.name || ""}`,
    Email: student.email || "",
    "Role Number": student.roleNumber || "",
    Institution: student.institutionId?.name || "",
    Skills: student.skills?.join(", ") || "",
    "Verification Status": student.isVerifiedByInstitution
      ? "Verified"
      : "Pending",
    "Registration Date": student.createdAt
      ? student.createdAt.toLocaleDateString()
      : "",
  }));

  const institutionData = institutions.map((institution) => ({
    "User Type": "Institution",
    Name: institution.name || "",
    Email: institution.email || "",
    Website: institution.website || "",
    Location: institution.location || "",
    "Verification Status": institution.isVerifiedByAdmin
      ? "Verified"
      : "Pending",
    "Registration Date": institution.createdAt
      ? institution.createdAt.toLocaleDateString()
      : "",
  }));

  const companyData = companies.map((company) => ({
    "User Type": "Company",
    Name: company.name || "",
    Email: company.email || "",
    Website: company.website || "",
    Address: company.address || "",
    Phone: company.phone || "",
    "Verification Status": company.isVerifiedByAdmin ? "Verified" : "Pending",
    "Registration Date": company.createdAt
      ? company.createdAt.toLocaleDateString()
      : "",
  }));

  return [...studentData, ...institutionData, ...companyData];
};

const generateRecordsReport = async (start, end) => {
  const records = await AcademicRecord.find({
    createdAt: { $gte: start, $lte: end },
  })
    .populate("studentId", "name email roleNumber")
    .populate("institutionId", "name");

  return records.map((record) => ({
    "Student Name": record.studentId?.name || "",
    "Student Email": record.studentId?.email || "",
    "Role Number": record.studentId?.roleNumber || "",
    Institution: record.institutionId?.name || "",
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
  }));
};

const generateApplicationsReport = async (start, end) => {
  const applications = await Application.find({
    createdAt: { $gte: start, $lte: end },
  })
    .populate("studentId", "name email roleNumber")
    .populate({
      path: "jobId",
      populate: { path: "companyId", select: "name" },
    })
    .populate("academicRecords");

  return applications.map((app) => ({
    "Student Name": app.studentId?.name || "",
    "Student Email": app.studentId?.email || "",
    "Role Number": app.studentId?.roleNumber || "",
    "Job Title": app.jobId?.title || "",
    Company: app.jobId?.companyId?.name || "",
    "Cover Letter": app.coverLetter || "",
    Status: app.status || "",
    "Academic Records": app.academicRecords?.length || 0,
    "Application Date": app.createdAt ? app.createdAt.toLocaleDateString() : "",
    "Last Updated": app.updatedAt ? app.updatedAt.toLocaleDateString() : "",
  }));
};

const generateJobsReport = async (start, end) => {
  const jobs = await Job.find({
    createdAt: { $gte: start, $lte: end },
  })
    .populate("companyId", "name")
    .populate("hiredApplicant", "name email");

  return jobs.map((job) => ({
    Title: job.title || "",
    Company: job.companyId?.name || "",
    Description: job.description || "",
    Requirements: job.requirements?.join(", ") || "",
    Location: job.location || "",
    Salary: job.salary || "",
    Status: job.status || "",
    "Certificate Requirements": job.certificateRequirements?.join(", ") || "",
    "Hired Applicant": job.hiredApplicant
      ? `${job.hiredApplicant.name} (${job.hiredApplicant.email})`
      : "None",
    "Posted Date": job.createdAt ? job.createdAt.toLocaleDateString() : "",
    "Last Updated": job.updatedAt ? job.updatedAt.toLocaleDateString() : "",
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
    Name: inst.name || "",
    Type: "Institution",
    Email: inst.email || "",
    Website: inst.website || "",
    Location: inst.location || "",
    Status: inst.isVerifiedByAdmin ? "Verified" : "Pending",
    "Verification Date": inst.updatedAt
      ? inst.updatedAt.toLocaleDateString()
      : "",
  }));

  const companyData = companies.map((comp) => ({
    Name: comp.name || "",
    Type: "Company",
    Email: comp.email || "",
    Website: comp.website || "",
    Address: comp.address || "",
    Phone: comp.phone || "",
    Status: comp.isVerifiedByAdmin ? "Verified" : "Pending",
    "Verification Date": comp.updatedAt
      ? comp.updatedAt.toLocaleDateString()
      : "",
  }));

  return [...institutionData, ...companyData];
};
