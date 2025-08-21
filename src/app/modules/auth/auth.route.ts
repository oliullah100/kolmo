import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import auth from "../../middlewares/auth";
import { AuthControllers } from "./auth.controller";
import { authValidation } from "./auth.validation";
import { fileUploader } from "../../middlewares/multerFileUploade";

const router = express.Router();

// Registration flow routes
router.post(
  '/register/email',
  validateRequest(authValidation.registerWithEmail),
  AuthControllers.registerWithEmail
);

router.post(
  '/send-email-otp',
  validateRequest(authValidation.sendEmailOTP),
  AuthControllers.sendEmailOTP
);

router.post(
  '/verify-email',
  validateRequest(authValidation.verifyEmailOTP),
  AuthControllers.verifyEmailOTP
);

router.post(
  '/resend-email-otp',
  validateRequest(authValidation.resendEmailOTP),
  AuthControllers.resendEmailOTP
);

router.post(
  '/change-email',
  validateRequest(authValidation.changeEmail),
  AuthControllers.changeEmail
);

router.post(
  '/verify-email-change',
  validateRequest(authValidation.verifyEmailChange),
  AuthControllers.verifyEmailChange
);

router.post(
  '/phone/send-otp',
  validateRequest(authValidation.sendPhoneOTP),
  AuthControllers.sendPhoneOTP
);

router.post(
  '/phone/verify-otp',
  validateRequest(authValidation.verifyPhoneOTP),
  AuthControllers.verifyPhoneOTP
);

// Profile setup routes (require authentication)
router.post(
  '/profile/setup-basic-info',
  auth(),
  validateRequest(authValidation.setupBasicInfo),
  AuthControllers.setupBasicInfo
);

router.post(
  '/profile/upload-photos',
  auth(),
  fileUploader.uploadProfilePhotos,
  validateRequest(authValidation.uploadProfilePhotos),
  AuthControllers.uploadProfilePhotos
);

router.post(
  '/profile/record-voice',
  auth(),
  fileUploader.uploadAudio,
  validateRequest(authValidation.recordVoiceIntroduction),
  AuthControllers.recordVoiceIntroduction
);

// Step 7: Write bio
router.post(
  '/profile/write-bio',
  auth(),
  validateRequest(authValidation.writeBio),
  AuthControllers.writeBio
);

// Save voice text (Flutter থেকে আসা text)
router.post(
  '/profile/save-voice-text',
  auth(),
  validateRequest(authValidation.saveVoiceText),
  AuthControllers.saveVoiceText
);

router.post(
  '/profile/upload-identity',
  auth(),
  fileUploader.uploadIdentityDocument,
  validateRequest(authValidation.uploadIdentityDocument),
  AuthControllers.uploadIdentityDocument
);

router.post(
  '/profile/upload-income',
  auth(),
  fileUploader.uploadIncomeDocument,
  validateRequest(authValidation.uploadIncomeDocument),
  AuthControllers.uploadIncomeDocument
);

router.post(
  '/profile/set-badges',
  auth(),
  validateRequest(authValidation.setBadgePreferences),
  AuthControllers.setBadgePreferences
);

// Upload audio file route
router.post(
  '/profile/upload-audio',
  auth(),
  fileUploader.uploadAudio,
  AuthControllers.uploadAudioFile
);

// New endpoint for posting user profile records with audio
router.post(
  '/profile/post-record',
  auth(),
  fileUploader.uploadAudio,
  validateRequest(authValidation.postProfileRecord),
  AuthControllers.postProfileRecord
);

// Get profile records (public and user's own)
router.get(
  '/profile/records',
  auth(),
  AuthControllers.getProfileRecords
);

// Get other user's voice introduction
router.get(
  '/profile/voice-introduction/:userId',
  auth(),
  AuthControllers.getUserVoiceIntroduction
);

// Send voice message to another user
router.post(
  '/profile/send-voice-message',
  auth(),
  fileUploader.uploadAudio,
  validateRequest(authValidation.sendVoiceMessage),
  AuthControllers.sendVoiceMessage
);

// Login routes
router.post(
  '/login',
  validateRequest(authValidation.loginUser),
  AuthControllers.loginUser
);

router.post(
  '/login/admin',
  validateRequest(authValidation.loginAdmin),
  AuthControllers.loginAdmin
);

router.post(
  '/login/social',
  validateRequest(authValidation.loginUserSocial),
  AuthControllers.loginUserSocial
);

// Password reset routes
router.post(
  '/forgot-password',
  validateRequest(authValidation.forgotPassword),
  AuthControllers.forgotPassword
);

router.post(
  '/verify-otp',
  validateRequest(authValidation.verifyOTP),
  AuthControllers.verifyOTP
);

router.post(
  '/reset-password',
  validateRequest(authValidation.resetPassword),
  AuthControllers.resetPassword
);

// Profile management routes (require authentication)
router.get(
  '/profile',
  auth(),
  AuthControllers.getUserProfile
);

router.patch(
  '/profile',
  auth(),
  validateRequest(authValidation.updateProfile),
  AuthControllers.updateProfile
);

export const AuthRoutes = router;