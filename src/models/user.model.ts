import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  isVerified: boolean;
  createdAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    isVerified: {
      type: Boolean,
      default: false
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

export const User = mongoose.model<IUser>('User', userSchema); 
