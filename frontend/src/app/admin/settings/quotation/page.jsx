"use client";

import React, { useEffect, useState } from "react";
import AdminLayout from "@/app/admin/layout";
import settingService from "@/services/setting.service";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Textarea from "@/components/common/Textarea";
import Select from "@/components/common/Select";
import Loader from "@/components/common/Loader";
import "./quotation-settings.css";

const DEFAULT_QUOTATION_SETTINGS = {
  prefix: "EST-",
  startingNumber: 1,
  validityDays: 30,
  defaultTaxRate: 0,
  paymentTerms:
    "Payment terms will be as specified in the quotation.",
  notes: "",
  termsAndConditions:
    "This quotation is valid for the period mentioned above. Prices and specifications are subject to the terms stated in the quotation.",
  showCompanyDetails: true,
  showBankDetails: true,
  showTermsAndConditions: true,
};

const getSettingValue = (response) => {
  const value = response?.data ?? response;

  if (value?.settings) return value.settings;
  if (value?.quotation) return value.quotation;
  if (value?.quotationSettings) return value.quotationSettings;

  if (value?.data && typeof value.data === "object") {
    return value.data;
  }

  return value || {};
};

const QuotationSettingsPage = () => {
  const [formData, setFormData] = useState(
    DEFAULT_QUOTATION_SETTINGS
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadQuotationSettings = async () => {
      try {
        setLoading(true);
        setError("");

        let response;

        if (
          typeof settingService.getQuotationSettings ===
          "function"
        ) {
          response =
            await settingService.getQuotationSettings();
        } else if (
          typeof settingService.getQuotation === "function"
        ) {
          response = await settingService.getQuotation();
        } else if (
          typeof settingService.getSettings === "function"
        ) {
          response = await settingService.getSettings();
        } else {
          setLoading(false);
          return;
        }

        const quotation = getSettingValue(response);

        setFormData((previous) => ({
          ...previous,
          ...quotation,
        }));
      } catch (err) {
        console.error(
          "Failed to load quotation settings:",
          err
        );

        setError(
          err?.message ||
            "Unable to load quotation settings. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    loadQuotationSettings();
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
        typeof settingService.updateQuotationSettings ===
        "function"
      ) {
        await settingService.updateQuotationSettings(
          formData
        );
      } else if (
        typeof settingService.updateQuotation === "function"
      ) {
        await settingService.updateQuotation(formData);
      } else if (
        typeof settingService.updateSettings === "function"
      ) {
        await settingService.updateSettings(formData);
      } else {
        throw new Error(
          "Quotation settings update method is not available."
        );
      }

      setSuccess(
        "Quotation settings updated successfully."
      );
    } catch (err) {
      console.error(
        "Failed to update quotation settings:",
        err
      );

      setError(
        err?.message ||
          "Unable to update quotation settings. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setFormData(DEFAULT_QUOTATION_SETTINGS);
    setError("");
    setSuccess("");
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="quotation-settings-loading">
          <Loader />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="quotation-settings-page">
        <div className="quotation-settings-header">
          <div>
            <h1>Quotation Settings</h1>
            <p>
              Configure quotation numbering, validity, tax,
              terms, and document preferences.
            </p>
          </div>
        </div>

        {error && (
          <div className="quotation-settings-alert quotation-settings-error">
            {error}
          </div>
        )}

        {success && (
          <div className="quotation-settings-alert quotation-settings-success">
            {success}
          </div>
        )}

        <form
          className="quotation-settings-form"
          onSubmit={handleSubmit}
        >
          <section className="quotation-settings-card">
            <div className="quotation-settings-card-header">
              <div>
                <h2>Quotation Defaults</h2>
                <p>
                  Configure the default values used when creating
                  quotations.
                </p>
              </div>
            </div>

            <div className="quotation-settings-card-body">
              <div className="quotation-settings-grid">
                <div className="quotation-settings-field">
                  <Input
                    label="Quotation Prefix"
                    name="prefix"
                    value={formData.prefix}
                    onChange={handleChange}
                    placeholder="Example: EST-"
                  />
                </div>

                <div className="quotation-settings-field">
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

                <div className="quotation-settings-field">
                  <Input
                    label="Validity Period (Days)"
                    name="validityDays"
                    type="number"
                    min="1"
                    value={formData.validityDays}
                    onChange={handleChange}
                    placeholder="Enter validity days"
                  />
                </div>

                <div className="quotation-settings-field">
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

          <section className="quotation-settings-card">
            <div className="quotation-settings-card-header">
              <div>
                <h2>Quotation Content</h2>
                <p>
                  Set default payment terms, notes, and terms and
                  conditions.
                </p>
              </div>
            </div>

            <div className="quotation-settings-card-body">
              <div className="quotation-settings-content-grid">
                <div className="quotation-settings-field full-width">
                  <Textarea
                    label="Payment Terms"
                    name="paymentTerms"
                    value={formData.paymentTerms}
                    onChange={handleChange}
                    placeholder="Enter default payment terms"
                    rows={4}
                  />
                </div>

                <div className="quotation-settings-field full-width">
                  <Textarea
                    label="Notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Enter default quotation notes"
                    rows={4}
                  />
                </div>

                <div className="quotation-settings-field full-width">
                  <Textarea
                    label="Terms and Conditions"
                    name="termsAndConditions"
                    value={formData.termsAndConditions}
                    onChange={handleChange}
                    placeholder="Enter terms and conditions"
                    rows={6}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="quotation-settings-card">
            <div className="quotation-settings-card-header">
              <div>
                <h2>Document Display</h2>
                <p>
                  Choose which information should be displayed on
                  quotation documents.
                </p>
              </div>
            </div>

            <div className="quotation-settings-card-body">
              <div className="quotation-display-options">
                <label className="quotation-display-option">
                  <input
                    type="checkbox"
                    name="showCompanyDetails"
                    checked={formData.showCompanyDetails}
                    onChange={handleChange}
                  />

                  <span>
                    <strong>Show Company Details</strong>
                    <small>
                      Display company information on the quotation.
                    </small>
                  </span>
                </label>

                <label className="quotation-display-option">
                  <input
                    type="checkbox"
                    name="showBankDetails"
                    checked={formData.showBankDetails}
                    onChange={handleChange}
                  />

                  <span>
                    <strong>Show Bank Details</strong>
                    <small>
                      Display bank information on the quotation.
                    </small>
                  </span>
                </label>

                <label className="quotation-display-option">
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
                      Display terms and conditions on the quotation.
                    </small>
                  </span>
                </label>
              </div>
            </div>
          </section>

          <section className="quotation-settings-card">
            <div className="quotation-settings-card-header">
              <div>
                <h2>Quotation Preview</h2>
                <p>
                  Preview the default quotation information before
                  saving your configuration.
                </p>
              </div>
            </div>

            <div className="quotation-settings-card-body">
              <div className="quotation-preview">
                <div className="quotation-preview-top">
                  <div>
                    <span className="quotation-preview-label">
                      Quotation Number
                    </span>
                    <strong>
                      {formData.prefix || "EST-"}
                      {String(
                        formData.startingNumber || 1
                      ).padStart(5, "0")}
                    </strong>
                  </div>

                  <div className="quotation-preview-validity">
                    <span className="quotation-preview-label">
                      Validity
                    </span>
                    <strong>
                      {formData.validityDays || 0} Days
                    </strong>
                  </div>
                </div>

                <div className="quotation-preview-divider" />

                <div className="quotation-preview-details">
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

          <div className="quotation-settings-actions">
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

export default QuotationSettingsPage;