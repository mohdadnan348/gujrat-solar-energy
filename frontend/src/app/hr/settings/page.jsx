"use client";

import React, { useEffect, useState } from "react";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import Loader from "@/components/common/Loader";
import settingService from "@/services/setting.service";
import "./settings.css";

const DEFAULT_SETTINGS = {
  companyName: "GUJRAT SOLAR ENERGY",
  email: "gujratsolar14@gmail.com",
  phone: "+91 8545909039",
  address:
    "83/161-3 PARAMPURWA, JUHI, Kanpur, Kanpur Nagar, UTTAR PRADESH, 208014",
  website: "www.gujratsolarenergy.com",
  gstin: "09GBQPS0127B1ZL",

  timezone: "Asia/Kolkata",
  dateFormat: "DD/MM/YYYY",
  workingDays: "MON-FRI",
  workingStartTime: "09:30",
  workingEndTime: "18:30",

  leaveApproval: "MANAGER",
};

const HrSettingsPage = () => {
  const [settings, setSettings] =
    useState(DEFAULT_SETTINGS);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [activeSection, setActiveSection] =
    useState("company");

  /* ----------------------------------
     Load Settings
  ---------------------------------- */

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const response =
        await settingService.getSettings();

      const data =
        response?.data?.settings ||
        response?.data?.data ||
        response?.settings ||
        response?.data;

      if (
        data &&
        typeof data === "object" &&
        !Array.isArray(data)
      ) {
        setSettings((previous) => ({
          ...previous,
          ...data,
        }));
      }
    } catch (err) {
      console.error(
        "HR settings loading error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load settings."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  /* ----------------------------------
     Update Field
  ---------------------------------- */

  const updateField = (field, value) => {
    setSettings((previous) => ({
      ...previous,
      [field]: value,
    }));

    setMessage("");
    setError("");
  };

  /* ----------------------------------
     Save Settings
  ---------------------------------- */

  const handleSave = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setMessage("");
      setError("");

      await settingService.updateSettings(
        settings
      );

      setMessage(
        "Settings updated successfully."
      );
    } catch (err) {
      console.error(
        "HR settings update error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to update settings."
      );
    } finally {
      setSaving(false);
    }
  };

  /* ----------------------------------
     Loading
  ---------------------------------- */

  if (loading) {
    return (
      <div className="hr-settings-loading">
        <Loader />
      </div>
    );
  }

  /* ----------------------------------
     UI
  ---------------------------------- */

  return (
    <div className="hr-settings-page">
      {/* ================================
          PAGE HEADER
      ================================= */}

      <div className="hr-settings-header">
        <div>
          <div className="hr-settings-breadcrumb">
            HR <span>/</span> Settings
          </div>

          <h1>HR Settings</h1>

          <p>
            Manage company information and HR
            working preferences.
          </p>
        </div>

        <Button
          type="button"
          variant="secondary"
          onClick={loadSettings}
          disabled={saving || loading}
        >
          ↻ Refresh
        </Button>
      </div>

      {/* ================================
          SETTINGS LAYOUT
      ================================= */}

      <div className="hr-settings-layout">
        {/* ==============================
            SIDEBAR
        ============================== */}

        <aside className="hr-settings-sidebar">
          {/* Company */}

          <button
            type="button"
            className={`hr-settings-nav-item ${
              activeSection === "company"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActiveSection("company")
            }
          >
            <span className="hr-settings-nav-icon">
              🏢
            </span>

            <span>
              <strong>
                Company Information
              </strong>

              <small>
                Basic company details
              </small>
            </span>
          </button>

          {/* Working */}

          <button
            type="button"
            className={`hr-settings-nav-item ${
              activeSection === "working"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActiveSection("working")
            }
          >
            <span className="hr-settings-nav-icon">
              🕘
            </span>

            <span>
              <strong>
                Working Preferences
              </strong>

              <small>
                Office timing &amp; attendance
              </small>
            </span>
          </button>

          {/* Leave */}

          <button
            type="button"
            className={`hr-settings-nav-item ${
              activeSection === "leave"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActiveSection("leave")
            }
          >
            <span className="hr-settings-nav-icon">
              📅
            </span>

            <span>
              <strong>
                Leave Settings
              </strong>

              <small>
                Leave approval workflow
              </small>
            </span>
          </button>
        </aside>

        {/* ==============================
            CONTENT
        ============================== */}

        <main className="hr-settings-content">
          {/* Success */}

          {message && (
            <div className="hr-settings-success">
              <span>✓</span>
              {message}
            </div>
          )}

          {/* Error */}

          {error && (
            <div className="hr-settings-error">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSave}>
            {/* =================================
                COMPANY INFORMATION
            ================================= */}

            {activeSection === "company" && (
              <section className="hr-settings-section">
                <div className="hr-settings-section-header">
                  <div>
                    <h2>
                      Company Information
                    </h2>

                    <p>
                      Details used across the HR
                      and company management system.
                    </p>
                  </div>
                </div>

                <div className="hr-settings-form-grid">
                  <Input
                    label="Company Name"
                    value={
                      settings.companyName
                    }
                    onChange={(event) =>
                      updateField(
                        "companyName",
                        event.target.value
                      )
                    }
                  />

                  <Input
                    label="GSTIN"
                    value={settings.gstin}
                    onChange={(event) =>
                      updateField(
                        "gstin",
                        event.target.value
                      )
                    }
                  />

                  <Input
                    label="Company Email"
                    type="email"
                    value={settings.email}
                    onChange={(event) =>
                      updateField(
                        "email",
                        event.target.value
                      )
                    }
                  />

                  <Input
                    label="Company Phone"
                    value={settings.phone}
                    onChange={(event) =>
                      updateField(
                        "phone",
                        event.target.value
                      )
                    }
                  />

                  <Input
                    label="Website"
                    value={settings.website}
                    onChange={(event) =>
                      updateField(
                        "website",
                        event.target.value
                      )
                    }
                  />

                  <div className="hr-settings-full-field">
                    <Input
                      label="Company Address"
                      value={settings.address}
                      onChange={(event) =>
                        updateField(
                          "address",
                          event.target.value
                        )
                      }
                    />
                  </div>
                </div>
              </section>
            )}

            {/* =================================
                WORKING PREFERENCES
            ================================= */}

            {activeSection === "working" && (
              <section className="hr-settings-section">
                <div className="hr-settings-section-header">
                  <div>
                    <h2>
                      Working Preferences
                    </h2>

                    <p>
                      Configure office timing,
                      working days and date
                      preferences.
                    </p>
                  </div>
                </div>

                <div className="hr-settings-form-grid">
                  <Select
                    label="Timezone"
                    value={settings.timezone}
                    onChange={(event) =>
                      updateField(
                        "timezone",
                        event.target.value
                      )
                    }
                    options={[
                      {
                        label:
                          "India Standard Time (IST)",
                        value: "Asia/Kolkata",
                      },
                      {
                        label: "UTC",
                        value: "UTC",
                      },
                    ]}
                  />

                  <Select
                    label="Date Format"
                    value={settings.dateFormat}
                    onChange={(event) =>
                      updateField(
                        "dateFormat",
                        event.target.value
                      )
                    }
                    options={[
                      {
                        label: "DD/MM/YYYY",
                        value: "DD/MM/YYYY",
                      },
                      {
                        label: "MM/DD/YYYY",
                        value: "MM/DD/YYYY",
                      },
                      {
                        label: "YYYY-MM-DD",
                        value: "YYYY-MM-DD",
                      },
                    ]}
                  />

                  <Select
                    label="Working Days"
                    value={settings.workingDays}
                    onChange={(event) =>
                      updateField(
                        "workingDays",
                        event.target.value
                      )
                    }
                    options={[
                      {
                        label:
                          "Monday - Friday",
                        value: "MON-FRI",
                      },
                      {
                        label:
                          "Monday - Saturday",
                        value: "MON-SAT",
                      },
                      {
                        label:
                          "Monday - Sunday",
                        value: "MON-SUN",
                      },
                    ]}
                  />

                  <div />

                  <Input
                    label="Office Start Time"
                    type="time"
                    value={
                      settings.workingStartTime
                    }
                    onChange={(event) =>
                      updateField(
                        "workingStartTime",
                        event.target.value
                      )
                    }
                  />

                  <Input
                    label="Office End Time"
                    type="time"
                    value={
                      settings.workingEndTime
                    }
                    onChange={(event) =>
                      updateField(
                        "workingEndTime",
                        event.target.value
                      )
                    }
                  />
                </div>
              </section>
            )}

            {/* =================================
                LEAVE SETTINGS
            ================================= */}

            {activeSection === "leave" && (
              <section className="hr-settings-section">
                <div className="hr-settings-section-header">
                  <div>
                    <h2>
                      Leave Settings
                    </h2>

                    <p>
                      Configure who handles
                      employee leave approvals.
                    </p>
                  </div>
                </div>

                <div className="hr-settings-form-grid">
                  <Select
                    label="Leave Approval"
                    value={
                      settings.leaveApproval
                    }
                    onChange={(event) =>
                      updateField(
                        "leaveApproval",
                        event.target.value
                      )
                    }
                    options={[
                      {
                        label: "Manager",
                        value: "MANAGER",
                      },
                      {
                        label: "HR",
                        value: "HR",
                      },
                      {
                        label: "Admin",
                        value: "ADMIN",
                      },
                    ]}
                  />
                </div>

                <div className="hr-settings-info-box">
                  <div className="hr-settings-info-icon">
                    ℹ
                  </div>

                  <div>
                    <strong>
                      Leave approval workflow
                    </strong>

                    <p>
                      New leave requests will
                      follow the selected approval
                      workflow. The final workflow
                      behavior depends on the
                      configured backend permissions.
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* =================================
                FOOTER
            ================================= */}

            <div className="hr-settings-footer">
              <Button
                type="submit"
                variant="primary"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </Button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default HrSettingsPage;