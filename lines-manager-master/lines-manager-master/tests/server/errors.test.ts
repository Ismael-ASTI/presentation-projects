import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ValidationError, AuthenticationError, AppError } from '../../server/errors';
import { logger } from '../../server/logger';

describe('Error Classes', () => {
  describe('AppError', () => {
    it('should create error with default values', () => {
      const error = new AppError('Test error');
      
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(500);
      expect(error.name).toBe('AppError');
    });

    it('should create error with custom values', () => {
      const error = new AppError('Custom error', 400, 'CUSTOM_ERROR' as any, { detail: 'test' });
      
      expect(error.message).toBe('Custom error');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('CUSTOM_ERROR');
      expect(error.details).toEqual({ detail: 'test' });
    });
  });

  describe('ValidationError', () => {
    it('should create validation error with correct properties', () => {
      const error = new ValidationError('Invalid data', { field: 'email' });
      
      expect(error.message).toBe('Invalid data');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.details).toEqual({ field: 'email' });
    });
  });

  describe('AuthenticationError', () => {
    it('should create authentication error with default message', () => {
      const error = new AuthenticationError();
      
      expect(error.message).toBe('Authentication required');
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe('AUTHENTICATION_ERROR');
    });

    it('should create authentication error with custom message', () => {
      const error = new AuthenticationError('Invalid token');
      
      expect(error.message).toBe('Invalid token');
      expect(error.statusCode).toBe(401);
    });
  });
});

describe('Logger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock console methods
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('should log error messages', () => {
    const error = new Error('Test error');
    logger.error('Something went wrong', error, { userId: '123' });
    
    expect(console.error).toHaveBeenCalled();
  });

  it('should log info messages', () => {
    logger.info('Info message', { action: 'test' });
    
    expect(console.log).toHaveBeenCalled();
  });

  it('should log audit messages', () => {
    logger.audit('USER_LOGIN', { userId: '123', ip: '127.0.0.1' });
    
    expect(console.log).toHaveBeenCalled();
  });

  it('should log security events', () => {
    logger.security('Suspicious activity', { ip: '127.0.0.1', attempts: 5 });
    
    expect(console.warn).toHaveBeenCalled();
  });
});
