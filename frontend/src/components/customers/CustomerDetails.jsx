"use client";

import React, { useMemo } from "react";
import Button from "../common/Button";
import Badge from "../common/Badge";
import { formatCurrency, formatDate, formatDateTime } from "../../utils/formatters";

const getId = (value) => {
  if (!value) return "";
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  return String(value._id || value.id || "");
};

const getName = (customer) =>
  customer?.name ||
  customer?.customerName ||
  customer?.fullName ||
  "Unnamed Customer";

const getMobile = (customer) =>
  customer?.mobile ||
  customer?.mobileNumber ||
  customer?.phone ||
  customer?.phoneNumber ||
  "—";

const getEmail = (customer) => customer?.email || "—";

const getAddress = (customer) => {
  if (typeof customer?.address === "string") {
    return customer.address;
  }

  if (customer?.address) {
    const address = customer.address;

    return [
      address.line1,
      address.line2,
      address.street,
      address.city,
      address.state,
      address.pincode || address.postalCode,
    ]
      .filter(Boolean)
      .join(", ");
  }

  return [
    customer?.addressLine1,
    customer?.addressLine2,
    customer?.city,
    customer?.state,
    customer?.pincode,
  ]
    .filter(Boolean)
    .join(", ");
};

const getStatusConfig = (status) => {
  const normalized = String(status || "ACTIVE")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");

  const configs = {
    ACTIVE: {
      label: "Active",
      variant: "success",
    },
    INACTIVE: {
      label: "Inactive",
      variant: "default",
    },
    PROSPECT: {
      label: "Prospect",
      variant: "info",
    },
    CONVERTED: {
      label: "Converted",
      variant: "success",
    },
    BLOCKED: {
      label: "Blocked",
      variant: "danger",
    },
  };

  return (
    configs[normalized] || {
      label: status || "Active",
      variant: "default",
    }
  );
};

const getSystemSize = (customer) =>
  customer?.systemSize ??
  customer?.systemCapacity ??
  customer?.capacity ??
  customer?.solarRequirement?.systemSize ??
  customer?.solarRequirement?.requiredCapacity ??
  "";

const getRelationName = (value) => {
  if (!value) return "—";
  if (typeof value === "string") return value;

  return (
    value.name ||
    value.customerName ||
    value.quotationNumber ||
    value.invoiceNumber ||
    value.taskNumber ||
    value.title ||
    value._id ||
    "—"
  );
};

export default function CustomerDetails({
  customer = null,
  quotations = [],
  invoices = [],
  tasks = [],
  loading = false,
  onEdit,
  onBack,
  onQuotationClick,
  onInvoiceClick,
  onTaskClick,
}) {
  const statusConfig = useMemo(
    () =>
      getStatusConfig(
        customer?.status || customer?.customerStatus
      ),
    [customer]
  );

  const customerName = getName(customer);
  const customerId = getId(customer);

  if (loading) {
    return (
      <div className="customer-details-state">
        <div className="customer-details-loader" />
        <p>Loading customer details...</p>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="customer-details-state customer-details-empty">
        <div className="customer-details-empty-icon">👤</div>
        <h3>Customer Not Found</h3>
        <p>The requested customer could not be found.</p>

        {onBack && (
          <Button
            type="button"
            variant="secondary"
            onClick={onBack}
          >
            Back to Customers
          </Button>
        )}
      </div>
    );
  }

  const createdAt =
    customer.createdAt ||
    customer.createdDate ||
    customer.date;

  const updatedAt =
    customer.updatedAt ||
    customer.updatedDate;

  const customerType =
    customer.customerType ||
    customer.type ||
    "RESIDENTIAL";

  const systemSize = getSystemSize(customer);

  const address = getAddress(customer);

  return (
    <div className="customer-details">
      <div className="customer-details-topbar">
        <div className="customer-details-heading">
          {onBack && (
            <button
              type="button"
              className="customer-details-back"
              onClick={onBack}
              aria-label="Back to customers"
            >
              ←
            </button>
          )}

          <div className="customer-details-avatar">
            {customerName.charAt(0).toUpperCase()}
          </div>

          <div>
            <div className="customer-details-title-row">
              <h1>{customerName}</h1>

              <Badge
                variant={statusConfig.variant}
                size="small"
                dot
              >
                {statusConfig.label}
              </Badge>
            </div>

            <p>
              {customer.customerCode
                ? `Customer ID: ${customer.customerCode}`
                : customerId
                  ? `Customer ID: ${customerId}`
                  : "Customer profile"}
            </p>
          </div>
        </div>

        {onEdit && (
          <Button
            type="button"
            variant="primary"
            onClick={() => onEdit(customer)}
          >
            Edit Customer
          </Button>
        )}
      </div>

      <div className="customer-details-grid">
        <section className="customer-details-card customer-details-overview">
          <div className="customer-details-card-header">
            <div>
              <h2>Customer Overview</h2>
              <p>Primary customer and contact information.</p>
            </div>
          </div>

          <div className="customer-details-info-grid">
            <div className="customer-details-info">
              <span>Customer Name</span>
              <strong>{customerName}</strong>
            </div>

            <div className="customer-details-info">
              <span>Mobile Number</span>
              <strong>{getMobile(customer)}</strong>
            </div>

            <div className="customer-details-info">
              <span>Email Address</span>
              <strong>{getEmail(customer)}</strong>
            </div>

            <div className="customer-details-info">
              <span>Customer Type</span>
              <strong>
                {String(customerType)
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (char) => char.toUpperCase())}
              </strong>
            </div>

            <div className="customer-details-info customer-details-info-full">
              <span>Address</span>
              <strong>{address || "—"}</strong>
            </div>
          </div>
        </section>

        <section className="customer-details-card customer-details-system">
          <div className="customer-details-card-header">
            <div>
              <h2>Solar Requirement</h2>
              <p>Current solar system information.</p>
            </div>
          </div>

          <div className="customer-system-highlight">
            <span>Required System Size</span>
            <strong>
              {systemSize !== "" && systemSize !== null
                ? `${systemSize} kW`
                : "Not specified"}
            </strong>
          </div>

          <div className="customer-details-info-grid">
            <div className="customer-details-info">
              <span>Installation Type</span>
              <strong>
                {customer.installationType ||
                  customer.solarRequirement?.installationType ||
                  "—"}
              </strong>
            </div>

            <div className="customer-details-info">
              <span>Connection Type</span>
              <strong>
                {customer.connectionType ||
                  customer.solarRequirement?.connectionType ||
                  "—"}
              </strong>
            </div>
          </div>
        </section>

        <section className="customer-details-card">
          <div className="customer-details-card-header">
            <div>
              <h2>Quotations</h2>
              <p>Quotations associated with this customer.</p>
            </div>

            <span className="customer-details-count">
              {quotations.length}
            </span>
          </div>

          {quotations.length === 0 ? (
            <div className="customer-details-list-empty">
              No quotations found.
            </div>
          ) : (
            <div className="customer-details-list">
              {quotations.map((quotation, index) => (
                <button
                  type="button"
                  className="customer-details-list-item"
                  key={getId(quotation) || `quotation-${index}`}
                  onClick={() =>
                    onQuotationClick &&
                    onQuotationClick(quotation)
                  }
                >
                  <div>
                    <strong>
                      {quotation.quotationNumber ||
                        quotation.quoteNumber ||
                        "Quotation"}
                    </strong>
                    <span>
                      {quotation.createdAt
                        ? formatDate(quotation.createdAt)
                        : "—"}
                    </span>
                  </div>

                  <div className="customer-details-list-value">
                    <strong>
                      {formatCurrency(
                        quotation.grandTotal ??
                          quotation.total ??
                          0
                      )}
                    </strong>
                    <span>
                      {quotation.status || "Draft"}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="customer-details-card">
          <div className="customer-details-card-header">
            <div>
              <h2>Invoices</h2>
              <p>Invoices associated with this customer.</p>
            </div>

            <span className="customer-details-count">
              {invoices.length}
            </span>
          </div>

          {invoices.length === 0 ? (
            <div className="customer-details-list-empty">
              No invoices found.
            </div>
          ) : (
            <div className="customer-details-list">
              {invoices.map((invoice, index) => (
                <button
                  type="button"
                  className="customer-details-list-item"
                  key={getId(invoice) || `invoice-${index}`}
                  onClick={() =>
                    onInvoiceClick &&
                    onInvoiceClick(invoice)
                  }
                >
                  <div>
                    <strong>
                      {invoice.invoiceNumber || "Invoice"}
                    </strong>
                    <span>
                      {invoice.createdAt
                        ? formatDate(invoice.createdAt)
                        : "—"}
                    </span>
                  </div>

                  <div className="customer-details-list-value">
                    <strong>
                      {formatCurrency(
                        invoice.grandTotal ??
                          invoice.total ??
                          0
                      )}
                    </strong>
                    <span>
                      {invoice.status || "Draft"}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="customer-details-card customer-details-tasks">
          <div className="customer-details-card-header">
            <div>
              <h2>Tasks</h2>
              <p>Tasks associated with this customer.</p>
            </div>

            <span className="customer-details-count">
              {tasks.length}
            </span>
          </div>

          {tasks.length === 0 ? (
            <div className="customer-details-list-empty">
              No tasks found.
            </div>
          ) : (
            <div className="customer-details-list">
              {tasks.map((task, index) => (
                <button
                  type="button"
                  className="customer-details-list-item"
                  key={getId(task) || `task-${index}`}
                  onClick={() =>
                    onTaskClick && onTaskClick(task)
                  }
                >
                  <div>
                    <strong>
                      {task.title ||
                        task.taskNumber ||
                        "Task"}
                    </strong>

                    <span>
                      {task.dueDate
                        ? formatDate(task.dueDate)
                        : "No due date"}
                    </span>
                  </div>

                  <div className="customer-details-list-value">
                    <strong>
                      {task.priority || "Normal"}
                    </strong>

                    <span>
                      {task.status || "Pending"}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="customer-details-card">
          <div className="customer-details-card-header">
            <div>
              <h2>Activity Information</h2>
              <p>Customer record timestamps and metadata.</p>
            </div>
          </div>

          <div className="customer-details-info-grid">
            <div className="customer-details-info">
              <span>Created</span>
              <strong>
                {createdAt
                  ? formatDateTime(createdAt)
                  : "—"}
              </strong>
            </div>

            <div className="customer-details-info">
              <span>Last Updated</span>
              <strong>
                {updatedAt
                  ? formatDateTime(updatedAt)
                  : "—"}
              </strong>
            </div>

            <div className="customer-details-info">
              <span>Created By</span>
              <strong>
                {getRelationName(customer.createdBy)}
              </strong>
            </div>

            <div className="customer-details-info">
              <span>Updated By</span>
              <strong>
                {getRelationName(customer.updatedBy)}
              </strong>
            </div>
          </div>
        </section>
      </div>

      {customer.notes && (
        <section className="customer-details-card customer-details-notes">
          <div className="customer-details-card-header">
            <div>
              <h2>Notes</h2>
              <p>Additional information about the customer.</p>
            </div>
          </div>

          <p>{customer.notes}</p>
        </section>
      )}
    </div>
  );
}