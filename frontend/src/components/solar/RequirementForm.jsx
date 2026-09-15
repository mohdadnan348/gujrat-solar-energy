"use client";

import React, { useEffect, useMemo, useState } from "react";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import Textarea from "@/components/common/Textarea";
import Loader from "@/components/common/Loader";
import {
  SYSTEM_TYPES,
  SYSTEM_TYPE_LABELS,
  ROOF_TYPES,
  BATTERY_REQUIREMENT,
  BATTERY_REQUIREMENT_LABELS,
  CONNECTION_TYPES,
  CONNECTION_TYPE_LABELS,
} from "@/utils/constants";
import { validateSolarRequirement } from "@/utils/validators";

const RequirementForm = ({
  initialData = {},
  loading = false,
  submitting = false,
  leads = [],
  mode = "create",
  onSubmit,
  onCancel,
}) => {
  const isEditMode = mode === "edit";

  const defaultForm = useMemo(
    () => ({
      leadId: "",
      systemType: "",
      requiredCapacity: "",
      roofType: "",
      batteryRequirement: "",
      connectionType: "",
      monthlyBill: "",
      electricityConsumption: "",
      installationAddress: "",
      city: "",
      state: "",
      pincode: "",
      notes: "",
    }),
    []
  );

  const [formData, setFormData] = useState(defaultForm);
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

    const leadId =
      typeof initialData.leadId === "object"
        ? initialData.leadId?._id ||
          initialData.leadId?.id ||
          ""
        : initialData.leadId || "";

    const address =
      initialData.installationAddress ||
      initialData.address ||
      "";

    setFormData({
      ...defaultForm,
      ...initialData,
      leadId,
      systemType:
        initialData.systemType ||
        initialData.type ||
        "",
      requiredCapacity:
        initialData.requiredCapacity ||
        initialData.systemSize ||
        initialData.capacity ||
        initialData.kw ||
        "",
      roofType:
        initialData.roofType ||
        "",
      batteryRequirement:
        initialData.batteryRequirement ||
        initialData.battery ||
        "",
      connectionType:
        initialData.connectionType ||
        "",
      monthlyBill:
        initialData.monthlyBill ||
        initialData.averageMonthlyBill ||
        "",
      electricityConsumption:
        initialData.electricityConsumption ||
        initialData.monthlyConsumption ||
        "",
      installationAddress:
        typeof address === "string"
          ? address
          : address?.address || "",
      city:
        initialData.city ||
        initialData.location?.city ||
        address?.city ||
        "",
      state:
        initialData.state ||
        initialData.location?.state ||
        address?.state ||
        "",
      pincode:
        initialData.pincode ||
        initialData.location?.pincode ||
        address?.pincode ||
        "",
      notes: initialData.notes || "",
    });
  }, [initialData, defaultForm]);

  const toOptions = (
    source,
    labels,
    fallback = []
  ) => {
    if (labels && typeof labels === "object") {
      return Object.entries(labels).map(
        ([value, label]) => ({
          value,
          label,
        })
      );
    }

    if (
      source &&
      typeof source === "object" &&
      !Array.isArray(source)
    ) {
      return Object.entries(source).map(
        ([value, label]) => ({
          value,
          label:
            typeof label === "string"
              ? label
              : value,
        })
      );
    }

    if (Array.isArray(source)) {
      return source.map((item) => ({
        value:
          typeof item === "string"
            ? item
            : item?.value,
        label:
          typeof item === "string"
            ? item
            : item?.label,
      }));
    }

    return fallback;
  };

  const leadOptions = useMemo(
    () => [
      {
        value: "",
        label: "Select lead",
      },
      ...(Array.isArray(leads)
        ? leads
            .map((lead) => ({
              value:
                lead?._id ||
                lead?.id ||
                lead?.leadId ||
                "",
              label:
                lead?.customerName ||
                lead?.name ||
                lead?.customer?.name ||
                "Unnamed Lead",
            }))
            .filter(
              (option) => option.value
            )
        : []),
    ],
    [leads]
  );

  const systemTypeOptions = useMemo(
    () =>
      toOptions(
        SYSTEM_TYPES,
        SYSTEM_TYPE_LABELS,
        [
          {
            value: "ON_GRID",
            label: "On-Grid",
          },
          {
            value: "OFF_GRID",
            label: "Off-Grid",
          },
          {
            value: "HYBRID",
            label: "Hybrid",
          },
        ]
      ),
    []
  );

  const roofTypeOptions = useMemo(
    () =>
      toOptions(
        ROOF_TYPES,
        null,
        [
          {
            value: "RCC",
            label: "RCC",
          },
          {
            value: "TIN",
            label: "Tin",
          },
          {
            value: "SHEET",
            label: "Sheet",
          },
          {
            value: "GROUND",
            label: "Ground",
          },
          {
            value: "OTHER",
            label: "Other",
          },
        ]
      ),
    []
  );

  const batteryOptions = useMemo(
    () =>
      toOptions(
        BATTERY_REQUIREMENT,
        BATTERY_REQUIREMENT_LABELS,
        [
          {
            value: "YES",
            label: "Required",
          },
          {
            value: "NO",
            label: "Not Required",
          },
        ]
      ),
    []
  );

  const connectionOptions = useMemo(
    () =>
      toOptions(
        CONNECTION_TYPES,
        CONNECTION_TYPE_LABELS,
        [
          {
            value: "SINGLE_PHASE",
            label: "Single Phase",
          },
          {
            value: "THREE_PHASE",
            label: "Three Phase",
          },
        ]
      ),
    []
  );

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

    const validationResult =
      validateSolarRequirement(formData);

    const validationErrors =
      validationResult?.errors ||
      validationResult ||
      {};

    if (
      validationErrors &&
      Object.keys(validationErrors).length
    ) {
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
        "Solar requirement submission error:",
        error
      );

      setSubmitError(
        error?.message ||
          error?.response?.data?.message ||
          "Unable to save the solar requirement. Please try again."
      );
    }
  };

  if (loading) {
    return (
      <div className="requirement-form-loading">
        <Loader />
        <p>
          Loading solar requirement information...
        </p>
      </div>
    );
  }

  return (
    <form
      className="requirement-form"
      onSubmit={handleSubmit}
      noValidate
    >
      {submitError && (
        <div className="requirement-form-alert requirement-form-alert-error">
          <strong>
            Unable to save solar requirement
          </strong>
          <span>{submitError}</span>
        </div>
      )}

      <section className="requirement-form-section">
        <div className="requirement-form-section-header">
          <div>
            <h2>Lead Information</h2>
            <p>
              Link this solar requirement to an
              existing lead.
            </p>
          </div>
        </div>

        <div className="requirement-form-grid">
          <div className="requirement-form-field requirement-form-field-full">
            <Select
              label="Lead"
              name="leadId"
              value={formData.leadId}
              onChange={handleChange}
              options={leadOptions}
              placeholder="Select lead"
              required
              error={errors.leadId}
              disabled={
                submitting || isEditMode
              }
            />
          </div>
        </div>
      </section>

      <section className="requirement-form-section">
        <div className="requirement-form-section-header">
          <div>
            <h2>Solar System Requirement</h2>
            <p>
              Define the customer's required solar
              system.
            </p>
          </div>
        </div>

        <div className="requirement-form-grid">
          <div className="requirement-form-field">
            <Select
              label="System Type"
              name="systemType"
              value={formData.systemType}
              onChange={handleChange}
              options={systemTypeOptions}
              placeholder="Select system type"
              required
              error={errors.systemType}
              disabled={submitting}
            />
          </div>

          <div className="requirement-form-field">
            <Input
              label="Required Capacity"
              name="requiredCapacity"
              type="number"
              value={
                formData.requiredCapacity
              }
              onChange={handleChange}
              placeholder="Enter capacity in kW"
              min="0"
              step="0.01"
              required
              error={
                errors.requiredCapacity
              }
              disabled={submitting}
            />
          </div>

          <div className="requirement-form-field">
            <Select
              label="Roof Type"
              name="roofType"
              value={formData.roofType}
              onChange={handleChange}
              options={roofTypeOptions}
              placeholder="Select roof type"
              error={errors.roofType}
              disabled={submitting}
            />
          </div>

          <div className="requirement-form-field">
            <Select
              label="Battery Requirement"
              name="batteryRequirement"
              value={
                formData.batteryRequirement
              }
              onChange={handleChange}
              options={batteryOptions}
              placeholder="Select battery requirement"
              error={
                errors.batteryRequirement
              }
              disabled={submitting}
            />
          </div>

          <div className="requirement-form-field">
            <Select
              label="Connection Type"
              name="connectionType"
              value={formData.connectionType}
              onChange={handleChange}
              options={connectionOptions}
              placeholder="Select connection type"
              error={errors.connectionType}
              disabled={submitting}
            />
          </div>

          <div className="requirement-form-field">
            <Input
              label="Monthly Electricity Bill"
              name="monthlyBill"
              type="number"
              value={formData.monthlyBill}
              onChange={handleChange}
              placeholder="Enter average monthly bill"
              min="0"
              step="1"
              error={errors.monthlyBill}
              disabled={submitting}
            />
          </div>

          <div className="requirement-form-field">
            <Input
              label="Monthly Consumption"
              name="electricityConsumption"
              type="number"
              value={
                formData.electricityConsumption
              }
              onChange={handleChange}
              placeholder="Enter monthly consumption in kWh"
              min="0"
              step="0.01"
              error={
                errors.electricityConsumption
              }
              disabled={submitting}
            />
          </div>
        </div>
      </section>

      <section className="requirement-form-section">
        <div className="requirement-form-section-header">
          <div>
            <h2>Installation Location</h2>
            <p>
              Enter the location where the solar
              system will be installed.
            </p>
          </div>
        </div>

        <div className="requirement-form-grid">
          <div className="requirement-form-field requirement-form-field-full">
            <Textarea
              label="Installation Address"
              name="installationAddress"
              value={
                formData.installationAddress
              }
              onChange={handleChange}
              placeholder="Enter complete installation address"
              rows={3}
              required
              error={
                errors.installationAddress
              }
              disabled={submitting}
            />
          </div>

          <div className="requirement-form-field">
            <Input
              label="City"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Enter city"
              required
              error={errors.city}
              disabled={submitting}
            />
          </div>

          <div className="requirement-form-field">
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

          <div className="requirement-form-field">
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

      <section className="requirement-form-section">
        <div className="requirement-form-section-header">
          <div>
            <h2>Additional Notes</h2>
            <p>
              Add any additional information about
              the solar requirement.
            </p>
          </div>
        </div>

        <div className="requirement-form-grid">
          <div className="requirement-form-field requirement-form-field-full">
            <Textarea
              label="Notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Enter additional notes"
              rows={4}
              error={errors.notes}
              disabled={submitting}
            />
          </div>
        </div>
      </section>

      <div className="requirement-form-actions">
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
            ? "Update Requirement"
            : "Create Requirement"}
        </Button>
      </div>
    </form>
  );
};

export default RequirementForm;