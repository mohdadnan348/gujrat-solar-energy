"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import Avatar from "@/components/common/Avatar";
import Badge from "@/components/common/Badge";
import Button from "@/components/common/Button";
import Loader from "@/components/common/Loader";
import LeadTimeline from "./LeadTimeline";
import {
  formatLeadId,
  formatName,
  formatPhone,
  formatDate,
  formatRelativeDate,
  formatAddress,
  formatSolarUnit,
} from "@/utils/formatters";
import {
  LEAD_STATUS_LABELS,
  LEAD_PRIORITY_LABELS,
} from "@/utils/constants";

const LeadDetails = ({
  lead = null,
  activities = [],
  loading = false,
  activitiesLoading = false,
  error = "",
  onEdit,
  onDelete,
  onAssign,
  onAddActivity,
  showActions = true,
}) => {
  const leadId = useMemo(
    () =>
      lead?._id ||
      lead?.id ||
      lead?.leadId ||
      "",
    [lead]
  );

  const customerName =
    lead?.customerName ||
    lead?.name ||
    lead?.customer?.name ||
    lead?.customer?.customerName ||
    "Unnamed Lead";

  const phone =
    lead?.phone ||
    lead?.mobile ||
    lead?.mobileNumber ||
    lead?.customer?.phone ||
    lead?.customer?.mobile ||
    "";

  const email =
    lead?.email ||
    lead?.customer?.email ||
    "";

  const status = String(
    lead?.status ||
      lead?.leadStatus ||
      "NEW"
  ).toUpperCase();

  const priority = String(
    lead?.priority ||
      "MEDIUM"
  ).toUpperCase();

  const source =
    lead?.source ||
    lead?.leadSource ||
    "Not specified";

  const requirement =
    lead?.requirement ||
    lead?.solarRequirement ||
    lead?.requiredCapacity ||
    lead?.systemSize ||
    lead?.kw ||
    "";

  const assignedTo =
    lead?.assignedTo ||
    lead?.assignedEmployee ||
    lead?.employee ||
    lead?.owner ||
    null;

  const assignedName =
    typeof assignedTo === "string"
      ? assignedTo
      : assignedTo?.name ||
        assignedTo?.fullName ||
        `${assignedTo?.firstName || ""} ${
          assignedTo?.lastName || ""
        }`.trim() ||
        assignedTo?.email ||
        "Unassigned";

  const address = formatAddress(
    lead?.address ||
      lead?.customer?.address ||
      ""
  );

  const city =
    lead?.city ||
    lead?.address?.city ||
    lead?.location?.city ||
    lead?.customer?.city ||
    "";

  const state =
    lead?.state ||
    lead?.address?.state ||
    lead?.location?.state ||
    lead?.customer?.state ||
    "";

  const pincode =
    lead?.pincode ||
    lead?.address?.pincode ||
    lead?.location?.pincode ||
    lead?.customer?.pincode ||
    "";

  const followUpDate =
    lead?.followUpDate ||
    lead?.nextFollowUpDate ||
    lead?.nextFollowUp ||
    null;

  const createdAt =
    lead?.createdAt ||
    lead?.createdDate ||
    lead?.date ||
    null;

  const updatedAt =
    lead?.updatedAt ||
    lead?.updatedDate ||
    null;

  const getStatusVariant = () => {
    const variants = {
      NEW: "info",
      CONTACTED: "warning",
      FOLLOW_UP: "warning",
      QUALIFIED: "success",
      PROPOSAL_SENT: "info",
      NEGOTIATION: "warning",
      CONVERTED: "success",
      SUCCESS: "success",
      PENDING: "warning",
      NOT_INTERESTED: "danger",
      LOST: "danger",
      CLOSED: "success",
    };

    return variants[status] || "default";
  };

  const getPriorityVariant = () => {
    const variants = {
      LOW: "default",
      MEDIUM: "info",
      HIGH: "warning",
      URGENT: "danger",
    };

    return variants[priority] || "default";
  };

  const getStatusLabel = () =>
    LEAD_STATUS_LABELS?.[status] ||
    status
      .replaceAll("_", " ")
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );

  const getPriorityLabel = () =>
    LEAD_PRIORITY_LABELS?.[priority] ||
    priority
      .replaceAll("_", " ")
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );

  const getRequirementValue = () => {
    if (
      requirement === undefined ||
      requirement === null ||
      requirement === ""
    ) {
      return "Not specified";
    }

    if (
      typeof requirement === "object"
    ) {
      const value =
        requirement?.systemSize ||
        requirement?.capacity ||
        requirement?.kw ||
        requirement?.value;

      return value
        ? formatSolarUnit(value)
        : "Not specified";
    }

    return formatSolarUnit(requirement);
  };

  const getLeadNumber = () =>
    lead?.leadNumber ||
    lead?.leadNo ||
    lead?.number ||
    formatLeadId(leadId);

  const getEmployeeInitial = () => {
    if (
      !assignedName ||
      assignedName === "Unassigned"
    ) {
      return "U";
    }

    return assignedName
      .charAt(0)
      .toUpperCase();
  };

  if (loading) {
    return (
      <div className="lead-details-state">
        <Loader />
        <p>Loading lead details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="lead-details-state lead-details-error">
        <div className="lead-details-state-icon">
          !
        </div>

        <h3>Unable to load lead</h3>

        <p>{error}</p>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="lead-details-state">
        <div className="lead-details-state-icon">
          ◉
        </div>

        <h3>Lead Not Found</h3>

        <p>
          The requested lead is not available.
        </p>
      </div>
    );
  }

  return (
    <div className="lead-details">
      {/* Header */}
      <div className="lead-details-header">
        <div className="lead-details-header-main">
          <Avatar
            name={customerName}
            size="lg"
          />

          <div>
            <div className="lead-details-id">
              {getLeadNumber()}
            </div>

            <h1>
              {formatName(customerName)}
            </h1>

            {lead?.companyName && (
              <p>{lead.companyName}</p>
            )}
          </div>
        </div>

        {showActions && (
          <div className="lead-details-actions">
            {typeof onAssign ===
              "function" && (
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  onAssign(lead)
                }
              >
                Assign
              </Button>
            )}

            {typeof onEdit ===
              "function" && (
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  onEdit(lead)
                }
              >
                Edit Lead
              </Button>
            )}

            {typeof onDelete ===
              "function" && (
              <Button
                type="button"
                variant="danger"
                onClick={() =>
                  onDelete(lead)
                }
              >
                Delete
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Status Summary */}
      <div className="lead-details-status-grid">
        <div className="lead-details-status-card">
          <span>Status</span>

          <Badge variant={getStatusVariant()}>
            {getStatusLabel()}
          </Badge>
        </div>

        <div className="lead-details-status-card">
          <span>Priority</span>

          <Badge
            variant={getPriorityVariant()}
          >
            {getPriorityLabel()}
          </Badge>
        </div>

        <div className="lead-details-status-card">
          <span>Solar Requirement</span>

          <strong>
            {getRequirementValue()}
          </strong>
        </div>

        <div className="lead-details-status-card">
          <span>Lead Source</span>

          <strong>{source}</strong>
        </div>
      </div>

      <div className="lead-details-content">
        {/* Contact Information */}
        <section className="lead-details-card">
          <div className="lead-details-card-header">
            <div>
              <h2>Contact Information</h2>
              <p>
                Primary contact details for this
                lead.
              </p>
            </div>
          </div>

          <div className="lead-details-info-grid">
            <div className="lead-details-info-item">
              <span>Customer Name</span>
              <strong>
                {formatName(customerName)}
              </strong>
            </div>

            <div className="lead-details-info-item">
              <span>Phone Number</span>

              {phone ? (
                <a
                  href={`tel:${phone}`}
                  className="lead-details-link"
                >
                  {formatPhone(phone)}
                </a>
              ) : (
                <strong>Not provided</strong>
              )}
            </div>

            <div className="lead-details-info-item">
              <span>Email Address</span>

              {email ? (
                <a
                  href={`mailto:${email}`}
                  className="lead-details-link"
                >
                  {email}
                </a>
              ) : (
                <strong>Not provided</strong>
              )}
            </div>

            <div className="lead-details-info-item">
              <span>Company Name</span>
              <strong>
                {lead?.companyName ||
                  "Not provided"}
              </strong>
            </div>
          </div>
        </section>

        {/* Installation Location */}
        <section className="lead-details-card">
          <div className="lead-details-card-header">
            <div>
              <h2>Installation Location</h2>
              <p>
                Solar installation site
                information.
              </p>
            </div>
          </div>

          <div className="lead-details-location">
            <div className="lead-details-info-item">
              <span>Address</span>
              <strong>
                {address || "Not provided"}
              </strong>
            </div>

            <div className="lead-details-location-grid">
              <div className="lead-details-info-item">
                <span>City</span>
                <strong>
                  {city || "Not provided"}
                </strong>
              </div>

              <div className="lead-details-info-item">
                <span>State</span>
                <strong>
                  {state || "Not provided"}
                </strong>
              </div>

              <div className="lead-details-info-item">
                <span>Pincode</span>
                <strong>
                  {pincode || "Not provided"}
                </strong>
              </div>
            </div>
          </div>
        </section>

        {/* Assignment */}
        <section className="lead-details-card">
          <div className="lead-details-card-header">
            <div>
              <h2>Assignment</h2>
              <p>
                Current owner responsible for this
                lead.
              </p>
            </div>
          </div>

          <div className="lead-details-assignee">
            {assignedTo ? (
              <>
                <Avatar
                  name={assignedName}
                  size="md"
                />

                <div>
                  <strong>
                    {assignedName}
                  </strong>

                  {typeof assignedTo ===
                    "object" &&
                    assignedTo?.email && (
                      <span>
                        {assignedTo.email}
                      </span>
                    )}

                  {typeof assignedTo ===
                    "object" &&
                    assignedTo?.role && (
                      <span>
                        {assignedTo.role}
                      </span>
                    )}
                </div>
              </>
            ) : (
              <>
                <span className="lead-details-unassigned-avatar">
                  {getEmployeeInitial()}
                </span>

                <div>
                  <strong>
                    Unassigned
                  </strong>
                  <span>
                    No employee is currently
                    assigned.
                  </span>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Follow-Up */}
        <section className="lead-details-card">
          <div className="lead-details-card-header">
            <div>
              <h2>Follow-Up</h2>
              <p>
                Next scheduled follow-up for this
                lead.
              </p>
            </div>
          </div>

          <div className="lead-details-follow-up">
            <div className="lead-details-info-item">
              <span>Next Follow-Up</span>

              <strong>
                {followUpDate
                  ? formatDate(
                      followUpDate
                    )
                  : "Not scheduled"}
              </strong>

              {followUpDate && (
                <small>
                  {formatRelativeDate(
                    followUpDate
                  )}
                </small>
              )}
            </div>
          </div>
        </section>

        {/* Notes */}
        {lead?.notes && (
          <section className="lead-details-card">
            <div className="lead-details-card-header">
              <div>
                <h2>Notes</h2>
                <p>
                  Additional information about this
                  lead.
                </p>
              </div>
            </div>

            <div className="lead-details-notes">
              {lead.notes}
            </div>
          </section>
        )}

        {/* Timeline */}
        <section className="lead-details-card lead-details-timeline-card">
          <div className="lead-details-card-header">
            <div>
              <h2>Activity Timeline</h2>
              <p>
                Track updates and activities related
                to this lead.
              </p>
            </div>

            {typeof onAddActivity ===
              "function" && (
              <Button
                type="button"
                variant="primary"
                onClick={() =>
                  onAddActivity(lead)
                }
              >
                Add Activity
              </Button>
            )}
          </div>

          <LeadTimeline
            activities={activities}
            loading={activitiesLoading}
            lead={lead}
          />
        </section>

        {/* Record Information */}
        <section className="lead-details-card">
          <div className="lead-details-card-header">
            <div>
              <h2>Record Information</h2>
              <p>
                System information for this lead
                record.
              </p>
            </div>
          </div>

          <div className="lead-details-info-grid">
            <div className="lead-details-info-item">
              <span>Lead ID</span>
              <strong>
                {getLeadNumber()}
              </strong>
            </div>

            <div className="lead-details-info-item">
              <span>Created On</span>
              <strong>
                {createdAt
                  ? formatDate(createdAt)
                  : "Not available"}
              </strong>
            </div>

            <div className="lead-details-info-item">
              <span>Last Updated</span>
              <strong>
                {updatedAt
                  ? formatDate(updatedAt)
                  : "Not available"}
              </strong>
            </div>

            <div className="lead-details-info-item">
              <span>Updated</span>
              <strong>
                {updatedAt
                  ? formatRelativeDate(
                      updatedAt
                    )
                  : "Not available"}
              </strong>
            </div>
          </div>
        </section>
      </div>

      {/* Related Links */}
      <div className="lead-details-related">
        {lead?.solarRequirementId && (
          <Link
            href={`/admin/solar-requirements/${lead.solarRequirementId}`}
            className="lead-details-related-link"
          >
            View Solar Requirement
          </Link>
        )}

        {lead?.systemConfigurationId && (
          <Link
            href={`/admin/system-configurations/${lead.systemConfigurationId}`}
            className="lead-details-related-link"
          >
            View System Configuration
          </Link>
        )}

        {lead?.quotationId && (
          <Link
            href={`/admin/quotations/${lead.quotationId}`}
            className="lead-details-related-link"
          >
            View Quotation
          </Link>
        )}

        {lead?.customerId && (
          <Link
            href={`/admin/customers/${lead.customerId}`}
            className="lead-details-related-link"
          >
            View Customer
          </Link>
        )}
      </div>
    </div>
  );
};

export default LeadDetails;