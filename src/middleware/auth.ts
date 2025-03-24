import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { TokenBlacklist } from '../models/tokenBlacklist';

export interface JwtPayload {
  userId: string;
  exp?: number; // JWT expiration timestamp (in seconds since Unix epoch)
  iat?: number; // Issued at timestamp
  // Add other properties that your JWT payload contains
}

// Extend Express Request type to include user property
export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({ message: 'No token provided' });
      return;
    }

    // Check if token is blacklisted
    const blacklistedToken = await TokenBlacklist.findOne({ token });
    if (blacklistedToken) {
      res.status(401).json({ message: 'Token has been invalidated' });
      return;
    }

    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET!, (err, user) => {
      if (err) {
        res.status(403).json({ message: 'Invalid token' });
        return;
      }
      
      req.user = user as JwtPayload;
      next();
    });
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 