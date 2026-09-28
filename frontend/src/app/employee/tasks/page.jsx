"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import Button from "@/components/common/Button";
import SearchBox from "@/components/common/SearchBox";
import Select from "@/components/common/Select";
import Badge from "@/components/common/Badge";
import Pagination from "@/components/common/Pagination";
import Loader from "@/components/common/Loader";

import { useAuth } from "@/hooks/useAuth";
import taskService from "@/services/task.service";

import "./tasks.css";
const EmployeeTasksPage = () => {
  const { user, loading: authLoading } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [page, setPage] = useState(1);

  const limit = 10;

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await taskService.getMyTasks();

      const items =
        response?.data?.tasks ??
        response?.data?.items ??
        response?.tasks ??
        response?.items ??
        response?.data ??
        [];

      setTasks(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error("Failed to load employee tasks:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load tasks. Please try again."
      );

      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      loadTasks();
    }
  }, [authLoading, user]);

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();

    return tasks.filter((task) => {
      const taskStatus = String(
        task?.status || task?.taskStatus || ""
      ).toLowerCase();

      const taskPriority = String(
        task?.priority || ""
      ).toLowerCase();

      const searchableText = [
        task?.taskId,
        task?.taskNumber,
        task?.title,
        task?.taskName,
        task?.description,
        task?.category,
        task?.type,
        task?.customerName,
        task?.leadName,
        task?.customer?.name,
        task?.lead?.name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !query || searchableText.includes(query);

      const matchesStatus =
        !status || taskStatus === status.toLowerCase();

      const matchesPriority =
        !priority || taskPriority === priority.toLowerCase();

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority
      );
    });
  }, [tasks, search, status, priority]);

  useEffect(() => {
    setPage(1);
  }, [search, status, priority]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredTasks.length / limit)
  );

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const paginatedTasks = useMemo(() => {
    const start = (page - 1) * limit;

    return filteredTasks.slice(start, start + limit);
  }, [filteredTasks, page]);

  const getTaskTitle = (task) =>
    task?.title ||
    task?.taskName ||
    "Untitled Task";

  const getTaskId = (task) =>
    task?._id ||
    task?.id ||
    task?.taskId;

  const getTaskNumber = (task) =>
    task?.taskNumber ||
    task?.taskId ||
    null;

  const getTaskStatus = (task) =>
    task?.status ||
    task?.taskStatus ||
    "PENDING";

  const getPriority = (task) =>
    task?.priority ||
    "NORMAL";

  const getStatusVariant = (taskStatus) => {
    const value = String(taskStatus || "").toLowerCase();

    if (
      [
        "completed",
        "done",
        "closed",
      ].includes(value)
    ) {
      return "success";
    }

    if (
      [
        "cancelled",
        "cancelled_by_user",
        "failed",
      ].includes(value)
    ) {
      return "danger";
    }

    if (
      [
        "in_progress",
        "ongoing",
        "started",
      ].includes(value)
    ) {
      return "warning";
    }

    return "default";
  };

  const getPriorityVariant = (taskPriority) => {
    const value = String(taskPriority || "").toLowerCase();

    if (
      ["high", "urgent", "critical"].includes(value)
    ) {
      return "danger";
    }

    if (
      ["medium", "normal"].includes(value)
    ) {
      return "warning";
    }

    return "default";
  };

  const formatLabel = (value) => {
    if (!value) return "—";

    return String(value)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const isOverdue = (task) => {
    const statusValue = String(
      getTaskStatus(task)
    ).toLowerCase();

    if (
      ["completed", "done", "closed", "cancelled"].includes(
        statusValue
      )
    ) {
      return false;
    }

    const dueDate =
      task?.dueDate ||
      task?.deadline ||
      task?.endDate;

    if (!dueDate) return false;

    const date = new Date(dueDate);

    if (Number.isNaN(date.getTime())) {
      return false;
    }

    return date < new Date();
  };

  if (authLoading) {
    return (
      <div className="employee-tasks-loading">
        <Loader />
      </div>
    );
  }

  return (
    <div className="employee-tasks-page">
      {/* Header */}
      <div className="employee-tasks-header">
        <div className="employee-tasks-header-content">
          <span className="employee-tasks-eyebrow">
            Work Management
          </span>

          <h1>My Tasks</h1>

          <p>
            View and manage tasks assigned to you.
          </p>
        </div>

        <Button
          type="button"
          variant="secondary"
          onClick={loadTasks}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {/* Summary */}
      {!loading && !error && (
        <div className="employee-tasks-summary">
          <div className="employee-task-summary-item">
            <span className="employee-task-summary-label">
              Total Tasks
            </span>
            <strong>{tasks.length}</strong>
          </div>

          <div className="employee-task-summary-item">
            <span className="employee-task-summary-label">
              Pending
            </span>
            <strong>
              {
                tasks.filter(
                  (task) =>
                    String(getTaskStatus(task)).toLowerCase() ===
                    "pending"
                ).length
              }
            </strong>
          </div>

          <div className="employee-task-summary-item">
            <span className="employee-task-summary-label">
              In Progress
            </span>
            <strong>
              {
                tasks.filter((task) =>
                  [
                    "in_progress",
                    "ongoing",
                    "started",
                  ].includes(
                    String(getTaskStatus(task)).toLowerCase()
                  )
                ).length
              }
            </strong>
          </div>

          <div className="employee-task-summary-item">
            <span className="employee-task-summary-label">
              Completed
            </span>
            <strong>
              {
                tasks.filter((task) =>
                  [
                    "completed",
                    "done",
                    "closed",
                  ].includes(
                    String(getTaskStatus(task)).toLowerCase()
                  )
                ).length
              }
            </strong>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="employee-tasks-toolbar">
        <div className="employee-tasks-search">
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Search tasks, customers, leads..."
          />
        </div>

        <div className="employee-tasks-filter">
          <Select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value)
            }
            options={[
              {
                value: "",
                label: "All Statuses",
              },
              {
                value: "PENDING",
                label: "Pending",
              },
              {
                value: "IN_PROGRESS",
                label: "In Progress",
              },
              {
                value: "COMPLETED",
                label: "Completed",
              },
              {
                value: "CANCELLED",
                label: "Cancelled",
              },
            ]}
          />
        </div>

        <div className="employee-tasks-filter">
          <Select
            value={priority}
            onChange={(event) =>
              setPriority(event.target.value)
            }
            options={[
              {
                value: "",
                label: "All Priorities",
              },
              {
                value: "LOW",
                label: "Low",
              },
              {
                value: "NORMAL",
                label: "Normal",
              },
              {
                value: "MEDIUM",
                label: "Medium",
              },
              {
                value: "HIGH",
                label: "High",
              },
              {
                value: "URGENT",
                label: "Urgent",
              },
            ]}
          />
        </div>

        {(search || status || priority) && (
          <button
            type="button"
            className="employee-tasks-clear"
            onClick={() => {
              setSearch("");
              setStatus("");
              setPriority("");
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="employee-tasks-error">
          <div>
            <strong>Unable to load tasks</strong>
            <span>{error}</span>
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={loadTasks}
          >
            Retry
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="employee-tasks-card">
        {loading ? (
          <div className="employee-tasks-loader">
            <Loader />
          </div>
        ) : paginatedTasks.length === 0 ? (
          <div className="employee-tasks-empty">
            <div className="employee-tasks-empty-icon">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <rect
                  x="3"
                  y="4"
                  width="18"
                  height="17"
                  rx="2"
                />
                <path d="M8 2v4M16 2v4M3 9h18" />
                <path d="m8 14 2 2 5-5" />
              </svg>
            </div>

            <h3>
              {search || status || priority
                ? "No matching tasks"
                : "No tasks assigned"}
            </h3>

            <p>
              {search || status || priority
                ? "Try changing your search or filters."
                : "Tasks assigned to you will appear here."}
            </p>

            {(search || status || priority) && (
              <button
                type="button"
                className="employee-tasks-empty-button"
                onClick={() => {
                  setSearch("");
                  setStatus("");
                  setPriority("");
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="employee-tasks-card-header">
              <div>
                <h2>Assigned Tasks</h2>
                <p>
                  {filteredTasks.length} task
                  {filteredTasks.length !== 1 ? "s" : ""} found
                </p>
              </div>

              <span className="employee-tasks-count">
                {filteredTasks.length} Total
              </span>
            </div>

            <div className="employee-tasks-table-wrapper">
              <table className="employee-tasks-table">
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Related To</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Due Date</th>
                    <th>Created</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedTasks.map((task, index) => {
                    const id =
                      getTaskId(task) || index;

                    const taskStatus =
                      getTaskStatus(task);

                    const taskPriority =
                      getPriority(task);

                    const relatedTo =
                      task?.customerName ||
                      task?.customer?.name ||
                      task?.leadName ||
                      task?.lead?.name ||
                      "No linked record";

                    const dueDate =
                      task?.dueDate ||
                      task?.deadline ||
                      task?.endDate;

                    return (
                      <tr key={id}>
                        <td>
                          <div className="employee-task-main">
                            <div className="employee-task-icon">
                              <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                              >
                                <rect
                                  x="3"
                                  y="4"
                                  width="18"
                                  height="17"
                                  rx="2"
                                />
                                <path d="M8 2v4M16 2v4M3 9h18" />
                              </svg>
                            </div>

                            <div className="employee-task-content">
                              <div className="employee-task-number">
                                {getTaskNumber(task)
                                  ? `#${getTaskNumber(task)}`
                                  : "Task"}
                              </div>

                              <div className="employee-task-title">
                                {getTaskTitle(task)}
                              </div>

                              {(task?.description ||
                                task?.category) && (
                                <div className="employee-task-subtext">
                                  {task?.category ||
                                    task?.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className="employee-task-related">
                            <strong>
                              {relatedTo}
                            </strong>

                            {task?.quotation?.quotationNumber && (
                              <span>
                                {
                                  task.quotation
                                    .quotationNumber
                                }
                              </span>
                            )}
                          </div>
                        </td>

                        <td>
                          <Badge
                            variant={getPriorityVariant(
                              taskPriority
                            )}
                          >
                            {formatLabel(taskPriority)}
                          </Badge>
                        </td>

                        <td>
                          <Badge
                            variant={getStatusVariant(
                              taskStatus
                            )}
                          >
                            {formatLabel(taskStatus)}
                          </Badge>
                        </td>

                        <td>
                          <div
                            className={
                              isOverdue(task)
                                ? "employee-task-date employee-task-date-overdue"
                                : "employee-task-date"
                            }
                          >
                            <span>
                              {formatDate(dueDate)}
                            </span>

                            {isOverdue(task) && (
                              <small>Overdue</small>
                            )}
                          </div>
                        </td>

                        <td>
                          <span className="employee-task-created">
                            {formatDate(
                              task?.createdAt ||
                                task?.createdDate
                            )}
                          </span>
                        </td>

                        <td>
                          {getTaskId(task) ? (
                            <Link
                              href={`/employee/tasks/${getTaskId(
                                task
                              )}`}
                              className="employee-task-view-button"
                            >
                              View
                              <svg
                                width="15"
                                height="15"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path d="m9 18 6-6-6-6" />
                              </svg>
                            </Link>
                          ) : (
                            <span className="employee-task-no-action">
                              —
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="employee-tasks-footer">
              <span>
                Showing{" "}
                {filteredTasks.length === 0
                  ? 0
                  : (page - 1) * limit + 1}{" "}
                -{" "}
                {Math.min(
                  page * limit,
                  filteredTasks.length
                )}{" "}
                of {filteredTasks.length} tasks
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

export default EmployeeTasksPage;