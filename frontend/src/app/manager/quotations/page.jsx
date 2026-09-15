"use client";

import React, { useEffect, useMemo, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import SearchBox from "@/components/common/SearchBox";
import Pagination from "@/components/common/Pagination";
import Loader from "@/components/common/Loader";
import { useAuth } from "@/hooks/useAuth";
import quotationService from "@/services/quotation.service";

const ManagerQuotationsPage = () => {
  const { user, logout, loading: authLoading } = useAuth();

  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [selectedQuotation, setSelectedQuotation] = useState(null);

  const itemsPerPage = 10;

  const loadQuotations = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await quotationService.getQuotations();

      const data =
        response?.data?.quotations ||
        response?.quotations ||
        response?.data?.items ||
        response?.items ||
        response?.data ||
        [];

      setQuotations(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      console.error("Quotations error:", err);

      setError(
        err?.message ||
          err?.response?.data?.message ||
          "Unable to load quotations."
      );

      setQuotations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      loadQuotations();
    }
  }, [authLoading, user]);

  const handleLogout = async () => {
    await logout();
  };

  const getCustomerName = (quotation) =>
    quotation?.customer?.name ||
    quotation?.customerName ||
    quotation?.lead?.name ||
    quotation?.lead?.customerName ||
    "Unnamed Customer";

  const getQuotationNumber = (quotation) =>
    quotation?.quotationNumber ||
    quotation?.quotationNo ||
    quotation?.quoteNumber ||
    quotation?.referenceNumber ||
    "—";

  const getStatus = (quotation) =>
    quotation?.status ||
    quotation?.quotationStatus ||
    "DRAFT";

  const getTotal = (quotation) =>
    quotation?.grandTotal ??
    quotation?.totalAmount ??
    quotation?.total ??
    quotation?.grandAmount ??
    0;

  const getBadgeVariant = (value) => {
    const status = String(value).toLowerCase();

    if (
      [
        "approved",
        "accepted",
        "confirmed",
        "completed",
        "converted",
      ].includes(status)
    ) {
      return "success";
    }

    if (
      [
        "rejected",
        "cancelled",
        "expired",
      ].includes(status)
    ) {
      return "danger";
    }

    if (
      [
        "sent",
        "pending",
        "under_review",
        "review",
      ].includes(status)
    ) {
      return "warning";
    }

    return "default";
  };

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (value) => {
    const amount = Number(value);

    if (Number.isNaN(amount)) {
      return "₹0";
    }

    return `₹${amount.toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;
  };

  const getItems = (quotation) => {
    const items =
      quotation?.items ||
      quotation?.quotationItems ||
      quotation?.products ||
      [];

    return Array.isArray(items) ? items : [];
  };

  const filteredQuotations = useMemo(() => {
    const query = search.trim().toLowerCase();

    return quotations.filter((quotation) => {
      const status = String(
        getStatus(quotation)
      ).toUpperCase();

      const matchesStatus =
        statusFilter === "ALL" ||
        status === statusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!query) {
        return true;
      }

      const searchableText = [
        getCustomerName(quotation),
        getQuotationNumber(quotation),
        quotation?.customer?.phone,
        quotation?.customer?.mobile,
        quotation?.lead?.phone,
        quotation?.city,
        quotation?.systemSize,
        quotation?.notes,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [
    quotations,
    search,
    statusFilter,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredQuotations.length /
        itemsPerPage
    )
  );

  const currentPage = Math.min(
    page,
    totalPages
  );

  const paginatedQuotations =
    filteredQuotations.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const handlePageChange = (nextPage) => {
    setPage(nextPage);
  };

  const handleDownloadPdf = async (quotation) => {
    try {
      const id =
        quotation?._id ||
        quotation?.id;

      if (!id) {
        return;
      }

      if (
        typeof quotationService.downloadQuotationPdf ===
        "function"
      ) {
        await quotationService.downloadQuotationPdf(
          id
        );
        return;
      }

      if (
        typeof quotationService.generateQuotationPdf ===
        "function"
      ) {
        await quotationService.generateQuotationPdf(
          id
        );
        return;
      }

      console.warn(
        "Quotation PDF service method is not available."
      );
    } catch (err) {
      console.error(
        "Quotation PDF download error:",
        err
      );
    }
  };

  if (authLoading || loading) {
    return (
      <div className="manager-quotations-loading">
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
      <div className="manager-quotations-page">
        <div className="manager-quotations-header">
          <div>
            <span className="manager-quotations-eyebrow">
              Manager Portal
            </span>

            <h1>Quotations</h1>

            <p>
              Review, track and manage customer
              quotations and proposals.
            </p>
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={loadQuotations}
          >
            Refresh
          </Button>
        </div>

        {error && (
          <div className="manager-quotations-error">
            <span>{error}</span>

            <Button
              type="button"
              variant="secondary"
              onClick={loadQuotations}
            >
              Retry
            </Button>
          </div>
        )}

        <div className="manager-quotations-toolbar">
          <SearchBox
            value={search}
            onChange={(value) => setSearch(value)}
            placeholder="Search quotation, customer..."
          />

          <select
            className="manager-quotations-status-filter"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
          >
            <option value="ALL">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="SENT">Sent</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">
              Approved
            </option>
            <option value="ACCEPTED">
              Accepted
            </option>
            <option value="REJECTED">
              Rejected
            </option>
            <option value="EXPIRED">
              Expired
            </option>
            <option value="CANCELLED">
              Cancelled
            </option>
          </select>
        </div>

        <div className="manager-quotations-summary">
          <div className="manager-quotation-summary-card">
            <span>Total Quotations</span>
            <strong>
              {filteredQuotations.length}
            </strong>
          </div>

          <div className="manager-quotation-summary-card">
            <span>Approved</span>
            <strong>
              {
                filteredQuotations.filter(
                  (item) =>
                    [
                      "APPROVED",
                      "ACCEPTED",
                    ].includes(
                      String(
                        getStatus(item)
                      ).toUpperCase()
                    )
                ).length
              }
            </strong>
          </div>

          <div className="manager-quotation-summary-card">
            <span>Draft</span>
            <strong>
              {
                filteredQuotations.filter(
                  (item) =>
                    String(
                      getStatus(item)
                    ).toUpperCase() ===
                    "DRAFT"
                ).length
              }
            </strong>
          </div>
        </div>

        <div className="manager-quotations-card">
          <div className="manager-quotations-table-wrapper">
            <table className="manager-quotations-table">
              <thead>
                <tr>
                  <th>Quotation</th>
                  <th>Customer</th>
                  <th>System Size</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th>Valid Until</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {paginatedQuotations.length ===
                0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="manager-quotations-empty"
                    >
                      <div>
                        <span>▤</span>
                        <strong>
                          No quotations found
                        </strong>
                        <p>
                          Try changing your search
                          or status filter.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedQuotations.map(
                    (quotation, index) => (
                      <tr
                        key={
                          quotation?._id ||
                          quotation?.id ||
                          index
                        }
                      >
                        <td>
                          <div className="manager-quotation-number-block">
                            <strong>
                              {getQuotationNumber(
                                quotation
                              )}
                            </strong>

                            <span>
                              {getItems(
                                quotation
                              ).length}{" "}
                              item
                              {getItems(
                                quotation
                              ).length !== 1
                                ? "s"
                                : ""}
                            </span>
                          </div>
                        </td>

                        <td>
                          <div className="manager-quotation-customer">
                            <div className="manager-quotation-avatar">
                              {getCustomerName(
                                quotation
                              )
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>
                              <strong>
                                {getCustomerName(
                                  quotation
                                )}
                              </strong>

                              <span>
                                {quotation?.customer
                                  ?.phone ||
                                  quotation?.customer
                                    ?.mobile ||
                                  quotation?.lead
                                    ?.phone ||
                                  "No phone"}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>
                          {quotation?.systemSize ||
                            quotation?.capacity ||
                            quotation
                              ?.systemConfiguration
                              ?.systemSize ||
                            "—"}
                          {(quotation?.systemSize ||
                            quotation?.capacity ||
                            quotation
                              ?.systemConfiguration
                              ?.systemSize) &&
                            " kW"}
                        </td>

                        <td>
                          <strong className="manager-quotation-amount">
                            {formatCurrency(
                              getTotal(
                                quotation
                              )
                            )}
                          </strong>
                        </td>

                        <td>
                          <Badge
                            variant={getBadgeVariant(
                              getStatus(
                                quotation
                              )
                            )}
                          >
                            {String(
                              getStatus(
                                quotation
                              )
                            ).replaceAll(
                              "_",
                              " "
                            )}
                          </Badge>
                        </td>

                        <td>
                          {formatDate(
                            quotation?.validUntil ||
                              quotation?.validityDate ||
                              quotation?.expiryDate
                          )}
                        </td>

                        <td>
                          {formatDate(
                            quotation?.createdAt
                          )}
                        </td>

                        <td>
                          <div className="manager-quotation-actions">
                            <Button
                              type="button"
                              variant="secondary"
                              onClick={() =>
                                setSelectedQuotation(
                                  quotation
                                )
                              }
                            >
                              View
                            </Button>

                            <Button
                              type="button"
                              variant="secondary"
                              onClick={() =>
                                handleDownloadPdf(
                                  quotation
                                )
                              }
                            >
                              PDF
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>

          {filteredQuotations.length > 0 && (
            <div className="manager-quotations-pagination">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>

        {selectedQuotation && (
          <div
            className="manager-quotation-modal-overlay"
            onClick={() =>
              setSelectedQuotation(null)
            }
          >
            <div
              className="manager-quotation-modal"
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              <div className="manager-quotation-modal-header">
                <div>
                  <span>
                    Quotation Details
                  </span>

                  <h2>
                    {getQuotationNumber(
                      selectedQuotation
                    )}
                  </h2>

                  <p>
                    {getCustomerName(
                      selectedQuotation
                    )}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedQuotation(null)
                  }
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              <div className="manager-quotation-modal-body">
                <div className="manager-quotation-info-grid">
                  <div>
                    <span>Customer</span>
                    <strong>
                      {getCustomerName(
                        selectedQuotation
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Status</span>

                    <Badge
                      variant={getBadgeVariant(
                        getStatus(
                          selectedQuotation
                        )
                      )}
                    >
                      {String(
                        getStatus(
                          selectedQuotation
                        )
                      ).replaceAll(
                        "_",
                        " "
                      )}
                    </Badge>
                  </div>

                  <div>
                    <span>Quotation Date</span>
                    <strong>
                      {formatDate(
                        selectedQuotation?.quotationDate ||
                          selectedQuotation?.date ||
                          selectedQuotation?.createdAt
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Valid Until</span>
                    <strong>
                      {formatDate(
                        selectedQuotation?.validUntil ||
                          selectedQuotation?.validityDate ||
                          selectedQuotation?.expiryDate
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>System Size</span>
                    <strong>
                      {selectedQuotation?.systemSize ||
                        selectedQuotation?.capacity ||
                        selectedQuotation
                          ?.systemConfiguration
                          ?.systemSize ||
                        "—"}
                      {(selectedQuotation?.systemSize ||
                        selectedQuotation?.capacity ||
                        selectedQuotation
                          ?.systemConfiguration
                          ?.systemSize) &&
                        " kW"}
                    </strong>
                  </div>

                  <div>
                    <span>Customer Phone</span>
                    <strong>
                      {selectedQuotation?.customer
                        ?.phone ||
                        selectedQuotation?.customer
                          ?.mobile ||
                        selectedQuotation?.lead
                          ?.phone ||
                        "—"}
                    </strong>
                  </div>
                </div>

                <div className="manager-quotation-items-section">
                  <div className="manager-quotation-section-heading">
                    <h3>Quotation Items</h3>
                    <span>
                      {getItems(
                        selectedQuotation
                      ).length}{" "}
                      item
                      {getItems(
                        selectedQuotation
                      ).length !== 1
                        ? "s"
                        : ""}
                    </span>
                  </div>

                  <div className="manager-quotation-items">
                    {getItems(
                      selectedQuotation
                    ).length === 0 ? (
                      <div className="manager-quotation-no-items">
                        No quotation items available.
                      </div>
                    ) : (
                      getItems(
                        selectedQuotation
                      ).map(
                        (item, index) => (
                          <div
                            className="manager-quotation-item"
                            key={
                              item?._id ||
                              item?.id ||
                              index
                            }
                          >
                            <div>
                              <strong>
                                {item?.name ||
                                  item?.productName ||
                                  item?.description ||
                                  `Item ${index + 1}`}
                              </strong>

                              {item?.description &&
                                item?.name && (
                                  <span>
                                    {
                                      item.description
                                    }
                                  </span>
                                )}
                            </div>

                            <span>
                              Qty:{" "}
                              {item?.quantity ||
                                item?.qty ||
                                1}
                            </span>

                            <strong>
                              {formatCurrency(
                                item?.total ||
                                  item?.amount ||
                                  (
                                    Number(
                                      item?.quantity ||
                                        item?.qty ||
                                        1
                                    ) *
                                    Number(
                                      item?.unitPrice ||
                                        item?.price ||
                                        0
                                    )
                                  )
                              )}
                            </strong>
                          </div>
                        )
                      )
                    )}
                  </div>
                </div>

                <div className="manager-quotation-total-box">
                  <span>Grand Total</span>
                  <strong>
                    {formatCurrency(
                      getTotal(
                        selectedQuotation
                      )
                    )}
                  </strong>
                </div>

                {selectedQuotation?.notes && (
                  <div className="manager-quotation-notes">
                    <span>Notes</span>
                    <p>
                      {selectedQuotation.notes}
                    </p>
                  </div>
                )}
              </div>

              <div className="manager-quotation-modal-footer">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    handleDownloadPdf(
                      selectedQuotation
                    )
                  }
                >
                  Download PDF
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    setSelectedQuotation(null)
                  }
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ManagerQuotationsPage;