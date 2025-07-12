import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Input,
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Separator,
  Switch,
  Label,
  Progress
} from './ui';
import {
  User,
  Mail,
  Shield,
  Key,
  Bell,
  Settings,
  Activity,
  Calendar,
  Clock,
  Award,
  BarChart3,
  Users,
  AlertTriangle,
  CheckCircle,
  Edit,
  Save,
  X,
  Camera,
  MapPin,
  Phone,
  Globe,
  Lock,
  Eye,
  EyeOff,
  Download,
  Upload,
  Trash2,
  RefreshCw
} from 'lucide-react';

const AdminProfile = ({ onRefresh, isRefreshing, lastRefresh }) => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Mock admin profile data
  const [profileData, setProfileData] = useState({
    id: 'admin_001',
    name: 'Sarah Johnson',
    email: 'admin@skillswap.com',
    role: 'Super Admin',
    avatar: null,
    title: 'Platform Administrator',
    department: 'Operations',
    location: 'San Francisco, CA',
    phone: '+1 (555) 123-4567',
    website: 'https://skillswap.com',
    bio: 'Experienced platform administrator with 5+ years in community management and user safety.',
    joinDate: '2023-01-15',
    lastLogin: '2025-01-12T10:30:00Z',
    permissions: [
      'user_management',
      'content_moderation',
      'analytics_access',
      'system_settings',
      'dispute_resolution',
      'financial_reports'
    ],
    preferences: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      weeklyReports: true,
      securityAlerts: true,
      maintenanceUpdates: true
    },
    stats: {
      actionsThisMonth: 347,
      usersManaged: 1523,
      disputesResolved: 89,
      contentReviewed: 234,
      loginStreak: 23,
      avgResponseTime: '2.3 hours'
    },
    recentActivity: [
      { action: 'Banned user @spammer123', time: '2 hours ago', type: 'user_action' },
      { action: 'Approved skill: Advanced React Development', time: '4 hours ago', type: 'content' },
      { action: 'Resolved dispute #4521', time: '6 hours ago', type: 'dispute' },
      { action: 'Updated platform settings', time: '1 day ago', type: 'system' },
      { action: 'Generated weekly analytics report', time: '2 days ago', type: 'report' }
    ],
    securityLog: [
      { event: 'Login from San Francisco, CA', time: '2025-01-12T10:30:00Z', status: 'success' },
      { event: 'Password changed', time: '2025-01-10T14:22:00Z', status: 'success' },
      { event: 'Login from New York, NY', time: '2025-01-08T09:15:00Z', status: 'success' },
      { event: 'Failed login attempt', time: '2025-01-07T16:45:00Z', status: 'warning' }
    ]
  });

  useEffect(() => {
    setEditedProfile(profileData);
  }, [profileData]);

  const handleSaveProfile = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProfileData(editedProfile);
      setIsEditing(false);
      // Show success message
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.new !== passwordData.confirm) {
      alert('New passwords do not match');
      return;
    }
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPasswordData({ current: '', new: '', confirm: '' });
      // Show success message
    } catch (error) {
      console.error('Failed to change password:', error);
    }
  };

  const handlePreferenceChange = (key, value) => {
    setProfileData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value
      }
    }));
  };

  const ProfileOverview = () => (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex flex-col items-center lg:items-start">
              <div className="relative">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={profileData.avatar} />
                  <AvatarFallback className="text-2xl">
                    {profileData.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  className="absolute bottom-0 right-0 rounded-full h-8 w-8 p-0"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-center lg:text-left mt-4">
                <h2 className="text-2xl font-bold">{profileData.name}</h2>
                <p className="text-muted-foreground">{profileData.title}</p>
                <Badge variant="secondary" className="mt-2">
                  <Shield className="h-3 w-3 mr-1" />
                  {profileData.role}
                </Badge>
              </div>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  {profileData.email}
                </div>
                <div className="flex items-center text-sm">
                  <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                  {profileData.phone}
                </div>
                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  {profileData.location}
                </div>
                <div className="flex items-center text-sm">
                  <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                  {profileData.website}
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  Joined {new Date(profileData.joinDate).toLocaleDateString()}
                </div>
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  Last login: {new Date(profileData.lastLogin).toLocaleString()}
                </div>
                <div className="flex items-center text-sm">
                  <Activity className="h-4 w-4 mr-2 text-muted-foreground" />
                  {profileData.stats.loginStreak} day login streak
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                onClick={() => setIsEditing(!isEditing)}
                variant={isEditing ? "outline" : "default"}
              >
                {isEditing ? (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </>
                )}
              </Button>
              {isEditing && (
                <Button onClick={handleSaveProfile}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bio Section */}
      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <Textarea
              value={editedProfile.bio}
              onChange={(e) => setEditedProfile(prev => ({ ...prev, bio: e.target.value }))}
              className="min-h-[100px]"
              placeholder="Tell us about yourself..."
            />
          ) : (
            <p className="text-sm text-muted-foreground">{profileData.bio}</p>
          )}
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">{profileData.stats.actionsThisMonth}</div>
            <div className="text-sm text-muted-foreground">Actions This Month</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{profileData.stats.disputesResolved}</div>
            <div className="text-sm text-muted-foreground">Disputes Resolved</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{profileData.stats.contentReviewed}</div>
            <div className="text-sm text-muted-foreground">Content Reviewed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{profileData.stats.usersManaged}</div>
            <div className="text-sm text-muted-foreground">Users Managed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{profileData.stats.avgResponseTime}</div>
            <div className="text-sm text-muted-foreground">Avg Response Time</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{profileData.stats.loginStreak}</div>
            <div className="text-sm text-muted-foreground">Login Streak (days)</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const ProfileSettings = () => (
    <div className="space-y-6">
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={editedProfile.name || ''}
                onChange={(e) => setEditedProfile(prev => ({ ...prev, name: e.target.value }))}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={editedProfile.email || ''}
                onChange={(e) => setEditedProfile(prev => ({ ...prev, email: e.target.value }))}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={editedProfile.phone || ''}
                onChange={(e) => setEditedProfile(prev => ({ ...prev, phone: e.target.value }))}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={editedProfile.location || ''}
                onChange={(e) => setEditedProfile(prev => ({ ...prev, location: e.target.value }))}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="title">Job Title</Label>
              <Input
                id="title"
                value={editedProfile.title || ''}
                onChange={(e) => setEditedProfile(prev => ({ ...prev, title: e.target.value }))}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={editedProfile.website || ''}
                onChange={(e) => setEditedProfile(prev => ({ ...prev, website: e.target.value }))}
                disabled={!isEditing}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="current-password">Current Password</Label>
            <div className="relative">
              <Input
                id="current-password"
                type={showPassword.current ? "text" : "password"}
                value={passwordData.current}
                onChange={(e) => setPasswordData(prev => ({ ...prev, current: e.target.value }))}
                placeholder="Enter current password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(prev => ({ ...prev, current: !prev.current }))}
              >
                {showPassword.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div>
            <Label htmlFor="new-password">New Password</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showPassword.new ? "text" : "password"}
                value={passwordData.new}
                onChange={(e) => setPasswordData(prev => ({ ...prev, new: e.target.value }))}
                placeholder="Enter new password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))}
              >
                {showPassword.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div>
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showPassword.confirm ? "text" : "password"}
                value={passwordData.confirm}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirm: e.target.value }))}
                placeholder="Confirm new password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))}
              >
                {showPassword.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <Button onClick={handlePasswordChange} className="w-full">
            <Key className="h-4 w-4 mr-2" />
            Update Password
          </Button>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <div className="text-sm text-muted-foreground">
                Receive important updates via email
              </div>
            </div>
            <Switch
              id="email-notifications"
              checked={profileData.preferences.emailNotifications}
              onCheckedChange={(checked) => handlePreferenceChange('emailNotifications', checked)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sms-notifications">SMS Notifications</Label>
              <div className="text-sm text-muted-foreground">
                Receive urgent alerts via SMS
              </div>
            </div>
            <Switch
              id="sms-notifications"
              checked={profileData.preferences.smsNotifications}
              onCheckedChange={(checked) => handlePreferenceChange('smsNotifications', checked)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push-notifications">Push Notifications</Label>
              <div className="text-sm text-muted-foreground">
                Receive browser push notifications
              </div>
            </div>
            <Switch
              id="push-notifications"
              checked={profileData.preferences.pushNotifications}
              onCheckedChange={(checked) => handlePreferenceChange('pushNotifications', checked)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="weekly-reports">Weekly Reports</Label>
              <div className="text-sm text-muted-foreground">
                Receive weekly analytics reports
              </div>
            </div>
            <Switch
              id="weekly-reports"
              checked={profileData.preferences.weeklyReports}
              onCheckedChange={(checked) => handlePreferenceChange('weeklyReports', checked)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="security-alerts">Security Alerts</Label>
              <div className="text-sm text-muted-foreground">
                Receive security-related notifications
              </div>
            </div>
            <Switch
              id="security-alerts"
              checked={profileData.preferences.securityAlerts}
              onCheckedChange={(checked) => handlePreferenceChange('securityAlerts', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const ProfileActivity = () => (
    <div className="space-y-6">
      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {profileData.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 rounded-lg border">
                <div className={`p-2 rounded-full ${
                  activity.type === 'user_action' ? 'bg-red-100 text-red-600' :
                  activity.type === 'content' ? 'bg-blue-100 text-blue-600' :
                  activity.type === 'dispute' ? 'bg-yellow-100 text-yellow-600' :
                  activity.type === 'system' ? 'bg-green-100 text-green-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {activity.type === 'user_action' && <Users className="h-4 w-4" />}
                  {activity.type === 'content' && <BarChart3 className="h-4 w-4" />}
                  {activity.type === 'dispute' && <AlertTriangle className="h-4 w-4" />}
                  {activity.type === 'system' && <Settings className="h-4 w-4" />}
                  {activity.type === 'report' && <Activity className="h-4 w-4" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Log */}
      <Card>
        <CardHeader>
          <CardTitle>Security Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {profileData.securityLog.map((log, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center space-x-3">
                  <div className={`p-1 rounded-full ${
                    log.status === 'success' ? 'bg-green-100' :
                    log.status === 'warning' ? 'bg-yellow-100' :
                    'bg-red-100'
                  }`}>
                    {log.status === 'success' && <CheckCircle className="h-4 w-4 text-green-600" />}
                    {log.status === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
                    {log.status === 'error' && <X className="h-4 w-4 text-red-600" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{log.event}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(log.time).toLocaleString()}
                    </p>
                  </div>
                </div>
                <Badge variant={
                  log.status === 'success' ? 'default' :
                  log.status === 'warning' ? 'secondary' :
                  'destructive'
                }>
                  {log.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const ProfilePermissions = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Admin Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profileData.permissions.map((permission, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 rounded-lg border">
                <Shield className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium capitalize">
                    {permission.replace('_', ' ')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Full access granted
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Admin Profile</h1>
          <p className="text-muted-foreground">
            Manage your profile settings and preferences
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {lastRefresh && (
        <p className="text-sm text-muted-foreground">
          Last updated: {lastRefresh.toLocaleTimeString()}
        </p>
      )}

      {/* Profile Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <ProfileOverview />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <ProfileSettings />
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <ProfileActivity />
        </TabsContent>

        <TabsContent value="permissions" className="mt-6">
          <ProfilePermissions />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminProfile;
