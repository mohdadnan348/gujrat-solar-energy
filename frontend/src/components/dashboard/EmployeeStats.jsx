"use client";

import React from "react";
import "./EmployeeStats.css";

const TaskIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="4" width="18" height="17" rx="2" />
    <path d="M8 2v4" />
    <path d="M16 2v4" />
    <path d="M3 9h18" />
    <path d="m9 14 2 2 4-4" />
  </svg>
);

const PendingIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

const CompletedIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="9" />
    <path d="m8 12 2.5 2.5L16 9" />
  </svg>
);

const LeadsIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const StatCard = ({
  title,
  value,
  description,
  icon,
}) => {
  return (
    <div className="employee-stat-card">
      <div className="employee-stat-content">
        <div className="employee-stat-text">
          <span className="employee-stat-title">
            {title}
          </span>

          <strong className="employee-stat-value">
            {value}
          </strong>

          <span className="employee-stat-description">
            {description}
          </span>
        </div>

        <div className="employee-stat-icon">
          {icon}
        </div>
      </div>
    </div>
  );
};

const EmployeeStats = ({ stats }) => {
  const dashboardStats =
    stats?.stats ??
    stats ??
    {};

  const tasks =
    dashboardStats?.tasks ??
    {};

  const leads =
    dashboardStats?.leads ??
    {};

  const myTasks = Number(
    tasks?.my ??
      tasks?.total ??
      0
  );

  const pendingTasks = Number(
    tasks?.pending ??
      0
  );

  const completedTasks = Number(
    tasks?.completed ??
      0
  );

  const myLeads = Number(
    leads?.my ??
      leads?.total ??
      0
  );

  return (
    <div className="employee-stats-grid">

      <StatCard
        title="My Tasks"
        value={myTasks}
        description="Tasks assigned to you"
        icon={<TaskIcon />}
      />

      <StatCard
        title="Pending Tasks"
        value={pendingTasks}
        description="Tasks waiting for completion"
        icon={<PendingIcon />}
      />

      <StatCard
        title="Completed Tasks"
        value={completedTasks}
        description="Tasks completed"
        icon={<CompletedIcon />}
      />

      <StatCard
        title="My Leads"
        value={myLeads}
        description="Your leads"
        icon={<LeadsIcon />}
      />

    </div>
  );
};

export default EmployeeStats;