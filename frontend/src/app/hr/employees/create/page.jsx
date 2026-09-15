"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import employeeService from "@/services/employee.service";
import { useAuth } from "@/hooks/useAuth";

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  alternatePhone: "",
  role: "EMPLOYEE",
  department: "",
  designation: "",
  joiningDate: "",
  dateOfBirth: "",
  gender: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  emergencyContactRelation: "",
};

const CreateEmployeePage = () => {
  const router = useRouter();
  const { user, logout, loading: authLoading } = useAuth();

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

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
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
    ) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!form.phone.trim()) {
      nextErrors.phone = "Phone number is required.";
    }

    if (!form.role) {
      nextErrors.role = "Role is required.";
    }

    if (!form.joiningDate) {
      nextErrors.joiningDate =
        "Joining date is required.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const buildPayload = () => {
    return {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      alternatePhone: form.alternatePhone.trim(),
      role: form.role,
      department: form.department.trim(),
      designation: form.designation.trim(),
      joiningDate: form.joiningDate || undefined,
      dateOfBirth: form.dateOfBirth || undefined,
      gender: form.gender || undefined,
      address: form.address.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      pincode: form.pincode.trim(),
      emergencyContactName:
        form.emergencyContactName.trim(),
      emergencyContactPhone:
        form.emergencyContactPhone.trim(),
      emergencyContactRelation:
        form.emergencyContactRelation.trim(),
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
        error?.response?.data?.error;

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

  if (authLoading) {
    return (
      <div className="hr-create-employee-loading">
        Loading...
      </div>
    );
  }

  return (
    <MainLayout
      user={user}
      onLogout={handleLogout}
      notificationCount={0}
    >
      <div className="hr-create-employee-page">
        <div className="hr-create-employee-header">
          <div>
            <button
              type="button"
              className="hr-back-button"
              onClick={handleCancel}
            >
              <span aria-hidden="true">←</span>
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
                  <small>{errors.firstName}</small>
                )}
              </div>

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
                    errors.email ? "has-error" : ""
                  }
                />

                {errors.email && (
                  <small>{errors.email}</small>
                )}
              </div>

              <div className="hr-field">
                <label htmlFor="phone">
                  Phone Number <span>*</span>
                </label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  className={
                    errors.phone ? "has-error" : ""
                  }
                />

                {errors.phone && (
                  <small>{errors.phone}</small>
                )}
              </div>

              <div className="hr-field">
                <label htmlFor="alternatePhone">
                  Alternate Phone
                </label>

                <input
                  id="alternatePhone"
                  name="alternatePhone"
                  type="tel"
                  value={form.alternatePhone}
                  onChange={handleChange}
                  placeholder="Enter alternate number"
                />
              </div>

              <div className="hr-field">
                <label htmlFor="dateOfBirth">
                  Date of Birth
                </label>

                <input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={form.dateOfBirth}
                  onChange={handleChange}
                />
              </div>

              <div className="hr-field">
                <label htmlFor="gender">
                  Gender
                </label>

                <select
                  id="gender"
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                >
                  <option value="">
                    Select gender
                  </option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">
                    Female
                  </option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>
          </section>

          <section className="hr-create-section">
            <div className="hr-create-section-header">
              <div className="hr-create-section-number">
                02
              </div>

              <div>
                <h2>Employment Information</h2>
                <p>
                  Configure the employee&apos;s role
                  and organization details.
                </p>
              </div>
            </div>

            <div className="hr-create-fields">
              <div className="hr-field">
                <label htmlFor="role">
                  Role <span>*</span>
                </label>

                <select
                  id="role"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className={
                    errors.role ? "has-error" : ""
                  }
                >
                  <option value="EMPLOYEE">
                    Employee
                  </option>
                  <option value="MANAGER">
                    Manager
                  </option>
                  <option value="HR">HR</option>
                </select>

                {errors.role && (
                  <small>{errors.role}</small>
                )}
              </div>

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

          <section className="hr-create-section">
            <div className="hr-create-section-header">
              <div className="hr-create-section-number">
                03
              </div>

              <div>
                <h2>Address Information</h2>
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

              <div className="hr-field">
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

              <div className="hr-field">
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

              <div className="hr-field">
                <label htmlFor="pincode">
                  Pincode
                </label>

                <input
                  id="pincode"
                  name="pincode"
                  type="text"
                  value={form.pincode}
                  onChange={handleChange}
                  placeholder="Enter pincode"
                />
              </div>
            </div>
          </section>

          <section className="hr-create-section">
            <div className="hr-create-section-header">
              <div className="hr-create-section-number">
                04
              </div>

              <div>
                <h2>Emergency Contact</h2>
                <p>
                  Add an emergency contact for the
                  employee.
                </p>
              </div>
            </div>

            <div className="hr-create-fields">
              <div className="hr-field">
                <label htmlFor="emergencyContactName">
                  Contact Name
                </label>

                <input
                  id="emergencyContactName"
                  name="emergencyContactName"
                  type="text"
                  value={form.emergencyContactName}
                  onChange={handleChange}
                  placeholder="Enter contact name"
                />
              </div>

              <div className="hr-field">
                <label htmlFor="emergencyContactPhone">
                  Contact Phone
                </label>

                <input
                  id="emergencyContactPhone"
                  name="emergencyContactPhone"
                  type="tel"
                  value={form.emergencyContactPhone}
                  onChange={handleChange}
                  placeholder="Enter contact phone"
                />
              </div>

              <div className="hr-field">
                <label htmlFor="emergencyContactRelation">
                  Relationship
                </label>

                <input
                  id="emergencyContactRelation"
                  name="emergencyContactRelation"
                  type="text"
                  value={
                    form.emergencyContactRelation
                  }
                  onChange={handleChange}
                  placeholder="Enter relationship"
                />
              </div>
            </div>
          </section>

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
    </MainLayout>
  );
};

export default CreateEmployeePage;