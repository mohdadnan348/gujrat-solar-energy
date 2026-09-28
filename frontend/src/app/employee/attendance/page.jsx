"use client";

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import Button from "@/components/common/Button";
import Select from "@/components/common/Select";
import Badge from "@/components/common/Badge";
import Pagination from "@/components/common/Pagination";
import Loader from "@/components/common/Loader";

import { useAuth } from "@/hooks/useAuth";
import attendanceService from "@/services/attendance.service";

import "./attendance.css";

const EmployeeAttendancePage = () => {
  const {
    user,
    loading: authLoading,
  } = useAuth();

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

  /*
  |--------------------------------------------------------------------------
  | Date Helpers
  |--------------------------------------------------------------------------
  */

  const getMonthDateRange = () => {
    const paddedMonth = String(month).padStart(
      2,
      "0"
    );

    const firstDay = `${year}-${paddedMonth}-01`;

    const lastDayNumber = new Date(
      year,
      month,
      0
    ).getDate();

    const lastDay = `${year}-${paddedMonth}-${String(
      lastDayNumber
    ).padStart(2, "0")}`;

    return {
      dateFrom: firstDay,
      dateTo: lastDay,
    };
  };

  /*
  |--------------------------------------------------------------------------
  | Error Message
  |--------------------------------------------------------------------------
  */

  const getErrorMessage = (err) => {
    return (
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      "Unable to load attendance. Please try again."
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Load My Attendance
  |--------------------------------------------------------------------------
  */

  const loadAttendance = async () => {
    try {
      setLoading(true);
      setError("");

      if (
        typeof attendanceService.getMyAttendance !==
        "function"
      ) {
        throw new Error(
          "My attendance service is not available."
        );
      }

      const {
        dateFrom,
        dateTo,
      } = getMonthDateRange();

      /*
       * IMPORTANT:
       * Employee must use /attendance/my.
       *
       * Do NOT send employeeId here.
       */
      const response =
        await attendanceService.getMyAttendance({
          dateFrom,
          dateTo,
          page: 1,
          limit: 100,
        });

      /*
       * Backend response:
       *
       * {
       *   success: true,
       *   data: [...],
       *   pagination: {...}
       * }
       */

      const items =
        Array.isArray(response?.data)
          ? response.data
          : Array.isArray(
              response?.data?.attendances
            )
          ? response.data.attendances
          : Array.isArray(
              response?.attendances
            )
          ? response.attendances
          : [];

      setAttendance(items);
    } catch (err) {
      console.error(
        "Failed to load attendance:",
        err
      );

      setError(getErrorMessage(err));
      setAttendance([]);
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Initial / Filter Load
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!authLoading && user) {
      loadAttendance();
    }
  }, [
    authLoading,
    user,
    month,
    year,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Reset Pagination
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    setPage(1);
  }, [month, year]);

  /*
  |--------------------------------------------------------------------------
  | Sorted Attendance
  |--------------------------------------------------------------------------
  */

  const sortedAttendance = useMemo(() => {
    return [...attendance].sort(
      (a, b) => {
        const dateA = new Date(
          a?.attendanceDate ||
            a?.date ||
            a?.createdAt ||
            0
        );

        const dateB = new Date(
          b?.attendanceDate ||
            b?.date ||
            b?.createdAt ||
            0
        );

        return dateB - dateA;
      }
    );
  }, [attendance]);

  /*
  |--------------------------------------------------------------------------
  | Pagination
  |--------------------------------------------------------------------------
  */

  const totalPages = Math.max(
    1,
    Math.ceil(
      sortedAttendance.length / limit
    )
  );

  const paginatedAttendance = useMemo(() => {
    const start =
      (page - 1) * limit;

    return sortedAttendance.slice(
      start,
      start + limit
    );
  }, [
    sortedAttendance,
    page,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Attendance Stats
  |--------------------------------------------------------------------------
  */

  const stats = useMemo(() => {
    const total = attendance.length;

    const present = attendance.filter(
      (item) =>
        String(item?.status || "").toLowerCase() ===
        "present"
    ).length;

    const absent = attendance.filter(
      (item) =>
        String(item?.status || "").toLowerCase() ===
        "absent"
    ).length;

    const leave = attendance.filter(
      (item) => {
        const status = String(
          item?.status || ""
        ).toLowerCase();

        return (
          status === "leave" ||
          status === "on_leave"
        );
      }
    ).length;

    const halfDay = attendance.filter(
      (item) => {
        const status = String(
          item?.status || ""
        ).toLowerCase();

        return (
          status === "half_day" ||
          status === "half-day"
        );
      }
    ).length;

    const totalHours = attendance.reduce(
      (sum, item) =>
        sum +
        Number(
          item?.totalHours ||
            item?.workingHours ||
            item?.hours ||
            0
        ),
      0
    );

    return {
      total,
      present,
      absent,
      leave,
      halfDay,
      totalHours:
        Number(totalHours.toFixed(2)),
    };
  }, [attendance]);

  /*
  |--------------------------------------------------------------------------
  | Formatters
  |--------------------------------------------------------------------------
  */

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const formatTime = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const getStatus = (item) =>
    item?.status ||
    item?.attendanceStatus ||
    "Unknown";

  const getStatusVariant = (status) => {
    const value = String(
      status || ""
    ).toLowerCase();

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

  const formatStatus = (status) => {
    if (!status) return "Unknown";

    return String(status)
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  /*
  |--------------------------------------------------------------------------
  | Today's Record
  |--------------------------------------------------------------------------
  */

  const todayRecord = useMemo(() => {
    const today = new Date();

    return attendance.find((item) => {
      const value =
        item?.attendanceDate ||
        item?.date;

      if (!value) return false;

      const date = new Date(value);

      return (
        date.getDate() ===
          today.getDate() &&
        date.getMonth() ===
          today.getMonth() &&
        date.getFullYear() ===
          today.getFullYear()
      );
    });
  }, [attendance]);

  const hasCheckedIn =
    Boolean(
      todayRecord?.checkIn ||
        todayRecord?.inTime
    );

  const hasCheckedOut =
    Boolean(
      todayRecord?.checkOut ||
        todayRecord?.outTime
    );

  /*
  |--------------------------------------------------------------------------
  | Check-In
  |--------------------------------------------------------------------------
  */

  const handleCheckIn = async () => {
    try {
      setActionLoading(true);
      setError("");

      await attendanceService.checkIn({});

      await loadAttendance();
    } catch (err) {
      console.error(
        "Check-in failed:",
        err
      );

      setError(
        getErrorMessage(err)
      );
    } finally {
      setActionLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Check-Out
  |--------------------------------------------------------------------------
  */

  const handleCheckOut = async () => {
    try {
      setActionLoading(true);
      setError("");

      await attendanceService.checkOut({});

      await loadAttendance();
    } catch (err) {
      console.error(
        "Check-out failed:",
        err
      );

      setError(
        getErrorMessage(err)
      );
    } finally {
      setActionLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Month Options
  |--------------------------------------------------------------------------
  */

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

  /*
  |--------------------------------------------------------------------------
  | Year Options
  |--------------------------------------------------------------------------
  */

  const currentYear =
    new Date().getFullYear();

  const yearOptions = Array.from(
    { length: 5 },
    (_, index) => {
      const value =
        currentYear - index;

      return {
        value,
        label: String(value),
      };
    }
  );

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (authLoading) {
    return (
      <div className="employee-attendance-loading">
        <Loader />
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (
    <div className="employee-attendance-page">

      {/* Header */}
      <div className="employee-attendance-header">
        <div>
          <span className="employee-attendance-eyebrow">
            Employee Portal
          </span>

          <h1>My Attendance</h1>

          <p>
            Track your attendance,
            working hours and daily
            check-in / check-out.
          </p>
        </div>

        <div className="employee-attendance-actions">
          <Button
            type="button"
            variant="secondary"
            onClick={handleCheckIn}
            disabled={
              actionLoading ||
              hasCheckedIn
            }
          >
            {actionLoading
              ? "Processing..."
              : hasCheckedIn
              ? "Checked In"
              : "Check In"}
          </Button>

          <Button
            type="button"
            onClick={handleCheckOut}
            disabled={
              actionLoading ||
              !hasCheckedIn ||
              hasCheckedOut
            }
          >
            {actionLoading
              ? "Processing..."
              : hasCheckedOut
              ? "Checked Out"
              : "Check Out"}
          </Button>
        </div>
      </div>

      {/* Today Status */}
      <div className="employee-attendance-today">
        <div className="attendance-today-icon">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle
              cx="12"
              cy="12"
              r="9"
            />
            <path d="M12 7v5l3 2" />
          </svg>
        </div>

        <div className="attendance-today-content">
          <strong>
            Today's Attendance
          </strong>

          <span>
            {hasCheckedOut
              ? "Your attendance for today is complete."
              : hasCheckedIn
              ? "You are currently checked in."
              : "You have not checked in yet."}
          </span>
        </div>

        <div className="attendance-today-time">
          {hasCheckedIn && (
            <span>
              In:{" "}
              {formatTime(
                todayRecord?.checkIn ||
                  todayRecord?.inTime
              )}
            </span>
          )}

          {hasCheckedOut && (
            <span>
              Out:{" "}
              {formatTime(
                todayRecord?.checkOut ||
                  todayRecord?.outTime
              )}
            </span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="employee-attendance-stats">

        <div className="attendance-stat-card">
          <span className="attendance-stat-label">
            Total Days
          </span>
          <strong>
            {stats.total}
          </strong>
        </div>

        <div className="attendance-stat-card attendance-stat-success">
          <span className="attendance-stat-label">
            Present
          </span>
          <strong>
            {stats.present}
          </strong>
        </div>

        <div className="attendance-stat-card attendance-stat-danger">
          <span className="attendance-stat-label">
            Absent
          </span>
          <strong>
            {stats.absent}
          </strong>
        </div>

        <div className="attendance-stat-card attendance-stat-warning">
          <span className="attendance-stat-label">
            Half Day
          </span>
          <strong>
            {stats.halfDay}
          </strong>
        </div>

        <div className="attendance-stat-card attendance-stat-info">
          <span className="attendance-stat-label">
            Total Hours
          </span>
          <strong>
            {stats.totalHours}h
          </strong>
        </div>

      </div>

      {/* Error */}
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

      {/* Filters */}
      <div className="employee-attendance-filters">

        <div className="attendance-filter">
          <label htmlFor="attendance-month">
            Month
          </label>

          <Select
            id="attendance-month"
            value={month}
            onChange={(event) =>
              setMonth(
                Number(
                  event.target.value
                )
              )
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
              setYear(
                Number(
                  event.target.value
                )
              )
            }
            options={yearOptions}
          />
        </div>

        <Button
          type="button"
          variant="secondary"
          onClick={loadAttendance}
          disabled={loading}
        >
          {loading
            ? "Loading..."
            : "Refresh"}
        </Button>
      </div>

      {/* Attendance Table */}
      <div className="employee-attendance-card">

        {loading ? (
          <div className="employee-attendance-loader">
            <Loader />
          </div>
        ) : paginatedAttendance.length ===
          0 ? (
          <div className="employee-attendance-empty">

            <div className="attendance-empty-icon">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect
                  x="3"
                  y="4"
                  width="18"
                  height="17"
                  rx="2"
                />
                <path d="M8 2v4" />
                <path d="M16 2v4" />
                <path d="M3 10h18" />
                <path d="M8 15h.01" />
                <path d="M12 15h.01" />
                <path d="M16 15h.01" />
              </svg>
            </div>

            <h3>
              No attendance records
            </h3>

            <p>
              No attendance data is
              available for the selected
              month.
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
                                item?.attendanceDate ||
                                  item?.date
                              )}
                            </div>
                          </td>

                          <td>
                            <Badge
                              variant={getStatusVariant(
                                status
                              )}
                              size="small"
                            >
                              {formatStatus(
                                status
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
                            {item?.totalHours ??
                              item?.workingHours ??
                              item?.hours ??
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
                {sortedAttendance.length ===
                0
                  ? 0
                  : (page - 1) *
                      limit +
                    1}{" "}
                -{" "}
                {Math.min(
                  page * limit,
                  sortedAttendance.length
                )}{" "}
                of{" "}
                {sortedAttendance.length}{" "}
                records
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
  );
};

export default EmployeeAttendancePage;