// Sistema de sincronização em tempo real para o banco de dados
import { EventEmitter } from 'events';

class DatabaseSyncManager extends EventEmitter {
  private retryQueue: any[] = [];
  private isOnline = true;
  private syncInterval: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  
  constructor() {
    super();
    this.setupConnectionMonitoring();
    this.startSyncLoop();
  }

  // Monitorar conexão com banco
  private setupConnectionMonitoring() {
    setInterval(async () => {
      try {
        // Verificar se banco está online
  const { databaseStorage } = await import('./database-storage-railway');
        
        // Teste rápido de conectividade
        const testResult = await this.testConnection();
        
        if (testResult && !this.isOnline) {
          console.log('✅ Banco de dados reconectado!');
          this.isOnline = true;
          this.reconnectAttempts = 0;
          this.emit('connection:restored');
          await this.processRetryQueue();
        } else if (!testResult && this.isOnline) {
          console.log('❌ Banco de dados desconectado!');
          this.isOnline = false;
          this.emit('connection:lost');
        }
      } catch (error) {
        if (this.isOnline) {
          console.log('❌ Erro na conexão com banco:', error);
          this.isOnline = false;
          this.emit('connection:lost');
        }
      }
    }, 5000); // Verificar a cada 5 segundos
  }

  // Testar conexão
  private async testConnection(): Promise<boolean> {
    try {
  const { databaseStorage } = await import('./database-storage-railway');
      
      // Tentar uma operação simples
      if (typeof databaseStorage.healthCheck === 'function') {
        return await databaseStorage.healthCheck();
      }
      
      // Fallback: tentar buscar usuários
      const users = await databaseStorage.getAllUsers();
      return Array.isArray(users);
    } catch (error) {
      return false;
    }
  }

  // Loop de sincronização
  private startSyncLoop() {
    this.syncInterval = setInterval(async () => {
      if (this.isOnline && this.retryQueue.length > 0) {
        await this.processRetryQueue();
      }
    }, 10000); // Processar fila a cada 10 segundos
  }

  // Processar fila de retry
  private async processRetryQueue() {
    console.log(`🔄 Processando ${this.retryQueue.length} operações pendentes...`);
    
    const failedOperations = [];
    
    for (const operation of this.retryQueue) {
      try {
        await this.executeOperation(operation);
        console.log(`✅ Operação ${operation.type} executada com sucesso`);
        this.emit('operation:success', operation);
      } catch (error) {
        console.log(`❌ Falha na operação ${operation.type}:`, error);
        operation.retryCount = (operation.retryCount || 0) + 1;
        
        if (operation.retryCount < 3) {
          failedOperations.push(operation);
        } else {
          console.log(`❌ Operação ${operation.type} descartada após 3 tentativas`);
          this.emit('operation:failed', operation);
        }
      }
    }
    
    this.retryQueue = failedOperations;
  }

  // Executar operação
  private async executeOperation(operation: any) {
  const { databaseStorage } = await import('./database-storage-railway');
    
    switch (operation.type) {
      case 'CREATE_USER':
        return await databaseStorage.createUser(operation.data);
      case 'UPDATE_USER':
        return await databaseStorage.updateUser(operation.id, operation.data);
      case 'DELETE_USER':
        return await databaseStorage.deleteUser(operation.id);
      case 'CREATE_LINE':
        return await databaseStorage.createLine(operation.data);
      case 'UPDATE_LINE':
        return await databaseStorage.updateLine(operation.id, operation.data);
      case 'DELETE_LINE':
        return await databaseStorage.deleteLine(operation.id);
      case 'BULK_CREATE_LINES':
        return await databaseStorage.bulkCreateLines(operation.data);
      default:
        throw new Error(`Operação desconhecida: ${operation.type}`);
    }
  }

  // Métodos públicos para operações sincronizadas
  async syncCreateUser(userData: any) {
    return this.performSyncOperation('CREATE_USER', userData);
  }

  async syncUpdateUser(id: string, userData: any) {
    return this.performSyncOperation('UPDATE_USER', userData, id);
  }

  async syncDeleteUser(id: string) {
    return this.performSyncOperation('DELETE_USER', null, id);
  }

  async syncCreateLine(lineData: any) {
    return this.performSyncOperation('CREATE_LINE', lineData);
  }

  async syncUpdateLine(id: string, lineData: any) {
    return this.performSyncOperation('UPDATE_LINE', lineData, id);
  }

  async syncDeleteLine(id: string) {
    return this.performSyncOperation('DELETE_LINE', null, id);
  }

  async syncBulkCreateLines(linesData: any[]) {
    return this.performSyncOperation('BULK_CREATE_LINES', linesData);
  }

  // Executar operação sincronizada
  private async performSyncOperation(type: string, data: any, id?: string) {
    const operation = {
      id: id || `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      timestamp: new Date().toISOString(),
      retryCount: 0
    };

    try {
      if (this.isOnline) {
        // Tentar executar imediatamente
        const result = await this.executeOperation(operation);
        console.log(`✅ Operação ${type} executada em tempo real`);
        this.emit('operation:realtime', { operation, result });
        return result;
      } else {
        // Adicionar à fila para execução posterior
        this.retryQueue.push(operation);
        console.log(`⏳ Operação ${type} adicionada à fila (offline)`);
        this.emit('operation:queued', operation);
        return { queued: true, operationId: operation.id };
      }
    } catch (error) {
      // Adicionar à fila em caso de erro
      this.retryQueue.push(operation);
      console.log(`❌ Operação ${type} falhou, adicionada à fila:`, error);
      this.emit('operation:error', { operation, error });
      throw error;
    }
  }

  // Status do sistema
  getStatus() {
    return {
      isOnline: this.isOnline,
      queueLength: this.retryQueue.length,
      reconnectAttempts: this.reconnectAttempts,
      lastCheck: new Date().toISOString()
    };
  }

  // Limpar recursos
  destroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    this.removeAllListeners();
  }
}

// Singleton instance
export const syncManager = new DatabaseSyncManager();

// WebSocket integration para notificações em tempo real
export class WebSocketManager {
  private clients: Set<any> = new Set();

  addClient(ws: any) {
    this.clients.add(ws);
    
    // Enviar status inicial
    ws.send(JSON.stringify({
      type: 'connection:status',
      data: syncManager.getStatus()
    }));
  }

  removeClient(ws: any) {
    this.clients.delete(ws);
  }

  broadcast(message: any) {
    const messageStr = JSON.stringify(message);
    this.clients.forEach(client => {
      try {
        if (client.readyState === 1) { // WebSocket.OPEN
          client.send(messageStr);
        }
      } catch (error) {
        console.log('Erro ao enviar WebSocket:', error);
        this.clients.delete(client);
      }
    });
  }
}

export const wsManager = new WebSocketManager();

// Configurar eventos do sync manager
syncManager.on('connection:restored', () => {
  wsManager.broadcast({
    type: 'database:connected',
    timestamp: new Date().toISOString()
  });
});

syncManager.on('connection:lost', () => {
  wsManager.broadcast({
    type: 'database:disconnected',
    timestamp: new Date().toISOString()
  });
});

syncManager.on('operation:success', (operation) => {
  wsManager.broadcast({
    type: 'operation:completed',
    data: operation,
    timestamp: new Date().toISOString()
  });
});

syncManager.on('operation:realtime', ({ operation, result }) => {
  wsManager.broadcast({
    type: 'data:updated',
    operation: operation.type,
    data: result,
    timestamp: new Date().toISOString()
  });
});

console.log('🔄 Sistema de sincronização em tempo real inicializado');
