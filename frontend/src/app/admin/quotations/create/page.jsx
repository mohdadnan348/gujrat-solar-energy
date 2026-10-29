"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Loader from "@/components/common/Loader";
import { quotationService } from "@/services/quotation.service";
import { customerService } from "@/services/customer.service";
import "./create-quotation.css";
 const Field = ({ label, children, required = false }) => (
    <label className="inline-q-field">
      <span>
        {label}
        {required ? " *" : ""}
      </span>
      {children}
    </label>
  );
const today = () => new Date().toISOString().slice(0, 10);
const initialCustomer = {
  name: "",
  mobile: "",
  email: "",
  companyName: "",
  address: "",
  city: "",
  state: "Uttar Pradesh",
  pincode: "",
  siteAddress: "",
  customerType: "Individual",
  gstNumber: "",
};
const initialRequirement = {
  monthlyBill: "",
  monthlyUnits: "",
  roofType: "RCC",
  roofArea: "",
  siteAddress: "",
  location: "",
  connectionType: "THREE_PHASE",
  sanctionedLoad: "",
  batteryRequired: "false",
  batteryCapacity: "",
  siteSurveyRequired: "true",
  notes: "",
};
const initialConfiguration = {
  phase: "THREE_PHASE",
  panelMake: "",
  panelModel: "",
  panelWattage: "540",
  panelCount: "",
  inverterMake: "",
  inverterModel: "",
  inverterCapacity: "",
  batteryMake: "",
  batteryModel: "",
  mountingStructure: "GI",
  installationCost: "",
  transportationCost: "",
  otherCost: "",
};
const newItem = () => ({
  id: `${Date.now()}-${Math.random()}`,
  description: "Solar PV System",
  quantity: "1",
  unit: "System",
  rate: "",
  taxRate: "0",
});
const unwrapList = (response, keys = []) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  for (const key of keys) {
    if (Array.isArray(response?.[key])) return response[key];
    if (Array.isArray(response?.data?.[key])) return response.data[key];
  }
  return [];
};
const idOf = (value) =>
  typeof value === "string" ? value : value?._id || value?.id || "";
const money = (n) =>
  `₹${(Number(n) || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

export default function CreateQuotationPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [customer, setCustomer] = useState(initialCustomer);
  const [form, setForm] = useState({
    quotationDate: today(),
    validUntil: "",
    title: "Solar Power System Proposal",
    systemType: "ON_GRID",
    systemSizeKW: "",
    paymentTerms: "As per agreed terms mentioned in the quotation.",
    warranty: "As per manufacturer warranty and company terms.",
    notes: "",
  });
  const [requirement, setRequirement] = useState(initialRequirement);
  const [configuration, setConfiguration] = useState(initialConfiguration);
  const [items, setItems] = useState([newItem()]);
  const [discount, setDiscount] = useState("0");

  useEffect(() => {
    (async () => {
      try {
        const response = await customerService.getCustomers({
          page: 1,
          limit: 500,
        });
        setCustomers(unwrapList(response, ["customers", "items"]));
      } catch (e) {
        setError(
          e?.response?.data?.message ||
            "Customer list load nahi ho paayi. Aap naya customer create kar sakte hain.",
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const selectedCustomer = customers.find(
    (c) => String(idOf(c)) === String(customerId),
  );
  const updateForm = (key, value) => setForm((p) => ({ ...p, [key]: value }));
  const updateRequirement = (key, value) =>
    setRequirement((p) => ({ ...p, [key]: value }));
  const updateConfiguration = (key, value) =>
    setConfiguration((p) => ({ ...p, [key]: value }));
  const updateCustomer = (key, value) =>
    setCustomer((p) => ({ ...p, [key]: value }));
  const updateItem = (id, key, value) =>
    setItems((p) =>
      p.map((item) => (item.id === id ? { ...item, [key]: value } : item)),
    );

  const itemsSubtotal = useMemo(
    () => items.reduce((sum, item) =>
      sum + Math.max(0, Number(item.quantity) || 0) * Math.max(0, Number(item.rate) || 0), 0),
    [items],
  );
  const additionalCharges = [
    configuration.installationCost,
    configuration.transportationCost,
    configuration.otherCost,
  ].reduce((sum, n) => sum + Math.max(0, Number(n) || 0), 0);
  // Keep subtotal and additional charges as separate summary rows. Charges are
  // also stored as itemized zero-tax lines for the backend/PDF calculation.
  const subtotal = itemsSubtotal;
  const discountValue = Math.min(Math.max(0, Number(discount) || 0), itemsSubtotal);
  // GST is calculated on the full item value. Global discount is deducted
  // only after GST and additional charges have been added.
  const taxTotal = items.reduce((sum, item) => {
    const gross = Math.max(0, Number(item.quantity) || 0) * Math.max(0, Number(item.rate) || 0);
    return sum + (gross * Math.max(0, Number(item.taxRate) || 0)) / 100;
  }, 0);
  const grandTotal = Math.max(0, Number((subtotal - discountValue + taxTotal + additionalCharges).toFixed(2)));

  const validate = () => {
    if (!showNewCustomer && !customerId)
      return "Existing customer select karein ya New Customer choose karein.";
    if (showNewCustomer && (!customer.name.trim() || !customer.mobile.trim()))
      return "New customer ke liye name aur mobile number required hain.";
    if (!form.quotationDate || !form.validUntil)
      return "Quotation date aur Valid Until required hain.";
    if (new Date(form.validUntil) < new Date(form.quotationDate))
      return "Valid Until, quotation date se pehle nahi ho sakti.";
    if (!(Number(form.systemSizeKW) > 0))
      return "System capacity kW mein enter karein.";
    if (
      !items.length ||
      items.some(
        (i) =>
          !i.description.trim() ||
          !(Number(i.quantity) > 0) ||
          Number(i.rate) < 0 ||
          !Number.isFinite(Number(i.rate)),
      )
    )
      return "Quotation items mein description, valid quantity aur rate fill karein.";
    return "";
  };

  const submit = async (event) => {
    event.preventDefault();
    const validation = validate();
    if (validation) {
      setError(validation);
      return;
    }
    setSaving(true);
    setError("");
    try {
      let finalCustomerId = customerId;
      if (showNewCustomer) {
        const created = await customerService.createCustomer({
          ...customer,
          name: customer.name.trim(),
          mobile: customer.mobile.trim(),
          email: customer.email.trim(),
          siteAddress: customer.siteAddress || customer.address,
          status: "Active",
        });
        const record =
          created?.data?.customer ||
          created?.data?.data ||
          created?.data ||
          created?.customer ||
          created;
        finalCustomerId = idOf(record);
        if (!finalCustomerId)
          throw new Error(
            "Customer create ho gaya ho sakta hai, lekin response mein customer ID nahi mili. Customer list refresh karke dobara try karein.",
          );
      }
      const normalizedItems = items.map((item) => ({
        category: "SOLAR_SYSTEM",
        name: item.description.trim(),
        description: item.description.trim(),
        quantity: Number(item.quantity),
        unit: item.unit || "Unit",
        rate: Number(item.rate) || 0,
        taxRate: Number(item.taxRate) || 0,
        // Global ₹ discount is applied after GST, not against the taxable base.
        discount: 0,
      }));
      const quotationItems = [...normalizedItems];
      [
        ["Installation Charges", configuration.installationCost],
        ["Transportation Charges", configuration.transportationCost],
        ["Other Charges", configuration.otherCost],
      ].forEach(([description, value]) => {
        const amount = Math.max(0, Number(value) || 0);
        if (amount > 0)
          quotationItems.push({
            category: "OTHER",
            name: description,
            description,
            quantity: 1,
            unit: "JOB",
            rate: amount,
            taxRate: 0,
            discount: 0,
          });
      });
      const payload = {
        customer: finalCustomerId,
        quotationDate: form.quotationDate,
        validUntil: form.validUntil,
        status: "Draft",
        revisionNumber: 1,
        proposalTitle: form.title || "Solar Power System Proposal",
        plantDetails: {
          capacityKw: Number(form.systemSizeKW),
          systemType: {
            ON_GRID: "On-grid",
            OFF_GRID: "Off-grid",
            HYBRID: "Hybrid",
          }[form.systemType],
          description: form.title || "Solar Power System Proposal",
        },
        inlineSolarRequirement: {
          requiredKw: Number(form.systemSizeKW),
          monthlyBill: Number(requirement.monthlyBill) || 0,
          monthlyUnits: Number(requirement.monthlyUnits) || 0,
          roofType: requirement.roofType,
          roofArea: Number(requirement.roofArea) || 0,
          siteAddress:
            requirement.siteAddress ||
            (showNewCustomer
              ? customer.siteAddress
              : selectedCustomer?.siteAddress || selectedCustomer?.address) ||
            "",
          location:
            requirement.location ||
            (showNewCustomer ? customer.city : selectedCustomer?.city) ||
            "",
          connectionType: requirement.connectionType,
          sanctionedLoad: Number(requirement.sanctionedLoad) || 0,
          systemType: form.systemType,
          batteryRequired: requirement.batteryRequired === "true",
          batteryCapacity: Number(requirement.batteryCapacity) || 0,
          siteSurveyRequired: requirement.siteSurveyRequired === "true",
          siteSurveyCompleted: false,
          notes: requirement.notes,
        },
        inlineSystemConfiguration: {
          systemCapacity: Number(form.systemSizeKW),
          capacityUnit: "KW",
          systemType: form.systemType,
          phase: configuration.phase,
          panelMake: configuration.panelMake,
          panelModel: configuration.panelModel,
          panelWattage: Number(configuration.panelWattage) || 0,
          panelCount: Number(configuration.panelCount) || 0,
          inverterMake: configuration.inverterMake,
          inverterModel: configuration.inverterModel,
          inverterCapacity: configuration.inverterCapacity,
          batteryMake: configuration.batteryMake,
          batteryModel: configuration.batteryModel,
          mountingStructure: configuration.mountingStructure,
          installationCost: Number(configuration.installationCost) || 0,
          transportationCost: Number(configuration.transportationCost) || 0,
          otherCost: Number(configuration.otherCost) || 0,
          components: [
            ...(configuration.panelMake || configuration.panelModel || Number(configuration.panelCount) > 0
              ? [{
                  componentType: "SOLAR_PANEL",
                  name: [configuration.panelMake, configuration.panelModel].filter(Boolean).join(" ") || "Solar Panels (PV Modules)",
                  brand: configuration.panelMake || "",
                  quantity: Number(configuration.panelCount) || 0,
                  unit: "Nos",
                  capacity: Number(configuration.panelWattage) || 0,
                  specifications: { wattage: Number(configuration.panelWattage) || 0, model: configuration.panelModel || "" },
                  unitPrice: 0,
                  tax: 0,
                }]
              : []),
            ...(configuration.inverterMake || configuration.inverterModel || configuration.inverterCapacity
              ? [{
                  componentType: "INVERTER",
                  name: [configuration.inverterMake, configuration.inverterModel].filter(Boolean).join(" ") || "Solar Inverter",
                  brand: configuration.inverterMake || "",
                  quantity: 1,
                  unit: "Nos",
                  capacity: Number(configuration.inverterCapacity) || 0,
                  specifications: { capacity: Number(configuration.inverterCapacity) || 0, model: configuration.inverterModel || "" },
                  unitPrice: 0,
                  tax: 0,
                }]
              : []),
            ...(configuration.batteryMake || configuration.batteryModel || requirement.batteryRequired === "true"
              ? [{
                  componentType: "BATTERY",
                  name: [configuration.batteryMake, configuration.batteryModel].filter(Boolean).join(" ") || "Solar Battery",
                  brand: configuration.batteryMake || "",
                  quantity: requirement.batteryRequired === "true" ? 1 : 0,
                  unit: "Nos",
                  specifications: { model: configuration.batteryModel || "" },
                  unitPrice: 0,
                  tax: 0,
                }]
              : []),
            ...(configuration.mountingStructure
              ? [{
                  componentType: "STRUCTURE",
                  name: configuration.mountingStructure,
                  brand: configuration.mountingStructure,
                  quantity: 1,
                  unit: "Set",
                  unitPrice: 0,
                  tax: 0,
                }]
              : []),
            ...normalizedItems.map((item) => {
              const text = `${item.name} ${item.description}`.toLowerCase();
              const componentType = /panel|module|pv/.test(text) ? "SOLAR_PANEL"
                : /inverter/.test(text) ? "INVERTER"
                : /battery|batteries/.test(text) ? "BATTERY"
                : /structure|mounting/.test(text) ? "STRUCTURE"
                : /cable|earthing|protection|dcdb|acdb|spd|accessor|logger|meter/.test(text) ? "ACCESSORY"
                : "OTHER";
              return {
                componentType,
                name: item.name,
                quantity: item.quantity,
                unit: item.unit,
                unitPrice: item.rate,
                tax: item.taxRate,
              };
            }),
          ],
          notes: form.notes,
        },
        items: quotationItems,
        // BOM contains only configured or explicitly entered components; no quantities/specifications are invented.
        bom: [
          ...(Number(configuration.panelCount) > 0 ? [{
            category: "Solar Panels (PV Modules)",
            item: "Solar Panels (PV Modules)",
            description: [configuration.panelModel, configuration.panelWattage ? `${configuration.panelWattage} W` : ""].filter(Boolean).join(" "),
            qty: Number(configuration.panelCount),
            unit: "Nos",
            brand: configuration.panelMake || "",
            specification: [configuration.panelModel, configuration.panelWattage ? `${configuration.panelWattage} W` : ""].filter(Boolean).join(" "),
          }] : []),
          ...(configuration.inverterMake || configuration.inverterModel || configuration.inverterCapacity ? [{
            category: "Solar String Inverter",
            item: "Solar String Inverter",
            description: configuration.inverterModel || "",
            qty: 1,
            unit: "Nos",
            brand: configuration.inverterMake || "",
            specification: configuration.inverterCapacity ? `${configuration.inverterCapacity} kW` : configuration.inverterModel || "",
          }] : []),
          ...(configuration.mountingStructure ? [{
            category: "Structure",
            item: "Solar Mounting Structure",
            description: configuration.mountingStructure,
            qty: 1,
            unit: "Set",
            brand: configuration.mountingStructure,
            specification: configuration.mountingStructure,
          }] : []),
          ...normalizedItems.filter((item) => !/solar pv system/i.test(item.name)).map((item) => ({
            category: item.category || "Other Accessories",
            item: item.name,
            description: item.description || "",
            qty: Number(item.quantity) || 0,
            unit: item.unit || "Nos",
            brand: "",
            specification: item.description || "",
          })),
        ],
        globalDiscount: discountValue,
        paymentTerms: form.paymentTerms || undefined,
        warrantyDetails: form.warranty || undefined,
        quotationTerms: form.paymentTerms || undefined,
        notes:
          [form.notes, requirement.notes].filter(Boolean).join("\n") ||
          undefined,
      };
      await quotationService.createQuotation(payload);
      router.push("/admin/quotations");
    } catch (e) {
      const message =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "Quotation create nahi ho paayi.";
      setError(Array.isArray(message) ? message.join(", ") : message);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="admin-create-quotation-loading">
        <Loader />
        <p>Customer list load ho rahi hai...</p>
      </div>
    );

 
  const input = (value, onChange, props = {}) => (
    <input
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      {...props}
    />
  );
  const select = (value, onChange, options) => (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );

  return (
    <div className="admin-create-quotation-page inline-quotation-page">
      <header className="admin-create-quotation-header">
        <div>
          <button
            type="button"
            className="admin-create-quotation-back"
            onClick={() => router.push("/admin/quotations")}
          >
            ← Back to Quotations
          </button>
          <div className="admin-create-quotation-title">
            <div className="admin-create-quotation-icon">₹</div>
            <div>
              <h1>Create Quotation</h1>
              <p>
                Customer, solar requirement, system configuration aur pricing —
                sab ek hi page par.
              </p>
            </div>
          </div>
        </div>
      </header>
      {error && (
        <div className="admin-create-quotation-error">
          <strong>Action required</strong>
          <p>{error}</p>
        </div>
      )}
      <form onSubmit={submit} className="admin-create-quotation-form">
        <section className="admin-quotation-form-card">
          <div className="admin-quotation-form-card-header">
            <div className="admin-quotation-section-number">01</div>
            <div>
              <h2>Customer & Quotation</h2>
              <p>
                Customer select karein, ya isi page se naya customer add karein.
              </p>
            </div>
          </div>
          <div className="inline-q-grid">
            <Field label="Customer" required>
              {select(
                showNewCustomer ? "__new__" : customerId,
                (v) => {
                  if (v === "__new__") {
                    setShowNewCustomer(true);
                    setCustomerId("");
                    setRequirement((prev) => ({
                      ...prev,
                      location: customer.city || prev.location,
                      siteAddress: customer.siteAddress || prev.siteAddress,
                    }));
                  } else {
                    setShowNewCustomer(false);
                    setCustomerId(v);
                    const chosen = customers.find(
                      (item) => String(idOf(item)) === String(v),
                    );
                    if (chosen) {
                      setRequirement((prev) => ({
                        ...prev,
                        location: chosen.city || "",
                        siteAddress:
                          chosen.siteAddress || chosen.address || "",
                      }));
                    } else {
                      setRequirement((prev) => ({
                        ...prev,
                        location: "",
                        siteAddress: "",
                      }));
                    }
                  }
                },
                [
                  { value: "", label: "Select existing customer" },
                  ...customers.map((c) => ({
                    value: idOf(c),
                    label: `${c.name || c.customerName || c.companyName || "Customer"} • ${c.mobile || c.phone || "No mobile"}`,
                  })),
                  { value: "__new__", label: "+ Create New Customer" },
                ],
              )}
            </Field>
            <Field label="Quotation Date" required>
              {input(
                form.quotationDate,
                (v) => updateForm("quotationDate", v),
                { type: "date", required: true },
              )}
            </Field>
            <Field label="Valid Until" required>
              {input(form.validUntil, (v) => updateForm("validUntil", v), {
                type: "date",
                min: form.quotationDate,
                required: true,
              })}
            </Field>
            <Field label="Quotation Title">
              {input(form.title, (v) => updateForm("title", v), {
                placeholder: "Solar Power System Proposal",
              })}
            </Field>
          </div>
          {showNewCustomer ? (
            <div className="inline-q-subpanel">
              <h3>New Customer Details</h3>
              <div className="inline-q-grid">
                <Field label="Customer Name" required>
                  {input(customer.name, (v) => updateCustomer("name", v), {
                    required: true,
                    placeholder: "Customer full name",
                  })}
                </Field>
                <Field label="Mobile Number" required>
                  {input(customer.mobile, (v) => updateCustomer("mobile", v), {
                    required: true,
                    inputMode: "numeric",
                    placeholder: "10 digit mobile",
                  })}
                </Field>
                <Field label="Email">
                  {input(customer.email, (v) => updateCustomer("email", v), {
                    type: "email",
                    placeholder: "name@example.com",
                  })}
                </Field>
                <Field label="Customer Type">
                  {select(
                    customer.customerType,
                    (v) => updateCustomer("customerType", v),
                    [
                      { value: "Individual", label: "Individual" },
                      { value: "Business", label: "Business" },
                    ],
                  )}
                </Field>
                <Field label="Company Name">
                  {input(
                    customer.companyName,
                    (v) => updateCustomer("companyName", v),
                    { placeholder: "Optional" },
                  )}
                </Field>
                <Field label="City">
                  {input(customer.city, (v) => updateCustomer("city", v), {
                    placeholder: "City",
                  })}
                </Field>
                <Field label="State">
                  {input(customer.state, (v) => updateCustomer("state", v))}
                </Field>
                <Field label="PIN Code">
                  {input(
                    customer.pincode,
                    (v) => updateCustomer("pincode", v),
                    { inputMode: "numeric" },
                  )}
                </Field>
                <Field label="Site Address">
                  {input(
                    customer.siteAddress,
                    (v) => updateCustomer("siteAddress", v),
                    { placeholder: "Installation site address" },
                  )}
                </Field>
                <Field label="GST Number">
                  {input(
                    customer.gstNumber,
                    (v) => updateCustomer("gstNumber", v),
                    { placeholder: "Optional" },
                  )}
                </Field>
              </div>
              <button
                type="button"
                className="inline-q-text-button"
                onClick={() => setShowNewCustomer(false)}
              >
                Use existing customer instead
              </button>
            </div>
          ) : selectedCustomer ? (
            <div className="inline-q-customer-summary">
              <strong>
                {selectedCustomer.name || selectedCustomer.customerName}
              </strong>
              <span>{selectedCustomer.mobile}</span>
              <span>{selectedCustomer.email || "Email not added"}</span>
              <span>
                {[selectedCustomer.city, selectedCustomer.state, selectedCustomer.pincode]
                  .filter(Boolean)
                  .join(", ") || "Location not added"}
              </span>
              {selectedCustomer.gstNumber ? (
                <span>GST: {selectedCustomer.gstNumber}</span>
              ) : null}
              <span>
                {selectedCustomer.siteAddress ||
                  selectedCustomer.address ||
                  "Site address not added"}
              </span>
              <small>Saved customer details auto-filled below. Installation location can be edited if different.</small>
            </div>
          ) : null}
        </section>

        <section className="admin-quotation-form-card">
          <div className="admin-quotation-form-card-header">
            <div className="admin-quotation-section-number">02</div>
            <div>
              <h2>Solar Requirement</h2>
              <p>
                Sirf relevant details fill karein; dropdowns se process fast
                rahega.
              </p>
            </div>
          </div>
          <div className="inline-q-grid">
            <Field label="System Type" required>
              {select(form.systemType, (v) => updateForm("systemType", v), [
                { value: "ON_GRID", label: "On Grid" },
                { value: "OFF_GRID", label: "Off Grid" },
                { value: "HYBRID", label: "Hybrid" },
              ])}
            </Field>
            <Field label="Required Capacity" required>
              {input(form.systemSizeKW, (v) => updateForm("systemSizeKW", v), {
                type: "number",
                min: "0.1",
                step: "0.1",
                placeholder: "e.g. 5",
                required: true,
              })}
              <small>kW</small>
            </Field>
            <Field label="Monthly Electricity Bill">
              {input(
                requirement.monthlyBill,
                (v) => updateRequirement("monthlyBill", v),
                { type: "number", min: "0", placeholder: "₹ / month" },
              )}
            </Field>
            <Field label="Monthly Units">
              {input(
                requirement.monthlyUnits,
                (v) => updateRequirement("monthlyUnits", v),
                { type: "number", min: "0", placeholder: "Units / month" },
              )}
            </Field>
            <Field label="Roof Type">
              {select(
                requirement.roofType,
                (v) => updateRequirement("roofType", v),
                [
                  { value: "RCC", label: "RCC / Concrete" },
                  { value: "TIN", label: "Tin Shed" },
                  { value: "METAL", label: "Metal Roof" },
                  { value: "TILE", label: "Tile Roof" },
                  { value: "GROUND", label: "Ground Mounted" },
                  { value: "OTHER", label: "Other" },
                ],
              )}
            </Field>
            <Field label="Roof Area (sq. ft.)">
              {input(
                requirement.roofArea,
                (v) => updateRequirement("roofArea", v),
                { type: "number", min: "0", placeholder: "Optional" },
              )}
            </Field>
            <Field label="Connection / Phase">
              {select(
                requirement.connectionType,
                (v) => updateRequirement("connectionType", v),
                [
                  { value: "SINGLE_PHASE", label: "Single Phase" },
                  { value: "THREE_PHASE", label: "Three Phase" },
                  { value: "LT", label: "LT Connection" },
                  { value: "HT", label: "HT Connection" },
                ],
              )}
            </Field>
            <Field label="Sanctioned Load (kW)">
              {input(
                requirement.sanctionedLoad,
                (v) => updateRequirement("sanctionedLoad", v),
                { type: "number", min: "0", placeholder: "Optional" },
              )}
            </Field>
            <Field label="Battery Required">
              {select(
                requirement.batteryRequired,
                (v) => updateRequirement("batteryRequired", v),
                [
                  { value: "false", label: "No" },
                  { value: "true", label: "Yes" },
                ],
              )}
            </Field>
            {requirement.batteryRequired === "true" && (
              <Field label="Battery Capacity (kWh)">
                {select(
                  requirement.batteryCapacity,
                  (v) => updateRequirement("batteryCapacity", v),
                  [
                    { value: "", label: "Select capacity" },
                    { value: "2.5", label: "2.5 kWh" },
                    { value: "5", label: "5 kWh" },
                    { value: "7.5", label: "7.5 kWh" },
                    { value: "10", label: "10 kWh" },
                    { value: "15", label: "15 kWh" },
                    { value: "20", label: "20 kWh" },
                  ],
                )}
              </Field>
            )}
            <Field label="Site Survey Required">
              {select(
                requirement.siteSurveyRequired,
                (v) => updateRequirement("siteSurveyRequired", v),
                [
                  { value: "true", label: "Yes — pending survey" },
                  { value: "false", label: "No" },
                ],
              )}
            </Field>
            <Field label="Installation City / Location">
              {input(
                requirement.location,
                (v) => updateRequirement("location", v),
                {
                  placeholder: showNewCustomer
                    ? customer.city
                    : selectedCustomer?.city || "City / area",
                },
              )}
            </Field>
            <Field label="Installation Site Address">
              {input(
                requirement.siteAddress,
                (v) => updateRequirement("siteAddress", v),
                {
                  placeholder: showNewCustomer
                    ? customer.siteAddress
                    : selectedCustomer?.siteAddress ||
                      selectedCustomer?.address ||
                      "Site address",
                },
              )}
            </Field>
          </div>
        </section>

        <section className="admin-quotation-form-card">
          <div className="admin-quotation-form-card-header">
            <div className="admin-quotation-section-number">03</div>
            <div>
              <h2>System Configuration</h2>
              <p>
                Panel, inverter, battery aur installation ki details — isi
                quotation mein save hongi.
              </p>
            </div>
          </div>
          <div className="inline-q-grid">
            <Field label="Phase">
              {select(
                configuration.phase,
                (v) => updateConfiguration("phase", v),
                [
                  { value: "SINGLE_PHASE", label: "Single Phase" },
                  { value: "THREE_PHASE", label: "Three Phase" },
                ],
              )}
            </Field>
            <Field label="Panel Brand">
              {select(
                configuration.panelMake,
                (v) => updateConfiguration("panelMake", v),
                [
                  { value: "", label: "Select panel brand" },
                  { value: "Waaree", label: "Waaree" },
                  { value: "Adani Solar", label: "Adani Solar" },
                  { value: "Tata Power Solar", label: "Tata Power Solar" },
                  { value: "Vikram Solar", label: "Vikram Solar" },
                  { value: "RenewSys", label: "RenewSys" },
                  { value: "Other", label: "Other" },
                ],
              )}
            </Field>
            <Field label="Panel Model">
              {input(
                configuration.panelModel,
                (v) => updateConfiguration("panelModel", v),
                { placeholder: "Optional model" },
              )}
            </Field>
            <Field label="Panel Wattage">
              {select(
                configuration.panelWattage,
                (v) => updateConfiguration("panelWattage", v),
                [
                  { value: "450", label: "450 W" },
                  { value: "500", label: "500 W" },
                  { value: "530", label: "530 W" },
                  { value: "540", label: "540 W" },
                  { value: "550", label: "550 W" },
                  { value: "575", label: "575 W" },
                  { value: "600", label: "600 W" },
                ],
              )}
            </Field>
            <Field label="Panel Count">
              {input(
                configuration.panelCount,
                (v) => updateConfiguration("panelCount", v),
                { type: "number", min: "0", placeholder: "Auto / optional" },
              )}
            </Field>
            <Field label="Inverter Brand">
              {select(
                configuration.inverterMake,
                (v) => updateConfiguration("inverterMake", v),
                [
                  { value: "", label: "Select inverter brand" },
                  { value: "Sungrow", label: "Sungrow" },
                  { value: "Growatt", label: "Growatt" },
                  { value: "GoodWe", label: "GoodWe" },
                  { value: "Solis", label: "Solis" },
                  { value: "Deye", label: "Deye" },
                  { value: "Luminous", label: "Luminous" },
                  { value: "Other", label: "Other" },
                ],
              )}
            </Field>
            <Field label="Inverter Model">
              {input(
                configuration.inverterModel,
                (v) => updateConfiguration("inverterModel", v),
                { placeholder: "Optional model" },
              )}
            </Field>
            <Field label="Inverter Capacity">
              {select(
                configuration.inverterCapacity,
                (v) => updateConfiguration("inverterCapacity", v),
                [
                  { value: "", label: "Select capacity" },
                  { value: "3 kW", label: "3 kW" },
                  { value: "5 kW", label: "5 kW" },
                  { value: "6 kW", label: "6 kW" },
                  { value: "8 kW", label: "8 kW" },
                  { value: "10 kW", label: "10 kW" },
                  { value: "15 kW", label: "15 kW" },
                  { value: "20 kW", label: "20 kW" },
                  { value: "25 kW+", label: "25 kW+" },
                ],
              )}
            </Field>
            {requirement.batteryRequired === "true" && (
              <>
                <Field label="Battery Brand">
                  {select(
                    configuration.batteryMake,
                    (v) => updateConfiguration("batteryMake", v),
                    [
                      { value: "", label: "Select battery brand" },
                      { value: "Exide", label: "Exide" },
                      { value: "Luminous", label: "Luminous" },
                      { value: "Livguard", label: "Livguard" },
                      { value: "Other", label: "Other" },
                    ],
                  )}
                </Field>
                <Field label="Battery Model">
                  {input(configuration.batteryModel, (v) =>
                    updateConfiguration("batteryModel", v),
                  )}
                </Field>
              </>
            )}
            <Field label="Mounting Structure">
              {select(
                configuration.mountingStructure,
                (v) => updateConfiguration("mountingStructure", v),
                [
                  { value: "GI", label: "GI Structure" },
                  { value: "ALUMINIUM", label: "Aluminium" },
                  { value: "ELEVATED", label: "Elevated Structure" },
                  { value: "GROUND", label: "Ground Mount" },
                  { value: "CUSTOM", label: "Custom" },
                ],
              )}
            </Field>
            <Field label="Installation Charges (₹)">
              {input(
                configuration.installationCost,
                (v) => updateConfiguration("installationCost", v),
                { type: "number", min: "0", placeholder: "0" },
              )}
            </Field>
            <Field label="Transportation (₹)">
              {input(
                configuration.transportationCost,
                (v) => updateConfiguration("transportationCost", v),
                { type: "number", min: "0", placeholder: "0" },
              )}
            </Field>
            <Field label="Other Charges (₹)">
              {input(
                configuration.otherCost,
                (v) => updateConfiguration("otherCost", v),
                { type: "number", min: "0", placeholder: "0" },
              )}
            </Field>
          </div>
        </section>

        <section className="admin-quotation-form-card">
          <div className="admin-quotation-form-card-header">
            <div className="admin-quotation-section-number">04</div>
            <div>
              <h2>Quotation Items & Pricing</h2>
              <p>
                Rate aur tax enter karein. Totals automatically calculate honge.
              </p>
            </div>
            <button
              className="inline-q-add"
              type="button"
              onClick={() =>
                setItems((p) => [
                  ...p,
                  { ...newItem(), description: "", unit: "Unit" },
                ])
              }
            >
              + Add Item
            </button>
          </div>
          <div className="inline-q-items">
            <div className="inline-q-item-head">
              <span>Description</span>
              <span>Qty</span>
              <span>Unit</span>
              <span>Rate (₹)</span>
              <span>Tax %</span>
              <span>Total</span>
              <span />
            </div>
            {items.map((item) => (
              <div className="inline-q-item-row" key={item.id}>
                <input
                  aria-label="Description"
                  value={item.description}
                  onChange={(e) =>
                    updateItem(item.id, "description", e.target.value)
                  }
                  placeholder="Solar panel, inverter, installation..."
                  required
                />
                <input
                  aria-label="Quantity"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={item.quantity}
                  onChange={(e) =>
                    updateItem(item.id, "quantity", e.target.value)
                  }
                  required
                />
                <select
                  aria-label="Unit"
                  value={item.unit}
                  onChange={(e) => updateItem(item.id, "unit", e.target.value)}
                >
                  {[
                    "System",
                    "PCS",
                    "Panel",
                    "Set",
                    "Job",
                    "Meter",
                    "Unit",
                  ].map((u) => (
                    <option key={u}>{u}</option>
                  ))}
                </select>
                <input
                  aria-label="Rate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.rate}
                  onChange={(e) => updateItem(item.id, "rate", e.target.value)}
                  required
                />
                <select
                  aria-label="Tax percentage"
                  value={item.taxRate}
                  onChange={(e) =>
                    updateItem(item.id, "taxRate", e.target.value)
                  }
                >
                  {[0, 5, 12, 18, 28].map((t) => (
                    <option key={t} value={t}>
                      {t}%
                    </option>
                  ))}
                </select>
                <strong>
                  {money(
                    (Number(item.quantity) || 0) * (Number(item.rate) || 0),
                  )}
                </strong>
                <button
                  type="button"
                  aria-label="Remove item"
                  onClick={() =>
                    setItems((p) =>
                      p.length > 1 ? p.filter((i) => i.id !== item.id) : p,
                    )
                  }
                  className="inline-q-remove"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <div className="inline-q-grid inline-q-pricing-fields">
            <Field label="Discount (₹)">
              {input(discount, setDiscount, {
                type: "number",
                min: "0",
                max: itemsSubtotal,
                step: "0.01",
              })}
            </Field>
          </div>
          <div className="inline-q-summary">
            <div>
              <span>Subtotal</span>
              <strong>{money(subtotal)}</strong>
            </div>
            <div>
              <span>Discount</span>
              <strong>− {money(discountValue)}</strong>
            </div>
            <div>
              <span>GST / Tax</span>
              <strong>{money(taxTotal)}</strong>
            </div>
            <div>
              <span>Additional Charges</span>
              <strong>{money(additionalCharges)}</strong>
            </div>
            <div className="inline-q-grand-total">
              <span>Grand Total</span>
              <strong>{money(grandTotal)}</strong>
            </div>
          </div>
        </section>

        <section className="admin-quotation-form-card">
          <div className="admin-quotation-form-card-header">
            <div className="admin-quotation-section-number">05</div>
            <div>
              <h2>Terms & Additional Information</h2>
              <p>Optional details quotation PDF mein show hongi.</p>
            </div>
          </div>
          <div className="inline-q-grid">
            <Field label="Payment Terms">
              <textarea
                rows="3"
                value={form.paymentTerms}
                onChange={(e) => updateForm("paymentTerms", e.target.value)}
              />
            </Field>
            <Field label="Warranty">
              <textarea
                rows="3"
                value={form.warranty}
                onChange={(e) => updateForm("warranty", e.target.value)}
              />
            </Field>
            <Field label="Additional Notes">
              <textarea
                rows="3"
                value={form.notes}
                onChange={(e) => updateForm("notes", e.target.value)}
              />
            </Field>
          </div>
        </section>
        <div className="inline-q-footer">
          <div>
            <span>Final Quotation Value</span>
            <strong>{money(grandTotal)}</strong>
          </div>
          <button
            type="button"
            className="inline-q-cancel"
            onClick={() => router.push("/admin/quotations")}
            disabled={saving}
          >
            Cancel
          </button>
          <button type="submit" className="inline-q-submit" disabled={saving}>
            {saving ? "Creating Quotation..." : "Create Quotation & PDF Record"}
          </button>
        </div>
      </form>
    </div>
  );
}
