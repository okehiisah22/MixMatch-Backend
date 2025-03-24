import type express from "express"
import { authenticate } from "../middleware/auth.middleware"
import { getCurrentUser, updateProfile } from "../controllers/user.controller"

const userRouter = (router: express.Router) => {
  // Get current user profile
  router.get("/users/me", authenticate, getCurrentUser)

  // Update user profile
  router.patch("/users/me", authenticate, updateProfile)
}

export default userRouter

