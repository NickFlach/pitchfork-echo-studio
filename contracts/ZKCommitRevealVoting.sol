// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ISemaphore} from "@semaphore-protocol/contracts/interfaces/ISemaphore.sol";
import {Semaphore} from "@semaphore-protocol/contracts/Semaphore.sol";

/// @notice Equal-weight, allowlisted Semaphore membership proofs with secret ballots until reveal.
/// @dev No treasury execution. Membership registration is public; transaction senders remain public.
contract ZKCommitRevealVoting {
    uint256 public constant CHAIN_ID = 47763;
    Semaphore public immutable semaphore;
    uint256 public proposalCount;
    struct Proposal {
        string title;
        string description;
        address creator;
        uint256 groupId;
        uint256 registrationEnd;
        uint256 commitEnd;
        uint256 revealEnd;
        uint256 quorum;
        uint256 committed;
        uint256 revealed;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 abstainVotes;
        bool tallied;
        bool passed;
    }
    mapping(uint256 => Proposal) private proposals;
    mapping(uint256 => address[]) private electorates;
    mapping(uint256 => uint256[]) private members;
    mapping(uint256 => mapping(address => bool)) public eligible;
    mapping(uint256 => mapping(address => bool)) public registered;
    mapping(uint256 => mapping(uint256 => bool)) public registeredIdentity;
    mapping(uint256 => mapping(uint256 => uint256)) public commitments;
    mapping(uint256 => mapping(uint256 => bool)) public revealed;
    event ProposalCreated(uint256 indexed proposalId, address indexed creator);
    event MemberRegistered(uint256 indexed proposalId, uint256 identityCommitment);
    event VoteCommitted(uint256 indexed proposalId, uint256 indexed nullifier, uint256 commitment);
    event VoteRevealed(uint256 indexed proposalId, uint256 indexed nullifier, uint8 choice);
    event Tallied(uint256 indexed proposalId, bool passed, uint256 unrevealed);

    modifier neoX() { require(block.chainid == CHAIN_ID, "Neo X mainnet required"); _; }
    constructor(Semaphore _semaphore) {
        require(address(_semaphore).code.length > 0, "Missing Semaphore");
        semaphore = _semaphore;
    }
    function createProposal(string calldata title, string calldata description, address[] calldata voters,
        uint256 registrationSeconds, uint256 commitSeconds, uint256 revealSeconds, uint256 quorum
    ) external neoX returns (uint256 proposalId) {
        require(bytes(title).length >= 3 && bytes(title).length <= 200, "Invalid title");
        require(bytes(description).length >= 10 && bytes(description).length <= 4000, "Invalid description");
        require(voters.length >= 3 && voters.length <= 100, "Require 3 to 100 eligible wallets");
        require(quorum > 0 && quorum <= voters.length, "Invalid quorum");
        require(registrationSeconds >= 60 && commitSeconds >= 60 && revealSeconds >= 60, "Phase too short");
        require(registrationSeconds <= 30 days && commitSeconds <= 30 days && revealSeconds <= 30 days, "Phase too long");
        proposalId = ++proposalCount;
        for (uint256 i; i < voters.length; ++i) {
            require(voters[i] != address(0) && !eligible[proposalId][voters[i]], "Invalid or duplicate voter");
            eligible[proposalId][voters[i]] = true;
            electorates[proposalId].push(voters[i]);
        }
        uint256 groupId = semaphore.createGroup(address(this), 0);
        Proposal storage p = proposals[proposalId];
        p.title = title; p.description = description; p.creator = msg.sender; p.groupId = groupId;
        p.registrationEnd = block.timestamp + registrationSeconds;
        p.commitEnd = p.registrationEnd + commitSeconds; p.revealEnd = p.commitEnd + revealSeconds;
        p.quorum = quorum;
        emit ProposalCreated(proposalId, msg.sender);
    }
    function getProposal(uint256 id) public view returns (Proposal memory) {
        require(id > 0 && id <= proposalCount, "Unknown proposal"); return proposals[id];
    }
    function getElectorate(uint256 id) external view returns (address[] memory) { return electorates[id]; }
    function getMembers(uint256 id) external view returns (uint256[] memory) { return members[id]; }
    function scope(uint256 id) public view returns (uint256) {
        return uint256(keccak256(abi.encode("PITCHFORK_ZK_VOTE_V1", block.chainid, address(this), id)));
    }
    function ballotCommitment(uint256 id, uint256 nullifier, uint8 choice, bytes32 salt) public view returns (uint256) {
        return uint256(keccak256(abi.encode(scope(id), nullifier, choice, salt)));
    }
    function register(uint256 id, uint256 identityCommitment) external neoX {
        Proposal storage p = proposals[id];
        require(id > 0 && id <= proposalCount && block.timestamp < p.registrationEnd, "Registration closed");
        require(eligible[id][msg.sender] && !registered[id][msg.sender], "Ineligible or registered");
        require(identityCommitment != 0 && !registeredIdentity[id][identityCommitment], "Invalid identity");
        registered[id][msg.sender] = true; registeredIdentity[id][identityCommitment] = true;
        members[id].push(identityCommitment); semaphore.addMember(p.groupId, identityCommitment);
        emit MemberRegistered(id, identityCommitment);
    }
    function commit(uint256 id, ISemaphore.SemaphoreProof calldata proof) external neoX {
        Proposal storage p = proposals[id];
        require(block.timestamp >= p.registrationEnd && block.timestamp < p.commitEnd && id > 0 && id <= proposalCount, "Not commit phase");
        require(members[id].length >= 3, "Insufficient anonymity set");
        require(proof.scope == scope(id) && proof.message != 0, "Invalid ballot domain");
        require(commitments[id][proof.nullifier] == 0, "Already committed");
        // Use verifyProof rather than public validateProof: a third party cannot burn a ballot nullifier.
        require(semaphore.verifyProof(p.groupId, proof), "Invalid membership proof");
        commitments[id][proof.nullifier] = proof.message; ++p.committed;
        emit VoteCommitted(id, proof.nullifier, proof.message);
    }
    function reveal(uint256 id, uint256 nullifier, uint8 choice, bytes32 salt) external neoX {
        Proposal storage p = proposals[id];
        require(block.timestamp >= p.commitEnd && block.timestamp < p.revealEnd && id > 0 && id <= proposalCount, "Not reveal phase");
        require(choice <= 2, "Invalid choice");
        require(commitments[id][nullifier] != 0 && !revealed[id][nullifier], "Missing or revealed ballot");
        require(commitments[id][nullifier] == ballotCommitment(id, nullifier, choice, salt), "Invalid reveal");
        revealed[id][nullifier] = true; ++p.revealed;
        if (choice == 0) ++p.forVotes; else if (choice == 1) ++p.againstVotes; else ++p.abstainVotes;
        emit VoteRevealed(id, nullifier, choice);
    }
    function tally(uint256 id) external neoX {
        Proposal storage p = proposals[id];
        require(id > 0 && id <= proposalCount && block.timestamp >= p.revealEnd, "Not tally phase");
        require(!p.tallied, "Already tallied");
        p.tallied = true; p.passed = p.revealed >= p.quorum && p.forVotes > p.againstVotes;
        emit Tallied(id, p.passed, p.committed - p.revealed);
    }
}