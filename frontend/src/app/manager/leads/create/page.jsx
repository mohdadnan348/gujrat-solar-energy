"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import Textarea from "@/components/common/Textarea";
import useAuth from "@/hooks/useAuth";
import leadService from "@/services/lead.service";

const CreateManagerLeadPage = () => {
  const router = useRouter();
  const { user, logout, loading: authLoading } = useAuth();

  const [form, setForm] = useState({
    name: "",
    companyName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    source: "",
    requirement: "",
    status: "NEW",
    priority: "MEDIUM",
    followUpDate: "",
    notes: "",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogout = async () => {
    await logout();
  };

  const handleChange = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [field]: "",
    }));

    setErrorMessage("");
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = "Customer name is required.";
    }

    if (!form.phone.trim()) {
      nextErrors.phone = "Mobile number is required.";
    } else if (!/^[0-9+\-\s()]{10,15}$/.test(form.phone.trim())) {
      nextErrors.phone = "Enter a valid mobile number.";
    }

    if (
      form.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    ) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!form.requirement.trim()) {
      nextErrors.requirement = "Solar requirement is required.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) return;

    try {
      setSubmitting(true);
      setErrorMessage("");

      const payload = {
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
      };

      await leadService.createLead(payload);

      router.push("/manager/leads");
    } catch (error) {
      console.error("Create lead error:", error);

      setErrorMessage(
        error?.message ||
          error?.response?.data?.message ||
          "Unable to create lead. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/manager/leads");
  };

  if (authLoading) {
    return (
      <div className="manager-create-lead-loading">
        Loading...
      </div>
    );
  }

  return (
    <MainLayout
      user={user}
      onLogout={handleLogout}
      notificationCount={0}
    >
      <div className="manager-create-lead-page">
        <div className="manager-create-lead-header">
          <div>
            <button
              type="button"
              className="manager-create-lead-back"
              onClick={handleCancel}
            >
              ← Back to Leads
            </button>

            <span className="manager-create-lead-eyebrow">
              Manager Portal
            </span>

            <h1>Create New Lead</h1>

            <p>
              Add a new solar enquiry and assign it for
              follow-up.
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="manager-create-lead-error">
            <span>{errorMessage}</span>

            <button
              type="button"
              onClick={() => setErrorMessage("")}
            >
              ×
            </button>
          </div>
        )}

        <form
          className="manager-create-lead-form"
          onSubmit={handleSubmit}
        >
          <section className="manager-create-lead-card">
            <div className="manager-create-lead-card-header">
              <div>
                <h2>Customer Information</h2>
                <p>
                  Enter the customer's basic contact
                  details.
                </p>
              </div>

              <span className="manager-required-note">
                * Required
              </span>
            </div>

            <div className="manager-create-lead-grid">
              <Input
                label="Customer Name"
                name="name"
                value={form.name}
                onChange={(event) =>
                  handleChange(
                    "name",
                    event.target.value
                  )
                }
                placeholder="Enter customer name"
                required
                error={errors.name}
              />

              <Input
                label="Company Name"
                name="companyName"
                value={form.companyName}
                onChange={(event) =>
                  handleChange(
                    "companyName",
                    event.target.value
                  )
                }
                placeholder="Enter company name"
              />

              <Input
                label="Mobile Number"
                name="phone"
                value={form.phone}
                onChange={(event) =>
                  handleChange(
                    "phone",
                    event.target.value
                  )
                }
                placeholder="Enter mobile number"
                required
                error={errors.phone}
              />

              <Input
                label="Email Address"
                name="email"
                type="email"
                value={form.email}
                onChange={(event) =>
                  handleChange(
                    "email",
                    event.target.value
                  )
                }
                placeholder="Enter email address"
                error={errors.email}
              />

              <Input
                label="City"
                name="city"
                value={form.city}
                onChange={(event) =>
                  handleChange(
                    "city",
                    event.target.value
                  )
                }
                placeholder="Enter city"
              />

              <Select
                label="Lead Source"
                name="source"
                value={form.source}
                onChange={(event) =>
                  handleChange(
                    "source",
                    event.target.value
                  )
                }
                options={[
                  {
                    label: "Select source",
                    value: "",
                  },
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

              <div className="manager-create-lead-full">
                <Textarea
                  label="Address"
                  name="address"
                  value={form.address}
                  onChange={(event) =>
                    handleChange(
                      "address",
                      event.target.value
                    )
                  }
                  placeholder="Enter complete address"
                  rows={3}
                />
              </div>
            </div>
          </section>

          <section className="manager-create-lead-card">
            <div className="manager-create-lead-card-header">
              <div>
                <h2>Lead Details</h2>
                <p>
                  Configure the current lead status
                  and priority.
                </p>
              </div>
            </div>

            <div className="manager-create-lead-grid">
              <Select
                label="Lead Status"
                name="status"
                value={form.status}
                onChange={(event) =>
                  handleChange(
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
                name="priority"
                value={form.priority}
                onChange={(event) =>
                  handleChange(
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
                name="followUpDate"
                type="date"
                value={form.followUpDate}
                onChange={(event) =>
                  handleChange(
                    "followUpDate",
                    event.target.value
                  )
                }
              />

              <div className="manager-create-lead-full">
                <Textarea
                  label="Solar Requirement"
                  name="requirement"
                  value={form.requirement}
                  onChange={(event) =>
                    handleChange(
                      "requirement",
                      event.target.value
                    )
                  }
                  placeholder="Example: 5kW rooftop solar system required"
                  rows={4}
                  required
                  error={errors.requirement}
                />
              </div>

              <div className="manager-create-lead-full">
                <Textarea
                  label="Notes"
                  name="notes"
                  value={form.notes}
                  onChange={(event) =>
                    handleChange(
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

          <div className="manager-create-lead-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancel}
              disabled={submitting}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={submitting}
            >
              {submitting
                ? "Creating..."
                : "Create Lead"}
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default CreateManagerLeadPage;