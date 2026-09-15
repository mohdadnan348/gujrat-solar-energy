"use client";

import React, { useMemo } from "react";
import { formatCurrency, formatNumber } from "../../utils/formatters";

const getId = (value) => {
  if (!value) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  return String(value._id || value.id || "");
};

const getProductName = (item) => {
  if (!item) return "Unnamed Item";

  if (item.product?.name) return item.product.name;
  if (item.product?.productName) return item.product.productName;
  if (item.productName) return item.productName;
  if (item.name) return item.name;

  return "Unnamed Item";
};

const getDescription = (item) => {
  if (!item) return "";
  return item.description || item.product?.description || "";
};

const getQuantity = (item) => {
  const quantity = Number(item?.quantity);
  return Number.isFinite(quantity) && quantity > 0 ? quantity : 0;
};

const getUnit = (item) => item?.unit || item?.product?.unit || "Unit";

const getUnitPrice = (item) => {
  const price = Number(item?.unitPrice ?? item?.price ?? item?.product?.price);
  return Number.isFinite(price) ? price : 0;
};

const getDiscount = (item) => {
  const discount = Number(item?.discountAmount ?? item?.discount);
  return Number.isFinite(discount) ? discount : 0;
};

const getTax = (item) => {
  const tax = Number(item?.taxAmount ?? item?.tax);
  return Number.isFinite(tax) ? tax : 0;
};

const getItemTotal = (item) => {
  if (item?.total !== undefined && Number.isFinite(Number(item.total))) {
    return Number(item.total);
  }

  const quantity = getQuantity(item);
  const unitPrice = getUnitPrice(item);
  const discount = getDiscount(item);
  const tax = getTax(item);

  return Math.max(quantity * unitPrice - discount + tax, 0);
};

export default function BOMTable({
  items = [],
  title = "Bill of Materials",
  showDescription = true,
  showTax = false,
  showDiscount = true,
  emptyMessage = "No bill of materials available.",
}) {
  const normalizedItems = useMemo(() => {
    if (!Array.isArray(items)) return [];

    return items.map((item, index) => ({
      ...item,
      _key: getId(item) || `bom-item-${index}`,
      _name: getProductName(item),
      _description: getDescription(item),
      _quantity: getQuantity(item),
      _unit: getUnit(item),
      _unitPrice: getUnitPrice(item),
      _discount: getDiscount(item),
      _tax: getTax(item),
      _total: getItemTotal(item),
    }));
  }, [items]);

  const summary = useMemo(() => {
    return normalizedItems.reduce(
      (acc, item) => {
        const baseAmount = item._quantity * item._unitPrice;

        acc.subtotal += baseAmount;
        acc.discount += item._discount;
        acc.tax += item._tax;
        acc.total += item._total;

        return acc;
      },
      {
        subtotal: 0,
        discount: 0,
        tax: 0,
        total: 0,
      }
    );
  }, [normalizedItems]);

  return (
    <section className="bom-table">
      <div className="bom-table-header">
        <div>
          <h3>{title}</h3>
          <p>
            {normalizedItems.length}{" "}
            {normalizedItems.length === 1 ? "item" : "items"}
          </p>
        </div>
      </div>

      {normalizedItems.length === 0 ? (
        <div className="bom-table-empty">
          <div className="bom-table-empty-icon">▦</div>
          <h4>No Items</h4>
          <p>{emptyMessage}</p>
        </div>
      ) : (
        <>
          <div className="bom-table-wrapper">
            <table className="bom-table-grid">
              <thead>
                <tr>
                  <th className="bom-col-number">#</th>
                  <th className="bom-col-item">Item</th>

                  {showDescription && (
                    <th className="bom-col-description">Description</th>
                  )}

                  <th className="bom-col-quantity">Quantity</th>
                  <th className="bom-col-price">Unit Price</th>

                  {showDiscount && (
                    <th className="bom-col-discount">Discount</th>
                  )}

                  {showTax && <th className="bom-col-tax">Tax</th>}

                  <th className="bom-col-total">Total</th>
                </tr>
              </thead>

              <tbody>
                {normalizedItems.map((item, index) => (
                  <tr key={item._key}>
                    <td className="bom-col-number">
                      {String(index + 1).padStart(2, "0")}
                    </td>

                    <td className="bom-col-item">
                      <div className="bom-item-name">{item._name}</div>
                    </td>

                    {showDescription && (
                      <td className="bom-col-description">
                        {item._description || "—"}
                      </td>
                    )}

                    <td className="bom-col-quantity">
                      <span className="bom-quantity">
                        {formatNumber(item._quantity)}
                      </span>
                      <span className="bom-unit">{item._unit}</span>
                    </td>

                    <td className="bom-col-price">
                      {formatCurrency(item._unitPrice)}
                    </td>

                    {showDiscount && (
                      <td className="bom-col-discount">
                        {item._discount > 0
                          ? formatCurrency(item._discount)
                          : "—"}
                      </td>
                    )}

                    {showTax && (
                      <td className="bom-col-tax">
                        {item._tax > 0 ? formatCurrency(item._tax) : "—"}
                      </td>
                    )}

                    <td className="bom-col-total">
                      <strong>{formatCurrency(item._total)}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bom-table-summary">
            <div className="bom-summary-row">
              <span>Subtotal</span>
              <strong>{formatCurrency(summary.subtotal)}</strong>
            </div>

            {showDiscount && summary.discount > 0 && (
              <div className="bom-summary-row bom-summary-discount">
                <span>Discount</span>
                <strong>- {formatCurrency(summary.discount)}</strong>
              </div>
            )}

            {showTax && summary.tax > 0 && (
              <div className="bom-summary-row">
                <span>Tax</span>
                <strong>{formatCurrency(summary.tax)}</strong>
              </div>
            )}

            <div className="bom-summary-row bom-summary-total">
              <span>Total</span>
              <strong>{formatCurrency(summary.total)}</strong>
            </div>
          </div>
        </>
      )}
    </section>
  );
}