import mongoose, { Document, Schema } from "mongoose";

export interface IBooking extends Document {
  userId: mongoose.Types.ObjectId;
  djId: mongoose.Types.ObjectId;
  eventDate: Date;
  eventTime: string;
  eventLocation: string;
  eventType: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    djId: {
      type: Schema.Types.ObjectId,
      ref: "DjProfile",
      required: true,
    },
    eventDate: {
      type: Date,
      required: true,
    },
    eventTime: {
      type: String,
      required: true,
    },
    eventLocation: {
      type: String,
      required: true,
    },
    eventType: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
    totalPrice: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
bookingSchema.index({ userId: 1 });
bookingSchema.index({ djId: 1 });
bookingSchema.index({ eventDate: 1 });
bookingSchema.index({ status: 1 });

export const Booking = mongoose.model<IBooking>("Booking", bookingSchema);
