"use client";

import React, { useEffect, useMemo, useState } from "react";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import SearchBox from "@/components/common/SearchBox";
import Pagination from "@/components/common/Pagination";
import Loader from "@/components/common/Loader";
import { useAuth } from "@/hooks/useAuth";
import quotationService from "@/services/quotation.service";

import "./quotations.css";

const ManagerQuotationsPage = () => {
  const { user, loading: authLoading } = useAuth();

  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [selectedQuotation, setSelectedQuotation] =
    useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [downloadId, setDownloadId] = useState("");

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
        err?.response?.data?.message ||
          err?.message ||
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

  const firstValue = (...values) =>
    values.find((value) =>
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ""
    );

  const getCustomer = (quotation) =>
    quotation?.customer ||
    quotation?.solarRequirement?.customer ||
    quotation?.requirement?.customer ||
    quotation?.lead?.customer ||
    {};

  const getCustomerName = (quotation) =>
    firstValue(
      getCustomer(quotation)?.name,
      getCustomer(quotation)?.fullName,
      quotation?.customerName,
      quotation?.customer?.customerName,
      quotation?.lead?.name,
      quotation?.lead?.customerName,
      "Unnamed Customer"
    );

  const getCustomerPhone = (quotation) =>
    firstValue(
      getCustomer(quotation)?.mobile,
      getCustomer(quotation)?.phone,
      getCustomer(quotation)?.mobileNumber,
      quotation?.customerPhone,
      quotation?.phone,
      quotation?.mobile,
      quotation?.lead?.mobile,
      quotation?.lead?.phone,
      "—"
    );

  const getCustomerEmail = (quotation) =>
    firstValue(
      getCustomer(quotation)?.email,
      quotation?.customerEmail,
      quotation?.email,
      quotation?.lead?.email,
      "—"
    );

  const getQuotationNumber = (quotation) =>
    firstValue(
      quotation?.quotationNumber,
      quotation?.quotationNo,
      quotation?.quoteNumber,
      quotation?.estimateNumber,
      quotation?.referenceNumber,
      quotation?.code,
      "—"
    );

  const getStatus = (quotation) =>
    firstValue(quotation?.status, quotation?.quotationStatus, "DRAFT");

  const getTotal = (quotation) =>
    firstValue(
      quotation?.grandTotal,
      quotation?.totalAmount,
      quotation?.total,
      quotation?.grandAmount,
      quotation?.finalAmount,
      quotation?.pricing?.grandTotal,
      quotation?.pricing?.totalAmount,
      0
    );

  const getSystemSize = (quotation) =>
    firstValue(
      quotation?.systemSize,
      quotation?.systemCapacity,
      quotation?.capacity,
      quotation?.requiredKW,
      quotation?.requiredKw,
      quotation?.solarRequirement?.requiredKW,
      quotation?.solarRequirement?.requiredKw,
      quotation?.systemConfiguration?.systemSize,
      quotation?.systemConfiguration?.systemCapacity,
      quotation?.configuration?.systemSize,
      "—"
    );

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
    const candidates = [
      quotation?.items,
      quotation?.quotationItems,
      quotation?.lineItems,
      quotation?.products,
      quotation?.components,
      quotation?.bom?.items,
      quotation?.billOfMaterials?.items,
      quotation?.data?.items,
    ];
    const items = candidates.find(Array.isArray);
    return items || [];
  };

  const unwrapObject = (response) =>
    response?.data?.quotation ||
    response?.quotation ||
    response?.data?.data?.quotation ||
    response?.data?.data ||
    response?.data ||
    response;

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
        getCustomerPhone(quotation),
        getCustomerEmail(quotation),
        quotation?.city,
        getSystemSize(quotation),
        quotation?.notes,
      ]
        .filter(Boolean)
        .map((value) => String(value))
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
    const id = quotation?._id || quotation?.id;
    if (!id) {
      window.alert("Quotation ID is missing. Cannot download PDF.");
      return;
    }

    try {
      setDownloadId(String(id));
      if (typeof quotationService.getQuotationPdf !== "function") {
        throw new Error(
          "PDF service method getQuotationPdf is not available in quotation.service.js."
        );
      }

      const response = await quotationService.getQuotationPdf(id);
      const blob =
        response instanceof Blob
          ? response
          : response?.data instanceof Blob
            ? response.data
            : new Blob([response], { type: "application/pdf" });

      if (!blob || blob.size === 0) {
        throw new Error("The server returned an empty PDF file.");
      }

      const url = window.URL.createObjectURL(
        blob.type === "application/pdf"
          ? blob
          : new Blob([blob], { type: "application/pdf" })
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = `${getQuotationNumber(quotation) || "quotation"}.pdf`
        .replace(/[^a-z0-9._-]/gi, "_");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Quotation PDF download error:", err);
      window.alert(
        err?.response?.data?.message ||
        err?.message ||
        "PDF download failed. Please check the PDF API."
      );
    } finally {
      setDownloadId("");
    }
  };

  const handleViewQuotation = async (quotation) => {
    setSelectedQuotation(quotation);
    const id = quotation?._id || quotation?.id;
    if (!id) return;

    setDetailLoading(true);
    try {
      let detailed = quotation;

      if (typeof quotationService.getQuotationById === "function") {
        try {
          const response = await quotationService.getQuotationById(id);
          const unwrapped = unwrapObject(response);
          if (unwrapped && typeof unwrapped === "object") {
            detailed = { ...quotation, ...unwrapped };
          }
        } catch (detailError) {
          console.warn("Could not load quotation detail endpoint:", detailError);
        }
      }

      // Fetch the separate line-items endpoint when the quotation detail
      // response does not contain items. This avoids displaying a false 0-item state.
      if (
        getItems(detailed).length === 0 &&
        typeof quotationService.getQuotationItems === "function"
      ) {
        try {
          const itemsResponse = await quotationService.getQuotationItems(id);
          const possibleArrays = [
            itemsResponse?.data?.items,
            itemsResponse?.items,
            itemsResponse?.data?.quotationItems,
            itemsResponse?.quotationItems,
            itemsResponse?.data?.data?.items,
            itemsResponse?.data,
          ];
          const items = possibleArrays.find(Array.isArray);
          if (items) detailed = { ...detailed, items };
        } catch (itemsError) {
          console.warn("Could not load quotation items:", itemsError);
        }
      }

      setSelectedQuotation(detailed);
      setQuotations((current) =>
        current.map((item) =>
          String(item?._id || item?.id) === String(id)
            ? { ...item, ...detailed }
            : item
        )
      );
    } finally {
      setDetailLoading(false);
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
    <div className="manager-quotations-page">
      {/* Header */}
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

      {/* Error */}
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

      {/* Toolbar */}
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
            setStatusFilter(event.target.value)
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

      {/* Summary */}
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

      {/* Table */}
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
              {paginatedQuotations.length === 0 ? (
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
                      {/* Quotation */}
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

                      {/* Customer */}
                      <td>
                        <div className="manager-quotation-customer">
                          <div className="manager-quotation-avatar">
                            {String(
                              getCustomerName(
                                quotation
                              )
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
                              {getCustomerPhone(quotation)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* System Size */}
                      <td>
                        {getSystemSize(quotation)}

                        {(getSystemSize(quotation) !== "—") &&
                          " kW"}
                      </td>

                      {/* Amount */}
                      <td>
                        <strong className="manager-quotation-amount">
                          {formatCurrency(
                            getTotal(quotation)
                          )}
                        </strong>
                      </td>

                      {/* Status */}
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

                      {/* Valid Until */}
                      <td>
                        {formatDate(
                          quotation?.validUntil ||
                            quotation?.validityDate ||
                            quotation?.expiryDate
                        )}
                      </td>

                      {/* Created */}
                      <td>
                        {formatDate(
                          quotation?.createdAt
                        )}
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="manager-quotation-actions">
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => handleViewQuotation(quotation)}
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
                            {downloadId === String(quotation?._id || quotation?.id) ? "Downloading…" : "PDF"}
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

        {/* Pagination */}
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

      {/* Quotation Details Modal */}
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
            {/* Modal Header */}
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

            {/* Modal Body */}
            <div className="manager-quotation-modal-body">
              {detailLoading && (
                <p role="status" style={{ marginTop: 0, color: "#64748b" }}>
                  Loading complete quotation details…
                </p>
              )}
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
                    {getSystemSize(selectedQuotation)}

                    {(getSystemSize(selectedQuotation) !== "—") &&
                      " kW"}
                  </strong>
                </div>

                <div>
                  <span>Customer Phone</span>

                  <strong>
                    {getCustomerPhone(selectedQuotation)}
                  </strong>
                </div>
                <div>
                  <span>Customer Email</span>
                  <strong>{getCustomerEmail(selectedQuotation)}</strong>
                </div>
              </div>

              {/* Items */}
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
                                item?.title ||
                                item?.componentName ||
                                item?.description ||
                                `Item ${
                                  index + 1
                                }`}
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
                            {item?.quantity ??
                              item?.qty ??
                              item?.count ??
                              1}
                          </span>

                          <strong>
                            {formatCurrency(
                              item?.total ??
                                item?.lineTotal ??
                                item?.amount ??
                                Number(
                                  item?.quantity ??
                                    item?.qty ??
                                    item?.count ??
                                    1
                                ) *
                                  Number(
                                    item?.unitPrice ??
                                      item?.rate ??
                                      item?.price ??
                                      0
                                  )
                            )}
                          </strong>
                        </div>
                      )
                    )
                  )}
                </div>
              </div>

              {/* Total */}
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

              {/* Notes */}
              {selectedQuotation?.notes && (
                <div className="manager-quotation-notes">
                  <span>Notes</span>

                  <p>
                    {selectedQuotation.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
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
                {downloadId === String(selectedQuotation?._id || selectedQuotation?.id) ? "Downloading…" : "Download PDF"}
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
  );
};

export default ManagerQuotationsPage;