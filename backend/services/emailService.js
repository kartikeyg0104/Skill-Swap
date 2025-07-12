const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});


const sendVerificationEmail = async (email, name, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Verify Your Email - Skill Swap',
    html: `
      <h2>Welcome to Skill Swap, ${name}!</h2>
      <p>Please click the link below to verify your email address:</p>
      <a href="${verificationUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
      <p>If you didn't create an account, please ignore this email.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Verification email sent successfully');
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};

const sendReviewNotification = async (email, name, reviewerName, rating) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'New Review Received - Skill Swap',
    html: `
      <h2>Hi ${name}!</h2>
      <p>${reviewerName} left you a review with ${rating} stars!</p>
      <p>Check out your profile to see the full review.</p>
      <a href="${process.env.FRONTEND_URL}/profile" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Profile</a>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Review notification email sent successfully');
  } catch (error) {
    console.error('Error sending review notification email:', error);
  }
};

const sendAchievementNotification = async (email, name, achievementName) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Achievement Unlocked! - Skill Swap',
    html: `
      <h2>Congratulations ${name}!</h2>
      <p>You've unlocked a new achievement: <strong>${achievementName}</strong></p>
      <p>Keep up the great work in your skill-sharing journey!</p>
      <a href="${process.env.FRONTEND_URL}/achievements" style="background-color: #ffc107; color: black; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Achievements</a>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Achievement notification email sent successfully');
  } catch (error) {
    console.error('Error sending achievement notification email:', error);
  }
};

const sendBroadcastEmail = async (email, name, title, message) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: title,
    html: `
      <h2>Hello ${name}!</h2>
      <div style="padding: 20px; background-color: #f9f9f9; border-radius: 5px;">
        ${message}
      </div>
      <p>Best regards,<br>The Skill Swap Team</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Broadcast email sent successfully');
  } catch (error) {
    console.error('Error sending broadcast email:', error);
  }
};

const sendCampaignEmail = async (email, name, subject, htmlContent, textContent) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject,
    html: htmlContent.replace('{{name}}', name),
    text: textContent ? textContent.replace('{{name}}', name) : undefined
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Campaign email sent successfully');
  } catch (error) {
    console.error('Error sending campaign email:', error);
  }
};

const sendWelcomeSeriesEmail = async (email, name, emailType) => {
  let subject, htmlContent;

  switch (emailType) {
    case 'WELCOME':
      subject = 'Welcome to Skill Swap!';
      htmlContent = `
        <h2>Welcome to Skill Swap, ${name}!</h2>
        <p>We're excited to have you join our community of skill sharers.</p>
        <p>Here's how to get started:</p>
        <ul>
          <li>Complete your profile</li>
          <li>Add your skills</li>
          <li>Start browsing for learning opportunities</li>
        </ul>
        <a href="${process.env.FRONTEND_URL}/profile" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Complete Profile</a>
      `;
      break;
    case 'ONBOARDING_TIPS':
      subject = 'Tips for Success on Skill Swap';
      htmlContent = `
        <h2>Hi ${name}!</h2>
        <p>Here are some tips to make the most of your Skill Swap experience:</p>
        <ul>
          <li>Be specific about your skills and what you want to learn</li>
          <li>Respond quickly to swap requests</li>
          <li>Be professional and reliable</li>
          <li>Leave honest reviews after sessions</li>
        </ul>
      `;
      break;
    case 'ENGAGEMENT_REMINDER':
      subject = 'Your Skill Swap Community Misses You!';
      htmlContent = `
        <h2>Hi ${name}!</h2>
        <p>We noticed you haven't been active on Skill Swap lately.</p>
        <p>There are new learning opportunities waiting for you:</p>
        <a href="${process.env.FRONTEND_URL}/discover" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Explore Skills</a>
      `;
      break;
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject,
    html: htmlContent
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`${emailType} email sent successfully`);
  } catch (error) {
    console.error(`Error sending ${emailType} email:`, error);
  }
};

module.exports = {
  sendVerificationEmail,
  sendReviewNotification,
  sendAchievementNotification,
  sendBroadcastEmail,
  sendCampaignEmail,
  sendWelcomeSeriesEmail
};
