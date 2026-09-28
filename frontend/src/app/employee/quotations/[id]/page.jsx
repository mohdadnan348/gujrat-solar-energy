"use client";

import React, {
  useCallback,
  useEffect,
  useState,
} from "react";
import { useParams, useRouter } from "next/navigation";

import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import Loader from "@/components/common/Loader";
import quotationService from "@/services/quotation.service";

import "./page.css";

const EmployeeQuotationDetailsPage = () => {
  const params = useParams();
  const router = useRouter();

  const quotationId = params?.id;

  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [error, setError] = useState("");

  const loadQuotation = useCallback(async () => {
    if (!quotationId) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response =
        await quotationService.getQuotationById(
          quotationId
        );

      /*
       * Expected backend response:
       *
       * {
       *   success: true,
       *   message: "Quotation fetched successfully",
       *   data: {...}
       * }
       */

      const data =
        response?.data?.data ||
        response?.data?.quotation ||
        response?.quotation ||
        response?.data ||
        null;

      setQuotation(data);
    } catch (err) {
      console.error(
        "Failed to load quotation:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load quotation details."
      );

      setQuotation(null);
    } finally {
      setLoading(false);
    }
  }, [quotationId]);

  useEffect(() => {
    loadQuotation();
  }, [loadQuotation]);

  const getQuotationNumber = () =>
    quotation?.quotationNumber ||
    quotation?.quoteNumber ||
    quotation?.estimateNumber ||
    "—";

  const getCustomerName = () =>
    quotation?.customerName ||
    quotation?.customer?.name ||
    quotation?.customer?.customerName ||
    quotation?.leadName ||
    quotation?.lead?.name ||
    "Unnamed Customer";

  const getCustomerPhone = () =>
    quotation?.phone ||
    quotation?.customer?.phone ||
    quotation?.mobile ||
    quotation?.customer?.mobile ||
    "—";

  const getCustomerEmail = () =>
    quotation?.email ||
    quotation?.customer?.email ||
    "—";

  const getStatus = () =>
    quotation?.status ||
    quotation?.quotationStatus ||
    "DRAFT";

  const getStatusVariant = (status) => {
    const value = String(status)
      .toLowerCase()
      .trim();

    if (
      [
        "approved",
        "accepted",
        "converted",
        "sent",
      ].includes(value)
    ) {
      return "success";
    }

    if (
      [
        "rejected",
        "cancelled",
        "expired",
      ].includes(value)
    ) {
      return "danger";
    }

    if (
      [
        "pending",
        "under_review",
        "follow_up",
      ].includes(value)
    ) {
      return "warning";
    }

    return "default";
  };

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    const parsedDate = new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
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

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
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

  const formatCurrency = (amount) => {
    if (
      amount === undefined ||
      amount === null ||
      amount === ""
    ) {
      return "₹0";
    }

    const numericAmount = Number(amount);

    if (
      Number.isNaN(numericAmount)
    ) {
      return "₹0";
    }

    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
      }
    ).format(numericAmount);
  };

  const getSystemType = () =>
    quotation?.systemType ||
    quotation?.solarSystemType ||
    quotation?.systemConfiguration
      ?.systemType ||
    "—";

  const getCapacity = () => {
    const capacity =
      quotation?.capacity ??
      quotation?.systemConfiguration
        ?.capacity;

    if (
      capacity === undefined ||
      capacity === null ||
      capacity === ""
    ) {
      return "—";
    }

    return `${capacity} kW`;
  };

  const getCreatedBy = () => {
    const createdBy =
      quotation?.createdBy;

    if (
      createdBy &&
      typeof createdBy === "object"
    ) {
      return (
        createdBy.username ||
        createdBy.name ||
        createdBy.email ||
        "—"
      );
    }

    return createdBy || "—";
  };

  const getUpdatedBy = () => {
    const updatedBy =
      quotation?.updatedBy;

    if (
      updatedBy &&
      typeof updatedBy === "object"
    ) {
      return (
        updatedBy.username ||
        updatedBy.name ||
        updatedBy.email ||
        "—"
      );
    }

    return updatedBy || "—";
  };

  const getItems = () => {
    if (
      Array.isArray(
        quotation?.items
      )
    ) {
      return quotation.items;
    }

    if (
      Array.isArray(
        quotation?.quotationItems
      )
    ) {
      return quotation.quotationItems;
    }

    return [];
  };

  const getItemName = (item) =>
    item?.name ||
    item?.productName ||
    item?.itemName ||
    item?.description ||
    "Item";

  const getItemDescription = (item) =>
    item?.description ||
    item?.details ||
    "";

  const getItemQuantity = (item) =>
    item?.quantity ??
    item?.qty ??
    1;

  const getItemRate = (item) =>
    item?.unitPrice ??
    item?.price ??
    item?.rate ??
    0;

  const getItemAmount = (item) => {
    const amount =
      item?.amount ??
      item?.total ??
      item?.totalAmount ??
      item?.lineTotal;

    if (
      amount !== undefined &&
      amount !== null &&
      amount !== ""
    ) {
      return amount;
    }

    return (
      Number(
        getItemQuantity(item)
      ) *
      Number(
        getItemRate(item)
      )
    );
  };

  const handleOpenPdf = async () => {
    if (!quotationId) {
      return;
    }

    try {
      setPdfLoading(true);
      setError("");

      const response =
        await quotationService.getQuotationPdf(
          quotationId
        );

      const blob =
        response instanceof Blob
          ? response
          : response?.data instanceof Blob
          ? response.data
          : null;

      if (!blob) {
        throw new Error(
          "Quotation PDF could not be generated."
        );
      }

      const url =
        window.URL.createObjectURL(
          blob
        );

      window.open(
        url,
        "_blank",
        "noopener,noreferrer"
      );

      setTimeout(() => {
        window.URL.revokeObjectURL(
          url
        );
      }, 60000);
    } catch (err) {
      console.error(
        "Failed to open quotation PDF:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to open quotation PDF."
      );
    } finally {
      setPdfLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="employee-quotation-details-loading">
        <Loader />
      </div>
    );
  }

  if (error && !quotation) {
    return (
      <div className="employee-quotation-details-page">
        <div className="employee-quotation-details-header">
          <div>
            <span className="employee-quotation-details-eyebrow">
              Sales Management
            </span>

            <h1>
              Quotation Details
            </h1>
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              router.push(
                "/employee/quotations"
              )
            }
          >
            Back
          </Button>
        </div>

        <div className="employee-quotation-details-error">
          <div>
            <strong>
              Unable to load quotation
            </strong>

            <p>{error}</p>
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={loadQuotation}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="employee-quotation-details-page">
        <div className="employee-quotation-details-header">
          <div>
            <span className="employee-quotation-details-eyebrow">
              Sales Management
            </span>

            <h1>
              Quotation Not Found
            </h1>

            <p>
              The requested quotation could
              not be found.
            </p>
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              router.push(
                "/employee/quotations"
              )
            }
          >
            Back to Quotations
          </Button>
        </div>
      </div>
    );
  }

  const quotationStatus =
    getStatus();

  const items = getItems();

  const subtotal =
    quotation?.subtotal ??
    quotation?.subTotal ??
    quotation?.totalBeforeTax ??
    quotation?.amountBeforeTax ??
    0;

  const discount =
    quotation?.discount ??
    quotation?.discountAmount ??
    0;

  const tax =
    quotation?.tax ??
    quotation?.taxAmount ??
    quotation?.gstAmount ??
    0;

  const grandTotal =
    quotation?.grandTotal ??
    quotation?.totalAmount ??
    quotation?.total ??
    quotation?.netAmount ??
    0;

  return (
    <div className="employee-quotation-details-page">

      {/* =================================================
          Header
      ================================================= */}

      <div className="employee-quotation-details-header">
        <div>
          <span className="employee-quotation-details-eyebrow">
            Sales Management
          </span>

          <h1>
            {getQuotationNumber()}
          </h1>

          <p>
            View quotation details,
            customer information and
            pricing.
          </p>
        </div>

        <div className="employee-quotation-details-actions">
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              router.push(
                "/employee/quotations"
              )
            }
          >
            Back
          </Button>

          <Button
            type="button"
            variant="secondary"
            onClick={
              handleOpenPdf
            }
            disabled={pdfLoading}
          >
            {pdfLoading
              ? "Opening..."
              : "PDF"}
          </Button>
        </div>
      </div>

      {/* =================================================
          Error Banner
      ================================================= */}

      {error && (
        <div className="employee-quotation-details-error employee-quotation-details-error-inline">
          <span>{error}</span>

          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              setError("")
            }
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* =================================================
          Quotation Summary
      ================================================= */}

      <div className="employee-quotation-summary-card">
        <div className="employee-quotation-summary-main">
          <div className="employee-quotation-summary-icon">
            ₹
          </div>

          <div>
            <span>
              Quotation
            </span>

            <h2>
              {getQuotationNumber()}
            </h2>

            <p>
              Created{" "}
              {formatDate(
                quotation?.quotationDate ||
                  quotation?.createdAt
              )}
            </p>
          </div>
        </div>

        <div className="employee-quotation-summary-right">
          <Badge
            variant={getStatusVariant(
              quotationStatus
            )}
          >
            {String(
              quotationStatus
            ).replaceAll(
              "_",
              " "
            )}
          </Badge>

          <strong>
            {formatCurrency(
              grandTotal
            )}
          </strong>
        </div>
      </div>

      {/* =================================================
          Customer Information
      ================================================= */}

      <section className="employee-quotation-details-card">
        <div className="employee-quotation-details-card-header">
          <div>
            <h2>
              Customer Information
            </h2>

            <p>
              Customer associated with
              this quotation.
            </p>
          </div>
        </div>

        <div className="employee-quotation-details-grid">
          <div className="employee-quotation-detail-item">
            <span>
              Customer Name
            </span>

            <strong>
              {getCustomerName()}
            </strong>
          </div>

          <div className="employee-quotation-detail-item">
            <span>
              Phone
            </span>

            <strong>
              {getCustomerPhone()}
            </strong>
          </div>

          <div className="employee-quotation-detail-item">
            <span>
              Email
            </span>

            <strong>
              {getCustomerEmail()}
            </strong>
          </div>

          <div className="employee-quotation-detail-item">
            <span>
              City
            </span>

            <strong>
              {quotation?.city ||
                quotation?.customer
                  ?.city ||
                "—"}
            </strong>
          </div>

          {quotation?.customer?.address && (
            <div className="employee-quotation-detail-item employee-quotation-detail-item-wide">
              <span>
                Address
              </span>

              <strong>
                {
                  quotation
                    .customer
                    .address
                }
              </strong>
            </div>
          )}
        </div>
      </section>

      {/* =================================================
          Solar System
      ================================================= */}

      <section className="employee-quotation-details-card">
        <div className="employee-quotation-details-card-header">
          <div>
            <h2>
              Solar System
            </h2>

            <p>
              Solar system information
              included in this quotation.
            </p>
          </div>
        </div>

        <div className="employee-quotation-details-grid">
          <div className="employee-quotation-detail-item">
            <span>
              System Type
            </span>

            <strong>
              {getSystemType()}
            </strong>
          </div>

          <div className="employee-quotation-detail-item">
            <span>
              Capacity
            </span>

            <strong>
              {getCapacity()}
            </strong>
          </div>

          {quotation?.panelType && (
            <div className="employee-quotation-detail-item">
              <span>
                Panel Type
              </span>

              <strong>
                {quotation.panelType}
              </strong>
            </div>
          )}

          {quotation?.inverterType && (
            <div className="employee-quotation-detail-item">
              <span>
                Inverter Type
              </span>

              <strong>
                {quotation.inverterType}
              </strong>
            </div>
          )}

          {quotation?.systemConfiguration?.name && (
            <div className="employee-quotation-detail-item">
              <span>
                Configuration
              </span>

              <strong>
                {
                  quotation
                    .systemConfiguration
                    .name
                }
              </strong>
            </div>
          )}
        </div>
      </section>

      {/* =================================================
          Quotation Items
      ================================================= */}

      <section className="employee-quotation-details-card">
        <div className="employee-quotation-details-card-header">
          <div>
            <h2>
              Quotation Items
            </h2>

            <p>
              Products and services included
              in this quotation.
            </p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="employee-quotation-items-empty">
            <span>
              No quotation items available.
            </span>
          </div>
        ) : (
          <div className="employee-quotation-items-wrapper">
            <table className="employee-quotation-items-table">
              <thead>
                <tr>
                  <th>
                    Item
                  </th>

                  <th>
                    Description
                  </th>

                  <th>
                    Qty
                  </th>

                  <th>
                    Rate
                  </th>

                  <th>
                    Amount
                  </th>
                </tr>
              </thead>

              <tbody>
                {items.map(
                  (item, index) => (
                    <tr
                      key={
                        item?._id ||
                        item?.id ||
                        `item-${index}`
                      }
                    >
                      <td>
                        <strong>
                          {getItemName(
                            item
                          )}
                        </strong>
                      </td>

                      <td>
                        {getItemDescription(
                          item
                        ) || "—"}
                      </td>

                      <td>
                        {getItemQuantity(
                          item
                        )}
                      </td>

                      <td>
                        {formatCurrency(
                          getItemRate(
                            item
                          )
                        )}
                      </td>

                      <td className="employee-quotation-item-amount">
                        {formatCurrency(
                          getItemAmount(
                            item
                          )
                        )}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* =================================================
          Pricing Summary
      ================================================= */}

      <section className="employee-quotation-pricing-card">
        <div>
          <h2>
            Pricing Summary
          </h2>

          <p>
            Final quotation amount.
          </p>
        </div>

        <div className="employee-quotation-pricing-values">
          <div>
            <span>
              Subtotal
            </span>

            <strong>
              {formatCurrency(
                subtotal
              )}
            </strong>
          </div>

          <div>
            <span>
              Discount
            </span>

            <strong>
              {formatCurrency(
                discount
              )}
            </strong>
          </div>

          <div>
            <span>
              Tax / GST
            </span>

            <strong>
              {formatCurrency(
                tax
              )}
            </strong>
          </div>

          <div className="employee-quotation-grand-total">
            <span>
              Grand Total
            </span>

            <strong>
              {formatCurrency(
                grandTotal
              )}
            </strong>
          </div>
        </div>
      </section>

      {/* =================================================
          Validity
      ================================================= */}

      <section className="employee-quotation-details-card">
        <div className="employee-quotation-details-card-header">
          <div>
            <h2>
              Quotation Validity
            </h2>

            <p>
              Quotation date and validity
              information.
            </p>
          </div>
        </div>

        <div className="employee-quotation-details-grid">
          <div className="employee-quotation-detail-item">
            <span>
              Quotation Date
            </span>

            <strong>
              {formatDate(
                quotation?.quotationDate ||
                  quotation?.createdAt
              )}
            </strong>
          </div>

          <div className="employee-quotation-detail-item">
            <span>
              Valid Until
            </span>

            <strong>
              {formatDate(
                quotation?.validUntil ||
                  quotation?.expiryDate
              )}
            </strong>
          </div>
        </div>
      </section>

      {/* =================================================
          Record Information
      ================================================= */}

      <section className="employee-quotation-details-card">
        <div className="employee-quotation-details-card-header">
          <div>
            <h2>
              Record Information
            </h2>

            <p>
              Quotation record timestamps
              and ownership.
            </p>
          </div>
        </div>

        <div className="employee-quotation-details-grid">
          <div className="employee-quotation-detail-item">
            <span>
              Created On
            </span>

            <strong>
              {formatDateTime(
                quotation?.createdAt
              )}
            </strong>
          </div>

          <div className="employee-quotation-detail-item">
            <span>
              Created By
            </span>

            <strong>
              {getCreatedBy()}
            </strong>
          </div>

          <div className="employee-quotation-detail-item">
            <span>
              Last Updated
            </span>

            <strong>
              {formatDateTime(
                quotation?.updatedAt
              )}
            </strong>
          </div>

          <div className="employee-quotation-detail-item">
            <span>
              Updated By
            </span>

            <strong>
              {getUpdatedBy()}
            </strong>
          </div>
        </div>
      </section>

    </div>
  );
};

export default EmployeeQuotationDetailsPage;