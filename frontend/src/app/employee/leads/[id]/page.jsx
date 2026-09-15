"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import Loader from "@/components/common/Loader";
import leadService from "@/services/lead.service";
import leadActivityService from "@/services/leadActivity.service";
import { useAuth } from "@/hooks/useAuth";

const LeadDetailsPage = () => {
  const params = useParams();
  const leadId = params?.id;

  const { user, logout, loading: authLoading } = useAuth();

  const [lead, setLead] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadLeadDetails = async () => {
    if (!leadId) return;

    try {
      setLoading(true);
      setError("");

      const [leadResponse, activityResponse] = await Promise.all([
        leadService.getLeadById(leadId),
        leadActivityService.getActivitiesByLead(leadId),
      ]);

      const leadData =
        leadResponse?.data?.lead ||
        leadResponse?.lead ||
        leadResponse?.data ||
        null;

      const activityData =
        activityResponse?.data?.activities ||
        activityResponse?.activities ||
        activityResponse?.data ||
        [];

      setLead(leadData);
      setActivities(
        Array.isArray(activityData) ? activityData : []
      );
    } catch (err) {
      console.error("Failed to load lead details:", err);
      setError(
        err?.message || "Unable to load lead details."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user && leadId) {
      loadLeadDetails();
    }
  }, [authLoading, user, leadId]);

  const handleLogout = async () => {
    await logout();
  };

  const handleBack = () => {
    window.location.href = "/employee/leads";
  };

  const getLeadName = () =>
    lead?.name ||
    lead?.customerName ||
    lead?.contactPerson ||
    "Lead Details";

  const getStatus = () =>
    lead?.status ||
    lead?.leadStatus ||
    "NEW";

  const getStatusVariant = () => {
    const status = getStatus().toLowerCase();

    if (["converted", "won", "closed_won"].includes(status)) {
      return "success";
    }

    if (["lost", "closed_lost", "cancelled"].includes(status)) {
      return "danger";
    }

    if (
      ["in_progress", "follow_up", "contacted"].includes(status)
    ) {
      return "warning";
    }

    return "default";
  };

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
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
      return "—";
    }

    return parsedDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (authLoading || loading) {
    return (
      <div className="employee-lead-details-loading">
        <Loader />
      </div>
    );
  }

  if (error || !lead) {
    return (
      <MainLayout
        user={user}
        onLogout={handleLogout}
        onSearch={() => {}}
        notificationCount={0}
      >
        <div className="employee-lead-details-error">
          <h2>Unable to load lead</h2>
          <p>{error || "Lead not found."}</p>

          <Button
            type="button"
            variant="secondary"
            onClick={handleBack}
          >
            Back to Leads
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      user={user}
      onLogout={handleLogout}
      onSearch={() => {}}
      notificationCount={0}
    >
      <div className="employee-lead-details-page">
        <div className="employee-lead-details-header">
          <div>
            <button
              type="button"
              className="employee-lead-back"
              onClick={handleBack}
            >
              ← Back to Leads
            </button>

            <div className="employee-lead-title-row">
              <div>
                <span className="employee-lead-eyebrow">
                  Lead Details
                </span>

                <h1>{getLeadName()}</h1>
              </div>

              <Badge variant={getStatusVariant()}>
                {getStatus().replaceAll("_", " ")}
              </Badge>
            </div>
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={loadLeadDetails}
          >
            Refresh
          </Button>
        </div>

        <div className="employee-lead-details-grid">
          <section className="employee-lead-details-card">
            <div className="employee-lead-card-header">
              <div>
                <h2>Lead Information</h2>
                <p>Basic information about this lead.</p>
              </div>
            </div>

            <div className="employee-lead-info-grid">
              <div className="employee-lead-info-item">
                <span>Name</span>
                <strong>{getLeadName()}</strong>
              </div>

              <div className="employee-lead-info-item">
                <span>Phone</span>
                <strong>
                  {lead?.phone ||
                    lead?.mobile ||
                    lead?.contactNumber ||
                    "—"}
                </strong>
              </div>

              <div className="employee-lead-info-item">
                <span>Email</span>
                <strong>{lead?.email || "—"}</strong>
              </div>

              <div className="employee-lead-info-item">
                <span>Source</span>
                <strong>{lead?.source || "—"}</strong>
              </div>

              <div className="employee-lead-info-item">
                <span>City</span>
                <strong>
                  {lead?.city ||
                    lead?.location ||
                    "—"}
                </strong>
              </div>

              <div className="employee-lead-info-item">
                <span>Created</span>
                <strong>
                  {formatDate(
                    lead?.createdAt ||
                      lead?.createdDate
                  )}
                </strong>
              </div>

              <div className="employee-lead-info-item">
                <span>Assigned To</span>
                <strong>
                  {lead?.assignedTo?.name ||
                    lead?.assignedTo?.fullName ||
                    lead?.assignedToName ||
                    "You"}
                </strong>
              </div>

              <div className="employee-lead-info-item">
                <span>Last Updated</span>
                <strong>
                  {formatDate(
                    lead?.updatedAt ||
                      lead?.updatedDate
                  )}
                </strong>
              </div>
            </div>

            {(lead?.address || lead?.notes || lead?.description) && (
              <div className="employee-lead-extra-info">
                {lead?.address && (
                  <div>
                    <span>Address</span>
                    <p>{lead.address}</p>
                  </div>
                )}

                {(lead?.notes || lead?.description) && (
                  <div>
                    <span>Notes</span>
                    <p>
                      {lead?.notes || lead?.description}
                    </p>
                  </div>
                )}
              </div>
            )}
          </section>

          <section className="employee-lead-details-card">
            <div className="employee-lead-card-header">
              <div>
                <h2>Lead Summary</h2>
                <p>Solar requirement information.</p>
              </div>
            </div>

            <div className="employee-lead-summary">
              <div>
                <span>System Type</span>
                <strong>
                  {lead?.systemType ||
                    lead?.solarSystemType ||
                    "—"}
                </strong>
              </div>

              <div>
                <span>Required Capacity</span>
                <strong>
                  {lead?.requiredCapacity ||
                    lead?.capacity ||
                    lead?.systemCapacity
                    ? `${
                        lead?.requiredCapacity ||
                        lead?.capacity ||
                        lead?.systemCapacity
                      } kW`
                    : "—"}
                </strong>
              </div>

              <div>
                <span>Follow-up Date</span>
                <strong>
                  {formatDate(
                    lead?.followUpDate ||
                      lead?.nextFollowUpDate
                  )}
                </strong>
              </div>

              <div>
                <span>Priority</span>
                <strong>
                  {lead?.priority || "Normal"}
                </strong>
              </div>
            </div>
          </section>
        </div>

        <section className="employee-lead-details-card employee-lead-activities">
          <div className="employee-lead-card-header">
            <div>
              <h2>Activity History</h2>
              <p>Recent activities recorded for this lead.</p>
            </div>

            <span className="employee-lead-activity-count">
              {activities.length} Activities
            </span>
          </div>

          {activities.length === 0 ? (
            <div className="employee-lead-no-activities">
              No activities recorded yet.
            </div>
          ) : (
            <div className="employee-lead-timeline">
              {activities.map((activity, index) => (
                <div
                  className="employee-lead-timeline-item"
                  key={
                    activity?._id ||
                    activity?.id ||
                    index
                  }
                >
                  <div className="employee-lead-timeline-dot" />

                  <div className="employee-lead-timeline-content">
                    <div className="employee-lead-timeline-top">
                      <strong>
                        {activity?.type ||
                          activity?.activityType ||
                          "Activity"}
                      </strong>

                      <span>
                        {formatDateTime(
                          activity?.createdAt ||
                            activity?.date ||
                            activity?.activityDate
                        )}
                      </span>
                    </div>

                    <p>
                      {activity?.description ||
                        activity?.notes ||
                        activity?.remarks ||
                        "No description available."}
                    </p>

                    {(activity?.createdBy?.name ||
                      activity?.performedBy?.name ||
                      activity?.user?.name) && (
                      <small>
                        By{" "}
                        {activity?.createdBy?.name ||
                          activity?.performedBy?.name ||
                          activity?.user?.name}
                      </small>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </MainLayout>
  );
};

export default LeadDetailsPage;