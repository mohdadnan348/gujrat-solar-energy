const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    customerId: {
      type: String,
      required: [true, "Customer ID is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },

    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      default: null,
      index: true,
    },

    name: {
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
      required: [true, "Customer mobile number is required"],
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

    gstNumber: {
      type: String,
      trim: true,
      uppercase: true,
      default: "",
    },

    panNumber: {
      type: String,
      trim: true,
      uppercase: true,
      default: "",
    },

    customerType: {
      type: String,
      enum: ["Individual", "Business"],
      default: "Individual",
    },

    siteAddress: {
      type: String,
      trim: true,
      default: "",
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
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
// customerId ka separate index remove kiya gaya hai
// kyunki field par unique: true already index create karta hai.

customerSchema.index({
  mobile: 1,
});

customerSchema.index({
  email: 1,
});

customerSchema.index({
  companyName: 1,
});

// lead par field-level index: true already hai,
// isliye separate lead index remove kiya gaya hai.

customerSchema.index({
  status: 1,
});

customerSchema.index({
  createdAt: -1,
});

const Customer = mongoose.model(
  "Customer",
  customerSchema
);

module.exports = Customer;