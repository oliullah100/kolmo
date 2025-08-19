import catchAsync from "../../helpers/catchAsync";
import sendResponse from "../../helpers/sendResponse";
import httpStatus from 'http-status';
import { AuthServices } from "./auth.service";
import auth from "../../middlewares/auth";

// Step 1: Register with email
const registerWithEmail = catchAsync(async (req, res) => {
  const result = await AuthServices.registerWithEmail(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
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
  const { userId } = req.user;
  const result = await AuthServices.setupBasicInfo(userId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Basic info updated successfully',
    data: result,
  });
});

// Step 5: Upload profile photos
const uploadProfilePhotos = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const result = await AuthServices.uploadProfilePhotos(userId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Profile photos uploaded successfully',
    data: result,
  });
});

// Step 6: Record voice introduction
const recordVoiceIntroduction = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const result = await AuthServices.recordVoiceIntroduction(userId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Voice introduction recorded successfully',
    data: result,
  });
});

// Step 7: Write bio
const writeBio = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const result = await AuthServices.writeBio(userId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Bio updated successfully',
    data: result,
  });
});

// Step 8: Upload identity document
const uploadIdentityDocument = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const result = await AuthServices.uploadIdentityDocument(userId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Identity document uploaded successfully',
    data: result,
  });
});

// Step 9: Upload income document
const uploadIncomeDocument = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const result = await AuthServices.uploadIncomeDocument(userId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Income document uploaded successfully',
    data: result,
  });
});

// Step 10: Set badge preferences
const setBadgePreferences = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const result = await AuthServices.setBadgePreferences(userId, req.body);
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

// Login admin
const loginAdmin = catchAsync(async (req, res) => {
  const result = await AuthServices.loginAdmin(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Admin logged in successfully',
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

// Forgot password
const forgotPassword = catchAsync(async (req, res) => {
  const result = await AuthServices.forgotPassword(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "OTP sent successfully",
    data: result,
  });
});

// Verify OTP
const verifyOTP = catchAsync(async (req, res) => {
  const result = await AuthServices.verifyOTP(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "OTP verified successfully",
    data: result,
  });
});

// Reset password
const resetPassword = catchAsync(async (req, res) => {
  const result = await AuthServices.resetPassword(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Password reset successfully",
    data: result,
  });
});

// Update profile
const updateProfile = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const result = await AuthServices.updateProfile(userId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Profile updated successfully",
    data: result,
  });
});

// Get user profile
const getUserProfile = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const result = await AuthServices.getUserProfile(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Profile fetched successfully",
    data: result,
  });
});

export const AuthControllers = {
  // Registration flow
  registerWithEmail,
  sendPhoneOTP,
  verifyPhoneOTP,
  setupBasicInfo,
  uploadProfilePhotos,
  recordVoiceIntroduction,
  writeBio,
  uploadIdentityDocument,
  uploadIncomeDocument,
  setBadgePreferences,
  
  // Login
  loginUser,
  loginAdmin,
  loginUserSocial,
  
  // Password reset
  forgotPassword,
  verifyOTP,
  resetPassword,
  
  // Profile management
  updateProfile,
  getUserProfile,
};