// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title PitchforkGovernance
 * @dev Decentralized governance contract for democratic decision-making in resistance movements
 * @notice This contract enables transparent, tamper-proof voting on important decisions
 */
contract PitchforkGovernance {
    struct Proposal {
        uint256 id;
        string title;
        string description;
        address proposer;
        uint256 votingStartTime;
        uint256 votingEndTime;
        uint256 yesVotes;
        uint256 noVotes;
        uint256 abstainVotes;
        uint256 totalVotes;
        uint256 quorumRequired;
        uint256 passingThreshold; // Percentage (e.g., 60 = 60%)
        ProposalStatus status;
        mapping(address => bool) hasVoted;
        mapping(address => VoteChoice) votes;
        address[] voters;
    }

    enum ProposalStatus {
        Draft,
        Active,
        Passed,
        Rejected,
        Executed
    }

    enum VoteChoice {
        Yes,
        No,
        Abstain
    }

    struct Vote {
        address voter;
        VoteChoice choice;
        uint256 timestamp;
        string reason; // Optional reasoning
    }

    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => Vote[]) public proposalVotes;
    uint256 public proposalCounter;
    
    // Governance parameters
    uint256 public constant MIN_VOTING_PERIOD = 1 days;
    uint256 public constant MAX_VOTING_PERIOD = 30 days;
    uint256 public constant DEFAULT_QUORUM = 10; // 10% of eligible voters
    uint256 public constant DEFAULT_PASSING_THRESHOLD = 60; // 60%

    // Events for transparency
    event ProposalCreated(
        uint256 indexed proposalId,
        string title,
        address indexed proposer,
        uint256 votingStartTime,
        uint256 votingEndTime
    );
    
    event VoteCast(
        uint256 indexed proposalId,
        address indexed voter,
        VoteChoice choice,
        uint256 timestamp
    );
    
    event ProposalStatusChanged(
        uint256 indexed proposalId,
        ProposalStatus oldStatus,
        ProposalStatus newStatus
    );

    modifier onlyActiveProposal(uint256 _proposalId) {
        require(proposals[_proposalId].status == ProposalStatus.Active, "Proposal is not active");
        require(block.timestamp >= proposals[_proposalId].votingStartTime, "Voting has not started");
        require(block.timestamp <= proposals[_proposalId].votingEndTime, "Voting period has ended");
        _;
    }

    modifier onlyProposer(uint256 _proposalId) {
        require(msg.sender == proposals[_proposalId].proposer, "Only proposer can perform this action");
        _;
    }

    modifier hasNotVoted(uint256 _proposalId) {
        require(!proposals[_proposalId].hasVoted[msg.sender], "You have already voted on this proposal");
        _;
    }

    /**
     * @dev Create a new governance proposal
     * @param _title Proposal title
     * @param _description Detailed proposal description
     * @param _votingDuration Duration of voting period in seconds
     * @param _quorumRequired Minimum number of votes required (0 = use default)
     * @param _passingThreshold Percentage required to pass (0 = use default)
     */
    function createProposal(
        string memory _title,
        string memory _description,
        uint256 _votingDuration,
        uint256 _quorumRequired,
        uint256 _passingThreshold
    ) external returns (uint256) {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");
        require(_votingDuration >= MIN_VOTING_PERIOD, "Voting period too short");
        require(_votingDuration <= MAX_VOTING_PERIOD, "Voting period too long");

        uint256 proposalId = proposalCounter++;
        Proposal storage newProposal = proposals[proposalId];

        newProposal.id = proposalId;
        newProposal.title = _title;
        newProposal.description = _description;
        newProposal.proposer = msg.sender;
        newProposal.votingStartTime = block.timestamp;
        newProposal.votingEndTime = block.timestamp + _votingDuration;
        newProposal.yesVotes = 0;
        newProposal.noVotes = 0;
        newProposal.abstainVotes = 0;
        newProposal.totalVotes = 0;
        newProposal.quorumRequired = _quorumRequired > 0 ? _quorumRequired : DEFAULT_QUORUM;
        newProposal.passingThreshold = _passingThreshold > 0 ? _passingThreshold : DEFAULT_PASSING_THRESHOLD;
        newProposal.status = ProposalStatus.Active;

        emit ProposalCreated(
            proposalId,
            _title,
            msg.sender,
            newProposal.votingStartTime,
            newProposal.votingEndTime
        );

        return proposalId;
    }

    /**
     * @dev Cast a vote on a proposal
     * @param _proposalId ID of the proposal
     * @param _choice Vote choice (Yes, No, Abstain)
     * @param _reason Optional reasoning for the vote
     */
    function vote(
        uint256 _proposalId,
        VoteChoice _choice,
        string memory _reason
    ) external onlyActiveProposal(_proposalId) hasNotVoted(_proposalId) {
        Proposal storage proposal = proposals[_proposalId];
        
        // Record the vote
        proposal.hasVoted[msg.sender] = true;
        proposal.votes[msg.sender] = _choice;
        proposal.voters.push(msg.sender);
        proposal.totalVotes++;

        // Update vote counts
        if (_choice == VoteChoice.Yes) {
            proposal.yesVotes++;
        } else if (_choice == VoteChoice.No) {
            proposal.noVotes++;
        } else {
            proposal.abstainVotes++;
        }

        // Add to vote history
        proposalVotes[_proposalId].push(Vote({
            voter: msg.sender,
            choice: _choice,
            timestamp: block.timestamp,
            reason: _reason
        }));

        emit VoteCast(_proposalId, msg.sender, _choice, block.timestamp);
    }

    /**
     * @dev Finalize a proposal after voting period ends
     * @param _proposalId ID of the proposal
     */
    function finalizeProposal(uint256 _proposalId) external {
        Proposal storage proposal = proposals[_proposalId];
        require(proposal.status == ProposalStatus.Active, "Proposal is not active");
        require(block.timestamp > proposal.votingEndTime, "Voting period has not ended");

        ProposalStatus oldStatus = proposal.status;
        
        // Check if quorum was reached
        if (proposal.totalVotes < proposal.quorumRequired) {
            proposal.status = ProposalStatus.Rejected;
        } else {
            // Calculate if proposal passed
            uint256 yesPercentage = (proposal.yesVotes * 100) / proposal.totalVotes;
            if (yesPercentage >= proposal.passingThreshold) {
                proposal.status = ProposalStatus.Passed;
            } else {
                proposal.status = ProposalStatus.Rejected;
            }
        }

        emit ProposalStatusChanged(_proposalId, oldStatus, proposal.status);
    }

    /**
     * @dev Get proposal details
     * @param _proposalId ID of the proposal
     */
    function getProposal(uint256 _proposalId) 
        external 
        view 
        returns (
            string memory title,
            string memory description,
            address proposer,
            uint256 votingStartTime,
            uint256 votingEndTime,
            uint256 yesVotes,
            uint256 noVotes,
            uint256 abstainVotes,
            uint256 totalVotes,
            ProposalStatus status
        ) 
    {
        Proposal storage proposal = proposals[_proposalId];
        return (
            proposal.title,
            proposal.description,
            proposal.proposer,
            proposal.votingStartTime,
            proposal.votingEndTime,
            proposal.yesVotes,
            proposal.noVotes,
            proposal.abstainVotes,
            proposal.totalVotes,
            proposal.status
        );
    }

    /**
     * @dev Get vote details for a specific voter on a proposal
     * @param _proposalId ID of the proposal
     * @param _voter Address of the voter
     */
    function getVote(uint256 _proposalId, address _voter) 
        external 
        view 
        returns (bool hasVoted, VoteChoice choice) 
    {
        Proposal storage proposal = proposals[_proposalId];
        return (proposal.hasVoted[_voter], proposal.votes[_voter]);
    }

    /**
     * @dev Get all voters for a proposal
     * @param _proposalId ID of the proposal
     */
    function getVoters(uint256 _proposalId) 
        external 
        view 
        returns (address[] memory) 
    {
        return proposals[_proposalId].voters;
    }

    /**
     * @dev Get voting history for a proposal
     * @param _proposalId ID of the proposal
     */
    function getVotingHistory(uint256 _proposalId) 
        external 
        view 
        returns (Vote[] memory) 
    {
        return proposalVotes[_proposalId];
    }

    /**
     * @dev Check if voting period is active
     * @param _proposalId ID of the proposal
     */
    function isVotingActive(uint256 _proposalId) external view returns (bool) {
        Proposal storage proposal = proposals[_proposalId];
        return proposal.status == ProposalStatus.Active &&
               block.timestamp >= proposal.votingStartTime &&
               block.timestamp <= proposal.votingEndTime;
    }

    /**
     * @dev Get total number of proposals
     */
    function getTotalProposals() external view returns (uint256) {
        return proposalCounter;
    }

    /**
     * @dev Emergency function to cancel a proposal (proposer only, before voting starts)
     * @param _proposalId ID of the proposal
     */
    function cancelProposal(uint256 _proposalId) 
        external 
        onlyProposer(_proposalId) 
    {
        require(block.timestamp < proposals[_proposalId].votingStartTime, "Voting has already started");
        require(proposals[_proposalId].status == ProposalStatus.Active, "Proposal is not active");
        
        ProposalStatus oldStatus = proposals[_proposalId].status;
        proposals[_proposalId].status = ProposalStatus.Rejected;
        
        emit ProposalStatusChanged(_proposalId, oldStatus, ProposalStatus.Rejected);
    }
}
