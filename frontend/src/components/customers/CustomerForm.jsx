"use client";

import React, { useEffect, useState } from "react";
import Input from "../common/Input";
import Select from "../common/Select";
import Button from "../common/Button";

const INITIAL_FORM = {
  name: "",
  mobile: "",
  email: "",
  alternateMobile: "",
  address: "",
  city: "",
  state: "Uttar Pradesh",
  pincode: "",
  customerType: "RESIDENTIAL",
  systemSize: "",
  notes: "",
};

const CUSTOMER_TYPES = [
  { value: "RESIDENTIAL", label: "Residential" },
  { value: "COMMERCIAL", label: "Commercial" },
  { value: "INDUSTRIAL", label: "Industrial" },
];

const getCustomerValue = (customer, key) => {
  if (!customer) return "";

  const directValue = customer[key];

  if (directValue !== undefined && directValue !== null) {
    return directValue;
  }

  if (key === "mobile") {
    return customer.mobileNumber || customer.phone || customer.phoneNumber || "";
  }

  if (key === "name") {
    return customer.customerName || customer.fullName || "";
  }

  if (key === "address") {
    if (typeof customer.address === "string") {
      return customer.address;
    }

    return customer.address?.street || customer.address?.line1 || "";
  }

  if (key === "city") {
    return customer.address?.city || "";
  }

  if (key === "state") {
    return customer.address?.state || "";
  }

  if (key === "pincode") {
    return customer.address?.pincode || customer.address?.postalCode || "";
  }

  return "";
};

const buildInitialForm = (customer) => {
  if (!customer) {
    return INITIAL_FORM;
  }

  return {
    name: getCustomerValue(customer, "name"),
    mobile: getCustomerValue(customer, "mobile"),
    email: getCustomerValue(customer, "email"),
    alternateMobile: getCustomerValue(customer, "alternateMobile"),
    address: getCustomerValue(customer, "address"),
    city: getCustomerValue(customer, "city"),
    state: getCustomerValue(customer, "state") || "Uttar Pradesh",
    pincode: getCustomerValue(customer, "pincode"),
    customerType:
      getCustomerValue(customer, "customerType") || "RESIDENTIAL",
    systemSize: getCustomerValue(customer, "systemSize"),
    notes: getCustomerValue(customer, "notes"),
  };
};

export default function CustomerForm({
  customer = null,
  onSubmit,
  onCancel,
  loading = false,
  submitLabel,
  error = "",
}) {
  const [form, setForm] = useState(() =>
    buildInitialForm(customer)
  );

  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm(buildInitialForm(customer));
    setErrors({});
  }, [customer]);

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

  const validate = () => {
    const nextErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = "Customer name is required.";
    }

    if (!form.mobile.trim()) {
      nextErrors.mobile = "Mobile number is required.";
    } else if (!/^[6-9]\d{9}$/.test(form.mobile.trim())) {
      nextErrors.mobile = "Enter a valid 10-digit mobile number.";
    }

    if (
      form.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    ) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (form.pincode.trim() && !/^\d{6}$/.test(form.pincode.trim())) {
      nextErrors.pincode = "Pincode must contain 6 digits.";
    }

    if (
      form.systemSize !== "" &&
      (Number.isNaN(Number(form.systemSize)) ||
        Number(form.systemSize) < 0)
    ) {
      nextErrors.systemSize = "Enter a valid system size.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) return;

    const payload = {
      ...form,
      name: form.name.trim(),
      mobile: form.mobile.trim(),
      email: form.email.trim(),
      alternateMobile: form.alternateMobile.trim(),
      address: form.address.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      pincode: form.pincode.trim(),
      notes: form.notes.trim(),
      systemSize:
        form.systemSize === ""
          ? undefined
          : Number(form.systemSize),
    };

    if (typeof onSubmit === "function") {
      await onSubmit(payload);
    }
  };

  return (
    <form className="customer-form" onSubmit={handleSubmit}>
      {error && (
        <div className="customer-form-error">
          {error}
        </div>
      )}

      <div className="customer-form-section">
        <div className="customer-form-section-heading">
          <div>
            <h3>Basic Information</h3>
            <p>Enter the customer's primary contact information.</p>
          </div>
        </div>

        <div className="customer-form-grid">
          <div className="customer-form-field">
            <Input
              label="Customer Name"
              name="name"
              value={form.name}
              onChange={(event) =>
                updateField("name", event.target.value)
              }
              placeholder="Enter customer name"
              required
              error={errors.name}
              disabled={loading}
            />
          </div>

          <div className="customer-form-field">
            <Input
              label="Mobile Number"
              name="mobile"
              value={form.mobile}
              onChange={(event) =>
                updateField(
                  "mobile",
                  event.target.value.replace(/\D/g, "").slice(0, 10)
                )
              }
              placeholder="Enter 10-digit mobile number"
              required
              error={errors.mobile}
              disabled={loading}
            />
          </div>

          <div className="customer-form-field">
            <Input
              label="Email Address"
              name="email"
              type="email"
              value={form.email}
              onChange={(event) =>
                updateField("email", event.target.value)
              }
              placeholder="Enter email address"
              error={errors.email}
              disabled={loading}
            />
          </div>

          <div className="customer-form-field">
            <Input
              label="Alternate Mobile"
              name="alternateMobile"
              value={form.alternateMobile}
              onChange={(event) =>
                updateField(
                  "alternateMobile",
                  event.target.value.replace(/\D/g, "").slice(0, 10)
                )
              }
              placeholder="Enter alternate mobile number"
              disabled={loading}
            />
          </div>

          <div className="customer-form-field">
            <Select
              label="Customer Type"
              name="customerType"
              value={form.customerType}
              onChange={(event) =>
                updateField("customerType", event.target.value)
              }
              options={CUSTOMER_TYPES}
              disabled={loading}
            />
          </div>

          <div className="customer-form-field">
            <Input
              label="System Size"
              name="systemSize"
              type="number"
              min="0"
              step="0.01"
              value={form.systemSize}
              onChange={(event) =>
                updateField("systemSize", event.target.value)
              }
              placeholder="Enter system size in kW"
              error={errors.systemSize}
              disabled={loading}
            />
          </div>
        </div>
      </div>

      <div className="customer-form-section">
        <div className="customer-form-section-heading">
          <div>
            <h3>Address Information</h3>
            <p>Provide the customer's installation or contact address.</p>
          </div>
        </div>

        <div className="customer-form-grid">
          <div className="customer-form-field customer-form-full">
            <Input
              label="Address"
              name="address"
              value={form.address}
              onChange={(event) =>
                updateField("address", event.target.value)
              }
              placeholder="Enter complete address"
              disabled={loading}
            />
          </div>

          <div className="customer-form-field">
            <Input
              label="City"
              name="city"
              value={form.city}
              onChange={(event) =>
                updateField("city", event.target.value)
              }
              placeholder="Enter city"
              disabled={loading}
            />
          </div>

          <div className="customer-form-field">
            <Input
              label="State"
              name="state"
              value={form.state}
              onChange={(event) =>
                updateField("state", event.target.value)
              }
              placeholder="Enter state"
              disabled={loading}
            />
          </div>

          <div className="customer-form-field">
            <Input
              label="Pincode"
              name="pincode"
              value={form.pincode}
              onChange={(event) =>
                updateField(
                  "pincode",
                  event.target.value.replace(/\D/g, "").slice(0, 6)
                )
              }
              placeholder="Enter 6-digit pincode"
              error={errors.pincode}
              disabled={loading}
            />
          </div>
        </div>
      </div>

      <div className="customer-form-section">
        <div className="customer-form-section-heading">
          <div>
            <h3>Additional Information</h3>
            <p>Add any useful notes about the customer.</p>
          </div>
        </div>

        <div className="customer-form-field">
          <label htmlFor="customer-notes">
            Notes
          </label>

          <textarea
            id="customer-notes"
            name="notes"
            value={form.notes}
            onChange={(event) =>
              updateField("notes", event.target.value)
            }
            placeholder="Enter additional notes"
            rows={4}
            disabled={loading}
          />
        </div>
      </div>

      <div className="customer-form-actions">
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
          {submitLabel || (customer ? "Update Customer" : "Create Customer")}
        </Button>
      </div>
    </form>
  );
}