import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest, SecurityContext, extractSecurityContext } from './auth';

// Rate limiting data structures
interface RateLimitData {
  requests: number;
  resetTime: number;
  aiCallsCost: number;
  aiCallsCount: number;
  lastRequestTime: number;
}

interface UserQuota {
  hourlyRequests: number;
  dailyRequests: number;
  hourlyAICalls: number;
  dailyAICalls: number;
  hourlyCostLimit: number; // in cents
  dailyCostLimit: number; // in cents
}

// In-memory rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, RateLimitData>();
const ipRateLimitStore = new Map<string, RateLimitData>();
const circuitBreakerStore = new Map<string, { isOpen: boolean; openedAt: number; failureCount: number }>();

// Default quotas by verification level
const DEFAULT_QUOTAS: Record<string, UserQuota> = {
  'none': {
    hourlyRequests: 10,
    dailyRequests: 50,
    hourlyAICalls: 5,
    dailyAICalls: 20,
    hourlyCostLimit: 100, // $1.00
    dailyCostLimit: 500   // $5.00
  },
  'basic': {
    hourlyRequests: 50,
    dailyRequests: 200,
    hourlyAICalls: 25,
    dailyAICalls: 100,
    hourlyCostLimit: 500, // $5.00
    dailyCostLimit: 2000  // $20.00
  },
  'verified': {
    hourlyRequests: 200,
    dailyRequests: 1000,
    hourlyAICalls: 100,
    dailyAICalls: 500,
    hourlyCostLimit: 2000, // $20.00
    dailyCostLimit: 10000  // $100.00
  }
};

/**
 * Get or create rate limit data for a user
 */
function getRateLimitData(userId: string): RateLimitData {
  const now = Date.now();
  const existing = rateLimitStore.get(userId);
  
  if (!existing) {
    const newData: RateLimitData = {
      requests: 0,
      resetTime: now + (60 * 60 * 1000), // 1 hour
      aiCallsCost: 0,
      aiCallsCount: 0,
      lastRequestTime: now
    };
    rateLimitStore.set(userId, newData);
    return newData;
  }
  
  // Reset if past reset time
  if (now >= existing.resetTime) {
    existing.requests = 0;
    existing.aiCallsCost = 0;
    existing.aiCallsCount = 0;
    existing.resetTime = now + (60 * 60 * 1000);
  }
  
  return existing;
}

/**
 * Get IP address from request
 */
function getClientIP(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded && typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.connection.remoteAddress || 'unknown';
}

/**
 * Get or create IP-based rate limit data
 */
function getIPRateLimitData(ipAddress: string): RateLimitData {
  const now = Date.now();
  const existing = ipRateLimitStore.get(ipAddress);
  
  if (!existing) {
    const newData: RateLimitData = {
      requests: 0,
      resetTime: now + (60 * 60 * 1000), // 1 hour
      aiCallsCost: 0,
      aiCallsCount: 0,
      lastRequestTime: now
    };
    ipRateLimitStore.set(ipAddress, newData);
    return newData;
  }
  
  // Reset if past reset time
  if (now >= existing.resetTime) {
    existing.requests = 0;
    existing.aiCallsCost = 0;
    existing.aiCallsCount = 0;
    existing.resetTime = now + (60 * 60 * 1000);
  }
  
  return existing;
}

/**
 * IP-based rate limiting for unauthenticated requests (DoS protection)
 */
export function rateLimitByIP(req: Request, res: Response, next: NextFunction): void {
  try {
    const clientIP = getClientIP(req);
    const rateLimitData = getIPRateLimitData(clientIP);
    
    // Aggressive limits for unauthenticated requests to prevent DoS
    const IP_RATE_LIMIT = {
      hourlyRequests: 100, // Lower limit for unauthenticated
      hourlyAICalls: 5,    // Very low AI access
      hourlyCostLimit: 50  // $0.50 max
    };
    
    // Check request rate limit
    if (rateLimitData.requests >= IP_RATE_LIMIT.hourlyRequests) {
      const resetIn = Math.ceil((rateLimitData.resetTime - Date.now()) / 1000);
      res.status(429).json({
        error: 'IP rate limit exceeded',
        message: `Too many requests from this IP. Limit: ${IP_RATE_LIMIT.hourlyRequests} per hour`,
        retryAfter: resetIn,
        type: 'ip_rate_limit'
      });
      return;
    }

    // Update request count
    rateLimitData.requests++;
    rateLimitData.lastRequestTime = Date.now();
    
    // Add rate limit headers
    res.set({
      'X-IP-RateLimit-Limit': IP_RATE_LIMIT.hourlyRequests.toString(),
      'X-IP-RateLimit-Remaining': (IP_RATE_LIMIT.hourlyRequests - rateLimitData.requests).toString(),
      'X-IP-RateLimit-Reset': rateLimitData.resetTime.toString()
    });

    next();
  } catch (error) {
    console.error('IP rate limiting error:', error);
    res.status(500).json({ error: 'IP rate limiting system error' });
  }
}

/**
 * Dual-mode rate limiting: IP-based for unauthenticated, user-based for authenticated
 */
export function rateLimitGeneral(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  try {
    // For unauthenticated requests, use IP-based rate limiting
    if (!req.user) {
      return rateLimitByIP(req, res, next);
    }

    // For authenticated requests, use user-based rate limiting
    const quota = DEFAULT_QUOTAS[req.user.verificationLevel];
    const rateLimitData = getRateLimitData(req.user.id);
    
    // Check request rate limit
    if (rateLimitData.requests >= quota.hourlyRequests) {
      const resetIn = Math.ceil((rateLimitData.resetTime - Date.now()) / 1000);
      res.status(429).json({
        error: 'Rate limit exceeded',
        message: `Too many requests. Limit: ${quota.hourlyRequests} per hour`,
        retryAfter: resetIn,
        quota: {
          limit: quota.hourlyRequests,
          remaining: 0,
          resetTime: rateLimitData.resetTime
        }
      });
      return;
    }

    // Update request count
    rateLimitData.requests++;
    rateLimitData.lastRequestTime = Date.now();
    
    // Add rate limit headers
    res.set({
      'X-RateLimit-Limit': quota.hourlyRequests.toString(),
      'X-RateLimit-Remaining': (quota.hourlyRequests - rateLimitData.requests).toString(),
      'X-RateLimit-Reset': rateLimitData.resetTime.toString()
    });

    next();
  } catch (error) {
    console.error('Rate limiting error:', error);
    res.status(500).json({ error: 'Rate limiting system error' });
  }
}

/**
 * Advanced rate limiting for AI endpoints with cost tracking
 */
export function rateLimitAI(estimatedCostCents: number = 50) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required for AI rate limiting' });
        return;
      }

      const quota = DEFAULT_QUOTAS[req.user.verificationLevel];
      const rateLimitData = getRateLimitData(req.user.id);
      
      // Check AI call count limit
      if (rateLimitData.aiCallsCount >= quota.hourlyAICalls) {
        const resetIn = Math.ceil((rateLimitData.resetTime - Date.now()) / 1000);
        res.status(429).json({
          error: 'AI call limit exceeded',
          message: `Too many AI calls. Limit: ${quota.hourlyAICalls} per hour`,
          retryAfter: resetIn,
          quota: {
            aiCallLimit: quota.hourlyAICalls,
            aiCallsRemaining: 0,
            resetTime: rateLimitData.resetTime
          }
        });
        return;
      }

      // Check cost limit
      if (rateLimitData.aiCallsCost + estimatedCostCents > quota.hourlyCostLimit) {
        const resetIn = Math.ceil((rateLimitData.resetTime - Date.now()) / 1000);
        res.status(429).json({
          error: 'AI cost limit exceeded',
          message: `AI usage cost limit reached. Limit: $${(quota.hourlyCostLimit / 100).toFixed(2)} per hour`,
          retryAfter: resetIn,
          quota: {
            costLimit: quota.hourlyCostLimit,
            costUsed: rateLimitData.aiCallsCost,
            costRemaining: quota.hourlyCostLimit - rateLimitData.aiCallsCost,
            resetTime: rateLimitData.resetTime
          }
        });
        return;
      }

      // Update AI call count only - trackAIUsage will handle actual cost recording
      rateLimitData.aiCallsCount++;
      
      // Add AI-specific rate limit headers
      res.set({
        'X-AI-RateLimit-Calls': quota.hourlyAICalls.toString(),
        'X-AI-RateLimit-Calls-Remaining': (quota.hourlyAICalls - rateLimitData.aiCallsCount).toString(),
        'X-AI-RateLimit-Cost': quota.hourlyCostLimit.toString(),
        'X-AI-RateLimit-Cost-Remaining': (quota.hourlyCostLimit - rateLimitData.aiCallsCost).toString(),
        'X-AI-RateLimit-Reset': rateLimitData.resetTime.toString()
      });

      next();
    } catch (error) {
      console.error('AI rate limiting error:', error);
      res.status(500).json({ error: 'AI rate limiting system error' });
    }
  };
}

/**
 * Circuit breaker middleware for expensive AI operations
 */
export function circuitBreaker(operationName: string, failureThreshold: number = 5, timeoutMinutes: number = 5) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required for circuit breaker' });
        return;
      }

      const circuitKey = `${req.user.id}:${operationName}`;
      const circuit = circuitBreakerStore.get(circuitKey);
      const now = Date.now();

      if (circuit && circuit.isOpen) {
        const timeoutMs = timeoutMinutes * 60 * 1000;
        if (now - circuit.openedAt < timeoutMs) {
          res.status(503).json({
            error: 'Circuit breaker open',
            message: `Operation '${operationName}' temporarily disabled due to repeated failures`,
            retryAfter: Math.ceil((circuit.openedAt + timeoutMs - now) / 1000)
          });
          return;
        } else {
          // Reset circuit breaker after timeout
          circuit.isOpen = false;
          circuit.failureCount = 0;
        }
      }

      // Track failures in response
      const originalSend = res.send;
      res.send = function(body: any) {
        if (res.statusCode >= 500) {
          const current = circuitBreakerStore.get(circuitKey) || { isOpen: false, openedAt: 0, failureCount: 0 };
          current.failureCount++;
          
          if (current.failureCount >= failureThreshold) {
            current.isOpen = true;
            current.openedAt = now;
            console.warn(`Circuit breaker opened for ${circuitKey} after ${current.failureCount} failures`);
          }
          
          circuitBreakerStore.set(circuitKey, current);
        } else if (res.statusCode < 400) {
          // Success - reset failure count
          const current = circuitBreakerStore.get(circuitKey);
          if (current) {
            current.failureCount = 0;
            circuitBreakerStore.set(circuitKey, current);
          }
        }
        
        return originalSend.call(this, body);
      };

      next();
    } catch (error) {
      console.error('Circuit breaker error:', error);
      res.status(500).json({ error: 'Circuit breaker system error' });
    }
  };
}

/**
 * Track actual AI usage costs for post-request accounting
 */
export function trackAIUsage(actualCostCents: number, req: AuthenticatedRequest): void {
  if (!req.user) return;
  
  try {
    const rateLimitData = getRateLimitData(req.user.id);
    
    // Update actual cost tracking - accumulate costs instead of taking maximum
    rateLimitData.aiCallsCost += actualCostCents;
    
    // Log usage for monitoring
    console.log('AI_USAGE_TRACKING:', {
      timestamp: new Date().toISOString(),
      userId: req.user.id,
      sessionId: req.user.sessionId,
      actualCostCents,
      totalCostCents: rateLimitData.aiCallsCost,
      aiCallsCount: rateLimitData.aiCallsCount,
      endpoint: req.path
    });
  } catch (error) {
    console.error('AI usage tracking error:', error);
  }
}

/**
 * Get rate limit status for a user
 */
export function getRateLimitStatus(userId: string): {
  quota: UserQuota;
  usage: RateLimitData;
  remaining: {
    requests: number;
    aiCalls: number;
    cost: number;
  };
} {
  const user = rateLimitStore.get(userId);
  const quota = DEFAULT_QUOTAS['basic']; // Default fallback
  
  if (!user) {
    return {
      quota,
      usage: {
        requests: 0,
        resetTime: Date.now() + (60 * 60 * 1000),
        aiCallsCost: 0,
        aiCallsCount: 0,
        lastRequestTime: 0
      },
      remaining: {
        requests: quota.hourlyRequests,
        aiCalls: quota.hourlyAICalls,
        cost: quota.hourlyCostLimit
      }
    };
  }
  
  return {
    quota,
    usage: user,
    remaining: {
      requests: Math.max(0, quota.hourlyRequests - user.requests),
      aiCalls: Math.max(0, quota.hourlyAICalls - user.aiCallsCount),
      cost: Math.max(0, quota.hourlyCostLimit - user.aiCallsCost)
    }
  };
}