const mongoose = require('mongoose');

const AssistantSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    default: 'I am helpful.',
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

const Assistant = mongoose.model('Assistant', AssistantSchema);

module.exports = Assistant;
