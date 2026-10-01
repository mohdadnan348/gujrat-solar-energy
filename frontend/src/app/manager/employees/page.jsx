"use client";

import React, { useEffect, useMemo, useState } from "react";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import SearchBox from "@/components/common/SearchBox";
import Pagination from "@/components/common/Pagination";
import Loader from "@/components/common/Loader";
import Modal from "@/components/common/Modal";
import { useAuth } from "@/hooks/useAuth";
import employeeService from "@/services/employee.service";

import "./employees.css";

const PAGE_SIZE = 10;

const ManagerEmployeesPage = () => {
  const { user, loading: authLoading } = useAuth();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const handleSearch = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await employeeService.getEmployees();

      const data =
        response?.data?.employees ||
        response?.data?.data ||
        response?.employees ||
        response?.data ||
        response ||
        [];

      setEmployees(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load employees:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load employees."
      );

      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, roleFilter]);

  /* =========================
     HELPERS
  ========================= */

  const getEmployeeName = (employee) => {
    if (!employee) return "—";

    if (typeof employee.name === "string" && employee.name.trim()) {
      return employee.name;
    }

    const firstName =
      employee.firstName ||
      employee.user?.firstName ||
      employee.user?.name ||
      "";

    const lastName =
      employee.lastName ||
      employee.user?.lastName ||
      "";

    const fullName = `${firstName} ${lastName}`.trim();

    return (
      fullName ||
      employee.fullName ||
      employee.username ||
      employee.user?.username ||
      "Unnamed Employee"
    );
  };

  const getEmployeeRole = (employee) => {
    return (
      employee?.role ||
      employee?.user?.role ||
      employee?.designation ||
      "EMPLOYEE"
    );
  };

  const getEmployeeStatus = (employee) => {
    return (
      employee?.status ||
      employee?.employmentStatus ||
      employee?.user?.status ||
      "ACTIVE"
    );
  };

  const getEmployeeEmail = (employee) => {
    return employee?.email || employee?.user?.email || "—";
  };

  const getEmployeePhone = (employee) => {
    return (
      employee?.phone ||
      employee?.mobile ||
      employee?.user?.phone ||
      employee?.alternatePhone ||
      "—"
    );
  };

  const getEmployeeDepartment = (employee) => {
    return (
      employee?.department ||
      employee?.departmentName ||
      employee?.user?.department ||
      "—"
    );
  };

  const getEmployeeId = (employee) => {
    return (
      employee?.employeeId ||
      employee?.employeeCode ||
      employee?.code ||
      employee?._id ||
      employee?.id ||
      "—"
    );
  };

  /* =========================
     NORMALIZED EMPLOYEES
  ========================= */

  const normalizedEmployees = useMemo(() => {
    return employees.map((employee) => ({
      ...employee,
      _displayName: String(getEmployeeName(employee)),
      _displayRole: String(getEmployeeRole(employee)),
      _displayStatus: String(getEmployeeStatus(employee)),
      _displayEmail: String(getEmployeeEmail(employee)),
      _displayPhone: String(getEmployeePhone(employee)),
      _displayDepartment: String(getEmployeeDepartment(employee)),
      _displayId: String(getEmployeeId(employee)),
    }));
  }, [employees]);

  /* =========================
     FILTER
  ========================= */

  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();

    return normalizedEmployees.filter((employee) => {
      const matchesSearch =
        !query ||
        employee._displayName.toLowerCase().includes(query) ||
        employee._displayEmail.toLowerCase().includes(query) ||
        employee._displayPhone.toLowerCase().includes(query) ||
        employee._displayId.toLowerCase().includes(query) ||
        employee._displayDepartment.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "ALL" ||
        employee._displayStatus.toUpperCase() === statusFilter;

      const matchesRole =
        roleFilter === "ALL" ||
        employee._displayRole.toUpperCase() === roleFilter;

      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [
    normalizedEmployees,
    search,
    statusFilter,
    roleFilter,
  ]);

  /* =========================
     PAGINATION
  ========================= */

  const totalPages = Math.max(
    1,
    Math.ceil(filteredEmployees.length / PAGE_SIZE)
  );

  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;

    return filteredEmployees.slice(start, start + PAGE_SIZE);
  }, [filteredEmployees, currentPage]);

  /* =========================
     STATISTICS
  ========================= */

  const statistics = useMemo(() => {
    const total = normalizedEmployees.length;

    const active = normalizedEmployees.filter(
      (employee) =>
        employee._displayStatus.toUpperCase() === "ACTIVE"
    ).length;

    const managers = normalizedEmployees.filter(
      (employee) =>
        employee._displayRole.toUpperCase() === "MANAGER"
    ).length;

    const employeesCount = normalizedEmployees.filter(
      (employee) =>
        employee._displayRole.toUpperCase() === "EMPLOYEE"
    ).length;

    return {
      total,
      active,
      managers,
      employees: employeesCount,
    };
  }, [normalizedEmployees]);

  /* =========================
     FORMATTING
  ========================= */

  const formatRole = (role) => {
    if (!role) return "Employee";

    return String(role)
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const formatStatus = (status) => {
    if (!status) return "Active";

    return String(status)
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const getStatusVariant = (status) => {
    const normalized = String(status || "").toUpperCase();

    if (normalized === "ACTIVE") return "success";
    if (normalized === "INACTIVE") return "danger";
    if (normalized === "ON_LEAVE") return "warning";

    return "default";
  };

  const getInitials = (name) => {
    if (!name) return "E";

    const parts = String(name).trim().split(/\s+/);

    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }

    return `${parts[0][0]}${
      parts[parts.length - 1][0]
    }`.toUpperCase();
  };

  /* =========================
     AUTH LOADING
  ========================= */

  if (authLoading) {
    return (
      <div className="manager-employees-loading">
        <Loader />
      </div>
    );
  }

  /* =========================
     PAGE
  ========================= */

  return (
    <div className="manager-employees-page">
      {/* HEADER */}
      <div className="manager-employees-header">
        <div>
          <span className="manager-employees-eyebrow">
            Team Management
          </span>

          <h1>Employees</h1>

          <p>
            View and manage employee information across GUJRAT
            SOLAR ENERGY.
          </p>
        </div>

        <Button
          variant="secondary"
          onClick={loadEmployees}
          disabled={loading}
        >
          ↻ Refresh
        </Button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="manager-employees-error">
          <span>{error}</span>

          <Button
            size="small"
            variant="secondary"
            onClick={loadEmployees}
          >
            Retry
          </Button>
        </div>
      )}

      {/* SUMMARY */}
      <div className="manager-employees-summary">
        <div className="manager-employee-summary-card">
          <span>Total Employees</span>
          <strong>{statistics.total}</strong>
        </div>

        <div className="manager-employee-summary-card manager-employee-active">
          <span>Active</span>
          <strong>{statistics.active}</strong>
        </div>

        <div className="manager-employee-summary-card manager-employee-manager">
          <span>Managers</span>
          <strong>{statistics.managers}</strong>
        </div>

        <div className="manager-employee-summary-card">
          <span>Employees</span>
          <strong>{statistics.employees}</strong>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="manager-employees-toolbar">
        <SearchBox
          value={search}
          onChange={handleSearch}
          placeholder="Search by name, email, phone or employee ID..."
        />

        <select
          className="manager-employees-filter"
          value={roleFilter}
          onChange={(event) =>
            setRoleFilter(event.target.value)
          }
          aria-label="Filter by role"
        >
          <option value="ALL">All Roles</option>
          <option value="MANAGER">Manager</option>
          <option value="HR">HR</option>
          <option value="EMPLOYEE">Employee</option>
        </select>

        <select
          className="manager-employees-filter"
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value)
          }
          aria-label="Filter by status"
        >
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="ON_LEAVE">On Leave</option>
        </select>
      </div>

      {/* TABLE CARD */}
      <div className="manager-employees-card">
        {loading ? (
          <div className="manager-employees-table-loading">
            <Loader />
          </div>
        ) : (
          <>
            <div className="manager-employees-table-wrapper">
              <table className="manager-employees-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Employee ID</th>
                    <th>Department</th>
                    <th>Role</th>
                    <th>Contact</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedEmployees.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="manager-employees-empty"
                      >
                        <div>
                          <span className="manager-employees-empty-icon">
                            👥
                          </span>

                          <strong>No employees found</strong>

                          <p>
                            Try changing your search or filter
                            criteria.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedEmployees.map((employee) => (
                      <tr
                        key={
                          employee._id ||
                          employee.id ||
                          employee._displayId
                        }
                      >
                        {/* EMPLOYEE */}
                        <td>
                          <div className="manager-employee-profile">
                            {employee.avatar ||
                            employee.profileImage ||
                            employee.user?.avatar ? (
                              <img
                                src={
                                  employee.avatar ||
                                  employee.profileImage ||
                                  employee.user?.avatar
                                }
                                alt={employee._displayName}
                              />
                            ) : (
                              <span className="manager-employee-avatar">
                                {getInitials(
                                  employee._displayName
                                )}
                              </span>
                            )}

                            <div>
                              <strong>
                                {employee._displayName}
                              </strong>

                              <small>
                                {employee._displayEmail}
                              </small>
                            </div>
                          </div>
                        </td>

                        {/* ID */}
                        <td>
                          <span className="manager-employee-id">
                            {employee._displayId}
                          </span>
                        </td>

                        {/* DEPARTMENT */}
                        <td>
                          {employee._displayDepartment}
                        </td>

                        {/* ROLE */}
                        <td>
                          <span className="manager-employee-role">
                            {formatRole(
                              employee._displayRole
                            )}
                          </span>
                        </td>

                        {/* CONTACT */}
                        <td>
                          <div className="manager-employee-contact">
                            <span>
                              {employee._displayPhone}
                            </span>

                            <small>
                              {employee._displayEmail}
                            </small>
                          </div>
                        </td>

                        {/* STATUS */}
                        <td>
                          <Badge
                            variant={getStatusVariant(
                              employee._displayStatus
                            )}
                          >
                            {formatStatus(
                              employee._displayStatus
                            )}
                          </Badge>
                        </td>

                        {/* ACTION */}
                        <td>
                          <Button
                            size="small"
                            variant="secondary"
                            onClick={() =>
                              setSelectedEmployee(employee)
                            }
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            {filteredEmployees.length > 0 && (
              <div className="manager-employees-pagination">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* EMPLOYEE DETAILS MODAL */}
      {selectedEmployee && (
        <Modal
          isOpen={Boolean(selectedEmployee)}
          onClose={() => setSelectedEmployee(null)}
          title="Employee Details"
        >
          <div className="manager-employee-modal-content">
            {/* PROFILE */}
            <div className="manager-employee-modal-profile">
              {selectedEmployee.avatar ||
              selectedEmployee.profileImage ||
              selectedEmployee.user?.avatar ? (
                <img
                  src={
                    selectedEmployee.avatar ||
                    selectedEmployee.profileImage ||
                    selectedEmployee.user?.avatar
                  }
                  alt={selectedEmployee._displayName}
                />
              ) : (
                <span className="manager-employee-modal-avatar">
                  {getInitials(
                    selectedEmployee._displayName
                  )}
                </span>
              )}

              <div>
                <h2>{selectedEmployee._displayName}</h2>

                <p>
                  {formatRole(
                    selectedEmployee._displayRole
                  )}
                </p>
              </div>
            </div>

            {/* DETAILS */}
            <div className="manager-employee-details-grid">
              <div>
                <span>Employee ID</span>
                <strong>
                  {selectedEmployee._displayId}
                </strong>
              </div>

              <div>
                <span>Status</span>
                <strong>
                  {formatStatus(
                    selectedEmployee._displayStatus
                  )}
                </strong>
              </div>

              <div>
                <span>Department</span>
                <strong>
                  {selectedEmployee._displayDepartment}
                </strong>
              </div>

              <div>
                <span>Role</span>
                <strong>
                  {formatRole(
                    selectedEmployee._displayRole
                  )}
                </strong>
              </div>

              <div>
                <span>Email</span>
                <strong>
                  {selectedEmployee._displayEmail}
                </strong>
              </div>

              <div>
                <span>Phone</span>
                <strong>
                  {selectedEmployee._displayPhone}
                </strong>
              </div>
            </div>

            {/* FOOTER */}
            <div className="manager-employee-modal-footer">
              <Button
                variant="secondary"
                onClick={() =>
                  setSelectedEmployee(null)
                }
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ManagerEmployeesPage;