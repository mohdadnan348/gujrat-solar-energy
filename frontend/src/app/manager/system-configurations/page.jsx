"use client";

import React, { useEffect, useMemo, useState } from "react";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import SearchBox from "@/components/common/SearchBox";
import Pagination from "@/components/common/Pagination";
import Loader from "@/components/common/Loader";
import { useAuth } from "@/hooks/useAuth";
import systemConfigurationService from "@/services/systemConfiguration.service";

import "./configurations.css";

const ManagerSystemConfigurationsPage = () => {
  const { user, loading: authLoading } = useAuth();

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

      // APIs may return the array at different wrapper levels.
      const candidates = [
        response?.data?.configurations,
        response?.configurations,
        response?.data?.items,
        response?.items,
        response?.data?.data?.configurations,
        response?.data?.data?.items,
        response?.data?.data,
        response?.data?.results,
        response?.results,
        response?.data,
        response,
      ];

      const data = candidates.find(Array.isArray);
      setConfigurations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(
        "System configurations error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
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

  const firstValue = (...values) =>
    values.find((value) =>
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ""
    );

  const getCustomer = (item) =>
    item?.customer ||
    item?.solarRequirement?.customer ||
    item?.requirement?.customer ||
    item?.lead?.customer ||
    {};

  const getCustomerName = (item) =>
    firstValue(
      getCustomer(item)?.name,
      getCustomer(item)?.fullName,
      item?.customerName,
      item?.customer?.customerName,
      item?.lead?.name,
      item?.lead?.customerName,
      item?.solarRequirement?.customerName,
      item?.name,
      "Unnamed Customer"
    );

  const getCustomerPhone = (item) =>
    firstValue(
      getCustomer(item)?.mobile,
      getCustomer(item)?.phone,
      getCustomer(item)?.mobileNumber,
      item?.phone,
      item?.mobile,
      item?.mobileNumber,
      item?.customerPhone,
      item?.lead?.mobile,
      item?.lead?.phone,
      "No phone"
    );

  const getCustomerEmail = (item) =>
    firstValue(
      getCustomer(item)?.email,
      item?.email,
      item?.customerEmail,
      item?.lead?.email,
      "—"
    );

  const getConfigurationNumber = (item) =>
    firstValue(
      item?.configurationNumber,
      item?.configurationNo,
      item?.configNumber,
      item?.referenceNumber,
      item?.configurationId,
      item?.code,
      item?.number,
      "—"
    );

  const getStatus = (item) =>
    firstValue(
      item?.status,
      item?.configurationStatus,
      item?.state,
      "DRAFT"
    );

  const getCapacity = (item) =>
    firstValue(
      item?.systemSize,
      item?.systemCapacity,
      item?.capacity,
      item?.requiredKW,
      item?.requiredKw,
      item?.solarRequirement?.requiredKW,
      item?.solarRequirement?.requiredKw,
      item?.requirement?.requiredKW,
      "—"
    );

  const getItems = (item, type) => {
    const singular = {
      solarPanels: ["solarPanel", "panel", "panels"],
      inverters: ["inverter"],
      batteries: ["battery"],
      structures: ["structure"],
      accessories: ["accessory"],
      otherComponents: ["otherComponent", "components"],
    };

    const direct = item?.[type] ?? item?.components?.[type] ??
      item?.billOfMaterials?.[type] ?? item?.bom?.[type];

    if (Array.isArray(direct)) return direct;
    if (direct && typeof direct === "object") return [direct];

    for (const key of singular[type] || []) {
      const value = item?.[key] ?? item?.components?.[key];
      if (Array.isArray(value)) return value;
      if (value && typeof value === "object") return [value];
    }
    return [];
  };

  const getItemCount = (item, type) =>
    getItems(item, type).reduce(
      (total, component) =>
        total +
        Number(
          component?.quantity ??
            component?.qty ??
            component?.count ??
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
        getCustomerPhone(item),
        getCustomerEmail(item),
        getConfigurationNumber(item),
        getCapacity(item),
        item?.systemType,
        item?.inverter?.name,
        item?.inverter?.model,
        item?.roofType,
        item?.notes,
        item?.location,
        item?.siteAddress,
        ...getItems(item, "solarPanels").flatMap((part) => [part?.name, part?.model, part?.brand]),
        ...getItems(item, "inverters").flatMap((part) => [part?.name, part?.model, part?.brand]),
        ...getItems(item, "batteries").flatMap((part) => [part?.name, part?.model, part?.brand]),
      ]
        .filter(Boolean)
        .map((value) => String(value))
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
    <div className="manager-configurations-page">
      {/* Header */}
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

      {/* Error */}
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

      {/* Toolbar */}
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
            setStatusFilter(event.target.value)
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

      {/* Summary */}
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

      {/* Table */}
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
              {paginatedConfigurations.length === 0 ? (
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
                    const panels = getItems(
                      item,
                      "solarPanels"
                    );

                    const inverters = getItems(
                      item,
                      "inverters"
                    );

                    const batteries = getItems(
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
                        {/* Customer */}
                        <td>
                          <div className="manager-configuration-customer">
                            <div className="manager-configuration-avatar">
                              {String(
                                getCustomerName(item)
                              )
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>
                              <strong>
                                {getCustomerName(item)}
                              </strong>

                              <span>
                                {getCustomerPhone(item)}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Configuration */}
                        <td>
                          <span className="manager-configuration-number">
                            {getConfigurationNumber(
                              item
                            )}
                          </span>
                        </td>

                        {/* System Size */}
                        <td>
                          <strong>
                            {String(getCapacity(item)) !== "—" &&
                            !String(getCapacity(item)).toLowerCase().includes("kw")
                              ? `${getCapacity(item)} kW`
                              : getCapacity(item)}
                          </strong>
                        </td>

                        {/* Panels */}
                        <td>
                          {getItemCount(
                            item,
                            "solarPanels"
                          ) || "—"}
                        </td>

                        {/* Inverter */}
                        <td>
                          {inverters.length > 0
                            ? firstValue(inverters[0]?.name, inverters[0]?.model, inverters[0]?.brand, "Configured")
                            : firstValue(item?.inverter?.name, item?.inverter?.model, item?.inverter?.brand, "—")}
                        </td>

                        {/* Battery */}
                        <td>
                          {getItemCount(item, "batteries") > 0
                            ? getItemCount(item, "batteries")
                            : firstValue(item?.battery?.name, item?.battery?.model, item?.battery?.brand, "—")}
                        </td>

                        {/* Status */}
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

                        {/* Created */}
                        <td>
                          {formatDate(
                            item?.createdAt
                          )}
                        </td>

                        {/* Action */}
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

        {/* Pagination */}
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

      {/* Details Modal */}
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
            {/* Modal Header */}
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
                  setSelectedConfiguration(null)
                }
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
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
                  <span>Customer Phone</span>
                  <strong>{getCustomerPhone(selectedConfiguration)}</strong>
                </div>

                <div>
                  <span>Customer Email</span>
                  <strong>{getCustomerEmail(selectedConfiguration)}</strong>
                </div>

                <div>
                  <span>Created</span>
                  <strong>{formatDate(selectedConfiguration?.createdAt || selectedConfiguration?.createdOn)}</strong>
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
                    ).replaceAll("_", " ")}
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
                      selectedConfiguration?.inverter?.brand ||
                      getItems(selectedConfiguration, "inverters")[0]?.name ||
                      getItems(selectedConfiguration, "inverters")[0]?.model ||
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
                      selectedConfiguration?.battery?.brand ||
                      getItems(selectedConfiguration, "batteries")[0]?.name ||
                      getItems(selectedConfiguration, "batteries")[0]?.model ||
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

              {/* Components */}
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
                ].map(([title, items]) => (
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
                ))}
              </div>

              {/* Total */}
              <div className="manager-configuration-total">
                <span>Grand Total</span>

                <strong>
                  {formatCurrency(
                    selectedConfiguration
                      ?.grandTotal ||
                      selectedConfiguration
                        ?.total ||
                      selectedConfiguration
                        ?.grandAmount ||
                      selectedConfiguration?.totalAmount ||
                      selectedConfiguration?.estimatedCost ||
                      selectedConfiguration?.price
                  )}
                </strong>
              </div>

              <div className="manager-configuration-notes">
                <span>Site Address / Location</span>
                <p>
                  {firstValue(
                    selectedConfiguration?.siteAddress,
                    selectedConfiguration?.address,
                    selectedConfiguration?.location,
                    selectedConfiguration?.customer?.address,
                    "No site address available."
                  )}
                </p>
              </div>

              {/* Notes */}
              <div className="manager-configuration-notes">
                <span>Notes</span>

                <p>
                  {selectedConfiguration?.notes ||
                    selectedConfiguration?.remarks ||
                    "No additional notes available."}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="manager-configuration-modal-footer">
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  setSelectedConfiguration(null)
                }
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerSystemConfigurationsPage;