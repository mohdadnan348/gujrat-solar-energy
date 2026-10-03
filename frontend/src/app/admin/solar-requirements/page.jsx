"use client";

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import SearchBox from "@/components/common/SearchBox";
import Pagination from "@/components/common/Pagination";
import Loader from "@/components/common/Loader";

import solarRequirementService from "@/services/solarRequirement.service";

import "./requirements.css";

const SolarRequirementsPage = () => {
  const router = useRouter();

  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  /* =========================================================
     LOAD REQUIREMENTS
  ========================================================= */

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

      const list = Array.isArray(data)
        ? data
        : data?.requirements ||
          data?.solarRequirements ||
          data?.items ||
          [];

      setRequirements(
        Array.isArray(list) ? list : []
      );
    } catch (err) {
      console.error(
        "Failed to load solar requirements:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
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

  /* =========================================================
     HELPERS
  ========================================================= */

  const safeText = (
    value,
    fallback = "—"
  ) => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return fallback;
    }

    if (typeof value === "object") {
      return (
        value?.name ||
        value?.fullName ||
        value?.customerName ||
        value?.city ||
        value?.label ||
        value?.email ||
        fallback
      );
    }

    return String(value);
  };

  const getName = (person) => {
    if (!person) return "—";

    if (typeof person === "string") {
      return person;
    }

    const fullName =
      `${person?.firstName || ""} ${
        person?.lastName || ""
      }`.trim();

    return (
      person?.name ||
      person?.fullName ||
      person?.customerName ||
      fullName ||
      person?.email ||
      "—"
    );
  };

  const getCustomer = (item) => {
    return (
      item?.customer ||
      item?.customerId ||
      item?.lead ||
      item?.leadId ||
      null
    );
  };

  const getCustomerName = (item) => {
    const customer = getCustomer(item);

    return (
      item?.customerName ||
      item?.customer?.name ||
      item?.customer?.fullName ||
      item?.lead?.customerName ||
      item?.lead?.name ||
      getName(customer)
    );
  };

  const getCustomerPhone = (item) => {
    return (
      item?.phone ||
      item?.mobile ||
      item?.customer?.phone ||
      item?.customer?.mobile ||
      item?.lead?.phone ||
      item?.lead?.mobile ||
      ""
    );
  };

  const getCustomerEmail = (item) => {
    return (
      item?.email ||
      item?.customer?.email ||
      item?.lead?.email ||
      ""
    );
  };

  const getRequirementId = (
    item,
    index = 0
  ) => {
    return (
      item?.requirementNumber ||
      item?.requirementId ||
      item?._id ||
      item?.id ||
      `REQ-${String(index + 1).padStart(3, "0")}`
    );
  };

  /* =========================================================
     CAPACITY
  ========================================================= */

  const getCapacity = (item) => {
    const value =
      item?.requiredKw ??
      item?.requiredKW ??
      item?.kw ??
      item?.systemSize ??
      item?.capacity ??
      item?.requiredCapacity ??
      item?.plantCapacity;

    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return null;
    }

    const numericValue = Number(value);

    return Number.isNaN(numericValue)
      ? value
      : numericValue;
  };

  /* =========================================================
     SYSTEM TYPE
  ========================================================= */

  const getSystemType = (item) => {
    return (
      item?.systemType ||
      item?.requirementType ||
      item?.solarType ||
      item?.type ||
      "—"
    );
  };

  const getConnectionType = (item) => {
    return (
      item?.connectionType ||
      item?.connection ||
      "—"
    );
  };

  /* =========================================================
     LOCATION
  ========================================================= */

  const getLocation = (item) => {
    const location = item?.location;

    if (
      typeof location === "object" &&
      location
    ) {
      return (
        location?.city ||
        location?.name ||
        location?.address ||
        "—"
      );
    }

    return (
      item?.city ||
      location ||
      item?.siteAddress ||
      item?.address ||
      "—"
    );
  };

  /* =========================================================
     STATUS
  ========================================================= */

  const getStatus = (item) => {
    return item?.status || "PENDING";
  };

  const normalizeStatus = (status) => {
    return String(status || "")
      .trim()
      .toUpperCase()
      .replace(/[\s-]+/g, "_");
  };

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return safeText(date);
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
      return safeText(value);
    }

    return number.toLocaleString("en-IN");
  };

  const getStatusText = (status) => {
    if (!status) {
      return "Pending";
    }

    return String(status)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
  };

  const getStatusVariant = (status) => {
    const value = normalizeStatus(status);

    if (
      value.includes("COMPLETE") ||
      value.includes("APPROVED") ||
      value.includes("CONVERTED") ||
      value.includes("ACTIVE")
    ) {
      return "success";
    }

    if (
      value.includes("REJECT") ||
      value.includes("CANCEL")
    ) {
      return "danger";
    }

    if (
      value.includes("PENDING") ||
      value.includes("DRAFT") ||
      value.includes("PROGRESS") ||
      value.includes("NEW")
    ) {
      return "warning";
    }

    return "info";
  };

  /* =========================================================
     FILTERS
  ========================================================= */

  const filteredRequirements = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return requirements.filter((item) => {
      const customerName =
        getCustomerName(item);

      const searchableText = [
        getRequirementId(item),
        customerName,
        getCustomerPhone(item),
        getCustomerEmail(item),
        item?.city,
        item?.location,
        item?.siteAddress,
        item?.address,
        item?.status,
        item?.systemType,
        item?.requirementType,
        item?.connectionType,
        getCapacity(item),
      ]
        .filter(
          (value) =>
            value !== null &&
            value !== undefined &&
            value !== ""
        )
        .map((value) =>
          typeof value === "object"
            ? JSON.stringify(value)
            : String(value)
        )
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !normalizedSearch ||
        searchableText.includes(
          normalizedSearch
        );

      const normalizedStatus =
        normalizeStatus(item?.status);

      const matchesStatus =
        statusFilter === "ALL" ||
        normalizedStatus === statusFilter;

      const normalizedType = String(
        getSystemType(item)
      )
        .toUpperCase()
        .replace(/[\s-]+/g, "_");

      const matchesType =
        typeFilter === "ALL" ||
        normalizedType === typeFilter;

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

  /* =========================================================
     STATUS OPTIONS
  ========================================================= */

  const statusOptions = useMemo(() => {
    const statuses = requirements
      .map((item) => {
        const status =
          item?.status || "PENDING";

        return normalizeStatus(status);
      })
      .filter(Boolean);

    return [...new Set(statuses)];
  }, [requirements]);

  /* =========================================================
     TYPE OPTIONS
  ========================================================= */

  const typeOptions = useMemo(() => {
    const types = requirements
      .map((item) => {
        const type =
          getSystemType(item);

        if (
          !type ||
          type === "—"
        ) {
          return null;
        }

        return String(type)
          .toUpperCase()
          .replace(/[\s-]+/g, "_");
      })
      .filter(Boolean);

    return [...new Set(types)];
  }, [requirements]);

  /* =========================================================
     STATS
  ========================================================= */

  const stats = useMemo(() => {
    const total =
      requirements.length;

    const normalizedStatuses =
      requirements.map((item) =>
        normalizeStatus(
          getStatus(item)
        )
      );

    const pending =
      normalizedStatuses.filter(
        (status) =>
          [
            "PENDING",
            "NEW",
            "DRAFT",
          ].includes(status)
      ).length;

    const inProgress =
      normalizedStatuses.filter(
        (status) =>
          [
            "IN_PROGRESS",
            "PROCESSING",
          ].includes(status)
      ).length;

    const approved =
      normalizedStatuses.filter(
        (status) =>
          [
            "APPROVED",
            "COMPLETED",
            "ACTIVE",
            "CONVERTED",
          ].includes(status)
      ).length;

    return {
      total,
      pending,
      inProgress,
      approved,
    };
  }, [requirements]);

  /* =========================================================
     PAGINATION
  ========================================================= */

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredRequirements.length /
        itemsPerPage
    )
  );

  const paginatedRequirements =
    filteredRequirements.slice(
      (currentPage - 1) *
        itemsPerPage,
      currentPage *
        itemsPerPage
    );

  /* =========================================================
     ACTIONS
  ========================================================= */

  const handleCreate = () => {
    router.push(
      "/admin/solar-requirements/create"
    );
  };

  /**
   * IMPORTANT:
   * View button now opens the actual
   * requirement details page.
   */
  const handleView = (item) => {
    const id =
      item?._id ||
      item?.id ||
      item?.requirementId;

    if (!id) {
      setError(
        "Requirement ID is missing."
      );
      return;
    }

    router.push(
      `/admin/solar-requirements/${id}`
    );
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="admin-requirements-loading">
        <Loader />
      </div>
    );
  }

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="admin-requirements-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="admin-requirements-header">

        <div className="admin-requirements-heading">

          <span className="admin-page-eyebrow">
            Solar Management
          </span>

          <h1>
            Solar Requirements
          </h1>

          <p>
            Manage customer solar
            requirements, capacity and
            system needs.
          </p>

        </div>

        <div className="admin-requirements-header-actions">

          <Button
            variant="secondary"
            onClick={() =>
              loadRequirements(true)
            }
            disabled={refreshing}
          >
            {refreshing
              ? "Refreshing..."
              : "↻ Refresh"}
          </Button>

          <Button
            onClick={handleCreate}
          >
            + Create Requirement
          </Button>

        </div>

      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="admin-requirements-error">

          <div>

            <strong>
              Something went wrong
            </strong>

            <p>
              {error}
            </p>

          </div>

          <Button
            variant="secondary"
            onClick={() =>
              loadRequirements(true)
            }
          >
            Try Again
          </Button>

        </div>
      )}

      {/* =====================================================
          STATS
      ===================================================== */}

      <div className="admin-requirements-stats">

        <div className="admin-requirement-stat-card">

          <div className="admin-stat-icon total">
            ☀
          </div>

          <div>
            <span>
              Total Requirements
            </span>

            <strong>
              {stats.total}
            </strong>
          </div>

        </div>

        <div className="admin-requirement-stat-card">

          <div className="admin-stat-icon pending">
            ◷
          </div>

          <div>
            <span>
              Pending
            </span>

            <strong>
              {stats.pending}
            </strong>
          </div>

        </div>

        <div className="admin-requirement-stat-card">

          <div className="admin-stat-icon progress">
            ↻
          </div>

          <div>
            <span>
              In Progress
            </span>

            <strong>
              {stats.inProgress}
            </strong>
          </div>

        </div>

        <div className="admin-requirement-stat-card">

          <div className="admin-stat-icon approved">
            ✓
          </div>

          <div>
            <span>
              Approved / Completed
            </span>

            <strong>
              {stats.approved}
            </strong>
          </div>

        </div>

      </div>

      {/* =====================================================
          FILTERS
      ===================================================== */}

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
              setStatusFilter(
                event.target.value
              )
            }
            className="admin-filter-select"
          >

            <option value="ALL">
              All Status
            </option>

            {statusOptions.map(
              (status) => (
                <option
                  key={status}
                  value={status}
                >
                  {getStatusText(
                    status
                  )}
                </option>
              )
            )}

          </select>

          <select
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(
                event.target.value
              )
            }
            className="admin-filter-select"
          >

            <option value="ALL">
              All Types
            </option>

            {typeOptions.map(
              (type) => (
                <option
                  key={type}
                  value={type}
                >
                  {getStatusText(
                    type
                  )}
                </option>
              )
            )}

          </select>

        </div>

      </div>

      {/* =====================================================
          TABLE
      ===================================================== */}

      <div className="admin-requirements-card">

        <div className="admin-requirements-card-header">

          <div>

            <h2>
              Requirements List
            </h2>

            <p>
              Showing{" "}
              <strong>
                {filteredRequirements.length}
              </strong>{" "}
              requirement
              {filteredRequirements.length !==
              1
                ? "s"
                : ""}
            </p>

          </div>

          <div className="admin-results-count">
            {filteredRequirements.length} Results
          </div>

        </div>

        {paginatedRequirements.length ===
        0 ? (
          <div className="admin-requirements-empty">

            <div className="admin-empty-icon">
              ☀
            </div>

            <h3>
              No requirements found
            </h3>

            <p>
              No solar requirement
              matches your current
              search or filters.
            </p>

            <Button
              onClick={handleCreate}
            >
              + Create Requirement
            </Button>

          </div>
        ) : (
          <div className="admin-requirements-table-wrapper">

            <table className="admin-requirements-table">

              <thead>
                <tr>
                  <th>
                    Requirement
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
                    Location
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

                {paginatedRequirements.map(
                  (item, index) => {

                    const requirementId =
                      getRequirementId(
                        item,
                        index
                      );

                    const customerName =
                      getCustomerName(
                        item
                      );

                    const customerPhone =
                      getCustomerPhone(
                        item
                      );

                    const systemType =
                      getSystemType(
                        item
                      );

                    const capacity =
                      getCapacity(
                        item
                      );

                    const location =
                      getLocation(
                        item
                      );

                    const status =
                      getStatus(item);

                    return (
                      <tr
                        key={
                          item?._id ||
                          item?.id ||
                          requirementId
                        }
                      >

                        {/* REQUIREMENT */}

                        <td>

                          <div className="admin-requirement-id">

                            <span className="admin-mini-icon">
                              ☀
                            </span>

                            <div>

                              <strong>
                                {safeText(
                                  requirementId
                                )}
                              </strong>

                              <small>
                                {formatDate(
                                  item?.createdAt
                                )}
                              </small>

                            </div>

                          </div>

                        </td>

                        {/* CUSTOMER */}

                        <td>

                          <div className="admin-customer-cell">

                            <strong>
                              {safeText(
                                customerName
                              )}
                            </strong>

                            {customerPhone && (
                              <small>
                                {customerPhone}
                              </small>
                            )}

                          </div>

                        </td>

                        {/* SYSTEM TYPE */}

                        <td>

                          <div className="admin-system-type-cell">

                            <span className="admin-type-text">
                              {safeText(
                                systemType
                              )}
                            </span>

                            {getConnectionType(
                              item
                            ) !== "—" && (
                              <small>
                                {getConnectionType(
                                  item
                                )}
                              </small>
                            )}

                          </div>

                        </td>

                        {/* CAPACITY */}

                        <td>

                          <strong className="admin-capacity">

                            {capacity !==
                              null &&
                            capacity !==
                              undefined
                              ? `${formatNumber(
                                  capacity
                                )} kW`
                              : "—"}

                          </strong>

                        </td>

                        {/* LOCATION */}

                        <td>

                          <span className="admin-location-text">
                            {safeText(
                              location
                            )}
                          </span>

                        </td>

                        {/* STATUS */}

                        <td>

                          <Badge
                            variant={getStatusVariant(
                              status
                            )}
                          >
                            {getStatusText(
                              status
                            )}
                          </Badge>

                        </td>

                        {/* CREATED */}

                        <td>

                          <span className="admin-date-text">
                            {formatDate(
                              item?.createdAt
                            )}
                          </span>

                        </td>

                        {/* ACTION */}

                        <td>

                          <button
                            type="button"
                            className="admin-view-button"
                            onClick={() =>
                              handleView(
                                item
                              )
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

        {/* PAGINATION */}

        {filteredRequirements.length >
          itemsPerPage && (
          <div className="admin-requirements-pagination">

            <Pagination
              currentPage={
                currentPage
              }
              totalPages={
                totalPages
              }
              onPageChange={
                setCurrentPage
              }
            />

          </div>
        )}

      </div>

    </div>
  );
};

export default SolarRequirementsPage;