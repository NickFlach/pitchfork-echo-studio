import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

const config = require('../config.js');

// Types for authentication
export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    walletAddress: string;
    verificationLevel: 'none' | 'basic' | 'verified';
    sessionId: string;
    issuedAt: number;
    expiresAt: number;
  };
}

export interface SecurityContext {
  userId: string;
  sessionId: string;
  walletAddress: string;
  verificationLevel: 'none' | 'basic' | 'verified';
  requestTimestamp: number;
  ipAddress: string;
  userAgent: string;
}

// JWT payload schema
const jwtPayloadSchema = z.object({
  userId: z.string(),
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address'),
  verificationLevel: z.enum(['none', 'basic', 'verified']),
  sessionId: z.string(),
  iat: z.number(),
  exp: z.number()
});

/**
 * Authentication middleware for session validation
 * Validates JWT tokens and extracts user context
 */
export function authenticateUser(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ 
        error: 'Authentication required',
        message: 'Missing or invalid authorization header'
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify JWT token
    const decoded = jwt.verify(token, config.jwtSecret) as any;
    
    // Validate payload structure
    const validatedPayload = jwtPayloadSchema.parse(decoded);

    // Check token expiration
    const now = Math.floor(Date.now() / 1000);
    if (validatedPayload.exp < now) {
      res.status(401).json({ 
        error: 'Token expired',
        message: 'Please refresh your authentication token'
      });
      return;
    }

    // Attach user context to request
    req.user = {
      id: validatedPayload.userId,
      walletAddress: validatedPayload.walletAddress,
      verificationLevel: validatedPayload.verificationLevel,
      sessionId: validatedPayload.sessionId,
      issuedAt: validatedPayload.iat,
      expiresAt: validatedPayload.exp
    };

    next();
  } catch (error) {
    console.error('Authentication failed:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ 
        error: 'Invalid token',
        message: 'Authentication token is malformed or invalid'
      });
      return;
    }
    
    if (error instanceof z.ZodError) {
      res.status(401).json({ 
        error: 'Invalid token payload',
        message: 'Token contains invalid user data'
      });
      return;
    }

    res.status(500).json({ 
      error: 'Authentication error',
      message: 'Internal authentication system error'
    });
  }
}

/**
 * Middleware to require specific verification levels for AI endpoints
 */
export function requireVerificationLevel(minLevel: 'basic' | 'verified') {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ 
        error: 'Authentication required',
        message: 'User context not found'
      });
      return;
    }

    const levelHierarchy = { 'none': 0, 'basic': 1, 'verified': 2 };
    const userLevel = levelHierarchy[req.user.verificationLevel];
    const requiredLevel = levelHierarchy[minLevel];

    if (userLevel < requiredLevel) {
      res.status(403).json({ 
        error: 'Insufficient verification level',
        message: `This AI endpoint requires '${minLevel}' verification level. Current level: '${req.user.verificationLevel}'`,
        requiredLevel: minLevel,
        currentLevel: req.user.verificationLevel
      });
      return;
    }

    next();
  };
}

/**
 * Extract security context from authenticated request
 */
export function extractSecurityContext(req: AuthenticatedRequest): SecurityContext {
  if (!req.user) {
    throw new Error('User context not found - ensure authentication middleware is applied');
  }

  return {
    userId: req.user.id,
    sessionId: req.user.sessionId,
    walletAddress: req.user.walletAddress,
    verificationLevel: req.user.verificationLevel,
    requestTimestamp: Date.now(),
    ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
    userAgent: req.headers['user-agent'] || 'unknown'
  };
}

/**
 * Middleware specifically for AI-triggering routes
 * Enforces authentication and verification for expensive AI operations
 */
export function protectAIEndpoint(minVerificationLevel: 'basic' | 'verified' = 'basic') {
  return [
    authenticateUser,
    requireVerificationLevel(minVerificationLevel)
  ];
}

/**
 * Generate authentication token for testing purposes
 * WARNING: Only use in development/testing environments
 */
export function generateTestToken(userPayload: {
  userId: string;
  walletAddress: string;
  verificationLevel: 'none' | 'basic' | 'verified';
  sessionId?: string;
}): string {
  if (config.nodeEnv === 'production') {
    throw new Error('Test token generation is not allowed in production');
  }

  const payload = {
    ...userPayload,
    sessionId: userPayload.sessionId || `test-session-${Date.now()}`,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
  };

  return jwt.sign(payload, config.jwtSecret);
}

/**
 * Middleware to log authentication events for security monitoring
 */
export function logAuthenticationEvent(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (req.user) {
    console.log('AUTH_EVENT:', {
      timestamp: new Date().toISOString(),
      userId: req.user.id,
      sessionId: req.user.sessionId,
      verificationLevel: req.user.verificationLevel,
      endpoint: req.path,
      method: req.method,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
  }
  
  next();
}