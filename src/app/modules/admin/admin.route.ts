import express from 'express';
import { AdminControllers } from './admin.controller';
import { adminValidation } from './admin.validation';
import validateRequest from '../../middlewares/validateRequest';

const router = express.Router();

// Admin login
router.post(
  '/login',
  validateRequest(adminValidation.loginAdmin),
  AdminControllers.loginAdmin
);

// Forgot password
router.post(
  '/forgot-password',
  validateRequest(adminValidation.forgotPassword),
  AdminControllers.forgotPassword
);

// Verify OTP
router.post(
  '/verify-otp',
  validateRequest(adminValidation.verifyOTP),
  AdminControllers.verifyOTP
);

// Reset password
router.post(
  '/reset-password',
  validateRequest(adminValidation.resetPassword),
  AdminControllers.resetPassword
);

export const adminRoutes = router;
