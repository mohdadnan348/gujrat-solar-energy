"use client";

import React from "react";
import Link from "next/link";
import Badge from "@/components/common/Badge";
import "./UpcomingTasks.css";

const UpcomingTasks = ({
  tasks = [],
  loading = false,
  title = "Upcoming Tasks",
  viewAllHref = "/tasks",
}) => {
  const getTaskId = (task) =>
    task?._id ||
    task?.id ||
    task?.taskId;

  const getTaskTitle = (task) =>
    task?.title ||
    task?.taskTitle ||
    task?.name ||
    "Untitled Task";

  const getAssignedTo = (task) => {
    if (typeof task?.assignedTo === "string") {
      return task.assignedTo;
    }

    return (
      task?.assignedTo?.name ||
      task?.assignedTo?.fullName ||
      task?.employee?.name ||
      "Unassigned"
    );
  };

  const getPriority = (task) =>
    task?.priority || "Medium";

  const getDueDate = (task) =>
    task?.dueDate ||
    task?.deadline ||
    task?.scheduledDate ||
    null;

  const formatDate = (date) => {
    if (!date) return "No due date";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "No due date";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const isOverdue = (date) => {
    if (!date) return false;

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return false;
    }

    return parsedDate.getTime() < Date.now();
  };

  const getPriorityVariant = (priority) => {
    const normalized = String(priority || "").toLowerCase();

    if (
      normalized === "high" ||
      normalized === "urgent"
    ) {
      return "danger";
    }

    if (normalized === "low") {
      return "secondary";
    }

    return "warning";
  };

  const formatLabel = (value) => {
    if (!value) return "";

    return String(value)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  if (loading) {
    return (
      <div className="gse-upcoming-tasks">
        <div className="gse-upcoming-tasks-header">
          <div>
            <div className="gse-upcoming-tasks-title-skeleton" />
            <div className="gse-upcoming-tasks-subtitle-skeleton" />
          </div>

          <div className="gse-upcoming-tasks-link-skeleton" />
        </div>

        <div className="gse-upcoming-tasks-list">
          {[1, 2, 3, 4].map((item) => (
            <div
              className="gse-upcoming-task-skeleton"
              key={item}
            >
              <div className="gse-upcoming-task-icon-skeleton" />

              <div className="gse-upcoming-task-content-skeleton">
                <span />
                <span />
              </div>

              <div className="gse-upcoming-task-date-skeleton" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="gse-upcoming-tasks">
      <div className="gse-upcoming-tasks-header">
        <div>
          <h3>{title}</h3>
          <p>Tasks that need your attention</p>
        </div>

        <Link
          href={viewAllHref}
          className="gse-upcoming-tasks-view-all"
        >
          View All
          <span aria-hidden="true">→</span>
        </Link>
      </div>

      {tasks.length === 0 ? (
        <div className="gse-upcoming-tasks-empty">
          <div className="gse-upcoming-tasks-empty-icon">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect
                x="3"
                y="4"
                width="18"
                height="17"
                rx="2"
              />
              <path d="M8 2v4" />
              <path d="M16 2v4" />
              <path d="M3 10h18" />
              <path d="M8 15h8" />
              <path d="M8 18h5" />
            </svg>
          </div>

          <strong>No upcoming tasks</strong>
          <span>You're all caught up.</span>
        </div>
      ) : (
        <div className="gse-upcoming-tasks-list">
          {tasks.map((task, index) => {
            const taskId = getTaskId(task);
            const dueDate = getDueDate(task);
            const overdue = isOverdue(dueDate);
            const priority = getPriority(task);

            const content = (
              <>
                <div className="gse-upcoming-task-icon">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 11l3 3L22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                </div>

                <div className="gse-upcoming-task-info">
                  <div className="gse-upcoming-task-title">
                    {getTaskTitle(task)}
                  </div>

                  <div className="gse-upcoming-task-meta">
                    <span>
                      {getAssignedTo(task)}
                    </span>

                    <span className="gse-upcoming-task-dot">
                      •
                    </span>

                    <Badge
                      variant={getPriorityVariant(priority)}
                      size="small"
                    >
                      {formatLabel(priority)}
                    </Badge>
                  </div>
                </div>

                <div
                  className={`gse-upcoming-task-date ${
                    overdue
                      ? "gse-upcoming-task-date-overdue"
                      : ""
                  }`}
                >
                  <span className="gse-upcoming-task-date-label">
                    {overdue ? "Overdue" : "Due"}
                  </span>

                  <span>
                    {formatDate(dueDate)}
                  </span>
                </div>
              </>
            );

            if (taskId) {
              return (
                <Link
                  href={`/tasks/${taskId}`}
                  className="gse-upcoming-task"
                  key={taskId}
                >
                  {content}
                </Link>
              );
            }

            return (
              <div
                className="gse-upcoming-task"
                key={index}
              >
                {content}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UpcomingTasks;