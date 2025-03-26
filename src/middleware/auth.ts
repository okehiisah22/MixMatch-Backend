// File: src/middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import Jwt from "../utils/security/jwt";
import { UserRole } from "../models/user.model";
import { isTokenBlacklisted } from "../services/token.service";

// Define the JWT payload type
export interface JwtPayload {
  id: string;  // Remove optional
  userId?: string;
  email: string;  // Remove optional
  role: UserRole;  // Remove optional
  exp?: number;
}

// Define the extended request type
export interface AuthRequest extends Request {
  user?: JwtPayload;  // Keep using 'user' to match existing code
}

// Type assertion function to safely convert Request to AuthRequest
function asAuthRequest(req: Request): AuthRequest {
  return req as AuthRequest;
}

export const authenticateToken = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({
      success: false,
      message: "No token provided",
    });
    return;
  }

  try {
    // Check if token is blacklisted
    const isBlacklisted = await isTokenBlacklisted(token);
    if (isBlacklisted) {
      res.status(401).json({
        success: false,
        message: "Token has been invalidated",
      });
      return;
    }
    
    const decoded = Jwt.verify(token) as JwtPayload;

    // Attach user information to the request
    asAuthRequest(req).user = decoded;

    next();
  } catch (error) {
    res.status(403).json({
      success: false,
      message: "Invalid token",
    });
  }
};

