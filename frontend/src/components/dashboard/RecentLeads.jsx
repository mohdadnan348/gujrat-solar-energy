"use client";

import React from "react";
import Link from "next/link";
import Avatar from "@/components/common/Avatar";
import Badge from "@/components/common/Badge";
import "./RecentLeads.css";

const RecentLeads = ({
  leads = [],
  loading = false,
  title = "Recent Leads",
  viewAllHref = "/leads",
}) => {
  const getLeadName = (lead) =>
    lead?.name ||
    lead?.customerName ||
    lead?.contactPerson ||
    "Unnamed Lead";

  const getInitials = (lead) => {
    const name = getLeadName(lead);

    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  const getStatusVariant = (status) => {
    const normalized = String(status || "").toLowerCase();

    if (
      normalized.includes("converted") ||
      normalized.includes("won") ||
      normalized.includes("qualified")
    ) {
      return "success";
    }

    if (
      normalized.includes("lost") ||
      normalized.includes("closed") ||
      normalized.includes("rejected")
    ) {
      return "danger";
    }

    if (
      normalized.includes("follow") ||
      normalized.includes("pending")
    ) {
      return "warning";
    }

    return "info";
  };

  const getStatusLabel = (status) => {
    if (!status) return "New";

    return String(status)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const getLeadId = (lead) =>
    lead?._id || lead?.id || lead?.leadId;

  if (loading) {
    return (
      <div className="gse-recent-leads">
        <div className="gse-recent-leads-header">
          <div className="gse-recent-leads-heading-skeleton" />
          <div className="gse-recent-leads-link-skeleton" />
        </div>

        <div className="gse-recent-leads-list">
          {[1, 2, 3, 4].map((item) => (
            <div
              className="gse-recent-lead-skeleton"
              key={item}
            >
              <span className="gse-recent-lead-avatar-skeleton" />
              <div className="gse-recent-lead-content-skeleton">
                <span />
                <span />
              </div>
              <span className="gse-recent-lead-status-skeleton" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="gse-recent-leads">
      <div className="gse-recent-leads-header">
        <div>
          <h3>{title}</h3>
          <p>Latest leads added to the system</p>
        </div>

        <Link
          href={viewAllHref}
          className="gse-recent-leads-view-all"
        >
          View All
          <span aria-hidden="true">→</span>
        </Link>
      </div>

      {leads.length === 0 ? (
        <div className="gse-recent-leads-empty">
          <div className="gse-recent-leads-empty-icon">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>

          <strong>No recent leads</strong>
          <span>New leads will appear here.</span>
        </div>
      ) : (
        <div className="gse-recent-leads-list">
          {leads.map((lead, index) => {
            const leadId = getLeadId(lead);
            const status =
              lead?.status ||
              lead?.leadStatus ||
              "New";

            const content = (
              <>
                <Avatar
                  initials={getInitials(lead)}
                  size="medium"
                  shape="circle"
                />

                <div className="gse-recent-lead-info">
                  <div className="gse-recent-lead-name">
                    {getLeadName(lead)}
                  </div>

                  <div className="gse-recent-lead-meta">
                    {lead?.phone ||
                      lead?.mobile ||
                      lead?.email ||
                      "No contact information"}
                  </div>
                </div>

                <Badge
                  variant={getStatusVariant(status)}
                  size="small"
                >
                  {getStatusLabel(status)}
                </Badge>
              </>
            );

            if (leadId) {
              return (
                <Link
                  href={`/leads/${leadId}`}
                  className="gse-recent-lead"
                  key={leadId}
                >
                  {content}
                </Link>
              );
            }

            return (
              <div
                className="gse-recent-lead"
                key={index}
              >
                {content}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecentLeads;