enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

interface LogContext {
  userId?: string;
  requestId?: string;
  action?: string;
  resource?: string;
  ip?: string;
  userAgent?: string;
  [key: string]: any;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV !== 'production';

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` | ${JSON.stringify(context)}` : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`;
  }

  error(message: string, error?: Error, context?: LogContext): void {
    const errorContext = {
      ...context,
      stack: error?.stack,
      errorName: error?.name,
    };
    
    console.error(this.formatMessage(LogLevel.ERROR, message, errorContext));
    
    // Em produção, enviar para serviço de logging (Sentry, Winston, etc.)
    if (!this.isDevelopment) {
      // TODO: Integrar com Sentry ou outro serviço
    }
  }

  warn(message: string, context?: LogContext): void {
    console.warn(this.formatMessage(LogLevel.WARN, message, context));
  }

  info(message: string, context?: LogContext): void {
    console.log(this.formatMessage(LogLevel.INFO, message, context));
  }

  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.log(this.formatMessage(LogLevel.DEBUG, message, context));
    }
  }

  // Logs específicos para auditoria
  audit(action: string, context: LogContext): void {
    this.info(`AUDIT: ${action}`, context);
  }

  // Logs de performance
  performance(operation: string, duration: number, context?: LogContext): void {
    this.info(`PERFORMANCE: ${operation} took ${duration}ms`, context);
  }

  // Logs de segurança
  security(event: string, context: LogContext): void {
    this.warn(`SECURITY: ${event}`, context);
  }
}

export const logger = new Logger();

// Middleware para logging de requests
export const requestLogger = (req: any, res: any, next: any) => {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substr(2, 9);
  
  req.requestId = requestId;
  req.startTime = startTime;

  logger.info(`Request started`, {
    requestId,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id,
  });

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logLevel = res.statusCode >= 400 ? 'warn' : 'info';
    
    logger[logLevel](`Request completed`, {
      requestId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      userId: req.user?.id,
    });
  });

  next();
};
