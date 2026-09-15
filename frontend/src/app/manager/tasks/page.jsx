"use client";

import React, { useEffect, useMemo, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import SearchBox from "@/components/common/SearchBox";
import Pagination from "@/components/common/Pagination";
import Loader from "@/components/common/Loader";
import { useAuth } from "@/hooks/useAuth";
import taskService from "@/services/task.service";

const ManagerTasksPage = () => {
  const { user, logout, loading: authLoading } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [selectedTask, setSelectedTask] = useState(null);

  const itemsPerPage = 10;

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await taskService.getTasks();

      const data =
        response?.data?.tasks ||
        response?.tasks ||
        response?.data?.items ||
        response?.items ||
        response?.data ||
        [];

      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Tasks error:", err);

      setError(
        err?.message ||
          err?.response?.data?.message ||
          "Unable to load tasks."
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

  const handleLogout = async () => {
    await logout();
  };

  const getTaskTitle = (task) =>
    task?.title ||
    task?.taskTitle ||
    task?.name ||
    "Untitled Task";

  const getTaskDescription = (task) =>
    task?.description ||
    task?.details ||
    task?.notes ||
    "";

  const getStatus = (task) =>
    task?.status ||
    task?.taskStatus ||
    "PENDING";

  const getPriority = (task) =>
    task?.priority ||
    task?.taskPriority ||
    "MEDIUM";

  const getAssignedEmployee = (task) => {
    const employee =
      task?.assignedTo ||
      task?.employee ||
      task?.assignedEmployee;

    if (typeof employee === "string") {
      return employee;
    }

    return (
      employee?.name ||
      employee?.fullName ||
      [
        employee?.firstName,
        employee?.lastName,
      ]
        .filter(Boolean)
        .join(" ") ||
      "Unassigned"
    );
  };

  const getCustomerName = (task) =>
    task?.customer?.name ||
    task?.customerName ||
    task?.lead?.name ||
    "—";

  const getBadgeVariant = (value) => {
    const status = String(value).toLowerCase();

    if (
      [
        "completed",
        "complete",
        "done",
        "approved",
      ].includes(status)
    ) {
      return "success";
    }

    if (
      [
        "overdue",
        "cancelled",
        "rejected",
      ].includes(status)
    ) {
      return "danger";
    }

    if (
      [
        "in_progress",
        "in progress",
        "pending",
        "review",
        "medium",
      ].includes(status)
    ) {
      return "warning";
    }

    if (
      ["high", "urgent", "critical"].includes(
        status
      )
    ) {
      return "danger";
    }

    if (status === "low") {
      return "default";
    }

    return "default";
  };

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const isOverdue = (task) => {
    const dueDate =
      task?.dueDate ||
      task?.deadline ||
      task?.endDate;

    if (!dueDate) return false;

    const status = String(
      getStatus(task)
    ).toLowerCase();

    if (
      ["completed", "complete", "done", "cancelled"].includes(
        status
      )
    ) {
      return false;
    }

    const date = new Date(dueDate);

    if (Number.isNaN(date.getTime())) {
      return false;
    }

    return date < new Date();
  };

  const getEffectiveStatus = (task) =>
    isOverdue(task) ? "OVERDUE" : getStatus(task);

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();

    return tasks.filter((task) => {
      const status = String(
        getEffectiveStatus(task)
      ).toUpperCase();

      const priority = String(
        getPriority(task)
      ).toUpperCase();

      const matchesStatus =
        statusFilter === "ALL" ||
        status === statusFilter;

      const matchesPriority =
        priorityFilter === "ALL" ||
        priority === priorityFilter;

      if (
        !matchesStatus ||
        !matchesPriority
      ) {
        return false;
      }

      if (!query) {
        return true;
      }

      const searchableText = [
        getTaskTitle(task),
        getTaskDescription(task),
        getAssignedEmployee(task),
        getCustomerName(task),
        task?.category,
        task?.type,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [
    tasks,
    search,
    statusFilter,
    priorityFilter,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredTasks.length /
        itemsPerPage
    )
  );

  const currentPage = Math.min(
    page,
    totalPages
  );

  const paginatedTasks = filteredTasks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setPage(1);
  }, [
    search,
    statusFilter,
    priorityFilter,
  ]);

  const handlePageChange = (nextPage) => {
    setPage(nextPage);
  };

  const totalCompleted = tasks.filter((task) =>
    ["completed", "complete", "done"].includes(
      String(getStatus(task)).toLowerCase()
    )
  ).length;

  const totalPending = tasks.filter((task) =>
    ["pending", "in_progress", "in progress"].includes(
      String(getStatus(task)).toLowerCase()
    )
  ).length;

  const totalOverdue = tasks.filter(isOverdue).length;

  if (authLoading || loading) {
    return (
      <div className="manager-tasks-loading">
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
      <div className="manager-tasks-page">
        <div className="manager-tasks-header">
          <div>
            <span className="manager-tasks-eyebrow">
              Manager Portal
            </span>

            <h1>Tasks</h1>

            <p>
              Monitor team tasks, assignments,
              priorities and completion status.
            </p>
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={loadTasks}
          >
            Refresh
          </Button>
        </div>

        {error && (
          <div className="manager-tasks-error">
            <span>{error}</span>

            <Button
              type="button"
              variant="secondary"
              onClick={loadTasks}
            >
              Retry
            </Button>
          </div>
        )}

        <div className="manager-tasks-summary">
          <div className="manager-task-summary-card">
            <span>Total Tasks</span>
            <strong>{tasks.length}</strong>
          </div>

          <div className="manager-task-summary-card">
            <span>Pending / Active</span>
            <strong>{totalPending}</strong>
          </div>

          <div className="manager-task-summary-card">
            <span>Completed</span>
            <strong>{totalCompleted}</strong>
          </div>

          <div className="manager-task-summary-card manager-task-overdue-card">
            <span>Overdue</span>
            <strong>{totalOverdue}</strong>
          </div>
        </div>

        <div className="manager-tasks-toolbar">
          <SearchBox
            value={search}
            onChange={(value) => setSearch(value)}
            placeholder="Search task, employee, customer..."
          />

          <select
            className="manager-tasks-filter"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">
              In Progress
            </option>
            <option value="COMPLETED">
              Completed
            </option>
            <option value="OVERDUE">
              Overdue
            </option>
            <option value="CANCELLED">
              Cancelled
            </option>
          </select>

          <select
            className="manager-tasks-filter"
            value={priorityFilter}
            onChange={(event) =>
              setPriorityFilter(
                event.target.value
              )
            }
          >
            <option value="ALL">
              All Priority
            </option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">
              Medium
            </option>
            <option value="HIGH">High</option>
            <option value="URGENT">
              Urgent
            </option>
          </select>
        </div>

        <div className="manager-tasks-card">
          <div className="manager-tasks-table-wrapper">
            <table className="manager-tasks-table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Customer</th>
                  <th>Assigned To</th>
                  <th>Priority</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {paginatedTasks.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="manager-tasks-empty"
                    >
                      <div>
                        <span>✓</span>
                        <strong>
                          No tasks found
                        </strong>
                        <p>
                          Try changing your search
                          or filters.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedTasks.map(
                    (task, index) => {
                      const taskStatus =
                        getEffectiveStatus(
                          task
                        );

                      return (
                        <tr
                          key={
                            task?._id ||
                            task?.id ||
                            index
                          }
                        >
                          <td>
                            <div className="manager-task-title-block">
                              <strong>
                                {getTaskTitle(
                                  task
                                )}
                              </strong>

                              {getTaskDescription(
                                task
                              ) && (
                                <span>
                                  {getTaskDescription(
                                    task
                                  )}
                                </span>
                              )}
                            </div>
                          </td>

                          <td>
                            <span className="manager-task-customer">
                              {getCustomerName(
                                task
                              )}
                            </span>
                          </td>

                          <td>
                            <div className="manager-task-assignee">
                              <div className="manager-task-avatar">
                                {getAssignedEmployee(
                                  task
                                )
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>

                              <span>
                                {getAssignedEmployee(
                                  task
                                )}
                              </span>
                            </div>
                          </td>

                          <td>
                            <Badge
                              variant={getBadgeVariant(
                                getPriority(
                                  task
                                )
                              )}
                            >
                              {String(
                                getPriority(
                                  task
                                )
                              ).replaceAll(
                                "_",
                                " "
                              )}
                            </Badge>
                          </td>

                          <td>
                            <span
                              className={
                                taskStatus ===
                                "OVERDUE"
                                  ? "manager-task-due-overdue"
                                  : ""
                              }
                            >
                              {formatDate(
                                task?.dueDate ||
                                  task?.deadline ||
                                  task?.endDate
                              )}
                            </span>
                          </td>

                          <td>
                            <Badge
                              variant={getBadgeVariant(
                                taskStatus
                              )}
                            >
                              {String(
                                taskStatus
                              ).replaceAll(
                                "_",
                                " "
                              )}
                            </Badge>
                          </td>

                          <td>
                            {formatDate(
                              task?.createdAt
                            )}
                          </td>

                          <td>
                            <Button
                              type="button"
                              variant="secondary"
                              onClick={() =>
                                setSelectedTask(
                                  task
                                )
                              }
                            >
                              View
                            </Button>
                          </td>
                        </tr>
                      );
                    }
                  )
                )}
              </tbody>
            </table>
          </div>

          {filteredTasks.length > 0 && (
            <div className="manager-tasks-pagination">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>

        {selectedTask && (
          <div
            className="manager-task-modal-overlay"
            onClick={() =>
              setSelectedTask(null)
            }
          >
            <div
              className="manager-task-modal"
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              <div className="manager-task-modal-header">
                <div>
                  <span>Task Details</span>

                  <h2>
                    {getTaskTitle(
                      selectedTask
                    )}
                  </h2>

                  <p>
                    {getCustomerName(
                      selectedTask
                    )}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedTask(null)
                  }
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              <div className="manager-task-modal-body">
                <div className="manager-task-detail-grid">
                  <div>
                    <span>Status</span>

                    <Badge
                      variant={getBadgeVariant(
                        getEffectiveStatus(
                          selectedTask
                        )
                      )}
                    >
                      {String(
                        getEffectiveStatus(
                          selectedTask
                        )
                      ).replaceAll(
                        "_",
                        " "
                      )}
                    </Badge>
                  </div>

                  <div>
                    <span>Priority</span>

                    <Badge
                      variant={getBadgeVariant(
                        getPriority(
                          selectedTask
                        )
                      )}
                    >
                      {String(
                        getPriority(
                          selectedTask
                        )
                      ).replaceAll(
                        "_",
                        " "
                      )}
                    </Badge>
                  </div>

                  <div>
                    <span>Assigned To</span>

                    <strong>
                      {getAssignedEmployee(
                        selectedTask
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Customer</span>

                    <strong>
                      {getCustomerName(
                        selectedTask
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Due Date</span>

                    <strong>
                      {formatDate(
                        selectedTask?.dueDate ||
                          selectedTask?.deadline ||
                          selectedTask?.endDate
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Created On</span>

                    <strong>
                      {formatDate(
                        selectedTask?.createdAt
                      )}
                    </strong>
                  </div>
                </div>

                <div className="manager-task-description">
                  <span>Description</span>

                  <p>
                    {getTaskDescription(
                      selectedTask
                    ) ||
                      "No description available for this task."}
                  </p>
                </div>

                {selectedTask?.category && (
                  <div className="manager-task-meta-row">
                    <span>Category</span>
                    <strong>
                      {selectedTask.category}
                    </strong>
                  </div>
                )}

                {selectedTask?.type && (
                  <div className="manager-task-meta-row">
                    <span>Task Type</span>
                    <strong>
                      {selectedTask.type}
                    </strong>
                  </div>
                )}

                {selectedTask?.notes && (
                  <div className="manager-task-description">
                    <span>Notes</span>

                    <p>
                      {selectedTask.notes}
                    </p>
                  </div>
                )}
              </div>

              <div className="manager-task-modal-footer">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    setSelectedTask(null)
                  }
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ManagerTasksPage;