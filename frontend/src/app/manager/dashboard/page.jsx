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
import ManagerStats from "@/components/dashboard/ManagerStats";

import { useAuth } from "@/hooks/useAuth";
import dashboardService from "@/services/dashboard.service";

const ManagerDashboardPage = () => {
  const { user, logout, loading: authLoading } = useAuth();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const handleLogout = async () => {
    await logout();
  };

  const handleSearch = (value) => {
    console.log("Manager dashboard search:", value);
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
      setDashboard(extractData(response));
    } catch (err) {
      console.error("Manager dashboard loading error:", err);

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

  const getValue = (...values) => {
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

  const taskStats =
    dashboard?.tasks ||
    stats?.tasks ||
    {};

  const teamStats =
    dashboard?.team ||
    dashboard?.teamPerformance ||
    stats?.team ||
    {};

  const totalTeamLeads = getValue(
    leadStats?.total,
    leadStats?.teamLeads,
    stats?.teamLeads,
    stats?.totalLeads
  );

  const activeLeads = getValue(
    leadStats?.active,
    leadStats?.activeLeads,
    stats?.activeLeads
  );

  const followUps = getValue(
    leadStats?.followUps,
    leadStats?.pendingFollowUps,
    dashboard?.followUps,
    stats?.followUps
  );

  const totalQuotations = getValue(
    quotationStats?.total,
    quotationStats?.active,
    stats?.totalQuotations
  );

  const pendingTasks = getValue(
    taskStats?.pending,
    stats?.pendingTasks
  );

  const completedTasks = getValue(
    taskStats?.completed,
    stats?.completedTasks
  );

  const teamMembers = getValue(
    teamStats?.members,
    teamStats?.teamMembers,
    dashboard?.teamMembers,
    stats?.teamMembers
  );

  const conversions = getValue(
    leadStats?.conversions,
    leadStats?.converted,
    dashboard?.conversions,
    stats?.conversions
  );

  const teamPerformance =
    dashboard?.teamPerformanceData ||
    dashboard?.performance ||
    dashboard?.employeePerformance ||
    [];

  const leadData =
    dashboard?.leadChart ||
    dashboard?.leadData ||
    dashboard?.leadsChart ||
    [];

  const salesData =
    dashboard?.salesChart ||
    dashboard?.salesData ||
    dashboard?.revenueChart ||
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

  const managerStats = {
    teamLeads: totalTeamLeads,
    activeQuotations: totalQuotations,
    teamTasks: pendingTasks,
    teamMembers,
    followUps,
    conversions,
    completedTasks,
  };

  if (authLoading || loading) {
    return (
      <MainLayout
        user={user}
        onLogout={handleLogout}
        onSearch={handleSearch}
        notificationCount={0}
      >
        <div className="manager-dashboard-loading">
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
      <div className="manager-dashboard-page">
        <div className="manager-dashboard-header">
          <div>
            <div className="manager-dashboard-breadcrumb">
              Manager <span>/</span> Dashboard
            </div>

            <h1>Manager Dashboard</h1>

            <p>
              Monitor team sales, leads, quotations and
              operational tasks.
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
          <div className="manager-dashboard-error">
            <span>{error}</span>

            <button
              type="button"
              onClick={() => loadDashboard()}
            >
              Try Again
            </button>
          </div>
        )}

        <div className="manager-dashboard-section">
          <div className="manager-dashboard-section-header">
            <div>
              <h2>Team Overview</h2>

              <p>
                Sales and operational performance of your
                team.
              </p>
            </div>

            <Badge variant="info">
              Manager
            </Badge>
          </div>

          <ManagerStats
            stats={managerStats}
            loading={loading || refreshing}
          />
        </div>

        <div className="manager-dashboard-summary">
          <div className="manager-dashboard-summary-card">
            <div className="manager-dashboard-summary-top">
              <div>
                <span>Active Leads</span>
                <strong>{activeLeads}</strong>
              </div>

              <div className="manager-dashboard-summary-icon">
                ●
              </div>
            </div>

            <p>
              Leads currently active in the sales pipeline.
            </p>
          </div>

          <div className="manager-dashboard-summary-card">
            <div className="manager-dashboard-summary-top">
              <div>
                <span>Pending Follow-ups</span>
                <strong>{followUps}</strong>
              </div>

              <div className="manager-dashboard-summary-icon">
                ↗
              </div>
            </div>

            <p>
              Follow-ups that require team attention.
            </p>
          </div>

          <div className="manager-dashboard-summary-card">
            <div className="manager-dashboard-summary-top">
              <div>
                <span>Conversions</span>
                <strong>{conversions}</strong>
              </div>

              <div className="manager-dashboard-summary-icon">
                ✓
              </div>
            </div>

            <p>
              Successful lead conversions handled by the
              team.
            </p>
          </div>

          <div className="manager-dashboard-summary-card">
            <div className="manager-dashboard-summary-top">
              <div>
                <span>Completed Tasks</span>
                <strong>{completedTasks}</strong>
              </div>

              <div className="manager-dashboard-summary-icon">
                ✓
              </div>
            </div>

            <p>
              Operational tasks completed by the team.
            </p>
          </div>
        </div>

        <div className="manager-dashboard-chart-grid">
          <div className="manager-dashboard-chart-card">
            <div className="manager-dashboard-card-header">
              <div>
                <h2>Lead Overview</h2>

                <p>
                  Team lead activity and pipeline movement.
                </p>
              </div>
            </div>

            <LeadChart data={leadData} />
          </div>

          <div className="manager-dashboard-chart-card">
            <div className="manager-dashboard-card-header">
              <div>
                <h2>Sales Overview</h2>

                <p>
                  Team quotation and sales performance.
                </p>
              </div>
            </div>

            <SalesChart data={salesData} />
          </div>
        </div>

        <div className="manager-dashboard-performance-card">
          <div className="manager-dashboard-card-header">
            <div>
              <h2>Team Performance</h2>

              <p>
                Employee performance based on available
                dashboard data.
              </p>
            </div>
          </div>

          {Array.isArray(teamPerformance) &&
          teamPerformance.length > 0 ? (
            <div className="manager-dashboard-performance-list">
              {teamPerformance.map((employee, index) => {
                const name =
                  employee?.name ||
                  employee?.employeeName ||
                  employee?.user?.name ||
                  `Team Member ${index + 1}`;

                const leads = getValue(
                  employee?.leads,
                  employee?.totalLeads,
                  employee?.leadCount
                );

                const tasks = getValue(
                  employee?.tasks,
                  employee?.completedTasks,
                  employee?.taskCount
                );

                return (
                  <div
                    key={
                      employee?._id ||
                      employee?.id ||
                      index
                    }
                    className="manager-dashboard-performance-row"
                  >
                    <div>
                      <strong>{name}</strong>
                    </div>

                    <div>
                      <span>Leads</span>
                      <strong>{leads}</strong>
                    </div>

                    <div>
                      <span>Tasks</span>
                      <strong>{tasks}</strong>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="manager-dashboard-empty">
              No team performance data available.
            </div>
          )}
        </div>

        <div className="manager-dashboard-recent-grid">
          <div className="manager-dashboard-recent-card">
            <div className="manager-dashboard-card-header">
              <div>
                <h2>Recent Leads</h2>

                <p>
                  Latest team lead activity.
                </p>
              </div>
            </div>

            <RecentLeads leads={recentLeads} />
          </div>

          <div className="manager-dashboard-recent-card">
            <div className="manager-dashboard-card-header">
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

          <div className="manager-dashboard-recent-card">
            <div className="manager-dashboard-card-header">
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
      </div>
    </MainLayout>
  );
};

export default ManagerDashboardPage;