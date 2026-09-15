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
import invoiceService from "@/services/invoice.service";

const EmployeeInvoicesPage = () => {
  const { user, logout, loading: authLoading } = useAuth();

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
        response?.data?.invoices ||
        response?.data?.items ||
        response?.invoices ||
        response?.items ||
        response?.data ||
        [];

      setInvoices(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error("Failed to load invoices:", err);

      setError(
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
      const invoiceStatus =
        invoice?.status ||
        invoice?.invoiceStatus ||
        "";

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
        invoiceStatus.toLowerCase() === status.toLowerCase();

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

  const paginatedInvoices = useMemo(() => {
    const start = (page - 1) * limit;

    return filteredInvoices.slice(start, start + limit);
  }, [filteredInvoices, page]);

  const getInvoiceNumber = (invoice) =>
    invoice?.invoiceNumber ||
    invoice?.number ||
    "—";

  const getCustomerName = (invoice) =>
    invoice?.customerName ||
    invoice?.customer?.name ||
    invoice?.customer?.companyName ||
    "Unnamed Customer";

  const getStatus = (invoice) =>
    invoice?.status ||
    invoice?.invoiceStatus ||
    "DRAFT";

  const getStatusVariant = (invoiceStatus) => {
    const value = invoiceStatus.toLowerCase();

    if (
      ["issued", "approved", "sent", "completed"].includes(value)
    ) {
      return "success";
    }

    if (
      ["cancelled", "rejected", "void"].includes(value)
    ) {
      return "danger";
    }

    if (
      ["draft", "pending", "processing"].includes(value)
    ) {
      return "warning";
    }

    return "default";
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

  const handleViewInvoice = (invoice) => {
    const id = invoice?._id || invoice?.id;

    if (id) {
      window.location.href = `/employee/invoices/${id}`;
    }
  };

  const handleOpenPdf = async (invoice) => {
    const id = invoice?._id || invoice?.id;

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

      if (!blob) return;

      const url = window.URL.createObjectURL(blob);

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
    }
  };

  if (authLoading) {
    return (
      <div className="employee-invoices-loading">
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
      <div className="employee-invoices-page">
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
          >
            Refresh
          </Button>
        </div>

        <div className="employee-invoices-toolbar">
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Search invoices..."
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
                value: "CANCELLED",
                label: "Cancelled",
              },
            ]}
          />
        </div>

        {error && (
          <div className="employee-invoices-error">
            <span>{error}</span>

            <Button
              type="button"
              variant="secondary"
              onClick={loadInvoices}
            >
              Retry
            </Button>
          </div>
        )}

        <div className="employee-invoices-card">
          {loading ? (
            <div className="employee-invoices-loader">
              <Loader />
            </div>
          ) : paginatedInvoices.length === 0 ? (
            <div className="employee-invoices-empty">
              <div className="employee-invoices-empty-icon">
                ₹
              </div>

              <h3>No invoices found</h3>

              <p>
                {search || status
                  ? "Try changing your search or filter."
                  : "No invoices are available yet."}
              </p>
            </div>
          ) : (
            <>
              <div className="employee-invoices-table-wrapper">
                <table className="employee-invoices-table">
                  <thead>
                    <tr>
                      <th>Invoice</th>
                      <th>Customer</th>
                      <th>Quotation</th>
                      <th>Total Amount</th>
                      <th>Status</th>
                      <th>Invoice Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedInvoices.map(
                      (invoice, index) => {
                        const id =
                          invoice?._id ||
                          invoice?.id ||
                          index;

                        const invoiceStatus =
                          getStatus(invoice);

                        return (
                          <tr key={id}>
                            <td>
                              <div className="employee-invoice-number">
                                {getInvoiceNumber(invoice)}
                              </div>

                              {invoice?.dueDate && (
                                <div className="employee-invoice-subtext">
                                  Due{" "}
                                  {formatDate(
                                    invoice.dueDate
                                  )}
                                </div>
                              )}
                            </td>

                            <td>
                              <div className="employee-invoice-customer">
                                {getCustomerName(invoice)}
                              </div>

                              {(invoice?.phone ||
                                invoice?.customer?.phone) && (
                                <div className="employee-invoice-subtext">
                                  {invoice?.phone ||
                                    invoice?.customer?.phone}
                                </div>
                              )}
                            </td>

                            <td>
                              {invoice?.quotationNumber ||
                                invoice?.quotation
                                  ?.quotationNumber ||
                                "—"}
                            </td>

                            <td className="employee-invoice-amount">
                              {formatAmount(invoice)}
                            </td>

                            <td>
                              <Badge
                                variant={getStatusVariant(
                                  invoiceStatus
                                )}
                              >
                                {invoiceStatus.replaceAll(
                                  "_",
                                  " "
                                )}
                              </Badge>
                            </td>

                            <td>
                              {formatDate(
                                invoice?.invoiceDate ||
                                  invoice?.date ||
                                  invoice?.createdAt
                              )}
                            </td>

                            <td>
                              <div className="employee-invoice-actions">
                                <Button
                                  type="button"
                                  variant="secondary"
                                  onClick={() =>
                                    handleViewInvoice(
                                      invoice
                                    )
                                  }
                                >
                                  View
                                </Button>

                                <Button
                                  type="button"
                                  variant="secondary"
                                  onClick={() =>
                                    handleOpenPdf(invoice)
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
    </MainLayout>
  );
};

export default EmployeeInvoicesPage;