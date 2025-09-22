// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title ConsciousnessToken (CONS)
 * @notice ERC-20 token for platform governance, payments, and staking
 * @dev Implements staking rewards, governance voting, and platform utilities
 */
contract ConsciousnessToken is ERC20, ERC20Permit, ERC20Votes, AccessControl, ReentrancyGuard, Pausable {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant STAKING_MANAGER_ROLE = keccak256("STAKING_MANAGER_ROLE");
    bytes32 public constant REWARD_DISTRIBUTOR_ROLE = keccak256("REWARD_DISTRIBUTOR_ROLE");
    
    // Token economics
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 1 billion tokens
    uint256 public constant INITIAL_SUPPLY = 100_000_000 * 10**18; // 100 million initial
    uint256 public constant STAKING_REWARD_RATE = 500; // 5% annual rate (basis points)
    
    // Staking structures
    struct StakingPosition {
        uint256 amount;
        uint256 startTime;
        uint256 lastRewardClaim;
        uint256 lockPeriod; // in seconds
        bool isLocked;
    }
    
    struct RewardPool {
        uint256 totalRewards;
        uint256 rewardPerToken;
        uint256 lastUpdateTime;
        uint256 totalStaked;
    }
    
    // State variables
    mapping(address => StakingPosition[]) public stakingPositions;
    mapping(address => uint256) public totalStakedByUser;
    mapping(address => uint256) public unclaimedRewards;
    mapping(address => bool) public consciousnessVerified; // Verified consciousness levels
    
    RewardPool public mainRewardPool;
    uint256 public totalStaked;
    uint256 public minimumStakingAmount = 100 * 10**18; // 100 CONS minimum
    
    // Lock periods for different staking tiers
    uint256 public constant FLEXIBLE_LOCK = 0; // No lock
    uint256 public constant SHORT_LOCK = 30 days;
    uint256 public constant MEDIUM_LOCK = 90 days;
    uint256 public constant LONG_LOCK = 365 days;
    
    // Events
    event Staked(address indexed user, uint256 amount, uint256 lockPeriod, uint256 positionId);
    event Unstaked(address indexed user, uint256 amount, uint256 positionId);
    event RewardsClaimed(address indexed user, uint256 amount);
    event RewardsDistributed(uint256 totalAmount);
    event ConsciousnessVerified(address indexed user, bool verified);
    event StakingParametersUpdated(uint256 newMinimum, uint256 newRewardRate);
    
    constructor() 
        ERC20("Consciousness Token", "CONS")
        ERC20Permit("Consciousness Token")
        ERC20Votes()
    {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(STAKING_MANAGER_ROLE, msg.sender);
        _grantRole(REWARD_DISTRIBUTOR_ROLE, msg.sender);
        
        // Mint initial supply to deployer
        _mint(msg.sender, INITIAL_SUPPLY);
        
        // Initialize reward pool
        mainRewardPool.lastUpdateTime = block.timestamp;
    }
    
    /**
     * @notice Stake tokens for rewards and governance power
     * @param amount Amount of tokens to stake
     * @param lockPeriod Lock period in seconds
     */
    function stake(uint256 amount, uint256 lockPeriod) external nonReentrant whenNotPaused {
        require(amount >= minimumStakingAmount, "Below minimum staking amount");
        require(
            lockPeriod == FLEXIBLE_LOCK || 
            lockPeriod == SHORT_LOCK || 
            lockPeriod == MEDIUM_LOCK || 
            lockPeriod == LONG_LOCK,
            "Invalid lock period"
        );
        
        _updateRewardPool();
        _claimRewards(msg.sender);
        
        // Transfer tokens to contract
        _transfer(msg.sender, address(this), amount);
        
        // Create staking position
        StakingPosition memory position = StakingPosition({
            amount: amount,
            startTime: block.timestamp,
            lastRewardClaim: block.timestamp,
            lockPeriod: lockPeriod,
            isLocked: lockPeriod > 0
        });
        
        stakingPositions[msg.sender].push(position);
        uint256 positionId = stakingPositions[msg.sender].length - 1;
        
        totalStakedByUser[msg.sender] += amount;
        totalStaked += amount;
        mainRewardPool.totalStaked += amount;
        
        emit Staked(msg.sender, amount, lockPeriod, positionId);
    }
    
    /**
     * @notice Unstake tokens from a specific position
     * @param positionId ID of the staking position to unstake
     */
    function unstake(uint256 positionId) external nonReentrant {
        require(positionId < stakingPositions[msg.sender].length, "Invalid position ID");
        
        StakingPosition storage position = stakingPositions[msg.sender][positionId];
        require(position.amount > 0, "Position already unstaked");
        
        if (position.isLocked) {
            require(
                block.timestamp >= position.startTime + position.lockPeriod,
                "Position still locked"
            );
        }
        
        _updateRewardPool();
        _claimRewards(msg.sender);
        
        uint256 amount = position.amount;
        
        // Update state
        totalStakedByUser[msg.sender] -= amount;
        totalStaked -= amount;
        mainRewardPool.totalStaked -= amount;
        position.amount = 0;
        
        // Transfer tokens back to user
        _transfer(address(this), msg.sender, amount);
        
        emit Unstaked(msg.sender, amount, positionId);
    }
    
    /**
     * @notice Claim accumulated staking rewards
     */
    function claimRewards() external nonReentrant {
        _updateRewardPool();
        _claimRewards(msg.sender);
    }
    
    /**
     * @notice Get the current reward rate with bonuses
     * @param user Address to check bonuses for
     * @return Effective reward rate in basis points
     */
    function getEffectiveRewardRate(address user) public view returns (uint256) {
        uint256 baseRate = STAKING_REWARD_RATE;
        
        // Consciousness verification bonus: +20%
        if (consciousnessVerified[user]) {
            baseRate = baseRate * 120 / 100;
        }
        
        return baseRate;
    }
    
    /**
     * @notice Calculate pending rewards for a user
     * @param user Address to calculate rewards for
     * @return Total pending rewards
     */
    function getPendingRewards(address user) external view returns (uint256) {
        if (totalStakedByUser[user] == 0) return unclaimedRewards[user];
        
        uint256 totalPending = unclaimedRewards[user];
        uint256 effectiveRate = getEffectiveRewardRate(user);
        
        for (uint256 i = 0; i < stakingPositions[user].length; i++) {
            StakingPosition memory position = stakingPositions[user][i];
            if (position.amount > 0) {
                uint256 timeDiff = block.timestamp - position.lastRewardClaim;
                uint256 positionReward = (position.amount * effectiveRate * timeDiff) / (365 days * 10000);
                totalPending += positionReward;
            }
        }
        
        return totalPending;
    }
    
    /**
     * @notice Set consciousness verification status
     * @param user User to verify
     * @param verified Verification status
     */
    function setConsciousnessVerified(address user, bool verified) 
        external 
        onlyRole(STAKING_MANAGER_ROLE) 
    {
        consciousnessVerified[user] = verified;
        emit ConsciousnessVerified(user, verified);
    }
    
    /**
     * @notice Distribute rewards to the reward pool
     * @param amount Amount of rewards to distribute
     */
    function distributeRewards(uint256 amount) external onlyRole(REWARD_DISTRIBUTOR_ROLE) {
        require(totalSupply() + amount <= MAX_SUPPLY, "Would exceed max supply");
        
        _mint(address(this), amount);
        mainRewardPool.totalRewards += amount;
        
        emit RewardsDistributed(amount);
    }
    
    /**
     * @notice Update staking parameters
     * @param newMinimum New minimum staking amount
     */
    function updateStakingParameters(uint256 newMinimum) 
        external 
        onlyRole(STAKING_MANAGER_ROLE) 
    {
        minimumStakingAmount = newMinimum;
        emit StakingParametersUpdated(newMinimum, STAKING_REWARD_RATE);
    }
    
    /**
     * @notice Get user's staking positions
     * @param user User address
     * @return Array of staking positions
     */
    function getStakingPositions(address user) external view returns (StakingPosition[] memory) {
        return stakingPositions[user];
    }
    
    /**
     * @notice Emergency pause contract
     */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }
    
    /**
     * @notice Unpause contract
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
    
    /**
     * @notice Mint tokens to address (only for rewards and ecosystem)
     */
    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        require(totalSupply() + amount <= MAX_SUPPLY, "Would exceed max supply");
        _mint(to, amount);
    }
    
    // Internal functions
    function _updateRewardPool() internal {
        if (mainRewardPool.totalStaked > 0) {
            uint256 timeDiff = block.timestamp - mainRewardPool.lastUpdateTime;
            if (timeDiff > 0) {
                uint256 rewardPerToken = (STAKING_REWARD_RATE * timeDiff) / (365 days * 10000);
                mainRewardPool.rewardPerToken += rewardPerToken;
            }
        }
        mainRewardPool.lastUpdateTime = block.timestamp;
    }
    
    function _claimRewards(address user) internal {
        if (totalStakedByUser[user] == 0) return;
        
        uint256 totalReward = 0;
        uint256 effectiveRate = getEffectiveRewardRate(user);
        
        for (uint256 i = 0; i < stakingPositions[user].length; i++) {
            StakingPosition storage position = stakingPositions[user][i];
            if (position.amount > 0) {
                uint256 timeDiff = block.timestamp - position.lastRewardClaim;
                uint256 positionReward = (position.amount * effectiveRate * timeDiff) / (365 days * 10000);
                totalReward += positionReward;
                position.lastRewardClaim = block.timestamp;
            }
        }
        
        if (unclaimedRewards[user] > 0) {
            totalReward += unclaimedRewards[user];
            unclaimedRewards[user] = 0;
        }
        
        if (totalReward > 0) {
            // Mint rewards if available in pool
            if (totalSupply() + totalReward <= MAX_SUPPLY) {
                _mint(user, totalReward);
                emit RewardsClaimed(user, totalReward);
            } else {
                // Store as unclaimed if minting would exceed max supply
                unclaimedRewards[user] += totalReward;
            }
        }
    }
    
    // Override required functions for multiple inheritance
    function _update(address from, address to, uint256 value) internal virtual override(ERC20, ERC20Votes) {
        super._update(from, to, value);
    }
    
    function nonces(address owner) public view virtual override(ERC20Permit, Nonces) returns (uint256) {
        return super.nonces(owner);
    }
}