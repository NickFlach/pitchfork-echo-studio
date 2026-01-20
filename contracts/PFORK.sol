// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title PFORK - Pitchfork Token
 * @notice The base token of the Pitchfork Protocol
 * @dev ERC20 token with minting capabilities controlled by roles
 *      Users stake PFORK to receive gPFORK for governance participation
 */
contract PFORK is ERC20, ERC20Burnable, ERC20Permit, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant REWARD_DISTRIBUTOR_ROLE = keccak256("REWARD_DISTRIBUTOR_ROLE");

    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 1 billion max supply

    event RewardDistributed(address indexed recipient, uint256 amount, string reason);

    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) ERC20Permit(name) {
        require(initialSupply <= MAX_SUPPLY, "Initial supply exceeds max");

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(REWARD_DISTRIBUTOR_ROLE, msg.sender);

        _mint(msg.sender, initialSupply);
    }

    /**
     * @notice Mint new tokens (subject to max supply)
     * @param to Recipient address
     * @param amount Amount to mint
     */
    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        require(totalSupply() + amount <= MAX_SUPPLY, "Would exceed max supply");
        _mint(to, amount);
    }

    /**
     * @notice Distribute rewards to a recipient
     * @param recipient Address to receive rewards
     * @param amount Amount of tokens to distribute
     * @param reason Reason for the reward distribution
     */
    function distributeReward(
        address recipient,
        uint256 amount,
        string calldata reason
    ) external onlyRole(REWARD_DISTRIBUTOR_ROLE) {
        require(totalSupply() + amount <= MAX_SUPPLY, "Would exceed max supply");
        _mint(recipient, amount);
        emit RewardDistributed(recipient, amount, reason);
    }

    /**
     * @notice Get the maximum supply
     */
    function maxSupply() external pure returns (uint256) {
        return MAX_SUPPLY;
    }

    /**
     * @notice Get remaining mintable tokens
     */
    function remainingMintable() external view returns (uint256) {
        return MAX_SUPPLY - totalSupply();
    }
}
