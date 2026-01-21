// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IZKPrivateVoting
 * @notice Interface for ZK private voting system
 * @dev Implements commit-reveal voting aligned with Vitalik's DAO vision
 */
interface IZKPrivateVoting {
    
    enum VoteChoice {
        NONE,
        FOR,
        AGAINST,
        ABSTAIN
    }
    
    enum VotingPhase {
        NOT_STARTED,
        COMMIT,
        REVEAL,
        FINALIZED
    }
    
    struct ZKVoteProof {
        bytes32 nullifier;
        bytes32 commitment;
        bytes proof;
        uint256 votingPowerRoot;
    }
    
    struct VotingConfig {
        uint256 commitDuration;
        uint256 revealDuration;
        uint256 minParticipation;
        uint256 revealThreshold;
        bool requireZKProof;
    }
    
    // Events
    event PrivateProposalCreated(
        uint256 indexed proposalId,
        uint256 indexed externalId,
        uint256 commitStart,
        uint256 commitEnd,
        uint256 revealEnd
    );
    
    event VoteCommitted(
        uint256 indexed proposalId,
        address indexed voter,
        bytes32 commitment,
        bool hasZKProof
    );
    
    event VoteRevealed(
        uint256 indexed proposalId,
        address indexed voter,
        VoteChoice vote,
        uint256 votingPower
    );
    
    event ProposalFinalized(
        uint256 indexed proposalId,
        uint256 forVotes,
        uint256 againstVotes,
        uint256 abstainVotes,
        uint256 participation
    );
    
    event ZKProofVerified(
        uint256 indexed proposalId,
        address indexed voter,
        bytes32 nullifier
    );
    
    // Core functions
    function createPrivateProposal(uint256 externalProposalId) external returns (uint256);
    function commitVote(uint256 proposalId, bytes32 commitment) external;
    function commitVoteWithProof(uint256 proposalId, ZKVoteProof calldata zkProof) external;
    function revealVote(uint256 proposalId, VoteChoice voteChoice, bytes32 salt, uint256 votingPower) external;
    function finalizeProposal(uint256 proposalId) external;
    
    // View functions
    function getCurrentPhase(uint256 proposalId) external view returns (VotingPhase);
    function getResults(uint256 proposalId) external view returns (
        uint256 forVotes,
        uint256 againstVotes,
        uint256 abstainVotes,
        uint256 totalCommitments,
        uint256 totalRevealed,
        bool finalized
    );
    function hasCommitted(uint256 proposalId, address voter) external view returns (bool);
    function hasRevealed(uint256 proposalId, address voter) external view returns (bool);
    function getCommitmentStatus(uint256 proposalId) external view returns (
        uint256 totalCommitments,
        uint256 totalRevealed,
        VotingPhase phase,
        uint256 timeRemaining
    );
    function generateCommitment(
        VoteChoice voteChoice,
        bytes32 salt,
        uint256 votingPower,
        address voter
    ) external pure returns (bytes32);
    
    // Admin functions
    function updateConfig(VotingConfig calldata newConfig) external;
    function pause() external;
    function unpause() external;
}
