const { Schema, mongoose } = require('mongoose');

const paymentInfoSchema = new Schema({}, { strict: false });

const paymentOptionsSchema = new Schema({
  paymentType: {
    type: String,
  },
  paymentInfo: paymentInfoSchema,
});

const AutomatedInvoiceSchema = new Schema({
  enabled: {
    type: Boolean,
  },
  dueDate: {
    type: Number,
  },
  eventTypeTrigger: {
    type: String,
  },
  paymentOptions: paymentOptionsSchema,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

module.exports = mongoose.model('AutomatedInvoice', AutomatedInvoiceSchema);
