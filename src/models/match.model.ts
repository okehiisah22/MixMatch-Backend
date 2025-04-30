import mongoose, { Schema, type Document } from "mongoose"

export interface IMatch extends Document {
  users: mongoose.Types.ObjectId[]
  timestamp: Date
  superLikeUsed: boolean
}

const MatchSchema: Schema = new Schema(
  {
    users: {
      type: [Schema.Types.ObjectId],
      ref: "User",
      required: [true, "Users are required"],
      validate: {
        validator: (users: mongoose.Types.ObjectId[]) => users.length === 2,
        message: "A match must have exactly two users",
      },
    },
    superLikeUsed: {
      type: Boolean,
      default: false,
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

// Create a unique compound index on users to prevent duplicate matches
MatchSchema.index({ users: 1 }, { unique: true })

export const Match = mongoose.model<IMatch>("Match", MatchSchema)
