import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Brain, 
  Layers, 
  Network, 
  Sparkles, 
  Target, 
  TreePine, 
  Leaf, 
  Heart, 
  Infinity,
  Play,
  Plus,
  Minus,
  BarChart3,
  Lightbulb,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { consciousnessApi } from '@/lib/consciousnessApi';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface MultiscaleDecisionFrameworkProps {
  agentId: string;
}

interface DecisionOption {
  id: string;
  description: string;
  parameters: Record<string, any>;
  estimatedEffort: number;
  riskLevel: 'low' | 'medium' | 'high';
  reversibility: number;
  timeHorizon: 'immediate' | 'short-term' | 'medium-term' | 'long-term' | 'generational';
  stakeholders: string[];
  prerequisites: string[];
  expectedOutcomes: string[];
}

const SCALE_ICONS = {
  'syntax': Brain,
  'architecture': Layers,
  'user-experience': Target,
  'social': Network,
  'economic': BarChart3,
  'environmental': Leaf,
  'ethical': Heart,
  'existential': Infinity
};

const SCALE_COLORS = {
  'syntax': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'architecture': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  'user-experience': 'bg-green-500/20 text-green-300 border-green-500/30',
  'social': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  'economic': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  'environmental': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  'ethical': 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  'existential': 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
};

export const MultiscaleDecisionFramework = ({ agentId }: MultiscaleDecisionFrameworkProps) => {
  const { toast } = useToast();
  const [context, setContext] = useState('');
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high'>('medium');
  const [options, setOptions] = useState<DecisionOption[]>([]);
  const [selectedTab, setSelectedTab] = useState('input');
  const [lastDecisionResult, setLastDecisionResult] = useState<any>(null);

  // Query for existing decision syntheses
  const { data: decisionSyntheses, isLoading: loadingSyntheses } = useQuery({
    queryKey: ['/api/decision-syntheses', agentId],
    refetchInterval: 5000,
  });

  // Query for decision archetypes
  const { data: decisionArchetypes, isLoading: loadingArchetypes } = useQuery({
    queryKey: ['/api/decision-archetypes'],
  });

  // Mutation for processing multiscale decisions
  const processDecisionMutation = useMutation({
    mutationFn: ({ context, options, urgency }: { context: string, options: DecisionOption[], urgency: string }) => 
      consciousnessApi.processMultiscaleDecision(context, options, urgency),
    onSuccess: (result) => {
      setLastDecisionResult(result);
      setSelectedTab('results');
      queryClient.invalidateQueries({ queryKey: ['/api/decision-syntheses'] });
      toast({
        title: "Decision Processed",
        description: "Multiscale analysis completed successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Processing Failed",
        description: "Failed to process multiscale decision. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Demo mutation
  const demoMutation = useMutation({
    mutationFn: () => consciousnessApi.runMultiscaleDemo(),
    onSuccess: (result) => {
      setLastDecisionResult(result);
      setSelectedTab('results');
      setContext(result.context);
      setOptions(result.options);
      toast({
        title: "Demo Executed",
        description: "Multiscale decision demo completed.",
      });
    },
  });

  const addOption = () => {
    const newOption: DecisionOption = {
      id: `option-${Date.now()}`,
      description: '',
      parameters: {},
      estimatedEffort: 5,
      riskLevel: 'medium',
      reversibility: 0.5,
      timeHorizon: 'medium-term',
      stakeholders: [],
      prerequisites: [],
      expectedOutcomes: []
    };
    setOptions([...options, newOption]);
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const updateOption = (index: number, field: keyof DecisionOption, value: any) => {
    const updatedOptions = [...options];
    updatedOptions[index] = { ...updatedOptions[index], [field]: value };
    setOptions(updatedOptions);
  };

  const processDecision = () => {
    if (!context.trim()) {
      toast({
        title: "Missing Context",
        description: "Please provide a decision context.",
        variant: "destructive",
      });
      return;
    }

    if (options.length === 0) {
      toast({
        title: "Missing Options",
        description: "Please add at least one decision option.",
        variant: "destructive",
      });
      return;
    }

    processDecisionMutation.mutate({ context, options, urgency });
  };

  const renderMultiscaleAnalysis = (analysis: any) => {
    if (!analysis?.multiscaleAnalyses) return null;

    return (
      <div className="space-y-6">
        {analysis.multiscaleAnalyses.map((optionAnalysis: any, index: number) => (
          <Card key={index} className="border-gradient-cosmic" data-testid={`analysis-card-${index}`}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Option {index + 1}: {options[index]?.description || 'Unknown Option'}</span>
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500">
                  Complexity: {(optionAnalysis.totalComplexity * 100).toFixed(1)}%
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(optionAnalysis.scaleAnalyses).map(([scale, scaleData]: [string, any]) => {
                  const IconComponent = SCALE_ICONS[scale as keyof typeof SCALE_ICONS] || Brain;
                  const colorClass = SCALE_COLORS[scale as keyof typeof SCALE_COLORS];
                  
                  return (
                    <div key={scale} className={`p-4 rounded-lg border ${colorClass}`} data-testid={`scale-${scale}-${index}`}>
                      <div className="flex items-center gap-2 mb-3">
                        <IconComponent className="w-5 h-5" />
                        <span className="font-semibold capitalize">{scale.replace('-', ' ')}</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Impact:</span>
                          <span>{(scaleData.impact * 100).toFixed(1)}%</span>
                        </div>
                        <Progress 
                          value={scaleData.impact * 100} 
                          className="h-2"
                          data-testid={`progress-impact-${scale}-${index}`}
                        />
                        <div className="flex justify-between text-sm">
                          <span>Uncertainty:</span>
                          <span>{(scaleData.uncertainty * 100).toFixed(1)}%</span>
                        </div>
                        <Progress 
                          value={scaleData.uncertainty * 100} 
                          className="h-2"
                          data-testid={`progress-uncertainty-${scale}-${index}`}
                        />
                        {scaleData.considerations && scaleData.considerations.length > 0 && (
                          <div className="mt-2">
                            <span className="text-xs font-medium">Key Considerations:</span>
                            <ul className="text-xs mt-1 space-y-1">
                              {scaleData.considerations.slice(0, 2).map((consideration: string, idx: number) => (
                                <li key={idx} className="text-muted-foreground">• {consideration}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderCascadingEffects = (effects: any) => {
    if (!effects) return null;

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Cascading Effects Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(effects).map(([timeframe, timeEffects]: [string, any]) => (
            <Card key={timeframe} className="border-dashed" data-testid={`effects-${timeframe}`}>
              <CardHeader>
                <CardTitle className="capitalize">{timeframe.replace(/([A-Z])/g, ' $1').trim()}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Array.isArray(timeEffects) ? (
                    timeEffects.map((effect: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 mt-2 flex-shrink-0" />
                        <span className="text-sm">{effect}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">No specific effects identified</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const renderRecommendation = (recommendation: any) => {
    if (!recommendation) return null;

    return (
      <Card className="border-green-500/30 bg-green-500/5" data-testid="recommendation-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-300">
            <CheckCircle className="w-5 h-5" />
            Recommendation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <span className="font-semibold">Recommended Option:</span>
            <p className="mt-1">{recommendation.recommendedOption}</p>
          </div>
          <div>
            <span className="font-semibold">Rationale:</span>
            <p className="mt-1">{recommendation.rationale}</p>
          </div>
          <div className="flex items-center gap-4">
            <div>
              <span className="text-sm text-muted-foreground">Confidence:</span>
              <Badge className="ml-2">{(recommendation.confidence * 100).toFixed(1)}%</Badge>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Risk Level:</span>
              <Badge 
                variant={recommendation.riskLevel === 'low' ? 'default' : recommendation.riskLevel === 'medium' ? 'secondary' : 'destructive'}
                className="ml-2"
              >
                {recommendation.riskLevel}
              </Badge>
            </div>
          </div>
          {recommendation.mitigationStrategies && recommendation.mitigationStrategies.length > 0 && (
            <div>
              <span className="font-semibold">Risk Mitigation:</span>
              <ul className="mt-2 space-y-1">
                {recommendation.mitigationStrategies.map((strategy: string, idx: number) => (
                  <li key={idx} className="text-sm flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                    {strategy}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gradient-cosmic">Multiscale Decision Framework</h2>
          <p className="text-muted-foreground mt-1">
            Analyze decisions across 8 scales of awareness - from syntax to existential
          </p>
        </div>
        <Button 
          onClick={() => demoMutation.mutate()} 
          disabled={demoMutation.isPending}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          data-testid="button-demo"
        >
          <Play className="w-4 h-4 mr-2" />
          {demoMutation.isPending ? 'Loading...' : 'Run Demo'}
        </Button>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="input" data-testid="tab-input">Decision Input</TabsTrigger>
          <TabsTrigger value="results" data-testid="tab-results">Analysis Results</TabsTrigger>
          <TabsTrigger value="history" data-testid="tab-history">Decision History</TabsTrigger>
        </TabsList>

        <TabsContent value="input" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Decision Context</CardTitle>
              <CardDescription>
                Describe the decision you need to make and its context
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="context">Decision Context</Label>
                <Textarea
                  id="context"
                  placeholder="Describe the decision, its context, constraints, and stakeholders..."
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  className="mt-2"
                  rows={4}
                  data-testid="textarea-context"
                />
              </div>
              <div>
                <Label htmlFor="urgency">Urgency Level</Label>
                <select
                  id="urgency"
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value as 'low' | 'medium' | 'high')}
                  className="mt-2 w-full p-2 border rounded-md bg-background"
                  data-testid="select-urgency"
                >
                  <option value="low">Low - Long-term strategic</option>
                  <option value="medium">Medium - Operational importance</option>
                  <option value="high">High - Critical/urgent</option>
                </select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Decision Options
                <Button 
                  onClick={addOption} 
                  size="sm" 
                  className="bg-gradient-to-r from-blue-600 to-purple-600"
                  data-testid="button-add-option"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Option
                </Button>
              </CardTitle>
              <CardDescription>
                Define the possible options to choose from
              </CardDescription>
            </CardHeader>
            <CardContent>
              {options.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Lightbulb className="w-8 h-8 mx-auto mb-2" />
                  <p>No decision options defined yet</p>
                  <p className="text-sm">Click "Add Option" to start</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {options.map((option, index) => (
                    <Card key={option.id} className="border-dashed" data-testid={`option-card-${index}`}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between text-base">
                          Option {index + 1}
                          <Button 
                            onClick={() => removeOption(index)} 
                            size="sm" 
                            variant="destructive"
                            data-testid={`button-remove-option-${index}`}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Description</Label>
                          <Input
                            value={option.description}
                            onChange={(e) => updateOption(index, 'description', e.target.value)}
                            placeholder="Describe this option..."
                            className="mt-1"
                            data-testid={`input-description-${index}`}
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label>Estimated Effort (1-10)</Label>
                            <Input
                              type="number"
                              min="1"
                              max="10"
                              value={option.estimatedEffort}
                              onChange={(e) => updateOption(index, 'estimatedEffort', parseInt(e.target.value) || 5)}
                              className="mt-1"
                              data-testid={`input-effort-${index}`}
                            />
                          </div>
                          <div>
                            <Label>Risk Level</Label>
                            <select
                              value={option.riskLevel}
                              onChange={(e) => updateOption(index, 'riskLevel', e.target.value)}
                              className="mt-1 w-full p-2 border rounded-md bg-background"
                              data-testid={`select-risk-${index}`}
                            >
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                            </select>
                          </div>
                          <div>
                            <Label>Time Horizon</Label>
                            <select
                              value={option.timeHorizon}
                              onChange={(e) => updateOption(index, 'timeHorizon', e.target.value)}
                              className="mt-1 w-full p-2 border rounded-md bg-background"
                              data-testid={`select-horizon-${index}`}
                            >
                              <option value="immediate">Immediate</option>
                              <option value="short-term">Short-term</option>
                              <option value="medium-term">Medium-term</option>
                              <option value="long-term">Long-term</option>
                              <option value="generational">Generational</option>
                            </select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button 
              onClick={processDecision} 
              disabled={processDecisionMutation.isPending || !context.trim() || options.length === 0}
              size="lg"
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              data-testid="button-process-decision"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              {processDecisionMutation.isPending ? 'Processing...' : 'Analyze Decision'}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {processDecisionMutation.isPending && (
            <div className="text-center py-12">
              <div className="inline-flex items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span>Processing multiscale decision analysis...</span>
              </div>
            </div>
          )}

          {lastDecisionResult ? (
            <div className="space-y-6">
              <div className="border-l-4 border-gradient-cosmic pl-6">
                <h3 className="text-lg font-semibold">Decision Context</h3>
                <p className="text-muted-foreground">{lastDecisionResult.context}</p>
              </div>

              {renderMultiscaleAnalysis(lastDecisionResult)}
              {renderCascadingEffects(lastDecisionResult.cascadingEffects)}
              {renderRecommendation(lastDecisionResult.recommendation)}

              {lastDecisionResult.metaInsights && lastDecisionResult.metaInsights.length > 0 && (
                <Card className="border-yellow-500/30 bg-yellow-500/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-yellow-300">
                      <Lightbulb className="w-5 h-5" />
                      Meta-Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {lastDecisionResult.metaInsights.map((insight: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-2">
                          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 mt-2 flex-shrink-0" />
                          <span className="text-sm">{insight}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <BarChart3 className="w-12 h-12 mx-auto mb-4" />
              <p>No analysis results yet</p>
              <p className="text-sm">Process a decision to see multiscale analysis</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Decision Synthesis History</CardTitle>
              <CardDescription>
                Previous multiscale analyses and their outcomes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingSyntheses ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" data-testid={`skeleton-synthesis-${i}`} />
                  ))}
                </div>
              ) : (decisionSyntheses as any[])?.length > 0 ? (
                <div className="space-y-4">
                  {(decisionSyntheses as any[]).map((synthesis: any, idx: number) => (
                    <Card key={synthesis.id || idx} className="border-dashed" data-testid={`synthesis-${idx}`}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium">{synthesis.context}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {synthesis.optionsAnalyzed} options analyzed • {synthesis.recommendedOption}
                            </p>
                          </div>
                          <Badge>{synthesis.confidence}% confidence</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <TreePine className="w-8 h-8 mx-auto mb-2" />
                  <p>No decision history yet</p>
                  <p className="text-sm">Processed decisions will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Decision Archetypes</CardTitle>
              <CardDescription>
                Common decision patterns recognized by the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingArchetypes ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-24 w-full" data-testid={`skeleton-archetype-${i}`} />
                  ))}
                </div>
              ) : (decisionArchetypes as any[])?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(decisionArchetypes as any[]).map((archetype: any, idx: number) => (
                    <Card key={archetype.id || idx} className="border-dashed" data-testid={`archetype-${idx}`}>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3 mb-2">
                          <Network className="w-5 h-5 text-primary" />
                          <h4 className="font-medium">{archetype.name}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">{archetype.description}</p>
                        <div className="flex items-center gap-2 mt-3">
                          <Badge variant="secondary">{archetype.frequency} occurrences</Badge>
                          <Badge variant="outline">{archetype.averageConfidence}% avg confidence</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Network className="w-8 h-8 mx-auto mb-2" />
                  <p>No decision archetypes identified yet</p>
                  <p className="text-sm">Patterns will emerge with more decision processing</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};