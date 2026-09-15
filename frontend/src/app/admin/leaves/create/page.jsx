"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AdminLayout from "../../layout";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import Textarea from "@/components/common/Textarea";
import Loader from "@/components/common/Loader";
import leaveService from "@/services/leave.service";
import employeeService from "@/services/employee.service";
import "./create-leave.css";

const LEAVE_TYPES = [
  { value: "CASUAL", label: "Casual Leave" },
  { value: "SICK", label: "Sick Leave" },
  { value: "EARNED", label: "Earned Leave" },
  { value: "UNPAID", label: "Unpaid Leave" },
  { value: "OTHER", label: "Other" },
];

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "CANCELLED", label: "Cancelled" },
];

const extractEmployees = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.employees)) return response.employees;
  if (Array.isArray(response?.data?.employees)) {
    return response.data.employees;
  }

  return [];
};

const extractLeave = (response) => {
  if (response?.data?.data) return response.data.data;
  if (response?.data) return response.data;
  return response;
};

const getEmployeeName = (employee) =>
  employee?.name ||
  `${employee?.firstName || ""} ${employee?.lastName || ""}`.trim() ||
  employee?.fullName ||
  employee?.employeeCode ||
  "Unknown Employee";

const getEmployeeId = (employee) =>
  employee?._id || employee?.id || employee?.employeeId || "";

const getDateValue = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const calculateDays = (startDate, endDate) => {
  if (!startDate || !endDate) return "";

  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    end < start
  ) {
    return "";
  }

  return Math.floor((end - start) / 86400000) + 1;
};

const AdminCreateLeavePage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const leaveId = searchParams.get("edit");
  const isEditMode = Boolean(leaveId);

  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [loadingLeave, setLoadingLeave] = useState(isEditMode);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    employee: "",
    leaveType: "CASUAL",
    startDate: "",
    endDate: "",
    totalDays: "",
    reason: "",
    status: "PENDING",
    notes: "",
  });

  const [touched, setTouched] = useState({});

  const employeeOptions = useMemo(
    () =>
      employees.map((employee) => ({
        value: getEmployeeId(employee),
        label: getEmployeeName(employee),
      })),
    [employees]
  );

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setError("");
    setSuccess("");
  };

  const markTouched = (field) => {
    setTouched((previous) => ({
      ...previous,
      [field]: true,
    }));
  };

  const validateForm = () => {
    const errors = {};

    if (!form.employee) {
      errors.employee = "Employee is required.";
    }

    if (!form.leaveType) {
      errors.leaveType = "Leave type is required.";
    }

    if (!form.startDate) {
      errors.startDate = "Start date is required.";
    }

    if (!form.endDate) {
      errors.endDate = "End date is required.";
    }

    if (
      form.startDate &&
      form.endDate &&
      new Date(form.endDate) < new Date(form.startDate)
    ) {
      errors.endDate = "End date cannot be before start date.";
    }

    if (!form.reason.trim()) {
      errors.reason = "Reason is required.";
    }

    setTouched({
      employee: true,
      leaveType: true,
      startDate: true,
      endDate: true,
      reason: true,
    });

    return errors;
  };

  const loadEmployees = async () => {
    try {
      setLoadingEmployees(true);

      const response = await employeeService.getEmployees({
        page: 1,
        limit: 1000,
      });

      setEmployees(extractEmployees(response));
    } catch (err) {
      console.error("Failed to load employees:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load employees."
      );
    } finally {
      setLoadingEmployees(false);
    }
  };

  const loadLeave = async () => {
    if (!leaveId) return;

    try {
      setLoadingLeave(true);
      setError("");

      const response = await leaveService.getLeaveById(leaveId);
      const leave = extractLeave(response);

      if (!leave) {
        throw new Error("Leave request not found.");
      }

      const employeeId =
        typeof leave.employee === "object"
          ? getEmployeeId(leave.employee)
          : leave.employee || leave.employeeId || "";

      const startDate =
        getDateValue(leave.startDate) ||
        getDateValue(leave.fromDate) ||
        getDateValue(leave.from);

      const endDate =
        getDateValue(leave.endDate) ||
        getDateValue(leave.toDate) ||
        getDateValue(leave.to);

      setForm({
        employee: employeeId,
        leaveType: leave.leaveType || leave.type || "CASUAL",
        startDate,
        endDate,
        totalDays:
          leave.totalDays ??
          leave.days ??
          leave.numberOfDays ??
          calculateDays(startDate, endDate),
        reason: leave.reason || leave.description || "",
        status: leave.status || "PENDING",
        notes: leave.notes || "",
      });
    } catch (err) {
      console.error("Failed to load leave request:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load leave request."
      );
    } finally {
      setLoadingLeave(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    if (isEditMode) {
      loadLeave();
    }
  }, [isEditMode, leaveId]);

  useEffect(() => {
    const days = calculateDays(form.startDate, form.endDate);

    if (days !== "" && String(days) !== String(form.totalDays)) {
      setForm((previous) => ({
        ...previous,
        totalDays: days,
      }));
    }
  }, [form.startDate, form.endDate]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const errors = validateForm();

    if (Object.keys(errors).length > 0) {
      setError(Object.values(errors)[0]);
      return;
    }

    const payload = {
      employee: form.employee,
      employeeId: form.employee,
      leaveType: form.leaveType,
      type: form.leaveType,
      startDate: form.startDate,
      endDate: form.endDate,
      totalDays: Number(form.totalDays) || calculateDays(
        form.startDate,
        form.endDate
      ),
      reason: form.reason.trim(),
      status: form.status,
      notes: form.notes.trim(),
    };

    try {
      setSaving(true);

      if (isEditMode) {
        await leaveService.updateLeave(leaveId, payload);

        setSuccess("Leave request updated successfully.");

        setTimeout(() => {
          router.push(`/admin/leaves/${leaveId}`);
        }, 700);
      } else {
        const response = await leaveService.createLeave(payload);
        const createdLeave = extractLeave(response);

        setSuccess("Leave request created successfully.");

        const createdId = createdLeave?._id || createdLeave?.id;

        setTimeout(() => {
          if (createdId) {
            router.push(`/admin/leaves/${createdId}`);
          } else {
            router.push("/admin/leaves");
          }
        }, 700);
      }
    } catch (err) {
      console.error("Failed to save leave request:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to save leave request."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (isEditMode) {
      router.push(`/admin/leaves/${leaveId}`);
    } else {
      router.push("/admin/leaves");
    }
  };

  if (loadingLeave) {
    return (
      <AdminLayout>
        <div className="admin-create-leave-loading">
          <Loader />
          <p>Loading leave request...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-create-leave-page">
        <div className="admin-create-leave-header">
          <div>
            <div className="admin-create-leave-breadcrumb">
              <Link href="/admin">Admin</Link>
              <span>/</span>
              <Link href="/admin/leaves">Leaves</Link>
              <span>/</span>
              <span>{isEditMode ? "Edit" : "Create"}</span>
            </div>

            <h1>
              {isEditMode
                ? "Edit Leave Request"
                : "Create Leave Request"}
            </h1>

            <p>
              {isEditMode
                ? "Update employee leave request information."
                : "Create a leave request for an employee."}
            </p>
          </div>
        </div>

        {error && (
          <div className="admin-create-leave-alert error">
            {error}
          </div>
        )}

        {success && (
          <div className="admin-create-leave-alert success">
            {success}
          </div>
        )}

        <form
          className="admin-create-leave-form"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="admin-create-leave-card">
            <div className="admin-create-leave-card-header">
              <div>
                <h2>Leave Information</h2>
                <p>Enter the basic details of the leave request.</p>
              </div>
            </div>

            <div className="admin-create-leave-card-body">
              <div className="admin-create-leave-form-grid">
                <div className="admin-create-leave-field">
                  <Select
                    label="Employee"
                    value={form.employee}
                    onChange={(event) =>
                      updateField(
                        "employee",
                        event?.target?.value ?? event
                      )
                    }
                    onBlur={() => markTouched("employee")}
                    options={employeeOptions}
                    placeholder={
                      loadingEmployees
                        ? "Loading employees..."
                        : "Select employee"
                    }
                    disabled={loadingEmployees || saving}
                    required
                    error={touched.employee && !form.employee ? "Employee is required." : ""}
                  />
                </div>

                <div className="admin-create-leave-field">
                  <Select
                    label="Leave Type"
                    value={form.leaveType}
                    onChange={(event) =>
                      updateField(
                        "leaveType",
                        event?.target?.value ?? event
                      )
                    }
                    onBlur={() => markTouched("leaveType")}
                    options={LEAVE_TYPES}
                    disabled={saving}
                    required
                    error={
                      touched.leaveType && !form.leaveType
                        ? "Leave type is required."
                        : ""
                    }
                  />
                </div>

                <div className="admin-create-leave-field">
                  <Input
                    label="Start Date"
                    type="date"
                    value={form.startDate}
                    onChange={(event) =>
                      updateField("startDate", event.target.value)
                    }
                    onBlur={() => markTouched("startDate")}
                    disabled={saving}
                    required
                    error={touched.startDate && !form.startDate ? "Start date is required." : ""}
                  />
                </div>

                <div className="admin-create-leave-field">
                  <Input
                    label="End Date"
                    type="date"
                    value={form.endDate}
                    onChange={(event) =>
                      updateField("endDate", event.target.value)
                    }
                    onBlur={() => markTouched("endDate")}
                    min={form.startDate || undefined}
                    disabled={saving}
                    required
                    error={
                      touched.endDate && !form.endDate
                        ? "End date is required."
                        : touched.endDate &&
                            form.startDate &&
                            form.endDate &&
                            new Date(form.endDate) <
                              new Date(form.startDate)
                          ? "End date cannot be before start date."
                          : ""
                    }
                  />
                </div>

                <div className="admin-create-leave-field">
                  <Input
                    label="Total Days"
                    type="number"
                    value={form.totalDays}
                    onChange={(event) =>
                      updateField("totalDays", event.target.value)
                    }
                    min="1"
                    step="1"
                    disabled={saving}
                    readOnly
                  />
                </div>

                <div className="admin-create-leave-field">
                  <Select
                    label="Status"
                    value={form.status}
                    onChange={(event) =>
                      updateField(
                        "status",
                        event?.target?.value ?? event
                      )
                    }
                    options={STATUS_OPTIONS}
                    disabled={saving}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="admin-create-leave-card">
            <div className="admin-create-leave-card-header">
              <div>
                <h2>Leave Reason</h2>
                <p>Provide the reason and any additional information.</p>
              </div>
            </div>

            <div className="admin-create-leave-card-body">
              <div className="admin-create-leave-textarea-field">
                <Textarea
                  label="Reason"
                  value={form.reason}
                  onChange={(event) =>
                    updateField("reason", event.target.value)
                  }
                  onBlur={() => markTouched("reason")}
                  placeholder="Enter the reason for leave..."
                  rows={5}
                  disabled={saving}
                  required
                  error={
                    touched.reason && !form.reason.trim()
                      ? "Reason is required."
                      : ""
                  }
                />
              </div>

              <div className="admin-create-leave-textarea-field">
                <Textarea
                  label="Additional Notes"
                  value={form.notes}
                  onChange={(event) =>
                    updateField("notes", event.target.value)
                  }
                  placeholder="Add any additional notes..."
                  rows={4}
                  disabled={saving}
                />
              </div>
            </div>
          </div>

          <div className="admin-create-leave-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancel}
              disabled={saving}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={saving}>
              {saving
                ? isEditMode
                  ? "Updating..."
                  : "Creating..."
                : isEditMode
                ? "Update Leave Request"
                : "Create Leave Request"}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AdminCreateLeavePage;