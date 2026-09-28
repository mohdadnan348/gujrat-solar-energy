"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import Loader from "@/components/common/Loader";
import Badge from "@/components/common/Badge";
import Button from "@/components/common/Button";

import EmployeeStats from "@/components/dashboard/EmployeeStats";
import LeadChart from "@/components/dashboard/LeadChart";
import SalesChart from "@/components/dashboard/SalesChart";
import RecentLeads from "@/components/dashboard/RecentLeads";
import RecentQuotations from "@/components/dashboard/RecentQuotations";
import RecentTasks from "@/components/dashboard/RecentTasks";

import { useAuth } from "@/hooks/useAuth";
import dashboardService from "@/services/dashboard.service";

import "./dashboard.css";

const EmployeeDashboardPage = () => {
  const router = useRouter();

  const { user, loading: authLoading } = useAuth();

  const [dashboard, setDashboard] = useState(null);
  const [summary, setSummary] = useState(null);

  const [recentLeads, setRecentLeads] = useState([]);
  const [recentQuotations, setRecentQuotations] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  /* =====================================================
     HELPERS
  ===================================================== */

  const extractData = useCallback((response) => {
    if (!response) return {};

    return (
      response?.data?.dashboard ||
      response?.data?.data ||
      response?.dashboard ||
      response?.data ||
      response ||
      {}
    );
  }, []);

  const extractArray = useCallback((response) => {
    if (!response) return [];

    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response?.data)) {
      return response.data;
    }

    if (Array.isArray(response?.data?.data)) {
      return response.data.data;
    }

    if (Array.isArray(response?.data?.items)) {
      return response.data.items;
    }

    if (Array.isArray(response?.items)) {
      return response.items;
    }

    if (Array.isArray(response?.leads)) {
      return response.leads;
    }

    if (Array.isArray(response?.quotations)) {
      return response.quotations;
    }

    if (Array.isArray(response?.tasks)) {
      return response.tasks;
    }

    return [];
  }, []);

  const getValue = useCallback((...values) => {
    for (const value of values) {
      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        return value;
      }
    }

    return 0;
  }, []);

  /* =====================================================
     LOAD DASHBOARD
  ===================================================== */

  const loadDashboard = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        /*
         * Dashboard main API is primary source.
         *
         * Other APIs are loaded independently so that
         * one failed dashboard section does not make the
         * complete dashboard blank.
         */
        const results = await Promise.allSettled([
          dashboardService.getDashboard(),

          dashboardService.getSummary(),

          dashboardService.getRecentLeads({
            limit: 5,
          }),

          dashboardService.getRecentQuotations({
            limit: 5,
          }),

          dashboardService.getUpcomingTasks({
            limit: 5,
          }),
        ]);

        const dashboardResult = results[0];
        const summaryResult = results[1];
        const recentLeadsResult = results[2];
        const recentQuotationsResult = results[3];
        const upcomingTasksResult = results[4];

        /* ---------------- Main Dashboard ---------------- */

        if (dashboardResult.status === "fulfilled") {
          const dashboardData = extractData(
            dashboardResult.value
          );

          setDashboard(dashboardData);
        }

        /* ---------------- Summary ---------------- */

        if (summaryResult.status === "fulfilled") {
          const summaryData = extractData(
            summaryResult.value
          );

          setSummary(summaryData);
        }

        /* ---------------- Recent Leads ---------------- */

        if (recentLeadsResult.status === "fulfilled") {
          const leads = extractArray(
            recentLeadsResult.value
          );

          setRecentLeads(leads);
        }

        /* ---------------- Recent Quotations ---------------- */

        if (
          recentQuotationsResult.status === "fulfilled"
        ) {
          const quotations = extractArray(
            recentQuotationsResult.value
          );

          setRecentQuotations(quotations);
        }

        /* ---------------- Upcoming Tasks ---------------- */

        if (upcomingTasksResult.status === "fulfilled") {
          const tasks = extractArray(
            upcomingTasksResult.value
          );

          setUpcomingTasks(tasks);
        }

        /*
         * Only show error when the main dashboard request
         * itself fails.
         */
        if (
          dashboardResult.status === "rejected" &&
          summaryResult.status === "rejected"
        ) {
          throw (
            dashboardResult.reason ||
            summaryResult.reason
          );
        }
      } catch (err) {
        console.error(
          "Employee dashboard loading error:",
          err
        );

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to load dashboard data."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [extractArray, extractData]
  );

  useEffect(() => {
    if (!authLoading) {
      loadDashboard();
    }
  }, [authLoading, loadDashboard]);

  /* =====================================================
     NORMALIZE DASHBOARD DATA
  ===================================================== */

  const dashboardStats = useMemo(() => {
    return (
      dashboard?.stats ||
      summary?.stats ||
      summary ||
      {}
    );
  }, [dashboard, summary]);

  const analytics = useMemo(() => {
    return (
      dashboard?.analytics ||
      summary?.analytics ||
      {}
    );
  }, [dashboard, summary]);

  const leadAnalytics = useMemo(() => {
    return (
      analytics?.leads ||
      dashboard?.leads ||
      dashboardStats?.leads ||
      {}
    );
  }, [analytics, dashboard, dashboardStats]);

  const quotationAnalytics = useMemo(() => {
    return (
      analytics?.quotations ||
      dashboard?.quotations ||
      dashboardStats?.quotations ||
      {}
    );
  }, [analytics, dashboard, dashboardStats]);

  const taskAnalytics = useMemo(() => {
    return (
      analytics?.tasks ||
      dashboard?.tasks ||
      dashboardStats?.tasks ||
      {}
    );
  }, [analytics, dashboard, dashboardStats]);

  const attendanceAnalytics = useMemo(() => {
    return (
      analytics?.attendance ||
      dashboard?.attendance ||
      dashboardStats?.attendance ||
      {}
    );
  }, [analytics, dashboard, dashboardStats]);

  const leaveAnalytics = useMemo(() => {
    return (
      analytics?.leaves ||
      dashboard?.leaves ||
      dashboardStats?.leaves ||
      {}
    );
  }, [analytics, dashboard, dashboardStats]);

  /* =====================================================
     RECENT DATA FALLBACK
  ===================================================== */

  const finalRecentLeads = useMemo(() => {
    if (recentLeads.length > 0) {
      return recentLeads;
    }

    return dashboard?.recent?.leads || [];
  }, [recentLeads, dashboard]);

  const finalRecentQuotations = useMemo(() => {
    if (recentQuotations.length > 0) {
      return recentQuotations;
    }

    return dashboard?.recent?.quotations || [];
  }, [recentQuotations, dashboard]);

  const finalRecentTasks = useMemo(() => {
    if (upcomingTasks.length > 0) {
      return upcomingTasks;
    }

    return dashboard?.recent?.tasks || [];
  }, [upcomingTasks, dashboard]);

  /* =====================================================
     CHART DATA
  ===================================================== */

  const leadChartData = useMemo(() => {
    return (
      dashboard?.leadChart ||
      dashboard?.leadData ||
      dashboard?.leadsChart ||
      dashboard?.leadOverview ||
      leadAnalytics?.chart ||
      leadAnalytics?.overview ||
      leadAnalytics?.status ||
      []
    );
  }, [dashboard, leadAnalytics]);

  const salesChartData = useMemo(() => {
    return (
      dashboard?.salesChart ||
      dashboard?.salesData ||
      dashboard?.revenueChart ||
      dashboard?.salesOverview ||
      quotationAnalytics?.chart ||
      quotationAnalytics?.overview ||
      []
    );
  }, [dashboard, quotationAnalytics]);

  /* =====================================================
     EMPLOYEE STATS
  ===================================================== */

  const employeeStats = useMemo(() => {
    return {
      stats: {
        leads: {
          my: Number(
            getValue(
              dashboardStats?.leads?.my,
              dashboardStats?.leads?.total,
              leadAnalytics?.my,
              leadAnalytics?.total,
              dashboardStats?.myLeads
            )
          ),
          total: Number(
            getValue(
              dashboardStats?.leads?.total,
              leadAnalytics?.total
            )
          ),
        },

        tasks: {
          my: Number(
            getValue(
              dashboardStats?.tasks?.my,
              dashboardStats?.tasks?.total,
              taskAnalytics?.my,
              taskAnalytics?.total,
              dashboardStats?.myTasks
            )
          ),

          total: Number(
            getValue(
              dashboardStats?.tasks?.total,
              taskAnalytics?.total
            )
          ),

          pending: Number(
            getValue(
              dashboardStats?.tasks?.pending,
              taskAnalytics?.pending,
              dashboardStats?.pendingTasks
            )
          ),

          completed: Number(
            getValue(
              dashboardStats?.tasks?.completed,
              taskAnalytics?.completed,
              dashboardStats?.completedTasks
            )
          ),
        },
      },
    };
  }, [
    dashboardStats,
    leadAnalytics,
    taskAnalytics,
    getValue,
  ]);

  /* =====================================================
     QUICK SUMMARY
  ===================================================== */

  const totalQuotations = Number(
    getValue(
      quotationAnalytics?.total,
      dashboardStats?.quotations?.total,
      dashboardStats?.totalQuotations
    )
  );

  const totalInvoices = Number(
    getValue(
      analytics?.invoices?.total,
      dashboard?.invoices?.total,
      dashboardStats?.invoices?.total,
      dashboardStats?.totalInvoices
    )
  );

  const presentToday = Number(
    getValue(
      attendanceAnalytics?.presentToday,
      attendanceAnalytics?.present,
      dashboardStats?.attendance?.presentToday
    )
  );

  const pendingLeaves = Number(
    getValue(
      leaveAnalytics?.pending,
      leaveAnalytics?.pendingRequests,
      dashboardStats?.leaves?.pending
    )
  );

  const pendingTasks = Number(
    getValue(
      taskAnalytics?.pending,
      dashboardStats?.tasks?.pending,
      dashboardStats?.pendingTasks
    )
  );

  const completedTasks = Number(
    getValue(
      taskAnalytics?.completed,
      dashboardStats?.tasks?.completed,
      dashboardStats?.completedTasks
    )
  );

  /* =====================================================
     USER
  ===================================================== */

  const employeeName =
    user?.name ||
    user?.username ||
    user?.fullName ||
    "Employee";

  /* =====================================================
     LOADING
  ===================================================== */

  if (authLoading || loading) {
    return (
      <div className="employee-dashboard-loading">
        <Loader />

        <p>Loading your dashboard...</p>
      </div>
    );
  }

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="employee-dashboard-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <section className="employee-dashboard-header">

        <div className="employee-dashboard-heading">

          <div className="employee-dashboard-breadcrumb">
            Employee
            <span>/</span>
            Dashboard
          </div>

          <div className="employee-dashboard-title-row">

            <div>
              <h1>
                Welcome back, {employeeName}
              </h1>

              <p>
                Here's your latest work overview and
                activity.
              </p>
            </div>

            <Badge variant="success">
              Employee
            </Badge>

          </div>

        </div>

        <div className="employee-dashboard-actions">

          <Button
            type="button"
            variant="secondary"
            onClick={() => loadDashboard(true)}
            disabled={refreshing}
          >
            {refreshing
              ? "Refreshing..."
              : "↻ Refresh"}
          </Button>

        </div>

      </section>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="employee-dashboard-error">

          <div>
            <strong>
              Dashboard data load nahi hua
            </strong>

            <span>{error}</span>
          </div>

          <button
            type="button"
            onClick={() => loadDashboard()}
          >
            Try Again
          </button>

        </div>
      )}

      {/* =================================================
          STATS
      ================================================= */}

      <section className="employee-dashboard-section">

        <div className="employee-dashboard-section-heading">

          <div>
            <h2>My Overview</h2>

            <p>
              Your assigned work and current activity.
            </p>
          </div>

        </div>

        <EmployeeStats
          stats={employeeStats}
          loading={refreshing}
        />

      </section>

      {/* =================================================
          QUICK SUMMARY
      ================================================= */}

      <section className="employee-dashboard-summary-grid">

        <div className="employee-summary-card">

          <div className="employee-summary-icon green">
            ✓
          </div>

          <div>
            <span>Completed Tasks</span>
            <strong>{completedTasks}</strong>
            <small>
              Tasks completed by you
            </small>
          </div>

        </div>

        <div className="employee-summary-card">

          <div className="employee-summary-icon orange">
            ⏳
          </div>

          <div>
            <span>Pending Tasks</span>
            <strong>{pendingTasks}</strong>
            <small>
              Tasks waiting for action
            </small>
          </div>

        </div>

        <div className="employee-summary-card">

          <div className="employee-summary-icon blue">
            ₹
          </div>

          <div>
            <span>Quotations</span>
            <strong>{totalQuotations}</strong>
            <small>
              Your quotation records
            </small>
          </div>

        </div>

        <div className="employee-summary-card">

          <div className="employee-summary-icon purple">
            ✓
          </div>

          <div>
            <span>Present Today</span>
            <strong>{presentToday}</strong>
            <small>
              Attendance status
            </small>
          </div>

        </div>

        <div className="employee-summary-card">

          <div className="employee-summary-icon red">
            !
          </div>

          <div>
            <span>Pending Leaves</span>
            <strong>{pendingLeaves}</strong>
            <small>
              Leave requests pending
            </small>
          </div>

        </div>

        <div className="employee-summary-card">

          <div className="employee-summary-icon cyan">
            #
          </div>

          <div>
            <span>Invoices</span>
            <strong>{totalInvoices}</strong>
            <small>
              Invoice records
            </small>
          </div>

        </div>

      </section>

      {/* =================================================
          CHARTS
      ================================================= */}

      <section className="employee-dashboard-chart-grid">

        <div className="employee-dashboard-card">

          <div className="employee-dashboard-card-header">

            <div>
              <h2>Lead Overview</h2>

              <p>
                Your lead activity and pipeline.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                router.push("/employee/leads")
              }
              className="employee-dashboard-link"
            >
              View All
            </button>

          </div>

          <div className="employee-dashboard-chart-body">
            <LeadChart data={leadChartData} />
          </div>

        </div>

        <div className="employee-dashboard-card">

          <div className="employee-dashboard-card-header">

            <div>
              <h2>Quotation Overview</h2>

              <p>
                Your quotation and sales activity.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                router.push("/employee/quotations")
              }
              className="employee-dashboard-link"
            >
              View All
            </button>

          </div>

          <div className="employee-dashboard-chart-body">
            <SalesChart data={salesChartData} />
          </div>

        </div>

      </section>

      {/* =================================================
          RECENT ACTIVITY
      ================================================= */}

      <section className="employee-dashboard-recent-grid">

        {/* Recent Leads */}

        <div className="employee-dashboard-card">

          <div className="employee-dashboard-card-header">

            <div>
              <h2>Recent Leads</h2>

              <p>
                Latest leads assigned to you.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                router.push("/employee/leads")
              }
              className="employee-dashboard-link"
            >
              View All
            </button>

          </div>

          <div className="employee-dashboard-list">
            <RecentLeads
              leads={finalRecentLeads}
            />
          </div>

        </div>

        {/* Recent Quotations */}

        <div className="employee-dashboard-card">

          <div className="employee-dashboard-card-header">

            <div>
              <h2>Recent Quotations</h2>

              <p>
                Latest quotation activity.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                router.push("/employee/quotations")
              }
              className="employee-dashboard-link"
            >
              View All
            </button>

          </div>

          <div className="employee-dashboard-list">
            <RecentQuotations
              quotations={
                finalRecentQuotations
              }
            />
          </div>

        </div>

      </section>

      {/* =================================================
          TASKS
      ================================================= */}

      <section className="employee-dashboard-card employee-dashboard-tasks-card">

        <div className="employee-dashboard-card-header">

          <div>
            <h2>Upcoming Tasks</h2>

            <p>
              Tasks that need your attention.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              router.push("/employee/tasks")
            }
            className="employee-dashboard-link"
          >
            View All
          </button>

        </div>

        <div className="employee-dashboard-list">
          <RecentTasks
            tasks={finalRecentTasks}
          />
        </div>

      </section>

      {/* =================================================
          QUICK ACTIONS
      ================================================= */}

      <section className="employee-dashboard-quick-actions">

        <div className="employee-dashboard-quick-heading">

          <div>
            <h2>Quick Actions</h2>

            <p>
              Quickly access your daily work.
            </p>
          </div>

        </div>

        <div className="employee-quick-grid">

          <button
            type="button"
            onClick={() =>
              router.push("/employee/leads")
            }
            className="employee-quick-action"
          >
            <span className="employee-quick-icon green">
              +
            </span>

            <span>
              <strong>My Leads</strong>
              <small>
                Manage assigned leads
              </small>
            </span>

            <b>→</b>
          </button>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/employee/solar-requirements"
              )
            }
            className="employee-quick-action"
          >
            <span className="employee-quick-icon blue">
              ☀
            </span>

            <span>
              <strong>Solar Requirements</strong>
              <small>
                View customer requirements
              </small>
            </span>

            <b>→</b>
          </button>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/employee/system-configurations"
              )
            }
            className="employee-quick-action"
          >
            <span className="employee-quick-icon purple">
              ⚙
            </span>

            <span>
              <strong>Configurations</strong>
              <small>
                Manage solar configurations
              </small>
            </span>

            <b>→</b>
          </button>

          <button
            type="button"
            onClick={() =>
              router.push("/employee/customers")
            }
            className="employee-quick-action"
          >
            <span className="employee-quick-icon orange">
              ♙
            </span>

            <span>
              <strong>Customers</strong>
              <small>
                View assigned customers
              </small>
            </span>

            <b>→</b>
          </button>

          <button
            type="button"
            onClick={() =>
              router.push("/employee/tasks")
            }
            className="employee-quick-action"
          >
            <span className="employee-quick-icon red">
              ✓
            </span>

            <span>
              <strong>My Tasks</strong>
              <small>
                Check pending tasks
              </small>
            </span>

            <b>→</b>
          </button>

          <button
            type="button"
            onClick={() =>
              router.push("/employee/attendance")
            }
            className="employee-quick-action"
          >
            <span className="employee-quick-icon cyan">
              ◷
            </span>

            <span>
              <strong>Attendance</strong>
              <small>
                Check attendance
              </small>
            </span>

            <b>→</b>
          </button>

        </div>

      </section>

    </div>
  );
};

export default EmployeeDashboardPage;