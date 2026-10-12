// frontend/src/app/admin/layout.jsx

"use client";

import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/hooks/useAuth";

const AdminLayout = ({ children }) => {
  const { user, logout, loading } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  const handleSearch = (value) => {
    console.log("Admin global search:", value);
  };

  if (loading) {
    return (
      <div className="admin-layout-loading">
        Loading...
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <MainLayout
        user={user}
        onLogout={handleLogout}
        onSearch={handleSearch}
        notificationCount={0}
      >
        <div className="admin-layout-content">
          {children}
        </div>
      </MainLayout>
    </div>
  );
};

export default AdminLayout;