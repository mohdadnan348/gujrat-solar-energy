"use client";

import React, { useMemo } from "react";
import { formatCurrency, formatDate, formatNumber } from "../../utils/formatters";

const COMPANY = {
  name: "GUJRAT SOLAR ENERGY",
  gstin: "09GBQPS0127B1ZL",
  address:
    "83/161-3 PARAMPURWA, JUHI, Kanpur, Kanpur Nagar, UTTAR PRADESH, 208014",
  mobile: "+91 8545909039",
  email: "gujratsolar14@gmail.com",
  website: "www.gujratsolarenergy.com",
};

const getId = (value) => {
  if (!value) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  return String(value._id || value.id || "");
};

const getCustomerName = (quotation) => {
  const customer = quotation?.customer;

  return (
    customer?.name ||
    customer?.customerName ||
    quotation?.customerName ||
    quotation?.lead?.customerName ||
    "Customer"
  );
};

const getCustomerField = (quotation, field) => {
  const customer = quotation?.customer || {};

  return (
    customer[field] ||
    quotation?.[`customer${field.charAt(0).toUpperCase()}${field.slice(1)}`] ||
    quotation?.lead?.[field] ||
    ""
  );
};

const getItemName = (item) =>
  item?.product?.name ||
  item?.product?.productName ||
  item?.productName ||
  item?.name ||
  "Solar Product";

const getItemUnit = (item) =>
  item?.unit || item?.product?.unit || "Unit";

const getItemQuantity = (item) => {
  const value = Number(item?.quantity);
  return Number.isFinite(value) ? value : 0;
};

const getItemPrice = (item) => {
  const value = Number(
    item?.unitPrice ?? item?.price ?? item?.product?.price
  );

  return Number.isFinite(value) ? value : 0;
};

const getItemDiscount = (item) => {
  const value = Number(item?.discountAmount ?? item?.discount);
  return Number.isFinite(value) ? value : 0;
};

const getItemTax = (item) => {
  const value = Number(item?.taxAmount ?? item?.tax);
  return Number.isFinite(value) ? value : 0;
};

const getItemTotal = (item) => {
  if (item?.total !== undefined && Number.isFinite(Number(item.total))) {
    return Number(item.total);
  }

  return Math.max(
    getItemQuantity(item) * getItemPrice(item) -
      getItemDiscount(item) +
      getItemTax(item),
    0
  );
};

export default function ProposalPreview({
  quotation = {},
  items = quotation?.items || [],
  company = COMPANY,
  title = "PROPOSAL",
}) {
  const normalizedItems = useMemo(() => {
    return (Array.isArray(items) ? items : []).map((item, index) => ({
      ...item,
      _key: getId(item) || `proposal-item-${index}`,
      _name: getItemName(item),
      _unit: getItemUnit(item),
      _quantity: getItemQuantity(item),
      _price: getItemPrice(item),
      _discount: getItemDiscount(item),
      _tax: getItemTax(item),
      _total: getItemTotal(item),
    }));
  }, [items]);

  const totals = useMemo(() => {
    const calculated = normalizedItems.reduce(
      (result, item) => {
        result.subtotal += item._quantity * item._price;
        result.discount += item._discount;
        result.tax += item._tax;
        result.total += item._total;

        return result;
      },
      {
        subtotal: 0,
        discount: 0,
        tax: 0,
        total: 0,
      }
    );

    return {
      subtotal:
        quotation.subtotal !== undefined
          ? Number(quotation.subtotal) || 0
          : calculated.subtotal,
      discount:
        quotation.discountAmount !== undefined
          ? Number(quotation.discountAmount) || 0
          : calculated.discount,
      tax:
        quotation.taxAmount !== undefined
          ? Number(quotation.taxAmount) || 0
          : calculated.tax,
      total:
        quotation.grandTotal !== undefined
          ? Number(quotation.grandTotal) || 0
          : quotation.total !== undefined
            ? Number(quotation.total) || 0
            : calculated.total,
    };
  }, [quotation, normalizedItems]);

  const quotationNumber =
    quotation.quotationNumber ||
    quotation.quoteNumber ||
    quotation.estimateId ||
    quotation.estimateNumber ||
    "DRAFT";

  const quotationDate =
    quotation.quotationDate ||
    quotation.date ||
    quotation.createdAt ||
    new Date();

  const customerAddress =
    getCustomerField(quotation, "address") ||
    getCustomerField(quotation, "city") ||
    "—";

  const customerMobile =
    getCustomerField(quotation, "mobile") ||
    getCustomerField(quotation, "phone") ||
    getCustomerField(quotation, "mobileNumber") ||
    "—";

  const customerEmail =
    getCustomerField(quotation, "email") || "—";

  const paymentTerms =
    quotation.paymentTerms ||
    "Payment terms as mentioned in the quotation.";

  return (
    <div className="proposal-preview">
      <div className="proposal-preview-toolbar">
        <div>
          <span className="proposal-preview-label">Document Preview</span>
          <strong>{quotationNumber}</strong>
        </div>
      </div>

      <article className="proposal-document">
        <header className="proposal-company-header">
          <div className="proposal-brand">
            <div className="proposal-logo">
              GS
            </div>

            <div>
              <h1>{company.name}</h1>
              <p>Solar Energy Solutions</p>
            </div>
          </div>

          <div className="proposal-company-contact">
            <div>{company.address}</div>
            <div>GSTIN: {company.gstin}</div>
            <div>Mobile: {company.mobile}</div>
            <div>Email: {company.email}</div>
            <div>{company.website}</div>
          </div>
        </header>

        <div className="proposal-title">
          <h2>{title}</h2>
          <div className="proposal-title-meta">
            <span>
              Proposal No.: <strong>{quotationNumber}</strong>
            </span>
            <span>
              Date: <strong>{formatDate(quotationDate)}</strong>
            </span>
          </div>
        </div>

        <section className="proposal-customer-section">
          <div className="proposal-section-heading">
            Customer Details
          </div>

          <div className="proposal-customer-grid">
            <div>
              <span>Customer Name</span>
              <strong>{getCustomerName(quotation)}</strong>
            </div>

            <div>
              <span>Mobile Number</span>
              <strong>{customerMobile}</strong>
            </div>

            <div>
              <span>Email Address</span>
              <strong>{customerEmail}</strong>
            </div>

            <div>
              <span>Address</span>
              <strong>{customerAddress}</strong>
            </div>
          </div>
        </section>

        <section className="proposal-items-section">
          <div className="proposal-section-heading">
            Solar System & Materials
          </div>

          {normalizedItems.length > 0 ? (
            <div className="proposal-items-table-wrapper">
              <table className="proposal-items-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Item Description</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Amount</th>
                  </tr>
                </thead>

                <tbody>
                  {normalizedItems.map((item, index) => (
                    <tr key={item._key}>
                      <td>{String(index + 1).padStart(2, "0")}</td>
                      <td>
                        <strong>{item._name}</strong>
                        {item.description && (
                          <small>{item.description}</small>
                        )}
                      </td>
                      <td>
                        {formatNumber(item._quantity)} {item._unit}
                      </td>
                      <td>{formatCurrency(item._price)}</td>
                      <td>
                        <strong>{formatCurrency(item._total)}</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="proposal-empty-items">
              No quotation items available.
            </div>
          )}
        </section>

        <section className="proposal-summary-section">
          <div className="proposal-summary">
            <div className="proposal-summary-row">
              <span>Subtotal</span>
              <strong>{formatCurrency(totals.subtotal)}</strong>
            </div>

            {totals.discount > 0 && (
              <div className="proposal-summary-row">
                <span>Discount</span>
                <strong>
                  - {formatCurrency(totals.discount)}
                </strong>
              </div>
            )}

            {totals.tax > 0 && (
              <div className="proposal-summary-row">
                <span>Tax</span>
                <strong>{formatCurrency(totals.tax)}</strong>
              </div>
            )}

            <div className="proposal-summary-grand-total">
              <span>Grand Total</span>
              <strong>{formatCurrency(totals.total)}</strong>
            </div>
          </div>
        </section>

        <section className="proposal-terms-section">
          <div className="proposal-section-heading">
            Payment Terms
          </div>

          <p>{paymentTerms}</p>
        </section>

        {quotation.notes && (
          <section className="proposal-notes-section">
            <div className="proposal-section-heading">
              Notes
            </div>

            <p>{quotation.notes}</p>
          </section>
        )}

        <footer className="proposal-footer">
          <div>
            <strong>GUJRAT SOLAR ENERGY</strong>
            <span>Solar Energy Solutions</span>
          </div>

          <div className="proposal-signature">
            <span>Authorized Signatory</span>
          </div>
        </footer>
      </article>
    </div>
  );
}