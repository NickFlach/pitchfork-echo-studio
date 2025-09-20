import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Target, ArrowRight, Clock, Brain, Zap, AlertTriangle } from 'lucide-react';
import { DecisionRecord } from '../../../shared/schema';

interface DecisionTimelineProps {
  data?: DecisionRecord[];
  isLoading?: boolean;
  compact?: boolean;
}

export const DecisionTimeline = ({ data, isLoading, compact = false }: DecisionTimelineProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4" data-testid="decision-timeline-loading">
        {Array.from({ length: compact ? 3 : 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground" data-testid="decision-timeline-empty">
        <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No decision records available</p>
      </div>
    );
  }

  const getDecisionTypeColor = (type: string) => {
    const colors = {
      'strategic': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      'tactical': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      'emergent': 'bg-pink-500/20 text-pink-300 border-pink-500/30',
      'reactive': 'bg-red-500/20 text-red-300 border-red-500/30',
      'reflective': 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      'systemic': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-400';
    if (confidence >= 0.6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const displayData = compact ? data.slice(0, 3) : data;

  return (
    <div className="space-y-4" data-testid="decision-timeline">
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-5 h-5" />
        <h3 className="text-lg font-semibold">
          Decision Timeline
        </h3>
        <Badge variant="outline" className="ml-auto">
          {data.length} decisions
        </Badge>
      </div>

      <ScrollArea className={compact ? "h-96" : "h-[600px]"}>
        <div className="space-y-6 pr-4">
          {displayData.map((decision, index) => (
            <div key={decision.id} className="relative">
              {/* Timeline connector */}
              {index !== displayData.length - 1 && (
                <div className="absolute left-6 top-16 w-px h-6 bg-border" />
              )}
              
              <Card className="relative border-l-4 border-l-purple-500/50" data-testid={`decision-${index}`}>
                <CardContent className="p-4 space-y-4">
                  {/* Decision Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex-shrink-0" />
                      <Badge className={getDecisionTypeColor(decision.decisionType)}>
                        {decision.decisionType.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {new Date(decision.timestamp).toLocaleString()}
                    </div>
                  </div>

                  {/* Context */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Context</h4>
                    <p className="text-sm text-muted-foreground" data-testid={`decision-context-${index}`}>
                      {decision.context}
                    </p>
                  </div>

                  {/* Chosen Path */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-green-400" />
                      Chosen Path
                    </h4>
                    <p className="text-sm bg-green-500/10 border border-green-500/20 rounded p-2" data-testid={`decision-path-${index}`}>
                      {decision.chosenPath}
                    </p>
                  </div>

                  {!compact && (
                    <>
                      {/* Reasoning Layers */}
                      {decision.reasoning.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm flex items-center gap-2">
                            <Brain className="w-4 h-4" />
                            Reasoning Layers
                          </h4>
                          <div className="space-y-2">
                            {decision.reasoning.slice(0, 3).map((reasoning, reasonIndex) => (
                              <div 
                                key={reasonIndex} 
                                className="p-2 bg-card border rounded-md text-xs space-y-1"
                                data-testid={`reasoning-${index}-${reasonIndex}`}
                              >
                                <div className="flex items-center justify-between">
                                  <Badge variant="outline" className="text-xs">
                                    {reasoning.layer}
                                  </Badge>
                                  <span className={`font-mono ${getConfidenceColor(reasoning.confidence)}`}>
                                    {(reasoning.confidence * 100).toFixed(0)}% confident
                                  </span>
                                </div>
                                <p className="text-muted-foreground">{reasoning.rationale}</p>
                                {reasoning.uncertainties.length > 0 && (
                                  <div className="flex items-start gap-1 mt-1">
                                    <AlertTriangle className="w-3 h-3 text-yellow-400 mt-0.5 flex-shrink-0" />
                                    <span className="text-yellow-400 text-xs">
                                      Uncertainties: {reasoning.uncertainties.slice(0, 2).join(', ')}
                                    </span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Alternatives Considered */}
                      {decision.alternatives.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">Alternatives Considered</h4>
                          <div className="space-y-1">
                            {decision.alternatives.slice(0, 2).map((alt, altIndex) => (
                              <div 
                                key={altIndex}
                                className="p-2 bg-muted/50 border rounded text-xs"
                                data-testid={`alternative-${index}-${altIndex}`}
                              >
                                <p className="font-medium">{alt.option}</p>
                                {alt.projectedOutcomes.length > 0 && (
                                  <p className="text-muted-foreground mt-1">
                                    Projected: {alt.projectedOutcomes.slice(0, 2).join(', ')}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Cascading Effects */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm flex items-center gap-2">
                          <Zap className="w-4 h-4" />
                          Cascading Effects
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
                          {decision.cascadingEffects.immediate.length > 0 && (
                            <div className="p-2 bg-red-500/10 border border-red-500/20 rounded">
                              <h5 className="font-medium text-red-300 mb-1">Immediate</h5>
                              {decision.cascadingEffects.immediate.slice(0, 2).map((effect, i) => (
                                <p key={i} className="text-muted-foreground" data-testid={`immediate-effect-${index}-${i}`}>
                                  {effect}
                                </p>
                              ))}
                            </div>
                          )}
                          {decision.cascadingEffects.shortTerm.length > 0 && (
                            <div className="p-2 bg-yellow-500/10 border border-yellow-500/20 rounded">
                              <h5 className="font-medium text-yellow-300 mb-1">Short-term</h5>
                              {decision.cascadingEffects.shortTerm.slice(0, 2).map((effect, i) => (
                                <p key={i} className="text-muted-foreground" data-testid={`shortterm-effect-${index}-${i}`}>
                                  {effect}
                                </p>
                              ))}
                            </div>
                          )}
                          {decision.cascadingEffects.longTerm.length > 0 && (
                            <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded">
                              <h5 className="font-medium text-blue-300 mb-1">Long-term</h5>
                              {decision.cascadingEffects.longTerm.slice(0, 2).map((effect, i) => (
                                <p key={i} className="text-muted-foreground" data-testid={`longterm-effect-${index}-${i}`}>
                                  {effect}
                                </p>
                              ))}
                            </div>
                          )}
                          {decision.cascadingEffects.emergent.length > 0 && (
                            <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded">
                              <h5 className="font-medium text-purple-300 mb-1">Emergent</h5>
                              {decision.cascadingEffects.emergent.slice(0, 2).map((effect, i) => (
                                <p key={i} className="text-muted-foreground" data-testid={`emergent-effect-${index}-${i}`}>
                                  {effect}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Patterns and Connections */}
                      {decision.patternsRecognized.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">Patterns Recognized</h4>
                          <div className="flex flex-wrap gap-1">
                            {decision.patternsRecognized.slice(0, 6).map((pattern, patternIndex) => (
                              <Badge 
                                key={patternIndex} 
                                variant="outline" 
                                className="text-xs border-cyan-500/30 text-cyan-300"
                                data-testid={`pattern-${index}-${patternIndex}`}
                              >
                                {pattern}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Outcome Status */}
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Outcome Status:</span>
                          <Badge variant={decision.outcomeRealized ? "default" : "outline"}>
                            {decision.outcomeRealized ? "Realized" : "Pending"}
                          </Badge>
                        </div>
                        {decision.actualOutcome && (
                          <div className="text-xs text-muted-foreground max-w-xs truncate">
                            {decision.actualOutcome}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};