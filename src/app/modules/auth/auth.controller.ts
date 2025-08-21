import catchAsync from "../../helpers/catchAsync";
import sendResponse from "../../helpers/sendResponse";
import httpStatus from 'http-status';
import ApiError from "../../errors/ApiErrors";
import { AuthServices } from "./auth.service";

// Step 1: Register with email
const registerWithEmail = catchAsync(async (req, res) => {
  const result = await AuthServices.registerWithEmail(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    data: result,
  });
});

// Step 1.5: Send email OTP
const sendEmailOTP = catchAsync(async (req, res) => {
  const result = await AuthServices.sendEmailOTP(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'OTP sent successfully',
    data: result,
  });
});

// Step 1.5: Verify email OTP
const verifyEmailOTP = catchAsync(async (req, res) => {
  const result = await AuthServices.verifyEmailOTP(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Email verified successfully',
    data: result,
  });
});

// Resend email OTP
const resendEmailOTP = catchAsync(async (req, res) => {
  const result = await AuthServices.resendEmailOTP(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'OTP resent successfully',
    data: result,
  });
});

// Change email
const changeEmail = catchAsync(async (req, res) => {
  const result = await AuthServices.changeEmail(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Email change request received',
    data: result,
  });
});

// Verify email change
const verifyEmailChange = catchAsync(async (req, res) => {
  const result = await AuthServices.verifyEmailChange(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Email changed successfully',
    data: result,
  });
});

// Step 2: Send phone OTP
const sendPhoneOTP = catchAsync(async (req, res) => {
  const result = await AuthServices.sendPhoneOTP(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'OTP sent successfully',
    data: result,
  });
});

// Step 3: Verify phone OTP
const verifyPhoneOTP = catchAsync(async (req, res) => {
  const result = await AuthServices.verifyPhoneOTP(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Phone verified successfully',
    data: result,
  });
});

// Step 4: Setup basic info
const setupBasicInfo = catchAsync(async (req, res) => {
  const { id } = req.user;
  const result = await AuthServices.setupBasicInfo(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Basic info updated successfully',
    data: result,
  });
});

// Step 5: Upload profile photos
const uploadProfilePhotos = catchAsync(async (req, res) => {
  const { id } = req.user;
  const files = req.files as { photos: Express.Multer.File[] };
  const result = await AuthServices.uploadProfilePhotos(id, files.photos, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Profile photos uploaded successfully',
    data: result,
  });
});

// Step 6: Record voice introduction
const recordVoiceIntroduction = catchAsync(async (req, res) => {
  const { id } = req.user;
  const file = req.file; // Audio file from multer
  const result = await AuthServices.recordVoiceIntroduction(id, req.body, file);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Voice introduction recorded successfully',
    data: result,
  });
});

// Step 7: Write bio
const writeBio = catchAsync(async (req, res) => {
  const { id } = req.user;
  const result = await AuthServices.writeBio(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Bio updated successfully',
    data: result,
  });
});

// Save voice text (Flutter থেকে আসা text)
const saveVoiceText = catchAsync(async (req, res) => {
  const { id } = req.user;
  const result = await AuthServices.saveVoiceText(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Voice text saved successfully',
    data: result,
  });
});

// Upload audio file
const uploadAudioFile = catchAsync(async (req, res) => {
  const { id } = req.user;
  const file = req.file;
  if (!file) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Audio file is required");
  }
  const result = await AuthServices.uploadAudioFile(id, file);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Audio file uploaded successfully',
    data: result,
  });
});

// Step 8: Upload identity document
const uploadIdentityDocument = catchAsync(async (req, res) => {
  const { id } = req.user;
  const file = req.file;
  if (!file) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Document file is required");
  }
  const result = await AuthServices.uploadIdentityDocument(id, file, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Identity document uploaded successfully',
    data: result,
  });
});

// Step 9: Upload income document
const uploadIncomeDocument = catchAsync(async (req, res) => {
  const { id } = req.user;
  const file = req.file;
  if (!file) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Document file is required");
  }
  const result = await AuthServices.uploadIncomeDocument(id, file, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Income document uploaded successfully',
    data: result,
  });
});

// Step 10: Set badge preferences
const setBadgePreferences = catchAsync(async (req, res) => {
  const { id } = req.user;
  const result = await AuthServices.setBadgePreferences(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Profile setup completed successfully',
    data: result,
  });
});

// Login user
const loginUser = catchAsync(async (req, res) => {
  const result = await AuthServices.loginUser(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'User logged in successfully',
    data: result,
  });
});



// Social login
const loginUserSocial = catchAsync(async (req, res) => {
  const result = await AuthServices.loginUserSocial(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "User logged in successfully",
    data: result,
  });
});



// Update profile
const updateProfile = catchAsync(async (req, res) => {
  const { id } = req.user;
  const result = await AuthServices.updateProfile(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Profile updated successfully",
    data: result,
  });
});

// Get user profile
const getUserProfile = catchAsync(async (req, res) => {
  const { id } = req.user;
  const result = await AuthServices.getUserProfile(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Profile fetched successfully",
    data: result,
  });
});

// Post profile record with audio
const postProfileRecord = catchAsync(async (req, res) => {
  const { id } = req.user;
  const file = req.file;
  if (!file) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Audio file is required");
  }
  const result = await AuthServices.postProfileRecord(id, req.body, file);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: "Profile record posted successfully",
    data: result,
  });
});

// Get profile records
const getProfileRecords = catchAsync(async (req, res) => {
  const { id } = req.user;
  const result = await AuthServices.getProfileRecords(id, req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Profile records fetched successfully",
    data: result,
  });
});

// Get other user's voice introduction
const getUserVoiceIntroduction = catchAsync(async (req, res) => {
  const { id } = req.user;
  const { userId } = req.params;
  const result = await AuthServices.getUserVoiceIntroduction(id, userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "User voice introduction fetched successfully",
    data: result,
  });
});

// Send voice message to another user
const sendVoiceMessage = catchAsync(async (req, res) => {
  const { id } = req.user;
  const file = req.file;
  if (!file) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Audio file is required");
  }

  // Parse the 'data' field from the request body, which is expected to be a JSON string
  let parsedData;
  try {
    parsedData = JSON.parse(req.body.data);
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid JSON format for 'data' field");
  }

  const result = await AuthServices.sendVoiceMessage(id, parsedData, file);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: "Voice message sent successfully",
    data: result,
  });
});

export const AuthControllers = {
  // Registration flow
  registerWithEmail,
  sendEmailOTP,
  verifyEmailOTP,
  resendEmailOTP,
  changeEmail,
  verifyEmailChange,
  sendPhoneOTP,
  verifyPhoneOTP,
  setupBasicInfo,
  uploadProfilePhotos,
  recordVoiceIntroduction,
  writeBio,
  saveVoiceText,
  uploadAudioFile,
  uploadIdentityDocument,
  uploadIncomeDocument,
  setBadgePreferences,
  
  // Login
  loginUser,
  loginUserSocial,
  
  // Profile management
  updateProfile,
  getUserProfile,
  postProfileRecord,
  getProfileRecords,
  getUserVoiceIntroduction,
  sendVoiceMessage,
};