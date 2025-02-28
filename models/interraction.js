const mongoose = require('mongoose');

const interactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  actionType: {
    type: String,
    required: true,
    enum: [
      'page_view',
      'button_click',
      'form_submit',
      'purchase_initiated',
      'details_expanded',
    ],
  },
  metadata: {
    page: String,
    elementId: String,
    referrer: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for faster querying
interactionSchema.index({ eventId: 1 });
interactionSchema.index({ userId: 1 });
interactionSchema.index({ timestamp: 1 });

module.exports = mongoose.model('Interaction', interactionSchema);
