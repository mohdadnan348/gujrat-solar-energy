const { body, param } = require("express-validator");

const createUserValidator = [
  body("username")
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage("Username must be between 3 and 50 characters."),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Please provide a valid email address.")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required.")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long."),

  body("role")
    .optional()
    .isIn(["Admin", "Manager", "HR", "Employee"])
    .withMessage("Invalid user role."),

  body("status")
    .optional()
    .isIn(["ACTIVE", "INACTIVE", "SUSPENDED"])
    .withMessage("Invalid user status."),
];

const updateUserValidator = [
  param("id")
    .isMongoId()
    .withMessage("Invalid user ID."),

  body("username")
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage("Username must be between 3 and 50 characters."),

  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email address.")
    .normalizeEmail(),

  body("password")
    .optional()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long."),

  body("role")
    .optional()
    .isIn(["Admin", "Manager", "HR", "Employee"])
    .withMessage("Invalid user role."),

  body("status")
    .optional()
    .isIn(["ACTIVE", "INACTIVE", "SUSPENDED"])
    .withMessage("Invalid user status."),
];

const userIdValidator = [
  param("id")
    .isMongoId()
    .withMessage("Invalid user ID."),
];

module.exports = {
  createUserValidator,
  updateUserValidator,
  userIdValidator,
};