const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const usersRoutes = require('./routes/users');
const swapsRoutes = require('./routes/swaps');
const reviewsRoutes = require('./routes/reviews');
const discoveryRoutes = require('./routes/discovery');
const swapRequestRoutes = require('./routes/swapRequests');
const ratingRoutes = require('./routes/ratings');
const gamificationRoutes = require('./routes/gamification');
const leaderboardRoutes = require('./routes/leaderboard');
const messagingRoutes = require('./routes/messaging');
// const videoRoutes = require('./routes/video');
const trustSafetyRoutes = require('./routes/trustSafety');
const analyticsRoutes = require('./routes/analytics');
const socialRoutes = require('./routes/social');
const adminRoutes = require('./routes/admin');
const communicationRoutes = require('./routes/communication');
const reportingRoutes = require('./routes/reporting');
const skillRoutes = require('./routes/skills');
const calendarRoutes = require('./routes/calendar');
const simpleMeetingRoutes = require('./routes/simpleMeetings');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security middleware (temporarily disabled for debugging)
// app.use(helmet({
//   contentSecurityPolicy: false,
//   crossOriginEmbedderPolicy: false,
//   crossOriginResourcePolicy: false
// }));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Health check (placed early to avoid middleware restrictions)
app.get('/health', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

// Simple test endpoint
app.get('/test', (req, res) => {
  res.status(200).json({ message: 'Test endpoint working' });
});

// Rate limiting (temporarily disabled for debugging)
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100 // limit each IP to 100 requests per windowMs
// });
// app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/swaps', swapsRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/discovery', discoveryRoutes);
app.use('/api/swap-requests', swapRequestRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/messages', messagingRoutes);
// app.use('/api/video', videoRoutes);
app.use('/api/trust-safety', trustSafetyRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/communication', communicationRoutes);
app.use('/api/reporting', reportingRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/meetings', simpleMeetingRoutes);

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
