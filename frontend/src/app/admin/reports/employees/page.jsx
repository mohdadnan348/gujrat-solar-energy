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
import "./employee-report.css";

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

const getEmployeeName = (employee) => {
  if (!employee) return "-";

  if (typeof employee === "string") return employee;

  return (
    employee.name ||
    employee.fullName ||
    [employee.firstName, employee.lastName]
      .filter(Boolean)
      .join(" ") ||
    employee.email ||
    "-"
  );
};

const getStatusVariant = (status) => {
  const value = String(status || "").toLowerCase();

  if (
    value.includes("active") ||
    value.includes("present") ||
    value.includes("completed") ||
    value.includes("approved")
  ) {
    return "success";
  }

  if (
    value.includes("pending") ||
    value.includes("leave") ||
    value.includes("progress")
  ) {
    return "warning";
  }

  if (
    value.includes("inactive") ||
    value.includes("absent") ||
    value.includes("rejected")
  ) {
    return "danger";
  }

  return "default";
};

const EmployeeReportPage = () => {
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    department: "",
    status: "",
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

      if (filters.startDate) {
        params.startDate = filters.startDate;
      }

      if (filters.endDate) {
        params.endDate = filters.endDate;
      }

      if (filters.department) {
        params.department = filters.department;
      }

      if (filters.status) {
        params.status = filters.status;
      }

      const response = await reportService.getEmployeeReport(params);

      setReport(getPayload(response));
    } catch (err) {
      console.error("Failed to load employee report:", err);

      setError(
        err?.message ||
          err?.response?.data?.message ||
          "Failed to load employee report."
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
      department: "",
      status: "",
    });
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      setError("");

      if (typeof reportService.exportEmployeeReport === "function") {
        const response =
          await reportService.exportEmployeeReport(filters);

        if (response?.data instanceof Blob) {
          const url = window.URL.createObjectURL(response.data);
          const link = document.createElement("a");

          link.href = url;
          link.download = "employee-report.xlsx";

          document.body.appendChild(link);
          link.click();
          link.remove();

          window.URL.revokeObjectURL(url);
        }

        return;
      }

      window.print();
    } catch (err) {
      console.error("Failed to export employee report:", err);

      setError(
        err?.message ||
          err?.response?.data?.message ||
          "Failed to export employee report."
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
      totalEmployees: Number(
        getValue(data, [
          "totalEmployees",
          "employees",
          "employeeCount",
          "total",
        ])
      ),
      activeEmployees: Number(
        getValue(data, [
          "activeEmployees",
          "active",
          "activeCount",
        ])
      ),
      presentEmployees: Number(
        getValue(data, [
          "presentEmployees",
          "present",
          "presentCount",
        ])
      ),
      onLeave: Number(
        getValue(data, [
          "onLeave",
          "employeesOnLeave",
          "leaveCount",
        ])
      ),
      attendanceRate: Number(
        getValue(data, [
          "attendanceRate",
          "averageAttendance",
          "attendancePercentage",
        ])
      ),
    };
  }, [report]);

  const departmentData = useMemo(() => {
    return getArray(
      report?.departmentBreakdown ||
        report?.employeesByDepartment ||
        report?.byDepartment ||
        report?.data?.departmentBreakdown
    );
  }, [report]);

  const attendanceData = useMemo(() => {
    return getArray(
      report?.attendanceBreakdown ||
        report?.attendance ||
        report?.attendanceStats ||
        report?.data?.attendanceBreakdown
    );
  }, [report]);

  const employeeData = useMemo(() => {
    return getArray(
      report?.employees ||
        report?.employeePerformance ||
        report?.records ||
        report?.data?.employees
    );
  }, [report]);

  const maxDepartmentCount = useMemo(() => {
    if (!departmentData.length) return 1;

    return Math.max(
      ...departmentData.map((item) =>
        Number(
          getValue(item, [
            "count",
            "total",
            "employees",
            "employeeCount",
          ])
        )
      ),
      1
    );
  }, [departmentData]);

  const maxAttendanceCount = useMemo(() => {
    if (!attendanceData.length) return 1;

    return Math.max(
      ...attendanceData.map((item) =>
        Number(
          getValue(item, [
            "count",
            "total",
            "employees",
            "employeeCount",
          ])
        )
      ),
      1
    );
  }, [attendanceData]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-employee-report-loading">
          <Loader />
          <p>Loading employee report...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <main className="admin-employee-report-page">
        <div className="admin-employee-report-header">
          <div>
            <div className="admin-employee-report-breadcrumb">
              <Link href="/admin/reports">Reports</Link>
              <span>/</span>
              <span>Employee Report</span>
            </div>

            <h1>Employee Report</h1>

            <p>
              Review employee activity, attendance, departments, and
              workforce performance.
            </p>
          </div>

          <div className="admin-employee-report-header-actions">
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
          <div className="admin-employee-report-error" role="alert">
            {error}
          </div>
        )}

        <section className="admin-employee-report-filters">
          <div className="admin-employee-report-filter">
            <DatePicker
              label="Start Date"
              value={filters.startDate}
              onChange={(value) =>
                handleFilterChange("startDate", value)
              }
            />
          </div>

          <div className="admin-employee-report-filter">
            <DatePicker
              label="End Date"
              value={filters.endDate}
              onChange={(value) =>
                handleFilterChange("endDate", value)
              }
            />
          </div>

          <div className="admin-employee-report-filter">
            <Select
              label="Department"
              value={filters.department}
              onChange={(event) =>
                handleFilterChange(
                  "department",
                  event.target.value
                )
              }
              options={[
                { value: "", label: "All Departments" },
                { value: "SALES", label: "Sales" },
                { value: "OPERATIONS", label: "Operations" },
                { value: "HR", label: "Human Resources" },
                { value: "ADMIN", label: "Administration" },
              ]}
            />
          </div>

          <div className="admin-employee-report-filter">
            <Select
              label="Status"
              value={filters.status}
              onChange={(event) =>
                handleFilterChange("status", event.target.value)
              }
              options={[
                { value: "", label: "All Statuses" },
                { value: "ACTIVE", label: "Active" },
                { value: "INACTIVE", label: "Inactive" },
              ]}
            />
          </div>

          <div className="admin-employee-report-filter-actions">
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

        <section className="admin-employee-report-stats">
          <div className="admin-employee-report-stat">
            <div className="admin-employee-report-stat-icon total">
              T
            </div>

            <div>
              <span>Total Employees</span>
              <strong>{formatNumber(summary.totalEmployees)}</strong>
            </div>
          </div>

          <div className="admin-employee-report-stat">
            <div className="admin-employee-report-stat-icon active">
              A
            </div>

            <div>
              <span>Active Employees</span>
              <strong>{formatNumber(summary.activeEmployees)}</strong>
            </div>
          </div>

          <div className="admin-employee-report-stat">
            <div className="admin-employee-report-stat-icon present">
              P
            </div>

            <div>
              <span>Present</span>
              <strong>{formatNumber(summary.presentEmployees)}</strong>
            </div>
          </div>

          <div className="admin-employee-report-stat">
            <div className="admin-employee-report-stat-icon leave">
              L
            </div>

            <div>
              <span>On Leave</span>
              <strong>{formatNumber(summary.onLeave)}</strong>
            </div>
          </div>

          <div className="admin-employee-report-stat">
            <div className="admin-employee-report-stat-icon rate">
              %
            </div>

            <div>
              <span>Attendance Rate</span>
              <strong>
                {Number.isFinite(summary.attendanceRate)
                  ? `${summary.attendanceRate.toFixed(1)}%`
                  : "0%"}
              </strong>
            </div>
          </div>
        </section>

        <section className="admin-employee-report-grid">
          <div className="admin-employee-report-card">
            <div className="admin-employee-report-card-header">
              <div>
                <h2>Employees by Department</h2>
                <p>Workforce distribution across departments.</p>
              </div>
            </div>

            <div className="admin-employee-report-card-body">
              {departmentData.length > 0 ? (
                <div className="admin-employee-report-breakdown">
                  {departmentData.map((item, index) => {
                    const department =
                      item?.department ||
                      item?.label ||
                      item?.name ||
                      "Unknown";

                    const count = Number(
                      getValue(item, [
                        "count",
                        "total",
                        "employees",
                        "employeeCount",
                      ])
                    );

                    const percentage =
                      (count / maxDepartmentCount) * 100;

                    return (
                      <div
                        className="admin-employee-report-breakdown-item"
                        key={`${department}-${index}`}
                      >
                        <div className="admin-employee-report-breakdown-top">
                          <span>{department}</span>
                          <strong>{formatNumber(count)}</strong>
                        </div>

                        <div className="admin-employee-report-progress">
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
                <div className="admin-employee-report-empty">
                  <div className="admin-employee-report-empty-icon">
                    —
                  </div>

                  <h3>No department data</h3>

                  <p>
                    No department records are available for the selected
                    filters.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="admin-employee-report-card">
            <div className="admin-employee-report-card-header">
              <div>
                <h2>Attendance Overview</h2>
                <p>Employee attendance distribution.</p>
              </div>
            </div>

            <div className="admin-employee-report-card-body">
              {attendanceData.length > 0 ? (
                <div className="admin-employee-report-attendance">
                  {attendanceData.map((item, index) => {
                    const status =
                      item?.status ||
                      item?.label ||
                      item?.name ||
                      "Unknown";

                    const count = Number(
                      getValue(item, [
                        "count",
                        "total",
                        "employees",
                        "employeeCount",
                      ])
                    );

                    const percentage =
                      (count / maxAttendanceCount) * 100;

                    return (
                      <div
                        className="admin-employee-report-attendance-item"
                        key={`${status}-${index}`}
                      >
                        <div className="admin-employee-report-attendance-icon">
                          {String(status).charAt(0).toUpperCase()}
                        </div>

                        <div className="admin-employee-report-attendance-content">
                          <div className="admin-employee-report-attendance-top">
                            <span>{status}</span>
                            <strong>{formatNumber(count)}</strong>
                          </div>

                          <div className="admin-employee-report-attendance-progress">
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
                <div className="admin-employee-report-empty">
                  <div className="admin-employee-report-empty-icon">
                    —
                  </div>

                  <h3>No attendance data</h3>

                  <p>
                    No attendance records are available for the selected
                    filters.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="admin-employee-report-card admin-employee-report-recent-card">
          <div className="admin-employee-report-card-header">
            <div>
              <h2>Employee Performance</h2>
              <p>Employee-level activity and performance summary.</p>
            </div>
          </div>

          {employeeData.length > 0 ? (
            <div className="admin-employee-report-table-wrapper">
              <table className="admin-employee-report-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Department</th>
                    <th>Tasks</th>
                    <th>Completed</th>
                    <th>Attendance</th>
                    <th>Status</th>
                    <th>Performance</th>
                  </tr>
                </thead>

                <tbody>
                  {employeeData.map((item, index) => {
                    const employee =
                      item?.employee ||
                      item?.user ||
                      item;

                    const department =
                      item?.department ||
                      employee?.department ||
                      "-";

                    const tasks = Number(
                      getValue(item, [
                        "totalTasks",
                        "tasks",
                        "taskCount",
                      ])
                    );

                    const completed = Number(
                      getValue(item, [
                        "completedTasks",
                        "completed",
                        "completedCount",
                      ])
                    );

                    const attendance = Number(
                      getValue(item, [
                        "attendanceRate",
                        "attendance",
                        "attendancePercentage",
                      ])
                    );

                    const performance = Number(
                      getValue(item, [
                        "performance",
                        "performanceScore",
                        "score",
                      ])
                    );

                    const status =
                      item?.status ||
                      employee?.status ||
                      "ACTIVE";

                    return (
                      <tr
                        key={
                          item?._id ||
                          item?.id ||
                          employee?._id ||
                          `employee-${index}`
                        }
                      >
                        <td>
                          <strong>{getEmployeeName(employee)}</strong>

                          {employee?.email && (
                            <span className="admin-employee-report-subtext">
                              {employee.email}
                            </span>
                          )}
                        </td>

                        <td>{department}</td>

                        <td>{formatNumber(tasks)}</td>

                        <td>{formatNumber(completed)}</td>

                        <td>
                          {Number.isFinite(attendance)
                            ? `${attendance.toFixed(1)}%`
                            : "0%"}
                        </td>

                        <td>
                          <Badge variant={getStatusVariant(status)}>
                            {status}
                          </Badge>
                        </td>

                        <td>
                          <div className="admin-employee-report-performance">
                            <div className="admin-employee-report-performance-bar">
                              <div
                                style={{
                                  width: `${Math.max(
                                    Math.min(performance, 100),
                                    0
                                  )}%`,
                                }}
                              />
                            </div>

                            <span>
                              {Number.isFinite(performance)
                                ? `${performance.toFixed(0)}%`
                                : "0%"}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="admin-employee-report-empty large">
              <div className="admin-employee-report-empty-icon">
                —
              </div>

              <h3>No employee data</h3>

              <p>
                No employee performance records are available for the
                selected filters.
              </p>
            </div>
          )}
        </section>

        <section className="admin-employee-report-summary-note">
          <div>
            <strong>Report Scope</strong>
            <span>
              Employee, attendance, department, and workforce activity
              data.
            </span>
          </div>

          <div>
            <strong>Revenue Tracking</strong>
            <span>
              Employee report does not include payment transaction
              tracking.
            </span>
          </div>
        </section>
      </main>
    </AdminLayout>
  );
};

export default EmployeeReportPage;