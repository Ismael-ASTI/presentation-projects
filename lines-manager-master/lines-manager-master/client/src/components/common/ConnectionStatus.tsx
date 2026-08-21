import React from 'react';
import { useRealTime } from '../../context/RealTimeContext';

interface ConnectionStatusProps {
  className?: string;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ className = '' }) => {
  const { connectionStatus, systemStatus, isOnline, lastUpdate, reconnect } = useRealTime();

  const getStatusColor = () => {
    if (!isOnline) return 'bg-gray-500';
    
    switch (connectionStatus) {
      case 'connected':
        return 'bg-green-500';
      case 'connecting':
        return 'bg-yellow-500';
      case 'disconnected':
        return 'bg-red-500';
      case 'error':
        return 'bg-red-600';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    
    switch (connectionStatus) {
      case 'connected':
        return 'Conectado';
      case 'connecting':
        return 'Conectando...';
      case 'disconnected':
        return 'Desconectado';
      case 'error':
        return 'Erro';
      default:
        return 'Desconhecido';
    }
  };

  const formatLastUpdate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Indicador de status */}
      <div className="flex items-center space-x-2">
        <div 
          className={`w-3 h-3 rounded-full ${getStatusColor()} ${
            connectionStatus === 'connecting' ? 'animate-pulse' : ''
          }`}
          title={`Status: ${getStatusText()}`}
        />
        <span className="text-sm font-medium text-gray-700">
          {getStatusText()}
        </span>
      </div>

      {/* Informações do sistema */}
      {systemStatus && (
        <div className="flex items-center space-x-3 text-xs text-gray-500">
          <span title="Banco de dados">
            DB: {systemStatus.databaseConnected ? '✅' : '❌'}
          </span>
          
          {systemStatus.pendingOperations > 0 && (
            <span title="Operações pendentes" className="text-yellow-600">
              Pendentes: {systemStatus.pendingOperations}
            </span>
          )}
        </div>
      )}

      {/* Última atualização */}
      {lastUpdate && (
        <span className="text-xs text-gray-500" title="Última atualização">
          {formatLastUpdate(lastUpdate)}
        </span>
      )}

      {/* Botão de reconexão */}
      {(connectionStatus === 'disconnected' || connectionStatus === 'error') && isOnline && (
        <button
          onClick={reconnect}
          className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          title="Tentar reconectar"
        >
          Reconectar
        </button>
      )}
    </div>
  );
};

export default ConnectionStatus;
