import winston from 'winston';
import * as Sentry from '@sentry/nextjs';

const { combine, timestamp, errors, json, colorize, printf, label } = winston.format;

// Custom format for console output
const consoleFormat = printf(({ level, message, label, timestamp, stack, ...meta }) => {
  const labelStr = label ? `[${label}] ` : '';
  const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
  const stackStr = stack ? `\n${stack}` : '';
  return `${timestamp} ${level}: ${labelStr}${message}${metaStr}${stackStr}`;
});

// Create Sentry Winston transport
const createSentryTransport = () => {
  try {
    const Transport = winston.transports.Console;
    const SentryWinstonTransport = Sentry.createSentryWinstonTransport(Transport, {
      // Only capture error and warn logs to Sentry
      levels: ['error', 'warn'],
    });
    return new SentryWinstonTransport();
  } catch (error) {
    console.warn('Failed to create Sentry Winston transport:', error);
    return null;
  }
};

// Create the Winston logger
const createWinstonLogger = (service?: string) => {
  const transports: winston.transport[] = [];

  // Console transport for all environments
  transports.push(
    new winston.transports.Console({
      format: combine(
        errors({ stack: true }),
        colorize(),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        service ? label({ label: service }) : winston.format.simple(),
        consoleFormat
      ),
    })
  );

  // File transport for production
  if (process.env.NODE_ENV === 'production') {
    transports.push(
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        format: combine(
          errors({ stack: true }),
          timestamp(),
          service ? label({ label: service }) : winston.format.simple(),
          json()
        ),
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      })
    );

    transports.push(
      new winston.transports.File({
        filename: 'logs/combined.log',
        format: combine(
          errors({ stack: true }),
          timestamp(),
          service ? label({ label: service }) : winston.format.simple(),
          json()
        ),
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      })
    );
  }

  // Add Sentry transport if configured
  const sentryTransport = createSentryTransport();
  if (sentryTransport) {
    transports.push(sentryTransport);
  }

  return winston.createLogger({
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
    format: combine(
      errors({ stack: true }),
      timestamp(),
      service ? label({ label: service }) : winston.format.simple()
    ),
    transports,
    // Don't exit on error
    exitOnError: false,
  });
};

// Legacy interfaces for backward compatibility
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

export interface LogContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  component?: string;
  function?: string;
  duration?: number;
  error?: Error;
  [key: string]: any;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
  environment: string;
  version?: string;
}

// Create the main logger instance
const winstonLogger = createWinstonLogger();

// Logger class that wraps Winston for backward compatibility
class Logger {
  private environment: string;
  private version: string;
  private winston: winston.Logger;

  constructor(winston: winston.Logger) {
    this.environment = process.env.NODE_ENV || 'development';
    this.version = process.env.npm_package_version || 'unknown';
    this.winston = winston;
  }

  private createLogEntry(level: LogLevel, message: string, context?: LogContext): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      environment: this.environment,
      version: this.version,
      context,
    };
  }

  private shouldLog(level: LogLevel): boolean {
    // In production, only log INFO and above
    if (this.environment === 'production') {
      return level !== LogLevel.DEBUG;
    }
    // In development, log everything
    return true;
  }

  error(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.ERROR)) return;
    
    const entry = this.createLogEntry(LogLevel.ERROR, message, context);
    this.winston.error(message, { ...context, timestamp: entry.timestamp });
  }

  warn(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.WARN)) return;
    
    const entry = this.createLogEntry(LogLevel.WARN, message, context);
    this.winston.warn(message, { ...context, timestamp: entry.timestamp });
  }

  info(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.INFO)) return;
    
    const entry = this.createLogEntry(LogLevel.INFO, message, context);
    this.winston.info(message, { ...context, timestamp: entry.timestamp });
  }

  debug(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    
    const entry = this.createLogEntry(LogLevel.DEBUG, message, context);
    this.winston.debug(message, { ...context, timestamp: entry.timestamp });
  }

  // Performance logging helper
  performance(operation: string, startTime: number, context?: LogContext): void {
    const duration = Date.now() - startTime;
    this.info(`Performance: ${operation} completed`, {
      ...context,
      duration,
      operation,
    });
  }

  // API request logging helper
  apiRequest(method: string, path: string, statusCode: number, duration: number, context?: LogContext): void {
    const level = statusCode >= 500 ? LogLevel.ERROR : statusCode >= 400 ? LogLevel.WARN : LogLevel.INFO;
    
    const message = `API ${method} ${path} - ${statusCode}`;
    const logContext = {
      ...context,
      method,
      path,
      statusCode,
      duration,
      component: 'api',
    };
    
    switch (level) {
      case LogLevel.ERROR:
        this.error(message, logContext);
        break;
      case LogLevel.WARN:
        this.warn(message, logContext);
        break;
      default:
        this.info(message, logContext);
    }
  }

  // Database operation logging helper
  dbOperation(operation: string, table: string, duration: number, success: boolean, context?: LogContext): void {
    const level = success ? LogLevel.INFO : LogLevel.ERROR;
    const message = `Database ${operation} on ${table} - ${success ? 'success' : 'failed'}`;
    const logContext = {
      ...context,
      operation,
      table,
      duration,
      success,
      component: 'database',
    };
    
    if (success) {
      this.info(message, logContext);
    } else {
      this.error(message, logContext);
    }
  }
}

// Export singleton instance
export const logger = new Logger(winstonLogger);

// Export Winston instance for advanced use cases
export const winstonInstance = winstonLogger;

// Export factory function for service-specific loggers
export const createServiceLogger = (serviceName: string) => {
  return new Logger(createWinstonLogger(serviceName));
};

// Export structured logging helpers
export const withLogging = <T extends any[], R>(
  fn: (...args: T) => R,
  operation: string,
  context?: LogContext
) => {
  return (...args: T): R => {
    const startTime = Date.now();
    try {
      const result = fn(...args);
      logger.performance(operation, startTime, context);
      return result;
    } catch (error) {
      logger.error(`${operation} failed`, {
        ...context,
        error: error instanceof Error ? error : new Error(String(error)),
        duration: Date.now() - startTime,
      });
      throw error;
    }
  };
};

export const withAsyncLogging = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  operation: string,
  context?: LogContext
) => {
  return async (...args: T): Promise<R> => {
    const startTime = Date.now();
    try {
      const result = await fn(...args);
      logger.performance(operation, startTime, context);
      return result;
    } catch (error) {
      logger.error(`${operation} failed`, {
        ...context,
        error: error instanceof Error ? error : new Error(String(error)),
        duration: Date.now() - startTime,
      });
      throw error;
    }
  };
};

// Additional Winston-specific helpers
export const logApiRequest = (method: string, path: string, userId?: string) => {
  winstonLogger.info('API Request', {
    method,
    path,
    userId,
    timestamp: new Date().toISOString(),
  });
};

export const logApiResponse = (method: string, path: string, statusCode: number, duration: number, userId?: string) => {
  winstonLogger.info('API Response', {
    method,
    path,
    statusCode,
    duration,
    userId,
    timestamp: new Date().toISOString(),
  });
};

export const logError = (error: Error, context?: Record<string, any>) => {
  winstonLogger.error('Application Error', {
    error: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  });
};

export const logToolExecution = (toolName: string, parameters: any, success: boolean, duration?: number, error?: string) => {
  const logLevel = success ? 'info' : 'error';
  winstonLogger[logLevel]('Tool Execution', {
    toolName,
    parameters,
    success,
    duration,
    error,
    timestamp: new Date().toISOString(),
  });
};

export const logCitationGeneration = (pageType: string, filename: string, success: boolean, url?: string, error?: string) => {
  const logLevel = success ? 'info' : 'error';
  winstonLogger[logLevel]('Citation Generation', {
    pageType,
    filename,
    success,
    url,
    error,
    timestamp: new Date().toISOString(),
  });
};

export const logUserQuery = (query: string, scenario: string, userId?: string) => {
  winstonLogger.info('User Query', {
    query: query.substring(0, 200), // Limit query length for privacy
    scenario,
    userId,
    timestamp: new Date().toISOString(),
  });
};

export const logOrchestratorStep = (stepNumber: number, scenario: string, toolName?: string, success?: boolean) => {
  winstonLogger.info('Orchestrator Step', {
    stepNumber,
    scenario,
    toolName,
    success,
    timestamp: new Date().toISOString(),
  });
};

// Performance logging
export const logPerformance = (operation: string, duration: number, metadata?: Record<string, any>) => {
  winstonLogger.info('Performance', {
    operation,
    duration,
    metadata,
    timestamp: new Date().toISOString(),
  });
};