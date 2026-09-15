"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import AdminLayout from "@/app/admin/layout";
import activityLogService from "@/services/activityLog.service";
import Loader from "@/components/common/Loader";
import Badge from "@/components/common/Badge";
import Button from "@/components/common/Button";
import SearchBox from "@/components/common/SearchBox";
import Pagination from "@/components/common/Pagination";
import DatePicker from "@/components/common/DatePicker";
import "./audit-logs.css";

const ACTION_TYPES = [
  "ALL",
  "CREATE",
  "UPDATE",
  "DELETE",
  "LOGIN",
  "LOGOUT",
  "VIEW",
  "APPROVE",
  "REJECT",
  "OTHER",
];

const MODULE_TYPES = [
  "ALL",
  "LEAD",
  "SOLAR_REQUIREMENT",
  "SYSTEM_CONFIGURATION",
  "QUOTATION",
  "CUSTOMER",
  "INVOICE",
  "TASK",
  "EMPLOYEE",
  "ATTENDANCE",
  "LEAVE",
  "USER",
  "SETTING",
  "NOTIFICATION",
  "OTHER",
];

const getLogId = (log) =>
  log?._id ||
  log?.id ||
  log?.activityLogId ||
  `${log?.createdAt || "log"}-${log?.action || "action"}`;

const getAction = (log) =>
  String(log?.action || log?.activity || log?.event || "OTHER").toUpperCase();

const getModule = (log) =>
  String(log?.module || log?.entity || log?.resource || "OTHER").toUpperCase();

const getDescription = (log) =>
  log?.description ||
  log?.message ||
  log?.details ||
  log?.activityDescription ||
  "No description available.";

const getUserName = (log) => {
  const user = log?.user || log?.performedBy || log?.createdBy;

  if (typeof user === "string") return user;

  return (
    user?.name ||
    user?.fullName ||
    user?.username ||
    user?.email ||
    log?.userName ||
    log?.performedByName ||
    "System"
  );
};

const getUserEmail = (log) => {
  const user = log?.user || log?.performedBy || log?.createdBy;

  if (typeof user === "string") return "";

  return user?.email || log?.userEmail || "";
};

const getIpAddress = (log) =>
  log?.ipAddress ||
  log?.ip ||
  log?.clientIp ||
  "—";

const getLogDate = (log) =>
  log?.createdAt ||
  log?.timestamp ||
  log?.date ||
  log?.updatedAt ||
  null;

const normalizeLogs = (response) => {
  const value = response?.data ?? response;

  if (Array.isArray(value)) return value;

  if (Array.isArray(value?.logs)) return value.logs;
  if (Array.isArray(value?.activityLogs)) return value.activityLogs;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.results)) return value.results;

  return [];
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatAction = (action) => {
  if (!action) return "Other";

  return action
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const formatModule = (module) => {
  if (!module) return "Other";

  return module
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const getActionVariant = (action) => {
  switch (action) {
    case "CREATE":
      return "success";
    case "UPDATE":
      return "info";
    case "DELETE":
      return "danger";
    case "LOGIN":
      return "success";
    case "LOGOUT":
      return "default";
    case "APPROVE":
      return "success";
    case "REJECT":
      return "danger";
    case "VIEW":
      return "default";
    default:
      return "warning";
  }
};

const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [moduleFilter, setModuleFilter] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [page, setPage] = useState(1);
  const itemsPerPage = 15;

  const loadLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      let response;

      if (typeof activityLogService.getActivityLogs === "function") {
        response = await activityLogService.getActivityLogs();
      } else if (typeof activityLogService.getLogs === "function") {
        response = await activityLogService.getLogs();
      } else if (typeof activityLogService.getAll === "function") {
        response = await activityLogService.getAll();
      } else {
        throw new Error("Audit log service method is not available.");
      }

      setLogs(normalizeLogs(response));
    } catch (err) {
      console.error("Failed to load audit logs:", err);
      setError(
        err?.message ||
          "Unable to load audit logs. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const filteredLogs = useMemo(() => {
    const query = search.trim().toLowerCase();

    return logs.filter((log) => {
      const action = getAction(log);
      const module = getModule(log);
      const description = getDescription(log).toLowerCase();
      const userName = getUserName(log).toLowerCase();
      const userEmail = getUserEmail(log).toLowerCase();
      const ipAddress = getIpAddress(log).toLowerCase();

      const matchesSearch =
        !query ||
        description.includes(query) ||
        userName.includes(query) ||
        userEmail.includes(query) ||
        ipAddress.includes(query) ||
        action.toLowerCase().includes(query) ||
        module.toLowerCase().includes(query);

      const matchesAction =
        actionFilter === "ALL" || action === actionFilter;

      const matchesModule =
        moduleFilter === "ALL" || module === moduleFilter;

      let matchesDate = true;

      const rawDate = getLogDate(log);

      if (rawDate) {
        const logDate = new Date(rawDate);

        if (!Number.isNaN(logDate.getTime())) {
          if (startDate) {
            const start = new Date(`${startDate}T00:00:00`);

            if (logDate < start) {
              matchesDate = false;
            }
          }

          if (endDate) {
            const end = new Date(`${endDate}T23:59:59.999`);

            if (logDate > end) {
              matchesDate = false;
            }
          }
        }
      }

      return (
        matchesSearch &&
        matchesAction &&
        matchesModule &&
        matchesDate
      );
    });
  }, [
    logs,
    search,
    actionFilter,
    moduleFilter,
    startDate,
    endDate,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredLogs.length / itemsPerPage)
  );

  const currentPage = Math.min(page, totalPages);

  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;

    return filteredLogs.slice(
      startIndex,
      startIndex + itemsPerPage
    );
  }, [filteredLogs, currentPage]);

  const actionSummary = useMemo(() => {
    return logs.reduce((summary, log) => {
      const action = getAction(log);

      summary[action] = (summary[action] || 0) + 1;

      return summary;
    }, {});
  }, [logs]);

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleActionChange = (event) => {
    setActionFilter(event.target.value);
    setPage(1);
  };

  const handleModuleChange = (event) => {
    setModuleFilter(event.target.value);
    setPage(1);
  };

  const handleStartDateChange = (value) => {
    setStartDate(value);
    setPage(1);
  };

  const handleEndDateChange = (value) => {
    setEndDate(value);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setActionFilter("ALL");
    setModuleFilter("ALL");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const handleExport = () => {
    if (!filteredLogs.length) return;

    const headers = [
      "Date",
      "User",
      "Email",
      "Action",
      "Module",
      "Description",
      "IP Address",
    ];

    const rows = filteredLogs.map((log) => [
      formatDate(getLogDate(log)),
      getUserName(log),
      getUserEmail(log),
      formatAction(getAction(log)),
      formatModule(getModule(log)),
      getDescription(log),
      getIpAddress(log),
    ]);

    const csv = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map((value) =>
            `"${String(value ?? "")
              .replace(/"/g, '""')
              .replace(/\n/g, " ")}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `audit-logs-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-audit-loading">
          <Loader />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-audit-page">
        <div className="admin-audit-header">
          <div>
            <h1>Audit Logs</h1>
            <p>
              Review important system activities and user actions.
            </p>
          </div>

          <div className="admin-audit-header-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={loadLogs}
            >
              Refresh
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={handleExport}
              disabled={!filteredLogs.length}
            >
              Export CSV
            </Button>
          </div>
        </div>

        {error && (
          <div className="admin-audit-error">
            {error}
          </div>
        )}

        <div className="admin-audit-summary">
          <div className="audit-summary-card">
            <span>Total Logs</span>
            <strong>{logs.length}</strong>
          </div>

          <div className="audit-summary-card">
            <span>Filtered Logs</span>
            <strong>{filteredLogs.length}</strong>
          </div>

          <div className="audit-summary-card">
            <span>Creates</span>
            <strong>{actionSummary.CREATE || 0}</strong>
          </div>

          <div className="audit-summary-card">
            <span>Updates</span>
            <strong>{actionSummary.UPDATE || 0}</strong>
          </div>

          <div className="audit-summary-card">
            <span>Deletes</span>
            <strong>{actionSummary.DELETE || 0}</strong>
          </div>
        </div>

        <div className="admin-audit-filters">
          <div className="audit-filter-search">
            <SearchBox
              value={search}
              onChange={handleSearchChange}
              placeholder="Search audit logs..."
            />
          </div>

          <div className="audit-filter-field">
            <label htmlFor="audit-action">
              Action
            </label>

            <select
              id="audit-action"
              value={actionFilter}
              onChange={handleActionChange}
            >
              {ACTION_TYPES.map((action) => (
                <option key={action} value={action}>
                  {action === "ALL"
                    ? "All Actions"
                    : formatAction(action)}
                </option>
              ))}
            </select>
          </div>

          <div className="audit-filter-field">
            <label htmlFor="audit-module">
              Module
            </label>

            <select
              id="audit-module"
              value={moduleFilter}
              onChange={handleModuleChange}
            >
              {MODULE_TYPES.map((module) => (
                <option key={module} value={module}>
                  {module === "ALL"
                    ? "All Modules"
                    : formatModule(module)}
                </option>
              ))}
            </select>
          </div>

          <div className="audit-filter-field">
            <label htmlFor="audit-start-date">
              Start Date
            </label>

            <DatePicker
              id="audit-start-date"
              value={startDate}
              onChange={handleStartDateChange}
              placeholder="Select start date"
            />
          </div>

          <div className="audit-filter-field">
            <label htmlFor="audit-end-date">
              End Date
            </label>

            <DatePicker
              id="audit-end-date"
              value={endDate}
              onChange={handleEndDateChange}
              placeholder="Select end date"
            />
          </div>

          <div className="audit-filter-clear">
            <Button
              type="button"
              variant="secondary"
              onClick={clearFilters}
            >
              Clear Filters
            </Button>
          </div>
        </div>

        <div className="admin-audit-card">
          <div className="admin-audit-card-header">
            <div>
              <h2>Activity History</h2>
              <span>
                {filteredLogs.length} log
                {filteredLogs.length === 1 ? "" : "s"} found
              </span>
            </div>
          </div>

          {paginatedLogs.length === 0 ? (
            <div className="admin-audit-empty">
              <div className="audit-empty-icon">✓</div>
              <h3>No Audit Logs Found</h3>
              <p>
                No activity logs match your current filters.
              </p>
            </div>
          ) : (
            <div className="admin-audit-table-wrapper">
              <table className="admin-audit-table">
                <thead>
                  <tr>
                    <th>Date &amp; Time</th>
                    <th>User</th>
                    <th>Action</th>
                    <th>Module</th>
                    <th>Description</th>
                    <th>IP Address</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedLogs.map((log) => (
                    <tr key={getLogId(log)}>
                      <td>
                        <span className="audit-date">
                          {formatDate(getLogDate(log))}
                        </span>
                      </td>

                      <td>
                        <div className="audit-user">
                          <div className="audit-user-avatar">
                            {getUserName(log)
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <strong>
                              {getUserName(log)}
                            </strong>

                            {getUserEmail(log) && (
                              <span>
                                {getUserEmail(log)}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td>
                        <Badge
                          variant={getActionVariant(
                            getAction(log)
                          )}
                        >
                          {formatAction(getAction(log))}
                        </Badge>
                      </td>

                      <td>
                        <span className="audit-module">
                          {formatModule(getModule(log))}
                        </span>
                      </td>

                      <td>
                        <div className="audit-description">
                          {getDescription(log)}
                        </div>
                      </td>

                      <td>
                        <span className="audit-ip">
                          {getIpAddress(log)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {filteredLogs.length > itemsPerPage && (
            <div className="admin-audit-pagination">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AuditLogsPage;