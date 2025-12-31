// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IBalanceOfPower
 * @notice Interface for balance of power mechanisms inspired by Vitalik's "Balance of Power" essay
 * @dev Implements checks against concentration: Big Business, Big Government, Big Mob
 * 
 * Core Principles:
 * 1. "Power to" vs "Power over" - enable capability without enabling domination
 * 2. Mandatory diffusion - share technology/power on a reasonable schedule
 * 3. Adversarial interoperability - interact without permission
 * 4. Dual governance - multiple stakeholder groups can check each other
 */
interface IBalanceOfPower {
    
    // ============ Events ============
    
    event PowerConcentrationAlert(
        address indexed holder,
        uint256 powerShare,
        uint256 threshold,
        string riskLevel
    );
    
    event DiffusionExecuted(
        address indexed from,
        address[] recipients,
        uint256[] amounts,
        string reason
    );
    
    event VetoInitiated(
        uint256 indexed proposalId,
        address indexed vetoer,
        uint256 vetoVotes,
        uint256 threshold
    );
    
    event DecentralizationScoreUpdated(
        uint256 nakamotoCoefficient,
        uint256 giniCoefficient,
        uint256 topHolderConcentration,
        uint256 overallScore
    );
    
    // ============ Structs ============
    
    struct DecentralizationMetrics {
        uint256 nakamotoCoefficient;     // Min holders to reach 51%
        uint256 giniCoefficient;          // 0-10000 (0=equal, 10000=concentrated)
        uint256 topTenConcentration;      // % held by top 10 holders (basis points)
        uint256 activeVoterPercentage;    // % of holders who voted recently
        uint256 uniqueProposers;          // Unique addresses that created proposals
        uint256 overallScore;             // Composite decentralization score 0-100
        uint256 lastUpdated;
    }
    
    struct PowerHolder {
        address holder;
        uint256 votingPower;
        uint256 shareOfTotal;             // Basis points
        uint256 delegatedFrom;            // Number of delegators
        bool isConcentrationRisk;
    }
    
    struct DiffusionPolicy {
        uint256 maxPowerShare;            // Max % any single holder can have
        uint256 diffusionRate;            // % redistributed per period
        uint256 diffusionPeriod;          // Time between diffusions
        uint256 smallHolderThreshold;     // Below this = eligible for diffusion rewards
        bool isActive;
    }
    
    // ============ Dual Governance ============
    
    /**
     * @notice Initiate a veto against a passed proposal
     * @param proposalId The proposal to veto
     * @param reason Reason for the veto
     */
    function initiateVeto(uint256 proposalId, string calldata reason) external;
    
    /**
     * @notice Vote on an active veto
     * @param proposalId The proposal being vetoed
     * @param support Whether to support the veto
     */
    function voteOnVeto(uint256 proposalId, bool support) external;
    
    /**
     * @notice Execute a successful veto
     * @param proposalId The proposal to block via veto
     */
    function executeVeto(uint256 proposalId) external;
    
    /**
     * @notice Check if a proposal can be vetoed
     * @param proposalId The proposal to check
     */
    function canVeto(uint256 proposalId) external view returns (bool);
    
    /**
     * @notice Get veto status for a proposal
     */
    function getVetoStatus(uint256 proposalId) external view returns (
        bool vetoActive,
        uint256 vetoVotes,
        uint256 threshold,
        uint256 deadline
    );
    
    // ============ Decentralization Metrics ============
    
    /**
     * @notice Calculate and update all decentralization metrics
     */
    function updateDecentralizationMetrics() external;
    
    /**
     * @notice Get current decentralization metrics
     */
    function getDecentralizationMetrics() external view returns (DecentralizationMetrics memory);
    
    /**
     * @notice Get the Nakamoto coefficient (min holders for 51%)
     */
    function getNakamotoCoefficient() external view returns (uint256);
    
    /**
     * @notice Check if power is dangerously concentrated
     */
    function isPowerConcentrated() external view returns (bool concentrated, string memory level);
    
    /**
     * @notice Get top power holders
     * @param count Number of top holders to return
     */
    function getTopPowerHolders(uint256 count) external view returns (PowerHolder[] memory);
    
    // ============ Diffusion Mechanisms ============
    
    /**
     * @notice Set the diffusion policy for automatic power redistribution
     */
    function setDiffusionPolicy(DiffusionPolicy calldata policy) external;
    
    /**
     * @notice Get current diffusion policy
     */
    function getDiffusionPolicy() external view returns (DiffusionPolicy memory);
    
    /**
     * @notice Execute diffusion - redistribute power from large to small holders
     */
    function executeDiffusion() external;
    
    /**
     * @notice Check if an address is eligible for diffusion rewards
     */
    function isEligibleForDiffusion(address holder) external view returns (bool);
    
    /**
     * @notice Get pending diffusion rewards for an address
     */
    function getPendingDiffusion(address holder) external view returns (uint256);
    
    /**
     * @notice Claim diffusion rewards
     */
    function claimDiffusion() external;
    
    // ============ Power Limits ============
    
    /**
     * @notice Check if a transfer would exceed concentration limits
     * @param from Sender address
     * @param to Recipient address  
     * @param amount Amount being transferred
     */
    function wouldExceedPowerLimit(
        address from,
        address to,
        uint256 amount
    ) external view returns (bool exceeds, uint256 limit);
    
    /**
     * @notice Get the maximum power any single holder can have
     */
    function getMaxPowerShare() external view returns (uint256);
    
    /**
     * @notice Set emergency power ceiling (governance only)
     */
    function setEmergencyPowerCeiling(uint256 ceiling) external;
}
