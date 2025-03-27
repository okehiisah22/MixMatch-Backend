import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "./user.model";

export interface IDJProfile extends Document {
  user: IUser["_id"]; // Reference to the User model
  bio?: string;
  genres: string[];
  equipment?: string;
  pricing?: string;
  portfolio?: string[]; // Array of image/video URLs
  createdAt: Date;
  updatedAt: Date;
}

const DJProfileSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    bio: {
      type: String,
      trim: true,
    },
    genres: {
      type: [String],
      required: true,
    },
    equipment: {
      type: String,
      trim: true,
    },
    pricing: {
      type: String,
      trim: true,
    },
    portfolio: {
      type: [String], // Array of image/video URLs
    },
  },
  {
    timestamps: true,
  }
);

export const DJProfile = mongoose.model<IDJProfile>(
  "DJProfile",
  DJProfileSchema
);
