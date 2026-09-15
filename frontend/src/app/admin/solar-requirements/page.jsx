"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import MainLayout from "@/components/layout/MainLayout";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import SearchBox from "@/components/common/SearchBox";
import Pagination from "@/components/common/Pagination";
import Loader from "@/components/common/Loader";
import Modal from "@/components/common/Modal";

import { useAuth } from "@/hooks/useAuth";
import solarRequirementService from "@/services/solarRequirement.service";

const SolarRequirementsPage = () => {
  const router = useRouter();
  const { user, logout, loading: authLoading } = useAuth();

  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [selectedRequirement, setSelectedRequirement] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const loadRequirements = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response =
        await solarRequirementService.getSolarRequirements();

      const data = response?.data || response;

      setRequirements(
        Array.isArray(data)
          ? data
          : data?.requirements ||
              data?.solarRequirements ||
              data?.items ||
              []
      );
    } catch (err) {
      console.error("Failed to load solar requirements:", err);

      setError(
        err?.message ||
          err?.response?.data?.message ||
          "Unable to load solar requirements."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadRequirements();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, typeFilter]);

  const handleLogout = async () => {
    await logout();
  };

  const handleSearch = (value) => {
    console.log("Admin global search:", value);
  };

  const getValue = (value, fallback = "—") => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return fallback;
    }

    return value;
  };

  const getName = (person) => {
    if (!person) return "—";

    if (typeof person === "string") {
      return person;
    }

    return (
      person.name ||
      person.fullName ||
      `${person.firstName || ""} ${
        person.lastName || ""
      }`.trim() ||
      person.email ||
      "—"
    );
  };

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatNumber = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "—";
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
      return value;
    }

    return number.toLocaleString("en-IN");
  };

  const getStatusVariant = (status) => {
    const value = String(status || "").toLowerCase();

    if (
      value.includes("complete") ||
      value.includes("approved") ||
      value.includes("converted") ||
      value.includes("active")
    ) {
      return "success";
    }

    if (
      value.includes("reject") ||
      value.includes("cancel")
    ) {
      return "danger";
    }

    if (
      value.includes("pending") ||
      value.includes("draft") ||
      value.includes("progress")
    ) {
      return "warning";
    }

    return "info";
  };

  const getStatusText = (status) => {
    if (!status) return "PENDING";

    return String(status)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const getRequirementType = (item) => {
    return (
      item?.requirementType ||
      item?.systemType ||
      item?.solarType ||
      item?.type ||
      "—"
    );
  };

  const getCapacity = (item) => {
    return (
      item?.systemSize ||
      item?.capacity ||
      item?.requiredCapacity ||
      item?.plantCapacity ||
      null
    );
  };

  const filteredRequirements = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return requirements.filter((item) => {
      const customerName = getName(
        item?.customer ||
          item?.customerId ||
          item?.lead ||
          item?.leadId
      );

      const searchableText = [
        item?.requirementNumber,
        item?.requirementId,
        item?._id,
        customerName,
        item?.customerName,
        item?.name,
        item?.phone,
        item?.mobile,
        item?.email,
        item?.city,
        item?.address,
        item?.status,
        item?.systemType,
        item?.requirementType,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !normalizedSearch ||
        searchableText.includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "ALL" ||
        String(item?.status || "")
          .toUpperCase()
          .replace(/ /g, "_") === statusFilter;

      const type = String(
        getRequirementType(item)
      )
        .toUpperCase()
        .replace(/ /g, "_");

      const matchesType =
        typeFilter === "ALL" ||
        type === typeFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesType
      );
    });
  }, [
    requirements,
    search,
    statusFilter,
    typeFilter,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredRequirements.length / itemsPerPage
    )
  );

  const paginatedRequirements =
    filteredRequirements.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );

  const statusOptions = useMemo(() => {
    const statuses = requirements
      .map((item) =>
        item?.status
          ? String(item.status)
              .toUpperCase()
              .replace(/ /g, "_")
          : null
      )
      .filter(Boolean);

    return [...new Set(statuses)];
  }, [requirements]);

  const typeOptions = useMemo(() => {
    const types = requirements
      .map((item) => {
        const type = getRequirementType(item);

        if (!type || type === "—") return null;

        return String(type)
          .toUpperCase()
          .replace(/ /g, "_");
      })
      .filter(Boolean);

    return [...new Set(types)];
  }, [requirements]);

  const stats = useMemo(() => {
    const total = requirements.length;

    const pending = requirements.filter((item) =>
      ["PENDING", "NEW", "DRAFT"].includes(
        String(item?.status || "").toUpperCase()
      )
    ).length;

    const approved = requirements.filter((item) =>
      ["APPROVED", "COMPLETED", "ACTIVE"].includes(
        String(item?.status || "").toUpperCase()
      )
    ).length;

    const inProgress = requirements.filter((item) =>
      ["IN_PROGRESS", "PROCESSING"].includes(
        String(item?.status || "").toUpperCase()
      )
    ).length;

    return {
      total,
      pending,
      approved,
      inProgress,
    };
  }, [requirements]);

  const openDetails = (requirement) => {
    setSelectedRequirement(requirement);
    setShowDetails(true);
  };

  const closeDetails = () => {
    setShowDetails(false);
    setSelectedRequirement(null);
  };

  const handleCreate = () => {
    router.push("/admin/solar-requirements/create");
  };

  if (authLoading || loading) {
    return (
      <MainLayout
        user={user}
        onLogout={handleLogout}
        onSearch={handleSearch}
        notificationCount={0}
      >
        <div className="admin-requirements-loading">
          <Loader />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      user={user}
      onLogout={handleLogout}
      onSearch={handleSearch}
      notificationCount={0}
    >
      <div className="admin-requirements-page">
        {/* Page Header */}
        <div className="admin-requirements-header">
          <div>
            <span className="admin-page-eyebrow">
              Solar Management
            </span>

            <h1>Solar Requirements</h1>

            <p>
              Manage customer solar requirements and
              system needs.
            </p>
          </div>

          <div className="admin-requirements-header-actions">
            <Button
              variant="secondary"
              onClick={() => loadRequirements(true)}
              disabled={refreshing}
            >
              {refreshing ? "Refreshing..." : "↻ Refresh"}
            </Button>

            <Button onClick={handleCreate}>
              + Create Requirement
            </Button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="admin-requirements-error">
            <div>
              <strong>Something went wrong</strong>
              <p>{error}</p>
            </div>

            <Button
              variant="secondary"
              onClick={() => loadRequirements(true)}
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Stats */}
        <div className="admin-requirements-stats">
          <div className="admin-requirement-stat-card">
            <div className="admin-stat-icon total">
              ☀
            </div>

            <div>
              <span>Total Requirements</span>
              <strong>
                {formatNumber(stats.total)}
              </strong>
            </div>
          </div>

          <div className="admin-requirement-stat-card">
            <div className="admin-stat-icon pending">
              ◷
            </div>

            <div>
              <span>Pending</span>
              <strong>
                {formatNumber(stats.pending)}
              </strong>
            </div>
          </div>

          <div className="admin-requirement-stat-card">
            <div className="admin-stat-icon progress">
              ↻
            </div>

            <div>
              <span>In Progress</span>
              <strong>
                {formatNumber(stats.inProgress)}
              </strong>
            </div>
          </div>

          <div className="admin-requirement-stat-card">
            <div className="admin-stat-icon approved">
              ✓
            </div>

            <div>
              <span>Approved / Completed</span>
              <strong>
                {formatNumber(stats.approved)}
              </strong>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="admin-requirements-toolbar">
          <div className="admin-requirements-search">
            <SearchBox
              value={search}
              onChange={setSearch}
              placeholder="Search customer, requirement ID, city..."
            />
          </div>

          <div className="admin-requirements-filters">
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              className="admin-filter-select"
            >
              <option value="ALL">
                All Status
              </option>

              {statusOptions.map((status) => (
                <option
                  key={status}
                  value={status}
                >
                  {getStatusText(status)}
                </option>
              ))}
            </select>

            <select
              value={typeFilter}
              onChange={(event) =>
                setTypeFilter(event.target.value)
              }
              className="admin-filter-select"
            >
              <option value="ALL">
                All Types
              </option>

              {typeOptions.map((type) => (
                <option
                  key={type}
                  value={type}
                >
                  {getStatusText(type)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="admin-requirements-card">
          <div className="admin-requirements-card-header">
            <div>
              <h2>Requirements List</h2>

              <p>
                Showing{" "}
                <strong>
                  {filteredRequirements.length}
                </strong>{" "}
                requirement
                {filteredRequirements.length !== 1
                  ? "s"
                  : ""}
              </p>
            </div>
          </div>

          {paginatedRequirements.length === 0 ? (
            <div className="admin-requirements-empty">
              <div className="admin-empty-icon">
                ☀
              </div>

              <h3>No requirements found</h3>

              <p>
                Try changing your filters or create a
                new solar requirement.
              </p>

              <Button onClick={handleCreate}>
                + Create Requirement
              </Button>
            </div>
          ) : (
            <div className="admin-requirements-table-wrapper">
              <table className="admin-requirements-table">
                <thead>
                  <tr>
                    <th>Requirement</th>
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
                    (item, index) => {
                      const requirementId =
                        item?.requirementNumber ||
                        item?.requirementId ||
                        item?._id ||
                        `REQ-${index + 1}`;

                      const customer =
                        item?.customer ||
                        item?.customerId ||
                        item?.lead;

                      const customerName =
                        item?.customerName ||
                        item?.name ||
                        getName(customer);

                      const systemType =
                        getRequirementType(item);

                      const capacity =
                        getCapacity(item);

                      const location =
                        item?.city ||
                        item?.location ||
                        item?.address ||
                        "—";

                      const status =
                        item?.status || "PENDING";

                      return (
                        <tr
                          key={
                            item?._id ||
                            item?.id ||
                            index
                          }
                        >
                          <td>
                            <div className="admin-requirement-id">
                              <span className="admin-mini-icon">
                                ☀
                              </span>

                              <div>
                                <strong>
                                  {requirementId}
                                </strong>

                                <small>
                                  {item?.createdAt
                                    ? formatDate(
                                        item.createdAt
                                      )
                                    : "Solar Requirement"}
                                </small>
                              </div>
                            </div>
                          </td>

                          <td>
                            <div className="admin-customer-cell">
                              <strong>
                                {getValue(
                                  customerName
                                )}
                              </strong>

                              {(item?.phone ||
                                item?.mobile) && (
                                <small>
                                  {item.phone ||
                                    item.mobile}
                                </small>
                              )}
                            </div>
                          </td>

                          <td>
                            <span className="admin-type-text">
                              {getValue(systemType)}
                            </span>
                          </td>

                          <td>
                            <strong className="admin-capacity">
                              {capacity !== null &&
                              capacity !== undefined
                                ? `${formatNumber(
                                    capacity
                                  )} kW`
                                : "—"}
                            </strong>
                          </td>

                          <td>
                            <span className="admin-location-text">
                              {getValue(location)}
                            </span>
                          </td>

                          <td>
                            <Badge
                              variant={getStatusVariant(
                                status
                              )}
                            >
                              {getStatusText(status)}
                            </Badge>
                          </td>

                          <td>
                            <span className="admin-date-text">
                              {formatDate(
                                item?.createdAt
                              )}
                            </span>
                          </td>

                          <td>
                            <button
                              type="button"
                              className="admin-view-button"
                              onClick={() =>
                                openDetails(item)
                              }
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          )}

          {filteredRequirements.length >
            itemsPerPage && (
            <div className="admin-requirements-pagination">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>

        {/* Details Modal */}
        <Modal
          isOpen={showDetails}
          onClose={closeDetails}
          title="Solar Requirement Details"
        >
          {selectedRequirement && (
            <div className="admin-requirement-modal">
              <div className="admin-modal-summary">
                <div className="admin-modal-solar-icon">
                  ☀
                </div>

                <div>
                  <h3>
                    {getValue(
                      selectedRequirement?.requirementNumber ||
                        selectedRequirement?.requirementId ||
                        selectedRequirement?._id
                    )}
                  </h3>

                  <Badge
                    variant={getStatusVariant(
                      selectedRequirement?.status
                    )}
                  >
                    {getStatusText(
                      selectedRequirement?.status
                    )}
                  </Badge>
                </div>
              </div>

              <div className="admin-modal-detail-grid">
                <div>
                  <span>Customer</span>
                  <strong>
                    {getValue(
                      selectedRequirement?.customerName ||
                        selectedRequirement?.name ||
                        getName(
                          selectedRequirement?.customer ||
                            selectedRequirement?.customerId ||
                            selectedRequirement?.lead
                        )
                    )}
                  </strong>
                </div>

                <div>
                  <span>Phone</span>
                  <strong>
                    {getValue(
                      selectedRequirement?.phone ||
                        selectedRequirement?.mobile
                    )}
                  </strong>
                </div>

                <div>
                  <span>Email</span>
                  <strong>
                    {getValue(
                      selectedRequirement?.email
                    )}
                  </strong>
                </div>

                <div>
                  <span>System Type</span>
                  <strong>
                    {getValue(
                      getRequirementType(
                        selectedRequirement
                      )
                    )}
                  </strong>
                </div>

                <div>
                  <span>Capacity</span>
                  <strong>
                    {getCapacity(
                      selectedRequirement
                    ) !== null
                      ? `${formatNumber(
                          getCapacity(
                            selectedRequirement
                          )
                        )} kW`
                      : "—"}
                  </strong>
                </div>

                <div>
                  <span>Location</span>
                  <strong>
                    {getValue(
                      selectedRequirement?.city ||
                        selectedRequirement?.location
                    )}
                  </strong>
                </div>

                <div className="admin-modal-full">
                  <span>Address</span>
                  <strong>
                    {getValue(
                      selectedRequirement?.address
                    )}
                  </strong>
                </div>

                <div className="admin-modal-full">
                  <span>Requirement Details</span>
                  <strong>
                    {getValue(
                      selectedRequirement?.description ||
                        selectedRequirement?.requirementDetails ||
                        selectedRequirement?.notes
                    )}
                  </strong>
                </div>

                <div>
                  <span>Created At</span>
                  <strong>
                    {formatDate(
                      selectedRequirement?.createdAt
                    )}
                  </strong>
                </div>

                <div>
                  <span>Updated At</span>
                  <strong>
                    {formatDate(
                      selectedRequirement?.updatedAt
                    )}
                  </strong>
                </div>
              </div>

              <div className="admin-modal-actions">
                <Button
                  variant="secondary"
                  onClick={closeDetails}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </MainLayout>
  );
};

export default SolarRequirementsPage;