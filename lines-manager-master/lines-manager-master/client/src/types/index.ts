export * from '../../../server/schema';
import type { User, Line, ActivityLog } from '../../../server/schema';

export interface DashboardStats {
  totalLines: number;
  activeLines: number;
  onlineUsers: number;
  lastUpdate: string;
}

export interface Theme {
  mode: 'light' | 'dark';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface LineFilters {
  search: string;
  status: string;
  hasWhatsapp?: boolean;
  page: number;
  limit: number;
}

export interface ExcelImportResult {
  success: boolean;
  imported: number;
  duplicates?: number;
  errors: string[];
}

// Tipos específicos para formulários
export interface UserFormData {
  email: string;
  name: string;
  role: 'user' | 'admin' | 'super_admin' | 'viewer';
  accountStatus?: string;
  isActive?: boolean;
  permissions?: string[];
}

export interface LineFormData {
  organizationId: string;
  ddd: string;
  numero: string;
  nome: string;
  origin?: string;
  destination?: string;
  custoFlutuante?: string;
  custoReal?: string;
  conta?: string;
  tipo?: string;
  status?: string;
  hasWhatsapp?: boolean;
  whatsappNumber?: string;
  description?: string;
}

// Tipos para autenticação
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface Session {
  userId: string;
  username: string;
  role: string;
  expiresAt: number;
}

// Tipo estendido para linha com WhatsApp computed
export interface LineWithWhatsApp extends Line {
  whatsappLink?: string;
  formattedPhone?: string;
}
