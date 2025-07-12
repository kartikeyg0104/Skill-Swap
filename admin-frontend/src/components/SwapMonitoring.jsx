import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Input,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Progress,
  Textarea
} from '../components/ui';
import {
  Search,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Calendar,
  DollarSign,
  Users,
  MessageSquare,
  Star,
  Activity,
  MapPin,
  Eye,
  PlayCircle,
  PauseCircle,
  StopCircle
} from 'lucide-react';

// Mock data for swap requests
const mockSwapRequests = [
  {
    id: 'swap-001',
    requester: { name: 'Alice Johnson', id: 'user-1', avatar: '/api/placeholder/32/32' },
    provider: { name: 'Bob Smith', id: 'user-2', avatar: '/api/placeholder/32/32' },
    requestedSkill: 'React Development',
    offeredSkill: 'UI/UX Design',
    status: 'PENDING',
    priority: 'HIGH',
    createdAt: '2024-07-12T10:30:00Z',
    estimatedDuration: '2 weeks',
    location: 'Remote',
    description: 'Looking to learn advanced React patterns and hooks in exchange for comprehensive UI/UX design consultation.',
    budget: '$500',
    rating: null,
    messages: 12,
    lastActivity: '2024-07-12T09:15:00Z',
    category: 'Technology',
    milestones: [
      { name: 'Initial consultation', completed: true },
      { name: 'Skill assessment', completed: false },
      { name: 'Learning plan', completed: false },
      { name: 'Final evaluation', completed: false }
    ]
  },
  {
    id: 'swap-002',
    requester: { name: 'Carol Davis', id: 'user-3', avatar: '/api/placeholder/32/32' },
    provider: { name: 'David Wilson', id: 'user-4', avatar: '/api/placeholder/32/32' },
    requestedSkill: 'Guitar Lessons',
    offeredSkill: 'Photography',
    status: 'ACTIVE',
    priority: 'MEDIUM',
    createdAt: '2024-07-10T14:20:00Z',
    estimatedDuration: '1 month',
    location: 'San Francisco, CA',
    description: 'Beginner guitar lessons in exchange for portrait photography sessions.',
    budget: '$200',
    rating: 4.8,
    messages: 28,
    lastActivity: '2024-07-12T08:30:00Z',
    category: 'Creative',
    milestones: [
      { name: 'Initial consultation', completed: true },
      { name: 'Skill assessment', completed: true },
      { name: 'Learning plan', completed: true },
      { name: 'Final evaluation', completed: false }
    ]
  },
  {
    id: 'swap-003',
    requester: { name: 'Eve Martinez', id: 'user-5', avatar: '/api/placeholder/32/32' },
    provider: { name: 'Frank Brown', id: 'user-6', avatar: '/api/placeholder/32/32' },
    requestedSkill: 'Spanish Language',
    offeredSkill: 'Python Programming',
    status: 'COMPLETED',
    priority: 'LOW',
    createdAt: '2024-06-15T09:45:00Z',
    estimatedDuration: '6 weeks',
    location: 'New York, NY',
    description: 'Conversational Spanish lessons for Python programming tutoring.',
    budget: '$800',
    rating: 4.9,
    messages: 45,
    lastActivity: '2024-07-05T16:20:00Z',
    category: 'Language',
    milestones: [
      { name: 'Initial consultation', completed: true },
      { name: 'Skill assessment', completed: true },
      { name: 'Learning plan', completed: true },
      { name: 'Final evaluation', completed: true }
    ]
  },
  {
    id: 'swap-004',
    requester: { name: 'Grace Lee', id: 'user-7', avatar: '/api/placeholder/32/32' },
    provider: { name: 'Henry Taylor', id: 'user-8', avatar: '/api/placeholder/32/32' },
    requestedSkill: 'Digital Marketing',
    offeredSkill: 'Web Development',
    status: 'CANCELLED',
    priority: 'HIGH',
    createdAt: '2024-07-08T11:15:00Z',
    estimatedDuration: '3 weeks',
    location: 'Remote',
    description: 'SEO and social media marketing in exchange for e-commerce website development.',
    budget: '$1200',
    rating: null,
    messages: 8,
    lastActivity: '2024-07-09T10:00:00Z',
    category: 'Business',
    milestones: [
      { name: 'Initial consultation', completed: true },
      { name: 'Skill assessment', completed: false },
      { name: 'Learning plan', completed: false },
      { name: 'Final evaluation', completed: false }
    ]
  },
  {
    id: 'swap-005',
    requester: { name: 'Ian Clark', id: 'user-9', avatar: '/api/placeholder/32/32' },
    provider: { name: 'Julia White', id: 'user-10', avatar: '/api/placeholder/32/32' },
    requestedSkill: 'Cooking',
    offeredSkill: 'Fitness Training',
    status: 'DISPUTED',
    priority: 'HIGH',
    createdAt: '2024-07-11T16:30:00Z',
    estimatedDuration: '4 weeks',
    location: 'Los Angeles, CA',
    description: 'Professional cooking techniques for personal fitness training.',
    budget: '$600',
    rating: null,
    messages: 35,
    lastActivity: '2024-07-12T07:45:00Z',
    category: 'Health',
    milestones: [
      { name: 'Initial consultation', completed: true },
      { name: 'Skill assessment', completed: true },
      { name: 'Learning plan', completed: false },
      { name: 'Final evaluation', completed: false }
    ]
  }
];

// Swap Detail Modal Component
const SwapDetailModal = ({ swap, isOpen, onClose, onSwapAction }) => {
  const [actionNote, setActionNote] = useState('');
  const [actionType, setActionType] = useState('');

  if (!swap) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'text-yellow-600 bg-yellow-100';
      case 'ACTIVE': return 'text-blue-600 bg-blue-100';
      case 'COMPLETED': return 'text-green-600 bg-green-100';
      case 'CANCELLED': return 'text-gray-600 bg-gray-100';
      case 'DISPUTED': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH': return 'text-red-600 bg-red-100';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
      case 'LOW': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const completedMilestones = swap.milestones.filter(m => m.completed).length;
  const progressPercentage = (completedMilestones / swap.milestones.length) * 100;

  const handleAction = (action) => {
    onSwapAction(swap.id, action, { note: actionNote });
    setActionNote('');
    setActionType('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Swap Details - {swap.id}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Swap Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Badge className={getStatusColor(swap.status)}>{swap.status}</Badge>
                <Badge className={getPriorityColor(swap.priority)}>{swap.priority}</Badge>
                <Badge variant="outline">{swap.category}</Badge>
              </div>
              <h3 className="text-lg font-semibold">
                {swap.requestedSkill} ↔ {swap.offeredSkill}
              </h3>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <div>Created: {new Date(swap.createdAt).toLocaleDateString()}</div>
              <div>Last Activity: {new Date(swap.lastActivity).toLocaleDateString()}</div>
            </div>
          </div>

          {/* Participants */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold">Requester</div>
                    <div className="text-sm text-muted-foreground">{swap.requester.name}</div>
                    <div className="text-xs text-muted-foreground">Wants: {swap.requestedSkill}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold">Provider</div>
                    <div className="text-sm text-muted-foreground">{swap.provider.name}</div>
                    <div className="text-xs text-muted-foreground">Offers: {swap.offeredSkill}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Swap Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Duration</div>
                <div className="text-sm text-muted-foreground">{swap.estimatedDuration}</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Location</div>
                <div className="text-sm text-muted-foreground">{swap.location}</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Budget</div>
                <div className="text-sm text-muted-foreground">{swap.budget}</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Messages</div>
                <div className="text-sm text-muted-foreground">{swap.messages}</div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="font-semibold mb-2">Description</h4>
            <div className="bg-gray-50 border rounded-lg p-4">
              <p>{swap.description}</p>
            </div>
          </div>

          {/* Progress */}
          <div>
            <h4 className="font-semibold mb-3">Progress ({completedMilestones}/{swap.milestones.length} milestones)</h4>
            <Progress value={progressPercentage} className="mb-3" />
            <div className="space-y-2">
              {swap.milestones.map((milestone, index) => (
                <div key={index} className="flex items-center space-x-3">
                  {milestone.completed ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Clock className="h-4 w-4 text-gray-400" />
                  )}
                  <span className={milestone.completed ? 'text-green-600' : 'text-muted-foreground'}>
                    {milestone.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Rating */}
          {swap.rating && (
            <div>
              <h4 className="font-semibold mb-2">Rating</h4>
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-500 fill-current" />
                <span className="text-lg font-semibold">{swap.rating}</span>
                <span className="text-muted-foreground">out of 5</span>
              </div>
            </div>
          )}

          {/* Admin Actions */}
          <div className="border-t pt-4">
            <h4 className="font-semibold mb-3">Admin Actions</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-2">Action Type</label>
                <Select value={actionType} onValueChange={setActionType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approve">Approve Swap</SelectItem>
                    <SelectItem value="suspend">Suspend Swap</SelectItem>
                    <SelectItem value="cancel">Cancel Swap</SelectItem>
                    <SelectItem value="mediate">Initiate Mediation</SelectItem>
                    <SelectItem value="escalate">Escalate to Senior Admin</SelectItem>
                    <SelectItem value="refund">Process Refund</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Admin Notes</label>
                <Textarea
                  placeholder="Add notes about your action..."
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="flex space-x-3">
                <Button
                  onClick={() => handleAction(actionType)}
                  disabled={!actionType}
                  className="flex-1"
                >
                  Execute Action
                </Button>
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Main Swap Monitoring Component
const ComprehensiveSwapMonitoring = () => {
  const [swaps, setSwaps] = useState(mockSwapRequests);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [selectedSwap, setSelectedSwap] = useState(null);
  const [showSwapDetail, setShowSwapDetail] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(true);

  // Auto-refresh every 30 seconds in live mode
  useEffect(() => {
    if (!isLiveMode) return;
    
    const interval = setInterval(() => {
      // Simulate real-time updates
      setSwaps(currentSwaps => 
        currentSwaps.map(swap => ({
          ...swap,
          lastActivity: new Date().toISOString(),
          messages: swap.messages + Math.floor(Math.random() * 2)
        }))
      );
    }, 30000);

    return () => clearInterval(interval);
  }, [isLiveMode]);

  const filteredSwaps = swaps.filter(swap => {
    const matchesSearch = swap.requester.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         swap.provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         swap.requestedSkill.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         swap.offeredSkill.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || swap.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || swap.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'ALL' || swap.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const handleSwapAction = (swapId, action, details = {}) => {
    setSwaps(currentSwaps => currentSwaps.map(swap => {
      if (swap.id === swapId) {
        switch (action) {
          case 'approve':
            return { ...swap, status: 'ACTIVE', adminNote: details.note };
          case 'suspend':
            return { ...swap, status: 'SUSPENDED', adminNote: details.note };
          case 'cancel':
            return { ...swap, status: 'CANCELLED', adminNote: details.note };
          default:
            return { ...swap, adminNote: details.note };
        }
      }
      return swap;
    }));
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'ACTIVE':
        return <Badge className="bg-blue-100 text-blue-800">Active</Badge>;
      case 'COMPLETED':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'CANCELLED':
        return <Badge className="bg-gray-100 text-gray-800">Cancelled</Badge>;
      case 'DISPUTED':
        return <Badge className="bg-red-100 text-red-800">Disputed</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'HIGH':
        return <Badge className="bg-red-100 text-red-800">High</Badge>;
      case 'MEDIUM':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case 'LOW':
        return <Badge className="bg-green-100 text-green-800">Low</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const swapStats = {
    total: swaps.length,
    active: swaps.filter(s => s.status === 'ACTIVE').length,
    pending: swaps.filter(s => s.status === 'PENDING').length,
    completed: swaps.filter(s => s.status === 'COMPLETED').length,
    disputed: swaps.filter(s => s.status === 'DISPUTED').length,
    revenue: swaps.filter(s => s.status === 'COMPLETED').reduce((sum, s) => sum + parseInt(s.budget.replace('$', '')), 0)
  };

  return (
    <div className="space-y-6">
      {/* Live Status Bar */}
      <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${isLiveMode ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
          <span className="font-medium">
            {isLiveMode ? 'Live Monitoring Active' : 'Live Monitoring Paused'}
          </span>
          <span className="text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleTimeString()}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsLiveMode(!isLiveMode)}
        >
          {isLiveMode ? (
            <>
              <PauseCircle className="h-4 w-4 mr-2" />
              Pause Live Updates
            </>
          ) : (
            <>
              <PlayCircle className="h-4 w-4 mr-2" />
              Resume Live Updates
            </>
          )}
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{swapStats.total}</div>
            <div className="text-sm text-muted-foreground">Total Swaps</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{swapStats.active}</div>
            <div className="text-sm text-muted-foreground">Active</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{swapStats.pending}</div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{swapStats.completed}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{swapStats.disputed}</div>
            <div className="text-sm text-muted-foreground">Disputed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">${swapStats.revenue}</div>
            <div className="text-sm text-muted-foreground">Revenue</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="relative lg:col-span-2">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search swaps, users, or skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
            <SelectItem value="DISPUTED">Disputed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Priority</SelectItem>
            <SelectItem value="HIGH">High</SelectItem>
            <SelectItem value="MEDIUM">Medium</SelectItem>
            <SelectItem value="LOW">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Categories</SelectItem>
            <SelectItem value="Technology">Technology</SelectItem>
            <SelectItem value="Creative">Creative</SelectItem>
            <SelectItem value="Language">Language</SelectItem>
            <SelectItem value="Business">Business</SelectItem>
            <SelectItem value="Health">Health</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Swap List */}
      <Card>
        <CardHeader>
          <CardTitle>Skill Swaps ({filteredSwaps.length} items)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredSwaps.map((swap) => {
              const completedMilestones = swap.milestones.filter(m => m.completed).length;
              const progressPercentage = (completedMilestones / swap.milestones.length) * 100;

              return (
                <div key={swap.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-semibold">{swap.id}</span>
                        {getStatusBadge(swap.status)}
                        {getPriorityBadge(swap.priority)}
                        <Badge variant="outline">{swap.category}</Badge>
                      </div>
                      <div className="text-lg mb-2">
                        <span className="font-medium">{swap.requestedSkill}</span>
                        <span className="mx-2">↔</span>
                        <span className="font-medium">{swap.offeredSkill}</span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{swap.requester.name} ↔ {swap.provider.name}</span>
                        <span>{swap.location}</span>
                        <span>{swap.budget}</span>
                      </div>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <div>Created: {new Date(swap.createdAt).toLocaleDateString()}</div>
                      <div>Last Activity: {new Date(swap.lastActivity).toLocaleDateString()}</div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Progress</span>
                      <span className="text-sm text-muted-foreground">
                        {completedMilestones}/{swap.milestones.length} milestones
                      </span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>{swap.messages}</span>
                      </div>
                      {swap.rating && (
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span>{swap.rating}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{swap.estimatedDuration}</span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedSwap(swap);
                          setShowSwapDetail(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      
                      {swap.status === 'DISPUTED' && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleSwapAction(swap.id, 'mediate')}
                        >
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Mediate
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {filteredSwaps.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No swap requests match your current filters.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Swap Detail Modal */}
      <SwapDetailModal
        swap={selectedSwap}
        isOpen={showSwapDetail}
        onClose={() => setShowSwapDetail(false)}
        onSwapAction={handleSwapAction}
      />
    </div>
  );
};

export default ComprehensiveSwapMonitoring;
