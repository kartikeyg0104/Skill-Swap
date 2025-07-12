const { PrismaClient } = require('@prisma/client');
const emailService = require('../services/emailService');

const prisma = new PrismaClient();

const createBroadcastMessage = async (req, res) => {
  try {
    const { title, message, targetAudience, scheduledFor, channels } = req.body;

    // Create broadcast message
    const broadcast = await prisma.broadcastMessage.create({
      data: {
        title,
        message,
        targetAudience,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : new Date(),
        channels,
        createdBy: req.user.id,
        status: scheduledFor ? 'SCHEDULED' : 'ACTIVE'
      }
    });

    // If immediate broadcast, send now
    if (!scheduledFor) {
      await processBroadcast(broadcast.id);
    }

    res.status(201).json({
      message: 'Broadcast message created successfully',
      broadcast
    });
  } catch (error) {
    console.error('Create broadcast message error:', error);
    res.status(500).json({ error: 'Failed to create broadcast message' });
  }
};

const sendTargetedNotification = async (req, res) => {
  try {
    const { 
      title, 
      content, 
      targetCriteria, 
      notificationType = 'SYSTEM_MESSAGE',
      actionUrl,
      priority = 'MEDIUM'
    } = req.body;

    // Build user query based on criteria
    let whereConditions = { status: 'ACTIVE' };

    if (targetCriteria.userRole) {
      whereConditions.role = targetCriteria.userRole;
    }

    if (targetCriteria.isVerified !== undefined) {
      whereConditions.isVerified = targetCriteria.isVerified;
    }

    if (targetCriteria.location) {
      whereConditions.location = { contains: targetCriteria.location, mode: 'insensitive' };
    }

    if (targetCriteria.skillCategory) {
      whereConditions.skillsOffered = {
        some: { category: targetCriteria.skillCategory }
      };
    }

    if (targetCriteria.minCompletedSwaps) {
      whereConditions.reputation = {
        completedSwaps: { gte: targetCriteria.minCompletedSwaps }
      };
    }

    if (targetCriteria.lastActiveWithin) {
      const daysAgo = new Date(Date.now() - targetCriteria.lastActiveWithin * 24 * 60 * 60 * 1000);
      whereConditions.updatedAt = { gte: daysAgo };
    }

    // Get target users
    const targetUsers = await prisma.user.findMany({
      where: whereConditions,
      select: { id: true, email: true, name: true }
    });

    // Create notifications for all target users
    const notifications = await Promise.all(
      targetUsers.map(user => 
        prisma.notification.create({
          data: {
            userId: user.id,
            title,
            content,
            type: notificationType,
            actionUrl,
            priority
          }
        })
      )
    );

    // Log the campaign
    const campaign = await prisma.notificationCampaign.create({
      data: {
        title,
        content,
        targetCriteria,
        targetCount: targetUsers.length,
        createdBy: req.user.id,
        status: 'SENT'
      }
    });

    res.status(201).json({
      message: 'Targeted notifications sent successfully',
      campaign,
      targetCount: targetUsers.length,
      notificationIds: notifications.map(n => n.id)
    });
  } catch (error) {
    console.error('Send targeted notification error:', error);
    res.status(500).json({ error: 'Failed to send targeted notifications' });
  }
};

const createEmailCampaign = async (req, res) => {
  try {
    const { 
      name,
      subject,
      htmlContent,
      textContent,
      targetSegment,
      scheduledFor,
      campaignType = 'MARKETING'
    } = req.body;

    const campaign = await prisma.emailCampaign.create({
      data: {
        name,
        subject,
        htmlContent,
        textContent,
        targetSegment,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : new Date(),
        campaignType,
        createdBy: req.user.id,
        status: scheduledFor ? 'SCHEDULED' : 'ACTIVE'
      }
    });

    // If immediate campaign, process now
    if (!scheduledFor) {
      await processEmailCampaign(campaign.id);
    }

    res.status(201).json({
      message: 'Email campaign created successfully',
      campaign
    });
  } catch (error) {
    console.error('Create email campaign error:', error);
    res.status(500).json({ error: 'Failed to create email campaign' });
  }
};

const sendPushNotification = async (req, res) => {
  try {
    const { title, body, data, targetUsers, badge, sound = 'default' } = req.body;

    // Create push notification record
    const pushNotification = await prisma.pushNotification.create({
      data: {
        title,
        body,
        data,
        badge,
        sound,
        targetUsers,
        sentBy: req.user.id,
        status: 'SENT',
        sentAt: new Date()
      }
    });

    // Here you would integrate with your push notification service
    // (Firebase, OneSignal, etc.)
    // For now, we'll simulate the sending
    console.log(`Push notification sent to ${targetUsers.length} users:`, {
      title,
      body,
      data
    });

    res.status(201).json({
      message: 'Push notification sent successfully',
      notification: pushNotification,
      targetCount: targetUsers.length
    });
  } catch (error) {
    console.error('Send push notification error:', error);
    res.status(500).json({ error: 'Failed to send push notification' });
  }
};

const getCommunicationHistory = async (req, res) => {
  try {
    const { type, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    const take = parseInt(limit);

    let communications = [];
    let total = 0;

    switch (type) {
      case 'broadcasts':
        communications = await prisma.broadcastMessage.findMany({
          include: {
            creator: { select: { name: true, email: true } }
          },
          skip,
          take,
          orderBy: { createdAt: 'desc' }
        });
        total = await prisma.broadcastMessage.count();
        break;

      case 'campaigns':
        communications = await prisma.notificationCampaign.findMany({
          include: {
            creator: { select: { name: true, email: true } }
          },
          skip,
          take,
          orderBy: { createdAt: 'desc' }
        });
        total = await prisma.notificationCampaign.count();
        break;

      case 'emails':
        communications = await prisma.emailCampaign.findMany({
          include: {
            creator: { select: { name: true, email: true } }
          },
          skip,
          take,
          orderBy: { createdAt: 'desc' }
        });
        total = await prisma.emailCampaign.count();
        break;

      case 'push':
        communications = await prisma.pushNotification.findMany({
          include: {
            sender: { select: { name: true, email: true } }
          },
          skip,
          take,
          orderBy: { sentAt: 'desc' }
        });
        total = await prisma.pushNotification.count();
        break;

      default:
        return res.status(400).json({ error: 'Invalid communication type' });
    }

    res.json({
      communications,
      pagination: {
        page: parseInt(page),
        limit: take,
        total,
        totalPages: Math.ceil(total / take)
      }
    });
  } catch (error) {
    console.error('Get communication history error:', error);
    res.status(500).json({ error: 'Failed to get communication history' });
  }
};

const getCommunicationStats = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    let startDate;
    switch (period) {
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    const [
      broadcastStats,
      emailStats,
      notificationStats,
      pushStats
    ] = await Promise.all([
      prisma.broadcastMessage.aggregate({
        where: { createdAt: { gte: startDate } },
        _count: { id: true }
      }),
      prisma.emailCampaign.aggregate({
        where: { createdAt: { gte: startDate } },
        _count: { id: true },
        _sum: { recipientCount: true }
      }),
      prisma.notification.aggregate({
        where: { createdAt: { gte: startDate } },
        _count: { id: true }
      }),
      prisma.pushNotification.aggregate({
        where: { sentAt: { gte: startDate } },
        _count: { id: true }
      })
    ]);

    res.json({
      period,
      stats: {
        broadcasts: {
          sent: broadcastStats._count.id,
          period
        },
        emails: {
          campaigns: emailStats._count.id,
          recipients: emailStats._sum.recipientCount || 0,
          period
        },
        notifications: {
          sent: notificationStats._count.id,
          period
        },
        pushNotifications: {
          sent: pushStats._count.id,
          period
        }
      }
    });
  } catch (error) {
    console.error('Get communication stats error:', error);
    res.status(500).json({ error: 'Failed to get communication statistics' });
  }
};

// Helper functions
const processBroadcast = async (broadcastId) => {
  try {
    const broadcast = await prisma.broadcastMessage.findUnique({
      where: { id: broadcastId }
    });

    if (!broadcast) return;

    let whereConditions = { status: 'ACTIVE' };

    // Apply audience targeting
    if (broadcast.targetAudience !== 'ALL') {
      switch (broadcast.targetAudience) {
        case 'VERIFIED_USERS':
          whereConditions.isVerified = true;
          break;
        case 'NEW_USERS':
          whereConditions.createdAt = { 
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) 
          };
          break;
        case 'ACTIVE_USERS':
          whereConditions.updatedAt = { 
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) 
          };
          break;
      }
    }

    const targetUsers = await prisma.user.findMany({
      where: whereConditions,
      select: { id: true, email: true, name: true }
    });

    // Send in-app notifications
    if (broadcast.channels.includes('IN_APP')) {
      await Promise.all(
        targetUsers.map(user =>
          prisma.notification.create({
            data: {
              userId: user.id,
              title: broadcast.title,
              content: broadcast.message,
              type: 'SYSTEM_MESSAGE'
            }
          })
        )
      );
    }

    // Send emails
    if (broadcast.channels.includes('EMAIL')) {
      await Promise.all(
        targetUsers.map(user =>
          emailService.sendBroadcastEmail(user.email, user.name, broadcast.title, broadcast.message)
        )
      );
    }

    // Update broadcast status
    await prisma.broadcastMessage.update({
      where: { id: broadcastId },
      data: { 
        status: 'SENT',
        sentAt: new Date(),
        recipientCount: targetUsers.length
      }
    });
  } catch (error) {
    console.error('Process broadcast error:', error);
  }
};

const processEmailCampaign = async (campaignId) => {
  try {
    const campaign = await prisma.emailCampaign.findUnique({
      where: { id: campaignId }
    });

    if (!campaign) return;

    // Build target criteria based on segment
    let whereConditions = { status: 'ACTIVE' };

    if (campaign.targetSegment) {
      // Apply segment-specific targeting logic here
      // This would be based on your segmentation strategy
    }

    const targetUsers = await prisma.user.findMany({
      where: whereConditions,
      select: { id: true, email: true, name: true }
    });

    // Send emails
    await Promise.all(
      targetUsers.map(user =>
        emailService.sendCampaignEmail(
          user.email, 
          user.name, 
          campaign.subject, 
          campaign.htmlContent,
          campaign.textContent
        )
      )
    );

    // Update campaign status
    await prisma.emailCampaign.update({
      where: { id: campaignId },
      data: { 
        status: 'SENT',
        sentAt: new Date(),
        recipientCount: targetUsers.length
      }
    });
  } catch (error) {
    console.error('Process email campaign error:', error);
  }
};

module.exports = {
  createBroadcastMessage,
  sendTargetedNotification,
  createEmailCampaign,
  sendPushNotification,
  getCommunicationHistory,
  getCommunicationStats
};
