# Simple Meeting Integration - No OAuth Required! 🎉

## Overview
This is a simplified meeting system that doesn't require complex OAuth setup. You just provide a Google Meet link and email addresses, and the system handles the rest.

## How It Works
1. **Create a Google Meet link** manually (go to meet.google.com/new)
2. **Use our API** to schedule and send invitations
3. **Attendees get email invitations** with the meeting link
4. **No client IDs, secrets, or OAuth required!**

## API Endpoints

### Schedule a Simple Meeting
```bash
POST /api/meetings/schedule
```

**Request Body:**
```json
{
  "meetingLink": "https://meet.google.com/abc-defg-hij",
  "attendeeEmail": "john@example.com",
  "attendeeName": "John Doe",
  "title": "JavaScript Tips & Tricks",
  "description": "Share JavaScript knowledge and learn React hooks",
  "dateTime": "2025-07-15T10:00:00Z",
  "duration": 60
}
```

**Response:**
```json
{
  "message": "Meeting scheduled successfully!",
  "meeting": {
    "id": 1,
    "title": "JavaScript Tips & Tricks",
    "meetingLink": "https://meet.google.com/abc-defg-hij",
    "attendeeEmail": "john@example.com",
    "scheduledDateTime": "2025-07-15T10:00:00.000Z",
    "duration": 60,
    "status": "SCHEDULED"
  },
  "emailSent": true
}
```

### Get My Meetings
```bash
GET /api/meetings/my-meetings
```

**Response:**
```json
{
  "meetings": [
    {
      "id": 1,
      "title": "JavaScript Tips & Tricks",
      "meetingLink": "https://meet.google.com/abc-defg-hij",
      "attendeeEmail": "john@example.com",
      "attendeeName": "John Doe",
      "scheduledDateTime": "2025-07-15T10:00:00.000Z",
      "duration": 60,
      "status": "SCHEDULED"
    }
  ]
}
```

### Accept Swap Request with Meeting
```bash
POST /api/swap-requests/:id/accept
```

**Request Body:**
```json
{
  "message": "Great! Let me schedule our meeting.",
  "scheduleMeeting": true,
  "meetingLink": "https://meet.google.com/skill-swap-meeting",
  "dateTime": "2025-07-15T14:00:00Z",
  "duration": 90
}
```

## Quick Test Commands

### 1. Schedule a Meeting
```bash
curl -X POST http://localhost:3001/api/meetings/schedule \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "meetingLink": "https://meet.google.com/abc-defg-hij",
    "attendeeEmail": "john@example.com",
    "attendeeName": "John Doe",
    "title": "JavaScript Tips & Tricks",
    "description": "Share JavaScript knowledge and learn React hooks",
    "dateTime": "2025-07-15T10:00:00Z",
    "duration": 60
  }'
```

### 2. Get Your Meetings
```bash
curl -X GET http://localhost:3001/api/meetings/my-meetings \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Accept Swap with Meeting
```bash
curl -X POST http://localhost:3001/api/swap-requests/1/accept \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "scheduleMeeting": true,
    "meetingLink": "https://meet.google.com/new-meeting-link",
    "dateTime": "2025-07-15T14:00:00Z",
    "duration": 90
  }'
```

## How to Get a Google Meet Link

### Option 1: Create New Meeting
1. Go to [meet.google.com/new](https://meet.google.com/new)
2. Click "Start an instant meeting"
3. Copy the meeting link (e.g., `https://meet.google.com/abc-defg-hij`)

### Option 2: Schedule for Later
1. Go to [calendar.google.com](https://calendar.google.com)
2. Create a new event
3. Add "Google Meet" to the event
4. Copy the meeting link

### Option 3: Use Fixed Meeting Room
1. Go to [meet.google.com](https://meet.google.com)
2. Create a meeting room with a custom name
3. Use the same link for recurring meetings

## Email Notifications

The system automatically sends beautiful HTML email invitations with:
- Meeting title and description
- Organizer information
- Date, time, and duration
- Clickable "Join Google Meet" button
- Direct meeting link

## Environment Variables

To enable email notifications, set these in your `.env`:
```env
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
EMAIL_FROM="noreply@skillswap.com"
```

## Database Schema

The system uses a simple `SimpleMeeting` model:
```prisma
model SimpleMeeting {
  id                Int       @id @default(autoincrement())
  organizerId       Int
  attendeeEmail     String
  attendeeName      String?
  title             String
  description       String?
  meetingLink       String    // Google Meet link
  scheduledDateTime DateTime?
  duration          Int       @default(60)
  status            String    @default("SCHEDULED")
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  organizer         User      @relation(fields: [organizerId], references: [id])
}
```

## Benefits of This Approach

✅ **No OAuth complexity** - No client IDs, secrets, or authorization flows
✅ **No API limits** - Not bound by Google Calendar API quotas
✅ **Works immediately** - No setup required beyond environment variables
✅ **Simple and reliable** - Less moving parts, fewer points of failure
✅ **User-friendly** - Users can create their own meeting links
✅ **Flexible** - Works with any Google Meet link

## Testing Results

✅ **Backend server** running on port 3001
✅ **Database** updated with SimpleMeeting model
✅ **Meeting scheduling** working perfectly
✅ **Email system** ready (needs SMTP configuration)
✅ **Swap request integration** completed

## Next Steps

1. **Set up email configuration** for automatic invitations
2. **Test with real email addresses** 
3. **Add frontend components** for meeting scheduling
4. **Implement meeting status updates**
5. **Add meeting reminders** (optional)

This approach gives you all the benefits of meeting scheduling without the complexity of OAuth! 🚀
