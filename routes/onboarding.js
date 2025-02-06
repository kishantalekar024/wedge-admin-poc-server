const express = require("express");
const router = express.Router();
const OnBoarding = require("../models/Onboarding");

// GET all identity verifications with pagination and filters
router.get("/", async (req, res) => {
  try {
    console.log(req);
    const { page = 1, limit = 10, status, email, ird_number } = req.query;

    // Build query based on filters
    const query = {};
    if (status) query.status = status;
    if (email) query.email = new RegExp(email, "i");
    if (ird_number) query.ird_number = ird_number;
    console.log("Query", query);
    // Execute query with pagination
    const identities = await OnBoarding.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const transformedIdentities = identities.map((item) => {
      console.log(item._id);
      return {
        ...item.toObject(),
        id: item._id,
      };
    });
    // Get total documents
    const total = await OnBoarding.countDocuments(query);

    res.json({
      data: transformedIdentities,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error fetching identity verifications",
      error: error.message,
    });
  }
});

// GET single identity verification by ID
router.get("/:id", async (req, res) => {
  try {
    const identity = await OnBoarding.findById(req.params.id);
    if (!identity) {
      return res
        .status(404)
        .json({ message: "Identity verification not found" });
    }
    res.json({ ...identity, id: req.params.id });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching identity verification",
      error: error.message,
    });
  }
});

// // POST new identity verification
router.post("/", async (req, res) => {
  try {
    const newIdentity = new OnBoarding(req.body);
    const savedIdentity = await newIdentity.save();
    res.status(201).json(savedIdentity);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({
        message: "Duplicate entry found",
        error: error.message,
      });
    } else {
      res.status(500).json({
        message: "Error creating identity verification",
        error: error.message,
      });
    }
  }
});

// // PUT update identity verification
router.put("/:id", async (req, res) => {
  try {
    const updatedIdentity = await OnBoarding.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedIdentity) {
      return res
        .status(404)
        .json({ message: "Identity verification not found" });
    }

    res.json(updatedIdentity);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({
        message: "Duplicate entry found",
        error: error.message,
      });
    } else {
      res.status(500).json({
        message: "Error updating identity verification",
        error: error.message,
      });
    }
  }
});

// // PATCH update identity verification status
router.patch("/:id/status", async (req, res) => {
  try {
    const { status, manualNotes, overriddenBy } = req.body;

    const identity = await OnBoarding.findById(req.params.id);
    if (!identity) {
      return res
        .status(404)
        .json({ message: "Identity verification not found" });
    }

    identity.status = status;
    if (manualNotes) identity.manualNotes = manualNotes;
    if (overriddenBy) {
      identity.isManualOverridden = true;
      identity.overriddenBy = overriddenBy;
      identity.overriddenTimestamp = new Date();
    }

    const updatedIdentity = await identity.save();
    res.json(updatedIdentity);
  } catch (error) {
    res.status(500).json({
      message: "Error updating identity verification status",
      error: error.message,
    });
  }
});

// // DELETE identity verification
router.delete("/:id", async (req, res) => {
  try {
    const deletedIdentity = await OnBoarding.findByIdAndDelete(req.params.id);

    if (!deletedIdentity) {
      return res
        .status(404)
        .json({ message: "Identity verification not found" });
    }

    res.json({ message: "Identity verification deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting identity verification",
      error: error.message,
    });
  }
});

module.exports = router;
