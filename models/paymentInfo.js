const mongoose = require('mongoose');

const paymentOptionSchema = new mongoose.Schema({
  bankAccountNumber: {
    type: String,
    required: false,
  },
  bankAccountName: {
    type: String,
    required: false,
  },
  bankName: {
    type: String,
    required: false,
  },
  bankSwiftcode: {
    type: String,
    required: false,
  },
  paypalUsername: {
    type: String,
    required: false,
  },
  zelleEmailOrNumber: {
    type: String,
    required: false,
  },
  zelleBankName: {
    type: String,
    required: false,
  },
  zelleBankAccNumber: {
    type: String,
    required: false,
  },
  zelleBankRoutingNumber: {
    type: String,
    required: false,
  },
  cashAppUsername: {
    type: String,
    required: false,
  },
  paymentType: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('PaymentOptionSchema', paymentOptionSchema);
