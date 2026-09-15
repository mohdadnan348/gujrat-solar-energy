"use client";

import React, { useEffect, useMemo, useState } from "react";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import Textarea from "@/components/common/Textarea";
import QuotationItems from "./QuotationItems";

const getId = (value) => {
  if (!value) return "";

  if (typeof value === "string") {
    return value;
  }

  return value?._id || value?.id || "";
};

const getName = (value) => {
  if (!value) return "";

  if (typeof value === "string") {
    return value;
  }

  return (
    value?.name ||
    value?.fullName ||
    value?.customerName ||
    value?.companyName ||
    ""
  );
};

const getDateInputValue = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().split("T")[0];
};

const getToday = () => {
  const date = new Date();

  return date.toISOString().split("T")[0];
};

const getDefaultValidUntil = () => {
  const date = new Date();

  date.setDate(date.getDate() + 15);

  return date.toISOString().split("T")[0];
};

const QuotationForm = ({
  initialData = {},
  customers = [],
  systemConfigurations = [],
  products = [],
  loading = false,
  submitting = false,
  mode = "create",
  onSubmit,
  onCancel,
}) => {
  const isEditMode = mode === "edit";

  const [formData, setFormData] = useState({
    customerId: "",
    systemConfigurationId: "",
    quotationDate: getToday(),
    validUntil: getDefaultValidUntil(),
    items: [],
    subtotal: 0,
    discount: 0,
    discountType: "AMOUNT",
    taxPercentage: 0,
    notes: "",
    termsAndConditions: "",
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (
      !initialData ||
      Object.keys(initialData).length === 0
    ) {
      return;
    }

    setFormData({
      customerId:
        getId(initialData.customerId) ||
        getId(initialData.customer),

      systemConfigurationId:
        getId(
          initialData.systemConfigurationId
        ) ||
        getId(
          initialData.systemConfiguration
        ),

      quotationDate:
        getDateInputValue(
          initialData.quotationDate ||
            initialData.quoteDate ||
            initialData.date
        ) || getToday(),

      validUntil:
        getDateInputValue(
          initialData.validUntil ||
            initialData.validityDate ||
            initialData.expiryDate
        ) || getDefaultValidUntil(),

      items: Array.isArray(initialData.items)
        ? initialData.items
        : Array.isArray(initialData.quotationItems)
        ? initialData.quotationItems
        : [],

      subtotal:
        initialData.subtotal ??
        initialData.subTotal ??
        0,

      discount:
        initialData.discount ??
        initialData.discountAmount ??
        0,

      discountType:
        initialData.discountType ||
        "AMOUNT",

      taxPercentage:
        initialData.taxPercentage ??
        initialData.taxRate ??
        initialData.gstPercentage ??
        0,

      notes: initialData.notes || "",

      termsAndConditions:
        initialData.termsAndConditions ||
        initialData.terms ||
        "",
    });
  }, [initialData]);

  const customerOptions = useMemo(
    () => [
      {
        value: "",
        label: "Select customer",
      },
      ...customers
        .map((customer) => {
          const id = getId(customer);
          const name = getName(customer);

          return {
            value: id,
            label:
              name ||
              customer?.phone ||
              customer?.mobile ||
              `Customer ${id}`,
          };
        })
        .filter((item) => item.value),
    ],
    [customers]
  );

  const configurationOptions = useMemo(
    () => [
      {
        value: "",
        label: "Select system configuration",
      },
      ...systemConfigurations
        .map((configuration) => {
          const id = getId(configuration);

          const number =
            configuration?.configurationNumber ||
            configuration?.configurationId;

          const systemSize =
            configuration?.systemSize ||
            configuration?.capacity;

          const customerName =
            getName(
              configuration?.customer
            ) ||
            getName(
              configuration?.customerId
            );

          const details = [
            number,
            systemSize
              ? `${systemSize} kW`
              : "",
            customerName,
          ].filter(Boolean);

          return {
            value: id,
            label:
              details.join(" • ") ||
              `Configuration ${id}`,
          };
        })
        .filter((item) => item.value),
    ],
    [systemConfigurations]
  );

  const discountTypeOptions = [
    {
      value: "AMOUNT",
      label: "Fixed Amount",
    },
    {
      value: "PERCENTAGE",
      label: "Percentage",
    },
  ];

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    setSubmitError("");
  };

  const handleItemsChange = (items) => {
    const nextItems = Array.isArray(items)
      ? items
      : [];

    const subtotal = nextItems.reduce(
      (total, item) => {
        const quantity =
          Number(item?.quantity) || 0;

        const unitPrice =
          Number(
            item?.unitPrice ??
              item?.price ??
              0
          ) || 0;

        const itemDiscount =
          Number(
            item?.discountAmount ?? 0
          ) || 0;

        return (
          total +
          Math.max(
            quantity * unitPrice -
              itemDiscount,
            0
          )
        );
      },
      0
    );

    setFormData((previous) => ({
      ...previous,
      items: nextItems,
      subtotal,
    }));

    setErrors((previous) => ({
      ...previous,
      items: "",
    }));
  };

  const calculateTotals = () => {
    const subtotal =
      Number(formData.subtotal) || 0;

    const rawDiscount =
      Number(formData.discount) || 0;

    const discount =
      formData.discountType ===
      "PERCENTAGE"
        ? Math.min(
            subtotal,
            (subtotal * rawDiscount) /
              100
          )
        : Math.min(
            subtotal,
            Math.max(rawDiscount, 0)
          );

    const taxableAmount = Math.max(
      subtotal - discount,
      0
    );

    const taxPercentage =
      Number(formData.taxPercentage) || 0;

    const tax =
      (taxableAmount * taxPercentage) /
      100;

    const grandTotal =
      taxableAmount + tax;

    return {
      subtotal,
      discount,
      taxableAmount,
      tax,
      grandTotal,
    };
  };

  const totals = calculateTotals();

  const formatCurrency = (value) => {
    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }
    ).format(Number(value) || 0);
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.customerId) {
      nextErrors.customerId =
        "Customer is required.";
    }

    if (
      !formData.systemConfigurationId
    ) {
      nextErrors.systemConfigurationId =
        "System configuration is required.";
    }

    if (!formData.quotationDate) {
      nextErrors.quotationDate =
        "Quotation date is required.";
    }

    if (!formData.validUntil) {
      nextErrors.validUntil =
        "Valid until date is required.";
    }

    if (
      formData.quotationDate &&
      formData.validUntil &&
      formData.validUntil <
        formData.quotationDate
    ) {
      nextErrors.validUntil =
        "Valid until date cannot be before the quotation date.";
    }

    if (
      !Array.isArray(formData.items) ||
      formData.items.length === 0
    ) {
      nextErrors.items =
        "Add at least one quotation item.";
    }

    if (
      Number(formData.taxPercentage) < 0 ||
      Number(formData.taxPercentage) > 100
    ) {
      nextErrors.taxPercentage =
        "Tax percentage must be between 0 and 100.";
    }

    if (
      Number(formData.discount) < 0
    ) {
      nextErrors.discount =
        "Discount cannot be negative.";
    }

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSubmitError("");

    const validationErrors =
      validateForm();

    if (
      Object.keys(validationErrors)
        .length > 0
    ) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});

    const payload = {
      ...formData,
      subtotal: totals.subtotal,
      discount: totals.discount,
      taxAmount: totals.tax,
      grandTotal: totals.grandTotal,
      taxPercentage:
        Number(
          formData.taxPercentage
        ) || 0,
      discountValue:
        Number(formData.discount) || 0,
    };

    try {
      if (typeof onSubmit === "function") {
        await onSubmit(payload);
      }
    } catch (error) {
      console.error(
        "Quotation submission error:",
        error
      );

      setSubmitError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to save the quotation. Please try again."
      );
    }
  };

  if (loading) {
    return (
      <div className="quotation-form-loading">
        <div className="quotation-form-spinner" />

        <p>
          Loading quotation information...
        </p>
      </div>
    );
  }

  return (
    <form
      className="quotation-form"
      onSubmit={handleSubmit}
      noValidate
    >
      {submitError && (
        <div className="quotation-form-alert quotation-form-alert-error">
          <strong>
            Unable to save quotation
          </strong>

          <span>{submitError}</span>
        </div>
      )}

      <section className="quotation-form-section">
        <div className="quotation-form-section-header">
          <div>
            <h2>Quotation Information</h2>

            <p>
              Select the customer and system
              configuration for this quotation.
            </p>
          </div>
        </div>

        <div className="quotation-form-grid">
          <div className="quotation-form-field">
            <Select
              label="Customer"
              name="customerId"
              value={
                formData.customerId
              }
              onChange={handleChange}
              options={customerOptions}
              placeholder="Select customer"
              required
              disabled={submitting}
              error={
                errors.customerId
              }
            />
          </div>

          <div className="quotation-form-field">
            <Select
              label="System Configuration"
              name="systemConfigurationId"
              value={
                formData.systemConfigurationId
              }
              onChange={handleChange}
              options={
                configurationOptions
              }
              placeholder="Select system configuration"
              required
              disabled={submitting}
              error={
                errors.systemConfigurationId
              }
            />
          </div>

          <div className="quotation-form-field">
            <Input
              label="Quotation Date"
              name="quotationDate"
              type="date"
              value={
                formData.quotationDate
              }
              onChange={handleChange}
              required
              disabled={submitting}
              error={
                errors.quotationDate
              }
            />
          </div>

          <div className="quotation-form-field">
            <Input
              label="Valid Until"
              name="validUntil"
              type="date"
              value={
                formData.validUntil
              }
              onChange={handleChange}
              required
              disabled={submitting}
              error={
                errors.validUntil
              }
            />
          </div>
        </div>
      </section>

      <section className="quotation-form-section">
        <div className="quotation-form-section-header">
          <div>
            <h2>Quotation Items</h2>

            <p>
              Add products and services included
              in the quotation.
            </p>
          </div>
        </div>

        <QuotationItems
          items={formData.items}
          products={products}
          onChange={handleItemsChange}
          disabled={submitting}
          error={errors.items}
        />
      </section>

      <section className="quotation-form-section">
        <div className="quotation-form-section-header">
          <div>
            <h2>Pricing & Tax</h2>

            <p>
              Review the quotation subtotal,
              discount, and applicable tax.
            </p>
          </div>
        </div>

        <div className="quotation-form-grid">
          <div className="quotation-form-field">
            <Input
              label="Discount"
              name="discount"
              type="number"
              value={formData.discount}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="Enter discount"
              disabled={submitting}
              error={errors.discount}
            />
          </div>

          <div className="quotation-form-field">
            <Select
              label="Discount Type"
              name="discountType"
              value={
                formData.discountType
              }
              onChange={handleChange}
              options={
                discountTypeOptions
              }
              disabled={submitting}
            />
          </div>

          <div className="quotation-form-field">
            <Input
              label="Tax Percentage"
              name="taxPercentage"
              type="number"
              value={
                formData.taxPercentage
              }
              onChange={handleChange}
              min="0"
              max="100"
              step="0.01"
              placeholder="Enter tax percentage"
              disabled={submitting}
              error={
                errors.taxPercentage
              }
            />
          </div>
        </div>

        <div className="quotation-form-summary">
          <div className="quotation-form-summary-row">
            <span>Subtotal</span>

            <strong>
              {formatCurrency(
                totals.subtotal
              )}
            </strong>
          </div>

          <div className="quotation-form-summary-row">
            <span>Discount</span>

            <strong>
              -{" "}
              {formatCurrency(
                totals.discount
              )}
            </strong>
          </div>

          <div className="quotation-form-summary-row">
            <span>Taxable Amount</span>

            <strong>
              {formatCurrency(
                totals.taxableAmount
              )}
            </strong>
          </div>

          <div className="quotation-form-summary-row">
            <span>
              Tax (
              {Number(
                formData.taxPercentage
              ) || 0}
              %)
            </span>

            <strong>
              {formatCurrency(
                totals.tax
              )}
            </strong>
          </div>

          <div className="quotation-form-summary-total">
            <span>Grand Total</span>

            <strong>
              {formatCurrency(
                totals.grandTotal
              )}
            </strong>
          </div>
        </div>
      </section>

      <section className="quotation-form-section">
        <div className="quotation-form-section-header">
          <div>
            <h2>Notes & Terms</h2>

            <p>
              Add notes and quotation terms for the
              customer.
            </p>
          </div>
        </div>

        <div className="quotation-form-notes">
          <Textarea
            label="Notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Enter quotation notes"
            rows={4}
            disabled={submitting}
            error={errors.notes}
          />

          <Textarea
            label="Terms and Conditions"
            name="termsAndConditions"
            value={
              formData.termsAndConditions
            }
            onChange={handleChange}
            placeholder="Enter quotation terms and conditions"
            rows={6}
            disabled={submitting}
            error={
              errors.termsAndConditions
            }
          />
        </div>
      </section>

      <div className="quotation-form-actions">
        {typeof onCancel ===
          "function" && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </Button>
        )}

        <Button
          type="submit"
          variant="primary"
          disabled={submitting}
        >
          {submitting
            ? isEditMode
              ? "Updating..."
              : "Creating..."
            : isEditMode
            ? "Update Quotation"
            : "Create Quotation"}
        </Button>
      </div>
    </form>
  );
};

export default QuotationForm;