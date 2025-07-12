const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getPersonalDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get comprehensive user statistics
    const [
      swapStats,
      skillStats,
      reputationStats,
      creditStats,
      activityStats,
      recentActivity
    ] = await Promise.all([
      // Swap statistics
      Promise.all([
        prisma.swapRequest.count({
          where: {
            OR: [{ requesterId: userId }, { receiverId: userId }],
            status: 'COMPLETED'
          }
        }),
        prisma.swapRequest.count({
          where: {
            OR: [{ requesterId: userId }, { receiverId: userId }],
            status: 'PENDING'
          }
        }),
        prisma.swapRequest.count({
          where: { requesterId: userId, status: 'COMPLETED' }
        }),
        prisma.swapRequest.count({
          where: { receiverId: userId, status: 'COMPLETED' }
        })
      ]),

      // Skill statistics
      Promise.all([
        prisma.skillOffered.count({ where: { userId } }),
        prisma.skillWanted.count({ where: { userId } }),
        prisma.endorsement.count({ where: { endorseeId: userId } }),
        prisma.skillOffered.groupBy({
          by: ['category'],
          where: { userId },
          _count: { category: true }
        })
      ]),

      // Reputation statistics
      Promise.all([
        prisma.review.aggregate({
          where: { revieweeId: userId },
          _avg: { overall: true, teachingQuality: true, reliability: true, communication: true },
          _count: { overall: true }
        }),
        prisma.reputation.findUnique({
          where: { userId },
          select: { trustScore: true, badges: true }
        })
      ]),

      // Credit statistics
      prisma.creditBalance.findUnique({
        where: { userId },
        include: {
          transactions: {
            orderBy: { createdAt: 'desc' },
            take: 5
          }
        }
      }),

      // Activity statistics (last 30 days)
      Promise.all([
        prisma.swapRequest.count({
          where: {
            OR: [{ requesterId: userId }, { receiverId: userId }],
            createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
          }
        }),
        prisma.message.count({
          where: {
            senderId: userId,
            createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
          }
        })
      ]),

      // Recent activity
      prisma.swapRequest.findMany({
        where: {
          OR: [{ requesterId: userId }, { receiverId: userId }]
        },
        include: {
          requester: { select: { name: true, profilePhoto: true } },
          receiver: { select: { name: true, profilePhoto: true } }
        },
        orderBy: { updatedAt: 'desc' },
        take: 5
      })
    ]);

    const [completedSwaps, pendingSwaps, skillsTaught, skillsLearned] = swapStats;
    const [skillsOffered, skillsWanted, endorsements, skillCategories] = skillStats;
    const [ratings, reputation] = reputationStats;
    const [recentSwaps, messagesSent] = activityStats;

    // Calculate success rates and trends
    const totalSwaps = completedSwaps + pendingSwaps;
    const successRate = totalSwaps > 0 ? (completedSwaps / totalSwaps * 100).toFixed(1) : 0;

    res.json({
      summary: {
        completedSwaps,
        pendingSwaps,
        skillsTaught,
        skillsLearned,
        skillsOffered,
        skillsWanted,
        successRate: parseFloat(successRate),
        credits: creditStats?.balance || 0,
        trustScore: reputation?.trustScore || 0,
        averageRating: ratings._avg.overall || 0,
        totalReviews: ratings._count.overall
      },
      skillDistribution: skillCategories.map(cat => ({
        category: cat.category,
        count: cat._count.category
      })),
      reputationBreakdown: {
        overall: ratings._avg.overall || 0,
        teachingQuality: ratings._avg.teachingQuality || 0,
        reliability: ratings._avg.reliability || 0,
        communication: ratings._avg.communication || 0,
        endorsements,
        badges: reputation?.badges || []
      },
      activityStats: {
        recentSwaps,
        messagesSent,
        period: '30 days'
      },
      recentActivity,
      creditHistory: creditStats?.transactions || []
    });
  } catch (error) {
    console.error('Get personal dashboard error:', error);
    res.status(500).json({ error: 'Failed to get dashboard data' });
  }
};

const getSkillAnalytics = async (req, res) => {
  try {
    const { timeframe = '30d' } = req.query;

    // Calculate date range
    let startDate;
    switch (timeframe) {
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
      popularSkills,
      trendingCategories,
      successRates,
      demandSupplyAnalysis
    ] = await Promise.all([
      // Most popular skills
      prisma.swapRequest.groupBy({
        by: ['skillRequested'],
        where: {
          createdAt: { gte: startDate },
          status: { not: 'CANCELLED' }
        },
        _count: { skillRequested: true },
        orderBy: { _count: { skillRequested: 'desc' } },
        take: 10
      }),

      // Trending categories
      prisma.skillOffered.groupBy({
        by: ['category'],
        where: {
          createdAt: { gte: startDate }
        },
        _count: { category: true },
        orderBy: { _count: { category: 'desc' } }
      }),

      // Success rates by skill
      prisma.$queryRaw`
        SELECT 
          "skillRequested",
          COUNT(*) as total_requests,
          COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed_requests,
          ROUND(
            COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) * 100.0 / COUNT(*), 
            2
          ) as success_rate
        FROM "swap_requests"
        WHERE "createdAt" >= ${startDate}
        GROUP BY "skillRequested"
        HAVING COUNT(*) >= 3
        ORDER BY success_rate DESC
        LIMIT 10
      `,

      // Demand vs Supply analysis
      Promise.all([
        prisma.skillWanted.groupBy({
          by: ['skillName'],
          _count: { skillName: true },
          orderBy: { _count: { skillName: 'desc' } },
          take: 20
        }),
        prisma.skillOffered.groupBy({
          by: ['skillName'],
          _count: { skillName: true },
          orderBy: { _count: { skillName: 'desc' } },
          take: 20
        })
      ])
    ]);

    const [demandSkills, supplySkills] = demandSupplyAnalysis;

    // Calculate demand/supply ratio
    const demandSupplyRatio = demandSkills.map(demand => {
      const supply = supplySkills.find(s => s.skillName === demand.skillName);
      return {
        skill: demand.skillName,
        demand: demand._count.skillName,
        supply: supply?._count.skillName || 0,
        ratio: supply ? (demand._count.skillName / supply._count.skillName).toFixed(2) : 'High'
      };
    }).filter(item => item.supply > 0).sort((a, b) => parseFloat(b.ratio) - parseFloat(a.ratio));

    res.json({
      timeframe,
      popularSkills: popularSkills.map(skill => ({
        name: skill.skillRequested,
        requests: skill._count.skillRequested
      })),
      trendingCategories: trendingCategories.map(cat => ({
        category: cat.category,
        count: cat._count.category
      })),
      successRates: successRates.map(rate => ({
        skill: rate.skillRequested,
        totalRequests: parseInt(rate.total_requests),
        completedRequests: parseInt(rate.completed_requests),
        successRate: parseFloat(rate.success_rate)
      })),
      demandSupplyAnalysis: demandSupplyRatio.slice(0, 15)
    });
  } catch (error) {
    console.error('Get skill analytics error:', error);
    res.status(500).json({ error: 'Failed to get skill analytics' });
  }
};

const getPerformanceMetrics = async (req, res) => {
  try {
    const userId = req.user.id;
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

    // Calculate response time
    const responseTimeData = await prisma.$queryRaw`
      SELECT AVG(
        EXTRACT(EPOCH FROM (
          SELECT MIN(m."createdAt") 
          FROM "messages" m 
          WHERE m."senderId" = ${userId} 
          AND m."swapRequestId" = sr.id
        ) - sr."createdAt")
      ) / 3600 as avg_response_hours
      FROM "swap_requests" sr
      WHERE sr."receiverId" = ${userId}
      AND sr."createdAt" >= ${startDate}
      AND EXISTS (
        SELECT 1 FROM "messages" m 
        WHERE m."senderId" = ${userId} 
        AND m."swapRequestId" = sr.id
      )
    `;

    const [
      completionRate,
      satisfactionScores,
      engagementMetrics,
      responseTime
    ] = await Promise.all([
      // Completion rate
      Promise.all([
        prisma.swapRequest.count({
          where: {
            OR: [{ requesterId: userId }, { receiverId: userId }],
            createdAt: { gte: startDate },
            status: 'COMPLETED'
          }
        }),
        prisma.swapRequest.count({
          where: {
            OR: [{ requesterId: userId }, { receiverId: userId }],
            createdAt: { gte: startDate }
          }
        })
      ]),

      // Satisfaction scores from reviews
      prisma.review.aggregate({
        where: {
          revieweeId: userId,
          createdAt: { gte: startDate }
        },
        _avg: {
          overall: true,
          teachingQuality: true,
          reliability: true,
          communication: true
        },
        _count: { overall: true }
      }),

      // Engagement metrics
      Promise.all([
        prisma.message.count({
          where: {
            senderId: userId,
            createdAt: { gte: startDate }
          }
        }),
        prisma.swapRequest.count({
          where: {
            requesterId: userId,
            createdAt: { gte: startDate }
          }
        }),
        prisma.videoSession.count({
          where: {
            OR: [{ hostId: userId }, { participantId: userId }],
            createdAt: { gte: startDate },
            status: 'COMPLETED'
          }
        })
      ]),

      responseTimeData[0]?.avg_response_hours || null
    ]);

    const [completedSwaps, totalSwaps] = completionRate;
    const [messagesSent, swapRequests, videoSessions] = engagementMetrics;

    const completionRatePercent = totalSwaps > 0 ? (completedSwaps / totalSwaps * 100).toFixed(1) : 0;

    res.json({
      period,
      responseTime: responseTime ? parseFloat(responseTime).toFixed(1) : null,
      completionRate: parseFloat(completionRatePercent),
      satisfactionScores: {
        overall: satisfactionScores._avg.overall || 0,
        teachingQuality: satisfactionScores._avg.teachingQuality || 0,
        reliability: satisfactionScores._avg.reliability || 0,
        communication: satisfactionScores._avg.communication || 0,
        totalReviews: satisfactionScores._count.overall
      },
      engagementMetrics: {
        messagesSent,
        swapRequests,
        videoSessions,
        completedSwaps,
        totalSwaps
      }
    });
  } catch (error) {
    console.error('Get performance metrics error:', error);
    res.status(500).json({ error: 'Failed to get performance metrics' });
  }
};

const getLearningPath = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's current skills and interests
    const [userSkills, wantedSkills, completedSwaps] = await Promise.all([
      prisma.skillOffered.findMany({
        where: { userId },
        select: { skillName: true, category: true, level: true }
      }),
      prisma.skillWanted.findMany({
        where: { userId },
        select: { skillName: true, priority: true, targetLevel: true }
      }),
      prisma.swapRequest.findMany({
        where: {
          OR: [{ requesterId: userId }, { receiverId: userId }],
          status: 'COMPLETED'
        },
        select: { skillOffered: true, skillRequested: true }
      })
    ]);

    // Analyze skill patterns and suggest progressions
    const skillCategories = [...new Set(userSkills.map(s => s.category))];
    
    // Find complementary skills
    const complementarySkills = await prisma.$queryRaw`
      SELECT so."skillName", so."category", COUNT(*) as frequency
      FROM "skills_offered" so
      INNER JOIN "users" u ON so."userId" = u.id
      WHERE u.id IN (
        SELECT DISTINCT 
          CASE 
            WHEN sr."requesterId" = ${userId} THEN sr."receiverId"
            ELSE sr."requesterId"
          END
        FROM "swap_requests" sr
        WHERE (sr."requesterId" = ${userId} OR sr."receiverId" = ${userId})
        AND sr.status = 'COMPLETED'
      )
      AND so."skillName" NOT IN (${userSkills.map(s => s.skillName).join(',')})
      GROUP BY so."skillName", so."category"
      ORDER BY frequency DESC
      LIMIT 10
    `;

    // Suggest next steps based on current skills
    const suggestions = userSkills.map(skill => {
      const nextLevel = getNextSkillLevel(skill.level);
      return nextLevel ? {
        currentSkill: skill.skillName,
        currentLevel: skill.level,
        suggestedLevel: nextLevel,
        category: skill.category,
        reasoning: `Advance your ${skill.skillName} from ${skill.level} to ${nextLevel}`
      } : null;
    }).filter(Boolean);

    res.json({
      currentSkills: userSkills,
      wantedSkills,
      learningProgress: {
        completedSwaps: completedSwaps.length,
        skillsAcquired: completedSwaps.filter(swap => 
          swap.skillRequested && !userSkills.find(s => s.skillName === swap.skillRequested)
        ).length
      },
      recommendations: {
        skillProgression: suggestions,
        complementarySkills: complementarySkills.slice(0, 5),
        popularInCategory: skillCategories.length > 0 ? await getPopularSkillsInCategories(skillCategories) : []
      }
    });
  } catch (error) {
    console.error('Get learning path error:', error);
    res.status(500).json({ error: 'Failed to get learning path' });
  }
};

// Helper functions
const getNextSkillLevel = (currentLevel) => {
  const levels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];
  const currentIndex = levels.indexOf(currentLevel);
  return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null;
};

const getPopularSkillsInCategories = async (categories) => {
  return await prisma.skillOffered.groupBy({
    by: ['skillName', 'category'],
    where: {
      category: { in: categories }
    },
    _count: { skillName: true },
    orderBy: { _count: { skillName: 'desc' } },
    take: 10
  });
};

module.exports = {
  getPersonalDashboard,
  getSkillAnalytics,
  getPerformanceMetrics,
  getLearningPath
};
