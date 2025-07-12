import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Input,
  Avatar,
  AvatarFallback,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../components/ui';
import {
  Search,
  MoreVertical,
  Star,
  CheckCircle,
  Clock,
  Ban,
  Crown,
  UserPlus,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle
} from 'lucide-react';

// Mock data for comprehensive user management
const mockUsers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    status: 'ACTIVE',
    role: 'USER',
    joinDate: '2024-01-15',
    lastActive: '2024-07-10',
    swapsCount: 12,
    rating: 4.8,
    avatar: null,
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    totalEarnings: 1240,
    trustScore: 95,
    skills: ['React', 'JavaScript', 'Node.js'],
    reportsAgainst: 0,
    warningsIssued: 0
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    status: 'SUSPENDED',
    role: 'USER',
    joinDate: '2024-02-20',
    lastActive: '2024-07-08',
    swapsCount: 8,
    rating: 4.2,
    avatar: null,
    phone: '+1 (555) 987-6543',
    location: 'New York, NY',
    totalEarnings: 890,
    trustScore: 78,
    skills: ['UI/UX Design', 'Figma', 'Photoshop'],
    reportsAgainst: 2,
    warningsIssued: 1
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike@example.com',
    status: 'ACTIVE',
    role: 'MODERATOR',
    joinDate: '2024-01-05',
    lastActive: '2024-07-12',
    swapsCount: 25,
    rating: 4.9,
    avatar: null,
    phone: '+1 (555) 456-7890',
    location: 'Austin, TX',
    totalEarnings: 2150,
    trustScore: 98,
    skills: ['Project Management', 'Agile', 'Scrum'],
    reportsAgainst: 0,
    warningsIssued: 0
  },
  {
    id: '4',
    name: 'Sarah Wilson',
    email: 'sarah@example.com',
    status: 'ACTIVE',
    role: 'USER',
    joinDate: '2024-03-10',
    lastActive: '2024-07-11',
    swapsCount: 15,
    rating: 4.6,
    avatar: null,
    phone: '+1 (555) 321-9876',
    location: 'Seattle, WA',
    totalEarnings: 1670,
    trustScore: 92,
    skills: ['Python', 'Data Science', 'Machine Learning'],
    reportsAgainst: 0,
    warningsIssued: 0
  },
  {
    id: '5',
    name: 'David Chen',
    email: 'david@example.com',
    status: 'BANNED',
    role: 'USER',
    joinDate: '2024-04-01',
    lastActive: '2024-06-15',
    swapsCount: 3,
    rating: 2.1,
    avatar: null,
    phone: '+1 (555) 654-3210',
    location: 'Los Angeles, CA',
    totalEarnings: 120,
    trustScore: 45,
    skills: ['Marketing', 'Social Media'],
    reportsAgainst: 5,
    warningsIssued: 3
  }
];

// User Detail Modal Component
const UserDetailModal = ({ user, isOpen, onClose, onUserAction }) => {
  if (!user) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'text-green-600 bg-green-100';
      case 'SUSPENDED': return 'text-yellow-600 bg-yellow-100';
      case 'BANNED': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>User Details - {user.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="flex items-start space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg">{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-xl font-semibold">{user.name}</h3>
              <div className="flex items-center space-x-2 mt-1">
                <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
                <Badge variant="outline">{user.role}</Badge>
              </div>
              <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 mr-1" />
                  {user.rating}
                </div>
                <div>{user.swapsCount} swaps</div>
                <div>Trust: {user.trustScore}%</div>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Contact Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  {user.email}
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  {user.phone}
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  {user.location}
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Account Stats</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Join Date:</span>
                  <span>{user.joinDate}</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Active:</span>
                  <span>{user.lastActive}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Earnings:</span>
                  <span>${user.totalEarnings}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div>
            <h4 className="font-semibold mb-2">Skills</h4>
            <div className="flex flex-wrap gap-2">
              {user.skills.map((skill, index) => (
                <Badge key={index} variant="secondary">{skill}</Badge>
              ))}
            </div>
          </div>

          {/* Security Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Security Status</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Reports Against:</span>
                  <span className={user.reportsAgainst > 0 ? 'text-red-600' : 'text-green-600'}>
                    {user.reportsAgainst}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Warnings Issued:</span>
                  <span className={user.warningsIssued > 0 ? 'text-yellow-600' : 'text-green-600'}>
                    {user.warningsIssued}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Actions</h4>
              <div className="space-y-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => onUserAction(user.id, 'activate')}
                  disabled={user.status === 'ACTIVE'}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Activate
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => onUserAction(user.id, 'suspend')}
                  disabled={user.status === 'SUSPENDED'}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Suspend
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="w-full"
                  onClick={() => onUserAction(user.id, 'ban')}
                  disabled={user.status === 'BANNED'}
                >
                  <Ban className="h-4 w-4 mr-2" />
                  Ban
                </Button>
                {user.role === 'USER' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => onUserAction(user.id, 'promote')}
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    Promote to Moderator
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Main User Management Component
const ComprehensiveUserManagement = () => {
  const [users, setUsers] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetail, setShowUserDetail] = useState(false);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || user.status === statusFilter;
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    return matchesSearch && matchesStatus && matchesRole;
  });

  const handleUserAction = (userId, action) => {
    setUsers(users.map(user => {
      if (user.id === userId) {
        switch (action) {
          case 'ban':
            return { ...user, status: 'BANNED' };
          case 'suspend':
            return { ...user, status: 'SUSPENDED' };
          case 'activate':
            return { ...user, status: 'ACTIVE' };
          case 'promote':
            return { ...user, role: 'MODERATOR' };
          default:
            return user;
        }
      }
      return user;
    }));
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'SUSPENDED':
        return <Badge className="bg-yellow-100 text-yellow-800">Suspended</Badge>;
      case 'BANNED':
        return <Badge className="bg-red-100 text-red-800">Banned</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return <Badge className="bg-purple-100 text-purple-800">Admin</Badge>;
      case 'MODERATOR':
        return <Badge className="bg-blue-100 text-blue-800">Moderator</Badge>;
      case 'USER':
        return <Badge variant="secondary">User</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'SUSPENDED':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'BANNED':
        return <Ban className="h-4 w-4 text-red-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const userStats = {
    total: users.length,
    active: users.filter(u => u.status === 'ACTIVE').length,
    suspended: users.filter(u => u.status === 'SUSPENDED').length,
    banned: users.filter(u => u.status === 'BANNED').length,
    moderators: users.filter(u => u.role === 'MODERATOR').length
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{userStats.total}</div>
            <div className="text-sm text-muted-foreground">Total Users</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{userStats.active}</div>
            <div className="text-sm text-muted-foreground">Active</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{userStats.suspended}</div>
            <div className="text-sm text-muted-foreground">Suspended</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{userStats.banned}</div>
            <div className="text-sm text-muted-foreground">Banned</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{userStats.moderators}</div>
            <div className="text-sm text-muted-foreground">Moderators</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="SUSPENDED">Suspended</SelectItem>
            <SelectItem value="BANNED">Banned</SelectItem>
          </SelectContent>
        </Select>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Roles</SelectItem>
            <SelectItem value="USER">User</SelectItem>
            <SelectItem value="MODERATOR">Moderator</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>User Management ({filteredUsers.length} users)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">{user.name}</span>
                      {getStatusIcon(user.status)}
                    </div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                    <div className="flex items-center space-x-2 mt-1">
                      {getStatusBadge(user.status)}
                      {getRoleBadge(user.role)}
                    </div>
                    <div className="flex items-center space-x-4 mt-1 text-xs text-muted-foreground">
                      <span>Joined: {user.joinDate}</span>
                      <span>Last active: {user.lastActive}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right text-sm">
                    <div className="flex items-center">
                      <Star className="h-3 w-3 text-yellow-500 mr-1" />
                      {user.rating}
                    </div>
                    <div>{user.swapsCount} swaps</div>
                    <div className="text-xs text-muted-foreground">
                      Trust: {user.trustScore}%
                    </div>
                    {user.reportsAgainst > 0 && (
                      <div className="text-xs text-red-600">
                        {user.reportsAgainst} reports
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedUser(user);
                        setShowUserDetail(true);
                      }}
                    >
                      View Details
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem 
                          onClick={() => handleUserAction(user.id, 'activate')}
                          disabled={user.status === 'ACTIVE'}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Activate
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleUserAction(user.id, 'suspend')}
                          disabled={user.status === 'SUSPENDED'}
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          Suspend
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleUserAction(user.id, 'ban')}
                          disabled={user.status === 'BANNED'}
                        >
                          <Ban className="h-4 w-4 mr-2" />
                          Ban
                        </DropdownMenuItem>
                        {user.role === 'USER' && (
                          <DropdownMenuItem onClick={() => handleUserAction(user.id, 'promote')}>
                            <Crown className="h-4 w-4 mr-2" />
                            Promote to Moderator
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User Detail Modal */}
      <UserDetailModal
        user={selectedUser}
        isOpen={showUserDetail}
        onClose={() => setShowUserDetail(false)}
        onUserAction={handleUserAction}
      />
    </div>
  );
};

export default ComprehensiveUserManagement;
