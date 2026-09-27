const User = require("../models/User");
const Employee = require("../models/Employee");
const { hashPassword, comparePassword } = require("../utils/password");
const { generateToken } = require("../utils/jwt");

const login = async ({ email, password }) => {
  const normalizedEmail = email.toLowerCase().trim();

  const user = await User.findOne({
    email: normalizedEmail,
  }).select("+password");

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isPasswordValid = await comparePassword(
    password,
    user.password
  );

  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  if (user.status !== "Active") {
    throw new Error("Your account is inactive");
  }

  user.lastLoginAt = new Date();
  await user.save();

  const token = generateToken({
    userId: user._id,
    role: user.role,
  });

  const employee = await Employee.findOne({
    user: user._id,
  }).select(
    "employeeId name email mobile department designation joiningDate role manager status profileImage"
  );

  const userData = user.toObject();
  delete userData.password;

  return {
    user: userData,
    employee,
    token,
  };
};

const register = async (data) => {
  const {
    username,
    email,
    password,
    role = "EMPLOYEE",
    status = "Active",
  } = data;

  const normalizedEmail = email.toLowerCase().trim();

  const existingUser = await User.findOne({
    email: normalizedEmail,
  });

  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  const existingUsername = await User.findOne({
    username: username.toLowerCase().trim(),
  });

  if (existingUsername) {
    throw new Error("Username already exists");
  }

  const hashedPassword = await hashPassword(password);

  const user = await User.create({
    username: username.toLowerCase().trim(),
    email: normalizedEmail,
    password: hashedPassword,
    role,
    status,
  });

  const token = generateToken({
    userId: user._id,
    role: user.role,
  });

  const userData = user.toObject();
  delete userData.password;

  return {
    user: userData,
    token,
  };
};

const getProfile = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  const employee = await Employee.findOne({
    user: user._id,
  }).select(
    "employeeId name email mobile department designation joiningDate role manager status profileImage address notes"
  );

  const userData = user.toObject();
  delete userData.password;

  return {
    user: userData,
    employee,
  };
};

const changePassword = async (
  userId,
  currentPassword,
  newPassword
) => {
  const user = await User.findById(userId).select("+password");

  if (!user) {
    throw new Error("User not found");
  }

  const isCurrentPasswordValid = await comparePassword(
    currentPassword,
    user.password
  );

  if (!isCurrentPasswordValid) {
    throw new Error("Current password is incorrect");
  }

  user.password = await hashPassword(newPassword);

  await user.save();

  return {
    message: "Password changed successfully",
  };
};

const forgotPassword = async (email) => {
  const normalizedEmail = email.toLowerCase().trim();

  const user = await User.findOne({
    email: normalizedEmail,
  }).select("+resetPasswordToken +resetPasswordExpires");

  if (!user) {
    return {
      message:
        "If an account exists with this email, a password reset link will be sent",
    };
  }

  const crypto = require("crypto");

  const resetToken = crypto.randomBytes(32).toString("hex");

  user.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  user.resetPasswordExpires =
    Date.now() + 15 * 60 * 1000;

  await user.save();

  return {
    message:
      "If an account exists with this email, a password reset link will be sent",
    resetToken,
  };
};

const resetPassword = async (token, newPassword) => {
  const crypto = require("crypto");

  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: {
      $gt: Date.now(),
    },
  }).select(
    "+resetPasswordToken +resetPasswordExpires +password"
  );

  if (!user) {
    throw new Error("Invalid or expired reset token");
  }

  user.password = await hashPassword(newPassword);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();

  return {
    message: "Password reset successfully",
  };
};

module.exports = {
  login,
  register,
  getProfile,
  changePassword,
  forgotPassword,
  resetPassword,
};