import { pgTable, uuid, varchar, text, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull().default('user'),
  accountStatus: varchar('account_status', { length: 50 }).notNull().default('pending'),
  isActive: boolean('is_active').default(true),
  emailVerified: boolean('email_verified').default(false),
  permissions: jsonb('permissions').default('[]'),
  assignedCostCenters: text('assigned_cost_centers').array(),
  lastLoginAt: timestamp('last_login_at'),
  isOnline: boolean('is_online').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const lines = pgTable('lines', {
  id: uuid('id').primaryKey().defaultRandom(),  
  organizationId: uuid('organization_id').notNull(),
  item: text('item'),
  ddd: varchar('ddd', { length: 3 }),
  numero: varchar('numero', { length: 20 }),
  nome: varchar('nome', { length: 255 }),
  custoFlutuante: text('custo_flutuante'),
  custoReal: text('custo_real'),
  conta: varchar('conta', { length: 50 }),
  tipo: varchar('tipo', { length: 100 }),
  code: varchar('code', { length: 50 }), // Removido .notNull()
  name: varchar('name', { length: 255 }),
  description: text('description'),
  status: varchar('status', { length: 50 }).default('Ativa'),
  origin: varchar('origin', { length: 100 }),
  destination: varchar('destination', { length: 100 }),
  route: varchar('route', { length: 255 }),
  validationStatus: varchar('validation_status', { length: 50 }).default('Pendente'),
  metadata: jsonb('metadata'),
  // Campos de WhatsApp
  hasWhatsapp: boolean('has_whatsapp').default(true),
  whatsappNumber: varchar('whatsapp_number', { length: 20 }),
  createdBy: uuid('created_by'),
  updatedBy: uuid('updated_by'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const activityLogs = pgTable('activity_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id'),
  action: varchar('action', { length: 100 }).notNull(),
  entity: varchar('entity', { length: 100 }),
  entityId: uuid('entity_id'),
  details: jsonb('details'),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Line = typeof lines.$inferSelect;
export type InsertLine = typeof lines.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = typeof activityLogs.$inferInsert;
