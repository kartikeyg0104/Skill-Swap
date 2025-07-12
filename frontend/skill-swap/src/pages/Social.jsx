
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { 
  Button,
  Input,
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  Avatar, 
  AvatarFallback, 
  AvatarImage,
  Badge,
  Textarea
} from '../components/ui-consolidated';
import { CommentsModal, ShareModal, UserProfileModal } from '../components/FeatureSections';
import { 
  Search, 
  Bell, 
  MessageCircle, 
  Home,
  Users,
  Settings,
  Plus,
  Heart,
  Share,
  Bookmark,
  MoreHorizontal,
  Verified,
  TrendingUp,
  Hash,
  User,
  ImageIcon,
  Smile,
  MapPin,
  Calendar,
  LogOut,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

// Create Post Component (inline)
const CreatePost = ({ onPost }) => {
  const [content, setContent] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (content.trim() && !isSubmitting) {
      setIsSubmitting(true);
      try {
        // Extract hashtags from content
        const hashtags = content.match(/#\w+/g) || [];
        const cleanHashtags = hashtags.map(tag => tag.substring(1));
        
        const postData = {
          content: content.trim(),
          hashtags: cleanHashtags,
          isPublic: true
        };

        const response = await apiService.createPost(postData);
        onPost(response.post);
        setContent('');
        setIsExpanded(false);
        toast.success('Post created successfully!');
      } catch (error) {
        console.error('Error creating post:', error);
        toast.error('Failed to create post. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex space-x-4">
          <Avatar className="h-10 w-10">
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-4">
            <Textarea
              placeholder="What's happening in your skill journey?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onFocus={() => setIsExpanded(true)}
              className="min-h-[60px] resize-none border-none shadow-none focus:ring-0 text-lg placeholder:text-muted-foreground"
              maxLength={280}
            />
            
            {isExpanded && (
              <>
                <div className="flex items-center space-x-4 text-primary">
                  <Button variant="ghost" size="sm" className="p-2">
                    <ImageIcon className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-2">
                    <Smile className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-2">
                    <MapPin className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-2">
                    <Calendar className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-2">
                    <Hash className="h-5 w-5" />
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {content.length}/280
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setContent('');
                        setIsExpanded(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      size="sm"
                      onClick={handleSubmit}
                      disabled={!content.trim() || content.length > 280 || isSubmitting}
                    >
                      {isSubmitting ? 'Sharing...' : 'Share'}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Social Post Component (inline)
const SocialPost = ({ post, onLike, onBookmark, onViewProfile, onAddComment }) => {
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [comment, setComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const handleProfileClick = () => {
    if (onViewProfile) {
      onViewProfile(post.author.id, post.author.name);
    }
  };

  const handleLike = async () => {
    try {
      const response = await apiService.likePost(post.id);
      onLike(post.id, response.liked, response.likesCount);
    } catch (error) {
      console.error('Error liking post:', error);
      toast.error('Failed to like post');
    }
  };

  const handleBookmark = async () => {
    try {
      const response = await apiService.bookmarkPost(post.id);
      onBookmark(post.id, response.bookmarked);
    } catch (error) {
      console.error('Error bookmarking post:', error);
      toast.error('Failed to bookmark post');
    }
  };

  const handleAddComment = async () => {
    if (comment.trim() && !isSubmittingComment) {
      setIsSubmittingComment(true);
      try {
        const response = await apiService.addComment(post.id, { content: comment.trim() });
        onAddComment(post.id, response.comment);
        setComment('');
        toast.success('Comment added successfully!');
      } catch (error) {
        console.error('Error adding comment:', error);
        toast.error('Failed to add comment');
      } finally {
        setIsSubmittingComment(false);
      }
    }
  };

  const formatTimestamp = (timestamp) => {
    if (timestamp === 'now') return 'now';
    if (timestamp === '2h') return '2h';
    if (timestamp === '4h') return '4h';
    if (timestamp === '6h') return '6h';
    return timestamp;
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Avatar 
                className="h-10 w-10 cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all" 
                onClick={handleProfileClick}
              >
                <AvatarImage src={post.author.profilePhoto} alt={post.author.name} />
                <AvatarFallback>
                  {post.author.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <div className="flex items-center space-x-1">
                  <span 
                    className="font-semibold cursor-pointer hover:underline hover:text-primary transition-colors"
                    onClick={handleProfileClick}
                  >
                    {post.author.name}
                  </span>
                  {post.author.isVerified && (
                    <Badge variant="secondary" className="h-4 w-4 p-0">
                      <Verified className="h-3 w-3 text-blue-500" />
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <span>{formatTimestamp(post.timestamp)}</span>
                </div>
              </div>
            </div>
            
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>

          <div className="mb-4">
            <p className="text-foreground leading-relaxed whitespace-pre-wrap">
              {post.content}
            </p>
          </div>

          {post.imageUrl && (
            <div className="mb-4 rounded-lg overflow-hidden">
              <img 
                src={post.imageUrl} 
                alt="Post content" 
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
            <div className="flex items-center space-x-4">
              <span>{post.likes} likes</span>
              <span>{post.comments} comments</span>
              <span>{post.shares} shares</span>
            </div>
          </div>

          <div className="flex items-center justify-between border-t pt-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`flex items-center space-x-2 ${post.liked ? 'text-red-500' : ''}`}
              onClick={handleLike}
            >
              <Heart className={`h-4 w-4 ${post.liked ? 'fill-current' : ''}`} />
              <span>Like</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center space-x-2"
              onClick={() => setShowComments(true)}
            >
              <MessageCircle className="h-4 w-4" />
              <span>Comment</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center space-x-2"
              onClick={() => setShowShare(true)}
            >
              <Share className="h-4 w-4" />
              <span>Share</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className={`flex items-center space-x-2 ${post.bookmarked ? 'text-blue-500' : ''}`}
              onClick={handleBookmark}
            >
              <Bookmark className={`h-4 w-4 ${post.bookmarked ? 'fill-current' : ''}`} />
              <span>Bookmark</span>
            </Button>
          </div>

          {/* Quick Comment Input */}
          <div className="mt-4 flex space-x-2">
            <Input
              placeholder="Write a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="flex-1"
              onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
            />
            <Button 
              size="sm" 
              onClick={handleAddComment}
              disabled={!comment.trim() || isSubmittingComment}
            >
              {isSubmittingComment ? 'Posting...' : 'Post'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Comments Modal */}
      <CommentsModal 
        isOpen={showComments} 
        onClose={() => setShowComments(false)} 
        postId={post.id}
        post={post}
      />

      {/* Share Modal */}
      <ShareModal 
        isOpen={showShare} 
        onClose={() => setShowShare(false)} 
        post={post}
      />
    </>
  );
};

// Social Sidebar Component (inline)
const SocialSidebar = () => {
  const { user } = useAuth();
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [followingStates, setFollowingStates] = useState({});
  const [followLoading, setFollowLoading] = useState({});
  const [selectedTopic, setSelectedTopic] = useState(null);

  const fetchSidebarData = async () => {
    try {
      // Only fetch data if user is authenticated
      if (user) {
        const [topicsResponse, usersResponse] = await Promise.all([
          apiService.getTrendingTopics(),
          apiService.getSuggestedUsers()
        ]);
        
        setTrendingTopics(topicsResponse.topics || []);
        setSuggestedUsers(usersResponse.suggestedUsers || []);
      } else {
        // Use fallback data for non-authenticated users
        setTrendingTopics([
          { tag: 'SkillSwap', posts: '15 posts' },
          { tag: 'Learning', posts: '8 posts' },
          { tag: 'Community', posts: '6 posts' }
        ]);
        setSuggestedUsers([
          {
            id: 1,
            name: 'Alex Johnson',
            profilePhoto: null,
            bio: 'Full-stack developer passionate about teaching',
            skillsOffered: [{ skillName: 'React' }, { skillName: 'Node.js' }],
            mutualConnections: 3,
            followersCount: 45,
            followingCount: 23
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching sidebar data:', error);
      
      // Use fallback data on error
      setTrendingTopics([
        { tag: 'SkillSwap', posts: '15 posts' },
        { tag: 'Learning', posts: '8 posts' },
        { tag: 'Community', posts: '6 posts' }
      ]);
      setSuggestedUsers([
        {
          id: 1,
          name: 'Alex Johnson',
          profilePhoto: null,
          bio: 'Full-stack developer passionate about teaching',
          skillsOffered: [{ skillName: 'React' }, { skillName: 'Node.js' }],
          mutualConnections: 3,
          followersCount: 45,
          followingCount: 23
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSidebarData();
  }, []); // Fetch once on component mount

  const handleFollow = async (userId, userName) => {
    try {
      setFollowLoading(prev => ({ ...prev, [userId]: true }));
      
      const response = await apiService.followUser(userId);
      
      // Update the following state
      setFollowingStates(prev => ({
        ...prev,
        [userId]: response.isFollowing
      }));

      // Update the suggested users list to remove the followed user
      if (response.isFollowing) {
        setSuggestedUsers(prev => prev.filter(user => user.id !== userId));
        toast.success(`You are now following ${userName}`);
      } else {
        toast.success(`You unfollowed ${userName}`);
      }
    } catch (error) {
      console.error('Error following user:', error);
      toast.error('Failed to follow user');
    } finally {
      setFollowLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleTopicClick = (topic) => {
    setSelectedTopic(topic);
    toast.success(`Searching for posts with #${topic.tag}`);
    // In a real app, this would navigate to a search/filter view
    // For now, we'll just show a toast message
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Trending Topics */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Trending Topics</span>
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsLoading(true);
                fetchSidebarData();
              }}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {trendingTopics.length === 0 ? (
            <div className="text-center py-4">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No trending topics yet</p>
              <p className="text-xs text-muted-foreground mt-1">Start posting with hashtags to see trends!</p>
            </div>
          ) : (
            trendingTopics.map((topic, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between hover:bg-muted/50 p-2 rounded-md transition-colors cursor-pointer"
                onClick={() => handleTopicClick(topic)}
              >
                <div className="flex items-center space-x-2">
                  <Hash className="h-4 w-4 text-primary" />
                  <span className="font-medium">#{topic.tag}</span>
                </div>
                <span className="text-sm text-muted-foreground">{topic.posts}</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Suggested Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>People You May Know</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {suggestedUsers.length === 0 ? (
            <div className="text-center py-4">
              <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No suggested users at the moment</p>
              <p className="text-xs text-muted-foreground mt-1">Check back later for new connections!</p>
            </div>
          ) : (
            suggestedUsers.map((person) => (
            <div key={person.id} className="space-y-2">
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {person.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-medium text-sm">{person.name}</div>
                  <div className="text-xs text-muted-foreground">{person.bio}</div>
                  {person.skillsOffered && person.skillsOffered.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      Skills: {person.skillsOffered.slice(0, 2).map(skill => skill.skillName).join(', ')}
                      {person.skillsOffered.length > 2 && '...'}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    {person.followersCount || 0} followers
                  </div>
                </div>
              </div>
              <Button 
                size="sm" 
                variant={followingStates[person.id] ? "default" : "outline"} 
                className="w-full"
                onClick={() => handleFollow(person.id, person.name)}
                disabled={!user || followLoading[person.id]}
              >
                {followLoading[person.id] ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                    Following...
                  </div>
                ) : (
                  followingStates[person.id] ? 'Following' : 'Follow'
                )}
              </Button>
            </div>
          ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Social Feed Component (inline)
const SocialFeed = ({ onViewProfile }) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchPosts();
  }, []); // Fetch once on component mount

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      // Only fetch if user is authenticated
      if (user) {
        const response = await apiService.getPublicFeed({ page, limit: 10 });
        setPosts(response.posts || []);
        setHasMore(response.pagination?.hasMore || false);
      } else {
        // Use fallback data for non-authenticated users
        setPosts([
          {
            id: '1',
            author: {
              id: 'alex_j',
              name: 'Alex Johnson',
              profilePhoto: null,
              isVerified: true
            },
            content: 'Just finished an amazing React workshop! The way hooks can simplify state management is incredible. #React #WebDev #Learning',
            timestamp: '2h',
            likes: 24,
            comments: 8,
            shares: 3,
            imageUrl: null,
            liked: false,
            bookmarked: false
          }
        ]);
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      // Use fallback data on error
      setPosts([
        {
          id: '1',
          author: {
            id: 'alex_j',
            name: 'Alex Johnson',
            profilePhoto: null,
            isVerified: true
          },
          content: 'Just finished an amazing React workshop! The way hooks can simplify state management is incredible. #React #WebDev #Learning',
          timestamp: '2h',
          likes: 24,
          comments: 8,
          shares: 3,
          imageUrl: null,
          liked: false,
          bookmarked: false
        }
      ]);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = (postId, liked, likesCount) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, liked, likes: likesCount }
        : post
    ));
  };

  const handleBookmark = (postId, bookmarked) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, bookmarked }
        : post
    ));
  };

  const handleAddPost = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  const handleAddComment = (postId, newComment) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, comments: post.comments + 1 }
        : post
    ));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CreatePost onPost={handleAddPost} />
      
      <div className="space-y-4">
        {posts.map((post) => (
          <SocialPost
            key={post.id}
            post={post}
            onLike={handleLike}
            onBookmark={handleBookmark}
            onViewProfile={onViewProfile}
            onAddComment={handleAddComment}
          />
        ))}
      </div>

      {hasMore && (
        <div className="text-center">
          <Button 
            variant="outline" 
            onClick={() => {
              setPage(page + 1);
              fetchPosts();
            }}
          >
            Load More Posts
          </Button>
        </div>
      )}
    </div>
  );
};

// Main Social Page Component
const Social = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUserName, setSelectedUserName] = useState('');

  const handleViewProfile = (userId, userName) => {
    setSelectedUserId(userId);
    setSelectedUserName(userName);
    setShowProfileModal(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <SocialSidebar />
          </div>
          <div className="lg:col-span-3">
            <SocialFeed onViewProfile={handleViewProfile} />
          </div>
        </div>
      </div>

      {/* User Profile Modal */}
      <UserProfileModal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)} 
        userId={selectedUserId}
        userName={selectedUserName}
      />
    </div>
  );
};

export default Social;