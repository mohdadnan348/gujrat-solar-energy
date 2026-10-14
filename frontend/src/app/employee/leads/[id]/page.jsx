"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import Loader from "@/components/common/Loader";

import leadService from "@/services/lead.service";
import leadActivityService from "@/services/leadActivity.service";

import "./lead-details.css";

function unwrapObject(response) {
  let value = response;
  for (let i = 0; i < 3 && value && typeof value === "object" && !Array.isArray(value); i += 1) {
    if (value.data && typeof value.data === "object") value = value.data;
    else break;
  }
  return value;
}

function unwrapArray(response, keys = []) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  for (const key of keys) {
    if (Array.isArray(response?.[key])) return response[key];
    if (Array.isArray(response?.data?.[key])) return response.data[key];
  }
  return [];
}

function displayValue(value, fallback = "—") {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value === "object") {
    return value.name || value.fullName || value.username || value.email || fallback;
  }
  return String(value);
}

function formatStatus(status) {
  return String(status || "NEW")
    .replace(/[_-]+/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function statusVariant(status) {
  const value = String(status || "").toLowerCase();
  if (value.includes("won") || value.includes("qualified") || value.includes("complete")) return "success";
  if (value.includes("lost") || value.includes("reject") || value.includes("cancel")) return "danger";
  if (value.includes("contact") || value.includes("visit") || value.includes("progress")) return "warning";
  return "info";
}

function formatDate(value, includeTime = false) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", includeTime
    ? { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }
    : { day: "2-digit", month: "short", year: "numeric" });
}

export default function EmployeeLeadDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const leadId = params?.id;

  const [lead, setLead] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(false);
  const [error, setError] = useState("");
  const [activityError, setActivityError] = useState("");

  const loadLead = useCallback(async () => {
    if (!leadId) {
      setError("Lead ID is missing from the URL.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await leadService.getLeadById(leadId);
      const data = unwrapObject(response);
      if (!data || typeof data !== "object" || Array.isArray(data) || !(data._id || data.id || data.leadId)) {
        throw new Error("Lead details were not found.");
      }
      setLead(data);
    } catch (err) {
      console.error("Failed to load employee lead details:", err);
      const status = err?.response?.status;
      const message = err?.response?.data?.message;
      if (status === 401) setError(message || "Your session has expired. Please sign in again.");
      else if (status === 403) setError(message || "You are not authorized to view this lead.");
      else if (status === 404) setError(message || "This lead was not found or is no longer available to you.");
      else setError(message || err?.message || "Unable to load lead details. Please try again.");
      setLead(null);
    } finally {
      setLoading(false);
    }
  }, [leadId]);

  const loadActivities = useCallback(async () => {
    if (!leadId) return;
    setActivityLoading(true);
    setActivityError("");
    try {
      const response = await leadActivityService.getLeadActivities(leadId);
      setActivities(unwrapArray(response, ["activities", "results", "items"]));
    } catch (err) {
      console.error("Failed to load lead activity:", err);
      setActivities([]);
      setActivityError(
        err?.response?.data?.message ||
        err?.message ||
        "Activity history could not be loaded."
      );
    } finally {
      setActivityLoading(false);
    }
  }, [leadId]);

  useEffect(() => {
    loadLead();
  }, [loadLead]);

  useEffect(() => {
    if (lead) loadActivities();
  }, [lead, loadActivities]);

  const refresh = async () => {
    await loadLead();
    // Activities are refreshed by the effect after the lead is loaded.
  };

  const goBack = () => router.push("/employee/leads");

  if (loading) {
    return <div className="employee-lead-details-loading"><Loader /></div>;
  }

  if (error || !lead) {
    return (
      <main className="employee-lead-details-page">
        <button type="button" className="employee-lead-back" onClick={goBack}>← Back to My Leads</button>
        <section className="employee-lead-error-card" role="alert">
          <div className="employee-lead-error-icon">!</div>
          <h1>Unable to open lead</h1>
          <p>{error || "This lead could not be found."}</p>
          <div className="employee-lead-error-actions">
            <Button type="button" onClick={refresh}>Try Again</Button>
            <Button type="button" variant="secondary" onClick={goBack}>Back to My Leads</Button>
          </div>
        </section>
      </main>
    );
  }

  const name = lead.customerName || lead.name || lead.fullName || lead.contactPerson || "Unnamed Lead";
  const status = lead.status || lead.leadStatus || "NEW";
  const priority = lead.priority || "MEDIUM";
  const source = lead.leadSource || lead.source;

  const assigned = lead.assignedTo || lead.assignedEmployee || lead.employee;
  const assignedName = displayValue(assigned, "Unassigned");
  const phone = lead.mobile || lead.phone || lead.contactNumber || lead.mobileNumber;
  const requirement = lead.requirement || lead.solarRequirement || lead.requirementDetails;

  return (
    <main className="employee-lead-details-page">
      <header className="employee-lead-details-header">
        <div className="employee-lead-heading">
          <button type="button" className="employee-lead-back" onClick={goBack}>← Back to My Leads</button>
          <div className="employee-lead-title-row">
            <div className="employee-lead-avatar" aria-hidden="true">
              {String(name).split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "L"}
            </div>
            <div className="employee-lead-title-copy">
              <div className="employee-lead-title-line">
                <h1>{name}</h1>
                <Badge variant={statusVariant(status)}>{formatStatus(status)}</Badge>
              </div>
              <p>Lead ID: <strong>{displayValue(lead.leadNumber || lead.leadId || lead._id || lead.id)}</strong></p>
            </div>
          </div>
        </div>
        <Button type="button" variant="secondary" onClick={refresh}>↻ Refresh</Button>
      </header>

      <section className="employee-lead-summary-grid" aria-label="Lead summary">
        <article className="employee-lead-summary-card"><span>Status</span><strong><Badge variant={statusVariant(status)}>{formatStatus(status)}</Badge></strong></article>
        <article className="employee-lead-summary-card"><span>Priority</span><strong><Badge variant={String(priority).toLowerCase() === "high" || String(priority).toLowerCase() === "urgent" ? "danger" : String(priority).toLowerCase() === "medium" ? "warning" : "success"}>{formatStatus(priority)}</Badge></strong></article>
        <article className="employee-lead-summary-card"><span>Lead Source</span><strong>{displayValue(source)}</strong></article>
        <article className="employee-lead-summary-card"><span>Next Follow-up</span><strong>{formatDate(lead.followUpDate || lead.nextFollowUpDate)}</strong></article>
      </section>

      <div className="employee-lead-details-layout">
        <div className="employee-lead-main-column">
          <section className="employee-lead-card">
            <div className="employee-lead-card-header"><div><h2>Lead Information</h2><p>Customer and solar requirement details.</p></div></div>
            <div className="employee-lead-detail-grid">
              <div className="employee-lead-detail-item"><span>Customer Name</span><strong>{name}</strong></div>
              <div className="employee-lead-detail-item"><span>Company Name</span><strong>{displayValue(lead.companyName)}</strong></div>
              <div className="employee-lead-detail-item"><span>Phone</span><strong>{displayValue(phone)}</strong></div>
              <div className="employee-lead-detail-item"><span>Email</span><strong>{displayValue(lead.email)}</strong></div>
              <div className="employee-lead-detail-item"><span>City</span><strong>{displayValue(lead.city)}</strong></div>
              <div className="employee-lead-detail-item"><span>State</span><strong>{displayValue(lead.state)}</strong></div>
              <div className="employee-lead-detail-item"><span>Source</span><strong>{displayValue(source)}</strong></div>
              <div className="employee-lead-detail-item"><span>Solar Capacity</span><strong>{displayValue(lead.kiloWatt || lead.kw || lead.capacityKw || lead.systemCapacity, "—")}</strong></div>
              <div className="employee-lead-detail-item employee-lead-detail-full"><span>Address</span><strong>{displayValue(lead.address)}</strong></div>
              <div className="employee-lead-detail-item employee-lead-detail-full"><span>Solar Requirement</span><strong>{displayValue(requirement)}</strong></div>
              <div className="employee-lead-detail-item"><span>Created At</span><strong>{formatDate(lead.createdAt, true)}</strong></div>
              <div className="employee-lead-detail-item"><span>Last Updated</span><strong>{formatDate(lead.updatedAt, true)}</strong></div>
            </div>
          </section>

          <section className="employee-lead-card">
            <div className="employee-lead-card-header"><div><h2>Assignment</h2><p>Current lead ownership.</p></div></div>
            <div className="employee-lead-assignee">
              <div className="employee-lead-assignee-avatar">{String(assignedName).split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "U"}</div>
              <div><span>Currently Assigned To</span><strong>{assignedName}</strong>{assigned && typeof assigned === "object" && assigned.email && <small>{assigned.email}</small>}</div>
            </div>
          </section>

          <section className="employee-lead-card">
            <div className="employee-lead-card-header"><div><h2>Notes</h2><p>Additional information for this lead.</p></div></div>
            <div className="employee-lead-notes">{lead.notes ? <p>{lead.notes}</p> : <span>No notes have been added.</span>}</div>
          </section>

          <section className="employee-lead-card">
            <div className="employee-lead-card-header"><div><h2>Activity History</h2><p>Updates recorded for this lead.</p></div></div>
            {activityLoading ? <div className="employee-lead-activity-loading"><Loader /></div> :
              activityError ? <div className="employee-lead-empty"><h3>Activity history unavailable</h3><p>{activityError}</p><Button type="button" variant="secondary" onClick={loadActivities}>Retry</Button></div> :
              activities.length === 0 ? <div className="employee-lead-empty"><h3>No activities yet</h3><p>No activity has been recorded for this lead.</p></div> :
              <div className="employee-lead-activity-list">
                {activities.map((activity, index) => {
                  const actor = activity.createdBy || activity.performedBy || activity.user;
                  const title = activity.title || activity.action || activity.type || activity.activityType || "Lead Activity";
                  const description = activity.description || activity.notes || activity.message || activity.details;
                  return <article className="employee-lead-activity-item" key={activity._id || activity.id || index}>
                    <span className="employee-lead-activity-dot" />
                    <div className="employee-lead-activity-content">
                      <div className="employee-lead-activity-top"><div><h3>{formatStatus(title)}</h3>{actor && <span>By {displayValue(actor, "Unknown user")}</span>}</div><time>{formatDate(activity.createdAt || activity.date || activity.activityDate, true)}</time></div>
                      {description && <p>{description}</p>}
                    </div>
                  </article>;
                })}
              </div>
            }
          </section>
        </div>

        <aside className="employee-lead-sidebar">
          <section className="employee-lead-card">
            <div className="employee-lead-card-header"><div><h2>Lead Summary</h2><p>Quick overview.</p></div></div>
            <div className="employee-lead-summary-list">
              <div><span>Lead ID</span><strong>{displayValue(lead.leadNumber || lead.leadId || lead._id)}</strong></div>
              <div><span>Status</span><strong>{formatStatus(status)}</strong></div>
              <div><span>Priority</span><strong>{formatStatus(priority)}</strong></div>
              <div><span>Assigned To</span><strong>{assignedName}</strong></div>
              <div><span>Created</span><strong>{formatDate(lead.createdAt)}</strong></div>
              <div><span>Activities</span><strong>{activities.length}</strong></div>
            </div>
          </section>
          <section className="employee-lead-card">
            <div className="employee-lead-card-header"><div><h2>Contact</h2><p>Customer contact options.</p></div></div>
            <div className="employee-lead-contact-actions">
              {phone && <a href={`tel:${String(phone).replace(/[^\d+]/g, "")}`} className="employee-lead-contact-link"><span>☎</span><div><small>Call Customer</small><strong>{phone}</strong></div></a>}
              {lead.email && <a href={`mailto:${lead.email}`} className="employee-lead-contact-link"><span>✉</span><div><small>Email Customer</small><strong>{lead.email}</strong></div></a>}
              {!phone && !lead.email && <p className="employee-lead-no-contact">No contact details available.</p>}
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
