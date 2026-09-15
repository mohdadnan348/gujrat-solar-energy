"use client";

import React, { useEffect, useMemo, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import Button from "@/components/common/Button";
import Loader from "@/components/common/Loader";
import Badge from "@/components/common/Badge";
import { useAuth } from "@/hooks/useAuth";
import reportService from "@/services/report.service";

const ManagerReportsPage = () => {
  const { user, logout, loading: authLoading } = useAuth();

  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [period, setPeriod] = useState("month");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleLogout = async () => {
    await logout();
  };

  const loadReports = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        period,
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      };

      const response = await reportService.getReports(params);

      const data =
        response?.data?.data ||
        response?.data?.report ||
        response?.data ||
        response?.report ||
        response ||
        {};

      setReportData(data);
    } catch (err) {
      console.error("Failed to load reports:", err);

      setError(
        err?.message ||
          err?.response?.data?.message ||
          "Unable to load reports."
      );

      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [period]);

  const handleApplyDateFilter = () => {
    loadReports();
  };

  const clearDateFilter = () => {
    setStartDate("");
    setEndDate("");
    setPeriod("month");
  };

  const getNestedValue = (object, paths, fallback = 0) => {
    for (const path of paths) {
      const value = path
        .split(".")
        .reduce((current, key) => current?.[key], object);

      if (value !== undefined && value !== null) {
        return value;
      }
    }

    return fallback;
  };

  const formatNumber = (value) => {
    const number = Number(value);

    if (Number.isNaN(number)) return "0";

    return new Intl.NumberFormat("en-IN").format(number);
  };

  const formatCurrency = (value) => {
    const number = Number(value);

    if (Number.isNaN(number)) return "₹0";

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(number);
  };

  const formatPercentage = (value) => {
    const number = Number(value);

    if (Number.isNaN(number)) return "0%";

    return `${number.toFixed(1)}%`;
  };

  const summary = useMemo(() => {
    const data = reportData || {};

    return {
      totalLeads: getNestedValue(data, [
        "totalLeads",
        "leads.total",
        "summary.totalLeads",
        "leadStats.total",
      ]),
      convertedLeads: getNestedValue(data, [
        "convertedLeads",
        "leads.converted",
        "summary.convertedLeads",
        "leadStats.converted",
      ]),
      totalQuotations: getNestedValue(data, [
        "totalQuotations",
        "quotations.total",
        "summary.totalQuotations",
        "quotationStats.total",
      ]),
      totalCustomers: getNestedValue(data, [
        "totalCustomers",
        "customers.total",
        "summary.totalCustomers",
        "customerStats.total",
      ]),
      totalInvoices: getNestedValue(data, [
        "totalInvoices",
        "invoices.total",
        "summary.totalInvoices",
        "invoiceStats.total",
      ]),
      invoiceValue: getNestedValue(data, [
        "invoiceValue",
        "totalInvoiceValue",
        "invoices.totalValue",
        "summary.invoiceValue",
      ]),
      totalTasks: getNestedValue(data, [
        "totalTasks",
        "tasks.total",
        "summary.totalTasks",
        "taskStats.total",
      ]),
      completedTasks: getNestedValue(data, [
        "completedTasks",
        "tasks.completed",
        "summary.completedTasks",
        "taskStats.completed",
      ]),
    };
  }, [reportData]);

  const leadConversionRate = useMemo(() => {
    if (!summary.totalLeads) return 0;

    return (Number(summary.convertedLeads) / Number(summary.totalLeads)) * 100;
  }, [summary.totalLeads, summary.convertedLeads]);

  const taskCompletionRate = useMemo(() => {
    if (!summary.totalTasks) return 0;

    return (Number(summary.completedTasks) / Number(summary.totalTasks)) * 100;
  }, [summary.totalTasks, summary.completedTasks]);

  const leadBreakdown =
    getNestedValue(reportData || {}, [
      "leadBreakdown",
      "leads.breakdown",
      "leadStats.breakdown",
    ], []);

  const quotationBreakdown =
    getNestedValue(reportData || {}, [
      "quotationBreakdown",
      "quotations.breakdown",
      "quotationStats.breakdown",
    ], []);

  const taskBreakdown =
    getNestedValue(reportData || {}, [
      "taskBreakdown",
      "tasks.breakdown",
      "taskStats.breakdown",
    ], []);

  const employees =
    getNestedValue(reportData || {}, [
      "employeePerformance",
      "employees",
      "employeeStats",
      "performance",
    ], []);

  const normalizeArray = (value) => {
    if (Array.isArray(value)) return value;

    if (value && typeof value === "object") {
      return Object.entries(value).map(([key, data]) => ({
        label: key,
        ...(typeof data === "object" ? data : { value: data }),
      }));
    }

    return [];
  };

  const normalizedLeadBreakdown = normalizeArray(leadBreakdown);
  const normalizedQuotationBreakdown = normalizeArray(quotationBreakdown);
  const normalizedTaskBreakdown = normalizeArray(taskBreakdown);
  const normalizedEmployees = normalizeArray(employees);

  const getLabel = (item) => {
    return (
      item?.label ||
      item?.name ||
      item?.status ||
      item?.stage ||
      item?.title ||
      "Unknown"
    );
  };

  const getValue = (item) => {
    return Number(
      item?.value ??
        item?.count ??
        item?.total ??
        item?.quantity ??
        0
    );
  };

  const getEmployeePerformance = (employee) => {
    return {
      name:
        employee?.name ||
        employee?.employeeName ||
        employee?.fullName ||
        "Employee",
      leads: Number(
        employee?.leads ??
          employee?.leadCount ??
          employee?.totalLeads ??
          0
      ),
      quotations: Number(
        employee?.quotations ??
          employee?.quotationCount ??
          employee?.totalQuotations ??
          0
      ),
      customers: Number(
        employee?.customers ??
          employee?.customerCount ??
          employee?.convertedCustomers ??
          0
      ),
      tasks: Number(
        employee?.tasks ??
          employee?.taskCount ??
          employee?.completedTasks ??
          0
      ),
    };
  };

  if (authLoading) {
    return (
      <div className="manager-reports-loading">
        <Loader />
      </div>
    );
  }

  return (
    <MainLayout
      user={user}
      onLogout={handleLogout}
      onSearch={(value) => console.log("Manager global search:", value)}
      notificationCount={0}
    >
      <div className="manager-reports-page">
        <div className="manager-reports-header">
          <div>
            <span className="manager-reports-eyebrow">
              Business Intelligence
            </span>

            <h1>Reports</h1>

            <p>
              Track leads, quotations, customers, invoices and operational
              performance.
            </p>
          </div>

          <Button
            variant="secondary"
            onClick={loadReports}
            disabled={loading}
          >
            ↻ Refresh
          </Button>
        </div>

        <div className="manager-reports-filters">
          <div className="manager-report-period">
            <label>Report Period</label>

            <select
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>

          <div className="manager-report-date-field">
            <label>From</label>

            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </div>

          <div className="manager-report-date-field">
            <label>To</label>

            <input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </div>

          <div className="manager-report-filter-actions">
            <Button
              size="small"
              onClick={handleApplyDateFilter}
              disabled={loading}
            >
              Apply
            </Button>

            {(startDate || endDate) && (
              <Button
                size="small"
                variant="secondary"
                onClick={clearDateFilter}
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        {error && (
          <div className="manager-reports-error">
            <span>{error}</span>

            <Button
              size="small"
              variant="secondary"
              onClick={loadReports}
            >
              Retry
            </Button>
          </div>
        )}

        {loading ? (
          <div className="manager-reports-content-loading">
            <Loader />
          </div>
        ) : (
          <>
            <div className="manager-reports-summary">
              <div className="manager-report-card">
                <span>Total Leads</span>
                <strong>{formatNumber(summary.totalLeads)}</strong>
                <small>
                  {formatNumber(summary.convertedLeads)} converted
                </small>
              </div>

              <div className="manager-report-card">
                <span>Quotations</span>
                <strong>{formatNumber(summary.totalQuotations)}</strong>
                <small>Generated in selected period</small>
              </div>

              <div className="manager-report-card">
                <span>Customers</span>
                <strong>{formatNumber(summary.totalCustomers)}</strong>
                <small>Registered customers</small>
              </div>

              <div className="manager-report-card">
                <span>Invoices</span>
                <strong>{formatNumber(summary.totalInvoices)}</strong>
                <small>{formatCurrency(summary.invoiceValue)} value</small>
              </div>
            </div>

            <div className="manager-reports-performance">
              <div className="manager-performance-card">
                <div className="manager-performance-card-header">
                  <div>
                    <span>Lead Conversion</span>
                    <h3>{formatPercentage(leadConversionRate)}</h3>
                  </div>

                  <div className="manager-performance-icon">
                    ↗
                  </div>
                </div>

                <div className="manager-progress">
                  <span
                    style={{
                      width: `${Math.min(
                        Math.max(leadConversionRate, 0),
                        100
                      )}%`,
                    }}
                  />
                </div>

                <p>
                  {formatNumber(summary.convertedLeads)} of{" "}
                  {formatNumber(summary.totalLeads)} leads converted
                </p>
              </div>

              <div className="manager-performance-card">
                <div className="manager-performance-card-header">
                  <div>
                    <span>Task Completion</span>
                    <h3>{formatPercentage(taskCompletionRate)}</h3>
                  </div>

                  <div className="manager-performance-icon">
                    ✓
                  </div>
                </div>

                <div className="manager-progress">
                  <span
                    style={{
                      width: `${Math.min(
                        Math.max(taskCompletionRate, 0),
                        100
                      )}%`,
                    }}
                  />
                </div>

                <p>
                  {formatNumber(summary.completedTasks)} of{" "}
                  {formatNumber(summary.totalTasks)} tasks completed
                </p>
              </div>
            </div>

            <div className="manager-reports-grid">
              <section className="manager-report-section">
                <div className="manager-report-section-header">
                  <div>
                    <span>Lead Analytics</span>
                    <h2>Lead Breakdown</h2>
                  </div>

                  <Badge variant="success">
                    {formatNumber(summary.totalLeads)} Total
                  </Badge>
                </div>

                {normalizedLeadBreakdown.length === 0 ? (
                  <div className="manager-report-empty">
                    <span>📊</span>
                    <strong>No lead breakdown available</strong>
                    <p>No detailed lead data was returned for this period.</p>
                  </div>
                ) : (
                  <div className="manager-report-list">
                    {normalizedLeadBreakdown.map((item, index) => {
                      const value = getValue(item);

                      const percentage = summary.totalLeads
                        ? (value / Number(summary.totalLeads)) * 100
                        : 0;

                      return (
                        <div
                          className="manager-report-list-item"
                          key={`${getLabel(item)}-${index}`}
                        >
                          <div>
                            <span>{getLabel(item)}</span>
                            <strong>{formatNumber(value)}</strong>
                          </div>

                          <div className="manager-mini-progress">
                            <span
                              style={{
                                width: `${Math.min(
                                  Math.max(percentage, 0),
                                  100
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              <section className="manager-report-section">
                <div className="manager-report-section-header">
                  <div>
                    <span>Sales Pipeline</span>
                    <h2>Quotation Breakdown</h2>
                  </div>

                  <Badge variant="info">
                    {formatNumber(summary.totalQuotations)} Total
                  </Badge>
                </div>

                {normalizedQuotationBreakdown.length === 0 ? (
                  <div className="manager-report-empty">
                    <span>📄</span>
                    <strong>No quotation breakdown available</strong>
                    <p>
                      No detailed quotation data was returned for this period.
                    </p>
                  </div>
                ) : (
                  <div className="manager-report-list">
                    {normalizedQuotationBreakdown.map((item, index) => {
                      const value = getValue(item);

                      const percentage = summary.totalQuotations
                        ? (value / Number(summary.totalQuotations)) * 100
                        : 0;

                      return (
                        <div
                          className="manager-report-list-item"
                          key={`${getLabel(item)}-${index}`}
                        >
                          <div>
                            <span>{getLabel(item)}</span>
                            <strong>{formatNumber(value)}</strong>
                          </div>

                          <div className="manager-mini-progress">
                            <span
                              style={{
                                width: `${Math.min(
                                  Math.max(percentage, 0),
                                  100
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>

            <section className="manager-report-section manager-task-report-section">
              <div className="manager-report-section-header">
                <div>
                  <span>Operations</span>
                  <h2>Task Breakdown</h2>
                </div>

                <Badge variant="warning">
                  {formatNumber(summary.totalTasks)} Total
                </Badge>
              </div>

              {normalizedTaskBreakdown.length === 0 ? (
                <div className="manager-report-empty">
                  <span>✓</span>
                  <strong>No task breakdown available</strong>
                  <p>No detailed task data was returned for this period.</p>
                </div>
              ) : (
                <div className="manager-task-breakdown">
                  {normalizedTaskBreakdown.map((item, index) => (
                    <div
                      className="manager-task-breakdown-item"
                      key={`${getLabel(item)}-${index}`}
                    >
                      <span>{getLabel(item)}</span>
                      <strong>{formatNumber(getValue(item))}</strong>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="manager-report-section manager-employee-performance">
              <div className="manager-report-section-header">
                <div>
                  <span>Team Analytics</span>
                  <h2>Employee Performance</h2>
                </div>
              </div>

              {normalizedEmployees.length === 0 ? (
                <div className="manager-report-empty">
                  <span>👥</span>
                  <strong>No employee performance data</strong>
                  <p>
                    Employee performance details are not available for this
                    period.
                  </p>
                </div>
              ) : (
                <div className="manager-employee-performance-wrapper">
                  <table className="manager-employee-performance-table">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Leads</th>
                        <th>Quotations</th>
                        <th>Customers</th>
                        <th>Tasks</th>
                      </tr>
                    </thead>

                    <tbody>
                      {normalizedEmployees.map((employee, index) => {
                        const performance =
                          getEmployeePerformance(employee);

                        return (
                          <tr key={`${performance.name}-${index}`}>
                            <td>
                              <div className="manager-report-employee-name">
                                <span>
                                  {performance.name
                                    .slice(0, 2)
                                    .toUpperCase()}
                                </span>

                                <strong>{performance.name}</strong>
                              </div>
                            </td>

                            <td>{formatNumber(performance.leads)}</td>
                            <td>{formatNumber(performance.quotations)}</td>
                            <td>{formatNumber(performance.customers)}</td>
                            <td>{formatNumber(performance.tasks)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default ManagerReportsPage;