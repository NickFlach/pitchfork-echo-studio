import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from './auth';

/**
 * Input validation and sanitization middleware for AI endpoints
 */

// Common sanitization functions
export function sanitizeString(input: string, maxLength: number = 5000): string {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .substring(0, maxLength)
    .replace(/[<>'"&]/g, '') // Remove potentially dangerous characters
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
}

export function sanitizeObject(obj: any, maxDepth: number = 5): any {
  if (maxDepth <= 0) return {};
  if (obj === null || typeof obj !== 'object') return {};
  
  const sanitized: any = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof key !== 'string' || key.length > 100) continue;
    
    const sanitizedKey = sanitizeString(key, 100);
    if (!sanitizedKey) continue;
    
    if (typeof value === 'string') {
      sanitized[sanitizedKey] = sanitizeString(value);
    } else if (typeof value === 'number' && isFinite(value)) {
      sanitized[sanitizedKey] = value;
    } else if (typeof value === 'boolean') {
      sanitized[sanitizedKey] = value;
    } else if (Array.isArray(value)) {
      sanitized[sanitizedKey] = value
        .slice(0, 50) // Limit array size
        .map(item => typeof item === 'string' ? sanitizeString(item) : item)
        .filter(item => item !== undefined && item !== null);
    } else if (typeof value === 'object') {
      sanitized[sanitizedKey] = sanitizeObject(value, maxDepth - 1);
    }
  }
  
  return sanitized;
}

/**
 * Validate and sanitize consciousness-related request bodies
 */
export function validateConsciousnessRequest(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  try {
    if (!req.body || typeof req.body !== 'object') {
      res.status(400).json({ 
        error: 'Request body is required and must be a valid JSON object'
      });
      return;
    }

    // Sanitize the entire request body
    req.body = sanitizeObject(req.body);
    
    // Validate common fields
    if (req.body.agentId && typeof req.body.agentId === 'string') {
      req.body.agentId = sanitizeString(req.body.agentId, 100);
      
      // Security: Ensure users can only access their own agent data (unless verified)
      if (req.body.agentId !== req.user.id && req.user.verificationLevel !== 'verified') {
        res.status(403).json({ 
          error: 'Access denied: Cannot access data for other agents'
        });
        return;
      }
    }
    
    // Validate and limit recursion depths
    if (req.body.maxDepth && typeof req.body.maxDepth === 'number') {
      req.body.maxDepth = Math.min(Math.max(1, req.body.maxDepth), 5);
    }
    
    // Validate analysis types
    const validAnalysisTypes = [
      'self-reflection', 
      'meta-cognitive', 
      'quality-assessment', 
      'process-optimization',
      'emotional',
      'logical',
      'intuitive',
      'strategic'
    ];
    
    if (req.body.analysisType && !validAnalysisTypes.includes(req.body.analysisType)) {
      res.status(400).json({ 
        error: 'Invalid analysisType',
        validTypes: validAnalysisTypes
      });
      return;
    }
    
    next();
  } catch (error) {
    console.error('Request validation error:', error);
    res.status(400).json({ 
      error: 'Request validation failed',
      message: 'Invalid request format or content'
    });
  }
}

/**
 * Validate specific to recursive insight analysis
 */
export function validateRecursiveInsightRequest(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  try {
    const schema = z.object({
      subjectData: z.object({
        dataType: z.enum(['reflection-log', 'decision-record', 'pattern-analysis', 'consciousness-state']),
        subjectId: z.string().max(100),
        originalContent: z.string().max(10000)
      }),
      analysisType: z.enum(['self-reflection', 'meta-cognitive', 'quality-assessment', 'process-optimization']),
      maxDepth: z.number().min(1).max(5).optional(),
      parentAnalysisId: z.string().max(100).optional()
    });
    
    const validatedData = schema.parse(req.body);
    req.body = validatedData;
    
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Invalid recursive insight analysis request',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    } else {
      res.status(400).json({ error: 'Request validation failed' });
    }
  }
}

/**
 * Validate multidimensional reflection requests
 */
export function validateMultidimensionalReflectionRequest(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  try {
    const schema = z.object({
      originalReflectionId: z.string().max(100),
      agentId: z.string().max(100),
      options: z.object({
        focusDimensions: z.array(z.enum(['emotional', 'logical', 'intuitive', 'strategic'])).optional(),
        includeTemporalAnalysis: z.boolean().optional(),
        includeCollaborativeElements: z.boolean().optional(),
        contextDepth: z.enum(['shallow', 'moderate', 'deep']).optional()
      }).optional()
    });
    
    const validatedData = schema.parse(req.body);
    req.body = validatedData;
    
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Invalid multidimensional reflection request',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    } else {
      res.status(400).json({ error: 'Request validation failed' });
    }
  }
}

/**
 * Validate consciousness state prediction requests
 */
export function validateStatePredictionRequest(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  try {
    const schema = z.object({
      predictionContext: z.object({
        situationType: z.string().max(100),
        complexity: z.enum(['low', 'medium', 'high']),
        urgency: z.enum(['low', 'medium', 'high']),
        stakeholders: z.array(z.string().max(100)).max(20),
        constraints: z.array(z.string().max(500)).max(10)
      }),
      agentId: z.string().max(100),
      options: z.object({
        predictionHorizon: z.enum(['immediate', 'short-term', 'medium-term', 'long-term']).optional(),
        includeRhythmAnalysis: z.boolean().optional(),
        includeOptimizationSuggestions: z.boolean().optional()
      }).optional()
    });
    
    const validatedData = schema.parse(req.body);
    req.body = validatedData;
    
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Invalid state prediction request',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    } else {
      res.status(400).json({ error: 'Request validation failed' });
    }
  }
}

/**
 * Security headers middleware
 */
export function addSecurityHeaders(req: Request, res: Response, next: NextFunction): void {
  // Add security headers
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'",
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  });
  
  next();
}

/**
 * Rate limit error handler
 */
export function handleRateLimitError(error: any, req: Request, res: Response, next: NextFunction): void {
  if (error && error.status === 429) {
    res.status(429).json({
      error: 'Rate limit exceeded',
      message: 'Too many requests. Please try again later.',
      retryAfter: error.retryAfter || 60
    });
    return;
  }
  
  next(error);
}