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
import { customerService } from "@/services/customer.service";
import solarRequirementService from "@/services/solarRequirement.service";

import "./configurations.css";

const PAGE_SIZE = 10;

/* =========================================================
   SAFE HELPERS
========================================================= */

const getId = (item) => {
  if (!item) return "";

  if (
    typeof item === "string" ||
    typeof item === "number"
  ) {
    return String(item);
  }

  return (
    item?._id ||
    item?.id ||
    item?.configurationId ||
    item?.configurationID ||
    item?.customerId ||
    item?.customerID ||
    item?.requirementId ||
    item?.requirementID ||
    item?.solarRequirementId ||
    item?.solarRequirementID ||
    item?.leadId ||
    item?.leadID ||
    ""
  );
};

const getEntityId = (value) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return "";
  }

  if (
    typeof value === "string" ||
    typeof value === "number"
  ) {
    return String(value);
  }

  return String(
    value?._id ||
    value?.id ||
    value?.customerId ||
    value?.customerID ||
    value?.requirementId ||
    value?.requirementID ||
    value?.solarRequirementId ||
    value?.solarRequirementID ||
    value?.leadId ||
    value?.leadID ||
    ""
  );
};

const normalizeId = (value) =>
  String(
    getEntityId(value) || ""
  )
    .trim()
    .toLowerCase();

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
      value?.displayName ||
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

const isMeaningful = (
  value
) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return false;
  }

  const text = displayValue(
    value,
    ""
  ).trim();

  return (
    text !== "" &&
    text !== "—" &&
    text.toLowerCase() !== "null" &&
    text.toLowerCase() !== "undefined"
  );
};

const firstMeaningful = (
  values,
  fallback = ""
) => {
  for (const value of values) {
    if (isMeaningful(value)) {
      return displayValue(
        value,
        fallback
      );
    }
  }

  return fallback;
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
  response,
  preferredKeys = []
) => {
  if (Array.isArray(response)) {
    return response;
  }

  const candidates = [
    response?.data,
    response?.data?.data,
    ...preferredKeys.map(
      (key) => response?.[key]
    ),
    ...preferredKeys.map(
      (key) => response?.data?.[key]
    ),
    response?.results,
    response?.data?.results,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  return [];
};

const getCustomerName = (
  customer
) => {
  if (!customer) {
    return "";
  }

  return firstMeaningful(
    [
      customer?.customerName,
      customer?.fullName,
      customer?.name,
      customer?.displayName,
      customer?.companyName,
      customer?.contactPersonName,
      customer?.customer?.customerName,
      customer?.customer?.fullName,
      customer?.customer?.name,
      customer?.customer?.displayName,
      customer?.customer?.companyName,
      customer?.user?.fullName,
      customer?.user?.name,
    ],
    ""
  );
};

const getLeadName = (
  lead
) => {
  return firstMeaningful(
    [
      lead?.leadName,
      lead?.customerName,
      lead?.fullName,
      lead?.name,
      lead?.displayName,
      lead?.contactPersonName,
      lead?.customer?.fullName,
      lead?.customer?.name,
      lead?.customer?.customerName,
    ],
    ""
  );
};

const findById = (
  list,
  id
) => {
  const normalizedTarget =
    normalizeId(id);

  if (
    !normalizedTarget ||
    !Array.isArray(list)
  ) {
    return null;
  }

  return (
    list.find(
      (item) =>
        normalizeId(item) ===
          normalizedTarget ||
        normalizeId(
          item?._id
        ) === normalizedTarget ||
        normalizeId(
          item?.id
        ) === normalizedTarget ||
        normalizeId(
          item?.customerId
        ) === normalizedTarget ||
        normalizeId(
          item?.customerID
        ) === normalizedTarget ||
        normalizeId(
          item?.requirementId
        ) === normalizedTarget ||
        normalizeId(
          item?.requirementID
        ) === normalizedTarget ||
        normalizeId(
          item?.solarRequirementId
        ) === normalizedTarget ||
        normalizeId(
          item?.solarRequirementID
        ) === normalizedTarget
    ) || null
  );
};

const getRequirementId = (
  configuration
) => {
  const nestedRequirement =
    configuration?.solarRequirement ||
    configuration?.requirement;

  return firstMeaningful(
    [
      configuration?.solarRequirementId,
      configuration?.solarRequirementID,
      configuration?.requirementId,
      configuration?.requirementID,
      nestedRequirement,
      nestedRequirement?._id,
      nestedRequirement?.id,
      nestedRequirement?.requirementId,
      nestedRequirement?.requirementID,
      nestedRequirement?.solarRequirementId,
      nestedRequirement?.solarRequirementID,
    ],
    ""
  );
};

const resolveCustomer = (
  configuration,
  requirements,
  customers
) => {
  const nestedCustomer =
    configuration?.customer;

  const nestedRequirement =
    configuration?.solarRequirement ||
    configuration?.requirement;

  const requirementId =
    getRequirementId(
      configuration
    );

  const requirementFromList =
    findById(
      requirements,
      requirementId
    );

  const requirement =
    requirementFromList ||
    nestedRequirement ||
    null;

  const directCustomerId =
    firstMeaningful(
      [
        configuration?.customerId,
        configuration?.customerID,
        nestedCustomer,
        nestedCustomer?._id,
        nestedCustomer?.id,
        nestedCustomer?.customerId,
        nestedCustomer?.customerID,
      ],
      ""
    );

  const requirementCustomer =
    requirement?.customer;

  const requirementCustomerId =
    firstMeaningful(
      [
        requirement?.customerId,
        requirement?.customerID,
        requirementCustomer,
        requirementCustomer?._id,
        requirementCustomer?.id,
        requirementCustomer?.customerId,
        requirementCustomer?.customerID,
      ],
      ""
    );

  const customerFromList =
    findById(
      customers,
      directCustomerId
    ) ||
    findById(
      customers,
      requirementCustomerId
    );

  const customerName =
    firstMeaningful(
      [
        configuration?.customerName,
        getCustomerName(
          nestedCustomer
        ),

        /*
         * IMPORTANT:
         * Current backend response mein configuration.customer
         * har record ke liye populated nahi hai.
         * Lekin configuration.lead populated hai aur us lead
         * ke andar customerName/name available hai.
         * Isliye Customer column ko Lead -> Customer relation
         * se bhi resolve karna zaroori hai.
         */
        getCustomerName(
          configuration?.lead
        ),
        configuration?.lead?.customerName,
        configuration?.lead?.fullName,
        configuration?.lead?.name,
        configuration?.lead?.contactPersonName,
        getCustomerName(
          configuration?.lead?.customer
        ),

        requirement?.customerName,
        getCustomerName(
          requirementCustomer
        ),
        getCustomerName(
          requirement?.lead
        ),
        requirement?.lead?.customerName,
        requirement?.lead?.fullName,
        requirement?.lead?.name,
        getCustomerName(
          requirement?.lead?.customer
        ),

        getCustomerName(
          customerFromList
        ),
        configuration?.customer?.user,
      ],
      ""
    );

  const customerId =
    firstMeaningful(
      [
        configuration?.customerId,
        configuration?.customerID,
        nestedCustomer?.customerId,
        nestedCustomer?.customerID,
        nestedCustomer?._id,
        nestedCustomer?.id,
        requirementCustomer?.customerId,
        requirementCustomer?.customerID,
        requirementCustomer?._id,
        requirementCustomer?.id,
        customerFromList?.customerId,
        customerFromList?.customerID,
        customerFromList?._id,
        customerFromList?.id,
      ],
      ""
    );

  return {
    customerName,
    customerId,
    requirementId,
    requirement,
    customer:
      customerFromList ||
      nestedCustomer ||
      requirementCustomer ||
      null,
  };
};

const resolveLeadName = (
  configuration,
  requirement
) => {
  return firstMeaningful(
    [
      configuration?.leadName,
      getLeadName(
        configuration?.lead
      ),
      requirement?.leadName,
      getLeadName(
        requirement?.lead
      ),
      configuration?.lead?.customerName,
      requirement?.lead?.customerName,
    ],
    ""
  );
};

const normalizeConfiguration = (
  configuration,
  requirements = [],
  customers = []
) => {
  if (
    !configuration ||
    typeof configuration !==
      "object"
  ) {
    return configuration;
  }

  const resolved =
    resolveCustomer(
      configuration,
      requirements,
      customers
    );

  const requirement =
    resolved.requirement;

  const systemType =
    configuration.systemType;

  const inverter =
    configuration.inverter;

  return {
    ...configuration,

    customerName:
      resolved.customerName ||
      "—",

    customerId:
      resolved.customerId ||
      "",

    requirementId:
      resolved.requirementId ||
      "",

    requirement:
      configuration.requirement ||
      configuration.solarRequirement ||
      requirement ||
      null,

    leadName:
      resolveLeadName(
        configuration,
        requirement
      ),

    leadId:
      firstMeaningful(
        [
          configuration?.leadId,
          configuration?.leadID,
          configuration?.lead?._id,
          configuration?.lead?.id,
          requirement?.leadId,
          requirement?.leadID,
          requirement?.lead?._id,
          requirement?.lead?.id,
        ],
        ""
      ),

    systemType:
      displayValue(
        systemType,
        "—"
      ),

    inverterCapacity:
      displayValue(
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

    status:
      displayValue(
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
      customers,
      setCustomers,
    ] = useState([]);

    const [
      requirements,
      setRequirements,
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

          /*
           * Configuration ke saath customer aur solar
           * requirement data bhi load kar rahe hain.
           *
           * API mein customerName directly na ho tab:
           * Configuration -> Requirement -> Customer
           * relation se name resolve hoga.
           */
          const [
            configurationResult,
            customerResult,
            requirementResult,
          ] = await Promise.allSettled([
            systemConfigurationService.getSystemConfigurations(),
            customerService.getCustomers({
              page: 1,
              limit: 100,
            }),
            solarRequirementService.getSolarRequirements({
              page: 1,
              limit: 100,
            }),
          ]);

          if (
            configurationResult.status ===
            "rejected"
          ) {
            throw configurationResult.reason;
          }

          const configurationList =
            normalizeList(
              configurationResult.value,
              [
                "configurations",
              ]
            );

          const customerList =
            customerResult.status ===
            "fulfilled"
              ? normalizeList(
                  customerResult.value,
                  [
                    "customers",
                  ]
                )
              : [];

          const requirementList =
            requirementResult.status ===
            "fulfilled"
              ? normalizeList(
                  requirementResult.value,
                  [
                    "requirements",
                    "solarRequirements",
                  ]
                )
              : [];

          const normalized =
            configurationList.map(
              (configuration) =>
                normalizeConfiguration(
                  configuration,
                  requirementList,
                  customerList
                )
            );

          setCustomers(
            customerList
          );

          setRequirements(
            requirementList
          );

          setConfigurations(
            normalized
          );

          /*
           * Customer/Requirement API fail hone par
           * configurations ko hide nahi karna.
           * Sirf console warning rahegi.
           */
          if (
            customerResult.status ===
            "rejected"
          ) {
            console.warn(
              "Customer data load failed. Configuration customer fallback data will be used.",
              customerResult.reason
            );
          }

          if (
            requirementResult.status ===
            "rejected"
          ) {
            console.warn(
              "Solar requirement data load failed. Configuration requirement fallback data will be used.",
              requirementResult.reason
            );
          }
        } catch (err) {
          console.error(
            "System configuration load error:",
            err
          );

          setConfigurations(
            []
          );

          setCustomers(
            []
          );

          setRequirements(
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
          String(
            search ?? ""
          )
            .trim()
            .toLowerCase();

        return configurations.filter(
          (item) => {
            const customerName =
              String(
                item?.customerName ||
                  ""
              ).toLowerCase();

            const customerId =
              String(
                item?.customerId ||
                  ""
              ).toLowerCase();

            const configurationNumber =
              String(
                item?.configurationNumber ||
                  ""
              ).toLowerCase();

            const leadName =
              String(
                item?.leadName ||
                  ""
              ).toLowerCase();

            const leadId =
              String(
                item?.leadId ||
                  ""
              ).toLowerCase();

            const requirementId =
              String(
                item?.requirementId ||
                  ""
              ).toLowerCase();

            const systemType =
              String(
                displayValue(
                  item?.systemType,
                  ""
                )
              ).toLowerCase();

            const capacity =
              String(
                getValue(
                  item,
                  [
                    "systemSizeKW",
                    "requiredKW",
                    "capacityKW",
                    "systemCapacity",
                  ],
                  ""
                )
              ).toLowerCase();

            const searchableText =
              [
                customerName,
                customerId,
                configurationNumber,
                leadName,
                leadId,
                requirementId,
                systemType,
                capacity,
              ].join(" ");

            const matchesSearch =
              !query ||
              searchableText.includes(
                query
              );

            const status =
              String(
                displayValue(
                  item?.status,
                  ""
                )
              );

            const matchesStatus =
              statusFilter ===
                "ALL" ||
              status.toUpperCase() ===
                String(
                  statusFilter
                ).toUpperCase();

            const matchesSystemType =
              systemTypeFilter ===
                "ALL" ||
              systemType ===
                String(
                  systemTypeFilter
                ).toLowerCase();

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
              onChange={(value) =>
                setSearch(
                  String(
                    value ?? ""
                  )
                )
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

                        const customerId =
                          displayValue(
                            configuration?.customerId,
                            ""
                          );

                        const requirementId =
                          displayValue(
                            configuration?.requirementId,
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

                        /* -----------------------------------------
                           INVERTER
                           Backend may expose inverter quantity in:
                           - inverterCount
                           - inverterQuantity
                           - inverterQty
                           - inverter.quantity
                           - components[].quantity for INVERTER
                        ----------------------------------------- */

                        const inverterCountValue =
                          getValue(
                            configuration,
                            [
                              "inverterCount",
                              "inverterQuantity",
                              "inverterQty",
                              "numberOfInverters",
                              "invertersCount",
                              "inverter.quantity",
                              "inverter.qty",
                              "inverter.count",
                            ],
                            ""
                          );

                        const inverterComponents =
                          Array.isArray(
                            configuration?.components
                          )
                            ? configuration.components
                            : [];

                        const inverterComponent =
                          inverterComponents.find(
                            (component) => {
                              const type =
                                String(
                                  component?.componentType ||
                                    component?.type ||
                                    component?.category ||
                                    ""
                                ).toUpperCase();

                              return (
                                type === "INVERTER" ||
                                type.includes("INVERTER")
                              );
                            }
                          );

                        const resolvedInverterCount =
                          inverterCountValue !== ""
                            ? inverterCountValue
                            : getValue(
                                inverterComponent,
                                [
                                  "quantity",
                                  "qty",
                                  "count",
                                ],
                                ""
                              );

                        const inverterCapacity =
                          displayValue(
                            getValue(
                              configuration,
                              [
                                "inverterCapacity",
                                "inverterSize",
                                "inverter.capacity",
                                "inverter.capacityKW",
                                "inverterCapacityKW",
                              ],
                              getValue(
                                inverterComponent,
                                [
                                  "capacity",
                                  "capacityKW",
                                ],
                                ""
                              )
                            ),
                            ""
                          );

                        const inverter =
                          resolvedInverterCount !== ""
                            ? String(
                                resolvedInverterCount
                              )
                            : inverterCapacity || "—";

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

                                {!leadName &&
                                  customerId && (
                                    <small>
                                      ID:{" "}
                                      {
                                        customerId
                                      }
                                    </small>
                                  )}

                                {!leadName &&
                                  !customerId &&
                                  requirementId && (
                                    <small>
                                      Requirement:{" "}
                                      {
                                        requirementId
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
                              <div className="admin-configuration-inverter">
                                <strong>
                                  {inverter}
                                </strong>

                                {resolvedInverterCount !== "" &&
                                  inverterCapacity && (
                                    <small>
                                      {inverterCapacity} kW
                                    </small>
                                  )}
                              </div>
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
                    Customer ID
                  </span>

                  <strong>
                    {
                      displayValue(
                        selectedConfiguration?.customerId
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
                    Requirement ID
                  </span>

                  <strong>
                    {
                      displayValue(
                        selectedConfiguration?.requirementId
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