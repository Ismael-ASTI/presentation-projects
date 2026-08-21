import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors';
import { logger } from '../logger';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const requestId = (req as any).requestId;
  
  // Log do erro
  logger.error('Error occurred', err, {
    requestId,
    url: req.url,
    method: req.method,
    userId: (req as any).user?.id,
    body: req.body,
    params: req.params,
    query: req.query,
  });

  // Se é um erro customizado da aplicação
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
        requestId,
      },
    });
  }

  // Erros de validação do Zod
  if (err.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Dados inválidos',
        details: (err as any).errors,
        requestId,
      },
    });
  }

  // Erros do banco de dados
  if (err.message.includes('duplicate key') || err.message.includes('UNIQUE constraint')) {
    return res.status(409).json({
      success: false,
      error: {
        code: 'DUPLICATE_ENTRY',
        message: 'Registro já existe',
        requestId,
      },
    });
  }

  // Erro genérico para não vazar informações em produção
  const isProduction = process.env.NODE_ENV === 'production';
  
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: isProduction ? 'Erro interno do servidor' : err.message,
      requestId,
      ...(isProduction ? {} : { stack: err.stack }),
    },
  });
};

// Middleware para capturar erros assíncronos
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Middleware para handling de 404
export const notFoundHandler = (req: Request, res: Response) => {
  const requestId = (req as any).requestId;
  
  logger.warn('Route not found', {
    requestId,
    url: req.url,
    method: req.method,
  });

  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Rota não encontrada',
      requestId,
    },
  });
};
