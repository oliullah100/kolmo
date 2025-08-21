import { z } from 'zod';

// Login admin schema
const loginAdmin = z.object({
  body: z.object({
    email: z.string({
      required_error: 'Email is required',
    }).email('Invalid email format'),
    password: z.string({
      required_error: 'Password is required',
    }).min(6, 'Password must be at least 6 characters'),
    rememberMe: z.boolean().optional(),
  }),
});

// Forgot password schema
const forgotPassword = z.object({
  body: z.object({
    email: z.string({
      required_error: 'Email is required',
    }).email('Invalid email format'),
  }),
});

// Verify OTP schema
const verifyOTP = z.object({
  body: z.object({
    otp: z.string({
      required_error: 'OTP is required',
    }).length(6, 'OTP must be 6 digits'),
  }),
});

// Reset password schema
const resetPassword = z.object({
  body: z.object({
    email: z.string({
      required_error: 'Email is required',
    }).email('Invalid email format'),
    newPassword: z.string({
      required_error: 'New password is required',
    }).min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string({
      required_error: 'Confirm password is required',
    }),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  }),
});

export const adminValidation = {
  loginAdmin,
  forgotPassword,
  verifyOTP,
  resetPassword,
};
