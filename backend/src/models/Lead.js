const mongoose = require("mongoose");

const {
  LEAD_STATUS,
  LEAD_PRIORITY,
  LEAD_SOURCES,
} = require("../config/constants");

const leadSchema = new mongoose.Schema(
  {
    leadId: {
      type: String,
      required: [true, "Lead ID is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },

    customerName: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
    },

    companyName: {
      type: String,
      trim: true,
      default: "",
    },

    mobile: {
      type: String,
      required: [true, "Mobile number is required"],
      trim: true,
    },

    alternateMobile: {
      type: String,
      trim: true,
      default: "",
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },

    address: {
      type: String,
      trim: true,
      default: "",
    },

    city: {
      type: String,
      trim: true,
      default: "",
    },

    state: {
      type: String,
      trim: true,
      default: "",
    },

    pincode: {
      type: String,
      trim: true,
      default: "",
    },

    leadSource: {
      type: String,
      enum: LEAD_SOURCES,
      default: null,
    },

    requirement: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: Object.values(LEAD_STATUS),
      default: LEAD_STATUS.NEW,
    },

    priority: {
      type: String,
      enum: Object.values(LEAD_PRIORITY),
      default: LEAD_PRIORITY.MEDIUM,
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },

    followUpDate: {
      type: Date,
      default: null,
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },

    lostReason: {
      type: String,
      trim: true,
      default: "",
    },

    convertedCustomer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      default: null,
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

// Indexes

// leadId par unique: true already index create karta hai.
// Isliye separate leadId index nahi rakha gaya.

leadSchema.index({
  mobile: 1,
});

leadSchema.index({
  email: 1,
});

leadSchema.index({
  status: 1,
});

leadSchema.index({
  priority: 1,
});

leadSchema.index({
  assignedTo: 1,
});

leadSchema.index({
  followUpDate: 1,
});

leadSchema.index({
  createdAt: -1,
});

const Lead = mongoose.model("Lead", leadSchema);

module.exports = Lead;