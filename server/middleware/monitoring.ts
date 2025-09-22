import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest, SecurityContext, extractSecurityContext } from './auth';
import fs from 'fs/promises';
import path from 'path';

// Monitoring and logging types
interface AIUsageLog {
  timestamp: string;
  userId: string;
  sessionId: string;
  endpoint: string;
  method: string;
  provider: string;
  model: string;
  tokenUsage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  costCents: number;
  duration: number;
  success: boolean;
  errorType?: string;
  securityContext: SecurityContext;
}

interface SecurityAlert {
  timestamp: string;
  alertType: 'rate_limit_exceeded' | 'unusual_usage_pattern' | 'unauthorized_access' | 'cost_threshold_exceeded' | 'multiple_failures';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  sessionId?: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
}

interface UsagePattern {
  userId: string;
  requestCount: number;
  aiCallCount: number;
  totalCost: number;
  timeWindow: string;
  distinctEndpoints: Set<string>;
  lastSeen: number;
  flagged: boolean;
}

// In-memory storage for monitoring (in production, use persistent storage)
const usagePatterns = new Map<string, UsagePattern>();
const recentAlerts = new Map<string, SecurityAlert[]>();
const logBuffer: AIUsageLog[] = [];

// Configuration
const MONITORING_CONFIG = {
  SUSPICIOUS_REQUEST_RATE: 100, // requests per minute
  SUSPICIOUS_AI_CALL_RATE: 20,  // AI calls per minute
  COST_ALERT_THRESHOLD: 1000,   // cents per hour
  LOG_FLUSH_INTERVAL: 5000,     // ms
  ALERT_COOLDOWN: 300000,       // 5 minutes
  MAX_LOG_BUFFER_SIZE: 1000
};

/**
 * Initialize monitoring system
 */
export function initializeMonitoring(): void {
  // Ensure logs directory exists
  ensureLogsDirectory();
  
  // Start log flushing interval
  setInterval(flushLogs, MONITORING_CONFIG.LOG_FLUSH_INTERVAL);
  
  // Start pattern analysis interval
  setInterval(analyzeUsagePatterns, 60000); // Every minute
  
  console.log('AI Security Monitoring System initialized');
}

/**
 * Ensure logs directory exists
 */
async function ensureLogsDirectory(): Promise<void> {
  try {
    await fs.mkdir(path.join(process.cwd(), 'logs'), { recursive: true });
  } catch (error) {
    console.error('Failed to create logs directory:', error);
  }
}

/**
 * Middleware to log AI usage comprehensively
 */
export function logAIUsage(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    next();
    return;
  }

  const startTime = Date.now();
  const securityContext = extractSecurityContext(req);
  
  // Capture response data
  const originalSend = res.send;
  let responseData: any = null;
  
  res.send = function(body: any) {
    responseData = body;
    return originalSend.call(this, body);
  };

  // Log after response
  res.on('finish', () => {
    try {
      const duration = Date.now() - startTime;
      const success = res.statusCode < 400;
      
      // Extract AI usage from response if available
      let aiUsage: Partial<AIUsageLog> = {};
      if (responseData && typeof responseData === 'object') {
        const parsed = typeof responseData === 'string' ? JSON.parse(responseData) : responseData;
        
        if (parsed.analyticsData || parsed.aiConsciousnessAnalysis?.metadata) {
          const metadata = parsed.analyticsData || parsed.aiConsciousnessAnalysis?.metadata;
          aiUsage = {
            provider: metadata.provider || 'unknown',
            model: metadata.model || 'unknown',
            tokenUsage: metadata.usage || { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
            costCents: metadata.costCents || 0
          };
        }
      }

      const logEntry: AIUsageLog = {
        timestamp: new Date().toISOString(),
        userId: req.user.id,
        sessionId: req.user.sessionId,
        endpoint: req.path,
        method: req.method,
        provider: aiUsage.provider || 'unknown',
        model: aiUsage.model || 'unknown',
        tokenUsage: aiUsage.tokenUsage || { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
        costCents: aiUsage.costCents || 0,
        duration,
        success,
        errorType: success ? undefined : `HTTP_${res.statusCode}`,
        securityContext
      };

      // Add to buffer
      logBuffer.push(logEntry);
      
      // Update usage patterns
      updateUsagePattern(logEntry);
      
      // Check for suspicious patterns
      checkForSuspiciousActivity(logEntry);
      
      // Trim buffer if too large
      if (logBuffer.length > MONITORING_CONFIG.MAX_LOG_BUFFER_SIZE) {
        logBuffer.splice(0, logBuffer.length - MONITORING_CONFIG.MAX_LOG_BUFFER_SIZE);
      }
      
    } catch (error) {
      console.error('AI usage logging error:', error);
    }
  });

  next();
}

/**
 * Update usage patterns for anomaly detection
 */
function updateUsagePattern(logEntry: AIUsageLog): void {
  const patternKey = logEntry.userId;
  const now = Date.now();
  
  let pattern = usagePatterns.get(patternKey);
  if (!pattern) {
    pattern = {
      userId: logEntry.userId,
      requestCount: 0,
      aiCallCount: 0,
      totalCost: 0,
      timeWindow: new Date().toISOString().substring(0, 13), // Hour window
      distinctEndpoints: new Set(),
      lastSeen: now,
      flagged: false
    };
    usagePatterns.set(patternKey, pattern);
  }

  // Reset if new time window
  const currentWindow = new Date().toISOString().substring(0, 13);
  if (pattern.timeWindow !== currentWindow) {
    pattern.requestCount = 0;
    pattern.aiCallCount = 0;
    pattern.totalCost = 0;
    pattern.timeWindow = currentWindow;
    pattern.distinctEndpoints.clear();
    pattern.flagged = false;
  }

  // Update pattern
  pattern.requestCount++;
  if (logEntry.provider !== 'unknown') {
    pattern.aiCallCount++;
  }
  pattern.totalCost += logEntry.costCents;
  pattern.distinctEndpoints.add(logEntry.endpoint);
  pattern.lastSeen = now;
}

/**
 * Check for suspicious activity patterns
 */
function checkForSuspiciousActivity(logEntry: AIUsageLog): void {
  const pattern = usagePatterns.get(logEntry.userId);
  if (!pattern) return;

  const alerts: SecurityAlert[] = [];

  // Check rate limits
  if (pattern.requestCount > MONITORING_CONFIG.SUSPICIOUS_REQUEST_RATE) {
    alerts.push({
      timestamp: new Date().toISOString(),
      alertType: 'unusual_usage_pattern',
      severity: 'medium',
      userId: logEntry.userId,
      sessionId: logEntry.sessionId,
      details: {
        requestCount: pattern.requestCount,
        threshold: MONITORING_CONFIG.SUSPICIOUS_REQUEST_RATE,
        timeWindow: pattern.timeWindow
      },
      ipAddress: logEntry.securityContext.ipAddress,
      userAgent: logEntry.securityContext.userAgent
    });
  }

  // Check AI call rate
  if (pattern.aiCallCount > MONITORING_CONFIG.SUSPICIOUS_AI_CALL_RATE) {
    alerts.push({
      timestamp: new Date().toISOString(),
      alertType: 'unusual_usage_pattern',
      severity: 'high',
      userId: logEntry.userId,
      sessionId: logEntry.sessionId,
      details: {
        aiCallCount: pattern.aiCallCount,
        threshold: MONITORING_CONFIG.SUSPICIOUS_AI_CALL_RATE,
        timeWindow: pattern.timeWindow
      },
      ipAddress: logEntry.securityContext.ipAddress,
      userAgent: logEntry.securityContext.userAgent
    });
  }

  // Check cost threshold
  if (pattern.totalCost > MONITORING_CONFIG.COST_ALERT_THRESHOLD) {
    alerts.push({
      timestamp: new Date().toISOString(),
      alertType: 'cost_threshold_exceeded',
      severity: 'high',
      userId: logEntry.userId,
      sessionId: logEntry.sessionId,
      details: {
        totalCost: pattern.totalCost,
        threshold: MONITORING_CONFIG.COST_ALERT_THRESHOLD,
        timeWindow: pattern.timeWindow
      },
      ipAddress: logEntry.securityContext.ipAddress,
      userAgent: logEntry.securityContext.userAgent
    });
  }

  // Process alerts
  for (const alert of alerts) {
    processSecurityAlert(alert);
  }
}

/**
 * Process and store security alerts
 */
function processSecurityAlert(alert: SecurityAlert): void {
  const alertKey = `${alert.userId || 'unknown'}:${alert.alertType}`;
  const existing = recentAlerts.get(alertKey) || [];
  
  // Check cooldown
  const now = Date.now();
  const lastAlert = existing[existing.length - 1];
  if (lastAlert && (now - new Date(lastAlert.timestamp).getTime()) < MONITORING_CONFIG.ALERT_COOLDOWN) {
    return; // Skip duplicate alert within cooldown
  }

  // Add alert
  existing.push(alert);
  if (existing.length > 10) {
    existing.shift(); // Keep only recent alerts
  }
  recentAlerts.set(alertKey, existing);

  // Log alert
  console.warn('SECURITY_ALERT:', alert);

  // In production, send to monitoring system
  if (alert.severity === 'critical' || alert.severity === 'high') {
    // Send immediate notification
    console.error('HIGH_SEVERITY_SECURITY_ALERT:', alert);
  }
}

/**
 * Analyze usage patterns for anomalies
 */
function analyzeUsagePatterns(): void {
  const now = Date.now();
  const patterns = Array.from(usagePatterns.values());

  for (const pattern of patterns) {
    // Clean up old patterns
    if (now - pattern.lastSeen > 24 * 60 * 60 * 1000) { // 24 hours
      usagePatterns.delete(pattern.userId);
      continue;
    }

    // Look for anomalous patterns
    if (!pattern.flagged && pattern.distinctEndpoints.size > 10 && pattern.aiCallCount > 50) {
      processSecurityAlert({
        timestamp: new Date().toISOString(),
        alertType: 'unusual_usage_pattern',
        severity: 'medium',
        userId: pattern.userId,
        details: {
          distinctEndpoints: pattern.distinctEndpoints.size,
          aiCallCount: pattern.aiCallCount,
          analysis: 'High endpoint diversity with high AI usage'
        },
        ipAddress: 'unknown',
        userAgent: 'unknown'
      });
      pattern.flagged = true;
    }
  }
}

/**
 * Flush logs to persistent storage
 */
async function flushLogs(): Promise<void> {
  if (logBuffer.length === 0) return;

  try {
    const logsToFlush = [...logBuffer];
    logBuffer.length = 0; // Clear buffer

    const logFile = path.join(process.cwd(), 'logs', `ai-usage-${new Date().toISOString().substring(0, 10)}.jsonl`);
    const logLines = logsToFlush.map(log => JSON.stringify(log)).join('\n') + '\n';
    
    await fs.appendFile(logFile, logLines);
    
    // Also flush alerts
    const alertFile = path.join(process.cwd(), 'logs', `security-alerts-${new Date().toISOString().substring(0, 10)}.jsonl`);
    const allAlerts = Array.from(recentAlerts.values()).flat();
    if (allAlerts.length > 0) {
      const alertLines = allAlerts.map(alert => JSON.stringify(alert)).join('\n') + '\n';
      await fs.appendFile(alertFile, alertLines);
    }
    
  } catch (error) {
    console.error('Log flushing error:', error);
  }
}

/**
 * Get monitoring dashboard data
 */
export function getMonitoringStats(): {
  activeUsers: number;
  totalRequests: number;
  totalAICalls: number;
  totalCost: number;
  recentAlerts: SecurityAlert[];
  topEndpoints: Array<{ endpoint: string; count: number }>;
} {
  const patterns = Array.from(usagePatterns.values());
  const allAlerts = Array.from(recentAlerts.values()).flat();
  
  // Count endpoint usage
  const endpointCounts = new Map<string, number>();
  for (const log of logBuffer) {
    const count = endpointCounts.get(log.endpoint) || 0;
    endpointCounts.set(log.endpoint, count + 1);
  }
  
  const topEndpoints = Array.from(endpointCounts.entries())
    .map(([endpoint, count]) => ({ endpoint, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    activeUsers: patterns.length,
    totalRequests: patterns.reduce((sum, p) => sum + p.requestCount, 0),
    totalAICalls: patterns.reduce((sum, p) => sum + p.aiCallCount, 0),
    totalCost: patterns.reduce((sum, p) => sum + p.totalCost, 0),
    recentAlerts: allAlerts.slice(-20),
    topEndpoints
  };
}

/**
 * Export monitoring middleware setup
 */
export function setupMonitoring() {
  initializeMonitoring();
  
  return {
    logAIUsage,
    getMonitoringStats,
    processSecurityAlert
  };
}