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

const displayValue = (value, fallback = "—") => {
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
    getValue(object, keys, fallback),
    fallback
  );
};

const getId = (item) => {
  if (!item) {
    return "";
  }

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

const unwrapResponse = (response) => {
  if (!response) {
    return null;
  }

  if (response?.data?.data) {
    return response.data.data;
  }

  if (response?.data) {
    return response.data;
  }

  return response;
};

/* =========================================================
   NUMBER
========================================================= */

const formatNumber = (value) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return "—";
  }

  if (typeof value === "object") {
    return "—";
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return displayValue(value);
  }

  return number.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });
};

/* =========================================================
   CURRENCY
========================================================= */

const formatCurrency = (value) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return "₹0";
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return "₹0";
  }

  return `₹${number.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
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

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return displayValue(value);
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
   STATUS
========================================================= */

const getStatusVariant = (status) => {
  const normalized = displayValue(
    status,
    ""
  ).toUpperCase();

  if (
    normalized === "ACTIVE" ||
    normalized === "APPROVED" ||
    normalized === "COMPLETED" ||
    normalized === "CONFIGURED"
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

/* =========================================================
   SYSTEM TYPE LABEL
========================================================= */

const formatSystemType = (value) => {
  if (!value) {
    return "—";
  }

  return String(value)
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
};

/* =========================================================
   COMPONENT FINDER
========================================================= */

const findComponent = (
  components,
  type
) => {
  if (!Array.isArray(components)) {
    return null;
  }

  return (
    components.find(
      (component) =>
        String(
          component?.componentType || ""
        ).toUpperCase() === type
    ) || null
  );
};

/* =========================================================
   NOTES PARSER
========================================================= */

const parseNotes = (notes) => {
  const result = {
    installationType: "",
    generationEstimate: "",
    annualGeneration: "",
  };

  if (!notes) {
    return result;
  }

  const text = String(notes);

  const installationMatch =
    text.match(
      /Installation Type:\s*(.*?)(?=\n|$)/i
    );

  const generationMatch =
    text.match(
      /Generation Estimate:\s*(.*?)(?=\n|$)/i
    );

  const annualMatch =
    text.match(
      /Annual Generation:\s*(.*?)(?=\n|$)/i
    );

  if (installationMatch?.[1]) {
    result.installationType =
      installationMatch[1].trim();
  }

  if (generationMatch?.[1]) {
    result.generationEstimate =
      generationMatch[1].trim();
  }

  if (annualMatch?.[1]) {
    result.annualGeneration =
      annualMatch[1].trim();
  }

  return result;
};

/* =========================================================
   REMOVE GENERATED META FROM NOTES
========================================================= */

const cleanNotes = (notes) => {
  if (!notes) {
    return "";
  }

  const cleaned = String(notes)
    .replace(
      /Installation Type:\s*.*?(?=\n|$)/gi,
      ""
    )
    .replace(
      /Generation Estimate:\s*.*?(?=\n|$)/gi,
      ""
    )
    .replace(
      /Annual Generation:\s*.*?(?=\n|$)/gi,
      ""
    )
    .replace(/\n{2,}/g, "\n")
    .trim();

  return cleaned;
};

/* =========================================================
   PAGE
========================================================= */

const SystemConfigurationDetailsPage = () => {
  const router = useRouter();

  const params = useParams();

  const configurationId = params?.id;

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

  /* =======================================================
     LOAD CONFIGURATION
  ======================================================= */

  const loadConfiguration = async () => {
    if (!configurationId) {
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
        unwrapResponse(response);

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

      setConfiguration(null);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "System configuration details load nahi ho paaye."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfiguration();
  }, [configurationId]);

  /* =======================================================
     DATA
  ======================================================= */

  const data = configuration;

  /* =======================================================
     COMPONENTS
  ======================================================= */

  const components = useMemo(() => {
    if (!Array.isArray(data?.components)) {
      return [];
    }

    return data.components;
  }, [data]);

  const panelComponent = useMemo(
    () =>
      findComponent(
        components,
        "SOLAR_PANEL"
      ),
    [components]
  );

  const inverterComponent = useMemo(
    () =>
      findComponent(
        components,
        "INVERTER"
      ),
    [components]
  );

  const batteryComponent = useMemo(
    () =>
      findComponent(
        components,
        "BATTERY"
      ),
    [components]
  );

  const structureComponent = useMemo(
    () =>
      findComponent(
        components,
        "STRUCTURE"
      ),
    [components]
  );

  const accessoryComponents = useMemo(
    () =>
      components.filter(
        (component) =>
          String(
            component?.componentType || ""
          ).toUpperCase() ===
          "ACCESSORY"
      ),
    [components]
  );

  /* =======================================================
     NOTES
  ======================================================= */

  const notesText = displayValue(
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

  const parsedNotes =
    useMemo(
      () => parseNotes(notesText),
      [notesText]
    );

  const cleanNotesText =
    useMemo(
      () => cleanNotes(notesText),
      [notesText]
    );

  /* =======================================================
     SUMMARY
  ======================================================= */

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
      capacity:
        getValue(
          data,
          [
            "systemCapacity",
            "systemSizeKW",
            "requiredKW",
            "capacityKW",
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
          panelComponent?.quantity ||
            "—"
        ),

      inverter:
        getValue(
          data,
          [
            "inverterCapacity",
            "inverterSize",
          ],
          inverterComponent?.capacity ||
            "—"
        ),

      systemType:
        getValue(
          data,
          [
            "systemType",
            "system_type",
            "type",
          ],
          "—"
        ),
    };
  }, [
    data,
    panelComponent,
    inverterComponent,
  ]);

  /* =======================================================
     BASIC DATA
  ======================================================= */

  const id = getId(data);

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
        ? `CONFIG-${String(id).slice(-6)}`
        : "Configuration"
    );

  const status = safeValue(
    data,
    ["status"],
    "—"
  );

  /* =======================================================
     CUSTOMER
  ======================================================= */

  const customerObject =
    data?.customer;

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

  const customerId =
    displayValue(
      getValue(
        data,
        [
          "customerId",
        ],
        customerObject?.customerId ||
          customerObject?._id ||
          null
      )
    );

  /* =======================================================
     LEAD
  ======================================================= */

  const leadObject = data?.lead;

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

  const leadId =
    displayValue(
      getValue(
        data,
        ["leadId"],
        leadObject?.leadId ||
          leadObject?._id ||
          null
      )
    );

  /* =======================================================
     SOLAR REQUIREMENT
  ======================================================= */

  const solarRequirement =
    getValue(
      data,
      [
        "solarRequirement",
        "solarRequirementId",
        "requirementId",
      ],
      null
    );

  const solarRequirementId =
    displayValue(
      solarRequirement
    );

  /* =======================================================
     PANEL DATA
  ======================================================= */

  const panelMake =
    displayValue(
      getValue(
        data,
        [
          "panelMake",
          "panelBrand",
          "moduleMake",
          "moduleBrand",
        ],
        panelComponent?.brand ||
          panelComponent?.name ||
          "—"
      )
    );

  const panelModel =
    displayValue(
      getValue(
        data,
        [
          "panelModel",
          "moduleModel",
        ],
        panelComponent?.model ||
          "—"
      )
    );

  const panelWattage =
    getValue(
      data,
      [
        "panelWattage",
        "wattage",
        "panelWp",
      ],
      panelComponent?.specifications
        ?.wattage ||
        panelComponent?.capacity ||
        "—"
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
      panelComponent?.quantity ||
        "—"
    );

  const panelCapacity =
    panelCount !== "—" &&
    panelWattage !== "—"
      ? (
          Number(panelCount) *
          Number(panelWattage)
        ) / 1000
      : summary.capacity;

  /* =======================================================
     INVERTER DATA
  ======================================================= */

  const inverterMake =
    displayValue(
      getValue(
        data,
        [
          "inverterMake",
          "inverterBrand",
        ],
        inverterComponent?.brand ||
          inverterComponent?.name ||
          "—"
      )
    );

  const inverterModel =
    displayValue(
      getValue(
        data,
        [
          "inverterModel",
        ],
        inverterComponent?.model ||
          "—"
      )
    );

  const inverterCapacity =
    getValue(
      data,
      [
        "inverterCapacity",
        "inverterSize",
      ],
      inverterComponent?.specifications
        ?.capacity ||
        inverterComponent?.capacity ||
        "—"
    );

  const inverterCount =
    getValue(
      data,
      [
        "inverterCount",
        "numberOfInverters",
      ],
      inverterComponent?.quantity ||
        "—"
    );

  /* =======================================================
     BATTERY DATA
  ======================================================= */

  const batteryRequiredValue =
    getValue(
      data,
      [
        "batteryRequired",
        "batteryRequirement",
      ],
      batteryComponent
        ? "YES"
        : "NO"
    );

  const isBatteryRequired =
    batteryRequiredValue === true ||
    String(
      batteryRequiredValue
    ).toUpperCase() === "YES" ||
    Boolean(batteryComponent);

  const batteryMake =
    displayValue(
      getValue(
        data,
        [
          "batteryMake",
          "batteryBrand",
        ],
        batteryComponent?.brand ||
          batteryComponent?.name ||
          "—"
      )
    );

  const batteryModel =
    displayValue(
      getValue(
        data,
        [
          "batteryModel",
        ],
        batteryComponent?.model ||
          "—"
      )
    );

  const batteryCapacity =
    getValue(
      data,
      [
        "batteryCapacity",
        "batterySize",
      ],
      batteryComponent?.capacity ||
        batteryComponent?.specifications
          ?.capacity ||
        "—"
    );

  const batteryCount =
    getValue(
      data,
      [
        "batteryCount",
        "numberOfBatteries",
      ],
      batteryComponent?.quantity ||
        "—"
    );

  /* =======================================================
     TECHNICAL DATA
  ======================================================= */

  const mountingStructure =
    displayValue(
      getValue(
        data,
        [
          "mountingStructure",
          "structure",
          "mountingType",
        ],
        structureComponent?.name ||
          "—"
      )
    );

  const accessoryCable =
    accessoryComponents.find(
      (component) =>
        String(
          component?.name || ""
        )
          .toLowerCase()
          .includes("cable")
    );

  const accessoryEarthing =
    accessoryComponents.find(
      (component) =>
        String(
          component?.name || ""
        )
          .toLowerCase()
          .includes("earth")
    );

  const accessoryProtection =
    accessoryComponents.find(
      (component) =>
        String(
          component?.name || ""
        )
          .toLowerCase()
          .includes("protect") ||
        String(
          component?.name || ""
        )
          .toLowerCase()
          .includes("acdb") ||
        String(
          component?.name || ""
        )
          .toLowerCase()
          .includes("dcdb") ||
        String(
          component?.name || ""
        )
          .toLowerCase()
          .includes("spd")
    );

  const cableSpecification =
    displayValue(
      getValue(
        data,
        [
          "cableSpecification",
          "cable",
          "cableSize",
        ],
        accessoryCable
          ?.specifications
          ?.cable ||
          accessoryCable?.name ||
          "—"
      )
    );

  const earthing =
    displayValue(
      getValue(
        data,
        [
          "earthing",
          "earthingSpecification",
        ],
        accessoryEarthing
          ?.name ||
          accessoryEarthing
            ?.specifications
            ?.earthing ||
          "—"
      )
    );

  const protection =
    displayValue(
      getValue(
        data,
        [
          "protection",
          "protectionSystem",
        ],
        accessoryProtection
          ?.name ||
          accessoryProtection
            ?.specifications
            ?.protection ||
          "—"
      )
    );

  const installationType =
    safeValue(
      data,
      [
        "installationType",
      ],
      parsedNotes.installationType ||
        "—"
    );

  /* =======================================================
     GENERATION
  ======================================================= */

  const generationEstimate =
    safeValue(
      data,
      [
        "generationEstimate",
        "estimatedGeneration",
        "dailyGeneration",
      ],
      parsedNotes.generationEstimate ||
        "—"
    );

  const annualGeneration =
    safeValue(
      data,
      [
        "annualGeneration",
        "yearlyGeneration",
      ],
      parsedNotes.annualGeneration ||
        "—"
    );

  /* =======================================================
     PRICING
  ======================================================= */

  const subtotal =
    getValue(
      data,
      ["subtotal"],
      0
    );

  const installationCost =
    getValue(
      data,
      ["installationCost"],
      0
    );

  const transportationCost =
    getValue(
      data,
      ["transportationCost"],
      0
    );

  const otherCost =
    getValue(
      data,
      ["otherCost"],
      0
    );

  const discount =
    getValue(
      data,
      ["discount"],
      0
    );

  const taxPercentage =
    getValue(
      data,
      ["taxPercentage"],
      0
    );

  const taxAmount =
    getValue(
      data,
      ["taxAmount"],
      0
    );

  const totalAmount =
    getValue(
      data,
      [
        "totalAmount",
        "grandTotal",
      ],
      0
    );

  /* =======================================================
     RECORD INFO
  ======================================================= */

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

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="admin-configuration-details-loading">
        <Loader />
      </div>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

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

  /* =======================================================
     RENDER
  ======================================================= */

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
              {formatNumber(
                summary.inverter
              )}{" "}
              kW
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
              {formatSystemType(
                summary.systemType
              )}
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
                  Customer ID
                </span>

                <strong>
                  {customerId}
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
                  Lead ID
                </span>

                <strong>
                  {leadId}
                </strong>
              </div>

              <div>
                <span>
                  Solar Requirement ID
                </span>

                <strong>
                  {solarRequirementId}
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
                  Solar panel selection, capacity
                  aur quantity.
                </p>

              </div>

            </div>

            <div className="admin-configuration-detail-grid">

              <div>
                <span>
                  Panel Make / Brand
                </span>

                <strong>
                  {panelMake}
                </strong>
              </div>

              <div>
                <span>
                  Panel Model
                </span>

                <strong>
                  {panelModel}
                </strong>
              </div>

              <div>
                <span>
                  Panel Wattage
                </span>

                <strong>
                  {panelWattage !==
                  "—"
                    ? `${formatNumber(
                        panelWattage
                      )} W`
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
                    panelCapacity
                  )}{" "}
                  kW
                </strong>
              </div>

              <div>
                <span>
                  Panel Unit
                </span>

                <strong>
                  {displayValue(
                    panelComponent?.unit,
                    "PCS"
                  )}
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
                  Inverter make, model, capacity
                  aur quantity.
                </p>

              </div>

            </div>

            <div className="admin-configuration-detail-grid">

              <div>
                <span>
                  Inverter Make / Brand
                </span>

                <strong>
                  {inverterMake}
                </strong>
              </div>

              <div>
                <span>
                  Inverter Model
                </span>

                <strong>
                  {inverterModel}
                </strong>
              </div>

              <div>
                <span>
                  Inverter Capacity
                </span>

                <strong>
                  {inverterCapacity !==
                  "—"
                    ? `${formatNumber(
                        inverterCapacity
                      )} kW`
                    : "—"}
                </strong>
              </div>

              <div>
                <span>
                  Inverter Count
                </span>

                <strong>
                  {formatNumber(
                    inverterCount
                  )}
                </strong>
              </div>

              <div>
                <span>
                  System Type
                </span>

                <strong>
                  {formatSystemType(
                    summary.systemType
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Phase
                </span>

                <strong>
                  {formatSystemType(
                    getValue(
                      data,
                      ["phase"],
                      "—"
                    )
                  )}
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
                  Backup battery requirement
                  details.
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
                  Battery Make / Brand
                </span>

                <strong>
                  {batteryMake}
                </strong>
              </div>

              <div>
                <span>
                  Battery Model
                </span>

                <strong>
                  {batteryModel}
                </strong>
              </div>

              <div>
                <span>
                  Battery Capacity
                </span>

                <strong>
                  {batteryCapacity !==
                  "—"
                    ? `${formatNumber(
                        batteryCapacity
                      )} kWh`
                    : "—"}
                </strong>
              </div>

              <div>
                <span>
                  Battery Count
                </span>

                <strong>
                  {formatNumber(
                    batteryCount
                  )}
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
                  Expected solar generation
                  information.
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

          {/* PRICING */}

          <section className="admin-configuration-detail-card">

            <div className="admin-configuration-card-header">

              <div>

                <h2>
                  Configuration Pricing
                </h2>

                <p>
                  Backend calculated pricing
                  summary.
                </p>

              </div>

            </div>

            <div className="admin-configuration-detail-grid">

              <div>
                <span>
                  Subtotal
                </span>

                <strong>
                  {formatCurrency(
                    subtotal
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Installation Cost
                </span>

                <strong>
                  {formatCurrency(
                    installationCost
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Transportation Cost
                </span>

                <strong>
                  {formatCurrency(
                    transportationCost
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Other Cost
                </span>

                <strong>
                  {formatCurrency(
                    otherCost
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Discount
                </span>

                <strong>
                  {formatCurrency(
                    discount
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Tax / GST
                </span>

                <strong>
                  {formatNumber(
                    taxPercentage
                  )}%
                  {" "}
                  ({formatCurrency(
                    taxAmount
                  )})
                </strong>
              </div>

              <div>
                <span>
                  Grand Total
                </span>

                <strong>
                  {formatCurrency(
                    totalAmount
                  )}
                </strong>
              </div>

            </div>

          </section>

          {/* COMPONENTS */}

          {components.length > 0 && (
            <section className="admin-configuration-detail-card">

              <div className="admin-configuration-card-header">

                <div>

                  <h2>
                    Configuration Components
                  </h2>

                  <p>
                    System ke andar configured
                    components.
                  </p>

                </div>

              </div>

              <div className="admin-configuration-detail-grid">

                {components.map(
                  (component) => (
                    <div
                      key={
                        component?._id ||
                        `${component?.componentType}-${component?.name}`
                      }
                    >

                      <span>
                        {formatSystemType(
                          component?.componentType
                        )}
                      </span>

                      <strong>
                        {displayValue(
                          component?.name
                        )}
                        {" "}
                        ×{" "}
                        {formatNumber(
                          component?.quantity
                        )}
                      </strong>

                    </div>
                  )
                )}

              </div>

            </section>
          )}

          {/* NOTES */}

          <section className="admin-configuration-detail-card">

            <div className="admin-configuration-card-header">

              <div>

                <h2>
                  Additional Notes
                </h2>

                <p>
                  Configuration se related
                  additional information.
                </p>

              </div>

            </div>

            <div className="admin-configuration-notes">

              {cleanNotesText ? (
                <p>
                  {cleanNotesText}
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
                  Configuration Number
                </span>

                <strong>
                  {configurationNumber}
                </strong>
              </div>

              <div>
                <span>
                  System Type
                </span>

                <strong>
                  {formatSystemType(
                    summary.systemType
                  )}
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
                  Inverter
                </span>

                <strong>
                  {formatNumber(
                    summary.inverter
                  )}{" "}
                  kW
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
                      ["createdAt"],
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
                      ["updatedAt"],
                      null
                    ),
                    true
                  )}
                </strong>
              </div>

            </div>

          </section>

          {/* PRICING SUMMARY */}

          <section className="admin-configuration-detail-card">

            <div className="admin-configuration-card-header">

              <div>

                <h2>
                  Pricing Summary
                </h2>

              </div>

            </div>

            <div className="admin-configuration-summary-list">

              <div>
                <span>
                  Subtotal
                </span>

                <strong>
                  {formatCurrency(
                    subtotal
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Discount
                </span>

                <strong>
                  {formatCurrency(
                    discount
                  )}
                </strong>
              </div>

              <div>
                <span>
                  GST / Tax
                </span>

                <strong>
                  {formatCurrency(
                    taxAmount
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Grand Total
                </span>

                <strong>
                  {formatCurrency(
                    totalAmount
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