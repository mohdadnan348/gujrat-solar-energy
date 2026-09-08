const Notification = require("../models/Notification");

/**
 * Remove expired notifications.
 *
 * Notifications having an expiresAt date in the past
 * will be removed automatically.
 */
const removeExpiredNotifications = async () => {
  try {
    const now = new Date();

    const result = await Notification.deleteMany({
      expiresAt: {
        $ne: null,
        $lt: now,
      },
    });

    console.log(
      `[Notifications Job] Checked at ${now.toISOString()} | Removed: ${result.deletedCount}`
    );

    return result;
  } catch (error) {
    console.error("[Notifications Job] Failed:", error.message);
    throw error;
  }
};

module.exports = {
  removeExpiredNotifications,
};