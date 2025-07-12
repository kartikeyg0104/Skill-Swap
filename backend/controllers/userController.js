const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        skillsOffered: true,
        skillsWanted: true,
        availability: true,
        reputation: true,
        credits: true,
        socialStats: true,
        achievements: {
          include: {
            achievement: true
          }
        }
      }
    });

    const { passwordHash, ...userResponse } = user;
    res.json(userResponse);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, bio, location, isPublic } = req.body;
    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (location !== undefined) updateData.location = location;
    if (isPublic !== undefined) updateData.isPublic = isPublic;

    // Handle profile photo upload
    if (req.file) {
      // Delete old profile photo if exists
      const currentUser = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { profilePhoto: true }
      });

      if (currentUser.profilePhoto) {
        const oldPhotoPath = path.join(__dirname, '../uploads', currentUser.profilePhoto);
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
        }
      }

      updateData.profilePhoto = req.file.filename;
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      include: {
        skillsOffered: true,
        skillsWanted: true,
        availability: true,
        reputation: true
      }
    });

    const { passwordHash, ...userResponse } = updatedUser;
    res.json({
      message: 'Profile updated successfully',
      user: userResponse
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

const updateAvailability = async (req, res) => {
  try {
    const { timeSlots, format, duration, timezone } = req.body;

    const availability = await prisma.availability.upsert({
      where: { userId: req.user.id },
      update: {
        timeSlots,
        format,
        duration,
        timezone
      },
      create: {
        userId: req.user.id,
        timeSlots,
        format,
        duration,
        timezone
      }
    });

    res.json({
      message: 'Availability updated successfully',
      availability
    });
  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({ error: 'Failed to update availability' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await prisma.user.update({
      where: { id: req.user.id },
      data: { passwordHash: newPasswordHash }
    });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;

    // Verify password
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Password is incorrect' });
    }

    // Delete user (cascade will handle related records)
    await prisma.user.delete({
      where: { id: req.user.id }
    });

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
};

const getPublicProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { 
        id: parseInt(id),
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
        _count: {
          select: {
            swapRequestsReceived: { where: { status: 'COMPLETED' } }
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found or profile is private' });
    }

    const { passwordHash, email, ...publicProfile } = user;
    res.json(publicProfile);
  } catch (error) {
    console.error('Get public profile error:', error);
    res.status(500).json({ error: 'Failed to get public profile' });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);

    // Check if user is updating their own profile
    if (req.user.id !== userId) {
      return res.status(403).json({ error: 'Can only update your own profile' });
    }

    const { name, bio, location, isPublic } = req.body;
    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (location !== undefined) updateData.location = location;
    if (isPublic !== undefined) updateData.isPublic = isPublic;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: {
        skillsOffered: true,
        skillsWanted: true,
        availability: true,
        reputation: true
      }
    });

    const { passwordHash, ...userResponse } = updatedUser;
    res.json({
      message: 'Profile updated successfully',
      user: userResponse
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

const uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Delete old profile photo if exists
    const currentUser = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { profilePhoto: true }
    });

    if (currentUser.profilePhoto) {
      const oldPhotoPath = path.join(__dirname, '../uploads', currentUser.profilePhoto);
      if (fs.existsSync(oldPhotoPath)) {
        fs.unlinkSync(oldPhotoPath);
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { profilePhoto: req.file.filename },
      select: { id: true, profilePhoto: true }
    });

    res.json({
      message: 'Profile photo uploaded successfully',
      profilePhoto: `/uploads/${updatedUser.profilePhoto}`
    });
  } catch (error) {
    console.error('Upload profile photo error:', error);
    res.status(500).json({ error: 'Failed to upload profile photo' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updateAvailability,
  changePassword,
  deleteAccount,
  getPublicProfile,
  updateUserProfile,
  uploadProfilePhoto
};
