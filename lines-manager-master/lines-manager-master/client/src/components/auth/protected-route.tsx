import { useAuth } from './auth-provider';
import { useLocation } from 'wouter';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user' | 'super_admin';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  const hasRequiredRole = (userRole: string, required: string) => {
    if (required === 'admin') {
      // Admin e super_admin podem acessar áreas de admin
      return ['admin', 'super_admin'].includes(userRole);
    }
    return userRole === required;
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation('/login');
    } else if (!isLoading && isAuthenticated && requiredRole && !hasRequiredRole(user?.role || '', requiredRole)) {
      setLocation('/dashboard');
    }
  }, [isAuthenticated, isLoading, requiredRole, user?.role, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requiredRole && !hasRequiredRole(user?.role || '', requiredRole)) {
    return null;
  }

  return <>{children}</>;
}
