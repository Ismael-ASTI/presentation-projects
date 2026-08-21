import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from 'ws';
import { databaseStorage } from "./database-storage-railway";
import { wsManager } from "./sync-manager";
import { type User } from "./schema";
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import './types'; // Import global types
import './railway-hotfix'; // Railway production hotfix
import { authLimiter, uploadLimiter } from "./middleware/rate-limit";
import { validate, authSchemas, userSchemas, lineSchemas } from "./middleware/validation";
import { asyncHandler } from "./middleware/error-handler";
import { AuthenticationError, AuthorizationError, NotFoundError } from "./errors";
import { logger } from "./logger";
import { db } from "./database";
import { sql } from "drizzle-orm";
import { productionAuthHelper } from "./railway-hotfix";

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

function sanitizeUser(user: any) {
  if (!user) return user;
  const safeUser = JSON.parse(JSON.stringify(user));
  delete safeUser.passwordHash;
  delete safeUser.password_hash;
  delete safeUser.password;
  return safeUser;
}

function sanitizeUsers(users: any[]) {
  return Array.isArray(users) ? users.map(sanitizeUser) : [];
}

// Helper para obter database storage inicializado
async function getDB() {
  return databaseStorage;
}

// Helper para verificar se req.user existe
const getUserId = (req: any): string => {
  if (!req.user?.id) {
    throw new Error('User not authenticated');
  }
  return req.user.id;
};

// Middleware de autenticação
const authenticateToken = asyncHandler(async (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    throw new AuthenticationError('Token de acesso necessário');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const db = await getDB(); const user = await db.getUser(decoded.userId);
    if (!user) {
      throw new AuthenticationError('Token inválido');
    }
    req.user = user;
    
    logger.debug('User authenticated', {
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AuthenticationError('Token inválido');
    }
    throw error;
  }
});

// Middleware para verificar se é admin ou super_admin
const requireAdmin = (req: any, res: any, next: any) => {
  const allowedRoles = ['admin', 'super_admin'];
  if (!allowedRoles.includes(req.user.role)) {
    throw new AuthorizationError('Privilégios de administrador necessários');
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check route - público e robusto
  app.get('/api/health', async (req, res) => {
    try {
      // Verificar conexão com banco
      const dbHealth = await db.execute(sql`SELECT 1 as test`);
      
      res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        database: 'connected',
        environment: process.env.NODE_ENV || 'development'
      });
    } catch (error) {
      // Mantem HTTP 200 para evitar derrubar a instancia por instabilidade temporaria do banco.
      res.json({
        status: 'DEGRADED',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Rota de teste simples
  app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend funcionando!', timestamp: new Date().toISOString() });
  });

  // Rota de teste de criação removida em produção por segurança
  if (process.env.NODE_ENV !== 'production' && process.env.ENABLE_DEBUG_ENDPOINTS === 'true') {
    app.post('/api/test-line', authenticateToken, async (req, res) => {
      try {
        const testData = {
          organizationId: '550e8400-e29b-41d4-a716-446655440000',
          numero: req.body.numero || '123456789',
          nome: req.body.nome || 'TESTE',
          ddd: req.body.ddd || '11',
          custoFlutuante: req.body.custoFlutuante || '0.10',
          custoReal: req.body.custoReal || '0.08',
          tipo: req.body.tipo || 'teste',
          status: 'Ativa'
        };
        const line = await databaseStorage.createLine(testData);
        if (!line) return res.status(500).json({ message: 'Falha ao criar linha de teste' });
        res.status(201).json({ message: 'Linha de teste criada', line });
      } catch (error) {
        res.status(500).json({ message: 'Erro no teste', error: error instanceof Error ? error.message : 'Erro desconhecido' });
      }
    });
  }

  // Rota de migração manual (apenas para ambientes não-prod e com flag habilitada)
  if (process.env.NODE_ENV !== 'production' && process.env.ALLOW_MANUAL_MIGRATIONS === 'true') {
    app.post('/api/migrate/whatsapp', authenticateToken, requireAdmin, async (req, res) => {
      try {
        await db.execute(sql`ALTER TABLE lines ADD COLUMN IF NOT EXISTS has_whatsapp boolean DEFAULT true;`);
        await db.execute(sql`ALTER TABLE lines ADD COLUMN IF NOT EXISTS whatsapp_number varchar(20);`);
        res.json({ success: true, message: 'Migração aplicada com sucesso' });
      } catch (error) {
        res.status(500).json({ success: false, message: 'Falha na migração', error: error instanceof Error ? error.message : 'Erro' });
      }
    });
  }

  // Rotas de autenticação
  app.post('/api/auth/login', 
    authLimiter,
    validate({ body: authSchemas.login }),
    asyncHandler(async (req: Request, res: Response) => {
      const { email, password } = req.body;
      const normalizedEmail = String(email || '').trim().toLowerCase();
      
      logger.audit('LOGIN_ATTEMPT', {
        email: normalizedEmail,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      });
      
      try {
        // Tentar autenticação via banco de dados primeiro
        const result = await databaseStorage.authenticateUser(normalizedEmail, password);
        
        if (result) {
          logger.audit('LOGIN_SUCCESS', {
            userId: result.user.id,
            email: result.user.email,
            ip: req.ip,
          });

          res.json({
            user: sanitizeUser(result.user),
            token: result.token,
          });
          return;
        }
      } catch (error) {
        logger.error('Database auth failed, trying Railway fallback');
        
        // Railway fallback para credenciais específicas
        const fallbackUser = await productionAuthHelper.validateCredentials(email, password);
        if (fallbackUser) {
          const token = productionAuthHelper.generateToken(fallbackUser.id);
          
          logger.audit('LOGIN_SUCCESS_RAILWAY_FALLBACK', {
            userId: fallbackUser.id,
            email: fallbackUser.email,
            ip: req.ip,
          });

          res.json({
            user: sanitizeUser(fallbackUser),
            token: token
          });
          return;
        }
      }
      
      // Se chegou aqui, credenciais são inválidas
      logger.security('Failed login attempt', {
        email: normalizedEmail,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      });
      throw new AuthenticationError('Credenciais inválidas');
    })
  );

  app.post('/api/auth/logout', authenticateToken, async (req, res) => {
    try {
      // Marcar usuário como offline (remover se necessário, pois não temos isOnline na nova estrutura)
      res.json({ message: 'Logout realizado com sucesso' });
    } catch (error) {
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  app.get('/api/auth/me', authenticateToken, (req, res) => {
    res.json({ user: sanitizeUser(req.user) });
  });

  app.get('/api/auth/verify', authenticateToken, (req, res) => {
    res.json(sanitizeUser(req.user));
  });

  // Rotas de usuários
  app.get('/api/users', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const users = await databaseStorage.getAllUsers();
      res.json(sanitizeUsers(users));
    } catch (error) {
      res.status(500).json({ message: 'Erro ao buscar usuários' });
    }
  });

  app.post('/api/users', authenticateToken, requireAdmin, async (req, res) => {
    try {
      if (req.body?.email) {
        req.body.email = String(req.body.email).trim().toLowerCase();
      }

      if (req.body?.role === 'super_admin' && req.user?.role !== 'super_admin') {
        return res.status(403).json({ message: 'Apenas super admin pode criar outro super admin' });
      }

      if (!req.body?.password || String(req.body.password).trim().length < 6) {
        return res.status(400).json({ message: 'Senha é obrigatória e deve ter pelo menos 6 caracteres' });
      }

      // Usuários criados no painel administrativo devem sair aptos para login.
      req.body.accountStatus = req.body?.accountStatus || 'approved';
      req.body.isActive = req.body?.isActive ?? true;
      req.body.emailVerified = req.body?.emailVerified ?? true;

      // Hash da senha se fornecida
      if (req.body.password) {
        req.body.passwordHash = await databaseStorage.hashPassword(req.body.password);
        delete req.body.password; // Remove a senha em texto plano
      }
      
      const db = await getDB(); const user = await db.createUser(req.body);
      if (!user || !req.user) {
        return res.status(500).json({ message: 'Erro ao criar usuário' });
      }
      
      await databaseStorage.createActivityLog({
        userId: getUserId(req),
        action: 'CREATE_USER',
        entity: 'USER',
        entityId: user.id,
        details: `Usuário criado: ${user.email}`,
      });
      res.status(201).json(sanitizeUser(user));
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      res.status(500).json({ 
        message: 'Erro ao criar usuário', 
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  });

  app.put('/api/users/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
      if (req.body?.email) {
        req.body.email = String(req.body.email).trim().toLowerCase();
      }

      const targetUser = await databaseStorage.getUser(req.params.id);
      if (!targetUser) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      if (targetUser.role === 'super_admin' && req.user?.role !== 'super_admin') {
        return res.status(403).json({ message: 'Apenas super admin pode alterar outro super admin' });
      }

      if (req.body?.role === 'super_admin' && req.user?.role !== 'super_admin') {
        return res.status(403).json({ message: 'Apenas super admin pode promover usuário para super admin' });
      }

      if (req.body?.password) {
        req.body.passwordHash = await databaseStorage.hashPassword(req.body.password);
        delete req.body.password;
      }

      const db = await getDB(); const user = await db.updateUser(req.params.id, req.body);
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }
      await databaseStorage.createActivityLog({
        userId: getUserId(req),
        action: 'UPDATE_USER',
        entity: 'USER',
        entityId: user.id,
        details: `Usuário atualizado: ${user.email}`,
      });
      res.json(sanitizeUser(user));
    } catch (error) {
      res.status(500).json({ message: 'Erro ao atualizar usuário' });
    }
  });

  app.delete('/api/users/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const targetUser = await databaseStorage.getUser(req.params.id);
      if (!targetUser) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      if (targetUser.role === 'super_admin' && req.user?.role !== 'super_admin') {
        return res.status(403).json({ message: 'Apenas super admin pode excluir outro super admin' });
      }

      const deleted = await databaseStorage.deleteUser(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }
      await databaseStorage.createActivityLog({
        userId: getUserId(req),
        action: 'DELETE_USER',
        entity: 'USER',
        entityId: req.params.id,
        details: `Usuário excluído`,
      });
      res.json({ message: 'Usuário excluído com sucesso' });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao excluir usuário' });
    }
  });

  // Rotas de linhas
  app.get('/api/lines', authenticateToken, async (req, res) => {
    try {
      const { search, status } = req.query;
      const lines = await databaseStorage.getAllLines({ 
        search: search as string, 
        status: status as string 
      });

      // Padronizar resposta para o cliente esperar um objeto com metadados
      const response = {
        lines,
        total: Array.isArray(lines) ? lines.length : 0,
        page: 1,
        limit: lines ? lines.length : 0
      };

      res.json(response);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao buscar linhas' });
    }
  });

  app.get('/api/lines/:id', authenticateToken, async (req, res) => {
    try {
      const line = await databaseStorage.getLine(req.params.id);
      if (!line) {
        return res.status(404).json({ message: 'Linha não encontrada' });
      }
      res.json(line);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao buscar linha' });
    }
  });

  // Rota específica para importação em lote (Excel)
  app.post('/api/lines/bulk-import', authenticateToken, requireAdmin, async (req, res) => {
    try {
      console.log('=== IMPORTAÇÃO EM LOTE ===');
      // Aceitar tanto { lines: [...] } quanto body sendo diretamente um array
      let lines: any = undefined;
      if (Array.isArray(req.body)) {
        lines = req.body;
      } else if (req.body && Array.isArray((req.body as any).lines)) {
        lines = (req.body as any).lines;
      } else {
        // Log info para ajudar a diagnosticar payloads inesperados
          try {
            const bodyType = Object.prototype.toString.call(req.body);
            const preview = typeof req.body === 'object' ? JSON.stringify(req.body, Object.keys(req.body).slice(0, 20), 2) : String(req.body);
            console.error('bulk-import payload unexpected type:', bodyType, 'preview:', preview.slice(0, 1000));
            // Log rawBody capturado pelo express.json verify (se disponível)
            try {
              if ((req as any).rawBody) {
                console.error('bulk-import rawBody (first 2000 chars):', String((req as any).rawBody).slice(0, 2000));
              }
            } catch (e) {
              // ignore
            }
            console.error('bulk-import headers:', JSON.stringify(req.headers, null, 2));
          } catch (e) {
            console.error('bulk-import payload preview failed', e);
          }
      }

      // Caso lines venha como string JSON (ex: { lines: "[...]" }), tentar desserializar
      if (!Array.isArray(lines)) {
        if (req.body && typeof (req.body as any).lines === 'string') {
          try {
            const parsed = JSON.parse((req.body as any).lines);
            if (Array.isArray(parsed)) {
              lines = parsed;
            }
          } catch (e) {
            // ignore parse error
          }
        }
      }

      // Se ainda não temos um array, tentar desserializar o rawBody (caso o cliente tenha enviado
      // um JSON stringificado duas vezes, ou com Content-Type inesperado). Isso aumenta tolerância
      // para payloads recebidos por proxys/clients que alteram headers.
      if (!Array.isArray(lines) && (req as any).rawBody) {
        try {
          const raw = (req as any).rawBody;
          if (typeof raw === 'string' && raw.length > 0) {
            // Exemplos esperados: '[{...}]' ou '{"lines":[{...}]}'
            try {
              const parsedRaw = JSON.parse(raw);
              if (Array.isArray(parsedRaw)) {
                lines = parsedRaw;
              } else if (parsedRaw && Array.isArray(parsedRaw.lines)) {
                lines = parsedRaw.lines;
              }
            } catch (e) {
              // Se raw não for JSON completo, mas pode conter 'lines=' (form-encoded), tentar extrair
              const match = String(raw).match(/lines=([^&]*)/);
              if (match && match[1]) {
                try {
                  const decoded = decodeURIComponent(match[1]);
                  const parsed2 = JSON.parse(decoded);
                  if (Array.isArray(parsed2)) lines = parsed2;
                } catch (e2) { /* ignore */ }
              }
            }
          }
        } catch (e) {
          // ignore
        }
      }

      if (!Array.isArray(lines)) {
        return res.status(400).json({ message: 'Dados devem ser um array de linhas' });
      }
      
      const results = {
        success: 0,
        errors: [] as string[],
        total: lines.length
      };
      
      for (let i = 0; i < lines.length; i++) {
        const lineData = lines[i];
        
        try {
          // Garantir dados obrigatórios
          const normalizedData = {
            organizationId: lineData.organizationId || '550e8400-e29b-41d4-a716-446655440000',
            ddd: lineData.ddd || '',
            numero: lineData.numero || lineData.item || `linha_${i + 1}`,
            nome: lineData.nome || 'Nome não informado',
            custoFlutuante: lineData.custoFlutuante || '',
            custoReal: lineData.custoReal || '',
            conta: lineData.conta || '',
            tipo: lineData.tipo || '',
            status: (lineData.status === 'ativa' ? 'Ativa' : lineData.status) || 'Ativa',
            // hasWhatsapp: lineData.hasWhatsapp ?? true,
            // whatsappNumber: lineData.whatsappNumber || '',
            description: lineData.description || '',
          };
          
          console.log(`Criando linha ${i + 1}:`, JSON.stringify(normalizedData, null, 2));
          
          const line = await databaseStorage.createLine(normalizedData);
          if (line) {
            results.success++;
          } else {
            results.errors.push(`Linha ${i + 1}: Falha na criação (retorno null)`);
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
          console.error(`Erro na linha ${i + 1}:`, errorMsg);
          results.errors.push(`Linha ${i + 1}: ${errorMsg}`);
        }
      }
      
      console.log('Resultado da importação:', results);
      
      res.json({
        message: `Importação concluída: ${results.success}/${results.total} linhas criadas`,
        ...results
      });
      
    } catch (error) {
      console.error('Erro na importação em lote:', error);
      res.status(500).json({
        message: 'Erro na importação em lote',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  });

  app.post('/api/lines', authenticateToken, async (req, res) => {
    try {
      console.log('Creating line with data:', JSON.stringify(req.body, null, 2)); // Debug log
      
      // Garantir que organizationId existe
      if (!req.body.organizationId) {
        req.body.organizationId = '550e8400-e29b-41d4-a716-446655440000';
      }
      
      // Normalizar status
      if (req.body.status === 'ativa') {
        req.body.status = 'Ativa';
      }
      
      const line = await databaseStorage.createLine(req.body);
      if (!line) {
        console.error('Failed to create line: databaseStorage.createLine returned null');
        return res.status(500).json({ message: 'Erro ao criar linha - falha na criação' });
      }
      
      await databaseStorage.createActivityLog({
        userId: getUserId(req),
        action: 'CREATE_LINE',
        entity: 'LINE',
        entityId: line.id,
        details: `Linha criada: ${line.nome}`,
      });
      res.status(201).json(line);
    } catch (error) {
      console.error('Error creating line:', error); // Debug log
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error details:', errorMessage);
      res.status(500).json({ 
        message: 'Erro ao criar linha', 
        error: errorMessage,
        details: error instanceof Error ? error.stack : 'No stack trace available'
      });
    }
  });

  app.put('/api/lines/:id', authenticateToken, async (req, res) => {
    try {
      const line = await databaseStorage.updateLine(req.params.id, req.body);
      if (!line) {
        return res.status(404).json({ message: 'Linha não encontrada' });
      }
      await databaseStorage.createActivityLog({
        userId: getUserId(req),
        action: 'UPDATE_LINE',
        entity: 'LINE',
        entityId: line.id,
        details: `Linha atualizada: ${line.nome}`,
      });
      res.json(line);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao atualizar linha' });
    }
  });

  app.delete('/api/lines/:id', authenticateToken, async (req, res) => {
    try {
      const deleted = await databaseStorage.deleteLine(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: 'Linha não encontrada' });
      }
      await databaseStorage.createActivityLog({
        userId: getUserId(req),
        action: 'DELETE_LINE',
        entity: 'LINE',
        entityId: req.params.id,
        details: `Linha excluída`,
      });
      res.json({ message: 'Linha excluída com sucesso' });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao excluir linha' });
    }
  });

  // Rota administrativa: apagar todas as linhas (apenas admin/super_admin)
  app.delete('/api/lines', authenticateToken, requireAdmin, async (req, res) => {
    try {
      console.log('=== ROTA: DELETE /api/lines — apagando todas as linhas. Solicitante:', req.user?.id);
      await databaseStorage.executeRawSQL('DELETE FROM lines');

      await databaseStorage.createActivityLog({
        userId: getUserId(req),
        action: 'DELETE_ALL_LINES',
        entity: 'LINES',
        details: { message: 'Todas as linhas removidas via API', timestamp: new Date().toISOString() }
      });

      res.json({ success: true, message: 'Todas as linhas foram excluídas' });
    } catch (error) {
      console.error('Erro ao excluir todas as linhas:', error);
      res.status(500).json({ success: false, message: 'Falha ao excluir todas as linhas', error: error instanceof Error ? error.message : 'Erro desconhecido' });
    }
  });

  // Rota administrativa: deletar várias linhas por IDs (apenas admin/super_admin)
  app.post('/api/lines/bulk-delete', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const ids = (req.body && Array.isArray((req.body as any).ids)) ? (req.body as any).ids : null;
      if (!ids) return res.status(400).json({ message: 'Campo ids é obrigatório e deve ser um array' });

      const results: { deleted: number; errors: string[] } = { deleted: 0, errors: [] };
      for (const id of ids) {
        try {
          const ok = await databaseStorage.deleteLine(id);
          if (ok) results.deleted++; else results.errors.push(String(id));
        } catch (e) {
          results.errors.push(String(id));
        }
      }

      await databaseStorage.createActivityLog({
        userId: getUserId(req),
        action: 'BULK_DELETE_LINES',
        entity: 'LINES',
        details: { count: results.deleted, errors: results.errors }
      });

      res.json({ success: true, deleted: results.deleted, errors: results.errors });
    } catch (error) {
      console.error('Erro no bulk-delete:', error);
      res.status(500).json({ success: false, message: 'Erro ao deletar linhas em massa' });
    }
  });

  // Rota administrativa: validar várias linhas por IDs (apenas admin/super_admin)
  app.post('/api/lines/bulk-validate', authenticateToken, requireAdmin, async (req, res) => {
    try {
      // Debug: log do payload recebido para diagnosticar problemas com formatos enviados pelo cliente
      try {
        const bodyType = Object.prototype.toString.call(req.body);
        const preview = typeof req.body === 'object' ? JSON.stringify(req.body, Object.keys(req.body).slice(0, 20), 2) : String(req.body);
        logger.debug('bulk-validate received', { bodyType, preview: preview && preview.length > 1000 ? preview.slice(0,1000) : preview, headers: req.headers });
      } catch (e) {
        logger.debug('bulk-validate received: failed to stringify body', { err: e });
      }

      // Tolerância: aceitar vários formatos de payloads (array direto, { ids: [...] }, ids stringified, variações de nome)
      let ids: string[] | null = null;
      let validationStatus: string | null = null;
      let note: string = '';

      // Caso body seja um array de ids diretamente
      if (Array.isArray(req.body)) {
        ids = req.body as any;
      } else if (req.body) {
        // ids pode vir como array em req.body.ids
        if (Array.isArray((req.body as any).ids)) {
          ids = (req.body as any).ids;
        } else if (typeof (req.body as any).ids === 'string') {
          try { ids = JSON.parse((req.body as any).ids); } catch (e) { /* ignore */ }
        } else if ((req.body as any).ids && typeof (req.body as any).ids === 'object') {
          // Aceitar formato onde ids vem como um map { id1: true, id2: false }
          try {
            const obj = (req.body as any).ids;
            ids = Object.keys(obj).filter(k => !!obj[k]);
          } catch (e) {
            // ignore parsing error and keep ids as null
          }
        }

        // se ainda não temos ids, verificar se body é um objeto contendo stringified JSON
        if (!ids && typeof req.body === 'string') {
          try {
            const parsed = JSON.parse(req.body);
            if (Array.isArray(parsed)) ids = parsed;
            else if (Array.isArray(parsed.ids)) ids = parsed.ids;
          } catch (e) { /* ignore */ }
        }

        // validar diferentes chaves para validationStatus
        validationStatus = (req.body && ((req.body as any).validationStatus || (req.body as any).validationstatus || (req.body as any).status)) ? String((req.body as any).validationStatus || (req.body as any).validationstatus || (req.body as any).status) : null;
        note = req.body && (req.body as any).note ? String((req.body as any).note) : '';
      }

      // Filtrar apenas UUIDs válidos para evitar enviar valores como "0" ao Postgres
      try {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        const originalIds = Array.isArray(ids) ? [...ids] : (ids ? [String(ids)] : []);
        const before = originalIds.length;
        const kept = (ids as string[] | null) ? (ids as string[]).filter(id => typeof id === 'string' && uuidRegex.test(id)) : [];
        const after = kept.length;
        const discardedIds = originalIds.filter(id => !uuidRegex.test(String(id)));
        ids = kept;
        if (before !== after) {
          // Enriquecer log com metadados do request para facilitar diagnostico de origem (ip, user-agent, forwarded-for)
          const requestMeta = {
            before,
            after,
            discardedIds,
            headers: req.headers,
            ip: req.ip,
            remoteAddress: req.socket?.remoteAddress,
            // garantir string ou undefined para compatibilidade de tipos
            forwardedFor: Array.isArray(req.headers['x-forwarded-for']) ? String(req.headers['x-forwarded-for'][0]) : (req.headers['x-forwarded-for'] ? String(req.headers['x-forwarded-for']) : undefined),
            userAgent: req.get && req.get('User-Agent') ? String(req.get('User-Agent')) : undefined,
            requestId: req.headers && (req.headers['x-request-id'] || req.headers['x-correlation-id']) ? String(req.headers['x-request-id'] || req.headers['x-correlation-id']) : undefined,
          };
          logger.warn('bulk-validate: some ids were filtered out because they are not valid UUIDs', requestMeta);
        }
        // Se todos os ids foram descartados, retornar 400 com detalhes para diagnóstico
        if ((ids == null || ids.length === 0) && originalIds.length > 0) {
          return res.status(400).json({ message: 'Nenhum id válido após filtro', discardedIds, received: originalIds });
        }
      } catch (e) {
        // ignore filtering errors
      }

      if (!ids || !validationStatus) {
        // Preparar preview seguro do body para retorno e logs
        let safePreview: any = null;
        try {
          safePreview = typeof req.body === 'object' ? JSON.parse(JSON.stringify(req.body, Object.keys(req.body).slice(0, 50))) : String(req.body).slice(0, 2000);
        } catch (e) { safePreview = String(req.body).slice(0, 2000); }

        // Log mais detalhado para rastrear origem de requests malformados
        const missingMeta = {
          received: safePreview,
          headers: req.headers,
          ip: req.ip,
          remoteAddress: req.socket?.remoteAddress,
          forwardedFor: Array.isArray(req.headers['x-forwarded-for']) ? String(req.headers['x-forwarded-for'][0]) : (req.headers['x-forwarded-for'] ? String(req.headers['x-forwarded-for']) : undefined),
          userAgent: req.get && req.get('User-Agent') ? String(req.get('User-Agent')) : undefined,
          requestId: req.headers && (req.headers['x-request-id'] || req.headers['x-correlation-id']) ? String(req.headers['x-request-id'] || req.headers['x-correlation-id']) : undefined,
        };
        logger.warn('bulk-validate missing required fields', missingMeta);
        return res.status(400).json({ message: 'Campo ids e validationStatus são obrigatórios', received: safePreview });
      }

      const results: { updated: number; errors: string[] } = { updated: 0, errors: [] };

      for (const id of ids) {
        try {
          const updatePayload: any = { validationStatus };
          if (note) updatePayload.description = (updatePayload.description || '') + `\n[Validação em massa]: ${note}`;
          // registrar validado por e data se houver req.user
          if (req.user && req.user.id) {
            // registrar usuário que atualizou a validação no campo updatedBy (campo mapeado)
            updatePayload.updatedBy = req.user.id;
          }

          const updated = await databaseStorage.updateLine(id, updatePayload);
          if (updated) results.updated++; else results.errors.push(String(id));
        } catch (e) {
          results.errors.push(String(id));
        }
      }

      await databaseStorage.createActivityLog({
        userId: getUserId(req),
        action: 'BULK_VALIDATE_LINES',
        entity: 'LINES',
        details: { count: results.updated, errors: results.errors, validationStatus, note }
      });

      res.json({ success: true, updated: results.updated, errors: results.errors });
    } catch (error) {
      console.error('Erro no bulk-validate:', error);
      res.status(500).json({ success: false, message: 'Erro ao validar linhas em massa' });
    }
  });

  // Rotas de logs
  app.get('/api/logs', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { userId } = req.query;
      const logs = await databaseStorage.getActivityLogs(userId as string);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao buscar logs' });
    }
  });

  // Rotas de backup/restore
  app.get('/api/backup', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const data = await databaseStorage.exportData();
      await databaseStorage.createActivityLog({
        userId: getUserId(req),
        action: 'EXPORT_DATA',
        entity: 'SYSTEM',
        details: 'Backup de dados exportado',
      });
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="backup-${new Date().toISOString().split('T')[0]}.json"`);
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao exportar backup' });
    }
  });

  app.post('/api/restore', authenticateToken, requireAdmin, async (req, res) => {
    try {
      await databaseStorage.importData(req.body);
      await databaseStorage.createActivityLog({
        userId: getUserId(req),
        action: 'IMPORT_DATA',
        entity: 'SYSTEM',
        details: 'Dados restaurados a partir de backup',
      });
      res.json({ message: 'Dados restaurados com sucesso' });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao restaurar dados' });
    }
  });

  // Rotas de dashboard
  app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
    try {
      const lines = await databaseStorage.getAllLines();
      const users = await databaseStorage.getAllUsers();
      
      // agrupar por custo (custoFlutuante preferencialmente, cai para custoReal)
      const countsByCusto: Record<string, number> = {};
      const normalizeCustoKey = (val: any) => {
        if (val === null || val === undefined) return 'Sem Custo';
        let s = String(val).trim();
        if (s === '') return 'Sem Custo';
        // remover símbolos comuns de moeda e espaços redundantes
        s = s.replace(/[₹$€£,]/g, '').replace(/\s+/g, ' ').trim();
        // normalizar caixa e remover acentos para agrupar nomes semelhantes
        try {
          // remover diacríticos (compatível com targets mais antigos)
          s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        } catch (e) {
          // fallback simples
          s = s;
        }
        return s;
      };

      for (const l of lines) {
        const raw = l.custoFlutuante ?? l.custoReal ?? null;
        const key = normalizeCustoKey(raw);
        countsByCusto[key] = (countsByCusto[key] || 0) + 1;
      }

      const isActive = (st: any) => {
        if (!st && st !== 0) return false;
        try {
          const s = String(st).toLowerCase();
          return s.includes('ativa') || s.includes('ativo') || s === 'active' || s === 'on';
        } catch (e) { return false; }
      };

      const isInactive = (st: any) => {
        if (!st && st !== 0) return false;
        try {
          const s = String(st).toLowerCase();
          return s.includes('inativa') || s.includes('inativo') || s === 'inactive' || s === 'off';
        } catch (e) { return false; }
      };

      const stats = {
        totalLines: lines.length,
        activeLines: lines.filter((line: any) => isActive(line.status)).length,
        inactiveLines: lines.filter((line: any) => isInactive(line.status)).length,
        withWhatsapp: lines.filter((line: any) => !!line.hasWhatsapp).length,
        totalUsers: users.length,
        activeUsers: users.filter((user: any) => user.isActive).length,
        countsByCusto
      };
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao obter estatísticas' });
    }
  });

  // Rotas de activity logs
  app.get('/api/activity-logs', authenticateToken, requireAdmin, async (req, res) => {
    try {
  const { userId } = req.query;
  const logs = await databaseStorage.getActivityLogs(userId as string);
  res.json(logs);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao obter logs de atividade' });
    }
  });

  const httpServer = createServer(app);
  
  // Configurar WebSocket para updates em tempo real
  const wss = new WebSocketServer({ server: httpServer });
  
  wss.on('connection', (ws, req) => {
    logger.info('Nova conexão WebSocket estabelecida', { remoteAddress: req.socket?.remoteAddress });
    wsManager.addClient(ws);

    ws.on('close', (code, reason) => {
      // Registrar como DEBUG para evitar poluição dos logs em produção
      logger.debug('Conexão WebSocket fechada', { code, reason: String(reason) });
      wsManager.removeClient(ws);
    });

    ws.on('error', (error) => {
      // Erros devem ser registrados em nível error com contexto
      const errObj = (error instanceof Error) ? error : undefined;
      logger.error('Erro WebSocket', errObj, { err: (error instanceof Error) ? (error.stack || error.message) : String(error) });
      wsManager.removeClient(ws);
    });
    
    // Enviar status inicial
    ws.send(JSON.stringify({
      type: 'connection:established',
      timestamp: new Date().toISOString(),
      message: 'Conectado ao sistema Line Manager'
    }));
  });
  
  // Rota para status do sistema
  app.get('/api/system/status', authenticateToken, async (req, res) => {
    try {
      const status = await databaseStorage.getSystemStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({
        error: 'Erro ao obter status do sistema',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  });
  
  // Rota administrativa para executar SQL (apenas super_admin)
  app.post('/api/admin/execute-sql', authenticateToken, async (req, res) => {
    try {
      // Verificar se é super_admin
      if (!req.user || req.user.role !== 'super_admin') {
        return res.status(403).json({ message: 'Apenas Super Admin pode executar SQL direto' });
      }

      // Bloquear em produção a menos que explicitamente habilitado
      if (process.env.NODE_ENV === 'production' && process.env.ALLOW_RAW_SQL !== 'true') {
        return res.status(403).json({ message: 'Execução de SQL desabilitada em produção' });
      }

      const { sql: sqlQuery } = req.body;
      
      if (!sqlQuery) {
        return res.status(400).json({ message: 'Query SQL é obrigatória' });
      }

      console.log('Executando SQL direto:', sqlQuery);
      
  const result = await databaseStorage.executeRawSQL(sqlQuery);
      
      await databaseStorage.createActivityLog({
        userId: getUserId(req),
        action: 'EXECUTE_SQL',
        entity: 'DATABASE',
        details: { query: sqlQuery },
      });

      res.json({ 
        success: true, 
        result: result,
        message: 'SQL executado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao executar SQL:', error);
      res.status(500).json({ 
        message: 'Erro ao executar SQL',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  });

  return httpServer;
}
