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
  DialogTitle,
  DialogTrigger
} from '../components/ui';
import {
  Search,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Flag,
  User,
  FileText,
  Image,
  Video,
  Eye
} from 'lucide-react';

// Mock data for content moderation
const mockContentQueue = [
  {
    id: '1',
    type: 'SKILL_DESCRIPTION',
    user: 'John Doe',
    userId: 'user-1',
    content: 'Expert React developer with 5+ years of experience. I can teach advanced patterns, hooks, and state management. I have worked at major tech companies including Google, Facebook, and Apple.',
    flaggedReason: 'Potential false claims about work experience',
    submittedAt: '2024-07-12T10:30:00Z',
    priority: 'HIGH',
    status: 'PENDING',
    category: 'Technology',
    skillName: 'React Development',
    reportedBy: 'automated-system',
    mediaAttachments: []
  },
  {
    id: '2',
    type: 'USER_PROFILE',
    user: 'Jane Smith',
    userId: 'user-2',
    content: 'Professional UI/UX designer specializing in mobile applications and user research. I design apps that have been downloaded over 1 million times.',
    flaggedReason: 'Unverified download claims',
    submittedAt: '2024-07-11T15:45:00Z',
    priority: 'MEDIUM',
    status: 'PENDING',
    category: 'Creative',
    skillName: 'UI/UX Design',
    reportedBy: 'user-complaint',
    mediaAttachments: ['portfolio-image-1.jpg', 'portfolio-image-2.jpg']
  },
  {
    id: '3',
    type: 'SKILL_DESCRIPTION',
    user: 'Mike Johnson',
    userId: 'user-3',
    content: 'Guitar lessons for beginners and intermediate players. Learn popular songs and basic music theory.',
    flaggedReason: 'Appropriate content - approved by system',
    submittedAt: '2024-07-10T09:15:00Z',
    priority: 'LOW',
    status: 'APPROVED',
    category: 'Music',
    skillName: 'Guitar Lessons',
    reportedBy: 'routine-check',
    mediaAttachments: ['guitar-demo.mp4']
  },
  {
    id: '4',
    type: 'USER_BIO',
    user: 'Sarah Wilson',
    userId: 'user-4',
    content: 'Marketing expert with proven track record. Contact me for exclusive business opportunities! Make $5000/week guaranteed!',
    flaggedReason: 'Potential spam/scam content',
    submittedAt: '2024-07-09T14:20:00Z',
    priority: 'HIGH',
    status: 'PENDING',
    category: 'Business',
    skillName: 'Digital Marketing',
    reportedBy: 'user-complaint',
    mediaAttachments: []
  },
  {
    id: '5',
    type: 'SKILL_DESCRIPTION',
    user: 'David Chen',
    userId: 'user-5',
    content: 'Python programming for data science and machine learning. Hands-on projects included.',
    flaggedReason: 'Quality content review',
    submittedAt: '2024-07-08T11:30:00Z',
    priority: 'LOW',
    status: 'PENDING',
    category: 'Technology',
    skillName: 'Python Programming',
    reportedBy: 'quality-assurance',
    mediaAttachments: ['code-sample.py']
  }
];

// Content Detail Modal Component
const ContentDetailModal = ({ content, isOpen, onClose, onContentAction }) => {
  const [moderationNote, setModerationNote] = useState('');
  const [actionReason, setActionReason] = useState('');

  if (!content) return null;

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH': return 'text-red-600 bg-red-100';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
      case 'LOW': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'text-yellow-600 bg-yellow-100';
      case 'APPROVED': return 'text-green-600 bg-green-100';
      case 'REJECTED': return 'text-red-600 bg-red-100';
      case 'NEEDS_REVIEW': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleAction = (action) => {
    onContentAction(content.id, action, { note: moderationNote, reason: actionReason });
    setModerationNote('');
    setActionReason('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Content Moderation - {content.type.replace('_', ' ')}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Content Header */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold">{content.user}</h3>
              <div className="flex items-center space-x-2 mt-1">
                <Badge className={getPriorityColor(content.priority)}>{content.priority}</Badge>
                <Badge className={getStatusColor(content.status)}>{content.status}</Badge>
                <Badge variant="outline">{content.category}</Badge>
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Skill: {content.skillName}
              </div>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <div>Submitted: {new Date(content.submittedAt).toLocaleString()}</div>
              <div>Reported by: {content.reportedBy}</div>
            </div>
          </div>

          {/* Flagged Reason */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Flag className="h-4 w-4 text-yellow-600" />
              <span className="font-semibold text-yellow-800">Flagged Reason</span>
            </div>
            <p className="text-yellow-700">{content.flaggedReason}</p>
          </div>

          {/* Content */}
          <div>
            <h4 className="font-semibold mb-2">Content to Review</h4>
            <div className="bg-gray-50 border rounded-lg p-4">
              <p className="whitespace-pre-wrap">{content.content}</p>
            </div>
          </div>

          {/* Media Attachments */}
          {content.mediaAttachments.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Media Attachments</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {content.mediaAttachments.map((attachment, index) => (
                  <div key={index} className="border rounded-lg p-3 flex items-center space-x-2">
                    {attachment.includes('.jpg') || attachment.includes('.png') ? (
                      <Image className="h-4 w-4" />
                    ) : attachment.includes('.mp4') ? (
                      <Video className="h-4 w-4" />
                    ) : (
                      <FileText className="h-4 w-4" />
                    )}
                    <span className="text-sm truncate">{attachment}</span>
                    <Button size="sm" variant="ghost">
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Reason */}
          <div>
            <label className="block text-sm font-medium mb-2">Action Reason</label>
            <Select value={actionReason} onValueChange={setActionReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select reason for action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="appropriate-content">Content is appropriate</SelectItem>
                <SelectItem value="minor-violations">Minor policy violations</SelectItem>
                <SelectItem value="false-claims">Contains false claims</SelectItem>
                <SelectItem value="spam-content">Spam or promotional content</SelectItem>
                <SelectItem value="inappropriate-language">Inappropriate language</SelectItem>
                <SelectItem value="misleading-info">Misleading information</SelectItem>
                <SelectItem value="needs-clarification">Needs clarification</SelectItem>
                <SelectItem value="other">Other (specify in notes)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Moderation Notes */}
          <div>
            <label className="block text-sm font-medium mb-2">Moderation Notes</label>
            <Textarea
              placeholder="Add notes about your moderation decision..."
              value={moderationNote}
              onChange={(e) => setModerationNote(e.target.value)}
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          {content.status === 'PENDING' && (
            <div className="flex space-x-3">
              <Button
                onClick={() => handleAction('approve')}
                className="flex-1"
              >
                <ThumbsUp className="h-4 w-4 mr-2" />
                Approve Content
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleAction('reject')}
                className="flex-1"
              >
                <ThumbsDown className="h-4 w-4 mr-2" />
                Reject Content
              </Button>
              <Button
                variant="outline"
                onClick={() => handleAction('request-changes')}
                className="flex-1"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Request Changes
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Main Content Moderation Component
const ComprehensiveContentModeration = () => {
  const [contentQueue, setContentQueue] = useState(mockContentQueue);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [selectedContent, setSelectedContent] = useState(null);
  const [showContentDetail, setShowContentDetail] = useState(false);

  const filteredContent = contentQueue.filter(content => {
    const matchesSearch = content.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         content.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         content.skillName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || content.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || content.priority === priorityFilter;
    const matchesType = typeFilter === 'ALL' || content.type === typeFilter;
    return matchesSearch && matchesStatus && matchesPriority && matchesType;
  });

  const handleContentAction = (contentId, action, details = {}) => {
    setContentQueue(queue => queue.map(content => {
      if (content.id === contentId) {
        switch (action) {
          case 'approve':
            return { ...content, status: 'APPROVED', moderationNote: details.note };
          case 'reject':
            return { ...content, status: 'REJECTED', moderationNote: details.note };
          case 'request-changes':
            return { ...content, status: 'NEEDS_REVIEW', moderationNote: details.note };
          default:
            return content;
        }
      }
      return content;
    }));
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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'APPROVED':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case 'NEEDS_REVIEW':
        return <Badge className="bg-blue-100 text-blue-800">Needs Review</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'SKILL_DESCRIPTION':
        return <FileText className="h-4 w-4" />;
      case 'USER_PROFILE':
        return <User className="h-4 w-4" />;
      case 'USER_BIO':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const contentStats = {
    total: contentQueue.length,
    pending: contentQueue.filter(c => c.status === 'PENDING').length,
    approved: contentQueue.filter(c => c.status === 'APPROVED').length,
    rejected: contentQueue.filter(c => c.status === 'REJECTED').length,
    highPriority: contentQueue.filter(c => c.priority === 'HIGH' && c.status === 'PENDING').length
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{contentStats.total}</div>
            <div className="text-sm text-muted-foreground">Total Items</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{contentStats.pending}</div>
            <div className="text-sm text-muted-foreground">Pending Review</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{contentStats.approved}</div>
            <div className="text-sm text-muted-foreground">Approved</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{contentStats.rejected}</div>
            <div className="text-sm text-muted-foreground">Rejected</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{contentStats.highPriority}</div>
            <div className="text-sm text-muted-foreground">High Priority</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="relative lg:col-span-2">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search content, users, or skills..."
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
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
            <SelectItem value="NEEDS_REVIEW">Needs Review</SelectItem>
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
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Types</SelectItem>
            <SelectItem value="SKILL_DESCRIPTION">Skill Description</SelectItem>
            <SelectItem value="USER_PROFILE">User Profile</SelectItem>
            <SelectItem value="USER_BIO">User Bio</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content Queue */}
      <Card>
        <CardHeader>
          <CardTitle>Content Moderation Queue ({filteredContent.length} items)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredContent.map((content) => (
              <div key={content.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3">
                    <div className="mt-1">
                      {getTypeIcon(content.type)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-semibold">{content.user}</span>
                        {getPriorityBadge(content.priority)}
                        {getStatusBadge(content.status)}
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        {content.type.replace('_', ' ')} • {content.skillName} • {content.category}
                      </div>
                      <div className="text-sm bg-yellow-50 border border-yellow-200 rounded p-2 mb-3">
                        <span className="font-medium text-yellow-800">Flagged: </span>
                        <span className="text-yellow-700">{content.flaggedReason}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <div>{new Date(content.submittedAt).toLocaleDateString()}</div>
                    <div>by {content.reportedBy}</div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded mb-4">
                  <p className="text-sm line-clamp-3">{content.content}</p>
                </div>
                
                {content.mediaAttachments.length > 0 && (
                  <div className="flex items-center space-x-2 mb-4 text-sm text-muted-foreground">
                    <span>Attachments:</span>
                    {content.mediaAttachments.map((attachment, index) => (
                      <Badge key={index} variant="outline">{attachment}</Badge>
                    ))}
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedContent(content);
                      setShowContentDetail(true);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Review Details
                  </Button>
                  
                  {content.status === 'PENDING' && (
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleContentAction(content.id, 'approve')}
                      >
                        <ThumbsUp className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleContentAction(content.id, 'reject')}
                      >
                        <ThumbsDown className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleContentAction(content.id, 'request-changes')}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Request Changes
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {filteredContent.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No content items match your current filters.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Content Detail Modal */}
      <ContentDetailModal
        content={selectedContent}
        isOpen={showContentDetail}
        onClose={() => setShowContentDetail(false)}
        onContentAction={handleContentAction}
      />
    </div>
  );
};

export default ComprehensiveContentModeration;
