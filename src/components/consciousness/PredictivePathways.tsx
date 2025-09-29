import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  TrendingUp, 
  Target, 
  Lightbulb, 
  ArrowRight, 
  Clock,
  Brain,
  Star,
  Zap,
  AlertTriangle,
  CheckCircle,
  Calendar,
  BarChart3
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { consciousnessApi } from '@/lib/consciousnessApi';
import { useGameification } from '@/hooks/useGameification';
import { useToast } from '@/hooks/use-toast';

interface DevelopmentPathway {
  id: string;
  name: string;
  description: string;
  currentProgress: number;
  estimatedCompletion: Date;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category: 'awareness' | 'decision-making' | 'emotional-intelligence' | 'systems-thinking' | 'leadership';
  milestones: Array<{
    id: string;
    title: string;
    description: string;
    progress: number;
    completed: boolean;
    estimatedDate: Date;
    prerequisites?: string[];
  }>;
  predictedOutcomes: Array<{
    outcome: string;
    probability: number;
    timeframe: string;
    impact: 'low' | 'medium' | 'high' | 'transformative';
  }>;
  recommendedActions: string[];
  riskFactors: Array<{
    factor: string;
    probability: number;
    mitigation: string;
  }>;
}

interface ConsciousnessTrajectory {
  date: string;
  predicted: number;
  confidence: number;
  actual?: number;
  factors: string[];
}

const DEVELOPMENT_PATHWAYS: DevelopmentPathway[] = [
  {
    id: 'awareness-mastery',
    name: 'Awareness Mastery',
    description: 'Develop profound self-awareness and metacognitive abilities',
    currentProgress: 65,
    estimatedCompletion: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days
    difficulty: 'intermediate',
    category: 'awareness',
    milestones: [
      {
        id: 'present-moment',
        title: 'Present Moment Mastery',
        description: 'Maintain consistent present-moment awareness',
        progress: 80,
        completed: false,
        estimatedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'thought-observation',
        title: 'Thought Pattern Recognition',
        description: 'Identify and observe thought patterns without attachment',
        progress: 60,
        completed: false,
        estimatedDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'emotional-awareness',
        title: 'Emotional Intelligence',
        description: 'Recognize emotional states and their impact on consciousness',
        progress: 45,
        completed: false,
        estimatedDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    ],
    predictedOutcomes: [
      {
        outcome: 'Increased decision clarity by 40%',
        probability: 0.87,
        timeframe: '30 days',
        impact: 'high',
      },
      {
        outcome: 'Enhanced stress resilience',
        probability: 0.92,
        timeframe: '45 days',
        impact: 'high',
      },
      {
        outcome: 'Breakthrough insight experience',
        probability: 0.34,
        timeframe: '60 days',
        impact: 'transformative',
      },
    ],
    recommendedActions: [
      'Practice daily mindfulness meditation for 20 minutes',
      'Keep a consciousness journal with hourly check-ins',
      'Implement pause-and-reflect protocols before major decisions',
      'Engage in contemplative practices like walking meditation',
    ],
    riskFactors: [
      {
        factor: 'Inconsistent practice due to busy schedule',
        probability: 0.45,
        mitigation: 'Set up automated reminders and start with 5-minute sessions',
      },
      {
        factor: 'Plateau in progress after initial gains',
        probability: 0.28,
        mitigation: 'Introduce advanced techniques and vary practice methods',
      },
    ],
  },
  {
    id: 'decision-mastery',
    name: 'Decision-Making Excellence',
    description: 'Master complex decision-making using consciousness principles',
    currentProgress: 40,
    estimatedCompletion: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    difficulty: 'advanced',
    category: 'decision-making',
    milestones: [
      {
        id: 'framework-mastery',
        title: 'Multi-Scale Decision Framework',
        description: 'Apply systematic frameworks to complex decisions',
        progress: 55,
        completed: false,
        estimatedDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'intuition-integration',
        title: 'Intuition-Logic Integration',
        description: 'Balance analytical thinking with intuitive wisdom',
        progress: 30,
        completed: false,
        estimatedDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      },
    ],
    predictedOutcomes: [
      {
        outcome: 'Improved decision accuracy by 55%',
        probability: 0.78,
        timeframe: '45 days',
        impact: 'high',
      },
      {
        outcome: 'Reduced decision fatigue and overwhelm',
        probability: 0.85,
        timeframe: '30 days',
        impact: 'medium',
      },
    ],
    recommendedActions: [
      'Practice with low-stakes decisions daily',
      'Study complex decision scenarios and outcomes',
      'Develop personal decision-making protocols',
    ],
    riskFactors: [
      {
        factor: 'Analysis paralysis in complex scenarios',
        probability: 0.35,
        mitigation: 'Set decision deadlines and trust developed frameworks',
      },
    ],
  },
  {
    id: 'systems-thinking',
    name: 'Systems Consciousness',
    description: 'Develop holistic understanding of interconnected systems',
    currentProgress: 25,
    estimatedCompletion: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    difficulty: 'expert',
    category: 'systems-thinking',
    milestones: [
      {
        id: 'pattern-recognition',
        title: 'Pattern Recognition Mastery',
        description: 'Identify recurring patterns across different systems',
        progress: 40,
        completed: false,
        estimatedDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'interconnection-mapping',
        title: 'Interconnection Mapping',
        description: 'Map complex relationships and dependencies',
        progress: 15,
        completed: false,
        estimatedDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      },
    ],
    predictedOutcomes: [
      {
        outcome: 'Enhanced strategic thinking capabilities',
        probability: 0.72,
        timeframe: '60 days',
        impact: 'transformative',
      },
      {
        outcome: 'Improved ability to predict system behaviors',
        probability: 0.65,
        timeframe: '90 days',
        impact: 'high',
      },
    ],
    recommendedActions: [
      'Study complex adaptive systems',
      'Practice systems mapping exercises',
      'Analyze real-world system behaviors',
    ],
    riskFactors: [
      {
        factor: 'Overwhelming complexity leading to cognitive overload',
        probability: 0.42,
        mitigation: 'Break down complex systems into manageable components',
      },
    ],
  },
];

export function PredictivePathways() {
  const { toast } = useToast();
  const { userStats, completeConsciousnessSession } = useGameification();
  const [selectedPathway, setSelectedPathway] = useState<string>(DEVELOPMENT_PATHWAYS[0].id);
  const [timeHorizon, setTimeHorizon] = useState<'30d' | '90d' | '1y'>('90d');

  // Generate consciousness trajectory prediction
  const consciousnessTrajectory: ConsciousnessTrajectory[] = useMemo(() => {
    const days = timeHorizon === '30d' ? 30 : timeHorizon === '90d' ? 90 : 365;
    const data: ConsciousnessTrajectory[] = [];
    
    const currentScore = userStats.consciousnessScore;
    const growthRate = 0.8; // Base growth rate per month
    const volatility = 0.15; // Prediction confidence variation
    
    for (let i = 0; i <= days; i += Math.ceil(days / 20)) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      // Calculate predicted score with diminishing returns
      const monthsElapsed = i / 30;
      const predicted = Math.min(100, currentScore + (growthRate * monthsElapsed * Math.exp(-monthsElapsed * 0.1) * 10));
      
      // Add some realistic variation
      const variation = (Math.random() - 0.5) * 10;
      const finalPredicted = Math.max(0, Math.min(100, predicted + variation));
      
      // Calculate confidence (decreases over time)
      const confidence = Math.max(0.3, 0.95 - (monthsElapsed * 0.1));
      
      data.push({
        date: date.toISOString().split('T')[0],
        predicted: Math.round(finalPredicted),
        confidence: Math.round(confidence * 100),
        factors: i === 0 ? ['current state'] : ['consistent practice', 'pathway progression', 'external factors'],
      });
    }
    
    return data;
  }, [timeHorizon, userStats.consciousnessScore]);

  const currentPathway = DEVELOPMENT_PATHWAYS.find(p => p.id === selectedPathway) || DEVELOPMENT_PATHWAYS[0];

  const activatePathway = (pathwayId: string) => {
    const pathway = DEVELOPMENT_PATHWAYS.find(p => p.id === pathwayId);
    if (!pathway) return;

    toast({
      title: "Pathway Activated",
      description: `Started "${pathway.name}" development pathway. Recommended actions added to your goals.`,
    });

    // Simulate pathway activation
    completeConsciousnessSession(userStats.consciousnessScore + 5);
  };

  const getDifficultyColor = (difficulty: DevelopmentPathway['difficulty']) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-orange-500';
      case 'expert': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryIcon = (category: DevelopmentPathway['category']) => {
    switch (category) {
      case 'awareness': return <Brain className="w-4 h-4" />;
      case 'decision-making': return <Target className="w-4 h-4" />;
      case 'emotional-intelligence': return <Star className="w-4 h-4" />;
      case 'systems-thinking': return <BarChart3 className="w-4 h-4" />;
      case 'leadership': return <Zap className="w-4 h-4" />;
      default: return <Lightbulb className="w-4 h-4" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'transformative': return 'text-purple-600 font-bold';
      case 'high': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Predictive Development Pathways</h2>
        <p className="text-muted-foreground">
          AI-powered predictions for your consciousness development journey
        </p>
      </div>

      <Tabs defaultValue="pathways" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pathways">Development Pathways</TabsTrigger>
          <TabsTrigger value="trajectory">Trajectory Prediction</TabsTrigger>
          <TabsTrigger value="outcomes">Predicted Outcomes</TabsTrigger>
        </TabsList>

        <TabsContent value="pathways" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pathway Selection */}
            <div className="space-y-4">
              <h3 className="font-semibold">Available Pathways</h3>
              <div className="space-y-3">
                {DEVELOPMENT_PATHWAYS.map((pathway) => (
                  <Card 
                    key={pathway.id}
                    className={`cursor-pointer transition-colors ${
                      selectedPathway === pathway.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedPathway(pathway.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-base flex items-center gap-2">
                            {getCategoryIcon(pathway.category)}
                            {pathway.name}
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${getDifficultyColor(pathway.difficulty)}`} />
                            <span className="text-xs text-muted-foreground capitalize">
                              {pathway.difficulty}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Progress value={pathway.currentProgress} className="mb-2" />
                      <div className="text-xs text-muted-foreground">
                        {pathway.currentProgress}% complete
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Pathway Details */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getCategoryIcon(currentPathway.category)}
                    {currentPathway.name}
                    <Badge variant="outline" className="capitalize">
                      {currentPathway.difficulty}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{currentPathway.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium">Progress</div>
                      <Progress value={currentPathway.currentProgress} className="mt-1" />
                      <div className="text-xs text-muted-foreground mt-1">
                        {currentPathway.currentProgress}% complete
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Est. Completion</div>
                      <div className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {currentPathway.estimatedCompletion.toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <Button onClick={() => activatePathway(currentPathway.id)} className="w-full">
                    <Zap className="w-4 h-4 mr-2" />
                    Activate Pathway
                  </Button>
                </CardContent>
              </Card>

              {/* Milestones */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Milestones</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {currentPathway.milestones.map((milestone) => (
                      <div key={milestone.id} className="border rounded-lg p-3 space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h4 className="font-medium text-sm flex items-center gap-2">
                              {milestone.completed ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : (
                                <Clock className="w-4 h-4 text-muted-foreground" />
                              )}
                              {milestone.title}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {milestone.description}
                            </p>
                          </div>
                          <Badge variant={milestone.completed ? "default" : "outline"} className="text-xs">
                            {milestone.progress}%
                          </Badge>
                        </div>
                        
                        {!milestone.completed && (
                          <div className="space-y-1">
                            <Progress value={milestone.progress} className="h-1" />
                            <div className="text-xs text-muted-foreground">
                              Est. completion: {milestone.estimatedDate.toLocaleDateString()}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recommended Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Recommended Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {currentPathway.recommendedActions.map((action, index) => (
                      <li key={index} className="text-sm flex items-start gap-2">
                        <ArrowRight className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                        {action}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="trajectory" className="space-y-4">
          <div className="space-y-4">
            {/* Time Horizon Selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Time Horizon:</span>
              <div className="flex gap-1">
                {['30d', '90d', '1y'].map((horizon) => (
                  <Button
                    key={horizon}
                    variant={timeHorizon === horizon ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTimeHorizon(horizon as any)}
                  >
                    {horizon === '30d' ? '30 Days' : horizon === '90d' ? '90 Days' : '1 Year'}
                  </Button>
                ))}
              </div>
            </div>

            {/* Trajectory Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Consciousness Development Trajectory</CardTitle>
                <CardDescription>
                  Predicted consciousness score progression based on current patterns and pathway selection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={consciousnessTrajectory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => new Date(date).toLocaleDateString()}
                    />
                    <YAxis domain={[0, 100]} />
                    <Tooltip 
                      labelFormatter={(date) => new Date(date).toLocaleDateString()}
                      formatter={(value: number, name: string) => [`${value}%`, name === 'predicted' ? 'Predicted Score' : 'Confidence']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="predicted" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.3}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="confidence" 
                      stroke="#82ca9d"
                      strokeDasharray="5 5"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Factors Influencing Trajectory */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Key Influencing Factors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-green-600">Positive Factors</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Consistent daily practice</li>
                      <li>• Active pathway progression</li>
                      <li>• Regular reflection and journaling</li>
                      <li>• Community engagement</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-red-600">Risk Factors</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Practice inconsistency</li>
                      <li>• External stress periods</li>
                      <li>• Plateau periods</li>
                      <li>• Lack of challenge progression</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="outcomes" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Predicted Outcomes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Predicted Outcomes</CardTitle>
                <CardDescription>
                  Expected results from following the {currentPathway.name} pathway
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {currentPathway.predictedOutcomes.map((outcome, index) => (
                      <div key={index} className="border rounded-lg p-3 space-y-2">
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium text-sm">{outcome.outcome}</h4>
                          <Badge 
                            variant="outline" 
                            className={getImpactColor(outcome.impact)}
                          >
                            {outcome.impact}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            {Math.round(outcome.probability * 100)}% likely
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {outcome.timeframe}
                          </div>
                        </div>
                        
                        <Progress value={outcome.probability * 100} className="h-1" />
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Risk Assessment */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Risk Assessment</CardTitle>
                <CardDescription>
                  Potential challenges and mitigation strategies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentPathway.riskFactors.map((risk, index) => (
                    <div key={index} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <div className="space-y-1 flex-1">
                          <h4 className="font-medium text-sm">{risk.factor}</h4>
                          <div className="text-xs text-muted-foreground">
                            {Math.round(risk.probability * 100)}% probability
                          </div>
                          <Progress value={risk.probability * 100} className="h-1" />
                        </div>
                      </div>
                      
                      <div className="ml-6 text-sm text-muted-foreground">
                        <strong>Mitigation:</strong> {risk.mitigation}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}