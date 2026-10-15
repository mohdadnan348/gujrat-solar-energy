"use client";

import React, { useEffect, useMemo, useState } from "react";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import SearchBox from "@/components/common/SearchBox";
import Pagination from "@/components/common/Pagination";
import Loader from "@/components/common/Loader";
import { useAuth } from "@/hooks/useAuth";
import customerService from "@/services/customer.service";
import "./customers.css";

const ManagerCustomersPage = () => {
  const { user, loading: authLoading } = useAuth();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const itemsPerPage = 10;

  /* =========================
     LOAD CUSTOMERS
  ========================= */

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await customerService.getCustomers();

      const data =
        response?.data?.customers ||
        response?.customers ||
        response?.data?.items ||
        response?.items ||
        response?.data ||
        [];

      setCustomers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Customers error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load customers."
      );

      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      loadCustomers();
    }
  }, [authLoading, user]);

  /* =========================
     HELPERS
  ========================= */

  const firstValue = (...values) =>
    values.find((value) => value !== undefined && value !== null && String(value).trim() !== "");

  const getCustomerName = (customer) =>
    firstValue(customer?.name, customer?.fullName, customer?.customerName,
      customer?.companyName, [customer?.firstName, customer?.lastName].filter(Boolean).join(" "),
      customer?.lead?.customerName, customer?.lead?.name) || "Unnamed Customer";

  const getPhone = (customer) =>
    firstValue(customer?.phone, customer?.mobile, customer?.mobileNumber,
      customer?.contactNumber, customer?.phoneNumber, customer?.lead?.mobile,
      customer?.lead?.phone) || "—";

  const getEmail = (customer) =>
    firstValue(customer?.email, customer?.emailAddress, customer?.lead?.email) || "—";

  const getStatus = (customer) =>
    String(firstValue(customer?.status, customer?.customerStatus, customer?.lead?.status) || "ACTIVE")
      .trim().toUpperCase().replace(/[\\s-]+/g, "_");

  const getCustomerNumber = (customer) =>
    firstValue(customer?.customerNumber, customer?.customerNo, customer?.customerId,
      customer?.customerID, customer?.customerCode, customer?.code,
      customer?.referenceNumber) || "—";

  const getBadgeVariant = (value) => {
    const status = String(value).toLowerCase();

    if (
      [
        "active",
        "completed",
        "installed",
        "converted",
      ].includes(status)
    ) {
      return "success";
    }

    if (
      [
        "inactive",
        "cancelled",
        "blocked",
      ].includes(status)
    ) {
      return "danger";
    }

    if (
      [
        "pending",
        "in_progress",
        "processing",
      ].includes(status)
    ) {
      return "warning";
    }

    return "default";
  };

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

  const formatCurrency = (value) => {
    if (
      value === undefined ||
      value === null ||
      value === ""
    ) {
      return "—";
    }

    const amount = Number(value);

    if (Number.isNaN(amount)) {
      return "—";
    }

    return `₹${amount.toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;
  };

  const getSystemSize = (customer) => {
    const value = firstValue(
      customer?.systemSize, customer?.systemCapacity, customer?.capacity,
      customer?.capacityKW, customer?.requiredKW, customer?.requiredKw, customer?.kw,
      customer?.solarRequirement?.systemSize, customer?.solarRequirement?.systemCapacity,
      customer?.solarRequirement?.requiredCapacity, customer?.solarRequirement?.requiredKW,
      customer?.solarRequirement?.requiredKw, customer?.solarRequirement?.capacity,
      customer?.solarRequirement?.kw, customer?.solarRequirement?.requirement?.systemSize,
      customer?.solarRequirement?.requirement?.requiredKW,
      customer?.systemConfiguration?.systemSize, customer?.systemConfiguration?.capacity,
      customer?.systemConfiguration?.requiredKW, customer?.configuration?.systemSize,
      customer?.configuration?.capacity, customer?.quotation?.systemSize,
      customer?.quotation?.capacity, customer?.quotation?.requiredKW,
      customer?.latestQuotation?.systemSize, customer?.latestQuotation?.capacity,
      customer?.latestQuotation?.requiredKW, customer?.lead?.requiredKW,
      customer?.lead?.systemSize
    );
    if (value === undefined) return "—";
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : String(value);
  };

  const getTotalValue = (customer) => {
    const value = firstValue(
      customer?.projectValue, customer?.totalAmount, customer?.grandTotal,
      customer?.quotationAmount, customer?.installationCost,
      customer?.solarRequirement?.projectValue, customer?.solarRequirement?.totalAmount,
      customer?.solarRequirement?.grandTotal, customer?.solarRequirement?.estimatedCost,
      customer?.solarRequirement?.installationCost,
      customer?.systemConfiguration?.totalAmount, customer?.systemConfiguration?.grandTotal,
      customer?.systemConfiguration?.installationCost, customer?.quotation?.grandTotal,
      customer?.quotation?.totalAmount, customer?.quotation?.total,
      customer?.latestQuotation?.grandTotal, customer?.latestQuotation?.totalAmount,
      customer?.latestQuotation?.total, customer?.invoice?.grandTotal,
      customer?.invoice?.totalAmount, customer?.lead?.projectValue
    );
    if (value === undefined) return null;
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : null;
  };

  const getAddressLine = (customer) =>
    firstValue(customer?.address, customer?.siteAddress, customer?.fullAddress) || "Address not available";

  const getLocationLine = (customer) =>
    [
      firstValue(customer?.city, customer?.location?.city, customer?.addressDetails?.city),
      firstValue(customer?.state, customer?.location?.state, customer?.addressDetails?.state),
      firstValue(customer?.pincode, customer?.postalCode, customer?.zipCode, customer?.location?.pincode)
    ].filter(Boolean).join(", ") || "Location not available";

  const getInstallationDate = (customer) =>
    firstValue(customer?.installationDate, customer?.installedAt, customer?.installation?.date,
      customer?.solarRequirement?.installationDate, customer?.systemConfiguration?.installationDate);

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return customers.filter((customer) => {
      const status = String(getStatus(customer)).toUpperCase();

      const matchesStatus =
        statusFilter === "ALL" ||
        status === statusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!query) {
        return true;
      }

      const searchableText = [
        getCustomerName(customer),
        getCustomerNumber(customer),
        getPhone(customer),
        getEmail(customer),
        customer?.city,
        customer?.address,
        customer?.state,
      ]
        .filter(Boolean)
        .map((value) => String(value))
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [customers, search, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCustomers.length / itemsPerPage)
  );

  const currentPage = Math.min(page, totalPages);

  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const handlePageChange = (nextPage) => {
    setPage(nextPage);
  };

  /* =========================
     LOADING
  ========================= */

  if (authLoading || loading) {
    return (
      <div className="manager-customers-loading">
        <Loader />
      </div>
    );
  }

  /* =========================
     PAGE
  ========================= */

  return (
    <div className="manager-customers-page">
      {/* HEADER */}
      <div className="manager-customers-header">
        <div>
          <span className="manager-customers-eyebrow">
            Manager Portal
          </span>

          <h1>Customers</h1>

          <p>
            View and manage customers converted
            from the solar sales process.
          </p>
        </div>

        <Button
          type="button"
          variant="secondary"
          onClick={loadCustomers}
        >
          Refresh
        </Button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="manager-customers-error">
          <span>{error}</span>

          <Button
            type="button"
            variant="secondary"
            onClick={loadCustomers}
          >
            Retry
          </Button>
        </div>
      )}

      {/* TOOLBAR */}
      <div className="manager-customers-toolbar">
        <SearchBox
          value={search}
          onChange={(value) => setSearch(value)}
          placeholder="Search customer, phone, email..."
        />

        <select
          className="manager-customers-status-filter"
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value)
          }
        >
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">
            In Progress
          </option>
          <option value="COMPLETED">Completed</option>
          <option value="INSTALLED">Installed</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      {/* SUMMARY */}
      <div className="manager-customers-summary">
        <div className="manager-customer-summary-card">
          <span>Total Customers</span>
          <strong>{filteredCustomers.length}</strong>
        </div>

        <div className="manager-customer-summary-card">
          <span>Active</span>

          <strong>
            {
              filteredCustomers.filter(
                (customer) =>
                  String(getStatus(customer)).toUpperCase() ===
                  "ACTIVE"
              ).length
            }
          </strong>
        </div>

        <div className="manager-customer-summary-card">
          <span>Installed</span>

          <strong>
            {
              filteredCustomers.filter(
                (customer) =>
                  String(getStatus(customer)).toUpperCase() ===
                  "INSTALLED"
              ).length
            }
          </strong>
        </div>
      </div>

      {/* TABLE */}
      <div className="manager-customers-card">
        <div className="manager-customers-table-wrapper">
          <table className="manager-customers-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Customer ID</th>
                <th>Contact</th>
                <th>Location</th>
                <th>System Size</th>
                <th>Project Value</th>
                <th>Status</th>
                <th>Added On</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {paginatedCustomers.length === 0 ? (
                <tr>
                  <td
                    colSpan="9"
                    className="manager-customers-empty"
                  >
                    <div>
                      <span>♙</span>

                      <strong>
                        No customers found
                      </strong>

                      <p>
                        Try changing your search
                        or status filter.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedCustomers.map(
                  (customer, index) => (
                    <tr
                      key={
                        customer?._id ||
                        customer?.id ||
                        index
                      }
                    >
                      {/* CUSTOMER */}
                      <td>
                        <div className="manager-customer-profile">
                          <div className="manager-customer-avatar">
                            {getCustomerName(
                              customer
                            )
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <strong>
                              {getCustomerName(
                                customer
                              )}
                            </strong>

                            <span>
                              {getEmail(customer)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* CUSTOMER ID */}
                      <td>
                        <span className="manager-customer-number">
                          {getCustomerNumber(customer)}
                        </span>
                      </td>

                      {/* CONTACT */}
                      <td>
                        <div className="manager-customer-contact">
                          <strong>
                            {getPhone(customer)}
                          </strong>

                          {getEmail(customer) !== "—" && (
                            <span>
                              {getEmail(customer)}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* LOCATION */}
                      <td>
                        <div className="manager-customer-location">
                          <strong>
                            {firstValue(customer?.city, customer?.location?.city, customer?.addressDetails?.city) || "—"}
                          </strong>

                          <span>
                            {firstValue(customer?.state, customer?.address, customer?.siteAddress, customer?.location?.state) || "—"}
                          </span>
                        </div>
                      </td>

                      {/* SYSTEM SIZE */}
                      <td>
                        {getSystemSize(customer)}

                        {getSystemSize(customer) !== "—" &&
                          " kW"}
                      </td>

                      {/* PROJECT VALUE */}
                      <td>
                        <strong className="manager-customer-value">
                          {formatCurrency(
                            getTotalValue(customer)
                          )}
                        </strong>
                      </td>

                      {/* STATUS */}
                      <td>
                        <Badge
                          variant={getBadgeVariant(
                            getStatus(customer)
                          )}
                        >
                          {String(
                            getStatus(customer)
                          ).replaceAll("_", " ")}
                        </Badge>
                      </td>

                      {/* DATE */}
                      <td>
                        {formatDate(
                          customer?.createdAt
                        )}
                      </td>

                      {/* ACTION */}
                      <td>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() =>
                            setSelectedCustomer(
                              customer
                            )
                          }
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {filteredCustomers.length > 0 && (
          <div className="manager-customers-pagination">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      {/* CUSTOMER MODAL */}
      {selectedCustomer && (
        <div
          className="manager-customer-modal-overlay"
          onClick={() =>
            setSelectedCustomer(null)
          }
        >
          <div
            className="manager-customer-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            {/* MODAL HEADER */}
            <div className="manager-customer-modal-header">
              <div className="manager-customer-modal-profile">
                <div className="manager-customer-modal-avatar">
                  {getCustomerName(
                    selectedCustomer
                  )
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <span>
                    Customer Details
                  </span>

                  <h2>
                    {getCustomerName(
                      selectedCustomer
                    )}
                  </h2>

                  <p>
                    {getCustomerNumber(
                      selectedCustomer
                    )}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedCustomer(null)
                }
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* MODAL BODY */}
            <div className="manager-customer-modal-body">
              {/* CONTACT */}
              <div className="manager-customer-detail-section">
                <div className="manager-customer-section-title">
                  <h3>Contact Information</h3>
                </div>

                <div className="manager-customer-detail-grid">
                  <div>
                    <span>Full Name</span>

                    <strong>
                      {getCustomerName(
                        selectedCustomer
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Phone</span>

                    <strong>
                      {getPhone(selectedCustomer)}
                    </strong>
                  </div>

                  <div>
                    <span>Email</span>

                    <strong>
                      {getEmail(selectedCustomer)}
                    </strong>
                  </div>

                  <div>
                    <span>Status</span>

                    <Badge
                      variant={getBadgeVariant(
                        getStatus(selectedCustomer)
                      )}
                    >
                      {String(
                        getStatus(selectedCustomer)
                      ).replaceAll("_", " ")}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* ADDRESS */}
              <div className="manager-customer-detail-section">
                <div className="manager-customer-section-title">
                  <h3>Address</h3>
                </div>

                <div className="manager-customer-address">
                  <p>
                    {selectedCustomer?.address ||
                      "Address not available"}
                  </p>

                  <span>
                    {getLocationLine(selectedCustomer)}
                  </span>
                </div>
              </div>

              {/* SOLAR PROJECT */}
              <div className="manager-customer-detail-section">
                <div className="manager-customer-section-title">
                  <h3>Solar Project</h3>
                </div>

                <div className="manager-customer-project-grid">
                  <div>
                    <span>System Size</span>

                    <strong>
                      {getSystemSize(
                        selectedCustomer
                      )}

                      {getSystemSize(
                        selectedCustomer
                      ) !== "—" && " kW"}
                    </strong>
                  </div>

                  <div>
                    <span>Project Value</span>

                    <strong>
                      {formatCurrency(
                        getTotalValue(
                          selectedCustomer
                        )
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Customer Since</span>

                    <strong>
                      {formatDate(
                        selectedCustomer?.createdAt
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Installation</span>

                    <strong>
                      {getInstallationDate(selectedCustomer)
                        ? formatDate(getInstallationDate(selectedCustomer))
                        : "—"}
                    </strong>
                  </div>
                </div>
              </div>

              {/* NOTES */}
              {selectedCustomer?.notes && (
                <div className="manager-customer-notes">
                  <span>Notes</span>

                  <p>
                    {selectedCustomer.notes}
                  </p>
                </div>
              )}
            </div>

            {/* MODAL FOOTER */}
            <div className="manager-customer-modal-footer">
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  setSelectedCustomer(null)
                }
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerCustomersPage;