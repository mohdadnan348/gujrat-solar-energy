"use client";

import React, { useEffect, useState } from "react";
import EmployeeStats from "@/components/dashboard/EmployeeStats";
import RecentLeads from "@/components/dashboard/RecentLeads";
import RecentTasks from "@/components/dashboard/RecentTasks";
import { useAuth } from "@/hooks/useAuth";
import dashboardService from "@/services/dashboard.service";
import "./dashboard.css";

const EmployeeDashboardPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [dashboardData, setDashboardData] = useState({});
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");

  useEffect(() => {
    if (authLoading || !user) return;
    let mounted = true;

    const loadDashboard = async () => {
      try {
        setDashboardLoading(true);
        setDashboardError("");
        const response = await dashboardService.getDashboard();
        if (!mounted) return;
        setDashboardData(response?.data ?? response ?? {});
      } catch (error) {
        console.error("Employee dashboard error:", error);
        if (!mounted) return;
        setDashboardError(
          error?.response?.data?.message || error?.message || "Unable to load dashboard data."
        );
        setDashboardData({});
      } finally {
        if (mounted) setDashboardLoading(false);
      }
    };

    loadDashboard();
    return () => { mounted = false; };
  }, [authLoading, user]);

  if (authLoading) {
    return <div className="employee-dashboard-loading">Loading dashboard...</div>;
  }

  return (
    <div className="employee-dashboard">
      <header className="employee-dashboard-header">
        <div>
          <span className="employee-dashboard-eyebrow">Employee Dashboard</span>
          <h1>Welcome back{user?.name ? `, ${user.name}` : ""}</h1>
          <p>Quick overview of your leads, tasks, attendance and leaves.</p>
        </div>
      </header>

      {dashboardError && <div className="employee-dashboard-error" role="alert">{dashboardError}</div>}

      <section className="employee-dashboard-stats" aria-label="My work summary">
        <EmployeeStats stats={dashboardData} loading={dashboardLoading} />
      </section>

      <section className="employee-dashboard-activity" aria-label="Recent work">
        <RecentLeads
          leads={dashboardData?.recent?.leads || []}
          loading={dashboardLoading}
          viewAllHref="/employee/leads"
        />
        <RecentTasks
          tasks={dashboardData?.recent?.tasks || []}
          loading={dashboardLoading}
          viewAllHref="/employee/tasks"
        />
      </section>
    </div>
  );
};

export default EmployeeDashboardPage;
