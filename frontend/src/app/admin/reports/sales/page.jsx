"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AdminLayout from "@/app/admin/layout";
import Select from "@/components/common/Select";
import DatePicker from "@/components/common/DatePicker";
import Button from "@/components/common/Button";
import Loader from "@/components/common/Loader";
import Badge from "@/components/common/Badge";
import reportService from "@/services/report.service";
import "@/app/admin/reports/sales/sales-report.css";

const getArray = (value) => {
  if (Array.isArray(value)) return value;

  if (Array.isArray(value?.data)) return value.data;
 if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.results)) return value.results;

  return [];
};

const getReportPayload = (response) => {
  if (!response) return {};

  if (response.data && !Array.isArray(response.data)) {
    return response.data;
  }

  return response;
};

const formatCurrency = (value) => {
  const amount = Number(value || 0);

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatNumber = (value) => {
  return new Intl.NumberFormat("en-IN").format(Number(value || 0));
};

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getValue = (object, keys, fallback = 0) => {
  for (const key of keys) {
    if (
      object &&
      object[key] !== undefined &&
      object[key] !== null &&
      object[key] !== ""
    ) {
      return object[key];
    }
  }

  return fallback;
};

const getCustomerName = (item) => {
  return (
    item?.customer?.name ||
    item?.customerName ||
    item?.lead?.name ||
    item?.name ||
    "-"
  );
};

const getQuotationNumber = (item) => {
  return (
    item?.quotationNumber ||
    item?.quotationNo ||
    item?.quoteNumber ||
    item?.number ||
    item?.quotation?.quotationNumber ||
    "-"
  );
};

const getInvoiceNumber = (item) => {
  return (
    item?.invoiceNumber ||
    item?.invoiceNo ||
    item?.number ||
    item?.invoice?.invoiceNumber ||
    "-"
  );
};

const getStatus = (item) => {
  return item?.status || item?.quotationStatus || item?.invoiceStatus || "-";
};

const getStatusVariant = (status) => {
  const normalized = String(status || "").toLowerCase();

  if (
    normalized.includes("approved") ||
    normalized.includes("converted") ||
    normalized.includes("completed") ||
    normalized.includes("issued")
  ) {
    return "success";
  }

  if (
    normalized.includes("pending") ||
    normalized.includes("draft") ||
    normalized.includes("sent")
  ) {
    return "warning";
  }

  if (
    normalized.includes("cancel") ||
    normalized.includes("reject") ||
    normalized.includes("lost")
  ) {
    return "danger";
  }

  return "default";
};

const SalesReportPage = () => {
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    status: "",
    type: "",
  });

  const [report, setReport] = useState({});
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");

  const loadReport = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};

      if (filters.startDate) {
        params.startDate = filters.startDate;
      }

      if (filters.endDate) {
        params.endDate = filters.endDate;
      }

      if (filters.status) {
        params.status = filters.status;
      }

      if (filters.type) {
        params.type = filters.type;
      }

      const response = await reportService.getSalesReport(params);

      setReport(getReportPayload(response));
    } catch (err) {
      console.error("Failed to load sales report:", err);

      setError(
        err?.message ||
          err?.response?.data?.message ||
          "Failed to load sales report."
      );

      setReport({});
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const handleFilterChange = (field, value) => {
    setFilters((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleReset = () => {
    setFilters({
      startDate: "",
      endDate: "",
      status: "",
      type: "",
    });
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      setError("");

      if (typeof reportService.exportSalesReport === "function") {
        const response = await reportService.exportSalesReport(filters);

        if (response?.data instanceof Blob) {
          const url = window.URL.createObjectURL(response.data);
          const link = document.createElement("a");

          link.href = url;
          link.download = "sales-report.xlsx";
          document.body.appendChild(link);
          link.click();
          link.remove();

          window.URL.revokeObjectURL(url);
        }

        return;
      }

      window.print();
    } catch (err) {
      console.error("Failed to export sales report:", err);
      setError(
        err?.message ||
          err?.response?.data?.message ||
          "Failed to export sales report."
      );
    } finally {
      setExporting(false);
    }
  };

  const summary = useMemo(() => {
    const summaryData =
      report?.summary ||
      report?.totals ||
      report?.statistics ||
      report?.data?.summary ||
      {};

    return {
      totalSales: Number(
        getValue(summaryData, [
          "totalSales",
          "sales",
          "totalRevenue",
          "revenue",
          "totalAmount",
        ])
      ),
      totalQuotations: Number(
        getValue(summaryData, [
          "totalQuotations",
          "quotations",
          "quotationCount",
        ])
      ),
      totalInvoices: Number(
        getValue(summaryData, ["totalInvoices", "invoices", "invoiceCount"])
      ),
      averageSale: Number(
        getValue(summaryData, [
          "averageSale",
          "averageSales",
          "averageOrderValue",
        ])
      ),
      conversionRate: Number(
        getValue(summaryData, [
          "conversionRate",
          "salesConversionRate",
          "conversion",
        ])
      ),
    };
  }, [report]);

  const salesByMonth = useMemo(() => {
    return getArray(
      report?.salesByMonth ||
        report?.monthlySales ||
        report?.monthly ||
        report?.data?.salesByMonth
    );
  }, [report]);

  const salesByStatus = useMemo(() => {
    return getArray(
      report?.salesByStatus ||
        report?.statusBreakdown ||
        report?.byStatus ||
        report?.data?.salesByStatus
    );
  }, [report]);

  const recentSales = useMemo(() => {
    return getArray(
      report?.recentSales ||
        report?.sales ||
        report?.records ||
        report?.data?.recentSales
    );
  }, [report]);

  const maxMonthlySales = useMemo(() => {
    if (!salesByMonth.length) return 1;

    return Math.max(
      ...salesByMonth.map((item) =>
        Number(
          getValue(item, [
            "amount",
            "sales",
            "totalSales",
            "revenue",
            "totalAmount",
          ])
        )
      ),
      1
    );
  }, [salesByMonth]);

  const maxStatusSales = useMemo(() => {
    if (!salesByStatus.length) return 1;

    return Math.max(
      ...salesByStatus.map((item) =>
        Number(
          getValue(item, [
            "amount",
            "sales",
            "totalSales",
            "revenue",
            "totalAmount",
          ])
        )
      ),
      1
    );
  }, [salesByStatus]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-sales-report-loading">
          <Loader />
          <p>Loading sales report...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <main className="admin-sales-report-page">
        <div className="admin-sales-report-header">
          <div>
            <div className="admin-sales-report-breadcrumb">
              <Link href="/admin/reports">Reports</Link>
              <span>/</span>
              <span>Sales Report</span>
            </div>

            <h1>Sales Report</h1>
            <p>
              Analyze quotation, invoice, revenue, and sales performance.
            </p>
          </div>

          <div className="admin-sales-report-header-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={handleExport}
              disabled={exporting}
            >
              {exporting ? "Exporting..." : "Export Report"}
            </Button>
          </div>
        </div>

        {error && (
          <div className="admin-sales-report-error" role="alert">
            {error}
          </div>
        )}

        <section className="admin-sales-report-filters">
          <div className="admin-sales-report-filter">
            <DatePicker
              label="Start Date"
              value={filters.startDate}
              onChange={(value) =>
                handleFilterChange("startDate", value)
              }
            />
          </div>

          <div className="admin-sales-report-filter">
            <DatePicker
              label="End Date"
              value={filters.endDate}
              onChange={(value) =>
                handleFilterChange("endDate", value)
              }
            />
          </div>

          <div className="admin-sales-report-filter">
            <Select
              label="Status"
              value={filters.status}
              onChange={(event) =>
                handleFilterChange("status", event.target.value)
              }
              options={[
                { value: "", label: "All Statuses" },
                { value: "DRAFT", label: "Draft" },
                { value: "SENT", label: "Sent" },
                { value: "APPROVED", label: "Approved" },
                { value: "REJECTED", label: "Rejected" },
                { value: "ISSUED", label: "Issued" },
                { value: "CANCELLED", label: "Cancelled" },
              ]}
            />
          </div>

          <div className="admin-sales-report-filter">
            <Select
              label="Document Type"
              value={filters.type}
              onChange={(event) =>
                handleFilterChange("type", event.target.value)
              }
              options={[
                { value: "", label: "All Documents" },
                { value: "QUOTATION", label: "Quotations" },
                { value: "INVOICE", label: "Invoices" },
              ]}
            />
          </div>

          <div className="admin-sales-report-filter-actions">
            <Button type="button" onClick={loadReport}>
              Apply Filters
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={handleReset}
            >
              Reset
            </Button>
          </div>
        </section>

        <section className="admin-sales-report-stats">
          <div className="admin-sales-report-stat">
            <div className="admin-sales-report-stat-icon revenue">
              ₹
            </div>

            <div>
              <span>Total Sales</span>
              <strong>{formatCurrency(summary.totalSales)}</strong>
            </div>
          </div>

          <div className="admin-sales-report-stat">
            <div className="admin-sales-report-stat-icon quotation">
              Q
            </div>

            <div>
              <span>Total Quotations</span>
              <strong>{formatNumber(summary.totalQuotations)}</strong>
            </div>
          </div>

          <div className="admin-sales-report-stat">
            <div className="admin-sales-report-stat-icon invoice">
              I
            </div>

            <div>
              <span>Total Invoices</span>
              <strong>{formatNumber(summary.totalInvoices)}</strong>
            </div>
          </div>

          <div className="admin-sales-report-stat">
            <div className="admin-sales-report-stat-icon average">
              A
            </div>

            <div>
              <span>Average Sale</span>
              <strong>{formatCurrency(summary.averageSale)}</strong>
            </div>
          </div>

          <div className="admin-sales-report-stat">
            <div className="admin-sales-report-stat-icon conversion">
              %
            </div>

            <div>
              <span>Conversion Rate</span>
              <strong>
                {Number.isFinite(summary.conversionRate)
                  ? `${summary.conversionRate.toFixed(1)}%`
                  : "0%"}
              </strong>
            </div>
          </div>
        </section>

        <section className="admin-sales-report-grid">
          <div className="admin-sales-report-card">
            <div className="admin-sales-report-card-header">
              <div>
                <h2>Monthly Sales</h2>
                <p>Sales performance over the selected period.</p>
              </div>
            </div>

            <div className="admin-sales-report-card-body">
              {salesByMonth.length > 0 ? (
                <div className="admin-sales-report-monthly">
                  {salesByMonth.map((item, index) => {
                    const label =
                      item?.month ||
                      item?.label ||
                      item?.name ||
                      `Month ${index + 1}`;

                    const amount = Number(
                      getValue(item, [
                        "amount",
                        "sales",
                        "totalSales",
                        "revenue",
                        "totalAmount",
                      ])
                    );

                    const percentage =
                      (amount / maxMonthlySales) * 100;

                    return (
                      <div
                        className="admin-sales-report-month"
                        key={`${label}-${index}`}
                      >
                        <div className="admin-sales-report-month-top">
                          <span>{label}</span>
                          <strong>{formatCurrency(amount)}</strong>
                        </div>

                        <div className="admin-sales-report-month-bar">
                          <div
                            style={{
                              width: `${Math.max(
                                Math.min(percentage, 100),
                                2
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="admin-sales-report-empty">
                  <div className="admin-sales-report-empty-icon">
                    —
                  </div>
                  <h3>No monthly sales data</h3>
                  <p>
                    No monthly sales records are available for the
                    selected filters.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="admin-sales-report-card">
            <div className="admin-sales-report-card-header">
              <div>
                <h2>Sales by Status</h2>
                <p>Sales distribution across document statuses.</p>
              </div>
            </div>

            <div className="admin-sales-report-card-body">
              {salesByStatus.length > 0 ? (
                <div className="admin-sales-report-status-list">
                  {salesByStatus.map((item, index) => {
                    const status =
                      item?.status ||
                      item?.label ||
                      item?.name ||
                      "Unknown";

                    const amount = Number(
                      getValue(item, [
                        "amount",
                        "sales",
                        "totalSales",
                        "revenue",
                        "totalAmount",
                      ])
                    );

                    const count = Number(
                      getValue(item, [
                        "count",
                        "total",
                        "quantity",
                        "records",
                      ])
                    );

                    const percentage =
                      (amount / maxStatusSales) * 100;

                    return (
                      <div
                        className="admin-sales-report-status-item"
                        key={`${status}-${index}`}
                      >
                        <div className="admin-sales-report-status-top">
                          <span>{status}</span>
                          <strong>{formatCurrency(amount)}</strong>
                        </div>

                        <div className="admin-sales-report-status-bar">
                          <div
                            style={{
                              width: `${Math.max(
                                Math.min(percentage, 100),
                                2
                              )}%`,
                            }}
                          />
                        </div>

                        <div className="admin-sales-report-status-meta">
                          <span>
                            {formatNumber(count)} records
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="admin-sales-report-empty">
                  <div className="admin-sales-report-empty-icon">
                    —
                  </div>
                  <h3>No status data</h3>
                  <p>
                    No sales status records are available for the
                    selected filters.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="admin-sales-report-card admin-sales-report-recent-card">
          <div className="admin-sales-report-card-header">
            <div>
              <h2>Recent Sales</h2>
              <p>Latest quotations and invoices included in the report.</p>
            </div>
          </div>

          {recentSales.length > 0 ? (
            <div className="admin-sales-report-table-wrapper">
              <table className="admin-sales-report-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Quotation</th>
                    <th>Invoice</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>
                  {recentSales.map((item, index) => {
                    const amount = Number(
                      getValue(item, [
                        "amount",
                        "total",
                        "totalAmount",
                        "grandTotal",
                        "netAmount",
                      ])
                    );

                    const status = getStatus(item);

                    return (
                      <tr
                        key={
                          item?._id ||
                          item?.id ||
                          `${getCustomerName(item)}-${index}`
                        }
                      >
                        <td>
                          <strong>{getCustomerName(item)}</strong>

                          {item?.customer?.phone && (
                            <span className="admin-sales-report-subtext">
                              {item.customer.phone}
                            </span>
                          )}
                        </td>

                        <td>{getQuotationNumber(item)}</td>

                        <td>{getInvoiceNumber(item)}</td>

                        <td>
                          <strong>{formatCurrency(amount)}</strong>
                        </td>

                        <td>
                          <Badge variant={getStatusVariant(status)}>
                            {status}
                          </Badge>
                        </td>

                        <td>
                          {formatDate(
                            item?.date ||
                              item?.createdAt ||
                              item?.invoiceDate ||
                              item?.quotationDate
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="admin-sales-report-empty large">
              <div className="admin-sales-report-empty-icon">
                —
              </div>
              <h3>No recent sales</h3>
              <p>
                No sales records are available for the selected filters.
              </p>
            </div>
          )}
        </section>
      </main>
    </AdminLayout>
  );
};

export default SalesReportPage;