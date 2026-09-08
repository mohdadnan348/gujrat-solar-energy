const Task = require("../models/Task");
const { TASK_STATUS } = require("../config/constants");

/**
 * Mark overdue pending/in-progress tasks.
 *
 * A task is considered overdue when:
 * - dueDate is before current time
 * - status is Pending or In Progress
 * - task is not already Completed/Cancelled
 */
const markOverdueTasks = async () => {
  try {
    const now = new Date();

    const overdueStatus = TASK_STATUS.OVERDUE;

    // Safety check: model me OVERDUE status allowed hai ya nahi
    const statusEnum = Task.schema.path("status")?.enumValues || [];

    if (!overdueStatus || !statusEnum.includes(overdueStatus)) {
      console.log(
        "[Overdue Tasks Job] OVERDUE status is not configured in Task model."
      );

      return {
        matchedCount: 0,
        modifiedCount: 0,
      };
    }

    const result = await Task.updateMany(
      {
        dueDate: { $lt: now },
        status: {
          $in: [
            TASK_STATUS.PENDING,
            TASK_STATUS.IN_PROGRESS,
          ],
        },
      },
      {
        $set: {
          status: overdueStatus,
          updatedAt: now,
        },
      }
    );

    console.log(
      `[Overdue Tasks Job] Checked at ${now.toISOString()} | Updated: ${result.modifiedCount}`
    );

    return result;
  } catch (error) {
    console.error(
      "[Overdue Tasks Job] Failed:",
      error.message
    );

    throw error;
  }
};

module.exports = {
  markOverdueTasks,
};