import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Button,
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  Badge,
  Progress,
  Avatar, 
  AvatarFallback, 
  AvatarImage
} from '../components/ui-consolidated';
import { EditProfileModal } from '../components/FeatureSections';
import { 
  Edit,
  MapPin,
  Star,
  Trophy,
  User,
  Settings
} from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showEditProfile, setShowEditProfile] = useState(false);

  if (!user) {
    navigate('/');
    return null;
  }

  // Calculate trust score based on user data
  const calculateTrustScore = () => {
    let score = 50; // Base score
    if (user.reputation?.overallRating >= 4.5) score += 30;
    else if (user.reputation?.overallRating >= 4.0) score += 20;
    else if (user.reputation?.overallRating >= 3.5) score += 10;
    
    if (user.reputation?.totalRatings >= 20) score += 15;
    else if (user.reputation?.totalRatings >= 10) score += 10;
    else if (user.reputation?.totalRatings >= 5) score += 5;
    
    if (user.skillsOffered?.length >= 5) score += 5;
    
    return Math.min(score, 100);
  };

  const trustScore = calculateTrustScore();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Main Profile Card */}
          <Card className="border-2 border-gray-100 shadow-lg">
            <CardContent className="p-8">
              {/* Profile Picture and Basic Info */}
              <div className="text-center mb-8">
                <Avatar className="h-24 w-24 mx-auto mb-4 border-4 border-white shadow-lg">
                  <AvatarImage src={user?.profile?.profilePhoto} />
                  <AvatarFallback className="text-2xl bg-blue-500 text-white">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {user?.name || 'John Doe'}
                </h1>
                
                <div className="flex items-center justify-center text-gray-600 mb-4">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{user?.profile?.location || 'San Francisco, CA'}</span>
                </div>
                
                {/* Rating */}
                <div className="flex items-center justify-center mb-6">
                  <Star className="h-5 w-5 text-yellow-400 fill-current mr-1" />
                  <span className="text-xl font-bold mr-2">
                    {user?.reputation?.overallRating || 4.8}
                  </span>
                  <span className="text-gray-500">
                    ({user?.reputation?.totalRatings || 24} reviews)
                  </span>
                </div>
              </div>

              {/* Trust Score */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">Trust Score</h3>
                  <span className="text-xl font-bold">{trustScore}/100</span>
                </div>
                <Progress value={trustScore} className="h-3 bg-gray-200">
                  <div 
                    className="h-full bg-gray-900 rounded-full transition-all duration-300"
                    style={{ width: `${trustScore}%` }}
                  />
                </Progress>
              </div>

              {/* Credits */}
              <div className="mb-8">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Credits</h3>
                  <span className="text-2xl font-bold">{user?.credits?.balance || 75}</span>
                </div>
              </div>

              {/* Badges */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Badges</h3>
                <div className="flex flex-wrap gap-2">
                  {user?.reputation?.badges?.length > 0 ? (
                    user.reputation.badges.map((badge, index) => (
                      <Badge key={index} variant="secondary" className="px-4 py-2 text-sm">
                        {badge}
                      </Badge>
                    ))
                  ) : (
                    <>
                      <Badge variant="secondary" className="px-4 py-2 text-sm">
                        Expert Teacher
                      </Badge>
                      <Badge variant="secondary" className="px-4 py-2 text-sm">
                        Reliable
                      </Badge>
                      <Badge variant="secondary" className="px-4 py-2 text-sm">
                        Top Contributor
                      </Badge>
                    </>
                  )}
                </div>
              </div>

              {/* Edit Profile Button */}
              <Button 
                onClick={() => setShowEditProfile(true)}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300 flex items-center justify-center gap-2"
                variant="outline"
              >
                <Settings className="h-4 w-4" />
                Edit Profile
              </Button>
            </CardContent>
          </Card>

          {/* Additional Stats Cards */}
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <Card>
              <CardContent className="p-4 text-center">
                <h4 className="font-semibold text-gray-900 mb-1">Skills Offered</h4>
                <p className="text-2xl font-bold text-blue-600">
                  {user?.skillsOffered?.length || 0}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <h4 className="font-semibold text-gray-900 mb-1">Total Swaps</h4>
                <p className="text-2xl font-bold text-green-600">
                  {user?.totalSwaps || 24}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <h4 className="font-semibold text-gray-900 mb-1">Success Rate</h4>
                <p className="text-2xl font-bold text-purple-600">
                  {user?.successRate || '96%'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Skills Section */}
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            {/* Skills I Offer */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Skills I Offer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {user?.skillsOffered?.length > 0 ? (
                  user.skillsOffered.slice(0, 3).map((skill) => (
                    <div key={skill.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{skill.skillName}</div>
                        <div className="text-sm text-muted-foreground">{skill.category}</div>
                      </div>
                      <Badge variant="outline">{skill.level}</Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No skills added yet
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Skills I Want */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Skills I Want to Learn</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {user?.skillsWanted?.length > 0 ? (
                  user.skillsWanted.slice(0, 3).map((skill) => (
                    <div key={skill.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{skill.skillName}</div>
                        <div className="text-sm text-muted-foreground">{skill.category}</div>
                      </div>
                      <Badge variant="secondary">Learning</Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No learning goals set yet
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal 
        isOpen={showEditProfile} 
        onClose={() => setShowEditProfile(false)} 
      />
    </div>
  );
};

export default Profile;
