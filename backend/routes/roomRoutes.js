const express = require("express");
const Room = require("../models/Room");
const Booking = require("../models/Booking");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// Get all rooms (public)
router.get("/", async (req, res) => {
  try {
    const rooms = await Room.find().sort({ roomNumber: 1 });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get one room (public)
router.get("/:id", async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a room (admin only)
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const room = await Room.create(req.body);
    res.status(201).json(room);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a room (admin only)
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!room) return res.status(404).json({ message: "Room not found" });
    res.json(room);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a room (admin only, blocked if it has active bookings)
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const active = await Booking.findOne({
      room: req.params.id,
      status: { $in: ["booked", "checked-in"] },
    });
    if (active) {
      return res
        .status(400)
        .json({ message: "Cannot delete a room that has active bookings" });
    }
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });
    res.json({ message: "Room deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;