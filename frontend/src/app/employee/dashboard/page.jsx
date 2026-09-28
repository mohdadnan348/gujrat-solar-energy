"use client";

import React, { useEffect, useState } from "react";

import EmployeeStats from "@/components/dashboard/EmployeeStats";
import LeadChart from "@/components/dashboard/LeadChart";
import SalesChart from "@/components/dashboard/SalesChart";
import RecentLeads from "@/components/dashboard/RecentLeads";
import RecentQuotations from "@/components/dashboard/RecentQuotations";
import RecentTasks from "@/components/dashboard/RecentTasks";

import { useAuth } from "@/hooks/useAuth";
import dashboardService from "@/services/dashboard.service";

const EmployeeDashboardPage = () => {
  const { user, loading: authLoading } = useAuth();

  const [dashboardData, setDashboardData] = useState({});
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");

  useEffect(() => {
    if (authLoading || !user) {
      return;
    }

    let mounted = true;

    const loadDashboard = async () => {
      try {
        setDashboardLoading(true);
        setDashboardError("");

        const response = await dashboardService.getDashboard();

        if (!mounted) return;

        const data = response?.data ?? response ?? {};

        setDashboardData(data);
      } catch (error) {
        console.error("Employee dashboard error:", error);

        if (!mounted) return;

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

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, [authLoading, user]);

  if (authLoading) {
    return (
      <div className="employee-dashboard-loading">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="employee-dashboard">
      {/* Header */}
      <div className="employee-dashboard-header">
        <div>
          <span className="employee-dashboard-eyebrow">
            Employee Dashboard
          </span>

          <h1>
            Welcome back
            {user?.name ? `, ${user.name}` : ""}
          </h1>

          <p>
            Manage your leads, quotations, tasks and daily activities
            from one place.
          </p>
        </div>
      </div>

      {/* Error */}
      {dashboardError && (
        <div
          style={{
            marginBottom: "20px",
            padding: "12px 16px",
            borderRadius: "10px",
            background: "#fff1f2",
            color: "#be123c",
            border: "1px solid #fecdd3",
          }}
        >
          {dashboardError}
        </div>
      )}

      {/* Stats */}
      <section className="employee-dashboard-stats">
        <EmployeeStats
          stats={dashboardData}
          loading={dashboardLoading}
        />
      </section>

      {/* Charts */}
      <section className="employee-dashboard-charts">
        <LeadChart
          data={dashboardData?.analytics?.leads?.status || []}
          loading={dashboardLoading}
        />

        <SalesChart
          data={dashboardData?.analytics?.quotations || []}
          loading={dashboardLoading}
        />
      </section>

      {/* Recent Activity */}
      <section className="employee-dashboard-activity">
        <RecentLeads
          leads={dashboardData?.recent?.leads || []}
          loading={dashboardLoading}
          viewAllHref="/employee/leads"
        />

        <RecentQuotations
          quotations={dashboardData?.recent?.quotations || []}
          loading={dashboardLoading}
          viewAllHref="/employee/quotations"
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