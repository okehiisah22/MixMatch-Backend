import { Booking, IBooking } from "../models/book.model";
import mongoose from "mongoose";

export class BookingService {
  // Create a new booking
  async createBooking(
    bookingData: Omit<IBooking, "createdAt" | "updatedAt">
  ): Promise<IBooking> {
    try {
      const booking = new Booking(bookingData);
      return await booking.save();
    } catch (error: any) {
      throw new Error(`Error creating booking: ${error.message}`);
    }
  }

  // Get all bookings with optional filters
  async getAllBookings(
    filters: {
      userId?: mongoose.Types.ObjectId;
      djId?: mongoose.Types.ObjectId;
      status?: string;
      startDate?: Date;
      endDate?: Date;
    } = {}
  ): Promise<IBooking[]> {
    try {
      const query: any = {};

      if (filters.userId) query.userId = filters.userId;
      if (filters.djId) query.djId = filters.djId;
      if (filters.status) query.status = filters.status;
      if (filters.startDate || filters.endDate) {
        query.eventDate = {};
        if (filters.startDate) query.eventDate.$gte = filters.startDate;
        if (filters.endDate) query.eventDate.$lte = filters.endDate;
      }

      return await Booking.find(query)
        .populate("userId", "name email")
        .populate("djId", "name email")
        .sort({ createdAt: -1 });
    } catch (error: any) {
      throw new Error(`Error fetching bookings: ${error.message}`);
    }
  }

  // Get a single booking by ID
  async getBookingById(bookingId: string): Promise<IBooking | null> {
    try {
      return await Booking.findById(bookingId)
        .populate("userId", "name email")
        .populate("djId", "name email");
    } catch (error: any) {
      throw new Error(`Error fetching booking: ${error.message}`);
    }
  }

  // Update a booking
  async updateBooking(
    bookingId: string,
    updateData: Partial<IBooking>
  ): Promise<IBooking | null> {
    try {
      return await Booking.findByIdAndUpdate(
        bookingId,
        { $set: updateData },
        { new: true, runValidators: true }
      )
        .populate("userId", "name email")
        .populate("djId", "name email");
    } catch (error: any) {
      throw new Error(`Error updating booking: ${error.message}`);
    }
  }

  // Delete a booking
  async deleteBooking(bookingId: string): Promise<boolean> {
    try {
      const result = await Booking.findByIdAndDelete(bookingId);
      return !!result;
    } catch (error: any) {
      throw new Error(`Error deleting booking: ${error.message}`);
    }
  }

  // Get bookings by user ID
  async getBookingsByUserId(
    userId: mongoose.Types.ObjectId
  ): Promise<IBooking[]> {
    try {
      return await Booking.find({ userId })
        .populate("djId", "name email")
        .sort({ createdAt: -1 });
    } catch (error: any) {
      throw new Error(`Error fetching user bookings: ${error.message}`);
    }
  }

  // Get bookings by DJ ID
  async getBookingsByDjId(djId: mongoose.Types.ObjectId): Promise<IBooking[]> {
    try {
      return await Booking.find({ djId })
        .populate("userId", "name email")
        .sort({ createdAt: -1 });
    } catch (error: any) {
      throw new Error(`Error fetching DJ bookings: ${error.message}`);
    }
  }
}
