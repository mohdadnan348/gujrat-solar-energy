"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import employeeService from "@/services/employee.service";

import "./create-employee.css";

const initialForm = {
  employeeId: "",
  firstName: "",
  lastName: "",
  email: "",
  mobile: "",
  alternateMobile: "",
  department: "",
  designation: "",
  joiningDate: "",
  address: "",
  notes: "",
};

const generateEmployeeId = () => {
  const randomNumber = Math.floor(
    100000 + Math.random() * 900000
  );

  return `EMP-${randomNumber}`;
};

const CreateEmployeePage = () => {
  const router = useRouter();

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: "",
    }));

    setSubmitError("");
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.firstName.trim()) {
      nextErrors.firstName = "First name is required.";
    }

    if (!form.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        form.email.trim()
      )
    ) {
      nextErrors.email =
        "Enter a valid email address.";
    }

    if (!form.mobile.trim()) {
      nextErrors.mobile =
        "Mobile number is required.";
    }

    if (!form.joiningDate) {
      nextErrors.joiningDate =
        "Joining date is required.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const buildPayload = () => {
    const fullName = [
      form.firstName.trim(),
      form.lastName.trim(),
    ]
      .filter(Boolean)
      .join(" ");

    return {
      employeeId:
        form.employeeId.trim() ||
        generateEmployeeId(),

      name: fullName,

      email: form.email.trim().toLowerCase(),

      mobile: form.mobile.trim(),

      alternateMobile:
        form.alternateMobile.trim() || undefined,

      department:
        form.department.trim() || undefined,

      designation:
        form.designation.trim() || undefined,

      joiningDate:
        form.joiningDate || undefined,

      // HR panel se ONLY EMPLOYEE create hoga
      role: "EMPLOYEE",

      address: form.address.trim(),

      notes: form.notes.trim(),
    };
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setSaving(true);
      setSubmitError("");

      await employeeService.createEmployee(
        buildPayload()
      );

      router.push("/hr/employees");
    } catch (error) {
      console.error(
        "Failed to create employee:",
        error
      );

      const backendMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.response?.data?.errors?.[0];

      setSubmitError(
        backendMessage ||
          error?.message ||
          "Unable to create employee."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push("/hr/employees");
  };

  return (
    <div className="hr-create-employee-page">

        {/* Header */}
        <div className="hr-create-employee-header">
          <div>
            <button
              type="button"
              className="hr-back-button"
              onClick={handleCancel}
            >
              <span aria-hidden="true">
                ←
              </span>

              Back to Employees
            </button>

            <span className="hr-create-eyebrow">
              Human Resources
            </span>

            <h1>Create Employee</h1>

            <p>
              Add a new employee profile to the
              organization.
            </p>
          </div>
        </div>

        {/* Error */}
        {submitError && (
          <div className="hr-create-error">
            <span>{submitError}</span>
          </div>
        )}

        <form
          className="hr-create-employee-form"
          onSubmit={handleSubmit}
          noValidate
        >

          {/* =========================
              PERSONAL INFORMATION
          ========================== */}
          <section className="hr-create-section">
            <div className="hr-create-section-header">
              <div className="hr-create-section-number">
                01
              </div>

              <div>
                <h2>Personal Information</h2>

                <p>
                  Enter the employee&apos;s basic
                  personal details.
                </p>
              </div>
            </div>

            <div className="hr-create-fields">

              {/* First Name */}
              <div className="hr-field">
                <label htmlFor="firstName">
                  First Name <span>*</span>
                </label>

                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="Enter first name"
                  className={
                    errors.firstName
                      ? "has-error"
                      : ""
                  }
                />

                {errors.firstName && (
                  <small>
                    {errors.firstName}
                  </small>
                )}
              </div>

              {/* Last Name */}
              <div className="hr-field">
                <label htmlFor="lastName">
                  Last Name
                </label>

                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="Enter last name"
                />
              </div>

              {/* Email */}
              <div className="hr-field">
                <label htmlFor="email">
                  Email Address <span>*</span>
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="employee@example.com"
                  className={
                    errors.email
                      ? "has-error"
                      : ""
                  }
                />

                {errors.email && (
                  <small>
                    {errors.email}
                  </small>
                )}
              </div>

              {/* Mobile */}
              <div className="hr-field">
                <label htmlFor="mobile">
                  Mobile Number <span>*</span>
                </label>

                <input
                  id="mobile"
                  name="mobile"
                  type="tel"
                  value={form.mobile}
                  onChange={handleChange}
                  placeholder="Enter mobile number"
                  className={
                    errors.mobile
                      ? "has-error"
                      : ""
                  }
                />

                {errors.mobile && (
                  <small>
                    {errors.mobile}
                  </small>
                )}
              </div>

              {/* Alternate Mobile */}
              <div className="hr-field">
                <label htmlFor="alternateMobile">
                  Alternate Mobile
                </label>

                <input
                  id="alternateMobile"
                  name="alternateMobile"
                  type="tel"
                  value={form.alternateMobile}
                  onChange={handleChange}
                  placeholder="Enter alternate mobile number"
                />
              </div>

              {/* Joining Date */}
              <div className="hr-field">
                <label htmlFor="joiningDate">
                  Joining Date <span>*</span>
                </label>

                <input
                  id="joiningDate"
                  name="joiningDate"
                  type="date"
                  value={form.joiningDate}
                  onChange={handleChange}
                  className={
                    errors.joiningDate
                      ? "has-error"
                      : ""
                  }
                />

                {errors.joiningDate && (
                  <small>
                    {errors.joiningDate}
                  </small>
                )}
              </div>
            </div>
          </section>

          {/* =========================
              EMPLOYMENT INFORMATION
          ========================== */}
          <section className="hr-create-section">
            <div className="hr-create-section-header">
              <div className="hr-create-section-number">
                02
              </div>

              <div>
                <h2>
                  Employment Information
                </h2>

                <p>
                  Configure the employee&apos;s
                  organization details.
                </p>
              </div>
            </div>

            <div className="hr-create-fields">

              {/* Employee ID */}
              <div className="hr-field">
                <label htmlFor="employeeId">
                  Employee ID
                </label>

                <input
                  id="employeeId"
                  name="employeeId"
                  type="text"
                  value={form.employeeId}
                  onChange={handleChange}
                  placeholder="Auto-generated if empty"
                />

                <small
                  style={{
                    color: "#7a867f",
                    fontWeight: 500,
                  }}
                >
                  Leave empty to generate
                  automatically.
                </small>
              </div>

              {/* Fixed Role */}
              <div className="hr-field">
                <label>
                  Role
                </label>

                <input
                  type="text"
                  value="Employee"
                  disabled
                  readOnly
                />

                <small
                  style={{
                    color: "#16834b",
                    fontWeight: 600,
                  }}
                >
                  HR panel can create only
                  Employee accounts.
                </small>
              </div>

              {/* Department */}
              <div className="hr-field">
                <label htmlFor="department">
                  Department
                </label>

                <input
                  id="department"
                  name="department"
                  type="text"
                  value={form.department}
                  onChange={handleChange}
                  placeholder="Enter department"
                />
              </div>

              {/* Designation */}
              <div className="hr-field">
                <label htmlFor="designation">
                  Designation
                </label>

                <input
                  id="designation"
                  name="designation"
                  type="text"
                  value={form.designation}
                  onChange={handleChange}
                  placeholder="Enter designation"
                />
              </div>
            </div>
          </section>

          {/* =========================
              ADDRESS INFORMATION
          ========================== */}
          <section className="hr-create-section">
            <div className="hr-create-section-header">
              <div className="hr-create-section-number">
                03
              </div>

              <div>
                <h2>
                  Address Information
                </h2>

                <p>
                  Add the employee&apos;s current
                  contact address.
                </p>
              </div>
            </div>

            <div className="hr-create-fields">
              <div className="hr-field hr-field-full">
                <label htmlFor="address">
                  Address
                </label>

                <textarea
                  id="address"
                  name="address"
                  rows={3}
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Enter complete address"
                />
              </div>
            </div>
          </section>

          {/* =========================
              ADDITIONAL INFORMATION
          ========================== */}
          <section className="hr-create-section">
            <div className="hr-create-section-header">
              <div className="hr-create-section-number">
                04
              </div>

              <div>
                <h2>
                  Additional Information
                </h2>

                <p>
                  Add optional notes related to
                  the employee.
                </p>
              </div>
            </div>

            <div className="hr-create-fields">
              <div className="hr-field hr-field-full">
                <label htmlFor="notes">
                  Notes
                </label>

                <textarea
                  id="notes"
                  name="notes"
                  rows={4}
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Enter additional notes"
                />
              </div>
            </div>
          </section>

          {/* Actions */}
          <div className="hr-create-actions">
            <button
              type="button"
              className="hr-create-cancel"
              onClick={handleCancel}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="hr-create-submit"
              disabled={saving}
            >
              {saving
                ? "Creating Employee..."
                : "Create Employee"}
            </button>
          </div>

        </form>
    </div>
  );
};

export default CreateEmployeePage;