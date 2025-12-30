// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title AIServicePayment
 * @notice Manages payments for AI-enhanced consciousness features
 * @dev Supports multiple tokens, usage-based billing, and automatic deductions
 */
contract AIServicePayment is AccessControl, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;
    
    bytes32 public constant SERVICE_MANAGER_ROLE = keccak256("SERVICE_MANAGER_ROLE");
    bytes32 public constant BILLING_ADMIN_ROLE = keccak256("BILLING_ADMIN_ROLE");
    bytes32 public constant REFUND_MANAGER_ROLE = keccak256("REFUND_MANAGER_ROLE");
    
    // Service types
    enum ServiceType {
        CONSCIOUSNESS_ANALYSIS,
        STRATEGIC_INSIGHTS,
        DECISION_SYNTHESIS,
        PATTERN_RECOGNITION,
        WISDOM_INTEGRATION,
        CRISIS_MANAGEMENT,
        LEADERSHIP_COACHING,
        REFLECTION_GUIDANCE
    }
    
    // Payment structures
    struct ServiceConfig {
        uint256 baseCostPerQuery;
        uint256 maxQueriesPerDay;
        uint256 discountForStakers;
        bool isActive;
        string serviceName;
        uint256 minimumStakeRequired; // Minimum gPFORK tokens (staked PFORK) for access
    }
    
    struct UserAccount {
        mapping(address => uint256) tokenBalances; // Pre-funded balances for each token
        mapping(ServiceType => uint256) dailyUsage;
        mapping(ServiceType => uint256) lastUsageReset;
        mapping(ServiceType => uint256) totalSpent;
        uint256 dailySpendingLimit;
        uint256 totalSpendingCap;
        uint256 accountCreated;
        bool isActive;
        uint256 refundableAmount;
    }
    
    struct PaymentRecord {
        address user;
        ServiceType serviceType;
        address paymentToken;
        uint256 amount;
        uint256 timestamp;
        bytes32 sessionId;
        bool wasRefunded;
    }
    
    // Supported tokens
    mapping(address => bool) public supportedTokens;
    mapping(address => string) public tokenNames;
    mapping(address => uint8) public tokenDecimals;
    
    // Service configurations
    mapping(ServiceType => ServiceConfig) public serviceConfigs;
    
    // User accounts and payments
    mapping(address => UserAccount) public userAccounts;
    mapping(bytes32 => PaymentRecord) public paymentRecords;
    
    // Platform settings
    IERC20 public pforkToken;
    IERC20 public gPforkToken;
    address public treasuryAddress;
    uint256 public platformFeePercentage = 500; // 5% in basis points
    uint256 public constant MAX_DAILY_QUERIES = 1000;
    uint256 public constant MAX_SPENDING_CAP = 10000 * 10**18; // 10,000 tokens max
    
    // State tracking
    uint256 public totalPaymentsProcessed;
    uint256 public totalRefundsIssued;
    mapping(ServiceType => uint256) public serviceUsageStats;
    
    // Events
    event ServicePayment(address indexed user, ServiceType indexed serviceType, address token, uint256 amount, bytes32 sessionId);
    event AccountFunded(address indexed user, address indexed token, uint256 amount);
    event RefundIssued(address indexed user, bytes32 indexed paymentId, uint256 amount);
    event ServiceConfigUpdated(ServiceType indexed serviceType, uint256 newCost, bool isActive);
    event DailyLimitUpdated(address indexed user, uint256 newLimit);
    event TokenSupport(address indexed token, bool supported);
    event EmergencyWithdrawal(address indexed token, uint256 amount);
    
    constructor(
        address _pforkToken,
        address _gPforkToken,
        address _treasuryAddress
    ) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(SERVICE_MANAGER_ROLE, msg.sender);
        _grantRole(BILLING_ADMIN_ROLE, msg.sender);
        _grantRole(REFUND_MANAGER_ROLE, msg.sender);
        
        pforkToken = IERC20(_pforkToken);
        gPforkToken = IERC20(_gPforkToken);
        treasuryAddress = _treasuryAddress;
        
        _initializeServices();
        _setupSupportedTokens();
    }
    
    /**
     * @notice Fund user account with tokens for AI service payments
     * @param token Token address to fund with
     * @param amount Amount of tokens to fund
     */
    function fundAccount(address token, uint256 amount) external nonReentrant whenNotPaused {
        require(supportedTokens[token], "Token not supported");
        require(amount > 0, "Amount must be positive");
        
        // Create account if doesn't exist
        if (userAccounts[msg.sender].accountCreated == 0) {
            userAccounts[msg.sender].accountCreated = block.timestamp;
            userAccounts[msg.sender].isActive = true;
            userAccounts[msg.sender].dailySpendingLimit = MAX_SPENDING_CAP / 100; // 1% of max as default
        }
        
        // Transfer tokens to contract
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        
        // Update user balance
        userAccounts[msg.sender].tokenBalances[token] += amount;
        
        emit AccountFunded(msg.sender, token, amount);
    }
    
    /**
     * @notice Fund account with ETH
     */
    function fundAccountETH() external payable nonReentrant whenNotPaused {
        require(msg.value > 0, "Must send ETH");
        require(supportedTokens[address(0)], "ETH not supported"); // address(0) represents ETH
        
        // Create account if doesn't exist
        if (userAccounts[msg.sender].accountCreated == 0) {
            userAccounts[msg.sender].accountCreated = block.timestamp;
            userAccounts[msg.sender].isActive = true;
            userAccounts[msg.sender].dailySpendingLimit = MAX_SPENDING_CAP / 100;
        }
        
        // Update ETH balance
        userAccounts[msg.sender].tokenBalances[address(0)] += msg.value;
        
        emit AccountFunded(msg.sender, address(0), msg.value);
    }
    
    /**
     * @notice Process payment for AI service usage
     * @param user User requesting the service
     * @param serviceType Type of AI service
     * @param paymentToken Token to pay with
     * @param sessionId Unique session identifier
     */
    function processServicePayment(
        address user,
        ServiceType serviceType,
        address paymentToken,
        bytes32 sessionId
    ) external onlyRole(SERVICE_MANAGER_ROLE) nonReentrant whenNotPaused returns (bool success) {
        require(userAccounts[user].isActive, "User account not active");
        require(supportedTokens[paymentToken], "Payment token not supported");
        require(serviceConfigs[serviceType].isActive, "Service not active");
        
        // Check daily usage limits
        _resetDailyUsageIfNeeded(user, serviceType);
        require(
            userAccounts[user].dailyUsage[serviceType] < serviceConfigs[serviceType].maxQueriesPerDay,
            "Daily query limit exceeded"
        );
        
        // Calculate service cost with discounts
        uint256 cost = _calculateServiceCost(user, serviceType);
        
        // Check spending limits
        require(cost <= userAccounts[user].dailySpendingLimit, "Exceeds daily spending limit");
        require(
            userAccounts[user].totalSpent[serviceType] + cost <= userAccounts[user].totalSpendingCap,
            "Exceeds total spending cap"
        );
        
        // Check balance and process payment
        require(userAccounts[user].tokenBalances[paymentToken] >= cost, "Insufficient balance");
        
        // Deduct from user balance
        userAccounts[user].tokenBalances[paymentToken] -= cost;
        
        // Update usage tracking
        userAccounts[user].dailyUsage[serviceType]++;
        userAccounts[user].totalSpent[serviceType] += cost;
        serviceUsageStats[serviceType]++;
        totalPaymentsProcessed++;
        
        // Calculate platform fee
        uint256 platformFee = (cost * platformFeePercentage) / 10000;
        uint256 netAmount = cost - platformFee;
        
        // Create payment record
        PaymentRecord storage payment = paymentRecords[sessionId];
        payment.user = user;
        payment.serviceType = serviceType;
        payment.paymentToken = paymentToken;
        payment.amount = cost;
        payment.timestamp = block.timestamp;
        payment.sessionId = sessionId;
        payment.wasRefunded = false;
        
        // Transfer to treasury
        if (paymentToken == address(0)) {
            // ETH payment
            (bool sent, ) = payable(treasuryAddress).call{value: netAmount}("");
            require(sent, "ETH transfer failed");
        } else {
            // ERC20 payment
            IERC20(paymentToken).safeTransfer(treasuryAddress, netAmount);
        }
        
        emit ServicePayment(user, serviceType, paymentToken, cost, sessionId);
        return true;
    }
    
    /**
     * @notice Issue refund for a service payment
     * @param paymentId Payment session ID to refund
     * @param reason Refund reason
     */
    function issueRefund(bytes32 paymentId, string memory reason) 
        external 
        onlyRole(REFUND_MANAGER_ROLE) 
        nonReentrant 
    {
        PaymentRecord storage payment = paymentRecords[paymentId];
        require(payment.user != address(0), "Payment not found");
        require(!payment.wasRefunded, "Already refunded");
        require(block.timestamp <= payment.timestamp + 7 days, "Refund period expired");
        
        payment.wasRefunded = true;
        
        // Add to refundable amount
        userAccounts[payment.user].refundableAmount += payment.amount;
        totalRefundsIssued++;
        
        emit RefundIssued(payment.user, paymentId, payment.amount);
    }
    
    /**
     * @notice Withdraw refundable amount
     * @param token Token to withdraw
     */
    function withdrawRefund(address token) external nonReentrant {
        uint256 refundAmount = userAccounts[msg.sender].refundableAmount;
        require(refundAmount > 0, "No refund available");
        require(supportedTokens[token], "Token not supported");
        
        userAccounts[msg.sender].refundableAmount = 0;
        
        if (token == address(0)) {
            // ETH refund
            (bool sent, ) = payable(msg.sender).call{value: refundAmount}("");
            require(sent, "ETH transfer failed");
        } else {
            // ERC20 refund
            IERC20(token).safeTransfer(msg.sender, refundAmount);
        }
    }
    
    /**
     * @notice Withdraw unused account balance
     * @param token Token to withdraw
     * @param amount Amount to withdraw
     */
    function withdrawAccountBalance(address token, uint256 amount) external nonReentrant {
        require(supportedTokens[token], "Token not supported");
        require(userAccounts[msg.sender].tokenBalances[token] >= amount, "Insufficient balance");
        
        userAccounts[msg.sender].tokenBalances[token] -= amount;
        
        if (token == address(0)) {
            // ETH withdrawal
            (bool sent, ) = payable(msg.sender).call{value: amount}("");
            require(sent, "ETH transfer failed");
        } else {
            // ERC20 withdrawal
            IERC20(token).safeTransfer(msg.sender, amount);
        }
    }
    
    /**
     * @notice Update service configuration
     */
    function updateServiceConfig(
        ServiceType serviceType,
        uint256 baseCost,
        uint256 maxQueries,
        uint256 discount,
        bool isActive,
        string memory serviceName,
        uint256 minimumStake
    ) external onlyRole(SERVICE_MANAGER_ROLE) {
        ServiceConfig storage config = serviceConfigs[serviceType];
        config.baseCostPerQuery = baseCost;
        config.maxQueriesPerDay = maxQueries;
        config.discountForStakers = discount;
        config.isActive = isActive;
        config.serviceName = serviceName;
        config.minimumStakeRequired = minimumStake;
        
        emit ServiceConfigUpdated(serviceType, baseCost, isActive);
    }
    
    /**
     * @notice Set user daily spending limit
     */
    function setUserDailyLimit(address user, uint256 newLimit) 
        external 
        onlyRole(BILLING_ADMIN_ROLE) 
    {
        require(newLimit <= MAX_SPENDING_CAP, "Exceeds maximum cap");
        userAccounts[user].dailySpendingLimit = newLimit;
        emit DailyLimitUpdated(user, newLimit);
    }
    
    /**
     * @notice Add or remove token support
     */
    function setSupportedToken(address token, bool supported, string memory name, uint8 decimals) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        supportedTokens[token] = supported;
        if (supported) {
            tokenNames[token] = name;
            tokenDecimals[token] = decimals;
        }
        emit TokenSupport(token, supported);
    }
    
    /**
     * @notice Get user account details
     */
    function getUserAccount(address user) external view returns (
        uint256 dailySpendingLimit,
        uint256 totalSpendingCap,
        uint256 accountCreated,
        bool isActive,
        uint256 refundableAmount
    ) {
        UserAccount storage account = userAccounts[user];
        return (
            account.dailySpendingLimit,
            account.totalSpendingCap,
            account.accountCreated,
            account.isActive,
            account.refundableAmount
        );
    }
    
    /**
     * @notice Get user token balance
     */
    function getUserTokenBalance(address user, address token) external view returns (uint256) {
        return userAccounts[user].tokenBalances[token];
    }
    
    /**
     * @notice Get user service usage for today
     */
    function getUserDailyUsage(address user, ServiceType serviceType) external view returns (uint256) {
        return userAccounts[user].dailyUsage[serviceType];
    }
    
    /**
     * @notice Check if user can access service
     */
    function canAccessService(address user, ServiceType serviceType) external view returns (bool, string memory) {
        if (!userAccounts[user].isActive) return (false, "Account not active");
        if (!serviceConfigs[serviceType].isActive) return (false, "Service not active");
        
        // Check gPFORK staking requirement
        uint256 stakedAmount = gPforkToken.balanceOf(user);
        if (stakedAmount < serviceConfigs[serviceType].minimumStakeRequired) {
            return (false, "Insufficient gPFORK tokens (staked PFORK)");
        }
        
        // Check daily limits
        if (userAccounts[user].dailyUsage[serviceType] >= serviceConfigs[serviceType].maxQueriesPerDay) {
            return (false, "Daily query limit reached");
        }
        
        return (true, "Access granted");
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
    function _calculateServiceCost(address user, ServiceType serviceType) internal view returns (uint256) {
        uint256 baseCost = serviceConfigs[serviceType].baseCostPerQuery;
        
        // Apply staker discount based on gPFORK balance
        uint256 stakedAmount = gPforkToken.balanceOf(user);
        if (stakedAmount > 0) {
            uint256 discount = serviceConfigs[serviceType].discountForStakers;
            baseCost = baseCost * (10000 - discount) / 10000;
        }
        
        return baseCost;
    }
    
    function _resetDailyUsageIfNeeded(address user, ServiceType serviceType) internal {
        if (block.timestamp >= userAccounts[user].lastUsageReset[serviceType] + 1 days) {
            userAccounts[user].dailyUsage[serviceType] = 0;
            userAccounts[user].lastUsageReset[serviceType] = block.timestamp;
        }
    }
    
    function _initializeServices() internal {
        // Initialize service configurations
        string[8] memory services = [
            "Consciousness Analysis",
            "Strategic Insights", 
            "Decision Synthesis",
            "Pattern Recognition",
            "Wisdom Integration",
            "Crisis Management",
            "Leadership Coaching",
            "Reflection Guidance"
        ];
        
        for (uint256 i = 0; i < 8; i++) {
            ServiceConfig storage config = serviceConfigs[ServiceType(i)];
            config.baseCostPerQuery = (i + 1) * 10**16; // 0.01 ETH base, increasing
            config.maxQueriesPerDay = 100 - (i * 10); // Decreasing limits for premium services
            config.discountForStakers = 1000 + (i * 500); // 10-45% discount range
            config.isActive = true;
            config.serviceName = services[i];
            config.minimumStakeRequired = (i + 1) * 100 * 10**18; // 100-800 gPFORK staking requirement
        }
    }
    
    function _setupSupportedTokens() internal {
        // ETH support
        supportedTokens[address(0)] = true;
        tokenNames[address(0)] = "Ethereum";
        tokenDecimals[address(0)] = 18;
        
        // PFORK token support
        supportedTokens[address(pforkToken)] = true;
        tokenNames[address(pforkToken)] = "Pitchfork Token";
        tokenDecimals[address(pforkToken)] = 18;
    }
}