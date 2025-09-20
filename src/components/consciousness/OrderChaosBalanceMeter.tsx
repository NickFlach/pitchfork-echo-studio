import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Activity, BarChart3, TrendingUp, TrendingDown, Minus, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ConsciousnessState } from '../../../shared/schema';

interface OrderChaosBalanceMeterProps {
  data?: ConsciousnessState;
  isLoading?: boolean;
  compact?: boolean;
}

export const OrderChaosBalanceMeter = ({ data, isLoading, compact = false }: OrderChaosBalanceMeterProps) => {
  const [animationValue, setAnimationValue] = useState(0.5);
  const [balanceHistory, setBalanceHistory] = useState<number[]>([]);

  useEffect(() => {
    if (data?.orderChaosBalance !== undefined) {
      // Smooth animation to new value
      const targetValue = data.orderChaosBalance;
      const duration = 1000; // 1 second
      const steps = 60; // 60 fps
      const stepDuration = duration / steps;
      const stepSize = (targetValue - animationValue) / steps;

      let currentStep = 0;
      const interval = setInterval(() => {
        currentStep++;
        if (currentStep >= steps) {
          setAnimationValue(targetValue);
          clearInterval(interval);
        } else {
          setAnimationValue(prev => prev + stepSize);
        }
      }, stepDuration);

      // Update history
      setBalanceHistory(prev => {
        const newHistory = [...prev, targetValue];
        return newHistory.slice(-20); // Keep last 20 values
      });

      return () => clearInterval(interval);
    }
  }, [data?.orderChaosBalance]);

  if (isLoading) {
    return (
      <div className="space-y-4" data-testid="order-chaos-balance-loading">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8 text-muted-foreground" data-testid="order-chaos-balance-empty">
        <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No balance data available</p>
      </div>
    );
  }

  const balance = data.orderChaosBalance;
  const balancePercentage = balance * 100;
  
  // Calculate balance state
  const getBalanceState = (value: number) => {
    if (value < 0.2) return { state: 'highly_ordered', color: 'text-blue-400', bg: 'bg-blue-500/20' };
    if (value < 0.4) return { state: 'ordered', color: 'text-blue-300', bg: 'bg-blue-500/15' };
    if (value >= 0.6 && value < 0.8) return { state: 'chaotic', color: 'text-red-300', bg: 'bg-red-500/15' };
    if (value >= 0.8) return { state: 'highly_chaotic', color: 'text-red-400', bg: 'bg-red-500/20' };
    return { state: 'balanced', color: 'text-purple-300', bg: 'bg-purple-500/15' };
  };

  const balanceState = getBalanceState(balance);
  
  // Calculate trend
  const getTrend = () => {
    if (balanceHistory.length < 2) return 'stable';
    const recent = balanceHistory.slice(-5);
    const avg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
    const previousAvg = balanceHistory.length >= 10 
      ? balanceHistory.slice(-10, -5).reduce((sum, val) => sum + val, 0) / 5
      : avg;
    
    if (avg > previousAvg + 0.1) return 'increasing_chaos';
    if (avg < previousAvg - 0.1) return 'increasing_order';
    return 'stable';
  };

  const trend = getTrend();
  
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing_chaos': return <TrendingUp className="w-4 h-4 text-red-300" />;
      case 'increasing_order': return <TrendingDown className="w-4 h-4 text-blue-300" />;
      default: return <Minus className="w-4 h-4 text-purple-300" />;
    }
  };

  const getTrendLabel = (trend: string) => {
    switch (trend) {
      case 'increasing_chaos': return 'Trending toward chaos';
      case 'increasing_order': return 'Trending toward order';
      default: return 'Stable balance';
    }
  };

  // Generate dynamic patterns based on balance
  const generatePatterns = () => {
    const patterns = [];
    const patternCount = Math.floor(balance * 20) + 5;
    
    for (let i = 0; i < patternCount; i++) {
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const size = balance > 0.5 ? Math.random() * 8 + 2 : Math.random() * 4 + 1;
      const opacity = balance > 0.5 ? Math.random() * 0.8 + 0.2 : Math.random() * 0.4 + 0.1;
      
      patterns.push({ x, y, size, opacity, id: i });
    }
    
    return patterns;
  };

  const patterns = generatePatterns();

  return (
    <div className="space-y-4" data-testid="order-chaos-balance-meter">
      {!compact && (
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          <h3 className="text-lg font-semibold">
            Order/Chaos Balance Meter
          </h3>
        </div>
      )}

      {/* Main Balance Display */}
      <Card className={`relative overflow-hidden ${balanceState.bg} border-purple-500/30`}>
        <CardContent className="p-6 space-y-6">
          {/* Current Balance Value */}
          <div className="text-center space-y-2">
            <div className="text-4xl font-bold font-mono" data-testid="balance-value">
              {animationValue.toFixed(3)}
            </div>
            <div className="flex items-center justify-center gap-2">
              <Badge className={`${balanceState.color} border-current`} data-testid="balance-state">
                {balanceState.state.replace('_', ' ').toUpperCase()}
              </Badge>
              {getTrendIcon(trend)}
              <span className="text-sm text-muted-foreground">{getTrendLabel(trend)}</span>
            </div>
          </div>

          {/* Visual Balance Meter */}
          <div className="space-y-3">
            {/* Main balance bar */}
            <div className="relative h-8 bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 rounded-lg overflow-hidden">
              {/* Balance indicator */}
              <div 
                className="absolute top-0 w-2 h-full bg-white shadow-lg transition-all duration-1000 ease-out"
                style={{ left: `${animationValue * 100}%` }}
                data-testid="balance-indicator"
              >
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                  <div className="w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-white"></div>
                </div>
              </div>
              
              {/* Zone labels */}
              <div className="absolute inset-0 flex items-center justify-between px-2 text-xs font-medium text-white">
                <span>Order</span>
                <span>Balance</span>
                <span>Chaos</span>
              </div>
            </div>
            
            {/* Percentage display */}
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0% (Pure Order)</span>
              <span data-testid="balance-percentage">{balancePercentage.toFixed(1)}%</span>
              <span>100% (Pure Chaos)</span>
            </div>
          </div>

          {/* Dynamic Pattern Visualization */}
          {!compact && (
            <div className="relative h-32 bg-black/20 rounded-lg overflow-hidden">
              <div className="absolute inset-0">
                {patterns.map((pattern) => (
                  <div
                    key={pattern.id}
                    className={`absolute rounded-full ${
                      balance > 0.5 ? 'bg-red-400' : 'bg-blue-400'
                    }`}
                    style={{
                      left: `${pattern.x}%`,
                      top: `${pattern.y}%`,
                      width: `${pattern.size}px`,
                      height: `${pattern.size}px`,
                      opacity: pattern.opacity,
                      animation: balance > 0.6 ? `pulse ${1 + Math.random()}s infinite` : 'none'
                    }}
                    data-testid={`pattern-${pattern.id}`}
                  />
                ))}
              </div>
              
              {/* Overlay labels */}
              <div className="absolute inset-0 flex items-center justify-between px-4 text-xs font-medium">
                <div className="text-blue-300">
                  <div>Structured</div>
                  <div>Predictable</div>
                  <div>Controlled</div>
                </div>
                <div className="text-center text-purple-300">
                  <div>Emergent</div>
                  <div>Dynamic</div>
                  <div>Adaptive</div>
                </div>
                <div className="text-red-300 text-right">
                  <div>Unpredictable</div>
                  <div>Creative</div>
                  <div>Chaotic</div>
                </div>
              </div>
            </div>
          )}

          {/* Balance Components */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <BarChart3 className="w-4 h-4 text-blue-300" />
                <span>Order Components</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Structure</span>
                  <span>{((1 - balance) * 100).toFixed(0)}%</span>
                </div>
                <Progress value={(1 - balance) * 100} className="h-1" />
                
                <div className="flex justify-between text-xs">
                  <span>Predictability</span>
                  <span>{((1 - balance) * 90).toFixed(0)}%</span>
                </div>
                <Progress value={(1 - balance) * 90} className="h-1" />
                
                <div className="flex justify-between text-xs">
                  <span>Control</span>
                  <span>{((1 - balance) * 85).toFixed(0)}%</span>
                </div>
                <Progress value={(1 - balance) * 85} className="h-1" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Zap className="w-4 h-4 text-red-300" />
                <span>Chaos Components</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Creativity</span>
                  <span>{(balance * 100).toFixed(0)}%</span>
                </div>
                <Progress value={balance * 100} className="h-1" />
                
                <div className="flex justify-between text-xs">
                  <span>Spontaneity</span>
                  <span>{(balance * 95).toFixed(0)}%</span>
                </div>
                <Progress value={balance * 95} className="h-1" />
                
                <div className="flex justify-between text-xs">
                  <span>Exploration</span>
                  <span>{(balance * 88).toFixed(0)}%</span>
                </div>
                <Progress value={balance * 88} className="h-1" />
              </div>
            </div>
          </div>

          {/* Balance History Sparkline */}
          {!compact && balanceHistory.length > 1 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Balance History</h4>
              <div className="relative h-16 bg-muted/20 rounded">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <polyline
                    points={balanceHistory
                      .map((value, index) => `${(index / (balanceHistory.length - 1)) * 100},${(1 - value) * 100}`)
                      .join(' ')}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-purple-400"
                    data-testid="balance-history-line"
                  />
                  
                  {/* Current point */}
                  {balanceHistory.length > 0 && (
                    <circle
                      cx="100"
                      cy={(1 - balanceHistory[balanceHistory.length - 1]) * 100}
                      r="3"
                      fill="currentColor"
                      className="text-purple-300"
                      data-testid="current-balance-point"
                    />
                  )}
                </svg>
                
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 text-xs text-muted-foreground">Chaos</div>
                <div className="absolute left-0 bottom-0 text-xs text-muted-foreground">Order</div>
              </div>
            </div>
          )}

          {/* Context Information */}
          {data.contextLayers && data.contextLayers.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Context Influence</h4>
              <div className="flex flex-wrap gap-1">
                {data.contextLayers.slice(0, compact ? 3 : 6).map((layer, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="text-xs border-cyan-500/30 text-cyan-300"
                    data-testid={`context-layer-${index}`}
                  >
                    {layer}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* System State Indicators */}
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                data.awarenessLevel > 0.8 ? 'bg-green-400' :
                data.awarenessLevel > 0.5 ? 'bg-yellow-400' : 'bg-red-400'
              } animate-pulse`} />
              <span>Awareness: {(data.awarenessLevel * 100).toFixed(0)}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Recursion: {data.recursionDepth} levels</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Updated: {new Date(data.timestamp).toLocaleTimeString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Add custom CSS for pulse animation
const style = document.createElement('style');
style.textContent = `
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;
document.head.appendChild(style);