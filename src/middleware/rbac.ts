// File: src/middleware/rbac.ts
import { Request, Response, NextFunction } from "express";
import { UserRole } from "../models/user.model";

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: UserRole;
      };
    }
  }
}

// Define a type for allowed roles
type AllowedRoles = UserRole[];

/**
 * Middleware to enforce Role-Based Access Control (RBAC)
 * @param allowedRoles Array of roles allowed to access the route
 * @returns Middleware function
 */
export const rbac = (allowedRoles: AllowedRoles) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Check if user's role is allowed
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access forbidden: Insufficient privileges",
        requiredRoles: allowedRoles,
      });
    }

    // User has required role, proceed to next middleware/route handler
    next();
  };
};

// Helper function to create role-specific middleware
export const createRoleMiddleware = {
  /**
   * Middleware for routes only accessible by DJs
   */
  djOnly: () => rbac([UserRole.DJ]),

  /**
   * Middleware for routes only accessible by event planners/organizers
   */
  organizerOnly: () => rbac([UserRole.EVENT_PLANNER]),

  /**
   * Middleware for routes accessible by multiple roles
   * @param roles Array of roles allowed to access the route
   */
  forRoles: (roles: UserRole[]) => rbac(roles),
};
