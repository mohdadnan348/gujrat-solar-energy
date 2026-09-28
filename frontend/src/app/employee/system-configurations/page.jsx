"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Button from "@/components/common/Button";
import SearchBox from "@/components/common/SearchBox";
import Select from "@/components/common/Select";
import Badge from "@/components/common/Badge";
import Pagination from "@/components/common/Pagination";
import Loader from "@/components/common/Loader";

import { useAuth } from "@/hooks/useAuth";
import leadService from "@/services/lead.service";
import systemConfigurationService from "@/services/systemConfiguration.service";
import "./configurations.css";
const EmployeeSystemConfigurationsPage = () => {
  const router = useRouter();

  const { user, loading: authLoading } = useAuth();

  const [configurations, setConfigurations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const limit = 10;

  /**
   * ---------------------------------------------------------
   * Extract array from API response
   * ---------------------------------------------------------
   */
  const extractArray = (response, keys = []) => {
    for (const key of keys) {
      if (Array.isArray(response?.data?.[key])) {
        return response.data[key];
      }

      if (Array.isArray(response?.[key])) {
        return response[key];
      }
    }

    if (Array.isArray(response?.data)) {
      return response.data;
    }

    if (Array.isArray(response)) {
      return response;
    }

    return [];
  };

  /**
   * ---------------------------------------------------------
   * Load Employee System Configurations
   * ---------------------------------------------------------
   *
   * Employee flow:
   *
   * Employee
   *    ↓
   * GET /api/v1/leads/my-leads
   *    ↓
   * Assigned Leads
   *    ↓
   * GET /api/v1/system-configurations/lead/:leadId
   *    ↓
   * System Configurations
   *
   * Company-wide endpoints are NOT used here.
   */
  const loadConfigurations = async () => {
    try {
      setLoading(true);
      setError("");

      /**
       * -----------------------------------------------------
       * STEP 1
       * Get only logged-in employee's assigned leads.
       * -----------------------------------------------------
       */
      const leadResponse = await leadService.getMyLeads({
        page: 1,
        limit: 100,
      });

      const leads = extractArray(leadResponse, [
        "leads",
        "items",
      ]);

      /**
       * No assigned leads.
       */
      if (leads.length === 0) {
        setConfigurations([]);
        return;
      }

      /**
       * -----------------------------------------------------
       * STEP 2
       * Get configurations for every assigned lead.
       * -----------------------------------------------------
       */
      const configurationRequests = leads
        .map((lead) => lead?._id || lead?.id)
        .filter(Boolean)
        .map(async (leadId) => {
          try {
            const response =
              await systemConfigurationService.getConfigurationsByLead(
                leadId
              );

            return extractArray(response, [
              "configurations",
              "items",
            ]);
          } catch (leadError) {
            console.warn(
              `Failed to load configuration for lead ${leadId}:`,
              leadError
            );

            return [];
          }
        });

      const results = await Promise.all(
        configurationRequests
      );

      /**
       * Flatten all configuration arrays.
       */
      const allConfigurations = results.flat();

      /**
       * -----------------------------------------------------
       * Remove duplicate configurations.
       * -----------------------------------------------------
       */
      const uniqueConfigurations = Array.from(
        new Map(
          allConfigurations
            .filter(Boolean)
            .map((configuration, index) => [
              configuration?._id ||
                configuration?.id ||
                `configuration-${index}`,
              configuration,
            ])
        ).values()
      );

      setConfigurations(uniqueConfigurations);
    } catch (err) {
      console.error(
        "Failed to load employee system configurations:",
        err
      );

      setConfigurations([]);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load system configurations. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * ---------------------------------------------------------
   * Initial Load
   * ---------------------------------------------------------
   */
  useEffect(() => {
    if (!authLoading && user) {
      loadConfigurations();
    }
  }, [authLoading, user]);

  /**
   * ---------------------------------------------------------
   * Search + Status Filter
   * ---------------------------------------------------------
   */
  const filteredConfigurations = useMemo(() => {
    const query = search.trim().toLowerCase();

    return configurations.filter((configuration) => {
      const configurationStatus =
        configuration?.status ||
        configuration?.configurationStatus ||
        "";

      const searchableText = [
        configuration?.configurationNumber,

        configuration?.customerName,
        configuration?.customer?.name,

        configuration?.leadName,
        configuration?.lead?.name,
        configuration?.lead?.customerName,
        configuration?.lead?.leadId,

        configuration?.systemName,
        configuration?.systemType,
        configuration?.configurationName,

        configuration?.systemCapacity,
        configuration?.capacity,

        configuration?.city,
        configuration?.location,
      ]
        .filter(
          (value) =>
            value !== undefined &&
            value !== null &&
            value !== ""
        )
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !query ||
        searchableText.includes(query);

      const matchesStatus =
        !status ||
        String(configurationStatus).toLowerCase() ===
          String(status).toLowerCase();

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    configurations,
    search,
    status,
  ]);

  /**
   * Reset pagination when filters change.
   */
  useEffect(() => {
    setPage(1);
  }, [search, status]);

  /**
   * ---------------------------------------------------------
   * Pagination
   * ---------------------------------------------------------
   */
  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredConfigurations.length / limit
    )
  );

  const paginatedConfigurations = useMemo(() => {
    const start =
      (page - 1) * limit;

    return filteredConfigurations.slice(
      start,
      start + limit
    );
  }, [
    filteredConfigurations,
    page,
  ]);

  /**
   * ---------------------------------------------------------
   * Helpers
   * ---------------------------------------------------------
   */

  const getCustomerName = (configuration) => {
    return (
      configuration?.customerName ||
      configuration?.customer?.name ||
      configuration?.leadName ||
      configuration?.lead?.customerName ||
      "Unnamed Customer"
    );
  };

  const getSystemType = (configuration) => {
    const value =
      configuration?.systemType ||
      configuration?.solarSystemType ||
      "—";

    const systemTypeMap = {
      ON_GRID: "On-grid",
      OFF_GRID: "Off-grid",
      HYBRID: "Hybrid",

      "On-grid": "On-grid",
      "Off-grid": "Off-grid",
      Hybrid: "Hybrid",
    };

    return (
      systemTypeMap[value] ||
      value
    );
  };

  const getCapacity = (configuration) => {
    const capacity =
      configuration?.systemCapacity ??
      configuration?.capacity ??
      configuration?.requiredCapacity;

    if (
      capacity === undefined ||
      capacity === null ||
      capacity === ""
    ) {
      return "—";
    }

    const unit =
      configuration?.capacityUnit || "KW";

    return `${capacity} ${
      String(unit).toUpperCase() === "KW"
        ? "kW"
        : unit
    }`;
  };

  const getStatus = (configuration) => {
    return (
      configuration?.status ||
      configuration?.configurationStatus ||
      "DRAFT"
    );
  };

  const getStatusVariant = (
    configurationStatus
  ) => {
    const value =
      String(configurationStatus)
        .toLowerCase();

    if (
      [
        "completed",
        "approved",
        "active",
        "finalized",
        "configured",
      ].includes(value)
    ) {
      return "success";
    }

    if (
      [
        "rejected",
        "cancelled",
        "failed",
      ].includes(value)
    ) {
      return "danger";
    }

    if (
      [
        "in_progress",
        "under_review",
        "pending",
      ].includes(value)
    ) {
      return "warning";
    }

    return "default";
  };

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return "—";
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  /**
   * ---------------------------------------------------------
   * View Configuration
   * ---------------------------------------------------------
   */
  const handleViewConfiguration = (
    configuration
  ) => {
    const id =
      configuration?._id ||
      configuration?.id;

    if (!id) {
      return;
    }

    router.push(
      `/employee/system-configurations/${id}`
    );
  };

  /**
   * ---------------------------------------------------------
   * Auth Loading
   * ---------------------------------------------------------
   */
  if (authLoading) {
    return (
      <div className="employee-configurations-loading">
        <Loader />
      </div>
    );
  }

  /**
   * ---------------------------------------------------------
   * UI
   * ---------------------------------------------------------
   */
  return (
    <div className="employee-configurations-page">
      {/* Header */}
      <div className="employee-configurations-header">
        <div>
          <span className="employee-configurations-eyebrow">
            Solar Management
          </span>

          <h1>
            System Configurations
          </h1>

          <p>
            View solar system configurations
            for your assigned leads.
          </p>
        </div>

        <Button
          type="button"
          variant="secondary"
          onClick={loadConfigurations}
          disabled={loading}
        >
          Refresh
        </Button>
      </div>

      {/* Toolbar */}
      <div className="employee-configurations-toolbar">
        <SearchBox
          value={search}
          onChange={setSearch}
          placeholder="Search configurations..."
        />

        <Select
          value={status}
          onChange={(event) =>
            setStatus(
              event.target.value
            )
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
              value: "CONFIGURED",
              label: "Configured",
            },
            {
              value: "APPROVED",
              label: "Approved",
            },
            {
              value: "REJECTED",
              label: "Rejected",
            },
          ]}
        />
      </div>

      {/* Error */}
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

      {/* Main Card */}
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

            <h3>
              No configurations found
            </h3>

            <p>
              {search || status
                ? "Try changing your search or filter."
                : "No system configurations are available for your assigned leads yet."}
            </p>
          </div>
        ) : (
          <>
            <div className="employee-configurations-table-wrapper">
              <table className="employee-configurations-table">
                <thead>
                  <tr>
                    <th>
                      Configuration
                    </th>

                    <th>
                      Customer
                    </th>

                    <th>
                      System Type
                    </th>

                    <th>
                      Capacity
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Created
                    </th>

                    <th>
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedConfigurations.map(
                    (
                      configuration,
                      index
                    ) => {
                      const id =
                        configuration?._id ||
                        configuration?.id ||
                        `configuration-${index}`;

                      const configurationStatus =
                        getStatus(
                          configuration
                        );

                      return (
                        <tr key={id}>
                          {/* Configuration */}
                          <td>
                            <div className="employee-configuration-name">
                              {configuration?.configurationNumber ||
                                configuration?.configurationName ||
                                "System Configuration"}
                            </div>

                            {configuration?.lead?.leadId && (
                              <div className="employee-configuration-subtext">
                                {
                                  configuration
                                    .lead
                                    .leadId
                                }
                              </div>
                            )}
                          </td>

                          {/* Customer */}
                          <td>
                            <div className="employee-configuration-name">
                              {getCustomerName(
                                configuration
                              )}
                            </div>

                            {(
                              configuration?.customer?.mobile ||
                              configuration?.lead?.mobile ||
                              configuration?.mobile
                            ) && (
                              <div className="employee-configuration-subtext">
                                {configuration?.customer?.mobile ||
                                  configuration?.lead?.mobile ||
                                  configuration?.mobile}
                              </div>
                            )}
                          </td>

                          {/* System Type */}
                          <td>
                            {getSystemType(
                              configuration
                            )}
                          </td>

                          {/* Capacity */}
                          <td>
                            {getCapacity(
                              configuration
                            )}
                          </td>

                          {/* Status */}
                          <td>
                            <Badge
                              variant={getStatusVariant(
                                configurationStatus
                              )}
                            >
                              {String(
                                configurationStatus
                              ).replaceAll(
                                "_",
                                " "
                              )}
                            </Badge>
                          </td>

                          {/* Created */}
                          <td>
                            {formatDate(
                              configuration?.createdAt ||
                                configuration?.createdDate
                            )}
                          </td>

                          {/* Action */}
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

            {/* Footer */}
            <div className="employee-configurations-footer">
              <span>
                Showing{" "}
                {filteredConfigurations.length ===
                0
                  ? 0
                  : (page - 1) *
                      limit +
                    1}{" "}
                -{" "}
                {Math.min(
                  page * limit,
                  filteredConfigurations.length
                )}{" "}
                of{" "}
                {
                  filteredConfigurations.length
                }{" "}
                configurations
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
  );
};

export default EmployeeSystemConfigurationsPage;