"use client";

import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/hooks/useAuth";

const ManagerLayout = ({ children }) => {
  const { user, logout, loading } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  const handleSearch = (value) => {
    console.log("Manager global search:", value);
  };

  if (loading) {
    return (
      <div className="manager-layout-loading">
        Loading...
      </div>
    );
  }

  return (
    <div className="manager-layout">
      <MainLayout
        user={user}
        onLogout={handleLogout}
        onSearch={handleSearch}
        notificationCount={0}
      >
        <div className="manager-layout-content">
          {children}
        </div>
      </MainLayout>
    </div>
  );
};

export default ManagerLayout;