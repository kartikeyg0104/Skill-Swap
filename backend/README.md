# Skill-Swap Backend

A comprehensive skill-sharing platform backend built with Node.js, Express, and Prisma.

## 🚀 Features

### Core Features
- **User Authentication & Profile Management**
  - Multi-modal registration (Email, OAuth)
  - Profile verification and skill management
  - Availability settings and privacy controls

### Discovery & Search
- **Smart Search System**
  - Keyword-based skill search with auto-suggestions
  - Advanced filters (location, skill level, ratings)
  - Featured users and skill categories

### Swap Management
- **Request Management**
  - Create, accept, decline swap requests
  - Scheduling integration and tracking
  - Real-time status updates

### Rating & Feedback
- **Multi-dimensional Rating System**
  - Overall, teaching quality, reliability, communication
  - Written reviews with moderation
  - Feedback analytics

### Gamification
- **Achievement System**
  - Automated badge awards
  - Credit banking system
  - Leaderboards and progress tracking

### Communication
- **Messaging & Video**
  - Secure in-app messaging with file sharing
  - Video conferencing integration
  - Session recording capabilities

### Trust & Safety
- **Verification & Security**
  - Multi-level verification badges
  - AI-calculated trust scores
  - Reporting and dispute resolution

### Social Integration
- **Social Media Features**
  - Profile and achievement sharing
  - Viral referral system
  - Social login and profile import

### Analytics
- **Comprehensive Analytics**
  - Personal dashboards
  - Platform analytics
  - Learning path recommendations

### Admin Features
- **Complete Admin Dashboard**
  - User management and moderation
  - Content review system
  - Real-time monitoring

### Communication Tools
- **Broadcast Messaging**
  - Platform-wide announcements
  - Targeted user notifications
  - Email campaigns and automation
  - Push notifications

### Reporting & Analytics
- **Advanced Reporting**
  - User activity and engagement reports
  - Swap analytics and success metrics
  - Revenue tracking and credit analytics
  - Feedback sentiment analysis
  - Custom report generation
  - CSV/PDF export capabilities

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with OAuth integration (Passport.js)
- **Security**: Helmet, CORS, Rate limiting
- **Validation**: Express-validator
- **File Upload**: Multer (with Cloudinary/Firebase integration)
- **Email**: Nodemailer
- **Reports**: JSON2CSV, PDFKit
- **Real-time**: Socket.io for real-time updates

## 📁 Project Structure

```
backend/
├── controllers/         # Business logic controllers
│   ├── authController.js
│   ├── userController.js
│   ├── skillController.js
│   ├── swapRequestController.js
│   ├── ratingController.js
│   ├── messagingController.js
│   ├── adminController.js
│   └── ...
├── middleware/          # Custom middleware
│   ├── auth.js
│   ├── validation.js
│   ├── upload.js
│   └── errorHandler.js
├── routes/             # API routes
│   ├── auth.js
│   ├── user.js
│   ├── skills.js
│   ├── swaps.js
│   └── ...
├── services/           # External services
│   ├── emailService.js
│   ├── cloudinaryService.js
│   └── socketService.js
├── prisma/             # Database schema and migrations
│   ├── schema.prisma
│   └── migrations/
├── uploads/            # File upload directory
├── .env               # Environment variables
├── app.js             # Express app configuration
└── server.js          # Server entry point
```

## 📚 Complete API Documentation

### Authentication & OAuth
```
POST /api/auth/register              - User registration
POST /api/auth/login                 - User login  
POST /api/auth/refresh               - Refresh JWT token
POST /api/auth/logout                - User logout
GET  /api/auth/me                    - Get current user
POST /api/auth/verify-email/:token   - Email verification

# OAuth Routes
GET  /api/auth/google                - Google OAuth login
GET  /api/auth/google/callback       - Google OAuth callback
GET  /api/auth/facebook              - Facebook OAuth login
GET  /api/auth/facebook/callback     - Facebook OAuth callback
GET  /api/auth/twitter               - Twitter OAuth login
GET  /api/auth/twitter/callback      - Twitter OAuth callback
```

### User Management (As per requirements)
```
GET  /api/users/:id                  - Get public user profile
PUT  /api/users/:id                  - Update user profile (protected)
POST /api/users/upload-photo         - Upload profile picture
GET  /api/users/skills               - Get user's skills
POST /api/users/skills               - Add new skill
PUT  /api/users/skills/:id           - Update skill
DELETE /api/users/skills/:id         - Remove skill
```

### Swap Request System (As per requirements)
```
POST /api/swaps                      - Create swap request
GET  /api/swaps/sent                 - Get sent swap requests
GET  /api/swaps/received             - Get received swap requests
PUT  /api/swaps/:id/accept           - Accept swap request
PUT  /api/swaps/:id/decline          - Decline swap request
DELETE /api/swaps/:id                - Cancel swap request
GET  /api/swaps/:id                  - Get swap details
PUT  /api/swaps/:id/status           - Update swap status
```

### Rating & Feedback System (As per requirements)
```
POST /api/reviews                    - Create review after swap
GET  /api/reviews/user/:userId       - Get reviews for user
GET  /api/reviews/swap/:swapId       - Get reviews for swap
PUT  /api/reviews/:id                - Update review
DELETE /api/reviews/:id              - Delete review
POST /api/reviews/:id/helpful        - Mark review helpful
```

### Admin Panel (As per requirements)
```
GET  /api/admin/users                - View all users
PUT  /api/admin/users/:id/ban        - Ban user
PUT  /api/admin/users/:id/unban      - Unban user
GET  /api/admin/swaps                - Monitor all swaps
GET  /api/admin/reports              - Download CSV reports
GET  /api/admin/stats                - Platform statistics
POST /api/admin/broadcast            - Send platform announcements
```

### Discovery & Search
```
GET /api/discovery/search            - Search users/skills
GET /api/discovery/suggestions       - Get skill suggestions
GET /api/discovery/featured          - Get featured users
GET /api/discovery/categories        - Get skill categories
```

### Social Media Integration
```
POST /api/social/share/profile       - Share profile on social media
POST /api/social/share/skill         - Share specific skill
POST /api/social/import              - Import social media profile
GET  /api/social/connections         - Find social connections
```

### Real-time Features (Socket.io)
```
WebSocket Events:
- swap_request_received             - New swap request notification
- swap_status_updated              - Swap status change
- message_received                 - New message notification
- user_online                      - User online status
```

## 📝 API Request/Response Examples

Below are examples of request payloads and responses for key endpoints to facilitate frontend integration.

### Authentication

**Register User**
```
POST /api/auth/register
```

Request:
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "location": "New York, USA"
}
```

Response (201 Created):
```json
{
  "success": true,
  "message": "Registration successful. Please verify your email.",
  "user": {
    "id": "usr_123456",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "isVerified": false,
    "createdAt": "2023-07-15T14:30:45.123Z"
  }
}
```

**Login User**
```
POST /api/auth/login
```

Request:
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

Response (200 OK):
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "usr_123456",
    "firstName": "John",
    "lastName": "Doe",
    "email": "user@example.com",
    "isVerified": true,
    "role": "USER"
  }
}
```

### User Management

**Get User Profile**
```
GET /api/users/:id
```

Response (200 OK):
```json
{
  "success": true,
  "user": {
    "id": "usr_123456",
    "firstName": "John",
    "lastName": "Doe",
    "bio": "Passionate software developer with 5 years experience",
    "location": "New York, USA",
    "profilePicture": "https://cloudinary.com/skillswap/profiles/user123.jpg",
    "averageRating": 4.8,
    "skills": [
      {
        "id": "skl_789012",
        "name": "JavaScript Programming",
        "category": "TECHNOLOGY",
        "level": "ADVANCED",
        "description": "Modern JavaScript including ES6+ features"
      },
      {
        "id": "skl_789013",
        "name": "Piano",
        "category": "MUSIC",
        "level": "INTERMEDIATE",
        "description": "Classical and jazz piano"
      }
    ],
    "completedSwaps": 15,
    "memberSince": "2023-01-15T00:00:00.000Z",
    "badges": ["Verified", "Top Contributor", "Quick Responder"]
  }
}
```

**Update User Profile**
```
PUT /api/users/:id
```

Request:
```json
{
  "bio": "Full-stack developer with expertise in React and Node.js",
  "location": "Brooklyn, NY",
  "availableDays": ["MONDAY", "WEDNESDAY", "FRIDAY"],
  "availableHours": {
    "from": "18:00",
    "to": "21:00"
  }
}
```

Response (200 OK):
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "id": "usr_123456",
    "firstName": "John",
    "lastName": "Doe",
    "bio": "Full-stack developer with expertise in React and Node.js",
    "location": "Brooklyn, NY",
    "availableDays": ["MONDAY", "WEDNESDAY", "FRIDAY"],
    "availableHours": {
      "from": "18:00",
      "to": "21:00"
    },
    "updatedAt": "2023-07-20T16:45:22.123Z"
  }
}
```

### Skill Management

**Add New Skill**
```
POST /api/users/skills
```

Request:
```json
{
  "name": "React Development",
  "category": "TECHNOLOGY",
  "level": "ADVANCED",
  "description": "Component architecture, hooks, state management",
  "yearsOfExperience": 3,
  "canTeach": true
}
```

Response (201 Created):
```json
{
  "success": true,
  "message": "Skill added successfully",
  "skill": {
    "id": "skl_789014",
    "name": "React Development",
    "category": "TECHNOLOGY",
    "level": "ADVANCED",
    "description": "Component architecture, hooks, state management",
    "yearsOfExperience": 3,
    "canTeach": true,
    "userId": "usr_123456",
    "createdAt": "2023-07-21T10:15:30.123Z"
  }
}
```

### Swap Requests

**Create Swap Request**
```
POST /api/swaps
```

Request:
```json
{
  "recipientId": "usr_654321",
  "offeredSkillId": "skl_789014",
  "requestedSkillId": "skl_987654",
  "proposedSchedule": [
    {
      "date": "2023-08-15",
      "startTime": "18:00",
      "endTime": "19:30"
    },
    {
      "date": "2023-08-17",
      "startTime": "19:00",
      "endTime": "20:30"
    }
  ],
  "message": "I'd love to learn about GraphQL while teaching you React hooks!"
}
```

Response (201 Created):
```json
{
  "success": true,
  "message": "Swap request sent successfully",
  "swapRequest": {
    "id": "swp_246810",
    "status": "PENDING",
    "senderId": "usr_123456",
    "recipientId": "usr_654321",
    "offeredSkill": {
      "id": "skl_789014",
      "name": "React Development"
    },
    "requestedSkill": {
      "id": "skl_987654",
      "name": "GraphQL"
    },
    "proposedSchedule": [
      {
        "date": "2023-08-15",
        "startTime": "18:00",
        "endTime": "19:30"
      },
      {
        "date": "2023-08-17",
        "startTime": "19:00",
        "endTime": "20:30"
      }
    ],
    "message": "I'd love to learn about GraphQL while teaching you React hooks!",
    "createdAt": "2023-07-25T09:22:15.123Z"
  }
}
```

**Accept Swap Request**
```
PUT /api/swaps/:id/accept
```

Request:
```json
{
  "confirmedSchedule": {
    "date": "2023-08-15",
    "startTime": "18:00",
    "endTime": "19:30"
  },
  "message": "Sounds great! Looking forward to our session."
}
```

Response (200 OK):
```json
{
  "success": true,
  "message": "Swap request accepted",
  "swapRequest": {
    "id": "swp_246810",
    "status": "ACCEPTED",
    "confirmedSchedule": {
      "date": "2023-08-15",
      "startTime": "18:00",
      "endTime": "19:30"
    },
    "responseMessage": "Sounds great! Looking forward to our session.",
    "updatedAt": "2023-07-26T14:35:42.123Z"
  }
}
```

### Rating & Reviews

**Create Review After Swap**
```
POST /api/reviews
```

Request:
```json
{
  "swapId": "swp_246810",
  "recipientId": "usr_654321",
  "ratings": {
    "overall": 5,
    "teachingQuality": 5,
    "communication": 4,
    "reliability": 5
  },
  "comment": "Jane was an excellent teacher! Explained GraphQL concepts clearly and provided great examples. Would definitely recommend!",
  "skills": ["clear communication", "patience", "expertise"]
}
```

Response (201 Created):
```json
{
  "success": true,
  "message": "Review submitted successfully",
  "review": {
    "id": "rev_135790",
    "swapId": "swp_246810",
    "reviewerId": "usr_123456",
    "recipientId": "usr_654321",
    "ratings": {
      "overall": 5,
      "teachingQuality": 5,
      "communication": 4,
      "reliability": 5
    },
    "comment": "Jane was an excellent teacher! Explained GraphQL concepts clearly and provided great examples. Would definitely recommend!",
    "skills": ["clear communication", "patience", "expertise"],
    "createdAt": "2023-08-16T10:20:30.123Z"
  }
}
```

### Search & Discovery

**Search for Skills/Users**
```
GET /api/discovery/search?query=javascript&location=new%20york&maxDistance=10&skillLevel=INTERMEDIATE
```

Response (200 OK):
```json
{
  "success": true,
  "results": {
    "users": [
      {
        "id": "usr_112233",
        "firstName": "Alice",
        "lastName": "Smith",
        "location": "New York, NY",
        "profilePicture": "https://cloudinary.com/skillswap/profiles/alice.jpg",
        "averageRating": 4.9,
        "distance": 3.2,
        "matchedSkill": {
          "id": "skl_445566",
          "name": "JavaScript Programming",
          "level": "ADVANCED"
        }
      },
      {
        "id": "usr_223344",
        "firstName": "Bob",
        "lastName": "Johnson",
        "location": "Brooklyn, NY",
        "profilePicture": "https://cloudinary.com/skillswap/profiles/bob.jpg",
        "averageRating": 4.7,
        "distance": 6.8,
        "matchedSkill": {
          "id": "skl_556677",
          "name": "JavaScript Programming",
          "level": "INTERMEDIATE"
        }
      }
    ],
    "totalResults": 2,
    "page": 1,
    "totalPages": 1
  }
}
```

### Admin Operations

**Get Platform Statistics**
```
GET /api/admin/stats
```

Response (200 OK):
```json
{
  "success": true,
  "stats": {
    "userStats": {
      "totalUsers": 1250,
      "newUsersToday": 15,
      "activeUsersLastWeek": 450,
      "verifiedUsers": 1050
    },
    "swapStats": {
      "totalSwaps": 780,
      "completedSwaps": 520,
      "pendingSwaps": 150,
      "cancelledSwaps": 110,
      "averageRating": 4.6
    },
    "skillStats": {
      "totalSkills": 1850,
      "popularCategories": [
        { "category": "TECHNOLOGY", "count": 520 },
        { "category": "LANGUAGE", "count": 320 },
        { "category": "MUSIC", "count": 280 }
      ]
    },
    "timeframe": {
      "start": "2023-01-01T00:00:00.000Z",
      "end": "2023-07-31T23:59:59.999Z"
    }
  }
}
```

## 🔒 Security Features

- **Authentication**: JWT with refresh tokens + OAuth (Google, Facebook, Twitter)
- **Authorization**: Role-based access control (User, Admin, Moderator)
- **Security Middleware**: Helmet, CORS, Rate limiting (express-rate-limit)
- **Input Validation**: Express-validator for all endpoints
- **File Upload Security**: Multer with file type validation
- **Data Encryption**: Bcrypt for passwords, encrypted sensitive data
- **SQL Injection Protection**: Prisma ORM provides built-in protection

## 📊 Database Schema (Prisma)

Key models include:
- **Users**: Authentication, profiles, OAuth connections
- **Skills**: Offered/wanted skills with categories and levels
- **SwapRequests**: Request lifecycle and status tracking
- **Reviews**: Multi-dimensional ratings and feedback
- **Messages**: Secure messaging system
- **Notifications**: Real-time notification system
- **Achievements**: Gamification and credit system
- **AdminActions**: Audit trail for admin activities

## 🚀 Getting Started

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd Skill-Swap/backend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Configure your environment variables
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run migrations
   npx prisma migrate dev
   
   # Seed database (optional)
   npx prisma db seed
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

6. **Run in Production**
   ```bash
   npm start
   ```

## 🔧 Environment Variables

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/skillswap"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRE="7d"
JWT_REFRESH_SECRET="your-refresh-secret-key"
JWT_REFRESH_EXPIRE="30d"

# OAuth Configuration
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
FACEBOOK_APP_ID="your-facebook-app-id"
FACEBOOK_APP_SECRET="your-facebook-app-secret"
TWITTER_CONSUMER_KEY="your-twitter-consumer-key"
TWITTER_CONSUMER_SECRET="your-twitter-consumer-secret"

# Email Configuration
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
EMAIL_FROM="noreply@skillswap.com"

# File Upload (Cloudinary)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# App Configuration
NODE_ENV="development"
PORT=5000
FRONTEND_URL="http://localhost:3000"
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- auth.test.js
```

## 📱 Real-time Features

The platform includes Socket.io for real-time functionality:
- Live swap request notifications
- Real-time messaging
- Online user presence
- Live admin monitoring

## 🔄 API Rate Limiting

All endpoints are protected with rate limiting:
- **General API**: 100 requests per 15 minutes
- **Auth endpoints**: 5 attempts per 15 minutes
- **Upload endpoints**: 10 uploads per hour

## 📈 Monitoring & Analytics

- **Request logging**: Morgan middleware
- **Error tracking**: Centralized error handling
- **Performance monitoring**: Custom metrics
- **Admin analytics**: Comprehensive reporting system

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation wiki

---

**Built with ❤️ using Node.js, Express, Prisma, and PostgreSQL**
