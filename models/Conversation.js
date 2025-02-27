const e = require("cors");
const mongoose = require("mongoose");

const membersSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
});

const conversationsSchema = new mongoose.Schema(
  {
    members: {
      type: [membersSchema],
    },
    unreadMessages: {
      type: Number,
      default: 0,
    },
    pinned: {
      type: Boolean,
      default: false,
    },
    lastMessageType: {
      type: String,
      enum: ["text", "image", "video"],
      required: true,
    },

    lastMessage: {
      type: String,
    },
    lastMessageDate: {
      type: Date,
    },
    conversationAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

conversationsSchema.pre(/^find/, function (next) {
  this.populate("conversationAdmin", "name email");
  next();
});

const Conversation = mongoose.model("Conversation", conversationsSchema);

module.exports = Conversation;
