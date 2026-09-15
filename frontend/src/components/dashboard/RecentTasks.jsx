"use client";

import React from "react";
import Link from "next/link";
import Badge from "@/components/common/Badge";
import "./RecentTasks.css";

const RecentTasks = ({
  tasks = [],
  loading = false,
  title = "Recent Tasks",
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

  const getStatus = (task) =>
    task?.status ||
    task?.taskStatus ||
    "Pending";

  const getPriority = (task) =>
    task?.priority ||
    "Medium";

  const getStatusVariant = (status) => {
    const normalized = String(status || "").toLowerCase();

    if (
      normalized.includes("completed") ||
      normalized.includes("complete") ||
      normalized.includes("done")
    ) {
      return "success";
    }

    if (
      normalized.includes("cancelled") ||
      normalized.includes("cancel")
    ) {
      return "danger";
    }

    if (
      normalized.includes("progress") ||
      normalized.includes("ongoing")
    ) {
      return "info";
    }

    return "warning";
  };

  const getPriorityVariant = (priority) => {
    const normalized = String(priority || "").toLowerCase();

    if (normalized === "high" || normalized === "urgent") {
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

  const getTaskDate = (task) => {
    const date =
      task?.dueDate ||
      task?.deadline ||
      task?.createdAt;

    if (!date) return null;

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return null;
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="gse-recent-tasks">
        <div className="gse-recent-tasks-header">
          <div>
            <div className="gse-recent-tasks-title-skeleton" />
            <div className="gse-recent-tasks-subtitle-skeleton" />
          </div>

          <div className="gse-recent-tasks-link-skeleton" />
        </div>

        <div className="gse-recent-tasks-list">
          {[1, 2, 3, 4].map((item) => (
            <div
              className="gse-recent-task-skeleton"
              key={item}
            >
              <div className="gse-recent-task-content-skeleton">
                <span />
                <span />
              </div>

              <div className="gse-recent-task-badge-skeleton" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="gse-recent-tasks">
      <div className="gse-recent-tasks-header">
        <div>
          <h3>{title}</h3>
          <p>Latest tasks and assigned work</p>
        </div>

        <Link
          href={viewAllHref}
          className="gse-recent-tasks-view-all"
        >
          View All
          <span aria-hidden="true">→</span>
        </Link>
      </div>

      {tasks.length === 0 ? (
        <div className="gse-recent-tasks-empty">
          <div className="gse-recent-tasks-empty-icon">
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
              <path d="m8 15 2 2 4-4" />
            </svg>
          </div>

          <strong>No recent tasks</strong>
          <span>New tasks will appear here.</span>
        </div>
      ) : (
        <div className="gse-recent-tasks-list">
          {tasks.map((task, index) => {
            const taskId = getTaskId(task);
            const status = getStatus(task);
            const priority = getPriority(task);
            const taskDate = getTaskDate(task);

            const content = (
              <>
                <div className="gse-recent-task-icon">
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

                <div className="gse-recent-task-info">
                  <div className="gse-recent-task-title">
                    {getTaskTitle(task)}
                  </div>

                  <div className="gse-recent-task-meta">
                    <span>
                      {getAssignedTo(task)}
                    </span>

                    {taskDate && (
                      <>
                        <span className="gse-recent-task-dot">
                          •
                        </span>
                        <span>{taskDate}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="gse-recent-task-badges">
                  <Badge
                    variant={getPriorityVariant(priority)}
                    size="small"
                  >
                    {formatLabel(priority)}
                  </Badge>

                  <Badge
                    variant={getStatusVariant(status)}
                    size="small"
                  >
                    {formatLabel(status)}
                  </Badge>
                </div>
              </>
            );

            if (taskId) {
              return (
                <Link
                  href={`/tasks/${taskId}`}
                  className="gse-recent-task"
                  key={taskId}
                >
                  {content}
                </Link>
              );
            }

            return (
              <div
                className="gse-recent-task"
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

export default RecentTasks;