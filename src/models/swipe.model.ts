import mongoose, { Schema, type Document } from "mongoose"

export enum SwipeType {
  LIKE = "like",
  SKIP = "skip",
  SUPER_LIKE = "super-like",
}

export interface ISwipe extends Document {
  swiperId: mongoose.Types.ObjectId
  swipedId: mongoose.Types.ObjectId
  type: SwipeType
  timestamp: Date
}

const SwipeSchema: Schema = new Schema(
  {
    swiperId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Swiper ID is required"],
      index: true,
    },
    swipedId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Swiped ID is required"],
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(SwipeType),
      required: [true, "Swipe type is required"],
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

// Create compound index for efficient lookup of mutual swipes
SwipeSchema.index({ swiperId: 1, swipedId: 1 })

export const Swipe = mongoose.model<ISwipe>("Swipe", SwipeSchema)
