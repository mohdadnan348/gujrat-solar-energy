"use client";

import React, { useEffect, useMemo, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import StatCard from "@/components/dashboard/StatCard";
import { useAuth } from "@/hooks/useAuth";
import dashboardService from "@/services/dashboard.service";

const HRDashboardPage = () => {
  const { user, logout, loading: authLoading } = useAuth();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleLogout = async () => {
    await logout();
  };

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await dashboardService.getDashboard();

      const data =
        response?.data?.dashboard ||
        response?.data?.data ||
        response?.data ||
        response?.dashboard ||
        response ||
        {};

      setDashboard(data);
    } catch (err) {
      console.error("Failed to load HR dashboard:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const stats = dashboard?.stats || {};
  const analytics = dashboard?.analytics || {};

  const attendanceStats = Array.isArray(analytics.attendance)
    ? analytics.attendance
    : [];

  const leaveStats = Array.isArray(analytics.leaves)
    ? analytics.leaves
    : [];

  const getAttendanceCount = (status) => {
    const item = attendanceStats.find(
      (entry) =>
        String(entry?._id || "").toLowerCase() ===
        String(status).toLowerCase()
    );

    return Number(item?.count || 0);
  };

  const getLeaveCount = (status) => {
    const item = leaveStats.find(
      (entry) =>
        String(entry?._id || "").toLowerCase() ===
        String(status).toLowerCase()
    );

    return Number(item?.count || 0);
  };

  const totalEmployees = Number(
    stats?.users?.activeEmployees || 0
  );

  const presentEmployees = getAttendanceCount("Present");
  const absentEmployees = getAttendanceCount("Absent");
  const lateEmployees = getAttendanceCount("Late");
  const halfDayEmployees = getAttendanceCount("Half Day");

  const pendingLeaves = Number(
    stats?.leaves?.pending ?? getLeaveCount("Pending")
  );

  const approvedLeaves = getLeaveCount("Approved");
  const rejectedLeaves = getLeaveCount("Rejected");

  const attendanceTotal =
    presentEmployees +
    absentEmployees +
    lateEmployees +
    halfDayEmployees;

  const attendanceRate =
    attendanceTotal > 0
      ? (presentEmployees / attendanceTotal) * 100
      : 0;

  const formatNumber = (value) => {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return "0";
    }

    return new Intl.NumberFormat("en-IN").format(number);
  };

  const formatPercentage = (value) => {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return "0.0%";
    }

    return `${number.toFixed(1)}%`;
  };

  const periodText = useMemo(() => {
    const from = stats?.period?.from;
    const to = stats?.period?.to;

    if (!from || !to) {
      return "Current reporting period";
    }

    try {
      const fromDate = new Date(from);
      const toDate = new Date(to);

      if (
        Number.isNaN(fromDate.getTime()) ||
        Number.isNaN(toDate.getTime())
      ) {
        return "Current reporting period";
      }

      const formatter = new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      return `${formatter.format(fromDate)} - ${formatter.format(
        toDate
      )}`;
    } catch {
      return "Current reporting period";
    }
  }, [stats?.period?.from, stats?.period?.to]);

  if (authLoading) {
    return (
      <div className="hr-dashboard-loading">
        Loading...
      </div>
    );
  }

  return (
    <MainLayout
      user={user}
      onLogout={handleLogout}
      onSearch={(value) =>
        console.log("HR global search:", value)
      }
      notificationCount={0}
    >
      <div className="hr-dashboard-page">
        <div className="hr-dashboard-header">
          <div>
            <span className="hr-dashboard-eyebrow">
              Human Resources
            </span>

            <h1>HR Dashboard</h1>

            <p>
              Monitor employees, attendance and leave activities.
            </p>
          </div>

          <div className="hr-dashboard-header-actions">
            <span className="hr-dashboard-period">
              {periodText}
            </span>

            <button
              type="button"
              className="hr-dashboard-refresh"
              onClick={loadDashboard}
              disabled={loading}
            >
              {loading ? "Refreshing..." : "↻ Refresh"}
            </button>
          </div>
        </div>

        {error && (
          <div className="hr-dashboard-error">
            <span>{error}</span>

            <button
              type="button"
              onClick={loadDashboard}
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="hr-dashboard-loading-content">
            Loading dashboard...
          </div>
        ) : (
          <>
            <div className="hr-dashboard-stats">
              <StatCard
                title="Total Employees"
                value={formatNumber(totalEmployees)}
                icon={
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="9" cy="7" r="4" />
                    <path d="M2.5 21a6.5 6.5 0 0 1 13 0" />
                    <path d="M16 4.5a3.5 3.5 0 0 1 0 7" />
                    <path d="M18 14a5.5 5.5 0 0 1 3.5 5" />
                  </svg>
                }
                variant="primary"
              />

              <StatCard
                title="Present Today"
                value={formatNumber(presentEmployees)}
                icon={
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path d="m8 12 2.5 2.5L16 9" />
                  </svg>
                }
                variant="success"
              />

              <StatCard
                title="Absent Today"
                value={formatNumber(absentEmployees)}
                icon={
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path d="m9 9 6 6" />
                    <path d="m15 9-6 6" />
                  </svg>
                }
                variant="danger"
              />

              <StatCard
                title="Pending Leaves"
                value={formatNumber(pendingLeaves)}
                icon={
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
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
                    <circle cx="12" cy="15" r="2.5" />
                    <path d="M12 13.5v1.5l1 1" />
                  </svg>
                }
                variant="warning"
              />
            </div>

            <div className="hr-dashboard-attendance-card">
              <div className="hr-dashboard-attendance-header">
                <div>
                  <span>Attendance</span>
                  <h2>Attendance Overview</h2>
                </div>

                <strong>
                  {formatPercentage(attendanceRate)}
                </strong>
              </div>

              <div className="hr-dashboard-attendance-progress">
                <span
                  style={{
                    width: `${Math.min(
                      Math.max(attendanceRate, 0),
                      100
                    )}%`,
                  }}
                />
              </div>

              <div className="hr-dashboard-attendance-meta">
                <div>
                  <span>Present</span>
                  <strong>
                    {formatNumber(presentEmployees)}
                  </strong>
                </div>

                <div>
                  <span>Absent</span>
                  <strong>
                    {formatNumber(absentEmployees)}
                  </strong>
                </div>

                <div>
                  <span>Late</span>
                  <strong>
                    {formatNumber(lateEmployees)}
                  </strong>
                </div>

                <div>
                  <span>Half Day</span>
                  <strong>
                    {formatNumber(halfDayEmployees)}
                  </strong>
                </div>
              </div>
            </div>

            <div className="hr-dashboard-main-grid">
              <div className="hr-dashboard-panel">
                <div className="hr-dashboard-panel-header">
                  <div>
                    <span>Attendance</span>
                    <h2>Attendance Status</h2>
                  </div>
                </div>

                <div className="hr-dashboard-status-list">
                  <div className="hr-dashboard-status-item">
                    <div>
                      <span className="hr-status-dot hr-dot-present" />
                      <strong>Present</strong>
                    </div>

                    <strong>
                      {formatNumber(presentEmployees)}
                    </strong>
                  </div>

                  <div className="hr-dashboard-status-item">
                    <div>
                      <span className="hr-status-dot hr-dot-absent" />
                      <strong>Absent</strong>
                    </div>

                    <strong>
                      {formatNumber(absentEmployees)}
                    </strong>
                  </div>

                  <div className="hr-dashboard-status-item">
                    <div>
                      <span className="hr-status-dot hr-dot-late" />
                      <strong>Late</strong>
                    </div>

                    <strong>
                      {formatNumber(lateEmployees)}
                    </strong>
                  </div>

                  <div className="hr-dashboard-status-item">
                    <div>
                      <span className="hr-status-dot hr-dot-half" />
                      <strong>Half Day</strong>
                    </div>

                    <strong>
                      {formatNumber(halfDayEmployees)}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="hr-dashboard-panel">
                <div className="hr-dashboard-panel-header">
                  <div>
                    <span>Leave Management</span>
                    <h2>Leave Overview</h2>
                  </div>
                </div>

                <div className="hr-dashboard-leave-summary">
                  <div className="hr-dashboard-leave-box">
                    <span>Pending</span>
                    <strong>
                      {formatNumber(pendingLeaves)}
                    </strong>
                  </div>

                  <div className="hr-dashboard-leave-box">
                    <span>Approved</span>
                    <strong>
                      {formatNumber(approvedLeaves)}
                    </strong>
                  </div>

                  <div className="hr-dashboard-leave-box">
                    <span>Rejected</span>
                    <strong>
                      {formatNumber(rejectedLeaves)}
                    </strong>
                  </div>
                </div>

                {leaveStats.length > 0 ? (
                  <div className="hr-dashboard-leave-list">
                    {leaveStats
                      .slice(0, 5)
                      .map((item, index) => {
                        const status =
                          item?._id || "Unknown";

                        return (
                          <div
                            className="hr-dashboard-leave-item"
                            key={`${status}-${index}`}
                          >
                            <div>
                              <strong>
                                {status}
                              </strong>

                              <small>
                                Leave requests
                              </small>
                            </div>

                            <span
                              className={`hr-dashboard-leave-status hr-status-${String(
                                status
                              )
                                .toLowerCase()
                                .replace(/\s+/g, "-")}`}
                            >
                              {formatNumber(
                                item?.count
                              )}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <div className="hr-dashboard-empty">
                    <span>▣</span>
                    <strong>
                      No leave statistics available
                    </strong>
                  </div>
                )}
              </div>
            </div>

            <div className="hr-dashboard-workforce">
              <div className="hr-dashboard-panel">
                <div className="hr-dashboard-panel-header">
                  <div>
                    <span>Workforce</span>
                    <h2>Employee Summary</h2>
                  </div>
                </div>

                <div className="hr-dashboard-workforce-grid">
                  <div>
                    <span>Active Employees</span>
                    <strong>
                      {formatNumber(totalEmployees)}
                    </strong>
                  </div>

                  <div>
                    <span>Attendance Records</span>
                    <strong>
                      {formatNumber(attendanceTotal)}
                    </strong>
                  </div>

                  <div>
                    <span>Late Employees</span>
                    <strong>
                      {formatNumber(lateEmployees)}
                    </strong>
                  </div>

                  <div>
                    <span>Half Day Records</span>
                    <strong>
                      {formatNumber(halfDayEmployees)}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default HRDashboardPage;