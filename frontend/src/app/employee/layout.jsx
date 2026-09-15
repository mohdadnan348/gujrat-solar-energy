"use client";

import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/hooks/useAuth";

const EmployeeLayout = ({ children }) => {
  const { user, logout, loading } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  const handleSearch = (value) => {
    console.log("Global search:", value);
  };

  if (loading) {
    return (
      <div className="employee-layout-loading">
        Loading...
      </div>
    );
  }

  return (
    <div className="employee-layout">
      <MainLayout
        user={user}
        onLogout={handleLogout}
        onSearch={handleSearch}
        notificationCount={0}
      >
        <div className="employee-layout-content">
          {children}
        </div>
      </MainLayout>
    </div>
  );
};

export default EmployeeLayout;