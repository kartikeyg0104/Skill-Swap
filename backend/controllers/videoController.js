const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

// ZegoCloud/Jitsi integration helpers
const generateRoomId = () => {
  return crypto.randomBytes(16).toString('hex');
};

const generateAccessToken = (userId, roomId) => {
  // This would integrate with your chosen video service (ZegoCloud, Jitsi, etc.)
  // For now, we'll return a mock token
  return crypto.createHash('sha256')
    .update(`${userId}-${roomId}-${process.env.VIDEO_SECRET || 'secret'}`)
    .digest('hex');
};

const createVideoSession = async (req, res) => {
  try {
    const { swapRequestId, scheduledDate, duration = 60, recordingEnabled = false } = req.body;

    // Verify swap request exists and user is part of it
    const swapRequest = await prisma.swapRequest.findUnique({
      where: { id: swapRequestId },
      include: {
        requester: { select: { id: true, name: true } },
        receiver: { select: { id: true, name: true } }
      }
    });

    if (!swapRequest) {
      return res.status(404).json({ error: 'Swap request not found' });
    }

    if (swapRequest.requesterId !== req.user.id && swapRequest.receiverId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (swapRequest.status !== 'ACCEPTED') {
      return res.status(400).json({ error: 'Can only create video sessions for accepted swap requests' });
    }

    const roomId = generateRoomId();
    const hostToken = generateAccessToken(req.user.id, roomId);
    const participantId = req.user.id === swapRequest.requesterId ? 
      swapRequest.receiverId : swapRequest.requesterId;
    const participantToken = generateAccessToken(participantId, roomId);

    // Create video session record
    const videoSession = await prisma.videoSession.create({
      data: {
        swapRequestId,
        hostId: req.user.id,
        participantId,
        roomId,
        scheduledDate: new Date(scheduledDate),
        duration,
        recordingEnabled,
        hostToken,
        participantToken,
        status: 'SCHEDULED'
      },
      include: {
        host: { select: { id: true, name: true, profilePhoto: true } },
        participant: { select: { id: true, name: true, profilePhoto: true } }
      }
    });

    // Notify participant
    await prisma.notification.create({
      data: {
        userId: participantId,
        title: 'Video Session Scheduled',
        content: `${req.user.name} scheduled a video session`,
        type: 'SYSTEM_MESSAGE',
        actionUrl: `/video-sessions/${videoSession.id}`
      }
    });

    res.status(201).json({
      message: 'Video session created successfully',
      session: videoSession
    });
  } catch (error) {
    console.error('Create video session error:', error);
    res.status(500).json({ error: 'Failed to create video session' });
  }
};

const joinVideoSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await prisma.videoSession.findUnique({
      where: { id: parseInt(sessionId) },
      include: {
        host: { select: { id: true, name: true, profilePhoto: true } },
        participant: { select: { id: true, name: true, profilePhoto: true } },
        swapRequest: { select: { skillOffered: true, skillRequested: true } }
      }
    });

    if (!session) {
      return res.status(404).json({ error: 'Video session not found' });
    }

    if (session.hostId !== req.user.id && session.participantId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update session status if first time joining
    if (session.status === 'SCHEDULED') {
      await prisma.videoSession.update({
        where: { id: parseInt(sessionId) },
        data: { 
          status: 'ACTIVE',
          startedAt: new Date()
        }
      });
    }

    const token = req.user.id === session.hostId ? session.hostToken : session.participantToken;

    res.json({
      session: {
        ...session,
        joinUrl: `${process.env.VIDEO_SERVICE_URL}/room/${session.roomId}`,
        token,
        config: {
          recordingEnabled: session.recordingEnabled,
          duration: session.duration,
          roomId: session.roomId
        }
      }
    });
  } catch (error) {
    console.error('Join video session error:', error);
    res.status(500).json({ error: 'Failed to join video session' });
  }
};

const endVideoSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { sessionNotes, wasCompleted = true } = req.body;

    const session = await prisma.videoSession.findUnique({
      where: { id: parseInt(sessionId) }
    });

    if (!session) {
      return res.status(404).json({ error: 'Video session not found' });
    }

    if (session.hostId !== req.user.id && session.participantId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update session
    const updatedSession = await prisma.videoSession.update({
      where: { id: parseInt(sessionId) },
      data: {
        status: wasCompleted ? 'COMPLETED' : 'CANCELLED',
        endedAt: new Date(),
        sessionNotes
      }
    });

    // If completed, update swap request and award credits
    if (wasCompleted && session.swapRequestId) {
      await prisma.swapRequest.update({
        where: { id: session.swapRequestId },
        data: { status: 'COMPLETED' }
      });

      // Award credits to both participants
      await awardSessionCredits(session.hostId, session.participantId, session.duration);
    }

    res.json({
      message: 'Video session ended successfully',
      session: updatedSession
    });
  } catch (error) {
    console.error('End video session error:', error);
    res.status(500).json({ error: 'Failed to end video session' });
  }
};

const getVideoSessions = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    const take = parseInt(limit);

    let whereConditions = {
      OR: [
        { hostId: req.user.id },
        { participantId: req.user.id }
      ]
    };

    if (status) {
      whereConditions.status = status;
    }

    const sessions = await prisma.videoSession.findMany({
      where: whereConditions,
      include: {
        host: { select: { id: true, name: true, profilePhoto: true } },
        participant: { select: { id: true, name: true, profilePhoto: true } },
        swapRequest: { select: { skillOffered: true, skillRequested: true } },
        recordings: true
      },
      skip,
      take,
      orderBy: { scheduledDate: 'desc' }
    });

    const total = await prisma.videoSession.count({ where: whereConditions });

    res.json({
      sessions,
      pagination: {
        page: parseInt(page),
        limit: take,
        total,
        totalPages: Math.ceil(total / take)
      }
    });
  } catch (error) {
    console.error('Get video sessions error:', error);
    res.status(500).json({ error: 'Failed to get video sessions' });
  }
};

const saveRecording = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { recordingUrl, duration, fileSize } = req.body;

    const session = await prisma.videoSession.findUnique({
      where: { id: parseInt(sessionId) }
    });

    if (!session) {
      return res.status(404).json({ error: 'Video session not found' });
    }

    if (session.hostId !== req.user.id && session.participantId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const recording = await prisma.sessionRecording.create({
      data: {
        videoSessionId: parseInt(sessionId),
        recordingUrl,
        duration,
        fileSize,
        uploadedBy: req.user.id
      }
    });

    // Notify other participant
    const otherUserId = session.hostId === req.user.id ? session.participantId : session.hostId;
    await prisma.notification.create({
      data: {
        userId: otherUserId,
        title: 'Session Recording Available',
        content: 'The recording of your session is now available',
        type: 'SYSTEM_MESSAGE',
        actionUrl: `/video-sessions/${sessionId}/recordings`
      }
    });

    res.status(201).json({
      message: 'Recording saved successfully',
      recording
    });
  } catch (error) {
    console.error('Save recording error:', error);
    res.status(500).json({ error: 'Failed to save recording' });
  }
};

// Helper function to award credits after successful session
const awardSessionCredits = async (hostId, participantId, duration) => {
  try {
    const baseCredits = Math.floor(duration / 15) * 5; // 5 credits per 15 minutes

    // Award credits to both participants
    for (const userId of [hostId, participantId]) {
      const creditBalance = await prisma.creditBalance.findUnique({
        where: { userId }
      });

      if (creditBalance) {
        await prisma.creditBalance.update({
          where: { userId },
          data: {
            earned: { increment: baseCredits },
            balance: { increment: baseCredits }
          }
        });

        await prisma.creditTransaction.create({
          data: {
            creditBalanceId: creditBalance.id,
            amount: baseCredits,
            type: 'EARNED',
            description: `Video session completion (${duration} minutes)`
          }
        });
      }
    }
  } catch (error) {
    console.error('Award session credits error:', error);
  }
};

module.exports = {
  createVideoSession,
  joinVideoSession,
  endVideoSession,
  getVideoSessions,
  saveRecording
};
