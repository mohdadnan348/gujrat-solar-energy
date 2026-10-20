const express = require("express");
const controller = require("../controllers/notification.controller");
const { protect } = require("../middleware/auth.middleware");
const { allowRoles } = require("../middleware/role.middleware");
const { ROLES } = require("../config/constants");

const router = express.Router();
router.use(protect);

// Admin broadcast/history routes MUST be before /:id routes.
router.post("/broadcast", allowRoles(ROLES.ADMIN), controller.broadcastNotification);
router.get("/sent-history", allowRoles(ROLES.ADMIN), controller.getSentBroadcasts);

router.get("/my", controller.getMyNotifications);
router.get("/unread-count", controller.getUnreadCount);
router.put("/read-all", controller.markAllAsRead);
router.delete("/read", controller.deleteReadNotifications);
router.get("/record/:recordId", allowRoles(ROLES.ADMIN, ROLES.MANAGER), controller.getRecordNotifications);
router.post("/", allowRoles(ROLES.ADMIN, ROLES.MANAGER), controller.createNotification);
router.post("/bulk", allowRoles(ROLES.ADMIN, ROLES.MANAGER), controller.createBulkNotifications);
router.delete("/cleanup/expired", allowRoles(ROLES.ADMIN), controller.removeExpiredNotifications);
router.get("/:id", controller.getNotification);
router.put("/:id/read", controller.markAsRead);
router.delete("/:id", controller.deleteNotification);

module.exports = router;
