// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./interfaces/IConsciousnessToken.sol";
import "./interfaces/IConsciousnessAchievements.sol";

/**
 * @title LeadershipSubscription
 * @notice Manages tiered subscriptions for leadership development features
 * @dev Implements automatic renewals, governance rights, and revenue distribution
 */
contract LeadershipSubscription is AccessControl, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;
    
    bytes32 public constant SUBSCRIPTION_MANAGER_ROLE = keccak256("SUBSCRIPTION_MANAGER_ROLE");
    bytes32 public constant REVENUE_MANAGER_ROLE = keccak256("REVENUE_MANAGER_ROLE");
    bytes32 public constant GOVERNANCE_ADMIN_ROLE = keccak256("GOVERNANCE_ADMIN_ROLE");
    
    // Subscription tiers
    enum SubscriptionTier {
        NONE,
        BASIC,
        PREMIUM,
        ENTERPRISE
    }
    
    // Subscription structures
    struct TierConfig {
        uint256 monthlyPrice;
        uint256 annualPrice;
        uint256 maxAIQueries;
        uint256 maxAssessments;
        uint256 votingPower;
        bool hasAdvancedAnalytics;
        bool hasPersonalCoaching;
        bool hasAPIAccess;
        bool hasWhiteLabel;
        string[] includedFeatures;
        uint256 consciousnessRequirement; // Minimum consciousness score
        bool isActive;
    }
    
    struct Subscription {
        SubscriptionTier tier;
        uint256 startTime;
        uint256 endTime;
        bool isAnnual;
        bool autoRenewal;
        uint256 lastPayment;
        uint256 totalPaid;
        address paymentToken;
        bool isActive;
        uint256 votingPowerAllocated;
    }
    
    struct RevenueShare {
        address stakeholder;
        uint256 percentage; // Basis points (e.g., 500 = 5%)
        string role;
        bool isActive;
    }
    
    // State variables
    mapping(SubscriptionTier => TierConfig) public tierConfigs;
    mapping(address => Subscription) public subscriptions;
    mapping(address => bool) public supportedPaymentTokens;
    mapping(address => RevenueShare) public revenueShares;
    
    IConsciousnessToken public consciousnessToken;
    IConsciousnessAchievements public achievementContract;
    
    address[] public stakeholders;
    uint256 public totalVotingPower;
    uint256 public totalSubscribers;
    uint256 public totalRevenue;
    
    // Platform settings
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant MONTH_DURATION = 30 days;
    uint256 public constant YEAR_DURATION = 365 days;
    uint256 public gracePeriod = 7 days;
    uint256 public renewalWindow = 3 days;
    
    // Revenue distribution
    mapping(SubscriptionTier => uint256) public tierRevenue;
    mapping(address => uint256) public pendingPayouts;
    
    // Events
    event SubscriptionCreated(address indexed user, SubscriptionTier tier, bool isAnnual, uint256 endTime);
    event SubscriptionRenewed(address indexed user, SubscriptionTier tier, uint256 newEndTime);
    event SubscriptionUpgraded(address indexed user, SubscriptionTier oldTier, SubscriptionTier newTier);
    event SubscriptionCancelled(address indexed user, SubscriptionTier tier);
    event AutoRenewalToggled(address indexed user, bool enabled);
    event TierConfigUpdated(SubscriptionTier tier, uint256 monthlyPrice, uint256 annualPrice);
    event RevenueDistributed(uint256 totalAmount, uint256 timestamp);
    event VotingPowerAllocated(address indexed user, uint256 power);
    event PaymentTokenUpdated(address indexed token, bool supported);
    
    constructor(
        address _consciousnessToken,
        address _achievementContract
    ) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(SUBSCRIPTION_MANAGER_ROLE, msg.sender);
        _grantRole(REVENUE_MANAGER_ROLE, msg.sender);
        _grantRole(GOVERNANCE_ADMIN_ROLE, msg.sender);
        
        consciousnessToken = IConsciousnessToken(_consciousnessToken);
        achievementContract = IConsciousnessAchievements(_achievementContract);
        
        _initializeTierConfigs();
        _setupRevenueShares();
    }
    
    /**
     * @notice Subscribe to a leadership development tier
     * @param tier Subscription tier to purchase
     * @param isAnnual Whether to pay annually (gets discount)
     * @param paymentToken Token to pay with
     * @param enableAutoRenewal Whether to enable automatic renewals
     */
    function subscribe(
        SubscriptionTier tier,
        bool isAnnual,
        address paymentToken,
        bool enableAutoRenewal
    ) external nonReentrant whenNotPaused {
        require(tier != SubscriptionTier.NONE, "Invalid tier");
        require(tierConfigs[tier].isActive, "Tier not available");
        require(supportedPaymentTokens[paymentToken], "Payment token not supported");
        
        // Check consciousness requirement
        uint256 userScore = achievementContract.userConsciousnessScores(msg.sender);
        require(userScore >= tierConfigs[tier].consciousnessRequirement, "Consciousness level too low");
        
        // Cancel existing subscription if active
        if (subscriptions[msg.sender].isActive) {
            _cancelSubscription(msg.sender);
        }
        
        // Calculate price and duration
        uint256 price = isAnnual ? tierConfigs[tier].annualPrice : tierConfigs[tier].monthlyPrice;
        uint256 duration = isAnnual ? YEAR_DURATION : MONTH_DURATION;
        
        // Process payment
        IERC20(paymentToken).safeTransferFrom(msg.sender, address(this), price);
        
        // Create subscription
        Subscription storage sub = subscriptions[msg.sender];
        sub.tier = tier;
        sub.startTime = block.timestamp;
        sub.endTime = block.timestamp + duration;
        sub.isAnnual = isAnnual;
        sub.autoRenewal = enableAutoRenewal;
        sub.lastPayment = block.timestamp;
        sub.totalPaid = price;
        sub.paymentToken = paymentToken;
        sub.isActive = true;
        
        // Allocate voting power
        uint256 votingPower = tierConfigs[tier].votingPower;
        sub.votingPowerAllocated = votingPower;
        totalVotingPower += votingPower;
        
        // Update counters
        totalSubscribers++;
        totalRevenue += price;
        tierRevenue[tier] += price;
        
        // Distribute revenue
        _distributeRevenue(price);
        
        emit SubscriptionCreated(msg.sender, tier, isAnnual, sub.endTime);
        emit VotingPowerAllocated(msg.sender, votingPower);
    }
    
    /**
     * @notice Upgrade subscription to higher tier
     * @param newTier New subscription tier
     */
    function upgradeSubscription(SubscriptionTier newTier) external nonReentrant {
        require(newTier > subscriptions[msg.sender].tier, "Not an upgrade");
        require(subscriptions[msg.sender].isActive, "No active subscription");
        require(tierConfigs[newTier].isActive, "Tier not available");
        
        Subscription storage sub = subscriptions[msg.sender];
        SubscriptionTier oldTier = sub.tier;
        
        // Calculate prorated price difference
        uint256 remainingTime = sub.endTime > block.timestamp ? sub.endTime - block.timestamp : 0;
        require(remainingTime > 0, "Subscription expired");
        
        uint256 oldTierPrice = sub.isAnnual ? tierConfigs[oldTier].annualPrice : tierConfigs[oldTier].monthlyPrice;
        uint256 newTierPrice = sub.isAnnual ? tierConfigs[newTier].annualPrice : tierConfigs[newTier].monthlyPrice;
        uint256 duration = sub.isAnnual ? YEAR_DURATION : MONTH_DURATION;
        
        uint256 proratedDifference = ((newTierPrice - oldTierPrice) * remainingTime) / duration;
        
        // Process upgrade payment
        IERC20(sub.paymentToken).safeTransferFrom(msg.sender, address(this), proratedDifference);
        
        // Update subscription
        uint256 oldVotingPower = sub.votingPowerAllocated;
        uint256 newVotingPower = tierConfigs[newTier].votingPower;
        
        sub.tier = newTier;
        sub.totalPaid += proratedDifference;
        sub.votingPowerAllocated = newVotingPower;
        
        // Update voting power
        totalVotingPower = totalVotingPower - oldVotingPower + newVotingPower;
        
        // Update revenue
        totalRevenue += proratedDifference;
        tierRevenue[newTier] += proratedDifference;
        
        _distributeRevenue(proratedDifference);
        
        emit SubscriptionUpgraded(msg.sender, oldTier, newTier);
        emit VotingPowerAllocated(msg.sender, newVotingPower);
    }
    
    /**
     * @notice Process automatic renewal for eligible subscriptions
     * @param user User to renew subscription for
     */
    function processAutoRenewal(address user) external onlyRole(SUBSCRIPTION_MANAGER_ROLE) {
        Subscription storage sub = subscriptions[user];
        require(sub.isActive, "No active subscription");
        require(sub.autoRenewal, "Auto renewal not enabled");
        require(block.timestamp >= sub.endTime - renewalWindow, "Too early for renewal");
        require(block.timestamp <= sub.endTime + gracePeriod, "Grace period expired");
        
        uint256 price = sub.isAnnual ? tierConfigs[sub.tier].annualPrice : tierConfigs[sub.tier].monthlyPrice;
        uint256 duration = sub.isAnnual ? YEAR_DURATION : MONTH_DURATION;
        
        // Check user's token balance and allowance
        IERC20 paymentToken = IERC20(sub.paymentToken);
        require(paymentToken.balanceOf(user) >= price, "Insufficient balance for renewal");
        require(paymentToken.allowance(user, address(this)) >= price, "Insufficient allowance for renewal");
        
        // Process renewal payment
        paymentToken.safeTransferFrom(user, address(this), price);
        
        // Extend subscription
        sub.endTime = block.timestamp + duration;
        sub.lastPayment = block.timestamp;
        sub.totalPaid += price;
        
        // Update revenue
        totalRevenue += price;
        tierRevenue[sub.tier] += price;
        
        _distributeRevenue(price);
        
        emit SubscriptionRenewed(user, sub.tier, sub.endTime);
    }
    
    /**
     * @notice Cancel subscription and remove voting power
     */
    function cancelSubscription() external {
        require(subscriptions[msg.sender].isActive, "No active subscription");
        _cancelSubscription(msg.sender);
        emit SubscriptionCancelled(msg.sender, subscriptions[msg.sender].tier);
    }
    
    /**
     * @notice Toggle auto-renewal for subscription
     */
    function toggleAutoRenewal(bool enabled) external {
        require(subscriptions[msg.sender].isActive, "No active subscription");
        subscriptions[msg.sender].autoRenewal = enabled;
        emit AutoRenewalToggled(msg.sender, enabled);
    }
    
    /**
     * @notice Check if user has access to specific features
     * @param user User to check
     * @param feature Feature name to check access for
     */
    function hasFeatureAccess(address user, string memory feature) external view returns (bool) {
        if (!isSubscriptionActive(user)) return false;
        
        SubscriptionTier tier = subscriptions[user].tier;
        TierConfig storage config = tierConfigs[tier];
        
        // Check tier-specific features
        if (keccak256(bytes(feature)) == keccak256(bytes("advanced_analytics"))) {
            return config.hasAdvancedAnalytics;
        }
        if (keccak256(bytes(feature)) == keccak256(bytes("personal_coaching"))) {
            return config.hasPersonalCoaching;
        }
        if (keccak256(bytes(feature)) == keccak256(bytes("api_access"))) {
            return config.hasAPIAccess;
        }
        if (keccak256(bytes(feature)) == keccak256(bytes("white_label"))) {
            return config.hasWhiteLabel;
        }
        
        // Check included features
        for (uint256 i = 0; i < config.includedFeatures.length; i++) {
            if (keccak256(bytes(config.includedFeatures[i])) == keccak256(bytes(feature))) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * @notice Check if user's subscription is currently active
     */
    function isSubscriptionActive(address user) public view returns (bool) {
        Subscription storage sub = subscriptions[user];
        return sub.isActive && block.timestamp <= sub.endTime + gracePeriod;
    }
    
    /**
     * @notice Get user's current voting power
     */
    function getVotingPower(address user) external view returns (uint256) {
        if (!isSubscriptionActive(user)) return 0;
        return subscriptions[user].votingPowerAllocated;
    }
    
    /**
     * @notice Get subscription details for user
     */
    function getSubscription(address user) external view returns (
        SubscriptionTier tier,
        uint256 startTime,
        uint256 endTime,
        bool isAnnual,
        bool autoRenewal,
        uint256 totalPaid,
        bool isActive,
        uint256 votingPower
    ) {
        Subscription storage sub = subscriptions[user];
        return (
            sub.tier,
            sub.startTime,
            sub.endTime,
            sub.isAnnual,
            sub.autoRenewal,
            sub.totalPaid,
            isSubscriptionActive(user),
            sub.votingPowerAllocated
        );
    }
    
    /**
     * @notice Update tier configuration
     */
    function updateTierConfig(
        SubscriptionTier tier,
        uint256 monthlyPrice,
        uint256 annualPrice,
        uint256 maxAIQueries,
        uint256 maxAssessments,
        uint256 votingPower,
        bool hasAdvancedAnalytics,
        bool hasPersonalCoaching,
        bool hasAPIAccess,
        bool hasWhiteLabel,
        uint256 consciousnessRequirement,
        bool isActive
    ) external onlyRole(SUBSCRIPTION_MANAGER_ROLE) {
        TierConfig storage config = tierConfigs[tier];
        config.monthlyPrice = monthlyPrice;
        config.annualPrice = annualPrice;
        config.maxAIQueries = maxAIQueries;
        config.maxAssessments = maxAssessments;
        config.votingPower = votingPower;
        config.hasAdvancedAnalytics = hasAdvancedAnalytics;
        config.hasPersonalCoaching = hasPersonalCoaching;
        config.hasAPIAccess = hasAPIAccess;
        config.hasWhiteLabel = hasWhiteLabel;
        config.consciousnessRequirement = consciousnessRequirement;
        config.isActive = isActive;
        
        emit TierConfigUpdated(tier, monthlyPrice, annualPrice);
    }
    
    /**
     * @notice Set payment token support
     */
    function setSupportedPaymentToken(address token, bool supported) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        supportedPaymentTokens[token] = supported;
        emit PaymentTokenUpdated(token, supported);
    }
    
    /**
     * @notice Update revenue share for stakeholder
     */
    function updateRevenueShare(
        address stakeholder,
        uint256 percentage,
        string memory role,
        bool isActive
    ) external onlyRole(REVENUE_MANAGER_ROLE) {
        require(percentage <= BASIS_POINTS, "Invalid percentage");
        
        if (revenueShares[stakeholder].stakeholder == address(0)) {
            stakeholders.push(stakeholder);
        }
        
        revenueShares[stakeholder] = RevenueShare({
            stakeholder: stakeholder,
            percentage: percentage,
            role: role,
            isActive: isActive
        });
    }
    
    /**
     * @notice Claim pending revenue payout
     */
    function claimRevenuePayout() external nonReentrant {
        uint256 amount = pendingPayouts[msg.sender];
        require(amount > 0, "No pending payout");
        
        pendingPayouts[msg.sender] = 0;
        
        // For simplicity, assume CONS token payouts
        consciousnessToken.transfer(msg.sender, amount);
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
    
    // Internal functions
    function _cancelSubscription(address user) internal {
        Subscription storage sub = subscriptions[user];
        
        // Remove voting power
        totalVotingPower -= sub.votingPowerAllocated;
        sub.votingPowerAllocated = 0;
        
        // Deactivate subscription
        sub.isActive = false;
        sub.autoRenewal = false;
        
        totalSubscribers--;
    }
    
    function _distributeRevenue(uint256 amount) internal {
        for (uint256 i = 0; i < stakeholders.length; i++) {
            address stakeholder = stakeholders[i];
            RevenueShare storage share = revenueShares[stakeholder];
            
            if (share.isActive && share.percentage > 0) {
                uint256 payout = (amount * share.percentage) / BASIS_POINTS;
                pendingPayouts[stakeholder] += payout;
            }
        }
        
        emit RevenueDistributed(amount, block.timestamp);
    }
    
    function _initializeTierConfigs() internal {
        // Basic Tier
        TierConfig storage basic = tierConfigs[SubscriptionTier.BASIC];
        basic.monthlyPrice = 50 * 10**18; // 50 CONS
        basic.annualPrice = 500 * 10**18; // 500 CONS (2 months free)
        basic.maxAIQueries = 100;
        basic.maxAssessments = 5;
        basic.votingPower = 1;
        basic.hasAdvancedAnalytics = false;
        basic.hasPersonalCoaching = false;
        basic.hasAPIAccess = false;
        basic.hasWhiteLabel = false;
        basic.consciousnessRequirement = 100;
        basic.isActive = true;
        
        // Premium Tier  
        TierConfig storage premium = tierConfigs[SubscriptionTier.PREMIUM];
        premium.monthlyPrice = 150 * 10**18;
        premium.annualPrice = 1500 * 10**18;
        premium.maxAIQueries = 500;
        premium.maxAssessments = 20;
        premium.votingPower = 5;
        premium.hasAdvancedAnalytics = true;
        premium.hasPersonalCoaching = true;
        premium.hasAPIAccess = false;
        premium.hasWhiteLabel = false;
        premium.consciousnessRequirement = 300;
        premium.isActive = true;
        
        // Enterprise Tier
        TierConfig storage enterprise = tierConfigs[SubscriptionTier.ENTERPRISE];
        enterprise.monthlyPrice = 500 * 10**18;
        enterprise.annualPrice = 5000 * 10**18;
        enterprise.maxAIQueries = 2000;
        enterprise.maxAssessments = 100;
        enterprise.votingPower = 20;
        enterprise.hasAdvancedAnalytics = true;
        enterprise.hasPersonalCoaching = true;
        enterprise.hasAPIAccess = true;
        enterprise.hasWhiteLabel = true;
        enterprise.consciousnessRequirement = 500;
        enterprise.isActive = true;
    }
    
    function _setupRevenueShares() internal {
        // Platform development: 40%
        revenueShares[msg.sender] = RevenueShare({
            stakeholder: msg.sender,
            percentage: 4000,
            role: "Platform Development",
            isActive: true
        });
        stakeholders.push(msg.sender);
        
        // Note: Additional stakeholders can be added via updateRevenueShare
    }
}