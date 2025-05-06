import User from "../models/user.model.js";
import AcademicRecord from "../models/academicRecord.model.js";
import Application from "../models/application.model.js";
import Job from "../models/job.model.js";
import Institution from "../models/institution.model.js";
import Company from "../models/company.model.js";

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
  const users = await User.find({
    createdAt: { $gte: start, $lte: end },
  }).select("-password -__v");
  return users.map((user) => ({
    Name: user.name || "",
    Email: user.email || "",
    Type: user.userType || "",
    Wallet: user.wallet || "",
    "Registration Date": user.createdAt
      ? user.createdAt.toLocaleDateString()
      : "",
    Status: user.isVerifiedByAdmin ? "Verified" : "Pending",
  }));
};

const generateRecordsReport = async (start, end) => {
  const records = await AcademicRecord.find({
    createdAt: { $gte: start, $lte: end },
  }).populate("student", "name email");
  return records.map((record) => ({
    "Student Name": record.student?.name || "",
    "Student Email": record.student?.email || "",
    Degree: record.degree || "",
    Field: record.field || "",
    Institution: record.institution || "",
    Year: record.year || "",
    Status: record.status || "",
    "Verification Date": record.verifiedAt
      ? record.verifiedAt.toLocaleDateString()
      : "",
  }));
};

const generateApplicationsReport = async (start, end) => {
  const applications = await Application.find({
    createdAt: { $gte: start, $lte: end },
  })
    .populate("student", "name email")
    .populate({ path: "job", populate: { path: "company", select: "name" } });
  return applications.map((app) => ({
    "Student Name": app.student?.name || "",
    "Student Email": app.student?.email || "",
    "Job Title": app.job?.title || "",
    Company: app.job?.company?.name || app.job?.company || "",
    Status: app.status || "",
    "Application Date": app.createdAt ? app.createdAt.toLocaleDateString() : "",
    "Last Updated": app.updatedAt ? app.updatedAt.toLocaleDateString() : "",
  }));
};

const generateJobsReport = async (start, end) => {
  const jobs = await Job.find({
    createdAt: { $gte: start, $lte: end },
  }).populate("company", "name");
  return jobs.map((job) => ({
    Title: job.title || "",
    Company: job.company?.name || "",
    Location: job.location || "",
    Type: job.type || "",
    Status: job.status || "",
    "Posted Date": job.createdAt ? job.createdAt.toLocaleDateString() : "",
    Applications: Array.isArray(job.applications) ? job.applications.length : 0,
  }));
};

const generateVerificationsReport = async (start, end) => {
  const [institutions, companies] = await Promise.all([
    Institution.find({ updatedAt: { $gte: start, $lte: end } }),
    Company.find({ updatedAt: { $gte: start, $lte: end } }),
  ]);
  const institutionData = institutions.map((inst) => ({
    Name: inst.name || "",
    Type: "Institution",
    Status: inst.isVerifiedByAdmin ? "Verified" : "Pending",
    "Verification Date": inst.updatedAt
      ? inst.updatedAt.toLocaleDateString()
      : "",
  }));
  const companyData = companies.map((comp) => ({
    Name: comp.name || "",
    Type: "Company",
    Status: comp.isVerifiedByAdmin ? "Verified" : "Pending",
    "Verification Date": comp.updatedAt
      ? comp.updatedAt.toLocaleDateString()
      : "",
  }));
  return [...institutionData, ...companyData];
};
