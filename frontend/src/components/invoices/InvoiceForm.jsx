"use client";

import React, { useEffect, useMemo, useState } from "react";
import Input from "../common/Input";
import Select from "../common/Select";
import Button from "../common/Button";
import api from "@/lib/axios";

const INITIAL_FORM = {
  customer: "",
  customerDetails: {
    name: "",
    company: "",
    mobile: "",
    alternateMobile: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    gst: "",
  },
  invoiceDate: "",
  dueDate: "",
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
  rate: 0,
  discount: 0,
  taxRate: 0,
});

const formatDateForInput = (value) => {
  if (!value) return "";

  try {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toISOString().split("T")[0];
  } catch {
    return "";
  }
};

const getInitialForm = (invoice) => {
  if (!invoice) {
    return {
      ...INITIAL_FORM,
      customerDetails: {
        ...INITIAL_FORM.customerDetails,
      },
      invoiceDate: new Date().toISOString().split("T")[0],
    };
  }

  const customerDetails =
    invoice.customerDetails ||
    invoice.customerSnapshot ||
    invoice.customerInfo ||
    {};

  return {
    customer: getId(invoice.customer) || invoice.customerId || "",

    customerDetails: {
      name:
        customerDetails.name ||
        invoice.customer?.name ||
        invoice.customer?.customerName ||
        "",

      company:
        customerDetails.company ||
        customerDetails.companyName ||
        invoice.customer?.companyName ||
        "",

      mobile:
        customerDetails.mobile ||
        invoice.customer?.mobile ||
        "",

      alternateMobile:
        customerDetails.alternateMobile ||
        invoice.customer?.alternateMobile ||
        "",

      email:
        customerDetails.email ||
        invoice.customer?.email ||
        "",

      address:
        customerDetails.address ||
        invoice.customer?.address ||
        "",

      city:
        customerDetails.city ||
        invoice.customer?.city ||
        "",

      state:
        customerDetails.state ||
        invoice.customer?.state ||
        "",

      pincode:
        customerDetails.pincode ||
        invoice.customer?.pincode ||
        "",

      gst:
        customerDetails.gst ||
        customerDetails.gstNumber ||
        invoice.customer?.gstNumber ||
        "",
    },

    invoiceDate:
      invoice.invoiceDate ||
      invoice.date ||
      formatDateForInput(invoice.createdAt),

    dueDate: formatDateForInput(invoice.dueDate),

    placeOfSupply:
      invoice.placeOfSupply ||
      customerDetails.state ||
      invoice.customer?.state ||
      "Uttar Pradesh",

    items: Array.isArray(invoice.items)
      ? invoice.items.map((item) => ({
          product: getId(item.product) || item.productId || "",
          description: item.description || "",
          quantity: Number(item.quantity) || 1,
          unit: item.unit || "Unit",
          rate: Number(
            item.rate ??
              item.unitPrice ??
              item.price ??
              0
          ),
          discount: Number(item.discount ?? 0),
          taxRate: Number(
            item.taxRate ??
              item.tax ??
              0
          ),
        }))
      : [],

    notes: invoice.notes || "",

    termsAndConditions:
      invoice.termsAndConditions ||
      invoice.terms ||
      "",
  };
};

const getCustomerFromResponse = (response) => {
  const data = response?.data;

  if (data?.data) {
    if (data.data.customer) {
      return data.data.customer;
    }

    return data.data;
  }

  if (data?.customer) {
    return data.customer;
  }

  return data || null;
};

const buildCustomerDetails = (customer) => {
  if (!customer) {
    return {
      ...INITIAL_FORM.customerDetails,
    };
  }

  return {
    name:
      customer.name ||
      customer.customerName ||
      customer.fullName ||
      "",

    company:
      customer.companyName ||
      customer.company ||
      "",

    mobile:
      customer.mobile ||
      customer.phone ||
      "",

    alternateMobile:
      customer.alternateMobile ||
      "",

    email:
      customer.email ||
      "",

    address:
      customer.address ||
      customer.billingAddress ||
      customer.siteAddress ||
      "",

    city:
      customer.city ||
      "",

    state:
      customer.state ||
      "",

    pincode:
      customer.pincode ||
      customer.zipCode ||
      "",

    gst:
      customer.gstNumber ||
      customer.gstin ||
      customer.gst ||
      "",
  };
};

const calculateItem = (item) => {
  const quantity = Math.max(Number(item.quantity) || 0, 0);
  const rate = Math.max(Number(item.rate) || 0, 0);
  const discount = Math.max(Number(item.discount) || 0, 0);
  const taxRate = Math.max(Number(item.taxRate) || 0, 0);

  const grossAmount = quantity * rate;

  const discountAmount = Math.min(
    (grossAmount * discount) / 100,
    grossAmount
  );

  const taxableAmount = grossAmount - discountAmount;

  const taxAmount = (taxableAmount * taxRate) / 100;

  const total = taxableAmount + taxAmount;

  return {
    grossAmount,
    discountAmount,
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
  const [customerLoading, setCustomerLoading] = useState(false);
  const [customerError, setCustomerError] = useState("");

  useEffect(() => {
    setForm(getInitialForm(invoice));
    setErrors({});
    setCustomerError("");
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

        result.subtotal += calculated.grossAmount;
        result.discount += calculated.discountAmount;
        result.taxableAmount += calculated.taxableAmount;
        result.tax += calculated.taxAmount;
        result.total += calculated.total;

        return result;
      },
      {
        subtotal: 0,
        discount: 0,
        taxableAmount: 0,
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

    setErrors((previous) => {
      const next = { ...previous };

      delete next[`item_${index}`];
      delete next[`quantity_${index}`];
      delete next[`price_${index}`];
      delete next[`discount_${index}`];

      return next;
    });
  };

  const handleCustomerChange = async (customerId) => {
    updateField("customer", customerId);

    setCustomerError("");

    if (!customerId) {
      setForm((previous) => ({
        ...previous,
        customer: "",
        customerDetails: {
          ...INITIAL_FORM.customerDetails,
        },
      }));

      return;
    }

    setCustomerLoading(true);

    try {
      const response = await api.get(
        `/customers/${customerId}`
      );

      const customer = getCustomerFromResponse(response);

      if (!customer) {
        throw new Error("Customer data could not be loaded.");
      }

      const customerDetails =
        buildCustomerDetails(customer);

      setForm((previous) => ({
        ...previous,
        customer: customerId,
        customerDetails,
        placeOfSupply:
          customerDetails.state ||
          previous.placeOfSupply ||
          "Uttar Pradesh",
      }));

      setErrors((previous) => {
        const next = { ...previous };
        delete next.customer;
        return next;
      });
    } catch (customerFetchError) {
      const message =
        customerFetchError?.response?.data?.message ||
        customerFetchError?.response?.data?.error ||
        customerFetchError?.message ||
        "Unable to load customer details.";

      setCustomerError(message);

      setForm((previous) => ({
        ...previous,
        customerDetails: {
          ...INITIAL_FORM.customerDetails,
        },
      }));
    } finally {
      setCustomerLoading(false);
    }
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
                product?.description ||
                item.description ||
                "",

              unit:
                product?.unit ||
                item.unit ||
                "Unit",

              rate: Number(
                product?.rate ??
                  product?.price ??
                  product?.sellingPrice ??
                  item.rate ??
                  0
              ),

              taxRate: Number(
                product?.taxRate ??
                  product?.tax ??
                  item.taxRate ??
                  0
              ),
            }
          : item
      ),
    }));
  };

  const addItem = () => {
    setForm((previous) => ({
      ...previous,
      items: [
        ...previous.items,
        createEmptyItem(),
      ],
    }));

    setErrors((previous) => {
      const next = { ...previous };
      delete next.items;
      return next;
    });
  };

  const removeItem = (index) => {
    setForm((previous) => ({
      ...previous,
      items: previous.items.filter(
        (_, itemIndex) => itemIndex !== index
      ),
    }));

    setErrors((previous) => {
      const next = { ...previous };

      delete next[`item_${index}`];
      delete next[`quantity_${index}`];
      delete next[`price_${index}`];
      delete next[`discount_${index}`];

      return next;
    });
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.customer) {
      nextErrors.customer = "Customer is required.";
    }

    if (!form.invoiceDate) {
      nextErrors.invoiceDate =
        "Invoice date is required.";
    }

    if (form.dueDate && form.invoiceDate) {
      if (
        new Date(form.dueDate) <
        new Date(form.invoiceDate)
      ) {
        nextErrors.dueDate =
          "Due date cannot be earlier than invoice date.";
      }
    }

    if (!form.items.length) {
      nextErrors.items =
        "At least one invoice item is required.";
    }

    form.items.forEach((item, index) => {
      if (
        !item.description?.trim() &&
        !item.product
      ) {
        nextErrors[`item_${index}`] =
          "Select a product or enter an item description.";
      }

      if (
        !item.quantity ||
        Number(item.quantity) <= 0
      ) {
        nextErrors[`quantity_${index}`] =
          "Quantity must be greater than zero.";
      }

      if (
        item.rate === "" ||
        Number(item.rate) < 0
      ) {
        nextErrors[`price_${index}`] =
          "Enter a valid rate.";
      }

      if (
        Number(item.discount) < 0 ||
        Number(item.discount) > 100
      ) {
        nextErrors[`discount_${index}`] =
          "Discount must be between 0 and 100.";
      }

      if (
        Number(item.taxRate) < 0 ||
        Number(item.taxRate) > 100
      ) {
        nextErrors[`tax_${index}`] =
          "Tax rate must be between 0 and 100.";
      }
    });

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (customerLoading) {
      return;
    }

    if (!validate()) {
      return;
    }

    const payload = {
      customer: form.customer,

      customerDetails: {
        ...form.customerDetails,
      },

      invoiceDate: form.invoiceDate,
      dueDate: form.dueDate || undefined,

      placeOfSupply: form.placeOfSupply,

      items: form.items.map((item) => ({
        product: item.product || undefined,

        description:
          item.description?.trim() || "",

        quantity: Number(item.quantity),

        unit:
          item.unit?.trim() ||
          "Unit",

        rate: Number(item.rate) || 0,

        discount:
          Number(item.discount) || 0,

        taxRate:
          Number(item.taxRate) || 0,
      })),

      notes: form.notes?.trim() || "",

      termsAndConditions:
        form.termsAndConditions?.trim() || "",
    };

    if (typeof onSubmit === "function") {
      await onSubmit(payload);
    }
  };

  const customerDetails = form.customerDetails;

  return (
    <form
      className="invoice-form"
      onSubmit={handleSubmit}
    >
      {error && (
        <div className="invoice-form-error">
          {error}
        </div>
      )}

      {customerError && (
        <div className="invoice-form-error">
          {customerError}
        </div>
      )}

      {/* Invoice Information */}
      <section className="invoice-form-section">
        <div className="invoice-form-section-header">
          <div>
            <h3>Invoice Information</h3>
            <p>
              Select a customer and enter the basic
              invoice details.
            </p>
          </div>
        </div>

        <div className="invoice-form-grid">
          <div className="invoice-form-field">
            <Select
              label="Customer"
              name="customer"
              value={form.customer}
              onChange={(event) =>
                handleCustomerChange(
                  event.target.value
                )
              }
              options={[
                {
                  value: "",
                  label: "Select customer",
                },
                ...customerOptions,
              ]}
              error={errors.customer}
              disabled={
                loading ||
                customerLoading
              }
              required
            />

            {customerLoading && (
              <span className="invoice-field-error">
                Loading customer details...
              </span>
            )}
          </div>

          <div className="invoice-form-field">
            <Select
              label="Invoice Type"
              name="invoiceType"
              value="TAX_INVOICE"
              onChange={() => {}}
              options={INVOICE_TYPES}
              disabled
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
                updateField(
                  "dueDate",
                  event.target.value
                )
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

      {/* Customer Information */}
      <section className="invoice-form-section">
        <div className="invoice-form-section-header">
          <div>
            <h3>Customer Information</h3>
            <p>
              Customer information is automatically
              fetched from the selected customer.
            </p>
          </div>
        </div>

        <div className="invoice-form-grid">
          <div className="invoice-form-field">
            <Input
              label="Customer Name"
              value={customerDetails.name}
              disabled
              placeholder="Auto-filled"
            />
          </div>

          <div className="invoice-form-field">
            <Input
              label="Company"
              value={customerDetails.company}
              disabled
              placeholder="Auto-filled"
            />
          </div>

          <div className="invoice-form-field">
            <Input
              label="Mobile"
              value={customerDetails.mobile}
              disabled
              placeholder="Auto-filled"
            />
          </div>

          <div className="invoice-form-field">
            <Input
              label="Alternate Mobile"
              value={
                customerDetails.alternateMobile
              }
              disabled
              placeholder="Auto-filled"
            />
          </div>

          <div className="invoice-form-field">
            <Input
              label="Email"
              value={customerDetails.email}
              disabled
              placeholder="Auto-filled"
            />
          </div>

          <div className="invoice-form-field">
            <Input
              label="GST Number"
              value={customerDetails.gst}
              disabled
              placeholder="Auto-filled"
            />
          </div>

          <div className="invoice-form-field">
            <Input
              label="City"
              value={customerDetails.city}
              disabled
              placeholder="Auto-filled"
            />
          </div>

          <div className="invoice-form-field">
            <Input
              label="State"
              value={customerDetails.state}
              disabled
              placeholder="Auto-filled"
            />
          </div>

          <div className="invoice-form-field">
            <Input
              label="Pincode"
              value={customerDetails.pincode}
              disabled
              placeholder="Auto-filled"
            />
          </div>

          <div className="invoice-form-field invoice-form-full">
            <Input
              label="Address"
              value={customerDetails.address}
              disabled
              placeholder="Auto-filled"
            />
          </div>
        </div>
      </section>

      {/* Invoice Items */}
      <section className="invoice-form-section">
        <div className="invoice-form-section-header">
          <div>
            <h3>Invoice Items</h3>
            <p>
              Add products and services included in
              the invoice.
            </p>
          </div>

          <Button
            type="button"
            variant="secondary"
            size="small"
            onClick={addItem}
            disabled={
              loading ||
              customerLoading
            }
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

            <p>
              Add at least one item to create the
              invoice.
            </p>

            <Button
              type="button"
              variant="secondary"
              size="small"
              onClick={addItem}
              disabled={
                loading ||
                customerLoading
              }
            >
              Add First Item
            </Button>
          </div>
        ) : (
          <div className="invoice-form-items">
            {form.items.map((item, index) => {
              const calculated =
                calculateItem(item);

              return (
                <div
                  className="invoice-form-item"
                  key={`invoice-item-${index}`}
                >
                  <div className="invoice-form-item-header">
                    <span>
                      Item{" "}
                      {String(index + 1).padStart(
                        2,
                        "0"
                      )}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        removeItem(index)
                      }
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
                        value={
                          item.description
                        }
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

                      {errors[
                        `item_${index}`
                      ] && (
                        <span className="invoice-field-error">
                          {
                            errors[
                              `item_${index}`
                            ]
                          }
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
                        error={
                          errors[
                            `quantity_${index}`
                          ]
                        }
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
                        label="Rate"
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.rate}
                        onChange={(event) =>
                          updateItem(
                            index,
                            "rate",
                            event.target.value
                          )
                        }
                        error={
                          errors[
                            `price_${index}`
                          ]
                        }
                        disabled={loading}
                      />
                    </div>

                    <div className="invoice-form-field">
                      <Input
                        label="Discount (%)"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={item.discount}
                        onChange={(event) =>
                          updateItem(
                            index,
                            "discount",
                            event.target.value
                          )
                        }
                        error={
                          errors[
                            `discount_${index}`
                          ]
                        }
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
                        error={
                          errors[
                            `tax_${index}`
                          ]
                        }
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="invoice-form-item-total">
                    <span>Item Total</span>

                    <strong>
                      {formatIndianCurrency(
                        calculated.total
                      )}
                    </strong>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Invoice Summary */}
      <section className="invoice-form-section">
        <div className="invoice-form-section-header">
          <div>
            <h3>Invoice Summary</h3>
            <p>
              Review the calculated invoice amounts.
            </p>
          </div>
        </div>

        <div className="invoice-form-summary">
          <div>
            <span>Subtotal</span>
            <strong>
              {formatIndianCurrency(
                totals.subtotal
              )}
            </strong>
          </div>

          <div>
            <span>Discount</span>
            <strong>
              {formatIndianCurrency(
                totals.discount
              )}
            </strong>
          </div>

          <div>
            <span>Taxable Amount</span>
            <strong>
              {formatIndianCurrency(
                totals.taxableAmount
              )}
            </strong>
          </div>

          <div>
            <span>Tax</span>
            <strong>
              {formatIndianCurrency(
                totals.tax
              )}
            </strong>
          </div>

          <div className="invoice-form-grand-total">
            <span>Grand Total</span>

            <strong>
              {formatIndianCurrency(
                totals.total
              )}
            </strong>
          </div>
        </div>
      </section>

      {/* Additional Information */}
      <section className="invoice-form-section">
        <div className="invoice-form-section-header">
          <div>
            <h3>Additional Information</h3>
            <p>
              Add notes and invoice terms.
            </p>
          </div>
        </div>

        <div className="invoice-form-textarea-grid">
          <div className="invoice-form-field">
            <label htmlFor="invoice-notes">
              Notes
            </label>

            <textarea
              id="invoice-notes"
              value={form.notes}
              onChange={(event) =>
                updateField(
                  "notes",
                  event.target.value
                )
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
              value={
                form.termsAndConditions
              }
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

      {/* Actions */}
      <div className="invoice-form-actions">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={
              loading ||
              customerLoading
            }
          >
            Cancel
          </Button>
        )}

        <Button
          type="submit"
          variant="primary"
          loading={
            loading ||
            customerLoading
          }
          disabled={
            loading ||
            customerLoading
          }
        >
          {submitLabel ||
            (invoice
              ? "Update Invoice"
              : "Create Invoice")}
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