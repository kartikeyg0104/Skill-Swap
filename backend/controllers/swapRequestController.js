const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

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
    if (status) {
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
    if (status) {
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
    if (status) {
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

    res.json({
      message: 'Swap request accepted successfully',
      swapRequest: updatedRequest
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
