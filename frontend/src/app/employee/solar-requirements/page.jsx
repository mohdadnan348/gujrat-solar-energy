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
import solarRequirementService from "@/services/solarRequirement.service";

import "./requirements.css";

const EmployeeSolarRequirementsPage = () => {
  const router = useRouter();

  const { user, loading: authLoading } = useAuth();

  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [systemType, setSystemType] = useState("");
  const [page, setPage] = useState(1);

  const limit = 10;

  /**
   * ---------------------------------------------------------
   * Extract array safely from API response
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
   * Load Employee Solar Requirements
   * ---------------------------------------------------------
   *
   * Employee:
   *
   * GET /api/v1/leads/my-leads
   *          ↓
   * Assigned Leads
   *          ↓
   * GET /api/v1/solar-requirements/lead/:leadId
   */
  const loadRequirements = async () => {
    try {
      setLoading(true);
      setError("");

      /**
       * STEP 1
       * Get only logged-in employee's assigned leads.
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
        setRequirements([]);
        return;
      }

      /**
       * STEP 2
       * Fetch solar requirements lead-by-lead.
       */
      const requirementRequests = leads
        .map((lead) => lead?._id || lead?.id)
        .filter(Boolean)
        .map(async (leadId) => {
          try {
            const response =
              await solarRequirementService.getSolarRequirementsByLead(
                leadId
              );

            return extractArray(response, [
              "requirements",
              "solarRequirements",
              "items",
            ]);
          } catch (leadError) {
            console.warn(
              `Failed to load solar requirement for lead ${leadId}:`,
              leadError
            );

            return [];
          }
        });

      const results = await Promise.all(
        requirementRequests
      );

      /**
       * Flatten all requirements.
       */
      const allRequirements = results.flat();

      /**
       * Remove duplicates.
       */
      const uniqueRequirements = Array.from(
        new Map(
          allRequirements
            .filter(Boolean)
            .map((requirement, index) => [
              requirement?._id ||
                requirement?.id ||
                `requirement-${index}`,
              requirement,
            ])
        ).values()
      );

      setRequirements(uniqueRequirements);
    } catch (err) {
      console.error(
        "Failed to load employee solar requirements:",
        err
      );

      setRequirements([]);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load solar requirements. Please try again."
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
      loadRequirements();
    }
  }, [authLoading, user]);

  /**
   * ---------------------------------------------------------
   * Search + Filter
   * ---------------------------------------------------------
   */
  const filteredRequirements = useMemo(() => {
    const query = search.trim().toLowerCase();

    return requirements.filter((requirement) => {
      const currentSystemType =
        requirement?.systemType ||
        requirement?.solarSystemType ||
        requirement?.type ||
        "";

      const searchableText = [
        requirement?.requirementId,
        requirement?.customerName,
        requirement?.customer?.name,

        requirement?.leadName,
        requirement?.lead?.name,
        requirement?.lead?.customerName,
        requirement?.lead?.leadId,

        requirement?.phone,
        requirement?.mobile,
        requirement?.email,

        requirement?.city,
        requirement?.location,
        requirement?.siteAddress,

        requirement?.roofType,
        requirement?.connectionType,

        currentSystemType,

        requirement?.requiredKw,
        requirement?.requiredKW,
        requirement?.requiredCapacity,
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

      const matchesType =
        !systemType ||
        String(currentSystemType).toLowerCase() ===
          String(systemType).toLowerCase();

      return (
        matchesSearch &&
        matchesType
      );
    });
  }, [
    requirements,
    search,
    systemType,
  ]);

  /**
   * Reset pagination.
   */
  useEffect(() => {
    setPage(1);
  }, [search, systemType]);

  /**
   * ---------------------------------------------------------
   * Pagination
   * ---------------------------------------------------------
   */
  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredRequirements.length / limit
    )
  );

  const paginatedRequirements = useMemo(() => {
    const start =
      (page - 1) * limit;

    return filteredRequirements.slice(
      start,
      start + limit
    );
  }, [
    filteredRequirements,
    page,
  ]);

  /**
   * ---------------------------------------------------------
   * Helpers
   * ---------------------------------------------------------
   */

  const getCustomerName = (requirement) => {
    return (
      requirement?.customerName ||
      requirement?.customer?.name ||
      requirement?.leadName ||
      requirement?.lead?.customerName ||
      requirement?.lead?.name ||
      "Unnamed Customer"
    );
  };

  const getSystemType = (requirement) => {
    const value =
      requirement?.systemType ||
      requirement?.solarSystemType ||
      requirement?.type ||
      "—";

    const systemTypeMap = {
      ON_GRID: "On-grid",
      OFF_GRID: "Off-grid",
      HYBRID: "Hybrid",

      OnGrid: "On-grid",
      OffGrid: "Off-grid",

      "On-grid": "On-grid",
      "Off-grid": "Off-grid",
      Hybrid: "Hybrid",
    };

    return (
      systemTypeMap[value] ||
      value
    );
  };

  const getCapacity = (requirement) => {
    const capacity =
      requirement?.requiredKw ??
      requirement?.requiredKW ??
      requirement?.requiredCapacity ??
      requirement?.capacity ??
      requirement?.systemCapacity;

    if (
      capacity === undefined ||
      capacity === null ||
      capacity === ""
    ) {
      return "—";
    }

    return `${capacity} kW`;
  };

  const getStatus = (requirement) => {
    return (
      requirement?.status ||
      requirement?.requirementStatus ||
      (requirement?.siteSurveyCompleted
        ? "SURVEY_COMPLETED"
        : "PENDING")
    );
  };

  const getStatusVariant = (status) => {
    const value =
      String(status).toLowerCase();

    if (
      [
        "completed",
        "approved",
        "surveyed",
        "configured",
        "survey_completed",
      ].includes(value)
    ) {
      return "success";
    }

    if (
      [
        "rejected",
        "cancelled",
        "cancelled_by_customer",
      ].includes(value)
    ) {
      return "danger";
    }

    if (
      [
        "in_progress",
        "under_review",
        "site_survey",
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
   * View Requirement
   * ---------------------------------------------------------
   */
  const handleViewRequirement = (
    requirement
  ) => {
    const requirementId =
      requirement?._id ||
      requirement?.id;

    if (requirementId) {
      router.push(
        `/employee/solar-requirements/${requirementId}`
      );

      return;
    }

    const leadId =
      requirement?.lead?._id ||
      requirement?.lead?.id ||
      requirement?.leadId;

    if (leadId) {
      router.push(
        `/employee/leads/${leadId}`
      );
    }
  };

  /**
   * ---------------------------------------------------------
   * Auth Loading
   * ---------------------------------------------------------
   */
  if (authLoading) {
    return (
      <div className="employee-requirements-loading">
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
    <div className="employee-requirements-page">
      {/* Header */}
      <div className="employee-requirements-header">
        <div>
          <span className="employee-requirements-eyebrow">
            Solar Management
          </span>

          <h1>
            Solar Requirements
          </h1>

          <p>
            View solar requirements associated
            with your assigned leads.
          </p>
        </div>

        <Button
          type="button"
          variant="secondary"
          onClick={loadRequirements}
          disabled={loading}
        >
          Refresh
        </Button>
      </div>

      {/* Toolbar */}
      <div className="employee-requirements-toolbar">
        <SearchBox
          value={search}
          onChange={setSearch}
          placeholder="Search requirements..."
        />

        <Select
          value={systemType}
          onChange={(event) =>
            setSystemType(
              event.target.value
            )
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

      {/* Error */}
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

      {/* Main Card */}
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

            <h3>
              No requirements found
            </h3>

            <p>
              {search || systemType
                ? "Try changing your search or filter."
                : "No solar requirements are available for your assigned leads yet."}
            </p>
          </div>
        ) : (
          <>
            <div className="employee-requirements-table-wrapper">
              <table className="employee-requirements-table">
                <thead>
                  <tr>
                    <th>
                      Customer
                    </th>

                    <th>
                      System Type
                    </th>

                    <th>
                      Required
                    </th>

                    <th>
                      Location
                    </th>

                    <th>
                      Survey
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
                  {paginatedRequirements.map(
                    (
                      requirement,
                      index
                    ) => {
                      const requirementId =
                        requirement?._id ||
                        requirement?.id ||
                        `requirement-${index}`;

                      const status =
                        getStatus(
                          requirement
                        );

                      return (
                        <tr
                          key={
                            requirementId
                          }
                        >
                          {/* Customer */}
                          <td>
                            <div className="employee-requirement-name">
                              {getCustomerName(
                                requirement
                              )}
                            </div>

                            {(
                              requirement?.customer?.mobile ||
                              requirement?.lead?.mobile ||
                              requirement?.mobile ||
                              requirement?.phone
                            ) && (
                              <div className="employee-requirement-subtext">
                                {requirement?.customer?.mobile ||
                                  requirement?.lead?.mobile ||
                                  requirement?.mobile ||
                                  requirement?.phone}
                              </div>
                            )}
                          </td>

                          {/* System Type */}
                          <td>
                            {getSystemType(
                              requirement
                            )}
                          </td>

                          {/* Capacity */}
                          <td>
                            {getCapacity(
                              requirement
                            )}
                          </td>

                          {/* Location */}
                          <td>
                            {requirement?.city ||
                              requirement?.location ||
                              requirement?.siteAddress ||
                              "—"}
                          </td>

                          {/* Survey */}
                          <td>
                            <Badge
                              variant={
                                requirement?.siteSurveyCompleted
                                  ? "success"
                                  : requirement?.siteSurveyRequired
                                  ? "warning"
                                  : "default"
                              }
                            >
                              {requirement?.siteSurveyCompleted
                                ? "Completed"
                                : requirement?.siteSurveyRequired
                                ? "Required"
                                : "Not Required"}
                            </Badge>
                          </td>

                          {/* Created */}
                          <td>
                            {formatDate(
                              requirement?.createdAt ||
                                requirement?.createdDate
                            )}
                          </td>

                          {/* Action */}
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

            {/* Footer */}
            <div className="employee-requirements-footer">
              <span>
                Showing{" "}
                {filteredRequirements.length ===
                0
                  ? 0
                  : (page - 1) *
                      limit +
                    1}{" "}
                -{" "}
                {Math.min(
                  page * limit,
                  filteredRequirements.length
                )}{" "}
                of{" "}
                {
                  filteredRequirements.length
                }{" "}
                requirements
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

export default EmployeeSolarRequirementsPage;