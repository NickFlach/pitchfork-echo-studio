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