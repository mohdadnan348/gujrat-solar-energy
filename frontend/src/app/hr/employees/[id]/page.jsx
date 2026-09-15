"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import Loader from "@/components/common/Loader";
import { useAuth } from "@/hooks/useAuth";
import employeeService from "@/services/employee.service";

const EmployeeDetailsPage = () => {
  const params = useParams();
  const router = useRouter();

  const { user, logout, loading: authLoading } = useAuth();

  const employeeId = params?.id;

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const handleLogout = async () => {
    await logout();
  };

  const handleSearch = (value) => {
    console.log("HR global search:", value);
  };

  const loadEmployee = async (isRefresh = false) => {
    if (!employeeId) return;

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response =
        await employeeService.getEmployeeById(employeeId);

      const data =
        response?.data?.employee ||
        response?.data ||
        response?.employee ||
        null;

      setEmployee(data);
    } catch (err) {
      console.error(
        "Employee details loading error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load employee details."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadEmployee();
  }, [employeeId]);

  const getName = () => {
    if (!employee) return "Employee";

    return employee.name || "Unnamed Employee";
  };

  const getEmail = () => {
    return employee?.email || "—";
  };

  const getMobile = () => {
    return employee?.mobile || "—";
  };

  const getRole = () => {
    return employee?.role || "EMPLOYEE";
  };

  const getStatus = () => {
    return employee?.status || "ACTIVE";
  };

  const getInitials = (name) => {
    const words = String(name)
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (!words.length) return "E";

    return words
      .slice(0, 2)
      .map((word) =>
        word.charAt(0).toUpperCase()
      )
      .join("");
  };

  const formatText = (value) => {
    if (!value) return "—";

    return String(value)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  const formatDate = (date) => {
    if (!date) return "—";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "—";
    }

    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusVariant = (status) => {
    const normalized = String(status).toUpperCase();

    if (normalized === "ACTIVE") {
      return "success";
    }

    if (normalized === "INACTIVE") {
      return "secondary";
    }

    if (normalized === "SUSPENDED") {
      return "danger";
    }

    return "warning";
  };

  const handleBack = () => {
    router.push("/hr/employees");
  };

  if (authLoading || loading) {
    return (
      <MainLayout
        user={user}
        onLogout={handleLogout}
        onSearch={handleSearch}
        notificationCount={0}
      >
        <div className="hr-employee-details-loading">
          <Loader />
        </div>
      </MainLayout>
    );
  }

  if (error || !employee) {
    return (
      <MainLayout
        user={user}
        onLogout={handleLogout}
        onSearch={handleSearch}
        notificationCount={0}
      >
        <div className="hr-employee-details-page">
          <div className="hr-employee-details-error">
            <div className="hr-employee-details-error-icon">
              !
            </div>

            <h2>Employee Not Found</h2>

            <p>
              {error ||
                "The requested employee could not be found."}
            </p>

            <div className="hr-employee-details-error-actions">
              <Button
                type="button"
                variant="secondary"
                onClick={handleBack}
              >
                ← Back to Employees
              </Button>

              <Button
                type="button"
                onClick={() => loadEmployee()}
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  const name = getName();
  const status = getStatus();
  const role = getRole();

  return (
    <MainLayout
      user={user}
      onLogout={handleLogout}
      onSearch={handleSearch}
      notificationCount={0}
    >
      <div className="hr-employee-details-page">
        <div className="hr-employee-details-header">
          <div>
            <div className="hr-employee-details-breadcrumb">
              <button
                type="button"
                onClick={handleBack}
              >
                Employees
              </button>

              <span>/</span>

              <span>{name}</span>
            </div>

            <h1>Employee Details</h1>

            <p>
              View employee profile and employment
              information.
            </p>
          </div>

          <div className="hr-employee-details-header-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={handleBack}
            >
              ← Back
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={() => loadEmployee(true)}
              disabled={refreshing}
            >
              {refreshing
                ? "Refreshing..."
                : "↻ Refresh"}
            </Button>
          </div>
        </div>

        <section className="hr-employee-profile-card">
          <div className="hr-employee-profile-main">
            <div className="hr-employee-profile-avatar">
              {employee.profileImage ? (
                <img
                  src={employee.profileImage}
                  alt={name}
                />
              ) : (
                getInitials(name)
              )}
            </div>

            <div className="hr-employee-profile-info">
              <div className="hr-employee-profile-name-row">
                <h2>{name}</h2>

                <Badge
                  variant={getStatusVariant(status)}
                >
                  {formatText(status)}
                </Badge>
              </div>

              <p>{formatText(role)}</p>

              <div className="hr-employee-profile-contact">
                <span>✉ {getEmail()}</span>
                <span>☎ {getMobile()}</span>
              </div>
            </div>
          </div>

          <div className="hr-employee-profile-id">
            <span>Employee ID</span>

            <strong>
              {employee.employeeId || "—"}
            </strong>
          </div>
        </section>

        <div className="hr-employee-details-layout">
          <div className="hr-employee-details-main">
            <section className="hr-employee-info-card">
              <div className="hr-employee-info-card-header">
                <div className="hr-employee-info-card-icon">
                  👤
                </div>

                <div>
                  <h2>Personal Information</h2>
                  <p>
                    Basic employee contact information.
                  </p>
                </div>
              </div>

              <div className="hr-employee-info-grid">
                <div className="hr-employee-info-item">
                  <span>Full Name</span>
                  <strong>{name}</strong>
                </div>

                <div className="hr-employee-info-item">
                  <span>Email Address</span>
                  <strong>{getEmail()}</strong>
                </div>

                <div className="hr-employee-info-item">
                  <span>Mobile Number</span>
                  <strong>{getMobile()}</strong>
                </div>

                <div className="hr-employee-info-item">
                  <span>Employee ID</span>
                  <strong>
                    {employee.employeeId || "—"}
                  </strong>
                </div>

                <div className="hr-employee-info-item">
                  <span>Address</span>
                  <strong>
                    {employee.address || "—"}
                  </strong>
                </div>

                <div className="hr-employee-info-item">
                  <span>Profile Status</span>

                  <Badge
                    variant={getStatusVariant(status)}
                  >
                    {formatText(status)}
                  </Badge>
                </div>
              </div>
            </section>

            <section className="hr-employee-info-card">
              <div className="hr-employee-info-card-header">
                <div className="hr-employee-info-card-icon">
                  💼
                </div>

                <div>
                  <h2>Employment Information</h2>
                  <p>
                    Role and organizational details.
                  </p>
                </div>
              </div>

              <div className="hr-employee-info-grid">
                <div className="hr-employee-info-item">
                  <span>Employee ID</span>
                  <strong>
                    {employee.employeeId || "—"}
                  </strong>
                </div>

                <div className="hr-employee-info-item">
                  <span>Role</span>
                  <strong>
                    {formatText(role)}
                  </strong>
                </div>

                <div className="hr-employee-info-item">
                  <span>Department</span>
                  <strong>
                    {formatText(
                      employee.department
                    )}
                  </strong>
                </div>

                <div className="hr-employee-info-item">
                  <span>Designation</span>
                  <strong>
                    {formatText(
                      employee.designation
                    )}
                  </strong>
                </div>

                <div className="hr-employee-info-item">
                  <span>Joining Date</span>
                  <strong>
                    {formatDate(
                      employee.joiningDate
                    )}
                  </strong>
                </div>

                <div className="hr-employee-info-item">
                  <span>Employment Status</span>

                  <Badge
                    variant={getStatusVariant(status)}
                  >
                    {formatText(status)}
                  </Badge>
                </div>

                <div className="hr-employee-info-item">
                  <span>Team</span>
                  <strong>
                    {formatText(employee.team)}
                  </strong>
                </div>
              </div>
            </section>

            <section className="hr-employee-info-card">
              <div className="hr-employee-info-card-header">
                <div className="hr-employee-info-card-icon">
                  👨‍💼
                </div>

                <div>
                  <h2>Manager Information</h2>
                  <p>
                    Reporting manager assigned to
                    the employee.
                  </p>
                </div>
              </div>

              <div className="hr-employee-info-grid">
                <div className="hr-employee-info-item">
                  <span>Manager</span>
                  <strong>
                    {employee.manager?.name ||
                      employee.manager?.employeeId ||
                      "Not Assigned"}
                  </strong>
                </div>

                <div className="hr-employee-info-item">
                  <span>Manager ID</span>
                  <strong>
                    {employee.manager?.employeeId ||
                      "—"}
                  </strong>
                </div>
              </div>
            </section>

            {employee.notes && (
              <section className="hr-employee-info-card">
                <div className="hr-employee-info-card-header">
                  <div className="hr-employee-info-card-icon">
                    📝
                  </div>

                  <div>
                    <h2>Additional Notes</h2>
                    <p>
                      Additional information about
                      the employee.
                    </p>
                  </div>
                </div>

                <div className="hr-employee-notes">
                  {employee.notes}
                </div>
              </section>
            )}
          </div>

          <aside className="hr-employee-details-sidebar">
            <section className="hr-employee-side-card">
              <div className="hr-employee-side-card-header">
                <h3>Profile Summary</h3>
              </div>

              <div className="hr-employee-summary-list">
                <div>
                  <span>Employee ID</span>
                  <strong>
                    {employee.employeeId || "—"}
                  </strong>
                </div>

                <div>
                  <span>Status</span>

                  <Badge
                    variant={getStatusVariant(status)}
                  >
                    {formatText(status)}
                  </Badge>
                </div>

                <div>
                  <span>Role</span>
                  <strong>
                    {formatText(role)}
                  </strong>
                </div>

                <div>
                  <span>Department</span>
                  <strong>
                    {formatText(
                      employee.department
                    )}
                  </strong>
                </div>

                <div>
                  <span>Designation</span>
                  <strong>
                    {formatText(
                      employee.designation
                    )}
                  </strong>
                </div>

                <div>
                  <span>Joining Date</span>
                  <strong>
                    {formatDate(
                      employee.joiningDate
                    )}
                  </strong>
                </div>
              </div>
            </section>

            <section className="hr-employee-side-card">
              <div className="hr-employee-side-card-header">
                <h3>Contact Information</h3>
              </div>

              <div className="hr-employee-account-list">
                <div>
                  <span>Email</span>
                  <strong>{getEmail()}</strong>
                </div>

                <div>
                  <span>Mobile</span>
                  <strong>{getMobile()}</strong>
                </div>

                <div>
                  <span>Address</span>
                  <strong>
                    {employee.address || "—"}
                  </strong>
                </div>
              </div>
            </section>

            <section className="hr-employee-side-card">
              <div className="hr-employee-side-card-header">
                <h3>Record Information</h3>
              </div>

              <div className="hr-employee-account-list">
                <div>
                  <span>Created</span>
                  <strong>
                    {formatDate(
                      employee.createdAt
                    )}
                  </strong>
                </div>

                <div>
                  <span>Last Updated</span>
                  <strong>
                    {formatDate(
                      employee.updatedAt
                    )}
                  </strong>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </MainLayout>
  );
};

export default EmployeeDetailsPage;