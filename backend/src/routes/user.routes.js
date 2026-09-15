const express = require("express");

const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
} = require("../controllers/user.controller");

const { protect } = require("../middleware/auth.middleware");
const { allowRoles } = require("../middleware/role.middleware");

const router = express.Router();

router.use(protect);

// Get all users
router.get(
  "/",
  allowRoles("ADMIN", "MANAGER", "HR"),
  getUsers
);

// Get user by ID
router.get(
  "/:id",
  allowRoles("ADMIN", "MANAGER", "HR"),
  getUser
);

// Update user
router.put(
  "/:id",
  allowRoles("ADMIN"),
  updateUser
);

// Deactivate user
router.delete(
  "/:id",
  allowRoles("ADMIN"),
  deleteUser
);

module.exports = router;