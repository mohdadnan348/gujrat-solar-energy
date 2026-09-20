"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "../layout";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import SearchBox from "@/components/common/SearchBox";
import Pagination from "@/components/common/Pagination";
import Loader from "@/components/common/Loader";
import Modal from "@/components/common/Modal";
import { useAuth } from "@/hooks/useAuth";
import  systemConfigurationService from "@/services/systemConfiguration.service";

const PAGE_SIZE = 10;

const getValue = (obj, keys, fallback = "—") => {
  if (!obj) return fallback;

  for (const key of keys) {
    const value = obj?.[key];

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

const getId = (item) =>
  item?._id ||
  item?.id ||
  item?.configurationId ||
  item?.configurationID;

const normalizeList = (response) => {
  if (Array.isArray(response)) return response;

  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.data?.configurations)) {
    return response.data.configurations;
  }
  if (Array.isArray(response?.configurations)) {
    return response.configurations;
  }
  if (Array.isArray(response?.results)) return response.results;

  return [];
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatNumber = (value) => {
  if (value === undefined || value === null || value === "") {
    return "—";
  }

  const number = Number(value);

  if (Number.isNaN(number)) return String(value);

  return number.toLocaleString("en-IN");
};

const getStatusVariant = (status) => {
  const normalized = String(status || "").toUpperCase();

  if (
    normalized === "ACTIVE" ||
    normalized === "COMPLETED" ||
    normalized === "APPROVED"
  ) {
    return "success";
  }

  if (
    normalized === "PENDING" ||
    normalized === "IN_PROGRESS" ||
    normalized === "DRAFT"
  ) {
    return "warning";
  }

  if (
    normalized === "CANCELLED" ||
    normalized === "REJECTED" ||
    normalized === "INACTIVE"
  ) {
    return "danger";
  }

  return "default";
};

const SystemConfigurationsPage = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [configurations, setConfigurations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [systemTypeFilter, setSystemTypeFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedConfiguration, setSelectedConfiguration] =
    useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const loadConfigurations = async (showRefresh = false) => {
    try {
      setError("");

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response =
        await systemConfigurationService.getSystemConfigurations();

      setConfigurations(normalizeList(response));
    } catch (err) {
      console.error("Failed to load system configurations:", err);

      setError(
        err?.message ||
          "System configurations load nahi ho paaye. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      loadConfigurations();
    }
  }, [authLoading, user]);

  const systemTypes = useMemo(() => {
    const values = configurations
      .map((item) =>
        getValue(
          item,
          ["systemType", "system_type", "type"],
          ""
        )
      )
      .filter(Boolean);

    return [...new Set(values.map((value) => String(value)))];
  }, [configurations]);

  const statuses = useMemo(() => {
    const values = configurations
      .map((item) => getValue(item, ["status"], ""))
      .filter(Boolean);

    return [...new Set(values.map((value) => String(value)))];
  }, [configurations]);

  const filteredConfigurations = useMemo(() => {
    const query = search.trim().toLowerCase();

    return configurations.filter((item) => {
      const customerName = String(
        getValue(
          item,
          ["customerName", "customer", "name"],
          ""
        )
      ).toLowerCase();

      const configurationNumber = String(
        getValue(
          item,
          [
            "configurationNumber",
            "configurationNo",
            "configNumber",
            "number",
          ],
          ""
        )
      ).toLowerCase();

      const leadName = String(
        getValue(
          item,
          ["leadName", "lead", "leadId"],
          ""
        )
      ).toLowerCase();

      const systemType = String(
        getValue(
          item,
          ["systemType", "system_type", "type"],
          ""
        )
      );

      const status = String(
        getValue(item, ["status"], "")
      );

      const searchableText = [
        customerName,
        configurationNumber,
        leadName,
        systemType.toLowerCase(),
        String(
          getValue(item, ["requiredKW", "systemSizeKW", "capacityKW"], "")
        ).toLowerCase(),
      ].join(" ");

      const matchesSearch =
        !query || searchableText.includes(query);

      const matchesStatus =
        statusFilter === "ALL" ||
        status.toUpperCase() === statusFilter.toUpperCase();

      const matchesSystemType =
        systemTypeFilter === "ALL" ||
        systemType.toLowerCase() ===
          systemTypeFilter.toLowerCase();

      return (
        matchesSearch &&
        matchesStatus &&
        matchesSystemType
      );
    });
  }, [
    configurations,
    search,
    statusFilter,
    systemTypeFilter,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredConfigurations.length / PAGE_SIZE)
  );

  const paginatedConfigurations = useMemo(() => {
    const safePage = Math.min(currentPage, totalPages);
    const start = (safePage - 1) * PAGE_SIZE;

    return filteredConfigurations.slice(
      start,
      start + PAGE_SIZE
    );
  }, [
    filteredConfigurations,
    currentPage,
    totalPages,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, systemTypeFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const stats = useMemo(() => {
    const total = configurations.length;

    const active = configurations.filter(
      (item) =>
        String(getValue(item, ["status"], ""))
          .toUpperCase() === "ACTIVE"
    ).length;

    const pending = configurations.filter((item) => {
      const status = String(
        getValue(item, ["status"], "")
      ).toUpperCase();

      return (
        status === "PENDING" ||
        status === "DRAFT" ||
        status === "IN_PROGRESS"
      );
    }).length;

    const totalCapacity = configurations.reduce(
      (sum, item) => {
        const value = Number(
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

        return sum + (Number.isNaN(value) ? 0 : value);
      },
      0
    );

    return {
      total,
      active,
      pending,
      totalCapacity,
    };
  }, [configurations]);

  const openDetails = (configuration) => {
    setSelectedConfiguration(configuration);
    setModalOpen(true);
  };

  const closeDetails = () => {
    setModalOpen(false);
    setSelectedConfiguration(null);
  };

  const handleCreate = () => {
    router.push("/admin/system-configurations/create");
  };

  if (authLoading || loading) {
    return (
      <AdminLayout>
        <div className="admin-configurations-loading">
          <Loader />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-configurations-page">
        {/* Header */}
        <div className="admin-configurations-header">
          <div>
            <div className="admin-configurations-breadcrumb">
              Admin <span>/</span> System Configurations
            </div>

            <div className="admin-configurations-title-row">
              <div className="admin-configurations-title-icon">
                ☀
              </div>

              <div>
                <h1>System Configurations</h1>
                <p>
                  Solar systems ki configuration aur technical
                  details manage karein.
                </p>
              </div>
            </div>
          </div>

          <div className="admin-configurations-header-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={() => loadConfigurations(true)}
              disabled={refreshing}
            >
              {refreshing ? "Refreshing..." : "↻ Refresh"}
            </Button>

            <Button
              type="button"
              variant="primary"
              onClick={handleCreate}
            >
              + New Configuration
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="admin-configurations-stats">
          <div className="admin-configuration-stat-card">
            <div className="admin-configuration-stat-icon">
              #
            </div>
            <div>
              <span>Total Configurations</span>
              <strong>{stats.total}</strong>
            </div>
          </div>

          <div className="admin-configuration-stat-card">
            <div className="admin-configuration-stat-icon active">
              ✓
            </div>
            <div>
              <span>Active</span>
              <strong>{stats.active}</strong>
            </div>
          </div>

          <div className="admin-configuration-stat-card">
            <div className="admin-configuration-stat-icon pending">
              ◷
            </div>
            <div>
              <span>Pending / Draft</span>
              <strong>{stats.pending}</strong>
            </div>
          </div>

          <div className="admin-configuration-stat-card">
            <div className="admin-configuration-stat-icon capacity">
              ⚡
            </div>
            <div>
              <span>Total Capacity</span>
              <strong>
                {formatNumber(stats.totalCapacity)} kW
              </strong>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="admin-configurations-error">
            <div>
              <strong>Unable to load configurations</strong>
              <p>{error}</p>
            </div>

            <Button
              type="button"
              variant="secondary"
              onClick={() => loadConfigurations()}
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Filters */}
        <div className="admin-configurations-toolbar">
          <div className="admin-configurations-search">
            <SearchBox
              value={search}
              onChange={setSearch}
              placeholder="Search customer, configuration, lead..."
            />
          </div>

          <div className="admin-configurations-filters">
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
              className="admin-configuration-filter"
            >
              <option value="ALL">All Status</option>

              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <select
              value={systemTypeFilter}
              onChange={(e) =>
                setSystemTypeFilter(e.target.value)
              }
              className="admin-configuration-filter"
            >
              <option value="ALL">All System Types</option>

              {systemTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="admin-configurations-card">
          <div className="admin-configurations-card-header">
            <div>
              <h2>Configuration Records</h2>
              <p>
                {filteredConfigurations.length} configuration
                {filteredConfigurations.length !== 1 ? "s" : ""} found
              </p>
            </div>
          </div>

          {paginatedConfigurations.length === 0 ? (
            <div className="admin-configurations-empty">
              <div className="admin-configurations-empty-icon">
                ☀
              </div>

              <h3>No configurations found</h3>

              <p>
                {search ||
                statusFilter !== "ALL" ||
                systemTypeFilter !== "ALL"
                  ? "Aapke current filters ke according koi configuration nahi mili."
                  : "Abhi tak koi system configuration create nahi hui hai."}
              </p>

              {!search &&
                statusFilter === "ALL" &&
                systemTypeFilter === "ALL" && (
                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleCreate}
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
                      <th>Configuration</th>
                      <th>Customer / Lead</th>
                      <th>System Type</th>
                      <th>Capacity</th>
                      <th>Panels</th>
                      <th>Inverter</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedConfigurations.map(
                      (configuration, index) => {
                        const id = getId(configuration);

                        const configurationNumber =
                          getValue(
                            configuration,
                            [
                              "configurationNumber",
                              "configurationNo",
                              "configNumber",
                              "number",
                            ],
                            `CONFIG-${String(
                              index + 1
                            ).padStart(3, "0")}`
                          );

                        const customerName =
                          getValue(
                            configuration,
                            [
                              "customerName",
                              "customer.name",
                              "customer",
                              "name",
                            ],
                            "—"
                          );

                        const leadName = getValue(
                          configuration,
                          ["leadName", "lead.name", "lead"],
                          ""
                        );

                        const systemType =
                          getValue(
                            configuration,
                            [
                              "systemType",
                              "system_type",
                              "type",
                            ],
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
                          getValue(
                            configuration,
                            [
                              "inverterCapacity",
                              "inverterSize",
                              "inverter",
                            ],
                            "—"
                          );

                        const status = getValue(
                          configuration,
                          ["status"],
                          "—"
                        );

                        return (
                          <tr key={id || index}>
                            <td>
                              <div className="admin-configuration-number">
                                <span className="admin-configuration-mini-icon">
                                  ⚡
                                </span>
                                <div>
                                  <strong>
                                    {configurationNumber}
                                  </strong>

                                  <small>
                                    {getValue(
                                      configuration,
                                      [
                                        "configurationId",
                                        "_id",
                                        "id",
                                      ],
                                      ""
                                    )}
                                  </small>
                                </div>
                              </div>
                            </td>

                            <td>
                              <div className="admin-configuration-customer">
                                <strong>
                                  {customerName}
                                </strong>

                                {leadName && (
                                  <small>
                                    Lead: {leadName}
                                  </small>
                                )}
                              </div>
                            </td>

                            <td>
                              <span className="admin-system-type">
                                {systemType}
                              </span>
                            </td>

                            <td>
                              <strong>
                                {capacity !== "—"
                                  ? `${formatNumber(
                                      capacity
                                    )} kW`
                                  : "—"}
                              </strong>
                            </td>

                            <td>
                              {formatNumber(panels)}
                            </td>

                            <td>
                              {inverter}
                            </td>

                            <td>
                              <Badge
                                variant={getStatusVariant(
                                  status
                                )}
                              >
                                {status}
                              </Badge>
                            </td>

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

                            <td>
                              <Button
                                type="button"
                                variant="secondary"
                                size="small"
                                onClick={() =>
                                  id
                                    ? router.push(
                                        `/admin/system-configurations/${id}`
                                      )
                                    : openDetails(
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

              <div className="admin-configurations-pagination">
                <div className="admin-configurations-count">
                  Showing{" "}
                  {filteredConfigurations.length === 0
                    ? 0
                    : (currentPage - 1) *
                        PAGE_SIZE +
                      1}{" "}
                  to{" "}
                  {Math.min(
                    currentPage * PAGE_SIZE,
                    filteredConfigurations.length
                  )}{" "}
                  of {filteredConfigurations.length}
                </div>

                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            </>
          )}
        </div>

        {/* Fallback Details Modal */}
        <Modal
          isOpen={modalOpen}
          onClose={closeDetails}
          title="System Configuration Details"
        >
          {selectedConfiguration && (
            <div className="admin-configuration-modal-content">
              <div className="admin-configuration-modal-grid">
                <div>
                  <span>Configuration</span>
                  <strong>
                    {getValue(
                      selectedConfiguration,
                      [
                        "configurationNumber",
                        "configurationNo",
                        "configNumber",
                      ]
                    )}
                  </strong>
                </div>

                <div>
                  <span>Status</span>
                  <strong>
                    {getValue(
                      selectedConfiguration,
                      ["status"]
                    )}
                  </strong>
                </div>

                <div>
                  <span>Customer</span>
                  <strong>
                    {getValue(
                      selectedConfiguration,
                      ["customerName", "customer", "name"]
                    )}
                  </strong>
                </div>

                <div>
                  <span>System Type</span>
                  <strong>
                    {getValue(
                      selectedConfiguration,
                      ["systemType", "type"]
                    )}
                  </strong>
                </div>

                <div>
                  <span>System Capacity</span>
                  <strong>
                    {getValue(
                      selectedConfiguration,
                      [
                        "systemSizeKW",
                        "requiredKW",
                        "capacityKW",
                      ]
                    )}{" "}
                    kW
                  </strong>
                </div>

                <div>
                  <span>Panel Count</span>
                  <strong>
                    {getValue(
                      selectedConfiguration,
                      [
                        "panelCount",
                        "numberOfPanels",
                        "panelsCount",
                      ]
                    )}
                  </strong>
                </div>

                <div>
                  <span>Inverter</span>
                  <strong>
                    {getValue(
                      selectedConfiguration,
                      [
                        "inverterCapacity",
                        "inverterSize",
                        "inverter",
                      ]
                    )}
                  </strong>
                </div>

                <div>
                  <span>Created</span>
                  <strong>
                    {formatDate(
                      getValue(
                        selectedConfiguration,
                        ["createdAt"],
                        null
                      )
                    )}
                  </strong>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default SystemConfigurationsPage;