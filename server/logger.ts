import config from './config.js';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4
}

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: any;
  userId?: string;
  sessionId?: string;
  requestId?: string;
}

export class Logger {
  private static instance: Logger;
  private currentLogLevel: LogLevel;
  private logQueue: LogEntry[] = [];
  private maxQueueSize = 1000;

  constructor() {
    this.currentLogLevel = this.parseLogLevel(config.logLevel);
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private parseLogLevel(level: string): LogLevel {
    switch (level.toLowerCase()) {
      case 'debug': return LogLevel.DEBUG;
      case 'info': return LogLevel.INFO;
      case 'warn': return LogLevel.WARN;
      case 'error': return LogLevel.ERROR;
      case 'fatal': return LogLevel.FATAL;
      default: return LogLevel.INFO;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.currentLogLevel;
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: Record<string, any>,
    error?: any
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      context,
      error,
    };

    this.logQueue.push(entry);

    // Keep queue size manageable
    if (this.logQueue.length > this.maxQueueSize) {
      this.logQueue.shift();
    }

    return entry;
  }

  private formatMessage(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString();
    const levelName = LogLevel[entry.level];
    const contextStr = entry.context ? ` | Context: ${JSON.stringify(entry.context)}` : '';
    const errorStr = entry.error ? ` | Error: ${entry.error.message || entry.error}` : '';

    return `[${timestamp}] ${levelName}: ${entry.message}${contextStr}${errorStr}`;
  }

  debug(message: string, context?: Record<string, any>): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      const entry = this.createLogEntry(LogLevel.DEBUG, message, context);
      console.debug(this.formatMessage(entry));
    }
  }

  info(message: string, context?: Record<string, any>): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const entry = this.createLogEntry(LogLevel.INFO, message, context);
      console.info(this.formatMessage(entry));
    }
  }

  warn(message: string, context?: Record<string, any>): void {
    if (this.shouldLog(LogLevel.WARN)) {
      const entry = this.createLogEntry(LogLevel.WARN, message, context);
      console.warn(this.formatMessage(entry));
    }
  }

  error(message: string, error?: any, context?: Record<string, any>): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const entry = this.createLogEntry(LogLevel.ERROR, message, context, error);
      console.error(this.formatMessage(entry));
      if (error && error.stack) {
        console.error(error.stack);
      }
    }
  }

  fatal(message: string, error?: any, context?: Record<string, any>): void {
    if (this.shouldLog(LogLevel.FATAL)) {
      const entry = this.createLogEntry(LogLevel.FATAL, message, context, error);
      console.error(this.formatMessage(entry));
      if (error && error.stack) {
        console.error(error.stack);
      }
    }
  }

  // Request logging for HTTP requests
  logRequest(req: any, res: any, next: any): void {
    const startTime = Date.now();
    const requestId = this.generateRequestId();

    this.info('Request started', {
      requestId,
      method: req.method,
      url: req.url,
      ip: req.ip || req.connection?.remoteAddress,
      userAgent: req.get('User-Agent')
    });

    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const level = res.statusCode >= 400 ? 'warn' : 'info';

      this[level]('Request completed', {
        requestId,
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration: `${duration}ms`
      });
    });

    next();
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getRecentLogs(count: number = 100): LogEntry[] {
    return this.logQueue.slice(-count);
  }

  clearLogs(): void {
    this.logQueue = [];
  }

  setLogLevel(level: LogLevel): void {
    this.currentLogLevel = level;
    this.info('Log level changed', { newLevel: LogLevel[level] });
  }
}

// Convenience functions
export const logger = Logger.getInstance();

export const logRequest = (req: any, res: any, next: any) => {
  logger.logRequest(req, res, next);
};

// Utility functions for common logging scenarios
export const logApiCall = (endpoint: string, method: string, context?: Record<string, any>) => {
  logger.info(`API call: ${method} ${endpoint}`, context);
};

export const logWalletConnection = (walletType: string, context?: Record<string, any>) => {
  logger.info(`Wallet connected: ${walletType}`, context);
};

export const logWalletDisconnection = (context?: Record<string, any>) => {
  logger.info('Wallet disconnected', context);
};

export const logError = (error: any, context?: Record<string, any>) => {
  logger.error('Application error', error, context);
};

export const logPerformance = (operation: string, duration: number, context?: Record<string, any>) => {
  logger.info(`Performance: ${operation}`, {
    ...context,
    duration: `${duration}ms`
  });
};
