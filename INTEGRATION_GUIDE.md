# SkillSwap Frontend-Backend Integration Guide

## Overview
The frontend and backend are now successfully connected for authentication (signin and signup) functionality.

## 🚀 Quick Start

### 1. Backend Setup
```bash
cd backend
npm install
npx prisma generate
node app.js
```
**Backend runs on:** `http://localhost:3001`

### 2. Frontend Setup
```bash
cd frontend/skill-swap
npm install
npm run dev
```
**Frontend runs on:** `http://localhost:8081` (or available port)

## 🔧 Configuration

### Environment Variables

**Backend (.env):**
```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRE="7d"
JWT_REFRESH_SECRET="your-refresh-secret-key"
JWT_REFRESH_EXPIRE="30d"
NODE_ENV="development"
PORT=3001
FRONTEND_URL="http://localhost:8081"
```

**Frontend (.env):**
```env
VITE_API_BASE_URL=http://localhost:3001/api
```

## 📝 Testing Authentication

### Manual Testing via Frontend UI

1. **Open the application**: Navigate to `http://localhost:8081`
2. **Click "Get Started" or "Sign In"** to open the authentication modal
3. **Test Registration:**
   - Switch to "Sign Up" tab
   - Fill in the form:
     - Full Name: "John Doe"
     - Email: "john@example.com"
     - Location: "New York, USA" (optional)
     - Password: "password123"
     - Confirm Password: "password123"
   - Click "Create Account"
   - Should redirect to `/social` page with success message

4. **Test Login:**
   - Switch to "Sign In" tab
   - Use the credentials from registration:
     - Email: "john@example.com" 
     - Password: "password123"
   - Click "Sign In"
   - Should redirect to `/social` page with welcome message

### Testing via API Calls (Using curl)

**Test Backend Health:**
```bash
curl http://localhost:3001/health
```

**Test Registration:**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "location": "Test City"
  }'
```

**Test Login:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## 🔄 API Integration Details

### Frontend API Service
Located in: `frontend/skill-swap/src/services/api.js`

**Key Features:**
- Centralized API communication
- Automatic token management
- Error handling
- Request/response transformation

### Authentication Context
Located in: `frontend/skill-swap/src/context/AuthContext.jsx`

**Key Features:**
- React context for global auth state
- Login/logout/register functions
- User session persistence
- Loading states

### Authentication Flow

1. **Registration:**
   ```
   Frontend Form → API Service → Backend /api/auth/register → Database
   ← JWT Tokens ← API Response ← Success Response ←
   ```

2. **Login:**
   ```
   Frontend Form → API Service → Backend /api/auth/login → Database Validation
   ← User Data + JWT ← API Response ← Success Response ←
   ```

3. **Token Storage:**
   - Access Token: `localStorage.getItem('skillswap_token')`
   - Refresh Token: `localStorage.getItem('skillswap_refresh_token')`
   - User Data: `localStorage.getItem('skillswap_user')`

## 🛠️ Troubleshooting

### Common Issues

1. **CORS Errors:**
   - Ensure `FRONTEND_URL` in backend `.env` matches frontend port
   - Restart backend after changing environment variables

2. **Database Connection:**
   - Verify `DATABASE_URL` in backend `.env`
   - Run `npx prisma migrate deploy` if needed

3. **Port Conflicts:**
   - Backend: Default 3001 (configurable via `PORT` env var)
   - Frontend: Auto-assigns available port (starts at 8080)

4. **Token Issues:**
   - Clear localStorage: `localStorage.clear()`
   - Check browser console for detailed errors

### Debug Steps

1. **Check Backend Status:**
   ```bash
   curl http://localhost:3001/health
   ```

2. **Check Frontend Console:**
   - Open browser dev tools
   - Look for API request/response in Network tab
   - Check Console for JavaScript errors

3. **Check Backend Logs:**
   - Backend terminal shows request logs
   - Look for error messages

## 📋 Next Steps

1. **Add Email Verification:**
   - Implement email service in backend
   - Add verification UI in frontend

2. **Enhanced Error Handling:**
   - Better error messages
   - Form validation improvements

3. **Password Reset:**
   - Forgot password functionality
   - Reset password flow

4. **Social Authentication:**
   - Google OAuth integration
   - Facebook/GitHub login

## 🔐 Security Notes

- JWT tokens have expiration times (7 days default)
- Passwords are hashed with bcrypt (12 rounds)
- CORS is configured for specific frontend URL
- Environment variables store sensitive data

## 📚 API Endpoints

**Authentication:**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Token refresh
- `POST /api/auth/verify/:token` - Email verification

**Users:**
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

For complete API documentation, see: `backend/README.md`
