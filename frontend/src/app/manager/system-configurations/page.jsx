"use client";

import React, { useEffect, useMemo, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import SearchBox from "@/components/common/SearchBox";
import Pagination from "@/components/common/Pagination";
import Loader from "@/components/common/Loader";
import { useAuth } from "@/hooks/useAuth";
import systemConfigurationService from "@/services/systemConfiguration.service";

const ManagerSystemConfigurationsPage = () => {
  const { user, logout, loading: authLoading } = useAuth();

  const [configurations, setConfigurations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [selectedConfiguration, setSelectedConfiguration] =
    useState(null);

  const itemsPerPage = 10;

  const loadConfigurations = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await systemConfigurationService.getSystemConfigurations();

      const data =
        response?.data?.configurations ||
        response?.configurations ||
        response?.data?.items ||
        response?.items ||
        response?.data ||
        [];

      setConfigurations(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      console.error(
        "System configurations error:",
        err
      );

      setError(
        err?.message ||
          err?.response?.data?.message ||
          "Unable to load system configurations."
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

  const handleLogout = async () => {
    await logout();
  };

  const getCustomerName = (item) =>
    item?.customer?.name ||
    item?.customerName ||
    item?.lead?.name ||
    item?.lead?.customerName ||
    "Unnamed Customer";

  const getConfigurationNumber = (item) =>
    item?.configurationNumber ||
    item?.configurationNo ||
    item?.configNumber ||
    item?.referenceNumber ||
    "—";

  const getStatus = (item) =>
    item?.status ||
    item?.configurationStatus ||
    "DRAFT";

  const getCapacity = (item) =>
    item?.systemSize ||
    item?.capacity ||
    item?.requiredKW ||
    item?.requiredKw ||
    "—";

  const getItems = (item, type) => {
    const collection =
      item?.[type] ||
      item?.components?.[type] ||
      [];

    return Array.isArray(collection)
      ? collection
      : [];
  };

  const getItemCount = (item, type) =>
    getItems(item, type).reduce(
      (total, component) =>
        total +
        Number(
          component?.quantity ||
            component?.qty ||
            1
        ),
      0
    );

  const getBadgeVariant = (value) => {
    const status = String(value).toLowerCase();

    if (
      [
        "approved",
        "confirmed",
        "completed",
        "final",
      ].includes(status)
    ) {
      return "success";
    }

    if (
      [
        "rejected",
        "cancelled",
      ].includes(status)
    ) {
      return "danger";
    }

    if (
      [
        "in_progress",
        "review",
        "under_review",
      ].includes(status)
    ) {
      return "warning";
    }

    return "default";
  };

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (value) => {
    if (
      value === undefined ||
      value === null ||
      value === ""
    ) {
      return "—";
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
      return "—";
    }

    return `₹${number.toLocaleString("en-IN")}`;
  };

  const filteredConfigurations = useMemo(() => {
    const query = search.trim().toLowerCase();

    return configurations.filter((item) => {
      const status = String(
        getStatus(item)
      ).toUpperCase();

      const matchesStatus =
        statusFilter === "ALL" ||
        status === statusFilter;

      if (!query) {
        return matchesStatus;
      }

      const searchableText = [
        getCustomerName(item),
        getConfigurationNumber(item),
        item?.systemType,
        item?.inverter?.name,
        item?.roofType,
        item?.notes,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        matchesStatus &&
        searchableText.includes(query)
      );
    });
  }, [
    configurations,
    search,
    statusFilter,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredConfigurations.length /
        itemsPerPage
    )
  );

  const currentPage = Math.min(
    page,
    totalPages
  );

  const paginatedConfigurations =
    filteredConfigurations.slice(
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
      <div className="manager-configurations-loading">
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
      <div className="manager-configurations-page">
        <div className="manager-configurations-header">
          <div>
            <span className="manager-configurations-eyebrow">
              Manager Portal
            </span>

            <h1>System Configurations</h1>

            <p>
              Review technical solar system
              configurations and component details.
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

        {error && (
          <div className="manager-configurations-error">
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

        <div className="manager-configurations-toolbar">
          <SearchBox
            value={search}
            onChange={(value) => setSearch(value)}
            placeholder="Search customer, configuration..."
          />

          <select
            className="manager-configurations-status-filter"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
          >
            <option value="ALL">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="IN_PROGRESS">
              In Progress
            </option>
            <option value="UNDER_REVIEW">
              Under Review
            </option>
            <option value="APPROVED">
              Approved
            </option>
            <option value="COMPLETED">
              Completed
            </option>
            <option value="REJECTED">
              Rejected
            </option>
          </select>
        </div>

        <div className="manager-configurations-summary">
          <div>
            <span>Total Configurations</span>
            <strong>
              {filteredConfigurations.length}
            </strong>
          </div>

          <div>
            <span>Showing</span>
            <strong>
              {paginatedConfigurations.length}
            </strong>
          </div>
        </div>

        <div className="manager-configurations-card">
          <div className="manager-configurations-table-wrapper">
            <table className="manager-configurations-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Configuration</th>
                  <th>System Size</th>
                  <th>Panels</th>
                  <th>Inverter</th>
                  <th>Battery</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {paginatedConfigurations.length ===
                0 ? (
                  <tr>
                    <td
                      colSpan="9"
                      className="manager-configurations-empty"
                    >
                      <div>
                        <span>⚙</span>
                        <strong>
                          No configurations found
                        </strong>
                        <p>
                          Try changing your search
                          or status filter.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedConfigurations.map(
                    (item, index) => {
                      const panels =
                        getItems(
                          item,
                          "solarPanels"
                        );

                      const inverters =
                        getItems(
                          item,
                          "inverters"
                        );

                      const batteries =
                        getItems(
                          item,
                          "batteries"
                        );

                      return (
                        <tr
                          key={
                            item?._id ||
                            item?.id ||
                            index
                          }
                        >
                          <td>
                            <div className="manager-configuration-customer">
                              <div className="manager-configuration-avatar">
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
                            <span className="manager-configuration-number">
                              {getConfigurationNumber(
                                item
                              )}
                            </span>
                          </td>

                          <td>
                            <strong>
                              {getCapacity(item)}
                              {getCapacity(item) !==
                              "—"
                                ? " kW"
                                : ""}
                            </strong>
                          </td>

                          <td>
                            {getItemCount(
                              item,
                              "solarPanels"
                            ) || "—"}
                          </td>

                          <td>
                            {inverters.length > 0
                              ? inverters[0]
                                  ?.name ||
                                inverters[0]
                                  ?.model ||
                                "Configured"
                              : item?.inverter
                                  ?.name ||
                                item?.inverter
                                  ?.model ||
                                "—"}
                          </td>

                          <td>
                            {getItemCount(
                              item,
                              "batteries"
                            ) > 0
                              ? getItemCount(
                                  item,
                                  "batteries"
                                )
                              : item?.battery
                                  ?.name ||
                                item?.battery
                                  ?.model ||
                                "—"}
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
                                setSelectedConfiguration(
                                  item
                                )
                              }
                            >
                              View
                            </Button>
                          </td>
                        </tr>
                      );
                    }
                  )
                )}
              </tbody>
            </table>
          </div>

          {filteredConfigurations.length > 0 && (
            <div className="manager-configurations-pagination">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>

        {selectedConfiguration && (
          <div
            className="manager-configuration-modal-overlay"
            onClick={() =>
              setSelectedConfiguration(null)
            }
          >
            <div
              className="manager-configuration-modal"
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              <div className="manager-configuration-modal-header">
                <div>
                  <span>
                    System Configuration
                  </span>

                  <h2>
                    {getCustomerName(
                      selectedConfiguration
                    )}
                  </h2>

                  <p>
                    {getConfigurationNumber(
                      selectedConfiguration
                    )}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedConfiguration(
                      null
                    )
                  }
                >
                  ×
                </button>
              </div>

              <div className="manager-configuration-modal-body">
                <div className="manager-configuration-detail-grid">
                  <div>
                    <span>System Size</span>
                    <strong>
                      {getCapacity(
                        selectedConfiguration
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Status</span>

                    <Badge
                      variant={getBadgeVariant(
                        getStatus(
                          selectedConfiguration
                        )
                      )}
                    >
                      {String(
                        getStatus(
                          selectedConfiguration
                        )
                      ).replaceAll(
                        "_",
                        " "
                      )}
                    </Badge>
                  </div>

                  <div>
                    <span>System Type</span>
                    <strong>
                      {selectedConfiguration?.systemType ||
                        "—"}
                    </strong>
                  </div>

                  <div>
                    <span>Structure</span>
                    <strong>
                      {selectedConfiguration
                        ?.structure?.name ||
                        selectedConfiguration
                          ?.structureType ||
                        "—"}
                    </strong>
                  </div>

                  <div>
                    <span>Panel Quantity</span>
                    <strong>
                      {getItemCount(
                        selectedConfiguration,
                        "solarPanels"
                      ) || "—"}
                    </strong>
                  </div>

                  <div>
                    <span>Inverter</span>
                    <strong>
                      {selectedConfiguration
                        ?.inverter?.name ||
                        selectedConfiguration
                          ?.inverter?.model ||
                        getItems(
                          selectedConfiguration,
                          "inverters"
                        )[0]?.name ||
                        "—"}
                    </strong>
                  </div>

                  <div>
                    <span>Battery</span>
                    <strong>
                      {selectedConfiguration
                        ?.battery?.name ||
                        selectedConfiguration
                          ?.battery?.model ||
                        getItems(
                          selectedConfiguration,
                          "batteries"
                        )[0]?.name ||
                        "—"}
                    </strong>
                  </div>

                  <div>
                    <span>Installation</span>
                    <strong>
                      {formatCurrency(
                        selectedConfiguration
                          ?.installation
                          ?.rate ||
                          selectedConfiguration
                            ?.installationCost
                      )}
                    </strong>
                  </div>
                </div>

                <div className="manager-configuration-components">
                  <div className="manager-configuration-section-title">
                    <h3>Components</h3>
                    <span>
                      Technical BOM
                    </span>
                  </div>

                  {[
                    [
                      "Solar Panels",
                      getItems(
                        selectedConfiguration,
                        "solarPanels"
                      ),
                    ],
                    [
                      "Inverters",
                      getItems(
                        selectedConfiguration,
                        "inverters"
                      ),
                    ],
                    [
                      "Batteries",
                      getItems(
                        selectedConfiguration,
                        "batteries"
                      ),
                    ],
                    [
                      "Structures",
                      getItems(
                        selectedConfiguration,
                        "structures"
                      ),
                    ],
                    [
                      "Accessories",
                      getItems(
                        selectedConfiguration,
                        "accessories"
                      ),
                    ],
                    [
                      "Other Components",
                      getItems(
                        selectedConfiguration,
                        "otherComponents"
                      ),
                    ],
                  ].map(
                    ([title, items]) => (
                      <div
                        className="manager-configuration-component-group"
                        key={title}
                      >
                        <strong>
                          {title}
                        </strong>

                        {items.length === 0 ? (
                          <span>
                            Not configured
                          </span>
                        ) : (
                          <div>
                            {items.map(
                              (
                                component,
                                componentIndex
                              ) => (
                                <p
                                  key={
                                    component?._id ||
                                    component?.id ||
                                    componentIndex
                                  }
                                >
                                  <span>
                                    {component?.name ||
                                      component?.model ||
                                      "Component"}
                                  </span>

                                  <b>
                                    {component?.quantity ||
                                      component?.qty ||
                                      1}{" "}
                                    {component?.unit ||
                                      "Nos"}
                                  </b>
                                </p>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>

                <div className="manager-configuration-total">
                  <span>Grand Total</span>

                  <strong>
                    {formatCurrency(
                      selectedConfiguration
                        ?.grandTotal ||
                        selectedConfiguration
                          ?.total ||
                        selectedConfiguration
                          ?.grandAmount
                    )}
                  </strong>
                </div>

                <div className="manager-configuration-notes">
                  <span>Notes</span>

                  <p>
                    {selectedConfiguration?.notes ||
                      selectedConfiguration
                        ?.remarks ||
                      "No additional notes available."}
                  </p>
                </div>
              </div>

              <div className="manager-configuration-modal-footer">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    setSelectedConfiguration(
                      null
                    )
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

export default ManagerSystemConfigurationsPage;