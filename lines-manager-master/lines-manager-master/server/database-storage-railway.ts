// Database storage - Railway PostgreSQL com retry automático
// Sistema roda exclusivamente no Railway com reconexão automática

console.log('🚀 SISTEMA RAILWAY PERMANENTE COM RETRY');
console.log('=======================================');

// Verificar configuração obrigatória
if (!process.env.DATABASE_URL) {
  console.error('❌ ERRO CRÍTICO: DATABASE_URL não configurada!');
  console.error('🔧 Configure a variável DATABASE_URL no arquivo .env');
  process.exit(1);
}

console.log('✅ DATABASE_URL: Configurada');
console.log('✅ Modo: Railway PostgreSQL EXCLUSIVO');
console.log('🔄 Retry automático: Ativado');

let databaseStorage: any = null;
let connectionAttempts = 0;
const MAX_RETRY_ATTEMPTS = 10;
const RETRY_DELAY = 5000; // 5 segundos

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function initializeRailwayStorage(): Promise<any> {
  if (databaseStorage) return databaseStorage;

  console.log('🗄️ Inicializando Railway PostgreSQL...');
  
  while (connectionAttempts < MAX_RETRY_ATTEMPTS) {
    connectionAttempts++;
    
    try {
      console.log(`🔌 Tentativa ${connectionAttempts}/${MAX_RETRY_ATTEMPTS} - Conectando Railway...`);
      
      // Importar PostgreSQL storage
  const { createPostgreSQLStorage } = await import('./database-postgres');
      const postgresStorage = createPostgreSQLStorage();
      
      // Teste de conexão simples
      await postgresStorage.getAllUsers();
      
      console.log('✅ PostgreSQL Railway conectado com sucesso!');
      
      databaseStorage = {
        ...postgresStorage,
        
        // Identificação do sistema
        async getSystemStatus() {
          return {
            database: 'railway-postgresql',
            location: 'railway-cloud',
            mode: 'permanent-only',
            persistent: true,
            mock: false,
            connectionAttempts,
            timestamp: new Date().toISOString()
          };
        },
        
        // Override para logging específico do Railway
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
          // Usar createLine em loop se bulkCreateLines não existir
          const results = [];
          for (const lineData of linesData) {
            const result = await postgresStorage.createLine(lineData);
            results.push(result);
          }
          console.log('✅ [RAILWAY] Todas as linhas salvas na nuvem permanentemente!');
          return results;
        }
      };
      
      console.log('🎯 Sistema Railway PostgreSQL inicializado!');
      console.log('💾 TODAS as operações serão PERMANENTES na nuvem!');
      return databaseStorage;
      
    } catch (error) {
      console.error(`❌ Tentativa ${connectionAttempts} falhou:`, String(error));
      
      if (connectionAttempts >= MAX_RETRY_ATTEMPTS) {
        console.error('❌ ERRO CRÍTICO: Esgotadas tentativas de conexão Railway');
        console.error('🔧 Possíveis soluções:');
        console.error('   1. Verificar conectividade de rede');
        console.error('   2. Verificar se DATABASE_URL está correta');
        console.error('   3. Verificar se Railway está online');
        console.error('   4. Tentar de outra rede (hotspot móvel)');
        console.error('   5. Aguardar e reiniciar o servidor');
        
        // Em modo Railway-only, não usar fallback
        process.exit(1);
      } else {
        console.log(`⏳ Aguardando ${RETRY_DELAY/1000}s antes da próxima tentativa...`);
        await sleep(RETRY_DELAY);
      }
    }
  }
  
  throw new Error('Máximo de tentativas de conexão excedido');
}

// Proxy para inicialização automática
const databaseStorageProxy = new Proxy({} as any, {
  get(target, prop) {
    if (!databaseStorage) {
      return async (...args: any[]) => {
        const storage = await initializeRailwayStorage();
        return storage[prop](...args);
      };
    }
    return databaseStorage[prop];
  }
});

export { databaseStorageProxy as databaseStorage, initializeRailwayStorage };
