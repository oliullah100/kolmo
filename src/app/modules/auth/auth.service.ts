import ApiError from "../../errors/ApiErrors";
import prisma from "../../lib/prisma";
import { isValidEmail } from "../../utils/isValidEmail";
import * as bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import { UserStatus, VerificationStatus } from "../../../generated/prisma";
import { jwtHelpers } from "../../helpers/jwtHelpers";
import config from "../../../config";
import { Secret } from "jsonwebtoken";
import { OTPFn } from "../../utils/OTPFn";
import { emailTemplate } from "../../utils/emailNotifications/emailHTML";

// Step 1: Register with email
const registerWithEmail = async (payload: {
  email: string;
  password: string;
  confirmPassword: string;
}) => {
  const isEmailValid = isValidEmail(payload.email);
  if (!isEmailValid) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email is not valid");
  }

  if (payload.password !== payload.confirmPassword) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Password and confirm password do not match");
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (existingUser) {
    throw new ApiError(httpStatus.CONFLICT, "This email is already registered");
  }

  const hashedPassword = await bcrypt.hash(payload.password, 12);

  // Create user with initial data
  const user = await prisma.user.create({
    data: {
      email: payload.email.trim(),
      password: hashedPassword,
      name: '', // Will be set in profile setup
      userStatus: UserStatus.PENDING_VERIFICATION,
      profileCompletionStep: 1, // Email registration completed
    },
    select: {
      id: true,
      email: true,
      name: true,
      userStatus: true,
      profileCompletionStep: true,
      createdAt: true,
    },
  });

  // Send email verification OTP
  const emailOTP = Math.floor(100000 + Math.random() * 900000).toString();
  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailOTP,
      emailOTPExpires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    },
  });

  // Send email with OTP
  try {
    await emailTemplate({
      email: user.email,
      subject: "Email Verification",
      html: `
        <h2>Welcome to VOXA!</h2>
        <p>Your verification code is: <strong>${emailOTP}</strong></p>
        <p>This code will expire in 10 minutes.</p>
      `,
    });
  } catch (error) {
    console.error('Error sending email:', error);
  }

  return {
    user,
  };
};

// Step 2: Send phone OTP
const sendPhoneOTP = async (payload: {
  phone: string;
  countryCode: string;
}) => {
  const user = await prisma.user.findFirst({
    where: { phone: payload.phone },
  });

  if (user) {
    throw new ApiError(httpStatus.CONFLICT, "This phone number is already registered");
  }

  const phoneOTP = Math.floor(100000 + Math.random() * 900000).toString();
  
  // In a real app, you would integrate with SMS service here
  // For now, we'll just store the OTP
  console.log(`Phone OTP for ${payload.phone}: ${phoneOTP}`);

  return {
    message: "OTP sent successfully",
    phone: payload.phone,
  };
};

// Step 3: Verify phone OTP
const verifyPhoneOTP = async (payload: {
  phone: string;
  otp: string;
}) => {
  // In a real app, you would verify the OTP from your SMS service
  // For now, we'll just return success
  const phoneOTP = "123456"; // Mock OTP for testing

  if (payload.otp !== phoneOTP) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid OTP");
  }

  return {
    message: "Phone number verified successfully",
    phone: payload.phone,
  };
};

// Step 4: Setup basic info
const setupBasicInfo = async (userId: string, payload: {
  name: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'NON_BINARY';
  interestedIn: 'MALE' | 'FEMALE' | 'EVERYONE';
  distancePreference: number;
}) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      name: payload.name,
      dateOfBirth: payload.dateOfBirth,
      gender: payload.gender,
      interestedIn: payload.interestedIn,
      distancePreference: payload.distancePreference,
      profileCompletionStep: 2, // Basic info completed
    },
    select: {
      id: true,
      name: true,
      dateOfBirth: true,
      gender: true,
      interestedIn: true,
      distancePreference: true,
      profileCompletionStep: true,
    },
  });

  return {
    user,
    message: "Basic information updated successfully",
  };
};

// Step 5: Upload profile photos
const uploadProfilePhotos = async (userId: string, payload: {
  photos: string[];
  mainPhotoIndex?: number;
}) => {
  if (payload.photos.length < 1 || payload.photos.length > 4) {
    throw new ApiError(httpStatus.BAD_REQUEST, "You must upload 1-4 photos");
  }

  const mainPhotoIndex = payload.mainPhotoIndex || 0;
  const mainProfilePhoto = payload.photos[mainPhotoIndex];

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      profilePhotos: payload.photos,
      mainProfilePhoto,
      profileCompletionStep: 3, // Photos uploaded
    },
    select: {
      id: true,
      profilePhotos: true,
      mainProfilePhoto: true,
      profileCompletionStep: true,
    },
  });

  return {
    user,
    message: "Profile photos uploaded successfully",
  };
};

// Step 6: Record voice introduction
const recordVoiceIntroduction = async (userId: string, payload: {
  voiceUrl: string;
  duration: number;
}) => {
  if (payload.duration < 1 || payload.duration > 300) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Voice recording must be between 1-300 seconds");
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      voiceIntroduction: payload.voiceUrl,
      voiceIntroductionDuration: payload.duration,
      profileCompletionStep: 4, // Voice recorded
    },
    select: {
      id: true,
      voiceIntroduction: true,
      voiceIntroductionDuration: true,
      profileCompletionStep: true,
    },
  });

  return {
    user,
    message: "Voice introduction recorded successfully",
  };
};

// Step 7: Write bio
const writeBio = async (userId: string, payload: {
  bio: string;
}) => {
  if (payload.bio.length > 200) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Bio cannot exceed 200 characters");
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      bio: payload.bio,
      profileCompletionStep: 5, // Bio written
    },
    select: {
      id: true,
      bio: true,
      profileCompletionStep: true,
    },
  });

  return {
    user,
    message: "Bio updated successfully",
  };
};

// Step 8: Upload identity document
const uploadIdentityDocument = async (userId: string, payload: {
  documentUrl: string;
  documentType: 'GOVERNMENT_ID' | 'PASSPORT' | 'DRIVERS_LICENSE';
}) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      identityDocument: payload.documentUrl,
      identityVerificationStatus: VerificationStatus.PENDING,
      profileCompletionStep: 6, // Identity document uploaded
    },
    select: {
      id: true,
      identityDocument: true,
      identityVerificationStatus: true,
      profileCompletionStep: true,
    },
  });

  return {
    user,
    message: "Identity document uploaded successfully. Verification pending.",
  };
};

// Step 9: Upload income document
const uploadIncomeDocument = async (userId: string, payload: {
  documentUrl: string;
  documentType: 'PAY_STUB' | 'W2' | 'OFFER_LETTER' | 'BANK_STATEMENT';
}) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      incomeDocument: payload.documentUrl,
      incomeVerificationStatus: VerificationStatus.PENDING,
      profileCompletionStep: 7, // Income document uploaded
    },
    select: {
      id: true,
      incomeDocument: true,
      incomeVerificationStatus: true,
      profileCompletionStep: true,
    },
  });

  return {
    user,
    message: "Income document uploaded successfully. Verification pending.",
  };
};

// Step 10: Set badge preferences
const setBadgePreferences = async (userId: string, payload: {
  showIdentityBadge: boolean;
  showIncomeBadge: boolean;
}) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      showIdentityBadge: payload.showIdentityBadge,
      showIncomeBadge: payload.showIncomeBadge,
      profileCompletionStep: 8, // Profile setup completed
      userStatus: UserStatus.ACTIVE,
    },
    select: {
      id: true,
      showIdentityBadge: true,
      showIncomeBadge: true,
      profileCompletionStep: true,
      userStatus: true,
    },
  });

  return {
    user,
    message: "Profile setup completed successfully!",
  };
};

// Login user
const loginUser = async (payload: {
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

  if (!user.password) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Please login with your social account");
  }

  const isPasswordValid = await bcrypt.compare(payload.password, user.password);
  if (!isPasswordValid) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid password");
  }

  if (user.userStatus !== UserStatus.ACTIVE) {
    throw new ApiError(httpStatus.FORBIDDEN, "Account is not active");
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
      profileCompletionStep: user.profileCompletionStep,
      userStatus: user.userStatus,
    },
    accessToken,
    refreshToken,
  };
};

// Login admin
const loginAdmin = async (payload: {
  email: string;
  password: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
  rememberMe?: boolean;
}) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  if (user.role !== payload.role) {
    throw new ApiError(httpStatus.FORBIDDEN, "Access denied");
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

// Social login
const loginUserSocial = async (payload: {
  name: string;
  email: string;
  role: 'USER' | 'CONSULTANT';
}) => {
  let user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!user) {
    // Create new user for social login
    user = await prisma.user.create({
      data: {
        name: payload.name,
        email: payload.email,
        role: payload.role,
        isSocial: true,
        userStatus: UserStatus.ACTIVE,
        profileCompletionStep: 0, // Social users start from beginning
      },
    });
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
      profileCompletionStep: user.profileCompletionStep,
      userStatus: user.userStatus,
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
    await emailTemplate({
      email: user.email,
      subject: "Password Reset",
      html: `
        <h2>Password Reset Request</h2>
        <p>Your verification code is: <strong>${emailOTP}</strong></p>
        <p>This code will expire in 10 minutes.</p>
      `,
    });
  } catch (error) {
    console.error('Error sending email:', error);
  }

  return {
    message: "OTP sent successfully",
  };
};

// Verify OTP
const verifyOTP = async (payload: { email: string; otp: string }) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  if (!user.emailOTP || !user.emailOTPExpires) {
    throw new ApiError(httpStatus.BAD_REQUEST, "No OTP found");
  }

  if (new Date() > user.emailOTPExpires) {
    throw new ApiError(httpStatus.BAD_REQUEST, "OTP has expired");
  }

  if (user.emailOTP !== payload.otp) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid OTP");
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

// Update profile
const updateProfile = async (userId: string, payload: {
  name?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'NON_BINARY';
  interestedIn?: 'MALE' | 'FEMALE' | 'EVERYONE';
  distancePreference?: number;
  bio?: string;
  location?: string;
  showIdentityBadge?: boolean;
  showIncomeBadge?: boolean;
}) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: payload,
    select: {
      id: true,
      name: true,
      dateOfBirth: true,
      gender: true,
      interestedIn: true,
      distancePreference: true,
      bio: true,
      location: true,
      showIdentityBadge: true,
      showIncomeBadge: true,
      profileCompletionStep: true,
    },
  });

  return {
    user,
    message: "Profile updated successfully",
  };
};

// Get user profile
const getUserProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      dateOfBirth: true,
      gender: true,
      interestedIn: true,
      distancePreference: true,
      bio: true,
      location: true,
      profilePhotos: true,
      mainProfilePhoto: true,
      voiceIntroduction: true,
      voiceIntroductionDuration: true,
      identityVerified: true,
      incomeVerified: true,
      showIdentityBadge: true,
      showIncomeBadge: true,
      profileCompletionStep: true,
      userStatus: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  return {
    user,
  };
};

export const AuthServices = {
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