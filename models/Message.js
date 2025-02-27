const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    sender: {
      email: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
    },
    receiver: {
      email: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
    },
    type: {
      type: String,
      enum: ["text", "image", "video"],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
