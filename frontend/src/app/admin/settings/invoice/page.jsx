"use client";

import React, { useEffect, useState } from "react";
import AdminLayout from "@/app/admin/layout";
import settingService from "@/services/setting.service";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Textarea from "@/components/common/Textarea";
import Loader from "@/components/common/Loader";
import "./invoice-settings.css";

const DEFAULT_INVOICE_SETTINGS = {
  prefix: "INV-",
  startingNumber: 1,
  defaultTaxRate: 0,
  notes: "",
  termsAndConditions:
    "This invoice is issued against the services or products mentioned above.",
  showCompanyDetails: true,
  showBankDetails: true,
  showTermsAndConditions: true,
};

const getSettingValue = (response) => {
  const value = response?.data ?? response;

  if (value?.settings) return value.settings;
  if (value?.invoice) return value.invoice;
  if (value?.invoiceSettings) return value.invoiceSettings;

  if (value?.data && typeof value.data === "object") {
    return value.data;
  }

  return value || {};
};

const InvoiceSettingsPage = () => {
  const [formData, setFormData] = useState(
    DEFAULT_INVOICE_SETTINGS
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadInvoiceSettings = async () => {
      try {
        setLoading(true);
        setError("");

        let response;

        if (
          typeof settingService.getInvoiceSettings ===
          "function"
        ) {
          response = await settingService.getInvoiceSettings();
        } else if (
          typeof settingService.getInvoice === "function"
        ) {
          response = await settingService.getInvoice();
        } else if (
          typeof settingService.getSettings === "function"
        ) {
          response = await settingService.getSettings();
        } else {
          setLoading(false);
          return;
        }

        const invoice = getSettingValue(response);

        setFormData((previous) => ({
          ...previous,
          ...invoice,
        }));
      } catch (err) {
        console.error(
          "Failed to load invoice settings:",
          err
        );

        setError(
          err?.message ||
            "Unable to load invoice settings. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    loadInvoiceSettings();
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
            ? Number(value)
            : value,
    }));

    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (
        typeof settingService.updateInvoiceSettings ===
        "function"
      ) {
        await settingService.updateInvoiceSettings(formData);
      } else if (
        typeof settingService.updateInvoice === "function"
      ) {
        await settingService.updateInvoice(formData);
      } else if (
        typeof settingService.updateSettings === "function"
      ) {
        await settingService.updateSettings(formData);
      } else {
        throw new Error(
          "Invoice settings update method is not available."
        );
      }

      setSuccess(
        "Invoice settings updated successfully."
      );
    } catch (err) {
      console.error(
        "Failed to update invoice settings:",
        err
      );

      setError(
        err?.message ||
          "Unable to update invoice settings. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setFormData(DEFAULT_INVOICE_SETTINGS);
    setError("");
    setSuccess("");
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="invoice-settings-loading">
          <Loader />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="invoice-settings-page">
        <div className="invoice-settings-header">
          <div>
            <h1>Invoice Settings</h1>
            <p>
              Configure invoice numbering, tax defaults, content,
              and document display preferences.
            </p>
          </div>
        </div>

        {error && (
          <div className="invoice-settings-alert invoice-settings-error">
            {error}
          </div>
        )}

        {success && (
          <div className="invoice-settings-alert invoice-settings-success">
            {success}
          </div>
        )}

        <form
          className="invoice-settings-form"
          onSubmit={handleSubmit}
        >
          <section className="invoice-settings-card">
            <div className="invoice-settings-card-header">
              <div>
                <h2>Invoice Defaults</h2>
                <p>
                  Configure the default values used when creating
                  invoices.
                </p>
              </div>
            </div>

            <div className="invoice-settings-card-body">
              <div className="invoice-settings-grid">
                <div className="invoice-settings-field">
                  <Input
                    label="Invoice Prefix"
                    name="prefix"
                    value={formData.prefix}
                    onChange={handleChange}
                    placeholder="Example: INV-"
                  />
                </div>

                <div className="invoice-settings-field">
                  <Input
                    label="Starting Number"
                    name="startingNumber"
                    type="number"
                    min="1"
                    value={formData.startingNumber}
                    onChange={handleChange}
                    placeholder="Enter starting number"
                  />
                </div>

                <div className="invoice-settings-field">
                  <Input
                    label="Default Tax Rate (%)"
                    name="defaultTaxRate"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.defaultTaxRate}
                    onChange={handleChange}
                    placeholder="Enter tax rate"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="invoice-settings-card">
            <div className="invoice-settings-card-header">
              <div>
                <h2>Invoice Content</h2>
                <p>
                  Configure the default notes and terms displayed
                  on invoices.
                </p>
              </div>
            </div>

            <div className="invoice-settings-card-body">
              <div className="invoice-settings-content-grid">
                <div className="invoice-settings-field full-width">
                  <Textarea
                    label="Notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Enter default invoice notes"
                    rows={4}
                  />
                </div>

                <div className="invoice-settings-field full-width">
                  <Textarea
                    label="Terms and Conditions"
                    name="termsAndConditions"
                    value={formData.termsAndConditions}
                    onChange={handleChange}
                    placeholder="Enter invoice terms and conditions"
                    rows={6}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="invoice-settings-card">
            <div className="invoice-settings-card-header">
              <div>
                <h2>Document Display</h2>
                <p>
                  Choose which information should be displayed on
                  invoice documents.
                </p>
              </div>
            </div>

            <div className="invoice-settings-card-body">
              <div className="invoice-display-options">
                <label className="invoice-display-option">
                  <input
                    type="checkbox"
                    name="showCompanyDetails"
                    checked={formData.showCompanyDetails}
                    onChange={handleChange}
                  />

                  <span>
                    <strong>Show Company Details</strong>
                    <small>
                      Display company information on the invoice.
                    </small>
                  </span>
                </label>

                <label className="invoice-display-option">
                  <input
                    type="checkbox"
                    name="showBankDetails"
                    checked={formData.showBankDetails}
                    onChange={handleChange}
                  />

                  <span>
                    <strong>Show Bank Details</strong>
                    <small>
                      Display bank information on the invoice.
                    </small>
                  </span>
                </label>

                <label className="invoice-display-option">
                  <input
                    type="checkbox"
                    name="showTermsAndConditions"
                    checked={
                      formData.showTermsAndConditions
                    }
                    onChange={handleChange}
                  />

                  <span>
                    <strong>Show Terms and Conditions</strong>
                    <small>
                      Display terms and conditions on the invoice.
                    </small>
                  </span>
                </label>
              </div>
            </div>
          </section>

          <section className="invoice-settings-card">
            <div className="invoice-settings-card-header">
              <div>
                <h2>Invoice Preview</h2>
                <p>
                  Preview the default invoice configuration.
                </p>
              </div>
            </div>

            <div className="invoice-settings-card-body">
              <div className="invoice-preview">
                <div className="invoice-preview-top">
                  <div>
                    <span className="invoice-preview-label">
                      Invoice Number
                    </span>

                    <strong>
                      {formData.prefix || "INV-"}
                      {String(
                        formData.startingNumber || 1
                      ).padStart(5, "0")}
                    </strong>
                  </div>

                  <div className="invoice-preview-status">
                    <span className="invoice-preview-label">
                      Document Type
                    </span>

                    <strong>Invoice</strong>
                  </div>
                </div>

                <div className="invoice-preview-divider" />

                <div className="invoice-preview-details">
                  <div>
                    <span>Default Tax Rate</span>
                    <strong>
                      {formData.defaultTaxRate || 0}%
                    </strong>
                  </div>

                  <div>
                    <span>Company Details</span>
                    <strong>
                      {formData.showCompanyDetails
                        ? "Visible"
                        : "Hidden"}
                    </strong>
                  </div>

                  <div>
                    <span>Bank Details</span>
                    <strong>
                      {formData.showBankDetails
                        ? "Visible"
                        : "Hidden"}
                    </strong>
                  </div>

                  <div>
                    <span>Terms and Conditions</span>
                    <strong>
                      {formData.showTermsAndConditions
                        ? "Visible"
                        : "Hidden"}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="invoice-settings-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={handleReset}
              disabled={saving}
            >
              Reset
            </Button>

            <Button
              type="submit"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default InvoiceSettingsPage;