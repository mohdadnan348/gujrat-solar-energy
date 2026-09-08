const Employee = require("../models/Employee");
const User = require("../models/User");
const { hashPassword } = require("../utils/password");
const { ROLES, USER_STATUS } = require("../config/constants");

const generateEmployeeId = async () => {
  const lastEmployee = await Employee.findOne({})
    .sort({ createdAt: -1 })
    .select("employeeId")
    .lean();

  if (!lastEmployee || !lastEmployee.employeeId) {
    return "EMP-0001";
  }

  const match = lastEmployee.employeeId.match(/(\d+)$/);
  const lastNumber = match ? Number(match[1]) : 0;

  return `EMP-${String(lastNumber + 1).padStart(4, "0")}`;
};

const createEmployee = async (data, createdBy) => {
  const {
    name,
    email,
    mobile,
    department,
    designation,
    joiningDate,
    role = ROLES.EMPLOYEE,
    manager,
    team,
    profileImage,
    address,
    notes,
    username,
    password,
  } = data;

  const normalizedEmail = email.toLowerCase();

  const existingEmployee = await Employee.findOne({
    email: normalizedEmail,
  });

  if (existingEmployee) {
    const error = new Error("Employee with this email already exists");
    error.statusCode = 409;
    throw error;
  }

  const existingUser = await User.findOne({
    email: normalizedEmail,
  });

  if (existingUser) {
    const error = new Error("User with this email already exists");
    error.statusCode = 409;
    throw error;
  }

  const employeeId = await generateEmployeeId();

  const user = await User.create({
    username: username || normalizedEmail.split("@")[0],
    email: normalizedEmail,
    password: await hashPassword(password || "ChangeMe@123"),
    role,
    status: USER_STATUS.ACTIVE,
  });

  try {
    const employee = await Employee.create({
      employeeId,
      user: user._id,
      name,
      email: normalizedEmail,
      mobile,
      department,
      designation,
      joiningDate,
      role,
      manager,
      team,
      status: USER_STATUS.ACTIVE,
      profileImage,
      address,
      notes,
      createdBy,
    });

    return Employee.findById(employee._id)
      .populate("user", "username email role status")
      .populate("manager", "employeeId name email designation")
      .select("-__v");
  } catch (error) {
    await User.findByIdAndDelete(user._id);
    throw error;
  }
};

const getEmployees = async ({
  page = 1,
  limit = 10,
  search = "",
  department,
  role,
  status,
  manager,
}) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { employeeId: { $regex: search, $options: "i" } },
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { mobile: { $regex: search, $options: "i" } },
    ];
  }

  if (department) filter.department = department;
  if (role) filter.role = role;
  if (status) filter.status = status;
  if (manager) filter.manager = manager;

  const pageNumber = Math.max(Number(page), 1);
  const limitNumber = Math.max(Number(limit), 1);
  const skip = (pageNumber - 1) * limitNumber;

  const [employees, total] = await Promise.all([
    Employee.find(filter)
      .populate("user", "username email role status lastLoginAt")
      .populate("manager", "employeeId name email designation")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber)
      .lean(),

    Employee.countDocuments(filter),
  ]);

  return {
    employees,
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPages: Math.ceil(total / limitNumber),
    },
  };
};

const getEmployeeById = async (employeeId) => {
  const employee = await Employee.findById(employeeId)
    .populate("user", "username email role status lastLoginAt")
    .populate("manager", "employeeId name email designation");

  if (!employee) {
    const error = new Error("Employee not found");
    error.statusCode = 404;
    throw error;
  }

  return employee;
};

const getEmployeeByEmployeeId = async (employeeCode) => {
  const employee = await Employee.findOne({
    employeeId: employeeCode,
  })
    .populate("user", "username email role status lastLoginAt")
    .populate("manager", "employeeId name email designation");

  if (!employee) {
    const error = new Error("Employee not found");
    error.statusCode = 404;
    throw error;
  }

  return employee;
};

const updateEmployee = async (employeeId, data, updatedBy) => {
  const employee = await Employee.findById(employeeId);

  if (!employee) {
    const error = new Error("Employee not found");
    error.statusCode = 404;
    throw error;
  }

  if (data.email) {
    const normalizedEmail = data.email.toLowerCase();

    const existingEmployee = await Employee.findOne({
      email: normalizedEmail,
      _id: { $ne: employeeId },
    });

    if (existingEmployee) {
      const error = new Error("Employee email already exists");
      error.statusCode = 409;
      throw error;
    }

    employee.email = normalizedEmail;

    if (employee.user) {
      const existingUser = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: employee.user },
      });

      if (existingUser) {
        const error = new Error("User email already exists");
        error.statusCode = 409;
        throw error;
      }

      await User.findByIdAndUpdate(employee.user, {
        email: normalizedEmail,
      });
    }
  }

  const allowedFields = [
    "name",
    "mobile",
    "department",
    "designation",
    "joiningDate",
    "role",
    "manager",
    "team",
    "profileImage",
    "address",
    "notes",
  ];

  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      employee[field] = data[field];
    }
  });

  if (data.status !== undefined) {
    employee.status = data.status;

    if (employee.user) {
      await User.findByIdAndUpdate(employee.user, {
        status: data.status,
      });
    }
  }

  employee.updatedBy = updatedBy;

  await employee.save();

  return Employee.findById(employee._id)
    .populate("user", "username email role status lastLoginAt")
    .populate("manager", "employeeId name email designation");
};

const updateEmployeeStatus = async (employeeId, status, updatedBy) => {
  const employee = await Employee.findById(employeeId);

  if (!employee) {
    const error = new Error("Employee not found");
    error.statusCode = 404;
    throw error;
  }

  employee.status = status;
  employee.updatedBy = updatedBy;

  await employee.save();

  if (employee.user) {
    await User.findByIdAndUpdate(employee.user, {
      status,
    });
  }

  return employee;
};

const deleteEmployee = async (employeeId, updatedBy) => {
  const employee = await Employee.findById(employeeId);

  if (!employee) {
    const error = new Error("Employee not found");
    error.statusCode = 404;
    throw error;
  }

  // Historical records preserve karne ke liye hard delete nahi.
  employee.status = USER_STATUS.INACTIVE;
  employee.updatedBy = updatedBy;

  await employee.save();

  if (employee.user) {
    await User.findByIdAndUpdate(employee.user, {
      status: USER_STATUS.INACTIVE,
    });
  }

  return {
    message: "Employee deactivated successfully",
  };
};

const getTeamMembers = async (managerId) => {
  return Employee.find({
    manager: managerId,
    status: USER_STATUS.ACTIVE,
  })
    .populate("user", "username email role status")
    .sort({ name: 1 });
};

module.exports = {
  createEmployee,
  getEmployees,
  getEmployeeById,
  getEmployeeByEmployeeId,
  updateEmployee,
  updateEmployeeStatus,
  deleteEmployee,
  getTeamMembers,
};