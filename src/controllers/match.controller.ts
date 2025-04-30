import type { Request, Response } from "express"
import { asyncHandler } from "../utils/asyncHandler"
import { MatchService } from "../services/match.service"
import logger from "../config/logger"

/**
 * Get all matches for the current user with pagination
 * @route GET /api/matches
 * @access Private
 */
export const getMatches = asyncHandler(async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id
    
    // Parse pagination parameters
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0
    
    // Validate pagination parameters
    if (isNaN(limit) || limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        message: "Limit must be a number between 1 and 100"
      })
    }
    
    if (isNaN(offset) || offset < 0) {
      return res.status(400).json({
        success: false,
        message: "Offset must be a non-negative number"
      })
    }
    
    // Get matches from service
    const { matches, pagination } = await MatchService.getUserMatches(userId, limit, offset)
    
    return res.status(200).json({
      success: true,
      count: matches.length,
      pagination,
      data: matches
    })
  } catch (error) {
    logger.error(`Error in getMatches controller: ${error}`)
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve matches",
      error: error instanceof Error ? error.message : "Unknown error"
    })
  }
})