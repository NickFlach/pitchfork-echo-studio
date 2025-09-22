import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TierBadge } from "@/components/ui/tier-badge";
import { FeatureComparison } from "@/components/ui/feature-comparison";
import { TierUpgradeModal } from "@/components/ui/tier-upgrade-modal";
import { UpgradePromptModal } from "@/components/ui/upgrade-prompt";
import { useTier } from "@/contexts/TierContext";
import { 
  Crown, 
  Users, 
  Target, 
  TrendingUp, 
  Shield, 
  Lightbulb,
  MapPin,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Network,
  Zap,
  Brain,
  Eye,
  Settings,
  Plus,
  Edit,
  Trash2,
  Play,
  Pause,
  RefreshCw,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  Info,
  Loader2,
  Building,
  UserCheck,
  Award,
  Compass,
  Workflow,
  PieChart,
  Activity,
  GitBranch,
  Layers,
  Database,
  FileText,
  Search,
  Filter,
  Download
} from 'lucide-react';
import { consciousnessApi } from '@/lib/consciousnessApi';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { apiRequest, queryClient } from '@/lib/queryClient';
import type { InsertAIUsageAnalytics, InsertAIUserFeedback, MaskedAICredentials } from '../../shared/schema';

// Enterprise feature components
interface ExecutiveProfile {
  id: string;
  name: string;
  role: string;
  level: string;
  assessmentStatus: 'not-started' | 'in-progress' | 'completed';
  developmentProgress: number;
  lastAssessment: string;
  nextReview: string;
}

interface StrategicInitiative {
  id: string;
  name: string;
  category: string;
  status: 'planning' | 'active' | 'completed' | 'on-hold';
  progress: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  deadline: string;
  riskScore: number;
}

interface TeamAssessment {
  id: string;
  teamName: string;
  size: number;
  consciousnessScore: number;
  collaborationIndex: number;
  communicationEffectiveness: number;
  lastAssessment: string;
  improvements: string[];
}

const EnterpriseLeadership = () => {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState('overview');
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  // Tier System Integration
  const {
    currentTier,
    isAIConfigured,
    loadingAIConfig,
    configuredProviders,
    canAccessFeature,
    canAccessAIFeature,
    getFeatureDetails,
    triggerUpgradePrompt,
    dismissUpgradePrompt,
    currentUpgradePrompt,
    trackFeatureUsage,
    trackUpgradeConversion,
    getFeaturesByCategory
  } = useTier();

  // State management
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedbackRatings, setFeedbackRatings] = useState<Record<string, 'up' | 'down' | null>>({});
  const [feedbackLoading, setFeedbackLoading] = useState<Record<string, boolean>>({});
  const [latestAIResponseMetadata, setLatestAIResponseMetadata] = useState<{
    [requestId: string]: {
      provider: string;
      model: string;
      timestamp: number;
      featureType: string;
    }
  }>({});

  // Modal state
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeFeatureId, setUpgradeFeatureId] = useState<string | null>(null);

  // Organization context for Fortune 500 enterprise deployment
  const [organizationId] = useState('org-fortune500-demo');

  // Real API data integration with React Query
  const {
    data: executiveAssessments = [],
    isLoading: loadingExecutives,
    error: executivesError,
    refetch: refetchExecutives
  } = useQuery({
    queryKey: ['/api/enterprise/executive-assessments', organizationId],
    queryFn: () => consciousnessApi.getExecutiveAssessments(organizationId),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const {
    data: strategicPlans = [],
    isLoading: loadingStrategic,
    error: strategicError,
    refetch: refetchStrategic
  } = useQuery({
    queryKey: ['/api/enterprise/strategic-plans', organizationId],
    queryFn: () => consciousnessApi.getStrategicPlans(organizationId),
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: teamConsciousnessAssessments = [],
    isLoading: loadingTeams,
    error: teamsError,
    refetch: refetchTeams
  } = useQuery({
    queryKey: ['/api/enterprise/team-assessments', organizationId],
    queryFn: () => consciousnessApi.getTeamConsciousnessAssessments(organizationId),
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: leadershipDevelopmentData = [],
    isLoading: loadingDevelopment,
    error: developmentError,
    refetch: refetchDevelopment
  } = useQuery({
    queryKey: ['/api/enterprise/leadership-development', organizationId],
    queryFn: () => consciousnessApi.getLeadershipDevelopmentTrackings(organizationId),
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: enterpriseAnalytics = [],
    isLoading: loadingAnalytics,
    error: analyticsError,
    refetch: refetchAnalytics
  } = useQuery({
    queryKey: ['/api/enterprise/analytics', organizationId],
    queryFn: () => consciousnessApi.getEnterpriseAnalytics(organizationId),
    staleTime: 5 * 60 * 1000,
  });

  // Dashboard overview data
  const {
    data: enterpriseOverview,
    isLoading: loadingOverview,
    error: overviewError
  } = useQuery({
    queryKey: ['/api/enterprise/overview', organizationId],
    queryFn: () => consciousnessApi.getEnterpriseOverview(organizationId),
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });

  // Mutations for CRUD operations
  const createExecutiveAssessmentMutation = useMutation({
    mutationFn: consciousnessApi.createExecutiveAssessment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/enterprise/executive-assessments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/enterprise/overview'] });
      toast({ title: "Executive assessment created successfully", variant: "default" });
    },
    onError: (error) => {
      toast({ 
        title: "Failed to create executive assessment", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const updateExecutiveAssessmentMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => 
      consciousnessApi.updateExecutiveAssessment(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/enterprise/executive-assessments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/enterprise/overview'] });
      toast({ title: "Executive assessment updated successfully", variant: "default" });
    },
    onError: (error) => {
      toast({ 
        title: "Failed to update executive assessment", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const createStrategicPlanMutation = useMutation({
    mutationFn: consciousnessApi.createStrategicPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/enterprise/strategic-plans'] });
      queryClient.invalidateQueries({ queryKey: ['/api/enterprise/overview'] });
      toast({ title: "Strategic plan created successfully", variant: "default" });
    },
    onError: (error) => {
      toast({ 
        title: "Failed to create strategic plan", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const updateStrategicPlanMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => 
      consciousnessApi.updateStrategicPlan(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/enterprise/strategic-plans'] });
      queryClient.invalidateQueries({ queryKey: ['/api/enterprise/overview'] });
      toast({ title: "Strategic plan updated successfully", variant: "default" });
    },
    onError: (error) => {
      toast({ 
        title: "Failed to update strategic plan", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const createTeamAssessmentMutation = useMutation({
    mutationFn: consciousnessApi.createTeamConsciousnessAssessment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/enterprise/team-assessments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/enterprise/overview'] });
      toast({ title: "Team assessment created successfully", variant: "default" });
    },
    onError: (error) => {
      toast({ 
        title: "Failed to create team assessment", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const updateTeamAssessmentMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => 
      consciousnessApi.updateTeamConsciousnessAssessment(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/enterprise/team-assessments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/enterprise/overview'] });
      toast({ title: "Team assessment updated successfully", variant: "default" });
    },
    onError: (error) => {
      toast({ 
        title: "Failed to update team assessment", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  // Loading states for the dashboard
  const isLoadingData = loadingExecutives || loadingStrategic || loadingTeams || loadingDevelopment || loadingAnalytics || loadingOverview;
  const hasErrors = executivesError || strategicError || teamsError || developmentError || analyticsError || overviewError;

  // Helper functions
  const getTierBadgeForFeature = (featureId: string, tooltip?: string) => (
    <TierBadge
      tier={currentTier}
      feature={featureId}
      variant={isAIConfigured ? 'enhanced' : 'default'}
      tooltip={tooltip}
      size="sm"
    />
  );

  const getDefaultModelForProvider = (provider: string): string => {
    const providerModels: Record<string, string> = {
      'openai': 'gpt-4',
      'claude': 'claude-3-sonnet-20240229',
      'gemini': 'gemini-pro',
      'xai': 'grok-beta',
      'litellm': 'gpt-4'
    };
    return providerModels[provider] || 'gpt-4';
  };

  // Usage analytics tracking
  const trackUsage = async (featureType: string, aiProvider?: string, startTime?: number, requestId?: string, providerMetadata?: any) => {
    try {
      const responseTime = startTime ? Date.now() - startTime : 0;
      const actualProvider = aiProvider || configuredProviders[0] || 'openai';
      const actualModel = providerMetadata?.model || getDefaultModelForProvider(actualProvider);
      
      if (requestId) {
        setLatestAIResponseMetadata(prev => ({
          ...prev,
          [requestId]: {
            provider: actualProvider,
            model: actualModel,
            timestamp: Date.now(),
            featureType
          }
        }));
      }
      
      const usageData: InsertAIUsageAnalytics = {
        sessionId,
        featureType: featureType as any,
        aiProvider: actualProvider as any,
        modelUsed: actualModel,
        requestType: 'standard',
        promptTokens: providerMetadata?.promptTokens || 0,
        completionTokens: providerMetadata?.completionTokens || 0,
        totalTokens: providerMetadata?.totalTokens || 0,
        responseTimeMs: responseTime,
        success: true,
        userContext: {
          decisionComplexity: 'complex',
          urgencyLevel: 'medium',
        },
      };

      await apiRequest('/api/analytics/usage', {
        method: 'POST',
        body: JSON.stringify(usageData),
      });
    } catch (error) {
      console.warn('Failed to track usage analytics:', error);
    }
  };

  // Feedback handler
  const handleFeedback = async (itemId: string, rating: 'up' | 'down', featureType: string) => {
    setFeedbackRatings(prev => ({ ...prev, [itemId]: rating }));
    setFeedbackLoading(prev => ({ ...prev, [itemId]: true }));
    
    try {
      const responseMetadata = latestAIResponseMetadata[itemId];
      const aiProvider = responseMetadata?.provider || configuredProviders[0] || 'openai';
      const modelUsed = responseMetadata?.model || getDefaultModelForProvider(aiProvider);
      
      const feedbackData: InsertAIUserFeedback = {
        sessionId,
        featureType: featureType as any,
        aiProvider: aiProvider as any,
        modelUsed: modelUsed,
        requestId: itemId,
        qualityRating: rating === 'up' ? 'thumbs_up' : 'thumbs_down',
        feedback: {
          helpful: rating === 'up',
          relevant: rating === 'up',
          actionable: rating === 'up',
        },
      };

      await apiRequest('/api/analytics/user-feedback', {
        method: 'POST',
        body: JSON.stringify(feedbackData),
      });

      queryClient.invalidateQueries({ queryKey: ['/api/analytics/user-feedback'] });
      
      toast({
        title: rating === 'up' ? 'Positive Feedback Recorded' : 'Feedback Recorded',
        description: 'Thanks for helping us improve AI responses!',
      });
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      toast({
        title: 'Feedback Error',
        description: 'Failed to record feedback. Please try again.',
        variant: 'destructive',
      });
      setFeedbackRatings(prev => ({ ...prev, [itemId]: null }));
    } finally {
      setFeedbackLoading(prev => ({ ...prev, [itemId]: false }));
    }
  };

  // Feature access helpers
  const handleFeatureAccess = (featureId: string) => {
    if (!canAccessAIFeature(featureId)) {
      triggerUpgradePrompt(featureId, 'high_intent');
      toast({
        title: "AI Configuration Required",
        description: "Configure AI to unlock enhanced enterprise leadership tools",
        variant: "default",
      });
      return false;
    }
    return true;
  };

  // Upgrade handlers
  const handleUpgradeFromFeature = (featureId: string) => {
    setUpgradeFeatureId(featureId);
    setShowUpgradeModal(true);
    trackFeatureUsage(`upgrade_modal_${featureId}`, 'leadership');
  };

  const handleUpgradeConversion = () => {
    if (upgradeFeatureId) {
      trackUpgradeConversion(upgradeFeatureId, true);
    }
    setShowUpgradeModal(false);
    setUpgradeFeatureId(null);
  };

  // Component helpers
  const FeedbackButtons = ({ itemId, type }: { itemId: string; type: string }) => (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleFeedback(itemId, 'up', type)}
        disabled={feedbackLoading[itemId]}
        className={`h-8 w-8 p-0 ${feedbackRatings[itemId] === 'up' ? 'text-green-600 bg-green-50' : ''}`}
        data-testid={`button-feedback-up-${itemId}`}
      >
        {feedbackLoading[itemId] ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <ThumbsUp className="w-4 h-4" />
        )}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleFeedback(itemId, 'down', type)}
        disabled={feedbackLoading[itemId]}
        className={`h-8 w-8 p-0 ${feedbackRatings[itemId] === 'down' ? 'text-red-600 bg-red-50' : ''}`}
        data-testid={`button-feedback-down-${itemId}`}
      >
        {feedbackLoading[itemId] ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <ThumbsDown className="w-4 h-4" />
        )}
      </Button>
    </div>
  );

  const TierUpgradePrompt = ({ featureId, featureName }: { featureId: string; featureName: string }) => {
    const featureDetails = getFeatureDetails(featureId);
    
    if (!featureDetails || isAIConfigured) return null;
    
    return (
      <Alert className="mt-4 border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50 dark:border-purple-800 dark:from-purple-950/20 dark:to-blue-950/20">
        <Sparkles className="w-4 h-4 text-purple-600" />
        <AlertDescription className="flex items-center justify-between">
          <div>
            <span className="font-medium">Unlock AI-Enhanced {featureName}</span>
            <p className="text-sm mt-1 text-muted-foreground">{featureDetails.upgradePrompt}</p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              trackFeatureUsage(`upgrade_prompt_${featureId}`, featureDetails.category);
              triggerUpgradePrompt(featureId, 'usage');
            }}
            className="ml-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
            data-testid={`button-upgrade-${featureId}`}
          >
            <Sparkles className="w-3 h-3 mr-1" />
            Upgrade
          </Button>
        </AlertDescription>
      </Alert>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 to-blue-900/20" data-testid="page-enterprise-leadership">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full">
              <Building className="w-8 h-8 text-gradient-cosmic" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gradient-cosmic">
                Enterprise Leadership Tools
              </h1>
              <p className="text-lg text-muted-foreground max-w-4xl">
                Fortune 500-grade AI-powered leadership development ecosystem with executive coaching, strategic planning, team consciousness, and enterprise analytics.
              </p>
            </div>
          </div>
          
          {/* Feature Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
            {['executive_coaching', 'strategic_planning', 'team_consciousness', 'leadership_development', 'enterprise_analytics'].map((featureId) => {
              const feature = getFeatureDetails(featureId);
              return (
                <Card key={featureId} className="border-2 border-purple-200/50 dark:border-purple-800/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-medium truncate">{feature?.name}</div>
                      {getTierBadgeForFeature(featureId)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {isAIConfigured ? 'AI Enhanced' : 'Standard'}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-8">
            <TabsTrigger value="overview" className="flex items-center gap-2" data-testid="tab-overview">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="coaching" className="flex items-center gap-2" data-testid="tab-coaching">
              <UserCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Coaching</span>
            </TabsTrigger>
            <TabsTrigger value="strategic" className="flex items-center gap-2" data-testid="tab-strategic">
              <Compass className="w-4 h-4" />
              <span className="hidden sm:inline">Strategic</span>
            </TabsTrigger>
            <TabsTrigger value="teams" className="flex items-center gap-2" data-testid="tab-teams">
              <Network className="w-4 h-4" />
              <span className="hidden sm:inline">Teams</span>
            </TabsTrigger>
            <TabsTrigger value="development" className="flex items-center gap-2" data-testid="tab-development">
              <Award className="w-4 h-4" />
              <span className="hidden sm:inline">Development</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2" data-testid="tab-analytics">
              <PieChart className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Enterprise Metrics Summary */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Enterprise Leadership Metrics
                    {getTierBadgeForFeature('enterprise_analytics')}
                  </CardTitle>
                  <CardDescription>
                    Real-time leadership effectiveness and organizational health indicators
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-500">92%</div>
                      <div className="text-sm text-muted-foreground">Leadership Effectiveness</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-500">87%</div>
                      <div className="text-sm text-muted-foreground">Team Engagement</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-500">78%</div>
                      <div className="text-sm text-muted-foreground">Strategic Alignment</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-500">4.2x</div>
                      <div className="text-sm text-muted-foreground">ROI Development</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => {
                      if (handleFeatureAccess('executive_coaching')) {
                        setSelectedTab('coaching');
                        trackFeatureUsage('executive_coaching', 'leadership');
                      }
                    }}
                    data-testid="button-start-assessment"
                  >
                    <UserCheck className="w-4 h-4 mr-2" />
                    Start Executive Assessment
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => {
                      if (handleFeatureAccess('strategic_planning')) {
                        setSelectedTab('strategic');
                        trackFeatureUsage('strategic_planning', 'leadership');
                      }
                    }}
                    data-testid="button-create-plan"
                  >
                    <Compass className="w-4 h-4 mr-2" />
                    Create Strategic Plan
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => {
                      if (handleFeatureAccess('team_consciousness')) {
                        setSelectedTab('teams');
                        trackFeatureUsage('team_consciousness', 'leadership');
                      }
                    }}
                    data-testid="button-assess-team"
                  >
                    <Network className="w-4 h-4 mr-2" />
                    Assess Team Dynamics
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => {
                      if (handleFeatureAccess('enterprise_analytics')) {
                        setSelectedTab('analytics');
                        trackFeatureUsage('enterprise_analytics', 'leadership');
                      }
                    }}
                    data-testid="button-view-analytics"
                  >
                    <PieChart className="w-4 h-4 mr-2" />
                    View Analytics Dashboard
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Active Executive Profiles */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5" />
                  Executive Leadership Profiles
                  {getTierBadgeForFeature('executive_coaching')}
                </CardTitle>
                <CardDescription>
                  Current assessment status and development progress for senior executives
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {executiveProfiles.map((profile) => (
                    <div key={profile.id} className="p-4 border rounded-lg bg-muted/20">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{profile.name}</h4>
                          <p className="text-sm text-muted-foreground">{profile.role}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={profile.assessmentStatus === 'completed' ? 'default' : 'secondary'}>
                            {profile.assessmentStatus}
                          </Badge>
                          {isAIConfigured && <FeedbackButtons itemId={profile.id} type="executive-assessment" />}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Development Progress</span>
                          <span>{profile.developmentProgress}%</span>
                        </div>
                        <Progress value={profile.developmentProgress} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Last: {profile.lastAssessment}</span>
                          <span>Next: {profile.nextReview}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {!isAIConfigured && <TierUpgradePrompt featureId="executive_coaching" featureName="Executive Coaching" />}
              </CardContent>
            </Card>

            {/* Strategic Initiatives Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Strategic Initiatives
                  {getTierBadgeForFeature('strategic_planning')}
                </CardTitle>
                <CardDescription>
                  Current strategic initiatives with AI-powered progress tracking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {strategicInitiatives.map((initiative) => (
                    <div key={initiative.id} className="p-4 border rounded-lg bg-muted/20">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{initiative.name}</h4>
                          <p className="text-sm text-muted-foreground capitalize">{initiative.category}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={initiative.status === 'active' ? 'default' : 'secondary'}>
                            {initiative.status}
                          </Badge>
                          <Badge variant={initiative.priority === 'critical' ? 'destructive' : 'outline'}>
                            {initiative.priority}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{initiative.progress}%</span>
                        </div>
                        <Progress value={initiative.progress} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Risk Score: {(initiative.riskScore * 100).toFixed(0)}%</span>
                          <span>Due: {initiative.deadline}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {!isAIConfigured && <TierUpgradePrompt featureId="strategic_planning" featureName="Strategic Planning" />}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Executive Coaching Tab - Placeholder for detailed implementation */}
          <TabsContent value="coaching" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5" />
                  Executive Coaching Workflows
                  {getTierBadgeForFeature('executive_coaching')}
                </CardTitle>
                <CardDescription>
                  Comprehensive 360-degree assessments and AI-powered development pathways
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="max-w-md mx-auto">
                    <UserCheck className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">Executive Coaching Framework</h3>
                    <p className="text-muted-foreground mb-6">
                      Advanced executive assessment and coaching tools are being built. This will include 360-degree feedback, leadership style analysis, and AI-powered development recommendations.
                    </p>
                    <Button onClick={() => trackFeatureUsage('executive_coaching', 'leadership')} data-testid="button-coming-soon-coaching">
                      Coming Soon - Executive Coaching
                    </Button>
                  </div>
                </div>
                {!isAIConfigured && <TierUpgradePrompt featureId="executive_coaching" featureName="Executive Coaching" />}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Strategic Planning Tab - Placeholder for detailed implementation */}
          <TabsContent value="strategic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Compass className="w-5 h-5" />
                  Strategic Planning Templates
                  {getTierBadgeForFeature('strategic_planning')}
                </CardTitle>
                <CardDescription>
                  AI-powered scenario analysis and stakeholder intelligence for strategic planning
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="max-w-md mx-auto">
                    <Compass className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">Strategic Planning Framework</h3>
                    <p className="text-muted-foreground mb-6">
                      Comprehensive strategic planning tools with AI scenario modeling, stakeholder analysis, and risk assessment frameworks are being developed.
                    </p>
                    <Button onClick={() => trackFeatureUsage('strategic_planning', 'leadership')} data-testid="button-coming-soon-strategic">
                      Coming Soon - Strategic Planning
                    </Button>
                  </div>
                </div>
                {!isAIConfigured && <TierUpgradePrompt featureId="strategic_planning" featureName="Strategic Planning" />}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Consciousness Tab */}
          <TabsContent value="teams" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="w-5 h-5" />
                  Team Consciousness Features
                  {getTierBadgeForFeature('team_consciousness')}
                </CardTitle>
                <CardDescription>
                  Advanced team dynamics assessment and collective intelligence optimization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {teamAssessments.map((team) => (
                    <div key={team.id} className="p-4 border rounded-lg bg-muted/20">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-semibold">{team.teamName}</h4>
                          <p className="text-sm text-muted-foreground">{team.size} members</p>
                        </div>
                        {isAIConfigured && <FeedbackButtons itemId={team.id} type="team-consciousness" />}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <div className="text-sm text-muted-foreground">Consciousness Score</div>
                          <div className="text-lg font-semibold">{(team.consciousnessScore * 100).toFixed(0)}%</div>
                          <Progress value={team.consciousnessScore * 100} className="h-2" />
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Collaboration Index</div>
                          <div className="text-lg font-semibold">{(team.collaborationIndex * 100).toFixed(0)}%</div>
                          <Progress value={team.collaborationIndex * 100} className="h-2" />
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Communication</div>
                          <div className="text-lg font-semibold">{(team.communicationEffectiveness * 100).toFixed(0)}%</div>
                          <Progress value={team.communicationEffectiveness * 100} className="h-2" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm font-medium">Recent Improvements:</div>
                        <div className="flex flex-wrap gap-2">
                          {team.improvements.map((improvement, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {improvement}
                            </Badge>
                          ))}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Last Assessment: {team.lastAssessment}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {!isAIConfigured && <TierUpgradePrompt featureId="team_consciousness" featureName="Team Consciousness" />}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leadership Development Tab - Placeholder for detailed implementation */}
          <TabsContent value="development" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Leadership Development Framework
                  {getTierBadgeForFeature('leadership_development')}
                </CardTitle>
                <CardDescription>
                  Competency mapping, succession planning, and AI-guided development pathways
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="max-w-md mx-auto">
                    <Award className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">Leadership Development System</h3>
                    <p className="text-muted-foreground mb-6">
                      Comprehensive leadership development tracking with competency mapping, succession planning, and AI-powered growth pathways is being built.
                    </p>
                    <Button onClick={() => trackFeatureUsage('leadership_development', 'leadership')} data-testid="button-coming-soon-development">
                      Coming Soon - Development Framework
                    </Button>
                  </div>
                </div>
                {!isAIConfigured && <TierUpgradePrompt featureId="leadership_development" featureName="Leadership Development" />}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Enterprise Analytics Tab - Placeholder for detailed implementation */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Enterprise Analytics & Insights
                  {getTierBadgeForFeature('enterprise_analytics')}
                </CardTitle>
                <CardDescription>
                  Comprehensive leadership effectiveness and organizational health dashboards
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="max-w-md mx-auto">
                    <PieChart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">Enterprise Analytics Dashboard</h3>
                    <p className="text-muted-foreground mb-6">
                      Advanced analytics with leadership effectiveness scoring, organizational health metrics, and predictive insights are being developed.
                    </p>
                    <Button onClick={() => trackFeatureUsage('enterprise_analytics', 'leadership')} data-testid="button-coming-soon-analytics">
                      Coming Soon - Analytics Dashboard
                    </Button>
                  </div>
                </div>
                {!isAIConfigured && <TierUpgradePrompt featureId="enterprise_analytics" featureName="Enterprise Analytics" />}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Upgrade Modal */}
        {showUpgradeModal && upgradeFeatureId && (
          <TierUpgradeModal
            isOpen={showUpgradeModal}
            onClose={() => setShowUpgradeModal(false)}
            featureId={upgradeFeatureId}
            onUpgrade={handleUpgradeConversion}
          />
        )}

        {/* Upgrade Prompt Modal */}
        {currentUpgradePrompt && (
          <UpgradePromptModal
            prompt={currentUpgradePrompt}
            onDismiss={dismissUpgradePrompt}
            onUpgrade={() => {
              window.location.href = '/ai-settings';
              dismissUpgradePrompt();
            }}
          />
        )}
      </div>
    </div>
  );
};

export default EnterpriseLeadership;