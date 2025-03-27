import mongoose from 'mongoose';
import { Document, Schema, Model, Types } from 'mongoose';

// Enum for Payment Status
export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

// Interface for Payment Document
export interface IPayment extends Document {
  bookingId: Types.ObjectId;
  payerId: Types.ObjectId;
  receiverId: Types.ObjectId;
  amount: number;
  status: PaymentStatus;
  transactionDate: Date;
}

// Payment Schema
const PaymentSchema: Schema<IPayment> = new Schema({
  bookingId: {
    type: Schema.Types.ObjectId, 
    ref: 'Booking', 
    required: true,
    index: true
  },
  payerId: {
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  receiverId: {
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  amount: {
    type: Number, 
    required: true,
    min: [0, 'Amount cannot be negative'],
    validate: {
      validator: Number.isFinite,
      message: 'Amount must be a valid number'
    }
  },
  status: {
    type: String, 
    enum: Object.values(PaymentStatus),
    default: PaymentStatus.PENDING
  },
  transactionDate: {
    type: Date, 
    default: () => new Date(),
    immutable: true // Prevents modification after initial set
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
  collection: 'payments'
});

// Static methods for the Payment model
PaymentSchema.statics.findByBooking = function(bookingId: Types.ObjectId) {
  return this.find({ bookingId });
};

PaymentSchema.statics.findByPayer = function(payerId: Types.ObjectId) {
  return this.find({ payerId });
};

PaymentSchema.statics.findByReceiver = function(receiverId: Types.ObjectId) {
  return this.find({ receiverId });
};

// Compile the model
export interface PaymentModel extends Model<IPayment> {
  findByBooking(bookingId: Types.ObjectId): Promise<IPayment[]>;
  findByPayer(payerId: Types.ObjectId): Promise<IPayment[]>;
  findByReceiver(receiverId: Types.ObjectId): Promise<IPayment[]>;
}

const Payment = mongoose.model<IPayment, PaymentModel>('Payment', PaymentSchema);

export default Payment;