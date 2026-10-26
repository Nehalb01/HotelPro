const express = require("express");
const Room = require("../models/Room");
const Booking = require("../models/Booking");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// Get all rooms (public), with optional filters:
// ?search=&type=&minPrice=&maxPrice=&checkIn=&checkOut=
router.get("/", async (req, res) => {
  try {
    const { search, type, minPrice, maxPrice, checkIn, checkOut } = req.query;
    const filter = {};

    if (type) filter.type = type;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const rx = new RegExp(escaped, "i");
      filter.$or = [{ name: rx }, { roomNumber: rx }, { description: rx }];
    }

    // Availability: hide rooms that have an overlapping active booking
    if (checkIn && checkOut) {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      if (isNaN(start) || isNaN(end) || end <= start) {
        return res
          .status(400)
          .json({ message: "Check-out must be after check-in" });
      }
      const bookedRoomIds = await Booking.find({
        status: { $in: ["booked", "checked-in"] },
        checkIn: { $lt: end },
        checkOut: { $gt: start },
      }).distinct("room");
      filter._id = { $nin: bookedRoomIds };
    }

    const rooms = await Room.find(filter).sort({ roomNumber: 1 });
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