"use client";

import React from "react";
import Badge from "../common/Badge";
import Button from "../common/Button";
import "./TaskTable.css";

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

const TaskTable = ({
  tasks = [],
  loading = false,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  if (loading) {
    return (
      <div className="task-table">
        <div className="task-table__loading">
          <div className="task-table__spinner" />
          <span>Loading tasks...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="task-table">
      <div className="task-table__wrapper">
        <table className="task-table__table">
          <thead>
            <tr>
              <th>Task</th>
              <th>Assigned To</th>
              <th>Related To</th>
              <th>Priority</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {tasks.length > 0 ? (
              tasks.map((task, index) => {
                const assignedTo =
                  task.assignedTo?.name ||
                  task.assignee?.name ||
                  task.assignedTo?.fullName ||
                  "Unassigned";

                const relatedTo =
                  task.lead?.customerName ||
                  task.customer?.name ||
                  task.quotation?.quotationNumber ||
                  task.relatedToName ||
                  "—";

                const status =
                  task.status?.toLowerCase() || "pending";

                return (
                  <tr key={task._id || task.id || index}>
                    <td>
                      <div className="task-table__task">
                        <button
                          type="button"
                          className="task-table__task-title"
                          onClick={() => onView?.(task)}
                        >
                          {task.title || "Untitled Task"}
                        </button>

                        {task.description && (
                          <span className="task-table__description">
                            {task.description}
                          </span>
                        )}
                      </div>
                    </td>

                    <td>
                      <div className="task-table__assignee">
                        <div className="task-table__avatar">
                          {assignedTo.charAt(0).toUpperCase()}
                        </div>
                        <span>{assignedTo}</span>
                      </div>
                    </td>

                    <td>
                      <span className="task-table__related">
                        {relatedTo}
                      </span>
                    </td>

                    <td>
                      <Badge
                        variant={getPriorityVariant(task.priority)}
                        size="small"
                      >
                        {task.priority
                          ? String(task.priority)
                              .replace(/_/g, " ")
                              .replace(/\b\w/g, (char) =>
                                char.toUpperCase()
                              )
                          : "Medium"}
                      </Badge>
                    </td>

                    <td>
                      <span className="task-table__date">
                        {formatDate(task.dueDate)}
                      </span>
                    </td>

                    <td>
                      {onStatusChange ? (
                        <select
                          className="task-table__status-select"
                          value={status}
                          onChange={(event) =>
                            onStatusChange(
                              task,
                              event.target.value
                            )
                          }
                          aria-label={`Change status for ${
                            task.title || "task"
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">
                            In Progress
                          </option>
                          <option value="completed">
                            Completed
                          </option>
                          <option value="cancelled">
                            Cancelled
                          </option>
                        </select>
                      ) : (
                        <Badge
                          variant={getStatusVariant(status)}
                          size="small"
                        >
                          {status
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (char) =>
                              char.toUpperCase()
                            )}
                        </Badge>
                      )}
                    </td>

                    <td>
                      <div className="task-table__actions">
                        <Button
                          type="button"
                          variant="ghost"
                          size="small"
                          onClick={() => onView?.(task)}
                        >
                          View
                        </Button>

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
                          <button
                            type="button"
                            className="task-table__delete"
                            onClick={() => onDelete(task)}
                            title="Delete task"
                            aria-label={`Delete ${
                              task.title || "task"
                            }`}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7">
                  <div className="task-table__empty">
                    <div className="task-table__empty-icon">✓</div>
                    <h3>No tasks found</h3>
                    <p>
                      There are no tasks available for the
                      selected filters.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {tasks.length > 0 && (
        <div className="task-table__footer">
          <span>
            Showing <strong>{tasks.length}</strong> task
            {tasks.length !== 1 ? "s" : ""}
          </span>
        </div>
      )}
    </div>
  );
};

export default TaskTable;