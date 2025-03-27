import mongoose from 'mongoose';

const tokenBlacklistSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  expiresAt: {
    type: Date,
    required: true,
    expires: 0 // TTL index: automatically removes document when expiresAt is reached
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create index for faster lookups
tokenBlacklistSchema.index({ token: 1 });

export const TokenBlacklist = mongoose.model('TokenBlacklist', tokenBlacklistSchema); 