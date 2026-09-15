"use client";

import React, { useEffect, useMemo, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import Button from "@/components/common/Button";
import Select from "@/components/common/Select";
import Badge from "@/components/common/Badge";
import Pagination from "@/components/common/Pagination";
import Loader from "@/components/common/Loader";
import { useAuth } from "@/hooks/useAuth";
import attendanceService from "@/services/attendance.service";

const EmployeeAttendancePage = () => {
  const { user, logout, loading: authLoading } = useAuth();

  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const [month, setMonth] = useState(
    new Date().getMonth() + 1
  );
  const [year, setYear] = useState(
    new Date().getFullYear()
  );
  const [page, setPage] = useState(1);

  const limit = 10;

  const loadAttendance = async () => {
    try {
      setLoading(true);
      setError("");

      const employeeId = user?._id || user?.id;

      let response;

      if (
        typeof attendanceService.getEmployeeAttendance ===
        "function"
      ) {
        response =
          await attendanceService.getEmployeeAttendance(
            employeeId,
            {
              month,
              year,
            }
          );
      } else if (
        typeof attendanceService.getAttendanceByEmployee ===
        "function"
      ) {
        response =
          await attendanceService.getAttendanceByEmployee(
            employeeId,
            {
              month,
              year,
            }
          );
      } else {
        response =
          await attendanceService.getAttendance({
            employee: employeeId,
            month,
            year,
          });
      }

      const items =
        response?.data?.attendance ||
        response?.data?.items ||
        response?.attendance ||
        response?.items ||
        response?.data ||
        [];

      setAttendance(
        Array.isArray(items) ? items : []
      );
    } catch (err) {
      console.error(
        "Failed to load attendance:",
        err
      );

      setError(
        err?.message ||
          "Unable to load attendance. Please try again."
      );

      setAttendance([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      loadAttendance();
    }
  }, [authLoading, user, month, year]);

  useEffect(() => {
    setPage(1);
  }, [month, year]);

  const sortedAttendance = useMemo(() => {
    return [...attendance].sort((a, b) => {
      const dateA = new Date(
        a?.date ||
          a?.attendanceDate ||
          a?.createdAt ||
          0
      );

      const dateB = new Date(
        b?.date ||
          b?.attendanceDate ||
          b?.createdAt ||
          0
      );

      return dateB - dateA;
    });
  }, [attendance]);

  const totalPages = Math.max(
    1,
    Math.ceil(sortedAttendance.length / limit)
  );

  const paginatedAttendance = useMemo(() => {
    const start = (page - 1) * limit;

    return sortedAttendance.slice(
      start,
      start + limit
    );
  }, [sortedAttendance, page]);

  const stats = useMemo(() => {
    const total = attendance.length;

    const present = attendance.filter((item) =>
      ["present", "PRESENT"].includes(
        item?.status
      )
    ).length;

    const absent = attendance.filter((item) =>
      ["absent", "ABSENT"].includes(
        item?.status
      )
    ).length;

    const leave = attendance.filter((item) =>
      ["leave", "LEAVE", "on_leave"].includes(
        item?.status
      )
    ).length;

    const halfDay = attendance.filter((item) =>
      ["half_day", "HALF_DAY"].includes(
        item?.status
      )
    ).length;

    return {
      total,
      present,
      absent,
      leave,
      halfDay,
    };
  }, [attendance]);

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleDateString("en-IN", {
      weekday: "short",
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
    });
  };

  const getStatus = (item) =>
    item?.status ||
    item?.attendanceStatus ||
    "—";

  const getStatusVariant = (status) => {
    const value = String(status).toLowerCase();

    if (value === "present") {
      return "success";
    }

    if (value === "absent") {
      return "danger";
    }

    if (
      value === "half_day" ||
      value === "half-day"
    ) {
      return "warning";
    }

    if (
      value === "leave" ||
      value === "on_leave"
    ) {
      return "info";
    }

    return "default";
  };

  const handleCheckIn = async () => {
    try {
      setActionLoading(true);
      setError("");

      if (
        typeof attendanceService.checkIn !==
        "function"
      ) {
        setError(
          "Check-in service is not available."
        );
        return;
      }

      await attendanceService.checkIn();

      await loadAttendance();
    } catch (err) {
      console.error("Check-in failed:", err);

      setError(
        err?.message ||
          "Unable to check in. Please try again."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setActionLoading(true);
      setError("");

      if (
        typeof attendanceService.checkOut !==
        "function"
      ) {
        setError(
          "Check-out service is not available."
        );
        return;
      }

      await attendanceService.checkOut();

      await loadAttendance();
    } catch (err) {
      console.error("Check-out failed:", err);

      setError(
        err?.message ||
          "Unable to check out. Please try again."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const todayRecord = useMemo(() => {
    const today = new Date();

    return attendance.find((item) => {
      const value =
        item?.date ||
        item?.attendanceDate;

      if (!value) return false;

      const date = new Date(value);

      return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() ===
          today.getFullYear()
      );
    });
  }, [attendance]);

  const handleLogout = async () => {
    await logout();
  };

  const monthOptions = [
    {
      value: 1,
      label: "January",
    },
    {
      value: 2,
      label: "February",
    },
    {
      value: 3,
      label: "March",
    },
    {
      value: 4,
      label: "April",
    },
    {
      value: 5,
      label: "May",
    },
    {
      value: 6,
      label: "June",
    },
    {
      value: 7,
      label: "July",
    },
    {
      value: 8,
      label: "August",
    },
    {
      value: 9,
      label: "September",
    },
    {
      value: 10,
      label: "October",
    },
    {
      value: 11,
      label: "November",
    },
    {
      value: 12,
      label: "December",
    },
  ];

  const currentYear = new Date().getFullYear();

  const yearOptions = Array.from(
    { length: 5 },
    (_, index) => {
      const value = currentYear - index;

      return {
        value,
        label: String(value),
      };
    }
  );

  if (authLoading) {
    return (
      <div className="employee-attendance-loading">
        <Loader />
      </div>
    );
  }

  return (
    <MainLayout
      user={user}
      onLogout={handleLogout}
      notificationCount={0}
    >
      <div className="employee-attendance-page">
        <div className="employee-attendance-header">
          <div>
            <span className="employee-attendance-eyebrow">
              Employee Portal
            </span>

            <h1>My Attendance</h1>

            <p>
              Track your attendance and working hours.
            </p>
          </div>

          <div className="employee-attendance-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCheckIn}
              disabled={
                actionLoading ||
                todayRecord?.checkIn ||
                todayRecord?.inTime
              }
            >
              {actionLoading
                ? "Processing..."
                : "Check In"}
            </Button>

            <Button
              type="button"
              onClick={handleCheckOut}
              disabled={
                actionLoading ||
                !todayRecord ||
                todayRecord?.checkOut ||
                todayRecord?.outTime
              }
            >
              {actionLoading
                ? "Processing..."
                : "Check Out"}
            </Button>
          </div>
        </div>

        <div className="employee-attendance-stats">
          <div className="attendance-stat-card">
            <span className="attendance-stat-label">
              Total Days
            </span>
            <strong>{stats.total}</strong>
          </div>

          <div className="attendance-stat-card attendance-stat-success">
            <span className="attendance-stat-label">
              Present
            </span>
            <strong>{stats.present}</strong>
          </div>

          <div className="attendance-stat-card attendance-stat-danger">
            <span className="attendance-stat-label">
              Absent
            </span>
            <strong>{stats.absent}</strong>
          </div>

          <div className="attendance-stat-card attendance-stat-warning">
            <span className="attendance-stat-label">
              Half Day
            </span>
            <strong>{stats.halfDay}</strong>
          </div>

          <div className="attendance-stat-card attendance-stat-info">
            <span className="attendance-stat-label">
              Leave
            </span>
            <strong>{stats.leave}</strong>
          </div>
        </div>

        {error && (
          <div className="employee-attendance-error">
            <span>{error}</span>

            <Button
              type="button"
              variant="secondary"
              onClick={loadAttendance}
            >
              Retry
            </Button>
          </div>
        )}

        <div className="employee-attendance-filters">
          <div className="attendance-filter">
            <label htmlFor="attendance-month">
              Month
            </label>

            <Select
              id="attendance-month"
              value={month}
              onChange={(event) =>
                setMonth(Number(event.target.value))
              }
              options={monthOptions}
            />
          </div>

          <div className="attendance-filter">
            <label htmlFor="attendance-year">
              Year
            </label>

            <Select
              id="attendance-year"
              value={year}
              onChange={(event) =>
                setYear(Number(event.target.value))
              }
              options={yearOptions}
            />
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={loadAttendance}
          >
            Refresh
          </Button>
        </div>

        <div className="employee-attendance-card">
          {loading ? (
            <div className="employee-attendance-loader">
              <Loader />
            </div>
          ) : paginatedAttendance.length === 0 ? (
            <div className="employee-attendance-empty">
              <div className="attendance-empty-icon">
                📅
              </div>

              <h3>No attendance records</h3>

              <p>
                No attendance data is available for the
                selected month.
              </p>
            </div>
          ) : (
            <>
              <div className="employee-attendance-table-wrapper">
                <table className="employee-attendance-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Check In</th>
                      <th>Check Out</th>
                      <th>Working Hours</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedAttendance.map(
                      (item, index) => {
                        const status =
                          getStatus(item);

                        const id =
                          item?._id ||
                          item?.id ||
                          index;

                        return (
                          <tr key={id}>
                            <td>
                              <div className="attendance-date">
                                {formatDate(
                                  item?.date ||
                                    item?.attendanceDate
                                )}
                              </div>
                            </td>

                            <td>
                              <Badge
                                variant={getStatusVariant(
                                  status
                                )}
                              >
                                {String(status).replaceAll(
                                  "_",
                                  " "
                                )}
                              </Badge>
                            </td>

                            <td>
                              {formatTime(
                                item?.checkIn ||
                                  item?.inTime
                              )}
                            </td>

                            <td>
                              {formatTime(
                                item?.checkOut ||
                                  item?.outTime
                              )}
                            </td>

                            <td>
                              {item?.workingHours ||
                                item?.totalHours ||
                                item?.hours ||
                                "—"}
                            </td>

                            <td>
                              <span className="attendance-remarks">
                                {item?.remarks ||
                                  item?.note ||
                                  "—"}
                              </span>
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>

              <div className="employee-attendance-footer">
                <span>
                  Showing{" "}
                  {(page - 1) * limit + 1} -{" "}
                  {Math.min(
                    page * limit,
                    sortedAttendance.length
                  )}{" "}
                  of {sortedAttendance.length} records
                </span>

                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default EmployeeAttendancePage;