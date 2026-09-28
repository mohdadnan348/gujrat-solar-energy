"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Button from "@/components/common/Button";
import SearchBox from "@/components/common/SearchBox";
import Select from "@/components/common/Select";
import Badge from "@/components/common/Badge";
import Pagination from "@/components/common/Pagination";
import Loader from "@/components/common/Loader";
import { useAuth } from "@/hooks/useAuth";
import customerService from "@/services/customer.service";
import "./customers.css";
const LIMIT = 10;

const EmployeeCustomersPage = () => {
  const { user, loading: authLoading } = useAuth();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await customerService.getCustomers();

      /*
       * Backend response:
       *
       * {
       *   success: true,
       *   message: "Customers fetched successfully",
       *   data: [],
       *   pagination: {...}
       * }
       */

      const items = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.data?.customers)
        ? response.data.customers
        : Array.isArray(response?.customers)
        ? response.customers
        : [];

      setCustomers(items);
    } catch (err) {
      console.error("Failed to load customers:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load customers. Please try again."
      );

      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      loadCustomers();
    }
  }, [authLoading, user, loadCustomers]);

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return customers.filter((customer) => {
      const customerStatus = String(
        customer?.status ||
          customer?.customerStatus ||
          "ACTIVE"
      ).toLowerCase();

      const searchableText = [
        customer?.name,
        customer?.customerName,
        customer?.companyName,
        customer?.customerId,
        customer?.phone,
        customer?.mobile,
        customer?.contactNumber,
        customer?.email,
        customer?.city,
        customer?.state,
        customer?.location,
        customer?.systemType,
        customer?.solarSystemType,
        customer?.capacity,
      ]
        .filter(
          (value) =>
            value !== undefined &&
            value !== null &&
            value !== ""
        )
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !query || searchableText.includes(query);

      const matchesStatus =
        !status ||
        customerStatus === status.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [customers, search, status]);

  useEffect(() => {
    setPage(1);
  }, [search, status]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCustomers.length / LIMIT)
  );

  const paginatedCustomers = useMemo(() => {
    const start = (page - 1) * LIMIT;

    return filteredCustomers.slice(
      start,
      start + LIMIT
    );
  }, [filteredCustomers, page]);

  const getCustomerName = (customer) =>
    customer?.name ||
    customer?.customerName ||
    customer?.companyName ||
    "Unnamed Customer";

  const getPhone = (customer) =>
    customer?.phone ||
    customer?.mobile ||
    customer?.contactNumber ||
    "—";

  const getLocation = (customer) => {
    if (customer?.city && customer?.state) {
      return `${customer.city}, ${customer.state}`;
    }

    return (
      customer?.city ||
      customer?.location ||
      customer?.state ||
      "—"
    );
  };

  const getSystem = (customer) => {
    const systemType =
      customer?.systemType ||
      customer?.solarSystemType;

    const capacity = customer?.capacity;

    if (!systemType && !capacity) {
      return "—";
    }

    if (systemType && capacity) {
      return `${systemType} • ${capacity} kW`;
    }

    if (capacity) {
      return `${capacity} kW`;
    }

    return systemType;
  };

  const getStatus = (customer) =>
    customer?.status ||
    customer?.customerStatus ||
    "ACTIVE";

  const getStatusVariant = (customerStatus) => {
    const value = String(customerStatus)
      .toLowerCase()
      .trim();

    if (
      ["active", "converted", "completed"].includes(value)
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

  const handleViewCustomer = (customer) => {
    const id =
      customer?._id ||
      customer?.id;

    if (!id) {
      return;
    }

    window.location.href =
      `/employee/customers/${id}`;
  };

  if (authLoading) {
    return (
      <div className="employee-customers-loading">
        <Loader />
      </div>
    );
  }

  return (
    <div className="employee-customers-page">

      {/* Header */}
      <div className="employee-customers-header">
        <div>
          <span className="employee-customers-eyebrow">
            Customer Management
          </span>

          <h1>Customers</h1>

          <p>
            View and manage customers converted
            from your leads.
          </p>
        </div>

        <Button
          type="button"
          variant="secondary"
          onClick={loadCustomers}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {/* Toolbar */}
      <div className="employee-customers-toolbar">
        <SearchBox
          value={search}
          onChange={setSearch}
          placeholder="Search customers..."
        />

        <Select
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
              value: "ACTIVE",
              label: "Active",
            },
            {
              value: "INACTIVE",
              label: "Inactive",
            },
            {
              value: "PENDING",
              label: "Pending",
            },
            {
              value: "CLOSED",
              label: "Closed",
            },
          ]}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="employee-customers-error">
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

      {/* Customer Card */}
      <div className="employee-customers-card">
        {loading ? (
          <div className="employee-customers-loader">
            <Loader />
          </div>
        ) : paginatedCustomers.length === 0 ? (
          <div className="employee-customers-empty">
            <div className="employee-customers-empty-icon">
              👤
            </div>

            <h3>
              {search || status
                ? "No matching customers"
                : "No customers yet"}
            </h3>

            <p>
              {search || status
                ? "Try changing your search or status filter."
                : "Customers assigned to you will appear here."}
            </p>

            {(search || status) && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setSearch("");
                  setStatus("");
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="employee-customers-table-wrapper">
              <table className="employee-customers-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Contact</th>
                    <th>Location</th>
                    <th>System</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedCustomers.map(
                    (customer, index) => {
                      const id =
                        customer?._id ||
                        customer?.id ||
                        `customer-${index}`;

                      const customerStatus =
                        getStatus(customer);

                      return (
                        <tr key={id}>
                          {/* Customer */}
                          <td>
                            <div className="employee-customer-name">
                              {getCustomerName(
                                customer
                              )}
                            </div>

                            {customer?.customerId && (
                              <div className="employee-customer-subtext">
                                ID:{" "}
                                {customer.customerId}
                              </div>
                            )}

                            {customer?.email && (
                              <div className="employee-customer-subtext">
                                {customer.email}
                              </div>
                            )}
                          </td>

                          {/* Contact */}
                          <td>
                            <div>
                              {getPhone(customer)}
                            </div>
                          </td>

                          {/* Location */}
                          <td>
                            {getLocation(customer)}
                          </td>

                          {/* System */}
                          <td>
                            {getSystem(customer)}
                          </td>

                          {/* Status */}
                          <td>
                            <Badge
                              variant={getStatusVariant(
                                customerStatus
                              )}
                            >
                              {String(
                                customerStatus
                              ).replaceAll(
                                "_",
                                " "
                              )}
                            </Badge>
                          </td>

                          {/* Created */}
                          <td>
                            {formatDate(
                              customer?.createdAt ||
                                customer?.createdDate
                            )}
                          </td>

                          {/* Action */}
                          <td>
                            <Button
                              type="button"
                              variant="secondary"
                              onClick={() =>
                                handleViewCustomer(
                                  customer
                                )
                              }
                            >
                              View
                            </Button>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="employee-customers-footer">
              <span>
                Showing{" "}
                {(page - 1) * LIMIT + 1} -{" "}
                {Math.min(
                  page * LIMIT,
                  filteredCustomers.length
                )}{" "}
                of{" "}
                {filteredCustomers.length}{" "}
                customers
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
    </div>
  );
};

export default EmployeeCustomersPage;