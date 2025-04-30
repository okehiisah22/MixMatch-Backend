import express from "express"
import { handleSwipe, getUserMatches } from "../controllers/swipe.controller"
import { authenticate } from "../middleware/auth"

const router = express.Router()

// Protect all routes
router.use(authenticate)

// Swipe endpoint
router.post("/", handleSwipe)

// Get user matches
router.get("/matches", getUserMatches)

export default router
