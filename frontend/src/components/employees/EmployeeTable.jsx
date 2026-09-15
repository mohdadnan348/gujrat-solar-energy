"use client";

import "./EmployeeTable.css";

const getEmployeeName = (employee) => {
  if (employee?.name) return employee.name;
  if (employee?.fullName) return employee.fullName;

  const firstName = employee?.firstName || "";
  const lastName = employee?.lastName || "";

  return (
    `${firstName} ${lastName}`.trim() ||
    "Unknown Employee"
  );
};

const getInitials = (name) => {
  if (!name) return "UE";

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
};

const getStatusClass = (status) => {
  const value = String(status || "Pending")
    .toLowerCase()
    .replace(/\s+/g, "-");

  if (value === "active") {
    return "employee-table__status--active";
  }

  if (value === "inactive") {
    return "employee-table__status--inactive";
  }

  return "employee-table__status--pending";
};

const getRoleClass = (role) => {
  const value = String(role || "Employee")
    .toLowerCase()
    .replace(/\s+/g, "-");

  if (value === "admin") {
    return "employee-table__role--admin";
  }

  if (value === "manager") {
    return "employee-table__role--manager";
  }

  if (value === "hr") {
    return "employee-table__role--hr";
  }

  return "";
};

const getDepartmentName = (employee) => {
  return (
    employee?.department?.name ||
    employee?.departmentName ||
    employee?.department ||
    "—"
  );
};

const getDesignation = (employee) => {
  return (
    employee?.designation?.name ||
    employee?.designation ||
    employee?.jobTitle ||
    "—"
  );
};

const getRole = (employee) => {
  return (
    employee?.role?.name ||
    employee?.role ||
    "Employee"
  );
};

const getStatus = (employee) => {
  return (
    employee?.status ||
    employee?.employeeStatus ||
    "Pending"
  );
};

const getEmployeeId = (employee) => {
  return (
    employee?.employeeId ||
    employee?.employeeCode ||
    employee?.code ||
    "—"
  );
};

const getEmail = (employee) => {
  return (
    employee?.email ||
    employee?.user?.email ||
    "—"
  );
};

const getMobile = (employee) => {
  return (
    employee?.mobile ||
    employee?.phone ||
    employee?.phoneNumber ||
    "—"
  );
};

export default function EmployeeTable({
  employees = [],
  data,
  records,
  loading = false,
  title = "Employees",
  subtitle = "View and manage company employees.",
  onRowClick,
  onView,
  onEdit,
  onDelete,
  onActivate,
  onDeactivate,
  emptyMessage = "No employees found.",
}) {
  const employeeRecords = data || records || employees;

  if (loading) {
    return (
      <div className="employee-table">
        <div className="employee-table__header">
          <div>
            <h2 className="employee-table__title">
              {title}
            </h2>

            <p className="employee-table__subtitle">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="employee-table__loading">
          <span className="employee-table__spinner" />
          <span>Loading employees...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="employee-table">
      <div className="employee-table__header">
        <div>
          <h2 className="employee-table__title">
            {title}
          </h2>

          <p className="employee-table__subtitle">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="employee-table__wrapper">
        <table>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Employee ID</th>
              <th>Department</th>
              <th>Designation</th>
              <th>Role</th>
              <th>Status</th>
              <th>Mobile</th>

              {(onView ||
                onEdit ||
                onDelete ||
                onActivate ||
                onDeactivate) && <th>Actions</th>}
            </tr>
          </thead>

          <tbody>
            {!Array.isArray(employeeRecords) ||
            employeeRecords.length === 0 ? (
              <tr>
                <td
                  colSpan={
                    onView ||
                    onEdit ||
                    onDelete ||
                    onActivate ||
                    onDeactivate
                      ? 8
                      : 7
                  }
                >
                  <div className="employee-table__empty">
                    {emptyMessage}
                  </div>
                </td>
              </tr>
            ) : (
              employeeRecords.map(
                (employee, index) => {
                  const name =
                    getEmployeeName(employee);

                  const role =
                    getRole(employee);

                  const status =
                    getStatus(employee);

                  const image =
                    employee?.profileImage ||
                    employee?.avatar ||
                    employee?.photo ||
                    employee?.image;

                  const employeeKey =
                    employee?._id ||
                    employee?.id ||
                    employee?.employeeId ||
                    index;

                  return (
                    <tr
                      key={employeeKey}
                      onClick={() =>
                        onRowClick?.(employee)
                      }
                      style={
                        onRowClick
                          ? {
                              cursor: "pointer",
                            }
                          : undefined
                      }
                    >
                      <td>
                        <div className="employee-table__employee">
                          <div className="employee-table__avatar">
                            {image ? (
                              <img
                                src={image}
                                alt={name}
                              />
                            ) : (
                              getInitials(name)
                            )}
                          </div>

                          <div className="employee-table__employee-info">
                            <div className="employee-table__employee-name">
                              {name}
                            </div>

                            <div className="employee-table__employee-email">
                              {getEmail(employee)}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="employee-table__employee-id">
                          {getEmployeeId(employee)}
                        </span>
                      </td>

                      <td>
                        <span className="employee-table__department">
                          {getDepartmentName(employee)}
                        </span>
                      </td>

                      <td>
                        <span className="employee-table__designation">
                          {getDesignation(employee)}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`employee-table__role ${getRoleClass(
                            role
                          )}`}
                        >
                          {role}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`employee-table__status ${getStatusClass(
                            status
                          )}`}
                        >
                          {status}
                        </span>
                      </td>

                      <td>
                        <span className="employee-table__mobile">
                          {getMobile(employee)}
                        </span>
                      </td>

                      {(onView ||
                        onEdit ||
                        onDelete ||
                        onActivate ||
                        onDeactivate) && (
                        <td>
                          <div
                            className="employee-table__actions"
                            onClick={(event) =>
                              event.stopPropagation()
                            }
                          >
                            {onView && (
                              <button
                                type="button"
                                className="employee-table__action"
                                onClick={() =>
                                  onView(employee)
                                }
                                title="View employee"
                                aria-label="View employee"
                              >
                                👁
                              </button>
                            )}

                            {onEdit && (
                              <button
                                type="button"
                                className="employee-table__action"
                                onClick={() =>
                                  onEdit(employee)
                                }
                                title="Edit employee"
                                aria-label="Edit employee"
                              >
                                ✎
                              </button>
                            )}

                            {onActivate &&
                              String(status).toLowerCase() !==
                                "active" && (
                                <button
                                  type="button"
                                  className="employee-table__action"
                                  onClick={() =>
                                    onActivate(
                                      employee
                                    )
                                  }
                                  title="Activate employee"
                                  aria-label="Activate employee"
                                >
                                  ✓
                                </button>
                              )}

                            {onDeactivate &&
                              String(status).toLowerCase() ===
                                "active" && (
                                <button
                                  type="button"
                                  className="employee-table__action"
                                  onClick={() =>
                                    onDeactivate(
                                      employee
                                    )
                                  }
                                  title="Deactivate employee"
                                  aria-label="Deactivate employee"
                                >
                                  ⏸
                                </button>
                              )}

                            {onDelete && (
                              <button
                                type="button"
                                className="employee-table__action employee-table__action--danger"
                                onClick={() =>
                                  onDelete(employee)
                                }
                                title="Delete employee"
                                aria-label="Delete employee"
                              >
                                🗑
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                }
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}