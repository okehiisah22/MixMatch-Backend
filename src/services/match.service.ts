import mongoose from "mongoose"
import { Match } from "../models/match.model"
import { User } from "../models/user.model"
import logger from "../config/logger"

/**
 * Service to handle match-related database operations
 */
export class MatchService {
  /**
   * Get paginated matches for a user with only public profile data
   * @param userId The ID of the user requesting their matches
   * @param limit Number of matches to return (default: 20)
   * @param offset Number of matches to skip (default: 0)
   * @returns Array of matches with limited user data
   */
  static async getUserMatches(
    userId: mongoose.Types.ObjectId,
    limit: number = 20,
    offset: number = 0
  ) {
    try {
      // Convert userId to ObjectId if it's a string
      const userObjectId = typeof userId === 'string' 
        ? new mongoose.Types.ObjectId(userId) 
        : userId

      // Create the aggregation pipeline
      const matches = await Match.aggregate([
        // Match documents where the user is part of the match
        { 
          $match: { 
            users: userObjectId 
          } 
        },
        // Sort by timestamp in descending order (newest first)
        { 
          $sort: { 
            timestamp: -1 
          } 
        },
        // Apply pagination
        { 
          $skip: offset 
        },
        { 
          $limit: limit 
        },
        // Create a new field with the other user's ID
        {
          $addFields: {
            otherUserId: {
              $filter: {
                input: "$users",
                as: "user",
                cond: { $ne: ["$$user", userObjectId] }
              }
            }
          }
        },
        // Unwind the otherUserId array to a single value
        {
          $addFields: {
            otherUserId: { $arrayElemAt: ["$otherUserId", 0] }
          }
        },
        // Look up the other user's public profile data
        {
          $lookup: {
            from: "users",
            localField: "otherUserId",
            foreignField: "_id",
            as: "userDetails"
          }
        },
        // Unwind the userDetails array to a single object
        {
          $unwind: "$userDetails"
        },
        // Project only the required fields
        {
          $project: {
            matchId: "$_id",
            user: {
              name: {
                $concat: ["$userDetails.firstName", " ", "$userDetails.lastName"]
              },
              bio: { $ifNull: ["$userDetails.bio", ""] },
              topGenres: { $ifNull: ["$userDetails.topGenres", []] },
              mood: { $ifNull: ["$userDetails.mood", []] },
              anthem: {
                $ifNull: [
                  {
                    trackId: "$userDetails.anthem.trackId",
                    previewUrl: "$userDetails.anthem.previewUrl"
                  },
                  null
                ]
              }
            },
            matchedAt: "$timestamp",
            superLike: "$superLikeUsed",
            _id: 0 // Exclude the _id field
          }
        }
      ])

      // Get total count for pagination metadata
      const totalCount = await Match.countDocuments({ users: userObjectId })

      return {
        matches,
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + matches.length < totalCount
        }
      }
    } catch (error) {
      logger.error(`Error fetching user matches: ${error}`)
      throw error
    }
  }
}