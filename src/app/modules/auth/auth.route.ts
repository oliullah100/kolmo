import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import auth from "../../middlewares/auth";
import { AuthControllers } from "./auth.controller";
import { authValidation } from "./auth.validation";

const router = express.Router();

// Registration flow routes
router.post(
  '/register/email',
  validateRequest(authValidation.registerWithEmail),
  AuthControllers.registerWithEmail
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
  validateRequest(authValidation.uploadProfilePhotos),
  AuthControllers.uploadProfilePhotos
);

router.post(
  '/profile/record-voice',
  auth(),
  validateRequest(authValidation.recordVoiceIntroduction),
  AuthControllers.recordVoiceIntroduction
);

router.post(
  '/profile/write-bio',
  auth(),
  validateRequest(authValidation.writeBio),
  AuthControllers.writeBio
);

router.post(
  '/profile/upload-identity',
  auth(),
  validateRequest(authValidation.uploadIdentityDocument),
  AuthControllers.uploadIdentityDocument
);

router.post(
  '/profile/upload-income',
  auth(),
  validateRequest(authValidation.uploadIncomeDocument),
  AuthControllers.uploadIncomeDocument
);

router.post(
  '/profile/set-badges',
  auth(),
  validateRequest(authValidation.setBadgePreferences),
  AuthControllers.setBadgePreferences
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