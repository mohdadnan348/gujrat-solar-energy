"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import Button from "@/components/common/Button";
import SearchBox from "@/components/common/SearchBox";
import Select from "@/components/common/Select";
import Badge from "@/components/common/Badge";
import Pagination from "@/components/common/Pagination";
import Loader from "@/components/common/Loader";

import { useAuth } from "@/hooks/useAuth";
import invoiceService from "@/services/invoice.service";

import "./invoices.css";

const EmployeeInvoicesPage = () => {
  const { user, loading: authLoading } = useAuth();

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const limit = 10;

  const loadInvoices = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await invoiceService.getInvoices();

      const items =
        response?.data?.invoices ??
        response?.data?.items ??
        response?.invoices ??
        response?.items ??
        response?.data ??
        [];

      setInvoices(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error("Failed to load invoices:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load invoices. Please try again."
      );

      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      loadInvoices();
    }
  }, [authLoading, user]);

  const filteredInvoices = useMemo(() => {
    const query = search.trim().toLowerCase();

    return invoices.filter((invoice) => {
      const invoiceStatus = String(
        invoice?.status ||
          invoice?.invoiceStatus ||
          ""
      ).toLowerCase();

      const searchableText = [
        invoice?.invoiceNumber,
        invoice?.number,
        invoice?.customerName,
        invoice?.customer?.name,
        invoice?.customer?.companyName,
        invoice?.quotationNumber,
        invoice?.quotation?.quotationNumber,
        invoice?.phone,
        invoice?.email,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !query || searchableText.includes(query);

      const matchesStatus =
        !status ||
        invoiceStatus === status.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [invoices, search, status]);

  useEffect(() => {
    setPage(1);
  }, [search, status]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredInvoices.length / limit)
  );

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const paginatedInvoices = useMemo(() => {
    const start = (page - 1) * limit;

    return filteredInvoices.slice(
      start,
      start + limit
    );
  }, [filteredInvoices, page]);

  const getInvoiceId = (invoice) =>
    invoice?._id || invoice?.id;

  const getInvoiceNumber = (invoice) =>
    invoice?.invoiceNumber ||
    invoice?.number ||
    "Invoice";

  const getCustomerName = (invoice) =>
    invoice?.customerName ||
    invoice?.customer?.name ||
    invoice?.customer?.companyName ||
    "Unnamed Customer";

  const getQuotationNumber = (invoice) =>
    invoice?.quotationNumber ||
    invoice?.quotation?.quotationNumber ||
    "—";

  const getStatus = (invoice) =>
    invoice?.status ||
    invoice?.invoiceStatus ||
    "DRAFT";

  const getStatusVariant = (invoiceStatus) => {
    const value = String(
      invoiceStatus || ""
    ).toLowerCase();

    if (
      [
        "issued",
        "approved",
        "sent",
        "paid",
        "completed",
      ].includes(value)
    ) {
      return "success";
    }

    if (
      [
        "cancelled",
        "rejected",
        "void",
        "overdue",
      ].includes(value)
    ) {
      return "danger";
    }

    if (
      [
        "draft",
        "pending",
        "processing",
      ].includes(value)
    ) {
      return "warning";
    }

    return "default";
  };

  const getStatusLabel = (statusValue) => {
    if (!statusValue) return "Draft";

    return String(statusValue)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  const formatAmount = (invoice) => {
    const amount =
      invoice?.grandTotal ??
      invoice?.totalAmount ??
      invoice?.total ??
      invoice?.netAmount;

    if (
      amount === undefined ||
      amount === null ||
      amount === ""
    ) {
      return "—";
    }

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amount));
  };

  const getNumericAmount = (invoice) => {
    const amount =
      invoice?.grandTotal ??
      invoice?.totalAmount ??
      invoice?.total ??
      invoice?.netAmount ??
      0;

    return Number(amount) || 0;
  };

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
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

  const handleOpenPdf = async (invoice) => {
    const id = getInvoiceId(invoice);

    if (!id) return;

    try {
      const response =
        await invoiceService.getInvoicePdf(id);

      const blob =
        response instanceof Blob
          ? response
          : response?.data instanceof Blob
            ? response.data
            : null;

      if (!blob) {
        setError("Unable to generate invoice PDF.");
        return;
      }

      const url =
        window.URL.createObjectURL(blob);

      window.open(
        url,
        "_blank",
        "noopener,noreferrer"
      );

      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 60000);
    } catch (err) {
      console.error(
        "Failed to open invoice PDF:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Unable to open invoice PDF."
      );
    }
  };

  const totalAmount = useMemo(() => {
    return invoices.reduce(
      (sum, invoice) =>
        sum + getNumericAmount(invoice),
      0
    );
  }, [invoices]);

  const issuedCount = useMemo(() => {
    return invoices.filter((invoice) =>
      [
        "issued",
        "approved",
        "sent",
        "paid",
        "completed",
      ].includes(
        String(getStatus(invoice)).toLowerCase()
      )
    ).length;
  }, [invoices]);

  const pendingCount = useMemo(() => {
    return invoices.filter((invoice) =>
      [
        "draft",
        "pending",
        "processing",
      ].includes(
        String(getStatus(invoice)).toLowerCase()
      )
    ).length;
  }, [invoices]);

  if (authLoading) {
    return (
      <div className="employee-invoices-loading">
        <Loader />
      </div>
    );
  }

  return (
    <div className="employee-invoices-page">

      {/* Page Header */}
      <div className="employee-invoices-header">
        <div>
          <span className="employee-invoices-eyebrow">
            Billing Management
          </span>

          <h1>Invoices</h1>

          <p>
            View invoices generated for your assigned
            customers.
          </p>
        </div>

        <Button
          type="button"
          variant="secondary"
          onClick={loadInvoices}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {/* Summary */}
      {!loading && !error && (
        <div className="employee-invoices-summary">

          <div className="employee-invoice-summary-card">
            <div className="employee-invoice-summary-icon">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M6 2h9l4 4v16H6z" />
                <path d="M14 2v5h5" />
                <path d="M9 12h6M9 16h6" />
              </svg>
            </div>

            <div>
              <span>Total Invoices</span>
              <strong>{invoices.length}</strong>
            </div>
          </div>

          <div className="employee-invoice-summary-card">
            <div className="employee-invoice-summary-icon success">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="m5 12 4 4L19 6" />
              </svg>
            </div>

            <div>
              <span>Issued</span>
              <strong>{issuedCount}</strong>
            </div>
          </div>

          <div className="employee-invoice-summary-card">
            <div className="employee-invoice-summary-icon warning">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
            </div>

            <div>
              <span>Pending</span>
              <strong>{pendingCount}</strong>
            </div>
          </div>

          <div className="employee-invoice-summary-card">
            <div className="employee-invoice-summary-icon amount">
              ₹
            </div>

            <div>
              <span>Total Value</span>
              <strong>
                ₹
                {totalAmount.toLocaleString(
                  "en-IN",
                  {
                    maximumFractionDigits: 0,
                  }
                )}
              </strong>
            </div>
          </div>

        </div>
      )}

      {/* Filters */}
      <div className="employee-invoices-toolbar">

        <div className="employee-invoices-search">
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Search invoice, customer, quotation..."
          />
        </div>

        <div className="employee-invoices-filter">
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
                value: "PENDING",
                label: "Pending",
              },
              {
                value: "ISSUED",
                label: "Issued",
              },
              {
                value: "SENT",
                label: "Sent",
              },
              {
                value: "APPROVED",
                label: "Approved",
              },
              {
                value: "PAID",
                label: "Paid",
              },
              {
                value: "CANCELLED",
                label: "Cancelled",
              },
            ]}
          />
        </div>

        {(search || status) && (
          <button
            type="button"
            className="employee-invoices-clear"
            onClick={() => {
              setSearch("");
              setStatus("");
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="employee-invoices-error">
          <div>
            <strong>
              Unable to load invoices
            </strong>

            <span>{error}</span>
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={loadInvoices}
          >
            Retry
          </Button>
        </div>
      )}

      {/* Invoice Card */}
      <div className="employee-invoices-card">

        {loading ? (
          <div className="employee-invoices-loader">
            <Loader />
          </div>
        ) : paginatedInvoices.length === 0 ? (

          <div className="employee-invoices-empty">

            <div className="employee-invoices-empty-icon">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M6 2h9l4 4v16H6z" />
                <path d="M14 2v5h5" />
                <path d="M9 12h6M9 16h4" />
              </svg>
            </div>

            <h3>
              {search || status
                ? "No matching invoices"
                : "No invoices found"}
            </h3>

            <p>
              {search || status
                ? "Try changing your search or filter."
                : "Invoices generated for your assigned customers will appear here."}
            </p>

            {(search || status) && (
              <button
                type="button"
                className="employee-invoices-empty-button"
                onClick={() => {
                  setSearch("");
                  setStatus("");
                }}
              >
                Clear Filters
              </button>
            )}

          </div>

        ) : (

          <>
            <div className="employee-invoices-card-header">
              <div>
                <h2>
                  Assigned Invoices
                </h2>

                <p>
                  {filteredInvoices.length} invoice
                  {filteredInvoices.length !== 1
                    ? "s"
                    : ""}{" "}
                  found
                </p>
              </div>

              <span className="employee-invoices-count">
                {filteredInvoices.length} Total
              </span>
            </div>

            <div className="employee-invoices-table-wrapper">

              <table className="employee-invoices-table">

                <thead>
                  <tr>
                    <th>Invoice</th>
                    <th>Customer</th>
                    <th>Quotation</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Invoice Date</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedInvoices.map(
                    (invoice, index) => {
                      const id =
                        getInvoiceId(invoice) ||
                        index;

                      const invoiceStatus =
                        getStatus(invoice);

                      return (
                        <tr key={id}>

                          {/* Invoice */}
                          <td>
                            <div className="employee-invoice-main">

                              <div className="employee-invoice-icon">
                                <svg
                                  width="18"
                                  height="18"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.8"
                                >
                                  <path d="M6 2h9l4 4v16H6z" />
                                  <path d="M14 2v5h5" />
                                  <path d="M9 12h6M9 16h5" />
                                </svg>
                              </div>

                              <div>
                                <div className="employee-invoice-number">
                                  {getInvoiceNumber(
                                    invoice
                                  )}
                                </div>

                                {invoice?.dueDate && (
                                  <div className="employee-invoice-subtext">
                                    Due{" "}
                                    {formatDate(
                                      invoice.dueDate
                                    )}
                                  </div>
                                )}
                              </div>

                            </div>
                          </td>

                          {/* Customer */}
                          <td>
                            <div className="employee-invoice-customer">
                              {getCustomerName(
                                invoice
                              )}
                            </div>

                            {(invoice?.phone ||
                              invoice?.customer
                                ?.phone) && (
                              <div className="employee-invoice-subtext">
                                {invoice?.phone ||
                                  invoice?.customer
                                    ?.phone}
                              </div>
                            )}
                          </td>

                          {/* Quotation */}
                          <td>
                            <span className="employee-invoice-quotation">
                              {getQuotationNumber(
                                invoice
                              )}
                            </span>
                          </td>

                          {/* Amount */}
                          <td>
                            <span className="employee-invoice-amount">
                              {formatAmount(
                                invoice
                              )}
                            </span>
                          </td>

                          {/* Status */}
                          <td>
                            <Badge
                              variant={getStatusVariant(
                                invoiceStatus
                              )}
                            >
                              {getStatusLabel(
                                invoiceStatus
                              )}
                            </Badge>
                          </td>

                          {/* Date */}
                          <td>
                            <span className="employee-invoice-date">
                              {formatDate(
                                invoice?.invoiceDate ||
                                  invoice?.date ||
                                  invoice?.createdAt
                              )}
                            </span>
                          </td>

                          {/* Actions */}
                          <td>
                            <div className="employee-invoice-actions">

                              {getInvoiceId(
                                invoice
                              ) ? (
                                <Link
                                  href={`/employee/invoices/${getInvoiceId(
                                    invoice
                                  )}`}
                                  className="employee-invoice-view-button"
                                >
                                  View
                                  <svg
                                    width="15"
                                    height="15"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                  >
                                    <path d="m9 18 6-6-6-6" />
                                  </svg>
                                </Link>
                              ) : (
                                <span>—</span>
                              )}

                              {getInvoiceId(
                                invoice
                              ) && (
                                <button
                                  type="button"
                                  className="employee-invoice-pdf-button"
                                  onClick={() =>
                                    handleOpenPdf(
                                      invoice
                                    )
                                  }
                                >
                                  PDF
                                </button>
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

            <div className="employee-invoices-footer">

              <span>
                Showing{" "}
                {filteredInvoices.length === 0
                  ? 0
                  : (page - 1) * limit + 1}{" "}
                -{" "}
                {Math.min(
                  page * limit,
                  filteredInvoices.length
                )}{" "}
                of {filteredInvoices.length} invoices
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
  );
};

export default EmployeeInvoicesPage;