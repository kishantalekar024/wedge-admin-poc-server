const mongoose = require("mongoose");
const { Schema } = mongoose;

// IDV (Identity Document Verification) Schema
const idvSchema = new Schema(
  {
    status: {
      type: String,
      enum: ["PENDING", "COMPLETED", "FAILED", "IN_PROGRESS"],
      required: true,
    },
    first_name: {
      type: String,
      required: true,
    },
    middle_name: String,
    last_name: {
      type: String,
      required: true,
    },
    street_address: String,
    Suburb: String,
    City: String,
    post_code: String,
    country_code: {
      type: String,
      minlength: 2,
      maxlength: 2,
    },
    DocumentType: {
      type: String,
      enum: ["PASSPORT", "DRIVERS_LICENSE", "NATIONAL_ID"],
      required: true,
    },
    failureCode: {
      type: String,
      enum: [
        "EXPIRED_DOC",
        "BLURRY_IMAGE",
        "INCOMPLETE_DATA",
        "ADDRESS_INVALID",
      ],
      default: null,
    },
    manualNotes: String,
    isManualOverridden: {
      type: Boolean,
      default: false,
    },
    overriddenBy: String,
  },
  {
    timestamps: true,
  }
);

// Create and export the model
const IDV = mongoose.model("IDV", idvSchema);

module.exports = IDV;
