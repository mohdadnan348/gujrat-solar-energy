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

  const [lead, setLead] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);
  const [error, setError] = useState("");

  const leadId = params?.id;

  const loadLead = async () => {
    if (!leadId) return;

    try {
      setLoading(true);
      setError("");

      const response = await leadService.getLeadById(leadId);

      const data =
        response?.data?.lead ||
        response?.lead ||
        response?.data ||
        response;

      setLead(data || null);
    } catch (err) {
      console.error("Lead details error:", err);

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

      let response;

      if (
        typeof leadActivityService.getActivitiesByLead ===
        "function"
      ) {
        response =
          await leadActivityService.getActivitiesByLead(
            leadId
          );
      } else if (
        typeof leadActivityService.getLeadActivities ===
        "function"
      ) {
        response =
          await leadActivityService.getLeadActivities(
            leadId
          );
      }

      const data =
        response?.data?.activities ||
        response?.activities ||
        response?.data?.items ||
        response?.items ||
        response?.data ||
        [];

      setActivities(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Lead activities error:", err);
      setActivities([]);
    } finally {
      setActivityLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user && leadId) {
      loadLead();
      loadActivities();
    }
  }, [authLoading, user, leadId]);

  const handleLogout = async () => {
    await logout();
  };

  const handleRefresh = () => {
    loadLead();
    loadActivities();
  };

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getLeadName = () =>
    lead?.name ||
    lead?.customerName ||
    lead?.customer?.name ||
    "Unnamed Lead";

  const getLeadNumber = () =>
    lead?.leadNumber ||
    lead?.leadNo ||
    lead?.referenceNumber ||
    "—";

  const getStatus = () =>
    lead?.status ||
    lead?.leadStatus ||
    "NEW";

  const getPriority = () =>
    lead?.priority || "MEDIUM";

  const getAssignedEmployee = () =>
    lead?.assignedTo?.name ||
    lead?.assignedTo?.fullName ||
    lead?.assignedEmployee?.name ||
    lead?.employee?.name ||
    "Unassigned";

  const getBadgeVariant = (value) => {
    const status = String(value).toLowerCase();

    if (
      [
        "won",
        "converted",
        "accepted",
        "completed",
      ].includes(status)
    ) {
      return "success";
    }

    if (
      [
        "lost",
        "rejected",
        "cancelled",
        "overdue",
      ].includes(status)
    ) {
      return "danger";
    }

    if (
      [
        "qualified",
        "contacted",
        "quotation",
        "site_visit",
        "in_progress",
        "high",
      ].includes(status)
    ) {
      return "warning";
    }

    return "default";
  };

  const getActivityTitle = (activity) =>
    activity?.title ||
    activity?.activityType ||
    activity?.type ||
    "Activity";

  const getActivityDescription = (activity) =>
    activity?.description ||
    activity?.remarks ||
    activity?.note ||
    activity?.message ||
    "No description available.";

  const getActivityUser = (activity) =>
    activity?.createdBy?.name ||
    activity?.createdBy?.fullName ||
    activity?.user?.name ||
    activity?.employee?.name ||
    "System";

  if (authLoading || loading) {
    return (
      <div className="manager-lead-details-loading">
        <Loader />
      </div>
    );
  }

  return (
    <MainLayout
      user={user}
      onLogout={handleLogout}
      notificationCount={0}
    >
      <div className="manager-lead-details-page">
        <div className="manager-lead-details-header">
          <div>
            <button
              type="button"
              className="manager-lead-back-button"
              onClick={() =>
                router.push("/manager/leads")
              }
            >
              ← Back to Leads
            </button>

            <span className="manager-lead-details-eyebrow">
              Manager Portal
            </span>

            <div className="manager-lead-title-row">
              <div>
                <h1>{getLeadName()}</h1>

                <p>
                  Lead No. {getLeadNumber()}
                </p>
              </div>

              <Badge
                variant={getBadgeVariant(getStatus())}
              >
                {String(getStatus()).replaceAll(
                  "_",
                  " "
                )}
              </Badge>
            </div>
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={handleRefresh}
          >
            Refresh
          </Button>
        </div>

        {error && (
          <div className="manager-lead-details-error">
            <span>{error}</span>

            <Button
              type="button"
              variant="secondary"
              onClick={loadLead}
            >
              Retry
            </Button>
          </div>
        )}

        {!lead ? (
          <div className="manager-lead-empty">
            <div className="manager-lead-empty-icon">
              !
            </div>

            <h2>Lead not found</h2>

            <p>
              The requested lead could not be found.
            </p>

            <Button
              type="button"
              onClick={() =>
                router.push("/manager/leads")
              }
            >
              Back to Leads
            </Button>
          </div>
        ) : (
          <div className="manager-lead-details-grid">
            <main className="manager-lead-main-column">
              <section className="manager-lead-info-card">
                <div className="manager-lead-card-header">
                  <div>
                    <h2>Lead Information</h2>
                    <p>
                      Customer and lead information
                    </p>
                  </div>
                </div>

                <div className="manager-lead-info-grid">
                  <div className="manager-lead-info-item">
                    <span>Customer Name</span>
                    <strong>{getLeadName()}</strong>
                  </div>

                  <div className="manager-lead-info-item">
                    <span>Lead Number</span>
                    <strong>{getLeadNumber()}</strong>
                  </div>

                  <div className="manager-lead-info-item">
                    <span>Company Name</span>
                    <strong>
                      {lead?.companyName || "—"}
                    </strong>
                  </div>

                  <div className="manager-lead-info-item">
                    <span>Mobile</span>
                    <strong>
                      {lead?.phone ||
                        lead?.mobile ||
                        lead?.contactNumber ||
                        "—"}
                    </strong>
                  </div>

                  <div className="manager-lead-info-item">
                    <span>Email</span>
                    <strong>
                      {lead?.email || "—"}
                    </strong>
                  </div>

                  <div className="manager-lead-info-item">
                    <span>City</span>
                    <strong>
                      {lead?.city ||
                        lead?.address?.city ||
                        "—"}
                    </strong>
                  </div>

                  <div className="manager-lead-info-item">
                    <span>Lead Source</span>
                    <strong>
                      {lead?.source || "—"}
                    </strong>
                  </div>

                  <div className="manager-lead-info-item">
                    <span>Assigned Employee</span>
                    <strong>
                      {getAssignedEmployee()}
                    </strong>
                  </div>

                  <div className="manager-lead-info-item">
                    <span>Created At</span>
                    <strong>
                      {formatDate(lead?.createdAt)}
                    </strong>
                  </div>

                  <div className="manager-lead-info-item">
                    <span>Updated At</span>
                    <strong>
                      {formatDate(lead?.updatedAt)}
                    </strong>
                  </div>
                </div>

                <div className="manager-lead-description">
                  <span>Address</span>

                  <p>
                    {lead?.address?.fullAddress ||
                      lead?.address ||
                      "No address available."}
                  </p>
                </div>
              </section>

              <section className="manager-lead-info-card">
                <div className="manager-lead-card-header">
                  <div>
                    <h2>Solar Requirement</h2>
                    <p>
                      Requirement information captured
                      from the lead
                    </p>
                  </div>
                </div>

                <div className="manager-lead-info-grid">
                  <div className="manager-lead-info-item">
                    <span>Required Capacity</span>
                    <strong>
                      {lead?.requiredKW ||
                        lead?.systemSize ||
                        lead?.solarCapacity ||
                        "—"}
                    </strong>
                  </div>

                  <div className="manager-lead-info-item">
                    <span>Monthly Electricity Bill</span>
                    <strong>
                      {lead?.monthlyBill
                        ? `₹${lead.monthlyBill}`
                        : "—"}
                    </strong>
                  </div>

                  <div className="manager-lead-info-item">
                    <span>Roof Type</span>
                    <strong>
                      {lead?.roofType || "—"}
                    </strong>
                  </div>

                  <div className="manager-lead-info-item">
                    <span>Property Type</span>
                    <strong>
                      {lead?.propertyType ||
                        lead?.siteType ||
                        "—"}
                    </strong>
                  </div>
                </div>

                <div className="manager-lead-description">
                  <span>Requirement / Notes</span>

                  <p>
                    {lead?.requirement ||
                      lead?.description ||
                      lead?.notes ||
                      "No requirement notes available."}
                  </p>
                </div>
              </section>

              <section className="manager-lead-info-card">
                <div className="manager-lead-card-header">
                  <div>
                    <h2>Activity History</h2>
                    <p>
                      Follow-ups and actions recorded
                      against this lead
                    </p>
                  </div>
                </div>

                {activityLoading ? (
                  <div className="manager-lead-activity-loader">
                    <Loader />
                  </div>
                ) : activities.length === 0 ? (
                  <div className="manager-lead-no-activity">
                    <div>⌁</div>
                    <h3>No activities yet</h3>
                    <p>
                      There is no activity history
                      available for this lead.
                    </p>
                  </div>
                ) : (
                  <div className="manager-lead-activity-list">
                    {activities.map(
                      (activity, index) => (
                        <div
                          className="manager-lead-activity-item"
                          key={
                            activity?._id ||
                            activity?.id ||
                            index
                          }
                        >
                          <div className="manager-lead-activity-dot" />

                          <div className="manager-lead-activity-content">
                            <div className="manager-lead-activity-top">
                              <h3>
                                {getActivityTitle(
                                  activity
                                )}
                              </h3>

                              <span>
                                {formatDateTime(
                                  activity?.createdAt ||
                                    activity?.date
                                )}
                              </span>
                            </div>

                            <p>
                              {getActivityDescription(
                                activity
                              )}
                            </p>

                            <small>
                              By{" "}
                              {getActivityUser(
                                activity
                              )}
                            </small>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </section>
            </main>

            <aside className="manager-lead-sidebar">
              <section className="manager-lead-summary-card">
                <div className="manager-lead-summary-icon">
                  L
                </div>

                <span>Current Status</span>

                <strong>
                  {String(getStatus()).replaceAll(
                    "_",
                    " "
                  )}
                </strong>

                <Badge
                  variant={getBadgeVariant(
                    getStatus()
                  )}
                >
                  Lead Status
                </Badge>
              </section>

              <section className="manager-lead-side-card">
                <h3>Lead Summary</h3>

                <div className="manager-lead-side-row">
                  <span>Priority</span>

                  <Badge
                    variant={getBadgeVariant(
                      getPriority()
                    )}
                  >
                    {String(
                      getPriority()
                    ).replaceAll("_", " ")}
                  </Badge>
                </div>

                <div className="manager-lead-side-row">
                  <span>Assigned To</span>
                  <strong>
                    {getAssignedEmployee()}
                  </strong>
                </div>

                <div className="manager-lead-side-row">
                  <span>Follow-up</span>
                  <strong>
                    {formatDate(
                      lead?.followUpDate
                    )}
                  </strong>
                </div>

                <div className="manager-lead-side-row">
                  <span>Created</span>
                  <strong>
                    {formatDate(lead?.createdAt)}
                  </strong>
                </div>

                <div className="manager-lead-side-row">
                  <span>Last Updated</span>
                  <strong>
                    {formatDate(lead?.updatedAt)}
                  </strong>
                </div>
              </section>
            </aside>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default LeadDetailsPage;