import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validate, authSchemas, userSchemas, lineSchemas } from '../../server/middleware/validation';

// Mock express request/response
const mockRequest = (data: any = {}) => ({
  body: data.body || {},
  params: data.params || {},
  query: data.query || {},
});

const mockResponse = () => ({
  status: vi.fn().mockReturnThis(),
  json: vi.fn().mockReturnThis(),
});

const mockNext = vi.fn();

describe('Validation Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validate function', () => {
    it('should pass validation with valid data', () => {
      const req = mockRequest({
        body: { email: 'test@example.com', password: 'password123' }
      });
      const res = mockResponse();

      const middleware = validate({
        body: authSchemas.login
      });

      middleware(req as any, res as any, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(req.body.email).toBe('test@example.com');
    });

    it('should fail validation with invalid data', () => {
      const req = mockRequest({
        body: { email: 'invalid-email', password: '123' }
      });
      const res = mockResponse();

      const middleware = validate({
        body: authSchemas.login
      });

      middleware(req as any, res as any, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
      expect(mockNext.mock.calls[0][0].message).toContain('Dados inválidos');
    });
  });

  describe('authSchemas', () => {
    it('should validate login schema correctly', () => {
      const validData = {
        email: 'user@example.com',
        password: 'password123'
      };

      const result = authSchemas.login.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email in login schema', () => {
      const invalidData = {
        email: 'not-an-email',
        password: 'password123'
      };

      const result = authSchemas.login.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject short password in login schema', () => {
      const invalidData = {
        email: 'user@example.com',
        password: '123'
      };

      const result = authSchemas.login.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('userSchemas', () => {
    it('should validate user creation schema', () => {
      const validData = {
        email: 'user@example.com',
        name: 'John Doe',
        role: 'user',
        password: 'password123'
      };

      const result = userSchemas.create.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid role in user schema', () => {
      const invalidData = {
        email: 'user@example.com',
        name: 'John Doe',
        role: 'invalid_role',
        password: 'password123'
      };

      const result = userSchemas.create.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('lineSchemas', () => {
    it('should validate line creation schema', () => {
      const validData = {
        numero: '123456789',
        nome: 'Linha Test',
        status: 'Ativa'
      };

      const result = lineSchemas.create.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should set default values for optional fields', () => {
      const data = {
        numero: '123456789',
        nome: 'Linha Test'
      };

      const result = lineSchemas.create.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('Ativa');
        // expect(result.data.hasWhatsapp).toBe(true); // Comentado temporariamente
      }
    });

    it('should validate query parameters', () => {
      const validQuery = {
        search: 'test',
        status: 'Ativa',
        hasWhatsapp: 'true',
        page: '1',
        limit: '10'
      };

      const result = lineSchemas.query.safeParse(validQuery);
      expect(result.success).toBe(true);
      if (result.success) {
        // expect(result.data.hasWhatsapp).toBe(true); // Comentado temporariamente
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(10);
      }
    });
  });
});
