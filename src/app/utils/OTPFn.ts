import prisma from '../lib/prisma';
import config from '../../config';

import sentEmailUtility from './sentEmailUtility';

export const OTPFn = async (email: string, userId: string, emailSubject: string ,identifier: string, emailTemplate: any) => {
    const OTP_EXPIRY_TIME = Number(config.otp_expiry_time) * 60 * 1000;
    const expiry = new Date(Date.now() + OTP_EXPIRY_TIME);
    const otpCode = Math.floor(100000 + Math.random() * 900000);    
    // const emailSubject = "OTP Verification";
    const emailText = `Your OTP is: ${otpCode}`;
    console.log(typeof emailTemplate)
    const emailHTML = emailTemplate(otpCode);
    await sentEmailUtility(email, emailSubject, emailHTML, emailText);
   
  // Find existing OTP for user
  const existingOTP = await prisma.oTP.findFirst({
    where: { userId },
  });

  if (existingOTP) {
    // Update existing OTP
    await prisma.oTP.update({
      where: { id: existingOTP.id },
      data: {
        otpCode: otpCode.toString(),
        hexCode: identifier,
        expiry,
      },
    });
  } else {
    // Create new OTP
    await prisma.oTP.create({
      data: {
        userId: userId,
        otpCode: otpCode.toString(),
        hexCode: identifier,
        expiry,
      },
    });
  }
    return 
}
//
// Verify OTP function
export const verifyOTP = async (email: string, otp: string) => {
  try {
    // For now, we'll use a simple verification
    // In production, you should verify against stored OTP in database
    const user = await prisma.user.findFirst({
      where: { email },
    });

    if (!user) {
      return false;
    }

    // Find OTP for user
        const otpRecord = await prisma.oTP.findFirst({
            where: { userId: user.id },
        });

        if (!otpRecord) {
            return false;
        }

        // Check OTP match and expiry
        if (
            otpRecord.otpCode === otp &&
            otpRecord.expiry > new Date()
        ) {
            return true;
        }

    // For development/testing, accept any 6-digit OTP
    // In production, verify against stored OTP
    // if (otp.length === 6 && /^\d{6}$/.test(otp)) {
    //   return true;
    // }

    return false;
  } catch (error) {
    console.error('OTP verification error:', error);
    return false;
  }
};

// Add verifyOTP to OTPFn object
OTPFn.verifyOTP = verifyOTP;