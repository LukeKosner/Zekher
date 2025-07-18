// Edge Runtime compatible logger (no Winston/Node.js APIs)
import * as Sentry from '@sentry/nextjs';

export enum EdgeLogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

export interface EdgeLogContext {
  requestId?: string;
  userId?: string;
  component?: string;
  method?: string;
  path?: string;
  statusCode?: number;
  duration?: number;
  userAgent?: string;
  [key: string]: any;
}

class EdgeLogger {
  private environment: string;
  private isProduction: boolean;

  constructor() {
    this.environment = process.env.NODE_ENV || 'development';
    this.isProduction = this.environment === 'production';
  }

  private shouldLog(level: EdgeLogLevel): boolean {
    // In production, only log INFO and above
    if (this.isProduction) {
      return level !== EdgeLogLevel.DEBUG;
    }
    // In development, log everything
    return true;
  }

  private formatMessage(level: EdgeLogLevel, message: string, context?: EdgeLogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` | ${JSON.stringify(context)}` : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`;
  }

  private sendToSentry(level: EdgeLogLevel, message: string, context?: EdgeLogContext): void {
    if (level === EdgeLogLevel.ERROR) {
      Sentry.captureMessage(message, 'error');
    } else if (level === EdgeLogLevel.WARN) {
      Sentry.captureMessage(message, 'warning');
    }
  }

  private outputLog(level: EdgeLogLevel, message: string, context?: EdgeLogContext): void {
    const formatted = this.formatMessage(level, message, context);
    
    switch (level) {
      case EdgeLogLevel.ERROR:
        console.error(formatted);
        break;
      case EdgeLogLevel.WARN:
        console.warn(formatted);
        break;
      case EdgeLogLevel.INFO:
        console.info(formatted);
        break;
      case EdgeLogLevel.DEBUG:
        console.debug(formatted);
        break;
    }
  }

  error(message: string, context?: EdgeLogContext): void {
    if (!this.shouldLog(EdgeLogLevel.ERROR)) return;
    
    this.outputLog(EdgeLogLevel.ERROR, message, context);
    this.sendToSentry(EdgeLogLevel.ERROR, message, context);
  }

  warn(message: string, context?: EdgeLogContext): void {
    if (!this.shouldLog(EdgeLogLevel.WARN)) return;
    
    this.outputLog(EdgeLogLevel.WARN, message, context);
    this.sendToSentry(EdgeLogLevel.WARN, message, context);
  }

  info(message: string, context?: EdgeLogContext): void {
    if (!this.shouldLog(EdgeLogLevel.INFO)) return;
    
    this.outputLog(EdgeLogLevel.INFO, message, context);
  }

  debug(message: string, context?: EdgeLogContext): void {
    if (!this.shouldLog(EdgeLogLevel.DEBUG)) return;
    
    this.outputLog(EdgeLogLevel.DEBUG, message, context);
  }

  // API request logging helper
  apiRequest(method: string, path: string, statusCode: number, duration: number, context?: EdgeLogContext): void {
    const level = statusCode >= 500 ? EdgeLogLevel.ERROR : statusCode >= 400 ? EdgeLogLevel.WARN : EdgeLogLevel.INFO;
    
    const message = `API ${method} ${path} - ${statusCode}`;
    const logContext = {
      ...context,
      method,
      path,
      statusCode,
      duration,
      component: context?.component || 'api',
    };
    
    switch (level) {
      case EdgeLogLevel.ERROR:
        this.error(message, logContext);
        break;
      case EdgeLogLevel.WARN:
        this.warn(message, logContext);
        break;
      default:
        this.info(message, logContext);
    }
  }
}

// Export singleton instance
export const edgeLogger = new EdgeLogger();