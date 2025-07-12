const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const searchUsers = async (req, res) => {
  try {
    const { 
      keyword, 
      location, 
      skillLevel, 
      sessionFormat, 
      category,
      minRating,
      isAvailable,
      page = 1,
      limit = 12
    } = req.query;

    const skip = (page - 1) * limit;
    const take = parseInt(limit);

    // Build search conditions
    const whereConditions = {
      AND: [
        { isPublic: true },
        { status: 'ACTIVE' },
        { isVerified: true }
      ]
    };

    // Keyword search in name, bio, and skills
    if (keyword) {
      whereConditions.AND.push({
        OR: [
          { name: { contains: keyword, mode: 'insensitive' } },
          { bio: { contains: keyword, mode: 'insensitive' } },
          { skillsOffered: { some: { skillName: { contains: keyword, mode: 'insensitive' } } } }
        ]
      });
    }

    // Location filter
    if (location) {
      whereConditions.AND.push({
        location: { contains: location, mode: 'insensitive' }
      });
    }

    // Skill level filter
    if (skillLevel) {
      whereConditions.AND.push({
        skillsOffered: { some: { level: skillLevel } }
      });
    }

    // Session format filter
    if (sessionFormat) {
      whereConditions.AND.push({
        availability: { format: sessionFormat }
      });
    }

    // Category filter
    if (category) {
      whereConditions.AND.push({
        skillsOffered: { some: { category: category } }
      });
    }

    // Rating filter
    if (minRating) {
      whereConditions.AND.push({
        reputation: { overallRating: { gte: parseFloat(minRating) } }
      });
    }

    // Availability filter
    if (isAvailable === 'true') {
      whereConditions.AND.push({
        availability: { isNot: null }
      });
    }

    const users = await prisma.user.findMany({
      where: whereConditions,
      include: {
        skillsOffered: true,
        skillsWanted: true,
        availability: true,
        reputation: true,
        _count: {
          select: {
            reviewsReceived: true,
            swapRequestsReceived: { where: { status: 'COMPLETED' } }
          }
        }
      },
      skip,
      take,
      orderBy: [
        { reputation: { overallRating: 'desc' } },
        { createdAt: 'desc' }
      ]
    });

    const totalUsers = await prisma.user.count({ where: whereConditions });

    const usersResponse = users.map(user => {
      const { passwordHash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    res.json({
      users: usersResponse,
      pagination: {
        page: parseInt(page),
        limit: take,
        total: totalUsers,
        totalPages: Math.ceil(totalUsers / take)
      }
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
};

const getSkillSuggestions = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.length < 2) {
      return res.json([]);
    }

    const suggestions = await prisma.skillOffered.findMany({
      where: {
        skillName: { contains: query, mode: 'insensitive' },
        user: { isPublic: true, status: 'ACTIVE' }
      },
      select: { skillName: true, category: true },
      distinct: ['skillName'],
      take: 10
    });

    res.json(suggestions);
  } catch (error) {
    console.error('Get skill suggestions error:', error);
    res.status(500).json({ error: 'Failed to get skill suggestions' });
  }
};

const getFeaturedUsers = async (req, res) => {
  try {
    const featuredUsers = await prisma.user.findMany({
      where: {
        isPublic: true,
        status: 'ACTIVE',
        isVerified: true,
        reputation: {
          overallRating: { gte: 4.0 },
          totalRatings: { gte: 5 }
        }
      },
      include: {
        skillsOffered: true,
        reputation: true,
        _count: {
          select: {
            reviewsReceived: true,
            swapRequestsReceived: { where: { status: 'COMPLETED' } }
          }
        }
      },
      take: 8,
      orderBy: [
        { reputation: { overallRating: 'desc' } },
        { reputation: { totalRatings: 'desc' } }
      ]
    });

    const featuredResponse = featuredUsers.map(user => {
      const { passwordHash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    res.json(featuredResponse);
  } catch (error) {
    console.error('Get featured users error:', error);
    res.status(500).json({ error: 'Failed to get featured users' });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { 
        id: parseInt(userId),
        isPublic: true,
        status: 'ACTIVE'
      },
      include: {
        skillsOffered: true,
        skillsWanted: true,
        availability: true,
        reputation: true,
        reviewsReceived: {
          where: { isPublic: true },
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            reviewer: {
              select: { name: true, profilePhoto: true }
            }
          }
        },
        achievements: {
          where: { isVisible: true },
          include: {
            achievement: true
          }
        },
        _count: {
          select: {
            reviewsReceived: true,
            swapRequestsReceived: { where: { status: 'COMPLETED' } }
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found or profile is private' });
    }

    const { passwordHash, ...userResponse } = user;
    res.json(userResponse);
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
};

const getSkillsByCategory = async (req, res) => {
  try {
    const categories = await prisma.skillCategory.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });

    const categoriesWithSkills = await Promise.all(
      categories.map(async (category) => {
        const skills = await prisma.skillOffered.findMany({
          where: {
            category: category.name,
            user: { isPublic: true, status: 'ACTIVE' }
          },
          select: { skillName: true },
          distinct: ['skillName'],
          take: 10
        });

        return {
          ...category,
          skills: skills.map(s => s.skillName)
        };
      })
    );

    res.json(categoriesWithSkills);
  } catch (error) {
    console.error('Get skills by category error:', error);
    res.status(500).json({ error: 'Failed to get skills by category' });
  }
};

// Get users for discovery page with enhanced formatting
const getDiscoveryUsers = async (req, res) => {
  try {
    const { 
      search = '', 
      location, 
      skillLevel, 
      category,
      page = 1,
      limit = 12
    } = req.query;

    const skip = (page - 1) * limit;
    const take = parseInt(limit);

    // Build search conditions
    const whereConditions = {
      AND: [
        { isPublic: true },
        { status: 'ACTIVE' }
      ]
    };

    // Search in name, bio, and skills
    if (search) {
      whereConditions.AND.push({
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { bio: { contains: search, mode: 'insensitive' } },
          { skillsOffered: { some: { skillName: { contains: search, mode: 'insensitive' } } } }
        ]
      });
    }

    // Location filter
    if (location) {
      whereConditions.AND.push({
        location: { contains: location, mode: 'insensitive' }
      });
    }

    // Skill level filter
    if (skillLevel) {
      whereConditions.AND.push({
        skillsOffered: { some: { level: skillLevel } }
      });
    }

    // Category filter
    if (category) {
      whereConditions.AND.push({
        skillsOffered: { some: { category: { contains: category, mode: 'insensitive' } } }
      });
    }

    const users = await prisma.user.findMany({
      where: whereConditions,
      include: {
        skillsOffered: {
          select: {
            skillName: true,
            level: true,
            category: true
          }
        },
        skillsWanted: {
          select: {
            skillName: true,
            priority: true,
            targetLevel: true
          }
        },
        reputation: {
          select: {
            overallRating: true,
            totalRatings: true
          }
        },
        _count: {
          select: {
            reviewsReceived: true,
            swapRequestsReceived: { where: { status: 'COMPLETED' } }
          }
        }
      },
      skip,
      take,
      orderBy: [
        { reputation: { overallRating: 'desc' } },
        { createdAt: 'desc' }
      ]
    });

    // Format users for frontend
    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      location: user.location,
      bio: user.bio,
      profilePhoto: user.profilePhoto,
      isVerified: user.isVerified,
      rating: user.reputation?.overallRating || 0,
      reviewCount: user._count.reviewsReceived,
      completedSwaps: user._count.swapRequestsReceived,
      skills: user.skillsOffered.map(skill => skill.skillName),
      skillsDetailed: user.skillsOffered,
      seeking: user.skillsWanted.map(skill => skill.skillName),
      seekingDetailed: user.skillsWanted,
      memberSince: user.createdAt
    }));

    const totalUsers = await prisma.user.count({ where: whereConditions });

    res.json({
      users: formattedUsers,
      pagination: {
        page: parseInt(page),
        limit: take,
        total: totalUsers,
        totalPages: Math.ceil(totalUsers / take),
        hasMore: skip + take < totalUsers
      }
    });
  } catch (error) {
    console.error('Get discovery users error:', error);
    res.status(500).json({ error: 'Failed to get discovery users' });
  }
};

// Get popular skill categories for discovery filters
const getPopularCategories = async (req, res) => {
  try {
    const categories = await prisma.skillOffered.groupBy({
      by: ['category'],
      _count: {
        category: true
      },
      where: {
        user: {
          isPublic: true,
          status: 'ACTIVE'
        }
      },
      orderBy: {
        _count: {
          category: 'desc'
        }
      },
      take: 10
    });

    const formattedCategories = categories.map(cat => ({
      name: cat.category,
      count: cat._count.category
    }));

    res.json({ categories: formattedCategories });
  } catch (error) {
    console.error('Get popular categories error:', error);
    res.status(500).json({ error: 'Failed to get popular categories' });
  }
};

module.exports = {
  searchUsers,
  getSkillSuggestions,
  getFeaturedUsers,
  getUserProfile,
  getSkillsByCategory,
  getDiscoveryUsers,
  getPopularCategories
};
