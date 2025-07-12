const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

const shareProfile = async (req, res) => {
  try {
    const { platform, customMessage } = req.body;
    const userId = req.user.id;

    // Get user profile data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        skillsOffered: true,
        reputation: true,
        _count: {
          select: {
            swapRequestsReceived: { where: { status: 'COMPLETED' } }
          }
        }
      }
    });

    if (!user.isPublic) {
      return res.status(400).json({ error: 'Profile must be public to share' });
    }

    const profileUrl = `${process.env.FRONTEND_URL}/profile/${userId}`;
    const shareText = customMessage || `Check out my skill-sharing profile on Skill Swap! I offer ${user.skillsOffered.length} skills and have completed ${user._count.swapRequestsReceived} successful exchanges.`;

    // Generate platform-specific sharing URLs
    const sharingUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}&quote=${encodeURIComponent(shareText)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(profileUrl)}&hashtags=SkillSwap,Learning`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}&summary=${encodeURIComponent(shareText)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + profileUrl)}`
    };

    // Track social share
    await prisma.socialStats.update({
      where: { userId },
      data: { profileShares: { increment: 1 } }
    });

    // Award credits for sharing
    await awardCredits(userId, 2, 'SOCIAL_SHARE', `Profile shared on ${platform}`);

    res.json({
      message: 'Share link generated successfully',
      shareUrl: sharingUrls[platform] || sharingUrls.facebook,
      allUrls: sharingUrls
    });
  } catch (error) {
    console.error('Share profile error:', error);
    res.status(500).json({ error: 'Failed to generate share link' });
  }
};

const shareSkill = async (req, res) => {
  try {
    const { skillId, platform, customMessage } = req.body;

    const skill = await prisma.skillOffered.findUnique({
      where: { 
        id: skillId,
        userId: req.user.id
      },
      include: {
        user: {
          select: { name: true, profilePhoto: true }
        }
      }
    });

    if (!skill) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    const skillUrl = `${process.env.FRONTEND_URL}/skills/${skillId}`;
    const shareText = customMessage || `I'm offering ${skill.skillName} (${skill.level} level) on Skill Swap! Let's exchange skills and learn together.`;

    const sharingUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(skillUrl)}&quote=${encodeURIComponent(shareText)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(skillUrl)}&hashtags=${skill.category.replace(/\s+/g, '')},SkillSwap`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(skillUrl)}&summary=${encodeURIComponent(shareText)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + skillUrl)}`
    };

    // Track skill share
    await prisma.socialStats.update({
      where: { userId: req.user.id },
      data: { skillShares: { increment: 1 } }
    });

    res.json({
      message: 'Skill share link generated successfully',
      shareUrl: sharingUrls[platform] || sharingUrls.facebook,
      allUrls: sharingUrls
    });
  } catch (error) {
    console.error('Share skill error:', error);
    res.status(500).json({ error: 'Failed to generate skill share link' });
  }
};

const shareSwapSuccess = async (req, res) => {
  try {
    const { swapRequestId, platform, customMessage } = req.body;

    const swapRequest = await prisma.swapRequest.findUnique({
      where: { id: swapRequestId },
      include: {
        requester: { select: { name: true } },
        receiver: { select: { name: true } },
        reviews: {
          where: { reviewerId: req.user.id },
          select: { overall: true, review: true }
        }
      }
    });

    if (!swapRequest) {
      return res.status(404).json({ error: 'Swap request not found' });
    }

    if (swapRequest.requesterId !== req.user.id && swapRequest.receiverId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (swapRequest.status !== 'COMPLETED') {
      return res.status(400).json({ error: 'Can only share completed swaps' });
    }

    const otherUser = swapRequest.requesterId === req.user.id ? 
      swapRequest.receiver : swapRequest.requester;

    const shareText = customMessage || `Just completed an amazing skill exchange on Skill Swap! I ${swapRequest.requesterId === req.user.id ? 'taught' : 'learned'} ${swapRequest.requesterId === req.user.id ? swapRequest.skillOffered : swapRequest.skillRequested} ${swapRequest.requesterId === req.user.id ? 'and learned' : 'from'} ${otherUser.name}. The future of learning is here! 🎯`;

    const appUrl = `${process.env.FRONTEND_URL}`;
    
    const sharingUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(appUrl)}&quote=${encodeURIComponent(shareText)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(appUrl)}&hashtags=SkillSwap,Learning,Success`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(appUrl)}&summary=${encodeURIComponent(shareText)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + appUrl)}`
    };

    // Track review share if review exists
    if (swapRequest.reviews.length > 0) {
      await prisma.review.update({
        where: { 
          swapRequestId_reviewerId: {
            swapRequestId,
            reviewerId: req.user.id
          }
        },
        data: { socialShared: true }
      });

      await prisma.socialStats.update({
        where: { userId: req.user.id },
        data: { reviewShares: { increment: 1 } }
      });
    }

    res.json({
      message: 'Success story share link generated',
      shareUrl: sharingUrls[platform] || sharingUrls.facebook,
      allUrls: sharingUrls
    });
  } catch (error) {
    console.error('Share swap success error:', error);
    res.status(500).json({ error: 'Failed to generate success story share link' });
  }
};

const shareAchievement = async (req, res) => {
  try {
    const { achievementId, platform, autoPost = false } = req.body;

    const userAchievement = await prisma.userAchievement.findUnique({
      where: {
        userId_achievementId: {
          userId: req.user.id,
          achievementId
        }
      },
      include: {
        achievement: true
      }
    });

    if (!userAchievement) {
      return res.status(404).json({ error: 'Achievement not found' });
    }

    const shareText = `🎉 Achievement Unlocked! I just earned the "${userAchievement.achievement.name}" badge on Skill Swap! ${userAchievement.achievement.description} Join me in the skill-sharing revolution!`;
    const appUrl = `${process.env.FRONTEND_URL}`;

    const sharingUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(appUrl)}&quote=${encodeURIComponent(shareText)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(appUrl)}&hashtags=Achievement,SkillSwap,Learning`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(appUrl)}&summary=${encodeURIComponent(shareText)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + appUrl)}`
    };

    // If auto-post is enabled and user has connected social accounts
    if (autoPost) {
      const socialProfile = await prisma.socialProfile.findUnique({
        where: { userId: req.user.id }
      });

      if (socialProfile) {
        // Here you would integrate with social media APIs to auto-post
        // For now, we'll just log the intent
        console.log(`Auto-posting achievement to ${platform} for user ${req.user.id}`);
      }
    }

    res.json({
      message: 'Achievement share link generated',
      shareUrl: sharingUrls[platform] || sharingUrls.facebook,
      allUrls: sharingUrls
    });
  } catch (error) {
    console.error('Share achievement error:', error);
    res.status(500).json({ error: 'Failed to generate achievement share link' });
  }
};

const generateReferralLink = async (req, res) => {
  try {
    const { platform, campaign } = req.body;
    const userId = req.user.id;

    // Generate unique referral code
    const referralCode = crypto.randomBytes(8).toString('hex');
    const referralUrl = `${process.env.FRONTEND_URL}/join?ref=${referralCode}&from=${userId}`;

    // Store referral tracking
    await prisma.referralTracking.create({
      data: {
        referrerId: userId,
        referralCode,
        platform,
        campaign: campaign || 'general'
      }
    });

    const shareText = `Join me on Skill Swap - the platform where you can learn any skill by teaching what you know! Use my referral link to get started with bonus credits. 🚀`;

    const sharingUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralUrl)}&quote=${encodeURIComponent(shareText)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(referralUrl)}&hashtags=SkillSwap,Learning,Referral`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralUrl)}&summary=${encodeURIComponent(shareText)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + referralUrl)}`,
      email: `mailto:?subject=Join me on Skill Swap&body=${encodeURIComponent(shareText + '\n\n' + referralUrl)}`
    };

    res.json({
      message: 'Referral link generated successfully',
      referralCode,
      referralUrl,
      shareUrl: sharingUrls[platform] || sharingUrls.facebook,
      allUrls: sharingUrls
    });
  } catch (error) {
    console.error('Generate referral link error:', error);
    res.status(500).json({ error: 'Failed to generate referral link' });
  }
};

const importSocialProfile = async (req, res) => {
  try {
    const { provider, profile } = req.body;

    // Update user profile with imported data
    const updateData = {};
    
    if (profile.name && !req.user.name) {
      updateData.name = profile.name;
    }
    
    if (profile.location && !req.user.location) {
      updateData.location = profile.location;
    }
    
    if (profile.bio && !req.user.bio) {
      updateData.bio = profile.bio.substring(0, 250);
    }

    if (profile.profilePhoto && !req.user.profilePhoto) {
      // Here you would download and store the profile photo
      updateData.profilePhoto = profile.profilePhoto;
    }

    // Update social profile connections
    await prisma.socialProfile.upsert({
      where: { userId: req.user.id },
      update: {
        [provider + 'Id']: profile.id
      },
      create: {
        userId: req.user.id,
        [provider + 'Id']: profile.id
      }
    });

    // Update user profile if there's new data
    if (Object.keys(updateData).length > 0) {
      await prisma.user.update({
        where: { id: req.user.id },
        data: updateData
      });
    }

    res.json({
      message: 'Social profile imported successfully',
      imported: updateData
    });
  } catch (error) {
    console.error('Import social profile error:', error);
    res.status(500).json({ error: 'Failed to import social profile' });
  }
};

const findSocialConnections = async (req, res) => {
  try {
    const { contacts } = req.body; // Array of email addresses or social IDs

    const connections = await prisma.user.findMany({
      where: {
        OR: [
          { email: { in: contacts } },
          {
            socialProfiles: {
              OR: [
                { googleId: { in: contacts } },
                { facebookId: { in: contacts } },
                { linkedInId: { in: contacts } }
              ]
            }
          }
        ],
        id: { not: req.user.id },
        isPublic: true,
        status: 'ACTIVE'
      },
      select: {
        id: true,
        name: true,
        profilePhoto: true,
        skillsOffered: {
          select: { skillName: true, category: true }
        },
        reputation: {
          select: { overallRating: true, totalRatings: true }
        }
      }
    });

    res.json({
      message: 'Social connections found',
      connections,
      count: connections.length
    });
  } catch (error) {
    console.error('Find social connections error:', error);
    res.status(500).json({ error: 'Failed to find social connections' });
  }
};

const getSocialStats = async (req, res) => {
  try {
    const stats = await prisma.socialStats.findUnique({
      where: { userId: req.user.id }
    });

    const referralStats = await prisma.referralTracking.aggregate({
      where: { referrerId: req.user.id },
      _count: { id: true },
      _sum: { conversions: true }
    });

    res.json({
      socialStats: stats || {
        profileShares: 0,
        skillShares: 0,
        reviewShares: 0,
        referrals: 0
      },
      referralStats: {
        totalReferrals: referralStats._count.id,
        conversions: referralStats._sum.conversions || 0
      }
    });
  } catch (error) {
    console.error('Get social stats error:', error);
    res.status(500).json({ error: 'Failed to get social stats' });
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

module.exports = {
  shareProfile,
  shareSkill,
  shareSwapSuccess,
  shareAchievement,
  generateReferralLink,
  importSocialProfile,
  findSocialConnections,
  getSocialStats
};
