"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import MainLayout from "@/components/layout/MainLayout";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import Loader from "@/components/common/Loader";

import { useAuth } from "@/hooks/useAuth";
import leadService from "@/services/lead.service";
import leadActivityService from "@/services/leadActivity.service";

const LeadDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const { user, logout, loading: authLoading } = useAuth();

  const leadId = params?.id;

  const [lead, setLead] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(false);
  const [error, setError] = useState("");

  const loadLead = async () => {
    if (!leadId) return;

    try {
      setLoading(true);
      setError("");

      const response = await leadService.getLeadById(leadId);

      const leadData = response?.data || response;

      setLead(leadData);
    } catch (err) {
      console.error("Failed to load lead:", err);

      setError(
        err?.message ||
          err?.response?.data?.message ||
          "Unable to load lead details."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadActivities = async () => {
    if (!leadId) return;

    try {
      setActivityLoading(true);

      const response =
        await leadActivityService.getLeadActivities(leadId);

      const activityData = response?.data || response;

      setActivities(
        Array.isArray(activityData)
          ? activityData
          : activityData?.activities || []
      );
    } catch (err) {
      console.error("Failed to load lead activities:", err);
      setActivities([]);
    } finally {
      setActivityLoading(false);
    }
  };

  useEffect(() => {
    loadLead();
    loadActivities();
  }, [leadId]);

  const handleLogout = async () => {
    await logout();
  };

  const handleSearch = (value) => {
    console.log("Admin global search:", value);
  };

  const handleBack = () => {
    router.push("/admin/leads");
  };

  const handleRefresh = async () => {
    await Promise.all([loadLead(), loadActivities()]);
  };

  const getValue = (value, fallback = "—") => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return fallback;
    }

    return value;
  };

  const getName = (person) => {
    if (!person) return "—";

    if (typeof person === "string") return person;

    return (
      person.name ||
      person.fullName ||
      `${person.firstName || ""} ${person.lastName || ""}`.trim() ||
      person.email ||
      "—"
    );
  };

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getInitials = (name) => {
    if (!name) return "L";

    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase())
      .join("");
  };

  const getStatusVariant = (status) => {
    const value = String(status || "").toLowerCase();

    if (
      value.includes("converted") ||
      value.includes("won") ||
      value.includes("completed")
    ) {
      return "success";
    }

    if (
      value.includes("lost") ||
      value.includes("cancel") ||
      value.includes("reject")
    ) {
      return "danger";
    }

    if (
      value.includes("follow") ||
      value.includes("progress") ||
      value.includes("contact")
    ) {
      return "warning";
    }

    return "info";
  };

  const getPriorityVariant = (priority) => {
    const value = String(priority || "").toLowerCase();

    if (value === "high" || value === "urgent") {
      return "danger";
    }

    if (value === "medium") {
      return "warning";
    }

    return "success";
  };

  if (authLoading || loading) {
    return (
      <MainLayout
        user={user}
        onLogout={handleLogout}
        onSearch={handleSearch}
        notificationCount={0}
      >
        <div className="admin-lead-details-loading">
          <Loader />
        </div>
      </MainLayout>
    );
  }

  if (error || !lead) {
    return (
      <MainLayout
        user={user}
        onLogout={handleLogout}
        onSearch={handleSearch}
        notificationCount={0}
      >
        <div className="admin-lead-details-page">
          <div className="admin-lead-details-header">
            <div>
              <button
                type="button"
                className="admin-back-button"
                onClick={handleBack}
              >
                ← Back to Leads
              </button>

              <h1>Lead Details</h1>
              <p>View complete information about this lead.</p>
            </div>
          </div>

          <div className="admin-lead-error-card">
            <div className="admin-error-icon">!</div>

            <h2>Unable to load lead</h2>

            <p>
              {error || "The requested lead could not be found."}
            </p>

            <div className="admin-error-actions">
              <Button onClick={handleRefresh}>
                Try Again
              </Button>

              <Button
                variant="secondary"
                onClick={handleBack}
              >
                Back to Leads
              </Button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  const leadName =
    lead?.name ||
    lead?.customerName ||
    lead?.fullName ||
    "Unnamed Lead";

  const assignedEmployee =
    lead?.assignedTo ||
    lead?.assignedEmployee ||
    lead?.employee;

  const leadStatus = lead?.status || "NEW";
  const leadPriority = lead?.priority || "MEDIUM";

  return (
    <MainLayout
      user={user}
      onLogout={handleLogout}
      onSearch={handleSearch}
      notificationCount={0}
    >
      <div className="admin-lead-details-page">
        {/* Header */}
        <div className="admin-lead-details-header">
          <div className="admin-lead-header-left">
            <button
              type="button"
              className="admin-back-button"
              onClick={handleBack}
            >
              ← Back to Leads
            </button>

            <div className="admin-lead-title-row">
              <div className="admin-lead-avatar">
                {getInitials(leadName)}
              </div>

              <div>
                <div className="admin-lead-title-line">
                  <h1>{leadName}</h1>

                  <Badge variant={getStatusVariant(leadStatus)}>
                    {String(leadStatus).replace(/_/g, " ")}
                  </Badge>
                </div>

                <p>
                  Lead ID:{" "}
                  <strong>
                    {getValue(
                      lead?.leadNumber ||
                        lead?.leadId ||
                        lead?._id
                    )}
                  </strong>
                </p>
              </div>
            </div>
          </div>

          <div className="admin-lead-header-actions">
            <Button
              variant="secondary"
              onClick={handleRefresh}
            >
              ↻ Refresh
            </Button>
          </div>
        </div>

        {/* Summary */}
        <div className="admin-lead-summary-grid">
          <div className="admin-lead-summary-card">
            <span className="summary-label">Status</span>

            <strong>
              <Badge variant={getStatusVariant(leadStatus)}>
                {String(leadStatus).replace(/_/g, " ")}
              </Badge>
            </strong>
          </div>

          <div className="admin-lead-summary-card">
            <span className="summary-label">Priority</span>

            <strong>
              <Badge variant={getPriorityVariant(leadPriority)}>
                {String(leadPriority).replace(/_/g, " ")}
              </Badge>
            </strong>
          </div>

          <div className="admin-lead-summary-card">
            <span className="summary-label">Lead Source</span>
            <strong>{getValue(lead?.source)}</strong>
          </div>

          <div className="admin-lead-summary-card">
            <span className="summary-label">Follow-up</span>
            <strong>
              {formatDate(
                lead?.followUpDate ||
                  lead?.nextFollowUpDate
              )}
            </strong>
          </div>
        </div>

        <div className="admin-lead-details-layout">
          {/* Main Content */}
          <div className="admin-lead-main-column">
            {/* Lead Information */}
            <section className="admin-detail-card">
              <div className="admin-detail-card-header">
                <div>
                  <h2>Lead Information</h2>
                  <p>Basic customer and lead information.</p>
                </div>
              </div>

              <div className="admin-detail-grid">
                <div className="admin-detail-item">
                  <span>Customer Name</span>
                  <strong>{getValue(leadName)}</strong>
                </div>

                <div className="admin-detail-item">
                  <span>Company Name</span>
                  <strong>
                    {getValue(lead?.companyName)}
                  </strong>
                </div>

                <div className="admin-detail-item">
                  <span>Phone</span>
                  <strong>
                    {getValue(
                      lead?.phone ||
                        lead?.mobile ||
                        lead?.contactNumber
                    )}
                  </strong>
                </div>

                <div className="admin-detail-item">
                  <span>Email</span>
                  <strong>
                    {getValue(lead?.email)}
                  </strong>
                </div>

                <div className="admin-detail-item">
                  <span>City</span>
                  <strong>
                    {getValue(lead?.city)}
                  </strong>
                </div>

                <div className="admin-detail-item">
                  <span>Source</span>
                  <strong>
                    {getValue(lead?.source)}
                  </strong>
                </div>

                <div className="admin-detail-item admin-detail-full">
                  <span>Address</span>
                  <strong>
                    {getValue(lead?.address)}
                  </strong>
                </div>

                <div className="admin-detail-item admin-detail-full">
                  <span>Solar Requirement</span>
                  <strong>
                    {getValue(
                      lead?.requirement ||
                        lead?.solarRequirement ||
                        lead?.requirementDetails
                    )}
                  </strong>
                </div>

                <div className="admin-detail-item">
                  <span>Created At</span>
                  <strong>
                    {formatDateTime(
                      lead?.createdAt
                    )}
                  </strong>
                </div>

                <div className="admin-detail-item">
                  <span>Last Updated</span>
                  <strong>
                    {formatDateTime(
                      lead?.updatedAt
                    )}
                  </strong>
                </div>
              </div>
            </section>

            {/* Assignment */}
            <section className="admin-detail-card">
              <div className="admin-detail-card-header">
                <div>
                  <h2>Assignment</h2>
                  <p>Employee responsible for this lead.</p>
                </div>
              </div>

              <div className="admin-assignee-box">
                <div className="admin-assignee-avatar">
                  {getInitials(getName(assignedEmployee))}
                </div>

                <div>
                  <span>Assigned Employee</span>
                  <strong>
                    {getName(assignedEmployee)}
                  </strong>

                  {assignedEmployee?.email && (
                    <small>
                      {assignedEmployee.email}
                    </small>
                  )}
                </div>
              </div>
            </section>

            {/* Notes */}
            <section className="admin-detail-card">
              <div className="admin-detail-card-header">
                <div>
                  <h2>Notes</h2>
                  <p>Additional information added to the lead.</p>
                </div>
              </div>

              <div className="admin-notes-content">
                {lead?.notes ? (
                  <p>{lead.notes}</p>
                ) : (
                  <span>No notes available for this lead.</span>
                )}
              </div>
            </section>

            {/* Activity History */}
            <section className="admin-detail-card">
              <div className="admin-detail-card-header">
                <div>
                  <h2>Activity History</h2>
                  <p>
                    Recent activities and updates related to this lead.
                  </p>
                </div>
              </div>

              {activityLoading ? (
                <div className="admin-activity-loading">
                  <Loader />
                </div>
              ) : activities.length === 0 ? (
                <div className="admin-empty-activities">
                  <div className="admin-empty-icon">◷</div>

                  <h3>No activities yet</h3>

                  <p>
                    No activity has been recorded for this lead.
                  </p>
                </div>
              ) : (
                <div className="admin-activity-list">
                  {activities.map((activity, index) => {
                    const activityId =
                      activity?._id ||
                      activity?.id ||
                      index;

                    const activityUser =
                      activity?.createdBy ||
                      activity?.performedBy ||
                      activity?.user;

                    const activityTitle =
                      activity?.title ||
                      activity?.action ||
                      activity?.type ||
                      "Lead Activity";

                    const activityDescription =
                      activity?.description ||
                      activity?.notes ||
                      activity?.message ||
                      activity?.details ||
                      "";

                    return (
                      <div
                        className="admin-activity-item"
                        key={activityId}
                      >
                        <div className="admin-activity-dot" />

                        <div className="admin-activity-content">
                          <div className="admin-activity-top">
                            <div>
                              <h3>
                                {String(activityTitle).replace(
                                  /_/g,
                                  " "
                                )}
                              </h3>

                              {activityUser && (
                                <span>
                                  By {getName(activityUser)}
                                </span>
                              )}
                            </div>

                            <time>
                              {formatDateTime(
                                activity?.createdAt ||
                                  activity?.date ||
                                  activity?.activityDate
                              )}
                            </time>
                          </div>

                          {activityDescription && (
                            <p>{activityDescription}</p>
                          )}

                          {activity?.status && (
                            <Badge
                              variant={getStatusVariant(
                                activity.status
                              )}
                            >
                              {String(activity.status).replace(
                                /_/g,
                                " "
                              )}
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <aside className="admin-lead-sidebar">
            <section className="admin-detail-card admin-sidebar-card">
              <div className="admin-detail-card-header">
                <div>
                  <h2>Lead Summary</h2>
                  <p>Quick overview.</p>
                </div>
              </div>

              <div className="admin-summary-list">
                <div>
                  <span>Lead ID</span>
                  <strong>
                    {getValue(
                      lead?.leadNumber ||
                        lead?.leadId ||
                        lead?._id
                    )}
                  </strong>
                </div>

                <div>
                  <span>Status</span>
                  <strong>
                    {String(leadStatus).replace(
                      /_/g,
                      " "
                    )}
                  </strong>
                </div>

                <div>
                  <span>Priority</span>
                  <strong>
                    {String(leadPriority).replace(
                      /_/g,
                      " "
                    )}
                  </strong>
                </div>

                <div>
                  <span>Source</span>
                  <strong>
                    {getValue(lead?.source)}
                  </strong>
                </div>

                <div>
                  <span>Created</span>
                  <strong>
                    {formatDate(lead?.createdAt)}
                  </strong>
                </div>

                <div>
                  <span>Activities</span>
                  <strong>
                    {activities.length}
                  </strong>
                </div>
              </div>
            </section>

            <section className="admin-detail-card admin-sidebar-card">
              <div className="admin-detail-card-header">
                <div>
                  <h2>Contact</h2>
                  <p>Customer contact details.</p>
                </div>
              </div>

              <div className="admin-contact-actions">
                {lead?.phone && (
                  <a
                    href={`tel:${lead.phone}`}
                    className="admin-contact-button"
                  >
                    <span>☎</span>
                    <div>
                      <small>Call Customer</small>
                      <strong>{lead.phone}</strong>
                    </div>
                  </a>
                )}

                {lead?.email && (
                  <a
                    href={`mailto:${lead.email}`}
                    className="admin-contact-button"
                  >
                    <span>✉</span>
                    <div>
                      <small>Email Customer</small>
                      <strong>{lead.email}</strong>
                    </div>
                  </a>
                )}

                {!lead?.phone && !lead?.email && (
                  <div className="admin-no-contact">
                    No contact details available.
                  </div>
                )}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </MainLayout>
  );
};

export default LeadDetailsPage;