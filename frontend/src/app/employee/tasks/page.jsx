"use client";

import React, { useEffect, useMemo, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import Button from "@/components/common/Button";
import SearchBox from "@/components/common/SearchBox";
import Select from "@/components/common/Select";
import Badge from "@/components/common/Badge";
import Pagination from "@/components/common/Pagination";
import Loader from "@/components/common/Loader";
import { useAuth } from "@/hooks/useAuth";
import taskService from "@/services/task.service";

const EmployeeTasksPage = () => {
  const { user, logout, loading: authLoading } = useAuth();

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

      const employeeId = user?._id || user?.id;

      const response = employeeId
        ? await taskService.getTasksByEmployee(employeeId)
        : await taskService.getTasks();

      const items =
        response?.data?.tasks ||
        response?.data?.items ||
        response?.tasks ||
        response?.items ||
        response?.data ||
        [];

      setTasks(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error("Failed to load employee tasks:", err);

      setError(
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
      const taskStatus =
        task?.status ||
        task?.taskStatus ||
        "";

      const taskPriority =
        task?.priority ||
        "";

      const searchableText = [
        task?.title,
        task?.taskName,
        task?.description,
        task?.category,
        task?.type,
        task?.customerName,
        task?.leadName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !query || searchableText.includes(query);

      const matchesStatus =
        !status ||
        taskStatus.toLowerCase() === status.toLowerCase();

      const matchesPriority =
        !priority ||
        taskPriority.toLowerCase() === priority.toLowerCase();

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

  const paginatedTasks = useMemo(() => {
    const start = (page - 1) * limit;

    return filteredTasks.slice(start, start + limit);
  }, [filteredTasks, page]);

  const getTaskTitle = (task) =>
    task?.title ||
    task?.taskName ||
    "Untitled Task";

  const getTaskStatus = (task) =>
    task?.status ||
    task?.taskStatus ||
    "PENDING";

  const getPriority = (task) =>
    task?.priority ||
    "NORMAL";

  const getStatusVariant = (taskStatus) => {
    const value = taskStatus.toLowerCase();

    if (
      ["completed", "done", "closed"].includes(value)
    ) {
      return "success";
    }

    if (
      ["cancelled", "cancelled_by_user", "failed"].includes(value)
    ) {
      return "danger";
    }

    if (
      ["in_progress", "ongoing", "started"].includes(value)
    ) {
      return "warning";
    }

    return "default";
  };

  const getPriorityVariant = (taskPriority) => {
    const value = taskPriority.toLowerCase();

    if (["high", "urgent", "critical"].includes(value)) {
      return "danger";
    }

    if (["medium", "normal"].includes(value)) {
      return "warning";
    }

    return "default";
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

  const handleLogout = async () => {
    await logout();
  };

  const handleViewTask = (task) => {
    const id = task?._id || task?.id;

    if (id) {
      window.location.href = `/employee/tasks/${id}`;
    }
  };

  if (authLoading) {
    return (
      <div className="employee-tasks-loading">
        <Loader />
      </div>
    );
  }

  return (
    <MainLayout
      user={user}
      onLogout={handleLogout}
      onSearch={setSearch}
      notificationCount={0}
    >
      <div className="employee-tasks-page">
        <div className="employee-tasks-header">
          <div>
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
          >
            Refresh
          </Button>
        </div>

        <div className="employee-tasks-toolbar">
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Search tasks..."
          />

          <Select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value)
            }
            options={[
              { value: "", label: "All Statuses" },
              { value: "PENDING", label: "Pending" },
              { value: "IN_PROGRESS", label: "In Progress" },
              { value: "COMPLETED", label: "Completed" },
              { value: "CANCELLED", label: "Cancelled" },
            ]}
          />

          <Select
            value={priority}
            onChange={(event) =>
              setPriority(event.target.value)
            }
            options={[
              { value: "", label: "All Priorities" },
              { value: "LOW", label: "Low" },
              { value: "NORMAL", label: "Normal" },
              { value: "MEDIUM", label: "Medium" },
              { value: "HIGH", label: "High" },
              { value: "URGENT", label: "Urgent" },
            ]}
          />
        </div>

        {error && (
          <div className="employee-tasks-error">
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

        <div className="employee-tasks-card">
          {loading ? (
            <div className="employee-tasks-loader">
              <Loader />
            </div>
          ) : paginatedTasks.length === 0 ? (
            <div className="employee-tasks-empty">
              <div className="employee-tasks-empty-icon">
                ✓
              </div>

              <h3>No tasks found</h3>

              <p>
                {search || status || priority
                  ? "Try changing your search or filters."
                  : "You don't have any assigned tasks yet."}
              </p>
            </div>
          ) : (
            <>
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
                        task?._id ||
                        task?.id ||
                        index;

                      const taskStatus =
                        getTaskStatus(task);

                      const taskPriority =
                        getPriority(task);

                      return (
                        <tr key={id}>
                          <td>
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
                          </td>

                          <td>
                            {task?.customerName ||
                              task?.customer?.name ||
                              task?.leadName ||
                              task?.lead?.name ||
                              "—"}
                          </td>

                          <td>
                            <Badge
                              variant={getPriorityVariant(
                                taskPriority
                              )}
                            >
                              {taskPriority.replaceAll(
                                "_",
                                " "
                              )}
                            </Badge>
                          </td>

                          <td>
                            <Badge
                              variant={getStatusVariant(
                                taskStatus
                              )}
                            >
                              {taskStatus.replaceAll(
                                "_",
                                " "
                              )}
                            </Badge>
                          </td>

                          <td>
                            {formatDate(
                              task?.dueDate ||
                                task?.deadline ||
                                task?.endDate
                            )}
                          </td>

                          <td>
                            {formatDate(
                              task?.createdAt ||
                                task?.createdDate
                            )}
                          </td>

                          <td>
                            <Button
                              type="button"
                              variant="secondary"
                              onClick={() =>
                                handleViewTask(task)
                              }
                            >
                              View
                            </Button>
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
    </MainLayout>
  );
};

export default EmployeeTasksPage;