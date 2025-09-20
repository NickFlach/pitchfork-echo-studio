import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TreePine, TrendingUp, RotateCcw, CheckCircle, AlertCircle, Lightbulb, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { LearningCycle } from '../../../shared/schema';

interface LearningEvolutionMapProps {
  data?: LearningCycle[];
  isLoading?: boolean;
  compact?: boolean;
}

export const LearningEvolutionMap = ({ data, isLoading, compact = false }: LearningEvolutionMapProps) => {
  const [selectedCycle, setSelectedCycle] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'timeline' | 'network' | 'evolution'>('timeline');

  if (isLoading) {
    return (
      <div className="space-y-4" data-testid="learning-evolution-loading">
        {Array.from({ length: compact ? 3 : 5 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground" data-testid="learning-evolution-empty">
        <TreePine className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No learning cycle data available</p>
      </div>
    );
  }

  const getCycleTypeColor = (type: string) => {
    const colors = {
      'adaptive': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      'corrective': 'bg-red-500/20 text-red-300 border-red-500/30',
      'exploratory': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      'integrative': 'bg-green-500/20 text-green-300 border-green-500/30',
      'emergent': 'bg-pink-500/20 text-pink-300 border-pink-500/30'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      'active': <RotateCcw className="w-4 h-4 text-blue-400 animate-spin" />,
      'completed': <CheckCircle className="w-4 h-4 text-green-400" />,
      'suspended': <AlertCircle className="w-4 h-4 text-yellow-400" />,
      'evolved': <Lightbulb className="w-4 h-4 text-purple-400" />
    };
    return icons[status as keyof typeof icons] || <AlertCircle className="w-4 h-4 text-gray-400" />;
  };

  // Calculate learning metrics
  const learningMetrics = {
    totalCycles: data.length,
    activeCycles: data.filter(c => c.status === 'active').length,
    completedCycles: data.filter(c => c.status === 'completed').length,
    totalExperiments: data.reduce((sum, c) => sum + c.experimentation.length, 0),
    totalObservations: data.reduce((sum, c) => sum + c.observations.length, 0),
    totalCorrections: data.reduce((sum, c) => sum + c.corrections.length, 0),
    totalInsights: data.reduce((sum, c) => sum + c.emergentInsights.length, 0),
    avgIterations: data.length > 0 ? data.reduce((sum, c) => sum + c.iterationCount, 0) / data.length : 0
  };

  const displayData = compact ? data.slice(0, 3) : data;

  return (
    <div className="space-y-6" data-testid="learning-evolution-map">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TreePine className="w-5 h-5" />
          <h3 className="text-lg font-semibold">
            Learning Evolution Map
          </h3>
          <Badge variant="outline" className="ml-2">
            {data.length} cycles
          </Badge>
        </div>
        
        {!compact && (
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'timeline' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('timeline')}
              data-testid="view-timeline"
            >
              Timeline
            </Button>
            <Button
              variant={viewMode === 'network' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('network')}
              data-testid="view-network"
            >
              Network
            </Button>
            <Button
              variant={viewMode === 'evolution' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('evolution')}
              data-testid="view-evolution"
            >
              Evolution
            </Button>
          </div>
        )}
      </div>

      {/* Learning Metrics Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
        <Card className="p-3 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <div className="flex items-center gap-2">
            <TreePine className="w-4 h-4 text-blue-300" />
            <div>
              <div className="text-lg font-bold" data-testid="total-cycles">
                {learningMetrics.totalCycles}
              </div>
              <div className="text-xs text-muted-foreground">Total Cycles</div>
            </div>
          </div>
        </Card>

        <Card className="p-3 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-300" />
            <div>
              <div className="text-lg font-bold" data-testid="completed-cycles">
                {learningMetrics.completedCycles}
              </div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
          </div>
        </Card>

        <Card className="p-3 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-purple-300" />
            <div>
              <div className="text-lg font-bold" data-testid="active-cycles">
                {learningMetrics.activeCycles}
              </div>
              <div className="text-xs text-muted-foreground">Active</div>
            </div>
          </div>
        </Card>

        <Card className="p-3 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-yellow-300" />
            <div>
              <div className="text-lg font-bold" data-testid="total-insights">
                {learningMetrics.totalInsights}
              </div>
              <div className="text-xs text-muted-foreground">Insights</div>
            </div>
          </div>
        </Card>

        <Card className="p-3 bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border-indigo-500/20">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-300" />
            <div>
              <div className="text-lg font-bold" data-testid="total-experiments">
                {learningMetrics.totalExperiments}
              </div>
              <div className="text-xs text-muted-foreground">Experiments</div>
            </div>
          </div>
        </Card>

        <Card className="p-3 bg-gradient-to-br from-cyan-500/10 to-teal-500/10 border-cyan-500/20">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-cyan-300" />
            <div>
              <div className="text-lg font-bold" data-testid="total-corrections">
                {learningMetrics.totalCorrections}
              </div>
              <div className="text-xs text-muted-foreground">Corrections</div>
            </div>
          </div>
        </Card>

        <Card className="p-3 bg-gradient-to-br from-red-500/10 to-rose-500/10 border-red-500/20">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-red-300" />
            <div>
              <div className="text-lg font-bold" data-testid="avg-iterations">
                {learningMetrics.avgIterations.toFixed(1)}
              </div>
              <div className="text-xs text-muted-foreground">Avg Iterations</div>
            </div>
          </div>
        </Card>

        <Card className="p-3 bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/20">
          <div className="flex items-center gap-2">
            <TreePine className="w-4 h-4 text-violet-300" />
            <div>
              <div className="text-lg font-bold" data-testid="total-observations">
                {learningMetrics.totalObservations}
              </div>
              <div className="text-xs text-muted-foreground">Observations</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Timeline View */}
      {viewMode === 'timeline' && (
        <ScrollArea className={compact ? "h-96" : "h-[600px]"}>
          <div className="space-y-4 pr-4">
            {displayData.map((cycle, index) => (
              <Card 
                key={cycle.id} 
                className={`border-l-4 ${
                  cycle.status === 'active' ? 'border-l-blue-500/50' :
                  cycle.status === 'completed' ? 'border-l-green-500/50' :
                  cycle.status === 'evolved' ? 'border-l-purple-500/50' :
                  'border-l-yellow-500/50'
                } cursor-pointer transition-all hover:shadow-lg`}
                onClick={() => setSelectedCycle(selectedCycle === cycle.id ? null : cycle.id)}
                data-testid={`learning-cycle-${index}`}
              >
                <CardContent className="p-4 space-y-4">
                  {/* Cycle Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {getStatusIcon(cycle.status)}
                      <Badge className={getCycleTypeColor(cycle.cycleType)}>
                        {cycle.cycleType.toUpperCase()}
                      </Badge>
                      <Badge variant="outline">
                        Iteration {cycle.iterationCount}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(cycle.startedAt).toLocaleString()}
                      {cycle.completedAt && (
                        <div>
                          Completed: {new Date(cycle.completedAt).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Trigger Event */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Trigger Event</h4>
                    <p className="text-sm text-muted-foreground bg-muted/30 p-2 rounded" data-testid={`trigger-${index}`}>
                      {cycle.triggerEvent}
                    </p>
                  </div>

                  {/* Hypothesis */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Initial Hypothesis</h4>
                    <p className="text-sm bg-blue-500/10 border border-blue-500/20 rounded p-2" data-testid={`hypothesis-${index}`}>
                      {cycle.hypothesis}
                    </p>
                  </div>

                  {selectedCycle === cycle.id && !compact && (
                    <>
                      {/* Experimentation */}
                      {cycle.experimentation.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="font-medium text-sm flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            Experimentation ({cycle.experimentation.length})
                          </h4>
                          <div className="space-y-2">
                            {cycle.experimentation.slice(0, 3).map((experiment, expIndex) => (
                              <div key={expIndex} className="p-3 bg-card border rounded-md space-y-2">
                                <div className="text-sm">
                                  <span className="font-medium">Action:</span> {experiment.action}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                                  <div className="p-2 bg-yellow-500/10 rounded">
                                    <span className="font-medium">Expected:</span> {experiment.expectedOutcome}
                                  </div>
                                  <div className={`p-2 rounded ${
                                    experiment.actualOutcome === experiment.expectedOutcome 
                                      ? 'bg-green-500/10' 
                                      : 'bg-red-500/10'
                                  }`}>
                                    <span className="font-medium">Actual:</span> {experiment.actualOutcome}
                                  </div>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {new Date(experiment.timestamp).toLocaleString()}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Observations */}
                      {cycle.observations.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="font-medium text-sm">Key Observations ({cycle.observations.length})</h4>
                          <div className="space-y-2">
                            {cycle.observations.slice(0, 4).map((obs, obsIndex) => (
                              <div key={obsIndex} className="p-2 bg-muted/30 border rounded text-sm">
                                <div className="flex items-center justify-between mb-1">
                                  <Badge variant="outline" className="text-xs capitalize">
                                    {obs.patternType}
                                  </Badge>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">
                                      Significance: {(obs.significance * 100).toFixed(0)}%
                                    </span>
                                    <Progress value={obs.significance * 100} className="w-16 h-1" />
                                  </div>
                                </div>
                                <p className="text-muted-foreground">{obs.observation}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Model Updates */}
                      {cycle.modelUpdates.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="font-medium text-sm">Model Updates ({cycle.modelUpdates.length})</h4>
                          <div className="space-y-2">
                            {cycle.modelUpdates.slice(0, 2).map((update, updateIndex) => (
                              <div key={updateIndex} className="p-3 bg-gradient-to-r from-purple-500/5 to-pink-500/5 border border-purple-500/20 rounded">
                                <div className="flex items-center gap-2 mb-2">
                                  <ArrowRight className="w-4 h-4 text-purple-300" />
                                  <span className="text-xs text-purple-300">
                                    Confidence: {(update.confidence * 100).toFixed(0)}%
                                  </span>
                                </div>
                                <div className="space-y-2 text-sm">
                                  <div>
                                    <span className="font-medium text-red-300">Previous:</span> {update.previousModel}
                                  </div>
                                  <div>
                                    <span className="font-medium text-green-300">New:</span> {update.newModel}
                                  </div>
                                  {update.validationTests.length > 0 && (
                                    <div className="text-xs text-muted-foreground">
                                      <span className="font-medium">Validation tests:</span> {update.validationTests.join(', ')}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Corrections */}
                      {cycle.corrections.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="font-medium text-sm">Corrections Applied ({cycle.corrections.length})</h4>
                          <div className="space-y-2">
                            {cycle.corrections.slice(0, 3).map((correction, corrIndex) => (
                              <div key={corrIndex} className="p-3 bg-red-500/5 border border-red-500/20 rounded space-y-2">
                                <div>
                                  <span className="font-medium text-red-300">Error type:</span> {correction.errorType}
                                </div>
                                <div>
                                  <span className="font-medium">Correction:</span> {correction.correction}
                                </div>
                                {correction.preventativeMeasures.length > 0 && (
                                  <div className="text-xs">
                                    <span className="font-medium">Prevention:</span> {correction.preventativeMeasures.join(', ')}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Feedback Loops */}
                      {cycle.feedbackLoops.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="font-medium text-sm">Feedback Loops ({cycle.feedbackLoops.length})</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {cycle.feedbackLoops.slice(0, 4).map((feedback, fbIndex) => (
                              <div key={fbIndex} className="p-2 bg-cyan-500/5 border border-cyan-500/20 rounded text-sm">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="font-medium text-cyan-300">{feedback.source}</span>
                                  <span className="text-xs">Impact: {(feedback.impact * 100).toFixed(0)}%</span>
                                </div>
                                <p className="text-xs text-muted-foreground mb-1">{feedback.feedback}</p>
                                <p className="text-xs"><span className="font-medium">Integration:</span> {feedback.integration}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Emergent Insights */}
                      {cycle.emergentInsights.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm flex items-center gap-2">
                            <Lightbulb className="w-4 h-4" />
                            Emergent Insights ({cycle.emergentInsights.length})
                          </h4>
                          <div className="space-y-1">
                            {cycle.emergentInsights.slice(0, 3).map((insight, insightIndex) => (
                              <div key={insightIndex} className="text-sm bg-yellow-500/10 text-yellow-300 p-2 rounded border border-yellow-500/20">
                                💡 {insight}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Cross-Cycle Connections */}
                      {cycle.crossCycleConnections.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">Cross-Cycle Connections</h4>
                          <div className="flex flex-wrap gap-1">
                            {cycle.crossCycleConnections.map((connection, connIndex) => (
                              <Badge 
                                key={connIndex} 
                                variant="outline" 
                                className="text-xs cursor-pointer hover:bg-purple-500/20"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedCycle(connection);
                                }}
                              >
                                {connection.substring(0, 8)}...
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Cycle Progress */}
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span>Learning Progress</span>
                      <span className="font-mono">
                        {cycle.status === 'completed' ? '100%' : 
                         cycle.status === 'active' ? '75%' : 
                         cycle.status === 'evolved' ? '100%' : '50%'}
                      </span>
                    </div>
                    <Progress 
                      value={cycle.status === 'completed' ? 100 : 
                             cycle.status === 'active' ? 75 : 
                             cycle.status === 'evolved' ? 100 : 50} 
                      className="h-2 mt-1"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}

      {/* Network View */}
      {viewMode === 'network' && !compact && (
        <div className="space-y-4">
          <div className="text-center text-muted-foreground">
            <TreePine className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Learning cycle network visualization</p>
            <p className="text-sm">Interconnected learning processes and feedback loops</p>
          </div>
        </div>
      )}

      {/* Evolution View */}
      {viewMode === 'evolution' && !compact && (
        <div className="space-y-4">
          <div className="text-center text-muted-foreground">
            <Lightbulb className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Learning evolution trajectory</p>
            <p className="text-sm">Model evolution and knowledge advancement over time</p>
          </div>
        </div>
      )}
    </div>
  );
};