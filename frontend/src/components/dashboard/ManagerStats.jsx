"use client";

import React from "react";
import StatCard from "./StatCard";

const ManagerStats = ({ stats = {}, loading = false }) => {
  const dashboardStats = stats?.stats || stats;

  const teamLeads =
    dashboardStats?.leads?.total ??
    dashboardStats?.teamLeads ??
    0;

  const activeQuotations =
    dashboardStats?.quotations?.active ??
    dashboardStats?.quotations?.total ??
    dashboardStats?.activeQuotations ??
    0;

  const teamTasks =
    dashboardStats?.tasks?.total ??
    dashboardStats?.teamTasks ??
    0;

  const teamMembers =
    dashboardStats?.users?.activeEmployees ??
    dashboardStats?.teamMembers ??
    0;

  return (
    <div className="gse-stats-grid">
      <StatCard
        title="Team Leads"
        value={teamLeads}
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
        variant="primary"
        loading={loading}
      />

      <StatCard
        title="Active Quotations"
        value={activeQuotations}
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
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 20 8" />
            <line x1="14" y1="2" x2="14" y2="8" />
            <line x1="14" y1="8" x2="20" y2="8" />
            <line x1="8" y1="13" x2="16" y2="13" />
            <line x1="8" y1="17" x2="14" y2="17" />
          </svg>
        }
        variant="info"
        loading={loading}
      />

      <StatCard
        title="Team Tasks"
        value={teamTasks}
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
        variant="success"
        loading={loading}
      />

      <StatCard
        title="Team Members"
        value={teamMembers}
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
            <circle cx="9" cy="7" r="4" />
            <path d="M3 21v-1a6 6 0 0 1 12 0v1" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            <path d="M21 21v-1a6 6 0 0 0-3-5.19" />
          </svg>
        }
        variant="warning"
        loading={loading}
      />
    </div>
  );
};

export default ManagerStats;