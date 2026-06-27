import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error caught in global handler:', err);

  const isProduction = process.env.NODE_ENV === 'production';

  if (err instanceof AppError && err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
      },
    });
    return;
  }

  const errorMessage = err instanceof Error ? err.message : 'Internal Server Error';

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: isProduction ? 'Internal Server Error' : errorMessage,
    },
  });
};
