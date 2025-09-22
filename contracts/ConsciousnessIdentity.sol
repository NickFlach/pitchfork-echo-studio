// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "./interfaces/IConsciousnessToken.sol";
import "./interfaces/IConsciousnessAchievements.sol";

/**
 * @title ConsciousnessIdentity
 * @notice Decentralized identity and verification system for consciousness profiles
 * @dev Implements self-sovereign identity, credential verification, and privacy-preserving sharing
 */
contract ConsciousnessIdentity is AccessControl, ReentrancyGuard, Pausable {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;
    
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant CREDENTIAL_ISSUER_ROLE = keccak256("CREDENTIAL_ISSUER_ROLE");
    bytes32 public constant ENTERPRISE_ADMIN_ROLE = keccak256("ENTERPRISE_ADMIN_ROLE");
    bytes32 public constant PRIVACY_GUARDIAN_ROLE = keccak256("PRIVACY_GUARDIAN_ROLE");
    
    // Identity structures
    enum VerificationLevel {
        NONE,
        BASIC,
        EXECUTIVE,
        ENTERPRISE,
        CONSCIOUSNESS_VERIFIED,
        THOUGHT_LEADER
    }
    
    enum CredentialType {
        LEADERSHIP_ASSESSMENT,
        EXECUTIVE_EXPERIENCE,
        CONSCIOUSNESS_SCORE,
        STRATEGIC_THINKING,
        CRISIS_MANAGEMENT,
        TEAM_LEADERSHIP,
        INNOVATION_CAPACITY,
        ETHICAL_DECISION_MAKING,
        WISDOM_APPLICATION,
        TRANSFORMATION_LEADERSHIP
    }
    
    struct Identity {
        address owner;
        VerificationLevel verificationLevel;
        uint256 consciousnessScore;
        uint256 lastScoreUpdate;
        string publicProfile; // IPFS hash for public information
        bytes32 privateProfileHash; // Hash of private profile for verification
        bool isEnterpriseAccount;
        uint256 createdAt;
        uint256 lastUpdated;
        mapping(CredentialType => Credential) credentials;
        mapping(address => bool) authorizedViewers; // Who can view private credentials
        mapping(bytes32 => bool) sharedCredentials; // Specific credentials shared
    }
    
    struct Credential {
        CredentialType credType;
        address issuer;
        uint256 score;
        uint256 issuedAt;
        uint256 expiresAt;
        bool isVerified;
        bool isActive;
        string metadataURI; // IPFS hash for additional data
        bytes32 proofHash; // Hash of verification proof
        mapping(address => bool) endorsements; // Peer endorsements
    }
    
    struct VerificationAttestation {
        address subject;
        address verifier;
        VerificationLevel level;
        string evidence; // IPFS hash of verification documents
        uint256 timestamp;
        bool isValid;
        bytes signature;
    }
    
    struct PrivacySettings {
        bool allowPublicProfile;
        bool allowCredentialSharing;
        bool allowConsciousnessScoring;
        bool allowEnterpriseAccess;
        mapping(CredentialType => bool) publicCredentials;
        mapping(address => mapping(CredentialType => bool)) sharedWith;
    }
    
    // State variables
    mapping(address => Identity) public identities;
    mapping(address => PrivacySettings) public privacySettings;
    mapping(bytes32 => VerificationAttestation) public attestations;
    mapping(address => bool) public trustedIssuers;
    mapping(address => uint256) public verificationScores;
    mapping(CredentialType => uint256) public minimumScoresRequired;
    
    IConsciousnessToken public consciousnessToken;
    IConsciousnessAchievements public achievementsContract;
    
    // Platform settings
    uint256 public constant MAX_CONSCIOUSNESS_SCORE = 1000;
    uint256 public verificationFee = 10 * 10**18; // 10 CONS tokens
    uint256 public credentialValidityPeriod = 365 days;
    uint256 public attestationValidityPeriod = 90 days;
    
    // Merkle tree for privacy-preserving verification
    mapping(bytes32 => bool) public merkleRoots;
    mapping(address => bytes32) public userMerkleRoots;
    
    // Events
    event IdentityCreated(address indexed user, VerificationLevel level);
    event IdentityUpdated(address indexed user, VerificationLevel level);
    event CredentialIssued(address indexed user, CredentialType credType, address indexed issuer);
    event CredentialVerified(address indexed user, CredentialType credType, address indexed verifier);
    event AttestationCreated(bytes32 indexed attestationId, address indexed subject, address indexed verifier);
    event ConsciousnessScoreUpdated(address indexed user, uint256 newScore);
    event CredentialShared(address indexed user, address indexed viewer, CredentialType credType);
    event PrivacySettingsUpdated(address indexed user);
    event VerificationLevelUpgraded(address indexed user, VerificationLevel oldLevel, VerificationLevel newLevel);
    
    constructor(
        address _consciousnessToken,
        address _achievementsContract
    ) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
        _grantRole(CREDENTIAL_ISSUER_ROLE, msg.sender);
        _grantRole(ENTERPRISE_ADMIN_ROLE, msg.sender);
        _grantRole(PRIVACY_GUARDIAN_ROLE, msg.sender);
        
        consciousnessToken = IConsciousnessToken(_consciousnessToken);
        achievementsContract = IConsciousnessAchievements(_achievementsContract);
        
        _initializeMinimumScores();
    }
    
    /**
     * @notice Create a new decentralized identity
     * @param publicProfile IPFS hash of public profile information
     * @param privateProfileHash Hash of private profile for verification
     * @param isEnterpriseAccount Whether this is an enterprise account
     */
    function createIdentity(
        string memory publicProfile,
        bytes32 privateProfileHash,
        bool isEnterpriseAccount
    ) external whenNotPaused {
        require(identities[msg.sender].owner == address(0), "Identity already exists");
        
        Identity storage identity = identities[msg.sender];
        identity.owner = msg.sender;
        identity.verificationLevel = VerificationLevel.BASIC;
        identity.consciousnessScore = 0;
        identity.lastScoreUpdate = block.timestamp;
        identity.publicProfile = publicProfile;
        identity.privateProfileHash = privateProfileHash;
        identity.isEnterpriseAccount = isEnterpriseAccount;
        identity.createdAt = block.timestamp;
        identity.lastUpdated = block.timestamp;
        
        // Initialize default privacy settings
        PrivacySettings storage privacy = privacySettings[msg.sender];
        privacy.allowPublicProfile = true;
        privacy.allowCredentialSharing = false;
        privacy.allowConsciousnessScoring = true;
        privacy.allowEnterpriseAccess = isEnterpriseAccount;
        
        emit IdentityCreated(msg.sender, VerificationLevel.BASIC);
    }
    
    /**
     * @notice Issue a credential to a user
     * @param user User to issue credential to
     * @param credType Type of credential
     * @param score Credential score
     * @param metadataURI IPFS hash for additional metadata
     * @param proofHash Hash of verification proof
     */
    function issueCredential(
        address user,
        CredentialType credType,
        uint256 score,
        string memory metadataURI,
        bytes32 proofHash
    ) external onlyRole(CREDENTIAL_ISSUER_ROLE) {
        require(identities[user].owner != address(0), "Identity does not exist");
        require(score <= MAX_CONSCIOUSNESS_SCORE, "Score exceeds maximum");
        
        Credential storage credential = identities[user].credentials[credType];
        credential.credType = credType;
        credential.issuer = msg.sender;
        credential.score = score;
        credential.issuedAt = block.timestamp;
        credential.expiresAt = block.timestamp + credentialValidityPeriod;
        credential.isVerified = false;
        credential.isActive = true;
        credential.metadataURI = metadataURI;
        credential.proofHash = proofHash;
        
        identities[user].lastUpdated = block.timestamp;
        
        emit CredentialIssued(user, credType, msg.sender);
    }
    
    /**
     * @notice Verify a user's credential
     * @param user User whose credential to verify
     * @param credType Type of credential to verify
     * @param evidence IPFS hash of verification evidence
     */
    function verifyCredential(
        address user,
        CredentialType credType,
        string memory evidence
    ) external onlyRole(VERIFIER_ROLE) {
        require(identities[user].owner != address(0), "Identity does not exist");
        
        Credential storage credential = identities[user].credentials[credType];
        require(credential.isActive, "Credential not active");
        require(block.timestamp <= credential.expiresAt, "Credential expired");
        
        credential.isVerified = true;
        
        // Update consciousness score based on verified credentials
        _updateConsciousnessScore(user);
        
        // Check for verification level upgrade
        _checkVerificationLevelUpgrade(user);
        
        emit CredentialVerified(user, credType, msg.sender);
    }
    
    /**
     * @notice Create verification attestation
     * @param subject Address of the subject being attested
     * @param level Verification level being attested
     * @param evidence IPFS hash of evidence
     * @param signature Verifier's signature
     */
    function createAttestation(
        address subject,
        VerificationLevel level,
        string memory evidence,
        bytes memory signature
    ) external onlyRole(VERIFIER_ROLE) returns (bytes32 attestationId) {
        require(identities[subject].owner != address(0), "Subject identity does not exist");
        
        attestationId = keccak256(abi.encodePacked(subject, msg.sender, level, block.timestamp));
        
        VerificationAttestation storage attestation = attestations[attestationId];
        attestation.subject = subject;
        attestation.verifier = msg.sender;
        attestation.level = level;
        attestation.evidence = evidence;
        attestation.timestamp = block.timestamp;
        attestation.isValid = true;
        attestation.signature = signature;
        
        verificationScores[subject] += uint256(level) * 100;
        
        emit AttestationCreated(attestationId, subject, msg.sender);
        
        return attestationId;
    }
    
    /**
     * @notice Update consciousness score
     * @param user User to update score for
     * @param newScore New consciousness score
     * @param assessmentData IPFS hash of assessment data
     */
    function updateConsciousnessScore(
        address user,
        uint256 newScore,
        string memory assessmentData
    ) external onlyRole(CREDENTIAL_ISSUER_ROLE) {
        require(identities[user].owner != address(0), "Identity does not exist");
        require(newScore <= MAX_CONSCIOUSNESS_SCORE, "Score exceeds maximum");
        require(privacySettings[user].allowConsciousnessScoring, "Consciousness scoring not allowed");
        
        uint256 oldScore = identities[user].consciousnessScore;
        identities[user].consciousnessScore = newScore;
        identities[user].lastScoreUpdate = block.timestamp;
        identities[user].lastUpdated = block.timestamp;
        
        // Update consciousness token contract
        consciousnessToken.setConsciousnessVerified(user, newScore >= 500);
        
        // Update achievements contract
        achievementsContract.updateConsciousnessScore(user, newScore);
        
        // Check for verification level upgrade
        _checkVerificationLevelUpgrade(user);
        
        emit ConsciousnessScoreUpdated(user, newScore);
    }
    
    /**
     * @notice Share credential with specific address
     * @param viewer Address to share credential with
     * @param credType Type of credential to share
     * @param allowAccess Whether to grant or revoke access
     */
    function shareCredential(
        address viewer,
        CredentialType credType,
        bool allowAccess
    ) external {
        require(identities[msg.sender].owner != address(0), "Identity does not exist");
        require(privacySettings[msg.sender].allowCredentialSharing, "Credential sharing disabled");
        
        privacySettings[msg.sender].sharedWith[viewer][credType] = allowAccess;
        
        if (allowAccess) {
            emit CredentialShared(msg.sender, viewer, credType);
        }
    }
    
    /**
     * @notice Update privacy settings
     * @param allowPublicProfile Allow public profile viewing
     * @param allowCredentialSharing Allow credential sharing
     * @param allowConsciousnessScoring Allow consciousness score updates
     * @param allowEnterpriseAccess Allow enterprise account access
     */
    function updatePrivacySettings(
        bool allowPublicProfile,
        bool allowCredentialSharing,
        bool allowConsciousnessScoring,
        bool allowEnterpriseAccess
    ) external {
        require(identities[msg.sender].owner != address(0), "Identity does not exist");
        
        PrivacySettings storage privacy = privacySettings[msg.sender];
        privacy.allowPublicProfile = allowPublicProfile;
        privacy.allowCredentialSharing = allowCredentialSharing;
        privacy.allowConsciousnessScoring = allowConsciousnessScoring;
        privacy.allowEnterpriseAccess = allowEnterpriseAccess;
        
        emit PrivacySettingsUpdated(msg.sender);
    }
    
    /**
     * @notice Set credential as public or private
     * @param credType Type of credential
     * @param isPublic Whether credential should be public
     */
    function setCredentialVisibility(CredentialType credType, bool isPublic) external {
        require(identities[msg.sender].owner != address(0), "Identity does not exist");
        privacySettings[msg.sender].publicCredentials[credType] = isPublic;
    }
    
    /**
     * @notice Get user's identity information
     * @param user User to get identity for
     */
    function getIdentity(address user) external view returns (
        VerificationLevel verificationLevel,
        uint256 consciousnessScore,
        uint256 lastScoreUpdate,
        string memory publicProfile,
        bool isEnterpriseAccount,
        uint256 createdAt,
        uint256 lastUpdated
    ) {
        Identity storage identity = identities[user];
        require(identity.owner != address(0), "Identity does not exist");
        
        return (
            identity.verificationLevel,
            identity.consciousnessScore,
            identity.lastScoreUpdate,
            identity.publicProfile,
            identity.isEnterpriseAccount,
            identity.createdAt,
            identity.lastUpdated
        );
    }
    
    /**
     * @notice Get user's credential information
     * @param user User to get credential for
     * @param credType Type of credential
     */
    function getCredential(address user, CredentialType credType) external view returns (
        address issuer,
        uint256 score,
        uint256 issuedAt,
        uint256 expiresAt,
        bool isVerified,
        bool isActive,
        string memory metadataURI
    ) {
        require(identities[user].owner != address(0), "Identity does not exist");
        require(_canViewCredential(msg.sender, user, credType), "Access denied");
        
        Credential storage credential = identities[user].credentials[credType];
        
        return (
            credential.issuer,
            credential.score,
            credential.issuedAt,
            credential.expiresAt,
            credential.isVerified,
            credential.isActive,
            credential.metadataURI
        );
    }
    
    /**
     * @notice Check if address can view user's credentials
     * @param viewer Address requesting access
     * @param user User whose credentials are being accessed
     * @param credType Type of credential
     */
    function canViewCredential(address viewer, address user, CredentialType credType) external view returns (bool) {
        return _canViewCredential(viewer, user, credType);
    }
    
    /**
     * @notice Verify attestation signature
     * @param attestationId ID of attestation to verify
     */
    function verifyAttestation(bytes32 attestationId) external view returns (bool) {
        VerificationAttestation storage attestation = attestations[attestationId];
        require(attestation.subject != address(0), "Attestation does not exist");
        require(attestation.isValid, "Attestation is not valid");
        require(block.timestamp <= attestation.timestamp + attestationValidityPeriod, "Attestation expired");
        
        bytes32 message = keccak256(abi.encodePacked(
            attestation.subject,
            attestation.level,
            attestation.evidence,
            attestation.timestamp
        ));
        
        bytes32 ethSignedMessageHash = message.toEthSignedMessageHash();
        address recoveredSigner = ethSignedMessageHash.recover(attestation.signature);
        
        return recoveredSigner == attestation.verifier && hasRole(VERIFIER_ROLE, attestation.verifier);
    }
    
    /**
     * @notice Set trusted issuer status
     * @param issuer Address of issuer
     * @param trusted Whether issuer is trusted
     */
    function setTrustedIssuer(address issuer, bool trusted) external onlyRole(DEFAULT_ADMIN_ROLE) {
        trustedIssuers[issuer] = trusted;
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
    function _canViewCredential(address viewer, address user, CredentialType credType) internal view returns (bool) {
        if (viewer == user) return true; // User can always view own credentials
        
        PrivacySettings storage privacy = privacySettings[user];
        
        // Check if credential is public
        if (privacy.publicCredentials[credType]) return true;
        
        // Check if viewer has been granted access
        if (privacy.sharedWith[viewer][credType]) return true;
        
        // Check if viewer has enterprise admin role and user allows enterprise access
        if (hasRole(ENTERPRISE_ADMIN_ROLE, viewer) && privacy.allowEnterpriseAccess) return true;
        
        // Check if viewer is a trusted issuer
        if (trustedIssuers[viewer]) return true;
        
        return false;
    }
    
    function _updateConsciousnessScore(address user) internal {
        uint256 totalScore = 0;
        uint256 verifiedCredentials = 0;
        
        for (uint256 i = 0; i < 10; i++) { // 10 credential types
            CredentialType credType = CredentialType(i);
            Credential storage credential = identities[user].credentials[credType];
            
            if (credential.isVerified && credential.isActive && block.timestamp <= credential.expiresAt) {
                totalScore += credential.score;
                verifiedCredentials++;
            }
        }
        
        if (verifiedCredentials > 0) {
            uint256 averageScore = totalScore / verifiedCredentials;
            identities[user].consciousnessScore = averageScore;
            identities[user].lastScoreUpdate = block.timestamp;
        }
    }
    
    function _checkVerificationLevelUpgrade(address user) internal {
        Identity storage identity = identities[user];
        uint256 score = identity.consciousnessScore;
        uint256 verificationScore = verificationScores[user];
        
        VerificationLevel oldLevel = identity.verificationLevel;
        VerificationLevel newLevel = oldLevel;
        
        if (score >= 800 && verificationScore >= 500) {
            newLevel = VerificationLevel.THOUGHT_LEADER;
        } else if (score >= 700 && verificationScore >= 400) {
            newLevel = VerificationLevel.CONSCIOUSNESS_VERIFIED;
        } else if (score >= 600 && verificationScore >= 300) {
            newLevel = VerificationLevel.ENTERPRISE;
        } else if (score >= 400 && verificationScore >= 200) {
            newLevel = VerificationLevel.EXECUTIVE;
        } else if (score >= 200) {
            newLevel = VerificationLevel.BASIC;
        }
        
        if (newLevel > oldLevel) {
            identity.verificationLevel = newLevel;
            identity.lastUpdated = block.timestamp;
            emit VerificationLevelUpgraded(user, oldLevel, newLevel);
        }
    }
    
    function _initializeMinimumScores() internal {
        minimumScoresRequired[CredentialType.LEADERSHIP_ASSESSMENT] = 300;
        minimumScoresRequired[CredentialType.EXECUTIVE_EXPERIENCE] = 400;
        minimumScoresRequired[CredentialType.CONSCIOUSNESS_SCORE] = 200;
        minimumScoresRequired[CredentialType.STRATEGIC_THINKING] = 350;
        minimumScoresRequired[CredentialType.CRISIS_MANAGEMENT] = 450;
        minimumScoresRequired[CredentialType.TEAM_LEADERSHIP] = 300;
        minimumScoresRequired[CredentialType.INNOVATION_CAPACITY] = 400;
        minimumScoresRequired[CredentialType.ETHICAL_DECISION_MAKING] = 500;
        minimumScoresRequired[CredentialType.WISDOM_APPLICATION] = 600;
        minimumScoresRequired[CredentialType.TRANSFORMATION_LEADERSHIP] = 700;
    }
}