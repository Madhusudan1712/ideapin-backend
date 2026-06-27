import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { UnauthorizedError } from '../utils/appError';
import { AuthenticatedRequest } from '../types';

const supabaseUrl = process.env.SUPABASE_URL || '';

const client = jwksClient({
  jwksUri: `${supabaseUrl}/auth/v1/.well-known/jwks.json`,
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 10,
});

const getKey = (header: jwt.JwtHeader, callback: jwt.SigningKeyCallback) => {
  if (!header.kid) {
    return callback(new Error('No kid in token header'));
  }
  client.getSigningKey(header.kid, (err: Error | null, key: any) => {
    if (err) {
      callback(err);
    } else {
      const signingKey = key?.getPublicKey();
      callback(null, signingKey);
    }
  });
};

export const verifyAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return next(new UnauthorizedError('Authorization token is missing or invalid'));
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return next(new UnauthorizedError('Authorization token is missing or invalid'));
  }

  const token = parts[1];
  if (!token) {
    return next(new UnauthorizedError('Authorization token is missing or invalid'));
  }

  jwt.verify(
    token,
    getKey,
    { algorithms: ['ES256'] },
    (err: jwt.VerifyErrors | null, decoded: string | jwt.JwtPayload | undefined) => {
      if (err || !decoded || typeof decoded === 'string') {
        return next(new UnauthorizedError('Invalid or expired authentication token'));
      }

      const { sub, email } = decoded;
      if (!sub || !email) {
        return next(new UnauthorizedError('Invalid token payload structure'));
      }

      req.user = { id: sub, email };
      next();
    }
  );
};
