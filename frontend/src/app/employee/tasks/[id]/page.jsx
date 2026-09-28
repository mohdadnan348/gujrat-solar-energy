"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import Loader from "@/components/common/Loader";

import { useAuth } from "@/hooks/useAuth";
import taskService from "@/services/task.service";

import "./task-details.css";

const EmployeeTaskDetailsPage = () => {
  const { user, loading: authLoading } = useAuth();
  const params = useParams();

  const taskId = params?.id;

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTask = async () => {
    if (!taskId) return;

    try {
      setLoading(true);
      setError("");

      const response =
        await taskService.getTaskById(taskId);

      const data =
        response?.data?.data ??
        response?.data ??
        response?.task ??
        null;

      setTask(data);
    } catch (err) {
      console.error(
        "Failed to load task:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load task details."
      );

      setTask(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user && taskId) {
      loadTask();
    }
  }, [authLoading, user, taskId]);

  const formatLabel = (value) => {
    if (!value) return "—";

    return String(value)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
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

  const formatDateTime = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
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

  const getStatusVariant = (status) => {
    const value = String(
      status || ""
    ).toLowerCase();

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

  const getPriorityVariant = (priority) => {
    const value = String(
      priority || ""
    ).toLowerCase();

    if (
      [
        "high",
        "urgent",
        "critical",
      ].includes(value)
    ) {
      return "danger";
    }

    if (
      [
        "medium",
        "normal",
      ].includes(value)
    ) {
      return "warning";
    }

    return "default";
  };

  if (authLoading || loading) {
    return (
      <div className="employee-task-details-loading">
        <Loader />
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="employee-task-details-page">
        <div className="employee-task-details-error">
          <div className="employee-task-details-error-icon">
            !
          </div>

          <h2>
            Unable to load task
          </h2>

          <p>
            {error ||
              "The requested task could not be found."}
          </p>

          <div className="employee-task-details-error-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={loadTask}
            >
              Retry
            </Button>

            <Link
              href="/employee/tasks"
              className="employee-task-back-button"
            >
              Back to Tasks
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const title =
    task?.title ||
    task?.taskName ||
    "Untitled Task";

  const taskNumber =
    task?.taskNumber ||
    task?.taskId ||
    "Task";

  const status =
    task?.status ||
    task?.taskStatus ||
    "Pending";

  const priority =
    task?.priority ||
    "Normal";

  const description =
    task?.description ||
    "No description available.";

  const relatedCustomer =
    task?.customer?.name ||
    task?.customerName ||
    "—";

  const relatedLead =
    task?.lead?.name ||
    task?.leadName ||
    "—";

  const quotationNumber =
    task?.quotation?.quotationNumber ||
    task?.quotationNumber ||
    "—";

  const dueDate =
    task?.dueDate ||
    task?.deadline ||
    task?.endDate;

  const assignedEmployee =
    task?.assignedTo?.name ||
    task?.assignedTo?.employeeId ||
    task?.assignedTo?.username ||
    "You";

  return (
    <div className="employee-task-details-page">

      {/* Header */}
      <div className="employee-task-details-header">

        <div>
          <Link
            href="/employee/tasks"
            className="employee-task-details-back"
          >
            <span>←</span>
            Back to Tasks
          </Link>

          <span className="employee-task-details-eyebrow">
            Work Management
          </span>

          <div className="employee-task-details-title-row">
            <div>
              <h1>{title}</h1>

              <p>
                #{taskNumber}
              </p>
            </div>

            <div className="employee-task-details-badges">
              <Badge
                variant={getPriorityVariant(
                  priority
                )}
              >
                {formatLabel(priority)}
              </Badge>

              <Badge
                variant={getStatusVariant(
                  status
                )}
              >
                {formatLabel(status)}
              </Badge>
            </div>
          </div>
        </div>

        <Button
          type="button"
          variant="secondary"
          onClick={loadTask}
        >
          Refresh
        </Button>
      </div>

      {/* Main Grid */}
      <div className="employee-task-details-grid">

        {/* Main Information */}
        <div className="employee-task-details-main">

          <section className="employee-task-details-card">
            <div className="employee-task-details-card-header">
              <div>
                <h2>
                  Task Details
                </h2>

                <p>
                  Information about this assigned task.
                </p>
              </div>
            </div>

            <div className="employee-task-description">
              <span>
                Description
              </span>

              <p>
                {description}
              </p>
            </div>

            {task?.comments && (
              <div className="employee-task-description">
                <span>
                  Comments
                </span>

                <p>
                  {task.comments}
                </p>
              </div>
            )}
          </section>

          {/* Related Records */}
          <section className="employee-task-details-card">
            <div className="employee-task-details-card-header">
              <div>
                <h2>
                  Related Records
                </h2>

                <p>
                  Business records connected with this task.
                </p>
              </div>
            </div>

            <div className="employee-task-related-grid">

              <div className="employee-task-related-item">
                <span>
                  Customer
                </span>

                <strong>
                  {relatedCustomer}
                </strong>
              </div>

              <div className="employee-task-related-item">
                <span>
                  Lead
                </span>

                <strong>
                  {relatedLead}
                </strong>
              </div>

              <div className="employee-task-related-item">
                <span>
                  Quotation
                </span>

                <strong>
                  {quotationNumber}
                </strong>
              </div>

              <div className="employee-task-related-item">
                <span>
                  Category
                </span>

                <strong>
                  {task?.category ||
                    task?.type ||
                    "—"}
                </strong>
              </div>

            </div>
          </section>

          {/* Activity */}
          <section className="employee-task-details-card">

            <div className="employee-task-details-card-header">
              <div>
                <h2>
                  Task Timeline
                </h2>

                <p>
                  Important task dates.
                </p>
              </div>
            </div>

            <div className="employee-task-timeline">

              <div className="employee-task-timeline-item">
                <div className="employee-task-timeline-dot" />

                <div>
                  <strong>
                    Task Created
                  </strong>

                  <span>
                    {formatDateTime(
                      task?.createdAt ||
                        task?.createdDate
                    )}
                  </span>
                </div>
              </div>

              <div className="employee-task-timeline-item">
                <div className="employee-task-timeline-dot" />

                <div>
                  <strong>
                    Due Date
                  </strong>

                  <span>
                    {formatDate(
                      dueDate
                    )}
                  </span>
                </div>
              </div>

              {task?.completedAt && (
                <div className="employee-task-timeline-item">
                  <div className="employee-task-timeline-dot completed" />

                  <div>
                    <strong>
                      Completed
                    </strong>

                    <span>
                      {formatDateTime(
                        task.completedAt
                      )}
                    </span>
                  </div>
                </div>
              )}

            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="employee-task-details-sidebar">

          <section className="employee-task-details-card">

            <div className="employee-task-details-card-header">
              <div>
                <h2>
                  Task Summary
                </h2>
              </div>
            </div>

            <div className="employee-task-summary-list">

              <div>
                <span>
                  Task ID
                </span>

                <strong>
                  #{taskNumber}
                </strong>
              </div>

              <div>
                <span>
                  Assigned To
                </span>

                <strong>
                  {assignedEmployee}
                </strong>
              </div>

              <div>
                <span>
                  Priority
                </span>

                <Badge
                  variant={getPriorityVariant(
                    priority
                  )}
                >
                  {formatLabel(priority)}
                </Badge>
              </div>

              <div>
                <span>
                  Status
                </span>

                <Badge
                  variant={getStatusVariant(
                    status
                  )}
                >
                  {formatLabel(status)}
                </Badge>
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
                  {formatDate(
                    task?.createdAt ||
                      task?.createdDate
                  )}
                </strong>
              </div>

            </div>
          </section>

          <section className="employee-task-details-card employee-task-help-card">

            <div className="employee-task-help-icon">
              ?
            </div>

            <h3>
              Need help?
            </h3>

            <p>
              If you have any issue with this task,
              contact your manager or administrator.
            </p>

          </section>

        </aside>

      </div>
    </div>
  );
};

export default EmployeeTaskDetailsPage;