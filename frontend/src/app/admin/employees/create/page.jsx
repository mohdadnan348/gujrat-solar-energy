"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import AdminLayout from "../../layout";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import Textarea from "@/components/common/Textarea";
import Loader from "@/components/common/Loader";

import { employeeService } from "@/services/employee.service";

import "./create-employee.css";

const CreateEmployeePage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const editId = searchParams.get("edit");
  const isEditMode = Boolean(editId);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    alternatePhone: "",
    employeeCode: "",
    role: "EMPLOYEE",
    department: "",
    designation: "",
    joiningDate: "",
    status: "ACTIVE",
    address: "",
    city: "",
    state: "",
    pincode: "",
    notes: "",
  });

  const [errors, setErrors] = useState({});

  const getValue = (
    object,
    keys,
    fallback = ""
  ) => {
    if (!object) return fallback;

    for (const key of keys) {
      const value = object?.[key];

      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        return value;
      }
    }

    return fallback;
  };

  const normalizeDateForInput = (value) => {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const year = date.getFullYear();
    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");
    const day = String(
      date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const loadEmployee = async () => {
    try {
      setLoading(true);
      setError("");

      if (!isEditMode) {
        return;
      }

      if (
        typeof employeeService.getEmployeeById !==
        "function"
      ) {
        throw new Error(
          "Employee details service is not available."
        );
      }

      const response =
        await employeeService.getEmployeeById(
          editId
        );

      const employee =
        response?.data ||
        response?.employee ||
        response;

      setForm({
        name: getValue(
          employee,
          [
            "name",
            "fullName",
            "employeeName",
          ]
        ),
        email: getValue(
          employee,
          [
            "email",
            "emailAddress",
          ]
        ),
        phone: getValue(
          employee,
          [
            "phone",
            "mobile",
            "mobileNumber",
          ]
        ),
        alternatePhone: getValue(
          employee,
          [
            "alternatePhone",
            "alternateMobile",
          ]
        ),
        employeeCode: getValue(
          employee,
          [
            "employeeCode",
            "employeeNumber",
          ]
        ),
        role: String(
          getValue(
            employee,
            ["role"],
            "EMPLOYEE"
          )
        ).toUpperCase(),
        department: getValue(
          employee,
          [
            "department",
            "departmentName",
          ]
        ),
        designation: getValue(
          employee,
          [
            "designation",
            "position",
            "jobTitle",
          ]
        ),
        joiningDate:
          normalizeDateForInput(
            getValue(
              employee,
              [
                "joiningDate",
                "dateOfJoining",
                "hireDate",
              ]
            )
          ),
        status: String(
          getValue(
            employee,
            [
              "status",
              "employmentStatus",
            ],
            "ACTIVE"
          )
        ).toUpperCase(),
        address: getValue(
          employee,
          ["address"]
        ),
        city: getValue(
          employee,
          ["city"]
        ),
        state: getValue(
          employee,
          ["state"]
        ),
        pincode: getValue(
          employee,
          [
            "pincode",
            "postalCode",
            "zipCode",
          ]
        ),
        notes: getValue(
          employee,
          [
            "notes",
            "remarks",
          ]
        ),
      });
    } catch (err) {
      console.error(
        "Failed to load employee:",
        err
      );

      setError(
        err?.message ||
          "Failed to load employee information."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployee();
  }, [editId]);

  const updateField = (
    field,
    value
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [field]: "",
    }));

    setError("");
    setSuccess("");
  };

  const validate = () => {
    const nextErrors = {};

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const phonePattern =
      /^[0-9+\-\s()]{7,20}$/;

    const pincodePattern =
      /^[0-9]{6}$/;

    if (!form.name.trim()) {
      nextErrors.name =
        "Employee name is required.";
    }

    if (!form.email.trim()) {
      nextErrors.email =
        "Email address is required.";
    } else if (
      !emailPattern.test(
        form.email.trim()
      )
    ) {
      nextErrors.email =
        "Enter a valid email address.";
    }

    if (!form.phone.trim()) {
      nextErrors.phone =
        "Phone number is required.";
    } else if (
      !phonePattern.test(
        form.phone.trim()
      )
    ) {
      nextErrors.phone =
        "Enter a valid phone number.";
    }

    if (
      form.alternatePhone.trim() &&
      !phonePattern.test(
        form.alternatePhone.trim()
      )
    ) {
      nextErrors.alternatePhone =
        "Enter a valid alternate phone number.";
    }

    if (
      form.pincode.trim() &&
      !pincodePattern.test(
        form.pincode.trim()
      )
    ) {
      nextErrors.pincode =
        "Pincode must contain 6 digits.";
    }

    if (!form.joiningDate) {
      nextErrors.joiningDate =
        "Joining date is required.";
    }

    setErrors(nextErrors);

    return (
      Object.keys(nextErrors).length ===
      0
    );
  };

  const buildPayload = () => {
    return {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      alternatePhone:
        form.alternatePhone.trim(),
      employeeCode:
        form.employeeCode.trim(),
      role: form.role,
      department:
        form.department.trim(),
      designation:
        form.designation.trim(),
      joiningDate:
        form.joiningDate,
      status: form.status,
      address:
        form.address.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      pincode:
        form.pincode.trim(),
      notes:
        form.notes.trim(),
    };
  };

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const payload =
        buildPayload();

      if (isEditMode) {
        if (
          typeof employeeService.updateEmployee !==
          "function"
        ) {
          throw new Error(
            "Employee update service is not available."
          );
        }

        await employeeService.updateEmployee(
          editId,
          payload
        );

        setSuccess(
          "Employee updated successfully."
        );
      } else {
        if (
          typeof employeeService.createEmployee !==
          "function"
        ) {
          throw new Error(
            "Employee creation service is not available."
          );
        }

        await employeeService.createEmployee(
          payload
        );

        setSuccess(
          "Employee created successfully."
        );
      }

      setTimeout(() => {
        router.push(
          "/admin/employees"
        );
      }, 700);
    } catch (err) {
      console.error(
        "Failed to save employee:",
        err
      );

      setError(
        err?.message ||
          `Failed to ${
            isEditMode
              ? "update"
              : "create"
          } employee.`
      );
    } finally {
      setSubmitting(false);
    }
  };

  const roleOptions = useMemo(
    () => [
      {
        label: "Employee",
        value: "EMPLOYEE",
      },
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
    ],
    []
  );

  const statusOptions = useMemo(
    () => [
      {
        label: "Active",
        value: "ACTIVE",
      },
      {
        label: "Inactive",
        value: "INACTIVE",
      },
      {
        label: "On Leave",
        value: "ON_LEAVE",
      },
    ],
    []
  );

  const handleCancel = () => {
    router.push(
      "/admin/employees"
    );
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-create-employee-loading">
          <Loader />
          <p>
            Loading employee form...
          </p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-create-employee-page">
        <div className="admin-create-employee-header">
          <div>
            <button
              type="button"
              className="admin-create-employee-back"
              onClick={
                handleCancel
              }
            >
              ← Back to Employees
            </button>

            <h1>
              {isEditMode
                ? "Edit Employee"
                : "Add Employee"}
            </h1>

            <p>
              {isEditMode
                ? "Update employee information and employment details."
                : "Create a new employee record for your organization."}
            </p>
          </div>
        </div>

        {error && (
          <div className="admin-create-employee-error">
            {error}
          </div>
        )}

        {success && (
          <div className="admin-create-employee-success">
            {success}
          </div>
        )}

        <form
          className="admin-create-employee-form"
          onSubmit={
            handleSubmit
          }
        >
          <section className="admin-create-employee-card">
            <div className="admin-create-employee-card-header">
              <div>
                <h2>
                  Personal Information
                </h2>

                <p>
                  Enter the employee's
                  primary contact information.
                </p>
              </div>
            </div>

            <div className="admin-create-employee-card-body">
              <div className="admin-create-employee-grid">
                <div className="admin-create-employee-field">
                  <Input
                    label="Full Name"
                    name="name"
                    value={
                      form.name
                    }
                    onChange={(event) =>
                      updateField(
                        "name",
                        event
                          .target
                          .value
                      )
                    }
                    placeholder="Enter full name"
                    required
                    error={
                      errors.name
                    }
                  />
                </div>

                <div className="admin-create-employee-field">
                  <Input
                    label="Email Address"
                    name="email"
                    type="email"
                    value={
                      form.email
                    }
                    onChange={(event) =>
                      updateField(
                        "email",
                        event
                          .target
                          .value
                      )
                    }
                    placeholder="Enter email address"
                    required
                    error={
                      errors.email
                    }
                  />
                </div>

                <div className="admin-create-employee-field">
                  <Input
                    label="Phone Number"
                    name="phone"
                    value={
                      form.phone
                    }
                    onChange={(event) =>
                      updateField(
                        "phone",
                        event
                          .target
                          .value
                      )
                    }
                    placeholder="Enter phone number"
                    required
                    error={
                      errors.phone
                    }
                  />
                </div>

                <div className="admin-create-employee-field">
                  <Input
                    label="Alternate Phone"
                    name="alternatePhone"
                    value={
                      form.alternatePhone
                    }
                    onChange={(event) =>
                      updateField(
                        "alternatePhone",
                        event
                          .target
                          .value
                      )
                    }
                    placeholder="Enter alternate phone number"
                    error={
                      errors.alternatePhone
                    }
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="admin-create-employee-card">
            <div className="admin-create-employee-card-header">
              <div>
                <h2>
                  Employment Information
                </h2>

                <p>
                  Configure the employee's
                  role and employment details.
                </p>
              </div>
            </div>

            <div className="admin-create-employee-card-body">
              <div className="admin-create-employee-grid">
                <div className="admin-create-employee-field">
                  <Input
                    label="Employee Code"
                    name="employeeCode"
                    value={
                      form.employeeCode
                    }
                    onChange={(event) =>
                      updateField(
                        "employeeCode",
                        event
                          .target
                          .value
                      )
                    }
                    placeholder="Enter employee code"
                  />
                </div>

                <div className="admin-create-employee-field">
                  <Select
                    label="Role"
                    name="role"
                    value={
                      form.role
                    }
                    onChange={(event) =>
                      updateField(
                        "role",
                        event?.target
                          ? event.target
                              .value
                          : event
                      )
                    }
                    options={
                      roleOptions
                    }
                    required
                  />
                </div>

                <div className="admin-create-employee-field">
                  <Input
                    label="Department"
                    name="department"
                    value={
                      form.department
                    }
                    onChange={(event) =>
                      updateField(
                        "department",
                        event
                          .target
                          .value
                      )
                    }
                    placeholder="Enter department"
                  />
                </div>

                <div className="admin-create-employee-field">
                  <Input
                    label="Designation"
                    name="designation"
                    value={
                      form.designation
                    }
                    onChange={(event) =>
                      updateField(
                        "designation",
                        event
                          .target
                          .value
                      )
                    }
                    placeholder="Enter designation"
                  />
                </div>

                <div className="admin-create-employee-field">
                  <Input
                    label="Joining Date"
                    name="joiningDate"
                    type="date"
                    value={
                      form.joiningDate
                    }
                    onChange={(event) =>
                      updateField(
                        "joiningDate",
                        event
                          .target
                          .value
                      )
                    }
                    required
                    error={
                      errors.joiningDate
                    }
                  />
                </div>

                <div className="admin-create-employee-field">
                  <Select
                    label="Employment Status"
                    name="status"
                    value={
                      form.status
                    }
                    onChange={(event) =>
                      updateField(
                        "status",
                        event?.target
                          ? event.target
                              .value
                          : event
                      )
                    }
                    options={
                      statusOptions
                    }
                    required
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="admin-create-employee-card">
            <div className="admin-create-employee-card-header">
              <div>
                <h2>
                  Address Information
                </h2>

                <p>
                  Add the employee's
                  residential address.
                </p>
              </div>
            </div>

            <div className="admin-create-employee-card-body">
              <div className="admin-create-employee-grid">
                <div className="admin-create-employee-field full-width">
                  <Textarea
                    label="Address"
                    name="address"
                    value={
                      form.address
                    }
                    onChange={(event) =>
                      updateField(
                        "address",
                        event
                          .target
                          .value
                      )
                    }
                    placeholder="Enter complete address"
                    rows={4}
                  />
                </div>

                <div className="admin-create-employee-field">
                  <Input
                    label="City"
                    name="city"
                    value={
                      form.city
                    }
                    onChange={(event) =>
                      updateField(
                        "city",
                        event
                          .target
                          .value
                      )
                    }
                    placeholder="Enter city"
                  />
                </div>

                <div className="admin-create-employee-field">
                  <Input
                    label="State"
                    name="state"
                    value={
                      form.state
                    }
                    onChange={(event) =>
                      updateField(
                        "state",
                        event
                          .target
                          .value
                      )
                    }
                    placeholder="Enter state"
                  />
                </div>

                <div className="admin-create-employee-field">
                  <Input
                    label="Pincode"
                    name="pincode"
                    value={
                      form.pincode
                    }
                    onChange={(event) =>
                      updateField(
                        "pincode",
                        event
                          .target
                          .value
                      )
                    }
                    placeholder="Enter 6-digit pincode"
                    inputMode="numeric"
                    maxLength={6}
                    error={
                      errors.pincode
                    }
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="admin-create-employee-card">
            <div className="admin-create-employee-card-header">
              <div>
                <h2>
                  Additional Information
                </h2>

                <p>
                  Add optional notes about
                  the employee.
                </p>
              </div>
            </div>

            <div className="admin-create-employee-card-body">
              <Textarea
                label="Notes"
                name="notes"
                value={
                  form.notes
                }
                onChange={(event) =>
                  updateField(
                    "notes",
                    event
                      .target
                      .value
                  )
                }
                placeholder="Add additional notes"
                rows={5}
              />
            </div>
          </section>

          <div className="admin-create-employee-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={
                handleCancel
              }
              disabled={
                submitting
              }
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              disabled={
                submitting
              }
            >
              {submitting
                ? isEditMode
                  ? "Updating..."
                  : "Creating..."
                : isEditMode
                ? "Update Employee"
                : "Create Employee"}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default CreateEmployeePage;