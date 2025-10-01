/**
 * Evolving Activist Agents
 * 
 * Brings SpaceChild v1.2 Self-Improving Agent Architectures to Pitchfork Protocol
 * for continuously evolving AI agents that optimize activism strategies.
 * 
 * @version 1.0.0
 */

/**
 * Activist agent genome
 */
interface ActivistAgentGenome {
  id: string;
  generation: number;
  
  genes: {
    strategicThinking: number;    // 0-1
    empathy: number;              // 0-1
    riskAssessment: number;       // 0-1
    creativity: number;           // 0-1
    persistence: number;          // 0-1
    collaboration: number;        // 0-1
    communication: number;        // 0-1
    adaptability: number;         // 0-1
  };
  
  fitness: number;                // Performance score
  age: number;                    // Generations survived
  parentIds: string[];
  
  performanceHistory: {
    campaignsAssisted: number;
    successRate: number;
    activistsSupportedå: number;
    innovationScore: number;
  };
}

/**
 * Evolution configuration
 */
interface EvolutionConfig {
  populationSize: number;
  mutationRate: number;
  crossoverRate: number;
  elitismCount: number;
  fitnessFunction: 'balanced' | 'success-focused' | 'innovation-focused';
}

/**
 * Evolving Activist Agents System
 * 
 * Uses evolutionary algorithms to create self-improving AI agents
 * that continuously optimize their activism support strategies.
 */
export class EvolvingActivistAgents {
  private population: ActivistAgentGenome[] = [];
  private generation: number = 0;
  private readonly DEFAULT_POPULATION_SIZE = 100;
  
  private config: EvolutionConfig = {
    populationSize: 100,
    mutationRate: 0.1,
    crossoverRate: 0.7,
    elitismCount: 5,
    fitnessFunction: 'balanced',
  };

  constructor() {}

  /**
   * Initialize population
   */
  initializePopulation(size: number = this.DEFAULT_POPULATION_SIZE): void {
    this.population = [];
    
    for (let i = 0; i < size; i++) {
      this.population.push(this.createRandomAgent());
    }
    
    this.generation = 0;
  }

  /**
   * Create random agent
   */
  private createRandomAgent(): ActivistAgentGenome {
    return {
      id: this.generateId(),
      generation: this.generation,
      genes: {
        strategicThinking: Math.random(),
        empathy: Math.random(),
        riskAssessment: Math.random(),
        creativity: Math.random(),
        persistence: Math.random(),
        collaboration: Math.random(),
        communication: Math.random(),
        adaptability: Math.random(),
      },
      fitness: 0,
      age: 0,
      parentIds: [],
      performanceHistory: {
        campaignsAssisted: 0,
        successRate: 0,
        activistsSupportedå: 0,
        innovationScore: 0,
      },
    };
  }

  /**
   * Evolve to next generation
   */
  async evolveGeneration(): Promise<{
    generation: number;
    averageFitness: number;
    bestFitness: number;
    geneticDiversity: number;
  }> {
    if (this.population.length === 0) {
      this.initializePopulation();
    }

    // Evaluate fitness
    this.population.forEach(agent => {
      agent.fitness = this.evaluateFitness(agent);
    });

    // Sort by fitness
    this.population.sort((a, b) => b.fitness - a.fitness);

    // Create new generation
    const newPopulation: ActivistAgentGenome[] = [];

    // Elitism: Keep top performers
    for (let i = 0; i < this.config.elitismCount; i++) {
      const elite = { ...this.population[i] };
      elite.age++;
      newPopulation.push(elite);
    }

    // Fill rest with offspring
    while (newPopulation.length < this.config.populationSize) {
      const parent1 = this.selectParent();
      const parent2 = this.selectParent();
      
      let offspring = this.crossover(parent1, parent2);
      offspring = this.mutate(offspring);
      
      newPopulation.push(offspring);
    }

    this.population = newPopulation;
    this.generation++;

    // Calculate statistics
    const averageFitness = this.population.reduce((sum, a) => sum + a.fitness, 0) / this.population.length;
    const bestFitness = this.population[0].fitness;
    const geneticDiversity = this.calculateGeneticDiversity();

    return {
      generation: this.generation,
      averageFitness,
      bestFitness,
      geneticDiversity,
    };
  }

  /**
   * Evaluate agent fitness
   */
  private evaluateFitness(agent: ActivistAgentGenome): number {
    const genes = agent.genes;
    
    switch (this.config.fitnessFunction) {
      case 'success-focused':
        return (
          genes.strategicThinking * 0.3 +
          genes.riskAssessment * 0.25 +
          genes.persistence * 0.2 +
          genes.collaboration * 0.15 +
          genes.communication * 0.1
        );
      
      case 'innovation-focused':
        return (
          genes.creativity * 0.35 +
          genes.adaptability * 0.25 +
          genes.strategicThinking * 0.2 +
          genes.empathy * 0.1 +
          genes.communication * 0.1
        );
      
      case 'balanced':
      default:
        return (
          genes.strategicThinking * 0.15 +
          genes.empathy * 0.15 +
          genes.riskAssessment * 0.125 +
          genes.creativity * 0.125 +
          genes.persistence * 0.1 +
          genes.collaboration * 0.15 +
          genes.communication * 0.1 +
          genes.adaptability * 0.1
        ) * (1 + agent.performanceHistory.successRate * 0.2);
    }
  }

  /**
   * Select parent using tournament selection
   */
  private selectParent(): ActivistAgentGenome {
    const tournamentSize = 5;
    let best = this.population[Math.floor(Math.random() * this.population.length)];
    
    for (let i = 1; i < tournamentSize; i++) {
      const candidate = this.population[Math.floor(Math.random() * this.population.length)];
      if (candidate.fitness > best.fitness) {
        best = candidate;
      }
    }
    
    return best;
  }

  /**
   * Crossover two parents
   */
  private crossover(parent1: ActivistAgentGenome, parent2: ActivistAgentGenome): ActivistAgentGenome {
    if (Math.random() > this.config.crossoverRate) {
      return { ...parent1, id: this.generateId(), generation: this.generation };
    }

    const genes = Object.keys(parent1.genes) as Array<keyof ActivistAgentGenome['genes']>;
    const newGenes: ActivistAgentGenome['genes'] = {} as any;
    
    genes.forEach(gene => {
      newGenes[gene] = Math.random() < 0.5 ? parent1.genes[gene] : parent2.genes[gene];
    });

    return {
      id: this.generateId(),
      generation: this.generation,
      genes: newGenes,
      fitness: 0,
      age: 0,
      parentIds: [parent1.id, parent2.id],
      performanceHistory: {
        campaignsAssisted: 0,
        successRate: 0,
        activistsSupportedå: 0,
        innovationScore: 0,
      },
    };
  }

  /**
   * Mutate agent genes
   */
  private mutate(agent: ActivistAgentGenome): ActivistAgentGenome {
    const genes = { ...agent.genes };
    const geneKeys = Object.keys(genes) as Array<keyof ActivistAgentGenome['genes']>;
    
    geneKeys.forEach(gene => {
      if (Math.random() < this.config.mutationRate) {
        // Gaussian mutation
        const mutation = (Math.random() - 0.5) * 0.3;
        genes[gene] = Math.max(0, Math.min(1, genes[gene] + mutation));
      }
    });

    return { ...agent, genes };
  }

  /**
   * Calculate genetic diversity
   */
  private calculateGeneticDiversity(): number {
    if (this.population.length < 2) return 0;

    const geneKeys = Object.keys(this.population[0].genes) as Array<keyof ActivistAgentGenome['genes']>;
    let totalVariance = 0;

    geneKeys.forEach(gene => {
      const values = this.population.map(a => a.genes[gene]);
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
      totalVariance += variance;
    });

    return Math.min(1, totalVariance / geneKeys.length);
  }

  /**
   * Get best agent
   */
  getBestAgent(): ActivistAgentGenome | null {
    if (this.population.length === 0) return null;
    
    return this.population.reduce((best, agent) => 
      agent.fitness > best.fitness ? agent : best
    );
  }

  /**
   * Get top N agents
   */
  getTopAgents(n: number = 10): ActivistAgentGenome[] {
    return [...this.population]
      .sort((a, b) => b.fitness - a.fitness)
      .slice(0, n);
  }

  /**
   * Update agent performance
   */
  updateAgentPerformance(
    agentId: string,
    performance: {
      campaignSuccess: boolean;
      innovationLevel: number;
      activistsHelped: number;
    }
  ): void {
    const agent = this.population.find(a => a.id === agentId);
    if (!agent) return;

    agent.performanceHistory.campaignsAssisted++;
    agent.performanceHistory.activistsSupportedå += performance.activistsHelped;
    
    // Update success rate
    const totalCampaigns = agent.performanceHistory.campaignsAssisted;
    const previousSuccesses = agent.performanceHistory.successRate * (totalCampaigns - 1);
    agent.performanceHistory.successRate = 
      (previousSuccesses + (performance.campaignSuccess ? 1 : 0)) / totalCampaigns;
    
    // Update innovation score
    agent.performanceHistory.innovationScore = 
      (agent.performanceHistory.innovationScore * 0.9) + (performance.innovationLevel * 0.1);
  }

  /**
   * Generate agent ID
   */
  private generateId(): string {
    return `activist-agent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get statistics
   */
  getStatistics() {
    if (this.population.length === 0) {
      return {
        generation: 0,
        populationSize: 0,
        averageFitness: 0,
        bestFitness: 0,
        geneticDiversity: 0,
      };
    }

    const averageFitness = this.population.reduce((sum, a) => sum + a.fitness, 0) / this.population.length;
    const bestAgent = this.getBestAgent();

    return {
      generation: this.generation,
      populationSize: this.population.length,
      averageFitness,
      bestFitness: bestAgent?.fitness || 0,
      geneticDiversity: this.calculateGeneticDiversity(),
    };
  }
}

/**
 * Singleton instance
 */
export const evolvingActivistAgents = new EvolvingActivistAgents();
