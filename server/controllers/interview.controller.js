import Interview from "../models/interview.model.js";
import Application from "../models/application.model.js";
import { asyncHandler } from "../middlewares/async.middleware.js";
import { ErrorResponse } from "../utils/errorResponse.js";

// @desc    Create a new interview
// @route   POST /api/interviews
// @access  Private (Company)
const createInterview = asyncHandler(async (req, res) => {
  const {
    applicationId,
    interviewStage,
    interviewDate,
    interviewerName,
    feedback,
    notes,
  } = req.body;

  // Check if application exists and belongs to company's job
  const application = await Application.findById(applicationId)
    .populate("jobId")
    .populate("studentId");

  if (!application) {
    throw new ErrorResponse("Application not found", 404);
  }

  // Verify the job belongs to the company
  if (application.jobId.companyId.toString() !== req.user._id.toString()) {
    throw new ErrorResponse(
      "Not authorized to create interview for this application",
      403
    );
  }

  // Check if interview already exists for this application and stage
  const existingInterview = await Interview.findOne({
    applicationId,
    interviewStage,
  });

  if (existingInterview) {
    throw new ErrorResponse("Interview for this stage already exists", 400);
  }

  const interview = await Interview.create({
    applicationId,
    interviewStage,
    interviewDate,
    interviewerName,
    feedback: feedback || "",
    notes: notes || "",
  });

  // Populate application details
  await interview.populate({
    path: "applicationId",
    populate: [
      { path: "studentId", select: "firstName lastName email" },
      { path: "jobId", select: "title" },
    ],
  });

  res.status(201).json({
    success: true,
    data: interview,
  });
});

// @desc    Get all interviews for a company
// @route   GET /api/interviews/company
// @access  Private (Company)
const getCompanyInterviews = asyncHandler(async (req, res) => {
  const interviews = await Interview.find()
    .populate({
      path: "applicationId",
      populate: [
        { path: "studentId", select: "firstName lastName email" },
        { path: "jobId", select: "title companyId" },
      ],
    })
    .sort({ createdAt: -1 });

  // Filter interviews for jobs belonging to the company
  const companyInterviews = interviews.filter(
    (interview) =>
      interview.applicationId.jobId.companyId.toString() ===
      req.user._id.toString()
  );

  res.json({
    success: true,
    data: companyInterviews,
  });
});

// @desc    Get interviews for a specific application
// @route   GET /api/interviews/application/:applicationId
// @access  Private (Company)
const getApplicationInterviews = asyncHandler(async (req, res) => {
  const { applicationId } = req.params;

  // Verify application belongs to company
  const application = await Application.findById(applicationId).populate(
    "jobId"
  );

  if (!application) {
    throw new ErrorResponse("Application not found", 404);
  }

  if (application.jobId.companyId.toString() !== req.user._id.toString()) {
    throw new ErrorResponse(
      "Not authorized to view interviews for this application",
      403
    );
  }

  const interviews = await Interview.find({ applicationId })
    .populate({
      path: "applicationId",
      populate: [
        { path: "studentId", select: "firstName lastName email" },
        { path: "jobId", select: "title" },
      ],
    })
    .sort({ interviewDate: 1 });

  res.json({
    success: true,
    data: interviews,
  });
});

// @desc    Update interview
// @route   PUT /api/interviews/:id
// @access  Private (Company)
const updateInterview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    interviewStage,
    interviewDate,
    interviewerName,
    feedback,
    result,
    notes,
  } = req.body;

  const interview = await Interview.findById(id).populate({
    path: "applicationId",
    populate: { path: "jobId" },
  });

  if (!interview) {
    throw new ErrorResponse("Interview not found", 404);
  }

  // Verify the interview belongs to company's job
  if (
    interview.applicationId.jobId.companyId.toString() !==
    req.user._id.toString()
  ) {
    throw new ErrorResponse("Not authorized to update this interview", 403);
  }

  // Validation: Cannot mark as pass/fail without proper scheduling
  if (result === "pass" || result === "fail") {
    // Check if interview is properly scheduled
    if (!interview.interviewDate || !interview.interviewerName) {
      throw new ErrorResponse(
        "Cannot complete interview. Interview must be properly scheduled with date and interviewer before marking as pass/fail.",
        400
      );
    }

    // Check if interview date has passed
    const interviewDate = new Date(interview.interviewDate);
    const currentDate = new Date();
    if (interviewDate > currentDate) {
      throw new ErrorResponse(
        "Cannot complete interview before the scheduled date.",
        400
      );
    }
  }

  const updatedInterview = await Interview.findByIdAndUpdate(
    id,
    {
      interviewStage,
      interviewDate,
      interviewerName,
      feedback,
      result,
      notes,
    },
    { new: true, runValidators: true }
  ).populate({
    path: "applicationId",
    populate: [
      { path: "studentId", select: "firstName lastName email" },
      { path: "jobId", select: "title" },
    ],
  });

  res.json({
    success: true,
    data: updatedInterview,
  });
});

// @desc    Delete interview
// @route   DELETE /api/interviews/:id
// @access  Private (Company)
const deleteInterview = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const interview = await Interview.findById(id).populate({
    path: "applicationId",
    populate: { path: "jobId" },
  });

  if (!interview) {
    throw new ErrorResponse("Interview not found", 404);
  }

  // Verify the interview belongs to company's job
  if (
    interview.applicationId.jobId.companyId.toString() !==
    req.user._id.toString()
  ) {
    throw new ErrorResponse("Not authorized to delete this interview", 403);
  }

  await Interview.findByIdAndDelete(id);

  res.json({
    success: true,
    data: {},
  });
});

// @desc    Get interview by ID
// @route   GET /api/interviews/:id
// @access  Private (Company)
const getInterview = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const interview = await Interview.findById(id).populate({
    path: "applicationId",
    populate: [
      { path: "studentId", select: "firstName lastName email" },
      { path: "jobId", select: "title" },
    ],
  });

  if (!interview) {
    throw new ErrorResponse("Interview not found", 404);
  }

  // Verify the interview belongs to company's job
  if (
    interview.applicationId.jobId.companyId.toString() !==
    req.user._id.toString()
  ) {
    throw new ErrorResponse("Not authorized to view this interview", 403);
  }

  res.json({
    success: true,
    data: interview,
  });
});

export {
  createInterview,
  getCompanyInterviews,
  getApplicationInterviews,
  updateInterview,
  deleteInterview,
  getInterview,
};
