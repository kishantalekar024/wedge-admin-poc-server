// routes/posts.js
const express = require("express");
const router = express.Router();
const Post = require("../models/Post");

// Similarly in routes/posts.js
router.get("/", async (req, res) => {
  try {
    const { _start = 0, _end = 10, _sort = "id", _order = "ASC" } = req.query;

    const totalCount = await Post.countDocuments();

    const posts = await Post.find()
      .sort({ [_sort]: _order.toLowerCase() })
      .skip(Number(_start))
      .limit(Number(_end) - Number(_start));

    const transformedData = posts.map((post) => ({
      id: post._id,
      ...post.toObject(),
    }));

    res.set("X-Total-Count", totalCount);
    res.json(transformedData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get one post
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      "userId",
      "name email"
    );
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json({ id: post._id, ...post.toObject() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create post
router.post("/", async (req, res) => {
  const post = new Post(req.body);
  try {
    const newPost = await post.save();
    res.status(201).json({ id: newPost._id, ...newPost.toObject() });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update post
router.put("/:id", async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json({ id: post._id, ...post.toObject() });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete post
router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
