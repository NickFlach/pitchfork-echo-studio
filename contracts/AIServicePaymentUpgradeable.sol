// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title AIServicePaymentUpgradeable
 * @notice Manages payments for AI-enhanced consciousness features (UUPS Upgradeable)
 * @dev Supports multiple tokens, usage-based billing, and automatic deductions
 *      Upgradeable via UUPS; upgrade authority should be the Timelock.
 */
contract AIServicePaymentUpgradeable is
    Initializable,
    AccessControlUpgradeable,
    ReentrancyGuardUpgradeable,
    PausableUpgradeable,
    UUPSUpgradeable
{
    using SafeERC20 for IERC20;

    bytes32 public constant SERVICE_MANAGER_ROLE = keccak256("SERVICE_MANAGER_ROLE");
    bytes32 public constant BILLING_ADMIN_ROLE = keccak256("BILLING_ADMIN_ROLE");
    bytes32 public constant REFUND_MANAGER_ROLE = keccak256("REFUND_MANAGER_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

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
        uint256 minimumStakeRequired;
    }

    struct UserAccount {
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
    mapping(address => mapping(address => uint256)) public userTokenBalances;
    mapping(address => mapping(ServiceType => uint256)) public userDailyUsage;
    mapping(address => mapping(ServiceType => uint256)) public userLastUsageReset;
    mapping(address => mapping(ServiceType => uint256)) public userTotalSpent;
    mapping(bytes32 => PaymentRecord) public paymentRecords;

    // Platform settings
    IERC20 public pforkToken;
    IERC20 public gPforkToken;
    address public treasuryAddress;
    uint256 public platformFeePercentage;
    uint256 public constant MAX_DAILY_QUERIES = 1000;
    uint256 public constant MAX_SPENDING_CAP = 10000 * 10**18;

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
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address _pforkToken,
        address _gPforkToken,
        address _treasuryAddress,
        address _admin,
        address _upgrader
    ) external initializer {
        __AccessControl_init();
        __ReentrancyGuard_init();
        __Pausable_init();
        __UUPSUpgradeable_init();

        pforkToken = IERC20(_pforkToken);
        gPforkToken = IERC20(_gPforkToken);
        treasuryAddress = _treasuryAddress;
        platformFeePercentage = 500; // 5%

        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(SERVICE_MANAGER_ROLE, _admin);
        _grantRole(BILLING_ADMIN_ROLE, _admin);
        _grantRole(REFUND_MANAGER_ROLE, _admin);
        _grantRole(UPGRADER_ROLE, _upgrader);

        _initializeServices();
        _setupSupportedTokens();
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyRole(UPGRADER_ROLE) {}

    /**
     * @notice Fund user account with tokens for AI service payments
     */
    function fundAccount(address token, uint256 amount) external nonReentrant whenNotPaused {
        require(supportedTokens[token], "Token not supported");
        require(amount > 0, "Amount must be positive");

        if (userAccounts[msg.sender].accountCreated == 0) {
            userAccounts[msg.sender].accountCreated = block.timestamp;
            userAccounts[msg.sender].isActive = true;
            userAccounts[msg.sender].dailySpendingLimit = MAX_SPENDING_CAP / 100;
        }

        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        userTokenBalances[msg.sender][token] += amount;

        emit AccountFunded(msg.sender, token, amount);
    }

    /**
     * @notice Fund account with ETH
     */
    function fundAccountETH() external payable nonReentrant whenNotPaused {
        require(msg.value > 0, "Must send ETH");
        require(supportedTokens[address(0)], "ETH not supported");

        if (userAccounts[msg.sender].accountCreated == 0) {
            userAccounts[msg.sender].accountCreated = block.timestamp;
            userAccounts[msg.sender].isActive = true;
            userAccounts[msg.sender].dailySpendingLimit = MAX_SPENDING_CAP / 100;
        }

        userTokenBalances[msg.sender][address(0)] += msg.value;

        emit AccountFunded(msg.sender, address(0), msg.value);
    }

    /**
     * @notice Process payment for AI service usage
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

        _resetDailyUsageIfNeeded(user, serviceType);
        require(
            userDailyUsage[user][serviceType] < serviceConfigs[serviceType].maxQueriesPerDay,
            "Daily query limit exceeded"
        );

        uint256 cost = _calculateServiceCost(user, serviceType);

        require(cost <= userAccounts[user].dailySpendingLimit, "Exceeds daily spending limit");
        require(
            userTotalSpent[user][serviceType] + cost <= userAccounts[user].totalSpendingCap,
            "Exceeds total spending cap"
        );

        require(userTokenBalances[user][paymentToken] >= cost, "Insufficient balance");

        userTokenBalances[user][paymentToken] -= cost;
        userDailyUsage[user][serviceType]++;
        userTotalSpent[user][serviceType] += cost;
        serviceUsageStats[serviceType]++;
        totalPaymentsProcessed++;

        uint256 platformFee = (cost * platformFeePercentage) / 10000;
        uint256 netAmount = cost - platformFee;

        PaymentRecord storage payment = paymentRecords[sessionId];
        payment.user = user;
        payment.serviceType = serviceType;
        payment.paymentToken = paymentToken;
        payment.amount = cost;
        payment.timestamp = block.timestamp;
        payment.sessionId = sessionId;
        payment.wasRefunded = false;

        if (paymentToken == address(0)) {
            (bool sent, ) = payable(treasuryAddress).call{value: netAmount}("");
            require(sent, "ETH transfer failed");
        } else {
            IERC20(paymentToken).safeTransfer(treasuryAddress, netAmount);
        }

        emit ServicePayment(user, serviceType, paymentToken, cost, sessionId);
        return true;
    }

    /**
     * @notice Issue refund for a service payment
     */
    function issueRefund(bytes32 paymentId, string memory /* reason */)
        external
        onlyRole(REFUND_MANAGER_ROLE)
        nonReentrant
    {
        PaymentRecord storage payment = paymentRecords[paymentId];
        require(payment.user != address(0), "Payment not found");
        require(!payment.wasRefunded, "Already refunded");
        require(block.timestamp <= payment.timestamp + 7 days, "Refund period expired");

        payment.wasRefunded = true;
        userAccounts[payment.user].refundableAmount += payment.amount;
        totalRefundsIssued++;

        emit RefundIssued(payment.user, paymentId, payment.amount);
    }

    /**
     * @notice Withdraw refundable amount
     */
    function withdrawRefund(address token) external nonReentrant {
        uint256 refundAmount = userAccounts[msg.sender].refundableAmount;
        require(refundAmount > 0, "No refund available");
        require(supportedTokens[token], "Token not supported");

        userAccounts[msg.sender].refundableAmount = 0;

        if (token == address(0)) {
            (bool sent, ) = payable(msg.sender).call{value: refundAmount}("");
            require(sent, "ETH transfer failed");
        } else {
            IERC20(token).safeTransfer(msg.sender, refundAmount);
        }
    }

    /**
     * @notice Withdraw unused account balance
     */
    function withdrawAccountBalance(address token, uint256 amount) external nonReentrant {
        require(supportedTokens[token], "Token not supported");
        require(userTokenBalances[msg.sender][token] >= amount, "Insufficient balance");

        userTokenBalances[msg.sender][token] -= amount;

        if (token == address(0)) {
            (bool sent, ) = payable(msg.sender).call{value: amount}("");
            require(sent, "ETH transfer failed");
        } else {
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
    function setSupportedToken(address token, bool supported, string memory name, uint8 decimals_)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        supportedTokens[token] = supported;
        if (supported) {
            tokenNames[token] = name;
            tokenDecimals[token] = decimals_;
        }
        emit TokenSupport(token, supported);
    }

    /**
     * @notice Update treasury address
     */
    function setTreasuryAddress(address newTreasury) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newTreasury != address(0), "Invalid treasury address");
        address oldTreasury = treasuryAddress;
        treasuryAddress = newTreasury;
        emit TreasuryUpdated(oldTreasury, newTreasury);
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
        return userTokenBalances[user][token];
    }

    /**
     * @notice Get user service usage for today
     */
    function getUserDailyUsage(address user, ServiceType serviceType) external view returns (uint256) {
        return userDailyUsage[user][serviceType];
    }

    /**
     * @notice Check if user can access service
     */
    function canAccessService(address user, ServiceType serviceType) external view returns (bool, string memory) {
        if (!userAccounts[user].isActive) return (false, "Account not active");
        if (!serviceConfigs[serviceType].isActive) return (false, "Service not active");

        uint256 stakedAmount = gPforkToken.balanceOf(user);
        if (stakedAmount < serviceConfigs[serviceType].minimumStakeRequired) {
            return (false, "Insufficient gPFORK tokens (staked PFORK)");
        }

        if (userDailyUsage[user][serviceType] >= serviceConfigs[serviceType].maxQueriesPerDay) {
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

        uint256 stakedAmount = gPforkToken.balanceOf(user);
        if (stakedAmount > 0) {
            uint256 discount = serviceConfigs[serviceType].discountForStakers;
            baseCost = baseCost * (10000 - discount) / 10000;
        }

        return baseCost;
    }

    function _resetDailyUsageIfNeeded(address user, ServiceType serviceType) internal {
        if (block.timestamp >= userLastUsageReset[user][serviceType] + 1 days) {
            userDailyUsage[user][serviceType] = 0;
            userLastUsageReset[user][serviceType] = block.timestamp;
        }
    }

    function _initializeServices() internal {
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
            config.baseCostPerQuery = (i + 1) * 10**16;
            config.maxQueriesPerDay = 100 - (i * 10);
            config.discountForStakers = 1000 + (i * 500);
            config.isActive = true;
            config.serviceName = services[i];
            config.minimumStakeRequired = (i + 1) * 100 * 10**18;
        }
    }

    function _setupSupportedTokens() internal {
        supportedTokens[address(0)] = true;
        tokenNames[address(0)] = "Ethereum";
        tokenDecimals[address(0)] = 18;

        supportedTokens[address(pforkToken)] = true;
        tokenNames[address(pforkToken)] = "Pitchfork Token";
        tokenDecimals[address(pforkToken)] = 18;
    }

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     */
    uint256[50] private __gap;
}
