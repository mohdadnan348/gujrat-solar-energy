"use client";

import { useEffect, useMemo, useState } from "react";
import "./LeaveForm.css";

const INITIAL_FORM = {
  employee: "",
  leaveType: "Casual Leave",
  startDate: "",
  endDate: "",
  reason: "",
};

const LEAVE_TYPES = [
  "Casual Leave",
  "Sick Leave",
  "Earned Leave",
  "Emergency Leave",
  "Other",
];

const getOptionValue = (item) => {
  if (typeof item === "string") return item;

  return (
    item?._id ||
    item?.id ||
    item?.value ||
    ""
  );
};

const getOptionLabel = (item) => {
  if (typeof item === "string") return item;

  return (
    item?.name ||
    item?.fullName ||
    item?.label ||
    ""
  );
};

const formatDateForInput = (value) => {
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

const calculateDays = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;

  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    end < start
  ) {
    return 0;
  }

  const difference =
    end.getTime() - start.getTime();

  return Math.floor(
    difference / (1000 * 60 * 60 * 24)
  ) + 1;
};

export default function LeaveForm({
  leave,
  data,
  employees = [],
  loading = false,
  saving = false,
  onSubmit,
  onCancel,
  title,
  description,
}) {
  const leaveData = leave || data;

  const [form, setForm] = useState(
    INITIAL_FORM
  );

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!leaveData) {
      setForm(INITIAL_FORM);
      return;
    }

    setForm({
      employee:
        leaveData.employee?._id ||
        leaveData.employee?.id ||
        leaveData.employeeId ||
        leaveData.employee ||
        "",
      leaveType:
        leaveData.leaveType?.name ||
        leaveData.leaveType ||
        leaveData.type ||
        "Casual Leave",
      startDate: formatDateForInput(
        leaveData.startDate ||
          leaveData.fromDate ||
          leaveData.from
      ),
      endDate: formatDateForInput(
        leaveData.endDate ||
          leaveData.toDate ||
          leaveData.to
      ),
      reason:
        leaveData.reason ||
        leaveData.description ||
        leaveData.remarks ||
        "",
    });
  }, [leaveData]);

  const totalDays = useMemo(
    () =>
      calculateDays(
        form.startDate,
        form.endDate
      ),
    [form.startDate, form.endDate]
  );

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

    if (
      name === "startDate" ||
      name === "endDate"
    ) {
      setErrors((previous) => ({
        ...previous,
        [name]: "",
        dateRange: "",
      }));
    }
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.employee) {
      nextErrors.employee =
        "Employee is required.";
    }

    if (!form.leaveType) {
      nextErrors.leaveType =
        "Leave type is required.";
    }

    if (!form.startDate) {
      nextErrors.startDate =
        "Start date is required.";
    }

    if (!form.endDate) {
      nextErrors.endDate =
        "End date is required.";
    }

    if (
      form.startDate &&
      form.endDate &&
      new Date(form.endDate) <
        new Date(form.startDate)
    ) {
      nextErrors.dateRange =
        "End date cannot be before start date.";
    }

    if (!form.reason.trim()) {
      nextErrors.reason =
        "Reason is required.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) return;

    const payload = {
      ...form,
      reason: form.reason.trim(),
      totalDays,
    };

    if (onSubmit) {
      await onSubmit(payload);
    }
  };

  if (loading) {
    return (
      <div className="leave-form">
        <div className="leave-form__card">
          <div className="leave-form__body">
            <div className="leave-form__alert">
              Loading leave information...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
      className="leave-form"
      onSubmit={handleSubmit}
    >
      <div className="leave-form__card">
        <div className="leave-form__header">
          <h1 className="leave-form__title">
            {title ||
              (leaveData
                ? "Edit Leave Request"
                : "Create Leave Request")}
          </h1>

          <p className="leave-form__description">
            {description ||
              (leaveData
                ? "Update the employee leave request details."
                : "Submit a new employee leave request.")}
          </p>
        </div>

        <div className="leave-form__body">
          <section className="leave-form__section">
            <h2 className="leave-form__section-title">
              Leave Information
            </h2>

            <div className="leave-form__grid">
              <div className="leave-form__field">
                <label
                  className="leave-form__label"
                  htmlFor="employee"
                >
                  Employee{" "}
                  <span className="leave-form__required">
                    *
                  </span>
                </label>

                <select
                  id="employee"
                  name="employee"
                  className={`leave-form__select ${
                    errors.employee
                      ? "leave-form__select--error"
                      : ""
                  }`}
                  value={form.employee}
                  onChange={handleChange}
                  disabled={
                    saving ||
                    employees.length === 0
                  }
                >
                  <option value="">
                    Select employee
                  </option>

                  {employees.map((employee) => {
                    const value =
                      getOptionValue(employee);

                    const label =
                      getOptionLabel(employee);

                    return (
                      <option
                        key={value}
                        value={value}
                      >
                        {label}
                      </option>
                    );
                  })}
                </select>

                {errors.employee && (
                  <span className="leave-form__error">
                    {errors.employee}
                  </span>
                )}

                {employees.length === 0 && (
                  <span className="leave-form__hint">
                    No employees are available.
                  </span>
                )}
              </div>

              <div className="leave-form__field">
                <label
                  className="leave-form__label"
                  htmlFor="leaveType"
                >
                  Leave Type{" "}
                  <span className="leave-form__required">
                    *
                  </span>
                </label>

                <select
                  id="leaveType"
                  name="leaveType"
                  className={`leave-form__select ${
                    errors.leaveType
                      ? "leave-form__select--error"
                      : ""
                  }`}
                  value={form.leaveType}
                  onChange={handleChange}
                  disabled={saving}
                >
                  {LEAVE_TYPES.map((type) => (
                    <option
                      key={type}
                      value={type}
                    >
                      {type}
                    </option>
                  ))}
                </select>

                {errors.leaveType && (
                  <span className="leave-form__error">
                    {errors.leaveType}
                  </span>
                )}
              </div>

              <div className="leave-form__field">
                <label
                  className="leave-form__label"
                  htmlFor="startDate"
                >
                  Start Date{" "}
                  <span className="leave-form__required">
                    *
                  </span>
                </label>

                <input
                  id="startDate"
                  name="startDate"
                  type="date"
                  className={`leave-form__input ${
                    errors.startDate ||
                    errors.dateRange
                      ? "leave-form__input--error"
                      : ""
                  }`}
                  value={form.startDate}
                  onChange={handleChange}
                  disabled={saving}
                />

                {errors.startDate && (
                  <span className="leave-form__error">
                    {errors.startDate}
                  </span>
                )}
              </div>

              <div className="leave-form__field">
                <label
                  className="leave-form__label"
                  htmlFor="endDate"
                >
                  End Date{" "}
                  <span className="leave-form__required">
                    *
                  </span>
                </label>

                <input
                  id="endDate"
                  name="endDate"
                  type="date"
                  className={`leave-form__input ${
                    errors.endDate ||
                    errors.dateRange
                      ? "leave-form__input--error"
                      : ""
                  }`}
                  value={form.endDate}
                  onChange={handleChange}
                  disabled={saving}
                />

                {errors.endDate && (
                  <span className="leave-form__error">
                    {errors.endDate}
                  </span>
                )}

                {errors.dateRange && (
                  <span className="leave-form__error">
                    {errors.dateRange}
                  </span>
                )}
              </div>

              <div className="leave-form__field">
                <label className="leave-form__label">
                  Total Days
                </label>

                <div className="leave-form__days">
                  {totalDays > 0
                    ? `${totalDays} ${
                        totalDays === 1
                          ? "day"
                          : "days"
                      }`
                    : "Select dates"}
                </div>
              </div>

              <div className="leave-form__field leave-form__field--full">
                <label
                  className="leave-form__label"
                  htmlFor="reason"
                >
                  Reason{" "}
                  <span className="leave-form__required">
                    *
                  </span>
                </label>

                <textarea
                  id="reason"
                  name="reason"
                  className={`leave-form__textarea ${
                    errors.reason
                      ? "leave-form__textarea--error"
                      : ""
                  }`}
                  value={form.reason}
                  onChange={handleChange}
                  placeholder="Enter the reason for leave"
                  rows={5}
                  disabled={saving}
                />

                {errors.reason && (
                  <span className="leave-form__error">
                    {errors.reason}
                  </span>
                )}
              </div>
            </div>
          </section>
        </div>

        <div className="leave-form__actions">
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
              : leaveData
                ? "Update Leave"
                : "Submit Leave"}
          </button>
        </div>
      </div>
    </form>
  );
}