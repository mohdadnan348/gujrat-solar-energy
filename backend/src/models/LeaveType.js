const mongoose = require("mongoose");

const leaveTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Leave type name is required"],
      trim: true,
      unique: true,
    },

    code: {
      type: String,
      required: [true, "Leave type code is required"],
      trim: true,
      uppercase: true,
      unique: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    totalDays: {
      type: Number,
      required: [true, "Total leave days are required"],
      min: [0, "Total leave days cannot be negative"],
      default: 0,
    },

    isPaid: {
      type: Boolean,
      default: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
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

// Additional useful indexes
// name, code and isActive indexes are already created
// through their field-level unique/index definitions.

const LeaveType = mongoose.model("LeaveType", leaveTypeSchema);

module.exports = LeaveType;