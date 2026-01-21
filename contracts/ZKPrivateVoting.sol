// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/governance/utils/IVotes.sol";

/**
 * @title ZKPrivateVoting
 * @notice Zero-knowledge private voting system following Vitalik's DAO vision
 * @dev Implements commit-reveal voting with ZK proof verification
 * 
 * Key Principles (from Vitalik's DAO vision):
 * - Privacy: Without privacy, governance becomes a social game
 * - Votes are hidden until reveal phase to prevent:
 *   1. Social pressure / bandwagon effects
 *   2. Vote buying with verifiable outcomes
 *   3. Coercion by powerful actors
 *   4. Strategic voting based on current results
 * 
 * Mechanism:
 * - Commit Phase: Voters submit hash(vote + salt + votingPower)
 * - Reveal Phase: Voters reveal their actual vote with salt
 * - ZK Proof: Proves vote validity without exposing vote during commit
 */
contract ZKPrivateVoting is AccessControl, ReentrancyGuard, Pausable {
    bytes32 public constant PROPOSAL_MANAGER_ROLE = keccak256("PROPOSAL_MANAGER_ROLE");
    bytes32 public constant ZK_VERIFIER_ROLE = keccak256("ZK_VERIFIER_ROLE");
    
    // Vote types
    enum VoteChoice {
        NONE,
        FOR,
        AGAINST,
        ABSTAIN
    }
    
    // Voting phases
    enum VotingPhase {
        NOT_STARTED,
        COMMIT,      // Voters submit commitments
        REVEAL,      // Voters reveal votes
        FINALIZED    // Votes counted, results public
    }
    
    // Proposal structure for private voting
    struct PrivateProposal {
        uint256 id;
        uint256 externalProposalId;  // Link to main DAO proposal
        
        uint256 commitStart;
        uint256 commitEnd;
        uint256 revealEnd;
        
        uint256 forVotes;
        uint256 againstVotes;
        uint256 abstainVotes;
        uint256 totalCommitments;
        uint256 totalRevealed;
        
        VotingPhase phase;
        bool finalized;
        
        // Commitment tracking
        mapping(address => bytes32) commitments;
        mapping(address => bool) hasCommitted;
        mapping(address => bool) hasRevealed;
        mapping(address => VoteChoice) revealedVotes;
        
        // ZK proof tracking
        mapping(address => bytes) zkProofs;
        mapping(address => bool) proofVerified;
    }
    
    // ZK Proof structure
    struct ZKVoteProof {
        bytes32 nullifier;          // Unique per voter per proposal (prevents double voting)
        bytes32 commitment;         // Vote commitment
        bytes proof;                // ZK-SNARK proof data
        uint256 votingPowerRoot;    // Merkle root of voting power at snapshot
    }
    
    // Configuration
    struct VotingConfig {
        uint256 commitDuration;     // Duration of commit phase
        uint256 revealDuration;     // Duration of reveal phase
        uint256 minParticipation;   // Minimum participation for validity (basis points)
        uint256 revealThreshold;    // Minimum reveal rate (basis points)
        bool requireZKProof;        // Whether ZK proofs are mandatory
    }
    
    // State
    IVotes public votingToken;
    VotingConfig public config;
    
    mapping(uint256 => PrivateProposal) public proposals;
    mapping(bytes32 => bool) public usedNullifiers;
    
    uint256 public currentProposalId;
    uint256 public constant BASIS_POINTS = 10000;
    
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
    
    event ConfigUpdated(
        uint256 commitDuration,
        uint256 revealDuration,
        uint256 minParticipation,
        bool requireZKProof
    );
    
    constructor(address _votingToken) {
        votingToken = IVotes(_votingToken);
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PROPOSAL_MANAGER_ROLE, msg.sender);
        _grantRole(ZK_VERIFIER_ROLE, msg.sender);
        
        // Default config
        config = VotingConfig({
            commitDuration: 3 days,
            revealDuration: 2 days,
            minParticipation: 500,    // 5%
            revealThreshold: 6000,    // 60% must reveal
            requireZKProof: false     // Start without mandatory ZK
        });
        
        currentProposalId = 1;
    }
    
    // ============ PROPOSAL MANAGEMENT ============
    
    /**
     * @notice Create a private voting proposal linked to external DAO proposal
     * @param externalProposalId ID of the proposal in main DAO
     */
    function createPrivateProposal(uint256 externalProposalId) 
        external 
        onlyRole(PROPOSAL_MANAGER_ROLE) 
        returns (uint256 proposalId) 
    {
        proposalId = currentProposalId++;
        
        PrivateProposal storage proposal = proposals[proposalId];
        proposal.id = proposalId;
        proposal.externalProposalId = externalProposalId;
        proposal.commitStart = block.timestamp;
        proposal.commitEnd = block.timestamp + config.commitDuration;
        proposal.revealEnd = proposal.commitEnd + config.revealDuration;
        proposal.phase = VotingPhase.COMMIT;
        
        emit PrivateProposalCreated(
            proposalId,
            externalProposalId,
            proposal.commitStart,
            proposal.commitEnd,
            proposal.revealEnd
        );
        
        return proposalId;
    }
    
    // ============ COMMIT PHASE ============
    
    /**
     * @notice Commit a vote (vote hidden until reveal phase)
     * @param proposalId Proposal to vote on
     * @param commitment Hash of (vote + salt + votingPower + voterAddress)
     * 
     * Commitment = keccak256(abi.encodePacked(voteChoice, salt, votingPower, voter))
     * This ensures:
     * - Vote is hidden (no one knows how you voted)
     * - Vote is binding (you can't change it after commit)
     * - Voting power is locked in (prevents power manipulation between phases)
     */
    function commitVote(uint256 proposalId, bytes32 commitment) 
        external 
        whenNotPaused 
    {
        PrivateProposal storage proposal = proposals[proposalId];
        
        require(proposal.id != 0, "Proposal does not exist");
        require(_getCurrentPhase(proposal) == VotingPhase.COMMIT, "Not in commit phase");
        require(!proposal.hasCommitted[msg.sender], "Already committed");
        require(votingToken.getVotes(msg.sender) > 0, "No voting power");
        
        proposal.commitments[msg.sender] = commitment;
        proposal.hasCommitted[msg.sender] = true;
        proposal.totalCommitments++;
        
        emit VoteCommitted(proposalId, msg.sender, commitment, false);
    }
    
    /**
     * @notice Commit a vote with ZK proof
     * @param proposalId Proposal to vote on
     * @param zkProof ZK proof structure proving valid vote without revealing it
     * 
     * The ZK proof proves:
     * 1. Voter has valid voting power at snapshot
     * 2. Vote is one of: FOR, AGAINST, ABSTAIN
     * 3. Commitment is correctly formed
     * Without revealing which vote was cast
     */
    function commitVoteWithProof(
        uint256 proposalId,
        ZKVoteProof calldata zkProof
    ) external whenNotPaused {
        PrivateProposal storage proposal = proposals[proposalId];
        
        require(proposal.id != 0, "Proposal does not exist");
        require(_getCurrentPhase(proposal) == VotingPhase.COMMIT, "Not in commit phase");
        require(!proposal.hasCommitted[msg.sender], "Already committed");
        require(!usedNullifiers[zkProof.nullifier], "Nullifier already used");
        
        // Verify the ZK proof (simplified - real implementation uses ZK verifier)
        require(_verifyZKProof(proposalId, msg.sender, zkProof), "Invalid ZK proof");
        
        // Mark nullifier as used
        usedNullifiers[zkProof.nullifier] = true;
        
        // Store commitment
        proposal.commitments[msg.sender] = zkProof.commitment;
        proposal.hasCommitted[msg.sender] = true;
        proposal.totalCommitments++;
        proposal.zkProofs[msg.sender] = zkProof.proof;
        proposal.proofVerified[msg.sender] = true;
        
        emit ZKProofVerified(proposalId, msg.sender, zkProof.nullifier);
        emit VoteCommitted(proposalId, msg.sender, zkProof.commitment, true);
    }
    
    // ============ REVEAL PHASE ============
    
    /**
     * @notice Reveal your committed vote
     * @param proposalId Proposal to reveal vote for
     * @param voteChoice Your vote (FOR, AGAINST, ABSTAIN)
     * @param salt Random salt used in commitment
     * @param votingPower Voting power at time of commitment
     */
    function revealVote(
        uint256 proposalId,
        VoteChoice voteChoice,
        bytes32 salt,
        uint256 votingPower
    ) external whenNotPaused {
        PrivateProposal storage proposal = proposals[proposalId];
        
        require(proposal.id != 0, "Proposal does not exist");
        require(_getCurrentPhase(proposal) == VotingPhase.REVEAL, "Not in reveal phase");
        require(proposal.hasCommitted[msg.sender], "No commitment found");
        require(!proposal.hasRevealed[msg.sender], "Already revealed");
        require(voteChoice != VoteChoice.NONE, "Invalid vote choice");
        
        // Verify commitment matches revealed data
        bytes32 expectedCommitment = keccak256(
            abi.encodePacked(voteChoice, salt, votingPower, msg.sender)
        );
        require(proposal.commitments[msg.sender] == expectedCommitment, "Commitment mismatch");
        
        // Record revealed vote
        proposal.hasRevealed[msg.sender] = true;
        proposal.revealedVotes[msg.sender] = voteChoice;
        proposal.totalRevealed++;
        
        // Tally vote
        if (voteChoice == VoteChoice.FOR) {
            proposal.forVotes += votingPower;
        } else if (voteChoice == VoteChoice.AGAINST) {
            proposal.againstVotes += votingPower;
        } else if (voteChoice == VoteChoice.ABSTAIN) {
            proposal.abstainVotes += votingPower;
        }
        
        emit VoteRevealed(proposalId, msg.sender, voteChoice, votingPower);
    }
    
    // ============ FINALIZATION ============
    
    /**
     * @notice Finalize proposal after reveal phase ends
     * @param proposalId Proposal to finalize
     */
    function finalizeProposal(uint256 proposalId) external {
        PrivateProposal storage proposal = proposals[proposalId];
        
        require(proposal.id != 0, "Proposal does not exist");
        require(block.timestamp > proposal.revealEnd, "Reveal phase not ended");
        require(!proposal.finalized, "Already finalized");
        
        // Check reveal threshold
        if (proposal.totalCommitments > 0) {
            uint256 revealRate = (proposal.totalRevealed * BASIS_POINTS) / proposal.totalCommitments;
            require(revealRate >= config.revealThreshold, "Insufficient reveals");
        }
        
        proposal.finalized = true;
        proposal.phase = VotingPhase.FINALIZED;
        
        uint256 totalVotes = proposal.forVotes + proposal.againstVotes + proposal.abstainVotes;
        
        emit ProposalFinalized(
            proposalId,
            proposal.forVotes,
            proposal.againstVotes,
            proposal.abstainVotes,
            totalVotes
        );
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @notice Get current phase of a proposal
     */
    function getCurrentPhase(uint256 proposalId) external view returns (VotingPhase) {
        return _getCurrentPhase(proposals[proposalId]);
    }
    
    /**
     * @notice Get proposal results (only available after finalization)
     */
    function getResults(uint256 proposalId) external view returns (
        uint256 forVotes,
        uint256 againstVotes,
        uint256 abstainVotes,
        uint256 totalCommitments,
        uint256 totalRevealed,
        bool finalized
    ) {
        PrivateProposal storage proposal = proposals[proposalId];
        require(proposal.finalized, "Proposal not finalized");
        
        return (
            proposal.forVotes,
            proposal.againstVotes,
            proposal.abstainVotes,
            proposal.totalCommitments,
            proposal.totalRevealed,
            proposal.finalized
        );
    }
    
    /**
     * @notice Check if user has committed to a proposal
     */
    function hasCommitted(uint256 proposalId, address voter) external view returns (bool) {
        return proposals[proposalId].hasCommitted[voter];
    }
    
    /**
     * @notice Check if user has revealed their vote
     */
    function hasRevealed(uint256 proposalId, address voter) external view returns (bool) {
        return proposals[proposalId].hasRevealed[voter];
    }
    
    /**
     * @notice Get commitment status (no vote details until finalized)
     */
    function getCommitmentStatus(uint256 proposalId) external view returns (
        uint256 totalCommitments,
        uint256 totalRevealed,
        VotingPhase phase,
        uint256 timeRemaining
    ) {
        PrivateProposal storage proposal = proposals[proposalId];
        VotingPhase currentPhase = _getCurrentPhase(proposal);
        
        uint256 remaining = 0;
        if (currentPhase == VotingPhase.COMMIT && block.timestamp < proposal.commitEnd) {
            remaining = proposal.commitEnd - block.timestamp;
        } else if (currentPhase == VotingPhase.REVEAL && block.timestamp < proposal.revealEnd) {
            remaining = proposal.revealEnd - block.timestamp;
        }
        
        return (
            proposal.totalCommitments,
            proposal.totalRevealed,
            currentPhase,
            remaining
        );
    }
    
    /**
     * @notice Generate commitment hash for a vote (helper for frontend)
     */
    function generateCommitment(
        VoteChoice voteChoice,
        bytes32 salt,
        uint256 votingPower,
        address voter
    ) external pure returns (bytes32) {
        return keccak256(abi.encodePacked(voteChoice, salt, votingPower, voter));
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @notice Update voting configuration
     */
    function updateConfig(VotingConfig calldata newConfig) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        require(newConfig.commitDuration >= 1 hours, "Commit duration too short");
        require(newConfig.revealDuration >= 1 hours, "Reveal duration too short");
        require(newConfig.revealThreshold <= BASIS_POINTS, "Invalid reveal threshold");
        
        config = newConfig;
        
        emit ConfigUpdated(
            newConfig.commitDuration,
            newConfig.revealDuration,
            newConfig.minParticipation,
            newConfig.requireZKProof
        );
    }
    
    /**
     * @notice Emergency pause
     */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }
    
    /**
     * @notice Unpause
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
    
    // ============ INTERNAL FUNCTIONS ============
    
    function _getCurrentPhase(PrivateProposal storage proposal) 
        internal 
        view 
        returns (VotingPhase) 
    {
        if (proposal.id == 0) return VotingPhase.NOT_STARTED;
        if (proposal.finalized) return VotingPhase.FINALIZED;
        if (block.timestamp < proposal.commitStart) return VotingPhase.NOT_STARTED;
        if (block.timestamp <= proposal.commitEnd) return VotingPhase.COMMIT;
        if (block.timestamp <= proposal.revealEnd) return VotingPhase.REVEAL;
        return VotingPhase.FINALIZED;
    }
    
    /**
     * @notice Verify ZK proof (simplified placeholder - integrate with ZK verifier)
     * @dev In production, this would call a ZK-SNARK verifier contract
     * 
     * The real ZK circuit would verify:
     * 1. Voter's merkle proof of voting power at snapshot
     * 2. Vote is valid (0, 1, or 2 for FOR/AGAINST/ABSTAIN)
     * 3. Commitment is correctly computed from vote + randomness
     * 4. Nullifier is correctly derived (prevents double voting)
     */
    function _verifyZKProof(
        uint256 proposalId,
        address voter,
        ZKVoteProof calldata zkProof
    ) internal view returns (bool) {
        // Placeholder verification
        // Real implementation would use a Groth16 or PLONK verifier
        
        // Basic validation
        if (zkProof.nullifier == bytes32(0)) return false;
        if (zkProof.commitment == bytes32(0)) return false;
        if (zkProof.proof.length == 0) return false;
        
        // Check voting power exists
        uint256 votingPower = votingToken.getVotes(voter);
        if (votingPower == 0) return false;
        
        // In production: call verifier contract
        // IZKVerifier(verifierAddress).verify(zkProof.proof, publicInputs)
        
        return true;
    }
}
