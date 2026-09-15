"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import MainLayout from "@/components/layout/MainLayout";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import Loader from "@/components/common/Loader";

import { useAuth } from "@/hooks/useAuth";
import solarRequirementService from "@/services/solarRequirement.service";

const SolarRequirementDetailsPage = () => {
  const params = useParams();
  const router = useRouter();

  const { user, logout, loading: authLoading } = useAuth();

  const requirementId = params?.id;

  const [requirement, setRequirement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadRequirement = async (isRefresh = false) => {
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

      const data = response?.data || response;

      setRequirement(data?.requirement || data);
    } catch (err) {
      console.error(
        "Failed to load solar requirement:",
        err
      );

      setError(
        err?.message ||
          err?.response?.data?.message ||
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

  const handleLogout = async () => {
    await logout();
  };

  const handleSearch = (value) => {
    console.log("Admin global search:", value);
  };

  const handleBack = () => {
    router.push("/admin/solar-requirements");
  };

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

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
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
      return date;
    }

    return parsedDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
      return value;
    }

    return number.toLocaleString("en-IN");
  };

  const getStatusVariant = (status) => {
    const value = String(status || "").toLowerCase();

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
    return String(status || "PENDING")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
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
      requirement?.requiredKW ??
      requirement?.requiredKw ??
      requirement?.capacity ??
      requirement?.systemSize ??
      null
    );
  };

  const customer =
    requirement?.customer ||
    requirement?.customerId ||
    requirement?.lead;

  const customerName =
    requirement?.customerName ||
    requirement?.name ||
    getName(customer);

  const status =
    requirement?.status || "PENDING";

  const capacity = getCapacity();

  if (authLoading || loading) {
    return (
      <MainLayout
        user={user}
        onLogout={handleLogout}
        onSearch={handleSearch}
        notificationCount={0}
      >
        <div className="admin-requirement-details-loading">
          <Loader />
        </div>
      </MainLayout>
    );
  }

  if (error || !requirement) {
    return (
      <MainLayout
        user={user}
        onLogout={handleLogout}
        onSearch={handleSearch}
        notificationCount={0}
      >
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

              <h1>Requirement Details</h1>
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
                onClick={() => loadRequirement(true)}
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
      </MainLayout>
    );
  }

  return (
    <MainLayout
      user={user}
      onLogout={handleLogout}
      onSearch={handleSearch}
      notificationCount={0}
    >
      <div className="admin-requirement-details-page">
        {/* Header */}
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
                    variant={getStatusVariant(status)}
                  >
                    {getStatusText(status)}
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

          <div className="admin-requirement-header-actions">
            <Button
              variant="secondary"
              onClick={() =>
                loadRequirement(true)
              }
              disabled={refreshing}
            >
              {refreshing
                ? "Refreshing..."
                : "↻ Refresh"}
            </Button>
          </div>
        </div>

        {/* Top Summary */}
        <div className="admin-requirement-summary-grid">
          <div className="admin-requirement-summary-card">
            <span>Required Capacity</span>

            <strong>
              {capacity !== null &&
              capacity !== undefined
                ? `${formatNumber(capacity)} kW`
                : "—"}
            </strong>
          </div>

          <div className="admin-requirement-summary-card">
            <span>Monthly Bill</span>

            <strong>
              {requirement?.monthlyBill !==
                undefined &&
              requirement?.monthlyBill !== null
                ? `₹${formatNumber(
                    requirement.monthlyBill
                  )}`
                : "—"}
            </strong>
          </div>

          <div className="admin-requirement-summary-card">
            <span>Monthly Units</span>

            <strong>
              {requirement?.units !==
                undefined &&
              requirement?.units !== null
                ? `${formatNumber(
                    requirement.units
                  )} Units`
                : "—"}
            </strong>
          </div>

          <div className="admin-requirement-summary-card">
            <span>System Type</span>

            <strong>
              {getSystemType()}
            </strong>
          </div>
        </div>

        <div className="admin-requirement-details-layout">
          {/* Main */}
          <div className="admin-requirement-main">
            {/* Customer */}
            <section className="admin-requirement-detail-card">
              <div className="admin-requirement-card-header">
                <div>
                  <h2>Customer Information</h2>
                  <p>
                    Customer and linked lead details.
                  </p>
                </div>
              </div>

              <div className="admin-requirement-detail-grid">
                <div>
                  <span>Customer Name</span>
                  <strong>
                    {getValue(customerName)}
                  </strong>
                </div>

                <div>
                  <span>Mobile</span>
                  <strong>
                    {getValue(
                      requirement?.phone ||
                        requirement?.mobile ||
                        customer?.phone ||
                        customer?.mobile
                    )}
                  </strong>
                </div>

                <div>
                  <span>Email</span>
                  <strong>
                    {getValue(
                      requirement?.email ||
                        customer?.email
                    )}
                  </strong>
                </div>

                <div>
                  <span>Lead</span>
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

            {/* Electricity Requirement */}
            <section className="admin-requirement-detail-card">
              <div className="admin-requirement-card-header">
                <div>
                  <h2>Electricity Requirement</h2>
                  <p>
                    Customer's current electricity
                    consumption details.
                  </p>
                </div>
              </div>

              <div className="admin-requirement-detail-grid">
                <div>
                  <span>Required Capacity</span>
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
                  <span>Monthly Bill</span>
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
                  <span>Monthly Units</span>
                  <strong>
                    {requirement?.units !==
                      undefined &&
                    requirement?.units !== null
                      ? `${formatNumber(
                          requirement.units
                        )} Units`
                      : "—"}
                  </strong>
                </div>

                <div>
                  <span>Connection / Load</span>
                  <strong>
                    {getValue(
                      requirement?.connectionLoad ||
                        requirement?.connection ||
                        requirement?.load
                    )}
                  </strong>
                </div>

                <div>
                  <span>System Type</span>
                  <strong>
                    {getSystemType()}
                  </strong>
                </div>

                <div>
                  <span>Battery Requirement</span>
                  <strong>
                    {getValue(
                      requirement?.batteryRequirement
                    )}
                  </strong>
                </div>
              </div>
            </section>

            {/* Site Details */}
            <section className="admin-requirement-detail-card">
              <div className="admin-requirement-card-header">
                <div>
                  <h2>Site Details</h2>
                  <p>
                    Installation site and roof
                    information.
                  </p>
                </div>
              </div>

              <div className="admin-requirement-detail-grid">
                <div>
                  <span>Roof Type</span>
                  <strong>
                    {getValue(
                      requirement?.roofType
                    )}
                  </strong>
                </div>

                <div>
                  <span>Roof Area</span>
                  <strong>
                    {requirement?.roofArea !==
                      undefined &&
                    requirement?.roofArea !== null
                      ? `${formatNumber(
                          requirement.roofArea
                        )}`
                      : "—"}
                  </strong>
                </div>

                <div>
                  <span>Location</span>
                  <strong>
                    {getValue(
                      requirement?.location ||
                        requirement?.city
                    )}
                  </strong>
                </div>

                <div>
                  <span>Site Survey</span>
                  <strong>
                    {getValue(
                      requirement?.siteSurvey
                    )}
                  </strong>
                </div>

                <div className="admin-requirement-detail-full">
                  <span>Site Address</span>
                  <strong>
                    {getValue(
                      requirement?.siteAddress ||
                        requirement?.address
                    )}
                  </strong>
                </div>
              </div>
            </section>

            {/* Notes */}
            <section className="admin-requirement-detail-card">
              <div className="admin-requirement-card-header">
                <div>
                  <h2>Notes</h2>
                  <p>
                    Additional customer or site
                    requirements.
                  </p>
                </div>
              </div>

              <div className="admin-requirement-notes">
                {requirement?.notes ||
                requirement?.description ? (
                  <p>
                    {requirement.notes ||
                      requirement.description}
                  </p>
                ) : (
                  <span>
                    No additional notes available.
                  </span>
                )}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="admin-requirement-sidebar">
            <section className="admin-requirement-detail-card">
              <div className="admin-requirement-card-header">
                <div>
                  <h2>Requirement Summary</h2>
                  <p>Quick overview.</p>
                </div>
              </div>

              <div className="admin-requirement-summary-list">
                <div>
                  <span>Requirement ID</span>
                  <strong>
                    {getValue(
                      requirement?.requirementNumber ||
                        requirement?.requirementId ||
                        requirement?._id
                    )}
                  </strong>
                </div>

                <div>
                  <span>Status</span>
                  <strong>
                    {getStatusText(status)}
                  </strong>
                </div>

                <div>
                  <span>Capacity</span>
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
                  <span>System</span>
                  <strong>
                    {getSystemType()}
                  </strong>
                </div>

                <div>
                  <span>Site Survey</span>
                  <strong>
                    {getValue(
                      requirement?.siteSurvey
                    )}
                  </strong>
                </div>

                <div>
                  <span>Created</span>
                  <strong>
                    {formatDate(
                      requirement?.createdAt
                    )}
                  </strong>
                </div>

                <div>
                  <span>Updated</span>
                  <strong>
                    {formatDate(
                      requirement?.updatedAt
                    )}
                  </strong>
                </div>
              </div>
            </section>

            <section className="admin-requirement-detail-card">
              <div className="admin-requirement-card-header">
                <div>
                  <h2>Linked Lead</h2>
                  <p>
                    Source lead for this requirement.
                  </p>
                </div>
              </div>

              <div className="admin-linked-lead">
                <div className="admin-linked-lead-icon">
                  L
                </div>

                <div>
                  <span>Lead ID</span>

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

            <section className="admin-requirement-detail-card">
              <div className="admin-requirement-card-header">
                <div>
                  <h2>Record Information</h2>
                  <p>System record details.</p>
                </div>
              </div>

              <div className="admin-record-info">
                <div>
                  <span>Created By</span>
                  <strong>
                    {getName(
                      requirement?.createdBy
                    )}
                  </strong>
                </div>

                <div>
                  <span>Last Updated By</span>
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

        <div className="admin-requirement-bottom-actions">
          <Button
            variant="secondary"
            onClick={handleBack}
          >
            Back to Requirements
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default SolarRequirementDetailsPage;