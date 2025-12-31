// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IDecentralizationMetrics
 * @notice Interface for tracking and reporting decentralization health
 * @dev Measures power distribution and alerts on concentration risks
 * 
 * Key metrics based on academic literature and industry standards:
 * - Nakamoto Coefficient: Minimum entities to compromise 51%
 * - Gini Coefficient: Distribution inequality measure
 * - HHI (Herfindahl-Hirschman Index): Market concentration
 * - Active participation rates
 */
interface IDecentralizationMetrics {
    
    // ============ Enums ============
    
    enum HealthStatus {
        HEALTHY,            // Well distributed
        MODERATE_RISK,      // Some concentration
        HIGH_RISK,          // Significant concentration
        CRITICAL            // Dangerous concentration
    }
    
    enum MetricType {
        NAKAMOTO_COEFFICIENT,
        GINI_COEFFICIENT,
        HHI_INDEX,
        TOP_HOLDER_CONCENTRATION,
        ACTIVE_PARTICIPATION,
        PROPOSAL_DIVERSITY,
        VOTER_TURNOUT,
        DELEGATION_DEPTH
    }
    
    // ============ Events ============
    
    event MetricsUpdated(
        uint256 indexed blockNumber,
        uint256 nakamoto,
        uint256 gini,
        uint256 hhi,
        HealthStatus status
    );
    
    event ConcentrationAlert(
        MetricType indexed metricType,
        uint256 currentValue,
        uint256 threshold,
        HealthStatus severity
    );
    
    event HealthStatusChanged(
        HealthStatus oldStatus,
        HealthStatus newStatus,
        string reason
    );
    
    event MetricThresholdUpdated(
        MetricType indexed metricType,
        uint256 oldThreshold,
        uint256 newThreshold
    );
    
    // ============ Structs ============
    
    struct FullMetrics {
        // Core distribution metrics
        uint256 nakamotoCoefficient;
        uint256 giniCoefficient;          // 0-10000 basis points
        uint256 hhiIndex;                  // 0-10000 (10000 = monopoly)
        
        // Holder concentration
        uint256 topOnePercent;             // % held by top 1%
        uint256 topTenPercent;             // % held by top 10%
        uint256 topFiftyPercent;           // % held by top 50%
        
        // Participation metrics
        uint256 uniqueHolders;
        uint256 activeVoters;              // Voted in last period
        uint256 averageTurnout;            // Average voter turnout %
        uint256 uniqueProposers;           // Unique proposal creators
        
        // Delegation metrics
        uint256 delegationRate;            // % of supply delegated
        uint256 avgDelegationChain;        // Average delegation depth
        uint256 maxDelegationConcentration; // Largest delegate %
        
        // Computed scores
        HealthStatus overallHealth;
        uint256 decentralizationScore;     // 0-100 composite score
        uint256 timestamp;
    }
    
    struct MetricThresholds {
        uint256 nakamotoMin;               // Below this = critical
        uint256 giniMax;                   // Above this = unhealthy
        uint256 hhiMax;                    // Above this = concentrated
        uint256 topHolderMax;              // Max % for single holder
        uint256 minActiveVoters;           // Minimum voter participation
        uint256 minUniqueProposers;        // Minimum proposal diversity
    }
    
    struct HistoricalDataPoint {
        uint256 timestamp;
        uint256 nakamoto;
        uint256 gini;
        uint256 decentralizationScore;
        HealthStatus status;
    }
    
    // ============ Core Functions ============
    
    /**
     * @notice Calculate and store current metrics
     * @return metrics The calculated metrics
     */
    function calculateMetrics() external returns (FullMetrics memory metrics);
    
    /**
     * @notice Get current metrics without updating
     */
    function getCurrentMetrics() external view returns (FullMetrics memory);
    
    /**
     * @notice Get specific metric value
     */
    function getMetric(MetricType metricType) external view returns (uint256);
    
    /**
     * @notice Get current health status
     */
    function getHealthStatus() external view returns (HealthStatus);
    
    /**
     * @notice Get decentralization score (0-100)
     */
    function getDecentralizationScore() external view returns (uint256);
    
    // ============ Analysis Functions ============
    
    /**
     * @notice Analyze holder distribution
     * @return percentiles Array of [1%, 10%, 25%, 50%, 75%, 90%, 99%] holdings
     */
    function analyzeDistribution() external view returns (uint256[7] memory percentiles);
    
    /**
     * @notice Get top holders with their stats
     * @param count Number of top holders to return
     */
    function getTopHolders(uint256 count) external view returns (
        address[] memory holders,
        uint256[] memory balances,
        uint256[] memory percentages
    );
    
    /**
     * @notice Identify concentration risks
     */
    function identifyConcentrationRisks() external view returns (
        address[] memory riskHolders,
        uint256[] memory riskLevels,
        string[] memory riskDescriptions
    );
    
    /**
     * @notice Simulate impact of a transfer on decentralization
     */
    function simulateTransferImpact(
        address from,
        address to,
        uint256 amount
    ) external view returns (
        int256 nakamotoChange,
        int256 giniChange,
        int256 scoreChange
    );
    
    // ============ Historical Functions ============
    
    /**
     * @notice Get historical metrics
     * @param fromTimestamp Start timestamp
     * @param toTimestamp End timestamp
     */
    function getHistoricalMetrics(
        uint256 fromTimestamp,
        uint256 toTimestamp
    ) external view returns (HistoricalDataPoint[] memory);
    
    /**
     * @notice Get trend direction for a metric
     * @param metricType The metric to analyze
     * @param periods Number of periods to analyze
     * @return trend Positive = improving, negative = worsening
     */
    function getMetricTrend(MetricType metricType, uint256 periods) external view returns (int256 trend);
    
    // ============ Threshold Management ============
    
    /**
     * @notice Get current thresholds
     */
    function getThresholds() external view returns (MetricThresholds memory);
    
    /**
     * @notice Set metric thresholds (governance only)
     */
    function setThresholds(MetricThresholds calldata thresholds) external;
    
    /**
     * @notice Check if a metric exceeds its threshold
     */
    function isMetricCritical(MetricType metricType) external view returns (bool);
}
