import { z } from "zod";

// User Schema
export const userSchema = z.object({
  id: z.string(),
  username: z.string().min(3),
  password: z.string().min(6),
  role: z.enum(['super_admin', 'admin', 'user', 'viewer']),
  name: z.string(),
  lastLoginAt: z.string().optional(),
  isOnline: z.boolean().default(false),
  assignedCostCenters: z.array(z.string()).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const insertUserSchema = userSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const loginSchema = z.object({
  username: z.string().min(1, "Username é obrigatório"),
  password: z.string().min(1, "Senha é obrigatória"),
});

// Line Schema
export const lineSchema = z.object({
  id: z.string(),
  item: z.string().optional(),
  ddd: z.string().optional(),
  numero: z.string().min(1),
  nome: z.string().min(1),
  custoFlutuante: z.string().optional(),
  custoReal: z.string().optional(),
  conta: z.string().optional(),
  tipo: z.string().optional(),
  whatsapp: z.string().optional(),
  validationStatus: z.enum(['Validada', 'Pendente', 'Rejeitada', 'Em Análise']).default('Pendente'),
  validatedBy: z.string().optional(),
  validationDate: z.string().optional(),
  // Legacy fields for backward compatibility
  code: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(['Ativa', 'Inativa', 'Manutenção']),
  origin: z.string().min(1),
  destination: z.string().min(1),
  route: z.string().min(1),
  createdAt: z.string(),
  updatedAt: z.string(),
  updatedBy: z.string(),
});

export const insertLineSchema = lineSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateLineSchema = insertLineSchema.partial();

// Session Schema
export const sessionSchema = z.object({
  userId: z.string(),
  username: z.string(),
  role: z.string(),
  expiresAt: z.number(),
});

// Activity Log Schema
export const activityLogSchema = z.object({
  id: z.string(),
  userId: z.string(),
  username: z.string(),
  action: z.string(),
  resource: z.string(),
  resourceId: z.string().optional(),
  details: z.string().optional(),
  timestamp: z.string(),
});

export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginCredentials = z.infer<typeof loginSchema>;
export type Line = z.infer<typeof lineSchema>;
export type InsertLine = z.infer<typeof insertLineSchema>;
export type UpdateLine = z.infer<typeof updateLineSchema>;
export type Session = z.infer<typeof sessionSchema>;
export type ActivityLog = z.infer<typeof activityLogSchema>;
