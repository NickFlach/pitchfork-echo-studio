// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/governance/utils/IVotes.sol";
import "./interfaces/IBalanceOfPower.sol";
import "./interfaces/IDecentralizationMetrics.sol";

/**
 * @title PowerDiffusion
 * @notice Implements mandatory power diffusion mechanisms
 * @dev Based on Vitalik's "Balance of Power" essay principles:
 * 
 * "The solution: mandate more diffusion."
 * 
 * "We can also come up with other ideas in this direction: for example, 
 * we could imagine governments making mechanisms inspired by the EU carbon 
 * border adjustment mechanism, but charging the tax on (domestic or foreign) 
 * products in proportion to some measure of how proprietary a product is: 
 * if you share the technology with us, including by open-sourcing it, 
 * the tax drops to zero."
 * 
 * This contract incentivizes power distribution by:
 * 1. Collecting "concentration fees" from large holders
 * 2. Redistributing to smaller holders
 * 3. Providing bonus rewards for delegation diversity
 */
contract PowerDiffusion is IBalanceOfPower, AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    bytes32 public constant DIFFUSION_ADMIN_ROLE = keccak256("DIFFUSION_ADMIN_ROLE");
    bytes32 public constant METRICS_ROLE = keccak256("METRICS_ROLE");
    
    IVotes public immutable votingToken;
    IERC20 public immutable rewardToken;
    IDecentralizationMetrics public metricsContract;
    
    DiffusionPolicy public policy;
    DecentralizationMetrics internal _metrics;
    
    // Diffusion pool
    uint256 public diffusionPool;
    uint256 public lastDiffusionTime;
    
    // Eligible recipients tracking
    mapping(address => uint256) public pendingDiffusion;
    mapping(address => uint256) public lastClaimTime;
    address[] public eligibleRecipients;
    mapping(address => bool) public isEligible;
    
    // Veto tracking (for IBalanceOfPower interface)
    mapping(uint256 => VetoData) public vetoData;
    
    struct VetoData {
        bool active;
        uint256 vetoVotes;
        uint256 threshold;
        uint256 deadline;
        address initiator;
    }
    
    uint256 public constant BASIS_POINTS = 10000;
    
    event DiffusionPoolFunded(uint256 amount, address indexed funder);
    event DiffusionClaimed(address indexed recipient, uint256 amount);
    event PolicyUpdated(uint256 maxPowerShare, uint256 diffusionRate, uint256 diffusionPeriod);
    event ConcentrationFeeCollected(address indexed holder, uint256 feeAmount, uint256 excessPower);
    
    constructor(
        address _votingToken,
        address _rewardToken,
        address _metricsContract,
        address _admin
    ) {
        votingToken = IVotes(_votingToken);
        rewardToken = IERC20(_rewardToken);
        metricsContract = IDecentralizationMetrics(_metricsContract);
        
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(DIFFUSION_ADMIN_ROLE, _admin);
        _grantRole(METRICS_ROLE, _metricsContract);
        
        // Default policy
        policy = DiffusionPolicy({
            maxPowerShare: 1500,        // 15% max for any single holder
            diffusionRate: 100,          // 1% of excess redistributed per period
            diffusionPeriod: 7 days,
            smallHolderThreshold: 1000,  // < 10% = small holder
            isActive: true
        });
        
        lastDiffusionTime = block.timestamp;
    }
    
    // ============ Dual Governance (IBalanceOfPower) ============
    
    function initiateVeto(uint256 proposalId, string calldata reason) external override {
        require(!vetoData[proposalId].active, "Veto already active");
        
        uint256 votingPower = votingToken.getVotes(msg.sender);
        uint256 totalSupply = votingToken.getPastTotalSupply(block.number - 1);
        uint256 threshold = (totalSupply * 1000) / BASIS_POINTS; // 10% threshold
        
        vetoData[proposalId] = VetoData({
            active: true,
            vetoVotes: votingPower,
            threshold: threshold,
            deadline: block.timestamp + 7 days,
            initiator: msg.sender
        });
        
        emit VetoInitiated(proposalId, msg.sender, votingPower, threshold);
    }
    
    function voteOnVeto(uint256 proposalId, bool support) external override {
        VetoData storage veto = vetoData[proposalId];
        require(veto.active, "No active veto");
        require(block.timestamp < veto.deadline, "Veto deadline passed");
        
        if (support) {
            veto.vetoVotes += votingToken.getVotes(msg.sender);
        }
    }
    
    function executeVeto(uint256 proposalId) external override {
        VetoData storage veto = vetoData[proposalId];
        require(veto.active, "No active veto");
        require(veto.vetoVotes >= veto.threshold, "Threshold not met");
        
        veto.active = false;
        // Proposal would be cancelled in the governor contract
    }
    
    function canVeto(uint256 proposalId) external view override returns (bool) {
        return !vetoData[proposalId].active;
    }
    
    function getVetoStatus(uint256 proposalId) external view override returns (
        bool vetoActive,
        uint256 vetoVotes,
        uint256 threshold,
        uint256 deadline
    ) {
        VetoData storage veto = vetoData[proposalId];
        return (veto.active, veto.vetoVotes, veto.threshold, veto.deadline);
    }
    
    // ============ Decentralization Metrics (IBalanceOfPower) ============
    
    function updateDecentralizationMetrics() external override {
        metricsContract.calculateMetrics();
    }
    
    function getDecentralizationMetrics() external view override returns (DecentralizationMetrics memory) {
        IDecentralizationMetrics.FullMetrics memory fullMetrics = metricsContract.getCurrentMetrics();
        
        return DecentralizationMetrics({
            nakamotoCoefficient: fullMetrics.nakamotoCoefficient,
            giniCoefficient: fullMetrics.giniCoefficient,
            topTenConcentration: fullMetrics.topTenPercent,
            activeVoterPercentage: fullMetrics.averageTurnout,
            uniqueProposers: fullMetrics.uniqueProposers,
            overallScore: fullMetrics.decentralizationScore,
            lastUpdated: fullMetrics.timestamp
        });
    }
    
    function getNakamotoCoefficient() external view override returns (uint256) {
        return metricsContract.getMetric(IDecentralizationMetrics.MetricType.NAKAMOTO_COEFFICIENT);
    }
    
    function isPowerConcentrated() external view override returns (bool concentrated, string memory level) {
        IDecentralizationMetrics.HealthStatus status = metricsContract.getHealthStatus();
        
        if (status == IDecentralizationMetrics.HealthStatus.CRITICAL) {
            return (true, "CRITICAL");
        } else if (status == IDecentralizationMetrics.HealthStatus.HIGH_RISK) {
            return (true, "HIGH_RISK");
        } else if (status == IDecentralizationMetrics.HealthStatus.MODERATE_RISK) {
            return (true, "MODERATE_RISK");
        }
        return (false, "HEALTHY");
    }
    
    function getTopPowerHolders(uint256 count) external view override returns (PowerHolder[] memory) {
        (
            address[] memory holders,
            uint256[] memory balances,
            uint256[] memory percentages
        ) = metricsContract.getTopHolders(count);
        
        PowerHolder[] memory result = new PowerHolder[](holders.length);
        
        for (uint256 i = 0; i < holders.length; i++) {
            result[i] = PowerHolder({
                holder: holders[i],
                votingPower: balances[i],
                shareOfTotal: percentages[i],
                delegatedFrom: 0, // Would need delegation tracking
                isConcentrationRisk: percentages[i] > policy.maxPowerShare
            });
        }
        
        return result;
    }
    
    // ============ Diffusion Mechanisms (IBalanceOfPower) ============
    
    function setDiffusionPolicy(DiffusionPolicy calldata _policy) external override onlyRole(DIFFUSION_ADMIN_ROLE) {
        require(_policy.maxPowerShare >= 500 && _policy.maxPowerShare <= 5000, "Invalid max power share");
        require(_policy.diffusionRate <= 1000, "Diffusion rate too high"); // Max 10%
        require(_policy.diffusionPeriod >= 1 days, "Period too short");
        
        policy = _policy;
        emit PolicyUpdated(_policy.maxPowerShare, _policy.diffusionRate, _policy.diffusionPeriod);
    }
    
    function getDiffusionPolicy() external view override returns (DiffusionPolicy memory) {
        return policy;
    }
    
    /**
     * @notice Execute diffusion - redistribute power from large to small holders
     * @dev Anyone can call this, but it only executes once per period
     */
    function executeDiffusion() external override nonReentrant {
        require(policy.isActive, "Diffusion not active");
        require(block.timestamp >= lastDiffusionTime + policy.diffusionPeriod, "Too soon");
        
        lastDiffusionTime = block.timestamp;
        
        if (diffusionPool == 0) return;
        
        // Calculate eligible recipients and their shares
        uint256 totalEligiblePower = 0;
        uint256 eligibleCount = 0;
        
        for (uint256 i = 0; i < eligibleRecipients.length; i++) {
            address recipient = eligibleRecipients[i];
            uint256 power = votingToken.getVotes(recipient);
            uint256 totalSupply = votingToken.getPastTotalSupply(block.number - 1);
            uint256 share = (power * BASIS_POINTS) / totalSupply;
            
            if (share < policy.smallHolderThreshold) {
                totalEligiblePower += power;
                eligibleCount++;
            }
        }
        
        if (eligibleCount == 0 || totalEligiblePower == 0) return;
        
        // Distribute pool proportionally to eligible holders
        uint256 toDistribute = diffusionPool;
        
        address[] memory recipients = new address[](eligibleCount);
        uint256[] memory amounts = new uint256[](eligibleCount);
        uint256 idx = 0;
        
        for (uint256 i = 0; i < eligibleRecipients.length && idx < eligibleCount; i++) {
            address recipient = eligibleRecipients[i];
            uint256 power = votingToken.getVotes(recipient);
            uint256 totalSupply = votingToken.getPastTotalSupply(block.number - 1);
            uint256 share = (power * BASIS_POINTS) / totalSupply;
            
            if (share < policy.smallHolderThreshold) {
                uint256 amount = (toDistribute * power) / totalEligiblePower;
                pendingDiffusion[recipient] += amount;
                recipients[idx] = recipient;
                amounts[idx] = amount;
                idx++;
            }
        }
        
        diffusionPool = 0;
        
        emit DiffusionExecuted(address(this), recipients, amounts, "Periodic diffusion");
    }
    
    function isEligibleForDiffusion(address holder) external view override returns (bool) {
        uint256 power = votingToken.getVotes(holder);
        uint256 totalSupply = votingToken.getPastTotalSupply(block.number - 1);
        if (totalSupply == 0) return false;
        
        uint256 share = (power * BASIS_POINTS) / totalSupply;
        return share < policy.smallHolderThreshold;
    }
    
    function getPendingDiffusion(address holder) external view override returns (uint256) {
        return pendingDiffusion[holder];
    }
    
    function claimDiffusion() external override nonReentrant {
        uint256 amount = pendingDiffusion[msg.sender];
        require(amount > 0, "Nothing to claim");
        
        pendingDiffusion[msg.sender] = 0;
        lastClaimTime[msg.sender] = block.timestamp;
        
        rewardToken.safeTransfer(msg.sender, amount);
        
        emit DiffusionClaimed(msg.sender, amount);
    }
    
    // ============ Power Limits (IBalanceOfPower) ============
    
    function wouldExceedPowerLimit(
        address from,
        address to,
        uint256 amount
    ) external view override returns (bool exceeds, uint256 limit) {
        uint256 totalSupply = votingToken.getPastTotalSupply(block.number - 1);
        limit = (totalSupply * policy.maxPowerShare) / BASIS_POINTS;
        
        uint256 currentPower = votingToken.getVotes(to);
        uint256 newPower = currentPower + amount;
        
        exceeds = newPower > limit;
        return (exceeds, limit);
    }
    
    function getMaxPowerShare() external view override returns (uint256) {
        return policy.maxPowerShare;
    }
    
    function setEmergencyPowerCeiling(uint256 ceiling) external override onlyRole(DEFAULT_ADMIN_ROLE) {
        require(ceiling >= 500 && ceiling <= 5000, "Invalid ceiling");
        policy.maxPowerShare = ceiling;
    }
    
    // ============ Admin Functions ============
    
    /**
     * @notice Fund the diffusion pool
     */
    function fundDiffusionPool(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be positive");
        rewardToken.safeTransferFrom(msg.sender, address(this), amount);
        diffusionPool += amount;
        emit DiffusionPoolFunded(amount, msg.sender);
    }
    
    /**
     * @notice Register address as eligible for diffusion
     */
    function registerEligible(address holder) external {
        if (!isEligible[holder]) {
            eligibleRecipients.push(holder);
            isEligible[holder] = true;
        }
    }
    
    /**
     * @notice Update metrics contract address
     */
    function setMetricsContract(address _metricsContract) external onlyRole(DEFAULT_ADMIN_ROLE) {
        metricsContract = IDecentralizationMetrics(_metricsContract);
    }
    
    /**
     * @notice Collect concentration fee from large holder (called by token transfer hooks)
     */
    function collectConcentrationFee(address holder, uint256 excessPower) external onlyRole(METRICS_ROLE) {
        uint256 fee = (excessPower * policy.diffusionRate) / BASIS_POINTS;
        
        if (fee > 0) {
            // Fee would be collected via token transfer hook
            diffusionPool += fee;
            emit ConcentrationFeeCollected(holder, fee, excessPower);
        }
    }
}
