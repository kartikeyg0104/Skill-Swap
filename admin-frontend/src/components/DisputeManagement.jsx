import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Input,
  Button,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '../components/ui';
import {
  Search,
  AlertTriangle,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Calendar,
  Flag,
  Eye,
  Scale,
  Users,
  FileText,
  Phone,
  Mail
} from 'lucide-react';

// Mock data for disputes
const mockDisputes = [
  {
    id: 'DISP-001',
    title: 'Payment not received after skill exchange',
    reporter: { name: 'Alice Johnson', id: 'user-1' },
    reported: { name: 'Bob Smith', id: 'user-2' },
    swapId: 'swap-001',
    category: 'PAYMENT',
    priority: 'HIGH',
    status: 'PENDING',
    createdAt: '2024-07-12T10:30:00Z',
    description: 'I completed my part of the skill exchange (UI/UX design consultation) but the other party has not provided the React development lessons as agreed.',
    evidence: ['conversation-screenshot.png', 'completion-proof.pdf'],
    lastUpdate: '2024-07-12T11:15:00Z',
    assignedTo: null,
    messages: 3
  },
  {
    id: 'DISP-002',
    title: 'Inappropriate behavior during session',
    reporter: { name: 'Carol Davis', id: 'user-3' },
    reported: { name: 'David Wilson', id: 'user-4' },
    swapId: 'swap-002',
    category: 'CONDUCT',
    priority: 'HIGH',
    status: 'INVESTIGATING',
    createdAt: '2024-07-11T14:20:00Z',
    description: 'The tutor was unprofessional and made inappropriate comments during our guitar lesson session.',
    evidence: ['session-recording.mp4'],
    lastUpdate: '2024-07-12T09:30:00Z',
    assignedTo: 'admin-1',
    messages: 8
  },
  {
    id: 'DISP-003',
    title: 'Quality of service below expectations',
    reporter: { name: 'Eve Martinez', id: 'user-5' },
    reported: { name: 'Frank Brown', id: 'user-6' },
    swapId: 'swap-003',
    category: 'QUALITY',
    priority: 'MEDIUM',
    status: 'RESOLVED',
    createdAt: '2024-07-09T16:45:00Z',
    description: 'The Spanish lessons were very basic and did not match the intermediate level promised.',
    evidence: ['lesson-plan.pdf', 'chat-logs.txt'],
    lastUpdate: '2024-07-10T13:20:00Z',
    assignedTo: 'admin-2',
    messages: 12,
    resolution: 'Partial refund issued and additional lesson provided'
  },
  {
    id: 'DISP-004',
    title: 'Skill misrepresentation',
    reporter: { name: 'Grace Lee', id: 'user-7' },
    reported: { name: 'Henry Taylor', id: 'user-8' },
    swapId: 'swap-004',
    category: 'FRAUD',
    priority: 'HIGH',
    status: 'ESCALATED',
    createdAt: '2024-07-08T11:15:00Z',
    description: 'The provider claimed to be a certified web developer but provided outdated and incorrect information.',
    evidence: ['portfolio-review.pdf', 'skill-verification.png'],
    lastUpdate: '2024-07-11T16:45:00Z',
    assignedTo: 'senior-admin-1',
    messages: 15
  }
];

// Dispute Detail Modal Component
const DisputeDetailModal = ({ dispute, isOpen, onClose, onDisputeAction }) => {
  const [resolution, setResolution] = useState('');
  const [actionNote, setActionNote] = useState('');

  if (!dispute) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'text-yellow-600 bg-yellow-100';
      case 'INVESTIGATING': return 'text-blue-600 bg-blue-100';
      case 'RESOLVED': return 'text-green-600 bg-green-100';
      case 'ESCALATED': return 'text-red-600 bg-red-100';
      case 'CLOSED': return 'text-gray-600 bg-gray-100';
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

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'PAYMENT': return <Scale className="h-4 w-4" />;
      case 'CONDUCT': return <Users className="h-4 w-4" />;
      case 'QUALITY': return <FileText className="h-4 w-4" />;
      case 'FRAUD': return <AlertTriangle className="h-4 w-4" />;
      default: return <Flag className="h-4 w-4" />;
    }
  };

  const handleAction = (action) => {
    onDisputeAction(dispute.id, action, { resolution, note: actionNote });
    setResolution('');
    setActionNote('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Dispute Details - {dispute.id}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Dispute Header */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">{dispute.title}</h3>
              <div className="flex items-center space-x-2 mb-2">
                <Badge className={getStatusColor(dispute.status)}>{dispute.status}</Badge>
                <Badge className={getPriorityColor(dispute.priority)}>{dispute.priority}</Badge>
                <Badge variant="outline" className="flex items-center space-x-1">
                  {getCategoryIcon(dispute.category)}
                  <span>{dispute.category}</span>
                </Badge>
              </div>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <div>Created: {new Date(dispute.createdAt).toLocaleString()}</div>
              <div>Last Update: {new Date(dispute.lastUpdate).toLocaleString()}</div>
              {dispute.assignedTo && <div>Assigned to: {dispute.assignedTo}</div>}
            </div>
          </div>

          {/* Parties Involved */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold">Reporter</div>
                    <div className="text-sm text-muted-foreground">{dispute.reporter.name}</div>
                    <div className="text-xs text-muted-foreground">ID: {dispute.reporter.id}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <div className="font-semibold">Reported User</div>
                    <div className="text-sm text-muted-foreground">{dispute.reported.name}</div>
                    <div className="text-xs text-muted-foreground">ID: {dispute.reported.id}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Dispute Details */}
          <div>
            <h4 className="font-semibold mb-2">Description</h4>
            <div className="bg-gray-50 border rounded-lg p-4">
              <p>{dispute.description}</p>
            </div>
          </div>

          {/* Evidence */}
          {dispute.evidence.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Evidence Provided</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {dispute.evidence.map((evidence, index) => (
                  <div key={index} className="border rounded-lg p-3 flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm truncate">{evidence}</span>
                    <Button size="sm" variant="ghost">
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resolution (if resolved) */}
          {dispute.status === 'RESOLVED' && dispute.resolution && (
            <div>
              <h4 className="font-semibold mb-2">Resolution</h4>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-700">{dispute.resolution}</p>
              </div>
            </div>
          )}

          {/* Admin Actions */}
          {dispute.status !== 'RESOLVED' && dispute.status !== 'CLOSED' && (
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Admin Actions</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-2">Resolution Details</label>
                  <Textarea
                    placeholder="Describe the resolution or action taken..."
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Admin Notes</label>
                  <Textarea
                    placeholder="Add internal notes..."
                    value={actionNote}
                    onChange={(e) => setActionNote(e.target.value)}
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <Button onClick={() => handleAction('resolve')} className="w-full">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Resolve
                  </Button>
                  <Button variant="outline" onClick={() => handleAction('escalate')} className="w-full">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Escalate
                  </Button>
                  <Button variant="outline" onClick={() => handleAction('investigate')} className="w-full">
                    <Search className="h-4 w-4 mr-2" />
                    Investigate
                  </Button>
                  <Button variant="outline" onClick={() => handleAction('mediate')} className="w-full">
                    <Scale className="h-4 w-4 mr-2" />
                    Mediate
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Main Dispute Management Component
const DisputeManagement = () => {
  const [disputes, setDisputes] = useState(mockDisputes);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [showDisputeDetail, setShowDisputeDetail] = useState(false);

  const filteredDisputes = disputes.filter(dispute => {
    const matchesSearch = dispute.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dispute.reporter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dispute.reported.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dispute.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || dispute.status === statusFilter;
    const matchesCategory = categoryFilter === 'ALL' || dispute.category === categoryFilter;
    const matchesPriority = priorityFilter === 'ALL' || dispute.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
  });

  const handleDisputeAction = (disputeId, action, details = {}) => {
    setDisputes(currentDisputes => currentDisputes.map(dispute => {
      if (dispute.id === disputeId) {
        switch (action) {
          case 'resolve':
            return { 
              ...dispute, 
              status: 'RESOLVED', 
              resolution: details.resolution,
              lastUpdate: new Date().toISOString()
            };
          case 'escalate':
            return { 
              ...dispute, 
              status: 'ESCALATED',
              lastUpdate: new Date().toISOString()
            };
          case 'investigate':
            return { 
              ...dispute, 
              status: 'INVESTIGATING',
              lastUpdate: new Date().toISOString()
            };
          default:
            return dispute;
        }
      }
      return dispute;
    }));
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'INVESTIGATING':
        return <Badge className="bg-blue-100 text-blue-800">Investigating</Badge>;
      case 'RESOLVED':
        return <Badge className="bg-green-100 text-green-800">Resolved</Badge>;
      case 'ESCALATED':
        return <Badge className="bg-red-100 text-red-800">Escalated</Badge>;
      case 'CLOSED':
        return <Badge className="bg-gray-100 text-gray-800">Closed</Badge>;
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

  const disputeStats = {
    total: disputes.length,
    pending: disputes.filter(d => d.status === 'PENDING').length,
    investigating: disputes.filter(d => d.status === 'INVESTIGATING').length,
    resolved: disputes.filter(d => d.status === 'RESOLVED').length,
    escalated: disputes.filter(d => d.status === 'ESCALATED').length
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{disputeStats.total}</div>
            <div className="text-sm text-muted-foreground">Total Disputes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{disputeStats.pending}</div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{disputeStats.investigating}</div>
            <div className="text-sm text-muted-foreground">Investigating</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{disputeStats.resolved}</div>
            <div className="text-sm text-muted-foreground">Resolved</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{disputeStats.escalated}</div>
            <div className="text-sm text-muted-foreground">Escalated</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search disputes..."
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
            <SelectItem value="INVESTIGATING">Investigating</SelectItem>
            <SelectItem value="RESOLVED">Resolved</SelectItem>
            <SelectItem value="ESCALATED">Escalated</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Categories</SelectItem>
            <SelectItem value="PAYMENT">Payment Issues</SelectItem>
            <SelectItem value="CONDUCT">Conduct</SelectItem>
            <SelectItem value="QUALITY">Quality</SelectItem>
            <SelectItem value="FRAUD">Fraud</SelectItem>
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
      </div>

      {/* Disputes List */}
      <Card>
        <CardHeader>
          <CardTitle>Dispute Cases ({filteredDisputes.length} items)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredDisputes.map((dispute) => (
              <div key={dispute.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-semibold">{dispute.id}</span>
                      {getStatusBadge(dispute.status)}
                      {getPriorityBadge(dispute.priority)}
                      <Badge variant="outline">{dispute.category}</Badge>
                    </div>
                    <h3 className="text-lg font-medium mb-2">{dispute.title}</h3>
                    <div className="text-sm text-muted-foreground mb-2">
                      <span className="font-medium">{dispute.reporter.name}</span> vs{' '}
                      <span className="font-medium">{dispute.reported.name}</span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {dispute.description}
                    </p>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <div>Created: {new Date(dispute.createdAt).toLocaleDateString()}</div>
                    <div>Updated: {new Date(dispute.lastUpdate).toLocaleDateString()}</div>
                    {dispute.assignedTo && <div>Assigned: {dispute.assignedTo}</div>}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <MessageSquare className="h-4 w-4" />
                      <span>{dispute.messages} messages</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FileText className="h-4 w-4" />
                      <span>{dispute.evidence.length} evidence</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>Swap: {dispute.swapId}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedDispute(dispute);
                        setShowDisputeDetail(true);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    
                    {dispute.status === 'PENDING' && (
                      <Button
                        size="sm"
                        onClick={() => handleDisputeAction(dispute.id, 'investigate')}
                      >
                        <Search className="h-4 w-4 mr-2" />
                        Start Investigation
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {filteredDisputes.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No disputes match your current filters.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dispute Detail Modal */}
      <DisputeDetailModal
        dispute={selectedDispute}
        isOpen={showDisputeDetail}
        onClose={() => setShowDisputeDetail(false)}
        onDisputeAction={handleDisputeAction}
      />
    </div>
  );
};

export default DisputeManagement;
