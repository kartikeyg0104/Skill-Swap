import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Button,
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  Badge,
  Input,
  Avatar, 
  AvatarFallback, 
  AvatarImage,
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue,
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger
} from '../components/ui-consolidated';
import { SkillsManagementModal, UserProfileModal } from '../components/FeatureSections';
import { 
  Search, 
  Star, 
  MapPin, 
  Clock, 
  Users, 
  TrendingUp,
  BookOpen,
  Code,
  Palette,
  Camera,
  Music
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const Discovery = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showSkillsModal, setShowSkillsModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUserName, setSelectedUserName] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const mockUsers = [
    {
      id: '1',
      name: 'Alex Johnson',
      location: 'San Francisco, CA',
      rating: 4.9,
      reviewCount: 27,
      skills: ['React', 'TypeScript', 'JavaScript', 'Node.js'],
      seeking: ['UI/UX Design', 'Product Management'],
      bio: 'Full-stack developer with 5 years of experience'
    },
    {
      id: '2',
      name: 'Sarah Chen',
      location: 'Austin, TX',
      rating: 4.8,
      reviewCount: 19,
      skills: ['UI/UX Design', 'Figma', 'Adobe Creative Suite'],
      seeking: ['React', 'Flutter'],
      bio: 'Creative designer passionate about user experience'
    }
  ];

  const handleSkillRequest = (userName) => {
    toast.success(`Skill request sent to ${userName}!`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Discover Skills & Teachers</h1>

        {/* Search */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search skills or people..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button 
                variant="outline"
                onClick={() => setShowSkillsModal(true)}
              >
                Manage My Skills
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockUsers.map((user) => (
            <Card key={user.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start space-x-4">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback>
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{user.name}</CardTitle>
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{user.location}</span>
                    </div>
                    <div className="flex items-center space-x-1 mt-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{user.rating}</span>
                      <span className="text-sm text-muted-foreground">({user.reviewCount})</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{user.bio}</p>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Teaches:</h4>
                  <div className="flex flex-wrap gap-1">
                    {user.skills.map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Wants to learn:</h4>
                  <div className="flex flex-wrap gap-1">
                    {user.seeking.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setSelectedUserId(user.id);
                      setSelectedUserName(user.name);
                      setShowProfileModal(true);
                    }}
                  >
                    View Profile
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleSkillRequest(user.name)}
                  >
                    Request Swap
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Modals */}
      <SkillsManagementModal 
        isOpen={showSkillsModal} 
        onClose={() => setShowSkillsModal(false)} 
      />
      <UserProfileModal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)} 
        userId={selectedUserId}
        userName={selectedUserName}
      />
    </div>
  );
};

export default Discovery;