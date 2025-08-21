import ApiError from "../../errors/ApiErrors";
import prisma from "../../lib/prisma";
import { isValidEmail } from "../../utils/isValidEmail";
import * as bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import { UserStatus, VerificationStatus } from "../../../generated/prisma";
import { jwtHelpers } from "../../helpers/jwtHelpers";
import config from "../../../config";
import { Secret } from "jsonwebtoken";
import { emailTemplate } from "../../utils/emailNotifications/emailHTML";
import sentEmailUtility from "../../utils/sentEmailUtility";

// Login admin
const loginAdmin = async (payload: {
  email: string;
  password: string;
  rememberMe?: boolean;
}) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  // Check if user is admin or super admin
  if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
    throw new ApiError(httpStatus.FORBIDDEN, "Access denied. Admin privileges required");
  }

  const isPasswordValid = await bcrypt.compare(payload.password, user.password!);
  if (!isPasswordValid) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid password");
  }

  const accessToken = jwtHelpers.generateToken(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    config.jwt.access_secret as Secret,
    config.jwt.access_expires_in as string
  );

  const refreshToken = jwtHelpers.generateToken(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    config.jwt.refresh_token_secret as Secret,
    config.jwt.refresh_token_expires_in as string
  );

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
};

// Forgot password
const forgotPassword = async (payload: { email: string }) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  const emailOTP = Math.floor(100000 + Math.random() * 900000).toString();
  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailOTP,
      emailOTPExpires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    },
  });

  try {
    const emailHTML = emailTemplate(emailOTP);
    await sentEmailUtility(
      user.email,
      "Password Reset - VOXA",
      emailHTML
    );
  } catch (error) {
    console.error('Error sending email:', error);
  }

  return {
    message: "OTP sent successfully",
  };
};

// Verify OTP
const verifyOTP = async (payload: { otp: string }) => {
  // Find user by OTP
  const user = await prisma.user.findFirst({
    where: { 
      emailOTP: payload.otp,
      emailOTPExpires: {
        gt: new Date() // OTP not expired
      }
    },
  });

  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid or expired OTP");
  }

  // Clear OTP after successful verification
  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailOTP: null,
      emailOTPExpires: null,
    },
  });

  return {
    message: "OTP verified successfully",
  };
};

// Reset password
const resetPassword = async (payload: {
  email: string;
  newPassword: string;
  confirmPassword: string;
}) => {
  if (payload.newPassword !== payload.confirmPassword) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Passwords don't match");
  }

  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  const hashedPassword = await bcrypt.hash(payload.newPassword, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
    },
  });

  return {
    message: "Password reset successfully",
  };
};

export const AdminServices = {
  loginAdmin,
  forgotPassword,
  verifyOTP,
  resetPassword,
};
