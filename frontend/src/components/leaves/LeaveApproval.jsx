"use client";

import { useMemo, useState } from "react";
import "./LeaveApproval.css";

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

const formatDate = (value) => {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
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

const normalizeStatus = (status) => {
  return String(status || "Pending")
    .toLowerCase()
    .replace(/\s+/g, "-");
};

const getReason = (leave) => {
  return (
    leave?.reason ||
    leave?.description ||
    leave?.remarks ||
    "No reason provided."
  );
};

export default function LeaveApproval({
  leave,
  data,
  leaves = [],
  onApprove,
  onReject,
  loading = false,
  approving = false,
  rejecting = false,
  title = "Leave Approval",
  description =
    "Review and manage employee leave requests.",
}) {
  const singleLeave = leave || data;

  const [selectedLeave, setSelectedLeave] =
    useState(null);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const pendingLeaves = useMemo(() => {
    if (singleLeave) {
      return [singleLeave];
    }

    if (!Array.isArray(leaves)) {
      return [];
    }

    return leaves.filter((item) => {
      const status = normalizeStatus(
        getStatus(item)
      );

      return status === "pending";
    });
  }, [singleLeave, leaves]);

  const handleApprove = async (item) => {
    if (!item || !onApprove) return;

    try {
      setError("");
      setSuccess("");

      await onApprove(item);

      setSuccess(
        "Leave request approved successfully."
      );
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to approve the leave request."
      );
    }
  };

  const handleReject = async (item) => {
    if (!item || !onReject) return;

    try {
      setError("");
      setSuccess("");

      await onReject(item);

      setSuccess(
        "Leave request rejected successfully."
      );
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to reject the leave request."
      );
    }
  };

  if (loading) {
    return (
      <div className="leave-approval">
        <div className="leave-approval__card">
          <div className="leave-approval__body">
            <div className="leave-approval__empty">
              Loading leave requests...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!pendingLeaves.length) {
    return (
      <div className="leave-approval">
        <div className="leave-approval__card">
          <div className="leave-approval__header">
            <div>
              <h2 className="leave-approval__title">
                {title}
              </h2>

              <p className="leave-approval__description">
                {description}
              </p>
            </div>
          </div>

          <div className="leave-approval__body">
            <div className="leave-approval__empty">
              No pending leave requests found.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="leave-approval">
      {pendingLeaves.map((item) => {
        const employeeName =
          getEmployeeName(item);

        const employeeId =
          getEmployeeId(item);

        const leaveType =
          getLeaveType(item);

        const status = getStatus(item);

        const normalizedStatus =
          normalizeStatus(status);

        const profileImage =
          item?.employee?.profileImage ||
          item?.employee?.avatar ||
          item?.profileImage ||
          item?.avatar ||
          item?.user?.profileImage;

        const startDate =
          item?.startDate ||
          item?.fromDate ||
          item?.from;

        const endDate =
          item?.endDate ||
          item?.toDate ||
          item?.to;

        const totalDays =
          item?.totalDays ??
          item?.numberOfDays ??
          item?.days ??
          "—";

        const createdAt =
          item?.createdAt ||
          item?.appliedAt ||
          item?.requestDate;

        const itemId =
          item?._id ||
          item?.id ||
          employeeId;

        return (
          <div
            className="leave-approval__card"
            key={itemId}
          >
            <div className="leave-approval__header">
              <div>
                <h2 className="leave-approval__title">
                  {title}
                </h2>

                <p className="leave-approval__description">
                  {description}
                </p>
              </div>

              <span
                className={`leave-approval__status leave-approval__status--${normalizedStatus}`}
              >
                {status}
              </span>
            </div>

            <div className="leave-approval__body">
              <div className="leave-approval__employee">
                <div className="leave-approval__avatar">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt={employeeName}
                    />
                  ) : (
                    getInitials(employeeName)
                  )}
                </div>

                <div className="leave-approval__employee-info">
                  <div className="leave-approval__employee-name">
                    {employeeName}
                  </div>

                  <div className="leave-approval__employee-meta">
                    Employee ID: {employeeId}
                  </div>
                </div>
              </div>

              {error && (
                <div className="leave-approval__error">
                  {error}
                </div>
              )}

              {success && (
                <div className="leave-approval__success">
                  {success}
                </div>
              )}

              <div className="leave-approval__details">
                <div className="leave-approval__detail">
                  <div className="leave-approval__label">
                    Leave Type
                  </div>

                  <div className="leave-approval__value">
                    {leaveType}
                  </div>
                </div>

                <div className="leave-approval__detail">
                  <div className="leave-approval__label">
                    Total Days
                  </div>

                  <div className="leave-approval__value">
                    {totalDays}
                  </div>
                </div>

                <div className="leave-approval__detail">
                  <div className="leave-approval__label">
                    Start Date
                  </div>

                  <div className="leave-approval__value">
                    {formatDate(startDate)}
                  </div>
                </div>

                <div className="leave-approval__detail">
                  <div className="leave-approval__label">
                    End Date
                  </div>

                  <div className="leave-approval__value">
                    {formatDate(endDate)}
                  </div>
                </div>

                <div className="leave-approval__detail">
                  <div className="leave-approval__label">
                    Applied On
                  </div>

                  <div className="leave-approval__value">
                    {formatDate(createdAt)}
                  </div>
                </div>

                <div className="leave-approval__detail">
                  <div className="leave-approval__label">
                    Request Status
                  </div>

                  <div className="leave-approval__value">
                    {status}
                  </div>
                </div>
              </div>

              <div className="leave-approval__reason">
                <h3 className="leave-approval__reason-title">
                  Reason
                </h3>

                <p className="leave-approval__reason-text">
                  {getReason(item)}
                </p>
              </div>

              {normalizedStatus === "pending" && (
                <div className="leave-approval__actions">
                  <button
                    type="button"
                    className="leave-approval__button leave-approval__button--reject"
                    disabled={
                      rejecting || approving
                    }
                    onClick={() => {
                      setSelectedLeave(item);
                      handleReject(item);
                    }}
                  >
                    {rejecting &&
                    selectedLeave === item
                      ? "Rejecting..."
                      : "Reject Leave"}
                  </button>

                  <button
                    type="button"
                    className="leave-approval__button leave-approval__button--approve"
                    disabled={
                      approving || rejecting
                    }
                    onClick={() => {
                      setSelectedLeave(item);
                      handleApprove(item);
                    }}
                  >
                    {approving &&
                    selectedLeave === item
                      ? "Approving..."
                      : "Approve Leave"}
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}