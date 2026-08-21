import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-new';
import type { User, Line, ActivityLog, LineFilters, LineFormData } from '@/types';
import { useToast } from '@/hooks/use-toast';

// Query Keys
export const QUERY_KEYS = {
  users: ['users'] as const,
  lines: (filters?: Partial<LineFilters>) => ['lines', filters] as const,
  line: (id: string) => ['lines', id] as const,
  logs: ['activity-logs'] as const,
  stats: ['dashboard', 'stats'] as const,
} as const;

// Users Hooks
export const useUsers = () => {
  return useQuery({
    queryKey: QUERY_KEYS.users,
    queryFn: api.getUsers,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: api.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users });
      toast({ title: 'Usuário criado com sucesso!' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Erro ao criar usuário', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) => 
      api.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users });
      toast({ title: 'Usuário atualizado com sucesso!' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Erro ao atualizar usuário', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: api.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users });
      toast({ title: 'Usuário excluído com sucesso!' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Erro ao excluir usuário', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });
};

// Lines Hooks
export const useLines = (filters?: Partial<LineFilters>) => {
  return useQuery({
    queryKey: QUERY_KEYS.lines(filters),
    queryFn: () => api.getLines(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useLine = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.line(id),
    queryFn: () => api.getLineById(id),
    enabled: !!id,
  });
};

export const useCreateLine = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: api.createLine,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lines'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stats });
      toast({ title: 'Linha criada com sucesso!' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Erro ao criar linha', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });
};

export const useUpdateLine = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<LineFormData> }) => 
      api.updateLine(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['lines'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.line(id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stats });
      toast({ title: 'Linha atualizada com sucesso!' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Erro ao atualizar linha', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });
};

export const useDeleteLine = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: api.deleteLine,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lines'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stats });
      toast({ title: 'Linha excluída com sucesso!' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Erro ao excluir linha', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });
};

// Activity Logs Hook
export const useActivityLogs = () => { 
  return useQuery({
    queryKey: QUERY_KEYS.logs,
    queryFn: api.getActivityLogs,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// Dashboard Stats Hook
export const useDashboardStats = () => {
  return useQuery({
    queryKey: QUERY_KEYS.stats,
    queryFn: api.getDashboardStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Import/Export Hooks
export const useImportLines = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (lines: any[]) => api.importLinesFromExcelData(lines),
    onSuccess: (result: { success: boolean; imported: number; errors: string[] }) => {
      queryClient.invalidateQueries({ queryKey: ['lines'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stats });
      toast({ 
        title: 'Importação concluída!', 
        description: `${result.imported} linhas importadas` 
      });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Erro na importação', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });
};

export const useExportLines = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: api.exportLinesToExcel,
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `linhas-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({ title: 'Exportação concluída!' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Erro na exportação', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });
};
