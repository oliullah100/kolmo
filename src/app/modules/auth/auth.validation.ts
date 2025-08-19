import { z } from 'zod';

// Email registration schema
const registerWithEmail = z.object({
  body: z.object({
    email: z.string({
      required_error: 'Email is required',
    }).email('Invalid email format'),
    password: z.string({
      required_error: 'Password is required',
    }).min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string({
      required_error: 'Confirm password is required',
    }),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  }),
});

// Phone verification schema
const sendPhoneOTP = z.object({
  body: z.object({
    phone: z.string({
      required_error: 'Phone number is required',
    }).min(10, 'Phone number must be at least 10 digits'),
    countryCode: z.string({
      required_error: 'Country code is required',
    }).default('+88'),
  }),
});

const verifyPhoneOTP = z.object({
  body: z.object({
    phone: z.string({
      required_error: 'Phone number is required',
    }),
    otp: z.string({
      required_error: 'OTP is required',
    }).length(6, 'OTP must be 6 digits'),
  }),
});

// Profile setup schemas
const setupBasicInfo = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Full name is required',
    }).min(2, 'Name must be at least 2 characters'),
    dateOfBirth: z.string({
      required_error: 'Date of birth is required',
    }),
    gender: z.enum(['MALE', 'FEMALE', 'NON_BINARY'], {
      required_error: 'Gender is required',
    }),
    interestedIn: z.enum(['MALE', 'FEMALE', 'EVERYONE'], {
      required_error: 'Interest preference is required',
    }),
    distancePreference: z.number({
      required_error: 'Distance preference is required',
    }).min(1, 'Distance must be at least 1km').max(500, 'Distance cannot exceed 500km'),
  }),
});

const uploadProfilePhotos = z.object({
  body: z.object({
    photos: z.array(z.string().url('Invalid photo URL')).min(1, 'At least one photo is required').max(4, 'Maximum 4 photos allowed'),
    mainPhotoIndex: z.number().min(0).max(3).optional(),
  }),
});

const recordVoiceIntroduction = z.object({
  body: z.object({
    voiceUrl: z.string({
      required_error: 'Voice recording URL is required',
    }).url('Invalid voice URL'),
    duration: z.number({
      required_error: 'Voice duration is required',
    }).min(1, 'Duration must be at least 1 second').max(300, 'Duration cannot exceed 5 minutes'),
  }),
});

const writeBio = z.object({
  body: z.object({
    bio: z.string({
      required_error: 'Bio is required',
    }).min(1, 'Bio cannot be empty').max(200, 'Bio cannot exceed 200 characters'),
  }),
});

// Verification schemas
const uploadIdentityDocument = z.object({
  body: z.object({
    documentUrl: z.string({
      required_error: 'Document URL is required',
    }).url('Invalid document URL'),
    documentType: z.enum(['GOVERNMENT_ID', 'PASSPORT', 'DRIVERS_LICENSE'], {
      required_error: 'Document type is required',
    }),
  }),
});

const uploadIncomeDocument = z.object({
  body: z.object({
    documentUrl: z.string({
      required_error: 'Document URL is required',
    }).url('Invalid document URL'),
    documentType: z.enum(['PAY_STUB', 'W2', 'OFFER_LETTER', 'BANK_STATEMENT'], {
      required_error: 'Document type is required',
    }),
  }),
});

const setBadgePreferences = z.object({
  body: z.object({
    showIdentityBadge: z.boolean({
      required_error: 'Identity badge preference is required',
    }),
    showIncomeBadge: z.boolean({
      required_error: 'Income badge preference is required',
    }),
  }),
});

// Login schemas
const loginUser = z.object({
  body: z.object({
    email: z.string({
      required_error: 'Email is required',
    }).email('Invalid email format'),
    password: z.string({
      required_error: 'Password is required',
    }),
    rememberMe: z.boolean().optional(),
  }),
});

const loginAdmin = z.object({
  body: z.object({
    email: z.string({
      required_error: 'Email is required',
    }).email('Invalid email format'),
    password: z.string({
      required_error: 'Password is required',
    }),
    role: z.enum(['ADMIN', 'SUPER_ADMIN'], {
      required_error: 'Role is required',
    }),
    rememberMe: z.boolean().optional(),
  }),
});

const loginUserSocial = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Name is required',
    }),
    email: z.string({
      required_error: 'Email is required',
    }).email('Invalid email format'),
    role: z.enum(['USER', 'CONSULTANT'], {
      required_error: 'Role is required',
    }),
  }),
});

// Password reset schemas
const forgotPassword = z.object({
  body: z.object({
    email: z.string({
      required_error: 'Email is required',
    }).email('Invalid email format'),
  }),
});

const verifyOTP = z.object({
  body: z.object({
    email: z.string({
      required_error: 'Email is required',
    }).email('Invalid email format'),
    otp: z.string({
      required_error: 'OTP is required',
    }).length(6, 'OTP must be 6 digits'),
  }),
});

const resetPassword = z.object({
  body: z.object({
    email: z.string({
      required_error: 'Email is required',
    }).email('Invalid email format'),
    newPassword: z.string({
      required_error: 'New password is required',
    }).min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string({
      required_error: 'Confirm password is required',
    }),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  }),
});

// Profile update schema
const updateProfile = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    dateOfBirth: z.string().optional(),
    gender: z.enum(['MALE', 'FEMALE', 'NON_BINARY']).optional(),
    interestedIn: z.enum(['MALE', 'FEMALE', 'EVERYONE']).optional(),
    distancePreference: z.number().min(1).max(500).optional(),
    bio: z.string().max(200, 'Bio cannot exceed 200 characters').optional(),
    location: z.string().optional(),
    showIdentityBadge: z.boolean().optional(),
    showIncomeBadge: z.boolean().optional(),
  }),
});

export const authValidation = {
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
}; 