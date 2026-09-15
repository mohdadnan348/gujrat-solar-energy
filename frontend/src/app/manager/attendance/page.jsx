"use client";

import React, { useEffect, useMemo, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import SearchBox from "@/components/common/SearchBox";
import Pagination from "@/components/common/Pagination";
import Loader from "@/components/common/Loader";
import Modal from "@/components/common/Modal";
import { useAuth } from "@/hooks/useAuth";
import attendanceService from "@/services/attendance.service";

const PAGE_SIZE = 10;

const ManagerAttendancePage = () => {
  const { user, logout, loading: authLoading } = useAuth();

  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAttendance, setSelectedAttendance] = useState(null);

  const handleLogout = async () => {
    await logout();
  };

  const loadAttendance = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await attendanceService.getAttendance();

      const data =
        response?.data?.attendance ||
        response?.data?.data ||
        response?.attendance ||
        response?.data ||
        response ||
        [];

      setAttendance(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load attendance:", err);

      setError(
        err?.message ||
          err?.response?.data?.message ||
          "Unable to load attendance records."
      );

      setAttendance([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, dateFilter]);

  const getEmployee = (record) => {
    return record?.employee || record?.user || {};
  };

  const getEmployeeName = (record) => {
    const employee = getEmployee(record);

    if (employee?.name) return employee.name;

    const firstName =
      employee?.firstName ||
      record?.employeeName?.firstName ||
      record?.user?.firstName ||
      "";

    const lastName =
      employee?.lastName ||
      record?.employeeName?.lastName ||
      record?.user?.lastName ||
      "";

    return (
      `${firstName} ${lastName}`.trim() ||
      record?.employeeName ||
      record?.name ||
      "Unknown Employee"
    );
  };

  const getEmployeeEmail = (record) => {
    const employee = getEmployee(record);

    return (
      employee?.email ||
      record?.employeeEmail ||
      record?.email ||
      "—"
    );
  };

  const getEmployeeId = (record) => {
    const employee = getEmployee(record);

    return (
      employee?.employeeId ||
      employee?.employeeCode ||
      record?.employeeId ||
      record?.employeeCode ||
      employee?._id ||
      "—"
    );
  };

  const getStatus = (record) => {
    return (
      record?.status ||
      record?.attendanceStatus ||
      record?.state ||
      "PRESENT"
    );
  };

  const getDate = (record) => {
    return (
      record?.date ||
      record?.attendanceDate ||
      record?.createdAt ||
      null
    );
  };

  const getCheckIn = (record) => {
    return (
      record?.checkIn ||
      record?.checkInTime ||
      record?.inTime ||
      null
    );
  };

  const getCheckOut = (record) => {
    return (
      record?.checkOut ||
      record?.checkOutTime ||
      record?.outTime ||
      null
    );
  };

  const getWorkHours = (record) => {
    return (
      record?.workHours ||
      record?.workingHours ||
      record?.totalHours ||
      null
    );
  };

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatStatus = (status) => {
    if (!status) return "Present";

    return status
      .toString()
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const getStatusVariant = (status) => {
    const normalized = status?.toString().toUpperCase();

    if (normalized === "PRESENT") return "success";
    if (normalized === "ABSENT") return "danger";
    if (normalized === "LATE") return "warning";
    if (normalized === "HALF_DAY") return "warning";
    if (normalized === "LEAVE") return "info";

    return "default";
  };

  const getInitials = (name) => {
    if (!name) return "E";

    const parts = name.trim().split(/\s+/);

    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }

    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  };

  const normalizedAttendance = useMemo(() => {
    return attendance.map((record) => ({
      ...record,
      _employeeName: getEmployeeName(record),
      _employeeEmail: getEmployeeEmail(record),
      _employeeId: getEmployeeId(record),
      _status: getStatus(record),
      _date: getDate(record),
      _checkIn: getCheckIn(record),
      _checkOut: getCheckOut(record),
      _workHours: getWorkHours(record),
    }));
  }, [attendance]);

  const filteredAttendance = useMemo(() => {
    const query = search.trim().toLowerCase();

    return normalizedAttendance.filter((record) => {
      const matchesSearch =
        !query ||
        record._employeeName.toLowerCase().includes(query) ||
        record._employeeEmail.toLowerCase().includes(query) ||
        record._employeeId.toString().toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "ALL" ||
        record._status?.toString().toUpperCase() === statusFilter;

      const recordDate = record._date
        ? new Date(record._date)
        : null;

      const selectedDate = dateFilter
        ? new Date(`${dateFilter}T00:00:00`)
        : null;

      const matchesDate =
        !selectedDate ||
        (recordDate &&
          !Number.isNaN(recordDate.getTime()) &&
          recordDate.getFullYear() === selectedDate.getFullYear() &&
          recordDate.getMonth() === selectedDate.getMonth() &&
          recordDate.getDate() === selectedDate.getDate());

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [normalizedAttendance, search, statusFilter, dateFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAttendance.length / PAGE_SIZE)
  );

  const paginatedAttendance = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;

    return filteredAttendance.slice(
      start,
      start + PAGE_SIZE
    );
  }, [filteredAttendance, currentPage]);

  const statistics = useMemo(() => {
    const total = normalizedAttendance.length;

    const present = normalizedAttendance.filter(
      (record) =>
        record._status?.toString().toUpperCase() === "PRESENT"
    ).length;

    const absent = normalizedAttendance.filter(
      (record) =>
        record._status?.toString().toUpperCase() === "ABSENT"
    ).length;

    const late = normalizedAttendance.filter(
      (record) =>
        record._status?.toString().toUpperCase() === "LATE"
    ).length;

    return {
      total,
      present,
      absent,
      late,
    };
  }, [normalizedAttendance]);

  if (authLoading) {
    return (
      <div className="manager-attendance-loading">
        <Loader />
      </div>
    );
  }

  return (
    <MainLayout
      user={user}
      onLogout={handleLogout}
      onSearch={(value) =>
        console.log("Manager global search:", value)
      }
      notificationCount={0}
    >
      <div className="manager-attendance-page">
        <div className="manager-attendance-header">
          <div>
            <span className="manager-attendance-eyebrow">
              Workforce Management
            </span>

            <h1>Attendance</h1>

            <p>
              Monitor employee attendance, check-in and check-out records.
            </p>
          </div>

          <Button
            variant="secondary"
            onClick={loadAttendance}
            disabled={loading}
          >
            ↻ Refresh
          </Button>
        </div>

        {error && (
          <div className="manager-attendance-error">
            <span>{error}</span>

            <Button
              size="small"
              variant="secondary"
              onClick={loadAttendance}
            >
              Retry
            </Button>
          </div>
        )}

        <div className="manager-attendance-summary">
          <div className="manager-attendance-summary-card">
            <span>Total Records</span>
            <strong>{statistics.total}</strong>
          </div>

          <div className="manager-attendance-summary-card manager-attendance-present">
            <span>Present</span>
            <strong>{statistics.present}</strong>
          </div>

          <div className="manager-attendance-summary-card manager-attendance-absent">
            <span>Absent</span>
            <strong>{statistics.absent}</strong>
          </div>

          <div className="manager-attendance-summary-card manager-attendance-late">
            <span>Late</span>
            <strong>{statistics.late}</strong>
          </div>
        </div>

        <div className="manager-attendance-toolbar">
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Search employee, email or ID..."
          />

          <select
            className="manager-attendance-filter"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
          >
            <option value="ALL">All Status</option>
            <option value="PRESENT">Present</option>
            <option value="ABSENT">Absent</option>
            <option value="LATE">Late</option>
            <option value="HALF_DAY">Half Day</option>
            <option value="LEAVE">Leave</option>
          </select>

          <input
            type="date"
            className="manager-attendance-date"
            value={dateFilter}
            onChange={(event) =>
              setDateFilter(event.target.value)
            }
          />

          {dateFilter && (
            <Button
              size="small"
              variant="secondary"
              onClick={() => setDateFilter("")}
            >
              Clear
            </Button>
          )}
        </div>

        <div className="manager-attendance-card">
          {loading ? (
            <div className="manager-attendance-table-loading">
              <Loader />
            </div>
          ) : (
            <>
              <div className="manager-attendance-table-wrapper">
                <table className="manager-attendance-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Employee ID</th>
                      <th>Date</th>
                      <th>Check In</th>
                      <th>Check Out</th>
                      <th>Work Hours</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedAttendance.length === 0 ? (
                      <tr>
                        <td
                          colSpan="8"
                          className="manager-attendance-empty"
                        >
                          <div>
                            <span className="manager-attendance-empty-icon">
                              🕘
                            </span>

                            <strong>
                              No attendance records found
                            </strong>

                            <p>
                              Try changing your search, date or status
                              filter.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedAttendance.map((record) => (
                        <tr
                          key={
                            record._id ||
                            record.id ||
                            `${record._employeeId}-${record._date}`
                          }
                        >
                          <td>
                            <div className="manager-attendance-employee">
                              <span className="manager-attendance-avatar">
                                {getInitials(
                                  record._employeeName
                                )}
                              </span>

                              <div>
                                <strong>
                                  {record._employeeName}
                                </strong>

                                <small>
                                  {record._employeeEmail}
                                </small>
                              </div>
                            </div>
                          </td>

                          <td>
                            <span className="manager-attendance-id">
                              {record._employeeId}
                            </span>
                          </td>

                          <td>
                            <span className="manager-attendance-date-value">
                              {formatDate(record._date)}
                            </span>
                          </td>

                          <td>
                            <span className="manager-attendance-time">
                              {formatTime(record._checkIn)}
                            </span>
                          </td>

                          <td>
                            <span className="manager-attendance-time">
                              {formatTime(record._checkOut)}
                            </span>
                          </td>

                          <td>
                            <span className="manager-attendance-hours">
                              {record._workHours || "—"}
                            </span>
                          </td>

                          <td>
                            <Badge
                              variant={getStatusVariant(
                                record._status
                              )}
                            >
                              {formatStatus(record._status)}
                            </Badge>
                          </td>

                          <td>
                            <Button
                              size="small"
                              variant="secondary"
                              onClick={() =>
                                setSelectedAttendance(record)
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

              {filteredAttendance.length > 0 && (
                <div className="manager-attendance-pagination">
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

        {selectedAttendance && (
          <Modal
            isOpen={Boolean(selectedAttendance)}
            onClose={() => setSelectedAttendance(null)}
            title="Attendance Details"
          >
            <div className="manager-attendance-modal-content">
              <div className="manager-attendance-modal-profile">
                <span className="manager-attendance-modal-avatar">
                  {getInitials(
                    getEmployeeName(selectedAttendance)
                  )}
                </span>

                <div>
                  <h2>
                    {getEmployeeName(selectedAttendance)}
                  </h2>

                  <p>
                    {getEmployeeEmail(selectedAttendance)}
                  </p>
                </div>
              </div>

              <div className="manager-attendance-details-grid">
                <div>
                  <span>Employee ID</span>
                  <strong>
                    {getEmployeeId(selectedAttendance)}
                  </strong>
                </div>

                <div>
                  <span>Date</span>
                  <strong>
                    {formatDate(getDate(selectedAttendance))}
                  </strong>
                </div>

                <div>
                  <span>Check In</span>
                  <strong>
                    {formatTime(
                      getCheckIn(selectedAttendance)
                    )}
                  </strong>
                </div>

                <div>
                  <span>Check Out</span>
                  <strong>
                    {formatTime(
                      getCheckOut(selectedAttendance)
                    )}
                  </strong>
                </div>

                <div>
                  <span>Work Hours</span>
                  <strong>
                    {getWorkHours(selectedAttendance) || "—"}
                  </strong>
                </div>

                <div>
                  <span>Status</span>
                  <strong>
                    {formatStatus(
                      getStatus(selectedAttendance)
                    )}
                  </strong>
                </div>
              </div>

              {(selectedAttendance.note ||
                selectedAttendance.notes ||
                selectedAttendance.remarks) && (
                <div className="manager-attendance-notes">
                  <span>Notes / Remarks</span>

                  <p>
                    {selectedAttendance.note ||
                      selectedAttendance.notes ||
                      selectedAttendance.remarks}
                  </p>
                </div>
              )}

              <div className="manager-attendance-modal-footer">
                <Button
                  variant="secondary"
                  onClick={() =>
                    setSelectedAttendance(null)
                  }
                >
                  Close
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </MainLayout>
  );
};

export default ManagerAttendancePage;