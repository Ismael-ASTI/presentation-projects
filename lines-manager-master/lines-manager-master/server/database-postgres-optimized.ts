// Database PostgreSQL com configuração SSL otimizada para Railway
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';
import bcrypt from 'bcryptjs';

console.log('🔐 CONFIGURANDO POSTGRESQL RAILWAY COM SSL OTIMIZADO');

let db: any = null;
let sql: any = null;

export function createPostgreSQLStorage() {
  console.log('🔌 Conectando ao PostgreSQL Railway...');
  
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL não configurada');
  }

  // Configuração SSL otimizada para Railway
  const connectionOptions = {
    ssl: 'require' as const,
    // Timeouts otimizados
    connect_timeout: 60,
    idle_timeout: 30,
    // Pool de conexões conservador
    max: 3,
    // Retry interno
    prepare: false,
    // Debug para diagnóstico
    debug: process.env.NODE_ENV === 'development',
  };

  console.log('⚙️ Opções de conexão Railway:');
  console.log(`   SSL: ${connectionOptions.ssl}`);
  console.log(`   Timeout: ${connectionOptions.connect_timeout}s`);
  console.log(`   Max pool: ${connectionOptions.max}`);

  try {
    sql = postgres(process.env.DATABASE_URL, connectionOptions);
    db = drizzle(sql, { schema });
    
    console.log('📊 Environment:', process.env.NODE_ENV);
    console.log('🌐 Database host:', process.env.DATABASE_URL.split('@')[1]?.split('/')[0]);
    
    return {
      // Health check otimizado
      async healthCheck() {
        try {
          const result = await sql`SELECT 1 as test`;
          return result.length > 0;
        } catch (error) {
          console.error('Health check falhou:', error);
          return false;
        }
      },

      // Usuários
      async getUser(id: string) {
        try {
          const result = await sql`SELECT * FROM users WHERE id = ${id}`;
          return result[0] || null;
        } catch (error) {
          console.error('Erro ao buscar usuário:', error);
          throw error;
        }
      },

      async getUserByEmail(email: string) {
        try {
          const result = await sql`SELECT * FROM users WHERE email = ${email}`;
          return result[0] || null;
        } catch (error) {
          console.error('Erro ao buscar usuário por email:', error);
          throw error;
        }
      },

      async getAllUsers() {
        try {
          return await sql`SELECT * FROM users ORDER BY created_at DESC`;
        } catch (error) {
          console.error('Erro ao listar usuários:', error);
          throw error;
        }
      },

      async createUser(userData: any) {
        try {
          console.log('🔧 Criando usuário no PostgreSQL...');
          
          const result = await sql`
            INSERT INTO users (
              id, email, name, password_hash, role, organization_id, 
              is_active, created_at, updated_at
            ) VALUES (
              ${userData.id || crypto.randomUUID()},
              ${userData.email},
              ${userData.name},
              ${userData.passwordHash},
              ${userData.role || 'admin'},
              ${userData.organizationId || 'default'},
              ${userData.isActive !== false},
              NOW(),
              NOW()
            )
            RETURNING *
          `;
          
          console.log('✅ Usuário criado no Railway:', userData.email);
          return result[0];
        } catch (error) {
          console.error('Erro ao criar usuário:', error);
          throw error;
        }
      },

      // Linhas  
      async getAllLines(options: any = {}) {
        try {
          let query = 'SELECT * FROM lines';
          const conditions = [];
          
          if (options.search) {
            conditions.push(`(nome ILIKE '%${options.search}%' OR numero ILIKE '%${options.search}%')`);
          }
          
          if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
          }
          
          query += ' ORDER BY created_at DESC';
          
          if (options.limit) {
            query += ` LIMIT ${options.limit}`;
          }
          
          return await sql.unsafe(query);
        } catch (error) {
          console.error('Erro ao listar linhas:', error);
          throw error;
        }
      },

      async createLine(lineData: any) {
        try {
          const result = await sql`
            INSERT INTO lines (
              id, numero, nome, tipo, status, endereco, bairro, cidade, cep,
              latitude, longitude, created_at, updated_at
            ) VALUES (
              ${lineData.id || crypto.randomUUID()},
              ${lineData.numero},
              ${lineData.nome},
              ${lineData.tipo || 'residencial'},
              ${lineData.status || 'ativa'},
              ${lineData.endereco},
              ${lineData.bairro},
              ${lineData.cidade},
              ${lineData.cep},
              ${lineData.latitude},
              ${lineData.longitude},
              NOW(),
              NOW()
            )
            RETURNING *
          `;
          
          return result[0];
        } catch (error) {
          console.error('Erro ao criar linha:', error);
          throw error;
        }
      },

      // Autenticação
      async authenticateUser(email: string, password: string) {
        try {
          const user = await this.getUserByEmail(email);
          if (!user) return null;
          
          const isValid = await bcrypt.compare(password, user.password_hash);
          if (!isValid) return null;
          
          return user;
        } catch (error) {
          console.error('Erro na autenticação:', error);
          throw error;
        }
      },

      async hashPassword(password: string) {
        return await bcrypt.hash(password, 10);
      },

      // Super Admin
      async initializeSuperAdmin() {
        try {
          const defaultAdminEmail = process.env.ADMIN_EMAIL || 'admin@linemanager.com';
          const defaultAdminName = process.env.ADMIN_NAME || 'System Administrator';
          const defaultAdminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';

          console.log('👑 Inicializando Super Admin no PostgreSQL...');
          
          const existingAdmin = await this.getUserByEmail(defaultAdminEmail);
          if (existingAdmin) {
            console.log('✅ Super Admin já existe');
            return existingAdmin;
          }
          
          console.log('🔧 Criando Super Admin no PostgreSQL...');
          const hashedPassword = await this.hashPassword(defaultAdminPassword);
          
          const admin = await this.createUser({
            id: crypto.randomUUID(),
            email: defaultAdminEmail,
            name: defaultAdminName,
            passwordHash: hashedPassword,
            role: 'super_admin',
            organizationId: '550e8400-e29b-41d4-a716-446655440000',
            isActive: true
          });
          
          console.log('👑 Super Admin criado no Railway PostgreSQL');
          return admin;
        } catch (error) {
          console.error('Erro ao inicializar Super Admin:', error);
          throw error;
        }
      },

      // Logs de atividade (básico)
      async createActivityLog(logData: any) {
        try {
          await sql`
            INSERT INTO activity_logs (
              id, user_id, action, resource_type, resource_id, 
              details, created_at
            ) VALUES (
              ${crypto.randomUUID()},
              ${logData.userId},
              ${logData.action},
              ${logData.resourceType},
              ${logData.resourceId},
              ${JSON.stringify(logData.details)},
              NOW()
            )
          `;
        } catch (error) {
          console.error('Erro ao criar log:', error);
          // Não falhar por causa de log
        }
      },

      // Operações não implementadas (stubs)
      async updateUser() { throw new Error('updateUser não implementado'); },
      async deleteUser() { throw new Error('deleteUser não implementado'); },
      async getLine() { throw new Error('getLine não implementado'); },
      async updateLine() { throw new Error('updateLine não implementado'); },
      async deleteLine() { throw new Error('deleteLine não implementado'); },
      async executeRawSQL() { throw new Error('executeRawSQL não implementado'); },
      async exportData() { throw new Error('exportData não implementado'); },
    };
    
  } catch (error) {
    console.error('❌ Erro ao configurar PostgreSQL Railway:', error);
    throw error;
  }
}

/**
 * DEPRECATED: substituído por `database.ts` + `database-postgres.ts`.
 */
export {};
