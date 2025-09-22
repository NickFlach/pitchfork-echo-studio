import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import {
  ConsciousnessToken,
  ConsciousnessAchievements,
  AIServicePayment,
  LeadershipSubscription,
  ConsciousnessIdentity,
  ConsciousnessDAO
} from "../../typechain-types";

describe("Full Platform Integration", function () {
  let consciousnessToken: ConsciousnessToken;
  let achievements: ConsciousnessAchievements;
  let aiPayment: AIServicePayment;
  let subscription: LeadershipSubscription;
  let identity: ConsciousnessIdentity;
  let dao: ConsciousnessDAO;

  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let enterpriseUser: SignerWithAddress;

  beforeEach(async function () {
    [owner, user1, user2, enterpriseUser] = await ethers.getSigners();

    // Deploy all contracts
    const ConsciousnessTokenFactory = await ethers.getContractFactory("ConsciousnessToken");
    consciousnessToken = await ConsciousnessTokenFactory.deploy(
      "Consciousness Token",
      "CONS",
      ethers.parseEther("1000000"),
      ethers.parseEther("100000")
    );
    await consciousnessToken.waitForDeployment();

    const tokenAddress = await consciousnessToken.getAddress();

    const AchievementsFactory = await ethers.getContractFactory("ConsciousnessAchievements");
    achievements = await AchievementsFactory.deploy(
      "Consciousness Achievements",
      "CONSACH",
      tokenAddress
    );
    await achievements.waitForDeployment();

    const achievementsAddress = await achievements.getAddress();

    const AIPaymentFactory = await ethers.getContractFactory("AIServicePayment");
    aiPayment = await AIPaymentFactory.deploy(tokenAddress);
    await aiPayment.waitForDeployment();

    const SubscriptionFactory = await ethers.getContractFactory("LeadershipSubscription");
    subscription = await SubscriptionFactory.deploy(tokenAddress, achievementsAddress);
    await subscription.waitForDeployment();

    const IdentityFactory = await ethers.getContractFactory("ConsciousnessIdentity");
    identity = await IdentityFactory.deploy(tokenAddress, achievementsAddress);
    await identity.waitForDeployment();

    const DAOFactory = await ethers.getContractFactory("ConsciousnessDAO");
    dao = await DAOFactory.deploy(
      tokenAddress,
      await identity.getAddress(),
      await subscription.getAddress()
    );
    await dao.waitForDeployment();

    // Setup roles and permissions
    await consciousnessToken.grantRole(
      await consciousnessToken.REWARD_DISTRIBUTOR_ROLE(),
      achievementsAddress
    );
    await consciousnessToken.grantRole(
      await consciousnessToken.REWARD_DISTRIBUTOR_ROLE(),
      await subscription.getAddress()
    );
    await achievements.grantRole(
      await achievements.ACHIEVEMENT_ISSUER_ROLE(),
      await identity.getAddress()
    );

    // Setup payment tokens
    await aiPayment.setSupportedPaymentToken(tokenAddress, true);
    await subscription.setSupportedPaymentToken(tokenAddress, true);

    // Distribute tokens for testing
    await consciousnessToken.transfer(user1.address, ethers.parseEther("10000"));
    await consciousnessToken.transfer(user2.address, ethers.parseEther("10000"));
    await consciousnessToken.transfer(enterpriseUser.address, ethers.parseEther("50000"));
  });

  describe("End-to-End User Journey", function () {
    it("Should complete full user consciousness development journey", async function () {
      // 1. User creates identity
      await identity.connect(user1).createIdentity("QmTestProfile", ethers.keccak256(ethers.toUtf8Bytes("private")), false);
      
      const userIdentity = await identity.getIdentity(user1.address);
      expect(userIdentity[0]).to.equal(1); // BASIC verification level

      // 2. User stakes tokens for governance power
      await consciousnessToken.connect(user1).stake(ethers.parseEther("5000"), 0);
      
      const stakedBalance = await consciousnessToken.totalStakedByUser(user1.address);
      expect(stakedBalance).to.equal(ethers.parseEther("5000"));

      // 3. User gets consciousness score update
      await identity.updateConsciousnessScore(user1.address, 400, "QmAssessmentData");
      
      // 4. User earns achievement based on consciousness score
      await achievements.issueAchievement(
        user1.address,
        0, // CONSCIOUS_LEADER category
        400, // consciousness score
        300, // assessment score
        ["leadership", "awareness"]
      );
      
      const userAchievements = await achievements.getUserAchievements(user1.address);
      expect(userAchievements.length).to.equal(1);

      // 5. User subscribes to premium tier
      await consciousnessToken.connect(user1).approve(await subscription.getAddress(), ethers.parseEther("150"));
      await subscription.connect(user1).subscribe(2, false, await consciousnessToken.getAddress(), true); // Premium tier
      
      const userSubscription = await subscription.getSubscription(user1.address);
      expect(userSubscription[0]).to.equal(2); // Premium tier
      expect(userSubscription[6]).to.be.true; // isActive

      // 6. User funds AI service account
      await consciousnessToken.connect(user1).approve(await aiPayment.getAddress(), ethers.parseEther("100"));
      await aiPayment.connect(user1).fundAccount(await consciousnessToken.getAddress(), ethers.parseEther("100"));
      
      const aiBalance = await aiPayment.getUserTokenBalance(user1.address, await consciousnessToken.getAddress());
      expect(aiBalance).to.equal(ethers.parseEther("100"));

      // 7. User participates in governance
      const votingPower = await dao.getVotingPower(user1.address);
      expect(votingPower).to.be.gt(0);
    });

    it("Should handle enterprise user with advanced features", async function () {
      // Enterprise user setup
      await identity.connect(enterpriseUser).createIdentity("QmEnterpriseProfile", ethers.keccak256(ethers.toUtf8Bytes("enterprise")), true);
      
      // Stake significant amount for governance
      await consciousnessToken.connect(enterpriseUser).stake(ethers.parseEther("30000"), 365 * 24 * 60 * 60); // 1 year lock
      
      // Subscribe to enterprise tier
      await consciousnessToken.connect(enterpriseUser).approve(await subscription.getAddress(), ethers.parseEther("5000"));
      await subscription.connect(enterpriseUser).subscribe(3, true, await consciousnessToken.getAddress(), true); // Enterprise tier, annual
      
      const enterpriseSubscription = await subscription.getSubscription(enterpriseUser.address);
      expect(enterpriseSubscription[0]).to.equal(3); // Enterprise tier
      expect(enterpriseSubscription[7]).to.equal(20); // High voting power

      // Check advanced features access
      const hasAPIAccess = await subscription.hasFeatureAccess(enterpriseUser.address, "api_access");
      const hasWhiteLabel = await subscription.hasFeatureAccess(enterpriseUser.address, "white_label");
      expect(hasAPIAccess).to.be.true;
      expect(hasWhiteLabel).to.be.true;

      // Enterprise user can create governance proposals
      const totalVotingPower = await dao.getVotingPower(enterpriseUser.address);
      expect(totalVotingPower).to.be.gt(ethers.parseEther("30000")); // Should include subscription bonus
    });
  });

  describe("Cross-Contract Interactions", function () {
    beforeEach(async function () {
      // Setup users with basic requirements
      await consciousnessToken.connect(user1).stake(ethers.parseEther("2000"), 0);
      await consciousnessToken.connect(user2).stake(ethers.parseEther("3000"), 0);
      
      await identity.connect(user1).createIdentity("QmUser1", ethers.keccak256(ethers.toUtf8Bytes("user1")), false);
      await identity.connect(user2).createIdentity("QmUser2", ethers.keccak256(ethers.toUtf8Bytes("user2")), false);
    });

    it("Should synchronize consciousness scores across contracts", async function () {
      // Update consciousness score in identity contract
      await identity.updateConsciousnessScore(user1.address, 600, "QmHighScoreAssessment");
      
      // Score should affect token verification status
      const isVerified = await consciousnessToken.consciousnessVerified(user1.address);
      expect(isVerified).to.be.true; // Should be verified with score >= 500

      // Score should affect achievement eligibility
      const canReceiveAchievement = await achievements.canReceiveAchievement(user1.address, 5); // WISDOM_KEEPER
      expect(canReceiveAchievement).to.be.true; // High score should allow advanced achievements
    });

    it("Should integrate subscription tiers with voting power", async function () {
      // Subscribe to premium tier
      await consciousnessToken.connect(user1).approve(await subscription.getAddress(), ethers.parseEther("150"));
      await subscription.connect(user1).subscribe(2, false, await consciousnessToken.getAddress(), true);
      
      const baseVotingPower = await dao.getVotingPower(user2.address); // No subscription
      const premiumVotingPower = await dao.getVotingPower(user1.address); // Premium subscription
      
      expect(premiumVotingPower).to.be.gt(baseVotingPower); // Premium should have more voting power
    });

    it("Should coordinate AI service payments with usage tracking", async function () {
      // Fund AI service account
      await consciousnessToken.connect(user1).approve(await aiPayment.getAddress(), ethers.parseEther("50"));
      await aiPayment.connect(user1).fundAccount(await consciousnessToken.getAddress(), ethers.parseEther("50"));
      
      // Check service access
      const canAccess = await aiPayment.canAccessService(user1.address, 0); // consciousness_analysis
      expect(canAccess[0]).to.be.true; // Should have access with funded account
      
      // Simulate service usage (in real implementation, this would be called by backend)
      // This demonstrates the integration between payment and usage tracking
      const balanceBefore = await aiPayment.getUserTokenBalance(user1.address, await consciousnessToken.getAddress());
      expect(balanceBefore).to.equal(ethers.parseEther("50"));
    });
  });

  describe("Governance Integration", function () {
    beforeEach(async function () {
      // Setup users with governance power
      await consciousnessToken.connect(user1).stake(ethers.parseEther("5000"), 0);
      await consciousnessToken.connect(user2).stake(ethers.parseEther("3000"), 0);
      
      // Subscribe for additional voting power
      await consciousnessToken.connect(user1).approve(await subscription.getAddress(), ethers.parseEther("500"));
      await subscription.connect(user1).subscribe(3, false, await consciousnessToken.getAddress(), true); // Enterprise
    });

    it("Should create and vote on platform development proposal", async function () {
      // Create proposal
      const tx = await dao.connect(user1).createProposal(
        0, // PLATFORM_DEVELOPMENT
        "Implement New Analytics Dashboard",
        "Add comprehensive analytics for consciousness development tracking",
        "QmExecutionDetails",
        [], [], [] // No treasury request
      );
      
      const receipt = await tx.wait();
      const proposalCreatedEvent = receipt?.logs.find(
        log => log.topics[0] === ethers.id("ProposalCreated(uint256,address,uint8,string)")
      );
      
      expect(proposalCreatedEvent).to.not.be.undefined;
      
      // Vote on proposal
      await dao.connect(user1).castVote(1, 0, "Great idea for platform improvement"); // Vote FOR
      await dao.connect(user2).castVote(1, 0, "Agree with this proposal"); // Vote FOR
      
      const proposal = await dao.getProposal(1);
      expect(parseFloat(proposal[6])).to.be.gt(0); // Should have FOR votes
    });

    it("Should handle treasury allocation proposal", async function () {
      // First deposit some funds to DAO treasury
      await dao.connect(owner).depositToTreasury(ethers.ZeroAddress, ethers.parseEther("10"), {
        value: ethers.parseEther("10")
      });
      
      // Create treasury allocation proposal
      await dao.connect(user1).createProposal(
        3, // TREASURY_ALLOCATION
        "Fund Community Initiative",
        "Allocate 5 ETH for community development programs",
        "QmTreasuryExecutionPlan",
        [ethers.ZeroAddress], // ETH
        [ethers.parseEther("5")], // 5 ETH
        [user1.address] // Recipient
      );
      
      const proposal = await dao.getProposal(2);
      expect(proposal[1]).to.equal(3); // Should be TREASURY_ALLOCATION category
    });
  });

  describe("Achievement Evolution Flow", function () {
    it("Should evolve achievements based on consciousness growth", async function () {
      // Setup user with identity and initial consciousness score
      await identity.connect(user1).createIdentity("QmEvolutionTest", ethers.keccak256(ethers.toUtf8Bytes("evolution")), false);
      await identity.updateConsciousnessScore(user1.address, 300, "QmInitialAssessment");
      
      // Issue initial achievement
      await achievements.issueAchievement(user1.address, 0, 300, 250, ["basic_leadership"]);
      
      const initialAchievements = await achievements.getUserAchievements(user1.address);
      expect(initialAchievements.length).to.equal(1);
      
      const tokenId = initialAchievements[0];
      let achievement = await achievements.getAchievement(tokenId);
      expect(achievement[1]).to.equal(0); // BRONZE level
      
      // Improve consciousness score
      await identity.updateConsciousnessScore(user1.address, 500, "QmImprovedAssessment");
      
      // Check if evolution is possible
      const evolutionCheck = await achievements.canEvolveAchievement(tokenId);
      expect(evolutionCheck[0]).to.be.true; // Should be able to evolve
      
      // Evolve achievement
      await achievements.evolveAchievement(tokenId);
      
      achievement = await achievements.getAchievement(tokenId);
      expect(achievement[1]).to.equal(1); // Should be SILVER level now
    });

    it("Should require minimum consciousness levels for advanced achievements", async function () {
      await identity.connect(user1).createIdentity("QmAdvancedTest", ethers.keccak256(ethers.toUtf8Bytes("advanced")), false);
      await identity.updateConsciousnessScore(user1.address, 200, "QmLowAssessment"); // Low score
      
      // Try to issue advanced achievement (should fail with low consciousness score)
      await expect(
        achievements.issueAchievement(user1.address, 5, 200, 200, ["basic_wisdom"]) // WISDOM_KEEPER
      ).to.be.revertedWith("Consciousness level too low");
      
      // Improve consciousness score
      await identity.updateConsciousnessScore(user1.address, 700, "QmHighAssessment");
      
      // Now should be able to issue advanced achievement
      await achievements.issueAchievement(user1.address, 5, 700, 650, ["deep_wisdom", "insight"]);
      
      const userAchievements = await achievements.getUserAchievements(user1.address);
      expect(userAchievements.length).to.equal(1);
    });
  });

  describe("Emergency Scenarios", function () {
    it("Should handle emergency pause across all contracts", async function () {
      // Pause all contracts
      await consciousnessToken.pause();
      await achievements.pause();
      await subscription.pause();
      await identity.pause();
      await dao.emergencyPause("Platform maintenance");
      
      // Verify contracts are paused
      expect(await consciousnessToken.paused()).to.be.true;
      expect(await achievements.paused()).to.be.true;
      expect(await subscription.paused()).to.be.true;
      expect(await identity.paused()).to.be.true;
      expect(await dao.emergencyPause()).to.be.true;
      
      // Verify operations are blocked
      await expect(
        consciousnessToken.connect(user1).transfer(user2.address, ethers.parseEther("100"))
      ).to.be.reverted;
      
      await expect(
        subscription.connect(user1).subscribe(1, false, await consciousnessToken.getAddress(), false)
      ).to.be.reverted;
    });

    it("Should allow emergency recovery", async function () {
      // Pause contracts
      await consciousnessToken.pause();
      await dao.emergencyPause("Emergency test");
      
      // Unpause contracts
      await consciousnessToken.unpause();
      await dao.emergencyUnpause();
      
      // Verify normal operations work
      expect(await consciousnessToken.paused()).to.be.false;
      expect(await dao.emergencyPause()).to.be.false;
      
      await consciousnessToken.connect(user1).transfer(user2.address, ethers.parseEther("100"));
      expect(await consciousnessToken.balanceOf(user2.address)).to.equal(ethers.parseEther("10100"));
    });
  });
});