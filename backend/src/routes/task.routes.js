
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

/*
|--------------------------------------------------------------------------
| Create Task
|--------------------------------------------------------------------------
| Admin / Manager can create tasks.
*/
router.post(
  "/",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER
  ),
  validateTask,
  createTask
);

/*
|--------------------------------------------------------------------------
| My Tasks
|--------------------------------------------------------------------------
| Each role can fetch tasks assigned to its own employee/user context.
*/
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

/*
|--------------------------------------------------------------------------
| Overdue Tasks
|--------------------------------------------------------------------------
| Admin / Manager can view all overdue tasks.
| Employee gets only own overdue tasks through controller/service scope.
*/
router.get(
  "/overdue",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.EMPLOYEE
  ),
  getOverdueTasks
);

/*
|--------------------------------------------------------------------------
| All Tasks
|--------------------------------------------------------------------------
| Admin / Manager / HR can access task listing.
| Employee uses /my instead.
*/
router.get(
  "/",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.HR
  ),
  getTasks
);

/*
|--------------------------------------------------------------------------
| Update Task Status
|--------------------------------------------------------------------------
| Employee can update status of own assigned task.
*/
router.patch(
  "/:id/status",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.EMPLOYEE
  ),
  updateTaskStatus
);

/*
|--------------------------------------------------------------------------
| Complete Task
|--------------------------------------------------------------------------
| Employee can complete own assigned task.
*/
router.patch(
  "/:id/complete",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.EMPLOYEE
  ),
  completeTask
);

/*
|--------------------------------------------------------------------------
| Cancel Task
|--------------------------------------------------------------------------
| Only Admin / Manager can cancel a task.
*/
router.patch(
  "/:id/cancel",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER
  ),
  cancelTask
);

/*
|--------------------------------------------------------------------------
| Update Task
|--------------------------------------------------------------------------
| Admin / Manager can update any task.
| Employee can update only own assigned task.
| Service layer performs ownership validation.
*/
router.put(
  "/:id",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.EMPLOYEE
  ),
  validateTaskUpdate,
  updateTask
);

/*
|--------------------------------------------------------------------------
| Delete / Deactivate Task
|--------------------------------------------------------------------------
| Only Admin / Manager can deactivate tasks.
*/
router.delete(
  "/:id",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER
  ),
  deleteTask
);

/*
|--------------------------------------------------------------------------
| Get Single Task
|--------------------------------------------------------------------------
| Service/controller handles employee ownership.
*/
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