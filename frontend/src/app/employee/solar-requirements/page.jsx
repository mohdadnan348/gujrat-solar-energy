"use client";

import React, { useEffect, useMemo, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import Button from "@/components/common/Button";
import SearchBox from "@/components/common/SearchBox";
import Select from "@/components/common/Select";
import Badge from "@/components/common/Badge";
import Pagination from "@/components/common/Pagination";
import Loader from "@/components/common/Loader";
import { useAuth } from "@/hooks/useAuth";
import solarRequirementService from "@/services/solarRequirement.service";

const EmployeeSolarRequirementsPage = () => {
  const { user, logout, loading: authLoading } = useAuth();

  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [systemType, setSystemType] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const loadRequirements = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await solarRequirementService.getSolarRequirements();

      const items =
        response?.data?.requirements ||
        response?.data?.items ||
        response?.requirements ||
        response?.items ||
        response?.data ||
        [];

      setRequirements(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error("Failed to load solar requirements:", err);
      setError(
        err?.message ||
          "Unable to load solar requirements. Please try again."
      );
      setRequirements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      loadRequirements();
    }
  }, [authLoading, user]);

  const filteredRequirements = useMemo(() => {
    const query = search.trim().toLowerCase();

    return requirements.filter((requirement) => {
      const currentSystemType =
        requirement?.systemType ||
        requirement?.solarSystemType ||
        requirement?.type ||
        "";

      const searchableText = [
        requirement?.customerName,
        requirement?.leadName,
        requirement?.name,
        requirement?.phone,
        requirement?.email,
        requirement?.city,
        requirement?.location,
        currentSystemType,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !query || searchableText.includes(query);

      const matchesType =
        !systemType ||
        currentSystemType.toLowerCase() ===
          systemType.toLowerCase();

      return matchesSearch && matchesType;
    });
  }, [requirements, search, systemType]);

  useEffect(() => {
    setPage(1);
  }, [search, systemType]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRequirements.length / limit)
  );

  const paginatedRequirements = useMemo(() => {
    const start = (page - 1) * limit;

    return filteredRequirements.slice(
      start,
      start + limit
    );
  }, [filteredRequirements, page]);

  const getCustomerName = (requirement) =>
    requirement?.customerName ||
    requirement?.leadName ||
    requirement?.name ||
    requirement?.lead?.name ||
    "Unnamed Customer";

  const getSystemType = (requirement) =>
    requirement?.systemType ||
    requirement?.solarSystemType ||
    requirement?.type ||
    "—";

  const getCapacity = (requirement) => {
    const capacity =
      requirement?.requiredCapacity ||
      requirement?.capacity ||
      requirement?.systemCapacity;

    return capacity ? `${capacity} kW` : "—";
  };

  const getStatus = (requirement) =>
    requirement?.status ||
    requirement?.requirementStatus ||
    "PENDING";

  const getStatusVariant = (status) => {
    const value = status.toLowerCase();

    if (
      ["completed", "approved", "surveyed", "configured"].includes(
        value
      )
    ) {
      return "success";
    }

    if (
      ["rejected", "cancelled", "cancelled_by_customer"].includes(
        value
      )
    ) {
      return "danger";
    }

    if (
      ["in_progress", "under_review", "site_survey"].includes(value)
    ) {
      return "warning";
    }

    return "default";
  };

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleViewRequirement = (requirement) => {
    const leadId =
      requirement?.lead?._id ||
      requirement?.lead?.id ||
      requirement?.leadId;

    if (leadId) {
      window.location.href = `/employee/leads/${leadId}`;
      return;
    }

    const requirementId =
      requirement?._id || requirement?.id;

    if (requirementId) {
      window.location.href = `/employee/solar-requirements/${requirementId}`;
    }
  };

  if (authLoading) {
    return (
      <div className="employee-requirements-loading">
        <Loader />
      </div>
    );
  }

  return (
    <MainLayout
      user={user}
      onLogout={handleLogout}
      onSearch={setSearch}
      notificationCount={0}
    >
      <div className="employee-requirements-page">
        <div className="employee-requirements-header">
          <div>
            <span className="employee-requirements-eyebrow">
              Solar Management
            </span>

            <h1>Solar Requirements</h1>

            <p>
              View solar requirements associated with your leads.
            </p>
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={loadRequirements}
          >
            Refresh
          </Button>
        </div>

        <div className="employee-requirements-toolbar">
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Search requirements..."
          />

          <Select
            value={systemType}
            onChange={(event) =>
              setSystemType(event.target.value)
            }
            options={[
              {
                value: "",
                label: "All System Types",
              },
              {
                value: "ON_GRID",
                label: "On Grid",
              },
              {
                value: "OFF_GRID",
                label: "Off Grid",
              },
              {
                value: "HYBRID",
                label: "Hybrid",
              },
            ]}
          />
        </div>

        {error && (
          <div className="employee-requirements-error">
            <span>{error}</span>

            <Button
              type="button"
              variant="secondary"
              onClick={loadRequirements}
            >
              Retry
            </Button>
          </div>
        )}

        <div className="employee-requirements-card">
          {loading ? (
            <div className="employee-requirements-loader">
              <Loader />
            </div>
          ) : paginatedRequirements.length === 0 ? (
            <div className="employee-requirements-empty">
              <div className="employee-requirements-empty-icon">
                ☀
              </div>

              <h3>No requirements found</h3>

              <p>
                {search || systemType
                  ? "Try changing your search or filter."
                  : "No solar requirements are available yet."}
              </p>
            </div>
          ) : (
            <>
              <div className="employee-requirements-table-wrapper">
                <table className="employee-requirements-table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>System Type</th>
                      <th>Capacity</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedRequirements.map(
                      (requirement, index) => {
                        const requirementId =
                          requirement?._id ||
                          requirement?.id ||
                          index;

                        const status = getStatus(requirement);

                        return (
                          <tr key={requirementId}>
                            <td>
                              <div className="employee-requirement-name">
                                {getCustomerName(requirement)}
                              </div>

                              {(requirement?.phone ||
                                requirement?.mobile) && (
                                <div className="employee-requirement-subtext">
                                  {requirement?.phone ||
                                    requirement?.mobile}
                                </div>
                              )}
                            </td>

                            <td>{getSystemType(requirement)}</td>

                            <td>{getCapacity(requirement)}</td>

                            <td>
                              {requirement?.city ||
                                requirement?.location ||
                                "—"}
                            </td>

                            <td>
                              <Badge
                                variant={getStatusVariant(status)}
                              >
                                {status.replaceAll("_", " ")}
                              </Badge>
                            </td>

                            <td>
                              {formatDate(
                                requirement?.createdAt ||
                                  requirement?.createdDate
                              )}
                            </td>

                            <td>
                              <Button
                                type="button"
                                variant="secondary"
                                onClick={() =>
                                  handleViewRequirement(
                                    requirement
                                  )
                                }
                              >
                                View
                              </Button>
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>

              <div className="employee-requirements-footer">
                <span>
                  Showing{" "}
                  {filteredRequirements.length === 0
                    ? 0
                    : (page - 1) * limit + 1}{" "}
                  -{" "}
                  {Math.min(
                    page * limit,
                    filteredRequirements.length
                  )}{" "}
                  of {filteredRequirements.length} requirements
                </span>

                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default EmployeeSolarRequirementsPage;