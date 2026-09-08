const { ROLES } = require("../config/constants");

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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
  } = req.body;

  const errors = [];

  if (!employeeId || typeof employeeId !== "string") {
    errors.push("Employee ID is required");
  }

  if (!name || typeof name !== "string") {
    errors.push("Employee name is required");
  } else if (name.trim().length < 2) {
    errors.push("Employee name must be at least 2 characters");
  }

  if (!email || typeof email !== "string") {
    errors.push("Employee email is required");
  } else if (!isValidEmail(email)) {
    errors.push("Please provide a valid employee email");
  }

  if (mobile !== undefined && mobile !== null && mobile !== "") {
    if (typeof mobile !== "string") {
      errors.push("Mobile must be a string");
    }
  }

  if (department !== undefined && department !== null && department !== "") {
    if (typeof department !== "string") {
      errors.push("Department must be a string");
    }
  }

  if (designation !== undefined && designation !== null && designation !== "") {
    if (typeof designation !== "string") {
      errors.push("Designation must be a string");
    }
  }

  if (joiningDate !== undefined && joiningDate !== null && joiningDate !== "") {
    if (Number.isNaN(new Date(joiningDate).getTime())) {
      errors.push("Joining date is invalid");
    }
  }

  if (!role || typeof role !== "string") {
    errors.push("Employee role is required");
  } else if (!Object.values(ROLES).includes(role.toUpperCase())) {
    errors.push(
      `Invalid role. Allowed roles: ${Object.values(ROLES).join(", ")}`
    );
  }

  if (manager !== undefined && manager !== null && manager !== "") {
    if (typeof manager !== "string") {
      errors.push("Manager must be a valid employee ID");
    }
  }

  if (team !== undefined && team !== null && team !== "") {
    if (typeof team !== "string") {
      errors.push("Team must be a string");
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
  } = req.body;

  const errors = [];

  if (name !== undefined) {
    if (typeof name !== "string" || name.trim().length < 2) {
      errors.push("Employee name must be at least 2 characters");
    }
  }

  if (email !== undefined) {
    if (typeof email !== "string" || !isValidEmail(email)) {
      errors.push("Please provide a valid employee email");
    }
  }

  if (mobile !== undefined && mobile !== null && mobile !== "") {
    if (typeof mobile !== "string") {
      errors.push("Mobile must be a string");
    }
  }

  if (department !== undefined && department !== null && department !== "") {
    if (typeof department !== "string") {
      errors.push("Department must be a string");
    }
  }

  if (designation !== undefined && designation !== null && designation !== "") {
    if (typeof designation !== "string") {
      errors.push("Designation must be a string");
    }
  }

  if (joiningDate !== undefined && joiningDate !== null && joiningDate !== "") {
    if (Number.isNaN(new Date(joiningDate).getTime())) {
      errors.push("Joining date is invalid");
    }
  }

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

  if (manager !== undefined && manager !== null && manager !== "") {
    if (typeof manager !== "string") {
      errors.push("Manager must be a valid employee ID");
    }
  }

  if (team !== undefined && team !== null && team !== "") {
    if (typeof team !== "string") {
      errors.push("Team must be a string");
    }
  }

  if (status !== undefined && typeof status !== "string") {
    errors.push("Status must be a string");
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