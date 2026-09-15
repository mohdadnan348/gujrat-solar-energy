"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "./Sidebar.css";

const Sidebar = ({
  user,
  isOpen = true,
  onClose,
  collapsed = false,
}) => {
  const pathname = usePathname();

  const role = user?.role?.toLowerCase();

  const roleMenus = {
    admin: [
      {
        label: "Dashboard",
        href: "/admin/dashboard",
        icon: "dashboard",
      },
      {
        label: "Leads",
        href: "/admin/leads",
        icon: "leads",
      },
      {
        label: "Solar Requirements",
        href: "/admin/solar-requirements",
        icon: "solar",
      },
      {
        label: "System Configurations",
        href: "/admin/system-configurations",
        icon: "configuration",
      },
      {
        label: "Quotations",
        href: "/admin/quotations",
        icon: "quotation",
      },
      {
        label: "Customers",
        href: "/admin/customers",
        icon: "customers",
      },
      {
        label: "Invoices",
        href: "/admin/invoices",
        icon: "invoice",
      },
      {
        label: "Tasks",
        href: "/admin/tasks",
        icon: "tasks",
      },
      {
        label: "Employees",
        href: "/admin/employees",
        icon: "employees",
      },
      {
        label: "Attendance",
        href: "/admin/attendance",
        icon: "attendance",
      },
      {
        label: "Leaves",
        href: "/admin/leaves",
        icon: "leaves",
      },
      {
        label: "Reports",
        href: "/admin/reports",
        icon: "reports",
      },
      {
        label: "Notifications",
        href: "/admin/notifications",
        icon: "notifications",
      },
      {
        label: "Audit Logs",
        href: "/admin/audit-logs",
        icon: "audit",
      },
      {
        label: "Settings",
        href: "/admin/settings",
        icon: "settings",
      },
    ],

    manager: [
      {
        label: "Dashboard",
        href: "/manager/dashboard",
        icon: "dashboard",
      },
      {
        label: "Leads",
        href: "/manager/leads",
        icon: "leads",
      },
      {
        label: "Solar Requirements",
        href: "/manager/solar-requirements",
        icon: "solar",
      },
      {
        label: "System Configurations",
        href: "/manager/system-configurations",
        icon: "configuration",
      },
      {
        label: "Quotations",
        href: "/manager/quotations",
        icon: "quotation",
      },
      {
        label: "Customers",
        href: "/manager/customers",
        icon: "customers",
      },
      {
        label: "Invoices",
        href: "/manager/invoices",
        icon: "invoice",
      },
      {
        label: "Tasks",
        href: "/manager/tasks",
        icon: "tasks",
      },
      {
        label: "Employees",
        href: "/manager/employees",
        icon: "employees",
      },
      {
        label: "Attendance",
        href: "/manager/attendance",
        icon: "attendance",
      },
      {
        label: "Reports",
        href: "/manager/reports",
        icon: "reports",
      },
      {
        label: "Notifications",
        href: "/manager/notifications",
        icon: "notifications",
      },
    ],

    hr: [
      {
        label: "Dashboard",
        href: "/hr/dashboard",
        icon: "dashboard",
      },
      {
        label: "Employees",
        href: "/hr/employees",
        icon: "employees",
      },
      {
        label: "Attendance",
        href: "/hr/attendance",
        icon: "attendance",
      },
      {
        label: "Leaves",
        href: "/hr/leaves",
        icon: "leaves",
      },
      {
        label: "Reports",
        href: "/hr/reports",
        icon: "reports",
      },
      {
        label: "Notifications",
        href: "/hr/notifications",
        icon: "notifications",
      },
      {
        label: "Settings",
        href: "/hr/settings",
        icon: "settings",
      },
    ],

    employee: [
      {
        label: "Dashboard",
        href: "/employee/dashboard",
        icon: "dashboard",
      },
      {
        label: "Leads",
        href: "/employee/leads",
        icon: "leads",
      },
      {
        label: "Solar Requirements",
        href: "/employee/solar-requirements",
        icon: "solar",
      },
      {
        label: "System Configurations",
        href: "/employee/system-configurations",
        icon: "configuration",
      },
      {
        label: "Quotations",
        href: "/employee/quotations",
        icon: "quotation",
      },
      {
        label: "Customers",
        href: "/employee/customers",
        icon: "customers",
      },
      {
        label: "Invoices",
        href: "/employee/invoices",
        icon: "invoice",
      },
      {
        label: "Tasks",
        href: "/employee/tasks",
        icon: "tasks",
      },
      {
        label: "Attendance",
        href: "/employee/attendance",
        icon: "attendance",
      },
      {
        label: "Leaves",
        href: "/employee/leaves",
        icon: "leaves",
      },
      {
        label: "Notifications",
        href: "/employee/notifications",
        icon: "notifications",
      },
    ],
  };

  const menuItems = roleMenus[role] || [];

  const isActive = (href) => {
    if (pathname === href) return true;

    return pathname?.startsWith(`${href}/`);
  };

  const getIcon = (type) => {
    const icons = {
      dashboard: (
        <svg viewBox="0 0 24 24">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      ),

      leads: (
        <svg viewBox="0 0 24 24">
          <circle cx="9" cy="8" r="3" />
          <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
          <path d="M16 11h5" />
          <path d="M18.5 8.5v5" />
        </svg>
      ),

      solar: (
        <svg viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v3" />
          <path d="M12 19v3" />
          <path d="m4.93 4.93 2.12 2.12" />
          <path d="m16.95 16.95 2.12 2.12" />
          <path d="M2 12h3" />
          <path d="M19 12h3" />
          <path d="m4.93 19.07 2.12-2.12" />
          <path d="m16.95 7.05 2.12-2.12" />
        </svg>
      ),

      configuration: (
        <svg viewBox="0 0 24 24">
          <path d="M4 4h16v16H4z" />
          <path d="M8 8h8" />
          <path d="M8 12h8" />
          <path d="M8 16h5" />
        </svg>
      ),

      quotation: (
        <svg viewBox="0 0 24 24">
          <path d="M6 2h9l4 4v16H6z" />
          <path d="M14 2v5h5" />
          <path d="M9 13h6" />
          <path d="M9 17h4" />
        </svg>
      ),

      customers: (
        <svg viewBox="0 0 24 24">
          <circle cx="9" cy="8" r="3" />
          <circle cx="17" cy="9" r="2.5" />
          <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
          <path d="M15 15c3 0 5 2 5 5" />
        </svg>
      ),

      invoice: (
        <svg viewBox="0 0 24 24">
          <path d="M6 2h12v20l-3-2-3 2-3-2-3 2z" />
          <path d="M9 8h6" />
          <path d="M9 12h6" />
          <path d="M9 16h4" />
        </svg>
      ),

      tasks: (
        <svg viewBox="0 0 24 24">
          <rect x="4" y="3" width="16" height="18" rx="2" />
          <path d="m8 9 2 2 4-4" />
          <path d="M8 15h8" />
        </svg>
      ),

      employees: (
        <svg viewBox="0 0 24 24">
          <circle cx="12" cy="8" r="3" />
          <path d="M5 21c0-4 3-7 7-7s7 3 7 7" />
        </svg>
      ),

      attendance: (
        <svg viewBox="0 0 24 24">
          <rect x="3" y="4" width="18" height="17" rx="2" />
          <path d="M8 2v4" />
          <path d="M16 2v4" />
          <path d="M3 10h18" />
          <path d="m8 15 2 2 5-5" />
        </svg>
      ),

      leaves: (
        <svg viewBox="0 0 24 24">
          <path d="M5 21c6-1 11-5 14-13-7 0-12 3-14 8-1 2-1 4 0 5z" />
          <path d="M5 21c2-4 5-7 9-9" />
        </svg>
      ),

      reports: (
        <svg viewBox="0 0 24 24">
          <path d="M4 20V10" />
          <path d="M10 20V4" />
          <path d="M16 20v-7" />
          <path d="M22 20H2" />
        </svg>
      ),

      notifications: (
        <svg viewBox="0 0 24 24">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
          <path d="M10 21h4" />
        </svg>
      ),

      audit: (
        <svg viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      ),

      settings: (
        <svg viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2 2-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-2.8v-.2a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1-2-2 .1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H5v-2.8h.2a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 2-2 .1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V5h2.8v.2a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 2 2-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v2.8h-.2a1.7 1.7 0 0 0-1.6.8z" />
        </svg>
      ),
    };

    return icons[type] || icons.dashboard;
  };

  return (
    <aside
      className={[
        "gse-sidebar",
        isOpen ? "gse-sidebar-open" : "",
        collapsed ? "gse-sidebar-collapsed" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="gse-sidebar-brand">
        <Link href="/" className="gse-sidebar-logo">
          <span className="gse-sidebar-logo-icon">
            ☀
          </span>

          {!collapsed && (
            <span className="gse-sidebar-brand-text">
              <strong>GUJRAT</strong>
              <small>SOLAR ENERGY</small>
            </span>
          )}
        </Link>

        {onClose && (
          <button
            type="button"
            className="gse-sidebar-close"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            ×
          </button>
        )}
      </div>

      <div className="gse-sidebar-profile">
        <div className="gse-sidebar-avatar">
          {user?.name?.charAt(0)?.toUpperCase() ||
            user?.firstName?.charAt(0)?.toUpperCase() ||
            "U"}
        </div>

        {!collapsed && (
          <div className="gse-sidebar-user">
            <strong>
              {user?.name ||
                `${user?.firstName || ""} ${
                  user?.lastName || ""
                }`.trim() ||
                "User"}
            </strong>

            <span>
              {role
                ? role.charAt(0).toUpperCase() + role.slice(1)
                : "User"}
            </span>
          </div>
        )}
      </div>

      <nav className="gse-sidebar-nav">
        {!collapsed && (
          <div className="gse-sidebar-section-title">
            MAIN MENU
          </div>
        )}

        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={[
              "gse-sidebar-link",
              isActive(item.href)
                ? "gse-sidebar-link-active"
                : "",
            ]
              .filter(Boolean)
              .join(" ")}
            title={collapsed ? item.label : undefined}
          >
            <span className="gse-sidebar-link-icon">
              {getIcon(item.icon)}
            </span>

            {!collapsed && (
              <span className="gse-sidebar-link-label">
                {item.label}
              </span>
            )}
          </Link>
        ))}
      </nav>

      {!collapsed && (
        <div className="gse-sidebar-footer">
          <div className="gse-sidebar-footer-card">
            <span className="gse-sidebar-footer-sun">
              ☀
            </span>

            <div>
              <strong>Solar Management</strong>
              <small>
                Powering your business smarter
              </small>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;