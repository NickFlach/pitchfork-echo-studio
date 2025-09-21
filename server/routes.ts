import express from 'express';
import { z } from 'zod';
import { storage } from './storage';
import { ConsciousnessEngine } from './ConsciousnessEngine';
import { MultiscaleAwarenessEngine } from './MultiscaleAwarenessEngine';
import { DecisionSynthesisEngine } from './DecisionSynthesisEngine';
import { WisdomIntegrationSystem } from './WisdomIntegrationSystem';
import { 
  insertConsciousnessStateSchema,
  insertDecisionRecordSchema,
  insertLearningCycleSchema,
  insertReflectionLogSchema,
  insertComplexityMapSchema,
  insertDecisionSynthesisSchema,
  insertDecisionArchetypeSchema,
  insertDecisionEvolutionSchema,
  decisionOptionSchema
} from '../shared/schema';

const router = express.Router();

// Initialize consciousness components
const consciousnessEngine = new ConsciousnessEngine('default-agent');
const multiscaleAwarenessEngine = new MultiscaleAwarenessEngine('default-agent');
const decisionSynthesisEngine = new DecisionSynthesisEngine('default-agent');
const wisdomIntegrationSystem = new WisdomIntegrationSystem('default-agent');

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

// Consciousness Engine High-Level API
router.post('/api/consciousness/process-decision', async (req, res) => {
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

router.post('/api/consciousness/reflect', async (req, res) => {
  try {
    const { trigger } = req.body;
    
    if (!trigger || typeof trigger !== 'string') {
      return res.status(400).json({ error: 'Trigger is required and must be a string' });
    }
    
    const result = await consciousnessEngine.reflect(trigger);
    res.json(result);
  } catch (error) {
    console.error('Consciousness reflection error:', error);
    res.status(500).json({ 
      error: 'Failed to process reflection through consciousness engine',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/api/consciousness/learn', async (req, res) => {
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

router.post('/api/consciousness/handle-crisis', async (req, res) => {
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
router.post('/api/multiscale-decision', async (req, res) => {
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
    
    // Comprehensive result with proper serialization for Maps
    const comprehensiveResult = {
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
router.post('/api/demo/multiscale-decision-demo', async (req, res) => {
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

export default router;