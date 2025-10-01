/**
 * SpaceChild Integration Routes
 * 
 * API routes exposing SpaceChild v1.2 features in Pitchfork Protocol
 * 
 * @version 1.0.0
 */

import { Router, Request, Response } from 'express';
import { predictiveActivismEngine } from './spacechild-integration/PredictiveActivismEngine';
import { globalActivistFederation } from './spacechild-integration/GlobalActivistFederation';
import { evolvingActivistAgents } from './spacechild-integration/EvolvingActivistAgents';

const router = Router();

// ============================================================================
// Predictive Activism Routes
// ============================================================================

/**
 * POST /api/spacechild/activism/predict
 * Predict campaign outcome
 */
router.post('/activism/predict', async (req: Request, res: Response) => {
  try {
    const { campaignId, horizonDays = 7 } = req.body;
    
    const forecast = await predictiveActivismEngine.generateCampaignForecast(
      campaignId,
      horizonDays
    );
    
    res.json({
      success: true,
      forecast,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/spacechild/activism/record
 * Record campaign data point
 */
router.post('/activism/record', (req: Request, res: Response) => {
  try {
    const dataPoint = req.body;
    
    predictiveActivismEngine.recordCampaignData(dataPoint);
    
    res.json({
      success: true,
      message: 'Campaign data recorded',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============================================================================
// Global Federation Routes
// ============================================================================

/**
 * POST /api/spacechild/federation/deploy
 * Deploy campaign globally
 */
router.post('/federation/deploy', (req: Request, res: Response) => {
  try {
    const deployment = req.body;
    
    const result = globalActivistFederation.deployCampaign(deployment);
    
    res.json({
      success: result.success,
      result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/spacechild/federation/register-node
 * Register new activist node
 */
router.post('/federation/register-node', (req: Request, res: Response) => {
  try {
    const node = req.body;
    
    globalActivistFederation.registerNode(node);
    
    res.json({
      success: true,
      message: 'Node registered successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/spacechild/federation/health
 * Get federation health
 */
router.get('/federation/health', (req: Request, res: Response) => {
  try {
    const health = globalActivistFederation.getFederationHealth();
    
    res.json({
      success: true,
      health,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============================================================================
// Evolving Agents Routes
// ============================================================================

/**
 * POST /api/spacechild/agents/initialize
 * Initialize agent population
 */
router.post('/agents/initialize', (req: Request, res: Response) => {
  try {
    const { populationSize = 100 } = req.body;
    
    evolvingActivistAgents.initializePopulation(populationSize);
    
    res.json({
      success: true,
      message: `Initialized population of ${populationSize} agents`,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/spacechild/agents/evolve
 * Evolve to next generation
 */
router.post('/agents/evolve', async (req: Request, res: Response) => {
  try {
    const result = await evolvingActivistAgents.evolveGeneration();
    
    res.json({
      success: true,
      evolution: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/spacechild/agents/best
 * Get best agent
 */
router.get('/agents/best', (req: Request, res: Response) => {
  try {
    const bestAgent = evolvingActivistAgents.getBestAgent();
    
    if (!bestAgent) {
      return res.status(404).json({
        success: false,
        error: 'No agents in population',
      });
    }
    
    res.json({
      success: true,
      agent: bestAgent,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/spacechild/agents/top
 * Get top N agents
 */
router.get('/agents/top', (req: Request, res: Response) => {
  try {
    const n = parseInt(req.query.n as string) || 10;
    
    const topAgents = evolvingActivistAgents.getTopAgents(n);
    
    res.json({
      success: true,
      agents: topAgents,
      count: topAgents.length,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/spacechild/status
 * Get overall SpaceChild integration status
 */
router.get('/status', (req: Request, res: Response) => {
  try {
    const stats = {
      predictiveActivism: predictiveActivismEngine.getStatistics(),
      globalFederation: globalActivistFederation.getStatistics(),
      evolvingAgents: evolvingActivistAgents.getStatistics(),
    };
    
    res.json({
      success: true,
      integration: 'SpaceChild v1.2 Features',
      status: 'operational',
      statistics: stats,
      capabilities: [
        'Predictive campaign forecasting',
        'Global activist federation',
        'Self-improving AI agents',
      ],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
