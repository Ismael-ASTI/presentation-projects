import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRealTime } from '@/context/RealTimeContext';

/**
 * Hook para automaticamente atualizar dados quando receber notificações em tempo real
 */
export const useRealTimeSync = () => {
  const queryClient = useQueryClient();
  const { lastUpdate } = useRealTime();

  // Invalidar todas as queries quando receber uma atualização geral
  const handleDatabaseUpdate = useCallback(() => {
    console.log('🔄 Atualizando todos os dados devido a mudança no banco');
    queryClient.invalidateQueries();
  }, [queryClient]);

  // Invalidar queries específicas de usuários
  const handleUsersUpdate = useCallback(() => {
    console.log('👥 Atualizando dados de usuários');
    queryClient.invalidateQueries({ queryKey: ['users'] });
    queryClient.invalidateQueries({ queryKey: ['user'] });
  }, [queryClient]);

  // Invalidar queries específicas de linhas
  const handleLinesUpdate = useCallback(() => {
    console.log('📏 Atualizando dados de linhas');
    queryClient.invalidateQueries({ queryKey: ['lines'] });
    queryClient.invalidateQueries({ queryKey: ['line'] });
  }, [queryClient]);

  useEffect(() => {
    // Registrar listeners para eventos de atualização
    window.addEventListener('database:updated', handleDatabaseUpdate);
    window.addEventListener('users:updated', handleUsersUpdate);
    window.addEventListener('lines:updated', handleLinesUpdate);

    return () => {
      // Limpar listeners
      window.removeEventListener('database:updated', handleDatabaseUpdate);
      window.removeEventListener('users:updated', handleUsersUpdate);
      window.removeEventListener('lines:updated', handleLinesUpdate);
    };
  }, [handleDatabaseUpdate, handleUsersUpdate, handleLinesUpdate]);

  // Método para forçar atualização manual
  const forceRefresh = useCallback(() => {
    console.log('🔄 Forçando atualização manual de todos os dados');
    queryClient.invalidateQueries();
  }, [queryClient]);

  return {
    lastUpdate,
    forceRefresh
  };
};

export default useRealTimeSync;
