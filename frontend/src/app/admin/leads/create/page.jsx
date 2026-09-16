"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import Textarea from "@/components/common/Textarea";
import { useAuth } from "@/hooks/useAuth";
import leadService from "@/services/lead.service";
import "./create-lead.css";

const CreateAdminLeadPage = () => {
  const router = useRouter();
  const { user, logout, loading: authLoading } = useAuth();

  const [form, setForm] = useState({
    customerName: "",
    companyName: "",
    mobile: "",
    alternateMobile: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    leadSource: "WEBSITE",
    requirement: "",
    status: "NEW",
    priority: "MEDIUM",
    followUpDate: "",
    notes: "",
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleLogout = async () => {
    await logout();
  };

  const handleSearch = (value) => {
    console.log("Admin create lead search:", value);
  };

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [field]: "",
    }));

    setError("");
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!form.customerName.trim()) {
      nextErrors.customerName = "Customer name is required.";
    }

    if (!form.mobile.trim()) {
      nextErrors.mobile = "Mobile number is required.";
    } else if (
      !/^[0-9+\-\s()]{10,15}$/.test(form.mobile.trim())
    ) {
      nextErrors.mobile = "Enter a valid mobile number.";
    }

    if (
      form.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        form.email.trim()
      )
    ) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!form.requirement.trim()) {
      nextErrors.requirement =
        "Solar requirement is required.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      await leadService.createLead({
        customerName: form.customerName.trim(),
        companyName: form.companyName.trim() || undefined,
        mobile: form.mobile.trim(),
        alternateMobile:
          form.alternateMobile.trim() || undefined,
        email: form.email.trim().toLowerCase() || undefined,
        address: form.address.trim() || undefined,
        city: form.city.trim() || undefined,
        state: form.state.trim() || undefined,
        pincode: form.pincode.trim() || undefined,
        leadSource: form.leadSource,
        requirement: form.requirement.trim(),
        status: form.status,
        priority: form.priority,
        followUpDate: form.followUpDate || undefined,
        notes: form.notes.trim() || undefined,
      });

      router.push("/admin/leads");
    } catch (err) {
      console.error("Create admin lead error:", err);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Unable to create lead. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (!saving) {
      router.push("/admin/leads");
    }
  };

  if (authLoading) {
    return (
      <MainLayout
        user={user}
        onLogout={handleLogout}
        onSearch={handleSearch}
        notificationCount={0}
      >
        <div className="admin-create-lead-loading">
          Loading...
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      user={user}
      onLogout={handleLogout}
      onSearch={handleSearch}
      notificationCount={0}
    >
      <div className="admin-create-lead-page">
        {/* Header */}
        <div className="admin-create-lead-header">
          <div>
            <div className="admin-create-lead-breadcrumb">
              Admin <span>/</span> Leads{" "}
              <span>/</span> Create
            </div>

            <h1>Create New Lead</h1>

            <p>
              Add a new solar enquiry to the lead
              management system.
            </p>
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={handleBack}
            disabled={saving}
          >
            ← Back to Leads
          </Button>
        </div>

        {/* Error */}
        {error && (
          <div className="admin-create-lead-error">
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form
          className="admin-create-lead-form"
          onSubmit={handleSubmit}
        >
          {/* Customer Information */}
          <section className="admin-create-lead-card">
            <div className="admin-create-lead-card-header">
              <div className="admin-create-lead-section-icon">
                👤
              </div>

              <div>
                <h2>Customer Information</h2>

                <p>
                  Basic details of the person or business
                  enquiring about solar.
                </p>
              </div>
            </div>

            <div className="admin-create-lead-grid">
              <Input
                label="Customer Name"
                required
                value={form.customerName}
                onChange={(event) =>
                  updateField(
                    "customerName",
                    event.target.value
                  )
                }
                placeholder="Enter customer name"
                error={errors.customerName}
              />

              <Input
                label="Company Name"
                value={form.companyName}
                onChange={(event) =>
                  updateField(
                    "companyName",
                    event.target.value
                  )
                }
                placeholder="Enter company name (optional)"
              />

              <Input
                label="Mobile Number"
                required
                value={form.mobile}
                onChange={(event) =>
                  updateField(
                    "mobile",
                    event.target.value
                  )
                }
                placeholder="+91 9876543210"
                error={errors.mobile}
              />

              <Input
                label="Alternate Mobile"
                value={form.alternateMobile}
                onChange={(event) =>
                  updateField(
                    "alternateMobile",
                    event.target.value
                  )
                }
                placeholder="Enter alternate mobile number"
              />

              <Input
                label="Email Address"
                type="email"
                value={form.email}
                onChange={(event) =>
                  updateField(
                    "email",
                    event.target.value
                  )
                }
                placeholder="customer@example.com"
                error={errors.email}
              />

              <Input
                label="City"
                value={form.city}
                onChange={(event) =>
                  updateField(
                    "city",
                    event.target.value
                  )
                }
                placeholder="Enter city"
              />

              <Input
                label="State"
                value={form.state}
                onChange={(event) =>
                  updateField(
                    "state",
                    event.target.value
                  )
                }
                placeholder="Enter state"
              />

              <Input
                label="Pincode"
                value={form.pincode}
                onChange={(event) =>
                  updateField(
                    "pincode",
                    event.target.value
                  )
                }
                placeholder="Enter pincode"
              />

              <div className="admin-create-lead-full-field">
                <Input
                  label="Address"
                  value={form.address}
                  onChange={(event) =>
                    updateField(
                      "address",
                      event.target.value
                    )
                  }
                  placeholder="Enter complete address"
                />
              </div>
            </div>
          </section>

          {/* Lead Information */}
          <section className="admin-create-lead-card">
            <div className="admin-create-lead-card-header">
              <div className="admin-create-lead-section-icon">
                ☀️
              </div>

              <div>
                <h2>Lead Information</h2>

                <p>
                  Configure the source, requirement and
                  current lead stage.
                </p>
              </div>
            </div>

            <div className="admin-create-lead-grid">
              <Select
                label="Lead Source"
                value={form.leadSource}
                onChange={(event) =>
                  updateField(
                    "leadSource",
                    event.target.value
                  )
                }
                options={[
                  {
                    label: "Website",
                    value: "WEBSITE",
                  },
                  {
                    label: "WhatsApp",
                    value: "WHATSAPP",
                  },
                  {
                    label: "Call",
                    value: "CALL",
                  },
                  {
                    label: "Referral",
                    value: "REFERRAL",
                  },
                  {
                    label: "Social Media",
                    value: "SOCIAL_MEDIA",
                  },
                  {
                    label: "Walk-in",
                    value: "WALK_IN",
                  },
                  {
                    label: "Other",
                    value: "OTHER",
                  },
                ]}
              />

              <Select
                label="Lead Status"
                value={form.status}
                onChange={(event) =>
                  updateField(
                    "status",
                    event.target.value
                  )
                }
                options={[
                  {
                    label: "New",
                    value: "NEW",
                  },
                  {
                    label: "Assigned",
                    value: "ASSIGNED",
                  },
                  {
                    label: "Contacted",
                    value: "CONTACTED",
                  },
                  {
                    label: "Qualified",
                    value: "QUALIFIED",
                  },
                  {
                    label: "Site Visit",
                    value: "SITE_VISIT",
                  },
                  {
                    label: "Quotation",
                    value: "QUOTATION",
                  },
                  {
                    label: "Won",
                    value: "WON",
                  },
                  {
                    label: "Lost",
                    value: "LOST",
                  },
                ]}
              />

              <Select
                label="Priority"
                value={form.priority}
                onChange={(event) =>
                  updateField(
                    "priority",
                    event.target.value
                  )
                }
                options={[
                  {
                    label: "Low",
                    value: "LOW",
                  },
                  {
                    label: "Medium",
                    value: "MEDIUM",
                  },
                  {
                    label: "High",
                    value: "HIGH",
                  },
                  {
                    label: "Urgent",
                    value: "URGENT",
                  },
                ]}
              />

              <Input
                label="Follow-up Date"
                type="date"
                value={form.followUpDate}
                onChange={(event) =>
                  updateField(
                    "followUpDate",
                    event.target.value
                  )
                }
              />

              <div className="admin-create-lead-full-field">
                <Textarea
                  label="Solar Requirement"
                  required
                  value={form.requirement}
                  onChange={(event) =>
                    updateField(
                      "requirement",
                      event.target.value
                    )
                  }
                  placeholder="Example: 5 kW rooftop solar system for home..."
                  rows={4}
                  error={errors.requirement}
                />
              </div>

              <div className="admin-create-lead-full-field">
                <Textarea
                  label="Notes"
                  value={form.notes}
                  onChange={(event) =>
                    updateField(
                      "notes",
                      event.target.value
                    )
                  }
                  placeholder="Add any additional notes..."
                  rows={4}
                />
              </div>
            </div>
          </section>

          {/* Footer */}
          <div className="admin-create-lead-footer">
            <Button
              type="button"
              variant="secondary"
              onClick={handleBack}
              disabled={saving}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              disabled={saving}
            >
              {saving
                ? "Creating Lead..."
                : "Create Lead"}
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default CreateAdminLeadPage;