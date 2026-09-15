"use client";

import React, { useCallback, useEffect, useState } from "react";

import MainLayout from "@/components/layout/MainLayout";
import Loader from "@/components/common/Loader";
import Badge from "@/components/common/Badge";
import Button from "@/components/common/Button";

import LeadChart from "@/components/dashboard/LeadChart";
import SalesChart from "@/components/dashboard/SalesChart";
import RecentLeads from "@/components/dashboard/RecentLeads";
import RecentQuotations from "@/components/dashboard/RecentQuotations";
import RecentTasks from "@/components/dashboard/RecentTasks";
import AdminStats from "@/components/dashboard/AdminStats";

import { useAuth } from "@/hooks/useAuth";
import dashboardService from "@/services/dashboard.service";

const AdminDashboardPage = () => {
  const { user, logout, loading: authLoading } = useAuth();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const handleLogout = async () => {
    await logout();
  };

  const handleSearch = (value) => {
    console.log("Admin dashboard search:", value);
  };

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

  const loadDashboard = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await dashboardService.getDashboard();

      const data = extractData(response);

      setDashboard(data);
    } catch (err) {
      console.error("Admin dashboard loading error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const getDashboardValue = (...keys) => {
    for (const key of keys) {
      if (
        key !== undefined &&
        key !== null &&
        key !== ""
      ) {
        return key;
      }
    }

    return 0;
  };

  const stats = dashboard?.stats || dashboard || {};

  const leadStats =
    dashboard?.leads ||
    stats?.leads ||
    {};

  const quotationStats =
    dashboard?.quotations ||
    stats?.quotations ||
    {};

  const customerStats =
    dashboard?.customers ||
    stats?.customers ||
    {};

  const invoiceStats =
    dashboard?.invoices ||
    stats?.invoices ||
    {};

  const taskStats =
    dashboard?.tasks ||
    stats?.tasks ||
    {};

  const userStats =
    dashboard?.users ||
    stats?.users ||
    {};

  const attendanceStats =
    dashboard?.attendance ||
    stats?.attendance ||
    {};

  const totalLeads = getDashboardValue(
    leadStats?.total,
    stats?.totalLeads
  );

  const activeLeads = getDashboardValue(
    leadStats?.active,
    leadStats?.activeLeads,
    stats?.activeLeads
  );

  const totalQuotations = getDashboardValue(
    quotationStats?.total,
    stats?.totalQuotations
  );

  const totalCustomers = getDashboardValue(
    customerStats?.total,
    stats?.totalCustomers
  );

  const totalInvoices = getDashboardValue(
    invoiceStats?.total,
    stats?.totalInvoices
  );

  const totalEmployees = getDashboardValue(
    userStats?.activeEmployees,
    userStats?.totalEmployees,
    stats?.totalEmployees
  );

  const pendingTasks = getDashboardValue(
    taskStats?.pending,
    stats?.pendingTasks
  );

  const completedTasks = getDashboardValue(
    taskStats?.completed,
    stats?.completedTasks
  );

  const totalRevenue = getDashboardValue(
    dashboard?.revenue?.total,
    dashboard?.revenue,
    stats?.totalRevenue,
    stats?.revenue,
    0
  );

  const presentToday = getDashboardValue(
    attendanceStats?.presentToday,
    attendanceStats?.present,
    stats?.presentToday
  );

  const leadData =
    dashboard?.leadChart ||
    dashboard?.leadData ||
    dashboard?.leadsChart ||
    dashboard?.leadOverview ||
    [];

  const salesData =
    dashboard?.salesChart ||
    dashboard?.salesData ||
    dashboard?.revenueChart ||
    dashboard?.salesOverview ||
    [];

  const recentLeads =
    dashboard?.recentLeads ||
    dashboard?.recent?.leads ||
    [];

  const recentQuotations =
    dashboard?.recentQuotations ||
    dashboard?.recent?.quotations ||
    [];

  const recentTasks =
    dashboard?.recentTasks ||
    dashboard?.recent?.tasks ||
    [];

  const adminStats = {
    totalLeads,
    totalQuotations,
    totalCustomers,
    totalEmployees,
  };

  if (authLoading || loading) {
    return (
      <MainLayout
        user={user}
        onLogout={handleLogout}
        onSearch={handleSearch}
        notificationCount={0}
      >
        <div className="admin-dashboard-loading">
          <Loader />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      user={user}
      onLogout={handleLogout}
      onSearch={handleSearch}
      notificationCount={0}
    >
      <div className="admin-dashboard-page">
        <div className="admin-dashboard-header">
          <div>
            <div className="admin-dashboard-breadcrumb">
              Admin <span>/</span> Dashboard
            </div>

            <h1>Admin Dashboard</h1>

            <p>
              Complete overview of your solar business
              operations.
            </p>
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={() => loadDashboard(true)}
            disabled={refreshing}
          >
            {refreshing ? "Refreshing..." : "↻ Refresh"}
          </Button>
        </div>

        {error && (
          <div className="admin-dashboard-error">
            <span>{error}</span>

            <button
              type="button"
              onClick={() => loadDashboard()}
            >
              Try Again
            </button>
          </div>
        )}

        <div className="admin-dashboard-section">
          <div className="admin-dashboard-section-header">
            <div>
              <h2>Business Overview</h2>

              <p>
                Key operational statistics for the
                administration team.
              </p>
            </div>

            <Badge variant="info">
              Administrator
            </Badge>
          </div>

          <AdminStats
            stats={adminStats}
            loading={loading || refreshing}
          />
        </div>

        <div className="admin-dashboard-summary">
          <div className="admin-dashboard-summary-card">
            <div className="admin-dashboard-summary-top">
              <div>
                <span>Total Revenue</span>

                <strong>
                  ₹
                  {Number(totalRevenue || 0).toLocaleString(
                    "en-IN"
                  )}
                </strong>
              </div>

              <div className="admin-dashboard-summary-icon">
                ₹
              </div>
            </div>

            <p>
              Revenue overview from available dashboard
              records.
            </p>
          </div>

          <div className="admin-dashboard-summary-card">
            <div className="admin-dashboard-summary-top">
              <div>
                <span>Pending Tasks</span>

                <strong>{pendingTasks}</strong>
              </div>

              <div className="admin-dashboard-summary-icon">
                ⏳
              </div>
            </div>

            <p>
              Tasks that are currently pending.
            </p>
          </div>

          <div className="admin-dashboard-summary-card">
            <div className="admin-dashboard-summary-top">
              <div>
                <span>Present Today</span>

                <strong>{presentToday}</strong>
              </div>

              <div className="admin-dashboard-summary-icon">
                ✓
              </div>
            </div>

            <p>
              Employees marked present today.
            </p>
          </div>

          <div className="admin-dashboard-summary-card">
            <div className="admin-dashboard-summary-top">
              <div>
                <span>Active Leads</span>

                <strong>{activeLeads}</strong>
              </div>

              <div className="admin-dashboard-summary-icon">
                ●
              </div>
            </div>

            <p>
              Leads currently active in the sales pipeline.
            </p>
          </div>
        </div>

        <div className="admin-dashboard-chart-grid">
          <div className="admin-dashboard-chart-card">
            <div className="admin-dashboard-card-header">
              <div>
                <h2>Lead Overview</h2>

                <p>
                  Lead activity and conversion movement.
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

        <div className="admin-dashboard-recent-grid">
          <div className="admin-dashboard-recent-card">
            <div className="admin-dashboard-card-header">
              <div>
                <h2>Recent Leads</h2>

                <p>
                  Latest lead activity.
                </p>
              </div>
            </div>

            <RecentLeads leads={recentLeads} />
          </div>

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
              quotations={recentQuotations}
            />
          </div>

          <div className="admin-dashboard-recent-card">
            <div className="admin-dashboard-card-header">
              <div>
                <h2>Recent Tasks</h2>

                <p>
                  Latest operational tasks.
                </p>
              </div>
            </div>

            <RecentTasks tasks={recentTasks} />
          </div>
        </div>

        <div className="admin-dashboard-footer-summary">
          <div>
            <span>Total Invoices</span>
            <strong>{totalInvoices}</strong>
          </div>

          <div>
            <span>Completed Tasks</span>
            <strong>{completedTasks}</strong>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminDashboardPage;