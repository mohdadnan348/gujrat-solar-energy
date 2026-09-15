"use client";

import React, { useEffect, useMemo, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import employeeService from "@/services/employee.service";
import { useAuth } from "@/hooks/useAuth";

const HR_EMPLOYEE_ROLES = ["EMPLOYEE", "MANAGER", "HR"];

const HR_EMPLOYEES = "/hr/employees";

const getId = (item) =>
  item?._id ||
  item?.id ||
  item?.userId ||
  item?.employeeId ||
  "";

const getName = (employee) => {
  if (employee?.name) return employee.name;

  const firstName =
    employee?.firstName ||
    employee?.user?.firstName ||
    "";

  const lastName =
    employee?.lastName ||
    employee?.user?.lastName ||
    "";

  const fullName = `${firstName} ${lastName}`.trim();

  return (
    fullName ||
    employee?.user?.name ||
    employee?.fullName ||
    "Unnamed Employee"
  );
};

const getEmail = (employee) =>
  employee?.email ||
  employee?.user?.email ||
  "No email";

const getPhone = (employee) =>
  employee?.phone ||
  employee?.mobile ||
  employee?.mobileNumber ||
  employee?.user?.phone ||
  "No phone";

const getRole = (employee) =>
  employee?.role ||
  employee?.user?.role ||
  employee?.designation ||
  "EMPLOYEE";

const getStatus = (employee) => {
  const status =
    employee?.status ||
    employee?.user?.status ||
    (employee?.isActive === false ? "INACTIVE" : "ACTIVE");

  return String(status).toUpperCase();
};

const getDepartment = (employee) =>
  employee?.department ||
  employee?.user?.department ||
  "Not assigned";

const getAvatarLetter = (employee) =>
  getName(employee).charAt(0).toUpperCase();

const normalizeEmployees = (response) => {
  const data =
    response?.data ||
    response?.employees ||
    response?.results ||
    response ||
    [];

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.employees)) {
    return data.employees;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
};

const HrEmployeesPage = () => {
  const { user, logout, loading: authLoading } = useAuth();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [departmentFilter, setDepartmentFilter] =
    useState("ALL");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [selectedEmployee, setSelectedEmployee] =
    useState(null);

  const [showDetails, setShowDetails] = useState(false);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await employeeService.getEmployees({
        page: 1,
        limit: 1000,
      });

      setEmployees(normalizeEmployees(response));
    } catch (err) {
      console.error("Failed to load employees:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load employees."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const departments = useMemo(() => {
    const values = employees
      .map((employee) => getDepartment(employee))
      .filter(
        (department) =>
          department &&
          department !== "Not assigned"
      );

    return [...new Set(values)].sort();
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();

    return employees.filter((employee) => {
      const name = getName(employee).toLowerCase();
      const email = getEmail(employee).toLowerCase();
      const phone = getPhone(employee).toLowerCase();
      const role = getRole(employee).toLowerCase();
      const department =
        getDepartment(employee).toLowerCase();

      const matchesSearch =
        !query ||
        name.includes(query) ||
        email.includes(query) ||
        phone.includes(query) ||
        role.includes(query) ||
        department.includes(query);

      const matchesStatus =
        statusFilter === "ALL" ||
        getStatus(employee) === statusFilter;

      const matchesRole =
        roleFilter === "ALL" ||
        getRole(employee).toUpperCase() === roleFilter;

      const matchesDepartment =
        departmentFilter === "ALL" ||
        getDepartment(employee) === departmentFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesRole &&
        matchesDepartment
      );
    });
  }, [
    employees,
    search,
    statusFilter,
    roleFilter,
    departmentFilter,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredEmployees.length / pageSize)
  );

  const visibleEmployees = useMemo(() => {
    const start = (page - 1) * pageSize;

    return filteredEmployees.slice(
      start,
      start + pageSize
    );
  }, [filteredEmployees, page, pageSize]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const stats = useMemo(() => {
    const total = employees.length;

    const active = employees.filter(
      (employee) => getStatus(employee) === "ACTIVE"
    ).length;

    const inactive = employees.filter(
      (employee) => getStatus(employee) === "INACTIVE"
    ).length;

    const managers = employees.filter(
      (employee) => getRole(employee) === "MANAGER"
    ).length;

    const hrEmployees = employees.filter(
      (employee) => getRole(employee) === "HR"
    ).length;

    return {
      total,
      active,
      inactive,
      managers,
      hrEmployees,
    };
  }, [employees]);

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusFilter = (value) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleRoleFilter = (value) => {
    setRoleFilter(value);
    setPage(1);
  };

  const handleDepartmentFilter = (value) => {
    setDepartmentFilter(value);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setRoleFilter("ALL");
    setDepartmentFilter("ALL");
    setPage(1);
  };

  const openDetails = (employee) => {
    setSelectedEmployee(employee);
    setShowDetails(true);
  };

  const closeDetails = () => {
    setSelectedEmployee(null);
    setShowDetails(false);
  };

  const handleLogout = async () => {
    await logout();
  };

  const getStatusClass = (status) => {
    if (status === "ACTIVE") {
      return "hr-employee-status active";
    }

    return "hr-employee-status inactive";
  };

  const getRoleClass = (role) => {
    const normalized = String(role).toUpperCase();

    if (normalized === "HR") {
      return "hr-employee-role hr-role";
    }

    if (normalized === "MANAGER") {
      return "hr-employee-role manager-role";
    }

    return "hr-employee-role employee-role";
  };

  const formatDate = (date) => {
    if (!date) {
      return "Not available";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not available";
    }

    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(parsedDate);
  };

  if (authLoading) {
    return (
      <div className="hr-employees-loading">
        Loading...
      </div>
    );
  }

  return (
    <MainLayout
      user={user}
      onLogout={handleLogout}
      notificationCount={0}
    >
      <div className="hr-employees-page">
        <div className="hr-employees-header">
          <div>
            <span className="hr-employees-eyebrow">
              Human Resources
            </span>

            <h1>Employees</h1>

            <p>
              View and manage employee information,
              roles and account status.
            </p>
          </div>

          <button
            type="button"
            className="hr-employees-refresh"
            onClick={loadEmployees}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "↻ Refresh"}
          </button>
        </div>

        <div className="hr-employees-stats">
          <div className="hr-employee-stat-card">
            <div className="hr-employee-stat-icon">
              <svg
                width="21"
                height="21"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="9" cy="7" r="4" />
                <path d="M2.5 21a6.5 6.5 0 0 1 13 0" />
                <path d="M16 4.5a3.5 3.5 0 0 1 0 7" />
                <path d="M18 14a5.5 5.5 0 0 1 3.5 5" />
              </svg>
            </div>

            <div>
              <span>Total Employees</span>
              <strong>{stats.total}</strong>
            </div>
          </div>

          <div className="hr-employee-stat-card">
            <div className="hr-employee-stat-icon success">
              <svg
                width="21"
                height="21"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="m8 12 2.5 2.5L16 9" />
              </svg>
            </div>

            <div>
              <span>Active</span>
              <strong>{stats.active}</strong>
            </div>
          </div>

          <div className="hr-employee-stat-card">
            <div className="hr-employee-stat-icon danger">
              <svg
                width="21"
                height="21"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M9 12h6" />
              </svg>
            </div>

            <div>
              <span>Inactive</span>
              <strong>{stats.inactive}</strong>
            </div>
          </div>

          <div className="hr-employee-stat-card">
            <div className="hr-employee-stat-icon manager">
              <svg
                width="21"
                height="21"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21a8 8 0 0 1 16 0" />
              </svg>
            </div>

            <div>
              <span>Managers</span>
              <strong>{stats.managers}</strong>
            </div>
          </div>
        </div>

        <div className="hr-employees-toolbar">
          <div className="hr-employee-search">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-4-4" />
            </svg>

            <input
              type="search"
              value={search}
              onChange={(event) =>
                handleSearch(event.target.value)
              }
              placeholder="Search by name, email, phone or role..."
              aria-label="Search employees"
            />
          </div>

          <div className="hr-employee-filters">
            <select
              value={statusFilter}
              onChange={(event) =>
                handleStatusFilter(event.target.value)
              }
              aria-label="Filter by status"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>

            <select
              value={roleFilter}
              onChange={(event) =>
                handleRoleFilter(event.target.value)
              }
              aria-label="Filter by role"
            >
              <option value="ALL">All Roles</option>

              {HR_EMPLOYEE_ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>

            <select
              value={departmentFilter}
              onChange={(event) =>
                handleDepartmentFilter(event.target.value)
              }
              aria-label="Filter by department"
            >
              <option value="ALL">
                All Departments
              </option>

              {departments.map((department) => (
                <option
                  key={department}
                  value={department}
                >
                  {department}
                </option>
              ))}
            </select>

            {(search ||
              statusFilter !== "ALL" ||
              roleFilter !== "ALL" ||
              departmentFilter !== "ALL") && (
              <button
                type="button"
                className="hr-clear-filters"
                onClick={clearFilters}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="hr-employees-error">
            <span>{error}</span>

            <button
              type="button"
              onClick={loadEmployees}
            >
              Retry
            </button>
          </div>
        )}

        <div className="hr-employees-card">
          <div className="hr-employees-card-header">
            <div>
              <span>Employee Directory</span>
              <h2>
                {filteredEmployees.length} Employees
              </h2>
            </div>

            <div className="hr-employees-result-count">
              Showing{" "}
              {filteredEmployees.length === 0
                ? 0
                : (page - 1) * pageSize + 1}{" "}
              -{" "}
              {Math.min(
                page * pageSize,
                filteredEmployees.length
              )}{" "}
              of {filteredEmployees.length}
            </div>
          </div>

          {loading ? (
            <div className="hr-employees-table-loading">
              <div className="hr-loading-spinner" />
              <span>Loading employees...</span>
            </div>
          ) : visibleEmployees.length === 0 ? (
            <div className="hr-employees-empty">
              <div className="hr-empty-icon">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="9" cy="7" r="4" />
                  <path d="M2.5 21a6.5 6.5 0 0 1 13 0" />
                  <path d="M16 11h5" />
                  <path d="M18.5 8.5v5" />
                </svg>
              </div>

              <h3>No employees found</h3>

              <p>
                Try changing your search or filter
                criteria.
              </p>

              <button
                type="button"
                onClick={clearFilters}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="hr-employees-table-wrapper">
                <table className="hr-employees-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Contact</th>
                      <th>Role</th>
                      <th>Department</th>
                      <th>Status</th>
                      <th>Joined</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {visibleEmployees.map(
                      (employee) => {
                        const id = getId(employee);
                        const status =
                          getStatus(employee);
                        const role =
                          getRole(employee);

                        return (
                          <tr key={id || getEmail(employee)}>
                            <td>
                              <div className="hr-employee-profile">
                                <div className="hr-employee-avatar">
                                  {getAvatarLetter(
                                    employee
                                  )}
                                </div>

                                <div>
                                  <strong>
                                    {getName(employee)}
                                  </strong>

                                  <span>
                                    {id
                                      ? `ID: ${id}`
                                      : "Employee profile"}
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td>
                              <div className="hr-employee-contact">
                                <span>
                                  {getEmail(employee)}
                                </span>

                                <small>
                                  {getPhone(employee)}
                                </small>
                              </div>
                            </td>

                            <td>
                              <span
                                className={getRoleClass(
                                  role
                                )}
                              >
                                {role}
                              </span>
                            </td>

                            <td>
                              <span className="hr-employee-department">
                                {getDepartment(
                                  employee
                                )}
                              </span>
                            </td>

                            <td>
                              <span
                                className={getStatusClass(
                                  status
                                )}
                              >
                                <i />
                                {status}
                              </span>
                            </td>

                            <td>
                              <span className="hr-employee-date">
                                {formatDate(
                                  employee?.joiningDate ||
                                    employee?.dateOfJoining ||
                                    employee?.createdAt
                                )}
                              </span>
                            </td>

                            <td>
                              <button
                                type="button"
                                className="hr-view-employee"
                                onClick={() =>
                                  openDetails(employee)
                                }
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>

              <div className="hr-employees-pagination">
                <div className="hr-page-size">
                  <span>Rows per page</span>

                  <select
                    value={pageSize}
                    onChange={(event) => {
                      setPageSize(
                        Number(event.target.value)
                      );
                      setPage(1);
                    }}
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>

                <div className="hr-pagination-controls">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() =>
                      setPage((current) =>
                        Math.max(1, current - 1)
                      )
                    }
                  >
                    Previous
                  </button>

                  <span>
                    Page {page} of {totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() =>
                      setPage((current) =>
                        Math.min(
                          totalPages,
                          current + 1
                        )
                      )
                    }
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {showDetails && selectedEmployee && (
          <div
            className="hr-employee-modal-backdrop"
            onMouseDown={(event) => {
              if (
                event.target === event.currentTarget
              ) {
                closeDetails();
              }
            }}
          >
            <div
              className="hr-employee-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="employee-details-title"
            >
              <div className="hr-employee-modal-header">
                <div>
                  <span>Employee Details</span>
                  <h2 id="employee-details-title">
                    {getName(selectedEmployee)}
                  </h2>
                </div>

                <button
                  type="button"
                  className="hr-modal-close"
                  onClick={closeDetails}
                  aria-label="Close employee details"
                >
                  ×
                </button>
              </div>

              <div className="hr-employee-modal-profile">
                <div className="hr-modal-avatar">
                  {getAvatarLetter(
                    selectedEmployee
                  )}
                </div>

                <div>
                  <strong>
                    {getName(selectedEmployee)}
                  </strong>

                  <span>
                    {getRole(selectedEmployee)}
                  </span>
                </div>
              </div>

              <div className="hr-employee-details-grid">
                <div>
                  <span>Employee ID</span>
                  <strong>
                    {getId(selectedEmployee) ||
                      "Not available"}
                  </strong>
                </div>

                <div>
                  <span>Status</span>
                  <strong>
                    {getStatus(selectedEmployee)}
                  </strong>
                </div>

                <div>
                  <span>Email</span>
                  <strong>
                    {getEmail(selectedEmployee)}
                  </strong>
                </div>

                <div>
                  <span>Phone</span>
                  <strong>
                    {getPhone(selectedEmployee)}
                  </strong>
                </div>

                <div>
                  <span>Role</span>
                  <strong>
                    {getRole(selectedEmployee)}
                  </strong>
                </div>

                <div>
                  <span>Department</span>
                  <strong>
                    {getDepartment(selectedEmployee)}
                  </strong>
                </div>

                <div>
                  <span>Joining Date</span>
                  <strong>
                    {formatDate(
                      selectedEmployee?.joiningDate ||
                        selectedEmployee?.dateOfJoining ||
                        selectedEmployee?.createdAt
                    )}
                  </strong>
                </div>

                <div>
                  <span>Created</span>
                  <strong>
                    {formatDate(
                      selectedEmployee?.createdAt
                    )}
                  </strong>
                </div>
              </div>

              <div className="hr-employee-modal-footer">
                <button
                  type="button"
                  onClick={closeDetails}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default HrEmployeesPage;