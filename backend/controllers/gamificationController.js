const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getAchievements = async (req, res) => {
  try {
    const { userId } = req.params;
    const targetUserId = userId ? parseInt(userId) : req.user.id;

    const userAchievements = await prisma.userAchievement.findMany({
      where: { 
        userId: targetUserId,
        isVisible: true
      },
      include: {
        achievement: true
      },
      orderBy: { earnedAt: 'desc' }
    });

    const availableAchievements = await prisma.achievement.findMany({
      where: {
        isActive: true,
        NOT: {
          userAchievements: {
            some: { userId: targetUserId }
          }
        }
      }
    });

    res.json({
      earned: userAchievements,
      available: availableAchievements
    });
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({ error: 'Failed to get achievements' });
  }
};

const checkAndAwardAchievements = async (userId, eventType, eventData = {}) => {
  try {
    const achievements = await prisma.achievement.findMany({
      where: { 
        isActive: true,
        category: eventType
      }
    });

    for (const achievement of achievements) {
      const criteria = JSON.parse(achievement.criteria);
      const hasAchievement = await prisma.userAchievement.findUnique({
        where: {
          userId_achievementId: {
            userId,
            achievementId: achievement.id
          }
        }
      });

      if (!hasAchievement && await checkAchievementCriteria(userId, criteria, eventData)) {
        await prisma.userAchievement.create({
          data: {
            userId,
            achievementId: achievement.id
          }
        });

        // Create notification
        await prisma.notification.create({
          data: {
            userId,
            title: 'Achievement Unlocked!',
            content: `You've earned the "${achievement.name}" achievement!`,
            type: 'ACHIEVEMENT_EARNED',
            actionUrl: `/achievements`
          }
        });

        // Award credits
        await awardCredits(userId, criteria.credits || 10, 'ACHIEVEMENT', `Achievement: ${achievement.name}`);
      }
    }
  } catch (error) {
    console.error('Check achievements error:', error);
  }
};

const checkAchievementCriteria = async (userId, criteria, eventData) => {
  try {
    switch (criteria.type) {
      case 'FIRST_SWAP':
        const firstSwap = await prisma.swapRequest.findFirst({
          where: {
            OR: [
              { requesterId: userId },
              { receiverId: userId }
            ],
            status: 'COMPLETED'
          }
        });
        return !!firstSwap;

      case 'SWAP_COUNT':
        const swapCount = await prisma.swapRequest.count({
          where: {
            OR: [
              { requesterId: userId },
              { receiverId: userId }
            ],
            status: 'COMPLETED'
          }
        });
        return swapCount >= criteria.count;

      case 'RATING_AVERAGE':
        const ratingStats = await prisma.review.aggregate({
          where: { revieweeId: userId },
          _avg: { overall: true },
          _count: { overall: true }
        });
        return ratingStats._count.overall >= criteria.minReviews && 
               ratingStats._avg.overall >= criteria.minRating;

      case 'SKILL_DIVERSITY':
        const skillCount = await prisma.skillOffered.count({
          where: { userId },
          distinct: ['category']
        });
        return skillCount >= criteria.count;

      case 'CONSECUTIVE_DAYS':
        // This would require tracking daily activity
        return false; // Placeholder

      default:
        return false;
    }
  } catch (error) {
    console.error('Check criteria error:', error);
    return false;
  }
};

const getCreditBalance = async (req, res) => {
  try {
    const creditBalance = await prisma.creditBalance.findUnique({
      where: { userId: req.user.id },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 20
        }
      }
    });

    if (!creditBalance) {
      return res.status(404).json({ error: 'Credit balance not found' });
    }

    res.json(creditBalance);
  } catch (error) {
    console.error('Get credit balance error:', error);
    res.status(500).json({ error: 'Failed to get credit balance' });
  }
};

const transferCredits = async (req, res) => {
  try {
    const { receiverId, amount, description } = req.body;

    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be positive' });
    }

    // Check sender's balance
    const senderBalance = await prisma.creditBalance.findUnique({
      where: { userId: req.user.id }
    });

    if (!senderBalance || senderBalance.balance < amount) {
      return res.status(400).json({ error: 'Insufficient credits' });
    }

    // Verify receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId }
    });

    if (!receiver) {
      return res.status(404).json({ error: 'Receiver not found' });
    }

    // Perform transfer
    await prisma.$transaction(async (tx) => {
      // Deduct from sender
      await tx.creditBalance.update({
        where: { userId: req.user.id },
        data: {
          spent: { increment: amount },
          balance: { decrement: amount }
        }
      });

      // Add to receiver
      await tx.creditBalance.update({
        where: { userId: receiverId },
        data: {
          earned: { increment: amount },
          balance: { increment: amount }
        }
      });

      // Create transactions
      await tx.creditTransaction.create({
        data: {
          creditBalanceId: senderBalance.id,
          amount: -amount,
          type: 'SPENT',
          description: `Transfer to ${receiver.name}: ${description}`
        }
      });

      const receiverBalance = await tx.creditBalance.findUnique({
        where: { userId: receiverId }
      });

      await tx.creditTransaction.create({
        data: {
          creditBalanceId: receiverBalance.id,
          amount,
          type: 'EARNED',
          description: `Transfer from ${req.user.name}: ${description}`
        }
      });
    });

    // Notify receiver
    await prisma.notification.create({
      data: {
        userId: receiverId,
        title: 'Credits Received',
        content: `${req.user.name} sent you ${amount} credits`,
        type: 'CREDIT_RECEIVED',
        actionUrl: '/credits'
      }
    });

    res.json({ message: 'Credits transferred successfully' });
  } catch (error) {
    console.error('Transfer credits error:', error);
    res.status(500).json({ error: 'Failed to transfer credits' });
  }
};

const getProgressStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await Promise.all([
      // Swap stats
      prisma.swapRequest.count({
        where: {
          OR: [
            { requesterId: userId },
            { receiverId: userId }
          ],
          status: 'COMPLETED'
        }
      }),

      // Skills taught
      prisma.swapRequest.count({
        where: {
          requesterId: userId,
          status: 'COMPLETED'
        }
      }),

      // Skills learned
      prisma.swapRequest.count({
        where: {
          receiverId: userId,
          status: 'COMPLETED'
        }
      }),

      // Average rating
      prisma.review.aggregate({
        where: { revieweeId: userId },
        _avg: { overall: true },
        _count: { overall: true }
      }),

      // Achievement count
      prisma.userAchievement.count({
        where: { userId }
      }),

      // Credit balance
      prisma.creditBalance.findUnique({
        where: { userId },
        select: { balance: true, earned: true }
      })
    ]);

    const [totalSwaps, skillsTaught, skillsLearned, ratings, achievementCount, credits] = stats;

    res.json({
      totalSwaps,
      skillsTaught,
      skillsLearned,
      averageRating: ratings._avg.overall || 0,
      totalReviews: ratings._count.overall,
      achievements: achievementCount,
      credits: credits?.balance || 0,
      creditsEarned: credits?.earned || 0
    });
  } catch (error) {
    console.error('Get progress stats error:', error);
    res.status(500).json({ error: 'Failed to get progress stats' });
  }
};

// Helper function to award credits
const awardCredits = async (userId, amount, type, description) => {
  try {
    const creditBalance = await prisma.creditBalance.findUnique({
      where: { userId }
    });

    if (creditBalance) {
      await prisma.creditBalance.update({
        where: { userId },
        data: {
          earned: { increment: amount },
          balance: { increment: amount }
        }
      });

      await prisma.creditTransaction.create({
        data: {
          creditBalanceId: creditBalance.id,
          amount,
          type,
          description
        }
      });

      // Notify user
      await prisma.notification.create({
        data: {
          userId,
          title: 'Credits Earned',
          content: `You earned ${amount} credits: ${description}`,
          type: 'CREDIT_RECEIVED',
          actionUrl: '/credits'
        }
      });
    }
  } catch (error) {
    console.error('Award credits error:', error);
  }
};

module.exports = {
  getAchievements,
  checkAndAwardAchievements,
  getCreditBalance,
  transferCredits,
  getProgressStats
};
