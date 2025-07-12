# Skill Swap - Admin Dashboard

A comprehensive admin dashboard for managing the Skill Swap platform. Built with React, Vite, and Tailwind CSS.

## Features

### 📊 Dashboard Overview
- Real-time platform statistics
- User growth and activity charts
- Quick action buttons
- Revenue and performance metrics

### 👥 User Management
- View all users with search and filtering
- Ban, suspend, or activate user accounts
- Promote users to moderator role
- View user statistics and ratings

### 📝 Content Moderation
- Review flagged skill descriptions
- Approve or reject user-generated content
- Priority-based moderation queue
- Request content changes

### 🔄 Swap Monitoring
- Real-time swap activity dashboard
- Monitor pending, completed, and cancelled swaps
- Track swap values and trends

### ⚠️ Dispute Management
- Handle user reports and disputes
- Escalate serious issues
- Contact reporters and users
- Resolve conflicts efficiently

### 📈 Analytics
- Platform health metrics
- User engagement analytics
- Skills category distribution
- Revenue tracking

### 👤 Admin Profile
- Personal profile management
- Account settings and preferences
- Password management
- Activity history and security logs
- Permission management
- Notification preferences

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Navigate to the admin frontend directory:
```bash
cd admin-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and visit `http://localhost:5174`

### Demo Credentials

**Admin Account:**
- Email: `admin@skillswap.com`
- Password: `admin123`

**Moderator Account:**
- Email: `moderator@skillswap.com`
- Password: `mod123`

## Tech Stack

- **Frontend Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI
- **Charts:** Recharts
- **Icons:** Lucide React
- **State Management:** React Context
- **Routing:** React Router

## Project Structure

```
admin-frontend/
├── src/
│   ├── components/
│   │   └── ui.jsx              # Reusable UI components
│   ├── context/
│   │   └── AuthContext.jsx     # Authentication context
│   ├── pages/
│   │   ├── AdminDashboard.jsx  # Main dashboard
│   │   └── Login.jsx           # Login page
│   ├── lib/
│   │   └── utils.js            # Utility functions
│   ├── App.jsx                 # Main app component
│   ├── main.jsx                # Entry point
│   └── index.css               # Global styles
├── public/
├── package.json
└── README.md
```

## Features Overview

### Dashboard Components

1. **Overview Tab**
   - Platform statistics cards
   - Growth charts and analytics
   - Quick action buttons

2. **User Management Tab**
   - User search and filtering
   - User status management
   - Role promotion capabilities

3. **Content Moderation Tab**
   - Flagged content queue
   - Content approval workflow
   - Priority-based reviews

4. **Swap Monitoring Tab**
   - Real-time swap tracking
   - Status-based filtering
   - Value monitoring

5. **Dispute Management Tab**
   - Report handling system
   - Resolution workflows
   - Escalation procedures

6. **Analytics Tab**
   - Platform metrics and charts
   - Data visualization
   - Export capabilities

7. **Profile Tab**
   - Admin profile management
   - Settings and preferences
   - Security and activity logs

## API Integration

The admin dashboard is designed to integrate with the backend API. Mock data is currently used for demonstration purposes. To connect to the real API:

1. Update the auth context to make actual API calls
2. Replace mock data with API endpoints
3. Configure environment variables for API URLs

## Security Features

- Role-based access control
- Protected routes
- Session management
- Secure authentication flow

## Responsive Design

The admin dashboard is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile devices

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is part of the Skill Swap platform and follows the same licensing terms.
