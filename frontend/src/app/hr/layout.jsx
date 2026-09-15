"use client";

import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/hooks/useAuth";

const HRLayout = ({ children }) => {
  const { user, logout, loading } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  const handleSearch = (value) => {
    console.log("HR global search:", value);
  };

  if (loading) {
    return (
      <div className="hr-layout-loading">
        Loading...
      </div>
    );
  }

  return (
    <div className="hr-layout">
      <MainLayout
        user={user}
        onLogout={handleLogout}
        onSearch={handleSearch}
        notificationCount={0}
      >
        <div className="hr-layout-content">
          {children}
        </div>
      </MainLayout>
    </div>
  );
};

export default HRLayout;