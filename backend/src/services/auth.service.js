const User = require("../models/User");
const Employee = require("../models/Employee");
const Role = require("../models/Role");
const { hashPassword, comparePassword } = require("../utils/password");
const { generateToken } = require("../utils/jwt");

const login = async ({ email, password }) => {
  const user = await User.findOne({ email: email.toLowerCase() })
    .select("+password")
    .populate("role", "name description");

  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  if (user.status !== "Active") {
    const error = new Error("User account is inactive");
    error.statusCode = 403;
    throw error;
  }

  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  user.lastLoginAt = new Date();
  await user.save();

  const token = generateToken({
    userId: user._id,
    role: user.role,
  });

  const employee = await Employee.findOne({ user: user._id }).select(
    "employeeId name email mobile department designation joiningDate role manager status profileImage"
  );

  return {
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
      lastLoginAt: user.lastLoginAt,
    },
    employee,
    token,
  };
};

const register = async ({
  username,
  email,
  password,
  role = "EMPLOYEE",
}) => {
  const existingUser = await User.findOne({
    $or: [
      { email: email.toLowerCase() },
      ...(username ? [{ username }] : []),
    ],
  });

  if (existingUser) {
    const error = new Error("User with this email or username already exists");
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await hashPassword(password);

  const user = await User.create({
    username,
    email: email.toLowerCase(),
    password: hashedPassword,
    role,
  });

  const safeUser = await User.findById(user._id).select(
    "-password -passwordResetToken -passwordResetExpires"
  );

  return safeUser;
};

const getProfile = async (userId) => {
  const user = await User.findById(userId)
    .populate("role", "name description")
    .select("-password -passwordResetToken -passwordResetExpires");

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const employee = await Employee.findOne({ user: user._id }).select(
    "employeeId name email mobile department designation joiningDate role manager status profileImage address notes"
  );

  return {
    user,
    employee,
  };
};

const changePassword = async ({
  userId,
  currentPassword,
  newPassword,
}) => {
  const user = await User.findById(userId).select("+password");

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const isCurrentPasswordValid = await comparePassword(
    currentPassword,
    user.password
  );

  if (!isCurrentPasswordValid) {
    const error = new Error("Current password is incorrect");
    error.statusCode = 400;
    throw error;
  }

  user.password = await hashPassword(newPassword);
  await user.save();

  return {
    message: "Password changed successfully",
  };
};

module.exports = {
  login,
  register,
  getProfile,
  changePassword,
};