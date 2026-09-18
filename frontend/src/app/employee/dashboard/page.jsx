"use client";

import React, { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";

import EmployeeStats from "@/components/dashboard/EmployeeStats";
import LeadChart from "@/components/dashboard/LeadChart";
import SalesChart from "@/components/dashboard/SalesChart";
import RecentLeads from "@/components/dashboard/RecentLeads";
import RecentQuotations from "@/components/dashboard/RecentQuotations";
import RecentTasks from "@/components/dashboard/RecentTasks";

import { useAuth } from "@/hooks/useAuth";
import dashboardService from "@/services/dashboard.service";

const EmployeeDashboardPage = () => {
  const { user, logout, loading: authLoading } = useAuth();

  const [dashboardData, setDashboardData] = useState({});
  const [leadData, setLeadData] = useState([]);
  const [quotationData, setQuotationData] = useState([]);
  const [recentLeads, setRecentLeads] = useState([]);
  const [recentQuotations, setRecentQuotations] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);

  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");

  const handleLogout = async () => {
    await logout();
  };

  const handleSearch = (value) => {
    console.log("Global search:", value);
  };

  useEffect(() => {
    if (authLoading || !user) {
      return;
    }

    let mounted = true;

    const loadDashboard = async () => {
      try {
        setDashboardLoading(true);
        setDashboardError("");

        const [
          dashboardResponse,
          leadResponse,
          quotationResponse,
          recentLeadsResponse,
          recentQuotationsResponse,
          recentTasksResponse,
        ] = await Promise.all([
          dashboardService.getDashboard(),
          dashboardService.getLeads(),
          dashboardService.getQuotations(),
          dashboardService.getRecentLeads({ limit: 5 }),
          dashboardService.getRecentQuotations({ limit: 5 }),
          dashboardService.getUpcomingTasks({ limit: 5 }),
        ]);

        if (!mounted) return;

        setDashboardData(
          dashboardResponse?.data ||
            dashboardResponse ||
            {}
        );

        setLeadData(
          leadResponse?.data ||
            leadResponse ||
            []
        );

        setQuotationData(
          quotationResponse?.data ||
            quotationResponse ||
            []
        );

        setRecentLeads(
          recentLeadsResponse?.data ||
            recentLeadsResponse ||
            []
        );

        setRecentQuotations(
          recentQuotationsResponse?.data ||
            recentQuotationsResponse ||
            []
        );

        setRecentTasks(
          recentTasksResponse?.data ||
            recentTasksResponse ||
            []
        );
      } catch (error) {
        console.error(
          "Employee dashboard error:",
          error
        );

        if (!mounted) return;

        setDashboardError(
          error?.response?.data?.message ||
            error?.message ||
            "Unable to load dashboard data."
        );
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
    <MainLayout
      user={user}
      onLogout={handleLogout}
      onSearch={handleSearch}
      notificationCount={0}
    >
      <div className="employee-dashboard">
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
              Manage your leads, quotations, tasks and
              daily activities from one place.
            </p>
          </div>
        </div>

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

        <section className="employee-dashboard-stats">
          <EmployeeStats
            stats={dashboardData}
            loading={dashboardLoading}
          />
        </section>

        <section className="employee-dashboard-charts">
          <LeadChart
            data={leadData}
            loading={dashboardLoading}
          />

          <SalesChart
            data={quotationData}
            loading={dashboardLoading}
          />
        </section>

        <section className="employee-dashboard-activity">
          <RecentLeads
            leads={recentLeads}
            loading={dashboardLoading}
            viewAllHref="/employee/leads"
          />

          <RecentQuotations
            quotations={recentQuotations}
            loading={dashboardLoading}
            viewAllHref="/employee/quotations"
          />

          <RecentTasks
            tasks={recentTasks}
            loading={dashboardLoading}
            viewAllHref="/employee/tasks"
          />
        </section>
      </div>
    </MainLayout>
  );
};

export default EmployeeDashboardPage;