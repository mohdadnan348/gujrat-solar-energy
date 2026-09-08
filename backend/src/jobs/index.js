const { markOverdueTasks } = require("./overdueTasks.job");
const { markExpiredQuotations } = require("./quotationExpiry.job");
const { removeExpiredNotifications } = require("./notifications.job");

let jobsStarted = false;

/**
 * Run all scheduled jobs.
 */
const runAllJobs = async () => {
  try {
    await markOverdueTasks();
  } catch (error) {
    console.error("[Jobs] Overdue tasks job failed:", error.message);
  }

  try {
    await markExpiredQuotations();
  } catch (error) {
    console.error("[Jobs] Quotation expiry job failed:", error.message);
  }

  try {
    await removeExpiredNotifications();
  } catch (error) {
    console.error("[Jobs] Notifications cleanup job failed:", error.message);
  }
};

/**
 * Start background jobs.
 *
 * Jobs run once immediately and then every hour.
 */
const startJobs = () => {
  if (jobsStarted) {
    console.log("[Jobs] Already started.");
    return;
  }

  jobsStarted = true;

  console.log("[Jobs] Starting background jobs...");

  // Run immediately when server starts
  runAllJobs();

  // Run every 1 hour
  setInterval(() => {
    runAllJobs();
  }, 60 * 60 * 1000);

  console.log("[Jobs] Background jobs started successfully.");
};

module.exports = {
  runAllJobs,
  startJobs,
};