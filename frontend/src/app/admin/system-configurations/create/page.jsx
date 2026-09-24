"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "../../layout";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import Textarea from "@/components/common/Textarea";
import Loader from "@/components/common/Loader";
import { useAuth } from "@/hooks/useAuth";
import systemConfigurationService  from "@/services/systemConfiguration.service";
import solarRequirementService  from "@/services/solarRequirement.service";

const CreateSystemConfigurationPage = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [requirements, setRequirements] = useState([]);
  const [loadingRequirements, setLoadingRequirements] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    solarRequirementId: "",
    customerName: "",
    systemType: "ON_GRID",
    systemSizeKW: "",
    panelMake: "",
    panelWattage: "",
    panelCount: "",
    inverterMake: "",
    inverterCapacity: "",
    inverterCount: "1",
    batteryRequired: "NO",
    batteryCapacity: "",
    mountingStructure: "",
    cableSpecification: "",
    earthing: "",
    protection: "",
    generationEstimate: "",
    annualGeneration: "",
    installationType: "",
    notes: "",
  });

  const loadRequirements = async () => {
    try {
      setLoadingRequirements(true);

      const response =
        await solarRequirementService.getSolarRequirements();

      const list = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.data?.data)
        ? response.data.data
        : Array.isArray(response?.requirements)
        ? response.requirements
        : [];

      setRequirements(list);
    } catch (err) {
      console.error(
        "Failed to load solar requirements:",
        err
      );

      setError(
        err?.message ||
          "Solar requirements load nahi ho paayi."
      );
    } finally {
      setLoadingRequirements(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      loadRequirements();
    }
  }, [authLoading, user]);

  const getId = (item) =>
    item?._id ||
    item?.id ||
    item?.requirementId;

  const getRequirementValue = (
    item,
    keys,
    fallback = ""
  ) => {
    for (const key of keys) {
      const value = item?.[key];

      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        return value;
      }
    }

    return fallback;
  };

  const requirementOptions = useMemo(() => {
    return [
      {
        value: "",
        label: "Select Solar Requirement",
      },
      ...requirements.map((requirement) => {
        const id = getId(requirement);

        const customerName = getRequirementValue(
          requirement,
          [
            "customerName",
            "customer.name",
            "name",
          ],
          "Customer"
        );

        const requiredKW = getRequirementValue(
          requirement,
          [
            "requiredKW",
            "systemSizeKW",
            "capacityKW",
          ],
          ""
        );

        const requirementNumber =
          getRequirementValue(
            requirement,
            [
              "requirementNumber",
              "requirementNo",
              "number",
            ],
            ""
          );

        return {
          value: id || "",
          label: [
            requirementNumber,
            customerName,
            requiredKW
              ? `${requiredKW} kW`
              : "",
          ]
            .filter(Boolean)
            .join(" • "),
        };
      }),
    ];
  }, [requirements]);

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleRequirementChange = (value) => {
    const selected = requirements.find(
      (requirement) =>
        String(getId(requirement)) === String(value)
    );

    if (!selected) {
      updateField("solarRequirementId", value);
      return;
    }

    const customerName =
      getRequirementValue(
        selected,
        [
          "customerName",
          "customer.name",
          "name",
        ],
        ""
      );

    const requiredKW =
      getRequirementValue(
        selected,
        [
          "requiredKW",
          "systemSizeKW",
          "capacityKW",
        ],
        ""
      );

    const systemType =
      getRequirementValue(
        selected,
        ["systemType", "system_type"],
        "ON_GRID"
      );

    updateField("solarRequirementId", value);

    setForm((prev) => ({
      ...prev,
      solarRequirementId: value,
      customerName:
        customerName || prev.customerName,
      systemSizeKW:
        requiredKW !== ""
          ? requiredKW
          : prev.systemSizeKW,
      systemType:
        systemType || prev.systemType,
    }));
  };

  const calculatePanelCount = () => {
    const size = Number(form.systemSizeKW);
    const wattage = Number(form.panelWattage);

    if (
      !Number.isFinite(size) ||
      !Number.isFinite(wattage) ||
      size <= 0 ||
      wattage <= 0
    ) {
      return;
    }

    const count = Math.ceil(
      (size * 1000) / wattage
    );

    setForm((prev) => ({
      ...prev,
      panelCount: String(count),
    }));
  };

  const validateForm = () => {
    if (!form.solarRequirementId) {
      return "Solar Requirement select karna required hai.";
    }

    if (!form.systemType) {
      return "System Type select karein.";
    }

    if (
      !form.systemSizeKW ||
      Number(form.systemSizeKW) <= 0
    ) {
      return "Valid system size enter karein.";
    }

    if (
      form.panelWattage &&
      Number(form.panelWattage) <= 0
    ) {
      return "Panel wattage valid hona chahiye.";
    }

    if (
      form.panelCount &&
      Number(form.panelCount) < 0
    ) {
      return "Panel count valid hona chahiye.";
    }

    if (
      form.inverterCount &&
      Number(form.inverterCount) <= 0
    ) {
      return "Inverter count valid hona chahiye.";
    }

    if (
      form.batteryRequired === "YES" &&
      (!form.batteryCapacity ||
        Number(form.batteryCapacity) <= 0)
    ) {
      return "Battery required hai to battery capacity enter karein.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
  lead: form.leadId,

  solarRequirement: form.solarRequirementId,

  customer: undefined,

  version: 1,

  panels: form.panelMake
    ? [
        {
          name: form.panelMake,
          quantity: form.panelCount
            ? Number(form.panelCount)
            : 1,
          unit: "Nos",
          rate: 0,
        },
      ]
    : undefined,

  inverter: form.inverterMake
    ? [
        {
          name: form.inverterMake,
          quantity: form.inverterCount
            ? Number(form.inverterCount)
            : 1,
          unit: "Nos",
          rate: 0,
        },
      ]
    : undefined,

  battery: form.batteryRequired === "YES"
    ? [
        {
          name: "Battery",
          quantity: 1,
          unit: "Nos",
          rate: 0,
        },
      ]
    : undefined,

  installation: form.installationType
    ? [
        {
          name: form.installationType,
          quantity: 1,
          unit: "Job",
          rate: 0,
        },
      ]
    : undefined,

  notes: form.notes || undefined,
};

      await systemConfigurationService.createSystemConfiguration(
        payload
      );

      router.push(
        "/admin/system-configurations"
      );
    }     catch (err) {
  console.error("SYSTEM CONFIG ERROR FULL:", err);
  console.error("STATUS:", err?.response?.status);
  console.error("DATA:", err?.response?.data);
  console.error("HEADERS:", err?.response?.headers);
  console.error("REQUEST:", err?.config);

  setError(
    err?.response?.data?.message ||
    err?.response?.data?.errors?.join(", ") ||
    "System configuration creation failed"
  );
}
     finally {
      setSaving(false);
    }
  };
  if (authLoading) {
    return (
      <AdminLayout>
        <div className="admin-create-configuration-loading">
          <Loader />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-create-configuration-page">
        {/* Header */}
        <div className="admin-create-configuration-header">
          <div>
            <button
              type="button"
              className="admin-create-configuration-back"
              onClick={() =>
                router.push(
                  "/admin/system-configurations"
                )
              }
            >
              ← Back to System Configurations
            </button>

            <div className="admin-create-configuration-title">
              <div className="admin-create-configuration-icon">
                ⚡
              </div>

              <div>
                <h1>
                  Create System Configuration
                </h1>

                <p>
                  Solar requirement ke basis par
                  technical system configuration create
                  karein.
                </p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="admin-create-configuration-error">
            <div className="admin-create-configuration-error-icon">
              !
            </div>

            <div>
              <strong>Configuration create nahi hui</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        {loadingRequirements ? (
          <div className="admin-create-configuration-loading-card">
            <Loader />
            <p>
              Solar requirements load ho rahi hain...
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="admin-create-configuration-form"
          >
            {/* Requirement */}
            <section className="admin-configuration-form-card">
              <div className="admin-configuration-form-card-header">
                <div className="admin-form-section-number">
                  01
                </div>

                <div>
                  <h2>Requirement & Customer</h2>
                  <p>
                    Existing solar requirement ko
                    configuration ke saath link karein.
                  </p>
                </div>
              </div>

              <div className="admin-configuration-form-grid">
                <Select
                  label="Solar Requirement"
                  value={form.solarRequirementId}
                  onChange={(e) =>
                    handleRequirementChange(
                      e.target.value
                    )
                  }
                  options={requirementOptions}
                  required
                />

                <Input
                  label="Customer Name"
                  value={form.customerName}
                  onChange={(e) =>
                    updateField(
                      "customerName",
                      e.target.value
                    )
                  }
                  placeholder="Customer name"
                />

                <Select
                  label="System Type"
                  value={form.systemType}
                  onChange={(e) =>
                    updateField(
                      "systemType",
                      e.target.value
                    )
                  }
                  options={[
                    {
                      value: "ON_GRID",
                      label: "On Grid",
                    },
                    {
                      value: "OFF_GRID",
                      label: "Off Grid",
                    },
                    {
                      value: "HYBRID",
                      label: "Hybrid",
                    },
                  ]}
                  required
                />

                <Input
                  label="System Size"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.systemSizeKW}
                  onChange={(e) =>
                    updateField(
                      "systemSizeKW",
                      e.target.value
                    )
                  }
                  placeholder="e.g. 5"
                  suffix="kW"
                  required
                />
              </div>
            </section>

            {/* Solar Panels */}
            <section className="admin-configuration-form-card">
              <div className="admin-configuration-form-card-header">
                <div className="admin-form-section-number">
                  02
                </div>

                <div>
                  <h2>Solar Panel Configuration</h2>
                  <p>
                    Panel make, wattage aur total panel
                    quantity define karein.
                  </p>
                </div>
              </div>

              <div className="admin-configuration-form-grid">
                <Input
                  label="Panel Make"
                  value={form.panelMake}
                  onChange={(e) =>
                    updateField(
                      "panelMake",
                      e.target.value
                    )
                  }
                  placeholder="e.g. Adani, Waaree, Tata"
                />

                <Input
                  label="Panel Wattage"
                  type="number"
                  min="0"
                  value={form.panelWattage}
                  onChange={(e) =>
                    updateField(
                      "panelWattage",
                      e.target.value
                    )
                  }
                  placeholder="e.g. 540"
                  suffix="W"
                />

                <div className="admin-panel-count-field">
                  <Input
                    label="Panel Count"
                    type="number"
                    min="0"
                    value={form.panelCount}
                    onChange={(e) =>
                      updateField(
                        "panelCount",
                        e.target.value
                      )
                    }
                    placeholder="e.g. 10"
                  />

                  <button
                    type="button"
                    className="admin-calculate-button"
                    onClick={calculatePanelCount}
                  >
                    Calculate
                  </button>
                </div>
              </div>
            </section>

            {/* Inverter */}
            <section className="admin-configuration-form-card">
              <div className="admin-configuration-form-card-header">
                <div className="admin-form-section-number">
                  03
                </div>

                <div>
                  <h2>Inverter Configuration</h2>
                  <p>
                    Inverter brand, capacity aur quantity
                    configure karein.
                  </p>
                </div>
              </div>

              <div className="admin-configuration-form-grid">
                <Input
                  label="Inverter Make"
                  value={form.inverterMake}
                  onChange={(e) =>
                    updateField(
                      "inverterMake",
                      e.target.value
                    )
                  }
                  placeholder="e.g. Luminous, Growatt"
                />

                <Input
                  label="Inverter Capacity"
                  value={form.inverterCapacity}
                  onChange={(e) =>
                    updateField(
                      "inverterCapacity",
                      e.target.value
                    )
                  }
                  placeholder="e.g. 5 kW"
                />

                <Input
                  label="Inverter Count"
                  type="number"
                  min="1"
                  value={form.inverterCount}
                  onChange={(e) =>
                    updateField(
                      "inverterCount",
                      e.target.value
                    )
                  }
                  placeholder="1"
                />
              </div>
            </section>

            {/* Battery */}
            <section className="admin-configuration-form-card">
              <div className="admin-configuration-form-card-header">
                <div className="admin-form-section-number">
                  04
                </div>

                <div>
                  <h2>Battery Configuration</h2>
                  <p>
                    Backup ke liye battery requirement
                    define karein.
                  </p>
                </div>
              </div>

              <div className="admin-configuration-form-grid">
                <Select
                  label="Battery Required"
                  value={form.batteryRequired}
                  onChange={(e) =>
                    updateField(
                      "batteryRequired",
                      e.target.value
                    )
                  }
                  options={[
                    {
                      value: "NO",
                      label: "No",
                    },
                    {
                      value: "YES",
                      label: "Yes",
                    },
                  ]}
                />

                {form.batteryRequired ===
                  "YES" && (
                  <Input
                    label="Battery Capacity"
                    value={form.batteryCapacity}
                    onChange={(e) =>
                      updateField(
                        "batteryCapacity",
                        e.target.value
                      )
                    }
                    placeholder="e.g. 10 kWh"
                    required
                  />
                )}
              </div>
            </section>

            {/* Technical */}
            <section className="admin-configuration-form-card">
              <div className="admin-configuration-form-card-header">
                <div className="admin-form-section-number">
                  05
                </div>

                <div>
                  <h2>Technical Specifications</h2>
                  <p>
                    Installation aur electrical
                    specifications add karein.
                  </p>
                </div>
              </div>

              <div className="admin-configuration-form-grid">
                <Input
                  label="Mounting Structure"
                  value={form.mountingStructure}
                  onChange={(e) =>
                    updateField(
                      "mountingStructure",
                      e.target.value
                    )
                  }
                  placeholder="e.g. GI / Aluminium"
                />

                <Input
                  label="Cable Specification"
                  value={form.cableSpecification}
                  onChange={(e) =>
                    updateField(
                      "cableSpecification",
                      e.target.value
                    )
                  }
                  placeholder="e.g. 4 sq.mm DC cable"
                />

                <Input
                  label="Earthing"
                  value={form.earthing}
                  onChange={(e) =>
                    updateField(
                      "earthing",
                      e.target.value
                    )
                  }
                  placeholder="e.g. 2 dedicated earth pits"
                />

                <Input
                  label="Protection"
                  value={form.protection}
                  onChange={(e) =>
                    updateField(
                      "protection",
                      e.target.value
                    )
                  }
                  placeholder="e.g. DCDB / ACDB / SPD"
                />

                <Input
                  label="Installation Type"
                  value={form.installationType}
                  onChange={(e) =>
                    updateField(
                      "installationType",
                      e.target.value
                    )
                  }
                  placeholder="e.g. Rooftop"
                />
              </div>
            </section>

            {/* Generation */}
            <section className="admin-configuration-form-card">
              <div className="admin-configuration-form-card-header">
                <div className="admin-form-section-number">
                  06
                </div>

                <div>
                  <h2>Generation Estimate</h2>
                  <p>
                    Expected solar generation details
                    record karein.
                  </p>
                </div>
              </div>

              <div className="admin-configuration-form-grid">
                <Input
                  label="Generation Estimate"
                  value={form.generationEstimate}
                  onChange={(e) =>
                    updateField(
                      "generationEstimate",
                      e.target.value
                    )
                  }
                  placeholder="e.g. 4.5 units/day"
                />

                <Input
                  label="Annual Generation"
                  value={form.annualGeneration}
                  onChange={(e) =>
                    updateField(
                      "annualGeneration",
                      e.target.value
                    )
                  }
                  placeholder="e.g. 6500 units/year"
                />
              </div>
            </section>

            {/* Notes */}
            <section className="admin-configuration-form-card">
              <div className="admin-configuration-form-card-header">
                <div className="admin-form-section-number">
                  07
                </div>

                <div>
                  <h2>Additional Notes</h2>
                  <p>
                    Configuration se related additional
                    information add karein.
                  </p>
                </div>
              </div>

              <div className="admin-configuration-textarea">
                <Textarea
                  label="Notes"
                  value={form.notes}
                  onChange={(e) =>
                    updateField(
                      "notes",
                      e.target.value
                    )
                  }
                  placeholder="Additional technical notes..."
                  rows={5}
                />
              </div>
            </section>

            {/* Actions */}
            <div className="admin-create-configuration-actions">
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  router.push(
                    "/admin/system-configurations"
                  )
                }
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
                  ? "Creating..."
                  : "Create Configuration"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
};

export default CreateSystemConfigurationPage;