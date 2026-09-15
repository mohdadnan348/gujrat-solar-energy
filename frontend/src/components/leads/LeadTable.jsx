"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import Badge from "@/components/common/Badge";
import Avatar from "@/components/common/Avatar";
import Button from "@/components/common/Button";
import Pagination from "@/components/common/Pagination";
import Loader from "@/components/common/Loader";
import {
  formatLeadId,
  formatName,
  formatPhone,
  formatDate,
  formatRelativeDate,
} from "@/utils/formatters";
import {
  LEAD_STATUS_LABELS,
  LEAD_PRIORITY_LABELS,
} from "@/utils/constants";

const LeadTable = ({
  leads = [],
  loading = false,
  error = "",
  pagination = null,
  onPageChange,
  onView,
  onEdit,
  onDelete,
  onAssign,
  showActions = true,
  showPagination = true,
  emptyMessage = "No leads found.",
}) => {
  const normalizedLeads = useMemo(() => {
    if (!Array.isArray(leads)) return [];

    return leads.map((lead, index) => ({
      ...lead,
      _rowKey:
        lead?._id ||
        lead?.id ||
        lead?.leadId ||
        `lead-${index}`,
    }));
  }, [leads]);

  const getId = (lead) =>
    lead?._id ||
    lead?.id ||
    lead?.leadId ||
    "";

  const getLeadNumber = (lead, index) => {
    return (
      lead?.leadNumber ||
      lead?.leadNo ||
      lead?.number ||
      lead?.sequence ||
      formatLeadId(getId(lead)) ||
      String(index + 1).padStart(3, "0")
    );
  };

  const getCustomerName = (lead) => {
    return (
      lead?.customerName ||
      lead?.name ||
      lead?.customer?.name ||
      lead?.customer?.customerName ||
      "Unnamed Lead"
    );
  };

  const getPhone = (lead) => {
    return (
      lead?.phone ||
      lead?.mobile ||
      lead?.mobileNumber ||
      lead?.customer?.phone ||
      lead?.customer?.mobile ||
      ""
    );
  };

  const getCity = (lead) => {
    return (
      lead?.city ||
      lead?.location?.city ||
      lead?.address?.city ||
      lead?.customer?.city ||
      "—"
    );
  };

  const getRequirement = (lead) => {
    const value =
      lead?.requirement ||
      lead?.solarRequirement ||
      lead?.systemSize ||
      lead?.requiredCapacity ||
      lead?.kw;

    if (value === undefined || value === null || value === "") {
      return "—";
    }

    if (typeof value === "object") {
      return (
        value?.systemSize ||
        value?.capacity ||
        value?.kw ||
        value?.value ||
        "—"
      );
    }

    return String(value).includes("kW") ? value : `${value} kW`;
  };

  const getStatus = (lead) => {
    const status = String(
      lead?.status ||
        lead?.leadStatus ||
        "NEW"
    ).toUpperCase();

    return status;
  };

  const getPriority = (lead) => {
    const priority = String(
      lead?.priority ||
        "MEDIUM"
    ).toUpperCase();

    return priority;
  };

  const getAssignedEmployee = (lead) => {
    const employee =
      lead?.assignedTo ||
      lead?.assignedEmployee ||
      lead?.employee ||
      lead?.owner;

    if (!employee) return null;

    if (typeof employee === "string") {
      return {
        name: employee,
      };
    }

    return employee;
  };

  const getAssignedName = (lead) => {
    const employee = getAssignedEmployee(lead);

    if (!employee) return "Unassigned";

    return (
      employee?.name ||
      employee?.fullName ||
      `${employee?.firstName || ""} ${
        employee?.lastName || ""
      }`.trim() ||
      employee?.email ||
      "Assigned"
    );
  };

  const getAssignedInitial = (lead) => {
    const name = getAssignedName(lead);

    if (!name || name === "Unassigned") {
      return "U";
    }

    return name.charAt(0).toUpperCase();
  };

  const getSource = (lead) => {
    return (
      lead?.source ||
      lead?.leadSource ||
      "—"
    );
  };

  const getFollowUpDate = (lead) => {
    return (
      lead?.followUpDate ||
      lead?.nextFollowUpDate ||
      lead?.nextFollowUp ||
      null
    );
  };

  const getCreatedDate = (lead) => {
    return (
      lead?.createdAt ||
      lead?.createdDate ||
      lead?.date ||
      null
    );
  };

  const getUpdatedDate = (lead) => {
    return (
      lead?.updatedAt ||
      lead?.updatedDate ||
      null
    );
  };

  const getStatusVariant = (status) => {
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

  const getPriorityVariant = (priority) => {
    const variants = {
      LOW: "default",
      MEDIUM: "info",
      HIGH: "warning",
      URGENT: "danger",
    };

    return variants[priority] || "default";
  };

  const getStatusLabel = (status) => {
    return (
      LEAD_STATUS_LABELS?.[status] ||
      status
        .replaceAll("_", " ")
        .replace(/\b\w/g, (char) =>
          char.toUpperCase()
        )
    );
  };

  const getPriorityLabel = (priority) => {
    return (
      LEAD_PRIORITY_LABELS?.[priority] ||
      priority
        .replaceAll("_", " ")
        .replace(/\b\w/g, (char) =>
          char.toUpperCase()
        )
    );
  };

  const handleView = (lead) => {
    if (typeof onView === "function") {
      onView(lead);
      return;
    }

    const id = getId(lead);

    if (id && typeof window !== "undefined") {
      window.location.href = `/admin/leads/${id}`;
    }
  };

  const handleEdit = (lead) => {
    if (typeof onEdit === "function") {
      onEdit(lead);
      return;
    }

    const id = getId(lead);

    if (id && typeof window !== "undefined") {
      window.location.href = `/admin/leads/${id}/edit`;
    }
  };

  const handleDelete = (lead) => {
    if (typeof onDelete === "function") {
      onDelete(lead);
    }
  };

  const handleAssign = (lead) => {
    if (typeof onAssign === "function") {
      onAssign(lead);
    }
  };

  const renderPagination = () => {
    if (!showPagination || !pagination) {
      return null;
    }

    const currentPage =
      pagination.currentPage ||
      pagination.page ||
      1;

    const totalPages =
      pagination.totalPages ||
      pagination.pages ||
      1;

    if (totalPages <= 1) {
      return null;
    }

    return (
      <div className="lead-table-pagination">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          totalItems={
            pagination.totalItems ||
            pagination.total ||
            normalizedLeads.length
          }
          pageSize={
            pagination.pageSize ||
            pagination.limit
          }
        />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="lead-table-state">
        <Loader />
        <p>Loading leads...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="lead-table-state lead-table-error">
        <div className="lead-table-state-icon">!</div>
        <h3>Unable to load leads</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (normalizedLeads.length === 0) {
    return (
      <div className="lead-table-state lead-table-empty">
        <div className="lead-table-state-icon">◉</div>
        <h3>No Leads Found</h3>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="lead-table-container">
      <div className="lead-table-wrapper">
        <table className="lead-table">
          <thead>
            <tr>
              <th>Lead ID</th>
              <th>Customer</th>
              <th>Contact</th>
              <th>City</th>
              <th>Requirement</th>
              <th>Source</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Assigned To</th>
              <th>Follow-Up</th>
              <th>Created</th>
              {showActions && <th>Actions</th>}
            </tr>
          </thead>

          <tbody>
            {normalizedLeads.map((lead, index) => {
              const id = getId(lead);
              const customerName =
                getCustomerName(lead);
              const phone = getPhone(lead);
              const status = getStatus(lead);
              const priority = getPriority(lead);
              const assignedEmployee =
                getAssignedEmployee(lead);
              const followUpDate =
                getFollowUpDate(lead);
              const createdDate =
                getCreatedDate(lead);

              return (
                <tr key={lead._rowKey}>
                  <td>
                    <div className="lead-id-cell">
                      <span className="lead-id">
                        {getLeadNumber(
                          lead,
                          index
                        )}
                      </span>
                    </div>
                  </td>

                  <td>
                    <div className="lead-customer-cell">
                      <Avatar
                        name={customerName}
                        size="sm"
                      />

                      <div>
                        <strong>
                          {formatName(
                            customerName
                          )}
                        </strong>

                        {lead?.companyName && (
                          <span>
                            {lead.companyName}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  <td>
                    <div className="lead-contact-cell">
                      {phone ? (
                        <a
                          href={`tel:${phone}`}
                          className="lead-phone"
                        >
                          {formatPhone(phone)}
                        </a>
                      ) : (
                        <span>—</span>
                      )}

                      {lead?.email && (
                        <span className="lead-email">
                          {lead.email}
                        </span>
                      )}
                    </div>
                  </td>

                  <td>
                    <span className="lead-city">
                      {getCity(lead)}
                    </span>
                  </td>

                  <td>
                    <span className="lead-requirement">
                      {getRequirement(lead)}
                    </span>
                  </td>

                  <td>
                    <span className="lead-source">
                      {getSource(lead)}
                    </span>
                  </td>

                  <td>
                    <Badge
                      variant={getStatusVariant(
                        status
                      )}
                    >
                      {getStatusLabel(status)}
                    </Badge>
                  </td>

                  <td>
                    <Badge
                      variant={getPriorityVariant(
                        priority
                      )}
                    >
                      {getPriorityLabel(
                        priority
                      )}
                    </Badge>
                  </td>

                  <td>
                    <div className="lead-assigned-cell">
                      {assignedEmployee ? (
                        <>
                          <Avatar
                            name={getAssignedName(
                              lead
                            )}
                            size="xs"
                          />

                          <span>
                            {getAssignedName(
                              lead
                            )}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="lead-unassigned-avatar">
                            {getAssignedInitial(
                              lead
                            )}
                          </span>

                          <span>
                            Unassigned
                          </span>
                        </>
                      )}
                    </div>
                  </td>

                  <td>
                    <div className="lead-date-cell">
                      {followUpDate ? (
                        <>
                          <strong>
                            {formatDate(
                              followUpDate
                            )}
                          </strong>
                          <span>
                            {formatRelativeDate(
                              followUpDate
                            )}
                          </span>
                        </>
                      ) : (
                        <span>Not scheduled</span>
                      )}
                    </div>
                  </td>

                  <td>
                    <div className="lead-date-cell">
                      {createdDate ? (
                        <>
                          <strong>
                            {formatDate(
                              createdDate
                            )}
                          </strong>
                          {getUpdatedDate(lead) && (
                            <span>
                              Updated{" "}
                              {formatRelativeDate(
                                getUpdatedDate(
                                  lead
                                )
                              )}
                            </span>
                          )}
                        </>
                      ) : (
                        <span>—</span>
                      )}
                    </div>
                  </td>

                  {showActions && (
                    <td>
                      <div className="lead-actions">
                        {id ? (
                          <Link
                            href={`/admin/leads/${id}`}
                            className="lead-action-button"
                            aria-label={`View ${customerName}`}
                            title="View Lead"
                          >
                            View
                          </Link>
                        ) : (
                          <Button
                            type="button"
                            variant="secondary"
                            size="small"
                            onClick={() =>
                              handleView(lead)
                            }
                          >
                            View
                          </Button>
                        )}

                        <Button
                          type="button"
                          variant="secondary"
                          size="small"
                          onClick={() =>
                            handleEdit(lead)
                          }
                        >
                          Edit
                        </Button>

                        {typeof onAssign ===
                          "function" && (
                          <Button
                            type="button"
                            variant="secondary"
                            size="small"
                            onClick={() =>
                              handleAssign(lead)
                            }
                          >
                            Assign
                          </Button>
                        )}

                        {typeof onDelete ===
                          "function" && (
                          <Button
                            type="button"
                            variant="danger"
                            size="small"
                            onClick={() =>
                              handleDelete(lead)
                            }
                          >
                            Delete
                          </Button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {renderPagination()}
    </div>
  );
};

export default LeadTable;