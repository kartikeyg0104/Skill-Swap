import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
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
  Home
} from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [showSkillsModal, setShowSkillsModal] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const quickStats = [
    {
      title: "Total Swaps",
      value: "24",
      change: "+12% from last month",
      icon: TrendingUp,
      color: "text-blue-600"
    },
    {
      title: "Skills Offered",
      value: user?.skillsOffered?.length || 0,
      change: "+2 new skills",
      icon: BookOpen,
      color: "text-green-600"
    },
    {
      title: "Skills Wanted",
      value: user?.skillsWanted?.length || 0,
      change: "3 matches found",
      icon: Star,
      color: "text-yellow-600"
    },
    {
      title: "Network",
      value: "156",
      change: "+8 new connections",
      icon: Users,
      color: "text-purple-600"
    }
  ];

  const recentSwaps = [
    {
      id: 1,
      skill: "JavaScript Fundamentals",
      partner: "Alice Johnson",
      type: "taught",
      date: "2024-01-15",
      status: "completed",
      rating: 4.8
    },
    {
      id: 2,
      skill: "UI/UX Design",
      partner: "Bob Smith",
      type: "learned",
      date: "2024-01-12",
      status: "completed",
      rating: 4.5
    },
    {
      id: 3,
      skill: "Python Basics",
      partner: "Carol Davis",
      type: "taught",
      date: "2024-01-10",
      status: "in-progress",
      rating: null
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
                  <AvatarImage src={user?.profile.profilePhoto} />
                  <AvatarFallback className="text-lg">
                    {user?.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-xl">{user?.name}</CardTitle>
                <CardDescription>{user?.profile.location}</CardDescription>
                
                <div className="flex items-center justify-center space-x-1 mt-2">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{user?.reputation.overallRating}</span>
                  <span className="text-muted-foreground">({user?.reputation.totalRatings} reviews)</span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Trust Score</span>
                    <Badge variant="secondary">{user?.reputation.trustScore}/100</Badge>
                  </div>
                  <Progress value={user?.reputation.trustScore} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Credits</span>
                    <span className="font-bold text-primary">{user?.credits.balance}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-sm font-medium">Badges</span>
                  <div className="flex flex-wrap gap-1">
                    {user?.reputation.badges.map((badge, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {badge}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button className="w-full" variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
              <p className="text-muted-foreground">
                Here's what's happening with your skill exchanges
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {quickStats.map((stat, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                      <span className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </span>
                    </div>
                    <div className="text-2xl font-bold mb-1">{stat.value}</div>
                    <div className="text-xs text-green-600">{stat.change}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Main Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="swaps">My Swaps</TabsTrigger>
                <TabsTrigger value="skills">Skills</TabsTrigger>
                <TabsTrigger value="achievements">Achievements</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Swaps</CardTitle>
                    <CardDescription>Your latest skill exchange activities</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentSwaps.map((swap) => (
                        <div key={swap.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                          <div className="flex-1">
                            <div className="font-semibold">{swap.skill}</div>
                            <div className="text-sm text-muted-foreground">
                              {swap.type === 'taught' ? 'Taught to' : 'Learned from'} {swap.partner}
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={swap.status === 'completed' ? 'default' : 'secondary'}>
                              {swap.status}
                            </Badge>
                            {swap.rating && (
                              <div className="flex items-center mt-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm ml-1">{swap.rating}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="grid md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Find New Skills</CardTitle>
                      <CardDescription>Discover what you can learn today</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button onClick={() => navigate('/discovery')} className="w-full">
                        <Search className="h-4 w-4 mr-2" />
                        Start Discovery
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Offer a Skill</CardTitle>
                      <CardDescription>Share your expertise with others</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => setShowSkillsModal(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Skill
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="swaps">
                <Card>
                  <CardHeader>
                    <CardTitle>Swap Management</CardTitle>
                    <CardDescription>Manage your skill exchange requests</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        Swap management interface will be available here
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="skills">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Skills I Offer</CardTitle>
                      <CardDescription>Share your expertise</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {user?.skillsOffered?.map((skill) => (
                        <div key={skill.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <div className="font-medium">{skill.skillName}</div>
                            <div className="text-sm text-muted-foreground">{skill.category}</div>
                          </div>
                          <Badge variant="outline">{skill.level}</Badge>
                        </div>
                      )) || []}
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => setShowSkillsModal(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Manage Skills
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Skills I Want</CardTitle>
                      <CardDescription>What you're looking to learn</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {user?.skillsWanted.map((skill) => (
                        <div key={skill.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <div className="font-medium">{skill.skillName}</div>
                            <div className="text-sm text-muted-foreground">{skill.category}</div>
                          </div>
                          <Badge variant="secondary">Want to learn</Badge>
                        </div>
                      ))}
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => setShowSkillsModal(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Manage Skills
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="achievements">
                <Card>
                  <CardHeader>
                    <CardTitle>Achievements</CardTitle>
                    <CardDescription>Your progress and accomplishments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      {achievements.map((achievement, index) => (
                        <div 
                          key={index} 
                          className={`p-4 border rounded-lg ${achievement.unlocked ? 'bg-primary/5 border-primary/20' : 'opacity-60'}`}
                        >
                          <div className="flex items-center space-x-3">
                            <Trophy className={`h-6 w-6 ${achievement.unlocked ? 'text-primary' : 'text-muted-foreground'}`} />
                            <div>
                              <div className="font-medium">{achievement.name}</div>
                              <div className="text-sm text-muted-foreground">{achievement.description}</div>
                            </div>
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