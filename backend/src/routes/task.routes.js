const express = require("express");

const {
  createTask,
  getTask,
  getTasks,
  getMyTasks,
  updateTask,
  updateTaskStatus,
  completeTask,
  cancelTask,
  getOverdueTasks,
  deleteTask,
} = require("../controllers/task.controller");

const { protect } = require("../middleware/auth.middleware");
const { allowRoles } = require("../middleware/role.middleware");

const {
  validateTask,
  validateTaskUpdate,
} = require("../validators/task.validator");

const { ROLES } = require("../config/constants");

const router = express.Router();

router.use(protect);

// Create task
router.post(
  "/",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER
  ),
  validateTask,
  createTask
);

// Get my assigned tasks
router.get(
  "/my",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.HR,
    ROLES.EMPLOYEE
  ),
  getMyTasks
);

// Get overdue tasks
router.get(
  "/overdue",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER
  ),
  getOverdueTasks
);

// Get all tasks
router.get(
  "/",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.HR
  ),
  getTasks
);

// Update task status
router.patch(
  "/:id/status",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.EMPLOYEE
  ),
  updateTaskStatus
);

// Complete task
router.patch(
  "/:id/complete",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.EMPLOYEE
  ),
  completeTask
);

// Cancel task
router.patch(
  "/:id/cancel",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER
  ),
  cancelTask
);

// Update task
router.put(
  "/:id",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER
  ),
  validateTaskUpdate,
  updateTask
);

// Deactivate task
router.delete(
  "/:id",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER
  ),
  deleteTask
);

// Get single task
router.get(
  "/:id",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.HR,
    ROLES.EMPLOYEE
  ),
  getTask
);

module.exports = router;