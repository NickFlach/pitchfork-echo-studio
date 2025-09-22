// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IConsciousnessDAO
 * @notice Interface for the Consciousness DAO contract
 */
interface IConsciousnessDAO {
    enum ProposalCategory {
        PLATFORM_DEVELOPMENT,
        CONSCIOUSNESS_RESEARCH,
        AI_MODEL_SELECTION,
        TREASURY_ALLOCATION,
        GOVERNANCE_PARAMETER,
        COMMUNITY_INITIATIVE,
        PARTNERSHIP_PROPOSAL,
        EMERGENCY_ACTION
    }
    
    enum ProposalStatus {
        DRAFT,
        ACTIVE,
        SUCCEEDED,
        DEFEATED,
        EXECUTED,
        EXPIRED,
        CANCELLED
    }
    
    enum VoteType {
        FOR,
        AGAINST,
        ABSTAIN
    }
    
    // Events
    event ProposalCreated(uint256 indexed proposalId, address indexed proposer, ProposalCategory category, string title);
    event VoteCast(uint256 indexed proposalId, address indexed voter, VoteType voteType, uint256 votingPower, string reason);
    event ProposalExecuted(uint256 indexed proposalId, address indexed executor);
    event ProposalCancelled(uint256 indexed proposalId, address indexed canceller);
    event TreasuryDeposit(address indexed token, uint256 amount, address indexed depositor);
    event TreasuryWithdrawal(address indexed token, uint256 amount, address indexed recipient, uint256 proposalId);
    event GovernanceParametersUpdated(ProposalCategory category, uint256 quorum, uint256 threshold);
    event DelegateChanged(address indexed delegator, address indexed fromDelegate, address indexed toDelegate);
    event EmergencyActionExecuted(address indexed guardian, string action);
    
    // Core functions
    function createProposal(
        ProposalCategory category,
        string memory title,
        string memory description,
        string memory executionDetails,
        address[] memory requestedTokens,
        uint256[] memory requestedAmounts,
        address[] memory recipients
    ) external returns (uint256 proposalId);
    
    function castVote(uint256 proposalId, VoteType voteType, string memory reason) external;
    function executeProposal(uint256 proposalId) external;
    function cancelProposal(uint256 proposalId) external;
    function delegate(address delegatee) external;
    function depositToTreasury(address token, uint256 amount) external payable;
    
    // View functions
    function getProposal(uint256 proposalId) external view returns (
        address proposer,
        ProposalCategory category,
        string memory title,
        string memory description,
        uint256 startTime,
        uint256 endTime,
        uint256 forVotes,
        uint256 againstVotes,
        uint256 abstainVotes,
        ProposalStatus status,
        bool isExecuted
    );
    
    function getVote(uint256 proposalId, address voter) external view returns (VoteType, uint256, uint256, string memory);
    function getVotingPower(address account) external view returns (uint256);
    function hasProposalPassed(uint256 proposalId) external view returns (bool passed, bool reachedQuorum);
    
    // Admin functions
    function updateGovernanceParameters(ProposalCategory category, uint256 newQuorum, uint256 newThreshold, uint256 newVotingPeriod) external;
    function emergencyPause(string memory reason) external;
    function emergencyUnpause() external;
}