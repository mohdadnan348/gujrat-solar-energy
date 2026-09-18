"use client";

import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import useAuth from "@/hooks/useAuth";

const DashboardPage = () => {
  const { user, logout, loading } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  const handleSearch = (value) => {
    console.log("Global search:", value);
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        Loading dashboard...
      </div>
    );
  }

  return (
    <MainLayout
      user={user}
      onLogout={handleLogout}
      onSearch={handleSearch}
      notificationCount={0}
    >
      <section>
        <div>
          <p>Dashboard</p>
          <h1>
            Welcome back{user?.name ? `, ${user.name}` : ""}
          </h1>
          <p>
            Manage your solar business operations from one place.
          </p>
        </div>
      </section>
    </MainLayout>
  );
};

export default DashboardPage;