"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import AdminLayout from "../../layout";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import Loader from "@/components/common/Loader";
import Modal from "@/components/common/Modal";

import { customerService } from "@/services/customer.service";

import "./customer-details.css";

const CustomerDetailsPage = () => {
  const params = useParams();
  const router = useRouter();

  const customerId = params?.id;

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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
      object?.customerId ||
      ""
    );
  };

  const normalizeCustomer = (response) => {
    if (!response) return null;

    if (
      response?.data &&
      !Array.isArray(response.data)
    ) {
      if (response.data?.customer) {
        return response.data.customer;
      }

      return response.data;
    }

    if (response?.customer) {
      return response.customer;
    }

    return response;
  };

  const loadCustomer = async (
    showRefresh = false
  ) => {
    if (!customerId) return;

    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response =
        await customerService.getCustomerById(
          customerId
        );

      setCustomer(
        normalizeCustomer(response)
      );
    } catch (err) {
      console.error(
        "Failed to load customer:",
        err
      );

      setError(
        err?.message ||
          "Customer details load nahi ho paaye."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCustomer();
  }, [customerId]);

  const customerName = getValue(
    customer,
    [
      "name",
      "fullName",
      "customerName",
    ],
    "Customer"
  );

  const companyName = getValue(
    customer,
    ["companyName"],
    ""
  );

  const phone = getValue(
    customer,
    [
      "phone",
      "mobile",
      "contactNumber",
      "phoneNumber",
    ],
    ""
  );

  const alternatePhone = getValue(
    customer,
    [
      "alternatePhone",
      "alternateMobile",
      "secondaryPhone",
    ],
    ""
  );

  const email = getValue(
    customer,
    [
      "email",
      "emailAddress",
    ],
    ""
  );

  const address = getValue(
    customer,
    [
      "address",
      "fullAddress",
    ],
    ""
  );

  const city = getValue(
    customer,
    ["city", "location"],
    ""
  );

  const state = getValue(
    customer,
    ["state"],
    ""
  );

  const pincode = getValue(
    customer,
    [
      "pincode",
      "pinCode",
      "postalCode",
    ],
    ""
  );

  const customerType =
    getValue(
      customer,
      [
        "customerType",
        "type",
      ],
      "INDIVIDUAL"
    );

  const source = getValue(
    customer,
    [
      "source",
      "customerSource",
    ],
    "—"
  );

  const status = getValue(
    customer,
    ["status"],
    "ACTIVE"
  );

  const notes = getValue(
    customer,
    ["notes", "additionalNotes"],
    ""
  );

  const lead = useMemo(() => {
    const value = getValue(
      customer,
      [
        "lead",
        "convertedLead",
      ],
      null
    );

    return value &&
      typeof value === "object"
      ? value
      : null;
  }, [customer]);

  const requirements = useMemo(() => {
    const value = getValue(
      customer,
      [
        "solarRequirements",
        "requirements",
      ],
      []
    );

    return Array.isArray(value)
      ? value
      : [];
  }, [customer]);

  const quotations = useMemo(() => {
    const value = getValue(
      customer,
      ["quotations"],
      []
    );

    return Array.isArray(value)
      ? value
      : [];
  }, [customer]);

  const invoices = useMemo(() => {
    const value = getValue(
      customer,
      ["invoices"],
      []
    );

    return Array.isArray(value)
      ? value
      : [];
  }, [customer]);

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
    switch (
      String(
        currentStatus || ""
      ).toUpperCase()
    ) {
      case "ACTIVE":
        return "success";

      case "INACTIVE":
        return "danger";

      case "PROSPECT":
        return "warning";

      case "CONVERTED":
        return "success";

      default:
        return "default";
    }
  };

  const getNameFromObject = (
    object,
    fallback = "—"
  ) => {
    return getValue(
      object,
      [
        "name",
        "fullName",
        "customerName",
        "title",
        "quotationNumber",
        "invoiceNumber",
      ],
      fallback
    );
  };

  const getAmount = (object) => {
    return Number(
      getValue(
        object,
        [
          "grandTotal",
          "totalAmount",
          "total",
          "finalAmount",
          "amount",
        ],
        0
      )
    );
  };

  const handleEdit = () => {
    router.push(
      `/admin/customers/create?edit=${customerId}`
    );
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      setError("");

      if (
        typeof customerService.deleteCustomer !==
        "function"
      ) {
        throw new Error(
          "Customer delete service available nahi hai."
        );
      }

      await customerService.deleteCustomer(
        customerId
      );

      router.push(
        "/admin/customers"
      );
    } catch (err) {
      console.error(
        "Failed to delete customer:",
        err
      );

      setError(
        err?.message ||
          "Customer delete nahi ho paaya."
      );
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-customer-details-loading">
          <Loader />

          <p>
            Customer details load ho rahi hain...
          </p>
        </div>
      </AdminLayout>
    );
  }

  if (error && !customer) {
    return (
      <AdminLayout>
        <div className="admin-customer-details-error-state">
          <div className="admin-customer-error-icon">
            !
          </div>

          <h2>
            Customer load nahi hua
          </h2>

          <p>{error}</p>

          <div>
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                router.push(
                  "/admin/customers"
                )
              }
            >
              Back to Customers
            </Button>

            <Button
              type="button"
              variant="primary"
              onClick={() =>
                loadCustomer()
              }
            >
              Try Again
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!customer) {
    return (
      <AdminLayout>
        <div className="admin-customer-details-error-state">
          <h2>
            Customer not found
          </h2>

          <Button
            type="button"
            variant="primary"
            onClick={() =>
              router.push(
                "/admin/customers"
              )
            }
          >
            Back to Customers
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-customer-details-page">
        {/* Header */}
        <div className="admin-customer-details-header">
          <div>
            <button
              type="button"
              className="admin-customer-back-button"
              onClick={() =>
                router.push(
                  "/admin/customers"
                )
              }
            >
              ← Back to Customers
            </button>

            <div className="admin-customer-heading">
              <div className="admin-customer-heading-avatar">
                {String(
                  customerName
                )
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div>
                <div className="admin-customer-heading-top">
                  <h1>
                    {customerName}
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
                  {companyName ||
                    "Customer Profile"}
                </p>
              </div>
            </div>
          </div>

          <div className="admin-customer-header-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                loadCustomer(true)
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
              onClick={handleEdit}
            >
              Edit Customer
            </Button>
          </div>
        </div>

        {error && (
          <div className="admin-customer-inline-error">
            {error}
          </div>
        )}

        {/* Summary */}
        <div className="admin-customer-summary-grid">
          <div className="admin-customer-summary-card">
            <span>
              Customer Type
            </span>

            <strong>
              {String(
                customerType
              ).replaceAll(
                "_",
                " "
              )}
            </strong>
          </div>

          <div className="admin-customer-summary-card">
            <span>
              Phone
            </span>

            <strong>
              {phone || "—"}
            </strong>
          </div>

          <div className="admin-customer-summary-card">
            <span>
              Location
            </span>

            <strong>
              {city || "—"}
            </strong>
          </div>

          <div className="admin-customer-summary-card admin-customer-summary-highlight">
            <span>
              Customer Since
            </span>

            <strong>
              {formatDate(
                customer?.createdAt
              )}
            </strong>
          </div>
        </div>

        <div className="admin-customer-details-layout">
          <main className="admin-customer-details-main">
            {/* Personal Details */}
            <section className="admin-customer-detail-card">
              <div className="admin-customer-detail-card-header">
                <div>
                  <h2>
                    Customer Information
                  </h2>

                  <p>
                    Customer ki primary profile aur
                    contact information.
                  </p>
                </div>
              </div>

              <div className="admin-customer-info-grid">
                <div>
                  <span>
                    Full Name
                  </span>

                  <strong>
                    {customerName}
                  </strong>
                </div>

                <div>
                  <span>
                    Company Name
                  </span>

                  <strong>
                    {companyName ||
                      "—"}
                  </strong>
                </div>

                <div>
                  <span>
                    Mobile Number
                  </span>

                  <strong>
                    {phone || "—"}
                  </strong>
                </div>

                <div>
                  <span>
                    Alternate Mobile
                  </span>

                  <strong>
                    {alternatePhone ||
                      "—"}
                  </strong>
                </div>

                <div>
                  <span>
                    Email Address
                  </span>

                  <strong>
                    {email || "—"}
                  </strong>
                </div>

                <div>
                  <span>
                    Customer Type
                  </span>

                  <strong>
                    {String(
                      customerType
                    ).replaceAll(
                      "_",
                      " "
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Source
                  </span>

                  <strong>
                    {String(
                      source
                    ).replaceAll(
                      "_",
                      " "
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Status
                  </span>

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
              </div>
            </section>

            {/* Address */}
            <section className="admin-customer-detail-card">
              <div className="admin-customer-detail-card-header">
                <div>
                  <h2>
                    Address Details
                  </h2>

                  <p>
                    Customer installation / contact
                    address.
                  </p>
                </div>
              </div>

              <div className="admin-customer-address-box">
                <div className="admin-customer-address-icon">
                  ⌖
                </div>

                <div>
                  <strong>
                    {address ||
                      "Address not available"}
                  </strong>

                  <p>
                    {[
                      city,
                      state,
                      pincode,
                    ]
                      .filter(
                        Boolean
                      )
                      .join(
                        ", "
                      ) ||
                      "Location details not available"}
                  </p>
                </div>
              </div>
            </section>

            {/* Lead */}
            {lead && (
              <section className="admin-customer-detail-card">
                <div className="admin-customer-detail-card-header">
                  <div>
                    <h2>
                      Source Lead
                    </h2>

                    <p>
                      Customer conversion se related
                      lead information.
                    </p>
                  </div>
                </div>

                <div className="admin-customer-linked-card">
                  <div>
                    <span>
                      Lead
                    </span>

                    <strong>
                      {getNameFromObject(
                        lead
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Lead Status
                    </span>

                    <Badge
                      variant={getStatusVariant(
                        getValue(
                          lead,
                          ["status"],
                          "—"
                        )
                      )}
                    >
                      {String(
                        getValue(
                          lead,
                          [
                            "status",
                          ],
                          "—"
                        )
                      ).replaceAll(
                        "_",
                        " "
                      )}
                    </Badge>
                  </div>

                  <div>
                    <span>
                      Created On
                    </span>

                    <strong>
                      {formatDate(
                        getValue(
                          lead,
                          [
                            "createdAt",
                            "date",
                          ]
                        )
                      )}
                    </strong>
                  </div>
                </div>
              </section>
            )}

            {/* Requirements */}
            {requirements.length >
              0 && (
              <section className="admin-customer-detail-card">
                <div className="admin-customer-detail-card-header">
                  <div>
                    <h2>
                      Solar Requirements
                    </h2>

                    <p>
                      Customer ki solar requirements
                      history.
                    </p>
                  </div>
                </div>

                <div className="admin-customer-related-list">
                  {requirements.map(
                    (
                      requirement,
                      index
                    ) => (
                      <div
                        className="admin-customer-related-item"
                        key={
                          getId(
                            requirement
                          ) ||
                          index
                        }
                      >
                        <div>
                          <strong>
                            {getNameFromObject(
                              requirement,
                              `Requirement #${
                                index + 1
                              }`
                            )}
                          </strong>

                          <span>
                            {getValue(
                              requirement,
                              [
                                "systemType",
                                "type",
                              ],
                              "Solar Requirement"
                            )}
                          </span>
                        </div>

                        <div>
                          <strong>
                            {getValue(
                              requirement,
                              [
                                "systemSizeKW",
                                "requiredKW",
                                "capacityKW",
                              ],
                              "—"
                            )}
                            {getValue(
                              requirement,
                              [
                                "systemSizeKW",
                                "requiredKW",
                                "capacityKW",
                              ],
                              ""
                            )
                              ? " kW"
                              : ""}
                          </strong>

                          <span>
                            {formatDate(
                              getValue(
                                requirement,
                                [
                                  "createdAt",
                                  "date",
                                ]
                              )
                            )}
                          </span>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </section>
            )}

            {/* Quotations */}
            {quotations.length >
              0 && (
              <section className="admin-customer-detail-card">
                <div className="admin-customer-detail-card-header">
                  <div>
                    <h2>
                      Quotations
                    </h2>

                    <p>
                      Customer ke liye generated
                      quotations.
                    </p>
                  </div>
                </div>

                <div className="admin-customer-related-list">
                  {quotations.map(
                    (
                      quotation,
                      index
                    ) => {
                      const quotationId =
                        getId(
                          quotation
                        );

                      return (
                        <div
                          className="admin-customer-related-item"
                          key={
                            quotationId ||
                            index
                          }
                        >
                          <div>
                            <strong>
                              {getValue(
                                quotation,
                                [
                                  "quotationNumber",
                                  "quotationNo",
                                  "estimateId",
                                ],
                                `Quotation #${
                                  index +
                                  1
                                }`
                              )}
                            </strong>

                            <span>
                              {formatDate(
                                getValue(
                                  quotation,
                                  [
                                    "quotationDate",
                                    "createdAt",
                                  ]
                                )
                              )}
                            </span>
                          </div>

                          <div className="admin-customer-related-right">
                            <strong>
                              {formatCurrency(
                                getAmount(
                                  quotation
                                )
                              )}
                            </strong>

                            {quotationId && (
                              <button
                                type="button"
                                onClick={() =>
                                  router.push(
                                    `/admin/quotations/${quotationId}`
                                  )
                                }
                              >
                                View
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </section>
            )}

            {/* Invoices */}
            {invoices.length >
              0 && (
              <section className="admin-customer-detail-card">
                <div className="admin-customer-detail-card-header">
                  <div>
                    <h2>
                      Invoices
                    </h2>

                    <p>
                      Customer ke liye generated
                      invoices.
                    </p>
                  </div>
                </div>

                <div className="admin-customer-related-list">
                  {invoices.map(
                    (
                      invoice,
                      index
                    ) => {
                      const invoiceId =
                        getId(
                          invoice
                        );

                      return (
                        <div
                          className="admin-customer-related-item"
                          key={
                            invoiceId ||
                            index
                          }
                        >
                          <div>
                            <strong>
                              {getValue(
                                invoice,
                                [
                                  "invoiceNumber",
                                  "invoiceNo",
                                ],
                                `Invoice #${
                                  index +
                                  1
                                }`
                              )}
                            </strong>

                            <span>
                              {formatDate(
                                getValue(
                                  invoice,
                                  [
                                    "invoiceDate",
                                    "createdAt",
                                  ]
                                )
                              )}
                            </span>
                          </div>

                          <div className="admin-customer-related-right">
                            <strong>
                              {formatCurrency(
                                getAmount(
                                  invoice
                                )
                              )}
                            </strong>

                            {invoiceId && (
                              <button
                                type="button"
                                onClick={() =>
                                  router.push(
                                    `/admin/invoices/${invoiceId}`
                                  )
                                }
                              >
                                View
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </section>
            )}

            {/* Notes */}
            {notes && (
              <section className="admin-customer-detail-card">
                <div className="admin-customer-detail-card-header">
                  <div>
                    <h2>
                      Notes
                    </h2>

                    <p>
                      Additional customer information.
                    </p>
                  </div>
                </div>

                <div className="admin-customer-notes">
                  {notes}
                </div>
              </section>
            )}
          </main>

          {/* Sidebar */}
          <aside className="admin-customer-details-sidebar">
            <section className="admin-customer-sidebar-card">
              <div className="admin-customer-sidebar-profile">
                <div className="admin-customer-sidebar-avatar">
                  {String(
                    customerName
                  )
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <h2>
                  {customerName}
                </h2>

                {companyName && (
                  <p>
                    {companyName}
                  </p>
                )}

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
            </section>

            <section className="admin-customer-sidebar-card">
              <div className="admin-customer-sidebar-heading">
                <h2>
                  Quick Contact
                </h2>
              </div>

              <div className="admin-customer-quick-contact">
                {phone && (
                  <a
                    href={`tel:${phone}`}
                  >
                    <span>☎</span>
                    <div>
                      <small>
                        Phone
                      </small>
                      <strong>
                        {phone}
                      </strong>
                    </div>
                  </a>
                )}

                {email && (
                  <a
                    href={`mailto:${email}`}
                  >
                    <span>✉</span>
                    <div>
                      <small>
                        Email
                      </small>
                      <strong>
                        {email}
                      </strong>
                    </div>
                  </a>
                )}
              </div>
            </section>

            <section className="admin-customer-sidebar-card">
              <div className="admin-customer-sidebar-heading">
                <h2>
                  Record Information
                </h2>
              </div>

              <div className="admin-customer-record-list">
                <div>
                  <span>
                    Customer ID
                  </span>

                  <strong>
                    {getId(
                      customer
                    ) || "—"}
                  </strong>
                </div>

                <div>
                  <span>
                    Created On
                  </span>

                  <strong>
                    {formatDate(
                      customer?.createdAt
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Updated On
                  </span>

                  <strong>
                    {formatDate(
                      customer?.updatedAt
                    )}
                  </strong>
                </div>
              </div>
            </section>

            <section className="admin-customer-sidebar-card admin-customer-sidebar-actions">
              <Button
                type="button"
                variant="primary"
                onClick={handleEdit}
              >
                Edit Customer
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  router.push(
                    `/admin/quotations/create?customerId=${customerId}`
                  )
                }
              >
                Create Quotation
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  router.push(
                    "/admin/customers"
                  )
                }
              >
                Back to Customers
              </Button>

              <button
                type="button"
                className="admin-customer-delete-button"
                onClick={() =>
                  setShowDeleteModal(
                    true
                  )
                }
              >
                Delete Customer
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
          title="Delete Customer"
        >
          <div className="admin-customer-delete-modal">
            <div className="admin-customer-delete-modal-icon">
              !
            </div>

            <h3>
              Delete this customer?
            </h3>

            <p>
              Customer record permanently delete ho
              sakta hai. Is action ko undo nahi kiya
              ja sakta.
            </p>

            <div className="admin-customer-delete-modal-actions">
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
                  : "Delete Customer"}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default CustomerDetailsPage;