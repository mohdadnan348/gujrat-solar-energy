
"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import Loader from "@/components/common/Loader";
import leaveService from "@/services/leave.service";

import "./leave-details.css";

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

const formatDateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const displayStatus = (value) =>
  String(value || "—")
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const statusVariant = (status) => {
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

const getInitials = (name = "") =>
  String(name)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "NA";

const getEmployeeName = (employee) => {
  if (!employee) return "Unknown Employee";
  if (typeof employee === "string") return employee;

  const fullName =
    `${employee.firstName || ""} ${employee.lastName || ""}`.trim();

  return (
    employee.name ||
    employee.fullName ||
    fullName ||
    employee.username ||
    "Unknown Employee"
  );
};

const getEmployeeCode = (employee) => {
  if (!employee) return "—";
  if (typeof employee === "string") return employee;

  return employee.employeeId || employee.employeeCode || employee._id || "—";
};

const getLeaveTypeName = (leave) => {
  const type = leave?.leaveType ?? leave?.type;

  if (typeof type === "string") return type || "—";

  if (type && typeof type === "object") {
    return type.name || type.code || "Unknown Leave Type";
  }

  return "—";
};

const extractLeave = (response) => {
  if (response?.data?.data) return response.data.data;
  if (response?.data && !Array.isArray(response.data)) return response.data;
  return response;
};

export default function AdminLeaveDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [leave, setLeave] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [action, setAction] = useState("");
  const [actionReason, setActionReason] = useState("");

  const loadLeave = useCallback(async () => {
    if (!id) {
      setLoading(false);
      setError("Leave request ID is missing.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await leaveService.getLeaveById(id);
      const data = extractLeave(response);

      if (!data || !(data._id || data.id)) {
        throw new Error("Leave request not found.");
      }

      setLeave(data);
    } catch (err) {
      console.error("Failed to load leave request:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load leave request."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadLeave();
  }, [loadLeave]);

  const status = String(leave?.status || "").toUpperCase();
  const employee = leave?.employee;
  const employeeName = getEmployeeName(employee);
  const employeeCode = getEmployeeCode(employee);
  const leaveTypeName = getLeaveTypeName(leave);

  const startDate = leave?.startDate || leave?.fromDate || leave?.from;
  const endDate = leave?.endDate || leave?.toDate || leave?.to;
  const totalDays =
    leave?.totalDays ?? leave?.days ?? leave?.numberOfDays ?? "—";

  const reason = leave?.reason || leave?.description || "—";
  const notes = leave?.notes || leave?.remarks || "";
  const canApproveOrReject = status === "PENDING";
  const canCancel = status === "PENDING" || status === "APPROVED";

  const beginAction = (nextAction) => {
    setActionError("");
    setActionSuccess("");
    setActionReason("");
    setAction(nextAction);
  };

  const closeAction = () => {
    if (actionLoading) return;
    setAction("");
    setActionReason("");
    setActionError("");
  };

  const submitAction = async () => {
    if (!id || !action) return;

    if (
      (action === "reject" || action === "cancel") &&
      !actionReason.trim()
    ) {
      setActionError(
        action === "reject"
          ? "Please enter a rejection reason."
          : "Please enter a cancellation reason."
      );
      return;
    }

    try {
      setActionLoading(true);
      setActionError("");
      setActionSuccess("");

      if (action === "approve") {
        await leaveService.approveLeave(id);
      } else if (action === "reject") {
        await leaveService.rejectLeave(id, actionReason.trim());
      } else if (action === "cancel") {
        await leaveService.cancelLeave(id, actionReason.trim());
      }

      const completedAction = action;
      setAction("");
      setActionReason("");

      await loadLeave();

      setActionSuccess(
        completedAction === "approve"
          ? "Leave request approved successfully."
          : completedAction === "reject"
          ? "Leave request rejected successfully."
          : "Leave request cancelled successfully."
      );
    } catch (err) {
      console.error("Failed to update leave request:", err);
      setActionError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to update leave request."
      );
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-leave-details-loading">
        <Loader />
        <p>Loading leave request...</p>
      </div>
    );
  }

  if (error || !leave) {
    return (
      <div className="admin-leave-details-page">
        <div className="admin-leave-details-error-page">
          <div className="admin-leave-details-error-icon">!</div>
          <h2>Leave Request Not Found</h2>
          <p>{error || "The requested leave record could not be found."}</p>
          <Button
            variant="secondary"
            onClick={() => router.push("/admin/leaves")}
          >
            Back to Leaves
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-leave-details-page">
      <div className="admin-leave-details-header">
        <div>
          <div className="admin-leave-details-breadcrumb">
            <Link href="/admin">Admin</Link>
            <span>/</span>
            <Link href="/admin/leaves">Leaves</Link>
            <span>/</span>
            <span>View Details</span>
          </div>

          <button
            type="button"
            className="admin-leave-details-back"
            onClick={() => router.push("/admin/leaves")}
          >
            ← Back to Leaves
          </button>

          <div className="admin-leave-details-heading">
            <div className="admin-leave-details-avatar">
              {getInitials(employeeName)}
            </div>

            <div>
              <div className="admin-leave-details-title-row">
                <h1>Leave Request Details</h1>
                <Badge variant={statusVariant(status)}>
                  {displayStatus(status)}
                </Badge>
              </div>

              <p>{employeeName}</p>
              <span className="admin-leave-details-employee-id">
                Employee ID: {employeeCode}
              </span>
            </div>
          </div>
        </div>

        <div className="admin-leave-details-actions">
          {canApproveOrReject && (
            <>
              <Button
                variant="success"
                disabled={actionLoading}
                onClick={() => beginAction("approve")}
              >
                Approve
              </Button>

              <Button
                variant="danger"
                disabled={actionLoading}
                onClick={() => beginAction("reject")}
              >
                Reject
              </Button>
            </>
          )}

          {canCancel && (
            <Button
              variant="secondary"
              disabled={actionLoading}
              onClick={() => beginAction("cancel")}
            >
              Cancel Request
            </Button>
          )}

          <Button
            variant="secondary"
            disabled={loading || actionLoading}
            onClick={loadLeave}
          >
            Refresh
          </Button>
        </div>
      </div>

      {actionError && !action && (
        <div className="admin-leave-details-action-error" role="alert">
          {actionError}
        </div>
      )}

      {actionSuccess && (
        <div
          style={{
            marginBottom: 20,
            padding: "13px 16px",
            border: "1px solid #a7f3d0",
            borderRadius: 10,
            background: "#ecfdf5",
            color: "#047857",
            fontSize: 13,
          }}
          role="status"
        >
          {actionSuccess}
        </div>
      )}

      <div className="admin-leave-details-grid">
        <div className="admin-leave-details-main">
          <section className="admin-leave-details-card">
            <div className="admin-leave-details-card-header">
              <div>
                <h2>Leave Information</h2>
                <p>Complete details of this leave request.</p>
              </div>
            </div>

            <div className="admin-leave-details-card-body">
              <div className="admin-leave-info-grid">
                <Info label="Employee Name" value={employeeName} />
                <Info label="Employee ID" value={employeeCode} />
                <Info label="Leave Type" value={leaveTypeName} />
                <Info label="Start Date" value={formatDate(startDate)} />
                <Info label="End Date" value={formatDate(endDate)} />
                <Info
                  label="Total Days"
                  value={totalDays === "—" ? "—" : `${totalDays} day(s)`}
                />
                <Info label="Current Status" value={displayStatus(status)} />
                <Info
                  label="Paid Leave"
                  value={
                    typeof leave.leaveType?.isPaid === "boolean"
                      ? leave.leaveType.isPaid
                        ? "Yes"
                        : "No"
                      : "—"
                  }
                />
              </div>
            </div>
          </section>

          <section className="admin-leave-details-card">
            <div className="admin-leave-details-card-header">
              <div>
                <h2>Reason for Leave</h2>
                <p>Reason provided by the employee.</p>
              </div>
            </div>
            <div className="admin-leave-details-card-body">
              <div className="admin-leave-reason">{reason}</div>
            </div>
          </section>

          {notes && (
            <section className="admin-leave-details-card">
              <div className="admin-leave-details-card-header">
                <div>
                  <h2>Additional Notes</h2>
                  <p>Extra information attached to the request.</p>
                </div>
              </div>
              <div className="admin-leave-details-card-body">
                <div className="admin-leave-notes">{notes}</div>
              </div>
            </section>
          )}

          {(leave.rejectionReason || leave.cancellationReason) && (
            <section className="admin-leave-details-card">
              <div className="admin-leave-details-card-header">
                <h2>Action Remarks</h2>
              </div>
              <div className="admin-leave-details-card-body">
                {leave.rejectionReason && (
                  <div className="admin-leave-action-info">
                    <div>
                      <span>Rejection Reason</span>
                      <p>{leave.rejectionReason}</p>
                    </div>
                  </div>
                )}

                {leave.cancellationReason && (
                  <div className="admin-leave-action-info">
                    <div>
                      <span>Cancellation Reason</span>
                      <p>{leave.cancellationReason}</p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          <section className="admin-leave-details-card">
            <div className="admin-leave-details-card-header">
              <div>
                <h2>Approval History</h2>
                <p>Available timestamps and recorded actions.</p>
              </div>
            </div>

            <div className="admin-leave-details-card-body">
              <div className="admin-leave-info-grid">
                <Info
                  label="Approved At"
                  value={formatDateTime(leave.approvedAt)}
                />
                <Info
                  label="Approved By"
                  value={getEmployeeName(leave.approvedBy)}
                />
                <Info
                  label="Rejected At"
                  value={formatDateTime(leave.rejectedAt)}
                />
                <Info
                  label="Rejected By"
                  value={getEmployeeName(leave.rejectedBy)}
                />
                <Info
                  label="Cancelled At"
                  value={formatDateTime(leave.cancelledAt)}
                />
                <Info
                  label="Updated At"
                  value={formatDateTime(leave.updatedAt)}
                />
              </div>
            </div>
          </section>
        </div>

        <aside className="admin-leave-details-sidebar">
          <section className="admin-leave-details-card">
            <div className="admin-leave-details-card-header">
              <h2>Request Summary</h2>
            </div>

            <div className="admin-leave-summary">
              <div>
                <span>Request ID</span>
                <strong>{leave._id || leave.id || "—"}</strong>
              </div>
              <div>
                <span>Employee</span>
                <strong>{employeeName}</strong>
              </div>
              <div>
                <span>Leave Type</span>
                <strong>{leaveTypeName}</strong>
              </div>
              <div>
                <span>Duration</span>
                <strong>
                  {totalDays === "—"
                    ? "—"
                    : `${totalDays} ${Number(totalDays) === 1 ? "day" : "days"}`}
                </strong>
              </div>
              <div>
                <span>Status</span>
                <Badge variant={statusVariant(status)}>
                  {displayStatus(status)}
                </Badge>
              </div>
            </div>
          </section>

          <section className="admin-leave-details-card">
            <div className="admin-leave-details-card-header">
              <h2>Record Information</h2>
            </div>

            <div className="admin-leave-record-info">
              <div>
                <span>Created At</span>
                <strong>{formatDateTime(leave.createdAt)}</strong>
              </div>
              <div>
                <span>Updated At</span>
                <strong>{formatDateTime(leave.updatedAt)}</strong>
              </div>
              <div>
                <span>Created By</span>
                <strong>
                  {leave.createdBy?.username ||
                    leave.createdBy?.name ||
                    (typeof leave.createdBy === "string"
                      ? leave.createdBy
                      : "—")}
                </strong>
              </div>
              <div>
                <span>Last Updated By</span>
                <strong>
                  {leave.updatedBy?.username ||
                    leave.updatedBy?.name ||
                    (typeof leave.updatedBy === "string"
                      ? leave.updatedBy
                      : "—")}
                </strong>
              </div>
            </div>
          </section>
        </aside>
      </div>

      {action && (
        <div
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeAction();
          }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "rgba(15, 23, 42, 0.48)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="leave-action-title"
            style={{
              width: "100%",
              maxWidth: 480,
              borderRadius: 16,
              padding: 24,
              background: "#ffffff",
              boxShadow: "0 20px 60px rgba(15,23,42,.2)",
            }}
          >
            <h2
              id="leave-action-title"
              style={{ margin: "0 0 8px", fontSize: 21 }}
            >
              {action === "approve"
                ? "Approve Leave Request?"
                : action === "reject"
                ? "Reject Leave Request?"
                : "Cancel Leave Request?"}
            </h2>

            <p style={{ margin: "0 0 18px", color: "#64748b", fontSize: 14 }}>
              {action === "approve"
                ? `Approve ${employeeName}'s leave request?`
                : action === "reject"
                ? "Enter the reason for rejecting this leave request."
                : "Enter the reason for cancelling this leave request."}
            </p>

            {(action === "reject" || action === "cancel") && (
              <textarea
                value={actionReason}
                onChange={(event) => setActionReason(event.target.value)}
                placeholder={
                  action === "reject"
                    ? "Rejection reason..."
                    : "Cancellation reason..."
                }
                rows={4}
                maxLength={1000}
                required
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  resize: "vertical",
                  padding: 12,
                  border: "1px solid #cbd5e1",
                  borderRadius: 10,
                  font: "inherit",
                  marginBottom: 12,
                }}
              />
            )}

            {actionError && (
              <p
                role="alert"
                style={{
                  margin: "0 0 12px",
                  color: "#b91c1c",
                  fontSize: 13,
                }}
              >
                {actionError}
              </p>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <Button
                variant="secondary"
                onClick={closeAction}
                disabled={actionLoading}
              >
                Go Back
              </Button>
              <Button
                variant={action === "approve" ? "success" : "danger"}
                onClick={submitAction}
                disabled={
                  actionLoading ||
                  ((action === "reject" || action === "cancel") &&
                    !actionReason.trim())
                }
              >
                {actionLoading
                  ? "Processing..."
                  : action === "approve"
                  ? "Confirm Approval"
                  : action === "reject"
                  ? "Confirm Rejection"
                  : "Confirm Cancellation"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="admin-leave-info-item">
      <span>{label}</span>
      <strong>{value ?? "—"}</strong>
    </div>
  );
}
