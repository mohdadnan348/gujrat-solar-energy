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
              item.discount
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

  const companyAddress = [
    company.address,
    company.city,
    company.state,
    company.pincode,
  ]
    .filter(Boolean)
    .join(", ");

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
    max-width: 55mm;
    max-height: 22mm;
    object-fit: contain;
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
        company.logo
          ? `
            <img
              class="company-logo"
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

      <div class="company-address">
        ${escapeHtml(
          companyAddress
        )}
      </div>

      ${
        company.phone
          ? `
            <div class="company-contact">
              Phone:
              ${escapeHtml(
                company.phone
              )}
            </div>
          `
          : ""
      }

      ${
        company.email
          ? `
            <div class="company-contact">
              Email:
              ${escapeHtml(
                company.email
              )}
            </div>
          `
          : ""
      }

      ${
        company.website
          ? `
            <div class="company-contact">
              Website:
              ${escapeHtml(
                company.website
              )}
            </div>
          `
          : ""
      }

      ${
        company.gstin
          ? `
            <div class="company-contact">
              GSTIN:
              ${escapeHtml(
                company.gstin
              )}
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

    <div class="party-card">

      <div class="party-title">
        Seller / Bill From
      </div>

      <div class="party-name">
        ${escapeHtml(
          seller.name ||
            seller.companyName ||
            companyName
        )}
      </div>

      <div class="info-row">
        <div class="info-label">
          Address
        </div>

        <div class="info-value">
          ${escapeHtml(
            sellerAddress ||
              companyAddress
          )}
        </div>
      </div>

      ${
        seller.gstin ||
        company.gstin
          ? `
            <div class="info-row">
              <div class="info-label">
                GSTIN
              </div>

              <div class="info-value">
                ${escapeHtml(
                  seller.gstin ||
                    company.gstin ||
                    ""
                )}
              </div>
            </div>
          `
          : ""
      }

      ${
        seller.pan ||
        company.pan
          ? `
            <div class="info-row">
              <div class="info-label">
                PAN
              </div>

              <div class="info-value">
                ${escapeHtml(
                  seller.pan ||
                    company.pan ||
                    ""
                )}
              </div>
            </div>
          `
          : ""
      }

      ${
        seller.phone ||
        company.phone
          ? `
            <div class="info-row">
              <div class="info-label">
                Phone
              </div>

              <div class="info-value">
                ${escapeHtml(
                  seller.phone ||
                    company.phone ||
                    ""
                )}
              </div>
            </div>
          `
          : ""
      }

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


  <!-- ================================================
       BANK + NOTES
  ================================================= -->

  <div class="bank-and-notes">

    <div class="box">

      <div class="box-title">
        Bank Details
      </div>

      <div class="bank-row">
        <div class="bank-label">
          Bank Name
        </div>

        <div class="bank-value">
          ${escapeHtml(
            bankDetails.bankName ||
              ""
          )}
        </div>
      </div>

      <div class="bank-row">
        <div class="bank-label">
          Account Name
        </div>

        <div class="bank-value">
          ${escapeHtml(
            bankDetails.accountName ||
              companyName
          )}
        </div>
      </div>

      <div class="bank-row">
        <div class="bank-label">
          Account Number
        </div>

        <div class="bank-value">
          ${escapeHtml(
            bankDetails.accountNumber ||
              ""
          )}
        </div>
      </div>

      <div class="bank-row">
        <div class="bank-label">
          IFSC
        </div>

        <div class="bank-value">
          ${escapeHtml(
            bankDetails.ifscCode ||
              ""
          )}
        </div>
      </div>

      <div class="bank-row">
        <div class="bank-label">
          Branch
        </div>

        <div class="bank-value">
          ${escapeHtml(
            bankDetails.branchName ||
              ""
          )}
        </div>
      </div>

      ${
        bankDetails.upiId
          ? `
            <div class="bank-row">
              <div class="bank-label">
                UPI ID
              </div>

              <div class="bank-value">
                ${escapeHtml(
                  bankDetails.upiId
                )}
              </div>
            </div>
          `
          : ""
      }

    </div>


    <div class="box">

      <div class="box-title">
        Notes
      </div>

      ${
        data.notes
          ? `
            <div>
              ${nl2br(
                data.notes
              )}
            </div>
          `
          : `
            <div class="small-text">
              This is a computer-generated
              tax invoice.
            </div>
          `
      }

    </div>

  </div>


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