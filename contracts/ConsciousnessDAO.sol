// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/governance/utils/IVotes.sol";
import "./interfaces/IConsciousnessIdentity.sol";
import "./interfaces/ILeadershipSubscription.sol";

/**
 * @title ConsciousnessDAO
 * @notice DAO governance infrastructure for consciousness platform
 * @dev Handles voting, proposals, treasury management, and community decisions
 */
contract ConsciousnessDAO is AccessControl, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;
    
    bytes32 public constant PROPOSAL_CREATOR_ROLE = keccak256("PROPOSAL_CREATOR_ROLE");
    bytes32 public constant TREASURY_MANAGER_ROLE = keccak256("TREASURY_MANAGER_ROLE");
    bytes32 public constant EXECUTION_ADMIN_ROLE = keccak256("EXECUTION_ADMIN_ROLE");
    bytes32 public constant GUARDIAN_ROLE = keccak256("GUARDIAN_ROLE");
    
    // Proposal categories
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
    
    // Proposal structures
    struct Proposal {
        uint256 id;
        address proposer;
        ProposalCategory category;
        string title;
        string description;
        string executionDetails; // IPFS hash for detailed execution plan
        
        uint256 startTime;
        uint256 endTime;
        uint256 executionDelay;
        
        uint256 forVotes;
        uint256 againstVotes;
        uint256 abstainVotes;
        uint256 totalVotingPower;
        
        uint256 quorumRequired;
        uint256 approvalThreshold; // Percentage in basis points (e.g., 5000 = 50%)
        
        ProposalStatus status;
        bool isExecuted;
        uint256 executedAt;
        
        // Treasury request details
        address[] requestedTokens;
        uint256[] requestedAmounts;
        address[] recipients;
        
        mapping(address => Vote) votes;
        mapping(address => bool) hasVoted;
    }
    
    struct Vote {
        address voter;
        VoteType voteType;
        uint256 votingPower;
        uint256 timestamp;
        string reason; // Optional reason for vote
    }
    
    struct GovernanceParameters {
        uint256 proposalThreshold; // Minimum tokens needed to create proposal
        uint256 votingDelay; // Delay before voting starts (in blocks)
        uint256 votingPeriod; // Duration of voting (in blocks)
        uint256 executionDelay; // Delay after proposal passes before execution
        uint256 quorumPercentage; // Minimum participation required (basis points)
        uint256 approvalThreshold; // Minimum approval required (basis points)
        uint256 gracePeriod; // Grace period for execution (in seconds)
    }
    
    struct TreasuryAllocation {
        address token;
        uint256 totalAmount;
        uint256 allocatedAmount;
        uint256 spentAmount;
        uint256 lastAllocation;
        bool isActive;
    }
    
    // State variables
    mapping(uint256 => Proposal) public proposals;
    mapping(address => uint256) public proposalCounts;
    mapping(ProposalCategory => GovernanceParameters) public categoryParameters;
    mapping(address => TreasuryAllocation) public treasuryAllocations;
    mapping(address => uint256) public delegatedVotes;
    mapping(address => address) public delegates;
    
    IVotes public gPforkToken;
    IConsciousnessIdentity public identityContract;
    ILeadershipSubscription public subscriptionContract;
    
    uint256 public currentProposalId;
    uint256 public totalProposals;
    uint256 public activeProposals;
    uint256 public executedProposals;
    
    // Platform treasury
    mapping(address => uint256) public treasuryBalances;
    uint256 public totalTreasuryValue;
    
    // Voting configuration
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant MIN_PROPOSAL_THRESHOLD = 1000 * 10**18; // 1000 gPFORK
    uint256 public constant MAX_VOTING_PERIOD = 7 days;
    uint256 public constant MIN_QUORUM = 300; // 3%
    
    // Emergency controls
    bool public emergencyPaused;
    mapping(address => bool) public emergencyGuardians;
    
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
    
    constructor(
        address _gPforkToken,
        address _identityContract,
        address _subscriptionContract
    ) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PROPOSAL_CREATOR_ROLE, msg.sender);
        _grantRole(TREASURY_MANAGER_ROLE, msg.sender);
        _grantRole(EXECUTION_ADMIN_ROLE, msg.sender);
        _grantRole(GUARDIAN_ROLE, msg.sender);
        
        gPforkToken = IVotes(_gPforkToken);
        identityContract = IConsciousnessIdentity(_identityContract);
        subscriptionContract = ILeadershipSubscription(_subscriptionContract);
        
        currentProposalId = 1;
        _initializeGovernanceParameters();
    }
    
    /**
     * @notice Create a new governance proposal
     * @param category Proposal category
     * @param title Proposal title
     * @param description Detailed description
     * @param executionDetails IPFS hash for execution plan
     * @param requestedTokens Array of tokens requested from treasury
     * @param requestedAmounts Array of amounts for each token
     * @param recipients Array of recipient addresses for treasury funds
     */
    function createProposal(
        ProposalCategory category,
        string memory title,
        string memory description,
        string memory executionDetails,
        address[] memory requestedTokens,
        uint256[] memory requestedAmounts,
        address[] memory recipients
    ) external whenNotPaused returns (uint256 proposalId) {
        require(_canCreateProposal(msg.sender, category), "Insufficient privileges to create proposal");
        require(bytes(title).length > 0 && bytes(title).length <= 200, "Invalid title length");
        require(bytes(description).length > 0, "Description required");
        require(requestedTokens.length == requestedAmounts.length, "Token/amount array mismatch");
        require(requestedTokens.length == recipients.length, "Token/recipient array mismatch");
        
        // Validate treasury requests
        if (requestedTokens.length > 0) {
            _validateTreasuryRequest(requestedTokens, requestedAmounts);
        }
        
        proposalId = currentProposalId++;
        
        Proposal storage proposal = proposals[proposalId];
        proposal.id = proposalId;
        proposal.proposer = msg.sender;
        proposal.category = category;
        proposal.title = title;
        proposal.description = description;
        proposal.executionDetails = executionDetails;
        
        GovernanceParameters storage params = categoryParameters[category];
        proposal.startTime = block.timestamp + params.votingDelay;
        proposal.endTime = proposal.startTime + params.votingPeriod;
        proposal.executionDelay = params.executionDelay;
        proposal.quorumRequired = params.quorumPercentage;
        proposal.approvalThreshold = params.approvalThreshold;
        proposal.status = ProposalStatus.DRAFT;
        
        // Set treasury request details
        proposal.requestedTokens = requestedTokens;
        proposal.requestedAmounts = requestedAmounts;
        proposal.recipients = recipients;
        
        totalProposals++;
        proposalCounts[msg.sender]++;
        
        emit ProposalCreated(proposalId, msg.sender, category, title);
        
        return proposalId;
    }
    
    /**
     * @notice Cast a vote on a proposal
     * @param proposalId ID of the proposal to vote on
     * @param voteType Type of vote (FOR, AGAINST, ABSTAIN)
     * @param reason Optional reason for the vote
     */
    function castVote(
        uint256 proposalId,
        VoteType voteType,
        string memory reason
    ) external whenNotPaused {
        require(proposalId > 0 && proposalId < currentProposalId, "Invalid proposal ID");
        
        Proposal storage proposal = proposals[proposalId];
        require(proposal.status == ProposalStatus.ACTIVE || 
                (proposal.status == ProposalStatus.DRAFT && block.timestamp >= proposal.startTime), 
                "Proposal not active for voting");
        require(block.timestamp <= proposal.endTime, "Voting period ended");
        require(!proposal.hasVoted[msg.sender], "Already voted on this proposal");
        
        uint256 votingPower = _getVotingPower(msg.sender);
        require(votingPower > 0, "No voting power");
        
        // Update proposal status to active if it was in draft
        if (proposal.status == ProposalStatus.DRAFT) {
            proposal.status = ProposalStatus.ACTIVE;
            activeProposals++;
        }
        
        // Record vote
        proposal.votes[msg.sender] = Vote({
            voter: msg.sender,
            voteType: voteType,
            votingPower: votingPower,
            timestamp: block.timestamp,
            reason: reason
        });
        
        proposal.hasVoted[msg.sender] = true;
        proposal.totalVotingPower += votingPower;
        
        // Update vote tallies
        if (voteType == VoteType.FOR) {
            proposal.forVotes += votingPower;
        } else if (voteType == VoteType.AGAINST) {
            proposal.againstVotes += votingPower;
        } else {
            proposal.abstainVotes += votingPower;
        }
        
        emit VoteCast(proposalId, msg.sender, voteType, votingPower, reason);
        
        // Check if proposal should be finalized
        _checkProposalStatus(proposalId);
    }
    
    /**
     * @notice Execute a successful proposal
     * @param proposalId ID of the proposal to execute
     */
    function executeProposal(uint256 proposalId) external nonReentrant {
        require(proposalId > 0 && proposalId < currentProposalId, "Invalid proposal ID");
        
        Proposal storage proposal = proposals[proposalId];
        require(proposal.status == ProposalStatus.SUCCEEDED, "Proposal not succeeded");
        require(!proposal.isExecuted, "Proposal already executed");
        require(block.timestamp >= proposal.endTime + proposal.executionDelay, "Execution delay not met");
        require(block.timestamp <= proposal.endTime + proposal.executionDelay + categoryParameters[proposal.category].gracePeriod, 
                "Execution grace period expired");
        
        proposal.isExecuted = true;
        proposal.executedAt = block.timestamp;
        proposal.status = ProposalStatus.EXECUTED;
        
        activeProposals--;
        executedProposals++;
        
        // Execute treasury withdrawals if any
        if (proposal.requestedTokens.length > 0) {
            _executeTreasuryWithdrawals(proposalId, proposal);
        }
        
        emit ProposalExecuted(proposalId, msg.sender);
    }
    
    /**
     * @notice Cancel a proposal (only by proposer or admin)
     * @param proposalId ID of the proposal to cancel
     */
    function cancelProposal(uint256 proposalId) external {
        require(proposalId > 0 && proposalId < currentProposalId, "Invalid proposal ID");
        
        Proposal storage proposal = proposals[proposalId];
        require(proposal.status == ProposalStatus.DRAFT || proposal.status == ProposalStatus.ACTIVE, 
                "Cannot cancel proposal in current status");
        require(msg.sender == proposal.proposer || hasRole(DEFAULT_ADMIN_ROLE, msg.sender), 
                "Not authorized to cancel");
        
        proposal.status = ProposalStatus.CANCELLED;
        
        if (proposal.status == ProposalStatus.ACTIVE) {
            activeProposals--;
        }
        
        emit ProposalCancelled(proposalId, msg.sender);
    }
    
    /**
     * @notice Delegate voting power to another address
     * @param delegatee Address to delegate to
     */
    function delegate(address delegatee) external {
        require(delegatee != msg.sender, "Cannot delegate to self");
        
        address oldDelegate = delegates[msg.sender];
        uint256 delegatorBalance = gPforkToken.getVotes(msg.sender);
        
        // Remove delegation from old delegate
        if (oldDelegate != address(0)) {
            delegatedVotes[oldDelegate] -= delegatorBalance;
        }
        
        // Add delegation to new delegate
        delegates[msg.sender] = delegatee;
        if (delegatee != address(0)) {
            delegatedVotes[delegatee] += delegatorBalance;
        }
        
        emit DelegateChanged(msg.sender, oldDelegate, delegatee);
    }
    
    /**
     * @notice Deposit tokens to DAO treasury
     * @param token Token address (use address(0) for ETH)
     * @param amount Amount to deposit
     */
    function depositToTreasury(address token, uint256 amount) external payable nonReentrant {
        if (token == address(0)) {
            require(msg.value == amount, "ETH amount mismatch");
            treasuryBalances[address(0)] += amount;
        } else {
            require(amount > 0, "Amount must be positive");
            IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
            treasuryBalances[token] += amount;
        }
        
        if (treasuryAllocations[token].totalAmount == 0) {
            treasuryAllocations[token] = TreasuryAllocation({
                token: token,
                totalAmount: amount,
                allocatedAmount: 0,
                spentAmount: 0,
                lastAllocation: block.timestamp,
                isActive: true
            });
        } else {
            treasuryAllocations[token].totalAmount += amount;
        }
        
        totalTreasuryValue += amount; // Simplified - should use price oracle in production
        
        emit TreasuryDeposit(token, amount, msg.sender);
    }
    
    /**
     * @notice Get proposal details
     * @param proposalId ID of the proposal
     */
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
    ) {
        require(proposalId > 0 && proposalId < currentProposalId, "Invalid proposal ID");
        
        Proposal storage proposal = proposals[proposalId];
        
        return (
            proposal.proposer,
            proposal.category,
            proposal.title,
            proposal.description,
            proposal.startTime,
            proposal.endTime,
            proposal.forVotes,
            proposal.againstVotes,
            proposal.abstainVotes,
            proposal.status,
            proposal.isExecuted
        );
    }
    
    /**
     * @notice Get user's vote on a proposal
     * @param proposalId ID of the proposal
     * @param voter Address of the voter
     */
    function getVote(uint256 proposalId, address voter) external view returns (
        VoteType voteType,
        uint256 votingPower,
        uint256 timestamp,
        string memory reason
    ) {
        require(proposalId > 0 && proposalId < currentProposalId, "Invalid proposal ID");
        require(proposals[proposalId].hasVoted[voter], "User has not voted");
        
        Vote storage vote = proposals[proposalId].votes[voter];
        
        return (
            vote.voteType,
            vote.votingPower,
            vote.timestamp,
            vote.reason
        );
    }
    
    /**
     * @notice Get voting power for an address
     * @param account Address to check voting power for
     */
    function getVotingPower(address account) external view returns (uint256) {
        return _getVotingPower(account);
    }
    
    /**
     * @notice Check if proposal has reached quorum and passed
     * @param proposalId ID of the proposal to check
     */
    function hasProposalPassed(uint256 proposalId) external view returns (bool passed, bool reachedQuorum) {
        require(proposalId > 0 && proposalId < currentProposalId, "Invalid proposal ID");
        
        Proposal storage proposal = proposals[proposalId];
        uint256 totalSupply = IERC20(address(gPforkToken)).totalSupply();
        
        // Calculate quorum
        uint256 requiredQuorum = (totalSupply * proposal.quorumRequired) / BASIS_POINTS;
        reachedQuorum = proposal.totalVotingPower >= requiredQuorum;
        
        // Calculate approval
        if (proposal.forVotes + proposal.againstVotes > 0) {
            uint256 approvalPercentage = (proposal.forVotes * BASIS_POINTS) / (proposal.forVotes + proposal.againstVotes);
            passed = approvalPercentage >= proposal.approvalThreshold;
        } else {
            passed = false;
        }
        
        return (passed && reachedQuorum, reachedQuorum);
    }
    
    /**
     * @notice Update governance parameters for a category
     * @param category Proposal category to update
     * @param newQuorum New quorum percentage
     * @param newThreshold New approval threshold
     * @param newVotingPeriod New voting period
     */
    function updateGovernanceParameters(
        ProposalCategory category,
        uint256 newQuorum,
        uint256 newThreshold,
        uint256 newVotingPeriod
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newQuorum >= MIN_QUORUM && newQuorum <= 5000, "Invalid quorum");
        require(newThreshold >= 5000 && newThreshold <= 9000, "Invalid threshold");
        require(newVotingPeriod >= 1 days && newVotingPeriod <= MAX_VOTING_PERIOD, "Invalid voting period");
        
        GovernanceParameters storage params = categoryParameters[category];
        params.quorumPercentage = newQuorum;
        params.approvalThreshold = newThreshold;
        params.votingPeriod = newVotingPeriod;
        
        emit GovernanceParametersUpdated(category, newQuorum, newThreshold);
    }
    
    /**
     * @notice Emergency pause by guardian
     * @param reason Reason for emergency pause
     */
    function emergencyPause(string memory reason) external onlyRole(GUARDIAN_ROLE) {
        emergencyPaused = true;
        _pause();
        emit EmergencyActionExecuted(msg.sender, reason);
    }
    
    /**
     * @notice Emergency unpause
     */
    function emergencyUnpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        emergencyPaused = false;
        _unpause();
    }
    
    // Internal functions
    function _getVotingPower(address account) internal view returns (uint256) {
        uint256 votesBalance = gPforkToken.getVotes(account);
        uint256 subscriptionPower = subscriptionContract.getVotingPower(account);
        uint256 delegated = delegatedVotes[account];
        
        // Base voting power from gPFORK votes (1:1)
        uint256 totalPower = votesBalance;
        
        // Add subscription-based voting power multiplier
        totalPower += subscriptionPower * 100; // Subscription power is significant
        
        // Add delegated votes
        totalPower += delegated;
        
        return totalPower;
    }
    
    function _canCreateProposal(address proposer, ProposalCategory category) internal view returns (bool) {
        // Check minimum token requirement
        uint256 votesBalance = gPforkToken.getVotes(proposer);
        if (votesBalance < categoryParameters[category].proposalThreshold) {
            return false;
        }
        
        // Check if user has required identity verification level for certain categories
        if (category == ProposalCategory.CONSCIOUSNESS_RESEARCH || category == ProposalCategory.AI_MODEL_SELECTION) {
            // Requires at least executive verification level
            // This would need to be implemented with proper identity contract integration
        }
        
        // Check subscription requirements for enterprise-level proposals
        if (category == ProposalCategory.PARTNERSHIP_PROPOSAL) {
            return subscriptionContract.getVotingPower(proposer) > 0;
        }
        
        return true;
    }
    
    function _validateTreasuryRequest(address[] memory tokens, uint256[] memory amounts) internal view {
        for (uint256 i = 0; i < tokens.length; i++) {
            require(treasuryBalances[tokens[i]] >= amounts[i], "Insufficient treasury funds");
        }
    }
    
    function _executeTreasuryWithdrawals(uint256 proposalId, Proposal storage proposal) internal {
        for (uint256 i = 0; i < proposal.requestedTokens.length; i++) {
            address token = proposal.requestedTokens[i];
            uint256 amount = proposal.requestedAmounts[i];
            address recipient = proposal.recipients[i];
            
            require(treasuryBalances[token] >= amount, "Insufficient treasury balance");
            
            treasuryBalances[token] -= amount;
            treasuryAllocations[token].spentAmount += amount;
            
            if (token == address(0)) {
                // ETH withdrawal
                (bool sent, ) = payable(recipient).call{value: amount}("");
                require(sent, "ETH transfer failed");
            } else {
                // ERC20 withdrawal
                IERC20(token).safeTransfer(recipient, amount);
            }
            
            emit TreasuryWithdrawal(token, amount, recipient, proposalId);
        }
    }
    
    function _checkProposalStatus(uint256 proposalId) internal {
        Proposal storage proposal = proposals[proposalId];
        
        // Check if voting period has ended
        if (block.timestamp > proposal.endTime) {
            (bool passed, bool reachedQuorum) = this.hasProposalPassed(proposalId);
            
            if (passed && reachedQuorum) {
                proposal.status = ProposalStatus.SUCCEEDED;
            } else {
                proposal.status = ProposalStatus.DEFEATED;
            }
            
            activeProposals--;
        }
    }
    
    function _initializeGovernanceParameters() internal {
        // Platform Development
        categoryParameters[ProposalCategory.PLATFORM_DEVELOPMENT] = GovernanceParameters({
            proposalThreshold: 5000 * 10**18,    // 5000 CONS
            votingDelay: 2 days,
            votingPeriod: 5 days,
            executionDelay: 2 days,
            quorumPercentage: 500,               // 5%
            approvalThreshold: 6000,             // 60%
            gracePeriod: 7 days
        });
        
        // Consciousness Research
        categoryParameters[ProposalCategory.CONSCIOUSNESS_RESEARCH] = GovernanceParameters({
            proposalThreshold: 10000 * 10**18,   // 10000 CONS
            votingDelay: 1 days,
            votingPeriod: 7 days,
            executionDelay: 1 days,
            quorumPercentage: 800,               // 8%
            approvalThreshold: 7000,             // 70%
            gracePeriod: 7 days
        });
        
        // Treasury Allocation
        categoryParameters[ProposalCategory.TREASURY_ALLOCATION] = GovernanceParameters({
            proposalThreshold: 20000 * 10**18,   // 20000 CONS
            votingDelay: 3 days,
            votingPeriod: 7 days,
            executionDelay: 3 days,
            quorumPercentage: 1000,              // 10%
            approvalThreshold: 7500,             // 75%
            gracePeriod: 14 days
        });
        
        // Emergency Action
        categoryParameters[ProposalCategory.EMERGENCY_ACTION] = GovernanceParameters({
            proposalThreshold: 50000 * 10**18,   // 50000 CONS
            votingDelay: 1 hours,
            votingPeriod: 24 hours,
            executionDelay: 1 hours,
            quorumPercentage: 1500,              // 15%
            approvalThreshold: 8000,             // 80%
            gracePeriod: 3 days
        });
        
        // Set default parameters for other categories
        for (uint256 i = 0; i < 8; i++) {
            if (categoryParameters[ProposalCategory(i)].proposalThreshold == 0) {
                categoryParameters[ProposalCategory(i)] = GovernanceParameters({
                    proposalThreshold: 2000 * 10**18,
                    votingDelay: 1 days,
                    votingPeriod: 5 days,
                    executionDelay: 2 days,
                    quorumPercentage: 400,           // 4%
                    approvalThreshold: 5500,         // 55%
                    gracePeriod: 7 days
                });
            }
        }
    }
    
    // Receive ETH deposits
    receive() external payable {
        treasuryBalances[address(0)] += msg.value;
        totalTreasuryValue += msg.value;
        emit TreasuryDeposit(address(0), msg.value, msg.sender);
    }
}