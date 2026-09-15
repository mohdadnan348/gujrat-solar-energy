"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import AdminLayout from "../layout";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import SearchBox from "@/components/common/SearchBox";
import Pagination from "@/components/common/Pagination";
import Loader from "@/components/common/Loader";
import Modal from "@/components/common/Modal";

import { customerService } from "@/services/customer.service";

import "./customers.css";

const AdminCustomersPage = () => {
  const router = useRouter();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [cityFilter, setCityFilter] = useState("ALL");

  const [selectedCustomer, setSelectedCustomer] =
    useState(null);
  const [showDetails, setShowDetails] =
    useState(false);

  const [currentPage, setCurrentPage] =
    useState(1);

  const [itemsPerPage] = useState(10);

  const getValue = (
    object,
    keys,
    fallback = ""
  ) => {
    if (!object) return fallback;

    for (const key of keys) {
      const value = object?.[key];

      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        return value;
      }
    }

    return fallback;
  };

  const getId = (customer) => {
    if (!customer) return "";

    if (typeof customer === "string") {
      return customer;
    }

    return (
      customer?._id ||
      customer?.id ||
      customer?.customerId ||
      ""
    );
  };

  const normalizeList = (response) => {
    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response?.data)) {
      return response.data;
    }

    if (Array.isArray(response?.data?.data)) {
      return response.data.data;
    }

    if (Array.isArray(response?.customers)) {
      return response.customers;
    }

    if (Array.isArray(response?.data?.customers)) {
      return response.data.customers;
    }

    if (Array.isArray(response?.results)) {
      return response.results;
    }

    if (Array.isArray(response?.data?.results)) {
      return response.data.results;
    }

    return [];
  };

  const loadCustomers = async (
    showRefresh = false
  ) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response =
        await customerService.getCustomers();

      setCustomers(
        normalizeList(response)
      );
    } catch (err) {
      console.error(
        "Failed to load customers:",
        err
      );

      setError(
        err?.message ||
          "Customers load nahi ho paaye."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const getCustomerName = (customer) => {
    return (
      getValue(customer, [
        "name",
        "fullName",
        "customerName",
      ]) ||
      getValue(
        customer,
        ["companyName"],
        "Unnamed Customer"
      )
    );
  };

  const getCustomerPhone = (customer) =>
    getValue(customer, [
      "phone",
      "mobile",
      "contactNumber",
      "phoneNumber",
    ]);

  const getCustomerEmail = (customer) =>
    getValue(customer, [
      "email",
      "emailAddress",
    ]);

  const getCustomerCity = (customer) =>
    getValue(customer, [
      "city",
      "location",
    ]);

  const getCustomerStatus = (customer) => {
    const value = getValue(
      customer,
      ["status"],
      ""
    );

    if (!value) {
      return "ACTIVE";
    }

    return String(value).toUpperCase();
  };

  const getCreatedDate = (customer) =>
    getValue(customer, [
      "createdAt",
      "createdDate",
      "date",
    ]);

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const statusOptions = useMemo(() => {
    const statuses = new Set();

    customers.forEach((customer) => {
      statuses.add(
        getCustomerStatus(customer)
      );
    });

    return Array.from(statuses).sort();
  }, [customers]);

  const cityOptions = useMemo(() => {
    const cities = new Set();

    customers.forEach((customer) => {
      const city =
        getCustomerCity(customer);

      if (city) {
        cities.add(String(city));
      }
    });

    return Array.from(cities).sort(
      (a, b) =>
        a.localeCompare(b)
    );
  }, [customers]);

  const filteredCustomers = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    return customers.filter(
      (customer) => {
        const name =
          getCustomerName(
            customer
          ).toLowerCase();

        const company =
          getValue(
            customer,
            ["companyName"],
            ""
          ).toLowerCase();

        const phone =
          getCustomerPhone(
            customer
          ).toLowerCase();

        const email =
          getCustomerEmail(
            customer
          ).toLowerCase();

        const city =
          getCustomerCity(
            customer
          ).toLowerCase();

        const matchesSearch =
          !query ||
          name.includes(query) ||
          company.includes(query) ||
          phone.includes(query) ||
          email.includes(query) ||
          city.includes(query);

        const status =
          getCustomerStatus(
            customer
          );

        const matchesStatus =
          statusFilter === "ALL" ||
          status === statusFilter;

        const matchesCity =
          cityFilter === "ALL" ||
          city ===
            cityFilter.toLowerCase();

        return (
          matchesSearch &&
          matchesStatus &&
          matchesCity
        );
      }
    );
  }, [
    customers,
    search,
    statusFilter,
    cityFilter,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    statusFilter,
    cityFilter,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredCustomers.length /
        itemsPerPage
    )
  );

  const paginatedCustomers =
    useMemo(() => {
      const start =
        (currentPage - 1) *
        itemsPerPage;

      return filteredCustomers.slice(
        start,
        start + itemsPerPage
      );
    }, [
      filteredCustomers,
      currentPage,
      itemsPerPage,
    ]);

  const stats = useMemo(() => {
    const total =
      customers.length;

    const active =
      customers.filter(
        (customer) =>
          getCustomerStatus(
            customer
          ) === "ACTIVE"
      ).length;

    const inactive =
      customers.filter(
        (customer) =>
          getCustomerStatus(
            customer
          ) === "INACTIVE"
      ).length;

    const thisMonth =
      customers.filter(
        (customer) => {
          const value =
            getCreatedDate(
              customer
            );

          if (!value) return false;

          const date =
            new Date(value);

          const now =
            new Date();

          return (
            date.getMonth() ===
              now.getMonth() &&
            date.getFullYear() ===
              now.getFullYear()
          );
        }
      ).length;

    return {
      total,
      active,
      inactive,
      thisMonth,
    };
  }, [customers]);

  const handleView = (
    customer
  ) => {
    const id =
      getId(customer);

    if (id) {
      router.push(
        `/admin/customers/${id}`
      );
      return;
    }

    setSelectedCustomer(
      customer
    );
    setShowDetails(true);
  };

  const handleEdit = (
    customer
  ) => {
    const id =
      getId(customer);

    if (!id) return;

    router.push(
      `/admin/customers/${id}?edit=true`
    );
  };

  const getStatusVariant = (
    status
  ) => {
    switch (
      String(status).toUpperCase()
    ) {
      case "ACTIVE":
        return "success";

      case "INACTIVE":
        return "danger";

      case "PROSPECT":
        return "warning";

      default:
        return "default";
    }
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setCityFilter("ALL");
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-customers-loading">
          <Loader />
          <p>
            Customers load ho rahe hain...
          </p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-customers-page">
        {/* Header */}
        <div className="admin-customers-header">
          <div>
            <div className="admin-customers-title">
              <div className="admin-customers-title-icon">
                👥
              </div>

              <div>
                <h1>
                  Customers
                </h1>

                <p>
                  Converted leads aur customers ki
                  complete information manage karein.
                </p>
              </div>
            </div>
          </div>

          <div className="admin-customers-header-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                loadCustomers(true)
              }
              disabled={refreshing}
            >
              {refreshing
                ? "Refreshing..."
                : "↻ Refresh"}
            </Button>

            <Button
              type="button"
              variant="primary"
              onClick={() =>
                router.push(
                  "/admin/customers/create"
                )
              }
            >
              + Add Customer
            </Button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="admin-customers-error">
            <span>!</span>
            <p>{error}</p>

            <button
              type="button"
              onClick={() =>
                loadCustomers(true)
              }
            >
              Retry
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="admin-customers-stats">
          <div className="admin-customer-stat-card">
            <div className="admin-customer-stat-icon total">
              👥
            </div>

            <div>
              <span>
                Total Customers
              </span>

              <strong>
                {stats.total}
              </strong>
            </div>
          </div>

          <div className="admin-customer-stat-card">
            <div className="admin-customer-stat-icon active">
              ✓
            </div>

            <div>
              <span>
                Active Customers
              </span>

              <strong>
                {stats.active}
              </strong>
            </div>
          </div>

          <div className="admin-customer-stat-card">
            <div className="admin-customer-stat-icon inactive">
              ×
            </div>

            <div>
              <span>
                Inactive Customers
              </span>

              <strong>
                {stats.inactive}
              </strong>
            </div>
          </div>

          <div className="admin-customer-stat-card">
            <div className="admin-customer-stat-icon month">
              +
            </div>

            <div>
              <span>
                Added This Month
              </span>

              <strong>
                {stats.thisMonth}
              </strong>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="admin-customers-toolbar">
          <div className="admin-customers-search">
            <SearchBox
              value={search}
              onChange={setSearch}
              placeholder="Search by name, phone, email, city..."
            />
          </div>

          <div className="admin-customers-filters">
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
              className="admin-customers-filter-select"
            >
              <option value="ALL">
                All Status
              </option>

              {statusOptions.map(
                (status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {String(
                      status
                    ).replaceAll(
                      "_",
                      " "
                    )}
                  </option>
                )
              )}
            </select>

            <select
              value={cityFilter}
              onChange={(event) =>
                setCityFilter(
                  event.target.value
                )
              }
              className="admin-customers-filter-select"
            >
              <option value="ALL">
                All Cities
              </option>

              {cityOptions.map(
                (city) => (
                  <option
                    key={city}
                    value={city}
                  >
                    {city}
                  </option>
                )
              )}
            </select>

            {(search ||
              statusFilter !==
                "ALL" ||
              cityFilter !==
                "ALL") && (
              <button
                type="button"
                className="admin-customers-clear-filter"
                onClick={
                  clearFilters
                }
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="admin-customers-table-card">
          <div className="admin-customers-table-header">
            <div>
              <h2>
                Customer Directory
              </h2>

              <p>
                Showing{" "}
                <strong>
                  {
                    filteredCustomers.length
                  }
                </strong>{" "}
                customer
                {filteredCustomers.length !==
                1
                  ? "s"
                  : ""}
              </p>
            </div>
          </div>

          {paginatedCustomers.length ===
          0 ? (
            <div className="admin-customers-empty">
              <div className="admin-customers-empty-icon">
                👥
              </div>

              <h3>
                No customers found
              </h3>

              <p>
                {search ||
                statusFilter !==
                  "ALL" ||
                cityFilter !==
                  "ALL"
                  ? "Aapke filters ke according koi customer nahi mila."
                  : "Abhi tak koi customer available nahi hai."}
              </p>

              {search ||
              statusFilter !==
                "ALL" ||
              cityFilter !==
                "ALL" ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={
                    clearFilters
                  }
                >
                  Clear Filters
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="primary"
                  onClick={() =>
                    router.push(
                      "/admin/customers/create"
                    )
                  }
                >
                  + Add Customer
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="admin-customers-table-wrapper">
                <table className="admin-customers-table">
                  <thead>
                    <tr>
                      <th>
                        Customer
                      </th>

                      <th>
                        Contact
                      </th>

                      <th>
                        Location
                      </th>

                      <th>
                        Status
                      </th>

                      <th>
                        Added On
                      </th>

                      <th>
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedCustomers.map(
                      (
                        customer,
                        index
                      ) => {
                        const id =
                          getId(
                            customer
                          );

                        const name =
                          getCustomerName(
                            customer
                          );

                        const company =
                          getValue(
                            customer,
                            [
                              "companyName",
                            ]
                          );

                        const phone =
                          getCustomerPhone(
                            customer
                          );

                        const email =
                          getCustomerEmail(
                            customer
                          );

                        const city =
                          getCustomerCity(
                            customer
                          );

                        const status =
                          getCustomerStatus(
                            customer
                          );

                        return (
                          <tr
                            key={
                              id ||
                              `customer-${index}`
                            }
                          >
                            <td>
                              <div className="admin-customer-person">
                                <div className="admin-customer-avatar">
                                  {String(
                                    name ||
                                      "C"
                                  )
                                    .charAt(
                                      0
                                    )
                                    .toUpperCase()}
                                </div>

                                <div>
                                  <strong>
                                    {name}
                                  </strong>

                                  {company && (
                                    <span>
                                      {
                                        company
                                      }
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>

                            <td>
                              <div className="admin-customer-contact">
                                {phone && (
                                  <strong>
                                    {phone}
                                  </strong>
                                )}

                                {email && (
                                  <span>
                                    {
                                      email
                                    }
                                  </span>
                                )}

                                {!phone &&
                                  !email && (
                                    <span>
                                      —
                                    </span>
                                  )}
                              </div>
                            </td>

                            <td>
                              <span className="admin-customer-location">
                                {city ||
                                  "—"}
                              </span>
                            </td>

                            <td>
                              <Badge
                                variant={getStatusVariant(
                                  status
                                )}
                              >
                                {String(
                                  status
                                ).replaceAll(
                                  "_",
                                  " "
                                )}
                              </Badge>
                            </td>

                            <td>
                              <span className="admin-customer-date">
                                {formatDate(
                                  getCreatedDate(
                                    customer
                                  )
                                )}
                              </span>
                            </td>

                            <td>
                              <div className="admin-customer-actions">
                                <button
                                  type="button"
                                  title="View Customer"
                                  onClick={() =>
                                    handleView(
                                      customer
                                    )
                                  }
                                >
                                  View
                                </button>

                                <button
                                  type="button"
                                  title="Edit Customer"
                                  onClick={() =>
                                    handleEdit(
                                      customer
                                    )
                                  }
                                >
                                  Edit
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="admin-customers-pagination">
                  <Pagination
                    currentPage={
                      currentPage
                    }
                    totalPages={
                      totalPages
                    }
                    onPageChange={
                      setCurrentPage
                    }
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Fallback Detail Modal */}
        <Modal
          isOpen={showDetails}
          onClose={() =>
            setShowDetails(false)
          }
          title="Customer Details"
        >
          {selectedCustomer && (
            <div className="admin-customer-fallback-details">
              <div className="admin-customer-fallback-profile">
                <div className="admin-customer-fallback-avatar">
                  {String(
                    getCustomerName(
                      selectedCustomer
                    )
                  )
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <h3>
                    {getCustomerName(
                      selectedCustomer
                    )}
                  </h3>

                  <Badge
                    variant={getStatusVariant(
                      getCustomerStatus(
                        selectedCustomer
                      )
                    )}
                  >
                    {getCustomerStatus(
                      selectedCustomer
                    )}
                  </Badge>
                </div>
              </div>

              <div className="admin-customer-fallback-grid">
                <div>
                  <span>
                    Phone
                  </span>

                  <strong>
                    {getCustomerPhone(
                      selectedCustomer
                    ) || "—"}
                  </strong>
                </div>

                <div>
                  <span>
                    Email
                  </span>

                  <strong>
                    {getCustomerEmail(
                      selectedCustomer
                    ) || "—"}
                  </strong>
                </div>

                <div>
                  <span>
                    City
                  </span>

                  <strong>
                    {getCustomerCity(
                      selectedCustomer
                    ) || "—"}
                  </strong>
                </div>

                <div>
                  <span>
                    Added On
                  </span>

                  <strong>
                    {formatDate(
                      getCreatedDate(
                        selectedCustomer
                      )
                    )}
                  </strong>
                </div>
              </div>

              <div className="admin-customer-fallback-actions">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    setShowDetails(
                      false
                    )
                  }
                >
                  Close
                </Button>

                {getId(
                  selectedCustomer
                ) && (
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() =>
                      router.push(
                        `/admin/customers/${getId(
                          selectedCustomer
                        )}`
                      )
                    }
                  >
                    Open Customer
                  </Button>
                )}
              </div>
            </div>
          )}
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default AdminCustomersPage;