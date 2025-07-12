import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
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
  Settings,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    
    fetchProfileData();
  }, [user, navigate]);

  const fetchProfileData = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getUserProfile();
      setProfileData(response);
    } catch (error) {
      console.error('Error fetching profile data:', error);
      toast.error('Failed to load profile data');
      // Use user data from auth context as fallback
      setProfileData(user);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = async (updatedData) => {
    try {
      const response = await apiService.updateUserProfile(updatedData);
      setProfileData(response.user);
      updateUser(response.user);
      toast.success('Profile updated successfully!');
      setShowEditProfile(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Use profileData if available, otherwise fall back to user from auth context
  const currentUser = profileData || user;

  // Calculate trust score based on user data
  const calculateTrustScore = () => {
    let score = 50; // Base score
    
    const rating = currentUser.reputation?.overallRating || currentUser.reputation?.averageRating;
    const totalRatings = currentUser.reputation?.totalRatings || currentUser.reputation?.reviewCount;
    
    if (rating >= 4.5) score += 30;
    else if (rating >= 4.0) score += 20;
    else if (rating >= 3.5) score += 10;
    
    if (totalRatings >= 20) score += 15;
    else if (totalRatings >= 10) score += 10;
    else if (totalRatings >= 5) score += 5;
    
    if (currentUser.skillsOffered?.length >= 5) score += 5;
    
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
                  <AvatarImage src={currentUser.profilePhoto} />
                  <AvatarFallback className="text-2xl bg-blue-500 text-white">
                    {currentUser.name?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {currentUser.name || 'John Doe'}
                </h1>
                
                <div className="flex items-center justify-center text-gray-600 mb-4">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{currentUser.location || 'Location not set'}</span>
                </div>

                {currentUser.bio && (
                  <p className="text-gray-600 mb-4 max-w-md mx-auto">
                    {currentUser.bio}
                  </p>
                )}
                
                {/* Rating */}
                <div className="flex items-center justify-center mb-6">
                  <Star className="h-5 w-5 text-yellow-400 fill-current mr-1" />
                  <span className="text-xl font-bold mr-2">
                    {currentUser.reputation?.overallRating || currentUser.reputation?.averageRating || 0}
                  </span>
                  <span className="text-gray-500">
                    ({currentUser.reputation?.totalRatings || currentUser.reputation?.reviewCount || 0} reviews)
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
                  <span className="text-2xl font-bold">{currentUser.credits?.balance || 0}</span>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Total earned: {currentUser.credits?.totalEarned || 0} | Total spent: {currentUser.credits?.totalSpent || 0}
                </div>
              </div>

              {/* Badges */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Badges</h3>
                <div className="flex flex-wrap gap-2">
                  {currentUser.reputation?.badges?.length > 0 ? (
                    currentUser.reputation.badges.map((badge, index) => (
                      <Badge key={index} variant="secondary" className="px-4 py-2 text-sm">
                        {badge}
                      </Badge>
                    ))
                  ) : (
                    <>
                      <Badge variant="secondary" className="px-4 py-2 text-sm">
                        New Member
                      </Badge>
                      {currentUser.isVerified && (
                        <Badge variant="secondary" className="px-4 py-2 text-sm">
                          Verified
                        </Badge>
                      )}
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
                  {currentUser.skillsOffered?.length || 0}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <h4 className="font-semibold text-gray-900 mb-1">Completed Swaps</h4>
                <p className="text-2xl font-bold text-green-600">
                  {currentUser.reputation?.completedSwaps || 0}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <h4 className="font-semibold text-gray-900 mb-1">Member Since</h4>
                <p className="text-lg font-bold text-purple-600">
                  {currentUser.createdAt ? new Date(currentUser.createdAt).getFullYear() : 'N/A'}
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
                {currentUser.skillsOffered?.length > 0 ? (
                  currentUser.skillsOffered.slice(0, 3).map((skill) => (
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
                {currentUser.skillsOffered?.length > 3 && (
                  <div className="text-center pt-2">
                    <Button variant="link" size="sm">
                      View all {currentUser.skillsOffered.length} skills
                    </Button>
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
                {currentUser.skillsWanted?.length > 0 ? (
                  currentUser.skillsWanted.slice(0, 3).map((skill) => (
                    <div key={skill.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{skill.skillName}</div>
                        <div className="text-sm text-muted-foreground">
                          Priority: {skill.priority}
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {skill.targetLevel || 'Any Level'}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No learning goals set yet
                  </div>
                )}
                {currentUser.skillsWanted?.length > 3 && (
                  <div className="text-center pt-2">
                    <Button variant="link" size="sm">
                      View all {currentUser.skillsWanted.length} skills
                    </Button>
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
        onUpdate={handleProfileUpdate}
        currentUser={currentUser}
      />
    </div>
  );
};

export default Profile;
