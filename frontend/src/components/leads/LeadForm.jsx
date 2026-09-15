"use client";

import React, { useEffect, useMemo, useState } from "react";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import Textarea from "@/components/common/Textarea";
import Loader from "@/components/common/Loader";
import {
  LEAD_STATUS,
  LEAD_STATUS_LABELS,
  LEAD_PRIORITY,
  LEAD_PRIORITY_LABELS,
  LEAD_SOURCES,
} from "@/utils/constants";
import { validateLead, hasValidationErrors } from "@/utils/validators";

const LeadForm = ({
  initialData = {},
  loading = false,
  submitting = false,
  mode = "create",
  employees = [],
  onSubmit,
  onCancel,
}) => {
  const isEditMode = mode === "edit";

  const defaultForm = useMemo(
    () => ({
      name: "",
      companyName: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      source: "",
      requirement: "",
      status: LEAD_STATUS.NEW,
      priority: LEAD_PRIORITY.MEDIUM,
      followUpDate: "",
      assignedTo: "",
      notes: "",
    }),
    []
  );

  const [formData, setFormData] = useState(defaultForm);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!initialData || Object.keys(initialData).length === 0) {
      setFormData(defaultForm);
      return;
    }

    setFormData({
      ...defaultForm,
      ...initialData,
      name:
        initialData.name ||
        initialData.customerName ||
        "",
      phone:
        initialData.phone ||
        initialData.mobile ||
        initialData.mobileNumber ||
        "",
      email: initialData.email || "",
      address:
        typeof initialData.address === "string"
          ? initialData.address
          : initialData.address?.address ||
            "",
      city:
        initialData.city ||
        initialData.address?.city ||
        "",
      state:
        initialData.state ||
        initialData.address?.state ||
        "",
      pincode:
        initialData.pincode ||
        initialData.address?.pincode ||
        "",
      source:
        initialData.source ||
        initialData.leadSource ||
        "",
      requirement:
        initialData.requirement ||
        initialData.solarRequirement ||
        initialData.kw ||
        "",
      status:
        initialData.status ||
        initialData.leadStatus ||
        LEAD_STATUS.NEW,
      priority:
        initialData.priority ||
        LEAD_PRIORITY.MEDIUM,
      followUpDate:
        initialData.followUpDate ||
        initialData.nextFollowUpDate ||
        "",
      assignedTo:
        typeof initialData.assignedTo === "object"
          ? initialData.assignedTo?._id ||
            initialData.assignedTo?.id ||
            ""
          : initialData.assignedTo || "",
      notes: initialData.notes || "",
    });
  }, [initialData, defaultForm]);

  const statusOptions = useMemo(
    () =>
      Object.entries(LEAD_STATUS_LABELS || {}).map(
        ([value, label]) => ({
          value,
          label,
        })
      ),
    []
  );

  const priorityOptions = useMemo(
    () =>
      Object.entries(LEAD_PRIORITY_LABELS || {}).map(
        ([value, label]) => ({
          value,
          label,
        })
      ),
    []
  );

  const sourceOptions = useMemo(() => {
    if (Array.isArray(LEAD_SOURCES)) {
      return LEAD_SOURCES.map((source) => ({
        value:
          typeof source === "string"
            ? source
            : source.value,
        label:
          typeof source === "string"
            ? source
            : source.label,
      }));
    }

    if (
      LEAD_SOURCES &&
      typeof LEAD_SOURCES === "object"
    ) {
      return Object.entries(LEAD_SOURCES).map(
        ([value, label]) => ({
          value,
          label,
        })
      );
    }

    return [];
  }, []);

  const employeeOptions = useMemo(() => {
    return [
      {
        value: "",
        label: "Unassigned",
      },
      ...(Array.isArray(employees)
        ? employees
            .filter(Boolean)
            .map((employee) => {
              const name =
                employee.name ||
                employee.fullName ||
                `${employee.firstName || ""} ${
                  employee.lastName || ""
                }`.trim() ||
                employee.email ||
                "Employee";

              return {
                value:
                  employee._id ||
                  employee.id ||
                  "",
                label: name,
              };
            })
            .filter((option) => option.value)
        : []),
    ];
  }, [employees]);

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((previous) => ({
        ...previous,
        [name]: "",
      }));
    }

    if (submitError) {
      setSubmitError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSubmitError("");

    const validationResult = validateLead(
      formData
    );

    const validationErrors =
      validationResult?.errors ||
      validationResult ||
      {};

    if (hasValidationErrors(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});

    if (typeof onSubmit !== "function") {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error(
        "Lead form submission error:",
        error
      );

      setSubmitError(
        error?.message ||
          error?.response?.data?.message ||
          "Unable to save the lead. Please try again."
      );
    }
  };

  if (loading) {
    return (
      <div className="lead-form-loading">
        <Loader />
        <p>Loading lead information...</p>
      </div>
    );
  }

  return (
    <form
      className="lead-form"
      onSubmit={handleSubmit}
      noValidate
    >
      {submitError && (
        <div className="lead-form-alert lead-form-alert-error">
          <strong>Unable to save lead</strong>
          <span>{submitError}</span>
        </div>
      )}

      {/* Customer Information */}
      <section className="lead-form-section">
        <div className="lead-form-section-header">
          <div>
            <h2>Customer Information</h2>
            <p>
              Enter the primary contact details for
              this lead.
            </p>
          </div>
        </div>

        <div className="lead-form-grid">
          <div className="lead-form-field">
            <Input
              label="Customer Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter customer name"
              required
              error={errors.name}
              disabled={submitting}
            />
          </div>

          <div className="lead-form-field">
            <Input
              label="Company Name"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="Enter company name"
              error={errors.companyName}
              disabled={submitting}
            />
          </div>

          <div className="lead-form-field">
            <Input
              label="Phone Number"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter 10-digit mobile number"
              required
              error={errors.phone}
              disabled={submitting}
            />
          </div>

          <div className="lead-form-field">
            <Input
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email address"
              error={errors.email}
              disabled={submitting}
            />
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="lead-form-section">
        <div className="lead-form-section-header">
          <div>
            <h2>Location Details</h2>
            <p>
              Provide the customer's installation
              location.
            </p>
          </div>
        </div>

        <div className="lead-form-grid">
          <div className="lead-form-field lead-form-field-full">
            <Textarea
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter complete address"
              rows={3}
              error={errors.address}
              disabled={submitting}
            />
          </div>

          <div className="lead-form-field">
            <Input
              label="City"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Enter city"
              error={errors.city}
              disabled={submitting}
            />
          </div>

          <div className="lead-form-field">
            <Input
              label="State"
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="Enter state"
              error={errors.state}
              disabled={submitting}
            />
          </div>

          <div className="lead-form-field">
            <Input
              label="Pincode"
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              placeholder="Enter 6-digit pincode"
              maxLength={6}
              error={errors.pincode}
              disabled={submitting}
            />
          </div>
        </div>
      </section>

      {/* Lead Information */}
      <section className="lead-form-section">
        <div className="lead-form-section-header">
          <div>
            <h2>Lead Information</h2>
            <p>
              Define the source, solar requirement,
              status, and priority.
            </p>
          </div>
        </div>

        <div className="lead-form-grid">
          <div className="lead-form-field">
            <Select
              label="Lead Source"
              name="source"
              value={formData.source}
              onChange={handleChange}
              options={sourceOptions}
              placeholder="Select lead source"
              error={errors.source}
              disabled={submitting}
            />
          </div>

          <div className="lead-form-field">
            <Input
              label="Solar Requirement"
              name="requirement"
              type="number"
              value={formData.requirement}
              onChange={handleChange}
              placeholder="Enter required capacity in kW"
              min="0"
              step="0.01"
              required
              error={errors.requirement}
              disabled={submitting}
            />
          </div>

          <div className="lead-form-field">
            <Select
              label="Lead Status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              options={statusOptions}
              placeholder="Select lead status"
              error={errors.status}
              disabled={submitting}
            />
          </div>

          <div className="lead-form-field">
            <Select
              label="Priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              options={priorityOptions}
              placeholder="Select priority"
              error={errors.priority}
              disabled={submitting}
            />
          </div>

          <div className="lead-form-field">
            <Input
              label="Follow-Up Date"
              name="followUpDate"
              type="date"
              value={formData.followUpDate}
              onChange={handleChange}
              error={errors.followUpDate}
              disabled={submitting}
            />
          </div>

          {employeeOptions.length > 1 && (
            <div className="lead-form-field">
              <Select
                label="Assign To"
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleChange}
                options={employeeOptions}
                placeholder="Select employee"
                error={errors.assignedTo}
                disabled={submitting}
              />
            </div>
          )}
        </div>
      </section>

      {/* Notes */}
      <section className="lead-form-section">
        <div className="lead-form-section-header">
          <div>
            <h2>Additional Notes</h2>
            <p>
              Add any useful information about this
              lead.
            </p>
          </div>
        </div>

        <div className="lead-form-grid">
          <div className="lead-form-field lead-form-field-full">
            <Textarea
              label="Notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Enter additional notes"
              rows={5}
              error={errors.notes}
              disabled={submitting}
            />
          </div>
        </div>
      </section>

      {/* Actions */}
      <div className="lead-form-actions">
        {typeof onCancel === "function" && (
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
            ? "Update Lead"
            : "Create Lead"}
        </Button>
      </div>
    </form>
  );
};

export default LeadForm;