// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/governance/utils/IVotes.sol";
import "./interfaces/IDecentralizationMetrics.sol";

/**
 * @title DecentralizationMetrics
 * @notice Tracks and reports on governance decentralization health
 * @dev Implements metrics from Vitalik's "Balance of Power" essay
 * 
 * Key insight: "economies of scale are going up, and while diffusion of ideas 
 * is probably higher than before due to internet communication, diffusion of 
 * control is lower than before"
 * 
 * This contract monitors for dangerous concentration and provides data
 * for diffusion mechanisms to counteract it.
 */
contract DecentralizationMetrics is IDecentralizationMetrics, AccessControl {
    
    bytes32 public constant METRICS_UPDATER_ROLE = keccak256("METRICS_UPDATER_ROLE");
    
    IVotes public immutable votingToken;
    
    FullMetrics public currentMetrics;
    MetricThresholds public thresholds;
    
    // Historical data storage
    HistoricalDataPoint[] public history;
    uint256 public constant MAX_HISTORY = 365; // Keep 1 year of daily data
    
    // Holder tracking for metrics calculation
    address[] public knownHolders;
    mapping(address => bool) public isKnownHolder;
    mapping(address => uint256) public lastActiveBlock;
    
    uint256 public constant BASIS_POINTS = 10000;
    
    constructor(address _votingToken, address _admin) {
        votingToken = IVotes(_votingToken);
        
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(METRICS_UPDATER_ROLE, _admin);
        
        // Initialize thresholds with sensible defaults
        thresholds = MetricThresholds({
            nakamotoMin: 5,              // At least 5 entities for 51%
            giniMax: 8000,               // Gini coefficient max 0.80
            hhiMax: 2500,                // HHI max 2500 (DOJ threshold)
            topHolderMax: 2000,          // No single holder > 20%
            minActiveVoters: 100,        // At least 100 active voters
            minUniqueProposers: 10       // At least 10 unique proposers
        });
    }
    
    // ============ Core Functions ============
    
    /**
     * @notice Register a holder for tracking (call on transfers)
     */
    function registerHolder(address holder) external {
        if (!isKnownHolder[holder] && holder != address(0)) {
            knownHolders.push(holder);
            isKnownHolder[holder] = true;
        }
    }
    
    /**
     * @notice Calculate and store current metrics
     */
    function calculateMetrics() external override onlyRole(METRICS_UPDATER_ROLE) returns (FullMetrics memory metrics) {
        metrics = _calculateFullMetrics();
        currentMetrics = metrics;
        
        // Store historical data point
        _storeHistoricalPoint(metrics);
        
        emit MetricsUpdated(
            block.number,
            metrics.nakamotoCoefficient,
            metrics.giniCoefficient,
            metrics.hhiIndex,
            metrics.overallHealth
        );
        
        // Check for concentration alerts
        _checkConcentrationAlerts(metrics);
        
        return metrics;
    }
    
    /**
     * @notice Get current metrics without updating
     */
    function getCurrentMetrics() external view override returns (FullMetrics memory) {
        return currentMetrics;
    }
    
    /**
     * @notice Get specific metric value
     */
    function getMetric(MetricType metricType) external view override returns (uint256) {
        if (metricType == MetricType.NAKAMOTO_COEFFICIENT) return currentMetrics.nakamotoCoefficient;
        if (metricType == MetricType.GINI_COEFFICIENT) return currentMetrics.giniCoefficient;
        if (metricType == MetricType.HHI_INDEX) return currentMetrics.hhiIndex;
        if (metricType == MetricType.TOP_HOLDER_CONCENTRATION) return currentMetrics.topOnePercent;
        if (metricType == MetricType.ACTIVE_PARTICIPATION) return currentMetrics.activeVoters;
        if (metricType == MetricType.PROPOSAL_DIVERSITY) return currentMetrics.uniqueProposers;
        if (metricType == MetricType.VOTER_TURNOUT) return currentMetrics.averageTurnout;
        if (metricType == MetricType.DELEGATION_DEPTH) return currentMetrics.avgDelegationChain;
        return 0;
    }
    
    /**
     * @notice Get current health status
     */
    function getHealthStatus() external view override returns (HealthStatus) {
        return currentMetrics.overallHealth;
    }
    
    /**
     * @notice Get decentralization score (0-100)
     */
    function getDecentralizationScore() external view override returns (uint256) {
        return currentMetrics.decentralizationScore;
    }
    
    // ============ Analysis Functions ============
    
    /**
     * @notice Analyze holder distribution
     */
    function analyzeDistribution() external view override returns (uint256[7] memory percentiles) {
        // Returns [1%, 10%, 25%, 50%, 75%, 90%, 99%] holdings thresholds
        // This is a simplified implementation - full version would use sorted arrays
        
        uint256 totalSupply = votingToken.getPastTotalSupply(block.number - 1);
        
        // Simplified percentile calculation
        percentiles[0] = totalSupply / 100;      // 1%
        percentiles[1] = totalSupply / 10;       // 10%
        percentiles[2] = totalSupply / 4;        // 25%
        percentiles[3] = totalSupply / 2;        // 50%
        percentiles[4] = (totalSupply * 75) / 100; // 75%
        percentiles[5] = (totalSupply * 90) / 100; // 90%
        percentiles[6] = (totalSupply * 99) / 100; // 99%
        
        return percentiles;
    }
    
    /**
     * @notice Get top holders with their stats
     */
    function getTopHolders(uint256 count) external view override returns (
        address[] memory holders,
        uint256[] memory balances,
        uint256[] memory percentages
    ) {
        uint256 totalSupply = votingToken.getPastTotalSupply(block.number - 1);
        uint256 holderCount = knownHolders.length;
        uint256 resultCount = count > holderCount ? holderCount : count;
        
        holders = new address[](resultCount);
        balances = new uint256[](resultCount);
        percentages = new uint256[](resultCount);
        
        // Get all balances and sort (simplified - in production use more efficient sorting)
        address[] memory allHolders = new address[](holderCount);
        uint256[] memory allBalances = new uint256[](holderCount);
        
        for (uint256 i = 0; i < holderCount; i++) {
            allHolders[i] = knownHolders[i];
            allBalances[i] = votingToken.getVotes(knownHolders[i]);
        }
        
        // Simple selection sort for top N
        for (uint256 i = 0; i < resultCount; i++) {
            uint256 maxIdx = i;
            for (uint256 j = i + 1; j < holderCount; j++) {
                if (allBalances[j] > allBalances[maxIdx]) {
                    maxIdx = j;
                }
            }
            
            // Swap
            (allHolders[i], allHolders[maxIdx]) = (allHolders[maxIdx], allHolders[i]);
            (allBalances[i], allBalances[maxIdx]) = (allBalances[maxIdx], allBalances[i]);
            
            holders[i] = allHolders[i];
            balances[i] = allBalances[i];
            percentages[i] = totalSupply > 0 ? (allBalances[i] * BASIS_POINTS) / totalSupply : 0;
        }
        
        return (holders, balances, percentages);
    }
    
    /**
     * @notice Identify concentration risks
     */
    function identifyConcentrationRisks() external view override returns (
        address[] memory riskHolders,
        uint256[] memory riskLevels,
        string[] memory riskDescriptions
    ) {
        uint256 totalSupply = votingToken.getPastTotalSupply(block.number - 1);
        
        // Count risky holders
        uint256 riskCount = 0;
        for (uint256 i = 0; i < knownHolders.length; i++) {
            uint256 balance = votingToken.getVotes(knownHolders[i]);
            uint256 percentage = (balance * BASIS_POINTS) / totalSupply;
            if (percentage >= thresholds.topHolderMax / 2) { // > 10%
                riskCount++;
            }
        }
        
        riskHolders = new address[](riskCount);
        riskLevels = new uint256[](riskCount);
        riskDescriptions = new string[](riskCount);
        
        uint256 idx = 0;
        for (uint256 i = 0; i < knownHolders.length && idx < riskCount; i++) {
            uint256 balance = votingToken.getVotes(knownHolders[i]);
            uint256 percentage = (balance * BASIS_POINTS) / totalSupply;
            
            if (percentage >= thresholds.topHolderMax / 2) {
                riskHolders[idx] = knownHolders[i];
                riskLevels[idx] = percentage;
                
                if (percentage >= thresholds.topHolderMax) {
                    riskDescriptions[idx] = "CRITICAL: Exceeds maximum holder threshold";
                } else if (percentage >= thresholds.topHolderMax * 75 / 100) {
                    riskDescriptions[idx] = "HIGH: Approaching maximum holder threshold";
                } else {
                    riskDescriptions[idx] = "MODERATE: Significant concentration";
                }
                idx++;
            }
        }
        
        return (riskHolders, riskLevels, riskDescriptions);
    }
    
    /**
     * @notice Simulate impact of a transfer on decentralization
     */
    function simulateTransferImpact(
        address from,
        address to,
        uint256 amount
    ) external view override returns (
        int256 nakamotoChange,
        int256 giniChange,
        int256 scoreChange
    ) {
        uint256 totalSupply = votingToken.getPastTotalSupply(block.number - 1);
        
        uint256 fromBalanceBefore = votingToken.getVotes(from);
        uint256 toBalanceBefore = votingToken.getVotes(to);
        
        uint256 fromBalanceAfter = fromBalanceBefore > amount ? fromBalanceBefore - amount : 0;
        uint256 toBalanceAfter = toBalanceBefore + amount;
        
        // Simplified impact calculation
        uint256 fromPercentBefore = (fromBalanceBefore * BASIS_POINTS) / totalSupply;
        uint256 toPercentBefore = (toBalanceBefore * BASIS_POINTS) / totalSupply;
        uint256 fromPercentAfter = (fromBalanceAfter * BASIS_POINTS) / totalSupply;
        uint256 toPercentAfter = (toBalanceAfter * BASIS_POINTS) / totalSupply;
        
        // If transfer reduces concentration of top holder, positive impact
        if (fromPercentBefore > thresholds.topHolderMax && fromPercentAfter < thresholds.topHolderMax) {
            nakamotoChange = 1;
            giniChange = -100; // Improvement
            scoreChange = 5;
        } else if (toPercentAfter > thresholds.topHolderMax && toPercentBefore < thresholds.topHolderMax) {
            nakamotoChange = -1;
            giniChange = 100; // Worsening
            scoreChange = -5;
        } else {
            nakamotoChange = 0;
            giniChange = int256(toPercentAfter) - int256(fromPercentAfter);
            scoreChange = 0;
        }
        
        return (nakamotoChange, giniChange, scoreChange);
    }
    
    // ============ Historical Functions ============
    
    function getHistoricalMetrics(
        uint256 fromTimestamp,
        uint256 toTimestamp
    ) external view override returns (HistoricalDataPoint[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < history.length; i++) {
            if (history[i].timestamp >= fromTimestamp && history[i].timestamp <= toTimestamp) {
                count++;
            }
        }
        
        HistoricalDataPoint[] memory result = new HistoricalDataPoint[](count);
        uint256 idx = 0;
        for (uint256 i = 0; i < history.length; i++) {
            if (history[i].timestamp >= fromTimestamp && history[i].timestamp <= toTimestamp) {
                result[idx] = history[i];
                idx++;
            }
        }
        
        return result;
    }
    
    function getMetricTrend(MetricType metricType, uint256 periods) external view override returns (int256 trend) {
        if (history.length < 2 || periods < 2) return 0;
        
        uint256 lookback = periods > history.length ? history.length : periods;
        
        uint256 oldValue;
        uint256 newValue;
        
        if (metricType == MetricType.NAKAMOTO_COEFFICIENT) {
            oldValue = history[history.length - lookback].nakamoto;
            newValue = history[history.length - 1].nakamoto;
        } else if (metricType == MetricType.GINI_COEFFICIENT) {
            oldValue = history[history.length - lookback].gini;
            newValue = history[history.length - 1].gini;
        } else {
            oldValue = history[history.length - lookback].decentralizationScore;
            newValue = history[history.length - 1].decentralizationScore;
        }
        
        return int256(newValue) - int256(oldValue);
    }
    
    // ============ Threshold Management ============
    
    function getThresholds() external view override returns (MetricThresholds memory) {
        return thresholds;
    }
    
    function setThresholds(MetricThresholds calldata _thresholds) external override onlyRole(DEFAULT_ADMIN_ROLE) {
        thresholds = _thresholds;
    }
    
    function isMetricCritical(MetricType metricType) external view override returns (bool) {
        if (metricType == MetricType.NAKAMOTO_COEFFICIENT) {
            return currentMetrics.nakamotoCoefficient < thresholds.nakamotoMin;
        }
        if (metricType == MetricType.GINI_COEFFICIENT) {
            return currentMetrics.giniCoefficient > thresholds.giniMax;
        }
        if (metricType == MetricType.HHI_INDEX) {
            return currentMetrics.hhiIndex > thresholds.hhiMax;
        }
        if (metricType == MetricType.TOP_HOLDER_CONCENTRATION) {
            return currentMetrics.topOnePercent > thresholds.topHolderMax;
        }
        return false;
    }
    
    // ============ Internal Functions ============
    
    function _calculateFullMetrics() internal view returns (FullMetrics memory metrics) {
        uint256 totalSupply = votingToken.getPastTotalSupply(block.number - 1);
        if (totalSupply == 0) return metrics;
        
        // Calculate Nakamoto coefficient and concentration
        (uint256 nakamoto, uint256 topTen, uint256 hhi) = _calculateConcentration(totalSupply);
        
        metrics.nakamotoCoefficient = nakamoto;
        metrics.topTenPercent = topTen;
        metrics.hhiIndex = hhi;
        
        // Simplified Gini calculation
        metrics.giniCoefficient = _estimateGini(totalSupply);
        
        // Count unique holders
        uint256 activeCount = 0;
        for (uint256 i = 0; i < knownHolders.length; i++) {
            if (votingToken.getVotes(knownHolders[i]) > 0) {
                activeCount++;
            }
        }
        metrics.uniqueHolders = activeCount;
        
        // Calculate overall health
        metrics.overallHealth = _calculateHealthStatus(metrics);
        metrics.decentralizationScore = _calculateDecentralizationScore(metrics);
        metrics.timestamp = block.timestamp;
        
        return metrics;
    }
    
    function _calculateConcentration(uint256 totalSupply) internal view returns (
        uint256 nakamoto,
        uint256 topTen,
        uint256 hhi
    ) {
        // Get sorted balances
        uint256[] memory balances = new uint256[](knownHolders.length);
        for (uint256 i = 0; i < knownHolders.length; i++) {
            balances[i] = votingToken.getVotes(knownHolders[i]);
        }
        
        // Sort descending (simplified bubble sort - use quicksort in production)
        for (uint256 i = 0; i < balances.length; i++) {
            for (uint256 j = i + 1; j < balances.length; j++) {
                if (balances[j] > balances[i]) {
                    (balances[i], balances[j]) = (balances[j], balances[i]);
                }
            }
        }
        
        // Calculate Nakamoto coefficient (min holders for 51%)
        uint256 cumulative = 0;
        uint256 threshold = totalSupply / 2;
        nakamoto = 0;
        for (uint256 i = 0; i < balances.length; i++) {
            cumulative += balances[i];
            nakamoto++;
            if (cumulative >= threshold) break;
        }
        
        // Calculate top 10 concentration
        uint256 topTenSum = 0;
        uint256 topCount = balances.length > 10 ? 10 : balances.length;
        for (uint256 i = 0; i < topCount; i++) {
            topTenSum += balances[i];
        }
        topTen = (topTenSum * BASIS_POINTS) / totalSupply;
        
        // Calculate HHI (sum of squared market shares)
        hhi = 0;
        for (uint256 i = 0; i < balances.length; i++) {
            uint256 share = (balances[i] * 100) / totalSupply; // Percentage
            hhi += share * share;
        }
        
        return (nakamoto, topTen, hhi);
    }
    
    function _estimateGini(uint256 totalSupply) internal view returns (uint256) {
        // Simplified Gini estimation based on top holder concentration
        // Real Gini requires sorting all values which is expensive on-chain
        
        if (knownHolders.length == 0) return 0;
        
        uint256 topHolderBalance = 0;
        for (uint256 i = 0; i < knownHolders.length; i++) {
            uint256 balance = votingToken.getVotes(knownHolders[i]);
            if (balance > topHolderBalance) {
                topHolderBalance = balance;
            }
        }
        
        // Estimate: if top holder has X%, Gini ≈ X%
        return (topHolderBalance * BASIS_POINTS) / totalSupply;
    }
    
    function _calculateHealthStatus(FullMetrics memory metrics) internal view returns (HealthStatus) {
        uint256 criticalCount = 0;
        uint256 warningCount = 0;
        
        if (metrics.nakamotoCoefficient < thresholds.nakamotoMin) criticalCount++;
        else if (metrics.nakamotoCoefficient < thresholds.nakamotoMin * 2) warningCount++;
        
        if (metrics.giniCoefficient > thresholds.giniMax) criticalCount++;
        else if (metrics.giniCoefficient > thresholds.giniMax * 80 / 100) warningCount++;
        
        if (metrics.hhiIndex > thresholds.hhiMax) criticalCount++;
        else if (metrics.hhiIndex > thresholds.hhiMax * 80 / 100) warningCount++;
        
        if (criticalCount >= 2) return HealthStatus.CRITICAL;
        if (criticalCount >= 1) return HealthStatus.HIGH_RISK;
        if (warningCount >= 2) return HealthStatus.MODERATE_RISK;
        return HealthStatus.HEALTHY;
    }
    
    function _calculateDecentralizationScore(FullMetrics memory metrics) internal view returns (uint256) {
        uint256 score = 100;
        
        // Nakamoto score (0-25 points)
        if (metrics.nakamotoCoefficient >= thresholds.nakamotoMin * 4) {
            score = score; // Full points
        } else {
            score -= 25 - (metrics.nakamotoCoefficient * 25 / (thresholds.nakamotoMin * 4));
        }
        
        // Gini score (0-25 points)
        if (metrics.giniCoefficient <= thresholds.giniMax / 2) {
            score = score; // Full points
        } else {
            uint256 penalty = ((metrics.giniCoefficient - thresholds.giniMax / 2) * 25) / (thresholds.giniMax / 2);
            score = score > penalty ? score - penalty : 0;
        }
        
        // HHI score (0-25 points)
        if (metrics.hhiIndex <= thresholds.hhiMax / 2) {
            score = score; // Full points
        } else {
            uint256 penalty = ((metrics.hhiIndex - thresholds.hhiMax / 2) * 25) / (thresholds.hhiMax / 2);
            score = score > penalty ? score - penalty : 0;
        }
        
        // Holder diversity (0-25 points)
        if (metrics.uniqueHolders >= 1000) {
            score = score; // Full points
        } else {
            score -= 25 - (metrics.uniqueHolders * 25 / 1000);
        }
        
        return score > 100 ? 100 : score;
    }
    
    function _storeHistoricalPoint(FullMetrics memory metrics) internal {
        if (history.length >= MAX_HISTORY) {
            // Remove oldest entry (shift array)
            for (uint256 i = 0; i < history.length - 1; i++) {
                history[i] = history[i + 1];
            }
            history.pop();
        }
        
        history.push(HistoricalDataPoint({
            timestamp: metrics.timestamp,
            nakamoto: metrics.nakamotoCoefficient,
            gini: metrics.giniCoefficient,
            decentralizationScore: metrics.decentralizationScore,
            status: metrics.overallHealth
        }));
    }
    
    function _checkConcentrationAlerts(FullMetrics memory metrics) internal {
        if (metrics.nakamotoCoefficient < thresholds.nakamotoMin) {
            emit ConcentrationAlert(
                MetricType.NAKAMOTO_COEFFICIENT,
                metrics.nakamotoCoefficient,
                thresholds.nakamotoMin,
                HealthStatus.CRITICAL
            );
        }
        
        if (metrics.giniCoefficient > thresholds.giniMax) {
            emit ConcentrationAlert(
                MetricType.GINI_COEFFICIENT,
                metrics.giniCoefficient,
                thresholds.giniMax,
                HealthStatus.HIGH_RISK
            );
        }
        
        if (metrics.hhiIndex > thresholds.hhiMax) {
            emit ConcentrationAlert(
                MetricType.HHI_INDEX,
                metrics.hhiIndex,
                thresholds.hhiMax,
                HealthStatus.HIGH_RISK
            );
        }
    }
}
