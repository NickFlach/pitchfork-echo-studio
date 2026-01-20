/**
 * Comprehensive Pitchfork Protocol Deployment Script
 *
 * Deploys the full governance stack including:
 * - PFORK token (base token)
 * - gPFORK staking wrapper (UUPS upgradeable with voting)
 * - PitchforkTimelock (governance execution delay)
 * - PitchforkGovernor (OpenZeppelin Governor)
 * - All application contracts (AIServicePayment, LeadershipSubscription, etc.)
 * - DecentralizationMetrics and PowerDiffusion
 * - DualGovernance for veto rights
 *
 * Post-deployment:
 * - Transfers UPGRADER_ROLE to Timelock
 * - Transfers DEFAULT_ADMIN_ROLE to Timelock
 * - Sets up proper role hierarchy
 */

const hre = require("hardhat");
const { ethers, network, upgrades } = hre;
const { writeFileSync, readFileSync, existsSync, mkdirSync, copyFileSync } = require("fs");
const { join, dirname } = require("path");

// Configuration constants
const TIMELOCK_MIN_DELAY = 2 * 24 * 60 * 60; // 2 days in seconds
const GOVERNOR_VOTING_DELAY = 7200; // ~1 day in blocks (12s blocks)
const GOVERNOR_VOTING_PERIOD = 50400; // ~1 week in blocks
const GOVERNOR_PROPOSAL_THRESHOLD = ethers.parseEther("10000"); // 10,000 gPFORK
const GOVERNOR_QUORUM_NUMERATOR = 4; // 4% quorum

const INITIAL_PFORK_SUPPLY = ethers.parseEther("100000000"); // 100M tokens
const REWARDS_DURATION = 365 * 24 * 60 * 60; // 1 year

async function main() {
  console.log("=".repeat(60));
  console.log("PITCHFORK PROTOCOL - FULL GOVERNANCE DEPLOYMENT");
  console.log("=".repeat(60));
  console.log(`Network: ${network.name}`);

  const [deployer] = await ethers.getSigners();
  const net = await ethers.provider.getNetwork();
  const chainId = Number(net.chainId);

  console.log(`Deployer: ${deployer.address}`);
  console.log(`Balance: ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} ETH`);
  console.log(`Chain ID: ${chainId}`);
  console.log("");

  const addresses = {};

  // ============================================================
  // PHASE 1: Deploy PFORK Token
  // ============================================================
  console.log("PHASE 1: Deploying PFORK Token");
  console.log("-".repeat(40));

  const PFORKFactory = await ethers.getContractFactory("PFORK");
  const pfork = await PFORKFactory.deploy(
    "Pitchfork Token",
    "PFORK",
    INITIAL_PFORK_SUPPLY
  );
  await pfork.waitForDeployment();
  addresses.PFORK = await pfork.getAddress();
  console.log(`  PFORK deployed to: ${addresses.PFORK}`);

  // ============================================================
  // PHASE 2: Deploy gPFORK (UUPS Upgradeable Staking Wrapper)
  // ============================================================
  console.log("\nPHASE 2: Deploying gPFORK Staking Token (UUPS)");
  console.log("-".repeat(40));

  const gPFORKFactory = await ethers.getContractFactory("gPFORK");
  const gPfork = await upgrades.deployProxy(
    gPFORKFactory,
    [
      addresses.PFORK,
      deployer.address, // admin (will transfer to timelock later)
      deployer.address, // upgrader (will transfer to timelock later)
      REWARDS_DURATION
    ],
    { kind: "uups" }
  );
  await gPfork.waitForDeployment();
  addresses.gPFORK = await gPfork.getAddress();
  addresses.gPFORK_Implementation = await upgrades.erc1967.getImplementationAddress(addresses.gPFORK);
  console.log(`  gPFORK Proxy: ${addresses.gPFORK}`);
  console.log(`  gPFORK Implementation: ${addresses.gPFORK_Implementation}`);

  // ============================================================
  // PHASE 3: Deploy Timelock Controller
  // ============================================================
  console.log("\nPHASE 3: Deploying PitchforkTimelock");
  console.log("-".repeat(40));

  // Initially, deployer is proposer/executor for setup
  // Governor will be added as proposer after deployment
  const TimelockFactory = await ethers.getContractFactory("PitchforkTimelock");
  const timelock = await TimelockFactory.deploy(
    TIMELOCK_MIN_DELAY,
    [deployer.address], // proposers (governor added later)
    [deployer.address], // executors (anyone can execute after delay in production)
    deployer.address    // admin (will renounce after setup)
  );
  await timelock.waitForDeployment();
  addresses.PitchforkTimelock = await timelock.getAddress();
  console.log(`  PitchforkTimelock deployed to: ${addresses.PitchforkTimelock}`);

  // ============================================================
  // PHASE 4: Deploy Governor
  // ============================================================
  console.log("\nPHASE 4: Deploying PitchforkGovernor");
  console.log("-".repeat(40));

  const GovernorFactory = await ethers.getContractFactory("PitchforkGovernor");
  const governor = await GovernorFactory.deploy(
    addresses.gPFORK,
    addresses.PitchforkTimelock,
    "Pitchfork Governor",
    GOVERNOR_VOTING_DELAY,
    GOVERNOR_VOTING_PERIOD,
    GOVERNOR_PROPOSAL_THRESHOLD,
    GOVERNOR_QUORUM_NUMERATOR
  );
  await governor.waitForDeployment();
  addresses.PitchforkGovernor = await governor.getAddress();
  console.log(`  PitchforkGovernor deployed to: ${addresses.PitchforkGovernor}`);

  // Grant proposer role to Governor on Timelock
  const PROPOSER_ROLE = await timelock.PROPOSER_ROLE();
  await timelock.grantRole(PROPOSER_ROLE, addresses.PitchforkGovernor);
  console.log(`  Granted PROPOSER_ROLE to Governor`);

  // ============================================================
  // PHASE 5: Deploy Application Contracts
  // ============================================================
  console.log("\nPHASE 5: Deploying Application Contracts");
  console.log("-".repeat(40));

  // 5.1 ConsciousnessAchievements (NFT)
  const AchievementsFactory = await ethers.getContractFactory("ConsciousnessAchievements");
  const achievements = await AchievementsFactory.deploy("ipfs://pitchfork-achievements/");
  await achievements.waitForDeployment();
  addresses.ConsciousnessAchievements = await achievements.getAddress();
  console.log(`  ConsciousnessAchievements: ${addresses.ConsciousnessAchievements}`);

  // 5.2 ConsciousnessIdentity
  const IdentityFactory = await ethers.getContractFactory("ConsciousnessIdentity");
  const identity = await IdentityFactory.deploy(addresses.ConsciousnessAchievements);
  await identity.waitForDeployment();
  addresses.ConsciousnessIdentity = await identity.getAddress();
  console.log(`  ConsciousnessIdentity: ${addresses.ConsciousnessIdentity}`);

  // 5.3 AIServicePayment (Upgradeable)
  const AIServiceFactory = await ethers.getContractFactory("AIServicePaymentUpgradeable");
  const aiService = await upgrades.deployProxy(
    AIServiceFactory,
    [
      addresses.PFORK,
      addresses.gPFORK,
      addresses.PitchforkTimelock, // Treasury goes to timelock
      deployer.address, // admin
      deployer.address  // upgrader (will transfer to timelock)
    ],
    { kind: "uups" }
  );
  await aiService.waitForDeployment();
  addresses.AIServicePayment = await aiService.getAddress();
  addresses.AIServicePayment_Implementation = await upgrades.erc1967.getImplementationAddress(addresses.AIServicePayment);
  console.log(`  AIServicePayment Proxy: ${addresses.AIServicePayment}`);
  console.log(`  AIServicePayment Implementation: ${addresses.AIServicePayment_Implementation}`);

  // 5.4 LeadershipSubscription
  const SubscriptionFactory = await ethers.getContractFactory("LeadershipSubscription");
  const subscription = await SubscriptionFactory.deploy(
    addresses.PFORK,
    addresses.ConsciousnessAchievements
  );
  await subscription.waitForDeployment();
  addresses.LeadershipSubscription = await subscription.getAddress();
  console.log(`  LeadershipSubscription: ${addresses.LeadershipSubscription}`);

  // 5.5 ConsciousnessDAO
  const DAOFactory = await ethers.getContractFactory("ConsciousnessDAO");
  const dao = await DAOFactory.deploy(
    addresses.gPFORK,
    addresses.ConsciousnessIdentity,
    addresses.LeadershipSubscription
  );
  await dao.waitForDeployment();
  addresses.ConsciousnessDAO = await dao.getAddress();
  console.log(`  ConsciousnessDAO: ${addresses.ConsciousnessDAO}`);

  // ============================================================
  // PHASE 6: Deploy Decentralization Infrastructure
  // ============================================================
  console.log("\nPHASE 6: Deploying Decentralization Infrastructure");
  console.log("-".repeat(40));

  // 6.1 DecentralizationMetrics
  const MetricsFactory = await ethers.getContractFactory("DecentralizationMetrics");
  const metrics = await MetricsFactory.deploy(addresses.gPFORK, deployer.address);
  await metrics.waitForDeployment();
  addresses.DecentralizationMetrics = await metrics.getAddress();
  console.log(`  DecentralizationMetrics: ${addresses.DecentralizationMetrics}`);

  // 6.2 PowerDiffusion
  const DiffusionFactory = await ethers.getContractFactory("PowerDiffusion");
  const diffusion = await DiffusionFactory.deploy(
    addresses.gPFORK,
    addresses.PFORK,
    addresses.DecentralizationMetrics,
    deployer.address
  );
  await diffusion.waitForDeployment();
  addresses.PowerDiffusion = await diffusion.getAddress();
  console.log(`  PowerDiffusion: ${addresses.PowerDiffusion}`);

  // 6.3 DualGovernance
  const DualGovFactory = await ethers.getContractFactory("DualGovernance");
  const dualGov = await DualGovFactory.deploy(
    addresses.gPFORK,
    addresses.PitchforkGovernor,
    deployer.address
  );
  await dualGov.waitForDeployment();
  addresses.DualGovernance = await dualGov.getAddress();
  console.log(`  DualGovernance: ${addresses.DualGovernance}`);

  // ============================================================
  // PHASE 7: Configure Roles and Permissions
  // ============================================================
  console.log("\nPHASE 7: Configuring Roles and Permissions");
  console.log("-".repeat(40));

  // Grant METRICS_UPDATER_ROLE on DecentralizationMetrics to PowerDiffusion
  const METRICS_UPDATER_ROLE = await metrics.METRICS_UPDATER_ROLE();
  await metrics.grantRole(METRICS_UPDATER_ROLE, addresses.PowerDiffusion);
  console.log(`  Granted METRICS_UPDATER_ROLE to PowerDiffusion`);

  // Set up supported payment tokens
  await subscription.setSupportedPaymentToken(addresses.PFORK, true);
  console.log(`  Added PFORK as supported payment token for subscriptions`);

  // Grant achievement roles
  const METADATA_UPDATER_ROLE = await achievements.METADATA_UPDATER_ROLE();
  await achievements.grantRole(METADATA_UPDATER_ROLE, addresses.ConsciousnessIdentity);
  console.log(`  Granted METADATA_UPDATER_ROLE to ConsciousnessIdentity`);

  // ============================================================
  // PHASE 8: Transfer Admin Roles to Timelock
  // ============================================================
  console.log("\nPHASE 8: Transferring Admin Roles to Timelock");
  console.log("-".repeat(40));

  const DEFAULT_ADMIN_ROLE = ethers.ZeroHash;

  // Transfer gPFORK UPGRADER_ROLE to Timelock
  const UPGRADER_ROLE = await gPfork.UPGRADER_ROLE();
  await gPfork.grantRole(UPGRADER_ROLE, addresses.PitchforkTimelock);
  await gPfork.revokeRole(UPGRADER_ROLE, deployer.address);
  console.log(`  gPFORK: UPGRADER_ROLE transferred to Timelock`);

  // Transfer gPFORK DEFAULT_ADMIN_ROLE to Timelock
  await gPfork.grantRole(DEFAULT_ADMIN_ROLE, addresses.PitchforkTimelock);
  await gPfork.revokeRole(DEFAULT_ADMIN_ROLE, deployer.address);
  console.log(`  gPFORK: DEFAULT_ADMIN_ROLE transferred to Timelock`);

  // Transfer AIServicePayment UPGRADER_ROLE to Timelock
  const AI_UPGRADER_ROLE = await aiService.UPGRADER_ROLE();
  await aiService.grantRole(AI_UPGRADER_ROLE, addresses.PitchforkTimelock);
  await aiService.revokeRole(AI_UPGRADER_ROLE, deployer.address);
  console.log(`  AIServicePayment: UPGRADER_ROLE transferred to Timelock`);

  // Transfer AIServicePayment DEFAULT_ADMIN_ROLE to Timelock
  await aiService.grantRole(DEFAULT_ADMIN_ROLE, addresses.PitchforkTimelock);
  await aiService.revokeRole(DEFAULT_ADMIN_ROLE, deployer.address);
  console.log(`  AIServicePayment: DEFAULT_ADMIN_ROLE transferred to Timelock`);

  // Transfer DecentralizationMetrics admin to Timelock
  await metrics.grantRole(DEFAULT_ADMIN_ROLE, addresses.PitchforkTimelock);
  await metrics.revokeRole(DEFAULT_ADMIN_ROLE, deployer.address);
  console.log(`  DecentralizationMetrics: DEFAULT_ADMIN_ROLE transferred to Timelock`);

  // Transfer PowerDiffusion admin to Timelock
  await diffusion.grantRole(DEFAULT_ADMIN_ROLE, addresses.PitchforkTimelock);
  await diffusion.revokeRole(DEFAULT_ADMIN_ROLE, deployer.address);
  console.log(`  PowerDiffusion: DEFAULT_ADMIN_ROLE transferred to Timelock`);

  // Renounce deployer's admin role on Timelock
  const TIMELOCK_ADMIN_ROLE = await timelock.DEFAULT_ADMIN_ROLE();
  await timelock.renounceRole(TIMELOCK_ADMIN_ROLE, deployer.address);
  console.log(`  Timelock: Deployer renounced ADMIN role`);

  // ============================================================
  // PHASE 9: Save Deployment Information
  // ============================================================
  console.log("\nPHASE 9: Saving Deployment Information");
  console.log("-".repeat(40));

  const deploymentConfig = {
    network: network.name,
    chainId,
    deployer: deployer.address,
    deploymentDate: new Date().toISOString(),
    contracts: addresses,
    timelockConfig: {
      minDelay: TIMELOCK_MIN_DELAY,
      proposers: [deployer.address, addresses.PitchforkGovernor],
      executors: [deployer.address]
    },
    governorConfig: {
      votingDelay: GOVERNOR_VOTING_DELAY,
      votingPeriod: GOVERNOR_VOTING_PERIOD,
      proposalThreshold: GOVERNOR_PROPOSAL_THRESHOLD.toString(),
      quorumNumerator: GOVERNOR_QUORUM_NUMERATOR
    }
  };

  // Save to deployments folder
  const deploymentsDir = join(__dirname, "..", "deployments");
  if (!existsSync(deploymentsDir)) mkdirSync(deploymentsDir, { recursive: true });

  const deploymentPath = join(deploymentsDir, `${network.name}-${chainId}.json`);
  writeFileSync(deploymentPath, JSON.stringify(deploymentConfig, null, 2));
  console.log(`  Saved deployment config to: ${deploymentPath}`);

  // Update consolidated addresses file
  const addressesPath = join(__dirname, "..", "contracts", "addresses.json");
  let allAddresses = {};
  if (existsSync(addressesPath)) {
    allAddresses = JSON.parse(readFileSync(addressesPath, "utf-8"));
  }
  allAddresses[chainId.toString()] = {
    ...addresses,
    network: network.name,
    deployer: deployer.address,
    deploymentDate: deploymentConfig.deploymentDate
  };
  writeFileSync(addressesPath, JSON.stringify(allAddresses, null, 2));
  console.log(`  Updated consolidated addresses: ${addressesPath}`);

  // Copy to frontend
  const frontendAddressesPath = join(__dirname, "..", "src", "contracts", "addresses.json");
  const frontendDir = dirname(frontendAddressesPath);
  if (!existsSync(frontendDir)) mkdirSync(frontendDir, { recursive: true });
  writeFileSync(frontendAddressesPath, JSON.stringify(allAddresses, null, 2));
  console.log(`  Copied addresses to frontend: ${frontendAddressesPath}`);

  // Generate .env.deployment
  const envContent = `
# Pitchfork Protocol - ${network.name} (Chain ID: ${chainId})
# Deployed: ${deploymentConfig.deploymentDate}

# Core Tokens
VITE_PFORK_ADDRESS=${addresses.PFORK}
VITE_GPFORK_ADDRESS=${addresses.gPFORK}

# Governance
VITE_TIMELOCK_ADDRESS=${addresses.PitchforkTimelock}
VITE_GOVERNOR_ADDRESS=${addresses.PitchforkGovernor}
VITE_DUAL_GOVERNANCE_ADDRESS=${addresses.DualGovernance}

# Application Contracts
VITE_ACHIEVEMENTS_ADDRESS=${addresses.ConsciousnessAchievements}
VITE_IDENTITY_ADDRESS=${addresses.ConsciousnessIdentity}
VITE_AI_SERVICE_ADDRESS=${addresses.AIServicePayment}
VITE_SUBSCRIPTION_ADDRESS=${addresses.LeadershipSubscription}
VITE_DAO_ADDRESS=${addresses.ConsciousnessDAO}

# Decentralization
VITE_METRICS_ADDRESS=${addresses.DecentralizationMetrics}
VITE_DIFFUSION_ADDRESS=${addresses.PowerDiffusion}

# Network
VITE_NETWORK_NAME=${network.name}
VITE_CHAIN_ID=${chainId}
`.trim();

  writeFileSync(join(__dirname, "..", ".env.deployment"), envContent);
  console.log(`  Generated .env.deployment`);

  // ============================================================
  // DEPLOYMENT SUMMARY
  // ============================================================
  console.log("\n" + "=".repeat(60));
  console.log("DEPLOYMENT COMPLETE");
  console.log("=".repeat(60));
  console.log("\nCore Tokens:");
  console.log(`  PFORK:  ${addresses.PFORK}`);
  console.log(`  gPFORK: ${addresses.gPFORK}`);
  console.log("\nGovernance:");
  console.log(`  Timelock: ${addresses.PitchforkTimelock}`);
  console.log(`  Governor: ${addresses.PitchforkGovernor}`);
  console.log(`  DualGovernance: ${addresses.DualGovernance}`);
  console.log("\nApplication Contracts:");
  console.log(`  ConsciousnessAchievements: ${addresses.ConsciousnessAchievements}`);
  console.log(`  ConsciousnessIdentity: ${addresses.ConsciousnessIdentity}`);
  console.log(`  AIServicePayment: ${addresses.AIServicePayment}`);
  console.log(`  LeadershipSubscription: ${addresses.LeadershipSubscription}`);
  console.log(`  ConsciousnessDAO: ${addresses.ConsciousnessDAO}`);
  console.log("\nDecentralization:");
  console.log(`  DecentralizationMetrics: ${addresses.DecentralizationMetrics}`);
  console.log(`  PowerDiffusion: ${addresses.PowerDiffusion}`);

  console.log("\n" + "-".repeat(60));
  console.log("SECURITY NOTES:");
  console.log("-".repeat(60));
  console.log("1. UPGRADER_ROLE has been transferred to Timelock for:");
  console.log("   - gPFORK");
  console.log("   - AIServicePayment");
  console.log("2. DEFAULT_ADMIN_ROLE has been transferred to Timelock for:");
  console.log("   - gPFORK");
  console.log("   - AIServicePayment");
  console.log("   - DecentralizationMetrics");
  console.log("   - PowerDiffusion");
  console.log("3. Deployer has renounced admin role on Timelock");
  console.log("4. All upgrades must now go through governance");

  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("\n" + "-".repeat(60));
    console.log("VERIFICATION COMMANDS:");
    console.log("-".repeat(60));
    console.log(`npx hardhat verify --network ${network.name} ${addresses.PFORK} "Pitchfork Token" "PFORK" "${INITIAL_PFORK_SUPPLY}"`);
    console.log(`npx hardhat verify --network ${network.name} ${addresses.PitchforkTimelock} ${TIMELOCK_MIN_DELAY} "[${deployer.address}]" "[${deployer.address}]" ${deployer.address}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\nDEPLOYMENT FAILED:", error);
    process.exit(1);
  });
