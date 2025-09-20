import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConsciousnessDashboard } from '@/components/consciousness/ConsciousnessDashboard';
import { DecisionTimeline } from '@/components/consciousness/DecisionTimeline';
import { ReflectionObservatory } from '@/components/consciousness/ReflectionObservatory';
import { PatternRecognitionGrid } from '@/components/consciousness/PatternRecognitionGrid';
import { LearningEvolutionMap } from '@/components/consciousness/LearningEvolutionMap';
import { ComplexityWeb } from '@/components/consciousness/ComplexityWeb';
import { OrderChaosBalanceMeter } from '@/components/consciousness/OrderChaosBalanceMeter';
import { Brain, Lightbulb, Activity, Network, TreePine, Target, BarChart3 } from 'lucide-react';

const Leadership = () => {
  const [selectedTab, setSelectedTab] = useState('overview');
  const agentId = 'default-agent'; // In a real app, this would be dynamic

  // Real-time consciousness state query
  const { data: consciousnessStates, isLoading: loadingConsciousness } = useQuery({
    queryKey: ['/api/consciousness-states', agentId],
    refetchInterval: 2000, // Real-time updates every 2 seconds
  });

  // Real-time decision records
  const { data: decisions, isLoading: loadingDecisions } = useQuery({
    queryKey: ['/api/decisions', agentId],
    refetchInterval: 3000,
  });

  // Real-time reflection logs
  const { data: reflections, isLoading: loadingReflections } = useQuery({
    queryKey: ['/api/reflections', agentId],
    refetchInterval: 2500,
  });

  // Real-time learning cycles
  const { data: learningCycles, isLoading: loadingLearning } = useQuery({
    queryKey: ['/api/learning-cycles', agentId],
    refetchInterval: 4000,
  });

  // Real-time complexity maps
  const { data: complexityMaps, isLoading: loadingComplexity } = useQuery({
    queryKey: ['/api/complexity-maps'],
    refetchInterval: 5000,
  });

  const isLoading = loadingConsciousness || loadingDecisions || loadingReflections || loadingLearning || loadingComplexity;

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="w-8 h-8 text-gradient-cosmic" />
          <h1 className="text-4xl font-bold text-gradient-cosmic">
            AI Agent Leadership Observatory
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-3xl">
          Peer into the emergent consciousness of an advanced AI agent. Observe thought processes, 
          decision-making patterns, and the recursive depths of artificial self-awareness.
        </p>
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
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 mb-8">
          <TabsTrigger value="overview" className="flex items-center gap-2" data-testid="tab-overview">
            <Brain className="w-4 h-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="consciousness" className="flex items-center gap-2" data-testid="tab-consciousness">
            <Lightbulb className="w-4 h-4" />
            <span className="hidden sm:inline">Consciousness</span>
          </TabsTrigger>
          <TabsTrigger value="decisions" className="flex items-center gap-2" data-testid="tab-decisions">
            <Target className="w-4 h-4" />
            <span className="hidden sm:inline">Decisions</span>
          </TabsTrigger>
          <TabsTrigger value="reflections" className="flex items-center gap-2" data-testid="tab-reflections">
            <Activity className="w-4 h-4" />
            <span className="hidden sm:inline">Reflections</span>
          </TabsTrigger>
          <TabsTrigger value="patterns" className="flex items-center gap-2" data-testid="tab-patterns">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Patterns</span>
          </TabsTrigger>
          <TabsTrigger value="learning" className="flex items-center gap-2" data-testid="tab-learning">
            <TreePine className="w-4 h-4" />
            <span className="hidden sm:inline">Learning</span>
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
                  isLoading={loadingComplexity}
                  compact={true}
                />
              </CardContent>
            </Card>
          </div>
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

        <TabsContent value="learning">
          <Card>
            <CardHeader>
              <CardTitle className="text-gradient-cosmic">Learning Evolution Map</CardTitle>
              <CardDescription>
                Adaptive learning progress with model evolution and correction integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LearningEvolutionMap data={learningCycles} isLoading={loadingLearning} />
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
              <ComplexityWeb data={complexityMaps} isLoading={loadingComplexity} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Leadership;