"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AdminLayout from "../../layout";
import Button from "@/components/common/Button";
import Loader from "@/components/common/Loader";
import Select from "@/components/common/Select";
import DatePicker from "@/components/common/DatePicker";
import reportService from "@/services/report.service";
import "./lead-report.css";

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "NEW", label: "New" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "QUALIFIED", label: "Qualified" },
  { value: "PROPOSAL_SENT", label: "Proposal Sent" },
  { value: "NEGOTIATION", label: "Negotiation" },
  { value: "CONVERTED", label: "Converted" },
  { value: "LOST", label: "Lost" },
];

const SOURCE_OPTIONS = [
  { value: "", label: "All Sources" },
  { value: "WEBSITE", label: "Website" },
  { value: "REFERRAL", label: "Referral" },
  { value: "SOCIAL_MEDIA", label: "Social Media" },
  { value: "ADVERTISEMENT", label: "Advertisement" },
  { value: "WALK_IN", label: "Walk In" },
  { value: "CALL", label: "Call" },
  { value: "OTHER", label: "Other" },
];

const extractData = (response) => {
  if (response?.data?.data) return response.data.data;
  if (response?.data) return response.data;
  return response;
};

const getArray = (value, keys = []) => {
  if (Array.isArray(value)) return value;

  for (const key of keys) {
    if (Array.isArray(value?.[key])) {
      return value[key];
    }
  }

  return [];
};

const formatNumber = (value) =>
  new Intl.NumberFormat("en-IN").format(Number(value) || 0);

const formatPercentage = (value) =>
  `${Number(value || 0).toFixed(1)}%`;

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const normalizeLabel = (value) => {
  if (!value) return "Unknown";

  return String(value)
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const AdminLeadReportPage = () => {
  const [report, setReport] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [status, setStatus] = useState("");
  const [source, setSource] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const loadReport = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};

      if (status) params.status = status;
      if (source) params.source = source;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await reportService.getLeadReport(params);

      setReport(extractData(response));
    } catch (err) {
      console.error("Failed to load lead report:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load lead report."
      );

      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  const summary = useMemo(() => {
    const sourceData = report || {};

    const total =
      sourceData.total ??
      sourceData.totalLeads ??
      sourceData.summary?.total ??
      sourceData.summary?.totalLeads ??
      0;

    const newLeads =
      sourceData.newLeads ??
      sourceData.summary?.new ??
      sourceData.byStatus?.find(
        (item) => String(item.status).toUpperCase() === "NEW"
      )?.count ??
      0;

    const converted =
      sourceData.converted ??
      sourceData.convertedLeads ??
      sourceData.summary?.converted ??
      sourceData.byStatus?.find(
        (item) => String(item.status).toUpperCase() === "CONVERTED"
      )?.count ??
      0;

    const lost =
      sourceData.lost ??
      sourceData.lostLeads ??
      sourceData.summary?.lost ??
      sourceData.byStatus?.find(
        (item) => String(item.status).toUpperCase() === "LOST"
      )?.count ??
      0;

    const conversionRate =
      sourceData.conversionRate ??
      sourceData.summary?.conversionRate ??
      (Number(total) > 0 ? (Number(converted) / Number(total)) * 100 : 0);

    return {
      total,
      newLeads,
      converted,
      lost,
      conversionRate,
    };
  }, [report]);

  const statusData = useMemo(() => {
    const data =
      report?.byStatus ||
      report?.statusBreakdown ||
      report?.statusDistribution ||
      report?.summary?.byStatus ||
      [];

    return getArray(data);
  }, [report]);

  const sourceData = useMemo(() => {
    const data =
      report?.bySource ||
      report?.sourceBreakdown ||
      report?.sourceDistribution ||
      report?.summary?.bySource ||
      [];

    return getArray(data);
  }, [report]);

  const recentLeads = useMemo(() => {
    const data =
      report?.recentLeads ||
      report?.leads ||
      report?.data ||
      [];

    return getArray(data).slice(0, 8);
  }, [report]);

  const handleApplyFilters = (event) => {
    event.preventDefault();

    if (
      startDate &&
      endDate &&
      new Date(endDate) < new Date(startDate)
    ) {
      setError("End date cannot be before start date.");
      return;
    }

    loadReport();
  };

  const handleClearFilters = () => {
    setStatus("");
    setSource("");
    setStartDate("");
    setEndDate("");
    setError("");

    setTimeout(() => {
      loadReport();
    }, 0);
  };

  const handleExport = () => {
    if (typeof reportService.exportLeadReport === "function") {
      const params = {};

      if (status) params.status = status;
      if (source) params.source = source;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      reportService.exportLeadReport(params).catch((err) => {
        console.error("Failed to export lead report:", err);
        setError("Unable to export lead report.");
      });

      return;
    }

    window.print();
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-lead-report-loading">
          <Loader />
          <p>Loading lead report...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-lead-report-page">
        <div className="admin-lead-report-header">
          <div>
            <div className="admin-lead-report-breadcrumb">
              <Link href="/admin">Admin</Link>
              <span>/</span>
              <Link href="/admin/reports">Reports</Link>
              <span>/</span>
              <span>Leads</span>
            </div>

            <h1>Lead Report</h1>

            <p>
              Analyze lead acquisition, status distribution, sources, and
              conversion performance.
            </p>
          </div>

          <div className="admin-lead-report-header-actions">
            <Button
              variant="secondary"
              onClick={handleExport}
            >
              Export Report
            </Button>

            <Button
              variant="secondary"
              onClick={loadReport}
            >
              Refresh
            </Button>
          </div>
        </div>

        {error && (
          <div className="admin-lead-report-error">
            {error}
          </div>
        )}

        <form
          className="admin-lead-report-filters"
          onSubmit={handleApplyFilters}
        >
          <div className="admin-lead-report-filter">
            <Select
              label="Status"
              value={status}
              onChange={(event) =>
                setStatus(event?.target?.value ?? event)
              }
              options={STATUS_OPTIONS}
              placeholder="All Statuses"
            />
          </div>

          <div className="admin-lead-report-filter">
            <Select
              label="Source"
              value={source}
              onChange={(event) =>
                setSource(event?.target?.value ?? event)
              }
              options={SOURCE_OPTIONS}
              placeholder="All Sources"
            />
          </div>

          <div className="admin-lead-report-filter">
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={setStartDate}
            />
          </div>

          <div className="admin-lead-report-filter">
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={setEndDate}
            />
          </div>

          <div className="admin-lead-report-filter-actions">
            <Button type="submit">
              Apply Filters
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={handleClearFilters}
            >
              Clear
            </Button>
          </div>
        </form>

        <section className="admin-lead-report-stats">
          <div className="admin-lead-report-stat">
            <div className="admin-lead-report-stat-icon">
              T
            </div>
            <div>
              <span>Total Leads</span>
              <strong>{formatNumber(summary.total)}</strong>
            </div>
          </div>

          <div className="admin-lead-report-stat">
            <div className="admin-lead-report-stat-icon new">
              N
            </div>
            <div>
              <span>New Leads</span>
              <strong>{formatNumber(summary.newLeads)}</strong>
            </div>
          </div>

          <div className="admin-lead-report-stat">
            <div className="admin-lead-report-stat-icon converted">
              C
            </div>
            <div>
              <span>Converted</span>
              <strong>{formatNumber(summary.converted)}</strong>
            </div>
          </div>

          <div className="admin-lead-report-stat">
            <div className="admin-lead-report-stat-icon lost">
              L
            </div>
            <div>
              <span>Lost</span>
              <strong>{formatNumber(summary.lost)}</strong>
            </div>
          </div>

          <div className="admin-lead-report-stat">
            <div className="admin-lead-report-stat-icon rate">
              %
            </div>
            <div>
              <span>Conversion Rate</span>
              <strong>
                {formatPercentage(summary.conversionRate)}
              </strong>
            </div>
          </div>
        </section>

        <div className="admin-lead-report-grid">
          <section className="admin-lead-report-card">
            <div className="admin-lead-report-card-header">
              <div>
                <h2>Lead Status Distribution</h2>
                <p>Current lead distribution by status.</p>
              </div>
            </div>

            <div className="admin-lead-report-card-body">
              {statusData.length === 0 ? (
                <div className="admin-lead-report-empty">
                  <div className="admin-lead-report-empty-icon">
                    S
                  </div>
                  <h3>No status data available</h3>
                  <p>
                    Status distribution will appear when report data is
                    available.
                  </p>
                </div>
              ) : (
                <div className="admin-lead-report-breakdown">
                  {statusData.map((item, index) => {
                    const count =
                      item?.count ??
                      item?.total ??
                      item?.value ??
                      0;

                    const percentage =
                      item?.percentage ??
                      (Number(summary.total) > 0
                        ? (Number(count) / Number(summary.total)) * 100
                        : 0);

                    return (
                      <div
                        className="admin-lead-report-breakdown-item"
                        key={`${item?.status || item?.label}-${index}`}
                      >
                        <div className="admin-lead-report-breakdown-top">
                          <span>
                            {normalizeLabel(
                              item?.status || item?.label
                            )}
                          </span>

                          <strong>
                            {formatNumber(count)}
                          </strong>
                        </div>

                        <div className="admin-lead-report-progress">
                          <div
                            style={{
                              width: `${Math.min(
                                100,
                                Math.max(0, Number(percentage))
                              )}%`,
                            }}
                          />
                        </div>

                        <small>
                          {formatPercentage(percentage)}
                        </small>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          <section className="admin-lead-report-card">
            <div className="admin-lead-report-card-header">
              <div>
                <h2>Lead Sources</h2>
                <p>Lead distribution by acquisition source.</p>
              </div>
            </div>

            <div className="admin-lead-report-card-body">
              {sourceData.length === 0 ? (
                <div className="admin-lead-report-empty">
                  <div className="admin-lead-report-empty-icon">
                    S
                  </div>
                  <h3>No source data available</h3>
                  <p>
                    Source performance will appear when report data is
                    available.
                  </p>
                </div>
              ) : (
                <div className="admin-lead-report-source-list">
                  {sourceData.map((item, index) => {
                    const count =
                      item?.count ??
                      item?.total ??
                      item?.value ??
                      0;

                    const percentage =
                      item?.percentage ??
                      (Number(summary.total) > 0
                        ? (Number(count) / Number(summary.total)) * 100
                        : 0);

                    return (
                      <div
                        className="admin-lead-report-source-item"
                        key={`${item?.source || item?.label}-${index}`}
                      >
                        <div className="admin-lead-report-source-icon">
                          {normalizeLabel(
                            item?.source || item?.label
                          ).charAt(0)}
                        </div>

                        <div className="admin-lead-report-source-content">
                          <div>
                            <strong>
                              {normalizeLabel(
                                item?.source || item?.label
                              )}
                            </strong>

                            <span>
                              {formatNumber(count)} leads
                            </span>
                          </div>

                          <div className="admin-lead-report-source-progress">
                            <div
                              style={{
                                width: `${Math.min(
                                  100,
                                  Math.max(0, Number(percentage))
                                )}%`,
                              }}
                            />
                          </div>
                        </div>

                        <strong className="admin-lead-report-source-percent">
                          {formatPercentage(percentage)}
                        </strong>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </div>

        <section className="admin-lead-report-card admin-lead-report-recent-card">
          <div className="admin-lead-report-card-header">
            <div>
              <h2>Recent Leads</h2>
              <p>Latest lead records included in the report.</p>
            </div>

            <Link href="/admin/leads">
              View All Leads →
            </Link>
          </div>

          <div className="admin-lead-report-table-wrapper">
            {recentLeads.length === 0 ? (
              <div className="admin-lead-report-empty large">
                <div className="admin-lead-report-empty-icon">
                  L
                </div>

                <h3>No lead records available</h3>

                <p>
                  Lead records will appear here when matching report data is
                  available.
                </p>
              </div>
            ) : (
              <table className="admin-lead-report-table">
                <thead>
                  <tr>
                    <th>Lead</th>
                    <th>Company</th>
                    <th>Source</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Created</th>
                  </tr>
                </thead>

                <tbody>
                  {recentLeads.map((lead, index) => {
                    const leadId = lead?._id || lead?.id;

                    const leadName =
                      lead?.name ||
                      `${lead?.firstName || ""} ${
                        lead?.lastName || ""
                      }`.trim() ||
                      "Unknown Lead";

                    return (
                      <tr key={leadId || index}>
                        <td>
                          {leadId ? (
                            <Link
                              href={`/admin/leads/${leadId}`}
                              className="admin-lead-report-lead-name"
                            >
                              {leadName}
                            </Link>
                          ) : (
                            <strong>{leadName}</strong>
                          )}

                          {lead?.phone && (
                            <span className="admin-lead-report-subtext">
                              {lead.phone}
                            </span>
                          )}
                        </td>

                        <td>
                          {lead?.companyName ||
                            lead?.company ||
                            "—"}
                        </td>

                        <td>
                          {normalizeLabel(lead?.source)}
                        </td>

                        <td>
                          <span className="admin-lead-report-status">
                            {normalizeLabel(lead?.status)}
                          </span>
                        </td>

                        <td>
                          {normalizeLabel(lead?.priority)}
                        </td>

                        <td>
                          {formatDate(
                            lead?.createdAt ||
                              lead?.createdDate ||
                              lead?.date
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>
    </AdminLayout>
  );
};

export default AdminLeadReportPage;