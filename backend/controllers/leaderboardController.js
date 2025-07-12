const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getGlobalLeaderboard = async (req, res) => {
  try {
    const { type = 'overall', period = 'all', limit = 50 } = req.query;

    let orderBy = {};
    let whereConditions = {
      isPublic: true,
      status: 'ACTIVE'
    };

    // Date filter for period
    if (period !== 'all') {
      const now = new Date();
      let startDate;
      
      switch (period) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'year':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
      }
      
      if (startDate) {
        whereConditions.createdAt = { gte: startDate };
      }
    }

    let users;

    switch (type) {
      case 'rating':
        users = await prisma.user.findMany({
          where: {
            ...whereConditions,
            reputation: {
              totalRatings: { gte: 3 }
            }
          },
          include: {
            reputation: true,
            _count: {
              select: {
                swapRequestsReceived: { where: { status: 'COMPLETED' } }
              }
            }
          },
          orderBy: {
            reputation: { overallRating: 'desc' }
          },
          take: parseInt(limit)
        });
        break;

      case 'swaps':
        users = await prisma.user.findMany({
          where: whereConditions,
          include: {
            reputation: true,
            _count: {
              select: {
                swapRequestsReceived: { where: { status: 'COMPLETED' } },
                swapRequestsSent: { where: { status: 'COMPLETED' } }
              }
            }
          },
          orderBy: {
            reputation: { completedSwaps: 'desc' }
          },
          take: parseInt(limit)
        });
        break;

      case 'credits':
        users = await prisma.user.findMany({
          where: whereConditions,
          include: {
            reputation: true,
            credits: true,
            _count: {
              select: {
                swapRequestsReceived: { where: { status: 'COMPLETED' } }
              }
            }
          },
          orderBy: {
            credits: { earned: 'desc' }
          },
          take: parseInt(limit)
        });
        break;

      case 'achievements':
        users = await prisma.user.findMany({
          where: whereConditions,
          include: {
            reputation: true,
            _count: {
              select: {
                achievements: { where: { isVisible: true } },
                swapRequestsReceived: { where: { status: 'COMPLETED' } }
              }
            }
          },
          orderBy: {
            achievements: { _count: 'desc' }
          },
          take: parseInt(limit)
        });
        break;

      default: // overall
        users = await prisma.user.findMany({
          where: whereConditions,
          include: {
            reputation: true,
            credits: true,
            _count: {
              select: {
                achievements: { where: { isVisible: true } },
                swapRequestsReceived: { where: { status: 'COMPLETED' } }
              }
            }
          },
          orderBy: [
            { reputation: { trustScore: 'desc' } },
            { reputation: { overallRating: 'desc' } },
            { reputation: { completedSwaps: 'desc' } }
          ],
          take: parseInt(limit)
        });
    }

    const leaderboard = users.map((user, index) => {
      const { passwordHash, ...userWithoutPassword } = user;
      return {
        rank: index + 1,
        ...userWithoutPassword
      };
    });

    res.json({
      leaderboard,
      type,
      period,
      total: leaderboard.length
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ error: 'Failed to get leaderboard' });
  }
};

const getSkillLeaderboard = async (req, res) => {
  try {
    const { skillName, category, limit = 20 } = req.query;

    if (!skillName && !category) {
      return res.status(400).json({ error: 'Either skillName or category is required' });
    }

    let whereConditions = {
      user: {
        isPublic: true,
        status: 'ACTIVE'
      }
    };

    if (skillName) {
      whereConditions.skillName = { contains: skillName, mode: 'insensitive' };
    }

    if (category) {
      whereConditions.category = category;
    }

    const skillExperts = await prisma.skillOffered.findMany({
      where: whereConditions,
      include: {
        user: {
          include: {
            reputation: true,
            _count: {
              select: {
                swapRequestsReceived: { 
                  where: { 
                    status: 'COMPLETED',
                    skillRequested: skillName ? { contains: skillName, mode: 'insensitive' } : undefined
                  }
                }
              }
            }
          }
        }
      },
      orderBy: [
        { level: 'desc' },
        { user: { reputation: { overallRating: 'desc' } } },
        { user: { reputation: { completedSwaps: 'desc' } } }
      ],
      take: parseInt(limit)
    });

    const leaderboard = skillExperts.map((skill, index) => {
      const { passwordHash, ...userWithoutPassword } = skill.user;
      return {
        rank: index + 1,
        user: userWithoutPassword,
        skill: {
          name: skill.skillName,
          level: skill.level,
          category: skill.category,
          description: skill.description
        }
      };
    });

    res.json({
      leaderboard,
      skill: skillName,
      category,
      total: leaderboard.length
    });
  } catch (error) {
    console.error('Get skill leaderboard error:', error);
    res.status(500).json({ error: 'Failed to get skill leaderboard' });
  }
};

const getUserRank = async (req, res) => {
  try {
    const { type = 'overall' } = req.query;
    const userId = req.user.id;

    let rank = 0;

    switch (type) {
      case 'rating':
        const ratingRank = await prisma.user.count({
          where: {
            isPublic: true,
            status: 'ACTIVE',
            reputation: {
              totalRatings: { gte: 3 },
              overallRating: { gte: req.user.reputation?.overallRating || 0 }
            }
          }
        });
        rank = ratingRank;
        break;

      case 'swaps':
        const swapRank = await prisma.user.count({
          where: {
            isPublic: true,
            status: 'ACTIVE',
            reputation: {
              completedSwaps: { gte: req.user.reputation?.completedSwaps || 0 }
            }
          }
        });
        rank = swapRank;
        break;

      case 'credits':
        const userCredits = await prisma.creditBalance.findUnique({
          where: { userId }
        });
        
        const creditRank = await prisma.user.count({
          where: {
            isPublic: true,
            status: 'ACTIVE',
            credits: {
              earned: { gte: userCredits?.earned || 0 }
            }
          }
        });
        rank = creditRank;
        break;

      default: // overall
        const overallRank = await prisma.user.count({
          where: {
            isPublic: true,
            status: 'ACTIVE',
            reputation: {
              trustScore: { gte: req.user.reputation?.trustScore || 0 }
            }
          }
        });
        rank = overallRank;
    }

    res.json({
      rank,
      type,
      userId
    });
  } catch (error) {
    console.error('Get user rank error:', error);
    res.status(500).json({ error: 'Failed to get user rank' });
  }
};

const getCommunityStats = async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalSwaps,
      completedSwaps,
      totalSkills,
      totalAchievements,
      totalCredits,
      averageRating
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: { 
          status: 'ACTIVE',
          updatedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      }),
      prisma.swapRequest.count(),
      prisma.swapRequest.count({ where: { status: 'COMPLETED' } }),
      prisma.skillOffered.count(),
      prisma.userAchievement.count(),
      prisma.creditBalance.aggregate({
        _sum: { earned: true }
      }),
      prisma.review.aggregate({
        _avg: { overall: true }
      })
    ]);

    res.json({
      totalUsers,
      activeUsers,
      totalSwaps,
      completedSwaps,
      totalSkills,
      totalAchievements,
      totalCredits: totalCredits._sum.earned || 0,
      averageRating: averageRating._avg.overall || 0,
      swapCompletionRate: totalSwaps > 0 ? (completedSwaps / totalSwaps * 100).toFixed(1) : 0
    });
  } catch (error) {
    console.error('Get community stats error:', error);
    res.status(500).json({ error: 'Failed to get community stats' });
  }
};

module.exports = {
  getGlobalLeaderboard,
  getSkillLeaderboard,
  getUserRank,
  getCommunityStats
};
