"use client";

import React, { useEffect, useMemo, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import SearchBox from "@/components/common/SearchBox";
import Pagination from "@/components/common/Pagination";
import Loader from "@/components/common/Loader";
import { useAuth } from "@/hooks/useAuth";
import solarRequirementService from "@/services/solarRequirement.service";

const ManagerSolarRequirementsPage = () => {
  const { user, logout, loading: authLoading } = useAuth();

  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [selectedRequirement, setSelectedRequirement] =
    useState(null);

  const itemsPerPage = 10;

  const loadRequirements = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await solarRequirementService.getSolarRequirements();

      const data =
        response?.data?.requirements ||
        response?.requirements ||
        response?.data?.items ||
        response?.items ||
        response?.data ||
        [];

      setRequirements(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Solar requirements error:", err);

      setError(
        err?.message ||
          err?.response?.data?.message ||
          "Unable to load solar requirements."
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

  const handleLogout = async () => {
    await logout();
  };

  const getCustomerName = (item) =>
    item?.customer?.name ||
    item?.customerName ||
    item?.lead?.name ||
    item?.lead?.customerName ||
    "Unnamed Customer";

  const getLeadNumber = (item) =>
    item?.lead?.leadNumber ||
    item?.lead?.leadNo ||
    item?.leadNumber ||
    "—";

  const getStatus = (item) =>
    item?.status ||
    item?.requirementStatus ||
    "PENDING";

  const getCapacity = (item) =>
    item?.requiredKW ||
    item?.requiredKw ||
    item?.systemSize ||
    item?.capacity ||
    "—";

  const getBadgeVariant = (value) => {
    const status = String(value).toLowerCase();

    if (
      [
        "approved",
        "completed",
        "qualified",
        "survey_completed",
      ].includes(status)
    ) {
      return "success";
    }

    if (
      [
        "rejected",
        "cancelled",
        "lost",
      ].includes(status)
    ) {
      return "danger";
    }

    if (
      [
        "in_progress",
        "site_survey",
        "survey_pending",
      ].includes(status)
    ) {
      return "warning";
    }

    return "default";
  };

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const filteredRequirements = useMemo(() => {
    const query = search.trim().toLowerCase();

    return requirements.filter((item) => {
      const status = String(getStatus(item)).toUpperCase();

      const matchesStatus =
        statusFilter === "ALL" ||
        status === statusFilter;

      if (!query) return matchesStatus;

      const searchableText = [
        getCustomerName(item),
        getLeadNumber(item),
        item?.phone,
        item?.mobile,
        item?.siteAddress,
        item?.location,
        item?.roofType,
        item?.systemType,
        item?.requiredKW,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        matchesStatus &&
        searchableText.includes(query)
      );
    });
  }, [requirements, search, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredRequirements.length / itemsPerPage
    )
  );

  const currentPage = Math.min(page, totalPages);

  const paginatedRequirements =
    filteredRequirements.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const handlePageChange = (nextPage) => {
    setPage(nextPage);
  };

  if (authLoading || loading) {
    return (
      <div className="manager-requirements-loading">
        <Loader />
      </div>
    );
  }

  return (
    <MainLayout
      user={user}
      onLogout={handleLogout}
      notificationCount={0}
    >
      <div className="manager-requirements-page">
        <div className="manager-requirements-header">
          <div>
            <span className="manager-requirements-eyebrow">
              Manager Portal
            </span>

            <h1>Solar Requirements</h1>

            <p>
              Review customer solar requirements and
              site information.
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

        {error && (
          <div className="manager-requirements-error">
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

        <div className="manager-requirements-toolbar">
          <SearchBox
            value={search}
            onChange={(value) => setSearch(value)}
            placeholder="Search customer, lead, location..."
          />

          <select
            className="manager-requirements-status-filter"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">
              In Progress
            </option>
            <option value="SITE_SURVEY">
              Site Survey
            </option>
            <option value="APPROVED">Approved</option>
            <option value="COMPLETED">
              Completed
            </option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        <div className="manager-requirements-summary">
          <div>
            <span>Total Requirements</span>
            <strong>
              {filteredRequirements.length}
            </strong>
          </div>

          <div>
            <span>Showing</span>
            <strong>
              {paginatedRequirements.length}
            </strong>
          </div>
        </div>

        <div className="manager-requirements-card">
          <div className="manager-requirements-table-wrapper">
            <table className="manager-requirements-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Lead No.</th>
                  <th>Required kW</th>
                  <th>Roof Type</th>
                  <th>System Type</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {paginatedRequirements.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="manager-requirements-empty"
                    >
                      <div>
                        <span>⌁</span>
                        <strong>
                          No requirements found
                        </strong>
                        <p>
                          Try changing your search or
                          filter.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedRequirements.map(
                    (item, index) => (
                      <tr
                        key={
                          item?._id ||
                          item?.id ||
                          index
                        }
                      >
                        <td>
                          <div className="manager-requirement-customer">
                            <div className="manager-requirement-avatar">
                              {getCustomerName(
                                item
                              )
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>
                              <strong>
                                {getCustomerName(
                                  item
                                )}
                              </strong>

                              <span>
                                {item?.phone ||
                                  item?.mobile ||
                                  "No phone"}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className="manager-requirement-number">
                            {getLeadNumber(item)}
                          </span>
                        </td>

                        <td>
                          <strong>
                            {getCapacity(item)}
                            {getCapacity(item) !== "—"
                              ? " kW"
                              : ""}
                          </strong>
                        </td>

                        <td>
                          {item?.roofType || "—"}
                        </td>

                        <td>
                          {item?.systemType || "—"}
                        </td>

                        <td>
                          <Badge
                            variant={getBadgeVariant(
                              getStatus(item)
                            )}
                          >
                            {String(
                              getStatus(item)
                            ).replaceAll(
                              "_",
                              " "
                            )}
                          </Badge>
                        </td>

                        <td>
                          {formatDate(
                            item?.createdAt
                          )}
                        </td>

                        <td>
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() =>
                              setSelectedRequirement(
                                item
                              )
                            }
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>

          {filteredRequirements.length > 0 && (
            <div className="manager-requirements-pagination">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>

        {selectedRequirement && (
          <div
            className="manager-requirement-modal-overlay"
            onClick={() =>
              setSelectedRequirement(null)
            }
          >
            <div
              className="manager-requirement-modal"
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              <div className="manager-requirement-modal-header">
                <div>
                  <span>
                    Requirement Details
                  </span>

                  <h2>
                    {getCustomerName(
                      selectedRequirement
                    )}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedRequirement(null)
                  }
                >
                  ×
                </button>
              </div>

              <div className="manager-requirement-modal-body">
                <div className="manager-requirement-detail-grid">
                  <div>
                    <span>Lead Number</span>
                    <strong>
                      {getLeadNumber(
                        selectedRequirement
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Status</span>
                    <Badge
                      variant={getBadgeVariant(
                        getStatus(
                          selectedRequirement
                        )
                      )}
                    >
                      {String(
                        getStatus(
                          selectedRequirement
                        )
                      ).replaceAll("_", " ")}
                    </Badge>
                  </div>

                  <div>
                    <span>Required kW</span>
                    <strong>
                      {getCapacity(
                        selectedRequirement
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Monthly Bill</span>
                    <strong>
                      {selectedRequirement?.monthlyBill
                        ? `₹${selectedRequirement.monthlyBill}`
                        : "—"}
                    </strong>
                  </div>

                  <div>
                    <span>Units</span>
                    <strong>
                      {selectedRequirement?.units ||
                        "—"}
                    </strong>
                  </div>

                  <div>
                    <span>Roof Type</span>
                    <strong>
                      {selectedRequirement?.roofType ||
                        "—"}
                    </strong>
                  </div>

                  <div>
                    <span>Roof Area</span>
                    <strong>
                      {selectedRequirement?.roofArea ||
                        "—"}
                    </strong>
                  </div>

                  <div>
                    <span>System Type</span>
                    <strong>
                      {selectedRequirement?.systemType ||
                        "—"}
                    </strong>
                  </div>

                  <div>
                    <span>Battery Requirement</span>
                    <strong>
                      {selectedRequirement?.batteryRequirement ||
                        selectedRequirement?.batteryRequired
                        ? "Required"
                        : "Not Required"}
                    </strong>
                  </div>

                  <div>
                    <span>Site Survey</span>
                    <strong>
                      {selectedRequirement?.siteSurvey
                        ? "Completed"
                        : "Pending"}
                    </strong>
                  </div>
                </div>

                <div className="manager-requirement-detail-block">
                  <span>Site Address</span>

                  <p>
                    {selectedRequirement?.siteAddress ||
                      selectedRequirement?.address ||
                      "No site address available."}
                  </p>
                </div>

                <div className="manager-requirement-detail-block">
                  <span>Location</span>

                  <p>
                    {selectedRequirement?.location ||
                      "No location available."}
                  </p>
                </div>

                <div className="manager-requirement-detail-block">
                  <span>Notes</span>

                  <p>
                    {selectedRequirement?.notes ||
                      selectedRequirement?.remarks ||
                      "No notes available."}
                  </p>
                </div>
              </div>

              <div className="manager-requirement-modal-footer">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    setSelectedRequirement(null)
                  }
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ManagerSolarRequirementsPage;