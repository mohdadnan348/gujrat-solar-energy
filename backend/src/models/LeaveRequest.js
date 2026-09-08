const mongoose = require("mongoose");
const { LEAVE_STATUS } = require("../config/constants");

const leaveRequestSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Employee is required"],
      index: true,
    },

    leaveType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LeaveType",
      required: [true, "Leave type is required"],
      index: true,
    },

    startDate: {
      type: Date,
      required: [true, "Start date is required"],
      index: true,
    },

    endDate: {
      type: Date,
      required: [true, "End date is required"],
      index: true,
    },

    totalDays: {
      type: Number,
      required: [true, "Total leave days are required"],
      min: [0.5, "Leave must be at least 0.5 day"],
    },

    reason: {
      type: String,
      required: [true, "Leave reason is required"],
      trim: true,
    },

    status: {
      type: String,
      enum: Object.values(LEAVE_STATUS),
      default: LEAVE_STATUS.PENDING,
      index: true,
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    approvedAt: {
      type: Date,
      default: null,
    },

    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    rejectedAt: {
      type: Date,
      default: null,
    },

    rejectionReason: {
      type: String,
      trim: true,
      default: "",
    },

    cancelledAt: {
      type: Date,
      default: null,
    },

    cancellationReason: {
      type: String,
      trim: true,
      default: "",
    },

    notes: {
      type: String,
      trim: true,
      default: "",
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

// Employee + date range lookup
leaveRequestSchema.index({
  employee: 1,
  startDate: -1,
});

leaveRequestSchema.index({
  employee: 1,
  endDate: -1,
});

leaveRequestSchema.index({
  leaveType: 1,
  status: 1,
});

leaveRequestSchema.index({
  status: 1,
  startDate: -1,
});

leaveRequestSchema.index({
  createdAt: -1,
});

const LeaveRequest = mongoose.model(
  "LeaveRequest",
  leaveRequestSchema
);

module.exports = LeaveRequest;