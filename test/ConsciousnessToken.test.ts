import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { ConsciousnessToken } from "../typechain-types";

describe("ConsciousnessToken", function () {
  let consciousnessToken: ConsciousnessToken;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let rewardDistributor: SignerWithAddress;

  const TOTAL_SUPPLY = ethers.parseEther("1000000"); // 1M tokens
  const INITIAL_MINT = ethers.parseEther("100000");  // 100K tokens

  beforeEach(async function () {
    [owner, user1, user2, rewardDistributor] = await ethers.getSigners();
    
    const ConsciousnessTokenFactory = await ethers.getContractFactory("ConsciousnessToken");
    consciousnessToken = await ConsciousnessTokenFactory.deploy(
      "Consciousness Token",
      "CONS",
      TOTAL_SUPPLY,
      INITIAL_MINT
    );
    await consciousnessToken.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right name and symbol", async function () {
      expect(await consciousnessToken.name()).to.equal("Consciousness Token");
      expect(await consciousnessToken.symbol()).to.equal("CONS");
    });

    it("Should mint initial supply to owner", async function () {
      expect(await consciousnessToken.balanceOf(owner.address)).to.equal(INITIAL_MINT);
      expect(await consciousnessToken.totalSupply()).to.equal(INITIAL_MINT);
    });

    it("Should have correct total supply limit", async function () {
      expect(await consciousnessToken.maxTotalSupply()).to.equal(TOTAL_SUPPLY);
    });
  });

  describe("Minting", function () {
    beforeEach(async function () {
      // Grant minter role to owner
      await consciousnessToken.grantRole(await consciousnessToken.MINTER_ROLE(), owner.address);
    });

    it("Should allow minter to mint tokens", async function () {
      const mintAmount = ethers.parseEther("1000");
      
      await consciousnessToken.mint(user1.address, mintAmount);
      
      expect(await consciousnessToken.balanceOf(user1.address)).to.equal(mintAmount);
      expect(await consciousnessToken.totalSupply()).to.equal(INITIAL_MINT + mintAmount);
    });

    it("Should not allow minting above max supply", async function () {
      const mintAmount = TOTAL_SUPPLY; // Try to mint max supply (will exceed with initial mint)
      
      await expect(
        consciousnessToken.mint(user1.address, mintAmount)
      ).to.be.revertedWith("Max supply exceeded");
    });

    it("Should not allow non-minter to mint", async function () {
      await expect(
        consciousnessToken.connect(user1).mint(user1.address, ethers.parseEther("1000"))
      ).to.be.reverted;
    });
  });

  describe("Staking", function () {
    beforeEach(async function () {
      // Transfer some tokens to users for testing
      await consciousnessToken.transfer(user1.address, ethers.parseEther("10000"));
      await consciousnessToken.transfer(user2.address, ethers.parseEther("5000"));
    });

    it("Should allow users to stake tokens", async function () {
      const stakeAmount = ethers.parseEther("1000");
      const lockPeriod = 30 * 24 * 60 * 60; // 30 days

      await consciousnessToken.connect(user1).stake(stakeAmount, lockPeriod);

      expect(await consciousnessToken.totalStakedByUser(user1.address)).to.equal(stakeAmount);
      expect(await consciousnessToken.balanceOf(user1.address)).to.equal(ethers.parseEther("9000"));
    });

    it("Should track staking positions correctly", async function () {
      const stakeAmount = ethers.parseEther("1000");
      const lockPeriod = 90 * 24 * 60 * 60; // 90 days

      await consciousnessToken.connect(user1).stake(stakeAmount, lockPeriod);
      
      const positions = await consciousnessToken.getStakingPositions(user1.address);
      expect(positions.length).to.equal(1);
      expect(positions[0][0]).to.equal(stakeAmount); // amount
      expect(positions[0][2]).to.equal(lockPeriod); // lock period
      expect(positions[0][4]).to.be.true; // is active
    });

    it("Should calculate rewards correctly", async function () {
      const stakeAmount = ethers.parseEther("1000");
      const lockPeriod = 0; // No lock period

      await consciousnessToken.connect(user1).stake(stakeAmount, lockPeriod);
      
      // Fast forward time to accumulate rewards
      await ethers.provider.send("evm_increaseTime", [365 * 24 * 60 * 60]); // 1 year
      await ethers.provider.send("evm_mine", []);

      const rewards = await consciousnessToken.getPendingRewards(user1.address);
      expect(rewards).to.be.gt(0);
    });

    it("Should apply lock period multipliers", async function () {
      const stakeAmount = ethers.parseEther("1000");
      const shortLock = 0; // No lock
      const longLock = 365 * 24 * 60 * 60; // 1 year

      // Stake with no lock
      await consciousnessToken.connect(user1).stake(stakeAmount, shortLock);
      
      // Stake with long lock
      await consciousnessToken.connect(user2).stake(stakeAmount, longLock);

      // Fast forward time
      await ethers.provider.send("evm_increaseTime", [365 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);

      const rewardsNoLock = await consciousnessToken.getPendingRewards(user1.address);
      const rewardsWithLock = await consciousnessToken.getPendingRewards(user2.address);
      
      expect(rewardsWithLock).to.be.gt(rewardsNoLock); // Long lock should have more rewards
    });

    it("Should not allow unstaking before lock period", async function () {
      const stakeAmount = ethers.parseEther("1000");
      const lockPeriod = 30 * 24 * 60 * 60; // 30 days

      await consciousnessToken.connect(user1).stake(stakeAmount, lockPeriod);

      await expect(
        consciousnessToken.connect(user1).unstake(0)
      ).to.be.revertedWith("Lock period not expired");
    });

    it("Should allow unstaking after lock period", async function () {
      const stakeAmount = ethers.parseEther("1000");
      const lockPeriod = 30 * 24 * 60 * 60; // 30 days

      await consciousnessToken.connect(user1).stake(stakeAmount, lockPeriod);

      // Fast forward past lock period
      await ethers.provider.send("evm_increaseTime", [lockPeriod + 1]);
      await ethers.provider.send("evm_mine", []);

      const balanceBefore = await consciousnessToken.balanceOf(user1.address);
      await consciousnessToken.connect(user1).unstake(0);
      const balanceAfter = await consciousnessToken.balanceOf(user1.address);

      expect(balanceAfter).to.be.gt(balanceBefore); // Should get staked amount + rewards
      expect(await consciousnessToken.totalStakedByUser(user1.address)).to.equal(0);
    });
  });

  describe("Rewards", function () {
    beforeEach(async function () {
      // Setup reward distributor
      await consciousnessToken.grantRole(
        await consciousnessToken.REWARD_DISTRIBUTOR_ROLE(),
        rewardDistributor.address
      );
      
      // Transfer tokens for staking
      await consciousnessToken.transfer(user1.address, ethers.parseEther("5000"));
    });

    it("Should allow reward distributor to distribute rewards", async function () {
      const stakeAmount = ethers.parseEther("1000");
      
      await consciousnessToken.connect(user1).stake(stakeAmount, 0);
      
      // Distribute rewards
      const rewardAmount = ethers.parseEther("100");
      await consciousnessToken.connect(rewardDistributor).distributeRewards(user1.address, rewardAmount);
      
      const rewards = await consciousnessToken.getPendingRewards(user1.address);
      expect(rewards).to.be.gte(rewardAmount);
    });

    it("Should allow users to claim rewards", async function () {
      const stakeAmount = ethers.parseEther("1000");
      
      await consciousnessToken.connect(user1).stake(stakeAmount, 0);
      
      // Fast forward time to accumulate rewards
      await ethers.provider.send("evm_increaseTime", [30 * 24 * 60 * 60]); // 30 days
      await ethers.provider.send("evm_mine", []);

      const rewardsBefore = await consciousnessToken.getPendingRewards(user1.address);
      expect(rewardsBefore).to.be.gt(0);

      const balanceBefore = await consciousnessToken.balanceOf(user1.address);
      await consciousnessToken.connect(user1).claimRewards();
      const balanceAfter = await consciousnessToken.balanceOf(user1.address);

      expect(balanceAfter).to.be.gt(balanceBefore);
      expect(await consciousnessToken.getPendingRewards(user1.address)).to.be.lt(rewardsBefore);
    });

    it("Should not allow claiming zero rewards", async function () {
      await expect(
        consciousnessToken.connect(user1).claimRewards()
      ).to.be.revertedWith("No rewards to claim");
    });
  });

  describe("Consciousness Verification", function () {
    it("Should allow admin to set consciousness verification", async function () {
      await consciousnessToken.setConsciousnessVerified(user1.address, true);
      expect(await consciousnessToken.consciousnessVerified(user1.address)).to.be.true;
    });

    it("Should not allow non-admin to set consciousness verification", async function () {
      await expect(
        consciousnessToken.connect(user1).setConsciousnessVerified(user1.address, true)
      ).to.be.reverted;
    });
  });

  describe("Governance Features", function () {
    beforeEach(async function () {
      // Setup staking for governance power
      await consciousnessToken.transfer(user1.address, ethers.parseEther("5000"));
      await consciousnessToken.connect(user1).stake(ethers.parseEther("2000"), 0);
    });

    it("Should track governance power correctly", async function () {
      const governancePower = await consciousnessToken.getVotingPower(user1.address);
      expect(governancePower).to.be.gt(0);
    });

    it("Should increase governance power for consciousness verified users", async function () {
      const powerBefore = await consciousnessToken.getVotingPower(user1.address);
      
      await consciousnessToken.setConsciousnessVerified(user1.address, true);
      
      const powerAfter = await consciousnessToken.getVotingPower(user1.address);
      expect(powerAfter).to.be.gt(powerBefore);
    });
  });

  describe("Access Control", function () {
    it("Should have correct default admin role", async function () {
      const defaultAdminRole = await consciousnessToken.DEFAULT_ADMIN_ROLE();
      expect(await consciousnessToken.hasRole(defaultAdminRole, owner.address)).to.be.true;
    });

    it("Should allow admin to grant roles", async function () {
      const minterRole = await consciousnessToken.MINTER_ROLE();
      
      await consciousnessToken.grantRole(minterRole, user1.address);
      
      expect(await consciousnessToken.hasRole(minterRole, user1.address)).to.be.true;
    });

    it("Should allow admin to revoke roles", async function () {
      const minterRole = await consciousnessToken.MINTER_ROLE();
      
      await consciousnessToken.grantRole(minterRole, user1.address);
      await consciousnessToken.revokeRole(minterRole, user1.address);
      
      expect(await consciousnessToken.hasRole(minterRole, user1.address)).to.be.false;
    });
  });

  describe("Emergency Controls", function () {
    it("Should allow admin to pause contract", async function () {
      await consciousnessToken.pause();
      expect(await consciousnessToken.paused()).to.be.true;
    });

    it("Should prevent transfers when paused", async function () {
      await consciousnessToken.pause();
      
      await expect(
        consciousnessToken.transfer(user1.address, ethers.parseEther("100"))
      ).to.be.reverted;
    });

    it("Should allow admin to unpause contract", async function () {
      await consciousnessToken.pause();
      await consciousnessToken.unpause();
      
      expect(await consciousnessToken.paused()).to.be.false;
      
      // Should work normally after unpausing
      await consciousnessToken.transfer(user1.address, ethers.parseEther("100"));
      expect(await consciousnessToken.balanceOf(user1.address)).to.equal(ethers.parseEther("100"));
    });

    it("Should not allow non-admin to pause", async function () {
      await expect(
        consciousnessToken.connect(user1).pause()
      ).to.be.reverted;
    });
  });
});