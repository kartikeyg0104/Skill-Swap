const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getDashboardStats = async (req, res) => {
  try {
    const { period = '30d' } = req.query;

    // Calculate date range
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
      userStats,
      swapStats,
      contentStats,
      revenueStats,
      topSkills,
      recentActivity
    ] = await Promise.all([
      // User statistics
      Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { createdAt: { gte: startDate } } }),
        prisma.user.count({ where: { status: 'ACTIVE' } }),
        prisma.user.count({ where: { isVerified: true } }),
        prisma.user.count({ where: { status: 'SUSPENDED' } }),
        prisma.user.count({ where: { status: 'BANNED' } })
      ]),

      // Swap statistics
      Promise.all([
        prisma.swapRequest.count(),
        prisma.swapRequest.count({ where: { createdAt: { gte: startDate } } }),
        prisma.swapRequest.count({ where: { status: 'COMPLETED' } }),
        prisma.swapRequest.count({ where: { status: 'PENDING' } }),
        prisma.swapRequest.count({ where: { status: 'CANCELLED' } })
      ]),

      // Content statistics
      Promise.all([
        prisma.skillOffered.count(),
        prisma.review.count(),
        prisma.message.count({ where: { createdAt: { gte: startDate } } }),
        prisma.report.count({ where: { status: 'PENDING' } })
      ]),

      // Revenue/Credits statistics
      Promise.all([
        prisma.creditBalance.aggregate({ _sum: { earned: true } }),
        prisma.creditTransaction.count({ where: { createdAt: { gte: startDate } } })
      ]),

      // Top skills
      prisma.skillOffered.groupBy({
        by: ['skillName'],
        _count: { skillName: true },
        orderBy: { _count: { skillName: 'desc' } },
        take: 10
      }),

      // Recent activity
      Promise.all([
        prisma.user.findMany({
          where: { createdAt: { gte: startDate } },
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: { id: true, name: true, email: true, createdAt: true }
        }),
        prisma.swapRequest.findMany({
          where: { createdAt: { gte: startDate } },
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            requester: { select: { name: true } },
            receiver: { select: { name: true } }
          }
        })
      ])
    ]);

    const [totalUsers, newUsers, activeUsers, verifiedUsers, suspendedUsers, bannedUsers] = userStats;
    const [totalSwaps, newSwaps, completedSwaps, pendingSwaps, cancelledSwaps] = swapStats;
    const [totalSkills, totalReviews, newMessages, pendingReports] = contentStats;
    const [totalCredits, newTransactions] = revenueStats;
    const [newUsersActivity, newSwapsActivity] = recentActivity;

    // Calculate growth rates
    const userGrowthRate = totalUsers > 0 ? ((newUsers / totalUsers) * 100).toFixed(1) : 0;
    const swapSuccessRate = totalSwaps > 0 ? ((completedSwaps / totalSwaps) * 100).toFixed(1) : 0;

    res.json({
      period,
      overview: {
        totalUsers,
        newUsers,
        activeUsers,
        verifiedUsers,
        userGrowthRate: parseFloat(userGrowthRate)
      },
      swaps: {
        totalSwaps,
        newSwaps,
        completedSwaps,
        pendingSwaps,
        cancelledSwaps,
        successRate: parseFloat(swapSuccessRate)
      },
      content: {
        totalSkills,
        totalReviews,
        newMessages,
        pendingReports
      },
      credits: {
        totalEarned: totalCredits._sum.earned || 0,
        newTransactions
      },
      moderation: {
        suspendedUsers,
        bannedUsers,
        pendingReports
      },
      topSkills: topSkills.map(skill => ({
        name: skill.skillName,
        count: skill._count.skillName
      })),
      recentActivity: {
        newUsers: newUsersActivity,
        newSwaps: newSwapsActivity
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to get dashboard statistics' });
  }
};

const getUsers = async (req, res) => {
  try {
    const { 
      status, 
      search, 
      verified, 
      sortBy = 'createdAt', 
      sortOrder = 'desc',
      page = 1, 
      limit = 20 
    } = req.query;

    const skip = (page - 1) * limit;
    const take = parseInt(limit);

    let whereConditions = {};

    if (status) {
      whereConditions.status = status;
    }

    if (verified !== undefined) {
      whereConditions.isVerified = verified === 'true';
    }

    if (search) {
      whereConditions.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const users = await prisma.user.findMany({
      where: whereConditions,
      include: {
        reputation: true,
        credits: true,
        _count: {
          select: {
            skillsOffered: true,
            swapRequestsReceived: { where: { status: 'COMPLETED' } },
            reportsMade: true,
            reportsReceived: true
          }
        }
      },
      skip,
      take,
      orderBy: { [sortBy]: sortOrder }
    });

    const total = await prisma.user.count({ where: whereConditions });

    // Remove sensitive data
    const sanitizedUsers = users.map(user => {
      const { passwordHash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    res.json({
      users: sanitizedUsers,
      pagination: {
        page: parseInt(page),
        limit: take,
        total,
        totalPages: Math.ceil(total / take)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, reason } = req.body;

    const user = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { status },
      select: { id: true, name: true, email: true, status: true }
    });

    // Create admin action log
    await prisma.adminAction.create({
      data: {
        adminId: req.user.id,
        action: 'USER_STATUS_CHANGE',
        targetUserId: parseInt(userId),
        details: { status, reason },
        timestamp: new Date()
      }
    });

    // Send notification to user
    await prisma.notification.create({
      data: {
        userId: parseInt(userId),
        title: `Account ${status}`,
        content: reason || `Your account status has been changed to ${status}`,
        type: 'SYSTEM_MESSAGE'
      }
    });

    res.json({
      message: 'User status updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
};

const getReports = async (req, res) => {
  try {
    const { 
      status = 'PENDING', 
      priority,
      page = 1, 
      limit = 20 
    } = req.query;

    const skip = (page - 1) * limit;
    const take = parseInt(limit);

    let whereConditions = { status };

    if (priority) {
      whereConditions.priority = priority;
    }

    const reports = await prisma.report.findMany({
      where: whereConditions,
      include: {
        reporter: {
          select: { id: true, name: true, email: true }
        },
        reportedUser: {
          select: { id: true, name: true, email: true, status: true }
        }
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.report.count({ where: whereConditions });

    res.json({
      reports,
      pagination: {
        page: parseInt(page),
        limit: take,
        total,
        totalPages: Math.ceil(total / take)
      }
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ error: 'Failed to get reports' });
  }
};

const resolveReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { action, reason } = req.body;

    const report = await prisma.report.findUnique({
      where: { id: parseInt(reportId) },
      include: {
        reportedUser: { select: { id: true, name: true } }
      }
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Update report status
    await prisma.report.update({
      where: { id: parseInt(reportId) },
      data: {
        status: 'RESOLVED',
        resolvedBy: req.user.id,
        resolvedAt: new Date(),
        resolution: action
      }
    });

    // Take action based on admin decision
    if (action === 'SUSPEND_USER') {
      await prisma.user.update({
        where: { id: report.reportedUserId },
        data: { status: 'SUSPENDED' }
      });
    } else if (action === 'BAN_USER') {
      await prisma.user.update({
        where: { id: report.reportedUserId },
        data: { status: 'BANNED' }
      });
    }

    // Log admin action
    await prisma.adminAction.create({
      data: {
        adminId: req.user.id,
        action: 'REPORT_RESOLVED',
        targetUserId: report.reportedUserId,
        details: { reportId: parseInt(reportId), action, reason },
        timestamp: new Date()
      }
    });

    res.json({
      message: 'Report resolved successfully',
      action
    });
  } catch (error) {
    console.error('Resolve report error:', error);
    res.status(500).json({ error: 'Failed to resolve report' });
  }
};

const getSwapMonitoring = async (req, res) => {
  try {
    const { status, timeframe = '24h', page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;
    const take = parseInt(limit);

    // Calculate time range
    let startDate;
    switch (timeframe) {
      case '1h':
        startDate = new Date(Date.now() - 60 * 60 * 1000);
        break;
      case '24h':
        startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
    }

    let whereConditions = {
      updatedAt: { gte: startDate }
    };

    if (status) {
      whereConditions.status = status;
    }

    const swaps = await prisma.swapRequest.findMany({
      where: whereConditions,
      include: {
        requester: {
          select: { id: true, name: true, email: true, reputation: true }
        },
        receiver: {
          select: { id: true, name: true, email: true, reputation: true }
        },
        scheduledSession: true,
        completion: true,
        reviews: {
          select: { overall: true, review: true }
        },
        _count: {
          select: { messages: true }
        }
      },
      skip,
      take,
      orderBy: { updatedAt: 'desc' }
    });

    const total = await prisma.swapRequest.count({ where: whereConditions });

    // Get real-time statistics
    const stats = await Promise.all([
      prisma.swapRequest.count({
        where: { ...whereConditions, status: 'PENDING' }
      }),
      prisma.swapRequest.count({
        where: { ...whereConditions, status: 'ACTIVE' }
      }),
      prisma.swapRequest.count({
        where: { ...whereConditions, status: 'COMPLETED' }
      }),
      prisma.swapRequest.count({
        where: { ...whereConditions, status: 'CANCELLED' }
      })
    ]);

    const [pending, active, completed, cancelled] = stats;

    res.json({
      swaps,
      pagination: {
        page: parseInt(page),
        limit: take,
        total,
        totalPages: Math.ceil(total / take)
      },
      stats: {
        pending,
        active,
        completed,
        cancelled,
        timeframe
      }
    });
  } catch (error) {
    console.error('Get swap monitoring error:', error);
    res.status(500).json({ error: 'Failed to get swap monitoring data' });
  }
};

const getContentModeration = async (req, res) => {
  try {
    const { type = 'skills', status = 'pending', page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    const take = parseInt(limit);

    let data = [];
    let total = 0;

    if (type === 'skills') {
      const whereConditions = status === 'pending' ? { verified: false } : {};
      
      data = await prisma.skillOffered.findMany({
        where: whereConditions,
        include: {
          user: {
            select: { id: true, name: true, email: true }
          }
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' }
      });

      total = await prisma.skillOffered.count({ where: whereConditions });
    } else if (type === 'reviews') {
      data = await prisma.review.findMany({
        where: { isPublic: true },
        include: {
          reviewer: { select: { name: true } },
          reviewee: { select: { name: true } },
          swapRequest: { select: { skillOffered: true, skillRequested: true } }
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' }
      });

      total = await prisma.review.count({ where: { isPublic: true } });
    }

    res.json({
      content: data,
      pagination: {
        page: parseInt(page),
        limit: take,
        total,
        totalPages: Math.ceil(total / take)
      },
      type
    });
  } catch (error) {
    console.error('Get content moderation error:', error);
    res.status(500).json({ error: 'Failed to get content moderation data' });
  }
};

const moderateContent = async (req, res) => {
  try {
    const { contentType, contentId, action, reason } = req.body;

    if (contentType === 'skill') {
      await prisma.skillOffered.update({
        where: { id: parseInt(contentId) },
        data: { 
          verified: action === 'approve',
          ...(action === 'reject' && { description: `[REJECTED] ${reason}` })
        }
      });
    } else if (contentType === 'review') {
      await prisma.review.update({
        where: { id: parseInt(contentId) },
        data: { isPublic: action === 'approve' }
      });
    }

    // Log moderation action
    await prisma.adminAction.create({
      data: {
        adminId: req.user.id,
        action: 'CONTENT_MODERATION',
        details: { contentType, contentId, action, reason },
        timestamp: new Date()
      }
    });

    res.json({
      message: `Content ${action}d successfully`
    });
  } catch (error) {
    console.error('Moderate content error:', error);
    res.status(500).json({ error: 'Failed to moderate content' });
  }
};

const getAdminActions = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;
    const take = parseInt(limit);

    const actions = await prisma.adminAction.findMany({
      include: {
        admin: {
          select: { id: true, name: true, email: true }
        },
        targetUser: {
          select: { id: true, name: true, email: true }
        }
      },
      skip,
      take,
      orderBy: { timestamp: 'desc' }
    });

    const total = await prisma.adminAction.count();

    res.json({
      actions,
      pagination: {
        page: parseInt(page),
        limit: take,
        total,
        totalPages: Math.ceil(total / take)
      }
    });
  } catch (error) {
    console.error('Get admin actions error:', error);
    res.status(500).json({ error: 'Failed to get admin actions' });
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  updateUserStatus,
  getReports,
  resolveReport,
  getSwapMonitoring,
  getContentModeration,
  moderateContent,
  getAdminActions
};
