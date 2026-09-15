"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

import AdminLayout from "../../layout";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import Textarea from "@/components/common/Textarea";

import { customerService } from "@/services/customer.service";

import "./create-customer.css";

const CreateCustomerPage = () => {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    companyName: "",
    phone: "",
    alternatePhone: "",
    email: "",
    address: "",
    city: "",
    state: "Uttar Pradesh",
    pincode: "",
    customerType: "INDIVIDUAL",
    source: "LEAD",
    notes: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (error) {
      setError("");
    }

    if (success) {
      setSuccess("");
    }
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      return "Customer name required hai.";
    }

    if (!form.phone.trim()) {
      return "Phone number required hai.";
    }

    const phone = form.phone.replace(/\D/g, "");

    if (phone.length < 10) {
      return "Valid 10 digit phone number enter karein.";
    }

    if (form.email.trim()) {
      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(form.email.trim())) {
        return "Valid email address enter karein.";
      }
    }

    if (form.pincode.trim()) {
      const pincode =
        form.pincode.replace(/\D/g, "");

      if (pincode.length !== 6) {
        return "Valid 6 digit pincode enter karein.";
      }
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        name: form.name.trim(),
        companyName:
          form.companyName.trim() || undefined,
        phone: form.phone.trim(),
        alternatePhone:
          form.alternatePhone.trim() || undefined,
        email:
          form.email.trim() || undefined,
        address:
          form.address.trim() || undefined,
        city:
          form.city.trim() || undefined,
        state:
          form.state.trim() || undefined,
        pincode:
          form.pincode.trim() || undefined,
        customerType:
          form.customerType,
        source:
          form.source,
        notes:
          form.notes.trim() || undefined,
      };

      await customerService.createCustomer(
        payload
      );

      setSuccess(
        "Customer successfully create ho gaya."
      );

      setTimeout(() => {
        router.push("/admin/customers");
      }, 700);
    } catch (err) {
      console.error(
        "Failed to create customer:",
        err
      );

      setError(
        err?.message ||
          "Customer create nahi ho paaya."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="admin-create-customer-page">
        {/* Header */}
        <div className="admin-create-customer-header">
          <div>
            <button
              type="button"
              className="admin-create-customer-back"
              onClick={() =>
                router.push(
                  "/admin/customers"
                )
              }
            >
              ← Back to Customers
            </button>

            <div className="admin-create-customer-title">
              <div className="admin-create-customer-title-icon">
                👤
              </div>

              <div>
                <h1>
                  Add Customer
                </h1>

                <p>
                  New customer ki basic aur contact
                  information add karein.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="admin-create-customer-alert error">
            <div className="admin-create-customer-alert-icon">
              !
            </div>

            <div>
              <strong>
                Customer create nahi hua
              </strong>

              <p>{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="admin-create-customer-alert success">
            <div className="admin-create-customer-alert-icon">
              ✓
            </div>

            <div>
              <strong>
                Customer Created
              </strong>

              <p>{success}</p>
            </div>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="admin-create-customer-form"
        >
          {/* Personal Information */}
          <section className="admin-create-customer-card">
            <div className="admin-create-customer-card-header">
              <div className="admin-create-customer-section-number">
                01
              </div>

              <div>
                <h2>
                  Customer Information
                </h2>

                <p>
                  Customer ki primary identification
                  details.
                </p>
              </div>
            </div>

            <div className="admin-create-customer-grid">
              <Input
                label="Customer Name"
                value={form.name}
                onChange={(event) =>
                  updateField(
                    "name",
                    event.target.value
                  )
                }
                placeholder="Enter customer name"
                required
              />

              <Input
                label="Company Name"
                value={
                  form.companyName
                }
                onChange={(event) =>
                  updateField(
                    "companyName",
                    event.target.value
                  )
                }
                placeholder="Company / business name"
              />

              <Select
                label="Customer Type"
                value={
                  form.customerType
                }
                onChange={(event) =>
                  updateField(
                    "customerType",
                    event.target.value
                  )
                }
                options={[
                  {
                    value:
                      "INDIVIDUAL",
                    label:
                      "Individual",
                  },
                  {
                    value:
                      "BUSINESS",
                    label:
                      "Business",
                  },
                ]}
                required
              />

              <Select
                label="Customer Source"
                value={
                  form.source
                }
                onChange={(event) =>
                  updateField(
                    "source",
                    event.target.value
                  )
                }
                options={[
                  {
                    value: "LEAD",
                    label:
                      "Converted Lead",
                  },
                  {
                    value:
                      "DIRECT",
                    label:
                      "Direct Customer",
                  },
                  {
                    value:
                      "REFERENCE",
                    label:
                      "Reference",
                  },
                  {
                    value:
                      "OTHER",
                    label:
                      "Other",
                  },
                ]}
              />
            </div>
          </section>

          {/* Contact */}
          <section className="admin-create-customer-card">
            <div className="admin-create-customer-card-header">
              <div className="admin-create-customer-section-number">
                02
              </div>

              <div>
                <h2>
                  Contact Information
                </h2>

                <p>
                  Customer ke phone aur email details.
                </p>
              </div>
            </div>

            <div className="admin-create-customer-grid">
              <Input
                label="Mobile Number"
                type="tel"
                value={
                  form.phone
                }
                onChange={(event) =>
                  updateField(
                    "phone",
                    event.target.value
                  )
                }
                placeholder="10 digit mobile number"
                required
              />

              <Input
                label="Alternate Mobile"
                type="tel"
                value={
                  form.alternatePhone
                }
                onChange={(event) =>
                  updateField(
                    "alternatePhone",
                    event.target.value
                  )
                }
                placeholder="Optional alternate number"
              />

              <Input
                label="Email Address"
                type="email"
                value={
                  form.email
                }
                onChange={(event) =>
                  updateField(
                    "email",
                    event.target.value
                  )
                }
                placeholder="customer@example.com"
              />
            </div>
          </section>

          {/* Address */}
          <section className="admin-create-customer-card">
            <div className="admin-create-customer-card-header">
              <div className="admin-create-customer-section-number">
                03
              </div>

              <div>
                <h2>
                  Address Details
                </h2>

                <p>
                  Customer installation / contact
                  location.
                </p>
              </div>
            </div>

            <div className="admin-create-customer-grid">
              <div className="admin-create-customer-full-field">
                <Textarea
                  label="Address"
                  value={
                    form.address
                  }
                  onChange={(event) =>
                    updateField(
                      "address",
                      event.target.value
                    )
                  }
                  placeholder="House / plot / street / locality"
                  rows={3}
                />
              </div>

              <Input
                label="City"
                value={
                  form.city
                }
                onChange={(event) =>
                  updateField(
                    "city",
                    event.target.value
                  )
                }
                placeholder="e.g. Kanpur"
              />

              <Input
                label="State"
                value={
                  form.state
                }
                onChange={(event) =>
                  updateField(
                    "state",
                    event.target.value
                  )
                }
                placeholder="e.g. Uttar Pradesh"
              />

              <Input
                label="Pincode"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={
                  form.pincode
                }
                onChange={(event) =>
                  updateField(
                    "pincode",
                    event.target.value
                      .replace(
                        /\D/g,
                        ""
                      )
                      .slice(
                        0,
                        6
                      )
                  )
                }
                placeholder="6 digit pincode"
              />
            </div>
          </section>

          {/* Notes */}
          <section className="admin-create-customer-card">
            <div className="admin-create-customer-card-header">
              <div className="admin-create-customer-section-number">
                04
              </div>

              <div>
                <h2>
                  Additional Information
                </h2>

                <p>
                  Customer se related additional notes.
                </p>
              </div>
            </div>

            <Textarea
              label="Notes"
              value={
                form.notes
              }
              onChange={(event) =>
                updateField(
                  "notes",
                  event.target.value
                )
              }
              placeholder="Add any additional customer information..."
              rows={5}
            />
          </section>

          {/* Actions */}
          <div className="admin-create-customer-actions">
            <div>
              <span>
                Customer information verify karke save
                karein.
              </span>
            </div>

            <div className="admin-create-customer-action-buttons">
              <Button
                type="button"
                variant="secondary"
                disabled={saving}
                onClick={() =>
                  router.push(
                    "/admin/customers"
                  )
                }
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="primary"
                disabled={saving}
              >
                {saving
                  ? "Creating..."
                  : "Create Customer"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default CreateCustomerPage;