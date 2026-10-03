"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import Loader from "@/components/common/Loader";

import leadService from "@/services/lead.service";
import leadActivityService from "@/services/leadActivity.service";
import employeeService from "@/services/employee.service";

import "./lead-details.css";

const LeadDetailsPage = () => {
  const params = useParams();
  const router = useRouter();

  const leadId = params?.id;

  const [lead, setLead] = useState(null);
  const [activities, setActivities] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [loading, setLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(false);
  const [employeeLoading, setEmployeeLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);

  const [error, setError] = useState("");
  const [activityError, setActivityError] = useState("");
  const [employeeError, setEmployeeError] = useState("");
  const [assignError, setAssignError] = useState("");
  const [assignSuccess, setAssignSuccess] = useState("");

  const [selectedEmployee, setSelectedEmployee] = useState("");

  /* =========================================================
     Helpers
  ========================================================= */

  const getValue = (value, fallback = "—") => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return fallback;
    }

    return value;
  };

  const getName = (person) => {
    if (!person) return "Unassigned";

    if (typeof person === "string") {
      return person;
    }

    return (
      person?.name ||
      person?.fullName ||
      `${person?.firstName || ""} ${
        person?.lastName || ""
      }`.trim() ||
      person?.username ||
      person?.email ||
      "Unknown Employee"
    );
  };

  const getPersonId = (person) => {
    if (!person) return "";

    if (typeof person === "string") {
      return person;
    }

    return (
      person?._id ||
      person?.id ||
      person?.employeeId ||
      ""
    );
  };

  const normalizeList = (response, keys = []) => {
    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response?.data)) {
      return response.data;
    }

    for (const key of keys) {
      if (Array.isArray(response?.data?.[key])) {
        return response.data[key];
      }

      if (Array.isArray(response?.[key])) {
        return response[key];
      }
    }

    if (Array.isArray(response?.results)) {
      return response.results;
    }

    return [];
  };

  const getInitials = (name) => {
    if (!name) return "L";

    return String(name)
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase())
      .join("");
  };

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return String(date);
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return String(date);
    }

    return parsedDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusVariant = (status) => {
    const value = String(status || "").toLowerCase();

    if (
      value.includes("won") ||
      value.includes("converted") ||
      value.includes("completed")
    ) {
      return "success";
    }

    if (
      value.includes("lost") ||
      value.includes("cancel") ||
      value.includes("reject")
    ) {
      return "danger";
    }

    if (
      value.includes("follow") ||
      value.includes("progress") ||
      value.includes("contact")
    ) {
      return "warning";
    }

    return "info";
  };

  const getPriorityVariant = (priority) => {
    const value = String(priority || "").toLowerCase();

    if (
      value === "high" ||
      value === "urgent"
    ) {
      return "danger";
    }

    if (value === "medium") {
      return "warning";
    }

    return "success";
  };

  /* =========================================================
     Load Lead
  ========================================================= */

  const loadLead = async () => {
    if (!leadId) return;

    try {
      setLoading(true);
      setError("");

      const response =
        await leadService.getLeadById(leadId);

      const leadData =
        response?.data || response;

      setLead(leadData);

      const assigned =
        leadData?.assignedTo ||
        leadData?.assignedEmployee ||
        leadData?.employee ||
        null;

      setSelectedEmployee(
        getPersonId(assigned)
      );
    } catch (err) {
      console.error(
        "Failed to load lead:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load lead details."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     Load Activities
  ========================================================= */

  const loadActivities = async () => {
    if (!leadId) return;

    try {
      setActivityLoading(true);
      setActivityError("");

      const response =
        await leadActivityService.getLeadActivities(
          leadId
        );

      const activityData =
        response?.data || response;

      setActivities(
        Array.isArray(activityData)
          ? activityData
          : activityData?.activities || []
      );
    } catch (err) {
      console.error(
        "Failed to load lead activities:",
        err
      );

      setActivityError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load activity history."
      );

      setActivities([]);
    } finally {
      setActivityLoading(false);
    }
  };

  /* =========================================================
     Load Employees
  ========================================================= */

  const loadEmployees = async () => {
    try {
      setEmployeeLoading(true);
      setEmployeeError("");

      const response =
        await employeeService.getEmployees();

      const employeeList = normalizeList(
        response,
        ["employees", "results"]
      );

      /*
       * Only active EMPLOYEE role should appear
       * in lead assignment dropdown.
       */
      const activeEmployees =
        employeeList.filter((employee) => {
          const role = String(
            employee?.role ||
              employee?.user?.role ||
              ""
          ).toUpperCase();

          const status = String(
            employee?.status ||
              ""
          ).toLowerCase();

          const isEmployee =
            !role ||
            role === "EMPLOYEE";

          const isActive =
            !status ||
            status === "active";

          return (
            isEmployee &&
            isActive
          );
        });

      setEmployees(activeEmployees);
    } catch (err) {
      console.error(
        "Failed to load employees:",
        err
      );

      setEmployeeError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load employees."
      );

      setEmployees([]);
    } finally {
      setEmployeeLoading(false);
    }
  };

  /* =========================================================
     Initial Load
  ========================================================= */

  useEffect(() => {
    if (!leadId) return;

    loadLead();
    loadActivities();
    loadEmployees();
  }, [leadId]);

  /* =========================================================
     Assign Lead
  ========================================================= */

  const handleAssignLead = async () => {
    if (!leadId) return;

    if (!selectedEmployee) {
      setAssignError(
        "Please select an employee."
      );
      return;
    }

    try {
      setAssigning(true);
      setAssignError("");
      setAssignSuccess("");

      await leadService.assignLead(
        leadId,
        selectedEmployee
      );

      setAssignSuccess(
        "Lead assigned successfully."
      );

      /*
       * Reload lead so assigned employee
       * is immediately visible.
       */
      await Promise.all([
        loadLead(),
        loadActivities(),
      ]);
    } catch (err) {
      console.error(
        "Failed to assign lead:",
        err
      );

      setAssignError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to assign lead."
      );
    } finally {
      setAssigning(false);
    }
  };

  /* =========================================================
     Refresh
  ========================================================= */

  const handleRefresh = async () => {
    setAssignError("");
    setAssignSuccess("");

    await Promise.all([
      loadLead(),
      loadActivities(),
      loadEmployees(),
    ]);
  };

  const handleBack = () => {
    router.push("/admin/leads");
  };

  /* =========================================================
     Loading
  ========================================================= */

  if (loading) {
    return (
      <div className="admin-lead-details-loading">
        <Loader />
      </div>
    );
  }

  /* =========================================================
     Error
  ========================================================= */

  if (error || !lead) {
    return (
      <div className="admin-lead-details-page">
        <div className="admin-lead-details-header">
          <div>
            <button
              type="button"
              className="admin-back-button"
              onClick={handleBack}
            >
              ← Back to Leads
            </button>

            <h1>Lead Details</h1>

            <p>
              View complete information about this
              lead.
            </p>
          </div>
        </div>

        <div className="admin-lead-error-card">
          <div className="admin-error-icon">
            !
          </div>

          <h2>Unable to load lead</h2>

          <p>
            {error ||
              "The requested lead could not be found."}
          </p>

          <div className="admin-error-actions">
            <Button onClick={handleRefresh}>
              Try Again
            </Button>

            <Button
              variant="secondary"
              onClick={handleBack}
            >
              Back to Leads
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================
     Lead Data
  ========================================================= */

  const leadName =
    lead?.name ||
    lead?.customerName ||
    lead?.fullName ||
    "Unnamed Lead";

  const assignedEmployee =
    lead?.assignedTo ||
    lead?.assignedEmployee ||
    lead?.employee ||
    null;

  const leadStatus =
    lead?.status || "New";

  const leadPriority =
    lead?.priority || "Medium";

  return (
    <div className="admin-lead-details-page">
      {/* =====================================================
          Header
      ===================================================== */}

      <div className="admin-lead-details-header">
        <div className="admin-lead-header-left">
          <button
            type="button"
            className="admin-back-button"
            onClick={handleBack}
          >
            ← Back to Leads
          </button>

          <div className="admin-lead-title-row">
            <div className="admin-lead-avatar">
              {getInitials(leadName)}
            </div>

            <div>
              <div className="admin-lead-title-line">
                <h1>{leadName}</h1>

                <Badge
                  variant={getStatusVariant(
                    leadStatus
                  )}
                >
                  {String(leadStatus).replace(
                    /_/g,
                    " "
                  )}
                </Badge>
              </div>

              <p>
                Lead ID:{" "}
                <strong>
                  {getValue(
                    lead?.leadNumber ||
                      lead?.leadId ||
                      lead?._id
                  )}
                </strong>
              </p>
            </div>
          </div>
        </div>

        <div className="admin-lead-header-actions">
          <Button
            variant="secondary"
            onClick={handleRefresh}
          >
            ↻ Refresh
          </Button>
        </div>
      </div>

      {/* =====================================================
          Summary
      ===================================================== */}

      <div className="admin-lead-summary-grid">
        <div className="admin-lead-summary-card">
          <span className="summary-label">
            Status
          </span>

          <strong>
            <Badge
              variant={getStatusVariant(
                leadStatus
              )}
            >
              {String(leadStatus).replace(
                /_/g,
                " "
              )}
            </Badge>
          </strong>
        </div>

        <div className="admin-lead-summary-card">
          <span className="summary-label">
            Priority
          </span>

          <strong>
            <Badge
              variant={getPriorityVariant(
                leadPriority
              )}
            >
              {String(leadPriority).replace(
                /_/g,
                " "
              )}
            </Badge>
          </strong>
        </div>

        <div className="admin-lead-summary-card">
          <span className="summary-label">
            Lead Source
          </span>

          <strong>
            {getValue(
              lead?.source ||
                lead?.leadSource
            )}
          </strong>
        </div>

        <div className="admin-lead-summary-card">
          <span className="summary-label">
            Follow-up
          </span>

          <strong>
            {formatDate(
              lead?.followUpDate ||
                lead?.nextFollowUpDate
            )}
          </strong>
        </div>
      </div>

      {/* =====================================================
          Main Layout
      ===================================================== */}

      <div className="admin-lead-details-layout">
        {/* ===================================================
            Main Column
        =================================================== */}

        <div className="admin-lead-main-column">
          {/* Lead Information */}

          <section className="admin-detail-card">
            <div className="admin-detail-card-header">
              <div>
                <h2>Lead Information</h2>

                <p>
                  Basic customer and lead
                  information.
                </p>
              </div>
            </div>

            <div className="admin-detail-grid">
              <div className="admin-detail-item">
                <span>Customer Name</span>

                <strong>
                  {getValue(leadName)}
                </strong>
              </div>

              <div className="admin-detail-item">
                <span>Company Name</span>

                <strong>
                  {getValue(
                    lead?.companyName
                  )}
                </strong>
              </div>

              <div className="admin-detail-item">
                <span>Phone</span>

                <strong>
                  {getValue(
                    lead?.phone ||
                      lead?.mobile ||
                      lead?.contactNumber
                  )}
                </strong>
              </div>

              <div className="admin-detail-item">
                <span>Email</span>

                <strong>
                  {getValue(lead?.email)}
                </strong>
              </div>

              <div className="admin-detail-item">
                <span>City</span>

                <strong>
                  {getValue(lead?.city)}
                </strong>
              </div>

              <div className="admin-detail-item">
                <span>Source</span>

                <strong>
                  {getValue(
                    lead?.source ||
                      lead?.leadSource
                  )}
                </strong>
              </div>

              <div className="admin-detail-item admin-detail-full">
                <span>Address</span>

                <strong>
                  {getValue(
                    lead?.address
                  )}
                </strong>
              </div>

              <div className="admin-detail-item admin-detail-full">
                <span>
                  Solar Requirement
                </span>

                <strong>
                  {getValue(
                    lead?.requirement ||
                      lead?.solarRequirement ||
                      lead?.requirementDetails
                  )}
                </strong>
              </div>

              <div className="admin-detail-item">
                <span>Created At</span>

                <strong>
                  {formatDateTime(
                    lead?.createdAt
                  )}
                </strong>
              </div>

              <div className="admin-detail-item">
                <span>Last Updated</span>

                <strong>
                  {formatDateTime(
                    lead?.updatedAt
                  )}
                </strong>
              </div>
            </div>
          </section>

          {/* =================================================
              Assignment
          ================================================= */}

          <section className="admin-detail-card">
            <div className="admin-detail-card-header">
              <div>
                <h2>Assignment</h2>

                <p>
                  Assign or reassign this lead
                  to an employee.
                </p>
              </div>
            </div>

            {/* Current Assignment */}

            <div className="admin-assignee-box">
              <div className="admin-assignee-avatar">
                {getInitials(
                  getName(
                    assignedEmployee
                  )
                )}
              </div>

              <div>
                <span>
                  Currently Assigned To
                </span>

                <strong>
                  {getName(
                    assignedEmployee
                  )}
                </strong>

                {assignedEmployee?.email && (
                  <small>
                    {
                      assignedEmployee.email
                    }
                  </small>
                )}

                {assignedEmployee?.employeeId && (
                  <small>
                    {
                      assignedEmployee.employeeId
                    }
                  </small>
                )}
              </div>
            </div>

            {/* Assignment Controls */}

            <div
              style={{
                padding:
                  "0 20px 20px",
              }}
            >
              <label
                htmlFor="lead-assignee"
                style={{
                  display: "block",
                  marginBottom: 8,
                  color: "#4e5869",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Select Employee
              </label>

              <div
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "stretch",
                }}
              >
                <select
                  id="lead-assignee"
                  value={selectedEmployee}
                  onChange={(event) => {
                    setSelectedEmployee(
                      event.target.value
                    );
                    setAssignError("");
                    setAssignSuccess("");
                  }}
                  disabled={
                    employeeLoading ||
                    assigning
                  }
                  style={{
                    flex: 1,
                    minWidth: 0,
                    height: 44,
                    padding:
                      "0 12px",
                    border:
                      "1px solid #dfe5eb",
                    borderRadius: 10,
                    background:
                      "#ffffff",
                    color: "#283243",
                    fontSize: 13,
                    outline: "none",
                  }}
                >
                  <option value="">
                    {employeeLoading
                      ? "Loading employees..."
                      : "Select Employee"}
                  </option>

                  {employees.map(
                    (employee) => {
                      const id =
                        employee?._id ||
                        employee?.id ||
                        employee?.employeeId;

                      const name =
                        getName(
                          employee
                        );

                      const code =
                        employee?.employeeId ||
                        "";

                      return (
                        <option
                          key={id}
                          value={id}
                        >
                          {name}
                          {code
                            ? ` (${code})`
                            : ""}
                        </option>
                      );
                    }
                  )}
                </select>

                <button
                  type="button"
                  onClick={
                    handleAssignLead
                  }
                  disabled={
                    assigning ||
                    employeeLoading ||
                    !selectedEmployee
                  }
                  style={{
                    minWidth: 135,
                    height: 44,
                    border: "none",
                    borderRadius: 10,
                    padding:
                      "0 16px",
                    background:
                      assigning ||
                      employeeLoading ||
                      !selectedEmployee
                        ? "#aeb8b1"
                        : "#16803c",
                    color: "#ffffff",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor:
                      assigning ||
                      employeeLoading ||
                      !selectedEmployee
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  {assigning
                    ? "Assigning..."
                    : assignedEmployee
                    ? "Reassign Lead"
                    : "Assign Lead"}
                </button>
              </div>

              {/* Employee Error */}

              {employeeError && (
                <div
                  style={{
                    marginTop: 10,
                    color: "#dc3545",
                    fontSize: 12,
                  }}
                >
                  {employeeError}
                </div>
              )}

              {/* Assignment Error */}

              {assignError && (
                <div
                  style={{
                    marginTop: 10,
                    padding:
                      "10px 12px",
                    borderRadius: 8,
                    background:
                      "#fff1f1",
                    color: "#c62828",
                    fontSize: 12,
                  }}
                >
                  {assignError}
                </div>
              )}

              {/* Assignment Success */}

              {assignSuccess && (
                <div
                  style={{
                    marginTop: 10,
                    padding:
                      "10px 12px",
                    borderRadius: 8,
                    background:
                      "#edf9f1",
                    color: "#16803c",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  ✓ {assignSuccess}
                </div>
              )}

              {/* No Employees */}

              {!employeeLoading &&
                !employeeError &&
                employees.length === 0 && (
                  <div
                    style={{
                      marginTop: 10,
                      color: "#8a93a3",
                      fontSize: 12,
                    }}
                  >
                    No active employees
                    available for
                    assignment.
                  </div>
                )}
            </div>
          </section>

          {/* Notes */}

          <section className="admin-detail-card">
            <div className="admin-detail-card-header">
              <div>
                <h2>Notes</h2>

                <p>
                  Additional information
                  added to the lead.
                </p>
              </div>
            </div>

            <div className="admin-notes-content">
              {lead?.notes ? (
                <p>{lead.notes}</p>
              ) : (
                <span>
                  No notes available
                  for this lead.
                </span>
              )}
            </div>
          </section>

          {/* =================================================
              Activity History
          ================================================= */}

          <section className="admin-detail-card">
            <div className="admin-detail-card-header">
              <div>
                <h2>
                  Activity History
                </h2>

                <p>
                  Recent activities and
                  updates related to this
                  lead.
                </p>
              </div>
            </div>

            {activityLoading ? (
              <div className="admin-activity-loading">
                <Loader />
              </div>
            ) : activityError ? (
              <div className="admin-empty-activities">
                <div className="admin-empty-icon">
                  !
                </div>

                <h3>
                  Unable to load activities
                </h3>

                <p>
                  {activityError}
                </p>

                <div
                  style={{
                    marginTop: 14,
                  }}
                >
                  <Button
                    variant="secondary"
                    onClick={
                      loadActivities
                    }
                  >
                    Retry
                  </Button>
                </div>
              </div>
            ) : activities.length ===
              0 ? (
              <div className="admin-empty-activities">
                <div className="admin-empty-icon">
                  ◷
                </div>

                <h3>
                  No activities yet
                </h3>

                <p>
                  No activity has been
                  recorded for this
                  lead.
                </p>
              </div>
            ) : (
              <div className="admin-activity-list">
                {activities.map(
                  (
                    activity,
                    index
                  ) => {
                    const activityId =
                      activity?._id ||
                      activity?.id ||
                      index;

                    const activityUser =
                      activity?.createdBy ||
                      activity?.performedBy ||
                      activity?.user;

                    const activityTitle =
                      activity?.title ||
                      activity?.action ||
                      activity?.type ||
                      activity?.activityType ||
                      "Lead Activity";

                    const activityDescription =
                      activity?.description ||
                      activity?.notes ||
                      activity?.message ||
                      activity?.details ||
                      "";

                    return (
                      <div
                        className="admin-activity-item"
                        key={
                          activityId
                        }
                      >
                        <div className="admin-activity-dot" />

                        <div className="admin-activity-content">
                          <div className="admin-activity-top">
                            <div>
                              <h3>
                                {String(
                                  activityTitle
                                ).replace(
                                  /_/g,
                                  " "
                                )}
                              </h3>

                              {activityUser && (
                                <span>
                                  By{" "}
                                  {getName(
                                    activityUser
                                  )}
                                </span>
                              )}
                            </div>

                            <time>
                              {formatDateTime(
                                activity?.createdAt ||
                                  activity?.date ||
                                  activity?.activityDate
                              )}
                            </time>
                          </div>

                          {activityDescription && (
                            <p>
                              {
                                activityDescription
                              }
                            </p>
                          )}

                          {activity?.status && (
                            <Badge
                              variant={getStatusVariant(
                                activity.status
                              )}
                            >
                              {String(
                                activity.status
                              ).replace(
                                /_/g,
                                " "
                              )}
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </section>
        </div>

        {/* ===================================================
            Sidebar
        =================================================== */}

        <aside className="admin-lead-sidebar">
          <section className="admin-detail-card admin-sidebar-card">
            <div className="admin-detail-card-header">
              <div>
                <h2>
                  Lead Summary
                </h2>

                <p>
                  Quick overview.
                </p>
              </div>
            </div>

            <div className="admin-summary-list">
              <div>
                <span>Lead ID</span>

                <strong>
                  {getValue(
                    lead?.leadNumber ||
                      lead?.leadId ||
                      lead?._id
                  )}
                </strong>
              </div>

              <div>
                <span>Status</span>

                <strong>
                  {String(
                    leadStatus
                  ).replace(
                    /_/g,
                    " "
                  )}
                </strong>
              </div>

              <div>
                <span>Priority</span>

                <strong>
                  {String(
                    leadPriority
                  ).replace(
                    /_/g,
                    " "
                  )}
                </strong>
              </div>

              <div>
                <span>Source</span>

                <strong>
                  {getValue(
                    lead?.source ||
                      lead?.leadSource
                  )}
                </strong>
              </div>

              <div>
                <span>Assigned To</span>

                <strong>
                  {getName(
                    assignedEmployee
                  )}
                </strong>
              </div>

              <div>
                <span>Created</span>

                <strong>
                  {formatDate(
                    lead?.createdAt
                  )}
                </strong>
              </div>

              <div>
                <span>Activities</span>

                <strong>
                  {activities.length}
                </strong>
              </div>
            </div>
          </section>

          {/* Contact */}

          <section className="admin-detail-card admin-sidebar-card">
            <div className="admin-detail-card-header">
              <div>
                <h2>Contact</h2>

                <p>
                  Customer contact
                  details.
                </p>
              </div>
            </div>

            <div className="admin-contact-actions">
              {(lead?.phone ||
                lead?.mobile) && (
                <a
                  href={`tel:${
                    lead?.phone ||
                    lead?.mobile
                  }`}
                  className="admin-contact-button"
                >
                  <span>☎</span>

                  <div>
                    <small>
                      Call Customer
                    </small>

                    <strong>
                      {lead?.phone ||
                        lead?.mobile}
                    </strong>
                  </div>
                </a>
              )}

              {lead?.email && (
                <a
                  href={`mailto:${lead.email}`}
                  className="admin-contact-button"
                >
                  <span>✉</span>

                  <div>
                    <small>
                      Email Customer
                    </small>

                    <strong>
                      {lead.email}
                    </strong>
                  </div>
                </a>
              )}

              {!lead?.phone &&
                !lead?.mobile &&
                !lead?.email && (
                  <div className="admin-no-contact">
                    No contact details
                    available.
                  </div>
                )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default LeadDetailsPage;