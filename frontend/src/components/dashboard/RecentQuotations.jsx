"use client";

import React from "react";
import Link from "next/link";
import Badge from "@/components/common/Badge";
import "./RecentQuotations.css";

const RecentQuotations = ({
  quotations = [],
  loading = false,
  title = "Recent Quotations",
  viewAllHref = "/quotations",
}) => {
  const getQuotationId = (quotation) =>
    quotation?._id ||
    quotation?.id ||
    quotation?.quotationId;

  const getQuotationNumber = (quotation) =>
    quotation?.quotationNumber ||
    quotation?.quotationNo ||
    quotation?.number ||
    "Quotation";

  const getCustomerName = (quotation) =>
    quotation?.customerName ||
    quotation?.customer?.name ||
    quotation?.customer?.companyName ||
    quotation?.lead?.name ||
    "Customer";

  const getAmount = (quotation) => {
    const amount =
      quotation?.grandTotal ??
      quotation?.totalAmount ??
      quotation?.total ??
      quotation?.amount ??
      0;

    return Number(amount);
  };

  const formatAmount = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;
  };

  const getStatus = (quotation) =>
    quotation?.status ||
    quotation?.quotationStatus ||
    "Draft";

  const getStatusVariant = (status) => {
    const normalized = String(status || "").toLowerCase();

    if (
      normalized.includes("approved") ||
      normalized.includes("accepted") ||
      normalized.includes("sent")
    ) {
      return "success";
    }

    if (
      normalized.includes("rejected") ||
      normalized.includes("cancelled") ||
      normalized.includes("expired")
    ) {
      return "danger";
    }

    if (
      normalized.includes("pending") ||
      normalized.includes("review")
    ) {
      return "warning";
    }

    return "info";
  };

  const getStatusLabel = (status) => {
    if (!status) return "Draft";

    return String(status)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  if (loading) {
    return (
      <div className="gse-recent-quotations">
        <div className="gse-recent-quotations-header">
          <div>
            <div className="gse-recent-quotations-title-skeleton" />
            <div className="gse-recent-quotations-subtitle-skeleton" />
          </div>

          <div className="gse-recent-quotations-link-skeleton" />
        </div>

        <div className="gse-recent-quotations-list">
          {[1, 2, 3, 4].map((item) => (
            <div
              className="gse-recent-quotation-skeleton"
              key={item}
            >
              <div className="gse-recent-quotation-main-skeleton">
                <span />
                <span />
              </div>

              <div className="gse-recent-quotation-amount-skeleton" />
              <div className="gse-recent-quotation-status-skeleton" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="gse-recent-quotations">
      <div className="gse-recent-quotations-header">
        <div>
          <h3>{title}</h3>
          <p>Latest quotations created in the system</p>
        </div>

        <Link
          href={viewAllHref}
          className="gse-recent-quotations-view-all"
        >
          View All
          <span aria-hidden="true">→</span>
        </Link>
      </div>

      {quotations.length === 0 ? (
        <div className="gse-recent-quotations-empty">
          <div className="gse-recent-quotations-empty-icon">
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
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="8" y1="13" x2="16" y2="13" />
              <line x1="8" y1="17" x2="14" y2="17" />
            </svg>
          </div>

          <strong>No recent quotations</strong>
          <span>New quotations will appear here.</span>
        </div>
      ) : (
        <div className="gse-recent-quotations-list">
          {quotations.map((quotation, index) => {
            const quotationId = getQuotationId(quotation);
            const status = getStatus(quotation);

            const content = (
              <>
                <div className="gse-recent-quotation-main">
                  <div className="gse-recent-quotation-number">
                    {getQuotationNumber(quotation)}
                  </div>

                  <div className="gse-recent-quotation-customer">
                    {getCustomerName(quotation)}
                  </div>
                </div>

                <div className="gse-recent-quotation-amount">
                  {formatAmount(getAmount(quotation))}
                </div>

                <Badge
                  variant={getStatusVariant(status)}
                  size="small"
                >
                  {getStatusLabel(status)}
                </Badge>
              </>
            );

            if (quotationId) {
              return (
                <Link
                  href={`/quotations/${quotationId}`}
                  className="gse-recent-quotation"
                  key={quotationId}
                >
                  {content}
                </Link>
              );
            }

            return (
              <div
                className="gse-recent-quotation"
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

export default RecentQuotations;