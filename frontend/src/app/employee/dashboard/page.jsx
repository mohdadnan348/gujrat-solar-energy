"use client";

import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import AdminStats from "@/components/dashboard/AdminStats";
import ManagerStats from "@/components/dashboard/ManagerStats";
import HRStats from "@/components/dashboard/HRStats";
import EmployeeStats from "@/components/dashboard/EmployeeStats";
import LeadChart from "@/components/dashboard/LeadChart";
import SalesChart from "@/components/dashboard/SalesChart";
import RecentLeads from "@/components/dashboard/RecentLeads";
import RecentQuotations from "@/components/dashboard/RecentQuotations";
import RecentTasks from "@/components/dashboard/RecentTasks";
import { useAuth } from "@/hooks/useAuth";

const EmployeeDashboardPage = () => {
  const { user, logout, loading } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  const handleSearch = (value) => {
    console.log("Global search:", value);
  };

  if (loading) {
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
              Welcome back{user?.name ? `, ${user.name}` : ""}
            </h1>

            <p>
              Manage your leads, quotations, tasks and daily activities
              from one place.
            </p>
          </div>
        </div>

        <section className="employee-dashboard-stats">
          <EmployeeStats />
        </section>

        <section className="employee-dashboard-charts">
          <LeadChart />
          <SalesChart />
        </section>

        <section className="employee-dashboard-activity">
          <RecentLeads />
          <RecentQuotations />
          <RecentTasks />
        </section>
      </div>
    </MainLayout>
  );
};

export default EmployeeDashboardPage;