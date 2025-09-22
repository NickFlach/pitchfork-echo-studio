// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IConsciousnessIdentity
 * @notice Interface for the Consciousness Identity contract
 */
interface IConsciousnessIdentity {
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
    
    // Core functions
    function createIdentity(string memory publicProfile, bytes32 privateProfileHash, bool isEnterpriseAccount) external;
    function issueCredential(address user, CredentialType credType, uint256 score, string memory metadataURI, bytes32 proofHash) external;
    function verifyCredential(address user, CredentialType credType, string memory evidence) external;
    function createAttestation(address subject, VerificationLevel level, string memory evidence, bytes memory signature) external returns (bytes32);
    function updateConsciousnessScore(address user, uint256 newScore, string memory assessmentData) external;
    function shareCredential(address viewer, CredentialType credType, bool allowAccess) external;
    function updatePrivacySettings(bool allowPublicProfile, bool allowCredentialSharing, bool allowConsciousnessScoring, bool allowEnterpriseAccess) external;
    function setCredentialVisibility(CredentialType credType, bool isPublic) external;
    
    // View functions
    function getIdentity(address user) external view returns (VerificationLevel, uint256, uint256, string memory, bool, uint256, uint256);
    function getCredential(address user, CredentialType credType) external view returns (address, uint256, uint256, uint256, bool, bool, string memory);
    function canViewCredential(address viewer, address user, CredentialType credType) external view returns (bool);
    function verifyAttestation(bytes32 attestationId) external view returns (bool);
    
    // Admin functions
    function setTrustedIssuer(address issuer, bool trusted) external;
}