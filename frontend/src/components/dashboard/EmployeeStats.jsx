"use client";

import React from "react";
import StatCard from "./StatCard";
import "./EmployeeStats.css";

/* =========================================================
   ICONS
   ========================================================= */

const LeadsIcon = () => (
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
);

const QuotationIcon = () => (
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
);

const CustomerIcon = () => (
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
);

const TaskIcon = () => (
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
    <path d="M3 9h18" />
    <path d="m9 14 2 2 4-4" />
  </svg>
);

const PendingIcon = () => (
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
);

const CompletedIcon = () => (
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
);

const OverdueIcon = () => (
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
    <path d="M10.3 2.9 1.8 17a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 2.9a2 2 0 0 0-3.4 0Z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </svg>
);

const InvoiceIcon = () => (
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
    <path d="M6 2h12a2 2 0 0 1 2 2v18l-3-2-3 2-3-2-3 2-3-2-3 2V4a2 2 0 0 1 2-2Z" />
    <path d="M8 7h8" />
    <path d="M8 11h8" />
    <path d="M8 15h5" />
  </svg>
);

const LeaveIcon = () => (
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
    <path d="M5 20h14" />
    <path d="M12 20V4" />
    <path d="m12 4 7 4-7 4" />
    <path d="M12 8H5a3 3 0 0 0 0 6h3" />
  </svg>
);

const AttendanceIcon = () => (
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
    <path d="M3 9h18" />
    <path d="m8 14 2 2 4-4" />
  </svg>
);

const NewLeadIcon = () => (
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
    <path d="M15 8h6" />
    <path d="M18 5v6" />
    <path d="M15 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
  </svg>
);

const StatCardWrapper = ({
  title,
  value,
  icon,
  variant,
  loading,
}) => (
  <div className="gse-stat-grid-item">
    <StatCard
      title={title}
      value={value}
      icon={icon}
      variant={variant}
      loading={loading}
    />
  </div>
);

/* =========================================================
   EMPLOYEE STATS
   ========================================================= */

const EmployeeStats = ({
  stats = {},
  loading = false,
}) => {
  const dashboardStats =
    stats?.stats || stats || {};

  const leads =
    dashboardStats?.leads || {};

  const customers =
    dashboardStats?.customers || {};

  const quotations =
    dashboardStats?.quotations || {};

  const invoices =
    dashboardStats?.invoices || {};

  const tasks =
    dashboardStats?.tasks || {};

  const leaves =
    dashboardStats?.leaves || {};

  const attendance =
    dashboardStats?.attendance || {};

  const statsCards = [
    {
      title: "My Leads",
      value:
        leads?.my ??
        leads?.total ??
        0,
      variant: "primary",
      icon: <LeadsIcon />,
    },

    {
      title: "New Leads",
      value:
        leads?.new ??
        0,
      variant: "info",
      icon: <NewLeadIcon />,
    },

    {
      title: "My Customers",
      value:
        customers?.total ??
        0,
      variant: "success",
      icon: <CustomerIcon />,
    },

    {
      title: "My Quotations",
      value:
        quotations?.total ??
        0,
      variant: "warning",
      icon: <QuotationIcon />,
    },

    {
      title: "My Invoices",
      value:
        invoices?.total ??
        0,
      variant: "primary",
      icon: <InvoiceIcon />,
    },

    {
      title: "My Tasks",
      value:
        tasks?.my ??
        tasks?.total ??
        0,
      variant: "info",
      icon: <TaskIcon />,
    },

    {
      title: "Pending Tasks",
      value:
        tasks?.pending ??
        0,
      variant: "warning",
      icon: <PendingIcon />,
    },

    {
      title: "Completed Tasks",
      value:
        tasks?.completed ??
        0,
      variant: "success",
      icon: <CompletedIcon />,
    },

    {
      title: "Overdue Tasks",
      value:
        tasks?.overdue ??
        0,
      variant: "danger",
      icon: <OverdueIcon />,
    },

    {
      title: "Pending Leaves",
      value:
        leaves?.pending ??
        0,
      variant: "warning",
      icon: <LeaveIcon />,
    },

    {
      title: "Today's Attendance",
      value:
        attendance?.today ??
        0,
      variant: "success",
      icon: <AttendanceIcon />,
    },

    {
      title: "Invoices in Period",
      value:
        invoices?.inPeriod ??
        0,
      variant: "info",
      icon: <InvoiceIcon />,
    },
  ];

  return (
    <div className="gse-stats-grid">
      {statsCards.map((card) => (
        <StatCardWrapper
          key={card.title}
          title={card.title}
          value={card.value}
          icon={card.icon}
          variant={card.variant}
          loading={loading}
        />
      ))}
    </div>
  );
};

export default EmployeeStats;