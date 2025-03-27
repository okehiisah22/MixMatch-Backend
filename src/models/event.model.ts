import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "./user.model";
import { IDJProfile } from "./DjProfile.model";

export interface IEvent extends Document {
  organizerId: IUser["_id"]; // Reference to the User model
  name: string;
  description?: string;
  date: Date;
  location: string;
  budget: number;
  bookedDJs: IDJProfile["_id"][]; // Array of references to DJProfile
  status: "upcoming" | "completed" | "canceled";
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema: Schema = new Schema(
  {
    organizerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    budget: {
      type: Number,
      required: true,
    },
    bookedDJs: [
      {
        type: Schema.Types.ObjectId,
        ref: "DJProfile",
      },
    ],
    status: {
      type: String,
      enum: ["upcoming", "completed", "canceled"],
      default: "upcoming",
    },
  },
  {
    timestamps: true,
  }
);

export const Event = mongoose.model<IEvent>("Event", EventSchema);