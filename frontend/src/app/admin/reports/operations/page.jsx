"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AdminLayout from "@/app/admin/layout";
import Select from "@/components/common/Select";
import DatePicker from "@/components/common/DatePicker";
import Button from "@/components/common/Button";
import Loader from "@/components/common/Loader";
import Badge from "@/components/common/Badge";
import reportService from "@/services/report.service";
import "./operations-report.css";

const getArray = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.results)) return value.results;
  return [];
};

const getPayload = (response) => {
  if (!response) return {};
  if (response.data && !Array.isArray(response.data)) {
    return response.data;
  }
  return response;
};

const formatNumber = (value) =>
  new Intl.NumberFormat("en-IN").format(Number(value || 0));

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getValue = (object, keys, fallback = 0) => {
  for (const key of keys) {
    if (
      object &&
      object[key] !== undefined &&
      object[key] !== null &&
      object[key] !== ""
    ) {
      return object[key];
    }
  }

  return fallback;
};

const getStatusVariant = (status) => {
  const value = String(status || "").toLowerCase();

  if (
    value.includes("completed") ||
    value.includes("approved") ||
    value.includes("active") ||
    value.includes("done")
  ) {
    return "success";
  }

  if (
    value.includes("pending") ||
    value.includes("progress") ||
    value.includes("assigned")
  ) {
    return "warning";
  }

  if (
    value.includes("cancel") ||
    value.includes("reject") ||
    value.includes("failed")
  ) {
    return "danger";
  }

  return "default";
};

const OperationsReportPage = () => {
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    status: "",
    type: "",
  });

  const [report, setReport] = useState({});
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");

  const loadReport = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};

      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.status) params.status = filters.status;
      if (filters.type) params.type = filters.type;

      const response = await reportService.getOperationsReport(params);

      setReport(getPayload(response));
    } catch (err) {
      console.error("Failed to load operations report:", err);

      setError(
        err?.message ||
          err?.response?.data?.message ||
          "Failed to load operations report."
      );

      setReport({});
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const handleFilterChange = (field, value) => {
    setFilters((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleReset = () => {
    setFilters({
      startDate: "",
      endDate: "",
      status: "",
      type: "",
    });
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      setError("");

      if (typeof reportService.exportOperationsReport === "function") {
        const response =
          await reportService.exportOperationsReport(filters);

        if (response?.data instanceof Blob) {
          const url = window.URL.createObjectURL(response.data);
          const link = document.createElement("a");

          link.href = url;
          link.download = "operations-report.xlsx";

          document.body.appendChild(link);
          link.click();
          link.remove();

          window.URL.revokeObjectURL(url);
        }

        return;
      }

      window.print();
    } catch (err) {
      console.error("Failed to export operations report:", err);

      setError(
        err?.message ||
          err?.response?.data?.message ||
          "Failed to export operations report."
      );
    } finally {
      setExporting(false);
    }
  };

  const summary = useMemo(() => {
    const data =
      report?.summary ||
      report?.totals ||
      report?.statistics ||
      report?.data?.summary ||
      {};

    return {
      totalTasks: Number(
        getValue(data, [
          "totalTasks",
          "tasks",
          "taskCount",
          "totalOperations",
        ])
      ),
      completedTasks: Number(
        getValue(data, [
          "completedTasks",
          "completed",
          "completedCount",
        ])
      ),
      pendingTasks: Number(
        getValue(data, [
          "pendingTasks",
          "pending",
          "pendingCount",
        ])
      ),
      inProgressTasks: Number(
        getValue(data, [
          "inProgressTasks",
          "inProgress",
          "inProgressCount",
        ])
      ),
      completionRate: Number(
        getValue(data, [
          "completionRate",
          "taskCompletionRate",
          "completedPercentage",
        ])
      ),
    };
  }, [report]);

  const operationsByStatus = useMemo(() => {
    return getArray(
      report?.operationsByStatus ||
        report?.statusBreakdown ||
        report?.byStatus ||
        report?.data?.operationsByStatus
    );
  }, [report]);

  const operationsByType = useMemo(() => {
    return getArray(
      report?.operationsByType ||
        report?.typeBreakdown ||
        report?.byType ||
        report?.data?.operationsByType
    );
  }, [report]);

  const recentOperations = useMemo(() => {
    return getArray(
      report?.recentOperations ||
        report?.operations ||
        report?.tasks ||
        report?.records ||
        report?.data?.recentOperations
    );
  }, [report]);

  const maxStatusCount = useMemo(() => {
    if (!operationsByStatus.length) return 1;

    return Math.max(
      ...operationsByStatus.map((item) =>
        Number(
          getValue(item, [
            "count",
            "total",
            "quantity",
            "tasks",
            "operations",
          ])
        )
      ),
      1
    );
  }, [operationsByStatus]);

  const maxTypeCount = useMemo(() => {
    if (!operationsByType.length) return 1;

    return Math.max(
      ...operationsByType.map((item) =>
        Number(
          getValue(item, [
            "count",
            "total",
            "quantity",
            "tasks",
            "operations",
          ])
        )
      ),
      1
    );
  }, [operationsByType]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-operations-report-loading">
          <Loader />
          <p>Loading operations report...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <main className="admin-operations-report-page">
        <div className="admin-operations-report-header">
          <div>
            <div className="admin-operations-report-breadcrumb">
              <Link href="/admin/reports">Reports</Link>
              <span>/</span>
              <span>Operations Report</span>
            </div>

            <h1>Operations Report</h1>

            <p>
              Monitor task execution, operational workload, and completion
              performance.
            </p>
          </div>

          <div className="admin-operations-report-header-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={handleExport}
              disabled={exporting}
            >
              {exporting ? "Exporting..." : "Export Report"}
            </Button>
          </div>
        </div>

        {error && (
          <div className="admin-operations-report-error" role="alert">
            {error}
          </div>
        )}

        <section className="admin-operations-report-filters">
          <div className="admin-operations-report-filter">
            <DatePicker
              label="Start Date"
              value={filters.startDate}
              onChange={(value) =>
                handleFilterChange("startDate", value)
              }
            />
          </div>

          <div className="admin-operations-report-filter">
            <DatePicker
              label="End Date"
              value={filters.endDate}
              onChange={(value) =>
                handleFilterChange("endDate", value)
              }
            />
          </div>

          <div className="admin-operations-report-filter">
            <Select
              label="Status"
              value={filters.status}
              onChange={(event) =>
                handleFilterChange("status", event.target.value)
              }
              options={[
                { value: "", label: "All Statuses" },
                { value: "PENDING", label: "Pending" },
                { value: "IN_PROGRESS", label: "In Progress" },
                { value: "COMPLETED", label: "Completed" },
                { value: "CANCELLED", label: "Cancelled" },
              ]}
            />
          </div>

          <div className="admin-operations-report-filter">
            <Select
              label="Operation Type"
              value={filters.type}
              onChange={(event) =>
                handleFilterChange("type", event.target.value)
              }
              options={[
                { value: "", label: "All Types" },
                { value: "INSTALLATION", label: "Installation" },
                { value: "SITE_VISIT", label: "Site Visit" },
                { value: "SURVEY", label: "Survey" },
                { value: "MAINTENANCE", label: "Maintenance" },
                { value: "FOLLOW_UP", label: "Follow Up" },
                { value: "OTHER", label: "Other" },
              ]}
            />
          </div>

          <div className="admin-operations-report-filter-actions">
            <Button type="button" onClick={loadReport}>
              Apply Filters
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={handleReset}
            >
              Reset
            </Button>
          </div>
        </section>

        <section className="admin-operations-report-stats">
          <div className="admin-operations-report-stat">
            <div className="admin-operations-report-stat-icon total">
              T
            </div>

            <div>
              <span>Total Operations</span>
              <strong>{formatNumber(summary.totalTasks)}</strong>
            </div>
          </div>

          <div className="admin-operations-report-stat">
            <div className="admin-operations-report-stat-icon completed">
              C
            </div>

            <div>
              <span>Completed</span>
              <strong>{formatNumber(summary.completedTasks)}</strong>
            </div>
          </div>

          <div className="admin-operations-report-stat">
            <div className="admin-operations-report-stat-icon pending">
              P
            </div>

            <div>
              <span>Pending</span>
              <strong>{formatNumber(summary.pendingTasks)}</strong>
            </div>
          </div>

          <div className="admin-operations-report-stat">
            <div className="admin-operations-report-stat-icon progress">
              I
            </div>

            <div>
              <span>In Progress</span>
              <strong>{formatNumber(summary.inProgressTasks)}</strong>
            </div>
          </div>

          <div className="admin-operations-report-stat">
            <div className="admin-operations-report-stat-icon rate">
              %
            </div>

            <div>
              <span>Completion Rate</span>
              <strong>
                {Number.isFinite(summary.completionRate)
                  ? `${summary.completionRate.toFixed(1)}%`
                  : "0%"}
              </strong>
            </div>
          </div>
        </section>

        <section className="admin-operations-report-grid">
          <div className="admin-operations-report-card">
            <div className="admin-operations-report-card-header">
              <div>
                <h2>Operations by Status</h2>
                <p>Current workload distribution by status.</p>
              </div>
            </div>

            <div className="admin-operations-report-card-body">
              {operationsByStatus.length > 0 ? (
                <div className="admin-operations-report-breakdown">
                  {operationsByStatus.map((item, index) => {
                    const status =
                      item?.status ||
                      item?.label ||
                      item?.name ||
                      "Unknown";

                    const count = Number(
                      getValue(item, [
                        "count",
                        "total",
                        "quantity",
                        "tasks",
                        "operations",
                      ])
                    );

                    const percentage =
                      (count / maxStatusCount) * 100;

                    return (
                      <div
                        className="admin-operations-report-breakdown-item"
                        key={`${status}-${index}`}
                      >
                        <div className="admin-operations-report-breakdown-top">
                          <span>{status}</span>
                          <strong>{formatNumber(count)}</strong>
                        </div>

                        <div className="admin-operations-report-progress">
                          <div
                            style={{
                              width: `${Math.max(
                                Math.min(percentage, 100),
                                2
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="admin-operations-report-empty">
                  <div className="admin-operations-report-empty-icon">
                    —
                  </div>
                  <h3>No status data</h3>
                  <p>
                    No operational status records are available for the
                    selected filters.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="admin-operations-report-card">
            <div className="admin-operations-report-card-header">
              <div>
                <h2>Operations by Type</h2>
                <p>Workload distribution across operation types.</p>
              </div>
            </div>

            <div className="admin-operations-report-card-body">
              {operationsByType.length > 0 ? (
                <div className="admin-operations-report-type-list">
                  {operationsByType.map((item, index) => {
                    const type =
                      item?.type ||
                      item?.label ||
                      item?.name ||
                      "Unknown";

                    const count = Number(
                      getValue(item, [
                        "count",
                        "total",
                        "quantity",
                        "tasks",
                        "operations",
                      ])
                    );

                    const percentage =
                      (count / maxTypeCount) * 100;

                    return (
                      <div
                        className="admin-operations-report-type-item"
                        key={`${type}-${index}`}
                      >
                        <div className="admin-operations-report-type-icon">
                          {String(type).charAt(0).toUpperCase()}
                        </div>

                        <div className="admin-operations-report-type-content">
                          <div className="admin-operations-report-type-top">
                            <strong>{type}</strong>
                            <span>{formatNumber(count)}</span>
                          </div>

                          <div className="admin-operations-report-type-progress">
                            <div
                              style={{
                                width: `${Math.max(
                                  Math.min(percentage, 100),
                                  2
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="admin-operations-report-empty">
                  <div className="admin-operations-report-empty-icon">
                    —
                  </div>
                  <h3>No operation type data</h3>
                  <p>
                    No operation type records are available for the
                    selected filters.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="admin-operations-report-card admin-operations-report-recent-card">
          <div className="admin-operations-report-card-header">
            <div>
              <h2>Recent Operations</h2>
              <p>Latest operational tasks and activities.</p>
            </div>
          </div>

          {recentOperations.length > 0 ? (
            <div className="admin-operations-report-table-wrapper">
              <table className="admin-operations-report-table">
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Type</th>
                    <th>Assigned To</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Due Date</th>
                  </tr>
                </thead>

                <tbody>
                  {recentOperations.map((item, index) => {
                    const taskName =
                      item?.title ||
                      item?.taskTitle ||
                      item?.name ||
                      item?.description ||
                      "Untitled Task";

                    const type =
                      item?.type ||
                      item?.taskType ||
                      item?.operationType ||
                      "-";

                    const assignedTo =
                      item?.assignedTo?.name ||
                      item?.assignedTo?.fullName ||
                      item?.employee?.name ||
                      item?.employeeName ||
                      "-";

                    const priority =
                      item?.priority || "NORMAL";

                    const status =
                      item?.status ||
                      item?.taskStatus ||
                      "PENDING";

                    return (
                      <tr
                        key={
                          item?._id ||
                          item?.id ||
                          `${taskName}-${index}`
                        }
                      >
                        <td>
                          <strong>{taskName}</strong>

                          {item?.customer?.name && (
                            <span className="admin-operations-report-subtext">
                              {item.customer.name}
                            </span>
                          )}
                        </td>

                        <td>{type}</td>

                        <td>{assignedTo}</td>

                        <td>
                          <span className="admin-operations-report-priority">
                            {priority}
                          </span>
                        </td>

                        <td>
                          <Badge variant={getStatusVariant(status)}>
                            {status}
                          </Badge>
                        </td>

                        <td>
                          {formatDate(
                            item?.dueDate ||
                              item?.deadline ||
                              item?.endDate
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="admin-operations-report-empty large">
              <div className="admin-operations-report-empty-icon">
                —
              </div>

              <h3>No recent operations</h3>

              <p>
                No operational records are available for the selected
                filters.
              </p>
            </div>
          )}
        </section>
      </main>
    </AdminLayout>
  );
};

export default OperationsReportPage;