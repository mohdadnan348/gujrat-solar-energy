"use client";

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useParams, useRouter } from "next/navigation";

import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import Loader from "@/components/common/Loader";

import systemConfigurationService from "@/services/systemConfiguration.service";

import "./configuration-details.css";

/* =========================================================
   SAFE HELPERS
========================================================= */

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

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
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
      value?.employeeId ||
      value?.username ||
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
    const value =
      object?.[key];

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

const getId = (
  item
) => {
  if (!item) {
    return "";
  }

  if (
    typeof item === "string"
  ) {
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

const unwrapResponse = (
  response
) => {
  if (!response) {
    return null;
  }

  if (
    response?.data?.data
  ) {
    return response.data.data;
  }

  if (
    response?.data
  ) {
    return response.data;
  }

  return response;
};

/* =========================================================
   DATE
========================================================= */

const formatDate = (
  value,
  withTime = false
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
    return displayValue(
      value
    );
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      ...(withTime
        ? {
            hour: "2-digit",
            minute: "2-digit",
          }
        : {}),
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
    displayValue(
      status,
      ""
    ).toUpperCase();

  if (
    normalized ===
      "ACTIVE" ||
    normalized ===
      "APPROVED" ||
    normalized ===
      "COMPLETED" ||
    normalized ===
      "CONFIGURED"
  ) {
    return "success";
  }

  if (
    normalized ===
      "PENDING" ||
    normalized ===
      "DRAFT" ||
    normalized ===
      "IN_PROGRESS"
  ) {
    return "warning";
  }

  if (
    normalized ===
      "REJECTED" ||
    normalized ===
      "CANCELLED" ||
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

const SystemConfigurationDetailsPage =
  () => {
    const router =
      useRouter();

    const params =
      useParams();

    const configurationId =
      params?.id;

    const [
      configuration,
      setConfiguration,
    ] = useState(null);

    const [
      loading,
      setLoading,
    ] = useState(true);

    const [
      error,
      setError,
    ] = useState("");

    /* =====================================================
       LOAD CONFIGURATION
    ===================================================== */

    const loadConfiguration =
      async () => {
        if (
          !configurationId
        ) {
          return;
        }

        try {
          setLoading(true);
          setError("");

          const response =
            await systemConfigurationService.getSystemConfigurationById(
              configurationId
            );

          const data =
            unwrapResponse(
              response
            );

          if (!data) {
            throw new Error(
              "System configuration nahi mili."
            );
          }

          setConfiguration(
            data
          );
        } catch (err) {
          console.error(
            "Failed to load system configuration:",
            err
          );

          setConfiguration(
            null
          );

          setError(
            err?.response
              ?.data?.message ||
              err?.message ||
              "System configuration details load nahi ho paaye."
          );
        } finally {
          setLoading(false);
        }
      };

    useEffect(() => {
      loadConfiguration();
    }, [
      configurationId,
    ]);

    /* =====================================================
       DATA
    ===================================================== */

    const data =
      configuration;

    /* =====================================================
       SUMMARY
    ===================================================== */

    const summary =
      useMemo(() => {
        if (!data) {
          return {
            capacity: "—",
            panels: "—",
            inverter: "—",
            systemType: "—",
          };
        }

        return {
          capacity:
            getValue(
              data,
              [
                "systemSizeKW",
                "requiredKW",
                "capacityKW",
                "systemCapacity",
              ],
              "—"
            ),

          panels:
            getValue(
              data,
              [
                "panelCount",
                "numberOfPanels",
                "panelsCount",
                "totalPanels",
              ],
              "—"
            ),

          inverter:
            displayValue(
              getValue(
                data,
                [
                  "inverterCapacity",
                  "inverterSize",
                  "inverter",
                ],
                "—"
              )
            ),

          systemType:
            displayValue(
              getValue(
                data,
                [
                  "systemType",
                  "system_type",
                  "type",
                ],
                "—"
              )
            ),
        };
      }, [data]);

    /* =====================================================
       LOADING
    ===================================================== */

    if (loading) {
      return (
        <div className="admin-configuration-details-loading">
          <Loader />
        </div>
      );
    }

    /* =====================================================
       ERROR
    ===================================================== */

    if (
      error ||
      !configuration
    ) {
      return (
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
                onClick={
                  loadConfiguration
                }
              >
                Try Again
              </Button>

            </div>

          </div>

        </div>
      );
    }

    /* =====================================================
       BASIC DATA
    ===================================================== */

    const id =
      getId(data);

    const configurationNumber =
      safeValue(
        data,
        [
          "configurationNumber",
          "configurationNo",
          "configNumber",
          "number",
        ],
        id
          ? `CONFIG-${String(
              id
            ).slice(-6)}`
          : "Configuration"
      );

    const status =
      safeValue(
        data,
        ["status"],
        "—"
      );

    const customerName =
      displayValue(
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

    const leadName =
      displayValue(
        getValue(
          data,
          [
            "leadName",
            "lead",
            "leadId",
          ],
          null
        )
      );

    const solarRequirement =
      getValue(
        data,
        [
          "solarRequirementId",
          "solarRequirement",
          "requirementId",
        ],
        null
      );

    const solarRequirementName =
      displayValue(
        solarRequirement
      );

    const createdBy =
      displayValue(
        getValue(
          data,
          [
            "createdBy",
            "createdByName",
            "creator",
          ],
          null
        )
      );

    const updatedBy =
      displayValue(
        getValue(
          data,
          [
            "updatedBy",
            "updatedByName",
            "updater",
          ],
          null
        )
      );

    /* =====================================================
       BATTERY
    ===================================================== */

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
      batteryRequired ===
        true ||
      String(
        batteryRequired
      ).toUpperCase() ===
        "YES";

    /* =====================================================
       PANEL DATA
    ===================================================== */

    const panelMake =
      safeValue(
        data,
        [
          "panelMake",
          "panelBrand",
          "moduleMake",
          "moduleBrand",
        ]
      );

    const panelWattage =
      safeValue(
        data,
        [
          "panelWattage",
          "wattage",
          "panelWp",
        ]
      );

    const panelCount =
      getValue(
        data,
        [
          "panelCount",
          "numberOfPanels",
          "panelsCount",
          "totalPanels",
        ],
        ""
      );

    /* =====================================================
       INVERTER DATA
    ===================================================== */

    const inverterMake =
      safeValue(
        data,
        [
          "inverterMake",
          "inverterBrand",
        ]
      );

    const inverterCapacity =
      displayValue(
        getValue(
          data,
          [
            "inverterCapacity",
            "inverterSize",
          ],
          "—"
        )
      );

    const inverterCount =
      safeValue(
        data,
        [
          "inverterCount",
          "numberOfInverters",
        ]
      );

    /* =====================================================
       BATTERY DATA
    ===================================================== */

    const batteryCapacity =
      safeValue(
        data,
        [
          "batteryCapacity",
          "batterySize",
        ]
      );

    /* =====================================================
       TECHNICAL DATA
    ===================================================== */

    const mountingStructure =
      safeValue(
        data,
        [
          "mountingStructure",
          "structure",
          "mountingType",
        ]
      );

    const cableSpecification =
      safeValue(
        data,
        [
          "cableSpecification",
          "cable",
          "cableSize",
        ]
      );

    const earthing =
      safeValue(
        data,
        [
          "earthing",
          "earthingSpecification",
        ]
      );

    const protection =
      safeValue(
        data,
        [
          "protection",
          "protectionSystem",
        ]
      );

    const installationType =
      safeValue(
        data,
        [
          "installationType",
          "installation",
        ]
      );

    /* =====================================================
       GENERATION
    ===================================================== */

    const generationEstimate =
      safeValue(
        data,
        [
          "generationEstimate",
          "estimatedGeneration",
          "dailyGeneration",
        ]
      );

    const annualGeneration =
      safeValue(
        data,
        [
          "annualGeneration",
          "yearlyGeneration",
        ]
      );

    /* =====================================================
       NOTES
    ===================================================== */

    const notes =
      displayValue(
        getValue(
          data,
          [
            "notes",
            "remarks",
            "description",
          ],
          ""
        ),
        ""
      );

    /* =====================================================
       RENDER
    ===================================================== */

    return (
      <div className="admin-configuration-details-page">

        {/* =================================================
            HEADER
        ================================================= */}

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
                    variant={getStatusVariant(
                      status
                    )}
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
              onClick={
                loadConfiguration
              }
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

        {/* =================================================
            SUMMARY CARDS
        ================================================= */}

        <div className="admin-configuration-summary-grid">

          <div className="admin-configuration-summary-card">

            <div className="admin-configuration-summary-icon green">
              ⚡
            </div>

            <div>

              <span>
                System Capacity
              </span>

              <strong>
                {formatNumber(
                  summary.capacity
                )}{" "}
                kW
              </strong>

            </div>

          </div>

          <div className="admin-configuration-summary-card">

            <div className="admin-configuration-summary-icon blue">
              ▦
            </div>

            <div>

              <span>
                Solar Panels
              </span>

              <strong>
                {formatNumber(
                  summary.panels
                )}
              </strong>

            </div>

          </div>

          <div className="admin-configuration-summary-card">

            <div className="admin-configuration-summary-icon orange">
              ◈
            </div>

            <div>

              <span>
                Inverter
              </span>

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

              <span>
                System Type
              </span>

              <strong>
                {summary.systemType}
              </strong>

            </div>

          </div>

        </div>

        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="admin-configuration-details-layout">

          {/* =================================================
              MAIN
          ================================================= */}

          <main className="admin-configuration-details-main">

            {/* CUSTOMER */}

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

                  <span>
                    Customer Name
                  </span>

                  <strong>
                    {customerName}
                  </strong>

                </div>

                <div>

                  <span>
                    Lead
                  </span>

                  <strong>
                    {leadName}
                  </strong>

                </div>

                <div>

                  <span>
                    Solar Requirement ID
                  </span>

                  <strong>
                    {solarRequirementName}
                  </strong>

                </div>

                <div>

                  <span>
                    Configuration Status
                  </span>

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

            {/* SOLAR PANEL */}

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

                  <span>
                    Panel Make
                  </span>

                  <strong>
                    {panelMake}
                  </strong>

                </div>

                <div>

                  <span>
                    Panel Wattage
                  </span>

                  <strong>
                    {panelWattage !==
                    "—"
                      ? `${panelWattage} W`
                      : "—"}
                  </strong>

                </div>

                <div>

                  <span>
                    Total Panels
                  </span>

                  <strong>
                    {formatNumber(
                      panelCount
                    )}
                  </strong>

                </div>

                <div>

                  <span>
                    Panel Capacity
                  </span>

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

            {/* INVERTER */}

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

                  <span>
                    Inverter Make
                  </span>

                  <strong>
                    {inverterMake}
                  </strong>

                </div>

                <div>

                  <span>
                    Inverter Capacity
                  </span>

                  <strong>
                    {inverterCapacity}
                  </strong>

                </div>

                <div>

                  <span>
                    Inverter Count
                  </span>

                  <strong>
                    {inverterCount}
                  </strong>

                </div>

                <div>

                  <span>
                    System Type
                  </span>

                  <strong>
                    {summary.systemType}
                  </strong>

                </div>

              </div>

            </section>

            {/* BATTERY */}

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

                  <span>
                    Battery Required
                  </span>

                  <strong>
                    {isBatteryRequired
                      ? "Yes"
                      : "No"}
                  </strong>

                </div>

                <div>

                  <span>
                    Battery Capacity
                  </span>

                  <strong>
                    {batteryCapacity}
                  </strong>

                </div>

              </div>

            </section>

            {/* TECHNICAL */}

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

                  <span>
                    Mounting Structure
                  </span>

                  <strong>
                    {mountingStructure}
                  </strong>

                </div>

                <div>

                  <span>
                    Cable Specification
                  </span>

                  <strong>
                    {cableSpecification}
                  </strong>

                </div>

                <div>

                  <span>
                    Earthing
                  </span>

                  <strong>
                    {earthing}
                  </strong>

                </div>

                <div>

                  <span>
                    Protection
                  </span>

                  <strong>
                    {protection}
                  </strong>

                </div>

                <div>

                  <span>
                    Installation Type
                  </span>

                  <strong>
                    {installationType}
                  </strong>

                </div>

              </div>

            </section>

            {/* GENERATION */}

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

                  <span>
                    Generation Estimate
                  </span>

                  <strong>
                    {generationEstimate}
                  </strong>

                </div>

                <div>

                  <span>
                    Annual Generation
                  </span>

                  <strong>
                    {annualGeneration}
                  </strong>

                </div>

              </div>

            </section>

            {/* NOTES */}

            <section className="admin-configuration-detail-card">

              <div className="admin-configuration-card-header">

                <div>

                  <h2>
                    Additional Notes
                  </h2>

                  <p>
                    Configuration se related additional
                    information.
                  </p>

                </div>

              </div>

              <div className="admin-configuration-notes">

                {notes ? (
                  <p>
                    {notes}
                  </p>
                ) : (
                  <span>
                    No additional notes available.
                  </span>
                )}

              </div>

            </section>

          </main>

          {/* =================================================
              SIDEBAR
          ================================================= */}

          <aside className="admin-configuration-details-sidebar">

            {/* SUMMARY */}

            <section className="admin-configuration-detail-card">

              <div className="admin-configuration-card-header">

                <div>

                  <h2>
                    Configuration Summary
                  </h2>

                </div>

              </div>

              <div className="admin-configuration-summary-list">

                <div>

                  <span>
                    Configuration ID
                  </span>

                  <strong>
                    {id || "—"}
                  </strong>

                </div>

                <div>

                  <span>
                    System Type
                  </span>

                  <strong>
                    {summary.systemType}
                  </strong>

                </div>

                <div>

                  <span>
                    System Size
                  </span>

                  <strong>
                    {formatNumber(
                      summary.capacity
                    )}{" "}
                    kW
                  </strong>

                </div>

                <div>

                  <span>
                    Panel Count
                  </span>

                  <strong>
                    {formatNumber(
                      summary.panels
                    )}
                  </strong>

                </div>

                <div>

                  <span>
                    Battery
                  </span>

                  <strong>
                    {isBatteryRequired
                      ? "Required"
                      : "Not Required"}
                  </strong>

                </div>

                <div>

                  <span>
                    Status
                  </span>

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

            {/* RECORD INFO */}

            <section className="admin-configuration-detail-card">

              <div className="admin-configuration-card-header">

                <div>

                  <h2>
                    Record Information
                  </h2>

                </div>

              </div>

              <div className="admin-configuration-record-info">

                <div>

                  <span>
                    Created By
                  </span>

                  <strong>
                    {createdBy}
                  </strong>

                </div>

                <div>

                  <span>
                    Created At
                  </span>

                  <strong>
                    {formatDate(
                      getValue(
                        data,
                        [
                          "createdAt",
                        ],
                        null
                      ),
                      true
                    )}
                  </strong>

                </div>

                <div>

                  <span>
                    Updated By
                  </span>

                  <strong>
                    {updatedBy}
                  </strong>

                </div>

                <div>

                  <span>
                    Updated At
                  </span>

                  <strong>
                    {formatDate(
                      getValue(
                        data,
                        [
                          "updatedAt",
                        ],
                        null
                      ),
                      true
                    )}
                  </strong>

                </div>

              </div>

            </section>

            {/* QUOTATION ACTION */}

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

        {/* =================================================
            BOTTOM ACTION
        ================================================= */}

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
    );
  };

export default SystemConfigurationDetailsPage;