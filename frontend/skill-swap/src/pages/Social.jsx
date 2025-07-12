
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
  LogOut
} from 'lucide-react';

// Create Post Component (inline)
const CreatePost = ({ onPost }) => {
  const [content, setContent] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = () => {
    if (content.trim()) {
      onPost(content);
      setContent('');
      setIsExpanded(false);
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
                      disabled={!content.trim() || content.length > 280}
                    >
                      Share
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
const SocialPost = ({ post, onLike, onBookmark, onViewProfile }) => {
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const handleProfileClick = () => {
    if (onViewProfile) {
      onViewProfile(post.author.id || post.author.username, post.author.name);
    }
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
                <AvatarImage src={post.author.avatar} alt={post.author.name} />
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
                  {post.author.verified && (
                    <Badge variant="secondary" className="h-4 w-4 p-0">
                      <Verified className="h-3 w-3 text-blue-500" />
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <span 
                    className="cursor-pointer hover:underline hover:text-primary transition-colors"
                    onClick={handleProfileClick}
                  >
                    {post.author.username}
                  </span>
                  <span>•</span>
                  <span>{post.timestamp}</span>
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

          {post.image && (
            <div className="mb-4 rounded-lg overflow-hidden">
              <img 
                src={post.image} 
                alt="Post content" 
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center space-x-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onLike(post.id)}
                className={`flex items-center space-x-2 ${
                  post.liked ? 'text-red-500' : 'text-muted-foreground'
                }`}
              >
                <Heart className={`h-4 w-4 ${post.liked ? 'fill-current' : ''}`} />
                <span>{post.likes}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowComments(true)}
                className="flex items-center space-x-2 text-muted-foreground hover:text-blue-500"
              >
                <MessageCircle className="h-4 w-4" />
                <span>{post.comments}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowShare(true)}
                className="flex items-center space-x-2 text-muted-foreground hover:text-green-500"
              >
                <Share className="h-4 w-4" />
                <span>{post.shares}</span>
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onBookmark(post.id)}
              className={`${
                post.bookmarked ? 'text-blue-500' : 'text-muted-foreground'
              }`}
            >
              <Bookmark className={`h-4 w-4 ${post.bookmarked ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <CommentsModal 
        isOpen={showComments} 
        onClose={() => setShowComments(false)} 
        postId={post.id}
        postAuthor={post.author.name}
      />
      <ShareModal 
        isOpen={showShare} 
        onClose={() => setShowShare(false)} 
        postContent={post.content}
        postAuthor={post.author.name}
      />
    </>
  );
};

// Social Sidebar Component (inline)
const SocialSidebar = () => {
  const trendingTopics = [
    { tag: 'React', posts: '2.5k posts' },
    { tag: 'JavaScript', posts: '1.8k posts' },
    { tag: 'WebDev', posts: '3.2k posts' },
    { tag: 'UI/UX', posts: '1.1k posts' },
    { tag: 'Learning', posts: '945 posts' }
  ];

  const suggestedConnections = [
    { name: 'Emily Parker', role: 'UX Designer', mutualConnections: 12 },
    { name: 'David Kim', role: 'Frontend Developer', mutualConnections: 8 },
    { name: 'Lisa Wong', role: 'Product Manager', mutualConnections: 15 }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">John Doe</h3>
              <p className="text-sm text-muted-foreground">Software Engineer</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4 text-center">
            <div>
              <div className="font-semibold">248</div>
              <div className="text-xs text-muted-foreground">Posts</div>
            </div>
            <div>
              <div className="font-semibold">1.2k</div>
              <div className="text-xs text-muted-foreground">Following</div>
            </div>
            <div>
              <div className="font-semibold">890</div>
              <div className="text-xs text-muted-foreground">Followers</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Trending
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {trendingTopics.map((topic, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Hash className="h-4 w-4 text-primary" />
                <span className="font-medium">{topic.tag}</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {topic.posts}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Users className="h-5 w-5 mr-2" />
            People You May Know
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {suggestedConnections.map((person, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {person.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-medium text-sm">{person.name}</div>
                  <div className="text-xs text-muted-foreground">{person.role}</div>
                  <div className="text-xs text-muted-foreground">
                    {person.mutualConnections} mutual connections
                  </div>
                </div>
              </div>
              <Button size="sm" variant="outline" className="w-full">
                Connect
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

// Social Feed Component (inline)
const SocialFeed = ({ onViewProfile }) => {
  const [posts, setPosts] = useState([
    {
      id: '1',
      author: {
        id: 'alex_j',
        name: 'Alex Johnson',
        username: '@alexj',
        avatar: '/placeholder.svg',
        verified: true
      },
      content: 'Just finished an amazing React workshop! The way hooks can simplify state management is incredible. #React #WebDev #Learning',
      timestamp: '2h',
      likes: 24,
      comments: 8,
      shares: 3,
      image: '/placeholder.svg',
      liked: false,
      bookmarked: false
    },
    {
      id: '2',
      author: {
        id: 'sarah_c',
        name: 'Sarah Chen',
        username: '@sarahc',
        avatar: '/placeholder.svg',
        verified: false
      },
      content: 'Working on a new design system for our team. Sometimes the simplest solutions are the best ones. Focus on clarity over complexity! 🎨',
      timestamp: '4h',
      likes: 15,
      comments: 4,
      shares: 2,
      image: null,
      liked: true,
      bookmarked: false
    },
    {
      id: '3',
      author: {
        id: 'mike_r',
        name: 'Mike Rodriguez',
        username: '@mikingdev',
        avatar: '/placeholder.svg',
        verified: true
      },
      content: 'Hot take: Clean code isn\'t just about making it work, it\'s about making it readable. Always optimize for clarity first, performance second. Remember: you write code once, but you (and others) read it dozens of times.\n\nWhat are your thoughts on code readability vs. performance optimization?',
      timestamp: '6h',
      likes: 42,
      comments: 12,
      shares: 8,
      image: null,
      liked: false,
      bookmarked: true
    }
  ]);

  const handleLike = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            liked: !post.liked, 
            likes: post.liked ? post.likes - 1 : post.likes + 1
          }
        : post
    ));
  };

  const handleBookmark = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, bookmarked: !post.bookmarked }
        : post
    ));
  };

  const handleAddPost = (content, image) => {
    const newPost = {
      id: (posts.length + 1).toString(),
      author: {
        id: 'current_user',
        name: 'Current User',
        username: '@currentuser',
        avatar: '/placeholder.svg',
        verified: false
      },
      content,
      timestamp: 'now',
      likes: 0,
      comments: 0,
      shares: 0,
      image,
      liked: false,
      bookmarked: false
    };
    setPosts([newPost, ...posts]);
  };

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
          />
        ))}
      </div>
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

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleViewProfile = (userId, userName) => {
    setSelectedUserId(userId);
    setSelectedUserName(userName);
    setShowProfileModal(true);
  };

  if (!user) {
    return null; // or a loading spinner
  }

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