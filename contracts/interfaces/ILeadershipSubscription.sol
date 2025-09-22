// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ILeadershipSubscription
 * @notice Interface for the Leadership Subscription contract
 */
interface ILeadershipSubscription {
    enum SubscriptionTier {
        NONE,
        BASIC,
        PREMIUM,
        ENTERPRISE
    }
    
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
        uint256 consciousnessRequirement;
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
    
    // Events
    event SubscriptionCreated(address indexed user, SubscriptionTier tier, bool isAnnual, uint256 endTime);
    event SubscriptionRenewed(address indexed user, SubscriptionTier tier, uint256 newEndTime);
    event SubscriptionUpgraded(address indexed user, SubscriptionTier oldTier, SubscriptionTier newTier);
    event SubscriptionCancelled(address indexed user, SubscriptionTier tier);
    event AutoRenewalToggled(address indexed user, bool enabled);
    event VotingPowerAllocated(address indexed user, uint256 power);
    
    // Core functions
    function subscribe(SubscriptionTier tier, bool isAnnual, address paymentToken, bool enableAutoRenewal) external;
    function upgradeSubscription(SubscriptionTier newTier) external;
    function processAutoRenewal(address user) external;
    function cancelSubscription() external;
    function toggleAutoRenewal(bool enabled) external;
    
    // View functions
    function hasFeatureAccess(address user, string memory feature) external view returns (bool);
    function isSubscriptionActive(address user) external view returns (bool);
    function getVotingPower(address user) external view returns (uint256);
    function getSubscription(address user) external view returns (SubscriptionTier, uint256, uint256, bool, bool, uint256, bool, uint256);
    function tierConfigs(SubscriptionTier tier) external view returns (TierConfig memory);
    function supportedPaymentTokens(address token) external view returns (bool);
    
    // Admin functions
    function updateTierConfig(SubscriptionTier tier, uint256 monthlyPrice, uint256 annualPrice, uint256 maxAIQueries, uint256 maxAssessments, uint256 votingPower, bool hasAdvancedAnalytics, bool hasPersonalCoaching, bool hasAPIAccess, bool hasWhiteLabel, uint256 consciousnessRequirement, bool isActive) external;
    function setSupportedPaymentToken(address token, bool supported) external;
}