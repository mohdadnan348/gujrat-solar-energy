"use client";

import React, { useEffect, useMemo, useState } from "react";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import Textarea from "@/components/common/Textarea";
import PanelSelector from "./PanelSelector";
import InverterSelector from "./InverterSelector";
import BatterySelector from "./BatterySelector";
import StructureSelector from "./StructureSelector";
import AccessorySelector from "./AccessorySelector";

const getId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value?._id || value?.id || "";
};

const SystemConfigurationForm = ({
  initialData = {},
  loading = false,
  submitting = false,
  requirements = [],
  products = {},
  mode = "create",
  onSubmit,
  onCancel,
}) => {
  const isEditMode = mode === "edit";

  const [formData, setFormData] = useState({
    solarRequirementId: "",
    systemSize: "",
    panelId: "",
    panelCount: "",
    inverterId: "",
    inverterCount: "",
    batteryId: "",
    batteryCount: "",
    batteryCapacity: "",
    structureId: "",
    structureQuantity: "",
    accessories: [],
    notes: "",
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!initialData || Object.keys(initialData).length === 0) {
      return;
    }

    setFormData((previous) => ({
      ...previous,
      solarRequirementId:
        getId(initialData.solarRequirementId) ||
        getId(initialData.requirementId),

      systemSize:
        initialData.systemSize ??
        initialData.capacity ??
        initialData.requiredCapacity ??
        "",

      panelId:
        getId(initialData.panelId) ||
        getId(initialData.panel),

      panelCount:
        initialData.panelCount ??
        initialData.numberOfPanels ??
        "",

      inverterId:
        getId(initialData.inverterId) ||
        getId(initialData.inverter),

      inverterCount:
        initialData.inverterCount ??
        initialData.numberOfInverters ??
        "",

      batteryId:
        getId(initialData.batteryId) ||
        getId(initialData.battery),

      batteryCount:
        initialData.batteryCount ??
        initialData.numberOfBatteries ??
        "",

      batteryCapacity:
        initialData.batteryCapacity ?? "",

      structureId:
        getId(initialData.structureId) ||
        getId(initialData.structure),

      structureQuantity:
        initialData.structureQuantity ??
        initialData.structure?.quantity ??
        "",

      accessories: Array.isArray(initialData.accessories)
        ? initialData.accessories
        : [],

      notes: initialData.notes || "",
    }));
  }, [initialData]);

  const requirementOptions = useMemo(
    () => [
      {
        value: "",
        label: "Select solar requirement",
      },
      ...requirements
        .map((requirement) => {
          const id = getId(requirement);

          const customerName =
            requirement?.customer?.name ||
            requirement?.lead?.customerName ||
            requirement?.lead?.name ||
            requirement?.customerName;

          return {
            value: id,
            label:
              requirement?.requirementNumber ||
              requirement?.requirementId ||
              customerName ||
              `Requirement ${id}`,
          };
        })
        .filter((item) => item.value),
    ],
    [requirements]
  );

  const panelProducts = useMemo(
    () => products?.panels || products?.panel || [],
    [products]
  );

  const inverterProducts = useMemo(
    () => products?.inverters || products?.inverter || [],
    [products]
  );

  const batteryProducts = useMemo(
    () => products?.batteries || products?.battery || [],
    [products]
  );

  const structureProducts = useMemo(
    () => products?.structures || products?.structure || [],
    [products]
  );

  const accessoryProducts = useMemo(
    () =>
      products?.accessories ||
      products?.accessory ||
      [],
    [products]
  );

  const handleChange = (event) => {
    const { name, value } = event.target;

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

  const updateField = (field, value) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [field]: "",
    }));

    setSubmitError("");
  };

  const handleAccessoriesChange = (value) => {
    updateField(
      "accessories",
      Array.isArray(value) ? value : []
    );
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.solarRequirementId) {
      nextErrors.solarRequirementId =
        "Solar requirement is required.";
    }

    if (
      formData.systemSize === "" ||
      Number(formData.systemSize) <= 0
    ) {
      nextErrors.systemSize =
        "Enter a valid system size.";
    }

    if (!formData.panelId) {
      nextErrors.panelId =
        "Panel selection is required.";
    }

    if (
      formData.panelCount === "" ||
      Number(formData.panelCount) <= 0
    ) {
      nextErrors.panelCount =
        "Enter a valid panel count.";
    }

    if (!formData.inverterId) {
      nextErrors.inverterId =
        "Inverter selection is required.";
    }

    if (
      formData.inverterCount === "" ||
      Number(formData.inverterCount) <= 0
    ) {
      nextErrors.inverterCount =
        "Enter a valid inverter count.";
    }

    if (formData.batteryId) {
      if (
        formData.batteryCount === "" ||
        Number(formData.batteryCount) <= 0
      ) {
        nextErrors.batteryCount =
          "Enter a valid battery count.";
      }

      if (
        formData.batteryCapacity === "" ||
        Number(formData.batteryCapacity) <= 0
      ) {
        nextErrors.batteryCapacity =
          "Enter a valid battery capacity.";
      }
    }

    if (!formData.structureId) {
      nextErrors.structureId =
        "Structure selection is required.";
    }

    if (
      formData.structureQuantity === "" ||
      Number(formData.structureQuantity) <= 0
    ) {
      nextErrors.structureQuantity =
        "Enter a valid structure quantity.";
    }

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSubmitError("");

    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});

    const payload = {
      ...formData,
      systemSize: Number(formData.systemSize),
      panelCount: Number(formData.panelCount),
      inverterCount: Number(formData.inverterCount),
      batteryCount: formData.batteryCount
        ? Number(formData.batteryCount)
        : 0,
      batteryCapacity: formData.batteryCapacity
        ? Number(formData.batteryCapacity)
        : 0,
      structureQuantity: Number(
        formData.structureQuantity
      ),
    };

    try {
      if (typeof onSubmit === "function") {
        await onSubmit(payload);
      }
    } catch (error) {
      console.error(
        "System configuration submission error:",
        error
      );

      setSubmitError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to save the system configuration. Please try again."
      );
    }
  };

  if (loading) {
    return (
      <div className="system-configuration-form-loading">
        <div className="system-configuration-form-spinner" />
        <p>
          Loading system configuration...
        </p>
      </div>
    );
  }

  return (
    <form
      className="system-configuration-form"
      onSubmit={handleSubmit}
      noValidate
    >
      {submitError && (
        <div className="system-configuration-form-alert">
          <strong>
            Unable to save configuration
          </strong>
          <span>{submitError}</span>
        </div>
      )}

      <section className="system-configuration-form-section">
        <div className="system-configuration-form-section-header">
          <div>
            <span className="system-configuration-form-step">
              Step 01
            </span>

            <h2>Requirement</h2>

            <p>
              Select the solar requirement for this
              system configuration.
            </p>
          </div>
        </div>

        <div className="system-configuration-form-grid">
          <div className="system-configuration-form-field system-configuration-form-field-full">
            <Select
              label="Solar Requirement"
              name="solarRequirementId"
              value={formData.solarRequirementId}
              onChange={handleChange}
              options={requirementOptions}
              placeholder="Select solar requirement"
              required
              disabled={
                submitting || isEditMode
              }
              error={errors.solarRequirementId}
            />
          </div>

          <div className="system-configuration-form-field">
            <Input
              label="System Size"
              name="systemSize"
              type="number"
              value={formData.systemSize}
              onChange={handleChange}
              placeholder="Enter system size in kW"
              min="0"
              step="0.01"
              required
              disabled={submitting}
              error={errors.systemSize}
            />
          </div>
        </div>
      </section>

      <section className="system-configuration-form-section">
        <div className="system-configuration-form-section-header">
          <div>
            <span className="system-configuration-form-step">
              Step 02
            </span>

            <h2>Solar Panels</h2>

            <p>
              Select the panel product and configure
              the required quantity.
            </p>
          </div>
        </div>

        <PanelSelector
          products={panelProducts}
          value={formData.panelId}
          quantity={formData.panelCount}
          onChange={(value) =>
            updateField("panelId", value)
          }
          onQuantityChange={(value) =>
            updateField("panelCount", value)
          }
          disabled={submitting}
          error={
            errors.panelId ||
            errors.panelCount
          }
        />
      </section>

      <section className="system-configuration-form-section">
        <div className="system-configuration-form-section-header">
          <div>
            <span className="system-configuration-form-step">
              Step 03
            </span>

            <h2>Inverter</h2>

            <p>
              Select the inverter and configure its
              quantity.
            </p>
          </div>
        </div>

        <InverterSelector
          products={inverterProducts}
          value={formData.inverterId}
          quantity={formData.inverterCount}
          onChange={(value) =>
            updateField("inverterId", value)
          }
          onQuantityChange={(value) =>
            updateField("inverterCount", value)
          }
          disabled={submitting}
          error={
            errors.inverterId ||
            errors.inverterCount
          }
        />
      </section>

      <section className="system-configuration-form-section">
        <div className="system-configuration-form-section-header">
          <div>
            <span className="system-configuration-form-step">
              Step 04
            </span>

            <h2>Battery</h2>

            <p>
              Add battery details when battery storage
              is required.
            </p>
          </div>
        </div>

        <BatterySelector
          products={batteryProducts}
          value={formData.batteryId}
          quantity={formData.batteryCount}
          capacity={formData.batteryCapacity}
          onChange={(value) =>
            updateField("batteryId", value)
          }
          onQuantityChange={(value) =>
            updateField("batteryCount", value)
          }
          onCapacityChange={(value) =>
            updateField(
              "batteryCapacity",
              value
            )
          }
          disabled={submitting}
          errors={{
            batteryId: errors.batteryId,
            batteryCount: errors.batteryCount,
            batteryCapacity:
              errors.batteryCapacity,
          }}
        />
      </section>

      <section className="system-configuration-form-section">
        <div className="system-configuration-form-section-header">
          <div>
            <span className="system-configuration-form-step">
              Step 05
            </span>

            <h2>Mounting Structure</h2>

            <p>
              Select the required mounting structure
              and quantity.
            </p>
          </div>
        </div>

        <StructureSelector
          products={structureProducts}
          value={formData.structureId}
          quantity={formData.structureQuantity}
          onChange={(value) =>
            updateField("structureId", value)
          }
          onQuantityChange={(value) =>
            updateField(
              "structureQuantity",
              value
            )
          }
          disabled={submitting}
          error={
            errors.structureId ||
            errors.structureQuantity
          }
        />
      </section>

      <section className="system-configuration-form-section">
        <div className="system-configuration-form-section-header">
          <div>
            <span className="system-configuration-form-step">
              Step 06
            </span>

            <h2>Accessories</h2>

            <p>
              Select additional accessories required
              for installation.
            </p>
          </div>
        </div>

        <AccessorySelector
          products={accessoryProducts}
          value={formData.accessories}
          onChange={handleAccessoriesChange}
          disabled={submitting}
          error={errors.accessories}
        />
      </section>

      <section className="system-configuration-form-section">
        <div className="system-configuration-form-section-header">
          <div>
            <h2>Additional Notes</h2>

            <p>
              Add any additional configuration
              information.
            </p>
          </div>
        </div>

        <Textarea
          label="Notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Enter additional configuration notes"
          rows={4}
          disabled={submitting}
          error={errors.notes}
        />
      </section>

      <div className="system-configuration-form-actions">
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
            ? "Update Configuration"
            : "Create Configuration"}
        </Button>
      </div>
    </form>
  );
};

export default SystemConfigurationForm;