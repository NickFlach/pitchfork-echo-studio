import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Network, Zap, GitBranch, Layers, Activity, Eye } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { ComplexityMap } from '@/../../shared/schema';

interface ComplexityWebProps {
  data?: ComplexityMap[];
  isLoading?: boolean;
  compact?: boolean;
}

export const ComplexityWeb = ({ data, isLoading, compact = false }: ComplexityWebProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'web' | 'hierarchy' | 'emergence'>('web');
  const [animationActive, setAnimationActive] = useState(true);

  if (isLoading) {
    return (
      <div className="space-y-4" data-testid="complexity-web-loading">
        <Skeleton className="h-64 w-full" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground" data-testid="complexity-web-empty">
        <Network className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No complexity data available</p>
      </div>
    );
  }

  const currentMap = data[0]; // Use the most recent complexity map

  // Web visualization using canvas
  useEffect(() => {
    if (!canvasRef.current || !currentMap || viewMode !== 'web') return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    let animationFrame: number;
    let time = 0;

    const animate = () => {
      if (!animationActive) return;
      
      ctx.clearRect(0, 0, rect.width, rect.height);
      
      // Draw connections first
      currentMap.edges.forEach(edge => {
        const fromNode = currentMap.nodes.find(n => n.id === edge.from);
        const toNode = currentMap.nodes.find(n => n.id === edge.to);
        
        if (fromNode?.position && toNode?.position) {
          ctx.beginPath();
          ctx.moveTo(fromNode.position.x * rect.width, fromNode.position.y * rect.height);
          ctx.lineTo(toNode.position.x * rect.width, toNode.position.y * rect.height);
          
          // Color based on relationship type
          const colors = {
            'causal': '#3b82f6',
            'correlational': '#8b5cf6',
            'emergent': '#ec4899',
            'nonlinear': '#f97316',
            'recursive': '#6366f1',
            'bidirectional': '#10b981'
          };
          
          ctx.strokeStyle = colors[edge.relationshipType] || '#6b7280';
          ctx.lineWidth = edge.strength * 3;
          ctx.globalAlpha = 0.6 + Math.sin(time * 0.01) * 0.2;
          ctx.stroke();
        }
      });
      
      // Draw nodes
      currentMap.nodes.forEach(node => {
        if (!node.position) return;
        
        const x = node.position.x * rect.width;
        const y = node.position.y * rect.height;
        const radius = node.type === 'emergent_property' ? 12 : 8;
        
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        
        // Color based on node type
        const colors = {
          'component': '#3b82f6',
          'process': '#8b5cf6',
          'emergent_property': '#ec4899',
          'feedback_loop': '#f97316',
          'constraint': '#ef4444'
        };
        
        ctx.fillStyle = colors[node.type] || '#6b7280';
        ctx.globalAlpha = selectedNode === node.id ? 1 : 0.8;
        ctx.fill();
        
        // Add pulsing effect for emergent properties
        if (node.type === 'emergent_property') {
          const pulseRadius = radius + Math.sin(time * 0.02) * 5;
          ctx.beginPath();
          ctx.arc(x, y, pulseRadius, 0, 2 * Math.PI);
          ctx.strokeStyle = colors[node.type];
          ctx.lineWidth = 1;
          ctx.globalAlpha = 0.3;
          ctx.stroke();
        }
      });
      
      time += 1;
      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [currentMap, viewMode, selectedNode, animationActive]);

  // Generate positions for nodes if not provided
  const processedMap = {
    ...currentMap,
    nodes: currentMap.nodes.map((node, index) => ({
      ...node,
      position: node.position || {
        x: 0.2 + (index % 4) * 0.2,
        y: 0.2 + Math.floor(index / 4) * 0.2
      }
    }))
  };

  const getNodeTypeIcon = (type: string) => {
    const icons = {
      'component': <Layers className="w-4 h-4" />,
      'process': <Activity className="w-4 h-4" />,
      'emergent_property': <Zap className="w-4 h-4" />,
      'feedback_loop': <GitBranch className="w-4 h-4" />,
      'constraint': <Eye className="w-4 h-4" />
    };
    return icons[type as keyof typeof icons] || <Network className="w-4 h-4" />;
  };

  const getNodeTypeColor = (type: string) => {
    const colors = {
      'component': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      'process': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      'emergent_property': 'bg-pink-500/20 text-pink-300 border-pink-500/30',
      'feedback_loop': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      'constraint': 'bg-red-500/20 text-red-300 border-red-500/30'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

  const getRelationshipColor = (type: string) => {
    const colors = {
      'causal': 'text-blue-300',
      'correlational': 'text-purple-300',
      'emergent': 'text-pink-300',
      'nonlinear': 'text-orange-300',
      'recursive': 'text-indigo-300',
      'bidirectional': 'text-green-300'
    };
    return colors[type as keyof typeof colors] || 'text-gray-300';
  };

  return (
    <div className="space-y-6" data-testid="complexity-web">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Network className="w-5 h-5" />
          <h3 className="text-lg font-semibold">
            Complexity Web
          </h3>
          <Badge variant="outline" className="ml-2">
            {currentMap.name}
          </Badge>
        </div>
        
        {!compact && (
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'web' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('web')}
              data-testid="view-web"
            >
              Web
            </Button>
            <Button
              variant={viewMode === 'hierarchy' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('hierarchy')}
              data-testid="view-hierarchy"
            >
              Hierarchy
            </Button>
            <Button
              variant={viewMode === 'emergence' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('emergence')}
              data-testid="view-emergence"
            >
              Emergence
            </Button>
            <Button
              variant={animationActive ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAnimationActive(!animationActive)}
              data-testid="toggle-animation"
            >
              {animationActive ? 'Pause' : 'Play'}
            </Button>
          </div>
        )}
      </div>

      {/* Complexity Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-3 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-300" />
            <div>
              <div className="text-lg font-bold" data-testid="node-count">
                {currentMap.complexityMetrics.nodeCount}
              </div>
              <div className="text-xs text-muted-foreground">Nodes</div>
            </div>
          </div>
        </Card>

        <Card className="p-3 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-purple-300" />
            <div>
              <div className="text-lg font-bold" data-testid="edge-count">
                {currentMap.complexityMetrics.edgeCount}
              </div>
              <div className="text-xs text-muted-foreground">Edges</div>
            </div>
          </div>
        </Card>

        <Card className="p-3 bg-gradient-to-br from-pink-500/10 to-rose-500/10 border-pink-500/20">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-pink-300" />
            <div>
              <div className="text-lg font-bold" data-testid="emergence-index">
                {(currentMap.complexityMetrics.emergenceIndex * 100).toFixed(0)}%
              </div>
              <div className="text-xs text-muted-foreground">Emergence</div>
            </div>
          </div>
        </Card>

        <Card className="p-3 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-yellow-300" />
            <div>
              <div className="text-lg font-bold" data-testid="chaos-order">
                {(currentMap.complexityMetrics.chaosOrder * 100).toFixed(0)}%
              </div>
              <div className="text-xs text-muted-foreground">Chaos/Order</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Web Visualization */}
      {viewMode === 'web' && (
        <div className="space-y-4">
          <Card className="p-4">
            <canvas
              ref={canvasRef}
              className="w-full h-64 cursor-pointer"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width;
                const y = (e.clientY - rect.top) / rect.height;
                
                // Find nearest node
                let nearestNode = null;
                let minDistance = Infinity;
                
                processedMap.nodes.forEach(node => {
                  if (node.position) {
                    const distance = Math.sqrt(
                      Math.pow(x - node.position.x, 2) + 
                      Math.pow(y - node.position.y, 2)
                    );
                    if (distance < 0.05 && distance < minDistance) {
                      minDistance = distance;
                      nearestNode = node.id;
                    }
                  }
                });
                
                setSelectedNode(nearestNode);
              }}
              data-testid="complexity-canvas"
            />
          </Card>

          {/* Node Details */}
          {selectedNode && (
            <Card className="border-purple-500/30 bg-purple-500/5">
              <CardContent className="p-4">
                {(() => {
                  const node = processedMap.nodes.find(n => n.id === selectedNode);
                  if (!node) return null;

                  return (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getNodeTypeIcon(node.type)}
                          <h4 className="text-lg font-semibold">{node.label}</h4>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setSelectedNode(null)}
                          data-testid="close-node-details"
                        >
                          ×
                        </Button>
                      </div>

                      <Badge className={getNodeTypeColor(node.type)}>
                        {node.type.replace('_', ' ').toUpperCase()}
                      </Badge>

                      {node.properties && Object.keys(node.properties).length > 0 && (
                        <div>
                          <h5 className="font-medium mb-2">Properties</h5>
                          <div className="space-y-1 text-sm">
                            {Object.entries(node.properties).map(([key, value]) => (
                              <div key={key} className="flex justify-between">
                                <span className="text-muted-foreground">{key}:</span>
                                <span>{String(value)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Connected nodes */}
                      {(() => {
                        const connections = processedMap.edges.filter(
                          edge => edge.from === selectedNode || edge.to === selectedNode
                        );
                        if (connections.length === 0) return null;

                        return (
                          <div>
                            <h5 className="font-medium mb-2">Connections ({connections.length})</h5>
                            <div className="space-y-1">
                              {connections.slice(0, 5).map((edge, index) => {
                                const connectedNodeId = edge.from === selectedNode ? edge.to : edge.from;
                                const connectedNode = processedMap.nodes.find(n => n.id === connectedNodeId);
                                
                                return (
                                  <div key={index} className="flex items-center justify-between text-sm p-2 bg-muted/30 rounded">
                                    <div className="flex items-center gap-2">
                                      <span>{connectedNode?.label || connectedNodeId}</span>
                                      <Badge variant="outline" className="text-xs">
                                        {edge.relationshipType}
                                      </Badge>
                                    </div>
                                    <span className={`text-xs ${getRelationshipColor(edge.relationshipType)}`}>
                                      {(edge.strength * 100).toFixed(0)}%
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Hierarchy View */}
      {viewMode === 'hierarchy' && !compact && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {['component', 'process', 'emergent_property', 'feedback_loop', 'constraint'].map(nodeType => {
              const typeNodes = processedMap.nodes.filter(node => node.type === nodeType);
              if (typeNodes.length === 0) return null;

              return (
                <Card key={nodeType} className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    {getNodeTypeIcon(nodeType)}
                    <h4 className="font-semibold capitalize">{nodeType.replace('_', ' ')}</h4>
                    <Badge variant="outline">{typeNodes.length}</Badge>
                  </div>
                  <div className="space-y-2">
                    {typeNodes.slice(0, compact ? 3 : 6).map((node, index) => (
                      <div 
                        key={node.id}
                        className="p-2 bg-muted/30 rounded text-sm cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => setSelectedNode(node.id)}
                        data-testid={`hierarchy-node-${nodeType}-${index}`}
                      >
                        {node.label}
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Emergence View */}
      {viewMode === 'emergence' && !compact && (
        <div className="space-y-6">
          {/* Emergent Properties */}
          {currentMap.emergentProperties.length > 0 && (
            <Card className="p-4">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Emergent Properties ({currentMap.emergentProperties.length})
              </h4>
              <div className="space-y-3">
                {currentMap.emergentProperties.map((property, index) => (
                  <Card key={index} className="p-3 bg-gradient-to-r from-pink-500/5 to-purple-500/5 border-pink-500/20">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium">{property.property}</h5>
                        <Badge className={`${
                          property.stability === 'stable' ? 'bg-green-500/20 text-green-300' :
                          property.stability === 'adaptive' ? 'bg-blue-500/20 text-blue-300' :
                          property.stability === 'unstable' ? 'bg-yellow-500/20 text-yellow-300' :
                          'bg-red-500/20 text-red-300'
                        }`}>
                          {property.stability}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{property.description}</p>
                      {property.emergenceConditions.length > 0 && (
                        <div className="text-xs">
                          <span className="font-medium">Conditions:</span> {property.emergenceConditions.join(', ')}
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          )}

          {/* Feedback Loops */}
          {currentMap.feedbackLoops.length > 0 && (
            <Card className="p-4">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <GitBranch className="w-5 h-5" />
                Feedback Loops ({currentMap.feedbackLoops.length})
              </h4>
              <div className="space-y-3">
                {currentMap.feedbackLoops.map((loop, index) => (
                  <Card key={loop.id} className={`p-3 ${
                    loop.type === 'reinforcing' ? 'bg-green-500/5 border-green-500/20' :
                    loop.type === 'balancing' ? 'bg-blue-500/5 border-blue-500/20' :
                    'bg-red-500/5 border-red-500/20'
                  }`}>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge className={`${
                          loop.type === 'reinforcing' ? 'bg-green-500/20 text-green-300' :
                          loop.type === 'balancing' ? 'bg-blue-500/20 text-blue-300' :
                          'bg-red-500/20 text-red-300'
                        }`}>
                          {loop.type}
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          Strength: {(loop.strength * 100).toFixed(0)}%
                          {loop.cycleTime && ` • Cycle: ${loop.cycleTime}ms`}
                        </div>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Participants:</span> {loop.participants.join(' → ')}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* System Scope and Version Info */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>Scope: <span className="capitalize">{currentMap.systemScope}</span></span>
          <span>Version: {currentMap.version}</span>
          <span>Connectivity: {currentMap.complexityMetrics.averageConnectivity.toFixed(2)}</span>
        </div>
        <div>
          Last updated: {new Date(currentMap.updatedAt).toLocaleString()}
        </div>
      </div>
    </div>
  );
};