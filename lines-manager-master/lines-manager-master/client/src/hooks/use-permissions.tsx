import { useAuth } from '@/components/auth/auth-provider';

export function usePermissions() {
  const { user } = useAuth();
  
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const isUser = user?.role === 'user';
  const isSuperAdmin = user?.role === 'super_admin';
  
  const canCreate = isAdmin;
  const canEdit = isAdmin;
  const canDelete = isAdmin;
  const canView = isAdmin || isUser;
  const canManageUsers = isAdmin;
  const canAccessLogs = isAdmin;
  const canBackupRestore = isAdmin;
  const canAccessAdmin = isAdmin;
  const canExport = isAdmin || isUser; // Usuários comuns podem exportar
  const canImport = isAdmin; // Apenas admins podem importar
  
  return {
    user,
    isAdmin,
    isUser,
    isSuperAdmin,
    canCreate,
    canEdit,
    canDelete,
    canView,
    canManageUsers,
    canAccessLogs,
    canBackupRestore,
    canAccessAdmin,
    canExport,
    canImport,
  };
}
