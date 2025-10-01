/**
 * Global Activist Federation
 * 
 * Brings SpaceChild v1.2 Global Federation Network to Pitchfork Protocol
 * for worldwide activist coordination and distributed resistance.
 * 
 * @version 1.0.0
 */

/**
 * Activist node in the global federation
 */
interface ActivistNode {
  id: string;
  region: string;
  status: 'active' | 'standby' | 'offline';
  
  capabilities: {
    campaignCoordination: boolean;
    secureMessaging: boolean;
    evidenceStorage: boolean;
    fundingManagement: boolean;
  };
  
  metrics: {
    activeCampaigns: number;
    totalActivists: number;
    uptime: number;              // percentage
    latency: number;             // ms
  };
  
  compliance: {
    region: string;
    regulations: string[];       // e.g., ['GDPR', 'local-laws']
  };
  
  lastHeartbeat: Date;
}

/**
 * Regional activist cluster
 */
interface RegionalCluster {
  region: string;
  primaryNode: string;
  backupNodes: string[];
  
  metrics: {
    totalNodes: number;
    totalActivists: number;
    activeCampaigns: number;
    averageLatency: number;
    regionalAvailability: number;
  };
  
  compliance: {
    regulations: string[];
    dataResidency: boolean;
    encryptionRequired: boolean;
  };
}

/**
 * Campaign deployment request
 */
interface CampaignDeployment {
  campaignId: string;
  targetRegions: string[];
  priority: 'low' | 'normal' | 'high' | 'critical';
  requirements: {
    minNodes?: number;
    maxLatency?: number;
    complianceRequired?: string[];
  };
}

/**
 * Global Activist Federation
 * 
 * Worldwide mesh network for activist coordination with
 * regional compliance, disaster recovery, and secure routing.
 */
export class GlobalActivistFederation {
  private nodes: Map<string, ActivistNode> = new Map();
  private clusters: Map<string, RegionalCluster> = new Map();
  private routingTable: Map<string, string[]> = new Map();
  
  // Regional definitions
  private readonly REGIONS = [
    'north-america',
    'south-america',
    'europe-west',
    'europe-east',
    'middle-east',
    'africa',
    'asia-pacific',
    'east-asia',
    'oceania',
    'central-asia'
  ];

  constructor() {
    this.initializeRegionalClusters();
  }

  /**
   * Initialize regional clusters
   */
  private initializeRegionalClusters(): void {
    this.REGIONS.forEach(region => {
      this.clusters.set(region, {
        region,
        primaryNode: '',
        backupNodes: [],
        metrics: {
          totalNodes: 0,
          totalActivists: 0,
          activeCampaigns: 0,
          averageLatency: 100,
          regionalAvailability: 0.999,
        },
        compliance: this.getRegionalCompliance(region),
      });
    });
  }

  /**
   * Register activist node
   */
  registerNode(node: Omit<ActivistNode, 'lastHeartbeat'>): void {
    const fullNode: ActivistNode = {
      ...node,
      lastHeartbeat: new Date(),
    };
    
    this.nodes.set(node.id, fullNode);
    this.updateClusterMetrics(node.region);
    this.updateRoutingTable();
  }

  /**
   * Deploy campaign globally
   */
  deployCampaign(deployment: CampaignDeployment): {
    success: boolean;
    deployedNodes: string[];
    totalActivists: number;
    estimatedReach: number;
  } {
    const deployedNodes: string[] = [];
    let totalActivists = 0;

    for (const region of deployment.targetRegions) {
      const regionalNodes = this.findOptimalNodes(region, deployment);
      
      for (const node of regionalNodes) {
        deployedNodes.push(node.id);
        totalActivists += node.metrics.totalActivists;
      }
    }

    return {
      success: deployedNodes.length > 0,
      deployedNodes,
      totalActivists,
      estimatedReach: totalActivists * 3.2, // Average reach multiplier
    };
  }

  /**
   * Find optimal nodes for deployment
   */
  private findOptimalNodes(
    region: string,
    deployment: CampaignDeployment
  ): ActivistNode[] {
    const regionalNodes = Array.from(this.nodes.values())
      .filter(node => 
        node.region === region && 
        node.status === 'active' &&
        this.meetsRequirements(node, deployment.requirements)
      )
      .sort((a, b) => {
        // Sort by priority: uptime > latency > capacity
        if (a.metrics.uptime !== b.metrics.uptime) {
          return b.metrics.uptime - a.metrics.uptime;
        }
        if (a.metrics.latency !== b.metrics.latency) {
          return a.metrics.latency - b.metrics.latency;
        }
        return b.metrics.totalActivists - a.metrics.totalActivists;
      });

    const minNodes = deployment.requirements.minNodes || 1;
    return regionalNodes.slice(0, Math.max(minNodes, 3));
  }

  /**
   * Check if node meets deployment requirements
   */
  private meetsRequirements(
    node: ActivistNode,
    requirements: CampaignDeployment['requirements']
  ): boolean {
    if (requirements.maxLatency && node.metrics.latency > requirements.maxLatency) {
      return false;
    }

    if (requirements.complianceRequired) {
      const hasCompliance = requirements.complianceRequired.every(req =>
        node.compliance.regulations.includes(req)
      );
      if (!hasCompliance) return false;
    }

    return true;
  }

  /**
   * Route campaign to optimal region
   */
  routeCampaign(
    campaignId: string,
    sourceRegion: string,
    targetRegions: string[]
  ): {
    routes: Array<{ from: string; to: string; latency: number }>;
    totalLatency: number;
  } {
    const routes: Array<{ from: string; to: string; latency: number }> = [];
    let totalLatency = 0;

    for (const targetRegion of targetRegions) {
      const route = this.findOptimalRoute(sourceRegion, targetRegion);
      if (route) {
        routes.push(route);
        totalLatency += route.latency;
      }
    }

    return { routes, totalLatency };
  }

  /**
   * Find optimal route between regions
   */
  private findOptimalRoute(
    from: string,
    to: string
  ): { from: string; to: string; latency: number } | null {
    // Simplified routing - in production, use actual network topology
    const baseLatency = 50;
    const distance = this.calculateRegionalDistance(from, to);
    
    return {
      from,
      to,
      latency: baseLatency + distance * 10,
    };
  }

  /**
   * Calculate distance between regions (simplified)
   */
  private calculateRegionalDistance(region1: string, region2: string): number {
    if (region1 === region2) return 0;
    
    // Simplified distance matrix
    const distances: Record<string, Record<string, number>> = {
      'north-america': { 'europe-west': 4, 'asia-pacific': 8 },
      'europe-west': { 'north-america': 4, 'africa': 2 },
      'asia-pacific': { 'north-america': 8, 'oceania': 2 },
    };
    
    return distances[region1]?.[region2] || 5;
  }

  /**
   * Handle node failover
   */
  handleFailover(failedNodeId: string): {
    success: boolean;
    backupNode?: string;
    affectedCampaigns: string[];
  } {
    const failedNode = this.nodes.get(failedNodeId);
    if (!failedNode) {
      return { success: false, affectedCampaigns: [] };
    }

    // Find backup node in same region
    const backupNode = Array.from(this.nodes.values())
      .find(node => 
        node.region === failedNode.region &&
        node.status === 'active' &&
        node.id !== failedNodeId
      );

    if (backupNode) {
      // Transfer campaigns to backup
      failedNode.status = 'offline';
      
      return {
        success: true,
        backupNode: backupNode.id,
        affectedCampaigns: [], // Would contain actual campaign IDs
      };
    }

    return { success: false, affectedCampaigns: [] };
  }

  /**
   * Get federation health
   */
  getFederationHealth(): {
    totalNodes: number;
    activeNodes: number;
    totalActivists: number;
    globalAvailability: number;
    averageLatency: number;
    regionalHealth: Record<string, number>;
  } {
    const activeNodes = Array.from(this.nodes.values())
      .filter(n => n.status === 'active');

    const totalActivists = activeNodes
      .reduce((sum, n) => sum + n.metrics.totalActivists, 0);

    const averageLatency = activeNodes.length > 0
      ? activeNodes.reduce((sum, n) => sum + n.metrics.latency, 0) / activeNodes.length
      : 100;

    const regionalHealth: Record<string, number> = {};
    this.REGIONS.forEach(region => {
      const regionalNodes = activeNodes.filter(n => n.region === region);
      regionalHealth[region] = regionalNodes.length > 0 ? 0.999 : 0;
    });

    const globalAvailability = activeNodes.length > 0
      ? activeNodes.reduce((sum, n) => sum + n.metrics.uptime, 0) / activeNodes.length / 100
      : 0;

    return {
      totalNodes: this.nodes.size,
      activeNodes: activeNodes.length,
      totalActivists,
      globalAvailability,
      averageLatency,
      regionalHealth,
    };
  }

  /**
   * Update cluster metrics
   */
  private updateClusterMetrics(region: string): void {
    const cluster = this.clusters.get(region);
    if (!cluster) return;

    const regionalNodes = Array.from(this.nodes.values())
      .filter(n => n.region === region);

    cluster.metrics.totalNodes = regionalNodes.length;
    cluster.metrics.totalActivists = regionalNodes
      .reduce((sum, n) => sum + n.metrics.totalActivists, 0);
    
    if (regionalNodes.length > 0) {
      cluster.metrics.averageLatency = 
        regionalNodes.reduce((sum, n) => sum + n.metrics.latency, 0) / regionalNodes.length;
    }
  }

  /**
   * Update routing table
   */
  private updateRoutingTable(): void {
    // Simplified routing table update
    this.REGIONS.forEach(region => {
      const connectedRegions = this.REGIONS.filter(r => r !== region);
      this.routingTable.set(region, connectedRegions);
    });
  }

  /**
   * Get regional compliance requirements
   */
  private getRegionalCompliance(region: string): RegionalCluster['compliance'] {
    const complianceMap: Record<string, RegionalCluster['compliance']> = {
      'europe-west': {
        regulations: ['GDPR', 'ePrivacy'],
        dataResidency: true,
        encryptionRequired: true,
      },
      'north-america': {
        regulations: ['CCPA', 'local-laws'],
        dataResidency: false,
        encryptionRequired: true,
      },
      'asia-pacific': {
        regulations: ['local-laws'],
        dataResidency: true,
        encryptionRequired: true,
      },
    };

    return complianceMap[region] || {
      regulations: ['local-laws'],
      dataResidency: false,
      encryptionRequired: true,
    };
  }

  /**
   * Get statistics
   */
  getStatistics() {
    const health = this.getFederationHealth();
    
    return {
      totalRegions: this.REGIONS.length,
      totalNodes: this.nodes.size,
      activeNodes: health.activeNodes,
      totalActivists: health.totalActivists,
      globalAvailability: health.globalAvailability,
      averageLatency: health.averageLatency,
    };
  }
}

/**
 * Singleton instance
 */
export const globalActivistFederation = new GlobalActivistFederation();
