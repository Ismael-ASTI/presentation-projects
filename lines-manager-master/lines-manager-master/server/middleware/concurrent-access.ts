import { Request, Response, NextFunction } from 'express';

// Middleware para logging de acesso simultâneo
export const logConcurrentAccess = (req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  const userInfo = (req as any).user ? `User: ${(req as any).user.email} (${(req as any).user.role})` : 'Anonymous';
  const clientIP = req.ip || req.connection.remoteAddress || 'Unknown';
  
  console.log(`[${timestamp}] ${req.method} ${req.path} - ${userInfo} - IP: ${clientIP}`);
  
  // Adicionar headers para rastreamento
  res.setHeader('X-Request-Timestamp', timestamp);
  res.setHeader('X-User-Info', (req as any).user ? (req as any).user.email : 'anonymous');
  
  next();
};

// Middleware para verificar se o usuário está ativo
export const checkUserStatus = (req: Request, res: Response, next: NextFunction) => {
  if ((req as any).user) {
    // Aqui você pode adicionar lógica para verificar se o usuário ainda está ativo
    // Por exemplo, verificar se a conta não foi desativada
    console.log(`✅ Usuário ativo: ${(req as any).user.email}`);
  }
  next();
};
