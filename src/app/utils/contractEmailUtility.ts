import { env } from 'process';
import config from '../../config';

const nodemailer = require('nodemailer');
const smtpTransporter = require('nodemailer-smtp-transport');
interface Attachment {
  filename: string;
  content?: Buffer | string;
  path?: string;
  contentType: string;
}
let contactEmailUtility = async (
  emailTo: string,
  emailFrom: string,
  EmailSubject: string,
  EmailHTML?: string, // HTML content as a parameter
  EmailText?: string,
  attachments?: Attachment[]
) => {
  let transporter = nodemailer.createTransport(
    smtpTransporter({
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

  let mailOption = {
    from: `<${config.emailSender.email}>`,
    to: emailTo,
    subject: EmailSubject,
    text: EmailText, // Optional: Add for plain text fallback
    html: EmailHTML, // HTML content
    attachments: attachments || [],
  };


  return await transporter.sendMail(mailOption);
};




export default contactEmailUtility;
