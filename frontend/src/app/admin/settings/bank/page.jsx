"use client";

import React, { useEffect, useState } from "react";
import AdminLayout from "@/app/admin/layout";
import settingService from "@/services/setting.service";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Loader from "@/components/common/Loader";
import "./bank-settings.css";

const DEFAULT_BANK = {
  bankName: "",
  accountName: "",
  accountNumber: "",
  ifscCode: "",
  branchName: "",
  branchAddress: "",
};

const getSettingValue = (response) => {
  const value = response?.data ?? response;

  if (value?.settings) return value.settings;
  if (value?.bank) return value.bank;

  if (value?.data && typeof value.data === "object") {
    return value.data;
  }

  return value || {};
};

const BankSettingsPage = () => {
  const [formData, setFormData] = useState(DEFAULT_BANK);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadBankSettings = async () => {
      try {
        setLoading(true);
        setError("");

        let response;

        if (
          typeof settingService.getBankSettings === "function"
        ) {
          response = await settingService.getBankSettings();
        } else if (
          typeof settingService.getBank === "function"
        ) {
          response = await settingService.getBank();
        } else if (
          typeof settingService.getSettings === "function"
        ) {
          response = await settingService.getSettings();
        } else {
          setLoading(false);
          return;
        }

        const bank = getSettingValue(response);

        setFormData((previous) => ({
          ...previous,
          ...bank,
        }));
      } catch (err) {
        console.error("Failed to load bank settings:", err);
        setError(
          err?.message ||
            "Unable to load bank settings. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    loadBankSettings();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
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
        typeof settingService.updateBankSettings ===
        "function"
      ) {
        await settingService.updateBankSettings(formData);
      } else if (
        typeof settingService.updateBank === "function"
      ) {
        await settingService.updateBank(formData);
      } else if (
        typeof settingService.updateSettings === "function"
      ) {
        await settingService.updateSettings(formData);
      } else {
        throw new Error(
          "Bank settings update method is not available."
        );
      }

      setSuccess("Bank settings updated successfully.");
    } catch (err) {
      console.error("Failed to update bank settings:", err);
      setError(
        err?.message ||
          "Unable to update bank settings. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setFormData(DEFAULT_BANK);
    setError("");
    setSuccess("");
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="bank-settings-loading">
          <Loader />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="bank-settings-page">
        <div className="bank-settings-header">
          <div>
            <h1>Bank Settings</h1>
            <p>
              Manage the bank account information used in business
              documents.
            </p>
          </div>
        </div>

        {error && (
          <div className="bank-settings-alert bank-settings-error">
            {error}
          </div>
        )}

        {success && (
          <div className="bank-settings-alert bank-settings-success">
            {success}
          </div>
        )}

        <form
          className="bank-settings-form"
          onSubmit={handleSubmit}
        >
          <section className="bank-settings-card">
            <div className="bank-settings-card-header">
              <div>
                <h2>Bank Account Information</h2>
                <p>
                  Enter the account details that should appear on
                  quotations, proposals, or invoices.
                </p>
              </div>
            </div>

            <div className="bank-settings-card-body">
              <div className="bank-settings-grid">
                <div className="bank-settings-field">
                  <Input
                    label="Bank Name"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleChange}
                    placeholder="Enter bank name"
                  />
                </div>

                <div className="bank-settings-field">
                  <Input
                    label="Account Name"
                    name="accountName"
                    value={formData.accountName}
                    onChange={handleChange}
                    placeholder="Enter account holder name"
                  />
                </div>

                <div className="bank-settings-field">
                  <Input
                    label="Account Number"
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={handleChange}
                    placeholder="Enter account number"
                  />
                </div>

                <div className="bank-settings-field">
                  <Input
                    label="IFSC Code"
                    name="ifscCode"
                    value={formData.ifscCode}
                    onChange={handleChange}
                    placeholder="Enter IFSC code"
                  />
                </div>

                <div className="bank-settings-field">
                  <Input
                    label="Branch Name"
                    name="branchName"
                    value={formData.branchName}
                    onChange={handleChange}
                    placeholder="Enter branch name"
                  />
                </div>

                <div className="bank-settings-field">
                  <Input
                    label="Branch Address"
                    name="branchAddress"
                    value={formData.branchAddress}
                    onChange={handleChange}
                    placeholder="Enter branch address"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="bank-settings-card">
            <div className="bank-settings-card-header">
              <div>
                <h2>Document Preview</h2>
                <p>
                  Preview how the bank information may appear in
                  business documents.
                </p>
              </div>
            </div>

            <div className="bank-settings-card-body">
              <div className="bank-document-preview">
                <div className="bank-document-preview-heading">
                  Bank Details
                </div>

                <div className="bank-document-preview-grid">
                  <div>
                    <span>Bank Name</span>
                    <strong>
                      {formData.bankName || "Not provided"}
                    </strong>
                  </div>

                  <div>
                    <span>Account Name</span>
                    <strong>
                      {formData.accountName || "Not provided"}
                    </strong>
                  </div>

                  <div>
                    <span>Account Number</span>
                    <strong>
                      {formData.accountNumber || "Not provided"}
                    </strong>
                  </div>

                  <div>
                    <span>IFSC Code</span>
                    <strong>
                      {formData.ifscCode || "Not provided"}
                    </strong>
                  </div>

                  <div>
                    <span>Branch Name</span>
                    <strong>
                      {formData.branchName || "Not provided"}
                    </strong>
                  </div>

                  <div>
                    <span>Branch Address</span>
                    <strong>
                      {formData.branchAddress || "Not provided"}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="bank-settings-actions">
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

export default BankSettingsPage;