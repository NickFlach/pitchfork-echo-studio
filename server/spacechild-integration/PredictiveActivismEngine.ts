/**
 * Predictive Activism Engine
 * 
 * Brings SpaceChild v1.2 Predictive Forecasting to Pitchfork Protocol
 * for activism campaign outcome prediction and success forecasting.
 * 
 * @version 1.0.0
 */

/**
 * Campaign forecast data point
 */
interface CampaignDataPoint {
  timestamp: Date;
  campaignId: string;
  
  // Activism metrics
  participantCount: number;
  mediaAttention: number;        // 0-10
  publicSupport: number;          // 0-10
  oppositionStrength: number;     // 0-10
  resourcesAvailable: number;     // 0-10
  
  // Consciousness metrics
  consciousnessLevel: number;     // 0-1
  collectiveAlignment: number;    // 0-1
  strategicClarity: number;       // 0-1
}

/**
 * Campaign forecast prediction
 */
interface CampaignForecast {
  timestamp: Date;
  horizonDays: number;
  
  predictedOutcome: {
    successProbability: number;   // 0-1
    impactScore: number;          // 0-10
    riskLevel: number;            // 0-10
  };
  
  trend: 'accelerating' | 'steady' | 'declining' | 'volatile';
  confidence: {
    percentage: number;
    lower: number;
    upper: number;
  };
  
  anomalyScore: number;           // 0-1 (higher = more unusual)
  recommendations: string[];
}

/**
 * Predictive Activism Engine
 * 
 * Uses time-series forecasting to predict activism campaign outcomes,
 * detect anomalies, and provide strategic recommendations.
 */
export class PredictiveActivismEngine {
  private dataPoints: Map<string, CampaignDataPoint[]> = new Map();
  private readonly MAX_DATA_POINTS = 10000;
  private readonly MIN_FORECAST_DATA = 10;
  
  constructor() {}

  /**
   * Record campaign data point
   */
  recordCampaignData(dataPoint: CampaignDataPoint): void {
    const campaignId = dataPoint.campaignId;
    
    if (!this.dataPoints.has(campaignId)) {
      this.dataPoints.set(campaignId, []);
    }
    
    const points = this.dataPoints.get(campaignId)!;
    points.push(dataPoint);
    
    // Keep only recent points
    if (points.length > this.MAX_DATA_POINTS) {
      points.shift();
    }
  }

  /**
   * Generate campaign forecast
   */
  async generateCampaignForecast(
    campaignId: string,
    horizonDays: number = 7
  ): Promise<CampaignForecast> {
    const points = this.dataPoints.get(campaignId) || [];
    
    if (points.length < this.MIN_FORECAST_DATA) {
      return this.generateDefaultForecast(horizonDays);
    }

    // Calculate trends
    const recentPoints = points.slice(-30);
    const trend = this.analyzeTrend(recentPoints);
    
    // Predict success probability using ensemble approach
    const successProbability = this.predictSuccessProbability(recentPoints);
    
    // Calculate impact score
    const impactScore = this.calculateImpactScore(recentPoints);
    
    // Assess risk
    const riskLevel = this.assessRisk(recentPoints);
    
    // Detect anomalies
    const anomalyScore = this.detectAnomalies(recentPoints);
    
    // Calculate confidence intervals
    const confidence = this.calculateConfidence(recentPoints, successProbability);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(
      successProbability,
      trend,
      riskLevel,
      anomalyScore
    );

    return {
      timestamp: new Date(),
      horizonDays,
      predictedOutcome: {
        successProbability,
        impactScore,
        riskLevel,
      },
      trend,
      confidence,
      anomalyScore,
      recommendations,
    };
  }

  /**
   * Analyze campaign trend
   */
  private analyzeTrend(points: CampaignDataPoint[]): CampaignForecast['trend'] {
    if (points.length < 2) return 'steady';

    const recentSupport = points.slice(-5).map(p => p.publicSupport);
    const earlierSupport = points.slice(-10, -5).map(p => p.publicSupport);
    
    const recentAvg = recentSupport.reduce((a, b) => a + b, 0) / recentSupport.length;
    const earlierAvg = earlierSupport.reduce((a, b) => a + b, 0) / earlierSupport.length;
    
    const change = recentAvg - earlierAvg;
    const volatility = this.calculateVolatility(recentSupport);

    if (volatility > 2) return 'volatile';
    if (change > 1) return 'accelerating';
    if (change < -1) return 'declining';
    return 'steady';
  }

  /**
   * Predict success probability
   */
  private predictSuccessProbability(points: CampaignDataPoint[]): number {
    const latest = points[points.length - 1];
    
    // Ensemble prediction combining multiple factors
    const supportFactor = latest.publicSupport / 10;
    const participationFactor = Math.min(latest.participantCount / 1000, 1);
    const consciousnessFactor = latest.consciousnessLevel;
    const alignmentFactor = latest.collectiveAlignment;
    const resourceFactor = latest.resourcesAvailable / 10;
    const oppositionPenalty = latest.oppositionStrength / 10;
    
    const probability = (
      supportFactor * 0.25 +
      participationFactor * 0.20 +
      consciousnessFactor * 0.25 +
      alignmentFactor * 0.15 +
      resourceFactor * 0.15
    ) * (1 - oppositionPenalty * 0.3);
    
    return Math.max(0, Math.min(1, probability));
  }

  /**
   * Calculate impact score
   */
  private calculateImpactScore(points: CampaignDataPoint[]): number {
    const latest = points[points.length - 1];
    
    const impactScore = 
      latest.mediaAttention * 0.4 +
      latest.publicSupport * 0.3 +
      latest.participantCount / 100 * 0.3;
    
    return Math.min(10, impactScore);
  }

  /**
   * Assess campaign risk
   */
  private assessRisk(points: CampaignDataPoint[]): number {
    const latest = points[points.length - 1];
    
    const oppositionRisk = latest.oppositionStrength * 0.4;
    const resourceRisk = (10 - latest.resourcesAvailable) * 0.3;
    const volatilityRisk = this.calculateVolatility(
      points.slice(-5).map(p => p.publicSupport)
    ) * 0.3;
    
    return Math.min(10, oppositionRisk + resourceRisk + volatilityRisk);
  }

  /**
   * Detect anomalies in campaign data
   */
  private detectAnomalies(points: CampaignDataPoint[]): number {
    if (points.length < 3) return 0;

    const latest = points[points.length - 1];
    const recent = points.slice(-10);
    
    // Calculate mean and std dev
    const supportValues = recent.map(p => p.publicSupport);
    const mean = supportValues.reduce((a, b) => a + b, 0) / supportValues.length;
    const variance = supportValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / supportValues.length;
    const stdDev = Math.sqrt(variance);
    
    // 3-sigma rule
    const deviation = Math.abs(latest.publicSupport - mean);
    const sigmas = stdDev > 0 ? deviation / stdDev : 0;
    
    return Math.min(1, sigmas / 3);
  }

  /**
   * Calculate confidence intervals
   */
  private calculateConfidence(
    points: CampaignDataPoint[],
    prediction: number
  ): CampaignForecast['confidence'] {
    const volatility = this.calculateVolatility(
      points.slice(-10).map(p => p.publicSupport)
    );
    
    // Higher volatility = wider confidence interval
    const confidenceWidth = 0.15 + (volatility / 10) * 0.2;
    
    return {
      percentage: Math.max(70, 95 - volatility * 3),
      lower: Math.max(0, prediction - confidenceWidth),
      upper: Math.min(1, prediction + confidenceWidth),
    };
  }

  /**
   * Calculate volatility
   */
  private calculateVolatility(values: number[]): number {
    if (values.length < 2) return 0;
    
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    
    return Math.sqrt(variance);
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    successProbability: number,
    trend: CampaignForecast['trend'],
    riskLevel: number,
    anomalyScore: number
  ): string[] {
    const recommendations: string[] = [];

    // Success probability recommendations
    if (successProbability > 0.8) {
      recommendations.push('High success probability - campaign momentum is strong');
    } else if (successProbability < 0.5) {
      recommendations.push('Low success probability - consider strategy adjustment');
    }

    // Trend recommendations
    if (trend === 'accelerating') {
      recommendations.push('Campaign accelerating - capitalize on momentum');
    } else if (trend === 'declining') {
      recommendations.push('Campaign declining - immediate intervention needed');
    } else if (trend === 'volatile') {
      recommendations.push('High volatility detected - stabilize messaging');
    }

    // Risk recommendations
    if (riskLevel > 7) {
      recommendations.push('High risk level - implement risk mitigation strategies');
    }

    // Anomaly recommendations
    if (anomalyScore > 0.7) {
      recommendations.push('Significant anomaly detected - investigate unusual patterns');
    }

    return recommendations;
  }

  /**
   * Generate default forecast when insufficient data
   */
  private generateDefaultForecast(horizonDays: number): CampaignForecast {
    return {
      timestamp: new Date(),
      horizonDays,
      predictedOutcome: {
        successProbability: 0.5,
        impactScore: 5,
        riskLevel: 5,
      },
      trend: 'steady',
      confidence: {
        percentage: 60,
        lower: 0.3,
        upper: 0.7,
      },
      anomalyScore: 0,
      recommendations: [
        'Insufficient historical data for accurate prediction',
        'Record more campaign metrics to improve forecasting accuracy',
      ],
    };
  }

  /**
   * Get statistics
   */
  getStatistics() {
    const totalDataPoints = Array.from(this.dataPoints.values())
      .reduce((sum, points) => sum + points.length, 0);

    return {
      campaignsTracked: this.dataPoints.size,
      totalDataPoints,
      averageDataPerCampaign: this.dataPoints.size > 0 
        ? Math.round(totalDataPoints / this.dataPoints.size)
        : 0,
    };
  }
}

/**
 * Singleton instance
 */
export const predictiveActivismEngine = new PredictiveActivismEngine();
