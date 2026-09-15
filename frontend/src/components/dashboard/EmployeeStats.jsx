"use client";

import React from "react";
import StatCard from "./StatCard";

const EmployeeStats = ({ stats = {}, loading = false }) => {
  const dashboardStats = stats?.stats || stats;

  const myTasks =
    dashboardStats?.tasks?.my ??
    dashboardStats?.tasks?.total ??
    dashboardStats?.myTasks ??
    0;

  const pendingTasks =
    dashboardStats?.tasks?.pending ??
    dashboardStats?.pendingTasks ??
    0;

  const completedTasks =
    dashboardStats?.tasks?.completed ??
    dashboardStats?.completedTasks ??
    0;

  const myLeads =
    dashboardStats?.leads?.my ??
    dashboardStats?.leads?.total ??
    dashboardStats?.myLeads ??
    0;

  return (
    <div className="gse-stats-grid">
      <StatCard
        title="My Tasks"
        value={myTasks}
        icon={
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="3" y="4" width="18" height="17" rx="2" />
            <path d="M8 2v4" />
            <path d="M16 2v4" />
            <path d="M3 10h18" />
            <path d="m8 15 2 2 4-4" />
          </svg>
        }
        variant="primary"
        loading={loading}
      />

      <StatCard
        title="Pending Tasks"
        value={pendingTasks}
        icon={
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
        }
        variant="warning"
        loading={loading}
      />

      <StatCard
        title="Completed Tasks"
        value={completedTasks}
        icon={
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="m8 12 2.5 2.5L16 9" />
          </svg>
        }
        variant="success"
        loading={loading}
      />

      <StatCard
        title="My Leads"
        value={myLeads}
        icon={
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        }
        variant="info"
        loading={loading}
      />
    </div>
  );
};

export default EmployeeStats;