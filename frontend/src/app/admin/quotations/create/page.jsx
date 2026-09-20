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
import { quotationService } from "@/services/quotation.service";
import { customerService } from "@/services/customer.service";
import systemConfigurationService from "@/services/systemConfiguration.service";

const CreateQuotationPage = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [customers, setCustomers] = useState([]);
  const [configurations, setConfigurations] = useState([]);

  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    customerId: "",
    systemConfigurationId: "",

    quotationDate: new Date()
      .toISOString()
      .split("T")[0],

    validUntil: "",

    title: "Solar Power System Proposal",

    systemType: "ON_GRID",
    systemSizeKW: "",

    paymentTerms:
      "As per agreed terms mentioned in the quotation.",

    warranty:
      "As per manufacturer warranty and company terms.",

    notes: "",
  });

  const [items, setItems] = useState([
    {
      id: 1,
      description: "Solar PV System",
      quantity: 1,
      unit: "System",
      rate: "",
      taxRate: 0,
    },
  ]);

  const [charges, setCharges] = useState({
    discount: 0,
    additionalCharges: 0,
  });

  const loadInitialData = async () => {
    try {
      setLoadingData(true);
      setError("");

      const [
        customerResponse,
        configurationResponse,
      ] = await Promise.all([
        customerService.getCustomers(),
        systemConfigurationService.getSystemConfigurations(),
      ]);

      const normalize = (response, keys = []) => {
        if (Array.isArray(response)) {
          return response;
        }

        if (Array.isArray(response?.data)) {
          return response.data;
        }

        if (Array.isArray(response?.data?.data)) {
          return response.data.data;
        }

        for (const key of keys) {
          if (Array.isArray(response?.[key])) {
            return response[key];
          }

          if (Array.isArray(response?.data?.[key])) {
            return response.data[key];
          }
        }

        return [];
      };

      setCustomers(
        normalize(customerResponse, [
          "customers",
        ])
      );

      setConfigurations(
        normalize(configurationResponse, [
          "configurations",
          "systemConfigurations",
        ])
      );
    } catch (err) {
      console.error(
        "Failed to load quotation data:",
        err
      );

      setError(
        err?.message ||
          "Customers aur system configurations load nahi ho paaye."
      );
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      loadInitialData();
    }
  }, [authLoading, user]);

  const getId = (item) =>
    item?._id ||
    item?.id ||
    item?.customerId ||
    item?.configurationId;

  const getValue = (
    object,
    keys,
    fallback = ""
  ) => {
    if (!object) return fallback;

    for (const key of keys) {
      const value = object?.[key];

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

  const getName = (item) => {
    if (!item) return "";

    if (typeof item === "string") {
      return item;
    }

    return (
      item?.name ||
      item?.fullName ||
      item?.customerName ||
      item?.companyName ||
      ""
    );
  };

  const customerOptions = useMemo(() => {
    return [
      {
        value: "",
        label: "Select Customer",
      },
      ...customers.map((customer) => ({
        value: getId(customer) || "",
        label:
          getName(customer) ||
          getValue(
            customer,
            ["phone", "mobile"],
            "Customer"
          ),
      })),
    ];
  }, [customers]);

  const configurationOptions = useMemo(() => {
    return [
      {
        value: "",
        label: "Select System Configuration",
      },
      ...configurations.map((configuration) => {
        const id = getId(configuration);

        const number = getValue(
          configuration,
          [
            "configurationNumber",
            "configurationNo",
            "configNumber",
          ],
          ""
        );

        const customer = getName(
          getValue(
            configuration,
            [
              "customer",
              "customerName",
            ],
            null
          )
        );

        const size = getValue(
          configuration,
          [
            "systemSizeKW",
            "requiredKW",
            "capacityKW",
          ],
          ""
        );

        return {
          value: id || "",
          label: [
            number,
            customer,
            size ? `${size} kW` : "",
          ]
            .filter(Boolean)
            .join(" • "),
        };
      }),
    ];
  }, [configurations]);

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleConfigurationChange = (
    configurationId
  ) => {
    const selected =
      configurations.find(
        (configuration) =>
          String(getId(configuration)) ===
          String(configurationId)
      );

    setForm((prev) => ({
      ...prev,
      systemConfigurationId:
        configurationId,
    }));

    if (!selected) return;

    const systemSizeKW = getValue(
      selected,
      [
        "systemSizeKW",
        "requiredKW",
        "capacityKW",
      ],
      ""
    );

    const systemType = getValue(
      selected,
      [
        "systemType",
        "system_type",
        "type",
      ],
      ""
    );

    const customer = getValue(
      selected,
      [
        "customerId",
        "customer",
      ],
      ""
    );

    setForm((prev) => ({
      ...prev,
      systemConfigurationId:
        configurationId,

      systemSizeKW:
        systemSizeKW !== ""
          ? systemSizeKW
          : prev.systemSizeKW,

      systemType:
        systemType || prev.systemType,

      customerId:
        typeof customer === "string"
          ? customer
          : getId(customer) ||
            prev.customerId,
    }));

    const panelMake = getValue(
      selected,
      [
        "panelMake",
        "panelBrand",
        "moduleMake",
      ],
      ""
    );

    const panelWattage = getValue(
      selected,
      [
        "panelWattage",
        "wattage",
        "panelWp",
      ],
      ""
    );

    const panelCount = getValue(
      selected,
      [
        "panelCount",
        "numberOfPanels",
        "panelsCount",
      ],
      ""
    );

    const inverterMake = getValue(
      selected,
      [
        "inverterMake",
        "inverterBrand",
      ],
      ""
    );

    const inverterCapacity =
      getValue(
        selected,
        [
          "inverterCapacity",
          "inverterSize",
        ],
        ""
      );

    const descriptionParts = [
      "Solar PV System",
      systemType,
      systemSizeKW
        ? `${systemSizeKW} kW`
        : "",
      panelMake
        ? `Panel: ${panelMake}`
        : "",
      panelWattage
        ? `${panelWattage}W`
        : "",
      panelCount
        ? `${panelCount} Panels`
        : "",
      inverterMake
        ? `Inverter: ${inverterMake}`
        : "",
      inverterCapacity
        ? inverterCapacity
        : "",
    ].filter(Boolean);

    setItems((prev) => {
      const firstItem = {
        ...prev[0],
        description:
          descriptionParts.join(" • ") ||
          "Solar PV System",
        quantity: 1,
      };

      return [
        firstItem,
        ...prev.slice(1),
      ];
    });
  };

  const handleCustomerChange = (
    customerId
  ) => {
    updateField(
      "customerId",
      customerId
    );
  };

  const updateItem = (
    itemId,
    field,
    value
  ) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: Date.now(),
        description: "",
        quantity: 1,
        unit: "Unit",
        rate: "",
        taxRate: 0,
      },
    ]);
  };

  const removeItem = (itemId) => {
    if (items.length === 1) return;

    setItems((prev) =>
      prev.filter(
        (item) => item.id !== itemId
      )
    );
  };

  const subtotal = useMemo(() => {
    return items.reduce(
      (sum, item) => {
        const quantity =
          Number(item.quantity) || 0;

        const rate =
          Number(item.rate) || 0;

        return sum + quantity * rate;
      },
      0
    );
  }, [items]);

  const taxTotal = useMemo(() => {
    return items.reduce(
      (sum, item) => {
        const quantity =
          Number(item.quantity) || 0;

        const rate =
          Number(item.rate) || 0;

        const taxRate =
          Number(item.taxRate) || 0;

        const lineTotal =
          quantity * rate;

        return (
          sum +
          (lineTotal * taxRate) / 100
        );
      },
      0
    );
  }, [items]);

  const discount = Number(
    charges.discount
  ) || 0;

  const additionalCharges =
    Number(
      charges.additionalCharges
    ) || 0;

  const grandTotal =
    subtotal -
    discount +
    taxTotal +
    additionalCharges;

  const formatCurrency = (value) =>
    `₹${Number(value || 0).toLocaleString(
      "en-IN",
      {
        maximumFractionDigits: 2,
      }
    )}`;

  const validateForm = () => {
    if (!form.customerId) {
      return "Customer select karna required hai.";
    }

    if (!form.systemConfigurationId) {
      return "System Configuration select karna required hai.";
    }

    if (!form.quotationDate) {
      return "Quotation date required hai.";
    }

    if (!form.validUntil) {
      return "Quotation validity date required hai.";
    }

    if (
      new Date(form.validUntil) <
      new Date(form.quotationDate)
    ) {
      return "Valid Until date quotation date se pehle nahi ho sakti.";
    }

    if (
      !form.systemSizeKW ||
      Number(form.systemSizeKW) <= 0
    ) {
      return "Valid system size enter karein.";
    }

    const invalidItem = items.find(
      (item) =>
        !item.description.trim() ||
        Number(item.quantity) <= 0 ||
        Number(item.rate) < 0
    );

    if (invalidItem) {
      return "Quotation items ki details properly fill karein.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        customerId: form.customerId,
        systemConfigurationId:
          form.systemConfigurationId,

        quotationDate:
          form.quotationDate,

        validUntil:
          form.validUntil,

        title: form.title,

        systemType:
          form.systemType,

        systemSizeKW:
          Number(form.systemSizeKW),

        items: items.map((item) => ({
          description:
            item.description,
          quantity:
            Number(item.quantity),
          unit: item.unit,
          rate:
            Number(item.rate),
          taxRate:
            Number(item.taxRate) || 0,
        })),

        discount,
        additionalCharges,

        subtotal,
        taxTotal,
        grandTotal,

        paymentTerms:
          form.paymentTerms,

        warranty:
          form.warranty,

        notes:
          form.notes || undefined,
      };

      await quotationService.createQuotation(
        payload
      );

      router.push("/admin/quotations");
    } catch (err) {
      console.error(
        "Failed to create quotation:",
        err
      );

      setError(
        err?.message ||
          "Quotation create nahi ho paayi."
      );
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <AdminLayout>
        <div className="admin-create-quotation-loading">
          <Loader />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-create-quotation-page">
        {/* Header */}
        <div className="admin-create-quotation-header">
          <div>
            <button
              type="button"
              className="admin-create-quotation-back"
              onClick={() =>
                router.push(
                  "/admin/quotations"
                )
              }
            >
              ← Back to Quotations
            </button>

            <div className="admin-create-quotation-title">
              <div className="admin-create-quotation-icon">
                ₹
              </div>

              <div>
                <h1>
                  Create Quotation
                </h1>

                <p>
                  Customer ke liye professional solar
                  quotation / proposal prepare karein.
                </p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="admin-create-quotation-error">
            <div className="admin-create-quotation-error-icon">
              !
            </div>

            <div>
              <strong>
                Quotation create nahi hui
              </strong>

              <p>{error}</p>
            </div>
          </div>
        )}

        {loadingData ? (
          <div className="admin-create-quotation-loading-card">
            <Loader />

            <p>
              Customers aur system configurations
              load ho rahi hain...
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="admin-create-quotation-form"
          >
            {/* Basic Details */}
            <section className="admin-quotation-form-card">
              <div className="admin-quotation-form-card-header">
                <div className="admin-quotation-section-number">
                  01
                </div>

                <div>
                  <h2>
                    Quotation Details
                  </h2>

                  <p>
                    Quotation aur customer ki basic
                    information.
                  </p>
                </div>
              </div>

              <div className="admin-quotation-form-grid">
                <Select
                  label="Customer"
                  value={form.customerId}
                  onChange={(e) =>
                    handleCustomerChange(
                      e.target.value
                    )
                  }
                  options={
                    customerOptions
                  }
                  required
                />

                <Select
                  label="System Configuration"
                  value={
                    form.systemConfigurationId
                  }
                  onChange={(e) =>
                    handleConfigurationChange(
                      e.target.value
                    )
                  }
                  options={
                    configurationOptions
                  }
                  required
                />

                <Input
                  label="Quotation Date"
                  type="date"
                  value={
                    form.quotationDate
                  }
                  onChange={(e) =>
                    updateField(
                      "quotationDate",
                      e.target.value
                    )
                  }
                  required
                />

                <Input
                  label="Valid Until"
                  type="date"
                  value={
                    form.validUntil
                  }
                  onChange={(e) =>
                    updateField(
                      "validUntil",
                      e.target.value
                    )
                  }
                  required
                />

                <Input
                  label="Quotation Title"
                  value={form.title}
                  onChange={(e) =>
                    updateField(
                      "title",
                      e.target.value
                    )
                  }
                  placeholder="Solar Power System Proposal"
                />

                <Select
                  label="System Type"
                  value={
                    form.systemType
                  }
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
                  value={
                    form.systemSizeKW
                  }
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

            {/* Items */}
            <section className="admin-quotation-form-card">
              <div className="admin-quotation-form-card-header">
                <div className="admin-quotation-section-number">
                  02
                </div>

                <div>
                  <h2>
                    Quotation Items
                  </h2>

                  <p>
                    Solar system ke products/services
                    aur pricing add karein.
                  </p>
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  onClick={addItem}
                >
                  + Add Item
                </Button>
              </div>

              <div className="admin-quotation-items-wrapper">
                <div className="admin-quotation-items-table">
                  <div className="admin-quotation-item-head">
                    <span>
                      Description
                    </span>

                    <span>
                      Qty
                    </span>

                    <span>
                      Unit
                    </span>

                    <span>
                      Rate
                    </span>

                    <span>
                      Tax %
                    </span>

                    <span>
                      Total
                    </span>

                    <span />
                  </div>

                  {items.map((item) => {
                    const lineSubtotal =
                      (Number(
                        item.quantity
                      ) || 0) *
                      (Number(
                        item.rate
                      ) || 0);

                    return (
                      <div
                        className="admin-quotation-item-row"
                        key={item.id}
                      >
                        <Input
                          value={
                            item.description
                          }
                          onChange={(e) =>
                            updateItem(
                              item.id,
                              "description",
                              e.target.value
                            )
                          }
                          placeholder="Product / service description"
                        />

                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={
                            item.quantity
                          }
                          onChange={(e) =>
                            updateItem(
                              item.id,
                              "quantity",
                              e.target.value
                            )
                          }
                        />

                        <Input
                          value={
                            item.unit
                          }
                          onChange={(e) =>
                            updateItem(
                              item.id,
                              "unit",
                              e.target.value
                            )
                          }
                          placeholder="Unit"
                        />

                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={
                            item.rate
                          }
                          onChange={(e) =>
                            updateItem(
                              item.id,
                              "rate",
                              e.target.value
                            )
                          }
                          placeholder="0.00"
                        />

                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={
                            item.taxRate
                          }
                          onChange={(e) =>
                            updateItem(
                              item.id,
                              "taxRate",
                              e.target.value
                            )
                          }
                        />

                        <div className="admin-quotation-line-total">
                          {formatCurrency(
                            lineSubtotal
                          )}
                        </div>

                        <button
                          type="button"
                          className="admin-quotation-remove-item"
                          onClick={() =>
                            removeItem(
                              item.id
                            )
                          }
                          disabled={
                            items.length ===
                            1
                          }
                          title="Remove item"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Pricing */}
            <section className="admin-quotation-form-card">
              <div className="admin-quotation-form-card-header">
                <div className="admin-quotation-section-number">
                  03
                </div>

                <div>
                  <h2>
                    Pricing Summary
                  </h2>

                  <p>
                    Discount, tax aur additional charges
                    ka final calculation.
                  </p>
                </div>
              </div>

              <div className="admin-quotation-pricing-layout">
                <div className="admin-quotation-pricing-inputs">
                  <Input
                    label="Discount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      charges.discount
                    }
                    onChange={(e) =>
                      setCharges(
                        (prev) => ({
                          ...prev,
                          discount:
                            e.target.value,
                        })
                      )
                    }
                    placeholder="0"
                  />

                  <Input
                    label="Additional Charges"
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      charges.additionalCharges
                    }
                    onChange={(e) =>
                      setCharges(
                        (prev) => ({
                          ...prev,
                          additionalCharges:
                            e.target.value,
                        })
                      )
                    }
                    placeholder="0"
                  />
                </div>

                <div className="admin-quotation-total-box">
                  <div>
                    <span>
                      Subtotal
                    </span>

                    <strong>
                      {formatCurrency(
                        subtotal
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Discount
                    </span>

                    <strong>
                      -{" "}
                      {formatCurrency(
                        discount
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Tax
                    </span>

                    <strong>
                      {formatCurrency(
                        taxTotal
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Additional Charges
                    </span>

                    <strong>
                      {formatCurrency(
                        additionalCharges
                      )}
                    </strong>
                  </div>

                  <div className="admin-quotation-grand-total">
                    <span>
                      Grand Total
                    </span>

                    <strong>
                      {formatCurrency(
                        Math.max(
                          0,
                          grandTotal
                        )
                      )}
                    </strong>
                  </div>
                </div>
              </div>
            </section>

            {/* Terms */}
            <section className="admin-quotation-form-card">
              <div className="admin-quotation-form-card-header">
                <div className="admin-quotation-section-number">
                  04
                </div>

                <div>
                  <h2>
                    Terms & Additional Information
                  </h2>

                  <p>
                    Quotation document mein show hone wali
                    important information.
                  </p>
                </div>
              </div>

              <div className="admin-quotation-form-textareas">
                <Textarea
                  label="Payment Terms"
                  value={
                    form.paymentTerms
                  }
                  onChange={(e) =>
                    updateField(
                      "paymentTerms",
                      e.target.value
                    )
                  }
                  rows={4}
                  placeholder="Payment terms..."
                />

                <Textarea
                  label="Warranty"
                  value={
                    form.warranty
                  }
                  onChange={(e) =>
                    updateField(
                      "warranty",
                      e.target.value
                    )
                  }
                  rows={4}
                  placeholder="Warranty details..."
                />

                <Textarea
                  label="Additional Notes"
                  value={
                    form.notes
                  }
                  onChange={(e) =>
                    updateField(
                      "notes",
                      e.target.value
                    )
                  }
                  rows={5}
                  placeholder="Additional quotation notes..."
                />
              </div>
            </section>

            {/* Actions */}
            <div className="admin-create-quotation-actions">
              <div className="admin-create-quotation-final">
                <span>
                  Final Quotation Value
                </span>

                <strong>
                  {formatCurrency(
                    Math.max(
                      0,
                      grandTotal
                    )
                  )}
                </strong>
              </div>

              <div className="admin-create-quotation-buttons">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={saving}
                  onClick={() =>
                    router.push(
                      "/admin/quotations"
                    )
                  }
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
                    : "Create Quotation"}
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
};

export default CreateQuotationPage;