const { ROLES, USER_STATUS } = require("../config/constants");

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const isValidDate = (value) => {
  if (!value) return true;

  const date = new Date(value);
  return !Number.isNaN(date.getTime());
};

const validateEmployee = (req, res, next) => {
  const {
    employeeId,
    name,
    email,
    mobile,
    department,
    designation,
    joiningDate,
    role,
    manager,
    team,
    status,
    profileImage,
    address,
    notes,
    user,
    createdBy,
  } = req.body;

  const errors = [];

  // Employee ID
  if (!employeeId || typeof employeeId !== "string") {
    errors.push("Employee ID is required");
  } else if (employeeId.trim().length < 2) {
    errors.push("Employee ID must be at least 2 characters");
  }

  // User reference
  if (user !== undefined && user !== null && user !== "") {
    if (typeof user !== "string") {
      errors.push("User reference must be a valid user ID");
    }
  }

  // Employee name
  if (!name || typeof name !== "string") {
    errors.push("Employee name is required");
  } else if (name.trim().length < 2) {
    errors.push("Employee name must be at least 2 characters");
  }

  // Email
  if (!email || typeof email !== "string") {
    errors.push("Employee email is required");
  } else if (!isValidEmail(email.trim())) {
    errors.push("Please provide a valid employee email");
  }

  // Mobile
  if (mobile !== undefined && mobile !== null && mobile !== "") {
    if (typeof mobile !== "string") {
      errors.push("Mobile must be a string");
    }
  }

  // Department
  if (
    department !== undefined &&
    department !== null &&
    department !== ""
  ) {
    if (typeof department !== "string") {
      errors.push("Department must be a string");
    }
  }

  // Designation
  if (
    designation !== undefined &&
    designation !== null &&
    designation !== ""
  ) {
    if (typeof designation !== "string") {
      errors.push("Designation must be a string");
    }
  }

  // Joining date
  if (!isValidDate(joiningDate)) {
    errors.push("Joining date is invalid");
  }

  // Role
  if (!role || typeof role !== "string") {
    errors.push("Employee role is required");
  } else {
    const normalizedRole = role.toUpperCase();

    if (!Object.values(ROLES).includes(normalizedRole)) {
      errors.push(
        `Invalid role. Allowed roles: ${Object.values(ROLES).join(", ")}`
      );
    }
  }

  // Manager
  if (manager !== undefined && manager !== null && manager !== "") {
    if (typeof manager !== "string") {
      errors.push("Manager must be a valid employee ID");
    }
  }

  // Team
  if (team !== undefined && team !== null && team !== "") {
    if (typeof team !== "string") {
      errors.push("Team must be a string");
    }
  }

  // Status
  if (status !== undefined && status !== null && status !== "") {
    if (
      typeof status !== "string" ||
      !Object.values(USER_STATUS).includes(status.toUpperCase())
    ) {
      errors.push(
        `Invalid status. Allowed statuses: ${Object.values(USER_STATUS).join(
          ", "
        )}`
      );
    }
  }

  // Profile image
  if (
    profileImage !== undefined &&
    profileImage !== null &&
    profileImage !== ""
  ) {
    if (typeof profileImage !== "string") {
      errors.push("Profile image must be a string");
    }
  }

  // Address
  if (address !== undefined && address !== null && address !== "") {
    if (typeof address !== "string") {
      errors.push("Address must be a string");
    }
  }

  // Notes
  if (notes !== undefined && notes !== null && notes !== "") {
    if (typeof notes !== "string") {
      errors.push("Notes must be a string");
    }
  }

  // createdBy
  if (createdBy !== undefined && createdBy !== null && createdBy !== "") {
    if (typeof createdBy !== "string") {
      errors.push("Created by must be a valid user ID");
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Employee validation failed",
      errors,
    });
  }

  next();
};

const validateEmployeeUpdate = (req, res, next) => {
  const {
    employeeId,
    name,
    email,
    mobile,
    department,
    designation,
    joiningDate,
    role,
    manager,
    team,
    status,
    profileImage,
    address,
    notes,
    user,
    updatedBy,
  } = req.body;

  const errors = [];

  // Employee ID
  if (employeeId !== undefined) {
    if (
      typeof employeeId !== "string" ||
      employeeId.trim().length < 2
    ) {
      errors.push("Employee ID must be at least 2 characters");
    }
  }

  // User reference
  if (user !== undefined && user !== null && user !== "") {
    if (typeof user !== "string") {
      errors.push("User reference must be a valid user ID");
    }
  }

  // Employee name
  if (name !== undefined) {
    if (
      typeof name !== "string" ||
      name.trim().length < 2
    ) {
      errors.push("Employee name must be at least 2 characters");
    }
  }

  // Email
  if (email !== undefined) {
    if (
      typeof email !== "string" ||
      !isValidEmail(email.trim())
    ) {
      errors.push("Please provide a valid employee email");
    }
  }

  // Mobile
  if (mobile !== undefined && mobile !== null && mobile !== "") {
    if (typeof mobile !== "string") {
      errors.push("Mobile must be a string");
    }
  }

  // Department
  if (
    department !== undefined &&
    department !== null &&
    department !== ""
  ) {
    if (typeof department !== "string") {
      errors.push("Department must be a string");
    }
  }

  // Designation
  if (
    designation !== undefined &&
    designation !== null &&
    designation !== ""
  ) {
    if (typeof designation !== "string") {
      errors.push("Designation must be a string");
    }
  }

  // Joining date
  if (!isValidDate(joiningDate)) {
    errors.push("Joining date is invalid");
  }

  // Role
  if (role !== undefined) {
    if (
      typeof role !== "string" ||
      !Object.values(ROLES).includes(role.toUpperCase())
    ) {
      errors.push(
        `Invalid role. Allowed roles: ${Object.values(ROLES).join(", ")}`
      );
    }
  }

  // Manager
  if (manager !== undefined && manager !== null && manager !== "") {
    if (typeof manager !== "string") {
      errors.push("Manager must be a valid employee ID");
    }
  }

  // Team
  if (team !== undefined && team !== null && team !== "") {
    if (typeof team !== "string") {
      errors.push("Team must be a string");
    }
  }

  // Status
  if (status !== undefined && status !== null && status !== "") {
    if (
      typeof status !== "string" ||
      !Object.values(USER_STATUS).includes(status.toUpperCase())
    ) {
      errors.push(
        `Invalid status. Allowed statuses: ${Object.values(USER_STATUS).join(
          ", "
        )}`
      );
    }
  }

  // Profile image
  if (
    profileImage !== undefined &&
    profileImage !== null &&
    profileImage !== ""
  ) {
    if (typeof profileImage !== "string") {
      errors.push("Profile image must be a string");
    }
  }

  // Address
  if (address !== undefined && address !== null && address !== "") {
    if (typeof address !== "string") {
      errors.push("Address must be a string");
    }
  }

  // Notes
  if (notes !== undefined && notes !== null && notes !== "") {
    if (typeof notes !== "string") {
      errors.push("Notes must be a string");
    }
  }

  // updatedBy
  if (updatedBy !== undefined && updatedBy !== null && updatedBy !== "") {
    if (typeof updatedBy !== "string") {
      errors.push("Updated by must be a valid user ID");
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Employee update validation failed",
      errors,
    });
  }

  next();
};

module.exports = {
  validateEmployee,
  validateEmployeeUpdate,
};