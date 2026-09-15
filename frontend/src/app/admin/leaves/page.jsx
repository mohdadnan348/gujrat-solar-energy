"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AdminLayout from "../layout";
import Badge from "@/components/common/Badge";
import Button from "@/components/common/Button";
import Loader from "@/components/common/Loader";
import SearchBox from "@/components/common/SearchBox";
import Select from "@/components/common/Select";
import Pagination from "@/components/common/Pagination";
import leaveService from "@/services/leave.service";
import employeeService from "@/services/employee.service";
import "./leaves.css";

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "CANCELLED", label: "Cancelled" },
];

const PAGE_SIZE = 10;

const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "NA";

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const normalizeStatus = (status) => {
  if (!status) return "—";

  return String(status)
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const getStatusVariant = (status) => {
  switch (String(status || "").toUpperCase()) {
    case "PENDING":
      return "warning";
    case "APPROVED":
      return "success";
    case "REJECTED":
      return "danger";
    case "CANCELLED":
      return "default";
    default:
      return "default";
  }
};

const extractLeaves = (response) => {
  if (Array.isArray(response)) return response;

  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.leaves)) return response.leaves;
  if (Array.isArray(response?.data?.leaves)) return response.data.leaves;

  return [];
};

const extractEmployees = (response) => {
  if (Array.isArray(response)) return response;

  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.employees)) return response.employees;
  if (Array.isArray(response?.data?.employees)) return response.data.employees;

  return [];
};

const getEmployee = (leave) => {
  if (!leave?.employee) return null;

  return typeof leave.employee === "object" ? leave.employee : null;
};

const getEmployeeId = (leave) => {
  if (typeof leave?.employee === "string") {
    return leave.employee;
  }

  return (
    leave?.employee?._id ||
    leave?.employee?.id ||
    leave?.employeeId ||
    "—"
  );
};

const getEmployeeName = (leave, employees = []) => {
  const employee = getEmployee(leave);

  if (employee) {
    return (
      employee.name ||
      `${employee.firstName || ""} ${employee.lastName || ""}`.trim() ||
      employee.fullName ||
      "Unknown Employee"
    );
  }

  const employeeId = getEmployeeId(leave);

  const matchedEmployee = employees.find(
    (item) =>
      item?._id === employeeId ||
      item?.id === employeeId ||
      item?.employeeId === employeeId
  );

  if (matchedEmployee) {
    return (
      matchedEmployee.name ||
      `${matchedEmployee.firstName || ""} ${
        matchedEmployee.lastName || ""
      }`.trim() ||
      matchedEmployee.fullName ||
      "Unknown Employee"
    );
  }

  return "Unknown Employee";
};

const AdminLeavesPage = () => {
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [loading, setLoading] = useState(true);
  const [employeeLoading, setEmployeeLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const loadEmployees = async () => {
    try {
      setEmployeeLoading(true);

      const response = await employeeService.getEmployees({
        page: 1,
        limit: 1000,
      });

      setEmployees(extractEmployees(response));
    } catch (err) {
      console.error("Failed to load employees:", err);
    } finally {
      setEmployeeLoading(false);
    }
  };

  const loadLeaves = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        page: 1,
        limit: 1000,
      };

      if (status) {
        params.status = status;
      }

      const response = await leaveService.getLeaves(params);

      setLeaves(extractLeaves(response));
      setCurrentPage(1);
    } catch (err) {
      console.error("Failed to load leave requests:", err);

      setError(
        err?.message ||
          err?.response?.data?.message ||
          "Unable to load leave requests."
      );

      setLeaves([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
    loadLeaves();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadLeaves();
    }, 250);

    return () => clearTimeout(timer);
  }, [status]);

  const filteredLeaves = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return leaves;

    return leaves.filter((leave) => {
      const employeeName = getEmployeeName(leave, employees).toLowerCase();
      const employeeId = String(getEmployeeId(leave)).toLowerCase();

      const leaveType = String(
        leave.leaveType || leave.type || ""
      ).toLowerCase();

      const reason = String(leave.reason || "").toLowerCase();

      const startDate = formatDate(
        leave.startDate || leave.fromDate || leave.from
      ).toLowerCase();

      const endDate = formatDate(
        leave.endDate || leave.toDate || leave.to
      ).toLowerCase();

      return (
        employeeName.includes(query) ||
        employeeId.includes(query) ||
        leaveType.includes(query) ||
        reason.includes(query) ||
        startDate.includes(query) ||
        endDate.includes(query)
      );
    });
  }, [leaves, employees, search]);

  const summary = useMemo(() => {
    const total = filteredLeaves.length;

    const pending = filteredLeaves.filter(
      (leave) => String(leave.status).toUpperCase() === "PENDING"
    ).length;

    const approved = filteredLeaves.filter(
      (leave) => String(leave.status).toUpperCase() === "APPROVED"
    ).length;

    const rejected = filteredLeaves.filter(
      (leave) => String(leave.status).toUpperCase() === "REJECTED"
    ).length;

    const cancelled = filteredLeaves.filter(
      (leave) => String(leave.status).toUpperCase() === "CANCELLED"
    ).length;

    return {
      total,
      pending,
      approved,
      rejected,
      cancelled,
    };
  }, [filteredLeaves]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredLeaves.length / PAGE_SIZE)
  );

  const paginatedLeaves = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;

    return filteredLeaves.slice(start, start + PAGE_SIZE);
  }, [filteredLeaves, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleRefresh = () => {
    loadLeaves();
    loadEmployees();
  };

  const handleClearFilters = () => {
    setSearch("");
    setStatus("");
    setCurrentPage(1);
  };

  return (
    <AdminLayout>
      <div className="admin-leaves-page">
        <div className="admin-leaves-header">
          <div>
            <div className="admin-leaves-breadcrumb">
              <Link href="/admin">Admin</Link>
              <span>/</span>
              <span>Leaves</span>
            </div>

            <h1>Leave Management</h1>

            <p>
              Review employee leave requests and monitor their approval
              status.
            </p>
          </div>

          <div className="admin-leaves-header-actions">
            <Link href="/admin/leaves/create">
              <Button>Create Leave Request</Button>
            </Link>

            <Button
              variant="secondary"
              onClick={handleRefresh}
              disabled={loading || employeeLoading}
            >
              Refresh
            </Button>
          </div>
        </div>

        {error && (
          <div className="admin-leaves-error">
            <div>
              <strong>Unable to load leave requests</strong>
              <p>{error}</p>
            </div>

            <Button variant="secondary" onClick={loadLeaves}>
              Try Again
            </Button>
          </div>
        )}

        <div className="admin-leaves-stats">
          <div className="admin-leaves-stat-card">
            <div className="admin-leaves-stat-icon">T</div>
            <div>
              <span>Total Requests</span>
              <strong>{summary.total}</strong>
            </div>
          </div>

          <div className="admin-leaves-stat-card">
            <div className="admin-leaves-stat-icon warning">P</div>
            <div>
              <span>Pending</span>
              <strong>{summary.pending}</strong>
            </div>
          </div>

          <div className="admin-leaves-stat-card">
            <div className="admin-leaves-stat-icon success">A</div>
            <div>
              <span>Approved</span>
              <strong>{summary.approved}</strong>
            </div>
          </div>

          <div className="admin-leaves-stat-card">
            <div className="admin-leaves-stat-icon danger">R</div>
            <div>
              <span>Rejected</span>
              <strong>{summary.rejected}</strong>
            </div>
          </div>

          <div className="admin-leaves-stat-card">
            <div className="admin-leaves-stat-icon">C</div>
            <div>
              <span>Cancelled</span>
              <strong>{summary.cancelled}</strong>
            </div>
          </div>
        </div>

        <div className="admin-leaves-card">
          <div className="admin-leaves-filters">
            <div className="admin-leaves-search">
              <SearchBox
                value={search}
                onChange={setSearch}
                placeholder="Search employee, leave type, or reason..."
              />
            </div>

            <div className="admin-leaves-filter">
              <Select
                value={status}
                onChange={(event) =>
                  setStatus(event?.target?.value ?? event)
                }
                options={STATUS_OPTIONS}
                placeholder="All Statuses"
              />
            </div>

            {(search || status) && (
              <Button
                variant="ghost"
                onClick={handleClearFilters}
                className="admin-leaves-clear"
              >
                Clear Filters
              </Button>
            )}
          </div>

          {loading ? (
            <div className="admin-leaves-loader">
              <Loader />
            </div>
          ) : (
            <>
              <div className="admin-leaves-table-wrapper">
                <table className="admin-leaves-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Leave Type</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Days</th>
                      <th>Reason</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedLeaves.length === 0 ? (
                      <tr>
                        <td
                          colSpan="7"
                          className="admin-leaves-empty-cell"
                        >
                          <div className="admin-leaves-empty">
                            <div className="admin-leaves-empty-icon">L</div>

                            <h3>No leave requests found</h3>

                            <p>
                              Try changing your filters or create a new leave
                              request.
                            </p>

                            {(search || status) && (
                              <Button
                                variant="secondary"
                                onClick={handleClearFilters}
                              >
                                Clear Filters
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedLeaves.map((leave, index) => {
                        const employeeName = getEmployeeName(
                          leave,
                          employees
                        );

                        const startDate =
                          leave.startDate ||
                          leave.fromDate ||
                          leave.from;

                        const endDate =
                          leave.endDate ||
                          leave.toDate ||
                          leave.to;

                        const leaveType =
                          leave.leaveType ||
                          leave.type ||
                          "—";

                        const days =
                          leave.totalDays ??
                          leave.days ??
                          leave.numberOfDays ??
                          "—";

                        const reason =
                          leave.reason ||
                          leave.description ||
                          leave.notes ||
                          "—";

                        const key =
                          leave._id ||
                          leave.id ||
                          `${getEmployeeId(leave)}-${startDate}-${index}`;

                        return (
                          <tr key={key}>
                            <td>
                              <Link
                                href={
                                  getEmployeeId(leave) !== "—"
                                    ? `/admin/employees/${getEmployeeId(
                                        leave
                                      )}`
                                    : "#"
                                }
                                className="admin-leaves-employee"
                              >
                                <div className="admin-leaves-avatar">
                                  {getInitials(employeeName)}
                                </div>

                                <div>
                                  <strong>{employeeName}</strong>

                                  <span>
                                    {getEmployeeId(leave) !== "—"
                                      ? `ID: ${getEmployeeId(leave)}`
                                      : "Employee"}
                                  </span>
                                </div>
                              </Link>
                            </td>

                            <td>
                              <span className="admin-leaves-type">
                                {normalizeStatus(leaveType)}
                              </span>
                            </td>

                            <td>{formatDate(startDate)}</td>

                            <td>{formatDate(endDate)}</td>

                            <td>
                              <span className="admin-leaves-days">
                                {days}
                              </span>
                            </td>

                            <td>
                              <span
                                className="admin-leaves-reason"
                                title={reason}
                              >
                                {reason}
                              </span>
                            </td>

                            <td>
                              <Badge
                                variant={getStatusVariant(leave.status)}
                              >
                                {normalizeStatus(leave.status)}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {filteredLeaves.length > PAGE_SIZE && (
                <div className="admin-leaves-pagination">
                  <span>
                    Showing{" "}
                    {Math.min(
                      (currentPage - 1) * PAGE_SIZE + 1,
                      filteredLeaves.length
                    )}{" "}
                    to{" "}
                    {Math.min(
                      currentPage * PAGE_SIZE,
                      filteredLeaves.length
                    )}{" "}
                    of {filteredLeaves.length} requests
                  </span>

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
      </div>
    </AdminLayout>
  );
};

export default AdminLeavesPage;