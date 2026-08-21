import rateLimit from 'express-rate-limit';
import type { Request, Response } from 'express';
import { RateLimitError } from '../errors';
import { logger } from '../logger';

// Rate limiters para diferentes endpoints
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, // 1000 requests por IP (aumentado para permitir imports)
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Muitas tentativas. Tente novamente em 15 minutos.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.security('Rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
    });
    
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Muitas tentativas. Tente novamente em 15 minutos.',
      },
    });
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 tentativas de login por IP
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
    },
  },
  skipSuccessfulRequests: true,
  handler: (req: Request, res: Response) => {
    logger.security('Login rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      body: { email: req.body?.email },
    });
    
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
      },
    });
  },
});

export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 200, // 200 requests por minuto para APIs (aumentado para imports)
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Limite de requisições excedido. Tente novamente em 1 minuto.',
    },
  },
});

export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // 10 uploads por 15 minutos (aumentado para permitir mais tentativas)
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Limite de uploads excedido. Tente novamente em 15 minutos.',
    },
  },
});
