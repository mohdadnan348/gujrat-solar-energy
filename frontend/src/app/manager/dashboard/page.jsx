"use client";

import React, { useCallback, useEffect, useState } from "react";

import Loader from "@/components/common/Loader";
import Button from "@/components/common/Button";

import RecentLeads from "@/components/dashboard/RecentLeads";
import RecentQuotations from "@/components/dashboard/RecentQuotations";
import RecentTasks from "@/components/dashboard/RecentTasks";
import ManagerStats from "@/components/dashboard/ManagerStats";

import { useAuth } from "@/hooks/useAuth";
import dashboardService from "@/services/dashboard.service";
import taskService from "@/services/task.service";

import "./dashboard.css";

const ManagerDashboardPage = () => {
  const { loading: authLoading } = useAuth();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  /* =========================
     EXTRACT RESPONSE
  ========================= */

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

  const extractTaskList = (response) => {
    const candidates = [
      response?.data?.tasks,
      response?.data?.data?.tasks,
      response?.data?.data?.items,
      response?.data?.items,
      response?.data?.results,
      response?.data?.data,
      response?.tasks,
      response?.items,
      response?.results,
      response?.data,
      response,
    ];
    return candidates.find(Array.isArray) || [];
  };

  /* =========================
     LOAD DASHBOARD
  ========================= */

  const loadDashboard = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response = await dashboardService.getDashboard();
        const dashboardData = extractData(response);

        let taskRows =
          dashboardData?.recentTasks ||
          dashboardData?.recent?.tasks ||
          [];

        if (!Array.isArray(taskRows) || taskRows.length === 0) {
          try {
            const taskResponse = await taskService.getTasks({
              page: 1,
              limit: 5,
              sort: "-createdAt",
            });
            taskRows = extractTaskList(taskResponse);
          } catch (taskError) {
            console.error("Manager dashboard task loading error:", taskError);
          }
        }

        setDashboard({
          ...dashboardData,
          recentTasks: Array.isArray(taskRows) ? taskRows : [],
        });
      } catch (err) {
        console.error(
          "Manager dashboard loading error:",
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

  /* =========================
     DATA
  ========================= */

  const getValue = (...values) => {
    for (const value of values) {
      if (value !== undefined && value !== null && value !== "") return value;
    }
    return 0;
  };

  const stats = dashboard?.stats || dashboard || {};
  const leadStats = dashboard?.leads || stats?.leads || {};
  const quotationStats = dashboard?.quotations || stats?.quotations || {};
  const taskStats = dashboard?.tasks || stats?.tasks || {};
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

  const totalQuotations = getValue(
    quotationStats?.total,
    quotationStats?.active,
    stats?.totalQuotations
  );

  const pendingTasks = getValue(
    taskStats?.pending,
    stats?.pendingTasks
  );

  const teamMembers = getValue(
    teamStats?.members,
    teamStats?.teamMembers,
    dashboard?.teamMembers,
    stats?.teamMembers
  );

  const managerStats = {
    teamLeads: totalTeamLeads,
    activeQuotations: totalQuotations,
    teamTasks: pendingTasks,
    teamMembers,
  };

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
  const conversions = getValue(
    leadStats?.conversions,
    leadStats?.converted,
    dashboard?.conversions,
    stats?.conversions
  );
  const completedTasks = getValue(
    taskStats?.completed,
    stats?.completedTasks
  );

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

  /* =========================
     LOADING
  ========================= */

  if (authLoading || loading) {
    return (
      <div className="manager-dashboard-loading">
        <Loader />
      </div>
    );
  }

  /* =========================
     PAGE
  ========================= */

  return (
    <div className="manager-dashboard-page">
      {/* HEADER */}
      <div className="manager-dashboard-header">
        <div>
          <div className="manager-dashboard-eyebrow">
            Manager / Dashboard
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

      {/* ERROR */}
      {error && (
        <div className="manager-dashboard-error">
          <span>{error}</span>

          <Button
            type="button"
            size="small"
            variant="secondary"
            onClick={() => loadDashboard()}
          >
            Try Again
          </Button>
        </div>
      )}

      {/* TEAM OVERVIEW — first four summary boxes */}
      <div className="manager-dashboard-section">
        <div className="manager-dashboard-section-header">
          <div>
            <h2>Team Overview</h2>
            <p>Sales and operational performance of your team.</p>
          </div>
          <span className="manager-dashboard-role-badge">Manager</span>
        </div>

        <ManagerStats
          stats={managerStats}
          loading={loading || refreshing}
        />
      </div>

      {/* SUMMARY — second four boxes */}
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


      {/* RECENT DATA — child components already render their own cards/headings */}
      <div className="manager-dashboard-lower-grid">
        <RecentLeads leads={recentLeads} />
        <RecentQuotations quotations={recentQuotations} />
        <RecentTasks tasks={recentTasks} />
      </div>
    </div>
  );
};

export default ManagerDashboardPage;