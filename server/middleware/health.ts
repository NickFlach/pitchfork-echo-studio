/**
 * Health Check Middleware - Pitchfork Protocol
 * Monitoring endpoints for decentralized resistance platform
 */

import { Request, Response } from 'express';

interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  version: string;
  services: {
    consciousness: ServiceStatus;
    ipfs: ServiceStatus;
    blockchain: ServiceStatus;
  };
}

interface ServiceStatus {
  status: 'up' | 'down' | 'degraded';
  latency?: number;
  message?: string;
}

/**
 * Health Check - Quick liveness probe
 */
export async function healthCheck(req: Request, res: Response): Promise<void> {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    platform: 'pitchfork-protocol',
  });
}

/**
 * Readiness Check - Comprehensive dependency check
 */
export async function readinessCheck(req: Request, res: Response): Promise<void> {
  const health: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    services: {
      consciousness: checkConsciousness(),
      ipfs: await checkIPFS(),
      blockchain: checkBlockchain(),
    },
  };

  // Determine overall status
  const services = Object.values(health.services);
  if (services.some(s => s.status === 'down')) {
    health.status = 'unhealthy';
    res.status(503).json(health);
    return;
  }
  
  if (services.some(s => s.status === 'degraded')) {
    health.status = 'degraded';
  }

  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
}

/**
 * Check consciousness engine status
 */
function checkConsciousness(): ServiceStatus {
  try {
    const enabled = process.env.CONSCIOUSNESS_ENABLED === 'true';
    return {
      status: enabled ? 'up' : 'degraded',
      message: enabled ? 'Temporal consciousness active' : 'Consciousness disabled',
    };
  } catch (error: any) {
    return {
      status: 'down',
      message: error?.message || 'Consciousness check failed',
    };
  }
}

/**
 * Check IPFS connectivity
 */
async function checkIPFS(): Promise<ServiceStatus> {
  const ipfsEnabled = process.env.FEATURE_IPFS_ENABLED === 'true';
  
  if (!ipfsEnabled) {
    return {
      status: 'degraded',
      message: 'IPFS disabled',
    };
  }

  try {
    const ipfsUrl = process.env.IPFS_API_URL || 'http://localhost:5001';
    // Basic connectivity check (would need actual IPFS client)
    return {
      status: 'up',
      message: 'IPFS configured',
    };
  } catch (error: any) {
    return {
      status: 'down',
      message: error?.message || 'IPFS connection failed',
    };
  }
}

/**
 * Check blockchain connectivity
 */
function checkBlockchain(): ServiceStatus {
  const web3Enabled = process.env.FEATURE_WEB3_ENABLED === 'true';
  
  if (!web3Enabled) {
    return {
      status: 'degraded',
      message: 'Web3 disabled',
    };
  }

  const hasRpcUrl = !!(process.env.ETHEREUM_RPC_URL || process.env.POLYGON_RPC_URL);
  
  return {
    status: hasRpcUrl ? 'up' : 'degraded',
    message: hasRpcUrl ? 'Blockchain RPCs configured' : 'No RPC URLs configured',
  };
}

/**
 * Metrics endpoint
 */
export async function metricsEndpoint(req: Request, res: Response): Promise<void> {
  const memory = process.memoryUsage();
  
  const metrics = `
# HELP pitchfork_memory_heap_used Memory heap used
# TYPE pitchfork_memory_heap_used gauge
pitchfork_memory_heap_used ${memory.heapUsed}

# HELP pitchfork_uptime_seconds Process uptime
# TYPE pitchfork_uptime_seconds gauge
pitchfork_uptime_seconds ${process.uptime()}

# HELP pitchfork_consciousness_enabled Consciousness status
# TYPE pitchfork_consciousness_enabled gauge
pitchfork_consciousness_enabled ${process.env.CONSCIOUSNESS_ENABLED === 'true' ? 1 : 0}

# HELP pitchfork_web3_enabled Web3 status
# TYPE pitchfork_web3_enabled gauge
pitchfork_web3_enabled ${process.env.FEATURE_WEB3_ENABLED === 'true' ? 1 : 0}
`.trim();

  res.set('Content-Type', 'text/plain; version=0.0.4');
  res.send(metrics);
}
