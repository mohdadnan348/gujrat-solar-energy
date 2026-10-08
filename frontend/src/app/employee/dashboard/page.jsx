"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";

import EmployeeStats from "@/components/dashboard/EmployeeStats";
import LeadChart from "@/components/dashboard/LeadChart";
import SalesChart from "@/components/dashboard/SalesChart";
import RecentLeads from "@/components/dashboard/RecentLeads";
import RecentQuotations from "@/components/dashboard/RecentQuotations";
import RecentTasks from "@/components/dashboard/RecentTasks";

import { useAuth } from "@/hooks/useAuth";
import dashboardService from "@/services/dashboard.service";

import Loader from "@/components/common/Loader";
import Badge from "@/components/common/Badge";
import Button from "@/components/common/Button";

import "./dashboard.css";

/* =========================================================
   HELPERS
   ========================================================= */

const extractDashboardData = (response) => {
  return (
    response?.data?.dashboard ||
    response?.data?.data ||
    response?.dashboard ||
    response?.data ||
    response ||
    {}
  );
};

const safeNumber = (value) => {
  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
};

const formatCurrency = (value) => {
  const amount = safeNumber(value);

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const sumAmounts = (items = []) => {
  if (!Array.isArray(items)) {
    return 0;
  }

  return items.reduce((total, item) => {
    return (
      total +
      safeNumber(
        item?.totalAmount ??
          item?.grandTotal ??
          item?.amount ??
          0
      )
    );
  }, 0);
};

/* =========================================================
   ICONS
   ========================================================= */

const LeadIcon = () => (
  <span aria-hidden="true">◉</span>
);

const TaskIcon = () => (
  <span aria-hidden="true">✓</span>
);

const AttendanceIcon = () => (
  <span aria-hidden="true">◷</span>
);

const RevenueIcon = () => (
  <span aria-hidden="true">₹</span>
);

/* =========================================================
   EMPLOYEE DASHBOARD
   ========================================================= */

const EmployeeDashboardPage = () => {
  const { user, loading: authLoading } = useAuth();

  const [dashboardData, setDashboardData] = useState({});
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");

  /* =======================================================
     LOAD DASHBOARD
     ======================================================= */

  const loadDashboard = useCallback(async () => {
    if (!user) {
      return;
    }

    try {
      setDashboardLoading(true);
      setDashboardError("");

      const response =
        await dashboardService.getDashboard();

      const data = extractDashboardData(response);

      setDashboardData(data || {});
    } catch (error) {
      console.error(
        "Employee dashboard error:",
        error
      );

      setDashboardError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to load dashboard data."
      );

      setDashboardData({});
    } finally {
      setDashboardLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading || !user) {
      return;
    }

    let mounted = true;

    const load = async () => {
      try {
        setDashboardLoading(true);
        setDashboardError("");

        const response =
          await dashboardService.getDashboard();

        if (!mounted) {
          return;
        }

        const data =
          extractDashboardData(response);

        setDashboardData(data || {});
      } catch (error) {
        console.error(
          "Employee dashboard error:",
          error
        );

        if (!mounted) {
          return;
        }

        setDashboardError(
          error?.response?.data?.message ||
            error?.message ||
            "Unable to load dashboard data."
        );

        setDashboardData({});
      } finally {
        if (mounted) {
          setDashboardLoading(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [authLoading, user]);

  /* =======================================================
     DATA
     ======================================================= */

  const stats =
    dashboardData?.stats || {};

  const leads =
    stats?.leads || {};

  const customers =
    stats?.customers || {};

  const quotations =
    stats?.quotations || {};

  const invoices =
    stats?.invoices || {};

  const tasks =
    stats?.tasks || {};

  const attendance =
    stats?.attendance || {};

  const analytics =
    dashboardData?.analytics || {};

  const recent =
    dashboardData?.recent || {};

  /* =======================================================
     CHART DATA
     ======================================================= */

  const leadChartData =
    dashboardData?.leadChart ||
    dashboardData?.leadData ||
    dashboardData?.leadsChart ||
    dashboardData?.leadOverview ||
    analytics?.leads?.status ||
    [];

  const quotationChartData =
    dashboardData?.salesChart ||
    dashboardData?.salesData ||
    dashboardData?.quotationChart ||
    dashboardData?.quotationOverview ||
    analytics?.quotations ||
    [];

  /* =======================================================
     REVENUE
     ======================================================= */

  const quotationRevenue = useMemo(() => {
    return sumAmounts(
      analytics?.quotations || []
    );
  }, [analytics?.quotations]);

  const invoiceRevenue = useMemo(() => {
    return sumAmounts(
      analytics?.invoices || []
    );
  }, [analytics?.invoices]);

  /*
   * Prefer invoice revenue when available.
   * Otherwise use quotation totals.
   */
  const employeeRevenue =
    invoiceRevenue > 0
      ? invoiceRevenue
      : quotationRevenue;

  /* =======================================================
     SUMMARY DATA
     ======================================================= */

  const totalLeads = safeNumber(
    leads?.my ?? leads?.total
  );

  const newLeads = safeNumber(
    leads?.new
  );

  const pendingTasks = safeNumber(
    tasks?.pending
  );

  const completedTasks = safeNumber(
    tasks?.completed
  );

  const totalTasks = safeNumber(
    tasks?.my ?? tasks?.total
  );

  const todayAttendance = safeNumber(
    attendance?.today
  );

  const totalCustomers = safeNumber(
    customers?.total
  );

  const totalQuotations = safeNumber(
    quotations?.total
  );

  const totalInvoices = safeNumber(
    invoices?.total
  );

  /* =======================================================
     AUTH LOADING
     ======================================================= */

  if (authLoading) {
    return (
      <div className="employee-dashboard-loading">
        <Loader />
      </div>
    );
  }

  /* =======================================================
     PAGE
     ======================================================= */

  return (
    <div className="admin-dashboard-page employee-dashboard-page">

      {/* ===================================================
          HEADER
          =================================================== */}

      <div className="admin-dashboard-header">

        <div>
          <div className="admin-dashboard-breadcrumb">
            Employee
            <span>/</span>
            Dashboard
          </div>

          <h1>
            Employee Dashboard
          </h1>

          <p>
            Welcome back
            {user?.name
              ? `, ${user.name}`
              : ""}.
            Manage your leads, customers,
            quotations, tasks and daily
            activities from one place.
          </p>
        </div>

        <div className="admin-dashboard-header-actions">
          <Button
            type="button"
            variant="secondary"
            onClick={loadDashboard}
            disabled={dashboardLoading}
          >
            {dashboardLoading
              ? "Refreshing..."
              : "Refresh"}
          </Button>
        </div>

      </div>

      {/* ===================================================
          ERROR
          =================================================== */}

      {dashboardError && (
        <div className="admin-dashboard-error">
          <div>
            {dashboardError}
          </div>

          <button
            type="button"
            onClick={loadDashboard}
          >
            Retry
          </button>
        </div>
      )}

      {/* ===================================================
          BUSINESS OVERVIEW
          =================================================== */}

      <section className="admin-dashboard-section">

        <div className="admin-dashboard-section-header">

          <div>
            <h2>
              My Business Overview
            </h2>

            <p>
              Your leads, customers, quotations,
              invoices, tasks and work activity.
            </p>
          </div>

          <Badge variant="info">
            Employee
          </Badge>

        </div>

        <EmployeeStats
          stats={dashboardData}
          loading={dashboardLoading}
        />

      </section>

      {/* ===================================================
          SUMMARY
          =================================================== */}

      <div className="admin-dashboard-summary">

        {/* Revenue */}

        <div className="admin-dashboard-summary-card">

          <div className="admin-dashboard-summary-top">

            <div>
              <span>
                My Revenue
              </span>

              <strong>
                {dashboardLoading
                  ? "—"
                  : formatCurrency(
                      employeeRevenue
                    )}
              </strong>
            </div>

            <div className="admin-dashboard-summary-icon">
              <RevenueIcon />
            </div>

          </div>

          <p>
            Based on your available
            invoice / quotation data.
          </p>

        </div>

        {/* Pending Tasks */}

        <div className="admin-dashboard-summary-card">

          <div className="admin-dashboard-summary-top">

            <div>
              <span>
                Pending Tasks
              </span>

              <strong>
                {dashboardLoading
                  ? "—"
                  : pendingTasks}
              </strong>
            </div>

            <div className="admin-dashboard-summary-icon">
              <TaskIcon />
            </div>

          </div>

          <p>
            Tasks currently waiting
            for your action.
          </p>

        </div>

        {/* Today's Attendance */}

        <div className="admin-dashboard-summary-card">

          <div className="admin-dashboard-summary-top">

            <div>
              <span>
                Today's Attendance
              </span>

              <strong>
                {dashboardLoading
                  ? "—"
                  : todayAttendance}
              </strong>
            </div>

            <div className="admin-dashboard-summary-icon">
              <AttendanceIcon />
            </div>

          </div>

          <p>
            Attendance records available
            for today.
          </p>

        </div>

        {/* New Leads */}

        <div className="admin-dashboard-summary-card">

          <div className="admin-dashboard-summary-top">

            <div>
              <span>
                New Leads
              </span>

              <strong>
                {dashboardLoading
                  ? "—"
                  : newLeads}
              </strong>
            </div>

            <div className="admin-dashboard-summary-icon">
              <LeadIcon />
            </div>

          </div>

          <p>
            New leads within the
            dashboard period.
          </p>

        </div>

      </div>

      {/* ===================================================
          CHARTS
          =================================================== */}

      <div className="admin-dashboard-chart-grid">

        {/* Lead Overview */}

        <section className="admin-dashboard-chart-card">

          <div className="admin-dashboard-card-header">

            <div>
              <h2>
                Lead Overview
              </h2>

              <p>
                Your lead status distribution.
              </p>
            </div>

            <Badge variant="info">
              {totalLeads} Leads
            </Badge>

          </div>

          <LeadChart
            data={leadChartData}
            loading={dashboardLoading}
          />

        </section>

        {/* Quotation Overview */}

        <section className="admin-dashboard-chart-card">

          <div className="admin-dashboard-card-header">

            <div>
              <h2>
                Quotation Overview
              </h2>

              <p>
                Your quotation pipeline and
                amounts.
              </p>
            </div>

            <Badge variant="success">
              {totalQuotations} Quotations
            </Badge>

          </div>

          <SalesChart
            data={quotationChartData}
            loading={dashboardLoading}
          />

        </section>

      </div>

      {/* ===================================================
          RECENT ACTIVITY
          =================================================== */}

      <div className="admin-dashboard-recent-grid">

        {/* Recent Leads */}

        <section className="admin-dashboard-recent-card">

          <div className="admin-dashboard-card-header">

            <div>
              <h2>
                Recent Leads
              </h2>

              <p>
                Latest leads assigned to
                or created by you.
              </p>
            </div>

            <Badge variant="info">
              {totalLeads}
            </Badge>

          </div>

          <RecentLeads
            leads={recent?.leads || []}
            loading={dashboardLoading}
            viewAllHref="/employee/leads"
          />

        </section>

        {/* Recent Quotations */}

        <section className="admin-dashboard-recent-card">

          <div className="admin-dashboard-card-header">

            <div>
              <h2>
                Recent Quotations
              </h2>

              <p>
                Latest quotations handled
                by you.
              </p>
            </div>

            <Badge variant="success">
              {totalQuotations}
            </Badge>

          </div>

          <RecentQuotations
            quotations={
              recent?.quotations || []
            }
            loading={dashboardLoading}
            viewAllHref="/employee/quotations"
          />

        </section>

        {/* Recent Tasks */}

        <section className="admin-dashboard-recent-card">

          <div className="admin-dashboard-card-header">

            <div>
              <h2>
                Recent Tasks
              </h2>

              <p>
                Latest tasks assigned to
                you.
              </p>
            </div>

            <Badge variant="warning">
              {totalTasks}
            </Badge>

          </div>

          <RecentTasks
            tasks={recent?.tasks || []}
            loading={dashboardLoading}
            viewAllHref="/employee/tasks"
          />

        </section>

      </div>

      {/* ===================================================
          FOOTER SUMMARY
          =================================================== */}

      <div className="admin-dashboard-footer-summary">

        {/* Invoices */}

        <div className="admin-dashboard-footer-card">

          <div>
            <span>
              My Invoices
            </span>

            <strong>
              {dashboardLoading
                ? "—"
                : totalInvoices}
            </strong>
          </div>

          <p>
            Total invoices available
            in your employee scope.
          </p>

        </div>

        {/* Completed Tasks */}

        <div className="admin-dashboard-footer-card">

          <div>
            <span>
              Completed Tasks
            </span>

            <strong>
              {dashboardLoading
                ? "—"
                : completedTasks}
            </strong>
          </div>

          <p>
            Tasks completed by you
            within your dashboard scope.
          </p>

        </div>

      </div>

    </div>
  );
};

export default EmployeeDashboardPage;