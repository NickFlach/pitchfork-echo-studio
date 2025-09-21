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
import { ConsciousnessDashboard } from "@/components/consciousness/ConsciousnessDashboard";
import { TemporalConsciousnessDashboard } from "@/components/consciousness/TemporalConsciousnessDashboard";
import { DecisionTimeline } from "@/components/consciousness/DecisionTimeline";
import { ReflectionObservatory } from "@/components/consciousness/ReflectionObservatory";
import { PatternRecognitionGrid } from "@/components/consciousness/PatternRecognitionGrid";
import { ComplexityWeb } from "@/components/consciousness/ComplexityWeb";
import { CorruptionDetectionDashboard } from "@/components/consciousness/CorruptionDetectionDashboard";
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
  Clock
} from 'lucide-react';
import type { ConsciousnessState, DecisionRecord, ReflectionLog, LearningCycle, ComplexityMap } from '../../shared/schema';
import { consciousnessApi } from '@/lib/consciousnessApi';
import { useToast } from '@/hooks/use-toast';

const Consciousness = () => {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState('overview');
  const [isProcessing, setIsProcessing] = useState(false);
  const [reflectionTrigger, setReflectionTrigger] = useState('');
  const [decisionContext, setDecisionContext] = useState('');
  const [decisionOptions, setDecisionOptions] = useState('');
  const agentId = 'default-agent';

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
    try {
      await consciousnessApi.reflect(reflectionTrigger);
      toast({
        title: "Reflection Initiated",
        description: "AI consciousness is processing the reflection trigger",
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

      await consciousnessApi.processMultiscaleDecision(decisionContext, options);
      toast({
        title: "Decision Processed",
        description: "AI consciousness has analyzed the decision through multiscale framework",
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
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-9 mb-8">
            <TabsTrigger value="overview" className="flex items-center gap-2" data-testid="tab-overview">
              <Brain className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="temporal" className="flex items-center gap-2" data-testid="tab-temporal">
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">Temporal</span>
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

          {/* Temporal Consciousness Tab */}
          <TabsContent value="temporal">
            <TemporalConsciousnessDashboard />
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