// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PermitUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20VotesUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/**
 * @title gPFORK - Governance Pitchfork Staking Token
 * @notice Stake PFORK to receive gPFORK (1:1) with voting power and earn PFORK rewards.
 * @dev Uses a Synthetix-style reward-per-token accumulator for fair reward distribution.
 *      Upgradeable via UUPS; upgrade authority should be the Timelock.
 */
contract gPFORK is
    Initializable,
    ERC20Upgradeable,
    ERC20PermitUpgradeable,
    ERC20VotesUpgradeable,
    AccessControlUpgradeable,
    ReentrancyGuardUpgradeable,
    UUPSUpgradeable
{
    using SafeERC20 for IERC20;

    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    bytes32 public constant REWARD_DISTRIBUTOR_ROLE = keccak256("REWARD_DISTRIBUTOR_ROLE");

    IERC20 public pfork;

    uint256 public rewardRate;
    uint256 public rewardPerTokenStored;
    uint256 public lastUpdateTime;
    uint256 public rewardsDuration;
    uint256 public periodFinish;

    mapping(address => uint256) public userRewardPerTokenPaid;
    mapping(address => uint256) public rewards;

    event RewardAdded(uint256 reward);
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);
    event RewardsDurationUpdated(uint256 newDuration);

    function initialize(
        address pforkToken,
        address admin,
        address upgrader,
        uint256 initialRewardsDuration
    ) external initializer {
        __ERC20_init("Governance Pitchfork", "gPFORK");
        __ERC20Permit_init("Governance Pitchfork");
        __ERC20Votes_init();
        __AccessControl_init();
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();

        pfork = IERC20(pforkToken);
        rewardsDuration = initialRewardsDuration;

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(UPGRADER_ROLE, upgrader);
        _grantRole(REWARD_DISTRIBUTOR_ROLE, admin);
    }

    modifier updateReward(address account) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = lastTimeRewardApplicable();
        if (account != address(0)) {
            rewards[account] = earned(account);
            userRewardPerTokenPaid[account] = rewardPerTokenStored;
        }
        _;
    }

    function lastTimeRewardApplicable() public view returns (uint256) {
        return block.timestamp < periodFinish ? block.timestamp : periodFinish;
    }

    function rewardPerToken() public view returns (uint256) {
        uint256 supply = totalSupply();
        if (supply == 0) {
            return rewardPerTokenStored;
        }
        return rewardPerTokenStored + (
            (lastTimeRewardApplicable() - lastUpdateTime) * rewardRate * 1e18 / supply
        );
    }

    function earned(address account) public view returns (uint256) {
        return (
            balanceOf(account) * (rewardPerToken() - userRewardPerTokenPaid[account]) / 1e18
        ) + rewards[account];
    }

    function stake(uint256 amount) external nonReentrant updateReward(msg.sender) {
        _stakeFor(msg.sender, amount);
    }

    function unstake(uint256 amount) external nonReentrant updateReward(msg.sender) {
        _unstakeFor(msg.sender, amount);
    }

    function claimRewards() public nonReentrant updateReward(msg.sender) {
        _claimRewardsFor(msg.sender);
    }

    function exit() external nonReentrant updateReward(msg.sender) {
        uint256 bal = balanceOf(msg.sender);
        if (bal > 0) {
            _unstakeFor(msg.sender, bal);
        }
        _claimRewardsFor(msg.sender);
    }

    function _stakeFor(address account, uint256 amount) internal {
        require(amount > 0, "Cannot stake 0");
        pfork.safeTransferFrom(account, address(this), amount);
        _mint(account, amount);
        emit Staked(account, amount);
    }

    function _unstakeFor(address account, uint256 amount) internal {
        require(amount > 0, "Cannot unstake 0");
        _burn(account, amount);
        pfork.safeTransfer(account, amount);
        emit Unstaked(account, amount);
    }

    function _claimRewardsFor(address account) internal {
        uint256 reward = rewards[account];
        if (reward > 0) {
            rewards[account] = 0;
            pfork.safeTransfer(account, reward);
            emit RewardPaid(account, reward);
        }
    }

    function notifyRewardAmount(uint256 reward)
        external
        onlyRole(REWARD_DISTRIBUTOR_ROLE)
        updateReward(address(0))
    {
        pfork.safeTransferFrom(msg.sender, address(this), reward);

        if (block.timestamp >= periodFinish) {
            rewardRate = reward / rewardsDuration;
        } else {
            uint256 remaining = periodFinish - block.timestamp;
            uint256 leftover = remaining * rewardRate;
            rewardRate = (reward + leftover) / rewardsDuration;
        }

        require(rewardRate > 0, "Reward rate = 0");

        uint256 balance = pfork.balanceOf(address(this)) - totalSupply();
        require(rewardRate * rewardsDuration <= balance, "Reward too high");

        lastUpdateTime = block.timestamp;
        periodFinish = block.timestamp + rewardsDuration;
        emit RewardAdded(reward);
    }

    function setRewardsDuration(uint256 duration) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(block.timestamp > periodFinish, "Reward period not finished");
        rewardsDuration = duration;
        emit RewardsDurationUpdated(duration);
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyRole(UPGRADER_ROLE) {}

    function _update(address from, address to, uint256 value)
        internal
        override(ERC20Upgradeable, ERC20VotesUpgradeable)
    {
        super._update(from, to, value);
    }

    function nonces(address owner)
        public
        view
        override(ERC20PermitUpgradeable, NoncesUpgradeable)
        returns (uint256)
    {
        return super.nonces(owner);
    }
}
