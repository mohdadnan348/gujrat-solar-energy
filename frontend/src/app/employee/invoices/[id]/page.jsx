"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import Loader from "@/components/common/Loader";

import invoiceService from "@/services/invoice.service";
import pdfService from "@/services/pdf.service";

import "./invoice-details.css";

const EmployeeInvoiceDetailsPage = () => {
  const params = useParams();
  const router = useRouter();

  const invoiceId = params?.id;

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  const getValue = (
    object,
    keys,
    fallback = ""
  ) => {
    if (!object) return fallback;

    for (const key of keys) {
      const value = object?.[key];

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

  const getId = (object) => {
    if (!object) return "";

    if (typeof object === "string") {
      return object;
    }

    return object?._id || object?.id || "";
  };

  /*
   * IMPORTANT:
   * Backend response is:
   *
   * {
   *   invoice: {...},
   *   items: [...]
   * }
   *
   * Axios may wrap it:
   *
   * {
   *   data: {
   *     invoice: {...},
   *     items: [...]
   *   }
   * }
   *
   * So items are explicitly merged into invoice.
   */
  const normalizeInvoice = (response) => {
    if (!response) return null;

    // Axios response:
    // response.data.invoice + response.data.items
    if (response?.data?.invoice) {
      const invoiceData = response.data.invoice;

      return {
        ...invoiceData,
        items: Array.isArray(response.data.items)
          ? response.data.items
          : Array.isArray(invoiceData.items)
            ? invoiceData.items
            : Array.isArray(invoiceData.invoiceItems)
              ? invoiceData.invoiceItems
              : [],
      };
    }

    // Direct:
    // response.invoice + response.items
    if (response?.invoice) {
      const invoiceData = response.invoice;

      return {
        ...invoiceData,
        items: Array.isArray(response.items)
          ? response.items
          : Array.isArray(invoiceData.items)
            ? invoiceData.items
            : Array.isArray(invoiceData.invoiceItems)
              ? invoiceData.invoiceItems
              : [],
      };
    }

    // Direct invoice object
    if (
      response?.data &&
      !Array.isArray(response.data)
    ) {
      return response.data;
    }

    return response;
  };

  const loadInvoice = async (showRefresh = false) => {
    if (!invoiceId) return;

    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response =
        await invoiceService.getInvoiceById(invoiceId);

      const normalized =
        normalizeInvoice(response);

      setInvoice(normalized);
    } catch (err) {
      console.error(
        "Failed to load employee invoice:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load invoice details."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadInvoice();
  }, [invoiceId]);

  const customer = useMemo(() => {
    const value = getValue(
      invoice,
      ["customer"],
      null
    );

    return value &&
      typeof value === "object"
      ? value
      : null;
  }, [invoice]);

  const items = useMemo(() => {
    const value = getValue(
      invoice,
      ["items", "invoiceItems"],
      []
    );

    return Array.isArray(value)
      ? value
      : [];
  }, [invoice]);

  const invoiceNumber = getValue(
    invoice,
    [
      "invoiceNumber",
      "invoiceNo",
      "number",
    ],
    "Invoice"
  );

  const customerName = getValue(
    customer,
    [
      "name",
      "fullName",
      "customerName",
      "companyName",
    ],
    getValue(
      invoice,
      ["customerName"],
      "Customer"
    )
  );

  const customerCompany = getValue(
    customer,
    ["companyName"],
    ""
  );

  const customerPhone = getValue(
    customer,
    [
      "phone",
      "mobile",
      "phoneNumber",
    ],
    getValue(
      invoice,
      ["customerPhone", "phone"],
      ""
    )
  );

  const customerEmail = getValue(
    customer,
    [
      "email",
      "emailAddress",
    ],
    getValue(
      invoice,
      ["customerEmail", "email"],
      ""
    )
  );

  const customerAddress = getValue(
    customer,
    [
      "address",
      "fullAddress",
    ],
    getValue(
      invoice,
      ["customerAddress"],
      ""
    )
  );

  const customerCity = getValue(
    customer,
    ["city"],
    ""
  );

  const customerState = getValue(
    customer,
    ["state"],
    ""
  );

  const customerPincode = getValue(
    customer,
    [
      "pincode",
      "pinCode",
    ],
    ""
  );

  const invoiceDate = getValue(
    invoice,
    [
      "invoiceDate",
      "date",
      "createdAt",
    ],
    ""
  );

  const dueDate = getValue(
    invoice,
    ["dueDate"],
    ""
  );

  const status = String(
    getValue(
      invoice,
      ["status"],
      "DRAFT"
    )
  ).toUpperCase();

  const title = getValue(
    invoice,
    ["title"],
    "Solar System Invoice"
  );

  const notes = getValue(
    invoice,
    ["notes"],
    ""
  );

  /*
   * Backend should be the source of truth.
   * If a backend total is unavailable, calculate from items.
   */

  const calculatedSubtotal = useMemo(() => {
    return items.reduce(
      (sum, item) => {
        const quantity =
          Number(
            getValue(
              item,
              ["quantity"],
              0
            )
          ) || 0;

        const rate =
          Number(
            getValue(
              item,
              [
                "rate",
                "unitPrice",
                "price",
              ],
              0
            )
          ) || 0;

        return sum + quantity * rate;
      },
      0
    );
  }, [items]);

  const calculatedTax = useMemo(() => {
    return items.reduce(
      (sum, item) => {
        const quantity =
          Number(
            getValue(
              item,
              ["quantity"],
              0
            )
          ) || 0;

        const rate =
          Number(
            getValue(
              item,
              [
                "rate",
                "unitPrice",
                "price",
              ],
              0
            )
          ) || 0;

        const taxRate =
          Number(
            getValue(
              item,
              [
                "taxRate",
                "tax",
              ],
              0
            )
          ) || 0;

        return (
          sum +
          (quantity * rate * taxRate) /
            100
        );
      },
      0
    );
  }, [items]);

  const subtotal = Number(
    getValue(
      invoice,
      ["subtotal"],
      calculatedSubtotal
    )
  ) || 0;

  const taxTotal = Number(
    getValue(
      invoice,
      [
        "taxTotal",
        "totalTax",
        "taxAmount",
      ],
      calculatedTax
    )
  ) || 0;

  const discount = Number(
    getValue(
      invoice,
      [
        "discount",
        "totalDiscount",
      ],
      0
    )
  ) || 0;

  const additionalCharges =
    Number(
      getValue(
        invoice,
        [
          "additionalCharges",
          "extraCharges",
        ],
        0
      )
    ) || 0;

  const grandTotal = Number(
    getValue(
      invoice,
      [
        "grandTotal",
        "totalAmount",
        "total",
        "finalAmount",
      ],
      subtotal +
        taxTotal -
        discount +
        additionalCharges
    )
  ) || 0;

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "—";
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

  const formatCurrency = (value) => {
    return `₹${Number(
      value || 0
    ).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getStatusVariant = (
    currentStatus
  ) => {
    switch (
      String(
        currentStatus || ""
      ).toUpperCase()
    ) {
      case "ISSUED":
      case "SENT":
      case "ACTIVE":
      case "APPROVED":
      case "PAID":
      case "COMPLETED":
        return "success";

      case "DRAFT":
      case "PENDING":
      case "PROCESSING":
        return "default";

      case "OVERDUE":
        return "warning";

      case "CANCELLED":
      case "REJECTED":
      case "VOID":
        return "danger";

      default:
        return "default";
    }
  };

  const getItemDescription = (
    item
  ) => {
    return getValue(
      item,
      [
        "description",
        "itemName",
        "name",
        "productName",
      ],
      "Invoice Item"
    );
  };

  const getItemQuantity = (
    item
  ) => {
    return Number(
      getValue(
        item,
        ["quantity"],
        0
      )
    ) || 0;
  };

  const getItemUnit = (item) => {
    return getValue(
      item,
      ["unit"],
      "Unit"
    );
  };

  const getItemRate = (item) => {
    return Number(
      getValue(
        item,
        [
          "rate",
          "unitPrice",
          "price",
        ],
        0
      )
    ) || 0;
  };

  const getItemTaxRate = (
    item
  ) => {
    return Number(
      getValue(
        item,
        [
          "taxRate",
          "tax",
        ],
        0
      )
    ) || 0;
  };

  const getItemTotal = (item) => {
    const quantity =
      getItemQuantity(item);

    const rate =
      getItemRate(item);

    return quantity * rate;
  };

  const handleDownloadPDF = async () => {
    try {
      setDownloading(true);
      setError("");

      if (
        typeof pdfService.downloadInvoicePdf !==
        "function"
      ) {
        throw new Error(
          "Invoice PDF service is not available."
        );
      }

      await pdfService.downloadInvoicePdf(
        invoiceId
      );
    } catch (err) {
      console.error(
        "Error downloading employee invoice PDF:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to download invoice PDF."
      );
    } finally {
      setDownloading(false);
    }
  };

  const handleEdit = () => {
    router.push(
      `/employee/invoices/create?edit=${invoiceId}`
    );
  };

  if (loading) {
    return (
      <div className="employee-invoice-details-loading">
        <Loader />
        <p>
          Loading invoice details...
        </p>
      </div>
    );
  }

  if (error && !invoice) {
    return (
      <div className="employee-invoice-details-page">
        <div className="employee-invoice-details-error-state">
          <div className="employee-invoice-error-icon">
            !
          </div>

          <h2>
            Invoice could not be loaded
          </h2>

          <p>{error}</p>

          <div className="employee-invoice-error-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                router.push(
                  "/employee/invoices"
                )
              }
            >
              Back to Invoices
            </Button>

            <Button
              type="button"
              variant="primary"
              onClick={() =>
                loadInvoice()
              }
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="employee-invoice-details-page">
        <div className="employee-invoice-details-error-state">
          <h2>
            Invoice not found
          </h2>

          <Button
            type="button"
            variant="primary"
            onClick={() =>
              router.push(
                "/employee/invoices"
              )
            }
          >
            Back to Invoices
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="employee-invoice-details-page">

      {/* =========================
          HEADER
      ========================== */}

      <div className="employee-invoice-details-header">

        <div>
          <button
            type="button"
            className="employee-invoice-back-button"
            onClick={() =>
              router.push(
                "/employee/invoices"
              )
            }
          >
            ← Back to Invoices
          </button>

          <div className="employee-invoice-title-row">

            <div className="employee-invoice-title-icon">
              IN
            </div>

            <div>
              <div className="employee-invoice-title-top">

                <h1>
                  {invoiceNumber}
                </h1>

                <Badge
                  variant={getStatusVariant(
                    status
                  )}
                >
                  {status.replaceAll(
                    "_",
                    " "
                  )}
                </Badge>

              </div>

              <p>
                {title}
              </p>
            </div>

          </div>
        </div>

        <div className="employee-invoice-header-actions">

          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              loadInvoice(true)
            }
            disabled={refreshing}
          >
            {refreshing
              ? "Refreshing..."
              : "↻ Refresh"}
          </Button>

          <Button
            type="button"
            variant="secondary"
            onClick={
              handleDownloadPDF
            }
            disabled={downloading}
          >
            {downloading
              ? "Preparing PDF..."
              : "Download PDF"}
          </Button>

          <Button
            type="button"
            variant="primary"
            onClick={handleEdit}
          >
            Edit Invoice
          </Button>

        </div>
      </div>

      {error && (
        <div className="employee-invoice-inline-error">
          {error}
        </div>
      )}

      {/* =========================
          META
      ========================== */}

      <div className="employee-invoice-meta-grid">

        <div>
          <span>
            Invoice Date
          </span>

          <strong>
            {formatDate(
              invoiceDate
            )}
          </strong>
        </div>

        <div>
          <span>
            Due Date
          </span>

          <strong>
            {formatDate(
              dueDate
            )}
          </strong>
        </div>

        <div>
          <span>
            Items
          </span>

          <strong>
            {items.length}
          </strong>
        </div>

        <div>
          <span>
            Grand Total
          </span>

          <strong className="employee-invoice-meta-total">
            {formatCurrency(
              grandTotal
            )}
          </strong>
        </div>

      </div>

      {/* =========================
          MAIN LAYOUT
      ========================== */}

      <div className="employee-invoice-details-layout">

        <main className="employee-invoice-details-main">

          {/* =========================
              CUSTOMER
          ========================== */}

          <section className="employee-invoice-detail-card">

            <div className="employee-invoice-card-header">
              <div>
                <h2>
                  Bill To
                </h2>

                <p>
                  Customer information for this
                  invoice.
                </p>
              </div>
            </div>

            <div className="employee-invoice-customer-section">

              <div className="employee-invoice-customer-avatar">
                {String(
                  customerName
                )
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div className="employee-invoice-customer-info">

                <h3>
                  {customerName}
                </h3>

                {customerCompany && (
                  <p>
                    {customerCompany}
                  </p>
                )}

                <div className="employee-invoice-customer-contact">

                  {customerPhone && (
                    <span>
                      ☎ {customerPhone}
                    </span>
                  )}

                  {customerEmail && (
                    <span>
                      ✉ {customerEmail}
                    </span>
                  )}

                </div>

                {customerAddress && (
                  <div className="employee-invoice-customer-address">

                    <span>
                      {customerAddress}
                    </span>

                    {[
                      customerCity,
                      customerState,
                      customerPincode,
                    ].filter(Boolean)
                      .length > 0 && (
                      <span>
                        {[
                          customerCity,
                          customerState,
                          customerPincode,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    )}

                  </div>
                )}

              </div>

            </div>
          </section>

          {/* =========================
              INVOICE ITEMS
          ========================== */}

          <section className="employee-invoice-detail-card">

            <div className="employee-invoice-card-header">
              <div>
                <h2>
                  Invoice Items
                </h2>

                <p>
                  Products and services included
                  in this invoice.
                </p>
              </div>
            </div>

            {items.length === 0 ? (
              <div className="employee-invoice-empty-items">
                No invoice items available.
              </div>
            ) : (
              <div className="employee-invoice-items-wrapper">

                <table className="employee-invoice-items-table">

                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Description</th>
                      <th>Quantity</th>
                      <th>Unit</th>
                      <th>Rate</th>
                      <th>Tax</th>
                      <th>Total</th>
                    </tr>
                  </thead>

                  <tbody>
                    {items.map(
                      (
                        item,
                        index
                      ) => (
                        <tr
                          key={
                            getId(
                              item
                            ) ||
                            index
                          }
                        >
                          <td>
                            {index + 1}
                          </td>

                          <td>
                            <strong>
                              {getItemDescription(
                                item
                              )}
                            </strong>
                          </td>

                          <td>
                            {getItemQuantity(
                              item
                            )}
                          </td>

                          <td>
                            {getItemUnit(
                              item
                            )}
                          </td>

                          <td>
                            {formatCurrency(
                              getItemRate(
                                item
                              )
                            )}
                          </td>

                          <td>
                            {getItemTaxRate(
                              item
                            )}
                            %
                          </td>

                          <td>
                            <strong>
                              {formatCurrency(
                                getItemTotal(
                                  item
                                )
                              )}
                            </strong>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>

                </table>
              </div>
            )}
          </section>

          {/* =========================
              NOTES
          ========================== */}

          {notes && (
            <section className="employee-invoice-detail-card">

              <div className="employee-invoice-card-header">
                <div>
                  <h2>
                    Notes
                  </h2>

                  <p>
                    Additional information for
                    this invoice.
                  </p>
                </div>
              </div>

              <div className="employee-invoice-notes">
                {notes}
              </div>

            </section>
          )}

        </main>

        {/* =========================
            SIDEBAR
        ========================== */}

        <aside className="employee-invoice-details-sidebar">

          {/* Summary */}

          <section className="employee-invoice-summary-card">

            <div className="employee-invoice-summary-header">

              <h2>
                Invoice Summary
              </h2>

              <Badge
                variant={getStatusVariant(
                  status
                )}
              >
                {status.replaceAll(
                  "_",
                  " "
                )}
              </Badge>

            </div>

            <div className="employee-invoice-summary-body">

              <div className="employee-invoice-summary-row">
                <span>
                  Subtotal
                </span>

                <strong>
                  {formatCurrency(
                    subtotal
                  )}
                </strong>
              </div>

              <div className="employee-invoice-summary-row">
                <span>
                  Tax
                </span>

                <strong>
                  {formatCurrency(
                    taxTotal
                  )}
                </strong>
              </div>

              <div className="employee-invoice-summary-row">
                <span>
                  Discount
                </span>

                <strong>
                  -{" "}
                  {formatCurrency(
                    discount
                  )}
                </strong>
              </div>

              <div className="employee-invoice-summary-row">
                <span>
                  Additional Charges
                </span>

                <strong>
                  {formatCurrency(
                    additionalCharges
                  )}
                </strong>
              </div>

              <div className="employee-invoice-summary-total">

                <span>
                  Grand Total
                </span>

                <strong>
                  {formatCurrency(
                    grandTotal
                  )}
                </strong>

              </div>

            </div>
          </section>

          {/* Invoice Information */}

          <section className="employee-invoice-sidebar-card">

            <div className="employee-invoice-sidebar-heading">
              <h2>
                Invoice Information
              </h2>
            </div>

            <div className="employee-invoice-record-list">

              <div>
                <span>
                  Invoice Number
                </span>

                <strong>
                  {invoiceNumber}
                </strong>
              </div>

              <div>
                <span>
                  Invoice Date
                </span>

                <strong>
                  {formatDate(
                    invoiceDate
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Due Date
                </span>

                <strong>
                  {formatDate(
                    dueDate
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Created On
                </span>

                <strong>
                  {formatDate(
                    invoice?.createdAt
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Last Updated
                </span>

                <strong>
                  {formatDate(
                    invoice?.updatedAt
                  )}
                </strong>
              </div>

            </div>
          </section>

          {/* Actions */}

          <section className="employee-invoice-sidebar-actions">

            <Button
              type="button"
              variant="primary"
              onClick={
                handleDownloadPDF
              }
              disabled={downloading}
            >
              {downloading
                ? "Preparing PDF..."
                : "Download Invoice PDF"}
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={handleEdit}
            >
              Edit Invoice
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                router.push(
                  "/employee/invoices"
                )
              }
            >
              Back to Invoices
            </Button>

          </section>

        </aside>

      </div>
    </div>
  );
};

export default EmployeeInvoiceDetailsPage;