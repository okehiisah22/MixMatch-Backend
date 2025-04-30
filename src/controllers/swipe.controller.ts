import type { Request, Response } from "express"
import mongoose from "mongoose"
import { User } from "../models/user.model"
import { Swipe, SwipeType } from "../models/swipe.model"
import { Match } from "../models/match.model"
import { asyncHandler } from "../utils/asyncHandler"
import logger from "../config/logger"

/**
 * Handle user swipe actions (like, skip, super-like)
 * @route POST /api/v1/swipe
 * @access Private
 */
export const handleSwipe = asyncHandler(async (req: Request, res: Response) => {
  const { targetUserId, action } = req.body
  const userId = req.user?._id

  // Validate input
  if (!targetUserId || !action) {
    return res.status(400).json({
      success: false,
      message: "Target user ID and action are required",
    })
  }

  // Validate action type
  if (!Object.values(SwipeType).includes(action)) {
    return res.status(400).json({
      success: false,
      message: "Invalid action. Must be 'like', 'skip', or 'super-like'",
    })
  }

  // Prevent swiping on oneself
  if (userId.toString() === targetUserId) {
    return res.status(400).json({
      success: false,
      message: "Cannot swipe on yourself",
    })
  }

  // Check if target user exists
  const targetUser = await User.findById(targetUserId)
  if (!targetUser) {
    return res.status(404).json({
      success: false,
      message: "Target user not found",
    })
  }

  // Start a MongoDB session for transaction
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    // Save the swipe
    const swipe = await Swipe.create(
      [
        {
          swiperId: userId,
          swipedId: targetUserId,
          type: action,
          timestamp: new Date(),
        },
      ],
      { session },
    )

    // If action is like or super-like, check for mutual interest
    if (action === SwipeType.LIKE || action === SwipeType.SUPER_LIKE) {
      // Check if target user has already liked the current user
      const mutualSwipe = await Swipe.findOne({
        swiperId: targetUserId,
        swipedId: userId,
        type: { $in: [SwipeType.LIKE, SwipeType.SUPER_LIKE] },
      }).session(session)

      // If mutual interest exists, create a match
      if (mutualSwipe) {
        // Sort user IDs to ensure consistency
        const userIds = [userId, targetUserId].sort((a, b) => a.toString().localeCompare(b.toString()))

        // Check if a match already exists
        const existingMatch = await Match.findOne({
          users: userIds,
        }).session(session)

        // Only create a match if one doesn't already exist
        if (!existingMatch) {
          // Determine if super-like was used by either user
          const superLikeUsed = action === SwipeType.SUPER_LIKE || mutualSwipe.type === SwipeType.SUPER_LIKE

          // Create the match
          await Match.create(
            [
              {
                users: userIds,
                superLikeUsed,
                timestamp: new Date(),
              },
            ],
            { session },
          )

          logger.info(`Match created between users ${userId} and ${targetUserId}`)
        }
      }
    }

    // Commit the transaction
    await session.commitTransaction()
    session.endSession()

    return res.status(201).json({
      success: true,
      message: "Swipe recorded successfully",
      data: swipe[0],
    })
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction()
    session.endSession()

    logger.error(`Error in swipe handler: ${error}`)
    return res.status(500).json({
      success: false,
      message: "Failed to process swipe action",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
})

/**
 * Get all matches for the current user
 * @route GET /api/v1/matches
 * @access Private
 */
export const getUserMatches = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id

  const matches = await Match.find({
    users: userId,
  }).populate({
    path: "users",
    match: { _id: { $ne: userId } }, // Only populate the other user
    select: "firstName lastName email profilePicture",
  })

  return res.status(200).json({
    success: true,
    count: matches.length,
    data: matches,
  })
})
