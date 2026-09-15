"use client";

import React, { useState } from "react";
import Link from "next/link";
import Avatar from "../common/Avatar";
import SearchBox from "../common/SearchBox";
import "./Header.css";

const Header = ({
  user,
  onMenuClick,
  onSidebarToggle,
  sidebarCollapsed = false,
  onSearch,
  onLogout,
  notificationCount = 0,
}) => {
  const [profileOpen, setProfileOpen] = useState(false);

  const role = user?.role?.toLowerCase() || "employee";

  const dashboardPath = `/${role}/dashboard`;

  const displayName =
    user?.name ||
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
    "User";

  const getInitials = (name) => {
    if (!name) return "U";

    const parts = name.trim().split(/\s+/);

    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }

    return `${parts[0][0]}${
      parts[parts.length - 1][0]
    }`.toUpperCase();
  };

  const handleLogout = () => {
    setProfileOpen(false);
    onLogout?.();
  };

  return (
    <header className="gse-header">
      <div className="gse-header-left">
        <button
          type="button"
          className="gse-header-menu-button"
          onClick={onMenuClick}
          aria-label="Open menu"
          title="Menu"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="18" x2="20" y2="18" />
          </svg>
        </button>

        <button
          type="button"
          className="gse-header-sidebar-toggle"
          onClick={onSidebarToggle}
          aria-label={
            sidebarCollapsed
              ? "Expand sidebar"
              : "Collapse sidebar"
          }
          title={
            sidebarCollapsed
              ? "Expand sidebar"
              : "Collapse sidebar"
          }
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {sidebarCollapsed ? (
              <>
                <polyline points="9 18 15 12 9 6" />
              </>
            ) : (
              <>
                <polyline points="15 18 9 12 15 6" />
              </>
            )}
          </svg>
        </button>

        <div className="gse-header-title">
          <span className="gse-header-title-main">
            Solar Management
          </span>

          <span className="gse-header-title-subtitle">
            Manage your solar business efficiently
          </span>
        </div>
      </div>

      <div className="gse-header-right">
        <div className="gse-header-search">
          <SearchBox
            placeholder="Search..."
            size="small"
            onSearch={onSearch}
          />
        </div>

        <Link
          href={`/${role}/notifications`}
          className="gse-header-notification"
          aria-label="Notifications"
          title="Notifications"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
            <path d="M10 21h4" />
          </svg>

          {notificationCount > 0 && (
            <span className="gse-header-notification-count">
              {notificationCount > 99
                ? "99+"
                : notificationCount}
            </span>
          )}
        </Link>

        <div className="gse-header-profile">
          <button
            type="button"
            className="gse-header-profile-button"
            onClick={() =>
              setProfileOpen((previous) => !previous)
            }
            aria-expanded={profileOpen}
            aria-haspopup="menu"
          >
            <Avatar
              name={displayName}
              src={user?.avatar || user?.profileImage}
              size="small"
            />

            <span className="gse-header-profile-info">
              <strong>{displayName}</strong>

              <small>
                {role.charAt(0).toUpperCase() +
                  role.slice(1)}
              </small>
            </span>

            <svg
              className={`gse-header-profile-arrow ${
                profileOpen ? "open" : ""
              }`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {profileOpen && (
            <div
              className="gse-header-profile-menu"
              role="menu"
            >
              <div className="gse-header-profile-menu-user">
                <div className="gse-header-profile-menu-avatar">
                  {getInitials(displayName)}
                </div>

                <div>
                  <strong>{displayName}</strong>
                  <span>
                    {user?.email || "User account"}
                  </span>
                </div>
              </div>

              <div className="gse-header-profile-divider" />

              <Link
                href={dashboardPath}
                className="gse-header-menu-item"
                role="menuitem"
                onClick={() => setProfileOpen(false)}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect
                    x="3"
                    y="3"
                    width="7"
                    height="7"
                    rx="1"
                  />
                  <rect
                    x="14"
                    y="3"
                    width="7"
                    height="7"
                    rx="1"
                  />
                  <rect
                    x="3"
                    y="14"
                    width="7"
                    height="7"
                    rx="1"
                  />
                  <rect
                    x="14"
                    y="14"
                    width="7"
                    height="7"
                    rx="1"
                  />
                </svg>

                Dashboard
              </Link>

              <Link
                href={`/${role}/notifications`}
                className="gse-header-menu-item"
                role="menuitem"
                onClick={() => setProfileOpen(false)}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                  <path d="M10 21h4" />
                </svg>

                Notifications
              </Link>

              <div className="gse-header-profile-divider" />

              <button
                type="button"
                className="gse-header-menu-item gse-header-logout"
                role="menuitem"
                onClick={handleLogout}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>

                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;