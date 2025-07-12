const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');

const prisma = new PrismaClient();

// Simple meeting scheduler - just takes Google Meet link and emails
const scheduleSimpleMeeting = async (req, res) => {
  try {
    const { 
      meetingLink, 
      attendeeEmail, 
      attendeeName,
      title = 'Skill Swap Meeting',
      description = 'Your skill swap meeting is ready!',
      dateTime,
      duration = 60 
    } = req.body;

    // Validate required fields
    if (!meetingLink || !attendeeEmail) {
      return res.status(400).json({ 
        error: 'Meeting link and attendee email are required' 
      });
    }

    // Validate Google Meet link format
    if (!meetingLink.includes('meet.google.com')) {
      return res.status(400).json({ 
        error: 'Please provide a valid Google Meet link' 
      });
    }

    // Create meeting record in database
    const meeting = await prisma.simpleMeeting.create({
      data: {
        organizerId: req.user.id,
        attendeeEmail,
        attendeeName: attendeeName || 'Attendee',
        title,
        description,
        meetingLink,
        scheduledDateTime: dateTime ? new Date(dateTime) : null,
        duration,
        status: 'SCHEDULED'
      }
    });

    // Send email notification
    const emailSent = await sendMeetingInvite({
      organizerName: req.user.name,
      organizerEmail: req.user.email,
      attendeeEmail,
      attendeeName: attendeeName || 'Attendee',
      title,
      description,
      meetingLink,
      dateTime,
      duration
    });

    res.json({
      message: 'Meeting scheduled successfully!',
      meeting: {
        id: meeting.id,
        title: meeting.title,
        meetingLink: meeting.meetingLink,
        attendeeEmail: meeting.attendeeEmail,
        scheduledDateTime: meeting.scheduledDateTime,
        duration: meeting.duration,
        status: meeting.status
      },
      emailSent
    });

  } catch (error) {
    console.error('Schedule meeting error:', error);
    res.status(500).json({ error: 'Failed to schedule meeting' });
  }
};

// Send meeting invite via email
const sendMeetingInvite = async (meetingData) => {
  try {
    const transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">🎉 You're Invited to a Skill Swap Meeting!</h2>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #007bff; margin-top: 0;">${meetingData.title}</h3>
          <p style="color: #666; margin: 10px 0;">
            <strong>Organized by:</strong> ${meetingData.organizerName}
          </p>
          <p style="color: #666; margin: 10px 0;">
            <strong>Description:</strong> ${meetingData.description}
          </p>
          ${meetingData.dateTime ? `
            <p style="color: #666; margin: 10px 0;">
              <strong>Date & Time:</strong> ${new Date(meetingData.dateTime).toLocaleString()}
            </p>
          ` : ''}
          <p style="color: #666; margin: 10px 0;">
            <strong>Duration:</strong> ${meetingData.duration} minutes
          </p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${meetingData.meetingLink}" 
             style="background-color: #007bff; color: white; padding: 15px 30px; 
                    text-decoration: none; border-radius: 5px; font-weight: bold; 
                    display: inline-block;">
            🎥 Join Google Meet
          </a>
        </div>

        <div style="background-color: #e9ecef; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0; color: #666; font-size: 14px;">
            <strong>Meeting Link:</strong> 
            <a href="${meetingData.meetingLink}" style="color: #007bff;">
              ${meetingData.meetingLink}
            </a>
          </p>
        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
          <p style="color: #666; font-size: 12px; margin: 0;">
            This meeting was scheduled through Skill Swap platform.
          </p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: `"${meetingData.organizerName}" <${process.env.EMAIL_FROM}>`,
      to: meetingData.attendeeEmail,
      subject: `📅 Meeting Invitation: ${meetingData.title}`,
      html: emailHtml
    };

    await transporter.sendMail(mailOptions);
    return true;

  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
};

// Get user's scheduled meetings
const getUserMeetings = async (req, res) => {
  try {
    const meetings = await prisma.simpleMeeting.findMany({
      where: {
        organizerId: req.user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      meetings
    });
  } catch (error) {
    console.error('Get meetings error:', error);
    res.status(500).json({ error: 'Failed to fetch meetings' });
  }
};

// Update meeting status
const updateMeetingStatus = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const { status } = req.body;

    const meeting = await prisma.simpleMeeting.findUnique({
      where: { id: parseInt(meetingId) }
    });

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    if (meeting.organizerId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this meeting' });
    }

    const updatedMeeting = await prisma.simpleMeeting.update({
      where: { id: parseInt(meetingId) },
      data: { status }
    });

    res.json({
      message: 'Meeting status updated',
      meeting: updatedMeeting
    });

  } catch (error) {
    console.error('Update meeting error:', error);
    res.status(500).json({ error: 'Failed to update meeting' });
  }
};

module.exports = {
  scheduleSimpleMeeting,
  getUserMeetings,
  updateMeetingStatus
};
