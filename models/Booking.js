const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    type: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'gigs',
    },
    location: {
      type: String,
      required: true,
    },
    isAccommodationProvided: {
      type: Boolean,
      default: false,
    },
    noOfAttendees: {
      type: Number,
    },
    client: {
      phone: {
        type: String,
      },
      name: {
        type: String,
      },
      email: {
        type: String,
      },
      poc: {
        type: String,
      },
    },
    extraMessage: {
      type: String,
    },
    additionalEquipments: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'equipments' },
    ],
    start: {
      type: String,
    },
    end: {
      type: String,
    },
    bidPrice: {
      type: Number,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'cancelled'],
      default: 'pending',
    },
    backgroundColor: {
      type: String,
    },
    borderColor: {
      type: String,
    },
    textColor: {
      type: String,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

bookingSchema.pre(/^find/, function (next) {
  this.populate('type');
  this.populate('user');
  this.populate('additionalEquipments');
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
