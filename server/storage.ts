import { 
  Identity, 
  InsertIdentity, 
  Movement, 
  InsertMovement, 
  Document, 
  InsertDocument, 
  Campaign, 
  InsertCampaign, 
  Donation, 
  InsertDonation,
  Membership,
  InsertMembership
} from '../shared/schema';

export interface IStorage {
  // Identity operations
  createIdentity(identity: InsertIdentity): Promise<Identity>;
  getIdentityByWallet(walletAddress: string): Promise<Identity | null>;
  updateIdentity(walletAddress: string, updates: Partial<Identity>): Promise<Identity>;
  
  // Movement operations
  createMovement(movement: InsertMovement): Promise<Movement>;
  getMovements(): Promise<Movement[]>;
  getMovement(id: string): Promise<Movement | null>;
  updateMovement(id: string, updates: Partial<Movement>): Promise<Movement>;
  
  // Document operations
  createDocument(document: InsertDocument): Promise<Document>;
  getDocuments(): Promise<Document[]>;
  getDocument(id: string): Promise<Document | null>;
  updateDocument(id: string, updates: Partial<Document>): Promise<Document>;
  
  // Campaign operations
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  getCampaigns(): Promise<Campaign[]>;
  getCampaign(id: string): Promise<Campaign | null>;
  updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign>;
  
  // Donation operations
  createDonation(donation: InsertDonation): Promise<Donation>;
  getDonationsByCampaign(campaignId: string): Promise<Donation[]>;
  
  // Membership operations
  createMembership(membership: InsertMembership): Promise<Membership>;
  getMembershipsByMovement(movementId: string): Promise<Membership[]>;
  getMembershipsByWallet(walletAddress: string): Promise<Membership[]>;
}

export class MemStorage implements IStorage {
  private identities: Identity[] = [];
  private movements: Movement[] = [];
  private documents: Document[] = [];
  private campaigns: Campaign[] = [];
  private donations: Donation[] = [];
  private memberships: Membership[] = [];

  // Identity operations
  async createIdentity(identity: InsertIdentity): Promise<Identity> {
    const newIdentity: Identity = {
      id: Math.random().toString(36).substring(7),
      ...identity,
    };
    this.identities.push(newIdentity);
    return newIdentity;
  }

  async getIdentityByWallet(walletAddress: string): Promise<Identity | null> {
    return this.identities.find(identity => identity.walletAddress === walletAddress) || null;
  }

  async updateIdentity(walletAddress: string, updates: Partial<Identity>): Promise<Identity> {
    const index = this.identities.findIndex(identity => identity.walletAddress === walletAddress);
    if (index === -1) throw new Error('Identity not found');
    
    this.identities[index] = { ...this.identities[index], ...updates };
    return this.identities[index];
  }

  // Movement operations
  async createMovement(movement: InsertMovement): Promise<Movement> {
    const newMovement: Movement = {
      id: Math.random().toString(36).substring(7),
      memberCount: 0,
      createdAt: new Date().toISOString(),
      ...movement,
    };
    this.movements.push(newMovement);
    return newMovement;
  }

  async getMovements(): Promise<Movement[]> {
    return this.movements;
  }

  async getMovement(id: string): Promise<Movement | null> {
    return this.movements.find(movement => movement.id === id) || null;
  }

  async updateMovement(id: string, updates: Partial<Movement>): Promise<Movement> {
    const index = this.movements.findIndex(movement => movement.id === id);
    if (index === -1) throw new Error('Movement not found');
    
    this.movements[index] = { ...this.movements[index], ...updates };
    return this.movements[index];
  }

  // Document operations
  async createDocument(document: InsertDocument): Promise<Document> {
    const newDocument: Document = {
      id: Math.random().toString(36).substring(7),
      verificationStatus: 'pending',
      createdAt: new Date().toISOString(),
      ...document,
    };
    this.documents.push(newDocument);
    return newDocument;
  }

  async getDocuments(): Promise<Document[]> {
    return this.documents;
  }

  async getDocument(id: string): Promise<Document | null> {
    return this.documents.find(doc => doc.id === id) || null;
  }

  async updateDocument(id: string, updates: Partial<Document>): Promise<Document> {
    const index = this.documents.findIndex(doc => doc.id === id);
    if (index === -1) throw new Error('Document not found');
    
    this.documents[index] = { ...this.documents[index], ...updates };
    return this.documents[index];
  }

  // Campaign operations
  async createCampaign(campaign: InsertCampaign): Promise<Campaign> {
    const newCampaign: Campaign = {
      id: Math.random().toString(36).substring(7),
      raisedAmount: 0,
      contributorCount: 0,
      createdAt: new Date().toISOString(),
      ...campaign,
    };
    this.campaigns.push(newCampaign);
    return newCampaign;
  }

  async getCampaigns(): Promise<Campaign[]> {
    return this.campaigns;
  }

  async getCampaign(id: string): Promise<Campaign | null> {
    return this.campaigns.find(campaign => campaign.id === id) || null;
  }

  async updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign> {
    const index = this.campaigns.findIndex(campaign => campaign.id === id);
    if (index === -1) throw new Error('Campaign not found');
    
    this.campaigns[index] = { ...this.campaigns[index], ...updates };
    return this.campaigns[index];
  }

  // Donation operations
  async createDonation(donation: InsertDonation): Promise<Donation> {
    const newDonation: Donation = {
      id: Math.random().toString(36).substring(7),
      createdAt: new Date().toISOString(),
      ...donation,
    };
    this.donations.push(newDonation);

    // Update campaign stats
    const campaign = await this.getCampaign(donation.campaignId);
    if (campaign) {
      await this.updateCampaign(donation.campaignId, {
        raisedAmount: campaign.raisedAmount + donation.amount,
        contributorCount: campaign.contributorCount + 1,
      });
    }

    return newDonation;
  }

  async getDonationsByCampaign(campaignId: string): Promise<Donation[]> {
    return this.donations.filter(donation => donation.campaignId === campaignId);
  }

  // Membership operations
  async createMembership(membership: InsertMembership): Promise<Membership> {
    const newMembership: Membership = {
      id: Math.random().toString(36).substring(7),
      joinedAt: new Date().toISOString(),
      ...membership,
    };
    this.memberships.push(newMembership);

    // Update movement member count
    const movement = await this.getMovement(membership.movementId);
    if (movement) {
      await this.updateMovement(membership.movementId, {
        memberCount: movement.memberCount + 1,
      });
    }

    return newMembership;
  }

  async getMembershipsByMovement(movementId: string): Promise<Membership[]> {
    return this.memberships.filter(membership => membership.movementId === movementId);
  }

  async getMembershipsByWallet(walletAddress: string): Promise<Membership[]> {
    return this.memberships.filter(membership => membership.memberAddress === walletAddress);
  }
}

export const storage = new MemStorage();