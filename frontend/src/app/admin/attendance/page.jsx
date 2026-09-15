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
import attendanceService from "@/services/attendance.service";
import employeeService from "@/services/employee.service";
import "./attendance.css";

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "PRESENT", label: "Present" },
  { value: "ABSENT", label: "Absent" },
  { value: "LATE", label: "Late" },
  { value: "HALF_DAY", label: "Half Day" },
  { value: "LEAVE", label: "Leave" },
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

const formatTime = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
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
    case "PRESENT":
      return "success";
    case "ABSENT":
      return "danger";
    case "LATE":
      return "warning";
    case "HALF_DAY":
      return "warning";
    case "LEAVE":
      return "info";
    default:
      return "default";
  }
};

const extractRecords = (response) => {
  if (Array.isArray(response)) return response;

  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.records)) return response.records;
  if (Array.isArray(response?.attendance)) return response.attendance;
  if (Array.isArray(response?.data?.attendance)) {
    return response.data.attendance;
  }

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

const getEmployee = (record) => {
  if (!record?.employee) return null;

  if (typeof record.employee === "object") {
    return record.employee;
  }

  return null;
};

const getEmployeeName = (record, employees = []) => {
  const employee = getEmployee(record);

  if (employee) {
    return (
      employee.name ||
      `${employee.firstName || ""} ${employee.lastName || ""}`.trim() ||
      employee.fullName ||
      "Unknown Employee"
    );
  }

  const employeeId =
    record?.employeeId ||
    (typeof record?.employee === "string" ? record.employee : null);

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

const getEmployeeId = (record) => {
  if (typeof record?.employee === "string") {
    return record.employee;
  }

  return (
    record?.employee?._id ||
    record?.employee?.id ||
    record?.employeeId ||
    "—"
  );
};

const AdminAttendancePage = () => {
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [loading, setLoading] = useState(true);
  const [employeeLoading, setEmployeeLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [date, setDate] = useState("");

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

  const loadAttendance = async () => {
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

      if (date) {
        params.date = date;
      }

      const response = await attendanceService.getAttendance(params);

      setRecords(extractRecords(response));
      setCurrentPage(1);
    } catch (err) {
      console.error("Failed to load attendance:", err);

      setError(
        err?.message ||
          err?.response?.data?.message ||
          "Unable to load attendance records."
      );

      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
    loadAttendance();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadAttendance();
    }, 250);

    return () => clearTimeout(timer);
  }, [status, date]);

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return records;

    return records.filter((record) => {
      const employeeName = getEmployeeName(record, employees).toLowerCase();

      const employeeId = String(getEmployeeId(record)).toLowerCase();

      const recordDate = formatDate(
        record.date || record.attendanceDate || record.createdAt
      ).toLowerCase();

      return (
        employeeName.includes(query) ||
        employeeId.includes(query) ||
        recordDate.includes(query)
      );
    });
  }, [records, employees, search]);

  const summary = useMemo(() => {
    const total = filteredRecords.length;

    const present = filteredRecords.filter(
      (record) => String(record.status).toUpperCase() === "PRESENT"
    ).length;

    const absent = filteredRecords.filter(
      (record) => String(record.status).toUpperCase() === "ABSENT"
    ).length;

    const late = filteredRecords.filter(
      (record) => String(record.status).toUpperCase() === "LATE"
    ).length;

    const leave = filteredRecords.filter(
      (record) => String(record.status).toUpperCase() === "LEAVE"
    ).length;

    return {
      total,
      present,
      absent,
      late,
      leave,
    };
  }, [filteredRecords]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRecords.length / PAGE_SIZE)
  );

  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;

    return filteredRecords.slice(start, start + PAGE_SIZE);
  }, [filteredRecords, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleRefresh = () => {
    loadAttendance();
    loadEmployees();
  };

  const handleClearFilters = () => {
    setSearch("");
    setStatus("");
    setDate("");
    setCurrentPage(1);
  };

  return (
    <AdminLayout>
      <div className="admin-attendance-page">
        <div className="admin-attendance-header">
          <div>
            <div className="admin-attendance-breadcrumb">
              <Link href="/admin">Admin</Link>
              <span>/</span>
              <span>Attendance</span>
            </div>

            <h1>Attendance Management</h1>

            <p>
              Monitor employee attendance records, status, and daily activity.
            </p>
          </div>

          <div className="admin-attendance-header-actions">
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
          <div className="admin-attendance-error">
            <div>
              <strong>Unable to load attendance</strong>
              <p>{error}</p>
            </div>

            <Button variant="secondary" onClick={loadAttendance}>
              Try Again
            </Button>
          </div>
        )}

        <div className="admin-attendance-stats">
          <div className="admin-attendance-stat-card">
            <div className="admin-attendance-stat-icon">T</div>
            <div>
              <span>Total Records</span>
              <strong>{summary.total}</strong>
            </div>
          </div>

          <div className="admin-attendance-stat-card">
            <div className="admin-attendance-stat-icon success">P</div>
            <div>
              <span>Present</span>
              <strong>{summary.present}</strong>
            </div>
          </div>

          <div className="admin-attendance-stat-card">
            <div className="admin-attendance-stat-icon danger">A</div>
            <div>
              <span>Absent</span>
              <strong>{summary.absent}</strong>
            </div>
          </div>

          <div className="admin-attendance-stat-card">
            <div className="admin-attendance-stat-icon warning">L</div>
            <div>
              <span>Late</span>
              <strong>{summary.late}</strong>
            </div>
          </div>

          <div className="admin-attendance-stat-card">
            <div className="admin-attendance-stat-icon info">LV</div>
            <div>
              <span>On Leave</span>
              <strong>{summary.leave}</strong>
            </div>
          </div>
        </div>

        <div className="admin-attendance-card">
          <div className="admin-attendance-filters">
            <div className="admin-attendance-search">
              <SearchBox
                value={search}
                onChange={setSearch}
                placeholder="Search employee or date..."
              />
            </div>

            <div className="admin-attendance-filter">
              <Select
                value={status}
                onChange={(event) =>
                  setStatus(event?.target?.value ?? event)
                }
                options={STATUS_OPTIONS}
                placeholder="All Statuses"
              />
            </div>

            <div className="admin-attendance-filter admin-attendance-date">
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                aria-label="Filter by date"
              />
            </div>

            {(search || status || date) && (
              <Button
                variant="ghost"
                onClick={handleClearFilters}
                className="admin-attendance-clear"
              >
                Clear Filters
              </Button>
            )}
          </div>

          {loading ? (
            <div className="admin-attendance-loader">
              <Loader />
            </div>
          ) : (
            <>
              <div className="admin-attendance-table-wrapper">
                <table className="admin-attendance-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Date</th>
                      <th>Check In</th>
                      <th>Check Out</th>
                      <th>Working Hours</th>
                      <th>Status</th>
                      <th>Notes</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedRecords.length === 0 ? (
                      <tr>
                        <td
                          colSpan="7"
                          className="admin-attendance-empty-cell"
                        >
                          <div className="admin-attendance-empty">
                            <div className="admin-attendance-empty-icon">
                              A
                            </div>

                            <h3>No attendance records found</h3>

                            <p>
                              Try changing your filters or check another date.
                            </p>

                            {(search || status || date) && (
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
                      paginatedRecords.map((record, index) => {
                        const employeeName = getEmployeeName(
                          record,
                          employees
                        );

                        const recordDate =
                          record.date ||
                          record.attendanceDate ||
                          record.createdAt;

                        const checkIn =
                          record.checkIn ||
                          record.checkInTime ||
                          record.inTime;

                        const checkOut =
                          record.checkOut ||
                          record.checkOutTime ||
                          record.outTime;

                        const workingHours =
                          record.workingHours ??
                          record.totalHours ??
                          record.hours;

                        const recordKey =
                          record._id ||
                          record.id ||
                          `${getEmployeeId(record)}-${recordDate}-${index}`;

                        return (
                          <tr key={recordKey}>
                            <td>
                              <div className="admin-attendance-employee">
                                <div className="admin-attendance-avatar">
                                  {getInitials(employeeName)}
                                </div>

                                <div>
                                  <strong>{employeeName}</strong>

                                  <span>
                                    {getEmployeeId(record) !== "—"
                                      ? `ID: ${getEmployeeId(record)}`
                                      : "Employee"}
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td>
                              <span className="admin-attendance-date-value">
                                {formatDate(recordDate)}
                              </span>
                            </td>

                            <td>{formatTime(checkIn)}</td>

                            <td>{formatTime(checkOut)}</td>

                            <td>
                              {workingHours !== undefined &&
                              workingHours !== null &&
                              workingHours !== ""
                                ? `${workingHours} hrs`
                                : "—"}
                            </td>

                            <td>
                              <Badge
                                variant={getStatusVariant(record.status)}
                              >
                                {normalizeStatus(record.status)}
                              </Badge>
                            </td>

                            <td>
                              <span className="admin-attendance-notes">
                                {record.notes ||
                                  record.remark ||
                                  record.remarks ||
                                  "—"}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {filteredRecords.length > PAGE_SIZE && (
                <div className="admin-attendance-pagination">
                  <span>
                    Showing{" "}
                    {Math.min(
                      (currentPage - 1) * PAGE_SIZE + 1,
                      filteredRecords.length
                    )}{" "}
                    to{" "}
                    {Math.min(
                      currentPage * PAGE_SIZE,
                      filteredRecords.length
                    )}{" "}
                    of {filteredRecords.length} records
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

export default AdminAttendancePage;