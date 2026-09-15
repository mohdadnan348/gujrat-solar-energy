"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import AdminLayout from "../layout";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import SearchBox from "@/components/common/SearchBox";
import Pagination from "@/components/common/Pagination";
import Loader from "@/components/common/Loader";
import Select from "@/components/common/Select";
import ConfirmDialog from "@/components/common/ConfirmDialog";

import { invoiceService } from "@/services/invoice.service";

import "./invoices.css";

const AdminInvoicesPage = () => {
  const router = useRouter();

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("ALL");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const getValue = (object, keys, fallback = "") => {
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

  const getId = (object) => {
    if (!object) return "";

    if (typeof object === "string") {
      return object;
    }

    return object?._id || object?.id || "";
  };

  const normalizeList = (response) => {
    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response?.data)) {
      return response.data;
    }

    if (Array.isArray(response?.data?.invoices)) {
      return response.data.invoices;
    }

    if (Array.isArray(response?.invoices)) {
      return response.invoices;
    }

    if (Array.isArray(response?.results)) {
      return response.results;
    }

    return [];
  };

  const loadInvoices = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response =
        await invoiceService.getInvoices();

      setInvoices(normalizeList(response));
    } catch (err) {
      console.error(
        "Failed to load invoices:",
        err
      );

      setError(
        err?.message ||
          "Invoices load nahi ho paaye."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    statusFilter,
    dateFilter,
    itemsPerPage,
  ]);

  const getInvoiceNumber = (invoice) =>
    getValue(
      invoice,
      [
        "invoiceNumber",
        "invoiceNo",
        "number",
        "invoiceId",
      ],
      "—"
    );

  const getCustomer = (invoice) => {
    const customer = getValue(
      invoice,
      ["customer"],
      null
    );

    if (
      customer &&
      typeof customer === "object"
    ) {
      return customer;
    }

    return null;
  };

  const getCustomerName = (invoice) => {
    const customer = getCustomer(invoice);

    if (customer) {
      return getValue(
        customer,
        [
          "name",
          "fullName",
          "customerName",
          "companyName",
        ],
        "—"
      );
    }

    return getValue(
      invoice,
      [
        "customerName",
        "name",
      ],
      "—"
    );
  };

  const getInvoiceDate = (invoice) =>
    getValue(
      invoice,
      [
        "invoiceDate",
        "date",
        "createdAt",
      ],
      ""
    );

  const getDueDate = (invoice) =>
    getValue(
      invoice,
      [
        "dueDate",
        "paymentDueDate",
      ],
      ""
    );

  const getTotal = (invoice) =>
    Number(
      getValue(
        invoice,
        [
          "grandTotal",
          "totalAmount",
          "total",
          "finalAmount",
          "amount",
        ],
        0
      )
    );

  const getStatus = (invoice) =>
    String(
      getValue(
        invoice,
        ["status"],
        "DRAFT"
      )
    ).toUpperCase();

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
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

  const formatCurrency = (value) => {
    return `₹${Number(
      value || 0
    ).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case "DRAFT":
        return "default";

      case "SENT":
        return "info";

      case "ISSUED":
        return "info";

      case "CANCELLED":
        return "danger";

      case "OVERDUE":
        return "warning";

      case "ACTIVE":
        return "success";

      default:
        return "default";
    }
  };

  const isWithinDateFilter = (
    invoice,
    filter
  ) => {
    if (filter === "ALL") return true;

    const rawDate =
      getInvoiceDate(invoice);

    if (!rawDate) return false;

    const invoiceDate = new Date(
      rawDate
    );

    if (
      Number.isNaN(
        invoiceDate.getTime()
      )
    ) {
      return false;
    }

    const now = new Date();

    if (filter === "TODAY") {
      return (
        invoiceDate.toDateString() ===
        now.toDateString()
      );
    }

    if (filter === "THIS_MONTH") {
      return (
        invoiceDate.getMonth() ===
          now.getMonth() &&
        invoiceDate.getFullYear() ===
          now.getFullYear()
      );
    }

    if (filter === "LAST_30_DAYS") {
      const fromDate = new Date();

      fromDate.setDate(
        fromDate.getDate() - 30
      );

      return invoiceDate >= fromDate;
    }

    return true;
  };

  const filteredInvoices = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return invoices.filter((invoice) => {
      const status =
        getStatus(invoice);

      if (
        statusFilter !== "ALL" &&
        status !== statusFilter
      ) {
        return false;
      }

      if (
        !isWithinDateFilter(
          invoice,
          dateFilter
        )
      ) {
        return false;
      }

      if (!query) return true;

      const searchableText = [
        getInvoiceNumber(invoice),
        getCustomerName(invoice),
        getValue(invoice, [
          "customerEmail",
          "email",
        ]),
        getValue(invoice, [
          "customerPhone",
          "phone",
        ]),
        getValue(invoice, [
          "title",
          "description",
        ]),
        status,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(
        query
      );
    });
  }, [
    invoices,
    search,
    statusFilter,
    dateFilter,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredInvoices.length /
        itemsPerPage
    )
  );

  const paginatedInvoices =
    useMemo(() => {
      const start =
        (currentPage - 1) *
        itemsPerPage;

      return filteredInvoices.slice(
        start,
        start + itemsPerPage
      );
    }, [
      filteredInvoices,
      currentPage,
      itemsPerPage,
    ]);

  const stats = useMemo(() => {
    const total = invoices.length;

    const totalValue =
      invoices.reduce(
        (sum, invoice) =>
          sum + getTotal(invoice),
        0
      );

    const draft = invoices.filter(
      (invoice) =>
        getStatus(invoice) ===
        "DRAFT"
    ).length;

    const issued = invoices.filter(
      (invoice) =>
        ["ISSUED", "SENT", "ACTIVE"].includes(
          getStatus(invoice)
        )
    ).length;

    const cancelled =
      invoices.filter(
        (invoice) =>
          getStatus(invoice) ===
          "CANCELLED"
      ).length;

    return {
      total,
      totalValue,
      draft,
      issued,
      cancelled,
    };
  }, [invoices]);

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setDeleting(true);
      setError("");

      if (
        typeof invoiceService.deleteInvoice !==
        "function"
      ) {
        throw new Error(
          "Invoice delete service available nahi hai."
        );
      }

      await invoiceService.deleteInvoice(
        deleteId
      );

      setInvoices((previous) =>
        previous.filter(
          (invoice) =>
            getId(invoice) !==
            deleteId
        )
      );

      setDeleteId(null);
    } catch (err) {
      console.error(
        "Failed to delete invoice:",
        err
      );

      setError(
        err?.message ||
          "Invoice delete nahi ho paaya."
      );
    } finally {
      setDeleting(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-invoices-loading">
          <Loader />
          <p>
            Invoices load ho rahi hain...
          </p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-invoices-page">
        {/* Page Header */}
        <div className="admin-invoices-page-header">
          <div>
            <h1>
              Invoices
            </h1>

            <p>
              Manage customer invoices and
              billing documents.
            </p>
          </div>

          <div className="admin-invoices-header-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                loadInvoices(true)
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
                  "/admin/invoices/create"
                )
              }
            >
              + Create Invoice
            </Button>
          </div>
        </div>

        {error && (
          <div className="admin-invoices-error">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="admin-invoices-stats">
          <div className="admin-invoice-stat-card">
            <div className="admin-invoice-stat-icon">
              IN
            </div>

            <div>
              <span>
                Total Invoices
              </span>

              <strong>
                {stats.total}
              </strong>
            </div>
          </div>

          <div className="admin-invoice-stat-card">
            <div className="admin-invoice-stat-icon value">
              ₹
            </div>

            <div>
              <span>
                Invoice Value
              </span>

              <strong>
                {formatCurrency(
                  stats.totalValue
                )}
              </strong>
            </div>
          </div>

          <div className="admin-invoice-stat-card">
            <div className="admin-invoice-stat-icon draft">
              DR
            </div>

            <div>
              <span>
                Draft
              </span>

              <strong>
                {stats.draft}
              </strong>
            </div>
          </div>

          <div className="admin-invoice-stat-card">
            <div className="admin-invoice-stat-icon issued">
              ✓
            </div>

            <div>
              <span>
                Issued
              </span>

              <strong>
                {stats.issued}
              </strong>
            </div>
          </div>

          <div className="admin-invoice-stat-card">
            <div className="admin-invoice-stat-icon cancelled">
              ×
            </div>

            <div>
              <span>
                Cancelled
              </span>

              <strong>
                {stats.cancelled}
              </strong>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="admin-invoices-toolbar">
          <div className="admin-invoices-search">
            <SearchBox
              value={search}
              onChange={setSearch}
              placeholder="Search invoice, customer..."
            />
          </div>

          <div className="admin-invoices-filters">
            <Select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event?.target
                    ? event.target.value
                    : event
                )
              }
              options={[
                {
                  label: "All Status",
                  value: "ALL",
                },
                {
                  label: "Draft",
                  value: "DRAFT",
                },
                {
                  label: "Sent",
                  value: "SENT",
                },
                {
                  label: "Issued",
                  value: "ISSUED",
                },
                {
                  label: "Overdue",
                  value: "OVERDUE",
                },
                {
                  label: "Cancelled",
                  value: "CANCELLED",
                },
              ]}
            />

            <Select
              value={dateFilter}
              onChange={(event) =>
                setDateFilter(
                  event?.target
                    ? event.target.value
                    : event
                )
              }
              options={[
                {
                  label: "All Dates",
                  value: "ALL",
                },
                {
                  label: "Today",
                  value: "TODAY",
                },
                {
                  label: "This Month",
                  value: "THIS_MONTH",
                },
                {
                  label: "Last 30 Days",
                  value: "LAST_30_DAYS",
                },
              ]}
            />

            <Select
              value={String(
                itemsPerPage
              )}
              onChange={(event) =>
                setItemsPerPage(
                  Number(
                    event?.target
                      ? event.target.value
                      : event
                  )
                )
              }
              options={[
                {
                  label: "10 / page",
                  value: "10",
                },
                {
                  label: "25 / page",
                  value: "25",
                },
                {
                  label: "50 / page",
                  value: "50",
                },
              ]}
            />
          </div>
        </div>

        {/* Table */}
        <div className="admin-invoices-card">
          <div className="admin-invoices-card-header">
            <div>
              <h2>
                Invoice Records
              </h2>

              <p>
                {filteredInvoices.length}{" "}
                invoice
                {filteredInvoices.length !==
                1
                  ? "s"
                  : ""}{" "}
                found
              </p>
            </div>
          </div>

          {paginatedInvoices.length ===
          0 ? (
            <div className="admin-invoices-empty">
              <div className="admin-invoices-empty-icon">
                IN
              </div>

              <h3>
                No invoices found
              </h3>

              <p>
                {search ||
                statusFilter !==
                  "ALL" ||
                dateFilter !==
                  "ALL"
                  ? "Try changing your filters or search."
                  : "Create your first invoice to get started."}
              </p>

              {!search &&
                statusFilter ===
                  "ALL" &&
                dateFilter ===
                  "ALL" && (
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() =>
                      router.push(
                        "/admin/invoices/create"
                      )
                    }
                  >
                    + Create Invoice
                  </Button>
                )}
            </div>
          ) : (
            <>
              <div className="admin-invoices-table-wrapper">
                <table className="admin-invoices-table">
                  <thead>
                    <tr>
                      <th>
                        Invoice
                      </th>

                      <th>
                        Customer
                      </th>

                      <th>
                        Invoice Date
                      </th>

                      <th>
                        Due Date
                      </th>

                      <th>
                        Total
                      </th>

                      <th>
                        Status
                      </th>

                      <th>
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedInvoices.map(
                      (
                        invoice,
                        index
                      ) => {
                        const id =
                          getId(
                            invoice
                          );

                        const status =
                          getStatus(
                            invoice
                          );

                        return (
                          <tr
                            key={
                              id ||
                              `${getInvoiceNumber(
                                invoice
                              )}-${index}`
                            }
                          >
                            <td>
                              <div className="admin-invoice-number">
                                <strong>
                                  {getInvoiceNumber(
                                    invoice
                                  )}
                                </strong>

                                <span>
                                  {getValue(
                                    invoice,
                                    [
                                      "title",
                                      "description",
                                    ],
                                    "Invoice"
                                  )}
                                </span>
                              </div>
                            </td>

                            <td>
                              <div className="admin-invoice-customer">
                                <div className="admin-invoice-customer-avatar">
                                  {String(
                                    getCustomerName(
                                      invoice
                                    )
                                  )
                                    .charAt(
                                      0
                                    )
                                    .toUpperCase()}
                                </div>

                                <div>
                                  <strong>
                                    {getCustomerName(
                                      invoice
                                    )}
                                  </strong>

                                  <span>
                                    {getValue(
                                      getCustomer(
                                        invoice
                                      ),
                                      [
                                        "companyName",
                                      ],
                                      getValue(
                                        invoice,
                                        [
                                          "customerEmail",
                                          "email",
                                        ],
                                        ""
                                      )
                                    )}
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td>
                              <span className="admin-invoice-date">
                                {formatDate(
                                  getInvoiceDate(
                                    invoice
                                  )
                                )}
                              </span>
                            </td>

                            <td>
                              <span className="admin-invoice-date">
                                {formatDate(
                                  getDueDate(
                                    invoice
                                  )
                                )}
                              </span>
                            </td>

                            <td>
                              <strong className="admin-invoice-total">
                                {formatCurrency(
                                  getTotal(
                                    invoice
                                  )
                                )}
                              </strong>
                            </td>

                            <td>
                              <Badge
                                variant={getStatusVariant(
                                  status
                                )}
                              >
                                {status.replaceAll(
                                  "_",
                                  " "
                                )}
                              </Badge>
                            </td>

                            <td>
                              <div className="admin-invoice-actions">
                                <button
                                  type="button"
                                  className="admin-invoice-action-button view"
                                  onClick={() =>
                                    router.push(
                                      `/admin/invoices/${id}`
                                    )
                                  }
                                  disabled={!id}
                                  title="View Invoice"
                                >
                                  View
                                </button>

                                <button
                                  type="button"
                                  className="admin-invoice-action-button edit"
                                  onClick={() =>
                                    router.push(
                                      `/admin/invoices/create?edit=${id}`
                                    )
                                  }
                                  disabled={!id}
                                  title="Edit Invoice"
                                >
                                  Edit
                                </button>

                                <button
                                  type="button"
                                  className="admin-invoice-action-button delete"
                                  onClick={() =>
                                    setDeleteId(
                                      id
                                    )
                                  }
                                  disabled={!id}
                                  title="Delete Invoice"
                                >
                                  Delete
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

              <div className="admin-invoices-pagination">
                <Pagination
                  currentPage={
                    currentPage
                  }
                  totalPages={
                    totalPages
                  }
                  onPageChange={
                    handlePageChange
                  }
                />
              </div>
            </>
          )}
        </div>

        <ConfirmDialog
          isOpen={Boolean(
            deleteId
          )}
          onClose={() =>
            !deleting &&
            setDeleteId(null)
          }
          onConfirm={
            handleDelete
          }
          title="Delete Invoice"
          message="Are you sure you want to delete this invoice? This action cannot be undone."
          confirmText={
            deleting
              ? "Deleting..."
              : "Delete Invoice"
          }
          cancelText="Cancel"
          loading={deleting}
          danger
        />
      </div>
    </AdminLayout>
  );
};

export default AdminInvoicesPage;