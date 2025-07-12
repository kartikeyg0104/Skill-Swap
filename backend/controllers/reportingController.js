const { PrismaClient } = require('@prisma/client');
const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');

const prisma = new PrismaClient();

const getUserActivityReport = async (req, res) => {
  try {
    const { startDate, endDate, format = 'json' } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // User registration metrics
    const registrationData = await prisma.user.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: { gte: start, lte: end }
      },
      _count: { id: true }
    });

    // User engagement metrics
    const engagementData = await prisma.$queryRaw`
      SELECT 
        DATE(u."updatedAt") as date,
        COUNT(DISTINCT u.id) as active_users,
        COUNT(DISTINCT CASE WHEN u."createdAt" >= ${start} THEN u.id END) as new_users,
        COUNT(DISTINCT CASE WHEN sr.id IS NOT NULL THEN u.id END) as users_with_swaps,
        COUNT(DISTINCT CASE WHEN m.id IS NOT NULL THEN u.id END) as users_messaging
      FROM "users" u
      LEFT JOIN "swap_requests" sr ON (u.id = sr."requesterId" OR u.id = sr."receiverId") 
        AND sr."createdAt" >= ${start} AND sr."createdAt" <= ${end}
      LEFT JOIN "messages" m ON u.id = m."senderId" 
        AND m."createdAt" >= ${start} AND m."createdAt" <= ${end}
      WHERE u."updatedAt" >= ${start} AND u."updatedAt" <= ${end}
      GROUP BY DATE(u."updatedAt")
      ORDER BY date
    `;

    // Retention metrics
    const retentionData = await calculateRetentionMetrics(start, end);

    // User demographics
    const demographicsData = await prisma.user.groupBy({
      by: ['location'],
      where: {
        createdAt: { gte: start, lte: end },
        location: { not: null }
      },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10
    });

    const reportData = {
      period: { start, end },
      summary: {
        totalRegistrations: registrationData.reduce((sum, day) => sum + day._count.id, 0),
        averageDailyRegistrations: registrationData.length > 0 ? 
          (registrationData.reduce((sum, day) => sum + day._count.id, 0) / registrationData.length).toFixed(2) : 0
      },
      registrationTrend: registrationData,
      engagement: engagementData,
      retention: retentionData,
      demographics: demographicsData
    };

    if (format === 'csv') {
      return exportToCSV(res, reportData, 'user_activity_report');
    } else if (format === 'pdf') {
      return exportToPDF(res, reportData, 'User Activity Report');
    }

    res.json(reportData);
  } catch (error) {
    console.error('Get user activity report error:', error);
    res.status(500).json({ error: 'Failed to generate user activity report' });
  }
};

const getSwapAnalyticsReport = async (req, res) => {
  try {
    const { startDate, endDate, format = 'json' } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Swap creation and completion metrics
    const swapMetrics = await prisma.$queryRaw`
      SELECT 
        DATE(sr."createdAt") as date,
        COUNT(*) as total_requests,
        COUNT(CASE WHEN sr.status = 'COMPLETED' THEN 1 END) as completed,
        COUNT(CASE WHEN sr.status = 'CANCELLED' THEN 1 END) as cancelled,
        COUNT(CASE WHEN sr.status = 'DECLINED' THEN 1 END) as declined,
        AVG(CASE WHEN sr.status = 'COMPLETED' AND c."completedAt" IS NOT NULL 
          THEN EXTRACT(EPOCH FROM (c."completedAt" - sr."createdAt"))/86400 END) as avg_completion_days
      FROM "swap_requests" sr
      LEFT JOIN "completions" c ON sr.id = c."swapRequestId"
      WHERE sr."createdAt" >= ${start} AND sr."createdAt" <= ${end}
      GROUP BY DATE(sr."createdAt")
      ORDER BY date
    `;

    // Popular skills analysis
    const popularSkills = await prisma.swapRequest.groupBy({
      by: ['skillRequested'],
      where: {
        createdAt: { gte: start, lte: end }
      },
      _count: { skillRequested: true },
      orderBy: { _count: { skillRequested: 'desc' } },
      take: 20
    });

    // Success rate by skill category
    const categoryAnalysis = await prisma.$queryRaw`
      SELECT 
        so.category,
        COUNT(sr.id) as total_requests,
        COUNT(CASE WHEN sr.status = 'COMPLETED' THEN 1 END) as completed_requests,
        ROUND(COUNT(CASE WHEN sr.status = 'COMPLETED' THEN 1 END) * 100.0 / COUNT(sr.id), 2) as success_rate
      FROM "swap_requests" sr
      JOIN "skills_offered" so ON sr."skillRequested" = so."skillName"
      WHERE sr."createdAt" >= ${start} AND sr."createdAt" <= ${end}
      GROUP BY so.category
      HAVING COUNT(sr.id) >= 5
      ORDER BY success_rate DESC
    `;

    // Average session duration and ratings
    const sessionMetrics = await prisma.$queryRaw`
      SELECT 
        AVG(ss.duration) as avg_session_duration,
        AVG(r.overall) as avg_rating,
        COUNT(DISTINCT ss.id) as total_sessions
      FROM "scheduled_sessions" ss
      JOIN "swap_requests" sr ON ss."swapRequestId" = sr.id
      LEFT JOIN "reviews" r ON sr.id = r."swapRequestId"
      WHERE ss."createdAt" >= ${start} AND ss."createdAt" <= ${end}
    `;

    const reportData = {
      period: { start, end },
      overview: {
        totalRequests: swapMetrics.reduce((sum, day) => sum + parseInt(day.total_requests), 0),
        completionRate: swapMetrics.length > 0 ? 
          (swapMetrics.reduce((sum, day) => sum + parseInt(day.completed), 0) / 
           swapMetrics.reduce((sum, day) => sum + parseInt(day.total_requests), 0) * 100).toFixed(2) : 0,
        averageCompletionTime: sessionMetrics[0]?.avg_completion_days || 0,
        averageRating: sessionMetrics[0]?.avg_rating || 0
      },
      dailyMetrics: swapMetrics,
      popularSkills: popularSkills.map(skill => ({
        skill: skill.skillRequested,
        requests: skill._count.skillRequested
      })),
      categoryAnalysis,
      sessionMetrics: sessionMetrics[0]
    };

    if (format === 'csv') {
      return exportToCSV(res, reportData, 'swap_analytics_report');
    } else if (format === 'pdf') {
      return exportToPDF(res, reportData, 'Swap Analytics Report');
    }

    res.json(reportData);
  } catch (error) {
    console.error('Get swap analytics report error:', error);
    res.status(500).json({ error: 'Failed to generate swap analytics report' });
  }
};

const getRevenueTrackingReport = async (req, res) => {
  try {
    const { startDate, endDate, format = 'json' } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Credit transaction metrics
    const creditMetrics = await prisma.$queryRaw`
      SELECT 
        DATE(ct."createdAt") as date,
        SUM(CASE WHEN ct.type = 'EARNED' THEN ct.amount ELSE 0 END) as credits_earned,
        SUM(CASE WHEN ct.type = 'SPENT' THEN ct.amount ELSE 0 END) as credits_spent,
        COUNT(DISTINCT ct."creditBalanceId") as active_users,
        COUNT(*) as total_transactions
      FROM "credit_transactions" ct
      WHERE ct."createdAt" >= ${start} AND ct."createdAt" <= ${end}
      GROUP BY DATE(ct."createdAt")
      ORDER BY date
    `;

    // Transaction type breakdown
    const transactionTypes = await prisma.creditTransaction.groupBy({
      by: ['type', 'description'],
      where: {
        createdAt: { gte: start, lte: end }
      },
      _sum: { amount: true },
      _count: { id: true }
    });

    // Top credit earners and spenders
    const topEarners = await prisma.$queryRaw`
      SELECT 
        u.name,
        u.email,
        SUM(CASE WHEN ct.type = 'EARNED' THEN ct.amount ELSE 0 END) as total_earned,
        SUM(CASE WHEN ct.type = 'SPENT' THEN ct.amount ELSE 0 END) as total_spent
      FROM "users" u
      JOIN "credit_balance" cb ON u.id = cb."userId"
      JOIN "credit_transactions" ct ON cb.id = ct."creditBalanceId"
      WHERE ct."createdAt" >= ${start} AND ct."createdAt" <= ${end}
      GROUP BY u.id, u.name, u.email
      ORDER BY total_earned DESC
      LIMIT 20
    `;

    // Credit velocity and circulation
    const velocityMetrics = await prisma.$queryRaw`
      SELECT 
        COUNT(DISTINCT cb."userId") as active_credit_users,
        AVG(cb.balance) as avg_balance,
        SUM(cb.earned) as total_credits_in_circulation,
        AVG(cb.earned - cb.spent) as avg_net_position
      FROM "credit_balance" cb
      JOIN "users" u ON cb."userId" = u.id
      WHERE u.status = 'ACTIVE'
    `;

    const reportData = {
      period: { start, end },
      summary: {
        totalCreditsEarned: creditMetrics.reduce((sum, day) => sum + parseFloat(day.credits_earned || 0), 0),
        totalCreditsSpent: creditMetrics.reduce((sum, day) => sum + parseFloat(day.credits_spent || 0), 0),
        totalTransactions: creditMetrics.reduce((sum, day) => sum + parseInt(day.total_transactions), 0),
        activeUsers: new Set(creditMetrics.map(day => day.active_users)).size
      },
      dailyMetrics: creditMetrics,
      transactionBreakdown: transactionTypes,
      topEarners,
      velocityMetrics: velocityMetrics[0]
    };

    if (format === 'csv') {
      return exportToCSV(res, reportData, 'revenue_tracking_report');
    } else if (format === 'pdf') {
      return exportToPDF(res, reportData, 'Revenue Tracking Report');
    }

    res.json(reportData);
  } catch (error) {
    console.error('Get revenue tracking report error:', error);
    res.status(500).json({ error: 'Failed to generate revenue tracking report' });
  }
};

const getFeedbackAnalysisReport = async (req, res) => {
  try {
    const { startDate, endDate, format = 'json' } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Review sentiment analysis
    const reviewMetrics = await prisma.$queryRaw`
      SELECT 
        AVG(overall) as avg_overall_rating,
        AVG("teachingQuality") as avg_teaching_quality,
        AVG(reliability) as avg_reliability,
        AVG(communication) as avg_communication,
        COUNT(*) as total_reviews,
        COUNT(CASE WHEN overall >= 4 THEN 1 END) as positive_reviews,
        COUNT(CASE WHEN overall <= 2 THEN 1 END) as negative_reviews
      FROM "reviews"
      WHERE "createdAt" >= ${start} AND "createdAt" <= ${end}
    `;

    // Rating distribution
    const ratingDistribution = await prisma.review.groupBy({
      by: ['overall'],
      where: {
        createdAt: { gte: start, lte: end }
      },
      _count: { overall: true }
    });

    // Common keywords in reviews (simplified sentiment analysis)
    const reviewTexts = await prisma.review.findMany({
      where: {
        createdAt: { gte: start, lte: end },
        review: { not: null }
      },
      select: { review: true, overall: true }
    });

    const sentimentAnalysis = analyzeSentiment(reviewTexts);

    // Skills with highest/lowest ratings
    const skillRatings = await prisma.$queryRaw`
      SELECT 
        sr."skillRequested" as skill,
        AVG(r.overall) as avg_rating,
        COUNT(r.id) as review_count
      FROM "reviews" r
      JOIN "swap_requests" sr ON r."swapRequestId" = sr.id
      WHERE r."createdAt" >= ${start} AND r."createdAt" <= ${end}
      GROUP BY sr."skillRequested"
      HAVING COUNT(r.id) >= 3
      ORDER BY avg_rating DESC
    `;

    // User satisfaction trends
    const satisfactionTrends = await prisma.$queryRaw`
      SELECT 
        DATE(r."createdAt") as date,
        AVG(r.overall) as avg_rating,
        COUNT(*) as review_count
      FROM "reviews" r
      WHERE r."createdAt" >= ${start} AND r."createdAt" <= ${end}
      GROUP BY DATE(r."createdAt")
      ORDER BY date
    `;

    const reportData = {
      period: { start, end },
      overview: {
        averageRating: parseFloat(reviewMetrics[0]?.avg_overall_rating || 0).toFixed(2),
        totalReviews: parseInt(reviewMetrics[0]?.total_reviews || 0),
        satisfactionRate: reviewMetrics[0] ? 
          (parseFloat(reviewMetrics[0].positive_reviews) / parseFloat(reviewMetrics[0].total_reviews) * 100).toFixed(2) : 0,
        negativeReviewRate: reviewMetrics[0] ? 
          (parseFloat(reviewMetrics[0].negative_reviews) / parseFloat(reviewMetrics[0].total_reviews) * 100).toFixed(2) : 0
      },
      ratingBreakdown: {
        overall: parseFloat(reviewMetrics[0]?.avg_overall_rating || 0).toFixed(2),
        teachingQuality: parseFloat(reviewMetrics[0]?.avg_teaching_quality || 0).toFixed(2),
        reliability: parseFloat(reviewMetrics[0]?.avg_reliability || 0).toFixed(2),
        communication: parseFloat(reviewMetrics[0]?.avg_communication || 0).toFixed(2)
      },
      ratingDistribution,
      sentimentAnalysis,
      topRatedSkills: skillRatings.slice(0, 10),
      lowestRatedSkills: skillRatings.slice(-10).reverse(),
      satisfactionTrends
    };

    if (format === 'csv') {
      return exportToCSV(res, reportData, 'feedback_analysis_report');
    } else if (format === 'pdf') {
      return exportToPDF(res, reportData, 'Feedback Analysis Report');
    }

    res.json(reportData);
  } catch (error) {
    console.error('Get feedback analysis report error:', error);
    res.status(500).json({ error: 'Failed to generate feedback analysis report' });
  }
};

const generateCustomReport = async (req, res) => {
  try {
    const { 
      reportType,
      metrics,
      filters,
      startDate,
      endDate,
      format = 'json'
    } = req.body;

    // Build custom query based on parameters
    let reportData = {};

    if (reportType === 'CUSTOM_USER_METRICS') {
      reportData = await generateCustomUserReport(metrics, filters, startDate, endDate);
    } else if (reportType === 'CUSTOM_SWAP_METRICS') {
      reportData = await generateCustomSwapReport(metrics, filters, startDate, endDate);
    }

    if (format === 'csv') {
      return exportToCSV(res, reportData, 'custom_report');
    } else if (format === 'pdf') {
      return exportToPDF(res, reportData, 'Custom Report');
    }

    res.json(reportData);
  } catch (error) {
    console.error('Generate custom report error:', error);
    res.status(500).json({ error: 'Failed to generate custom report' });
  }
};

// Helper functions
const calculateRetentionMetrics = async (startDate, endDate) => {
  // Calculate user retention over different periods
  const cohorts = await prisma.$queryRaw`
    WITH cohort_data AS (
      SELECT 
        DATE_TRUNC('week', "createdAt") as cohort_week,
        id as user_id
      FROM "users"
      WHERE "createdAt" >= ${startDate} AND "createdAt" <= ${endDate}
    ),
    user_activities AS (
      SELECT 
        u.id as user_id,
        DATE_TRUNC('week', u."updatedAt") as activity_week
      FROM "users" u
      WHERE u."updatedAt" >= ${startDate}
    )
    SELECT 
      cd.cohort_week,
      COUNT(DISTINCT cd.user_id) as cohort_size,
      COUNT(DISTINCT CASE WHEN ua.activity_week = cd.cohort_week + INTERVAL '1 week' THEN cd.user_id END) as week_1,
      COUNT(DISTINCT CASE WHEN ua.activity_week = cd.cohort_week + INTERVAL '2 week' THEN cd.user_id END) as week_2,
      COUNT(DISTINCT CASE WHEN ua.activity_week = cd.cohort_week + INTERVAL '4 week' THEN cd.user_id END) as week_4
    FROM cohort_data cd
    LEFT JOIN user_activities ua ON cd.user_id = ua.user_id
    GROUP BY cd.cohort_week
    ORDER BY cd.cohort_week
  `;

  return cohorts;
};

const analyzeSentiment = (reviewTexts) => {
  // Simple sentiment analysis based on keywords
  const positiveWords = ['great', 'excellent', 'amazing', 'helpful', 'professional', 'patient', 'clear'];
  const negativeWords = ['poor', 'bad', 'terrible', 'unclear', 'unprofessional', 'late', 'confusing'];

  let totalSentiment = 0;
  let positiveCount = 0;
  let negativeCount = 0;

  reviewTexts.forEach(review => {
    if (!review.review) return;

    const text = review.review.toLowerCase();
    let sentimentScore = 0;

    positiveWords.forEach(word => {
      if (text.includes(word)) sentimentScore += 1;
    });

    negativeWords.forEach(word => {
      if (text.includes(word)) sentimentScore -= 1;
    });

    if (sentimentScore > 0) positiveCount++;
    else if (sentimentScore < 0) negativeCount++;

    totalSentiment += sentimentScore;
  });

  return {
    overallSentiment: totalSentiment > 0 ? 'positive' : totalSentiment < 0 ? 'negative' : 'neutral',
    positiveReviews: positiveCount,
    negativeReviews: negativeCount,
    neutralReviews: reviewTexts.length - positiveCount - negativeCount,
    sentimentScore: totalSentiment
  };
};

const exportToCSV = (res, data, filename) => {
  try {
    const parser = new Parser();
    const csv = parser.parse(data);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
    res.send(csv);
  } catch (error) {
    console.error('CSV export error:', error);
    res.status(500).json({ error: 'Failed to export CSV' });
  }
};

const exportToPDF = (res, data, title) => {
  try {
    const doc = new PDFDocument();
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${title.replace(/\s+/g, '_')}.pdf"`);
    
    doc.pipe(res);
    
    doc.fontSize(20).text(title, 100, 100);
    doc.fontSize(12).text(JSON.stringify(data, null, 2), 100, 150);
    
    doc.end();
  } catch (error) {
    console.error('PDF export error:', error);
    res.status(500).json({ error: 'Failed to export PDF' });
  }
};

module.exports = {
  getUserActivityReport,
  getSwapAnalyticsReport,
  getRevenueTrackingReport,
  getFeedbackAnalysisReport,
  generateCustomReport
};
