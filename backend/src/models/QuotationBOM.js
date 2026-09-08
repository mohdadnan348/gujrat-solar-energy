const mongoose = require("mongoose");

const quotationBOMSchema = new mongoose.Schema(
  {
    quotation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quotation",
      required: [true, "Quotation reference is required"],
      index: true,
    },

    srNo: {
      type: Number,
      required: [true, "Serial number is required"],
      min: 1,
    },

    category: {
      type: String,
      trim: true,
      default: "",
    },

    item: {
      type: String,
      required: [true, "BOM item is required"],
      trim: true,
      maxlength: 300,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    qty: {
      type: Number,
      default: 1,
      min: 0,
    },

    unit: {
      type: String,
      trim: true,
      default: "Nos",
    },

    brand: {
      type: String,
      trim: true,
      default: "",
    },

    specification: {
      type: String,
      trim: true,
      default: "",
    },

    sortOrder: {
      type: Number,
      default: 0,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Created by is required"],
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

quotationBOMSchema.index({
  quotation: 1,
  srNo: 1,
});

quotationBOMSchema.index({
  quotation: 1,
  sortOrder: 1,
});

module.exports = mongoose.model(
  "QuotationBOM",
  quotationBOMSchema
);