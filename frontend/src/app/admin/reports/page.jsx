"use client";

import React from "react";
import Link from "next/link";
import AdminLayout from "../layout";
import "./reports.css";

const reportCards = [
  {
    title: "Lead Report",
    description:
      "Analyze lead volume, sources, statuses, priorities, and conversion performance.",
    href: "/admin/reports/leads",
    icon: "L",
    metric: "Lead Analytics",
  },
  {
    title: "Sales Report",
    description:
      "Review quotation and invoice performance, sales values, and business trends.",
    href: "/admin/reports/sales",
    icon: "S",
    metric: "Sales Analytics",
  },
  {
    title: "Operations Report",
    description:
      "Monitor solar requirements, system configurations, tasks, and operational progress.",
    href: "/admin/reports/operations",
    icon: "O",
    metric: "Operations Analytics",
  },
  {
    title: "Employee Report",
    description:
      "Review employee activity, attendance, leave records, and workforce information.",
    href: "/admin/reports/employees",
    icon: "E",
    metric: "Employee Analytics",
  },
];

const AdminReportsPage = () => {
  return (
    <AdminLayout>
      <div className="admin-reports-page">
        <div className="admin-reports-header">
          <div>
            <div className="admin-reports-breadcrumb">
              <Link href="/admin">Admin</Link>
              <span>/</span>
              <span>Reports</span>
            </div>

            <h1>Reports & Analytics</h1>

            <p>
              Access business reports and analyze key performance information
              across the system.
            </p>
          </div>
        </div>

        <section className="admin-reports-overview">
          <div className="admin-reports-overview-content">
            <div className="admin-reports-overview-icon">A</div>

            <div>
              <span>Business Intelligence</span>
              <h2>Monitor performance from one place</h2>
              <p>
                Select a report below to explore detailed business,
                operational, sales, and employee data.
              </p>
            </div>
          </div>
        </section>

        <section className="admin-reports-section">
          <div className="admin-reports-section-header">
            <div>
              <h2>Available Reports</h2>
              <p>Select a report to view detailed analytics.</p>
            </div>
          </div>

          <div className="admin-reports-grid">
            {reportCards.map((report) => (
              <Link
                href={report.href}
                className="admin-report-card"
                key={report.href}
              >
                <div className="admin-report-card-top">
                  <div className="admin-report-icon">{report.icon}</div>

                  <span className="admin-report-arrow">→</span>
                </div>

                <div className="admin-report-card-content">
                  <span className="admin-report-card-metric">
                    {report.metric}
                  </span>

                  <h3>{report.title}</h3>

                  <p>{report.description}</p>
                </div>

                <div className="admin-report-card-footer">
                  <span>View Report</span>
                  <span>→</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="admin-reports-info">
          <div className="admin-reports-info-item">
            <div className="admin-reports-info-icon">L</div>
            <div>
              <strong>Lead Performance</strong>
              <span>
                Track lead acquisition and conversion activity.
              </span>
            </div>
          </div>

          <div className="admin-reports-info-item">
            <div className="admin-reports-info-icon">S</div>
            <div>
              <strong>Sales Performance</strong>
              <span>
                Review quotation and invoice business performance.
              </span>
            </div>
          </div>

          <div className="admin-reports-info-item">
            <div className="admin-reports-info-icon">O</div>
            <div>
              <strong>Operations Performance</strong>
              <span>
                Monitor requirements, configurations, and task progress.
              </span>
            </div>
          </div>

          <div className="admin-reports-info-item">
            <div className="admin-reports-info-icon">E</div>
            <div>
              <strong>Employee Performance</strong>
              <span>
                Review workforce, attendance, and leave information.
              </span>
            </div>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
};

export default AdminReportsPage;