const Employee = require("../models/Employee");
const User = require("../models/User");
const { hashPassword } = require("../utils/password");
const { USER_STATUS, ROLES } = require("../config/constants");

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

const normalizeStatus = (status) => {
  if (!status) return USER_STATUS.ACTIVE;

  const value = String(status).trim().toUpperCase();

  const statusMap = {
    ACTIVE: USER_STATUS.ACTIVE,
    INACTIVE: USER_STATUS.INACTIVE,
    DISABLED: USER_STATUS.INACTIVE,
    "ON LEAVE": USER_STATUS.ON_LEAVE,
    ON_LEAVE: USER_STATUS.ON_LEAVE,
  };

  return statusMap[value] || status;
};

const normalizeRole = (role) => {
  if (!role) return ROLES.EMPLOYEE;

  return String(role).trim().toUpperCase();
};

const generateEmployeeId = async (role) => {
  const roleValue = normalizeRole(role);

  let prefix = "EMP";

  if (roleValue === ROLES.ADMIN) {
    prefix = "ADM";
  } else if (roleValue === ROLES.MANAGER) {
    prefix = "MGR";
  } else if (roleValue === ROLES.HR) {
    prefix = "HR";
  } else if (roleValue === ROLES.EMPLOYEE) {
    prefix = "EMP";
  }

  const lastEmployee = await Employee.findOne({
    employeeId: {
      $regex: `^${prefix}-`,
      $options: "i",
    },
  })
    .sort({ createdAt: -1 })
    .select("employeeId")
    .lean();

  let nextNumber = 1;

  if (lastEmployee?.employeeId) {
    const match = String(lastEmployee.employeeId).match(
      new RegExp(`^${prefix}-(\\d+)$`, "i")
    );

    if (match) {
      nextNumber = Number(match[1]) + 1;
    }
  }

  return `${prefix}-${String(nextNumber).padStart(4, "0")}`;
};

/*
|--------------------------------------------------------------------------
| Create Employee
|--------------------------------------------------------------------------
*/

const createEmployee = async (data, createdBy) => {
  if (!data) {
    const error = new Error("Employee data is required");
    error.statusCode = 400;
    throw error;
  }

  const name = String(data.name || "").trim();
  const email = String(data.email || "").trim().toLowerCase();

  const mobile = String(
    data.mobile ||
      data.phone ||
      data.mobileNumber ||
      ""
  ).trim();

  const alternatePhone = String(
    data.alternatePhone ||
      data.alternateMobile ||
      ""
  ).trim();

  const role = normalizeRole(data.role);

  const department = String(
    data.department || ""
  ).trim();

  const designation = String(
    data.designation || ""
  ).trim();

  const joiningDate = data.joiningDate || null;

  const status = normalizeStatus(data.status);

  const address = String(
    data.address || ""
  ).trim();

  const notes = String(
    data.notes || ""
  ).trim();

  /*
  |--------------------------------------------------------------------------
  | Basic validation
  |--------------------------------------------------------------------------
  */

  if (!name) {
    const error = new Error("Employee name is required");
    error.statusCode = 400;
    throw error;
  }

  if (!email) {
    const error = new Error("Employee email is required");
    error.statusCode = 400;
    throw error;
  }

  if (!role) {
    const error = new Error("Employee role is required");
    error.statusCode = 400;
    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | Validate role
  |--------------------------------------------------------------------------
  */

  const allowedRoles = Object.values(ROLES);

  if (!allowedRoles.includes(role)) {
    const error = new Error(
      `Invalid employee role. Allowed roles: ${allowedRoles.join(", ")}`
    );

    error.statusCode = 400;
    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | Check duplicate email
  |--------------------------------------------------------------------------
  */

  const existingUser = await User.findOne({
    email,
  });

  if (existingUser) {
    const error = new Error(
      "User with this email already exists"
    );

    error.statusCode = 409;
    throw error;
  }

  const existingEmployee = await Employee.findOne({
    email,
  });

  if (existingEmployee) {
    const error = new Error(
      "Employee with this email already exists"
    );

    error.statusCode = 409;
    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | Employee ID
  |--------------------------------------------------------------------------
  */

  let employeeId = String(
    data.employeeId ||
      data.employeeCode ||
      ""
  ).trim();

  if (employeeId) {
    employeeId = employeeId.toUpperCase();

    const existingEmployeeId =
      await Employee.findOne({
        employeeId,
      });

    if (existingEmployeeId) {
      const error = new Error(
        "Employee ID already exists"
      );

      error.statusCode = 409;
      throw error;
    }
  } else {
    employeeId = await generateEmployeeId(role);
  }

  /*
  |--------------------------------------------------------------------------
  | Username
  |--------------------------------------------------------------------------
  */

  let username = String(
    data.username || ""
  ).trim();

  if (!username) {
    const emailUsername = email
      .split("@")[0]
      .replace(/[^a-zA-Z0-9]/g, "");

    username =
      emailUsername ||
      employeeId.toLowerCase();
  }

  /*
  |--------------------------------------------------------------------------
  | Make username unique
  |--------------------------------------------------------------------------
  */

  const usernameExists = await User.findOne({
    username,
  });

  if (usernameExists) {
    username = `${username}${Date.now()
      .toString()
      .slice(-4)}`;
  }

  /*
  |--------------------------------------------------------------------------
  | Password
  |--------------------------------------------------------------------------
  */

  const rawPassword =
    data.password ||
    "Employee@123";

  const hashedPassword =
    await hashPassword(rawPassword);

  /*
  |--------------------------------------------------------------------------
  | Create User
  |--------------------------------------------------------------------------
  */

  let createdUser = null;
  let createdEmployee = null;

  try {
    createdUser = await User.create({
      username,
      email,
      password: hashedPassword,
      role,
      status,
    });

    /*
    |--------------------------------------------------------------------------
    | Create Employee
    |--------------------------------------------------------------------------
    */

    createdEmployee =
      await Employee.create({
        employeeId,

        user: createdUser._id,

        name,

        email,

        mobile,

        department,

        designation,

        joiningDate,

        role,

        status,

        address,

        notes,

        createdBy,

        updatedBy: null,
      });

    /*
    |--------------------------------------------------------------------------
    | Return populated employee
    |--------------------------------------------------------------------------
    */

    const result =
      await Employee.findById(
        createdEmployee._id
      )
        .populate(
          "user",
          "username email role status"
        )
        .populate(
          "createdBy",
          "username email role"
        )
        .populate(
          "updatedBy",
          "username email role"
        )
        .lean();

    return result;
  } catch (error) {
    /*
    |--------------------------------------------------------------------------
    | Rollback User if Employee creation fails
    |--------------------------------------------------------------------------
    */

    if (createdUser?._id) {
      try {
        await User.findByIdAndDelete(
          createdUser._id
        );
      } catch (rollbackError) {
        console.error(
          "Failed to rollback created user:",
          rollbackError.message
        );
      }
    }

    throw error;
  }
};

/*
|--------------------------------------------------------------------------
| Get Employee By ID
|--------------------------------------------------------------------------
*/

const getEmployeeById = async (employeeId) => {
  if (!employeeId) {
    const error = new Error(
      "Employee ID is required"
    );

    error.statusCode = 400;
    throw error;
  }

  const employee =
    await Employee.findById(employeeId)
      .populate(
        "user",
        "username email role status"
      )
      .populate(
        "manager",
        "employeeId name email mobile role"
      )
      .populate(
        "createdBy",
        "username email role"
      )
      .populate(
        "updatedBy",
        "username email role"
      )
      .lean();

  if (!employee) {
    const error = new Error(
      "Employee not found"
    );

    error.statusCode = 404;
    throw error;
  }

  return employee;
};

/*
|--------------------------------------------------------------------------
| Get Employees
|--------------------------------------------------------------------------
*/

const getEmployees = async ({
  page = 1,
  limit = 10,
  search = "",
  department,
  role,
  manager,
  status,
} = {}) => {
  const pageNumber = Math.max(
    Number(page) || 1,
    1
  );

  const limitNumber = Math.min(
    Math.max(Number(limit) || 10, 1),
    100
  );

  const filter = {};

  /*
  |--------------------------------------------------------------------------
  | Search
  |--------------------------------------------------------------------------
  */

  if (search?.trim()) {
    const searchValue =
      search.trim();

    filter.$or = [
      {
        employeeId: {
          $regex: searchValue,
          $options: "i",
        },
      },
      {
        name: {
          $regex: searchValue,
          $options: "i",
        },
      },
      {
        email: {
          $regex: searchValue,
          $options: "i",
        },
      },
      {
        mobile: {
          $regex: searchValue,
          $options: "i",
        },
      },
      {
        department: {
          $regex: searchValue,
          $options: "i",
        },
      },
      {
        designation: {
          $regex: searchValue,
          $options: "i",
        },
      },
    ];
  }

  /*
  |--------------------------------------------------------------------------
  | Filters
  |--------------------------------------------------------------------------
  */

  if (department) {
    filter.department = department;
  }

  if (role) {
    filter.role = normalizeRole(role);
  }

  if (manager) {
    filter.manager = manager;
  }

  if (status) {
    filter.status =
      normalizeStatus(status);
  }

  const skip =
    (pageNumber - 1) *
    limitNumber;

  /*
  |--------------------------------------------------------------------------
  | Query
  |--------------------------------------------------------------------------
  */

  const [
    employees,
    total,
  ] = await Promise.all([
    Employee.find(filter)
      .populate(
        "user",
        "username email role status"
      )
      .populate(
        "manager",
        "employeeId name email mobile role"
      )
      .populate(
        "createdBy",
        "username email role"
      )
      .populate(
        "updatedBy",
        "username email role"
      )
      .sort({
        createdAt: -1,
      })
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
      totalPages: Math.ceil(
        total / limitNumber
      ),
    },
  };
};

/*
|--------------------------------------------------------------------------
| Update Employee
|--------------------------------------------------------------------------
*/

const updateEmployee = async (
  employeeId,
  data,
  updatedBy
) => {
  if (!employeeId) {
    const error = new Error(
      "Employee ID is required"
    );

    error.statusCode = 400;
    throw error;
  }

  const employee =
    await Employee.findById(
      employeeId
    );

  if (!employee) {
    const error = new Error(
      "Employee not found"
    );

    error.statusCode = 404;
    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | Basic fields
  |--------------------------------------------------------------------------
  */

  if (data.name !== undefined) {
    employee.name =
      String(data.name).trim();
  }

  if (data.phone !== undefined) {
    employee.mobile =
      String(data.phone).trim();
  }

  if (data.mobile !== undefined) {
    employee.mobile =
      String(data.mobile).trim();
  }

  if (data.department !== undefined) {
    employee.department =
      String(data.department).trim();
  }

  if (data.designation !== undefined) {
    employee.designation =
      String(data.designation).trim();
  }

  if (data.joiningDate !== undefined) {
    employee.joiningDate =
      data.joiningDate || null;
  }

  if (data.address !== undefined) {
    employee.address =
      String(data.address).trim();
  }

  if (data.notes !== undefined) {
    employee.notes =
      String(data.notes).trim();
  }

  /*
  |--------------------------------------------------------------------------
  | Employee ID
  |--------------------------------------------------------------------------
  */

  if (
    data.employeeId !== undefined ||
    data.employeeCode !== undefined
  ) {
    const newEmployeeId =
      String(
        data.employeeId ||
          data.employeeCode ||
          ""
      )
        .trim()
        .toUpperCase();

    if (newEmployeeId) {
      const duplicate =
        await Employee.findOne({
          employeeId: newEmployeeId,
          _id: {
            $ne: employeeId,
          },
        });

      if (duplicate) {
        const error = new Error(
          "Employee ID already exists"
        );

        error.statusCode = 409;
        throw error;
      }

      employee.employeeId =
        newEmployeeId;
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Role
  |--------------------------------------------------------------------------
  */

  if (data.role !== undefined) {
    const newRole =
      normalizeRole(data.role);

    if (
      !Object.values(ROLES).includes(
        newRole
      )
    ) {
      const error = new Error(
        "Invalid employee role"
      );

      error.statusCode = 400;
      throw error;
    }

    employee.role = newRole;

    /*
    | Sync User role
    */

    if (employee.user) {
      await User.findByIdAndUpdate(
        employee.user,
        {
          role: newRole,
        }
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Status
  |--------------------------------------------------------------------------
  */

  if (data.status !== undefined) {
    const newStatus =
      normalizeStatus(data.status);

    employee.status =
      newStatus;

    if (employee.user) {
      await User.findByIdAndUpdate(
        employee.user,
        {
          status: newStatus,
        }
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Email
  |--------------------------------------------------------------------------
  */

  if (data.email !== undefined) {
    const newEmail =
      String(data.email)
        .trim()
        .toLowerCase();

    const duplicateUser =
      await User.findOne({
        email: newEmail,
        _id: {
          $ne: employee.user,
        },
      });

    if (duplicateUser) {
      const error = new Error(
        "Email already exists"
      );

      error.statusCode = 409;
      throw error;
    }

    employee.email =
      newEmail;

    if (employee.user) {
      await User.findByIdAndUpdate(
        employee.user,
        {
          email: newEmail,
        }
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Updated By
  |--------------------------------------------------------------------------
  */

  employee.updatedBy =
    updatedBy || null;

  await employee.save();

  return getEmployeeById(
    employee._id
  );
};

/*
|--------------------------------------------------------------------------
| Update Employee Status
|--------------------------------------------------------------------------
*/

const updateEmployeeStatus = async (
  employeeId,
  status,
  updatedBy
) => {
  if (!employeeId) {
    const error = new Error(
      "Employee ID is required"
    );

    error.statusCode = 400;
    throw error;
  }

  if (!status) {
    const error = new Error(
      "Employee status is required"
    );

    error.statusCode = 400;
    throw error;
  }

  const employee =
    await Employee.findById(
      employeeId
    );

  if (!employee) {
    const error = new Error(
      "Employee not found"
    );

    error.statusCode = 404;
    throw error;
  }

  const newStatus =
    normalizeStatus(status);

  employee.status =
    newStatus;

  employee.updatedBy =
    updatedBy || null;

  await employee.save();

  /*
  |--------------------------------------------------------------------------
  | Keep User status in sync
  |--------------------------------------------------------------------------
  */

  if (employee.user) {
    await User.findByIdAndUpdate(
      employee.user,
      {
        status: newStatus,
      }
    );
  }

  return getEmployeeById(
    employee._id
  );
};

/*
|--------------------------------------------------------------------------
| Delete / Deactivate Employee
|--------------------------------------------------------------------------
*/

const deleteEmployee = async (
  employeeId,
  updatedBy
) => {
  if (!employeeId) {
    const error = new Error(
      "Employee ID is required"
    );

    error.statusCode = 400;
    throw error;
  }

  const employee =
    await Employee.findById(
      employeeId
    );

  if (!employee) {
    const error = new Error(
      "Employee not found"
    );

    error.statusCode = 404;
    throw error;
  }

  const inactiveStatus =
    USER_STATUS.INACTIVE;

  employee.status =
    inactiveStatus;

  employee.updatedBy =
    updatedBy || null;

  await employee.save();

  /*
  |--------------------------------------------------------------------------
  | Also deactivate User account
  |--------------------------------------------------------------------------
  */

  if (employee.user) {
    await User.findByIdAndUpdate(
      employee.user,
      {
        status: inactiveStatus,
      }
    );
  }

  return getEmployeeById(
    employee._id
  );
};

/*
|--------------------------------------------------------------------------
| Exports
|--------------------------------------------------------------------------
*/

module.exports = {
  createEmployee,
  getEmployeeById,
  getEmployees,
  updateEmployee,
  updateEmployeeStatus,
  deleteEmployee,
};