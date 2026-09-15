"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import AdminLayout from "../../layout";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import Loader from "@/components/common/Loader";
import Modal from "@/components/common/Modal";

import { invoiceService } from "@/services/invoice.service";
import { pdfService } from "@/services/pdf.service";

import "./invoice-details.css";

const InvoiceDetailsPage = () => {
  const params = useParams();
  const router = useRouter();

  const invoiceId = params?.id;

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

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

    return (
      object?._id ||
      object?.id ||
      ""
    );
  };

  const normalizeInvoice = (response) => {
    if (!response) return null;

    if (response?.data?.invoice) {
      return response.data.invoice;
    }

    if (response?.invoice) {
      return response.invoice;
    }

    if (
      response?.data &&
      !Array.isArray(response.data)
    ) {
      return response.data;
    }

    return response;
  };

  const loadInvoice = async (
    showRefresh = false
  ) => {
    if (!invoiceId) return;

    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response =
        await invoiceService.getInvoiceById(
          invoiceId
        );

      setInvoice(
        normalizeInvoice(response)
      );
    } catch (err) {
      console.error(
        "Failed to load invoice:",
        err
      );

      setError(
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
    ["email", "emailAddress"],
    getValue(
      invoice,
      ["customerEmail", "email"],
      ""
    )
  );

  const customerAddress = getValue(
    customer,
    ["address", "fullAddress"],
    getValue(
      invoice,
      ["customerAddress"],
      ""
    )
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

  const subtotal = Number(
    getValue(
      invoice,
      ["subtotal"],
      items.reduce(
        (sum, item) =>
          sum +
          (Number(
            getValue(
              item,
              ["quantity"],
              0
            )
          ) || 0) *
            (Number(
              getValue(
                item,
                [
                  "rate",
                  "unitPrice",
                  "price",
                ],
                0
              )
            ) || 0),
        0
      )
    )
  );

  const taxTotal = Number(
    getValue(
      invoice,
      [
        "taxTotal",
        "totalTax",
        "taxAmount",
      ],
      items.reduce(
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
            (quantity *
              rate *
              taxRate) /
              100
          );
        },
        0
      )
    )
  );

  const discount = Number(
    getValue(
      invoice,
      ["discount"],
      0
    )
  );

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
    );

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
  );

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
        return "success";

      case "DRAFT":
        return "default";

      case "OVERDUE":
        return "warning";

      case "CANCELLED":
        return "danger";

      default:
        return "default";
    }
  };

  const getItemDescription = (
    item
  ) =>
    getValue(
      item,
      [
        "description",
        "name",
        "productName",
      ],
      "Invoice Item"
    );

  const getItemQuantity = (
    item
  ) =>
    Number(
      getValue(
        item,
        ["quantity"],
        0
      )
    );

  const getItemRate = (item) =>
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
    );

  const getItemTaxRate = (
    item
  ) =>
    Number(
      getValue(
        item,
        [
          "taxRate",
          "tax",
        ],
        0
      )
    );

  const getItemTotal = (item) => {
    const quantity =
      getItemQuantity(item);

    const rate =
      getItemRate(item);

    return quantity * rate;
  };

  const handleDownloadPDF =
    async () => {
      try {
        setDownloading(true);
        setError("");

        if (
          typeof pdfService.downloadInvoicePDF !==
          "function"
        ) {
          throw new Error(
            "Invoice PDF service is not available."
          );
        }

        await pdfService.downloadInvoicePDF(
          invoiceId
        );
      } catch (err) {
        console.error(
          "Failed to download invoice PDF:",
          err
        );

        setError(
          err?.message ||
            "Failed to download invoice PDF."
        );
      } finally {
        setDownloading(false);
      }
    };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      setError("");

      if (
        typeof invoiceService.deleteInvoice !==
        "function"
      ) {
        throw new Error(
          "Invoice delete service is not available."
        );
      }

      await invoiceService.deleteInvoice(
        invoiceId
      );

      router.push(
        "/admin/invoices"
      );
    } catch (err) {
      console.error(
        "Failed to delete invoice:",
        err
      );

      setError(
        err?.message ||
          "Failed to delete invoice."
      );
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleEdit = () => {
    router.push(
      `/admin/invoices/create?edit=${invoiceId}`
    );
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-invoice-details-loading">
          <Loader />

          <p>
            Loading invoice details...
          </p>
        </div>
      </AdminLayout>
    );
  }

  if (error && !invoice) {
    return (
      <AdminLayout>
        <div className="admin-invoice-details-error-state">
          <div className="admin-invoice-error-icon">
            !
          </div>

          <h2>
            Invoice could not be loaded
          </h2>

          <p>{error}</p>

          <div className="admin-invoice-error-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                router.push(
                  "/admin/invoices"
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
      </AdminLayout>
    );
  }

  if (!invoice) {
    return (
      <AdminLayout>
        <div className="admin-invoice-details-error-state">
          <h2>
            Invoice not found
          </h2>

          <Button
            type="button"
            variant="primary"
            onClick={() =>
              router.push(
                "/admin/invoices"
              )
            }
          >
            Back to Invoices
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-invoice-details-page">
        {/* Header */}
        <div className="admin-invoice-details-header">
          <div>
            <button
              type="button"
              className="admin-invoice-back-button"
              onClick={() =>
                router.push(
                  "/admin/invoices"
                )
              }
            >
              ← Back to Invoices
            </button>

            <div className="admin-invoice-title-row">
              <div className="admin-invoice-title-icon">
                IN
              </div>

              <div>
                <div className="admin-invoice-title-top">
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

          <div className="admin-invoice-header-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                loadInvoice(true)
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
              variant="secondary"
              onClick={
                handleDownloadPDF
              }
              disabled={
                downloading
              }
            >
              {downloading
                ? "Preparing PDF..."
                : "Download PDF"}
            </Button>

            <Button
              type="button"
              variant="primary"
              onClick={
                handleEdit
              }
            >
              Edit Invoice
            </Button>
          </div>
        </div>

        {error && (
          <div className="admin-invoice-inline-error">
            {error}
          </div>
        )}

        {/* Invoice Meta */}
        <div className="admin-invoice-meta-grid">
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

            <strong className="admin-invoice-meta-total">
              {formatCurrency(
                grandTotal
              )}
            </strong>
          </div>
        </div>

        <div className="admin-invoice-details-layout">
          <main className="admin-invoice-details-main">
            {/* Customer */}
            <section className="admin-invoice-detail-card">
              <div className="admin-invoice-card-header">
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

              <div className="admin-invoice-customer-section">
                <div className="admin-invoice-customer-avatar">
                  {String(
                    customerName
                  )
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div className="admin-invoice-customer-info">
                  <h3>
                    {customerName}
                  </h3>

                  {customerCompany && (
                    <p>
                      {customerCompany}
                    </p>
                  )}

                  <div className="admin-invoice-customer-contact">
                    {customerPhone && (
                      <span>
                        ☎{" "}
                        {customerPhone}
                      </span>
                    )}

                    {customerEmail && (
                      <span>
                        ✉{" "}
                        {customerEmail}
                      </span>
                    )}
                  </div>

                  {customerAddress && (
                    <div className="admin-invoice-customer-address">
                      {customerAddress}

                      {[
                        getValue(
                          customer,
                          ["city"],
                          ""
                        ),
                        getValue(
                          customer,
                          ["state"],
                          ""
                        ),
                        getValue(
                          customer,
                          [
                            "pincode",
                            "pinCode",
                          ],
                          ""
                        ),
                      ]
                        .filter(
                          Boolean
                        )
                        .length >
                        0 && (
                        <span>
                          {[
                            getValue(
                              customer,
                              ["city"],
                              ""
                            ),
                            getValue(
                              customer,
                              ["state"],
                              ""
                            ),
                            getValue(
                              customer,
                              [
                                "pincode",
                                "pinCode",
                              ],
                              ""
                            ),
                          ]
                            .filter(
                              Boolean
                            )
                            .join(
                              ", "
                            )}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Items */}
            <section className="admin-invoice-detail-card">
              <div className="admin-invoice-card-header">
                <div>
                  <h2>
                    Invoice Items
                  </h2>

                  <p>
                    Products and services included in
                    this invoice.
                  </p>
                </div>
              </div>

              {items.length ===
              0 ? (
                <div className="admin-invoice-empty-items">
                  No invoice items available.
                </div>
              ) : (
                <div className="admin-invoice-items-wrapper">
                  <table className="admin-invoice-items-table">
                    <thead>
                      <tr>
                        <th>
                          #
                        </th>

                        <th>
                          Description
                        </th>

                        <th>
                          Quantity
                        </th>

                        <th>
                          Unit
                        </th>

                        <th>
                          Rate
                        </th>

                        <th>
                          Tax
                        </th>

                        <th>
                          Total
                        </th>
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
                              {index +
                                1}
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
                              {getValue(
                                item,
                                ["unit"],
                                "Unit"
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

            {/* Notes */}
            {notes && (
              <section className="admin-invoice-detail-card">
                <div className="admin-invoice-card-header">
                  <div>
                    <h2>
                      Notes
                    </h2>

                    <p>
                      Additional information for this
                      invoice.
                    </p>
                  </div>
                </div>

                <div className="admin-invoice-notes">
                  {notes}
                </div>
              </section>
            )}
          </main>

          {/* Summary Sidebar */}
          <aside className="admin-invoice-details-sidebar">
            <section className="admin-invoice-summary-card">
              <div className="admin-invoice-summary-header">
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

              <div className="admin-invoice-summary-body">
                <div className="admin-invoice-summary-row">
                  <span>
                    Subtotal
                  </span>

                  <strong>
                    {formatCurrency(
                      subtotal
                    )}
                  </strong>
                </div>

                <div className="admin-invoice-summary-row">
                  <span>
                    Tax
                  </span>

                  <strong>
                    {formatCurrency(
                      taxTotal
                    )}
                  </strong>
                </div>

                <div className="admin-invoice-summary-row">
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

                <div className="admin-invoice-summary-row">
                  <span>
                    Additional Charges
                  </span>

                  <strong>
                    {formatCurrency(
                      additionalCharges
                    )}
                  </strong>
                </div>

                <div className="admin-invoice-summary-total">
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

            <section className="admin-invoice-sidebar-card">
              <div className="admin-invoice-sidebar-heading">
                <h2>
                  Invoice Information
                </h2>
              </div>

              <div className="admin-invoice-record-list">
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

            <section className="admin-invoice-sidebar-actions">
              <Button
                type="button"
                variant="primary"
                onClick={
                  handleDownloadPDF
                }
                disabled={
                  downloading
                }
              >
                {downloading
                  ? "Preparing PDF..."
                  : "Download Invoice PDF"}
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={
                  handleEdit
                }
              >
                Edit Invoice
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  router.push(
                    "/admin/invoices"
                  )
                }
              >
                Back to Invoices
              </Button>

              <button
                type="button"
                className="admin-invoice-delete-button"
                onClick={() =>
                  setShowDeleteModal(
                    true
                  )
                }
              >
                Delete Invoice
              </button>
            </section>
          </aside>
        </div>

        {/* Delete Modal */}
        <Modal
          isOpen={
            showDeleteModal
          }
          onClose={() =>
            !deleting &&
            setShowDeleteModal(
              false
            )
          }
          title="Delete Invoice"
        >
          <div className="admin-invoice-delete-modal">
            <div className="admin-invoice-delete-icon">
              !
            </div>

            <h3>
              Delete this invoice?
            </h3>

            <p>
              Are you sure you want to delete this
              invoice? This action cannot be undone.
            </p>

            <div className="admin-invoice-delete-actions">
              <Button
                type="button"
                variant="secondary"
                disabled={
                  deleting
                }
                onClick={() =>
                  setShowDeleteModal(
                    false
                  )
                }
              >
                Cancel
              </Button>

              <Button
                type="button"
                variant="danger"
                disabled={
                  deleting
                }
                onClick={
                  handleDelete
                }
              >
                {deleting
                  ? "Deleting..."
                  : "Delete Invoice"}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default InvoiceDetailsPage;