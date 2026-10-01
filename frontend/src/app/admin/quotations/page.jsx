"use client";

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import SearchBox from "@/components/common/SearchBox";
import Pagination from "@/components/common/Pagination";
import Loader from "@/components/common/Loader";
import Modal from "@/components/common/Modal";

import { quotationService } from "@/services/quotation.service";

import "./quotations.css";

const PAGE_SIZE = 10;

/* =========================================================
   SAFE HELPERS
========================================================= */

const getId = (item) => {
  if (!item) return "";

  if (typeof item === "string") {
    return item;
  }

  return (
    item?._id ||
    item?.id ||
    item?.quotationId ||
    item?.quotationID ||
    ""
  );
};

const getObjectDisplayName = (
  value,
  fallback = "—"
) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return fallback;
  }

  if (
    typeof value === "string" ||
    typeof value === "number"
  ) {
    return String(value);
  }

  if (typeof value === "object") {
    return (
      value?.name ||
      value?.fullName ||
      value?.customerName ||
      value?.companyName ||
      value?.leadName ||
      value?.leadId ||
      value?.customerId ||
      value?.quotationNumber ||
      value?._id ||
      fallback
    );
  }

  return String(value);
};

const safeText = (
  value,
  fallback = "—"
) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return fallback;
  }

  if (
    typeof value === "string" ||
    typeof value === "number"
  ) {
    return String(value);
  }

  return getObjectDisplayName(
    value,
    fallback
  );
};

const getValue = (
  obj,
  keys,
  fallback = "—"
) => {
  if (!obj) {
    return fallback;
  }

  for (const key of keys) {
    const value = obj?.[key];

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

/* =========================================================
   NORMALIZE QUOTATION
   IMPORTANT:
   Customer object ko API response level par string bana raha hai.
========================================================= */

const normalizeQuotation = (
  quotation
) => {
  if (
    !quotation ||
    typeof quotation !== "object"
  ) {
    return quotation;
  }

  const customer =
    quotation.customer;

  const lead =
    quotation.lead;

  const customerName =
    quotation.customerName ||
    getObjectDisplayName(
      customer,
      ""
    );

  const leadName =
    quotation.leadName ||
    getObjectDisplayName(
      lead,
      ""
    );

  return {
    ...quotation,

    /*
     * IMPORTANT:
     * Customer object ko direct React child
     * banne se rokne ke liye string.
     */
    customer:
      typeof customer === "object"
        ? customerName
        : customer,

    customerName,

    lead:
      typeof lead === "object"
        ? leadName
        : lead,

    leadName,
  };
};

const normalizeList = (
  response
) => {
  let list = [];

  if (Array.isArray(response)) {
    list = response;
  } else if (
    Array.isArray(response?.data)
  ) {
    list = response.data;
  } else if (
    Array.isArray(
      response?.data?.data
    )
  ) {
    list = response.data.data;
  } else if (
    Array.isArray(
      response?.quotations
    )
  ) {
    list = response.quotations;
  } else if (
    Array.isArray(
      response?.data?.quotations
    )
  ) {
    list =
      response.data.quotations;
  } else if (
    Array.isArray(
      response?.results
    )
  ) {
    list = response.results;
  } else if (
    Array.isArray(
      response?.data?.results
    )
  ) {
    list =
      response.data.results;
  }

  return list.map(
    normalizeQuotation
  );
};

const formatDate = (
  value
) => {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return safeText(value);
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

const formatCurrency = (
  value
) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return "₹0";
  }

  if (
    typeof value === "object"
  ) {
    return "₹0";
  }

  const number =
    Number(value);

  if (
    Number.isNaN(number)
  ) {
    return "₹0";
  }

  return `₹${number.toLocaleString(
    "en-IN",
    {
      maximumFractionDigits: 2,
    }
  )}`;
};

const getStatusVariant = (
  status
) => {
  const normalized =
    String(
      status || ""
    ).toUpperCase();

  if (
    normalized === "ACCEPTED" ||
    normalized === "APPROVED" ||
    normalized === "CONVERTED"
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

/* =========================================================
   PAGE
========================================================= */

const QuotationsPage = () => {
  const router =
    useRouter();

  const [
    quotations,
    setQuotations,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("ALL");

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);

  const [
    selectedQuotation,
    setSelectedQuotation,
  ] = useState(null);

  const [
    modalOpen,
    setModalOpen,
  ] = useState(false);

  const [
    pdfLoadingId,
    setPdfLoadingId,
  ] = useState(null);

  /* =======================================================
     LOAD
  ======================================================= */

  const loadQuotations =
    async (
      showRefresh = false
    ) => {
      try {
        setError("");

        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const response =
          await quotationService.getQuotations();

        const list =
          normalizeList(
            response
          );

        setQuotations(
          Array.isArray(list)
            ? list
            : []
        );
      } catch (err) {
        console.error(
          "Failed to load quotations:",
          err
        );

        setQuotations([]);

        setError(
          err?.response?.data
            ?.message ||
            err?.response?.data
              ?.error ||
            err?.message ||
            "Quotations load nahi ho paayi. Please try again."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };

  useEffect(() => {
    loadQuotations();
  }, []);

  /* =======================================================
     STATUS
  ======================================================= */

  const statuses =
    useMemo(() => {
      const values =
        quotations
          .map(
            (quotation) =>
              safeText(
                quotation?.status,
                ""
              )
          )
          .filter(Boolean);

      return [
        ...new Set(values),
      ];
    }, [quotations]);

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredQuotations =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return quotations.filter(
        (quotation) => {
          const quotationNumber =
            safeText(
              getValue(
                quotation,
                [
                  "quotationNumber",
                  "quotationNo",
                  "quoteNumber",
                  "number",
                ],
                ""
              ),
              ""
            ).toLowerCase();

          const customer =
            safeText(
              getValue(
                quotation,
                [
                  "customerName",
                  "customer",
                  "customerId",
                  "name",
                ],
                ""
              ),
              ""
            ).toLowerCase();

          const lead =
            safeText(
              getValue(
                quotation,
                [
                  "leadName",
                  "lead",
                  "leadId",
                ],
                ""
              ),
              ""
            ).toLowerCase();

          const status =
            safeText(
              quotation?.status,
              ""
            );

          const amount =
            safeText(
              getValue(
                quotation,
                [
                  "totalAmount",
                  "grandTotal",
                  "total",
                  "netAmount",
                ],
                ""
              ),
              ""
            ).toLowerCase();

          const searchableText = [
            quotationNumber,
            customer,
            lead,
            status.toLowerCase(),
            amount,
          ].join(" ");

          const matchesSearch =
            !query ||
            searchableText.includes(
              query
            );

          const matchesStatus =
            statusFilter ===
              "ALL" ||
            status.toUpperCase() ===
              statusFilter.toUpperCase();

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      quotations,
      search,
      statusFilter,
    ]);

  /* =======================================================
     PAGINATION
  ======================================================= */

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredQuotations.length /
          PAGE_SIZE
      )
    );

  const safeCurrentPage =
    Math.min(
      currentPage,
      totalPages
    );

  const paginatedQuotations =
    useMemo(() => {
      const start =
        (safeCurrentPage - 1) *
        PAGE_SIZE;

      return filteredQuotations.slice(
        start,
        start + PAGE_SIZE
      );
    }, [
      filteredQuotations,
      safeCurrentPage,
    ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    statusFilter,
  ]);

  useEffect(() => {
    if (
      currentPage >
      totalPages
    ) {
      setCurrentPage(
        totalPages
      );
    }
  }, [
    currentPage,
    totalPages,
  ]);

  /* =======================================================
     STATS
  ======================================================= */

  const stats =
    useMemo(() => {
      const total =
        quotations.length;

      const draft =
        quotations.filter(
          (quotation) =>
            safeText(
              quotation?.status,
              ""
            ).toUpperCase() ===
            "DRAFT"
        ).length;

      const sent =
        quotations.filter(
          (quotation) =>
            safeText(
              quotation?.status,
              ""
            ).toUpperCase() ===
            "SENT"
        ).length;

      const accepted =
        quotations.filter(
          (quotation) => {
            const status =
              safeText(
                quotation?.status,
                ""
              ).toUpperCase();

            return (
              status ===
                "ACCEPTED" ||
              status ===
                "APPROVED"
            );
          }
        ).length;

      const totalValue =
        quotations.reduce(
          (
            sum,
            quotation
          ) => {
            const raw =
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

            if (
              typeof raw ===
              "object"
            ) {
              return sum;
            }

            const amount =
              Number(raw);

            return (
              sum +
              (Number.isNaN(
                amount
              )
                ? 0
                : amount)
            );
          },
          0
        );

      return {
        total,
        draft,
        sent,
        accepted,
        totalValue,
      };
    }, [quotations]);

  /* =======================================================
     ACTIONS
  ======================================================= */

  const handleCreate =
    () => {
      router.push(
        "/admin/quotations/create"
      );
    };

  const handleView =
    (quotation) => {
      const id =
        getId(quotation);

      if (!id) {
        setSelectedQuotation(
          quotation
        );
        setModalOpen(true);
        return;
      }

      router.push(
        `/admin/quotations/${id}`
      );
    };

  const closeDetails =
    () => {
      setSelectedQuotation(
        null
      );

      setModalOpen(false);
    };

  /* =======================================================
     PDF
  ======================================================= */

  const handleDownloadPdf =
    async (
      quotation
    ) => {
      const id =
        getId(quotation);

      if (!id) {
        return;
      }

      try {
        setPdfLoadingId(id);

        const response =
          await quotationService.getQuotationPdf(
            id
          );

        let blob = null;

        if (
          response instanceof Blob
        ) {
          blob = response;
        } else if (
          response?.data instanceof
          Blob
        ) {
          blob =
            response.data;
        }

        if (blob) {
          const url =
            window.URL.createObjectURL(
              blob
            );

          const anchor =
            document.createElement(
              "a"
            );

          anchor.href = url;

          const number =
            safeText(
              getValue(
                quotation,
                [
                  "quotationNumber",
                  "quotationNo",
                  "quoteNumber",
                ],
                `quotation-${id}`
              ),
              `quotation-${id}`
            );

          anchor.download =
            `${number}.pdf`;

          document.body.appendChild(
            anchor
          );

          anchor.click();

          anchor.remove();

          window.URL.revokeObjectURL(
            url
          );

          return;
        }

        const url =
          response?.url ||
          response?.data?.url;

        if (url) {
          window.open(
            url,
            "_blank",
            "noopener,noreferrer"
          );

          return;
        }

        router.push(
          `/admin/quotations/${id}`
        );
      } catch (err) {
        console.error(
          "Failed to download quotation PDF:",
          err
        );

        router.push(
          `/admin/quotations/${id}`
        );
      } finally {
        setPdfLoadingId(
          null
        );
      }
    };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="admin-quotations-loading">
        <Loader />
      </div>
    );
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="admin-quotations-page">

      {/* HEADER */}

      <div className="admin-quotations-header">

        <div>

          <div className="admin-quotations-breadcrumb">
            Admin{" "}
            <span>/</span>{" "}
            Quotations
          </div>

          <div className="admin-quotations-title-row">

            <div className="admin-quotations-title-icon">
              ₹
            </div>

            <div>

              <h1>
                Quotations
              </h1>

              <p>
                Solar proposals aur
                quotations manage karein.
              </p>

            </div>

          </div>

        </div>

        <div className="admin-quotations-header-actions">

          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              loadQuotations(
                true
              )
            }
            disabled={
              refreshing
            }
          >
            {refreshing
              ? "Refreshing..."
              : "↻ Refresh"}
          </Button>

          <Button
            type="button"
            variant="primary"
            onClick={
              handleCreate
            }
          >
            + New Quotation
          </Button>

        </div>

      </div>

      {/* STATS */}

      <div className="admin-quotations-stats">

        <div className="admin-quotation-stat-card">

          <div className="admin-quotation-stat-icon">
            #
          </div>

          <div>
            <span>
              Total Quotations
            </span>

            <strong>
              {stats.total}
            </strong>
          </div>

        </div>

        <div className="admin-quotation-stat-card">

          <div className="admin-quotation-stat-icon draft">
            ◷
          </div>

          <div>
            <span>
              Draft
            </span>

            <strong>
              {stats.draft}
            </strong>
          </div>

        </div>

        <div className="admin-quotation-stat-card">

          <div className="admin-quotation-stat-icon sent">
            ↑
          </div>

          <div>
            <span>
              Sent
            </span>

            <strong>
              {stats.sent}
            </strong>
          </div>

        </div>

        <div className="admin-quotation-stat-card">

          <div className="admin-quotation-stat-icon accepted">
            ✓
          </div>

          <div>
            <span>
              Accepted
            </span>

            <strong>
              {stats.accepted}
            </strong>
          </div>

        </div>

        <div className="admin-quotation-stat-card admin-quotation-value-card">

          <div className="admin-quotation-stat-icon value">
            ₹
          </div>

          <div>
            <span>
              Total Quotation Value
            </span>

            <strong>
              {formatCurrency(
                stats.totalValue
              )}
            </strong>
          </div>

        </div>

      </div>

      {/* ERROR */}

      {error && (
        <div className="admin-quotations-error">

          <div>

            <strong>
              Unable to load quotations
            </strong>

            <p>
              {error}
            </p>

          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              loadQuotations()
            }
          >
            Try Again
          </Button>

        </div>
      )}

      {/* FILTERS */}

      <div className="admin-quotations-toolbar">

        <div className="admin-quotations-search">

          <SearchBox
            value={search}
            onChange={
              setSearch
            }
            placeholder="Search quotation, customer, lead..."
          />

        </div>

        <div className="admin-quotations-filters">

          <select
            className="admin-quotation-filter"
            value={
              statusFilter
            }
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
          >

            <option value="ALL">
              All Status
            </option>

            {statuses.map(
              (status) => (
                <option
                  key={status}
                  value={status}
                >
                  {status}
                </option>
              )
            )}

          </select>

        </div>

      </div>

      {/* TABLE */}

      <div className="admin-quotations-card">

        <div className="admin-quotations-card-header">

          <div>

            <h2>
              Quotation Records
            </h2>

            <p>
              {
                filteredQuotations.length
              }{" "}
              quotation
              {filteredQuotations.length !==
              1
                ? "s"
                : ""}{" "}
              found
            </p>

          </div>

        </div>

        {paginatedQuotations.length ===
        0 ? (

          <div className="admin-quotations-empty">

            <div className="admin-quotations-empty-icon">
              ₹
            </div>

            <h3>
              No quotations found
            </h3>

            <p>
              {search ||
              statusFilter !==
                "ALL"
                ? "Current filters ke according koi quotation nahi mili."
                : "Abhi tak koi quotation create nahi hui hai."}
            </p>

            {!search &&
              statusFilter ===
                "ALL" && (
                <Button
                  type="button"
                  variant="primary"
                  onClick={
                    handleCreate
                  }
                >
                  Create Quotation
                </Button>
              )}

          </div>

        ) : (

          <>

            <div className="admin-quotations-table-wrapper">

              <table className="admin-quotations-table">

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
                      Amount
                    </th>

                    <th>
                      Valid Until
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Created
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
                        getId(
                          quotation
                        );

                      const number =
                        safeText(
                          getValue(
                            quotation,
                            [
                              "quotationNumber",
                              "quotationNo",
                              "quoteNumber",
                              "number",
                            ],
                            `QUO-${String(
                              index + 1
                            ).padStart(
                              4,
                              "0"
                            )}`
                          ),
                          `QUO-${String(
                            index + 1
                          ).padStart(
                            4,
                            "0"
                          )}`
                        );

                      /*
                       * Ab customer already normalized
                       * string hai.
                       */
                      const customer =
                        safeText(
                          quotation.customer
                        );

                      const lead =
                        safeText(
                          quotation.lead
                        );

                      const systemSize =
                        safeText(
                          getValue(
                            quotation,
                            [
                              "systemSizeKW",
                              "requiredKW",
                              "requiredKw",
                              "capacityKW",
                              "systemCapacity",
                            ],
                            ""
                          ),
                          ""
                        );

                      const systemType =
                        safeText(
                          getValue(
                            quotation,
                            [
                              "systemType",
                              "system_type",
                              "type",
                            ],
                            ""
                          ),
                          ""
                        );

                      const amount =
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

                      const status =
                        safeText(
                          quotation?.status,
                          "—"
                        );

                      return (

                        <tr
                          key={
                            id ||
                            `quotation-${index}`
                          }
                        >

                          <td>

                            <div className="admin-quotation-number">

                              <span className="admin-quotation-mini-icon">
                                ₹
                              </span>

                              <div>

                                <strong>
                                  {number}
                                </strong>

                                <small>
                                  {id ||
                                    ""}
                                </small>

                              </div>

                            </div>

                          </td>

                          <td>

                            <div className="admin-quotation-customer">

                              <strong>
                                {customer}
                              </strong>

                              <small>
                                {lead !==
                                "—"
                                  ? `Lead: ${lead}`
                                  : ""}
                              </small>

                            </div>

                          </td>

                          <td>

                            <div className="admin-quotation-system">

                              <strong>
                                {systemSize
                                  ? `${systemSize} kW`
                                  : "—"}
                              </strong>

                              <small>
                                {systemType ||
                                  "—"}
                              </small>

                            </div>

                          </td>

                          <td>

                            <strong className="admin-quotation-amount">
                              {formatCurrency(
                                amount
                              )}
                            </strong>

                          </td>

                          <td>

                            {formatDate(
                              getValue(
                                quotation,
                                [
                                  "validUntil",
                                  "validityDate",
                                  "validTill",
                                ],
                                null
                              )
                            )}

                          </td>

                          <td>

                            <Badge
                              variant={getStatusVariant(
                                status
                              )}
                            >
                              {status}
                            </Badge>

                          </td>

                          <td>

                            {formatDate(
                              getValue(
                                quotation,
                                [
                                  "createdAt",
                                  "created_at",
                                ],
                                null
                              )
                            )}

                          </td>

                          <td>

                            <div className="admin-quotation-actions">

                              <Button
                                type="button"
                                variant="secondary"
                                size="small"
                                onClick={() =>
                                  handleView(
                                    quotation
                                  )
                                }
                              >
                                View
                              </Button>

                              {id && (
                                <Button
                                  type="button"
                                  variant="secondary"
                                  size="small"
                                  disabled={
                                    pdfLoadingId ===
                                    id
                                  }
                                  onClick={() =>
                                    handleDownloadPdf(
                                      quotation
                                    )
                                  }
                                >
                                  {pdfLoadingId ===
                                  id
                                    ? "..."
                                    : "PDF"}
                                </Button>
                              )}

                            </div>

                          </td>

                        </tr>

                      );
                    }
                  )}

                </tbody>

              </table>

            </div>

            <div className="admin-quotations-pagination">

              <div className="admin-quotations-count">

                Showing{" "}

                {filteredQuotations.length ===
                0
                  ? 0
                  : (safeCurrentPage -
                      1) *
                      PAGE_SIZE +
                    1}

                {" "}to{" "}

                {Math.min(
                  safeCurrentPage *
                    PAGE_SIZE,
                  filteredQuotations.length
                )}

                {" "}of{" "}

                {
                  filteredQuotations.length
                }

              </div>

              <Pagination
                currentPage={
                  safeCurrentPage
                }
                totalPages={
                  totalPages
                }
                onPageChange={
                  setCurrentPage
                }
              />

            </div>

          </>

        )}

      </div>

      {/* DETAILS MODAL */}

      <Modal
        isOpen={
          modalOpen
        }
        onClose={
          closeDetails
        }
        title="Quotation Details"
      >

        {selectedQuotation && (

          <div className="admin-quotation-modal-content">

            <div className="admin-quotation-modal-grid">

              <div>

                <span>
                  Quotation Number
                </span>

                <strong>
                  {safeText(
                    selectedQuotation.quotationNumber ||
                      selectedQuotation.quotationNo
                  )}
                </strong>

              </div>

              <div>

                <span>
                  Status
                </span>

                <strong>
                  {safeText(
                    selectedQuotation.status
                  )}
                </strong>

              </div>

              <div>

                <span>
                  Customer
                </span>

                <strong>
                  {safeText(
                    selectedQuotation.customer
                  )}
                </strong>

              </div>

              <div>

                <span>
                  System Size
                </span>

                <strong>
                  {safeText(
                    getValue(
                      selectedQuotation,
                      [
                        "systemSizeKW",
                        "requiredKW",
                        "requiredKw",
                        "capacityKW",
                      ],
                      "—"
                    )
                  )}{" "}
                  kW
                </strong>

              </div>

              <div>

                <span>
                  Total Amount
                </span>

                <strong>
                  {formatCurrency(
                    getValue(
                      selectedQuotation,
                      [
                        "grandTotal",
                        "totalAmount",
                        "netAmount",
                        "total",
                      ],
                      0
                    )
                  )}
                </strong>

              </div>

              <div>

                <span>
                  Valid Until
                </span>

                <strong>
                  {formatDate(
                    getValue(
                      selectedQuotation,
                      [
                        "validUntil",
                        "validityDate",
                        "validTill",
                      ],
                      null
                    )
                  )}
                </strong>

              </div>

            </div>

          </div>

        )}

      </Modal>

    </div>
  );
};

export default QuotationsPage;