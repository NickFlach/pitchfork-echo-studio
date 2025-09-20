// Frontend API layer for our activism platform
import { 
  Identity, 
  InsertIdentity, 
  Movement, 
  InsertMovement, 
  Document, 
  InsertDocument, 
  Campaign, 
  InsertCampaign,
  Message,
  InsertMessage,
  Conversation,
  InsertConversation,
  Proposal,
  InsertProposal,
  Vote,
  InsertVote,
  GovernanceConfig,
  InsertGovernanceConfig,
  identitySchema,
  insertIdentitySchema 
} from '../../shared/schema';

// Local storage keys
const STORAGE_KEYS = {
  IDENTITIES: 'pitchfork_identities',
  MOVEMENTS: 'pitchfork_movements', 
  DOCUMENTS: 'pitchfork_documents',
  CAMPAIGNS: 'pitchfork_campaigns',
  DONATIONS: 'pitchfork_donations',
  MEMBERSHIPS: 'pitchfork_memberships',
  MESSAGES: 'pitchfork_messages',
  CONVERSATIONS: 'pitchfork_conversations',
  ENCRYPTION_KEYS: 'pitchfork_encryption_keys',
  PROPOSALS: 'pitchfork_proposals',
  VOTES: 'pitchfork_votes',
  GOVERNANCE_CONFIGS: 'pitchfork_governance_configs',
};

// Helper functions for localStorage
const getStorageData = <T>(key: string): T[] => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const setStorageData = <T>(key: string, data: T[]): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Identity API
export const identityApi = {
  async getByWallet(walletAddress: string): Promise<Identity | null> {
    const identities = getStorageData<Identity>(STORAGE_KEYS.IDENTITIES);
    const identity = identities.find(identity => identity.walletAddress === walletAddress);
    
    if (!identity) return null;
    
    // Validate with Zod schema
    try {
      const validatedIdentity = identitySchema.parse(identity);
      
      // Check expiration
      if (validatedIdentity.expiresAt && new Date(validatedIdentity.expiresAt) <= new Date()) {
        // Expired - downgrade to none and clear verification metadata
        const expiredIdentity = { 
          ...validatedIdentity, 
          verificationLevel: 'none' as const,
          verifiedAt: undefined,
          expiresAt: undefined,
          verificationHash: undefined,
          signature: undefined
        };
        await this.update(walletAddress, expiredIdentity);
        return expiredIdentity;
      }
      
      return validatedIdentity;
    } catch {
      // Invalid data - reset to safe defaults with explicit metadata clearing
      const resetIdentity: Identity = {
        id: Math.random().toString(36).substring(7),
        walletAddress,
        verificationLevel: 'none',
        verificationHash: undefined,
        verifiedAt: undefined,
        expiresAt: undefined,
        signature: undefined,
        metadata: undefined,
      };
      
      // Replace entire identity to ensure clean state
      const identities = getStorageData<Identity>(STORAGE_KEYS.IDENTITIES);
      const index = identities.findIndex(identity => identity.walletAddress === walletAddress);
      if (index !== -1) {
        identities[index] = resetIdentity;
        setStorageData(STORAGE_KEYS.IDENTITIES, identities);
      }
      return resetIdentity;
    }
  },

  async create(data: InsertIdentity): Promise<Identity> {
    // Validate input data
    const validatedData = insertIdentitySchema.parse(data);
    
    // Enforce emergent security: all identities begin at 'none' state
    // This creates a natural progression that can't be bypassed
    const safeData = {
      ...validatedData,
      verificationLevel: 'none' as const,
      verifiedAt: undefined,
      expiresAt: undefined,
    };
    
    const identities = getStorageData<Identity>(STORAGE_KEYS.IDENTITIES);
    const newIdentity: Identity = {
      id: Math.random().toString(36).substring(7),
      ...safeData,
    };
    
    // Validate final identity - should always pass with 'none' level
    const validatedIdentity = identitySchema.parse(newIdentity);
    identities.push(validatedIdentity);
    setStorageData(STORAGE_KEYS.IDENTITIES, identities);
    return validatedIdentity;
  },

  async update(walletAddress: string, updates: Partial<Identity>): Promise<Identity> {
    const identities = getStorageData<Identity>(STORAGE_KEYS.IDENTITIES);
    const index = identities.findIndex(identity => identity.walletAddress === walletAddress);
    
    if (index === -1) {
      throw new Error('Identity not found');
    }
    
    const currentIdentity = identities[index];
    
    // Enforce progressive verification sequencing
    if (updates.verificationLevel === 'verified' && currentIdentity.verificationLevel !== 'basic') {
      throw new Error('Must complete basic verification before full verification');
    }
    
    const updatedIdentity = { ...currentIdentity, ...updates };
    
    // Validate with Zod schema
    const validatedIdentity = identitySchema.parse(updatedIdentity);
    
    identities[index] = validatedIdentity;
    setStorageData(STORAGE_KEYS.IDENTITIES, identities);
    return validatedIdentity;
  },

  // Unified verification flow that handles create + update atomically
  async verifyLevel(walletAddress: string, targetLevel: 'basic' | 'verified'): Promise<Identity> {
    const existing = await this.getByWallet(walletAddress);
    
    // Enforce progressive verification
    if (targetLevel === 'verified' && (!existing || existing.verificationLevel !== 'basic')) {
      throw new Error('Must complete basic verification before full verification');
    }
    
    const verificationData = {
      verificationLevel: targetLevel,
      verificationHash: Math.random().toString(36).substring(7),
      verifiedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
    };

    if (existing) {
      return await this.update(walletAddress, verificationData);
    } else {
      // Create with 'none' first, then immediately elevate
      const baseIdentity = await this.create({ walletAddress });
      return await this.update(walletAddress, verificationData);
    }
  },

  // Generate wallet signature for verification (future enhancement)
  async generateVerificationSignature(walletAddress: string, level: string): Promise<string> {
    // This would use wallet signing in a real implementation
    // For now, return a placeholder that includes wallet and timestamp
    return `${walletAddress}-${level}-${Date.now()}`;
  },
};

// Movement API
export const movementApi = {
  async getAll(): Promise<Movement[]> {
    return getStorageData<Movement>(STORAGE_KEYS.MOVEMENTS);
  },

  async create(data: InsertMovement): Promise<Movement> {
    const movements = getStorageData<Movement>(STORAGE_KEYS.MOVEMENTS);
    const newMovement: Movement = {
      id: Math.random().toString(36).substring(7),
      memberCount: 0,
      createdAt: new Date().toISOString(),
      ...data,
    };
    movements.push(newMovement);
    setStorageData(STORAGE_KEYS.MOVEMENTS, movements);
    return newMovement;
  },
};

// Document API
export const documentApi = {
  async getAll(): Promise<Document[]> {
    return getStorageData<Document>(STORAGE_KEYS.DOCUMENTS);
  },

  async create(data: InsertDocument): Promise<Document> {
    const documents = getStorageData<Document>(STORAGE_KEYS.DOCUMENTS);
    const newDocument: Document = {
      id: Math.random().toString(36).substring(7),
      verificationStatus: 'pending',
      createdAt: new Date().toISOString(),
      ...data,
    };
    documents.push(newDocument);
    setStorageData(STORAGE_KEYS.DOCUMENTS, documents);
    return newDocument;
  },
};

// Campaign API
export const campaignApi = {
  async getAll(): Promise<Campaign[]> {
    return getStorageData<Campaign>(STORAGE_KEYS.CAMPAIGNS);
  },

  async create(data: InsertCampaign): Promise<Campaign> {
    const campaigns = getStorageData<Campaign>(STORAGE_KEYS.CAMPAIGNS);
    const newCampaign: Campaign = {
      id: Math.random().toString(36).substring(7),
      raisedAmount: 0,
      contributorCount: 0,
      createdAt: new Date().toISOString(),
      ...data,
    };
    campaigns.push(newCampaign);
    setStorageData(STORAGE_KEYS.CAMPAIGNS, campaigns);
    return newCampaign;
  },
};

// Messaging API - Secure communications for activist coordination
export const messagingApi = {
  async createConversation(data: InsertConversation): Promise<Conversation> {
    const conversations = getStorageData<Conversation>(STORAGE_KEYS.CONVERSATIONS);
    const now = new Date().toISOString();
    
    const newConversation: Conversation = {
      id: Math.random().toString(36).substring(7),
      createdAt: now,
      lastActivity: now,
      ...data,
    };
    
    conversations.push(newConversation);
    setStorageData(STORAGE_KEYS.CONVERSATIONS, conversations);
    return newConversation;
  },

  async getConversationsByWallet(walletAddress: string): Promise<Conversation[]> {
    const conversations = getStorageData<Conversation>(STORAGE_KEYS.CONVERSATIONS);
    return conversations
      .filter(conv => conv.participants.includes(walletAddress) && !conv.isArchived)
      .sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime());
  },

  async getConversation(id: string): Promise<Conversation | null> {
    const conversations = getStorageData<Conversation>(STORAGE_KEYS.CONVERSATIONS);
    return conversations.find(conv => conv.id === id) || null;
  },

  async sendMessage(data: InsertMessage): Promise<Message> {
    const messages = getStorageData<Message>(STORAGE_KEYS.MESSAGES);
    
    const newMessage: Message = {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toISOString(),
      ...data,
    };
    
    messages.push(newMessage);
    setStorageData(STORAGE_KEYS.MESSAGES, messages);
    
    // Update conversation's last activity
    await this.updateConversationActivity(data.conversationId);
    
    return newMessage;
  },

  async getMessagesByConversation(conversationId: string): Promise<Message[]> {
    const messages = getStorageData<Message>(STORAGE_KEYS.MESSAGES);
    return messages
      .filter(msg => msg.conversationId === conversationId && !msg.isDeleted)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  },

  async updateConversationActivity(conversationId: string): Promise<void> {
    const conversations = getStorageData<Conversation>(STORAGE_KEYS.CONVERSATIONS);
    const index = conversations.findIndex(conv => conv.id === conversationId);
    
    if (index !== -1) {
      conversations[index].lastActivity = new Date().toISOString();
      setStorageData(STORAGE_KEYS.CONVERSATIONS, conversations);
    }
  },

  async archiveConversation(conversationId: string): Promise<void> {
    const conversations = getStorageData<Conversation>(STORAGE_KEYS.CONVERSATIONS);
    const index = conversations.findIndex(conv => conv.id === conversationId);
    
    if (index !== -1) {
      conversations[index].isArchived = true;
      setStorageData(STORAGE_KEYS.CONVERSATIONS, conversations);
    }
  },

  async deleteMessage(messageId: string): Promise<void> {
    const messages = getStorageData<Message>(STORAGE_KEYS.MESSAGES);
    const index = messages.findIndex(msg => msg.id === messageId);
    
    if (index !== -1) {
      messages[index].isDeleted = true;
      setStorageData(STORAGE_KEYS.MESSAGES, messages);
    }
  },
};

// DAO Governance API - Democratic decision-making for activist movements
export const governanceApi = {
  async createProposal(data: InsertProposal): Promise<Proposal> {
    const proposals = getStorageData<Proposal>(STORAGE_KEYS.PROPOSALS);
    const now = new Date().toISOString();
    
    // Auto-activate if voting starts now or in the past
    const votingStartsAt = new Date(data.votingStartsAt);
    const isReadyToActivate = votingStartsAt <= new Date();
    
    const newProposal: Proposal = {
      id: Math.random().toString(36).substring(7),
      createdAt: now,
      updatedAt: now,
      yesVotes: 0,
      noVotes: 0,
      abstainVotes: 0,
      totalVotes: 0,
      status: isReadyToActivate ? 'active' : 'draft',
      ...data,
    };
    
    proposals.push(newProposal);
    setStorageData(STORAGE_KEYS.PROPOSALS, proposals);
    return newProposal;
  },

  async getProposals(movementId?: string): Promise<Proposal[]> {
    const proposals = getStorageData<Proposal>(STORAGE_KEYS.PROPOSALS);
    
    // Finalize any expired active proposals before returning
    let hasUpdates = false;
    const now = new Date();
    
    for (const proposal of proposals) {
      if (proposal.status === 'active' && new Date(proposal.votingEndsAt) <= now) {
        await this.checkProposalResolution(proposal);
        hasUpdates = true;
      }
    }
    
    if (hasUpdates) {
      setStorageData(STORAGE_KEYS.PROPOSALS, proposals);
    }
    
    return proposals
      .filter(proposal => !movementId || proposal.movementId === movementId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getProposal(id: string): Promise<Proposal | null> {
    const proposals = getStorageData<Proposal>(STORAGE_KEYS.PROPOSALS);
    const proposal = proposals.find(proposal => proposal.id === id);
    
    if (!proposal) return null;
    
    // Finalize if expired
    const now = new Date();
    if (proposal.status === 'active' && new Date(proposal.votingEndsAt) <= now) {
      await this.checkProposalResolution(proposal);
      setStorageData(STORAGE_KEYS.PROPOSALS, proposals);
    }
    
    return proposal;
  },

  async activateProposal(proposalId: string, requesterAddress?: string): Promise<Proposal> {
    const proposals = getStorageData<Proposal>(STORAGE_KEYS.PROPOSALS);
    const index = proposals.findIndex(p => p.id === proposalId);
    
    if (index === -1) throw new Error('Proposal not found');
    
    const proposal = proposals[index];
    
    // Validate proposer authorization
    if (requesterAddress && proposal.proposer !== requesterAddress) {
      throw new Error('Only the proposer can activate this proposal');
    }
    
    // Validate timing
    const now = new Date();
    const votingStarts = new Date(proposal.votingStartsAt);
    if (now < votingStarts) {
      throw new Error('Cannot activate before scheduled voting start time');
    }
    
    if (proposal.status !== 'draft') {
      throw new Error('Only draft proposals can be activated');
    }
    
    proposals[index].status = 'active';
    proposals[index].updatedAt = new Date().toISOString();
    
    setStorageData(STORAGE_KEYS.PROPOSALS, proposals);
    return proposals[index];
  },

  async submitVote(data: InsertVote): Promise<Vote> {
    const proposals = getStorageData<Proposal>(STORAGE_KEYS.PROPOSALS);
    const votes = getStorageData<Vote>(STORAGE_KEYS.VOTES);
    
    // Get the proposal to validate voting window
    const proposal = proposals.find(p => p.id === data.proposalId);
    if (!proposal) {
      throw new Error('Proposal not found');
    }
    
    // Check proposal status and voting window
    if (proposal.status !== 'active') {
      throw new Error('Voting is not active for this proposal');
    }
    
    const now = new Date();
    const votingEnds = new Date(proposal.votingEndsAt);
    const votingStarts = new Date(proposal.votingStartsAt);
    
    if (now < votingStarts) {
      throw new Error('Voting has not started yet');
    }
    
    if (now > votingEnds) {
      throw new Error('Voting period has ended');
    }
    
    // Check if user already voted
    const existingVote = votes.find(
      vote => vote.proposalId === data.proposalId && vote.voterAddress === data.voterAddress
    );
    
    if (existingVote) {
      throw new Error('You have already voted on this proposal');
    }
    
    const newVote: Vote = {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toISOString(),
      ...data,
    };
    
    votes.push(newVote);
    setStorageData(STORAGE_KEYS.VOTES, votes);
    
    // Update proposal vote counts
    await this.updateProposalVotes(data.proposalId);
    
    return newVote;
  },

  async getVotesByProposal(proposalId: string): Promise<Vote[]> {
    const votes = getStorageData<Vote>(STORAGE_KEYS.VOTES);
    return votes.filter(vote => vote.proposalId === proposalId);
  },

  async getUserVote(proposalId: string, voterAddress: string): Promise<Vote | null> {
    const votes = getStorageData<Vote>(STORAGE_KEYS.VOTES);
    return votes.find(
      vote => vote.proposalId === proposalId && vote.voterAddress === voterAddress
    ) || null;
  },

  async updateProposalVotes(proposalId: string): Promise<void> {
    const proposals = getStorageData<Proposal>(STORAGE_KEYS.PROPOSALS);
    const votes = getStorageData<Vote>(STORAGE_KEYS.VOTES);
    
    const proposalIndex = proposals.findIndex(p => p.id === proposalId);
    if (proposalIndex === -1) return;
    
    const proposalVotes = votes.filter(vote => vote.proposalId === proposalId);
    
    const yesVotes = proposalVotes.filter(v => v.voteChoice === 'yes').length;
    const noVotes = proposalVotes.filter(v => v.voteChoice === 'no').length;
    const abstainVotes = proposalVotes.filter(v => v.voteChoice === 'abstain').length;
    
    proposals[proposalIndex] = {
      ...proposals[proposalIndex],
      yesVotes,
      noVotes,
      abstainVotes,
      totalVotes: proposalVotes.length,
      updatedAt: new Date().toISOString(),
    };
    
    // Check if proposal should be resolved
    await this.checkProposalResolution(proposals[proposalIndex]);
    
    setStorageData(STORAGE_KEYS.PROPOSALS, proposals);
  },

  async checkProposalResolution(proposal: Proposal): Promise<void> {
    const now = new Date();
    const votingEnds = new Date(proposal.votingEndsAt);
    
    // Only resolve if voting period has ended
    if (now <= votingEnds || proposal.status !== 'active') return;
    
    const totalVotes = proposal.totalVotes;
    const hasQuorum = totalVotes >= proposal.quorumRequired;
    
    if (!hasQuorum) {
      proposal.status = 'rejected';
      return;
    }
    
    const yesPercentage = (proposal.yesVotes / totalVotes) * 100;
    proposal.status = yesPercentage >= proposal.passingThreshold ? 'passed' : 'rejected';
  },

  async createGovernanceConfig(data: InsertGovernanceConfig): Promise<GovernanceConfig> {
    const configs = getStorageData<GovernanceConfig>(STORAGE_KEYS.GOVERNANCE_CONFIGS);
    const now = new Date().toISOString();
    
    const newConfig: GovernanceConfig = {
      id: Math.random().toString(36).substring(7),
      createdAt: now,
      updatedAt: now,
      ...data,
    };
    
    configs.push(newConfig);
    setStorageData(STORAGE_KEYS.GOVERNANCE_CONFIGS, configs);
    return newConfig;
  },

  async getGovernanceConfig(movementId?: string): Promise<GovernanceConfig | null> {
    const configs = getStorageData<GovernanceConfig>(STORAGE_KEYS.GOVERNANCE_CONFIGS);
    return configs.find(config => 
      config.isActive && 
      (movementId ? config.movementId === movementId : !config.movementId)
    ) || null;
  },

  // Get drafts for specific proposer
  async getDraftProposals(proposerAddress: string): Promise<Proposal[]> {
    const proposals = getStorageData<Proposal>(STORAGE_KEYS.PROPOSALS);
    return proposals
      .filter(proposal => proposal.status === 'draft' && proposal.proposer === proposerAddress)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
};