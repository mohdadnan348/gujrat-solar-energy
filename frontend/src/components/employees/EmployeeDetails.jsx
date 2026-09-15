"use client";

import "./EmployeeDetails.css";

const formatDate = (value) => {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const formatValue = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "Not available";
  }

  return String(value);
};

const getEmployeeName = (employee) => {
  if (employee?.name) return employee.name;

  if (employee?.fullName) return employee.fullName;

  const firstName = employee?.firstName || "";
  const lastName = employee?.lastName || "";

  const fullName = `${firstName} ${lastName}`.trim();

  return fullName || "Unknown Employee";
};

const getInitials = (name) => {
  if (!name) return "UE";

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
};

const normalizeStatus = (status) => {
  if (!status) return "pending";

  return String(status)
    .toLowerCase()
    .replace(/\s+/g, "-");
};

const getStatusClass = (status) => {
  const normalized = normalizeStatus(status);

  if (
    normalized === "active" ||
    normalized === "approved"
  ) {
    return "";
  }

  return "employee-details__badge--inactive";
};

export default function EmployeeDetails({
  employee,
  data,
  loading = false,
  onEdit,
  onActivate,
  onDeactivate,
}) {
  const employeeData = employee || data;

  if (loading) {
    return (
      <div className="employee-details">
        <div className="employee-details__card">
          <div className="employee-details__loading">
            <span className="employee-details__spinner" />
            <span>Loading employee details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!employeeData) {
    return (
      <div className="employee-details">
        <div className="employee-details__card">
          <div className="employee-details__empty">
            Employee details are not available.
          </div>
        </div>
      </div>
    );
  }

  const employeeName = getEmployeeName(employeeData);

  const status =
    employeeData.status ||
    employeeData.employeeStatus ||
    "Pending";

  const department =
    employeeData.department?.name ||
    employeeData.department ||
    employeeData.departmentName;

  const designation =
    employeeData.designation?.name ||
    employeeData.designation ||
    employeeData.jobTitle;

  const role =
    employeeData.role?.name ||
    employeeData.role;

  const employeeId =
    employeeData.employeeId ||
    employeeData.employeeCode ||
    employeeData.code;

  const profileImage =
    employeeData.profileImage ||
    employeeData.avatar ||
    employeeData.photo ||
    employeeData.image;

  const email =
    employeeData.email ||
    employeeData.user?.email;

  const mobile =
    employeeData.mobile ||
    employeeData.phone ||
    employeeData.phoneNumber;

  const joiningDate =
    employeeData.joiningDate ||
    employeeData.dateOfJoining;

  const manager =
    employeeData.manager?.name ||
    employeeData.managerName;

  const address =
    employeeData.address ||
    employeeData.currentAddress;

  return (
    <div className="employee-details">
      <div className="employee-details__card">
        <div className="employee-details__profile">
          <div className="employee-details__avatar">
            {profileImage ? (
              <img
                src={profileImage}
                alt={employeeName}
              />
            ) : (
              getInitials(employeeName)
            )}
          </div>

          <div className="employee-details__profile-info">
            <h1 className="employee-details__name">
              {employeeName}
            </h1>

            <p className="employee-details__designation">
              {formatValue(designation)}
            </p>

            <div className="employee-details__meta">
              <span>
                Employee ID: {formatValue(employeeId)}
              </span>

              {department && (
                <span>
                  Department: {formatValue(department)}
                </span>
              )}

              {role && (
                <span>
                  Role: {formatValue(role)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="employee-details__section">
          <div className="employee-details__section-header">
            <h2 className="employee-details__section-title">
              Employment Information
            </h2>

            <p className="employee-details__section-description">
              Employee role and employment details.
            </p>
          </div>

          <div className="employee-details__grid">
            <div className="employee-details__item">
              <div className="employee-details__label">
                Employee ID
              </div>

              <div className="employee-details__value">
                {formatValue(employeeId)}
              </div>
            </div>

            <div className="employee-details__item">
              <div className="employee-details__label">
                Status
              </div>

              <div
                className={`employee-details__badge ${getStatusClass(
                  status
                )}`}
              >
                {formatValue(status)}
              </div>
            </div>

            <div className="employee-details__item">
              <div className="employee-details__label">
                Department
              </div>

              <div className="employee-details__value">
                {formatValue(department)}
              </div>
            </div>

            <div className="employee-details__item">
              <div className="employee-details__label">
                Designation
              </div>

              <div className="employee-details__value">
                {formatValue(designation)}
              </div>
            </div>

            <div className="employee-details__item">
              <div className="employee-details__label">
                Role
              </div>

              <div className="employee-details__value">
                {formatValue(role)}
              </div>
            </div>

            <div className="employee-details__item">
              <div className="employee-details__label">
                Joining Date
              </div>

              <div className="employee-details__value">
                {formatDate(joiningDate)}
              </div>
            </div>

            <div className="employee-details__item">
              <div className="employee-details__label">
                Reporting Manager
              </div>

              <div className="employee-details__value">
                {formatValue(manager)}
              </div>
            </div>
          </div>
        </div>

        <div className="employee-details__section">
          <div className="employee-details__section-header">
            <h2 className="employee-details__section-title">
              Contact Information
            </h2>

            <p className="employee-details__section-description">
              Employee contact details.
            </p>
          </div>

          <div className="employee-details__grid">
            <div className="employee-details__item">
              <div className="employee-details__label">
                Email Address
              </div>

              <div className="employee-details__value">
                {formatValue(email)}
              </div>
            </div>

            <div className="employee-details__item">
              <div className="employee-details__label">
                Mobile Number
              </div>

              <div className="employee-details__value">
                {formatValue(mobile)}
              </div>
            </div>

            <div className="employee-details__item employee-details__item--full">
              <div className="employee-details__label">
                Address
              </div>

              <div className="employee-details__value">
                {formatValue(address)}
              </div>
            </div>
          </div>
        </div>

        {(onEdit ||
          onActivate ||
          onDeactivate) && (
          <div className="employee-details__actions">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(employeeData)}
              >
                Edit Employee
              </button>
            )}

            {normalizeStatus(status) === "active" &&
              onDeactivate && (
                <button
                  type="button"
                  onClick={() =>
                    onDeactivate(employeeData)
                  }
                >
                  Deactivate Employee
                </button>
              )}

            {normalizeStatus(status) !== "active" &&
              onActivate && (
                <button
                  type="button"
                  onClick={() =>
                    onActivate(employeeData)
                  }
                >
                  Activate Employee
                </button>
              )}
          </div>
        )}
      </div>
    </div>
  );
}