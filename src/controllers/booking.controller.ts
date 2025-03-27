import { Request, Response } from "express";
import { BookingService } from "../services/booking.service";
import mongoose from "mongoose";

interface CustomError extends Error {
  message: string;
}

export class BookingController {
  private bookingService: BookingService;

  constructor() {
    this.bookingService = new BookingService();
  }

  // Create a new booking
  async createBooking(req: Request, res: Response) {
    try {
      const booking = await this.bookingService.createBooking(req.body);
      res.status(201).json({
        success: true,
        data: booking,
      });
    } catch (error) {
      const err = error as CustomError;
      res.status(400).json({
        success: false,
        error: err.message || "An error occurred while creating the booking",
      });
    }
  }

  // Get all bookings with optional filters
  async getAllBookings(req: Request, res: Response) {
    try {
      const filters: any = {};

      if (req.query.userId) {
        filters.userId = new mongoose.Types.ObjectId(
          req.query.userId as string
        );
      }
      if (req.query.djId) {
        filters.djId = new mongoose.Types.ObjectId(req.query.djId as string);
      }
      if (req.query.status) {
        filters.status = req.query.status;
      }
      if (req.query.startDate) {
        filters.startDate = new Date(req.query.startDate as string);
      }
      if (req.query.endDate) {
        filters.endDate = new Date(req.query.endDate as string);
      }

      const bookings = await this.bookingService.getAllBookings(filters);
      res.status(200).json({
        success: true,
        data: bookings,
      });
    } catch (error) {
      const err = error as CustomError;
      res.status(400).json({
        success: false,
        error: err.message || "An error occurred while fetching bookings",
      });
    }
  }

  // Get a single booking by ID
  async getBookingById(req: Request, res: Response) {
    try {
      const booking = await this.bookingService.getBookingById(req.params.id);
      if (!booking) {
        return res.status(404).json({
          success: false,
          error: "Booking not found",
        });
      }
      res.status(200).json({
        success: true,
        data: booking,
      });
    } catch (error) {
      const err = error as CustomError;
      res.status(400).json({
        success: false,
        error: err.message || "An error occurred while fetching the booking",
      });
    }
  }

  // Update a booking
  async updateBooking(req: Request, res: Response) {
    try {
      const booking = await this.bookingService.updateBooking(
        req.params.id,
        req.body
      );
      if (!booking) {
        return res.status(404).json({
          success: false,
          error: "Booking not found",
        });
      }
      res.status(200).json({
        success: true,
        data: booking,
      });
    } catch (error) {
      const err = error as CustomError;
      res.status(400).json({
        success: false,
        error: err.message || "An error occurred while updating the booking",
      });
    }
  }

  // Delete a booking
  async deleteBooking(req: Request, res: Response) {
    try {
      const deleted = await this.bookingService.deleteBooking(req.params.id);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: "Booking not found",
        });
      }
      res.status(200).json({
        success: true,
        message: "Booking deleted successfully",
      });
    } catch (error) {
      const err = error as CustomError;
      res.status(400).json({
        success: false,
        error: err.message || "An error occurred while deleting the booking",
      });
    }
  }

  // Get bookings by user ID
  async getBookingsByUserId(req: Request, res: Response) {
    try {
      const userId = new mongoose.Types.ObjectId(req.params.userId);
      const bookings = await this.bookingService.getBookingsByUserId(userId);
      res.status(200).json({
        success: true,
        data: bookings,
      });
    } catch (error) {
      const err = error as CustomError;
      res.status(400).json({
        success: false,
        error: err.message || "An error occurred while fetching user bookings",
      });
    }
  }

  // Get bookings by DJ ID
  async getBookingsByDjId(req: Request, res: Response) {
    try {
      const djId = new mongoose.Types.ObjectId(req.params.djId);
      const bookings = await this.bookingService.getBookingsByDjId(djId);
      res.status(200).json({
        success: true,
        data: bookings,
      });
    } catch (error) {
      const err = error as CustomError;
      res.status(400).json({
        success: false,
        error: err.message || "An error occurred while fetching DJ bookings",
      });
    }
  }
}
