import { ethers } from 'ethers';
import { BrowserProvider, JsonRpcSigner } from 'ethers';

// Contract addresses (will be populated after deployment)
export const CONTRACT_ADDRESSES = {
  // Core tokens
  PFORK_TOKEN: process.env.VITE_PFORK_TOKEN_ADDRESS || '0x216490C8E6b33b4d8A2390dADcf9f433E30da60F', // NEO X mainnet
  GPFORK_TOKEN: process.env.VITE_GPFORK_TOKEN_ADDRESS || '',
  
  // Governance
  GOVERNOR: process.env.VITE_GOVERNOR_ADDRESS || '',
  TIMELOCK: process.env.VITE_TIMELOCK_ADDRESS || '',
  
  // Application contracts
  NFT_ACHIEVEMENTS: process.env.VITE_NFT_ACHIEVEMENTS_ADDRESS || '',
  AI_PAYMENT: process.env.VITE_AI_PAYMENT_ADDRESS || '',
  SUBSCRIPTION: process.env.VITE_SUBSCRIPTION_ADDRESS || '',
  IDENTITY: process.env.VITE_IDENTITY_ADDRESS || '',
  DAO_GOVERNANCE: process.env.VITE_DAO_GOVERNANCE_ADDRESS || '', // Legacy ConsciousnessDAO
};

// Contract ABIs (simplified for frontend use)
export const CONTRACT_ABIS = {
  // PFORK is a standard ERC20 token
  PFORK_TOKEN: [
    'function balanceOf(address owner) view returns (uint256)',
    'function totalSupply() view returns (uint256)',
    'function approve(address spender, uint256 amount) returns (bool)',
    'function transfer(address to, uint256 amount) returns (bool)',
    'function allowance(address owner, address spender) view returns (uint256)',
    'event Transfer(address indexed from, address indexed to, uint256 value)',
    'event Approval(address indexed owner, address indexed spender, uint256 value)',
  ],
  
  // gPFORK is the staking/voting wrapper with rewards
  GPFORK_TOKEN: [
    'function balanceOf(address owner) view returns (uint256)',
    'function totalSupply() view returns (uint256)',
    'function getVotes(address account) view returns (uint256)',
    'function delegates(address account) view returns (address)',
    'function delegate(address delegatee)',
    'function stake(uint256 amount)',
    'function unstake(uint256 amount)',
    'function claimRewards()',
    'function exit()',
    'function earned(address account) view returns (uint256)',
    'function rewardRate() view returns (uint256)',
    'function rewardsDuration() view returns (uint256)',
    'function periodFinish() view returns (uint256)',
    'event Staked(address indexed user, uint256 amount)',
    'event Unstaked(address indexed user, uint256 amount)',
    'event RewardPaid(address indexed user, uint256 reward)',
  ],
  
  // OZ Governor
  GOVERNOR: [
    'function name() view returns (string)',
    'function proposalThreshold() view returns (uint256)',
    'function votingDelay() view returns (uint256)',
    'function votingPeriod() view returns (uint256)',
    'function quorum(uint256 blockNumber) view returns (uint256)',
    'function state(uint256 proposalId) view returns (uint8)',
    'function proposalSnapshot(uint256 proposalId) view returns (uint256)',
    'function proposalDeadline(uint256 proposalId) view returns (uint256)',
    'function proposalProposer(uint256 proposalId) view returns (address)',
    'function hasVoted(uint256 proposalId, address account) view returns (bool)',
    'function getVotes(address account, uint256 blockNumber) view returns (uint256)',
    'function propose(address[] targets, uint256[] values, bytes[] calldatas, string description) returns (uint256)',
    'function castVote(uint256 proposalId, uint8 support) returns (uint256)',
    'function castVoteWithReason(uint256 proposalId, uint8 support, string reason) returns (uint256)',
    'function queue(address[] targets, uint256[] values, bytes[] calldatas, bytes32 descriptionHash) returns (uint256)',
    'function execute(address[] targets, uint256[] values, bytes[] calldatas, bytes32 descriptionHash) returns (uint256)',
    'event ProposalCreated(uint256 proposalId, address proposer, address[] targets, uint256[] values, string[] signatures, bytes[] calldatas, uint256 startBlock, uint256 endBlock, string description)',
    'event VoteCast(address indexed voter, uint256 proposalId, uint8 support, uint256 weight, string reason)',
  ],
  
  // OZ TimelockController
  TIMELOCK: [
    'function getMinDelay() view returns (uint256)',
    'function isOperation(bytes32 id) view returns (bool)',
    'function isOperationPending(bytes32 id) view returns (bool)',
    'function isOperationReady(bytes32 id) view returns (bool)',
    'function isOperationDone(bytes32 id) view returns (bool)',
    'function getTimestamp(bytes32 id) view returns (uint256)',
    'event CallScheduled(bytes32 indexed id, uint256 indexed index, address target, uint256 value, bytes data, bytes32 predecessor, uint256 delay)',
    'event CallExecuted(bytes32 indexed id, uint256 indexed index, address target, uint256 value, bytes data)',
  ],
  
  NFT_ACHIEVEMENTS: [
    'function balanceOf(address owner) view returns (uint256)',
    'function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)',
    'function getAchievement(uint256 tokenId) view returns (uint8,uint8,uint256,uint256,address,string,uint256,uint256,string[])',
    'function getUserAchievements(address user) view returns (uint256[])',
    'function canEvolveAchievement(uint256 tokenId) view returns (bool,string)',
    'function evolveAchievement(uint256 tokenId)',
    'function userConsciousnessScores(address user) view returns (uint256)',
    'event AchievementMinted(uint256 indexed tokenId, address indexed recipient, uint8 category, uint8 level)',
    'event AchievementEvolved(uint256 indexed tokenId, uint8 oldLevel, uint8 newLevel)',
  ],
  
  AI_PAYMENT: [
    'function getUserTokenBalance(address user, address token) view returns (uint256)',
    'function getUserDailyUsage(address user, uint8 serviceType) view returns (uint256)',
    'function canAccessService(address user, uint8 serviceType) view returns (bool,string)',
    'function fundAccount(address token, uint256 amount)',
    'function fundAccountETH() payable',
    'function withdrawAccountBalance(address token, uint256 amount)',
    'function serviceConfigs(uint8 serviceType) view returns (uint256,uint256,uint256,bool,string,uint256)',
    'event AccountFunded(address indexed user, address indexed token, uint256 amount)',
    'event ServicePayment(address indexed user, uint8 indexed serviceType, address token, uint256 amount, bytes32 sessionId)',
  ],
  
  SUBSCRIPTION: [
    'function getSubscription(address user) view returns (uint8,uint256,uint256,bool,bool,uint256,bool,uint256)',
    'function isSubscriptionActive(address user) view returns (bool)',
    'function hasFeatureAccess(address user, string feature) view returns (bool)',
    'function getVotingPower(address user) view returns (uint256)',
    'function subscribe(uint8 tier, bool isAnnual, address paymentToken, bool enableAutoRenewal)',
    'function upgradeSubscription(uint8 newTier)',
    'function cancelSubscription()',
    'function toggleAutoRenewal(bool enabled)',
    'function tierConfigs(uint8 tier) view returns (uint256,uint256,uint256,uint256,uint256,bool,bool,bool,bool,string[],uint256,bool)',
    'event SubscriptionCreated(address indexed user, uint8 tier, bool isAnnual, uint256 endTime)',
    'event SubscriptionUpgraded(address indexed user, uint8 oldTier, uint8 newTier)',
  ],
  
  IDENTITY: [
    'function getIdentity(address user) view returns (uint8,uint256,uint256,string,bool,uint256,uint256)',
    'function getCredential(address user, uint8 credType) view returns (address,uint256,uint256,uint256,bool,bool,string)',
    'function canViewCredential(address viewer, address user, uint8 credType) view returns (bool)',
    'function createIdentity(string publicProfile, bytes32 privateProfileHash, bool isEnterpriseAccount)',
    'function shareCredential(address viewer, uint8 credType, bool allowAccess)',
    'function updatePrivacySettings(bool allowPublicProfile, bool allowCredentialSharing, bool allowConsciousnessScoring, bool allowEnterpriseAccess)',
    'event IdentityCreated(address indexed user, uint8 level)',
    'event CredentialShared(address indexed user, address indexed viewer, uint8 credType)',
  ],
  
  DAO_GOVERNANCE: [
    'function getProposal(uint256 proposalId) view returns (address,uint8,string,string,uint256,uint256,uint256,uint256,uint256,uint8,bool)',
    'function getVotingPower(address account) view returns (uint256)',
    'function hasProposalPassed(uint256 proposalId) view returns (bool,bool)',
    'function createProposal(uint8 category, string title, string description, string executionDetails, address[] requestedTokens, uint256[] requestedAmounts, address[] recipients) returns (uint256)',
    'function castVote(uint256 proposalId, uint8 voteType, string reason)',
    'function executeProposal(uint256 proposalId)',
    'function delegate(address delegatee)',
    'function depositToTreasury(address token, uint256 amount) payable',
    'function currentProposalId() view returns (uint256)',
    'function totalProposals() view returns (uint256)',
    'event ProposalCreated(uint256 indexed proposalId, address indexed proposer, uint8 category, string title)',
    'event VoteCast(uint256 indexed proposalId, address indexed voter, uint8 voteType, uint256 votingPower, string reason)',
  ],
};

// Enums matching the smart contracts
export enum SubscriptionTier {
  NONE = 0,
  BASIC = 1,
  PREMIUM = 2,
  ENTERPRISE = 3,
}

export enum AchievementCategory {
  CONSCIOUS_LEADER = 0,
  STRATEGIC_THINKER = 1,
  CRISIS_MANAGER = 2,
  INNOVATION_CATALYST = 3,
  ETHICAL_GUARDIAN = 4,
  WISDOM_KEEPER = 5,
  TRANSFORMATION_AGENT = 6,
  COLLABORATION_MASTER = 7,
}

export enum AchievementLevel {
  BRONZE = 0,
  SILVER = 1,
  GOLD = 2,
  PLATINUM = 3,
  DIAMOND = 4,
  TRANSCENDENT = 5,
}

export enum ServiceType {
  CONSCIOUSNESS_ANALYSIS = 0,
  STRATEGIC_INSIGHTS = 1,
  DECISION_SYNTHESIS = 2,
  PATTERN_RECOGNITION = 3,
  WISDOM_INTEGRATION = 4,
  CRISIS_MANAGEMENT = 5,
  LEADERSHIP_COACHING = 6,
  REFLECTION_GUIDANCE = 7,
}

export enum ProposalCategory {
  PLATFORM_DEVELOPMENT = 0,
  CONSCIOUSNESS_RESEARCH = 1,
  AI_MODEL_SELECTION = 2,
  TREASURY_ALLOCATION = 3,
  GOVERNANCE_PARAMETER = 4,
  COMMUNITY_INITIATIVE = 5,
  PARTNERSHIP_PROPOSAL = 6,
  EMERGENCY_ACTION = 7,
}

export enum VoteType {
  FOR = 0,
  AGAINST = 1,
  ABSTAIN = 2,
}

export enum VerificationLevel {
  NONE = 0,
  BASIC = 1,
  EXECUTIVE = 2,
  ENTERPRISE = 3,
  CONSCIOUSNESS_VERIFIED = 4,
  THOUGHT_LEADER = 5,
}

// Contract service class
export class ContractService {
  private provider: BrowserProvider | null = null;
  private signer: JsonRpcSigner | null = null;
  private contracts: Map<string, ethers.Contract> = new Map();

  constructor(provider: BrowserProvider | null, signer: JsonRpcSigner | null) {
    this.provider = provider;
    this.signer = signer;
    this.initializeContracts();
  }

  private initializeContracts() {
    if (!this.provider) return;

    // Initialize all contracts
    Object.entries(CONTRACT_ADDRESSES).forEach(([name, address]) => {
      if (address && CONTRACT_ABIS[name as keyof typeof CONTRACT_ABIS]) {
        const contract = new ethers.Contract(
          address,
          CONTRACT_ABIS[name as keyof typeof CONTRACT_ABIS],
          this.signer || this.provider
        );
        this.contracts.set(name, contract);
      }
    });
  }

  getContract(name: keyof typeof CONTRACT_ADDRESSES): ethers.Contract | null {
    return this.contracts.get(name) || null;
  }

  // PFORK Token methods (standard ERC20)
  async getPforkBalance(userAddress: string): Promise<string> {
    const contract = this.getContract('PFORK_TOKEN');
    if (!contract) throw new Error('PFORK contract not available');
    
    const balance = await contract.balanceOf(userAddress);
    return ethers.formatEther(balance);
  }

  async approvePfork(spender: string, amount: string): Promise<ethers.ContractTransactionResponse> {
    const contract = this.getContract('PFORK_TOKEN');
    if (!contract || !this.signer) throw new Error('PFORK contract or signer not available');
    
    const amountWei = ethers.parseEther(amount);
    return await contract.approve(spender, amountWei);
  }

  // gPFORK Token methods (staking + voting + rewards)
  async getGpforkBalance(userAddress: string): Promise<string> {
    const contract = this.getContract('GPFORK_TOKEN');
    if (!contract) throw new Error('gPFORK contract not available');
    
    const balance = await contract.balanceOf(userAddress);
    return ethers.formatEther(balance);
  }

  async getVotes(userAddress: string): Promise<string> {
    const contract = this.getContract('GPFORK_TOKEN');
    if (!contract) throw new Error('gPFORK contract not available');
    
    const votes = await contract.getVotes(userAddress);
    return ethers.formatEther(votes);
  }

  async getPendingRewards(userAddress: string): Promise<string> {
    const contract = this.getContract('GPFORK_TOKEN');
    if (!contract) throw new Error('gPFORK contract not available');
    
    const rewards = await contract.earned(userAddress);
    return ethers.formatEther(rewards);
  }

  async stakeTokens(amount: string): Promise<ethers.ContractTransactionResponse> {
    const contract = this.getContract('GPFORK_TOKEN');
    if (!contract || !this.signer) throw new Error('gPFORK contract or signer not available');
    
    const amountWei = ethers.parseEther(amount);
    return await contract.stake(amountWei);
  }

  async unstakeTokens(amount: string): Promise<ethers.ContractTransactionResponse> {
    const contract = this.getContract('GPFORK_TOKEN');
    if (!contract || !this.signer) throw new Error('gPFORK contract or signer not available');
    
    const amountWei = ethers.parseEther(amount);
    return await contract.unstake(amountWei);
  }

  async claimRewards(): Promise<ethers.ContractTransactionResponse> {
    const contract = this.getContract('GPFORK_TOKEN');
    if (!contract || !this.signer) throw new Error('gPFORK contract or signer not available');
    
    return await contract.claimRewards();
  }

  async exitStaking(): Promise<ethers.ContractTransactionResponse> {
    const contract = this.getContract('GPFORK_TOKEN');
    if (!contract || !this.signer) throw new Error('gPFORK contract or signer not available');
    
    return await contract.exit();
  }

  async delegateVotes(delegatee: string): Promise<ethers.ContractTransactionResponse> {
    const contract = this.getContract('GPFORK_TOKEN');
    if (!contract || !this.signer) throw new Error('gPFORK contract or signer not available');
    
    return await contract.delegate(delegatee);
  }

  // Combined balance helper for UI
  async getTokenBalance(userAddress: string): Promise<string> {
    return this.getPforkBalance(userAddress);
  }

  async getStakedBalance(userAddress: string): Promise<string> {
    return this.getGpforkBalance(userAddress);
  }

  // NFT Achievement methods
  async getUserAchievements(userAddress: string): Promise<number[]> {
    const contract = this.getContract('NFT_ACHIEVEMENTS');
    if (!contract) throw new Error('Contract not available');
    
    const achievements = await contract.getUserAchievements(userAddress);
    return achievements.map((id: bigint) => Number(id));
  }

  async getAchievementDetails(tokenId: number) {
    const contract = this.getContract('NFT_ACHIEVEMENTS');
    if (!contract) throw new Error('Contract not available');
    
    const [category, level, issuedAt, lastEvolution, recipient, metadataURI, consciousnessScore, assessmentScore, skills] 
      = await contract.getAchievement(tokenId);
    
    return {
      category: Number(category),
      level: Number(level),
      issuedAt: Number(issuedAt),
      lastEvolution: Number(lastEvolution),
      recipient,
      metadataURI,
      consciousnessScore: Number(consciousnessScore),
      assessmentScore: Number(assessmentScore),
      skills,
    };
  }

  async canEvolveAchievement(tokenId: number): Promise<{canEvolve: boolean, reason: string}> {
    const contract = this.getContract('NFT_ACHIEVEMENTS');
    if (!contract) throw new Error('Contract not available');
    
    const [canEvolve, reason] = await contract.canEvolveAchievement(tokenId);
    return { canEvolve, reason };
  }

  async evolveAchievement(tokenId: number): Promise<ethers.ContractTransactionResponse> {
    const contract = this.getContract('NFT_ACHIEVEMENTS');
    if (!contract || !this.signer) throw new Error('Contract or signer not available');
    
    return await contract.evolveAchievement(tokenId);
  }

  // Subscription methods
  async getSubscription(userAddress: string) {
    const contract = this.getContract('SUBSCRIPTION');
    if (!contract) throw new Error('Contract not available');
    
    const [tier, startTime, endTime, isAnnual, autoRenewal, totalPaid, isActive, votingPower] 
      = await contract.getSubscription(userAddress);
    
    return {
      tier: Number(tier),
      startTime: Number(startTime),
      endTime: Number(endTime),
      isAnnual,
      autoRenewal,
      totalPaid: ethers.formatEther(totalPaid),
      isActive,
      votingPower: Number(votingPower),
    };
  }

  async subscribe(tier: SubscriptionTier, isAnnual: boolean, paymentToken: string): Promise<ethers.ContractTransactionResponse> {
    const contract = this.getContract('SUBSCRIPTION');
    if (!contract || !this.signer) throw new Error('Contract or signer not available');
    
    return await contract.subscribe(tier, isAnnual, paymentToken, true); // Auto-renewal enabled by default
  }

  async hasFeatureAccess(userAddress: string, feature: string): Promise<boolean> {
    const contract = this.getContract('SUBSCRIPTION');
    if (!contract) throw new Error('Contract not available');
    
    return await contract.hasFeatureAccess(userAddress, feature);
  }

  // DAO Governance methods
  async getVotingPower(userAddress: string): Promise<string> {
    const contract = this.getContract('DAO_GOVERNANCE');
    if (!contract) throw new Error('Contract not available');
    
    const power = await contract.getVotingPower(userAddress);
    return ethers.formatEther(power);
  }

  async createProposal(
    category: ProposalCategory,
    title: string,
    description: string,
    executionDetails: string
  ): Promise<ethers.ContractTransactionResponse> {
    const contract = this.getContract('DAO_GOVERNANCE');
    if (!contract || !this.signer) throw new Error('Contract or signer not available');
    
    return await contract.createProposal(
      category,
      title,
      description,
      executionDetails,
      [], // requestedTokens
      [], // requestedAmounts  
      []  // recipients
    );
  }

  async castVote(proposalId: number, voteType: VoteType, reason: string): Promise<ethers.ContractTransactionResponse> {
    const contract = this.getContract('DAO_GOVERNANCE');
    if (!contract || !this.signer) throw new Error('Contract or signer not available');
    
    return await contract.castVote(proposalId, voteType, reason);
  }

  async getProposal(proposalId: number) {
    const contract = this.getContract('DAO_GOVERNANCE');
    if (!contract) throw new Error('Contract not available');
    
    const [proposer, category, title, description, startTime, endTime, forVotes, againstVotes, abstainVotes, status, isExecuted] 
      = await contract.getProposal(proposalId);
    
    return {
      proposer,
      category: Number(category),
      title,
      description,
      startTime: Number(startTime),
      endTime: Number(endTime),
      forVotes: ethers.formatEther(forVotes),
      againstVotes: ethers.formatEther(againstVotes),
      abstainVotes: ethers.formatEther(abstainVotes),
      status: Number(status),
      isExecuted,
    };
  }

  // Identity methods
  async getIdentity(userAddress: string) {
    const contract = this.getContract('IDENTITY');
    if (!contract) throw new Error('Contract not available');
    
    const [verificationLevel, consciousnessScore, lastScoreUpdate, publicProfile, isEnterpriseAccount, createdAt, lastUpdated] 
      = await contract.getIdentity(userAddress);
    
    return {
      verificationLevel: Number(verificationLevel),
      consciousnessScore: Number(consciousnessScore),
      lastScoreUpdate: Number(lastScoreUpdate),
      publicProfile,
      isEnterpriseAccount,
      createdAt: Number(createdAt),
      lastUpdated: Number(lastUpdated),
    };
  }

  async createIdentity(publicProfile: string, isEnterpriseAccount: boolean): Promise<ethers.ContractTransactionResponse> {
    const contract = this.getContract('IDENTITY');
    if (!contract || !this.signer) throw new Error('Contract or signer not available');
    
    const privateProfileHash = ethers.keccak256(ethers.toUtf8Bytes(publicProfile + Date.now()));
    return await contract.createIdentity(publicProfile, privateProfileHash, isEnterpriseAccount);
  }

  // AI Payment methods
  async fundAccount(token: string, amount: string): Promise<ethers.ContractTransactionResponse> {
    const contract = this.getContract('AI_PAYMENT');
    if (!contract || !this.signer) throw new Error('Contract or signer not available');
    
    if (token === ethers.ZeroAddress) {
      // ETH payment
      return await contract.fundAccountETH({ value: ethers.parseEther(amount) });
    } else {
      // ERC20 token payment
      const amountWei = ethers.parseEther(amount);
      return await contract.fundAccount(token, amountWei);
    }
  }

  async getUserTokenBalance(userAddress: string, token: string): Promise<string> {
    const contract = this.getContract('AI_PAYMENT');
    if (!contract) throw new Error('Contract not available');
    
    const balance = await contract.getUserTokenBalance(userAddress, token);
    return ethers.formatEther(balance);
  }

  async canAccessService(userAddress: string, serviceType: ServiceType): Promise<{canAccess: boolean, message: string}> {
    const contract = this.getContract('AI_PAYMENT');
    if (!contract) throw new Error('Contract not available');
    
    const [canAccess, message] = await contract.canAccessService(userAddress, serviceType);
    return { canAccess, message };
  }
}