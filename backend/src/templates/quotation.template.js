const escapeHtml = (value) => {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const formatCurrency = (value) => {
  const number = Number(value || 0);

  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }
  ).format(number);
};

const formatNumber = (value) => {
  const number = Number(value || 0);

  return new Intl.NumberFormat(
    "en-IN",
    {
      maximumFractionDigits: 2,
    }
  ).format(number);
};

const formatDate = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
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

const nl2br = (value) => {
  return escapeHtml(value).replace(
    /\r?\n/g,
    "<br>"
  );
};

const renderList = (
  items = []
) => {
  if (!Array.isArray(items)) {
    return "";
  }

  return items
    .filter(Boolean)
    .map(
      (item) =>
        `<li>${escapeHtml(
          typeof item === "object"
            ? item.text ||
                item.description ||
                ""
            : item
        )}</li>`
    )
    .join("");
};

const renderTestimonials = (
  testimonials = []
) => {
  if (
    !Array.isArray(testimonials) ||
    testimonials.length === 0
  ) {
    return "";
  }

  return testimonials
    .map((item) => {
      const name =
        typeof item === "object"
          ? item.name || ""
          : "";

      const message =
        typeof item === "object"
          ? item.message ||
            item.text ||
            item.description ||
            ""
          : item;

      const designation =
        typeof item === "object"
          ? item.designation || ""
          : "";

      return `
        <div class="testimonial">
          <div class="quote-mark">“</div>
          <div class="testimonial-content">
            <p>${escapeHtml(
              message
            )}</p>
            <strong>${escapeHtml(
              name
            )}</strong>
            ${
              designation
                ? `<span>${escapeHtml(
                    designation
                  )}</span>`
                : ""
            }
          </div>
        </div>
      `;
    })
    .join("");
};

const renderImages = (
  images = []
) => {
  if (
    !Array.isArray(images) ||
    images.length === 0
  ) {
    return "";
  }

  return images
    .map((image) => {
      const src =
        typeof image === "string"
          ? image
          : image?.url ||
            image?.path ||
            image?.src ||
            "";

      if (!src) {
        return "";
      }

      const title =
        typeof image === "object"
          ? image.title || ""
          : "";

      return `
        <div class="photo-card">
          <img
            src="${escapeHtml(src)}"
            alt="${escapeHtml(
              title ||
                "Solar product"
            )}"
          />
          ${
            title
              ? `<div class="photo-title">${escapeHtml(
                  title
                )}</div>`
              : ""
          }
        </div>
      `;
    })
    .join("");
};

const renderBOMRows = (
  bomItems = []
) => {
  if (
    !Array.isArray(bomItems) ||
    bomItems.length === 0
  ) {
    return `
      <tr>
        <td colspan="8" class="empty">
          No BOM items available
        </td>
      </tr>
    `;
  }

  return bomItems
    .map(
      (item, index) => `
        <tr>
          <td>
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
                item.item || ""
              )}
            </strong>

            ${
              item.description
                ? `<div class="small-text">
                    ${escapeHtml(
                      item.description
                    )}
                  </div>`
                : ""
            }
          </td>

          <td>
            ${escapeHtml(
              item.specification ||
                ""
            )}
          </td>

          <td>
            ${escapeHtml(
              item.brand || ""
            )}
          </td>

          <td class="text-right">
            ${formatNumber(
              item.qty
            )}
          </td>

          <td>
            ${escapeHtml(
              item.unit || ""
            )}
          </td>

          <td>
            ${escapeHtml(
              item.createdAt
                ? formatDate(
                    item.createdAt
                  )
                : ""
            )}
          </td>
        </tr>
      `
    )
    .join("");
};

const renderQuotationItems = (
  items = []
) => {
  if (
    !Array.isArray(items) ||
    items.length === 0
  ) {
    return `
      <tr>
        <td colspan="9" class="empty">
          No quotation items available
        </td>
      </tr>
    `;
  }

  return items
    .map(
      (item, index) => `
        <tr>
          <td>
            ${index + 1}
          </td>

          <td>
            ${escapeHtml(
              item.category || ""
            )}
          </td>

          <td>
            <strong>
              ${escapeHtml(
                item.name || ""
              )}
            </strong>

            ${
              item.description
                ? `<div class="small-text">
                    ${escapeHtml(
                      item.description
                    )}
                  </div>`
                : ""
            }
          </td>

          <td class="text-right">
            ${formatNumber(
              item.quantity
            )}
          </td>

          <td>
            ${escapeHtml(
              item.unit || ""
            )}
          </td>

          <td class="text-right">
            ${formatCurrency(
              item.rate
            )}
          </td>

          <td class="text-right">
            ${formatCurrency(
              item.discount
            )}
          </td>

          <td class="text-right">
            ${formatCurrency(
              item.taxAmount
            )}
          </td>

          <td class="text-right">
            <strong>
              ${formatCurrency(
                item.amount
              )}
            </strong>
          </td>
        </tr>
      `
    )
    .join("");
};

const quotationTemplate = (data = {}) => {
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

  const plant =
    data.plantDetails || {};

  const proposal =
    data.proposalContent || {};

  const quotationSettings =
    data.quotationSettings || {};

  const proposalSettings =
    data.proposalSettings || {};

  const totals =
    data.totals || {};

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
    quotation.lead?.name ||
    "";

  const customerAddress = [
    customer.address,
    customer.city,
    customer.state,
    customer.pincode,
  ]
    .filter(Boolean)
    .join(", ");

  const systemType =
    plant.systemType ||
    quotation.systemType ||
    "";

  const capacity =
    plant.capacity ||
    plant.capacityKw ||
    plant.systemCapacityKw ||
    "";

  const coverTitle =
    proposalSettings.coverTitle ||
    "SOLAR POWER SOLUTION";

  const showBankDetails =
    quotationSettings.showBankDetails !==
      false;

  const showBOM =
    quotationSettings.showBOM !==
      false;

  const showProductPhotos =
    quotationSettings.showProductPhotos !==
      false;

  const showCompanyProfile =
    quotationSettings.showCompanyProfile !==
      false;

  const showTestimonials =
    quotationSettings.showTestimonials !==
      false;

  const showPaymentTerms =
    quotationSettings.showPaymentTerms !==
      false;

  const showWarrantyTerms =
    quotationSettings.showWarrantyTerms !==
      false;

  const showSubsidyTerms =
    quotationSettings.showSubsidyTerms !==
      false;

  const productPhotos =
    quotation.productPhotos ||
    [];

  const testimonials =
    data.testimonials ||
    proposal.testimonials ||
    [];

  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />

<title>
  ${escapeHtml(
    data.quotationNumber ||
      quotation.quotationNumber ||
      "Quotation"
  )}
</title>

<style>
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
    font-family:
      Arial,
      Helvetica,
      sans-serif;
    color: #202124;
    background: #ffffff;
  }

  body {
    font-size: 11px;
    line-height: 1.5;
  }

  .page {
    width: 210mm;
    min-height: 297mm;
    padding: 16mm;
    position: relative;
    page-break-after: always;
    background: #ffffff;
    overflow: hidden;
  }

  .page:last-child {
    page-break-after: auto;
  }

  .cover {
    min-height: 297mm;
    padding: 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .cover-top {
    padding: 18mm 18mm 0;
  }

  .cover-brand {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .logo {
    max-width: 58mm;
    max-height: 25mm;
    object-fit: contain;
  }

  .company-name {
    font-size: 24px;
    font-weight: 800;
    letter-spacing: 1px;
  }

  .company-tagline {
    margin-top: 4px;
    font-size: 11px;
    color: #666;
  }

  .cover-center {
    padding: 20mm 18mm;
  }

  .cover-title {
    font-size: 36px;
    line-height: 1.1;
    font-weight: 800;
    margin-bottom: 10px;
  }

  .cover-subtitle {
    font-size: 17px;
    color: #555;
  }

  .cover-details {
    margin-top: 18mm;
    display: grid;
    grid-template-columns:
      1fr 1fr;
    gap: 10mm;
  }

  .detail-box {
    border: 1px solid #ddd;
    padding: 7mm;
    border-radius: 4px;
  }

  .detail-label {
    font-size: 9px;
    text-transform: uppercase;
    color: #777;
    letter-spacing: .5px;
  }

  .detail-value {
    margin-top: 3px;
    font-size: 14px;
    font-weight: 700;
  }

  .cover-bottom {
    padding: 0 18mm 15mm;
  }

  .contact-strip {
    border-top: 2px solid #222;
    padding-top: 7px;
    display: flex;
    justify-content: space-between;
    gap: 10px;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 1px solid #ddd;
    padding-bottom: 7mm;
    margin-bottom: 8mm;
  }

  .header-left {
    width: 65%;
  }

  .header-right {
    text-align: right;
  }

  .header .company-name {
    font-size: 18px;
  }

  .header-contact {
    color: #666;
    margin-top: 4px;
  }

  .document-title {
    font-size: 23px;
    font-weight: 800;
    margin-bottom: 3px;
  }

  .document-number {
    color: #666;
  }

  h1 {
    font-size: 24px;
    margin: 0 0 8mm;
  }

  h2 {
    font-size: 17px;
    margin: 0 0 5mm;
  }

  h3 {
    font-size: 13px;
    margin: 5mm 0 3mm;
  }

  p {
    margin: 0 0 4mm;
  }

  .section {
    margin-bottom: 8mm;
  }

  .section-title {
    font-size: 15px;
    font-weight: 800;
    border-bottom: 2px solid #222;
    padding-bottom: 4px;
    margin-bottom: 5mm;
  }

  .two-column {
    display: grid;
    grid-template-columns:
      1fr 1fr;
    gap: 8mm;
  }

  .info-card {
    border: 1px solid #ddd;
    padding: 6mm;
    border-radius: 4px;
  }

  .info-card-title {
    font-size: 12px;
    font-weight: 700;
    margin-bottom: 4mm;
  }

  .info-row {
    display: flex;
    margin-bottom: 2mm;
  }

  .info-label {
    width: 35%;
    color: #666;
  }

  .info-value {
    width: 65%;
    font-weight: 600;
  }

  .photo-grid {
    display: grid;
    grid-template-columns:
      1fr 1fr;
    gap: 7mm;
  }

  .photo-card {
    border: 1px solid #ddd;
    min-height: 55mm;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .photo-card img {
    width: 100%;
    height: 58mm;
    object-fit: contain;
  }

  .photo-title {
    width: 100%;
    padding: 3mm;
    text-align: center;
    border-top: 1px solid #ddd;
    font-weight: 700;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 4mm;
  }

  th {
    background: #f2f2f2;
    border: 1px solid #ccc;
    padding: 6px 5px;
    text-align: left;
    font-size: 9px;
    text-transform: uppercase;
  }

  td {
    border: 1px solid #ddd;
    padding: 6px 5px;
    vertical-align: top;
  }

  .text-right {
    text-align: right;
  }

  .text-center {
    text-align: center;
  }

  .small-text {
    font-size: 9px;
    color: #666;
    margin-top: 2px;
  }

  .empty {
    text-align: center;
    color: #777;
    padding: 15px;
  }

  .summary {
    width: 75%;
    margin-left: auto;
    margin-top: 8mm;
  }

  .summary-row {
    display: flex;
    justify-content: space-between;
    padding: 5px 0;
    border-bottom: 1px solid #eee;
  }

  .summary-row.total {
    border-top: 2px solid #222;
    border-bottom: 2px solid #222;
    margin-top: 4px;
    padding: 9px 0;
    font-size: 15px;
    font-weight: 800;
  }

  .terms-box {
    border: 1px solid #ddd;
    padding: 6mm;
    margin-bottom: 5mm;
    border-radius: 4px;
  }

  .terms-title {
    font-size: 12px;
    font-weight: 800;
    margin-bottom: 3mm;
  }

  ul {
    margin: 2mm 0 4mm 6mm;
    padding-left: 5mm;
  }

  li {
    margin-bottom: 2mm;
  }

  .bank-table {
    width: 100%;
    border-collapse: collapse;
  }

  .bank-table td {
    padding: 4px 5px;
  }

  .signature {
    margin-top: 15mm;
    width: 60mm;
    margin-left: auto;
    text-align: center;
  }

  .signature img {
    max-width: 45mm;
    max-height: 22mm;
    object-fit: contain;
  }

  .signature-line {
    border-top: 1px solid #222;
    margin-top: 8mm;
    padding-top: 3mm;
  }

  .testimonial {
    border: 1px solid #ddd;
    padding: 6mm;
    margin-bottom: 5mm;
    display: flex;
    gap: 5mm;
  }

  .quote-mark {
    font-size: 30px;
    line-height: 1;
    font-weight: 800;
  }

  .testimonial-content p {
    font-style: italic;
  }

  .testimonial-content span {
    display: block;
    color: #777;
    font-size: 9px;
    margin-top: 2px;
  }

  .thank-you {
    min-height: 230mm;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
  }

  .thank-you-title {
    font-size: 38px;
    font-weight: 800;
    margin-bottom: 6mm;
  }

  .thank-you-text {
    max-width: 125mm;
    color: #666;
    font-size: 13px;
  }

  .footer {
    position: absolute;
    bottom: 8mm;
    left: 16mm;
    right: 16mm;
    border-top: 1px solid #ddd;
    padding-top: 3mm;
    display: flex;
    justify-content: space-between;
    color: #777;
    font-size: 8px;
  }

  .page-number {
    text-align: right;
  }

  .badge {
    display: inline-block;
    border: 1px solid #222;
    padding: 2px 7px;
    font-size: 9px;
    border-radius: 12px;
    margin-top: 3px;
  }
</style>
</head>

<body>

<!-- =====================================================
     PAGE 1 — COVER
===================================================== -->

<section class="page cover">

  <div class="cover-top">

    <div class="cover-brand">

      <div>
        ${
          company.logo
            ? `
              <img
                class="logo"
                src="${escapeHtml(
                  company.logo
                )}"
                alt="${escapeHtml(
                  companyName
                )}"
              />
            `
            : `
              <div class="company-name">
                ${escapeHtml(
                  companyName
                )}
              </div>
            `
        }

        ${
          company.tagline
            ? `
              <div class="company-tagline">
                ${escapeHtml(
                  company.tagline
                )}
              </div>
            `
            : ""
        }
      </div>

      <div class="header-right">
        <div class="detail-label">
          ESTIMATE / QUOTATION
        </div>

        <div class="detail-value">
          ${escapeHtml(
            data.quotationNumber ||
              quotation.quotationNumber ||
              ""
          )}
        </div>

        <div class="small-text">
          Date:
          ${formatDate(
            quotation.quotationDate ||
              quotation.date ||
              quotation.createdAt
          )}
        </div>
      </div>

    </div>

  </div>

  <div class="cover-center">

    <div class="cover-title">
      ${escapeHtml(
        coverTitle
      )}
    </div>

    <div class="cover-subtitle">
      ${escapeHtml(
        quotation.title ||
          proposalSettings.subtitle ||
          "Complete Solar Energy Solution"
      )}
    </div>

    <div class="cover-details">

      <div class="detail-box">
        <div class="detail-label">
          Prepared For
        </div>

        <div class="detail-value">
          ${escapeHtml(
            customerName
          )}
        </div>

        ${
          customer.companyName
            ? `
              <div class="small-text">
                ${escapeHtml(
                  customer.companyName
                )}
              </div>
            `
            : ""
        }
      </div>

      <div class="detail-box">
        <div class="detail-label">
          Solar System
        </div>

        <div class="detail-value">
          ${
            capacity
              ? `${escapeHtml(
                  capacity
                )} kW`
              : "Solar System"
          }
        </div>

        ${
          systemType
            ? `
              <div class="small-text">
                ${escapeHtml(
                  systemType
                )}
              </div>
            `
            : ""
        }
      </div>

    </div>

  </div>

  <div class="cover-bottom">

    <div class="contact-strip">

      <div>
        <strong>
          ${escapeHtml(
            company.phone ||
              company.alternatePhone ||
              ""
          )}
        </strong>
      </div>

      <div>
        ${escapeHtml(
          company.email || ""
        )}
      </div>

      <div>
        ${escapeHtml(
          company.website || ""
        )}
      </div>

    </div>

  </div>

</section>


<!-- =====================================================
     PAGE 2 — COMPANY PROFILE
===================================================== -->

${
  showCompanyProfile
    ? `
<section class="page">

  <div class="header">

    <div class="header-left">

      <div class="company-name">
        ${escapeHtml(
          companyName
        )}
      </div>

      <div class="header-contact">
        ${escapeHtml(
          companyAddress
        )}
      </div>

    </div>

    <div class="header-right">

      <div class="document-title">
        COMPANY PROFILE
      </div>

      <div class="document-number">
        ${escapeHtml(
          data.quotationNumber ||
            quotation.quotationNumber ||
            ""
        )}
      </div>

    </div>

  </div>

  <div class="section">

    <div class="section-title">
      About Us
    </div>

    <p>
      ${nl2br(
        proposal.companyProfile ||
          company.companyProfile ||
          "We provide reliable and professional solar energy solutions for residential, commercial and industrial requirements."
      )}
    </p>

  </div>

  <div class="two-column">

    <div class="info-card">

      <div class="info-card-title">
        Our Vision
      </div>

      <p>
        ${nl2br(
          proposal.vision ||
            company.vision ||
            proposalSettings.defaultVision ||
            ""
        )}
      </p>

    </div>

    <div class="info-card">

      <div class="info-card-title">
        Our Mission
      </div>

      <p>
        ${nl2br(
          proposal.mission ||
            company.mission ||
            proposalSettings.defaultMission ||
            ""
        )}
      </p>

    </div>

  </div>

  <div class="section">

    <div class="section-title">
      Customer Details
    </div>

    <div class="two-column">

      <div class="info-card">

        <div class="info-row">
          <div class="info-label">
            Name
          </div>

          <div class="info-value">
            ${escapeHtml(
              customerName
            )}
          </div>
        </div>

        <div class="info-row">
          <div class="info-label">
            Mobile
          </div>

          <div class="info-value">
            ${escapeHtml(
              customer.mobile ||
                customer.phone ||
                ""
            )}
          </div>
        </div>

        <div class="info-row">
          <div class="info-label">
            Email
          </div>

          <div class="info-value">
            ${escapeHtml(
              customer.email ||
                ""
            )}
          </div>
        </div>

      </div>

      <div class="info-card">

        <div class="info-row">
          <div class="info-label">
            Address
          </div>

          <div class="info-value">
            ${escapeHtml(
              customerAddress
            )}
          </div>
        </div>

        <div class="info-row">
          <div class="info-label">
            GSTIN
          </div>

          <div class="info-value">
            ${escapeHtml(
              customer.gstin ||
                customer.gstNumber ||
                ""
            )}
          </div>
        </div>

      </div>

    </div>

  </div>

  <div class="section">

    <div class="section-title">
      Proposed Solar System
    </div>

    <div class="two-column">

      <div class="info-card">

        <div class="info-row">
          <div class="info-label">
            System Capacity
          </div>

          <div class="info-value">
            ${
              capacity
                ? `${escapeHtml(
                    capacity
                  )} kW`
                : "-"
            }
          </div>
        </div>

        <div class="info-row">
          <div class="info-label">
            System Type
          </div>

          <div class="info-value">
            ${escapeHtml(
              systemType ||
                "-"
            )}
          </div>
        </div>

      </div>

      <div class="info-card">

        <div class="info-row">
          <div class="info-label">
            Roof Type
          </div>

          <div class="info-value">
            ${escapeHtml(
              quotation.solarRequirement
                ?.roofType ||
                plant.roofType ||
                "-"
            )}
          </div>
        </div>

        <div class="info-row">
          <div class="info-label">
            Site Location
          </div>

          <div class="info-value">
            ${escapeHtml(
              quotation.solarRequirement
                ?.siteAddress ||
                plant.siteAddress ||
                ""
            )}
          </div>
        </div>

      </div>

    </div>

  </div>

  <div class="footer">
    <span>
      ${escapeHtml(
        companyName
      )}
    </span>

    <span>
      Company Profile
    </span>

    <span class="page-number">
      Page 2
    </span>
  </div>

</section>
`
    : ""
}


<!-- =====================================================
     PAGE 3 — PRODUCT PHOTOS
===================================================== -->

${
  showProductPhotos &&
  productPhotos.length > 0
    ? `
<section class="page">

  <div class="header">

    <div class="header-left">
      <div class="company-name">
        ${escapeHtml(
          companyName
        )}
      </div>
    </div>

    <div class="header-right">
      <div class="document-title">
        PRODUCTS
      </div>
    </div>

  </div>

  <div class="section">

    <div class="section-title">
      Solar Products
    </div>

    <div class="photo-grid">
      ${renderImages(
        productPhotos
      )}
    </div>

  </div>

  <div class="footer">
    <span>
      ${escapeHtml(
        companyName
      )}
    </span>

    <span>
      Solar Products
    </span>

    <span class="page-number">
      Page 3
    </span>
  </div>

</section>
`
    : ""
}


<!-- =====================================================
     PAGE 4 — QUOTATION
===================================================== -->

<section class="page">

  <div class="header">

    <div class="header-left">

      ${
        company.logo
          ? `
            <img
              class="logo"
              src="${escapeHtml(
                company.logo
              )}"
              alt="${escapeHtml(
                companyName
              )}"
            />
          `
          : `
            <div class="company-name">
              ${escapeHtml(
                companyName
              )}
            </div>
          `
      }

      <div class="header-contact">
        ${escapeHtml(
          companyAddress
        )}
      </div>

      <div class="header-contact">
        ${
          company.phone
            ? `Phone: ${escapeHtml(
                company.phone
              )}`
            : ""
        }

        ${
          company.email
            ? ` | Email: ${escapeHtml(
                company.email
              )}`
            : ""
        }
      </div>

      ${
        company.gstin
          ? `
            <div class="header-contact">
              GSTIN:
              ${escapeHtml(
                company.gstin
              )}
            </div>
          `
          : ""
      }

    </div>

    <div class="header-right">

      <div class="document-title">
        QUOTATION
      </div>

      <div class="document-number">
        Estimate ID:
        ${escapeHtml(
          data.quotationNumber ||
            quotation.quotationNumber ||
            ""
        )}
      </div>

      <div class="document-number">
        Date:
        ${formatDate(
          quotation.quotationDate ||
            quotation.date ||
            quotation.createdAt
        )}
      </div>

      ${
        quotation.status
          ? `
            <div class="badge">
              ${escapeHtml(
                quotation.status
              )}
            </div>
          `
          : ""
      }

    </div>

  </div>

  <div class="two-column">

    <div class="info-card">

      <div class="info-card-title">
        Bill To
      </div>

      <div class="info-row">
        <div class="info-label">
          Name
        </div>

        <div class="info-value">
          ${escapeHtml(
            customerName
          )}
        </div>
      </div>

      ${
        customer.companyName
          ? `
            <div class="info-row">
              <div class="info-label">
                Company
              </div>

              <div class="info-value">
                ${escapeHtml(
                  customer.companyName
                )}
              </div>
            </div>
          `
          : ""
      }

      <div class="info-row">
        <div class="info-label">
          Mobile
        </div>

        <div class="info-value">
          ${escapeHtml(
            customer.mobile ||
              customer.phone ||
              ""
          )}
        </div>
      </div>

      <div class="info-row">
        <div class="info-label">
          Address
        </div>

        <div class="info-value">
          ${escapeHtml(
            customerAddress
          )}
        </div>
      </div>

    </div>

    <div class="info-card">

      <div class="info-card-title">
        System Details
      </div>

      <div class="info-row">
        <div class="info-label">
          Capacity
        </div>

        <div class="info-value">
          ${
            capacity
              ? `${escapeHtml(
                  capacity
                )} kW`
              : "-"
          }
        </div>
      </div>

      <div class="info-row">
        <div class="info-label">
          Type
        </div>

        <div class="info-value">
          ${escapeHtml(
            systemType ||
              "-"
          )}
        </div>
      </div>

      <div class="info-row">
        <div class="info-label">
          Validity
        </div>

        <div class="info-value">
          ${escapeHtml(
            data.quotationValidity ||
              ""
          )}
        </div>
      </div>

    </div>

  </div>

  <div class="section">

    <div class="section-title">
      Quotation Details
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

  </div>

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

    ${
      Number(totals.igst || 0) > 0
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

    <div class="summary-row total">

      <span>
        Grand Total
      </span>

      <strong>
        ${formatCurrency(
          totals.grandTotal
        )}
      </strong>

    </div>

  </div>

  <div class="footer">
    <span>
      ${escapeHtml(
        companyName
      )}
    </span>

    <span>
      Quotation
    </span>

    <span class="page-number">
      Page 4
    </span>
  </div>

</section>


<!-- =====================================================
     PAGE 5 — DETAILED BOM
===================================================== -->

${
  showBOM
    ? `
<section class="page">

  <div class="header">

    <div class="header-left">
      <div class="company-name">
        ${escapeHtml(
          companyName
        )}
      </div>

      <div class="header-contact">
        ${escapeHtml(
          companyAddress
        )}
      </div>
    </div>

    <div class="header-right">

      <div class="document-title">
        DETAILED BOM
      </div>

      <div class="document-number">
        ${escapeHtml(
          data.quotationNumber ||
            quotation.quotationNumber ||
            ""
        )}
      </div>

    </div>

  </div>

  <div class="section">

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

  </div>

  ${
    plant.notes ||
    quotation.systemConfiguration
      ?.notes
      ? `
        <div class="terms-box">

          <div class="terms-title">
            System Notes
          </div>

          <p>
            ${nl2br(
              plant.notes ||
                quotation
                  .systemConfiguration
                  ?.notes ||
                ""
            )}
          </p>

        </div>
      `
      : ""
  }

  <div class="footer">
    <span>
      ${escapeHtml(
        companyName
      )}
    </span>

    <span>
      Bill of Materials
    </span>

    <span class="page-number">
      Page 5
    </span>
  </div>

</section>
`
    : ""
}


<!-- =====================================================
     PAGE 6 — TERMS / WARRANTY / BANK
===================================================== -->

<section class="page">

  <div class="header">

    <div class="header-left">

      <div class="company-name">
        ${escapeHtml(
          companyName
        )}
      </div>

      <div class="header-contact">
        ${escapeHtml(
          companyAddress
        )}
      </div>

    </div>

    <div class="header-right">

      <div class="document-title">
        TERMS & CONDITIONS
      </div>

    </div>

  </div>

  ${
    showPaymentTerms &&
    data.paymentTerms
      ? `
        <div class="terms-box">

          <div class="terms-title">
            Payment Terms
          </div>

          <div>
            ${nl2br(
              data.paymentTerms
            )}
          </div>

        </div>
      `
      : ""
  }

  ${
    showWarrantyTerms &&
    data.warrantyTerms
      ? `
        <div class="terms-box">

          <div class="terms-title">
            Warranty Terms
          </div>

          <div>
            ${nl2br(
              data.warrantyTerms
            )}
          </div>

        </div>
      `
      : ""
  }

  ${
    showSubsidyTerms &&
    data.subsidyTerms
      ? `
        <div class="terms-box">

          <div class="terms-title">
            Subsidy Terms
          </div>

          <div>
            ${nl2br(
              data.subsidyTerms
            )}
          </div>

        </div>
      `
      : ""
  }

  ${
    data.installationTerms
      ? `
        <div class="terms-box">

          <div class="terms-title">
            Installation Terms
          </div>

          <div>
            ${nl2br(
              data.installationTerms
            )}
          </div>

        </div>
      `
      : ""
  }

  ${
    data.scopeOfWork
      ? `
        <div class="terms-box">

          <div class="terms-title">
            Scope of Work
          </div>

          <div>
            ${nl2br(
              data.scopeOfWork
            )}
          </div>

        </div>
      `
      : ""
  }

  ${
    data.warrantyExclusions
      ? `
        <div class="terms-box">

          <div class="terms-title">
            Warranty Exclusions
          </div>

          <div>
            ${nl2br(
              data.warrantyExclusions
            )}
          </div>

        </div>
      `
      : ""
  }

  ${
    showBankDetails
      ? `
        <div class="terms-box">

          <div class="terms-title">
            Bank Details
          </div>

          <table class="bank-table">

            <tr>
              <td>
                Bank Name
              </td>

              <td>
                ${escapeHtml(
                  bankDetails.bankName ||
                    ""
                )}
              </td>
            </tr>

            <tr>
              <td>
                Account Name
              </td>

              <td>
                ${escapeHtml(
                  bankDetails.accountName ||
                    companyName
                )}
              </td>
            </tr>

            <tr>
              <td>
                Account Number
              </td>

              <td>
                ${escapeHtml(
                  bankDetails.accountNumber ||
                    ""
                )}
              </td>
            </tr>

            <tr>
              <td>
                IFSC
              </td>

              <td>
                ${escapeHtml(
                  bankDetails.ifscCode ||
                    ""
                )}
              </td>
            </tr>

            <tr>
              <td>
                Branch
              </td>

              <td>
                ${escapeHtml(
                  bankDetails.branchName ||
                    ""
                )}
              </td>
            </tr>

            ${
              bankDetails.upiId
                ? `
                  <tr>
                    <td>
                      UPI ID
                    </td>

                    <td>
                      ${escapeHtml(
                        bankDetails.upiId
                      )}
                    </td>
                  </tr>
                `
                : ""
            }

          </table>

        </div>
      `
      : ""
  }

  <div class="signature">

    ${
      signature.signatureImage
        ? `
          <img
            src="${escapeHtml(
              signature.signatureImage
            )}"
            alt="Authorized Signature"
          />
        `
        : ""
    }

    <div class="signature-line">

      <strong>
        ${escapeHtml(
          signature.name ||
            ""
        )}
      </strong>

      ${
        signature.designation
          ? `
            <div class="small-text">
              ${escapeHtml(
                signature.designation
              )}
            </div>
          `
          : ""
      }

      <div class="small-text">
        Authorized Signatory
      </div>

    </div>

  </div>

  <div class="footer">
    <span>
      ${escapeHtml(
        companyName
      )}
    </span>

    <span>
      Terms & Conditions
    </span>

    <span class="page-number">
      Page 6
    </span>
  </div>

</section>


<!-- =====================================================
     PAGE 7 — TESTIMONIALS
===================================================== -->

${
  showTestimonials &&
  testimonials.length > 0
    ? `
<section class="page">

  <div class="header">

    <div class="header-left">
      <div class="company-name">
        ${escapeHtml(
          companyName
        )}
      </div>
    </div>

    <div class="header-right">
      <div class="document-title">
        CUSTOMER EXPERIENCE
      </div>
    </div>

  </div>

  <div class="section">

    <div class="section-title">
      Our Customers
    </div>

    ${renderTestimonials(
      testimonials
    )}

  </div>

  ${
    data.footerContent
      ? `
        <div class="terms-box">

          <div class="terms-title">
            Thank You
          </div>

          <div>
            ${nl2br(
              data.footerContent
            )}
          </div>

        </div>
      `
      : ""
  }

  <div class="footer">
    <span>
      ${escapeHtml(
        companyName
      )}
    </span>

    <span>
      Customer Experience
    </span>

    <span class="page-number">
      Page 7
    </span>
  </div>

</section>
`
    : ""
}


<!-- =====================================================
     PAGE 8 — CONTACT
===================================================== -->

<section class="page">

  <div class="thank-you">

    ${
      company.logo
        ? `
          <img
            class="logo"
            src="${escapeHtml(
              company.logo
            )}"
            alt="${escapeHtml(
              companyName
            )}"
          />
        `
        : ""
    }

    <div class="thank-you-title">
      Thank You
    </div>

    <div class="thank-you-text">

      ${
        data.footerContent
          ? nl2br(
              data.footerContent
            )
          : "Thank you for considering our solar energy solution. We look forward to serving you."
      }

    </div>

    <div
      class="terms-box"
      style="
        width: 120mm;
        margin-top: 15mm;
        text-align: left;
      "
    >

      <div class="terms-title">
        Contact Us
      </div>

      ${
        companyName
          ? `
            <div class="info-row">
              <div class="info-label">
                Company
              </div>

              <div class="info-value">
                ${escapeHtml(
                  companyName
                )}
              </div>
            </div>
          `
          : ""
      }

      ${
        companyAddress
          ? `
            <div class="info-row">
              <div class="info-label">
                Address
              </div>

              <div class="info-value">
                ${escapeHtml(
                  companyAddress
                )}
              </div>
            </div>
          `
          : ""
      }

      ${
        company.phone
          ? `
            <div class="info-row">
              <div class="info-label">
                Phone
              </div>

              <div class="info-value">
                ${escapeHtml(
                  company.phone
                )}
              </div>
            </div>
          `
          : ""
      }

      ${
        company.email
          ? `
            <div class="info-row">
              <div class="info-label">
                Email
              </div>

              <div class="info-value">
                ${escapeHtml(
                  company.email
                )}
              </div>
            </div>
          `
          : ""
      }

      ${
        company.website
          ? `
            <div class="info-row">
              <div class="info-label">
                Website
              </div>

              <div class="info-value">
                ${escapeHtml(
                  company.website
                )}
              </div>
            </div>
          `
          : ""
      }

      ${
        company.gstin
          ? `
            <div class="info-row">
              <div class="info-label">
                GSTIN
              </div>

              <div class="info-value">
                ${escapeHtml(
                  company.gstin
                )}
              </div>
            </div>
          `
          : ""
      }

    </div>

  </div>

  <div class="footer">
    <span>
      ${escapeHtml(
        companyName
      )}
    </span>

    <span>
      Thank You
    </span>

    <span class="page-number">
      Page 8
    </span>
  </div>

</section>

</body>
</html>
`;
};

module.exports =
  quotationTemplate;