import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  BarChart3, 
  TrendingUp, 
  Brain, 
  Target, 
  Zap,
  Calendar,
  Clock,
  Users,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Minus,
  Eye,
  Lightbulb,
  Activity
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { consciousnessApi } from '@/lib/consciousnessApi';
import { useGameification } from '@/hooks/useGameification';

interface ConsciousnessMetrics {
  date: string;
  consciousnessScore: number;
  awarenessLevel: number;
  decisionQuality: number;
  patternRecognition: number;
  emotionalBalance: number;
  sessionDuration: number;
  insightGeneration: number;
}

interface PatternInsight {
  id: string;
  pattern: string;
  confidence: number;
  frequency: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  trend: 'improving' | 'stable' | 'declining';
  recommendation: string;
  tags: string[];
}

interface PredictiveInsight {
  type: 'opportunity' | 'risk' | 'breakthrough' | 'plateau';
  title: string;
  description: string;
  probability: number;
  timeframe: 'immediate' | 'short-term' | 'medium-term' | 'long-term';
  suggestedActions: string[];
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff00ff'];

export function AdvancedAnalyticsDashboard() {
  const { userStats, activities } = useGameification();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<string>('consciousnessScore');

  // Fetch consciousness data for analytics
  const { data: consciousnessHistory } = useQuery({
    queryKey: ['consciousness-analytics', timeRange],
    queryFn: () => consciousnessApi.getConsciousnessStates('current-user'),
    refetchInterval: 60000,
  });

  const { data: decisionHistory } = useQuery({
    queryKey: ['decision-analytics', timeRange],
    queryFn: () => consciousnessApi.getDecisionRecords('current-user'),
  });

  const { data: reflectionHistory } = useQuery({
    queryKey: ['reflection-analytics', timeRange],
    queryFn: () => consciousnessApi.getReflectionLogs('current-user'),
  });

  // Generate synthetic analytics data (would come from AI analysis in production)
  const consciousnessMetrics: ConsciousnessMetrics[] = useMemo(() => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
    const data: ConsciousnessMetrics[] = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Generate realistic data with trends and variations
      const baseScore = userStats.consciousnessScore + (Math.random() - 0.5) * 20;
      const trend = i < days / 2 ? 1.1 : 0.9; // Improvement trend in recent data
      
      data.push({
        date: date.toISOString().split('T')[0],
        consciousnessScore: Math.max(0, Math.min(100, baseScore * trend)),
        awarenessLevel: Math.max(0, Math.min(100, (baseScore - 5) * trend)),
        decisionQuality: Math.max(0, Math.min(100, (baseScore + 5) * trend)),
        patternRecognition: Math.max(0, Math.min(100, (baseScore - 10) * trend)),
        emotionalBalance: Math.max(0, Math.min(100, (baseScore + 3) * trend)),
        sessionDuration: Math.max(5, Math.min(120, 30 + (Math.random() - 0.5) * 20)),
        insightGeneration: Math.max(0, Math.min(10, 3 + (Math.random() - 0.5) * 4)),
      });
    }
    
    return data;
  }, [timeRange, userStats.consciousnessScore]);

  // Pattern recognition insights
  const patternInsights: PatternInsight[] = useMemo(() => [
    {
      id: 'decision-speed',
      pattern: 'Decision Making Speed',
      confidence: 0.87,
      frequency: 0.75,
      impact: 'high',
      trend: 'improving',
      recommendation: 'Your decision-making speed has improved 23% this month. Consider tackling more complex decisions.',
      tags: ['decision-making', 'speed', 'improvement'],
    },
    {
      id: 'morning-clarity',
      pattern: 'Morning Consciousness Peak',
      confidence: 0.92,
      frequency: 0.85,
      impact: 'medium',
      trend: 'stable',
      recommendation: 'You consistently show higher awareness in morning sessions. Schedule important decisions before 11 AM.',
      tags: ['circadian-rhythm', 'awareness', 'timing'],
    },
    {
      id: 'reflection-depth',
      pattern: 'Reflection Depth Cycles',
      confidence: 0.79,
      frequency: 0.60,
      impact: 'high',
      trend: 'improving',
      recommendation: 'Your reflection depth follows 7-day cycles. Plan deeper introspection every Tuesday.',
      tags: ['reflection', 'cycles', 'depth'],
    },
    {
      id: 'emotional-resilience',
      pattern: 'Stress Response Adaptation',
      confidence: 0.84,
      frequency: 0.45,
      impact: 'critical',
      trend: 'stable',
      recommendation: 'Your emotional resilience during stress has plateaued. Consider new mindfulness techniques.',
      tags: ['stress', 'resilience', 'adaptation'],
    },
  ], []);

  // Predictive insights
  const predictiveInsights: PredictiveInsight[] = useMemo(() => [
    {
      type: 'breakthrough',
      title: 'Consciousness Breakthrough Expected',
      description: 'Based on your current trajectory, you\'re likely to achieve a significant awareness breakthrough within the next 2 weeks.',
      probability: 0.78,
      timeframe: 'short-term',
      suggestedActions: [
        'Increase meditation frequency to daily',
        'Focus on challenging decision scenarios',
        'Document insights immediately when they arise',
      ],
    },
    {
      type: 'opportunity',
      title: 'Leadership Development Window',
      description: 'Your decision quality scores indicate optimal readiness for advanced leadership challenges.',
      probability: 0.85,
      timeframe: 'immediate',
      suggestedActions: [
        'Take on a complex group decision-making role',
        'Practice facilitating consciousness sessions',
        'Engage with more diverse perspectives',
      ],
    },
    {
      type: 'risk',
      title: 'Engagement Plateau Risk',
      description: 'Current patterns suggest potential disengagement in 3-4 weeks without intervention.',
      probability: 0.34,
      timeframe: 'medium-term',
      suggestedActions: [
        'Introduce new consciousness exploration techniques',
        'Connect with accountability partner',
        'Set challenging but achievable goals',
      ],
    },
  ], []);

  // Radar chart data for consciousness dimensions
  const radarData = [
    { dimension: 'Awareness', current: userStats.consciousnessScore, potential: Math.min(100, userStats.consciousnessScore + 15) },
    { dimension: 'Decision Quality', current: userStats.consciousnessScore - 5, potential: Math.min(100, userStats.consciousnessScore + 10) },
    { dimension: 'Pattern Recognition', current: userStats.consciousnessScore - 10, potential: Math.min(100, userStats.consciousnessScore + 12) },
    { dimension: 'Emotional Balance', current: userStats.consciousnessScore + 3, potential: Math.min(100, userStats.consciousnessScore + 8) },
    { dimension: 'Insight Generation', current: userStats.consciousnessScore - 8, potential: Math.min(100, userStats.consciousnessScore + 18) },
    { dimension: 'System Thinking', current: userStats.consciousnessScore - 3, potential: Math.min(100, userStats.consciousnessScore + 14) },
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <ArrowUp className="w-4 h-4 text-green-500" />;
      case 'declining': return <ArrowDown className="w-4 h-4 text-red-500" />;
      default: return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 0.8) return 'text-green-600';
    if (probability >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Advanced Analytics</h2>
          <p className="text-muted-foreground">
            AI-powered insights into your consciousness development
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="patterns">Pattern Analysis</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="dimensions">Dimensions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Consciousness</CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats.consciousnessScore}%</div>
                <p className="text-xs text-muted-foreground">
                  +12% from last {timeRange}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sessions</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats.totalSessions}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round(userStats.totalSessions / (timeRange === '7d' ? 7 : 30))} per day avg
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats.streak}</div>
                <p className="text-xs text-muted-foreground">
                  days consecutive
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Level Progress</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats.level}</div>
                <Progress 
                  value={((userStats.xp % userStats.xpToNextLevel) / userStats.xpToNextLevel) * 100}
                  className="mt-2"
                />
              </CardContent>
            </Card>
          </div>

          {/* Main Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Consciousness Development Over Time</CardTitle>
              <div className="flex items-center gap-2">
                <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consciousnessScore">Consciousness Score</SelectItem>
                    <SelectItem value="awarenessLevel">Awareness Level</SelectItem>
                    <SelectItem value="decisionQuality">Decision Quality</SelectItem>
                    <SelectItem value="patternRecognition">Pattern Recognition</SelectItem>
                    <SelectItem value="emotionalBalance">Emotional Balance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={consciousnessMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip 
                    labelFormatter={(date) => new Date(date).toLocaleDateString()}
                    formatter={(value: number) => [`${value.toFixed(1)}%`, selectedMetric]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey={selectedMetric} 
                    stroke="#8884d8" 
                    fill="#8884d8" 
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Pattern Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Recognized Patterns
                </CardTitle>
                <CardDescription>
                  AI-identified patterns in your consciousness development
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {patternInsights.map((insight) => (
                      <div key={insight.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h4 className="font-medium">{insight.pattern}</h4>
                            <div className="flex items-center gap-2">
                              {getTrendIcon(insight.trend)}
                              <Badge variant={getImpactColor(insight.impact)}>
                                {insight.impact} impact
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {Math.round(insight.confidence * 100)}% confidence
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground">
                          {insight.recommendation}
                        </p>
                        
                        <div className="flex flex-wrap gap-1">
                          {insight.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Pattern Frequency Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Pattern Frequency Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={patternInsights}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="pattern" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="frequency" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {predictiveInsights.map((insight, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    {insight.type === 'breakthrough' && <Sparkles className="w-4 h-4 text-yellow-500" />}
                    {insight.type === 'opportunity' && <Lightbulb className="w-4 h-4 text-green-500" />}
                    {insight.type === 'risk' && <Eye className="w-4 h-4 text-red-500" />}
                    {insight.type === 'plateau' && <Minus className="w-4 h-4 text-gray-500" />}
                    {insight.title}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {insight.timeframe.replace('-', ' ')}
                    </Badge>
                    <span className={`text-sm font-medium ${getProbabilityColor(insight.probability)}`}>
                      {Math.round(insight.probability * 100)}% likely
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {insight.description}
                  </p>
                  
                  <div className="space-y-2">
                    <h5 className="font-medium text-sm">Suggested Actions:</h5>
                    <ul className="space-y-1">
                      {insight.suggestedActions.map((action, actionIndex) => (
                        <li key={actionIndex} className="text-sm flex items-start gap-2">
                          <span className="w-1 h-1 rounded-full bg-primary mt-2 flex-shrink-0" />
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <Progress value={insight.probability * 100} className="h-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="dimensions" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Consciousness Radar */}
            <Card>
              <CardHeader>
                <CardTitle>Consciousness Dimensions</CardTitle>
                <CardDescription>
                  Current state vs potential across key dimensions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="dimension" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar name="Current" dataKey="current" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                    <Radar name="Potential" dataKey="potential" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.1} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Dimension Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Dimension Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-4">
                    {radarData.map((dim, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{dim.dimension}</span>
                          <span className="text-sm text-muted-foreground">
                            {dim.current}% / {dim.potential}%
                          </span>
                        </div>
                        <Progress value={dim.current} className="h-2" />
                        <div className="text-xs text-muted-foreground">
                          {dim.potential - dim.current} points growth potential
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}