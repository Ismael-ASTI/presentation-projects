// PostgreSQL Database Storage Implementation
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from './database';
import { users, lines, activityLogs } from './schema';
import { eq, desc, and, or, ilike, sql } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

export function createPostgreSQLStorage() {
  return {
    // ============ USUÁRIOS ============
    async getUser(id: string): Promise<any | null> {
      try {
        const result = await db.select().from(users).where(eq(users.id, id));
        return result[0] || null;
      } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        return null;
      }
    },

    async getUserByEmail(email: string): Promise<any | null> {
      try {
        const normalizedEmail = String(email || '').trim().toLowerCase();
        const result = await db
          .select()
          .from(users)
          .where(sql`lower(${users.email}) = ${normalizedEmail}`);
        return result[0] || null;
      } catch (error) {
        console.error('Erro ao buscar usuário por email:', error);
        return null;
      }
    },

    async createUser(userData: any): Promise<any | null> {
      try {
        const normalizedEmail = String(userData.email || '').trim().toLowerCase();
        const insertData = {
          organizationId: userData.organizationId || '550e8400-e29b-41d4-a716-446655440000',
          email: normalizedEmail,
          passwordHash: userData.passwordHash!,
          name: userData.name!,
          role: userData.role || 'user',
          accountStatus: userData.accountStatus || 'pending',
          isActive: userData.isActive ?? true,
          emailVerified: userData.emailVerified ?? false,
          permissions: userData.permissions || [],
          assignedCostCenters: userData.assignedCostCenters || [],
          isOnline: userData.isOnline ?? false,
          ...(userData.id && { id: userData.id }),
        };
        
        const result = await db.insert(users).values(insertData).returning();
        return result[0];
      } catch (error) {
        console.error('Erro ao criar usuário:', error);
        return null;
      }
    },

    async updateUser(id: string, userData: any): Promise<any | null> {
      try {
        const updateData = { ...userData };
        if ((updateData as any).email) {
          (updateData as any).email = String((updateData as any).email).trim().toLowerCase();
        }
        delete (updateData as any).id;
        delete (updateData as any).createdAt;
        delete (updateData as any).updatedAt;
        
        const result = await db.update(users)
          .set(updateData)
          .where(eq(users.id, id))
          .returning();
        return result[0] || null;
      } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        return null;
      }
    },

    async deleteUser(id: string): Promise<boolean> {
      try {
        await db.delete(users).where(eq(users.id, id));
        return true;
      } catch (error) {
        console.error('Erro ao deletar usuário:', error);
        return false;
      }
    },

    async getAllUsers(): Promise<any[]> {
      try {
        return await db.select().from(users).orderBy(desc(users.createdAt));
      } catch (error) {
        console.error('Erro ao listar usuários:', error);
        return [];
      }
    },

    // ============ AUTENTICAÇÃO ============
    async authenticateUser(email: string, password: string): Promise<{ user: any; token: string } | null> {
      try {
        const user = await this.getUserByEmail(email);
        if (!user) return null;

        if (user.isActive === false) {
          return null;
        }

        if (user.accountStatus && user.accountStatus !== 'approved') {
          return null;
        }

        const isValidPassword = await bcrypt.compare(password, user.passwordHash);
        if (!isValidPassword) return null;

        await this.updateUser(user.id, { 
          lastLoginAt: new Date(),
          isOnline: true 
        });

        const token = jwt.sign(
          { userId: user.id, email: user.email, role: user.role },
          JWT_SECRET,
          { expiresIn: '8h' }
        );

        return { user, token };
      } catch (error) {
        console.error('Erro na autenticação:', error);
        return null;
      }
    },

    async hashPassword(password: string): Promise<string> {
      return await bcrypt.hash(password, 10);
    },

    // ============ LINHAS ============
    async getLine(id: string): Promise<any | null> {
      try {
        const result = await db.select().from(lines).where(eq(lines.id, id));
        return result[0] || null;
      } catch (error) {
        console.error('Erro ao buscar linha:', error);
        return null;
      }
    },

    async getAllLines(filters?: { search?: string; status?: string }): Promise<any[]> {
      try {
        const conditions = [];
        
        if (filters?.search) {
          const search = `%${filters.search}%`;
          conditions.push(
            or(
              ilike(lines.nome, search),
              ilike(lines.numero, search)
            )
          );
        }
        
        if (filters?.status) {
          conditions.push(eq(lines.status, filters.status));
        }
        
        if (conditions.length > 0) {
          return await db.select().from(lines)
            .where(and(...conditions))
            .orderBy(desc(lines.createdAt));
        }
        
        return await db.select().from(lines).orderBy(desc(lines.createdAt));
      } catch (error) {
        console.error('Erro ao listar linhas:', error);
        return [];
      }
    },

    async createLine(lineData: any): Promise<any | null> {
      try {
        if (!lineData.numero) {
          throw new Error('Campo "numero" é obrigatório');
        }
        
        const insertData = {
          organizationId: lineData.organizationId || '550e8400-e29b-41d4-a716-446655440000',
          item: lineData.item || null,
          ddd: lineData.ddd || null,
          numero: lineData.numero,
          nome: lineData.nome || null,
          custoFlutuante: lineData.custoFlutuante || null,
          custoReal: lineData.custoReal || null,
          conta: lineData.conta || null,
          tipo: lineData.tipo || null,
          code: lineData.code || null, // Permitir null
          name: lineData.name || lineData.nome || null,
          description: lineData.description || null,
          status: lineData.status || 'Ativa',
          origin: lineData.origin || null,
          destination: lineData.destination || null,
          route: lineData.route || null,
          validationStatus: lineData.validationStatus || 'Pendente',
          metadata: lineData.metadata || null,
          // WhatsApp
          hasWhatsapp: lineData.hasWhatsapp ?? true,
          whatsappNumber: lineData.whatsappNumber || null,
          createdBy: lineData.createdBy || null,
          updatedBy: lineData.updatedBy || null
        };
        
        const result = await db.insert(lines).values(insertData).returning();
        return result[0];
      } catch (error) {
        console.error('Erro ao criar linha:', error);
        throw error;
      }
    },

    async updateLine(id: string, lineData: any): Promise<any | null> {
      try {
        const updateData = { ...lineData };
        delete (updateData as any).id;
        delete (updateData as any).createdAt;
        delete (updateData as any).updatedAt;
        // Normalizar campos extras não presentes: ignorados se vierem do front com nomes alternativos
        if ((updateData as any).whatsapp) delete (updateData as any).whatsapp;
        if ((updateData as any).telefone) delete (updateData as any).telefone;
        if ((updateData as any).origem) {
          (updateData as any).origin = (updateData as any).origem;
          delete (updateData as any).origem;
        }
        if ((updateData as any).destino) {
          (updateData as any).destination = (updateData as any).destino;
          delete (updateData as any).destino;
        }
        
        const result = await db.update(lines)
          .set(updateData)
          .where(eq(lines.id, id))
          .returning();
        return result[0] || null;
      } catch (error) {
        console.error('Erro ao atualizar linha:', error);
        return null;
      }
    },

    async deleteLine(id: string): Promise<boolean> {
      try {
        await db.delete(lines).where(eq(lines.id, id));
        return true;
      } catch (error) {
        console.error('Erro ao deletar linha:', error);
        return false;
      }
    },

    // ============ IMPORT DO EXCEL ============
    async importLinesFromExcel(linesData: any[], userId: string): Promise<any[]> {
      try {
        const importedLines: any[] = [];
        
        for (const lineData of linesData) {
          const newLine = await this.createLine({
            organizationId: lineData.organizationId || '550e8400-e29b-41d4-a716-446655440000',
            ...lineData,
            createdBy: userId,
            updatedBy: userId,
          });
          if (newLine) {
            importedLines.push(newLine);
          }
        }

        await this.createActivityLog({
          userId,
          action: 'IMPORT_EXCEL',
          entity: 'LINES',
          details: { 
            count: importedLines.length,
            timestamp: new Date().toISOString()
          },
        });

        return importedLines;
      } catch (error) {
        console.error('Erro no import do Excel:', error);
        return [];
      }
    },

    // ============ LOGS DE ATIVIDADE ============
    async createActivityLog(logData: any): Promise<any | null> {
      try {
        const insertData = {
          action: logData.action!,
          userId: logData.userId || null,
          entity: logData.entity || null,
          entityId: logData.entityId || null,
          details: logData.details || null,
          ipAddress: logData.ipAddress || null,
          userAgent: logData.userAgent || null,
        };
        
        const result = await db.insert(activityLogs).values(insertData).returning();
        return result[0];
      } catch (error) {
        console.error('Erro ao criar log de atividade:', error);
        return null;
      }
    },

    async getActivityLogs(userId?: string): Promise<any[]> {
      try {
        if (userId) {
          return await db.select().from(activityLogs)
            .where(eq(activityLogs.userId, userId))
            .orderBy(desc(activityLogs.createdAt));
        }
        return await db.select().from(activityLogs).orderBy(desc(activityLogs.createdAt));
      } catch (error) {
        console.error('Erro ao buscar logs de atividade:', error);
        return [];
      }
    },

    // ============ INICIALIZAÇÃO ============
    async initializeSuperAdmin(): Promise<any | null> {
      try {
        const defaultAdminEmail = process.env.ADMIN_EMAIL || 'admin@linemanager.com';
        const defaultAdminName = process.env.ADMIN_NAME || 'System Administrator';
        const defaultAdminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';
        const resetPasswordOnBoot = process.env.ADMIN_RESET_PASSWORD_ON_BOOT === 'true';

        console.log('👑 Inicializando Super Admin no PostgreSQL...');
        
        const existing = await this.getUserByEmail(defaultAdminEmail);
        
        if (existing) {
          const updateData: any = {
            name: defaultAdminName,
            role: 'super_admin',
            accountStatus: 'approved',
            isActive: true,
            emailVerified: true,
            permissions: ['*'],
            assignedCostCenters: ['*'],
          };

          if (resetPasswordOnBoot) {
            updateData.passwordHash = await this.hashPassword(defaultAdminPassword);
            console.log('🔑 Senha do Super Admin redefinida por ADMIN_RESET_PASSWORD_ON_BOOT=true');
          }

          const updated = await this.updateUser(existing.id, updateData);
          console.log('👑 Super Admin já existe no PostgreSQL');
          return updated || existing;
        }

        console.log('🔧 Criando Super Admin no PostgreSQL...');
        
        const hashedPassword = await this.hashPassword(defaultAdminPassword);
        const admin = await this.createUser({
          organizationId: '550e8400-e29b-41d4-a716-446655440000',
          email: defaultAdminEmail,
          passwordHash: hashedPassword,
          name: defaultAdminName,
          role: 'super_admin',
          accountStatus: 'approved',
          isActive: true,
          emailVerified: true,
          permissions: ['*'],
          assignedCostCenters: ['*'],
        });

        if (admin) {
          console.log('👑 Super Admin criado no PostgreSQL!');
          console.log(`📧 Email: ${defaultAdminEmail}`);
          console.log('🔑 Senha: definida por DEFAULT_ADMIN_PASSWORD (ou valor padrao local)');
          
          await this.createActivityLog({
            userId: admin.id,
            action: 'SYSTEM_INIT',
            entity: 'SYSTEM',
            details: { message: 'Super Admin criado no PostgreSQL' },
          });

          return admin;
        }

        // Se houve conflito durante a criação (ex.: corrida em múltiplas instâncias),
        // tenta recuperar o usuário por email para manter o bootstrap idempotente.
        const adminAfterCreate = await this.getUserByEmail(defaultAdminEmail);
        if (adminAfterCreate) {
          console.log('👑 Super Admin localizado após tentativa de criação.');
          return adminAfterCreate;
        }

        console.error('❌ Falha ao criar/localizar Super Admin no PostgreSQL.');
        return null;
      } catch (error) {
        console.error('❌ Erro ao inicializar Super Admin:', error);
        return null;
      }
    },

    // ============ UTILITÁRIOS ============
    async executeRawSQL(sql: string): Promise<any> {
      try {
        const result = await db.execute(sql);
        return result;
      } catch (error) {
        console.error('❌ Erro ao executar SQL:', error);
        throw error;
      }
    },

    async exportData(): Promise<{ users: any[]; lines: any[]; logs: any[] }> {
      try {
        const [usersData, linesData, logsData] = await Promise.all([
          db.select().from(users),
          db.select().from(lines),
          db.select().from(activityLogs)
        ]);

        return {
          users: usersData.map(u => ({ ...u, passwordHash: '[HIDDEN]' })),
          lines: linesData,
          logs: logsData
        };
      } catch (error) {
        console.error('Erro ao exportar dados:', error);
        return { users: [], lines: [], logs: [] };
      }
    }
  };
}
