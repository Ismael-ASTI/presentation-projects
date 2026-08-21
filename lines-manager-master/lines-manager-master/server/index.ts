import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import helmet from 'helmet';
import { registerRoutes } from "./routes";
import { logConcurrentAccess, checkUserStatus } from "./middleware/concurrent-access";
import { databaseStorage } from "./database-storage-railway";
import { errorHandler, notFoundHandler } from "./middleware/error-handler";
import { requestLogger, logger } from "./logger";
import { generalLimiter } from "./middleware/rate-limit";
import { sanitizeInput } from "./middleware/validation";
import { createServer } from "http";
import { WebSocketServer } from 'ws';
import path from 'path';

const app = express();

// Trust proxy for Railway - configuração adequada para development e production
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1); // Trust first proxy (Railway)
} else {
  app.set('trust proxy', false); // No proxy in development
}

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Rate limiting - apenas em production com limites adequados
if (process.env.NODE_ENV === 'production') {
  app.use(generalLimiter);
  logger.info('✅ Rate limiting ativado para produção');
} else {
  logger.info('⚠️ Rate limiting desabilitado para desenvolvimento');
}

// Request logging
app.use(requestLogger);

// CORS configuração adequada para Railway
app.use((req, res, next) => {
  // Em produção no Railway, permitir apenas o domínio da aplicação
  const allowedOrigins = process.env.NODE_ENV === 'production' 
    ? [process.env.RAILWAY_STATIC_URL, process.env.RAILWAY_PUBLIC_DOMAIN].filter(Boolean)
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'];
  
  const origin = req.headers.origin;
  
  // Se não há origin (requisições do mesmo domínio) ou origin está na lista, permitir
  if (!origin || allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin || '*');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Capturar raw body para debugging quando necessário (não altera comportamento padrão)
app.use(express.json({
  limit: '10mb',
  verify: (req: any, _res, buf: Buffer) => {
    try {
      req.rawBody = buf && buf.length ? buf.toString('utf8') : '';
    } catch (e) {
      req.rawBody = undefined;
    }
  }
}));

app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Input sanitization
app.use(sanitizeInput);

// Middleware para logging de acesso simultâneo
app.use(logConcurrentAccess);
app.use(checkUserStatus);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${req.path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      logger.info(logLine);
    }
  });

  next();
});

(async () => {
  logger.info('🚀 Iniciando Line Manager...');
  logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🔧 PORT: ${process.env.PORT || 3001}`);
  
  // Testar conexão com PostgreSQL e inicializar dados
  let retries = 0;
  const maxRetries = 5;
  
  while (retries < maxRetries) {
    try {
      logger.info(`🔌 Tentando conectar ao PostgreSQL (tentativa ${retries + 1}/${maxRetries})...`);
      
      // Inicializar Super Admin com retry
      const admin = await databaseStorage.initializeSuperAdmin();
      
      if (admin) {
        logger.info('✅ Banco de dados PostgreSQL configurado!');
        logger.info(`👑 Super Admin: ${admin.email}`);
        break;
      } else if (retries === maxRetries - 1) {
        logger.warn('⚠️ Falha ao criar Super Admin, mas continuando...');
        break;
      }
      
    } catch (error) {
      retries++;
      logger.error(`❌ Erro no banco PostgreSQL (tentativa ${retries}):`, error as Error);
      
      if (retries >= maxRetries) {
        logger.error('❌ Máximo de tentativas atingido. Continuando sem Super Admin...');
        break;
      }
      
      // Aguardar antes da próxima tentativa
      await new Promise(resolve => setTimeout(resolve, 2000 * retries));
    }
  }

  const server = await registerRoutes(app);

  // Serve static files in production
  if (app.get("env") === "production") {
    app.use(express.static(path.join(process.cwd(), 'dist/public')));
    
    // Catch-all handler for SPA
    app.get('*', (req, res) => {
      res.sendFile(path.join(process.cwd(), 'dist/public/index.html'));
    });
  }

  // Error handling middleware (deve vir por último)
  app.use(notFoundHandler);
  app.use(errorHandler);

  // Use PORT from environment or default
  const port = process.env.PORT || 3001;
  server.listen(port, () => {
    logger.info(`🌐 Servidor rodando na porta ${port}`);
    logger.info(`� Acesse: ${process.env.NODE_ENV === 'production' ? 'https://[seu-dominio].railway.app' : `http://localhost:${port}`}`);
    logger.info('🎯 Sistema pronto para uso!');
  });
})();
