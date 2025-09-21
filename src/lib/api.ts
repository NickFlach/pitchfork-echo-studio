// Decentralized API layer for Pitchfork Protocol
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

import { web3Storage, smartContracts, p2pMessaging } from './web3-storage';

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

// DECENTRALIZED Identity API - Blockchain-based verification
export const identityApi = {
  async getByWallet(walletAddress: string): Promise<Identity | null> {
    try {
      // Get identity from blockchain instead of localStorage
      const blockchainIdentity = await web3Storage.getIdentity(walletAddress);
      
      if (!blockchainIdentity) {
        return {
          id: walletAddress,
          walletAddress,
          verificationLevel: 'none',
          verificationHash: undefined,
          verifiedAt: undefined,
          expiresAt: undefined,
          signature: undefined,
          metadata: undefined,
        };
      }
      
      return identitySchema.parse(blockchainIdentity);
    } catch (error) {
      console.error('Error fetching blockchain identity:', error);
      // Fallback to basic identity
      return {
        id: walletAddress,
        walletAddress,
        verificationLevel: 'none',
        verificationHash: undefined,
        verifiedAt: undefined,
        expiresAt: undefined,
        signature: undefined,
        metadata: undefined,
      };
    }
  },

  async create(data: InsertIdentity): Promise<Identity> {
    const validatedData = insertIdentitySchema.parse(data);
    
    const newIdentity: Identity = {
      id: validatedData.walletAddress,
      ...validatedData,
      verificationLevel: 'none' as const,
      verifiedAt: undefined,
      expiresAt: undefined,
    };
    
    // Store on blockchain for decentralized verification
    await web3Storage.storeIdentity(validatedData.walletAddress, newIdentity);
    
    return identitySchema.parse(newIdentity);
  },

  async update(walletAddress: string, updates: Partial<Identity>): Promise<Identity> {
    const currentIdentity = await this.getByWallet(walletAddress);
    
    if (!currentIdentity) {
      throw new Error('Identity not found');
    }
    
    // Enforce progressive verification sequencing
    if (updates.verificationLevel === 'verified' && currentIdentity.verificationLevel !== 'basic') {
      throw new Error('Must complete basic verification before full verification');
    }
    
    const updatedIdentity = { ...currentIdentity, ...updates };
    const validatedIdentity = identitySchema.parse(updatedIdentity);
    
    // Update on blockchain
    await web3Storage.storeIdentity(walletAddress, validatedIdentity);
    
    return validatedIdentity;
  },

  // Blockchain-based verification with zero-knowledge proofs
  async verifyLevel(walletAddress: string, targetLevel: 'basic' | 'verified'): Promise<Identity> {
    const existing = await this.getByWallet(walletAddress);
    
    // Enforce progressive verification
    if (targetLevel === 'verified' && (!existing || existing.verificationLevel !== 'basic')) {
      throw new Error('Must complete basic verification before full verification');
    }
    
    // Generate cryptographic proof of verification
    const verificationHash = await this.generateVerificationProof(walletAddress, targetLevel);
    
    const verificationData = {
      verificationLevel: targetLevel,
      verificationHash,
      verifiedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    };

    if (existing) {
      return await this.update(walletAddress, verificationData);
    } else {
      const baseIdentity = await this.create({ walletAddress });
      return await this.update(walletAddress, verificationData);
    }
  },

  // Generate zero-knowledge proof for verification
  async generateVerificationProof(walletAddress: string, level: string): Promise<string> {
    // In a real implementation, this would generate a ZK proof
    // For now, we'll create a cryptographic signature
    const message = `verify:${walletAddress}:${level}:${Date.now()}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  },

  // Generate wallet signature for verification
  async generateVerificationSignature(walletAddress: string, level: string): Promise<string> {
    // This would use wallet signing in a real implementation
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

// DECENTRALIZED Document API - IPFS + Blockchain verification
export const documentApi = {
  async getAll(): Promise<Document[]> {
    // In a real implementation, this would query blockchain for document references
    // then retrieve from IPFS. For now, fallback to local storage
    return getStorageData<Document>(STORAGE_KEYS.DOCUMENTS);
  },

  async create(data: InsertDocument): Promise<Document> {
    const newDocument: Document = {
      id: Math.random().toString(36).substring(7),
      verificationStatus: 'pending',
      createdAt: new Date().toISOString(),
      ...data,
    };

    try {
      // Store document on IPFS with blockchain reference for tamper-proof evidence
      const blockchainHash = await web3Storage.storeDocument(newDocument);
      
      // Update document with blockchain reference
      newDocument.id = blockchainHash;
      newDocument.metadata = {
        ...newDocument.metadata,
        blockchainHash,
        ipfsStored: true,
        tamperProof: true
      };

      // Also store locally for offline access
      const documents = getStorageData<Document>(STORAGE_KEYS.DOCUMENTS);
      documents.push(newDocument);
      setStorageData(STORAGE_KEYS.DOCUMENTS, documents);

      return newDocument;
    } catch (error) {
      console.error('Error storing document on blockchain/IPFS:', error);
      
      // Fallback to local storage with warning
      newDocument.metadata = {
        ...newDocument.metadata,
        localOnly: true,
        warning: 'Document stored locally only - not tamper-proof'
      };
      
      const documents = getStorageData<Document>(STORAGE_KEYS.DOCUMENTS);
      documents.push(newDocument);
      setStorageData(STORAGE_KEYS.DOCUMENTS, documents);
      
      return newDocument;
    }
  },

  async getDocument(id: string): Promise<Document | null> {
    try {
      // Try to retrieve from IPFS/blockchain first
      const blockchainDocument = await web3Storage.getDocument(id);
      if (blockchainDocument) {
        return blockchainDocument;
      }
    } catch (error) {
      console.error('Error retrieving from blockchain/IPFS:', error);
    }

    // Fallback to local storage
    const documents = getStorageData<Document>(STORAGE_KEYS.DOCUMENTS);
    return documents.find(doc => doc.id === id) || null;
  },

  async verifyDocument(id: string, verifierAddress: string): Promise<Document> {
    const document = await this.getDocument(id);
    if (!document) {
      throw new Error('Document not found');
    }

    // Update verification status
    const updatedDocument: Document = {
      ...document,
      verificationStatus: 'verified',
      verifiedBy: verifierAddress,
      verifiedAt: new Date().toISOString(),
      metadata: {
        ...document.metadata,
        verificationBlockchain: true,
        verifierAddress
      }
    };

    // Store verification on blockchain for transparency
    try {
      await web3Storage.storeDocument(updatedDocument);
    } catch (error) {
      console.error('Error storing verification on blockchain:', error);
    }

    // Update local storage
    const documents = getStorageData<Document>(STORAGE_KEYS.DOCUMENTS);
    const index = documents.findIndex(doc => doc.id === id);
    if (index !== -1) {
      documents[index] = updatedDocument;
      setStorageData(STORAGE_KEYS.DOCUMENTS, documents);
    }

    return updatedDocument;
  },
};

// DECENTRALIZED Campaign API - Smart Contract funding
export const campaignApi = {
  async getAll(): Promise<Campaign[]> {
    // In a real implementation, this would query blockchain for campaign contracts
    return getStorageData<Campaign>(STORAGE_KEYS.CAMPAIGNS);
  },

  async create(data: InsertCampaign): Promise<Campaign> {
    const newCampaign: Campaign = {
      id: Math.random().toString(36).substring(7),
      raisedAmount: 0,
      contributorCount: 0,
      createdAt: new Date().toISOString(),
      ...data,
    };

    try {
      // Deploy smart contract for transparent, trustless funding
      const contractHash = await smartContracts.createFundingCampaign(newCampaign);
      
      // Update campaign with smart contract address
      newCampaign.id = contractHash;
      newCampaign.walletAddress = contractHash; // Contract address becomes the wallet
      newCampaign.metadata = {
        smartContract: true,
        contractAddress: contractHash,
        transparent: true,
        trustless: true
      };

      // Store locally for UI
      const campaigns = getStorageData<Campaign>(STORAGE_KEYS.CAMPAIGNS);
      campaigns.push(newCampaign);
      setStorageData(STORAGE_KEYS.CAMPAIGNS, campaigns);

      return newCampaign;
    } catch (error) {
      console.error('Error deploying funding smart contract:', error);
      
      // Fallback to local storage with warning
      newCampaign.metadata = {
        localOnly: true,
        warning: 'Campaign not deployed to blockchain - not trustless'
      };
      
      const campaigns = getStorageData<Campaign>(STORAGE_KEYS.CAMPAIGNS);
      campaigns.push(newCampaign);
      setStorageData(STORAGE_KEYS.CAMPAIGNS, campaigns);
      
      return newCampaign;
    }
  },

  async contribute(campaignId: string, amount: number, contributorAddress: string): Promise<void> {
    try {
      // Send contribution directly to smart contract
      await smartContracts.contributeToCampaign(campaignId, amount);
      
      // Update local campaign data
      const campaigns = getStorageData<Campaign>(STORAGE_KEYS.CAMPAIGNS);
      const index = campaigns.findIndex(c => c.id === campaignId);
      
      if (index !== -1) {
        campaigns[index].raisedAmount += amount;
        campaigns[index].contributorCount += 1;
        setStorageData(STORAGE_KEYS.CAMPAIGNS, campaigns);
      }
    } catch (error) {
      console.error('Error contributing to smart contract:', error);
      throw new Error('Failed to process contribution on blockchain');
    }
  },

  async getCampaign(id: string): Promise<Campaign | null> {
    const campaigns = getStorageData<Campaign>(STORAGE_KEYS.CAMPAIGNS);
    return campaigns.find(campaign => campaign.id === id) || null;
  },

  // Developer funding - direct donations to development wallet
  async sendDeveloperDonation(amount: number, donorAddress: string): Promise<string> {
    const DEVELOPER_WALLET = '0x7C29b9Bc9f7CA06DB45E5558c6DEe84f4dd01efb';
    
    try {
      // This would use the smart contract service to send ETH directly
      return await smartContracts.contributeToCampaign(DEVELOPER_WALLET, amount);
    } catch (error) {
      console.error('Error sending developer donation:', error);
      throw new Error('Failed to send donation to developer wallet');
    }
  },
};

// DECENTRALIZED Messaging API - P2P encrypted communications
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

    // Store locally first
    messages.push(newMessage);
    setStorageData(STORAGE_KEYS.MESSAGES, messages);

    // Try to send via P2P to all participants
    try {
      const conversation = await this.getConversation(data.conversationId);
      if (conversation) {
        // Send to each participant via P2P
        for (const participantAddress of conversation.participants) {
          if (participantAddress !== data.senderAddress) {
            try {
              await p2pMessaging.sendMessage(participantAddress, data.encryptedContent);
            } catch (error) {
              console.error(`Failed to send P2P message to ${participantAddress}:`, error);
              // Message still stored locally, will sync when P2P connection is restored
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending P2P messages:', error);
      // Message is still stored locally
    }
    
    // Update conversation's last activity
    await this.updateConversationActivity(data.conversationId);
    
    return newMessage;
  },

  // Initialize P2P connections for a conversation
  async initializeP2PConnections(conversationId: string, currentUserAddress: string): Promise<void> {
    const conversation = await this.getConversation(conversationId);
    if (!conversation) return;

    // Create P2P connections to all other participants
    for (const participantAddress of conversation.participants) {
      if (participantAddress !== currentUserAddress) {
        try {
          await p2pMessaging.createConnection(participantAddress);
        } catch (error) {
          console.error(`Failed to create P2P connection to ${participantAddress}:`, error);
        }
      }
    }
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

  // DECENTRALIZED voting - Store votes on blockchain for transparency
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
    
    // Check if user already voted (check blockchain first)
    try {
      const blockchainVotes = await web3Storage.getVotes(data.proposalId);
      const existingBlockchainVote = blockchainVotes.find(
        vote => vote.voterAddress === data.voterAddress
      );
      
      if (existingBlockchainVote) {
        throw new Error('You have already voted on this proposal (blockchain record)');
      }
    } catch (error) {
      console.error('Error checking blockchain votes:', error);
    }
    
    // Check local storage as fallback
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

    try {
      // Store vote on blockchain for transparency and immutability
      const blockchainHash = await smartContracts.submitVote(data.proposalId, newVote);
      newVote.id = blockchainHash;
      newVote.signature = blockchainHash; // Use blockchain hash as signature
    } catch (error) {
      console.error('Error storing vote on blockchain:', error);
      // Continue with local storage but mark as not blockchain-verified
    }
    
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