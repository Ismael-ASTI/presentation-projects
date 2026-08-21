// Database storage - Sistema híbrido inteligente com Railway preferencial
// Railway permanente + fallback temporário + retry automático

console.log('🚀 SISTEMA HÍBRIDO INTELIGENTE');
console.log('==============================');

// Verificar configurações
const hasRailwayUrl = !!process.env.DATABASE_URL;
const useMockData = process.env.USE_MOCK_DATA === 'true';
const railwayRetryEnabled = process.env.RAILWAY_RETRY_ENABLED !== 'false';

console.log('✅ DATABASE_URL:', hasRailwayUrl ? 'Configurada' : 'Não encontrada');
console.log('🧪 Mock data:', useMockData ? 'Habilitado' : 'Desabilitado');
console.log('🔄 Railway retry:', railwayRetryEnabled ? 'Ativado' : 'Desativado');

let databaseStorage: any = null;
let connectionAttempts = 0;
let usingMockFallback = false;
let railwayRetryTimer: NodeJS.Timeout | null = null;
const MAX_RETRY_ATTEMPTS = 5;
const RETRY_DELAY = 3000;
const BACKGROUND_RETRY_INTERVAL = parseInt(process.env.RAILWAY_RETRY_INTERVAL || '300000');

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function tryRailwayConnection(): Promise<any> {
  if (!hasRailwayUrl) {
    throw new Error('DATABASE_URL não configurada');
  }

  console.log('🔌 Tentando conexão Railway PostgreSQL...');
  
  try {
    const { createPostgreSQLStorage } = await import('./database-postgres-optimized.js');
    const postgresStorage = createPostgreSQLStorage();
    
    await postgresStorage.getAllUsers();
    
    console.log('✅ Railway PostgreSQL conectado!');
    return postgresStorage;
    
  } catch (error) {
    console.log('❌ Falha na conexão Railway:', String(error));
    throw error;
  }
}

async function initializeMockStorage(): Promise<any> {
  console.log('🧪 Inicializando Mock Storage (temporário)...');
  
  try {
    const mockDatabaseStorage: any = {} as any;
    if (mockDatabaseStorage && typeof mockDatabaseStorage.initialize === 'function') {
      await mockDatabaseStorage.initialize();
    }
    
    console.log('✅ Mock Storage inicializado (dados temporários)');
    console.log('💡 Dados serão migrados quando Railway conectar');
    
    return mockDatabaseStorage;
  } catch (error) {
    console.error('❌ Erro ao inicializar Mock Storage:', error);
    throw error;
  }
}

function createRailwayWrapper(postgresStorage: any) {
  return {
    ...postgresStorage,
    
    async getSystemStatus() {
      return {
        database: 'railway-postgresql',
        location: 'railway-cloud',
        mode: 'permanent',
        persistent: true,
        mock: false,
        connectionAttempts,
        timestamp: new Date().toISOString()
      };
    },
    
    async createLine(lineData: any) {
      console.log('📞 [RAILWAY] Criando linha permanente:', lineData.nome || lineData.numero);
      return await postgresStorage.createLine(lineData);
    },
    
    async createUser(userData: any) {
      console.log('👤 [RAILWAY] Criando usuário permanente:', userData.email);
      return await postgresStorage.createUser(userData);
    },
    
    async bulkCreateLines(linesData: any[]) {
      console.log('📊 [RAILWAY] Importando', linesData.length, 'linhas PERMANENTEMENTE');
      
      if (postgresStorage.bulkCreateLines) {
        return await postgresStorage.bulkCreateLines(linesData);
      } else {
        const results = [];
        for (const lineData of linesData) {
          const result = await postgresStorage.createLine(lineData);
          results.push(result);
        }
        return results;
      }
    }
  };
}

function createMockWrapper(mockStorage: any) {
  return {
    
    async getSystemStatus() {
      return {
        database: 'mock-storage',
        location: 'local-memory',
        mode: 'temporary-fallback',
        persistent: false,
        mock: true,
        railwayRetryActive: !!railwayRetryTimer,
        connectionAttempts,
        timestamp: new Date().toISOString()
      };
    },
    
    async createLine(lineData: any) {
      console.log('📞 [MOCK] Criando linha temporária:', lineData.nome || lineData.numero);
      console.log('💡 Será migrada para Railway quando conectar');
      return await mockStorage.createLine(lineData);
    },
    
    async createUser(userData: any) {
      console.log('👤 [MOCK] Criando usuário temporário:', userData.email);
      console.log('💡 Será migrado para Railway quando conectar');
      return await mockStorage.createUser(userData);
    },
    
    async bulkCreateLines(linesData: any[]) {
      console.log('📊 [MOCK] Importando', linesData.length, 'linhas TEMPORARIAMENTE');
      console.log('💡 Serão migradas para Railway quando conectar');
      
      const results = [];
      for (const lineData of linesData) {
        const result = await mockStorage.createLine(lineData);
        results.push(result);
      }
      return results;
    }
  };
}

async function startBackgroundRailwayRetry() {
  if (!railwayRetryEnabled || !hasRailwayUrl || railwayRetryTimer) {
    return;
  }
  
  console.log(`🔄 Iniciando retry automático Railway (${BACKGROUND_RETRY_INTERVAL/1000/60} min)`);
  
  railwayRetryTimer = setInterval(async () => {
    if (usingMockFallback) {
      console.log('🔄 Tentando reconectar Railway...');
      
      try {
        const railwayStorage = await tryRailwayConnection();
        
        console.log('🎉 Railway reconectado! Migrando dados...');
        
        if (databaseStorage && usingMockFallback) {
          await migrateFromMockToRailway(databaseStorage, railwayStorage);
        }
        
        databaseStorage = createRailwayWrapper(railwayStorage);
        usingMockFallback = false;
        connectionAttempts = 0;
        
        console.log('✅ Sistema migrado para Railway permanente!');
        
        if (railwayRetryTimer) {
          clearInterval(railwayRetryTimer);
          railwayRetryTimer = null;
        }
        
      } catch (error) {
        console.log('🔄 Railway ainda indisponível, continuando com mock...');
      }
    }
  }, BACKGROUND_RETRY_INTERVAL);
}

async function migrateFromMockToRailway(mockStorage: any, railwayStorage: any) {
  try {
    console.log('📊 Iniciando migração de dados...');
    
    const users = await mockStorage.getAllUsers();
    console.log(`👤 Migrando ${users.length} usuários...`);
    
    for (const user of users) {
      try {
        await railwayStorage.createUser(user);
      } catch (error) {
        console.log(`⚠️ Usuário ${user.email} já existe no Railway`);
      }
    }
    
    const lines = await mockStorage.getAllLines();
    console.log(`📞 Migrando ${lines.length} linhas...`);
    
    for (const line of lines) {
      try {
        await railwayStorage.createLine(line);
      } catch (error) {
        console.log(`⚠️ Linha ${line.numero} pode já existir no Railway`);
      }
    }
    
    console.log('✅ Migração completa!');
    
  } catch (error) {
    console.error('❌ Erro na migração:', error);
  }
}

async function initializeHybridStorage(): Promise<any> {
  if (databaseStorage) return databaseStorage;

  console.log('🗄️ Inicializando sistema híbrido...');
  
  if (useMockData) {
    console.log('🧪 Mock data forçado via .env');
    const mockStorage = await initializeMockStorage();
    databaseStorage = createMockWrapper(mockStorage);
    usingMockFallback = true;
    
    await startBackgroundRailwayRetry();
    return databaseStorage;
  }
  
  if (hasRailwayUrl) {
    for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
      connectionAttempts = attempt;
      
      try {
        console.log(`🔌 Tentativa ${attempt}/${MAX_RETRY_ATTEMPTS} - Railway...`);
        
        const railwayStorage = await tryRailwayConnection();
        databaseStorage = createRailwayWrapper(railwayStorage);
        usingMockFallback = false;
        
        console.log('✅ Sistema iniciado com Railway PostgreSQL!');
        return databaseStorage;
        
      } catch (error) {
        console.log(`❌ Tentativa ${attempt} falhou:`, String(error));
        
        if (attempt < MAX_RETRY_ATTEMPTS) {
          console.log(`⏳ Aguardando ${RETRY_DELAY/1000}s...`);
          await sleep(RETRY_DELAY);
        }
      }
    }
    
    console.log('⚠️ Railway indisponível, usando Mock temporário...');
  }
  
  const mockStorage = await initializeMockStorage();
  databaseStorage = createMockWrapper(mockStorage);
  usingMockFallback = true;
  
  await startBackgroundRailwayRetry();
  return databaseStorage;
}

const databaseStorageProxy = new Proxy({} as any, {
  get(target, prop) {
    if (!databaseStorage) {
      return async (...args: any[]) => {
        const storage = await initializeHybridStorage();
        return storage[prop](...args);
      };
    }
    return databaseStorage[prop];
  }
});

/**
 * DEPRECATED: Use `database-storage-railway`.
 */
export { databaseStorageProxy as databaseStorage };
