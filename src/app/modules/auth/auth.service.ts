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
import { S3Uploader } from "../../lib/S3Uploader";

// Step 1: Register with email
const registerWithEmail = async (payload: {
  email: string;
  password: string;
}) => {
  const isEmailValid = isValidEmail(payload.email);
  if (!isEmailValid) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email is not valid");
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
      profileCompletionStep: true,
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
    const emailHTML = emailTemplate(emailOTP);
    await sentEmailUtility(
      user.email,
      "Email Verification - VOXA",
      emailHTML
    );
  } catch (error) {
    console.error('Error sending email:', error);
  }

  return {
    user,
  };
};

// Step 1.5: Send email OTP for verification
const sendEmailOTP = async (payload: {
  email: string;
}) => {
  const isEmailValid = isValidEmail(payload.email);
  if (!isEmailValid) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email is not valid");
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!existingUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found. Please register first.");
  }

  // Check if user is already verified
  if (existingUser.userStatus === UserStatus.ACTIVE) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email is already verified");
  }

  // Generate OTP
  const emailOTP = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Update user with new OTP
  await prisma.user.update({
    where: { id: existingUser.id },
    data: {
      emailOTP,
      emailOTPExpires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    },
  });

  // Store email in temporary storage for verification
  const tempEmailKey = `temp_email_${emailOTP}`;
  (global as any)[tempEmailKey] = {
    email: payload.email,
    expires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
  };

  // Send email with OTP
  try {
    const emailHTML = emailTemplate(emailOTP);
    await sentEmailUtility(
      payload.email,
      "Email Verification - VOXA",
      emailHTML
    );
  } catch (error) {
    console.error('Error sending email:', error);
  }

  return {
    message: "OTP sent successfully",
    email: payload.email,
  };
};

// Step 1.5: Verify email OTP
const verifyEmailOTP = async (payload: {
  otp: string;
}) => {
  // Find email from temporary storage using OTP
  const tempEmailKey = `temp_email_${payload.otp}`;
  const tempEmailData = (global as any)[tempEmailKey];

  if (!tempEmailData) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid OTP");
  }

  if (new Date() > tempEmailData.expires) {
    // Clean up expired data
    delete (global as any)[tempEmailKey];
    throw new ApiError(httpStatus.BAD_REQUEST, "OTP has expired");
  }

  const user = await prisma.user.findUnique({
    where: { email: tempEmailData.email },
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

  // Clear OTP and update user status
  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailOTP: null,
      emailOTPExpires: null,
      userStatus: UserStatus.ACTIVE,
      profileCompletionStep: 2, // Email verified, move to next step
    },
  });

  // Clean up temporary storage
  delete (global as any)[tempEmailKey];

  return {
    message: "Email verified successfully",
    user: {
      id: user.id,
      email: user.email,
      profileCompletionStep: 2,
    },
  };
};

// Resend email OTP
const resendEmailOTP = async (payload: {
  email: string;
}) => {
  const isEmailValid = isValidEmail(payload.email);
  if (!isEmailValid) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email is not valid");
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!existingUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found. Please register first.");
  }

  // Check if user is already verified
  if (existingUser.userStatus === UserStatus.ACTIVE) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email is already verified");
  }

  // Generate new OTP
  const emailOTP = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Update user with new OTP
  await prisma.user.update({
    where: { id: existingUser.id },
    data: {
      emailOTP,
      emailOTPExpires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    },
  });

  // Store email in temporary storage for verification
  const tempEmailKey = `temp_email_${emailOTP}`;
  (global as any)[tempEmailKey] = {
    email: payload.email,
    expires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
  };

  // Send email with new OTP
  try {
    const emailHTML = emailTemplate(emailOTP);
    await sentEmailUtility(
      payload.email,
      "Email Verification - VOXA (Resent)",
      emailHTML
    );
  } catch (error) {
    console.error('Error sending email:', error);
  }

  return {
    message: "OTP resent successfully",
    email: payload.email,
  };
};

// Change email
const changeEmail = async (payload: {
  newEmail: string;
  currentEmail: string;
}) => {
  const isEmailValid = isValidEmail(payload.newEmail);
  if (!isEmailValid) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email is not valid");
  }

  // Check if new email is already registered
  const existingUserWithNewEmail = await prisma.user.findUnique({
    where: { email: payload.newEmail },
  });

  if (existingUserWithNewEmail) {
    throw new ApiError(httpStatus.CONFLICT, "This email is already registered");
  }

  // Find current user
  const currentUser = await prisma.user.findUnique({
    where: { email: payload.currentEmail },
  });

  if (!currentUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  // Generate OTP for new email verification
  const emailOTP = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Store temporary email change data
  const tempEmailChangeKey = `temp_email_change_${emailOTP}`;
  (global as any)[tempEmailChangeKey] = {
    userId: currentUser.id,
    currentEmail: payload.currentEmail,
    newEmail: payload.newEmail,
    expires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
  };

  // Send verification OTP to new email
  try {
    const emailHTML = emailTemplate(emailOTP);
    await sentEmailUtility(
      payload.newEmail,
      "Email Change Verification - VOXA",
      emailHTML
    );
  } catch (error) {
    console.error('Error sending email:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to send verification email");
  }

  return {
    message: "Verification OTP sent to new email. Please verify to complete email change.",
    newEmail: payload.newEmail,
  };
};

// Verify email change
const verifyEmailChange = async (payload: {
  otp: string;
}) => {
  // Find email change data from temporary storage using OTP
  const tempEmailChangeKey = `temp_email_change_${payload.otp}`;
  const tempEmailChangeData = (global as any)[tempEmailChangeKey];

  if (!tempEmailChangeData) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid OTP");
  }

  if (new Date() > tempEmailChangeData.expires) {
    // Clean up expired data
    delete (global as any)[tempEmailChangeKey];
    throw new ApiError(httpStatus.BAD_REQUEST, "OTP has expired");
  }

  // Update user's email
  const updatedUser = await prisma.user.update({
    where: { id: tempEmailChangeData.userId },
    data: {
      email: tempEmailChangeData.newEmail,
      userStatus: UserStatus.ACTIVE,
    },
    select: {
      id: true,
      email: true,
      userStatus: true,
    },
  });

  // Clean up temporary storage
  delete (global as any)[tempEmailChangeKey];

  return {
    message: "Email changed successfully",
    user: {
      id: updatedUser.id,
      email: updatedUser.email,
      userStatus: updatedUser.userStatus,
    },
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
const uploadProfilePhotos = async (userId: string, files: Express.Multer.File[], payload: {
  mainPhotoIndex?: number;
}) => {
  if (!files || files.length < 1 || files.length > 4) {
    throw new ApiError(httpStatus.BAD_REQUEST, "You must upload 1-4 photos");
  }

  // Upload files to S3
  const uploadResults = await S3Uploader.uploadMultipleFilesToS3(files, 'profile-photos');
  const photoUrls = uploadResults.map(result => result.Location);

  // Set main photo (default: first photo, index 0)
  const mainPhotoIndex = payload.mainPhotoIndex || 0;
  const mainProfilePhoto = photoUrls[mainPhotoIndex];
  
  console.log(`Main photo index: ${mainPhotoIndex}, Photo: ${mainProfilePhoto}`);

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      profilePhotos: photoUrls,
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
  };
};

// Step 6: Record voice introduction
const recordVoiceIntroduction = async (userId: string, payload: {
  voiceUrl?: string;
  duration: number;
}, file?: Express.Multer.File) => {
  if (payload.duration < 1 || payload.duration > 300) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Voice recording must be between 1-300 seconds");
  }

  let voiceUrl = payload.voiceUrl;

  // If audio file is uploaded, process it
  if (file) {
    // Check file type - more comprehensive MIME types
    const allowedMimeTypes = [
      'audio/mpeg', 
      'audio/mp3', 
      'audio/mp4',
      'audio/wav', 
      'audio/wave',
      'audio/x-wav',
      'audio/m4a', 
      'audio/aac',
      'audio/x-m4a',
      'audio/3gpp',
      'audio/3gpp2',
      'audio/ogg',
      'audio/webm'
    ];
    
    // Also check file extension as fallback
    const allowedExtensions = ['.mp3', '.wav', '.m4a', '.aac', '.ogg', '.webm'];
    const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
    
    if (!allowedMimeTypes.includes(file.mimetype) && !allowedExtensions.includes(fileExtension)) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid audio file type. Allowed: MP3, WAV, M4A, AAC, OGG, WEBM");
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Audio file size must be less than 10MB");
    }

    try {
      // Upload to S3
      const uploadResult = await S3Uploader.uploadToS3(file, 'voice-introductions');
      voiceUrl = uploadResult.Location;
    } catch (error) {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to upload audio file");
    }
  }

  // If no voiceUrl (either from payload or file upload), throw error
  if (!voiceUrl) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Voice URL or audio file is required");
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      voiceIntroduction: voiceUrl,
      voiceIntroductionDuration: Number(payload.duration), // Convert to number
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
  };
};

// Save voice text (Flutter থেকে আসা text)
const saveVoiceText = async (userId: string, payload: {
  voiceText: string;
  duration: number;
}) => {
  if (!payload.voiceText || payload.voiceText.trim().length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Voice text is required");
  }

  if (payload.voiceText.length > 500) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Voice text cannot exceed 500 characters");
  }

  if (payload.duration < 1 || payload.duration > 600) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Voice duration must be between 1-600 seconds");
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      voiceIntroduction: payload.voiceText, // Text save করছি
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
  };
};

// Upload audio file
const uploadAudioFile = async (userId: string, file: Express.Multer.File) => {
  if (!file) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Audio file is required");
  }

  // Check file type
  const allowedMimeTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/aac'];
  if (!allowedMimeTypes.includes(file.mimetype)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid audio file type. Allowed: MP3, WAV, M4A, AAC");
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Audio file size must be less than 10MB");
  }

  try {
    // Upload to S3
    const uploadResult = await S3Uploader.uploadToS3(file, 'audio');
    
    // Return the S3 URL
    return {
      url: uploadResult.Location,
      filename: file.originalname,
      size: file.size,
      message: "Audio file uploaded successfully"
    };
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to upload audio file");
  }
};

// Step 8: Upload identity document
const uploadIdentityDocument = async (userId: string, file: Express.Multer.File, payload: {
  documentType: 'GOVERNMENT_ID' | 'PASSPORT' | 'DRIVERS_LICENSE';
}) => {
  if (!file) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Document file is required");
  }

  // Check file type (images and PDFs)
  const allowedMimeTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
    'application/pdf', 'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (!allowedMimeTypes.includes(file.mimetype)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid file type. Allowed: JPG, PNG, PDF, DOC, DOCX");
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Document file size must be less than 10MB");
  }

  try {
    // Upload to S3
    const uploadResult = await S3Uploader.uploadToS3(file, 'identity-documents');
    
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        identityDocument: uploadResult.Location,
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
    };
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to upload identity document");
  }
};

// Step 9: Upload income document
const uploadIncomeDocument = async (userId: string, file: Express.Multer.File, payload: {
  documentType: 'PAY_STUB' | 'W2' | 'OFFER_LETTER' | 'BANK_STATEMENT';
}) => {
  if (!file) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Document file is required");
  }

  // Check file type (images and PDFs)
  const allowedMimeTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
    'application/pdf', 'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (!allowedMimeTypes.includes(file.mimetype)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid file type. Allowed: JPG, PNG, PDF, DOC, DOCX");
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Document file size must be less than 10MB");
  }

  try {
    // Upload to S3
    const uploadResult = await S3Uploader.uploadToS3(file, 'income-documents');
    
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        incomeDocument: uploadResult.Location,
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
    };
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to upload income document");
  }
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

// Post profile record with audio
const postProfileRecord = async (userId: string, payload: {
  title: string;
  description: string;
  duration: number;
  isPublic: boolean;
  tags?: string[];
}, file: Express.Multer.File) => {
  // Validate audio file
  const allowedMimeTypes = [
    'audio/mpeg', 
    'audio/mp3', 
    'audio/mp4',
    'audio/wav', 
    'audio/wave',
    'audio/x-wav',
    'audio/m4a', 
    'audio/aac',
    'audio/x-m4a',
    'audio/3gpp',
    'audio/3gpp2',
    'audio/ogg',
    'audio/webm'
  ];
  
  const allowedExtensions = ['.mp3', '.wav', '.m4a', '.aac', '.ogg', '.webm'];
  const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
  
  if (!allowedMimeTypes.includes(file.mimetype) && !allowedExtensions.includes(fileExtension)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid audio file type. Allowed: MP3, WAV, M4A, AAC, OGG, WEBM");
  }

  // Check file size (max 15MB for profile records)
  const maxSize = 15 * 1024 * 1024; // 15MB
  if (file.size > maxSize) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Audio file size must be less than 15MB");
  }

  // Validate duration
  if (payload.duration < 1 || payload.duration > 600) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Audio duration must be between 1-600 seconds");
  }

  let audioUrl: string;

  try {
    // Upload to S3
    const uploadResult = await S3Uploader.uploadToS3(file, 'profile-records');
    audioUrl = uploadResult.Location;
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to upload audio file");
  }

  // Create profile record
  const profileRecord = await prisma.profileRecord.create({
    data: {
      userId: userId,
      title: payload.title,
      description: payload.description,
      audioUrl: audioUrl,
      duration: payload.duration,
      isPublic: payload.isPublic,
      tags: payload.tags || [],
      playCount: 0,
      likeCount: 0,
    },
    select: {
      id: true,
      title: true,
      description: true,
      audioUrl: true,
      duration: true,
      isPublic: true,
      tags: true,
      playCount: true,
      likeCount: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          name: true,
          mainProfilePhoto: true,
        }
      }
    },
  });

  return {
    profileRecord,
    message: "Profile record posted successfully",
  };
};

// Get profile records
const getProfileRecords = async (userId: string, query: any) => {
  const { page = 1, limit = 10, userId: targetUserId } = query;
  const skip = (Number(page) - 1) * Number(limit);

  // Build where clause
  const whereClause: any = {
    OR: [
      { isPublic: true }, // Public records
      { userId: userId }  // User's own records
    ]
  };

  // If specific user ID is provided, filter by that user
  if (targetUserId) {
    whereClause.userId = targetUserId;
  }

  const [profileRecords, total, currentUser] = await Promise.all([
    prisma.profileRecord.findMany({
      where: whereClause,
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        audioUrl: true,
        duration: true,
        isPublic: true,
        tags: true,
        playCount: true,
        likeCount: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            mainProfilePhoto: true,
          }
        }
      },
    }),
    prisma.profileRecord.count({
      where: whereClause,
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        voiceIntroduction: true,
        voiceIntroductionDuration: true,
        mainProfilePhoto: true,
      },
    }),
  ]);

  const totalPages = Math.ceil(total / Number(limit));

  const response: any = {
    userVoiceIntroduction: currentUser ? {
      id: currentUser.id,
      name: currentUser.name,
      voiceIntroduction: currentUser.voiceIntroduction,
      voiceIntroductionDuration: currentUser.voiceIntroductionDuration,
      mainProfilePhoto: currentUser.mainProfilePhoto,
    } : null,
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages,
    },
  };

  // Only include profileRecords if there are records
  if (profileRecords.length > 0) {
    response.profileRecords = profileRecords;
  }

  return response;
};

// Get other user's voice introduction
const getUserVoiceIntroduction = async (currentUserId: string, targetUserId: string) => {
  // Check if target user exists
  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: {
      id: true,
      name: true,
      mainProfilePhoto: true,
      voiceIntroduction: true,
      voiceIntroductionDuration: true,
      userStatus: true,
    },
  });

  if (!targetUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  if (targetUser.userStatus !== 'ACTIVE') {
    throw new ApiError(httpStatus.FORBIDDEN, "User profile is not available");
  }

  if (!targetUser.voiceIntroduction) {
    throw new ApiError(httpStatus.NOT_FOUND, "User has no voice introduction");
  }

  return {
    user: {
      id: targetUser.id,
      name: targetUser.name,
      mainProfilePhoto: targetUser.mainProfilePhoto,
      voiceIntroduction: targetUser.voiceIntroduction,
      voiceIntroductionDuration: targetUser.voiceIntroductionDuration,
    },
  };
};

// Send voice message to another user
const sendVoiceMessage = async (senderId: string, payload: any, file: Express.Multer.File) => {
  // Extract data from payload
  const { receiverId, duration, message } = payload;
  
  // Validate required fields
  if (!receiverId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Receiver ID is required");
  }
  
  if (!duration) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Duration is required");
  }
  
  // Validate audio file
  const allowedMimeTypes = [
    'audio/mpeg', 
    'audio/mp3', 
    'audio/mp4',
    'audio/wav', 
    'audio/wave',
    'audio/x-wav',
    'audio/m4a', 
    'audio/aac',
    'audio/x-m4a',
    'audio/3gpp',
    'audio/3gpp2',
    'audio/ogg',
    'audio/webm'
  ];
  
  const allowedExtensions = ['.mp3', '.wav', '.m4a', '.aac', '.ogg', '.webm'];
  const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
  
  if (!allowedMimeTypes.includes(file.mimetype) && !allowedExtensions.includes(fileExtension)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid audio file type. Allowed: MP3, WAV, M4A, AAC, OGG, WEBM");
  }

  // Check file size (max 10MB for voice messages)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Audio file size must be less than 10MB");
  }

  // Validate duration
  if (payload.duration < 1 || payload.duration > 300) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Audio duration must be between 1-300 seconds");
  }

  // Check if receiver exists
  const receiver = await prisma.user.findUnique({
    where: { id: payload.receiverId },
    select: { id: true, userStatus: true },
  });

  if (!receiver) {
    throw new ApiError(httpStatus.NOT_FOUND, "Receiver not found");
  }

  if (receiver.userStatus !== 'ACTIVE') {
    throw new ApiError(httpStatus.FORBIDDEN, "Cannot send message to inactive user");
  }

  // Prevent sending message to self
  if (senderId === payload.receiverId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Cannot send message to yourself");
  }

  let audioUrl: string;

  try {
    // Upload to S3
    const uploadResult = await S3Uploader.uploadToS3(file, 'voice-messages');
    audioUrl = uploadResult.Location;
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to upload audio file");
  }

  // Create voice message record
  const voiceMessage = await prisma.voiceMessage.create({
    data: {
      senderId: senderId,
      receiverId: payload.receiverId,
      audioUrl: audioUrl,
      duration: Number(payload.duration), // Convert string to number
      message: payload.message || '',
      isRead: false,
    },
    select: {
      id: true,
      audioUrl: true,
      duration: true,
      message: true,
      isRead: true,
      createdAt: true,
      sender: {
        select: {
          id: true,
          name: true,
          mainProfilePhoto: true,
        }
      },
      receiver: {
        select: {
          id: true,
          name: true,
          mainProfilePhoto: true,
        }
      }
    },
  });

  return {
    voiceMessage,
    message: "Voice message sent successfully",
  };
};

export const AuthServices = {
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