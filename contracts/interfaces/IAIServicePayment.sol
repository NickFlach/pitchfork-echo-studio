// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IAIServicePayment
 * @notice Interface for the AI Service Payment contract
 */
interface IAIServicePayment {
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
    
    struct ServiceConfig {
        uint256 baseCostPerQuery;
        uint256 maxQueriesPerDay;
        uint256 discountForCONSHolders;
        bool isActive;
        string serviceName;
        uint256 minimumStakeRequired;
    }
    
    // Events
    event ServicePayment(address indexed user, ServiceType indexed serviceType, address token, uint256 amount, bytes32 sessionId);
    event AccountFunded(address indexed user, address indexed token, uint256 amount);
    event RefundIssued(address indexed user, bytes32 indexed paymentId, uint256 amount);
    event ServiceConfigUpdated(ServiceType indexed serviceType, uint256 newCost, bool isActive);
    event DailyLimitUpdated(address indexed user, uint256 newLimit);
    event TokenSupport(address indexed token, bool supported);
    
    // Core functions
    function fundAccount(address token, uint256 amount) external;
    function fundAccountETH() external payable;
    function processServicePayment(address user, ServiceType serviceType, address paymentToken, bytes32 sessionId) external returns (bool success);
    function issueRefund(bytes32 paymentId, string memory reason) external;
    function withdrawRefund(address token) external;
    function withdrawAccountBalance(address token, uint256 amount) external;
    
    // View functions
    function getUserAccount(address user) external view returns (uint256 dailySpendingLimit, uint256 totalSpendingCap, uint256 accountCreated, bool isActive, uint256 refundableAmount);
    function getUserTokenBalance(address user, address token) external view returns (uint256);
    function getUserDailyUsage(address user, ServiceType serviceType) external view returns (uint256);
    function canAccessService(address user, ServiceType serviceType) external view returns (bool, string memory);
    function serviceConfigs(ServiceType serviceType) external view returns (ServiceConfig memory);
    function supportedTokens(address token) external view returns (bool);
    
    // Admin functions
    function updateServiceConfig(ServiceType serviceType, uint256 baseCost, uint256 maxQueries, uint256 discount, bool isActive, string memory serviceName, uint256 minimumStake) external;
    function setUserDailyLimit(address user, uint256 newLimit) external;
    function setSupportedToken(address token, bool supported, string memory name, uint8 decimals) external;
}