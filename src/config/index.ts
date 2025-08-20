import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.join(process.cwd(), ".env") });
export default {
  env: process.env.NODE_ENV,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS || 12,
  frontend_url: process.env.FRONTEND_URL,
  otp_expiry_time: process.env.OTP_ACCESS_EXPIRES_IN || "5",
  tax_code: process.env.TAX_CODE,

  super_admin_email: process.env.SUPER_ADMIN_EMAIL,
  super_admin_password: process.env.SUPER_ADMIN_PASSWORD,
  port: process.env.PORT || 5015,
  jwt: {
    access_secret: process.env.JWT_ACCESS_SECRET,
    access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN,
    refresh_token_secret: process.env.JWT_REFRESH_SECRET,
    refresh_token_expires_in: process.env.JWT_REFRESH_EXPIRES_IN,
    reset_pass_secret: process.env.JWT_RESET_PASS_SECRET,
    reset_pass_token_expires_in: process.env.JWT_RESET_PASS_EXPIRES_IN,
  },
  reset_pass_link: process.env.RESET_PASS_LINK,
  emailSender: {
    email: process.env.EMAIL,
    app_pass: process.env.EMAIL_PASSWORD,
    host: process.env.SMTP_TRANSPORTER_HOST,
    contact_mail: process.env.CONTACT_MAIL,
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    apiVersion: process.env.STRIPE_API_VERSION,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  },

  S3: {
    accessKeyId: process.env.S3_ACCESS_KEY || "",
    secretAccessKey: process.env.S3_SECRET_KEY || "",
    region: process.env.S3_REGION || "nyc3",
    bucketName: process.env.S3_BUCKET_NAME || "smtech-space",
    endpoint: process.env.S3_ENDPOINT || "https://nyc3.digitaloceanspaces.com",
    originEndpoint: process.env.S3_ORIGIN_ENDPOINT || "https://smtech-space.nyc3.digitaloceanspaces.com",
  },


  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
};
