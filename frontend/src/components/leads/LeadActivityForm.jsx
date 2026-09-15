"use client";

import React, { useEffect, useMemo, useState } from "react";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import Textarea from "@/components/common/Textarea";
import {
  LEAD_ACTIVITY_TYPES,
  LEAD_ACTIVITY_TYPE_LABELS,
} from "@/utils/constants";

const LeadActivityForm = ({
  lead = null,
  initialData = {},
  loading = false,
  submitting = false,
  onSubmit,
  onCancel,
}) => {
  const defaultForm = useMemo(
    () => ({
      type: "",
      subject: "",
      description: "",
      activityDate: "",
      nextFollowUpDate: "",
      remarks: "",
    }),
    []
  );

  const [formData, setFormData] = useState(
    defaultForm
  );
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (
      !initialData ||
      Object.keys(initialData).length === 0
    ) {
      setFormData(defaultForm);
      return;
    }

    setFormData({
      ...defaultForm,
      ...initialData,
      type:
        initialData.type ||
        initialData.activityType ||
        "",
      subject:
        initialData.subject ||
        initialData.title ||
        "",
      description:
        initialData.description ||
        initialData.notes ||
        initialData.comment ||
        "",
      activityDate:
        initialData.activityDate ||
        initialData.date ||
        "",
      nextFollowUpDate:
        initialData.nextFollowUpDate ||
        initialData.followUpDate ||
        "",
      remarks:
        initialData.remarks ||
        "",
    });
  }, [initialData, defaultForm]);

  const activityTypeOptions = useMemo(() => {
    if (
      LEAD_ACTIVITY_TYPE_LABELS &&
      typeof LEAD_ACTIVITY_TYPE_LABELS ===
        "object"
    ) {
      return Object.entries(
        LEAD_ACTIVITY_TYPE_LABELS
      ).map(([value, label]) => ({
        value,
        label,
      }));
    }

    if (
      LEAD_ACTIVITY_TYPES &&
      typeof LEAD_ACTIVITY_TYPES === "object"
    ) {
      return Object.entries(
        LEAD_ACTIVITY_TYPES
      ).map(([value, label]) => ({
        value,
        label:
          typeof label === "string"
            ? label
            : value,
      }));
    }

    if (Array.isArray(LEAD_ACTIVITY_TYPES)) {
      return LEAD_ACTIVITY_TYPES.map(
        (type) => ({
          value:
            typeof type === "string"
              ? type
              : type?.value,
          label:
            typeof type === "string"
              ? type
              : type?.label,
        })
      );
    }

    return [
      {
        value: "CALL",
        label: "Call",
      },
      {
        value: "EMAIL",
        label: "Email",
      },
      {
        value: "MEETING",
        label: "Meeting",
      },
      {
        value: "SITE_VISIT",
        label: "Site Visit",
      },
      {
        value: "FOLLOW_UP",
        label: "Follow-Up",
      },
      {
        value: "NOTE",
        label: "Note",
      },
    ];
  }, []);

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

  const validate = () => {
    const nextErrors = {};

    if (!formData.type) {
      nextErrors.type =
        "Activity type is required.";
    }

    if (!formData.description?.trim()) {
      nextErrors.description =
        "Activity description is required.";
    }

    if (!formData.activityDate) {
      nextErrors.activityDate =
        "Activity date is required.";
    }

    if (
      formData.nextFollowUpDate &&
      formData.activityDate &&
      new Date(
        formData.nextFollowUpDate
      ) < new Date(formData.activityDate)
    ) {
      nextErrors.nextFollowUpDate =
        "Follow-up date cannot be earlier than the activity date.";
    }

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSubmitError("");

    const validationErrors = validate();

    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});

    if (typeof onSubmit !== "function") {
      return;
    }

    try {
      await onSubmit({
        ...formData,
        leadId:
          lead?._id ||
          lead?.id ||
          lead?.leadId ||
          formData.leadId,
      });
    } catch (error) {
      console.error(
        "Lead activity submission error:",
        error
      );

      setSubmitError(
        error?.message ||
          error?.response?.data?.message ||
          "Unable to save the activity. Please try again."
      );
    }
  };

  if (loading) {
    return (
      <div className="lead-activity-form-loading">
        <p>Loading activity form...</p>
      </div>
    );
  }

  return (
    <form
      className="lead-activity-form"
      onSubmit={handleSubmit}
      noValidate
    >
      {submitError && (
        <div className="lead-activity-form-alert lead-activity-form-alert-error">
          <strong>Unable to save activity</strong>
          <span>{submitError}</span>
        </div>
      )}

      {lead && (
        <div className="lead-activity-lead-info">
          <span>Lead</span>
          <strong>
            {lead?.customerName ||
              lead?.name ||
              lead?.customer?.name ||
              "Unnamed Lead"}
          </strong>

          {lead?.leadNumber && (
            <small>{lead.leadNumber}</small>
          )}
        </div>
      )}

      <div className="lead-activity-form-grid">
        <div className="lead-activity-form-field">
          <Select
            label="Activity Type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            options={activityTypeOptions}
            placeholder="Select activity type"
            required
            error={errors.type}
            disabled={submitting}
          />
        </div>

        <div className="lead-activity-form-field">
          <Input
            label="Subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="Enter activity subject"
            error={errors.subject}
            disabled={submitting}
          />
        </div>

        <div className="lead-activity-form-field">
          <Input
            label="Activity Date"
            name="activityDate"
            type="date"
            value={formData.activityDate}
            onChange={handleChange}
            required
            error={errors.activityDate}
            disabled={submitting}
          />
        </div>

        <div className="lead-activity-form-field">
          <Input
            label="Next Follow-Up Date"
            name="nextFollowUpDate"
            type="date"
            value={
              formData.nextFollowUpDate
            }
            onChange={handleChange}
            error={
              errors.nextFollowUpDate
            }
            disabled={submitting}
          />
        </div>

        <div className="lead-activity-form-field lead-activity-form-field-full">
          <Textarea
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the activity"
            rows={5}
            required
            error={errors.description}
            disabled={submitting}
          />
        </div>

        <div className="lead-activity-form-field lead-activity-form-field-full">
          <Textarea
            label="Remarks"
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            placeholder="Enter additional remarks"
            rows={3}
            error={errors.remarks}
            disabled={submitting}
          />
        </div>
      </div>

      <div className="lead-activity-form-actions">
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
            ? "Saving..."
            : "Save Activity"}
        </Button>
      </div>
    </form>
  );
};

export default LeadActivityForm;