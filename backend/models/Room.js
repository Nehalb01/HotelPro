const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    roomNumber: { type: String, required: true, unique: true },
    type: {
      type: String,
      enum: ["Single", "Double", "Deluxe", "Suite"],
      required: true,
    },
    price: { type: Number, required: true },
    capacity: { type: Number, default: 2 },
    amenities: [String],
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Room", roomSchema);