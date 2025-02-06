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
        "",
      ],
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

// Main Identity Verification Schema
const onboardingSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    ird_number: {
      type: String,
      required: true,
      match: [/^INRD\d{5}$/, "Please enter a valid IRD number"],
    },
    status: {
      type: String,
      enum: [
        "REJECTED",
        "FAILED",
        "COMPLETED",
        "MANUAL_IDV_REQUESTED",
        "IN_PROGRESS",
      ],
      required: true,
    },
    intended_transaction_count: {
      type: Number,
      required: true,
      min: 0,
    },
    intended_transaction_amount: {
      type: Number,
      required: true,
      min: 0,
    },
    phone_number: {
      type: String,
      required: true,
    },
    failureReason: {
      type: String,
      enum: ["FACE_MISMATCH", "DOCUMENT_EXPIRED", "ADDRESS_INVALID", ""],
    },
    manualNotes: String,
    isManualOverridden: {
      type: Boolean,
      default: false,
    },
    overriddenBy: String,
    overriddenTimestamp: {
      type: Date,
    },
    idvs: [idvSchema],
  },
  {
    timestamps: true,
    collection: "identity_verifications",
  }
);

// Indexes
onboardingSchema.index({ email: 1 }, { unique: true });
onboardingSchema.index({ ird_number: 1 }, { unique: true });
onboardingSchema.index({ status: 1 });

// Add any custom methods if needed
onboardingSchema.methods.isFullyVerified = function () {
  return (
    this.status === "COMPLETED" &&
    this.idvs.every((idv) => idv.status === "COMPLETED")
  );
};

// Add any static methods if needed
onboardingSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Pre-save middleware
onboardingSchema.pre("save", function (next) {
  // Set overriddenTimestamp when isManualOverridden is true
  if (this.isManualOverridden && !this.overriddenTimestamp) {
    this.overriddenTimestamp = new Date();
  }
  next();
});

// Create and export the model
const OnBoarding = mongoose.model("OnBoarding", onboardingSchema);

module.exports = OnBoarding;
