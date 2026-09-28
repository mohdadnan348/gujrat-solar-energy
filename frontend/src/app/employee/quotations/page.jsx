"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Button from "@/components/common/Button";
import SearchBox from "@/components/common/SearchBox";
import Select from "@/components/common/Select";
import Badge from "@/components/common/Badge";
import Pagination from "@/components/common/Pagination";
import Loader from "@/components/common/Loader";

import { useAuth } from "@/hooks/useAuth";
import quotationService from "@/services/quotation.service";
import "./quotations.css";
const LIMIT = 10;

const EmployeeQuotationsPage = () => {
  const {
    user,
    loading: authLoading,
  } = useAuth();

  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const loadQuotations = useCallback(
    async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await quotationService.getQuotations();

        /*
         * Backend response:
         *
         * {
         *   success: true,
         *   message: "Quotations fetched successfully",
         *   data: [],
         *   pagination: {...}
         * }
         */

        const items = Array.isArray(
          response?.data
        )
          ? response.data
          : Array.isArray(
              response?.data?.quotations
            )
          ? response.data.quotations
          : Array.isArray(
              response?.data?.items
            )
          ? response.data.items
          : Array.isArray(
              response?.quotations
            )
          ? response.quotations
          : [];

        setQuotations(items);
      } catch (err) {
        console.error(
          "Failed to load quotations:",
          err
        );

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to load quotations. Please try again."
        );

        setQuotations([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!authLoading && user) {
      loadQuotations();
    }
  }, [
    authLoading,
    user,
    loadQuotations,
  ]);

  const filteredQuotations = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return quotations.filter(
      (quotation) => {
        const quotationStatus =
          String(
            quotation?.status ||
              quotation?.quotationStatus ||
              "DRAFT"
          ).toLowerCase();

        const searchableText = [
          quotation?.quotationNumber,
          quotation?.quoteNumber,
          quotation?.estimateNumber,
          quotation?.customerName,
          quotation?.customer?.name,
          quotation?.customer?.customerName,
          quotation?.leadName,
          quotation?.lead?.name,
          quotation?.phone,
          quotation?.customer?.phone,
          quotation?.email,
          quotation?.customer?.email,
          quotation?.systemType,
          quotation?.solarSystemType,
          quotation?.capacity,
        ]
          .filter(
            (value) =>
              value !== undefined &&
              value !== null &&
              value !== ""
          )
          .join(" ")
          .toLowerCase();

        const matchesSearch =
          !query ||
          searchableText.includes(query);

        const matchesStatus =
          !status ||
          quotationStatus ===
            status.toLowerCase();

        return (
          matchesSearch &&
          matchesStatus
        );
      }
    );
  }, [
    quotations,
    search,
    status,
  ]);

  useEffect(() => {
    setPage(1);
  }, [search, status]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredQuotations.length /
        LIMIT
    )
  );

  const paginatedQuotations =
    useMemo(() => {
      const start =
        (page - 1) * LIMIT;

      return filteredQuotations.slice(
        start,
        start + LIMIT
      );
    }, [
      filteredQuotations,
      page,
    ]);

  const getQuotationNumber = (
    quotation
  ) =>
    quotation?.quotationNumber ||
    quotation?.quoteNumber ||
    quotation?.estimateNumber ||
    "—";

  const getCustomerName = (
    quotation
  ) =>
    quotation?.customerName ||
    quotation?.customer?.name ||
    quotation?.customer?.customerName ||
    quotation?.leadName ||
    quotation?.lead?.name ||
    "Unnamed Customer";

  const getPhone = (quotation) =>
    quotation?.phone ||
    quotation?.customer?.phone ||
    quotation?.mobile ||
    quotation?.customer?.mobile ||
    "—";

  const getStatus = (quotation) =>
    quotation?.status ||
    quotation?.quotationStatus ||
    "DRAFT";

  const getStatusVariant = (
    quotationStatus
  ) => {
    const value = String(
      quotationStatus
    )
      .toLowerCase()
      .trim();

    if (
      [
        "approved",
        "accepted",
        "converted",
        "sent",
      ].includes(value)
    ) {
      return "success";
    }

    if (
      [
        "rejected",
        "cancelled",
        "expired",
      ].includes(value)
    ) {
      return "danger";
    }

    if (
      [
        "pending",
        "under_review",
        "follow_up",
      ].includes(value)
    ) {
      return "warning";
    }

    return "default";
  };

  const formatAmount = (
    quotation
  ) => {
    const amount =
      quotation?.grandTotal ??
      quotation?.totalAmount ??
      quotation?.total ??
      quotation?.netAmount;

    if (
      amount === undefined ||
      amount === null ||
      amount === ""
    ) {
      return "—";
    }

    const numericAmount =
      Number(amount);

    if (
      Number.isNaN(
        numericAmount
      )
    ) {
      return "—";
    }

    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }
    ).format(numericAmount);
  };

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    const parsedDate =
      new Date(date);

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

  const getSystem = (
    quotation
  ) => {
    const systemType =
      quotation?.systemType ||
      quotation?.solarSystemType;

    const capacity =
      quotation?.capacity;

    if (
      !systemType &&
      !capacity
    ) {
      return "—";
    }

    if (
      systemType &&
      capacity
    ) {
      return `${systemType} • ${capacity} kW`;
    }

    if (capacity) {
      return `${capacity} kW`;
    }

    return systemType;
  };

  const handleViewQuotation = (
    quotation
  ) => {
    const id =
      quotation?._id ||
      quotation?.id;

    if (!id) {
      return;
    }

    window.location.href =
      `/employee/quotations/${id}`;
  };

  const handleOpenPdf = async (
    quotation
  ) => {
    const id =
      quotation?._id ||
      quotation?.id;

    if (!id) {
      return;
    }

    try {
      const response =
        await quotationService.getQuotationPdf(
          id
        );

      const blob =
        response instanceof Blob
          ? response
          : response?.data instanceof
            Blob
          ? response.data
          : null;

      if (!blob) {
        setError(
          "Unable to generate quotation PDF."
        );
        return;
      }

      const url =
        window.URL.createObjectURL(
          blob
        );

      window.open(
        url,
        "_blank",
        "noopener,noreferrer"
      );

      setTimeout(() => {
        window.URL.revokeObjectURL(
          url
        );
      }, 60000);
    } catch (err) {
      console.error(
        "Failed to open quotation PDF:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to open quotation PDF."
      );
    }
  };

  if (authLoading) {
    return (
      <div className="employee-quotations-loading">
        <Loader />
      </div>
    );
  }

  return (
    <div className="employee-quotations-page">

      {/* =================================================
          Header
      ================================================= */}

      <div className="employee-quotations-header">
        <div>
          <span className="employee-quotations-eyebrow">
            Sales Management
          </span>

          <h1>Quotations</h1>

          <p>
            View quotations created for
            your assigned customers and
            leads.
          </p>
        </div>

        <Button
          type="button"
          variant="secondary"
          onClick={loadQuotations}
          disabled={loading}
        >
          {loading
            ? "Refreshing..."
            : "Refresh"}
        </Button>
      </div>

      {/* =================================================
          Toolbar
      ================================================= */}

      <div className="employee-quotations-toolbar">
        <SearchBox
          value={search}
          onChange={setSearch}
          placeholder="Search quotations..."
        />

        <Select
          value={status}
          onChange={(event) =>
            setStatus(
              event.target.value
            )
          }
          options={[
            {
              value: "",
              label: "All Statuses",
            },
            {
              value: "DRAFT",
              label: "Draft",
            },
            {
              value: "SENT",
              label: "Sent",
            },
            {
              value: "PENDING",
              label: "Pending",
            },
            {
              value: "APPROVED",
              label: "Approved",
            },
            {
              value: "ACCEPTED",
              label: "Accepted",
            },
            {
              value: "REJECTED",
              label: "Rejected",
            },
            {
              value: "EXPIRED",
              label: "Expired",
            },
          ]}
        />
      </div>

      {/* =================================================
          Error
      ================================================= */}

      {error && (
        <div className="employee-quotations-error">
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

      {/* =================================================
          Main Card
      ================================================= */}

      <div className="employee-quotations-card">
        {loading ? (
          <div className="employee-quotations-loader">
            <Loader />
          </div>
        ) : paginatedQuotations.length ===
          0 ? (
          <div className="employee-quotations-empty">
            <div className="employee-quotations-empty-icon">
              ₹
            </div>

            <h3>
              {search || status
                ? "No matching quotations"
                : "No quotations yet"}
            </h3>

            <p>
              {search || status
                ? "Try changing your search or status filter."
                : "Quotations assigned to you will appear here."}
            </p>

            {(search || status) && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setSearch("");
                  setStatus("");
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="employee-quotations-table-wrapper">
              <table className="employee-quotations-table">
                <thead>
                  <tr>
                    <th>
                      Quotation
                    </th>

                    <th>
                      Customer
                    </th>

                    <th>
                      System
                    </th>

                    <th>
                      Total Amount
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Date
                    </th>

                    <th>
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedQuotations.map(
                    (
                      quotation,
                      index
                    ) => {
                      const id =
                        quotation?._id ||
                        quotation?.id ||
                        `quotation-${index}`;

                      const quotationStatus =
                        getStatus(
                          quotation
                        );

                      return (
                        <tr
                          key={id}
                        >
                          {/* Quotation */}

                          <td>
                            <div className="employee-quotation-number">
                              {getQuotationNumber(
                                quotation
                              )}
                            </div>

                            {quotation?.validUntil && (
                              <div className="employee-quotation-subtext">
                                Valid till{" "}
                                {formatDate(
                                  quotation.validUntil
                                )}
                              </div>
                            )}
                          </td>

                          {/* Customer */}

                          <td>
                            <div className="employee-quotation-customer">
                              {getCustomerName(
                                quotation
                              )}
                            </div>

                            {getPhone(
                              quotation
                            ) !==
                              "—" && (
                              <div className="employee-quotation-subtext">
                                {getPhone(
                                  quotation
                                )}
                              </div>
                            )}
                          </td>

                          {/* System */}

                          <td>
                            {getSystem(
                              quotation
                            )}
                          </td>

                          {/* Amount */}

                          <td className="employee-quotation-amount">
                            {formatAmount(
                              quotation
                            )}
                          </td>

                          {/* Status */}

                          <td>
                            <Badge
                              variant={getStatusVariant(
                                quotationStatus
                              )}
                            >
                              {String(
                                quotationStatus
                              ).replaceAll(
                                "_",
                                " "
                              )}
                            </Badge>
                          </td>

                          {/* Date */}

                          <td>
                            {formatDate(
                              quotation?.quotationDate ||
                                quotation?.createdAt ||
                                quotation?.createdDate
                            )}
                          </td>

                          {/* Actions */}

                          <td>
                            <div className="employee-quotation-actions">
                              <Button
                                type="button"
                                variant="secondary"
                                onClick={() =>
                                  handleViewQuotation(
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
                                  handleOpenPdf(
                                    quotation
                                  )
                                }
                              >
                                PDF
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}

            <div className="employee-quotations-footer">
              <span>
                Showing{" "}
                {(page - 1) *
                  LIMIT +
                  1}{" "}
                -{" "}
                {Math.min(
                  page * LIMIT,
                  filteredQuotations.length
                )}{" "}
                of{" "}
                {
                  filteredQuotations.length
                }{" "}
                quotations
              </span>

              <Pagination
                currentPage={page}
                totalPages={
                  totalPages
                }
                onPageChange={
                  setPage
                }
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EmployeeQuotationsPage;