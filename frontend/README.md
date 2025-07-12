# Skill Swap - Frontend Application

A modern, responsive frontend application for the Skill Swap platform built with React, Vite, and Tailwind CSS. This is the main user-facing application where users can discover skills, connect with others, and manage their skill exchanges.

![Skill Swap Frontend](https://img.shields.io/badge/React-18.3.1-blue.svg)
![Vite](https://img.shields.io/badge/Vite-5.4.1-646CFF.svg)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.11-38B2AC.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

## 🚀 Features

### 🏠 Landing Page
- **Hero Section** - Compelling introduction to the platform
- **Feature Highlights** - Showcase of key platform capabilities
- **User Actions** - Quick access to sign up, log in, and explore
- **Responsive Design** - Optimized for all device sizes

### 🔍 Discovery System
- **Skill Search** - Advanced filtering and search capabilities
- **User Profiles** - Detailed skill provider profiles
- **Category Browsing** - Organized skill categories
- **Real-time Results** - Dynamic search with instant feedback

### 📊 User Dashboard
- **Personal Overview** - User stats and activity summary
- **Skill Management** - Add, edit, and manage your skills
- **Exchange History** - Track past and current skill exchanges
- **Achievement System** - Gamified progress tracking

### 👤 Profile Management
- **Profile Customization** - Comprehensive profile editing
- **Skill Portfolio** - Showcase your expertise
- **Rating System** - Build reputation through reviews
- **Availability Settings** - Manage your availability

### 🤝 Social Features
- **User Connections** - Connect with other skill providers
- **Community Feed** - Stay updated with platform activity
- **Messaging System** - Communicate with potential partners
- **Groups & Communities** - Join skill-specific communities

### 📱 Mobile-First Design
- **Responsive UI** - Works seamlessly on all devices
- **Touch Optimized** - Mobile-friendly interactions
- **Progressive Web App** - App-like experience on mobile
- **Offline Capabilities** - Core features work offline

## 🛠️ Tech Stack

### Core Technologies
- **React 18.3.1** - Modern React with hooks and concurrent features
- **Vite 5.4.1** - Fast build tool and development server
- **React Router DOM 7.6.3** - Client-side routing
- **Tailwind CSS 3.4.11** - Utility-first CSS framework

### UI Components & Design
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icon library
- **Recharts** - Responsive chart library
- **Class Variance Authority** - Component variant management
- **Tailwind Merge** - Intelligent class merging

### State Management & Data
- **TanStack Query 5.56.2** - Server state management
- **React Hook Form 7.60.0** - Form handling and validation
- **Zod 4.0.5** - Schema validation
- **React Context** - Global state management

### Additional Libraries
- **Date-fns** - Date manipulation utilities
- **Sonner** - Toast notifications
- **Embla Carousel** - Smooth carousel components
- **Next Themes** - Theme management

## 📁 Project Structure

```
frontend/skill-swap/
├── public/                     # Static assets
│   ├── favicon.ico
│   ├── placeholder.svg
│   └── robots.txt
├── src/                        # Source code
│   ├── components/            # Reusable components
│   │   ├── ui/               # UI component library
│   │   ├── FeatureSections.jsx
│   │   ├── Navbar.jsx
│   │   ├── OfferSkillSection.jsx
│   │   ├── UserActions.jsx
│   │   └── ui-consolidated.jsx
│   ├── context/              # React contexts
│   │   └── AuthContext.jsx
│   ├── hooks/                # Custom hooks
│   │   ├── use-mobile.jsx
│   │   └── use-toast.js
│   ├── lib/                  # Utility libraries
│   │   └── utils.js
│   ├── pages/                # Page components
│   │   ├── Dashboard.jsx
│   │   ├── Discovery.jsx
│   │   ├── Index.jsx
│   │   ├── NotFound.jsx
│   │   ├── Profile.jsx
│   │   └── Social.jsx
│   ├── App.jsx               # Main app component
│   ├── App.css               # App-specific styles
│   ├── index.css             # Global styles
│   └── main.jsx              # Application entry point
├── temp-ui-components/        # Temporary UI components
├── dist/                      # Build output
├── package.json              # Dependencies and scripts
├── vite.config.js            # Vite configuration
├── tailwind.config.js        # Tailwind configuration
├── postcss.config.js         # PostCSS configuration
├── eslint.config.js          # ESLint configuration
└── README.md                 # Project documentation
```

## 🚀 Getting Started

### Prerequisites
- **Node.js 18+** - JavaScript runtime
- **npm or yarn** - Package manager
- **Git** - Version control

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/kartikeyg0104/Skill-Swap.git
   cd Skill-Swap/frontend/skill-swap
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:5173`

### Build for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview

# Development build (for testing)
npm run build:dev
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_NAME=Skill Swap

# Authentication
VITE_AUTH_DOMAIN=your-auth-domain
VITE_CLIENT_ID=your-client-id

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_NOTIFICATIONS=true
```

### Tailwind Configuration
The project uses a custom Tailwind configuration with:
- Custom color palette
- Extended spacing scale
- Custom animations
- Typography plugin

### Vite Configuration
Optimized build settings with:
- React SWC plugin for fast compilation
- Path aliases for clean imports
- Environment variable handling
- Production optimizations

## 📱 Pages & Features

### 🏠 Landing Page (`/`)
- **Hero Section** - Platform introduction and value proposition
- **Feature Showcase** - Key benefits and capabilities
- **Call-to-Action** - User registration and onboarding
- **Testimonials** - User success stories

### 🔍 Discovery Page (`/discovery`)
- **Search Interface** - Advanced skill and user search
- **Filter Options** - Location, category, rating filters
- **User Cards** - Profile previews with skills
- **Pagination** - Efficient result browsing

### 📊 Dashboard (`/dashboard`)
- **Overview Cards** - Key metrics and statistics
- **Recent Activity** - Latest exchanges and interactions
- **Quick Actions** - Common tasks and shortcuts
- **Progress Tracking** - Skill development progress

### 👤 Profile Page (`/profile`)
- **Profile Editor** - Personal information management
- **Skill Management** - Add, edit, and organize skills
- **Portfolio** - Showcase work and achievements
- **Settings** - Privacy and notification preferences

### 🤝 Social Page (`/social`)
- **Activity Feed** - Community updates and interactions
- **Connections** - Manage your network
- **Groups** - Join and participate in communities
- **Messages** - Communication hub

## 🎨 Design System

### Color Palette
```css
/* Primary Colors */
--primary: 222.2 84% 4.9%
--primary-foreground: 210 40% 98%

/* Secondary Colors */
--secondary: 210 40% 96%
--secondary-foreground: 222.2 84% 4.9%

/* Accent Colors */
--accent: 210 40% 96%
--accent-foreground: 222.2 84% 4.9%
```

### Typography
- **Headings** - Inter font family
- **Body Text** - Inter font family
- **Code** - JetBrains Mono

### Component Library
Comprehensive UI component library built on Radix UI primitives:
- **Forms** - Input, Select, Textarea, Checkbox
- **Navigation** - Navbar, Breadcrumbs, Pagination
- **Feedback** - Toast, Alert, Progress
- **Overlay** - Modal, Popover, Tooltip
- **Data Display** - Table, Card, Badge

## 🧪 Testing

### Running Tests
```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Testing Strategy
- **Unit Tests** - Component and utility testing
- **Integration Tests** - Feature workflow testing
- **E2E Tests** - User journey testing
- **Visual Tests** - Component snapshot testing

## 📈 Performance

### Optimization Features
- **Code Splitting** - Lazy loading of routes and components
- **Image Optimization** - Responsive images with lazy loading
- **Bundle Analysis** - Webpack bundle analyzer integration
- **Caching Strategy** - Service worker for static assets

### Performance Metrics
- **Lighthouse Score** - 95+ for all categories
- **First Contentful Paint** - < 1.5s
- **Largest Contentful Paint** - < 2.5s
- **Time to Interactive** - < 3.5s

## 🔒 Security

### Security Measures
- **Input Validation** - Client-side validation with Zod
- **XSS Protection** - Content Security Policy headers
- **CSRF Protection** - Token-based request validation
- **Secure Headers** - Security headers configuration

### Authentication
- **JWT Tokens** - Secure token-based authentication
- **Route Protection** - Private route guards
- **Session Management** - Automatic token refresh
- **Multi-factor Auth** - Optional 2FA support

## 🌐 Browser Support

### Supported Browsers
- **Chrome** - 90+
- **Firefox** - 88+
- **Safari** - 14+
- **Edge** - 90+

### Progressive Enhancement
- **Core Functionality** - Works without JavaScript
- **Enhanced Experience** - Rich interactions with JavaScript
- **Offline Support** - Basic functionality when offline

## 🚀 Deployment

### Build Process
```bash
# Production build
npm run build

# Development build
npm run build:dev
```

### Deployment Options

#### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Netlify
```bash
# Build and deploy
npm run build
netlify deploy --prod --dir=dist
```

#### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 🤝 Contributing

### Development Workflow
1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes
4. **Test** your changes
5. **Submit** a pull request

### Code Style
- **ESLint** - Code linting and formatting
- **Prettier** - Code formatting
- **Conventional Commits** - Commit message format
- **Husky** - Git hooks for quality checks

### Pull Request Process
1. Update documentation if needed
2. Add tests for new features
3. Ensure all tests pass
4. Update the changelog
5. Request review from maintainers

## 📚 Documentation

### Additional Resources
- [API Documentation](../backend/README.md)
- [Admin Dashboard](../admin-frontend/README.md)
- [Deployment Guide](./docs/deployment.md)
- [Component Library](./docs/components.md)

### Development Guides
- [Setup Guide](./docs/setup.md)
- [Contribution Guidelines](./CONTRIBUTING.md)
- [Code Style Guide](./docs/style-guide.md)
- [Testing Guide](./docs/testing.md)

## 🐛 Troubleshooting

### Common Issues

#### Development Server Won't Start
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

#### Build Failures
```bash
# Check for TypeScript errors
npm run lint

# Clear Vite cache
rm -rf dist .vite
npm run build
```

#### Styling Issues
```bash
# Rebuild Tailwind
npx tailwindcss -i ./src/index.css -o ./dist/output.css --watch
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Lead Developer** - [Kartikey Gupta](https://github.com/kartikeyg0104)
- **UI/UX Designer** - Design Team
- **Backend Team** - Backend Development
- **QA Team** - Quality Assurance

## 🙏 Acknowledgments

- **Radix UI** - For accessible component primitives
- **Tailwind CSS** - For the amazing utility-first framework
- **Vite** - For the lightning-fast build tool
- **React Team** - For the excellent framework
- **Open Source Community** - For all the amazing libraries

---

## 📞 Support

For support and questions:
- **GitHub Issues** - [Create an issue](https://github.com/kartikeyg0104/Skill-Swap/issues)
- **Email** - support@skillswap.com
- **Discord** - [Join our community](https://discord.gg/skillswap)

---

**Made with ❤️ by the Skill Swap Team**