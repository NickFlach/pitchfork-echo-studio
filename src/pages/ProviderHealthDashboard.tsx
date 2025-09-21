import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell
} from 'recharts';
import { 
  Activity, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Clock, 
  Zap, 
  Shield, 
  Brain, 
  Target, 
  RefreshCw, 
  Download, 
  Settings, 
  BarChart3, 
  PieChart as PieChartIcon,
  LineChartIcon,
  Wifi,
  WifiOff,
  AlertTriangle,
  Sparkles,
  Users,
  MessageSquare,
  Gauge,
  Eye,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

// Types for the dashboard data
interface ProviderHealth {
  provider: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  availability: number;
  lastCheck: string;
  errorRate: number;
}

interface UsageAnalytics {
  provider: string;
  tokens: number;
  cost: number;
  requests: number;
  successRate: number;
  avgResponseTime: number;
  featureBreakdown: Record<string, number>;
}

interface PerformanceMetrics {
  provider: string;
  date: string;
  responseTime: number;
  requests: number;
  errors: number;
  tokens: number;
  cost: number;
}

interface ProviderRecommendation {
  provider: string;
  feature: string;
  score: number;
  reasoning: string;
  costEfficiency: number;
  performanceRating: number;
}

// Provider colors for consistent theming
const PROVIDER_COLORS = {
  openai: '#10a37f',
  claude: '#cc785c',
  gemini: '#4285f4',
  xai: '#1da1f2',
  litellm: '#8b5cf6'
};

// Real-time Provider Health Monitoring Component
const ProviderHealthMonitor = () => {
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  const { data: healthData, isLoading, refetch } = useQuery({
    queryKey: ['provider-health'],
    queryFn: () => apiRequest('/api/ai/health'),
    refetchInterval: autoRefresh ? 30000 : false, // Refresh every 30 seconds
    staleTime: 10000
  });

  const { data: performanceData } = useQuery({
    queryKey: ['provider-performance'],
    queryFn: () => apiRequest('/api/analytics/provider-performance')
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500 bg-green-100 dark:bg-green-900/20';
      case 'degraded': return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/20';
      case 'unhealthy': return 'text-red-500 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-500 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'degraded': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'unhealthy': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <Card data-testid="card-health-loading">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6" data-testid="container-provider-health">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold" data-testid="heading-provider-health">Provider Health Status</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            data-testid="button-toggle-refresh"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto-refresh: {autoRefresh ? 'On' : 'Off'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            data-testid="button-manual-refresh"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {healthData?.providers && Object.entries(healthData.providers).map(([provider, status]) => (
          <Card key={provider} data-testid={`card-provider-${provider}`}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between">
                <span className="capitalize">{provider}</span>
                {getStatusIcon(status as string)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Badge 
                  className={`w-fit ${getStatusColor(status as string)}`}
                  data-testid={`badge-status-${provider}`}
                >
                  {status as string}
                </Badge>
                
                {performanceData?.[provider] && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Response Time:</span>
                      <span data-testid={`text-response-time-${provider}`}>
                        {performanceData[provider].avgResponseTime}ms
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Availability:</span>
                      <span data-testid={`text-availability-${provider}`}>
                        {performanceData[provider].availability}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Error Rate:</span>
                      <span data-testid={`text-error-rate-${provider}`}>
                        {performanceData[provider].errorRate}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Usage Analytics Component
const UsageAnalytics = () => {
  const [timeframe, setTimeframe] = useState('day');
  const [featureFilter, setFeatureFilter] = useState('all');
  
  const { data: usageData, isLoading } = useQuery({
    queryKey: ['usage-analytics', timeframe, featureFilter],
    queryFn: () => apiRequest(`/api/analytics/usage?timeframe=${timeframe}&feature=${featureFilter}`),
  });

  const { data: costData } = useQuery({
    queryKey: ['cost-analytics', timeframe],
    queryFn: () => apiRequest(`/api/analytics/costs?timeframe=${timeframe}`),
  });

  if (isLoading) {
    return <div className="h-64 bg-gray-100 dark:bg-gray-800 animate-pulse rounded" />;
  }

  return (
    <div className="space-y-6" data-testid="container-usage-analytics">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold" data-testid="heading-usage-analytics">Usage Analytics</h2>
        <div className="flex items-center gap-2">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-32" data-testid="select-timeframe">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hour">Last Hour</SelectItem>
              <SelectItem value="day">Last Day</SelectItem>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
            </SelectContent>
          </Select>
          <Select value={featureFilter} onValueChange={setFeatureFilter}>
            <SelectTrigger className="w-40" data-testid="select-feature">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Features</SelectItem>
              <SelectItem value="consciousness">Consciousness</SelectItem>
              <SelectItem value="leadership">Leadership</SelectItem>
              <SelectItem value="decision">Decision Support</SelectItem>
              <SelectItem value="corruption">Corruption Detection</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="card-total-requests">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="text-total-requests">
              {usageData?.totalRequests?.toLocaleString() || '0'}
            </div>
            <p className="text-sm text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +12% from last period
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-total-tokens">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="text-total-tokens">
              {usageData?.totalTokens?.toLocaleString() || '0'}
            </div>
            <p className="text-sm text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +8% from last period
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-total-cost">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="text-total-cost">
              ${costData?.totalCost?.toFixed(2) || '0.00'}
            </div>
            <p className="text-sm text-muted-foreground">
              <TrendingDown className="inline h-3 w-3 mr-1 text-green-500" />
              -3% from last period
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-avg-response-time">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Avg Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="text-avg-response-time">
              {usageData?.avgResponseTime || '0'}ms
            </div>
            <p className="text-sm text-muted-foreground">
              <TrendingDown className="inline h-3 w-3 mr-1 text-green-500" />
              -15ms from last period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Provider Usage Chart */}
      <Card data-testid="card-provider-usage-chart">
        <CardHeader>
          <CardTitle>Provider Usage Over Time</CardTitle>
          <CardDescription>Requests per provider for the selected timeframe</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={usageData?.chartData || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              {Object.keys(PROVIDER_COLORS).map(provider => (
                <Line 
                  key={provider}
                  type="monotone" 
                  dataKey={provider} 
                  stroke={PROVIDER_COLORS[provider]} 
                  strokeWidth={2}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

// Performance Metrics Component
const PerformanceMetrics = () => {
  const { data: performanceData, isLoading } = useQuery({
    queryKey: ['performance-metrics'],
    queryFn: () => apiRequest('/api/analytics/performance'),
  });

  const { data: feedbackData } = useQuery({
    queryKey: ['feedback-analytics'],
    queryFn: () => apiRequest('/api/analytics/feedback'),
  });

  if (isLoading) {
    return <div className="h-96 bg-gray-100 dark:bg-gray-800 animate-pulse rounded" />;
  }

  return (
    <div className="space-y-6" data-testid="container-performance-metrics">
      <h2 className="text-2xl font-bold" data-testid="heading-performance-metrics">Performance Metrics</h2>
      
      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card data-testid="card-response-time-trends">
          <CardHeader>
            <CardTitle>Response Time Trends</CardTitle>
            <CardDescription>Average response time per provider over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={performanceData?.responseTimeData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                {Object.keys(PROVIDER_COLORS).map(provider => (
                  <Area 
                    key={provider}
                    type="monotone" 
                    dataKey={provider} 
                    stackId="1"
                    stroke={PROVIDER_COLORS[provider]} 
                    fill={PROVIDER_COLORS[provider]}
                    fillOpacity={0.3}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card data-testid="card-success-rates">
          <CardHeader>
            <CardTitle>Success Rates</CardTitle>
            <CardDescription>Provider reliability comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {performanceData?.successRates?.map((provider: any) => (
                <div key={provider.name} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="capitalize font-medium">{provider.name}</span>
                    <span data-testid={`text-success-rate-${provider.name}`}>
                      {provider.rate}%
                    </span>
                  </div>
                  <Progress 
                    value={provider.rate} 
                    className="h-2"
                    data-testid={`progress-success-rate-${provider.name}`}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Satisfaction */}
      <Card data-testid="card-user-satisfaction">
        <CardHeader>
          <CardTitle>User Satisfaction Scores</CardTitle>
          <CardDescription>Feedback ratings by provider and feature</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={feedbackData?.satisfactionByProvider || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="provider" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="rating" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
              {feedbackData?.recentFeedback?.map((feedback: any, index: number) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="capitalize">
                      {feedback.provider}
                    </Badge>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`text-sm ${
                            i < feedback.rating ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {feedback.comment || 'No comment provided'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Intelligent Recommendations Component
const IntelligentRecommendations = () => {
  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['ai-recommendations'],
    queryFn: () => apiRequest('/api/analytics/recommendations'),
  });

  const { data: optimizationData } = useQuery({
    queryKey: ['optimization-insights'],
    queryFn: () => apiRequest('/api/analytics/optimization'),
  });

  if (isLoading) {
    return <div className="h-64 bg-gray-100 dark:bg-gray-800 animate-pulse rounded" />;
  }

  return (
    <div className="space-y-6" data-testid="container-recommendations">
      <h2 className="text-2xl font-bold" data-testid="heading-recommendations">Intelligent Recommendations</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Provider Recommendations */}
        <Card data-testid="card-provider-recommendations">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sparkles className="h-5 w-5 mr-2" />
              Optimal Provider Selection
            </CardTitle>
            <CardDescription>AI-powered recommendations for different use cases</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendations?.providerRecommendations?.map((rec: any, index: number) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="capitalize">{rec.feature}</Badge>
                    <Badge variant="outline" className="capitalize">
                      {rec.recommendedProvider}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {rec.reasoning}
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <span>Performance: {rec.performanceScore}/10</span>
                    <span>Cost Efficiency: {rec.costScore}/10</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Cost Optimization */}
        <Card data-testid="card-cost-optimization">
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              Cost Optimization
            </CardTitle>
            <CardDescription>Potential savings and optimization opportunities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-900/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Potential Monthly Savings</span>
                  <span className="text-2xl font-bold text-green-600">
                    ${optimizationData?.potentialSavings || '0.00'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  By optimizing provider selection and routing
                </p>
              </div>
              
              {optimizationData?.suggestions?.map((suggestion: any, index: number) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex items-center mb-2">
                    <Target className="h-4 w-4 mr-2 text-blue-500" />
                    <span className="font-medium">{suggestion.title}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {suggestion.description}
                  </p>
                  <div className="mt-2">
                    <Badge variant="secondary">
                      {suggestion.impact}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Routing Optimization */}
      <Card data-testid="card-routing-optimization">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="h-5 w-5 mr-2" />
            Smart Routing Recommendations
          </CardTitle>
          <CardDescription>Optimize request routing for better performance and cost</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {optimizationData?.routingStrategies?.map((strategy: any, index: number) => (
              <div key={index} className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">{strategy.name}</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  {strategy.description}
                </p>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span>Performance Gain:</span>
                    <span className="text-green-600">+{strategy.performanceGain}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cost Reduction:</span>
                    <span className="text-blue-600">-{strategy.costReduction}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Admin Tools Component
const AdminTools = () => {
  const [testInProgress, setTestInProgress] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const testAllProviders = useMutation({
    mutationFn: () => apiRequest('/api/ai/test-all-providers', { method: 'POST' }),
    onMutate: () => setTestInProgress(true),
    onSuccess: (data) => {
      toast({
        title: 'Provider Tests Complete',
        description: `Tested ${data.totalProviders} providers. ${data.healthyProviders} healthy, ${data.failedProviders} failed.`,
      });
      queryClient.invalidateQueries({ queryKey: ['provider-health'] });
    },
    onError: () => {
      toast({
        title: 'Test Failed',
        description: 'Failed to test providers. Please try again.',
        variant: 'destructive',
      });
    },
    onSettled: () => setTestInProgress(false),
  });

  const exportData = useMutation({
    mutationFn: (type: string) => apiRequest(`/api/analytics/export/${type}`, { method: 'GET' }),
    onSuccess: (data, type) => {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `provider-${type}-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Export Complete',
        description: `${type} data has been exported successfully.`,
      });
    },
  });

  return (
    <div className="space-y-6" data-testid="container-admin-tools">
      <h2 className="text-2xl font-bold" data-testid="heading-admin-tools">Admin Tools</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bulk Testing */}
        <Card data-testid="card-bulk-testing">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Bulk Provider Testing
            </CardTitle>
            <CardDescription>Test all providers simultaneously for health and performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button
                className="w-full"
                onClick={() => testAllProviders.mutate()}
                disabled={testInProgress}
                data-testid="button-test-all-providers"
              >
                {testInProgress ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Testing All Providers...
                  </>
                ) : (
                  <>
                    <Activity className="h-4 w-4 mr-2" />
                    Test All Providers
                  </>
                )}
              </Button>
              
              <div className="text-sm text-muted-foreground">
                <p>This will:</p>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li>Test API connectivity for all providers</li>
                  <li>Measure response times</li>
                  <li>Validate API keys and configurations</li>
                  <li>Update health status indicators</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Export */}
        <Card data-testid="card-data-export">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Download className="h-5 w-5 mr-2" />
              Data Export
            </CardTitle>
            <CardDescription>Export analytics and performance data for external analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => exportData.mutate('usage')}
                data-testid="button-export-usage"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Export Usage Analytics
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => exportData.mutate('performance')}
                data-testid="button-export-performance"
              >
                <Gauge className="h-4 w-4 mr-2" />
                Export Performance Metrics
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => exportData.mutate('feedback')}
                data-testid="button-export-feedback"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Export User Feedback
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => exportData.mutate('all')}
                data-testid="button-export-all"
              >
                <Download className="h-4 w-4 mr-2" />
                Export All Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuration Management */}
      <Card data-testid="card-config-management">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Configuration Management
          </CardTitle>
          <CardDescription>Advanced provider and routing configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Current Routing Strategy</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Primary Provider:</span>
                  <Badge>OpenAI</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Fallback Order:</span>
                  <span>Claude → Gemini → xAI</span>
                </div>
                <div className="flex justify-between">
                  <span>Timeout:</span>
                  <span>30s</span>
                </div>
                <div className="flex justify-between">
                  <span>Retry Attempts:</span>
                  <span>3</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Quick Actions</h4>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh All Configurations
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  <Eye className="h-4 w-4 mr-2" />
                  View System Logs
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Check System Health
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Main Dashboard Component
export default function ProviderHealthDashboard() {
  return (
    <div className="min-h-screen bg-background" data-testid="page-provider-health-dashboard">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4" data-testid="heading-dashboard-title">
            Provider Health Dashboard
          </h1>
          <p className="text-lg text-muted-foreground" data-testid="text-dashboard-description">
            Real-time monitoring, usage analytics, and performance optimization for all AI providers
          </p>
        </div>

        <Tabs defaultValue="health" className="space-y-6" data-testid="tabs-dashboard">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="health" data-testid="tab-health">Health Status</TabsTrigger>
            <TabsTrigger value="analytics" data-testid="tab-analytics">Usage Analytics</TabsTrigger>
            <TabsTrigger value="performance" data-testid="tab-performance">Performance</TabsTrigger>
            <TabsTrigger value="recommendations" data-testid="tab-recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="admin" data-testid="tab-admin">Admin Tools</TabsTrigger>
          </TabsList>

          <TabsContent value="health">
            <ProviderHealthMonitor />
          </TabsContent>

          <TabsContent value="analytics">
            <UsageAnalytics />
          </TabsContent>

          <TabsContent value="performance">
            <PerformanceMetrics />
          </TabsContent>

          <TabsContent value="recommendations">
            <IntelligentRecommendations />
          </TabsContent>

          <TabsContent value="admin">
            <AdminTools />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}