"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";

import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import Textarea from "@/components/common/Textarea";
import Loader from "@/components/common/Loader";

import invoiceService from "@/services/invoice.service";
import customerService from "@/services/customer.service";
import quotationService from "@/services/quotation.service";

import "./create-invoice.css";

const EMPTY_ITEM = {
  description: "",
  quantity: 1,
  unit: "Unit",
  rate: 0,
  taxRate: 0,
};

const formatCurrency = (value) => {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const CreateInvoicePage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const editId = searchParams.get("edit");
  const customerIdFromUrl = searchParams.get("customerId");

  const isEditMode = Boolean(editId);

  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "", mobile: "", email: "", customerType: "Individual",
    companyName: "", city: "", state: "Uttar Pradesh", pincode: "",
    siteAddress: "", gstNumber: "", address: "",
  });

  const [quotations, setQuotations] = useState([]);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [quotationLoading, setQuotationLoading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    customerId: customerIdFromUrl || "",
    quotationId: "",
    invoiceDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    title: "Solar System Invoice",
    notes: "",
    items: [{ ...EMPTY_ITEM }],
    discount: 0,
    additionalCharges: 0,
  });

  /* ------------------------------------------------------------------ */
  /* Helpers                                                             */
  /* ------------------------------------------------------------------ */

  const getValue = useCallback((object, keys, fallback = "") => {
    if (!object) return fallback;

    for (const key of keys) {
      const value = object?.[key];

      if (value !== undefined && value !== null && value !== "") {
        return value;
      }
    }

    return fallback;
  }, []);

  const getId = useCallback((object) => {
    if (!object) return "";

    if (typeof object === "string") {
      return object;
    }

    return object?._id || object?.id || object?.customerId || "";
  }, []);

  const normalizeList = useCallback((response) => {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.data?.customers)) return response.data.customers;
    if (Array.isArray(response?.customers)) return response.customers;
    return [];
  }, []);

  const normalizeObject = useCallback((response) => {
    if (!response) return null;
    if (response?.data?.invoice) return response.data.invoice;
    if (response?.invoice) return response.invoice;
    if (response?.data && !Array.isArray(response.data)) return response.data;
    return response;
  }, []);

  const normalizeCustomer = useCallback((response) => {
    if (!response) return null;
    if (response?.data?.customer) return response.data.customer;
    if (response?.data?.data?.customer) return response.data.data.customer;
    if (response?.data?.data && !Array.isArray(response.data.data)) return response.data.data;
    if (response?.customer) return response.customer;
    if (response?.data && !Array.isArray(response.data)) return response.data;
    return response;
  }, []);

  /* ------------------------------------------------------------------ */
  /* Loaders                                                             */
  /* ------------------------------------------------------------------ */

  const loadCustomers = useCallback(async () => {
    try {
      const response = await customerService.getCustomers();
      setCustomers(normalizeList(response));
    } catch (err) {
      console.error("Failed to load customers:", err);
      throw err;
    }
  }, [normalizeList]);

  const loadCustomerById = useCallback(
    async (customerId) => {
      if (!customerId) {
        setSelectedCustomer(null);
        return;
      }

      try {
        setCustomerLoading(true);
        setError("");

        const response = await customerService.getCustomerById(customerId);
        const customer = normalizeCustomer(response);

        if (!customer) {
          throw new Error("Customer details could not be loaded.");
        }

        setSelectedCustomer(customer);
      } catch (err) {
        console.error("Failed to load customer:", err);

        const fallbackCustomer = customers.find(
          (customer) => getId(customer) === customerId
        );

        if (fallbackCustomer) {
          setSelectedCustomer(fallbackCustomer);
        } else {
          setSelectedCustomer(null);
          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Failed to load customer details."
          );
        }
      } finally {
        setCustomerLoading(false);
      }
    },
    [customers, getId, normalizeCustomer]
  );

  const loadCustomerQuotations = useCallback(async (customerId) => {
    if (!customerId) {
      setQuotations([]);
      setSelectedQuotation(null);
      return;
    }

    try {
      setQuotationLoading(true);
      setError("");

      const response = await quotationService.getQuotations({
        customer: customerId,
        limit: 100,
        page: 1,
      });

      const list = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.data?.quotations)
        ? response.data.quotations
        : Array.isArray(response?.quotations)
        ? response.quotations
        : [];

      setQuotations(list);
    } catch (err) {
      console.error("Failed to load customer quotations:", err);
      setQuotations([]);
    } finally {
      setQuotationLoading(false);
    }
  }, []);

  const loadQuotationItems = useCallback(async (quotationId) => {
    if (!quotationId) {
      setSelectedQuotation(null);
      setForm((previous) => ({
        ...previous,
        items: [{ ...EMPTY_ITEM }],
      }));
      return;
    }

    try {
      setQuotationLoading(true);
      setError("");

      const quotationResponse = await quotationService.getQuotationById(
        quotationId
      );

      const quotation =
        quotationResponse?.data?.quotation ||
        quotationResponse?.quotation ||
        quotationResponse?.data ||
        quotationResponse;

      const items =
        quotationResponse?.data?.items ||
        quotationResponse?.items ||
        quotation?.items ||
        [];

      setSelectedQuotation(quotation);

      if (!Array.isArray(items) || items.length === 0) {
        setForm((previous) => ({
          ...previous,
          items: [{ ...EMPTY_ITEM }],
        }));
        return;
      }

      setForm((previous) => ({
        ...previous,
        items: items.map((item) => ({
          description: item?.description || item?.name || "",
          quantity: Number(item?.quantity) || 1,
          unit: item?.unit || "Unit",
          rate: Number(item?.rate) || 0,
          taxRate: Number(item?.taxRate) || 0,
          discount: Number(item?.discount) || 0,
        })),
      }));
    } catch (err) {
      console.error("Failed to load quotation items:", err);
      setSelectedQuotation(null);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load quotation items."
      );
    } finally {
      setQuotationLoading(false);
    }
  }, []);

  const loadInvoice = useCallback(async () => {
    if (!editId) return;

    const response = await invoiceService.getInvoiceById(editId);
    const invoice = normalizeObject(response);

    if (!invoice) {
      throw new Error("Invoice details could not be loaded.");
    }

    const customer = getValue(invoice, ["customer"], null);
    const customerId = getId(customer) || getValue(invoice, ["customerId"]);
    const invoiceItems = getValue(invoice, ["items", "invoiceItems"], []);

    const quotationId =
      getId(getValue(invoice, ["quotation"], null)) ||
      getValue(invoice, ["quotationId"], "");

    setForm({
      customerId: customerId || "",
      quotationId: quotationId || "",
      invoiceDate:
        getValue(
          invoice,
          ["invoiceDate", "date"],
          new Date().toISOString().split("T")[0]
        )?.split?.("T")[0] || new Date().toISOString().split("T")[0],
      dueDate: getValue(invoice, ["dueDate"], "")?.split?.("T")[0] || "",
      title: getValue(invoice, ["title"], "Solar System Invoice"),
      notes: getValue(invoice, ["notes"], ""),
      items:
        Array.isArray(invoiceItems) && invoiceItems.length > 0
          ? invoiceItems.map((item) => ({
              description: getValue(item, ["description", "name"], ""),
              quantity: Number(getValue(item, ["quantity"], 1)) || 1,
              unit: getValue(item, ["unit"], "Unit"),
              rate:
                Number(getValue(item, ["rate", "unitPrice", "price"], 0)) || 0,
              taxRate: Number(getValue(item, ["taxRate", "tax"], 0)) || 0,
              discount: Number(getValue(item, ["discount"], 0)) || 0,
            }))
          : [{ ...EMPTY_ITEM }],
      discount: Number(getValue(invoice, ["discount"], 0)) || 0,
      additionalCharges:
        Number(getValue(invoice, ["additionalCharges", "extraCharges"], 0)) || 0,
    });
  }, [editId, getId, getValue, normalizeObject]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      await loadCustomers();
      await loadInvoice();
    } catch (err) {
      console.error("Failed to load invoice form:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load invoice form."
      );
    } finally {
      setLoading(false);
    }
  }, [loadCustomers, loadInvoice]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* ------------------------------------------------------------------ */
  /* Effects: react to customer change                                   */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    if (!form.customerId) {
      setSelectedCustomer(null);
      setQuotations([]);
      setSelectedQuotation(null);
      return;
    }

    loadCustomerById(form.customerId);
    loadCustomerQuotations(form.customerId);
  }, [form.customerId, loadCustomerById, loadCustomerQuotations]);

  /* ------------------------------------------------------------------ */
  /* Form handlers                                                       */
  /* ------------------------------------------------------------------ */

  const updateForm = useCallback((field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }, []);

  const handleCustomerChange = useCallback((customerId) => {
    setSelectedQuotation(null);

    setForm((previous) => ({
      ...previous,
      customerId,
      quotationId: "",
      items: [{ ...EMPTY_ITEM }],
    }));
  }, []);

  const handleQuotationChange = useCallback(
    (quotationId) => {
      updateForm("quotationId", quotationId);
      loadQuotationItems(quotationId);
    },
    [updateForm, loadQuotationItems]
  );

  const updateItem = useCallback((index, field, value) => {
    setForm((previous) => {
      const items = [...previous.items];

      items[index] = {
        ...items[index],
        [field]: value,
      };

      return {
        ...previous,
        items,
      };
    });
  }, []);

  const addItem = useCallback(() => {
    setForm((previous) => ({
      ...previous,
      items: [...previous.items, { ...EMPTY_ITEM }],
    }));
  }, []);

  const removeItem = useCallback((index) => {
    setForm((previous) => {
      if (previous.items.length === 1) {
        return previous;
      }

      return {
        ...previous,
        items: previous.items.filter((_, itemIndex) => itemIndex !== index),
      };
    });
  }, []);

  /* ------------------------------------------------------------------ */
  /* Derived values                                                      */
  /* ------------------------------------------------------------------ */

  const calculations = useMemo(() => {
    const roundMoney = (value) => Number(Number(value || 0).toFixed(2));

    const itemsSubtotal = roundMoney(form.items.reduce((sum, item) => {
      const quantity = Number(item.quantity) || 0;
      const rate = Number(item.rate) || 0;
      return sum + quantity * rate;
    }, 0));

    const requestedGlobalDiscount = Math.max(Number(form.discount) || 0, 0);
    const globalDiscount = Math.min(requestedGlobalDiscount, itemsSubtotal);
    const globalDiscountRatio = itemsSubtotal > 0 ? globalDiscount / itemsSubtotal : 0;
    const additionalCharges = roundMoney(Math.max(Number(form.additionalCharges) || 0, 0));
    const subtotal = roundMoney(itemsSubtotal + additionalCharges);

    let itemDiscount = 0;
    let taxTotal = 0;

    form.items.forEach((item) => {
      const quantity = Number(item.quantity) || 0;
      const rate = Number(item.rate) || 0;
      const taxRate = Number(item.taxRate) || 0;
      const gross = roundMoney(quantity * rate);
      const savedItemDiscount = roundMoney(
        gross * Math.min(Math.max(Number(item.discount) || 0, 0), 100) / 100
      );
      const allocatedGlobalDiscount = roundMoney(Math.min(
        Math.max(gross - savedItemDiscount, 0),
        gross * globalDiscountRatio
      ));
      const taxableLine = roundMoney(Math.max(
        gross - savedItemDiscount - allocatedGlobalDiscount,
        0
      ));

      itemDiscount += savedItemDiscount;
      taxTotal += roundMoney((taxableLine * taxRate) / 100);
    });

    itemDiscount = roundMoney(itemDiscount);
    taxTotal = roundMoney(taxTotal);
    const discount = roundMoney(itemDiscount + globalDiscount);
    const grandTotal = roundMoney(subtotal - discount + taxTotal);

    return {
      subtotal,
      itemDiscount,
      taxTotal,
      discount,
      additionalCharges,
      grandTotal: Math.max(grandTotal, 0),
    };
  }, [form]);

  const customerOptions = useMemo(
    () => [
      ...customers.map((customer) => ({
        label: `${getValue(customer, ["name", "fullName", "customerName", "companyName"], "Unnamed Customer")}${getValue(customer, ["mobile", "phone", "mobileNumber", "phoneNumber"], "") ? ` • ${getValue(customer, ["mobile", "phone", "mobileNumber", "phoneNumber"], "")}` : ""}`,
        value: getId(customer),
      })),
    ],
    [customers, getId, getValue]
  );

  const quotationOptions = useMemo(() => {
    const baseOption = {
      label: quotationLoading
        ? "Loading quotations..."
        : quotations.length === 0
        ? "No quotations found"
        : "Select Quotation",
      value: "",
    };

    return [
      baseOption,
      ...quotations.map((quotation) => {
        const number = getValue(
          quotation,
          ["quotationNumber", "quotationId", "quoteNumber", "number"],
          "Quotation"
        );

        const date = getValue(
          quotation,
          ["quotationDate", "date", "createdAt"],
          ""
        );

        const dateLabel = date
          ? ` - ${new Date(date).toLocaleDateString("en-IN")}`
          : "";

        return {
          label: `${number}${dateLabel}`,
          value: quotation?._id || quotation?.id || "",
        };
      }),
    ];
  }, [quotations, quotationLoading, getValue]);

  /* ------------------------------------------------------------------ */
  /* Validation + payload                                                */
  /* ------------------------------------------------------------------ */

  const validateForm = () => {
    if (isCreatingCustomer) {
      if (!String(newCustomer.name || "").trim() || !String(newCustomer.mobile || "").trim()) {
        return "New customer ke liye Customer Name aur Mobile Number required hain.";
      }
    } else {
      if (!form.customerId) return "Please select a customer or create a new customer.";
      if (!selectedCustomer) return "Customer details could not be loaded.";
    }
    if (!form.invoiceDate) return "Please select an invoice date.";

    if (form.dueDate && new Date(form.dueDate) < new Date(form.invoiceDate)) {
      return "Due date cannot be earlier than invoice date.";
    }

    const invalidItem = form.items.find(
      (item) =>
        !String(item.description || "").trim() ||
        Number(item.quantity) <= 0 ||
        Number(item.rate) < 0
    );

    if (invalidItem) {
      return "Please complete all invoice items with valid quantity and rate.";
    }

    if (Number(form.discount) < 0 || Number(form.additionalCharges) < 0) {
      return "Discount and additional charges cannot be negative.";
    }

    return "";
  };

  const buildPayload = (customerRecord = selectedCustomer, customerIdOverride = form.customerId) => {
    return {
      customerId: customerIdOverride,
      customer: customerIdOverride,

      customerDetails: {
        name: getValue(
          customerRecord,
          ["name", "fullName", "customerName", "companyName"],
          ""
        ),
        companyName: getValue(customerRecord, ["companyName", "company"], ""),
        mobile: getValue(
          customerRecord,
          ["mobile", "phone", "mobileNumber", "phoneNumber"],
          ""
        ),
        email: getValue(customerRecord, ["email"], ""),
        address: getValue(
          customerRecord,
          ["address", "fullAddress", "billingAddress", "siteAddress"],
          ""
        ),
        city: getValue(customerRecord, ["city"], ""),
        state: getValue(customerRecord, ["state"], ""),
        pincode: getValue(
          customerRecord,
          ["pincode", "pinCode", "postalCode", "zipCode"],
          ""
        ),
        gstin: getValue(
          customerRecord,
          ["gstNumber", "gstin", "GSTIN", "gstNo"],
          ""
        ),
        pan: getValue(customerRecord, ["panNumber", "pan", "PAN"], ""),
      },

      ...(form.quotationId ? { quotation: form.quotationId } : {}),

      invoiceDate: form.invoiceDate,

      ...(form.dueDate ? { dueDate: form.dueDate } : {}),

      title: form.title,

      items: (() => {
        const rawItems = form.items.map((item) => ({
          description: String(item.description || "").trim(),
          itemName: String(item.description || "").trim(),
          quantity: Number(item.quantity) || 0,
          unit: item.unit || "Unit",
          rate: Number(item.rate) || 0,
          taxRate: Number(item.taxRate) || 0,
          discount: Math.min(100, Math.max(Number(item.discount) || 0, 0)),
        }));

        const subtotal = rawItems.reduce(
          (sum, item) => sum + item.quantity * item.rate,
          0
        );
        const globalDiscount = Math.min(
          Math.max(Number(form.discount) || 0, 0),
          subtotal
        );

        const discountedItems = subtotal <= 0 || globalDiscount <= 0
          ? rawItems
          : rawItems.map((item) => {
              const gross = item.quantity * item.rate;
              if (gross <= 0) return item;
              const existingDiscountAmount = gross * item.discount / 100;
              const allocatedDiscount = Math.min(
                Math.max(gross - existingDiscountAmount, 0),
                globalDiscount * (gross / subtotal)
              );
              return {
                ...item,
                discount: Math.min(
                  100,
                  ((existingDiscountAmount + allocatedDiscount) / gross) * 100
                ),
              };
            });

        const extraCharges = Math.max(Number(form.additionalCharges) || 0, 0);
        if (extraCharges > 0) {
          discountedItems.push({
            description: "Additional Charges",
            itemName: "Additional Charges",
            quantity: 1,
            unit: "JOB",
            rate: extraCharges,
            taxRate: 0,
            discount: 0,
          });
        }

        return discountedItems;
      })(),

      discount: Number(form.discount) || 0,
      additionalCharges: Number(form.additionalCharges) || 0,
      notes: String(form.notes || "").trim(),
    };
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setError("");
      setSuccess("");

      const validationError = validateForm();

      if (validationError) {
        setError(validationError);
        return;
      }

      setSaving(true);

      let customerForInvoice = selectedCustomer;
      let customerIdForInvoice = form.customerId;

      if (!isEditMode && isCreatingCustomer) {
        const createdResponse = await customerService.createCustomer({
          ...newCustomer,
          name: String(newCustomer.name || "").trim(),
          mobile: String(newCustomer.mobile || "").trim(),
          email: String(newCustomer.email || "").trim(),
          siteAddress: newCustomer.siteAddress || newCustomer.address || "",
          status: "Active",
        });
        customerForInvoice = normalizeCustomer(createdResponse);
        customerIdForInvoice = getId(customerForInvoice);
        if (!customerForInvoice || !customerIdForInvoice) {
          throw new Error("Customer create response mein customer ID nahi mili. Customer list refresh karke check karein.");
        }
        setCustomers((previous) => [...previous, customerForInvoice]);
        setSelectedCustomer(customerForInvoice);
        setForm((previous) => ({ ...previous, customerId: customerIdForInvoice }));
      }

      const payload = buildPayload(customerForInvoice, customerIdForInvoice);

      if (isEditMode) {
        if (typeof invoiceService.updateInvoice !== "function") {
          throw new Error("Invoice update service is not available.");
        }

        await invoiceService.updateInvoice(editId, payload);
        setSuccess("Invoice updated successfully.");
      } else {
        if (form.quotationId) {
          await invoiceService.createInvoiceFromQuotation(form.quotationId, {
            customer: customerIdForInvoice,
            invoiceDate: form.invoiceDate,
            ...(form.dueDate ? { dueDate: form.dueDate } : {}),
            notes: form.notes || "",
          });
        } else {
          await invoiceService.createInvoice({
            ...payload,
            customer: customerIdForInvoice,
            ...(form.quotationId ? { quotation: form.quotationId } : {}),
          });
        }

        setSuccess("Invoice created successfully.");
      }

      setTimeout(() => {
        router.push("/admin/invoices");
      }, 700);
    } catch (err) {
      console.error("Failed to save invoice:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to save invoice."
      );
    } finally {
      setSaving(false);
    }
  };

  /* ------------------------------------------------------------------ */
  /* Customer display values                                             */
  /* ------------------------------------------------------------------ */

  const customerName = getValue(
    selectedCustomer,
    ["name", "fullName", "customerName", "companyName"],
    ""
  );

  const customerCompany = getValue(
    selectedCustomer,
    ["companyName", "company"],
    ""
  );

  const customerPhone = getValue(
    selectedCustomer,
    ["phone", "mobile", "mobileNumber", "phoneNumber"],
    ""
  );

  const customerAlternateMobile = getValue(
    selectedCustomer,
    ["alternateMobile", "alternatePhone", "secondaryMobile"],
    ""
  );

  const customerEmail = getValue(selectedCustomer, ["email"], "");

  const customerAddress = getValue(
    selectedCustomer,
    ["address", "fullAddress", "billingAddress"],
    ""
  );

  const customerCity = getValue(selectedCustomer, ["city"], "");
  const customerState = getValue(selectedCustomer, ["state"], "");

  const customerPincode = getValue(
    selectedCustomer,
    ["pincode", "pinCode", "postalCode", "zipCode"],
    ""
  );

  const customerGstin = getValue(
    selectedCustomer,
    ["gstNumber", "gstin", "GSTIN", "gstNo"],
    ""
  );

  const customerPanNumber = getValue(
    selectedCustomer,
    ["panNumber", "pan", "PAN"],
    ""
  );

  const customerSiteAddress = getValue(
    selectedCustomer,
    ["siteAddress", "installationAddress"],
    ""
  );

  const customerType = getValue(selectedCustomer, ["customerType", "type"], "");

  /* ------------------------------------------------------------------ */
  /* Render                                                              */
  /* ------------------------------------------------------------------ */

  if (loading) {
    return (
      <div className="admin-create-invoice-page">
        <Loader />
      </div>
    );
  }

  return (
    <div className="admin-create-invoice-page">
      <div className="admin-create-invoice-header">
        <div>
          <button
            type="button"
            className="admin-create-invoice-back"
            onClick={() => router.push("/admin/invoices")}
          >
            ← Back to Invoices
          </button>

          <h1>{isEditMode ? "Edit Invoice" : "Create Invoice"}</h1>

          <p>
            {isEditMode
              ? "Update the invoice details and billing items."
              : "Create a new customer invoice."}
          </p>
        </div>
      </div>

      {error && (
        <div className="admin-create-invoice-alert error">{error}</div>
      )}

      {success && (
        <div className="admin-create-invoice-alert success">{success}</div>
      )}

      <form onSubmit={handleSubmit} className="admin-create-invoice-form">
        <div className="admin-create-invoice-layout">
          {/* MAIN COLUMN */}
          <div className="admin-create-invoice-main">
            {/* Invoice details */}
            <section className="admin-create-invoice-card">
              <div className="admin-create-invoice-card-header">
                <div>
                  <h2>Invoice Details</h2>
                  <p>
                    Select a customer and the customer information will be
                    loaded automatically.
                  </p>
                </div>
              </div>

              <div className={`admin-create-invoice-fields ${!isCreatingCustomer ? "admin-create-invoice-customer-select-grid" : ""}`}>
                {!isCreatingCustomer ? (
                  <div className="admin-create-invoice-customer-select-wrap">
                    <label className="admin-create-invoice-customer-select-label" htmlFor="invoice-customer-select">Customer <span>*</span></label>
                    <select
                      id="invoice-customer-select"
                      className="admin-create-invoice-customer-native-select"
                      value={form.customerId || ""}
                      onChange={(event) => {
                        const value = event.target.value;
                        if (value === "__create_new_customer__") {
                          setIsCreatingCustomer(true);
                          setSelectedCustomer(null);
                          setForm((previous) => ({ ...previous, customerId: "", quotationId: "" }));
                          setQuotations([]);
                          setSelectedQuotation(null);
                          return;
                        }
                        handleCustomerChange(value);
                      }}
                      required
                    >
                      <option value="">Select existing customer</option>
                      {customerOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                      {!isEditMode && <option value="__create_new_customer__">+ Create New Customer</option>}
                    </select>
                  </div>
                ) : (
                  <div className="admin-create-invoice-new-customer-form">
                    <div className="admin-create-invoice-card-header">
                      <div><h2>New Customer Details</h2><p>Customer invoice banate waqt hi create ho jayega.</p></div>
                      <Button type="button" variant="secondary" onClick={() => setIsCreatingCustomer(false)}>Use Existing Customer</Button>
                    </div>
                    <div className="admin-create-invoice-fields">
                      <Input label="Customer Name" value={newCustomer.name} onChange={(event) => setNewCustomer((p) => ({ ...p, name: event.target.value }))} required />
                      <Input label="Mobile Number" value={newCustomer.mobile} onChange={(event) => setNewCustomer((p) => ({ ...p, mobile: event.target.value }))} required />
                      <Input label="Email" type="email" value={newCustomer.email} onChange={(event) => setNewCustomer((p) => ({ ...p, email: event.target.value }))} />
                      <Input label="Company Name" value={newCustomer.companyName} onChange={(event) => setNewCustomer((p) => ({ ...p, companyName: event.target.value }))} />
                      <Select label="Customer Type" value={newCustomer.customerType} onChange={(event) => setNewCustomer((p) => ({ ...p, customerType: event?.target ? event.target.value : event }))} options={[{label:"Individual",value:"Individual"},{label:"Business",value:"Business"}]} />
                      <Input label="City" value={newCustomer.city} onChange={(event) => setNewCustomer((p) => ({ ...p, city: event.target.value }))} />
                      <Input label="State" value={newCustomer.state} onChange={(event) => setNewCustomer((p) => ({ ...p, state: event.target.value }))} />
                      <Input label="PIN Code" value={newCustomer.pincode} onChange={(event) => setNewCustomer((p) => ({ ...p, pincode: event.target.value }))} />
                      <Input label="Site Address" value={newCustomer.siteAddress} onChange={(event) => setNewCustomer((p) => ({ ...p, siteAddress: event.target.value }))} />
                      <Input label="GST Number" value={newCustomer.gstNumber} onChange={(event) => setNewCustomer((p) => ({ ...p, gstNumber: event.target.value }))} />
                    </div>
                  </div>
                )}

                {!isCreatingCustomer && form.customerId && (
                  <Select
                    label="Quotation (optional)"
                    value={form.quotationId}
                    onChange={(event) =>
                      handleQuotationChange(
                        event?.target ? event.target.value : event
                      )
                    }
                    options={quotationOptions}
                    disabled={quotationLoading || quotations.length === 0}
                  />
                )}

                <Input
                  label="Invoice Date"
                  type="date"
                  value={form.invoiceDate}
                  onChange={(event) =>
                    updateForm("invoiceDate", event.target.value)
                  }
                  required
                />

                <Input
                  label="Due Date"
                  type="date"
                  value={form.dueDate}
                  onChange={(event) =>
                    updateForm("dueDate", event.target.value)
                  }
                />

                <Input
                  label="Invoice Title"
                  value={form.title}
                  onChange={(event) =>
                    updateForm("title", event.target.value)
                  }
                  placeholder="Solar System Invoice"
                />
              </div>

              {form.customerId && (
                <div className="admin-create-invoice-customer-preview">
                  {customerLoading ? (
                    <div>Loading customer details...</div>
                  ) : selectedCustomer ? (
                    <>
                      <div className="admin-create-invoice-customer-avatar">
                        {String(customerName || "C").charAt(0).toUpperCase()}
                      </div>

                      <div>
                        <strong>{customerName || "Customer"}</strong>
                        <span>
                          {[customerCompany, customerPhone, customerEmail]
                            .filter(Boolean)
                            .join(" • ")}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div>Customer details could not be loaded.</div>
                  )}
                </div>
              )}
            </section>

            {/* Items */}
            <section className="admin-create-invoice-card">
              <div className="admin-create-invoice-card-header">
                <div>
                  <h2>Invoice Items</h2>
                  <p>Add products or services included in this invoice.</p>
                </div>

                <Button type="button" variant="secondary" onClick={addItem}>
                  + Add Item
                </Button>
              </div>

              <div className="admin-create-invoice-items">
                {form.items.map((item, index) => (
                  <div className="admin-create-invoice-item" key={index}>
                    <div className="admin-create-invoice-item-number">
                      {index + 1}
                    </div>

                    <div className="admin-create-invoice-item-fields">
                      <div className="admin-create-invoice-item-description">
                        <Input
                          label="Description"
                          value={item.description}
                          onChange={(event) =>
                            updateItem(index, "description", event.target.value)
                          }
                          placeholder="Solar panel installation"
                          required
                        />
                      </div>

                      <div className="admin-create-invoice-editable-select">
                        <label className="admin-create-invoice-native-label" htmlFor={`invoice-quantity-${index}`}>Quantity <span>*</span></label>
                        <select
                          id={`invoice-quantity-${index}`}
                          className="admin-create-invoice-native-select"
                          value={[1, 2, 3, 4, 5, 10, 20, 25, 50, 100].map(String).includes(String(item.quantity)) ? String(item.quantity) : "custom"}
                          onChange={(event) => updateItem(index, "quantity", event.target.value === "custom" ? "" : event.target.value)}
                          required
                        >
                          {[1, 2, 3, 4, 5, 10, 20, 25, 50, 100].map((value) => <option key={value} value={value}>{value}</option>)}
                          <option value="custom">Custom…</option>
                        </select>
                        {(![1, 2, 3, 4, 5, 10, 20, 25, 50, 100].map(String).includes(String(item.quantity))) && <input className="admin-create-invoice-native-input" aria-label="Custom quantity" type="number" min="0.01" step="0.01" value={item.quantity} onChange={(event) => updateItem(index, "quantity", event.target.value)} placeholder="Enter quantity" required />}
                      </div>

                      <div className="admin-create-invoice-editable-select">
                        <label className="admin-create-invoice-native-label" htmlFor={`invoice-unit-${index}`}>Unit</label>
                        <select
                          id={`invoice-unit-${index}`}
                          className="admin-create-invoice-native-select"
                          value={["Unit", "Piece", "Panel", "Set", "Watt", "kW", "Meter", "Foot", "Job", "Lot", "Pair", "Box", "Nos"].includes(item.unit) ? item.unit : "custom"}
                          onChange={(event) => updateItem(index, "unit", event.target.value === "custom" ? "" : event.target.value)}
                        >
                          {["Unit", "Piece", "Panel", "Set", "Watt", "kW", "Meter", "Foot", "Job", "Lot", "Pair", "Box", "Nos"].map((value) => <option key={value} value={value}>{value}</option>)}
                          <option value="custom">Custom…</option>
                        </select>
                        {(!["Unit", "Piece", "Panel", "Set", "Watt", "kW", "Meter", "Foot", "Job", "Lot", "Pair", "Box", "Nos"].includes(item.unit)) && <input className="admin-create-invoice-native-input" aria-label="Custom unit" value={item.unit} onChange={(event) => updateItem(index, "unit", event.target.value)} placeholder="Type unit" />}
                      </div>

                      <Input
                        label="Rate"
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.rate}
                        onChange={(event) =>
                          updateItem(index, "rate", event.target.value)
                        }
                        required
                      />

                      <div className="admin-create-invoice-editable-select">
                        <label className="admin-create-invoice-native-label" htmlFor={`invoice-tax-${index}`}>Tax %</label>
                        <select
                          id={`invoice-tax-${index}`}
                          className="admin-create-invoice-native-select"
                          value={[0, 5, 12, 18, 28].map(String).includes(String(item.taxRate)) ? String(item.taxRate) : "custom"}
                          onChange={(event) => updateItem(index, "taxRate", event.target.value === "custom" ? "" : event.target.value)}
                        >
                          {[0, 5, 12, 18, 28].map((value) => <option key={value} value={value}>{value}%</option>)}
                          <option value="custom">Custom…</option>
                        </select>
                        {(![0, 5, 12, 18, 28].map(String).includes(String(item.taxRate))) && <input className="admin-create-invoice-native-input" aria-label="Custom tax percentage" type="number" min="0" max="100" step="0.01" value={item.taxRate} onChange={(event) => updateItem(index, "taxRate", event.target.value)} placeholder="Enter tax %" />}
                      </div>

                      <div className="admin-create-invoice-line-total">
                        <span>Line Total</span>
                        <strong>
                          {formatCurrency(
                            (Number(item.quantity) || 0) *
                              (Number(item.rate) || 0)
                          )}
                        </strong>
                      </div>
                    </div>

                    {form.items.length > 1 && (
                      <button
                        type="button"
                        className="admin-create-invoice-remove-item"
                        onClick={() => removeItem(index)}
                        title="Remove item"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>

            </section>

            {/* Notes */}
            <section className="admin-create-invoice-card">
              <div className="admin-create-invoice-card-header">
                <div>
                  <h2>Additional Information</h2>
                  <p>
                    Add any notes that should appear with the invoice.
                  </p>
                </div>
              </div>

              <div className="admin-create-invoice-notes">
                <Textarea
                  label="Notes"
                  value={form.notes}
                  onChange={(event) =>
                    updateForm("notes", event.target.value)
                  }
                  placeholder="Add invoice notes..."
                  rows={5}
                />
              </div>
            </section>
          </div>

          {/* SIDEBAR */}
          <aside className="admin-create-invoice-sidebar">
            <section className="admin-create-invoice-summary-card">
              <div className="admin-create-invoice-summary-header">
                <h2>Invoice Summary</h2>
                <span>
                  {form.items.length} item
                  {form.items.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="admin-create-invoice-summary-row">
                <span>Subtotal</span>
                <strong>{formatCurrency(calculations.subtotal)}</strong>
              </div>

              <div className="admin-create-invoice-summary-row">
                <span>Tax</span>
                <strong>{formatCurrency(calculations.taxTotal)}</strong>
              </div>

              {calculations.itemDiscount > 0 && (
                <div className="admin-create-invoice-summary-row">
                  <span>Quotation Item Discount</span>
                  <strong>-{formatCurrency(calculations.itemDiscount)}</strong>
                </div>
              )}

              <div className="admin-create-invoice-summary-field">
                <Input
                  label="Additional Discount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.discount}
                  onChange={(event) =>
                    updateForm("discount", event.target.value)
                  }
                />
              </div>

              <div className="admin-create-invoice-summary-field">
                <Input
                  label="Additional Charges"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.additionalCharges}
                  onChange={(event) =>
                    updateForm("additionalCharges", event.target.value)
                  }
                />
              </div>

              <div className="admin-create-invoice-summary-total">
                <span>Grand Total</span>
                <strong>{formatCurrency(calculations.grandTotal)}</strong>
              </div>
            </section>

            <section className="admin-create-invoice-actions-card">
              <Button
                type="submit"
                variant="primary"
                disabled={
                  saving ||
                  customerLoading ||
                  quotationLoading ||
                  (!isCreatingCustomer && !selectedCustomer)
                }
              >
                {saving
                  ? isEditMode
                    ? "Updating..."
                    : "Creating..."
                  : isEditMode
                  ? "Update Invoice"
                  : "Create Invoice"}
              </Button>

              <Button
                type="button"
                variant="secondary"
                disabled={saving}
                onClick={() => router.push("/admin/invoices")}
              >
                Cancel
              </Button>
            </section>

            <div className="admin-create-invoice-note">
              <strong>Invoice Information</strong>
              <p>
                Customer information is loaded automatically after selecting
                the customer. Select a quotation to auto-fill the invoice
                items. Totals are calculated from quantity, rate, tax,
                discount and additional charges.
              </p>
            </div>
          </aside>
        </div>
      </form>
    </div>
  );
};

export default CreateInvoicePage;