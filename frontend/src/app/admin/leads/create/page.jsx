// frontend/src/app/admin/leads/create/page.jsx

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

const CreateAdminLeadPage = () => {
  const router = useRouter();
  const { user, logout, loading: authLoading } = useAuth();

  const [form, setForm] = useState({
    name: "",
    companyName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    source: "WEBSITE",
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

    if (!form.name.trim()) {
      nextErrors.name = "Lead name is required.";
    }

    if (!form.phone.trim()) {
      nextErrors.phone = "Phone number is required.";
    } else if (
      !/^[0-9+\-\s()]{10,15}$/.test(form.phone.trim())
    ) {
      nextErrors.phone = "Enter a valid phone number.";
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
        name: form.name.trim(),
        companyName: form.companyName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        source: form.source,
        requirement: form.requirement.trim(),
        status: form.status,
        priority: form.priority,
        followUpDate: form.followUpDate || null,
        notes: form.notes.trim(),
      });

      router.push("/admin/leads");
    } catch (err) {
      console.error("Create admin lead error:", err);

      setError(
        err?.message ||
          err?.response?.data?.message ||
          "Unable to create lead. Please try again."
      );
    } finally {
      setSaving(false);
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
            onClick={() => router.push("/admin/leads")}
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
                label="Lead Name"
                required
                value={form.name}
                onChange={(event) =>
                  updateField("name", event.target.value)
                }
                placeholder="Enter customer name"
                error={errors.name}
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
                label="Phone Number"
                required
                value={form.phone}
                onChange={(event) =>
                  updateField("phone", event.target.value)
                }
                placeholder="+91 9876543210"
                error={errors.phone}
              />

              <Input
                label="Email Address"
                type="email"
                value={form.email}
                onChange={(event) =>
                  updateField("email", event.target.value)
                }
                placeholder="customer@example.com"
                error={errors.email}
              />

              <Input
                label="City"
                value={form.city}
                onChange={(event) =>
                  updateField("city", event.target.value)
                }
                placeholder="Enter city"
              />

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
                value={form.source}
                onChange={(event) =>
                  updateField(
                    "source",
                    event.target.value
                  )
                }
                options={[
                  {
                    label: "Website",
                    value: "WEBSITE",
                  },
                  {
                    label: "Referral",
                    value: "REFERRAL",
                  },
                  {
                    label: "Facebook",
                    value: "FACEBOOK",
                  },
                  {
                    label: "Instagram",
                    value: "INSTAGRAM",
                  },
                  {
                    label: "Google",
                    value: "GOOGLE",
                  },
                  {
                    label: "Walk-in",
                    value: "WALK_IN",
                  },
                  {
                    label: "Phone",
                    value: "PHONE",
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
                    label: "Contacted",
                    value: "CONTACTED",
                  },
                  {
                    label: "Qualified",
                    value: "QUALIFIED",
                  },
                  {
                    label: "Proposal Sent",
                    value: "PROPOSAL_SENT",
                  },
                  {
                    label: "Negotiation",
                    value: "NEGOTIATION",
                  },
                  {
                    label: "Converted",
                    value: "CONVERTED",
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
                  placeholder="Example: 5 KW rooftop solar system for home..."
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
              onClick={() => router.push("/admin/leads")}
              disabled={saving}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              disabled={saving}
            >
              {saving ? "Creating Lead..." : "Create Lead"}
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default CreateAdminLeadPage;