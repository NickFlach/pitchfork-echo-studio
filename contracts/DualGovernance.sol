// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/governance/utils/IVotes.sol";
import "./interfaces/IDualGovernance.sol";

/**
 * @title DualGovernance
 * @notice Implements Lido-style dual governance with veto rights for token holders
 * @dev Creates balance of power between DAO governance and direct token holder rights
 * 
 * Key principles from Vitalik's "Balance of Power":
 * - Government should act like a game, not a player
 * - Separation of powers as checks and balances
 * - "Power to" without "power over"
 */
contract DualGovernance is IDualGovernance, AccessControl, ReentrancyGuard, Pausable {
    
    bytes32 public constant GOVERNANCE_ROLE = keccak256("GOVERNANCE_ROLE");
    bytes32 public constant GUARDIAN_ROLE = keccak256("GUARDIAN_ROLE");
    
    IVotes public immutable votingToken;
    address public immutable governor;
    
    GovernanceMode public currentMode;
    DualGovernanceConfig public config;
    
    mapping(uint256 => VetoInfo) internal vetoInfos;
    mapping(address => RageQuitRequest) public rageQuitRequests;
    
    struct RageQuitRequest {
        uint256 amount;
        uint256 requestTime;
        uint256 unlockTime;
        bool completed;
    }
    
    uint256 public totalRageQuitPending;
    uint256 public constant BASIS_POINTS = 10000;
    
    constructor(
        address _votingToken,
        address _governor,
        address _admin
    ) {
        require(_votingToken != address(0), "Invalid voting token");
        require(_governor != address(0), "Invalid governor");
        
        votingToken = IVotes(_votingToken);
        governor = _governor;
        
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(GOVERNANCE_ROLE, _governor);
        _grantRole(GUARDIAN_ROLE, _admin);
        
        currentMode = GovernanceMode.NORMAL;
        
        // Default configuration
        config = DualGovernanceConfig({
            vetoWindowDuration: 7 days,
            vetoThreshold: 1000,           // 10% of supply
            vetoMinDelay: 1 days,
            rageQuitDelay: 30 days,
            escalationThreshold: 500,      // 5% triggers escalation
            dynamicThreshold: true
        });
    }
    
    // ============ Core Veto Functions ============
    
    /**
     * @notice Open veto window for a proposal (called by governor after proposal passes)
     */
    function openVetoWindow(uint256 proposalId) external onlyRole(GOVERNANCE_ROLE) {
        require(vetoInfos[proposalId].state == VetoState.NONE, "Veto already exists");
        
        VetoInfo storage veto = vetoInfos[proposalId];
        veto.state = VetoState.PENDING;
        veto.proposalId = proposalId;
        veto.threshold = _calculateVetoThreshold();
        veto.windowStart = block.timestamp;
        veto.windowEnd = block.timestamp + config.vetoWindowDuration;
        
        emit VetoWindowOpened(proposalId, veto.windowStart, veto.windowEnd);
    }
    
    /**
     * @notice Signal veto on a proposal
     */
    function signalVeto(uint256 proposalId, uint256 amount) external override nonReentrant whenNotPaused {
        VetoInfo storage veto = vetoInfos[proposalId];
        require(veto.state == VetoState.PENDING, "Veto not pending");
        require(block.timestamp <= veto.windowEnd, "Veto window closed");
        require(amount > 0, "Amount must be positive");
        
        uint256 votingPower = votingToken.getVotes(msg.sender);
        require(votingPower >= amount, "Insufficient voting power");
        
        veto.userVetoVotes[msg.sender] += amount;
        veto.vetoVotesFor += amount;
        
        emit VetoSignaled(proposalId, msg.sender, amount, veto.vetoVotesFor);
        
        // Check for escalation
        _checkEscalation(proposalId);
    }
    
    /**
     * @notice Withdraw veto signal
     */
    function withdrawVetoSignal(uint256 proposalId) external override nonReentrant {
        VetoInfo storage veto = vetoInfos[proposalId];
        require(veto.state == VetoState.PENDING, "Veto not pending");
        require(block.timestamp <= veto.windowEnd, "Veto window closed");
        
        uint256 userVotes = veto.userVetoVotes[msg.sender];
        require(userVotes > 0, "No veto signal to withdraw");
        
        veto.userVetoVotes[msg.sender] = 0;
        veto.vetoVotesFor -= userVotes;
        
        emit VetoWithdrawn(proposalId, msg.sender, userVotes);
    }
    
    /**
     * @notice Finalize veto after window closes
     */
    function finalizeVeto(uint256 proposalId) external override nonReentrant {
        VetoInfo storage veto = vetoInfos[proposalId];
        require(veto.state == VetoState.PENDING, "Veto not pending");
        require(block.timestamp > veto.windowEnd, "Veto window still open");
        
        if (veto.vetoVotesFor >= veto.threshold) {
            veto.state = VetoState.SUCCEEDED;
            emit VetoExecuted(proposalId, veto.vetoVotesFor, veto.threshold);
        } else {
            veto.state = VetoState.FAILED;
            emit VetoFailed(proposalId, veto.vetoVotesFor, veto.threshold);
        }
    }
    
    // ============ Rage Quit ============
    
    /**
     * @notice Initiate rage quit - exit with proportional share if governance fails
     */
    function initiateRageQuit() external override nonReentrant whenNotPaused {
        require(rageQuitRequests[msg.sender].amount == 0, "Rage quit already pending");
        
        uint256 userBalance = votingToken.getVotes(msg.sender);
        require(userBalance > 0, "No voting power to rage quit");
        
        rageQuitRequests[msg.sender] = RageQuitRequest({
            amount: userBalance,
            requestTime: block.timestamp,
            unlockTime: block.timestamp + config.rageQuitDelay,
            completed: false
        });
        
        totalRageQuitPending += userBalance;
        
        emit RageQuitInitiated(msg.sender, userBalance, block.timestamp + config.rageQuitDelay);
        
        // Check if rage quit volume triggers emergency mode
        _checkRageQuitEscalation();
    }
    
    /**
     * @notice Complete rage quit after delay
     */
    function completeRageQuit() external override nonReentrant {
        RageQuitRequest storage request = rageQuitRequests[msg.sender];
        require(request.amount > 0, "No rage quit pending");
        require(!request.completed, "Already completed");
        require(block.timestamp >= request.unlockTime, "Rage quit delay not met");
        
        request.completed = true;
        totalRageQuitPending -= request.amount;
        
        // Note: Actual token redemption would be handled by integration with gPFORK
        // This contract tracks the governance state
    }
    
    // ============ View Functions ============
    
    function getGovernanceMode() external view override returns (GovernanceMode) {
        return currentMode;
    }
    
    function getVetoInfo(uint256 proposalId) external view override returns (
        VetoState state,
        uint256 vetoVotesFor,
        uint256 vetoVotesAgainst,
        uint256 threshold,
        uint256 windowEnd
    ) {
        VetoInfo storage veto = vetoInfos[proposalId];
        return (
            veto.state,
            veto.vetoVotesFor,
            veto.vetoVotesAgainst,
            veto.threshold,
            veto.windowEnd
        );
    }
    
    function getUserVetoSignal(uint256 proposalId, address user) external view override returns (uint256) {
        return vetoInfos[proposalId].userVetoVotes[user];
    }
    
    function isInVetoWindow(uint256 proposalId) external view override returns (bool) {
        VetoInfo storage veto = vetoInfos[proposalId];
        return veto.state == VetoState.PENDING && 
               block.timestamp >= veto.windowStart && 
               block.timestamp <= veto.windowEnd;
    }
    
    function isVetoThresholdMet(uint256 proposalId) external view override returns (bool) {
        VetoInfo storage veto = vetoInfos[proposalId];
        return veto.vetoVotesFor >= veto.threshold;
    }
    
    function getDualGovernanceConfig() external view override returns (DualGovernanceConfig memory) {
        return config;
    }
    
    // ============ Internal Functions ============
    
    function _calculateVetoThreshold() internal view returns (uint256) {
        uint256 totalSupply = votingToken.getPastTotalSupply(block.number - 1);
        
        if (config.dynamicThreshold) {
            // Dynamic threshold based on participation
            // Higher participation = higher threshold needed
            uint256 baseThreshold = (totalSupply * config.vetoThreshold) / BASIS_POINTS;
            return baseThreshold;
        }
        
        return (totalSupply * config.vetoThreshold) / BASIS_POINTS;
    }
    
    function _checkEscalation(uint256 proposalId) internal {
        VetoInfo storage veto = vetoInfos[proposalId];
        uint256 totalSupply = votingToken.getPastTotalSupply(block.number - 1);
        uint256 escalationAmount = (totalSupply * config.escalationThreshold) / BASIS_POINTS;
        
        if (veto.vetoVotesFor >= escalationAmount && currentMode == GovernanceMode.NORMAL) {
            GovernanceMode oldMode = currentMode;
            currentMode = GovernanceMode.VETO_SIGNALING;
            emit GovernanceModeChanged(oldMode, currentMode, "Veto escalation threshold reached");
        }
    }
    
    function _checkRageQuitEscalation() internal {
        uint256 totalSupply = votingToken.getPastTotalSupply(block.number - 1);
        
        // If > 20% of supply is rage quitting, enter emergency mode
        if (totalRageQuitPending > (totalSupply * 2000) / BASIS_POINTS) {
            GovernanceMode oldMode = currentMode;
            currentMode = GovernanceMode.RAGE_QUIT;
            emit GovernanceModeChanged(oldMode, currentMode, "Mass rage quit in progress");
        }
    }
    
    // ============ Admin Functions ============
    
    function setDualGovernanceConfig(DualGovernanceConfig calldata _config) external override onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_config.vetoWindowDuration >= 1 days, "Veto window too short");
        require(_config.vetoThreshold <= 5000, "Veto threshold too high"); // Max 50%
        require(_config.rageQuitDelay >= 7 days, "Rage quit delay too short");
        
        config = _config;
    }
    
    function emergencyPauseDualGovernance() external override onlyRole(GUARDIAN_ROLE) {
        GovernanceMode oldMode = currentMode;
        currentMode = GovernanceMode.EMERGENCY;
        _pause();
        emit GovernanceModeChanged(oldMode, GovernanceMode.EMERGENCY, "Emergency pause activated");
    }
    
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
        currentMode = GovernanceMode.NORMAL;
    }
}
