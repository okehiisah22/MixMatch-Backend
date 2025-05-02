import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "./user.model"; // Import your user interface

export enum SwipeAction {
  LIKE = "like",
  SKIP = "skip",
  SUPER_LIKE = "super_like"
}

export interface ISwipedUser extends Document {
  swiper: mongoose.Types.ObjectId | IUser; // Reference to the user who performed the swipe
  swipee: mongoose.Types.ObjectId | IUser; // Reference to the user who was swiped on
  action: SwipeAction;
  timestamp?: Date;
  // For potential matching logic
  isMatch?: boolean;
  // For analytics
  swipeContext?: {
    device?: string; // 'mobile', 'web'
  };
}

const SwipedUserSchema: Schema = new Schema(
  {
    swiper: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Swiper user ID is required"],
      index: true
    },
    swipee: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Swipee user ID is required"],
      index: true
    },
    action: {
      type: String,
      enum: Object.values(SwipeAction),
      required: [true, "Swipe action is required"]
    },
    isMatch: {
      type: Boolean,
      default: false
    },
    swipeContext: {
      device: {
        type: String,
        enum: ["mobile", "web"],
        default: "mobile"
      }
    }
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Compound index to prevent duplicate swipes
SwipedUserSchema.index({ swiper: 1, swipee: 1 }, { unique: true });

// Index for frequently queried fields
SwipedUserSchema.index({ swiper: 1, action: 1 });
SwipedUserSchema.index({ swipee: 1, action: 1 });
SwipedUserSchema.index({ isMatch: 1 });

// Virtual population for easier querying like references in relational db
SwipedUserSchema.virtual("swiperDetails", {
  ref: "User",
  localField: "swiper",
  foreignField: "_id",
  justOne: true
});

SwipedUserSchema.virtual("swipeeDetails", {
  ref: "User",
  localField: "swipee",
  foreignField: "_id",
  justOne: true
});

// Middleware to update match status if both users liked each other
SwipedUserSchema.pre<ISwipedUser>("save", async function (next) {
  if (
    this.action === SwipeAction.LIKE ||
    this.action === SwipeAction.SUPER_LIKE
  ) {
    const reciprocalSwipe = await SwipedUser.findOne({
      swiper: this.swipee,
      swipee: this.swiper,
      action: { $in: [SwipeAction.LIKE, SwipeAction.SUPER_LIKE] }
    });

    this.isMatch = !!reciprocalSwipe;
  }
  next();
});

export const SwipedUser = mongoose.model<ISwipedUser>(
  "SwipedUser",
  SwipedUserSchema
);
