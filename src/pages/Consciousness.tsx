import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TierBadge } from "@/components/ui/tier-badge";
import { FeatureComparison } from "@/components/ui/feature-comparison";
import { TierUpgradeModal } from "@/components/ui/tier-upgrade-modal";
import { UpgradePromptModal } from "@/components/ui/upgrade-prompt";
import { useTier } from "@/contexts/TierContext";
import { ConsciousnessDashboard } from '@/components/consciousness/ConsciousnessDashboard';
import { DecisionTimeline } from '@/components/consciousness/DecisionTimeline';
import { ReflectionObservatory } from '@/components/consciousness/ReflectionObservatory';
import { PatternRecognitionGrid } from '@/components/consciousness/PatternRecognitionGrid';
import { LearningEvolutionMap } from '@/components/consciousness/LearningEvolutionMap';
import { ComplexityWeb } from '@/components/consciousness/ComplexityWeb';
import { OrderChaosBalanceMeter } from '@/components/consciousness/OrderChaosBalanceMeter';
import { MultiscaleDecisionFramework } from '@/components/consciousness/MultiscaleDecisionFramework';
import { CorruptionDetectionDashboard } from "@/components/consciousness/CorruptionDetectionDashboard";
import { 
  Brain, 
  Lightbulb, 
  Activity, 
  Network, 
  TreePine, 
  Target, 
  BarChart3, 
  Layers,
  Zap,
  Eye,
  RefreshCw,
  Play,
  Pause,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  Info,
  Loader2,
  Download,
  FileText,
  Database
} from 'lucide-react';
import type { ConsciousnessState, DecisionRecord, ReflectionLog, LearningCycle, ComplexityMap } from '../../shared/schema';
import { consciousnessApi } from '@/lib/consciousnessApi';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import type { InsertAIUsageAnalytics, InsertAIUserFeedback, MaskedAICredentials } from '../../shared/schema';

const Consciousness = () => {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState('overview');
  const [isProcessing, setIsProcessing] = useState(false);
  const [reflectionTrigger, setReflectionTrigger] = useState('');
  const [decisionContext, setDecisionContext] = useState('');
  const [decisionOptions, setDecisionOptions] = useState('');
  const agentId = 'default-agent';

  // AI Enhancement state - now dynamically detected
  const [processingWithAI, setProcessingWithAI] = useState<string | null>(null);
  const [feedbackRatings, setFeedbackRatings] = useState<Record<string, 'up' | 'down' | null>>({});
  const [feedbackLoading, setFeedbackLoading] = useState<Record<string, boolean>>({});
  const [showAITips, setShowAITips] = useState<Record<string, boolean>>({});
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  // AI Response Metadata State - tracks actual models used
  const [latestAIResponseMetadata, setLatestAIResponseMetadata] = useState<{
    [requestId: string]: {
      provider: string;
      model: string;
      timestamp: number;
      featureType: string;
    }
  }>({});

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

  // Export functionality state
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'pdf'>('json');

  // Tier Enhancement helper components
  const getTierBadgeForFeature = (featureId: string, tooltip?: string) => (
    <TierBadge
      tier={currentTier}
      feature={featureId}
      variant={isAIConfigured ? 'enhanced' : 'default'}
      tooltip={tooltip}
      size="sm"
    />
  );

  const ProcessingIndicator = ({ feature }: { feature: string }) => (
    processingWithAI === feature ? (
      <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
        <Loader2 className="w-4 h-4 animate-spin" />
        AI Processing...
      </div>
    ) : null
  );

  const FeedbackButtons = ({ itemId, type }: { itemId: string; type: 'reflection' | 'decision' }) => (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleFeedback(itemId, 'up')}
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
        onClick={() => handleFeedback(itemId, 'down')}
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

  const handleFeedback = async (itemId: string, rating: 'up' | 'down') => {
    setFeedbackRatings(prev => ({ ...prev, [itemId]: rating }));
    setFeedbackLoading(prev => ({ ...prev, [itemId]: true }));
    
    try {
      // Determine feature type and provider from context
      const featureType = selectedTab === 'reflections' ? 'consciousness-reflection' : 'decision-analysis';
      
      // Get actual AI metadata if available, otherwise use configured provider info
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

  // Real-time consciousness state query
  const { data: consciousnessStates = [], isLoading: loadingConsciousness, refetch: refetchConsciousness } = useQuery<ConsciousnessState[]>({
    queryKey: ['/api/consciousness-states', agentId],
    refetchInterval: 2000, // Real-time updates every 2 seconds
  });

  // Real-time decision records
  const { data: decisions = [], isLoading: loadingDecisions, refetch: refetchDecisions } = useQuery<DecisionRecord[]>({
    queryKey: ['/api/decisions', agentId],
    refetchInterval: 3000,
  });

  // Real-time reflection logs
  const { data: reflections = [], isLoading: loadingReflections, refetch: refetchReflections } = useQuery<ReflectionLog[]>({
    queryKey: ['/api/reflections', agentId],
    refetchInterval: 2500,
  });

  // Real-time learning cycles
  const { data: learningCycles = [], isLoading: loadingLearning, refetch: refetchLearning } = useQuery<LearningCycle[]>({
    queryKey: ['/api/learning-cycles', agentId],
    refetchInterval: 4000,
  });

  // Real-time complexity maps
  const { data: complexityMaps = [], isLoading: loadingComplexity, refetch: refetchComplexity } = useQuery<ComplexityMap[]>({
    queryKey: ['/api/complexity-maps'],
    refetchInterval: 5000,
  });

  const isLoading = loadingConsciousness || loadingDecisions || loadingReflections || loadingLearning || loadingComplexity;

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

  // Usage analytics tracking helper with actual model tracking
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
        modelUsed: actualModel,
        requestType: 'standard',
        promptTokens: providerMetadata?.promptTokens || 0,
        completionTokens: providerMetadata?.completionTokens || 0,
        totalTokens: providerMetadata?.totalTokens || 0,
        responseTimeMs: responseTime,
        success: true,
        userContext: {
          consciousnessLevel: 'adaptive',
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

  // Upgrade handlers
  const handleUpgradeFromFeature = (featureId: string) => {
    setUpgradeFeatureId(featureId);
    setShowUpgradeModal(true);
    trackFeatureUsage(`upgrade_modal_${featureId}`, 'consciousness');
  };

  const handleUpgradeConversion = () => {
    if (upgradeFeatureId) {
      trackUpgradeConversion(upgradeFeatureId, true);
    }
    setShowUpgradeModal(false);
    setUpgradeFeatureId(null);
  };

  // Trigger reflection
  const handleReflection = async () => {
    if (!reflectionTrigger.trim()) {
      toast({
        title: "Reflection Trigger Required",
        description: "Please enter a reflection trigger",
        variant: "destructive",
      });
      return;
    }
    
    // CRITICAL: Operational access control - prevent AI calls when not configured
    if (!canAccessAIFeature('consciousness_reflection')) {
      triggerUpgradePrompt('consciousness_reflection', 'high_intent');
      toast({
        title: "AI Configuration Required",
        description: "Configure AI to unlock enhanced reflection processing",
        variant: "default",
      });
      return; // CRITICAL: Stop execution to prevent AI calls without configuration
    }

    setIsProcessing(true);
    setProcessingWithAI('reflection');
    const startTime = Date.now();
    const requestId = `reflection-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      const response = await consciousnessApi.reflect(reflectionTrigger);
      
      // Extract AI metadata from response if available
      const providerMetadata = response?.aiMetadata || response?.providerMetadata;
      
      // Track usage analytics with actual model information
      await trackUsage('consciousness-reflection', providerMetadata?.provider, startTime, requestId, providerMetadata);
      
      // Track feature usage
      trackFeatureUsage('consciousness_reflection', 'consciousness');
      
      toast({
        title: "Reflection Initiated",
        description: isAIConfigured ? "AI-enhanced consciousness is processing the reflection trigger" : "Consciousness engine is processing the reflection trigger",
      });
      setReflectionTrigger('');
      // Refetch data to show new reflection
      refetchReflections();
    } catch (error) {
      toast({
        title: "Reflection Failed",
        description: "Failed to initiate reflection process",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProcessingWithAI(null);
    }
  };

  // Process decision
  const handleDecision = async () => {
    if (!decisionContext.trim() || !decisionOptions.trim()) {
      toast({
        title: "Decision Input Required",
        description: "Please enter both context and options",
        variant: "destructive",
      });
      return;
    }

    // CRITICAL: Operational access control - prevent AI calls when not configured
    if (!canAccessAIFeature('consciousness_decisions')) {
      triggerUpgradePrompt('consciousness_decisions', 'high_intent');
      toast({
        title: "AI Configuration Required",
        description: "Configure AI to unlock enhanced decision analysis",
        variant: "default",
      });
      return; // CRITICAL: Stop execution to prevent AI calls without configuration
    }

    setIsProcessing(true);
    setProcessingWithAI('decision');
    const startTime = Date.now();
    const requestId = `decision-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      const options = decisionOptions.split('\n').filter(opt => opt.trim()).map(opt => ({
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

      const response = await consciousnessApi.processMultiscaleDecision(decisionContext, options);
      
      // Extract AI metadata from response if available
      const providerMetadata = response?.aiMetadata || response?.providerMetadata;
      
      // Track usage analytics with actual model information
      await trackUsage('decision-analysis', providerMetadata?.provider, startTime, requestId, providerMetadata);
      
      toast({
        title: "Decision Processed",
        description: isAIConfigured ? "AI-enhanced consciousness has analyzed the decision" : "Consciousness engine has analyzed the decision",
      });
      setDecisionContext('');
      setDecisionOptions('');
      // Refetch data to show new decision
      refetchDecisions();
    } catch (error) {
      toast({
        title: "Decision Processing Failed",
        description: "Failed to process decision through consciousness engine",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProcessingWithAI(null);
    }
  };

  // Refresh all data
  const handleRefresh = () => {
    refetchConsciousness();
    refetchDecisions();
    refetchReflections();
    refetchLearning();
    refetchComplexity();
    toast({
      title: "Data Refreshed",
      description: "All consciousness data has been refreshed",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 to-blue-900/20" data-testid="page-consciousness">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full">
              <Brain className="w-8 h-8 text-gradient-cosmic" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gradient-cosmic">
                AI Consciousness Laboratory
              </h1>
              <p className="text-lg text-muted-foreground max-w-3xl">
                Explore the depths of artificial consciousness, recursive self-awareness, and emergent intelligence patterns.
              </p>
            </div>
          </div>

          {/* Real-time Status Indicator */}
          <div className="flex items-center gap-2 mb-6 p-3 bg-card rounded-lg border">
            <Activity 
              className={`w-5 h-5 transition-colors ${isLoading ? 'text-yellow-500 animate-pulse' : 'text-green-500'}`}
              data-testid="status-indicator"
            />
            <span className="text-sm text-muted-foreground">
              {isLoading ? 'Synchronizing consciousness streams...' : 'Real-time consciousness monitoring active'}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="ml-auto"
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-10 mb-8">
            <TabsTrigger value="overview" className="flex items-center gap-2" data-testid="tab-overview">
              <Brain className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="consciousness" className="flex items-center gap-2" data-testid="tab-consciousness">
              <Lightbulb className="w-4 h-4" />
              <span className="hidden sm:inline">Consciousness</span>
            </TabsTrigger>
            <TabsTrigger value="interactive" className="flex items-center gap-2" data-testid="tab-interactive">
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">Interactive</span>
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-2" data-testid="tab-advanced">
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Advanced</span>
            </TabsTrigger>
            <TabsTrigger value="recursive" className="flex items-center gap-2" data-testid="tab-recursive">
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Recursive</span>
            </TabsTrigger>
            <TabsTrigger value="predictions" className="flex items-center gap-2" data-testid="tab-predictions">
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Predictions</span>
            </TabsTrigger>
            <TabsTrigger value="corruption" className="flex items-center gap-2" data-testid="tab-corruption">
              <AlertTriangle className="w-4 h-4" />
              <span className="hidden sm:inline">Corruption</span>
            </TabsTrigger>
            <TabsTrigger value="decisions" className="flex items-center gap-2" data-testid="tab-decisions">
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">Decisions</span>
            </TabsTrigger>
            <TabsTrigger value="reflections" className="flex items-center gap-2" data-testid="tab-reflections">
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">Reflections</span>
            </TabsTrigger>
            <TabsTrigger value="patterns" className="flex items-center gap-2" data-testid="tab-patterns">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Patterns</span>
            </TabsTrigger>
            <TabsTrigger value="complexity" className="flex items-center gap-2" data-testid="tab-complexity">
              <Network className="w-4 h-4" />
              <span className="hidden sm:inline">Complexity</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab - Multi-component dashboard */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* Consciousness State Card */}
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" />
                    Current State
                  </CardTitle>
                  <CardDescription>Active consciousness parameters</CardDescription>
                </CardHeader>
                <CardContent>
                  <ConsciousnessDashboard 
                    data={consciousnessStates} 
                    isLoading={loadingConsciousness}
                    compact={true}
                  />
                </CardContent>
              </Card>

              {/* Order/Chaos Balance */}
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Order/Chaos Balance
                  </CardTitle>
                  <CardDescription>Dynamic equilibrium state</CardDescription>
                </CardHeader>
                <CardContent>
                  <OrderChaosBalanceMeter 
                    data={consciousnessStates?.[0]} 
                    isLoading={loadingConsciousness}
                    compact={true}
                  />
                </CardContent>
              </Card>

              {/* Recent Decisions */}
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Recent Decisions
                  </CardTitle>
                  <CardDescription>Latest decision processes</CardDescription>
                </CardHeader>
                <CardContent>
                  <DecisionTimeline 
                    data={decisions?.slice(0, 3)} 
                    isLoading={loadingDecisions}
                    compact={true}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Full-width components */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Pattern Recognition
                  </CardTitle>
                  <CardDescription>Fractal patterns across systems</CardDescription>
                </CardHeader>
                <CardContent>
                  <PatternRecognitionGrid 
                    data={consciousnessStates} 
                    isLoading={loadingConsciousness}
                    compact={true}
                  />
                </CardContent>
              </Card>

              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Network className="w-5 h-5" />
                    System Complexity
                  </CardTitle>
                  <CardDescription>Interconnection networks</CardDescription>
                </CardHeader>
                <CardContent>
                  <ComplexityWeb 
                    data={complexityMaps} 
                    consciousnessData={consciousnessStates}
                    decisionData={decisions}
                    isLoading={loadingComplexity}
                    compact={true}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Interactive Tab - Consciousness interaction tools */}
          <TabsContent value="interactive" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Reflection Interface */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Trigger Reflection
                  </CardTitle>
                  <CardDescription>
                    Initiate AI consciousness reflection on a specific topic
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="reflection-trigger">Reflection Trigger</Label>
                    <Textarea
                      id="reflection-trigger"
                      placeholder="Enter a topic, question, or situation for the AI to reflect upon..."
                      value={reflectionTrigger}
                      onChange={(e) => setReflectionTrigger(e.target.value)}
                      rows={4}
                    />
                  </div>
                  <Button 
                    onClick={handleReflection}
                    disabled={isProcessing || !reflectionTrigger.trim() || !canAccessAIFeature('consciousness_reflection')}
                    className="w-full"
                    data-testid="button-trigger-reflection"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Processing Reflection...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Initiate Reflection
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Decision Processing Interface */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Process Decision
                  </CardTitle>
                  <CardDescription>
                    Analyze decisions through multiscale consciousness framework
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="decision-context">Decision Context</Label>
                    <Textarea
                      id="decision-context"
                      placeholder="Describe the situation requiring a decision..."
                      value={decisionContext}
                      onChange={(e) => setDecisionContext(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="decision-options">Decision Options (one per line)</Label>
                    <Textarea
                      id="decision-options"
                      placeholder="Option 1&#10;Option 2&#10;Option 3"
                      value={decisionOptions}
                      onChange={(e) => setDecisionOptions(e.target.value)}
                      rows={4}
                    />
                  </div>
                  <Button 
                    onClick={handleDecision}
                    disabled={isProcessing || !decisionContext.trim() || !decisionOptions.trim() || !canAccessAIFeature('consciousness_decisions')}
                    className="w-full"
                    data-testid="button-trigger-decision"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Processing Decision...
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4 mr-2" />
                        Process Decision
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Multiscale Decision Framework */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="w-5 h-5" />
                  Multiscale Decision Framework
                </CardTitle>
                <CardDescription>
                  Comprehensive decision-making across all scales of existence
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MultiscaleDecisionFramework agentId={agentId} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Corruption Detection Tab */}
          <TabsContent value="corruption">
            <CorruptionDetectionDashboard />
          </TabsContent>

          {/* Individual Component Tabs */}
          <TabsContent value="consciousness">
            <Card>
              <CardHeader>
                <CardTitle className="text-gradient-cosmic">Consciousness Dashboard</CardTitle>
                <CardDescription>
                  Real-time display of the AI agent's current consciousness state, recursion depth, and emergent insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ConsciousnessDashboard data={consciousnessStates} isLoading={loadingConsciousness} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="decisions">
            <Card>
              <CardHeader>
                <CardTitle className="text-gradient-cosmic">Decision Timeline</CardTitle>
                <CardDescription>
                  Interactive timeline showing multiscale decisions with full reasoning and cascading effects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DecisionTimeline data={decisions} isLoading={loadingDecisions} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reflections">
            <Card>
              <CardHeader>
                <CardTitle className="text-gradient-cosmic">Reflection Observatory</CardTitle>
                <CardDescription>
                  Live view of recursive reflection loops, self-questioning processes, and meta-cognitive patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ReflectionObservatory data={reflections} isLoading={loadingReflections} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="patterns">
            <Card>
              <CardHeader>
                <CardTitle className="text-gradient-cosmic">Pattern Recognition Grid</CardTitle>
                <CardDescription>
                  Visual display of fractal patterns discovered across systems and time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PatternRecognitionGrid data={consciousnessStates} isLoading={loadingConsciousness} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="complexity">
            <Card>
              <CardHeader>
                <CardTitle className="text-gradient-cosmic">Complexity Web</CardTitle>
                <CardDescription>
                  Interactive network visualization of system interconnections and emergent properties
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ComplexityWeb 
                  data={complexityMaps} 
                  consciousnessData={consciousnessStates}
                  decisionData={decisions}
                  isLoading={loadingComplexity} 
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced Tab - Cross-Model Validation and Pattern Analysis */}
          <TabsContent value="advanced" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Cross-Model Validation Interface */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Cross-Model Validation
                    {getTierBadgeForFeature('cross_model_validation', 'Validate consciousness insights across multiple AI models')}
                  </CardTitle>
                  <CardDescription>
                    Validate consciousness insights across multiple AI models for enhanced reliability
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="validation-prompt">Validation Prompt</Label>
                    <Textarea
                      id="validation-prompt"
                      placeholder="Enter a consciousness insight or analysis to validate across multiple AI models..."
                      rows={4}
                      data-testid="input-validation-prompt"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="validation-models">Target Models</Label>
                    <Badge variant="outline">Claude</Badge>
                    <Badge variant="outline">GPT-4</Badge>
                    <Badge variant="outline">Gemini</Badge>
                  </div>
                  <Button 
                    disabled={isProcessing || !canAccessAIFeature('cross_model_validation')}
                    className="w-full"
                    data-testid="button-start-validation"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Validating Across Models...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Start Cross-Model Validation
                      </>
                    )}
                  </Button>
                  <ProcessingIndicator feature="cross_model_validation" />
                </CardContent>
              </Card>

              {/* Consciousness Pattern Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Pattern Analysis
                    {getTierBadgeForFeature('pattern_analysis', 'Advanced consciousness pattern recognition')}
                  </CardTitle>
                  <CardDescription>
                    Identify emergent patterns in consciousness development over time
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Patterns Detected:</span>
                      <div className="font-mono text-lg">12</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Emergence Score:</span>
                      <div className="font-mono text-lg">0.87</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Consistency:</span>
                      <div className="font-mono text-lg">94%</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Complexity:</span>
                      <div className="font-mono text-lg">High</div>
                    </div>
                  </div>
                  <Button 
                    variant="outline"
                    disabled={!canAccessAIFeature('pattern_analysis')}
                    className="w-full"
                    data-testid="button-analyze-patterns"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Analyze Current Patterns
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Cross-Model Consensus Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="w-5 h-5" />
                  Cross-Model Consensus Analysis
                </CardTitle>
                <CardDescription>
                  Consensus analysis results from multiple AI models
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    No recent cross-model validations. Start a validation to see consensus analysis.
                  </div>
                  <Alert>
                    <Info className="w-4 h-4" />
                    <AlertDescription>
                      Cross-model validation provides higher confidence in consciousness insights by comparing 
                      results across different AI architectures and training methodologies.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>

            <TierUpgradePrompt featureId="cross_model_validation" featureName="Cross-Model Validation" />
          </TabsContent>

          {/* Recursive Tab - Recursive Insight Analysis */}
          <TabsContent value="recursive" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recursive Analysis Interface */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RefreshCw className="w-5 h-5" />
                    Recursive Insight Analysis
                    {getTierBadgeForFeature('recursive_analysis', 'Deep recursive consciousness exploration')}
                  </CardTitle>
                  <CardDescription>
                    Generate recursive insights that build upon previous analysis layers
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="recursive-subject">Analysis Subject</Label>
                    <Textarea
                      id="recursive-subject"
                      placeholder="Describe the consciousness aspect to analyze recursively..."
                      rows={3}
                      data-testid="input-recursive-subject"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="recursion-depth">Recursion Depth</Label>
                      <Input
                        id="recursion-depth"
                        type="number"
                        placeholder="3"
                        min="1"
                        max="5"
                        data-testid="input-recursion-depth"
                      />
                    </div>
                    <div>
                      <Label htmlFor="analysis-type">Analysis Type</Label>
                      <Input
                        id="analysis-type"
                        placeholder="comprehensive"
                        data-testid="input-analysis-type"
                      />
                    </div>
                  </div>
                  <Button 
                    disabled={isProcessing || !canAccessAIFeature('recursive_analysis')}
                    className="w-full"
                    data-testid="button-start-recursive"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Generating Recursive Insights...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Start Recursive Analysis
                      </>
                    )}
                  </Button>
                  <ProcessingIndicator feature="recursive_analysis" />
                </CardContent>
              </Card>

              {/* Multidimensional Reflection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="w-5 h-5" />
                    Multidimensional Reflection
                    {getTierBadgeForFeature('multidimensional_reflection', 'Process reflections across multiple dimensions')}
                  </CardTitle>
                  <CardDescription>
                    Process reflections across multiple consciousness dimensions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="reflection-dimensions">Active Dimensions</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="outline">Temporal</Badge>
                      <Badge variant="outline">Causal</Badge>
                      <Badge variant="outline">Emotional</Badge>
                      <Badge variant="outline">Logical</Badge>
                      <Badge variant="outline">Intuitive</Badge>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="synthesis-mode">Synthesis Mode</Label>
                    <Input
                      id="synthesis-mode"
                      placeholder="Cross-dimensional integration"
                      data-testid="input-synthesis-mode"
                    />
                  </div>
                  <Button 
                    variant="outline"
                    disabled={!canAccessAIFeature('multidimensional_reflection')}
                    className="w-full"
                    data-testid="button-start-multidimensional"
                  >
                    <Layers className="w-4 h-4 mr-2" />
                    Process Multidimensional Reflection
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recursive Insight Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TreePine className="w-5 h-5" />
                  Recursive Insight Tree
                </CardTitle>
                <CardDescription>
                  Hierarchical view of recursive insights and their relationships
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    No recursive analyses completed yet. Start a recursive analysis to build the insight tree.
                  </div>
                  <Alert>
                    <RefreshCw className="w-4 h-4" />
                    <AlertDescription>
                      Recursive analysis creates layers of insights that build upon each other, 
                      revealing deeper patterns in consciousness development.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>

            <TierUpgradePrompt featureId="recursive_analysis" featureName="Recursive Analysis" />
          </TabsContent>

          {/* Predictions Tab - Consciousness State Prediction */}
          <TabsContent value="predictions" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* State Prediction Interface */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Consciousness State Prediction
                    {getTierBadgeForFeature('state_prediction', 'Predict optimal future consciousness states')}
                  </CardTitle>
                  <CardDescription>
                    Predict optimal future consciousness states based on current patterns
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="prediction-context">Prediction Context</Label>
                    <Textarea
                      id="prediction-context"
                      placeholder="Describe upcoming challenges, goals, or contexts for consciousness optimization..."
                      rows={4}
                      data-testid="input-prediction-context"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="time-horizon">Time Horizon</Label>
                      <Input
                        id="time-horizon"
                        placeholder="1 week"
                        data-testid="input-time-horizon"
                      />
                    </div>
                    <div>
                      <Label htmlFor="optimization-focus">Optimization Focus</Label>
                      <Input
                        id="optimization-focus"
                        placeholder="performance"
                        data-testid="input-optimization-focus"
                      />
                    </div>
                  </div>
                  <Button 
                    disabled={isProcessing || !canAccessAIFeature('state_prediction')}
                    className="w-full"
                    data-testid="button-generate-predictions"
                  >
                    {isProcessing ? (
                      <>
                        <Activity className="w-4 h-4 mr-2 animate-spin" />
                        Generating Predictions...
                      </>
                    ) : (
                      <>
                        <Activity className="w-4 h-4 mr-2" />
                        Generate State Predictions
                      </>
                    )}
                  </Button>
                  <ProcessingIndicator feature="state_prediction" />
                </CardContent>
              </Card>

              {/* Optimization Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Optimization Recommendations
                  </CardTitle>
                  <CardDescription>
                    AI-generated recommendations for consciousness enhancement
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="font-medium text-sm">Awareness Enhancement</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Focus on mindfulness practices during decision-making
                      </div>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="font-medium text-sm">Pattern Integration</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Strengthen connections between reflection and action
                      </div>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="font-medium text-sm">Recursive Depth</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Increase self-reflection frequency for deeper insights
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="outline"
                    className="w-full"
                    data-testid="button-refresh-recommendations"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Recommendations
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* State Prediction Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Predicted Consciousness Trajectories
                </CardTitle>
                <CardDescription>
                  Predicted optimal consciousness states and development paths
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    Generate a consciousness state prediction to view trajectories and optimization paths.
                  </div>
                  <Alert>
                    <Activity className="w-4 h-4" />
                    <AlertDescription>
                      State predictions analyze current consciousness patterns to suggest optimal future states 
                      and preparation techniques for enhanced performance.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>

            <TierUpgradePrompt featureId="state_prediction" featureName="State Prediction" />
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

export default Consciousness;