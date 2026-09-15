"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import AdminLayout from "../../layout";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import Loader from "@/components/common/Loader";
import Modal from "@/components/common/Modal";

import { quotationService } from "@/services/quotation.service";
import { pdfService } from "@/services/pdf.service";

import "./quotation-details.css";

const QuotationDetailsPage = () => {
  const params = useParams();
  const router = useRouter();

  const quotationId = params?.id;

  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] =
    useState(false);
  const [deleting, setDeleting] = useState(false);

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
      object?.quotationId ||
      ""
    );
  };

  const getObject = (
    object,
    keys
  ) => {
    if (!object) return null;

    for (const key of keys) {
      if (
        object?.[key] &&
        typeof object[key] === "object"
      ) {
        return object[key];
      }
    }

    return null;
  };

  const normalizeQuotation = (response) => {
    if (!response) return null;

    if (
      response?.data &&
      !Array.isArray(response.data)
    ) {
      if (response.data?.quotation) {
        return response.data.quotation;
      }

      return response.data;
    }

    if (response?.quotation) {
      return response.quotation;
    }

    return response;
  };

  const loadQuotation = async () => {
    if (!quotationId) return;

    try {
      setLoading(true);
      setError("");

      const response =
        await quotationService.getQuotationById(
          quotationId
        );

      const data =
        normalizeQuotation(response);

      setQuotation(data);
    } catch (err) {
      console.error(
        "Failed to load quotation:",
        err
      );

      setError(
        err?.message ||
          "Quotation details load nahi ho paaye."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuotation();
  }, [quotationId]);

  const customer = useMemo(() => {
    return getObject(quotation, [
      "customer",
      "customerDetails",
    ]);
  }, [quotation]);

  const systemConfiguration = useMemo(() => {
    return getObject(quotation, [
      "systemConfiguration",
      "configuration",
      "systemConfig",
    ]);
  }, [quotation]);

  const items = useMemo(() => {
    const quotationItems = getValue(
      quotation,
      [
        "items",
        "quotationItems",
        "products",
        "lineItems",
      ],
      []
    );

    return Array.isArray(
      quotationItems
    )
      ? quotationItems
      : [];
  }, [quotation]);

  const quotationNumber = getValue(
    quotation,
    [
      "quotationNumber",
      "quotationNo",
      "estimateId",
      "referenceNumber",
      "number",
    ],
    "Quotation"
  );

  const status = getValue(
    quotation,
    ["status"],
    "DRAFT"
  );

  const title = getValue(
    quotation,
    ["title", "quotationTitle"],
    "Solar Power System Proposal"
  );

  const quotationDate = getValue(
    quotation,
    [
      "quotationDate",
      "date",
      "createdAt",
    ]
  );

  const validUntil = getValue(
    quotation,
    [
      "validUntil",
      "validTill",
      "expiryDate",
    ]
  );

  const customerName =
    getValue(
      quotation,
      [
        "customerName",
        "name",
      ]
    ) ||
    getValue(
      customer,
      [
        "name",
        "fullName",
        "customerName",
      ],
      "Customer"
    );

  const customerCompany =
    getValue(
      quotation,
      [
        "companyName",
        "customerCompany",
      ]
    ) ||
    getValue(
      customer,
      ["companyName"],
      ""
    );

  const customerPhone =
    getValue(
      quotation,
      ["phone", "mobile", "contactNumber"]
    ) ||
    getValue(
      customer,
      ["phone", "mobile", "contactNumber"],
      ""
    );

  const customerEmail =
    getValue(
      quotation,
      ["email", "customerEmail"]
    ) ||
    getValue(
      customer,
      ["email"],
      ""
    );

  const customerAddress =
    getValue(
      quotation,
      ["address", "customerAddress"]
    ) ||
    getValue(
      customer,
      ["address"],
      ""
    );

  const customerCity =
    getValue(
      quotation,
      ["city", "customerCity"]
    ) ||
    getValue(
      customer,
      ["city"],
      ""
    );

  const systemType = getValue(
    quotation,
    ["systemType"],
    getValue(
      systemConfiguration,
      ["systemType", "type"],
      "—"
    )
  );

  const systemSize = getValue(
    quotation,
    [
      "systemSizeKW",
      "systemSize",
      "capacityKW",
    ],
    getValue(
      systemConfiguration,
      [
        "systemSizeKW",
        "requiredKW",
        "capacityKW",
      ],
      "—"
    )
  );

  const subtotal = Number(
    getValue(
      quotation,
      ["subtotal", "subTotal"],
      0
    )
  );

  const discount = Number(
    getValue(
      quotation,
      ["discount"],
      0
    )
  );

  const taxTotal = Number(
    getValue(
      quotation,
      [
        "taxTotal",
        "totalTax",
        "taxAmount",
      ],
      0
    )
  );

  const additionalCharges =
    Number(
      getValue(
        quotation,
        [
          "additionalCharges",
          "otherCharges",
        ],
        0
      )
    );

  const grandTotal = Number(
    getValue(
      quotation,
      [
        "grandTotal",
        "totalAmount",
        "total",
        "finalAmount",
      ],
      subtotal -
        discount +
        taxTotal +
        additionalCharges
    )
  );

  const paymentTerms = getValue(
    quotation,
    ["paymentTerms", "terms"],
    ""
  );

  const warranty = getValue(
    quotation,
    ["warranty", "warrantyTerms"],
    ""
  );

  const notes = getValue(
    quotation,
    ["notes", "additionalNotes"],
    ""
  );

  const createdBy = getObject(
    quotation,
    ["createdBy", "createdByUser"]
  );

  const createdByName =
    getValue(
      quotation,
      ["createdByName"],
      ""
    ) ||
    getValue(
      createdBy,
      ["name", "fullName"],
      "Admin"
    );

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
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
    const normalized =
      String(
        currentStatus || ""
      ).toUpperCase();

    if (
      normalized === "APPROVED" ||
      normalized === "ACCEPTED" ||
      normalized === "SENT"
    ) {
      return "success";
    }

    if (
      normalized === "REJECTED" ||
      normalized === "CANCELLED"
    ) {
      return "danger";
    }

    if (
      normalized === "EXPIRED"
    ) {
      return "warning";
    }

    return "default";
  };

  const handleDownloadPDF =
    async () => {
      if (!quotationId) return;

      try {
        setDownloading(true);

        const response =
          await pdfService.downloadQuotationPDF(
            quotationId
          );

        if (
          typeof window ===
          "undefined"
        ) {
          return;
        }

        if (
          response instanceof Blob
        ) {
          const url =
            window.URL.createObjectURL(
              response
            );

          const anchor =
            document.createElement(
              "a"
            );

          anchor.href = url;
          anchor.download = `${quotationNumber}.pdf`;

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

        if (
          response?.data instanceof Blob
        ) {
          const url =
            window.URL.createObjectURL(
              response.data
            );

          const anchor =
            document.createElement(
              "a"
            );

          anchor.href = url;
          anchor.download = `${quotationNumber}.pdf`;

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

        if (
          response?.url
        ) {
          window.open(
            response.url,
            "_blank",
            "noopener,noreferrer"
          );

          return;
        }

        setError(
          "PDF response ka format supported nahi hai."
        );
      } catch (err) {
        console.error(
          "Failed to download quotation PDF:",
          err
        );

        setError(
          err?.message ||
            "Quotation PDF download nahi ho paayi."
        );
      } finally {
        setDownloading(false);
      }
    };

  const handleDelete =
    async () => {
      if (!quotationId) return;

      try {
        setDeleting(true);
        setError("");

        if (
          typeof quotationService.deleteQuotation !==
          "function"
        ) {
          throw new Error(
            "Quotation delete service available nahi hai."
          );
        }

        await quotationService.deleteQuotation(
          quotationId
        );

        router.push(
          "/admin/quotations"
        );
      } catch (err) {
        console.error(
          "Failed to delete quotation:",
          err
        );

        setError(
          err?.message ||
            "Quotation delete nahi ho paayi."
        );
      } finally {
        setDeleting(false);
        setShowDeleteModal(false);
      }
    };

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-quotation-details-loading">
          <Loader />
          <p>
            Quotation details load ho rahi hain...
          </p>
        </div>
      </AdminLayout>
    );
  }

  if (error && !quotation) {
    return (
      <AdminLayout>
        <div className="admin-quotation-details-error-state">
          <div className="admin-quotation-error-icon">
            !
          </div>

          <h2>
            Quotation load nahi hui
          </h2>

          <p>{error}</p>

          <div>
            <Button
              variant="secondary"
              onClick={() =>
                router.push(
                  "/admin/quotations"
                )
              }
            >
              Back to Quotations
            </Button>

            <Button
              variant="primary"
              onClick={loadQuotation}
            >
              Try Again
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!quotation) {
    return (
      <AdminLayout>
        <div className="admin-quotation-details-error-state">
          <h2>
            Quotation not found
          </h2>

          <Button
            variant="primary"
            onClick={() =>
              router.push(
                "/admin/quotations"
              )
            }
          >
            Back to Quotations
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-quotation-details-page">
        {/* Header */}
        <div className="admin-quotation-details-header">
          <div>
            <button
              type="button"
              className="admin-quotation-back-button"
              onClick={() =>
                router.push(
                  "/admin/quotations"
                )
              }
            >
              ← Back to Quotations
            </button>

            <div className="admin-quotation-heading">
              <div className="admin-quotation-heading-icon">
                ₹
              </div>

              <div>
                <div className="admin-quotation-heading-top">
                  <h1>
                    {quotationNumber}
                  </h1>

                  <Badge
                    variant={getStatusVariant(
                      status
                    )}
                  >
                    {String(
                      status
                    ).replaceAll(
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

          <div className="admin-quotation-header-actions">
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
                ? "Downloading..."
                : "↓ Download PDF"}
            </Button>

            <Button
              type="button"
              variant="primary"
              onClick={() =>
                router.push(
                  "/admin/quotations"
                )
              }
            >
              Quotations
            </Button>
          </div>
        </div>

        {error && (
          <div className="admin-quotation-inline-error">
            {error}
          </div>
        )}

        {/* Summary */}
        <div className="admin-quotation-summary-grid">
          <div className="admin-quotation-summary-card">
            <span>
              Quotation Date
            </span>

            <strong>
              {formatDate(
                quotationDate
              )}
            </strong>
          </div>

          <div className="admin-quotation-summary-card">
            <span>
              Valid Until
            </span>

            <strong>
              {formatDate(
                validUntil
              )}
            </strong>
          </div>

          <div className="admin-quotation-summary-card">
            <span>
              System Size
            </span>

            <strong>
              {systemSize}
              {systemSize !== "—"
                ? " kW"
                : ""}
            </strong>
          </div>

          <div className="admin-quotation-summary-card admin-quotation-summary-total">
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

        <div className="admin-quotation-details-layout">
          <main className="admin-quotation-details-main">
            {/* Customer */}
            <section className="admin-quotation-detail-card">
              <div className="admin-quotation-detail-card-header">
                <div>
                  <h2>
                    Customer Information
                  </h2>

                  <p>
                    Quotation kis customer ke liye
                    create ki gayi hai.
                  </p>
                </div>
              </div>

              <div className="admin-quotation-customer-box">
                <div className="admin-quotation-customer-avatar">
                  {String(
                    customerName ||
                      "C"
                  )
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div className="admin-quotation-customer-info">
                  <h3>
                    {customerName}
                  </h3>

                  {customerCompany && (
                    <p>
                      {customerCompany}
                    </p>
                  )}

                  <div className="admin-quotation-contact-grid">
                    {customerPhone && (
                      <div>
                        <span>
                          Phone
                        </span>

                        <strong>
                          {customerPhone}
                        </strong>
                      </div>
                    )}

                    {customerEmail && (
                      <div>
                        <span>
                          Email
                        </span>

                        <strong>
                          {customerEmail}
                        </strong>
                      </div>
                    )}

                    {(customerAddress ||
                      customerCity) && (
                      <div>
                        <span>
                          Address
                        </span>

                        <strong>
                          {[
                            customerAddress,
                            customerCity,
                          ]
                            .filter(
                              Boolean
                            )
                            .join(
                              ", "
                            )}
                        </strong>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* System */}
            <section className="admin-quotation-detail-card">
              <div className="admin-quotation-detail-card-header">
                <div>
                  <h2>
                    Solar System
                  </h2>

                  <p>
                    Configured solar system ki
                    technical summary.
                  </p>
                </div>
              </div>

              <div className="admin-quotation-system-grid">
                <div>
                  <span>
                    System Type
                  </span>

                  <strong>
                    {String(
                      systemType
                    ).replaceAll(
                      "_",
                      " "
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    System Size
                  </span>

                  <strong>
                    {systemSize}
                    {systemSize !==
                    "—"
                      ? " kW"
                      : ""}
                  </strong>
                </div>

                <div>
                  <span>
                    Panel Make
                  </span>

                  <strong>
                    {getValue(
                      systemConfiguration,
                      [
                        "panelMake",
                        "panelBrand",
                        "moduleMake",
                      ],
                      getValue(
                        quotation,
                        [
                          "panelMake",
                          "panelBrand",
                        ],
                        "—"
                      )
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Panel Wattage
                  </span>

                  <strong>
                    {getValue(
                      systemConfiguration,
                      [
                        "panelWattage",
                        "wattage",
                        "panelWp",
                      ],
                      getValue(
                        quotation,
                        [
                          "panelWattage",
                          "wattage",
                        ],
                        "—"
                      )
                    )}
                    {getValue(
                      systemConfiguration,
                      [
                        "panelWattage",
                        "wattage",
                        "panelWp",
                      ],
                      getValue(
                        quotation,
                        [
                          "panelWattage",
                          "wattage",
                        ],
                        ""
                      )
                    )
                      ? " W"
                      : ""}
                  </strong>
                </div>

                <div>
                  <span>
                    Panel Count
                  </span>

                  <strong>
                    {getValue(
                      systemConfiguration,
                      [
                        "panelCount",
                        "numberOfPanels",
                        "panelsCount",
                      ],
                      getValue(
                        quotation,
                        [
                          "panelCount",
                          "numberOfPanels",
                        ],
                        "—"
                      )
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Inverter
                  </span>

                  <strong>
                    {getValue(
                      systemConfiguration,
                      [
                        "inverterMake",
                        "inverterBrand",
                      ],
                      getValue(
                        quotation,
                        [
                          "inverterMake",
                          "inverterBrand",
                        ],
                        "—"
                      )
                    )}
                  </strong>
                </div>
              </div>
            </section>

            {/* Items */}
            <section className="admin-quotation-detail-card">
              <div className="admin-quotation-detail-card-header">
                <div>
                  <h2>
                    Quotation Items
                  </h2>

                  <p>
                    Products aur services included in
                    this quotation.
                  </p>
                </div>
              </div>

              {items.length === 0 ? (
                <div className="admin-quotation-empty-items">
                  No quotation items available.
                </div>
              ) : (
                <div className="admin-quotation-detail-items-wrapper">
                  <table className="admin-quotation-detail-items-table">
                    <thead>
                      <tr>
                        <th>
                          #
                        </th>
                        <th>
                          Description
                        </th>
                        <th>
                          Qty
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
                        ) => {
                          const quantity =
                            Number(
                              getValue(
                                item,
                                [
                                  "quantity",
                                  "qty",
                                ],
                                0
                              )
                            );

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
                            );

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
                            );

                          const total =
                            quantity *
                            rate;

                          return (
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
                                  {getValue(
                                    item,
                                    [
                                      "description",
                                      "name",
                                      "itemName",
                                    ],
                                    "—"
                                  )}
                                </strong>
                              </td>

                              <td>
                                {quantity}
                              </td>

                              <td>
                                {getValue(
                                  item,
                                  ["unit"],
                                  "—"
                                )}
                              </td>

                              <td>
                                {formatCurrency(
                                  rate
                                )}
                              </td>

                              <td>
                                {taxRate}%
                              </td>

                              <td>
                                <strong>
                                  {formatCurrency(
                                    total
                                  )}
                                </strong>
                              </td>
                            </tr>
                          );
                        }
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* Terms */}
            {(paymentTerms ||
              warranty ||
              notes) && (
              <section className="admin-quotation-detail-card">
                <div className="admin-quotation-detail-card-header">
                  <div>
                    <h2>
                      Terms & Notes
                    </h2>

                    <p>
                      Quotation document ke additional
                      terms and information.
                    </p>
                  </div>
                </div>

                <div className="admin-quotation-terms-grid">
                  {paymentTerms && (
                    <div className="admin-quotation-term-box">
                      <h3>
                        Payment Terms
                      </h3>

                      <p>
                        {paymentTerms}
                      </p>
                    </div>
                  )}

                  {warranty && (
                    <div className="admin-quotation-term-box">
                      <h3>
                        Warranty
                      </h3>

                      <p>
                        {warranty}
                      </p>
                    </div>
                  )}

                  {notes && (
                    <div className="admin-quotation-term-box admin-quotation-term-full">
                      <h3>
                        Additional Notes
                      </h3>

                      <p>
                        {notes}
                      </p>
                    </div>
                  )}
                </div>
              </section>
            )}
          </main>

          {/* Sidebar */}
          <aside className="admin-quotation-details-sidebar">
            <section className="admin-quotation-sidebar-card">
              <div className="admin-quotation-sidebar-heading">
                <h2>
                  Amount Summary
                </h2>
              </div>

              <div className="admin-quotation-amount-list">
                <div>
                  <span>
                    Subtotal
                  </span>

                  <strong>
                    {formatCurrency(
                      subtotal
                    )}
                  </strong>
                </div>

                <div>
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

                <div>
                  <span>
                    Tax
                  </span>

                  <strong>
                    {formatCurrency(
                      taxTotal
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Additional
                  </span>

                  <strong>
                    {formatCurrency(
                      additionalCharges
                    )}
                  </strong>
                </div>

                <div className="admin-quotation-sidebar-total">
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

            <section className="admin-quotation-sidebar-card">
              <div className="admin-quotation-sidebar-heading">
                <h2>
                  Record Information
                </h2>
              </div>

              <div className="admin-quotation-record-list">
                <div>
                  <span>
                    Created By
                  </span>

                  <strong>
                    {createdByName}
                  </strong>
                </div>

                <div>
                  <span>
                    Created On
                  </span>

                  <strong>
                    {formatDate(
                      quotation?.createdAt
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Updated On
                  </span>

                  <strong>
                    {formatDate(
                      quotation?.updatedAt
                    )}
                  </strong>
                </div>
              </div>
            </section>

            <section className="admin-quotation-sidebar-card admin-quotation-sidebar-actions">
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
                  : "↓ Download Quotation"}
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  router.push(
                    "/admin/quotations"
                  )
                }
              >
                Back to List
              </Button>

              <button
                type="button"
                className="admin-quotation-delete-button"
                onClick={() =>
                  setShowDeleteModal(
                    true
                  )
                }
              >
                Delete Quotation
              </button>
            </section>
          </aside>
        </div>

        <Modal
          isOpen={showDeleteModal}
          onClose={() =>
            !deleting &&
            setShowDeleteModal(false)
          }
          title="Delete Quotation"
        >
          <div className="admin-quotation-delete-modal">
            <div className="admin-quotation-delete-modal-icon">
              !
            </div>

            <h3>
              Delete this quotation?
            </h3>

            <p>
              Ye quotation permanently delete ho
              sakti hai. Is action ko undo nahi kiya
              ja sakta.
            </p>

            <div className="admin-quotation-delete-modal-actions">
              <Button
                type="button"
                variant="secondary"
                disabled={deleting}
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
                disabled={deleting}
                onClick={
                  handleDelete
                }
              >
                {deleting
                  ? "Deleting..."
                  : "Delete Quotation"}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default QuotationDetailsPage;