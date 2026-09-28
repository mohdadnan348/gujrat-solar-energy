"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import Loader from "@/components/common/Loader";

import leadService from "@/services/lead.service";
import leadActivityService from "@/services/leadActivity.service";

import "./lead-details.css";

const LeadDetailsPage = () => {
  const params = useParams();
  const router = useRouter();

  const leadId = params?.id;

  const [lead, setLead] = useState(null);
  const [activities, setActivities] = useState([]);

  const [loading, setLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(false);
  const [error, setError] = useState("");

  // =========================================================
  // LOAD LEAD
  // =========================================================

  const loadLeadDetails = async () => {
    if (!leadId) return;

    try {
      setLoading(true);
      setError("");

      const response = await leadService.getLeadById(leadId);

      const leadData =
        response?.data?.lead ||
        response?.lead ||
        response?.data ||
        null;

      if (!leadData) {
        throw new Error("Lead not found.");
      }

      setLead(leadData);
    } catch (err) {
      console.error("Failed to load lead:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load lead details."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD ACTIVITIES
  // =========================================================

  const loadActivities = async () => {
    if (!leadId) return;

    try {
      setActivityLoading(true);

      const response =
        await leadActivityService.getActivitiesByLead(leadId);

      const activityData =
        response?.data?.activities ||
        response?.activities ||
        response?.data ||
        [];

      setActivities(
        Array.isArray(activityData)
          ? activityData
          : []
      );
    } catch (err) {
      /*
       * Activity API fail hone par Lead Details
       * page ko fail nahi karna hai.
       */
      console.warn(
        "Lead activity API unavailable:",
        err?.response?.status,
        err?.config?.url
      );

      setActivities([]);
    } finally {
      setActivityLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    if (!leadId) return;

    loadLeadDetails();
    loadActivities();
  }, [leadId]);

  // =========================================================
  // REFRESH
  // =========================================================

  const handleRefresh = async () => {
    await Promise.allSettled([
      loadLeadDetails(),
      loadActivities(),
    ]);
  };

  // =========================================================
  // BACK
  // =========================================================

  const handleBack = () => {
    router.push("/employee/leads");
  };

  // =========================================================
  // HELPERS
  // =========================================================

  const getLeadName = () => {
    return (
      lead?.customerName ||
      lead?.name ||
      lead?.contactPerson ||
      "Lead Details"
    );
  };

  const getStatus = () => {
    return (
      lead?.status ||
      lead?.leadStatus ||
      "New"
    );
  };

  const getStatusVariant = () => {
    const status = String(
      getStatus()
    ).toLowerCase();

    if (
      [
        "converted",
        "won",
        "closed_won",
        "success",
      ].includes(status)
    ) {
      return "success";
    }

    if (
      [
        "lost",
        "closed_lost",
        "cancelled",
        "not interested",
      ].includes(status)
    ) {
      return "danger";
    }

    if (
      [
        "in_progress",
        "follow_up",
        "followup",
        "contacted",
        "pending",
      ].includes(status)
    ) {
      return "warning";
    }

    return "default";
  };

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return "—";
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const formatDateTime = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return "—";
    }

    return parsedDate.toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const getAssignedEmployee = () => {
    if (!lead?.assignedTo) {
      return "Not Assigned";
    }

    if (
      typeof lead.assignedTo ===
      "string"
    ) {
      return lead.assignedTo;
    }

    return (
      lead.assignedTo?.name ||
      lead.assignedTo?.fullName ||
      lead.assignedTo?.username ||
      lead.assignedTo?.email ||
      "Assigned"
    );
  };

  const getCreatedBy = () => {
    if (!lead?.createdBy) {
      return "—";
    }

    if (
      typeof lead.createdBy ===
      "string"
    ) {
      return lead.createdBy;
    }

    return (
      lead.createdBy?.name ||
      lead.createdBy?.fullName ||
      lead.createdBy?.username ||
      lead.createdBy?.email ||
      "—"
    );
  };

  const getCapacity = () => {
    const capacity =
      lead?.requiredKw ??
      lead?.requiredCapacity ??
      lead?.capacity ??
      lead?.systemCapacity;

    if (
      capacity === undefined ||
      capacity === null ||
      capacity === ""
    ) {
      return "—";
    }

    return `${capacity} kW`;
  };

  const getSystemType = () => {
    return (
      lead?.systemType ||
      lead?.solarSystemType ||
      lead?.solarRequirement
        ?.systemType ||
      "—"
    );
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="employee-lead-details-loading">
        <Loader />
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error || !lead) {
    return (
      <div className="employee-lead-details-page">
        <div className="employee-lead-details-error">

          <div className="employee-lead-error-icon">
            !
          </div>

          <h2>
            Unable to load lead
          </h2>

          <p>
            {error ||
              "Lead not found."}
          </p>

          <div className="employee-lead-error-actions">

            <Button
              type="button"
              variant="secondary"
              onClick={handleBack}
            >
              Back to Leads
            </Button>

            <Button
              type="button"
              onClick={loadLeadDetails}
            >
              Try Again
            </Button>

          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="employee-lead-details-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="employee-lead-details-header">

        <div className="employee-lead-header-left">

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

              <h1>
                {getLeadName()}
              </h1>

              {lead?.leadId && (
                <div className="employee-lead-id">
                  {lead.leadId}
                </div>
              )}

            </div>

            <Badge
              variant={getStatusVariant()}
            >
              {String(
                getStatus()
              ).replaceAll(
                "_",
                " "
              )}
            </Badge>

          </div>
        </div>

        <div className="employee-lead-header-actions">

          <Button
            type="button"
            variant="secondary"
            onClick={handleRefresh}
          >
            Refresh
          </Button>

        </div>

      </div>

      {/* =====================================================
          DETAILS GRID
      ===================================================== */}

      <div className="employee-lead-details-grid">

        {/* ===================================================
            LEAD INFORMATION
        =================================================== */}

        <section className="employee-lead-details-card">

          <div className="employee-lead-card-header">

            <div>
              <h2>
                Lead Information
              </h2>

              <p>
                Basic customer and lead
                information.
              </p>
            </div>

          </div>

          <div className="employee-lead-info-grid">

            <div className="employee-lead-info-item">
              <span>
                Customer Name
              </span>

              <strong>
                {lead?.customerName ||
                  lead?.name ||
                  "—"}
              </strong>
            </div>

            <div className="employee-lead-info-item">
              <span>
                Company Name
              </span>

              <strong>
                {lead?.companyName ||
                  "—"}
              </strong>
            </div>

            <div className="employee-lead-info-item">
              <span>
                Mobile
              </span>

              <strong>
                {lead?.mobile ||
                  lead?.phone ||
                  lead?.contactNumber ||
                  "—"}
              </strong>
            </div>

            <div className="employee-lead-info-item">
              <span>
                Alternate Mobile
              </span>

              <strong>
                {lead?.alternateMobile ||
                  "—"}
              </strong>
            </div>

            <div className="employee-lead-info-item">
              <span>
                Email
              </span>

              <strong>
                {lead?.email ||
                  "—"}
              </strong>
            </div>

            <div className="employee-lead-info-item">
              <span>
                Lead Source
              </span>

              <strong>
                {lead?.leadSource ||
                  lead?.source ||
                  "—"}
              </strong>
            </div>

            <div className="employee-lead-info-item">
              <span>
                City
              </span>

              <strong>
                {lead?.city ||
                  "—"}
              </strong>
            </div>

            <div className="employee-lead-info-item">
              <span>
                State
              </span>

              <strong>
                {lead?.state ||
                  "—"}
              </strong>
            </div>

            <div className="employee-lead-info-item">
              <span>
                Pincode
              </span>

              <strong>
                {lead?.pincode ||
                  "—"}
              </strong>
            </div>

            <div className="employee-lead-info-item">
              <span>
                Priority
              </span>

              <strong>
                {lead?.priority ||
                  "Normal"}
              </strong>
            </div>

            <div className="employee-lead-info-item">
              <span>
                Assigned To
              </span>

              <strong>
                {getAssignedEmployee()}
              </strong>
            </div>

            <div className="employee-lead-info-item">
              <span>
                Created By
              </span>

              <strong>
                {getCreatedBy()}
              </strong>
            </div>

            <div className="employee-lead-info-item">
              <span>
                Created
              </span>

              <strong>
                {formatDate(
                  lead?.createdAt ||
                    lead?.createdDate
                )}
              </strong>
            </div>

            <div className="employee-lead-info-item">
              <span>
                Last Updated
              </span>

              <strong>
                {formatDate(
                  lead?.updatedAt ||
                    lead?.updatedDate
                )}
              </strong>
            </div>

          </div>

          {/* ADDRESS / REQUIREMENT / NOTES */}

          {(lead?.address ||
            lead?.requirement ||
            lead?.notes ||
            lead?.description) && (

            <div className="employee-lead-extra-info">

              {lead?.address && (
                <div>
                  <span>
                    Address
                  </span>

                  <p>
                    {lead.address}
                  </p>
                </div>
              )}

              {lead?.requirement && (
                <div>
                  <span>
                    Requirement
                  </span>

                  <p>
                    {lead.requirement}
                  </p>
                </div>
              )}

              {(lead?.notes ||
                lead?.description) && (
                <div>
                  <span>
                    Notes
                  </span>

                  <p>
                    {lead?.notes ||
                      lead?.description}
                  </p>
                </div>
              )}

            </div>
          )}

        </section>

        {/* ===================================================
            SOLAR REQUIREMENT
        =================================================== */}

        <section className="employee-lead-details-card">

          <div className="employee-lead-card-header">

            <div>
              <h2>
                Solar Requirement
              </h2>

              <p>
                Solar requirement
                information.
              </p>
            </div>

          </div>

          <div className="employee-lead-summary">

            <div>
              <span>
                System Type
              </span>

              <strong>
                {getSystemType()}
              </strong>
            </div>

            <div>
              <span>
                Required Capacity
              </span>

              <strong>
                {getCapacity()}
              </strong>
            </div>

            <div>
              <span>
                Follow-up Date
              </span>

              <strong>
                {formatDate(
                  lead?.followUpDate ||
                    lead?.nextFollowUpDate
                )}
              </strong>
            </div>

            <div>
              <span>
                Status
              </span>

              <strong>
                {getStatus()}
              </strong>
            </div>

            <div>
              <span>
                Priority
              </span>

              <strong>
                {lead?.priority ||
                  "Normal"}
              </strong>
            </div>

            <div>
              <span>
                Lead Number
              </span>

              <strong>
                {lead?.leadId ||
                  "—"}
              </strong>
            </div>

          </div>

        </section>

      </div>

      {/* =====================================================
          ACTIVITY HISTORY
      ===================================================== */}

      <section className="employee-lead-details-card employee-lead-activities">

        <div className="employee-lead-card-header">

          <div>
            <h2>
              Activity History
            </h2>

            <p>
              Recent activities
              recorded for this lead.
            </p>
          </div>

          <span className="employee-lead-activity-count">
            {activityLoading
              ? "Loading..."
              : `${activities.length} Activities`}
          </span>

        </div>

        {activityLoading ? (
          <div className="employee-lead-no-activities">
            <Loader />
          </div>
        ) : activities.length === 0 ? (

          <div className="employee-lead-no-activities">

            <div className="employee-lead-empty-icon">
              ✓
            </div>

            <strong>
              No activities yet
            </strong>

            <p>
              Activity history for
              this lead will appear
              here.
            </p>

          </div>

        ) : (

          <div className="employee-lead-timeline">

            {activities.map(
              (activity, index) => (

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
                      activity?.createdBy?.username ||
                      activity?.performedBy?.name ||
                      activity?.user?.name) && (

                      <small>
                        By{" "}
                        {activity?.createdBy?.name ||
                          activity?.createdBy?.username ||
                          activity?.performedBy?.name ||
                          activity?.user?.name}
                      </small>

                    )}

                  </div>

                </div>
              )
            )}

          </div>
        )}

      </section>

    </div>
  );
};

export default LeadDetailsPage;