// File: src/middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import Jwt from "../utils/security/jwt";
import { UserRole } from "../models/user.model";

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "No token provided",
    });
  }

  try {
    const decoded = Jwt.verify(token) as {
      id: string;
      email: string;
      role: UserRole;
    };

    // Attach user information to the request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};
