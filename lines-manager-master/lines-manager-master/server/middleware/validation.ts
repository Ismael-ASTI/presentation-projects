import { z } from 'zod';
import type { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../errors';

// Middleware genérico para validação com Zod
export const validate = (schema: {
  body?: z.ZodSchema;
  params?: z.ZodSchema;
  query?: z.ZodSchema;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validar body
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }

      // Validar params
      if (schema.params) {
        req.params = schema.params.parse(req.params);
      }

      // Validar query
      if (schema.query) {
        req.query = schema.query.parse(req.query);
      }

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        next(new ValidationError('Dados inválidos', errorMessages));
      } else {
        next(error);
      }
    }
  };
};

// Schemas de validação específicos
export const authSchemas = {
  login: z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  }),
  register: z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
    name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  }),
};

export const userSchemas = {
  create: z.object({
    email: z.string().email('Email inválido'),
    name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    role: z.enum(['super_admin', 'admin', 'user'], 
      { errorMap: () => ({ message: 'Papel deve ser super_admin, admin ou user' }) }),
    password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  }),
  update: z.object({
    email: z.string().email('Email inválido').optional(),
    name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').optional(),
    role: z.enum(['super_admin', 'admin', 'user']).optional(),
    isActive: z.boolean().optional(),
  }),
  params: z.object({
    id: z.string().uuid('ID deve ser um UUID válido'),
  }),
};

export const lineSchemas = {
  create: z.object({
    organizationId: z.string().uuid('Organization ID deve ser um UUID válido').optional(),
    ddd: z.string().max(3, 'DDD deve ter no máximo 3 caracteres').optional(),
    numero: z.string().min(1, 'Número é obrigatório'),
    nome: z.string().min(1, 'Nome é obrigatório').optional(),
    custoFlutuante: z.string().optional(),
    custoReal: z.string().optional(),
    conta: z.string().optional(),
    tipo: z.string().optional(),
    status: z.enum(['Ativa', 'Inativa', 'Manutenção', 'ativa', 'inativa']).default('Ativa'),
    // hasWhatsapp: z.boolean().default(true),
    // whatsappNumber: z.string().optional(),
    description: z.string().optional(),
  }),
  update: z.object({
    numero: z.string().min(1, 'Número é obrigatório').optional(),
    nome: z.string().min(1, 'Nome é obrigatório').optional(),
    ddd: z.string().max(3, 'DDD deve ter no máximo 3 caracteres').optional(),
    status: z.enum(['Ativa', 'Inativa', 'Manutenção']).optional(),
    // hasWhatsapp: z.boolean().optional(),
    // whatsappNumber: z.string().optional(),
    validationStatus: z.enum(['Validada', 'Pendente', 'Rejeitada', 'Em Análise']).optional(),
  }),
  params: z.object({
    id: z.string().uuid('ID deve ser um UUID válido'),
  }),
  query: z.object({
    search: z.string().optional(),
    status: z.enum(['Ativa', 'Inativa', 'Manutenção']).optional(),
    // hasWhatsapp: z.coerce.boolean().optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
  }),
};

// Middleware de sanitização
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  const sanitizeValue = (value: any): any => {
    if (typeof value === 'string') {
      // Remove scripts e tags HTML
      return value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<[^>]*>/g, '')
        .trim();
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: any = {};
      for (const key in value) {
        sanitized[key] = sanitizeValue(value[key]);
      }
      return sanitized;
    }
    return value;
  };

  if (req.body) {
    req.body = sanitizeValue(req.body);
  }
  if (req.query) {
    req.query = sanitizeValue(req.query);
  }
  if (req.params) {
    req.params = sanitizeValue(req.params);
  }

  next();
};
