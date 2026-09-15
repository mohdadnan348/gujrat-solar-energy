"use client";

import React, { useEffect, useMemo, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import SearchBox from "@/components/common/SearchBox";
import Pagination from "@/components/common/Pagination";
import Loader from "@/components/common/Loader";
import { useAuth } from "@/hooks/useAuth";
import invoiceService from "@/services/invoice.service";

const ManagerInvoicesPage = () => {
  const { user, logout, loading: authLoading } = useAuth();

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const itemsPerPage = 10;

  const loadInvoices = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await invoiceService.getInvoices();

      const data =
        response?.data?.invoices ||
        response?.invoices ||
        response?.data?.items ||
        response?.items ||
        response?.data ||
        [];

      setInvoices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Invoices error:", err);

      setError(
        err?.message ||
          err?.response?.data?.message ||
          "Unable to load invoices."
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

  const handleLogout = async () => {
    await logout();
  };

  const getCustomerName = (invoice) =>
    invoice?.customer?.name ||
    invoice?.customerName ||
    invoice?.lead?.name ||
    "Unnamed Customer";

  const getInvoiceNumber = (invoice) =>
    invoice?.invoiceNumber ||
    invoice?.invoiceNo ||
    invoice?.number ||
    invoice?.referenceNumber ||
    "—";

  const getStatus = (invoice) =>
    invoice?.status ||
    invoice?.invoiceStatus ||
    "DRAFT";

  const getTotal = (invoice) =>
    invoice?.grandTotal ??
    invoice?.totalAmount ??
    invoice?.total ??
    invoice?.grandAmount ??
    0;

  const getItems = (invoice) => {
    const items =
      invoice?.items ||
      invoice?.invoiceItems ||
      invoice?.products ||
      [];

    return Array.isArray(items) ? items : [];
  };

  const getBadgeVariant = (value) => {
    const status = String(value).toLowerCase();

    if (
      [
        "approved",
        "confirmed",
        "completed",
        "issued",
        "generated",
      ].includes(status)
    ) {
      return "success";
    }

    if (
      [
        "cancelled",
        "rejected",
        "void",
      ].includes(status)
    ) {
      return "danger";
    }

    if (
      [
        "pending",
        "draft",
        "processing",
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
    if (
      value === undefined ||
      value === null ||
      value === ""
    ) {
      return "₹0";
    }

    const amount = Number(value);

    if (Number.isNaN(amount)) {
      return "₹0";
    }

    return `₹${amount.toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;
  };

  const filteredInvoices = useMemo(() => {
    const query = search.trim().toLowerCase();

    return invoices.filter((invoice) => {
      const status = String(
        getStatus(invoice)
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
        getCustomerName(invoice),
        getInvoiceNumber(invoice),
        invoice?.customer?.phone,
        invoice?.customer?.mobile,
        invoice?.city,
        invoice?.state,
        invoice?.notes,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [
    invoices,
    search,
    statusFilter,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredInvoices.length /
        itemsPerPage
    )
  );

  const currentPage = Math.min(
    page,
    totalPages
  );

  const paginatedInvoices =
    filteredInvoices.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const handlePageChange = (nextPage) => {
    setPage(nextPage);
  };

  const handleDownloadPdf = async (invoice) => {
    try {
      const id =
        invoice?._id ||
        invoice?.id;

      if (!id) return;

      if (
        typeof invoiceService.downloadInvoicePdf ===
        "function"
      ) {
        await invoiceService.downloadInvoicePdf(
          id
        );
        return;
      }

      if (
        typeof invoiceService.generateInvoicePdf ===
        "function"
      ) {
        await invoiceService.generateInvoicePdf(
          id
        );
        return;
      }

      console.warn(
        "Invoice PDF service method is not available."
      );
    } catch (err) {
      console.error(
        "Invoice PDF download error:",
        err
      );
    }
  };

  if (authLoading || loading) {
    return (
      <div className="manager-invoices-loading">
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
      <div className="manager-invoices-page">
        <div className="manager-invoices-header">
          <div>
            <span className="manager-invoices-eyebrow">
              Manager Portal
            </span>

            <h1>Invoices</h1>

            <p>
              Review customer invoices and
              generated billing documents.
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

        {error && (
          <div className="manager-invoices-error">
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

        <div className="manager-invoices-toolbar">
          <SearchBox
            value={search}
            onChange={(value) => setSearch(value)}
            placeholder="Search invoice, customer..."
          />

          <select
            className="manager-invoices-status-filter"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
          >
            <option value="ALL">
              All Status
            </option>
            <option value="DRAFT">
              Draft
            </option>
            <option value="PENDING">
              Pending
            </option>
            <option value="ISSUED">
              Issued
            </option>
            <option value="GENERATED">
              Generated
            </option>
            <option value="APPROVED">
              Approved
            </option>
            <option value="COMPLETED">
              Completed
            </option>
            <option value="CANCELLED">
              Cancelled
            </option>
          </select>
        </div>

        <div className="manager-invoices-summary">
          <div className="manager-invoice-summary-card">
            <span>Total Invoices</span>
            <strong>
              {filteredInvoices.length}
            </strong>
          </div>

          <div className="manager-invoice-summary-card">
            <span>Issued</span>
            <strong>
              {
                filteredInvoices.filter(
                  (invoice) =>
                    [
                      "ISSUED",
                      "GENERATED",
                    ].includes(
                      String(
                        getStatus(invoice)
                      ).toUpperCase()
                    )
                ).length
              }
            </strong>
          </div>

          <div className="manager-invoice-summary-card">
            <span>Total Value</span>
            <strong>
              {formatCurrency(
                filteredInvoices.reduce(
                  (sum, invoice) =>
                    sum +
                    Number(
                      getTotal(invoice)
                    ),
                  0
                )
              )}
            </strong>
          </div>
        </div>

        <div className="manager-invoices-card">
          <div className="manager-invoices-table-wrapper">
            <table className="manager-invoices-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Customer</th>
                  <th>Invoice Date</th>
                  <th>Due Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {paginatedInvoices.length ===
                0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="manager-invoices-empty"
                    >
                      <div>
                        <span>▤</span>
                        <strong>
                          No invoices found
                        </strong>
                        <p>
                          Try changing your search
                          or status filter.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedInvoices.map(
                    (invoice, index) => (
                      <tr
                        key={
                          invoice?._id ||
                          invoice?.id ||
                          index
                        }
                      >
                        <td>
                          <div className="manager-invoice-number-block">
                            <strong>
                              {getInvoiceNumber(
                                invoice
                              )}
                            </strong>

                            <span>
                              {getItems(
                                invoice
                              ).length}{" "}
                              item
                              {getItems(
                                invoice
                              ).length !== 1
                                ? "s"
                                : ""}
                            </span>
                          </div>
                        </td>

                        <td>
                          <div className="manager-invoice-customer">
                            <div className="manager-invoice-avatar">
                              {getCustomerName(
                                invoice
                              )
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>
                              <strong>
                                {getCustomerName(
                                  invoice
                                )}
                              </strong>

                              <span>
                                {invoice?.customer
                                  ?.phone ||
                                  invoice?.customer
                                    ?.mobile ||
                                  "No phone"}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>
                          {formatDate(
                            invoice?.invoiceDate ||
                              invoice?.date ||
                              invoice?.createdAt
                          )}
                        </td>

                        <td>
                          {formatDate(
                            invoice?.dueDate
                          )}
                        </td>

                        <td>
                          <strong className="manager-invoice-amount">
                            {formatCurrency(
                              getTotal(invoice)
                            )}
                          </strong>
                        </td>

                        <td>
                          <Badge
                            variant={getBadgeVariant(
                              getStatus(invoice)
                            )}
                          >
                            {String(
                              getStatus(invoice)
                            ).replaceAll(
                              "_",
                              " "
                            )}
                          </Badge>
                        </td>

                        <td>
                          {formatDate(
                            invoice?.createdAt
                          )}
                        </td>

                        <td>
                          <div className="manager-invoice-actions">
                            <Button
                              type="button"
                              variant="secondary"
                              onClick={() =>
                                setSelectedInvoice(
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
                                handleDownloadPdf(
                                  invoice
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

          {filteredInvoices.length > 0 && (
            <div className="manager-invoices-pagination">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>

        {selectedInvoice && (
          <div
            className="manager-invoice-modal-overlay"
            onClick={() =>
              setSelectedInvoice(null)
            }
          >
            <div
              className="manager-invoice-modal"
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              <div className="manager-invoice-modal-header">
                <div>
                  <span>
                    Invoice Details
                  </span>

                  <h2>
                    {getInvoiceNumber(
                      selectedInvoice
                    )}
                  </h2>

                  <p>
                    {getCustomerName(
                      selectedInvoice
                    )}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedInvoice(null)
                  }
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              <div className="manager-invoice-modal-body">
                <div className="manager-invoice-info-grid">
                  <div>
                    <span>Customer</span>
                    <strong>
                      {getCustomerName(
                        selectedInvoice
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Status</span>

                    <Badge
                      variant={getBadgeVariant(
                        getStatus(
                          selectedInvoice
                        )
                      )}
                    >
                      {String(
                        getStatus(
                          selectedInvoice
                        )
                      ).replaceAll(
                        "_",
                        " "
                      )}
                    </Badge>
                  </div>

                  <div>
                    <span>Invoice Date</span>
                    <strong>
                      {formatDate(
                        selectedInvoice?.invoiceDate ||
                          selectedInvoice?.date ||
                          selectedInvoice?.createdAt
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Due Date</span>
                    <strong>
                      {formatDate(
                        selectedInvoice?.dueDate
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Phone</span>
                    <strong>
                      {selectedInvoice?.customer
                        ?.phone ||
                        selectedInvoice?.customer
                          ?.mobile ||
                        "—"}
                    </strong>
                  </div>

                  <div>
                    <span>Email</span>
                    <strong>
                      {selectedInvoice?.customer
                        ?.email ||
                        "—"}
                    </strong>
                  </div>
                </div>

                <div className="manager-invoice-items-section">
                  <div className="manager-invoice-section-heading">
                    <h3>Invoice Items</h3>
                    <span>
                      {getItems(
                        selectedInvoice
                      ).length}{" "}
                      item
                      {getItems(
                        selectedInvoice
                      ).length !== 1
                        ? "s"
                        : ""}
                    </span>
                  </div>

                  <div className="manager-invoice-items">
                    {getItems(
                      selectedInvoice
                    ).length === 0 ? (
                      <div className="manager-invoice-no-items">
                        No invoice items available.
                      </div>
                    ) : (
                      getItems(
                        selectedInvoice
                      ).map(
                        (item, index) => (
                          <div
                            className="manager-invoice-item"
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
                              )}
                            </strong>
                          </div>
                        )
                      )
                    )}
                  </div>
                </div>

                <div className="manager-invoice-tax-grid">
                  <div>
                    <span>Subtotal</span>
                    <strong>
                      {formatCurrency(
                        selectedInvoice?.subtotal ??
                          selectedInvoice?.subTotal ??
                          0
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>CGST</span>
                    <strong>
                      {formatCurrency(
                        selectedInvoice?.cgst ??
                          selectedInvoice?.taxes
                            ?.cgst ??
                          0
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>SGST</span>
                    <strong>
                      {formatCurrency(
                        selectedInvoice?.sgst ??
                          selectedInvoice?.taxes
                            ?.sgst ??
                          0
                      )}
                    </strong>
                  </div>
                </div>

                <div className="manager-invoice-total-box">
                  <span>Total Amount</span>
                  <strong>
                    {formatCurrency(
                      getTotal(selectedInvoice)
                    )}
                  </strong>
                </div>

                {selectedInvoice?.amountInWords && (
                  <div className="manager-invoice-words">
                    <span>
                      Amount in Words
                    </span>

                    <p>
                      {
                        selectedInvoice.amountInWords
                      }
                    </p>
                  </div>
                )}

                {selectedInvoice?.notes && (
                  <div className="manager-invoice-notes">
                    <span>Notes</span>

                    <p>
                      {selectedInvoice.notes}
                    </p>
                  </div>
                )}
              </div>

              <div className="manager-invoice-modal-footer">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    handleDownloadPdf(
                      selectedInvoice
                    )
                  }
                >
                  Download PDF
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    setSelectedInvoice(null)
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

export default ManagerInvoicesPage;