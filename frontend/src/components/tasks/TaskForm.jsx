"use client";

import React, { useEffect, useState } from "react";
import Button from "../common/Button";
import "./TaskForm.css";

const initialState = {
  title: "",
  description: "",
  assignedTo: "",
  relatedType: "",
  relatedId: "",
  priority: "medium",
  status: "pending",
  dueDate: "",
};

const TaskForm = ({
  initialData = null,
  employees = [],
  leads = [],
  customers = [],
  quotations = [],
  loading = false,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        description: initialData.description || "",
        assignedTo:
          initialData.assignedTo?._id ||
          initialData.assignedTo?.id ||
          initialData.assignedTo ||
          "",
        relatedType: initialData.relatedType || "",
        relatedId:
          initialData.relatedId?._id ||
          initialData.relatedId?.id ||
          initialData.relatedId ||
          "",
        priority: initialData.priority || "medium",
        status: initialData.status || "pending",
        dueDate: initialData.dueDate
          ? new Date(initialData.dueDate)
              .toISOString()
              .split("T")[0]
          : "",
      });
    }
  }, [initialData]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
      ...(name === "relatedType" ? { relatedId: "" } : {}),
    }));

    if (errors[name]) {
      setErrors((previous) => ({
        ...previous,
        [name]: "",
      }));
    }
  };

  const validate = () => {
    const nextErrors = {};

    if (!formData.title.trim()) {
      nextErrors.title = "Task title is required.";
    }

    if (!formData.assignedTo) {
      nextErrors.assignedTo = "Please select an employee.";
    }

    if (!formData.dueDate) {
      nextErrors.dueDate = "Due date is required.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) return;

    const payload = {
      ...formData,
      title: formData.title.trim(),
      description: formData.description.trim(),
      assignedTo: formData.assignedTo || undefined,
      relatedType: formData.relatedType || undefined,
      relatedId: formData.relatedId || undefined,
    };

    await onSubmit?.(payload);
  };

  const getRelatedOptions = () => {
    switch (formData.relatedType) {
      case "lead":
        return leads.map((lead) => ({
          id: lead._id || lead.id,
          label:
            lead.customerName ||
            lead.name ||
            lead.mobile ||
            "Lead",
        }));

      case "customer":
        return customers.map((customer) => ({
          id: customer._id || customer.id,
          label:
            customer.name ||
            customer.customerName ||
            customer.mobile ||
            "Customer",
        }));

      case "quotation":
        return quotations.map((quotation) => ({
          id: quotation._id || quotation.id,
          label:
            quotation.quotationNumber ||
            quotation.quotationNo ||
            quotation.referenceNumber ||
            "Quotation",
        }));

      default:
        return [];
    }
  };

  const relatedOptions = getRelatedOptions();

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <div className="task-form__header">
        <div>
          <h2>
            {initialData ? "Edit Task" : "Create Task"}
          </h2>
          <p>
            {initialData
              ? "Update task information and assignment."
              : "Create a new task and assign it to an employee."}
          </p>
        </div>
      </div>

      <div className="task-form__section">
        <h3>Task Information</h3>

        <div className="task-form__grid">
          <div className="task-form__field task-form__field--full">
            <label htmlFor="task-title">
              Task Title <span>*</span>
            </label>

            <input
              id="task-title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter task title"
              className={errors.title ? "has-error" : ""}
            />

            {errors.title && (
              <small className="task-form__error">
                {errors.title}
              </small>
            )}
          </div>

          <div className="task-form__field task-form__field--full">
            <label htmlFor="task-description">
              Description
            </label>

            <textarea
              id="task-description"
              name="description"
              rows="4"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter task description"
            />
          </div>

          <div className="task-form__field">
            <label htmlFor="task-priority">Priority</label>

            <select
              id="task-priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div className="task-form__field">
            <label htmlFor="task-due-date">
              Due Date <span>*</span>
            </label>

            <input
              id="task-due-date"
              name="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={handleChange}
              className={errors.dueDate ? "has-error" : ""}
            />

            {errors.dueDate && (
              <small className="task-form__error">
                {errors.dueDate}
              </small>
            )}
          </div>

          {initialData && (
            <div className="task-form__field">
              <label htmlFor="task-status">Status</label>

              <select
                id="task-status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="pending">Pending</option>
                <option value="in_progress">
                  In Progress
                </option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="task-form__section">
        <h3>Assignment</h3>

        <div className="task-form__grid">
          <div className="task-form__field">
            <label htmlFor="task-assigned-to">
              Assign To <span>*</span>
            </label>

            <select
              id="task-assigned-to"
              name="assignedTo"
              value={formData.assignedTo}
              onChange={handleChange}
              className={errors.assignedTo ? "has-error" : ""}
            >
              <option value="">Select employee</option>

              {employees.map((employee) => {
                const id = employee._id || employee.id;
                const name =
                  employee.name ||
                  employee.fullName ||
                  employee.employeeName ||
                  "Employee";

                return (
                  <option key={id} value={id}>
                    {name}
                  </option>
                );
              })}
            </select>

            {errors.assignedTo && (
              <small className="task-form__error">
                {errors.assignedTo}
              </small>
            )}
          </div>
        </div>
      </div>

      <div className="task-form__section">
        <h3>Related Record</h3>

        <div className="task-form__grid">
          <div className="task-form__field">
            <label htmlFor="task-related-type">
              Related To
            </label>

            <select
              id="task-related-type"
              name="relatedType"
              value={formData.relatedType}
              onChange={handleChange}
            >
              <option value="">None</option>
              <option value="lead">Lead</option>
              <option value="customer">Customer</option>
              <option value="quotation">Quotation</option>
            </select>
          </div>

          {formData.relatedType && (
            <div className="task-form__field">
              <label htmlFor="task-related-id">
                Select{" "}
                {formData.relatedType.charAt(0).toUpperCase() +
                  formData.relatedType.slice(1)}
              </label>

              <select
                id="task-related-id"
                name="relatedId"
                value={formData.relatedId}
                onChange={handleChange}
              >
                <option value="">
                  Select {formData.relatedType}
                </option>

                {relatedOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="task-form__actions">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          variant="primary"
          loading={loading}
          disabled={loading}
        >
          {initialData ? "Update Task" : "Create Task"}
        </Button>
      </div>
    </form>
  );
};

export default TaskForm;