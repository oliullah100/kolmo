# VOXA API Documentation

## Base URL
```
http://localhost:5000/api/v1
```

## Authentication Endpoints

### 1. Registration Flow

#### 1.1 Register with Email
**POST** `/auth/register/email`

Register a new user with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**Response:**
```json
{
  "statusCode": 201,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "",
      "userStatus": "PENDING_VERIFICATION",
      "profileCompletionStep": 1,
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "message": "Registration successful. Please verify your email."
  }
}
```

#### 1.2 Send Phone OTP
**POST** `/auth/phone/send-otp`

Send OTP to phone number for verification.

**Request Body:**
```json
{
  "phone": "01712345678",
  "countryCode": "+88"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "OTP sent successfully",
  "data": {
    "message": "OTP sent successfully",
    "phone": "01712345678"
  }
}
```

#### 1.3 Verify Phone OTP
**POST** `/auth/phone/verify-otp`

Verify phone number with OTP.

**Request Body:**
```json
{
  "phone": "01712345678",
  "otp": "123456"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Phone verified successfully",
  "data": {
    "message": "Phone number verified successfully",
    "phone": "01712345678"
  }
}
```

#### 1.4 Setup Basic Info
**POST** `/auth/profile/setup-basic-info`

Setup basic user information (requires authentication).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "name": "John Doe",
  "dateOfBirth": "1990-01-01",
  "gender": "MALE",
  "interestedIn": "FEMALE",
  "distancePreference": 50
}
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Basic info updated successfully",
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "dateOfBirth": "1990-01-01",
      "gender": "MALE",
      "interestedIn": "FEMALE",
      "distancePreference": 50,
      "profileCompletionStep": 2
    },
    "message": "Basic information updated successfully"
  }
}
```

#### 1.5 Upload Profile Photos
**POST** `/auth/profile/upload-photos`

Upload profile photos (requires authentication).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "photos": [
    "https://example.com/photo1.jpg",
    "https://example.com/photo2.jpg"
  ],
  "mainPhotoIndex": 0
}
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Profile photos uploaded successfully",
  "data": {
    "user": {
      "id": "user_id",
      "profilePhotos": [
        "https://example.com/photo1.jpg",
        "https://example.com/photo2.jpg"
      ],
      "mainProfilePhoto": "https://example.com/photo1.jpg",
      "profileCompletionStep": 3
    },
    "message": "Profile photos uploaded successfully"
  }
}
```

#### 1.6 Record Voice Introduction
**POST** `/auth/profile/record-voice`

Record voice introduction (requires authentication).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "voiceUrl": "https://example.com/voice.mp3",
  "duration": 30
}
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Voice introduction recorded successfully",
  "data": {
    "user": {
      "id": "user_id",
      "voiceIntroduction": "https://example.com/voice.mp3",
      "voiceIntroductionDuration": 30,
      "profileCompletionStep": 4
    },
    "message": "Voice introduction recorded successfully"
  }
}
```

#### 1.7 Write Bio
**POST** `/auth/profile/write-bio`

Write user bio (requires authentication).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "bio": "I love traveling and meeting new people. Looking for meaningful connections."
}
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Bio updated successfully",
  "data": {
    "user": {
      "id": "user_id",
      "bio": "I love traveling and meeting new people. Looking for meaningful connections.",
      "profileCompletionStep": 5
    },
    "message": "Bio updated successfully"
  }
}
```

#### 1.8 Upload Identity Document
**POST** `/auth/profile/upload-identity`

Upload identity verification document (requires authentication).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "documentUrl": "https://example.com/id-document.pdf",
  "documentType": "GOVERNMENT_ID"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Identity document uploaded successfully",
  "data": {
    "user": {
      "id": "user_id",
      "identityDocument": "https://example.com/id-document.pdf",
      "identityVerificationStatus": "PENDING",
      "profileCompletionStep": 6
    },
    "message": "Identity document uploaded successfully. Verification pending."
  }
}
```

#### 1.9 Upload Income Document
**POST** `/auth/profile/upload-income`

Upload income verification document (requires authentication).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "documentUrl": "https://example.com/pay-stub.pdf",
  "documentType": "PAY_STUB"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Income document uploaded successfully",
  "data": {
    "user": {
      "id": "user_id",
      "incomeDocument": "https://example.com/pay-stub.pdf",
      "incomeVerificationStatus": "PENDING",
      "profileCompletionStep": 7
    },
    "message": "Income document uploaded successfully. Verification pending."
  }
}
```

#### 1.10 Set Badge Preferences
**POST** `/auth/profile/set-badges`

Set verification badge display preferences (requires authentication).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "showIdentityBadge": true,
  "showIncomeBadge": false
}
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Profile setup completed successfully",
  "data": {
    "user": {
      "id": "user_id",
      "showIdentityBadge": true,
      "showIncomeBadge": false,
      "profileCompletionStep": 8,
      "userStatus": "ACTIVE"
    },
    "message": "Profile setup completed successfully!"
  }
}
```

### 2. Login Endpoints

#### 2.1 User Login
**POST** `/auth/login`

Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "rememberMe": false
}
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "User logged in successfully",
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "user@example.com",
      "role": "USER",
      "profileCompletionStep": 8,
      "userStatus": "ACTIVE"
    },
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token"
  }
}
```

#### 2.2 Admin Login
**POST** `/auth/login/admin`

Login for admin users.

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "admin123",
  "role": "ADMIN"
}
```

#### 2.3 Social Login
**POST** `/auth/login/social`

Login with social media accounts.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "role": "USER"
}
```

### 3. Password Reset Endpoints

#### 3.1 Forgot Password
**POST** `/auth/forgot-password`

Send password reset OTP.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

#### 3.2 Verify OTP
**POST** `/auth/verify-otp`

Verify password reset OTP.

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

#### 3.3 Reset Password
**POST** `/auth/reset-password`

Reset password with new password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "newPassword": "newpassword123",
  "confirmPassword": "newpassword123"
}
```

### 4. Profile Management Endpoints

#### 4.1 Get User Profile
**GET** `/auth/profile`

Get current user's profile (requires authentication).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Profile fetched successfully",
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "user@example.com",
      "dateOfBirth": "1990-01-01",
      "gender": "MALE",
      "interestedIn": "FEMALE",
      "distancePreference": 50,
      "bio": "I love traveling...",
      "location": "Dhaka, Bangladesh",
      "profilePhotos": ["url1", "url2"],
      "mainProfilePhoto": "url1",
      "voiceIntroduction": "voice_url",
      "voiceIntroductionDuration": 30,
      "identityVerified": true,
      "incomeVerified": false,
      "showIdentityBadge": true,
      "showIncomeBadge": false,
      "profileCompletionStep": 8,
      "userStatus": "ACTIVE",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### 4.2 Update Profile
**PATCH** `/auth/profile`

Update user profile (requires authentication).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "name": "John Doe Updated",
  "bio": "Updated bio",
  "location": "Chittagong, Bangladesh",
  "showIdentityBadge": true,
  "showIncomeBadge": true
}
```

## Message Endpoints

### Get Conversations
**GET** `/messages/conversations/:userId`

Get all conversations for a user (requires authentication).

### Get Chat History
**GET** `/messages/:senderId/:receiverId`

Get chat history between two users (requires authentication).

### Send Message
**POST** `/messages`

Send a new message (requires authentication).

**Request Body:**
```json
{
  "receiverId": "receiver_user_id",
  "content": "Hello!",
  "messageType": "TEXT"
}
```

### Mark Message as Read
**PATCH** `/messages/:messageId/read`

Mark a message as read (requires authentication).

### Get Unread Count
**GET** `/messages/unread/:userId`

Get unread message count for a user (requires authentication).

## Error Responses

All endpoints return consistent error responses:

```json
{
  "statusCode": 400,
  "message": "Error message",
  "errorMessages": [
    {
      "path": "field_name",
      "message": "Field error message"
    }
  ],
  "stack": "Error stack trace (in development)"
}
```

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Profile Completion Steps

The registration flow tracks completion through steps:

1. **Step 1**: Email registration completed
2. **Step 2**: Basic info setup completed
3. **Step 3**: Profile photos uploaded
4. **Step 4**: Voice introduction recorded
5. **Step 5**: Bio written
6. **Step 6**: Identity document uploaded
7. **Step 7**: Income document uploaded
8. **Step 8**: Profile setup completed

## User Status

- **PENDING_VERIFICATION**: User registered but not fully verified
- **ACTIVE**: User is active and can use all features
- **BLOCKED**: User is blocked by admin
- **INACTIVE**: User account is inactive
