const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs');

const prisma = new PrismaClient();

const sendMessage = async (req, res) => {
  try {
    const { receiverId, swapRequestId, content, messageType = 'TEXT' } = req.body;

    // Validate receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
      select: { id: true, status: true }
    });

    if (!receiver || receiver.status !== 'ACTIVE') {
      return res.status(400).json({ error: 'Receiver not found or inactive' });
    }

    // If swapRequestId provided, verify user is part of the swap request
    if (swapRequestId) {
      const swapRequest = await prisma.swapRequest.findUnique({
        where: { id: swapRequestId },
        select: { requesterId: true, receiverId: true }
      });

      if (!swapRequest || 
          (swapRequest.requesterId !== req.user.id && swapRequest.receiverId !== req.user.id)) {
        return res.status(403).json({ error: 'Access denied to this swap request' });
      }
    }

    // Handle file attachment
    let fileUrl = null;
    if (req.file) {
      fileUrl = `/uploads/${req.file.filename}`;
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        senderId: req.user.id,
        receiverId,
        swapRequestId,
        content: messageType === 'FILE' ? fileUrl : content,
        messageType
      },
      include: {
        sender: {
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
        title: 'New Message',
        content: `${req.user.name} sent you a message`,
        type: 'SYSTEM_MESSAGE',
        actionUrl: `/messages/${message.id}`
      }
    });

    res.status(201).json({
      message: 'Message sent successfully',
      data: message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

const getConversations = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    const take = parseInt(limit);

    // Get all conversations for the user
    const conversations = await prisma.$queryRaw`
      SELECT DISTINCT ON (
        CASE 
          WHEN "senderId" = ${req.user.id} THEN "receiverId"
          ELSE "senderId"
        END
      )
      m.id,
      m.content,
      m."messageType",
      m."createdAt",
      m."isRead",
      u.id as "otherUserId",
      u.name as "otherUserName",
      u."profilePhoto" as "otherUserPhoto",
      sr.id as "swapRequestId"
      FROM "messages" m
      INNER JOIN "users" u ON (
        CASE 
          WHEN m."senderId" = ${req.user.id} THEN u.id = m."receiverId"
          ELSE u.id = m."senderId"
        END
      )
      LEFT JOIN "swap_requests" sr ON m."swapRequestId" = sr.id
      WHERE m."senderId" = ${req.user.id} OR m."receiverId" = ${req.user.id}
      ORDER BY (
        CASE 
          WHEN "senderId" = ${req.user.id} THEN "receiverId"
          ELSE "senderId"
        END
      ), m."createdAt" DESC
      LIMIT ${take} OFFSET ${skip}
    `;

    res.json({
      conversations,
      pagination: {
        page: parseInt(page),
        limit: take,
        total: conversations.length
      }
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to get conversations' });
  }
};

const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const { swapRequestId, page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;
    const take = parseInt(limit);

    let whereConditions = {
      OR: [
        { senderId: req.user.id, receiverId: parseInt(userId) },
        { senderId: parseInt(userId), receiverId: req.user.id }
      ]
    };

    if (swapRequestId) {
      whereConditions.swapRequestId = parseInt(swapRequestId);
    }

    const messages = await prisma.message.findMany({
      where: whereConditions,
      include: {
        sender: {
          select: { id: true, name: true, profilePhoto: true }
        }
      },
      skip,
      take,
      orderBy: { createdAt: 'asc' }
    });

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        senderId: parseInt(userId),
        receiverId: req.user.id,
        isRead: false
      },
      data: { isRead: true }
    });

    const total = await prisma.message.count({ where: whereConditions });

    res.json({
      messages,
      pagination: {
        page: parseInt(page),
        limit: take,
        total,
        totalPages: Math.ceil(total / take)
      }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await prisma.message.update({
      where: {
        id: parseInt(messageId),
        receiverId: req.user.id
      },
      data: { isRead: true }
    });

    res.json({ message: 'Message marked as read', data: message });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ error: 'Failed to mark message as read' });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await prisma.message.findUnique({
      where: { id: parseInt(messageId) }
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.senderId !== req.user.id) {
      return res.status(403).json({ error: 'Can only delete your own messages' });
    }

    // Delete file if it's a file message
    if (message.messageType === 'FILE' && message.content) {
      const filePath = path.join(__dirname, '..', message.content);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await prisma.message.delete({
      where: { id: parseInt(messageId) }
    });

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const count = await prisma.message.count({
      where: {
        receiverId: req.user.id,
        isRead: false
      }
    });

    res.json({ count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
};

module.exports = {
  sendMessage,
  getConversations,
  getMessages,
  markAsRead,
  deleteMessage,
  getUnreadCount
};
