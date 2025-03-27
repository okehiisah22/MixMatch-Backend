import Booking from "../models/Booking.model";
import Payment from "../models/payment.model";
import { Types } from "mongoose";
import mongoose from 'mongoose';


interface PaymentData {
  bookingId: Types.ObjectId;
  payerId: Types.ObjectId;
  receiverId: Types.ObjectId;
  amount: number;
  status?: "pending" | "completed" | "failed";
  transactionDate?: Date;
}

// Helper function to handle errors
const formatError = (error: any) => {
  if (error?.name === "ValidationError") {
    // Extract validation errors
    const validationErrors = Object.values(error.errors).map((err: any) => ({
      field: err.path,
      message: err.message,
    }));
    return { status: 400, success: false, error: "Validation Error", details: validationErrors };
  }

  return { status: 500, success: false, error: error.message || "An unknown error occurred" };
};

const ensureModelsRegistered = () => {
  try {
    // This will either return the existing model or register it if not already registered
    mongoose.models.Booking || mongoose.model('Booking', Booking.schema);
  } catch (error) {
    console.error('Error registering Booking model:', error);
  }
};


// Create a new payment
export const createPayment = async (data: PaymentData) => {
  try {
     // Validate ObjectId format
     if (!Types.ObjectId.isValid(data.bookingId) || !Types.ObjectId.isValid(data.payerId) || !Types.ObjectId.isValid(data.receiverId)) {
      throw new Error("Invalid bookingId, payerId, or receiverId format.");
    }

    // Check for duplicate payment
    const existingPayment = await Payment.findOne({
      bookingId: data.bookingId,
      payerId: data.payerId,
      receiverId: data.receiverId
    });

    if (existingPayment) {
      throw new Error("A payment for this booking and users already exists.");

    }

    const payment = new Payment(data);
    return await payment.save();
  } catch (error) {
    throw formatError(error);
  }
};

// Get a payment by ID
export const getPaymentById = async (id: string) => {
  try {
    if (!Types.ObjectId.isValid(id)) throw { status: 400, error: "Invalid payment ID" };
    const payment = await Payment.findById(id).populate("bookingId payerId receiverId");
    if (!payment) throw { status: 404, error: "Payment not found" };
    return payment;
  } catch (error) {
    throw formatError(error);
  }
};

// Get all payments
export const getAllPayments = async () => {
  try {
    return await Payment.find().populate("bookingId payerId receiverId");
  } catch (error) {
    throw formatError(error);
  }
};

// Update a payment
export const updatePayment = async (id: string, data: Partial<PaymentData>) => {
  try {
    if (!Types.ObjectId.isValid(id)) throw { status: 400, error: "Invalid payment ID" };
    const updatedPayment = await Payment.findByIdAndUpdate(id, data, { new: true });
    if (!updatedPayment) throw { status: 404, error: "Payment not found" };
    return updatedPayment;
  } catch (error) {
    throw formatError(error);
  }
};

// Delete a payment
export const deletePayment = async (id: string) => {
  try {
    if (!Types.ObjectId.isValid(id)) throw { status: 400, error: "Invalid payment ID" };
    const deletedPayment = await Payment.findByIdAndDelete(id);
    if (!deletedPayment) throw { status: 404, error: "Payment not found" };
    return { message: "Payment deleted successfully" };
  } catch (error) {
    throw formatError(error);
  }
};
