"use client";

import "./LeaveTable.css";

const getEmployeeName = (leave) => {
  return (
    leave?.employee?.name ||
    leave?.employee?.fullName ||
    leave?.employeeName ||
    leave?.user?.name ||
    "Unknown Employee"
  );
};

const getInitials = (name) => {
  if (!name) return "UE";

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
};

const getEmployeeId = (leave) => {
  return (
    leave?.employee?.employeeId ||
    leave?.employeeId ||
    leave?.user?.employeeId ||
    "—"
  );
};

const getLeaveType = (leave) => {
  return (
    leave?.leaveType?.name ||
    leave?.leaveType ||
    leave?.type ||
    "Leave"
  );
};

const getStatus = (leave) => {
  return (
    leave?.status ||
    leave?.leaveStatus ||
    "Pending"
  );
};

const getStatusClass = (status) => {
  const value = String(status || "Pending")
    .toLowerCase()
    .replace(/\s+/g, "-");

  if (value === "approved") {
    return "leave-table__status--approved";
  }

  if (value === "rejected") {
    return "leave-table__status--rejected";
  }

  if (value === "cancelled") {
    return "leave-table__status--cancelled";
  }

  return "leave-table__status--pending";
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const getDays = (leave) => {
  if (
    leave?.totalDays !== undefined &&
    leave?.totalDays !== null
  ) {
    return leave.totalDays;
  }

  if (
    leave?.numberOfDays !== undefined &&
    leave?.numberOfDays !== null
  ) {
    return leave.numberOfDays;
  }

  if (
    leave?.days !== undefined &&
    leave?.days !== null
  ) {
    return leave.days;
  }

  const start =
    leave?.startDate ||
    leave?.fromDate ||
    leave?.from;

  const end =
    leave?.endDate ||
    leave?.toDate ||
    leave?.to;

  if (!start || !end) return "—";

  const startDate = new Date(start);
  const endDate = new Date(end);

  if (
    Number.isNaN(startDate.getTime()) ||
    Number.isNaN(endDate.getTime()) ||
    endDate < startDate
  ) {
    return "—";
  }

  return (
    Math.floor(
      (endDate.getTime() - startDate.getTime()) /
        (1000 * 60 * 60 * 24)
    ) + 1
  );
};

export default function LeaveTable({
  leaves = [],
  data,
  records,
  loading = false,
  title = "Leave Requests",
  subtitle = "View and manage employee leave requests.",
  onRowClick,
  onView,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  emptyMessage = "No leave requests found.",
}) {
  const leaveRecords = data || records || leaves;

  if (loading) {
    return (
      <div className="leave-table">
        <div className="leave-table__header">
          <div>
            <h2 className="leave-table__title">
              {title}
            </h2>

            <p className="leave-table__subtitle">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="leave-table__loading">
          <span className="leave-table__spinner" />
          <span>Loading leave requests...</span>
        </div>
      </div>
    );
  }

  const hasActions =
    onView ||
    onEdit ||
    onDelete ||
    onApprove ||
    onReject;

  return (
    <div className="leave-table">
      <div className="leave-table__header">
        <div>
          <h2 className="leave-table__title">
            {title}
          </h2>

          <p className="leave-table__subtitle">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="leave-table__wrapper">
        <table>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Leave Type</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Days</th>
              <th>Status</th>
              <th>Reason</th>

              {hasActions && <th>Actions</th>}
            </tr>
          </thead>

          <tbody>
            {!Array.isArray(leaveRecords) ||
            leaveRecords.length === 0 ? (
              <tr>
                <td
                  colSpan={hasActions ? 8 : 7}
                >
                  <div className="leave-table__empty">
                    {emptyMessage}
                  </div>
                </td>
              </tr>
            ) : (
              leaveRecords.map((leave, index) => {
                const employeeName =
                  getEmployeeName(leave);

                const employeeId =
                  getEmployeeId(leave);

                const status =
                  getStatus(leave);

                const normalizedStatus =
                  String(status)
                    .toLowerCase()
                    .replace(/\s+/g, "-");

                const startDate =
                  leave?.startDate ||
                  leave?.fromDate ||
                  leave?.from;

                const endDate =
                  leave?.endDate ||
                  leave?.toDate ||
                  leave?.to;

                const reason =
                  leave?.reason ||
                  leave?.description ||
                  leave?.remarks ||
                  "—";

                const profileImage =
                  leave?.employee?.profileImage ||
                  leave?.employee?.avatar ||
                  leave?.profileImage ||
                  leave?.avatar ||
                  leave?.user?.profileImage;

                const key =
                  leave?._id ||
                  leave?.id ||
                  `${employeeId}-${startDate}-${index}`;

                return (
                  <tr
                    key={key}
                    onClick={() =>
                      onRowClick?.(leave)
                    }
                    style={
                      onRowClick
                        ? { cursor: "pointer" }
                        : undefined
                    }
                  >
                    <td>
                      <div className="leave-table__employee">
                        <div className="leave-table__avatar">
                          {profileImage ? (
                            <img
                              src={profileImage}
                              alt={employeeName}
                            />
                          ) : (
                            getInitials(
                              employeeName
                            )
                          )}
                        </div>

                        <div className="leave-table__employee-info">
                          <div className="leave-table__employee-name">
                            {employeeName}
                          </div>

                          <div className="leave-table__employee-id">
                            ID: {employeeId}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="leave-table__type">
                        {getLeaveType(leave)}
                      </span>
                    </td>

                    <td>
                      <span className="leave-table__date">
                        {formatDate(startDate)}
                      </span>
                    </td>

                    <td>
                      <span className="leave-table__date">
                        {formatDate(endDate)}
                      </span>
                    </td>

                    <td>
                      <span className="leave-table__days">
                        {getDays(leave)}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`leave-table__status ${getStatusClass(
                          status
                        )}`}
                      >
                        {status}
                      </span>
                    </td>

                    <td>
                      <div
                        className="leave-table__reason"
                        title={reason}
                      >
                        {reason}
                      </div>
                    </td>

                    {hasActions && (
                      <td>
                        <div
                          className="leave-table__actions"
                          onClick={(event) =>
                            event.stopPropagation()
                          }
                        >
                          {onView && (
                            <button
                              type="button"
                              className="leave-table__action"
                              onClick={() =>
                                onView(leave)
                              }
                              title="View leave"
                              aria-label="View leave"
                            >
                              👁
                            </button>
                          )}

                          {onEdit && (
                            <button
                              type="button"
                              className="leave-table__action"
                              onClick={() =>
                                onEdit(leave)
                              }
                              title="Edit leave"
                              aria-label="Edit leave"
                            >
                              ✎
                            </button>
                          )}

                          {onApprove &&
                            normalizedStatus ===
                              "pending" && (
                              <button
                                type="button"
                                className="leave-table__action"
                                onClick={() =>
                                  onApprove(leave)
                                }
                                title="Approve leave"
                                aria-label="Approve leave"
                              >
                                ✓
                              </button>
                            )}

                          {onReject &&
                            normalizedStatus ===
                              "pending" && (
                              <button
                                type="button"
                                className="leave-table__action leave-table__action--danger"
                                onClick={() =>
                                  onReject(leave)
                                }
                                title="Reject leave"
                                aria-label="Reject leave"
                              >
                                ×
                              </button>
                            )}

                          {onDelete && (
                            <button
                              type="button"
                              className="leave-table__action leave-table__action--danger"
                              onClick={() =>
                                onDelete(leave)
                              }
                              title="Delete leave"
                              aria-label="Delete leave"
                            >
                              🗑
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