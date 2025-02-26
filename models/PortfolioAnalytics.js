const mongoose = require("mongoose");
const { Schema } = mongoose;

const analyticsSchema = new Schema({
  dj: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  itemType: {
    type: String,
    enum: ["gallery", "media", "testimonial"],
    required: true,
  },
  itemId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  action: {
    type: String,
    enum: ["view", "play", "share", "download"],
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  ipAddress: String,
  userAgent: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("PortfolioAnalytics", analyticsSchema);
