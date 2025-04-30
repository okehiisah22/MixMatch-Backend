import express from "express"
import { getMatches } from "../controllers/match.controller"
import { authenticate } from "../middleware/auth"

const router = express.Router()

// Protect all routes
router.use(authenticate)

// Get user matches with pagination
router.get("/", getMatches)

export default router