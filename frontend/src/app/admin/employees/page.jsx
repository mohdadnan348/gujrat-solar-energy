"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import AdminLayout from "../layout";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import SearchBox from "@/components/common/SearchBox";
import Pagination from "@/components/common/Pagination";
import Loader from "@/components/common/Loader";
import Select from "@/components/common/Select";
import ConfirmDialog from "@/components/common/ConfirmDialog";

import  employeeService  from "@/services/employee.service";

import "./employees.css";

const AdminEmployeesPage = () => {
  const router = useRouter();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const getValue = (
    object,
    keys,
    fallback = ""
  ) => {
    if (!object) return fallback;

    for (const key of keys) {
      const value = object?.[key];

      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        return value;
      }
    }

    return fallback;
  };

  const getId = (object) => {
    if (!object) return "";

    if (typeof object === "string") {
      return object;
    }

    return (
      object?._id ||
      object?.id ||
      object?.employeeId ||
      ""
    );
  };

  const normalizeList = (
    response,
    key
  ) => {
    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response?.data)) {
      return response.data;
    }

    if (
      key &&
      Array.isArray(response?.data?.[key])
    ) {
      return response.data[key];
    }

    if (
      key &&
      Array.isArray(response?.[key])
    ) {
      return response[key];
    }

    if (Array.isArray(response?.results)) {
      return response.results;
    }

    return [];
  };

  const loadEmployees = async (
    showRefresh = false
  ) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response =
        await employeeService.getEmployees();

      setEmployees(
        normalizeList(
          response,
          "employees"
        )
      );
    } catch (err) {
      console.error(
        "Failed to load employees:",
        err
      );

      setError(
        err?.message ||
          "Failed to load employees."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    roleFilter,
    statusFilter,
    itemsPerPage,
  ]);

  const getEmployeeName = (
    employee
  ) =>
    getValue(
      employee,
      [
        "name",
        "fullName",
        "employeeName",
      ],
      "Unnamed Employee"
    );

  const getRole = (employee) =>
    String(
      getValue(
        employee,
        ["role"],
        "EMPLOYEE"
      )
    ).toUpperCase();

  const getStatus = (employee) =>
    String(
      getValue(
        employee,
        ["status", "employmentStatus"],
        "ACTIVE"
      )
    ).toUpperCase();

  const getEmail = (employee) =>
    getValue(
      employee,
      [
        "email",
        "emailAddress",
      ],
      "—"
    );

  const getPhone = (employee) =>
    getValue(
      employee,
      [
        "phone",
        "mobile",
        "mobileNumber",
      ],
      "—"
    );

  const getDepartment = (
    employee
  ) =>
    getValue(
      employee,
      [
        "department",
        "departmentName",
      ],
      "—"
    );

  const getDesignation = (
    employee
  ) =>
    getValue(
      employee,
      [
        "designation",
        "position",
        "jobTitle",
      ],
      "—"
    );

  const getJoiningDate = (
    employee
  ) =>
    getValue(
      employee,
      [
        "joiningDate",
        "dateOfJoining",
        "hireDate",
      ],
      ""
    );

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "—";
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const getInitials = (
    name
  ) => {
    if (!name) return "U";

    const parts = String(name)
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (parts.length === 1) {
      return parts[0]
        .slice(0, 2)
        .toUpperCase();
    }

    return (
      parts[0].charAt(0) +
      parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  };

  const getStatusVariant = (
    status
  ) => {
    switch (status) {
      case "ACTIVE":
        return "success";

      case "INACTIVE":
      case "DISABLED":
        return "danger";

      case "ON_LEAVE":
      case "ON LEAVE":
        return "warning";

      default:
        return "default";
    }
  };

  const getRoleVariant = (
    role
  ) => {
    switch (role) {
      case "ADMIN":
        return "danger";

      case "MANAGER":
        return "info";

      case "HR":
        return "warning";

      case "EMPLOYEE":
        return "success";

      default:
        return "default";
    }
  };

  const filteredEmployees = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return employees.filter(
      (employee) => {
        const name =
          getEmployeeName(
            employee
          );

        const role =
          getRole(employee);

        const status =
          getStatus(employee);

        if (
          roleFilter !== "ALL" &&
          role !== roleFilter
        ) {
          return false;
        }

        if (
          statusFilter !== "ALL" &&
          status !== statusFilter
        ) {
          return false;
        }

        if (!query) {
          return true;
        }

        const searchableText = [
          name,
          getEmail(employee),
          getPhone(employee),
          getDepartment(
            employee
          ),
          getDesignation(
            employee
          ),
          role,
          status,
          getValue(employee, [
            "employeeCode",
            "employeeNumber",
          ]),
        ]
          .join(" ")
          .toLowerCase();

        return searchableText.includes(
          query
        );
      }
    );
  }, [
    employees,
    search,
    roleFilter,
    statusFilter,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredEmployees.length /
        itemsPerPage
    )
  );

  const paginatedEmployees = useMemo(() => {
    const start =
      (currentPage - 1) *
      itemsPerPage;

    return filteredEmployees.slice(
      start,
      start + itemsPerPage
    );
  }, [
    filteredEmployees,
    currentPage,
    itemsPerPage,
  ]);

  const stats = useMemo(() => {
    const total =
      employees.length;

    const active = employees.filter(
      (employee) =>
        getStatus(employee) ===
        "ACTIVE"
    ).length;

    const managers =
      employees.filter(
        (employee) =>
          getRole(employee) ===
          "MANAGER"
      ).length;

    const hrEmployees =
      employees.filter(
        (employee) =>
          getRole(employee) ===
          "HR"
      ).length;

    const inactive =
      employees.filter(
        (employee) =>
          [
            "INACTIVE",
            "DISABLED",
          ].includes(
            getStatus(employee)
          )
      ).length;

    return {
      total,
      active,
      managers,
      hrEmployees,
      inactive,
    };
  }, [employees]);

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setDeleting(true);
      setError("");

      if (
        typeof employeeService.deleteEmployee !==
        "function"
      ) {
        throw new Error(
          "Employee delete service is not available."
        );
      }

      await employeeService.deleteEmployee(
        deleteId
      );

      setEmployees((previous) =>
        previous.filter(
          (employee) =>
            getId(employee) !==
            deleteId
        )
      );

      setDeleteId(null);
    } catch (err) {
      console.error(
        "Failed to delete employee:",
        err
      );

      setError(
        err?.message ||
          "Failed to delete employee."
      );
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-employees-loading">
          <Loader />
          <p>
            Loading employees...
          </p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-employees-page">
        <div className="admin-employees-page-header">
          <div>
            <h1>
              Employees
            </h1>

            <p>
              Manage employee records,
              roles and workforce information.
            </p>
          </div>

          <div className="admin-employees-header-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                loadEmployees(true)
              }
              disabled={refreshing}
            >
              {refreshing
                ? "Refreshing..."
                : "↻ Refresh"}
            </Button>

            <Button
              type="button"
              variant="primary"
              onClick={() =>
                router.push(
                  "/admin/employees/create"
                )
              }
            >
              + Add Employee
            </Button>
          </div>
        </div>

        {error && (
          <div className="admin-employees-error">
            {error}
          </div>
        )}

        <div className="admin-employees-stats">
          <div className="admin-employee-stat-card">
            <div className="admin-employee-stat-icon">
              TE
            </div>

            <div>
              <span>
                Total Employees
              </span>

              <strong>
                {stats.total}
              </strong>
            </div>
          </div>

          <div className="admin-employee-stat-card">
            <div className="admin-employee-stat-icon active">
              AC
            </div>

            <div>
              <span>
                Active
              </span>

              <strong>
                {stats.active}
              </strong>
            </div>
          </div>

          <div className="admin-employee-stat-card">
            <div className="admin-employee-stat-icon manager">
              MG
            </div>

            <div>
              <span>
                Managers
              </span>

              <strong>
                {stats.managers}
              </strong>
            </div>
          </div>

          <div className="admin-employee-stat-card">
            <div className="admin-employee-stat-icon hr">
              HR
            </div>

            <div>
              <span>
                HR
              </span>

              <strong>
                {stats.hrEmployees}
              </strong>
            </div>
          </div>

          <div className="admin-employee-stat-card">
            <div className="admin-employee-stat-icon inactive">
              IN
            </div>

            <div>
              <span>
                Inactive
              </span>

              <strong>
                {stats.inactive}
              </strong>
            </div>
          </div>
        </div>

        <div className="admin-employees-toolbar">
          <div className="admin-employees-search">
            <SearchBox
              value={search}
              onChange={setSearch}
              placeholder="Search employees..."
            />
          </div>

          <div className="admin-employees-filters">
            <Select
              value={roleFilter}
              onChange={(event) =>
                setRoleFilter(
                  event?.target
                    ? event.target.value
                    : event
                )
              }
              options={[
                {
                  label: "All Roles",
                  value: "ALL",
                },
                {
                  label: "Admin",
                  value: "ADMIN",
                },
                {
                  label: "Manager",
                  value: "MANAGER",
                },
                {
                  label: "HR",
                  value: "HR",
                },
                {
                  label: "Employee",
                  value: "EMPLOYEE",
                },
              ]}
            />

            <Select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event?.target
                    ? event.target.value
                    : event
                )
              }
              options={[
                {
                  label: "All Status",
                  value: "ALL",
                },
                {
                  label: "Active",
                  value: "ACTIVE",
                },
                {
                  label: "Inactive",
                  value: "INACTIVE",
                },
                {
                  label: "On Leave",
                  value: "ON_LEAVE",
                },
              ]}
            />

            <Select
              value={String(
                itemsPerPage
              )}
              onChange={(event) =>
                setItemsPerPage(
                  Number(
                    event?.target
                      ? event.target.value
                      : event
                  )
                )
              }
              options={[
                {
                  label: "10 / page",
                  value: "10",
                },
                {
                  label: "25 / page",
                  value: "25",
                },
                {
                  label: "50 / page",
                  value: "50",
                },
              ]}
            />
          </div>
        </div>

        <div className="admin-employees-card">
          <div className="admin-employees-card-header">
            <div>
              <h2>
                Employee Records
              </h2>

              <p>
                {filteredEmployees.length}{" "}
                employee
                {filteredEmployees.length !==
                1
                  ? "s"
                  : ""}{" "}
                found
              </p>
            </div>
          </div>

          {paginatedEmployees.length ===
          0 ? (
            <div className="admin-employees-empty">
              <div className="admin-employees-empty-icon">
                EM
              </div>

              <h3>
                No employees found
              </h3>

              <p>
                {search ||
                roleFilter !== "ALL" ||
                statusFilter !== "ALL"
                  ? "Try changing your filters or search."
                  : "Add your first employee to get started."}
              </p>

              {!search &&
                roleFilter ===
                  "ALL" &&
                statusFilter ===
                  "ALL" && (
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() =>
                      router.push(
                        "/admin/employees/create"
                      )
                    }
                  >
                    + Add Employee
                  </Button>
                )}
            </div>
          ) : (
            <>
              <div className="admin-employees-table-wrapper">
                <table className="admin-employees-table">
                  <thead>
                    <tr>
                      <th>
                        Employee
                      </th>

                      <th>
                        Contact
                      </th>

                      <th>
                        Department
                      </th>

                      <th>
                        Designation
                      </th>

                      <th>
                        Role
                      </th>

                      <th>
                        Joining Date
                      </th>

                      <th>
                        Status
                      </th>

                      <th>
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedEmployees.map(
                      (
                        employee,
                        index
                      ) => {
                        const id =
                          getId(employee);

                        const name =
                          getEmployeeName(
                            employee
                          );

                        const role =
                          getRole(
                            employee
                          );

                        const status =
                          getStatus(
                            employee
                          );

                        return (
                          <tr
                            key={
                              id ||
                              index
                            }
                          >
                            <td>
                              <div className="admin-employee-profile">
                                <div className="admin-employee-avatar">
                                  {getInitials(
                                    name
                                  )}
                                </div>

                                <div className="admin-employee-name">
                                  <strong>
                                    {name}
                                  </strong>

                                  {getValue(
                                    employee,
                                    [
                                      "employeeCode",
                                      "employeeNumber",
                                    ],
                                    ""
                                  ) && (
                                    <small>
                                      {getValue(
                                        employee,
                                        [
                                          "employeeCode",
                                          "employeeNumber",
                                        ]
                                      )}
                                    </small>
                                  )}
                                </div>
                              </div>
                            </td>

                            <td>
                              <div className="admin-employee-contact">
                                <span>
                                  {getEmail(
                                    employee
                                  )}
                                </span>

                                <small>
                                  {getPhone(
                                    employee
                                  )}
                                </small>
                              </div>
                            </td>

                            <td>
                              <span className="admin-employee-text">
                                {getDepartment(
                                  employee
                                )}
                              </span>
                            </td>

                            <td>
                              <span className="admin-employee-text">
                                {getDesignation(
                                  employee
                                )}
                              </span>
                            </td>

                            <td>
                              <Badge
                                variant={getRoleVariant(
                                  role
                                )}
                              >
                                {role}
                              </Badge>
                            </td>

                            <td>
                              <span className="admin-employee-date">
                                {formatDate(
                                  getJoiningDate(
                                    employee
                                  )
                                )}
                              </span>
                            </td>

                            <td>
                              <Badge
                                variant={getStatusVariant(
                                  status
                                )}
                              >
                                {status.replaceAll(
                                  "_",
                                  " "
                                )}
                              </Badge>
                            </td>

                            <td>
                              <div className="admin-employee-actions">
                                <button
                                  type="button"
                                  className="admin-employee-action view"
                                  disabled={!id}
                                  onClick={() =>
                                    router.push(
                                      `/admin/employees/${id}`
                                    )
                                  }
                                >
                                  View
                                </button>

                                <button
                                  type="button"
                                  className="admin-employee-action edit"
                                  disabled={!id}
                                  onClick={() =>
                                    router.push(
                                      `/admin/employees/create?edit=${id}`
                                    )
                                  }
                                >
                                  Edit
                                </button>

                                <button
                                  type="button"
                                  className="admin-employee-action delete"
                                  disabled={!id}
                                  onClick={() =>
                                    setDeleteId(
                                      id
                                    )
                                  }
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>

              <div className="admin-employees-pagination">
                <Pagination
                  currentPage={
                    currentPage
                  }
                  totalPages={
                    totalPages
                  }
                  onPageChange={(page) =>
                    setCurrentPage(
                      page
                    )
                  }
                />
              </div>
            </>
          )}
        </div>

        <ConfirmDialog
          isOpen={Boolean(
            deleteId
          )}
          onClose={() =>
            !deleting &&
            setDeleteId(null)
          }
          onConfirm={
            handleDelete
          }
          title="Delete Employee"
          message="Are you sure you want to delete this employee? This action cannot be undone."
          confirmText={
            deleting
              ? "Deleting..."
              : "Delete Employee"
          }
          cancelText="Cancel"
          loading={deleting}
          danger
        />
      </div>
    </AdminLayout>
  );
};

export default AdminEmployeesPage;