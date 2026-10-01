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
import Modal from "@/components/common/Modal";

import systemConfigurationService from "@/services/systemConfiguration.service";

import "./configurations.css";

const PAGE_SIZE = 10;

/* =========================================================
   SAFE HELPERS
========================================================= */

const getId = (item) => {
  if (!item) return "";

  if (typeof item === "string") {
    return item;
  }

  return (
    item?._id ||
    item?.id ||
    item?.configurationId ||
    item?.configurationID ||
    ""
  );
};

/*
 * Normal object -> readable text
 *
 * Backend se agar:
 * customer: {
 *   _id,
 *   customerId,
 *   name,
 *   companyName,
 *   mobile,
 *   email,
 *   status
 * }
 *
 * aaye to React object ko directly render nahi karega.
 */
const displayValue = (
  value,
  fallback = "—"
) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return fallback;
  }

  if (
    typeof value === "string" ||
    typeof value === "number"
  ) {
    return String(value);
  }

  if (typeof value === "object") {
    return (
      value?.name ||
      value?.fullName ||
      value?.customerName ||
      value?.companyName ||
      value?.leadName ||
      value?.configurationNumber ||
      value?.configurationId ||
      value?.customerId ||
      value?.leadId ||
      value?._id ||
      fallback
    );
  }

  return String(value);
};

const getValue = (
  object,
  keys,
  fallback = "—"
) => {
  if (!object) {
    return fallback;
  }

  for (const key of keys) {
    const value = object?.[key];

    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      return value;
    }
  }

  return fallback;
};

const safeValue = (
  object,
  keys,
  fallback = "—"
) => {
  return displayValue(
    getValue(
      object,
      keys,
      fallback
    ),
    fallback
  );
};

/* =========================================================
   RESPONSE NORMALIZATION
========================================================= */

const normalizeList = (
  response
) => {
  let list = [];

  if (Array.isArray(response)) {
    list = response;
  } else if (
    Array.isArray(response?.data)
  ) {
    list = response.data;
  } else if (
    Array.isArray(
      response?.data?.data
    )
  ) {
    list =
      response.data.data;
  } else if (
    Array.isArray(
      response?.data?.configurations
    )
  ) {
    list =
      response.data.configurations;
  } else if (
    Array.isArray(
      response?.configurations
    )
  ) {
    list =
      response.configurations;
  } else if (
    Array.isArray(
      response?.results
    )
  ) {
    list =
      response.results;
  } else if (
    Array.isArray(
      response?.data?.results
    )
  ) {
    list =
      response.data.results;
  }

  return list;
};

/*
 * Important:
 * API object ko frontend ke render-safe object
 * mein normalize kar rahe hain.
 */
const normalizeConfiguration = (
  configuration
) => {
  if (
    !configuration ||
    typeof configuration !==
      "object"
  ) {
    return configuration;
  }

  const customer =
    configuration.customer;

  const lead =
    configuration.lead;

  const systemType =
    configuration.systemType;

  const inverter =
    configuration.inverter;

  return {
    ...configuration,

    customerName: displayValue(
      configuration.customerName ||
        customer,
      "—"
    ),

    leadName: displayValue(
      configuration.leadName ||
        lead,
      ""
    ),

    systemType: displayValue(
      systemType,
      "—"
    ),

    inverterCapacity: displayValue(
      configuration.inverterCapacity ||
        configuration.inverterSize ||
        inverter,
      "—"
    ),

    configurationNumber:
      displayValue(
        configuration.configurationNumber ||
          configuration.configurationNo ||
          configuration.configNumber,
        ""
      ),

    status: displayValue(
      configuration.status,
      "—"
    ),
  };
};

/* =========================================================
   DATE
========================================================= */

const formatDate = (
  value
) => {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return displayValue(value);
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

/* =========================================================
   NUMBER
========================================================= */

const formatNumber = (
  value
) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return "—";
  }

  if (
    typeof value === "object"
  ) {
    return "—";
  }

  const number =
    Number(value);

  if (
    Number.isNaN(number)
  ) {
    return displayValue(
      value
    );
  }

  return number.toLocaleString(
    "en-IN"
  );
};

/* =========================================================
   STATUS
========================================================= */

const getStatusVariant = (
  status
) => {
  const normalized =
    String(
      status || ""
    ).toUpperCase();

  if (
    normalized ===
      "ACTIVE" ||
    normalized ===
      "COMPLETED" ||
    normalized ===
      "APPROVED" ||
    normalized ===
      "CONFIGURED"
  ) {
    return "success";
  }

  if (
    normalized ===
      "PENDING" ||
    normalized ===
      "IN_PROGRESS" ||
    normalized ===
      "DRAFT"
  ) {
    return "warning";
  }

  if (
    normalized ===
      "CANCELLED" ||
    normalized ===
      "REJECTED" ||
    normalized ===
      "INACTIVE"
  ) {
    return "danger";
  }

  return "default";
};

/* =========================================================
   PAGE
========================================================= */

const SystemConfigurationsPage =
  () => {
    const router =
      useRouter();

    const [
      configurations,
      setConfigurations,
    ] = useState([]);

    const [
      loading,
      setLoading,
    ] = useState(true);

    const [
      refreshing,
      setRefreshing,
    ] = useState(false);

    const [
      error,
      setError,
    ] = useState("");

    const [
      search,
      setSearch,
    ] = useState("");

    const [
      statusFilter,
      setStatusFilter,
    ] = useState("ALL");

    const [
      systemTypeFilter,
      setSystemTypeFilter,
    ] = useState("ALL");

    const [
      currentPage,
      setCurrentPage,
    ] = useState(1);

    const [
      selectedConfiguration,
      setSelectedConfiguration,
    ] = useState(null);

    const [
      modalOpen,
      setModalOpen,
    ] = useState(false);

    /* =====================================================
       LOAD
    ===================================================== */

    const loadConfigurations =
      async (
        showRefresh = false
      ) => {
        try {
          setError("");

          if (showRefresh) {
            setRefreshing(true);
          } else {
            setLoading(true);
          }

          const response =
            await systemConfigurationService.getSystemConfigurations();

          const list =
            normalizeList(
              response
            );

          const normalized =
            list.map(
              normalizeConfiguration
            );

          setConfigurations(
            normalized
          );
        } catch (err) {
          console.error(
            "System configuration load error:",
            err
          );

          setConfigurations(
            []
          );

          setError(
            err?.response
              ?.data?.message ||
              err?.message ||
              "System configurations load nahi ho paaye."
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      };

    useEffect(() => {
      loadConfigurations();
    }, []);

    /* =====================================================
       SYSTEM TYPES
    ===================================================== */

    const systemTypes =
      useMemo(() => {
        const values =
          configurations
            .map(
              (item) =>
                displayValue(
                  item?.systemType,
                  ""
                )
            )
            .filter(Boolean);

        return [
          ...new Set(values),
        ];
      }, [
        configurations,
      ]);

    /* =====================================================
       STATUSES
    ===================================================== */

    const statuses =
      useMemo(() => {
        const values =
          configurations
            .map(
              (item) =>
                displayValue(
                  item?.status,
                  ""
                )
            )
            .filter(Boolean);

        return [
          ...new Set(values),
        ];
      }, [
        configurations,
      ]);

    /* =====================================================
       FILTER
    ===================================================== */

    const filteredConfigurations =
      useMemo(() => {
        const query =
          search
            .trim()
            .toLowerCase();

        return configurations.filter(
          (item) => {
            const customerName =
              displayValue(
                item?.customerName,
                ""
              ).toLowerCase();

            const configurationNumber =
              displayValue(
                item?.configurationNumber,
                ""
              ).toLowerCase();

            const leadName =
              displayValue(
                item?.leadName,
                ""
              ).toLowerCase();

            const systemType =
              displayValue(
                item?.systemType,
                ""
              ).toLowerCase();

            const capacity =
              displayValue(
                getValue(
                  item,
                  [
                    "systemSizeKW",
                    "requiredKW",
                    "capacityKW",
                    "systemCapacity",
                  ],
                  ""
                ),
                ""
              ).toLowerCase();

            const searchableText =
              [
                customerName,
                configurationNumber,
                leadName,
                systemType,
                capacity,
              ].join(" ");

            const matchesSearch =
              !query ||
              searchableText.includes(
                query
              );

            const status =
              displayValue(
                item?.status,
                ""
              );

            const matchesStatus =
              statusFilter ===
                "ALL" ||
              status.toUpperCase() ===
                statusFilter.toUpperCase();

            const matchesSystemType =
              systemTypeFilter ===
                "ALL" ||
              systemType ===
                systemTypeFilter.toLowerCase();

            return (
              matchesSearch &&
              matchesStatus &&
              matchesSystemType
            );
          }
        );
      }, [
        configurations,
        search,
        statusFilter,
        systemTypeFilter,
      ]);

    /* =====================================================
       PAGINATION
    ===================================================== */

    const totalPages =
      Math.max(
        1,
        Math.ceil(
          filteredConfigurations.length /
            PAGE_SIZE
        )
      );

    const safeCurrentPage =
      Math.min(
        currentPage,
        totalPages
      );

    const paginatedConfigurations =
      useMemo(() => {
        const start =
          (safeCurrentPage -
            1) *
          PAGE_SIZE;

        return filteredConfigurations.slice(
          start,
          start +
            PAGE_SIZE
        );
      }, [
        filteredConfigurations,
        safeCurrentPage,
      ]);

    useEffect(() => {
      setCurrentPage(1);
    }, [
      search,
      statusFilter,
      systemTypeFilter,
    ]);

    useEffect(() => {
      if (
        currentPage >
        totalPages
      ) {
        setCurrentPage(
          totalPages
        );
      }
    }, [
      currentPage,
      totalPages,
    ]);

    /* =====================================================
       STATS
    ===================================================== */

    const stats =
      useMemo(() => {
        const total =
          configurations.length;

        const active =
          configurations.filter(
            (item) =>
              displayValue(
                item?.status,
                ""
              ).toUpperCase() ===
              "ACTIVE"
          ).length;

        const pending =
          configurations.filter(
            (item) => {
              const status =
                displayValue(
                  item?.status,
                  ""
                ).toUpperCase();

              return (
                status ===
                  "PENDING" ||
                status ===
                  "DRAFT" ||
                status ===
                  "IN_PROGRESS"
              );
            }
          ).length;

        const totalCapacity =
          configurations.reduce(
            (
              sum,
              item
            ) => {
              const value =
                Number(
                  getValue(
                    item,
                    [
                      "systemSizeKW",
                      "requiredKW",
                      "capacityKW",
                      "systemCapacity",
                    ],
                    0
                  )
                );

              return (
                sum +
                (Number.isNaN(
                  value
                )
                  ? 0
                  : value)
              );
            },
            0
          );

        return {
          total,
          active,
          pending,
          totalCapacity,
        };
      }, [
        configurations,
      ]);

    /* =====================================================
       ACTIONS
    ===================================================== */

    const handleCreate =
      () => {
        router.push(
          "/admin/system-configurations/create"
        );
      };

    const handleView =
      (configuration) => {
        const id =
          getId(
            configuration
          );

        if (id) {
          router.push(
            `/admin/system-configurations/${id}`
          );
          return;
        }

        setSelectedConfiguration(
          configuration
        );

        setModalOpen(true);
      };

    const closeModal =
      () => {
        setModalOpen(false);
        setSelectedConfiguration(
          null
        );
      };

    /* =====================================================
       LOADING
    ===================================================== */

    if (loading) {
      return (
        <div className="admin-configurations-loading">
          <Loader />
        </div>
      );
    }

    /* =====================================================
       MAIN
    ===================================================== */

    return (
      <div className="admin-configurations-page">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="admin-configurations-header">

          <div>

            <div className="admin-configurations-breadcrumb">
              Admin{" "}
              <span>/</span>{" "}
              System Configurations
            </div>

            <div className="admin-configurations-title-row">

              <div className="admin-configurations-title-icon">
                ☀
              </div>

              <div>

                <h1>
                  System Configurations
                </h1>

                <p>
                  Solar systems ki
                  configuration aur
                  technical details
                  manage karein.
                </p>

              </div>

            </div>

          </div>

          <div className="admin-configurations-header-actions">

            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                loadConfigurations(
                  true
                )
              }
              disabled={
                refreshing
              }
            >
              {refreshing
                ? "Refreshing..."
                : "↻ Refresh"}
            </Button>

            <Button
              type="button"
              variant="primary"
              onClick={
                handleCreate
              }
            >
              + New Configuration
            </Button>

          </div>

        </div>

        {/* =================================================
            STATS
        ================================================= */}

        <div className="admin-configurations-stats">

          <div className="admin-configuration-stat-card">

            <div className="admin-configuration-stat-icon">
              #
            </div>

            <div>

              <span>
                Total Configurations
              </span>

              <strong>
                {stats.total}
              </strong>

            </div>

          </div>

          <div className="admin-configuration-stat-card">

            <div className="admin-configuration-stat-icon active">
              ✓
            </div>

            <div>

              <span>
                Active
              </span>

              <strong>
                {stats.active}
              </strong>

            </div>

          </div>

          <div className="admin-configuration-stat-card">

            <div className="admin-configuration-stat-icon pending">
              ◷
            </div>

            <div>

              <span>
                Pending / Draft
              </span>

              <strong>
                {stats.pending}
              </strong>

            </div>

          </div>

          <div className="admin-configuration-stat-card">

            <div className="admin-configuration-stat-icon capacity">
              ⚡
            </div>

            <div>

              <span>
                Total Capacity
              </span>

              <strong>
                {formatNumber(
                  stats.totalCapacity
                )}{" "}
                kW
              </strong>

            </div>

          </div>

        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="admin-configurations-error">

            <div>

              <strong>
                Unable to load
                configurations
              </strong>

              <p>
                {error}
              </p>

            </div>

            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                loadConfigurations()
              }
            >
              Try Again
            </Button>

          </div>
        )}

        {/* =================================================
            FILTERS
        ================================================= */}

        <div className="admin-configurations-toolbar">

          <div className="admin-configurations-search">

            <SearchBox
              value={search}
              onChange={
                setSearch
              }
              placeholder="Search customer, configuration, lead..."
            />

          </div>

          <div className="admin-configurations-filters">

            <select
              value={
                statusFilter
              }
              onChange={(
                event
              ) =>
                setStatusFilter(
                  event.target
                    .value
                )
              }
              className="admin-configuration-filter"
            >

              <option value="ALL">
                All Status
              </option>

              {statuses.map(
                (status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {status}
                  </option>
                )
              )}

            </select>

            <select
              value={
                systemTypeFilter
              }
              onChange={(
                event
              ) =>
                setSystemTypeFilter(
                  event.target
                    .value
                )
              }
              className="admin-configuration-filter"
            >

              <option value="ALL">
                All System Types
              </option>

              {systemTypes.map(
                (type) => (
                  <option
                    key={type}
                    value={type}
                  >
                    {type}
                  </option>
                )
              )}

            </select>

          </div>

        </div>

        {/* =================================================
            TABLE
        ================================================= */}

        <div className="admin-configurations-card">

          <div className="admin-configurations-card-header">

            <div>

              <h2>
                Configuration Records
              </h2>

              <p>
                {
                  filteredConfigurations.length
                }{" "}
                configuration
                {filteredConfigurations.length !==
                1
                  ? "s"
                  : ""}{" "}
                found
              </p>

            </div>

          </div>

          {paginatedConfigurations.length ===
          0 ? (

            <div className="admin-configurations-empty">

              <div className="admin-configurations-empty-icon">
                ☀
              </div>

              <h3>
                No configurations
                found
              </h3>

              <p>
                {search ||
                statusFilter !==
                  "ALL" ||
                systemTypeFilter !==
                  "ALL"
                  ? "Aapke current filters ke according koi configuration nahi mili."
                  : "Abhi tak koi system configuration create nahi hui hai."}
              </p>

              {!search &&
                statusFilter ===
                  "ALL" &&
                systemTypeFilter ===
                  "ALL" && (
                  <Button
                    type="button"
                    variant="primary"
                    onClick={
                      handleCreate
                    }
                  >
                    Create Configuration
                  </Button>
                )}

            </div>

          ) : (

            <>

              <div className="admin-configurations-table-wrapper">

                <table className="admin-configurations-table">

                  <thead>

                    <tr>

                      <th>
                        Configuration
                      </th>

                      <th>
                        Customer / Lead
                      </th>

                      <th>
                        System Type
                      </th>

                      <th>
                        Capacity
                      </th>

                      <th>
                        Panels
                      </th>

                      <th>
                        Inverter
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
                          getId(
                            configuration
                          );

                        const configurationNumber =
                          displayValue(
                            configuration?.configurationNumber,
                            `CONFIG-${String(
                              index +
                                1
                            ).padStart(
                              3,
                              "0"
                            )}`
                          );

                        const customerName =
                          displayValue(
                            configuration?.customerName,
                            "—"
                          );

                        const leadName =
                          displayValue(
                            configuration?.leadName,
                            ""
                          );

                        const systemType =
                          displayValue(
                            configuration?.systemType,
                            "—"
                          );

                        const capacity =
                          getValue(
                            configuration,
                            [
                              "systemSizeKW",
                              "requiredKW",
                              "capacityKW",
                              "systemCapacity",
                            ],
                            "—"
                          );

                        const panels =
                          getValue(
                            configuration,
                            [
                              "panelCount",
                              "numberOfPanels",
                              "panelsCount",
                              "totalPanels",
                            ],
                            "—"
                          );

                        const inverter =
                          displayValue(
                            configuration?.inverterCapacity,
                            "—"
                          );

                        const status =
                          displayValue(
                            configuration?.status,
                            "—"
                          );

                        return (
                          <tr
                            key={
                              id ||
                              `${configurationNumber}-${index}`
                            }
                          >

                            {/* CONFIGURATION */}

                            <td>

                              <div className="admin-configuration-number">

                                <span className="admin-configuration-mini-icon">
                                  ⚡
                                </span>

                                <div>

                                  <strong>
                                    {
                                      configurationNumber
                                    }
                                  </strong>

                                  <small>
                                    {displayValue(
                                      configuration?._id ||
                                        configuration?.id,
                                      ""
                                    )}
                                  </small>

                                </div>

                              </div>

                            </td>

                            {/* CUSTOMER */}

                            <td>

                              <div className="admin-configuration-customer">

                                <strong>
                                  {
                                    customerName
                                  }
                                </strong>

                                {leadName && (
                                  <small>
                                    Lead:{" "}
                                    {
                                      leadName
                                    }
                                  </small>
                                )}

                              </div>

                            </td>

                            {/* SYSTEM */}

                            <td>

                              <span className="admin-system-type">
                                {
                                  systemType
                                }
                              </span>

                            </td>

                            {/* CAPACITY */}

                            <td>

                              <strong>
                                {capacity !==
                                "—"
                                  ? `${formatNumber(
                                      capacity
                                    )} kW`
                                  : "—"}
                              </strong>

                            </td>

                            {/* PANELS */}

                            <td>
                              {formatNumber(
                                panels
                              )}
                            </td>

                            {/* INVERTER */}

                            <td>
                              {
                                inverter
                              }
                            </td>

                            {/* STATUS */}

                            <td>

                              <Badge
                                variant={getStatusVariant(
                                  status
                                )}
                              >
                                {
                                  status
                                }
                              </Badge>

                            </td>

                            {/* CREATED */}

                            <td>

                              {formatDate(
                                getValue(
                                  configuration,
                                  [
                                    "createdAt",
                                    "created_at",
                                  ],
                                  null
                                )
                              )}

                            </td>

                            {/* ACTION */}

                            <td>

                              <Button
                                type="button"
                                variant="secondary"
                                size="small"
                                onClick={() =>
                                  handleView(
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

              {/* PAGINATION */}

              <div className="admin-configurations-pagination">

                <div className="admin-configurations-count">

                  Showing{" "}

                  {filteredConfigurations.length ===
                  0
                    ? 0
                    : (
                        safeCurrentPage -
                        1
                      ) *
                        PAGE_SIZE +
                      1}

                  {" "}to{" "}

                  {Math.min(
                    safeCurrentPage *
                      PAGE_SIZE,
                    filteredConfigurations.length
                  )}

                  {" "}of{" "}

                  {
                    filteredConfigurations.length
                  }

                </div>

                <Pagination
                  currentPage={
                    safeCurrentPage
                  }
                  totalPages={
                    totalPages
                  }
                  onPageChange={
                    setCurrentPage
                  }
                />

              </div>

            </>

          )}

        </div>

        {/* =================================================
            FALLBACK MODAL
        ================================================= */}

        <Modal
          isOpen={
            modalOpen
          }
          onClose={
            closeModal
          }
          title="System Configuration Details"
        >

          {selectedConfiguration && (

            <div className="admin-configuration-modal-content">

              <div className="admin-configuration-modal-grid">

                <div>

                  <span>
                    Configuration
                  </span>

                  <strong>
                    {
                      displayValue(
                        selectedConfiguration?.configurationNumber
                      )
                    }
                  </strong>

                </div>

                <div>

                  <span>
                    Customer
                  </span>

                  <strong>
                    {
                      displayValue(
                        selectedConfiguration?.customerName
                      )
                    }
                  </strong>

                </div>

                <div>

                  <span>
                    Lead
                  </span>

                  <strong>
                    {
                      displayValue(
                        selectedConfiguration?.leadName
                      )
                    }
                  </strong>

                </div>

                <div>

                  <span>
                    System Type
                  </span>

                  <strong>
                    {
                      displayValue(
                        selectedConfiguration?.systemType
                      )
                    }
                  </strong>

                </div>

                <div>

                  <span>
                    Capacity
                  </span>

                  <strong>
                    {formatNumber(
                      getValue(
                        selectedConfiguration,
                        [
                          "systemSizeKW",
                          "requiredKW",
                          "capacityKW",
                          "systemCapacity",
                        ],
                        "—"
                      )
                    )}{" "}
                    kW
                  </strong>

                </div>

                <div>

                  <span>
                    Status
                  </span>

                  <strong>
                    {
                      displayValue(
                        selectedConfiguration?.status
                      )
                    }
                  </strong>

                </div>

                <div>

                  <span>
                    Created
                  </span>

                  <strong>
                    {formatDate(
                      selectedConfiguration?.createdAt
                    )}
                  </strong>

                </div>

              </div>

            </div>

          )}

        </Modal>

      </div>
    );
  };

export default SystemConfigurationsPage;