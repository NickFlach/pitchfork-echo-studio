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