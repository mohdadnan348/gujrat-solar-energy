"use client";

import React, { useEffect, useMemo, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import Button from "@/components/common/Button";
import Select from "@/components/common/Select";
import Badge from "@/components/common/Badge";
import Pagination from "@/components/common/Pagination";
import Loader from "@/components/common/Loader";
import Modal from "@/components/common/Modal";
import Input from "@/components/common/Input";
import Textarea from "@/components/common/Textarea";
import { useAuth } from "@/hooks/useAuth";
import leaveService from "@/services/leave.service";

const EmployeeLeavesPage = () => {
  const { user, logout, loading: authLoading } = useAuth();

  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");

  const [status, setStatus] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [page, setPage] = useState(1);

  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    leaveType: "",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const limit = 10;

  const loadLeaves = async () => {
    try {
      setLoading(true);
      setError("");

      const employeeId = user?._id || user?.id;

      let response;

      if (
        typeof leaveService.getEmployeeLeaves ===
        "function"
      ) {
        response = await leaveService.getEmployeeLeaves(
          employeeId,
          {
            year,
          }
        );
      } else if (
        typeof leaveService.getLeavesByEmployee ===
        "function"
      ) {
        response =
          await leaveService.getLeavesByEmployee(
            employeeId,
            {
              year,
            }
          );
      } else {
        response = await leaveService.getLeaves({
          employee: employeeId,
          year,
        });
      }

      const items =
        response?.data?.leaves ||
        response?.data?.items ||
        response?.leaves ||
        response?.items ||
        response?.data ||
        [];

      setLeaves(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error("Failed to load leaves:", err);

      setError(
        err?.message ||
          "Unable to load leave records. Please try again."
      );

      setLeaves([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      loadLeaves();
    }
  }, [authLoading, user, year]);

  useEffect(() => {
    setPage(1);
  }, [status, year]);

  const filteredLeaves = useMemo(() => {
    if (!status) return leaves;

    return leaves.filter((item) => {
      const itemStatus =
        item?.status ||
        item?.leaveStatus ||
        "";

      return (
        itemStatus.toLowerCase() ===
        status.toLowerCase()
      );
    });
  }, [leaves, status]);

  const sortedLeaves = useMemo(() => {
    return [...filteredLeaves].sort((a, b) => {
      const dateA = new Date(
        a?.startDate ||
          a?.fromDate ||
          a?.createdAt ||
          0
      );

      const dateB = new Date(
        b?.startDate ||
          b?.fromDate ||
          b?.createdAt ||
          0
      );

      return dateB - dateA;
    });
  }, [filteredLeaves]);

  const totalPages = Math.max(
    1,
    Math.ceil(sortedLeaves.length / limit)
  );

  const paginatedLeaves = useMemo(() => {
    const start = (page - 1) * limit;

    return sortedLeaves.slice(
      start,
      start + limit
    );
  }, [sortedLeaves, page]);

  const stats = useMemo(() => {
    return {
      total: leaves.length,

      pending: leaves.filter((item) =>
        ["pending", "PENDING"].includes(
          item?.status ||
            item?.leaveStatus
        )
      ).length,

      approved: leaves.filter((item) =>
        ["approved", "APPROVED"].includes(
          item?.status ||
            item?.leaveStatus
        )
      ).length,

      rejected: leaves.filter((item) =>
        ["rejected", "REJECTED"].includes(
          item?.status ||
            item?.leaveStatus
        )
      ).length,
    };
  }, [leaves]);

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatus = (item) =>
    item?.status ||
    item?.leaveStatus ||
    "PENDING";

  const getStatusVariant = (value) => {
    const statusValue = String(value).toLowerCase();

    if (statusValue === "approved") {
      return "success";
    }

    if (statusValue === "rejected") {
      return "danger";
    }

    if (
      statusValue === "cancelled" ||
      statusValue === "canceled"
    ) {
      return "default";
    }

    return "warning";
  };

  const getLeaveType = (item) =>
    item?.leaveType ||
    item?.type ||
    item?.category ||
    "—";

  const calculateDays = (
    startDate,
    endDate
  ) => {
    if (!startDate || !endDate) return "—";

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      return "—";
    }

    const difference =
      end.setHours(0, 0, 0, 0) -
      start.setHours(0, 0, 0, 0);

    const days =
      Math.floor(
        difference / (1000 * 60 * 60 * 24)
      ) + 1;

    return days > 0 ? days : "—";
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm({
      leaveType: "",
      startDate: "",
      endDate: "",
      reason: "",
    });
  };

  const handleOpenModal = () => {
    setError("");
    resetForm();
    setShowModal(true);
  };

  const handleCloseModal = () => {
    if (submitLoading) return;

    setShowModal(false);
    resetForm();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.leaveType) {
      setError("Please select a leave type.");
      return;
    }

    if (!form.startDate || !form.endDate) {
      setError(
        "Please select start and end dates."
      );
      return;
    }

    if (form.endDate < form.startDate) {
      setError(
        "End date cannot be before start date."
      );
      return;
    }

    if (!form.reason.trim()) {
      setError("Please enter a reason for leave.");
      return;
    }

    try {
      setSubmitLoading(true);
      setError("");

      const employeeId = user?._id || user?.id;

      const payload = {
        employee: employeeId,
        employeeId,
        leaveType: form.leaveType,
        type: form.leaveType,
        startDate: form.startDate,
        endDate: form.endDate,
        reason: form.reason.trim(),
      };

      if (
        typeof leaveService.createLeave ===
        "function"
      ) {
        await leaveService.createLeave(payload);
      } else if (
        typeof leaveService.applyLeave ===
        "function"
      ) {
        await leaveService.applyLeave(payload);
      } else {
        throw new Error(
          "Leave application service is not available."
        );
      }

      setShowModal(false);
      resetForm();

      await loadLeaves();
    } catch (err) {
      console.error(
        "Failed to apply for leave:",
        err
      );

      setError(
        err?.message ||
          "Unable to submit leave application."
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const currentYear = new Date().getFullYear();

  const yearOptions = Array.from(
    { length: 5 },
    (_, index) => {
      const value = currentYear - index;

      return {
        value,
        label: String(value),
      };
    }
  );

  if (authLoading) {
    return (
      <div className="employee-leaves-loading">
        <Loader />
      </div>
    );
  }

  return (
    <MainLayout
      user={user}
      onLogout={handleLogout}
      notificationCount={0}
    >
      <div className="employee-leaves-page">
        <div className="employee-leaves-header">
          <div>
            <span className="employee-leaves-eyebrow">
              Employee Portal
            </span>

            <h1>My Leaves</h1>

            <p>
              View your leave history and submit new
              leave requests.
            </p>
          </div>

          <Button
            type="button"
            onClick={handleOpenModal}
          >
            Apply for Leave
          </Button>
        </div>

        <div className="employee-leaves-stats">
          <div className="leave-stat-card">
            <span>Total Requests</span>
            <strong>{stats.total}</strong>
          </div>

          <div className="leave-stat-card leave-stat-pending">
            <span>Pending</span>
            <strong>{stats.pending}</strong>
          </div>

          <div className="leave-stat-card leave-stat-approved">
            <span>Approved</span>
            <strong>{stats.approved}</strong>
          </div>

          <div className="leave-stat-card leave-stat-rejected">
            <span>Rejected</span>
            <strong>{stats.rejected}</strong>
          </div>
        </div>

        {error && (
          <div className="employee-leaves-error">
            <span>{error}</span>

            <Button
              type="button"
              variant="secondary"
              onClick={loadLeaves}
            >
              Retry
            </Button>
          </div>
        )}

        <div className="employee-leaves-filters">
          <div className="leave-filter">
            <label htmlFor="leave-year">
              Year
            </label>

            <Select
              id="leave-year"
              value={year}
              onChange={(event) =>
                setYear(Number(event.target.value))
              }
              options={yearOptions}
            />
          </div>

          <div className="leave-filter">
            <label htmlFor="leave-status">
              Status
            </label>

            <Select
              id="leave-status"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value)
              }
              options={[
                {
                  value: "",
                  label: "All Statuses",
                },
                {
                  value: "PENDING",
                  label: "Pending",
                },
                {
                  value: "APPROVED",
                  label: "Approved",
                },
                {
                  value: "REJECTED",
                  label: "Rejected",
                },
                {
                  value: "CANCELLED",
                  label: "Cancelled",
                },
              ]}
            />
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={loadLeaves}
          >
            Refresh
          </Button>
        </div>

        <div className="employee-leaves-card">
          {loading ? (
            <div className="employee-leaves-loader">
              <Loader />
            </div>
          ) : paginatedLeaves.length === 0 ? (
            <div className="employee-leaves-empty">
              <div className="leave-empty-icon">
                📅
              </div>

              <h3>No leave records found</h3>

              <p>
                {status
                  ? "Try changing the selected status."
                  : "You have not submitted any leave requests yet."}
              </p>
            </div>
          ) : (
            <>
              <div className="employee-leaves-table-wrapper">
                <table className="employee-leaves-table">
                  <thead>
                    <tr>
                      <th>Leave Type</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Days</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Applied On</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedLeaves.map(
                      (item, index) => {
                        const id =
                          item?._id ||
                          item?.id ||
                          index;

                        const itemStatus =
                          getStatus(item);

                        const startDate =
                          item?.startDate ||
                          item?.fromDate;

                        const endDate =
                          item?.endDate ||
                          item?.toDate;

                        return (
                          <tr key={id}>
                            <td>
                              <span className="leave-type">
                                {getLeaveType(item)}
                              </span>
                            </td>

                            <td>
                              {formatDate(startDate)}
                            </td>

                            <td>
                              {formatDate(endDate)}
                            </td>

                            <td>
                              {item?.totalDays ||
                                item?.days ||
                                calculateDays(
                                  startDate,
                                  endDate
                                )}
                            </td>

                            <td>
                              <span className="leave-reason">
                                {item?.reason ||
                                  "—"}
                              </span>
                            </td>

                            <td>
                              <Badge
                                variant={getStatusVariant(
                                  itemStatus
                                )}
                              >
                                {String(
                                  itemStatus
                                ).replaceAll(
                                  "_",
                                  " "
                                )}
                              </Badge>
                            </td>

                            <td>
                              {formatDate(
                                item?.createdAt ||
                                  item?.appliedAt
                              )}
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>

              <div className="employee-leaves-footer">
                <span>
                  Showing{" "}
                  {(page - 1) * limit + 1} -{" "}
                  {Math.min(
                    page * limit,
                    sortedLeaves.length
                  )}{" "}
                  of {sortedLeaves.length} requests
                </span>

                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            </>
          )}
        </div>

        <Modal
          isOpen={showModal}
          onClose={handleCloseModal}
          title="Apply for Leave"
        >
          <form
            className="employee-leave-form"
            onSubmit={handleSubmit}
          >
            <div className="leave-form-row">
              <Select
                label="Leave Type"
                name="leaveType"
                value={form.leaveType}
                onChange={handleChange}
                options={[
                  {
                    value: "",
                    label: "Select Leave Type",
                  },
                  {
                    value: "CASUAL",
                    label: "Casual Leave",
                  },
                  {
                    value: "SICK",
                    label: "Sick Leave",
                  },
                  {
                    value: "ANNUAL",
                    label: "Annual Leave",
                  },
                  {
                    value: "EMERGENCY",
                    label: "Emergency Leave",
                  },
                  {
                    value: "OTHER",
                    label: "Other",
                  },
                ]}
                required
              />
            </div>

            <div className="leave-form-row leave-form-two-columns">
              <Input
                label="Start Date"
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                required
              />

              <Input
                label="End Date"
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                min={form.startDate || undefined}
                required
              />
            </div>

            <Textarea
              label="Reason"
              name="reason"
              value={form.reason}
              onChange={handleChange}
              placeholder="Enter reason for leave..."
              rows={4}
              required
            />

            <div className="employee-leave-form-actions">
              <Button
                type="button"
                variant="secondary"
                onClick={handleCloseModal}
                disabled={submitLoading}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={submitLoading}
              >
                {submitLoading
                  ? "Submitting..."
                  : "Submit Request"}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </MainLayout>
  );
};

export default EmployeeLeavesPage;