// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/**
 * @title IConsciousnessAchievements
 * @notice Interface for the Consciousness Achievements NFT contract
 */
interface IConsciousnessAchievements is IERC721 {
    enum AchievementCategory {
        CONSCIOUS_LEADER,
        STRATEGIC_THINKER,
        CRISIS_MANAGER,
        INNOVATION_CATALYST,
        ETHICAL_GUARDIAN,
        WISDOM_KEEPER,
        TRANSFORMATION_AGENT,
        COLLABORATION_MASTER
    }
    
    enum AchievementLevel {
        BRONZE,
        SILVER,
        GOLD,
        PLATINUM,
        DIAMOND,
        TRANSCENDENT
    }
    
    // Events
    event AchievementMinted(uint256 indexed tokenId, address indexed recipient, AchievementCategory category, AchievementLevel level);
    event AchievementEvolved(uint256 indexed tokenId, AchievementLevel oldLevel, AchievementLevel newLevel);
    event ConsciousnessScoreUpdated(address indexed user, uint256 newScore);
    event SkillUnlocked(address indexed user, string skill, uint256 level);
    event MetadataUpdated(uint256 indexed tokenId, string newMetadataURI);
    
    // Core functions
    function mintAchievement(
        address to,
        AchievementCategory category,
        AchievementLevel level,
        uint256 consciousnessScore,
        uint256 assessmentScore,
        string[] memory skills
    ) external returns (uint256);
    
    function evolveAchievement(uint256 tokenId) external;
    
    // View functions
    function getAchievement(uint256 tokenId) external view returns (
        AchievementCategory category,
        AchievementLevel level,
        uint256 issuedAt,
        uint256 lastEvolution,
        address recipient,
        string memory metadataURI,
        uint256 consciousnessScore,
        uint256 assessmentScore,
        string[] memory skillsUnlocked
    );
    
    function getUserAchievements(address user) external view returns (uint256[] memory);
    function canEvolveAchievement(uint256 tokenId) external view returns (bool, string memory reason);
    function userConsciousnessScores(address user) external view returns (uint256);
    function userSkillLevels(address user, string memory skill) external view returns (uint256);
    
    // Admin functions
    function updateConsciousnessScore(address user, uint256 newScore) external;
    function updateSkillLevel(address user, string memory skill, uint256 level) external;
}