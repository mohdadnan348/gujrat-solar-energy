"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import AdminLayout from "../../layout";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import Loader from "@/components/common/Loader";
import ConfirmDialog from "@/components/common/ConfirmDialog";

import { taskService } from "@/services/task.service";
import { employeeService } from "@/services/employee.service";

import "./task-details.css";

const TaskDetailsPage = () => {
  const router = useRouter();
  const params = useParams();

  const taskId = params?.id;

  const [task, setTask] = useState(null);
  const [employees, setEmployees] = useState([]);

  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);

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

  const loadTask = async () => {
    if (!taskId) return;

    try {
      setLoading(true);
      setError("");

      if (
        typeof taskService.getTaskById !==
        "function"
      ) {
        throw new Error(
          "Task details service is not available."
        );
      }

      const [
        taskResponse,
        employeesResponse,
      ] = await Promise.all([
        taskService.getTaskById(taskId),
        employeeService.getEmployees(),
      ]);

      const taskData =
        taskResponse?.data ||
        taskResponse?.task ||
        taskResponse;

      setTask(taskData);

      setEmployees(
        normalizeList(
          employeesResponse,
          "employees"
        )
      );
    } catch (err) {
      console.error(
        "Failed to load task:",
        err
      );

      setError(
        err?.message ||
          "Failed to load task details."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTask();
  }, [taskId]);

  const title = getValue(
    task,
    [
      "title",
      "taskTitle",
      "name",
      "subject",
    ],
    "Untitled Task"
  );

  const description = getValue(
    task,
    [
      "description",
      "details",
    ],
    ""
  );

  const status = String(
    getValue(
      task,
      ["status"],
      "PENDING"
    )
  ).toUpperCase();

  const priority = String(
    getValue(
      task,
      ["priority"],
      "MEDIUM"
    )
  ).toUpperCase();

  const dueDate = getValue(
    task,
    [
      "dueDate",
      "deadline",
      "endDate",
    ],
    ""
  );

  const createdAt = getValue(
    task,
    [
      "createdAt",
      "createdDate",
    ],
    ""
  );

  const updatedAt = getValue(
    task,
    [
      "updatedAt",
      "updatedDate",
    ],
    ""
  );

  const notes = getValue(
    task,
    [
      "notes",
      "remarks",
    ],
    ""
  );

  const assignedTo = getValue(
    task,
    [
      "assignedTo",
      "assignee",
      "employee",
    ],
    null
  );

  const assignedToId =
    typeof assignedTo === "object"
      ? getId(assignedTo)
      : assignedTo ||
        getValue(
          task,
          [
            "assignedToId",
            "employeeId",
          ],
          ""
        );

  const assignee = useMemo(() => {
    if (
      assignedTo &&
      typeof assignedTo === "object"
    ) {
      return assignedTo;
    }

    if (!assignedToId) {
      return null;
    }

    return (
      employees.find(
        (employee) =>
          getId(employee) ===
          assignedToId
      ) || null
    );
  }, [
    assignedTo,
    assignedToId,
    employees,
  ]);

  const assigneeName = getValue(
    assignee,
    [
      "name",
      "fullName",
      "employeeName",
    ],
    "Unassigned"
  );

  const assigneeEmail = getValue(
    assignee,
    [
      "email",
      "emailAddress",
    ],
    ""
  );

  const assigneePhone = getValue(
    assignee,
    [
      "phone",
      "mobile",
      "mobileNumber",
    ],
    ""
  );

  const taskNumber = getValue(
    task,
    [
      "taskNumber",
      "taskCode",
      "referenceNumber",
    ],
    ""
  );

  const relatedLead = getValue(
    task,
    [
      "lead",
      "leadId",
    ],
    null
  );

  const relatedCustomer = getValue(
    task,
    [
      "customer",
      "customerId",
    ],
    null
  );

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

  const formatDateTime = (
    value
  ) => {
    if (!value) return "—";

    const date = new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "—";
    }

    return date.toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const getStatusVariant = (
    value
  ) => {
    switch (value) {
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
    value
  ) => {
    switch (value) {
      case "URGENT":
      case "HIGH":
        return "danger";

      case "MEDIUM":
        return "warning";

      case "LOW":
        return "success";

      default:
        return "default";
    }
  };

  const isOverdue = useMemo(() => {
    if (!dueDate) return false;

    const due = new Date(
      dueDate
    );

    if (
      Number.isNaN(
        due.getTime()
      )
    ) {
      return false;
    }

    if (
      [
        "COMPLETED",
        "DONE",
        "CANCELLED",
      ].includes(status)
    ) {
      return false;
    }

    return due < new Date();
  }, [
    dueDate,
    status,
  ]);

  const handleDelete = async () => {
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
        taskId
      );

      router.push(
        "/admin/tasks"
      );
    } catch (err) {
      console.error(
        "Failed to delete task:",
        err
      );

      setError(
        err?.message ||
          "Failed to delete task."
      );

      setDeleteOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-task-details-loading">
          <Loader />
          <p>
            Loading task details...
          </p>
        </div>
      </AdminLayout>
    );
  }

  if (!task) {
    return (
      <AdminLayout>
        <div className="admin-task-details-page">
          <div className="admin-task-details-error-state">
            <h2>
              Task Not Found
            </h2>

            <p>
              The requested task could not
              be found.
            </p>

            <Button
              type="button"
              variant="primary"
              onClick={() =>
                router.push(
                  "/admin/tasks"
                )
              }
            >
              Back to Tasks
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-task-details-page">
        <div className="admin-task-details-header">
          <div>
            <button
              type="button"
              className="admin-task-details-back"
              onClick={() =>
                router.push(
                  "/admin/tasks"
                )
              }
            >
              ← Back to Tasks
            </button>

            <div className="admin-task-details-title-row">
              <div>
                <h1>
                  {title}
                </h1>

                {taskNumber && (
                  <span className="admin-task-reference">
                    {taskNumber}
                  </span>
                )}
              </div>

              <div className="admin-task-details-statuses">
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
              </div>
            </div>
          </div>

          <div className="admin-task-details-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                router.push(
                  `/admin/tasks/create?edit=${taskId}`
                )
              }
            >
              Edit Task
            </Button>

            <Button
              type="button"
              variant="danger"
              onClick={() =>
                setDeleteOpen(true)
              }
            >
              Delete
            </Button>
          </div>
        </div>

        {error && (
          <div className="admin-task-details-error">
            {error}
          </div>
        )}

        <div className="admin-task-details-grid">
          <div className="admin-task-details-main">
            <section className="admin-task-details-card">
              <div className="admin-task-details-card-header">
                <div>
                  <h2>
                    Task Information
                  </h2>

                  <p>
                    Task description and
                    operational details.
                  </p>
                </div>
              </div>

              <div className="admin-task-details-card-body">
                <div className="admin-task-info-block">
                  <span>
                    Description
                  </span>

                  <p>
                    {description ||
                      "No description provided."}
                  </p>
                </div>

                <div className="admin-task-info-grid">
                  <div className="admin-task-info-item">
                    <span>
                      Priority
                    </span>

                    <div>
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
                    </div>
                  </div>

                  <div className="admin-task-info-item">
                    <span>
                      Status
                    </span>

                    <div>
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
                    </div>
                  </div>

                  <div className="admin-task-info-item">
                    <span>
                      Due Date
                    </span>

                    <strong
                      className={
                        isOverdue
                          ? "overdue"
                          : ""
                      }
                    >
                      {formatDate(
                        dueDate
                      )}
                    </strong>

                    {isOverdue && (
                      <small className="admin-task-overdue-label">
                        Overdue
                      </small>
                    )}
                  </div>

                  <div className="admin-task-info-item">
                    <span>
                      Created
                    </span>

                    <strong>
                      {formatDate(
                        createdAt
                      )}
                    </strong>
                  </div>

                  <div className="admin-task-info-item">
                    <span>
                      Last Updated
                    </span>

                    <strong>
                      {formatDate(
                        updatedAt
                      )}
                    </strong>
                  </div>
                </div>
              </div>
            </section>

            <section className="admin-task-details-card">
              <div className="admin-task-details-card-header">
                <div>
                  <h2>
                    Notes
                  </h2>

                  <p>
                    Additional information
                    related to this task.
                  </p>
                </div>
              </div>

              <div className="admin-task-details-card-body">
                <div className="admin-task-notes">
                  {notes ? (
                    <p>
                      {notes}
                    </p>
                  ) : (
                    <span>
                      No additional notes
                      available.
                    </span>
                  )}
                </div>
              </div>
            </section>

            {(relatedLead ||
              relatedCustomer) && (
              <section className="admin-task-details-card">
                <div className="admin-task-details-card-header">
                  <div>
                    <h2>
                      Related Records
                    </h2>

                    <p>
                      Records connected to
                      this task.
                    </p>
                  </div>
                </div>

                <div className="admin-task-details-card-body">
                  <div className="admin-task-related-grid">
                    {relatedLead && (
                      <div className="admin-task-related-item">
                        <span>
                          Lead
                        </span>

                        <strong>
                          {typeof relatedLead ===
                          "object"
                            ? getValue(
                                relatedLead,
                                [
                                  "name",
                                  "leadNumber",
                                  "_id",
                                ],
                                "Related Lead"
                              )
                            : String(
                                relatedLead
                              )}
                        </strong>
                      </div>
                    )}

                    {relatedCustomer && (
                      <div className="admin-task-related-item">
                        <span>
                          Customer
                        </span>

                        <strong>
                          {typeof relatedCustomer ===
                          "object"
                            ? getValue(
                                relatedCustomer,
                                [
                                  "name",
                                  "customerNumber",
                                  "_id",
                                ],
                                "Related Customer"
                              )
                            : String(
                                relatedCustomer
                              )}
                        </strong>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}
          </div>

          <aside className="admin-task-details-sidebar">
            <section className="admin-task-details-card">
              <div className="admin-task-details-card-header">
                <div>
                  <h2>
                    Assigned Employee
                  </h2>

                  <p>
                    Current task assignee.
                  </p>
                </div>
              </div>

              <div className="admin-task-details-card-body">
                <div className="admin-task-assignee-profile">
                  <div className="admin-task-profile-avatar">
                    {assigneeName
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div>
                    <h3>
                      {assigneeName}
                    </h3>

                    {assigneeEmail && (
                      <a
                        href={`mailto:${assigneeEmail}`}
                      >
                        {assigneeEmail}
                      </a>
                    )}

                    {assigneePhone && (
                      <a
                        href={`tel:${assigneePhone}`}
                      >
                        {assigneePhone}
                      </a>
                    )}
                  </div>
                </div>

                {!assignee && (
                  <div className="admin-task-unassigned">
                    This task is currently
                    unassigned.
                  </div>
                )}
              </div>
            </section>

            <section className="admin-task-details-card">
              <div className="admin-task-details-card-header">
                <div>
                  <h2>
                    Task Summary
                  </h2>

                  <p>
                    Quick overview of this
                    task.
                  </p>
                </div>
              </div>

              <div className="admin-task-summary">
                <div>
                  <span>
                    Status
                  </span>

                  <strong>
                    {status.replaceAll(
                      "_",
                      " "
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Priority
                  </span>

                  <strong>
                    {priority}
                  </strong>
                </div>

                <div>
                  <span>
                    Due Date
                  </span>

                  <strong>
                    {formatDate(
                      dueDate
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Created
                  </span>

                  <strong>
                    {formatDateTime(
                      createdAt
                    )}
                  </strong>
                </div>
              </div>
            </section>
          </aside>
        </div>

        <ConfirmDialog
          isOpen={deleteOpen}
          onClose={() =>
            !deleting &&
            setDeleteOpen(false)
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

export default TaskDetailsPage;