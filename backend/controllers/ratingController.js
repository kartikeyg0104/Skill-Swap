const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const createReview = async (req, res) => {
  try {
    const { swapRequestId } = req.params;
    const {
      revieweeId,
      overall,
      teachingQuality,
      reliability,
      communication,
      review,
      isPublic = true
    } = req.body;

    // Verify swap request exists and is completed
    const swapRequest = await prisma.swapRequest.findUnique({
      where: { id: parseInt(swapRequestId) },
      include: {
        requester: { select: { id: true } },
        receiver: { select: { id: true } },
        completion: true
      }
    });

    if (!swapRequest) {
      return res.status(404).json({ error: 'Swap request not found' });
    }

    if (swapRequest.status !== 'COMPLETED') {
      return res.status(400).json({ error: 'Can only review completed swap requests' });
    }

    // Verify user is part of the swap request
    if (swapRequest.requesterId !== req.user.id && swapRequest.receiverId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if review already exists
    const existingReview = await prisma.review.findFirst({
      where: {
        swapRequestId: parseInt(swapRequestId),
        reviewerId: req.user.id
      }
    });

    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this swap request' });
    }

    // Create review
    const newReview = await prisma.review.create({
      data: {
        swapRequestId: parseInt(swapRequestId),
        reviewerId: req.user.id,
        revieweeId,
        overall,
        teachingQuality,
        reliability,
        communication,
        review,
        isPublic
      },
      include: {
        reviewer: {
          select: { id: true, name: true, profilePhoto: true }
        },
        reviewee: {
          select: { id: true, name: true, profilePhoto: true }
        }
      }
    });

    // Update reviewee's reputation
    await updateUserReputation(revieweeId);

    // Create notification
    await prisma.notification.create({
      data: {
        userId: revieweeId,
        title: 'New Review Received',
        content: `${req.user.name} left you a review with ${overall} stars`,
        type: 'REVIEW_RECEIVED',
        actionUrl: `/reviews/${newReview.id}`
      }
    });

    // Award credits for leaving review
    await awardCredits(req.user.id, 5, 'REVIEW_GIVEN', `Review for swap request #${swapRequestId}`);

    res.status(201).json({
      message: 'Review created successfully',
      review: newReview
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
};

const createReviewForSwap = async (req, res) => {
  try {
    const {
      swapId,
      revieweeId,
      overall,
      teachingQuality,
      reliability,
      communication,
      review,
      isPublic = true
    } = req.body;

    // Verify swap request exists and is completed
    const swapRequest = await prisma.swapRequest.findUnique({
      where: { id: swapId },
      include: {
        requester: { select: { id: true } },
        receiver: { select: { id: true } }
      }
    });

    if (!swapRequest) {
      return res.status(404).json({ error: 'Swap request not found' });
    }

    if (swapRequest.status !== 'COMPLETED') {
      return res.status(400).json({ error: 'Can only review completed swaps' });
    }

    // Verify user is part of the swap request
    if (swapRequest.requesterId !== req.user.id && swapRequest.receiverId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if review already exists
    const existingReview = await prisma.review.findFirst({
      where: {
        swapRequestId: swapId,
        reviewerId: req.user.id
      }
    });

    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this swap' });
    }

    const newReview = await prisma.review.create({
      data: {
        swapRequestId: swapId,
        reviewerId: req.user.id,
        revieweeId,
        overall,
        teachingQuality,
        reliability,
        communication,
        review,
        isPublic
      },
      include: {
        reviewer: {
          select: { id: true, name: true, profilePhoto: true }
        },
        reviewee: {
          select: { id: true, name: true, profilePhoto: true }
        }
      }
    });

    // Update reviewee's reputation
    await updateUserReputation(revieweeId);

    res.status(201).json({
      message: 'Review created successfully',
      review: newReview
    });
  } catch (error) {
    console.error('Create review for swap error:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
};

const getReviews = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, filter = 'all' } = req.query;
    const skip = (page - 1) * limit;
    const take = parseInt(limit);

    let whereConditions = {
      revieweeId: parseInt(userId),
      isPublic: true
    };

    // Filter by rating
    if (filter === 'positive') {
      whereConditions.overall = { gte: 4 };
    } else if (filter === 'negative') {
      whereConditions.overall = { lte: 2 };
    }

    const reviews = await prisma.review.findMany({
      where: whereConditions,
      include: {
        reviewer: {
          select: { id: true, name: true, profilePhoto: true }
        },
        swapRequest: {
          select: { skillOffered: true, skillRequested: true }
        }
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.review.count({ where: whereConditions });

    res.json({
      reviews,
      pagination: {
        page: parseInt(page),
        limit: take,
        total,
        totalPages: Math.ceil(total / take)
      }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ error: 'Failed to get reviews' });
  }
};

const getReviewsForUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    const take = parseInt(limit);

    const reviews = await prisma.review.findMany({
      where: {
        revieweeId: parseInt(userId),
        isPublic: true
      },
      include: {
        reviewer: {
          select: { id: true, name: true, profilePhoto: true }
        },
        swapRequest: {
          select: { skillOffered: true, skillRequested: true }
        }
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.review.count({
      where: { revieweeId: parseInt(userId), isPublic: true }
    });

    res.json({
      reviews,
      pagination: {
        page: parseInt(page),
        limit: take,
        total,
        totalPages: Math.ceil(total / take)
      }
    });
  } catch (error) {
    console.error('Get reviews for user error:', error);
    res.status(500).json({ error: 'Failed to get reviews' });
  }
};

const getReviewsForSwap = async (req, res) => {
  try {
    const { swapId } = req.params;

    const reviews = await prisma.review.findMany({
      where: {
        swapRequestId: parseInt(swapId),
        isPublic: true
      },
      include: {
        reviewer: {
          select: { id: true, name: true, profilePhoto: true }
        },
        reviewee: {
          select: { id: true, name: true, profilePhoto: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ reviews });
  } catch (error) {
    console.error('Get reviews for swap error:', error);
    res.status(500).json({ error: 'Failed to get reviews for swap' });
  }
};

const markReviewHelpful = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await prisma.review.update({
      where: { id: parseInt(reviewId) },
      data: { helpful: { increment: 1 } }
    });

    res.json({
      message: 'Review marked as helpful',
      helpful: review.helpful
    });
  } catch (error) {
    console.error('Mark review helpful error:', error);
    res.status(500).json({ error: 'Failed to mark review as helpful' });
  }
};

const reportReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { reason, description } = req.body;

    const review = await prisma.review.findUnique({
      where: { id: parseInt(reviewId) },
      include: { reviewee: { select: { id: true } } }
    });

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Create report
    await prisma.report.create({
      data: {
        reporterId: req.user.id,
        reportedUserId: review.reviewee.id,
        reason,
        description: `Review report: ${description}`,
        resourceType: 'REVIEW',
        resourceId: parseInt(reviewId)
      }
    });

    res.json({ message: 'Review reported successfully' });
  } catch (error) {
    console.error('Report review error:', error);
    res.status(500).json({ error: 'Failed to report review' });
  }
};

const getUserRatingStats = async (req, res) => {
  try {
    const { userId } = req.params;

    const stats = await prisma.review.aggregate({
      where: { revieweeId: parseInt(userId) },
      _avg: {
        overall: true,
        teachingQuality: true,
        reliability: true,
        communication: true
      },
      _count: {
        overall: true
      }
    });

    const ratingDistribution = await prisma.review.groupBy({
      by: ['overall'],
      where: { revieweeId: parseInt(userId) },
      _count: { overall: true }
    });

    res.json({
      averageRatings: stats._avg,
      totalReviews: stats._count.overall,
      ratingDistribution: ratingDistribution.reduce((acc, curr) => {
        acc[curr.overall] = curr._count.overall;
        return acc;
      }, {})
    });
  } catch (error) {
    console.error('Get user rating stats error:', error);
    res.status(500).json({ error: 'Failed to get rating stats' });
  }
};

// Helper function to update user reputation
const updateUserReputation = async (userId) => {
  try {
    const stats = await prisma.review.aggregate({
      where: { revieweeId: userId },
      _avg: {
        overall: true,
        teachingQuality: true,
        reliability: true,
        communication: true
      },
      _count: { overall: true }
    });

    const completedSwaps = await prisma.swapRequest.count({
      where: {
        OR: [
          { requesterId: userId },
          { receiverId: userId }
        ],
        status: 'COMPLETED'
      }
    });

    // Calculate trust score based on ratings and completed swaps
    const trustScore = Math.min(
      (stats._avg.overall || 0) * 20 + Math.min(completedSwaps * 2, 20),
      100
    );

    await prisma.reputation.update({
      where: { userId },
      data: {
        overallRating: stats._avg.overall || 0,
        totalRatings: stats._count.overall,
        trustScore,
        completedSwaps
      }
    });
  } catch (error) {
    console.error('Update reputation error:', error);
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
    }
  } catch (error) {
    console.error('Award credits error:', error);
  }
};

const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      overall,
      teachingQuality,
      reliability,
      communication,
      review,
      isPublic
    } = req.body;

    const existingReview = await prisma.review.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingReview) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (existingReview.reviewerId !== req.user.id) {
      return res.status(403).json({ error: 'Can only update your own reviews' });
    }

    const updatedReview = await prisma.review.update({
      where: { id: parseInt(id) },
      data: {
        overall,
        teachingQuality,
        reliability,
        communication,
        review,
        isPublic
      }
    });

    // Update reviewee's reputation
    await updateUserReputation(existingReview.revieweeId);

    res.json({
      message: 'Review updated successfully',
      review: updatedReview
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ error: 'Failed to update review' });
  }
};

const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await prisma.review.findUnique({
      where: { id: parseInt(id) }
    });

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (review.reviewerId !== req.user.id) {
      return res.status(403).json({ error: 'Can only delete your own reviews' });
    }

    await prisma.review.delete({
      where: { id: parseInt(id) }
    });

    // Update reviewee's reputation
    await updateUserReputation(review.revieweeId);

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
};

module.exports = {
  createReview,
  getReviews,
  markReviewHelpful,
  reportReview,
  getUserRatingStats,
  createReviewForSwap,
  getReviewsForUser,
  getReviewsForSwap,
  updateReview,
  deleteReview
};
