const fs = require("fs");
const path = require("path");

// Load the company logo from backend/public/assets so it is embedded in the
// generated HTML/PDF and does not depend on a browser being able to fetch it.
const getDefaultCompanyLogo = () => {
  const candidates = [
    path.resolve(process.cwd(), "public", "assets", "gujrat-solar-logo.png"),
    path.resolve(__dirname, "../../public/assets/gujrat-solar-logo.png"),
    path.resolve(__dirname, "../../../public/assets/gujrat-solar-logo.png"),
    path.resolve(__dirname, "../public/assets/gujrat-solar-logo.png"),
  ];

  const logoPath = candidates.find((candidate) => fs.existsSync(candidate));
  if (!logoPath) return "";

  try {
    const image = fs.readFileSync(logoPath);
    return `data:image/png;base64,${image.toString("base64")}`;
  } catch (error) {
    console.error("Unable to load Gujrat Solar Energy logo:", error.message);
    return "";
  }
};

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

const numberToWords = (amount) => {
  const number = Math.round(
    Number(amount || 0)
  );

  if (number === 0) {
    return "Zero Rupees Only";
  }

  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];

  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  const twoDigits = (num) => {
    if (num < 20) {
      return ones[num];
    }

    return `${tens[
      Math.floor(num / 10)
    ]}${
      num % 10
        ? ` ${ones[num % 10]}`
        : ""
    }`;
  };

  const convert = (num) => {
    let result = "";

    if (num >= 10000000) {
      result += `${convert(
        Math.floor(num / 10000000)
      )} Crore `;

      num %= 10000000;
    }

    if (num >= 100000) {
      result += `${convert(
        Math.floor(num / 100000)
      )} Lakh `;

      num %= 100000;
    }

    if (num >= 1000) {
      result += `${convert(
        Math.floor(num / 1000)
      )} Thousand `;

      num %= 1000;
    }

    if (num >= 100) {
      result += `${ones[
        Math.floor(num / 100)
      ]} Hundred `;

      num %= 100;
    }

    if (num > 0) {
      result += twoDigits(num);
    }

    return result.trim();
  };

  return `${convert(
    number
  )} Rupees Only`;
};

const renderItems = (
  items = []
) => {
  if (
    !Array.isArray(items) ||
    items.length === 0
  ) {
    return `
      <tr>
        <td colspan="10" class="empty">
          No invoice items available
        </td>
      </tr>
    `;
  }

  return items
    .map(
      (item, index) => `
        <tr>

          <td class="text-center">
            ${index + 1}
          </td>

          <td>
            <strong>
              ${escapeHtml(
                item.itemName || ""
              )}
            </strong>

            ${
              item.description
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
              (Number(item.quantity) || 0) *
              (Number(item.rate) || 0) *
              Math.min(100, Math.max(0, Number(item.discount) || 0)) / 100
            )}
          </td>

          <td class="text-right">
            ${formatCurrency(
              item.taxableAmount
            )}
          </td>

          <td class="text-right">
            ${formatCurrency(
              item.cgstAmount
            )}
          </td>

          <td class="text-right">
            ${formatCurrency(
              item.sgstAmount
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

const invoiceTemplate = (data = {}) => {
  const invoice =
    data.invoice || {};

  const company =
    data.company || {};

  const bankDetails =
    data.bankDetails || {};

  const signature =
    data.signature || {};

  const invoiceSettings =
    data.invoiceSettings || {};

  const customer =
    data.customerDetails ||
    invoice.customerDetails ||
    {};

  const seller =
    data.sellerDetails ||
    invoice.sellerDetails ||
    {};

  const totals =
    data.totals || {};

  const companyName =
    company.name ||
    company.legalName ||
    "GUJRAT SOLAR ENERGY";

  const companyLogo = company.logo || getDefaultCompanyLogo();

  const companyAddress = [
    company.address || "83/161-3, Parampurwa, Juhi",
    company.city || "Kanpur Nagar",
    company.state || "Uttar Pradesh",
    company.pincode || "208014",
  ]
    .filter(Boolean)
    .join(", ");

  const companyPhone = company.phone || "+91 8545909039";
  const companyEmail = company.email || "gujratsolar14@gmail.com";
  const companyWebsite = company.website || "www.gujratsolarenergy.com";
  const companyGstin = company.gstin || "09GBQPS0127B1ZL";

  const sellerAddress = [
    seller.address,
    seller.city,
    seller.state,
    seller.pincode,
  ]
    .filter(Boolean)
    .join(", ");

  const customerName =
    customer.name ||
    customer.customerName ||
    "";

  const customerAddress = [
    customer.address,
    customer.city,
    customer.state,
    customer.pincode,
  ]
    .filter(Boolean)
    .join(", ");

  const grandTotal =
    Number(
      totals.grandTotal || 0
    );

  return `
<!DOCTYPE html>

<html lang="en">

<head>

<meta charset="UTF-8" />

<title>
  ${escapeHtml(
    data.invoiceNumber ||
      invoice.invoiceNumber ||
      "Invoice"
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
    background: #ffffff;
    color: #202124;
    font-family:
      Arial,
      Helvetica,
      sans-serif;
  }

  body {
    font-size: 10.5px;
    line-height: 1.45;
  }

  .page {
    width: 210mm;
    min-height: 297mm;
    padding: 14mm;
    position: relative;
    background: #fff;
  }

  .top-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 2px solid #222;
    padding-bottom: 7mm;
  }

  .company-section {
    width: 60%;
  }

  .company-logo {
    display: block;
    width: auto;
    max-width: 43mm;
    height: auto;
    max-height: 30mm;
    object-fit: contain;
    object-position: left center;
    margin-bottom: 3mm;
  }

  .company-name {
    font-size: 23px;
    font-weight: 800;
    letter-spacing: .5px;
  }

  .company-address {
    margin-top: 3px;
    color: #555;
    max-width: 100mm;
  }

  .company-contact {
    margin-top: 3px;
    color: #444;
  }

  .invoice-heading {
    width: 35%;
    text-align: right;
  }

  .invoice-title {
    font-size: 26px;
    font-weight: 800;
    margin-bottom: 3mm;
  }

  .invoice-meta {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 2px 8px;
    text-align: right;
  }

  .invoice-meta-label {
    color: #666;
  }

  .invoice-meta-value {
    font-weight: 700;
  }

  .status {
    display: inline-block;
    margin-top: 3mm;
    padding: 3px 9px;
    border: 1px solid #222;
    border-radius: 12px;
    font-size: 8px;
    font-weight: 700;
    text-transform: uppercase;
  }

  .tax-invoice {
    margin-top: 5mm;
    text-align: center;
    font-size: 12px;
    font-weight: 800;
    text-transform: uppercase;
  }

  .parties {
    display: grid;
    grid-template-columns:
      1fr 1fr;
    gap: 7mm;
    margin-top: 7mm;
  }

  .parties.parties-single {
    grid-template-columns: 1fr;
  }

  .parties.parties-single .party-card {
    width: 100%;
    box-sizing: border-box;
  }

  .notes-section {
    margin-top: 7mm;
    padding: 4mm 0;
    border-top: 1px solid #ddd;
  }

  .notes-title {
    font-size: 10px;
    font-weight: 800;
    margin-bottom: 2mm;
  }

  .party-card {
    border: 1px solid #ccc;
    border-radius: 3px;
    padding: 5mm;
  }

  .party-title {
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
    border-bottom: 1px solid #ddd;
    padding-bottom: 3mm;
    margin-bottom: 4mm;
  }

  .party-name {
    font-size: 13px;
    font-weight: 800;
    margin-bottom: 3mm;
  }

  .info-row {
    display: flex;
    margin-bottom: 2mm;
  }

  .info-label {
    width: 32%;
    color: #666;
  }

  .info-value {
    width: 68%;
    font-weight: 600;
  }

  .section {
    margin-top: 8mm;
  }

  .section-title {
    font-size: 13px;
    font-weight: 800;
    border-bottom: 2px solid #222;
    padding-bottom: 3px;
    margin-bottom: 4mm;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  th {
    background: #f1f1f1;
    border: 1px solid #bbb;
    padding: 6px 4px;
    font-size: 8px;
    text-transform: uppercase;
    text-align: left;
  }

  td {
    border: 1px solid #d5d5d5;
    padding: 6px 4px;
    vertical-align: top;
  }

  .text-right {
    text-align: right;
  }

  .text-center {
    text-align: center;
  }

  .small-text {
    color: #666;
    font-size: 8.5px;
    margin-top: 2px;
  }

  .empty {
    text-align: center;
    padding: 12px;
    color: #777;
  }

  .summary-wrapper {
    display: flex;
    justify-content: flex-end;
    margin-top: 6mm;
  }

  .summary {
    width: 82mm;
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
    margin-top: 2px;
    padding: 8px 0;
    font-size: 14px;
    font-weight: 800;
  }

  .amount-words {
    margin-top: 6mm;
    border: 1px solid #ccc;
    padding: 5mm;
  }

  .amount-words-title {
    font-size: 9px;
    color: #666;
    text-transform: uppercase;
    margin-bottom: 2mm;
  }

  .amount-words-value {
    font-weight: 700;
  }

  .bank-and-notes {
    display: grid;
    grid-template-columns:
      1fr 1fr;
    gap: 7mm;
    margin-top: 7mm;
  }

  .box {
    border: 1px solid #ccc;
    padding: 5mm;
    border-radius: 3px;
  }

  .box-title {
    font-size: 11px;
    font-weight: 800;
    margin-bottom: 4mm;
  }

  .bank-row {
    display: flex;
    margin-bottom: 2mm;
  }

  .bank-label {
    width: 38%;
    color: #666;
  }

  .bank-value {
    width: 62%;
    font-weight: 600;
  }

  .terms {
    margin-top: 7mm;
    border: 1px solid #ccc;
    padding: 5mm;
  }

  .terms-title {
    font-size: 11px;
    font-weight: 800;
    margin-bottom: 3mm;
  }

  .signature-section {
    margin-top: 10mm;
    display: flex;
    justify-content: flex-end;
  }

  .signature {
    width: 65mm;
    text-align: center;
  }

  .signature-image {
    max-width: 45mm;
    max-height: 20mm;
    object-fit: contain;
  }

  .signature-line {
    border-top: 1px solid #222;
    padding-top: 3mm;
    margin-top: 7mm;
  }

  .footer {
    position: absolute;
    left: 14mm;
    right: 14mm;
    bottom: 7mm;
    border-top: 1px solid #ddd;
    padding-top: 3mm;
    display: flex;
    justify-content: space-between;
    color: #777;
    font-size: 8px;
  }



  /* Premium solar-energy invoice styling */
  :root { color-scheme: light; }
  body { color:#182638; font-family: Arial, Helvetica, sans-serif; letter-spacing:.05px; }
  .page { padding:13mm 13mm 15mm; }
  .top-header { border-bottom:3px solid #e31b23; padding-bottom:6mm; position:relative; }
  .top-header:after { content:""; position:absolute; bottom:-3px; right:0; width:27%; height:3px; background:#f4bfc3; }
  .company-name { color:#123329; font-size:21px; letter-spacing:.3px; }
  .company-address,.company-contact { color:#5b6877; font-size:9px; line-height:1.55; }
  .invoice-title { color:#e31b23; font-size:27px; letter-spacing:1.1px; }
  .invoice-meta { gap:4px 10px; margin-top:5px; font-size:9px; }
  .invoice-meta-label { color:#687789; }
  .invoice-meta-value { color:#172a40; }
  .status { background:#fff0f1; border:1px solid #f4bfc3; color:#e31b23; border-radius:999px; padding:4px 10px; }
  .parties { margin-top:6mm; gap:5mm; grid-template-columns:1fr 1fr; align-items:stretch; }
  .party-card { border:1px solid #eadcdd; border-radius:8px; padding:4mm; background:#fbfdfc; break-inside:avoid; }
  .party-title { color:#e31b23; font-size:9px; letter-spacing:.7px; border-bottom:1px solid #eadcdd; padding-bottom:2.5mm; margin-bottom:3mm; }
  .party-name { color:#142c25; font-size:12px; margin-bottom:2.5mm; }
  .info-row { gap:6px; margin-bottom:1.6mm; font-size:8.7px; }
  .info-label { width:29%; color:#6a7786; }
  .info-value { width:71%; color:#243548; overflow-wrap:anywhere; }
  .section { margin-top:6mm; }
  .section-title { color:#143d30; font-size:12px; border-bottom:2px solid #e31b23; padding-bottom:2mm; margin-bottom:3mm; }
  table { border-collapse:separate; border-spacing:0; overflow:hidden; border:1px solid #eadcdd; border-radius:7px; }
  th { background:#fff5f5; color:#214a3b; border:0; border-bottom:1px solid #eadcdd; padding:8px 5px; font-size:7.2px; letter-spacing:.35px; }
  td { border:0; border-bottom:1px solid #e8eeeb; padding:7px 5px; color:#273748; font-size:8.5px; }
  tbody tr:nth-child(even) { background:#f8fbf9; }
  tbody tr:last-child td { border-bottom:0; }
  .small-text { color:#6b7886; font-size:7.7px; }
  .summary-wrapper { margin-top:5mm; }
  .summary { width:78mm; background:#fbfdfc; border:1px solid #eadcdd; border-radius:8px; padding:3mm 4mm; }
  .summary-row { border-bottom:1px solid #e8eeeb; padding:6px 0; color:#536273; }
  .summary-row strong { color:#1b2c3e; }
  .summary-row.total { border-top:2px solid #e31b23; border-bottom:0; color:#e31b23; padding:9px 0 4px; font-size:13px; }
  .summary-row.total strong { color:#e31b23; font-size:14px; }
  .amount-words { margin-top:5mm; border:1px solid #cfe3d7; border-left:4px solid #e31b23; border-radius:6px; padding:3.5mm 4mm; background:#f5fbf7; }
  .amount-words-title { color:#648071; font-size:8px; letter-spacing:.7px; }
  .amount-words-value { color:#20382d; font-size:9px; }
  .bank-and-notes { gap:5mm; margin-top:5mm; }
  .box,.terms { border:1px solid #eadcdd; border-radius:7px; background:#fcfdfc; padding:4mm; }
  .box-title,.terms-title { color:#e31b23; font-size:10px; }
  .bank-row { font-size:8.5px; margin-bottom:1.5mm; }
  .bank-label { color:#6b7886; }
  .bank-value { color:#243548; overflow-wrap:anywhere; }
  .signature-line { border-color:#a9cbb9; color:#243548; }
  .footer { border-top:1px solid #d7e5dd; color:#718076; font-size:7.5px; }
  .notes-section { border-top:1px solid #eadcdd; color:#4d5d6c; }
  @media print { .page { -webkit-print-color-adjust:exact; print-color-adjust:exact; } }


/* GUJRAT SOLAR ENERGY — refined professional print system */
@page { size: A4; margin: 0; }
html, body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
body { color:#172b24; font-family: Arial, Helvetica, sans-serif; font-size:10px; line-height:1.45; }
.page { width:210mm; min-height:297mm; padding:13mm 13mm 17mm; background:#fff; color:#172b24; }
.top-header { align-items:flex-start; border-bottom:0; border-radius:0; padding:0 0 7mm; position:relative; gap:8mm; }
.top-header:after { content:""; display:block; height:3px; position:absolute; bottom:0; left:0; right:0; background:linear-gradient(90deg,#087f4d 0%,#19a768 65%,#d5f4e3 100%); }
.company-section { width:61%; }
.company-logo { max-width:42mm; max-height:22mm; margin-bottom:3mm; }
.company-name { font-size:21px; font-weight:800; letter-spacing:.25px; color:#0b4b34; line-height:1.15; }
.company-address { color:#52665d; font-size:9px; margin-top:4px; max-width:105mm; }
.company-contact { color:#52665d; font-size:8.5px; margin-top:2px; overflow-wrap:anywhere; }
.invoice-heading { width:36%; background:#f0faf4; border:1px solid #d5eee0; border-top:4px solid #07834f; border-radius:12px; padding:5mm; }
.invoice-title { font-size:22px; letter-spacing:1.2px; color:#087f4d; margin-bottom:3mm; }
.invoice-meta { gap:5px 8px; text-align:right; font-size:8.5px; }
.invoice-meta-label { color:#62766b; }
.invoice-meta-value { color:#173126; font-weight:700; overflow-wrap:anywhere; }
.status { border:1px solid #b9e5cd; color:#087f4d; background:#eaf9f0; border-radius:999px; padding:4px 10px; letter-spacing:.4px; }
.parties { gap:5mm; margin-top:6mm; }
.party-card { border:1px solid #dce9e1; border-radius:10px; padding:4mm; background:#fff; break-inside:avoid; }
.party-title { color:#087f4d; border-bottom:1px solid #e2eee7; font-size:9px; letter-spacing:.7px; padding-bottom:2.5mm; margin-bottom:3mm; }
.party-name { font-size:12px; color:#142f23; margin-bottom:2mm; }
.info-row { margin-bottom:1.5mm; gap:4px; }
.info-label { color:#708077; width:30%; font-size:8.5px; }
.info-value { color:#293e33; width:70%; font-size:8.5px; overflow-wrap:anywhere; }
.section { margin-top:6mm; }
.section-title { color:#0b4b34; font-size:11px; letter-spacing:.2px; border-bottom:0; border-left:3px solid #0a965b; padding:1mm 0 1mm 3mm; margin-bottom:3mm; }
table { width:100%; border-collapse:separate; border-spacing:0; }
thead { display:table-header-group; }
th { background:#0b4b34; color:#fff; border:0; border-right:1px solid #28644b; padding:8px 5px; font-size:7.5px; letter-spacing:.25px; text-align:left; }
th:first-child { border-radius:6px 0 0 0; }
th:last-child { border-radius:0 6px 0 0; }
td { border:0; border-bottom:1px solid #e3eee7; padding:7px 5px; vertical-align:top; color:#263d31; font-size:8.5px; overflow-wrap:anywhere; }
tbody tr:nth-child(even) td { background:#f7fbf8; }
tbody tr { break-inside:avoid; }
.small-text { color:#708077; font-size:7.8px; line-height:1.35; }
.empty { text-align:center; padding:12px; color:#708077; }
.summary-wrapper { margin-top:5mm; }
.summary { width:82mm; padding:3mm 4mm; background:#f6fbf8; border:1px solid #dcece2; border-radius:10px; }
.summary-row { border-bottom:1px solid #e2eee7; padding:5px 0; gap:12px; color:#50675a; }
.summary-row strong { color:#173126; text-align:right; }
.summary-row.total { background:#0b4b34; color:#fff; border:0; border-radius:7px; margin:4px -2mm -2mm; padding:10px 2mm; font-size:12px; }
.summary-row.total strong { color:#fff; font-size:14px; }
.amount-words { margin-top:5mm; border:1px solid #dcece2; border-left:3px solid #0a965b; border-radius:8px; padding:3.5mm; background:#fbfefc; }
.amount-words-title { color:#6a7e72; font-size:8px; letter-spacing:.8px; font-weight:700; }
.amount-words-value { color:#173126; font-weight:700; font-size:9px; }
.bank-and-notes { gap:5mm; margin-top:5mm; }
.box { border:1px solid #dce9e1; border-radius:9px; padding:4mm; background:#fff; break-inside:avoid; }
.box-title { color:#087f4d; font-size:9px; letter-spacing:.5px; margin-bottom:3mm; }
.bank-row { margin-bottom:1.5mm; gap:4px; font-size:8px; }
.bank-label { color:#708077; width:38%; }
.bank-value { color:#293e33; width:62%; overflow-wrap:anywhere; }
.terms { margin-top:5mm; border:1px solid #dce9e1; border-radius:9px; padding:4mm; font-size:8px; color:#52665d; break-inside:avoid; }
.terms-title { color:#087f4d; font-size:9px; margin-bottom:2mm; }
.signature-section { margin-top:7mm; }
.signature { width:60mm; color:#52665d; }
.signature-image { max-width:40mm; max-height:17mm; object-fit:contain; }
.signature-line { border-top:1px solid #9fb9aa; margin-top:5mm; padding-top:2mm; color:#173126; }
.footer { color:#6e8177; border-top:1px solid #dce9e1; font-size:7.5px; padding-top:2mm; bottom:5mm; }
@media print { .page { break-after:page; } .page:last-child { break-after:auto; } }

</style>

</head>

<body>

<div class="page">

  <!-- ================================================
       HEADER
  ================================================= -->

  <div class="top-header">

    <div class="company-section">

      ${
        companyLogo
          ? `
            <img
              class="company-logo"
              src="${escapeHtml(
                companyLogo
              )}"
              alt="${escapeHtml(
                companyName
              )}"
            />
            <div class="company-name">
              ${escapeHtml(companyName)}
            </div>
          `
          : `
            <div class="company-name">
              ${escapeHtml(
                companyName
              )}
            </div>
          `
      }

      <div class="company-address">
        ${escapeHtml(
          companyAddress
        )}
      </div>

      ${
        companyPhone
          ? `
            <div class="company-contact">
              Phone: ${escapeHtml(companyPhone)}
            </div>
          `
          : ""
      }

      ${
        companyEmail
          ? `
            <div class="company-contact">
              Email: ${escapeHtml(companyEmail)}
            </div>
          `
          : ""
      }

      ${
        companyWebsite
          ? `
            <div class="company-contact">
              Website: ${escapeHtml(companyWebsite)}
            </div>
          `
          : ""
      }

      ${
        companyGstin
          ? `
            <div class="company-contact">
              GSTIN: ${escapeHtml(companyGstin)}
            </div>
          `
          : ""
      }

      ${
        company.pan
          ? `
            <div class="company-contact">
              PAN:
              ${escapeHtml(
                company.pan
              )}
            </div>
          `
          : ""
      }

    </div>


    <div class="invoice-heading">

      <div class="invoice-title">
        TAX INVOICE
      </div>

      <div class="invoice-meta">

        <div class="invoice-meta-label">
          Invoice No.
        </div>

        <div class="invoice-meta-value">
          ${escapeHtml(
            data.invoiceNumber ||
              invoice.invoiceNumber ||
              ""
          )}
        </div>

        <div class="invoice-meta-label">
          Invoice Date
        </div>

        <div class="invoice-meta-value">
          ${formatDate(
            invoice.invoiceDate ||
              invoice.date ||
              invoice.createdAt
          )}
        </div>

        ${
          invoice.dueDate
            ? `
              <div class="invoice-meta-label">
                Due Date
              </div>

              <div class="invoice-meta-value">
                ${formatDate(
                  invoice.dueDate
                )}
              </div>
            `
            : ""
        }

        ${
          invoice.quotation?.quotationNumber
            ? `
              <div class="invoice-meta-label">
                Quotation
              </div>

              <div class="invoice-meta-value">
                ${escapeHtml(
                  invoice
                    .quotation
                    .quotationNumber
                )}
              </div>
            `
            : ""
        }

      </div>

      ${
        invoice.status
          ? `
            <div class="status">
              ${escapeHtml(
                invoice.status
              )}
            </div>
          `
          : ""
      }

    </div>

  </div>


  <!-- ================================================
       BILL FROM / BILL TO
  ================================================= -->

  <div class="parties">

    <div class="party-card seller-card">

      <div class="party-title">
        Seller / Bill From
      </div>

      <div class="party-name">${escapeHtml(companyName)}</div>
      <div class="info-row"><div class="info-label">Address</div><div class="info-value">${escapeHtml(sellerAddress || companyAddress)}</div></div>
      ${seller.phone || companyPhone ? `<div class="info-row"><div class="info-label">Phone</div><div class="info-value">${escapeHtml(seller.phone || companyPhone)}</div></div>` : ""}
      ${seller.email || companyEmail ? `<div class="info-row"><div class="info-label">Email</div><div class="info-value">${escapeHtml(seller.email || companyEmail)}</div></div>` : ""}
      ${seller.gstin || companyGstin ? `<div class="info-row"><div class="info-label">GSTIN</div><div class="info-value">${escapeHtml(seller.gstin || companyGstin)}</div></div>` : ""}
      ${company.pan ? `<div class="info-row"><div class="info-label">PAN</div><div class="info-value">${escapeHtml(company.pan)}</div></div>` : ""}

    </div>

    <div class="party-card">

      <div class="party-title">
        Buyer / Bill To
      </div>

      <div class="party-name">
        ${escapeHtml(
          customerName
        )}
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
          Address
        </div>

        <div class="info-value">
          ${escapeHtml(
            customerAddress
          )}
        </div>
      </div>

      ${
        customer.mobile ||
        customer.phone
          ? `
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
          `
          : ""
      }

      ${
        customer.email
          ? `
            <div class="info-row">
              <div class="info-label">
                Email
              </div>

              <div class="info-value">
                ${escapeHtml(
                  customer.email
                )}
              </div>
            </div>
          `
          : ""
      }

      ${
        customer.gstin
          ? `
            <div class="info-row">
              <div class="info-label">
                GSTIN
              </div>

              <div class="info-value">
                ${escapeHtml(
                  customer.gstin
                )}
              </div>
            </div>
          `
          : ""
      }

      ${
        customer.pan
          ? `
            <div class="info-row">
              <div class="info-label">
                PAN
              </div>

              <div class="info-value">
                ${escapeHtml(
                  customer.pan
                )}
              </div>
            </div>
          `
          : ""
      }

    </div>

  </div>


  <!-- ================================================
       ITEMS
  ================================================= -->

  <div class="section">

    <div class="section-title">
      Invoice Items
    </div>

    <table>

      <thead>

        <tr>
          <th style="width:5%">
            #
          </th>

          <th style="width:24%">
            Item Description
          </th>

          <th style="width:7%">
            Qty
          </th>

          <th style="width:7%">
            Unit
          </th>

          <th style="width:11%">
            Rate
          </th>

          <th style="width:10%">
            Discount
          </th>

          <th style="width:12%">
            Taxable
          </th>

          <th style="width:8%">
            CGST
          </th>

          <th style="width:8%">
            SGST
          </th>

          <th style="width:13%">
            Amount
          </th>
        </tr>

      </thead>

      <tbody>

        ${renderItems(
          data.items
        )}

      </tbody>

    </table>

  </div>


  <!-- ================================================
       TOTALS
  ================================================= -->

  <div class="summary-wrapper">

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


      <div class="summary-row">

        <span>
          Total Tax
        </span>

        <strong>
          ${formatCurrency(
            totals.totalTax
          )}
        </strong>

      </div>


      <div class="summary-row total">

        <span>
          Total Invoice Value
        </span>

        <strong>
          ${formatCurrency(
            grandTotal
          )}
        </strong>

      </div>

    </div>

  </div>


  <!-- ================================================
       AMOUNT IN WORDS
  ================================================= -->

  <div class="amount-words">

    <div class="amount-words-title">
      Amount in Words
    </div>

    <div class="amount-words-value">
      ${escapeHtml(
        numberToWords(
          grandTotal
        )
      )}
    </div>

  </div>


  ${
    data.notes
      ? `
        <div class="notes-section">
          <div class="notes-title">Notes</div>
          <div>${nl2br(data.notes)}</div>
        </div>
      `
      : ""
  }


  <!-- ================================================
       TERMS
  ================================================= -->

  ${
    data.terms
      ? `
        <div class="terms">

          <div class="terms-title">
            Terms & Conditions
          </div>

          <div>
            ${nl2br(
              data.terms
            )}
          </div>

        </div>
      `
      : ""
  }


  <!-- ================================================
       SIGNATURE
  ================================================= -->

  <div class="signature-section">

    <div class="signature">

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

  </div>


  <!-- ================================================
       FOOTER
  ================================================= -->

  <div class="footer">

    <span>
      ${escapeHtml(
        companyName
      )}
    </span>

    <span>
      ${
        invoiceSettings.footerText
          ? escapeHtml(
              invoiceSettings.footerText
            )
          : "Thank you for your business."
      }
    </span>

    <span>
      Invoice
    </span>

  </div>

</div>

</body>
</html>
`;
};

module.exports =
  invoiceTemplate;