const User = require("../models/User");
const Employee = require("../models/Employee");
const { hashPassword } = require("../utils/password");

const createUser = async (data, createdBy) => {
  const { username, email, password, role, status } = data;

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

  const user = await User.create({
    username,
    email: email.toLowerCase(),
    password: await hashPassword(password),
    role,
    status,
  });

  return User.findById(user._id)
    .select("-password -passwordResetToken -passwordResetExpires")
    .populate("role", "name description");
};

const getUsers = async ({
  page = 1,
  limit = 10,
  search = "",
  role,
  status,
}) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { username: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  if (role) filter.role = role;
  if (status) filter.status = status;

  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find(filter)
      .select("-password -passwordResetToken -passwordResetExpires")
      .populate("role", "name description")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    User.countDocuments(filter),
  ]);

  return {
    users,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getUserById = async (userId) => {
  const user = await User.findById(userId)
    .select("-password -passwordResetToken -passwordResetExpires")
    .populate("role", "name description");

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return user;
};

const updateUser = async (userId, data) => {
  const user = await User.findById(userId);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  if (data.email) {
    const existingEmail = await User.findOne({
      email: data.email.toLowerCase(),
      _id: { $ne: userId },
    });

    if (existingEmail) {
      const error = new Error("Email already exists");
      error.statusCode = 409;
      throw error;
    }

    user.email = data.email.toLowerCase();
  }

  if (data.username !== undefined) {
    const existingUsername = await User.findOne({
      username: data.username,
      _id: { $ne: userId },
    });

    if (existingUsername) {
      const error = new Error("Username already exists");
      error.statusCode = 409;
      throw error;
    }

    user.username = data.username;
  }

  if (data.role !== undefined) user.role = data.role;
  if (data.status !== undefined) user.status = data.status;

  if (data.password) {
    user.password = await hashPassword(data.password);
  }

  await user.save();

  return User.findById(user._id)
    .select("-password -passwordResetToken -passwordResetExpires")
    .populate("role", "name description");
};

const deleteUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  // Historical data safe rakhne ke liye hard delete nahi.
  user.status = "Inactive";
  await user.save();

  return {
    message: "User deactivated successfully",
  };
};

const getUserEmployee = async (userId) => {
  const employee = await Employee.findOne({ user: userId });

  if (!employee) {
    const error = new Error("Employee profile not found for this user");
    error.statusCode = 404;
    throw error;
  }

  return employee;
};

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserEmployee,
};