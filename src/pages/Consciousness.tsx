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
  Loader2
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

  // AI Configuration Detection
  const { data: aiCredentials = [], isLoading: loadingAIConfig } = useQuery<MaskedAICredentials[]>({
    queryKey: ['/api/admin/ai-credentials'],
    refetchInterval: 30000, // Check every 30 seconds
  });

  // Dynamic AI availability detection
  const aiEnhanced = aiCredentials.some(cred => cred.hasApiKey);
  const configuredProviders = aiCredentials.filter(cred => cred.hasApiKey).map(cred => cred.provider);

  // AI Enhancement helper components
  const AIEnhancedBadge = ({ feature, tooltip }: { feature: string; tooltip: string }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="secondary" className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-700 dark:text-purple-300 border-purple-300/50" data-testid={`badge-ai-${feature}`}>
            <Sparkles className="w-3 h-3 mr-1" />
            AI Enhanced
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs">{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
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

  const TryWithAIPrompt = ({ feature, onTry }: { feature: string; onTry: () => void }) => (
    !aiEnhanced ? (
      <Alert className="mt-4">
        <Sparkles className="w-4 h-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>Enhance your {feature.toLowerCase()} with AI-powered insights</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.location.href = '/ai-settings'} 
            data-testid={`button-try-ai-${feature}`}
          >
            Configure AI
          </Button>
        </AlertDescription>
      </Alert>
    ) : null
  );

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
      
      toast({
        title: "Reflection Initiated",
        description: aiEnhanced ? "AI-enhanced consciousness is processing the reflection trigger" : "Consciousness engine is processing the reflection trigger",
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
        description: aiEnhanced ? "AI-enhanced consciousness has analyzed the decision" : "Consciousness engine has analyzed the decision",
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
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 mb-8">
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
                    disabled={isProcessing || !reflectionTrigger.trim()}
                    className="w-full"
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
                    disabled={isProcessing || !decisionContext.trim() || !decisionOptions.trim()}
                    className="w-full"
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
        </Tabs>
      </div>
    </div>
  );
};

export default Consciousness;