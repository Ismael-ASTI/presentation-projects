import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/components/auth/auth-provider';

export function useRealTimeUpdates() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  
  useEffect(() => {
    if (!isAuthenticated) return;

    // Atualizar dados a cada 5 segundos para usuários logados
    const interval = setInterval(() => {
      // Invalidar queries para forçar recarregamento
      queryClient.invalidateQueries({ queryKey: ['lines'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['logs'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    }, 5000); // 5 segundos

    return () => clearInterval(interval);
  }, [queryClient, isAuthenticated]);

  // Função para forçar atualização manual
  const forceUpdate = () => {
    queryClient.invalidateQueries();
  };

  return { forceUpdate };
}
