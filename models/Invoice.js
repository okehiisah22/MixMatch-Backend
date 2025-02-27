const mongoose = require('mongoose');
const paymentOptionSchema = require('./paymentInfo');

const invoiceTableDataSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
  },
  hours: {
    type: String,
    required: true,
  },
  rate: {
    type: Number,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
});

const totalsSchema = new mongoose.Schema({
  subtotal: {
    type: Number,
    required: true,
  },
  tax: {
    type: Number,
    required: true,
  },
  dueAmount: {
    type: Number,
    required: true,
  },
});

const invoiceSchema = new mongoose.Schema({
  invoiceTitle: {
    type: String,
    required: true,
  },
  invoiceID: {
    type: String,
    required: true,
  },
  clientName: {
    type: String,
    required: true,
  },
  clientEmail: {
    type: String,
    required: true,
  },
  invoiceDate: {
    type: String,
    required: true,
  },
  paymentDueDate: {
    type: String,
    required: true,
  },

  invoiceTableData: [invoiceTableDataSchema],
  totals: totalsSchema,
  paymentInfo: {
    type: Object,
    required: false,
  },
  paid: {
    type: Boolean,
    required: true,
  },

  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
  },

  contract: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contract',
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
});

module.exports = mongoose.model('Invoice', invoiceSchema);
