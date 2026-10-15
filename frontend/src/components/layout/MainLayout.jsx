"use client";

import React, { useContext, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AuthContext from "@/context/AuthContext";
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
  const auth = useContext(AuthContext);
  const router = useRouter();

  // Prefer the authenticated user over placeholder props such as "User".
  const effectiveUser = useMemo(() => {
    const authUser = auth?.user || {};
    const passedUser = user || {};
    const employee = auth?.employee || {};

    const merged = { ...passedUser, ...authUser };
    const firstName = merged.firstName || employee.firstName || "";
    const lastName = merged.lastName || employee.lastName || "";
    const resolvedName =
      merged.name ||
      merged.fullName ||
      employee.name ||
      employee.fullName ||
      `${firstName} ${lastName}`.trim() ||
      employee.employeeName ||
      "";

    return {
      ...merged,
      name: resolvedName && resolvedName.toLowerCase() !== "user"
        ? resolvedName
        : (employee.name || employee.fullName || employee.employeeName || "User"),
      role: merged.role || employee.role || passedUser.role || "employee",
      email: merged.email || employee.email || "",
      avatar: merged.avatar || employee.avatar || employee.profileImage,
      profileImage: merged.profileImage || employee.profileImage,
    };
  }, [user, auth?.user, auth?.employee]);

  const handleLogout = async () => {
    try {
      if (onLogout) {
        await onLogout();
      } else if (auth?.logout) {
        await auth.logout();
      }
    } finally {
      // Always return to login even if the logout API fails.
      router.replace("/login");
      router.refresh();
    }
  };

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
        user={effectiveUser}
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
          user={effectiveUser}
          onMenuClick={handleMenuClick}
          onSidebarToggle={handleSidebarToggle}
          sidebarCollapsed={sidebarCollapsed}
          onSearch={onSearch}
          onLogout={handleLogout}
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