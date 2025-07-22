const mongoose = require("mongoose");

const inquirySchema = new mongoose.Schema(
  {
    // If dynamic product, can still store its ID (optional)
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: false,
    },

    // Product info snapshot (required to support static products)
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    productPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    inquiryDate: {
      type: Date,
      default: Date.now,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    message: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["new", "read", "archived"],
      default: "new",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Inquiry", inquirySchema);
