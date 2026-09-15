"use client";

import React from "react";
import {
  SYSTEM_TYPE_LABELS,
  BATTERY_REQUIREMENT_LABELS,
  CONNECTION_TYPE_LABELS,
} from "@/utils/constants";

const getId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value?._id || value?.id || "";
};

const getDisplayValue = (value, labels = {}) => {
  if (!value && value !== 0) return "—";

  if (
    typeof value === "string" &&
    labels &&
    labels[value]
  ) {
    return labels[value];
  }

  return String(value);
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatCurrency = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "—";
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return String(value);
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(number);
};

const RequirementDetails = ({
  requirement,
  loading = false,
  error = "",
  onEdit,
  onDelete,
}) => {
  if (loading) {
    return (
      <div className="requirement-details-state">
        <div className="requirement-details-spinner" />
        <p>
          Loading solar requirement details...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="requirement-details-state requirement-details-state-error">
        <div className="requirement-details-state-icon">
          !
        </div>

        <h3>
          Unable to load requirement
        </h3>

        <p>{error}</p>
      </div>
    );
  }

  if (!requirement) {
    return (
      <div className="requirement-details-state">
        <div className="requirement-details-state-icon">
          —
        </div>

        <h3>
          Solar requirement not found
        </h3>

        <p>
          The requested solar requirement is
          unavailable.
        </p>
      </div>
    );
  }

  const lead =
    requirement.leadId ||
    requirement.lead ||
    null;

  const customer =
    requirement.customer ||
    lead?.customer ||
    requirement.customerId ||
    null;

  const createdBy =
    requirement.createdBy ||
    requirement.createdByUser ||
    null;

  const updatedBy =
    requirement.updatedBy ||
    requirement.updatedByUser ||
    null;

  const address =
    requirement.installationAddress ||
    requirement.address ||
    "";

  const city =
    requirement.city ||
    requirement.location?.city ||
    "";

  const state =
    requirement.state ||
    requirement.location?.state ||
    "";

  const pincode =
    requirement.pincode ||
    requirement.location?.pincode ||
    "";

  const leadName =
    lead?.customerName ||
    lead?.name ||
    customer?.name ||
    customer?.customerName ||
    "—";

  const leadId = getId(lead);

  const customerPhone =
    customer?.phone ||
    customer?.mobile ||
    customer?.mobileNumber ||
    lead?.phone ||
    lead?.mobile ||
    "—";

  const customerEmail =
    customer?.email ||
    lead?.email ||
    "—";

  const requirementId =
    requirement._id ||
    requirement.id ||
    "—";

  return (
    <div className="requirement-details">
      <div className="requirement-details-header">
        <div>
          <span className="requirement-details-eyebrow">
            Solar Requirement
          </span>

          <h1>
            {requirement.requirementNumber ||
              requirement.requirementId ||
              `Requirement ${requirementId}`}
          </h1>

          <p>
            Created on{" "}
            {formatDate(
              requirement.createdAt ||
                requirement.createdDate
            )}
          </p>
        </div>

        <div className="requirement-details-header-actions">
          {typeof onEdit === "function" && (
            <button
              type="button"
              className="requirement-details-btn requirement-details-btn-secondary"
              onClick={() =>
                onEdit(requirement)
              }
            >
              Edit
            </button>
          )}

          {typeof onDelete === "function" && (
            <button
              type="button"
              className="requirement-details-btn requirement-details-btn-danger"
              onClick={() =>
                onDelete(requirement)
              }
            >
              Delete
            </button>
          )}
        </div>
      </div>

      <div className="requirement-details-grid">
        <section className="requirement-details-card requirement-details-card-highlight">
          <div className="requirement-details-card-header">
            <div>
              <h2>System Overview</h2>
              <p>
                Primary solar system requirement
                information.
              </p>
            </div>
          </div>

          <div className="requirement-details-metrics">
            <div className="requirement-details-metric">
              <span>Required Capacity</span>
              <strong>
                {requirement.requiredCapacity ||
                  requirement.systemSize ||
                  requirement.capacity ||
                  requirement.kw
                  ? `${
                      requirement.requiredCapacity ||
                      requirement.systemSize ||
                      requirement.capacity ||
                      requirement.kw
                    } kW`
                  : "—"}
              </strong>
            </div>

            <div className="requirement-details-metric">
              <span>System Type</span>
              <strong>
                {getDisplayValue(
                  requirement.systemType ||
                    requirement.type,
                  SYSTEM_TYPE_LABELS
                )}
              </strong>
            </div>

            <div className="requirement-details-metric">
              <span>Roof Type</span>
              <strong>
                {getDisplayValue(
                  requirement.roofType
                )}
              </strong>
            </div>

            <div className="requirement-details-metric">
              <span>Battery</span>
              <strong>
                {getDisplayValue(
                  requirement.batteryRequirement ||
                    requirement.battery,
                  BATTERY_REQUIREMENT_LABELS
                )}
              </strong>
            </div>
          </div>
        </section>

        <section className="requirement-details-card">
          <div className="requirement-details-card-header">
            <div>
              <h2>Customer Information</h2>
              <p>
                Customer and linked lead details.
              </p>
            </div>
          </div>

          <div className="requirement-details-info-grid">
            <div className="requirement-details-info-item">
              <span>Customer Name</span>
              <strong>{leadName}</strong>
            </div>

            <div className="requirement-details-info-item">
              <span>Phone Number</span>
              <strong>{customerPhone}</strong>
            </div>

            <div className="requirement-details-info-item">
              <span>Email Address</span>
              <strong>{customerEmail}</strong>
            </div>

            <div className="requirement-details-info-item">
              <span>Lead ID</span>
              <strong>
                {leadId || "—"}
              </strong>
            </div>
          </div>
        </section>

        <section className="requirement-details-card">
          <div className="requirement-details-card-header">
            <div>
              <h2>Electricity Details</h2>
              <p>
                Current electricity usage
                information.
              </p>
            </div>
          </div>

          <div className="requirement-details-info-grid">
            <div className="requirement-details-info-item">
              <span>Monthly Electricity Bill</span>
              <strong>
                {formatCurrency(
                  requirement.monthlyBill ||
                    requirement.averageMonthlyBill
                )}
              </strong>
            </div>

            <div className="requirement-details-info-item">
              <span>Monthly Consumption</span>
              <strong>
                {requirement.electricityConsumption ||
                requirement.monthlyConsumption
                  ? `${
                      requirement.electricityConsumption ||
                      requirement.monthlyConsumption
                    } kWh`
                  : "—"}
              </strong>
            </div>

            <div className="requirement-details-info-item">
              <span>Connection Type</span>
              <strong>
                {getDisplayValue(
                  requirement.connectionType,
                  CONNECTION_TYPE_LABELS
                )}
              </strong>
            </div>
          </div>
        </section>

        <section className="requirement-details-card">
          <div className="requirement-details-card-header">
            <div>
              <h2>Installation Location</h2>
              <p>
                Solar system installation
                address.
              </p>
            </div>
          </div>

          <div className="requirement-details-location">
            <div className="requirement-details-location-icon">
              ⌖
            </div>

            <div>
              <strong>
                Installation Address
              </strong>

              <p>
                {address || "—"}
              </p>

              {(city ||
                state ||
                pincode) && (
                <span>
                  {[city, state, pincode]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              )}
            </div>
          </div>
        </section>

        <section className="requirement-details-card">
          <div className="requirement-details-card-header">
            <div>
              <h2>Additional Notes</h2>
              <p>
                Additional requirement
                information.
              </p>
            </div>
          </div>

          <div className="requirement-details-notes">
            {requirement.notes ? (
              <p>{requirement.notes}</p>
            ) : (
              <span>
                No additional notes available.
              </span>
            )}
          </div>
        </section>

        <section className="requirement-details-card">
          <div className="requirement-details-card-header">
            <div>
              <h2>Record Information</h2>
              <p>
                Requirement creation and update
                history.
              </p>
            </div>
          </div>

          <div className="requirement-details-info-grid">
            <div className="requirement-details-info-item">
              <span>Created At</span>
              <strong>
                {formatDateTime(
                  requirement.createdAt
                )}
              </strong>
            </div>

            <div className="requirement-details-info-item">
              <span>Created By</span>
              <strong>
                {createdBy?.name ||
                  createdBy?.fullName ||
                  createdBy?.email ||
                  "—"}
              </strong>
            </div>

            <div className="requirement-details-info-item">
              <span>Last Updated</span>
              <strong>
                {formatDateTime(
                  requirement.updatedAt
                )}
              </strong>
            </div>

            <div className="requirement-details-info-item">
              <span>Updated By</span>
              <strong>
                {updatedBy?.name ||
                  updatedBy?.fullName ||
                  updatedBy?.email ||
                  "—"}
              </strong>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default RequirementDetails;