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
import { customerService } from "@/services/customer.service";

import "./create-configuration.css";

/* =========================================================
   HELPERS
========================================================= */

const getId = (item) => {
  if (!item) return "";

  if (typeof item === "string") {
    return item;
  }

  return (
    item?._id ||
    item?.id ||
    item?.customerId ||
    item?.customerID ||
    item?.requirementId ||
    item?.requirementID ||
    item?.leadId ||
    item?.leadID ||
    ""
  );
};

const getNestedValue = (object, path) => {
  if (!object || !path) return undefined;

  return path
    .split(".")
    .reduce(
      (current, key) =>
        current !== undefined &&
        current !== null
          ? current[key]
          : undefined,
      object
    );
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
    const value = key.includes(".")
      ? getNestedValue(object, key)
      : object?.[key];

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

const normalizeList = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.data)) {
    return response.data.data;
  }

  if (Array.isArray(response?.data?.requirements)) {
    return response.data.requirements;
  }

  if (Array.isArray(response?.requirements)) {
    return response.requirements;
  }

  return [];
};

const toNumber = (value, fallback = 0) => {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
};

const roundNumber = (value) => {
  return Math.round(
    (Number(value) || 0) * 100
  ) / 100;
};

/* =========================================================
   INITIAL FORM
========================================================= */

const INITIAL_FORM = {
  solarRequirementId: "",
  leadId: "",
  customerId: "",
  customerName: "",

  systemType: "ON_GRID",
  systemSizeKW: "",
  phase: "THREE_PHASE",

  panelMake: "",
  panelModel: "",
  panelWattage: "",
  panelCount: "",

  inverterMake: "",
  inverterModel: "",
  inverterCapacity: "",
  inverterCount: "1",

  batteryRequired: "NO",
  batteryMake: "",
  batteryModel: "",
  batteryCapacity: "",
  batteryCount: "1",

  mountingStructure: "",

  cableSpecification: "",
  earthing: "",
  protection: "",

  installationType: "",

  generationEstimate: "",
  annualGeneration: "",

  installationCost: "",
  transportationCost: "",
  otherCost: "",
  discount: "",
  taxPercentage: "0",

  notes: "",
};

/* =========================================================
   PAGE
========================================================= */

const CreateSystemConfigurationPage = () => {
  const router = useRouter();

  const [requirements, setRequirements] = useState([]);

  const [customers, setCustomers] = useState([]);

  const [
    loadingRequirements,
    setLoadingRequirements,
  ] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [form, setForm] = useState(
    INITIAL_FORM
  );

  /* =======================================================
     LOAD SOLAR REQUIREMENTS
  ======================================================= */

  const loadRequirements = async () => {
    try {
      setLoadingRequirements(true);
      setError("");

      const [
        requirementsResponse,
        customersResponse,
      ] = await Promise.all([
        solarRequirementService.getSolarRequirements(),
        customerService.getCustomers(),
      ]);

      const requirementList =
        normalizeList(requirementsResponse);

      const customerList =
        Array.isArray(customersResponse)
          ? customersResponse
          : Array.isArray(customersResponse?.data)
          ? customersResponse.data
          : Array.isArray(customersResponse?.data?.data)
          ? customersResponse.data.data
          : Array.isArray(customersResponse?.customers)
          ? customersResponse.customers
          : Array.isArray(
              customersResponse?.data?.customers
            )
          ? customersResponse.data.customers
          : Array.isArray(customersResponse?.results)
          ? customersResponse.results
          : Array.isArray(
              customersResponse?.data?.results
            )
          ? customersResponse.data.results
          : [];

      setRequirements(requirementList);
      setCustomers(customerList);
    } catch (err) {
      console.error(
        "Solar requirements/customer load error:",
        err
      );

      setRequirements([]);
      setCustomers([]);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load solar requirements and customers."
      );
    } finally {
      setLoadingRequirements(false);
    }
  };

  useEffect(() => {
    loadRequirements();
  }, []);

  const getCustomerNameFromAnySource = (
    requirement,
    customerList = []
  ) => {
    if (!requirement) {
      return "Customer";
    }

    const directName = getValue(
      requirement,
      [
        "customerName",
        "fullName",
        "name",
        "customerDetails.name",
        "customer.fullName",
        "customer.name",
        "customer.customerName",
        "customerDetails.fullName",
        "customerDetails.customerName",
      ],
      ""
    );

    if (
      directName &&
      typeof directName !== "object"
    ) {
      const name = String(directName).trim();

      if (
        name &&
        name.toLowerCase() !== "customer"
      ) {
        return name;
      }
    }

    const customerObject =
      requirement?.customer;

    if (
      customerObject &&
      typeof customerObject === "object"
    ) {
      const objectName =
        customerObject?.name ||
        customerObject?.fullName ||
        customerObject?.customerName ||
        customerObject?.companyName ||
        customerObject?.user?.name ||
        customerObject?.user?.fullName ||
        customerObject?.contact?.name ||
        customerObject?.contact?.fullName;

      if (objectName) {
        return String(objectName);
      }
    }

    const customerReference =
      requirement?.customerId ||
      requirement?.customer ||
      requirement?.customerDetails?._id ||
      requirement?.customerDetails?.id;

    const customerId =
      getId(customerReference);

    if (customerId) {
      const matchedCustomer =
        customerList.find(
          (customer) =>
            String(getId(customer)) ===
            String(customerId)
        );

      if (matchedCustomer) {
        const matchedName =
          matchedCustomer?.name ||
          matchedCustomer?.fullName ||
          matchedCustomer?.customerName ||
          matchedCustomer?.companyName ||
          matchedCustomer?.user?.name ||
          matchedCustomer?.user?.fullName ||
          matchedCustomer?.contact?.name ||
          matchedCustomer?.contact?.fullName;

        if (matchedName) {
          return String(matchedName);
        }
      }
    }

    const leadObject = requirement?.lead;

    if (
      leadObject &&
      typeof leadObject === "object"
    ) {
      const leadObjectName =
        leadObject?.customerName ||
        leadObject?.fullName ||
        leadObject?.name ||
        leadObject?.customer?.name ||
        leadObject?.customer?.fullName ||
        leadObject?.customer?.customerName;

      if (leadObjectName) {
        return String(leadObjectName);
      }
    }

    const leadName = getValue(
      requirement,
      [
        "lead.customerName",
        "lead.fullName",
        "lead.name",
        "lead.customer.name",
        "lead.customer.fullName",
        "leadDetails.customerName",
        "leadDetails.fullName",
        "leadDetails.name",
      ],
      ""
    );

    if (
      leadName &&
      typeof leadName !== "object"
    ) {
      const name = String(leadName).trim();

      if (name) {
        return name;
      }
    }

    return "Customer";
  };

  /* =======================================================
     REQUIREMENT OPTIONS
  ======================================================= */

  const requirementOptions = useMemo(() => {
    return [
      {
        value: "",
        label: "Select Solar Requirement",
      },

      ...requirements.map((requirement) => {
        const id = getId(requirement);

        const customerName =
          getCustomerNameFromAnySource(
            requirement,
            customers
          );

        const requiredKW = getValue(
          requirement,
          [
            "requiredKw",
            "requiredKW",
            "requiredKWP",
            "systemSizeKW",
            "capacityKW",
            "requiredCapacity",
            "solarCapacity",
            "capacity",
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
                "requirementCode",
              ],
              ""
            ),
            ""
          );

        const parts = [];

        if (requirementNumber) {
          parts.push(requirementNumber);
        }

        if (customerName) {
          parts.push(customerName);
        }

        if (
          requiredKW !== "" &&
          requiredKW !== null &&
          requiredKW !== undefined
        ) {
          parts.push(`${requiredKW} kW`);
        }

        return {
          value: id || "",
          label:
            parts.length > 0
              ? parts.join(" • ")
              : "Unnamed Customer",
        };
      }),
    ];
  }, [requirements, customers]);

  /* =======================================================
     UPDATE FIELD
  ======================================================= */

  const updateField = (
    field,
    value
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    if (error) {
      setError("");
    }
  };

  /* =======================================================
     REQUIREMENT CHANGE
  ======================================================= */

  const handleRequirementChange = (
    value
  ) => {
    const selected =
      requirements.find(
        (requirement) =>
          String(
            getId(requirement)
          ) === String(value)
      );

    if (!selected) {
      updateField(
        "solarRequirementId",
        value
      );
      return;
    }

    const customerName =
      getCustomerNameFromAnySource(
        selected,
        customers
      );

    const customerObject =
      selected?.customer;

    let customerId =
      typeof customerObject === "object"
        ? getId(customerObject)
        : getValue(
            selected,
            [
              "customerId",
              "customerID",
            ],
            ""
          );

    if (!customerId) {
      const customerReference =
        selected?.customerId ||
        selected?.customer ||
        selected?.customerDetails;

      customerId =
        getId(customerReference);
    }

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
      getId(leadValue);

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
      String(systemTypeValue)
        .toUpperCase()
        .replace(/-/g, "_");

    setForm((previous) => ({
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
          ? String(requiredKW)
          : previous.systemSizeKW,

      systemType: [
        "ON_GRID",
        "OFF_GRID",
        "HYBRID",
      ].includes(
        normalizedSystemType
      )
        ? normalizedSystemType
        : previous.systemType,
    }));

    setError("");
  };

  /* =======================================================
     AUTO PANEL COUNT
  ======================================================= */

  const calculatePanelCount = () => {
    const size =
      Number(form.systemSizeKW);

    const wattage =
      Number(form.panelWattage);

    if (
      !Number.isFinite(size) ||
      !Number.isFinite(wattage) ||
      size <= 0 ||
      wattage <= 0
    ) {
      setError(
        "Please enter a valid system size and panel wattage to calculate the panel count."
      );

      return;
    }

    const count = Math.ceil(
      (size * 1000) / wattage
    );

    setForm((previous) => ({
      ...previous,
      panelCount: String(count),
    }));

    setError("");
  };

  /*
   * When both system size and panel wattage are available
   * the panel count will be calculated automatically.
   */
  useEffect(() => {
    const size =
      Number(form.systemSizeKW);

    const wattage =
      Number(form.panelWattage);

    if (
      Number.isFinite(size) &&
      Number.isFinite(wattage) &&
      size > 0 &&
      wattage > 0
    ) {
      const count = Math.ceil(
        (size * 1000) / wattage
      );

      setForm((previous) => {
        if (
          String(previous.panelCount) ===
          String(count)
        ) {
          return previous;
        }

        return {
          ...previous,
          panelCount: String(count),
        };
      });
    }
  }, [
    form.systemSizeKW,
    form.panelWattage,
  ]);

  /* =======================================================
     VALIDATION
  ======================================================= */

  const validateForm = () => {
    if (!form.solarRequirementId) {
      return "Solar Requirement is required.";
    }

    if (!form.leadId) {
      return "The selected Solar Requirement is not linked to a Lead.";
    }

    if (!form.systemType) {
      return "Please select a System Type.";
    }

    if (
      !form.systemSizeKW ||
      Number(form.systemSizeKW) <= 0
    ) {
      return "Please enter a valid system size.";
    }

    if (
      !form.panelMake.trim()
    ) {
      return "Please enter the Panel Make.";
    }

    if (
      !form.panelWattage ||
      Number(form.panelWattage) <= 0
    ) {
      return "Please enter a valid Panel Wattage.";
    }

    if (
      !form.panelCount ||
      Number(form.panelCount) <= 0
    ) {
      return "Please enter a valid Panel Count.";
    }

    if (
      !form.inverterMake.trim()
    ) {
      return "Please enter the Inverter Make.";
    }

    if (
      !form.inverterCapacity ||
      Number(form.inverterCapacity) <= 0
    ) {
      return "Please enter a valid Inverter Capacity.";
    }

    if (
      !form.inverterCount ||
      Number(form.inverterCount) <= 0
    ) {
      return "Please enter a valid Inverter Count.";
    }

    if (
      form.batteryRequired ===
      "YES"
    ) {
      if (
        !form.batteryCapacity ||
        Number(form.batteryCapacity) <= 0
      ) {
        return "Please enter a valid battery capacity when battery backup is required.";
      }

      if (
        !form.batteryCount ||
        Number(form.batteryCount) <= 0
      ) {
        return "Please enter a valid Battery Count.";
      }
    }

    if (
      Number(form.installationCost) < 0 ||
      Number(form.transportationCost) < 0 ||
      Number(form.otherCost) < 0 ||
      Number(form.discount) < 0 ||
      Number(form.taxPercentage) < 0
    ) {
      return "Pricing values cannot be negative.";
    }

    return "";
  };

  /* =======================================================
     COMPONENT BUILDER
  ======================================================= */

  const buildComponents = () => {
    const components = [];

    /* ---------------- PANEL ---------------- */

    components.push({
      componentType: "SOLAR_PANEL",
      name: form.panelMake.trim(),
      brand: form.panelMake.trim(),
      model:
        form.panelModel.trim() ||
        undefined,
      quantity: Number(
        form.panelCount
      ),
      unit: "PCS",
      capacity: Number(
        form.panelWattage
      ),
      capacityUnit: "W",
      unitPrice: 0,
      totalPrice: 0,
      specifications: {
        wattage: Number(
          form.panelWattage
        ),
      },
    });

    /* ---------------- INVERTER ---------------- */

    components.push({
      componentType: "INVERTER",
      name: form.inverterMake.trim(),
      brand: form.inverterMake.trim(),
      model:
        form.inverterModel.trim() ||
        undefined,
      quantity: Number(
        form.inverterCount
      ),
      unit: "PCS",
      capacity: Number(
        form.inverterCapacity
      ),
      capacityUnit: "KW",
      unitPrice: 0,
      totalPrice: 0,
      specifications: {
        capacity: Number(
          form.inverterCapacity
        ),
      },
    });

    /* ---------------- BATTERY ---------------- */

    if (
      form.batteryRequired ===
      "YES"
    ) {
      components.push({
        componentType: "BATTERY",
        name:
          form.batteryMake.trim() ||
          "Battery",
        brand:
          form.batteryMake.trim() ||
          undefined,
        model:
          form.batteryModel.trim() ||
          undefined,
        quantity: Number(
          form.batteryCount
        ),
        unit: "PCS",
        capacity: Number(
          form.batteryCapacity
        ),
        capacityUnit: "KWH",
        unitPrice: 0,
        totalPrice: 0,
        specifications: {
          required: true,
        },
      });
    }

    /* ---------------- STRUCTURE ---------------- */

    if (
      form.mountingStructure.trim()
    ) {
      components.push({
        componentType: "STRUCTURE",
        name:
          form.mountingStructure.trim(),
        quantity: 1,
        unit: "JOB",
        unitPrice: 0,
        totalPrice: 0,
      });
    }

    /* ---------------- ACCESSORIES ---------------- */

    if (
      form.cableSpecification.trim()
    ) {
      components.push({
        componentType: "ACCESSORY",
        name: "Solar Cable",
        quantity: 1,
        unit: "SET",
        unitPrice: 0,
        totalPrice: 0,
        specifications: {
          cable:
            form.cableSpecification.trim(),
        },
      });
    }

    if (
      form.earthing.trim()
    ) {
      components.push({
        componentType: "ACCESSORY",
        name: "Earthing",
        quantity: 1,
        unit: "SET",
        unitPrice: 0,
        totalPrice: 0,
        specifications: {
          earthing:
            form.earthing.trim(),
        },
      });
    }

    if (
      form.protection.trim()
    ) {
      components.push({
        componentType: "ACCESSORY",
        name: "Protection",
        quantity: 1,
        unit: "SET",
        unitPrice: 0,
        totalPrice: 0,
        specifications: {
          protection:
            form.protection.trim(),
        },
      });
    }

    return components;
  };

  /* =======================================================
     SUBMIT
  ======================================================= */

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    const validationError =
      validateForm();

    if (validationError) {
      setError(
        validationError
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    try {
      setSaving(true);
      setError("");

      const components =
        buildComponents();

      /*
       * Backend canonical structure:
       *
       * lead
       * solarRequirement
       * customer
       * systemCapacity
       * capacityUnit
       * systemType
       * phase
       * panelCount
       * inverterCount
       * batteryCount
       * components
       * installationCost
       * transportationCost
       * otherCost
       * discount
       * taxPercentage
       * status
       * notes
       */

      const payload = {
        lead: form.leadId,

        solarRequirement:
          form.solarRequirementId,

        customer:
          form.customerId ||
          undefined,

        systemCapacity:
          Number(form.systemSizeKW),

        capacityUnit: "KW",

        systemType:
          form.systemType,

        phase:
          form.phase,

        panelCount:
          Number(form.panelCount),

        inverterCount:
          Number(form.inverterCount),

        batteryCount:
          form.batteryRequired ===
          "YES"
            ? Number(
                form.batteryCount
              )
            : 0,

        components,

        installationCost:
          toNumber(
            form.installationCost
          ),

        transportationCost:
          toNumber(
            form.transportationCost
          ),

        otherCost:
          toNumber(
            form.otherCost
          ),

        discount:
          toNumber(
            form.discount
          ),

        taxPercentage:
          toNumber(
            form.taxPercentage
          ),

        status: "CONFIGURED",

        notes: [
          form.installationType
            ? `Installation Type: ${form.installationType}`
            : "",

          form.generationEstimate
            ? `Generation Estimate: ${form.generationEstimate}`
            : "",

          form.annualGeneration
            ? `Annual Generation: ${form.annualGeneration}`
            : "",

          form.notes.trim(),
        ]
          .filter(Boolean)
          .join("\n"),
      };

      console.log(
        "SYSTEM CONFIGURATION PAYLOAD:",
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
        "SYSTEM CONFIGURATION ERROR:",
        err
      );

      console.error(
        "STATUS:",
        err?.response?.status
      );

      console.error(
        "DATA:",
        err?.response?.data
      );

      const backendErrors =
        err?.response?.data?.errors;

      let errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to create the system configuration.";

      if (
        Array.isArray(
          backendErrors
        ) &&
        backendErrors.length
      ) {
        errorMessage =
          backendErrors
            .map((item) =>
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

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loadingRequirements) {
    return (
      <div className="admin-create-configuration-loading">
        <Loader />

        <div
          className="admin-create-configuration-loading-card"
          style={{
            position: "absolute",
            opacity: 0,
            pointerEvents: "none",
          }}
        >
          <p>
            Loading solar requirements...
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="admin-create-configuration-page">

      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="admin-create-configuration-header">

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
              Create the based on the solar requirement
              based on the solar requirement
              based on the solar requirement.
            </p>
          </div>

        </div>

      </div>

      {/* ===================================================
          ERROR
      =================================================== */}

      {error && (
        <div className="admin-create-configuration-error">

          <div className="admin-create-configuration-error-icon">
            !
          </div>

          <div>
            <strong>
              Configuration could not be created
            </strong>

            <p>
              {error}
            </p>
          </div>

        </div>
      )}

      {/* ===================================================
          FORM
      =================================================== */}

      <form
        onSubmit={handleSubmit}
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
                Requirement & Customer Details
              </h2>

              <p>
                Existing solar requirement ko
                Link the existing solar requirement to this configuration.
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

            <Select
              label="Phase"
              value={
                form.phase
              }
              onChange={(event) =>
                updateField(
                  "phase",
                  event.target.value
                )
              }
              options={[
                {
                  value:
                    "SINGLE_PHASE",
                  label:
                    "Single Phase",
                },
                {
                  value:
                    "THREE_PHASE",
                  label:
                    "Three Phase",
                },
              ]}
            />

          </div>

        </section>

        {/* =================================================
            02 SOLAR PANEL
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
                Panel brand, model, wattage, and
                Define the panel brand, model, wattage, and total quantity.
              </p>
            </div>

          </div>

          <div className="admin-configuration-form-grid">

            <Input
              label="Panel Make / Brand"
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
              required
            />

            <Input
              label="Panel Model"
              value={
                form.panelModel
              }
              onChange={(event) =>
                updateField(
                  "panelModel",
                  event.target.value
                )
              }
              placeholder="Panel model"
            />

            <Input
              label="Panel Wattage"
              type="number"
              min="1"
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
              required
            />

            <div className="admin-panel-count-field">

              <Input
                label="Panel Count"
                type="number"
                min="1"
                value={
                  form.panelCount
                }
                onChange={(event) =>
                  updateField(
                    "panelCount",
                    event.target.value
                  )
                }
                placeholder="Calculated automatically"
                required
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
                Inverter brand, model, capacity
                Configure the inverter brand, model, capacity, and quantity.
              </p>
            </div>

          </div>

          <div className="admin-configuration-form-grid">

            <Input
              label="Inverter Make / Brand"
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
              required
            />

            <Input
              label="Inverter Model"
              value={
                form.inverterModel
              }
              onChange={(event) =>
                updateField(
                  "inverterModel",
                  event.target.value
                )
              }
              placeholder="Inverter model"
            />

            <Input
              label="Inverter Capacity"
              type="number"
              min="0"
              step="0.01"
              value={
                form.inverterCapacity
              }
              onChange={(event) =>
                updateField(
                  "inverterCapacity",
                  event.target.value
                )
              }
              placeholder="e.g. 5"
              suffix="kW"
              required
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
              required
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
                Define the battery
                backup requirement.
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
              <>
                <Input
                  label="Battery Make / Brand"
                  value={
                    form.batteryMake
                  }
                  onChange={(event) =>
                    updateField(
                      "batteryMake",
                      event.target.value
                    )
                  }
                  placeholder="Battery brand"
                />

                <Input
                  label="Battery Model"
                  value={
                    form.batteryModel
                  }
                  onChange={(event) =>
                    updateField(
                      "batteryModel",
                      event.target.value
                    )
                  }
                  placeholder="Battery model"
                />

                <Input
                  label="Battery Capacity"
                  type="number"
                  min="0"
                  step="0.01"
                  value={
                    form.batteryCapacity
                  }
                  onChange={(event) =>
                    updateField(
                      "batteryCapacity",
                      event.target.value
                    )
                  }
                  placeholder="e.g. 10"
                  suffix="kWh"
                  required
                />

                <Input
                  label="Battery Count"
                  type="number"
                  min="1"
                  value={
                    form.batteryCount
                  }
                  onChange={(event) =>
                    updateField(
                      "batteryCount",
                      event.target.value
                    )
                  }
                  placeholder="1"
                  required
                />
              </>
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
                Structure, cable, earthing, and
                Add structure, cable, earthing, and protection details.
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
                Expected solar generation ki
                Record the expected solar generation details.
              </p>
            </div>

          </div>

          <div className="admin-configuration-form-grid">

            <Input
              label="Daily Generation Estimate"
              value={
                form.generationEstimate
              }
              onChange={(event) =>
                updateField(
                  "generationEstimate",
                  event.target.value
                )
              }
              placeholder="e.g. 20 units/day"
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
            07 PRICING
        ================================================= */}

        <section className="admin-configuration-form-card">

          <div className="admin-configuration-form-card-header">

            <div className="admin-form-section-number">
              07
            </div>

            <div>
              <h2>
                Pricing & GST
              </h2>

              <p>
                Installation, transportation,
                Enter installation, transportation, discount, and GST details.
              </p>
            </div>

          </div>

          <div className="admin-configuration-form-grid">

            <Input
              label="Installation Cost"
              type="number"
              min="0"
              step="0.01"
              value={
                form.installationCost
              }
              onChange={(event) =>
                updateField(
                  "installationCost",
                  event.target.value
                )
              }
              placeholder="0"
              suffix="₹"
            />

            <Input
              label="Transportation Cost"
              type="number"
              min="0"
              step="0.01"
              value={
                form.transportationCost
              }
              onChange={(event) =>
                updateField(
                  "transportationCost",
                  event.target.value
                )
              }
              placeholder="0"
              suffix="₹"
            />

            <Input
              label="Other Cost"
              type="number"
              min="0"
              step="0.01"
              value={
                form.otherCost
              }
              onChange={(event) =>
                updateField(
                  "otherCost",
                  event.target.value
                )
              }
              placeholder="0"
              suffix="₹"
            />

            <Input
              label="Discount"
              type="number"
              min="0"
              step="0.01"
              value={
                form.discount
              }
              onChange={(event) =>
                updateField(
                  "discount",
                  event.target.value
                )
              }
              placeholder="0"
              suffix="₹"
            />

            <Input
              label="GST / Tax"
              type="number"
              min="0"
              step="0.01"
              value={
                form.taxPercentage
              }
              onChange={(event) =>
                updateField(
                  "taxPercentage",
                  event.target.value
                )
              }
              placeholder="18"
              suffix="%"
            />

          </div>

        </section>

        {/* =================================================
            08 NOTES
        ================================================= */}

        <section className="admin-configuration-form-card">

          <div className="admin-configuration-form-card-header">

            <div className="admin-form-section-number">
              08
            </div>

            <div>
              <h2>
                Additional Notes
              </h2>

              <p>
                Add additional information related to the configuration.
                Add additional information related to the configuration.
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
              ? "Creating configuration..."
              : "Create System Configuration"}
          </Button>

        </div>

      </form>
    </div>
  );
};

export default CreateSystemConfigurationPage;