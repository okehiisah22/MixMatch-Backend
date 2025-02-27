const mongoose = require("mongoose");

const { Schema } = mongoose;

const SubscriberSchema = new Schema(
  {
    email: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const SubscriberModel = mongoose.model("subscriber", SubscriberSchema);

module.exports = SubscriberModel;
