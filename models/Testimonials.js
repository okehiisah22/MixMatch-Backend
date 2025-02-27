const mongoose = require('mongoose');
const { Schema } = mongoose;

const testimonialSchema = new Schema({
  dj: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true,
    maxlength: 1000
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvedAt: Date,
  rejectedReason: String,
  featured: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

testimonialSchema.index({ dj: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Testimonial', testimonialSchema);