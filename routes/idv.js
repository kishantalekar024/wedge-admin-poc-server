const express = require("express");
const router = express.Router();
const IDV = require("../models/IDV");
const mongoose = require("mongoose");

router.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      perPage = 10,
      filter = "{}",
      order = "asc",
      sort = "createdAt",
    } = req.query;
    let filterObj;

    // Parse and decode filter
    try {
      filterObj = JSON.parse(decodeURIComponent(filter));
    } catch (error) {
      return res.status(400).json({ message: "Invalid filter format" });
    }
    console.log("filterObj", filterObj);
    // Convert 'id' array to '_id' with ObjectId
    if (filterObj.id && Array.isArray(filterObj.id)) {
      filterObj._id = {
        $in: filterObj.id.map((id) => new mongoose.Types.ObjectId(id)),
      };
      delete filterObj.id;
    }

    const hasIdFilter = filterObj._id && filterObj._id.$in;

    // Count total documents
    const total = await IDV.countDocuments(filterObj);

    // Determine sort direction
    const sortOrder = order === "asc" ? 1 : -1;
    const sortConfig = { [sort]: sortOrder };

    let idvs, currentPage, totalPages;

    if (hasIdFilter) {
      // Bypass pagination when IDs are specified
      idvs = await IDV.find(filterObj).sort(sortConfig);
      currentPage = 1;
      totalPages = 1;
    } else {
      // Apply pagination
      const pageNum = Number(page);
      const perPageNum = Number(perPage);
      const skipAmount = (pageNum - 1) * perPageNum;

      totalPages = Math.ceil(total / perPageNum);
      currentPage = pageNum;

      idvs = await IDV.find(filterObj)
        .sort(sortConfig)
        .skip(skipAmount)
        .limit(perPageNum);
    }

    res.json({
      data: idvs.map((idv) => ({ ...idv.toObject(), id: idv._id })),
      total,
      currentPage,
      totalPages,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error fetching IDVs", error: error.message });
  }
});
// 📌 Get a single IDV by ID
router.get("/:idvId", async (req, res) => {
  try {
    const idv = await IDV.findById(req.params.idvId);
    if (!idv) return res.status(404).json({ message: "IDV not found" });

    res.json({ data: { ...idv.toObject(), id: idv._id } });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching IDV", error: error.message });
  }
});

// 📌 Update an IDV (all fields)
router.put("/:idvId", async (req, res) => {
  try {
    const updatedIdv = await IDV.findByIdAndUpdate(req.params.idvId, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedIdv) return res.status(404).json({ message: "IDV not found" });

    res.json({ data: { ...updatedIdv.toObject(), id: updatedIdv._id } });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating IDV", error: error.message });
  }
});

// 📌 Delete an IDV
router.delete("/:idvId", async (req, res) => {
  try {
    const deletedIdv = await IDV.findByIdAndDelete(req.params.idvId);
    if (!deletedIdv) return res.status(404).json({ message: "IDV not found" });

    res.json({ data: { ...deletedIdv.toObject(), id: deletedIdv._id } });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting IDV", error: error.message });
  }
});

module.exports = router;
