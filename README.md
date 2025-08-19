# VOXA - Voice-Based Social Platform

A modern voice-based social platform built with Node.js, Express, TypeScript, and MongoDB.

## Features

### 🔐 Authentication & Registration
- **Multi-step Registration Flow**: Complete mobile app registration process
- **Email Registration**: Secure email-based account creation
- **Phone Verification**: OTP-based phone number verification
- **Social Login**: Google, Facebook integration
- **Password Reset**: Secure password recovery with OTP
- **JWT Authentication**: Stateless authentication with refresh tokens

### 👤 Profile Management
- **Profile Setup**: Step-by-step profile completion
- **Photo Upload**: Multiple profile photos (1-4 photos)
- **Voice Introduction**: Record and upload voice messages
- **Bio Writing**: Short bio with character limit
- **Identity Verification**: Government ID upload and verification
- **Income Verification**: Income document upload and verification
- **Badge System**: Display verification badges on profile

### 💬 Real-time Messaging
- **Chat System**: Real-time messaging between users
- **Conversation Management**: List and manage conversations
- **Message History**: Complete chat history
- **Read Receipts**: Message read status tracking
- **Unread Count**: Track unread messages
- **WebSocket Integration**: Real-time message delivery

### 🔒 Security & Verification
- **Document Verification**: Identity and income verification
- **Badge Display**: Optional verification badge display
- **Profile Completion Tracking**: Track user profile completion progress
- **User Status Management**: Active, blocked, inactive status

## Tech Stack

- **Backend**: Node.js, Express.js, TypeScript
- **Database**: MongoDB with Prisma ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: WebSocket (ws)
- **File Upload**: AWS S3, Multer
- **Email**: Nodemailer
- **Payment**: Stripe
- **Validation**: Zod
- **Error Handling**: Custom error handling middleware

## Project Structure

```
src/
├── app/
│   ├── modules/
│   │   ├── auth/           # Authentication module
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.route.ts
│   │   │   └── auth.validation.ts
│   │   └── message/        # Messaging module
│   │       ├── message.controller.ts
│   │       ├── message.service.ts
│   │       ├── message.route.ts
│   │       └── message.validation.ts
│   ├── helpers/            # Helper functions
│   ├── middlewares/        # Custom middlewares
│   ├── lib/               # External service integrations
│   ├── utils/             # Utility functions
│   └── websocket/         # WebSocket service
├── config/                # Configuration files
└── types/                 # TypeScript type definitions
```

## Registration Flow

The mobile app follows a comprehensive 8-step registration process:

### Step 1: Email Registration
- User registers with email and password
- Email verification OTP sent
- Account created with `PENDING_VERIFICATION` status

### Step 2: Phone Verification
- User enters phone number
- OTP sent to phone
- Phone number verified

### Step 3: Basic Information
- Full name, date of birth
- Gender selection (Male/Female/Non-binary)
- Interest preference (Male/Female/Everyone)
- Distance preference (1-500km)

### Step 4: Profile Photos
- Upload 1-4 profile photos
- Select main profile photo
- Photo validation and storage

### Step 5: Voice Introduction
- Record voice introduction (1-300 seconds)
- Voice file upload and storage
- Duration tracking

### Step 6: Bio Writing
- Write short bio (max 200 characters)
- Bio validation and storage

### Step 7: Identity Verification
- Upload government ID document
- Document type selection
- Verification status tracking

### Step 8: Income Verification
- Upload income verification document
- Document type selection
- Verification status tracking

### Step 9: Badge Preferences
- Choose which verification badges to display
- Complete profile setup
- Account status changed to `ACTIVE`

## API Endpoints

### Authentication
- `POST /auth/register/email` - Register with email
- `POST /auth/phone/send-otp` - Send phone OTP
- `POST /auth/phone/verify-otp` - Verify phone OTP
- `POST /auth/login` - User login
- `POST /auth/login/admin` - Admin login
- `POST /auth/login/social` - Social login

### Profile Setup
- `POST /auth/profile/setup-basic-info` - Setup basic info
- `POST /auth/profile/upload-photos` - Upload profile photos
- `POST /auth/profile/record-voice` - Record voice introduction
- `POST /auth/profile/write-bio` - Write bio
- `POST /auth/profile/upload-identity` - Upload identity document
- `POST /auth/profile/upload-income` - Upload income document
- `POST /auth/profile/set-badges` - Set badge preferences

### Profile Management
- `GET /auth/profile` - Get user profile
- `PATCH /auth/profile` - Update profile

### Messaging
- `GET /messages/conversations/:userId` - Get conversations
- `GET /messages/:senderId/:receiverId` - Get chat history
- `POST /messages` - Send message
- `PATCH /messages/:messageId/read` - Mark message as read
- `GET /messages/unread/:userId` - Get unread count

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd komodoc
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file with the following variables:
   ```env
   DATABASE_URL="mongodb://localhost:27017/voxa"
   JWT_ACCESS_SECRET="your_access_secret"
   JWT_REFRESH_SECRET="your_refresh_secret"
   JWT_ACCESS_EXPIRES_IN="15m"
   JWT_REFRESH_EXPIRES_IN="7d"
   AWS_ACCESS_KEY_ID="your_aws_access_key"
   AWS_SECRET_ACCESS_KEY="your_aws_secret_key"
   AWS_REGION="your_aws_region"
   AWS_BUCKET_NAME="your_s3_bucket"
   STRIPE_SECRET_KEY="your_stripe_secret_key"
   ```

4. **Database Setup**
   ```bash
   npm run prisma:gen
   npm run db_push
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## Database Schema

### User Model
```prisma
model User {
  id                    String     @id @default(auto()) @map("_id") @db.ObjectId
  name                  String
  email                 String     @unique
  password              String?
  dateOfBirth           String?
  role                  Role       @default(USER)
  userStatus            UserStatus @default(ACTIVE)
  location              String?
  profilePicture        String?
  phone                 String?
  description           String?
  expertise             String?
  availability          String?
  hourlyRate            Float?
  isSocial              Boolean    @default(false)
  isVerified            Boolean    @default(false)
  
  // Profile fields
  gender                Gender?
  interestedIn          InterestedIn?
  distancePreference    Int?
  bio                   String?
  profilePhotos         String[]
  mainProfilePhoto      String?
  voiceIntroduction     String?
  voiceIntroductionDuration Int?
  
  // Verification fields
  identityVerified      Boolean    @default(false)
  incomeVerified        Boolean    @default(false)
  identityDocument      String?
  incomeDocument        String?
  identityVerificationStatus VerificationStatus @default(NOT_SUBMITTED)
  incomeVerificationStatus VerificationStatus @default(NOT_SUBMITTED)
  showIdentityBadge     Boolean    @default(false)
  showIncomeBadge       Boolean    @default(false)
  
  // OTP fields
  phoneOTP              String?
  phoneOTPExpires       DateTime?
  emailOTP              String?
  emailOTPExpires       DateTime?
  isPhoneVerified       Boolean    @default(false)
  isEmailVerified       Boolean    @default(false)
  
  // Profile completion
  profileCompletionStep Int        @default(0)
  
  createdAt             DateTime   @default(now())
  updatedAt             DateTime   @updatedAt
  
  // Relations
  sentMessages          Message[]
  receivedMessages      Message[]
}
```

## WebSocket Events

### Message Events
- `send_message` - Send a new message
- `new_message` - Receive a new message
- `message_sent` - Confirm message sent
- `message_read` - Message read confirmation

### Typing Events
- `typing_start` - User started typing
- `typing_stop` - User stopped typing
- `user_typing` - Receive typing status

### Status Events
- `user_status` - User online/offline status
- `connection_established` - WebSocket connection confirmed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For support and questions, please contact the development team.
