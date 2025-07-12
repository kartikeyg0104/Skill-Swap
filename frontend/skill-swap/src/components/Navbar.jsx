import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Avatar, AvatarFallback, AvatarImage, Badge, Input } from './ui-consolidated';
import { 
  NotificationsModal, 
  ChatModal, 
  SettingsModal, 
  EditProfileModal 
} from './FeatureSections';
import { 
  Search, 
  Bell, 
  MessageCircle, 
  Home,
  Users,
  User,
  TrendingUp,
  LogOut,
  Settings
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Modal states
  const [showNotifications, setShowNotifications] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);

  // Don't show navbar on landing page or if user is not authenticated
  if (location.pathname === '/' || !user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-6">
            <div 
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => navigate('/social')}
            >
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-primary">SkillSwap</span>
            </div>
            
            <nav className="hidden md:flex items-center space-x-1">
              <Button 
                variant={isActive('/social') ? 'default' : 'ghost'} 
                size="sm"
                onClick={() => navigate('/social')}
                className="flex items-center space-x-2"
              >
                <Home className="h-4 w-4" />
                <span>Social</span>
              </Button>
              
              <Button 
                variant={isActive('/discovery') ? 'default' : 'ghost'} 
                size="sm"
                onClick={() => navigate('/discovery')}
                className="flex items-center space-x-2"
              >
                <Search className="h-4 w-4" />
                <span>Discovery</span>
              </Button>
              
              <Button 
                variant={isActive('/dashboard') ? 'default' : 'ghost'} 
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2"
              >
                <Users className="h-4 w-4" />
                <span>Dashboard</span>
              </Button>
              
              <Button 
                variant={isActive('/profile') ? 'default' : 'ghost'} 
                size="sm"
                onClick={() => navigate('/profile')}
                className="flex items-center space-x-2"
              >
                <User className="h-4 w-4" />
                <span>Profile</span>
              </Button>
            </nav>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Search skills, people, posts..." 
                className="pl-10" 
              />
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="sm" 
              className="relative"
              onClick={() => setShowNotifications(true)}
            >
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                3
              </Badge>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowChat(true)}
            >
              <MessageCircle className="h-5 w-5" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="h-5 w-5" />
            </Button>
            
            {/* User Avatar */}
            <Avatar 
              className="h-8 w-8 cursor-pointer" 
              onClick={() => navigate('/profile')}
            >
              <AvatarImage src={user?.profile?.profilePhoto} />
              <AvatarFallback>
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="flex items-center space-x-1"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Modals */}
      <NotificationsModal 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
      <ChatModal 
        isOpen={showChat} 
        onClose={() => setShowChat(false)} 
      />
      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />
      <EditProfileModal 
        isOpen={showEditProfile} 
        onClose={() => setShowEditProfile(false)} 
      />
    </header>
  );
};

export default Navbar;
