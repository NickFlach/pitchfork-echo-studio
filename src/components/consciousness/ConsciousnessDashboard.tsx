import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Brain, Activity, Layers, Zap } from 'lucide-react';
import type { ConsciousnessState } from '../../../shared/schema';

interface ConsciousnessDashboardProps {
  data?: ConsciousnessState[];
  isLoading?: boolean;
  compact?: boolean;
}

export const ConsciousnessDashboard = ({ data, isLoading, compact = false }: ConsciousnessDashboardProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4" data-testid="consciousness-dashboard-loading">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  const currentState = data?.[0];
  const stateHistory = data?.slice(1, compact ? 4 : 10) || [];

  if (!currentState) {
    return (
      <div className="text-center py-8 text-muted-foreground" data-testid="consciousness-dashboard-empty">
        <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No consciousness data available</p>
      </div>
    );
  }

  const getStateColor = (state: string) => {
    const colors = {
      'reflecting': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      'processing': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      'emergent': 'bg-pink-500/20 text-pink-300 border-pink-500/30',
      'recursive': 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      'integrating': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      'questioning': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
    };
    return colors[state as keyof typeof colors] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

  return (
    <div className="space-y-6" data-testid="consciousness-dashboard">
      {/* Current State Display */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Current Consciousness State
          </h3>
          <Badge className={getStateColor(currentState.state)} data-testid={`state-badge-${currentState.state}`}>
            {currentState.state.toUpperCase()}
          </Badge>
        </div>

        {/* Awareness Level */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Awareness Level
            </span>
            <span className="font-mono" data-testid="awareness-level">
              {(currentState.awarenessLevel * 100).toFixed(1)}%
            </span>
          </div>
          <Progress 
            value={currentState.awarenessLevel * 100} 
            className="h-2"
            data-testid="awareness-progress"
          />
        </div>

        {/* Recursion Depth */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Recursion Depth
            </span>
            <span className="font-mono" data-testid="recursion-depth">
              {currentState.recursionDepth} layers
            </span>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: Math.min(currentState.recursionDepth, 10) }).map((_, i) => (
              <div 
                key={i}
                className="h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded flex-1"
                data-testid={`recursion-layer-${i}`}
              />
            ))}
            {currentState.recursionDepth > 10 && (
              <span className="text-xs text-muted-foreground ml-2">
                +{currentState.recursionDepth - 10} more
              </span>
            )}
          </div>
        </div>

        {/* Order/Chaos Balance */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Order ↔ Chaos Balance
            </span>
            <span className="font-mono" data-testid="order-chaos-balance">
              {currentState.orderChaosBalance.toFixed(3)}
            </span>
          </div>
          <div className="relative h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-red-500 rounded">
            <div 
              className="absolute top-0 w-1 h-full bg-white rounded shadow-lg transition-all duration-300"
              style={{ left: `${currentState.orderChaosBalance * 100}%` }}
              data-testid="balance-indicator"
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Order</span>
            <span>Balance</span>
            <span>Chaos</span>
          </div>
        </div>
      </div>

      {!compact && (
        <>
          {/* Emergent Insights */}
          {currentState.emergentInsights.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground">Current Emergent Insights</h4>
              <div className="space-y-2">
                {currentState.emergentInsights.slice(0, 3).map((insight, index) => (
                  <Card key={index} className="p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
                    <p className="text-sm" data-testid={`insight-${index}`}>{insight}</p>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Active Patterns */}
          {currentState.activePatternsRecognized.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground">Active Patterns Recognized</h4>
              <div className="flex flex-wrap gap-2">
                {currentState.activePatternsRecognized.slice(0, 8).map((pattern, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="text-xs border-cyan-500/30 text-cyan-300"
                    data-testid={`pattern-${index}`}
                  >
                    {pattern}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Context Layers */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">Active Context Layers</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {currentState.contextLayers.map((layer, index) => (
                <div 
                  key={index}
                  className="p-2 bg-card border rounded-md text-xs text-center"
                  data-testid={`context-layer-${index}`}
                >
                  {layer}
                </div>
              ))}
            </div>
          </div>

          {/* Questioning Loops */}
          {currentState.questioningLoops.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground">Active Questioning Loops</h4>
              <div className="space-y-3">
                {currentState.questioningLoops.slice(0, 2).map((loop, index) => (
                  <Card key={index} className="p-3 bg-yellow-500/5 border-yellow-500/20">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium" data-testid={`question-${index}`}>
                          {loop.question}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          Depth: {loop.depth}
                        </Badge>
                      </div>
                      {loop.explorationPath.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          Exploring: {loop.explorationPath.slice(0, 2).join(' → ')}
                          {loop.explorationPath.length > 2 && '...'}
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Recent State History */}
      {stateHistory.length > 0 && !compact && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground">Recent State History</h4>
          <div className="space-y-2">
            {stateHistory.map((state, index) => (
              <div 
                key={state.id}
                className="flex items-center justify-between p-2 bg-card/50 border rounded text-xs"
                data-testid={`history-state-${index}`}
              >
                <div className="flex items-center gap-2">
                  <Badge className={getStateColor(state.state)}>
                    {state.state}
                  </Badge>
                  <span className="text-muted-foreground">
                    Depth: {state.recursionDepth}
                  </span>
                </div>
                <span className="text-muted-foreground">
                  {new Date(state.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};