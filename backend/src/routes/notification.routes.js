const express = require("express");

const {
  createNotification,
  createBulkNotifications,
  getMyNotifications,
  getUnreadCount,
  getNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteReadNotifications,
  getRecordNotifications,
  removeExpiredNotifications,
} = require("../controllers/notification.controller");

const { protect } = require("../middleware/auth.middleware");
const { allowRoles } = require("../middleware/role.middleware");

const { ROLES } = require("../config/constants");

const router = express.Router();

router.use(protect);

// Current user's notifications
router.get(
  "/my",
  getMyNotifications
);

// Current user's unread count
router.get(
  "/unread-count",
  getUnreadCount
);

// Get a single notification
router.get(
  "/:id",
  getNotification
);

// Mark one notification as read
router.put(
  "/:id/read",
  markAsRead
);

// Mark all notifications as read
router.put(
  "/read-all",
  markAllAsRead
);

// Delete one notification
router.delete(
  "/:id",
  deleteNotification
);

// Delete all read notifications
router.delete(
  "/read",
  deleteReadNotifications
);

// Get notifications related to a record
router.get(
  "/record/:recordId",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER
  ),
  getRecordNotifications
);

// Create notification manually
router.post(
  "/",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER
  ),
  createNotification
);

// Create notifications for multiple users
router.post(
  "/bulk",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER
  ),
  createBulkNotifications
);

// Remove expired notifications
router.delete(
  "/cleanup/expired",
  allowRoles(
    ROLES.ADMIN
  ),
  removeExpiredNotifications
);

module.exports = router;