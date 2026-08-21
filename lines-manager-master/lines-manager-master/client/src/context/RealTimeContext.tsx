import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { toast } from '../hooks/use-toast';
import { useWebSocket } from '../hooks/use-websocket';

interface SystemStatus {
  connected: boolean;
  lastSync: string;
  databaseConnected: boolean;
  pendingOperations: number;
}

interface RealTimeContextType {
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  systemStatus: SystemStatus | null;
  isOnline: boolean;
  lastUpdate: string | null;
  forceSync: () => void;
  reconnect: () => void;
}

const RealTimeContext = createContext<RealTimeContextType | undefined>(undefined);

interface RealTimeProviderProps {
  children: ReactNode;
}

export const RealTimeProvider: React.FC<RealTimeProviderProps> = ({ children }) => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const {
    connectionStatus,
    lastMessage,
    sendMessage,
    forceReconnect,
    isConnected
  } = useWebSocket({
    onMessage: (message) => {
      console.log('📨 Mensagem em tempo real:', message);
      
      switch (message.type) {
        case 'connection:established':
          console.log('✅ Conectado ao sistema em tempo real');
          break;
          
        case 'database:updated':
          setLastUpdate(message.timestamp);
          console.log('📊 Dados atualizados:', message.message || 'O banco de dados foi atualizado');
          // Disparar re-fetch dos dados nas páginas
          window.dispatchEvent(new CustomEvent('database:updated', { detail: message.data }));
          break;
          
        case 'user:created':
        case 'user:updated':
        case 'user:deleted':
          setLastUpdate(message.timestamp);
          console.log('👥 Usuários atualizados');
          window.dispatchEvent(new CustomEvent('users:updated', { detail: message.data }));
          break;
          
        case 'line:created':
        case 'line:updated':
        case 'line:deleted':
          setLastUpdate(message.timestamp);
          console.log('📏 Linhas atualizadas');
          window.dispatchEvent(new CustomEvent('lines:updated', { detail: message.data }));
          break;
          
        case 'system:status':
          setSystemStatus(message.data);
          break;
          
        case 'sync:queue:processed':
          console.log(`✅ Sincronização concluída: ${message.data?.processed || 0} operações processadas`);
          break;
          
        case 'connection:reconnected':
          console.log('🔄 Reconectado ao sistema');
          break;
          
        case 'error':
          console.error('❌ Erro do sistema:', message.message);
          break;
      }
    },
    
    onConnect: () => {
      console.log('🔌 Conectado ao sistema em tempo real');
      fetchSystemStatus();
    },
    
    onDisconnect: () => {
      console.log('🔌 Desconectado do sistema em tempo real');
      console.warn('⚠️ Conexão perdida - Tentando reconectar...');
    },
    
    onError: (error) => {
      // Suprimir notificação visível ao usuário sobre erros de conexão.
      // Em desenvolvimento ainda podemos debugar via console.debug.
      if (process.env.NODE_ENV !== 'production') {
        console.debug('WebSocket onError (suprimido):', error);
      }
    }
  });

  // Ref para controlar supressão de logs de erro (aplica-se apenas ao console local)
  const lastConnectionErrorAt = React.useRef<number | null>(null);
  const CONNECTION_ERROR_SUPPRESSION_MS = 60 * 1000; // 1 minuto

  const fetchSystemStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/system/status', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const status = await response.json();
        setSystemStatus(status);
      }
    } catch (error) {
      console.error('Erro ao buscar status do sistema:', error);
    }
  };

  const forceSync = () => {
    sendMessage({
      type: 'sync:force',
      timestamp: new Date().toISOString()
    });
    console.log('🔄 Sincronização forçada solicitada');
  };

  const reconnect = () => {
    forceReconnect();
    console.log('🔄 Tentando reconectar...');
  };

  // Monitorar status online/offline
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('✅ Conexão com a internet restaurada');
      if (!isConnected) {
        forceReconnect();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.warn('⚠️ Sem conexão com a internet');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isConnected, forceReconnect]);

  // Buscar status do sistema periodicamente
  useEffect(() => {
    if (isConnected) {
      fetchSystemStatus();
      const interval = setInterval(fetchSystemStatus, 30000); // A cada 30 segundos
      return () => clearInterval(interval);
    }
  }, [isConnected]);

  const value: RealTimeContextType = {
    connectionStatus,
    systemStatus,
    isOnline,
    lastUpdate,
    forceSync,
    reconnect
  };

  return (
    <RealTimeContext.Provider value={value}>
      {children}
    </RealTimeContext.Provider>
  );
};

export const useRealTime = () => {
  const context = useContext(RealTimeContext);
  if (context === undefined) {
    throw new Error('useRealTime deve ser usado dentro de um RealTimeProvider');
  }
  return context;
};

export default RealTimeProvider;
