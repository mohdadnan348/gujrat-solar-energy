"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import AdminLayout from "../../layout";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import Loader from "@/components/common/Loader";
import { useAuth } from "@/hooks/useAuth";
import { systemConfigurationService } from "@/services/systemConfiguration.service";

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

const unwrapResponse = (response) => {
  if (!response) return null;

  if (response?.data?.data) {
    return response.data.data;
  }

  if (response?.data) {
    return response.data;
  }

  return response;
};

const formatDate = (value, withTime = false) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(withTime
      ? {
          hour: "2-digit",
          minute: "2-digit",
        }
      : {}),
  });
};

const formatNumber = (value) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return "—";
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return String(value);
  }

  return number.toLocaleString("en-IN");
};

const getStatusVariant = (status) => {
  const normalized = String(status || "").toUpperCase();

  if (
    normalized === "ACTIVE" ||
    normalized === "APPROVED" ||
    normalized === "COMPLETED"
  ) {
    return "success";
  }

  if (
    normalized === "PENDING" ||
    normalized === "DRAFT" ||
    normalized === "IN_PROGRESS"
  ) {
    return "warning";
  }

  if (
    normalized === "REJECTED" ||
    normalized === "CANCELLED" ||
    normalized === "INACTIVE"
  ) {
    return "danger";
  }

  return "default";
};

const getNestedName = (value) => {
  if (!value) return "—";

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "object") {
    return (
      value?.name ||
      value?.fullName ||
      value?.customerName ||
      value?.companyName ||
      value?._id ||
      "—"
    );
  }

  return String(value);
};

const SystemConfigurationDetailsPage = () => {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useAuth();

  const configurationId = params?.id;

  const [configuration, setConfiguration] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadConfiguration = async () => {
    if (!configurationId) return;

    try {
      setLoading(true);
      setError("");

      const response =
        await systemConfigurationService.getSystemConfigurationById(
          configurationId
        );

      const data = unwrapResponse(response);

      if (!data) {
        throw new Error(
          "System configuration nahi mili."
        );
      }

      setConfiguration(data);
    } catch (err) {
      console.error(
        "Failed to load system configuration:",
        err
      );

      setError(
        err?.message ||
          "System configuration details load nahi ho paaye."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user && configurationId) {
      loadConfiguration();
    }
  }, [authLoading, user, configurationId]);

  const data = configuration;

  const summary = useMemo(() => {
    if (!data) {
      return {
        capacity: "—",
        panels: "—",
        inverter: "—",
        systemType: "—",
      };
    }

    return {
      capacity: getValue(
        data,
        [
          "systemSizeKW",
          "requiredKW",
          "capacityKW",
          "systemCapacity",
        ],
        "—"
      ),
      panels: getValue(
        data,
        [
          "panelCount",
          "numberOfPanels",
          "panelsCount",
          "totalPanels",
        ],
        "—"
      ),
      inverter: getValue(
        data,
        [
          "inverterCapacity",
          "inverterSize",
          "inverter",
        ],
        "—"
      ),
      systemType: getValue(
        data,
        ["systemType", "system_type", "type"],
        "—"
      ),
    };
  }, [data]);

  if (authLoading || loading) {
    return (
      <AdminLayout>
        <div className="admin-configuration-details-loading">
          <Loader />
        </div>
      </AdminLayout>
    );
  }

  if (error || !configuration) {
    return (
      <AdminLayout>
        <div className="admin-configuration-details-page">
          <div className="admin-configuration-details-error">
            <div className="admin-configuration-error-icon">
              !
            </div>

            <h2>
              Configuration Not Found
            </h2>

            <p>
              {error ||
                "Requested system configuration available nahi hai."}
            </p>

            <div className="admin-configuration-error-actions">
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  router.push(
                    "/admin/system-configurations"
                  )
                }
              >
                ← Back to Configurations
              </Button>

              <Button
                type="button"
                variant="primary"
                onClick={loadConfiguration}
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const id = getId(data);

  const configurationNumber = getValue(
    data,
    [
      "configurationNumber",
      "configurationNo",
      "configNumber",
      "number",
    ],
    id ? `CONFIG-${String(id).slice(-6)}` : "Configuration"
  );

  const status = getValue(
    data,
    ["status"],
    "—"
  );

  const customerName = getNestedName(
    getValue(
      data,
      [
        "customerName",
        "customer",
        "customerId",
        "name",
      ],
      null
    )
  );

  const leadName = getNestedName(
    getValue(
      data,
      ["leadName", "lead", "leadId"],
      null
    )
  );

  const createdBy = getNestedName(
    getValue(
      data,
      ["createdBy", "createdByName", "creator"],
      null
    )
  );

  const updatedBy = getNestedName(
    getValue(
      data,
      ["updatedBy", "updatedByName", "updater"],
      null
    )
  );

  const batteryRequired =
    getValue(
      data,
      [
        "batteryRequired",
        "batteryRequirement",
        "battery",
      ],
      false
    );

  const isBatteryRequired =
    batteryRequired === true ||
    String(batteryRequired).toUpperCase() ===
      "YES";

  return (
    <AdminLayout>
      <div className="admin-configuration-details-page">
        {/* Header */}
        <div className="admin-configuration-details-header">
          <div>
            <button
              type="button"
              className="admin-configuration-back"
              onClick={() =>
                router.push(
                  "/admin/system-configurations"
                )
              }
            >
              ← Back to System Configurations
            </button>

            <div className="admin-configuration-title-row">
              <div className="admin-configuration-title-icon">
                ⚡
              </div>

              <div>
                <div className="admin-configuration-title-line">
                  <h1>
                    {configurationNumber}
                  </h1>

                  <Badge
                    variant={getStatusVariant(status)}
                  >
                    {status}
                  </Badge>
                </div>

                <p>
                  System configuration details and
                  technical specifications
                </p>
              </div>
            </div>
          </div>

          <div className="admin-configuration-header-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={loadConfiguration}
            >
              ↻ Refresh
            </Button>

            <Button
              type="button"
              variant="primary"
              onClick={() =>
                router.push(
                  "/admin/system-configurations"
                )
              }
            >
              All Configurations
            </Button>
          </div>
        </div>

        {/* Summary */}
        <div className="admin-configuration-summary-grid">
          <div className="admin-configuration-summary-card">
            <div className="admin-configuration-summary-icon green">
              ⚡
            </div>

            <div>
              <span>System Capacity</span>
              <strong>
                {formatNumber(summary.capacity)} kW
              </strong>
            </div>
          </div>

          <div className="admin-configuration-summary-card">
            <div className="admin-configuration-summary-icon blue">
              ▦
            </div>

            <div>
              <span>Solar Panels</span>
              <strong>
                {formatNumber(summary.panels)}
              </strong>
            </div>
          </div>

          <div className="admin-configuration-summary-card">
            <div className="admin-configuration-summary-icon orange">
              ◈
            </div>

            <div>
              <span>Inverter</span>
              <strong>
                {summary.inverter}
              </strong>
            </div>
          </div>

          <div className="admin-configuration-summary-card">
            <div className="admin-configuration-summary-icon purple">
              ☀
            </div>

            <div>
              <span>System Type</span>
              <strong>
                {summary.systemType}
              </strong>
            </div>
          </div>
        </div>

        <div className="admin-configuration-details-layout">
          {/* Main */}
          <main className="admin-configuration-details-main">
            {/* Customer */}
            <section className="admin-configuration-detail-card">
              <div className="admin-configuration-card-header">
                <div>
                  <h2>
                    Customer & Requirement
                  </h2>
                  <p>
                    Configuration kis customer aur
                    requirement ke liye hai.
                  </p>
                </div>
              </div>

              <div className="admin-configuration-detail-grid">
                <div>
                  <span>Customer Name</span>
                  <strong>
                    {customerName}
                  </strong>
                </div>

                <div>
                  <span>Lead</span>
                  <strong>
                    {leadName}
                  </strong>
                </div>

                <div>
                  <span>Solar Requirement ID</span>
                  <strong>
                    {getNestedName(
                      getValue(
                        data,
                        [
                          "solarRequirementId",
                          "solarRequirement",
                          "requirementId",
                        ],
                        null
                      )
                    )}
                  </strong>
                </div>

                <div>
                  <span>Configuration Status</span>
                  <strong>
                    <Badge
                      variant={getStatusVariant(
                        status
                      )}
                    >
                      {status}
                    </Badge>
                  </strong>
                </div>
              </div>
            </section>

            {/* Solar Panel */}
            <section className="admin-configuration-detail-card">
              <div className="admin-configuration-card-header">
                <div>
                  <h2>
                    Solar Panel Configuration
                  </h2>
                  <p>
                    Solar panel selection aur quantity.
                  </p>
                </div>
              </div>

              <div className="admin-configuration-detail-grid">
                <div>
                  <span>Panel Make</span>
                  <strong>
                    {getValue(
                      data,
                      [
                        "panelMake",
                        "panelBrand",
                        "moduleMake",
                        "moduleBrand",
                      ]
                    )}
                  </strong>
                </div>

                <div>
                  <span>Panel Wattage</span>
                  <strong>
                    {getValue(
                      data,
                      [
                        "panelWattage",
                        "wattage",
                        "panelWp",
                      ]
                    )}
                    {getValue(
                      data,
                      [
                        "panelWattage",
                        "wattage",
                        "panelWp",
                      ],
                      ""
                    ) !== "—"
                      ? " W"
                      : ""}
                  </strong>
                </div>

                <div>
                  <span>Total Panels</span>
                  <strong>
                    {formatNumber(
                      getValue(
                        data,
                        [
                          "panelCount",
                          "numberOfPanels",
                          "panelsCount",
                          "totalPanels",
                        ],
                        ""
                      )
                    )}
                  </strong>
                </div>

                <div>
                  <span>Panel Capacity</span>
                  <strong>
                    {formatNumber(
                      getValue(
                        data,
                        [
                          "systemSizeKW",
                          "requiredKW",
                          "capacityKW",
                        ],
                        ""
                      )
                    )}{" "}
                    kW
                  </strong>
                </div>
              </div>
            </section>

            {/* Inverter */}
            <section className="admin-configuration-detail-card">
              <div className="admin-configuration-card-header">
                <div>
                  <h2>
                    Inverter Configuration
                  </h2>
                  <p>
                    Inverter make, capacity aur quantity.
                  </p>
                </div>
              </div>

              <div className="admin-configuration-detail-grid">
                <div>
                  <span>Inverter Make</span>
                  <strong>
                    {getValue(
                      data,
                      [
                        "inverterMake",
                        "inverterBrand",
                      ]
                    )}
                  </strong>
                </div>

                <div>
                  <span>Inverter Capacity</span>
                  <strong>
                    {getValue(
                      data,
                      [
                        "inverterCapacity",
                        "inverterSize",
                      ]
                    )}
                  </strong>
                </div>

                <div>
                  <span>Inverter Count</span>
                  <strong>
                    {getValue(
                      data,
                      [
                        "inverterCount",
                        "numberOfInverters",
                      ]
                    )}
                  </strong>
                </div>

                <div>
                  <span>System Type</span>
                  <strong>
                    {summary.systemType}
                  </strong>
                </div>
              </div>
            </section>

            {/* Battery */}
            <section className="admin-configuration-detail-card">
              <div className="admin-configuration-card-header">
                <div>
                  <h2>
                    Battery Configuration
                  </h2>
                  <p>
                    Backup battery requirement details.
                  </p>
                </div>
              </div>

              <div className="admin-configuration-detail-grid">
                <div>
                  <span>Battery Required</span>
                  <strong>
                    {isBatteryRequired
                      ? "Yes"
                      : "No"}
                  </strong>
                </div>

                <div>
                  <span>Battery Capacity</span>
                  <strong>
                    {getValue(
                      data,
                      [
                        "batteryCapacity",
                        "batterySize",
                      ]
                    )}
                  </strong>
                </div>
              </div>
            </section>

            {/* Technical */}
            <section className="admin-configuration-detail-card">
              <div className="admin-configuration-card-header">
                <div>
                  <h2>
                    Technical Specifications
                  </h2>
                  <p>
                    Installation aur electrical
                    specifications.
                  </p>
                </div>
              </div>

              <div className="admin-configuration-detail-grid">
                <div>
                  <span>Mounting Structure</span>
                  <strong>
                    {getValue(
                      data,
                      [
                        "mountingStructure",
                        "structure",
                        "mountingType",
                      ]
                    )}
                  </strong>
                </div>

                <div>
                  <span>Cable Specification</span>
                  <strong>
                    {getValue(
                      data,
                      [
                        "cableSpecification",
                        "cable",
                        "cableSize",
                      ]
                    )}
                  </strong>
                </div>

                <div>
                  <span>Earthing</span>
                  <strong>
                    {getValue(
                      data,
                      [
                        "earthing",
                        "earthingSpecification",
                      ]
                    )}
                  </strong>
                </div>

                <div>
                  <span>Protection</span>
                  <strong>
                    {getValue(
                      data,
                      [
                        "protection",
                        "protectionSystem",
                      ]
                    )}
                  </strong>
                </div>

                <div>
                  <span>Installation Type</span>
                  <strong>
                    {getValue(
                      data,
                      [
                        "installationType",
                        "installation",
                      ]
                    )}
                  </strong>
                </div>
              </div>
            </section>

            {/* Generation */}
            <section className="admin-configuration-detail-card">
              <div className="admin-configuration-card-header">
                <div>
                  <h2>
                    Generation Estimate
                  </h2>
                  <p>
                    Expected solar generation information.
                  </p>
                </div>
              </div>

              <div className="admin-configuration-detail-grid">
                <div>
                  <span>Generation Estimate</span>
                  <strong>
                    {getValue(
                      data,
                      [
                        "generationEstimate",
                        "estimatedGeneration",
                        "dailyGeneration",
                      ]
                    )}
                  </strong>
                </div>

                <div>
                  <span>Annual Generation</span>
                  <strong>
                    {getValue(
                      data,
                      [
                        "annualGeneration",
                        "yearlyGeneration",
                      ]
                    )}
                  </strong>
                </div>
              </div>
            </section>

            {/* Notes */}
            <section className="admin-configuration-detail-card">
              <div className="admin-configuration-card-header">
                <div>
                  <h2>Additional Notes</h2>
                  <p>
                    Configuration se related additional
                    information.
                  </p>
                </div>
              </div>

              <div className="admin-configuration-notes">
                {getValue(
                  data,
                  ["notes", "remarks", "description"],
                  ""
                ) ? (
                  <p>
                    {getValue(
                      data,
                      [
                        "notes",
                        "remarks",
                        "description",
                      ],
                      ""
                    )}
                  </p>
                ) : (
                  <span>
                    No additional notes available.
                  </span>
                )}
              </div>
            </section>
          </main>

          {/* Sidebar */}
          <aside className="admin-configuration-details-sidebar">
            <section className="admin-configuration-detail-card">
              <div className="admin-configuration-card-header">
                <div>
                  <h2>Configuration Summary</h2>
                </div>
              </div>

              <div className="admin-configuration-summary-list">
                <div>
                  <span>Configuration ID</span>
                  <strong>
                    {id || "—"}
                  </strong>
                </div>

                <div>
                  <span>System Type</span>
                  <strong>
                    {summary.systemType}
                  </strong>
                </div>

                <div>
                  <span>System Size</span>
                  <strong>
                    {formatNumber(
                      summary.capacity
                    )}{" "}
                    kW
                  </strong>
                </div>

                <div>
                  <span>Panel Count</span>
                  <strong>
                    {formatNumber(
                      summary.panels
                    )}
                  </strong>
                </div>

                <div>
                  <span>Battery</span>
                  <strong>
                    {isBatteryRequired
                      ? "Required"
                      : "Not Required"}
                  </strong>
                </div>

                <div>
                  <span>Status</span>
                  <strong>
                    <Badge
                      variant={getStatusVariant(
                        status
                      )}
                    >
                      {status}
                    </Badge>
                  </strong>
                </div>
              </div>
            </section>

            <section className="admin-configuration-detail-card">
              <div className="admin-configuration-card-header">
                <div>
                  <h2>Record Information</h2>
                </div>
              </div>

              <div className="admin-configuration-record-info">
                <div>
                  <span>Created By</span>
                  <strong>
                    {createdBy}
                  </strong>
                </div>

                <div>
                  <span>Created At</span>
                  <strong>
                    {formatDate(
                      getValue(
                        data,
                        ["createdAt"],
                        null
                      ),
                      true
                    )}
                  </strong>
                </div>

                <div>
                  <span>Updated By</span>
                  <strong>
                    {updatedBy}
                  </strong>
                </div>

                <div>
                  <span>Updated At</span>
                  <strong>
                    {formatDate(
                      getValue(
                        data,
                        ["updatedAt"],
                        null
                      ),
                      true
                    )}
                  </strong>
                </div>
              </div>
            </section>

            <section className="admin-configuration-detail-card">
              <div className="admin-configuration-sidebar-action">
                <div className="admin-configuration-sidebar-action-icon">
                  ☀
                </div>

                <h3>
                  Solar System Configuration
                </h3>

                <p>
                  Is configuration ko quotation aur
                  further operations ke liye use kiya
                  ja sakta hai.
                </p>

                <Button
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    router.push(
                      "/admin/quotations/create"
                    )
                  }
                >
                  Create Quotation
                </Button>
              </div>
            </section>
          </aside>
        </div>

        <div className="admin-configuration-bottom-actions">
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              router.push(
                "/admin/system-configurations"
              )
            }
          >
            ← Back to All Configurations
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SystemConfigurationDetailsPage;