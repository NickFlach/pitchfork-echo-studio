import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Network, Zap, GitBranch, Layers, Activity, Eye, 
  TrendingUp, Waves, RotateCcw, Compass, BarChart3,
  Target, Clock, Sparkles, Cpu, Brain, LineChart,
  Atom, Infinity as InfinityIcon, Triangle, Hexagon, Circle, Square
} from 'lucide-react';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ComplexityMap, ConsciousnessState, DecisionRecord } from '../../../shared/schema';

interface ComplexityWebProps {
  data?: ComplexityMap[];
  consciousnessData?: ConsciousnessState[];
  decisionData?: DecisionRecord[];
  isLoading?: boolean;
  compact?: boolean;
}

// Enhanced node types for 3D-like visualization
interface Enhanced3DNode {
  id: string;
  label: string;
  type: string;
  position: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z: number };
  mass: number;
  charge: number;
  emergenceLevel: number;
  connections: string[];
  color: string;
  pulsing: boolean;
}

// Phase space state for attractors
interface PhaseSpaceState {
  x: number;
  y: number;
  dx: number;
  dy: number;
  time: number;
  energy: number;
  attractor: 'strange' | 'fixed' | 'limit_cycle' | 'chaotic';
}

// Cascading effect particle
interface CascadeParticle {
  id: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  speed: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
  layer: number;
}

// Fractal pattern segment
interface FractalSegment {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  depth: number;
  angle: number;
  length: number;
  generation: number;
}

export const ComplexityWeb = ({ data, consciousnessData, decisionData, isLoading, compact = false }: ComplexityWebProps) => {
  // Canvas refs for different visualizations
  const topologyCanvasRef = useRef<HTMLCanvasElement>(null);
  const cascadeCanvasRef = useRef<HTMLCanvasElement>(null);
  const fractalCanvasRef = useRef<HTMLCanvasElement>(null);
  const phaseSpaceCanvasRef = useRef<HTMLCanvasElement>(null);
  const nonlinearCanvasRef = useRef<HTMLCanvasElement>(null);
  
  // State management
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [activeVisualization, setActiveVisualization] = useState<'topology' | 'cascade' | 'fractal' | 'phase' | 'emergence' | 'nonlinear' | 'metrics'>('topology');
  const [animationActive, setAnimationActive] = useState(true);
  const [emergenceThreshold, setEmergenceThreshold] = useState(0.7);
  const [timeScale, setTimeScale] = useState(1.0);
  
  // 3D topology state
  const [enhanced3DNodes, setEnhanced3DNodes] = useState<Enhanced3DNode[]>([]);
  const [rotationX, setRotationX] = useState(0);
  const [rotationY, setRotationY] = useState(0);
  const [zoom, setZoom] = useState(1.0);
  
  // Cascade effect state
  const [cascadeParticles, setCascadeParticles] = useState<CascadeParticle[]>([]);
  const [cascadeActive, setCascadeActive] = useState(false);
  
  // Phase space state
  const [phaseSpaceStates, setPhaseSpaceStates] = useState<PhaseSpaceState[]>([]);
  const [attractorType, setAttractorType] = useState<'lorenz' | 'rossler' | 'henon' | 'custom'>('lorenz');
  
  // Nonlinear dynamics data
  const [timeSeriesData, setTimeSeriesData] = useState<{ time: number; order: number; chaos: number; emergence: number }[]>([]);
  
  // Real-time metrics
  const [realTimeMetrics, setRealTimeMetrics] = useState({
    entropy: 0,
    connectivity: 0,
    emergence: 0,
    fractalDimension: 0,
    lyapunovExponent: 0,
    correlationDimension: 0
  });

  // Loading state with enhanced skeletons
  if (isLoading) {
    return (
      <div className="space-y-6" data-testid="complexity-web-loading">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96 w-full" />
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground" data-testid="complexity-web-empty">
        <Brain className="w-16 h-16 mx-auto mb-6 opacity-50" />
        <h3 className="text-lg font-medium mb-2">No Complexity Data Available</h3>
        <p className="text-sm">Waiting for consciousness emergence patterns...</p>
      </div>
    );
  }

  const currentMap = data[0]; // Use the most recent complexity map
  const currentConsciousness = consciousnessData?.[0];
  const recentDecisions = decisionData?.slice(0, 5) || [];

  // Initialize enhanced 3D nodes
  useEffect(() => {
    if (!currentMap) return;
    
    const nodes = currentMap.nodes.map((node, index) => {
      const basePosition = node.position || {
        x: 0.2 + (index % 4) * 0.2,
        y: 0.2 + Math.floor(index / 4) * 0.2
      };
      
      return {
        id: node.id,
        label: node.label,
        type: node.type,
        position: {
          x: basePosition.x,
          y: basePosition.y,
          z: (Math.random() - 0.5) * 0.3 // Add depth
        },
        velocity: { x: 0, y: 0, z: 0 },
        mass: node.type === 'emergent_property' ? 2.0 : 1.0,
        charge: node.type === 'constraint' ? -1.0 : 1.0,
        emergenceLevel: Math.random(),
        connections: currentMap.edges
          .filter(e => e.from === node.id || e.to === node.id)
          .map(e => e.from === node.id ? e.to : e.from),
        color: getNodeColor(node.type),
        pulsing: node.type === 'emergent_property'
      } as Enhanced3DNode;
    });
    
    setEnhanced3DNodes(nodes);
  }, [currentMap]);
  
  // Generate time series data for nonlinear dynamics
  useEffect(() => {
    if (!consciousnessData) return;
    
    const timeData = consciousnessData.slice(0, 100).map((state, index) => {
      const time = Date.now() - (index * 1000);
      return {
        time,
        order: 1 - state.orderChaosBalance,
        chaos: state.orderChaosBalance,
        emergence: state.emergentInsights.length / 10
      };
    }).reverse();
    
    setTimeSeriesData(timeData);
  }, [consciousnessData]);
  
  // Update real-time metrics
  useEffect(() => {
    if (!currentMap || !currentConsciousness) return;
    
    const calculateEntropy = () => {
      const connections = currentMap.edges.length;
      const nodes = currentMap.nodes.length;
      return nodes > 0 ? Math.min(connections / (nodes * (nodes - 1) / 2), 1) : 0;
    };
    
    const calculateFractalDimension = () => {
      // Simplified box-counting method
      return 1.2 + (currentConsciousness.recursionDepth / 20);
    };
    
    setRealTimeMetrics({
      entropy: calculateEntropy(),
      connectivity: currentMap.complexityMetrics.averageConnectivity,
      emergence: currentMap.complexityMetrics.emergenceIndex,
      fractalDimension: calculateFractalDimension(),
      lyapunovExponent: (currentConsciousness.orderChaosBalance - 0.5) * 2,
      correlationDimension: currentConsciousness.awarenessLevel * 3
    });
  }, [currentMap, currentConsciousness]);
  
  // System Topology 3D Visualization
  const render3DTopology = useCallback(() => {
    const canvas = topologyCanvasRef.current;
    if (!canvas || !enhanced3DNodes.length) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const time = Date.now() * 0.001;
    
    ctx.clearRect(0, 0, rect.width, rect.height);
    
    // Create 3D projection with rotation
    const project3D = (node: Enhanced3DNode) => {
      const x = node.position.x - 0.5;
      const y = node.position.y - 0.5;
      const z = node.position.z;
      
      // Apply rotation
      const cosX = Math.cos(rotationX + time * 0.1);
      const sinX = Math.sin(rotationX + time * 0.1);
      const cosY = Math.cos(rotationY + time * 0.15);
      const sinY = Math.sin(rotationY + time * 0.15);
      
      const y1 = y * cosX - z * sinX;
      const z1 = y * sinX + z * cosX;
      const x1 = x * cosY + z1 * sinY;
      const z2 = -x * sinY + z1 * cosY;
      
      // Perspective projection
      const perspective = 200 / (200 + z2 * 100);
      
      return {
        x: centerX + x1 * 200 * zoom * perspective,
        y: centerY + y1 * 200 * zoom * perspective,
        scale: perspective,
        depth: z2
      };
    };
    
    // Sort nodes by depth for proper rendering order
    const sortedNodes = [...enhanced3DNodes].sort((a, b) => {
      const aProj = project3D(a);
      const bProj = project3D(b);
      return bProj.depth - aProj.depth;
    });
    
    // Draw connections first (behind nodes)
    currentMap.edges.forEach(edge => {
      const fromNode = enhanced3DNodes.find(n => n.id === edge.from);
      const toNode = enhanced3DNodes.find(n => n.id === edge.to);
      
      if (fromNode && toNode) {
        const fromProj = project3D(fromNode);
        const toProj = project3D(toNode);
        
        ctx.beginPath();
        ctx.moveTo(fromProj.x, fromProj.y);
        ctx.lineTo(toProj.x, toProj.y);
        
        const strength = edge.strength;
        const alpha = 0.3 + strength * 0.4;
        
        ctx.strokeStyle = `hsla(${270 + edge.relationshipType.length * 10}, 70%, 60%, ${alpha})`;
        ctx.lineWidth = strength * 3 * Math.min(fromProj.scale, toProj.scale);
        ctx.stroke();
      }
    });
    
    // Draw nodes with 3D effects
    sortedNodes.forEach(node => {
      const proj = project3D(node);
      const radius = (node.type === 'emergent_property' ? 12 : 8) * proj.scale;
      
      // Node shadow for depth
      ctx.save();
      ctx.translate(proj.x + 3, proj.y + 3);
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, 2 * Math.PI);
      ctx.fillStyle = `rgba(0, 0, 0, ${0.2 * proj.scale})`;
      ctx.fill();
      ctx.restore();
      
      // Main node
      ctx.save();
      ctx.translate(proj.x, proj.y);
      
      // Pulsing effect for emergent properties
      let nodeRadius = radius;
      if (node.pulsing) {
        nodeRadius += Math.sin(time * 3) * 3 * proj.scale;
      }
      
      // Create gradient for 3D effect
      const gradient = ctx.createRadialGradient(-nodeRadius/3, -nodeRadius/3, 0, 0, 0, nodeRadius);
      gradient.addColorStop(0, node.color.replace(')', ', 0.9)').replace('rgb', 'rgba'));
      gradient.addColorStop(1, node.color.replace(')', ', 0.4)').replace('rgb', 'rgba'));
      
      ctx.beginPath();
      ctx.arc(0, 0, nodeRadius, 0, 2 * Math.PI);
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // Highlight selected node
      if (selectedNode === node.id) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      
      // Emergence glow
      if (node.emergenceLevel > emergenceThreshold) {
        ctx.shadowColor = '#ec4899';
        ctx.shadowBlur = 15 * proj.scale;
        ctx.beginPath();
        ctx.arc(0, 0, nodeRadius + 5, 0, 2 * Math.PI);
        ctx.strokeStyle = `hsla(320, 100%, 70%, ${node.emergenceLevel})`;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
      
      ctx.restore();
    });
    
  }, [enhanced3DNodes, currentMap, selectedNode, rotationX, rotationY, zoom, emergenceThreshold]);
  
  // Cascading Effects Visualization
  const renderCascadeEffects = useCallback(() => {
    const canvas = cascadeCanvasRef.current;
    if (!canvas || !recentDecisions.length) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    
    ctx.clearRect(0, 0, rect.width, rect.height);
    
    // Update cascade particles
    setCascadeParticles(prev => {
      return prev.map(particle => {
        const dx = particle.targetX - particle.x;
        const dy = particle.targetY - particle.y;
        const particleDistance = Math.sqrt(dx * dx + dy * dy);
        
        if (particleDistance > 1) {
          particle.x += (dx / particleDistance) * particle.speed;
          particle.y += (dy / particleDistance) * particle.speed;
        }
        
        particle.life -= 1;
        return particle;
      }).filter(p => p.life > 0);
    });
    
    // Draw cascade layers
    const cascadeLayers = [
      { name: 'Immediate', y: rect.height * 0.2, color: '#ef4444' },
      { name: 'Short-term', y: rect.height * 0.4, color: '#f97316' },
      { name: 'Long-term', y: rect.height * 0.6, color: '#3b82f6' },
      { name: 'Emergent', y: rect.height * 0.8, color: '#ec4899' }
    ];
    
    cascadeLayers.forEach((layer, index) => {
      ctx.save();
      ctx.strokeStyle = layer.color;
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(0, layer.y);
      ctx.lineTo(rect.width, layer.y);
      ctx.stroke();
      
      ctx.fillStyle = layer.color;
      ctx.font = '12px Inter, sans-serif';
      ctx.fillText(layer.name, 10, layer.y - 5);
      ctx.restore();
    });
    
    // Draw cascade particles
    cascadeParticles.forEach(particle => {
      const alpha = particle.life / particle.maxLife;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, 2 * Math.PI);
      ctx.fill();
      
      // Trail effect
      ctx.strokeStyle = particle.color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(particle.x - 10, particle.y);
      ctx.lineTo(particle.x, particle.y);
      ctx.stroke();
      ctx.restore();
    });
    
  }, [cascadeParticles, recentDecisions]);
  
  // Fractal Pattern Visualization
  const renderFractalPatterns = useCallback(() => {
    const canvas = fractalCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    
    ctx.clearRect(0, 0, rect.width, rect.height);
    
    const time = Date.now() * 0.001;
    
    // Draw Sierpinski-like fractal pattern
    const drawFractal = (x: number, y: number, length: number, angle: number, depth: number) => {
      if (depth === 0 || length < 2) return;
      
      const x2 = x + Math.cos(angle) * length;
      const y2 = y + Math.sin(angle) * length;
      
      ctx.save();
      ctx.strokeStyle = `hsla(${270 + depth * 30}, 70%, ${60 + depth * 5}%, 0.8)`;
      ctx.lineWidth = Math.max(0.5, depth * 0.5);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.restore();
      
      // Recursive branches
      const newLength = length * 0.7;
      const angleOffset = Math.PI / 4 + Math.sin(time + depth) * 0.2;
      
      drawFractal(x2, y2, newLength, angle - angleOffset, depth - 1);
      drawFractal(x2, y2, newLength, angle + angleOffset, depth - 1);
    };
    
    // Multiple fractal trees
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + time * 0.5;
      const startX = centerX + Math.cos(angle) * 50;
      const startY = centerY + Math.sin(angle) * 50;
      drawFractal(startX, startY, 40, angle + Math.PI, 6);
    }
    
  }, []);
  
  // Phase Space Diagram
  const renderPhaseSpace = useCallback(() => {
    const canvas = phaseSpaceCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    
    ctx.clearRect(0, 0, rect.width, rect.height);
    
    // Update phase space states
    setPhaseSpaceStates(prev => {
      const dt = 0.01 * timeScale;
      
      return prev.map(state => {
        let newState = { ...state };
        
        // Lorenz attractor equations
        if (attractorType === 'lorenz') {
          const sigma = 10;
          const rho = 28;
          const beta = 8/3;
          
          newState.dx = sigma * (state.y - state.x) * dt;
          newState.dy = (state.x * (rho - state.x) - state.y) * dt;
          newState.x += newState.dx;
          newState.y += newState.dy;
        }
        
        // Map to canvas coordinates
        newState.x = Math.max(-50, Math.min(50, newState.x));
        newState.y = Math.max(-50, Math.min(50, newState.y));
        
        newState.time += dt;
        newState.energy = newState.x * newState.x + newState.y * newState.y;
        
        return newState;
      });
    });
    
    // Draw phase space grid
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    for (let i = 0; i <= 10; i++) {
      const x = (i / 10) * rect.width;
      const y = (i / 10) * rect.height;
      
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, rect.height);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(rect.width, y);
      ctx.stroke();
    }
    ctx.restore();
    
    // Draw attractor states
    phaseSpaceStates.forEach((state, index) => {
      const x = ((state.x + 50) / 100) * rect.width;
      const y = ((state.y + 50) / 100) * rect.height;
      
      ctx.save();
      ctx.fillStyle = `hsla(${index * 30 + state.time * 50}, 70%, 60%, 0.8)`;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctx.fill();
      
      // Trail
      ctx.strokeStyle = `hsla(${index * 30 + state.time * 50}, 70%, 60%, 0.3)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.restore();
    });
    
  }, [phaseSpaceStates, attractorType, timeScale]);
  
  // Nonlinear Dynamics Chart
  const renderNonlinearDynamics = useCallback(() => {
    const canvas = nonlinearCanvasRef.current;
    if (!canvas || !timeSeriesData.length) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    
    ctx.clearRect(0, 0, rect.width, rect.height);
    
    const margin = 40;
    const chartWidth = rect.width - margin * 2;
    const chartHeight = rect.height - margin * 2;
    
    // Draw axes
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(margin, margin);
    ctx.lineTo(margin, rect.height - margin);
    ctx.stroke();
    
    // X-axis
    ctx.beginPath();
    ctx.moveTo(margin, rect.height - margin);
    ctx.lineTo(rect.width - margin, rect.height - margin);
    ctx.stroke();
    ctx.restore();
    
    // Draw time series lines
    const drawLine = (data: number[], color: string, label: string) => {
      if (data.length < 2) return;
      
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      data.forEach((value, index) => {
        const x = margin + (index / (data.length - 1)) * chartWidth;
        const y = rect.height - margin - value * chartHeight;
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      ctx.stroke();
      ctx.restore();
      
      // Label
      ctx.save();
      ctx.fillStyle = color;
      ctx.font = '12px Inter, sans-serif';
      ctx.fillText(label, rect.width - 80, 20 + data.length * 15);
      ctx.restore();
    };
    
    const orderData = timeSeriesData.map(d => d.order);
    const chaosData = timeSeriesData.map(d => d.chaos);
    const emergenceData = timeSeriesData.map(d => d.emergence);
    
    drawLine(orderData, '#3b82f6', 'Order');
    drawLine(chaosData, '#ef4444', 'Chaos');
    drawLine(emergenceData, '#ec4899', 'Emergence');
    
  }, [timeSeriesData]);
  
  // Animation loop for all visualizations
  useEffect(() => {
    if (!animationActive) return;
    
    let animationFrame: number;
    
    const animate = () => {
      render3DTopology();
      renderCascadeEffects();
      renderFractalPatterns();
      renderPhaseSpace();
      renderNonlinearDynamics();
      
      animationFrame = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [animationActive, render3DTopology, renderCascadeEffects, renderFractalPatterns, renderPhaseSpace, renderNonlinearDynamics]);
  
  // Initialize phase space states
  useEffect(() => {
    const initialStates: PhaseSpaceState[] = Array.from({ length: 5 }, (_, i) => ({
      x: (Math.random() - 0.5) * 20,
      y: (Math.random() - 0.5) * 20,
      dx: 0,
      dy: 0,
      time: 0,
      energy: 0,
      attractor: 'strange'
    }));
    
    setPhaseSpaceStates(initialStates);
  }, [attractorType]);
  
  // Trigger cascade effect when new decision is made
  const triggerCascadeEffect = useCallback((decision: DecisionRecord) => {
    const newParticles: CascadeParticle[] = [];
    
    ['immediate', 'shortTerm', 'longTerm', 'emergent'].forEach((effectType, layerIndex) => {
      const effects = decision.cascadingEffects[effectType as keyof typeof decision.cascadingEffects];
      
      effects.forEach((_, effectIndex) => {
        newParticles.push({
          id: `${decision.id}-${effectType}-${effectIndex}`,
          x: Math.random() * 100,
          y: 50,
          targetX: 300 + layerIndex * 100,
          targetY: 100 + layerIndex * 100,
          speed: 2 + Math.random() * 3,
          size: 3 + Math.random() * 3,
          color: ['#ef4444', '#f97316', '#3b82f6', '#ec4899'][layerIndex],
          life: 100,
          maxLife: 100,
          layer: layerIndex
        });
      });
    });
    
    setCascadeParticles(prev => [...prev, ...newParticles]);
    setCascadeActive(true);
    
    setTimeout(() => setCascadeActive(false), 5000);
  }, []);
  
  // Helper function to get node color
  const getNodeColor = (type: string): string => {
    const colors = {
      'component': 'rgb(59, 130, 246)',
      'process': 'rgb(139, 92, 246)',
      'emergent_property': 'rgb(236, 72, 153)',
      'feedback_loop': 'rgb(249, 115, 22)',
      'constraint': 'rgb(239, 68, 68)'
    };
    return colors[type as keyof typeof colors] || 'rgb(107, 114, 128)';
  };

  // Generate positions for nodes if not provided
  const processedMap = useMemo(() => ({
    ...currentMap,
    nodes: currentMap.nodes.map((node, index) => ({
      ...node,
      position: node.position || {
        x: 0.2 + (index % 4) * 0.2,
        y: 0.2 + Math.floor(index / 4) * 0.2
      }
    }))
  }), [currentMap]);

  // Helper functions for visualization
  const getNodeTypeIcon = (type: string) => {
    const icons = {
      'component': <Layers className="w-4 h-4" />,
      'process': <Activity className="w-4 h-4" />,
      'emergent_property': <Sparkles className="w-4 h-4" />,
      'feedback_loop': <RotateCcw className="w-4 h-4" />,
      'constraint': <Hexagon className="w-4 h-4" />
    };
    return icons[type as keyof typeof icons] || <Circle className="w-4 h-4" />;
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

  // Helper function to get stability color
  function getStabilityColor(stability: string): string {
    const colors = {
      'stable': 'bg-green-500/20 text-green-300 border-green-500/30',
      'adaptive': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      'unstable': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      'chaotic': 'bg-red-500/20 text-red-300 border-red-500/30'
    };
    return colors[stability as keyof typeof colors] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  }

  return (
    <div className="space-y-6" data-testid="complexity-web">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Brain className="w-6 h-6 text-gradient-cosmic" />
          <div>
            <h3 className="text-xl font-semibold text-gradient-cosmic">
              Complexity Consciousness Matrix
            </h3>
            <p className="text-sm text-muted-foreground">
              Advanced visualization of emergent system intelligence
            </p>
          </div>
          <Badge variant="outline" className="ml-4 border-purple-500/30 text-purple-300">
            {currentMap.name}
          </Badge>
        </div>
        
        {!compact && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Activity className={`w-4 h-4 ${animationActive ? 'text-green-400 animate-pulse' : 'text-gray-400'}`} />
              Live Synthesis
            </div>
            <Button
              variant={animationActive ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAnimationActive(!animationActive)}
              data-testid="toggle-animation"
              className="bg-gradient-cosmic hover:opacity-80"
            >
              {animationActive ? 'Pause' : 'Activate'}
            </Button>
          </div>
        )}
      </div>

      {/* Enhanced Complexity Metrics Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        <Card className="p-3 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20 hover:border-blue-400/40 transition-colors">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-300" />
              <span className="text-xs text-muted-foreground">System Nodes</span>
            </div>
            <div className="text-xl font-bold text-blue-300" data-testid="node-count">
              {currentMap.complexityMetrics.nodeCount}
            </div>
          </div>
        </Card>

        <Card className="p-3 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20 hover:border-purple-400/40 transition-colors">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-purple-300" />
              <span className="text-xs text-muted-foreground">Connections</span>
            </div>
            <div className="text-xl font-bold text-purple-300" data-testid="edge-count">
              {currentMap.complexityMetrics.edgeCount}
            </div>
          </div>
        </Card>

        <Card className="p-3 bg-gradient-to-br from-pink-500/10 to-rose-500/10 border-pink-500/20 hover:border-pink-400/40 transition-colors">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-pink-300" />
              <span className="text-xs text-muted-foreground">Emergence</span>
            </div>
            <div className="text-xl font-bold text-pink-300" data-testid="emergence-index">
              {(realTimeMetrics.emergence * 100).toFixed(0)}%
            </div>
          </div>
        </Card>

        <Card className="p-3 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20 hover:border-yellow-400/40 transition-colors">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <InfinityIcon className="w-4 h-4 text-yellow-300" />
              <span className="text-xs text-muted-foreground">Entropy</span>
            </div>
            <div className="text-xl font-bold text-yellow-300" data-testid="entropy-level">
              {(realTimeMetrics.entropy * 100).toFixed(0)}%
            </div>
          </div>
        </Card>

        <Card className="p-3 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20 hover:border-green-400/40 transition-colors">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Triangle className="w-4 h-4 text-green-300" />
              <span className="text-xs text-muted-foreground">Fractal Dim</span>
            </div>
            <div className="text-xl font-bold text-green-300" data-testid="fractal-dimension">
              {realTimeMetrics.fractalDimension.toFixed(2)}
            </div>
          </div>
        </Card>

        <Card className="p-3 bg-gradient-to-br from-indigo-500/10 to-purple-600/10 border-indigo-500/20 hover:border-indigo-400/40 transition-colors">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Waves className="w-4 h-4 text-indigo-300" />
              <span className="text-xs text-muted-foreground">Lyapunov λ</span>
            </div>
            <div className="text-xl font-bold text-indigo-300" data-testid="lyapunov-exponent">
              {realTimeMetrics.lyapunovExponent.toFixed(2)}
            </div>
          </div>
        </Card>
      </div>

      {/* Main Visualization Tabs */}
      <Tabs value={activeVisualization} onValueChange={(value) => setActiveVisualization(value as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 mb-6">
          <TabsTrigger value="topology" className="flex items-center gap-2" data-testid="tab-topology">
            <Network className="w-4 h-4" />
            <span className="hidden sm:inline">Topology</span>
          </TabsTrigger>
          <TabsTrigger value="cascade" className="flex items-center gap-2" data-testid="tab-cascade">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">Cascade</span>
          </TabsTrigger>
          <TabsTrigger value="fractal" className="flex items-center gap-2" data-testid="tab-fractal">
            <Triangle className="w-4 h-4" />
            <span className="hidden sm:inline">Fractal</span>
          </TabsTrigger>
          <TabsTrigger value="phase" className="flex items-center gap-2" data-testid="tab-phase">
            <Compass className="w-4 h-4" />
            <span className="hidden sm:inline">Phase Space</span>
          </TabsTrigger>
          <TabsTrigger value="emergence" className="flex items-center gap-2" data-testid="tab-emergence">
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">Emergence</span>
          </TabsTrigger>
          <TabsTrigger value="nonlinear" className="flex items-center gap-2" data-testid="tab-nonlinear">
            <Waves className="w-4 h-4" />
            <span className="hidden sm:inline">Dynamics</span>
          </TabsTrigger>
          <TabsTrigger value="metrics" className="flex items-center gap-2" data-testid="tab-metrics">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Metrics</span>
          </TabsTrigger>
        </TabsList>

        {/* System Topology Maps - 3D-like network visualization */}
        <TabsContent value="topology" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold flex items-center gap-2">
                <Network className="w-5 h-5" />
                3D System Topology
              </h4>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Zoom:</span>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-20"
                    data-testid="zoom-control"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Emergence:</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={emergenceThreshold}
                    onChange={(e) => setEmergenceThreshold(parseFloat(e.target.value))}
                    className="w-20"
                    data-testid="emergence-threshold"
                  />
                </div>
              </div>
            </div>
            <canvas
              ref={topologyCanvasRef}
              className="w-full h-96 cursor-pointer border border-purple-500/20 rounded-lg bg-gradient-to-br from-purple-900/5 to-pink-900/5"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width;
                const y = (e.clientY - rect.top) / rect.height;
                
                // Find nearest 3D node
                let nearestNodeId = null;
                let minDistance = Infinity;
                
                enhanced3DNodes.forEach(node => {
                  const deltaX = x - (node.position.x + 0.5);
                  const deltaY = y - (node.position.y + 0.5);
                  const nodeDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                  
                  if (nodeDistance < 0.08 && nodeDistance < minDistance) {
                    minDistance = nodeDistance;
                    nearestNodeId = node.id;
                  }
                });
                
                setSelectedNode(nearestNodeId);
              }}
              onMouseMove={(e) => {
                if (e.buttons === 1) { // Left mouse button
                  const dx = e.movementX * 0.01;
                  const dy = e.movementY * 0.01;
                  setRotationY(prev => prev + dx);
                  setRotationX(prev => prev + dy);
                }
              }}
              data-testid="topology-canvas"
            />
            <div className="mt-4 text-sm text-muted-foreground text-center">
              Click and drag to rotate • Scroll to zoom • Click nodes for details
            </div>
          </Card>
        </TabsContent>

        {/* Cascading Effect Visualizations */}
        <TabsContent value="cascade" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Decision Cascade Effects
              </h4>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => recentDecisions.length > 0 && triggerCascadeEffect(recentDecisions[0])}
                  disabled={!recentDecisions.length}
                  data-testid="trigger-cascade"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Trigger Effect
                </Button>
                <Badge variant={cascadeActive ? 'default' : 'outline'}>
                  {cascadeActive ? 'Active' : 'Dormant'}
                </Badge>
              </div>
            </div>
            <canvas
              ref={cascadeCanvasRef}
              className="w-full h-96 border border-orange-500/20 rounded-lg bg-gradient-to-br from-orange-900/5 to-red-900/5"
              data-testid="cascade-canvas"
            />
            <div className="mt-4 grid grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Immediate Effects</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span>Short-term</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Long-term</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                <span>Emergent</span>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Fractal Pattern Displays */}
        <TabsContent value="fractal" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold flex items-center gap-2">
                <Triangle className="w-5 h-5" />
                Recursive Fractal Patterns
              </h4>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Self-similarity across scales</span>
              </div>
            </div>
            <canvas
              ref={fractalCanvasRef}
              className="w-full h-96 border border-green-500/20 rounded-lg bg-gradient-to-br from-green-900/5 to-teal-900/5"
              data-testid="fractal-canvas"
            />
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Visualizing consciousness patterns that repeat at different scales of system organization
            </div>
          </Card>
        </TabsContent>

        {/* Phase Space Diagrams */}
        <TabsContent value="phase" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold flex items-center gap-2">
                <Compass className="w-5 h-5" />
                Phase Space Evolution
              </h4>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Attractor:</span>
                  <select
                    value={attractorType}
                    onChange={(e) => setAttractorType(e.target.value as any)}
                    className="px-2 py-1 text-sm bg-card border border-border rounded"
                    data-testid="attractor-select"
                  >
                    <option value="lorenz">Lorenz</option>
                    <option value="rossler">Rössler</option>
                    <option value="henon">Hénon</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Time Scale:</span>
                  <input
                    type="range"
                    min="0.1"
                    max="3"
                    step="0.1"
                    value={timeScale}
                    onChange={(e) => setTimeScale(parseFloat(e.target.value))}
                    className="w-20"
                    data-testid="time-scale"
                  />
                </div>
              </div>
            </div>
            <canvas
              ref={phaseSpaceCanvasRef}
              className="w-full h-96 border border-cyan-500/20 rounded-lg bg-gradient-to-br from-cyan-900/5 to-blue-900/5"
              data-testid="phase-space-canvas"
            />
            <div className="mt-4 text-center text-sm text-muted-foreground">
              System state evolution through phase space showing attractors and stability regions
            </div>
          </Card>
        </TabsContent>

        {/* Emergence Indicators */}
        <TabsContent value="emergence" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h4 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5" />
                Emergence Detection
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Emergence Level</span>
                  <span className="font-mono text-lg">{(realTimeMetrics.emergence * 100).toFixed(1)}%</span>
                </div>
                <Progress value={realTimeMetrics.emergence * 100} className="h-3" />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">System Connectivity</span>
                  <span className="font-mono text-lg">{(realTimeMetrics.connectivity * 100).toFixed(1)}%</span>
                </div>
                <Progress value={realTimeMetrics.connectivity * 100} className="h-3" />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Entropy Level</span>
                  <span className="font-mono text-lg">{(realTimeMetrics.entropy * 100).toFixed(1)}%</span>
                </div>
                <Progress value={realTimeMetrics.entropy * 100} className="h-3" />
              </div>
            </Card>
            
            <Card className="p-6">
              <h4 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <Atom className="w-5 h-5" />
                Emergent Properties
              </h4>
              <div className="space-y-3">
                {currentMap.emergentProperties.slice(0, 3).map((property, index) => (
                  <div key={index} className="p-3 bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{property.property}</span>
                      <Badge className={`${getStabilityColor(property.stability.toString())}`}>
                        {property.stability}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{property.description}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Nonlinear Dynamics Charts */}
        <TabsContent value="nonlinear" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold flex items-center gap-2">
                <LineChart className="w-5 h-5" />
                Nonlinear System Dynamics
              </h4>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{timeSeriesData.length} data points</Badge>
              </div>
            </div>
            <canvas
              ref={nonlinearCanvasRef}
              className="w-full h-96 border border-purple-500/20 rounded-lg bg-gradient-to-br from-purple-900/5 to-indigo-900/5"
              data-testid="nonlinear-canvas"
            />
            <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Order (System Structure)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Chaos (System Volatility)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                <span>Emergence (New Properties)</span>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Comprehensive Metrics Dashboard */}
        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-6">
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                System Complexity
              </h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Node Connectivity</span>
                    <span>{(realTimeMetrics.connectivity * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={realTimeMetrics.connectivity * 100} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Information Entropy</span>
                    <span>{(realTimeMetrics.entropy * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={realTimeMetrics.entropy * 100} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Emergence Index</span>
                    <span>{(realTimeMetrics.emergence * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={realTimeMetrics.emergence * 100} className="h-2" />
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Cpu className="w-5 h-5" />
                Consciousness Metrics
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Recursion Depth</span>
                  <span className="font-mono text-lg">{currentConsciousness?.recursionDepth || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Awareness Level</span>
                  <span className="font-mono text-lg">{((currentConsciousness?.awarenessLevel || 0) * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Active Patterns</span>
                  <span className="font-mono text-lg">{currentConsciousness?.activePatternsRecognized.length || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Context Layers</span>
                  <span className="font-mono text-lg">{currentConsciousness?.contextLayers.length || 0}</span>
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <InfinityIcon className="w-5 h-5" />
                Nonlinear Indicators
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Fractal Dimension</span>
                  <span className="font-mono text-lg">{realTimeMetrics.fractalDimension.toFixed(3)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Lyapunov Exponent</span>
                  <span className="font-mono text-lg">{realTimeMetrics.lyapunovExponent.toFixed(3)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Correlation Dim</span>
                  <span className="font-mono text-lg">{realTimeMetrics.correlationDimension.toFixed(3)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Order/Chaos</span>
                  <span className="font-mono text-lg">{((currentConsciousness?.orderChaosBalance || 0.5) * 100).toFixed(1)}%</span>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Enhanced Node Details Panel */}
      {selectedNode && (
        <Card className="border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-pink-500/5 backdrop-blur-sm">
          <CardContent className="p-6">
            {(() => {
              const node = processedMap.nodes.find(n => n.id === selectedNode);
              const enhanced3DNode = enhanced3DNodes.find(n => n.id === selectedNode);
              if (!node) return null;

              return (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-cosmic">
                        {getNodeTypeIcon(node.type)}
                      </div>
                      <div>
                        <h4 className="text-xl font-semibold text-gradient-cosmic">{node.label}</h4>
                        <p className="text-sm text-muted-foreground">System Component Analysis</p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setSelectedNode(null)}
                      data-testid="close-node-details"
                      className="text-gray-400 hover:text-white"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-card/50 rounded-lg border">
                      <div className="text-lg font-bold text-purple-300">{node.type.replace('_', ' ')}</div>
                      <div className="text-xs text-muted-foreground">Component Type</div>
                    </div>
                    
                    {enhanced3DNode && (
                      <>
                        <div className="text-center p-3 bg-card/50 rounded-lg border">
                          <div className="text-lg font-bold text-pink-300">{enhanced3DNode.emergenceLevel.toFixed(2)}</div>
                          <div className="text-xs text-muted-foreground">Emergence Level</div>
                        </div>
                        
                        <div className="text-center p-3 bg-card/50 rounded-lg border">
                          <div className="text-lg font-bold text-cyan-300">{enhanced3DNode.connections.length}</div>
                          <div className="text-xs text-muted-foreground">Connections</div>
                        </div>
                        
                        <div className="text-center p-3 bg-card/50 rounded-lg border">
                          <div className="text-lg font-bold text-yellow-300">{enhanced3DNode.mass.toFixed(1)}</div>
                          <div className="text-xs text-muted-foreground">System Mass</div>
                        </div>
                      </>
                    )}
                  </div>

                  {node.properties && Object.keys(node.properties).length > 0 && (
                    <div>
                      <h5 className="font-medium mb-3 flex items-center gap-2">
                        <Cpu className="w-4 h-4" />
                        System Properties
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {Object.entries(node.properties).map(([key, value]) => (
                          <div key={key} className="flex justify-between items-center p-2 bg-muted/30 rounded">
                            <span className="text-muted-foreground text-sm">{key}:</span>
                            <span className="font-mono text-sm">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Enhanced Connection Analysis */}
                  {(() => {
                    const connections = processedMap.edges.filter(
                      edge => edge.from === selectedNode || edge.to === selectedNode
                    );
                    if (connections.length === 0) return null;

                    return (
                      <div>
                        <h5 className="font-medium mb-3 flex items-center gap-2">
                          <Network className="w-4 h-4" />
                          Network Connections ({connections.length})
                        </h5>
                        <ScrollArea className="h-48">
                          <div className="space-y-2">
                            {connections.map((edge, index) => {
                              const connectedNodeId = edge.from === selectedNode ? edge.to : edge.from;
                              const connectedNode = processedMap.nodes.find(n => n.id === connectedNodeId);
                              
                              return (
                                <div key={index} className="p-3 bg-gradient-to-r from-muted/20 to-muted/40 rounded-lg border border-muted/50">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      {getNodeTypeIcon(connectedNode?.type || 'component')}
                                      <span className="font-medium">{connectedNode?.label || connectedNodeId}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="text-xs">
                                        {edge.relationshipType}
                                      </Badge>
                                      <span className={`text-xs font-mono ${getRelationshipColor(edge.relationshipType)}`}>
                                        {(edge.strength * 100).toFixed(0)}%
                                      </span>
                                    </div>
                                  </div>
                                  {edge.timeDelay && (
                                    <div className="text-xs text-muted-foreground">
                                      Propagation delay: {edge.timeDelay}ms
                                    </div>
                                  )}
                                  <div className="w-full bg-black/20 rounded-full h-1 mt-2">
                                    <div 
                                      className="bg-gradient-cosmic h-1 rounded-full transition-all duration-300" 
                                      style={{ width: `${edge.strength * 100}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </ScrollArea>
                      </div>
                    );
                  })()}
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {/* Enhanced System Information Footer */}
      <Card className="p-4 bg-gradient-to-r from-purple-500/5 to-pink-500/5 border-purple-500/20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="space-y-2">
            <h5 className="font-medium text-purple-300">System Information</h5>
            <div className="space-y-1 text-muted-foreground">
              <div>Scope: <span className="capitalize text-white">{currentMap.systemScope}</span></div>
              <div>Version: <span className="text-white">{currentMap.version}</span></div>
              <div>Updated: <span className="text-white">{new Date(currentMap.updatedAt).toLocaleTimeString()}</span></div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h5 className="font-medium text-pink-300">Network Topology</h5>
            <div className="space-y-1 text-muted-foreground">
              <div>Connectivity: <span className="text-white">{currentMap.complexityMetrics.averageConnectivity.toFixed(3)}</span></div>
              <div>Network Density: <span className="text-white">{(realTimeMetrics.connectivity * 100).toFixed(1)}%</span></div>
              <div>Fractal Dimension: <span className="text-white">{realTimeMetrics.fractalDimension.toFixed(3)}</span></div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h5 className="font-medium text-cyan-300">Consciousness State</h5>
            <div className="space-y-1 text-muted-foreground">
              <div>Awareness: <span className="text-white">{((currentConsciousness?.awarenessLevel || 0) * 100).toFixed(1)}%</span></div>
              <div>Recursion: <span className="text-white">{currentConsciousness?.recursionDepth || 0} layers</span></div>
              <div>State: <span className="text-white capitalize">{currentConsciousness?.state || 'dormant'}</span></div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};