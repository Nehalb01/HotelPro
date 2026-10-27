const express = require("express");
const bcrypt = require("bcryptjs");
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

// Update my profile
router.put("/me", protect, async (req, res) => {
  try {
    const { name, phone } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Name is required" });
    }
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name: name.trim(), phone: phone || "" },
      { new: true }
    ).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Change my password
router.put("/me/password", protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "New password must be at least 6 characters" });
    }
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    const match = await bcrypt.compare(currentPassword || "", user.password);
    if (!match) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: "Password updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;