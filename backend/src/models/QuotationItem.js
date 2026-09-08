const mongoose = require("mongoose");

const quotationItemSchema = new mongoose.Schema(
  {
    quotation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quotation",
      required: [true, "Quotation reference is required"],
      index: true,
    },

    category: {
      type: String,
      required: [true, "Item category is required"],
      trim: true,
    },

    name: {
      type: String,
      required: [true, "Item name is required"],
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [0, "Quantity cannot be negative"],
    },

    unit: {
      type: String,
      trim: true,
      default: "pcs",
    },

    rate: {
      type: Number,
      required: [true, "Rate is required"],
      min: [0, "Rate cannot be negative"],
    },

    discount: {
      type: Number,
      min: [0, "Discount cannot be negative"],
      default: 0,
    },

    taxRate: {
      type: Number,
      min: [0, "Tax rate cannot be negative"],
      default: 0,
    },

    taxableAmount: {
      type: Number,
      min: [0, "Taxable amount cannot be negative"],
      default: 0,
    },

    taxAmount: {
      type: Number,
      min: [0, "Tax amount cannot be negative"],
      default: 0,
    },

    amount: {
      type: Number,
      min: [0, "Amount cannot be negative"],
      default: 0,
    },

    sortOrder: {
      type: Number,
      min: 0,
      default: 0,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

quotationItemSchema.index({
  quotation: 1,
  sortOrder: 1,
});

quotationItemSchema.index({
  quotation: 1,
  category: 1,
});

const QuotationItem = mongoose.model(
  "QuotationItem",
  quotationItemSchema
);

module.exports = QuotationItem;