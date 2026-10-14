"use client";

import React, {
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import Textarea from "@/components/common/Textarea";
import Loader from "@/components/common/Loader";

import solarRequirementService from "@/services/solarRequirement.service";
import leadService from "@/services/lead.service";
import { createCustomer, getCustomers } from "@/services/customer.service";
import "./create-requirement.css";

const DIRECT_CUSTOMER = "__DIRECT_CUSTOMER__";

const CreateSolarRequirementPage = () => {
  const router = useRouter();

  const [leads, setLeads] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [loadingLeads, setLoadingLeads] =
    useState(true);
  const [submitting, setSubmitting] =
    useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] =
    useState({});

  const [form, setForm] = useState({
    leadId: "",
    customerName: "",
    phone: "",
    email: "",
    requiredKW: "",
    monthlyBill: "",
    units: "",
    roofType: "",
    roofArea: "",
    siteAddress: "",
    location: "",
    connectionLoad: "",
    systemType: "",
    batteryRequirement: "No",
    siteSurvey: "Pending",
    notes: "",
  });

  const loadLeads = async () => {
    try {
      setLoadingLeads(true);

      const response =
        await leadService.getLeads();

      const data =
        response?.data || response;

      setLeads(
        Array.isArray(data)
          ? data
          : data?.leads ||
              data?.items ||
              []
      );
    } catch (err) {
      console.error(
        "Failed to load leads:",
        err
      );
    } finally {
      setLoadingLeads(false);
    }
  };

  const loadCustomers = async () => {
    try {
      const response = await getCustomers({ page: 1, limit: 500 });
      const payload = response?.data ?? response;
      const list = Array.isArray(payload)
        ? payload
        : payload?.customers || payload?.items || payload?.data || [];
      setCustomers(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Failed to load customers:", err);
    }
  };

  useEffect(() => {
    loadLeads();
    loadCustomers();
  }, []);

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (fieldErrors[name]) {
      setFieldErrors((previous) => ({
        ...previous,
        [name]: "",
      }));
    }

    if (error) {
      setError("");
    }
  };

  const getLeadName = (lead) => {
    if (!lead) return "";

    return (
      lead?.name ||
      lead?.customerName ||
      lead?.fullName ||
      ""
    );
  };

  const getLeadPhone = (lead) => {
    if (!lead) return "";

    return (
      lead?.phone ||
      lead?.mobile ||
      lead?.contactNumber ||
      ""
    );
  };

  const getLeadEmail = (lead) => {
    if (!lead) return "";

    return lead?.email || "";
  };

  const getLeadAddress = (lead) => {
    if (!lead) return "";

    return (
      lead?.address ||
      lead?.siteAddress ||
      ""
    );
  };

  const getLeadCity = (lead) => {
    if (!lead) return "";

    return (
      lead?.city ||
      lead?.location ||
      ""
    );
  };

  const getCustomerName = (customer) =>
    customer?.name || customer?.customerName || customer?.fullName || customer?.companyName || "";

  const handleExistingCustomerChange = (event) => {
    const customerId = event?.target?.value ?? event;
    setSelectedCustomerId(customerId === "__NEW_CUSTOMER__" ? "" : customerId);

    if (!customerId || customerId === "__NEW_CUSTOMER__") {
      setForm((previous) => ({
        ...previous,
        customerName: "",
        phone: "",
        email: "",
        siteAddress: "",
        location: "",
      }));
      return;
    }

    const customer = customers.find(
      (item) => String(item?._id || item?.id) === String(customerId)
    );

    if (customer) {
      setForm((previous) => ({
        ...previous,
        customerName: getCustomerName(customer),
        phone: customer?.mobile || customer?.phone || customer?.contactNumber || "",
        email: customer?.email || "",
        siteAddress: customer?.siteAddress || customer?.address || "",
        location: customer?.city || customer?.location || "",
      }));
      setFieldErrors((previous) => ({
        ...previous,
        customerName: "",
        phone: "",
        siteAddress: "",
        location: "",
      }));
      setError("");
    }
  };

  const handleLeadChange = (event) => {
    const leadId = event?.target?.value ?? event;
    const selectedLead = leads.find(
      (lead) => String(lead?._id || lead?.id) === String(leadId)
    );

    if (leadId === DIRECT_CUSTOMER) {
      setSelectedCustomerId("");
      setForm((previous) => ({
        ...previous,
        leadId: DIRECT_CUSTOMER,
        customerName: "",
        phone: "",
        email: "",
        siteAddress: "",
        location: "",
      }));
      setFieldErrors((previous) => ({
        ...previous,
        leadId: "",
        customerName: "",
        phone: "",
        siteAddress: "",
        location: "",
      }));
      setError("");
      return;
    }

    setSelectedCustomerId("");

    if (!selectedLead) {
      setForm((previous) => ({
        ...previous,
        leadId,
        customerName: "",
        phone: "",
        email: "",
        siteAddress: "",
        location: "",
      }));
      return;
    }

    setForm((previous) => ({
      ...previous,
      leadId,
      customerName: getLeadName(selectedLead),
      phone: getLeadPhone(selectedLead),
      email: getLeadEmail(selectedLead),
      siteAddress: getLeadAddress(selectedLead),
      location: getLeadCity(selectedLead),
    }));

    setFieldErrors((previous) => ({
      ...previous,
      leadId: "",
      customerName: "",
      phone: "",
      siteAddress: "",
      location: "",
    }));
    setError("");
  };

  const validate = () => {
    const errors = {};

    if (!form.leadId) {
      errors.leadId = "Please select a lead or choose Direct Customer.";
    }

    if (
      !form.customerName.trim()
    ) {
      errors.customerName =
        "Customer name is required.";
    }

    if (!form.phone.trim()) {
      errors.phone =
        "Mobile number is required.";
    }

    if (!form.requiredKW) {
      errors.requiredKW =
        "Required system capacity is required.";
    } else if (
      Number(form.requiredKW) <= 0
    ) {
      errors.requiredKW =
        "Capacity must be greater than 0.";
    }

    if (
      form.monthlyBill &&
      Number(form.monthlyBill) < 0
    ) {
      errors.monthlyBill =
        "Monthly bill cannot be negative.";
    }

    if (
      form.units &&
      Number(form.units) < 0
    ) {
      errors.units =
        "Units cannot be negative.";
    }

    if (
      form.roofArea &&
      Number(form.roofArea) < 0
    ) {
      errors.roofArea =
        "Roof area cannot be negative.";
    }

    if (
      !form.siteAddress.trim()
    ) {
      errors.siteAddress =
        "Site address is required.";
    }

    if (
      !form.location.trim()
    ) {
      errors.location =
        "Location is required.";
    }

    setFieldErrors(errors);

    return (
      Object.keys(errors)
        .length === 0
    );
  };

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      let linkedCustomerId;

      if (form.leadId === DIRECT_CUSTOMER && selectedCustomerId) {
        linkedCustomerId = selectedCustomerId;
      } else if (form.leadId === DIRECT_CUSTOMER) {
        const customerResponse = await createCustomer({
          name: form.customerName.trim(),
          mobile: form.phone.trim(),
          email: form.email.trim() || undefined,
          address: form.siteAddress.trim(),
          siteAddress: form.siteAddress.trim(),
          city: form.location.trim(),
          notes: form.notes.trim() || undefined,
          customerType: "Individual",
          status: "Active",
        });

        const createdCustomer =
          customerResponse?.data?.customer ||
          customerResponse?.data ||
          customerResponse?.customer ||
          customerResponse;

        linkedCustomerId =
          createdCustomer?._id || createdCustomer?.id;

        if (!linkedCustomerId) {
          throw new Error(
            "Customer record was created without an ID. Please check the customer API response."
          );
        }
      }

      const payload = {
        ...(form.leadId !== DIRECT_CUSTOMER
          ? { lead: form.leadId }
          : {}),
        ...(linkedCustomerId ? { customer: linkedCustomerId } : {}),

        requiredKw:
          Number(
            form.requiredKW
          ),

        monthlyBill:
          form.monthlyBill
            ? Number(
                form.monthlyBill
              )
            : undefined,

        monthlyUnits:
          form.units
            ? Number(form.units)
            : undefined,

        roofType:
          form.roofType ||
          undefined,

        roofArea:
          form.roofArea
            ? Number(
                form.roofArea
              )
            : undefined,

        siteAddress:
          form.siteAddress.trim(),

        location:
          form.location.trim(),

        connectionType:
          form.connectionLoad.trim() ||
          undefined,

        sanctionedLoad:
          undefined,

        systemType:
          form.systemType ||
          undefined,

        batteryRequired:
          form.batteryRequirement ===
          "Yes",

        batteryCapacity:
          undefined,

        siteSurveyRequired:
          form.siteSurvey ===
          "Required",

        siteSurveyCompleted:
          form.siteSurvey ===
          "Completed",

        notes:
          form.notes.trim() ||
          undefined,
      };

      await solarRequirementService.createSolarRequirement(
        payload
      );

      router.push(
        "/admin/solar-requirements"
      );
    } catch (err) {
      console.error(
        "Failed to create solar requirement:",
        err
      );

      setError(
        err?.message ||
          err?.response?.data?.message ||
          "Unable to create solar requirement. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingLeads) {
    return (
      <div className="admin-create-requirement-loading">
        <Loader />
      </div>
    );
  }

  return (
    <div className="admin-create-requirement-page">

      {/* Header */}

      <div className="admin-create-requirement-header">

        <div>

          <button
            type="button"
            className="admin-create-requirement-back"
            onClick={() =>
              router.push(
                "/admin/solar-requirements"
              )
            }
          >
            ← Back to Solar Requirements
          </button>

          <span className="admin-page-eyebrow">
            Solar Management
          </span>

          <h1>
            Create Solar Requirement
          </h1>

          <p>
            Add the customer's solar
            requirement and site
            information.
          </p>

        </div>

      </div>

      {/* Error */}

      {error && (
        <div className="admin-create-requirement-error">

          <div className="admin-create-error-icon">
            !
          </div>

          <div>

            <strong>
              Unable to create requirement
            </strong>

            <p>
              {error}
            </p>

          </div>

        </div>
      )}

      <form
        className="admin-create-requirement-form"
        onSubmit={handleSubmit}
      >

        {/* Lead & Customer */}

        <section className="admin-create-requirement-card">

          <div className="admin-form-section-header">

            <div className="admin-form-section-number">
              01
            </div>

            <div>

              <h2>
                Lead & Customer
              </h2>

              <p>
                Select the lead and confirm
                customer details.
              </p>

            </div>

          </div>

          <div className="admin-form-grid">

            <div className="admin-form-field admin-form-full">

              <Select
                label="Lead / Customer Source *"
                name="leadId"
                value={
                  form.leadId
                }
                onChange={
                  handleLeadChange
                }
                disabled={
                  loadingLeads
                }
                error={
                  fieldErrors.leadId
                }
              >
                <option value="">
                  {loadingLeads ? "Loading leads..." : "Select lead or customer source"}
                </option>
                <option value={DIRECT_CUSTOMER}>
                  Direct Customer — No Lead Created
                </option>

                {leads.map(
                  (lead) => (
                    <option
                      key={
                        lead?._id ||
                        lead?.id
                      }
                      value={
                        lead?._id ||
                        lead?.id
                      }
                    >
                      {getLeadName(
                        lead
                      ) ||
                        "Unnamed Lead"}

                      {getLeadPhone(
                        lead
                      )
                        ? ` — ${getLeadPhone(
                            lead
                          )}`
                        : ""}
                    </option>
                  )
                )}

              </Select>

            </div>

            {form.leadId === DIRECT_CUSTOMER && (
              <div className="admin-form-field admin-form-full">
                <Select
                  label="Select Existing Customer (Optional)"
                  name="existingCustomerId"
                  value={selectedCustomerId || "__NEW_CUSTOMER__"}
                  onChange={handleExistingCustomerChange}
                >
                  <option value="__NEW_CUSTOMER__">New customer — enter details manually</option>
                  {customers.map((customer) => {
                    const id = customer?._id || customer?.id;
                    if (!id) return null;
                    return (
                      <option key={id} value={id}>
                        {getCustomerName(customer) || "Unnamed Customer"}
                        {(customer?.mobile || customer?.phone)
                          ? ` — ${customer.mobile || customer.phone}`
                          : ""}
                      </option>
                    );
                  })}
                </Select>
              </div>
            )}

            <div className="admin-form-field">

              <Input
                label="Customer Name *"
                name="customerName"
                value={form.customerName}
                onChange={handleChange}
                placeholder="Enter customer name"
                error={fieldErrors.customerName}
                disabled={form.leadId === DIRECT_CUSTOMER && Boolean(selectedCustomerId)}
              />

            </div>

            <div className="admin-form-field">

              <Input
                label="Mobile Number *"
                name="phone"
                value={
                  form.phone
                }
                onChange={
                  handleChange
                }
                placeholder="Enter mobile number"
                error={
                  fieldErrors.phone
                }
              />

            </div>

            <div className="admin-form-field">

              <Input
                label="Email"
                type="email"
                name="email"
                value={
                  form.email
                }
                onChange={
                  handleChange
                }
                placeholder="customer@example.com"
                error={
                  fieldErrors.email
                }
              />

            </div>

          </div>

        </section>

        {/* Solar Requirement */}

        <section className="admin-create-requirement-card">

          <div className="admin-form-section-header">

            <div className="admin-form-section-number">
              02
            </div>

            <div>

              <h2>
                Solar Requirement
              </h2>

              <p>
                Enter the customer's
                electricity and solar
                capacity requirements.
              </p>

            </div>

          </div>

          <div className="admin-form-grid">

            <div className="admin-form-field">

              <Input
                label="Required Capacity (kW) *"
                type="number"
                name="requiredKW"
                value={
                  form.requiredKW
                }
                onChange={
                  handleChange
                }
                placeholder="e.g. 5"
                min="0"
                step="0.01"
                error={
                  fieldErrors.requiredKW
                }
              />

            </div>

            <div className="admin-form-field">

              <Input
                label="Monthly Electricity Bill"
                type="number"
                name="monthlyBill"
                value={
                  form.monthlyBill
                }
                onChange={
                  handleChange
                }
                placeholder="e.g. 6500"
                min="0"
                step="0.01"
                error={
                  fieldErrors.monthlyBill
                }
              />

            </div>

            <div className="admin-form-field">

              <Input
                label="Monthly Units"
                type="number"
                name="units"
                value={
                  form.units
                }
                onChange={
                  handleChange
                }
                placeholder="e.g. 450"
                min="0"
                step="1"
                error={
                  fieldErrors.units
                }
              />

            </div>

            <div className="admin-form-field">

              <Select
                label="System Type"
                name="systemType"
                value={
                  form.systemType
                }
                onChange={
                  handleChange
                }
              >
                <option value="">
                  Select system type
                </option>

                <option value="On-grid">
                  On-Grid
                </option>

                <option value="Off-grid">
                  Off-Grid
                </option>

                <option value="Hybrid">
                  Hybrid
                </option>

              </Select>

            </div>

            <div className="admin-form-field">

              <Select
                label="Battery Requirement"
                name="batteryRequirement"
                value={
                  form.batteryRequirement
                }
                onChange={
                  handleChange
                }
              >
                <option value="No">
                  No
                </option>

                <option value="Yes">
                  Yes
                </option>

                <option value="Optional">
                  Optional
                </option>

              </Select>

            </div>

          </div>

        </section>

        {/* Site Details */}

        <section className="admin-create-requirement-card">

          <div className="admin-form-section-header">

            <div className="admin-form-section-number">
              03
            </div>

            <div>

              <h2>
                Site Details
              </h2>

              <p>
                Provide roof, location
                and electrical
                connection information.
              </p>

            </div>

          </div>

          <div className="admin-form-grid">

            <div className="admin-form-field">

              <Select
                label="Roof Type"
                name="roofType"
                value={
                  form.roofType
                }
                onChange={
                  handleChange
                }
              >
                <option value="">
                  Select roof type
                </option>

                <option value="RCC">
                  RCC
                </option>

                <option value="TIN">
                  Tin
                </option>

                <option value="METAL">
                  Metal
                </option>

                <option value="GROUND">
                  Ground
                </option>

                <option value="OTHER">
                  Other
                </option>

              </Select>

            </div>

            <div className="admin-form-field">

              <Input
                label="Roof Area"
                type="number"
                name="roofArea"
                value={
                  form.roofArea
                }
                onChange={
                  handleChange
                }
                placeholder="Enter roof area"
                min="0"
                step="0.01"
                error={
                  fieldErrors.roofArea
                }
              />

            </div>

            <div className="admin-form-field">

              <Input
                label="Connection / Load"
                name="connectionLoad"
                value={
                  form.connectionLoad
                }
                onChange={
                  handleChange
                }
                placeholder="e.g. 5 kW sanctioned load"
                error={
                  fieldErrors.connectionLoad
                }
              />

            </div>

            <div className="admin-form-field">

              <Select
                label="Site Survey"
                name="siteSurvey"
                value={
                  form.siteSurvey
                }
                onChange={
                  handleChange
                }
              >
                <option value="Pending">
                  Pending
                </option>

                <option value="Scheduled">
                  Scheduled
                </option>

                <option value="Completed">
                  Completed
                </option>

                <option value="Not Required">
                  Not Required
                </option>

              </Select>

            </div>

            <div className="admin-form-field">

              <Input
                label="Location / City *"
                name="location"
                value={
                  form.location
                }
                onChange={
                  handleChange
                }
                placeholder="Enter city or location"
                error={
                  fieldErrors.location
                }
              />

            </div>

            <div className="admin-form-field admin-form-full">

              <Textarea
                label="Site Address *"
                name="siteAddress"
                value={
                  form.siteAddress
                }
                onChange={
                  handleChange
                }
                placeholder="Enter complete installation site address"
                rows={4}
                error={
                  fieldErrors.siteAddress
                }
              />

            </div>

          </div>

        </section>

        {/* Notes */}

        <section className="admin-create-requirement-card">

          <div className="admin-form-section-header">

            <div className="admin-form-section-number">
              04
            </div>

            <div>

              <h2>
                Additional Notes
              </h2>

              <p>
                Add any extra information
                for the solar team.
              </p>

            </div>

          </div>

          <div className="admin-form-grid">

            <div className="admin-form-field admin-form-full">

              <Textarea
                label="Notes"
                name="notes"
                value={
                  form.notes
                }
                onChange={
                  handleChange
                }
                placeholder="Enter additional site/customer requirements..."
                rows={5}
              />

            </div>

          </div>

        </section>

        {/* Actions */}

        <div className="admin-create-requirement-actions">

          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              router.push(
                "/admin/solar-requirements"
              )
            }
            disabled={
              submitting
            }
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={
              submitting
            }
          >
            {submitting
              ? "Creating..."
              : "Create Requirement"}
          </Button>

        </div>

      </form>

    </div>
  );
};

export default CreateSolarRequirementPage;