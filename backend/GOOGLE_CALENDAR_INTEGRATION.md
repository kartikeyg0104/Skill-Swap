# Google Calendar & Meet Integration Guide

## Overview
This integration allows users to connect their Google Calendar and automatically schedule meetings with Google Meet links when skill swap requests are accepted.

## Features
- OAuth 2.0 authentication with Google Calendar
- Automatic meeting scheduling with Google Meet links
- Meeting management (update, cancel)
- Persistent token storage for seamless user experience

## API Endpoints

### 1. OAuth Flow
```
GET /api/calendar/auth
```
- Initiates Google OAuth flow
- Returns authorization URL
- Requires: Authentication

```
GET /api/calendar/callback?code=<auth_code>&state=<user_id>
```
- Handles OAuth callback
- Stores user tokens
- No authentication required (public callback)

### 2. Connection Status
```
GET /api/calendar/connection
```
- Check if user has Google Calendar connected
- Returns connection status and user email
- Requires: Authentication

### 3. Schedule Meeting
```
POST /api/calendar/schedule
```
Body:
```json
{
  "title": "Skill Swap Meeting",
  "description": "Meeting description",
  "dateTime": "2025-07-15T10:00:00Z",
  "duration": 60,
  "attendees": [
    {
      "email": "user@example.com",
      "name": "User Name"
    }
  ]
}
```
- Creates calendar event with Google Meet link
- Requires: Authentication

### 4. Update Session
```
PUT /api/calendar/session/:sessionId
```
Body:
```json
{
  "dateTime": "2025-07-15T14:00:00Z",
  "duration": 90
}
```
- Updates existing meeting
- Requires: Authentication

### 5. Cancel Session
```
DELETE /api/calendar/session/:sessionId
```
- Cancels meeting and deletes calendar event
- Requires: Authentication

## Database Schema

### SwapSession
```prisma
model SwapSession {
  id                Int       @id @default(autoincrement())
  swapRequestId     Int
  scheduledDateTime DateTime
  duration          Int       // in minutes
  meetingLink       String?   // Google Meet link
  calendarEventId   String?   // Google Calendar event ID
  status            String    @default("SCHEDULED") // SCHEDULED, COMPLETED, CANCELLED
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  swapRequest       SwapRequest @relation(fields: [swapRequestId], references: [id])
}
```

### GoogleCalendarToken
```prisma
model GoogleCalendarToken {
  id           Int      @id @default(autoincrement())
  userId       Int      @unique
  accessToken  String
  refreshToken String?
  expiresAt    DateTime
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  user         User     @relation(fields: [userId], references: [id])
}
```

## Usage Flow

### 1. User Connects Google Calendar
1. User calls `GET /api/calendar/auth` to get authorization URL
2. User visits the URL and grants permissions
3. Google redirects to callback URL with auth code
4. System exchanges code for tokens and stores them

### 2. Accepting Swap Request with Meeting
When accepting a swap request, you can now include meeting scheduling:

```javascript
// POST /api/swap-requests/:id/accept
{
  "message": "Great! Let's schedule our meeting.",
  "scheduleMeeting": true,
  "dateTime": "2025-07-15T10:00:00Z",
  "duration": 60
}
```

### 3. Automatic Meeting Creation
- System checks if user has Google Calendar connected
- Creates calendar event with Google Meet link
- Stores session details in database
- Sends notifications to both users

## Testing the Integration

### 1. Start the Backend
```bash
cd backend
npm run dev
```

### 2. Test OAuth Flow
```bash
# Get auth URL (replace with valid JWT token)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3001/api/calendar/auth

# Visit the returned URL in browser to complete OAuth
```

### 3. Test Meeting Scheduling
```bash
# Schedule a meeting
curl -X POST http://localhost:3001/api/calendar/schedule \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Skill Swap",
    "description": "Testing Google Meet integration",
    "dateTime": "2025-07-15T10:00:00Z",
    "duration": 60,
    "attendees": [
      {
        "email": "test@example.com",
        "name": "Test User"
      }
    ]
  }'
```

## Environment Variables Required

```env
# Google Calendar API Configuration
GOOGLE_CALENDAR_CLIENT_ID="your-google-calendar-client-id"
GOOGLE_CALENDAR_CLIENT_SECRET="your-google-calendar-client-secret"
GOOGLE_CALENDAR_REDIRECT_URI="http://localhost:3001/api/calendar/oauth/callback"
```

## Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google Calendar API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3001/api/calendar/oauth/callback`
   - `http://localhost:3000/calendar/callback` (for frontend)
6. Add scopes:
   - `https://www.googleapis.com/auth/calendar`
   - `https://www.googleapis.com/auth/calendar.events`

## Frontend Integration

You'll need to create frontend components for:
1. Google Calendar connection button
2. Meeting scheduling interface
3. Meeting management dashboard

Example frontend flow:
```javascript
// Connect Google Calendar
const connectCalendar = async () => {
  const response = await fetch('/api/calendar/auth', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const { authUrl } = await response.json();
  window.location.href = authUrl;
};

// Schedule meeting when accepting swap
const acceptSwapWithMeeting = async (swapId, meetingDetails) => {
  const response = await fetch(`/api/swap-requests/${swapId}/accept`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      scheduleMeeting: true,
      dateTime: meetingDetails.dateTime,
      duration: meetingDetails.duration
    })
  });
  return response.json();
};
```

## Error Handling

The system includes comprehensive error handling for:
- Invalid tokens
- API rate limits
- Calendar conflicts
- Network errors
- Permission issues

## Security Considerations

- Tokens are securely stored in database
- OAuth state parameter prevents CSRF attacks
- All endpoints require authentication except callback
- Refresh tokens are used for long-term access

## Next Steps

1. Test the OAuth flow with real Google credentials
2. Implement frontend components
3. Add meeting reminders and notifications
4. Consider adding timezone support
5. Add meeting recording integration if needed
