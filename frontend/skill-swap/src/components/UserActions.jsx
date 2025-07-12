import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  Textarea,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from './ui-consolidated';
import { 
  Bell, 
  MessageCircle, 
  Settings, 
  User, 
  Camera,
  Save,
  X,
  Check,
  Heart,
  MessageSquare,
  Share2,
  Copy,
  Facebook,
  Twitter,
  Linkedin,
  Send,
  Search,
  MoreHorizontal,
  Edit3,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';

// Notifications Component
export const NotificationsModal = ({ isOpen, onClose }) => {
  const [notifications] = useState([
    {
      id: 1,
      type: 'like',
      user: 'Sarah Chen',
      avatar: '/placeholder.svg',
      message: 'liked your post about React development',
      time: '2 hours ago',
      read: false
    },
    {
      id: 2,
      type: 'comment',
      user: 'Mike Johnson',
      avatar: '/placeholder.svg',
      message: 'commented on your skill sharing session',
      time: '4 hours ago',
      read: false
    },
    {
      id: 3,
      type: 'follow',
      user: 'Alex Rivera',
      avatar: '/placeholder.svg',
      message: 'started following you',
      time: '1 day ago',
      read: true
    },
    {
      id: 4,
      type: 'skill_request',
      user: 'Emma Davis',
      avatar: '/placeholder.svg',
      message: 'requested to learn JavaScript from you',
      time: '2 days ago',
      read: true
    }
  ]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like': return <Heart className="h-4 w-4 text-red-500" />;
      case 'comment': return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'follow': return <User className="h-4 w-4 text-green-500" />;
      case 'skill_request': return <Send className="h-4 w-4 text-purple-500" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Notifications</span>
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-96 overflow-y-auto space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex items-start space-x-3 p-3 rounded-lg ${
                !notification.read ? 'bg-blue-50' : 'bg-gray-50'
              }`}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={notification.avatar} />
                <AvatarFallback>{notification.user.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center space-x-2">
                  {getNotificationIcon(notification.type)}
                  <p className="text-sm">
                    <span className="font-medium">{notification.user}</span>{' '}
                    {notification.message}
                  </p>
                </div>
                <p className="text-xs text-gray-500">{notification.time}</p>
              </div>
              {!notification.read && (
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-center pt-4">
          <Button variant="ghost" size="sm">
            Mark all as read
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Chat Component
export const ChatModal = ({ isOpen, onClose }) => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [chats] = useState([
    {
      id: 1,
      user: 'Sarah Chen',
      avatar: '/placeholder.svg',
      lastMessage: 'Thanks for the React tutorial!',
      time: '2 min ago',
      unread: 2,
      online: true
    },
    {
      id: 2,
      user: 'Mike Johnson',
      avatar: '/placeholder.svg',
      lastMessage: 'When can we schedule the session?',
      time: '1 hour ago',
      unread: 0,
      online: false
    },
    {
      id: 3,
      user: 'Alex Rivera',
      avatar: '/placeholder.svg',
      lastMessage: 'Great explanation on APIs!',
      time: '3 hours ago',
      unread: 1,
      online: true
    }
  ]);

  const [messages] = useState([
    {
      id: 1,
      sender: 'Sarah Chen',
      message: 'Hi! I really enjoyed your React tutorial post.',
      time: '10:30 AM',
      isOwn: false
    },
    {
      id: 2,
      sender: 'You',
      message: 'Thank you! I\'m glad it was helpful.',
      time: '10:32 AM',
      isOwn: true
    },
    {
      id: 3,
      sender: 'Sarah Chen',
      message: 'Could you help me with useState hooks?',
      time: '10:33 AM',
      isOwn: false
    },
    {
      id: 4,
      sender: 'You',
      message: 'Of course! useState is a React Hook that lets you add state to functional components.',
      time: '10:35 AM',
      isOwn: true
    }
  ]);

  const sendMessage = () => {
    if (message.trim()) {
      toast.success('Message sent!');
      setMessage('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5" />
            <span>Messages</span>
          </DialogTitle>
        </DialogHeader>
        <div className="flex h-full">
          {/* Chat List */}
          <div className="w-1/3 border-r pr-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input placeholder="Search conversations..." className="pl-10" />
            </div>
            <div className="space-y-2">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 ${
                    selectedChat?.id === chat.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={chat.avatar} />
                      <AvatarFallback>{chat.user.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {chat.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate">{chat.user}</p>
                      <p className="text-xs text-gray-500">{chat.time}</p>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
                  </div>
                  {chat.unread > 0 && (
                    <Badge className="h-5 w-5 flex items-center justify-center p-0 text-xs">
                      {chat.unread}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 flex flex-col pl-4">
            {selectedChat ? (
              <>
                <div className="flex items-center space-x-3 pb-4 border-b">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={selectedChat.avatar} />
                    <AvatarFallback>{selectedChat.user.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{selectedChat.user}</p>
                    <p className="text-xs text-gray-500">
                      {selectedChat.online ? 'Online' : 'Last seen 1 hour ago'}
                    </p>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto py-4 space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          msg.isOwn
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{msg.message}</p>
                        <p className={`text-xs mt-1 ${msg.isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                          {msg.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center space-x-2 pt-4 border-t">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    className="flex-1"
                  />
                  <Button onClick={sendMessage} size="sm">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Settings Component
export const SettingsModal = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    skillRequests: true,
    messages: true
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    skillsVisibility: 'public',
    allowMessages: true
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[600px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="notifications" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>
          
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Email Notifications</Label>
                  <input
                    type="checkbox"
                    checked={notifications.email}
                    onChange={(e) => setNotifications({...notifications, email: e.target.checked})}
                    className="rounded"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Push Notifications</Label>
                  <input
                    type="checkbox"
                    checked={notifications.push}
                    onChange={(e) => setNotifications({...notifications, push: e.target.checked})}
                    className="rounded"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Skill Requests</Label>
                  <input
                    type="checkbox"
                    checked={notifications.skillRequests}
                    onChange={(e) => setNotifications({...notifications, skillRequests: e.target.checked})}
                    className="rounded"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>New Messages</Label>
                  <input
                    type="checkbox"
                    checked={notifications.messages}
                    onChange={(e) => setNotifications({...notifications, messages: e.target.checked})}
                    className="rounded"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="privacy" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Profile Visibility</Label>
                  <select
                    value={privacy.profileVisibility}
                    onChange={(e) => setPrivacy({...privacy, profileVisibility: e.target.value})}
                    className="w-full p-2 border rounded"
                  >
                    <option value="public">Public</option>
                    <option value="friends">Friends Only</option>
                    <option value="private">Private</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Skills Visibility</Label>
                  <select
                    value={privacy.skillsVisibility}
                    onChange={(e) => setPrivacy({...privacy, skillsVisibility: e.target.value})}
                    className="w-full p-2 border rounded"
                  >
                    <option value="public">Public</option>
                    <option value="friends">Friends Only</option>
                    <option value="private">Private</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <Label>Allow Direct Messages</Label>
                  <input
                    type="checkbox"
                    checked={privacy.allowMessages}
                    onChange={(e) => setPrivacy({...privacy, allowMessages: e.target.checked})}
                    className="rounded"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="account" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full">
                  Change Password
                </Button>
                <Button variant="outline" className="w-full">
                  Download My Data
                </Button>
                <Separator />
                <Button variant="destructive" className="w-full">
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => { toast.success('Settings saved!'); onClose(); }}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Edit Profile Component
export const EditProfileModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    location: user?.location || '',
    website: user?.website || '',
    skills: user?.skills?.join(', ') || '',
    experience: user?.experience || ''
  });

  const handleSave = () => {
    toast.success('Profile updated successfully!');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[600px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Edit Profile</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Profile Photo */}
          <div className="flex flex-col items-center space-y-2">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user?.profile?.profilePhoto} />
              <AvatarFallback className="text-lg">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <Button variant="outline" size="sm">
              <Camera className="h-4 w-4 mr-2" />
              Change Photo
            </Button>
          </div>
          
          {/* Form Fields */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Enter your full name"
              />
            </div>
            
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                placeholder="Tell us about yourself"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                placeholder="Your location"
              />
            </div>
            
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => setFormData({...formData, website: e.target.value})}
                placeholder="https://your-website.com"
              />
            </div>
            
            <div>
              <Label htmlFor="skills">Skills (comma-separated)</Label>
              <Input
                id="skills"
                value={formData.skills}
                onChange={(e) => setFormData({...formData, skills: e.target.value})}
                placeholder="React, JavaScript, Node.js"
              />
            </div>
            
            <div>
              <Label htmlFor="experience">Experience Level</Label>
              <select
                id="experience"
                value={formData.experience}
                onChange={(e) => setFormData({...formData, experience: e.target.value})}
                className="w-full p-2 border rounded"
              >
                <option value="">Select experience level</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Comments Component
export const CommentsModal = ({ isOpen, onClose, postId }) => {
  const [comment, setComment] = useState('');
  const [comments] = useState([
    {
      id: 1,
      user: 'Sarah Chen',
      avatar: '/placeholder.svg',
      comment: 'Great tutorial! Very helpful for beginners.',
      time: '2 hours ago',
      likes: 5
    },
    {
      id: 2,
      user: 'Mike Johnson',
      avatar: '/placeholder.svg',
      comment: 'Could you explain the useState hook in more detail?',
      time: '4 hours ago',
      likes: 2
    },
    {
      id: 3,
      user: 'Alex Rivera',
      avatar: '/placeholder.svg',
      comment: 'This solved my problem! Thank you so much.',
      time: '1 day ago',
      likes: 8
    }
  ]);

  const addComment = () => {
    if (comment.trim()) {
      toast.success('Comment added!');
      setComment('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Comments ({comments.length})</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={comment.avatar} />
                <AvatarFallback>{comment.user.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="font-medium text-sm">{comment.user}</p>
                  <p className="text-sm text-gray-700">{comment.comment}</p>
                </div>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>{comment.time}</span>
                  <button className="flex items-center space-x-1 hover:text-red-500">
                    <Heart className="h-3 w-3" />
                    <span>{comment.likes}</span>
                  </button>
                  <button className="hover:text-blue-500">Reply</button>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        
        <div className="flex items-center space-x-2 pt-4 border-t">
          <Input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write a comment..."
            onKeyPress={(e) => e.key === 'Enter' && addComment()}
            className="flex-1"
          />
          <Button onClick={addComment} size="sm">
            Post
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Share Component
export const ShareModal = ({ isOpen, onClose, content }) => {
  const shareUrl = window.location.href;
  const shareText = content?.title || 'Check out this post on SkillSwap!';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied to clipboard!');
  };

  const shareOptions = [
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'text-blue-600',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    },
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'text-blue-400',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'text-blue-700',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Share2 className="h-5 w-5" />
            <span>Share Post</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {shareOptions.map((option) => (
              <button
                key={option.name}
                onClick={() => window.open(option.url, '_blank')}
                className="flex flex-col items-center space-y-2 p-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <option.icon className={`h-8 w-8 ${option.color}`} />
                <span className="text-sm">{option.name}</span>
              </button>
            ))}
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <Label>Share Link</Label>
            <div className="flex items-center space-x-2">
              <Input value={shareUrl} readOnly className="flex-1" />
              <Button onClick={copyToClipboard} size="sm">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
