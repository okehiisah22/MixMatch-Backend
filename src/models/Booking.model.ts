import mongoose, { Schema, Document } from "mongoose";

// Define the Booking interface
export interface IBooking extends Document {
  clientId: mongoose.Types.ObjectId;
  djId: mongoose.Types.ObjectId;
  eventId?: mongoose.Types.ObjectId;
  date: Date;
  price: number;
  status: "pending" | "accepted" | "rejected" | "completed";
}

// Define the Booking Schema
const BookingSchema = new Schema<IBooking>(
  {
    clientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    djId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    eventId: { type: Schema.Types.ObjectId, ref: "Event" }, // Optional field
    date: { type: Date, required: true },
    price: { type: Number, required: true },
    status: { type: String, enum: ["pending", "accepted", "rejected", "completed"], default: "pending" },
  },
  { timestamps: true }
);

// **Ensure the model is properly registered**
const Booking = mongoose.model<IBooking>("Booking", BookingSchema);

export default Booking;
