"use client";

import React, { useEffect, useMemo, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import Button from "@/components/common/Button";
import SearchBox from "@/components/common/SearchBox";
import Select from "@/components/common/Select";
import Badge from "@/components/common/Badge";
import Pagination from "@/components/common/Pagination";
import Loader from "@/components/common/Loader";
import { useAuth } from "@/hooks/useAuth";
import quotationService from "@/services/quotation.service";

const EmployeeQuotationsPage = () => {
  const { user, logout, loading: authLoading } = useAuth();

  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const limit = 10;

  const loadQuotations = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await quotationService.getQuotations();

      const items =
        response?.data?.quotations ||
        response?.data?.items ||
        response?.quotations ||
        response?.items ||
        response?.data ||
        [];

      setQuotations(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error("Failed to load quotations:", err);

      setError(
        err?.message ||
          "Unable to load quotations. Please try again."
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

  const filteredQuotations = useMemo(() => {
    const query = search.trim().toLowerCase();

    return quotations.filter((quotation) => {
      const quotationStatus =
        quotation?.status ||
        quotation?.quotationStatus ||
        "";

      const searchableText = [
        quotation?.quotationNumber,
        quotation?.quoteNumber,
        quotation?.estimateNumber,
        quotation?.customerName,
        quotation?.customer?.name,
        quotation?.leadName,
        quotation?.lead?.name,
        quotation?.phone,
        quotation?.email,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !query || searchableText.includes(query);

      const matchesStatus =
        !status ||
        quotationStatus.toLowerCase() === status.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [quotations, search, status]);

  useEffect(() => {
    setPage(1);
  }, [search, status]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredQuotations.length / limit)
  );

  const paginatedQuotations = useMemo(() => {
    const start = (page - 1) * limit;

    return filteredQuotations.slice(start, start + limit);
  }, [filteredQuotations, page]);

  const getQuotationNumber = (quotation) =>
    quotation?.quotationNumber ||
    quotation?.quoteNumber ||
    quotation?.estimateNumber ||
    "—";

  const getCustomerName = (quotation) =>
    quotation?.customerName ||
    quotation?.customer?.name ||
    quotation?.leadName ||
    quotation?.lead?.name ||
    "Unnamed Customer";

  const getStatus = (quotation) =>
    quotation?.status ||
    quotation?.quotationStatus ||
    "DRAFT";

  const getStatusVariant = (quotationStatus) => {
    const value = quotationStatus.toLowerCase();

    if (
      ["approved", "accepted", "converted", "sent"].includes(value)
    ) {
      return "success";
    }

    if (
      ["rejected", "cancelled", "expired"].includes(value)
    ) {
      return "danger";
    }

    if (
      ["pending", "under_review", "follow_up"].includes(value)
    ) {
      return "warning";
    }

    return "default";
  };

  const formatAmount = (quotation) => {
    const amount =
      quotation?.grandTotal ??
      quotation?.totalAmount ??
      quotation?.total ??
      quotation?.netAmount;

    if (amount === undefined || amount === null || amount === "") {
      return "—";
    }

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amount));
  };

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleViewQuotation = (quotation) => {
    const id = quotation?._id || quotation?.id;

    if (id) {
      window.location.href = `/employee/quotations/${id}`;
    }
  };

  const handleOpenPdf = async (quotation) => {
    const id = quotation?._id || quotation?.id;

    if (!id) return;

    try {
      const response =
        await quotationService.getQuotationPdf(id);

      const blob =
        response instanceof Blob
          ? response
          : response?.data instanceof Blob
            ? response.data
            : null;

      if (!blob) return;

      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");

      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 60000);
    } catch (err) {
      console.error("Failed to open quotation PDF:", err);
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
    <MainLayout
      user={user}
      onLogout={handleLogout}
      onSearch={setSearch}
      notificationCount={0}
    >
      <div className="employee-quotations-page">
        <div className="employee-quotations-header">
          <div>
            <span className="employee-quotations-eyebrow">
              Sales Management
            </span>

            <h1>Quotations</h1>

            <p>
              View quotations created for your assigned customers
              and leads.
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

        <div className="employee-quotations-toolbar">
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Search quotations..."
          />

          <Select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value)
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

        <div className="employee-quotations-card">
          {loading ? (
            <div className="employee-quotations-loader">
              <Loader />
            </div>
          ) : paginatedQuotations.length === 0 ? (
            <div className="employee-quotations-empty">
              <div className="employee-quotations-empty-icon">
                ₹
              </div>

              <h3>No quotations found</h3>

              <p>
                {search || status
                  ? "Try changing your search or filter."
                  : "No quotations are available yet."}
              </p>
            </div>
          ) : (
            <>
              <div className="employee-quotations-table-wrapper">
                <table className="employee-quotations-table">
                  <thead>
                    <tr>
                      <th>Quotation</th>
                      <th>Customer</th>
                      <th>System</th>
                      <th>Total Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedQuotations.map(
                      (quotation, index) => {
                        const id =
                          quotation?._id ||
                          quotation?.id ||
                          index;

                        const quotationStatus =
                          getStatus(quotation);

                        return (
                          <tr key={id}>
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

                            <td>
                              <div className="employee-quotation-customer">
                                {getCustomerName(
                                  quotation
                                )}
                              </div>

                              {(quotation?.phone ||
                                quotation?.customer?.phone) && (
                                <div className="employee-quotation-subtext">
                                  {quotation?.phone ||
                                    quotation?.customer?.phone}
                                </div>
                              )}
                            </td>

                            <td>
                              {quotation?.systemType ||
                                quotation?.solarSystemType ||
                                quotation?.capacity
                                ? `${quotation?.systemType || "Solar"}${
                                    quotation?.capacity
                                      ? ` • ${quotation.capacity} kW`
                                      : ""
                                  }`
                                : "—"}
                            </td>

                            <td className="employee-quotation-amount">
                              {formatAmount(quotation)}
                            </td>

                            <td>
                              <Badge
                                variant={getStatusVariant(
                                  quotationStatus
                                )}
                              >
                                {quotationStatus.replaceAll(
                                  "_",
                                  " "
                                )}
                              </Badge>
                            </td>

                            <td>
                              {formatDate(
                                quotation?.quotationDate ||
                                  quotation?.createdAt ||
                                  quotation?.createdDate
                              )}
                            </td>

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

              <div className="employee-quotations-footer">
                <span>
                  Showing{" "}
                  {filteredQuotations.length === 0
                    ? 0
                    : (page - 1) * limit + 1}{" "}
                  -{" "}
                  {Math.min(
                    page * limit,
                    filteredQuotations.length
                  )}{" "}
                  of {filteredQuotations.length} quotations
                </span>

                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default EmployeeQuotationsPage;