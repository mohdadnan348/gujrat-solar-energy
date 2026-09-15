"use client";

import React, { useMemo } from "react";
import Badge from "@/components/common/Badge";
import Button from "@/components/common/Button";
import {
  formatCurrency,
  formatDate,
  formatStatus,
} from "@/utils/formatters";

const getId = (value) => {
  if (!value) return "";

  if (typeof value === "string") {
    return value;
  }

  return value?._id || value?.id || "";
};

const getValue = (quotation, keys, fallback = "") => {
  for (const key of keys) {
    const value = quotation?.[key];

    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      return value;
    }
  }

  return fallback;
};

const getNestedName = (value) => {
  if (!value) return "—";

  if (typeof value === "string") {
    return value;
  }

  return (
    value?.name ||
    value?.fullName ||
    value?.customerName ||
    value?.companyName ||
    value?._id ||
    "—"
  );
};

const getStatusVariant = (status) => {
  const normalized = String(
    status || ""
  ).toUpperCase();

  if (
    normalized === "ACCEPTED" ||
    normalized === "APPROVED"
  ) {
    return "success";
  }

  if (
    normalized === "SENT" ||
    normalized === "PENDING" ||
    normalized === "DRAFT"
  ) {
    return "warning";
  }

  if (
    normalized === "REJECTED" ||
    normalized === "CANCELLED" ||
    normalized === "EXPIRED"
  ) {
    return "danger";
  }

  return "default";
};

const QuotationTable = ({
  quotations = [],
  loading = false,
  error = "",
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  onView,
  onEdit,
  onDelete,
  onDownload,
  onSend,
  onDuplicate,
  deletingId = null,
  downloadingId = null,
  sendingId = null,
  duplicatingId = null,
  showActions = true,
  emptyMessage = "No quotations available.",
}) => {
  const normalizedQuotations = useMemo(
    () =>
      Array.isArray(quotations)
        ? quotations
        : [],
    [quotations]
  );

  const safeCurrentPage = Math.min(
    Math.max(Number(currentPage) || 1, 1),
    Math.max(Number(totalPages) || 1, 1)
  );

  const handlePageChange = (page) => {
    if (
      typeof onPageChange !== "function" ||
      page < 1 ||
      page > totalPages ||
      page === safeCurrentPage
    ) {
      return;
    }

    onPageChange(page);
  };

  if (loading) {
    return (
      <div className="quotation-table-state">
        <div className="quotation-table-spinner" />

        <p>
          Loading quotations...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quotation-table-state quotation-table-state-error">
        <div className="quotation-table-state-icon">
          !
        </div>

        <h3>
          Unable to load quotations
        </h3>

        <p>{error}</p>
      </div>
    );
  }

  if (normalizedQuotations.length === 0) {
    return (
      <div className="quotation-table-state">
        <div className="quotation-table-state-icon">
          ₹
        </div>

        <h3>
          No quotations found
        </h3>

        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="quotation-table-wrapper">
      <div className="quotation-table-scroll">
        <table className="quotation-table">
          <thead>
            <tr>
              <th>Quotation</th>
              <th>Customer</th>
              <th>Quotation Date</th>
              <th>Valid Until</th>
              <th>Status</th>
              <th className="quotation-table-amount-column">
                Total Amount
              </th>

              {showActions && (
                <th className="quotation-table-actions-column">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {normalizedQuotations.map(
              (quotation, index) => {
                const id =
                  getId(quotation) ||
                  `quotation-${index}`;

                const quotationNumber =
                  getValue(
                    quotation,
                    [
                      "quotationNumber",
                      "quotationNo",
                      "quoteNumber",
                      "number",
                    ],
                    `Quotation ${index + 1}`
                  );

                const customer =
                  getValue(
                    quotation,
                    [
                      "customer",
                      "customerId",
                      "customerName",
                    ],
                    null
                  );

                const customerName =
                  typeof customer === "object"
                    ? getNestedName(customer)
                    : customer ||
                      getValue(
                        quotation,
                        ["name"],
                        "—"
                      );

                const customerPhone =
                  customer?.phone ||
                  customer?.mobile ||
                  customer?.mobileNumber ||
                  quotation?.phone ||
                  quotation?.mobile ||
                  "";

                const quotationDate =
                  getValue(
                    quotation,
                    [
                      "quotationDate",
                      "quoteDate",
                      "date",
                      "createdAt",
                    ],
                    null
                  );

                const validUntil =
                  getValue(
                    quotation,
                    [
                      "validUntil",
                      "validityDate",
                      "expiryDate",
                      "expiresAt",
                    ],
                    null
                  );

                const status =
                  getValue(
                    quotation,
                    ["status"],
                    "DRAFT"
                  );

                const totalAmount =
                  getValue(
                    quotation,
                    [
                      "grandTotal",
                      "totalAmount",
                      "netAmount",
                      "total",
                    ],
                    0
                  );

                const isDeleting =
                  deletingId === id;

                const isDownloading =
                  downloadingId === id;

                const isSending =
                  sendingId === id;

                const isDuplicating =
                  duplicatingId === id;

                return (
                  <tr key={id}>
                    <td>
                      <div className="quotation-table-primary">
                        <button
                          type="button"
                          className="quotation-table-link"
                          onClick={() =>
                            onView?.(quotation)
                          }
                          title="View quotation"
                        >
                          {quotationNumber}
                        </button>

                        {quotation?.systemConfiguration ||
                          quotation?.systemConfigurationId ? (
                          <span className="quotation-table-secondary">
                            System configuration linked
                          </span>
                        ) : null}
                      </div>
                    </td>

                    <td>
                      <div className="quotation-table-customer">
                        <strong>
                          {customerName}
                        </strong>

                        {customerPhone && (
                          <span>
                            {customerPhone}
                          </span>
                        )}
                      </div>
                    </td>

                    <td>
                      <span className="quotation-table-date">
                        {formatDate(
                          quotationDate
                        )}
                      </span>
                    </td>

                    <td>
                      <span className="quotation-table-date">
                        {formatDate(
                          validUntil
                        )}
                      </span>
                    </td>

                    <td>
                      <Badge
                        variant={getStatusVariant(
                          status
                        )}
                        size="small"
                        dot
                      >
                        {formatStatus(
                          status,
                          "Draft"
                        )}
                      </Badge>
                    </td>

                    <td className="quotation-table-amount">
                      {formatCurrency(
                        totalAmount
                      )}
                    </td>

                    {showActions && (
                      <td>
                        <div className="quotation-table-actions">
                          {typeof onView ===
                            "function" && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="small"
                              onClick={() =>
                                onView(
                                  quotation
                                )
                              }
                              title="View quotation"
                            >
                              View
                            </Button>
                          )}

                          {typeof onEdit ===
                            "function" && (
                            <Button
                              type="button"
                              variant="secondary"
                              size="small"
                              onClick={() =>
                                onEdit(
                                  quotation
                                )
                              }
                              title="Edit quotation"
                            >
                              Edit
                            </Button>
                          )}

                          {typeof onDownload ===
                            "function" && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="small"
                              loading={
                                isDownloading
                              }
                              onClick={() =>
                                onDownload(
                                  quotation
                                )
                              }
                              disabled={
                                isDownloading
                              }
                              title="Download quotation PDF"
                            >
                              PDF
                            </Button>
                          )}

                          {typeof onSend ===
                            "function" &&
                            String(
                              status
                            ).toUpperCase() ===
                              "DRAFT" && (
                              <Button
                                type="button"
                                variant="primary"
                                size="small"
                                loading={
                                  isSending
                                }
                                onClick={() =>
                                  onSend(
                                    quotation
                                  )
                                }
                                disabled={
                                  isSending
                                }
                                title="Send quotation"
                              >
                                Send
                              </Button>
                            )}

                          {typeof onDuplicate ===
                            "function" && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="small"
                              loading={
                                isDuplicating
                              }
                              onClick={() =>
                                onDuplicate(
                                  quotation
                                )
                              }
                              disabled={
                                isDuplicating
                              }
                              title="Duplicate quotation"
                            >
                              Duplicate
                            </Button>
                          )}

                          {typeof onDelete ===
                            "function" && (
                            <Button
                              type="button"
                              variant="danger"
                              size="small"
                              loading={
                                isDeleting
                              }
                              onClick={() =>
                                onDelete(
                                  quotation
                                )
                              }
                              disabled={
                                isDeleting
                              }
                              title="Delete quotation"
                            >
                              Delete
                            </Button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              }
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="quotation-table-pagination">
          <div className="quotation-table-pagination-info">
            Page {safeCurrentPage} of{" "}
            {totalPages}
          </div>

          <div className="quotation-table-pagination-controls">
            <Button
              type="button"
              variant="secondary"
              size="small"
              onClick={() =>
                handlePageChange(
                  safeCurrentPage - 1
                )
              }
              disabled={
                safeCurrentPage <= 1
              }
            >
              Previous
            </Button>

            <div className="quotation-table-page-numbers">
              {Array.from(
                {
                  length: Math.min(
                    totalPages,
                    5
                  ),
                },
                (_, index) => {
                  let page = index + 1;

                  if (
                    totalPages > 5 &&
                    safeCurrentPage > 3
                  ) {
                    page =
                      Math.min(
                        safeCurrentPage - 2 + index,
                        totalPages - 4
                      );
                  }

                  const active =
                    page ===
                    safeCurrentPage;

                  return (
                    <button
                      key={page}
                      type="button"
                      className={[
                        "quotation-table-page-button",
                        active
                          ? "quotation-table-page-button-active"
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onClick={() =>
                        handlePageChange(
                          page
                        )
                      }
                      aria-current={
                        active
                          ? "page"
                          : undefined
                      }
                    >
                      {page}
                    </button>
                  );
                }
              )}
            </div>

            <Button
              type="button"
              variant="secondary"
              size="small"
              onClick={() =>
                handlePageChange(
                  safeCurrentPage + 1
                )
              }
              disabled={
                safeCurrentPage >=
                totalPages
              }
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotationTable;