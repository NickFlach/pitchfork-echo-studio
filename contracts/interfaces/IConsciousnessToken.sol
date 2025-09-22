// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title IConsciousnessToken
 * @notice Interface for the Consciousness Token contract
 */
interface IConsciousnessToken is IERC20 {
    struct StakingPosition {
        uint256 amount;
        uint256 startTime;
        uint256 lastRewardClaim;
        uint256 lockPeriod;
        bool isLocked;
    }
    
    struct RewardPool {
        uint256 totalRewards;
        uint256 rewardPerToken;
        uint256 lastUpdateTime;
        uint256 totalStaked;
    }
    
    // Events
    event Staked(address indexed user, uint256 amount, uint256 lockPeriod, uint256 positionId);
    event Unstaked(address indexed user, uint256 amount, uint256 positionId);
    event RewardsClaimed(address indexed user, uint256 amount);
    event RewardsDistributed(uint256 totalAmount);
    event ConsciousnessVerified(address indexed user, bool verified);
    
    // Staking functions
    function stake(uint256 amount, uint256 lockPeriod) external;
    function unstake(uint256 positionId) external;
    function claimRewards() external;
    
    // View functions
    function getPendingRewards(address user) external view returns (uint256);
    function getEffectiveRewardRate(address user) external view returns (uint256);
    function getStakingPositions(address user) external view returns (StakingPosition[] memory);
    function totalStakedByUser(address user) external view returns (uint256);
    function consciousnessVerified(address user) external view returns (bool);
    
    // Admin functions
    function setConsciousnessVerified(address user, bool verified) external;
    function distributeRewards(uint256 amount) external;
    function mint(address to, uint256 amount) external;
}