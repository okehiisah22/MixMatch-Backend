import mongoose, { Schema, Document } from 'mongoose';

export interface IVerificationCode extends Document {
  email: string;
  code: string;
  expiresAt: Date;
  createdAt: Date;
}

const verificationCodeSchema = new Schema<IVerificationCode>(
  {
    email: {
      type: String,
      required: true,
      index: true
    },
    code: {
      type: String,
      required: true
    },
    expiresAt: {
      type: Date,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

verificationCodeSchema.index({ email: 1, code: 1 });

verificationCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const VerificationCode = mongoose.model<IVerificationCode>(
  'VerificationCode',
  verificationCodeSchema
); 
