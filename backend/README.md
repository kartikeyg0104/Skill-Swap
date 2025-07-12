# Skill-Swap Backend API

A comprehensive skill-sharing platform backend built with Node.js, Express, and Prisma.

## 🚀 Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Setup environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database URL and JWT secrets
   ```

3. **Setup database**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

4. **Start the server**
   ```bash
   npm run dev
   ```

Server runs on `http://localhost:3001`

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT
- **Security**: Helmet, CORS, Rate limiting
- **Validation**: Express-validator
- **File Upload**: Multer

## 📁 Project Structure

```
backend/
├── controllers/         # Business logic controllers
├── middleware/          # Custom middleware
├── routes/             # API routes
├── services/           # External services
├── prisma/             # Database schema and migrations
├── uploads/            # File upload directory
├── .env               # Environment variables
└── app.js             # Express app configuration
```

## 📚 API Documentation

### Base URL
```
http://localhost:3001/api
```

### Social Community Features
```
POST /api/social/posts                    - Create new post
GET  /api/social/feed                     - Get personalized feed
GET  /api/social/posts/public            - Get public feed
POST /api/social/posts/:postId/like      - Like/unlike post
POST /api/social/posts/:postId/bookmark  - Bookmark/unbookmark post
POST /api/social/posts/:postId/comments  - Add comment to post
GET  /api/social/posts/:postId/comments  - Get post comments
POST /api/social/users/:userId/follow    - Follow/unfollow user
GET  /api/social/users/:userId/followers - Get user followers
GET  /api/social/users/:userId/following - Get user following
GET  /api/social/users/:userId/stats     - Get user social stats
GET  /api/social/suggested-users         - Get suggested users to follow
GET  /api/social/trending                - Get trending topics/hashtags
```

### Enhanced Discovery
```
GET  /api/discovery/users                - Get users for discovery (enhanced)
GET  /api/discovery/categories           - Get popular skill categories
GET  /api/discovery/search              - Search users/skills (original)
GET  /api/discovery/suggestions         - Get skill suggestions
GET  /api/discovery/featured            - Get featured users
GET  /api/discovery/profile/:userId     - Get user profile (public)
```

### Authentication

**Register User**
```
POST /api/auth/register
```

Request:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "location": "New York, USA"
}
```

Response (201 Created):
```json
{
  "message": "User registered successfully. Please check your email for verification.",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "location": "New York, USA",
    "isVerified": false,
    "isPublic": true,
    "status": "ACTIVE",
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "verificationToken": "abc123def456..."
}
```

**Login User**
```
POST /api/auth/login
```

Request:
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

Response (200 OK):
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "location": "New York, USA",
    "isVerified": true,
    "status": "ACTIVE",
    "skillsOffered": [],
    "skillsWanted": [],
    "availability": [],
    "reputation": {
      "totalPoints": 0,
      "level": 1
    },
    "credits": {
      "balance": 10,
      "totalEarned": 0,
      "totalSpent": 0
    }
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### User Management

**Get User Profile**
```
GET /api/users/profile
Authorization: Bearer <token>
```

Response (200 OK):
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "bio": "Experienced developer passionate about sharing knowledge",
  "location": "New York, USA",
  "isVerified": true,
  "skillsOffered": [
    {
      "id": 1,
      "skillName": "JavaScript",
      "category": "Programming",
      "level": "ADVANCED",
      "description": "Full-stack JavaScript development"
    }
  ],
  "skillsWanted": [
    {
      "id": 1,
      "skillName": "Python",
      "priority": "HIGH",
      "targetLevel": "INTERMEDIATE",
      "description": "Data science and machine learning"
    }
  ],
  "reputation": {
    "totalPoints": 150,
    "level": 2,
    "averageRating": 4.8
  },
  "credits": {
    "balance": 25,
    "totalEarned": 50,
    "totalSpent": 25
  }
}
```

**Update User Profile**
```
PUT /api/users/profile
Authorization: Bearer <token>
```

Request:
```json
{
  "name": "John Smith",
  "bio": "Senior developer with 10+ years experience",
  "location": "San Francisco, CA",
  "isPublic": true
}
```

Response (200 OK):
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": 1,
    "name": "John Smith",
    "bio": "Senior developer with 10+ years experience",
    "location": "San Francisco, CA",
    "isPublic": true,
    "updatedAt": "2024-01-15T11:00:00.000Z"
  }
}
```

### Skills Management

**Add Skill Offered**
```
POST /api/skills/offered
Authorization: Bearer <token>
```

Request:
```json
{
  "skillName": "React.js",
  "category": "Web Development",
  "level": "ADVANCED",
  "description": "Modern React development with hooks and context"
}
```

Response (201 Created):
```json
{
  "message": "Skill added successfully",
  "skill": {
    "id": 2,
    "skillName": "React.js",
    "category": "Web Development",
    "level": "ADVANCED",
    "description": "Modern React development with hooks and context",
    "userId": 1,
    "createdAt": "2024-01-15T11:15:00.000Z"
  }
}
```

**Add Skill Wanted**
```
POST /api/skills/wanted
Authorization: Bearer <token>
```

Request:
```json
{
  "skillName": "Docker",
  "priority": "HIGH",
  "targetLevel": "INTERMEDIATE",
  "description": "Container orchestration and deployment"
}
```

Response (201 Created):
```json
{
  "message": "Skill wanted added successfully",
  "skill": {
    "id": 2,
    "skillName": "Docker",
    "priority": "HIGH",
    "targetLevel": "INTERMEDIATE",
    "description": "Container orchestration and deployment",
    "userId": 1,
    "createdAt": "2024-01-15T11:20:00.000Z"
  }
}
```

### Swap Requests

**Create Swap Request**
```
POST /api/swap-requests
Authorization: Bearer <token>
```

Request:
```json
{
  "receiverId": 2,
  "skillOffered": "JavaScript",
  "skillRequested": "Python",
  "message": "Hi! I'd love to learn Python from you in exchange for JavaScript tutoring.",
  "proposedSchedule": "2024-01-20T14:00:00Z",
  "format": "ONLINE",
  "duration": 60,
  "priority": "HIGH"
}
```

Response (201 Created):
```json
{
  "message": "Swap request created successfully",
  "swapRequest": {
    "id": 1,
    "requesterId": 1,
    "receiverId": 2,
    "skillOffered": "JavaScript",
    "skillRequested": "Python",
    "message": "Hi! I'd love to learn Python from you in exchange for JavaScript tutoring.",
    "proposedSchedule": "2024-01-20T14:00:00.000Z",
    "format": "ONLINE",
    "duration": 60,
    "priority": "HIGH",
    "status": "PENDING",
    "expiresAt": "2024-01-22T11:30:00.000Z",
    "requester": {
      "id": 1,
      "name": "John Doe",
      "profilePhoto": null
    },
    "receiver": {
      "id": 2,
      "name": "Jane Smith",
      "profilePhoto": null
    },
    "createdAt": "2024-01-15T11:30:00.000Z"
  }
}
```

**Get Swap Requests**
```
GET /api/swap-requests?type=received&status=PENDING
Authorization: Bearer <token>
```

Response (200 OK):
```json
{
  "swapRequests": [
    {
      "id": 1,
      "skillOffered": "Python",
      "skillRequested": "JavaScript",
      "message": "Would love to teach Python!",
      "status": "PENDING",
      "format": "ONLINE",
      "duration": 60,
      "proposedSchedule": "2024-01-20T14:00:00.000Z",
      "requester": {
        "id": 2,
        "name": "Jane Smith",
        "profilePhoto": null
      },
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalCount": 1,
    "hasNextPage": false
  }
}
```

**Accept Swap Request**
```
PUT /api/swap-requests/1/accept
Authorization: Bearer <token>
```

Response (200 OK):
```json
{
  "message": "Swap request accepted successfully",
  "swapRequest": {
    "id": 1,
    "status": "ACCEPTED",
    "acceptedAt": "2024-01-15T12:00:00.000Z"
  }
}
```

### User Availability

**Set Availability**
```
POST /api/users/availability
Authorization: Bearer <token>
```

Request:
```json
{
  "dayOfWeek": "MONDAY",
  "startTime": "09:00",
  "endTime": "17:00",
  "timezone": "America/New_York"
}
```

Response (201 Created):
```json
{
  "message": "Availability set successfully",
  "availability": {
    "id": 1,
    "userId": 1,
    "dayOfWeek": "MONDAY",
    "startTime": "09:00:00",
    "endTime": "17:00:00",
    "timezone": "America/New_York",
    "isActive": true,
    "createdAt": "2024-01-15T12:15:00.000Z"
  }
}
```

### Messaging

**Send Message**
```
POST /api/messages
Authorization: Bearer <token>
```

Request:
```json
{
  "receiverId": 2,
  "swapRequestId": 1,
  "content": "Hi! Looking forward to our skill swap session.",
  "messageType": "TEXT"
}
```

Response (201 Created):
```json
{
  "message": "Message sent successfully",
  "data": {
    "id": 1,
    "senderId": 1,
    "receiverId": 2,
    "swapRequestId": 1,
    "content": "Hi! Looking forward to our skill swap session.",
    "messageType": "TEXT",
    "isRead": false,
    "sender": {
      "id": 1,
      "name": "John Doe",
      "profilePhoto": null
    },
    "receiver": {
      "id": 2,
      "name": "Jane Smith",
      "profilePhoto": null
    },
    "createdAt": "2024-01-15T12:30:00.000Z"
  }
}
```

**Get Conversations**
```
GET /api/messages/conversations
Authorization: Bearer <token>
```

Response (200 OK):
```json
{
  "conversations": [
    {
      "userId": 2,
      "userName": "Jane Smith",
      "userPhoto": null,
      "lastMessage": "Hi! Looking forward to our skill swap session.",
      "lastMessageTime": "2024-01-15T12:30:00.000Z",
      "unreadCount": 0
    }
  ]
}
```

### Reviews

**Create Review**
```
POST /api/reviews/swap-requests/1
Authorization: Bearer <token>
```

Request:
```json
{
  "revieweeId": 2,
  "overall": 5,
  "teachingQuality": 5,
  "reliability": 4,
  "communication": 5,
  "review": "Excellent teacher! Very patient and knowledgeable.",
  "isPublic": true
}
```

Response (201 Created):
```json
{
  "message": "Review created successfully",
  "review": {
    "id": 1,
    "reviewerId": 1,
    "revieweeId": 2,
    "swapRequestId": 1,
    "overall": 5,
    "teachingQuality": 5,
    "reliability": 4,
    "communication": 5,
    "review": "Excellent teacher! Very patient and knowledgeable.",
    "isPublic": true,
    "createdAt": "2024-01-15T13:00:00.000Z"
  }
}
```

## 📊 Analytics

**Get Personal Dashboard**
```
GET /api/analytics/dashboard
Authorization: Bearer <token>
```

**Get Performance Metrics**
```
GET /api/analytics/performance
Authorization: Bearer <token>
```

**Get Learning Path**
```
GET /api/analytics/learning-path
Authorization: Bearer <token>
```

**Get Skill Analytics**
```
GET /api/analytics/skills
Authorization: Bearer <token>
```

## 🎮 Gamification

**Get User Achievements**
```
GET /api/gamification/achievements
Authorization: Bearer <token>
```

**Get Another User's Achievements**
```
GET /api/gamification/achievements/:userId
Authorization: Bearer <token>
```

**Get Credit Balance**
```
GET /api/gamification/credits
Authorization: Bearer <token>
```

Response (200 OK):
```json
{
  "balance": 150,
  "totalEarned": 500,
  "totalSpent": 350,
  "transactions": [
    {
      "type": "EARNED",
      "amount": 50,
      "description": "Completed skill swap session",
      "date": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

**Transfer Credits**
```
POST /api/gamification/credits/transfer
Authorization: Bearer <token>
```

Request:
```json
{
  "recipientId": 2,
  "amount": 25,
  "reason": "Payment for tutoring session"
}
```

**Get Progress Stats**
```
GET /api/gamification/progress
Authorization: Bearer <token>
```

## 🏆 Leaderboard

**Get Global Leaderboard**
```
GET /api/leaderboard
```

Response (200 OK):
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "userId": 15,
      "name": "Sarah Johnson",
      "profilePhoto": null,
      "totalPoints": 2500,
      "level": 8,
      "completedSwaps": 45,
      "badge": "Expert Teacher"
    }
  ]
}
```

**Get Skill Leaderboard**
```
GET /api/leaderboard/skills
```

**Get Community Stats**
```
GET /api/leaderboard/community-stats
```

**Get My Rank**
```
GET /api/leaderboard/my-rank
Authorization: Bearer <token>
```

## 🔧 Admin Management

**Get Admin Dashboard**
```
GET /api/admin/dashboard
Authorization: Bearer <admin-token>
```

**Get Users List**
```
GET /api/admin/users
Authorization: Bearer <admin-token>
```

**Update User Status**
```
PUT /api/admin/users/:userId/status
Authorization: Bearer <admin-token>
```

Request:
```json
{
  "status": "SUSPENDED",
  "reason": "Violation of terms of service"
}
```

**Get Reports**
```
GET /api/admin/reports
Authorization: Bearer <admin-token>
```

**Resolve Report**
```
PUT /api/admin/reports/:reportId/resolve
Authorization: Bearer <admin-token>
```

**Get Swap Monitoring**
```
GET /api/admin/swaps
Authorization: Bearer <admin-token>
```

**Get Content Moderation**
```
GET /api/admin/content
Authorization: Bearer <admin-token>
```

**Moderate Content**
```
POST /api/admin/content/moderate
Authorization: Bearer <admin-token>
```

**Get Admin Actions**
```
GET /api/admin/actions
Authorization: Bearer <admin-token>
```

## 📡 Communication (Admin)

**Create Broadcast Message**
```
POST /api/communication/broadcast
Authorization: Bearer <admin-token>
```

Request:
```json
{
  "title": "Platform Update",
  "content": "New features have been added to the platform",
  "target": "ALL_USERS",
  "priority": "HIGH"
}
```

**Send Targeted Notification**
```
POST /api/communication/notifications/targeted
Authorization: Bearer <admin-token>
```

**Create Email Campaign**
```
POST /api/communication/email/campaign
Authorization: Bearer <admin-token>
```

**Send Push Notification**
```
POST /api/communication/push
Authorization: Bearer <admin-token>
```

**Get Communication History**
```
GET /api/communication/history
Authorization: Bearer <admin-token>
```

**Get Communication Stats**
```
GET /api/communication/stats
Authorization: Bearer <admin-token>
```

## 📈 Reporting (Admin)

**Get User Activity Report**
```
GET /api/reporting/user-activity
Authorization: Bearer <admin-token>
```

**Get Swap Analytics Report**
```
GET /api/reporting/swap-analytics
Authorization: Bearer <admin-token>
```

**Get Revenue Tracking Report**
```
GET /api/reporting/revenue-tracking
Authorization: Bearer <admin-token>
```

**Get Feedback Analysis Report**
```
GET /api/reporting/feedback-analysis
Authorization: Bearer <admin-token>
```

**Generate Custom Report**
```
POST /api/reporting/custom
Authorization: Bearer <admin-token>
```

## 🛡️ Trust & Safety

**Request Verification**
```
POST /api/trust-safety/verify
Authorization: Bearer <token>
```

Request:
```json
{
  "type": "identity",
  "documents": ["passport", "utility_bill"]
}
```

**Get Verification Status**
```
GET /api/trust-safety/verification-status
Authorization: Bearer <token>
```

**Endorse Skill**
```
POST /api/trust-safety/endorse
Authorization: Bearer <token>
```

Request:
```json
{
  "userId": 2,
  "skillId": 5,
  "endorsementText": "Excellent React developer with deep knowledge"
}
```

**Report User**
```
POST /api/trust-safety/report
Authorization: Bearer <token>
```

Request:
```json
{
  "reportedUserId": 3,
  "reason": "INAPPROPRIATE_BEHAVIOR",
  "description": "User was unprofessional during our session"
}
```

**Get Trust Score**
```
GET /api/trust-safety/trust-score/:userId
Authorization: Bearer <token>
```

**Get Disputes**
```
GET /api/trust-safety/disputes
Authorization: Bearer <token>
```

**Create Dispute**
```
POST /api/trust-safety/disputes
Authorization: Bearer <token>
```

## 📝 Additional Endpoints

### Calendar Integration (OAuth)

**Initiate Google Auth**
```
GET /api/calendar/auth
Authorization: Bearer <token>
```

**Get Connection Status**
```
GET /api/calendar/connection
Authorization: Bearer <token>
```

**Schedule Meeting with Google Calendar**
```
POST /api/calendar/schedule
Authorization: Bearer <token>
```

**Update Session**
```
PUT /api/calendar/session/:sessionId
Authorization: Bearer <token>
```

**Cancel Session**
```
DELETE /api/calendar/session/:sessionId
Authorization: Bearer <token>
```

### Auth Endpoints

**Refresh Token**
```
POST /api/auth/refresh
```

Request:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Logout**
```
POST /api/auth/logout
Authorization: Bearer <token>
```

**Verify Email**
```
POST /api/auth/verify-email/:token
Authorization: Bearer <token>
```

**Get Current User**
```
GET /api/auth/me
Authorization: Bearer <token>
```

### Enhanced Messaging

**Get Unread Count**
```
GET /api/messages/unread-count
Authorization: Bearer <token>
```

**Get Messages with User**
```
GET /api/messages/user/:userId
Authorization: Bearer <token>
```

**Mark Message as Read**
```
PUT /api/messages/:messageId/read
Authorization: Bearer <token>
```

**Delete Message**
```
DELETE /api/messages/:messageId
Authorization: Bearer <token>
```

### Skills Management

**Update Skill Offered**
```
PUT /api/skills/offered/:id
Authorization: Bearer <token>
```

**Delete Skill Offered**
```
DELETE /api/skills/offered/:id
Authorization: Bearer <token>
```

**Update Skill Wanted**
```
PUT /api/skills/wanted/:id
Authorization: Bearer <token>
```

**Delete Skill Wanted**
```
DELETE /api/skills/wanted/:id
Authorization: Bearer <token>
```

**Get Skill Categories**
```
GET /api/skills/categories
```

### User Management

**Upload Profile Photo**
```
POST /api/users/upload-photo
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Change Password**
```
PUT /api/user/password
Authorization: Bearer <token>
```

Request:
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword456"
}
```

**Delete Account**
```
DELETE /api/user/account
Authorization: Bearer <token>
```

### Additional Review Endpoints

**Mark Review as Helpful**
```
POST /api/ratings/reviews/:reviewId/helpful
Authorization: Bearer <token>
```

**Report Review**
```
POST /api/ratings/reviews/:reviewId/report
Authorization: Bearer <token>
```

**Get User Rating Stats**
```
GET /api/ratings/users/:userId/rating-stats
Authorization: Bearer <token>
```

### Social Sharing

**Share Profile**
```
POST /api/social/share/profile
Authorization: Bearer <token>
```

**Share Skill**
```
POST /api/social/share/skill
Authorization: Bearer <token>
```

**Share Achievement**
```
POST /api/social/share/achievement
Authorization: Bearer <token>
```

**Generate Referral Link**
```
POST /api/social/referral
Authorization: Bearer <token>
```

**Import Social Profile**
```
POST /api/social/import-profile
Authorization: Bearer <token>
```

**Find Social Connections**
```
POST /api/social/find-connections
Authorization: Bearer <token>
```

**Get Social Stats**
```
GET /api/social/stats
Authorization: Bearer <token>
```

## 🆘 Support
