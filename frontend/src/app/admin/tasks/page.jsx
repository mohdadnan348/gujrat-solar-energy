"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import AdminLayout from "../layout";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import SearchBox from "@/components/common/SearchBox";
import Pagination from "@/components/common/Pagination";
import Loader from "@/components/common/Loader";
import Select from "@/components/common/Select";
import ConfirmDialog from "@/components/common/ConfirmDialog";

import  taskService  from "@/services/task.service";

import { getEmployees } from "@/services/employee.service";
import "./tasks.css";

const AdminTasksPage = () => {
  const router = useRouter();

  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] =
    useState("ALL");
  const [assigneeFilter, setAssigneeFilter] =
    useState("ALL");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const getValue = (
    object,
    keys,
    fallback = ""
  ) => {
    if (!object) return fallback;

    for (const key of keys) {
      const value = object?.[key];

      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        return value;
      }
    }

    return fallback;
  };

  const getId = (object) => {
    if (!object) return "";

    if (typeof object === "string") {
      return object;
    }

    return (
      object?._id ||
      object?.id ||
      object?.employeeId ||
      object?.taskId ||
      ""
    );
  };

  const normalizeList = (
    response,
    key
  ) => {
    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response?.data)) {
      return response.data;
    }

    if (
      key &&
      Array.isArray(response?.data?.[key])
    ) {
      return response.data[key];
    }

    if (
      key &&
      Array.isArray(response?.[key])
    ) {
      return response[key];
    }

    if (Array.isArray(response?.results)) {
      return response.results;
    }

    return [];
  };

  const loadData = async (
    showRefresh = false
  ) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const [
        tasksResponse,
        employeesResponse,
      ] = await Promise.all([
        taskService.getTasks(),
       getEmployees(),
      ]);

      setTasks(
        normalizeList(
          tasksResponse,
          "tasks"
        )
      );

      setEmployees(
        normalizeList(
          employeesResponse,
          "employees"
        )
      );
    } catch (err) {
      console.error(
        "Failed to load tasks:",
        err
      );

      setError(
        err?.message ||
          "Failed to load tasks."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    statusFilter,
    priorityFilter,
    assigneeFilter,
    itemsPerPage,
  ]);

  const getTaskTitle = (task) =>
    getValue(
      task,
      [
        "title",
        "taskTitle",
        "name",
        "subject",
      ],
      "Untitled Task"
    );

  const getTaskDescription = (task) =>
    getValue(
      task,
      [
        "description",
        "details",
      ],
      ""
    );

  const getStatus = (task) =>
    String(
      getValue(
        task,
        ["status"],
        "PENDING"
      )
    ).toUpperCase();

  const getPriority = (task) =>
    String(
      getValue(
        task,
        ["priority"],
        "MEDIUM"
      )
    ).toUpperCase();

  const getDueDate = (task) =>
    getValue(
      task,
      [
        "dueDate",
        "deadline",
        "endDate",
      ],
      ""
    );

  const getCreatedDate = (task) =>
    getValue(
      task,
      ["createdAt", "createdDate"],
      ""
    );

  const getAssignee = (task) => {
    const assignedTo =
      getValue(
        task,
        [
          "assignedTo",
          "assignee",
          "employee",
        ],
        null
      );

    if (
      assignedTo &&
      typeof assignedTo === "object"
    ) {
      return assignedTo;
    }

    const assignedId =
      typeof assignedTo === "string"
        ? assignedTo
        : getValue(
            task,
            [
              "assignedToId",
              "employeeId",
            ],
            ""
          );

    if (assignedId) {
      return (
        employees.find(
          (employee) =>
            getId(employee) ===
            assignedId
        ) || null
      );
    }

    return null;
  };

  const getAssigneeName = (task) => {
    const assignee =
      getAssignee(task);

    if (assignee) {
      return getValue(
        assignee,
        [
          "name",
          "fullName",
          "employeeName",
        ],
        "Unassigned"
      );
    }

    return "Unassigned";
  };

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "—";
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const isOverdue = (task) => {
    const dueDate = getDueDate(task);

    if (!dueDate) return false;

    const due = new Date(dueDate);

    if (
      Number.isNaN(
        due.getTime()
      )
    ) {
      return false;
    }

    const status = getStatus(task);

    if (
      [
        "COMPLETED",
        "CANCELLED",
        "DONE",
      ].includes(status)
    ) {
      return false;
    }

    return due < new Date();
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case "COMPLETED":
      case "DONE":
        return "success";

      case "IN_PROGRESS":
      case "IN PROGRESS":
        return "info";

      case "PENDING":
      case "TODO":
        return "warning";

      case "CANCELLED":
        return "danger";

      default:
        return "default";
    }
  };

  const getPriorityVariant = (
    priority
  ) => {
    switch (priority) {
      case "HIGH":
      case "URGENT":
        return "danger";

      case "MEDIUM":
        return "warning";

      case "LOW":
        return "success";

      default:
        return "default";
    }
  };

  const filteredTasks = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return tasks.filter((task) => {
      const status =
        getStatus(task);

      const priority =
        getPriority(task);

      const assignee =
        getAssignee(task);

      const assigneeId =
        getId(assignee) ||
        getValue(
          task,
          [
            "assignedToId",
            "employeeId",
          ],
          ""
        );

      if (
        statusFilter !== "ALL" &&
        status !== statusFilter
      ) {
        return false;
      }

      if (
        priorityFilter !== "ALL" &&
        priority !== priorityFilter
      ) {
        return false;
      }

      if (
        assigneeFilter !== "ALL" &&
        assigneeId !== assigneeFilter
      ) {
        return false;
      }

      if (!query) {
        return true;
      }

      const searchableText = [
        getTaskTitle(task),
        getTaskDescription(task),
        getAssigneeName(task),
        status,
        priority,
        getValue(task, [
          "taskNumber",
          "taskId",
        ]),
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(
        query
      );
    });
  }, [
    tasks,
    employees,
    search,
    statusFilter,
    priorityFilter,
    assigneeFilter,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredTasks.length /
        itemsPerPage
    )
  );

  const paginatedTasks = useMemo(() => {
    const start =
      (currentPage - 1) *
      itemsPerPage;

    return filteredTasks.slice(
      start,
      start + itemsPerPage
    );
  }, [
    filteredTasks,
    currentPage,
    itemsPerPage,
  ]);

  const stats = useMemo(() => {
    const total = tasks.length;

    const pending = tasks.filter(
      (task) =>
        ["PENDING", "TODO"].includes(
          getStatus(task)
        )
    ).length;

    const inProgress = tasks.filter(
      (task) =>
        [
          "IN_PROGRESS",
          "IN PROGRESS",
        ].includes(
          getStatus(task)
        )
    ).length;

    const completed = tasks.filter(
      (task) =>
        ["COMPLETED", "DONE"].includes(
          getStatus(task)
        )
    ).length;

    const overdue = tasks.filter(
      (task) => isOverdue(task)
    ).length;

    return {
      total,
      pending,
      inProgress,
      completed,
      overdue,
    };
  }, [tasks]);

  const employeeOptions = [
    {
      label: "All Assignees",
      value: "ALL",
    },
    ...employees.map(
      (employee) => ({
        label: getValue(
          employee,
          [
            "name",
            "fullName",
            "employeeName",
          ],
          "Unnamed Employee"
        ),
        value: getId(employee),
      })
    ),
  ];

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setDeleting(true);
      setError("");

      if (
        typeof taskService.deleteTask !==
        "function"
      ) {
        throw new Error(
          "Task delete service is not available."
        );
      }

      await taskService.deleteTask(
        deleteId
      );

      setTasks((previous) =>
        previous.filter(
          (task) =>
            getId(task) !==
            deleteId
        )
      );

      setDeleteId(null);
    } catch (err) {
      console.error(
        "Failed to delete task:",
        err
      );

      setError(
        err?.message ||
          "Failed to delete task."
      );
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-tasks-loading">
          <Loader />
          <p>
            Loading tasks...
          </p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-tasks-page">
        {/* Header */}
        <div className="admin-tasks-page-header">
          <div>
            <h1>
              Tasks
            </h1>

            <p>
              Manage assignments, deadlines and
              operational tasks.
            </p>
          </div>

          <div className="admin-tasks-header-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                loadData(true)
              }
              disabled={refreshing}
            >
              {refreshing
                ? "Refreshing..."
                : "↻ Refresh"}
            </Button>

            <Button
              type="button"
              variant="primary"
              onClick={() =>
                router.push(
                  "/admin/tasks/create"
                )
              }
            >
              + Create Task
            </Button>
          </div>
        </div>

        {error && (
          <div className="admin-tasks-error">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="admin-tasks-stats">
          <div className="admin-task-stat-card">
            <div className="admin-task-stat-icon">
              TS
            </div>

            <div>
              <span>
                Total Tasks
              </span>

              <strong>
                {stats.total}
              </strong>
            </div>
          </div>

          <div className="admin-task-stat-card">
            <div className="admin-task-stat-icon pending">
              P
            </div>

            <div>
              <span>
                Pending
              </span>

              <strong>
                {stats.pending}
              </strong>
            </div>
          </div>

          <div className="admin-task-stat-card">
            <div className="admin-task-stat-icon progress">
              IP
            </div>

            <div>
              <span>
                In Progress
              </span>

              <strong>
                {stats.inProgress}
              </strong>
            </div>
          </div>

          <div className="admin-task-stat-card">
            <div className="admin-task-stat-icon completed">
              ✓
            </div>

            <div>
              <span>
                Completed
              </span>

              <strong>
                {stats.completed}
              </strong>
            </div>
          </div>

          <div className="admin-task-stat-card">
            <div className="admin-task-stat-icon overdue">
              !
            </div>

            <div>
              <span>
                Overdue
              </span>

              <strong>
                {stats.overdue}
              </strong>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="admin-tasks-toolbar">
          <div className="admin-tasks-search">
            <SearchBox
              value={search}
              onChange={setSearch}
              placeholder="Search tasks..."
            />
          </div>

          <div className="admin-tasks-filters">
            <Select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event?.target
                    ? event.target.value
                    : event
                )
              }
              options={[
                {
                  label: "All Status",
                  value: "ALL",
                },
                {
                  label: "Pending",
                  value: "PENDING",
                },
                {
                  label: "In Progress",
                  value: "IN_PROGRESS",
                },
                {
                  label: "Completed",
                  value: "COMPLETED",
                },
                {
                  label: "Cancelled",
                  value: "CANCELLED",
                },
              ]}
            />

            <Select
              value={priorityFilter}
              onChange={(event) =>
                setPriorityFilter(
                  event?.target
                    ? event.target.value
                    : event
                )
              }
              options={[
                {
                  label: "All Priorities",
                  value: "ALL",
                },
                {
                  label: "Urgent",
                  value: "URGENT",
                },
                {
                  label: "High",
                  value: "HIGH",
                },
                {
                  label: "Medium",
                  value: "MEDIUM",
                },
                {
                  label: "Low",
                  value: "LOW",
                },
              ]}
            />

            <Select
              value={assigneeFilter}
              onChange={(event) =>
                setAssigneeFilter(
                  event?.target
                    ? event.target.value
                    : event
                )
              }
              options={
                employeeOptions
              }
            />

            <Select
              value={String(
                itemsPerPage
              )}
              onChange={(event) =>
                setItemsPerPage(
                  Number(
                    event?.target
                      ? event.target.value
                      : event
                  )
                )
              }
              options={[
                {
                  label: "10 / page",
                  value: "10",
                },
                {
                  label: "25 / page",
                  value: "25",
                },
                {
                  label: "50 / page",
                  value: "50",
                },
              ]}
            />
          </div>
        </div>

        {/* Task Table */}
        <div className="admin-tasks-card">
          <div className="admin-tasks-card-header">
            <div>
              <h2>
                Task Records
              </h2>

              <p>
                {filteredTasks.length}{" "}
                task
                {filteredTasks.length !==
                1
                  ? "s"
                  : ""}{" "}
                found
              </p>
            </div>
          </div>

          {paginatedTasks.length ===
          0 ? (
            <div className="admin-tasks-empty">
              <div className="admin-tasks-empty-icon">
                TS
              </div>

              <h3>
                No tasks found
              </h3>

              <p>
                {search ||
                statusFilter !==
                  "ALL" ||
                priorityFilter !==
                  "ALL" ||
                assigneeFilter !==
                  "ALL"
                  ? "Try changing your filters or search."
                  : "Create your first task to get started."}
              </p>

              {!search &&
                statusFilter ===
                  "ALL" &&
                priorityFilter ===
                  "ALL" &&
                assigneeFilter ===
                  "ALL" && (
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() =>
                      router.push(
                        "/admin/tasks/create"
                      )
                    }
                  >
                    + Create Task
                  </Button>
                )}
            </div>
          ) : (
            <>
              <div className="admin-tasks-table-wrapper">
                <table className="admin-tasks-table">
                  <thead>
                    <tr>
                      <th>
                        Task
                      </th>

                      <th>
                        Assigned To
                      </th>

                      <th>
                        Priority
                      </th>

                      <th>
                        Due Date
                      </th>

                      <th>
                        Status
                      </th>

                      <th>
                        Created
                      </th>

                      <th>
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedTasks.map(
                      (
                        task,
                        index
                      ) => {
                        const id =
                          getId(task);

                        const status =
                          getStatus(
                            task
                          );

                        const priority =
                          getPriority(
                            task
                          );

                        const overdue =
                          isOverdue(
                            task
                          );

                        return (
                          <tr
                            key={
                              id ||
                              index
                            }
                            className={
                              overdue
                                ? "is-overdue"
                                : ""
                            }
                          >
                            <td>
                              <div className="admin-task-title-cell">
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

                                {getValue(
                                  task,
                                  [
                                    "taskNumber",
                                  ],
                                  ""
                                ) && (
                                  <small>
                                    {getValue(
                                      task,
                                      [
                                        "taskNumber",
                                      ]
                                    )}
                                  </small>
                                )}
                              </div>
                            </td>

                            <td>
                              <div className="admin-task-assignee">
                                <div className="admin-task-avatar">
                                  {String(
                                    getAssigneeName(
                                      task
                                    )
                                  )
                                    .charAt(
                                      0
                                    )
                                    .toUpperCase()}
                                </div>

                                <span>
                                  {getAssigneeName(
                                    task
                                  )}
                                </span>
                              </div>
                            </td>

                            <td>
                              <Badge
                                variant={getPriorityVariant(
                                  priority
                                )}
                              >
                                {priority.replaceAll(
                                  "_",
                                  " "
                                )}
                              </Badge>
                            </td>

                            <td>
                              <div
                                className={`admin-task-due-date ${
                                  overdue
                                    ? "overdue"
                                    : ""
                                }`}
                              >
                                <span>
                                  {formatDate(
                                    getDueDate(
                                      task
                                    )
                                  )}
                                </span>

                                {overdue && (
                                  <small>
                                    Overdue
                                  </small>
                                )}
                              </div>
                            </td>

                            <td>
                              <Badge
                                variant={getStatusVariant(
                                  status
                                )}
                              >
                                {status.replaceAll(
                                  "_",
                                  " "
                                )}
                              </Badge>
                            </td>

                            <td>
                              <span className="admin-task-created-date">
                                {formatDate(
                                  getCreatedDate(
                                    task
                                  )
                                )}
                              </span>
                            </td>

                            <td>
                              <div className="admin-task-actions">
                                <button
                                  type="button"
                                  className="admin-task-action-button view"
                                  onClick={() =>
                                    router.push(
                                      `/admin/tasks/${id}`
                                    )
                                  }
                                  disabled={!id}
                                >
                                  View
                                </button>

                                <button
                                  type="button"
                                  className="admin-task-action-button edit"
                                  onClick={() =>
                                    router.push(
                                      `/admin/tasks/create?edit=${id}`
                                    )
                                  }
                                  disabled={!id}
                                >
                                  Edit
                                </button>

                                <button
                                  type="button"
                                  className="admin-task-action-button delete"
                                  onClick={() =>
                                    setDeleteId(
                                      id
                                    )
                                  }
                                  disabled={!id}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>

              <div className="admin-tasks-pagination">
                <Pagination
                  currentPage={
                    currentPage
                  }
                  totalPages={
                    totalPages
                  }
                  onPageChange={(page) =>
                    setCurrentPage(
                      page
                    )
                  }
                />
              </div>
            </>
          )}
        </div>

        <ConfirmDialog
          isOpen={Boolean(
            deleteId
          )}
          onClose={() =>
            !deleting &&
            setDeleteId(null)
          }
          onConfirm={
            handleDelete
          }
          title="Delete Task"
          message="Are you sure you want to delete this task? This action cannot be undone."
          confirmText={
            deleting
              ? "Deleting..."
              : "Delete Task"
          }
          cancelText="Cancel"
          loading={deleting}
          danger
        />
      </div>
    </AdminLayout>
  );
};

export default AdminTasksPage;