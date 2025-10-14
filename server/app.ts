import express from 'express';
import cors from 'cors';
import { createRequire } from 'module';
import { JsonRpcProvider } from 'ethers';
import net from 'net';
import { URL } from 'url';
import { rateLimitGeneral } from './middleware/rateLimiting.js';
import { storage } from './storage.js';
import router from './routes.js';
import * as config from './config.js';
import { logger, logRequest, logApiCall } from './logger.js';
import { pool, checkDatabaseConnection } from '../db/index.js';

const app = express();
const PORT = config.apiPort;

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow same-origin or no origin (curl, server-to-server)
    if (!origin) return callback(null, true);
    if (config.allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS blocked'), false);
  },
  credentials: true
}));
app.use(express.json());
// Global basic rate limiting
app.use(rateLimitGeneral as any);
// Security headers (helmet-like)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  next();
});

// Request ID propagation
app.use((req: any, _res, next) => {
  const headerId = req.get?.('X-Request-ID') || req.headers['x-request-id'];
  req.requestId = headerId || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  next();
});

// Request logging middleware
app.use(logRequest);

// Health check
async function checkWeb3Providers() {
  const results: Record<string, boolean> = {};
  const entries: Array<[string, string | undefined]> = [
    ['ethereum', config.ethereumRpcUrl],
    ['polygon', config.polygonRpcUrl],
    ['bsc', config.bscRpcUrl],
  ];
  await Promise.all(entries.map(async ([name, url]) => {
    if (!url) { results[name] = false; return; }
    try {
      const provider = new JsonRpcProvider(url, undefined, { staticNetwork: null });
      const controller = new AbortController();
      const to = setTimeout(() => controller.abort(), 3000);
      await provider.getBlockNumber();
      clearTimeout(to);
      results[name] = true;
    } catch {
      results[name] = false;
    }
  }));
  return results;
}

async function checkIpfs() {
  if (!config.ipfsApiUrl) return false;
  try {
    const controller = new AbortController();
    const to = setTimeout(() => controller.abort(), 3000);
    const resp = await fetch(`${config.ipfsApiUrl}/api/v0/version`, { signal: controller.signal });
    clearTimeout(to);
    return resp.ok;
  } catch {
    return false;
  }
}

async function checkRedis() {
  if (!config.redisUrl) return false;
  try {
    const u = new URL(config.redisUrl);
    const host = u.hostname;
    const port = Number(u.port || 6379);
    const password = u.password;
    const socket = new net.Socket();
    const timeoutMs = 2000;
    return await new Promise<boolean>((resolve) => {
      let settled = false;
      const onError = () => { if (!settled) { settled = true; resolve(false); } };
      socket.setTimeout(timeoutMs, onError);
      socket.on('error', onError);
      socket.connect(port, host, () => {
        const authCmd = password ? `*2\r\n$4\r\nAUTH\r\n$${password.length}\r\n${password}\r\n` : '';
        const pingCmd = `*1\r\n$4\r\nPING\r\n`;
        socket.write(authCmd + pingCmd);
      });
      socket.on('data', (data) => {
        const text = data.toString();
        if (text.includes('+PONG')) {
          settled = true; resolve(true); socket.destroy();
        }
      });
      socket.on('close', () => { if (!settled) { resolve(false); } });
    });
  } catch {
    return false;
  }
}

app.get('/health', async (req, res) => {
  logApiCall('/health', 'GET', { userAgent: req.get('User-Agent') });
  const db = await checkDatabaseConnection();
  const [web3, ipfs, redis] = await Promise.all([checkWeb3Providers(), checkIpfs(), checkRedis()]);
  res.json({ status: 'OK', timestamp: new Date().toISOString(), dependencies: { db, web3, ipfs, redis } });
});

// Readiness check - verify core dependencies
app.get('/ready', async (req, res) => {
  const start = Date.now();
  const dbHealthy = await checkDatabaseConnection();
  const [web3, ipfsHealthy, redisHealthy] = await Promise.all([checkWeb3Providers(), checkIpfs(), checkRedis()]);
  const web3Healthy = Object.values(web3).some(Boolean);
  const result = {
    status: (dbHealthy && web3Healthy && ipfsHealthy && redisHealthy) ? 'READY' : 'DEGRADED',
    timestamp: new Date().toISOString(),
    latencyMs: Date.now() - start,
    dependencies: { db: dbHealthy, web3, ipfs: ipfsHealthy, redis: redisHealthy }
  };
  const code = (dbHealthy && web3Healthy && ipfsHealthy && redisHealthy) ? 200 : 503;
  res.status(code).json(result);
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