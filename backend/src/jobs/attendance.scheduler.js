/**
 * Attendance automation scheduler.
 *
 * Import this module once from the backend entry point AFTER MongoDB connects.
 * It runs immediately (to backfill missing dates in the current month) and
 * then every 5 minutes. Today's employees without check-in are marked Absent
 * once local server time reaches 3:00 PM.
 *
 * Set process.env.TZ=Asia/Kolkata in the backend environment so attendance
 * cutoffs and date boundaries use India Standard Time.
 */
const {
  runDailyAttendanceAutomation,
} = require("../services/attendance.service");

let started = false;
let interval = null;

const startAttendanceScheduler = () => {
  if (started) return;
  started = true;

  const run = async () => {
    try {
      await runDailyAttendanceAutomation(new Date());
    } catch (error) {
      console.error("[Attendance Scheduler] Run failed:", error);
    }
  };

  // Start after a short delay so app startup / DB connection can finish.
  setTimeout(run, 5000);
  interval = setInterval(run, 5 * 60 * 1000);
};

const stopAttendanceScheduler = () => {
  if (interval) clearInterval(interval);
  interval = null;
  started = false;
};

module.exports = {
  startAttendanceScheduler,
  stopAttendanceScheduler,
};
