const fs = require("fs");
const path = require("path");

/**
 * Loads an image from public/assets and embeds it in the generated HTML.
 * This keeps Puppeteer/PDF generation independent of relative URL resolution.
 */
// Cache embedded assets in memory. The template may request the same logo/photos
// several times during a process lifetime; avoid repeated synchronous disk reads
// and base64 encoding for every quotation download.
const publicAssetDataUriCache = new Map();

const getPublicAssetDataUri = (fileName) => {
  if (publicAssetDataUriCache.has(fileName)) {
    return publicAssetDataUriCache.get(fileName);
  }

  const roots = [
    path.join(__dirname, "public", "assets"),
    path.join(__dirname, "..", "public", "assets"),
    path.join(__dirname, "..", "..", "public", "assets"),
    path.join(process.cwd(), "public", "assets"),
    path.join(process.cwd(), "backend", "public", "assets"),
    path.join(process.cwd(), "server", "public", "assets"),
  ];

  for (const root of roots) {
    const filePath = path.join(root, fileName);
    try {
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const mimeType =
          fileName.toLowerCase().endsWith(".jpg") ||
          fileName.toLowerCase().endsWith(".jpeg")
            ? "image/jpeg"
            : fileName.toLowerCase().endsWith(".webp")
              ? "image/webp"
              : "image/png";
        const encoded = fs.readFileSync(filePath).toString("base64");
        const dataUri = `data:${mimeType};base64,${encoded}`;
        publicAssetDataUriCache.set(fileName, dataUri);
        return dataUri;
      }
    } catch (error) {
      // Try the next known public/assets location.
    }
  }

  publicAssetDataUriCache.set(fileName, "");
  return "";
};

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

const extractCapacity = (value) => {
  if (value === undefined || value === null || value === "") return undefined;
  const match = String(value).match(/(\\d+(?:\\.\\d+)?)\\s*(?:kw|kwh)\\b/i);
  return match ? Number(match[1]) : undefined;
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
  page,
  company = {}
) => {
  // Keep the client-reference red footer band and social/contact icon row.
  // Icons are always visible; links are active only when configured in Company Settings.
  const social = company.socialLinks || company.socials || {};
  const phone = String(company.whatsapp || company.phone || company.mobile || "").replace(/[^0-9+]/g, "");
  const links = [
    { key: "facebook", label: "Facebook", glyph: "f", url: social.facebook || company.facebook },
    { key: "instagram", label: "Instagram", glyph: "◎", url: social.instagram || company.instagram },
    { key: "linkedin", label: "LinkedIn", glyph: "in", url: social.linkedin || company.linkedin },
    { key: "whatsapp", label: "WhatsApp", glyph: `<svg viewBox="0 0 24 24" width="11" height="11" aria-hidden="true"><path fill="#e31b23" d="M20.52 3.48A11.8 11.8 0 0 0 12.13 0C5.6 0 .28 5.31.28 11.84c0 2.09.55 4.13 1.6 5.93L.17 24l6.39-1.67a11.84 11.84 0 0 0 5.57 1.42h.01c6.53 0 11.85-5.31 11.85-11.84 0-3.17-1.23-6.15-3.47-8.43ZM12.14 21.7h-.01a9.83 9.83 0 0 1-5.01-1.37l-.36-.21-3.79.99 1.01-3.69-.23-.38a9.82 9.82 0 1 1 8.39 4.66Zm5.39-7.36c-.29-.14-1.72-.85-1.99-.95-.27-.1-.46-.14-.65.14-.19.29-.75.95-.92 1.14-.17.19-.34.21-.63.07-.29-.14-1.22-.45-2.33-1.44-.86-.77-1.44-1.72-1.61-2.01-.17-.29-.02-.44.13-.58.13-.13.29-.34.43-.5.14-.17.19-.29.29-.48.1-.19.05-.36-.02-.5-.07-.14-.65-1.57-.89-2.15-.23-.56-.47-.49-.65-.5h-.55c-.19 0-.5.07-.77.36-.27.29-1.01.99-1.01 2.42s1.03 2.8 1.17 2.99c.14.19 2.03 3.1 4.92 4.35.69.3 1.22.48 1.64.61.69.22 1.32.19 1.82.12.56-.08 1.72-.7 1.96-1.38.24-.68.24-1.26.17-1.38-.07-.12-.26-.19-.55-.33Z"/></svg>`, url: social.whatsapp || company.whatsappUrl || "" },
    { key: "email", label: "Email", glyph: "✉", url: company.email ? `mailto:${company.email}` : "" },
    { key: "phone", label: "Call", glyph: "☎", url: phone ? `tel:${phone}` : "" },
  ];
  const icons = links.map((item) => {
    const glyph = `<span class="footer-social-glyph footer-${item.key}">${item.glyph}</span>`;
    return item.url
      ? `<a class="footer-social-link" href="${escapeHtml(item.url)}" aria-label="${escapeHtml(item.label)}">${glyph}</a>`
      : `<span class="footer-social-link" aria-label="${escapeHtml(item.label)}">${glyph}</span>`;
  }).join("");

  return `
    <div class="footer">
      <span class="footer-company">${escapeHtml(companyName)}</span>
      <span class="footer-page">${escapeHtml(String(page))}/11</span>
      <span class="footer-socials">${icons}</span>
    </div>
  `;
};

const renderQuotationItems = (items) => {
  const rows = asArray(items);

  if (!rows.length) {
    return `
      <tr>
        <td colspan="6" class="empty">
          No quotation items available
        </td>
      </tr>
    `;
  }

  return rows
    .map((item, index) => {
      const itemName = firstValue(
        item.name,
        item.item,
        item.description,
        item.title,
        "Solar Component"
      );
      const quantity = Math.max(0, Number(item.quantity ?? item.qty) || 0);
      const rate = Math.max(0, Number(item.rate ?? item.unitPrice ?? item.price) || 0);
      const discountPercent = Math.min(100, Math.max(0, Number(item.discount) || 0));
      const grossAmount = Number.isFinite(Number(item.grossAmount))
        ? Number(item.grossAmount)
        : quantity * rate;
      const discountAmount = Number.isFinite(Number(item.discountAmount))
        ? Number(item.discountAmount)
        : grossAmount * discountPercent / 100;
      const taxableAmount = Number.isFinite(Number(item.taxableAmount))
        ? Number(item.taxableAmount)
        : Math.max(0, grossAmount - discountAmount);
      const taxRate = Math.max(0, Number(item.taxRate ?? item.gstRate) || 0);
      const taxAmount = Number.isFinite(Number(item.taxAmount))
        ? Number(item.taxAmount)
        : taxableAmount * taxRate / 100;
      const amount = Number.isFinite(Number(item.amount))
        ? Number(item.amount)
        : taxableAmount + taxAmount;

      return `
        <tr>
          <td class="center">${index + 1}</td>
          <td>
            <strong>${escapeHtml(itemName)}</strong>
            ${item.category ? `<div class="small-text">${escapeHtml(item.category)}</div>` : ""}
            ${item.description && itemName !== item.description ? `
              <div class="small-text">${escapeHtml(item.description)}</div>
            ` : ""}
          </td>
          <td class="right">${formatNumber(quantity)}${item.unit ? `<div class="small-text">${escapeHtml(item.unit)}</div>` : ""}</td>
          <td class="right">${formatCurrency(rate)}</td>
          <td class="right">${formatCurrency(discountAmount)}</td>
          <td class="right">${formatCurrency(taxAmount)}</td>
          <td class="right bold">${formatCurrency(amount)}</td>
        </tr>
      `;
    })
    .join("");
};

const normalizeBOMKey = (item) =>
  String(item?.item || item?.name || item?.description || "")
    .toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const uniqueBOMItems = (items) => {
  const seen = new Set();
  return asArray(items).filter((item) => {
    const key = normalizeBOMKey(item);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const renderBOMRows = (items) => {
  const rows = asArray(items);

  if (!rows.length) {
    return `
      <tr>
        <td colspan="5" class="empty">
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
            <strong>${escapeHtml(item.item || item.name || item.description || "")}</strong>
            ${item.specification || item.description ? `
              <div class="small-text">${escapeHtml(item.specification || item.description)}</div>
            ` : ""}
            ${item.category ? `<div class="small-text">${escapeHtml(item.category)}</div>` : ""}
          </td>

          <td class="right">${formatNumber(item.qty ?? item.quantity)}</td>

          <td class="center">${escapeHtml(item.unit || "")}</td>

          <td>${escapeHtml(item.brand || item.make || "")}</td>

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
   DYNAMIC ROOFTOP VISUALIZATION — TOP + FRONT ANGLE
   This is generated from the saved panel count, not a fixed image.
========================================================= */

const renderRooftopVisualization = ({
  panelCount,
  panelWattage,
  panelBrand,
  systemCapacity,
  systemType,
}) => {
  const parsedCount = Number(panelCount);
  const count = Number.isFinite(parsedCount)
    ? Math.min(120, Math.max(0, Math.floor(parsedCount)))
    : 0;
  // Use the actual roof photographs supplied for this proposal. The photos are
  // embedded as data URIs so Puppeteer does not depend on relative URL paths.
  const topRoofImage = getPublicAssetDataUri("front_roof.jpg");
  const frontRoofImage = getPublicAssetDataUri("front_engle.png");

  const safeBrand = escapeHtml(panelBrand || "Solar Panel");
  const safeWattage = panelWattage ? `${escapeHtml(panelWattage)} W` : "";
  const panelInfo = `${count} Panel${count === 1 ? "" : "s"}`;

  // Bilinear projection maps every panel to the perspective plane of the
  // roof photo. It keeps the count dynamic rather than baking panels into photos.
  const lerp = (a, b, t) => a + (b - a) * t;
  const bilinear = (p00, p10, p01, p11, u, v) => ({
    x: lerp(lerp(p00.x, p10.x, u), lerp(p01.x, p11.x, u), v),
    y: lerp(lerp(p00.y, p10.y, u), lerp(p01.y, p11.y, u), v),
  });
  const pt = (p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`;
  const cols = count ? Math.min(8, Math.max(1, Math.ceil(Math.sqrt(count * 2.2)))) : 1;
  const rows = count ? Math.ceil(count / cols) : 1;

  const renderPhotoPanels = (corners, prefix, viewWidth, viewHeight) => {
    if (!count) {
      return `<text x="${viewWidth / 2}" y="${viewHeight / 2}" text-anchor="middle" font-size="13" fill="#fff" stroke="#24342d" stroke-width=".35">Panel quantity not configured</text>`;
    }
    const { p00, p10, p01, p11 } = corners;
    const parts = [];
    // Mounting rails are placed first, below the panels.
    // Keep support rails beneath the first two rows so they remain hidden by
    // the modules instead of protruding past a shorter final row (e.g. 19 panels).
    [0.16, 0.49].forEach((v) => {
      const a = bilinear(p00, p10, p01, p11, 0.015, v);
      const b = bilinear(p00, p10, p01, p11, 0.985, v);
      parts.push(`<path d="M ${pt(a)} L ${pt(b)}" stroke="#293a3d" stroke-width="5.2" opacity=".9"/><path d="M ${pt(a)} L ${pt(b)}" stroke="#b9c6c3" stroke-width="1.3" opacity=".95"/>`);
    });

    for (let i = 0; i < count; i++) {
      const c = i % cols;
      const r = Math.floor(i / cols);
      const u0 = c / cols;
      const u1 = (c + 1) / cols;
      const v0 = r / rows;
      const v1 = (r + 1) / rows;
      const gapU = Math.min(0.012, 0.045 / cols);
      const gapV = Math.min(0.018, 0.055 / rows);
      const a = bilinear(p00, p10, p01, p11, u0 + gapU, v0 + gapV);
      const b = bilinear(p00, p10, p01, p11, u1 - gapU, v0 + gapV);
      const c1 = bilinear(p00, p10, p01, p11, u1 - gapU, v1 - gapV);
      const d = bilinear(p00, p10, p01, p11, u0 + gapU, v1 - gapV);
      const panelPath = `M ${pt(a)} L ${pt(b)} L ${pt(c1)} L ${pt(d)} Z`;
      const grid = [];
      for (let j = 1; j <= 2; j++) {
        const u = u0 + (u1 - u0) * j / 3;
        const g1 = bilinear(p00, p10, p01, p11, u, v0 + gapV);
        const g2 = bilinear(p00, p10, p01, p11, u, v1 - gapV);
        grid.push(`<path d="M ${pt(g1)} L ${pt(g2)}"/>`);
      }
      const midA = bilinear(p00, p10, p01, p11, u0 + gapU, (v0 + v1) / 2);
      const midB = bilinear(p00, p10, p01, p11, u1 - gapU, (v0 + v1) / 2);
      // Feet are subtle and follow the same perspective as the panel row.
      const footA = bilinear(p00, p10, p01, p11, (u0 + u1) / 2, Math.min(1, v1 - gapV / 2));
      const footB = { x: footA.x + 1.5, y: footA.y + 7 };
      parts.push(`<g filter="url(#${prefix}PanelShadow)">
        <path d="${panelPath}" fill="#071b2a" stroke="#e4ecec" stroke-width="2.2" stroke-linejoin="round"/>
        <path d="${panelPath}" fill="url(#${prefix}Glass)" stroke="#8ca8b9" stroke-width=".65" stroke-linejoin="round"/>
        <path d="${panelPath}" fill="#fff" opacity=".055"/>
        <g stroke="#9dc3dc" stroke-width=".8" opacity=".82">${grid.join("")}<path d="M ${pt(midA)} L ${pt(midB)}"/></g>
        <path d="M ${pt(a)} L ${pt(b)} L ${pt({x:a.x+(b.x-a.x)*.35,y:a.y+(b.y-a.y)*.35})}" stroke="#f4fbff" stroke-width="1" opacity=".5" fill="none"/>
      </g>
      <path d="M ${pt(footA)} L ${pt(footB)}" stroke="#d0d9d7" stroke-width="2" opacity=".9"/>`);
    }
    return parts.join("");
  };

  const photoSvg = (imageData, viewBox, ariaLabel, prefix, corners) => {
    const [width, height] = viewBox;
    return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(ariaLabel)}" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="${prefix}Glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#2e6c9a"/><stop offset=".34" stop-color="#10446f"/><stop offset=".72" stop-color="#082b4b"/><stop offset="1" stop-color="#173f61"/>
        </linearGradient>
        <filter id="${prefix}PanelShadow" x="-30%" y="-30%" width="170%" height="180%">
          <feDropShadow dx="2" dy="4" stdDeviation="2.2" flood-color="#102018" flood-opacity=".58"/>
        </filter>
      </defs>
      ${imageData
        ? `<image href="${imageData}" x="0" y="0" width="${width}" height="${height}" preserveAspectRatio="xMidYMid slice"/>`
        : `<rect x="0" y="0" width="${width}" height="${height}" fill="#c7d0c8"/><text x="${width/2}" y="${height/2}" text-anchor="middle" font-size="14" fill="#31453a">Roof photo missing: check backend/public/assets</text>`}
      <rect x="0" y="0" width="${width}" height="${height}" fill="#0b2418" opacity=".035"/>
      ${renderPhotoPanels(corners, prefix, width, height)}
    </svg>`;
  };

  // Coordinates are matched to the bundled reference photos. These are
  // perspective overlays, not a claim of a surveyed/engineering roof model.
  const topSvg = photoSvg(topRoofImage, [720, 288], "Top view of roof with dynamically placed solar panels", "topPhoto", {
    p00: { x: 222, y: 72 }, p10: { x: 632, y: 72 },
    p01: { x: 220, y: 244 }, p11: { x: 632, y: 244 },
  });
  // Front photo: move the array fully onto the visible concrete slab, below
  // the rear parapet and above the front parapet. Calibrated for this exact image.
  const frontSvg = photoSvg(frontRoofImage, [720, 480], "Front angle roof photograph with dynamically placed solar panels", "frontPhoto", {
    p00: { x: 154, y: 198 }, p10: { x: 666, y: 202 },
    p01: { x: 112, y: 286 }, p11: { x: 642, y: 291 },
  });


  const meta = [
    ["Panel Count", String(count)],
    ["System Capacity", systemCapacity ? `${systemCapacity} kW` : "—"],
    ["System Type", systemType || "—"],
    ["Panel Make", panelBrand || "—"],
    ["Panel Wattage", panelWattage ? `${panelWattage} W` : "—"],
  ];

  return `
    <section class="rooftop-visual-page">
      <div class="rooftop-visual-heading">
        <div>
          <div class="rooftop-visual-title">PROPOSED ROOFTOP SOLAR DESIGN</div>
          <div class="rooftop-visual-subtitle">Reference roof photos with dynamic panel overlay • ${escapeHtml(panelInfo)} • ${safeBrand}${safeWattage ? ` • ${safeWattage}` : ""}</div>
        </div>
        <div class="rooftop-capacity">
          <span>Total Panels</span><strong>${count}</strong>
          <span>System Capacity</span><strong>${escapeHtml(systemCapacity || "—")} ${systemCapacity ? "kW" : ""}</strong>
        </div>
      </div>
      <div class="rooftop-view rooftop-top-view">
        <div class="rooftop-view-label">TOP VIEW <span>(${count} panels)</span></div>
        ${topSvg}
      </div>
      <div class="rooftop-angle-grid">
        <div class="rooftop-view">
          <div class="rooftop-view-label">3D VIEW — FRONT ANGLE <span>(${count} panels)</span></div>
          ${frontSvg}
        </div>
      </div>
      <div class="rooftop-meta-grid">
        ${meta.map(([label, value]) => `<div class="rooftop-meta-item"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join("")}
      </div>
      <div class="rooftop-disclaimer">Conceptual visualization: panel count is dynamic; roof placement and clearances must be verified by site survey before installation.</div>
    </section>
  `;
};


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

  const company = {
    ...(data.company || {}),
  };

  // Use the company's uploaded Gujrat Solar logo when no logo is supplied
  // by the quotation/company settings.
  const defaultLogo =
    getPublicAssetDataUri("gujrat-solar-logo.png");

  const defaultProjectCover =
    getPublicAssetDataUri("solerpanal.jpg");

  const defaultSolarPhotos = [
    {
      title: "Solar Panel Installation",
      url: getPublicAssetDataUri("karan.png"),
    },
    {
      title: "Rooftop Solar Panels",
      url: getPublicAssetDataUri("panelswebp.png"),
    },
    {
      title: "Solar Installation Project",
      url: getPublicAssetDataUri("payal.png"),
    },
    {
      title: "Solar Plant Installation",
      url: getPublicAssetDataUri("rahul.png"),
    },
  ].filter((photo) => photo.url);

  const bankDetails =
    data.bankDetails || {};

  const signature =
    data.signature || {};

  const customer = {
    ...(quotation.customer && typeof quotation.customer === "object" ? quotation.customer : {}),
    ...(quotation.lead && typeof quotation.lead === "object" ? {
      name: quotation.lead.name,
      mobile: quotation.lead.mobile,
      email: quotation.lead.email,
      address: quotation.lead.address,
      city: quotation.lead.city,
      state: quotation.lead.state,
      pincode: quotation.lead.pincode,
    } : {}),
    ...(quotation.customerDetails && typeof quotation.customerDetails === "object" ? quotation.customerDetails : {}),
    ...(data.customerDetails && typeof data.customerDetails === "object" ? data.customerDetails : {}),
  };

  const proposal =
    data.proposalContent || {};

  const proposalSettings =
    data.proposalSettings || {};

  const quotationSettings =
    data.quotationSettings || {};

  const system =
    quotation.systemConfiguration ||
    data.systemConfiguration ||
    data.plantDetails ||
    quotation.plantDetails ||
    {};

  const solarRequirement =
    quotation.solarRequirement ||
    data.solarRequirement ||
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

  // BOM should list configured technical components, not repeat priced quotation items.
  const configuredBOMRows = components.map((component, index) => ({
    srNo: index + 1,
    item: firstValue(component.name, component.model, component.componentType, "Component"),
    description: component.model || component.specifications?.description || "",
    specification: component.specifications?.specification || "",
    qty: firstValue(component.quantity, component.qty, 1),
    unit: component.unit || "Nos",
    brand: component.brand || component.make || "",
    category: component.componentType || "",
  }));
  // Include BOM rows saved with the quotation as well as configuration components;
  // deduplication prevents the same configured item from appearing twice.
  const bomRows = uniqueBOMItems([...configuredBOMRows, ...asArray(data.bomItems)])
    .map((item, index) => ({ ...item, srNo: index + 1 }));


  const companyName =
    company.name ||
    company.legalName ||
    "GUJRAT SOLAR ENERGY";

  // Keep an explicitly configured logo, otherwise use public/assets logo.
  if (!company.logo) {
    company.logo = defaultLogo;
  }


  const companyAddress = [
    company.address,
    company.city,
    company.state,
    company.pincode,
  ]
    .filter(Boolean)
    .join(", ");


  const customerName = firstValue(
    customer.name,
    customer.customerName,
    customer.fullName,
    quotation.customer?.name,
    quotation.lead?.name,
    quotation.lead?.customerName,
    "Customer"
  );


  const customerAddress = [
    customer.address,
    customer.siteAddress,
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
    quotation.createdAt ||
    data.quotationDate;


  const expiryDate =
    quotation.expiryDate ||
    quotation.validUntil ||
    quotation.expiryDate;


  const systemCapacity =
    firstValue(
      system.systemCapacity,
      system.systemSizeKW,
      system.systemSizeKw,
      system.requiredKw,
      system.capacity,
      quotation.systemCapacity,
      quotation.systemSizeKW,
      quotation.plantDetails?.systemCapacity,
      quotation.plantDetails?.capacity,
      solarRequirement.requiredKw
    );


  const systemType =
    firstValue(
      system.systemType,
      system.type,
      quotation.systemType,
      quotation.plantDetails?.systemType,
      solarRequirement.systemType,
      "ON_GRID"
    );


  // Keep quotation PDF aligned with the Quotation Details page:
  // use the actual SOLAR_PANEL component quantity first. Older records can
  // have a stale aggregate panelCount (for example 20) while the saved panel
  // component and quotation line item both contain 10.
  const panelCount =
    firstValue(
      panel.quantity,
      panel.qty,
      system.panelCount,
      system.panelQuantity,
      system.numberOfPanels,
      0
    );


  const panelWattage =
    firstValue(
      system.panelWattage,
      system.panelWatt,
      panel.specifications?.wattage,
      panel.specifications?.panelWattage,
      panel.wattage,
      panel.capacity,
      (String(panel.model || panel.name || "").match(/(\\d{3,4})\\s*w/i) || [])[1]
    );


  const panelBrand =
    firstValue(
      system.panelMake,
      system.panelBrand,
      panel.brand,
      panel.make,
      panel.name
    );


  // Prefer the saved inverter component quantity over stale aggregate counts.
  const inverterCount =
    firstValue(
      inverter.quantity,
      inverter.qty,
      system.inverterCount,
      system.numberOfInverters,
      0
    );


  const inverterBrand =
    firstValue(
      system.inverterMake,
      system.inverterBrand,
      inverter.brand,
      inverter.make,
      inverter.name
    );


  const inverterCapacity =
    firstValue(
      system.inverterCapacity,
      inverter.specifications?.capacity,
      inverter.specifications?.inverterCapacity,
      inverter.capacity,
      inverter.wattage,
      extractCapacity(inverter.model),
      extractCapacity(inverter.name)
    );

  const batteryCapacity =
    firstValue(
      solarRequirement.batteryCapacity,
      system.batteryCapacity,
      battery.specifications?.capacity,
      battery.capacity,
      extractCapacity(battery.model),
      extractCapacity(battery.name)
    );

  const batteryBrand =
    firstValue(system.batteryBrand, battery.brand, battery.make);

  const batteryModel =
    firstValue(system.batteryModel, battery.model, battery.name);

  const panelCapacity =
    firstValue(
      system.panelCapacity,
      panel.specifications?.panelCapacity,
      panel.capacityKw,
      (Number(panelWattage) > 0 && Number(panelCount) > 0)
        ? (Number(panelWattage) * Number(panelCount)) / 1000
        : undefined
    );


  const batteryCount =
    firstValue(
      system.batteryCount,
      battery.quantity,
      battery.qty,
      0
    );


  const suppliedPhotos =
    quotation.productPhotos ||
    proposal.productPhotos ||
    [];

  // Use uploaded local solar photos by default, while preserving custom photos.
  const photos =
    asArray(suppliedPhotos).length
      ? asArray(suppliedPhotos)
      : defaultSolarPhotos;


  const testimonials =
    data.testimonials ||
    proposal.testimonials ||
    [];


  const totals = {
    ...(data.totals || {}),
  };
  if (totals.subtotal == null) {
    totals.subtotal = asArray(data.items).reduce((sum, item) => {
      const quantity = Number(item.quantity ?? item.qty) || 0;
      const rate = Number(item.rate ?? item.unitPrice ?? item.price) || 0;
      return sum + (Number(item.grossAmount) || quantity * rate);
    }, 0);
  }
  if (totals.discount == null) {
    totals.discount = firstValue(quotation.totalDiscount, quotation.discount, 0);
  }
  if (totals.taxableAmount == null) {
    totals.taxableAmount = firstValue(quotation.taxableAmount, Math.max(0, Number(totals.subtotal) - Number(totals.discount || 0)));
  }
  if (totals.cgst == null) totals.cgst = quotation.cgst || 0;
  if (totals.sgst == null) totals.sgst = quotation.sgst || 0;
  if (totals.igst == null) totals.igst = quotation.igst || 0;
  if (totals.totalTax == null) totals.totalTax = quotation.totalTax || (Number(totals.cgst) + Number(totals.sgst) + Number(totals.igst));
  if (totals.grandTotal == null) {
    totals.grandTotal = firstValue(
      quotation.grandTotal,
      Number(totals.taxableAmount) + Number(totals.totalTax),
      0
    );
  }


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
    quotation.paymentTerms ||
    proposalSettings.defaultPaymentTerms ||
    "";


  const warrantyTerms =
    data.warrantyTerms ||
    quotation.warrantyTerms ||
    quotation.warrantyDetails ||
    proposalSettings.defaultWarrantyTerms ||
    "";


  const subsidyTerms =
    data.subsidyTerms ||
    quotation.subsidyTerms ||
    quotation.subsidyDetails ||
    proposalSettings.defaultSubsidyTerms ||
    "";


  const installationTerms =
    data.installationTerms ||
    quotation.installationTerms ||
    quotation.installationSchedule ||
    proposalSettings.defaultInstallationTerms ||
    "";


  const scopeOfWork =
    data.scopeOfWork ||
    quotation.scopeOfWork ||
    proposalSettings.defaultScopeOfWork ||
    "";


  const warrantyExclusions =
    data.warrantyExclusions ||
    quotation.warrantyExclusions ||
    proposalSettings.defaultWarrantyExclusions ||
    "";


  // The saved validUntil date is authoritative for the PDF.
  const validity = firstValue(
    expiryDate ? `Valid until ${formatDate(expiryDate)}` : "",
    data.quotationValidity,
    quotation.quotationValidity,
    quotationSettings.validityDays ? `${quotationSettings.validityDays} days` : "",
    "1 week from the date of issue"
  );


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

  color: #20264f;

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

  color: #e31b23;

  font-size: 9px;

  font-weight: 900;
}

.brand-name {
  font-size: 13px;

  font-weight: 900;
}

.brand-sub {
  color: #e31b23;

  font-size: 7px;

  font-weight: 700;

  letter-spacing: 1px;

  margin-top: 2px;
}

.document-heading {
  text-align: right;
}

.document-title {
  color: #e31b23;

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
    3px solid #e31b23;

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
  color: #e31b23;

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
  background: #e31b23;

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

  background: #e31b23;

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
  color: #e31b23;

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
  color: #e31b23;

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
  color: #e31b23;

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
  color: #e31b23;
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
    4px solid #e31b23;

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

  color: #e31b23;

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

  background: #e31b23;

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
  color: #e31b23;

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

  background: #e31b23;

  border:
    1px solid #e31b23;

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

.quote-reference-meta {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2mm 5mm;
  margin: 0 0 4mm;
  padding: 3mm 4mm;
  border: 1px solid #ddd;
  color: #333;
  font-size: 7.5px;
}
.quote-reference-meta strong {
  color: #555;
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

  background: #e31b23;

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
  color: #e31b23;

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
  color: #e31b23;

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
  border-color: #e31b23;

  background: #fff8f8;
}

.inverter-node {
  border-color: #e31b23;

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
  border-color: #e31b23;

  background: #fff8f8;
}

.battery-node {
  width: 42mm;

  border-color: #555;

  background: #f7f7f7;
}

.flow-icon {
  font-size: 17px;

  color: #e31b23;

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
  color: #e31b23;

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

  color: #e31b23;

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
  color: #e31b23;

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
    2px dashed #e31b23;
}

.grid-node {
  padding:
    3mm
    5mm;

  border:
    2px solid #e31b23;

  color: #e31b23;

  font-size: 8px;

  font-weight: 900;
}

.flow-note {
  margin-top: 5mm;

  padding: 4mm;

  color: #555;

  background: #fff8f8;

  border-left:
    3px solid #e31b23;

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

  color: #20264f;

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

  color: #e31b23;

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
  color: #e31b23;

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
    1px solid #20264f;
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

  background: #e31b23;

  color: #fff;

  font-weight: 900;
}

.stars {
  color: #e31b23;

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
  color: #e31b23;

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

  background: #e31b23;

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
  color: #e31b23;

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

  background: #20264f;

  color: #fff;

  font-size: 7.5px;
}



/* Premium proposal polish: clean solar-green identity, refined cards and tables */
:root { color-scheme:light; }
html, body { color:#243447; font-family:Arial, Helvetica, sans-serif; }
.page { padding:13mm 15mm 18mm; }
.page-header { border-bottom:1.5px solid #d7e6dd; position:relative; }
.page-header:after { content:""; position:absolute; left:0; bottom:-1.5px; height:2px; width:36mm; background:#e31b23; }
.brand-name { color:#163c2e; letter-spacing:.25px; }
.brand-sub { color:#e31b23; letter-spacing:1.25px; }
.document-title { color:#e31b23; letter-spacing:.6px; }
.document-number { color:#687789; font-weight:700; }
.section-title { color:#173d30; border-bottom:2px solid #e31b23; letter-spacing:.15px; }
.cover-title, .hero-title, .proposal-title { color:#173d30; }
.info-row { color:#324457; }
.info-label, .muted, .small-text { color:#6b7887; }
.terms-box, .bank-box, .signature-box, .technical-summary, .panel-layout-card, .electrical-diagram { border-color:#dce8e1; border-radius:8px; }
.terms-box, .bank-box, .signature-box { background:#fbfdfc; }
.box-title, .diagram-title { color:#e31b23; }
.feature, .testimonial, .technical-item { border:1px solid #e0ebe5; border-radius:8px; background:#fbfdfc; }
.feature-icon, .avatar { background:#e7f6ed; color:#e31b23; border-radius:9px; }
.red-card { background:#edf8f1; border:1px solid #d3e9dc; color:#234335; border-radius:10px; }
.red-card h3 { color:#e31b23; }
.roof-area { border-color:#d6e6dc; background:#f7fbf8; border-radius:9px; }
.solar-panel { border-color:#7fae96; }
.panel-cell { background:#dff1e6; }
.flow-node { border-radius:8px; }
.flow-note { background:#f0f8f3; border-left:3px solid #e31b23; padding:10px 12px; border-radius:4px; }
table { border-collapse:separate; border-spacing:0; border:1px solid #dce7e1; border-radius:7px; overflow:hidden; }
th { background:#eaf5ef; color:#234a3a; border-color:#d8e7de; }
td { border-color:#e6eee9; }
tbody tr:nth-child(even) { background:#f8fbf9; }
.footer { border-top:1px solid #d9e6de; color:#718176; }
.testimonial-empty { border:1px solid #dce8e1; border-radius:10px; background:#f8fcf9; }
@media print { .page { -webkit-print-color-adjust:exact; print-color-adjust:exact; } }


/* GUJRAT SOLAR ENERGY — premium proposal styling */
@page { size:A4; margin:0; }
html, body { -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; }
body { font-family:Arial, Helvetica, sans-serif; color:#18362a; background:#fff; }
.page { background:#fff; color:#18362a; padding:13mm 14mm 17mm; }
.page-header { border-bottom:1px solid #d9e9df; height:23mm; margin-bottom:7mm; position:relative; }
.page-header:after { content:""; position:absolute; left:0; bottom:-1px; width:42mm; height:2px; background:#07834f; }
.brand { gap:10px; }
.header-logo { width:25mm; max-height:15mm; object-fit:contain; }
.logo-placeholder { color:#087f4d; font-size:10px; }
.brand-name { color:#0b4b34; font-size:13px; letter-spacing:.2px; }
.brand-sub { color:#16865a; font-size:6.5px; letter-spacing:1.1px; }
.document-title { color:#087f4d; font-size:13px; letter-spacing:.8px; }
.document-number { color:#65796e; font-size:8px; margin-top:3px; }
.page-footer, .footer { border-top:1px solid #dce9e1; color:#74867b; font-size:7.5px; }
.section-title { color:#0b4b34; font-size:14px; font-weight:800; border-left:4px solid #0a965b; padding-left:3mm; margin:0 0 5mm; }
.cover { background:#fff; }
.cover-top { border-bottom:3px solid #07834f; padding-bottom:5mm; }
.cover-logo { max-width:42mm; max-height:23mm; object-fit:contain; }
.cover-title, .proposal-title { color:#0b4b34; letter-spacing:-.4px; }
.cover-subtitle, .proposal-subtitle { color:#647a6d; }
.cover-customer, .customer-highlight { border:1px solid #d7eee0; border-left:4px solid #07834f; border-radius:10px; background:#f4fbf6; padding:6mm; }
.cover-company, .company-panel { background:#0b4b34; color:#fff; border-radius:12px; padding:6mm; }
.cover-company *, .company-panel * { color:inherit; }
.info-card, .customer-card, .details-card, .terms-box, .bank-box, .signature-box, .feature, .testimonial, .technical-card, .spec-card { border:1px solid #dce9e1; border-radius:9px; background:#fff; }
.info-card, .customer-card, .details-card, .terms-box, .bank-box, .signature-box { padding:4mm; }
.info-label, .muted, .small-text, .diagram-subtitle { color:#6d8175; }
.info-value { color:#1c382b; font-weight:600; overflow-wrap:anywhere; }
table { width:100%; border-collapse:separate; border-spacing:0; }
thead { display:table-header-group; }
th { background:#0b4b34; color:#fff; border:0; padding:8px 6px; font-size:7.5px; text-align:left; letter-spacing:.2px; }
th:first-child { border-radius:6px 0 0 0; }
th:last-child { border-radius:0 6px 0 0; }
td { border:0; border-bottom:1px solid #e3eee7; padding:7px 6px; color:#294237; font-size:8.5px; vertical-align:top; }
tbody tr:nth-child(even) td { background:#f7fbf8; }
tbody tr { break-inside:avoid; }
.empty { text-align:center; color:#718479; padding:12px; }
.right, .text-right { text-align:right; }
.center, .text-center { text-align:center; }
.bold, strong { color:#173a2a; }
.summary, .totals-box { border:1px solid #d7eade; border-radius:10px; background:#f5fbf7; padding:4mm; }
.summary-row, .total-row { border-bottom:1px solid #dfede4; padding:6px 0; }
.summary-row.total, .total-row.grand-total { background:#0b4b34; color:#fff; border-radius:7px; padding:10px; margin-top:4px; }
.summary-row.total *, .total-row.grand-total * { color:#fff; }
.terms-box h3, .box-title { color:#087f4d; font-size:10px; margin:0 0 2mm; }
.terms-box p { color:#4c6256; line-height:1.55; }
.panel-layout-card, .electrical-diagram { border:1px solid #dce9e1; border-radius:12px; padding:5mm; background:#fbfefc; }
.diagram-heading { border-bottom:1px solid #dce9e1; padding-bottom:3mm; margin-bottom:4mm; }
.diagram-title { color:#0b4b34; font-size:10px; font-weight:800; letter-spacing:.5px; }
.diagram-capacity, .flow-capacity { color:#087f4d; background:#e7f8ee; border-radius:7px; padding:3mm; font-weight:800; }
.roof-area { border:1px dashed #a9cdb8; border-radius:8px; background:#f3faf5; padding:4mm; }
.solar-panel { border:1px solid #4b8e70; border-radius:3px; background:#164d3c; }
.panel-number { color:#fff; }
.flow-node { border:1px solid #cfe5d7; border-radius:8px; background:#fff; padding:3mm; }
.flow-node-title { color:#0b4b34; font-weight:800; }
.flow-node-sub { color:#63796c; }
.flow-arrow { color:#07834f; font-weight:800; }
.feature-grid { gap:4mm; }
.feature { padding:4mm; }
.feature-icon { background:#e8f8ef; color:#087f4d; border-radius:8px; }
.testimonial { padding:4mm; }
.avatar { background:#e8f8ef; color:#087f4d; }
.stars { color:#e3a008; }
.bank-signature { gap:5mm; }
.bank-box, .signature-box { border-color:#dce9e1; border-radius:9px; }
.signature-line { border-top:1px solid #a9c8b6; padding-top:3mm; }
.contact-bottom { border-top:1px solid #dce9e1; color:#6d8175; padding-top:3mm; font-size:7.5px; }
@media print { .page { break-after:page; } .page:last-of-type { break-after:auto; } }


/* Dynamic three-view rooftop design sheet */
.rooftop-visual-page { color:#183b2d; }
.rooftop-visual-heading { display:flex; justify-content:space-between; align-items:center; gap:8mm; border-bottom:2px solid #e31b23; padding:0 0 4mm; margin-bottom:4mm; }
.rooftop-visual-title { font-size:16px; font-weight:900; color:#0b4b34; letter-spacing:.25px; }
.rooftop-visual-subtitle { color:#6d8175; font-size:8px; margin-top:2mm; }
.rooftop-capacity { min-width:34mm; border:1px solid #e31b23; border-radius:8px; padding:3mm; display:grid; gap:1mm; background:#fff; }
.rooftop-capacity span { font-size:7px; color:#52645a; }
.rooftop-capacity strong { color:#d71920; font-size:13px; }
.rooftop-view { position:relative; border:1px solid #d4e1d8; border-radius:9px; overflow:hidden; background:linear-gradient(145deg,#f7faf7 0%,#eaf0eb 100%); box-shadow:0 2px 7px rgba(27,55,39,.06); break-inside:avoid; }
.rooftop-view-label { position:absolute; z-index:2; top:3mm; left:3mm; border-radius:6px; padding:2mm 3mm; background:#0b4b34; color:#fff; font-weight:800; font-size:8px; }
.rooftop-view-label span { display:block; font-weight:500; margin-top:1px; }
.rooftop-view svg { display:block; width:100%; height:auto; background:linear-gradient(180deg,#f8faf7 0%,#eaf0eb 100%); }
.rooftop-top-view { margin-bottom:4mm; }
.rooftop-top-view svg { height:72mm; }
.rooftop-angle-grid { display:grid; grid-template-columns:1fr; gap:4mm; }
.rooftop-angle-grid .rooftop-view svg { height:72mm; }
.rooftop-meta-grid { margin-top:4mm; display:grid; grid-template-columns:repeat(5,1fr); background:#edf8f1; border-radius:8px; padding:3mm 1mm; }
.rooftop-meta-item { padding:1mm 2mm; border-right:1px solid #bad7c6; min-width:0; }
.rooftop-meta-item:last-child { border-right:0; }
.rooftop-meta-item span { display:block; font-size:6.5px; color:#647a6d; margin-bottom:1.5mm; }
.rooftop-meta-item strong { display:block; font-size:8px; color:#0b4b34; overflow-wrap:anywhere; }
.rooftop-disclaimer { margin-top:2mm; font-size:6.5px; color:#718176; }
@media print { .rooftop-visual-page, .rooftop-view, .rooftop-meta-grid { -webkit-print-color-adjust:exact; print-color-adjust:exact; } }


/* Client-reference footer band: red strip with social/contact icons. */
.footer {
  position:absolute !important; left:0 !important; right:0 !important; bottom:0 !important;
  height:11mm; box-sizing:border-box; display:flex; align-items:center; justify-content:space-between;
  gap:4mm; padding:0 13mm !important; border:0 !important; border-top:0 !important;
  background:#e31b23 !important; color:#fff !important; font-size:7.5px !important;
  -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important;
}
.footer-company { flex:1 1 34%; color:#fff !important; font-weight:600; }
.footer-page { flex:0 0 auto; color:#fff !important; text-align:center; white-space:nowrap; }
.footer-socials { flex:1 1 34%; display:flex; align-items:center; justify-content:flex-end; gap:2.2mm; }
.footer-social-link { display:inline-flex; align-items:center; justify-content:center; width:5.2mm; height:5.2mm; border-radius:50%; background:#fff; color:#e31b23 !important; text-decoration:none; font-size:7px; font-weight:800; line-height:1; }
.footer-social-glyph { color:#e31b23 !important; }
.footer-instagram { font-size:10px; }
.footer-linkedin { font-size:6px; }
.footer-whatsapp { font-size:10px; }
.footer-email { font-size:9px; }
.footer-phone { font-size:9px; }
@media print { .footer { position:absolute !important; } }

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
      (defaultProjectCover || photos.length)
        ? `
          <img
            src="${escapeHtml(
              defaultProjectCover ||
              (typeof photos[0] === "string"
                ? photos[0]
                : photos[0]?.url ||
                  photos[0]?.src ||
                  "")
            )}"
            alt="Gujrat Solar Energy Project"
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
  2,
  company
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
  3,
  company
)}

</section>


<!-- ======================================================
     ROOFTOP VISUALIZATION — TOP VIEW + TWO 3D ANGLES
====================================================== -->

<section class="page">

${pageHeader(
  companyName,
  company.logo,
  "ROOFTOP LAYOUT",
  quotationNumber
)}

${renderRooftopVisualization({
  panelCount,
  panelWattage,
  panelBrand,
  systemCapacity,
  systemType,
})}

${pageFooter(
  companyName,
  "Proposed Rooftop Solar Design",
  4,
  company
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
  5,
  company
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
      firstValue(company.gstin, company.gstNumber, company.gst)
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

    ${infoRow(
      "GSTIN",
      firstValue(customer.gstin, customer.gstNumber, customer.gst)
    )}

  </div>

</div>

<div class="quote-reference-meta">
  <span><strong>Date:</strong> ${formatDate(quotationDate)}</span>
  <span><strong>Expiry Date:</strong> ${formatDate(expiryDate)}</span>
  <span><strong>Estimate #:</strong> ${escapeHtml(quotationNumber)}</span>
  <span><strong>Created by:</strong> ${escapeHtml(quotation.createdBy?.username || quotation.createdBy?.name || "")}</span>
  <span><strong>Contact:</strong> ${escapeHtml(firstValue(company.phone, company.alternatePhone, ""))}</span>
</div>

<table>

<thead>

<tr>

<th>#</th>
<th>Item & Description</th>
<th>Qty</th>
<th>Rate</th>
<th>Discount</th>
<th>Amount with Tax</th>

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
      Discount (−)
    </span>

    <strong>
      ${formatCurrency(
        -Math.abs(Number(totals.discount || 0))
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
  6,
  company
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

<th>Sr. No.</th>
<th>Item</th>
<th>Qty</th>
<th>Unit</th>
<th>Brand</th>

</tr>

</thead>


<tbody>

${renderBOMRows(
  bomRows
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

    ${infoRow(
      "Site Survey Required",
      solarRequirement.siteSurveyRequired === true
        ? "Yes"
        : solarRequirement.siteSurveyRequired === false
          ? "No"
          : ""
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
      solarRequirement.monthlyBill !== undefined && solarRequirement.monthlyBill !== null
        ? formatCurrency(solarRequirement.monthlyBill)
        : ""
    )}

    ${infoRow(
      "Battery Required",
      solarRequirement.batteryRequired === true
        ? "Yes"
        : solarRequirement.batteryRequired === false
          ? "No"
          : ""
    )}

    ${infoRow(
      "Battery Capacity",
      batteryCapacity !== undefined && batteryCapacity !== null && batteryCapacity !== ""
        ? `${batteryCapacity} kWh`
        : ""
    )}

    ${infoRow("Battery Brand", batteryBrand)}
    ${infoRow("Battery Model", batteryModel)}

    ${infoRow(
      "Panel Capacity",
      panelCapacity !== undefined && panelCapacity !== null && panelCapacity !== ""
        ? `${Number(panelCapacity).toFixed(2)} kW`
        : ""
    )}

    ${infoRow(
      "Inverter Capacity",
      inverterCapacity !== undefined && inverterCapacity !== null && inverterCapacity !== ""
        ? `${inverterCapacity} kW`
        : ""
    )}

  </div>

</div>


${pageFooter(
  companyName,
  "Bill of Materials",
  7,
  company
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
    90% of rated capacity for the first 15 years and 80% for the next 15 years (30-year panel life), subject to the selected manufacturer's datasheet and warranty conditions.
  </p>

</div>


<div class="terms-box">

  <h3>
    Inverter Warranty
  </h3>

  <p>
    Manufacturing-defect warranty: 12 years, extendable where offered by the selected manufacturer. The inverter datasheet and applicable warranty terms prevail.
  </p>

</div>


<div class="terms-box">

  <h3>Battery Warranty</h3>
  <p>For hybrid and off-grid systems with a battery, manufacturing-defect warranty is 8 years, extendable where offered by the selected manufacturer. Applicable only where supported by the selected battery's warranty documentation.</p>

</div>


<div class="terms-box">

  <h3>Balance of System (BOS) & O&amp;M</h3>
  <p>BOS items: 12 months from commissioning or put-into-service date, whichever is earlier, subject to the supplier's terms. O&amp;M support may include fault finding, remote monitoring, site visits and warranty-claim assistance; panel cleaning/washing is excluded unless separately agreed.</p>

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
  8,
  company
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
          50% advance payment upon contract signing, 40% upon delivery of structure material, and 10% before meter installation is complete. Any variation must be recorded in the accepted quotation.
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
          Material dispatch and installation start after required DISCOM approval. Dispatch is targeted within 6 weeks after order confirmation and payment. Installation and commissioning are targeted within approximately 60–70 days after project accreditation, contract agreement and site possession, subject to approvals, site readiness and material availability.
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
          Supply and installation of the solar system components listed in the accepted quotation and BOM. The customer is responsible for rooftop access, site clearance, safe material unloading/storage, ladders, water and electricity during installation, required approval documents, and DISCOM-related electrical modifications or net/smart meter charges unless expressly included in the quotation.
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
      firstValue(bankDetails.ifsc, bankDetails.ifscCode)
    )}

    ${infoRow(
      "Branch",
      firstValue(bankDetails.branch, bankDetails.branchName)
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
  9,
  company
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
  10,
  company
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
              color:#e31b23;
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
