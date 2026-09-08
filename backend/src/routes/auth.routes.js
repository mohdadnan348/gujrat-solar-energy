const express = require("express");

const {
  register,
  login,
  forgotPassword,
  resetPassword,
  getMe,
  logout,
} = require("../controllers/auth.controller");

const { protect } = require("../middleware/auth.middleware");

const {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
} = require("../validators/auth.validator");

const router = express.Router();

// Register
router.post("/register", validateRegister, register);

// Login
router.post("/login", validateLogin, login);

// Forgot Password
router.post(
  "/forgot-password",
  validateForgotPassword,
  forgotPassword
);

// Reset Password
router.post(
  "/reset-password",
  validateResetPassword,
  resetPassword
);

// Get Current Logged-in User
router.get("/me", protect, getMe);

// Logout
router.post("/logout", protect, logout);

module.exports = router;