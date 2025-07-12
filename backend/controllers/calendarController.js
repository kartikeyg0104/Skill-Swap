const { PrismaClient } = require('@prisma/client');
const GoogleCalendarService = require('../services/googleCalendarService');

const prisma = new PrismaClient();

// Initialize Google Calendar OAuth flow
const initiateGoogleAuth = async (req, res) => {
  try {
    const calendarService = new GoogleCalendarService();
    const authUrl = calendarService.getAuthUrl();

    res.json({
      message: 'Google Calendar authorization URL generated',
      authUrl,
      instructions: 'Redirect user to this URL to authorize Google Calendar access'
    });
  } catch (error) {
    console.error('Google Calendar auth initiation error:', error);
    res.status(500).json({ error: 'Failed to initiate Google Calendar authorization' });
  }
};

// Handle Google Calendar OAuth callback
const handleGoogleCallback = async (req, res) => {
  try {
    const { code } = req.query;
    const userId = req.user.id;

    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    const calendarService = new GoogleCalendarService();
    const tokens = await calendarService.getTokens(code);

    // Store tokens in database
    await prisma.googleCalendarToken.upsert({
      where: { userId },
      update: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || null,
        expiryDate: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        scope: tokens.scope || null
      },
      create: {
        userId,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || null,
        expiryDate: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        scope: tokens.scope || null
      }
    });

    res.json({
      message: 'Google Calendar connected successfully',
      connected: true
    });
  } catch (error) {
    console.error('Google Calendar callback error:', error);
    res.status(500).json({ error: 'Failed to connect Google Calendar' });
  }
};

// Get user's Google Calendar connection status
const getConnectionStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    const calendarToken = await prisma.googleCalendarToken.findUnique({
      where: { userId }
    });

    if (!calendarToken) {
      return res.json({
        connected: false,
        message: 'Google Calendar not connected'
      });
    }

    // Test the connection
    const calendarService = new GoogleCalendarService();
    calendarService.setCredentials({
      access_token: calendarToken.accessToken,
      refresh_token: calendarToken.refreshToken,
      expiry_date: calendarToken.expiryDate
    });

    const isConnected = await calendarService.testConnection();

    res.json({
      connected: isConnected,
      connectedAt: calendarToken.createdAt,
      message: isConnected ? 'Google Calendar connected' : 'Google Calendar connection expired'
    });
  } catch (error) {
    console.error('Get connection status error:', error);
    res.status(500).json({ error: 'Failed to check connection status' });
  }
};

// Schedule a meeting for an accepted swap request
const scheduleMeeting = async (req, res) => {
  try {
    const { swapRequestId } = req.params;
    const { 
      scheduledDate, 
      startTime, 
      endTime, 
      timezone = 'UTC',
      title,
      description 
    } = req.body;

    const userId = req.user.id;

    // Get swap request details
    const swapRequest = await prisma.swapRequest.findUnique({
      where: { id: parseInt(swapRequestId) },
      include: {
        requester: { select: { id: true, name: true, email: true } },
        receiver: { select: { id: true, name: true, email: true } }
      }
    });

    if (!swapRequest) {
      return res.status(404).json({ error: 'Swap request not found' });
    }

    if (swapRequest.status !== 'ACCEPTED') {
      return res.status(400).json({ error: 'Can only schedule meetings for accepted swap requests' });
    }

    // Check if user is part of the swap
    if (swapRequest.requesterId !== userId && swapRequest.receiverId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get Google Calendar tokens for the user scheduling the meeting
    const calendarToken = await prisma.googleCalendarToken.findUnique({
      where: { userId }
    });

    if (!calendarToken) {
      return res.status(400).json({ 
        error: 'Google Calendar not connected',
        authUrl: new GoogleCalendarService().getAuthUrl()
      });
    }

    // Create calendar service instance with user's tokens
    const calendarService = new GoogleCalendarService();
    calendarService.setCredentials({
      access_token: calendarToken.accessToken,
      refresh_token: calendarToken.refreshToken,
      expiry_date: calendarToken.expiryDate
    });

    // Prepare event details
    const startDateTime = new Date(`${scheduledDate}T${startTime}`);
    const endDateTime = new Date(`${scheduledDate}T${endTime}`);

    const eventTitle = title || `Skill Swap: ${swapRequest.skillOffered} ↔ ${swapRequest.skillRequested}`;
    const eventDescription = description || 
      `Skill swap session between ${swapRequest.requester.name} and ${swapRequest.receiver.name}\n\n` +
      `${swapRequest.requester.name} teaches: ${swapRequest.skillOffered}\n` +
      `${swapRequest.receiver.name} teaches: ${swapRequest.skillRequested}\n\n` +
      `Session details: ${swapRequest.message || 'No additional details provided'}`;

    const attendeeEmails = [swapRequest.requester.email, swapRequest.receiver.email];

    // Create the calendar event with Google Meet
    const eventResult = await calendarService.createMeetingEvent({
      summary: eventTitle,
      description: eventDescription,
      startDateTime: startDateTime.toISOString(),
      endDateTime: endDateTime.toISOString(),
      attendeeEmails,
      timezone
    });

    // Save session details to database
    const swapSession = await prisma.swapSession.create({
      data: {
        swapRequestId: parseInt(swapRequestId),
        scheduledDate: new Date(scheduledDate),
        startTime,
        endTime,
        timezone,
        meetingLink: eventResult.meetLink,
        calendarEventId: eventResult.eventId,
        title: eventTitle,
        description: eventDescription,
        scheduledBy: userId
      }
    });

    // Update swap request status to SCHEDULED
    await prisma.swapRequest.update({
      where: { id: parseInt(swapRequestId) },
      data: { status: 'SCHEDULED' }
    });

    res.status(201).json({
      message: 'Meeting scheduled successfully',
      session: {
        id: swapSession.id,
        scheduledDate: swapSession.scheduledDate,
        startTime: swapSession.startTime,
        endTime: swapSession.endTime,
        timezone: swapSession.timezone,
        meetingLink: swapSession.meetingLink,
        calendarLink: eventResult.htmlLink,
        title: swapSession.title
      },
      calendarEvent: {
        eventId: eventResult.eventId,
        meetLink: eventResult.meetLink,
        htmlLink: eventResult.htmlLink
      }
    });
  } catch (error) {
    console.error('Schedule meeting error:', error);
    res.status(500).json({ error: 'Failed to schedule meeting' });
  }
};

// Get scheduled sessions for a user
const getUserSessions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status = 'all', page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;
    const take = parseInt(limit);

    let whereConditions = {
      swapRequest: {
        OR: [
          { requesterId: userId },
          { receiverId: userId }
        ]
      }
    };

    if (status !== 'all') {
      whereConditions.status = status.toUpperCase();
    }

    const sessions = await prisma.swapSession.findMany({
      where: whereConditions,
      include: {
        swapRequest: {
          include: {
            requester: { select: { id: true, name: true, email: true } },
            receiver: { select: { id: true, name: true, email: true } }
          }
        }
      },
      skip,
      take,
      orderBy: { scheduledDate: 'asc' }
    });

    res.json({
      sessions: sessions.map(session => ({
        id: session.id,
        title: session.title,
        description: session.description,
        scheduledDate: session.scheduledDate,
        startTime: session.startTime,
        endTime: session.endTime,
        timezone: session.timezone,
        meetingLink: session.meetingLink,
        status: session.status,
        swapRequest: {
          id: session.swapRequest.id,
          skillOffered: session.swapRequest.skillOffered,
          skillRequested: session.swapRequest.skillRequested,
          requester: session.swapRequest.requester,
          receiver: session.swapRequest.receiver
        },
        scheduledBy: session.scheduledBy,
        createdAt: session.createdAt
      })),
      pagination: {
        page: parseInt(page),
        limit: take,
        hasMore: sessions.length === take
      }
    });
  } catch (error) {
    console.error('Get user sessions error:', error);
    res.status(500).json({ error: 'Failed to get user sessions' });
  }
};

// Update a scheduled session
const updateSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { 
      scheduledDate, 
      startTime, 
      endTime, 
      timezone,
      title,
      description 
    } = req.body;

    const userId = req.user.id;

    // Get session details
    const session = await prisma.swapSession.findUnique({
      where: { id: parseInt(sessionId) },
      include: {
        swapRequest: {
          include: {
            requester: { select: { id: true, name: true, email: true } },
            receiver: { select: { id: true, name: true, email: true } }
          }
        }
      }
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Check permissions
    if (session.swapRequest.requesterId !== userId && session.swapRequest.receiverId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get Google Calendar tokens
    const calendarToken = await prisma.googleCalendarToken.findUnique({
      where: { userId: session.scheduledBy }
    });

    if (calendarToken) {
      const calendarService = new GoogleCalendarService();
      calendarService.setCredentials({
        access_token: calendarToken.accessToken,
        refresh_token: calendarToken.refreshToken,
        expiry_date: calendarToken.expiryDate
      });

      // Update calendar event
      const startDateTime = new Date(`${scheduledDate}T${startTime}`);
      const endDateTime = new Date(`${scheduledDate}T${endTime}`);

      await calendarService.updateMeetingEvent(session.calendarEventId, {
        summary: title || session.title,
        description: description || session.description,
        startDateTime: startDateTime.toISOString(),
        endDateTime: endDateTime.toISOString(),
        timezone
      });
    }

    // Update database
    const updatedSession = await prisma.swapSession.update({
      where: { id: parseInt(sessionId) },
      data: {
        scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
        startTime: startTime || undefined,
        endTime: endTime || undefined,
        timezone: timezone || undefined,
        title: title || undefined,
        description: description || undefined
      }
    });

    res.json({
      message: 'Session updated successfully',
      session: updatedSession
    });
  } catch (error) {
    console.error('Update session error:', error);
    res.status(500).json({ error: 'Failed to update session' });
  }
};

// Cancel a scheduled session
const cancelSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    // Get session details
    const session = await prisma.swapSession.findUnique({
      where: { id: parseInt(sessionId) },
      include: {
        swapRequest: true
      }
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Check permissions
    if (session.swapRequest.requesterId !== userId && session.swapRequest.receiverId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Cancel calendar event
    const calendarToken = await prisma.googleCalendarToken.findUnique({
      where: { userId: session.scheduledBy }
    });

    if (calendarToken && session.calendarEventId) {
      const calendarService = new GoogleCalendarService();
      calendarService.setCredentials({
        access_token: calendarToken.accessToken,
        refresh_token: calendarToken.refreshToken,
        expiry_date: calendarToken.expiryDate
      });

      try {
        await calendarService.cancelMeetingEvent(session.calendarEventId);
      } catch (error) {
        console.log('Failed to cancel calendar event, but continuing with session cancellation');
      }
    }

    // Update session status
    await prisma.swapSession.update({
      where: { id: parseInt(sessionId) },
      data: { status: 'CANCELLED' }
    });

    // Update swap request status back to ACCEPTED
    await prisma.swapRequest.update({
      where: { id: session.swapRequestId },
      data: { status: 'ACCEPTED' }
    });

    res.json({
      message: 'Session cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel session error:', error);
    res.status(500).json({ error: 'Failed to cancel session' });
  }
};

module.exports = {
  initiateGoogleAuth,
  handleGoogleCallback,
  getConnectionStatus,
  scheduleMeeting,
  getUserSessions,
  updateSession,
  cancelSession
};
