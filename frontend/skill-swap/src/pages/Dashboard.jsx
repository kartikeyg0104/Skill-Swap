import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { 
  Button,
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  Badge,
  Progress,
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger,
  Avatar, 
  AvatarFallback, 
  AvatarImage
} from '../components/ui-consolidated';
import { SkillsManagementModal } from '../components/FeatureSections';
import { 
  User, 
  Settings, 
  LogOut, 
  Star, 
  Trophy, 
  BookOpen, 
  Users, 
  TrendingUp,
  Calendar,
  MessageSquare,
  Plus,
  Search,
  Filter,
  Bell,
  Home,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [showSkillsModal, setShowSkillsModal] = useState(false);
  
  // Data states
  const [dashboardData, setDashboardData] = useState(null);
  const [swapRequests, setSwapRequests] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    
    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch multiple data sources in parallel
      const [swapRequestsResponse, userAnalyticsResponse] = await Promise.all([
        apiService.getSwapRequests({ type: 'all', status: 'all', limit: 5 }),
        apiService.getUserAnalytics()
      ]);
      
      setSwapRequests(swapRequestsResponse.swapRequests || []);
      setDashboardData(userAnalyticsResponse);
      
      // Generate recent activity from swap requests
      const activity = (swapRequestsResponse.swapRequests || []).map(request => ({
        id: request.id,
        type: 'swap_request',
        title: `Swap request for ${request.skillRequested}`,
        description: `Exchange ${request.skillOffered} for ${request.skillRequested}`,
        date: request.createdAt,
        status: request.status,
        partner: request.requester?.name || request.receiver?.name
      }));
      
      setRecentActivity(activity);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
      // Fallback to mock data
      setSwapRequests([
        {
          id: 1,
          skillOffered: "JavaScript",
          skillRequested: "Python",
          status: "PENDING",
          createdAt: "2024-01-15T10:00:00Z",
          requester: { name: "Alice Johnson" },
          receiver: { name: "Bob Smith" }
        }
      ]);
      setDashboardData({
        totalSwaps: 24,
        skillsOffered: user?.skillsOffered?.length || 0,
        skillsWanted: user?.skillsWanted?.length || 0,
        networkConnections: 156
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const quickStats = [
    {
      title: "Total Swaps",
      value: dashboardData?.totalSwaps || 0,
      change: "+12% from last month",
      icon: TrendingUp,
      color: "text-blue-600"
    },
    {
      title: "Skills Offered",
      value: dashboardData?.skillsOffered || user?.skillsOffered?.length || 0,
      change: "+2 new skills",
      icon: BookOpen,
      color: "text-green-600"
    },
    {
      title: "Skills Wanted",
      value: dashboardData?.skillsWanted || user?.skillsWanted?.length || 0,
      change: "3 matches found",
      icon: Star,
      color: "text-yellow-600"
    },
    {
      title: "Network",
      value: dashboardData?.networkConnections || 0,
      change: "+8 new connections",
      icon: Users,
      color: "text-purple-600"
    }
  ];

  const achievements = [
    { 
      name: "First Swap", 
      description: "Complete your first skill exchange", 
      unlocked: true 
    },
    { 
      name: "Skill Master", 
      description: "Teach 10 different skills", 
      unlocked: true 
    },
    { 
      name: "Community Builder", 
      description: "Connect with 50 skill partners", 
      unlocked: false 
    },
    { 
      name: "Learning Enthusiast", 
      description: "Learn 20 new skills", 
      unlocked: false 
    },
    { 
      name: "Top Rated", 
      description: "Maintain a 4.8+ rating", 
      unlocked: true 
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Profile Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader className="text-center">
                <Avatar className="w-20 h-20 mx-auto mb-4">
                  <AvatarImage src={user?.profilePhoto} />
                  <AvatarFallback className="text-lg">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-xl">{user?.name}</CardTitle>
                <CardDescription>{user?.location || 'Location not set'}</CardDescription>
                
                <div className="flex items-center justify-center space-x-1 mt-2">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">
                    {user?.reputation?.overallRating || user?.reputation?.averageRating || 0}
                  </span>
                  <span className="text-muted-foreground">
                    ({user?.reputation?.totalRatings || user?.reputation?.reviewCount || 0} reviews)
                  </span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Trust Score</span>
                    <Badge variant="secondary">
                      {user?.reputation?.trustScore || 50}/100
                    </Badge>
                  </div>
                  <Progress value={user?.reputation?.trustScore || 50} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Credits</span>
                    <span className="font-bold text-primary">
                      {user?.credits?.balance || 0}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-sm font-medium">Badges</span>
                  <div className="flex flex-wrap gap-1">
                    {user?.reputation?.badges?.length > 0 ? (
                      user.reputation.badges.map((badge, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {badge}
                        </Badge>
                      ))
                    ) : (
                      <>
                        <Badge variant="outline" className="text-xs">
                          New Member
                        </Badge>
                        {user.isVerified && (
                          <Badge variant="outline" className="text-xs">
                            Verified
                          </Badge>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => setShowSkillsModal(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Manage Skills
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => navigate('/profile')}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-red-600 hover:text-red-700"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="swaps">Swap Requests</TabsTrigger>
                <TabsTrigger value="activity">Recent Activity</TabsTrigger>
                <TabsTrigger value="achievements">Achievements</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {/* Quick Stats */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {quickStats.map((stat, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              {stat.title}
                            </p>
                            <p className={`text-2xl font-bold ${stat.color}`}>
                              {stat.value}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {stat.change}
                            </p>
                          </div>
                          <stat.icon className={`h-8 w-8 ${stat.color}`} />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Recent Swap Requests */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Swap Requests</CardTitle>
                    <CardDescription>
                      Your latest skill exchange requests
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {swapRequests.length > 0 ? (
                      <div className="space-y-4">
                        {swapRequests.slice(0, 3).map((request) => (
                          <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <div className="font-medium">
                                {request.skillOffered} ↔ {request.skillRequested}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                with {request.requester?.name || request.receiver?.name}
                              </div>
                            </div>
                            <Badge variant={
                              request.status === 'ACCEPTED' ? 'default' :
                              request.status === 'PENDING' ? 'secondary' :
                              'destructive'
                            }>
                              {request.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No swap requests yet</p>
                        <p className="text-sm">Start by exploring skills in the Discovery section</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Swap Requests Tab */}
              <TabsContent value="swaps" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>All Swap Requests</CardTitle>
                    <CardDescription>
                      Manage your skill exchange requests
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {swapRequests.length > 0 ? (
                      <div className="space-y-4">
                        {swapRequests.map((request) => (
                          <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex-1">
                              <div className="font-medium">
                                {request.skillOffered} ↔ {request.skillRequested}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                with {request.requester?.name || request.receiver?.name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(request.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant={
                                request.status === 'ACCEPTED' ? 'default' :
                                request.status === 'PENDING' ? 'secondary' :
                                'destructive'
                              }>
                                {request.status}
                              </Badge>
                              <Button size="sm" variant="outline">
                                View Details
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No swap requests found</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Recent Activity Tab */}
              <TabsContent value="activity" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>
                      Your latest actions and interactions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {recentActivity.length > 0 ? (
                      <div className="space-y-4">
                        {recentActivity.map((activity) => (
                          <div key={activity.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                <MessageSquare className="h-4 w-4 text-primary" />
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">{activity.title}</div>
                              <div className="text-sm text-muted-foreground">
                                {activity.description}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(activity.date).toLocaleDateString()}
                              </div>
                            </div>
                            <Badge variant="outline">{activity.status}</Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No recent activity</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Achievements Tab */}
              <TabsContent value="achievements" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Achievements</CardTitle>
                    <CardDescription>
                      Track your progress and unlock new badges
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      {achievements.map((achievement, index) => (
                        <div 
                          key={index} 
                          className={`p-4 border rounded-lg ${
                            achievement.unlocked 
                              ? 'bg-green-50 border-green-200' 
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                              achievement.unlocked 
                                ? 'bg-green-100 text-green-600' 
                                : 'bg-gray-100 text-gray-400'
                            }`}>
                              <Trophy className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <div className={`font-medium ${
                                achievement.unlocked ? 'text-green-900' : 'text-gray-500'
                              }`}>
                                {achievement.name}
                              </div>
                              <div className={`text-sm ${
                                achievement.unlocked ? 'text-green-700' : 'text-gray-400'
                              }`}>
                                {achievement.description}
                              </div>
                            </div>
                            {achievement.unlocked && (
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                Unlocked
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Skills Management Modal */}
      <SkillsManagementModal 
        isOpen={showSkillsModal} 
        onClose={() => setShowSkillsModal(false)} 
      />
    </div>
  );
};

export default Dashboard;