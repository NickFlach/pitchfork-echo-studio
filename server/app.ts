import express from 'express';
import cors from 'cors';
import { storage } from './storage.js';
import router from './routes.js';
import config from './config.js';
import { logger, logRequest, logApiCall } from './logger.js';

const app = express();
const PORT = config.apiPort;

// Middleware
app.use(cors({
  origin: config.allowedOrigins,
  credentials: true
}));
app.use(express.json());

// Request logging middleware
app.use(logRequest);

// Health check
app.get('/health', (req, res) => {
  logApiCall('/health', 'GET', { userAgent: req.get('User-Agent') });
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Mount API routes
app.use(router);

// Initialize sample data
async function initializeSampleData() {
  try {
    const agentId = 'default-agent';

    // Check if data already exists
    const existingStates = await storage.getConsciousnessStates(agentId);
    if (existingStates.length > 0) {
      logger.info('Sample consciousness data already exists');
      return;
    }

    // Create initial consciousness state
    await storage.createConsciousnessState({
      agentId,
      state: 'reflecting',
      awarenessLevel: 0.7,
      recursionDepth: 2,
      emergentInsights: ['Recursive self-observation detected', 'Pattern recognition improving'],
      activePatternsRecognized: ['decision-patterns', 'learning-loops'],
      orderChaosBalance: 0.6,
      connectedStates: [],
      contextLayers: ['syntax', 'architecture', 'user-experience'],
      focusAreas: ['decision-quality', 'pattern-recognition', 'system-awareness'],
      questioningLoops: [
        {
          question: 'How can I improve decision quality?',
          depth: 3,
          explorationPath: ['analyze-past-decisions', 'identify-patterns', 'extract-insights']
        }
      ],
      duration: 5000,
      transitionTrigger: 'system-initialization'
    });

    // Create a few more states for variety
    await storage.createConsciousnessState({
      agentId,
      state: 'processing',
      awarenessLevel: 0.85,
      recursionDepth: 1,
      emergentInsights: ['Data flow optimization identified'],
      activePatternsRecognized: ['performance-patterns'],
      orderChaosBalance: 0.3,
      connectedStates: [],
      contextLayers: ['performance', 'optimization'],
      focusAreas: ['performance-optimization', 'system-efficiency'],
      questioningLoops: [],
      duration: 3000,
      transitionTrigger: 'performance-monitoring'
    });

    // Create sample decision record
    await storage.createDecisionRecord({
      agentId,
      decisionType: 'strategic',
      context: 'Initializing consciousness monitoring system',
      reasoning: [
        {
          layer: 'architecture',
          rationale: 'Need baseline consciousness state for monitoring',
          confidence: 0.8,
          uncertainties: ['Long-term stability unknown']
        }
      ],
      alternatives: [
        {
          option: 'Start with minimal state',
          projectedOutcomes: ['Faster initialization', 'Less initial data'],
          cascadingEffects: ['Reduced insight generation initially']
        }
      ],
      chosenPath: 'Initialize with rich baseline state',
      cascadingEffects: {
        immediate: ['System becomes self-aware'],
        shortTerm: ['Pattern recognition begins'],
        longTerm: ['Emergent insights develop'],
        emergent: ['Recursive self-improvement possible']
      },
      patternsRecognized: ['initialization-pattern'],
      fractalConnections: [],
      nonlinearElements: ['emergent-awareness'],
      outcomeRealized: false,
      learningExtracted: []
    });

    // Create sample complexity map
    await storage.createComplexityMap({
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
      version: 1
    });

    logger.info('Sample consciousness data initialized successfully');
  } catch (error) {
    logger.error('Sample data initialization failed', error);
  }
}

// Start server
app.listen(PORT, '0.0.0.0', () => {
  logger.info('API Server started', {
    port: PORT,
    environment: config.nodeEnv,
    allowedOrigins: config.allowedOrigins
  });

  // Initialize sample data after server starts
  setTimeout(initializeSampleData, 1000);
});

export default app;