import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthService } from '@/lib/auth';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const checkSession = async () => {
      try {
        // Primeiro, verificar se há token no localStorage
        const token = localStorage.getItem('auth_token');
        if (!token) {
          setUser(null);
          setIsLoading(false);
          return;
        }

        const currentUser = await AuthService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Erro ao verificar sessão:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSession();
  }, []);

  useEffect(() => {
    if (!user) return;

    // Set up session extension on activity
    const extendSession = () => {
      if (AuthService.isAuthenticated()) {
        AuthService.extendSession();
      }
    };

    // Extend session on user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, extendSession, true);
    });

    // Check session validity every minute
    const sessionCheck = setInterval(async () => {
      const currentUser = await AuthService.getCurrentUser();
      if (!currentUser) {
        // Session expired
        setUser(null);
      }
    }, 60000);

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, extendSession, true);
      });
      clearInterval(sessionCheck);
    };
  }, [!!user]);

  const login = async (username: string, password: string) => {
    const result = await AuthService.login({ username, password });
    if (result.success && result.user) {
      setUser(result.user);
    }
    return result;
  };

  const logout = async () => {
    await AuthService.logout();
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
