const mongoose = require("mongoose");
const { Schema } = mongoose;

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
      enum: ["FACE_MISMATCH", "DOCUMENT_EXPIRED", "ADDRESS_INVALID"],
      default: null, // Allows null values instead of an empty string
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
    idvs: [{ type: Schema.Types.ObjectId, ref: "IDV" }], // ✅ Store ObjectId references
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

// Add instance methods
onboardingSchema.methods.isFullyVerified = async function () {
  const idvs = await this.populate("idvs");
  return (
    this.status === "COMPLETED" &&
    idvs.every((idv) => idv.status === "COMPLETED")
  );
};

// Add static methods
onboardingSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Pre-save middleware
onboardingSchema.pre("save", function (next) {
  if (this.isManualOverridden && !this.overriddenTimestamp) {
    this.overriddenTimestamp = new Date();
  }
  next();
});

const OnBoarding = mongoose.model("OnBoarding", onboardingSchema);
module.exports = OnBoarding;
