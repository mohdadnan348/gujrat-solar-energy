"use client";

import React, { useMemo } from "react";
import Button from "../common/Button";
import Badge from "../common/Badge";
import { formatCurrency, formatDate } from "../../utils/formatters";

const getId = (value) => {
  if (!value) return "";
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  return String(value._id || value.id || "");
};

const getCustomerName = (invoice) =>
  invoice?.customer?.name ||
  invoice?.customer?.customerName ||
  invoice?.customerName ||
  "Unnamed Customer";

const getInvoiceNumber = (invoice) =>
  invoice?.invoiceNumber ||
  invoice?.invoiceNo ||
  invoice?.number ||
  "Draft";

const getMobile = (invoice) =>
  invoice?.customer?.mobile ||
  invoice?.customer?.mobileNumber ||
  invoice?.mobile ||
  invoice?.mobileNumber ||
  "—";

const getTotal = (invoice) => {
  const value =
    invoice?.grandTotal ??
    invoice?.totalAmount ??
    invoice?.total ??
    0;

  return Number.isFinite(Number(value)) ? Number(value) : 0;
};

const getStatusConfig = (status) => {
  const normalized = String(status || "DRAFT")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");

  const configs = {
    DRAFT: {
      label: "Draft",
      variant: "default",
    },
    ISSUED: {
      label: "Issued",
      variant: "info",
    },
    SENT: {
      label: "Sent",
      variant: "info",
    },
    CANCELLED: {
      label: "Cancelled",
      variant: "danger",
    },
    OVERDUE: {
      label: "Overdue",
      variant: "warning",
    },
  };

  return (
    configs[normalized] || {
      label: status || "Draft",
      variant: "default",
    }
  );
};

export default function InvoiceTable({
  invoices = [],
  loading = false,
  onView,
  onEdit,
  onDelete,
  onRowClick,
  selectedIds = [],
  onSelectionChange,
  showSelection = false,
  emptyMessage = "No invoices found.",
}) {
  const invoiceList = useMemo(
    () => (Array.isArray(invoices) ? invoices : []),
    [invoices]
  );

  const selectedSet = useMemo(
    () => new Set(selectedIds.map((id) => String(id))),
    [selectedIds]
  );

  const allSelected =
    invoiceList.length > 0 &&
    invoiceList.every((invoice) =>
      selectedSet.has(getId(invoice))
    );

  const handleSelectAll = (event) => {
    if (!onSelectionChange) return;

    if (event.target.checked) {
      onSelectionChange(
        invoiceList.map(getId).filter(Boolean)
      );
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelect = (invoice) => {
    if (!onSelectionChange) return;

    const id = getId(invoice);

    if (!id) return;

    if (selectedSet.has(id)) {
      onSelectionChange(
        selectedIds.filter(
          (selectedId) => String(selectedId) !== id
        )
      );
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  if (loading) {
    return (
      <div className="invoice-table-state">
        <div className="invoice-table-loader" />
        <p>Loading invoices...</p>
      </div>
    );
  }

  if (invoiceList.length === 0) {
    return (
      <div className="invoice-table-state invoice-table-empty">
        <div className="invoice-table-empty-icon">▤</div>
        <h3>No Invoices Found</h3>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="invoice-table-container">
      <div className="invoice-table-wrapper">
        <table className="invoice-table">
          <thead>
            <tr>
              {showSelection && (
                <th className="invoice-selection-column">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={handleSelectAll}
                    aria-label="Select all invoices"
                  />
                </th>
              )}

              <th className="invoice-number-index">#</th>
              <th>Invoice Number</th>
              <th>Customer</th>
              <th>Mobile</th>
              <th>Invoice Date</th>
              <th>Total</th>
              <th>Status</th>
              <th className="invoice-actions-column">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {invoiceList.map((invoice, index) => {
              const id = getId(invoice);
              const invoiceNumber = getInvoiceNumber(invoice);
              const customerName = getCustomerName(invoice);
              const mobile = getMobile(invoice);
              const total = getTotal(invoice);
              const statusConfig = getStatusConfig(
                invoice?.status
              );

              const invoiceDate =
                invoice?.invoiceDate ||
                invoice?.date ||
                invoice?.createdAt;

              return (
                <tr
                  key={id || `invoice-${index}`}
                  className={
                    onRowClick
                      ? "invoice-table-row-clickable"
                      : ""
                  }
                  onClick={() =>
                    onRowClick && onRowClick(invoice)
                  }
                >
                  {showSelection && (
                    <td
                      className="invoice-selection-column"
                      onClick={(event) =>
                        event.stopPropagation()
                      }
                    >
                      <input
                        type="checkbox"
                        checked={selectedSet.has(id)}
                        onChange={() =>
                          handleSelect(invoice)
                        }
                        aria-label={`Select ${invoiceNumber}`}
                      />
                    </td>
                  )}

                  <td className="invoice-number-index">
                    {String(index + 1).padStart(3, "0")}
                  </td>

                  <td>
                    <div className="invoice-number">
                      <strong>{invoiceNumber}</strong>

                      {invoice?.invoiceType && (
                        <span>
                          {String(invoice.invoiceType)
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (char) =>
                              char.toUpperCase()
                            )}
                        </span>
                      )}
                    </div>
                  </td>

                  <td>
                    <div className="invoice-customer">
                      <div className="invoice-customer-avatar">
                        {customerName
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <strong>{customerName}</strong>
                    </div>
                  </td>

                  <td>
                    <span className="invoice-mobile">
                      {mobile}
                    </span>
                  </td>

                  <td>
                    <span className="invoice-date">
                      {invoiceDate
                        ? formatDate(invoiceDate)
                        : "—"}
                    </span>
                  </td>

                  <td>
                    <strong className="invoice-total">
                      {formatCurrency(total)}
                    </strong>
                  </td>

                  <td>
                    <Badge
                      variant={statusConfig.variant}
                      size="small"
                      dot
                    >
                      {statusConfig.label}
                    </Badge>
                  </td>

                  <td
                    className="invoice-actions"
                    onClick={(event) =>
                      event.stopPropagation()
                    }
                  >
                    {onView && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="small"
                        onClick={() => onView(invoice)}
                        title="View invoice"
                      >
                        View
                      </Button>
                    )}

                    {onEdit && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="small"
                        onClick={() => onEdit(invoice)}
                        title="Edit invoice"
                      >
                        Edit
                      </Button>
                    )}

                    {onDelete && (
                      <Button
                        type="button"
                        variant="danger"
                        size="small"
                        onClick={() => onDelete(invoice)}
                        title="Delete invoice"
                      >
                        Delete
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="invoice-table-footer">
        <span>
          Showing {invoiceList.length}{" "}
          {invoiceList.length === 1 ? "invoice" : "invoices"}
        </span>

        {selectedIds.length > 0 && (
          <span className="invoice-selected-count">
            {selectedIds.length} selected
          </span>
        )}
      </div>
    </div>
  );
}