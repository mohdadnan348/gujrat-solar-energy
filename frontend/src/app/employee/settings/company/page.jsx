"use client";

import { useEffect, useState } from "react";
import Button from "@/components/common/Button";
import settingService from "@/services/setting.service";
import "./company-settings.css";

const initialForm = {
  companyName: "",
  legalName: "",
  gstin: "",
  email: "",
  mobile: "",
  alternateMobile: "",
  website: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
};

export default function CompanySettingsPage() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadCompanySettings();
  }, []);

  const loadCompanySettings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await settingService.getSettings();

      const data = response?.data?.data || response?.data || {};

      const company = data?.company || data?.companyProfile || data;

      setForm((prev) => ({
        ...prev,
        ...company,
      }));
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to load company settings."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (message) setMessage("");
    if (error) setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setMessage("");
      setError("");

      await settingService.updateCompany(form);

      setMessage("Company settings updated successfully.");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to update company settings."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    loadCompanySettings();
    setMessage("");
    setError("");
  };

  if (loading) {
    return (
      <div className="company-settings-page">
        <div className="company-settings-loading">
          <div className="company-settings-spinner" />
          <p>Loading company settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="company-settings-page">
      <div className="company-settings-header">
        <div>
          <span className="company-settings-eyebrow">
            Settings
          </span>

          <h1>Company Settings</h1>

          <p>
            Manage your company information used across the
            management system and generated documents.
          </p>
        </div>
      </div>

      {message && (
        <div className="company-settings-alert company-settings-alert-success">
          <span className="company-settings-alert-icon">✓</span>
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="company-settings-alert company-settings-alert-error">
          <span className="company-settings-alert-icon">!</span>
          <span>{error}</span>
        </div>
      )}

      <form
        className="company-settings-form"
        onSubmit={handleSubmit}
      >
        <section className="company-settings-card">
          <div className="company-settings-card-header">
            <div>
              <h2>Basic Information</h2>
              <p>
                Enter the primary information of your company.
              </p>
            </div>
          </div>

          <div className="company-settings-grid">
            <div className="company-settings-field company-settings-field-full">
              <label htmlFor="companyName">
                Company Name <span>*</span>
              </label>

              <input
                id="companyName"
                name="companyName"
                type="text"
                value={form.companyName}
                onChange={handleChange}
                placeholder="Enter company name"
                required
              />
            </div>

            <div className="company-settings-field">
              <label htmlFor="legalName">Legal Name</label>

              <input
                id="legalName"
                name="legalName"
                type="text"
                value={form.legalName}
                onChange={handleChange}
                placeholder="Enter legal name"
              />
            </div>

            <div className="company-settings-field">
              <label htmlFor="gstin">GSTIN</label>

              <input
                id="gstin"
                name="gstin"
                type="text"
                value={form.gstin}
                onChange={handleChange}
                placeholder="Enter GSTIN"
                maxLength={15}
              />
            </div>
          </div>
        </section>

        <section className="company-settings-card">
          <div className="company-settings-card-header">
            <div>
              <h2>Contact Information</h2>
              <p>
                Manage the contact details displayed on company
                documents.
              </p>
            </div>
          </div>

          <div className="company-settings-grid">
            <div className="company-settings-field">
              <label htmlFor="email">Email Address</label>

              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter email address"
              />
            </div>

            <div className="company-settings-field">
              <label htmlFor="mobile">Mobile Number</label>

              <input
                id="mobile"
                name="mobile"
                type="tel"
                value={form.mobile}
                onChange={handleChange}
                placeholder="Enter mobile number"
              />
            </div>

            <div className="company-settings-field">
              <label htmlFor="alternateMobile">
                Alternate Mobile
              </label>

              <input
                id="alternateMobile"
                name="alternateMobile"
                type="tel"
                value={form.alternateMobile}
                onChange={handleChange}
                placeholder="Enter alternate mobile"
              />
            </div>

            <div className="company-settings-field">
              <label htmlFor="website">Website</label>

              <input
                id="website"
                name="website"
                type="text"
                value={form.website}
                onChange={handleChange}
                placeholder="Enter website"
              />
            </div>
          </div>
        </section>

        <section className="company-settings-card">
          <div className="company-settings-card-header">
            <div>
              <h2>Business Address</h2>
              <p>
                Enter the registered business address.
              </p>
            </div>
          </div>

          <div className="company-settings-grid">
            <div className="company-settings-field company-settings-field-full">
              <label htmlFor="address">Address</label>

              <textarea
                id="address"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Enter complete business address"
                rows={4}
              />
            </div>

            <div className="company-settings-field">
              <label htmlFor="city">City</label>

              <input
                id="city"
                name="city"
                type="text"
                value={form.city}
                onChange={handleChange}
                placeholder="Enter city"
              />
            </div>

            <div className="company-settings-field">
              <label htmlFor="state">State</label>

              <input
                id="state"
                name="state"
                type="text"
                value={form.state}
                onChange={handleChange}
                placeholder="Enter state"
              />
            </div>

            <div className="company-settings-field">
              <label htmlFor="pincode">PIN Code</label>

              <input
                id="pincode"
                name="pincode"
                type="text"
                value={form.pincode}
                onChange={handleChange}
                placeholder="Enter PIN code"
                maxLength={6}
              />
            </div>

            <div className="company-settings-field">
              <label htmlFor="country">Country</label>

              <input
                id="country"
                name="country"
                type="text"
                value={form.country}
                onChange={handleChange}
                placeholder="Enter country"
              />
            </div>
          </div>
        </section>

        <div className="company-settings-actions">
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
            variant="primary"
            loading={saving}
            disabled={saving}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}