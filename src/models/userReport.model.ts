const mongoose = require('mongoose');

const UserReportSchema = new mongoose.Schema({
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  reportedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  reason: {
    type: String,
    required: true,
    enum: [
      'harassment',
      'spam',
      'fake_account',
      'inappropriate_content',
      'other',
    ],
  },
  details: {
    type: String,
    required: true,
    maxlength: 1000,
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  reviewedAt: {
    type: Date,
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  actionTaken: {
    type: String,
    enum: ['none', 'warning', 'temporary_ban', 'permanent_ban'],
  },
  actionDetails: {
    type: String,
    maxlength: 500,
  },
});

UserReportSchema.index({ reporter: 1, reportedUser: 1, createdAt: -1 });
UserReportSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('UserReport', UserReportSchema);
