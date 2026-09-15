"use client";

import "./AttendanceTable.css";

const STATUS_CONFIG = {
  present: {
    label: "Present",
    className: "attendance-table__status--present",
  },
  absent: {
    label: "Absent",
    className: "attendance-table__status--absent",
  },
  late: {
    label: "Late",
    className: "attendance-table__status--late",
  },
  "half-day": {
    label: "Half Day",
    className: "attendance-table__status--half-day",
  },
  leave: {
    label: "Leave",
    className: "attendance-table__status--leave",
  },
  holiday: {
    label: "Holiday",
    className: "attendance-table__status--holiday",
  },
  pending: {
    label: "Pending",
    className: "attendance-table__status--pending",
  },
};

function getStatus(record) {
  const value =
    record?.status ||
    record?.attendanceStatus ||
    "pending";

  const key = String(value)
    .toLowerCase()
    .replace(/\s+/g, "-");

  return (
    STATUS_CONFIG[key] || {
      label: record?.status || "Pending",
      className: STATUS_CONFIG.pending.className,
    }
  );
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatTime(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getEmployeeName(record) {
  if (record?.employee?.name) {
    return record.employee.name;
  }

  if (record?.employee?.fullName) {
    return record.employee.fullName;
  }

  if (record?.employeeName) {
    return record.employeeName;
  }

  if (record?.user?.name) {
    return record.user.name;
  }

  return "Unknown Employee";
}

function getEmployeeId(record) {
  return (
    record?.employee?.employeeId ||
    record?.employeeId ||
    record?.user?.employeeId ||
    "—"
  );
}

function getInitials(name) {
  if (!name) return "UE";

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function getWorkingHours(record) {
  if (record?.workingHours !== undefined) {
    return `${record.workingHours} hrs`;
  }

  if (record?.totalHours !== undefined) {
    return `${record.totalHours} hrs`;
  }

  if (record?.hoursWorked !== undefined) {
    return `${record.hoursWorked} hrs`;
  }

  return "—";
}

export default function AttendanceTable({
  attendance = [],
  records,
  data,
  loading = false,
  title = "Attendance Records",
  subtitle = "View and manage employee attendance.",
  onRowClick,
  onView,
  onEdit,
  emptyMessage = "No attendance records found.",
}) {
  const attendanceRecords =
    records || data || attendance;

  if (loading) {
    return (
      <div className="attendance-table">
        <div className="attendance-table__header">
          <div>
            <h2 className="attendance-table__title">
              {title}
            </h2>

            <p className="attendance-table__subtitle">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="attendance-table__loading">
          <span className="attendance-table__spinner" />
          <span>Loading attendance records...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="attendance-table">
      <div className="attendance-table__header">
        <div>
          <h2 className="attendance-table__title">
            {title}
          </h2>

          <p className="attendance-table__subtitle">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="attendance-table__wrapper">
        <table>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Date</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Status</th>
              <th>Working Hours</th>
              {(onView || onEdit) && <th>Actions</th>}
            </tr>
          </thead>

          <tbody>
            {!Array.isArray(attendanceRecords) ||
            attendanceRecords.length === 0 ? (
              <tr>
                <td
                  colSpan={
                    onView || onEdit ? 7 : 6
                  }
                >
                  <div className="attendance-table__empty">
                    {emptyMessage}
                  </div>
                </td>
              </tr>
            ) : (
              attendanceRecords.map((record, index) => {
                const employeeName =
                  getEmployeeName(record);

                const employeeId =
                  getEmployeeId(record);

                const status = getStatus(record);

                const date =
                  record?.date ||
                  record?.attendanceDate ||
                  record?.createdAt;

                const checkIn =
                  record?.checkIn ||
                  record?.checkInTime;

                const checkOut =
                  record?.checkOut ||
                  record?.checkOutTime;

                return (
                  <tr
                    key={
                      record?._id ||
                      record?.id ||
                      `${date}-${employeeId}-${index}`
                    }
                    onClick={() =>
                      onRowClick?.(record)
                    }
                    style={
                      onRowClick
                        ? { cursor: "pointer" }
                        : undefined
                    }
                  >
                    <td>
                      <div className="attendance-table__employee">
                        <div className="attendance-table__avatar">
                          {getInitials(employeeName)}
                        </div>

                        <div className="attendance-table__employee-info">
                          <div className="attendance-table__employee-name">
                            {employeeName}
                          </div>

                          <div className="attendance-table__employee-id">
                            ID: {employeeId}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="attendance-table__date">
                        {formatDate(date)}
                      </span>
                    </td>

                    <td>
                      <span className="attendance-table__time">
                        {formatTime(checkIn)}
                      </span>
                    </td>

                    <td>
                      <span className="attendance-table__time">
                        {formatTime(checkOut)}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`attendance-table__status ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </td>

                    <td>
                      <span className="attendance-table__hours">
                        {getWorkingHours(record)}
                      </span>
                    </td>

                    {(onView || onEdit) && (
                      <td>
                        <div
                          className="attendance-table__actions"
                          onClick={(event) =>
                            event.stopPropagation()
                          }
                        >
                          {onView && (
                            <button
                              type="button"
                              className="attendance-table__action"
                              onClick={() =>
                                onView(record)
                              }
                              aria-label="View attendance"
                              title="View attendance"
                            >
                              👁
                            </button>
                          )}

                          {onEdit && (
                            <button
                              type="button"
                              className="attendance-table__action"
                              onClick={() =>
                                onEdit(record)
                              }
                              aria-label="Edit attendance"
                              title="Edit attendance"
                            >
                              ✎
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}