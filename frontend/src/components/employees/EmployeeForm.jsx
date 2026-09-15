"use client";

import { useEffect, useState } from "react";
import "./EmployeeForm.css";

const INITIAL_FORM = {
  employeeId: "",
  firstName: "",
  lastName: "",
  email: "",
  mobile: "",
  department: "",
  designation: "",
  role: "Employee",
  joiningDate: "",
  manager: "",
  status: "Active",
  address: "",
};

export default function EmployeeForm({
  employee,
  data,
  loading = false,
  saving = false,
  departments = [],
  managers = [],
  onSubmit,
  onCancel,
}) {
  const employeeData = employee || data;

  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!employeeData) {
      setForm(INITIAL_FORM);
      return;
    }

    setForm({
      employeeId:
        employeeData.employeeId ||
        employeeData.employeeCode ||
        "",
      firstName:
        employeeData.firstName ||
        employeeData.name?.split(" ")[0] ||
        "",
      lastName:
        employeeData.lastName ||
        employeeData.name
          ?.split(" ")
          .slice(1)
          .join(" ") ||
        "",
      email: employeeData.email || "",
      mobile:
        employeeData.mobile ||
        employeeData.phone ||
        "",
      department:
        employeeData.department?._id ||
        employeeData.department?.id ||
        employeeData.department ||
        "",
      designation:
        employeeData.designation?._id ||
        employeeData.designation?.id ||
        employeeData.designation ||
        "",
      role:
        employeeData.role?.name ||
        employeeData.role ||
        "Employee",
      joiningDate:
        employeeData.joiningDate ||
        employeeData.dateOfJoining ||
        "",
      manager:
        employeeData.manager?._id ||
        employeeData.manager?.id ||
        employeeData.manager ||
        "",
      status:
        employeeData.status ||
        employeeData.employeeStatus ||
        "Active",
      address:
        employeeData.address ||
        employeeData.currentAddress ||
        "",
    });
  }, [employeeData]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((previous) => ({
        ...previous,
        [name]: "",
      }));
    }
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.firstName.trim()) {
      nextErrors.firstName = "First name is required.";
    }

    if (!form.email.trim()) {
      nextErrors.email = "Email address is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
    ) {
      nextErrors.email =
        "Please enter a valid email address.";
    }

    if (!form.mobile.trim()) {
      nextErrors.mobile = "Mobile number is required.";
    }

    if (!form.department.trim()) {
      nextErrors.department =
        "Department is required.";
    }

    if (!form.designation.trim()) {
      nextErrors.designation =
        "Designation is required.";
    }

    if (!form.joiningDate) {
      nextErrors.joiningDate =
        "Joining date is required.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) return;

    const payload = {
      ...form,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      mobile: form.mobile.trim(),
      address: form.address.trim(),
    };

    if (onSubmit) {
      await onSubmit(payload);
    }
  };

  if (loading) {
    return (
      <div className="employee-form">
        <div className="employee-form__card">
          <div className="employee-form__loading">
            <span className="employee-form__spinner" />
            <span>Loading employee information...</span>
          </div>
        </div>
      </div>
    );
  }

  const getOptionValue = (item) => {
    if (typeof item === "string") return item;

    return item?._id || item?.id || item?.value || "";
  };

  const getOptionLabel = (item) => {
    if (typeof item === "string") return item;

    return (
      item?.name ||
      item?.label ||
      item?.title ||
      item?.fullName ||
      ""
    );
  };

  return (
    <form
      className="employee-form"
      onSubmit={handleSubmit}
    >
      <div className="employee-form__card">
        <div className="employee-form__header">
          <h1 className="employee-form__title">
            {employeeData
              ? "Edit Employee"
              : "Create Employee"}
          </h1>

          <p className="employee-form__description">
            {employeeData
              ? "Update employee information and employment details."
              : "Add a new employee to the company management system."}
          </p>
        </div>

        <div className="employee-form__body">
          <section className="employee-form__section">
            <h2 className="employee-form__section-title">
              Personal Information
            </h2>

            <div className="employee-form__grid">
              <div className="employee-form__field">
                <label
                  className="employee-form__label"
                  htmlFor="firstName"
                >
                  First Name{" "}
                  <span className="employee-form__required">
                    *
                  </span>
                </label>

                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  className={`employee-form__input ${
                    errors.firstName
                      ? "employee-form__input--error"
                      : ""
                  }`}
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="Enter first name"
                  disabled={saving}
                />

                {errors.firstName && (
                  <span className="employee-form__error">
                    {errors.firstName}
                  </span>
                )}
              </div>

              <div className="employee-form__field">
                <label
                  className="employee-form__label"
                  htmlFor="lastName"
                >
                  Last Name
                </label>

                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  className="employee-form__input"
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="Enter last name"
                  disabled={saving}
                />
              </div>

              <div className="employee-form__field">
                <label
                  className="employee-form__label"
                  htmlFor="email"
                >
                  Email Address{" "}
                  <span className="employee-form__required">
                    *
                  </span>
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  className={`employee-form__input ${
                    errors.email
                      ? "employee-form__input--error"
                      : ""
                  }`}
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  disabled={saving}
                />

                {errors.email && (
                  <span className="employee-form__error">
                    {errors.email}
                  </span>
                )}
              </div>

              <div className="employee-form__field">
                <label
                  className="employee-form__label"
                  htmlFor="mobile"
                >
                  Mobile Number{" "}
                  <span className="employee-form__required">
                    *
                  </span>
                </label>

                <input
                  id="mobile"
                  name="mobile"
                  type="tel"
                  className={`employee-form__input ${
                    errors.mobile
                      ? "employee-form__input--error"
                      : ""
                  }`}
                  value={form.mobile}
                  onChange={handleChange}
                  placeholder="Enter mobile number"
                  disabled={saving}
                />

                {errors.mobile && (
                  <span className="employee-form__error">
                    {errors.mobile}
                  </span>
                )}
              </div>

              <div className="employee-form__field company-settings-field-full">
                <label
                  className="employee-form__label"
                  htmlFor="address"
                >
                  Address
                </label>

                <textarea
                  id="address"
                  name="address"
                  className="employee-form__textarea"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Enter complete address"
                  rows={4}
                  disabled={saving}
                />
              </div>
            </div>
          </section>

          <section className="employee-form__section">
            <h2 className="employee-form__section-title">
              Employment Information
            </h2>

            <div className="employee-form__grid">
              <div className="employee-form__field">
                <label
                  className="employee-form__label"
                  htmlFor="employeeId"
                >
                  Employee ID
                </label>

                <input
                  id="employeeId"
                  name="employeeId"
                  type="text"
                  className="employee-form__input"
                  value={form.employeeId}
                  onChange={handleChange}
                  placeholder="Enter employee ID"
                  disabled={saving}
                />
              </div>

              <div className="employee-form__field">
                <label
                  className="employee-form__label"
                  htmlFor="joiningDate"
                >
                  Joining Date{" "}
                  <span className="employee-form__required">
                    *
                  </span>
                </label>

                <input
                  id="joiningDate"
                  name="joiningDate"
                  type="date"
                  className={`employee-form__input ${
                    errors.joiningDate
                      ? "employee-form__input--error"
                      : ""
                  }`}
                  value={form.joiningDate}
                  onChange={handleChange}
                  disabled={saving}
                />

                {errors.joiningDate && (
                  <span className="employee-form__error">
                    {errors.joiningDate}
                  </span>
                )}
              </div>

              <div className="employee-form__field">
                <label
                  className="employee-form__label"
                  htmlFor="department"
                >
                  Department{" "}
                  <span className="employee-form__required">
                    *
                  </span>
                </label>

                <select
                  id="department"
                  name="department"
                  className={`employee-form__select ${
                    errors.department
                      ? "employee-form__select--error"
                      : ""
                  }`}
                  value={form.department}
                  onChange={handleChange}
                  disabled={saving}
                >
                  <option value="">
                    Select department
                  </option>

                  {departments.map((item) => (
                    <option
                      key={getOptionValue(item)}
                      value={getOptionValue(item)}
                    >
                      {getOptionLabel(item)}
                    </option>
                  ))}
                </select>

                {errors.department && (
                  <span className="employee-form__error">
                    {errors.department}
                  </span>
                )}
              </div>

              <div className="employee-form__field">
                <label
                  className="employee-form__label"
                  htmlFor="designation"
                >
                  Designation{" "}
                  <span className="employee-form__required">
                    *
                  </span>
                </label>

                <input
                  id="designation"
                  name="designation"
                  type="text"
                  className={`employee-form__input ${
                    errors.designation
                      ? "employee-form__input--error"
                      : ""
                  }`}
                  value={form.designation}
                  onChange={handleChange}
                  placeholder="Enter designation"
                  disabled={saving}
                />

                {errors.designation && (
                  <span className="employee-form__error">
                    {errors.designation}
                  </span>
                )}
              </div>

              <div className="employee-form__field">
                <label
                  className="employee-form__label"
                  htmlFor="role"
                >
                  Role
                </label>

                <select
                  id="role"
                  name="role"
                  className="employee-form__select"
                  value={form.role}
                  onChange={handleChange}
                  disabled={saving}
                >
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                  <option value="HR">HR</option>
                  <option value="Employee">Employee</option>
                </select>
              </div>

              <div className="employee-form__field">
                <label
                  className="employee-form__label"
                  htmlFor="manager"
                >
                  Reporting Manager
                </label>

                <select
                  id="manager"
                  name="manager"
                  className="employee-form__select"
                  value={form.manager}
                  onChange={handleChange}
                  disabled={saving}
                >
                  <option value="">
                    Select reporting manager
                  </option>

                  {managers.map((item) => (
                    <option
                      key={getOptionValue(item)}
                      value={getOptionValue(item)}
                    >
                      {getOptionLabel(item)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="employee-form__field">
                <label
                  className="employee-form__label"
                  htmlFor="status"
                >
                  Status
                </label>

                <select
                  id="status"
                  name="status"
                  className="employee-form__select"
                  value={form.status}
                  onChange={handleChange}
                  disabled={saving}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">
                    Inactive
                  </option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
            </div>
          </section>
        </div>

        <div className="employee-form__actions">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : employeeData
                ? "Update Employee"
                : "Create Employee"}
          </button>
        </div>
      </div>
    </form>
  );
}