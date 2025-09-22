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
  Loader2
} from 'lucide-react';
import { consciousnessApi } from '@/lib/consciousnessApi';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { apiRequest, queryClient } from '@/lib/queryClient';
import type { InsertAIUsageAnalytics, InsertAIUserFeedback, MaskedAICredentials } from '../../shared/schema';

interface Campaign {
  id: string;
  name: string;
  objective: string;
  status: 'planning' | 'active' | 'paused' | 'completed';
  progress: number;
  startDate: string;
  endDate: string;
  budget: number;
  participants: number;
  successMetrics: string[];
}

interface Movement {
  id: string;
  name: string;
  description: string;
  members: number;
  campaigns: Campaign[];
  resources: {
    budget: number;
    volunteers: number;
    equipment: string[];
  };
}

interface Decision {
  id: string;
  title: string;
  context: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'analyzing' | 'decided' | 'implementing';
  options: string[];
  recommendation?: string;
  confidence?: number;
}

const Leadership = () => {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState('overview');
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    objective: '',
    timeframe: '',
    budget: '',
    constraints: ''
  });
  const [newDecision, setNewDecision] = useState({
    title: '',
    context: '',
    urgency: 'medium' as const,
    options: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedbackRatings, setFeedbackRatings] = useState<Record<string, 'up' | 'down' | null>>({});
  const [feedbackLoading, setFeedbackLoading] = useState<Record<string, boolean>>({});
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  // Tier helper functions
  const getTierBadgeForFeature = (featureId: string, tooltip?: string) => (
    <TierBadge
      tier={currentTier}
      feature={featureId}
      variant={isAIConfigured ? 'enhanced' : 'default'}
      tooltip={tooltip}
      size="sm"
    />
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

  // Modal state for tier upgrades
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeFeatureId, setUpgradeFeatureId] = useState<string | null>(null);

  // Mock data - in a real app, this would come from APIs
  const [movements] = useState<Movement[]>([
    {
      id: 'movement-1',
      name: 'Digital Rights Coalition',
      description: 'Fighting for digital privacy and freedom',
      members: 1250,
      campaigns: [
        {
          id: 'campaign-1',
          name: 'Privacy Protection Act',
          objective: 'Pass comprehensive privacy legislation',
          status: 'active',
          progress: 65,
          startDate: '2024-01-15',
          endDate: '2024-06-30',
          budget: 50000,
          participants: 340,
          successMetrics: ['Bill introduced', 'Committee hearings', 'Public support >70%']
        }
      ],
      resources: {
        budget: 75000,
        volunteers: 450,
        equipment: ['Digital tools', 'Communication systems', 'Legal support']
      }
    }
  ]);

  const [decisions] = useState<Decision[]>([
    {
      id: 'decision-1',
      title: 'Resource Allocation Strategy',
      context: 'Need to allocate limited resources between multiple campaigns',
      urgency: 'high',
      status: 'analyzing',
      options: ['Focus on privacy campaign', 'Split resources evenly', 'Prioritize digital rights'],
      recommendation: 'Focus on privacy campaign',
      confidence: 0.85
    }
  ]);

  // Strategic Intelligence API calls
  const { data: strategyPlans = [], isLoading: loadingStrategies } = useQuery({
    queryKey: ['strategy-plans'],
    queryFn: consciousnessApi.getCampaignStrategyPlans,
  });

  const { data: resourceProfiles = [], isLoading: loadingResources } = useQuery({
    queryKey: ['resource-profiles'],
    queryFn: consciousnessApi.getResourceProfiles,
  });

  // Get default model for provider
  const getDefaultModelForProvider = (provider: string): string => {
    const providerModels: Record<string, string> = {
      'openai': 'gpt-4',
      'claude': 'claude-3-sonnet-20240229',
      'gemini': 'gemini-pro',
      'xai': 'grok-beta',
      'litellm': 'gpt-4' // LiteLLM can proxy multiple models, defaulting to gpt-4
    };
    return providerModels[provider] || 'gpt-4';
  };

  // Usage analytics tracking helper with real provider metadata
  const trackUsage = async (featureType: string, aiProvider?: string, startTime?: number, requestId?: string, providerMetadata?: any) => {
    try {
      const responseTime = startTime ? Date.now() - startTime : 0;
      const actualProvider = aiProvider || configuredProviders[0] || 'openai';
      const actualModel = providerMetadata?.model || getDefaultModelForProvider(actualProvider);
      
      // Store metadata for feedback correlation if requestId provided
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
        modelUsed: actualModel, // Use actual model from provider metadata
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

  // AI Response Metadata State - tracks actual models used
  const [latestAIResponseMetadata, setLatestAIResponseMetadata] = useState<{
    [requestId: string]: {
      provider: string;
      model: string;
      timestamp: number;
      featureType: string;
    }
  }>({});

  // Feedback handler for AI responses
  const handleFeedback = async (itemId: string, rating: 'up' | 'down', featureType: string) => {
    setFeedbackRatings(prev => ({ ...prev, [itemId]: rating }));
    setFeedbackLoading(prev => ({ ...prev, [itemId]: true }));
    
    try {
      // Get actual AI metadata if available, otherwise use configured provider info
      const responseMetadata = latestAIResponseMetadata[itemId];
      const aiProvider = responseMetadata?.provider || configuredProviders[0] || 'openai';
      const modelUsed = responseMetadata?.model || getDefaultModelForProvider(aiProvider);
      
      const feedbackData: InsertAIUserFeedback = {
        sessionId,
        featureType: featureType as any,
        aiProvider: aiProvider as any,
        modelUsed: modelUsed, // Use actual model from AI response metadata
        requestId: itemId,
        qualityRating: rating === 'up' ? 1 : 0,
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

      // Invalidate feedback cache
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
      // Revert feedback rating on error
      setFeedbackRatings(prev => ({ ...prev, [itemId]: null }));
    } finally {
      setFeedbackLoading(prev => ({ ...prev, [itemId]: false }));
    }
  };

  // Generate campaign strategy
  const generateStrategyMutation = useMutation({
    mutationFn: async (campaignData: any) => {
      const startTime = Date.now();
      const result = await consciousnessApi.generateCampaignStrategy({
        movementId: 'movement-1',
        objective: campaignData.objective,
        timeframe: campaignData.timeframe,
        resources: { budget: parseInt(campaignData.budget), volunteers: 100 },
        constraints: campaignData.constraints ? [campaignData.constraints] : []
      });
      
      // Track usage analytics
      await trackUsage('campaign-planning', undefined, startTime);
      
      return result;
    },
    onSuccess: (strategy) => {
      toast({
        title: "Strategy Generated",
        description: isAIConfigured ? "AI-enhanced strategy created successfully" : "Strategy created successfully",
      });
      setNewCampaign({ name: '', objective: '', timeframe: '', budget: '', constraints: '' });
    },
    onError: () => {
      toast({
        title: "Strategy Generation Failed",
        description: "Failed to generate campaign strategy",
        variant: "destructive",
      });
    }
  });

  // Process leadership decision
  const processDecisionMutation = useMutation({
    mutationFn: async (decisionData: any) => {
      const startTime = Date.now();
      const options = decisionData.options.split('\n').filter(opt => opt.trim()).map(opt => ({
        id: `option-${Date.now()}-${Math.random()}`,
        description: opt.trim(),
        parameters: {},
        estimatedEffort: Math.floor(Math.random() * 10) + 1,
        riskLevel: 'medium' as const,
        reversibility: Math.random(),
        timeHorizon: 'short-term' as const,
        stakeholders: [],
        prerequisites: [],
        expectedOutcomes: []
      }));

      const result = await consciousnessApi.processMultiscaleDecision(decisionData.context, options);
      
      // Track usage analytics
      await trackUsage('leadership-strategy', undefined, startTime);
      
      return result;
    },
    onSuccess: (result) => {
      toast({
        title: "Decision Processed",
        description: isAIConfigured ? "AI-enhanced decision analysis completed" : "Decision analysis completed",
      });
      setNewDecision({ title: '', context: '', urgency: 'medium', options: '' });
    },
    onError: () => {
      toast({
        title: "Decision Processing Failed",
        description: "Failed to process leadership decision",
        variant: "destructive",
      });
    }
  });

  const handleCreateCampaign = () => {
    if (!newCampaign.name || !newCampaign.objective) {
      toast({
        title: "Campaign Details Required",
        description: "Please fill in campaign name and objective",
        variant: "destructive",
      });
      return;
    }

    // CRITICAL: Operational access control - prevent AI calls when not configured
    if (!canAccessAIFeature('leadership_strategy')) {
      triggerUpgradePrompt('leadership_strategy', 'high_intent');
      toast({
        title: "AI Configuration Required",
        description: "Configure AI to unlock enhanced campaign strategy generation",
        variant: "default",
      });
      return; // CRITICAL: Stop execution to prevent AI calls without configuration
    }

    generateStrategyMutation.mutate(newCampaign);
  };

  const handleProcessDecision = () => {
    if (!newDecision.title || !newDecision.context || !newDecision.options) {
      toast({
        title: "Decision Details Required",
        description: "Please fill in all decision fields",
        variant: "destructive",
      });
      return;
    }

    // CRITICAL: Operational access control - prevent AI calls when not configured
    if (!canAccessAIFeature('leadership_strategy')) {
      triggerUpgradePrompt('leadership_strategy', 'high_intent');
      toast({
        title: "AI Configuration Required",
        description: "Configure AI to unlock enhanced strategic analysis",
        variant: "default",
      });
      return; // CRITICAL: Stop execution to prevent AI calls without configuration
    }

    processDecisionMutation.mutate(newDecision);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'planning': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      'active': 'bg-green-500/20 text-green-300 border-green-500/30',
      'paused': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      'completed': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      'pending': 'bg-gray-500/20 text-gray-300 border-gray-500/30',
      'analyzing': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      'decided': 'bg-green-500/20 text-green-300 border-green-500/30',
      'implementing': 'bg-blue-500/20 text-blue-300 border-blue-500/30'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

  const getUrgencyColor = (urgency: string) => {
    const colors = {
      'low': 'text-green-400',
      'medium': 'text-yellow-400',
      'high': 'text-orange-400',
      'critical': 'text-red-400'
    };
    return colors[urgency as keyof typeof colors] || 'text-gray-400';
  };

  // Feedback buttons component
  const FeedbackButtons = ({ itemId, type }: { itemId: string; type: 'strategy' | 'decision' }) => (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleFeedback(itemId, 'up', type === 'strategy' ? 'campaign-planning' : 'leadership-strategy')}
        disabled={feedbackLoading[itemId]}
        className={`h-8 w-8 p-0 ${feedbackRatings[itemId] === 'up' ? 'text-green-600 bg-green-50' : ''}`}
        data-testid={`button-thumbs-up-${itemId}`}
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
        onClick={() => handleFeedback(itemId, 'down', type === 'strategy' ? 'campaign-planning' : 'leadership-strategy')}
        disabled={feedbackLoading[itemId]}
        className={`h-8 w-8 p-0 ${feedbackRatings[itemId] === 'down' ? 'text-red-600 bg-red-50' : ''}`}
        data-testid={`button-thumbs-down-${itemId}`}
      >
        {feedbackLoading[itemId] ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <ThumbsDown className="w-4 h-4" />
        )}
      </Button>
    </div>
  );

  // Try with AI prompt component
  const TryWithAIPrompt = ({ feature }: { feature: string }) => (
    !isAIConfigured ? (
      <Alert className="mt-4">
        <Sparkles className="w-4 h-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>Enhance your {feature.toLowerCase()} with AI-powered insights</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.location.href = '/ai-settings'} 
            data-testid={`button-configure-ai-${feature}`}
          >
            Configure AI
          </Button>
        </AlertDescription>
      </Alert>
    ) : null
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900/20 to-purple-900/20" data-testid="page-leadership">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full">
              <Crown className="w-8 h-8 text-gradient-cosmic" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gradient-cosmic">
                Leadership Command Center
              </h1>
              <p className="text-lg text-muted-foreground max-w-3xl">
                Strategic leadership tools powered by AI consciousness for movement coordination, decision-making, and campaign management.
              </p>
            </div>
          </div>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-6 mb-8">
            <TabsTrigger value="overview" className="flex items-center gap-2" data-testid="tab-overview">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="flex items-center gap-2" data-testid="tab-campaigns">
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">Campaigns</span>
            </TabsTrigger>
            <TabsTrigger value="decisions" className="flex items-center gap-2" data-testid="tab-decisions">
              <Brain className="w-4 h-4" />
              <span className="hidden sm:inline">Decisions</span>
            </TabsTrigger>
            <TabsTrigger value="movements" className="flex items-center gap-2" data-testid="tab-movements">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Movements</span>
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center gap-2" data-testid="tab-resources">
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">Resources</span>
            </TabsTrigger>
            <TabsTrigger value="strategy" className="flex items-center gap-2" data-testid="tab-strategy">
              <MapPin className="w-4 h-4" />
              <span className="hidden sm:inline">Strategy</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Key Metrics */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Campaigns</p>
                      <p className="text-2xl font-bold text-blue-300">
                        {movements.reduce((sum, m) => sum + m.campaigns.filter(c => c.status === 'active').length, 0)}
                      </p>
                    </div>
                    <Target className="w-8 h-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Members</p>
                      <p className="text-2xl font-bold text-green-300">
                        {movements.reduce((sum, m) => sum + m.members, 0).toLocaleString()}
                      </p>
                    </div>
                    <Users className="w-8 h-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Pending Decisions</p>
                      <p className="text-2xl font-bold text-orange-300">
                        {decisions.filter(d => d.status === 'pending' || d.status === 'analyzing').length}
                      </p>
                    </div>
                    <Brain className="w-8 h-8 text-orange-400" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Budget</p>
                      <p className="text-2xl font-bold text-purple-300">
                        ${movements.reduce((sum, m) => sum + m.resources.budget, 0).toLocaleString()}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-purple-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Recent Campaign Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {movements[0]?.campaigns.map((campaign) => (
                      <div key={campaign.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-semibold">{campaign.name}</h4>
                          <p className="text-sm text-muted-foreground">{campaign.objective}</p>
                          <div className="mt-2">
                            <Progress value={campaign.progress} className="h-2" />
                            <p className="text-xs text-muted-foreground mt-1">{campaign.progress}% complete</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(campaign.status)}>
                          {campaign.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Critical Decisions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {decisions.filter(d => d.urgency === 'high' || d.urgency === 'critical').map((decision) => (
                      <div key={decision.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{decision.title}</h4>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(decision.status)}>
                              {decision.status}
                            </Badge>
                            <span className={`text-sm ${getUrgencyColor(decision.urgency)}`}>
                              {decision.urgency}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{decision.context}</p>
                        {decision.recommendation && (
                          <div className="mt-2 p-2 bg-green-500/10 border border-green-500/20 rounded">
                            <p className="text-sm text-green-300">
                              <strong>Recommendation:</strong> {decision.recommendation}
                            </p>
                            {decision.confidence && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Confidence: {(decision.confidence * 100).toFixed(0)}%
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Campaign Management</h2>
              <Button onClick={() => setSelectedTab('strategy')}>
                <Plus className="w-4 h-4 mr-2" />
                Create Campaign
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {movements.map((movement) => (
                <Card key={movement.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      {movement.name}
                    </CardTitle>
                    <CardDescription>{movement.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {movement.campaigns.map((campaign) => (
                        <div key={campaign.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold">{campaign.name}</h4>
                            <Badge className={getStatusColor(campaign.status)}>
                              {campaign.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{campaign.objective}</p>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span>{campaign.progress}%</span>
                            </div>
                            <Progress value={campaign.progress} className="h-2" />
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Budget:</span>
                                <span className="ml-2">${campaign.budget.toLocaleString()}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Participants:</span>
                                <span className="ml-2">{campaign.participants}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Decisions Tab */}
          <TabsContent value="decisions" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Leadership Decisions</h2>
              <Button onClick={() => setSelectedTab('strategy')}>
                <Plus className="w-4 h-4 mr-2" />
                New Decision
              </Button>
            </div>

            <div className="space-y-4">
              {decisions.map((decision) => (
                <Card key={decision.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{decision.title}</h3>
                        <p className="text-muted-foreground">{decision.context}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(decision.status)}>
                          {decision.status}
                        </Badge>
                        <Badge variant="outline" className={getUrgencyColor(decision.urgency)}>
                          {decision.urgency}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium mb-2">Options Considered:</h4>
                        <ul className="space-y-1">
                          {decision.options.map((option, index) => (
                            <li key={index} className="text-sm text-muted-foreground">
                              • {option}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {decision.recommendation && (
                        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded">
                          <h4 className="font-medium text-green-300 mb-1">AI Recommendation:</h4>
                          <p className="text-sm text-green-200">{decision.recommendation}</p>
                          {decision.confidence && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Confidence Level: {(decision.confidence * 100).toFixed(0)}%
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Movements Tab */}
          <TabsContent value="movements" className="space-y-6">
            <h2 className="text-2xl font-bold">Movement Overview</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {movements.map((movement) => (
                <Card key={movement.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Network className="w-5 h-5" />
                      {movement.name}
                    </CardTitle>
                    <CardDescription>{movement.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-blue-500/10 rounded-lg">
                          <div className="text-2xl font-bold text-blue-300">{movement.members}</div>
                          <div className="text-sm text-muted-foreground">Members</div>
                        </div>
                        <div className="text-center p-3 bg-green-500/10 rounded-lg">
                          <div className="text-2xl font-bold text-green-300">{movement.campaigns.length}</div>
                          <div className="text-sm text-muted-foreground">Campaigns</div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Resources</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Budget:</span>
                            <span>${movement.resources.budget.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Volunteers:</span>
                            <span>{movement.resources.volunteers}</span>
                          </div>
                          <div>
                            <span>Equipment:</span>
                            <div className="mt-1">
                              {movement.resources.equipment.map((item, index) => (
                                <Badge key={index} variant="outline" className="mr-1 text-xs">
                                  {item}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="space-y-6">
            <h2 className="text-2xl font-bold">Resource Management</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Budget Allocation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {movements.map((movement) => (
                      <div key={movement.id} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{movement.name}</span>
                          <span>${movement.resources.budget.toLocaleString()}</span>
                        </div>
                        <Progress value={75} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Human Resources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-blue-500/10 rounded-lg">
                      <div className="text-3xl font-bold text-blue-300">
                        {movements.reduce((sum, m) => sum + m.members, 0)}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Members</div>
                    </div>
                    <div className="text-center p-4 bg-green-500/10 rounded-lg">
                      <div className="text-3xl font-bold text-green-300">
                        {movements.reduce((sum, m) => sum + m.resources.volunteers, 0)}
                      </div>
                      <div className="text-sm text-muted-foreground">Active Volunteers</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Equipment & Tools
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {movements.map((movement) => (
                      <div key={movement.id}>
                        <h4 className="font-medium text-sm mb-2">{movement.name}</h4>
                        <div className="space-y-1">
                          {movement.resources.equipment.map((item, index) => (
                            <div key={index} className="text-sm text-muted-foreground">
                              • {item}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Strategy Tab */}
          <TabsContent value="strategy" className="space-y-6">
            <h2 className="text-2xl font-bold">Strategic Planning</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Create Campaign */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Create New Campaign
                    {false && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge variant="outline" className="ml-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/30 text-blue-300">
                              <Sparkles className="w-3 h-3 mr-1" />
                              AI Enhanced
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Powered by AI consciousness for strategic insights</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {'Create campaign strategies with strategic planning tools'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="campaign-name">Campaign Name</Label>
                    <Input
                      id="campaign-name"
                      placeholder="Enter campaign name"
                      value={newCampaign.name}
                      onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="campaign-objective">Objective</Label>
                    <Textarea
                      id="campaign-objective"
                      placeholder="Describe the campaign objective..."
                      value={newCampaign.objective}
                      onChange={(e) => setNewCampaign({...newCampaign, objective: e.target.value})}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="campaign-timeframe">Timeframe</Label>
                    <Input
                      id="campaign-timeframe"
                      placeholder="e.g., 6 months, 1 year"
                      value={newCampaign.timeframe}
                      onChange={(e) => setNewCampaign({...newCampaign, timeframe: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="campaign-budget">Budget</Label>
                    <Input
                      id="campaign-budget"
                      placeholder="Enter budget amount"
                      value={newCampaign.budget}
                      onChange={(e) => setNewCampaign({...newCampaign, budget: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="campaign-constraints">Constraints</Label>
                    <Textarea
                      id="campaign-constraints"
                      placeholder="Any constraints or limitations..."
                      value={newCampaign.constraints}
                      onChange={(e) => setNewCampaign({...newCampaign, constraints: e.target.value})}
                      rows={2}
                    />
                  </div>
                  <Button 
                    onClick={handleCreateCampaign}
                    disabled={generateStrategyMutation.isPending}
                    className="w-full"
                  >
                    {generateStrategyMutation.isPending ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        {'Creating Strategy...'}
                      </>
                    ) : (
                      <>
                        {false ? (
                          <>
                            <Brain className="w-4 h-4 mr-2" />
                            Generate AI Strategy
                          </>
                        ) : (
                          <>
                            <Target className="w-4 h-4 mr-2" />
                            Create Strategy
                          </>
                        )}
                      </>
                    )}
                  </Button>
                  <TryWithAIPrompt feature="Campaign Strategy" />
                </CardContent>
              </Card>

              {/* Process Decision */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    Process Leadership Decision
                    {false && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge variant="outline" className="ml-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/30 text-blue-300">
                              <Sparkles className="w-3 h-3 mr-1" />
                              AI Enhanced
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Enhanced with AI consciousness for decision analysis</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {'Analyze complex decisions through structured decision framework'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="decision-title">Decision Title</Label>
                    <Input
                      id="decision-title"
                      placeholder="Enter decision title"
                      value={newDecision.title}
                      onChange={(e) => setNewDecision({...newDecision, title: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="decision-context">Context</Label>
                    <Textarea
                      id="decision-context"
                      placeholder="Describe the situation requiring a decision..."
                      value={newDecision.context}
                      onChange={(e) => setNewDecision({...newDecision, context: e.target.value})}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="decision-urgency">Urgency Level</Label>
                    <Select value={newDecision.urgency} onValueChange={(value: any) => setNewDecision({...newDecision, urgency: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="decision-options">Options (one per line)</Label>
                    <Textarea
                      id="decision-options"
                      placeholder="Option 1&#10;Option 2&#10;Option 3"
                      value={newDecision.options}
                      onChange={(e) => setNewDecision({...newDecision, options: e.target.value})}
                      rows={4}
                    />
                  </div>
                  <Button 
                    onClick={handleProcessDecision}
                    disabled={processDecisionMutation.isPending || !canAccessAIFeature('leadership_strategy')}
                    className="w-full"
                    data-testid="button-process-decision"
                  >
                    {processDecisionMutation.isPending ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        {'Processing Decision...'}
                      </>
                    ) : (
                      <>
                        {false ? (
                          <>
                            <Brain className="w-4 h-4 mr-2" />
                            Process with AI
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4 mr-2" />
                            Process Decision
                          </>
                        )}
                      </>
                    )}
                  </Button>
                  <TryWithAIPrompt feature="Decision Analysis" />
                </CardContent>
              </Card>
            </div>

            {/* AI Strategy Plans */}
            {strategyPlans.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" />
                    AI-Generated Strategy Plans
                  </CardTitle>
                  <CardDescription>
                    Strategic plans created by AI consciousness
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {strategyPlans.slice(0, 3).map((plan: any) => (
                      <div key={plan.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{plan.objective}</h4>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {plan.successProbability ? `${(plan.successProbability * 100).toFixed(0)}% success` : 'Planning'}
                            </Badge>
                            {false && (
                              <Badge variant="outline" className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/30 text-blue-300">
                                <Sparkles className="w-3 h-3 mr-1" />
                                AI Enhanced
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          Strategy: {plan.selectedStrategy}
                        </p>
                        {plan.consciousnessInsights && plan.consciousnessInsights.length > 0 && (
                          <div className="space-y-1 mb-3">
                            <h5 className="text-sm font-medium">AI Insights:</h5>
                            {plan.consciousnessInsights.slice(0, 2).map((insight: string, index: number) => (
                              <p key={index} className="text-xs text-muted-foreground">
                                • {insight}
                              </p>
                            ))}
                          </div>
                        )}
                        {false && (
                          <div className="flex items-center justify-between pt-2 border-t">
                            <span className="text-xs text-muted-foreground">Rate this AI strategy:</span>
                            <FeedbackButtons itemId={plan.id} type="strategy" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
        
        {/* Tier Upgrade Modals */}
        <UpgradePromptModal
          prompt={currentUpgradePrompt}
          onDismiss={dismissUpgradePrompt}
          onUpgrade={() => trackUpgradeConversion(currentUpgradePrompt?.featureId || '', true)}
        />
        
        <TierUpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => {
            setShowUpgradeModal(false);
            setUpgradeFeatureId(null);
          }}
          featureId={upgradeFeatureId || undefined}
          initialTab="features"
        />
      </div>
    </div>
  );
};

export default Leadership;