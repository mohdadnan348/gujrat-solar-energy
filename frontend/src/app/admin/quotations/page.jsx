"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import AdminLayout from "../layout";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import SearchBox from "@/components/common/SearchBox";
import Pagination from "@/components/common/Pagination";
import Loader from "@/components/common/Loader";
import Modal from "@/components/common/Modal";
import { useAuth } from "@/hooks/useAuth";
import { quotationService } from "@/services/quotation.service";
import { pdfService } from "@/services/pdf.service";

const PAGE_SIZE = 10;

const getValue = (obj, keys, fallback = "—") => {
  if (!obj) return fallback;

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

const getId = (item) =>
  item?._id ||
  item?.id ||
  item?.quotationId ||
  item?.quotationID;

const normalizeList = (response) => {
  if (Array.isArray(response)) return response;

  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) {
    return response.data.data;
  }

  if (Array.isArray(response?.quotations)) {
    return response.quotations;
  }

  if (Array.isArray(response?.data?.quotations)) {
    return response.data.quotations;
  }

  if (Array.isArray(response?.results)) {
    return response.results;
  }

  return [];
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatCurrency = (value) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return "₹0";
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return String(value);
  }

  return `₹${number.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
};

const getStatusVariant = (status) => {
  const normalized = String(status || "").toUpperCase();

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

const getNestedName = (value) => {
  if (!value) return "—";

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "object") {
    return (
      value?.name ||
      value?.fullName ||
      value?.customerName ||
      value?.companyName ||
      value?._id ||
      "—"
    );
  }

  return String(value);
};

const QuotationsPage = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedQuotation, setSelectedQuotation] =
    useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [pdfLoadingId, setPdfLoadingId] =
    useState(null);

  const loadQuotations = async (showRefresh = false) => {
    try {
      setError("");

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response =
        await quotationService.getQuotations();

      setQuotations(normalizeList(response));
    } catch (err) {
      console.error(
        "Failed to load quotations:",
        err
      );

      setError(
        err?.message ||
          "Quotations load nahi ho paayi. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      loadQuotations();
    }
  }, [authLoading, user]);

  const statuses = useMemo(() => {
    const values = quotations
      .map((quotation) =>
        getValue(quotation, ["status"], "")
      )
      .filter(Boolean);

    return [
      ...new Set(
        values.map((value) => String(value))
      ),
    ];
  }, [quotations]);

  const filteredQuotations = useMemo(() => {
    const query = search.trim().toLowerCase();

    return quotations.filter((quotation) => {
      const quotationNumber = String(
        getValue(
          quotation,
          [
            "quotationNumber",
            "quotationNo",
            "quoteNumber",
            "number",
          ],
          ""
        )
      ).toLowerCase();

      const customer = String(
        getNestedName(
          getValue(
            quotation,
            [
              "customerName",
              "customer",
              "customerId",
              "name",
            ],
            null
          )
        )
      ).toLowerCase();

      const lead = String(
        getNestedName(
          getValue(
            quotation,
            ["leadName", "lead", "leadId"],
            null
          )
        )
      ).toLowerCase();

      const status = String(
        getValue(quotation, ["status"], "")
      );

      const searchableText = [
        quotationNumber,
        customer,
        lead,
        status.toLowerCase(),
        String(
          getValue(
            quotation,
            [
              "totalAmount",
              "grandTotal",
              "total",
              "netAmount",
            ],
            ""
          )
        ).toLowerCase(),
      ].join(" ");

      const matchesSearch =
        !query ||
        searchableText.includes(query);

      const matchesStatus =
        statusFilter === "ALL" ||
        status.toUpperCase() ===
          statusFilter.toUpperCase();

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    quotations,
    search,
    statusFilter,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredQuotations.length / PAGE_SIZE
    )
  );

  const paginatedQuotations = useMemo(() => {
    const safePage = Math.min(
      currentPage,
      totalPages
    );

    const start =
      (safePage - 1) * PAGE_SIZE;

    return filteredQuotations.slice(
      start,
      start + PAGE_SIZE
    );
  }, [
    filteredQuotations,
    currentPage,
    totalPages,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const stats = useMemo(() => {
    const total = quotations.length;

    const draft = quotations.filter(
      (quotation) =>
        String(
          getValue(quotation, ["status"], "")
        ).toUpperCase() === "DRAFT"
    ).length;

    const sent = quotations.filter(
      (quotation) =>
        String(
          getValue(quotation, ["status"], "")
        ).toUpperCase() === "SENT"
    ).length;

    const accepted = quotations.filter(
      (quotation) => {
        const status = String(
          getValue(quotation, ["status"], "")
        ).toUpperCase();

        return (
          status === "ACCEPTED" ||
          status === "APPROVED"
        );
      }
    ).length;

    const totalValue = quotations.reduce(
      (sum, quotation) => {
        const amount = Number(
          getValue(
            quotation,
            [
              "grandTotal",
              "totalAmount",
              "netAmount",
              "total",
            ],
            0
          )
        );

        return (
          sum +
          (Number.isNaN(amount)
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

  const openDetails = (quotation) => {
    setSelectedQuotation(quotation);
    setModalOpen(true);
  };

  const closeDetails = () => {
    setSelectedQuotation(null);
    setModalOpen(false);
  };

  const handleCreate = () => {
    router.push("/admin/quotations/create");
  };

  const handleDownloadPdf = async (
    quotation
  ) => {
    const id = getId(quotation);

    if (!id) return;

    try {
      setPdfLoadingId(id);

      const response =
        await pdfService.downloadQuotationPDF(
          id
        );

      if (response instanceof Blob) {
        const url =
          window.URL.createObjectURL(response);

        const anchor =
          document.createElement("a");

        anchor.href = url;
        anchor.download = `${getValue(
          quotation,
          [
            "quotationNumber",
            "quotationNo",
            "quoteNumber",
          ],
          `quotation-${id}`
        )}.pdf`;

        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();

        window.URL.revokeObjectURL(url);
      } else if (
        response?.url ||
        response?.data?.url
      ) {
        const url =
          response?.url ||
          response?.data?.url;

        window.open(url, "_blank");
      } else {
        router.push(
          `/admin/quotations/${id}`
        );
      }
    } catch (err) {
      console.error(
        "Failed to download quotation PDF:",
        err
      );

      router.push(
        `/admin/quotations/${id}`
      );
    } finally {
      setPdfLoadingId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <AdminLayout>
        <div className="admin-quotations-loading">
          <Loader />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-quotations-page">
        {/* Header */}
        <div className="admin-quotations-header">
          <div>
            <div className="admin-quotations-breadcrumb">
              Admin <span>/</span> Quotations
            </div>

            <div className="admin-quotations-title-row">
              <div className="admin-quotations-title-icon">
                ₹
              </div>

              <div>
                <h1>Quotations</h1>

                <p>
                  Solar proposals aur quotations
                  manage karein.
                </p>
              </div>
            </div>
          </div>

          <div className="admin-quotations-header-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                loadQuotations(true)
              }
              disabled={refreshing}
            >
              {refreshing
                ? "Refreshing..."
                : "↻ Refresh"}
            </Button>

            <Button
              type="button"
              variant="primary"
              onClick={handleCreate}
            >
              + New Quotation
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="admin-quotations-stats">
          <div className="admin-quotation-stat-card">
            <div className="admin-quotation-stat-icon">
              #
            </div>

            <div>
              <span>Total Quotations</span>
              <strong>{stats.total}</strong>
            </div>
          </div>

          <div className="admin-quotation-stat-card">
            <div className="admin-quotation-stat-icon draft">
              ◷
            </div>

            <div>
              <span>Draft</span>
              <strong>{stats.draft}</strong>
            </div>
          </div>

          <div className="admin-quotation-stat-card">
            <div className="admin-quotation-stat-icon sent">
              ↑
            </div>

            <div>
              <span>Sent</span>
              <strong>{stats.sent}</strong>
            </div>
          </div>

          <div className="admin-quotation-stat-card">
            <div className="admin-quotation-stat-icon accepted">
              ✓
            </div>

            <div>
              <span>Accepted</span>
              <strong>{stats.accepted}</strong>
            </div>
          </div>

          <div className="admin-quotation-stat-card admin-quotation-value-card">
            <div className="admin-quotation-stat-icon value">
              ₹
            </div>

            <div>
              <span>Total Quotation Value</span>
              <strong>
                {formatCurrency(
                  stats.totalValue
                )}
              </strong>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="admin-quotations-error">
            <div>
              <strong>
                Unable to load quotations
              </strong>

              <p>{error}</p>
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

        {/* Filters */}
        <div className="admin-quotations-toolbar">
          <div className="admin-quotations-search">
            <SearchBox
              value={search}
              onChange={setSearch}
              placeholder="Search quotation, customer, lead..."
            />
          </div>

          <div className="admin-quotations-filters">
            <select
              className="admin-quotation-filter"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
            >
              <option value="ALL">
                All Status
              </option>

              {statuses.map((status) => (
                <option
                  key={status}
                  value={status}
                >
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="admin-quotations-card">
          <div className="admin-quotations-card-header">
            <div>
              <h2>
                Quotation Records
              </h2>

              <p>
                {filteredQuotations.length}{" "}
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
                statusFilter !== "ALL"
                  ? "Current filters ke according koi quotation nahi mili."
                  : "Abhi tak koi quotation create nahi hui hai."}
              </p>

              {!search &&
                statusFilter ===
                  "ALL" && (
                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleCreate}
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
                          getValue(
                            quotation,
                            [
                              "quotationNumber",
                              "quotationNo",
                              "quoteNumber",
                              "number",
                            ],
                            `QUO-${String(
                              index +
                                1
                            ).padStart(
                              4,
                              "0"
                            )}`
                          );

                        const customer =
                          getNestedName(
                            getValue(
                              quotation,
                              [
                                "customerName",
                                "customer",
                                "customerId",
                                "name",
                              ],
                              null
                            )
                          );

                        const systemSize =
                          getValue(
                            quotation,
                            [
                              "systemSizeKW",
                              "requiredKW",
                              "capacityKW",
                              "systemCapacity",
                            ],
                            ""
                          );

                        const systemType =
                          getValue(
                            quotation,
                            [
                              "systemType",
                              "system_type",
                              "type",
                            ],
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
                          getValue(
                            quotation,
                            [
                              "status",
                            ],
                            "—"
                          );

                        return (
                          <tr
                            key={
                              id ||
                              index
                            }
                          >
                            <td>
                              <div className="admin-quotation-number">
                                <span className="admin-quotation-mini-icon">
                                  ₹
                                </span>

                                <div>
                                  <strong>
                                    {
                                      number
                                    }
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
                                  {
                                    customer
                                  }
                                </strong>

                                <small>
                                  {getNestedName(
                                    getValue(
                                      quotation,
                                      [
                                        "leadName",
                                        "lead",
                                        "leadId",
                                      ],
                                      null
                                    )
                                  ) !==
                                    "—"
                                    ? `Lead: ${getNestedName(
                                        getValue(
                                          quotation,
                                          [
                                            "leadName",
                                            "lead",
                                            "leadId",
                                          ],
                                          null
                                        )
                                      )}`
                                    : ""}
                                </small>
                              </div>
                            </td>

                            <td>
                              <div className="admin-quotation-system">
                                <strong>
                                  {systemSize &&
                                  systemSize !==
                                    "—"
                                    ? `${systemSize} kW`
                                    : "—"}
                                </strong>

                                <small>
                                  {
                                    systemType
                                  }
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
                                {
                                  status
                                }
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
                                    id
                                      ? router.push(
                                          `/admin/quotations/${id}`
                                        )
                                      : openDetails(
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
                    : (currentPage -
                        1) *
                        PAGE_SIZE +
                      1}{" "}
                  to{" "}
                  {Math.min(
                    currentPage *
                      PAGE_SIZE,
                    filteredQuotations.length
                  )}{" "}
                  of{" "}
                  {
                    filteredQuotations.length
                  }
                </div>

                <Pagination
                  currentPage={
                    currentPage
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

        {/* Details Modal */}
        <Modal
          isOpen={modalOpen}
          onClose={closeDetails}
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
                    {getValue(
                      selectedQuotation,
                      [
                        "quotationNumber",
                        "quotationNo",
                        "quoteNumber",
                      ]
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Status
                  </span>
                  <strong>
                    {getValue(
                      selectedQuotation,
                      ["status"]
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Customer
                  </span>
                  <strong>
                    {getNestedName(
                      getValue(
                        selectedQuotation,
                        [
                          "customerName",
                          "customer",
                          "name",
                        ],
                        null
                      )
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    System Size
                  </span>
                  <strong>
                    {getValue(
                      selectedQuotation,
                      [
                        "systemSizeKW",
                        "requiredKW",
                        "capacityKW",
                      ]
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
    </AdminLayout>
  );
};

export default QuotationsPage;