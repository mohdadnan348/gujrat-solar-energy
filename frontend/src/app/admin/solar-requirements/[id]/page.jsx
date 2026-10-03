"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import Loader from "@/components/common/Loader";

import solarRequirementService from "@/services/solarRequirement.service";

import "./requirement-details.css";

const STATUS_OPTIONS = [
  {
    value: "PENDING",
    label: "Pending",
  },
  {
    value: "IN_PROGRESS",
    label: "In Progress",
  },
  {
    value: "APPROVED",
    label: "Approved",
  },
  {
    value: "COMPLETED",
    label: "Completed",
  },
  {
    value: "REJECTED",
    label: "Rejected",
  },
  {
    value: "CANCELLED",
    label: "Cancelled",
  },
];

const SolarRequirementDetailsPage = () => {
  const params = useParams();
  const router = useRouter();

  const requirementId = params?.id;

  const [requirement, setRequirement] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [updatingStatus, setUpdatingStatus] =
    useState(false);

  const [error, setError] = useState("");

  const [statusMessage, setStatusMessage] =
    useState("");

  const [statusError, setStatusError] =
    useState("");

  const [selectedStatus, setSelectedStatus] =
    useState("PENDING");

  /* =========================================================
     LOAD REQUIREMENT
  ========================================================= */

  const loadRequirement = async (
    isRefresh = false
  ) => {
    if (!requirementId) return;

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response =
        await solarRequirementService.getSolarRequirementById(
          requirementId
        );

      const data =
        response?.data || response;

      const loadedRequirement =
        data?.requirement || data;

      setRequirement(loadedRequirement);

      setSelectedStatus(
        loadedRequirement?.status ||
          "PENDING"
      );
    } catch (err) {
      console.error(
        "Failed to load solar requirement:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load solar requirement details."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadRequirement();
  }, [requirementId]);

  /* =========================================================
     BACK
  ========================================================= */

  const handleBack = () => {
    router.push(
      "/admin/solar-requirements"
    );
  };

  /* =========================================================
     STATUS UPDATE
  ========================================================= */

  const handleStatusUpdate = async () => {
    if (!requirementId) return;

    const currentStatus =
      requirement?.status || "PENDING";

    if (
      !selectedStatus ||
      selectedStatus === currentStatus
    ) {
      return;
    }

    try {
      setUpdatingStatus(true);
      setStatusMessage("");
      setStatusError("");

      const response =
        await solarRequirementService.updateSolarRequirement(
          requirementId,
          {
            status: selectedStatus,
          }
        );

      const data =
        response?.data || response;

      const updatedRequirement =
        data?.requirement || data;

      if (updatedRequirement) {
        setRequirement(updatedRequirement);

        setSelectedStatus(
          updatedRequirement?.status ||
            selectedStatus
        );
      } else {
        setRequirement((prev) => ({
          ...prev,
          status: selectedStatus,
        }));
      }

      setStatusMessage(
        `Status changed to ${getStatusText(
          selectedStatus
        )} successfully.`
      );

      /*
       * Fresh data from backend.
       * This makes sure updatedBy / updatedAt
       * also appear correctly.
       */
      await loadRequirement(true);
    } catch (err) {
      console.error(
        "Failed to update requirement status:",
        err
      );

      setStatusError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to update requirement status."
      );

      setSelectedStatus(
        currentStatus
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  /* =========================================================
     HELPERS
  ========================================================= */

  const getValue = (
    value,
    fallback = "—"
  ) => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return fallback;
    }

    if (
      typeof value === "object"
    ) {
      return (
        value?.name ||
        value?.fullName ||
        value?.label ||
        value?.city ||
        value?.email ||
        fallback
      );
    }

    return String(value);
  };

  const getName = (person) => {
    if (!person) return "—";

    if (typeof person === "string") {
      return person;
    }

    return (
      person?.name ||
      person?.fullName ||
      `${person?.firstName || ""} ${
        person?.lastName || ""
      }`.trim() ||
      person?.email ||
      "—"
    );
  };

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return String(date);
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const formatDateTime = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return String(date);
    }

    return parsedDate.toLocaleString(
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

  const formatNumber = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "—";
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
      return String(value);
    }

    return number.toLocaleString(
      "en-IN"
    );
  };

  const getStatusVariant = (status) => {
    const value = String(
      status || ""
    )
      .toLowerCase()
      .replace(/_/g, " ");

    if (
      value.includes("approved") ||
      value.includes("completed") ||
      value.includes("active")
    ) {
      return "success";
    }

    if (
      value.includes("rejected") ||
      value.includes("cancelled") ||
      value.includes("cancel")
    ) {
      return "danger";
    }

    if (
      value.includes("pending") ||
      value.includes("draft") ||
      value.includes("progress")
    ) {
      return "warning";
    }

    return "info";
  };

  const getStatusText = (status) => {
    return String(
      status || "PENDING"
    )
      .replace(/_/g, " ")
      .replace(
        /\b\w/g,
        (char) => char.toUpperCase()
      );
  };

  const getSystemType = () => {
    return (
      requirement?.systemType ||
      requirement?.requirementType ||
      requirement?.solarType ||
      requirement?.type ||
      "—"
    );
  };

  const getCapacity = () => {
    return (
      requirement?.requiredKw ??
      requirement?.requiredKW ??
      requirement?.capacity ??
      requirement?.systemSize ??
      null
    );
  };

  const getMonthlyUnits = () => {
    return (
      requirement?.monthlyUnits ??
      requirement?.units ??
      null
    );
  };

  const getConnectionType = () => {
    return (
      requirement?.connectionType ??
      requirement?.connectionLoad ??
      requirement?.connection ??
      requirement?.load ??
      null
    );
  };

  const getBatteryRequirement = () => {
    if (
      typeof requirement?.batteryRequired ===
      "boolean"
    ) {
      return requirement.batteryRequired
        ? "Required"
        : "Not Required";
    }

    return (
      requirement?.batteryRequirement ||
      "—"
    );
  };

  const getSiteSurvey = () => {
    if (
      typeof requirement?.siteSurveyCompleted ===
      "boolean"
    ) {
      return requirement.siteSurveyCompleted
        ? "Completed"
        : requirement?.siteSurveyRequired
          ? "Required"
          : "Not Required";
    }

    return (
      requirement?.siteSurvey ||
      "—"
    );
  };

  const customer =
    requirement?.customer ||
    requirement?.customerId ||
    requirement?.lead;

  const customerName =
    requirement?.customerName ||
    requirement?.name ||
    customer?.name ||
    customer?.fullName ||
    requirement?.lead?.customerName ||
    requirement?.lead?.name ||
    getName(customer);

  const status =
    requirement?.status ||
    "PENDING";

  const capacity =
    getCapacity();

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="admin-requirement-details-loading">
        <Loader />
      </div>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (
    error ||
    !requirement
  ) {
    return (
      <div className="admin-requirement-details-page">

        <div className="admin-requirement-details-header">
          <div>

            <button
              type="button"
              className="admin-requirement-back"
              onClick={handleBack}
            >
              ← Back to Requirements
            </button>

            <span className="admin-page-eyebrow">
              Solar Management
            </span>

            <h1>
              Requirement Details
            </h1>

          </div>
        </div>

        <div className="admin-requirement-details-error">

          <div className="admin-requirement-error-icon">
            !
          </div>

          <h2>
            Unable to load requirement
          </h2>

          <p>
            {error ||
              "The requested solar requirement could not be found."}
          </p>

          <div className="admin-requirement-error-actions">

            <Button
              onClick={() =>
                loadRequirement(true)
              }
            >
              Try Again
            </Button>

            <Button
              variant="secondary"
              onClick={handleBack}
            >
              Back to Requirements
            </Button>

          </div>

        </div>

      </div>
    );
  }

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div className="admin-requirement-details-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="admin-requirement-details-header">

        <div>

          <button
            type="button"
            className="admin-requirement-back"
            onClick={handleBack}
          >
            ← Back to Requirements
          </button>

          <div className="admin-requirement-title-row">

            <div className="admin-requirement-icon">
              ☀
            </div>

            <div>

              <div className="admin-requirement-title-line">

                <h1>
                  {getValue(
                    requirement?.requirementNumber ||
                      requirement?.requirementId ||
                      requirement?._id
                  )}
                </h1>

                <Badge
                  variant={getStatusVariant(
                    status
                  )}
                >
                  {getStatusText(
                    status
                  )}
                </Badge>

              </div>

              <p>
                Solar Requirement •{" "}
                {formatDate(
                  requirement?.createdAt
                )}
              </p>

            </div>

          </div>

        </div>

        {/* STATUS CONTROLS */}

        <div className="admin-requirement-header-actions">

          <div className="admin-requirement-status-editor">

            <select
              value={selectedStatus}
              onChange={(event) => {
                setSelectedStatus(
                  event.target.value
                );

                setStatusMessage("");
                setStatusError("");
              }}
              disabled={updatingStatus}
              className="admin-requirement-status-select"
            >

              {STATUS_OPTIONS.map(
                (option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                )
              )}

            </select>

            <Button
              onClick={
                handleStatusUpdate
              }
              disabled={
                updatingStatus ||
                selectedStatus ===
                  status
              }
            >
              {updatingStatus
                ? "Updating..."
                : "Update Status"}
            </Button>

          </div>

          <Button
            variant="secondary"
            onClick={() =>
              loadRequirement(true)
            }
            disabled={
              refreshing ||
              updatingStatus
            }
          >
            {refreshing
              ? "Refreshing..."
              : "↻ Refresh"}
          </Button>

        </div>

      </div>

      {/* STATUS MESSAGE */}

      {statusMessage && (
        <div className="admin-status-success">
          <span>✓</span>
          {statusMessage}
        </div>
      )}

      {statusError && (
        <div className="admin-status-error">
          <span>!</span>
          {statusError}
        </div>
      )}

      {/* =====================================================
          SUMMARY
      ===================================================== */}

      <div className="admin-requirement-summary-grid">

        <div className="admin-requirement-summary-card">
          <span>
            Required Capacity
          </span>

          <strong>
            {capacity !== null &&
            capacity !== undefined
              ? `${formatNumber(
                  capacity
                )} kW`
              : "—"}
          </strong>
        </div>

        <div className="admin-requirement-summary-card">
          <span>
            Monthly Bill
          </span>

          <strong>
            {requirement?.monthlyBill !==
              undefined &&
            requirement?.monthlyBill !==
              null
              ? `₹${formatNumber(
                  requirement.monthlyBill
                )}`
              : "—"}
          </strong>
        </div>

        <div className="admin-requirement-summary-card">
          <span>
            Monthly Units
          </span>

          <strong>
            {getMonthlyUnits() !== null
              ? `${formatNumber(
                  getMonthlyUnits()
                )} Units`
              : "—"}
          </strong>
        </div>

        <div className="admin-requirement-summary-card">
          <span>
            System Type
          </span>

          <strong>
            {getSystemType()}
          </strong>
        </div>

      </div>

      {/* =====================================================
          MAIN LAYOUT
      ===================================================== */}

      <div className="admin-requirement-details-layout">

        {/* ===================================================
            MAIN
        =================================================== */}

        <div className="admin-requirement-main">

          {/* CUSTOMER */}

          <section className="admin-requirement-detail-card">

            <div className="admin-requirement-card-header">

              <div>
                <h2>
                  Customer Information
                </h2>

                <p>
                  Customer and linked lead
                  details.
                </p>
              </div>

            </div>

            <div className="admin-requirement-detail-grid">

              <div>
                <span>
                  Customer Name
                </span>

                <strong>
                  {getValue(
                    customerName
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Mobile
                </span>

                <strong>
                  {getValue(
                    requirement?.phone ||
                      requirement?.mobile ||
                      customer?.phone ||
                      customer?.mobile ||
                      requirement?.lead?.phone ||
                      requirement?.lead?.mobile
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Email
                </span>

                <strong>
                  {getValue(
                    requirement?.email ||
                      customer?.email ||
                      requirement?.lead?.email
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Lead
                </span>

                <strong>
                  {getValue(
                    requirement?.lead?.leadNumber ||
                      requirement?.lead?.leadId ||
                      requirement?.leadId
                  )}
                </strong>
              </div>

            </div>

          </section>

          {/* ELECTRICITY */}

          <section className="admin-requirement-detail-card">

            <div className="admin-requirement-card-header">

              <div>
                <h2>
                  Electricity Requirement
                </h2>

                <p>
                  Customer's current
                  electricity consumption
                  details.
                </p>
              </div>

            </div>

            <div className="admin-requirement-detail-grid">

              <div>
                <span>
                  Required Capacity
                </span>

                <strong>
                  {capacity !== null &&
                  capacity !== undefined
                    ? `${formatNumber(
                        capacity
                      )} kW`
                    : "—"}
                </strong>
              </div>

              <div>
                <span>
                  Monthly Bill
                </span>

                <strong>
                  {requirement?.monthlyBill !==
                    undefined &&
                  requirement?.monthlyBill !==
                    null
                    ? `₹${formatNumber(
                        requirement.monthlyBill
                      )}`
                    : "—"}
                </strong>
              </div>

              <div>
                <span>
                  Monthly Units
                </span>

                <strong>
                  {getMonthlyUnits() !==
                    null
                    ? `${formatNumber(
                        getMonthlyUnits()
                      )} Units`
                    : "—"}
                </strong>
              </div>

              <div>
                <span>
                  Connection / Load
                </span>

                <strong>
                  {getValue(
                    getConnectionType()
                  )}
                </strong>
              </div>

              <div>
                <span>
                  System Type
                </span>

                <strong>
                  {getSystemType()}
                </strong>
              </div>

              <div>
                <span>
                  Battery Requirement
                </span>

                <strong>
                  {getValue(
                    getBatteryRequirement()
                  )}
                </strong>
              </div>

            </div>

          </section>

          {/* SITE */}

          <section className="admin-requirement-detail-card">

            <div className="admin-requirement-card-header">

              <div>
                <h2>
                  Site Details
                </h2>

                <p>
                  Installation site and
                  roof information.
                </p>
              </div>

            </div>

            <div className="admin-requirement-detail-grid">

              <div>
                <span>
                  Roof Type
                </span>

                <strong>
                  {getValue(
                    requirement?.roofType
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Roof Area
                </span>

                <strong>
                  {requirement?.roofArea !==
                    undefined &&
                  requirement?.roofArea !==
                    null
                    ? `${formatNumber(
                        requirement.roofArea
                      )} sq.ft`
                    : "—"}
                </strong>
              </div>

              <div>
                <span>
                  Location
                </span>

                <strong>
                  {getValue(
                    requirement?.location ||
                      requirement?.city
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Site Survey
                </span>

                <strong>
                  {getValue(
                    getSiteSurvey()
                  )}
                </strong>
              </div>

              <div className="admin-requirement-detail-full">

                <span>
                  Site Address
                </span>

                <strong>
                  {getValue(
                    requirement?.siteAddress ||
                      requirement?.address
                  )}
                </strong>

              </div>

            </div>

          </section>

          {/* NOTES */}

          <section className="admin-requirement-detail-card">

            <div className="admin-requirement-card-header">

              <div>
                <h2>
                  Notes
                </h2>

                <p>
                  Additional customer or
                  site requirements.
                </p>
              </div>

            </div>

            <div className="admin-requirement-notes">

              {requirement?.notes ||
              requirement?.description ? (
                <p>
                  {requirement?.notes ||
                    requirement?.description}
                </p>
              ) : (
                <span>
                  No additional notes
                  available.
                </span>
              )}

            </div>

          </section>

        </div>

        {/* ===================================================
            SIDEBAR
        =================================================== */}

        <aside className="admin-requirement-sidebar">

          {/* SUMMARY */}

          <section className="admin-requirement-detail-card">

            <div className="admin-requirement-card-header">

              <div>
                <h2>
                  Requirement Summary
                </h2>

                <p>
                  Quick overview.
                </p>
              </div>

            </div>

            <div className="admin-requirement-summary-list">

              <div>
                <span>
                  Requirement ID
                </span>

                <strong>
                  {getValue(
                    requirement?.requirementNumber ||
                      requirement?.requirementId ||
                      requirement?._id
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Status
                </span>

                <strong className="admin-current-status">
                  {getStatusText(
                    status
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Capacity
                </span>

                <strong>
                  {capacity !== null &&
                  capacity !== undefined
                    ? `${formatNumber(
                        capacity
                      )} kW`
                    : "—"}
                </strong>
              </div>

              <div>
                <span>
                  System
                </span>

                <strong>
                  {getSystemType()}
                </strong>
              </div>

              <div>
                <span>
                  Site Survey
                </span>

                <strong>
                  {getValue(
                    getSiteSurvey()
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Created
                </span>

                <strong>
                  {formatDateTime(
                    requirement?.createdAt
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Updated
                </span>

                <strong>
                  {formatDateTime(
                    requirement?.updatedAt
                  )}
                </strong>
              </div>

            </div>

          </section>

          {/* LINKED LEAD */}

          <section className="admin-requirement-detail-card">

            <div className="admin-requirement-card-header">

              <div>
                <h2>
                  Linked Lead
                </h2>

                <p>
                  Source lead for this
                  requirement.
                </p>
              </div>

            </div>

            <div className="admin-linked-lead">

              <div className="admin-linked-lead-icon">
                L
              </div>

              <div>

                <span>
                  Lead ID
                </span>

                <strong>
                  {getValue(
                    requirement?.lead?.leadNumber ||
                      requirement?.lead?.leadId ||
                      requirement?.leadId
                  )}
                </strong>

                <small>
                  {getName(
                    requirement?.lead
                  )}
                </small>

              </div>

            </div>

          </section>

          {/* RECORD INFO */}

          <section className="admin-requirement-detail-card">

            <div className="admin-requirement-card-header">

              <div>
                <h2>
                  Record Information
                </h2>

                <p>
                  System record details.
                </p>
              </div>

            </div>

            <div className="admin-record-info">

              <div>
                <span>
                  Created By
                </span>

                <strong>
                  {getName(
                    requirement?.createdBy
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Last Updated By
                </span>

                <strong>
                  {getName(
                    requirement?.updatedBy
                  )}
                </strong>
              </div>

            </div>

          </section>

        </aside>

      </div>

      {/* BOTTOM */}

      <div className="admin-requirement-bottom-actions">

        <Button
          variant="secondary"
          onClick={handleBack}
        >
          Back to Requirements
        </Button>

      </div>

    </div>
  );
};

export default SolarRequirementDetailsPage;