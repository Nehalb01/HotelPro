const express = require("express");
const User = require("../models/User");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// All users (admin only)
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;