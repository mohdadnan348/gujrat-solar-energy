"use client";

import React from "react";
import StatCard from "./StatCard";

const HRStats = ({ stats = {}, loading = false }) => {
  const dashboardStats = stats?.stats || stats;

  const totalEmployees =
    dashboardStats?.users?.totalEmployees ??
    dashboardStats?.employees?.total ??
    dashboardStats?.totalEmployees ??
    0;

  const presentToday =
    dashboardStats?.attendance?.presentToday ??
    dashboardStats?.presentToday ??
    0;

  const pendingLeaves =
    dashboardStats?.leaves?.pending ??
    dashboardStats?.pendingLeaves ??
    0;

  const onLeaveToday =
    dashboardStats?.attendance?.onLeaveToday ??
    dashboardStats?.onLeaveToday ??
    0;

  return (
    <div className="gse-stats-grid">
      <StatCard
        title="Total Employees"
        value={totalEmployees}
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
            <circle cx="12" cy="7" r="4" />
            <path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
          </svg>
        }
        variant="primary"
        loading={loading}
      />

      <StatCard
        title="Present Today"
        value={presentToday}
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
        title="Pending Leaves"
        value={pendingLeaves}
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
            <circle cx="12" cy="15" r="2.5" />
            <path d="M12 13.5v1.5l1 1" />
          </svg>
        }
        variant="warning"
        loading={loading}
      />

      <StatCard
        title="On Leave Today"
        value={onLeaveToday}
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
            <circle cx="12" cy="7" r="4" />
            <path d="M5 21a7 7 0 0 1 14 0" />
            <path d="M8 21h8" />
          </svg>
        }
        variant="info"
        loading={loading}
      />
    </div>
  );
};

export default HRStats;