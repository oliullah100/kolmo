import nodemailer from 'nodemailer';
import config from '../../config';
const smtpTransporter = require("nodemailer-smtp-transport");
export const sendEmailFn = async (email: string, otp: number, subject?: string, text?: string) => {
    const transporter = nodemailer.createTransport(
       smtpTransporter({
      // host: "mail.hasanmajedul.com", // FIXED: Removed ":2080"
      host: config.emailSender.host, // FIXED: Removed ":2080"
      // host: "smtp.google.com",
      // service: 'smtp',
      secure: true,
      port: 465,
      auth: {
        user: config.emailSender.email,
        pass: config.emailSender.app_pass,

      },
      tls: {
        rejectUnauthorized: false, // OPTIONAL: Bypass SSL issues (only if necessary)
      },
    })

    
    
    );
   

    // Set up email data
    const mailOptions = {
        from: `"grip" <${config.emailSender.email}>`, // Sender address
        to: email, // List of receivers
        subject: 'Your OTP Code', // Subject line
        // text: `Your OTP code is ${otp}` // Plain text body
        html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: #333;">Your OTP Code</h2>
                    <p style="font-size: 16px; color: #555;">Hello,</p>
                    <p style="font-size: 16px; color: #555;">Your OTP code is:</p>
                    <div style="text-align: center; margin: 20px 0;">
                        <span style="font-size: 24px; font-weight: bold; color: #333; padding: 10px 20px; border: 1px solid #ddd; border-radius: 5px; background-color: #f9f9f9;">${otp}</span>
                    </div>
                    <p style="font-size: 16px; color: #555;">Please use this code to complete your verification. This code is valid for 10 minutes.</p>
                    <p style="font-size: 16px; color: #555;">If you did not request this code, please ignore this email.</p>
                    <p style="font-size: 16px; color: #555;">Thank you,</p>
                    <p style="font-size: 16px; color: #555;">The EcomGrove Team</p>
                </div>` // HTML body
    };

    // Send mail with defined transport object
await transporter.sendMail(mailOptions);

}