// Hotfix para login em produção - Railway
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { logger } from './logger';

const JWT_SECRET = process.env.JWT_SECRET;

// Auto-executar na importação para garantir funcionamento
(async function initProductionLogin() {
  try {
    logger.info('🔧 Hotfix de login em produção inicializado');
    
    // Verificar se variáveis essenciais estão configuradas
    if (!process.env.DATABASE_URL) {
      logger.warn('⚠️ DATABASE_URL não encontrada');
    }
    
    if (!process.env.JWT_SECRET) {
      logger.warn('⚠️ JWT_SECRET não encontrada; fallback de autenticação será desabilitado');
    }
    
    logger.info('✅ Hotfix de login configurado para Railway');
  } catch (error) {
    logger.error('❌ Erro no hotfix de login:', error instanceof Error ? error : new Error('Erro desconhecido'));
  }
})();

export const productionAuthHelper = {
  // Fallback para autenticação se banco falhar (apenas se explicitamente habilitado)
  validateCredentials: async (email: string, password: string) => {
    const fallbackEmail = process.env.ADMIN_EMAIL;
    const fallbackPassword = process.env.FALLBACK_ADMIN_PASSWORD;

    if (
      process.env.ENABLE_PRODUCTION_FALLBACK_LOGIN === 'true' &&
      !!fallbackEmail &&
      !!fallbackPassword &&
      email === fallbackEmail &&
      password === fallbackPassword
    ) {
      return {
        id: '53f6cfa7-b3f7-4f68-96ef-6c933df2e8e9',
        organizationId: '550e8400-e29b-41d4-a716-446655440000',
        email: fallbackEmail,
        passwordHash: '$2b$10$encrypted.hash',
        name: process.env.ADMIN_NAME || 'System Administrator',
        role: 'super_admin',
        accountStatus: 'approved',
        isActive: true,
        emailVerified: true,
        permissions: [],
        assignedCostCenters: null,
        lastLoginAt: null,
        isOnline: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
  return null;
  },
  
  generateToken: (userId: string) => {
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET não configurado');
    }
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '8h' });
  }
};
