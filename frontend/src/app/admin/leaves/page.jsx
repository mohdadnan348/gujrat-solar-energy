
"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

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
  String(name)
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

const normalizeStatus = (status) =>
  String(status || "—")
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const getStatusVariant = (status) => {
  switch (String(status || "").toUpperCase()) {
    case "PENDING":
      return "warning";
    case "APPROVED":
      return "success";
    case "REJECTED":
      return "danger";
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
  if (Array.isArray(response?.data?.leaveRequests))
    return response.data.leaveRequests;
  if (Array.isArray(response?.leaveRequests)) return response.leaveRequests;
  return [];
};

const extractEmployees = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.employees)) return response.employees;
  if (Array.isArray(response?.data?.employees))
    return response.data.employees;
  return [];
};

const getEmployee = (leave) =>
  leave?.employee && typeof leave.employee === "object"
    ? leave.employee
    : null;

const getEmployeeMongoId = (leave) => {
  const employee = getEmployee(leave);
  if (employee) return employee._id || employee.id || "";

  return typeof leave?.employee === "string" ? leave.employee : "";
};

const getEmployeeId = (leave) => {
  const employee = getEmployee(leave);

  return (
    employee?.employeeId ||
    employee?.employeeCode ||
    leave?.employeeCode ||
    leave?.employeeId ||
    getEmployeeMongoId(leave) ||
    "—"
  );
};

const getEmployeeName = (leave, employees = []) => {
  const employee = getEmployee(leave);

  if (employee) {
    const fullName =
      `${employee.firstName || ""} ${employee.lastName || ""}`.trim();

    return (
      employee.name ||
      employee.fullName ||
      fullName ||
      "Unknown Employee"
    );
  }

  const employeeId = getEmployeeMongoId(leave);

  const matchedEmployee = employees.find(
    (item) =>
      String(item?._id || item?.id || "") === String(employeeId) ||
      String(item?.employeeId || "") === String(employeeId)
  );

  if (matchedEmployee) {
    const fullName =
      `${matchedEmployee.firstName || ""} ${matchedEmployee.lastName || ""}`.trim();

    return (
      matchedEmployee.name ||
      matchedEmployee.fullName ||
      fullName ||
      "Unknown Employee"
    );
  }

  return "Unknown Employee";
};

const getLeaveTypeName = (leave) => {
  const type = leave?.leaveType ?? leave?.type;

  if (typeof type === "string") return type || "—";

  if (type && typeof type === "object") {
    return type.name || type.code || "Unknown Leave Type";
  }

  return "—";
};

export default function AdminLeavesPage() {
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [employeeLoading, setEmployeeLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const loadEmployees = useCallback(async () => {
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
  }, []);

  const loadLeaves = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = { page: 1, limit: 1000 };
      if (status) params.status = status;

      const response = await leaveService.getLeaves(params);
      setLeaves(extractLeaves(response));
      setCurrentPage(1);
    } catch (err) {
      console.error("Failed to load leave requests:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load leave requests."
      );
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  useEffect(() => {
    loadLeaves();
  }, [loadLeaves]);

  const filteredLeaves = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return leaves;

    return leaves.filter((leave) => {
      const values = [
        getEmployeeName(leave, employees),
        getEmployeeId(leave),
        getEmployeeMongoId(leave),
        getLeaveTypeName(leave),
        leave.reason,
        leave.description,
        leave.notes,
        formatDate(leave.startDate || leave.fromDate || leave.from),
        formatDate(leave.endDate || leave.toDate || leave.to),
        leave.status,
      ];

      return values.some((value) =>
        String(value || "").toLowerCase().includes(query)
      );
    });
  }, [leaves, employees, search]);

  const summary = useMemo(() => {
    const countStatus = (value) =>
      filteredLeaves.filter(
        (leave) => String(leave.status || "").toUpperCase() === value
      ).length;

    return {
      total: filteredLeaves.length,
      pending: countStatus("PENDING"),
      approved: countStatus("APPROVED"),
      rejected: countStatus("REJECTED"),
      cancelled: countStatus("CANCELLED"),
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
    if (currentPage > totalPages) setCurrentPage(totalPages);
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

  const handleStatusChange = (value) => {
    setStatus(value?.target?.value ?? value ?? "");
    setCurrentPage(1);
  };

  return (
    <div className="admin-leaves-page">
      <div className="admin-leaves-header">
        <div>
          <div className="admin-leaves-breadcrumb">
            <Link href="/admin">Admin</Link>
            <span>/</span>
            <span>Leaves</span>
          </div>

          <h1>Leave Management</h1>
          <p>Review employee leave requests and manage their status.</p>
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
        <StatCard label="Total Requests" value={summary.total} icon="T" />
        <StatCard label="Pending" value={summary.pending} icon="P" type="warning" />
        <StatCard label="Approved" value={summary.approved} icon="A" type="success" />
        <StatCard label="Rejected" value={summary.rejected} icon="R" type="danger" />
        <StatCard label="Cancelled" value={summary.cancelled} icon="C" />
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
              onChange={handleStatusChange}
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
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedLeaves.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="admin-leaves-empty-cell">
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
                      const employeeName = getEmployeeName(leave, employees);
                      const employeeMongoId = getEmployeeMongoId(leave);
                      const employeeCode = getEmployeeId(leave);
                      const startDate =
                        leave.startDate || leave.fromDate || leave.from;
                      const endDate =
                        leave.endDate || leave.toDate || leave.to;
                      const leaveType = getLeaveTypeName(leave);
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
                      const leaveId = leave._id || leave.id;
                      const key =
                        leaveId ||
                        `${employeeMongoId}-${startDate}-${index}`;

                      return (
                        <tr key={key}>
                          <td>
                            {employeeMongoId ? (
                              <Link
                                href={`/admin/employees/${employeeMongoId}`}
                                className="admin-leaves-employee"
                              >
                                <div className="admin-leaves-avatar">
                                  {getInitials(employeeName)}
                                </div>
                                <div>
                                  <strong>{employeeName}</strong>
                                  <span>ID: {employeeCode}</span>
                                </div>
                              </Link>
                            ) : (
                              <div className="admin-leaves-employee">
                                <div className="admin-leaves-avatar">
                                  {getInitials(employeeName)}
                                </div>
                                <div>
                                  <strong>{employeeName}</strong>
                                  <span>{employeeCode}</span>
                                </div>
                              </div>
                            )}
                          </td>

                          <td>
                            <span className="admin-leaves-type">
                              {normalizeStatus(leaveType)}
                            </span>
                          </td>

                          <td>{formatDate(startDate)}</td>
                          <td>{formatDate(endDate)}</td>

                          <td>
                            <span className="admin-leaves-days">{days}</span>
                          </td>

                          <td>
                            <span
                              className="admin-leaves-reason"
                              title={String(reason)}
                            >
                              {reason}
                            </span>
                          </td>

                          <td>
                            <Badge variant={getStatusVariant(leave.status)}>
                              {normalizeStatus(leave.status)}
                            </Badge>
                          </td>

                          <td>
                            {leaveId ? (
                              <Link
                                href={`/admin/leaves/${leaveId}`}
                                className="admin-leaves-view-link"
                                aria-label={`View leave request for ${employeeName}`}
                              >
                                View Details →
                              </Link>
                            ) : (
                              <span>—</span>
                            )}
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
                  {Math.min(currentPage * PAGE_SIZE, filteredLeaves.length)} of{" "}
                  {filteredLeaves.length} requests
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
  );
}

function StatCard({ label, value, icon, type = "" }) {
  return (
    <div className="admin-leaves-stat-card">
      <div
        className={`admin-leaves-stat-icon ${type}`}
        aria-hidden="true"
      >
        {icon}
      </div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}
