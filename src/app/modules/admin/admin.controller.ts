import catchAsync from "../../helpers/catchAsync";
import sendResponse from "../../helpers/sendResponse";
import httpStatus from 'http-status';
import { AdminServices } from "./admin.service";

// Login admin
const loginAdmin = catchAsync(async (req, res) => {
  const result = await AdminServices.loginAdmin(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Admin logged in successfully',
    data: result,
  });
});

// Forgot password
const forgotPassword = catchAsync(async (req, res) => {
  const result = await AdminServices.forgotPassword(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "OTP sent successfully",
    data: result,
  });
});

// Verify OTP
const verifyOTP = catchAsync(async (req, res) => {
  const result = await AdminServices.verifyOTP(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "OTP verified successfully",
    data: result,
  });
});

// Reset password
const resetPassword = catchAsync(async (req, res) => {
  const result = await AdminServices.resetPassword(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Password reset successfully",
    data: result,
  });
});

export const AdminControllers = {
  loginAdmin,
  forgotPassword,
  verifyOTP,
  resetPassword,
};
