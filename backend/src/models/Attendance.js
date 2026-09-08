const mongoose = require("mongoose");
const { ATTENDANCE_STATUS } = require("../config/constants");

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Employee is required"],
      index: true,
    },

    attendanceDate: {
      type: Date,
      required: [true, "Attendance date is required"],
      index: true,
    },

    status: {
      type: String,
      enum: Object.values(ATTENDANCE_STATUS),
      required: [true, "Attendance status is required"],
      default: ATTENDANCE_STATUS.PRESENT,
      index: true,
    },

    checkIn: {
      type: Date,
      default: null,
    },

    checkOut: {
      type: Date,
      default: null,
    },

    totalHours: {
      type: Number,
      min: 0,
      default: 0,
    },

    lateMinutes: {
      type: Number,
      min: 0,
      default: 0,
    },

    overtimeHours: {
      type: Number,
      min: 0,
      default: 0,
    },

    remarks: {
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

// One attendance record per employee per day
attendanceSchema.index(
  {
    employee: 1,
    attendanceDate: 1,
  },
  {
    unique: true,
  }
);

attendanceSchema.index({
  attendanceDate: -1,
});

attendanceSchema.index({
  employee: 1,
  status: 1,
});

attendanceSchema.index({
  status: 1,
  attendanceDate: -1,
});

const Attendance = mongoose.model(
  "Attendance",
  attendanceSchema
);

module.exports = Attendance;