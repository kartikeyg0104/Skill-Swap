import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Input,
  Textarea,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from './ui-consolidated';
import { 
  Bell, 
  MessageCircle, 
  Settings, 
  Edit, 
  Share2,
  Heart,
  MessageSquare,
  Send,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  GraduationCap,
  Star,
  Trash2,
  Check,
  X,
  Link,
  Facebook,
  Twitter,
  Linkedin,
  Copy,
  Camera
} from 'lucide-react';
import { toast } from 'sonner';

// Notification Management System
export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      ...notification,
      read: false,
      timestamp: new Date().toISOString()
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const unreadCount = notifications.filter(notif => !notif.read).length;

  return {
    notifications,
    addNotification,
    markAsRead,
    deleteNotification,
    markAllAsRead,
    unreadCount
  };
};

// Notifications Section
export const NotificationsModal = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'like',
      user: 'Sarah Chen',
      message: 'liked your post about React development',
      time: '2 minutes ago',
      read: false,
      avatar: '/placeholder-avatar.jpg'
    },
    {
      id: 2,
      type: 'comment',
      user: 'Mike Johnson',
      message: 'commented on your skill sharing session',
      time: '1 hour ago',
      read: false,
      avatar: '/placeholder-avatar.jpg'
    },
    {
      id: 3,
      type: 'follow',
      user: 'Emma Wilson',
      message: 'started following you',
      time: '3 hours ago',
      read: true,
      avatar: '/placeholder-avatar.jpg'
    },
    {
      id: 4,
      type: 'skill_request',
      user: 'David Lee',
      message: 'requested to learn JavaScript from you',
      time: '1 day ago',
      read: true,
      avatar: '/placeholder-avatar.jpg'
    }
  ]);

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
    toast.success('Notification deleted');
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like': return <Heart className="h-4 w-4 text-red-500" />;
      case 'comment': return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'follow': return <User className="h-4 w-4 text-green-500" />;
      case 'skill_request': return <GraduationCap className="h-4 w-4 text-purple-500" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Notifications</DialogTitle>
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              Mark all read
            </Button>
          </div>
        </DialogHeader>
        <div className="overflow-y-auto max-h-[60vh] space-y-2">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No notifications yet</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`cursor-pointer transition-colors ${
                  !notification.read ? 'bg-blue-50 border-blue-200' : ''
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={notification.avatar} />
                      <AvatarFallback>{notification.user[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm">
                            <span className="font-medium">{notification.user}</span>{' '}
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {notification.time}
                          </p>
                        </div>
                        <div className="flex items-center space-x-1 ml-2">
                          {getNotificationIcon(notification.type)}
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Chat Section
export const ChatModal = ({ isOpen, onClose }) => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [chats] = useState([
    {
      id: 1,
      user: 'Sarah Chen',
      lastMessage: 'Thanks for the React tips!',
      time: '5m ago',
      unread: 2,
      avatar: '/placeholder-avatar.jpg',
      online: true
    },
    {
      id: 2,
      user: 'Mike Johnson',
      lastMessage: 'When can we schedule the session?',
      time: '1h ago',
      unread: 0,
      avatar: '/placeholder-avatar.jpg',
      online: false
    },
    {
      id: 3,
      user: 'Emma Wilson',
      lastMessage: 'Great explanation on CSS Grid!',
      time: '2h ago',
      unread: 1,
      avatar: '/placeholder-avatar.jpg',
      online: true
    }
  ]);

  const [messages, setMessages] = useState({
    1: [
      { id: 1, sender: 'Sarah Chen', text: 'Hi! I saw your post about React hooks', time: '10:30 AM', isMine: false },
      { id: 2, sender: 'me', text: 'Hello! Yes, happy to help with React hooks', time: '10:32 AM', isMine: true },
      { id: 3, sender: 'Sarah Chen', text: 'Thanks for the React tips!', time: '10:35 AM', isMine: false }
    ],
    2: [
      { id: 1, sender: 'Mike Johnson', text: 'Hey, interested in learning JavaScript from you', time: '9:00 AM', isMine: false },
      { id: 2, sender: 'me', text: 'Sure! I\'d love to help. What\'s your current level?', time: '9:05 AM', isMine: true },
      { id: 3, sender: 'Mike Johnson', text: 'When can we schedule the session?', time: '9:10 AM', isMine: false }
    ],
    3: [
      { id: 1, sender: 'Emma Wilson', text: 'Your CSS Grid tutorial was amazing!', time: '8:00 AM', isMine: false },
      { id: 2, sender: 'me', text: 'Thank you! Glad it was helpful', time: '8:05 AM', isMine: true },
      { id: 3, sender: 'Emma Wilson', text: 'Great explanation on CSS Grid!', time: '8:10 AM', isMine: false }
    ]
  });

  const sendMessage = () => {
    if (!message.trim() || !selectedChat) return;

    const newMessage = {
      id: Date.now(),
      sender: 'me',
      text: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMine: true
    };

    setMessages(prev => ({
      ...prev,
      [selectedChat.id]: [...(prev[selectedChat.id] || []), newMessage]
    }));

    setMessage('');
    toast.success('Message sent');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] p-0">
        <div className="flex h-[70vh]">
          {/* Chat List */}
          <div className="w-1/3 border-r">
            <div className="p-4 border-b">
              <h3 className="font-semibold">Messages</h3>
            </div>
            <div className="overflow-y-auto h-full">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                    selectedChat?.id === chat.id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedChat(chat)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={chat.avatar} />
                        <AvatarFallback>{chat.user[0]}</AvatarFallback>
                      </Avatar>
                      {chat.online && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className="font-medium truncate">{chat.user}</p>
                        <p className="text-xs text-muted-foreground">{chat.time}</p>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                    </div>
                    {chat.unread > 0 && (
                      <Badge className="bg-blue-500 text-white text-xs px-2 py-1">
                        {chat.unread}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 flex flex-col">
            {selectedChat ? (
              <>
                <div className="p-4 border-b">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={selectedChat.avatar} />
                      <AvatarFallback>{selectedChat.user[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{selectedChat.user}</p>
                      <p className="text-xs text-green-500">
                        {selectedChat.online ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {(messages[selectedChat.id] || []).map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.isMine ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-3 py-2 rounded-lg ${
                          msg.isMine
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{msg.text}</p>
                        <p className={`text-xs mt-1 ${
                          msg.isMine ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {msg.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 border-t">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Type a message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      className="flex-1"
                    />
                    <Button onClick={sendMessage}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Select a chat to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Settings Section
export const SettingsModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      likes: true,
      comments: true,
      follows: true,
      messages: true
    },
    privacy: {
      profileVisible: true,
      skillsVisible: true,
      activityVisible: false,
      allowMessages: true
    },
    account: {
      theme: 'system',
      language: 'en'
    }
  });

  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
    toast.success('Settings updated');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="notifications" className="overflow-hidden">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>

          <div className="overflow-y-auto max-h-[60vh] mt-4">
            <TabsContent value="notifications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Notification Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Email Notifications</Label>
                    <Button
                      variant={settings.notifications.email ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateSetting('notifications', 'email', !settings.notifications.email)}
                    >
                      {settings.notifications.email ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Push Notifications</Label>
                    <Button
                      variant={settings.notifications.push ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateSetting('notifications', 'push', !settings.notifications.push)}
                    >
                      {settings.notifications.push ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Like Notifications</Label>
                    <Button
                      variant={settings.notifications.likes ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateSetting('notifications', 'likes', !settings.notifications.likes)}
                    >
                      {settings.notifications.likes ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Comment Notifications</Label>
                    <Button
                      variant={settings.notifications.comments ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateSetting('notifications', 'comments', !settings.notifications.comments)}
                    >
                      {settings.notifications.comments ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="privacy" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Privacy Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Profile Visibility</Label>
                    <Button
                      variant={settings.privacy.profileVisible ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateSetting('privacy', 'profileVisible', !settings.privacy.profileVisible)}
                    >
                      {settings.privacy.profileVisible ? 'Public' : 'Private'}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Skills Visibility</Label>
                    <Button
                      variant={settings.privacy.skillsVisible ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateSetting('privacy', 'skillsVisible', !settings.privacy.skillsVisible)}
                    >
                      {settings.privacy.skillsVisible ? 'Public' : 'Private'}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Activity Visibility</Label>
                    <Button
                      variant={settings.privacy.activityVisible ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateSetting('privacy', 'activityVisible', !settings.privacy.activityVisible)}
                    >
                      {settings.privacy.activityVisible ? 'Public' : 'Private'}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Allow Messages</Label>
                    <Button
                      variant={settings.privacy.allowMessages ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateSetting('privacy', 'allowMessages', !settings.privacy.allowMessages)}
                    >
                      {settings.privacy.allowMessages ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="account" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Account Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Theme</Label>
                    <Select
                      value={settings.account.theme}
                      onValueChange={(value) => updateSetting('account', 'theme', value)}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Language</Label>
                    <Select
                      value={settings.account.language}
                      onValueChange={(value) => updateSetting('account', 'language', value)}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

// Edit Profile Section
export const EditProfileModal = ({ isOpen, onClose }) => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    location: user?.location || '',
    phone: user?.phone || '',
    website: user?.website || '',
    skills: user?.skills || [],
    experience: user?.experience || '',
    education: user?.education || ''
  });

  const [newSkill, setNewSkill] = useState('');

  const handleInputChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill)) {
      setProfile(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const saveProfile = () => {
    updateUser(profile);
    toast.success('Profile updated successfully');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto max-h-[60vh] space-y-6">
          {/* Profile Photo */}
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user?.profilePhoto} />
              <AvatarFallback className="text-lg">{user?.name?.[0] || 'U'}</AvatarFallback>
            </Avatar>
            <Button variant="outline" size="sm">
              <Camera className="h-4 w-4 mr-2" />
              Change Photo
            </Button>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Full Name</Label>
              <Input
                value={profile.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                value={profile.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter your email"
                type="email"
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={profile.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter your phone number"
              />
            </div>
            <div>
              <Label>Location</Label>
              <Input
                value={profile.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Enter your location"
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <Label>Bio</Label>
            <Textarea
              value={profile.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Tell us about yourself..."
              rows={3}
            />
          </div>

          {/* Skills */}
          <div>
            <Label>Skills</Label>
            <div className="flex space-x-2 mt-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add a skill"
                onKeyPress={(e) => e.key === 'Enter' && addSkill()}
              />
              <Button onClick={addSkill}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {profile.skills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                  <span>{skill}</span>
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeSkill(skill)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Experience & Education */}
          <div>
            <Label>Experience</Label>
            <Textarea
              value={profile.experience}
              onChange={(e) => handleInputChange('experience', e.target.value)}
              placeholder="Describe your work experience..."
              rows={3}
            />
          </div>

          <div>
            <Label>Education</Label>
            <Textarea
              value={profile.education}
              onChange={(e) => handleInputChange('education', e.target.value)}
              placeholder="Describe your educational background..."
              rows={3}
            />
          </div>

          <div>
            <Label>Website</Label>
            <Input
              value={profile.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              placeholder="https://yourwebsite.com"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={saveProfile}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Comments Section
export const CommentsModal = ({ isOpen, onClose, postId, postAuthor }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([
    {
      id: 1,
      author: 'Sarah Chen',
      avatar: '/placeholder-avatar.jpg',
      content: 'Great post! Really helpful insights.',
      time: '2 hours ago',
      likes: 5,
      liked: false,
      replies: [
        {
          id: 11,
          author: 'Mike Johnson',
          avatar: '/placeholder-avatar.jpg',
          content: 'I agree! Thanks for sharing.',
          time: '1 hour ago',
          likes: 2,
          liked: true
        }
      ]
    },
    {
      id: 2,
      author: 'David Lee',
      avatar: '/placeholder-avatar.jpg',
      content: 'This is exactly what I was looking for. Thank you!',
      time: '4 hours ago',
      likes: 8,
      liked: true,
      replies: []
    }
  ]);

  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  const addComment = () => {
    if (!newComment.trim()) return;

    const comment = {
      id: Date.now(),
      author: user?.name || 'You',
      avatar: user?.profilePhoto || '/placeholder-avatar.jpg',
      content: newComment,
      time: 'just now',
      likes: 0,
      liked: false,
      replies: []
    };

    setComments(prev => [comment, ...prev]);
    setNewComment('');
    toast.success('Comment added');
  };

  const addReply = (commentId) => {
    if (!replyText.trim()) return;

    const reply = {
      id: Date.now(),
      author: user?.name || 'You',
      avatar: user?.profilePhoto || '/placeholder-avatar.jpg',
      content: replyText,
      time: 'just now',
      likes: 0,
      liked: false
    };

    setComments(prev =>
      prev.map(comment =>
        comment.id === commentId
          ? { ...comment, replies: [...comment.replies, reply] }
          : comment
      )
    );

    setReplyText('');
    setReplyingTo(null);
    toast.success('Reply added');
  };

  const toggleLike = (commentId, isReply = false, parentId = null) => {
    if (isReply) {
      setComments(prev =>
        prev.map(comment =>
          comment.id === parentId
            ? {
                ...comment,
                replies: comment.replies.map(reply =>
                  reply.id === commentId
                    ? {
                        ...reply,
                        liked: !reply.liked,
                        likes: reply.liked ? reply.likes - 1 : reply.likes + 1
                      }
                    : reply
                )
              }
            : comment
        )
      );
    } else {
      setComments(prev =>
        prev.map(comment =>
          comment.id === commentId
            ? {
                ...comment,
                liked: !comment.liked,
                likes: comment.liked ? comment.likes - 1 : comment.likes + 1
              }
            : comment
        )
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Comments</DialogTitle>
        </DialogHeader>

        {/* Add Comment */}
        <div className="border-b pb-4">
          <div className="flex space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.profilePhoto} />
              <AvatarFallback>{user?.name?.[0] || 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={2}
              />
              <div className="flex justify-end mt-2">
                <Button onClick={addComment} disabled={!newComment.trim()}>
                  Comment
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Comments List */}
        <div className="overflow-y-auto max-h-[50vh] space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="space-y-3">
              <div className="flex space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.avatar} />
                  <AvatarFallback>{comment.author[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-sm">{comment.author}</span>
                      <span className="text-xs text-muted-foreground">{comment.time}</span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                  <div className="flex items-center space-x-4 mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleLike(comment.id)}
                      className={`text-xs ${comment.liked ? 'text-red-500' : ''}`}
                    >
                      <Heart className={`h-3 w-3 mr-1 ${comment.liked ? 'fill-current' : ''}`} />
                      {comment.likes}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setReplyingTo(comment.id)}
                      className="text-xs"
                    >
                      Reply
                    </Button>
                  </div>

                  {/* Reply Input */}
                  {replyingTo === comment.id && (
                    <div className="mt-3 flex space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={user?.profilePhoto} />
                        <AvatarFallback className="text-xs">{user?.name?.[0] || 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Input
                          placeholder="Write a reply..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addReply(comment.id)}
                        />
                        <div className="flex justify-end space-x-2 mt-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setReplyingTo(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => addReply(comment.id)}
                            disabled={!replyText.trim()}
                          >
                            Reply
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Replies */}
                  {comment.replies.length > 0 && (
                    <div className="mt-3 space-y-2 ml-4 border-l-2 border-gray-100 pl-4">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="flex space-x-3">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={reply.avatar} />
                            <AvatarFallback className="text-xs">{reply.author[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="bg-gray-50 rounded-lg p-2">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-medium text-xs">{reply.author}</span>
                                <span className="text-xs text-muted-foreground">{reply.time}</span>
                              </div>
                              <p className="text-xs">{reply.content}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleLike(reply.id, true, comment.id)}
                              className={`text-xs mt-1 ${reply.liked ? 'text-red-500' : ''}`}
                            >
                              <Heart className={`h-3 w-3 mr-1 ${reply.liked ? 'fill-current' : ''}`} />
                              {reply.likes}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Share Section
export const ShareModal = ({ isOpen, onClose, postContent, postAuthor }) => {
  const [shareText, setShareText] = useState(`Check out this post by ${postAuthor}: "${postContent.substring(0, 100)}..."`);

  const shareOptions = [
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'text-blue-600',
      action: () => {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
        window.open(url, '_blank');
        toast.success('Shared to Facebook');
      }
    },
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'text-blue-400',
      action: () => {
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(window.location.href)}`;
        window.open(url, '_blank');
        toast.success('Shared to Twitter');
      }
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'text-blue-700',
      action: () => {
        const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`;
        window.open(url, '_blank');
        toast.success('Shared to LinkedIn');
      }
    },
    {
      name: 'Copy Link',
      icon: Copy,
      color: 'text-gray-600',
      action: () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard');
      }
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share Post</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Share Text</Label>
            <Textarea
              value={shareText}
              onChange={(e) => setShareText(e.target.value)}
              rows={3}
              className="mt-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {shareOptions.map((option) => (
              <Button
                key={option.name}
                variant="outline"
                onClick={option.action}
                className="flex items-center space-x-2 p-3 h-auto"
              >
                <option.icon className={`h-5 w-5 ${option.color}`} />
                <span>{option.name}</span>
              </Button>
            ))}
          </div>

          <div className="pt-2 border-t">
            <Button
              variant="outline"
              onClick={() => {
                navigator.share({
                  title: 'SkillSwap Post',
                  text: shareText,
                  url: window.location.href
                }).then(() => {
                  toast.success('Shared successfully');
                }).catch(() => {
                  toast.error('Share failed');
                });
              }}
              className="w-full"
            >
              <Share2 className="h-4 w-4 mr-2" />
              More Share Options
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// User Profile Section
export const UserProfileModal = ({ isOpen, onClose, userId, userName }) => {
  const { user } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      // Mock profile data - in real app, fetch from API
      const mockProfile = {
        id: userId,
        name: userName || 'Sarah Chen',
        username: '@sarah_chen',
        email: 'sarah@example.com',
        bio: 'Full-stack developer passionate about React and Node.js. Love teaching and learning new technologies!',
        location: 'San Francisco, CA',
        joinedDate: 'Joined March 2023',
        website: 'https://sarahchen.dev',
        avatar: '/placeholder-avatar.jpg',
        coverPhoto: '/placeholder-cover.jpg',
        verified: true,
        followers: 1234,
        following: 567,
        posts: 89,
        skills: [
          { name: 'React', level: 'Expert', endorsements: 45 },
          { name: 'JavaScript', level: 'Expert', endorsements: 38 },
          { name: 'Node.js', level: 'Advanced', endorsements: 29 },
          { name: 'TypeScript', level: 'Advanced', endorsements: 22 },
          { name: 'Python', level: 'Intermediate', endorsements: 15 }
        ],
        experience: [
          {
            title: 'Senior Frontend Developer',
            company: 'Tech Corp',
            duration: '2022 - Present',
            description: 'Leading frontend development team, building scalable React applications.'
          },
          {
            title: 'Full Stack Developer',
            company: 'Startup Inc',
            duration: '2020 - 2022',
            description: 'Developed full-stack applications using React, Node.js, and MongoDB.'
          }
        ],
        education: [
          {
            degree: 'Bachelor of Computer Science',
            school: 'University of California, Berkeley',
            year: '2020'
          }
        ],
        achievements: [
          { title: 'Top Contributor', description: 'Ranked in top 5% of contributors this year' },
          { title: 'Expert Teacher', description: 'Successfully taught 50+ students' },
          { title: 'Community Leader', description: 'Active community leader and mentor' }
        ],
        recentPosts: [
          {
            id: 1,
            content: 'Just finished a great mentoring session on React hooks! 🚀',
            timestamp: '2 hours ago',
            likes: 24,
            comments: 8
          },
          {
            id: 2,
            content: 'Sharing my latest blog post about TypeScript best practices.',
            timestamp: '1 day ago',
            likes: 156,
            comments: 23
          }
        ]
      };
      setProfileUser(mockProfile);
    }
  }, [isOpen, userId]);

  const toggleFollow = () => {
    setIsFollowing(!isFollowing);
    toast.success(isFollowing ? 'Unfollowed user' : 'Following user');
  };

  const sendMessage = () => {
    toast.success('Message feature would open here');
  };

  if (!profileUser) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p>Loading profile...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden p-0">
        {/* Cover Photo and Profile Header */}
        <div className="relative">
          <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>
          <div className="absolute -bottom-16 left-6">
            <Avatar className="h-32 w-32 border-4 border-white">
              <AvatarImage src={profileUser.avatar} />
              <AvatarFallback className="text-2xl">{profileUser.name[0]}</AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Profile Info */}
        <div className="pt-20 px-6 pb-4">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold">{profileUser.name}</h1>
                {profileUser.verified && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    <Check className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">{profileUser.username}</p>
              <p className="mt-2 max-w-md">{profileUser.bio}</p>
              <div className="flex items-center space-x-4 mt-3 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{profileUser.location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{profileUser.joinedDate}</span>
                </div>
                {profileUser.website && (
                  <div className="flex items-center space-x-1">
                    <Link className="h-4 w-4" />
                    <a href={profileUser.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                      Website
                    </a>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-6 mt-3">
                <span className="text-sm">
                  <strong>{profileUser.followers}</strong> Followers
                </span>
                <span className="text-sm">
                  <strong>{profileUser.following}</strong> Following
                </span>
                <span className="text-sm">
                  <strong>{profileUser.posts}</strong> Posts
                </span>
              </div>
            </div>
            
            {profileUser.id !== user?.id && (
              <div className="flex space-x-2">
                <Button
                  variant={isFollowing ? "outline" : "default"}
                  onClick={toggleFollow}
                >
                  {isFollowing ? 'Unfollow' : 'Follow'}
                </Button>
                <Button variant="outline" onClick={sendMessage}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Message
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="px-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
              <TabsTrigger value="experience">Experience</TabsTrigger>
              <TabsTrigger value="posts">Posts</TabsTrigger>
            </TabsList>

            <div className="overflow-y-auto max-h-[40vh] mt-4">
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Top Skills</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {profileUser.skills.slice(0, 3).map((skill, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="font-medium">{skill.name}</span>
                            <Badge variant="secondary">{skill.level}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Achievements</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {profileUser.achievements.slice(0, 3).map((achievement, index) => (
                          <div key={index}>
                            <p className="font-medium text-sm">{achievement.title}</p>
                            <p className="text-xs text-muted-foreground">{achievement.description}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="skills" className="space-y-4">
                <div className="grid gap-3">
                  {profileUser.skills.map((skill, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium">{skill.name}</h3>
                            <p className="text-sm text-muted-foreground">{skill.level}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{skill.endorsements} endorsements</p>
                            <Button variant="outline" size="sm" className="mt-1">
                              Endorse
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="experience" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-3">Work Experience</h3>
                    {profileUser.experience.map((exp, index) => (
                      <Card key={index} className="mb-3">
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-3">
                            <Briefcase className="h-5 w-5 mt-1 text-muted-foreground" />
                            <div>
                              <h4 className="font-medium">{exp.title}</h4>
                              <p className="text-sm text-muted-foreground">{exp.company} • {exp.duration}</p>
                              <p className="text-sm mt-2">{exp.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Education</h3>
                    {profileUser.education.map((edu, index) => (
                      <Card key={index} className="mb-3">
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-3">
                            <GraduationCap className="h-5 w-5 mt-1 text-muted-foreground" />
                            <div>
                              <h4 className="font-medium">{edu.degree}</h4>
                              <p className="text-sm text-muted-foreground">{edu.school} • {edu.year}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="posts" className="space-y-4">
                {profileUser.recentPosts.map((post) => (
                  <Card key={post.id}>
                    <CardContent className="p-4">
                      <p className="mb-3">{post.content}</p>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{post.timestamp}</span>
                        <div className="flex space-x-4">
                          <span>{post.likes} likes</span>
                          <span>{post.comments} comments</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Skills Management Section
export const SkillsManagementModal = ({ isOpen, onClose }) => {
  const { user, updateUser } = useAuth();
  const [skillsOffered, setSkillsOffered] = useState(user?.skillsOffered || []);
  const [skillsWanted, setSkillsWanted] = useState(user?.skillsWanted || []);
  const [newSkill, setNewSkill] = useState({
    skillName: '',
    category: '',
    level: '',
    description: ''
  });
  const [activeTab, setActiveTab] = useState('offered');

  const skillCategories = [
    'Technology', 'Design', 'Business', 'Language', 'Art', 'Music', 'Sports', 'Cooking', 'Other'
  ];

  const skillLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

  const addSkill = () => {
    if (!newSkill.skillName || !newSkill.category || !newSkill.level) {
      toast.error('Please fill in all required fields');
      return;
    }

    const skill = {
      id: Date.now().toString(),
      ...newSkill,
      endorsed: false
    };

    if (activeTab === 'offered') {
      setSkillsOffered(prev => [...prev, skill]);
    } else {
      setSkillsWanted(prev => [...prev, skill]);
    }

    setNewSkill({ skillName: '', category: '', level: '', description: '' });
    toast.success('Skill added successfully');
  };

  const removeSkill = (skillId) => {
    if (activeTab === 'offered') {
      setSkillsOffered(prev => prev.filter(skill => skill.id !== skillId));
    } else {
      setSkillsWanted(prev => prev.filter(skill => skill.id !== skillId));
    }
    toast.success('Skill removed');
  };

  const saveSkills = () => {
    updateUser({
      skillsOffered,
      skillsWanted
    });
    toast.success('Skills updated successfully');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Manage Skills</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="offered">Skills I Offer</TabsTrigger>
            <TabsTrigger value="wanted">Skills I Want</TabsTrigger>
          </TabsList>

          <div className="overflow-y-auto max-h-[60vh] mt-4">
            <TabsContent value="offered" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Add New Skill</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Skill Name</Label>
                      <Input
                        placeholder="e.g., React Development"
                        value={newSkill.skillName}
                        onChange={(e) => setNewSkill(prev => ({ ...prev, skillName: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>Category</Label>
                      <Select
                        value={newSkill.category}
                        onValueChange={(value) => setNewSkill(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {skillCategories.map(category => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Level</Label>
                      <Select
                        value={newSkill.level}
                        onValueChange={(value) => setNewSkill(prev => ({ ...prev, level: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          {skillLevels.map(level => (
                            <SelectItem key={level} value={level}>{level}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Button onClick={addSkill} className="mt-6">
                        Add Skill
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Describe your experience with this skill..."
                      value={newSkill.description}
                      onChange={(e) => setNewSkill(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3">
                {skillsOffered.map((skill) => (
                  <Card key={skill.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium">{skill.skillName}</h3>
                            <Badge variant="secondary">{skill.level}</Badge>
                            <Badge variant="outline">{skill.category}</Badge>
                          </div>
                          {skill.description && (
                            <p className="text-sm text-muted-foreground mt-2">{skill.description}</p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSkill(skill.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="wanted" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Add Skill You Want to Learn</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Skill Name</Label>
                      <Input
                        placeholder="e.g., Python Programming"
                        value={newSkill.skillName}
                        onChange={(e) => setNewSkill(prev => ({ ...prev, skillName: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>Category</Label>
                      <Select
                        value={newSkill.category}
                        onValueChange={(value) => setNewSkill(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {skillCategories.map(category => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Current Level</Label>
                      <Select
                        value={newSkill.level}
                        onValueChange={(value) => setNewSkill(prev => ({ ...prev, level: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          {skillLevels.map(level => (
                            <SelectItem key={level} value={level}>{level}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Button onClick={addSkill} className="mt-6">
                        Add Skill
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label>What you want to achieve</Label>
                    <Textarea
                      placeholder="Describe what you want to learn..."
                      value={newSkill.description}
                      onChange={(e) => setNewSkill(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3">
                {skillsWanted.map((skill) => (
                  <Card key={skill.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium">{skill.skillName}</h3>
                            <Badge variant="secondary">{skill.level}</Badge>
                            <Badge variant="outline">{skill.category}</Badge>
                          </div>
                          {skill.description && (
                            <p className="text-sm text-muted-foreground mt-2">{skill.description}</p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSkill(skill.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={saveSkills}>
            Save Skills
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
