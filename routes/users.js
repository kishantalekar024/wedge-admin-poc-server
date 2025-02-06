const express = require("express");
const router = express.Router();
const User = require("../models/User"); // Make sure to adjust the path to your User model

// In routes/users.js
router.get("/", async (req, res) => {
  try {
    const { _start = 0, _end = 10, _sort = "id", _order = "ASC" } = req.query;

    const totalCount = await User.countDocuments();

    const users = await User.find()
      .sort({ [_sort]: _order.toLowerCase() })
      .skip(Number(_start))
      .limit(Number(_end) - Number(_start));

    // Transform the data to include id field
    const transformedData = users.map((user) => ({
      id: user._id, // Map _id to id
      ...user.toObject(), // Spread the rest of the user data
    }));

    res.set("X-Total-Count", totalCount);
    // Send the transformed data
    res.json(transformedData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get one user
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ id: user._id, ...user.toObject() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create user
router.post("/", async (req, res) => {
  const user = new User(req.body);
  try {
    const newUser = await user.save();
    res.status(201).json({ id: newUser._id, ...newUser.toObject() });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update user
router.put("/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ id: user._id, ...user.toObject() });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete user
router.delete("/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
