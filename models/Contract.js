const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
  contractTitle: {
    type: String,
    required: true,
  },
  paymentStructure: {
    type: String,
    required: true,
  },
  cancellation: {
    type: String,
    required: true,
  },
  signature: {
    type: String,
    required: false,
  },
  creationDate: {
    type: Date,
    default: Date.now,
  },
  creationTime: {
    type: String,
  },
  clientName: {
    type: String,
  },
  clientEmail: {
    type: String,
  },
  bookingTitle: {
    type: String,
  },
  creationTime: {
    type: String,
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
});

contractSchema.pre('save', function (next) {
  const currentDate = new Date();
  this.creationTime =
    currentDate.getHours() +
    ':' +
    currentDate.getMinutes() +
    ':' +
    currentDate.getSeconds();
  next();
});

module.exports = mongoose.model('Contract', contractSchema);
