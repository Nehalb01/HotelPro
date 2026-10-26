const express = require("express");
const Booking = require("../models/Booking");
const Room = require("../models/Room");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// Create a booking (logged-in user)
router.post("/", protect, async (req, res) => {
  try {
    const { room, checkIn, checkOut, guests, phone } = req.body;

    const roomDoc = await Room.findById(room);
    if (!roomDoc) return res.status(404).json({ message: "Room not found" });

    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    if (isNaN(nights) || nights <= 0) {
      return res.status(400).json({ message: "Check-out must be after check-in" });
    }

    // Block overlapping bookings for the same room
    const clash = await Booking.findOne({
      room,
      status: { $in: ["booked", "checked-in"] },
      checkIn: { $lt: end },
      checkOut: { $gt: start },
    });
    if (clash) {
      return res
        .status(400)
        .json({ message: "Room is already booked for these dates" });
    }

    const booking = await Booking.create({
      user: req.user.id,
      room,
      checkIn: start,
      checkOut: end,
      guests: guests || 1,
      phone: phone || "",
      totalPrice: nights * roomDoc.price,
    });

    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// My bookings (logged-in user)
router.get("/my", protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate("room", "name type price image")
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// All bookings (admin only)
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("room", "name type price")
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update booking status (admin only)
router.put("/:id/status", protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["booked", "checked-in", "checked-out", "cancelled"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Cancel my own booking (logged-in user)
router.put("/:id/cancel", protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (String(booking.user) !== String(req.user.id)) {
      return res.status(403).json({ message: "Not your booking" });
    }
    if (booking.status !== "booked") {
      return res
        .status(400)
        .json({ message: "Only bookings that are not checked in can be cancelled" });
    }
    booking.status = "cancelled";
    await booking.save();
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;