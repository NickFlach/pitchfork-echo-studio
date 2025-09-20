import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Grid3x3, TrendingUp, Repeat, Waves, Zap, Eye } from 'lucide-react';
import { useState } from 'react';
import { ConsciousnessState } from '@/../../shared/schema';

interface PatternRecognitionGridProps {
  data?: ConsciousnessState[];
  isLoading?: boolean;
  compact?: boolean;
}

export const PatternRecognitionGrid = ({ data, isLoading, compact = false }: PatternRecognitionGridProps) => {
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'fractal' | 'temporal'>('grid');

  if (isLoading) {
    return (
      <div className="space-y-4" data-testid="pattern-recognition-loading">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: compact ? 8 : 12 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground" data-testid="pattern-recognition-empty">
        <Grid3x3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No pattern data available</p>
      </div>
    );
  }

  // Extract and analyze patterns from consciousness states
  const extractPatterns = () => {
    const patternMap = new Map<string, PatternData>();
    
    data.forEach((state, stateIndex) => {
      state.activePatternsRecognized.forEach(pattern => {
        if (!patternMap.has(pattern)) {
          patternMap.set(pattern, {
            name: pattern,
            frequency: 0,
            intensity: 0,
            scale: Math.random() > 0.5 ? 'micro' : Math.random() > 0.5 ? 'macro' : 'meta',
            type: generatePatternType(pattern),
            connections: [],
            emergence: Math.random(),
            stability: Math.random(),
            instances: []
          });
        }
        
        const patternData = patternMap.get(pattern)!;
        patternData.frequency++;
        patternData.intensity += state.awarenessLevel;
        patternData.instances.push({
          stateId: state.id,
          timestamp: state.timestamp,
          context: state.contextLayers,
          recursionDepth: state.recursionDepth
        });
      });
    });

    // Calculate connections between patterns
    Array.from(patternMap.values()).forEach(pattern => {
      const coOccurringPatterns = new Set<string>();
      
      pattern.instances.forEach(instance => {
        const state = data.find(s => s.id === instance.stateId);
        if (state) {
          state.activePatternsRecognized.forEach(otherPattern => {
            if (otherPattern !== pattern.name) {
              coOccurringPatterns.add(otherPattern);
            }
          });
        }
      });
      
      pattern.connections = Array.from(coOccurringPatterns).slice(0, 5);
      pattern.intensity /= pattern.frequency; // Average intensity
    });

    return Array.from(patternMap.values()).sort((a, b) => b.frequency - a.frequency);
  };

  const generatePatternType = (pattern: string): PatternType => {
    if (pattern.includes('recursive') || pattern.includes('loop')) return 'recursive';
    if (pattern.includes('emergent') || pattern.includes('emergence')) return 'emergent';
    if (pattern.includes('fractal') || pattern.includes('self-similar')) return 'fractal';
    if (pattern.includes('wave') || pattern.includes('cycle')) return 'wave';
    if (pattern.includes('cascade') || pattern.includes('chain')) return 'cascade';
    return 'structural';
  };

  const getPatternIcon = (type: PatternType) => {
    const icons = {
      'recursive': <Repeat className="w-4 h-4" />,
      'emergent': <Zap className="w-4 h-4" />,
      'fractal': <Grid3x3 className="w-4 h-4" />,
      'wave': <Waves className="w-4 h-4" />,
      'cascade': <TrendingUp className="w-4 h-4" />,
      'structural': <Eye className="w-4 h-4" />
    };
    return icons[type];
  };

  const getPatternColor = (type: PatternType, scale: 'micro' | 'macro' | 'meta') => {
    const typeColors = {
      'recursive': 'indigo',
      'emergent': 'pink',
      'fractal': 'purple',
      'wave': 'cyan',
      'cascade': 'yellow',
      'structural': 'blue'
    };
    
    const scaleIntensity = {
      'micro': '300',
      'macro': '400',
      'meta': '500'
    };
    
    const color = typeColors[type];
    const intensity = scaleIntensity[scale];
    
    return {
      bg: `bg-${color}-${intensity}/20`,
      text: `text-${color}-${intensity}`,
      border: `border-${color}-${intensity}/30`,
      className: `bg-${color}-500/20 text-${color}-300 border-${color}-500/30`
    };
  };

  const patterns = extractPatterns();
  const displayPatterns = compact ? patterns.slice(0, 8) : patterns.slice(0, 20);

  return (
    <div className="space-y-6" data-testid="pattern-recognition-grid">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Grid3x3 className="w-5 h-5" />
          <h3 className="text-lg font-semibold">
            Pattern Recognition Grid
          </h3>
          <Badge variant="outline" className="ml-2">
            {patterns.length} patterns
          </Badge>
        </div>
        
        {!compact && (
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
              data-testid="view-grid"
            >
              Grid
            </Button>
            <Button
              variant={viewMode === 'fractal' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('fractal')}
              data-testid="view-fractal"
            >
              Fractal
            </Button>
            <Button
              variant={viewMode === 'temporal' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('temporal')}
              data-testid="view-temporal"
            >
              Temporal
            </Button>
          </div>
        )}
      </div>

      {/* Pattern Grid */}
      {viewMode === 'grid' && (
        <div className={`grid grid-cols-2 md:grid-cols-3 ${compact ? 'lg:grid-cols-4' : 'lg:grid-cols-5 xl:grid-cols-6'} gap-3`}>
          {displayPatterns.map((pattern, index) => {
            const colorScheme = getPatternColor(pattern.type, pattern.scale);
            const isSelected = selectedPattern === pattern.name;
            
            return (
              <Card
                key={pattern.name}
                className={`
                  cursor-pointer transition-all duration-200 hover:scale-105 
                  ${isSelected ? 'ring-2 ring-purple-500 ring-opacity-50' : ''}
                  ${colorScheme.className}
                `}
                onClick={() => setSelectedPattern(isSelected ? null : pattern.name)}
                data-testid={`pattern-card-${index}`}
              >
                <CardContent className="p-3 space-y-2">
                  {/* Pattern Header */}
                  <div className="flex items-center justify-between">
                    {getPatternIcon(pattern.type)}
                    <Badge variant="outline" className="text-xs" data-testid={`pattern-frequency-${index}`}>
                      {pattern.frequency}x
                    </Badge>
                  </div>
                  
                  {/* Pattern Name */}
                  <h4 className="text-sm font-medium truncate" title={pattern.name} data-testid={`pattern-name-${index}`}>
                    {pattern.name}
                  </h4>
                  
                  {/* Pattern Metrics */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Intensity</span>
                      <span className="font-mono">{(pattern.intensity * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-black/20 rounded-full h-1">
                      <div 
                        className="bg-white/60 h-1 rounded-full transition-all duration-300" 
                        style={{ width: `${pattern.intensity * 100}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* Pattern Scale */}
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs" data-testid={`pattern-scale-${index}`}>
                      {pattern.scale}
                    </Badge>
                    <Badge variant="outline" className="text-xs" data-testid={`pattern-type-${index}`}>
                      {pattern.type}
                    </Badge>
                  </div>
                  
                  {/* Emergence & Stability Indicators */}
                  <div className="flex gap-2 text-xs">
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span>Emergence</span>
                        <span>{(pattern.emergence * 100).toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-black/20 rounded-full h-1">
                        <div 
                          className="bg-pink-400 h-1 rounded-full" 
                          style={{ width: `${pattern.emergence * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span>Stability</span>
                        <span>{(pattern.stability * 100).toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-black/20 rounded-full h-1">
                        <div 
                          className="bg-blue-400 h-1 rounded-full" 
                          style={{ width: `${pattern.stability * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Fractal View */}
      {viewMode === 'fractal' && !compact && (
        <div className="space-y-4">
          <div className="text-center text-muted-foreground">
            <Grid3x3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Fractal pattern visualization</p>
            <p className="text-sm">Self-similar patterns across multiple scales</p>
          </div>
          
          {/* Fractal Pattern Hierarchy */}
          <div className="space-y-4">
            {['meta', 'macro', 'micro'].map(scale => {
              const scalePatterns = patterns.filter(p => p.scale === scale);
              if (scalePatterns.length === 0) return null;
              
              return (
                <Card key={scale} className="p-4">
                  <h4 className="font-semibold mb-3 capitalize">{scale} Scale Patterns</h4>
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    {scalePatterns.slice(0, 12).map((pattern, index) => (
                      <div 
                        key={pattern.name}
                        className="p-2 bg-muted/50 rounded text-xs text-center truncate"
                        title={pattern.name}
                        data-testid={`fractal-pattern-${scale}-${index}`}
                      >
                        {getPatternIcon(pattern.type)}
                        <div className="mt-1">{pattern.name}</div>
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Temporal View */}
      {viewMode === 'temporal' && !compact && (
        <div className="space-y-4">
          <div className="text-center text-muted-foreground">
            <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Temporal pattern evolution</p>
            <p className="text-sm">Pattern emergence and evolution over time</p>
          </div>
          
          {/* Timeline visualization would go here */}
          <Card className="p-4">
            <div className="space-y-4">
              {patterns.slice(0, 5).map((pattern, index) => (
                <div key={pattern.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{pattern.name}</span>
                    <Badge variant="outline">{pattern.instances.length} instances</Badge>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500" 
                      style={{ width: `${(pattern.frequency / Math.max(...patterns.map(p => p.frequency))) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Selected Pattern Details */}
      {selectedPattern && !compact && (
        <Card className="mt-6 border-purple-500/30 bg-purple-500/5">
          <CardContent className="p-4">
            {(() => {
              const pattern = patterns.find(p => p.name === selectedPattern);
              if (!pattern) return null;
              
              return (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold">{pattern.name}</h4>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setSelectedPattern(null)}
                      data-testid="close-pattern-details"
                    >
                      ×
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Frequency</div>
                      <div className="font-mono">{pattern.frequency} occurrences</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Intensity</div>
                      <div className="font-mono">{(pattern.intensity * 100).toFixed(1)}%</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Scale</div>
                      <div className="capitalize">{pattern.scale}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Type</div>
                      <div className="capitalize">{pattern.type}</div>
                    </div>
                  </div>
                  
                  {pattern.connections.length > 0 && (
                    <div>
                      <h5 className="font-medium mb-2">Connected Patterns</h5>
                      <div className="flex flex-wrap gap-1">
                        {pattern.connections.map(connection => (
                          <Badge 
                            key={connection} 
                            variant="outline" 
                            className="cursor-pointer text-xs"
                            onClick={() => setSelectedPattern(connection)}
                            data-testid={`connection-${connection}`}
                          >
                            {connection}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <h5 className="font-medium mb-2">Recent Instances</h5>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {pattern.instances.slice(0, 5).map((instance, index) => (
                        <div key={index} className="text-xs p-2 bg-muted/30 rounded">
                          <div className="flex justify-between">
                            <span>Recursion depth: {instance.recursionDepth}</span>
                            <span>{new Date(instance.timestamp).toLocaleTimeString()}</span>
                          </div>
                          <div className="text-muted-foreground mt-1">
                            Context: {instance.context.join(', ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Type definitions
interface PatternData {
  name: string;
  frequency: number;
  intensity: number;
  scale: 'micro' | 'macro' | 'meta';
  type: PatternType;
  connections: string[];
  emergence: number;
  stability: number;
  instances: PatternInstance[];
}

interface PatternInstance {
  stateId: string;
  timestamp: string;
  context: string[];
  recursionDepth: number;
}

type PatternType = 'recursive' | 'emergent' | 'fractal' | 'wave' | 'cascade' | 'structural';