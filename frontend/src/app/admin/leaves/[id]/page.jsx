"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import AdminLayout from "../../layout";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import Loader from "@/components/common/Loader";
import ConfirmDialog from "@/components/common/ConfirmDialog";
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

const normalizeStatus = (status) => {
  if (!status) return "—";

  return String(status)
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const getStatusVariant = (status) => {
  switch (String(status || "").toUpperCase()) {
    case "PENDING":
      return "warning";
    case "APPROVED":
      return "success";
    case "REJECTED":
      return "danger";
    case "CANCELLED":
      return "default";
    default:
      return "default";
  }
};

const getEmployeeName = (employee) => {
  if (!employee) return "Unknown Employee";

  if (typeof employee === "string") {
    return employee;
  }

  return (
    employee.name ||
    `${employee.firstName || ""} ${employee.lastName || ""}`.trim() ||
    employee.fullName ||
    employee.employeeCode ||
    "Unknown Employee"
  );
};

const getEmployeeId = (employee) => {
  if (!employee) return "";

  if (typeof employee === "string") return employee;

  return employee._id || employee.id || employee.employeeId || "";
};

const extractLeave = (response) => {
  if (response?.data?.data) return response.data.data;
  if (response?.data) return response.data;
  return response;
};

const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "NA";

const AdminLeaveDetailsPage = () => {
  const params = useParams();
  const router = useRouter();

  const id = params?.id;

  const [leave, setLeave] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  const [confirmAction, setConfirmAction] = useState(null);

  const loadLeave = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError("");

      const response = await leaveService.getLeaveById(id);
      const data = extractLeave(response);

      if (!data) {
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
  };

  useEffect(() => {
    loadLeave();
  }, [id]);

  const employee = leave?.employee;

  const employeeName = getEmployeeName(employee);
  const employeeId =
    getEmployeeId(employee) ||
    leave?.employeeId ||
    leave?.employeeCode ||
    "";

  const startDate =
    leave?.startDate || leave?.fromDate || leave?.from;

  const endDate =
    leave?.endDate || leave?.toDate || leave?.to;

  const leaveType =
    leave?.leaveType ||
    leave?.type ||
    "—";

  const totalDays =
    leave?.totalDays ??
    leave?.days ??
    leave?.numberOfDays ??
    "—";

  const reason =
    leave?.reason ||
    leave?.description ||
    "—";

  const notes =
    leave?.notes ||
    leave?.remarks ||
    leave?.remark ||
    "";

  const status = String(leave?.status || "").toUpperCase();

  const canApprove = status === "PENDING";
  const canReject = status === "PENDING";
  const canCancel = status === "PENDING" || status === "APPROVED";

  const openConfirm = (action) => {
    setActionError("");
    setConfirmAction(action);
  };

  const closeConfirm = () => {
    if (!actionLoading) {
      setConfirmAction(null);
    }
  };

  const executeAction = async () => {
    if (!confirmAction || !id) return;

    try {
      setActionLoading(true);
      setActionError("");

      if (confirmAction === "approve") {
        if (typeof leaveService.approveLeave === "function") {
          await leaveService.approveLeave(id);
        } else {
          await leaveService.updateLeave(id, {
            status: "APPROVED",
          });
        }
      }

      if (confirmAction === "reject") {
        if (typeof leaveService.rejectLeave === "function") {
          await leaveService.rejectLeave(id);
        } else {
          await leaveService.updateLeave(id, {
            status: "REJECTED",
          });
        }
      }

      if (confirmAction === "cancel") {
        if (typeof leaveService.cancelLeave === "function") {
          await leaveService.cancelLeave(id);
        } else {
          await leaveService.updateLeave(id, {
            status: "CANCELLED",
          });
        }
      }

      setConfirmAction(null);
      await loadLeave();
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

  const handleEdit = () => {
    router.push(`/admin/leaves/create?edit=${id}`);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-leave-details-loading">
          <Loader />
          <p>Loading leave request...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error || !leave) {
    return (
      <AdminLayout>
        <div className="admin-leave-details-page">
          <div className="admin-leave-details-error-page">
            <div className="admin-leave-details-error-icon">!</div>

            <h2>Leave Request Not Found</h2>

            <p>
              {error || "The requested leave record could not be found."}
            </p>

            <Button
              variant="secondary"
              onClick={() => router.push("/admin/leaves")}
            >
              Back to Leaves
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-leave-details-page">
        <div className="admin-leave-details-header">
          <div>
            <div className="admin-leave-details-breadcrumb">
              <Link href="/admin">Admin</Link>
              <span>/</span>
              <Link href="/admin/leaves">Leaves</Link>
              <span>/</span>
              <span>Details</span>
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
                  <h1>Leave Request</h1>

                  <Badge variant={getStatusVariant(leave.status)}>
                    {normalizeStatus(leave.status)}
                  </Badge>
                </div>

                <p>{employeeName}</p>

                {employeeId && (
                  <span className="admin-leave-details-employee-id">
                    Employee ID: {employeeId}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="admin-leave-details-actions">
            {canApprove && (
              <Button
                variant="success"
                onClick={() => openConfirm("approve")}
                disabled={actionLoading}
              >
                Approve
              </Button>
            )}

            {canReject && (
              <Button
                variant="danger"
                onClick={() => openConfirm("reject")}
                disabled={actionLoading}
              >
                Reject
              </Button>
            )}

            {canCancel && (
              <Button
                variant="secondary"
                onClick={() => openConfirm("cancel")}
                disabled={actionLoading}
              >
                Cancel Request
              </Button>
            )}

            <Button
              variant="secondary"
              onClick={handleEdit}
              disabled={actionLoading}
            >
              Edit
            </Button>
          </div>
        </div>

        {actionError && (
          <div className="admin-leave-details-action-error">
            {actionError}
          </div>
        )}

        <div className="admin-leave-details-grid">
          <div className="admin-leave-details-main">
            <div className="admin-leave-details-card">
              <div className="admin-leave-details-card-header">
                <div>
                  <h2>Leave Information</h2>
                  <p>Details of the employee leave request.</p>
                </div>
              </div>

              <div className="admin-leave-details-card-body">
                <div className="admin-leave-info-grid">
                  <div className="admin-leave-info-item">
                    <span>Employee</span>
                    <strong>{employeeName}</strong>
                  </div>

                  <div className="admin-leave-info-item">
                    <span>Leave Type</span>
                    <strong>{normalizeStatus(leaveType)}</strong>
                  </div>

                  <div className="admin-leave-info-item">
                    <span>Start Date</span>
                    <strong>{formatDate(startDate)}</strong>
                  </div>

                  <div className="admin-leave-info-item">
                    <span>End Date</span>
                    <strong>{formatDate(endDate)}</strong>
                  </div>

                  <div className="admin-leave-info-item">
                    <span>Total Days</span>
                    <strong>{totalDays}</strong>
                  </div>

                  <div className="admin-leave-info-item">
                    <span>Status</span>
                    <Badge variant={getStatusVariant(leave.status)}>
                      {normalizeStatus(leave.status)}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-leave-details-card">
              <div className="admin-leave-details-card-header">
                <div>
                  <h2>Reason</h2>
                  <p>Reason provided for the leave request.</p>
                </div>
              </div>

              <div className="admin-leave-details-card-body">
                <div className="admin-leave-reason">
                  {reason}
                </div>
              </div>
            </div>

            {notes && (
              <div className="admin-leave-details-card">
                <div className="admin-leave-details-card-header">
                  <div>
                    <h2>Additional Notes</h2>
                    <p>Additional information related to this request.</p>
                  </div>
                </div>

                <div className="admin-leave-details-card-body">
                  <div className="admin-leave-notes">
                    {notes}
                  </div>
                </div>
              </div>
            )}

            {(leave.rejectionReason ||
              leave.cancellationReason) && (
              <div className="admin-leave-details-card">
                <div className="admin-leave-details-card-header">
                  <div>
                    <h2>Action Information</h2>
                    <p>Additional information about the request status.</p>
                  </div>
                </div>

                <div className="admin-leave-details-card-body">
                  <div className="admin-leave-action-info">
                    {leave.rejectionReason && (
                      <div>
                        <span>Rejection Reason</span>
                        <p>{leave.rejectionReason}</p>
                      </div>
                    )}

                    {leave.cancellationReason && (
                      <div>
                        <span>Cancellation Reason</span>
                        <p>{leave.cancellationReason}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <aside className="admin-leave-details-sidebar">
            <div className="admin-leave-details-card">
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
                  <strong>{normalizeStatus(leaveType)}</strong>
                </div>

                <div>
                  <span>Duration</span>
                  <strong>
                    {totalDays !== "—"
                      ? `${totalDays} ${
                          Number(totalDays) === 1 ? "day" : "days"
                        }`
                      : "—"}
                  </strong>
                </div>

                <div>
                  <span>Status</span>
                  <Badge variant={getStatusVariant(leave.status)}>
                    {normalizeStatus(leave.status)}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="admin-leave-details-card">
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

                {leave.approvedAt && (
                  <div>
                    <span>Approved At</span>
                    <strong>{formatDateTime(leave.approvedAt)}</strong>
                  </div>
                )}

                {leave.rejectedAt && (
                  <div>
                    <span>Rejected At</span>
                    <strong>{formatDateTime(leave.rejectedAt)}</strong>
                  </div>
                )}

                {leave.cancelledAt && (
                  <div>
                    <span>Cancelled At</span>
                    <strong>{formatDateTime(leave.cancelledAt)}</strong>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>

        <ConfirmDialog
          isOpen={Boolean(confirmAction)}
          onClose={closeConfirm}
          onConfirm={executeAction}
          title={
            confirmAction === "approve"
              ? "Approve Leave Request"
              : confirmAction === "reject"
              ? "Reject Leave Request"
              : "Cancel Leave Request"
          }
          message={
            confirmAction === "approve"
              ? "Are you sure you want to approve this leave request?"
              : confirmAction === "reject"
              ? "Are you sure you want to reject this leave request?"
              : "Are you sure you want to cancel this leave request?"
          }
          confirmText={
            confirmAction === "approve"
              ? "Approve"
              : confirmAction === "reject"
              ? "Reject"
              : "Cancel Request"
          }
          cancelText="Close"
          loading={actionLoading}
          danger={
            confirmAction === "reject" ||
            confirmAction === "cancel"
          }
        />
      </div>
    </AdminLayout>
  );
};

export default AdminLeaveDetailsPage;