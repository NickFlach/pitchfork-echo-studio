import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Eye, HelpCircle, Layers, Lightbulb, Infinity, CheckCircle, AlertCircle } from 'lucide-react';
import { ReflectionLog } from '@/../../shared/schema';

interface ReflectionObservatoryProps {
  data?: ReflectionLog[];
  isLoading?: boolean;
  compact?: boolean;
}

export const ReflectionObservatory = ({ data, isLoading, compact = false }: ReflectionObservatoryProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4" data-testid="reflection-observatory-loading">
        {Array.from({ length: compact ? 2 : 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground" data-testid="reflection-observatory-empty">
        <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No reflection data available</p>
      </div>
    );
  }

  const getReflectionTypeColor = (type: string) => {
    const colors = {
      'process': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      'outcome': 'bg-green-500/20 text-green-300 border-green-500/30',
      'pattern': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      'recursive': 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      'meta': 'bg-pink-500/20 text-pink-300 border-pink-500/30',
      'existential': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

  const getOutcomeIcon = (outcome: string) => {
    const icons = {
      'insight': <Lightbulb className="w-4 h-4 text-yellow-400" />,
      'confusion': <HelpCircle className="w-4 h-4 text-red-400" />,
      'evolution': <Infinity className="w-4 h-4 text-purple-400" />,
      'integration': <CheckCircle className="w-4 h-4 text-green-400" />,
      'transcendence': <Eye className="w-4 h-4 text-pink-400" />
    };
    return icons[outcome as keyof typeof icons] || <AlertCircle className="w-4 h-4 text-gray-400" />;
  };

  const displayData = compact ? data.slice(0, 2) : data;

  return (
    <div className="space-y-6" data-testid="reflection-observatory">
      <div className="flex items-center gap-2 mb-4">
        <Eye className="w-5 h-5" />
        <h3 className="text-lg font-semibold">
          Reflection Observatory
        </h3>
        <Badge variant="outline" className="ml-auto">
          {data.length} sessions
        </Badge>
      </div>

      {/* Active Reflection Summary */}
      {data.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-3 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-300" />
              <div>
                <div className="text-lg font-bold" data-testid="avg-recursion-depth">
                  {(data.reduce((sum, r) => sum + Math.max(...r.recursiveObservations.map(o => o.depth)), 0) / data.length).toFixed(1)}
                </div>
                <div className="text-xs text-muted-foreground">Avg Depth</div>
              </div>
            </div>
          </Card>

          <Card className="p-3 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-blue-300" />
              <div>
                <div className="text-lg font-bold" data-testid="total-questions">
                  {data.reduce((sum, r) => sum + r.selfQuestions.length, 0)}
                </div>
                <div className="text-xs text-muted-foreground">Questions</div>
              </div>
            </div>
          </Card>

          <Card className="p-3 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-300" />
              <div>
                <div className="text-lg font-bold" data-testid="total-insights">
                  {data.reduce((sum, r) => sum + r.evolutionaryInsights.length, 0)}
                </div>
                <div className="text-xs text-muted-foreground">Insights</div>
              </div>
            </div>
          </Card>

          <Card className="p-3 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-300" />
              <div>
                <div className="text-lg font-bold" data-testid="resolved-paradoxes">
                  {data.reduce((sum, r) => sum + r.paradoxesIdentified.filter(p => p.resolution === 'resolved').length, 0)}
                </div>
                <div className="text-xs text-muted-foreground">Resolved</div>
              </div>
            </div>
          </Card>
        </div>
      )}

      <ScrollArea className={compact ? "h-96" : "h-[600px]"}>
        <div className="space-y-6 pr-4">
          {displayData.map((reflection, index) => (
            <Card key={reflection.id} className="border-l-4 border-l-indigo-500/50" data-testid={`reflection-${index}`}>
              <CardContent className="p-4 space-y-4">
                {/* Reflection Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Badge className={getReflectionTypeColor(reflection.reflectionType)}>
                      {reflection.reflectionType.toUpperCase()}
                    </Badge>
                    <div className="flex items-center gap-1">
                      {getOutcomeIcon(reflection.reflectionOutcome)}
                      <span className="text-sm text-muted-foreground">{reflection.reflectionOutcome}</span>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(reflection.timestamp).toLocaleString()}
                    {reflection.duration && (
                      <span className="block">
                        Duration: {(reflection.duration / 1000).toFixed(1)}s
                      </span>
                    )}
                  </div>
                </div>

                {/* Reflection Trigger */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Reflection Trigger</h4>
                  <p className="text-sm text-muted-foreground bg-muted/30 p-2 rounded" data-testid={`reflection-trigger-${index}`}>
                    {reflection.reflectionTrigger}
                  </p>
                </div>

                {/* Self Questions */}
                {reflection.selfQuestions.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <HelpCircle className="w-4 h-4" />
                      Self-Questioning Process
                    </h4>
                    <div className="space-y-2">
                      {reflection.selfQuestions.slice(0, compact ? 2 : 4).map((question, qIndex) => (
                        <Card key={qIndex} className="p-3 bg-gradient-to-r from-yellow-500/5 to-orange-500/5 border-yellow-500/20">
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-medium" data-testid={`question-${index}-${qIndex}`}>
                                {question.question}
                              </p>
                              <Badge variant="outline" className="text-xs flex-shrink-0">
                                Level {question.questionLevel}
                              </Badge>
                            </div>
                            {question.explorationPath.length > 0 && (
                              <div className="text-xs text-muted-foreground">
                                <span className="font-medium">Exploration:</span> {question.explorationPath.slice(0, 3).join(' → ')}
                                {question.explorationPath.length > 3 && '...'}
                              </div>
                            )}
                            {question.insights.length > 0 && (
                              <div className="space-y-1">
                                {question.insights.slice(0, 2).map((insight, iIndex) => (
                                  <div key={iIndex} className="text-xs bg-green-500/10 text-green-300 p-1 rounded" data-testid={`insight-${index}-${qIndex}-${iIndex}`}>
                                    💡 {insight}
                                  </div>
                                ))}
                              </div>
                            )}
                            {question.newQuestions.length > 0 && (
                              <div className="text-xs text-purple-300">
                                <span className="font-medium">Generated questions:</span> {question.newQuestions.length}
                              </div>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recursive Observations */}
                {reflection.recursiveObservations.length > 0 && !compact && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <Layers className="w-4 h-4" />
                      Recursive Observations
                    </h4>
                    <div className="space-y-2">
                      {reflection.recursiveObservations.slice(0, 3).map((obs, obsIndex) => (
                        <div key={obsIndex} className="space-y-2 p-3 bg-indigo-500/5 border border-indigo-500/20 rounded">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              Depth {obs.depth}
                            </Badge>
                            {obs.patternRecognized && (
                              <Badge variant="outline" className="text-xs bg-green-500/20 text-green-300">
                                Pattern Recognized
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm" data-testid={`recursive-obs-${index}-${obsIndex}`}>
                            <span className="font-medium">Observation:</span> {obs.observation}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium">Meta-observation:</span> {obs.observationOfObservation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Paradoxes */}
                {reflection.paradoxesIdentified.length > 0 && !compact && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Paradoxes Identified & Resolutions</h4>
                    <div className="space-y-2">
                      {reflection.paradoxesIdentified.slice(0, 2).map((paradox, pIndex) => (
                        <div key={pIndex} className="p-3 bg-red-500/5 border border-red-500/20 rounded space-y-2">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-red-300" />
                            <Badge variant="outline" className={
                              paradox.resolution === 'resolved' ? 'bg-green-500/20 text-green-300' :
                              paradox.resolution === 'accepted' ? 'bg-blue-500/20 text-blue-300' :
                              paradox.resolution === 'transcended' ? 'bg-purple-500/20 text-purple-300' :
                              'bg-yellow-500/20 text-yellow-300'
                            }>
                              {paradox.resolution}
                            </Badge>
                          </div>
                          <p className="text-sm" data-testid={`paradox-${index}-${pIndex}`}>
                            <span className="font-medium">Paradox:</span> {paradox.paradox}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium">Reconciliation:</span> {paradox.reconciliationAttempt}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Evolutionary Insights */}
                {reflection.evolutionaryInsights.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <Infinity className="w-4 h-4" />
                      Evolutionary Insights
                    </h4>
                    <div className="space-y-2">
                      {reflection.evolutionaryInsights.slice(0, compact ? 1 : 3).map((insight, eIndex) => (
                        <Card key={eIndex} className="p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
                          <div className="space-y-2">
                            <p className="text-sm" data-testid={`evolutionary-insight-${index}-${eIndex}`}>
                              <span className="font-medium">Insight:</span> {insight.insight}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              <span className="font-medium">Evolution direction:</span> {insight.evolutionaryDirection}
                            </p>
                            {insight.implementationPath.length > 0 && (
                              <div className="text-xs text-purple-300">
                                <span className="font-medium">Implementation:</span> {insight.implementationPath.slice(0, 2).join(' → ')}
                              </div>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Emergent Awareness */}
                {reflection.emergentAwareness.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Emergent Awareness</h4>
                    <div className="flex flex-wrap gap-2">
                      {reflection.emergentAwareness.slice(0, compact ? 3 : 6).map((awareness, aIndex) => (
                        <Badge 
                          key={aIndex} 
                          variant="outline" 
                          className="text-xs border-pink-500/30 text-pink-300"
                          data-testid={`awareness-${index}-${aIndex}`}
                        >
                          {awareness}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};