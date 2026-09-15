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
import systemConfigurationService from "@/services/systemConfiguration.service";

const EmployeeSystemConfigurationsPage = () => {
  const { user, logout, loading: authLoading } = useAuth();

  const [configurations, setConfigurations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const limit = 10;

  const loadConfigurations = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await systemConfigurationService.getSystemConfigurations();

      const items =
        response?.data?.configurations ||
        response?.data?.items ||
        response?.configurations ||
        response?.items ||
        response?.data ||
        [];

      setConfigurations(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error("Failed to load system configurations:", err);

      setError(
        err?.message ||
          "Unable to load system configurations. Please try again."
      );

      setConfigurations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      loadConfigurations();
    }
  }, [authLoading, user]);

  const filteredConfigurations = useMemo(() => {
    const query = search.trim().toLowerCase();

    return configurations.filter((configuration) => {
      const configurationStatus =
        configuration?.status ||
        configuration?.configurationStatus ||
        "";

      const searchableText = [
        configuration?.customerName,
        configuration?.leadName,
        configuration?.systemName,
        configuration?.systemType,
        configuration?.configurationName,
        configuration?.capacity,
        configuration?.location,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !query || searchableText.includes(query);

      const matchesStatus =
        !status ||
        configurationStatus.toLowerCase() ===
          status.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [configurations, search, status]);

  useEffect(() => {
    setPage(1);
  }, [search, status]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredConfigurations.length / limit)
  );

  const paginatedConfigurations = useMemo(() => {
    const start = (page - 1) * limit;

    return filteredConfigurations.slice(
      start,
      start + limit
    );
  }, [filteredConfigurations, page]);

  const getCustomerName = (configuration) =>
    configuration?.customerName ||
    configuration?.leadName ||
    configuration?.customer?.name ||
    configuration?.lead?.name ||
    "Unnamed Customer";

  const getSystemType = (configuration) =>
    configuration?.systemType ||
    configuration?.solarSystemType ||
    "—";

  const getCapacity = (configuration) => {
    const capacity =
      configuration?.capacity ||
      configuration?.systemCapacity ||
      configuration?.requiredCapacity;

    return capacity ? `${capacity} kW` : "—";
  };

  const getStatus = (configuration) =>
    configuration?.status ||
    configuration?.configurationStatus ||
    "DRAFT";

  const getStatusVariant = (configurationStatus) => {
    const value = configurationStatus.toLowerCase();

    if (
      ["completed", "approved", "active", "finalized"].includes(
        value
      )
    ) {
      return "success";
    }

    if (
      ["rejected", "cancelled", "failed"].includes(value)
    ) {
      return "danger";
    }

    if (
      ["in_progress", "under_review", "pending"].includes(value)
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

  const handleViewConfiguration = (configuration) => {
    const id =
      configuration?._id ||
      configuration?.id;

    if (id) {
      window.location.href =
        `/employee/system-configurations/${id}`;
    }
  };

  if (authLoading) {
    return (
      <div className="employee-configurations-loading">
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
      <div className="employee-configurations-page">
        <div className="employee-configurations-header">
          <div>
            <span className="employee-configurations-eyebrow">
              Solar Management
            </span>

            <h1>System Configurations</h1>

            <p>
              View and manage solar system configurations for your
              assigned work.
            </p>
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={loadConfigurations}
          >
            Refresh
          </Button>
        </div>

        <div className="employee-configurations-toolbar">
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Search configurations..."
          />

          <Select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value)
            }
            options={[
              {
                value: "",
                label: "All Statuses",
              },
              {
                value: "DRAFT",
                label: "Draft",
              },
              {
                value: "PENDING",
                label: "Pending",
              },
              {
                value: "IN_PROGRESS",
                label: "In Progress",
              },
              {
                value: "APPROVED",
                label: "Approved",
              },
              {
                value: "COMPLETED",
                label: "Completed",
              },
              {
                value: "CANCELLED",
                label: "Cancelled",
              },
            ]}
          />
        </div>

        {error && (
          <div className="employee-configurations-error">
            <span>{error}</span>

            <Button
              type="button"
              variant="secondary"
              onClick={loadConfigurations}
            >
              Retry
            </Button>
          </div>
        )}

        <div className="employee-configurations-card">
          {loading ? (
            <div className="employee-configurations-loader">
              <Loader />
            </div>
          ) : paginatedConfigurations.length === 0 ? (
            <div className="employee-configurations-empty">
              <div className="employee-configurations-empty-icon">
                ☀
              </div>

              <h3>No configurations found</h3>

              <p>
                {search || status
                  ? "Try changing your search or filter."
                  : "No system configurations are available yet."}
              </p>
            </div>
          ) : (
            <>
              <div className="employee-configurations-table-wrapper">
                <table className="employee-configurations-table">
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
                    {paginatedConfigurations.map(
                      (configuration, index) => {
                        const id =
                          configuration?._id ||
                          configuration?.id ||
                          index;

                        const configurationStatus =
                          getStatus(configuration);

                        return (
                          <tr key={id}>
                            <td>
                              <div className="employee-configuration-name">
                                {getCustomerName(
                                  configuration
                                )}
                              </div>

                              {(configuration?.phone ||
                                configuration?.mobile) && (
                                <div className="employee-configuration-subtext">
                                  {configuration?.phone ||
                                    configuration?.mobile}
                                </div>
                              )}
                            </td>

                            <td>
                              {getSystemType(configuration)}
                            </td>

                            <td>
                              {getCapacity(configuration)}
                            </td>

                            <td>
                              {configuration?.city ||
                                configuration?.location ||
                                "—"}
                            </td>

                            <td>
                              <Badge
                                variant={getStatusVariant(
                                  configurationStatus
                                )}
                              >
                                {configurationStatus.replaceAll(
                                  "_",
                                  " "
                                )}
                              </Badge>
                            </td>

                            <td>
                              {formatDate(
                                configuration?.createdAt ||
                                  configuration?.createdDate
                              )}
                            </td>

                            <td>
                              <Button
                                type="button"
                                variant="secondary"
                                onClick={() =>
                                  handleViewConfiguration(
                                    configuration
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

              <div className="employee-configurations-footer">
                <span>
                  Showing{" "}
                  {filteredConfigurations.length === 0
                    ? 0
                    : (page - 1) * limit + 1}{" "}
                  -{" "}
                  {Math.min(
                    page * limit,
                    filteredConfigurations.length
                  )}{" "}
                  of {filteredConfigurations.length} configurations
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

export default EmployeeSystemConfigurationsPage;