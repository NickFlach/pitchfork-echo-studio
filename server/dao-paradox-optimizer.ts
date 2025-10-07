/**
 * DAO Governance Paradox Optimizer for Pitchfork Protocol
 * 
 * Integrates ParadoxResolver to optimize resource allocation,
 * resolve governance conflicts, and ensure fair campaign funding.
 */

import { ParadoxResolverClient, createParadoxResolverClient } from '../../ParadoxResolver/client/ParadoxResolverClient';

export interface CampaignFundingRequest {
  campaignId: string;
  campaignName: string;
  requestedAmount: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: 'legal' | 'protest' | 'education' | 'infrastructure' | 'emergency';
  supporters: number;
  impact: number; // 0-1 scale
  urgency: number; // 0-1 scale
}

export interface Stakeholder {
  address: string;
  votingPower: number;
  reputation: number;
  preferences: Record<string, number>; // Category preferences
}

export interface TreasuryResources {
  totalFunds: number;
  allocatedFunds: number;
  availableFunds: number;
  categories: Record<string, number>; // Budget per category
}

export interface OptimizedAllocation {
  allocations: Record<string, number>; // campaignId -> amount
  stakeholderSatisfaction: Record<string, number>;
  fairnessScore: number;
  totalSatisfaction: number;
  utilizationRate: number;
  reasoning: string;
  timestamp: Date;
}

export interface GovernanceProposal {
  proposalId: string;
  type: 'funding' | 'policy' | 'strategic' | 'emergency';
  options: ProposalOption[];
  voters: VoterPreference[];
  requiredQuorum: number;
}

export interface ProposalOption {
  optionId: string;
  description: string;
  impact: number;
  cost: number;
  supporters: number;
}

export interface VoterPreference {
  voterAddress: string;
  votingPower: number;
  preferences: Record<string, number>; // optionId -> weight
}

export interface ResolvedProposal {
  selectedOption: string;
  confidence: number;
  voterSatisfaction: Record<string, number>;
  reasoning: string;
  method: 'convergent' | 'meta_phase' | 'evolutionary';
  timestamp: Date;
}

export interface EthicalConflict {
  conflictId: string;
  description: string;
  ethicalPrinciples: string[];
  proposedActions: Array<{
    actionId: string;
    description: string;
    ethicalScore: number;
    alignmentScores: Record<string, number>; // principle -> score
  }>;
}

export interface EthicalResolution {
  resolvedAction: string;
  ethicalAlignment: number;
  principleWeights: Record<string, number>;
  reasoning: string;
  consciousnessVerified: boolean;
  timestamp: Date;
}

export class DAOParadoxOptimizer {
  private client: ParadoxResolverClient;
  private allocationHistory: Map<string, OptimizedAllocation> = new Map();
  private proposalHistory: Map<string, ResolvedProposal> = new Map();

  constructor(serviceUrl?: string) {
    this.client = createParadoxResolverClient({
      serviceUrl: serviceUrl || 'http://localhost:3333',
      timeout: 30000
    });
  }

  /**
   * Optimize funding allocation across multiple campaigns
   */
  async optimizeCampaignFunding(
    requests: CampaignFundingRequest[],
    treasury: TreasuryResources,
    stakeholders: Stakeholder[]
  ): Promise<OptimizedAllocation> {
    try {
      // Prepare resources (categories with available funds)
      const resources = Object.entries(treasury.categories).map(([category, budget]) => ({
        name: category,
        total: budget
      }));

      // Map stakeholders to optimizer format
      const optimizerStakeholders = stakeholders.map(s => ({
        name: s.address,
        influence: s.votingPower * s.reputation,
        preferences: s.preferences
      }));

      // Run optimization
      const result = await this.client.optimize({
        resources,
        stakeholders: optimizerStakeholders
      });

      if (!result.success) {
        throw new Error(result.error || 'Optimization failed');
      }

      // Map allocations back to campaigns
      const campaignAllocations: Record<string, number> = {};
      const categoryAllocations = result.allocation;

      requests.forEach(request => {
        const categoryBudget = categoryAllocations[request.address]?.[request.category] || 0;
        const allocatedAmount = Math.min(
          request.requestedAmount,
          categoryBudget * (request.impact * 0.5 + request.urgency * 0.5)
        );
        campaignAllocations[request.campaignId] = allocatedAmount;
      });

      // Calculate utilization
      const totalAllocated = Object.values(campaignAllocations).reduce((sum, amt) => sum + amt, 0);
      const utilizationRate = totalAllocated / treasury.availableFunds;

      const allocation: OptimizedAllocation = {
        allocations: campaignAllocations,
        stakeholderSatisfaction: result.stakeholder_satisfaction as Record<string, number>,
        fairnessScore: result.fairness_score,
        totalSatisfaction: result.total_satisfaction,
        utilizationRate,
        reasoning: `Optimized allocation across ${requests.length} campaigns using paradox resolution. Achieved ${(result.fairness_score * 100).toFixed(1)}% fairness score with ${(utilizationRate * 100).toFixed(1)}% fund utilization.`,
        timestamp: new Date()
      };

      this.allocationHistory.set(`allocation_${Date.now()}`, allocation);
      return allocation;

    } catch (error) {
      console.error('Campaign funding optimization failed:', error);
      throw error;
    }
  }

  /**
   * Resolve governance proposal with competing options
   */
  async resolveGovernanceProposal(proposal: GovernanceProposal): Promise<ResolvedProposal> {
    try {
      // Convert to paradox resolution format
      const initialState = proposal.options.map(opt => 
        opt.supporters * opt.impact / Math.max(1, opt.cost)
      );

      // Select resolution strategy based on proposal type
      const useMetaPhase = proposal.type === 'strategic' || proposal.type === 'emergency';
      
      let result;
      if (useMetaPhase) {
        result = await this.client.metaResolve({
          initial_state: initialState,
          input_type: 'numerical',
          max_phase_transitions: 5,
          max_total_iterations: 50
        });
      } else {
        result = await this.client.resolve({
          initial_state: initialState,
          input_type: 'numerical',
          max_iterations: 30,
          convergence_threshold: 0.001,
          rules: ['bayesian_update', 'recursive_normalization', 'fixed_point_iteration']
        });
      }

      if (!result.success) {
        throw new Error(result.error || 'Proposal resolution failed');
      }

      // Determine winning option
      const finalWeights = Array.isArray(result.final_state) 
        ? result.final_state 
        : [result.final_state];
      
      const maxWeight = Math.max(...finalWeights.map(Math.abs));
      const winningIndex = finalWeights.findIndex(w => Math.abs(w) === maxWeight);
      const selectedOption = proposal.options[winningIndex]?.optionId || proposal.options[0].optionId;

      // Calculate voter satisfaction
      const voterSatisfaction: Record<string, number> = {};
      proposal.voters.forEach(voter => {
        const preference = voter.preferences[selectedOption] || 0;
        voterSatisfaction[voter.voterAddress] = preference;
      });

      const avgSatisfaction = Object.values(voterSatisfaction).reduce((sum, s) => sum + s, 0) / 
        Object.values(voterSatisfaction).length;

      const resolution: ResolvedProposal = {
        selectedOption,
        confidence: result.converged ? 0.95 : 0.85,
        voterSatisfaction,
        reasoning: useMetaPhase 
          ? `Resolved through meta-framework with ${(result as any).phase_transitions} phase transitions. Selected option maximizes collective utility.`
          : `Converged to optimal solution in ${(result as any).iterations} iterations. Average voter satisfaction: ${(avgSatisfaction * 100).toFixed(1)}%.`,
        method: useMetaPhase ? 'meta_phase' : 'convergent',
        timestamp: new Date()
      };

      this.proposalHistory.set(proposal.proposalId, resolution);
      return resolution;

    } catch (error) {
      console.error('Governance proposal resolution failed:', error);
      throw error;
    }
  }

  /**
   * Resolve ethical conflicts in activism campaigns
   */
  async resolveEthicalConflict(conflict: EthicalConflict): Promise<EthicalResolution> {
    try {
      // Convert ethical principles to optimization problem
      const actionScores = conflict.proposedActions.map(action => {
        // Weighted sum of alignment scores
        const totalAlignment = Object.entries(action.alignmentScores).reduce(
          (sum, [principle, score]) => sum + score,
          0
        );
        return totalAlignment / Object.keys(action.alignmentScores).length;
      });

      const result = await this.client.resolve({
        initial_state: actionScores,
        input_type: 'numerical',
        max_iterations: 40,
        convergence_threshold: 0.001,
        rules: [
          'bayesian_update',
          'fuzzy_logic_transformation',
          'recursive_normalization'
        ]
      });

      if (!result.success) {
        throw new Error(result.error || 'Ethical resolution failed');
      }

      // Select action with highest resolved score
      const finalScores = Array.isArray(result.final_state) 
        ? result.final_state 
        : [result.final_state];
      
      const maxScore = Math.max(...finalScores);
      const selectedIndex = finalScores.indexOf(maxScore);
      const resolvedAction = conflict.proposedActions[selectedIndex]?.actionId || 
        conflict.proposedActions[0].actionId;

      // Calculate principle weights
      const selectedActionAlignments = conflict.proposedActions[selectedIndex].alignmentScores;
      const totalWeight = Object.values(selectedActionAlignments).reduce((sum, w) => sum + w, 0);
      const principleWeights: Record<string, number> = {};
      
      Object.entries(selectedActionAlignments).forEach(([principle, score]) => {
        principleWeights[principle] = score / totalWeight;
      });

      return {
        resolvedAction,
        ethicalAlignment: maxScore,
        principleWeights,
        reasoning: `Resolved ethical conflict through ${(result as any).iterations} iterations of transformation. Selected action aligns with ${Object.keys(selectedActionAlignments).length} ethical principles with ${(maxScore * 100).toFixed(1)}% overall alignment.`,
        consciousnessVerified: false, // Can be enhanced with consciousness verification
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Ethical conflict resolution failed:', error);
      throw error;
    }
  }

  /**
   * Optimize resource allocation for emergency response
   */
  async optimizeEmergencyResponse(
    incidents: Array<{
      incidentId: string;
      severity: number; // 0-1
      affectedPeople: number;
      resourceNeeds: Record<string, number>; // resource type -> amount
    }>,
    availableResources: Record<string, number>
  ): Promise<{
    allocations: Record<string, Record<string, number>>; // incidentId -> resources
    priorityScore: Record<string, number>;
    reasoning: string;
  }> {
    try {
      // Convert to optimization problem
      const resources = Object.entries(availableResources).map(([name, total]) => ({
        name,
        total
      }));

      const stakeholders = incidents.map(inc => ({
        name: inc.incidentId,
        influence: inc.severity * Math.log10(inc.affectedPeople + 1),
        preferences: Object.fromEntries(
          Object.entries(inc.resourceNeeds).map(([res, need]) => [
            res,
            need / Math.max(...Object.values(inc.resourceNeeds))
          ])
        )
      }));

      const result = await this.client.optimize({
        resources,
        stakeholders
      });

      if (!result.success) {
        throw new Error(result.error || 'Emergency optimization failed');
      }

      // Extract allocations
      const allocations: Record<string, Record<string, number>> = {};
      incidents.forEach(inc => {
        allocations[inc.incidentId] = result.allocation[inc.incidentId] || {};
      });

      const priorityScore = result.stakeholder_satisfaction as Record<string, number>;

      return {
        allocations,
        priorityScore,
        reasoning: `Emergency response optimized across ${incidents.length} incidents with ${(result.fairness_score * 100).toFixed(1)}% fairness. Prioritized based on severity and impact.`
      };

    } catch (error) {
      console.error('Emergency response optimization failed:', error);
      throw error;
    }
  }

  /**
   * Evolve novel governance strategies
   */
  async evolveGovernanceStrategies(
    historicalDecisions: Array<{
      context: number[];
      outcome: number; // Success score 0-1
    }>,
    generations: number = 15
  ): Promise<{
    strategies: Array<{ name: string; fitness: number; components: string[] }>;
    bestFitness: number;
    reasoning: string;
  }> {
    try {
      const testCases = historicalDecisions.map(d => d.context);

      const result = await this.client.evolve({
        test_cases: testCases,
        generations,
        population_size: 25,
        mutation_rate: 0.3
      });

      if (!result.success) {
        throw new Error(result.error || 'Strategy evolution failed');
      }

      return {
        strategies: result.best_rules.slice(0, 5),
        bestFitness: result.best_fitness,
        reasoning: `Evolved ${result.best_rules.length} governance strategies over ${generations} generations. Best strategy achieved ${(result.best_fitness * 100).toFixed(1)}% fitness with ${result.best_rules[0]?.components.length || 0} transformation components.`
      };

    } catch (error) {
      console.error('Strategy evolution failed:', error);
      throw error;
    }
  }

  /**
   * Get optimization statistics
   */
  getDAOStats(): {
    totalAllocations: number;
    totalProposals: number;
    averageFairness: number;
    averageUtilization: number;
    averageProposalConfidence: number;
  } {
    const allocations = Array.from(this.allocationHistory.values());
    const proposals = Array.from(this.proposalHistory.values());

    return {
      totalAllocations: allocations.length,
      totalProposals: proposals.length,
      averageFairness: allocations.length > 0
        ? allocations.reduce((sum, a) => sum + a.fairnessScore, 0) / allocations.length
        : 0,
      averageUtilization: allocations.length > 0
        ? allocations.reduce((sum, a) => sum + a.utilizationRate, 0) / allocations.length
        : 0,
      averageProposalConfidence: proposals.length > 0
        ? proposals.reduce((sum, p) => sum + p.confidence, 0) / proposals.length
        : 0
    };
  }

  /**
   * Check service availability
   */
  async isServiceAvailable(): Promise<boolean> {
    try {
      await this.client.healthCheck();
      return true;
    } catch {
      return false;
    }
  }
}

// Singleton instance
export const daoParadoxOptimizer = new DAOParadoxOptimizer();
