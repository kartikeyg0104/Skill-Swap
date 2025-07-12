const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Create a new post
const createPost = async (req, res) => {
  try {
    const { content, hashtags = [] } = req.body;
    const authorId = req.user.id;

    // Handle image upload if present
    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    // Extract hashtags from content if not provided
    const extractedHashtags = hashtags.length > 0 ? hashtags : 
      (content.match(/#\w+/g) || []).map(tag => tag.toLowerCase());

    const post = await prisma.post.create({
      data: {
        authorId,
        content,
        imageUrl,
        hashtags: extractedHashtags
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            profilePhoto: true,
            isVerified: true
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      }
    });

    // Update trending topics
    if (extractedHashtags.length > 0) {
      await Promise.all(
        extractedHashtags.map(async (tag) => {
          await prisma.trendingTopic.upsert({
            where: { tag },
            update: { postCount: { increment: 1 } },
            create: { tag, postCount: 1 }
          });
        })
      );
    }

    res.status(201).json({
      message: 'Post created successfully',
      post: {
        ...post,
        likes: post._count.likes,
        comments: post._count.comments,
        shares: 0, // Not implemented yet
        liked: false,
        bookmarked: false
      }
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
};

// Get posts for feed (from followed users + own posts)
const getFeed = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user.id;
    const skip = (page - 1) * limit;
    const take = parseInt(limit);

    // Get users that the current user follows
    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true }
    });

    const followingIds = following.map(f => f.followingId);
    const feedUserIds = [userId, ...followingIds];

    const posts = await prisma.post.findMany({
      where: {
        authorId: { in: feedUserIds },
        isPublic: true
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            profilePhoto: true,
            isVerified: true
          }
        },
        likes: {
          where: { userId },
          select: { id: true }
        },
        bookmarks: {
          where: { userId },
          select: { id: true }
        },
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' }
    });

    const postsWithUserData = posts.map(post => ({
      ...post,
      likes: post._count.likes,
      comments: post._count.comments,
      shares: 0, // Not implemented yet
      liked: post.likes.length > 0,
      bookmarked: post.bookmarks.length > 0,
      timestamp: getRelativeTime(post.createdAt)
    }));

    res.json({
      posts: postsWithUserData,
      pagination: {
        page: parseInt(page),
        limit: take,
        hasMore: posts.length === take
      }
    });
  } catch (error) {
    console.error('Get feed error:', error);
    res.status(500).json({ error: 'Failed to get feed' });
  }
};

// Get all posts (public feed)
const getPublicFeed = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user.id;
    const skip = (page - 1) * limit;
    const take = parseInt(limit);

    const posts = await prisma.post.findMany({
      where: { isPublic: true },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            profilePhoto: true,
            isVerified: true
          }
        },
        likes: {
          where: { userId },
          select: { id: true }
        },
        bookmarks: {
          where: { userId },
          select: { id: true }
        },
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' }
    });

    const postsWithUserData = posts.map(post => ({
      ...post,
      likes: post._count.likes,
      comments: post._count.comments,
      shares: 0, // Not implemented yet
      liked: post.likes.length > 0,
      bookmarked: post.bookmarks.length > 0,
      timestamp: getRelativeTime(post.createdAt)
    }));

    res.json({
      posts: postsWithUserData,
      pagination: {
        page: parseInt(page),
        limit: take,
        hasMore: posts.length === take
      }
    });
  } catch (error) {
    console.error('Get public feed error:', error);
    res.status(500).json({ error: 'Failed to get public feed' });
  }
};

// Like/Unlike a post
const toggleLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const existingLike = await prisma.postLike.findUnique({
      where: {
        postId_userId: {
          postId: parseInt(postId),
          userId
        }
      }
    });

    if (existingLike) {
      // Unlike
      await prisma.postLike.delete({
        where: { id: existingLike.id }
      });
    } else {
      // Like
      await prisma.postLike.create({
        data: {
          postId: parseInt(postId),
          userId
        }
      });
    }

    const likesCount = await prisma.postLike.count({
      where: { postId: parseInt(postId) }
    });

    res.json({
      message: existingLike ? 'Post unliked' : 'Post liked',
      liked: !existingLike,
      likesCount
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({ error: 'Failed to toggle like' });
  }
};

// Bookmark/Unbookmark a post
const toggleBookmark = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const existingBookmark = await prisma.postBookmark.findUnique({
      where: {
        postId_userId: {
          postId: parseInt(postId),
          userId
        }
      }
    });

    if (existingBookmark) {
      // Remove bookmark
      await prisma.postBookmark.delete({
        where: { id: existingBookmark.id }
      });
    } else {
      // Add bookmark
      await prisma.postBookmark.create({
        data: {
          postId: parseInt(postId),
          userId
        }
      });
    }

    res.json({
      message: existingBookmark ? 'Post unbookmarked' : 'Post bookmarked',
      bookmarked: !existingBookmark
    });
  } catch (error) {
    console.error('Toggle bookmark error:', error);
    res.status(500).json({ error: 'Failed to toggle bookmark' });
  }
};

// Add comment to a post
const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const authorId = req.user.id;

    const comment = await prisma.postComment.create({
      data: {
        postId: parseInt(postId),
        authorId,
        content
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            profilePhoto: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Comment added successfully',
      comment: {
        ...comment,
        timestamp: getRelativeTime(comment.createdAt)
      }
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
};

// Get comments for a post
const getComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    const take = parseInt(limit);

    const comments = await prisma.postComment.findMany({
      where: { postId: parseInt(postId) },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            profilePhoto: true
          }
        }
      },
      skip,
      take,
      orderBy: { createdAt: 'asc' }
    });

    const commentsWithTimestamp = comments.map(comment => ({
      ...comment,
      timestamp: getRelativeTime(comment.createdAt)
    }));

    res.json({
      comments: commentsWithTimestamp,
      pagination: {
        page: parseInt(page),
        limit: take,
        hasMore: comments.length === take
      }
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Failed to get comments' });
  }
};

// Follow/Unfollow a user
const toggleFollow = async (req, res) => {
  try {
    const { userId } = req.params;
    const followerId = req.user.id;
    const followingId = parseInt(userId);

    if (followerId === followingId) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId
        }
      }
    });

    if (existingFollow) {
      // Unfollow
      await prisma.follow.delete({
        where: { id: existingFollow.id }
      });
    } else {
      // Follow
      await prisma.follow.create({
        data: {
          followerId,
          followingId
        }
      });
    }

    const followersCount = await prisma.follow.count({
      where: { followingId }
    });

    const followingCount = await prisma.follow.count({
      where: { followerId: followingId }
    });

    res.json({
      message: existingFollow ? 'User unfollowed' : 'User followed',
      isFollowing: !existingFollow,
      followersCount,
      followingCount
    });
  } catch (error) {
    console.error('Toggle follow error:', error);
    res.status(500).json({ error: 'Failed to toggle follow' });
  }
};

// Get user's followers
const getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    const take = parseInt(limit);

    const followers = await prisma.follow.findMany({
      where: { followingId: parseInt(userId) },
      include: {
        follower: {
          select: {
            id: true,
            name: true,
            profilePhoto: true,
            bio: true,
            isVerified: true
          }
        }
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      followers: followers.map(f => f.follower),
      pagination: {
        page: parseInt(page),
        limit: take,
        hasMore: followers.length === take
      }
    });
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({ error: 'Failed to get followers' });
  }
};

// Get user's following
const getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    const take = parseInt(limit);

    const following = await prisma.follow.findMany({
      where: { followerId: parseInt(userId) },
      include: {
        following: {
          select: {
            id: true,
            name: true,
            profilePhoto: true,
            bio: true,
            isVerified: true
          }
        }
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      following: following.map(f => f.following),
      pagination: {
        page: parseInt(page),
        limit: take,
        hasMore: following.length === take
      }
    });
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({ error: 'Failed to get following' });
  }
};

// Get trending topics
const getTrendingTopics = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const trendingTopics = await prisma.trendingTopic.findMany({
      orderBy: { postCount: 'desc' },
      take: parseInt(limit)
    });

    res.json({
      topics: trendingTopics.map(topic => ({
        tag: topic.tag,
        posts: `${topic.postCount} posts`
      }))
    });
  } catch (error) {
    console.error('Get trending topics error:', error);
    res.status(500).json({ error: 'Failed to get trending topics' });
  }
};

// Get user's social stats
const getUserSocialStats = async (req, res) => {
  try {
    const { userId } = req.params;
    const targetUserId = parseInt(userId);
    const currentUserId = req.user.id;

    const [postsCount, followersCount, followingCount, isFollowing] = await Promise.all([
      prisma.post.count({ where: { authorId: targetUserId } }),
      prisma.follow.count({ where: { followingId: targetUserId } }),
      prisma.follow.count({ where: { followerId: targetUserId } }),
      prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: targetUserId
          }
        }
      })
    ]);

    res.json({
      postsCount,
      followersCount,
      followingCount,
      isFollowing: !!isFollowing
    });
  } catch (error) {
    console.error('Get user social stats error:', error);
    res.status(500).json({ error: 'Failed to get user social stats' });
  }
};

// Get suggested users to follow
const getSuggestedUsers = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 5 } = req.query;

    // Get users that the current user is not following
    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true }
    });

    const followingIds = following.map(f => f.followingId);
    const excludeIds = [userId, ...followingIds];

    // Get users with mutual connections (people followed by people you follow)
    const suggestedUsers = await prisma.user.findMany({
      where: {
        id: { notIn: excludeIds },
        isPublic: true,
        status: 'ACTIVE'
      },
      include: {
        skillsOffered: {
          select: { skillName: true },
          take: 3
        },
        _count: {
          select: {
            followers: true,
            following: true
          }
        }
      },
      take: parseInt(limit),
      orderBy: {
        followers: { _count: 'desc' }
      }
    });

    const suggestedResponse = suggestedUsers.map(user => ({
      id: user.id,
      name: user.name,
      profilePhoto: user.profilePhoto,
      bio: user.bio,
      skillsOffered: user.skillsOffered,
      mutualConnections: 0, // Would need more complex query for actual mutual connections
      followersCount: user._count.followers,
      followingCount: user._count.following
    }));

    res.json({
      suggestedUsers: suggestedResponse
    });
  } catch (error) {
    console.error('Get suggested users error:', error);
    res.status(500).json({ error: 'Failed to get suggested users' });
  }
};

// Helper function to get relative time
const getRelativeTime = (date) => {
  const now = new Date();
  const diff = now - new Date(date);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  return new Date(date).toLocaleDateString();
};

module.exports = {
  createPost,
  getFeed,
  getPublicFeed,
  toggleLike,
  toggleBookmark,
  addComment,
  getComments,
  toggleFollow,
  getFollowers,
  getFollowing,
  getTrendingTopics,
  getUserSocialStats,
  getSuggestedUsers
};
