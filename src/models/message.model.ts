import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Interface representing a Message document in MongoDB.
 */
export interface IMessage extends Document {
    senderId: mongoose.Types.ObjectId;
    receiverId: mongoose.Types.ObjectId;
    content: string;
    timestamp: Date;
    isRead: boolean;
}

/**
 * Message Schema defining the structure of the Message collection.
 */
const MessageSchema: Schema = new Schema<IMessage>(
    {
        senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        receiverId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        isRead: { type: Boolean, default: false },
    },
    {
        timestamps: true, // Automatically add createdAt and updatedAt fields.
    }
);

/**
 * Static method to find messages by sender.
 */
MessageSchema.statics.findBySender = function (senderId: mongoose.Types.ObjectId) {
    return this.find({ senderId });
};

/**
 * Static method to find messages by receiver.
 */
MessageSchema.statics.findByReceiver = function (receiverId: mongoose.Types.ObjectId) {
    return this.find({ receiverId });
};

/**
 * Static method to mark a message as read.
 */
MessageSchema.statics.markAsRead = function (messageId: mongoose.Types.ObjectId) {
    return this.findByIdAndUpdate(messageId, { isRead: true }, { new: true });
};

/**
 * Message Model to interact with the MongoDB database.
 */
interface MessageModel extends Model<IMessage> {
    findBySender(senderId: mongoose.Types.ObjectId): Promise<IMessage[]>;
    findByReceiver(receiverId: mongoose.Types.ObjectId): Promise<IMessage[]>;
    markAsRead(messageId: mongoose.Types.ObjectId): Promise<IMessage | null>;
}

const MessageModel = mongoose.model<IMessage, MessageModel>('Message', MessageSchema);

export default MessageModel;
