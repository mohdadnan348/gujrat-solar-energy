"use client";

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import Textarea from "@/components/common/Textarea";
import Loader from "@/components/common/Loader";

import systemConfigurationService from "@/services/systemConfiguration.service";
import solarRequirementService from "@/services/solarRequirement.service";

import "./create-configuration.css";

/* =========================================================
   SAFE HELPERS
========================================================= */

const getId = (item) => {
  if (!item) return "";

  if (typeof item === "string") {
    return item;
  }

  return (
    item?._id ||
    item?.id ||
    item?.requirementId ||
    ""
  );
};

const displayValue = (
  value,
  fallback = ""
) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return fallback;
  }

  if (
    typeof value === "string" ||
    typeof value === "number"
  ) {
    return String(value);
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (typeof value === "object") {
    return (
      value?.name ||
      value?.fullName ||
      value?.customerName ||
      value?.companyName ||
      value?.customerId ||
      value?.leadName ||
      value?.leadId ||
      value?._id ||
      fallback
    );
  }

  return String(value);
};

const getValue = (
  object,
  keys,
  fallback = ""
) => {
  if (!object) {
    return fallback;
  }

  for (const key of keys) {
    const value =
      object?.[key];

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

const normalizeList = (
  response
) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (
    Array.isArray(response?.data)
  ) {
    return response.data;
  }

  if (
    Array.isArray(
      response?.data?.data
    )
  ) {
    return response.data.data;
  }

  if (
    Array.isArray(
      response?.data?.requirements
    )
  ) {
    return response.data.requirements;
  }

  if (
    Array.isArray(
      response?.requirements
    )
  ) {
    return response.requirements;
  }

  return [];
};

/* =========================================================
   PAGE
========================================================= */

const CreateSystemConfigurationPage =
  () => {
    const router =
      useRouter();

    const [
      requirements,
      setRequirements,
    ] = useState([]);

    const [
      loadingRequirements,
      setLoadingRequirements,
    ] = useState(true);

    const [
      saving,
      setSaving,
    ] = useState(false);

    const [
      error,
      setError,
    ] = useState("");

    const [
      form,
      setForm,
    ] = useState({
      solarRequirementId: "",
      leadId: "",
      customerId: "",
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
      installationType: "",

      generationEstimate: "",
      annualGeneration: "",

      notes: "",
    });

    /* =====================================================
       LOAD SOLAR REQUIREMENTS
    ===================================================== */

    const loadRequirements =
      async () => {
        try {
          setLoadingRequirements(
            true
          );
          setError("");

          const response =
            await solarRequirementService.getSolarRequirements();

          const list =
            normalizeList(
              response
            );

          setRequirements(
            list
          );
        } catch (err) {
          console.error(
            "Failed to load solar requirements:",
            err
          );

          setRequirements(
            []
          );

          setError(
            err?.response
              ?.data?.message ||
              err?.message ||
              "Solar requirements load nahi ho paayi."
          );
        } finally {
          setLoadingRequirements(
            false
          );
        }
      };

    useEffect(() => {
      loadRequirements();
    }, []);

    /* =====================================================
       REQUIREMENT OPTIONS
    ===================================================== */

    const requirementOptions =
      useMemo(() => {
        return [
          {
            value: "",
            label:
              "Select Solar Requirement",
          },

          ...requirements.map(
            (
              requirement
            ) => {
              const id =
                getId(
                  requirement
                );

              const customer =
                getValue(
                  requirement,
                  [
                    "customerName",
                    "customer",
                    "customerId",
                    "name",
                  ],
                  ""
                );

              const customerName =
                displayValue(
                  customer,
                  "Customer"
                );

              const requiredKW =
                getValue(
                  requirement,
                  [
                    "requiredKw",
                    "requiredKW",
                    "systemSizeKW",
                    "capacityKW",
                  ],
                  ""
                );

              const requirementNumber =
                displayValue(
                  getValue(
                    requirement,
                    [
                      "requirementNumber",
                      "requirementNo",
                      "solarRequirementId",
                      "requirementId",
                    ],
                    ""
                  ),
                  ""
                );

              return {
                value:
                  id || "",

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
            }
          ),
        ];
      }, [
        requirements,
      ]);

    /* =====================================================
       UPDATE FIELD
    ===================================================== */

    const updateField = (
      field,
      value
    ) => {
      setForm(
        (previous) => ({
          ...previous,
          [field]: value,
        })
      );

      if (error) {
        setError("");
      }
    };

    /* =====================================================
       REQUIREMENT CHANGE
    ===================================================== */

    const handleRequirementChange =
      (value) => {
        const selected =
          requirements.find(
            (
              requirement
            ) =>
              String(
                getId(
                  requirement
                )
              ) ===
              String(value)
          );

        if (!selected) {
          updateField(
            "solarRequirementId",
            value
          );

          return;
        }

        const customer =
          getValue(
            selected,
            [
              "customerName",
              "customer",
              "customerId",
              "name",
            ],
            ""
          );

        const customerName =
          displayValue(
            customer,
            ""
          );

        const customerIdValue =
          getValue(
            selected,
            [
              "customerId",
              "customer._id",
            ],
            ""
          );

        const customerId =
          typeof customerIdValue ===
          "object"
            ? getId(
                customerIdValue
              )
            : customerIdValue;

        const leadValue =
          getValue(
            selected,
            [
              "lead",
              "leadId",
            ],
            ""
          );

        const leadId =
          getId(
            leadValue
          );

        const requiredKW =
          getValue(
            selected,
            [
              "requiredKw",
              "requiredKW",
              "systemSizeKW",
              "capacityKW",
            ],
            ""
          );

        const systemTypeValue =
          getValue(
            selected,
            [
              "systemType",
              "system_type",
            ],
            "ON_GRID"
          );

        const normalizedSystemType =
          String(
            systemTypeValue
          )
            .toUpperCase()
            .replace(
              /-/g,
              "_"
            );

        setForm(
          (previous) => ({
            ...previous,

            solarRequirementId:
              value,

            leadId:
              leadId ||
              previous.leadId,

            customerId:
              customerId ||
              previous.customerId,

            customerName:
              customerName ||
              previous.customerName,

            systemSizeKW:
              requiredKW !== ""
                ? requiredKW
                : previous.systemSizeKW,

            systemType:
              [
                "ON_GRID",
                "OFF_GRID",
                "HYBRID",
              ].includes(
                normalizedSystemType
              )
                ? normalizedSystemType
                : previous.systemType,
          })
        );

        setError("");
      };

    /* =====================================================
       PANEL CALCULATION
    ===================================================== */

    const calculatePanelCount =
      () => {
        const size =
          Number(
            form.systemSizeKW
          );

        const wattage =
          Number(
            form.panelWattage
          );

        if (
          !Number.isFinite(
            size
          ) ||
          !Number.isFinite(
            wattage
          ) ||
          size <= 0 ||
          wattage <= 0
        ) {
          setError(
            "Panel count calculate karne ke liye valid system size aur panel wattage enter karein."
          );

          return;
        }

        const count =
          Math.ceil(
            (size * 1000) /
              wattage
          );

        setForm(
          (previous) => ({
            ...previous,
            panelCount:
              String(count),
          })
        );

        setError("");
      };

    /* =====================================================
       VALIDATION
    ===================================================== */

    const validateForm =
      () => {
        if (
          !form.solarRequirementId
        ) {
          return "Solar Requirement select karna required hai.";
        }

        if (
          !form.systemType
        ) {
          return "System Type select karein.";
        }

        if (
          !form.systemSizeKW ||
          Number(
            form.systemSizeKW
          ) <= 0
        ) {
          return "Valid system size enter karein.";
        }

        if (
          form.panelWattage &&
          Number(
            form.panelWattage
          ) <= 0
        ) {
          return "Panel wattage valid hona chahiye.";
        }

        if (
          form.panelCount &&
          Number(
            form.panelCount
          ) < 0
        ) {
          return "Panel count valid hona chahiye.";
        }

        if (
          form.inverterCount &&
          Number(
            form.inverterCount
          ) <= 0
        ) {
          return "Inverter count valid hona chahiye.";
        }

        if (
          form.batteryRequired ===
            "YES" &&
          (
            !form.batteryCapacity ||
            Number(
              form.batteryCapacity
            ) <= 0
          )
        ) {
          return "Battery required hai to battery capacity enter karein.";
        }

        return "";
      };

    /* =====================================================
       SUBMIT
    ===================================================== */

    const handleSubmit =
      async (event) => {
        event.preventDefault();

        const validationError =
          validateForm();

        if (
          validationError
        ) {
          setError(
            validationError
          );

          return;
        }

        try {
          setSaving(true);
          setError("");

          /*
           * Backend model ke according:
           * lead
           * solarRequirement
           * customer
           * version
           * panels
           * inverter
           * battery
           * installation
           * notes
           */

          const payload = {
            lead:
              form.leadId ||
              undefined,

            solarRequirement:
              form.solarRequirementId,

            customer:
              form.customerId ||
              undefined,

            version: 1,

            panels:
              form.panelMake
                ? [
                    {
                      name:
                        form.panelMake,

                      quantity:
                        form.panelCount
                          ? Number(
                              form.panelCount
                            )
                          : 1,

                      unit: "Nos",

                      rate: 0,
                    },
                  ]
                : undefined,

            inverter:
              form.inverterMake
                ? [
                    {
                      name:
                        form.inverterMake,

                      quantity:
                        form.inverterCount
                          ? Number(
                              form.inverterCount
                            )
                          : 1,

                      unit: "Nos",

                      rate: 0,
                    },
                  ]
                : undefined,

            battery:
              form.batteryRequired ===
              "YES"
                ? [
                    {
                      name:
                        "Battery",

                      quantity: 1,

                      unit: "Nos",

                      rate: 0,
                    },
                  ]
                : undefined,

            installation:
              form.installationType
                ? [
                    {
                      name:
                        form.installationType,

                      quantity: 1,

                      unit: "Job",

                      rate: 0,
                    },
                  ]
                : undefined,

            notes:
              form.notes.trim() ||
              undefined,
          };

          console.log(
            "SYSTEM CONFIG PAYLOAD:",
            payload
          );

          await systemConfigurationService.createSystemConfiguration(
            payload
          );

          router.push(
            "/admin/system-configurations"
          );
        } catch (err) {
          console.error(
            "SYSTEM CONFIG ERROR:",
            err
          );

          console.error(
            "STATUS:",
            err?.response
              ?.status
          );

          console.error(
            "DATA:",
            err?.response
              ?.data
          );

          const backendErrors =
            err?.response
              ?.data?.errors;

          let errorMessage =
            err?.response
              ?.data?.message ||
            err?.message ||
            "System configuration creation failed.";

          if (
            Array.isArray(
              backendErrors
            ) &&
            backendErrors.length
          ) {
            errorMessage =
              backendErrors
                .map(
                  (item) =>
                    typeof item ===
                    "string"
                      ? item
                      : item?.message ||
                        item?.msg ||
                        JSON.stringify(
                          item
                        )
                )
                .join(", ");
          }

          setError(
            errorMessage
          );
        } finally {
          setSaving(false);
        }
      };

    /* =====================================================
       LOADING
    ===================================================== */

    if (
      loadingRequirements
    ) {
      return (
        <div className="admin-create-configuration-loading">
          <Loader />
        </div>
      );
    }

    /* =====================================================
       UI
    ===================================================== */

    return (
      <div className="admin-create-configuration-page">

        {/* HEADER */}

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

        {/* ERROR */}

        {error && (
          <div className="admin-create-configuration-error">

            <div className="admin-create-configuration-error-icon">
              !
            </div>

            <div>

              <strong>
                Configuration create nahi hui
              </strong>

              <p>
                {error}
              </p>

            </div>

          </div>
        )}

        {/* FORM */}

        <form
          onSubmit={
            handleSubmit
          }
          className="admin-create-configuration-form"
        >

          {/* =================================================
              01 REQUIREMENT
          ================================================= */}

          <section className="admin-configuration-form-card">

            <div className="admin-configuration-form-card-header">

              <div className="admin-form-section-number">
                01
              </div>

              <div>

                <h2>
                  Requirement & Customer
                </h2>

                <p>
                  Existing solar requirement ko
                  configuration ke saath link karein.
                </p>

              </div>

            </div>

            <div className="admin-configuration-form-grid">

              <Select
                label="Solar Requirement"
                value={
                  form.solarRequirementId
                }
                onChange={(event) =>
                  handleRequirementChange(
                    event.target.value
                  )
                }
                options={
                  requirementOptions
                }
                required
              />

              <Input
                label="Customer Name"
                value={
                  form.customerName
                }
                onChange={(event) =>
                  updateField(
                    "customerName",
                    event.target.value
                  )
                }
                placeholder="Customer name"
              />

              <Select
                label="System Type"
                value={
                  form.systemType
                }
                onChange={(event) =>
                  updateField(
                    "systemType",
                    event.target.value
                  )
                }
                options={[
                  {
                    value:
                      "ON_GRID",
                    label:
                      "On Grid",
                  },
                  {
                    value:
                      "OFF_GRID",
                    label:
                      "Off Grid",
                  },
                  {
                    value:
                      "HYBRID",
                    label:
                      "Hybrid",
                  },
                ]}
                required
              />

              <Input
                label="System Size"
                type="number"
                min="0"
                step="0.01"
                value={
                  form.systemSizeKW
                }
                onChange={(event) =>
                  updateField(
                    "systemSizeKW",
                    event.target.value
                  )
                }
                placeholder="e.g. 5"
                suffix="kW"
                required
              />

            </div>

          </section>

          {/* =================================================
              02 SOLAR PANELS
          ================================================= */}

          <section className="admin-configuration-form-card">

            <div className="admin-configuration-form-card-header">

              <div className="admin-form-section-number">
                02
              </div>

              <div>

                <h2>
                  Solar Panel Configuration
                </h2>

                <p>
                  Panel make, wattage aur total panel
                  quantity define karein.
                </p>

              </div>

            </div>

            <div className="admin-configuration-form-grid">

              <Input
                label="Panel Make"
                value={
                  form.panelMake
                }
                onChange={(event) =>
                  updateField(
                    "panelMake",
                    event.target.value
                  )
                }
                placeholder="e.g. Adani, Waaree, Tata"
              />

              <Input
                label="Panel Wattage"
                type="number"
                min="0"
                value={
                  form.panelWattage
                }
                onChange={(event) =>
                  updateField(
                    "panelWattage",
                    event.target.value
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
                  value={
                    form.panelCount
                  }
                  onChange={(event) =>
                    updateField(
                      "panelCount",
                      event.target.value
                    )
                  }
                  placeholder="e.g. 10"
                />

                <button
                  type="button"
                  className="admin-calculate-button"
                  onClick={
                    calculatePanelCount
                  }
                >
                  Calculate
                </button>

              </div>

            </div>

          </section>

          {/* =================================================
              03 INVERTER
          ================================================= */}

          <section className="admin-configuration-form-card">

            <div className="admin-configuration-form-card-header">

              <div className="admin-form-section-number">
                03
              </div>

              <div>

                <h2>
                  Inverter Configuration
                </h2>

                <p>
                  Inverter brand, capacity aur quantity
                  configure karein.
                </p>

              </div>

            </div>

            <div className="admin-configuration-form-grid">

              <Input
                label="Inverter Make"
                value={
                  form.inverterMake
                }
                onChange={(event) =>
                  updateField(
                    "inverterMake",
                    event.target.value
                  )
                }
                placeholder="e.g. Luminous, Growatt"
              />

              <Input
                label="Inverter Capacity"
                value={
                  form.inverterCapacity
                }
                onChange={(event) =>
                  updateField(
                    "inverterCapacity",
                    event.target.value
                  )
                }
                placeholder="e.g. 5 kW"
              />

              <Input
                label="Inverter Count"
                type="number"
                min="1"
                value={
                  form.inverterCount
                }
                onChange={(event) =>
                  updateField(
                    "inverterCount",
                    event.target.value
                  )
                }
                placeholder="1"
              />

            </div>

          </section>

          {/* =================================================
              04 BATTERY
          ================================================= */}

          <section className="admin-configuration-form-card">

            <div className="admin-configuration-form-card-header">

              <div className="admin-form-section-number">
                04
              </div>

              <div>

                <h2>
                  Battery Configuration
                </h2>

                <p>
                  Backup ke liye battery requirement
                  define karein.
                </p>

              </div>

            </div>

            <div className="admin-configuration-form-grid">

              <Select
                label="Battery Required"
                value={
                  form.batteryRequired
                }
                onChange={(event) =>
                  updateField(
                    "batteryRequired",
                    event.target.value
                  )
                }
                options={[
                  {
                    value:
                      "NO",
                    label:
                      "No",
                  },
                  {
                    value:
                      "YES",
                    label:
                      "Yes",
                  },
                ]}
              />

              {form.batteryRequired ===
                "YES" && (
                <Input
                  label="Battery Capacity"
                  value={
                    form.batteryCapacity
                  }
                  onChange={(event) =>
                    updateField(
                      "batteryCapacity",
                      event.target.value
                    )
                  }
                  placeholder="e.g. 10 kWh"
                  required
                />
              )}

            </div>

          </section>

          {/* =================================================
              05 TECHNICAL
          ================================================= */}

          <section className="admin-configuration-form-card">

            <div className="admin-configuration-form-card-header">

              <div className="admin-form-section-number">
                05
              </div>

              <div>

                <h2>
                  Technical Specifications
                </h2>

                <p>
                  Installation aur electrical
                  specifications add karein.
                </p>

              </div>

            </div>

            <div className="admin-configuration-form-grid">

              <Input
                label="Mounting Structure"
                value={
                  form.mountingStructure
                }
                onChange={(event) =>
                  updateField(
                    "mountingStructure",
                    event.target.value
                  )
                }
                placeholder="e.g. GI / Aluminium"
              />

              <Input
                label="Cable Specification"
                value={
                  form.cableSpecification
                }
                onChange={(event) =>
                  updateField(
                    "cableSpecification",
                    event.target.value
                  )
                }
                placeholder="e.g. 4 sq.mm DC cable"
              />

              <Input
                label="Earthing"
                value={
                  form.earthing
                }
                onChange={(event) =>
                  updateField(
                    "earthing",
                    event.target.value
                  )
                }
                placeholder="e.g. 2 dedicated earth pits"
              />

              <Input
                label="Protection"
                value={
                  form.protection
                }
                onChange={(event) =>
                  updateField(
                    "protection",
                    event.target.value
                  )
                }
                placeholder="e.g. DCDB / ACDB / SPD"
              />

              <Input
                label="Installation Type"
                value={
                  form.installationType
                }
                onChange={(event) =>
                  updateField(
                    "installationType",
                    event.target.value
                  )
                }
                placeholder="e.g. Rooftop"
              />

            </div>

          </section>

          {/* =================================================
              06 GENERATION
          ================================================= */}

          <section className="admin-configuration-form-card">

            <div className="admin-configuration-form-card-header">

              <div className="admin-form-section-number">
                06
              </div>

              <div>

                <h2>
                  Generation Estimate
                </h2>

                <p>
                  Expected solar generation details
                  record karein.
                </p>

              </div>

            </div>

            <div className="admin-configuration-form-grid">

              <Input
                label="Generation Estimate"
                value={
                  form.generationEstimate
                }
                onChange={(event) =>
                  updateField(
                    "generationEstimate",
                    event.target.value
                  )
                }
                placeholder="e.g. 4.5 units/day"
              />

              <Input
                label="Annual Generation"
                value={
                  form.annualGeneration
                }
                onChange={(event) =>
                  updateField(
                    "annualGeneration",
                    event.target.value
                  )
                }
                placeholder="e.g. 6500 units/year"
              />

            </div>

          </section>

          {/* =================================================
              07 NOTES
          ================================================= */}

          <section className="admin-configuration-form-card">

            <div className="admin-configuration-form-card-header">

              <div className="admin-form-section-number">
                07
              </div>

              <div>

                <h2>
                  Additional Notes
                </h2>

                <p>
                  Configuration se related additional
                  information add karein.
                </p>

              </div>

            </div>

            <div className="admin-configuration-textarea">

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
                placeholder="Additional technical notes..."
                rows={5}
              />

            </div>

          </section>

          {/* =================================================
              ACTIONS
          ================================================= */}

          <div className="admin-create-configuration-actions">

            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                router.push(
                  "/admin/system-configurations"
                )
              }
              disabled={
                saving
              }
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              disabled={
                saving
              }
            >
              {saving
                ? "Creating..."
                : "Create Configuration"}
            </Button>

          </div>

        </form>

      </div>
    );
  };

export default CreateSystemConfigurationPage;