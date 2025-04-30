import type { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { User } from "../models/user.model"
import { asyncHandler } from "../utils/asyncHandler"
import { TokenBlacklist } from "../models/tokenBlacklist"

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: any
    }
  }
}

export const authenticate = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  let token

  // Get token from Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1]
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, no token provided",
    })
  }

  try {
    // Check if token is blacklisted
    const isBlacklisted = await TokenBlacklist.findOne({ token })
    if (isBlacklisted) {
      return res.status(401).json({
        success: false,
        message: "Token has been revoked",
      })
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any

    // Get user from database
    const user = await User.findById(decoded.id).select("-password")
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      })
    }

    // Set user in request
    req.user = user
    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, token failed",
    })
  }
})
