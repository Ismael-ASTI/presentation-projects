import { api } from './api-new';
import { User, Session, LoginCredentials } from '@/types';

const SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 hours

export class AuthService {
  static async login(credentials: LoginCredentials): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const result = await api.login(credentials.username, credentials.password);
      
      if (result.user && result.token) {
        // Store token in localStorage
        localStorage.setItem('auth_token', result.token);
        
        const session: Session = {
          userId: result.user.id,
          username: result.user.email,
          role: result.user.role,
          expiresAt: Date.now() + SESSION_DURATION,
        };

        localStorage.setItem('session', JSON.stringify(session));
        
        return { success: true, user: result.user };
      }
      
      return { success: false, error: 'Credenciais inválidas' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  }

  static async logout(): Promise<void> {
    try {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('session');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return null;
      
      const user = await api.verifyToken();
      return user;
    } catch (error) {
      // Token invalid, clear session
      this.logout();
      return null;
    }
  }

  static getCurrentSession(): Session | null {
    try {
      const sessionData = localStorage.getItem('session');
      if (!sessionData) return null;
      
      const session = JSON.parse(sessionData);
      return session;
    } catch (error) {
      return null;
    }
  }

  static isAuthenticated(): boolean {
    const session = this.getCurrentSession();
    const token = localStorage.getItem('auth_token');
    return !!(session && token && Date.now() < session.expiresAt);
  }

  static hasRole(role: 'admin' | 'user'): boolean {
    const session = this.getCurrentSession();
    if (!session) return false;
    
    // Super admin tem acesso a tudo
    if (session.role === 'super_admin') return true;
    
    // Admin e super_admin podem acessar áreas de admin
    if (role === 'admin') {
      return ['admin', 'super_admin'].includes(session.role);
    }
    
    return session.role === role;
  }

  static isAdmin(): boolean {
    const session = this.getCurrentSession();
    return session ? ['admin', 'super_admin'].includes(session.role) : false;
  }

  static extendSession(): void {
    const session = this.getCurrentSession();
    if (session) {
      session.expiresAt = Date.now() + SESSION_DURATION;
      localStorage.setItem('session', JSON.stringify(session));
    }
  }
}
