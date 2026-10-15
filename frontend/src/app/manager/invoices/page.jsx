"use client";

import React, { useEffect, useMemo, useState } from "react";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import SearchBox from "@/components/common/SearchBox";
import Pagination from "@/components/common/Pagination";
import Loader from "@/components/common/Loader";
import { useAuth } from "@/hooks/useAuth";
import invoiceService from "@/services/invoice.service";
import "./invoices.css";

const ManagerInvoicesPage = () => {
  const { user, loading: authLoading } = useAuth();

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [downloadId, setDownloadId] = useState("");

  const itemsPerPage = 10;

  /* =========================
     LOAD INVOICES
  ========================= */

  const loadInvoices = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await invoiceService.getInvoices();
      const payload = response?.data ?? response;
      const list =
        payload?.invoices ||
        payload?.data?.invoices ||
        payload?.items ||
        payload?.data?.items ||
        (Array.isArray(payload) ? payload : []);

      // List endpoints often omit InvoiceItem records. Hydrate each invoice
      // from the detail/items endpoints when those methods are available.
      const hydrated = await Promise.all(
        (Array.isArray(list) ? list : []).map(async (invoice) => {
          const id = invoice?._id || invoice?.id;
          let result = invoice;

          if (id && typeof invoiceService.getInvoiceById === "function") {
            try {
              const detailResponse = await invoiceService.getInvoiceById(id);
              const detailPayload = detailResponse?.data ?? detailResponse;
              const detailInvoice =
                detailPayload?.invoice ||
                detailPayload?.data?.invoice ||
                detailPayload?.data ||
                detailPayload;

              if (detailInvoice && typeof detailInvoice === "object") {
                result = { ...invoice, ...detailInvoice };
              }

              const detailItems = [
                detailPayload?.items,
                detailPayload?.invoiceItems,
                detailPayload?.lineItems,
                detailPayload?.data?.items,
                detailPayload?.data?.invoiceItems,
                detailPayload?.data?.lineItems,
                detailPayload?.data?.data?.items,
                detailInvoice?.items,
                detailInvoice?.invoiceItems,
                detailInvoice?.lineItems,
                detailInvoice?.quotation?.items,
                detailInvoice?.quotation?.quotationItems,
              ].find((value) => Array.isArray(value) && value.length > 0);

              if (detailItems) {
                result = { ...result, items: detailItems };
              }
            } catch (detailError) {
              console.warn("Unable to load invoice detail:", id, detailError);
            }
          }

          const currentItems =
            result?.items || result?.invoiceItems || result?.products;
          if (
            id &&
            (!Array.isArray(currentItems) || currentItems.length === 0) &&
            typeof invoiceService.getInvoiceItems === "function"
          ) {
            try {
              const itemsResponse = await invoiceService.getInvoiceItems(id);
              const itemsPayload = itemsResponse?.data ?? itemsResponse;
              const fetchedItems = [
                Array.isArray(itemsPayload) ? itemsPayload : null,
                itemsPayload?.items,
                itemsPayload?.invoiceItems,
                itemsPayload?.lineItems,
                itemsPayload?.data?.items,
                itemsPayload?.data?.invoiceItems,
                itemsPayload?.data?.lineItems,
                itemsPayload?.data?.data?.items,
                itemsPayload?.data?.data?.invoiceItems,
              ].find((value) => Array.isArray(value) && value.length > 0);
              if (fetchedItems) {
                result = { ...result, items: fetchedItems };
              }
            } catch (itemsError) {
              console.warn("Unable to load invoice items:", id, itemsError);
            }
          }

          return result;
        })
      );

      setInvoices(hydrated);
    } catch (err) {
      console.error("Invoices error:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
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

  /* =========================
     HELPERS
  ========================= */

  const getCustomerDetails = (invoice) =>
    invoice?.customerDetails ||
    invoice?.customerSnapshot ||
    invoice?.billingDetails ||
    invoice?.customer ||
    invoice?.lead ||
    {};

  const getCustomerName = (invoice) => {
    const customer = getCustomerDetails(invoice);
    return (
      customer?.name ||
      customer?.fullName ||
      customer?.customerName ||
      customer?.companyName ||
      invoice?.customerName ||
      invoice?.lead?.customerName ||
      "Unnamed Customer"
    );
  };

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
    invoice?.amount ??
    invoice?.netAmount ??
    invoice?.totalPayable ??
    invoice?.quotation?.grandTotal ??
    null;

  const getItems = (invoice) => {
    const candidates = [
      invoice?.items,
      invoice?.invoiceItems,
      invoice?.lineItems,
      invoice?.products,
      invoice?.quotationItems,
      invoice?.quotation?.items,
      invoice?.quotation?.quotationItems,
      invoice?.quotation?.lineItems,
      invoice?.quotation?.products,
      invoice?.data?.items,
      invoice?.data?.invoiceItems,
    ];
    return candidates.find((value) => Array.isArray(value) && value.length > 0) ||
      candidates.find(Array.isArray) ||
      [];
  };

  const getCustomerPhone = (invoice) => {
    const customer = getCustomerDetails(invoice);
    return (
      customer?.mobile ||
      customer?.phone ||
      customer?.contactNumber ||
      invoice?.mobile ||
      invoice?.phone ||
      invoice?.lead?.mobile ||
      "—"
    );
  };

  const getCustomerEmail = (invoice) => {
    const customer = getCustomerDetails(invoice);
    return customer?.email || invoice?.email || "—";
  };

  const getItemName = (item, index) =>
    item?.name ||
    item?.itemName ||
    item?.productName ||
    item?.serviceName ||
    item?.description ||
    item?.title ||
    `Item ${index + 1}`;

  const getItemAmount = (item) => {
    const direct =
      item?.totalAmount ??
      item?.lineTotal ??
      item?.total ??
      item?.amount;
    if (direct !== undefined && direct !== null && direct !== "") {
      return Number(direct) || 0;
    }
    const quantity = Number(item?.quantity ?? item?.qty ?? 1) || 1;
    const price = Number(
      item?.unitPrice ?? item?.rate ?? item?.price ?? item?.sellingPrice ?? 0
    ) || 0;
    const tax = Number(item?.taxAmount ?? item?.gstAmount ?? 0) || 0;
    const discount = Number(item?.discountAmount ?? item?.discount ?? 0) || 0;
    return Math.max(quantity * price - discount + tax, 0);
  };

  const getTaxValue = (invoice, taxName) => {
    const title = taxName.toLowerCase();
    const aliases = {
      cgst: ["cgst", "cgstAmount", "centralTax"],
      sgst: ["sgst", "sgstAmount", "stateTax"],
      igst: ["igst", "igstAmount", "integratedTax"],
    };
    for (const key of aliases[title] || [title]) {
      const value = invoice?.[key] ?? invoice?.taxes?.[key];
      if (value !== undefined && value !== null && value !== "") {
        return Number(value) || 0;
      }
    }
    const itemTax = getItems(invoice).reduce(
      (sum, item) => sum + (Number(item?.[`${title}Amount`]) || 0),
      0
    );
    return itemTax;
  };

  const getSubtotal = (invoice) => {
    const saved =
      invoice?.subtotal ??
      invoice?.subTotal ??
      invoice?.taxableAmount ??
      invoice?.taxableValue;
    if (saved !== undefined && saved !== null && saved !== "") {
      return Number(saved) || 0;
    }
    return getItems(invoice).reduce((sum, item) => {
      const qty = Number(item?.quantity ?? item?.qty ?? 1) || 1;
      const price = Number(
        item?.unitPrice ?? item?.rate ?? item?.price ?? item?.sellingPrice ?? 0
      ) || 0;
      return sum + (Number(item?.grossAmount) || qty * price);
    }, 0);
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
      return "—";
    }

    const amount = Number(value);

    if (Number.isNaN(amount)) {
      return "—";
    }

    return `₹${amount.toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;
  };

  /* =========================
     FILTER
  ========================= */

  const filteredInvoices = useMemo(() => {
    const query = search.trim().toLowerCase();

    return invoices.filter((invoice) => {
      const status = String(getStatus(invoice)).toUpperCase();

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
        getCustomerPhone(invoice),
        getCustomerEmail(invoice),
        getCustomerDetails(invoice)?.city,
        getCustomerDetails(invoice)?.state,
        getCustomerDetails(invoice)?.address,
        invoice?.notes,
      ]
        .filter(Boolean)
        .map((value) => String(value))
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [invoices, search, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredInvoices.length / itemsPerPage
    )
  );

  const currentPage = Math.min(page, totalPages);

  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const handlePageChange = (nextPage) => {
    setPage(nextPage);
  };

  const handleViewInvoice = async (invoice) => {
    setSelectedInvoice(invoice);
    const id = invoice?._id || invoice?.id;
    if (!id) return;

    try {
      let detailed = invoice;
      if (typeof invoiceService.getInvoiceById === "function") {
        const response = await invoiceService.getInvoiceById(id);
        const payload = response?.data ?? response;
        const detail =
          payload?.invoice ||
          payload?.data?.invoice ||
          payload?.data?.data?.invoice ||
          payload?.data?.data ||
          payload?.data ||
          payload;
        if (detail && typeof detail === "object") {
          detailed = { ...invoice, ...detail };
        }

        const detailItems = [
          payload?.items,
          payload?.invoiceItems,
          payload?.lineItems,
          payload?.data?.items,
          payload?.data?.invoiceItems,
          payload?.data?.lineItems,
          payload?.data?.data?.items,
          detail?.items,
          detail?.invoiceItems,
          detail?.lineItems,
          detail?.quotation?.items,
          detail?.quotation?.quotationItems,
        ].find((value) => Array.isArray(value) && value.length > 0);
        if (detailItems) detailed = { ...detailed, items: detailItems };
      }

      if (
        getItems(detailed).length === 0 &&
        typeof invoiceService.getInvoiceItems === "function"
      ) {
        const response = await invoiceService.getInvoiceItems(id);
        const payload = response?.data ?? response;
        const fetchedItems = [
          Array.isArray(payload) ? payload : null,
          payload?.items,
          payload?.invoiceItems,
          payload?.lineItems,
          payload?.data?.items,
          payload?.data?.invoiceItems,
          payload?.data?.lineItems,
          payload?.data?.data?.items,
        ].find((value) => Array.isArray(value) && value.length > 0);
        if (fetchedItems) detailed = { ...detailed, items: fetchedItems };
      }

      setSelectedInvoice(detailed);
      setInvoices((current) =>
        current.map((item) =>
          String(item?._id || item?.id) === String(id)
            ? { ...item, ...detailed }
            : item
        )
      );
    } catch (err) {
      console.error("Unable to load invoice details/items:", err);
    }
  };

  /* =========================
     PDF
  ========================= */

  const escapeHtml = (value) =>
    String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const handleDownloadPdf = async (invoice) => {
    const id = invoice?._id || invoice?.id;
    if (!id) {
      window.alert("Invoice ID missing hai. PDF download nahi ho sakta.");
      return;
    }

    try {
      setDownloadId(String(id));

      // Download the server-generated PDF directly, like the quotation page.
      // This path must return a Blob; it must not open the print dialog.
      const pdfMethod =
        invoiceService.getInvoicePdf ||
        invoiceService.downloadInvoicePdf ||
        invoiceService.generateInvoicePdf;

      if (typeof pdfMethod !== "function") {
        throw new Error(
          "invoice.service.js mein getInvoicePdf(id) method add karein jo /pdf/invoice/:id ko responseType: 'blob' ke saath call kare."
        );
      }

      const response = await pdfMethod.call(invoiceService, id);
      let blob =
        response instanceof Blob
          ? response
          : response?.data instanceof Blob
            ? response.data
            : null;

      if (
        !blob &&
        (response instanceof ArrayBuffer || ArrayBuffer.isView(response))
      ) {
        blob = new Blob([response], { type: "application/pdf" });
      }

      if (!blob || blob.size === 0) {
        const message =
          response?.data?.message ||
          response?.message ||
          "Server se valid PDF nahi aayi. Invoice PDF API check karein.";
        throw new Error(message);
      }

      if (
        blob.type &&
        !blob.type.includes("pdf") &&
        blob.type !== "application/octet-stream"
      ) {
        const bodyText = await blob.text().catch(() => "");
        let message = "Server response PDF format mein nahi hai.";
        try {
          const body = JSON.parse(bodyText);
          message = body?.message || body?.error || message;
        } catch {}
        throw new Error(message);
      }

      const pdfBlob =
        blob.type === "application/pdf"
          ? blob
          : new Blob([blob], { type: "application/pdf" });
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${getInvoiceNumber(invoice) || "invoice"}.pdf`.replace(
        /[^a-z0-9._-]/gi,
        "_"
      );
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => window.URL.revokeObjectURL(url), 1500);
    } catch (err) {
      console.error("Invoice PDF download error:", err);
      window.alert(
        err?.response?.data?.message ||
          err?.message ||
          "Invoice PDF download failed. Invoice PDF API check karein."
      );
    } finally {
      setDownloadId("");
    }
  };

  /* =========================
     LOADING
  ========================= */

  if (authLoading || loading) {
    return (
      <div className="manager-invoices-loading">
        <Loader />
      </div>
    );
  }

  /* =========================
     PAGE
  ========================= */

  return (
    <div className="manager-invoices-page">
      {/* HEADER */}
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

      {/* ERROR */}
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

      {/* TOOLBAR */}
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
            setStatusFilter(event.target.value)
          }
        >
          <option value="ALL">All Status</option>
          <option value="DRAFT">Draft</option>
          <option value="PENDING">Pending</option>
          <option value="ISSUED">Issued</option>
          <option value="GENERATED">Generated</option>
          <option value="APPROVED">Approved</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* SUMMARY */}
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
              filteredInvoices.filter((invoice) =>
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
                  sum + Number(getTotal(invoice)),
                0
              )
            )}
          </strong>
        </div>
      </div>

      {/* TABLE */}
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
              {paginatedInvoices.length === 0 ? (
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
                      {/* INVOICE */}
                      <td>
                        <div className="manager-invoice-number-block">
                          <strong>
                            {getInvoiceNumber(invoice)}
                          </strong>

                          <span>
                            {getItems(invoice).length}{" "}
                            item
                            {getItems(invoice).length !==
                            1
                              ? "s"
                              : ""}
                          </span>
                        </div>
                      </td>

                      {/* CUSTOMER */}
                      <td>
                        <div className="manager-invoice-customer">
                          <div className="manager-invoice-avatar">
                            {getCustomerName(invoice)
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <strong>
                              {getCustomerName(invoice)}
                            </strong>

                            <span>
                              {getCustomerPhone(invoice)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* INVOICE DATE */}
                      <td>
                        {formatDate(
                          invoice?.invoiceDate ||
                            invoice?.date ||
                            invoice?.createdAt
                        )}
                      </td>

                      {/* DUE DATE */}
                      <td>
                        {formatDate(
                          invoice?.dueDate
                        )}
                      </td>

                      {/* AMOUNT */}
                      <td>
                        <strong className="manager-invoice-amount">
                          {formatCurrency(
                            getTotal(invoice)
                          )}
                        </strong>
                      </td>

                      {/* STATUS */}
                      <td>
                        <Badge
                          variant={getBadgeVariant(
                            getStatus(invoice)
                          )}
                        >
                          {String(
                            getStatus(invoice)
                          ).replaceAll("_", " ")}
                        </Badge>
                      </td>

                      {/* CREATED */}
                      <td>
                        {formatDate(
                          invoice?.createdAt
                        )}
                      </td>

                      {/* ACTIONS */}
                      <td>
                        <div className="manager-invoice-actions">
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => handleViewInvoice(invoice)}
                          >
                            View
                          </Button>

                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() =>
                              handleDownloadPdf(invoice)
                            }
                            disabled={downloadId === String(invoice?._id || invoice?.id)}
                            loading={downloadId === String(invoice?._id || invoice?.id)}
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

        {/* PAGINATION */}
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

      {/* INVOICE MODAL */}
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
            {/* MODAL HEADER */}
            <div className="manager-invoice-modal-header">
              <div>
                <span>Invoice Details</span>

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

            {/* MODAL BODY */}
            <div className="manager-invoice-modal-body">
              {/* INFO */}
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
                      getStatus(selectedInvoice)
                    )}
                  >
                    {String(
                      getStatus(selectedInvoice)
                    ).replaceAll("_", " ")}
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
                    {getCustomerPhone(selectedInvoice)}
                  </strong>
                </div>

                <div>
                  <span>Email</span>

                  <strong>
                    {getCustomerEmail(selectedInvoice)}
                  </strong>
                </div>
              </div>

              {/* ITEMS */}
              <div className="manager-invoice-items-section">
                <div className="manager-invoice-section-heading">
                  <h3>Invoice Items</h3>

                  <span>
                    {getItems(
                      selectedInvoice
                    ).length}{" "}
                    item
                    {getItems(selectedInvoice)
                      .length !== 1
                      ? "s"
                      : ""}
                  </span>
                </div>

                <div className="manager-invoice-items">
                  {getItems(selectedInvoice)
                    .length === 0 ? (
                    <div className="manager-invoice-no-items">
                      No invoice items available.
                    </div>
                  ) : (
                    getItems(
                      selectedInvoice
                    ).map((item, index) => (
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
                            {getItemName(item, index)}
                          </strong>

                          {item?.description &&
                            item?.name && (
                              <span>
                                {item.description}
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
                    ))
                  )}
                </div>
              </div>

              {/* TAX */}
              <div className="manager-invoice-tax-grid">
                <div>
                  <span>Subtotal</span>

                  <strong>
                    {formatCurrency(
                      getSubtotal(selectedInvoice)
                    )}
                  </strong>
                </div>

                <div>
                  <span>CGST</span>

                  <strong>
                    {formatCurrency(
                      getTaxValue(selectedInvoice, "cgst")
                    )}
                  </strong>
                </div>

                <div>
                  <span>SGST</span>

                  <strong>
                    {formatCurrency(
                      getTaxValue(selectedInvoice, "sgst")
                    )}
                  </strong>
                </div>
              </div>

              {/* TOTAL */}
              <div className="manager-invoice-total-box">
                <span>Total Amount</span>

                <strong>
                  {formatCurrency(
                    getTotal(selectedInvoice)
                  )}
                </strong>
              </div>

              {/* AMOUNT IN WORDS */}
              {selectedInvoice?.amountInWords && (
                <div className="manager-invoice-words">
                  <span>Amount in Words</span>

                  <p>
                    {selectedInvoice.amountInWords}
                  </p>
                </div>
              )}

              {/* NOTES */}
              {selectedInvoice?.notes && (
                <div className="manager-invoice-notes">
                  <span>Notes</span>

                  <p>
                    {selectedInvoice.notes}
                  </p>
                </div>
              )}
            </div>

            {/* MODAL FOOTER */}
            <div className="manager-invoice-modal-footer">
              <Button
                type="button"
                variant="secondary"
                onClick={() => handleDownloadPdf(selectedInvoice)}
                disabled={downloadId === String(selectedInvoice?._id || selectedInvoice?.id)}
                loading={downloadId === String(selectedInvoice?._id || selectedInvoice?.id)}
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
  );
};

export default ManagerInvoicesPage;