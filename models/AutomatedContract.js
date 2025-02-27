const { Schema, mongoose } = require('mongoose');

const AutomatedContractSchema = new Schema({
  enabled: {
    type: Boolean,
  },
  cancellation: {
    type: String,
  },
  signature: {
    type: String,
  },
  payment: {
    type: String,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

module.exports = mongoose.model('AutomatedContract', AutomatedContractSchema);
