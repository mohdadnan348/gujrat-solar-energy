"use client";

import React from "react";
import Badge from "../common/Badge";
import Button from "../common/Button";
import "./TaskDetails.css";

const formatDate = (date) => {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return date;

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (date) => {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return date;

  return parsedDate.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatStatus = (value) => {
  if (!value) return "Pending";

  return String(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getStatusVariant = (status) => {
  const variants = {
    pending: "warning",
    in_progress: "info",
    completed: "success",
    cancelled: "danger",
    overdue: "danger",
  };

  return variants[String(status || "").toLowerCase()] || "default";
};

const getPriorityVariant = (priority) => {
  const variants = {
    low: "default",
    medium: "info",
    high: "warning",
    urgent: "danger",
  };

  return variants[String(priority || "").toLowerCase()] || "default";
};

const TaskDetails = ({
  task = null,
  loading = false,
  onEdit,
  onDelete,
  onStatusChange,
  onBack,
}) => {
  if (loading) {
    return (
      <div className="task-details task-details--loading">
        <div className="task-details__spinner" />
        <span>Loading task details...</span>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="task-details task-details--empty">
        <div className="task-details__empty-icon">!</div>
        <h3>Task Not Found</h3>
        <p>The requested task could not be found.</p>

        {onBack && (
          <Button
            type="button"
            variant="secondary"
            size="small"
            onClick={onBack}
          >
            Back to Tasks
          </Button>
        )}
      </div>
    );
  }

  const assignedTo =
    task.assignedTo?.name ||
    task.assignedTo?.fullName ||
    task.assignee?.name ||
    task.assignee?.fullName ||
    "Unassigned";

  const assignedEmployeeId =
    task.assignedTo?._id ||
    task.assignedTo?.id ||
    task.assignee?._id ||
    task.assignee?.id;

  const createdBy =
    task.createdBy?.name ||
    task.createdBy?.fullName ||
    task.createdBy ||
    "System";

  const relatedType =
    task.relatedType ||
    task.relatedTo?.type ||
    "";

  const relatedName =
    task.relatedTo?.name ||
    task.relatedTo?.customerName ||
    task.lead?.customerName ||
    task.customer?.name ||
    task.quotation?.quotationNumber ||
    task.relatedToName ||
    "—";

  const status = task.status || "pending";
  const priority = task.priority || "medium";

  return (
    <div className="task-details">
      <div className="task-details__topbar">
        <div>
          {onBack && (
            <button
              type="button"
              className="task-details__back"
              onClick={onBack}
            >
              ← Back to Tasks
            </button>
          )}

          <h2>{task.title || "Untitled Task"}</h2>

          {task.taskNumber && (
            <span className="task-details__number">
              Task #{task.taskNumber}
            </span>
          )}
        </div>

        <div className="task-details__actions">
          {onEdit && (
            <Button
              type="button"
              variant="secondary"
              size="small"
              onClick={() => onEdit(task)}
            >
              Edit
            </Button>
          )}

          {onDelete && (
            <Button
              type="button"
              variant="danger"
              size="small"
              onClick={() => onDelete(task)}
            >
              Delete
            </Button>
          )}
        </div>
      </div>

      <div className="task-details__status-row">
        <div className="task-details__badges">
          <Badge
            variant={getStatusVariant(status)}
            size="small"
          >
            {formatStatus(status)}
          </Badge>

          <Badge
            variant={getPriorityVariant(priority)}
            size="small"
          >
            {formatStatus(priority)} Priority
          </Badge>
        </div>

        {onStatusChange && (
          <select
            className="task-details__status-select"
            value={status}
            onChange={(event) =>
              onStatusChange(task, event.target.value)
            }
            aria-label="Change task status"
          >
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        )}
      </div>

      <div className="task-details__grid">
        <section className="task-details__card task-details__card--description">
          <div className="task-details__card-header">
            <h3>Description</h3>
          </div>

          <div className="task-details__description">
            {task.description ? (
              <p>{task.description}</p>
            ) : (
              <span className="task-details__muted">
                No description provided.
              </span>
            )}
          </div>
        </section>

        <section className="task-details__card">
          <div className="task-details__card-header">
            <h3>Task Information</h3>
          </div>

          <div className="task-details__info-list">
            <div className="task-details__info-item">
              <span>Due Date</span>
              <strong>{formatDate(task.dueDate)}</strong>
            </div>

            <div className="task-details__info-item">
              <span>Created On</span>
              <strong>
                {formatDateTime(task.createdAt)}
              </strong>
            </div>

            {task.updatedAt && (
              <div className="task-details__info-item">
                <span>Last Updated</span>
                <strong>
                  {formatDateTime(task.updatedAt)}
                </strong>
              </div>
            )}

            <div className="task-details__info-item">
              <span>Created By</span>
              <strong>{createdBy}</strong>
            </div>
          </div>
        </section>

        <section className="task-details__card">
          <div className="task-details__card-header">
            <h3>Assignment</h3>
          </div>

          <div className="task-details__employee">
            <div className="task-details__avatar">
              {assignedTo.charAt(0).toUpperCase()}
            </div>

            <div>
              <strong>{assignedTo}</strong>

              {task.assignedTo?.email && (
                <span>{task.assignedTo.email}</span>
              )}

              {task.assignedTo?.phone && (
                <span>{task.assignedTo.phone}</span>
              )}
            </div>
          </div>

          {assignedEmployeeId && (
            <span className="task-details__record-id">
              Employee ID: {assignedEmployeeId}
            </span>
          )}
        </section>

        <section className="task-details__card">
          <div className="task-details__card-header">
            <h3>Related Record</h3>
          </div>

          <div className="task-details__related">
            <span className="task-details__related-type">
              {relatedType
                ? formatStatus(relatedType)
                : "No Relation"}
            </span>

            <strong>{relatedName}</strong>

            {(task.relatedId || task.relatedTo?._id) && (
              <span>
                Record ID:{" "}
                {task.relatedId || task.relatedTo?._id}
              </span>
            )}
          </div>
        </section>
      </div>

      {task.completedAt && (
        <section className="task-details__card task-details__completion">
          <div className="task-details__card-header">
            <h3>Completion Information</h3>
          </div>

          <div className="task-details__info-list">
            <div className="task-details__info-item">
              <span>Completed On</span>
              <strong>
                {formatDateTime(task.completedAt)}
              </strong>
            </div>

            {task.completedBy && (
              <div className="task-details__info-item">
                <span>Completed By</span>
                <strong>
                  {task.completedBy?.name ||
                    task.completedBy?.fullName ||
                    task.completedBy}
                </strong>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default TaskDetails;