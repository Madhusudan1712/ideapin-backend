import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ZodSchema } from 'zod';
import { AppError } from '../utils/appError';

export const validateBody = (schema: ZodSchema): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const firstError = result.error.issues[0]?.message || 'Validation error';
      next(new AppError(firstError, 400, 'VALIDATION_ERROR'));
      return;
    }
    // Update req.body to verified data
    req.body = result.data;
    next();
  };
};
