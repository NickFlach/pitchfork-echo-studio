// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title ConsciousnessAchievements
 * @notice Dynamic NFT system for leadership achievements and certifications
 * @dev Implements evolving NFTs based on consciousness development progress
 */
contract ConsciousnessAchievements is ERC721, ERC721URIStorage, AccessControl, ReentrancyGuard, Pausable {
    using Strings for uint256;
    
    bytes32 public constant ACHIEVEMENT_ISSUER_ROLE = keccak256("ACHIEVEMENT_ISSUER_ROLE");
    bytes32 public constant METADATA_UPDATER_ROLE = keccak256("METADATA_UPDATER_ROLE");
    bytes32 public constant EVOLUTION_MANAGER_ROLE = keccak256("EVOLUTION_MANAGER_ROLE");
    
    // Achievement categories and levels
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
        BRONZE,     // Level 1
        SILVER,     // Level 2
        GOLD,       // Level 3
        PLATINUM,   // Level 4
        DIAMOND,    // Level 5
        TRANSCENDENT // Level 6
    }
    
    struct Achievement {
        uint256 tokenId;
        AchievementCategory category;
        AchievementLevel level;
        uint256 issuedAt;
        uint256 lastEvolution;
        address recipient;
        string metadataURI;
        uint256 consciousnessScore;
        uint256 assessmentScore;
        string[] skillsUnlocked;
        mapping(string => uint256) progressMetrics;
        bool isEvolutionEnabled;
    }
    
    struct EvolutionRequirement {
        AchievementCategory category;
        AchievementLevel fromLevel;
        AchievementLevel toLevel;
        uint256 minConsciousnessScore;
        uint256 minAssessmentScore;
        uint256 minTimePeriod; // in seconds
        string[] requiredSkills;
        mapping(string => uint256) minProgressMetrics;
    }
    
    // State variables
    mapping(uint256 => Achievement) public achievements;
    mapping(address => mapping(AchievementCategory => uint256)) public userAchievements;
    mapping(AchievementCategory => mapping(AchievementLevel => EvolutionRequirement)) public evolutionRequirements;
    mapping(address => uint256) public userConsciousnessScores;
    mapping(address => mapping(string => uint256)) public userSkillLevels;
    
    uint256 private _nextTokenId = 1;
    string private _baseMetadataURI;
    
    // Category names for metadata
    string[] public categoryNames = [
        "Conscious Leader",
        "Strategic Thinker", 
        "Crisis Manager",
        "Innovation Catalyst",
        "Ethical Guardian",
        "Wisdom Keeper",
        "Transformation Agent",
        "Collaboration Master"
    ];
    
    string[] public levelNames = [
        "Bronze",
        "Silver", 
        "Gold",
        "Platinum",
        "Diamond",
        "Transcendent"
    ];
    
    // Events
    event AchievementMinted(uint256 indexed tokenId, address indexed recipient, AchievementCategory category, AchievementLevel level);
    event AchievementEvolved(uint256 indexed tokenId, AchievementLevel oldLevel, AchievementLevel newLevel);
    event ConsciousnessScoreUpdated(address indexed user, uint256 newScore);
    event SkillUnlocked(address indexed user, string skill, uint256 level);
    event MetadataUpdated(uint256 indexed tokenId, string newMetadataURI);
    event EvolutionRequirementSet(AchievementCategory category, AchievementLevel fromLevel, AchievementLevel toLevel);
    
    constructor(string memory baseURI) ERC721("Consciousness Achievements", "CONSCIOUS") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ACHIEVEMENT_ISSUER_ROLE, msg.sender);
        _grantRole(METADATA_UPDATER_ROLE, msg.sender);
        _grantRole(EVOLUTION_MANAGER_ROLE, msg.sender);
        _baseMetadataURI = baseURI;
        
        _initializeEvolutionRequirements();
    }
    
    /**
     * @notice Mint a new achievement NFT
     * @param to Recipient address
     * @param category Achievement category
     * @param level Achievement level
     * @param consciousnessScore Initial consciousness score
     * @param assessmentScore Initial assessment score
     * @param skills Array of skills unlocked
     */
    function mintAchievement(
        address to,
        AchievementCategory category,
        AchievementLevel level,
        uint256 consciousnessScore,
        uint256 assessmentScore,
        string[] memory skills
    ) external onlyRole(ACHIEVEMENT_ISSUER_ROLE) returns (uint256) {
        require(to != address(0), "Cannot mint to zero address");
        
        uint256 tokenId = _nextTokenId++;
        
        // Initialize achievement
        Achievement storage achievement = achievements[tokenId];
        achievement.tokenId = tokenId;
        achievement.category = category;
        achievement.level = level;
        achievement.issuedAt = block.timestamp;
        achievement.lastEvolution = block.timestamp;
        achievement.recipient = to;
        achievement.consciousnessScore = consciousnessScore;
        achievement.assessmentScore = assessmentScore;
        achievement.skillsUnlocked = skills;
        achievement.isEvolutionEnabled = true;
        
        // Generate metadata URI
        string memory metadataURI = _generateMetadataURI(tokenId);
        achievement.metadataURI = metadataURI;
        
        // Update user mappings
        userAchievements[to][category] = tokenId;
        userConsciousnessScores[to] = consciousnessScore;
        
        // Update user skills
        for (uint256 i = 0; i < skills.length; i++) {
            userSkillLevels[to][skills[i]] = uint256(level) + 1;
        }
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, metadataURI);
        
        emit AchievementMinted(tokenId, to, category, level);
        
        return tokenId;
    }
    
    /**
     * @notice Evolve an achievement to the next level
     * @param tokenId Token ID of the achievement to evolve
     */
    function evolveAchievement(uint256 tokenId) external nonReentrant {
        require(_ownerOf(tokenId) == msg.sender, "Not token owner");
        require(_exists(tokenId), "Token does not exist");
        
        Achievement storage achievement = achievements[tokenId];
        require(achievement.isEvolutionEnabled, "Evolution disabled for this token");
        require(achievement.level != AchievementLevel.TRANSCENDENT, "Already at maximum level");
        
        AchievementLevel nextLevel = AchievementLevel(uint256(achievement.level) + 1);
        EvolutionRequirement storage requirement = evolutionRequirements[achievement.category][achievement.level];
        
        // Check evolution requirements
        require(
            block.timestamp >= achievement.lastEvolution + requirement.minTimePeriod,
            "Time requirement not met"
        );
        require(
            achievement.consciousnessScore >= requirement.minConsciousnessScore,
            "Consciousness score too low"
        );
        require(
            achievement.assessmentScore >= requirement.minAssessmentScore,
            "Assessment score too low"
        );
        
        // Check required skills
        for (uint256 i = 0; i < requirement.requiredSkills.length; i++) {
            require(
                userSkillLevels[msg.sender][requirement.requiredSkills[i]] >= uint256(nextLevel),
                "Required skills not met"
            );
        }
        
        AchievementLevel oldLevel = achievement.level;
        achievement.level = nextLevel;
        achievement.lastEvolution = block.timestamp;
        
        // Update metadata
        string memory newMetadataURI = _generateMetadataURI(tokenId);
        achievement.metadataURI = newMetadataURI;
        _setTokenURI(tokenId, newMetadataURI);
        
        emit AchievementEvolved(tokenId, oldLevel, nextLevel);
    }
    
    /**
     * @notice Update consciousness score for a user
     * @param user User address
     * @param newScore New consciousness score
     */
    function updateConsciousnessScore(address user, uint256 newScore) 
        external 
        onlyRole(METADATA_UPDATER_ROLE) 
    {
        userConsciousnessScores[user] = newScore;
        
        // Update all user's achievements
        for (uint256 category = 0; category < 8; category++) {
            uint256 tokenId = userAchievements[user][AchievementCategory(category)];
            if (tokenId != 0 && _exists(tokenId)) {
                achievements[tokenId].consciousnessScore = newScore;
            }
        }
        
        emit ConsciousnessScoreUpdated(user, newScore);
    }
    
    /**
     * @notice Update user skill level
     * @param user User address
     * @param skill Skill name
     * @param level Skill level
     */
    function updateSkillLevel(address user, string memory skill, uint256 level)
        external
        onlyRole(METADATA_UPDATER_ROLE)
    {
        userSkillLevels[user][skill] = level;
        emit SkillUnlocked(user, skill, level);
    }
    
    /**
     * @notice Set evolution requirements for category and level
     */
    function setEvolutionRequirement(
        AchievementCategory category,
        AchievementLevel fromLevel,
        AchievementLevel toLevel,
        uint256 minConsciousnessScore,
        uint256 minAssessmentScore,
        uint256 minTimePeriod,
        string[] memory requiredSkills
    ) external onlyRole(EVOLUTION_MANAGER_ROLE) {
        EvolutionRequirement storage requirement = evolutionRequirements[category][fromLevel];
        requirement.category = category;
        requirement.fromLevel = fromLevel;
        requirement.toLevel = toLevel;
        requirement.minConsciousnessScore = minConsciousnessScore;
        requirement.minAssessmentScore = minAssessmentScore;
        requirement.minTimePeriod = minTimePeriod;
        requirement.requiredSkills = requiredSkills;
        
        emit EvolutionRequirementSet(category, fromLevel, toLevel);
    }
    
    /**
     * @notice Get achievement details by token ID
     */
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
    ) {
        require(_exists(tokenId), "Token does not exist");
        
        Achievement storage achievement = achievements[tokenId];
        return (
            achievement.category,
            achievement.level,
            achievement.issuedAt,
            achievement.lastEvolution,
            achievement.recipient,
            achievement.metadataURI,
            achievement.consciousnessScore,
            achievement.assessmentScore,
            achievement.skillsUnlocked
        );
    }
    
    /**
     * @notice Get user's achievements by category
     */
    function getUserAchievements(address user) external view returns (uint256[] memory) {
        uint256[] memory userTokens = new uint256[](8);
        for (uint256 i = 0; i < 8; i++) {
            userTokens[i] = userAchievements[user][AchievementCategory(i)];
        }
        return userTokens;
    }
    
    /**
     * @notice Check if user can evolve an achievement
     */
    function canEvolveAchievement(uint256 tokenId) external view returns (bool, string memory reason) {
        if (!_exists(tokenId)) return (false, "Token does not exist");
        
        Achievement storage achievement = achievements[tokenId];
        if (!achievement.isEvolutionEnabled) return (false, "Evolution disabled");
        if (achievement.level == AchievementLevel.TRANSCENDENT) return (false, "Maximum level reached");
        
        EvolutionRequirement storage requirement = evolutionRequirements[achievement.category][achievement.level];
        
        if (block.timestamp < achievement.lastEvolution + requirement.minTimePeriod) {
            return (false, "Time requirement not met");
        }
        if (achievement.consciousnessScore < requirement.minConsciousnessScore) {
            return (false, "Consciousness score too low");
        }
        if (achievement.assessmentScore < requirement.minAssessmentScore) {
            return (false, "Assessment score too low");
        }
        
        return (true, "Ready for evolution");
    }
    
    /**
     * @notice Set base metadata URI
     */
    function setBaseMetadataURI(string memory newBaseURI) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _baseMetadataURI = newBaseURI;
    }
    
    /**
     * @notice Pause contract
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
    
    // Internal functions
    function _generateMetadataURI(uint256 tokenId) internal view returns (string memory) {
        Achievement storage achievement = achievements[tokenId];
        return string(abi.encodePacked(
            _baseMetadataURI,
            "/",
            uint256(achievement.category).toString(),
            "/",
            uint256(achievement.level).toString(),
            "/",
            tokenId.toString(),
            ".json"
        ));
    }
    
    function _initializeEvolutionRequirements() internal {
        // Initialize basic evolution requirements for each category
        for (uint256 category = 0; category < 8; category++) {
            for (uint256 level = 0; level < 5; level++) {
                EvolutionRequirement storage requirement = evolutionRequirements[AchievementCategory(category)][AchievementLevel(level)];
                requirement.category = AchievementCategory(category);
                requirement.fromLevel = AchievementLevel(level);
                requirement.toLevel = AchievementLevel(level + 1);
                requirement.minConsciousnessScore = (level + 1) * 200; // 200, 400, 600, 800, 1000
                requirement.minAssessmentScore = (level + 1) * 150;    // 150, 300, 450, 600, 750
                requirement.minTimePeriod = (level + 1) * 7 days;      // 7, 14, 21, 28, 35 days
            }
        }
    }
    
    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }
    
    // Override required functions
    function _update(address to, uint256 tokenId, address auth) internal override whenNotPaused returns (address) {
        return super._update(to, tokenId, auth);
    }
    
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}