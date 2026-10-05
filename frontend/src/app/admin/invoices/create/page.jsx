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
<<<<<<< HEAD
import { customerService } from "@/services/customer.service";
=======
import customerService from "@/services/customer.service";
import quotationService from "@/services/quotation.service";
>>>>>>> a57335d (fatch customer  data invoice)

import "./create-invoice.css";

const EMPTY_ITEM = {
  description: "",
  quantity: 1,
  unit: "Unit",
  rate: 0,
  taxRate: 0,
};

const CreateInvoicePage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const editId = searchParams.get("edit");
  const customerIdFromUrl = searchParams.get("customerId");

  const isEditMode = Boolean(editId);

  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

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
    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response?.data)) {
      return response.data;
    }

    if (Array.isArray(response?.data?.customers)) {
      return response.data.customers;
    }

    if (Array.isArray(response?.customers)) {
      return response.customers;
    }

    return [];
  }, []);

  const normalizeObject = useCallback((response) => {
    if (!response) return null;

    if (response?.data?.invoice) {
      return response.data.invoice;
    }

    if (response?.invoice) {
      return response.invoice;
    }

    if (response?.data && !Array.isArray(response.data)) {
      return response.data;
    }

    return response;
  }, []);

  const normalizeCustomer = useCallback((response) => {
    if (!response) return null;

    if (response?.data?.customer) {
      return response.data.customer;
    }

    if (response?.customer) {
      return response.customer;
    }

    if (response?.data && !Array.isArray(response.data)) {
      return response.data;
    }

    return response;
  }, []);

  /**
   * Load customer list for the Select field.
   */
  const loadCustomers = useCallback(async () => {
    try {
      const response = await customerService.getCustomers();

      setCustomers(normalizeList(response));
    } catch (err) {
      console.error("Failed to load customers:", err);

      throw err;
    }
  }, [normalizeList]);

  /**
   * Fetch complete customer details
   * after customer selection.
   */
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

  /**
   * Fetch customer's quotations list.
   */
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

  /**
   * Fetch single quotation with items and
   * map its items into the invoice form.
   */
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

  /**
   * Load invoice in edit mode.
   */
  const loadInvoice = useCallback(async () => {
    if (!editId) return;

    const response = await invoiceService.getInvoiceById(editId);

    const invoice = normalizeObject(response);

    if (!invoice) {
      throw new Error("Invoice details could not be loaded.");
    }

    const customer = getValue(invoice, ["customer"], null);

    const customerId =
      getId(customer) || getValue(invoice, ["customerId"]);

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
        )?.split?.("T")[0] ||
        new Date().toISOString().split("T")[0],

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
                Number(
                  getValue(item, ["rate", "unitPrice", "price"], 0)
                ) || 0,

              taxRate: Number(getValue(item, ["taxRate", "tax"], 0)) || 0,
            }))
          : [{ ...EMPTY_ITEM }],

      discount: Number(getValue(invoice, ["discount"], 0)) || 0,

      additionalCharges:
        Number(getValue(invoice, ["additionalCharges", "extraCharges"], 0)) ||
        0,
    });
  }, [editId, getId, getValue, normalizeObject]);

  /**
   * Initial page loading.
   */
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

  /**
   * Whenever a customer is selected,
   * fetch customer details + quotations.
   */
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

  const calculations = useMemo(() => {
    const subtotal = form.items.reduce((sum, item) => {
      const quantity = Number(item.quantity) || 0;

      const rate = Number(item.rate) || 0;

      return sum + quantity * rate;
    }, 0);

    const taxTotal = form.items.reduce((sum, item) => {
      const quantity = Number(item.quantity) || 0;

      const rate = Number(item.rate) || 0;

      const taxRate = Number(item.taxRate) || 0;

      const lineAmount = quantity * rate;

      return sum + (lineAmount * taxRate) / 100;
    }, 0);

    const discount = Number(form.discount) || 0;

    const additionalCharges = Number(form.additionalCharges) || 0;

    const grandTotal = subtotal + taxTotal - discount + additionalCharges;

    return {
      subtotal,
      taxTotal,
      discount,
      additionalCharges,
      grandTotal: Math.max(grandTotal, 0),
    };
  }, [form]);

  /**
   * Customer select options.
   */
  const customerOptions = useMemo(
    () => [
      {
        label: "Select Customer",
        value: "",
      },

      ...customers.map((customer) => ({
        label: getValue(
          customer,
          ["name", "fullName", "customerName", "companyName"],
          "Unnamed Customer"
        ),

        value: getId(customer),
      })),
    ],
    [customers, getId, getValue]
  );

  /**
   * Quotation select options.
   */
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

  const validateForm = () => {
    if (!form.customerId) {
      return "Please select a customer.";
    }

    if (!selectedCustomer) {
      return "Customer details could not be loaded.";
    }

    if (!form.invoiceDate) {
      return "Please select an invoice date.";
    }

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

    if (
      Number(form.discount) < 0 ||
      Number(form.additionalCharges) < 0
    ) {
      return "Discount and additional charges cannot be negative.";
    }

    return "";
  };

  const buildPayload = () => {
    return {
<<<<<<< HEAD
      customerId: form.customerId,
      customerDetails: {
  name: getValue(
    selectedCustomer,
    ["name", "fullName", "customerName", "companyName"],
    ""
  ),
},
=======
      customer: form.customerId,

      ...(form.quotationId
        ? {
            quotation: form.quotationId,
          }
        : {}),

>>>>>>> a57335d (fatch customer  data invoice)
      invoiceDate: form.invoiceDate,

      ...(form.dueDate
        ? {
            dueDate: form.dueDate,
          }
        : {}),

      title: form.title,
<<<<<<< HEAD
      items: form.items.map(
        (item) => ({
          itemName: item.description.trim(),
          quantity:
            Number(
              item.quantity
            ),
          unit:
            item.unit ||
            "Unit",
          rate:
            Number(
              item.rate
            ),
          taxRate:
            Number(
              item.taxRate
            ) || 0,
        })
      ),
      discount:
        Number(
          form.discount
        ) || 0,
      additionalCharges:
        Number(
          form.additionalCharges
        ) || 0,
      notes:
        form.notes.trim(),
=======

      items: form.items.map((item) => ({
        description: String(item.description || "").trim(),

        quantity: Number(item.quantity),

        unit: item.unit || "Unit",

        rate: Number(item.rate),

        taxRate: Number(item.taxRate) || 0,
      })),

      discount: Number(form.discount) || 0,

      additionalCharges: Number(form.additionalCharges) || 0,

      notes: String(form.notes || "").trim(),
>>>>>>> a57335d (fatch customer  data invoice)
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

      const payload = buildPayload();

      if (isEditMode) {
        if (typeof invoiceService.updateInvoice !== "function") {
          throw new Error("Invoice update service is not available.");
        }

        await invoiceService.updateInvoice(editId, payload);

        setSuccess("Invoice updated successfully.");
      } else {
        if (form.quotationId) {
          await invoiceService.createInvoiceFromQuotation(form.quotationId, {
            customer: form.customerId,
            invoiceDate: form.invoiceDate,
            ...(form.dueDate
              ? {
                  dueDate: form.dueDate,
                }
              : {}),
            notes: form.notes || "",
          });
        } else {
          await invoiceService.createInvoice({
            ...payload,
            customer: form.customerId,
            ...(form.quotationId
              ? {
                  quotation: form.quotationId,
                }
              : {}),
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

  const formatCurrency = (value) => {
    return `₹${Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  /**
   * Complete customer information.
   */
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

  const customerType = getValue(
    selectedCustomer,
    ["customerType", "type"],
    ""
  );

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
          <div className="admin-create-invoice-main">
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

<<<<<<< HEAD
                <div className="admin-create-invoice-fields">
                  <Select
                    label="Customer"
                    value={
                      form.customerId
                    }
                    onChange={(
                      event
                    ) =>
                      updateForm(
                        "customerId",
                        event?.target
                          ? event.target
                              .value
                          : event
                      )
                    }
                    options={
                      customerOptions
                    }
                    required
                  />

                  <Input
                    label="Invoice Date"
                    type="date"
                    value={
                      form.invoiceDate
                    }
                    onChange={(
                      event
                    ) =>
                      updateForm(
                        "invoiceDate",
                        event.target.value
                      )
                    }
                    required
                  />

                  <Input
                    label="Due Date"
                    type="date"
                    value={
                      form.dueDate
                    }
                    onChange={(
                      event
                    ) =>
                      updateForm(
                        "dueDate",
                        event.target.value
                      )
                    }
                  />

                  <Input
                    label="Invoice Title"
                    value={
                      form.title
                    }
                    onChange={(
                      event
                    ) =>
                      updateForm(
                        "title",
                        event.target.value
                      )
                    }
                    placeholder="Solar System Invoice"
                  />
                </div>

                {selectedCustomer && (
                  <div className="admin-create-invoice-customer-preview">
                    <div className="admin-create-invoice-customer-avatar">
                      {String(
                        getValue(
                          selectedCustomer,
                          [
                            "name",
                            "fullName",
                            "customerName",
                          ],
                          "C"
                        )
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div>
                      <strong>
                        {getValue(
                          selectedCustomer,
                          [
                            "name",
                            "fullName",
                            "customerName",
                          ],
                          "Customer"
                        )}
                      </strong>

                      <span>
                        {[
                          getValue(
                            selectedCustomer,
                            [
                              "companyName",
                            ],
                            ""
                          ),
                          getValue(
                            selectedCustomer,
                            [
                              "phone",
                            ],
                            ""
                          ),
                          getValue(
                            selectedCustomer,
                            [
                              "email",
                            ],
                            ""
                          ),
                        ]
                          .filter(
                            Boolean
                          )
                          .join(
                            " • "
                          )}
                      </span>
                    </div>
                  </div>
                )}
              </section>

              {/* Items */}
              <section className="admin-create-invoice-card">
                <div className="admin-create-invoice-card-header">
                  <div>
                    <h2>
                      Invoice Items
                    </h2>
                    <p>
                      Add products or services included
                      in this invoice.
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

                <div className="admin-create-invoice-items">
                  {form.items.map(
                    (
                      item,
                      index
                    ) => (
                      <div
                        className="admin-create-invoice-item"
                        key={index}
                      >
                        <div className="admin-create-invoice-item-number">
                          {index + 1}
                        </div>

                        <div className="admin-create-invoice-item-fields">
                          <div className="admin-create-invoice-item-description">
                            <Input
                              label="Description"
                              value={
                                item.description
                              }
                              onChange={(
                                event
                              ) =>
                                updateItem(
                                  index,
                                  "description",
                                  event
                                    .target
                                    .value
                                )
                              }
                              placeholder="Solar panel installation"
                              required
                            />
                          </div>

                          <Input
                            label="Quantity"
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={
                              item.quantity
                            }
                            onChange={(
                              event
                            ) =>
                              updateItem(
                                index,
                                "quantity",
                                event
                                  .target
                                  .value
                              )
                            }
                            required
                          />

                          <Input
                            label="Unit"
                            value={
                              item.unit
                            }
                            onChange={(
                              event
                            ) =>
                              updateItem(
                                index,
                                "unit",
                                event
                                  .target
                                  .value
                              )
                            }
                            placeholder="Unit"
                          />

                          <Input
                            label="Rate"
                            type="number"
                            min="0"
                            step="0.01"
                            value={
                              item.rate
                            }
                            onChange={(
                              event
                            ) =>
                              updateItem(
                                index,
                                "rate",
                                event
                                  .target
                                  .value
                              )
                            }
                            required
                          />

                          <Input
                            label="Tax %"
                            type="number"
                            min="0"
                            step="0.01"
                            value={
                              item.taxRate
                            }
                            onChange={(
                              event
                            ) =>
                              updateItem(
                                index,
                                "taxRate",
                                event
                                  .target
                                  .value
                              )
                            }
                          />

                          <div className="admin-create-invoice-line-total">
                            <span>
                              Line Total
                            </span>

                            <strong>
                              {formatCurrency(
                                (Number(
                                  item.quantity
                                ) ||
                                  0) *
                                  (Number(
                                    item.rate
                                  ) ||
                                    0)
                              )}
                            </strong>
                          </div>
                        </div>

                        {form.items.length >
                          1 && (
                          <button
                            type="button"
                            className="admin-create-invoice-remove-item"
                            onClick={() =>
                              removeItem(
                                index
                              )
                            }
                            title="Remove item"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    )
                  )}
                </div>
              </section>

              {/* Notes */}
              <section className="admin-create-invoice-card">
                <div className="admin-create-invoice-card-header">
                  <div>
                    <h2>
                      Additional Information
                    </h2>
                    <p>
                      Add any notes that should appear
                      with the invoice.
                    </p>
                  </div>
                </div>

                <div className="admin-create-invoice-notes">
                  <Textarea
                    label="Notes"
                    value={
                      form.notes
                    }
                    onChange={(
                      event
                    ) =>
                      updateForm(
                        "notes",
                        event.target.value
                      )
                    }
                    placeholder="Add invoice notes..."
                    rows={5}
                  />
                </div>
              </section>
            </div>

            {/* Summary */}
            <aside className="admin-create-invoice-sidebar">
              <section className="admin-create-invoice-summary-card">
                <div className="admin-create-invoice-summary-header">
                  <h2>
                    Invoice Summary
                  </h2>

                  <span>
                    {form.items.length}{" "}
                    item
                    {form.items.length !==
                    1
                      ? "s"
                      : ""}
                  </span>
                </div>
                

                <div className="admin-create-invoice-summary-row">
                  <span>
                    Subtotal
                  </span>

                  <strong>
                    {formatCurrency(
                      calculations.subtotal
                    )}
                  </strong>
                </div>

                <div className="admin-create-invoice-summary-row">
                  <span>
                    Tax
                  </span>

                  <strong>
                    {formatCurrency(
                      calculations.taxTotal
                    )}
                  </strong>
                </div>

                <div className="admin-create-invoice-summary-field">
                  <Input
                    label="Discount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      form.discount
                    }
                    onChange={(
                      event
                    ) =>
                      updateForm(
                        "discount",
                        event.target.value
                      )
                    }
                  />
                </div>

                <div className="admin-create-invoice-summary-field">
                  <Input
                    label="Additional Charges"
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      form.additionalCharges
                    }
                    onChange={(
                      event
                    ) =>
                      updateForm(
                        "additionalCharges",
                        event.target.value
                      )
                    }
                  />
                </div>

                <div className="admin-create-invoice-summary-total">
                  <span>
                    Grand Total
                  </span>

                  <strong>
                    {formatCurrency(
                      calculations.grandTotal
                    )}
                  </strong>
                </div>
              </section>

              <section className="admin-create-invoice-actions-card">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={saving}
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
                  onClick={() =>
                    router.push(
                      "/admin/invoices"
=======
              <div className="admin-create-invoice-fields">
                <Select
                  label="Customer"
                  value={form.customerId}
                  onChange={(event) =>
                    handleCustomerChange(
                      event?.target ? event.target.value : event
>>>>>>> a57335d (fatch customer  data invoice)
                    )
                  }
                  options={customerOptions}
                  required
                />

                {form.customerId && (
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
                        {String(customerName || "C")
                          .charAt(0)
                          .toUpperCase()}
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

              {selectedCustomer && !customerLoading && (
                <div className="admin-create-invoice-fields">
                  <Input
                    label="Customer Name"
                    value={customerName}
                    readOnly
                  />

                  <Input
                    label="Company Name"
                    value={customerCompany}
                    readOnly
                  />

                  <Input
                    label="Mobile Number"
                    value={customerPhone}
                    readOnly
                  />

                  <Input
                    label="Alternate Mobile"
                    value={customerAlternateMobile}
                    readOnly
                  />

                  <Input label="Email" value={customerEmail} readOnly />

                  <Input label="Address" value={customerAddress} readOnly />

                  <Input label="City" value={customerCity} readOnly />

                  <Input label="State" value={customerState} readOnly />

                  <Input label="Pincode" value={customerPincode} readOnly />

                  <Input label="GST Number" value={customerGstin} readOnly />

                  <Input
                    label="PAN Number"
                    value={customerPanNumber}
                    readOnly
                  />

                  <Input
                    label="Customer Type"
                    value={customerType}
                    readOnly
                  />

                  <Input
                    label="Site Address"
                    value={customerSiteAddress}
                    readOnly
                  />
                </div>
              )}
            </section>

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
                            updateItem(
                              index,
                              "description",
                              event.target.value
                            )
                          }
                          placeholder="Solar panel installation"
                          required
                        />
                      </div>

                      <Input
                        label="Quantity"
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={item.quantity}
                        onChange={(event) =>
                          updateItem(index, "quantity", event.target.value)
                        }
                        required
                      />

                      <Input
                        label="Unit"
                        value={item.unit}
                        onChange={(event) =>
                          updateItem(index, "unit", event.target.value)
                        }
                        placeholder="Unit"
                      />

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

                      <Input
                        label="Tax %"
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.taxRate}
                        onChange={(event) =>
                          updateItem(index, "taxRate", event.target.value)
                        }
                      />

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

              <div className="admin-create-invoice-summary-field">
                <Input
                  label="Discount"
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
                  !selectedCustomer
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