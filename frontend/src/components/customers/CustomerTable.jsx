"use client";

import React, { useMemo } from "react";
import Button from "../common/Button";
import Badge from "../common/Badge";
import {
  formatDate,
  formatDateTime,
  formatCurrency,
} from "../../utils/formatters";

const getId = (value) => {
  if (!value) return "";
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  return String(value._id || value.id || "");
};

const getCustomerName = (customer) =>
  customer?.name ||
  customer?.customerName ||
  customer?.fullName ||
  "Unnamed Customer";

const getCustomerPhone = (customer) =>
  customer?.mobile ||
  customer?.mobileNumber ||
  customer?.phone ||
  customer?.phoneNumber ||
  "—";

const getCustomerEmail = (customer) =>
  customer?.email || "—";

const getCustomerCity = (customer) =>
  customer?.city ||
  customer?.address?.city ||
  "—";

const getCustomerStatus = (customer) => {
  const status = customer?.status || customer?.customerStatus;

  if (!status) return "ACTIVE";

  return String(status)
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");
};

const getStatusConfig = (status) => {
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
    configs[status] || {
      label: status || "Unknown",
      variant: "default",
    }
  );
};

export default function CustomerTable({
  customers = [],
  loading = false,
  onView,
  onEdit,
  onDelete,
  onRowClick,
  selectedIds = [],
  onSelectionChange,
  showSelection = false,
  emptyMessage = "No customers found.",
}) {
  const customerList = useMemo(
    () => (Array.isArray(customers) ? customers : []),
    [customers]
  );

  const selectedSet = useMemo(
    () => new Set(selectedIds.map((id) => String(id))),
    [selectedIds]
  );

  const allSelected =
    customerList.length > 0 &&
    customerList.every((customer) =>
      selectedSet.has(getId(customer))
    );

  const handleSelectAll = (event) => {
    if (!onSelectionChange) return;

    if (event.target.checked) {
      onSelectionChange(customerList.map(getId).filter(Boolean));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelect = (customer) => {
    if (!onSelectionChange) return;

    const id = getId(customer);

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
      <div className="customer-table-state">
        <div className="customer-table-loader" />
        <p>Loading customers...</p>
      </div>
    );
  }

  if (customerList.length === 0) {
    return (
      <div className="customer-table-state customer-table-empty">
        <div className="customer-table-empty-icon">👥</div>
        <h3>No Customers Found</h3>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="customer-table-container">
      <div className="customer-table-wrapper">
        <table className="customer-table">
          <thead>
            <tr>
              {showSelection && (
                <th className="customer-selection-column">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={handleSelectAll}
                    aria-label="Select all customers"
                  />
                </th>
              )}

              <th className="customer-number-column">#</th>
              <th>Customer</th>
              <th>Contact</th>
              <th>Location</th>
              <th>System Size</th>
              <th>Status</th>
              <th>Created</th>
              <th className="customer-actions-column">Actions</th>
            </tr>
          </thead>

          <tbody>
            {customerList.map((customer, index) => {
              const id = getId(customer);
              const name = getCustomerName(customer);
              const phone = getCustomerPhone(customer);
              const email = getCustomerEmail(customer);
              const city = getCustomerCity(customer);
              const status = getCustomerStatus(customer);
              const statusConfig = getStatusConfig(status);

              const systemSize =
                customer?.systemSize ??
                customer?.systemCapacity ??
                customer?.capacity ??
                customer?.solarRequirement?.systemSize ??
                customer?.solarRequirement?.requiredCapacity;

              const createdDate =
                customer?.createdAt ||
                customer?.createdDate ||
                customer?.date;

              return (
                <tr
                  key={id || `customer-${index}`}
                  className={
                    onRowClick
                      ? "customer-table-row-clickable"
                      : ""
                  }
                  onClick={() =>
                    onRowClick && onRowClick(customer)
                  }
                >
                  {showSelection && (
                    <td
                      className="customer-selection-column"
                      onClick={(event) =>
                        event.stopPropagation()
                      }
                    >
                      <input
                        type="checkbox"
                        checked={selectedSet.has(id)}
                        onChange={() =>
                          handleSelect(customer)
                        }
                        aria-label={`Select ${name}`}
                      />
                    </td>
                  )}

                  <td className="customer-number-column">
                    {String(index + 1).padStart(3, "0")}
                  </td>

                  <td>
                    <div className="customer-primary">
                      <div className="customer-avatar">
                        {name.charAt(0).toUpperCase()}
                      </div>

                      <div className="customer-name-wrapper">
                        <strong>{name}</strong>

                        {customer?.customerCode && (
                          <span>
                            {customer.customerCode}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  <td>
                    <div className="customer-contact">
                      <strong>{phone}</strong>

                      {email !== "—" && (
                        <span>{email}</span>
                      )}
                    </div>
                  </td>

                  <td>
                    <span className="customer-city">
                      {city}
                    </span>
                  </td>

                  <td>
                    {systemSize !== undefined &&
                    systemSize !== null &&
                    systemSize !== "" ? (
                      <span className="customer-system-size">
                        {systemSize} kW
                      </span>
                    ) : (
                      "—"
                    )}
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

                  <td>
                    <span className="customer-created-date">
                      {createdDate
                        ? formatDate(createdDate)
                        : "—"}
                    </span>
                  </td>

                  <td
                    className="customer-actions"
                    onClick={(event) =>
                      event.stopPropagation()
                    }
                  >
                    {onView && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="small"
                        onClick={() => onView(customer)}
                        title="View customer"
                      >
                        View
                      </Button>
                    )}

                    {onEdit && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="small"
                        onClick={() => onEdit(customer)}
                        title="Edit customer"
                      >
                        Edit
                      </Button>
                    )}

                    {onDelete && (
                      <Button
                        type="button"
                        variant="danger"
                        size="small"
                        onClick={() => onDelete(customer)}
                        title="Delete customer"
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

      <div className="customer-table-footer">
        <span>
          Showing {customerList.length}{" "}
          {customerList.length === 1 ? "customer" : "customers"}
        </span>

        {selectedIds.length > 0 && (
          <span className="customer-selected-count">
            {selectedIds.length} selected
          </span>
        )}
      </div>
    </div>
  );
}