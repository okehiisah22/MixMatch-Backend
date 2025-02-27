const mongoose = require("mongoose");
const { Schema } = mongoose;

const mediaSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["image", "video", "audio"],
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    thumbnail: String,
    description: String,
    duration: Number,
    plays: {
      type: Number,
      default: 0,
    },
    metadata: {
      format: String,
      size: Number,
      resolution: String,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const gallerySchema = new Schema({
  dj: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
    maxlength: 100,
  },
  description: {
    type: String,
    maxlength: 500,
  },
  eventDate: Date,
  media: [mediaSchema],
  tags: [String],
  views: {
    type: Number,
    default: 0,
  },
  location: {
    venue: String,
    city: String,
    country: String,
  },
  isPublic: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Gallery", gallerySchema);
