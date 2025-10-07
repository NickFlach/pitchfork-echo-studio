/**
 * API Routes for DAO Paradox Optimizer
 */

import { Router } from 'express';
import { daoParadoxOptimizer } from './dao-paradox-optimizer';

const router = Router();

/**
 * POST /api/dao-paradox/optimize-funding
 * 
 * Optimize campaign funding allocation
 */
router.post('/optimize-funding', async (req, res) => {
  try {
    const { campaigns, treasury, stakeholders } = req.body;

    if (!campaigns || !treasury || !stakeholders) {
      return res.status(400).json({ 
        error: 'Missing required fields: campaigns, treasury, stakeholders' 
      });
    }

    const result = await daoParadoxOptimizer.optimizeCampaignFunding(
      campaigns,
      treasury,
      stakeholders
    );

    res.json({
      success: true,
      allocation: result
    });

  } catch (error) {
    console.error('Funding optimization error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Optimization failed' 
    });
  }
});

/**
 * POST /api/dao-paradox/resolve-proposal
 * 
 * Resolve governance proposal with competing options
 */
router.post('/resolve-proposal', async (req, res) => {
  try {
    const { proposal } = req.body;

    if (!proposal) {
      return res.status(400).json({ error: 'Missing proposal data' });
    }

    const result = await daoParadoxOptimizer.resolveGovernanceProposal(proposal);

    res.json({
      success: true,
      resolution: result
    });

  } catch (error) {
    console.error('Proposal resolution error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Resolution failed' 
    });
  }
});

/**
 * POST /api/dao-paradox/resolve-ethical
 * 
 * Resolve ethical conflicts in activism
 */
router.post('/resolve-ethical', async (req, res) => {
  try {
    const { conflict } = req.body;

    if (!conflict) {
      return res.status(400).json({ error: 'Missing conflict data' });
    }

    const result = await daoParadoxOptimizer.resolveEthicalConflict(conflict);

    res.json({
      success: true,
      resolution: result
    });

  } catch (error) {
    console.error('Ethical resolution error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Resolution failed' 
    });
  }
});

/**
 * POST /api/dao-paradox/emergency-response
 * 
 * Optimize emergency response resource allocation
 */
router.post('/emergency-response', async (req, res) => {
  try {
    const { incidents, availableResources } = req.body;

    if (!incidents || !availableResources) {
      return res.status(400).json({ 
        error: 'Missing required fields: incidents, availableResources' 
      });
    }

    const result = await daoParadoxOptimizer.optimizeEmergencyResponse(
      incidents,
      availableResources
    );

    res.json({
      success: true,
      optimization: result
    });

  } catch (error) {
    console.error('Emergency response error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Optimization failed' 
    });
  }
});

/**
 * POST /api/dao-paradox/evolve-strategies
 * 
 * Evolve novel governance strategies
 */
router.post('/evolve-strategies', async (req, res) => {
  try {
    const { historicalDecisions, generations } = req.body;

    if (!historicalDecisions) {
      return res.status(400).json({ error: 'Missing historical decisions data' });
    }

    const result = await daoParadoxOptimizer.evolveGovernanceStrategies(
      historicalDecisions,
      generations || 15
    );

    res.json({
      success: true,
      evolution: result
    });

  } catch (error) {
    console.error('Strategy evolution error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Evolution failed' 
    });
  }
});

/**
 * GET /api/dao-paradox/stats
 * 
 * Get DAO optimization statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = daoParadoxOptimizer.getDAOStats();
    const serviceAvailable = await daoParadoxOptimizer.isServiceAvailable();

    res.json({
      success: true,
      stats,
      serviceStatus: serviceAvailable ? 'operational' : 'unavailable'
    });

  } catch (error) {
    console.error('Stats retrieval error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to retrieve stats' 
    });
  }
});

/**
 * GET /api/dao-paradox/health
 * 
 * Health check for ParadoxResolver service
 */
router.get('/health', async (req, res) => {
  try {
    const available = await daoParadoxOptimizer.isServiceAvailable();

    res.json({
      service: 'DAO Paradox Optimizer',
      status: available ? 'operational' : 'unavailable',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.status(503).json({
      service: 'DAO Paradox Optimizer',
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
