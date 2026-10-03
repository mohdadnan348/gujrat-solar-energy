const escapeHtml = (value) => {
  if (value === null || value === undefined) return "";

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const formatCurrency = (value) => {
  const amount = Number(value || 0);

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
};

const formatNumber = (value) => {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
};

const formatDate = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const nl2br = (value) => {
  return escapeHtml(value).replace(/\r?\n/g, "<br>");
};

const asArray = (value) => {
  return Array.isArray(value) ? value.filter(Boolean) : [];
};

const firstValue = (...values) => {
  return values.find(
    (value) =>
      value !== undefined &&
      value !== null &&
      value !== ""
  );
};

const infoRow = (label, value) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return "";
  }

  return `
    <div class="info-row">
      <span class="info-label">
        ${escapeHtml(label)}
      </span>

      <span class="info-value">
        ${escapeHtml(value)}
      </span>
    </div>
  `;
};

const pageHeader = (
  companyName,
  logo,
  title,
  number
) => {
  return `
    <div class="page-header">

      <div class="brand">

        ${
          logo
            ? `
              <img
                class="header-logo"
                src="${escapeHtml(logo)}"
                alt="${escapeHtml(companyName)}"
              />
            `
            : `
              <div class="logo-placeholder">
                ${escapeHtml(companyName)}
              </div>
            `
        }

        <div>
          <div class="brand-name">
            ${escapeHtml(companyName)}
          </div>

          <div class="brand-sub">
            SOLAR ENERGY SOLUTIONS
          </div>
        </div>

      </div>

      <div class="document-heading">

        <div class="document-title">
          ${escapeHtml(title)}
        </div>

        ${
          number
            ? `
              <div class="document-number">
                ${escapeHtml(number)}
              </div>
            `
            : ""
        }

      </div>

    </div>
  `;
};

const pageFooter = (
  companyName,
  section,
  page
) => {
  return `
    <div class="footer">

      <span>
        ${escapeHtml(companyName)}
      </span>

      <span>
        ${escapeHtml(section)}
      </span>

      <span>
        Page ${page}
      </span>

    </div>
  `;
};

const renderQuotationItems = (items) => {
  const rows = asArray(items);

  if (!rows.length) {
    return `
      <tr>
        <td colspan="9" class="empty">
          No quotation items available
        </td>
      </tr>
    `;
  }

  return rows
    .map((item, index) => {
      const itemName =
        item.name ||
        item.item ||
        item.description ||
        "";

      return `
        <tr>

          <td class="center">
            ${index + 1}
          </td>

          <td>
            ${escapeHtml(
              item.category || ""
            )}
          </td>

          <td>
            <strong>
              ${escapeHtml(itemName)}
            </strong>

            ${
              item.description &&
              item.name
                ? `
                  <div class="small-text">
                    ${escapeHtml(
                      item.description
                    )}
                  </div>
                `
                : ""
            }
          </td>

          <td class="right">
            ${formatNumber(
              item.quantity
            )}
          </td>

          <td class="center">
            ${escapeHtml(
              item.unit || ""
            )}
          </td>

          <td class="right">
            ${formatCurrency(
              item.rate
            )}
          </td>

          <td class="right">
            ${formatCurrency(
              item.discount
            )}
          </td>

          <td class="right">
            ${formatCurrency(
              item.taxAmount
            )}
          </td>

          <td class="right bold">
            ${formatCurrency(
              item.amount
            )}
          </td>

        </tr>
      `;
    })
    .join("");
};

const renderBOMRows = (items) => {
  const rows = asArray(items);

  if (!rows.length) {
    return `
      <tr>
        <td colspan="8" class="empty">
          No BOM items available
        </td>
      </tr>
    `;
  }

  return rows
    .map((item, index) => {
      return `
        <tr>

          <td class="center">
            ${escapeHtml(
              item.srNo ||
              index + 1
            )}
          </td>

          <td>
            ${escapeHtml(
              item.category || ""
            )}
          </td>

          <td>
            <strong>
              ${escapeHtml(
                item.item ||
                item.name ||
                ""
              )}
            </strong>
          </td>

          <td>
            ${escapeHtml(
              item.specification || ""
            )}
          </td>

          <td>
            ${escapeHtml(
              item.brand || ""
            )}
          </td>

          <td class="right">
            ${formatNumber(
              item.qty ??
              item.quantity
            )}
          </td>

          <td class="center">
            ${escapeHtml(
              item.unit || ""
            )}
          </td>

          <td class="center">
            ${
              item.createdAt
                ? formatDate(
                    item.createdAt
                  )
                : ""
            }
          </td>

        </tr>
      `;
    })
    .join("");
};


/* =========================================================
   DYNAMIC SOLAR PANEL LAYOUT
========================================================= */

const getPanelGrid = (panelCount) => {
  const count = Math.max(
    1,
    Number(panelCount || 0)
  );

  const possibleColumns = [
    2,
    3,
    4,
    5,
    6,
    8,
    10,
  ];

  let best = {
    rows: count,
    columns: 1,
    score: Infinity,
  };

  for (const columns of possibleColumns) {
    const rows = Math.ceil(
      count / columns
    );

    const score =
      Math.abs(rows - columns);

    if (
      score < best.score &&
      columns <= count
    ) {
      best = {
        rows,
        columns,
        score,
      };
    }
  }

  return {
    rows: best.rows,
    columns: best.columns,
  };
};

const renderPanelLayout = ({
  panelCount,
  panelWattage,
  panelBrand,
  systemCapacity,
}) => {
  const count = Math.max(
    1,
    Number(panelCount || 0)
  );

  const grid = getPanelGrid(count);

  const panels = [];

  for (
    let index = 0;
    index < count;
    index += 1
  ) {
    panels.push(`
      <div class="solar-panel">

        <div class="panel-cell"></div>

        <span class="panel-number">
          P${String(
            index + 1
          ).padStart(2, "0")}
        </span>

      </div>
    `);
  }

  return `
    <div class="panel-layout-card">

      <div class="diagram-heading">

        <div>

          <div class="diagram-title">
            ROOFTOP PANEL LAYOUT
          </div>

          <div class="diagram-subtitle">

            ${escapeHtml(
              panelBrand ||
              "Solar Panel"
            )}

            ${
              panelWattage
                ? ` • ${escapeHtml(
                    panelWattage
                  )} W`
                : ""
            }

          </div>

        </div>


        <div class="diagram-capacity">

          ${
            systemCapacity
              ? escapeHtml(
                  systemCapacity
                )
              : "-"
          }

          kW

        </div>

      </div>


      <div class="roof-area">

        <div class="roof-label">
          ROOFTOP / PANEL ARRAY
        </div>


        <div
          class="panel-grid"
          style="
            grid-template-columns:
              repeat(${grid.columns}, 1fr);
          "
        >

          ${panels.join("")}

        </div>

      </div>


      <div class="panel-legend">

        <span>
          <i class="legend-panel"></i>
          Solar Panel
        </span>

        <span>
          Total Panels:
          <strong>
            ${count}
          </strong>
        </span>

        ${
          panelWattage
            ? `
              <span>
                Panel:
                <strong>
                  ${escapeHtml(
                    panelWattage
                  )} W
                </strong>
              </span>
            `
            : ""
        }

      </div>

    </div>
  `;
};


/* =========================================================
   DYNAMIC ELECTRICAL FLOW DIAGRAM
========================================================= */

const renderElectricalFlow = ({
  systemType,
  systemCapacity,
  panelCount,
  inverterBrand,
  inverterCapacity,
  inverterCount,
  batteryCount,
}) => {
  const batteryRequired =
    Number(
      batteryCount || 0
    ) > 0;

  const systemLabel =
    systemType === "OFF_GRID"
      ? "OFF-GRID"
      : systemType === "HYBRID"
        ? "HYBRID"
        : "ON-GRID";

  return `
    <div class="electrical-diagram">

      <div class="diagram-heading">

        <div>

          <div class="diagram-title">
            ELECTRICAL FLOW DIAGRAM
          </div>

          <div class="diagram-subtitle">
            ${escapeHtml(
              systemLabel
            )}
            SOLAR SYSTEM
          </div>

        </div>


        <div class="flow-capacity">

          ${
            systemCapacity
              ? escapeHtml(
                  systemCapacity
                )
              : "-"
          }

          kW

        </div>

      </div>


      <div class="flow">

        <div class="flow-node solar-node">

          <div class="flow-icon">
            ☀
          </div>

          <div class="flow-node-title">
            SOLAR PANELS
          </div>

          <div class="flow-node-sub">
            ${panelCount} Panels
          </div>

        </div>


        <div class="flow-arrow">

          <span>
            DC
          </span>

          ↓

        </div>


        <div class="flow-node protection-node">

          <div class="flow-icon">
            ⛨
          </div>

          <div class="flow-node-title">
            DC PROTECTION
          </div>

          <div class="flow-node-sub">
            DCDB / SPD
          </div>

        </div>


        <div class="flow-arrow">

          <span>
            DC
          </span>

          ↓

        </div>


        <div class="flow-node inverter-node">

          <div class="flow-icon">
            ⚡
          </div>

          <div class="flow-node-title">
            INVERTER
          </div>

          <div class="flow-node-sub">

            ${escapeHtml(
              inverterBrand ||
              "Solar Inverter"
            )}

          </div>


          ${
            inverterCapacity
              ? `
                <div class="flow-node-capacity">

                  ${escapeHtml(
                    inverterCapacity
                  )} kW

                  ${
                    inverterCount > 1
                      ? ` × ${inverterCount}`
                      : ""
                  }

                </div>
              `
              : ""
          }

        </div>


        ${
          batteryRequired
            ? `
              <div class="flow-side">

                <div class="battery-line">
                  ↔
                </div>

                <div class="flow-node battery-node">

                  <div class="flow-icon">
                    ▣
                  </div>

                  <div class="flow-node-title">
                    BATTERY
                  </div>

                  <div class="flow-node-sub">
                    ${batteryCount} Unit
                  </div>

                </div>

              </div>
            `
            : ""
        }


        <div class="flow-arrow">

          <span>
            AC
          </span>

          ↓

        </div>


        <div class="flow-node protection-node">

          <div class="flow-icon">
            ⛨
          </div>

          <div class="flow-node-title">
            AC PROTECTION
          </div>

          <div class="flow-node-sub">
            ACDB / SPD
          </div>

        </div>


        <div class="flow-arrow">

          <span>
            AC
          </span>

          ↓

        </div>


        ${
          systemType === "OFF_GRID"
            ? `
              <div class="flow-node load-node">

                <div class="flow-icon">
                  ⌂
                </div>

                <div class="flow-node-title">
                  HOME / LOAD
                </div>

                <div class="flow-node-sub">
                  Electrical Load
                </div>

              </div>
            `
            : `
              <div class="flow-node meter-node">

                <div class="flow-icon">
                  ◉
                </div>

                <div class="flow-node-title">
                  NET METER
                </div>

                <div class="flow-node-sub">
                  Bi-directional Meter
                </div>

              </div>


              <div class="flow-arrow">

                <span>
                  AC
                </span>

                ↓

              </div>


              <div class="flow-node load-node">

                <div class="flow-icon">
                  ⌂
                </div>

                <div class="flow-node-title">
                  HOME / LOAD
                </div>

                <div class="flow-node-sub">
                  Electrical Load
                </div>

              </div>


              <div class="grid-connection">

                <div class="grid-line"></div>

                <div class="grid-node">
                  GRID
                </div>

              </div>
            `
        }

      </div>


      <div class="flow-note">

        <strong>
          Energy Flow:
        </strong>

        Solar panels generate DC power →
        inverter converts DC to AC →
        AC protection →
        customer load / grid.

      </div>

    </div>
  `;
};


/* =========================================================
   TECHNICAL SUMMARY
========================================================= */

const renderTechnicalSummary = ({
  systemCapacity,
  systemType,
  panelCount,
  panelBrand,
  panelWattage,
  inverterBrand,
  inverterCapacity,
  inverterCount,
  batteryCount,
  structure,
  accessories,
}) => {
  const cable =
    accessories.find(
      (item) =>
        /cable/i.test(
          `${item.name || ""} ${
            item.specifications?.name ||
            ""
          }`
        )
    );

  const earthing =
    accessories.find(
      (item) =>
        /earth|earthing/i.test(
          `${item.name || ""} ${
            item.specifications?.name ||
            ""
          }`
        )
    );

  const protection =
    accessories.find(
      (item) =>
        /protection|spd|dcdb|acdb/i.test(
          `${item.name || ""} ${
            item.specifications?.name ||
            ""
          }`
        )
    );

  return `
    <div class="technical-summary">

      <div class="technical-item">
        <span>
          Capacity
        </span>

        <strong>
          ${
            systemCapacity
              ? escapeHtml(
                  systemCapacity
                ) + " kW"
              : "-"
          }
        </strong>
      </div>


      <div class="technical-item">
        <span>
          System
        </span>

        <strong>
          ${escapeHtml(
            systemType || "-"
          )}
        </strong>
      </div>


      <div class="technical-item">
        <span>
          Panels
        </span>

        <strong>
          ${escapeHtml(
            panelCount || "-"
          )}
        </strong>
      </div>


      <div class="technical-item">
        <span>
          Panel Make
        </span>

        <strong>
          ${escapeHtml(
            panelBrand || "-"
          )}
        </strong>
      </div>


      <div class="technical-item">
        <span>
          Panel Wattage
        </span>

        <strong>
          ${
            panelWattage
              ? escapeHtml(
                  panelWattage
                ) + " W"
              : "-"
          }
        </strong>
      </div>


      <div class="technical-item">
        <span>
          Inverter
        </span>

        <strong>
          ${escapeHtml(
            inverterBrand || "-"
          )}
        </strong>
      </div>


      <div class="technical-item">
        <span>
          Inverter Capacity
        </span>

        <strong>
          ${
            inverterCapacity
              ? escapeHtml(
                  inverterCapacity
                ) + " kW"
              : "-"
          }
        </strong>
      </div>


      <div class="technical-item">
        <span>
          Inverter Count
        </span>

        <strong>
          ${escapeHtml(
            inverterCount || "-"
          )}
        </strong>
      </div>


      <div class="technical-item">
        <span>
          Battery
        </span>

        <strong>
          ${
            Number(
              batteryCount || 0
            ) > 0
              ? `${batteryCount} Unit`
              : "Not Required"
          }
        </strong>
      </div>


      <div class="technical-item">
        <span>
          Structure
        </span>

        <strong>
          ${escapeHtml(
            structure.name ||
            structure.brand ||
            "-"
          )}
        </strong>
      </div>


      <div class="technical-item">
        <span>
          Cable
        </span>

        <strong>
          ${escapeHtml(
            cable?.name || "-"
          )}
        </strong>
      </div>


      <div class="technical-item">
        <span>
          Protection
        </span>

        <strong>
          ${escapeHtml(
            protection?.name || "-"
          )}
        </strong>
      </div>

    </div>
  `;
};


/* =========================================================
   MAIN TEMPLATE
========================================================= */

const quotationTemplate = (
  data = {}
) => {

  const quotation =
    data.quotation || {};

  const company =
    data.company || {};

  const bankDetails =
    data.bankDetails || {};

  const signature =
    data.signature || {};

  const customer =
    data.customerDetails ||
    quotation.customerDetails ||
    {};

  const proposal =
    data.proposalContent || {};

  const proposalSettings =
    data.proposalSettings || {};

  const quotationSettings =
    data.quotationSettings || {};

  const system =
    quotation.systemConfiguration ||
    {};

  const solarRequirement =
    quotation.solarRequirement ||
    {};

  const components =
    asArray(
      system.components
    );

  const panel =
    components.find(
      (item) =>
        item.componentType ===
        "SOLAR_PANEL"
    ) || {};

  const inverter =
    components.find(
      (item) =>
        item.componentType ===
        "INVERTER"
    ) || {};

  const battery =
    components.find(
      (item) =>
        item.componentType ===
        "BATTERY"
    ) || {};

  const structure =
    components.find(
      (item) =>
        item.componentType ===
        "STRUCTURE"
    ) || {};

  const accessories =
    components.filter(
      (item) =>
        item.componentType ===
        "ACCESSORY"
    );


  const companyName =
    company.name ||
    company.legalName ||
    "GUJRAT SOLAR ENERGY";


  const companyAddress = [
    company.address,
    company.city,
    company.state,
    company.pincode,
  ]
    .filter(Boolean)
    .join(", ");


  const customerName =
    customer.name ||
    customer.customerName ||
    quotation.customer?.name ||
    quotation.lead?.name ||
    "Customer";


  const customerAddress = [
    customer.address,
    customer.city,
    customer.state,
    customer.pincode,
  ]
    .filter(Boolean)
    .join(", ");


  const quotationNumber =
    data.quotationNumber ||
    quotation.quotationNumber ||
    "QUOTATION";


  const quotationDate =
    quotation.quotationDate ||
    quotation.date ||
    quotation.createdAt;


  const expiryDate =
    quotation.expiryDate ||
    quotation.validUntil;


  const systemCapacity =
    firstValue(
      system.systemCapacity,
      system.capacity,
      quotation.systemCapacity
    );


  const systemType =
    firstValue(
      system.systemType,
      quotation.systemType,
      "ON_GRID"
    );


  const panelCount =
    firstValue(
      system.panelCount,
      panel.quantity,
      0
    );


  const panelWattage =
    firstValue(
      panel.specifications?.wattage,
      panel.capacity
    );


  const panelBrand =
    firstValue(
      panel.brand,
      panel.name
    );


  const inverterCount =
    firstValue(
      system.inverterCount,
      inverter.quantity,
      0
    );


  const inverterBrand =
    firstValue(
      inverter.brand,
      inverter.name
    );


  const inverterCapacity =
    firstValue(
      inverter.specifications?.capacity,
      inverter.capacity
    );


  const batteryCount =
    firstValue(
      system.batteryCount,
      battery.quantity,
      0
    );


  const photos =
    quotation.productPhotos ||
    proposal.productPhotos ||
    [];


  const testimonials =
    data.testimonials ||
    proposal.testimonials ||
    [];


  const totals =
    data.totals || {};


  const companyProfile =
    proposal.companyProfile ||
    company.companyProfile ||
    `We provide professional solar energy solutions
for residential, commercial and industrial
requirements with a focus on quality, safety
and long-term customer value.`;


  const vision =
    proposal.vision ||
    company.vision ||
    `To accelerate the adoption of clean,
reliable and affordable solar energy.`;


  const mission =
    proposal.mission ||
    company.mission ||
    `To deliver professionally designed and
installed solar systems with dependable service.`;


  const paymentTerms =
    data.paymentTerms ||
    proposalSettings.defaultPaymentTerms ||
    "";


  const warrantyTerms =
    data.warrantyTerms ||
    proposalSettings.defaultWarrantyTerms ||
    "";


  const subsidyTerms =
    data.subsidyTerms ||
    proposalSettings.defaultSubsidyTerms ||
    "";


  const installationTerms =
    data.installationTerms ||
    proposalSettings.defaultInstallationTerms ||
    "";


  const scopeOfWork =
    data.scopeOfWork ||
    proposalSettings.defaultScopeOfWork ||
    "";


  const warrantyExclusions =
    data.warrantyExclusions ||
    proposalSettings.defaultWarrantyExclusions ||
    "";


  const validity =
    data.quotationValidity ||
    quotation.quotationValidity ||
    quotationSettings.validityDays ||
    "As mentioned in quotation";


  return `<!DOCTYPE html>

<html lang="en">

<head>

<meta charset="UTF-8" />

<title>
${escapeHtml(
  quotationNumber
)}
</title>


<style>

/* =========================================================
   PRINT
========================================================= */

@page {
  size: A4;
  margin: 0;
}

* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;

  background: #fff;

  color: #222;

  font-family:
    Arial,
    Helvetica,
    sans-serif;

  -webkit-print-color-adjust: exact;

  print-color-adjust: exact;
}

body {
  font-size: 10px;

  line-height: 1.45;
}

.page {
  width: 210mm;

  height: 297mm;

  min-height: 297mm;

  position: relative;

  overflow: hidden;

  padding:
    14mm
    15mm
    18mm;

  background: #fff;

  page-break-after: always;
}

.page:last-child {
  page-break-after: auto;
}


/* =========================================================
   COMMON
========================================================= */

.page-header {
  height: 24mm;

  display: flex;

  align-items: center;

  justify-content: space-between;

  border-bottom:
    1px solid #dedede;

  margin-bottom: 8mm;
}

.brand {
  display: flex;

  align-items: center;

  gap: 8px;
}

.header-logo {
  width: 28mm;

  max-height: 16mm;

  object-fit: contain;
}

.logo-placeholder {
  width: 28mm;

  color: #c62828;

  font-size: 9px;

  font-weight: 900;
}

.brand-name {
  font-size: 13px;

  font-weight: 900;
}

.brand-sub {
  color: #c62828;

  font-size: 7px;

  font-weight: 700;

  letter-spacing: 1px;

  margin-top: 2px;
}

.document-heading {
  text-align: right;
}

.document-title {
  color: #c62828;

  font-size: 15px;

  font-weight: 900;
}

.document-number {
  color: #777;

  font-size: 8px;

  margin-top: 2px;
}

.footer {
  position: absolute;

  left: 15mm;

  right: 15mm;

  bottom: 7mm;

  display: flex;

  justify-content: space-between;

  border-top:
    1px solid #ddd;

  padding-top: 3mm;

  color: #777;

  font-size: 7px;
}

.section-title {
  font-size: 18px;

  font-weight: 900;

  text-transform: uppercase;

  margin-bottom: 6mm;
}

.section-title::after {
  content: "";

  display: block;

  width: 25mm;

  border-bottom:
    3px solid #c62828;

  margin-top: 2mm;
}

.two-column {
  display: grid;

  grid-template-columns:
    1fr 1fr;

  gap: 6mm;
}

.info-card {
  border:
    1px solid #ddd;

  background: #fff;

  padding: 5mm;
}

.info-card-title {
  color: #c62828;

  font-size: 10px;

  font-weight: 900;

  text-transform: uppercase;

  margin-bottom: 3mm;
}

.info-row {
  display: flex;

  gap: 5mm;

  padding: 2mm 0;

  border-bottom:
    1px dotted #ddd;
}

.info-label {
  width: 38%;

  color: #777;

  font-size: 8px;
}

.info-value {
  width: 62%;

  font-size: 8.5px;

  font-weight: 700;
}

.red-card {
  background: #c62828;

  color: #fff;

  padding: 7mm;
}

.red-card h3 {
  margin:
    0 0 3mm;

  font-size: 13px;
}

.red-card p {
  margin: 0;
}

.feature-grid {
  display: grid;

  grid-template-columns:
    repeat(3, 1fr);

  gap: 5mm;

  margin-top: 7mm;
}

.feature {
  border:
    1px solid #ddd;

  padding: 5mm;

  min-height: 28mm;
}

.feature-icon {
  width: 9mm;

  height: 9mm;

  display: flex;

  align-items: center;

  justify-content: center;

  background: #c62828;

  color: #fff;

  border-radius: 50%;

  font-weight: 900;

  margin-bottom: 3mm;
}

.feature strong {
  display: block;

  font-size: 9px;
}

.feature span {
  display: block;

  margin-top: 2px;

  color: #777;

  font-size: 7.5px;
}

.muted {
  color: #777;
}

.small-text {
  color: #777;

  font-size: 7.5px;

  margin-top: 2px;
}

.bold {
  font-weight: 700;
}

.center {
  text-align: center;
}

.right {
  text-align: right;
}

.empty {
  text-align: center;

  color: #777;

  padding: 10px;
}


/* =========================================================
   COVER
========================================================= */

.cover {
  padding: 0;

  background:
    linear-gradient(
      to bottom,
      #ffffff 0%,
      #ffffff 72%,
      #f5f5f5 72%,
      #f5f5f5 100%
    );
}

.cover-top {
  height: 48mm;

  padding:
    15mm
    17mm
    0;

  display: flex;

  justify-content: space-between;

  align-items: flex-start;
}

.cover-logo {
  max-width: 55mm;

  max-height: 22mm;

  object-fit: contain;
}

.cover-company {
  color: #c62828;

  font-size: 9px;

  font-weight: 900;

  letter-spacing: 1px;
}

.cover-estimate {
  text-align: right;
}

.cover-estimate-label {
  color: #777;

  font-size: 8px;
}

.cover-estimate-number {
  color: #c62828;

  font-size: 15px;

  font-weight: 900;

  margin-top: 3px;
}

.cover-main {
  padding:
    17mm
    18mm
    0;
}

.cover-kicker {
  color: #c62828;

  font-size: 9px;

  font-weight: 900;

  letter-spacing: 2px;

  margin-bottom: 6mm;
}

.cover-title {
  max-width: 160mm;

  font-size: 34px;

  line-height: 1.04;

  font-weight: 900;

  text-transform: uppercase;
}

.cover-title span {
  color: #c62828;
}

.cover-subtitle {
  max-width: 120mm;

  margin-top: 6mm;

  font-size: 13px;

  color: #666;
}

.cover-info {
  max-width: 165mm;

  margin-top: 14mm;

  display: grid;

  grid-template-columns:
    1fr 1fr;

  gap: 5mm;
}

.cover-info-box {
  min-height: 24mm;

  padding:
    4mm
    5mm;

  background: #fff;

  border-left:
    4px solid #c62828;

  box-shadow:
    0 2px 10px
    rgba(0,0,0,.06);
}

.cover-info-label {
  color: #999;

  font-size: 7px;

  text-transform: uppercase;

  letter-spacing: .8px;
}

.cover-info-value {
  margin-top: 2mm;

  font-size: 13px;

  font-weight: 900;
}

.cover-visual {
  position: absolute;

  right: 0;

  bottom: 32mm;

  width: 85mm;

  height: 66mm;

  overflow: hidden;

  background: #eee;

  clip-path:
    polygon(
      20% 0,
      100% 0,
      100% 100%,
      0 100%
    );
}

.cover-visual img {
  width: 100%;

  height: 100%;

  object-fit: cover;
}

.cover-placeholder {
  width: 100%;

  height: 100%;

  display: flex;

  align-items: center;

  justify-content: center;

  color: #c62828;

  font-size: 45px;

  font-weight: 900;
}

.cover-bottom {
  position: absolute;

  left: 0;

  right: 0;

  bottom: 0;

  min-height: 32mm;

  padding:
    8mm
    17mm;

  display: flex;

  align-items: center;

  justify-content: space-between;

  background: #c62828;

  color: #fff;
}

.cover-contact {
  font-size: 8px;

  line-height: 1.7;
}

.cover-capacity {
  text-align: right;
}

.cover-capacity-value {
  font-size: 22px;

  font-weight: 900;
}

.cover-capacity-label {
  font-size: 7px;
}


/* =========================================================
   PHOTOS
========================================================= */

.photo-grid {
  display: grid;

  grid-template-columns:
    1fr 1fr;

  gap: 6mm;
}

.photo-card,
.photo-placeholder {
  height: 80mm;

  position: relative;

  overflow: hidden;

  border:
    1px solid #ddd;

  background: #f7f7f7;
}

.photo-card img {
  width: 100%;

  height: 100%;

  object-fit: cover;
}

.photo-caption {
  position: absolute;

  left: 0;

  right: 0;

  bottom: 0;

  padding:
    12mm
    4mm
    4mm;

  color: #fff;

  font-weight: 700;

  background:
    linear-gradient(
      transparent,
      rgba(0,0,0,.8)
    );
}

.photo-placeholder {
  display: flex;

  align-items: center;

  justify-content: center;

  flex-direction: column;

  color: #666;
}

.photo-icon {
  color: #c62828;

  font-size: 32px;

  margin-bottom: 3mm;
}


/* =========================================================
   TABLE
========================================================= */

table {
  width: 100%;

  border-collapse: collapse;
}

th {
  padding: 5px;

  color: #fff;

  background: #c62828;

  border:
    1px solid #c62828;

  font-size: 7px;

  text-transform: uppercase;

  text-align: left;
}

td {
  padding: 5px;

  border:
    1px solid #ddd;

  vertical-align: top;

  font-size: 7.5px;
}

tbody tr:nth-child(even) td {
  background: #fafafa;
}

.quotation-meta {
  display: grid;

  grid-template-columns:
    1fr 1fr;

  gap: 6mm;

  margin-bottom: 6mm;
}

.summary {
  width: 75%;

  margin-left: auto;

  margin-top: 5mm;
}

.summary-row {
  display: flex;

  justify-content: space-between;

  padding:
    2.5mm
    3mm;

  border-bottom:
    1px solid #eee;
}

.summary-total {
  display: flex;

  justify-content: space-between;

  padding:
    4mm
    3mm;

  color: #fff;

  background: #c62828;

  font-size: 12px;

  font-weight: 900;
}

.amount-box {
  margin-top: 5mm;

  padding: 4mm;

  border:
    1px solid #ddd;

  font-size: 8px;
}


/* =========================================================
   SOLAR PANEL DIAGRAM
========================================================= */

.panel-layout-card {
  margin-top: 5mm;

  padding: 5mm;

  border:
    1px solid #d8d8d8;

  background:
    linear-gradient(
      135deg,
      #fafafa,
      #f1f1f1
    );
}

.diagram-heading {
  display: flex;

  justify-content: space-between;

  align-items: center;

  margin-bottom: 5mm;

  padding-bottom: 3mm;

  border-bottom:
    1px solid #ddd;
}

.diagram-title {
  color: #c62828;

  font-size: 11px;

  font-weight: 900;

  letter-spacing: .5px;
}

.diagram-subtitle {
  margin-top: 2px;

  color: #777;

  font-size: 7.5px;
}

.diagram-capacity,
.flow-capacity {
  color: #c62828;

  font-size: 17px;

  font-weight: 900;
}

.roof-area {
  min-height: 92mm;

  padding: 8mm;

  position: relative;

  border:
    2px solid #aaa;

  background:
    repeating-linear-gradient(
      45deg,
      #ededed,
      #ededed 5px,
      #e4e4e4 5px,
      #e4e4e4 10px
    );
}

.roof-label {
  text-align: center;

  color: #777;

  font-size: 7px;

  font-weight: 800;

  letter-spacing: 1px;

  margin-bottom: 5mm;
}

.panel-grid {
  display: grid;

  gap: 3px;

  width: 100%;

  max-width: 155mm;

  margin: 0 auto;
}

.solar-panel {
  min-height: 16mm;

  position: relative;

  border:
    2px solid #1f2937;

  background:
    linear-gradient(
      135deg,
      #334155,
      #111827
    );

  overflow: hidden;

  box-shadow:
    inset 0 0 0 1px
    rgba(255,255,255,.25);
}

.solar-panel::before,
.solar-panel::after {
  content: "";

  position: absolute;

  background:
    rgba(255,255,255,.28);
}

.solar-panel::before {
  left: 50%;

  top: 0;

  bottom: 0;

  width: 1px;
}

.solar-panel::after {
  top: 50%;

  left: 0;

  right: 0;

  height: 1px;
}

.panel-number {
  position: absolute;

  left: 50%;

  top: 50%;

  transform:
    translate(
      -50%,
      -50%
    );

  color: #fff;

  font-size: 6px;

  font-weight: 900;

  z-index: 2;
}

.panel-cell {
  position: absolute;

  inset: 2px;

  border:
    1px solid
    rgba(255,255,255,.2);
}

.panel-legend {
  display: flex;

  justify-content: space-between;

  margin-top: 4mm;

  color: #666;

  font-size: 7.5px;
}

.panel-legend span {
  display: flex;

  align-items: center;

  gap: 3px;
}

.legend-panel {
  display: inline-block;

  width: 8px;

  height: 8px;

  background: #1f2937;

  border:
    1px solid #111827;
}


/* =========================================================
   ELECTRICAL FLOW
========================================================= */

.electrical-diagram {
  margin-top: 7mm;

  padding: 5mm;

  border:
    1px solid #d8d8d8;

  background: #fff;
}

.flow {
  position: relative;

  display: flex;

  flex-direction: column;

  align-items: center;
}

.flow-node {
  width: 52mm;

  min-height: 22mm;

  padding: 4mm;

  text-align: center;

  border:
    2px solid #444;

  background: #fff;

  position: relative;

  z-index: 2;
}

.solar-node {
  border-color: #c62828;

  background: #fff8f8;
}

.inverter-node {
  border-color: #c62828;

  background: #fff;
}

.protection-node {
  width: 45mm;

  min-height: 17mm;

  border-color: #555;

  background: #f7f7f7;
}

.meter-node {
  border-color: #555;

  background: #f7f7f7;
}

.load-node {
  border-color: #c62828;

  background: #fff8f8;
}

.battery-node {
  width: 42mm;

  border-color: #555;

  background: #f7f7f7;
}

.flow-icon {
  font-size: 17px;

  color: #c62828;

  margin-bottom: 2px;
}

.flow-node-title {
  font-size: 8px;

  font-weight: 900;

  letter-spacing: .4px;
}

.flow-node-sub {
  color: #777;

  font-size: 7px;

  margin-top: 2px;
}

.flow-node-capacity {
  color: #c62828;

  font-size: 7px;

  font-weight: 900;

  margin-top: 2px;
}

.flow-arrow {
  height: 11mm;

  display: flex;

  flex-direction: column;

  align-items: center;

  justify-content: center;

  color: #c62828;

  font-size: 15px;

  font-weight: 900;
}

.flow-arrow span {
  font-size: 6px;

  letter-spacing: 1px;
}

.flow-side {
  position: absolute;

  left: calc(50% + 31mm);

  margin-top: 91mm;

  display: flex;

  align-items: center;

  gap: 2mm;
}

.battery-line {
  color: #c62828;

  font-size: 15px;

  font-weight: 900;
}

.grid-connection {
  position: absolute;

  right: 8mm;

  bottom: 10mm;

  display: flex;

  align-items: center;

  gap: 3mm;
}

.grid-line {
  width: 30mm;

  border-top:
    2px dashed #c62828;
}

.grid-node {
  padding:
    3mm
    5mm;

  border:
    2px solid #c62828;

  color: #c62828;

  font-size: 8px;

  font-weight: 900;
}

.flow-note {
  margin-top: 5mm;

  padding: 4mm;

  color: #555;

  background: #fff8f8;

  border-left:
    3px solid #c62828;

  font-size: 7.5px;
}


/* =========================================================
   TECHNICAL SUMMARY
========================================================= */

.technical-summary {
  display: grid;

  grid-template-columns:
    repeat(4, 1fr);

  gap: 3mm;

  margin-top: 5mm;
}

.technical-item {
  padding: 3mm;

  border:
    1px solid #ddd;

  background: #fafafa;
}

.technical-item span {
  display: block;

  color: #888;

  font-size: 6.5px;

  text-transform: uppercase;
}

.technical-item strong {
  display: block;

  margin-top: 1mm;

  color: #222;

  font-size: 8px;
}


/* =========================================================
   TERMS
========================================================= */

.terms-box {
  padding: 5mm;

  margin-bottom: 4mm;

  border:
    1px solid #ddd;
}

.terms-box h3 {
  margin:
    0 0 3mm;

  color: #c62828;

  font-size: 10px;

  text-transform: uppercase;
}

.terms-box p {
  margin: 0;

  font-size: 8px;
}

.bank-signature {
  display: grid;

  grid-template-columns:
    1fr 1fr;

  gap: 6mm;

  margin-top: 5mm;
}

.bank-box,
.signature-box {
  padding: 5mm;

  border:
    1px solid #ddd;
}

.box-title {
  color: #c62828;

  font-size: 10px;

  font-weight: 900;

  text-transform: uppercase;

  margin-bottom: 3mm;
}

.signature-box {
  text-align: center;

  min-height: 50mm;
}

.signature-image {
  max-width: 45mm;

  max-height: 18mm;

  object-fit: contain;
}

.signature-line {
  width: 55mm;

  margin:
    8mm
    auto
    0;

  padding-top: 2mm;

  border-top:
    1px solid #222;
}


/* =========================================================
   TESTIMONIAL
========================================================= */

.testimonial-grid {
  display: grid;

  grid-template-columns:
    1fr 1fr;

  gap: 6mm;
}

.testimonial {
  min-height: 50mm;

  padding: 6mm;

  border:
    1px solid #ddd;
}

.testimonial-head {
  display: flex;

  align-items: center;

  gap: 3mm;

  margin-bottom: 4mm;
}

.avatar {
  width: 11mm;

  height: 11mm;

  display: flex;

  align-items: center;

  justify-content: center;

  border-radius: 50%;

  background: #c62828;

  color: #fff;

  font-weight: 900;
}

.stars {
  color: #c62828;

  font-size: 8px;

  margin-top: 2px;
}

.testimonial p {
  margin: 0;

  color: #555;

  font-size: 8.5px;

  line-height: 1.6;
}

.testimonial-empty {
  grid-column: 1 / -1;

  padding: 15mm;

  text-align: center;

  border:
    1px solid #ddd;

  background: #fff8f8;
}

.testimonial-star {
  color: #c62828;

  font-size: 35px;
}


/* =========================================================
   THANK YOU
========================================================= */

.thank-page {
  padding: 0;
}

.thank-top {
  height: 90mm;

  padding:
    20mm
    18mm;

  background: #c62828;

  color: #fff;
}

.thank-small {
  font-size: 8px;

  font-weight: 900;

  letter-spacing: 2px;
}

.thank-title {
  margin-top: 7mm;

  font-size: 44px;

  font-weight: 900;
}

.thank-subtitle {
  max-width: 125mm;

  margin-top: 4mm;

  font-size: 12px;
}

.thank-content {
  padding:
    14mm
    18mm;
}

.contact-box {
  max-width: 165mm;

  padding: 8mm;

  border:
    1px solid #ddd;
}

.contact-title {
  color: #c62828;

  font-size: 18px;

  font-weight: 900;

  margin-bottom: 5mm;
}

.contact-grid {
  display: grid;

  grid-template-columns:
    1fr 1fr;

  gap: 4mm;
}

.contact-item {
  padding: 4mm;

  background: #f7f7f7;
}

.contact-item label {
  display: block;

  color: #999;

  font-size: 7px;

  text-transform: uppercase;
}

.contact-item strong {
  display: block;

  margin-top: 2mm;

  font-size: 8.5px;
}

.contact-bottom {
  position: absolute;

  left: 0;

  right: 0;

  bottom: 0;

  padding:
    7mm
    18mm;

  display: flex;

  justify-content: space-between;

  background: #222;

  color: #fff;

  font-size: 7.5px;
}

</style>

</head>

<body>


<!-- ======================================================
     PAGE 1 — COVER
====================================================== -->

<section class="page cover">

  <div class="cover-top">

    <div>

      ${
        company.logo
          ? `
            <img
              class="cover-logo"
              src="${escapeHtml(
                company.logo
              )}"
              alt="${escapeHtml(
                companyName
              )}"
            />
          `
          : `
            <div class="cover-company">
              ${escapeHtml(
                companyName
              )}
            </div>
          `
      }

      <div class="cover-company">
        ${escapeHtml(
          companyName
        )}
      </div>

    </div>


    <div class="cover-estimate">

      <div class="cover-estimate-label">
        SOLAR QUOTATION
      </div>

      <div class="cover-estimate-number">
        ${escapeHtml(
          quotationNumber
        )}
      </div>

      <div class="muted">
        ${formatDate(
          quotationDate
        )}
      </div>

    </div>

  </div>


  <div class="cover-main">

    <div class="cover-kicker">
      CLEAN ENERGY • SMART INVESTMENT
    </div>

    <div class="cover-title">
      ROOFTOP
      <span>SOLAR</span>
      PROPOSAL
    </div>

    <div class="cover-subtitle">

      ${escapeHtml(
        proposal.subtitle ||
        "Complete solar energy solution designed around your requirement."
      )}

    </div>


    <div class="cover-info">

      <div class="cover-info-box">

        <div class="cover-info-label">
          Prepared For
        </div>

        <div class="cover-info-value">
          ${escapeHtml(
            customerName
          )}
        </div>

        ${
          customer.companyName
            ? `
              <div class="muted">
                ${escapeHtml(
                  customer.companyName
                )}
              </div>
            `
            : ""
        }

      </div>


      <div class="cover-info-box">

        <div class="cover-info-label">
          System Capacity
        </div>

        <div class="cover-info-value">

          ${
            systemCapacity
              ? `${escapeHtml(
                  systemCapacity
                )} kW`
              : "-"
          }

        </div>

        <div class="muted">
          ${escapeHtml(
            systemType
          )}
        </div>

      </div>


      <div class="cover-info-box">

        <div class="cover-info-label">
          Location
        </div>

        <div class="cover-info-value">

          ${escapeHtml(
            solarRequirement.location ||
            solarRequirement.siteAddress ||
            customer.city ||
            customer.state ||
            "-"
          )}

        </div>

      </div>


      <div class="cover-info-box">

        <div class="cover-info-label">
          Validity
        </div>

        <div class="cover-info-value">
          ${escapeHtml(
            validity
          )}
        </div>

        ${
          expiryDate
            ? `
              <div class="muted">
                Valid Till:
                ${formatDate(
                  expiryDate
                )}
              </div>
            `
            : ""
        }

      </div>

    </div>

  </div>


  <div class="cover-visual">

    ${
      photos.length
        ? `
          <img
            src="${escapeHtml(
              typeof photos[0] === "string"
                ? photos[0]
                : photos[0]?.url ||
                  photos[0]?.src ||
                  ""
            )}"
            alt="Solar Project"
          />
        `
        : `
          <div class="cover-placeholder">
            ☀
          </div>
        `
    }

  </div>


  <div class="cover-bottom">

    <div class="cover-contact">

      <strong>
        ${escapeHtml(
          companyName
        )}
      </strong>

      <br />

      ${escapeHtml(
        companyAddress
      )}

      <br />

      ${escapeHtml(
        company.phone ||
        company.alternatePhone ||
        ""
      )}

      ${
        company.email
          ? ` • ${escapeHtml(
              company.email
            )}`
          : ""
      }

    </div>


    <div class="cover-capacity">

      <div class="cover-capacity-value">

        ${
          systemCapacity
            ? escapeHtml(
                systemCapacity
              )
            : "-"
        }

        kW

      </div>

      <div class="cover-capacity-label">
        PROPOSED SYSTEM
      </div>

    </div>

  </div>

</section>


<!-- ======================================================
     PAGE 2 — COMPANY PROFILE
====================================================== -->

<section class="page">

${pageHeader(
  companyName,
  company.logo,
  "ABOUT US",
  quotationNumber
)}


<div class="section-title">
  About ${escapeHtml(
    companyName
  )}
</div>


<div class="info-card">

  <p>
    ${nl2br(
      companyProfile
    )}
  </p>

</div>


<div style="height:7mm"></div>


<div class="two-column">

  <div class="red-card">

    <h3>
      Our Vision
    </h3>

    <p>
      ${nl2br(
        vision
      )}
    </p>

  </div>


  <div class="info-card">

    <div class="info-card-title">
      Our Mission
    </div>

    <p>
      ${nl2br(
        mission
      )}
    </p>

  </div>

</div>


<div class="feature-grid">

  <div class="feature">
    <div class="feature-icon">
      ✓
    </div>

    <strong>
      Quality Components
    </strong>

    <span>
      Reliable solar equipment.
    </span>
  </div>


  <div class="feature">
    <div class="feature-icon">
      ⚡
    </div>

    <strong>
      Efficient Solutions
    </strong>

    <span>
      Designed around your requirement.
    </span>
  </div>


  <div class="feature">
    <div class="feature-icon">
      ⌂
    </div>

    <strong>
      Professional Installation
    </strong>

    <span>
      Safe installation process.
    </span>
  </div>


  <div class="feature">
    <div class="feature-icon">
      ₹
    </div>

    <strong>
      Long-Term Value
    </strong>

    <span>
      Designed for energy savings.
    </span>
  </div>


  <div class="feature">
    <div class="feature-icon">
      ★
    </div>

    <strong>
      Customer Support
    </strong>

    <span>
      Support before and after installation.
    </span>
  </div>


  <div class="feature">
    <div class="feature-icon">
      ☀
    </div>

    <strong>
      Clean Energy
    </strong>

    <span>
      Cleaner energy adoption.
    </span>
  </div>

</div>


<div style="height:8mm"></div>


<div class="section-title">
  Customer & System
</div>


<div class="two-column">

  <div class="info-card">

    <div class="info-card-title">
      Customer Details
    </div>

    ${infoRow(
      "Name",
      customerName
    )}

    ${infoRow(
      "Company",
      customer.companyName
    )}

    ${infoRow(
      "Mobile",
      customer.mobile ||
      customer.phone
    )}

    ${infoRow(
      "Email",
      customer.email
    )}

    ${infoRow(
      "Address",
      customerAddress
    )}

    ${infoRow(
      "GSTIN",
      customer.gstin ||
      customer.gstNumber
    )}

  </div>


  <div class="info-card">

    <div class="info-card-title">
      Solar System
    </div>

    ${infoRow(
      "Capacity",
      systemCapacity
        ? `${systemCapacity} kW`
        : ""
    )}

    ${infoRow(
      "System Type",
      systemType
    )}

    ${infoRow(
      "Panel Count",
      panelCount
    )}

    ${infoRow(
      "Panel Make",
      panelBrand
    )}

    ${infoRow(
      "Panel Wattage",
      panelWattage
        ? `${panelWattage} W`
        : ""
    )}

    ${infoRow(
      "Inverter",
      inverterBrand
    )}

    ${infoRow(
      "Inverter Capacity",
      inverterCapacity
        ? `${inverterCapacity} kW`
        : ""
    )}

    ${infoRow(
      "Battery",
      Number(
        batteryCount
      ) > 0
        ? `${batteryCount} Unit`
        : "Not Required"
    )}

  </div>

</div>


${pageFooter(
  companyName,
  "Company Profile",
  2
)}

</section>


<!-- ======================================================
     PAGE 3 — PRODUCTS
====================================================== -->

<section class="page">

${pageHeader(
  companyName,
  company.logo,
  "SOLAR PRODUCTS",
  quotationNumber
)}


<div class="section-title">
  Solar Products & Solutions
</div>


<div class="photo-grid">

  ${
    (() => {

      const list =
        asArray(photos);

      if (!list.length) {

        return `
          <div class="photo-placeholder">

            <div class="photo-icon">
              ☀
            </div>

            <strong>
              Solar Panels
            </strong>

            <span>
              Solar Product
            </span>

          </div>


          <div class="photo-placeholder">

            <div class="photo-icon">
              ⚡
            </div>

            <strong>
              Solar Inverter
            </strong>

            <span>
              Solar Equipment
            </span>

          </div>


          <div class="photo-placeholder">

            <div class="photo-icon">
              ⌂
            </div>

            <strong>
              Rooftop Installation
            </strong>

            <span>
              Solar Project
            </span>

          </div>


          <div class="photo-placeholder">

            <div class="photo-icon">
              ✓
            </div>

            <strong>
              Complete Solution
            </strong>

            <span>
              Professional Installation
            </span>

          </div>
        `;
      }


      return list
        .slice(0, 4)
        .map(
          (
            photo,
            index
          ) => {

            const src =
              typeof photo === "string"
                ? photo
                : photo?.url ||
                  photo?.src ||
                  photo?.path ||
                  "";


            const title =
              typeof photo === "object"
                ? photo.title ||
                  photo.name ||
                  `Solar Product ${
                    index + 1
                  }`
                : `Solar Product ${
                    index + 1
                  }`;


            if (!src) {

              return `
                <div class="photo-placeholder">

                  <div class="photo-icon">
                    ☀
                  </div>

                  <strong>
                    ${escapeHtml(
                      title
                    )}
                  </strong>

                </div>
              `;
            }


            return `
              <div class="photo-card">

                <img
                  src="${escapeHtml(
                    src
                  )}"
                  alt="${escapeHtml(
                    title
                  )}"
                />

                <div class="photo-caption">
                  ${escapeHtml(
                    title
                  )}
                </div>

              </div>
            `;
          }
        )
        .join("");

    })()
  }

</div>


<div style="height:7mm"></div>


<div class="red-card">

  <h3>
    Proposed Solar Solution
  </h3>

  <p>

    ${
      systemCapacity
        ? `${escapeHtml(
            systemCapacity
          )} kW `
        : ""
    }

    ${escapeHtml(
      systemType
    )}

    solar system

    ${
      panelBrand
        ? ` using ${escapeHtml(
            panelBrand
          )} panels`
        : ""
    }

    ${
      inverterBrand
        ? ` with ${escapeHtml(
            inverterBrand
          )} inverter`
        : ""
    }.

  </p>

</div>


${pageFooter(
  companyName,
  "Solar Products",
  3
)}

</section>


<!-- ======================================================
     PAGE 4 — SYSTEM DESIGN + DIAGRAM
====================================================== -->

<section class="page">

${pageHeader(
  companyName,
  company.logo,
  "SYSTEM DESIGN",
  quotationNumber
)}


<div class="section-title">
  Proposed Solar System Design
</div>


${renderPanelLayout({
  panelCount,
  panelWattage,
  panelBrand,
  systemCapacity,
})}


${renderElectricalFlow({
  systemType,
  systemCapacity,
  panelCount,
  inverterBrand,
  inverterCapacity,
  inverterCount,
  batteryCount,
})}


${pageFooter(
  companyName,
  "System Design & Energy Flow",
  4
)}

</section>


<!-- ======================================================
     PAGE 5 — QUOTATION
====================================================== -->

<section class="page">

${pageHeader(
  companyName,
  company.logo,
  "QUOTATION",
  quotationNumber
)}


<div class="quotation-meta">

  <div class="info-card">

    <div class="info-card-title">
      From
    </div>

    ${infoRow(
      "Company",
      companyName
    )}

    ${infoRow(
      "Address",
      companyAddress
    )}

    ${infoRow(
      "Phone",
      company.phone ||
      company.alternatePhone
    )}

    ${infoRow(
      "Email",
      company.email
    )}

    ${infoRow(
      "GSTIN",
      company.gstin
    )}

  </div>


  <div class="info-card">

    <div class="info-card-title">
      Bill To
    </div>

    ${infoRow(
      "Customer",
      customerName
    )}

    ${infoRow(
      "Company",
      customer.companyName
    )}

    ${infoRow(
      "Mobile",
      customer.mobile ||
      customer.phone
    )}

    ${infoRow(
      "Email",
      customer.email
    )}

    ${infoRow(
      "Address",
      customerAddress
    )}

  </div>

</div>


<table>

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
<th>Amount</th>

</tr>

</thead>


<tbody>

${renderQuotationItems(
  data.items
)}

</tbody>

</table>


<div class="summary">

  <div class="summary-row">

    <span>
      Subtotal
    </span>

    <strong>
      ${formatCurrency(
        totals.subtotal
      )}
    </strong>

  </div>


  <div class="summary-row">

    <span>
      Discount
    </span>

    <strong>
      ${formatCurrency(
        totals.discount
      )}
    </strong>

  </div>


  <div class="summary-row">

    <span>
      Taxable Amount
    </span>

    <strong>
      ${formatCurrency(
        totals.taxableAmount
      )}
    </strong>

  </div>


  ${
    Number(
      totals.cgst || 0
    ) > 0
      ? `
        <div class="summary-row">

          <span>
            CGST
          </span>

          <strong>
            ${formatCurrency(
              totals.cgst
            )}
          </strong>

        </div>
      `
      : ""
  }


  ${
    Number(
      totals.sgst || 0
    ) > 0
      ? `
        <div class="summary-row">

          <span>
            SGST
          </span>

          <strong>
            ${formatCurrency(
              totals.sgst
            )}
          </strong>

        </div>
      `
      : ""
  }


  ${
    Number(
      totals.igst || 0
    ) > 0
      ? `
        <div class="summary-row">

          <span>
            IGST
          </span>

          <strong>
            ${formatCurrency(
              totals.igst
            )}
          </strong>

        </div>
      `
      : ""
  }


  <div class="summary-total">

    <span>
      GRAND TOTAL
    </span>

    <strong>
      ${formatCurrency(
        totals.grandTotal
      )}
    </strong>

  </div>

</div>


${
  quotation.notes
    ? `
      <div class="amount-box">

        <strong>
          Notes:
        </strong>

        <br />

        ${nl2br(
          quotation.notes
        )}

      </div>
    `
    : ""
}


${pageFooter(
  companyName,
  "Quotation",
  5
)}

</section>


<!-- ======================================================
     PAGE 6 — BOM
====================================================== -->

<section class="page">

${pageHeader(
  companyName,
  company.logo,
  "DETAILED BOM",
  quotationNumber
)}


<div class="section-title">
  Bill of Materials
</div>


<table>

<thead>

<tr>

<th>Sr.</th>
<th>Category</th>
<th>Item</th>
<th>Specification</th>
<th>Brand</th>
<th>Qty</th>
<th>Unit</th>
<th>Date</th>

</tr>

</thead>


<tbody>

${renderBOMRows(
  data.bomItems
)}

</tbody>

</table>


<div style="height:6mm"></div>


${renderTechnicalSummary({
  systemCapacity,
  systemType,
  panelCount,
  panelBrand,
  panelWattage,
  inverterBrand,
  inverterCapacity,
  inverterCount,
  batteryCount,
  structure,
  accessories,
})}


<div style="height:5mm"></div>


<div class="two-column">

  <div class="info-card">

    <div class="info-card-title">
      Site Details
    </div>

    ${infoRow(
      "Roof Type",
      solarRequirement.roofType
    )}

    ${infoRow(
      "Roof Area",
      solarRequirement.roofArea
        ? `${solarRequirement.roofArea} sq.ft`
        : ""
    )}

    ${infoRow(
      "Location",
      solarRequirement.location
    )}

    ${infoRow(
      "Site Address",
      solarRequirement.siteAddress
    )}

  </div>


  <div class="info-card">

    <div class="info-card-title">
      Electrical Requirement
    </div>

    ${infoRow(
      "Connection",
      solarRequirement.connectionType
    )}

    ${infoRow(
      "Sanctioned Load",
      solarRequirement.sanctionedLoad
    )}

    ${infoRow(
      "Monthly Units",
      solarRequirement.monthlyUnits
    )}

    ${infoRow(
      "Monthly Bill",
      solarRequirement.monthlyBill
        ? formatCurrency(
            solarRequirement.monthlyBill
          )
        : ""
    )}

  </div>

</div>


${pageFooter(
  companyName,
  "Bill of Materials",
  6
)}

</section>


<!-- ======================================================
     PAGE 7 — WARRANTY
====================================================== -->

<section class="page">

${pageHeader(
  companyName,
  company.logo,
  "WARRANTY",
  quotationNumber
)}


<div class="section-title">
  Warranty & Support
</div>


<div class="terms-box">

  <h3>
    Warranty
  </h3>

  <p>

    ${
      warrantyTerms
        ? nl2br(
            warrantyTerms
          )
        : `
          Warranty coverage shall be applicable
          according to the supplied products and
          respective manufacturer's warranty terms.
          Product-specific warranty documents shall
          prevail wherever applicable.
        `
    }

  </p>

</div>


<div class="terms-box">

  <h3>
    Solar Panel Warranty
  </h3>

  <p>
    Solar panel warranty shall be applicable
    according to the selected manufacturer's
    product warranty policy.
  </p>

</div>


<div class="terms-box">

  <h3>
    Inverter Warranty
  </h3>

  <p>
    Inverter warranty shall be applicable
    according to the selected manufacturer's
    warranty policy.
  </p>

</div>


<div class="terms-box">

  <h3>
    Warranty Exclusions
  </h3>

  <p>

    ${
      warrantyExclusions
        ? nl2br(
            warrantyExclusions
          )
        : `
          Damage caused by misuse, unauthorized
          modification, accidents, natural events,
          improper maintenance or conditions outside
          applicable warranty terms may not be covered.
        `
    }

  </p>

</div>


<div class="feature-grid">

  <div class="feature">

    <div class="feature-icon">
      1
    </div>

    <strong>
      Quality Products
    </strong>

    <span>
      Components selected according to project requirements.
    </span>

  </div>


  <div class="feature">

    <div class="feature-icon">
      2
    </div>

    <strong>
      Professional Installation
    </strong>

    <span>
      Installation following safety practices.
    </span>

  </div>


  <div class="feature">

    <div class="feature-icon">
      3
    </div>

    <strong>
      Customer Support
    </strong>

    <span>
      Support for the installed system.
    </span>

  </div>

</div>


${pageFooter(
  companyName,
  "Warranty & Support",
  7
)}

</section>


<!-- ======================================================
     PAGE 8 — TERMS
====================================================== -->

<section class="page">

${pageHeader(
  companyName,
  company.logo,
  "TERMS & CONDITIONS",
  quotationNumber
)}


<div class="section-title">
  Payment & Installation Terms
</div>


<div class="terms-box">

  <h3>
    Payment Terms
  </h3>

  <p>

    ${
      paymentTerms
        ? nl2br(
            paymentTerms
          )
        : `
          Payment schedule shall be mutually agreed
          between the company and customer and shall
          be governed by the accepted quotation.
        `
    }

  </p>

</div>


<div class="terms-box">

  <h3>
    Installation Terms
  </h3>

  <p>

    ${
      installationTerms
        ? nl2br(
            installationTerms
          )
        : `
          Installation timeline is subject to site
          readiness, material availability, approvals
          and other project conditions.
        `
    }

  </p>

</div>


<div class="terms-box">

  <h3>
    Scope of Work
  </h3>

  <p>

    ${
      scopeOfWork
        ? nl2br(
            scopeOfWork
          )
        : `
          Supply and installation of the solar system
          components mentioned in the accepted quotation
          and applicable BOM.
        `
    }

  </p>

</div>


<div class="terms-box">

  <h3>
    Subsidy
  </h3>

  <p>

    ${
      subsidyTerms
        ? nl2br(
            subsidyTerms
          )
        : `
          Any subsidy or government incentive, where
          applicable, shall depend upon prevailing
          government rules, eligibility and approval.
        `
    }

  </p>

</div>


<div class="terms-box">

  <h3>
    Quotation Validity
  </h3>

  <p>

    This quotation is valid for

    <strong>
      ${escapeHtml(
        validity
      )}
    </strong>.

    Prices and commercial terms may change after
    the validity period.

  </p>

</div>


<div class="bank-signature">

  <div class="bank-box">

    <div class="box-title">
      Bank Details
    </div>

    ${infoRow(
      "Bank",
      bankDetails.bankName
    )}

    ${infoRow(
      "Account Name",
      bankDetails.accountName ||
      companyName
    )}

    ${infoRow(
      "Account Number",
      bankDetails.accountNumber
    )}

    ${infoRow(
      "IFSC",
      bankDetails.ifscCode
    )}

    ${infoRow(
      "Branch",
      bankDetails.branchName
    )}

    ${infoRow(
      "UPI",
      bankDetails.upiId
    )}

  </div>


  <div class="signature-box">

    <div class="box-title">
      Authorized Signature
    </div>


    ${
      signature.signatureImage
        ? `
          <img
            class="signature-image"
            src="${escapeHtml(
              signature.signatureImage
            )}"
            alt="Authorized Signature"
          />
        `
        : `
          <div style="height:20mm"></div>
        `
    }


    <div class="signature-line">

      <strong>
        ${escapeHtml(
          signature.name ||
          ""
        )}
      </strong>

      <br />

      <span class="muted">
        ${escapeHtml(
          signature.designation ||
          "Authorized Signatory"
        )}
      </span>

    </div>

  </div>

</div>


${pageFooter(
  companyName,
  "Terms & Conditions",
  8
)}

</section>


<!-- ======================================================
     PAGE 9 — TESTIMONIALS
====================================================== -->

<section class="page">

${pageHeader(
  companyName,
  company.logo,
  "CUSTOMER EXPERIENCE",
  quotationNumber
)}


<div class="section-title">
  Our Customers
</div>


<div class="testimonial-grid">

  ${
    (() => {

      const list =
        asArray(
          testimonials
        );


      if (!list.length) {

        return `
          <div class="testimonial-empty">

            <div class="testimonial-star">
              ★
            </div>

            <h3>
              Trusted Solar Solutions
            </h3>

            <p>
              We are committed to delivering
              reliable solar energy solutions,
              professional installation and
              dependable customer support.
            </p>

          </div>
        `;
      }


      return list
        .slice(0, 6)
        .map(
          (item) => {

            const name =
              typeof item === "object"
                ? item.name ||
                  item.customerName ||
                  "Customer"
                : "Customer";


            const message =
              typeof item === "object"
                ? item.message ||
                  item.text ||
                  item.description ||
                  ""
                : item;


            return `
              <div class="testimonial">

                <div class="testimonial-head">

                  <div class="avatar">

                    ${escapeHtml(
                      String(name)
                        .charAt(0)
                        .toUpperCase()
                    )}

                  </div>


                  <div>

                    <strong>
                      ${escapeHtml(
                        name
                      )}
                    </strong>

                    <div class="stars">
                      ★★★★★
                    </div>

                  </div>

                </div>


                <p>
                  “${escapeHtml(
                    message
                  )}”
                </p>

              </div>
            `;
          }
        )
        .join("");

    })()
  }

</div>


<div style="height:8mm"></div>


<div class="red-card">

  <h3>
    Why Choose Solar Energy?
  </h3>

  <p>
    Generate clean energy, reduce dependence
    on conventional electricity and create a
    long-term energy solution for your property.
  </p>

</div>


<div style="height:7mm"></div>


<div class="two-column">

  <div class="info-card">

    <div class="info-card-title">
      Proposed System
    </div>

    ${infoRow(
      "Capacity",
      systemCapacity
        ? `${systemCapacity} kW`
        : ""
    )}

    ${infoRow(
      "System Type",
      systemType
    )}

    ${infoRow(
      "Panels",
      panelCount
    )}

    ${infoRow(
      "Panel Make",
      panelBrand
    )}

  </div>


  <div class="info-card">

    <div class="info-card-title">
      Customer
    </div>

    ${infoRow(
      "Name",
      customerName
    )}

    ${infoRow(
      "Mobile",
      customer.mobile ||
      customer.phone
    )}

    ${infoRow(
      "Email",
      customer.email
    )}

    ${infoRow(
      "Location",
      customer.city ||
      customer.state
    )}

  </div>

</div>


${pageFooter(
  companyName,
  "Customer Experience",
  9
)}

</section>


<!-- ======================================================
     PAGE 10 — THANK YOU
====================================================== -->

<section class="page thank-page">

  <div class="thank-top">

    <div class="thank-small">
      THANK YOU FOR CONSIDERING SOLAR ENERGY
    </div>

    <div class="thank-title">
      Thank You
    </div>

    <div class="thank-subtitle">

      We look forward to helping you move towards
      a cleaner, smarter and more reliable energy future.

    </div>

  </div>


  <div class="thank-content">

    ${
      company.logo
        ? `
          <img
            class="cover-logo"
            src="${escapeHtml(
              company.logo
            )}"
            alt="${escapeHtml(
              companyName
            )}"
          />
        `
        : `
          <div
            style="
              color:#c62828;
              font-size:18px;
              font-weight:900;
            "
          >
            ${escapeHtml(
              companyName
            )}
          </div>
        `
    }


    <div style="height:8mm"></div>


    <div class="contact-box">

      <div class="contact-title">
        Contact Us
      </div>


      <div class="contact-grid">

        <div class="contact-item">

          <label>
            Company
          </label>

          <strong>
            ${escapeHtml(
              companyName
            )}
          </strong>

        </div>


        <div class="contact-item">

          <label>
            Phone
          </label>

          <strong>
            ${escapeHtml(
              company.phone ||
              company.alternatePhone ||
              ""
            )}
          </strong>

        </div>


        <div class="contact-item">

          <label>
            Email
          </label>

          <strong>
            ${escapeHtml(
              company.email ||
              ""
            )}
          </strong>

        </div>


        <div class="contact-item">

          <label>
            Website
          </label>

          <strong>
            ${escapeHtml(
              company.website ||
              ""
            )}
          </strong>

        </div>


        <div
          class="contact-item"
          style="grid-column:1 / -1;"
        >

          <label>
            Address
          </label>

          <strong>
            ${escapeHtml(
              companyAddress
            )}
          </strong>

        </div>


        ${
          company.gstin
            ? `
              <div
                class="contact-item"
                style="grid-column:1 / -1;"
              >

                <label>
                  GSTIN
                </label>

                <strong>
                  ${escapeHtml(
                    company.gstin
                  )}
                </strong>

              </div>
            `
            : ""
        }

      </div>


      <div
        style="
          margin-top:8mm;
          color:#666;
          font-size:9px;
          line-height:1.7;
        "
      >

        <strong>
          Quotation:
        </strong>

        ${escapeHtml(
          quotationNumber
        )}

        <br />

        <strong>
          Customer:
        </strong>

        ${escapeHtml(
          customerName
        )}

        <br />

        <strong>
          System:
        </strong>

        ${
          systemCapacity
            ? `${escapeHtml(
                systemCapacity
              )} kW`
            : "-"
        }

        ${
          systemType
            ? ` • ${escapeHtml(
                systemType
              )}`
            : ""
        }

      </div>

    </div>

  </div>


  <div class="contact-bottom">

    <span>
      ${escapeHtml(
        companyName
      )}
    </span>

    <span>
      ${escapeHtml(
        company.phone ||
        ""
      )}
    </span>

    <span>
      ${escapeHtml(
        company.email ||
        ""
      )}
    </span>

    <span>
      ${escapeHtml(
        company.website ||
        ""
      )}
    </span>

  </div>

</section>


</body>

</html>`;
};

module.exports =
  quotationTemplate;