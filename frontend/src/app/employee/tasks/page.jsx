"use client";

import React, { useEffect, useMemo, useState } from "react";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import SearchBox from "@/components/common/SearchBox";
import Loader from "@/components/common/Loader";
import Select from "@/components/common/Select";
import taskService from "@/services/task.service";
import "./tasks.css";

const getValue = (object, keys, fallback = "") => {
  if (!object) return fallback;
  for (const key of keys) {
    const value = object?.[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return fallback;
};

const getId = (object) => {
  if (!object) return "";
  if (typeof object === "string") return object;
  return object?._id || object?.id || object?.taskId || "";
};

const normalizeList = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.tasks)) return response.data.tasks;
  if (Array.isArray(response?.tasks)) return response.tasks;
  if (Array.isArray(response?.results)) return response.results;
  return [];
};

const getStatus = (task) =>
  String(getValue(task, ["status"], "PENDING")).toUpperCase();

const getPriority = (task) =>
  String(getValue(task, ["priority"], "MEDIUM")).toUpperCase();

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const statusVariant = (status) => {
  if (["COMPLETED", "DONE"].includes(status)) return "success";
  if (["IN_PROGRESS", "IN PROGRESS"].includes(status)) return "info";
  if (["CANCELLED"].includes(status)) return "danger";
  if (["PENDING", "TODO"].includes(status)) return "warning";
  return "default";
};

const priorityVariant = (priority) => {
  if (["URGENT", "HIGH"].includes(priority)) return "danger";
  if (priority === "MEDIUM") return "warning";
  if (priority === "LOW") return "success";
  return "default";
};

export default function EmployeeTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");

  const loadTasks = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError("");

      // Employees must use their own-task endpoint, never the admin all-tasks endpoint.
      if (typeof taskService.getMyTasks !== "function") {
        throw new Error(
          "getMyTasks() is missing from task.service.js. It must call GET /api/v1/tasks/my."
        );
      }

      const response = await taskService.getMyTasks();
      setTasks(normalizeList(response));
    } catch (err) {
      console.error("Failed to load employee tasks:", err);
      setTasks([]);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load your tasks."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();
    return tasks.filter((task) => {
      const status = getStatus(task);
      const priority = getPriority(task);
      if (statusFilter !== "ALL" && status !== statusFilter) return false;
      if (priorityFilter !== "ALL" && priority !== priorityFilter) return false;
      if (!query) return true;
      const searchable = [
        getValue(task, ["title", "taskTitle", "name", "subject"], "Untitled Task"),
        getValue(task, ["description", "details"], ""),
        getValue(task, ["taskNumber", "taskId"], ""),
        status,
        priority,
      ].join(" ").toLowerCase();
      return searchable.includes(query);
    });
  }, [tasks, search, statusFilter, priorityFilter]);

  const stats = useMemo(() => ({
    total: tasks.length,
    pending: tasks.filter((task) => ["PENDING", "TODO"].includes(getStatus(task))).length,
    inProgress: tasks.filter((task) => ["IN_PROGRESS", "IN PROGRESS"].includes(getStatus(task))).length,
    completed: tasks.filter((task) => ["COMPLETED", "DONE"].includes(getStatus(task))).length,
    overdue: tasks.filter((task) => {
      const dueDate = getValue(task, ["dueDate", "deadline", "endDate"], "");
      if (!dueDate || ["COMPLETED", "DONE", "CANCELLED"].includes(getStatus(task))) return false;
      const due = new Date(dueDate);
      return !Number.isNaN(due.getTime()) && due < new Date();
    }).length,
  }), [tasks]);

  if (loading) {
    return (
      <div className="admin-tasks-loading">
        <Loader />
        <p>Loading your tasks...</p>
      </div>
    );
  }

  return (
    <div className="admin-tasks-page">
      <div className="admin-tasks-page-header">
        <div>
          <h1>My Tasks</h1>
          <p>View and track tasks assigned to you.</p>
        </div>
        <div className="admin-tasks-header-actions">
          <Button type="button" variant="secondary" onClick={() => loadTasks(true)} disabled={refreshing}>
            {refreshing ? "Refreshing..." : "↻ Refresh"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="admin-tasks-error">
          <strong>Unable to load your tasks</strong>
          <div>{error}</div>
          <div style={{ marginTop: 10 }}>
            <Button type="button" variant="secondary" onClick={() => loadTasks()}>
              Retry Tasks
            </Button>
          </div>
        </div>
      )}

      <div className="admin-tasks-stats">
        {[
          ["Total Tasks", stats.total, "TS"],
          ["Pending", stats.pending, "P"],
          ["In Progress", stats.inProgress, "IP"],
          ["Completed", stats.completed, "✓"],
          ["Overdue", stats.overdue, "!"],
        ].map(([label, value, icon]) => (
          <div className="admin-task-stat-card" key={label}>
            <div className={`admin-task-stat-icon ${label === "Pending" ? "pending" : label === "In Progress" ? "progress" : label === "Completed" ? "completed" : label === "Overdue" ? "overdue" : ""}`}>
              {icon}
            </div>
            <div>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-tasks-toolbar">
        <div className="admin-tasks-search">
          <SearchBox value={search} onChange={setSearch} placeholder="Search my tasks..." />
        </div>
        <div className="admin-tasks-filters">
          <Select
            value={statusFilter}
            onChange={(value) => setStatusFilter(value?.target ? value.target.value : value)}
            options={[
              { label: "All Status", value: "ALL" },
              { label: "Pending", value: "PENDING" },
              { label: "In Progress", value: "IN_PROGRESS" },
              { label: "Completed", value: "COMPLETED" },
              { label: "Cancelled", value: "CANCELLED" },
            ]}
          />
          <Select
            value={priorityFilter}
            onChange={(value) => setPriorityFilter(value?.target ? value.target.value : value)}
            options={[
              { label: "All Priorities", value: "ALL" },
              { label: "Urgent", value: "URGENT" },
              { label: "High", value: "HIGH" },
              { label: "Medium", value: "MEDIUM" },
              { label: "Low", value: "LOW" },
            ]}
          />
        </div>
      </div>

      <div className="admin-tasks-card">
        <div className="admin-tasks-card-header">
          <div>
            <h2>Assigned Tasks</h2>
            <p>{filteredTasks.length} task{filteredTasks.length === 1 ? "" : "s"} found</p>
          </div>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="admin-tasks-empty">
            <div className="admin-tasks-empty-icon">TS</div>
            <h3>{error ? "Tasks could not be loaded" : "No tasks found"}</h3>
            <p>{error ? "Check the API response and try again." : "No tasks match your search or filters."}</p>
          </div>
        ) : (
          <div className="admin-tasks-table-wrapper">
            <table className="admin-tasks-table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Priority</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((task, index) => {
                  const id = getId(task);
                  const status = getStatus(task);
                  const priority = getPriority(task);
                  const dueDate = getValue(task, ["dueDate", "deadline", "endDate"], "");
                  return (
                    <tr key={id || index}>
                      <td>
                        <div className="admin-task-title-cell">
                          <strong>{String(getValue(task, ["title", "taskTitle", "name", "subject"], "Untitled Task"))}</strong>
                          {getValue(task, ["description", "details"], "") && (
                            <span>{String(getValue(task, ["description", "details"], ""))}</span>
                          )}
                          {getValue(task, ["taskNumber", "taskId"], "") && (
                            <small>{String(getValue(task, ["taskNumber", "taskId"], ""))}</small>
                          )}
                        </div>
                      </td>
                      <td><Badge variant={priorityVariant(priority)}>{priority.replaceAll("_", " ")}</Badge></td>
                      <td>{formatDate(dueDate)}</td>
                      <td><Badge variant={statusVariant(status)}>{status.replaceAll("_", " ")}</Badge></td>
                      <td>{formatDate(getValue(task, ["createdAt", "createdDate"], ""))}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
