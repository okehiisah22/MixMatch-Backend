import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Event name is required"],
    },
    date: {
      type: Date,
      required: [true, "Event date is required"],
    },
    location: {
      address: String,
      city: {
        type: String,
        required: [true, "City is required"],
      },
      state: {
        type: String,
        required: [true, "State is required"],
      },
    },
    genre: {
      type: String,
      required: [true, "Music genre is required"],
    },
    description: String,
  },
  { timestamps: true }
);

export default mongoose.model("Event", eventSchema);
