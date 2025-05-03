import mongoose from "mongoose";
import { User } from "../../models/user.model";
import { SwipedUser } from "../../models/userSwipes.model";
import redisClient from "../../config/cache";

// Define constant outside the function
const MIN_GENRE_MATCHES = 2; // Configurable threshold
const CACHE_TTL = 24 * 60 * 60; // 24 hours

export const deckGeneration = async (userId: string): Promise<any[]> => {
  // 1. Check Redis cache first
  const cachedDeck = await redisClient.get(`deck:${userId}`);
  if (cachedDeck) {
    return JSON.parse(cachedDeck); // Parse stored deck
  }

  // 2. Generate new deck
  const deck = await generateDeck(userId);

  // 3. Cache in Redis with TTL
  await redisClient.setEx(
    `deck:${userId}`,
    CACHE_TTL,
    JSON.stringify(deck) // Store as string
  );

  return deck;
};

const generateDeck = async (userId: string): Promise<any[]> => {
  // Get current user's data
  const currentUser = await User.findById(userId);
  if (!currentUser) throw new Error("User not found");

  // Get IDs of already swiped users
  const swipedUsers = await SwipedUser.find({ swiper: userId }).select(
    "swipee"
  );
  const swipedUserIds = swipedUsers.map((s) => s.swipee);

  // Generate deck using aggregation pipeline
  return User.aggregate([
    // Stage 1: Exclude self and already swiped users
    {
      $match: {
        _id: {
          $ne: new mongoose.Types.ObjectId(userId),
          $nin: swipedUserIds
        }
      }
    },
    // Stage 2: Add match score based on shared genres
    {
      $addFields: {
        matchScore: {
          $size: {
            $setIntersection: ["$topGenres", currentUser.topGenres || []]
          }
        }
      }
    },
    // Stage 3: Filter by minimum genre matches
    {
      $match: {
        matchScore: { $gte: MIN_GENRE_MATCHES }
      }
    },
    // Stage 4: Sort by best matches first
    { $sort: { matchScore: -1, createdAt: -1 } },
    // Stage 5: Random sampling from qualified matches
    { $sample: { size: 100 } },
    // Stage 6: Limit to final deck size
    { $limit: 20 },
    // Stage 7: Project only needed fields
    {
      $project: {
        password: 0,
        refreshToken: 0,
        socialLogin: 0,
        resetPasswordToken: 0,
        resetPasswordExpires: 0
      }
    }
  ]);
};
