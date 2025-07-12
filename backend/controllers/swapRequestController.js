const { PrismaClient } = require('@prisma/client');
const { scheduleCalendarEvent } = require('../services/googleCalendarService');
const nodemailer = require('nodemailer');

const prisma = new PrismaClient();

// Send meeting invite via email
const sendMeetingInvite = async (meetingData) => {
  try {
    const transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">🎉 You're Invited to a Skill Swap Meeting!</h2>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #007bff; margin-top: 0;">${meetingData.title}</h3>
          <p style="color: #666; margin: 10px 0;">
            <strong>Organized by:</strong> ${meetingData.organizerName}
          </p>
          <p style="color: #666; margin: 10px 0;">
            <strong>Description:</strong> ${meetingData.description}
          </p>
          ${meetingData.dateTime ? `
            <p style="color: #666; margin: 10px 0;">
              <strong>Date & Time:</strong> ${new Date(meetingData.dateTime).toLocaleString()}
            </p>
          ` : ''}
          <p style="color: #666; margin: 10px 0;">
            <strong>Duration:</strong> ${meetingData.duration} minutes
          </p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${meetingData.meetingLink}" 
             style="background-color: #007bff; color: white; padding: 15px 30px; 
                    text-decoration: none; border-radius: 5px; font-weight: bold; 
                    display: inline-block;">
            🎥 Join Google Meet
          </a>
        </div>

        <div style="background-color: #e9ecef; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0; color: #666; font-size: 14px;">
            <strong>Meeting Link:</strong> 
            <a href="${meetingData.meetingLink}" style="color: #007bff;">
              ${meetingData.meetingLink}
            </a>
          </p>
        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
          <p style="color: #666; font-size: 12px; margin: 0;">
            This meeting was scheduled through Skill Swap platform.
          </p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: `"${meetingData.organizerName}" <${process.env.EMAIL_FROM}>`,
      to: meetingData.attendeeEmail,
      subject: `📅 Meeting Invitation: ${meetingData.title}`,
      html: emailHtml
    };

    await transporter.sendMail(mailOptions);
    return true;

  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
};

const createSwapRequest = async (req, res) => {
  try {
    const {
      receiverId,
      skillOffered,
      skillRequested,
      message,
      proposedSchedule,
      format,
      duration,
      priority = 'MEDIUM'
    } = req.body;

    // Validate receiver exists and is active
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
      select: { id: true, status: true, isPublic: true }
    });

    if (!receiver || receiver.status !== 'ACTIVE' || !receiver.isPublic) {
      return res.status(400).json({ error: 'Receiver not found or unavailable' });
    }

    // Check if user is trying to send request to themselves
    if (req.user.id === receiverId) {
      return res.status(400).json({ error: 'Cannot send swap request to yourself' });
    }

    // Check for existing pending request between these users
    const existingRequest = await prisma.swapRequest.findFirst({
      where: {
        OR: [
          { requesterId: req.user.id, receiverId: receiverId },
          { requesterId: receiverId, receiverId: req.user.id }
        ],
        status: { in: ['PENDING', 'ACCEPTED'] }
      }
    });

    if (existingRequest) {
      return res.status(400).json({ error: 'A pending request already exists between you and this user' });
    }

    // Create swap request
    const swapRequest = await prisma.swapRequest.create({
      data: {
        requesterId: req.user.id,
        receiverId,
        skillOffered,
        skillRequested,
        message,
        proposedSchedule: proposedSchedule ? new Date(proposedSchedule) : null,
        format,
        duration,
        priority,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      },
      include: {
        requester: {
          select: { id: true, name: true, profilePhoto: true }
        },
        receiver: {
          select: { id: true, name: true, profilePhoto: true }
        }
      }
    });

    // Create notification for receiver
    await prisma.notification.create({
      data: {
        userId: receiverId,
        title: 'New Swap Request',
        content: `${req.user.name} sent you a swap request for ${skillRequested}`,
        type: 'SWAP_REQUEST',
        actionUrl: `/swap-requests/${swapRequest.id}`
      }
    });

    res.status(201).json({
      message: 'Swap request created successfully',
      swapRequest
    });
  } catch (error) {
    console.error('Create swap request error:', error);
    res.status(500).json({ error: 'Failed to create swap request' });
  }
};

const getSwapRequests = async (req, res) => {
  try {
    const { type = 'all', status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    const take = parseInt(limit);

    let whereConditions = {};

    // Filter by type (sent, received, all)
    if (type === 'sent') {
      whereConditions.requesterId = req.user.id;
    } else if (type === 'received') {
      whereConditions.receiverId = req.user.id;
    } else {
      whereConditions.OR = [
        { requesterId: req.user.id },
        { receiverId: req.user.id }
      ];
    }

    // Filter by status
    if (status && status !== 'all') {
      whereConditions.status = status;
    }

    const swapRequests = await prisma.swapRequest.findMany({
      where: whereConditions,
      include: {
        requester: {
          select: { id: true, name: true, profilePhoto: true, reputation: true }
        },
        receiver: {
          select: { id: true, name: true, profilePhoto: true, reputation: true }
        },
        scheduledSession: true,
        _count: {
          select: { messages: true }
        }
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.swapRequest.count({ where: whereConditions });

    res.json({
      swapRequests,
      pagination: {
        page: parseInt(page),
        limit: take,
        total,
        totalPages: Math.ceil(total / take)
      }
    });
  } catch (error) {
    console.error('Get swap requests error:', error);
    res.status(500).json({ error: 'Failed to get swap requests' });
  }
};

const getSwapRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const swapRequest = await prisma.swapRequest.findUnique({
      where: { id: parseInt(id) },
      include: {
        requester: {
          select: { id: true, name: true, profilePhoto: true, reputation: true }
        },
        receiver: {
          select: { id: true, name: true, profilePhoto: true, reputation: true }
        },
        scheduledSession: true,
        completion: true,
        messages: {
          include: {
            sender: {
              select: { id: true, name: true, profilePhoto: true }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!swapRequest) {
      return res.status(404).json({ error: 'Swap request not found' });
    }

    // Check if user is part of this swap request
    if (swapRequest.requesterId !== req.user.id && swapRequest.receiverId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(swapRequest);
  } catch (error) {
    console.error('Get swap request error:', error);
    res.status(500).json({ error: 'Failed to get swap request' });
  }
};

const updateSwapRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, message } = req.body;

    const swapRequest = await prisma.swapRequest.findUnique({
      where: { id: parseInt(id) },
      include: {
        requester: { select: { id: true, name: true } },
        receiver: { select: { id: true, name: true } }
      }
    });

    if (!swapRequest) {
      return res.status(404).json({ error: 'Swap request not found' });
    }

    // Check permissions based on status change
    if (status === 'ACCEPTED' || status === 'DECLINED') {
      if (swapRequest.receiverId !== req.user.id) {
        return res.status(403).json({ error: 'Only the receiver can accept or decline requests' });
      }
    } else if (status === 'CANCELLED') {
      if (swapRequest.requesterId !== req.user.id) {
        return res.status(403).json({ error: 'Only the requester can cancel requests' });
      }
    }

    // Update swap request
    const updatedRequest = await prisma.swapRequest.update({
      where: { id: parseInt(id) },
      data: { status },
      include: {
        requester: {
          select: { id: true, name: true, profilePhoto: true }
        },
        receiver: {
          select: { id: true, name: true, profilePhoto: true }
        }
      }
    });

    // Create notification
    const notificationUserId = req.user.id === swapRequest.requesterId ? 
      swapRequest.receiverId : swapRequest.requesterId;

    let notificationTitle = '';
    let notificationType = 'SWAP_REQUEST';

    switch (status) {
      case 'ACCEPTED':
        notificationTitle = 'Swap Request Accepted';
        notificationType = 'SWAP_ACCEPTED';
        break;
      case 'DECLINED':
        notificationTitle = 'Swap Request Declined';
        notificationType = 'SWAP_DECLINED';
        break;
      case 'CANCELLED':
        notificationTitle = 'Swap Request Cancelled';
        notificationType = 'SWAP_CANCELLED';
        break;
    }

    await prisma.notification.create({
      data: {
        userId: notificationUserId,
        title: notificationTitle,
        content: `${req.user.name} ${status.toLowerCase()} the swap request`,
        type: notificationType,
        actionUrl: `/swap-requests/${id}`
      }
    });

    // Add message if provided
    if (message) {
      await prisma.message.create({
        data: {
          senderId: req.user.id,
          receiverId: notificationUserId,
          swapRequestId: parseInt(id),
          content: message,
          messageType: 'TEXT'
        }
      });
    }

    res.json({
      message: `Swap request ${status.toLowerCase()} successfully`,
      swapRequest: updatedRequest
    });
  } catch (error) {
    console.error('Update swap request status error:', error);
    res.status(500).json({ error: 'Failed to update swap request status' });
  }
};

const scheduleSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, duration, platform, meetingLink, notes } = req.body;

    const swapRequest = await prisma.swapRequest.findUnique({
      where: { id: parseInt(id) }
    });

    if (!swapRequest) {
      return res.status(404).json({ error: 'Swap request not found' });
    }

    if (swapRequest.status !== 'ACCEPTED') {
      return res.status(400).json({ error: 'Can only schedule sessions for accepted requests' });
    }

    // Check if user is part of this swap request
    if (swapRequest.requesterId !== req.user.id && swapRequest.receiverId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const scheduledSession = await prisma.scheduledSession.upsert({
      where: { swapRequestId: parseInt(id) },
      update: {
        date: new Date(date),
        duration,
        platform,
        meetingLink,
        notes
      },
      create: {
        swapRequestId: parseInt(id),
        date: new Date(date),
        duration,
        platform,
        meetingLink,
        notes
      }
    });

    // Notify the other user
    const otherUserId = req.user.id === swapRequest.requesterId ? 
      swapRequest.receiverId : swapRequest.requesterId;

    await prisma.notification.create({
      data: {
        userId: otherUserId,
        title: 'Session Scheduled',
        content: `${req.user.name} scheduled a session for your swap request`,
        type: 'SYSTEM_MESSAGE',
        actionUrl: `/swap-requests/${id}`
      }
    });

    res.json({
      message: 'Session scheduled successfully',
      scheduledSession
    });
  } catch (error) {
    console.error('Schedule session error:', error);
    res.status(500).json({ error: 'Failed to schedule session' });
  }
};

const getSwapRequestStats = async (req, res) => {
  try {
    const stats = await prisma.swapRequest.groupBy({
      by: ['status'],
      where: {
        OR: [
          { requesterId: req.user.id },
          { receiverId: req.user.id }
        ]
      },
      _count: {
        status: true
      }
    });

    const formattedStats = {
      pending: 0,
      accepted: 0,
      declined: 0,
      cancelled: 0,
      completed: 0,
      expired: 0
    };

    stats.forEach(stat => {
      formattedStats[stat.status.toLowerCase()] = stat._count.status;
    });

    res.json(formattedStats);
  } catch (error) {
    console.error('Get swap request stats error:', error);
    res.status(500).json({ error: 'Failed to get swap request stats' });
  }
};

const getSentSwapRequests = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    const take = parseInt(limit);

    let whereConditions = { requesterId: req.user.id };
    if (status && status !== 'all') {
      whereConditions.status = status;
    }

    const swapRequests = await prisma.swapRequest.findMany({
      where: whereConditions,
      include: {
        receiver: {
          select: { id: true, name: true, profilePhoto: true, reputation: true }
        },
        scheduledSession: true
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.swapRequest.count({ where: whereConditions });

    res.json({
      swapRequests,
      pagination: {
        page: parseInt(page),
        limit: take,
        total,
        totalPages: Math.ceil(total / take)
      }
    });
  } catch (error) {
    console.error('Get sent swap requests error:', error);
    res.status(500).json({ error: 'Failed to get sent swap requests' });
  }
};

const getReceivedSwapRequests = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    const take = parseInt(limit);

    let whereConditions = { receiverId: req.user.id };
    if (status && status !== 'all') {
      whereConditions.status = status;
    }

    const swapRequests = await prisma.swapRequest.findMany({
      where: whereConditions,
      include: {
        requester: {
          select: { id: true, name: true, profilePhoto: true, reputation: true }
        },
        scheduledSession: true
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.swapRequest.count({ where: whereConditions });

    res.json({
      swapRequests,
      pagination: {
        page: parseInt(page),
        limit: take,
        total,
        totalPages: Math.ceil(total / take)
      }
    });
  } catch (error) {
    console.error('Get received swap requests error:', error);
    res.status(500).json({ error: 'Failed to get received swap requests' });
  }
};

const acceptSwapRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, scheduleMeeting = false, meetingLink, dateTime, duration = 60 } = req.body;

    const swapRequest = await prisma.swapRequest.findUnique({
      where: { id: parseInt(id) },
      include: {
        requester: { select: { id: true, name: true, email: true } },
        receiver: { select: { id: true, name: true, email: true } }
      }
    });

    if (!swapRequest) {
      return res.status(404).json({ error: 'Swap request not found' });
    }

    if (swapRequest.receiverId !== req.user.id) {
      return res.status(403).json({ error: 'Only the receiver can accept requests' });
    }

    if (swapRequest.status !== 'PENDING') {
      return res.status(400).json({ error: 'Can only accept pending requests' });
    }

    const updatedRequest = await prisma.swapRequest.update({
      where: { id: parseInt(id) },
      data: { status: 'ACCEPTED' }
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: swapRequest.requesterId,
        title: 'Swap Request Accepted',
        content: `${req.user.name} accepted your swap request`,
        type: 'SWAP_ACCEPTED',
        actionUrl: `/swaps/${id}`
      }
    });

    // Add message if provided
    if (message) {
      await prisma.message.create({
        data: {
          senderId: req.user.id,
          receiverId: swapRequest.requesterId,
          swapRequestId: parseInt(id),
          content: message,
          messageType: 'TEXT'
        }
      });
    }

    let sessionData = null;
    
    // Schedule simple meeting if requested
    if (scheduleMeeting && (meetingLink || dateTime)) {
      try {
        // Create simple meeting record
        const meeting = await prisma.simpleMeeting.create({
          data: {
            organizerId: req.user.id,
            attendeeEmail: swapRequest.requester.email,
            attendeeName: swapRequest.requester.name,
            title: `Skill Swap: ${swapRequest.skillOffered} ↔ ${swapRequest.skillRequested}`,
            description: `Skill swap session between ${swapRequest.requester.name} and ${swapRequest.receiver.name}`,
            meetingLink: meetingLink || `https://meet.google.com/new`, // Default to new meeting
            scheduledDateTime: dateTime ? new Date(dateTime) : null,
            duration: duration,
            status: 'SCHEDULED'
          }
        });

        sessionData = meeting;

        // Send meeting invite email
        await sendMeetingInvite({
          organizerName: req.user.name,
          organizerEmail: req.user.email,
          attendeeEmail: swapRequest.requester.email,
          attendeeName: swapRequest.requester.name,
          title: meeting.title,
          description: meeting.description,
          meetingLink: meeting.meetingLink,
          dateTime: dateTime,
          duration: duration
        });

        // Send notification about the scheduled meeting
        await prisma.notification.create({
          data: {
            userId: swapRequest.requesterId,
            title: 'Meeting Scheduled',
            content: `Your skill swap meeting has been scheduled! Check your email for the Google Meet link.`,
            type: 'MEETING_SCHEDULED',
            actionUrl: `/meetings/${meeting.id}`
          }
        });

      } catch (meetingError) {
        console.error('Meeting scheduling error:', meetingError);
        // Don't fail the acceptance, just log the error
      }
    }

    res.json({
      message: 'Swap request accepted successfully',
      swapRequest: updatedRequest,
      session: sessionData
    });
  } catch (error) {
    console.error('Accept swap request error:', error);
    res.status(500).json({ error: 'Failed to accept swap request' });
  }
};

const declineSwapRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    const swapRequest = await prisma.swapRequest.findUnique({
      where: { id: parseInt(id) },
      include: {
        requester: { select: { id: true, name: true } }
      }
    });

    if (!swapRequest) {
      return res.status(404).json({ error: 'Swap request not found' });
    }

    if (swapRequest.receiverId !== req.user.id) {
      return res.status(403).json({ error: 'Only the receiver can decline requests' });
    }

    const updatedRequest = await prisma.swapRequest.update({
      where: { id: parseInt(id) },
      data: { status: 'DECLINED' }
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: swapRequest.requesterId,
        title: 'Swap Request Declined',
        content: `${req.user.name} declined your swap request`,
        type: 'SWAP_DECLINED',
        actionUrl: `/swaps/${id}`
      }
    });

    // Add message if provided
    if (message) {
      await prisma.message.create({
        data: {
          senderId: req.user.id,
          receiverId: swapRequest.requesterId,
          swapRequestId: parseInt(id),
          content: message,
          messageType: 'TEXT'
        }
      });
    }

    res.json({
      message: 'Swap request declined successfully',
      swapRequest: updatedRequest
    });
  } catch (error) {
    console.error('Decline swap request error:', error);
    res.status(500).json({ error: 'Failed to decline swap request' });
  }
};

const cancelSwapRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const swapRequest = await prisma.swapRequest.findUnique({
      where: { id: parseInt(id) },
      include: {
        receiver: { select: { id: true, name: true } }
      }
    });

    if (!swapRequest) {
      return res.status(404).json({ error: 'Swap request not found' });
    }

    if (swapRequest.requesterId !== req.user.id) {
      return res.status(403).json({ error: 'Only the requester can cancel requests' });
    }

    await prisma.swapRequest.delete({
      where: { id: parseInt(id) }
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: swapRequest.receiverId,
        title: 'Swap Request Cancelled',
        content: `${req.user.name} cancelled their swap request`,
        type: 'SWAP_CANCELLED'
      }
    });

    res.json({ message: 'Swap request cancelled successfully' });
  } catch (error) {
    console.error('Cancel swap request error:', error);
    res.status(500).json({ error: 'Failed to cancel swap request' });
  }
};

module.exports = {
  createSwapRequest,
  getSwapRequests,
  getSwapRequest,
  updateSwapRequestStatus,
  scheduleSession,
  getSwapRequestStats,
  getSentSwapRequests,
  getReceivedSwapRequests,
  acceptSwapRequest,
  declineSwapRequest,
  cancelSwapRequest
};
