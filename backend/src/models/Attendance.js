const mongoose = require("mongoose");
const { ATTENDANCE_STATUS } = require("../config/constants");

const attendanceSchema = new mongoose.Schema(
  {
    /*
    |--------------------------------------------------------------------------
    | Employee
    |--------------------------------------------------------------------------
    | Attendance directly Employee collection se linked hai.
    |
    | Employee._id:
    | 6ab6430d032e8dc3a8c27e8a
    |
    | Employee.user:
    | 6ab6430d032e8dc3a8c27e88
    |
    | Attendance.employee mein Employee._id save hoga.
    |--------------------------------------------------------------------------
    */
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: [true, "Employee is required"],
      index: true,
    },

    /*
    |--------------------------------------------------------------------------
    | Attendance Date
    |--------------------------------------------------------------------------
    */
    attendanceDate: {
      type: Date,
      required: [true, "Attendance date is required"],
      index: true,
    },

    /*
    |--------------------------------------------------------------------------
    | Status
    |--------------------------------------------------------------------------
    */
    status: {
      type: String,
      enum: Object.values(ATTENDANCE_STATUS),
      required: [true, "Attendance status is required"],
      default: ATTENDANCE_STATUS.PRESENT,
      index: true,
    },

    /*
    |--------------------------------------------------------------------------
    | Check In
    |--------------------------------------------------------------------------
    */
    checkIn: {
      type: Date,
      default: null,
    },

    /*
    |--------------------------------------------------------------------------
    | Check Out
    |--------------------------------------------------------------------------
    */
    checkOut: {
      type: Date,
      default: null,
    },

    /*
    |--------------------------------------------------------------------------
    | Total Working Hours
    |--------------------------------------------------------------------------
    */
    totalHours: {
      type: Number,
      min: 0,
      default: 0,
    },

    /*
    |--------------------------------------------------------------------------
    | Late Minutes
    |--------------------------------------------------------------------------
    */
    lateMinutes: {
      type: Number,
      min: 0,
      default: 0,
    },

    /*
    |--------------------------------------------------------------------------
    | Overtime Hours
    |--------------------------------------------------------------------------
    */
    overtimeHours: {
      type: Number,
      min: 0,
      default: 0,
    },

    /*
    |--------------------------------------------------------------------------
    | Remarks
    |--------------------------------------------------------------------------
    */
    remarks: {
      type: String,
      trim: true,
      default: "",
    },

    /*
    |--------------------------------------------------------------------------
    | Created By
    |--------------------------------------------------------------------------
    */
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    /*
    |--------------------------------------------------------------------------
    | Updated By
    |--------------------------------------------------------------------------
    */
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

/*
|--------------------------------------------------------------------------
| One attendance record per employee per day
|--------------------------------------------------------------------------
*/

attendanceSchema.index(
  {
    employee: 1,
    attendanceDate: 1,
  },
  {
    unique: true,
  }
);

/*
|--------------------------------------------------------------------------
| Date Index
|--------------------------------------------------------------------------
*/

attendanceSchema.index({
  attendanceDate: -1,
});

/*
|--------------------------------------------------------------------------
| Employee + Status Index
|--------------------------------------------------------------------------
*/

attendanceSchema.index({
  employee: 1,
  status: 1,
});

/*
|--------------------------------------------------------------------------
| Status + Date Index
|--------------------------------------------------------------------------
*/

attendanceSchema.index({
  status: 1,
  attendanceDate: -1,
});

/*
|--------------------------------------------------------------------------
| Model
|--------------------------------------------------------------------------
*/

const Attendance = mongoose.model(
  "Attendance",
  attendanceSchema
);

module.exports = Attendance;