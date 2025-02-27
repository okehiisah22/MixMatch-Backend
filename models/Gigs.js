const mongoose = require("mongoose");

const { Schema } = mongoose;

const GigSchema = new Schema({
  gigUrl: {
    type: String,
  },
  gigTitle: {
    type: String,
  },
  gigRate: {
    type: Number,
  },
  note: {
    type: String,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User ID required or not a valid User"],
  },
});

const GigModel = mongoose.model("gigs", GigSchema);

module.exports = GigModel;
