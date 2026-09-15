"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import AdminLayout from "../../layout";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import Textarea from "@/components/common/Textarea";
import Loader from "@/components/common/Loader";

import { invoiceService } from "@/services/invoice.service";
import { customerService } from "@/services/customer.service";

import "./create-invoice.css";

const CreateInvoicePage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const editId = searchParams.get("edit");
  const customerIdFromUrl =
    searchParams.get("customerId");

  const isEditMode = Boolean(editId);

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    customerId: customerIdFromUrl || "",
    invoiceDate: new Date()
      .toISOString()
      .split("T")[0],
    dueDate: "",
    title: "Solar System Invoice",
    notes: "",
    items: [
      {
        description: "",
        quantity: 1,
        unit: "Unit",
        rate: 0,
        taxRate: 0,
      },
    ],
    discount: 0,
    additionalCharges: 0,
  });

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

  const normalizeList = (response) => {
    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response?.data)) {
      return response.data;
    }

    if (Array.isArray(response?.data?.customers)) {
      return response.data.customers;
    }

    if (Array.isArray(response?.customers)) {
      return response.customers;
    }

    return [];
  };

  const normalizeObject = (response) => {
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

  const loadCustomers = async () => {
    try {
      const response =
        await customerService.getCustomers();

      setCustomers(
        normalizeList(response)
      );
    } catch (err) {
      console.error(
        "Failed to load customers:",
        err
      );

      throw err;
    }
  };

  const loadInvoice = async () => {
    if (!editId) return;

    const response =
      await invoiceService.getInvoiceById(
        editId
      );

    const invoice =
      normalizeObject(response);

    if (!invoice) {
      throw new Error(
        "Invoice details could not be loaded."
      );
    }

    const customer =
      getValue(
        invoice,
        ["customer"],
        null
      );

    const customerId =
      getId(customer) ||
      getValue(invoice, [
        "customerId",
      ]);

    const invoiceItems =
      getValue(
        invoice,
        ["items", "invoiceItems"],
        []
      );

    setForm({
      customerId: customerId || "",
      invoiceDate:
        getValue(
          invoice,
          [
            "invoiceDate",
            "date",
          ],
          new Date()
            .toISOString()
            .split("T")[0]
        )?.split?.("T")[0] ||
        new Date()
          .toISOString()
          .split("T")[0],
      dueDate:
        getValue(
          invoice,
          ["dueDate"],
          ""
        )?.split?.("T")[0] || "",
      title: getValue(
        invoice,
        ["title"],
        "Solar System Invoice"
      ),
      notes: getValue(
        invoice,
        ["notes"],
        ""
      ),
      items:
        Array.isArray(invoiceItems) &&
        invoiceItems.length > 0
          ? invoiceItems.map(
              (item) => ({
                description:
                  getValue(
                    item,
                    [
                      "description",
                      "name",
                    ],
                    ""
                  ),
                quantity:
                  Number(
                    getValue(
                      item,
                      ["quantity"],
                      1
                    )
                  ) || 1,
                unit: getValue(
                  item,
                  ["unit"],
                  "Unit"
                ),
                rate:
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
                  ) || 0,
                taxRate:
                  Number(
                    getValue(
                      item,
                      [
                        "taxRate",
                        "tax",
                      ],
                      0
                    )
                  ) || 0,
              })
            )
          : [
              {
                description: "",
                quantity: 1,
                unit: "Unit",
                rate: 0,
                taxRate: 0,
              },
            ],
      discount:
        Number(
          getValue(
            invoice,
            ["discount"],
            0
          )
        ) || 0,
      additionalCharges:
        Number(
          getValue(
            invoice,
            [
              "additionalCharges",
              "extraCharges",
            ],
            0
          )
        ) || 0,
    });
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      await loadCustomers();
      await loadInvoice();
    } catch (err) {
      console.error(
        "Failed to load invoice form:",
        err
      );

      setError(
        err?.message ||
          "Failed to load invoice form."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [editId]);

  const updateForm = (
    field,
    value
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const updateItem = (
    index,
    field,
    value
  ) => {
    setForm((previous) => {
      const items = [
        ...previous.items,
      ];

      items[index] = {
        ...items[index],
        [field]: value,
      };

      return {
        ...previous,
        items,
      };
    });
  };

  const addItem = () => {
    setForm((previous) => ({
      ...previous,
      items: [
        ...previous.items,
        {
          description: "",
          quantity: 1,
          unit: "Unit",
          rate: 0,
          taxRate: 0,
        },
      ],
    }));
  };

  const removeItem = (index) => {
    setForm((previous) => {
      if (previous.items.length === 1) {
        return previous;
      }

      return {
        ...previous,
        items: previous.items.filter(
          (_, itemIndex) =>
            itemIndex !== index
        ),
      };
    });
  };

  const calculations = useMemo(() => {
    const subtotal =
      form.items.reduce(
        (sum, item) => {
          const quantity =
            Number(
              item.quantity
            ) || 0;

          const rate =
            Number(
              item.rate
            ) || 0;

          return (
            sum +
            quantity * rate
          );
        },
        0
      );

    const taxTotal =
      form.items.reduce(
        (sum, item) => {
          const quantity =
            Number(
              item.quantity
            ) || 0;

          const rate =
            Number(
              item.rate
            ) || 0;

          const taxRate =
            Number(
              item.taxRate
            ) || 0;

          const lineAmount =
            quantity * rate;

          return (
            sum +
            (lineAmount *
              taxRate) /
              100
          );
        },
        0
      );

    const discount =
      Number(
        form.discount
      ) || 0;

    const additionalCharges =
      Number(
        form.additionalCharges
      ) || 0;

    const grandTotal =
      subtotal +
      taxTotal -
      discount +
      additionalCharges;

    return {
      subtotal,
      taxTotal,
      discount,
      additionalCharges,
      grandTotal: Math.max(
        grandTotal,
        0
      ),
    };
  }, [form]);

  const selectedCustomer = useMemo(() => {
    return customers.find(
      (customer) =>
        getId(customer) ===
        form.customerId
    );
  }, [
    customers,
    form.customerId,
  ]);

  const customerOptions = [
    {
      label: "Select Customer",
      value: "",
    },
    ...customers.map(
      (customer) => ({
        label:
          getValue(
            customer,
            [
              "name",
              "fullName",
              "customerName",
              "companyName",
            ],
            "Unnamed Customer"
          ) +
          (getValue(
            customer,
            ["companyName"],
            ""
          )
            ? ` — ${getValue(
                customer,
                ["companyName"],
                ""
              )}`
            : ""),
        value: getId(customer),
      })
    ),
  ];

  const validateForm = () => {
    if (!form.customerId) {
      return "Please select a customer.";
    }

    if (!form.invoiceDate) {
      return "Please select an invoice date.";
    }

    if (
      form.dueDate &&
      new Date(form.dueDate) <
        new Date(form.invoiceDate)
    ) {
      return "Due date cannot be earlier than invoice date.";
    }

    const invalidItem =
      form.items.find(
        (item) =>
          !String(
            item.description || ""
          ).trim() ||
          Number(item.quantity) <=
            0 ||
          Number(item.rate) < 0
      );

    if (invalidItem) {
      return "Please complete all invoice items with valid quantity and rate.";
    }

    if (
      Number(form.discount) < 0 ||
      Number(
        form.additionalCharges
      ) < 0
    ) {
      return "Discount and additional charges cannot be negative.";
    }

    return "";
  };

  const buildPayload = () => {
    return {
      customerId: form.customerId,
      invoiceDate: form.invoiceDate,
      ...(form.dueDate
        ? {
            dueDate: form.dueDate,
          }
        : {}),
      title: form.title,
      items: form.items.map(
        (item) => ({
          description:
            item.description.trim(),
          quantity:
            Number(
              item.quantity
            ),
          unit:
            item.unit ||
            "Unit",
          rate:
            Number(
              item.rate
            ),
          taxRate:
            Number(
              item.taxRate
            ) || 0,
        })
      ),
      discount:
        Number(
          form.discount
        ) || 0,
      additionalCharges:
        Number(
          form.additionalCharges
        ) || 0,
      notes:
        form.notes.trim(),
    };
  };

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    try {
      setError("");
      setSuccess("");

      const validationError =
        validateForm();

      if (validationError) {
        setError(
          validationError
        );
        return;
      }

      setSaving(true);

      const payload =
        buildPayload();

      if (isEditMode) {
        if (
          typeof invoiceService.updateInvoice !==
          "function"
        ) {
          throw new Error(
            "Invoice update service is not available."
          );
        }

        await invoiceService.updateInvoice(
          editId,
          payload
        );

        setSuccess(
          "Invoice updated successfully."
        );
      } else {
        await invoiceService.createInvoice(
          payload
        );

        setSuccess(
          "Invoice created successfully."
        );
      }

      setTimeout(() => {
        router.push(
          "/admin/invoices"
        );
      }, 700);
    } catch (err) {
      console.error(
        "Failed to save invoice:",
        err
      );

      setError(
        err?.message ||
          "Failed to save invoice."
      );
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (
    value
  ) => {
    return `₹${Number(
      value || 0
    ).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-create-invoice-loading">
          <Loader />
          <p>
            Loading invoice form...
          </p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-create-invoice-page">
        {/* Header */}
        <div className="admin-create-invoice-header">
          <div>
            <button
              type="button"
              className="admin-create-invoice-back"
              onClick={() =>
                router.push(
                  "/admin/invoices"
                )
              }
            >
              ← Back to Invoices
            </button>

            <h1>
              {isEditMode
                ? "Edit Invoice"
                : "Create Invoice"}
            </h1>

            <p>
              {isEditMode
                ? "Update the invoice details and billing items."
                : "Create a new customer invoice."}
            </p>
          </div>
        </div>

        {error && (
          <div className="admin-create-invoice-alert error">
            {error}
          </div>
        )}

        {success && (
          <div className="admin-create-invoice-alert success">
            {success}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="admin-create-invoice-form"
        >
          <div className="admin-create-invoice-layout">
            <div className="admin-create-invoice-main">
              {/* Basic Details */}
              <section className="admin-create-invoice-card">
                <div className="admin-create-invoice-card-header">
                  <div>
                    <h2>
                      Invoice Details
                    </h2>
                    <p>
                      Basic invoice and customer
                      information.
                    </p>
                  </div>
                </div>

                <div className="admin-create-invoice-fields">
                  <Select
                    label="Customer"
                    value={
                      form.customerId
                    }
                    onChange={(
                      event
                    ) =>
                      updateForm(
                        "customerId",
                        event?.target
                          ? event.target
                              .value
                          : event
                      )
                    }
                    options={
                      customerOptions
                    }
                    required
                  />

                  <Input
                    label="Invoice Date"
                    type="date"
                    value={
                      form.invoiceDate
                    }
                    onChange={(
                      event
                    ) =>
                      updateForm(
                        "invoiceDate",
                        event.target.value
                      )
                    }
                    required
                  />

                  <Input
                    label="Due Date"
                    type="date"
                    value={
                      form.dueDate
                    }
                    onChange={(
                      event
                    ) =>
                      updateForm(
                        "dueDate",
                        event.target.value
                      )
                    }
                  />

                  <Input
                    label="Invoice Title"
                    value={
                      form.title
                    }
                    onChange={(
                      event
                    ) =>
                      updateForm(
                        "title",
                        event.target.value
                      )
                    }
                    placeholder="Solar System Invoice"
                  />
                </div>

                {selectedCustomer && (
                  <div className="admin-create-invoice-customer-preview">
                    <div className="admin-create-invoice-customer-avatar">
                      {String(
                        getValue(
                          selectedCustomer,
                          [
                            "name",
                            "fullName",
                            "customerName",
                          ],
                          "C"
                        )
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div>
                      <strong>
                        {getValue(
                          selectedCustomer,
                          [
                            "name",
                            "fullName",
                            "customerName",
                          ],
                          "Customer"
                        )}
                      </strong>

                      <span>
                        {[
                          getValue(
                            selectedCustomer,
                            [
                              "companyName",
                            ],
                            ""
                          ),
                          getValue(
                            selectedCustomer,
                            [
                              "phone",
                            ],
                            ""
                          ),
                          getValue(
                            selectedCustomer,
                            [
                              "email",
                            ],
                            ""
                          ),
                        ]
                          .filter(
                            Boolean
                          )
                          .join(
                            " • "
                          )}
                      </span>
                    </div>
                  </div>
                )}
              </section>

              {/* Items */}
              <section className="admin-create-invoice-card">
                <div className="admin-create-invoice-card-header">
                  <div>
                    <h2>
                      Invoice Items
                    </h2>
                    <p>
                      Add products or services included
                      in this invoice.
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="secondary"
                    onClick={addItem}
                  >
                    + Add Item
                  </Button>
                </div>

                <div className="admin-create-invoice-items">
                  {form.items.map(
                    (
                      item,
                      index
                    ) => (
                      <div
                        className="admin-create-invoice-item"
                        key={index}
                      >
                        <div className="admin-create-invoice-item-number">
                          {index + 1}
                        </div>

                        <div className="admin-create-invoice-item-fields">
                          <div className="admin-create-invoice-item-description">
                            <Input
                              label="Description"
                              value={
                                item.description
                              }
                              onChange={(
                                event
                              ) =>
                                updateItem(
                                  index,
                                  "description",
                                  event
                                    .target
                                    .value
                                )
                              }
                              placeholder="Solar panel installation"
                              required
                            />
                          </div>

                          <Input
                            label="Quantity"
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={
                              item.quantity
                            }
                            onChange={(
                              event
                            ) =>
                              updateItem(
                                index,
                                "quantity",
                                event
                                  .target
                                  .value
                              )
                            }
                            required
                          />

                          <Input
                            label="Unit"
                            value={
                              item.unit
                            }
                            onChange={(
                              event
                            ) =>
                              updateItem(
                                index,
                                "unit",
                                event
                                  .target
                                  .value
                              )
                            }
                            placeholder="Unit"
                          />

                          <Input
                            label="Rate"
                            type="number"
                            min="0"
                            step="0.01"
                            value={
                              item.rate
                            }
                            onChange={(
                              event
                            ) =>
                              updateItem(
                                index,
                                "rate",
                                event
                                  .target
                                  .value
                              )
                            }
                            required
                          />

                          <Input
                            label="Tax %"
                            type="number"
                            min="0"
                            step="0.01"
                            value={
                              item.taxRate
                            }
                            onChange={(
                              event
                            ) =>
                              updateItem(
                                index,
                                "taxRate",
                                event
                                  .target
                                  .value
                              )
                            }
                          />

                          <div className="admin-create-invoice-line-total">
                            <span>
                              Line Total
                            </span>

                            <strong>
                              {formatCurrency(
                                (Number(
                                  item.quantity
                                ) ||
                                  0) *
                                  (Number(
                                    item.rate
                                  ) ||
                                    0)
                              )}
                            </strong>
                          </div>
                        </div>

                        {form.items.length >
                          1 && (
                          <button
                            type="button"
                            className="admin-create-invoice-remove-item"
                            onClick={() =>
                              removeItem(
                                index
                              )
                            }
                            title="Remove item"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    )
                  )}
                </div>
              </section>

              {/* Notes */}
              <section className="admin-create-invoice-card">
                <div className="admin-create-invoice-card-header">
                  <div>
                    <h2>
                      Additional Information
                    </h2>
                    <p>
                      Add any notes that should appear
                      with the invoice.
                    </p>
                  </div>
                </div>

                <div className="admin-create-invoice-notes">
                  <Textarea
                    label="Notes"
                    value={
                      form.notes
                    }
                    onChange={(
                      event
                    ) =>
                      updateForm(
                        "notes",
                        event.target.value
                      )
                    }
                    placeholder="Add invoice notes..."
                    rows={5}
                  />
                </div>
              </section>
            </div>

            {/* Summary */}
            <aside className="admin-create-invoice-sidebar">
              <section className="admin-create-invoice-summary-card">
                <div className="admin-create-invoice-summary-header">
                  <h2>
                    Invoice Summary
                  </h2>

                  <span>
                    {form.items.length}{" "}
                    item
                    {form.items.length !==
                    1
                      ? "s"
                      : ""}
                  </span>
                </div>

                <div className="admin-create-invoice-summary-row">
                  <span>
                    Subtotal
                  </span>

                  <strong>
                    {formatCurrency(
                      calculations.subtotal
                    )}
                  </strong>
                </div>

                <div className="admin-create-invoice-summary-row">
                  <span>
                    Tax
                  </span>

                  <strong>
                    {formatCurrency(
                      calculations.taxTotal
                    )}
                  </strong>
                </div>

                <div className="admin-create-invoice-summary-field">
                  <Input
                    label="Discount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      form.discount
                    }
                    onChange={(
                      event
                    ) =>
                      updateForm(
                        "discount",
                        event.target.value
                      )
                    }
                  />
                </div>

                <div className="admin-create-invoice-summary-field">
                  <Input
                    label="Additional Charges"
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      form.additionalCharges
                    }
                    onChange={(
                      event
                    ) =>
                      updateForm(
                        "additionalCharges",
                        event.target.value
                      )
                    }
                  />
                </div>

                <div className="admin-create-invoice-summary-total">
                  <span>
                    Grand Total
                  </span>

                  <strong>
                    {formatCurrency(
                      calculations.grandTotal
                    )}
                  </strong>
                </div>
              </section>

              <section className="admin-create-invoice-actions-card">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={saving}
                >
                  {saving
                    ? isEditMode
                      ? "Updating..."
                      : "Creating..."
                    : isEditMode
                    ? "Update Invoice"
                    : "Create Invoice"}
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  disabled={saving}
                  onClick={() =>
                    router.push(
                      "/admin/invoices"
                    )
                  }
                >
                  Cancel
                </Button>
              </section>

              <div className="admin-create-invoice-note">
                <strong>
                  Invoice Information
                </strong>

                <p>
                  Invoice totals are calculated from
                  the item quantity, rate, tax, discount
                  and additional charges.
                </p>
              </div>
            </aside>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default CreateInvoicePage;