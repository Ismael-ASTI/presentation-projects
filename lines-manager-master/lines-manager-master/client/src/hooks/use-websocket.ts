import { useEffect, useRef, useCallback, useState } from 'react';

interface WebSocketMessage {
  type: string;
  timestamp: string;
  message?: string;
  data?: any;
}

interface WebSocketHookConfig {
  url?: string;
  autoReconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
}

export const useWebSocket = (config: WebSocketHookConfig = {}) => {
  const {
    url: providedUrl,
    autoReconnect = true,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
    onMessage,
    onConnect,
    onDisconnect,
  onError
  } = config;

  // Escolhe ws ou wss automaticamente com base no protocolo da página
  const defaultProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const defaultUrl = `${defaultProtocol}//${window.location.host}`;
  const url = providedUrl || defaultUrl;

  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const shouldConnect = useRef(true);

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      setConnectionStatus('connecting');
      ws.current = new WebSocket(url);

      ws.current.onopen = () => {
        if (process.env.NODE_ENV !== 'production') console.log('🔌 WebSocket conectado');
        setConnectionStatus('connected');
        setReconnectAttempts(0);
        onConnect?.();
      };

      ws.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          if (process.env.NODE_ENV !== 'production') console.log('📨 Mensagem WebSocket recebida:', message);
          setLastMessage(message);
          onMessage?.(message);
        } catch (error) {
          if (process.env.NODE_ENV !== 'production') console.error('❌ Erro ao processar mensagem WebSocket:', error);
        }
      };

      ws.current.onclose = () => {
        if (process.env.NODE_ENV !== 'production') console.log('🔌 WebSocket desconectado');
        setConnectionStatus('disconnected');
        onDisconnect?.();

        // Auto-reconectar se habilitado e dentro do limite de tentativas
        if (autoReconnect && shouldConnect.current && reconnectAttempts < maxReconnectAttempts) {
          // Exponential backoff com jitter
          const base = Math.max(500, reconnectInterval);
          const exp = Math.min(30000, base * Math.pow(2, reconnectAttempts));
          const jitter = Math.floor(Math.random() * 1000);
          const delay = Math.min(exp + jitter, 30000);
          if (process.env.NODE_ENV !== 'production') console.log(`🔄 Tentando reconectar em ${delay}ms (tentativa ${reconnectAttempts + 1}/${maxReconnectAttempts})`);
          reconnectTimeoutRef.current = setTimeout(() => {
            setReconnectAttempts(prev => prev + 1);
            connect();
          }, delay);
        }
      };

      ws.current.onerror = (error) => {
        // Log apenas em desenvolvimento para não poluir consoles em produção
        if (process.env.NODE_ENV !== 'production') console.error('❌ Erro WebSocket:', error);
        setConnectionStatus('error');
        try {
          onError?.(error);
        } catch (e) {
          // Não permitir que o handler do usuário quebre a reconexão
          if (process.env.NODE_ENV !== 'production') console.error('Erro no onError handler:', e);
        }
      };

    } catch (error) {
      console.error('❌ Erro ao criar conexão WebSocket:', error);
      setConnectionStatus('error');
    }
  }, [url, autoReconnect, reconnectInterval, maxReconnectAttempts, reconnectAttempts, onMessage, onConnect, onDisconnect, onError]);

  const disconnect = useCallback(() => {
    shouldConnect.current = false;
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
    
    setConnectionStatus('disconnected');
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
      return true;
    } else {
      console.warn('⚠️ WebSocket não está conectado. Mensagem não enviada:', message);
      return false;
    }
  }, []);

  const forceReconnect = useCallback(() => {
    setReconnectAttempts(0);
    disconnect();
    shouldConnect.current = true;
    setTimeout(connect, 1000);
  }, [connect, disconnect]);

  useEffect(() => {
    shouldConnect.current = true;
    connect();

    return () => {
      shouldConnect.current = false;
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    connectionStatus,
    lastMessage,
    reconnectAttempts,
    sendMessage,
    forceReconnect,
    disconnect,
    isConnected: connectionStatus === 'connected',
    isConnecting: connectionStatus === 'connecting'
  };
};

export default useWebSocket;
