const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
// const emailService = require('../services/emailService');

const prisma = new PrismaClient();

const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );

  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE }
  );

  return { accessToken, refreshToken };
};

const register = async (req, res) => {
  try {
    const { name, email, password, location } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user with transaction to ensure all related records are created
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          passwordHash: hashedPassword,
          location: location || null
        }
      });

      // Create related records
      await tx.reputation.create({
        data: { userId: newUser.id }
      });

      await tx.creditBalance.create({
        data: { userId: newUser.id }
      });

      await tx.socialStats.create({
        data: { userId: newUser.id }
      });

      return newUser;
    });

    // Generate verification token and store it (in production, store in database)
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    // Send verification email (commented out until email service is properly configured)
    // await emailService.sendVerificationEmail(user.email, user.name, verificationToken);

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Remove password from response
    const { passwordHash, ...userResponse } = user;

    res.status(201).json({
      message: 'User registered successfully. Please check your email for verification.',
      user: userResponse,
      accessToken,
      refreshToken,
      verificationToken // Remove this in production
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'User already exists with this email' });
    }
    
    res.status(500).json({ error: 'Registration failed' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user with related data
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        reputation: true,
        credits: true,
        skillsOffered: true,
        skillsWanted: true,
        availability: true
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if account is active
    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ 
        error: 'Account is suspended or inactive',
        status: user.status 
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Remove password from response
    const { passwordHash, ...userResponse } = user;

    res.json({
      message: 'Login successful',
      user: userResponse,
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Check if user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, status: true }
    });

    if (!user || user.status !== 'ACTIVE') {
      return res.status(403).json({ error: 'Invalid refresh token' });
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(decoded.userId);

    res.json({
      accessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(403).json({ error: 'Invalid refresh token' });
    }
    res.status(500).json({ error: 'Token refresh failed' });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    
    // In production, you should verify the token against database records
    // For now, we'll verify based on the authenticated user
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { isVerified: true },
      select: { id: true, email: true, isVerified: true }
    });

    res.json({ 
      message: 'Email verified successfully',
      user: updatedUser 
    });
  } catch (error) {
    console.error('Email verification error:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(500).json({ error: 'Email verification failed' });
  }
};

const logout = async (req, res) => {
  try {
    // In production, you should invalidate the refresh token in database
    // For now, we'll just send a success response
    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
};

// Add a new function to get current user info
const getCurrentUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        reputation: true,
        credits: true,
        skillsOffered: true,
        skillsWanted: true,
        availability: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { passwordHash, ...userResponse } = user;
    res.json(userResponse);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  verifyEmail,
  logout,
  getCurrentUser
};
