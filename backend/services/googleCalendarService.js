const { google } = require('googleapis');
const { v4: uuidv4 } = require('uuid');

class GoogleCalendarService {
  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CALENDAR_CLIENT_ID,
      process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
      process.env.GOOGLE_CALENDAR_REDIRECT_URI
    );
    
    this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
  }

  // Generate OAuth URL for user authentication
  getAuthUrl() {
    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events'
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });
  }

  // Exchange authorization code for tokens
  async getTokens(code) {
    const { tokens } = await this.oauth2Client.getToken(code);
    return tokens;
  }

  // Set credentials for the OAuth2 client
  setCredentials(tokens) {
    this.oauth2Client.setCredentials(tokens);
  }

  // Create a calendar event with Google Meet
  async createMeetingEvent(eventDetails) {
    try {
      const {
        summary,
        description,
        startDateTime,
        endDateTime,
        attendeeEmails,
        timezone = 'UTC'
      } = eventDetails;

      const event = {
        summary,
        description,
        start: {
          dateTime: startDateTime,
          timeZone: timezone,
        },
        end: {
          dateTime: endDateTime,
          timeZone: timezone,
        },
        attendees: attendeeEmails.map(email => ({ email })),
        conferenceData: {
          createRequest: {
            requestId: uuidv4(),
            conferenceSolutionKey: {
              type: 'hangoutsMeet'
            }
          }
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 1 day before
            { method: 'popup', minutes: 30 },      // 30 minutes before
          ],
        },
        guestsCanInviteOthers: false,
        guestsCanModify: false,
        guestsCanSeeOtherGuests: true,
      };

      const response = await this.calendar.events.insert({
        calendarId: 'primary',
        resource: event,
        conferenceDataVersion: 1,
        sendUpdates: 'all'
      });

      return {
        eventId: response.data.id,
        meetLink: response.data.conferenceData?.entryPoints?.[0]?.uri,
        htmlLink: response.data.htmlLink,
        event: response.data
      };
    } catch (error) {
      console.error('Error creating calendar event:', error);
      throw new Error('Failed to create calendar event');
    }
  }

  // Update an existing calendar event
  async updateMeetingEvent(eventId, eventDetails) {
    try {
      const {
        summary,
        description,
        startDateTime,
        endDateTime,
        timezone = 'UTC'
      } = eventDetails;

      const event = {
        summary,
        description,
        start: {
          dateTime: startDateTime,
          timeZone: timezone,
        },
        end: {
          dateTime: endDateTime,
          timeZone: timezone,
        },
      };

      const response = await this.calendar.events.update({
        calendarId: 'primary',
        eventId: eventId,
        resource: event,
        sendUpdates: 'all'
      });

      return {
        eventId: response.data.id,
        meetLink: response.data.conferenceData?.entryPoints?.[0]?.uri,
        htmlLink: response.data.htmlLink,
        event: response.data
      };
    } catch (error) {
      console.error('Error updating calendar event:', error);
      throw new Error('Failed to update calendar event');
    }
  }

  // Cancel/Delete a calendar event
  async cancelMeetingEvent(eventId) {
    try {
      await this.calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId,
        sendUpdates: 'all'
      });

      return { success: true };
    } catch (error) {
      console.error('Error canceling calendar event:', error);
      throw new Error('Failed to cancel calendar event');
    }
  }

  // Get event details
  async getEvent(eventId) {
    try {
      const response = await this.calendar.events.get({
        calendarId: 'primary',
        eventId: eventId
      });

      return {
        eventId: response.data.id,
        meetLink: response.data.conferenceData?.entryPoints?.[0]?.uri,
        htmlLink: response.data.htmlLink,
        event: response.data
      };
    } catch (error) {
      console.error('Error getting calendar event:', error);
      throw new Error('Failed to get calendar event');
    }
  }

  // Check if user has connected their Google Calendar
  async testConnection() {
    try {
      await this.calendar.calendarList.list();
      return true;
    } catch (error) {
      return false;
    }
  }
}

module.exports = GoogleCalendarService;
