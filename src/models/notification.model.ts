import mongoose, { Document, Schema, Model } from "mongoose";

// Constants for notification types
export const NOTIFICATION_TYPES = [
  "booking",
  "message",
  "payment",
  "event",
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export interface INotification extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    message: {
      type: String,
      required: true,
      maxlength: 500,
    },
    type: {
      type: String,
      enum: NOTIFICATION_TYPES,
      required: true,
      index: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true, // This automatically adds createdAt and updatedAt
  }
);

// Index for frequently queried fields
NotificationSchema.index({ userId: 1, isRead: 1 });

const Notification: Model<INotification> = mongoose.model<INotification>(
  "Notification",
  NotificationSchema
);

export default Notification;
