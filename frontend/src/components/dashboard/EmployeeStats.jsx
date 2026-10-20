"use client";

import React from "react";
import StatCard from "./StatCard";
import "./EmployeeStats.css";

const Icon = ({ children }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

const LeadsIcon = () => <Icon><circle cx="9" cy="7" r="4"/><path d="M2 21v-2a7 7 0 0 1 14 0v2"/><path d="M16 3.2a4 4 0 0 1 0 7.6"/><path d="M19 14a5 5 0 0 1 3 4.5V21"/></Icon>;
const TasksIcon = () => <Icon><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M8 2v4M16 2v4M3 9h18M8 14l2 2 5-5"/></Icon>;
const AttendanceIcon = () => <Icon><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M8 2v4M16 2v4M3 9h18M8 14l2 2 5-5"/></Icon>;
const LeavesIcon = () => <Icon><path d="M5 20h14M12 20V4M12 4l7 4-7 4M12 8H6a3 3 0 0 0 0 6h2"/></Icon>;

const StatCardWrapper = ({ title, value, icon, variant, loading }) => (
  <div className="gse-stat-grid-item">
    <StatCard title={title} value={value} icon={icon} variant={variant} loading={loading} />
  </div>
);

export default function EmployeeStats({ stats = {}, loading = false }) {
  const data = stats?.stats || stats || {};
  const leads = data.leads || {};
  const tasks = data.tasks || {};
  const attendance = data.attendance || {};
  const leaves = data.leaves || {};

  const cards = [
    { title: "My Leads", value: leads.my ?? leads.total ?? 0, icon: <LeadsIcon />, variant: "primary" },
    { title: "My Tasks", value: tasks.my ?? tasks.total ?? 0, icon: <TasksIcon />, variant: "info" },
    { title: "My Attendance", value: attendance.today ?? attendance.total ?? 0, icon: <AttendanceIcon />, variant: "success" },
    { title: "My Leaves", value: leaves.total ?? leaves.my ?? leaves.pending ?? 0, icon: <LeavesIcon />, variant: "warning" },
  ];

  return <div className="gse-stats-grid employee-sidebar-stats-grid">
    {cards.map(card => <StatCardWrapper key={card.title} {...card} loading={loading} />)}
  </div>;
}
