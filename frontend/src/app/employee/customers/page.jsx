"use client";

import React, { useEffect, useMemo, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import Button from "@/components/common/Button";
import SearchBox from "@/components/common/SearchBox";
import Select from "@/components/common/Select";
import Badge from "@/components/common/Badge";
import Pagination from "@/components/common/Pagination";
import Loader from "@/components/common/Loader";
import { useAuth } from "@/hooks/useAuth";
import customerService from "@/services/customer.service";

const EmployeeCustomersPage = () => {
  const { user, logout, loading: authLoading } = useAuth();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const limit = 10;

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await customerService.getCustomers();

      const items =
        response?.data?.customers ||
        response?.data?.items ||
        response?.customers ||
        response?.items ||
        response?.data ||
        [];

      setCustomers(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error("Failed to load customers:", err);

      setError(
        err?.message ||
          "Unable to load customers. Please try again."
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

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return customers.filter((customer) => {
      const customerStatus =
        customer?.status ||
        customer?.customerStatus ||
        "";

      const searchableText = [
        customer?.name,
        customer?.customerName,
        customer?.companyName,
        customer?.phone,
        customer?.mobile,
        customer?.email,
        customer?.city,
        customer?.location,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !query || searchableText.includes(query);

      const matchesStatus =
        !status ||
        customerStatus.toLowerCase() === status.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [customers, search, status]);

  useEffect(() => {
    setPage(1);
  }, [search, status]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCustomers.length / limit)
  );

  const paginatedCustomers = useMemo(() => {
    const start = (page - 1) * limit;

    return filteredCustomers.slice(start, start + limit);
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

  const getStatus = (customer) =>
    customer?.status ||
    customer?.customerStatus ||
    "ACTIVE";

  const getStatusVariant = (customerStatus) => {
    const value = customerStatus.toLowerCase();

    if (
      ["active", "converted", "completed"].includes(value)
    ) {
      return "success";
    }

    if (
      ["inactive", "cancelled", "closed"].includes(value)
    ) {
      return "danger";
    }

    if (
      ["pending", "prospect", "follow_up"].includes(value)
    ) {
      return "warning";
    }

    return "default";
  };

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleViewCustomer = (customer) => {
    const id = customer?._id || customer?.id;

    if (id) {
      window.location.href = `/employee/customers/${id}`;
    }
  };

  if (authLoading) {
    return (
      <div className="employee-customers-loading">
        <Loader />
      </div>
    );
  }

  return (
    <MainLayout
      user={user}
      onLogout={handleLogout}
      onSearch={setSearch}
      notificationCount={0}
    >
      <div className="employee-customers-page">
        <div className="employee-customers-header">
          <div>
            <span className="employee-customers-eyebrow">
              Customer Management
            </span>

            <h1>Customers</h1>

            <p>
              View and manage customers converted from your leads.
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

              <h3>No customers found</h3>

              <p>
                {search || status
                  ? "Try changing your search or filter."
                  : "No customers are available yet."}
              </p>
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
                          index;

                        const customerStatus =
                          getStatus(customer);

                        return (
                          <tr key={id}>
                            <td>
                              <div className="employee-customer-name">
                                {getCustomerName(customer)}
                              </div>

                              {customer?.email && (
                                <div className="employee-customer-subtext">
                                  {customer.email}
                                </div>
                              )}
                            </td>

                            <td>{getPhone(customer)}</td>

                            <td>
                              {customer?.city ||
                                customer?.location ||
                                "—"}
                            </td>

                            <td>
                              {customer?.systemType ||
                                customer?.solarSystemType ||
                                customer?.capacity
                                ? `${customer?.systemType || "Solar"}${
                                    customer?.capacity
                                      ? ` • ${customer.capacity} kW`
                                      : ""
                                  }`
                                : "—"}
                            </td>

                            <td>
                              <Badge
                                variant={getStatusVariant(
                                  customerStatus
                                )}
                              >
                                {customerStatus.replaceAll(
                                  "_",
                                  " "
                                )}
                              </Badge>
                            </td>

                            <td>
                              {formatDate(
                                customer?.createdAt ||
                                  customer?.createdDate
                              )}
                            </td>

                            <td>
                              <Button
                                type="button"
                                variant="secondary"
                                onClick={() =>
                                  handleViewCustomer(customer)
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

              <div className="employee-customers-footer">
                <span>
                  Showing{" "}
                  {filteredCustomers.length === 0
                    ? 0
                    : (page - 1) * limit + 1}{" "}
                  -{" "}
                  {Math.min(
                    page * limit,
                    filteredCustomers.length
                  )}{" "}
                  of {filteredCustomers.length} customers
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
    </MainLayout>
  );
};

export default EmployeeCustomersPage;