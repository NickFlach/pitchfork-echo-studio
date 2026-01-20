/**
 * PFORK Token Tests
 *
 * Basic test suite for the PFORK token contract.
 * Tests core ERC20 functionality and minting capabilities.
 */

const { expect } = require("chai");
const hre = require("hardhat");

describe("PFORK Token", function () {
  let pfork;
  let owner;
  let addr1;
  let addr2;

  const INITIAL_SUPPLY = hre.ethers.parseEther("100000000"); // 100M tokens
  const MAX_SUPPLY = hre.ethers.parseEther("1000000000"); // 1B tokens

  beforeEach(async function () {
    [owner, addr1, addr2] = await hre.ethers.getSigners();

    const PFORK = await hre.ethers.getContractFactory("PFORK");
    pfork = await PFORK.deploy("Pitchfork Token", "PFORK", INITIAL_SUPPLY);
    await pfork.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      expect(await pfork.name()).to.equal("Pitchfork Token");
      expect(await pfork.symbol()).to.equal("PFORK");
    });

    it("Should assign the total supply to the owner", async function () {
      const ownerBalance = await pfork.balanceOf(owner.address);
      expect(await pfork.totalSupply()).to.equal(ownerBalance);
    });

    it("Should set the correct initial supply", async function () {
      expect(await pfork.totalSupply()).to.equal(INITIAL_SUPPLY);
    });

    it("Should set the correct max supply", async function () {
      expect(await pfork.maxSupply()).to.equal(MAX_SUPPLY);
    });

    it("Should grant MINTER_ROLE to deployer", async function () {
      const MINTER_ROLE = await pfork.MINTER_ROLE();
      expect(await pfork.hasRole(MINTER_ROLE, owner.address)).to.be.true;
    });
  });

  describe("Transfers", function () {
    it("Should transfer tokens between accounts", async function () {
      const amount = hre.ethers.parseEther("100");

      await pfork.transfer(addr1.address, amount);
      expect(await pfork.balanceOf(addr1.address)).to.equal(amount);

      await pfork.connect(addr1).transfer(addr2.address, amount);
      expect(await pfork.balanceOf(addr2.address)).to.equal(amount);
      expect(await pfork.balanceOf(addr1.address)).to.equal(0);
    });

    it("Should fail if sender doesn't have enough tokens", async function () {
      const initialOwnerBalance = await pfork.balanceOf(owner.address);
      await expect(
        pfork.connect(addr1).transfer(owner.address, 1)
      ).to.be.reverted;
      expect(await pfork.balanceOf(owner.address)).to.equal(initialOwnerBalance);
    });
  });

  describe("Minting", function () {
    it("Should allow MINTER_ROLE to mint tokens", async function () {
      const mintAmount = hre.ethers.parseEther("1000");
      await pfork.mint(addr1.address, mintAmount);
      expect(await pfork.balanceOf(addr1.address)).to.equal(mintAmount);
    });

    it("Should not allow non-minters to mint", async function () {
      const mintAmount = hre.ethers.parseEther("1000");
      await expect(
        pfork.connect(addr1).mint(addr1.address, mintAmount)
      ).to.be.reverted;
    });

    it("Should not mint beyond max supply", async function () {
      const remaining = await pfork.remainingMintable();
      await expect(
        pfork.mint(addr1.address, remaining + 1n)
      ).to.be.revertedWith("Would exceed max supply");
    });
  });

  describe("Burning", function () {
    it("Should allow burning tokens", async function () {
      const burnAmount = hre.ethers.parseEther("1000");
      const initialBalance = await pfork.balanceOf(owner.address);

      await pfork.burn(burnAmount);

      expect(await pfork.balanceOf(owner.address)).to.equal(
        initialBalance - burnAmount
      );
    });
  });

  describe("Reward Distribution", function () {
    it("Should allow REWARD_DISTRIBUTOR_ROLE to distribute rewards", async function () {
      const rewardAmount = hre.ethers.parseEther("500");

      await expect(pfork.distributeReward(addr1.address, rewardAmount, "Test reward"))
        .to.emit(pfork, "RewardDistributed")
        .withArgs(addr1.address, rewardAmount, "Test reward");

      expect(await pfork.balanceOf(addr1.address)).to.equal(rewardAmount);
    });
  });
});
