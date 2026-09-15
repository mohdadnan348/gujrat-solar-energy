"use client";

import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import "./MainLayout.css";

const MainLayout = ({
  children,
  user,
  onLogout,
  onSearch,
  notificationCount = 0,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleMenuClick = () => {
    setSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  const handleSidebarToggle = () => {
    setSidebarCollapsed((previous) => !previous);
  };

  return (
    <div
      className={[
        "gse-main-layout",
        sidebarCollapsed
          ? "gse-main-layout-collapsed"
          : "",
      ].join(" ")}
    >
      <Sidebar
        user={user}
        isOpen={sidebarOpen}
        onClose={handleCloseSidebar}
        collapsed={sidebarCollapsed}
      />

      {sidebarOpen && (
        <button
          type="button"
          className="gse-sidebar-backdrop"
          onClick={handleCloseSidebar}
          aria-label="Close navigation"
        />
      )}

      <div className="gse-main-layout-content">
        <Header
          user={user}
          onMenuClick={handleMenuClick}
          onSidebarToggle={handleSidebarToggle}
          sidebarCollapsed={sidebarCollapsed}
          onSearch={onSearch}
          onLogout={onLogout}
          notificationCount={notificationCount}
        />

        <main className="gse-main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;