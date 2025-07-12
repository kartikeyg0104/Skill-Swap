import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
// Import comprehensive components
import UserManagement from '../components/UserManagement';
import ContentModeration from '../components/ContentModeration';
import SwapMonitoring from '../components/SwapMonitoring';
import Analytics from '../components/Analytics';
import DisputeManagement from '../components/DisputeManagement';
import AdminProfile from '../components/AdminProfile';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Input,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Progress
} from '../components/ui';
import {
  Users,
  Activity,
  BarChart3,
  Shield,
  AlertTriangle,
  Eye,
  Ban,
  UserX,
  Crown,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  MoreVertical,
  Calendar,
  MessageSquare,
  Star,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  DollarSign,
  Target,
  Zap,
  FileText,
  AlertCircle,
  User,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Mock data
const mockDashboardStats = {
  users: {
    total: 15420,
    new: 342,
    active: 12890,
    suspended: 45,
    banned: 23
  },
  swaps: {
    total: 8720,
    pending: 156,
    completed: 7890,
    cancelled: 674
  },
  reports: {
    pending: 28,
    resolved: 245,
    escalated: 8
  },
  revenue: {
    thisMonth: 45670,
    lastMonth: 42340,
    growth: 7.9
  }
};

const mockUsers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    status: 'ACTIVE',
    role: 'USER',
    joinDate: '2024-01-15',
    lastActive: '2024-07-10',
    swapsCount: 12,
    rating: 4.8,
    avatar: null
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    status: 'SUSPENDED',
    role: 'USER',
    joinDate: '2024-02-20',
    lastActive: '2024-07-08',
    swapsCount: 8,
    rating: 4.2,
    avatar: null
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike@example.com',
    status: 'ACTIVE',
    role: 'MODERATOR',
    joinDate: '2024-01-05',
    lastActive: '2024-07-12',
    swapsCount: 25,
    rating: 4.9,
    avatar: null
  }
];

const mockReports = [
  {
    id: '1',
    type: 'USER_MISCONDUCT',
    reporter: 'Alice Cooper',
    reported: 'Bob Smith',
    reason: 'Inappropriate behavior during skill exchange',
    status: 'PENDING',
    createdAt: '2024-07-12',
    priority: 'HIGH'
  },
  {
    id: '2',
    type: 'CONTENT_VIOLATION',
    reporter: 'David Lee',
    content: 'Skill description contains false information',
    status: 'RESOLVED',
    createdAt: '2024-07-11',
    priority: 'MEDIUM'
  }
];

const mockContentQueue = [
  {
    id: '1',
    type: 'SKILL_DESCRIPTION',
    user: 'John Doe',
    content: 'Expert React developer with 5+ years of experience. I can teach advanced patterns, hooks, and state management.',
    flaggedReason: 'Potential false claims',
    submittedAt: '2024-07-12',
    priority: 'MEDIUM'
  },
  {
    id: '2',
    type: 'USER_PROFILE',
    user: 'Jane Smith',
    content: 'Professional UI/UX designer specializing in mobile applications and user research.',
    flaggedReason: 'Automated content detection',
    submittedAt: '2024-07-11',
    priority: 'LOW'
  }
];

const chartData = [
  { name: 'Jan', users: 1200, swaps: 890 },
  { name: 'Feb', users: 1350, swaps: 950 },
  { name: 'Mar', users: 1450, swaps: 1100 },
  { name: 'Apr', users: 1600, swaps: 1250 },
  { name: 'May', users: 1800, swaps: 1400 },
  { name: 'Jun', users: 2000, swaps: 1600 },
];

const pieData = [
  { name: 'Technology', value: 35, color: '#0088FE' },
  { name: 'Creative', value: 25, color: '#00C49F' },
  { name: 'Business', value: 20, color: '#FFBB28' },
  { name: 'Language', value: 15, color: '#FF8042' },
  { name: 'Other', value: 5, color: '#8884D8' },
];

// Navigation Sidebar Component
const Sidebar = ({ activeTab, setActiveTab, isMobileOpen, setIsMobileOpen }) => {
  const { user, logout } = useAuth();

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'content', label: 'Content Moderation', icon: FileText },
    { id: 'swaps', label: 'Swap Monitoring', icon: Activity },
    { id: 'disputes', label: 'Dispute Management', icon: AlertTriangle },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r transform lg:translate-x-0 lg:static lg:inset-0 transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">Admin Panel</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsMobileOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* User Info */}
          <div className="p-4 border-b">
            <button
              onClick={() => {
                setActiveTab('profile');
                setIsMobileOpen(false);
              }}
              className="flex items-center space-x-3 w-full text-left hover:bg-muted rounded-lg p-2 transition-colors"
            >
              <Avatar>
                <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold text-sm">{user?.name}</div>
                <div className="text-xs text-muted-foreground">{user?.role}</div>
              </div>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsMobileOpen(false);
                      }}
                      className={`
                        w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors
                        ${activeTab === item.id 
                          ? 'bg-primary text-primary-foreground' 
                          : 'hover:bg-muted'
                        }
                      `}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t">
            <Button
              variant="ghost"
              onClick={logout}
              className="w-full justify-start"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

// Dashboard Overview Component
const DashboardOverview = ({ setActiveTab }) => {
  const stats = mockDashboardStats;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.users.new} new this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Swaps</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.swaps.pending}</div>
            <p className="text-xs text-muted-foreground">
              {stats.swaps.completed} completed this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.reports.pending}</div>
            <p className="text-xs text-muted-foreground">
              {stats.reports.escalated} escalated
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.revenue.growth}%</div>
            <p className="text-xs text-muted-foreground">
              vs last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Growth & Swap Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="users" fill="#8884d8" />
                <Bar dataKey="swaps" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Skills Category Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => setActiveTab('users')}
            >
              <Users className="h-6 w-6 mb-2" />
              Manage Users
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => setActiveTab('content')}
            >
              <FileText className="h-6 w-6 mb-2" />
              Review Content
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => setActiveTab('swaps')}
            >
              <Activity className="h-6 w-6 mb-2" />
              Monitor Swaps
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => setActiveTab('disputes')}
            >
              <AlertTriangle className="h-6 w-6 mb-2" />
              Handle Reports
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => setActiveTab('analytics')}
            >
              <BarChart3 className="h-6 w-6 mb-2" />
              View Analytics
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => setActiveTab('profile')}
            >
              <User className="h-6 w-6 mb-2" />
              My Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Main Admin Dashboard Component
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    try {
      // Simulate API refresh delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update last refresh time
      setLastRefresh(new Date());
      
      // Here you would typically:
      // 1. Refresh user data
      // 2. Refresh analytics data
      // 3. Refresh any other relevant data based on current tab
      
      // For now, we'll just show a visual refresh indication
      console.log(`Refreshed ${activeTab} data at ${new Date().toLocaleTimeString()}`);
      
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const renderContent = () => {
    const refreshProps = {
      onRefresh: handleRefresh,
      isRefreshing,
      lastRefresh
    };

    switch (activeTab) {
      case 'overview':
        return <DashboardOverview setActiveTab={setActiveTab} {...refreshProps} />;
      case 'users':
        return <UserManagement {...refreshProps} />;
      case 'content':
        return <ContentModeration {...refreshProps} />;
      case 'swaps':
        return <SwapMonitoring {...refreshProps} />;
      case 'disputes':
        return <DisputeManagement {...refreshProps} />;
      case 'analytics':
        return <Analytics {...refreshProps} />;
      case 'profile':
        return <AdminProfile {...refreshProps} />;
      default:
        return <DashboardOverview setActiveTab={setActiveTab} {...refreshProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
      />
      
      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        {/* Top Bar */}
        <header className="bg-white border-b px-4 py-3 flex items-center justify-between lg:px-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold capitalize">
              {activeTab.replace('_', ' ')}
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-muted-foreground hidden md:block">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
