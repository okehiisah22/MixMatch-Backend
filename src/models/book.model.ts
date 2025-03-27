import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "./user.model";
import { IEvent } from "./event.model";

export interface IBooking extends Document {
  clientId: IUser["_id"]; // Reference to the User model (client)
  djId: IUser["_id"]; // Reference to the User model (DJ)
  eventId?: IEvent["_id"]; // Optional reference to the Event model
  date: Date;
  price: number;
  status: "pending" | "accepted" | "rejected" | "completed";
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema: Schema = new Schema(
  {
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    djId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event", // Optional reference to the Event model
    },
    date: {
      type: Date,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

export const Booking = mongoose.model<IBooking>("Booking", BookingSchema);