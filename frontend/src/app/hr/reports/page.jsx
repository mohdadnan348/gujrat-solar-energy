"use client";

import React, { useEffect, useMemo, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import Button from "@/components/common/Button";
import Loader from "@/components/common/Loader";
import Badge from "@/components/common/Badge";
import { useAuth } from "@/hooks/useAuth";
import reportService from "@/services/report.service";

const PERIOD_OPTIONS = [
  { value: "today", label: "Today" },
  { value: "week", label: "Last 7 Days" },
  { value: "month", label: "This Month" },
  { value: "quarter", label: "This Quarter" },
  { value: "year", label: "This Year" },
];

const getDateRange = (period) => {
  const now = new Date();
  const endDate = new Date(now);
  let startDate = new Date(now);

  if (period === "today") {
    startDate.setHours(0, 0, 0, 0);
  }

  if (period === "week") {
    startDate.setDate(now.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);
  }

  if (period === "month") {
    startDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );
  }

  if (period === "quarter") {
    const quarterStartMonth =
      Math.floor(now.getMonth() / 3) * 3;

    startDate = new Date(
      now.getFullYear(),
      quarterStartMonth,
      1
    );
  }

  if (period === "year") {
    startDate = new Date(
      now.getFullYear(),
      0,
      1
    );
  }

  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  };
};

const normalizeReport = (response) => {
  return (
    response?.data?.report ||
    response?.data?.data ||
    response?.report ||
    response?.data ||
    null
  );
};

const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const formatNumber = (value) => {
  return new Intl.NumberFormat("en-IN").format(
    toNumber(value)
  );
};

const normalizeStatus = (value) => {
  return String(value || "")
    .replace(/_/g, " ")
    .trim()
    .toLowerCase();
};

const formatStatus = (value) => {
  return String(value || "")
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
};

const getPeriodLabel = (period) => {
  return (
    PERIOD_OPTIONS.find(
      (item) => item.value === period
    )?.label || "This Month"
  );
};

const getCountFromStats = (stats, status) => {
  if (!Array.isArray(stats)) {
    return 0;
  }

  const item = stats.find(
    (entry) =>
      normalizeStatus(
        entry?.status || entry?._id
      ) === normalizeStatus(status)
  );

  return toNumber(item?.count);
};

const getStatsTotal = (stats) => {
  if (!Array.isArray(stats)) {
    return 0;
  }

  return stats.reduce(
    (total, item) =>
      total + toNumber(item?.count),
    0
  );
};

const HrReportsPage = () => {
  const {
    user,
    logout,
    loading: authLoading,
  } = useAuth();

  const [report, setReport] = useState(null);
  const [period, setPeriod] = useState("month");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);
  const [error, setError] = useState("");

  const handleSearch = (value) => {
    console.log("HR global search:", value);
  };

  const loadReports = async (
    isRefresh = false
  ) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const { startDate, endDate } =
        getDateRange(period);

      const response =
        await reportService.getReports({
          startDate,
          endDate,
          period,
        });

      setReport(normalizeReport(response));
    } catch (err) {
      console.error(
        "HR reports loading error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load HR reports."
      );

      setReport(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [period]);

  const attendanceStats = useMemo(() => {
    const attendance =
      report?.attendance ||
      report?.attendanceSummary ||
      [];

    const present = Array.isArray(attendance)
      ? getCountFromStats(
          attendance,
          "Present"
        )
      : toNumber(
          attendance?.present ||
            attendance?.presentCount
        );

    const absent = Array.isArray(attendance)
      ? getCountFromStats(
          attendance,
          "Absent"
        )
      : toNumber(
          attendance?.absent ||
            attendance?.absentCount
        );

    const late = Array.isArray(attendance)
      ? getCountFromStats(
          attendance,
          "Late"
        )
      : toNumber(
          attendance?.late ||
            attendance?.lateCount
        );

    const halfDay = Array.isArray(attendance)
      ? getCountFromStats(
          attendance,
          "Half Day"
        )
      : toNumber(
          attendance?.halfDay ||
            attendance?.halfDayCount
        );

    const total = Array.isArray(attendance)
      ? getStatsTotal(attendance)
      : toNumber(
          attendance?.total ||
            attendance?.totalRecords
        );

    return {
      present,
      absent,
      late,
      halfDay,
      total:
        total ||
        present +
          absent +
          late +
          halfDay,
    };
  }, [report]);

  const leaveStats = useMemo(() => {
    const leaves =
      report?.leaves ||
      report?.leaveSummary ||
      [];

    const pending = Array.isArray(leaves)
      ? getCountFromStats(
          leaves,
          "Pending"
        )
      : toNumber(
          leaves?.pending ||
            leaves?.pendingCount
        );

    const approved = Array.isArray(leaves)
      ? getCountFromStats(
          leaves,
          "Approved"
        )
      : toNumber(
          leaves?.approved ||
            leaves?.approvedCount
        );

    const rejected = Array.isArray(leaves)
      ? getCountFromStats(
          leaves,
          "Rejected"
        )
      : toNumber(
          leaves?.rejected ||
            leaves?.rejectedCount
        );

    const cancelled = Array.isArray(leaves)
      ? getCountFromStats(
          leaves,
          "Cancelled"
        )
      : toNumber(
          leaves?.cancelled ||
            leaves?.cancelledCount
        );

    const total = Array.isArray(leaves)
      ? getStatsTotal(leaves)
      : toNumber(
          leaves?.total ||
            leaves?.totalRequests
        );

    return {
      pending,
      approved,
      rejected,
      cancelled,
      total:
        total ||
        pending +
          approved +
          rejected +
          cancelled,
    };
  }, [report]);

  const employeeStats = useMemo(() => {
    const employees =
      report?.employees ||
      report?.employeeSummary ||
      {};

    return {
      total: toNumber(
        employees?.total ||
          employees?.totalEmployees ||
          report?.totalEmployees
      ),
      active: toNumber(
        employees?.active ||
          employees?.activeEmployees ||
          report?.activeEmployees
      ),
      inactive: toNumber(
        employees?.inactive ||
          employees?.inactiveEmployees ||
          report?.inactiveEmployees
      ),
    };
  }, [report]);

  const attendancePercentage =
    attendanceStats.total > 0
      ? Math.round(
          (attendanceStats.present /
            attendanceStats.total) *
            100
        )
      : 0;

  const leaveApprovalPercentage =
    leaveStats.total > 0
      ? Math.round(
          (leaveStats.approved /
            leaveStats.total) *
            100
        )
      : 0;

  const activeRate =
    employeeStats.total > 0
      ? Math.round(
          (employeeStats.active /
            employeeStats.total) *
            100
        )
      : 0;

  const getBarWidth = (
    value,
    total
  ) => {
    if (!total || !value) {
      return "0%";
    }

    return `${Math.min(
      100,
      Math.round(
        (value / total) * 100
      )
    )}%`;
  };

  if (authLoading || loading) {
    return (
      <MainLayout
        user={user}
        onLogout={logout}
        onSearch={handleSearch}
        notificationCount={0}
      >
        <div className="hr-reports-loading">
          <Loader />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      user={user}
      onLogout={logout}
      onSearch={handleSearch}
      notificationCount={0}
    >
      <div className="hr-reports-page">
        <div className="hr-reports-header">
          <div>
            <div className="hr-reports-breadcrumb">
              HR <span>/</span> Reports
            </div>

            <h1>HR Reports</h1>

            <p>
              Workforce, attendance and leave
              performance overview.
            </p>
          </div>

          <div className="hr-reports-header-actions">
            <select
              className="hr-reports-period-select"
              value={period}
              onChange={(event) =>
                setPeriod(
                  event.target.value
                )
              }
            >
              {PERIOD_OPTIONS.map(
                (option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                )
              )}
            </select>

            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                loadReports(true)
              }
              disabled={refreshing}
            >
              {refreshing
                ? "Refreshing..."
                : "↻ Refresh"}
            </Button>
          </div>
        </div>

        {error && (
          <div className="hr-reports-error">
            <span>{error}</span>

            <button
              type="button"
              onClick={() =>
                loadReports()
              }
            >
              Try Again
            </button>
          </div>
        )}

        <div className="hr-reports-period">
          Showing report for{" "}
          <strong>
            {getPeriodLabel(period)}
          </strong>
        </div>

        <section className="hr-report-section">
          <div className="hr-report-section-header">
            <div>
              <h2>Employee Overview</h2>

              <p>
                Workforce information available
                for the selected report.
              </p>
            </div>
          </div>

          <div className="hr-report-stat-grid">
            <div className="hr-report-stat-card">
              <div className="hr-report-stat-icon">
                👥
              </div>

              <div>
                <span>Total Employees</span>

                <strong>
                  {formatNumber(
                    employeeStats.total
                  )}
                </strong>
              </div>
            </div>

            <div className="hr-report-stat-card">
              <div className="hr-report-stat-icon">
                ✓
              </div>

              <div>
                <span>Active Employees</span>

                <strong>
                  {formatNumber(
                    employeeStats.active
                  )}
                </strong>
              </div>
            </div>

            <div className="hr-report-stat-card">
              <div className="hr-report-stat-icon">
                ⏸
              </div>

              <div>
                <span>Inactive Employees</span>

                <strong>
                  {formatNumber(
                    employeeStats.inactive
                  )}
                </strong>
              </div>
            </div>

            <div className="hr-report-stat-card">
              <div className="hr-report-stat-icon">
                %
              </div>

              <div>
                <span>Active Rate</span>

                <strong>
                  {activeRate}%
                </strong>
              </div>
            </div>
          </div>
        </section>

        <div className="hr-reports-grid">
          <section className="hr-report-section">
            <div className="hr-report-section-header">
              <div>
                <h2>Attendance Report</h2>

                <p>
                  Attendance status distribution
                  for the selected period.
                </p>
              </div>

              <Badge variant="success">
                {attendancePercentage}% Present
              </Badge>
            </div>

            <div className="hr-report-chart">
              <div className="hr-report-chart-row">
                <div className="hr-report-chart-label">
                  <span>Present</span>

                  <strong>
                    {formatNumber(
                      attendanceStats.present
                    )}
                  </strong>
                </div>

                <div className="hr-report-progress">
                  <div
                    className="hr-report-progress-fill"
                    style={{
                      width:
                        getBarWidth(
                          attendanceStats.present,
                          attendanceStats.total
                        ),
                    }}
                  />
                </div>
              </div>

              <div className="hr-report-chart-row">
                <div className="hr-report-chart-label">
                  <span>Absent</span>

                  <strong>
                    {formatNumber(
                      attendanceStats.absent
                    )}
                  </strong>
                </div>

                <div className="hr-report-progress">
                  <div
                    className="hr-report-progress-fill absent"
                    style={{
                      width:
                        getBarWidth(
                          attendanceStats.absent,
                          attendanceStats.total
                        ),
                    }}
                  />
                </div>
              </div>

              <div className="hr-report-chart-row">
                <div className="hr-report-chart-label">
                  <span>Late</span>

                  <strong>
                    {formatNumber(
                      attendanceStats.late
                    )}
                  </strong>
                </div>

                <div className="hr-report-progress">
                  <div
                    className="hr-report-progress-fill late"
                    style={{
                      width:
                        getBarWidth(
                          attendanceStats.late,
                          attendanceStats.total
                        ),
                    }}
                  />
                </div>
              </div>

              <div className="hr-report-chart-row">
                <div className="hr-report-chart-label">
                  <span>Half Day</span>

                  <strong>
                    {formatNumber(
                      attendanceStats.halfDay
                    )}
                  </strong>
                </div>

                <div className="hr-report-progress">
                  <div
                    className="hr-report-progress-fill half-day"
                    style={{
                      width:
                        getBarWidth(
                          attendanceStats.halfDay,
                          attendanceStats.total
                        ),
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="hr-report-total-box">
              <span>
                Total Attendance Records
              </span>

              <strong>
                {formatNumber(
                  attendanceStats.total
                )}
              </strong>
            </div>
          </section>

          <section className="hr-report-section">
            <div className="hr-report-section-header">
              <div>
                <h2>Leave Report</h2>

                <p>
                  Leave request status
                  distribution.
                </p>
              </div>

              <Badge variant="success">
                {leaveApprovalPercentage}% Approved
              </Badge>
            </div>

            <div className="hr-leave-report-grid">
              <div className="hr-leave-report-item">
                <span>Total Requests</span>

                <strong>
                  {formatNumber(
                    leaveStats.total
                  )}
                </strong>
              </div>

              <div className="hr-leave-report-item">
                <span>Pending</span>

                <strong>
                  {formatNumber(
                    leaveStats.pending
                  )}
                </strong>
              </div>

              <div className="hr-leave-report-item">
                <span>Approved</span>

                <strong>
                  {formatNumber(
                    leaveStats.approved
                  )}
                </strong>
              </div>

              <div className="hr-leave-report-item">
                <span>Rejected</span>

                <strong>
                  {formatNumber(
                    leaveStats.rejected
                  )}
                </strong>
              </div>
            </div>

            <div className="hr-report-chart">
              <div className="hr-report-chart-row">
                <div className="hr-report-chart-label">
                  <span>Approved</span>

                  <strong>
                    {formatNumber(
                      leaveStats.approved
                    )}
                  </strong>
                </div>

                <div className="hr-report-progress">
                  <div
                    className="hr-report-progress-fill"
                    style={{
                      width:
                        getBarWidth(
                          leaveStats.approved,
                          leaveStats.total
                        ),
                    }}
                  />
                </div>
              </div>

              <div className="hr-report-chart-row">
                <div className="hr-report-chart-label">
                  <span>Pending</span>

                  <strong>
                    {formatNumber(
                      leaveStats.pending
                    )}
                  </strong>
                </div>

                <div className="hr-report-progress">
                  <div
                    className="hr-report-progress-fill pending"
                    style={{
                      width:
                        getBarWidth(
                          leaveStats.pending,
                          leaveStats.total
                        ),
                    }}
                  />
                </div>
              </div>

              <div className="hr-report-chart-row">
                <div className="hr-report-chart-label">
                  <span>Rejected</span>

                  <strong>
                    {formatNumber(
                      leaveStats.rejected
                    )}
                  </strong>
                </div>

                <div className="hr-report-progress">
                  <div
                    className="hr-report-progress-fill rejected"
                    style={{
                      width:
                        getBarWidth(
                          leaveStats.rejected,
                          leaveStats.total
                        ),
                    }}
                  />
                </div>
              </div>

              {leaveStats.cancelled > 0 && (
                <div className="hr-report-chart-row">
                  <div className="hr-report-chart-label">
                    <span>Cancelled</span>

                    <strong>
                      {formatNumber(
                        leaveStats.cancelled
                      )}
                    </strong>
                  </div>

                  <div className="hr-report-progress">
                    <div
                      className="hr-report-progress-fill pending"
                      style={{
                        width:
                          getBarWidth(
                            leaveStats.cancelled,
                            leaveStats.total
                          ),
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

        <section className="hr-report-section hr-report-bottom">
          <div className="hr-report-section-header">
            <div>
              <h2>HR Summary</h2>

              <p>
                Key workforce metrics for{" "}
                {getPeriodLabel(
                  period
                ).toLowerCase()}
                .
              </p>
            </div>
          </div>

          <div className="hr-summary-grid">
            <div className="hr-summary-item">
              <span>Attendance Rate</span>

              <strong>
                {attendancePercentage}%
              </strong>

              <small>
                Based on available attendance
                records
              </small>
            </div>

            <div className="hr-summary-item">
              <span>Leave Approval Rate</span>

              <strong>
                {leaveApprovalPercentage}%
              </strong>

              <small>
                Based on available leave
                requests
              </small>
            </div>

            <div className="hr-summary-item">
              <span>Active Workforce</span>

              <strong>
                {formatNumber(
                  employeeStats.active
                )}
              </strong>

              <small>
                Active employee records
              </small>
            </div>

            <div className="hr-summary-item">
              <span>Pending Leave Requests</span>

              <strong>
                {formatNumber(
                  leaveStats.pending
                )}
              </strong>

              <small>
                Requests awaiting decision
              </small>
            </div>
          </div>
        </section>

        {!report && !error && (
          <div className="hr-reports-empty">
            <div>📊</div>

            <h3>
              No report data available
            </h3>

            <p>
              There is no report data available
              for the selected period.
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default HrReportsPage;