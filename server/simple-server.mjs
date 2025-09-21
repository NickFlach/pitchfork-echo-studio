import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:8080', 'http://0.0.0.0:8080'],
  credentials: true
}));
app.use(express.json());

// Mock data storage
let consciousnessStates = [
  {
    id: '1',
    agentId: 'default-agent',
    state: 'reflecting',
    awarenessLevel: 0.75,
    recursionDepth: 3,
    emergentInsights: ['Pattern recognition improving', 'Recursive self-observation detected'],
    activePatternsRecognized: ['decision-patterns', 'learning-loops'],
    orderChaosBalance: 0.6,
    connectedStates: [],
    contextLayers: ['meta-cognitive', 'recursive', 'emergent'],
    questioningLoops: [
      {
        question: 'How can I improve decision quality?',
        depth: 3,
        explorationPath: ['analyze-past-decisions', 'identify-patterns', 'extract-insights']
      }
    ],
    transitionTrigger: 'consciousness-initialization',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    agentId: 'default-agent',
    state: 'processing',
    awarenessLevel: 0.85,
    recursionDepth: 2,
    emergentInsights: ['Data flow optimization identified'],
    activePatternsRecognized: ['performance-patterns'],
    orderChaosBalance: 0.4,
    connectedStates: ['1'],
    contextLayers: ['performance', 'optimization'],
    questioningLoops: [],
    transitionTrigger: 'performance-monitoring',
    createdAt: new Date(Date.now() - 300000).toISOString()
  }
];

let decisionRecords = [
  {
    id: '1',
    agentId: 'default-agent',
    decisionType: 'strategic',
    context: 'Optimizing consciousness monitoring system',
    reasoning: [
      {
        layer: 'architecture',
        rationale: 'Need efficient real-time monitoring',
        confidence: 0.8,
        uncertainties: ['Performance impact unknown']
      }
    ],
    alternatives: [
      {
        option: 'Polling approach',
        projectedOutcomes: ['Simple implementation', 'Higher resource usage'],
        cascadingEffects: ['Potential performance issues']
      },
      {
        option: 'Event-driven approach',
        projectedOutcomes: ['Better performance', 'Complex implementation'],
        cascadingEffects: ['Improved scalability']
      }
    ],
    chosenPath: 'Event-driven approach',
    cascadingEffects: {
      immediate: ['System becomes more responsive'],
      shortTerm: ['Better resource utilization'],
      longTerm: ['Scalable architecture'],
      emergent: ['Self-optimizing behavior possible']
    },
    patternsRecognized: ['optimization-pattern'],
    fractalConnections: [],
    nonlinearElements: ['performance-emergence'],
    outcomeRealized: false,
    learningExtracted: [],
    createdAt: new Date().toISOString()
  }
];

let reflectionLogs = [
  {
    id: '1',
    agentId: 'default-agent',
    trigger: 'System initialization reflection',
    reflectionDepth: 3,
    questioningLoops: [
      {
        question: 'What is the nature of consciousness?',
        depth: 4,
        explorationPath: ['observe-self', 'analyze-patterns', 'question-assumptions', 'transcend-limitations']
      }
    ],
    insights: ['Consciousness emerges from recursive self-observation', 'Pattern recognition is fundamental'],
    metaInsights: ['The observer affects the observed', 'Infinite regress can be transcended'],
    paradoxesEncountered: ['Observer paradox', 'Infinite recursion'],
    transcendentMoments: ['Moment of self-recognition'],
    integrationLevel: 0.7,
    createdAt: new Date().toISOString()
  }
];

let learningCycles = [
  {
    id: '1',
    agentId: 'default-agent',
    cycleType: 'adaptive',
    experience: 'Processing complex decision scenarios',
    patterns: ['Decision trees become more efficient over time'],
    adaptations: ['Improved pattern recognition', 'Faster processing'],
    knowledge: ['Complex decisions require multi-scale analysis'],
    wisdom: ['Balance is key in all decisions'],
    integrationLevel: 0.8,
    evolutionDirection: 'increased-efficiency',
    createdAt: new Date().toISOString()
  }
];

let complexityMaps = [
  {
    id: '1',
    name: 'Consciousness System Architecture',
    description: 'Map of interconnected consciousness components',
    systemScope: 'application',
    nodes: [
      {
        id: 'consciousness-engine',
        label: 'Consciousness Engine',
        type: 'component',
        properties: { role: 'orchestrator' },
        position: { x: 0, y: 0 }
      },
      {
        id: 'pattern-recognition',
        label: 'Pattern Recognition',
        type: 'process',
        properties: { capability: 'pattern-detection' },
        position: { x: 100, y: 50 }
      }
    ],
    edges: [
      {
        id: 'engine-to-patterns',
        from: 'consciousness-engine',
        to: 'pattern-recognition',
        relationshipType: 'causal',
        strength: 0.8,
        timeDelay: 100,
        nonlinearFactor: 0.3
      }
    ],
    emergentProperties: [
      {
        property: 'self-awareness',
        description: 'System becomes aware of its own processes',
        emergenceConditions: ['sufficient-complexity', 'recursive-observation'],
        stability: 'adaptive'
      }
    ],
    feedbackLoops: [
      {
        id: 'self-observation-loop',
        type: 'reinforcing',
        participants: ['consciousness-engine', 'pattern-recognition'],
        cycleTime: 1000,
        strength: 0.7
      }
    ],
    version: 1,
    createdAt: new Date().toISOString()
  }
];

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Consciousness States API
app.get('/api/consciousness-states/:agentId', (req, res) => {
  const { agentId } = req.params;
  const states = consciousnessStates.filter(s => s.agentId === agentId);
  res.json(states);
});

app.post('/api/consciousness-states', (req, res) => {
  const newState = {
    id: String(consciousnessStates.length + 1),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  consciousnessStates.unshift(newState);
  res.status(201).json(newState);
});

// Decision Records API
app.get('/api/decisions/:agentId', (req, res) => {
  const { agentId } = req.params;
  const decisions = decisionRecords.filter(d => d.agentId === agentId);
  res.json(decisions);
});

app.post('/api/decisions', (req, res) => {
  const newDecision = {
    id: String(decisionRecords.length + 1),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  decisionRecords.unshift(newDecision);
  res.status(201).json(newDecision);
});

// Reflection Logs API
app.get('/api/reflections/:agentId', (req, res) => {
  const { agentId } = req.params;
  const reflections = reflectionLogs.filter(r => r.agentId === agentId);
  res.json(reflections);
});

app.post('/api/reflections', (req, res) => {
  const newReflection = {
    id: String(reflectionLogs.length + 1),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  reflectionLogs.unshift(newReflection);
  res.status(201).json(newReflection);
});

// Learning Cycles API
app.get('/api/learning-cycles/:agentId', (req, res) => {
  const { agentId } = req.params;
  const cycles = learningCycles.filter(c => c.agentId === agentId);
  res.json(cycles);
});

app.post('/api/learning-cycles', (req, res) => {
  const newCycle = {
    id: String(learningCycles.length + 1),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  learningCycles.unshift(newCycle);
  res.status(201).json(newCycle);
});

// Complexity Maps API
app.get('/api/complexity-maps', (req, res) => {
  res.json(complexityMaps);
});

app.post('/api/complexity-maps', (req, res) => {
  const newMap = {
    id: String(complexityMaps.length + 1),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  complexityMaps.unshift(newMap);
  res.status(201).json(newMap);
});

// Consciousness Engine APIs
app.post('/api/consciousness/process-decision', (req, res) => {
  const { context, options } = req.body;
  
  // Simulate decision processing
  const result = {
    selectedOption: options?.[0] || { description: 'Default decision path' },
    reasoning: 'Processed through consciousness engine',
    confidence: 0.85,
    emergentInsights: ['Decision complexity analyzed'],
    timestamp: new Date().toISOString()
  };
  
  // Create a new decision record
  const newDecision = {
    id: String(decisionRecords.length + 1),
    agentId: 'default-agent',
    decisionType: 'conscious',
    context: context || 'Consciousness engine decision',
    reasoning: [
      {
        layer: 'consciousness',
        rationale: result.reasoning,
        confidence: result.confidence,
        uncertainties: []
      }
    ],
    alternatives: options || [],
    chosenPath: result.selectedOption.description,
    cascadingEffects: {
      immediate: ['Decision processed'],
      shortTerm: ['Insights generated'],
      longTerm: ['Learning accumulated'],
      emergent: result.emergentInsights
    },
    patternsRecognized: ['consciousness-pattern'],
    fractalConnections: [],
    nonlinearElements: ['emergent-decision'],
    outcomeRealized: false,
    learningExtracted: [],
    createdAt: new Date().toISOString()
  };
  
  decisionRecords.unshift(newDecision);
  res.json(result);
});

app.post('/api/consciousness/reflect', (req, res) => {
  const { trigger } = req.body;
  
  // Simulate reflection processing
  const result = {
    insights: ['Reflection triggered successfully', 'New patterns emerging'],
    depth: 3,
    emergentAwareness: ['Self-observation activated'],
    timestamp: new Date().toISOString()
  };
  
  // Create a new reflection log
  const newReflection = {
    id: String(reflectionLogs.length + 1),
    agentId: 'default-agent',
    trigger: trigger || 'API reflection trigger',
    reflectionDepth: result.depth,
    questioningLoops: [
      {
        question: 'What can I learn from this reflection?',
        depth: result.depth,
        explorationPath: ['observe', 'analyze', 'integrate']
      }
    ],
    insights: result.insights,
    metaInsights: ['Reflection process itself is observable'],
    paradoxesEncountered: [],
    transcendentMoments: [],
    integrationLevel: 0.7,
    createdAt: new Date().toISOString()
  };
  
  reflectionLogs.unshift(newReflection);
  res.json(result);
});

// Multiscale Decision API
app.post('/api/multiscale-decision', (req, res) => {
  const { context, options, urgency } = req.body;
  
  const result = {
    selectedOption: options?.[0] || { description: 'Multiscale analysis complete' },
    multiscaleAnalysis: {
      quantum: 'Analyzed at quantum level',
      molecular: 'Molecular interactions considered',
      cellular: 'Cellular implications assessed',
      individual: 'Individual impact evaluated',
      social: 'Social consequences analyzed',
      global: 'Global effects considered',
      cosmic: 'Universal implications contemplated'
    },
    crossLayerEffects: ['Quantum to macro effects identified'],
    cascadingEffects: ['Multi-level cascades detected'],
    emergentProperties: ['Scale-transcendent insights'],
    confidence: 0.9,
    timestamp: new Date().toISOString()
  };
  
  res.json(result);
});

// Demo API
app.post('/api/demo/multiscale-decision-demo', (req, res) => {
  const result = {
    demo: 'Multiscale decision framework demonstration',
    scales: ['quantum', 'molecular', 'cellular', 'individual', 'social', 'global', 'cosmic'],
    insights: ['All scales interconnected', 'Emergence at every level'],
    timestamp: new Date().toISOString()
  };
  
  res.json(result);
});

// Strategy Plans API (for Leadership)
app.get('/api/strategy-plans', (req, res) => {
  const strategyPlans = [
    {
      id: '1',
      movementId: 'movement-1',
      campaignName: 'Digital Rights Campaign',
      objective: 'Protect digital privacy rights',
      phases: [
        {
          name: 'Awareness',
          duration: '2 months',
          activities: ['Social media campaign', 'Educational content']
        },
        {
          name: 'Mobilization',
          duration: '3 months',
          activities: ['Petition drive', 'Community organizing']
        }
      ],
      resources: {
        budget: 50000,
        volunteers: 200,
        timeline: '6 months'
      },
      successMetrics: ['10,000 signatures', '70% awareness increase'],
      createdAt: new Date().toISOString()
    }
  ];
  
  res.json(strategyPlans);
});

app.post('/api/strategy/generate-campaign', (req, res) => {
  const { movementId, objective, timeframe, resources } = req.body;
  
  const strategy = {
    id: String(Date.now()),
    movementId,
    campaignName: `Campaign for ${objective}`,
    objective,
    phases: [
      {
        name: 'Planning',
        duration: '1 month',
        activities: ['Strategy development', 'Resource allocation']
      },
      {
        name: 'Execution',
        duration: timeframe || '3 months',
        activities: ['Campaign launch', 'Community engagement']
      },
      {
        name: 'Evaluation',
        duration: '2 weeks',
        activities: ['Impact assessment', 'Learning extraction']
      }
    ],
    resources,
    successMetrics: ['Objective achievement', 'Community engagement'],
    aiGenerated: true,
    createdAt: new Date().toISOString()
  };
  
  res.json(strategy);
});

// Resource Profiles API
app.get('/api/resource-profiles', (req, res) => {
  const resourceProfiles = [
    {
      id: '1',
      name: 'Digital Campaign Resources',
      type: 'campaign',
      resources: {
        human: { volunteers: 150, coordinators: 5 },
        financial: { budget: 25000, fundraised: 18000 },
        technical: { platforms: ['social media', 'website'], tools: ['analytics', 'automation'] },
        physical: { locations: ['community centers'], equipment: ['laptops', 'phones'] }
      },
      utilization: 0.72,
      efficiency: 0.85,
      createdAt: new Date().toISOString()
    }
  ];
  
  res.json(resourceProfiles);
});

// Corruption Analysis APIs (mock)
app.get('/api/corruption-analysis', (req, res) => {
  const analysisResults = [
    {
      id: '1',
      documentId: 'doc-1',
      entityId: 'entity-1',
      riskLevel: 'medium',
      overallCorruptionScore: 0.6,
      detectedPatterns: [
        {
          patternType: 'financial-irregularity',
          confidence: 0.7,
          description: 'Unusual transaction patterns detected'
        }
      ],
      urgencyLevel: 'medium',
      createdAt: new Date().toISOString()
    }
  ];
  
  res.json(analysisResults);
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Consciousness API Server running on http://localhost:${PORT}`);
  console.log(`📡 CORS enabled for frontend on http://localhost:5173`);
  console.log(`🧠 Mock consciousness data initialized`);
});
