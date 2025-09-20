import express from 'express';
import { z } from 'zod';
import { storage } from './storage';
import { ConsciousnessEngine } from './ConsciousnessEngine';
import { 
  insertConsciousnessStateSchema,
  insertDecisionRecordSchema,
  insertLearningCycleSchema,
  insertReflectionLogSchema,
  insertComplexityMapSchema 
} from '../shared/schema';

const router = express.Router();

// Initialize consciousness engine
const consciousnessEngine = new ConsciousnessEngine('default-agent');

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
    const result = await consciousnessEngine.processDecision(context, options);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to process decision through consciousness engine' });
  }
});

router.post('/api/consciousness/reflect', async (req, res) => {
  try {
    const { trigger } = req.body;
    const result = await consciousnessEngine.reflect(trigger);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to process reflection through consciousness engine' });
  }
});

router.post('/api/consciousness/learn', async (req, res) => {
  try {
    const { experience } = req.body;
    const result = await consciousnessEngine.learn(experience);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to process learning through consciousness engine' });
  }
});

router.post('/api/consciousness/handle-crisis', async (req, res) => {
  try {
    const { crisis } = req.body;
    const result = await consciousnessEngine.handleCrisis(crisis);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to handle crisis through consciousness engine' });
  }
});

export default router;