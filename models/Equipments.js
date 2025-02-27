const mongoose = require("mongoose");

const { Schema } = mongoose;

const EquipmentSchema = new Schema({
  type: {
    type: String,
  },
  rate: {
    type: Number,
  },
  other: {
    type: String,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User ID required or not a valid User"],
  },
});

const EquipmentModel = mongoose.model("equipments", EquipmentSchema);

module.exports = EquipmentModel;
