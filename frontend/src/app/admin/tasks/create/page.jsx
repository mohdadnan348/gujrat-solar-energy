"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import AdminLayout from "../../layout";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import Textarea from "@/components/common/Textarea";
import Loader from "@/components/common/Loader";

import taskService  from "@/services/task.service";
import { getEmployees } from "@/services/employee.service";import { employeeService } from "@/services/employee.service";

import "./create-task.css";

const CreateTaskPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const editId = searchParams.get("edit");
  const isEditMode = Boolean(editId);

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    assignedTo: "",
   priority: "Medium",
    status: "Pending",
    dueDate: "",
    notes: "",
  });

  const [errors, setErrors] = useState({});

  const getId = (item) => {
    if (!item) return "";

    if (typeof item === "string") {
      return item;
    }

    return (
      item?._id ||
      item?.id ||
      item?.employeeId ||
      ""
    );
  };

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

  const normalizeDateForInput = (
    value
  ) => {
    if (!value) return "";

    const date = new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "";
    }

    const year =
      date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const employeeResponse =
        await getEmployees();

      setEmployees(
        normalizeList(
          employeeResponse,
          "employees"
        )
      );

      if (isEditMode) {
        if (
          typeof taskService.getTaskById !==
          "function"
        ) {
          throw new Error(
            "Task details service is not available."
          );
        }

        const taskResponse =
          await taskService.getTaskById(
            editId
          );

        const task =
          taskResponse?.data ||
          taskResponse?.task ||
          taskResponse;

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

        setForm({
          title: getValue(
            task,
            [
              "title",
              "taskTitle",
              "name",
              "subject",
            ]
          ),
          description:
            getValue(
              task,
              [
                "description",
                "details",
              ]
            ),
          assignedTo:
            assignedToId,
         priority: String(
  getValue(
    task,
    ["priority"],
    "Medium"
  )
),
          status:
            String(
              getValue(
                task,
                ["status"],
                "Pending"
              )
            ).toUpperCase(),
          dueDate:
            normalizeDateForInput(
              getValue(
                task,
                [
                  "dueDate",
                  "deadline",
                  "endDate",
                ]
              )
            ),
          notes:
            getValue(
              task,
              ["notes", "remarks"]
            ),
        });
      }
    } catch (err) {
      console.error(
        "Failed to load task form:",
        err
      );

      setError(
        err?.message ||
          "Failed to load task information."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [editId]);

  const employeeOptions = useMemo(
    () => [
      {
        label: "Select employee",
        value: "",
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
    ],
    [employees]
  );

  const updateField = (
    field,
    value
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [field]: "",
    }));

    setError("");
    setSuccess("");
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.title.trim()) {
      nextErrors.title =
        "Task title is required.";
    }

    if (!form.assignedTo) {
      nextErrors.assignedTo =
        "Please select an employee.";
    }

    if (!form.dueDate) {
      nextErrors.dueDate =
        "Due date is required.";
    }

    setErrors(nextErrors);

    return (
      Object.keys(nextErrors)
        .length === 0
    );
  };

  const buildPayload = () => {
    return {
      title: form.title.trim(),
      description:
        form.description.trim(),
      assignedTo: form.assignedTo,
      priority: form.priority,
      status: form.status,
      dueDate: form.dueDate,
      notes: form.notes.trim(),
    };
  };

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const payload =
        buildPayload();

      if (isEditMode) {
        if (
          typeof taskService.updateTask !==
          "function"
        ) {
          throw new Error(
            "Task update service is not available."
          );
        }

        await taskService.updateTask(
          editId,
          payload
        );

        setSuccess(
          "Task updated successfully."
        );
      } else {
        if (
          typeof taskService.createTask !==
          "function"
        ) {
          throw new Error(
            "Task creation service is not available."
          );
        }

        await taskService.createTask(
          payload
        );

        setSuccess(
          "Task created successfully."
        );
      }

      setTimeout(() => {
        router.push(
          "/admin/tasks"
        );
      }, 700);
    } catch (err) {
      console.error(
        "Failed to save task:",
        err
      );

      setError(
        err?.message ||
          `Failed to ${
            isEditMode
              ? "update"
              : "create"
          } task.`
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(
      "/admin/tasks"
    );
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-create-task-loading">
          <Loader />
          <p>
            Loading task form...
          </p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-create-task-page">
        <div className="admin-create-task-header">
          <div>
            <button
              type="button"
              className="admin-create-task-back"
              onClick={
                handleCancel
              }
            >
              ← Back to Tasks
            </button>

            <h1>
              {isEditMode
                ? "Edit Task"
                : "Create Task"}
            </h1>

            <p>
              {isEditMode
                ? "Update task details and assignment."
                : "Create and assign a new operational task."}
            </p>
          </div>
        </div>

        {error && (
          <div className="admin-create-task-error">
            {error}
          </div>
        )}

        {success && (
          <div className="admin-create-task-success">
            {success}
          </div>
        )}

        <form
          className="admin-create-task-form"
          onSubmit={
            handleSubmit
          }
        >
          <div className="admin-create-task-card">
            <div className="admin-create-task-card-header">
              <div>
                <h2>
                  Task Information
                </h2>

                <p>
                  Enter the basic details
                  for this task.
                </p>
              </div>
            </div>

            <div className="admin-create-task-card-body">
              <div className="admin-create-task-grid">
                <div className="admin-create-task-field full-width">
                  <Input
                    label="Task Title"
                    name="title"
                    value={
                      form.title
                    }
                    onChange={(event) =>
                      updateField(
                        "title",
                        event
                          .target
                          .value
                      )
                    }
                    placeholder="Enter task title"
                    required
                    error={
                      errors.title
                    }
                  />
                </div>

                <div className="admin-create-task-field full-width">
                  <Textarea
                    label="Description"
                    name="description"
                    value={
                      form.description
                    }
                    onChange={(event) =>
                      updateField(
                        "description",
                        event
                          .target
                          .value
                      )
                    }
                    placeholder="Describe the task and expected outcome"
                    rows={5}
                  />
                </div>

                <div className="admin-create-task-field">
                  <Select
                    label="Assign To"
                    name="assignedTo"
                    value={
                      form.assignedTo
                    }
                    onChange={(event) =>
                      updateField(
                        "assignedTo",
                        event?.target
                          ? event.target
                              .value
                          : event
                      )
                    }
                    options={
                      employeeOptions
                    }
                    required
                    error={
                      errors.assignedTo
                    }
                  />
                </div>

                <div className="admin-create-task-field">
                  <Select
                    label="Priority"
                    name="priority"
                    value={
                      form.priority
                    }
                    onChange={(event) =>
                      updateField(
                        "priority",
                        event?.target
                          ? event.target
                              .value
                          : event
                      )
                    }
                    options={[
                     {
  label: "Urgent",
  value: "Urgent",
},
{
  label: "High",
  value: "High",
},
{
  label: "Medium",
  value: "Medium",
},
{
  label: "Low",
  value: "LOw",
},
                    ]}
                  />
                </div>

                <div className="admin-create-task-field">
                  <Select
                    label="Status"
                    name="status"
                    value={
                      form.status
                    }
                    onChange={(event) =>
                      updateField(
                        "status",
                        event?.target
                          ? event.target
                              .value
                          : event
                      )
                    }
                    options={[
                      {
                        label: "Pending",
                        value: "Pending",
                      },
                      {
                        label: "In Progress",
                        value:
                          "In Progress",
                      },
                      {
                        label: "Completed",
                        value:
                          "Completed",
                      },
                      {
                        label: "Cancelled",
                        value:
                          "Cancelled",
                      },
                    ]}
                  />
                </div>

                <div className="admin-create-task-field">
                  <Input
                    label="Due Date"
                    name="dueDate"
                    type="date"
                    value={
                      form.dueDate
                    }
                    onChange={(event) =>
                      updateField(
                        "dueDate",
                        event
                          .target
                          .value
                      )
                    }
                    required
                    error={
                      errors.dueDate
                    }
                  />
                </div>

                <div className="admin-create-task-field full-width">
                  <Textarea
                    label="Notes"
                    name="notes"
                    value={
                      form.notes
                    }
                    onChange={(event) =>
                      updateField(
                        "notes",
                        event
                          .target
                          .value
                      )
                    }
                    placeholder="Add any additional notes"
                    rows={4}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="admin-create-task-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={
                handleCancel
              }
              disabled={
                submitting
              }
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              disabled={
                submitting
              }
            >
              {submitting
                ? isEditMode
                  ? "Updating..."
                  : "Creating..."
                : isEditMode
                ? "Update Task"
                : "Create Task"}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default CreateTaskPage;
