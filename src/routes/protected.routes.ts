import type express from "express"
import type { Request, Response } from "express"
import { authenticate, authorize } from "../middleware/auth.middleware"
import { UserRole } from "../models/user.model"
import { asyncHandler } from "../utils/asyncHandler"

const protectedRouter = (router: express.Router) => {
  // Example of a protected route that requires authentication
  router.get(
    "/protected/profile",
    authenticate,
    asyncHandler(async (req: Request, res: Response) => {
      res.status(200).json({
        success: true,
        message: "Protected route accessed successfully",
        data: {
          user: req.user,
        },
      })
    }),
  )

  // Example of a route that requires specific role (DJ only)
  router.get(
    "/protected/dj-only",
    authenticate,
    authorize([UserRole.DJ]),
    asyncHandler(async (req: Request, res: Response) => {
      res.status(200).json({
        success: true,
        message: "DJ only route accessed successfully",
        data: {
          user: req.user,
        },
      })
    }),
  )

  // Example of a route that requires admin role
  router.get(
    "/protected/admin-only",
    authenticate,
    authorize([UserRole.ADMIN]),
    asyncHandler(async (req: Request, res: Response) => {
      res.status(200).json({
        success: true,
        message: "Admin only route accessed successfully",
        data: {
          user: req.user,
        },
      })
    }),
  )

  // Example of a route that allows multiple roles
  router.get(
    "/protected/dj-or-planner",
    authenticate,
    authorize([UserRole.DJ, UserRole.EVENT_PLANNER]),
    asyncHandler(async (req: Request, res: Response) => {
      res.status(200).json({
        success: true,
        message: "DJ or Event Planner route accessed successfully",
        data: {
          user: req.user,
        },
      })
    }),
  )
}

export default protectedRouter

