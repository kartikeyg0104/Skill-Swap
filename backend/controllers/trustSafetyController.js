const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const requestVerification = async (req, res) => {
  try {
    const { type, documents } = req.body;

    // Simple implementation - auto-approve verification for development
    await prisma.user.update({
      where: { id: req.user.id },
      data: { isVerified: true }
    });

    res.status(201).json({
      message: 'Verification request submitted and approved successfully',
      status: 'APPROVED',
      type: type || 'identity',
      approvedAt: new Date()
    });
  } catch (error) {
    console.error('Request verification error:', error);
    res.status(500).json({ error: 'Failed to submit verification request' });
  }
};

const getVerificationStatus = async (req, res) => {
  try {
    // Simple implementation - return user's verification status
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        isVerified: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({
      isVerified: user.isVerified,
      verificationDate: user.isVerified ? user.updatedAt : null,
      status: user.isVerified ? 'VERIFIED' : 'PENDING',
      message: user.isVerified ? 'Your account is verified' : 'Verification pending'
    });
  } catch (error) {
    console.error('Get verification status error:', error);
    res.status(500).json({ error: 'Failed to get verification status' });
  }
};

const endorseSkill = async (req, res) => {
  try {
    const { userId, skillName, message } = req.body;

    // Check if user has completed a swap with the endorsee for this skill
    const completedSwap = await prisma.swapRequest.findFirst({
      where: {
        OR: [
          { requesterId: req.user.id, receiverId: userId, skillRequested: skillName },
          { requesterId: userId, receiverId: req.user.id, skillOffered: skillName }
        ],
        status: 'COMPLETED'
      }
    });

    if (!completedSwap) {
      return res.status(400).json({ 
        error: 'Can only endorse skills from completed swap sessions' 
      });
    }

    // Check if already endorsed
    const existingEndorsement = await prisma.endorsement.findUnique({
      where: {
        endorserId_endorseeId_skillName: {
          endorserId: req.user.id,
          endorseeId: userId,
          skillName
        }
      }
    });

    if (existingEndorsement) {
      return res.status(400).json({ error: 'You have already endorsed this skill' });
    }

    const endorsement = await prisma.endorsement.create({
      data: {
        endorserId: req.user.id,
        endorseeId: userId,
        skillName,
        message
      },
      include: {
        endorser: { select: { id: true, name: true, profilePhoto: true } }
      }
    });

    // Update skill as endorsed
    await prisma.skillOffered.updateMany({
      where: {
        userId,
        skillName
      },
      data: { endorsed: true }
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId,
        title: 'Skill Endorsed',
        content: `${req.user.name} endorsed your ${skillName} skill`,
        type: 'SYSTEM_MESSAGE',
        actionUrl: `/endorsements`
      }
    });

    res.status(201).json({
      message: 'Skill endorsed successfully',
      endorsement
    });
  } catch (error) {
    console.error('Endorse skill error:', error);
    res.status(500).json({ error: 'Failed to endorse skill' });
  }
};

const reportUser = async (req, res) => {
  try {
    const { reportedUserId, reason, description, evidence } = req.body;

    // Check if user is trying to report themselves
    if (reportedUserId === req.user.id) {
      return res.status(400).json({ error: 'Cannot report yourself' });
    }

    // Check if user exists
    const reportedUser = await prisma.user.findUnique({
      where: { id: reportedUserId },
      select: { id: true, status: true }
    });

    if (!reportedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const report = await prisma.report.create({
      data: {
        reporterId: req.user.id,
        reportedUserId,
        reason,
        description,
        evidence: evidence || [],
        status: 'PENDING'
      }
    });

    // Create admin notification for serious reports
    if (['HARASSMENT', 'INAPPROPRIATE_CONTENT', 'FRAUD'].includes(reason)) {
      await prisma.adminNotification.create({
        data: {
          title: 'High Priority Report',
          content: `User ${req.user.name} reported ${reportedUser.id} for ${reason}`,
          priority: 'HIGH',
          type: 'SAFETY_REPORT',
          relatedEntityId: report.id
        }
      });
    }

    res.status(201).json({
      message: 'Report submitted successfully',
      report: { id: report.id, status: report.status }
    });
  } catch (error) {
    console.error('Report user error:', error);
    res.status(500).json({ error: 'Failed to submit report' });
  }
};

const calculateTrustScore = async (req, res) => {
  try {
    const { userId } = req.params;
    const targetUserId = userId ? parseInt(userId) : req.user.id;

    // Get user data for trust score calculation
    const [
      user,
      completedSwaps,
      averageRating,
      verificationBadges,
      endorsements,
      reportCount
    ] = await Promise.all([
      prisma.user.findUnique({
        where: { id: targetUserId },
        select: { createdAt: true, isVerified: true }
      }),
      prisma.swapRequest.count({
        where: {
          OR: [{ requesterId: targetUserId }, { receiverId: targetUserId }],
          status: 'COMPLETED'
        }
      }),
      prisma.review.aggregate({
        where: { revieweeId: targetUserId },
        _avg: { overall: true },
        _count: { overall: true }
      }),
      prisma.verificationBadge.count({
        where: { userId: targetUserId, isActive: true }
      }),
      prisma.endorsement.count({
        where: { endorseeId: targetUserId }
      }),
      prisma.report.count({
        where: { reportedUserId: targetUserId, status: { not: 'DISMISSED' } }
      })
    ]);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate trust score components
    const accountAge = Math.min((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24 * 30), 12); // months, max 12
    const emailVerified = user.isVerified ? 1 : 0;
    const swapHistory = Math.min(completedSwaps * 2, 40); // max 40 points
    const ratingScore = averageRating._avg.overall ? averageRating._avg.overall * 10 : 0;
    const verificationScore = verificationBadges * 5; // 5 points per badge
    const endorsementScore = Math.min(endorsements * 2, 20); // max 20 points
    const reportPenalty = reportCount * -10; // -10 points per report

    const trustScore = Math.max(0, Math.min(100, 
      accountAge * 2 +           // Account age (max 24 points)
      emailVerified * 5 +        // Email verification (5 points)
      swapHistory +              // Swap history (max 40 points)
      ratingScore +              // Average rating (max 50 points)
      verificationScore +        // Verification badges
      endorsementScore +         // Endorsements (max 20 points)
      reportPenalty              // Report penalty
    ));

    // Update user's trust score
    await prisma.reputation.update({
      where: { userId: targetUserId },
      data: { trustScore: Math.round(trustScore) }
    });

    res.json({
      trustScore: Math.round(trustScore),
      components: {
        accountAge: Math.round(accountAge * 2),
        emailVerified: emailVerified * 5,
        swapHistory,
        ratingScore: Math.round(ratingScore),
        verificationScore,
        endorsementScore,
        reportPenalty
      },
      metrics: {
        completedSwaps,
        averageRating: averageRating._avg.overall || 0,
        totalReviews: averageRating._count.overall,
        verificationBadges,
        endorsements,
        reports: reportCount
      }
    });
  } catch (error) {
    console.error('Calculate trust score error:', error);
    res.status(500).json({ error: 'Failed to calculate trust score' });
  }
};

const getDisputes = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    const take = parseInt(limit);

    let whereConditions = {
      OR: [
        { initiatorId: req.user.id },
        { respondentId: req.user.id }
      ]
    };

    if (status) {
      whereConditions.status = status;
    }

    const disputes = await prisma.dispute.findMany({
      where: whereConditions,
      include: {
        initiator: { select: { id: true, name: true, profilePhoto: true } },
        respondent: { select: { id: true, name: true, profilePhoto: true } },
        swapRequest: { select: { skillOffered: true, skillRequested: true } },
        messages: {
          include: {
            sender: { select: { id: true, name: true } }
          },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.dispute.count({ where: whereConditions });

    res.json({
      disputes,
      pagination: {
        page: parseInt(page),
        limit: take,
        total,
        totalPages: Math.ceil(total / take)
      }
    });
  } catch (error) {
    console.error('Get disputes error:', error);
    res.status(500).json({ error: 'Failed to get disputes' });
  }
};

const createDispute = async (req, res) => {
  try {
    const { swapRequestId, respondentId, reason, description } = req.body;

    // Verify swap request and user involvement
    const swapRequest = await prisma.swapRequest.findUnique({
      where: { id: swapRequestId }
    });

    if (!swapRequest) {
      return res.status(404).json({ error: 'Swap request not found' });
    }

    if (swapRequest.requesterId !== req.user.id && swapRequest.receiverId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check for existing dispute
    const existingDispute = await prisma.dispute.findFirst({
      where: {
        swapRequestId,
        status: { in: ['OPEN', 'UNDER_REVIEW'] }
      }
    });

    if (existingDispute) {
      return res.status(400).json({ error: 'Dispute already exists for this swap request' });
    }

    const dispute = await prisma.dispute.create({
      data: {
        swapRequestId,
        initiatorId: req.user.id,
        respondentId,
        reason,
        description,
        status: 'OPEN'
      },
      include: {
        initiator: { select: { id: true, name: true } },
        respondent: { select: { id: true, name: true } }
      }
    });

    // Notify respondent
    await prisma.notification.create({
      data: {
        userId: respondentId,
        title: 'Dispute Opened',
        content: `${req.user.name} opened a dispute regarding your swap`,
        type: 'SYSTEM_MESSAGE',
        actionUrl: `/disputes/${dispute.id}`
      }
    });

    res.status(201).json({
      message: 'Dispute created successfully',
      dispute
    });
  } catch (error) {
    console.error('Create dispute error:', error);
    res.status(500).json({ error: 'Failed to create dispute' });
  }
};

module.exports = {
  requestVerification,
  getVerificationStatus,
  endorseSkill,
  reportUser,
  calculateTrustScore,
  getDisputes,
  createDispute
};
