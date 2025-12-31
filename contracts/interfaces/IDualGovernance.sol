// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IDualGovernance
 * @notice Interface for dual governance system inspired by Lido
 * @dev Allows token holders to veto DAO decisions, creating balance of power
 * 
 * The dual governance model:
 * 1. DAO proposes and votes on changes
 * 2. Token holders have a veto window after proposals pass
 * 3. If veto threshold is met, proposal is blocked
 * 4. Creates checks and balances between governance body and token holders
 */
interface IDualGovernance {
    
    // ============ Enums ============
    
    enum VetoState {
        NONE,           // No veto initiated
        PENDING,        // Veto initiated, voting in progress
        SUCCEEDED,      // Veto passed, proposal blocked
        FAILED,         // Veto failed, proposal can execute
        EXPIRED         // Veto window expired without action
    }
    
    enum GovernanceMode {
        NORMAL,         // Standard operation
        VETO_SIGNALING, // Veto threshold approaching
        RAGE_QUIT,      // Mass exit in progress
        EMERGENCY       // Emergency pause
    }
    
    // ============ Events ============
    
    event VetoWindowOpened(
        uint256 indexed proposalId,
        uint256 windowStart,
        uint256 windowEnd
    );
    
    event VetoSignaled(
        uint256 indexed proposalId,
        address indexed signaler,
        uint256 amount,
        uint256 totalSignaled
    );
    
    event VetoWithdrawn(
        uint256 indexed proposalId,
        address indexed withdrawer,
        uint256 amount
    );
    
    event VetoExecuted(
        uint256 indexed proposalId,
        uint256 totalVetoVotes,
        uint256 threshold
    );
    
    event VetoFailed(
        uint256 indexed proposalId,
        uint256 totalVetoVotes,
        uint256 threshold
    );
    
    event GovernanceModeChanged(
        GovernanceMode oldMode,
        GovernanceMode newMode,
        string reason
    );
    
    event RageQuitInitiated(
        address indexed user,
        uint256 amount,
        uint256 unlockTime
    );
    
    // ============ Structs ============
    
    struct VetoInfo {
        VetoState state;
        uint256 proposalId;
        uint256 vetoVotesFor;         // Votes supporting the veto
        uint256 vetoVotesAgainst;     // Votes against the veto
        uint256 threshold;             // Votes needed for veto to pass
        uint256 windowStart;
        uint256 windowEnd;
        address initiator;
        string reason;
        mapping(address => uint256) userVetoVotes;
    }
    
    struct DualGovernanceConfig {
        uint256 vetoWindowDuration;    // Duration of veto window in seconds
        uint256 vetoThreshold;         // % of total supply needed (basis points)
        uint256 vetoMinDelay;          // Min time before veto can execute
        uint256 rageQuitDelay;         // Delay for rage quit withdrawals
        uint256 escalationThreshold;   // % that triggers escalation mode
        bool dynamicThreshold;         // Whether threshold adjusts based on turnout
    }
    
    // ============ Core Functions ============
    
    /**
     * @notice Signal veto on a proposal
     * @param proposalId The proposal to veto
     * @param amount Amount of voting power to commit
     */
    function signalVeto(uint256 proposalId, uint256 amount) external;
    
    /**
     * @notice Withdraw veto signal
     * @param proposalId The proposal to withdraw veto from
     */
    function withdrawVetoSignal(uint256 proposalId) external;
    
    /**
     * @notice Finalize veto after window closes
     * @param proposalId The proposal to finalize veto for
     */
    function finalizeVeto(uint256 proposalId) external;
    
    /**
     * @notice Initiate rage quit - exit with proportional share if governance fails
     */
    function initiateRageQuit() external;
    
    /**
     * @notice Complete rage quit after delay
     */
    function completeRageQuit() external;
    
    // ============ View Functions ============
    
    /**
     * @notice Get current governance mode
     */
    function getGovernanceMode() external view returns (GovernanceMode);
    
    /**
     * @notice Get veto info for a proposal
     */
    function getVetoInfo(uint256 proposalId) external view returns (
        VetoState state,
        uint256 vetoVotesFor,
        uint256 vetoVotesAgainst,
        uint256 threshold,
        uint256 windowEnd
    );
    
    /**
     * @notice Get user's veto signal amount
     */
    function getUserVetoSignal(uint256 proposalId, address user) external view returns (uint256);
    
    /**
     * @notice Check if proposal is in veto window
     */
    function isInVetoWindow(uint256 proposalId) external view returns (bool);
    
    /**
     * @notice Check if veto threshold is met
     */
    function isVetoThresholdMet(uint256 proposalId) external view returns (bool);
    
    /**
     * @notice Get dual governance configuration
     */
    function getDualGovernanceConfig() external view returns (DualGovernanceConfig memory);
    
    // ============ Admin Functions ============
    
    /**
     * @notice Update dual governance configuration
     */
    function setDualGovernanceConfig(DualGovernanceConfig calldata config) external;
    
    /**
     * @notice Emergency pause dual governance
     */
    function emergencyPauseDualGovernance() external;
}
