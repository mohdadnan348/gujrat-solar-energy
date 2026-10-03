"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import Loader from "@/components/common/Loader";

import quotationService from "@/services/quotation.service";
import pdfService from "@/services/pdf.service";
import systemConfigurationService from "@/services/systemConfiguration.service";

import "./quotation-details.css";

/* =========================================================
   HELPERS
========================================================= */

const firstValue = (object, keys = [], fallback = "") => {
  if (!object) return fallback;

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

const objectValue = (object, keys = []) => {
  if (!object) return null;

  for (const key of keys) {
    const value = object?.[key];

    if (value && typeof value === "object") {
      return value;
    }
  }

  return null;
};

const idOf = (value) => {
  if (!value) return "";

  if (typeof value === "string") {
    return value;
  }

  return value?._id || value?.id || "";
};

const unwrap = (response) => {
  if (!response) return null;

  if (response?.data?.quotation) {
    return response.data.quotation;
  }

  if (response?.quotation) {
    return response.quotation;
  }

  if (response?.data && !Array.isArray(response.data)) {
    return response.data;
  }

  return response;
};

const normalizeQuotationResponse = (response) => {
  if (!response) {
    return {
      quotation: null,
      items: [],
      bom: [],
    };
  }

  const root =
    response?.data && !Array.isArray(response.data)
      ? response.data
      : response;

  const quotation =
    root?.quotation ||
    response?.quotation ||
    unwrap(response);

  const items =
    root?.items ||
    response?.items ||
    quotation?.items ||
    quotation?.quotationItems ||
    [];

  const bom =
    root?.bom ||
    response?.bom ||
    quotation?.bom ||
    quotation?.quotationBOM ||
    [];

  return {
    quotation,
    items: Array.isArray(items) ? items : [],
    bom: Array.isArray(bom) ? bom : [],
  };
};

const normalizeConfigurationResponse = (response) => {
  if (!response) return null;

  if (response?.data?.configuration) {
    return response.data.configuration;
  }

  if (response?.configuration) {
    return response.configuration;
  }

  if (response?.data && !Array.isArray(response.data)) {
    return response.data;
  }

  return response;
};

const money = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const numberValue = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const readable = (value) => {
  if (!value) return "—";

  return String(value)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const statusVariant = (status) => {
  const value = String(status || "").toUpperCase();

  if (["ACCEPTED", "SENT", "APPROVED"].includes(value)) {
    return "success";
  }

  if (["REJECTED", "CANCELLED"].includes(value)) {
    return "danger";
  }

  if (["EXPIRED", "PENDING"].includes(value)) {
    return "warning";
  }

  return "default";
};

const parseNotes = (notes) => {
  const text = String(notes || "");

  const getLine = (label) => {
    const match = text.match(
      new RegExp(`^${label}:\\s*(.+)$`, "im")
    );

    return match?.[1]?.trim() || "";
  };

  return {
    installationType: getLine("Installation Type"),
    generationEstimate: getLine("Generation Estimate"),
    annualGeneration: getLine("Annual Generation"),
    raw: text,
  };
};

const componentByType = (components, type) =>
  components.find(
    (component) =>
      String(component?.componentType || "").toUpperCase() === type
  );

const accessoryText = (accessories, keywords = []) => {
  for (const accessory of accessories) {
    const haystack = [
      accessory?.name,
      accessory?.brand,
      accessory?.model,
      accessory?.notes,
      JSON.stringify(accessory?.specifications || {}),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    if (keywords.some((keyword) => haystack.includes(keyword))) {
      const specs = accessory?.specifications || {};

      return (
        specs?.value ||
        specs?.description ||
        accessory?.name ||
        accessory?.notes ||
        "—"
      );
    }
  }

  return "—";
};

/* =========================================================
   PAGE
========================================================= */

const QuotationDetailsPage = () => {
  const params = useParams();
  const router = useRouter();

  const quotationId = params?.id;

  const [quotation, setQuotation] = useState(null);
  const [items, setItems] = useState([]);
  const [bom, setBom] = useState([]);
  const [configuration, setConfiguration] = useState(null);

  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  /* =========================================================
     LOAD
  ========================================================= */

  const loadQuotation = async () => {
    if (!quotationId) return;

    try {
      setLoading(true);
      setError("");

      const response =
        await quotationService.getQuotationById(quotationId);

      const normalized =
        normalizeQuotationResponse(response);

      if (!normalized.quotation) {
        throw new Error("Quotation not found");
      }

      setQuotation(normalized.quotation);
      setItems(normalized.items);
      setBom(normalized.bom);

      /*
       * Backend quotation detail only populates a summary of
       * systemConfiguration. Fetch the full configuration so
       * panel/inverter/battery/technical data is shown correctly.
       */
      const configurationId =
        idOf(normalized.quotation?.systemConfiguration);

      if (configurationId) {
        try {
          const configurationResponse =
            await systemConfigurationService.getSystemConfigurationById(
              configurationId
            );

          setConfiguration(
            normalizeConfigurationResponse(
              configurationResponse
            )
          );
        } catch (configurationError) {
          console.warn(
            "Full system configuration could not be loaded:",
            configurationError
          );

          setConfiguration(
            normalized.quotation?.systemConfiguration || null
          );
        }
      } else {
        setConfiguration(
          normalized.quotation?.systemConfiguration || null
        );
      }
    } catch (err) {
      console.error("Failed to load quotation:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Quotation details load nahi ho paaye."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuotation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quotationId]);

  /* =========================================================
     DERIVED DATA
  ========================================================= */

  const customer =
    objectValue(quotation, ["customer"]) ||
    objectValue(quotation, ["customerDetails"]) ||
    null;

  const lead =
    objectValue(quotation, ["lead"]) ||
    null;

  const solarRequirement =
    objectValue(quotation, ["solarRequirement"]) ||
    null;

  const createdBy =
    objectValue(quotation, ["createdBy"]) ||
    null;

  const quotationNumber = firstValue(
    quotation,
    [
      "quotationNumber",
      "quotationNo",
      "estimateId",
      "referenceNumber",
      "number",
    ],
    "Quotation"
  );

  const status = firstValue(
    quotation,
    ["status"],
    "DRAFT"
  );

  const title = firstValue(
    quotation,
    ["title", "quotationTitle"],
    "Solar Power System Proposal"
  );

  const quotationDate = firstValue(
    quotation,
    ["quotationDate", "date", "createdAt"],
    ""
  );

  const validUntil = firstValue(
    quotation,
    ["validUntil", "validTill", "expiryDate"],
    ""
  );

  /* =========================================================
     CUSTOMER
  ========================================================= */

  const customerName =
    firstValue(
      quotation,
      ["customerName"],
      ""
    ) ||
    firstValue(
      customer,
      ["name", "fullName", "customerName"],
      ""
    ) ||
    firstValue(
      lead,
      ["customerName", "name"],
      "Customer"
    );

  const customerCompany =
    firstValue(
      quotation,
      ["companyName", "customerCompany"],
      ""
    ) ||
    firstValue(
      customer,
      ["companyName"],
      ""
    ) ||
    firstValue(
      lead,
      ["companyName"],
      ""
    );

  const customerPhone =
    firstValue(
      quotation,
      ["phone", "mobile", "contactNumber"],
      ""
    ) ||
    firstValue(
      customer,
      ["mobile", "phone", "contactNumber"],
      ""
    ) ||
    firstValue(
      lead,
      ["mobile", "phone"],
      ""
    );

  const customerEmail =
    firstValue(
      quotation,
      ["email", "customerEmail"],
      ""
    ) ||
    firstValue(
      customer,
      ["email"],
      ""
    ) ||
    firstValue(
      lead,
      ["email"],
      ""
    );

  const customerAddress =
    firstValue(
      quotation,
      ["address", "customerAddress", "siteAddress"],
      ""
    ) ||
    firstValue(
      customer,
      ["address", "siteAddress"],
      ""
    ) ||
    firstValue(
      lead,
      ["address"],
      ""
    ) ||
    firstValue(
      solarRequirement,
      ["siteAddress"],
      ""
    );

  const customerCity =
    firstValue(
      quotation,
      ["city", "customerCity"],
      ""
    ) ||
    firstValue(
      customer,
      ["city", "location"],
      ""
    ) ||
    firstValue(
      solarRequirement,
      ["location"],
      ""
    );

  /* =========================================================
     SYSTEM CONFIGURATION
  ========================================================= */

  const components = Array.isArray(
    configuration?.components
  )
    ? configuration.components
    : [];

  const panel = componentByType(
    components,
    "SOLAR_PANEL"
  );

  const inverter = componentByType(
    components,
    "INVERTER"
  );

  const battery = componentByType(
    components,
    "BATTERY"
  );

  const structure = componentByType(
    components,
    "STRUCTURE"
  );

  const accessories = components.filter(
    (component) =>
      String(component?.componentType || "").toUpperCase() ===
      "ACCESSORY"
  );

  const panelWattage = numberValue(
    firstValue(
      panel?.specifications,
      ["wattage"],
      firstValue(
        panel,
        ["capacity"],
        0
      )
    )
  );

  const panelCount = numberValue(
    firstValue(
      configuration,
      ["panelCount"],
      firstValue(panel, ["quantity"], 0)
    )
  );

  const panelCapacity =
    panelWattage && panelCount
      ? (panelWattage * panelCount) / 1000
      : 0;

  const panelMake =
    firstValue(
      panel,
      ["brand", "name"],
      ""
    ) ||
    firstValue(
      configuration,
      ["panelMake", "panelBrand"],
      ""
    );

  const panelModel =
    firstValue(
      panel,
      ["model"],
      ""
    ) ||
    firstValue(
      configuration,
      ["panelModel"],
      ""
    );

  const inverterCapacity = numberValue(
    firstValue(
      inverter?.specifications,
      ["capacity"],
      firstValue(
        inverter,
        ["capacity"],
        0
      )
    )
  );

  const inverterCount = numberValue(
    firstValue(
      configuration,
      ["inverterCount"],
      firstValue(inverter, ["quantity"], 0)
    )
  );

  const inverterMake =
    firstValue(
      inverter,
      ["brand", "name"],
      ""
    ) ||
    firstValue(
      configuration,
      ["inverterMake", "inverterBrand"],
      ""
    );

  const inverterModel =
    firstValue(
      inverter,
      ["model"],
      ""
    ) ||
    firstValue(
      configuration,
      ["inverterModel"],
      ""
    );

  const batteryCount = numberValue(
    firstValue(
      configuration,
      ["batteryCount"],
      firstValue(battery, ["quantity"], 0)
    )
  );

  const batteryRequired =
    batteryCount > 0 || Boolean(battery);

  const batteryCapacity = numberValue(
    firstValue(
      battery,
      ["capacity"],
      firstValue(
        battery?.specifications,
        ["capacity"],
        0
      )
    )
  );

  const batteryUnit =
    firstValue(
      battery,
      ["capacityUnit"],
      "KWH"
    );

  const systemType =
    firstValue(
      configuration,
      ["systemType"],
      firstValue(
        quotation,
        ["systemType"],
        firstValue(
          solarRequirement,
          ["systemType"],
          "—"
        )
      )
    );

  const systemSize =
    numberValue(
      firstValue(
        configuration,
        ["systemCapacity", "systemSizeKW"],
        firstValue(
          quotation,
          ["systemSizeKW", "systemSize", "capacityKW"],
          0
        )
      )
    );

  const phase =
    firstValue(
      configuration,
      ["phase"],
      ""
    );

  const configurationNumber =
    firstValue(
      configuration,
      ["configurationNumber", "configurationId"],
      ""
    );

  const notesData = parseNotes(
    firstValue(
      configuration,
      ["notes"],
      ""
    )
  );

  const mountingStructure =
    firstValue(
      structure,
      ["name", "brand", "model"],
      ""
    ) ||
    firstValue(
      configuration,
      ["mountingStructure"],
      ""
    );

  const cable = accessoryText(
    accessories,
    ["cable", "wire"]
  );

  const earthing = accessoryText(
    accessories,
    ["earthing", "earth"]
  );

  const protection = accessoryText(
    accessories,
    ["protection", "spd", "mc4", "ac db", "dc db"]
  );

  /* =========================================================
     AMOUNTS
  ========================================================= */

  const subtotal = numberValue(
    firstValue(
      quotation,
      ["subtotal", "subTotal"],
      0
    )
  );

  const discount = numberValue(
    firstValue(
      quotation,
      ["discount"],
      0
    )
  );

  const taxTotal = numberValue(
    firstValue(
      quotation,
      ["taxTotal", "totalTax", "taxAmount"],
      0
    )
  );

  const additionalCharges = numberValue(
    firstValue(
      quotation,
      ["additionalCharges", "otherCharges"],
      0
    )
  );

  const grandTotal = numberValue(
    firstValue(
      quotation,
      ["grandTotal", "totalAmount", "total", "finalAmount"],
      subtotal - discount + taxTotal + additionalCharges
    )
  );

  /* =========================================================
     TERMS
  ========================================================= */

  const paymentTerms = firstValue(
    quotation,
    ["paymentTerms", "terms"],
    ""
  );

  const warranty = firstValue(
    quotation,
    ["warranty", "warrantyTerms"],
    ""
  );

  const notes = firstValue(
    quotation,
    ["notes", "additionalNotes"],
    ""
  );

  const revisionNumber = firstValue(
    quotation,
    ["revisionNumber", "revision"],
    ""
  );

  const createdByName =
    firstValue(
      quotation,
      ["createdByName"],
      ""
    ) ||
    firstValue(
      createdBy,
      ["username", "name", "fullName"],
      "Admin"
    );

  /* =========================================================
     PDF
  ========================================================= */

const handleDownloadPDF = async () => {
  if (!quotationId) return;

  try {
    setDownloading(true);
    setError("");

    await pdfService.downloadQuotationPdf(quotationId);
  } catch (err) {
    console.error(
      "Failed to download quotation PDF:",
      err
    );

    setError(
      err?.response?.data?.message ||
        err?.message ||
        "Quotation PDF download nahi ho paayi."
    );
  } finally {
    setDownloading(false);
  }
};

  /* =========================================================
     STATES
  ========================================================= */

  if (loading) {
    return (
      <div className="admin-quotation-details-loading">
        <Loader />
        <p>Quotation details load ho rahi hain...</p>
      </div>
    );
  }

  if (error && !quotation) {
    return (
      <div className="admin-quotation-details-error-state">
        <div className="admin-quotation-error-icon">
          !
        </div>

        <h2>Quotation load nahi hui</h2>

        <p>{error}</p>

        <div>
          <Button
            variant="secondary"
            onClick={() =>
              router.push("/admin/quotations")
            }
          >
            Back to Quotations
          </Button>

          <Button
            variant="primary"
            onClick={loadQuotation}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="admin-quotation-details-error-state">
        <h2>Quotation not found</h2>

        <Button
          variant="primary"
          onClick={() =>
            router.push("/admin/quotations")
          }
        >
          Back to Quotations
        </Button>
      </div>
    );
  }

  return (
    <div className="admin-quotation-details-page">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="admin-quotation-details-header">
        <div>
          <button
            type="button"
            className="admin-quotation-back-button"
            onClick={() =>
              router.push("/admin/quotations")
            }
          >
            ← Back to Quotations
          </button>

          <div className="admin-quotation-heading">
            <div className="admin-quotation-heading-icon">
              ₹
            </div>

            <div>
              <div className="admin-quotation-heading-top">
                <h1>{quotationNumber}</h1>

                <Badge
                  variant={statusVariant(status)}
                >
                  {readable(status)}
                </Badge>
              </div>

              <p>{title}</p>
            </div>
          </div>
        </div>

        <div className="admin-quotation-header-actions">
          <Button
            type="button"
            variant="secondary"
            onClick={handleDownloadPDF}
            disabled={downloading}
          >
            {downloading
              ? "Downloading..."
              : "↓ Download PDF"}
          </Button>

          <Button
            type="button"
            variant="primary"
            onClick={() =>
              router.push("/admin/quotations")
            }
          >
            Quotations
          </Button>
        </div>
      </div>

      {error && (
        <div className="admin-quotation-inline-error">
          {error}
        </div>
      )}

      {/* =====================================================
          SUMMARY
      ===================================================== */}

      <div className="admin-quotation-summary-grid">
        <div className="admin-quotation-summary-card">
          <span>Quotation Date</span>
          <strong>
            {formatDate(quotationDate)}
          </strong>
        </div>

        <div className="admin-quotation-summary-card">
          <span>Valid Until</span>
          <strong>
            {formatDate(validUntil)}
          </strong>
        </div>

        <div className="admin-quotation-summary-card">
          <span>System Size</span>
          <strong>
            {systemSize
              ? `${systemSize} kW`
              : "—"}
          </strong>
        </div>

        <div className="admin-quotation-summary-card admin-quotation-summary-total">
          <span>Grand Total</span>
          <strong>
            {money(grandTotal)}
          </strong>
        </div>
      </div>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="admin-quotation-details-layout">
        <main className="admin-quotation-details-main">
          {/* CUSTOMER */}

          <section className="admin-quotation-detail-card">
            <div className="admin-quotation-detail-card-header">
              <div>
                <h2>Customer Information</h2>
                <p>
                  Quotation kis customer ke liye create ki gayi hai.
                </p>
              </div>
            </div>

            <div className="admin-quotation-customer-box">
              <div className="admin-quotation-customer-avatar">
                {String(customerName || "C")
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div className="admin-quotation-customer-info">
                <h3>{customerName}</h3>

                {customerCompany && (
                  <p>{customerCompany}</p>
                )}

                <div className="admin-quotation-contact-grid">
                  <div>
                    <span>Phone</span>
                    <strong>
                      {customerPhone || "—"}
                    </strong>
                  </div>

                  <div>
                    <span>Email</span>
                    <strong>
                      {customerEmail || "—"}
                    </strong>
                  </div>

                  <div>
                    <span>Address</span>
                    <strong>
                      {[
                        customerAddress,
                        customerCity,
                      ]
                        .filter(Boolean)
                        .join(", ") || "—"}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* LEAD / REQUIREMENT */}

          <section className="admin-quotation-detail-card">
            <div className="admin-quotation-detail-card-header">
              <div>
                <h2>Business References</h2>
                <p>
                  Lead, solar requirement aur configuration relationship.
                </p>
              </div>
            </div>

            <div className="admin-quotation-system-grid">
              <div>
                <span>Lead ID</span>
                <strong>
                  {firstValue(
                    lead,
                    ["leadId"],
                    firstValue(
                      quotation,
                      ["leadId"],
                      "—"
                    )
                  )}
                </strong>
              </div>

              <div>
                <span>Solar Requirement</span>
                <strong>
                  {idOf(solarRequirement) ||
                    firstValue(
                      quotation,
                      [
                        "solarRequirementId",
                        "requirementId",
                      ],
                      "—"
                    )}
                </strong>
              </div>

              <div>
                <span>Configuration</span>
                <strong>
                  {configurationNumber ||
                    idOf(
                      quotation?.systemConfiguration
                    ) ||
                    "—"}
                </strong>
              </div>
            </div>
          </section>

          {/* SOLAR SYSTEM */}

          <section className="admin-quotation-detail-card">
            <div className="admin-quotation-detail-card-header">
              <div>
                <h2>Solar System Configuration</h2>
                <p>
                  Backend ke actual system configuration components se technical data.
                </p>
              </div>
            </div>

            <div className="admin-quotation-system-grid">
              <div>
                <span>System Type</span>
                <strong>
                  {readable(systemType)}
                </strong>
              </div>

              <div>
                <span>System Capacity</span>
                <strong>
                  {systemSize
                    ? `${systemSize} kW`
                    : "—"}
                </strong>
              </div>

              <div>
                <span>Phase</span>
                <strong>
                  {readable(phase)}
                </strong>
              </div>

              <div>
                <span>Panel Make</span>
                <strong>
                  {panelMake || "—"}
                </strong>
              </div>

              <div>
                <span>Panel Model</span>
                <strong>
                  {panelModel || "—"}
                </strong>
              </div>

              <div>
                <span>Panel Wattage</span>
                <strong>
                  {panelWattage
                    ? `${panelWattage} W`
                    : "—"}
                </strong>
              </div>

              <div>
                <span>Total Panels</span>
                <strong>
                  {panelCount || "—"}
                </strong>
              </div>

              <div>
                <span>Panel Capacity</span>
                <strong>
                  {panelCapacity
                    ? `${panelCapacity.toFixed(2)} kW`
                    : "—"}
                </strong>
              </div>

              <div>
                <span>Inverter Make</span>
                <strong>
                  {inverterMake || "—"}
                </strong>
              </div>

              <div>
                <span>Inverter Model</span>
                <strong>
                  {inverterModel || "—"}
                </strong>
              </div>

              <div>
                <span>Inverter Capacity</span>
                <strong>
                  {inverterCapacity
                    ? `${inverterCapacity} ${
                        firstValue(
                          inverter,
                          ["capacityUnit"],
                          "KW"
                        )
                      }`
                    : "—"}
                </strong>
              </div>

              <div>
                <span>Inverter Count</span>
                <strong>
                  {inverterCount || "—"}
                </strong>
              </div>

              <div>
                <span>Battery Required</span>
                <strong>
                  {batteryRequired
                    ? "Yes"
                    : "No"}
                </strong>
              </div>

              <div>
                <span>Battery Capacity</span>
                <strong>
                  {batteryCapacity
                    ? `${batteryCapacity} ${batteryUnit}`
                    : "—"}
                </strong>
              </div>

              <div>
                <span>Battery Count</span>
                <strong>
                  {batteryCount || 0}
                </strong>
              </div>

              <div>
                <span>Mounting Structure</span>
                <strong>
                  {mountingStructure || "—"}
                </strong>
              </div>

              <div>
                <span>Cable</span>
                <strong>{cable}</strong>
              </div>

              <div>
                <span>Earthing</span>
                <strong>{earthing}</strong>
              </div>

              <div>
                <span>Protection</span>
                <strong>{protection}</strong>
              </div>
            </div>
          </section>

          {/* INSTALLATION / GENERATION */}

          <section className="admin-quotation-detail-card">
            <div className="admin-quotation-detail-card-header">
              <div>
                <h2>Installation & Generation</h2>
                <p>
                  Configuration notes se saved installation/generation information.
                </p>
              </div>
            </div>

            <div className="admin-quotation-system-grid">
              <div>
                <span>Installation Type</span>
                <strong>
                  {notesData.installationType || "—"}
                </strong>
              </div>

              <div>
                <span>Generation Estimate</span>
                <strong>
                  {notesData.generationEstimate || "—"}
                </strong>
              </div>

              <div>
                <span>Annual Generation</span>
                <strong>
                  {notesData.annualGeneration || "—"}
                </strong>
              </div>
            </div>
          </section>

          {/* ITEMS */}

          <section className="admin-quotation-detail-card">
            <div className="admin-quotation-detail-card-header">
              <div>
                <h2>Quotation Items</h2>
                <p>
                  Quotation ke actual line items.
                </p>
              </div>
            </div>

            {items.length === 0 ? (
              <div className="admin-quotation-empty-items">
                No quotation items available.
              </div>
            ) : (
              <div className="admin-quotation-detail-items-wrapper">
                <table className="admin-quotation-detail-items-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Category</th>
                      <th>Description</th>
                      <th>Qty</th>
                      <th>Unit</th>
                      <th>Rate</th>
                      <th>Discount</th>
                      <th>Tax</th>
                      <th>Total</th>
                    </tr>
                  </thead>

                  <tbody>
                    {items.map((item, index) => {
                      const quantity =
                        numberValue(
                          firstValue(
                            item,
                            ["quantity", "qty"],
                            0
                          )
                        );

                      const rate =
                        numberValue(
                          firstValue(
                            item,
                            [
                              "rate",
                              "unitPrice",
                              "price",
                            ],
                            0
                          )
                        );

                      const discountValue =
                        numberValue(
                          firstValue(
                            item,
                            [
                              "discount",
                              "discountAmount",
                            ],
                            0
                          )
                        );

                      const taxRate =
                        numberValue(
                          firstValue(
                            item,
                            ["taxRate", "tax"],
                            0
                          )
                        );

                      const lineTotal =
                        numberValue(
                          firstValue(
                            item,
                            [
                              "total",
                              "amount",
                              "lineTotal",
                              "totalAmount",
                            ],
                            quantity * rate -
                              discountValue
                          )
                        );

                      return (
                        <tr
                          key={
                            idOf(item) ||
                            `${quotationId}-${index}`
                          }
                        >
                          <td>{index + 1}</td>

                          <td>
                            {readable(
                              firstValue(
                                item,
                                ["category", "type"],
                                "—"
                              )
                            )}
                          </td>

                          <td>
                            <strong>
                              {firstValue(
                                item,
                                [
                                  "description",
                                  "name",
                                  "itemName",
                                ],
                                "—"
                              )}
                            </strong>
                          </td>

                          <td>{quantity}</td>

                          <td>
                            {firstValue(
                              item,
                              ["unit"],
                              "—"
                            )}
                          </td>

                          <td>
                            {money(rate)}
                          </td>

                          <td>
                            {money(discountValue)}
                          </td>

                          <td>
                            {taxRate}%
                          </td>

                          <td>
                            <strong>
                              {money(lineTotal)}
                            </strong>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* BOM */}

          {bom.length > 0 && (
            <section className="admin-quotation-detail-card">
              <div className="admin-quotation-detail-card-header">
                <div>
                  <h2>Bill of Materials</h2>
                  <p>
                    System configuration ke BOM components.
                  </p>
                </div>
              </div>

              <div className="admin-quotation-detail-items-wrapper">
                <table className="admin-quotation-detail-items-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Component</th>
                      <th>Qty</th>
                      <th>Unit</th>
                      <th>Rate</th>
                      <th>Total</th>
                    </tr>
                  </thead>

                  <tbody>
                    {bom.map((row, index) => {
                      const quantity =
                        numberValue(
                          firstValue(
                            row,
                            ["quantity", "qty"],
                            0
                          )
                        );

                      const rate =
                        numberValue(
                          firstValue(
                            row,
                            ["rate", "unitPrice", "price"],
                            0
                          )
                        );

                      const total =
                        numberValue(
                          firstValue(
                            row,
                            [
                              "total",
                              "amount",
                              "totalPrice",
                            ],
                            quantity * rate
                          )
                        );

                      return (
                        <tr
                          key={
                            idOf(row) ||
                            `bom-${index}`
                          }
                        >
                          <td>{index + 1}</td>
                          <td>
                            <strong>
                              {firstValue(
                                row,
                                [
                                  "componentName",
                                  "name",
                                  "description",
                                ],
                                "—"
                              )}
                            </strong>
                          </td>
                          <td>{quantity}</td>
                          <td>
                            {firstValue(
                              row,
                              ["unit"],
                              "—"
                            )}
                          </td>
                          <td>{money(rate)}</td>
                          <td>
                            <strong>
                              {money(total)}
                            </strong>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* TERMS */}

          {(paymentTerms ||
            warranty ||
            notes ||
            revisionNumber) && (
            <section className="admin-quotation-detail-card">
              <div className="admin-quotation-detail-card-header">
                <div>
                  <h2>Terms & Notes</h2>
                  <p>
                    Quotation ke additional commercial information.
                  </p>
                </div>
              </div>

              <div className="admin-quotation-terms-grid">
                {paymentTerms && (
                  <div className="admin-quotation-term-box">
                    <h3>Payment Terms</h3>
                    <p>{paymentTerms}</p>
                  </div>
                )}

                {warranty && (
                  <div className="admin-quotation-term-box">
                    <h3>Warranty</h3>
                    <p>{warranty}</p>
                  </div>
                )}

                {revisionNumber && (
                  <div className="admin-quotation-term-box">
                    <h3>Revision</h3>
                    <p>{revisionNumber}</p>
                  </div>
                )}

                {notes && (
                  <div className="admin-quotation-term-box admin-quotation-term-full">
                    <h3>Additional Notes</h3>
                    <p>{notes}</p>
                  </div>
                )}
              </div>
            </section>
          )}
        </main>

        {/* ===================================================
            SIDEBAR
        =================================================== */}

        <aside className="admin-quotation-details-sidebar">
          {/* AMOUNT */}

          <section className="admin-quotation-sidebar-card">
            <div className="admin-quotation-sidebar-heading">
              <h2>Amount Summary</h2>
            </div>

            <div className="admin-quotation-amount-list">
              <div>
                <span>Subtotal</span>
                <strong>{money(subtotal)}</strong>
              </div>

              <div>
                <span>Discount</span>
                <strong>
                  - {money(discount)}
                </strong>
              </div>

              <div>
                <span>Tax</span>
                <strong>{money(taxTotal)}</strong>
              </div>

              <div>
                <span>Additional</span>
                <strong>
                  {money(additionalCharges)}
                </strong>
              </div>

              <div className="admin-quotation-sidebar-total">
                <span>Grand Total</span>
                <strong>{money(grandTotal)}</strong>
              </div>
            </div>
          </section>

          {/* RECORD */}

          <section className="admin-quotation-sidebar-card">
            <div className="admin-quotation-sidebar-heading">
              <h2>Record Information</h2>
            </div>

            <div className="admin-quotation-record-list">
              <div>
                <span>Created By</span>
                <strong>{createdByName}</strong>
              </div>

              <div>
                <span>Created On</span>
                <strong>
                  {formatDateTime(
                    quotation?.createdAt
                  )}
                </strong>
              </div>

              <div>
                <span>Updated On</span>
                <strong>
                  {formatDateTime(
                    quotation?.updatedAt
                  )}
                </strong>
              </div>

              {configuration?.configurationNumber && (
                <div>
                  <span>Configuration</span>
                  <strong>
                    {configuration.configurationNumber}
                  </strong>
                </div>
              )}
            </div>
          </section>

          {/* ACTIONS */}

          <section className="admin-quotation-sidebar-card admin-quotation-sidebar-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={handleDownloadPDF}
              disabled={downloading}
            >
              {downloading
                ? "Preparing PDF..."
                : "↓ Download Quotation"}
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                router.push("/admin/quotations")
              }
            >
              Back to List
            </Button>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default QuotationDetailsPage;
