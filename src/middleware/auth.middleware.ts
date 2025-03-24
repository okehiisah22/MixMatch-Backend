import type { Request, Response, NextFunction } from "express"
import Jwt from "../utils/security/jwt"
import { User } from "../models/user.model"
import logger from "../config/logger"
import { asyncHandler } from "../utils/asyncHandler"

// Extend Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: any
    }
  }
}

/**
 * Middleware to authenticate and authorize requests using JWT
 * Extracts token from Authorization header, verifies it, and attaches user to request
 */
export const authenticate = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
  
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(new Error("Access denied. No token provided"));
    }
  
    try {
      const token = authHeader.split(" ")[1];
      const decoded = Jwt.verify(token);
  
      if (!decoded || !decoded.payload || !decoded.payload.id) {
        return next(new Error("Invalid token"));
      }
  
      const user = await User.findById(decoded.payload.id).select("-password");
  
      if (!user) {
        return next(new Error("User not found or token invalid"));
      }
  
      if (!user.isVerified) {
        return next(new Error("Account not verified. Please verify your email first"));
      }
  
      req.user = user;
      next();
    } catch (error) {
      logger.error("Authentication error:", error);
      return next(new Error("Invalid token"));
    }
  });
  
/**
 * Middleware to check if user has required role
 * @param roles Array of allowed roles
 */
export const authorize = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return next(new Error("Unauthorized - User not authenticated"));
      }
  
      if (!roles.includes(req.user.role)) {
        return next(new Error("Forbidden - Insufficient permissions"));
      }
  
      next();
    };
  };
  

