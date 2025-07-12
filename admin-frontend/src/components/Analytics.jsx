import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Progress
} from '../components/ui';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Activity,
  DollarSign,
  Calendar,
  Star,
  MessageSquare,
  Clock,
  Target,
  BarChart3,
  PieChart,
  LineChart,
  RefreshCw,
  Download,
  Filter,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area
} from 'recharts';

// Mock data for analytics
const mockAnalyticsData = {
  overview: {
    totalUsers: 15247,
    activeUsers: 8943,
    totalSwaps: 3521,
    completedSwaps: 2847,
    totalRevenue: 147823,
    avgRating: 4.7,
    responseTime: 2.3,
    successRate: 94.2
  },
  userGrowth: [
    { month: 'Jan', users: 8500, active: 4200 },
    { month: 'Feb', users: 9200, active: 4800 },
    { month: 'Mar', users: 10100, active: 5400 },
    { month: 'Apr', users: 11300, active: 6100 },
    { month: 'May', users: 12800, active: 7200 },
    { month: 'Jun', users: 14200, active: 8100 },
    { month: 'Jul', users: 15247, active: 8943 }
  ],
  swapActivity: [
    { day: 'Mon', pending: 45, active: 120, completed: 85 },
    { day: 'Tue', pending: 52, active: 135, completed: 92 },
    { day: 'Wed', pending: 38, active: 148, completed: 78 },
    { day: 'Thu', pending: 61, active: 156, completed: 104 },
    { day: 'Fri', pending: 47, active: 142, completed: 98 },
    { day: 'Sat', pending: 28, active: 89, completed: 67 },
    { day: 'Sun', pending: 33, active: 95, completed: 71 }
  ],
  skillCategories: [
    { name: 'Technology', value: 35, count: 1232 },
    { name: 'Creative', value: 22, count: 774 },
    { name: 'Language', value: 18, count: 634 },
    { name: 'Business', value: 15, count: 528 },
    { name: 'Health', value: 10, count: 353 }
  ],
  revenue: [
    { month: 'Jan', revenue: 18500, swaps: 245 },
    { month: 'Feb', revenue: 22300, swaps: 298 },
    { month: 'Mar', revenue: 26700, swaps: 356 },
    { month: 'Apr', revenue: 31200, swaps: 417 },
    { month: 'May', revenue: 28900, swaps: 385 },
    { month: 'Jun', revenue: 34100, swaps: 456 },
    { month: 'Jul', revenue: 31400, swaps: 419 }
  ],
  userEngagement: [
    { metric: 'Daily Active Users', value: 3247, change: 12.5, trend: 'up' },
    { metric: 'Weekly Active Users', value: 8943, change: 8.3, trend: 'up' },
    { metric: 'Monthly Active Users', value: 15247, change: 15.7, trend: 'up' },
    { metric: 'Session Duration', value: '24.5 min', change: -2.1, trend: 'down' },
    { metric: 'Pages per Session', value: 7.8, change: 5.4, trend: 'up' },
    { metric: 'Bounce Rate', value: '23.4%', change: -3.2, trend: 'up' }
  ],
  platformHealth: [
    { metric: 'System Uptime', value: '99.98%', status: 'excellent' },
    { metric: 'Response Time', value: '230ms', status: 'good' },
    { metric: 'Error Rate', value: '0.12%', status: 'excellent' },
    { metric: 'Database Performance', value: '97%', status: 'good' },
    { metric: 'CDN Performance', value: '99.5%', status: 'excellent' },
    { metric: 'API Success Rate', value: '99.7%', status: 'excellent' }
  ]
};

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

// Metric Card Component
const MetricCard = ({ title, value, change, trend, icon: Icon, format = 'number' }) => {
  const formatValue = (val) => {
    if (format === 'currency') return `$${val.toLocaleString()}`;
    if (format === 'percentage') return `${val}%`;
    if (format === 'decimal') return val.toFixed(1);
    return val.toLocaleString();
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{formatValue(value)}</p>
            {change !== undefined && (
              <div className="flex items-center mt-1">
                {trend === 'up' ? (
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {Math.abs(change)}%
                </span>
              </div>
            )}
          </div>
          {Icon && (
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Icon className="h-6 w-6 text-blue-600" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Health Status Component
const HealthStatus = ({ metric, value, status }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'excellent': return <CheckCircle className="h-4 w-4" />;
      case 'good': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertCircle className="h-4 w-4" />;
      case 'critical': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div className="flex items-center space-x-3">
        <div className={`flex items-center space-x-1 px-2 py-1 rounded ${getStatusColor(status)}`}>
          {getStatusIcon(status)}
          <span className="text-sm font-medium capitalize">{status}</span>
        </div>
        <span className="font-medium">{metric}</span>
      </div>
      <span className="text-lg font-bold">{value}</span>
    </div>
  );
};

// Main Analytics Component
const ComprehensiveAnalytics = () => {
  const [timeRange, setTimeRange] = useState('7days');
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [selectedMetrics, setSelectedMetrics] = useState('all');

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLastUpdated(new Date());
    setRefreshing(false);
  };

  const exportData = () => {
    // Simulate data export
    const dataStr = JSON.stringify(mockAnalyticsData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics Overview</h2>
          <p className="text-muted-foreground">
            Last updated: {lastUpdated.toLocaleString()}
          </p>
        </div>
        <div className="flex space-x-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24hours">Last 24 Hours</SelectItem>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Users"
          value={mockAnalyticsData.overview.totalUsers}
          change={15.7}
          trend="up"
          icon={Users}
        />
        <MetricCard
          title="Active Users"
          value={mockAnalyticsData.overview.activeUsers}
          change={8.3}
          trend="up"
          icon={Activity}
        />
        <MetricCard
          title="Total Revenue"
          value={mockAnalyticsData.overview.totalRevenue}
          change={12.4}
          trend="up"
          icon={DollarSign}
          format="currency"
        />
        <MetricCard
          title="Success Rate"
          value={mockAnalyticsData.overview.successRate}
          change={2.1}
          trend="up"
          icon={Target}
          format="percentage"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <LineChart className="h-5 w-5" />
              <span>User Growth</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={mockAnalyticsData.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="users" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                <Area type="monotone" dataKey="active" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Skill Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="h-5 w-5" />
              <span>Skill Categories</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={mockAnalyticsData.skillCategories}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {mockAnalyticsData.skillCategories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Swap Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Weekly Swap Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockAnalyticsData.swapActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="pending" fill="#F59E0B" name="Pending" />
                <Bar dataKey="active" fill="#3B82F6" name="Active" />
                <Bar dataKey="completed" fill="#10B981" name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Revenue Trend</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsLineChart data={mockAnalyticsData.revenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value, name) => [
                  name === 'revenue' ? `$${value.toLocaleString()}` : value,
                  name === 'revenue' ? 'Revenue' : 'Swaps'
                ]} />
                <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={3} />
                <Line type="monotone" dataKey="swaps" stroke="#3B82F6" strokeWidth={2} />
              </RechartsLineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* User Engagement Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>User Engagement Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockAnalyticsData.userEngagement.map((metric, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{metric.metric}</p>
                    <p className="text-xl font-bold">{metric.value}</p>
                  </div>
                  <div className="flex items-center space-x-1">
                    {metric.trend === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                    <span className={`text-sm font-medium ${
                      metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {Math.abs(metric.change)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Platform Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Platform Health Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockAnalyticsData.platformHealth.map((health, index) => (
              <HealthStatus
                key={index}
                metric={health.metric}
                value={health.value}
                status={health.status}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{mockAnalyticsData.overview.avgRating}</div>
            <div className="text-sm text-muted-foreground">Avg Rating</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{mockAnalyticsData.overview.responseTime}h</div>
            <div className="text-sm text-muted-foreground">Response Time</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <MessageSquare className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{mockAnalyticsData.overview.completedSwaps}</div>
            <div className="text-sm text-muted-foreground">Completed Swaps</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{mockAnalyticsData.overview.totalSwaps}</div>
            <div className="text-sm text-muted-foreground">Total Swaps</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ComprehensiveAnalytics;
