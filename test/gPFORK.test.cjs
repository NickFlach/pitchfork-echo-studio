/**
 * gPFORK Staking Token Tests
 *
 * Tests for the upgradeable gPFORK staking wrapper contract.
 * Tests staking, unstaking, voting power, and upgrade functionality.
 */

const { expect } = require("chai");
const hre = require("hardhat");

describe("gPFORK Staking Token", function () {
  let pfork;
  let gPfork;
  let owner;
  let addr1;
  let addr2;

  const INITIAL_SUPPLY = hre.ethers.parseEther("100000000");
  const STAKE_AMOUNT = hre.ethers.parseEther("10000");
  const REWARDS_DURATION = 365 * 24 * 60 * 60; // 1 year

  beforeEach(async function () {
    [owner, addr1, addr2] = await hre.ethers.getSigners();

    // Deploy PFORK token
    const PFORK = await hre.ethers.getContractFactory("PFORK");
    pfork = await PFORK.deploy("Pitchfork Token", "PFORK", INITIAL_SUPPLY);
    await pfork.waitForDeployment();

    // Deploy gPFORK as upgradeable proxy
    const gPFORK = await hre.ethers.getContractFactory("gPFORK");
    gPfork = await hre.upgrades.deployProxy(
      gPFORK,
      [
        await pfork.getAddress(),
        owner.address, // admin
        owner.address, // upgrader
        REWARDS_DURATION
      ],
      { kind: "uups" }
    );
    await gPfork.waitForDeployment();

    // Transfer PFORK to addr1 for testing
    await pfork.transfer(addr1.address, STAKE_AMOUNT * 10n);

    // Approve gPFORK to spend PFORK
    await pfork.connect(addr1).approve(await gPfork.getAddress(), hre.ethers.MaxUint256);
  });

  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      expect(await gPfork.name()).to.equal("Governance Pitchfork");
      expect(await gPfork.symbol()).to.equal("gPFORK");
    });

    it("Should set the correct staking token", async function () {
      expect(await gPfork.pfork()).to.equal(await pfork.getAddress());
    });

    it("Should start with zero total supply", async function () {
      expect(await gPfork.totalSupply()).to.equal(0);
    });
  });

  describe("Staking", function () {
    it("Should allow staking PFORK for gPFORK", async function () {
      await gPfork.connect(addr1).stake(STAKE_AMOUNT);

      expect(await gPfork.balanceOf(addr1.address)).to.equal(STAKE_AMOUNT);
      expect(await pfork.balanceOf(addr1.address)).to.equal(STAKE_AMOUNT * 9n);
    });

    it("Should emit Staked event", async function () {
      await expect(gPfork.connect(addr1).stake(STAKE_AMOUNT))
        .to.emit(gPfork, "Staked")
        .withArgs(addr1.address, STAKE_AMOUNT);
    });

    it("Should fail if user has insufficient PFORK", async function () {
      const tooMuch = STAKE_AMOUNT * 100n;
      await expect(
        gPfork.connect(addr1).stake(tooMuch)
      ).to.be.reverted;
    });
  });

  describe("Unstaking", function () {
    beforeEach(async function () {
      await gPfork.connect(addr1).stake(STAKE_AMOUNT);
    });

    it("Should allow unstaking gPFORK for PFORK", async function () {
      const initialPFORK = await pfork.balanceOf(addr1.address);

      await gPfork.connect(addr1).unstake(STAKE_AMOUNT);

      expect(await gPfork.balanceOf(addr1.address)).to.equal(0);
      expect(await pfork.balanceOf(addr1.address)).to.equal(
        initialPFORK + STAKE_AMOUNT
      );
    });

    it("Should emit Unstaked event", async function () {
      await expect(gPfork.connect(addr1).unstake(STAKE_AMOUNT))
        .to.emit(gPfork, "Unstaked")
        .withArgs(addr1.address, STAKE_AMOUNT);
    });

    it("Should fail if user has insufficient gPFORK", async function () {
      await expect(
        gPfork.connect(addr1).unstake(STAKE_AMOUNT * 2n)
      ).to.be.reverted;
    });
  });

  describe("Voting Power", function () {
    it("Should grant voting power equal to staked amount", async function () {
      await gPfork.connect(addr1).stake(STAKE_AMOUNT);

      // Self-delegate to activate voting power
      await gPfork.connect(addr1).delegate(addr1.address);

      expect(await gPfork.getVotes(addr1.address)).to.equal(STAKE_AMOUNT);
    });

    it("Should allow delegation of votes", async function () {
      await gPfork.connect(addr1).stake(STAKE_AMOUNT);
      await gPfork.connect(addr1).delegate(addr2.address);

      expect(await gPfork.getVotes(addr2.address)).to.equal(STAKE_AMOUNT);
      expect(await gPfork.getVotes(addr1.address)).to.equal(0);
    });
  });

  describe("Access Control", function () {
    it("Should have correct roles assigned", async function () {
      const DEFAULT_ADMIN_ROLE = await gPfork.DEFAULT_ADMIN_ROLE();
      const UPGRADER_ROLE = await gPfork.UPGRADER_ROLE();

      expect(await gPfork.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
      expect(await gPfork.hasRole(UPGRADER_ROLE, owner.address)).to.be.true;
    });
  });
});
