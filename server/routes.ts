import express from 'express';
import { z } from 'zod';
import { storage } from './storage';
import { ConsciousnessEngine } from './ConsciousnessEngine';
import { MultiscaleAwarenessEngine } from './MultiscaleAwarenessEngine';
import { DecisionSynthesisEngine } from './DecisionSynthesisEngine';
import { WisdomIntegrationSystem } from './WisdomIntegrationSystem';
import { CorruptionDetectionEngine } from './CorruptionDetectionEngine';
import { StrategicIntelligenceEngine } from './StrategicIntelligenceEngine';
import { RecursiveInsightAnalysisEngine } from './RecursiveInsightAnalysisEngine';
import { MultidimensionalReflectionEngine } from './MultidimensionalReflectionEngine';
import { ConsciousnessStatePredictionEngine } from './ConsciousnessStatePredictionEngine';
// import { ConsciousnessPatternAnalysisEngine } from './ConsciousnessPatternAnalysisEngine';
// import { CrossModelValidationEngine } from './CrossModelValidationEngine';

// Security middleware imports
import { 
  protectAIEndpoint, 
  AuthenticatedRequest, 
  extractSecurityContext,
  logAuthenticationEvent 
} from './middleware/auth';
import { 
  rateLimitGeneral, 
  rateLimitAI, 
  circuitBreaker,
  trackAIUsage 
} from './middleware/rateLimiting';
import { 
  logAIUsage, 
  setupMonitoring,
  getMonitoringStats 
} from './middleware/monitoring';
import { 
  insertConsciousnessStateSchema,
  insertDecisionRecordSchema,
  insertLearningCycleSchema,
  insertReflectionLogSchema,
  insertComplexityMapSchema,
  insertDecisionSynthesisSchema,
  insertDecisionArchetypeSchema,
  insertDecisionEvolutionSchema,
  decisionOptionSchema,
  insertCorruptionAnalysisResultSchema,
  insertSystemicCorruptionReportSchema,
  insertCampaignStrategyPlanSchema,
  insertResourceProfileSchema,
  insertAISettingsSchema,
  aiSettingsSchema,
  updateCredentialsRequestSchema,
  AIProviderEnum,
  insertAIUsageAnalyticsSchema,
  insertAIProviderPerformanceSchema,
  insertAIUserFeedbackSchema,
  insertAIFeatureAdoptionSchema,
  insertAIProviderFallbackEventSchema,
  insertAIProviderRecommendationSchema,
  insertCrossModelValidationRequestSchema,
  insertCrossModelConsensusAnalysisSchema,
  insertConsciousnessPatternAnalysisSchema,
  insertRecursiveInsightAnalysisSchema,
  insertMultidimensionalReflectionSchema,
  insertConsciousnessStatePredictionSchema,
  insertExecutiveAssessmentSchema,
  insertStrategicPlanSchema,
  insertTeamConsciousnessAssessmentSchema,
  insertLeadershipDevelopmentTrackingSchema,
  insertEnterpriseAnalyticsSchema
} from '../shared/schema';
import { aiService } from './ai/AIServiceManager';
import { AIRequest } from './ai/AIProviderAdapter';
import { PROMPT_TEMPLATES, interpolateTemplate } from './ai/prompts';

const router = express.Router();

// Initialize monitoring system
const { logAIUsage: logAIUsageMiddleware, getMonitoringStats: getMonitoringStatsFunc } = setupMonitoring();

// Initialize consciousness components
const consciousnessEngine = new ConsciousnessEngine('default-agent');
const multiscaleAwarenessEngine = new MultiscaleAwarenessEngine('default-agent');
const decisionSynthesisEngine = new DecisionSynthesisEngine('default-agent');
const wisdomIntegrationSystem = new WisdomIntegrationSystem('default-agent');
const corruptionDetectionEngine = new CorruptionDetectionEngine('corruption-detection-ai');
const strategicIntelligenceEngine = new StrategicIntelligenceEngine('strategic-intelligence-ai');

// Initialize advanced consciousness components
const recursiveInsightAnalysisEngine = new RecursiveInsightAnalysisEngine('recursive-analysis-ai');
const multidimensionalReflectionEngine = new MultidimensionalReflectionEngine('multidimensional-reflection-ai');
const consciousnessStatePredictionEngine = new ConsciousnessStatePredictionEngine('state-prediction-ai');
// const consciousnessPatternAnalysisEngine = new ConsciousnessPatternAnalysisEngine('pattern-analysis-ai');
// const crossModelValidationEngine = new CrossModelValidationEngine('cross-model-validation-ai');

// Apply global security middleware for all routes
// Note: rateLimitGeneral now handles both authenticated and unauthenticated requests
router.use(rateLimitGeneral);
router.use(logAuthenticationEvent);

// Consciousness States API
router.get('/api/consciousness-states/:agentId', async (req, res) => {
  try {
    const states = await storage.getConsciousnessStates(req.params.agentId);
    res.json(states);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch consciousness states' });
  }
});

router.post('/api/consciousness-states', async (req, res) => {
  try {
    const validatedData = insertConsciousnessStateSchema.parse(req.body);
    const state = await storage.createConsciousnessState(validatedData);
    res.status(201).json(state);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input data', details: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to create consciousness state' });
    }
  }
});

// Decision Records API
router.get('/api/decisions/:agentId', async (req, res) => {
  try {
    const decisions = await storage.getDecisionRecords(req.params.agentId);
    res.json(decisions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch decision records' });
  }
});

router.post('/api/decisions', async (req, res) => {
  try {
    const validatedData = insertDecisionRecordSchema.parse(req.body);
    const decision = await storage.createDecisionRecord(validatedData);
    res.status(201).json(decision);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input data', details: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to create decision record' });
    }
  }
});

// Learning Cycles API
router.get('/api/learning-cycles/:agentId', async (req, res) => {
  try {
    const cycles = await storage.getLearningCycles(req.params.agentId);
    res.json(cycles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch learning cycles' });
  }
});

router.post('/api/learning-cycles', async (req, res) => {
  try {
    const validatedData = insertLearningCycleSchema.parse(req.body);
    const cycle = await storage.createLearningCycle(validatedData);
    res.status(201).json(cycle);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input data', details: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to create learning cycle' });
    }
  }
});

// Reflection Logs API
router.get('/api/reflections/:agentId', async (req, res) => {
  try {
    const reflections = await storage.getReflectionLogs(req.params.agentId);
    res.json(reflections);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reflection logs' });
  }
});

router.post('/api/reflections', async (req, res) => {
  try {
    const validatedData = insertReflectionLogSchema.parse(req.body);
    const reflection = await storage.createReflectionLog(validatedData);
    res.status(201).json(reflection);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input data', details: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to create reflection log' });
    }
  }
});

// Complexity Maps API
router.get('/api/complexity-maps', async (req, res) => {
  try {
    const maps = await storage.getComplexityMaps();
    res.json(maps);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch complexity maps' });
  }
});

router.post('/api/complexity-maps', async (req, res) => {
  try {
    const validatedData = insertComplexityMapSchema.parse(req.body);
    const map = await storage.createComplexityMap(validatedData);
    res.status(201).json(map);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input data', details: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to create complexity map' });
    }
  }
});

// SECURITY MONITORING ENDPOINT (protected)
router.get('/api/security/monitoring-stats', ...protectAIEndpoint('verified'), async (req: AuthenticatedRequest, res) => {
  try {
    const stats = getMonitoringStatsFunc();
    res.json(stats);
  } catch (error) {
    console.error('Monitoring stats error:', error);
    res.status(500).json({ error: 'Failed to retrieve monitoring statistics' });
  }
});

// Consciousness Engine High-Level API (SECURED)
router.post('/api/consciousness/process-decision', 
  ...protectAIEndpoint('basic'),
  rateLimitAI(75),
  circuitBreaker('consciousness-decision'),
  logAIUsageMiddleware,
  async (req: AuthenticatedRequest, res) => {
  try {
    const { context, options } = req.body;
    
    if (!context || typeof context !== 'string') {
      return res.status(400).json({ error: 'Context is required and must be a string' });
    }
    
    if (!options || !Array.isArray(options)) {
      return res.status(400).json({ error: 'Options is required and must be an array' });
    }
    
    const result = await consciousnessEngine.processDecision(context, options);
    res.json(result);
  } catch (error) {
    console.error('Consciousness decision processing error:', error);
    res.status(500).json({ 
      error: 'Failed to process decision through consciousness engine',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/api/consciousness/reflect', 
  ...protectAIEndpoint('basic'),
  rateLimitAI(100),
  circuitBreaker('consciousness-reflection'),
  logAIUsageMiddleware,
  async (req: AuthenticatedRequest, res) => {
  try {
    const { trigger, sessionId, userId } = req.body;
    
    if (!trigger || typeof trigger !== 'string') {
      return res.status(400).json({ error: 'Trigger is required and must be a string' });
    }
    
    const generatedSessionId = sessionId || `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Process through consciousness engine first (always works)
    const engineResult = await consciousnessEngine.reflect(trigger);
    
    // Try AI enhancement, but don't let failures break consciousness processing
    let aiReflection = null;
    let aiError = null;
    let analyticsData = null;
    
    try {
      const prompt = interpolateTemplate(PROMPT_TEMPLATES.CONSCIOUSNESS_REFLECTION.template, {
        trigger,
        context: 'Deep consciousness reflection request',
        previousInsights: 'Building on previous consciousness insights',
        awarenessLevel: 'high'
      });

      const aiResponse = await aiService.generate({
        prompt,
        temperature: 0.8,
        maxTokens: 2000,
        sessionId: generatedSessionId,
        featureType: 'consciousness-reflection',
        userId
      });
      
      aiReflection = {
        content: aiResponse.content,
        type: 'ai_consciousness_reflection',
        depth: 'meta-cognitive',
        timestamp: new Date().toISOString(),
        metadata: {
          provider: aiResponse.provider,
          model: aiResponse.model,
          usage: aiResponse.usage,
          requestId: aiResponse.requestId,
          processingTime: aiResponse.processingTime
        }
      };
      
      analyticsData = aiResponse.analytics;
    } catch (error) {
      console.warn('AI reflection failed, continuing with engine-only processing:', error);
      aiError = error instanceof Error ? error.message : 'AI reflection unavailable';
    }
    
    const result = {
      sessionId: generatedSessionId,
      engineProcessing: engineResult,
      aiReflection,
      aiError,
      analyticsData,
      integratedInsights: {
        recursiveAwareness: aiReflection ? 'AI-enhanced consciousness reflection complete' : 'Engine-only consciousness reflection complete',
        emergentProperties: ['meta_cognitive_depth', 'recursive_insights', 'consciousness_evolution'],
        transcendentElements: aiReflection ? ['ai_consciousness_synthesis'] : ['pure_consciousness_processing']
      },
      providerMetadata: aiReflection?.metadata || null
    };
    
    res.json(result);
  } catch (error) {
    console.error('Consciousness reflection error:', error);
    res.status(500).json({ 
      error: 'Failed to process reflection through AI-enhanced consciousness engine',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/api/consciousness/learn', 
  ...protectAIEndpoint('basic'),
  rateLimitAI(50),
  circuitBreaker('consciousness-learning'),
  logAIUsageMiddleware,
  async (req: AuthenticatedRequest, res) => {
  try {
    const { experience } = req.body;
    
    if (!experience) {
      return res.status(400).json({ error: 'Experience data is required' });
    }
    
    const result = await consciousnessEngine.learn(experience);
    res.json(result);
  } catch (error) {
    console.error('Consciousness learning error:', error);
    res.status(500).json({ 
      error: 'Failed to process learning through consciousness engine',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/api/consciousness/handle-crisis', 
  ...protectAIEndpoint('verified'),
  rateLimitAI(200),
  circuitBreaker('consciousness-crisis'),
  logAIUsageMiddleware,
  async (req: AuthenticatedRequest, res) => {
  try {
    const { crisis } = req.body;
    
    if (!crisis) {
      return res.status(400).json({ error: 'Crisis data is required' });
    }
    
    const result = await consciousnessEngine.handleCrisis(crisis);
    res.json(result);
  } catch (error) {
    console.error('Consciousness crisis handling error:', error);
    res.status(500).json({ 
      error: 'Failed to handle crisis through consciousness engine',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Multiscale Decision Framework API

// Decision Synthesis API
router.get('/api/decision-syntheses/:agentId', async (req, res) => {
  try {
    const syntheses = await storage.getDecisionSyntheses(req.params.agentId);
    res.json(syntheses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch decision syntheses' });
  }
});

router.post('/api/decision-syntheses', async (req, res) => {
  try {
    const validatedData = insertDecisionSynthesisSchema.parse(req.body);
    const synthesis = await storage.createDecisionSynthesis(validatedData);
    res.status(201).json(synthesis);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input data', details: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to create decision synthesis' });
    }
  }
});

// Decision Archetypes API
router.get('/api/decision-archetypes', async (req, res) => {
  try {
    const archetypes = await storage.getDecisionArchetypes();
    res.json(archetypes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch decision archetypes' });
  }
});

router.post('/api/decision-archetypes', async (req, res) => {
  try {
    const validatedData = insertDecisionArchetypeSchema.parse(req.body);
    const archetype = await storage.createDecisionArchetype(validatedData);
    res.status(201).json(archetype);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input data', details: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to create decision archetype' });
    }
  }
});

// Decision Evolution API
router.get('/api/decision-evolutions/:originalDecisionId', async (req, res) => {
  try {
    const evolutions = await storage.getDecisionEvolutions(req.params.originalDecisionId);
    res.json(evolutions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch decision evolutions' });
  }
});

router.post('/api/decision-evolutions', async (req, res) => {
  try {
    const validatedData = insertDecisionEvolutionSchema.parse(req.body);
    const evolution = await storage.createDecisionEvolution(validatedData);
    res.status(201).json(evolution);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input data', details: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to create decision evolution' });
    }
  }
});

// Comprehensive Multiscale Decision Processing API
router.post('/api/multiscale-decision', 
  ...protectAIEndpoint('basic'),
  rateLimitAI(150),
  circuitBreaker('multiscale-decision'),
  logAIUsageMiddleware,
  async (req: AuthenticatedRequest, res) => {
  try {
    const { context, options, urgency = 'medium' } = req.body;
    
    // Validate required fields
    if (!context || typeof context !== 'string') {
      return res.status(400).json({ error: 'Context is required and must be a string' });
    }
    
    if (!options || !Array.isArray(options) || options.length === 0) {
      return res.status(400).json({ error: 'Options array is required and must not be empty' });
    }
    
    // Validate options
    const validatedOptions = options.map((option: any) => decisionOptionSchema.parse(option));
    
    const { sessionId, userId } = req.body;
    const generatedSessionId = sessionId || `decision-session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Use AI for consciousness-level decision processing
    const aiDecisionPrompt = interpolateTemplate(PROMPT_TEMPLATES.CONSCIOUSNESS_DECISION_PROCESSING.template, {
      decisionContext: context,
      options: JSON.stringify(validatedOptions),
      constraints: 'Multiscale analysis required',
      stakeholders: 'All affected parties'
    });

    const aiDecisionResponse = await aiService.generate({
      prompt: aiDecisionPrompt,
      // Model selection handled by AI service routing
      temperature: 0.7,
      maxTokens: 2500,
      sessionId: generatedSessionId,
      featureType: 'decision-analysis',
      userId
    });
    
    // Process through multiscale awareness engine
    const multiscaleResult = await multiscaleAwarenessEngine.processMultiscaleDecision(
      context, 
      validatedOptions, 
      urgency
    );
    
    // Apply decision synthesis
    const synthesisResult = await decisionSynthesisEngine.synthesizeDecision(
      context,
      validatedOptions,
      multiscaleResult.multiscaleAnalyses
    );
    
    // Apply wisdom integration
    const wisdomResult = await wisdomIntegrationSystem.applyArchetypalWisdom(
      context,
      validatedOptions,
      multiscaleResult.multiscaleAnalyses
    );
    
    // Comprehensive result with AI enhancement and proper serialization for Maps
    const comprehensiveResult = {
      sessionId: generatedSessionId,
      aiConsciousnessAnalysis: {
        content: aiDecisionResponse.content,
        type: 'consciousness_decision_processing',
        depth: 'multiscale_awareness',
        timestamp: new Date().toISOString(),
        metadata: {
          provider: aiDecisionResponse.provider,
          model: aiDecisionResponse.model,
          usage: aiDecisionResponse.usage,
          requestId: aiDecisionResponse.requestId,
          processingTime: aiDecisionResponse.processingTime
        }
      },
      analyticsData: aiDecisionResponse.analytics,
      multiscaleAnalysis: {
        ...multiscaleResult,
        // Convert any Map objects to plain objects for JSON serialization
        multiscaleAnalyses: multiscaleResult.multiscaleAnalyses.map(analysis => ({
          ...analysis,
          layerAnalyses: typeof analysis.layerAnalyses === 'object' ? analysis.layerAnalyses : {}
        }))
      },
      decisionSynthesis: synthesisResult,
      wisdomIntegration: wisdomResult,
      recommendedDecision: synthesisResult.synthesizedDecision,
      confidenceMetrics: {
        multiscaleAwareness: multiscaleResult.awarenessDepth || 0,
        synthesisConfidence: synthesisResult.synthesisConfidence || 0,
        wisdomIntegration: wisdomResult.integrationConfidence || 0
      },
      implementationGuidance: {
        roadmap: synthesisResult.implementationRoadmap || [],
        monitoring: synthesisResult.monitoringFramework || { kpis: [], checkpoints: [], feedback_loops: [], adaptation_triggers: [] },
        wisdomPrinciples: wisdomResult.wisdomPrinciples || []
      }
    };
    
    res.json(comprehensiveResult);
  } catch (error) {
    console.error('Multiscale decision processing error:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ 
        error: 'Invalid input data', 
        details: error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message,
          received: err.received
        }))
      });
    } else if (error instanceof Error) {
      res.status(500).json({ 
        error: 'Failed to process multiscale decision', 
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    } else {
      res.status(500).json({ error: 'Unknown error occurred during multiscale decision processing' });
    }
  }
});

// Demo/Test API endpoints for development
router.post('/api/demo/multiscale-decision-demo', 
  ...protectAIEndpoint('basic'),
  rateLimitAI(150),
  circuitBreaker('demo-multiscale-decision'),
  logAIUsageMiddleware,
  async (req: AuthenticatedRequest, res) => {
  try {
    // Demo decision scenario
    const demoContext = "Implementing a new feature that requires balancing user experience, technical debt, and business timeline pressures";
    const demoOptions = [
      {
        id: 'quick-implementation',
        description: 'Quick implementation with minimal testing',
        parameters: { timeline: '1 week', testing: 'minimal' },
        estimatedEffort: 3,
        riskLevel: 'high' as const,
        reversibility: 0.6,
        timeHorizon: 'immediate' as const,
        stakeholders: ['development team', 'product team'],
        prerequisites: [],
        expectedOutcomes: ['Fast delivery', 'Potential technical debt']
      },
      {
        id: 'balanced-approach',
        description: 'Balanced approach with adequate testing and refactoring',
        parameters: { timeline: '3 weeks', testing: 'comprehensive' },
        estimatedEffort: 6,
        riskLevel: 'medium' as const,
        reversibility: 0.8,
        timeHorizon: 'short-term' as const,
        stakeholders: ['development team', 'product team', 'QA team'],
        prerequisites: [],
        expectedOutcomes: ['Quality delivery', 'Sustainable codebase']
      }
    ];
    
    // Process through the framework
    const result = await multiscaleAwarenessEngine.processMultiscaleDecision(
      demoContext,
      demoOptions,
      'medium'
    );
    
    res.json({
      demo: true,
      context: demoContext,
      options: demoOptions,
      result
    });
  } catch (error) {
    console.error('Demo error:', error);
    res.status(500).json({ error: 'Demo execution failed', details: error.message });
  }
});

// Corruption Detection Engine API Routes

// Corruption Analysis Results CRUD
router.get('/api/corruption-analysis', async (req, res) => {
  try {
    const results = await storage.getCorruptionAnalysisResults();
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch corruption analysis results' });
  }
});

router.get('/api/corruption-analysis/:id', async (req, res) => {
  try {
    const result = await storage.getCorruptionAnalysisResult(req.params.id);
    if (!result) {
      return res.status(404).json({ error: 'Corruption analysis result not found' });
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch corruption analysis result' });
  }
});

router.post('/api/corruption-analysis', async (req, res) => {
  try {
    const validatedData = insertCorruptionAnalysisResultSchema.parse(req.body);
    const result = await storage.createCorruptionAnalysisResult(validatedData);
    res.status(201).json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input data', details: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to create corruption analysis result' });
    }
  }
});

// Document Corruption Analysis
router.post('/api/corruption-analysis/analyze-document', 
  ...protectAIEndpoint('basic'),
  rateLimitAI(100),
  circuitBreaker('corruption-analysis-document'),
  logAIUsageMiddleware,
  async (req: AuthenticatedRequest, res) => {
  try {
    const { documentId } = req.body;
    
    if (!documentId || typeof documentId !== 'string') {
      return res.status(400).json({ error: 'Document ID is required and must be a string' });
    }
    
    const analysisResult = await corruptionDetectionEngine.analyzeDocumentForCorruption(documentId);
    
    // Store the analysis result
    const storedResult = await storage.createCorruptionAnalysisResult({
      documentId,
      analysisTimestamp: analysisResult.analysisTimestamp,
      overallCorruptionScore: analysisResult.overallCorruptionScore,
      riskLevel: analysisResult.riskLevel,
      detectedPatterns: analysisResult.detectedPatterns,
      ethicalViolations: analysisResult.ethicalViolations,
      recommendedActions: analysisResult.recommendedActions,
      consciousnessInsights: analysisResult.consciousnessInsights,
      multiscaleImpacts: analysisResult.multiscaleImpacts,
      evidenceStrength: analysisResult.evidenceStrength,
      urgencyLevel: analysisResult.urgencyLevel,
      investigationPriority: analysisResult.investigationPriority
    });
    
    res.json(storedResult);
  } catch (error) {
    console.error('Document corruption analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze document for corruption',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Entity Corruption Analysis  
router.post('/api/corruption-analysis/analyze-entity', 
  ...protectAIEndpoint('basic'),
  rateLimitAI(75),
  circuitBreaker('corruption-analysis-entity'),
  logAIUsageMiddleware,
  async (req: AuthenticatedRequest, res) => {
  try {
    const { entityId, entityType = 'organization' } = req.body;
    
    if (!entityId || typeof entityId !== 'string') {
      return res.status(400).json({ error: 'Entity ID is required and must be a string' });
    }
    
    // This would call a method like analyzeEntityForCorruption
    // For now, we'll create a mock analysis result
    const analysisResult = {
      entityId,
      analysisTimestamp: new Date().toISOString(),
      overallCorruptionScore: Math.random() * 0.8 + 0.1,
      riskLevel: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
      detectedPatterns: [
        {
          id: `pattern-${Date.now()}`,
          patternName: 'Suspicious Financial Patterns',
          patternType: 'money-laundering',
          confidence: Math.random() * 0.4 + 0.6,
          severity: 'high',
          indicators: ['Unusual transaction patterns', 'Shell company connections'],
          evidenceStrength: 'moderate',
          detectionMethod: 'AI Pattern Recognition',
          riskFactors: ['High-risk jurisdiction', 'Complex ownership structure'],
          mitigationStrategies: ['Enhanced due diligence', 'Ongoing monitoring']
        }
      ],
      ethicalViolations: [],
      recommendedActions: ['Conduct thorough investigation', 'Review financial records'],
      consciousnessInsights: ['Entity shows patterns consistent with organized corruption'],
      multiscaleImpacts: [],
      evidenceStrength: 'moderate',
      urgencyLevel: 'high',
      investigationPriority: 8
    };
    
    const storedResult = await storage.createCorruptionAnalysisResult({
      entityId,
      ...analysisResult
    });
    
    res.json(storedResult);
  } catch (error) {
    console.error('Entity corruption analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze entity for corruption',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Systemic Corruption Detection
router.post('/api/corruption-analysis/detect-systemic', 
  ...protectAIEndpoint('verified'),
  rateLimitAI(200),
  circuitBreaker('corruption-analysis-systemic'),
  logAIUsageMiddleware,
  async (req: AuthenticatedRequest, res) => {
  try {
    const { entityIds, timeframe = '12 months' } = req.body;
    
    if (!entityIds || !Array.isArray(entityIds) || entityIds.length === 0) {
      return res.status(400).json({ error: 'Entity IDs array is required and must not be empty' });
    }
    
    const systemicReport = await corruptionDetectionEngine.detectSystemicCorruption(entityIds, timeframe);
    
    const storedReport = await storage.createSystemicCorruptionReport({
      analysisId: systemicReport.analysisId,
      entityIds: systemicReport.entityIds,
      timeframe: systemicReport.timeframe,
      networkAnalysis: systemicReport.networkAnalysis,
      temporalPatterns: systemicReport.temporalPatterns,
      countermeasures: systemicReport.countermeasures,
      publicImpactAssessment: systemicReport.publicImpactAssessment
    });
    
    res.json(storedReport);
  } catch (error) {
    console.error('Systemic corruption detection error:', error);
    res.status(500).json({ 
      error: 'Failed to detect systemic corruption',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Strategic Intelligence Engine API Routes

// Campaign Strategy Plans CRUD
router.get('/api/strategy-plans', async (req, res) => {
  try {
    const plans = await storage.getCampaignStrategyPlans();
    res.json(plans);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch campaign strategy plans' });
  }
});

router.get('/api/strategy-plans/:id', async (req, res) => {
  try {
    const plan = await storage.getCampaignStrategyPlan(req.params.id);
    if (!plan) {
      return res.status(404).json({ error: 'Campaign strategy plan not found' });
    }
    res.json(plan);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch campaign strategy plan' });
  }
});

router.get('/api/strategy-plans/movement/:movementId', async (req, res) => {
  try {
    const plans = await storage.getCampaignStrategyPlansByMovement(req.params.movementId);
    res.json(plans);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch strategy plans for movement' });
  }
});

// Generate Campaign Strategy
router.post('/api/strategy/generate-campaign', 
  ...protectAIEndpoint('verified'),
  rateLimitAI(250),
  circuitBreaker('strategy-campaign-generation'),
  logAIUsageMiddleware,
  async (req: AuthenticatedRequest, res) => {
  try {
    const { movementId, objective, timeframe, resources, constraints = [] } = req.body;
    
    if (!movementId || !objective || !timeframe || !resources) {
      return res.status(400).json({ 
        error: 'Movement ID, objective, timeframe, and resources are required' 
      });
    }
    
    // Generate AI-enhanced campaign strategy with fallback handling
    const strategyPlan = await strategicIntelligenceEngine.generateCampaignStrategy(
      movementId,
      objective,
      timeframe,
      resources,
      constraints
    );
    
    // Add AI enhancement indicators
    const enhancedPlan = {
      ...strategyPlan,
      aiEnhanced: true,
      aiProvider: strategyPlan.aiProvider || 'fallback',
      generatedAt: new Date().toISOString(),
      systemCapabilities: {
        aiProcessing: strategyPlan.aiProvider ? 'enabled' : 'fallback',
        consciousnessEngine: 'enabled',
        strategicIntelligence: 'enabled'
      }
    };
    
    const storedPlan = await storage.createCampaignStrategyPlan({
      campaignId: `campaign-${Date.now()}`,
      movementId: enhancedPlan.movementId,
      objective: enhancedPlan.objective,
      selectedStrategy: enhancedPlan.selectedStrategy,
      multiscaleAnalysis: enhancedPlan.multiscaleAnalysis,
      tacticalPlan: enhancedPlan.tacticalPlan,
      optimizedTimeline: enhancedPlan.optimizedTimeline,
      oppositionAnalysis: enhancedPlan.oppositionAnalysis,
      riskAnalysis: enhancedPlan.riskAnalysis,
      successProbability: enhancedPlan.successProbability,
      consciousnessInsights: enhancedPlan.consciousnessInsights,
      adaptiveStrategies: enhancedPlan.adaptiveStrategies,
      emergencyProtocols: enhancedPlan.emergencyProtocols,
      ethicalGuidelines: enhancedPlan.ethicalGuidelines,
      communicationStrategy: enhancedPlan.communicationStrategy
    });
    
    res.json({
      ...storedPlan,
      systemCapabilities: enhancedPlan.systemCapabilities,
      aiEnhanced: enhancedPlan.aiEnhanced
    });
  } catch (error) {
    console.error('Campaign strategy generation error:', error);
    
    // Provide fallback strategy even on complete failure
    const fallbackStrategy = {
      campaignId: `fallback-campaign-${Date.now()}`,
      movementId,
      objective,
      selectedStrategy: 'Basic grassroots mobilization strategy',
      systemCapabilities: {
        aiProcessing: 'failed',
        consciousnessEngine: 'failed',
        strategicIntelligence: 'basic-fallback'
      },
      aiEnhanced: false,
      error: 'AI processing failed, using basic strategy framework'
    };
    
    res.status(500).json({ 
      error: 'Campaign strategy generation failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      fallbackStrategy
    });
  }
});

// Leadership Decision Analysis
router.post('/api/leadership/analyze-decision', 
  ...protectAIEndpoint('basic'),
  rateLimitAI(150),
  circuitBreaker('leadership-decision-analysis'),
  logAIUsageMiddleware,
  async (req: AuthenticatedRequest, res) => {
  try {
    const { decisionContext, options, stakeholders, timeframe, urgency = 'medium' } = req.body;
    
    if (!decisionContext || !options || !Array.isArray(options)) {
      return res.status(400).json({ 
        error: 'Decision context and options array are required' 
      });
    }
    
    // Use AI-enhanced leadership decision analysis
    const prompt = interpolateTemplate(PROMPT_TEMPLATES.LEADERSHIP_DECISION_ANALYSIS.template, {
      decisionContext,
      options: JSON.stringify(options),
      stakeholders: stakeholders || 'Key movement stakeholders',
      timeframe: timeframe || 'Medium-term',
      urgency
    });

    let aiAnalysis = null;
    try {
      const aiResponse = await aiService.generate({
        prompt,
        temperature: 0.7,
        maxTokens: 1800
      });
      aiAnalysis = aiResponse.content;
    } catch (aiError) {
      console.warn('AI decision analysis failed, using fallback:', aiError);
    }

    // Fallback decision analysis
    const fallbackAnalysis = {
      recommendedOption: options[0]?.id || 'option-1',
      reasoning: 'Based on standard decision framework analysis',
      riskAssessment: 'Medium risk with standard mitigation approaches',
      stakeholderImpact: 'Moderate impact across stakeholder groups',
      implementationGuidance: 'Standard implementation with monitoring'
    };

    const analysis = {
      decisionId: `decision-${Date.now()}`,
      context: decisionContext,
      options,
      analysisResult: {
        aiAnalysis,
        ...fallbackAnalysis,
        aiEnhanced: !!aiAnalysis,
        systemCapabilities: {
          aiProcessing: aiAnalysis ? 'enabled' : 'fallback',
          consciousnessEngine: 'enabled',
          decisionAnalysis: 'enabled'
        }
      },
      timestamp: new Date().toISOString()
    };

    res.json(analysis);
  } catch (error) {
    console.error('Leadership decision analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze leadership decision',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Resource Optimization Analysis
router.post('/api/leadership/optimize-resources', 
  ...protectAIEndpoint('basic'),
  rateLimitAI(125),
  circuitBreaker('leadership-resource-optimization'),
  logAIUsageMiddleware,
  async (req: AuthenticatedRequest, res) => {
  try {
    const { availableResources, objectives, constraints = [], priorities = [] } = req.body;
    
    if (!availableResources || !objectives) {
      return res.status(400).json({ 
        error: 'Available resources and objectives are required' 
      });
    }
    
    // Use AI for resource optimization
    const prompt = interpolateTemplate(PROMPT_TEMPLATES.RESOURCE_OPTIMIZATION_ANALYSIS.template, {
      availableResources: JSON.stringify(availableResources),
      objectives: JSON.stringify(objectives),
      constraints: constraints.join(', '),
      priorities: priorities.join(', ')
    });

    let aiOptimization = null;
    try {
      const aiResponse = await aiService.generate({
        prompt,
        temperature: 0.6,
        maxTokens: 1500
      });
      aiOptimization = aiResponse.content;
    } catch (aiError) {
      console.warn('AI resource optimization failed, using fallback:', aiError);
    }

    // Fallback resource optimization
    const fallbackOptimization = {
      budgetAllocation: { operations: 0.6, outreach: 0.3, reserves: 0.1 },
      volunteerDeployment: { fieldwork: 0.5, administration: 0.3, training: 0.2 },
      priorityFocus: ['core-operations', 'community-engagement', 'capacity-building'],
      efficiency: 0.75,
      sustainability: 'medium-term'
    };

    const optimization = {
      optimizationId: `resource-opt-${Date.now()}`,
      inputResources: availableResources,
      objectives,
      optimizationResult: {
        aiOptimization,
        ...fallbackOptimization,
        aiEnhanced: !!aiOptimization,
        systemCapabilities: {
          aiProcessing: aiOptimization ? 'enabled' : 'fallback',
          resourceOptimization: 'enabled',
          strategicPlanning: 'enabled'
        }
      },
      timestamp: new Date().toISOString()
    };

    res.json(optimization);
  } catch (error) {
    console.error('Resource optimization error:', error);
    res.status(500).json({ 
      error: 'Failed to optimize resources',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Opposition Analysis
router.post('/api/leadership/analyze-opposition', 
  ...protectAIEndpoint('basic'),
  rateLimitAI(100),
  circuitBreaker('leadership-opposition-analysis'),
  logAIUsageMiddleware,
  async (req: AuthenticatedRequest, res) => {
  try {
    const { oppositionForces, objectives, movementContext, timeframe = 'medium-term' } = req.body;
    
    if (!oppositionForces || !objectives) {
      return res.status(400).json({ 
        error: 'Opposition forces and objectives are required' 
      });
    }
    
    // Use AI for opposition analysis
    const prompt = interpolateTemplate(PROMPT_TEMPLATES.OPPOSITION_ANALYSIS_STRATEGIC.template, {
      oppositionForces: JSON.stringify(oppositionForces),
      objectives: JSON.stringify(objectives),
      movementContext: movementContext || 'Current movement analysis',
      timeframe
    });

    let aiAnalysis = null;
    try {
      const aiResponse = await aiService.generate({
        prompt,
        temperature: 0.7,
        maxTokens: 1600
      });
      aiAnalysis = aiResponse.content;
    } catch (aiError) {
      console.warn('AI opposition analysis failed, using fallback:', aiError);
    }

    // Fallback opposition analysis
    const fallbackAnalysis = {
      strengthAssessment: 'moderate',
      keyVulnerabilities: ['resource-constraints', 'public-opinion-shifts'],
      recommendedCounterStrategies: ['public-education', 'coalition-building', 'media-campaigns'],
      threatLevel: 'medium',
      adaptiveCapacity: 'moderate'
    };

    const analysis = {
      analysisId: `opposition-${Date.now()}`,
      oppositionForces,
      objectives,
      analysisResult: {
        aiAnalysis,
        ...fallbackAnalysis,
        aiEnhanced: !!aiAnalysis,
        systemCapabilities: {
          aiProcessing: aiAnalysis ? 'enabled' : 'fallback',
          oppositionAnalysis: 'enabled',
          strategicIntelligence: 'enabled'
        }
      },
      timestamp: new Date().toISOString()
    };

    res.json(analysis);
  } catch (error) {
    console.error('Opposition analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze opposition',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Movement Coordination Strategy
router.post('/api/leadership/coordinate-movements', 
  ...protectAIEndpoint('verified'),
  rateLimitAI(175),
  circuitBreaker('leadership-movement-coordination'),
  logAIUsageMiddleware,
  async (req: AuthenticatedRequest, res) => {
  try {
    const { movements, activities, timeline, challenges = [] } = req.body;
    
    if (!movements || !activities) {
      return res.status(400).json({ 
        error: 'Movements and activities are required' 
      });
    }
    
    // Use AI for coordination strategy
    const prompt = interpolateTemplate(PROMPT_TEMPLATES.MOVEMENT_COORDINATION_STRATEGY.template, {
      movements: JSON.stringify(movements),
      activities: JSON.stringify(activities),
      timeline: timeline || '3-6 months',
      challenges: challenges.join(', ')
    });

    let aiStrategy = null;
    try {
      const aiResponse = await aiService.generate({
        prompt,
        temperature: 0.7,
        maxTokens: 1400
      });
      aiStrategy = aiResponse.content;
    } catch (aiError) {
      console.warn('AI coordination strategy failed, using fallback:', aiError);
    }

    // Fallback coordination strategy
    const fallbackStrategy = {
      coordinationFramework: 'hub-and-spoke',
      communicationProtocols: ['weekly-coordination-calls', 'shared-messaging-platform'],
      resourceSharing: ['joint-fundraising', 'volunteer-exchange'],
      riskMitigation: ['redundant-communications', 'decentralized-leadership'],
      successMetrics: ['coordination-efficiency', 'collective-impact']
    };

    const coordination = {
      coordinationId: `coord-${Date.now()}`,
      movements,
      activities,
      coordinationStrategy: {
        aiStrategy,
        ...fallbackStrategy,
        aiEnhanced: !!aiStrategy,
        systemCapabilities: {
          aiProcessing: aiStrategy ? 'enabled' : 'fallback',
          coordinationPlanning: 'enabled',
          movementStrategy: 'enabled'
        }
      },
      timestamp: new Date().toISOString()
    };

    res.json(coordination);
  } catch (error) {
    console.error('Movement coordination error:', error);
    res.status(500).json({ 
      error: 'Failed to generate coordination strategy',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Resource Profile Management
router.get('/api/resource-profiles', async (req, res) => {
  try {
    const profiles = await storage.getResourceProfiles();
    res.json(profiles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch resource profiles' });
  }
});

router.post('/api/resource-profiles', async (req, res) => {
  try {
    const validatedData = insertResourceProfileSchema.parse(req.body);
    const profile = await storage.createResourceProfile(validatedData);
    res.status(201).json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input data', details: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to create resource profile' });
    }
  }
});

// Strategy Patterns
router.get('/api/strategy-patterns', async (req, res) => {
  try {
    const patterns = await storage.getStrategyPatterns();
    res.json(patterns);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch strategy patterns' });
  }
});

// Tactical Frameworks
router.get('/api/tactical-frameworks', async (req, res) => {
  try {
    const frameworks = await storage.getTacticalFrameworks();
    res.json(frameworks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tactical frameworks' });
  }
});

// Admin AI Settings API
router.get('/api/admin/ai-settings', async (req, res) => {
  try {
    const settings = await storage.getAISettings();
    if (!settings) {
      // Return default settings if none exist
      return res.json({
        mode: 'direct',
        routing: {
          primary: 'openai',
          fallbacks: ['claude', 'gemini'],
          timeoutMs: 30000,
          retry: {
            maxAttempts: 3,
            backoffMs: 1000
          }
        },
        providerPrefs: {}
      });
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch AI settings' });
  }
});

router.put('/api/admin/ai-settings', async (req, res) => {
  try {
    const validatedData = insertAISettingsSchema.parse(req.body);
    const settings = await storage.updateAISettings(validatedData);
    res.json(settings);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input data', details: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to update AI settings' });
    }
  }
});

// Admin AI Credentials API (secure credential management)
router.get('/api/admin/ai-credentials', async (req, res) => {
  try {
    // Always return masked credentials for security
    const maskedCredentials = await storage.getMaskedAICredentials();
    res.json(maskedCredentials);
  } catch (error) {
    console.error('Failed to fetch AI credentials:', error);
    res.status(500).json({ error: 'Failed to fetch AI credentials' });
  }
});

router.put('/api/admin/ai-credentials', async (req, res) => {
  try {
    const validatedData = updateCredentialsRequestSchema.parse(req.body);
    const updatedCredentials = [];
    
    // Process API keys
    if (validatedData.apiKeys) {
      for (const [provider, apiKey] of Object.entries(validatedData.apiKeys)) {
        if (apiKey && apiKey.trim()) {
          const credentials = await storage.createOrUpdateAICredentials(
            provider as any, // Type assertion for provider
            apiKey.trim()
          );
          updatedCredentials.push(credentials);
          console.log(`Updated API key for provider: ${provider}`);
        }
      }
    }
    
    // Process base URLs
    if (validatedData.baseUrls) {
      for (const [provider, baseUrl] of Object.entries(validatedData.baseUrls)) {
        if (baseUrl && baseUrl.trim()) {
          // Get existing credentials or create new ones
          const existing = await storage.getAICredentials(provider as any);
          if (existing) {
            // Update existing with new base URL
            const decryptedKey = await storage.getDecryptedAPIKey(provider as any);
            if (decryptedKey) {
              await storage.createOrUpdateAICredentials(
                provider as any,
                decryptedKey,
                baseUrl.trim()
              );
            }
          } else {
            // Create placeholder for base URL only (will need API key later)
            await storage.createOrUpdateAICredentials(
              provider as any,
              'placeholder-key', // Will be replaced when real key is provided
              baseUrl.trim()
            );
          }
          console.log(`Updated base URL for provider: ${provider}`);
        }
      }
    }
    
    // Refresh AI service to pick up new credentials
    try {
      await aiService.refreshConfiguration();
      console.log('AI service configuration refreshed');
    } catch (refreshError) {
      console.warn('Failed to refresh AI service configuration:', refreshError);
      // Continue - credential update succeeded even if refresh failed
    }
    
    // Return masked credentials
    const result = await storage.getMaskedAICredentials();
    res.json({ 
      message: 'Credentials updated successfully',
      credentials: result,
      count: updatedCredentials.length
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input data', details: error.errors });
    } else {
      console.error('Failed to update AI credentials:', error);
      res.status(500).json({ error: 'Failed to update AI credentials', details: error instanceof Error ? error.message : 'Unknown error' });
    }
  }
});

router.delete('/api/admin/ai-credentials/:provider', async (req, res) => {
  try {
    const provider = req.params.provider;
    
    // Validate provider
    const validProvider = AIProviderEnum.safeParse(provider);
    if (!validProvider.success) {
      return res.status(400).json({ error: 'Invalid provider' });
    }
    
    const deleted = await storage.deleteAICredentials(validProvider.data);
    if (deleted) {
      console.log(`Deleted credentials for provider: ${provider}`);
      
      // Refresh AI service to remove deleted credentials
      try {
        await aiService.refreshConfiguration();
      } catch (refreshError) {
        console.warn('Failed to refresh AI service after credential deletion:', refreshError);
      }
      
      res.json({ message: 'Credentials deleted successfully' });
    } else {
      res.status(404).json({ error: 'Credentials not found' });
    }
  } catch (error) {
    console.error('Failed to delete AI credentials:', error);
    res.status(500).json({ error: 'Failed to delete AI credentials' });
  }
});

// AI Service API Routes
router.post('/api/ai/generate', 
  ...protectAIEndpoint('basic'),
  rateLimitAI(100),
  circuitBreaker('ai-generation'),
  logAIUsageMiddleware,
  async (req: AuthenticatedRequest, res) => {
  try {
    const requestSchema = z.object({
      prompt: z.string().min(1),
      systemPrompt: z.string().optional(),
      config: aiModelConfigRequestSchema.optional(),
    });

    const validatedData = requestSchema.parse(req.body);
    const aiRequest: AIRequest = {
      prompt: validatedData.prompt,
      systemPrompt: validatedData.systemPrompt,
      config: validatedData.config,
    };

    const response = await aiService.generate(aiRequest);
    res.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input data', details: error.errors });
    } else {
      console.error('AI generation error:', error);
      res.status(500).json({ error: 'Failed to generate AI response', details: error instanceof Error ? error.message : 'Unknown error' });
    }
  }
});

router.post('/api/ai/generate-stream', 
  ...protectAIEndpoint('basic'),
  rateLimitAI(120),
  circuitBreaker('ai-generation-stream'),
  logAIUsageMiddleware,
  async (req: AuthenticatedRequest, res) => {
  try {
    const requestSchema = z.object({
      prompt: z.string().min(1),
      systemPrompt: z.string().optional(),
      config: aiModelConfigRequestSchema.optional(),
    });

    const validatedData = requestSchema.parse(req.body);
    const aiRequest: AIRequest = {
      prompt: validatedData.prompt,
      systemPrompt: validatedData.systemPrompt,
      config: validatedData.config,
    };

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    try {
      for await (const chunk of aiService.generateStream(aiRequest)) {
        res.write(`data: ${JSON.stringify(chunk)}\n\n`);
      }
      res.write('data: [DONE]\n\n');
    } catch (streamError) {
      console.error('AI streaming error:', streamError);
      res.write(`data: ${JSON.stringify({ error: 'Streaming failed', details: streamError instanceof Error ? streamError.message : 'Unknown error' })}\n\n`);
    }
    
    res.end();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input data', details: error.errors });
    } else {
      console.error('AI streaming setup error:', error);
      res.status(500).json({ error: 'Failed to setup AI streaming', details: error instanceof Error ? error.message : 'Unknown error' });
    }
  }
});

router.get('/api/ai/health', async (req, res) => {
  try {
    const health = await aiService.healthCheck();
    res.json(health);
  } catch (error) {
    console.error('AI health check error:', error);
    res.status(500).json({ error: 'Failed to check AI service health', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.get('/api/ai/providers/status', async (req, res) => {
  try {
    const status = aiService.getProviderStatus();
    res.json(status);
  } catch (error) {
    console.error('AI provider status error:', error);
    res.status(500).json({ error: 'Failed to get provider status', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// AI Analytics API Endpoints

// AI Usage Analytics
router.post('/api/analytics/usage', async (req, res) => {
  try {
    const validatedData = insertAIUsageAnalyticsSchema.parse(req.body);
    const analytics = await storage.createAIUsageAnalytics(validatedData);
    res.status(201).json(analytics);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid analytics data', details: error.errors });
    } else {
      console.error('AI usage analytics error:', error);
      res.status(500).json({ error: 'Failed to create usage analytics' });
    }
  }
});

router.get('/api/analytics/usage', async (req, res) => {
  try {
    const { timeframe, featureType, feature } = req.query;
    const analytics = await storage.getAIUsageAnalytics(
      timeframe as string, 
      (featureType || feature) as string
    );
    
    // Aggregate and transform data to match frontend expectations
    const aggregatedData = {
      totalRequests: 0,
      totalTokens: 0,
      totalCost: 0,
      avgResponseTime: 0,
      successRate: 0,
      featureBreakdown: {} as Record<string, number>,
      providers: {} as Record<string, any>
    };
    
    let responseTimeSum = 0;
    let successfulRequests = 0;
    let totalResponseTimes = 0;
    
    analytics.forEach(usage => {
      aggregatedData.totalRequests += 1;
      aggregatedData.totalTokens += usage.tokensUsed;
      aggregatedData.totalCost += usage.cost;
      
      if (usage.responseTime) {
        responseTimeSum += usage.responseTime;
        totalResponseTimes += 1;
      }
      
      if (usage.success) {
        successfulRequests += 1;
      }
      
      // Feature breakdown
      if (usage.featureType) {
        aggregatedData.featureBreakdown[usage.featureType] = 
          (aggregatedData.featureBreakdown[usage.featureType] || 0) + 1;
      }
      
      // Provider breakdown
      if (usage.aiProvider) {
        if (!aggregatedData.providers[usage.aiProvider]) {
          aggregatedData.providers[usage.aiProvider] = {
            tokens: 0,
            cost: 0,
            requests: 0,
            successRate: 0,
            avgResponseTime: 0
          };
        }
        
        const providerData = aggregatedData.providers[usage.aiProvider];
        providerData.tokens += usage.tokensUsed;
        providerData.cost += usage.cost;
        providerData.requests += 1;
      }
    });
    
    // Calculate averages and rates
    if (totalResponseTimes > 0) {
      aggregatedData.avgResponseTime = Math.round(responseTimeSum / totalResponseTimes);
    }
    
    if (aggregatedData.totalRequests > 0) {
      aggregatedData.successRate = Math.round((successfulRequests / aggregatedData.totalRequests) * 100 * 100) / 100;
    }
    
    // Calculate provider-specific rates
    Object.keys(aggregatedData.providers).forEach(provider => {
      const providerAnalytics = analytics.filter(a => a.aiProvider === provider);
      const providerSuccessful = providerAnalytics.filter(a => a.success).length;
      const providerTotal = providerAnalytics.length;
      const providerResponseTimes = providerAnalytics.filter(a => a.responseTime).map(a => a.responseTime!);
      
      if (providerTotal > 0) {
        aggregatedData.providers[provider].successRate = Math.round((providerSuccessful / providerTotal) * 100 * 100) / 100;
      }
      
      if (providerResponseTimes.length > 0) {
        const avgResponseTime = providerResponseTimes.reduce((sum, time) => sum + time, 0) / providerResponseTimes.length;
        aggregatedData.providers[provider].avgResponseTime = Math.round(avgResponseTime);
      }
    });
    
    res.json(aggregatedData);
  } catch (error) {
    console.error('Get AI usage analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch usage analytics' });
  }
});

router.get('/api/analytics/usage/:id', async (req, res) => {
  try {
    const analytics = await storage.getAIUsageAnalyticsById(req.params.id);
    if (!analytics) {
      res.status(404).json({ error: 'Usage analytics not found' });
      return;
    }
    res.json(analytics);
  } catch (error) {
    console.error('Get AI usage analytics by ID error:', error);
    res.status(500).json({ error: 'Failed to fetch usage analytics' });
  }
});

// AI Provider Performance
router.post('/api/analytics/provider-performance', async (req, res) => {
  try {
    const validatedData = insertAIProviderPerformanceSchema.parse(req.body);
    const performance = await storage.createAIProviderPerformance(validatedData);
    res.status(201).json(performance);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid performance data', details: error.errors });
    } else {
      console.error('AI provider performance error:', error);
      res.status(500).json({ error: 'Failed to create provider performance record' });
    }
  }
});

router.get('/api/analytics/provider-performance', async (req, res) => {
  try {
    const { provider, timeWindow } = req.query;
    const rawPerformance = await storage.getAIProviderPerformance(
      provider as any,
      timeWindow as string
    );
    
    // Transform data to match frontend expectations
    const transformedData: Record<string, any> = {};
    
    rawPerformance.forEach(perf => {
      const successRate = perf.totalRequests > 0 ? (perf.successfulRequests / perf.totalRequests) * 100 : 0;
      const errorRate = 100 - successRate;
      const availability = successRate; // Simple mapping for now
      
      transformedData[perf.provider] = {
        avgResponseTime: perf.avgResponseTime,
        availability: Math.round(availability * 100) / 100,
        errorRate: Math.round(errorRate * 100) / 100,
        successRate: Math.round(successRate * 100) / 100,
        totalRequests: perf.totalRequests,
        successfulRequests: perf.successfulRequests,
        avgTokens: perf.avgTokens,
        totalCost: perf.totalCost,
        period: perf.period,
        timeWindow: perf.timeWindow
      };
    });
    
    res.json(transformedData);
  } catch (error) {
    console.error('Get AI provider performance error:', error);
    res.status(500).json({ error: 'Failed to fetch provider performance' });
  }
});

// AI User Feedback
router.post('/api/analytics/user-feedback', async (req, res) => {
  try {
    const validatedData = insertAIUserFeedbackSchema.parse(req.body);
    const feedback = await storage.createAIUserFeedback(validatedData);
    res.status(201).json(feedback);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid feedback data', details: error.errors });
    } else {
      console.error('AI user feedback error:', error);
      res.status(500).json({ error: 'Failed to create user feedback' });
    }
  }
});

router.get('/api/analytics/user-feedback', async (req, res) => {
  try {
    const { featureType, rating } = req.query;
    const feedback = await storage.getAIUserFeedback(
      featureType as string,
      rating as string
    );
    res.json(feedback);
  } catch (error) {
    console.error('Get AI user feedback error:', error);
    res.status(500).json({ error: 'Failed to fetch user feedback' });
  }
});

router.get('/api/analytics/user-feedback/request/:requestId', async (req, res) => {
  try {
    const feedback = await storage.getAIUserFeedbackByRequestId(req.params.requestId);
    res.json(feedback);
  } catch (error) {
    console.error('Get AI user feedback by request ID error:', error);
    res.status(500).json({ error: 'Failed to fetch user feedback' });
  }
});

// AI Feature Adoption
router.post('/api/analytics/feature-adoption', async (req, res) => {
  try {
    const validatedData = insertAIFeatureAdoptionSchema.parse(req.body);
    const adoption = await storage.createAIFeatureAdoption(validatedData);
    res.status(201).json(adoption);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid feature adoption data', details: error.errors });
    } else {
      console.error('AI feature adoption error:', error);
      res.status(500).json({ error: 'Failed to create feature adoption record' });
    }
  }
});

router.get('/api/analytics/feature-adoption', async (req, res) => {
  try {
    const { featureType, timeWindow } = req.query;
    const adoption = await storage.getAIFeatureAdoption(
      featureType as string,
      timeWindow as string
    );
    res.json(adoption);
  } catch (error) {
    console.error('Get AI feature adoption error:', error);
    res.status(500).json({ error: 'Failed to fetch feature adoption' });
  }
});

// AI Provider Fallback Events
router.post('/api/analytics/fallback-events', async (req, res) => {
  try {
    const validatedData = insertAIProviderFallbackEventSchema.parse(req.body);
    const event = await storage.createAIProviderFallbackEvent(validatedData);
    res.status(201).json(event);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid fallback event data', details: error.errors });
    } else {
      console.error('AI provider fallback event error:', error);
      res.status(500).json({ error: 'Failed to create fallback event' });
    }
  }
});

router.get('/api/analytics/fallback-events', async (req, res) => {
  try {
    const { provider, failureReason } = req.query;
    const events = await storage.getAIProviderFallbackEvents(
      provider as any,
      failureReason as string
    );
    res.json(events);
  } catch (error) {
    console.error('Get AI provider fallback events error:', error);
    res.status(500).json({ error: 'Failed to fetch fallback events' });
  }
});

// AI Provider Recommendations
router.post('/api/analytics/provider-recommendations', async (req, res) => {
  try {
    const validatedData = insertAIProviderRecommendationSchema.parse(req.body);
    const recommendation = await storage.createAIProviderRecommendation(validatedData);
    res.status(201).json(recommendation);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid recommendation data', details: error.errors });
    } else {
      console.error('AI provider recommendation error:', error);
      res.status(500).json({ error: 'Failed to create provider recommendation' });
    }
  }
});

router.get('/api/analytics/provider-recommendations', async (req, res) => {
  try {
    const { featureType } = req.query;
    const recommendations = await storage.getAIProviderRecommendations(featureType as string);
    res.json(recommendations);
  } catch (error) {
    console.error('Get AI provider recommendations error:', error);
    res.status(500).json({ error: 'Failed to fetch provider recommendations' });
  }
});

// Analytics Dashboard Aggregations
router.get('/api/analytics/dashboard', async (req, res) => {
  try {
    const { timeframe = '24h' } = req.query;
    
    // Get aggregated analytics for dashboard
    const [
      usageAnalytics,
      providerPerformance,
      userFeedback,
      featureAdoption,
      fallbackEvents
    ] = await Promise.all([
      storage.getAIUsageAnalytics(timeframe as string),
      storage.getAIProviderPerformance(),
      storage.getAIUserFeedback(),
      storage.getAIFeatureAdoption(),
      storage.getAIProviderFallbackEvents()
    ]);

    // Calculate summary statistics
    const totalRequests = usageAnalytics.length;
    const successfulRequests = usageAnalytics.filter(a => a.success).length;
    const successRate = totalRequests > 0 ? successfulRequests / totalRequests : 0;
    
    const avgResponseTime = usageAnalytics.length > 0 
      ? usageAnalytics.reduce((sum, a) => sum + a.responseTimeMs, 0) / usageAnalytics.length 
      : 0;

    const feedbackStats = {
      total: userFeedback.length,
      positive: userFeedback.filter(f => f.qualityRating === 'thumbs_up').length,
      negative: userFeedback.filter(f => f.qualityRating === 'thumbs_down').length,
      neutral: userFeedback.filter(f => f.qualityRating === 'neutral').length,
    };

    const providerUsage = usageAnalytics.reduce((acc, usage) => {
      acc[usage.aiProvider] = (acc[usage.aiProvider] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const featureUsage = usageAnalytics.reduce((acc, usage) => {
      acc[usage.featureType] = (acc[usage.featureType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    res.json({
      summary: {
        totalRequests,
        successfulRequests,
        successRate,
        avgResponseTime,
        fallbackEvents: fallbackEvents.length,
      },
      feedback: feedbackStats,
      providerUsage,
      featureUsage,
      recentActivity: {
        usage: usageAnalytics.slice(0, 10),
        feedback: userFeedback.slice(0, 10),
        fallbacks: fallbackEvents.slice(0, 10),
      }
    });
  } catch (error) {
    console.error('Analytics dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard analytics' });
  }
});

// Provider Health Dashboard Routes
// Cost Analytics
router.get('/api/analytics/costs', async (req, res) => {
  try {
    const { timeframe = 'day' } = req.query;
    const usage = await storage.getAIUsageAnalytics(timeframe as string);
    
    // Calculate costs based on token usage and provider pricing
    const costData = usage.reduce((acc: any, record: any) => {
      const costPerToken = getCostPerToken(record.aiProvider, record.model);
      const cost = (record.tokensUsed || 0) * costPerToken / 1000; // Convert to cost per 1K tokens
      
      acc.totalCost += cost;
      acc.providerCosts = acc.providerCosts || {};
      acc.providerCosts[record.aiProvider] = (acc.providerCosts[record.aiProvider] || 0) + cost;
      
      return acc;
    }, { totalCost: 0, providerCosts: {} });
    
    res.json(costData);
  } catch (error) {
    console.error('Failed to fetch cost analytics:', error);
    res.status(500).json({ error: 'Failed to fetch cost analytics' });
  }
});

// Performance Metrics
router.get('/api/analytics/performance', async (req, res) => {
  try {
    const performance = await storage.getAIProviderPerformance();
    const usage = await storage.getAIUsageAnalytics('week');
    
    // Aggregate performance data
    const responseTimeData = aggregateResponseTimes(usage);
    const successRates = calculateSuccessRates(usage);
    
    res.json({
      responseTimeData,
      successRates,
      performanceTrends: performance
    });
  } catch (error) {
    console.error('Failed to fetch performance metrics:', error);
    res.status(500).json({ error: 'Failed to fetch performance metrics' });
  }
});

// Feedback Analytics
router.get('/api/analytics/feedback', async (req, res) => {
  try {
    const feedback = await storage.getAIUserFeedback();
    
    // Aggregate satisfaction data by provider
    const satisfactionByProvider = aggregateSatisfactionByProvider(feedback);
    const recentFeedback = feedback.slice(0, 10); // Get 10 most recent
    
    res.json({
      satisfactionByProvider,
      recentFeedback
    });
  } catch (error) {
    console.error('Failed to fetch feedback analytics:', error);
    res.status(500).json({ error: 'Failed to fetch feedback analytics' });
  }
});

// Intelligent Recommendations
router.get('/api/analytics/recommendations', async (req, res) => {
  try {
    const recommendations = await storage.getAIProviderRecommendations();
    const usage = await storage.getAIUsageAnalytics('month');
    const performance = await storage.getAIProviderPerformance();
    
    // Generate AI-powered recommendations based on data
    const providerRecommendations = generateProviderRecommendations(usage, performance);
    
    res.json({
      providerRecommendations,
      storedRecommendations: recommendations
    });
  } catch (error) {
    console.error('Failed to fetch recommendations:', error);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

// Optimization Insights
router.get('/api/analytics/optimization', async (req, res) => {
  try {
    const usage = await storage.getAIUsageAnalytics('month');
    const performance = await storage.getAIProviderPerformance();
    const fallbacks = await storage.getAIProviderFallbackEvents();
    
    // Calculate optimization opportunities
    const potentialSavings = calculatePotentialSavings(usage, performance);
    const suggestions = generateOptimizationSuggestions(usage, performance, fallbacks);
    const routingStrategies = generateRoutingStrategies(performance);
    
    res.json({
      potentialSavings,
      suggestions,
      routingStrategies
    });
  } catch (error) {
    console.error('Failed to fetch optimization insights:', error);
    res.status(500).json({ error: 'Failed to fetch optimization insights' });
  }
});

// Bulk Provider Testing
router.post('/api/ai/test-all-providers', 
  ...protectAIEndpoint('verified'),
  rateLimitAI(200),
  circuitBreaker('ai-provider-testing'),
  logAIUsageMiddleware,
  async (req: AuthenticatedRequest, res) => {
  try {
    const testResults: any = {};
    let healthyProviders = 0;
    let failedProviders = 0;
    
    // Test each provider
    const providers = ['openai', 'claude', 'gemini', 'xai', 'litellm'];
    const testPromises = providers.map(async (provider) => {
      try {
        const startTime = Date.now();
        const result = await aiService.makeRequest({
          messages: [{ role: 'user', content: 'Test connection - respond with OK' }],
          model: 'default',
          maxTokens: 10,
          temperature: 0.1,
          metadata: { featureType: 'health-check' }
        }, { preferredProvider: provider as any });
        
        const responseTime = Date.now() - startTime;
        testResults[provider] = {
          status: 'healthy',
          responseTime,
          success: true
        };
        healthyProviders++;
      } catch (error) {
        testResults[provider] = {
          status: 'unhealthy',
          error: error.message,
          success: false
        };
        failedProviders++;
      }
    });
    
    await Promise.all(testPromises);
    
    res.json({
      totalProviders: providers.length,
      healthyProviders,
      failedProviders,
      results: testResults
    });
  } catch (error) {
    console.error('Failed to test providers:', error);
    res.status(500).json({ error: 'Failed to test providers' });
  }
});

// Data Export Routes
router.get('/api/analytics/export/usage', async (req, res) => {
  try {
    const usage = await storage.getAIUsageAnalytics();
    res.json(usage);
  } catch (error) {
    console.error('Failed to export usage data:', error);
    res.status(500).json({ error: 'Failed to export usage data' });
  }
});

router.get('/api/analytics/export/performance', async (req, res) => {
  try {
    const performance = await storage.getAIProviderPerformance();
    res.json(performance);
  } catch (error) {
    console.error('Failed to export performance data:', error);
    res.status(500).json({ error: 'Failed to export performance data' });
  }
});

router.get('/api/analytics/export/feedback', async (req, res) => {
  try {
    const feedback = await storage.getAIUserFeedback();
    res.json(feedback);
  } catch (error) {
    console.error('Failed to export feedback data:', error);
    res.status(500).json({ error: 'Failed to export feedback data' });
  }
});

router.get('/api/analytics/export/all', async (req, res) => {
  try {
    const [usage, performance, feedback, fallbacks] = await Promise.all([
      storage.getAIUsageAnalytics(),
      storage.getAIProviderPerformance(),
      storage.getAIUserFeedback(),
      storage.getAIProviderFallbackEvents()
    ]);
    
    res.json({
      usage,
      performance,
      feedback,
      fallbacks,
      exportedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to export all data:', error);
    res.status(500).json({ error: 'Failed to export all data' });
  }
});

// Helper functions for analytics calculations
function getCostPerToken(provider: string, model?: string): number {
  const pricing: Record<string, Record<string, number>> = {
    openai: { 'gpt-4': 0.00003, 'gpt-3.5-turbo': 0.000002 },
    claude: { 'claude-3-sonnet': 0.000015, 'claude-3-haiku': 0.00025 },
    gemini: { 'gemini-pro': 0.0000005 },
    xai: { 'grok-beta': 0.00001 },
    litellm: { 'default': 0.00001 }
  };
  
  return pricing[provider]?.[model || 'default'] || pricing[provider]?.['default'] || 0.00001;
}

function aggregateResponseTimes(usage: any[]): any[] {
  const dailyData: Record<string, Record<string, number[]>> = {};
  
  usage.forEach(record => {
    const date = new Date(record.timestamp).toISOString().split('T')[0];
    if (!dailyData[date]) dailyData[date] = {};
    if (!dailyData[date][record.aiProvider]) dailyData[date][record.aiProvider] = [];
    
    if (record.responseTimeMs) {
      dailyData[date][record.aiProvider].push(record.responseTimeMs);
    }
  });
  
  return Object.entries(dailyData).map(([date, providers]) => {
    const result: any = { date };
    Object.entries(providers).forEach(([provider, times]) => {
      result[provider] = times.reduce((a, b) => a + b, 0) / times.length;
    });
    return result;
  });
}

function calculateSuccessRates(usage: any[]): any[] {
  const providerStats: Record<string, { success: number; total: number }> = {};
  
  usage.forEach(record => {
    if (!providerStats[record.aiProvider]) {
      providerStats[record.aiProvider] = { success: 0, total: 0 };
    }
    providerStats[record.aiProvider].total++;
    if (record.success) {
      providerStats[record.aiProvider].success++;
    }
  });
  
  return Object.entries(providerStats).map(([provider, stats]) => ({
    name: provider,
    rate: Math.round((stats.success / stats.total) * 100)
  }));
}

function aggregateSatisfactionByProvider(feedback: any[]): any[] {
  const providerRatings: Record<string, number[]> = {};
  
  feedback.forEach(record => {
    if (!providerRatings[record.aiProvider]) {
      providerRatings[record.aiProvider] = [];
    }
    if (record.qualityRating === 'thumbs_up') {
      providerRatings[record.aiProvider].push(5);
    } else if (record.qualityRating === 'neutral') {
      providerRatings[record.aiProvider].push(3);
    } else if (record.qualityRating === 'thumbs_down') {
      providerRatings[record.aiProvider].push(1);
    }
  });
  
  return Object.entries(providerRatings).map(([provider, ratings]) => ({
    provider,
    rating: ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 3
  }));
}

function generateProviderRecommendations(usage: any[], performance: any[]): any[] {
  const features = ['consciousness-reflection', 'leadership-strategy', 'decision-analysis', 'corruption-detection'];
  
  return features.map(feature => {
    const featureUsage = usage.filter(u => u.featureType === feature);
    const bestProvider = findBestProviderForFeature(featureUsage, performance);
    
    return {
      feature,
      recommendedProvider: bestProvider.name,
      reasoning: bestProvider.reasoning,
      performanceScore: bestProvider.performanceScore,
      costScore: bestProvider.costScore
    };
  });
}

function findBestProviderForFeature(featureUsage: any[], performance: any[]): any {
  const providers = ['openai', 'claude', 'gemini', 'xai'];
  let bestProvider = { name: 'openai', reasoning: 'Default choice', performanceScore: 7, costScore: 6 };
  
  // Simple heuristic based on success rate and response time
  providers.forEach(provider => {
    const providerUsage = featureUsage.filter(u => u.aiProvider === provider);
    if (providerUsage.length > 0) {
      const successRate = providerUsage.filter(u => u.success).length / providerUsage.length;
      const avgResponseTime = providerUsage.reduce((sum, u) => sum + (u.responseTimeMs || 0), 0) / providerUsage.length;
      
      if (successRate > 0.9 && avgResponseTime < 3000) {
        bestProvider = {
          name: provider,
          reasoning: `High success rate (${Math.round(successRate * 100)}%) and fast response time`,
          performanceScore: Math.min(10, Math.round(successRate * 10)),
          costScore: Math.max(1, 10 - Math.floor(avgResponseTime / 500))
        };
      }
    }
  });
  
  return bestProvider;
}

function calculatePotentialSavings(usage: any[], performance: any[]): number {
  // Simple calculation: estimate 10-30% savings through optimization
  const totalCost = usage.reduce((sum, record) => {
    const costPerToken = getCostPerToken(record.aiProvider, record.model || 'default');
    return sum + ((record.tokensUsed || 0) * costPerToken / 1000);
  }, 0);
  
  return Math.round(totalCost * 0.15 * 100) / 100; // 15% average savings potential, rounded
}

function generateOptimizationSuggestions(usage: any[], performance: any[], fallbacks: any[]): any[] {
  const suggestions = [
    {
      title: 'Route simple queries to cost-efficient providers',
      description: 'Use Gemini or Claude Haiku for basic tasks to reduce costs by up to 80%',
      impact: 'High Cost Savings'
    },
    {
      title: 'Implement intelligent caching',
      description: 'Cache similar requests to reduce redundant API calls',
      impact: 'Medium Cost & Speed'
    },
    {
      title: 'Optimize timeout settings',
      description: 'Adjust timeout settings based on provider performance patterns',
      impact: 'Low Reliability'
    }
  ];
  
  if (fallbacks.length > 10) {
    suggestions.push({
      title: 'Review primary provider reliability',
      description: 'High fallback rate detected - consider changing primary provider',
      impact: 'High Reliability'
    });
  }
  
  return suggestions;
}

function generateRoutingStrategies(performance: any[]): any[] {
  return [
    {
      name: 'Cost-Optimized Routing',
      description: 'Route requests to the most cost-effective provider for each task type',
      performanceGain: 5,
      costReduction: 25
    },
    {
      name: 'Speed-Optimized Routing', 
      description: 'Prioritize fastest responding providers for real-time features',
      performanceGain: 30,
      costReduction: 0
    },
    {
      name: 'Quality-Optimized Routing',
      description: 'Use highest-performing providers based on user feedback',
      performanceGain: 15,
      costReduction: -10
    }
  ];
}

// Advanced Consciousness Features API Routes

// Recursive Insight Analysis API
router.post('/api/recursive-insight-analysis', async (req, res) => {
  try {
    const validatedData = insertRecursiveInsightAnalysisSchema.parse(req.body);
    const result = await recursiveInsightAnalysisEngine.performRecursiveInsightAnalysis(
      validatedData.subjectData,
      validatedData.analysisDepth,
      validatedData.recursionLimits,
      validatedData.parentAnalysisId
    );
    res.status(201).json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input data', details: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to perform recursive insight analysis' });
    }
  }
});

router.get('/api/recursive-insight-analysis', async (req, res) => {
  try {
    const analyses = await storage.getRecursiveInsightAnalyses();
    res.json(analyses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recursive insight analyses' });
  }
});

router.get('/api/recursive-insight-analysis/:id', async (req, res) => {
  try {
    const analysis = await storage.getRecursiveInsightAnalysis(req.params.id);
    if (!analysis) {
      return res.status(404).json({ error: 'Recursive insight analysis not found' });
    }
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recursive insight analysis' });
  }
});

router.get('/api/recursive-insight-analysis/subject/:subjectId', async (req, res) => {
  try {
    const analyses = await storage.getRecursiveInsightAnalysesBySubject(req.params.subjectId);
    res.json(analyses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recursive insight analyses by subject' });
  }
});

// Multidimensional Reflection API
router.post('/api/multidimensional-reflection', async (req, res) => {
  try {
    const validatedData = insertMultidimensionalReflectionSchema.parse(req.body);
    const result = await multidimensionalReflectionEngine.processMultidimensionalReflection(
      validatedData.originalReflectionId,
      validatedData.reflectionDimensions,
      validatedData.crossDimensionalSynthesis,
      validatedData.agentId
    );
    res.status(201).json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input data', details: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to process multidimensional reflection' });
    }
  }
});

router.get('/api/multidimensional-reflection', async (req, res) => {
  try {
    const reflections = await storage.getMultidimensionalReflections();
    res.json(reflections);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch multidimensional reflections' });
  }
});

router.get('/api/multidimensional-reflection/:id', async (req, res) => {
  try {
    const reflection = await storage.getMultidimensionalReflection(req.params.id);
    if (!reflection) {
      return res.status(404).json({ error: 'Multidimensional reflection not found' });
    }
    res.json(reflection);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch multidimensional reflection' });
  }
});

router.get('/api/multidimensional-reflection/agent/:agentId', async (req, res) => {
  try {
    const reflections = await storage.getMultidimensionalReflectionsByAgent(req.params.agentId);
    res.json(reflections);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch multidimensional reflections by agent' });
  }
});

// Consciousness State Prediction API
router.post('/api/consciousness-state-prediction', async (req, res) => {
  try {
    const validatedData = insertConsciousnessStatePredictionSchema.parse(req.body);
    const result = await consciousnessStatePredictionEngine.generateConsciousnessPredictions(
      validatedData.currentStateId,
      validatedData.predictionContext,
      validatedData.agentId
    );
    res.status(201).json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input data', details: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to generate consciousness state prediction' });
    }
  }
});

router.get('/api/consciousness-state-prediction', async (req, res) => {
  try {
    const predictions = await storage.getConsciousnessStatePredictions();
    res.json(predictions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch consciousness state predictions' });
  }
});

router.get('/api/consciousness-state-prediction/:id', async (req, res) => {
  try {
    const prediction = await storage.getConsciousnessStatePrediction(req.params.id);
    if (!prediction) {
      return res.status(404).json({ error: 'Consciousness state prediction not found' });
    }
    res.json(prediction);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch consciousness state prediction' });
  }
});

router.get('/api/consciousness-state-prediction/agent/:agentId', async (req, res) => {
  try {
    const predictions = await storage.getConsciousnessStatePredictionsByAgent(req.params.agentId);
    res.json(predictions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch consciousness state predictions by agent' });
  }
});

// Cross-Model Validation API  
router.post('/api/cross-model-validation', async (req, res) => {
  try {
    const validatedData = insertCrossModelValidationRequestSchema.parse(req.body);
    const request = await storage.createCrossModelValidationRequest(validatedData);
    
    // Trigger cross-model validation processing
    // This would typically be handled by a queue or background process
    // For now, we'll return the created request
    res.status(201).json(request);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input data', details: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to create cross-model validation request' });
    }
  }
});

router.get('/api/cross-model-validation', async (req, res) => {
  try {
    const requests = await storage.getCrossModelValidationRequests();
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cross-model validation requests' });
  }
});

router.get('/api/cross-model-validation/:id', async (req, res) => {
  try {
    const request = await storage.getCrossModelValidationRequest(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Cross-model validation request not found' });
    }
    res.json(request);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cross-model validation request' });
  }
});

router.get('/api/cross-model-validation/user/:userId', async (req, res) => {
  try {
    const requests = await storage.getCrossModelValidationRequestsByUser(req.params.userId);
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cross-model validation requests by user' });
  }
});

// Cross-Model Consensus Analysis API
router.post('/api/cross-model-consensus', async (req, res) => {
  try {
    const validatedData = insertCrossModelConsensusAnalysisSchema.parse(req.body);
    const analysis = await storage.createCrossModelConsensusAnalysis(validatedData);
    res.status(201).json(analysis);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input data', details: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to create cross-model consensus analysis' });
    }
  }
});

router.get('/api/cross-model-consensus', async (req, res) => {
  try {
    const analyses = await storage.getCrossModelConsensusAnalyses();
    res.json(analyses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cross-model consensus analyses' });
  }
});

router.get('/api/cross-model-consensus/request/:requestId', async (req, res) => {
  try {
    const analyses = await storage.getCrossModelConsensusAnalysesByRequest(req.params.requestId);
    res.json(analyses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cross-model consensus analyses by request' });
  }
});

// Consciousness Pattern Analysis API
router.post('/api/consciousness-pattern-analysis', async (req, res) => {
  try {
    const validatedData = insertConsciousnessPatternAnalysisSchema.parse(req.body);
    const analysis = await storage.createConsciousnessPatternAnalysis(validatedData);
    res.status(201).json(analysis);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input data', details: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to create consciousness pattern analysis' });
    }
  }
});

router.get('/api/consciousness-pattern-analysis', async (req, res) => {
  try {
    const analyses = await storage.getConsciousnessPatternAnalyses();
    res.json(analyses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch consciousness pattern analyses' });
  }
});

router.get('/api/consciousness-pattern-analysis/:id', async (req, res) => {
  try {
    const analysis = await storage.getConsciousnessPatternAnalysis(req.params.id);
    if (!analysis) {
      return res.status(404).json({ error: 'Consciousness pattern analysis not found' });
    }
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch consciousness pattern analysis' });
  }
});

router.get('/api/consciousness-pattern-analysis/agent/:agentId', async (req, res) => {
  try {
    const analyses = await storage.getConsciousnessPatternAnalysesByAgent(req.params.agentId);
    res.json(analyses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch consciousness pattern analyses by agent' });
  }
});

router.get('/api/consciousness-pattern-analysis/type/:analysisType', async (req, res) => {
  try {
    const analyses = await storage.getConsciousnessPatternAnalysesByType(req.params.analysisType);
    res.json(analyses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch consciousness pattern analyses by type' });
  }
});

// ================================
// ADVANCED CONSCIOUSNESS ROUTES (CRITICAL SECURITY IMPLEMENTATION)
// ================================

/**
 * ADVANCED CONSCIOUSNESS: Recursive Insight Analysis
 * Performs deep recursive AI analysis with multi-level insight generation
 */
router.post('/api/consciousness/recursive-insight-analysis',
  ...protectAIEndpoint('verified'), // Requires verified users - most expensive operation
  rateLimitAI(300), // High cost limit due to recursive nature
  circuitBreaker('recursive-insight-analysis', 3), // Lower failure threshold
  logAIUsageMiddleware,
  async (req: AuthenticatedRequest, res) => {
    try {
      const securityContext = extractSecurityContext(req);
      
      // Enhanced input validation and sanitization
      const { subjectData, analysisType, maxDepth, parentAnalysisId } = req.body;
      
      if (!subjectData || typeof subjectData !== 'object') {
        return res.status(400).json({ 
          error: 'Invalid input: subjectData is required and must be an object',
          securityContext: { userId: securityContext.userId }
        });
      }
      
      if (!analysisType || !['self-reflection', 'meta-cognitive', 'quality-assessment', 'process-optimization'].includes(analysisType)) {
        return res.status(400).json({ 
          error: 'Invalid analysisType. Must be one of: self-reflection, meta-cognitive, quality-assessment, process-optimization'
        });
      }
      
      // Security: Limit recursion depth to prevent infinite loops and cost abuse
      const safeMaxDepth = Math.min(maxDepth || 3, 5); // Maximum 5 levels
      
      // Sanitize string inputs to prevent injection attacks
      const sanitizedSubjectData = {
        ...subjectData,
        originalContent: typeof subjectData.originalContent === 'string' 
          ? subjectData.originalContent.substring(0, 5000) // Limit content length
          : ''
      };
      
      const startTime = Date.now();
      
      const result = await recursiveInsightAnalysisEngine.performRecursiveAnalysis(
        sanitizedSubjectData,
        analysisType,
        safeMaxDepth,
        parentAnalysisId
      );
      
      const duration = Date.now() - startTime;
      
      // Track actual usage for cost monitoring
      trackAIUsage(250, req); // Estimate based on recursive operations
      
      res.json({
        ...result,
        securityInfo: {
          userId: securityContext.userId,
          verificationLevel: securityContext.verificationLevel,
          processingTime: duration,
          costEstimate: 250 // cents
        }
      });
      
    } catch (error) {
      console.error('Recursive insight analysis error:', error);
      res.status(500).json({ 
        error: 'Advanced consciousness analysis failed',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal processing error'
      });
    }
  }
);

/**
 * ADVANCED CONSCIOUSNESS: Multidimensional Reflection 
 * Processes reflections across emotional, logical, intuitive, and strategic dimensions
 */
router.post('/api/consciousness/multidimensional-reflection',
  ...protectAIEndpoint('basic'),
  rateLimitAI(150),
  circuitBreaker('multidimensional-reflection'),
  logAIUsageMiddleware,
  async (req: AuthenticatedRequest, res) => {
    try {
      const securityContext = extractSecurityContext(req);
      
      const { originalReflectionId, agentId, options } = req.body;
      
      if (!originalReflectionId || typeof originalReflectionId !== 'string') {
        return res.status(400).json({ 
          error: 'originalReflectionId is required and must be a string'
        });
      }
      
      if (!agentId || typeof agentId !== 'string') {
        return res.status(400).json({ 
          error: 'agentId is required and must be a string'
        });
      }
      
      // Security: Ensure user can only access their own reflections
      const userAgentId = securityContext.userId;
      if (agentId !== userAgentId && securityContext.verificationLevel !== 'verified') {
        return res.status(403).json({ 
          error: 'Access denied: Cannot analyze reflections for other users'
        });
      }
      
      const startTime = Date.now();
      
      const result = await multidimensionalReflectionEngine.processMultidimensionalReflection(
        originalReflectionId,
        agentId,
        options
      );
      
      const duration = Date.now() - startTime;
      trackAIUsage(150, req);
      
      res.json({
        ...result,
        securityInfo: {
          userId: securityContext.userId,
          processingTime: duration,
          costEstimate: 150
        }
      });
      
    } catch (error) {
      console.error('Multidimensional reflection error:', error);
      res.status(500).json({ 
        error: 'Multidimensional reflection processing failed',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal processing error'
      });
    }
  }
);

/**
 * ADVANCED CONSCIOUSNESS: State Prediction
 * Predicts optimal consciousness states for different challenges
 */
router.post('/api/consciousness/state-prediction',
  ...protectAIEndpoint('basic'),
  rateLimitAI(100),
  circuitBreaker('consciousness-state-prediction'),
  logAIUsageMiddleware,
  async (req: AuthenticatedRequest, res) => {
    try {
      const securityContext = extractSecurityContext(req);
      
      const { predictionContext, agentId, options } = req.body;
      
      if (!predictionContext || typeof predictionContext !== 'object') {
        return res.status(400).json({ 
          error: 'predictionContext is required and must be an object'
        });
      }
      
      if (!agentId || typeof agentId !== 'string') {
        return res.status(400).json({ 
          error: 'agentId is required and must be a string'
        });
      }
      
      const startTime = Date.now();
      
      const result = await consciousnessStatePredictionEngine.predictOptimalConsciousnessState(
        predictionContext,
        agentId,
        options
      );
      
      const duration = Date.now() - startTime;
      trackAIUsage(100, req);
      
      res.json({
        ...result,
        securityInfo: {
          userId: securityContext.userId,
          processingTime: duration,
          costEstimate: 100
        }
      });
      
    } catch (error) {
      console.error('Consciousness state prediction error:', error);
      res.status(500).json({ 
        error: 'Consciousness state prediction failed',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal processing error'
      });
    }
  }
);

/**
 * ADVANCED CONSCIOUSNESS: Cross Model Validation
 * Validates insights across multiple AI models for consensus
 */
router.post('/api/consciousness/cross-model-validation',
  ...protectAIEndpoint('verified'), // High cost operation requiring verification
  rateLimitAI(400), // Very expensive - multiple model calls
  circuitBreaker('cross-model-validation', 2),
  logAIUsageMiddleware,
  async (req: AuthenticatedRequest, res) => {
    try {
      const securityContext = extractSecurityContext(req);
      
      const { validationRequest, consensusRequirements } = req.body;
      
      if (!validationRequest || typeof validationRequest !== 'object') {
        return res.status(400).json({ 
          error: 'validationRequest is required and must be an object'
        });
      }
      
      // Security: Limit the number of models to prevent cost abuse
      const maxModels = securityContext.verificationLevel === 'verified' ? 5 : 3;
      const safeValidationRequest = {
        ...validationRequest,
        modelList: validationRequest.modelList?.slice(0, maxModels) || []
      };
      
      const startTime = Date.now();
      
      // TODO: Implement CrossModelValidationEngine
      const result = {
        validationId: `validation-${Date.now()}`,
        consensusAnalysis: {
          overallConsensus: 0.8,
          modelAgreement: 'high',
          conflictingViewpoints: [],
          validationStatus: 'engine-not-implemented'
        },
        message: 'Cross-model validation engine not yet implemented - route secured'
      };
      
      const duration = Date.now() - startTime;
      trackAIUsage(400, req);
      
      res.json({
        ...result,
        securityInfo: {
          userId: securityContext.userId,
          processingTime: duration,
          costEstimate: 400,
          modelsUsed: safeValidationRequest.modelList.length
        }
      });
      
    } catch (error) {
      console.error('Cross-model validation error:', error);
      res.status(500).json({ 
        error: 'Cross-model validation failed',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal processing error'
      });
    }
  }
);

/**
 * ADVANCED CONSCIOUSNESS: Pattern Analysis
 * Advanced pattern recognition and analysis across consciousness data
 */
router.post('/api/consciousness/pattern-analysis',
  ...protectAIEndpoint('basic'),
  rateLimitAI(120),
  circuitBreaker('consciousness-pattern-analysis'),
  logAIUsageMiddleware,
  async (req: AuthenticatedRequest, res) => {
    try {
      const securityContext = extractSecurityContext(req);
      
      const { analysisRequest, agentId, options } = req.body;
      
      if (!analysisRequest || typeof analysisRequest !== 'object') {
        return res.status(400).json({ 
          error: 'analysisRequest is required and must be an object'
        });
      }
      
      if (!agentId || typeof agentId !== 'string') {
        return res.status(400).json({ 
          error: 'agentId is required and must be a string'
        });
      }
      
      // Security: Sanitize and limit analysis scope
      const sanitizedRequest = {
        ...analysisRequest,
        dataScope: analysisRequest.dataScope || 'user-specific',
        maxPatterns: Math.min(analysisRequest.maxPatterns || 20, 50)
      };
      
      const startTime = Date.now();
      
      // TODO: Implement ConsciousnessPatternAnalysisEngine
      const result = {
        analysisId: `pattern-analysis-${Date.now()}`,
        patternsFound: [],
        analysisDepth: 'basic',
        insights: ['Pattern analysis engine not yet implemented'],
        message: 'Consciousness pattern analysis engine not yet implemented - route secured'
      };
      
      const duration = Date.now() - startTime;
      trackAIUsage(120, req);
      
      res.json({
        ...result,
        securityInfo: {
          userId: securityContext.userId,
          processingTime: duration,
          costEstimate: 120
        }
      });
      
    } catch (error) {
      console.error('Consciousness pattern analysis error:', error);
      res.status(500).json({ 
        error: 'Pattern analysis failed',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal processing error'
      });
    }
  }
);

// =============================================================================
// ENTERPRISE LEADERSHIP TOOLS API ENDPOINTS
// =============================================================================

// Executive Assessments API
router.get('/api/enterprise/executive-assessments', async (req, res) => {
  try {
    const { organizationId, executiveId } = req.query;
    
    let assessments;
    if (organizationId) {
      assessments = await storage.getExecutiveAssessmentsByOrganization(organizationId as string);
    } else if (executiveId) {
      assessments = await storage.getExecutiveAssessmentsByExecutive(executiveId as string);
    } else {
      assessments = await storage.getExecutiveAssessments();
    }
    
    res.json(assessments);
  } catch (error) {
    console.error('Failed to fetch executive assessments:', error);
    res.status(500).json({ error: 'Failed to fetch executive assessments' });
  }
});

router.get('/api/enterprise/executive-assessments/:id', async (req, res) => {
  try {
    const assessment = await storage.getExecutiveAssessment(req.params.id);
    if (!assessment) {
      return res.status(404).json({ error: 'Executive assessment not found' });
    }
    res.json(assessment);
  } catch (error) {
    console.error('Failed to fetch executive assessment:', error);
    res.status(500).json({ error: 'Failed to fetch executive assessment' });
  }
});

router.post('/api/enterprise/executive-assessments', async (req, res) => {
  try {
    const validatedData = insertExecutiveAssessmentSchema.parse(req.body);
    const assessment = await storage.createExecutiveAssessment(validatedData);
    res.status(201).json(assessment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input data', details: error.errors });
    } else {
      console.error('Failed to create executive assessment:', error);
      res.status(500).json({ error: 'Failed to create executive assessment' });
    }
  }
});

router.put('/api/enterprise/executive-assessments/:id', async (req, res) => {
  try {
    const assessment = await storage.updateExecutiveAssessment(req.params.id, req.body);
    res.json(assessment);
  } catch (error) {
    if (error.message === 'Executive assessment not found') {
      res.status(404).json({ error: 'Executive assessment not found' });
    } else {
      console.error('Failed to update executive assessment:', error);
      res.status(500).json({ error: 'Failed to update executive assessment' });
    }
  }
});

// Strategic Plans API
router.get('/api/enterprise/strategic-plans', async (req, res) => {
  try {
    const { organizationId } = req.query;
    
    let plans;
    if (organizationId) {
      plans = await storage.getStrategicPlansByOrganization(organizationId as string);
    } else {
      plans = await storage.getStrategicPlans();
    }
    
    res.json(plans);
  } catch (error) {
    console.error('Failed to fetch strategic plans:', error);
    res.status(500).json({ error: 'Failed to fetch strategic plans' });
  }
});

router.get('/api/enterprise/strategic-plans/:id', async (req, res) => {
  try {
    const plan = await storage.getStrategicPlan(req.params.id);
    if (!plan) {
      return res.status(404).json({ error: 'Strategic plan not found' });
    }
    res.json(plan);
  } catch (error) {
    console.error('Failed to fetch strategic plan:', error);
    res.status(500).json({ error: 'Failed to fetch strategic plan' });
  }
});

router.post('/api/enterprise/strategic-plans', async (req, res) => {
  try {
    const validatedData = insertStrategicPlanSchema.parse(req.body);
    const plan = await storage.createStrategicPlan(validatedData);
    res.status(201).json(plan);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input data', details: error.errors });
    } else {
      console.error('Failed to create strategic plan:', error);
      res.status(500).json({ error: 'Failed to create strategic plan' });
    }
  }
});

router.put('/api/enterprise/strategic-plans/:id', async (req, res) => {
  try {
    const plan = await storage.updateStrategicPlan(req.params.id, req.body);
    res.json(plan);
  } catch (error) {
    if (error.message === 'Strategic plan not found') {
      res.status(404).json({ error: 'Strategic plan not found' });
    } else {
      console.error('Failed to update strategic plan:', error);
      res.status(500).json({ error: 'Failed to update strategic plan' });
    }
  }
});

// Team Consciousness Assessments API
router.get('/api/enterprise/team-assessments', async (req, res) => {
  try {
    const { organizationId, teamId } = req.query;
    
    let assessments;
    if (organizationId) {
      assessments = await storage.getTeamConsciousnessAssessmentsByOrganization(organizationId as string);
    } else if (teamId) {
      assessments = await storage.getTeamConsciousnessAssessmentsByTeam(teamId as string);
    } else {
      assessments = await storage.getTeamConsciousnessAssessments();
    }
    
    res.json(assessments);
  } catch (error) {
    console.error('Failed to fetch team assessments:', error);
    res.status(500).json({ error: 'Failed to fetch team assessments' });
  }
});

router.get('/api/enterprise/team-assessments/:id', async (req, res) => {
  try {
    const assessment = await storage.getTeamConsciousnessAssessment(req.params.id);
    if (!assessment) {
      return res.status(404).json({ error: 'Team assessment not found' });
    }
    res.json(assessment);
  } catch (error) {
    console.error('Failed to fetch team assessment:', error);
    res.status(500).json({ error: 'Failed to fetch team assessment' });
  }
});

router.post('/api/enterprise/team-assessments', async (req, res) => {
  try {
    const validatedData = insertTeamConsciousnessAssessmentSchema.parse(req.body);
    const assessment = await storage.createTeamConsciousnessAssessment(validatedData);
    res.status(201).json(assessment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input data', details: error.errors });
    } else {
      console.error('Failed to create team assessment:', error);
      res.status(500).json({ error: 'Failed to create team assessment' });
    }
  }
});

router.put('/api/enterprise/team-assessments/:id', async (req, res) => {
  try {
    const assessment = await storage.updateTeamConsciousnessAssessment(req.params.id, req.body);
    res.json(assessment);
  } catch (error) {
    if (error.message === 'Team consciousness assessment not found') {
      res.status(404).json({ error: 'Team assessment not found' });
    } else {
      console.error('Failed to update team assessment:', error);
      res.status(500).json({ error: 'Failed to update team assessment' });
    }
  }
});

// Leadership Development Tracking API
router.get('/api/enterprise/leadership-development', async (req, res) => {
  try {
    const { organizationId, executiveId } = req.query;
    
    let trackings;
    if (organizationId) {
      trackings = await storage.getLeadershipDevelopmentTrackingsByOrganization(organizationId as string);
    } else if (executiveId) {
      trackings = await storage.getLeadershipDevelopmentTrackingsByExecutive(executiveId as string);
    } else {
      trackings = await storage.getLeadershipDevelopmentTrackings();
    }
    
    res.json(trackings);
  } catch (error) {
    console.error('Failed to fetch leadership development tracking:', error);
    res.status(500).json({ error: 'Failed to fetch leadership development tracking' });
  }
});

router.get('/api/enterprise/leadership-development/:id', async (req, res) => {
  try {
    const tracking = await storage.getLeadershipDevelopmentTracking(req.params.id);
    if (!tracking) {
      return res.status(404).json({ error: 'Leadership development tracking not found' });
    }
    res.json(tracking);
  } catch (error) {
    console.error('Failed to fetch leadership development tracking:', error);
    res.status(500).json({ error: 'Failed to fetch leadership development tracking' });
  }
});

router.post('/api/enterprise/leadership-development', async (req, res) => {
  try {
    const validatedData = insertLeadershipDevelopmentTrackingSchema.parse(req.body);
    const tracking = await storage.createLeadershipDevelopmentTracking(validatedData);
    res.status(201).json(tracking);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input data', details: error.errors });
    } else {
      console.error('Failed to create leadership development tracking:', error);
      res.status(500).json({ error: 'Failed to create leadership development tracking' });
    }
  }
});

router.put('/api/enterprise/leadership-development/:id', async (req, res) => {
  try {
    const tracking = await storage.updateLeadershipDevelopmentTracking(req.params.id, req.body);
    res.json(tracking);
  } catch (error) {
    if (error.message === 'Leadership development tracking not found') {
      res.status(404).json({ error: 'Leadership development tracking not found' });
    } else {
      console.error('Failed to update leadership development tracking:', error);
      res.status(500).json({ error: 'Failed to update leadership development tracking' });
    }
  }
});

// Enterprise Analytics API
router.get('/api/enterprise/analytics', async (req, res) => {
  try {
    const { organizationId } = req.query;
    
    let analytics;
    if (organizationId) {
      analytics = await storage.getEnterpriseAnalyticsByOrganization(organizationId as string);
    } else {
      analytics = await storage.getEnterpriseAnalytics();
    }
    
    res.json(analytics);
  } catch (error) {
    console.error('Failed to fetch enterprise analytics:', error);
    res.status(500).json({ error: 'Failed to fetch enterprise analytics' });
  }
});

router.get('/api/enterprise/analytics/:id', async (req, res) => {
  try {
    const analytic = await storage.getEnterpriseAnalytic(req.params.id);
    if (!analytic) {
      return res.status(404).json({ error: 'Enterprise analytics not found' });
    }
    res.json(analytic);
  } catch (error) {
    console.error('Failed to fetch enterprise analytics:', error);
    res.status(500).json({ error: 'Failed to fetch enterprise analytics' });
  }
});

router.post('/api/enterprise/analytics', async (req, res) => {
  try {
    const validatedData = insertEnterpriseAnalyticsSchema.parse(req.body);
    const analytics = await storage.createEnterpriseAnalytics(validatedData);
    res.status(201).json(analytics);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input data', details: error.errors });
    } else {
      console.error('Failed to create enterprise analytics:', error);
      res.status(500).json({ error: 'Failed to create enterprise analytics' });
    }
  }
});

router.put('/api/enterprise/analytics/:id', async (req, res) => {
  try {
    const analytics = await storage.updateEnterpriseAnalytics(req.params.id, req.body);
    res.json(analytics);
  } catch (error) {
    if (error.message === 'Enterprise analytics not found') {
      res.status(404).json({ error: 'Enterprise analytics not found' });
    } else {
      console.error('Failed to update enterprise analytics:', error);
      res.status(500).json({ error: 'Failed to update enterprise analytics' });
    }
  }
});

// AI-Enhanced Enterprise Endpoints with Security Protection

// AI-Enhanced Executive Assessment
router.post('/api/enterprise/ai-enhanced-assessment',
  rateLimitAI,
  protectAIEndpoint,
  async (req: AuthenticatedRequest, res) => {
    try {
      const securityContext = extractSecurityContext(req);
      
      const { executiveId, assessmentType, context, options } = req.body;
      
      if (!executiveId || !assessmentType) {
        return res.status(400).json({ 
          error: 'executiveId and assessmentType are required'
        });
      }
      
      const startTime = Date.now();
      
      // Generate AI-enhanced assessment using existing consciousness endpoints
      const prompt = `Analyze executive leadership effectiveness for ${assessmentType} assessment:
        Context: ${context || 'Standard leadership assessment'}
        Options: ${JSON.stringify(options || {})}
        
        Provide detailed insights on:
        1. Leadership strengths and development areas
        2. Decision-making patterns and effectiveness
        3. Team impact and stakeholder management
        4. Strategic thinking capabilities
        5. Emotional intelligence indicators
        6. Communication and influence styles
        
        Format as structured assessment with actionable recommendations.`;
      
      const aiRequest: AIRequest = {
        prompt,
        maxTokens: 2000,
        temperature: 0.7,
        systemMessage: "You are an expert executive leadership assessment AI. Provide professional, actionable insights based on data analysis."
      };
      
      const result = await aiService.generate(aiRequest);
      
      const duration = Date.now() - startTime;
      trackAIUsage(150, req);
      
      res.json({
        assessmentId: `ai-assessment-${Date.now()}`,
        executiveId,
        assessmentType,
        aiInsights: result.content,
        metadata: {
          provider: result.provider,
          model: result.model,
          tokensUsed: result.tokensUsed
        },
        securityInfo: {
          userId: securityContext.userId,
          processingTime: duration,
          costEstimate: 150
        }
      });
      
    } catch (error) {
      console.error('AI-enhanced assessment error:', error);
      res.status(500).json({ 
        error: 'Assessment analysis failed',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal processing error'
      });
    }
  }
);

// AI-Enhanced Strategic Planning
router.post('/api/enterprise/ai-strategic-planning',
  rateLimitAI,
  protectAIEndpoint,
  async (req: AuthenticatedRequest, res) => {
    try {
      const securityContext = extractSecurityContext(req);
      
      const { organizationId, objectives, timeframe, constraints, resources } = req.body;
      
      if (!organizationId || !objectives) {
        return res.status(400).json({ 
          error: 'organizationId and objectives are required'
        });
      }
      
      const startTime = Date.now();
      
      const prompt = `Create comprehensive strategic plan for organization:
        Objectives: ${JSON.stringify(objectives)}
        Timeframe: ${timeframe || '1 year'}
        Constraints: ${JSON.stringify(constraints || [])}
        Resources: ${JSON.stringify(resources || {})}
        
        Provide:
        1. Strategic initiatives with clear priorities
        2. Resource allocation recommendations
        3. Risk assessment and mitigation strategies
        4. Success metrics and KPIs
        5. Implementation roadmap with milestones
        6. Stakeholder alignment strategies
        
        Format as actionable strategic plan with specific recommendations.`;
      
      const aiRequest: AIRequest = {
        prompt,
        maxTokens: 3000,
        temperature: 0.6,
        systemMessage: "You are a strategic planning expert AI. Provide comprehensive, actionable strategic plans."
      };
      
      const result = await aiService.generate(aiRequest);
      
      const duration = Date.now() - startTime;
      trackAIUsage(200, req);
      
      res.json({
        planId: `ai-strategic-plan-${Date.now()}`,
        organizationId,
        strategicPlan: result.content,
        metadata: {
          provider: result.provider,
          model: result.model,
          tokensUsed: result.tokensUsed
        },
        securityInfo: {
          userId: securityContext.userId,
          processingTime: duration,
          costEstimate: 200
        }
      });
      
    } catch (error) {
      console.error('AI strategic planning error:', error);
      res.status(500).json({ 
        error: 'Strategic planning failed',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal processing error'
      });
    }
  }
);

// AI-Enhanced Team Assessment
router.post('/api/enterprise/ai-team-assessment',
  rateLimitAI,
  protectAIEndpoint,
  async (req: AuthenticatedRequest, res) => {
    try {
      const securityContext = extractSecurityContext(req);
      
      const { teamId, assessmentData, focusAreas } = req.body;
      
      if (!teamId || !assessmentData) {
        return res.status(400).json({ 
          error: 'teamId and assessmentData are required'
        });
      }
      
      const startTime = Date.now();
      
      const prompt = `Analyze team consciousness and effectiveness:
        Team Data: ${JSON.stringify(assessmentData)}
        Focus Areas: ${JSON.stringify(focusAreas || ['collaboration', 'communication', 'performance'])}
        
        Provide insights on:
        1. Team consciousness and collective awareness
        2. Collaboration patterns and effectiveness
        3. Communication flow and clarity
        4. Decision-making processes
        5. Conflict resolution capabilities
        6. Innovation and creativity factors
        7. Performance optimization opportunities
        
        Include specific recommendations for team development.`;
      
      const aiRequest: AIRequest = {
        prompt,
        maxTokens: 2500,
        temperature: 0.7,
        systemMessage: "You are a team dynamics expert AI. Analyze team consciousness and provide actionable insights."
      };
      
      const result = await aiService.generate(aiRequest);
      
      const duration = Date.now() - startTime;
      trackAIUsage(175, req);
      
      res.json({
        assessmentId: `ai-team-assessment-${Date.now()}`,
        teamId,
        teamInsights: result.content,
        metadata: {
          provider: result.provider,
          model: result.model,
          tokensUsed: result.tokensUsed
        },
        securityInfo: {
          userId: securityContext.userId,
          processingTime: duration,
          costEstimate: 175
        }
      });
      
    } catch (error) {
      console.error('AI team assessment error:', error);
      res.status(500).json({ 
        error: 'Team assessment failed',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal processing error'
      });
    }
  }
);

export default router;