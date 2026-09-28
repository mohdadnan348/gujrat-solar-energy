"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import Loader from "@/components/common/Loader";
import customerService from "@/services/customer.service";

const EmployeeCustomerDetailsPage = () => {
  const params = useParams();
  const router = useRouter();

  const customerId = params?.id;

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCustomer = useCallback(async () => {
    if (!customerId) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response =
        await customerService.getCustomerById(
          customerId
        );

      /*
       * Expected backend response:
       *
       * {
       *   success: true,
       *   message: "Customer fetched successfully",
       *   data: {...}
       * }
       */

      const data =
        response?.data?.data ||
        response?.data?.customer ||
        response?.customer ||
        response?.data ||
        null;

      setCustomer(data);
    } catch (err) {
      console.error(
        "Failed to load customer:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load customer details."
      );

      setCustomer(null);
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    loadCustomer();
  }, [loadCustomer]);

  const getCustomerName = () =>
    customer?.name ||
    customer?.customerName ||
    customer?.companyName ||
    "Unnamed Customer";

  const getPhone = () =>
    customer?.phone ||
    customer?.mobile ||
    customer?.contactNumber ||
    "—";

  const getEmail = () =>
    customer?.email || "—";

  const getStatus = () =>
    customer?.status ||
    customer?.customerStatus ||
    "ACTIVE";

  const getStatusVariant = (status) => {
    const value = String(status)
      .toLowerCase()
      .trim();

    if (
      ["active", "converted", "completed"].includes(
        value
      )
    ) {
      return "success";
    }

    if (
      [
        "inactive",
        "cancelled",
        "closed",
      ].includes(value)
    ) {
      return "danger";
    }

    if (
      [
        "pending",
        "prospect",
        "follow_up",
      ].includes(value)
    ) {
      return "warning";
    }

    return "default";
  };

  const getLocation = () => {
    if (
      customer?.city &&
      customer?.state
    ) {
      return `${customer.city}, ${customer.state}`;
    }

    return (
      customer?.city ||
      customer?.location ||
      customer?.state ||
      "—"
    );
  };

  const getSystemType = () =>
    customer?.systemType ||
    customer?.solarSystemType ||
    "—";

  const getCapacity = () => {
    if (
      customer?.capacity === undefined ||
      customer?.capacity === null ||
      customer?.capacity === ""
    ) {
      return "—";
    }

    return `${customer.capacity} kW`;
  };

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
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
    if (!date) {
      return "—";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
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

  const getCreatedBy = () => {
    if (
      typeof customer?.createdBy ===
      "object"
    ) {
      return (
        customer.createdBy?.username ||
        customer.createdBy?.name ||
        customer.createdBy?.email ||
        "—"
      );
    }

    return customer?.createdBy || "—";
  };

  const getUpdatedBy = () => {
    if (
      typeof customer?.updatedBy ===
      "object"
    ) {
      return (
        customer.updatedBy?.username ||
        customer.updatedBy?.name ||
        customer.updatedBy?.email ||
        "—"
      );
    }

    return customer?.updatedBy || "—";
  };

  if (loading) {
    return (
      <div className="employee-customer-details-loading">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="employee-customer-details-page">
        <div className="employee-customer-details-header">
          <div>
            <span className="employee-customer-details-eyebrow">
              Customer Management
            </span>

            <h1>Customer Details</h1>
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              router.push(
                "/employee/customers"
              )
            }
          >
            Back
          </Button>
        </div>

        <div className="employee-customer-details-error">
          <div>
            <strong>
              Unable to load customer
            </strong>

            <p>{error}</p>
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={loadCustomer}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="employee-customer-details-page">
        <div className="employee-customer-details-header">
          <div>
            <span className="employee-customer-details-eyebrow">
              Customer Management
            </span>

            <h1>Customer Not Found</h1>

            <p>
              The requested customer could not
              be found.
            </p>
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              router.push(
                "/employee/customers"
              )
            }
          >
            Back to Customers
          </Button>
        </div>
      </div>
    );
  }

  const customerStatus = getStatus();

  return (
    <div className="employee-customer-details-page">

      {/* =================================================
          Header
      ================================================= */}
      <div className="employee-customer-details-header">
        <div>
          <span className="employee-customer-details-eyebrow">
            Customer Management
          </span>

          <h1>{getCustomerName()}</h1>

          <p>
            View customer information and solar
            system details.
          </p>
        </div>

        <div className="employee-customer-details-actions">
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              router.push(
                "/employee/customers"
              )
            }
          >
            Back
          </Button>
        </div>
      </div>

      {/* =================================================
          Customer Summary
      ================================================= */}
      <div className="employee-customer-summary-card">
        <div className="employee-customer-summary-main">
          <div className="employee-customer-avatar">
            {getCustomerName()
              .charAt(0)
              .toUpperCase()}
          </div>

          <div>
            <h2>{getCustomerName()}</h2>

            {customer?.customerId && (
              <span className="employee-customer-id">
                Customer ID:{" "}
                {customer.customerId}
              </span>
            )}
          </div>
        </div>

        <Badge
          variant={getStatusVariant(
            customerStatus
          )}
        >
          {String(customerStatus).replaceAll(
            "_",
            " "
          )}
        </Badge>
      </div>

      {/* =================================================
          Contact Information
      ================================================= */}
      <section className="employee-customer-details-card">
        <div className="employee-customer-details-card-header">
          <div>
            <h2>Contact Information</h2>

            <p>
              Customer contact and location
              details.
            </p>
          </div>
        </div>

        <div className="employee-customer-details-grid">
          <div className="employee-customer-detail-item">
            <span>Name</span>
            <strong>
              {getCustomerName()}
            </strong>
          </div>

          <div className="employee-customer-detail-item">
            <span>Phone</span>
            <strong>
              {getPhone()}
            </strong>
          </div>

          <div className="employee-customer-detail-item">
            <span>Email</span>
            <strong>
              {getEmail()}
            </strong>
          </div>

          <div className="employee-customer-detail-item">
            <span>Location</span>
            <strong>
              {getLocation()}
            </strong>
          </div>

          {customer?.address && (
            <div className="employee-customer-detail-item employee-customer-detail-item-wide">
              <span>Address</span>
              <strong>
                {customer.address}
              </strong>
            </div>
          )}
        </div>
      </section>

      {/* =================================================
          Solar System
      ================================================= */}
      <section className="employee-customer-details-card">
        <div className="employee-customer-details-card-header">
          <div>
            <h2>Solar System</h2>

            <p>
              Customer's solar installation
              requirements.
            </p>
          </div>
        </div>

        <div className="employee-customer-details-grid">
          <div className="employee-customer-detail-item">
            <span>System Type</span>
            <strong>
              {getSystemType()}
            </strong>
          </div>

          <div className="employee-customer-detail-item">
            <span>Capacity</span>
            <strong>
              {getCapacity()}
            </strong>
          </div>

          {customer?.panelType && (
            <div className="employee-customer-detail-item">
              <span>Panel Type</span>
              <strong>
                {customer.panelType}
              </strong>
            </div>
          )}

          {customer?.inverterType && (
            <div className="employee-customer-detail-item">
              <span>Inverter Type</span>
              <strong>
                {customer.inverterType}
              </strong>
            </div>
          )}

          {customer?.systemCost !==
            undefined &&
            customer?.systemCost !==
              null && (
              <div className="employee-customer-detail-item">
                <span>System Cost</span>
                <strong>
                  ₹
                  {Number(
                    customer.systemCost
                  ).toLocaleString("en-IN")}
                </strong>
              </div>
            )}
        </div>
      </section>

      {/* =================================================
          Lead Information
      ================================================= */}
      {customer?.lead && (
        <section className="employee-customer-details-card">
          <div className="employee-customer-details-card-header">
            <div>
              <h2>Lead Information</h2>

              <p>
                Lead from which this customer
                was converted.
              </p>
            </div>
          </div>

          <div className="employee-customer-details-grid">
            <div className="employee-customer-detail-item">
              <span>Lead ID</span>

              <strong>
                {typeof customer.lead ===
                "object"
                  ? customer.lead?._id ||
                    customer.lead?.leadId ||
                    "—"
                  : customer.lead}
              </strong>
            </div>

            {typeof customer.lead ===
              "object" && (
              <>
                <div className="employee-customer-detail-item">
                  <span>Lead Name</span>

                  <strong>
                    {customer.lead?.name ||
                      customer.lead
                        ?.customerName ||
                      "—"}
                  </strong>
                </div>

                <div className="employee-customer-detail-item">
                  <span>Lead Status</span>

                  <strong>
                    {customer.lead?.status
                      ? String(
                          customer.lead.status
                        ).replaceAll(
                          "_",
                          " "
                        )
                      : "—"}
                  </strong>
                </div>

                <div className="employee-customer-detail-item">
                  <span>Lead Created</span>

                  <strong>
                    {formatDate(
                      customer.lead
                        ?.createdAt
                    )}
                  </strong>
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {/* =================================================
          Record Information
      ================================================= */}
      <section className="employee-customer-details-card">
        <div className="employee-customer-details-card-header">
          <div>
            <h2>Record Information</h2>

            <p>
              Customer record and activity
              timestamps.
            </p>
          </div>
        </div>

        <div className="employee-customer-details-grid">
          <div className="employee-customer-detail-item">
            <span>Created On</span>

            <strong>
              {formatDateTime(
                customer?.createdAt ||
                  customer?.createdDate
              )}
            </strong>
          </div>

          <div className="employee-customer-detail-item">
            <span>Created By</span>

            <strong>
              {getCreatedBy()}
            </strong>
          </div>

          <div className="employee-customer-detail-item">
            <span>Last Updated</span>

            <strong>
              {formatDateTime(
                customer?.updatedAt
              )}
            </strong>
          </div>

          <div className="employee-customer-detail-item">
            <span>Updated By</span>

            <strong>
              {getUpdatedBy()}
            </strong>
          </div>
        </div>
      </section>

    </div>
  );
};

export default EmployeeCustomerDetailsPage;