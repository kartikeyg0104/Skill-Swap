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

### Trust & Safety

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

Response (201 Created):
```json
{
  "message": "Verification request submitted and approved successfully",
  "status": "APPROVED",
  "type": "identity",
  "approvedAt": "2024-01-15T13:15:00.000Z"
}
```

**Get Verification Status**
```
GET /api/trust-safety/verification-status
Authorization: Bearer <token>
```

Response (200 OK):
```json
{
  "isVerified": true,
  "verificationDate": "2024-01-15T13:15:00.000Z",
  "status": "VERIFIED",
  "message": "Your account is verified"
}
```

## 🔧 Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message describing what went wrong"
}
```

Common HTTP status codes:
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

## 🧪 Testing

Use the following curl commands to test the API:

### Health Check
```bash
curl http://localhost:3001/health
```

### Register User
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "location": "New York"
  }'
```

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Create Swap Request (with token)
```bash
curl -X POST http://localhost:3001/api/swap-requests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "receiverId": 2,
    "skillOffered": "JavaScript",
    "skillRequested": "Python",
    "message": "Test swap request",
    "format": "ONLINE",
    "duration": 60
  }'
```

## 🔄 Development Notes

- Email verification is disabled in development mode
- Server runs on port 3001 (configurable via .env)
- JWT tokens expire in 1 hour (configurable)
- File uploads are stored in the `uploads/` directory
- Database migrations are in `prisma/migrations/`

## 🚀 Deployment

1. Set production environment variables
2. Run database migrations: `npx prisma migrate deploy`
3. Build the application: `npm run build`
4. Start the server: `npm start`

## 📄 License

This project is licensed under the MIT License.
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
