// DEPRECATED: use './database' diretamente.
// Compat: reexporta o cliente único e tipos. Não declare nada extra aqui.
export { db } from './database';
export type { User, InsertUser, Line, InsertLine, ActivityLog, InsertActivityLog } from './schema';
