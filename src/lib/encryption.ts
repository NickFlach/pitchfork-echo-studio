// Browser-native encryption for secure messaging
// Applies conscious complexity principles to create emergent security within frontend constraints

/**
 * Encryption service using Web Crypto API for end-to-end messaging security
 * This provides real encryption within browser constraints
 */
export class EncryptionService {
  private static instance: EncryptionService;
  
  public static getInstance(): EncryptionService {
    if (!EncryptionService.instance) {
      EncryptionService.instance = new EncryptionService();
    }
    return EncryptionService.instance;
  }

  /**
   * Generate a new encryption key for a conversation
   */
  async generateConversationKey(): Promise<string> {
    const key = await window.crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256,
      },
      true,
      ['encrypt', 'decrypt']
    );
    
    const exported = await window.crypto.subtle.exportKey('raw', key);
    return Array.from(new Uint8Array(exported))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Import a key from hex string
   */
  private async importKey(keyHex: string): Promise<CryptoKey> {
    const keyArray = new Uint8Array(
      keyHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
    );
    
    return await window.crypto.subtle.importKey(
      'raw',
      keyArray,
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Encrypt a message using the conversation key
   */
  async encryptMessage(message: string, conversationKeyHex: string): Promise<{
    encryptedContent: string;
    contentHash: string;
  }> {
    const key = await this.importKey(conversationKeyHex);
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    
    // Generate random IV
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    
    // Encrypt the message
    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );
    
    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);
    
    const encryptedContent = Array.from(combined)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    // Generate content hash for integrity
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const contentHash = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    return { encryptedContent, contentHash };
  }

  /**
   * Decrypt a message using the conversation key
   */
  async decryptMessage(encryptedContentHex: string, conversationKeyHex: string): Promise<string> {
    const key = await this.importKey(conversationKeyHex);
    
    // Convert hex to bytes
    const encryptedArray = new Uint8Array(
      encryptedContentHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
    );
    
    // Extract IV and encrypted data
    const iv = encryptedArray.slice(0, 12);
    const encrypted = encryptedArray.slice(12);
    
    // Decrypt
    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encrypted
    );
    
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  }

  /**
   * Verify message integrity
   */
  async verifyMessageIntegrity(message: string, expectedHash: string): Promise<boolean> {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const actualHash = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    return actualHash === expectedHash;
  }

  /**
   * Generate a shared key for multiple participants (simplified approach)
   * In a real implementation, this would use proper key exchange protocols
   */
  async generateSharedKey(participants: string[]): Promise<string> {
    // For prototype: derive key from sorted participant list
    const sortedParticipants = [...participants].sort();
    const combined = sortedParticipants.join('');
    
    const encoder = new TextEncoder();
    const data = encoder.encode(combined + Date.now().toString());
    
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
}

export const encryption = EncryptionService.getInstance();