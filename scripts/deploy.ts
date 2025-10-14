import { ethers, network } from "hardhat";
import { writeFileSync, readFileSync, existsSync, mkdirSync, copyFileSync } from "fs";
import { join, dirname } from "path";

interface DeploymentConfig {
  network: string;
  contracts: {
    [key: string]: string;
  };
  deployer: string;
  deploymentDate: string;
}

async function main() {
  console.log("🚀 Starting Consciousness Platform Deployment...");
  console.log(`Network: ${network.name}`);
  
  const [deployer] = await ethers.getSigners();
  const net = await ethers.provider.getNetwork();
  const chainId = Number(net.chainId);
  console.log(`Deploying contracts with account: ${deployer.address}`);
  console.log(`Account balance: ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} ETH`);

  const deploymentConfig: DeploymentConfig = {
    network: network.name,
    contracts: {},
    deployer: deployer.address,
    deploymentDate: new Date().toISOString()
  };

  // 1. Deploy Consciousness Token (CONS)
  console.log("\n📝 Deploying Consciousness Token...");
  const ConsciousnessToken = await ethers.getContractFactory("ConsciousnessToken");
  const consciousnessToken = await ConsciousnessToken.deploy(
    "Consciousness Token",
    "CONS",
    ethers.parseEther("1000000"), // 1M total supply
    ethers.parseEther("100000")   // 100K initial mint
  );
  await consciousnessToken.waitForDeployment();
  const tokenAddress = await consciousnessToken.getAddress();
  deploymentConfig.contracts.ConsciousnessToken = tokenAddress;
  console.log(`✅ Consciousness Token deployed to: ${tokenAddress}`);

  // 2. Deploy NFT Achievement System
  console.log("\n🏆 Deploying NFT Achievements...");
  const ConsciousnessAchievements = await ethers.getContractFactory("ConsciousnessAchievements");
  const achievements = await ConsciousnessAchievements.deploy(
    "Consciousness Achievements",
    "CONSACH",
    tokenAddress
  );
  await achievements.waitForDeployment();
  const achievementsAddress = await achievements.getAddress();
  deploymentConfig.contracts.ConsciousnessAchievements = achievementsAddress;
  console.log(`✅ NFT Achievements deployed to: ${achievementsAddress}`);

  // 3. Deploy AI Service Payment
  console.log("\n💰 Deploying AI Service Payment...");
  const AIServicePayment = await ethers.getContractFactory("AIServicePayment");
  const aiPayment = await AIServicePayment.deploy(tokenAddress);
  await aiPayment.waitForDeployment();
  const aiPaymentAddress = await aiPayment.getAddress();
  deploymentConfig.contracts.AIServicePayment = aiPaymentAddress;
  console.log(`✅ AI Service Payment deployed to: ${aiPaymentAddress}`);

  // 4. Deploy Leadership Subscription
  console.log("\n📋 Deploying Leadership Subscription...");
  const LeadershipSubscription = await ethers.getContractFactory("LeadershipSubscription");
  const subscription = await LeadershipSubscription.deploy(
    tokenAddress,
    achievementsAddress
  );
  await subscription.waitForDeployment();
  const subscriptionAddress = await subscription.getAddress();
  deploymentConfig.contracts.LeadershipSubscription = subscriptionAddress;
  console.log(`✅ Leadership Subscription deployed to: ${subscriptionAddress}`);

  // 5. Deploy Consciousness Identity
  console.log("\n🆔 Deploying Consciousness Identity...");
  const ConsciousnessIdentity = await ethers.getContractFactory("ConsciousnessIdentity");
  const identity = await ConsciousnessIdentity.deploy(
    tokenAddress,
    achievementsAddress
  );
  await identity.waitForDeployment();
  const identityAddress = await identity.getAddress();
  deploymentConfig.contracts.ConsciousnessIdentity = identityAddress;
  console.log(`✅ Consciousness Identity deployed to: ${identityAddress}`);

  // 6. Deploy DAO Governance
  console.log("\n🏛️ Deploying DAO Governance...");
  const ConsciousnessDAO = await ethers.getContractFactory("ConsciousnessDAO");
  const dao = await ConsciousnessDAO.deploy(
    tokenAddress,
    identityAddress,
    subscriptionAddress
  );
  await dao.waitForDeployment();
  const daoAddress = await dao.getAddress();
  deploymentConfig.contracts.ConsciousnessDAO = daoAddress;
  console.log(`✅ DAO Governance deployed to: ${daoAddress}`);

  // 7. Set up contract interactions and permissions
  console.log("\n🔧 Setting up contract interactions...");
  
  // Grant roles to achievement contract for token interactions
  await consciousnessToken.grantRole(
    await consciousnessToken.REWARD_DISTRIBUTOR_ROLE(),
    achievementsAddress
  );
  console.log("✅ Granted reward distributor role to achievements contract");

  // Grant roles to identity contract for consciousness verification
  await achievements.grantRole(
    await achievements.ACHIEVEMENT_ISSUER_ROLE(),
    identityAddress
  );
  console.log("✅ Granted achievement issuer role to identity contract");

  // Grant roles to subscription contract
  await consciousnessToken.grantRole(
    await consciousnessToken.REWARD_DISTRIBUTOR_ROLE(),
    subscriptionAddress
  );
  console.log("✅ Granted reward distributor role to subscription contract");

  // Set supported payment tokens for AI service
  await aiPayment.setSupportedPaymentToken(tokenAddress, true);
  await aiPayment.setSupportedPaymentToken(ethers.ZeroAddress, true); // ETH
  console.log("✅ Set up supported payment tokens");

  // Set supported payment tokens for subscription
  await subscription.setSupportedPaymentToken(tokenAddress, true);
  await subscription.setSupportedPaymentToken(ethers.ZeroAddress, true); // ETH
  console.log("✅ Set up subscription payment tokens");

  // 8. Initial configuration and setup
  console.log("\n⚙️ Performing initial setup...");
  
  // Mint some initial tokens to deployer for testing
  if (network.name === "hardhat" || network.name === "localhost") {
    await consciousnessToken.mint(deployer.address, ethers.parseEther("10000"));
    console.log("✅ Minted test tokens to deployer");
  }

  // Create initial AI service configurations
  const serviceTypes = [
    { id: 0, name: "consciousness_analysis", basePrice: ethers.parseEther("1") },
    { id: 1, name: "strategic_insights", basePrice: ethers.parseEther("2") },
    { id: 2, name: "decision_synthesis", basePrice: ethers.parseEther("1.5") },
    { id: 3, name: "pattern_recognition", basePrice: ethers.parseEther("1.2") }
  ];

  for (const service of serviceTypes) {
    await aiPayment.updateServiceConfig(
      service.id,
      service.basePrice,
      1000, // daily limit
      100,  // per query limit  
      true, // is active
      service.name
    );
  }
  console.log("✅ Configured AI services");

  // 9. Save deployment information
  const deploymentPath = join(__dirname, "..", "deployments", `${network.name}.json`);
  const deploymentDir = dirname(deploymentPath);
  if (!existsSync(deploymentDir)) mkdirSync(deploymentDir, { recursive: true });
  writeFileSync(deploymentPath, JSON.stringify(deploymentConfig, null, 2));
  console.log(`✅ Deployment info saved to: ${deploymentPath}`);

  // 9.1 Update consolidated per-chain address registry
  try {
    const rootAddressesPath = join(__dirname, "..", "contracts", "addresses.json");
    const frontendAddressesPath = join(__dirname, "..", "src", "contracts", "addresses.json");

    const addresses: Record<string, any> = existsSync(rootAddressesPath)
      ? JSON.parse(readFileSync(rootAddressesPath, "utf-8"))
      : {};

    addresses[String(chainId)] = {
      ConsciousnessToken: deploymentConfig.contracts.ConsciousnessToken,
      ConsciousnessAchievements: deploymentConfig.contracts.ConsciousnessAchievements,
      AIServicePayment: deploymentConfig.contracts.AIServicePayment,
      LeadershipSubscription: deploymentConfig.contracts.LeadershipSubscription,
      ConsciousnessIdentity: deploymentConfig.contracts.ConsciousnessIdentity,
      ConsciousnessDAO: deploymentConfig.contracts.ConsciousnessDAO,
      network: network.name,
      deployer: deployer.address,
      deploymentDate: deploymentConfig.deploymentDate
    };

    // Ensure directories exist
    const rootDir = dirname(rootAddressesPath);
    const feDir = dirname(frontendAddressesPath);
    if (!existsSync(rootDir)) mkdirSync(rootDir, { recursive: true });
    if (!existsSync(feDir)) mkdirSync(feDir, { recursive: true });

    writeFileSync(rootAddressesPath, JSON.stringify(addresses, null, 2));
    writeFileSync(frontendAddressesPath, JSON.stringify(addresses, null, 2));
    console.log(`✅ Updated per-chain address registry for chainId ${chainId}`);
  } catch (e) {
    console.warn("⚠️ Failed to update addresses.json:", e);
  }

  // 9.2 Export ABIs to frontend for deployed contracts (best-effort)
  try {
    const abiOutDir = join(__dirname, "..", "src", "contracts", "abi");
    if (!existsSync(abiOutDir)) mkdirSync(abiOutDir, { recursive: true });

    const artifactsBase = join(__dirname, "..", "artifacts", "contracts");
    const contractAbiFiles = [
      ["ConsciousnessToken.sol", "ConsciousnessToken"],
      ["ConsciousnessAchievements.sol", "ConsciousnessAchievements"],
      ["AIServicePayment.sol", "AIServicePayment"],
      ["LeadershipSubscription.sol", "LeadershipSubscription"],
      ["ConsciousnessIdentity.sol", "ConsciousnessIdentity"],
      ["ConsciousnessDAO.sol", "ConsciousnessDAO"]
    ];

    for (const [sol, name] of contractAbiFiles) {
      const src = join(artifactsBase, sol, `${name}.json`);
      const dest = join(abiOutDir, `${name}.json`);
      if (existsSync(src)) {
        copyFileSync(src, dest);
      }
    }
    console.log("✅ Exported ABIs to src/contracts/abi");
  } catch (e) {
    console.warn("⚠️ ABI export skipped (artifacts not found):", e);
  }

  // 10. Generate environment variables file
  const envPath = join(__dirname, "..", ".env.deployment");
  const envVars = `
# Consciousness Platform Contract Addresses - ${network.name}
# Generated on ${deploymentConfig.deploymentDate}

VITE_CONSCIOUSNESS_TOKEN_ADDRESS=${tokenAddress}
VITE_NFT_ACHIEVEMENTS_ADDRESS=${achievementsAddress}
VITE_AI_PAYMENT_ADDRESS=${aiPaymentAddress}
VITE_SUBSCRIPTION_ADDRESS=${subscriptionAddress}
VITE_IDENTITY_ADDRESS=${identityAddress}
VITE_DAO_GOVERNANCE_ADDRESS=${daoAddress}
VITE_NETWORK_NAME=${network.name}
VITE_DEPLOYER_ADDRESS=${deployer.address}

# Contract ABIs are available in the artifacts folder
# Update your .env file with these addresses for frontend integration
  `.trim();

  writeFileSync(envPath, envVars);
  console.log(`✅ Environment variables saved to: ${envPath}`);

  // 11. Display deployment summary
  console.log("\n🎉 Deployment Complete! Summary:");
  console.log("==========================================");
  console.log(`Network: ${network.name}`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Gas Used: ${await estimateDeploymentCosts()}`);
  console.log("\n📝 Contract Addresses:");
  console.log(`Consciousness Token: ${tokenAddress}`);
  console.log(`NFT Achievements: ${achievementsAddress}`);
  console.log(`AI Service Payment: ${aiPaymentAddress}`);
  console.log(`Leadership Subscription: ${subscriptionAddress}`);
  console.log(`Consciousness Identity: ${identityAddress}`);
  console.log(`DAO Governance: ${daoAddress}`);
  
  console.log("\n🔧 Next Steps:");
  console.log("1. Update your .env file with the contract addresses above");
  console.log("2. Verify contracts on block explorer if deploying to mainnet/testnet");
  console.log("3. Set up frontend integration with the deployed contracts");
  console.log("4. Configure initial governance proposals and voting");
  console.log("5. Test all contract interactions through the frontend");
  
  // 12. Verification info for mainnet/testnet deployments
  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("\n📋 Contract Verification Commands:");
    console.log("Run these commands to verify contracts on block explorer:");
    console.log(`npx hardhat verify --network ${network.name} ${tokenAddress} "Consciousness Token" "CONS" "${ethers.parseEther("1000000")}" "${ethers.parseEther("100000")}"`);
    console.log(`npx hardhat verify --network ${network.name} ${achievementsAddress} "Consciousness Achievements" "CONSACH" ${tokenAddress}`);
    console.log(`npx hardhat verify --network ${network.name} ${aiPaymentAddress} ${tokenAddress}`);
    console.log(`npx hardhat verify --network ${network.name} ${subscriptionAddress} ${tokenAddress} ${achievementsAddress}`);
    console.log(`npx hardhat verify --network ${network.name} ${identityAddress} ${tokenAddress} ${achievementsAddress}`);
    console.log(`npx hardhat verify --network ${network.name} ${daoAddress} ${tokenAddress} ${identityAddress} ${subscriptionAddress}`);
  }
}

async function estimateDeploymentCosts(): Promise<string> {
  // This is a simplified estimation
  // In production, you'd track actual gas usage during deployment
  return "Estimated deployment cost calculated during deployment";
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });