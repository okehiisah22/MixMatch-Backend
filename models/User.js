const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
    },
    email_verification: {
      type: String,
    },
    passwordResetToken: {
      type: String,
    },
    passwordResetExpires: {
      type: Date,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    firstLogin: {
      type: Boolean,
      default: true,
    },
    links: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Link',
    },
    phoneNumber: {
      type: String,
    },
    country: {
      type: String,
    },
    city: {
      type: String,
    },
    address: {
      type: String,
    },
    postalCode: {
      type: String,
    },
    profilePicture: {
      type: String,
    },
    coverPicture: {
      type: String,
    },
    passwordChangedAt: {
      type: Date,
    },
    twoFactorAuth: {
      type: Boolean,
      default: false,
    },
    authenticationApp: {
      type: Boolean,
      default: false,
    },
    twoFactorCode: {
      type: String,
    },
    twoFactorCodeExpiresAt: {
      type: Date,
    },
    allowAllNotifications: {
      type: Boolean,
      default: true,
    },
    allowBookingNotifications: {
      type: Boolean,
      default: true,
    },
    allowNewConversationNotifications: {
      type: Boolean,
      default: true,
    },
    allowOfflineMessagesNotifications: {
      type: Boolean,
      default: true,
    },
    genres: {
      type: [String],
      default: [],
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    automatedMessagesEnabled: {
      type: Boolean,
      default: false,
    },
    referralCode: {
      type: String,
    },
    referredUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);
