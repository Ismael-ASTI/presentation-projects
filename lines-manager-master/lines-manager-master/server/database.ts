import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Configuração para PostgreSQL (Railway ou local)
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL não configurada');
  throw new Error('DATABASE_URL não configurada - configure uma instância PostgreSQL');
}

console.log('🔌 Conectando ao PostgreSQL...');
console.log('📊 Environment:', process.env.NODE_ENV);
console.log('🌐 Database host:', connectionString.split('@')[1]?.split('/')[0] || 'unknown');

// Cliente PostgreSQL otimizado para Railway e desenvolvimento
const client = postgres(connectionString, {
  // Railway exige SSL; manter 'require' em todos os ambientes
  ssl: 'require',
  max: process.env.NODE_ENV === 'production' ? 20 : 5, // Menos conexões em dev
  idle_timeout: 30,
  connect_timeout: 30,
  // Configurações para Railway
  prepare: false,
  types: {
    bigint: postgres.BigInt,
  },
  // Retry automático em caso de falha
  max_lifetime: 60 * 30, // 30 minutos
  onnotice: () => {}, // Silenciar notices do PostgreSQL
});

export const db = drizzle(client, { schema });

// Teste de conexão melhorado
export async function testConnection() {
  try {
    console.log('🔍 Testando conexão com PostgreSQL...');
    await client`SELECT 1 as test`;
    console.log('✅ Conectado ao PostgreSQL!');
    return true;
  } catch (error) {
    console.error('❌ Erro na conexão com PostgreSQL:', error);
    
    // Informações de debug para conexão
    if (error instanceof Error) {
      console.error('Erro detalhado:', {
        message: error.message,
        code: (error as any).code,
        errno: (error as any).errno,
      });
    }
    
    return false;
  }
}

// Função para fechamento limpo da conexão
export async function closeConnection() {
  try {
    await client.end();
    console.log('🔌 Conexão PostgreSQL fechada');
  } catch (error) {
    console.error('Erro ao fechar conexão:', error);
  }
}

// Função para verificar saúde da conexão
export async function checkHealth() {
  try {
    const result = await client`SELECT NOW() as current_time, version() as pg_version`;
    return {
      status: 'healthy',
      timestamp: result[0].current_time,
      version: result[0].pg_version,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
