"use client";

import React from "react";
import "./InvoicePreview.css";

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const InvoicePreview = ({ invoice = {} }) => {
  const customer = invoice.customer || {};
  const items = invoice.items || [];

  const subtotal =
    invoice.subtotal ??
    items.reduce(
      (total, item) => total + Number(item.amount || 0),
      0
    );

  const discount = Number(invoice.discount || 0);
  const tax = Number(invoice.tax || invoice.gstAmount || 0);
  const shipping = Number(invoice.shipping || 0);

  const total =
    invoice.total ??
    invoice.grandTotal ??
    subtotal - discount + tax + shipping;

  return (
    <div className="invoice-preview">
      <div className="invoice-preview__toolbar">
        <div>
          <h2>Invoice Preview</h2>
          <p>Review the invoice before generating the final document.</p>
        </div>

        <span className="invoice-preview__status">
          {invoice.status || "Draft"}
        </span>
      </div>

      <div className="invoice-preview__document">
        <header className="invoice-preview__header">
          <div className="invoice-preview__company">
            <div className="invoice-preview__logo">
              {invoice.company?.logo ? (
                <img
                  src={invoice.company.logo}
                  alt="Company logo"
                />
              ) : (
                <span>GSE</span>
              )}
            </div>

            <div>
              <h1>
                {invoice.company?.name || "GUJRAT SOLAR ENERGY"}
              </h1>

              <p>
                {invoice.company?.address ||
                  "83/161-3 PARAMPURWA, JUHI, Kanpur, Kanpur Nagar, UTTAR PRADESH, 208014"}
              </p>

              <p>
                {invoice.company?.phone || "+91 8545909039"}
                {" · "}
                {invoice.company?.email || "gujratsolar14@gmail.com"}
              </p>

              <p>
                GSTIN:{" "}
                {invoice.company?.gstin || "09GBQPS0127B1ZL"}
              </p>
            </div>
          </div>

          <div className="invoice-preview__heading">
            <span>INVOICE</span>
            <strong>
              {invoice.invoiceNumber || invoice.invoiceNo || "INV-DRAFT"}
            </strong>
          </div>
        </header>

        <div className="invoice-preview__divider" />

        <section className="invoice-preview__meta">
          <div className="invoice-preview__customer">
            <span className="invoice-preview__label">BILL TO</span>

            <h3>
              {customer.name ||
                invoice.customerName ||
                "Customer Name"}
            </h3>

            {(customer.address || invoice.customerAddress) && (
              <p>
                {customer.address || invoice.customerAddress}
              </p>
            )}

            {(customer.city || invoice.customerCity) && (
              <p>
                {customer.city || invoice.customerCity}
                {customer.state ? `, ${customer.state}` : ""}
              </p>
            )}

            {(customer.phone || invoice.customerPhone) && (
              <p>
                Phone:{" "}
                {customer.phone || invoice.customerPhone}
              </p>
            )}

            {(customer.email || invoice.customerEmail) && (
              <p>
                Email:{" "}
                {customer.email || invoice.customerEmail}
              </p>
            )}

            {(customer.gstin || invoice.customerGstin) && (
              <p>
                GSTIN:{" "}
                {customer.gstin || invoice.customerGstin}
              </p>
            )}
          </div>

          <div className="invoice-preview__details">
            <div>
              <span>Invoice Date</span>
              <strong>{formatDate(invoice.invoiceDate || invoice.date)}</strong>
            </div>

            {invoice.dueDate && (
              <div>
                <span>Due Date</span>
                <strong>{formatDate(invoice.dueDate)}</strong>
              </div>
            )}

            {invoice.quotationNumber && (
              <div>
                <span>Quotation</span>
                <strong>{invoice.quotationNumber}</strong>
              </div>
            )}

            {invoice.placeOfSupply && (
              <div>
                <span>Place of Supply</span>
                <strong>{invoice.placeOfSupply}</strong>
              </div>
            )}
          </div>
        </section>

        <section className="invoice-preview__items">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Description</th>
                <th>Qty</th>
                <th>Unit</th>
                <th>Rate</th>
                <th>Amount</th>
              </tr>
            </thead>

            <tbody>
              {items.length > 0 ? (
                items.map((item, index) => (
                  <tr key={item._id || item.id || index}>
                    <td>{index + 1}</td>
                    <td>
                      <strong>
                        {item.description ||
                          item.name ||
                          "Solar Product / Service"}
                      </strong>

                      {item.details && (
                        <small>{item.details}</small>
                      )}
                    </td>
                    <td>{item.quantity ?? 0}</td>
                    <td>{item.unit || "—"}</td>
                    <td>{formatCurrency(item.rate)}</td>
                    <td>{formatCurrency(item.amount)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="invoice-preview__empty">
                    No invoice items available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        <section className="invoice-preview__summary">
          <div className="invoice-preview__notes">
            {invoice.notes && (
              <>
                <span className="invoice-preview__label">NOTES</span>
                <p>{invoice.notes}</p>
              </>
            )}

            {invoice.terms && (
              <>
                <span className="invoice-preview__label">
                  TERMS & CONDITIONS
                </span>
                <p>{invoice.terms}</p>
              </>
            )}
          </div>

          <div className="invoice-preview__totals">
            <div>
              <span>Subtotal</span>
              <strong>{formatCurrency(subtotal)}</strong>
            </div>

            {discount > 0 && (
              <div>
                <span>Discount</span>
                <strong>- {formatCurrency(discount)}</strong>
              </div>
            )}

            {tax > 0 && (
              <div>
                <span>Tax</span>
                <strong>{formatCurrency(tax)}</strong>
              </div>
            )}

            {shipping > 0 && (
              <div>
                <span>Shipping</span>
                <strong>{formatCurrency(shipping)}</strong>
              </div>
            )}

            <div className="invoice-preview__grand-total">
              <span>Total</span>
              <strong>{formatCurrency(total)}</strong>
            </div>
          </div>
        </section>

        <footer className="invoice-preview__footer">
          <div>
            <span>Thank you for your business.</span>

            {invoice.company?.website && (
              <small>{invoice.company.website}</small>
            )}
          </div>

          {invoice.authorizedSignatory && (
            <div className="invoice-preview__signature">
              <div className="invoice-preview__signature-space" />
              <strong>{invoice.authorizedSignatory}</strong>
              <span>Authorized Signatory</span>
            </div>
          )}
        </footer>
      </div>
    </div>
  );
};

export default InvoicePreview;