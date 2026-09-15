const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    value: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    category: {
      type: String,
      enum: [
        "COMPANY",
        "SYSTEM",
        "QUOTATION",
        "INVOICE",
        "NOTIFICATION",
        "OTHER",
      ],
      default: "SYSTEM",
      index: true,
    },

    description: {
      type: String,
      trim: true,
    },

    isPublic: {
      type: Boolean,
      default: false,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

settingSchema.index({
  category: 1,
  key: 1,
});

module.exports = mongoose.model("Setting", settingSchema);