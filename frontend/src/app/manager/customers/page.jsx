"use client";

import React, { useEffect, useMemo, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import SearchBox from "@/components/common/SearchBox";
import Pagination from "@/components/common/Pagination";
import Loader from "@/components/common/Loader";
import { useAuth } from "@/hooks/useAuth";
import customerService from "@/services/customer.service";

const ManagerCustomersPage = () => {
  const { user, logout, loading: authLoading } = useAuth();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const itemsPerPage = 10;

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await customerService.getCustomers();

      const data =
        response?.data?.customers ||
        response?.customers ||
        response?.data?.items ||
        response?.items ||
        response?.data ||
        [];

      setCustomers(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      console.error("Customers error:", err);

      setError(
        err?.message ||
          err?.response?.data?.message ||
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

  const handleLogout = async () => {
    await logout();
  };

  const getCustomerName = (customer) =>
    customer?.name ||
    customer?.customerName ||
    [
      customer?.firstName,
      customer?.lastName,
    ]
      .filter(Boolean)
      .join(" ") ||
    "Unnamed Customer";

  const getPhone = (customer) =>
    customer?.phone ||
    customer?.mobile ||
    customer?.contactNumber ||
    "—";

  const getEmail = (customer) =>
    customer?.email ||
    "—";

  const getStatus = (customer) =>
    customer?.status ||
    customer?.customerStatus ||
    "ACTIVE";

  const getCustomerNumber = (customer) =>
    customer?.customerNumber ||
    customer?.customerNo ||
    customer?.customerId ||
    customer?.code ||
    "—";

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

  const getSystemSize = (customer) =>
    customer?.systemSize ||
    customer?.capacity ||
    customer?.solarRequirement
      ?.systemSize ||
    customer?.solarRequirement
      ?.requiredCapacity ||
    "—";

  const getTotalValue = (customer) =>
    customer?.totalAmount ??
    customer?.projectValue ??
    customer?.quotation?.grandTotal ??
    customer?.quotation?.totalAmount ??
    0;

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return customers.filter((customer) => {
      const status = String(
        getStatus(customer)
      ).toUpperCase();

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
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [
    customers,
    search,
    statusFilter,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredCustomers.length /
        itemsPerPage
    )
  );

  const currentPage = Math.min(
    page,
    totalPages
  );

  const paginatedCustomers =
    filteredCustomers.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const handlePageChange = (nextPage) => {
    setPage(nextPage);
  };

  if (authLoading || loading) {
    return (
      <div className="manager-customers-loading">
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
      <div className="manager-customers-page">
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
              setStatusFilter(
                event.target.value
              )
            }
          >
            <option value="ALL">
              All Status
            </option>
            <option value="ACTIVE">
              Active
            </option>
            <option value="PENDING">
              Pending
            </option>
            <option value="IN_PROGRESS">
              In Progress
            </option>
            <option value="COMPLETED">
              Completed
            </option>
            <option value="INSTALLED">
              Installed
            </option>
            <option value="INACTIVE">
              Inactive
            </option>
          </select>
        </div>

        <div className="manager-customers-summary">
          <div className="manager-customer-summary-card">
            <span>Total Customers</span>
            <strong>
              {filteredCustomers.length}
            </strong>
          </div>

          <div className="manager-customer-summary-card">
            <span>Active</span>
            <strong>
              {
                filteredCustomers.filter(
                  (customer) =>
                    String(
                      getStatus(customer)
                    ).toUpperCase() ===
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
                    String(
                      getStatus(customer)
                    ).toUpperCase() ===
                    "INSTALLED"
                ).length
              }
            </strong>
          </div>
        </div>

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
                {paginatedCustomers.length ===
                0 ? (
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
                                {getEmail(
                                  customer
                                )}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className="manager-customer-number">
                            {getCustomerNumber(
                              customer
                            )}
                          </span>
                        </td>

                        <td>
                          <div className="manager-customer-contact">
                            <strong>
                              {getPhone(customer)}
                            </strong>

                            {getEmail(
                              customer
                            ) !== "—" && (
                              <span>
                                {getEmail(
                                  customer
                                )}
                              </span>
                            )}
                          </div>
                        </td>

                        <td>
                          <div className="manager-customer-location">
                            <strong>
                              {customer?.city ||
                                "—"}
                            </strong>

                            <span>
                              {customer?.state ||
                                customer?.address ||
                                "—"}
                            </span>
                          </div>
                        </td>

                        <td>
                          {getSystemSize(
                            customer
                          )}
                          {getSystemSize(
                            customer
                          ) !== "—" && " kW"}
                        </td>

                        <td>
                          <strong className="manager-customer-value">
                            {formatCurrency(
                              getTotalValue(
                                customer
                              )
                            )}
                          </strong>
                        </td>

                        <td>
                          <Badge
                            variant={getBadgeVariant(
                              getStatus(
                                customer
                              )
                            )}
                          >
                            {String(
                              getStatus(
                                customer
                              )
                            ).replaceAll(
                              "_",
                              " "
                            )}
                          </Badge>
                        </td>

                        <td>
                          {formatDate(
                            customer?.createdAt
                          )}
                        </td>

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

              <div className="manager-customer-modal-body">
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
                        {getPhone(
                          selectedCustomer
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>Email</span>
                      <strong>
                        {getEmail(
                          selectedCustomer
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>Status</span>

                      <Badge
                        variant={getBadgeVariant(
                          getStatus(
                            selectedCustomer
                          )
                        )}
                      >
                        {String(
                          getStatus(
                            selectedCustomer
                          )
                        ).replaceAll(
                          "_",
                          " "
                        )}
                      </Badge>
                    </div>
                  </div>
                </div>

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
                      {[
                        selectedCustomer?.city,
                        selectedCustomer?.state,
                        selectedCustomer?.pincode ||
                          selectedCustomer?.postalCode,
                      ]
                        .filter(Boolean)
                        .join(", ") || "—"}
                    </span>
                  </div>
                </div>

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
                        {selectedCustomer
                          ?.installationDate
                          ? formatDate(
                              selectedCustomer.installationDate
                            )
                          : "—"}
                      </strong>
                    </div>
                  </div>
                </div>

                {selectedCustomer?.notes && (
                  <div className="manager-customer-notes">
                    <span>Notes</span>
                    <p>
                      {selectedCustomer.notes}
                    </p>
                  </div>
                )}
              </div>

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
    </MainLayout>
  );
};

export default ManagerCustomersPage;