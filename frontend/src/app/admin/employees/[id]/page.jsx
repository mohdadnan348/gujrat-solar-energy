"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import AdminLayout from "../../layout";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import Loader from "@/components/common/Loader";
import ConfirmDialog from "@/components/common/ConfirmDialog";

import { employeeService } from "@/services/employee.service";

import "./employee-details.css";

const EmployeeDetailsPage = () => {
  const router = useRouter();
  const params = useParams();

  const employeeId = params?.id;

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  const getId = (object) => {
    if (!object) return "";

    if (typeof object === "string") {
      return object;
    }

    return (
      object?._id ||
      object?.id ||
      object?.employeeId ||
      ""
    );
  };

  const loadEmployee = async () => {
    if (!employeeId) return;

    try {
      setLoading(true);
      setError("");

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
          employeeId
        );

      const data =
        response?.data ||
        response?.employee ||
        response;

      setEmployee(data);
    } catch (err) {
      console.error(
        "Failed to load employee:",
        err
      );

      setError(
        err?.message ||
          "Failed to load employee details."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployee();
  }, [employeeId]);

  const name = getValue(
    employee,
    [
      "name",
      "fullName",
      "employeeName",
    ],
    "Unnamed Employee"
  );

  const email = getValue(
    employee,
    [
      "email",
      "emailAddress",
    ],
    "—"
  );

  const phone = getValue(
    employee,
    [
      "phone",
      "mobile",
      "mobileNumber",
    ],
    "—"
  );

  const alternatePhone = getValue(
    employee,
    [
      "alternatePhone",
      "alternateMobile",
    ],
    "—"
  );

  const employeeCode = getValue(
    employee,
    [
      "employeeCode",
      "employeeNumber",
    ],
    "—"
  );

  const role = String(
    getValue(
      employee,
      ["role"],
      "EMPLOYEE"
    )
  ).toUpperCase();

  const department = getValue(
    employee,
    [
      "department",
      "departmentName",
    ],
    "—"
  );

  const designation = getValue(
    employee,
    [
      "designation",
      "position",
      "jobTitle",
    ],
    "—"
  );

  const status = String(
    getValue(
      employee,
      [
        "status",
        "employmentStatus",
      ],
      "ACTIVE"
    )
  ).toUpperCase();

  const joiningDate = getValue(
    employee,
    [
      "joiningDate",
      "dateOfJoining",
      "hireDate",
    ],
    ""
  );

  const address = getValue(
    employee,
    ["address"],
    ""
  );

  const city = getValue(
    employee,
    ["city"],
    ""
  );

  const state = getValue(
    employee,
    ["state"],
    ""
  );

  const pincode = getValue(
    employee,
    [
      "pincode",
      "postalCode",
      "zipCode",
    ],
    ""
  );

  const notes = getValue(
    employee,
    [
      "notes",
      "remarks",
    ],
    ""
  );

  const createdAt = getValue(
    employee,
    [
      "createdAt",
      "createdDate",
    ],
    ""
  );

  const updatedAt = getValue(
    employee,
    [
      "updatedAt",
      "updatedDate",
    ],
    ""
  );

  const getInitials = (
    value
  ) => {
    if (!value) return "U";

    const parts = String(value)
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (parts.length === 1) {
      return parts[0]
        .slice(0, 2)
        .toUpperCase();
    }

    return (
      parts[0].charAt(0) +
      parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  };

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "—";
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const formatDateTime = (
    value
  ) => {
    if (!value) return "—";

    const date = new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "—";
    }

    return date.toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const fullAddress = useMemo(() => {
    return [
      address,
      city,
      state,
      pincode,
    ]
      .filter(Boolean)
      .join(", ");
  }, [
    address,
    city,
    state,
    pincode,
  ]);

  const getStatusVariant = (
    value
  ) => {
    switch (value) {
      case "ACTIVE":
        return "success";

      case "INACTIVE":
      case "DISABLED":
        return "danger";

      case "ON_LEAVE":
      case "ON LEAVE":
        return "warning";

      default:
        return "default";
    }
  };

  const getRoleVariant = (
    value
  ) => {
    switch (value) {
      case "ADMIN":
        return "danger";

      case "MANAGER":
        return "info";

      case "HR":
        return "warning";

      case "EMPLOYEE":
        return "success";

      default:
        return "default";
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      setError("");

      if (
        typeof employeeService.deleteEmployee !==
        "function"
      ) {
        throw new Error(
          "Employee delete service is not available."
        );
      }

      await employeeService.deleteEmployee(
        employeeId
      );

      router.push(
        "/admin/employees"
      );
    } catch (err) {
      console.error(
        "Failed to delete employee:",
        err
      );

      setError(
        err?.message ||
          "Failed to delete employee."
      );

      setDeleteOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-employee-details-loading">
          <Loader />
          <p>
            Loading employee details...
          </p>
        </div>
      </AdminLayout>
    );
  }

  if (!employee) {
    return (
      <AdminLayout>
        <div className="admin-employee-details-page">
          <div className="admin-employee-details-empty">
            <div className="admin-employee-details-empty-icon">
              EM
            </div>

            <h2>
              Employee Not Found
            </h2>

            <p>
              The requested employee record
              could not be found.
            </p>

            <Button
              type="button"
              variant="primary"
              onClick={() =>
                router.push(
                  "/admin/employees"
                )
              }
            >
              Back to Employees
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-employee-details-page">
        <div className="admin-employee-details-header">
          <div>
            <button
              type="button"
              className="admin-employee-details-back"
              onClick={() =>
                router.push(
                  "/admin/employees"
                )
              }
            >
              ← Back to Employees
            </button>

            <div className="admin-employee-details-heading">
              <div className="admin-employee-details-avatar">
                {getInitials(name)}
              </div>

              <div>
                <div className="admin-employee-details-name-row">
                  <h1>
                    {name}
                  </h1>

                  <Badge
                    variant={getStatusVariant(
                      status
                    )}
                  >
                    {status.replaceAll(
                      "_",
                      " "
                    )}
                  </Badge>
                </div>

                <div className="admin-employee-details-meta">
                  <span>
                    {designation}
                  </span>

                  <span>
                    •
                  </span>

                  <span>
                    {department}
                  </span>

                  {employeeCode !==
                    "—" && (
                    <>
                      <span>
                        •
                      </span>

                      <span>
                        {employeeCode}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="admin-employee-details-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                router.push(
                  `/admin/employees/create?edit=${employeeId}`
                )
              }
            >
              Edit Employee
            </Button>

            <Button
              type="button"
              variant="danger"
              onClick={() =>
                setDeleteOpen(true)
              }
            >
              Delete
            </Button>
          </div>
        </div>

        {error && (
          <div className="admin-employee-details-error">
            {error}
          </div>
        )}

        <div className="admin-employee-details-grid">
          <main className="admin-employee-details-main">
            <section className="admin-employee-details-card">
              <div className="admin-employee-details-card-header">
                <div>
                  <h2>
                    Personal Information
                  </h2>

                  <p>
                    Primary contact information
                    for the employee.
                  </p>
                </div>
              </div>

              <div className="admin-employee-details-card-body">
                <div className="admin-employee-info-grid">
                  <div className="admin-employee-info-item">
                    <span>
                      Full Name
                    </span>

                    <strong>
                      {name}
                    </strong>
                  </div>

                  <div className="admin-employee-info-item">
                    <span>
                      Email Address
                    </span>

                    {email !==
                    "—" ? (
                      <a
                        href={`mailto:${email}`}
                      >
                        {email}
                      </a>
                    ) : (
                      <strong>
                        —
                      </strong>
                    )}
                  </div>

                  <div className="admin-employee-info-item">
                    <span>
                      Phone Number
                    </span>

                    {phone !==
                    "—" ? (
                      <a
                        href={`tel:${phone}`}
                      >
                        {phone}
                      </a>
                    ) : (
                      <strong>
                        —
                      </strong>
                    )}
                  </div>

                  <div className="admin-employee-info-item">
                    <span>
                      Alternate Phone
                    </span>

                    {alternatePhone !==
                    "—" ? (
                      <a
                        href={`tel:${alternatePhone}`}
                      >
                        {
                          alternatePhone
                        }
                      </a>
                    ) : (
                      <strong>
                        —
                      </strong>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section className="admin-employee-details-card">
              <div className="admin-employee-details-card-header">
                <div>
                  <h2>
                    Employment Information
                  </h2>

                  <p>
                    Role and employment details.
                  </p>
                </div>
              </div>

              <div className="admin-employee-details-card-body">
                <div className="admin-employee-info-grid">
                  <div className="admin-employee-info-item">
                    <span>
                      Employee Code
                    </span>

                    <strong>
                      {employeeCode}
                    </strong>
                  </div>

                  <div className="admin-employee-info-item">
                    <span>
                      Role
                    </span>

                    <div>
                      <Badge
                        variant={getRoleVariant(
                          role
                        )}
                      >
                        {role}
                      </Badge>
                    </div>
                  </div>

                  <div className="admin-employee-info-item">
                    <span>
                      Department
                    </span>

                    <strong>
                      {department}
                    </strong>
                  </div>

                  <div className="admin-employee-info-item">
                    <span>
                      Designation
                    </span>

                    <strong>
                      {designation}
                    </strong>
                  </div>

                  <div className="admin-employee-info-item">
                    <span>
                      Joining Date
                    </span>

                    <strong>
                      {formatDate(
                        joiningDate
                      )}
                    </strong>
                  </div>

                  <div className="admin-employee-info-item">
                    <span>
                      Employment Status
                    </span>

                    <div>
                      <Badge
                        variant={getStatusVariant(
                          status
                        )}
                      >
                        {status.replaceAll(
                          "_",
                          " "
                        )}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="admin-employee-details-card">
              <div className="admin-employee-details-card-header">
                <div>
                  <h2>
                    Address Information
                  </h2>

                  <p>
                    Employee residential
                    address.
                  </p>
                </div>
              </div>

              <div className="admin-employee-details-card-body">
                {fullAddress ? (
                  <div className="admin-employee-address">
                    <span>
                      Address
                    </span>

                    <p>
                      {fullAddress}
                    </p>
                  </div>
                ) : (
                  <div className="admin-employee-no-data">
                    No address information
                    available.
                  </div>
                )}
              </div>
            </section>

            <section className="admin-employee-details-card">
              <div className="admin-employee-details-card-header">
                <div>
                  <h2>
                    Notes
                  </h2>

                  <p>
                    Additional employee
                    information.
                  </p>
                </div>
              </div>

              <div className="admin-employee-details-card-body">
                {notes ? (
                  <div className="admin-employee-notes">
                    <p>
                      {notes}
                    </p>
                  </div>
                ) : (
                  <div className="admin-employee-no-data">
                    No additional notes
                    available.
                  </div>
                )}
              </div>
            </section>
          </main>

          <aside className="admin-employee-details-sidebar">
            <section className="admin-employee-details-card">
              <div className="admin-employee-details-card-header">
                <div>
                  <h2>
                    Employee Summary
                  </h2>

                  <p>
                    Quick overview.
                  </p>
                </div>
              </div>

              <div className="admin-employee-summary">
                <div>
                  <span>
                    Role
                  </span>

                  <strong>
                    {role}
                  </strong>
                </div>

                <div>
                  <span>
                    Department
                  </span>

                  <strong>
                    {department}
                  </strong>
                </div>

                <div>
                  <span>
                    Designation
                  </span>

                  <strong>
                    {designation}
                  </strong>
                </div>

                <div>
                  <span>
                    Status
                  </span>

                  <Badge
                    variant={getStatusVariant(
                      status
                    )}
                  >
                    {status.replaceAll(
                      "_",
                      " "
                    )}
                  </Badge>
                </div>

                <div>
                  <span>
                    Joining Date
                  </span>

                  <strong>
                    {formatDate(
                      joiningDate
                    )}
                  </strong>
                </div>
              </div>
            </section>

            <section className="admin-employee-details-card">
              <div className="admin-employee-details-card-header">
                <div>
                  <h2>
                    Record Information
                  </h2>

                  <p>
                    Record timestamps.
                  </p>
                </div>
              </div>

              <div className="admin-employee-record-info">
                <div>
                  <span>
                    Created
                  </span>

                  <strong>
                    {formatDateTime(
                      createdAt
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Last Updated
                  </span>

                  <strong>
                    {formatDateTime(
                      updatedAt
                    )}
                  </strong>
                </div>
              </div>
            </section>
          </aside>
        </div>

        <ConfirmDialog
          isOpen={deleteOpen}
          onClose={() =>
            !deleting &&
            setDeleteOpen(false)
          }
          onConfirm={
            handleDelete
          }
          title="Delete Employee"
          message="Are you sure you want to delete this employee? This action cannot be undone."
          confirmText={
            deleting
              ? "Deleting..."
              : "Delete Employee"
          }
          cancelText="Cancel"
          loading={deleting}
          danger
        />
      </div>
    </AdminLayout>
  );
};

export default EmployeeDetailsPage;