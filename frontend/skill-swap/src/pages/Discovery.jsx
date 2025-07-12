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
import { SkillsManagementModal, UserProfileModal, SwapRequestModal } from '../components/FeatureSections';
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
  Music,
  Filter,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { toast } from 'sonner';

const Discovery = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showSkillsModal, setShowSkillsModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUserName, setSelectedUserName] = useState('');
  const [showSwapRequestModal, setShowSwapRequestModal] = useState(false);
  const [selectedUserForSwap, setSelectedUserForSwap] = useState(null);
  
  // Data states
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    
    fetchInitialData();
  }, [user, navigate]);

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      const [usersResponse, categoriesResponse] = await Promise.all([
        apiService.getDiscoveryUsers({ page: 1, limit: 12 }),
        apiService.getPopularCategories()
      ]);
      
      setUsers(usersResponse.users || []);
      setCategories(categoriesResponse.categories || []);
      setHasMore(usersResponse.pagination?.hasMore || false);
    } catch (error) {
      console.error('Error fetching initial data:', error);
      toast.error('Failed to load discovery data');
      // Fallback to mock data
      setUsers([
        {
          id: 1,
          name: 'Alex Johnson',
          location: 'San Francisco, CA',
          bio: 'Full-stack developer with 5 years of experience',
          profilePhoto: null,
          isVerified: true,
          rating: 4.9,
          reviewCount: 27,
          completedSwaps: 15,
          skills: ['React', 'TypeScript', 'JavaScript'],
          skillsDetailed: [
            { skillName: 'React', level: 'ADVANCED', category: 'Technology' },
            { skillName: 'TypeScript', level: 'ADVANCED', category: 'Technology' }
          ],
          seeking: ['UI/UX Design', 'Product Management'],
          seekingDetailed: [
            { skillName: 'UI/UX Design', priority: 'HIGH', targetLevel: 'INTERMEDIATE' }
          ],
          memberSince: '2024-01-12T06:01:19.844Z'
        }
      ]);
      setCategories([
        { name: 'Technology', count: 15 },
        { name: 'Design', count: 8 },
        { name: 'Business', count: 5 }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchInitialData();
      return;
    }

    try {
      setIsSearching(true);
      const response = await apiService.getDiscoveryUsers({
        search: searchTerm,
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        page: 1,
        limit: 12
      });
      
      setUsers(response.users || []);
      setHasMore(response.pagination?.hasMore || false);
      setPage(1);
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const loadMoreUsers = async () => {
    try {
      const nextPage = page + 1;
      const response = await apiService.getDiscoveryUsers({
        search: searchTerm,
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        page: nextPage,
        limit: 12
      });
      
      setUsers(prev => [...prev, ...(response.users || [])]);
      setHasMore(response.pagination?.hasMore || false);
      setPage(nextPage);
    } catch (error) {
      console.error('Error loading more users:', error);
      toast.error('Failed to load more users');
    }
  };

  const handleSkillRequest = async (userId, userName) => {
    // Find the user data
    const userData = users.find(u => u.id === userId);
    if (userData) {
      setSelectedUserForSwap(userData);
      setShowSwapRequestModal(true);
    }
  };

  const handleCategoryChange = async (category) => {
    setSelectedCategory(category);
    try {
      setIsSearching(true);
      const response = await apiService.getDiscoveryUsers({
        category: category === 'all' ? undefined : category,
        page: 1,
        limit: 12
      });
      
      setUsers(response.users || []);
      setHasMore(response.pagination?.hasMore || false);
      setPage(1);
    } catch (error) {
      console.error('Error filtering by category:', error);
      toast.error('Failed to filter users');
    } finally {
      setIsSearching(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Discover Skills & Teachers</h1>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search skills or people..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.name} value={category.name}>
                      {category.name} ({category.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline"
                onClick={() => setShowSkillsModal(true)}
              >
                Manage My Skills
              </Button>
              
              <Button 
                onClick={handleSearch}
                disabled={isSearching}
              >
                {isSearching ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Search
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No users found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or browse all categories.
            </p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map((user) => (
                <Card key={user.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start space-x-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={user.profilePhoto} alt={user.name} />
                        <AvatarFallback>
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <CardTitle className="text-lg">{user.name}</CardTitle>
                          {user.isVerified && (
                            <Badge variant="secondary" className="h-4 w-4 p-0">
                              <Star className="h-3 w-3 text-blue-500" />
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>{user.location}</span>
                        </div>
                        <div className="flex items-center space-x-1 mt-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{user.rating || 0}</span>
                          <span className="text-sm text-muted-foreground">
                            ({user.reviewCount || 0} reviews)
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{user.bio}</p>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Teaches:</h4>
                      <div className="flex flex-wrap gap-1">
                        {user.skillsDetailed?.map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill.skillName} ({skill.level})
                          </Badge>
                        )) || user.skills?.map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        )) || (
                          <span className="text-sm text-muted-foreground">No skills listed</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">Wants to learn:</h4>
                      <div className="flex flex-wrap gap-1">
                        {user.seekingDetailed?.map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {skill.skillName} ({skill.priority})
                          </Badge>
                        )) || user.seeking?.map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        )) || (
                          <span className="text-sm text-muted-foreground">No skills wanted</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{user.completedSwaps || 0} swaps completed</span>
                      <span>Member since {new Date(user.memberSince).getFullYear()}</span>
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
                        onClick={() => handleSkillRequest(user.id, user.name)}
                      >
                        Request Swap
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center mt-8">
                <Button 
                  variant="outline" 
                  onClick={loadMoreUsers}
                  disabled={isSearching}
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load More Users'
                  )}
                </Button>
              </div>
            )}
          </>
        )}
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
      
      <SwapRequestModal
        isOpen={showSwapRequestModal}
        onClose={() => {
          setShowSwapRequestModal(false);
          setSelectedUserForSwap(null);
        }}
        selectedUser={selectedUserForSwap}
      />
    </div>
  );
};

export default Discovery;