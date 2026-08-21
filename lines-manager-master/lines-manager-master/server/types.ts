import { Request } from 'express';
import type { User } from './schema';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export {};
