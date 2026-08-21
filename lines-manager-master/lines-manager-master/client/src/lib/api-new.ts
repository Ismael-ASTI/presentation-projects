import type { User, Line, ActivityLog, LineFilters, LineFormData } from '../types';

// Configurar API_BASE baseado no ambiente
// Preferir VITE_API_URL quando definido; em produção usar relativa
const DEV_API = (typeof window !== 'undefined' && (import.meta as any)?.env?.VITE_API_URL) || 'http://localhost:3002';
const API_BASE = import.meta.env.PROD ? '' : DEV_API;

console.log('🌐 API_BASE configurado:', API_BASE, 'Environment:', import.meta.env.MODE);

interface LoginResponse {
  user: User;
  token: string;
}

interface LinesResponse {
  lines: Line[];
  total: number;
  page: number;
  limit: number;
}

interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

class ApiError extends Error {
  constructor(public message: string, public status: number, public code?: string) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiClient {
  private getHeaders() {
    const token = localStorage.getItem('auth_token');
    // Tentar extrair uma versão/build identificador do ambiente (Vite + VITE_CLIENT_VERSION)
    const clientVersion = (typeof window !== 'undefined' && (import.meta as any)?.env?.VITE_CLIENT_VERSION) || (import.meta as any)?.env?.MODE || 'unknown';
    return {
      'Content-Type': 'application/json',
      'x-client-version': String(clientVersion),
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      // tratar 401 de forma centralizada: remover token e redirecionar para login
      if (response.status === 401) {
        try { localStorage.removeItem('auth_token'); } catch (e) {}
        // redirecionar para a tela de login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        throw new ApiError('Unauthorized', 401);
      }

      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new ApiError(error.message || 'Request failed', response.status, error.code);
    }

    return response.json();
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<LoginResponse> {
    const url = `${API_BASE}/api/auth/login`;
    console.log('Tentando fazer login para URL:', url); // Debug
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      console.log('Response status:', response.status); // Debug
      console.log('Response ok:', response.ok); // Debug

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Erro de comunicação' }));
        console.error('Erro de resposta:', error); // Debug
        
        // Tratar diferentes formatos de resposta de erro
        let errorMessage = 'Login failed';
        
        if (error.error && error.error.message) {
          // Formato: { success: false, error: { message: "..." } }
          errorMessage = error.error.message;
        } else if (error.message) {
          // Formato: { message: "..." }
          errorMessage = error.message;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Login successful:', data); // Debug
      return data;
      
    } catch (fetchError) {
      console.error('Erro de fetch:', fetchError); // Debug
      
      // Tratar erros específicos de SSL/Network
      if (fetchError instanceof TypeError && fetchError.message.includes('fetch')) {
        throw new Error('Erro de conexão com o servidor. Verifique sua conexão de internet.');
      }
      
      // Tratar outros erros de rede
      if (fetchError instanceof Error) {
        if (fetchError.message.includes('certificate') || fetchError.message.includes('SSL')) {
          throw new Error('Erro de certificado SSL. Tente acessar o site diretamente primeiro.');
        }
        throw new Error(fetchError.message);
      }
      
      throw new Error('Erro desconhecido ao fazer login');
    }
  }

  async register(email: string, password: string, name: string): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    return response.json();
  }

  async verifyToken(): Promise<User> {
    const response = await fetch(`${API_BASE}/api/auth/verify`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Token verification failed');
    }

    return response.json();
  }

  // Lines endpoints
  async getLines(filters?: Partial<LineFilters>): Promise<LinesResponse> {
    const params = new URLSearchParams();
    
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.hasWhatsapp !== undefined) params.append('hasWhatsapp', filters.hasWhatsapp.toString());
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await fetch(`${API_BASE}/api/lines?${params.toString()}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch lines');
    }

    return response.json();
  }

  async getLineById(id: string): Promise<Line> {
    const response = await fetch(`${API_BASE}/api/lines/${id}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch line');
    }

    return response.json();
  }

  async createLine(data: LineFormData): Promise<Line> {
    const response = await fetch(`${API_BASE}/api/lines`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create line');
    }

    return response.json();
  }

  async updateLine(id: string, data: Partial<LineFormData>): Promise<Line> {
    const response = await fetch(`${API_BASE}/api/lines/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update line');
    }

    return response.json();
  }

  async deleteLine(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/api/lines/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete line');
    }
  }

  async exportLinesToExcel(): Promise<Blob> {
    const response = await fetch(`${API_BASE}/api/lines/export`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to export lines');
    }

    return response.blob();
  }

  async deleteAllLines(): Promise<{ success: boolean; message?: string }> {
    const response = await fetch(`${API_BASE}/api/lines`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ message: 'Failed to delete all lines' }));
      throw new Error(err.message || 'Failed to delete all lines');
    }

    return response.json();
  }

  async bulkDeleteLines(ids: string[]): Promise<{ success: boolean; deleted: number; errors: string[] }> {
    const response = await fetch(`${API_BASE}/api/lines/bulk-delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(localStorage.getItem('auth_token') ? { Authorization: `Bearer ${localStorage.getItem('auth_token')}` } : {})
      },
      body: JSON.stringify({ ids })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ message: 'Failed to bulk delete lines' }));
      throw new Error(err.message || 'Failed to bulk delete lines');
    }

    return response.json();
  }

  async bulkValidateLines(ids: string[], payload: { validationStatus: string; note?: string }): Promise<{ success: boolean; updated: number; errors: string[] }> {
    const url = `${API_BASE}/api/lines/bulk-validate`;
    try {
      // Garantir que ids enviado é sempre um array de strings (coerce quando caller passar um map/obj)
      let safeIds: string[] = [];
      if (Array.isArray(ids)) safeIds = ids;
      else if (ids && typeof ids === 'object') safeIds = Object.keys(ids).filter(k => (ids as any)[k]);
      else if (typeof ids === 'string') safeIds = [ids];
      
      // Filtrar apenas UUIDs válidos para evitar erros no servidor (ex: "0", índices de arrays)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const originalCount = safeIds.length;
      safeIds = safeIds.filter(id => typeof id === 'string' && uuidRegex.test(id));
      if (safeIds.length !== originalCount) {
        console.warn('[api] bulkValidateLines: filtered out non-UUID ids', { originalCount, kept: safeIds.length });
      }

      const payloadBody = { ids: safeIds, validationStatus: payload.validationStatus, note: payload.note };
      console.debug('[api] bulkValidateLines sending payload:', payloadBody);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('auth_token') ? { Authorization: `Bearer ${localStorage.getItem('auth_token')}` } : {})
        },
        body: JSON.stringify(payloadBody)
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ message: 'Failed to bulk validate lines' }));
        throw new Error(err.message || 'Failed to bulk validate lines');
      }

      return response.json();
    } catch (err) {
      console.error('[api] bulk-validate error:', err);
      throw err;
    }
  }

  async importLinesFromExcelData(lines: any[]): Promise<{ success: boolean; imported: number; errors: string[] }> {
    const url = `${API_BASE}/api/lines/bulk-import`;
    const payload = { lines };
    try {
      // debug: log basic info to console so user can copy if needed
      console.debug('[api] bulk-import -> url:', url, 'linesCount:', Array.isArray(lines) ? lines.length : 0);
      console.debug('[api] bulk-import payload sample:', JSON.stringify(payload && payload.lines ? payload.lines[0] : null));

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('auth_token') ? { Authorization: `Bearer ${localStorage.getItem('auth_token')}` } : {})
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        // attempt to parse JSON error, fallback to text
        const text = await response.text().catch(() => '');
        let parsed: any = null;
        try { parsed = JSON.parse(text); } catch (e) { /* not json */ }
        console.error('[api] bulk-import failed, status=', response.status, 'body=', parsed ?? text);
        const message = parsed?.message ?? parsed?.error?.message ?? text ?? 'Failed to import lines';
        throw new Error(message);
      }

      const data = await response.json().catch(() => ({ success: true, imported: 0, errors: [] }));
      console.debug('[api] bulk-import response:', data);
      return data;
    } catch (err) {
      console.error('[api] bulk-import error:', err);
      throw err;
    }
  }

  // Users endpoints
  async getUsers(): Promise<User[]> {
    const response = await fetch(`${API_BASE}/api/users`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }

    return response.json();
  }

  async createUser(data: Partial<User>): Promise<User> {
    const response = await fetch(`${API_BASE}/api/users`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create user');
    }

    return response.json();
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const response = await fetch(`${API_BASE}/api/users/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update user');
    }

    return response.json();
  }

  async deleteUser(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/api/users/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete user');
    }
  }

  // Activity logs
  async getActivityLogs(): Promise<ActivityLog[]> {
    const response = await fetch(`${API_BASE}/api/activity-logs`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch activity logs');
    }

    return response.json();
  }

  // Dashboard stats
  async getDashboardStats(): Promise<any> {
    const response = await fetch(`${API_BASE}/api/dashboard/stats`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch dashboard stats');
    }

    return response.json();
  }
}

export const api = new ApiClient();
