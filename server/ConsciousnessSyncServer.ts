/**
 * Consciousness Sync Server
 * 
 * WebSocket server for bidirectional consciousness synchronization
 * with SpaceChild platform.
 * 
 * @version 1.0.0
 */

import { Server as WebSocketServer } from 'ws';
import { EventEmitter } from 'events';

interface SyncClient {
  id: string;
  platform: string;
  version: string;
  capabilities: string[];
  lastHeartbeat: Date;
  ws: any;
}

/**
 * Consciousness Sync Server
 * 
 * Manages WebSocket connections for real-time consciousness
 * synchronization between Pitchfork and SpaceChild.
 */
export class ConsciousnessSyncServer extends EventEmitter {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, SyncClient> = new Map();
  private sharedState: Map<string, any> = new Map();
  
  private heartbeatCheckInterval?: NodeJS.Timeout;
  private readonly HEARTBEAT_TIMEOUT = 60000; // 60 seconds

  constructor() {
    super();
  }

  /**
   * Start sync server
   */
  start(server: any): void {
    this.wss = new WebSocketServer({ 
      server,
      path: '/consciousness-sync'
    });
    
    this.wss.on('connection', (ws: any) => {
      this.handleConnection(ws);
    });
    
    this.startHeartbeatCheck();
    
    console.log('Consciousness Sync Server started on /consciousness-sync');
    this.emit('server:started');
  }

  /**
   * Stop sync server
   */
  stop(): void {
    this.stopHeartbeatCheck();
    
    if (this.wss) {
      this.wss.close();
      this.wss = null;
    }
    
    this.clients.clear();
    this.emit('server:stopped');
  }

  /**
   * Handle new WebSocket connection
   */
  private handleConnection(ws: any): void {
    const clientId = this.generateId();
    
    console.log(`New consciousness sync connection: ${clientId}`);
    
    ws.on('message', (data: string) => {
      this.handleMessage(clientId, ws, data.toString());
    });
    
    ws.on('close', () => {
      this.handleDisconnection(clientId);
    });
    
    ws.on('error', (error: Error) => {
      console.error(`WebSocket error for ${clientId}:`, error);
      this.emit('client:error', { clientId, error });
    });
  }

  /**
   * Handle incoming message
   */
  private handleMessage(clientId: string, ws: any, data: string): void {
    try {
      const message = JSON.parse(data);
      
      // Handle different message types
      switch (message.type) {
        case 'event':
          if (message.data.eventType === 'handshake') {
            this.handleHandshake(clientId, ws, message.data.eventData);
          } else {
            this.broadcastEvent(message, clientId);
          }
          break;
          
        case 'state_update':
          this.handleStateUpdate(message);
          this.broadcastToOthers(message, clientId);
          break;
          
        case 'metric_update':
          this.handleMetricUpdate(message);
          this.broadcastToOthers(message, clientId);
          break;
          
        case 'heartbeat':
          this.handleHeartbeat(clientId, message);
          break;
      }
      
      this.emit('message:received', { clientId, message });
      
    } catch (error) {
      console.error('Failed to handle message:', error);
      this.emit('message:error', { clientId, error });
    }
  }

  /**
   * Handle handshake
   */
  private handleHandshake(clientId: string, ws: any, data: any): void {
    const client: SyncClient = {
      id: clientId,
      platform: data.platform,
      version: data.version,
      capabilities: data.capabilities || [],
      lastHeartbeat: new Date(),
      ws,
    };
    
    this.clients.set(clientId, client);
    
    console.log(`Client ${clientId} registered: ${data.platform} v${data.version}`);
    
    // Send current shared state to new client
    this.sendSharedState(client);
    
    this.emit('client:connected', client);
  }

  /**
   * Handle state update
   */
  private handleStateUpdate(message: any): void {
    Object.entries(message.data).forEach(([key, value]) => {
      this.sharedState.set(`${message.source}:${key}`, value);
    });
    
    this.emit('state:updated', message.data);
  }

  /**
   * Handle metric update
   */
  private handleMetricUpdate(message: any): void {
    Object.entries(message.data).forEach(([key, value]) => {
      this.sharedState.set(`${message.source}:${key}`, value);
    });
    
    this.emit('metric:updated', message.data);
  }

  /**
   * Handle heartbeat
   */
  private handleHeartbeat(clientId: string, message: any): void {
    const client = this.clients.get(clientId);
    if (client) {
      client.lastHeartbeat = new Date();
    }
  }

  /**
   * Handle disconnection
   */
  private handleDisconnection(clientId: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      console.log(`Client disconnected: ${clientId} (${client.platform})`);
      this.clients.delete(clientId);
      this.emit('client:disconnected', client);
    }
  }

  /**
   * Broadcast message to all clients except sender
   */
  private broadcastToOthers(message: any, excludeClientId: string): void {
    this.clients.forEach((client, clientId) => {
      if (clientId !== excludeClientId) {
        try {
          client.ws.send(JSON.stringify(message));
        } catch (error) {
          console.error(`Failed to send to ${clientId}:`, error);
        }
      }
    });
  }

  /**
   * Broadcast event to all clients
   */
  private broadcastEvent(message: any, fromClientId: string): void {
    this.broadcastToOthers(message, fromClientId);
    this.emit('event:broadcast', message);
  }

  /**
   * Send shared state to client
   */
  private sendSharedState(client: SyncClient): void {
    const stateData: Record<string, any> = {};
    
    this.sharedState.forEach((value, key) => {
      // Don't send client's own state back
      if (!key.startsWith(`${client.platform.toLowerCase()}:`)) {
        stateData[key] = value;
      }
    });
    
    try {
      client.ws.send(JSON.stringify({
        id: this.generateId(),
        timestamp: new Date(),
        source: 'server',
        type: 'state_update',
        data: stateData,
      }));
    } catch (error) {
      console.error('Failed to send shared state:', error);
    }
  }

  /**
   * Start heartbeat check
   */
  private startHeartbeatCheck(): void {
    this.heartbeatCheckInterval = setInterval(() => {
      const now = Date.now();
      
      this.clients.forEach((client, clientId) => {
        const timeSinceHeartbeat = now - client.lastHeartbeat.getTime();
        
        if (timeSinceHeartbeat > this.HEARTBEAT_TIMEOUT) {
          console.log(`Client ${clientId} timed out, removing`);
          client.ws.close();
          this.clients.delete(clientId);
          this.emit('client:timeout', client);
        }
      });
    }, 30000); // Check every 30 seconds
  }

  /**
   * Stop heartbeat check
   */
  private stopHeartbeatCheck(): void {
    if (this.heartbeatCheckInterval) {
      clearInterval(this.heartbeatCheckInterval);
      this.heartbeatCheckInterval = undefined;
    }
  }

  /**
   * Generate ID
   */
  private generateId(): string {
    return `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get server statistics
   */
  getStatistics() {
    return {
      connectedClients: this.clients.size,
      sharedStateSize: this.sharedState.size,
      clients: Array.from(this.clients.values()).map(c => ({
        id: c.id,
        platform: c.platform,
        version: c.version,
        capabilities: c.capabilities,
        lastHeartbeat: c.lastHeartbeat,
      })),
    };
  }
}

/**
 * Singleton instance
 */
export const consciousnessSyncServer = new ConsciousnessSyncServer();
