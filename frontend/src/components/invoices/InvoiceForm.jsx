"use client";

import React, { useEffect, useMemo, useState } from "react";
import Input from "../common/Input";
import Select from "../common/Select";
import Button from "../common/Button";

const INITIAL_FORM = {
  customer: "",
  invoiceDate: "",
  dueDate: "",
  invoiceType: "TAX_INVOICE",
  placeOfSupply: "Uttar Pradesh",
  items: [],
  notes: "",
  termsAndConditions: "",
};

const INVOICE_TYPES = [
  { value: "TAX_INVOICE", label: "Tax Invoice" },
  { value: "PROFORMA", label: "Proforma Invoice" },
];

const getId = (value) => {
  if (!value) return "";

  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  return String(value._id || value.id || "");
};

const getCustomerName = (customer) =>
  customer?.name ||
  customer?.customerName ||
  customer?.fullName ||
  "Unnamed Customer";

const createEmptyItem = () => ({
  product: "",
  description: "",
  quantity: 1,
  unit: "Unit",
  unitPrice: 0,
  taxRate: 0,
});

const getInitialForm = (invoice) => {
  if (!invoice) {
    return {
      ...INITIAL_FORM,
      invoiceDate: new Date().toISOString().split("T")[0],
    };
  }

  return {
    customer: getId(invoice.customer) || invoice.customerId || "",
    invoiceDate:
      invoice.invoiceDate ||
      invoice.date ||
      (invoice.createdAt
        ? new Date(invoice.createdAt).toISOString().split("T")[0]
        : ""),
    dueDate: invoice.dueDate
      ? new Date(invoice.dueDate).toISOString().split("T")[0]
      : "",
    invoiceType: invoice.invoiceType || "TAX_INVOICE",
    placeOfSupply:
      invoice.placeOfSupply || "Uttar Pradesh",
    items: Array.isArray(invoice.items)
      ? invoice.items.map((item) => ({
          product: getId(item.product) || item.productId || "",
          description: item.description || "",
          quantity: Number(item.quantity) || 1,
          unit: item.unit || "Unit",
          unitPrice: Number(item.unitPrice ?? item.price) || 0,
          taxRate: Number(item.taxRate ?? item.tax) || 0,
        }))
      : [],
    notes: invoice.notes || "",
    termsAndConditions:
      invoice.termsAndConditions ||
      invoice.terms ||
      "",
  };
};

const calculateItem = (item) => {
  const quantity = Number(item.quantity) || 0;
  const unitPrice = Number(item.unitPrice) || 0;
  const taxRate = Number(item.taxRate) || 0;

  const taxableAmount = Math.max(quantity * unitPrice, 0);
  const taxAmount = (taxableAmount * taxRate) / 100;
  const total = taxableAmount + taxAmount;

  return {
    taxableAmount,
    taxAmount,
    total,
  };
};

export default function InvoiceForm({
  invoice = null,
  customers = [],
  products = [],
  onSubmit,
  onCancel,
  loading = false,
  error = "",
  submitLabel,
}) {
  const [form, setForm] = useState(() =>
    getInitialForm(invoice)
  );

  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm(getInitialForm(invoice));
    setErrors({});
  }, [invoice]);

  const customerOptions = useMemo(
    () =>
      customers.map((customer) => ({
        value: getId(customer),
        label: getCustomerName(customer),
      })),
    [customers]
  );

  const productOptions = useMemo(
    () =>
      products.map((product) => ({
        value: getId(product),
        label:
          product?.name ||
          product?.productName ||
          "Unnamed Product",
      })),
    [products]
  );

  const totals = useMemo(() => {
    return form.items.reduce(
      (result, item) => {
        const calculated = calculateItem(item);

        result.subtotal += calculated.taxableAmount;
        result.tax += calculated.taxAmount;
        result.total += calculated.total;

        return result;
      },
      {
        subtotal: 0,
        tax: 0,
        total: 0,
      }
    );
  }, [form.items]);

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setErrors((previous) => {
      if (!previous[field]) return previous;

      const next = { ...previous };
      delete next[field];
      return next;
    });
  };

  const updateItem = (index, field, value) => {
    setForm((previous) => ({
      ...previous,
      items: previous.items.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      ),
    }));
  };

  const handleProductChange = (index, productId) => {
    const product = products.find(
      (item) => getId(item) === String(productId)
    );

    setForm((previous) => ({
      ...previous,
      items: previous.items.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              product: productId,
              description:
                product?.description || item.description,
              unit: product?.unit || item.unit || "Unit",
              unitPrice:
                product?.price ??
                product?.sellingPrice ??
                item.unitPrice ??
                0,
              taxRate:
                product?.taxRate ??
                product?.tax ??
                item.taxRate ??
                0,
            }
          : item
      ),
    }));
  };

  const addItem = () => {
    setForm((previous) => ({
      ...previous,
      items: [...previous.items, createEmptyItem()],
    }));
  };

  const removeItem = (index) => {
    setForm((previous) => ({
      ...previous,
      items: previous.items.filter(
        (_, itemIndex) => itemIndex !== index
      ),
    }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.customer) {
      nextErrors.customer = "Customer is required.";
    }

    if (!form.invoiceDate) {
      nextErrors.invoiceDate = "Invoice date is required.";
    }

    if (form.dueDate && form.invoiceDate) {
      if (
        new Date(form.dueDate) < new Date(form.invoiceDate)
      ) {
        nextErrors.dueDate =
          "Due date cannot be earlier than invoice date.";
      }
    }

    if (!form.items.length) {
      nextErrors.items = "At least one invoice item is required.";
    }

    form.items.forEach((item, index) => {
      if (!item.description.trim() && !item.product) {
        nextErrors[`item_${index}`] =
          "Select a product or enter an item description.";
      }

      if (!item.quantity || Number(item.quantity) <= 0) {
        nextErrors[`quantity_${index}`] =
          "Quantity must be greater than zero.";
      }

      if (
        item.unitPrice === "" ||
        Number(item.unitPrice) < 0
      ) {
        nextErrors[`price_${index}`] =
          "Enter a valid unit price.";
      }
    });

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) return;

    const payload = {
      ...form,
      items: form.items.map((item) => ({
        ...item,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        taxRate: Number(item.taxRate) || 0,
      })),
    };

    if (typeof onSubmit === "function") {
      await onSubmit(payload);
    }
  };

  return (
    <form className="invoice-form" onSubmit={handleSubmit}>
      {error && (
        <div className="invoice-form-error">
          {error}
        </div>
      )}

      <section className="invoice-form-section">
        <div className="invoice-form-section-header">
          <div>
            <h3>Invoice Information</h3>
            <p>Enter the basic invoice details.</p>
          </div>
        </div>

        <div className="invoice-form-grid">
          <div className="invoice-form-field">
            <Select
              label="Customer"
              name="customer"
              value={form.customer}
              onChange={(event) =>
                updateField("customer", event.target.value)
              }
              options={[
                {
                  value: "",
                  label: "Select customer",
                },
                ...customerOptions,
              ]}
              error={errors.customer}
              disabled={loading}
              required
            />
          </div>

          <div className="invoice-form-field">
            <Select
              label="Invoice Type"
              name="invoiceType"
              value={form.invoiceType}
              onChange={(event) =>
                updateField("invoiceType", event.target.value)
              }
              options={INVOICE_TYPES}
              disabled={loading}
            />
          </div>

          <div className="invoice-form-field">
            <Input
              label="Invoice Date"
              name="invoiceDate"
              type="date"
              value={form.invoiceDate}
              onChange={(event) =>
                updateField(
                  "invoiceDate",
                  event.target.value
                )
              }
              error={errors.invoiceDate}
              disabled={loading}
              required
            />
          </div>

          <div className="invoice-form-field">
            <Input
              label="Due Date"
              name="dueDate"
              type="date"
              value={form.dueDate}
              onChange={(event) =>
                updateField("dueDate", event.target.value)
              }
              error={errors.dueDate}
              disabled={loading}
            />
          </div>

          <div className="invoice-form-field invoice-form-full">
            <Input
              label="Place of Supply"
              name="placeOfSupply"
              value={form.placeOfSupply}
              onChange={(event) =>
                updateField(
                  "placeOfSupply",
                  event.target.value
                )
              }
              placeholder="Enter place of supply"
              disabled={loading}
            />
          </div>
        </div>
      </section>

      <section className="invoice-form-section">
        <div className="invoice-form-section-header">
          <div>
            <h3>Invoice Items</h3>
            <p>Add products and services included in the invoice.</p>
          </div>

          <Button
            type="button"
            variant="secondary"
            size="small"
            onClick={addItem}
            disabled={loading}
          >
            Add Item
          </Button>
        </div>

        {errors.items && (
          <div className="invoice-items-error">
            {errors.items}
          </div>
        )}

        {form.items.length === 0 ? (
          <div className="invoice-form-empty-items">
            <span>▦</span>
            <strong>No invoice items</strong>
            <p>Add at least one item to create the invoice.</p>

            <Button
              type="button"
              variant="secondary"
              size="small"
              onClick={addItem}
              disabled={loading}
            >
              Add First Item
            </Button>
          </div>
        ) : (
          <div className="invoice-form-items">
            {form.items.map((item, index) => {
              const calculated = calculateItem(item);

              return (
                <div
                  className="invoice-form-item"
                  key={`invoice-item-${index}`}
                >
                  <div className="invoice-form-item-header">
                    <span>
                      Item {String(index + 1).padStart(2, "0")}
                    </span>

                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      disabled={loading}
                    >
                      Remove
                    </button>
                  </div>

                  <div className="invoice-form-item-grid">
                    <div className="invoice-form-field invoice-form-full">
                      <Select
                        label="Product"
                        value={item.product}
                        onChange={(event) =>
                          handleProductChange(
                            index,
                            event.target.value
                          )
                        }
                        options={[
                          {
                            value: "",
                            label: "Select product",
                          },
                          ...productOptions,
                        ]}
                        disabled={loading}
                      />
                    </div>

                    <div className="invoice-form-field invoice-form-full">
                      <Input
                        label="Description"
                        value={item.description}
                        onChange={(event) =>
                          updateItem(
                            index,
                            "description",
                            event.target.value
                          )
                        }
                        placeholder="Enter item description"
                        disabled={loading}
                      />

                      {errors[`item_${index}`] && (
                        <span className="invoice-field-error">
                          {errors[`item_${index}`]}
                        </span>
                      )}
                    </div>

                    <div className="invoice-form-field">
                      <Input
                        label="Quantity"
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={item.quantity}
                        onChange={(event) =>
                          updateItem(
                            index,
                            "quantity",
                            event.target.value
                          )
                        }
                        error={errors[`quantity_${index}`]}
                        disabled={loading}
                      />
                    </div>

                    <div className="invoice-form-field">
                      <Input
                        label="Unit"
                        value={item.unit}
                        onChange={(event) =>
                          updateItem(
                            index,
                            "unit",
                            event.target.value
                          )
                        }
                        placeholder="Unit"
                        disabled={loading}
                      />
                    </div>

                    <div className="invoice-form-field">
                      <Input
                        label="Unit Price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(event) =>
                          updateItem(
                            index,
                            "unitPrice",
                            event.target.value
                          )
                        }
                        error={errors[`price_${index}`]}
                        disabled={loading}
                      />
                    </div>

                    <div className="invoice-form-field">
                      <Input
                        label="Tax Rate (%)"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={item.taxRate}
                        onChange={(event) =>
                          updateItem(
                            index,
                            "taxRate",
                            event.target.value
                          )
                        }
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="invoice-form-item-total">
                    <span>Item Total</span>
                    <strong>
                      ₹
                      {calculated.total.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </strong>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="invoice-form-section">
        <div className="invoice-form-section-header">
          <div>
            <h3>Invoice Summary</h3>
            <p>Review the calculated invoice amounts.</p>
          </div>
        </div>

        <div className="invoice-form-summary">
          <div>
            <span>Subtotal</span>
            <strong>
              {formatIndianCurrency(totals.subtotal)}
            </strong>
          </div>

          <div>
            <span>Tax</span>
            <strong>
              {formatIndianCurrency(totals.tax)}
            </strong>
          </div>

          <div className="invoice-form-grand-total">
            <span>Grand Total</span>
            <strong>
              {formatIndianCurrency(totals.total)}
            </strong>
          </div>
        </div>
      </section>

      <section className="invoice-form-section">
        <div className="invoice-form-section-header">
          <div>
            <h3>Additional Information</h3>
            <p>Add notes and invoice terms.</p>
          </div>
        </div>

        <div className="invoice-form-textarea-grid">
          <div className="invoice-form-field">
            <label htmlFor="invoice-notes">Notes</label>
            <textarea
              id="invoice-notes"
              value={form.notes}
              onChange={(event) =>
                updateField("notes", event.target.value)
              }
              placeholder="Enter invoice notes"
              rows={4}
              disabled={loading}
            />
          </div>

          <div className="invoice-form-field">
            <label htmlFor="invoice-terms">
              Terms and Conditions
            </label>
            <textarea
              id="invoice-terms"
              value={form.termsAndConditions}
              onChange={(event) =>
                updateField(
                  "termsAndConditions",
                  event.target.value
                )
              }
              placeholder="Enter terms and conditions"
              rows={4}
              disabled={loading}
            />
          </div>
        </div>
      </section>

      <div className="invoice-form-actions">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
        )}

        <Button
          type="submit"
          variant="primary"
          loading={loading}
          disabled={loading}
        >
          {submitLabel ||
            (invoice ? "Update Invoice" : "Create Invoice")}
        </Button>
      </div>
    </form>
  );
}

function formatIndianCurrency(value) {
  const amount = Number(value) || 0;

  return `₹${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}