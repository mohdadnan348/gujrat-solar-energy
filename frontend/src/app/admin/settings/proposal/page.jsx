"use client";

import React, { useEffect, useState } from "react";
import AdminLayout from "@/app/admin/layout";
import settingService from "@/services/setting.service";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Textarea from "@/components/common/Textarea";
import Loader from "@/components/common/Loader";
import "./proposal-settings.css";

const DEFAULT_SETTINGS = {
  proposalTitle: "Solar Energy Proposal",
  proposalSubtitle: "Complete Solar Power Solution",
  validityDays: 15,
  paymentTerms:
    "50% advance with order, 40% before dispatch and 10% after installation and commissioning.",
  installationTerms:
    "Installation will be completed as per the agreed project schedule and site conditions.",
  warrantyTerms:
    "Product and installation warranty will be applicable as per manufacturer and company warranty terms.",
  scopeOfWork:
    "Site survey, system design, supply of solar components, installation, testing and commissioning.",
  exclusions:
    "Civil work, additional electrical work and any items not specifically mentioned in the quotation are excluded.",
  notes:
    "This proposal is subject to site feasibility, technical verification and final approval.",
  footerText: "Thank you for choosing GUJRAT SOLAR ENERGY.",
};

const ProposalSettingsPage = () => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    setError("");

    try {
      let response = null;

      if (typeof settingService.getProposalSettings === "function") {
        response = await settingService.getProposalSettings();
      } else if (typeof settingService.getSettings === "function") {
        response = await settingService.getSettings();
      }

      const data = response?.data || response;

      if (data && typeof data === "object") {
        const proposalData = data.proposal || data.proposalSettings || data;

        setSettings((prev) => ({
          ...prev,
          ...proposalData,
        }));
      }
    } catch (err) {
      setError(
        err?.message ||
          "Unable to load proposal settings. Default values are being displayed."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }));

    setSuccess("");
    setError("");
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    setSuccess("");
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        proposal: {
          ...settings,
          validityDays: Number(settings.validityDays) || 15,
        },
      };

      if (typeof settingService.updateProposalSettings === "function") {
        await settingService.updateProposalSettings(payload);
      } else if (typeof settingService.updateSettings === "function") {
        await settingService.updateSettings(payload);
      } else if (typeof settingService.update === "function") {
        await settingService.update("proposal", payload.proposal);
      } else {
        throw new Error(
          "Proposal settings API is not available in the current settings service."
        );
      }

      setSuccess("Proposal settings have been saved successfully.");
    } catch (err) {
      setError(
        err?.message ||
          "Unable to save proposal settings. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="proposal-settings-loading">
          <Loader />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="proposal-settings-page">
        <div className="proposal-settings-header">
          <div>
            <h1>Proposal Settings</h1>
            <p>
              Configure default content and terms used when preparing solar
              proposals.
            </p>
          </div>

          <div className="proposal-settings-header-actions">
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
              form="proposal-settings-form"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

        {error && (
          <div className="proposal-settings-alert proposal-settings-error">
            {error}
          </div>
        )}

        {success && (
          <div className="proposal-settings-alert proposal-settings-success">
            {success}
          </div>
        )}

        <form
          id="proposal-settings-form"
          className="proposal-settings-form"
          onSubmit={handleSubmit}
        >
          <section className="proposal-settings-card">
            <div className="proposal-settings-card-header">
              <div>
                <h2>Proposal Header</h2>
                <p>Set the default heading information for proposals.</p>
              </div>
            </div>

            <div className="proposal-settings-grid">
              <div className="proposal-settings-field">
                <Input
                  label="Proposal Title"
                  name="proposalTitle"
                  value={settings.proposalTitle}
                  onChange={handleChange}
                  placeholder="Solar Energy Proposal"
                />
              </div>

              <div className="proposal-settings-field">
                <Input
                  label="Proposal Subtitle"
                  name="proposalSubtitle"
                  value={settings.proposalSubtitle}
                  onChange={handleChange}
                  placeholder="Complete Solar Power Solution"
                />
              </div>

              <div className="proposal-settings-field">
                <Input
                  label="Validity Period (Days)"
                  name="validityDays"
                  type="number"
                  min="1"
                  value={settings.validityDays}
                  onChange={handleChange}
                  placeholder="15"
                />
              </div>
            </div>
          </section>

          <section className="proposal-settings-card">
            <div className="proposal-settings-card-header">
              <div>
                <h2>Commercial Terms</h2>
                <p>
                  Configure the default commercial information displayed in
                  proposals.
                </p>
              </div>
            </div>

            <div className="proposal-settings-grid">
              <div className="proposal-settings-field proposal-settings-full">
                <Textarea
                  label="Payment Terms"
                  name="paymentTerms"
                  value={settings.paymentTerms}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Enter default payment terms..."
                />
              </div>

              <div className="proposal-settings-field proposal-settings-full">
                <Textarea
                  label="Installation Terms"
                  name="installationTerms"
                  value={settings.installationTerms}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Enter installation terms..."
                />
              </div>

              <div className="proposal-settings-field proposal-settings-full">
                <Textarea
                  label="Warranty Terms"
                  name="warrantyTerms"
                  value={settings.warrantyTerms}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Enter warranty terms..."
                />
              </div>
            </div>
          </section>

          <section className="proposal-settings-card">
            <div className="proposal-settings-card-header">
              <div>
                <h2>Project Scope</h2>
                <p>
                  Define the default scope and exclusions for solar projects.
                </p>
              </div>
            </div>

            <div className="proposal-settings-grid">
              <div className="proposal-settings-field proposal-settings-full">
                <Textarea
                  label="Scope of Work"
                  name="scopeOfWork"
                  value={settings.scopeOfWork}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Enter default scope of work..."
                />
              </div>

              <div className="proposal-settings-field proposal-settings-full">
                <Textarea
                  label="Exclusions"
                  name="exclusions"
                  value={settings.exclusions}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Enter default exclusions..."
                />
              </div>
            </div>
          </section>

          <section className="proposal-settings-card">
            <div className="proposal-settings-card-header">
              <div>
                <h2>Additional Information</h2>
                <p>
                  Add default notes and closing text for customer proposals.
                </p>
              </div>
            </div>

            <div className="proposal-settings-grid">
              <div className="proposal-settings-field proposal-settings-full">
                <Textarea
                  label="Proposal Notes"
                  name="notes"
                  value={settings.notes}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Enter proposal notes..."
                />
              </div>

              <div className="proposal-settings-field proposal-settings-full">
                <Textarea
                  label="Footer Text"
                  name="footerText"
                  value={settings.footerText}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Enter proposal footer text..."
                />
              </div>
            </div>
          </section>

          <div className="proposal-settings-bottom-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={handleReset}
              disabled={saving}
            >
              Reset
            </Button>

            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Proposal Settings"}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default ProposalSettingsPage;