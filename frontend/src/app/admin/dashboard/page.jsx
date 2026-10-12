"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Loader from "@/components/common/Loader";
import Badge from "@/components/common/Badge";
import Button from "@/components/common/Button";

import LeadChart from "@/components/dashboard/LeadChart";
import SalesChart from "@/components/dashboard/SalesChart";
import RecentLeads from "@/components/dashboard/RecentLeads";
import RecentQuotations from "@/components/dashboard/RecentQuotations";
import RecentTasks from "@/components/dashboard/RecentTasks";
import AdminStats from "@/components/dashboard/AdminStats";

import dashboardService from "@/services/dashboard.service";

import "./dashboard.css";

const AdminDashboardPage = () => {
  const [dashboard, setDashboard] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  /* ----------------------------------
     Extract API Data
  ---------------------------------- */

  const extractData = (response) => {
    return (
      response?.data?.dashboard ||
      response?.data?.data ||
      response?.dashboard ||
      response?.data ||
      response ||
      {}
    );
  };

  /* ----------------------------------
     Load Dashboard
  ---------------------------------- */

  const loadDashboard = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response =
          await dashboardService.getDashboard();

        const data = extractData(response);

        setDashboard(
          data && typeof data === "object"
            ? data
            : {}
        );
      } catch (err) {
        console.error(
          "Admin dashboard loading error:",
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
    []
  );

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  /* ----------------------------------
     Safe Data Helpers
  ---------------------------------- */

  const getDashboardValue = (...values) => {
    for (const value of values) {
      if (value !== undefined && value !== null && value !== "") {
        const numericValue = Number(value);
        return Number.isFinite(numericValue) ? numericValue : value;
      }
    }
    return 0;
  };

  const asArray = (value) => (Array.isArray(value) ? value : []);

  const normalizeStatus = (value) =>
    String(value ?? "")
      .trim()
      .toUpperCase()
      .replace(/[\s-]+/g, "_");

  const sumBy = (rows, field) =>
    asArray(rows).reduce((sum, row) => {
      const amount = Number(row?.[field] ?? 0);
      return sum + (Number.isFinite(amount) ? amount : 0);
    }, 0);

  /* ----------------------------------
     Backend Dashboard Data
     Backend response shape:
     {
       stats: {...},
       analytics: {
         leads: { status, source, priority },
         quotations: [...],
         invoices: [...],
         attendance: [...]
       },
       recent: { leads, quotations, invoices, tasks }
     }
  ---------------------------------- */

  const stats = dashboard?.stats || {};
  const analytics = dashboard?.analytics || {};
  const recent = dashboard?.recent || {};

  const leadStats = stats?.leads || {};
  const quotationStats = stats?.quotations || {};
  const customerStats = stats?.customers || {};
  const invoiceStats = stats?.invoices || {};
  const taskStats = stats?.tasks || {};
  const userStats = stats?.users || {};
  const attendanceStats = stats?.attendance || {};

  const leadStatusRows = asArray(analytics?.leads?.status);
  const quotationStatusRows = asArray(analytics?.quotations);
  const invoiceStatusRows = asArray(analytics?.invoices);
  const attendanceStatusRows = asArray(analytics?.attendance);

  const totalLeads = getDashboardValue(
    leadStats?.total,
    stats?.totalLeads,
    dashboard?.totalLeads
  );

  // The backend does not return an "active" lead count directly.
  // Derive it from real status aggregation rather than displaying a fake zero.
  const activeLeadsFromAnalytics = leadStatusRows.reduce((total, row) => {
    const status = normalizeStatus(row?._id ?? row?.status);
    const count = Number(row?.count ?? 0);
    if (["WON", "LOST", "CLOSED", "CANCELLED", "CONVERTED"].includes(status)) {
      return total;
    }
    return total + (Number.isFinite(count) ? count : 0);
  }, 0);

  const activeLeads = getDashboardValue(
    leadStats?.active,
    leadStats?.activeLeads,
    stats?.activeLeads,
    dashboard?.activeLeads,
    activeLeadsFromAnalytics
  );

  const totalQuotations = getDashboardValue(
    quotationStats?.total,
    stats?.totalQuotations,
    dashboard?.totalQuotations
  );

  const totalCustomers = getDashboardValue(
    customerStats?.total,
    stats?.totalCustomers,
    dashboard?.totalCustomers
  );

  const totalInvoices = getDashboardValue(
    invoiceStats?.total,
    stats?.totalInvoices,
    dashboard?.totalInvoices
  );

  const totalEmployees = getDashboardValue(
    userStats?.activeEmployees,
    userStats?.totalEmployees,
    stats?.totalEmployees,
    dashboard?.totalEmployees
  );

  const pendingTasks = getDashboardValue(
    taskStats?.pending,
    stats?.pendingTasks,
    dashboard?.pendingTasks
  );

  const completedTasks = getDashboardValue(
    taskStats?.completed,
    stats?.completedTasks,
    dashboard?.completedTasks
  );

  // Accept common invoice amount field names used by different API aggregations.
  // This card shows invoiced value, not collected payments.
  const getInvoiceAmount = (row) => {
    const candidates = [
      row?.totalAmount,
      row?.grandTotal,
      row?.total,
      row?.amount,
      row?.invoiceValue,
      row?.totalValue,
      row?.total_amount,
      row?.grand_total,
    ];

    for (const candidate of candidates) {
      if (candidate !== undefined && candidate !== null && candidate !== "") {
        const amount = Number(candidate);
        if (Number.isFinite(amount)) return amount;
      }
    }
    return 0;
  };

  const invoicedValueFromAnalytics = invoiceStatusRows.reduce((total, row) => {
    const status = normalizeStatus(row?._id ?? row?.status);
    if (status === "CANCELLED" || status === "CANCELED") return total;
    return total + getInvoiceAmount(row);
  }, 0);

  const totalRevenue = getDashboardValue(
    dashboard?.revenue?.total,
    typeof dashboard?.revenue === "number" ? dashboard.revenue : undefined,
    stats?.invoices?.totalValue,
    stats?.invoices?.totalAmount,
    stats?.invoices?.grandTotal,
    stats?.totalInvoiceValue,
    stats?.totalInvoicedValue,
    stats?.totalRevenue,
    stats?.revenue,
    invoicedValueFromAnalytics
  );

  // Count only attendance records whose status indicates presence.
  const presentFromAnalytics = attendanceStatusRows.reduce((total, row) => {
    const status = normalizeStatus(row?._id ?? row?.status);
    if (!["PRESENT", "LATE", "HALF_DAY", "HALFDAY"].includes(status)) {
      return total;
    }
    const count = Number(row?.count ?? 0);
    return total + (Number.isFinite(count) ? count : 0);
  }, 0);

  const presentToday = getDashboardValue(
    attendanceStats?.presentToday,
    attendanceStats?.present,
    stats?.presentToday,
    dashboard?.presentToday,
    presentFromAnalytics
  );

  /* ----------------------------------
     Charts
  ---------------------------------- */

  const leadData = useMemo(() => {
    const direct =
      dashboard?.leadChart ??
      dashboard?.leadData ??
      dashboard?.leadsChart ??
      dashboard?.leadOverview;

    if (Array.isArray(direct)) return direct;

    // Backend supplies status/source/priority aggregations, not a monthly series.
    return leadStatusRows.map((row) => ({
      name: String(row?._id ?? row?.status ?? "Unknown"),
      status: String(row?._id ?? row?.status ?? "Unknown"),
      count: Number(row?.count ?? 0),
      total: Number(row?.count ?? 0),
    }));
  }, [dashboard]);

  const salesData = useMemo(() => {
    const direct =
      dashboard?.salesChart ??
      dashboard?.salesData ??
      dashboard?.revenueChart ??
      dashboard?.salesOverview;

    if (Array.isArray(direct)) return direct;

    // Backend aggregates quotations and invoices by status.
    // Keep actual amounts from the API; do not generate synthetic monthly data.
    const quotationRows = asArray(dashboard?.analytics?.quotations).map((row) => ({
      name: `Quotation ${String(row?._id ?? row?.status ?? "Unknown")}`,
      status: String(row?._id ?? row?.status ?? "Unknown"),
      count: Number(row?.count ?? 0),
      amount: Number(row?.totalAmount ?? 0),
      totalAmount: Number(row?.totalAmount ?? 0),
    }));

    const invoiceRows = asArray(dashboard?.analytics?.invoices).map((row) => ({
      name: `Invoice ${String(row?._id ?? row?.status ?? "Unknown")}`,
      status: String(row?._id ?? row?.status ?? "Unknown"),
      count: Number(row?.count ?? 0),
      amount: Number(row?.totalAmount ?? 0),
      totalAmount: Number(row?.totalAmount ?? 0),
    }));

    return [...quotationRows, ...invoiceRows];
  }, [dashboard]);

  /* ----------------------------------
     Recent Data
  ---------------------------------- */

  const recentLeads = useMemo(
    () => asArray(dashboard?.recentLeads ?? recent?.leads),
    [dashboard]
  );

  const recentQuotations = useMemo(
    () => asArray(dashboard?.recentQuotations ?? recent?.quotations),
    [dashboard]
  );

  const recentTasks = useMemo(
    () => asArray(dashboard?.recentTasks ?? recent?.tasks),
    [dashboard]
  );

  /* ----------------------------------
     Admin Stats Component Data
  ---------------------------------- */

  const adminStats = useMemo(
    () => ({
      totalLeads,
      totalQuotations,
      totalCustomers,
      totalEmployees,
    }),
    [totalLeads, totalQuotations, totalCustomers, totalEmployees]
  );

  /* ----------------------------------
     Loading
  ---------------------------------- */

  if (loading) {
    return (
      <div className="admin-dashboard-loading">
        <Loader />
      </div>
    );
  }

  /* ----------------------------------
     UI
  ---------------------------------- */

  return (
    <div className="admin-dashboard-page">
      {/* ================================
          HEADER
      ================================= */}

      <div className="admin-dashboard-header">
        <div>
          <div className="admin-dashboard-breadcrumb">
            Admin <span>/</span> Dashboard
          </div>

          <h1>Admin Dashboard</h1>

          <p>
            Complete overview of your solar
            business operations.
          </p>
        </div>

        <Button
          type="button"
          variant="secondary"
          onClick={() =>
            loadDashboard(true)
          }
          disabled={refreshing}
        >
          {refreshing
            ? "Refreshing..."
            : "↻ Refresh"}
        </Button>
      </div>

      {/* ================================
          ERROR
      ================================= */}

      {error && (
        <div className="admin-dashboard-error">
          <span>{error}</span>

          <button
            type="button"
            onClick={() =>
              loadDashboard()
            }
          >
            Try Again
          </button>
        </div>
      )}

      {/* ================================
          BUSINESS OVERVIEW
      ================================= */}

      <div className="admin-dashboard-section">
        <div className="admin-dashboard-section-header">
          <div>
            <h2>Business Overview</h2>

            <p>
              Key operational statistics for
              the administration team.
            </p>
          </div>

          <Badge variant="info">
            Administrator
          </Badge>
        </div>

        <AdminStats
          stats={adminStats}
          loading={refreshing}
        />
      </div>

      {/* ================================
          SUMMARY CARDS
      ================================= */}

      <div className="admin-dashboard-summary">
        {/* Revenue */}

        <div className="admin-dashboard-summary-card">
          <div className="admin-dashboard-summary-top">
            <div>
              <span>Total Invoiced Value</span>

              <strong>
                ₹
                {Number(
                  totalRevenue || 0
                ).toLocaleString("en-IN")}
              </strong>
            </div>

            <div className="admin-dashboard-summary-icon">
              ₹
            </div>
          </div>

          <p>
            Total value of non-cancelled invoices from the database.
          </p>
        </div>

        {/* Pending Tasks */}

        <div className="admin-dashboard-summary-card">
          <div className="admin-dashboard-summary-top">
            <div>
              <span>Pending Tasks</span>

              <strong>
                {pendingTasks}
              </strong>
            </div>

            <div className="admin-dashboard-summary-icon">
              ⏳
            </div>
          </div>

          <p>
            Tasks that are currently pending.
          </p>
        </div>

        {/* Present */}

        <div className="admin-dashboard-summary-card">
          <div className="admin-dashboard-summary-top">
            <div>
              <span>Present Today</span>

              <strong>
                {presentToday}
              </strong>
            </div>

            <div className="admin-dashboard-summary-icon">
              ✓
            </div>
          </div>

          <p>
            Employees marked present today.
          </p>
        </div>

        {/* Active Leads */}

        <div className="admin-dashboard-summary-card">
          <div className="admin-dashboard-summary-top">
            <div>
              <span>Active Leads</span>

              <strong>
                {activeLeads}
              </strong>
            </div>

            <div className="admin-dashboard-summary-icon">
              ●
            </div>
          </div>

          <p>
            Leads currently active in the sales
            pipeline.
          </p>
        </div>
      </div>

      {/* ================================
          CHARTS
      ================================= */}

      <div className="admin-dashboard-chart-grid">
        <div className="admin-dashboard-chart-card">
          <div className="admin-dashboard-card-header">
            <div>
              <h2>Lead Overview</h2>

              <p>
                Lead activity and conversion
                movement.
              </p>
            </div>
          </div>

          <LeadChart data={leadData} />
        </div>

        <div className="admin-dashboard-chart-card">
          <div className="admin-dashboard-card-header">
            <div>
              <h2>Sales Overview</h2>

              <p>
                Sales and revenue performance.
              </p>
            </div>
          </div>

          <SalesChart data={salesData} />
        </div>
      </div>

      {/* ================================
          RECENT DATA
      ================================= */}

      <div className="admin-dashboard-recent-grid">
        {/* Recent Leads */}

        <div className="admin-dashboard-recent-card">
          <div className="admin-dashboard-card-header">
            <div>
              <h2>Recent Leads</h2>

              <p>
                Latest lead activity.
              </p>
            </div>
          </div>

          <RecentLeads
            leads={
              Array.isArray(
                recentLeads
              )
                ? recentLeads
                : []
            }
          />
        </div>

        {/* Recent Quotations */}

        <div className="admin-dashboard-recent-card">
          <div className="admin-dashboard-card-header">
            <div>
              <h2>Recent Quotations</h2>

              <p>
                Latest quotation records.
              </p>
            </div>
          </div>

          <RecentQuotations
            quotations={
              Array.isArray(
                recentQuotations
              )
                ? recentQuotations
                : []
            }
          />
        </div>

        {/* Recent Tasks */}

        <div className="admin-dashboard-recent-card">
          <div className="admin-dashboard-card-header">
            <div>
              <h2>Recent Tasks</h2>

              <p>
                Latest operational tasks.
              </p>
            </div>
          </div>

          <RecentTasks
            tasks={
              Array.isArray(
                recentTasks
              )
                ? recentTasks
                : []
            }
          />
        </div>
      </div>

      {/* ================================
          FOOTER SUMMARY
      ================================= */}

      <div className="admin-dashboard-footer-summary">
        <div>
          <span>Total Invoices</span>

          <strong>
            {totalInvoices}
          </strong>
        </div>

        <div>
          <span>Completed Tasks</span>

          <strong>
            {completedTasks}
          </strong>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;