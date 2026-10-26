const express = require("express");
const Booking = require("../models/Booking");
const Room = require("../models/Room");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// Create a booking (logged-in users)
router.post("/", protect, async (req, res) => {
  try {
    const { room, checkIn, checkOut, guests, phone, cardHolderName, cardNumber, cardExpiry } = req.body;

    if (!room || !checkIn || !checkOut) {
      return res.status(400).json({ message: "Room, check-in and check-out are required" });
    }

    const start = new Date(checkIn);
    const end = new Date(checkOut);

    if (isNaN(start) || isNaN(end) || end <= start) {
      return res.status(400).json({ message: "Check-out must be after check-in" });
    }

    const roomData = await Room.findById(room);
    if (!roomData) return res.status(404).json({ message: "Room not found" });

    // Check for overlapping bookings on the same room
    const clash = await Booking.findOne({
      room,
      status: { $in: ["booked", "checked-in"] },
      checkIn: { $lt: end },
      checkOut: { $gt: start },
    });

    if (clash) {
      return res.status(400).json({ message: "Room is not available for these dates" });
    }

    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const totalPrice = nights * roomData.price;

       const booking = await Booking.create({
      user: req.user.id,
      room,
      checkIn: start,
      checkOut: end,
      guests,
      totalPrice,
      phone,
      cardHolderName,
      cardLast4: cardNumber ? String(cardNumber).slice(-4) : "",
      cardExpiry,
    });
    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// My bookings
router.get("/my", protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate("room")
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
      .populate("user", "name email")
      .populate("room")
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Cancel a booking (owner or admin)
router.put("/:id/cancel", protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not allowed" });
    }

    booking.status = "cancelled";
    await booking.save();
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update status: check-in / check-out (admin only)
router.put("/:id/status", protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.json(booking);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;