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

const ITEMS_PER_PAGE = 10;

const STATUS_OPTIONS = [
  { value: "ALL", label: "All Status" },
  { value: "Present", label: "Present" },
  { value: "Absent", label: "Absent" },
  { value: "Half Day", label: "Half Day" },
  { value: "Late", label: "Late" },
];

const normalizeResponse = (response) => {
  if (Array.isArray(response)) return response;

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.attendance)) {
    return response.data.attendance;
  }

  if (Array.isArray(response?.data?.records)) {
    return response.data.records;
  }

  if (Array.isArray(response?.attendance)) {
    return response.attendance;
  }

  if (Array.isArray(response?.records)) {
    return response.records;
  }

  return [];
};

const HrAttendancePage = () => {
  const { user, logout, loading: authLoading } = useAuth();

  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("");

  const [page, setPage] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const loadAttendance = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const params = {};

      if (dateFilter) {
        params.date = dateFilter;
      }

      const response =
        await attendanceService.getAttendance(params);

      setAttendance(normalizeResponse(response));
    } catch (err) {
      console.error(
        "HR attendance loading error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load attendance records."
      );

      setAttendance([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, [dateFilter]);

  const getEmployee = (record) => {
    return (
      record?.employee ||
      record?.user ||
      record?.employeeDetails ||
      {}
    );
  };

  const getEmployeeName = (record) => {
    const employee = getEmployee(record);

    if (typeof employee === "string") {
      return employee;
    }

    if (employee?.name) {
      return employee.name;
    }

    const firstName =
      employee?.firstName ||
      record?.employeeName?.split(" ")?.[0] ||
      "";

    const lastName =
      employee?.lastName ||
      record?.employeeName
        ?.split(" ")
        ?.slice(1)
        .join(" ") ||
      "";

    return (
      `${firstName} ${lastName}`.trim() ||
      record?.employeeName ||
      "Unknown Employee"
    );
  };

  const getEmployeeId = (record) => {
    const employee = getEmployee(record);

    if (typeof employee === "string") {
      return record?.employeeId || "—";
    }

    return (
      employee?.employeeId ||
      employee?.empId ||
      employee?.code ||
      record?.employeeId ||
      "—"
    );
  };

  const getEmail = (record) => {
    const employee = getEmployee(record);

    if (typeof employee === "string") {
      return record?.email || "—";
    }

    return employee?.email || record?.email || "—";
  };

  const getStatus = (record) => {
    return (
      record?.status ||
      record?.attendanceStatus ||
      "Present"
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

  const getWorkingHours = (record) => {
    if (record?.workingHours !== undefined) {
      return record.workingHours;
    }

    if (record?.totalHours !== undefined) {
      return record.totalHours;
    }

    const checkIn = getCheckIn(record);
    const checkOut = getCheckOut(record);

    if (!checkIn || !checkOut) {
      return "—";
    }

    const start = new Date(checkIn);
    const end = new Date(checkOut);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime()) ||
      end <= start
    ) {
      return "—";
    }

    const minutes = Math.round(
      (end.getTime() - start.getTime()) / 60000
    );

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    return `${hours}h ${remainingMinutes}m`;
  };

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
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

    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }

    return String(value);
  };

  const normalizeStatus = (status) => {
    return String(status)
      .replace(/_/g, " ")
      .trim()
      .toLowerCase();
  };

  const formatStatus = (status) => {
    return String(status)
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  const getStatusVariant = (status) => {
    const normalized = normalizeStatus(status);

    if (normalized === "present") {
      return "success";
    }

    if (normalized === "absent") {
      return "danger";
    }

    if (
      normalized === "late" ||
      normalized === "half day"
    ) {
      return "warning";
    }

    return "secondary";
  };

  const normalizedAttendance = useMemo(() => {
    return attendance.map((record) => ({
      ...record,
      displayName: getEmployeeName(record),
      displayEmployeeId: getEmployeeId(record),
      displayEmail: getEmail(record),
      displayStatus: getStatus(record),
      displayDate: getDate(record),
      displayCheckIn: getCheckIn(record),
      displayCheckOut: getCheckOut(record),
      displayWorkingHours: getWorkingHours(record),
    }));
  }, [attendance]);

  const filteredAttendance = useMemo(() => {
    const searchValue = search
      .trim()
      .toLowerCase();

    return normalizedAttendance.filter((record) => {
      const employeeId = String(
        record.displayEmployeeId || ""
      ).toLowerCase();

      const email = String(
        record.displayEmail || ""
      ).toLowerCase();

      const name = String(
        record.displayName || ""
      ).toLowerCase();

      const matchesSearch =
        !searchValue ||
        name.includes(searchValue) ||
        employeeId.includes(searchValue) ||
        email.includes(searchValue);

      const matchesStatus =
        statusFilter === "ALL" ||
        normalizeStatus(record.displayStatus) ===
          normalizeStatus(statusFilter);

      return matchesSearch && matchesStatus;
    });
  }, [
    normalizedAttendance,
    search,
    statusFilter,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredAttendance.length / ITEMS_PER_PAGE
    )
  );

  const currentPage = Math.min(
    page,
    totalPages
  );

  const paginatedAttendance = useMemo(() => {
    const start =
      (currentPage - 1) * ITEMS_PER_PAGE;

    return filteredAttendance.slice(
      start,
      start + ITEMS_PER_PAGE
    );
  }, [filteredAttendance, currentPage]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const stats = useMemo(() => {
    const total = normalizedAttendance.length;

    const present = normalizedAttendance.filter(
      (record) =>
        normalizeStatus(record.displayStatus) ===
        "present"
    ).length;

    const absent = normalizedAttendance.filter(
      (record) =>
        normalizeStatus(record.displayStatus) ===
        "absent"
    ).length;

    const late = normalizedAttendance.filter(
      (record) =>
        ["late", "half day"].includes(
          normalizeStatus(record.displayStatus)
        )
    ).length;

    return {
      total,
      present,
      absent,
      late,
    };
  }, [normalizedAttendance]);

  const getInitials = (name) => {
    const words = String(name)
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (!words.length) return "E";

    return words
      .slice(0, 2)
      .map((word) =>
        word.charAt(0).toUpperCase()
      )
      .join("");
  };

  const openDetails = (record) => {
    setSelectedRecord(record);
    setShowDetails(true);
  };

  const closeDetails = () => {
    setSelectedRecord(null);
    setShowDetails(false);
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setDateFilter("");
    setPage(1);
  };

  if (authLoading || loading) {
    return (
      <MainLayout
        user={user}
        onLogout={handleLogout}
        onSearch={handleSearch}
        notificationCount={0}
      >
        <div className="hr-attendance-loading">
          <Loader />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      user={user}
      onLogout={handleLogout}
      onSearch={handleSearch}
      notificationCount={0}
    >
      <div className="hr-attendance-page">
        <div className="hr-attendance-header">
          <div>
            <div className="hr-attendance-breadcrumb">
              HR <span>/</span> Attendance
            </div>

            <h1>Attendance</h1>

            <p>
              Monitor employee attendance,
              check-in and check-out records.
            </p>
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={() => loadAttendance(true)}
            disabled={refreshing}
          >
            {refreshing
              ? "Refreshing..."
              : "↻ Refresh"}
          </Button>
        </div>

        <div className="hr-attendance-stats">
          <div className="hr-attendance-stat-card">
            <div className="hr-attendance-stat-icon">
              📋
            </div>

            <div>
              <span>Total Records</span>
              <strong>{stats.total}</strong>
            </div>
          </div>

          <div className="hr-attendance-stat-card">
            <div className="hr-attendance-stat-icon">
              ✓
            </div>

            <div>
              <span>Present</span>
              <strong>{stats.present}</strong>
            </div>
          </div>

          <div className="hr-attendance-stat-card">
            <div className="hr-attendance-stat-icon">
              ✕
            </div>

            <div>
              <span>Absent</span>
              <strong>{stats.absent}</strong>
            </div>
          </div>

          <div className="hr-attendance-stat-card">
            <div className="hr-attendance-stat-icon">
              ◷
            </div>

            <div>
              <span>Late / Half Day</span>
              <strong>{stats.late}</strong>
            </div>
          </div>
        </div>

        <div className="hr-attendance-toolbar">
          <div className="hr-attendance-search">
            <SearchBox
              value={search}
              onChange={handleSearch}
              placeholder="Search employee, ID or email..."
            />
          </div>

          <div className="hr-attendance-filters">
            <select
              className="hr-attendance-filter-select"
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setPage(1);
              }}
            >
              {STATUS_OPTIONS.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>

            <input
              type="date"
              className="hr-attendance-date-input"
              value={dateFilter}
              onChange={(event) => {
                setDateFilter(event.target.value);
                setPage(1);
              }}
            />

            {(search ||
              statusFilter !== "ALL" ||
              dateFilter) && (
              <button
                type="button"
                className="hr-attendance-clear-btn"
                onClick={clearFilters}
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="hr-attendance-error">
            <span>{error}</span>

            <button
              type="button"
              onClick={() => loadAttendance()}
            >
              Try Again
            </button>
          </div>
        )}

        <div className="hr-attendance-card">
          <div className="hr-attendance-card-header">
            <div>
              <h2>Attendance Records</h2>

              <p>
                {filteredAttendance.length} record
                {filteredAttendance.length !== 1
                  ? "s"
                  : ""}{" "}
                found
              </p>
            </div>

            {dateFilter && (
              <div className="hr-attendance-selected-date">
                {formatDate(dateFilter)}
              </div>
            )}
          </div>

          {paginatedAttendance.length === 0 ? (
            <div className="hr-attendance-empty">
              <div className="hr-attendance-empty-icon">
                📅
              </div>

              <h3>
                No attendance records found
              </h3>

              <p>
                Try changing the search, date or
                status filter.
              </p>

              {(search ||
                statusFilter !== "ALL" ||
                dateFilter) && (
                <button
                  type="button"
                  className="hr-attendance-empty-clear"
                  onClick={clearFilters}
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="hr-attendance-table-wrapper">
                <table className="hr-attendance-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Date</th>
                      <th>Check In</th>
                      <th>Check Out</th>
                      <th>Working Hours</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedAttendance.map(
                      (record, index) => {
                        const recordKey =
                          record._id ||
                          record.id ||
                          `${record.displayEmployeeId}-${record.displayDate}-${index}`;

                        const profileImage =
                          record.employee
                            ?.profileImage ||
                          record.employee?.avatar ||
                          record.user?.profileImage;

                        return (
                          <tr key={recordKey}>
                            <td>
                              <div className="hr-attendance-employee">
                                <div className="hr-attendance-avatar">
                                  {profileImage ? (
                                    <img
                                      src={profileImage}
                                      alt={
                                        record.displayName
                                      }
                                    />
                                  ) : (
                                    getInitials(
                                      record.displayName
                                    )
                                  )}
                                </div>

                                <div>
                                  <strong>
                                    {
                                      record.displayName
                                    }
                                  </strong>

                                  <span>
                                    {
                                      record.displayEmployeeId
                                    }
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td>
                              {formatDate(
                                record.displayDate
                              )}
                            </td>

                            <td>
                              <span className="hr-attendance-time">
                                {formatTime(
                                  record.displayCheckIn
                                )}
                              </span>
                            </td>

                            <td>
                              <span className="hr-attendance-time">
                                {formatTime(
                                  record.displayCheckOut
                                )}
                              </span>
                            </td>

                            <td>
                              <span className="hr-attendance-hours">
                                {
                                  record.displayWorkingHours
                                }
                              </span>
                            </td>

                            <td>
                              <Badge
                                variant={getStatusVariant(
                                  record.displayStatus
                                )}
                              >
                                {formatStatus(
                                  record.displayStatus
                                )}
                              </Badge>
                            </td>

                            <td>
                              <button
                                type="button"
                                className="hr-attendance-view-btn"
                                onClick={() =>
                                  openDetails(record)
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

              {totalPages > 1 && (
                <div className="hr-attendance-pagination">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </>
          )}
        </div>

        {showDetails && selectedRecord && (
          <Modal
            isOpen={showDetails}
            onClose={closeDetails}
            title="Attendance Details"
          >
            <div className="hr-attendance-details">
              <div className="hr-attendance-details-profile">
                <div className="hr-attendance-details-avatar">
                  {getInitials(
                    getEmployeeName(
                      selectedRecord
                    )
                  )}
                </div>

                <div>
                  <h3>
                    {getEmployeeName(
                      selectedRecord
                    )}
                  </h3>

                  <p>
                    {getEmployeeId(
                      selectedRecord
                    )}
                  </p>

                  <Badge
                    variant={getStatusVariant(
                      getStatus(selectedRecord)
                    )}
                  >
                    {formatStatus(
                      getStatus(selectedRecord)
                    )}
                  </Badge>
                </div>
              </div>

              <div className="hr-attendance-details-grid">
                <div>
                  <span>Employee ID</span>
                  <strong>
                    {getEmployeeId(
                      selectedRecord
                    )}
                  </strong>
                </div>

                <div>
                  <span>Email</span>
                  <strong>
                    {getEmail(selectedRecord)}
                  </strong>
                </div>

                <div>
                  <span>Attendance Date</span>
                  <strong>
                    {formatDate(
                      getDate(selectedRecord)
                    )}
                  </strong>
                </div>

                <div>
                  <span>Status</span>
                  <strong>
                    {formatStatus(
                      getStatus(selectedRecord)
                    )}
                  </strong>
                </div>

                <div>
                  <span>Check In</span>
                  <strong>
                    {formatTime(
                      getCheckIn(selectedRecord)
                    )}
                  </strong>
                </div>

                <div>
                  <span>Check Out</span>
                  <strong>
                    {formatTime(
                      getCheckOut(selectedRecord)
                    )}
                  </strong>
                </div>

                <div>
                  <span>Working Hours</span>
                  <strong>
                    {getWorkingHours(
                      selectedRecord
                    )}
                  </strong>
                </div>

                <div>
                  <span>Created At</span>
                  <strong>
                    {formatDate(
                      selectedRecord.createdAt
                    )}
                  </strong>
                </div>
              </div>

              {selectedRecord.notes && (
                <div className="hr-attendance-details-notes">
                  <span>Notes</span>
                  <p>
                    {selectedRecord.notes}
                  </p>
                </div>
              )}

              {selectedRecord.remark && (
                <div className="hr-attendance-details-notes">
                  <span>Remark</span>
                  <p>
                    {selectedRecord.remark}
                  </p>
                </div>
              )}

              <div className="hr-attendance-details-footer">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={closeDetails}
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

export default HrAttendancePage;