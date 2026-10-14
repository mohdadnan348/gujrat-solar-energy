"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Button from "@/components/common/Button";
import SearchBox from "@/components/common/SearchBox";
import Select from "@/components/common/Select";
import Badge from "@/components/common/Badge";
import Pagination from "@/components/common/Pagination";
import Loader from "@/components/common/Loader";

import { useAuth } from "@/hooks/useAuth";
import leadService from "@/services/lead.service";

import "./leads.css";

const ITEMS_PER_PAGE = 10;

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "NEW", label: "New" },
  { value: "ASSIGNED", label: "Assigned" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "QUALIFIED", label: "Qualified" },
  { value: "SITE_VISIT", label: "Site Visit" },
  { value: "QUOTATION", label: "Quotation" },
  { value: "WON", label: "Won" },
  { value: "LOST", label: "Lost" },
];

function extractLeadArray(response) {
  // leadService returns Axios response.data, so APIs may return an array
  // directly or wrap it in data/leads/results/pagination objects.
  const candidates = [
    response,
    response?.data,
    response?.leads,
    response?.results,
    response?.data?.leads,
    response?.data?.results,
    response?.data?.data,
    response?.data?.items,
    response?.items,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
  }

  return [];
}

function normalizeStatus(value) {
  return String(value || "NEW")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");
}

function formatStatus(value) {
  return normalizeStatus(value)
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}

const EmployeeLeadsPage = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const loadLeads = useCallback(async ({ refresh = false } = {}) => {
    try {
      if (refresh) setRefreshing(true);
      else setLoading(true);

      setError("");

      // Employees must use the authenticated "my leads" endpoint.
      // Do not call GET /leads here: that endpoint is restricted to Admin,
      // Manager and HR in the supplied backend routes.
      const response = await leadService.getMyLeads({
        page: 1,
        limit: 100,
      });

      const items = extractLeadArray(response);
      setLeads(items);
    } catch (err) {
      console.error("Failed to load employee leads:", err);

      const statusCode = err?.response?.status;
      const serverMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error;

      if (statusCode === 401) {
        setError(serverMessage || "Your session has expired. Please sign in again.");
      } else if (statusCode === 403) {
        setError(
          serverMessage ||
            "Your account is not authorized to access My Leads. Please verify the logged-in role and backend role permissions."
        );
      } else {
        setError(
          serverMessage ||
            err?.message ||
            "Unable to load leads. Please check the connection and try again."
        );
      }
      setLeads([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setLoading(false);
      setError("Please sign in to view your assigned leads.");
      setLeads([]);
      return;
    }

    loadLeads();
  }, [authLoading, user, loadLeads]);

  useEffect(() => {
    setPage(1);
  }, [search, status]);

  const getLeadName = (lead) =>
    lead?.customerName ||
    lead?.name ||
    lead?.fullName ||
    lead?.contactPerson ||
    "Unnamed Lead";

  const getLeadNumber = (lead) =>
    lead?.leadId ||
    lead?.leadNumber ||
    lead?.leadNo ||
    lead?._id ||
    lead?.id ||
    "—";

  const getLeadPhone = (lead) =>
    lead?.mobile ||
    lead?.phone ||
    lead?.contactNumber ||
    lead?.mobileNumber ||
    "—";

  const getLeadStatus = (lead) =>
    normalizeStatus(lead?.status || lead?.leadStatus || "NEW");

  const getSource = (lead) =>
    lead?.leadSource || lead?.source || "Other";

  const getStatusVariant = (leadStatus) => {
    switch (normalizeStatus(leadStatus)) {
      case "NEW":
      case "ASSIGNED":
      case "QUOTATION":
        return "info";
      case "CONTACTED":
      case "SITE_VISIT":
        return "warning";
      case "QUALIFIED":
      case "WON":
        return "success";
      case "LOST":
        return "danger";
      default:
        return "secondary";
    }
  };

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

  const filteredLeads = useMemo(() => {
    const query = search.trim().toLowerCase();

    return leads.filter((lead) => {
      const searchableText = [
        getLeadNumber(lead),
        getLeadName(lead),
        lead?.companyName,
        getLeadPhone(lead),
        lead?.email,
        lead?.city,
        lead?.state,
        lead?.address,
        getSource(lead),
        lead?.requirement,
        lead?.kiloWatt,
        lead?.kw,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !query || searchableText.includes(query);
      const matchesStatus = !status || getLeadStatus(lead) === status;

      return matchesSearch && matchesStatus;
    });
  }, [leads, search, status]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredLeads.length / ITEMS_PER_PAGE)
  );
  const currentPage = Math.min(page, totalPages);

  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredLeads.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredLeads, currentPage]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const handleViewLead = (lead) => {
    const id = lead?._id || lead?.id;
    if (id) router.push(`/employee/leads/${id}`);
  };

  if (authLoading || loading) {
    return (
      <div className="employee-leads-loading">
        <Loader />
      </div>
    );
  }

  return (
    <div className="employee-leads-page">
      <div className="employee-leads-header">
        <div>
          <span className="employee-leads-eyebrow">Sales Management</span>
          <h1>My Leads</h1>
          <p>View and manage the leads assigned to you.</p>
        </div>

        <Button
          type="button"
          variant="secondary"
          onClick={() => loadLeads({ refresh: true })}
          disabled={refreshing}
        >
          {refreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      <div className="employee-leads-toolbar">
        <SearchBox
          value={search}
          onChange={setSearch}
          placeholder="Search leads..."
        />

        <Select
          value={status}
          onChange={(value) => {
            // The shared Select component may pass either the selected value
            // or a DOM change event depending on its implementation.
            setStatus(
              typeof value === "string"
                ? value
                : value?.target?.value ?? ""
            );
          }}
          options={STATUS_OPTIONS}
        />
      </div>

      {error && (
        <div className="employee-leads-error" role="alert">
          <span>{error}</span>
          <Button
            type="button"
            variant="secondary"
            onClick={() => loadLeads()}
            disabled={loading}
          >
            Retry
          </Button>
        </div>
      )}

      <div className="employee-leads-card">
        {!error && filteredLeads.length > 0 && (
          <div className="employee-leads-summary">
            {filteredLeads.length} lead{filteredLeads.length === 1 ? "" : "s"} found
          </div>
        )}

        {paginatedLeads.length === 0 ? (
          <div className="employee-leads-empty">
            <div className="employee-leads-empty-icon">☀</div>
            <h3>{error ? "Unable to load leads" : "No leads found"}</h3>
            <p>
              {error
                ? "Please retry. If the error is 403, verify the employee role and backend access rules."
                : search || status
                  ? "Try changing your search or status filter."
                  : "You don't have any assigned leads yet."}
            </p>
          </div>
        ) : (
          <>
            <div className="employee-leads-table-wrapper">
              <table className="employee-leads-table">
                <thead>
                  <tr>
                    <th>Lead</th>
                    <th>Contact</th>
                    <th>Location</th>
                    <th>Source</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedLeads.map((lead, index) => {
                    const id = lead?._id || lead?.id || `${getLeadNumber(lead)}-${index}`;
                    const leadStatus = getLeadStatus(lead);

                    return (
                      <tr key={id}>
                        <td>
                          <div className="employee-lead-name">
                            {getLeadName(lead)}
                          </div>
                          <div className="employee-lead-email">
                            {getLeadNumber(lead)}
                          </div>
                          {lead?.email && (
                            <div className="employee-lead-email">
                              {lead.email}
                            </div>
                          )}
                        </td>
                        <td>{getLeadPhone(lead)}</td>
                        <td>
                          {[lead?.city, lead?.state].filter(Boolean).join(", ") || "—"}
                        </td>
                        <td>{getSource(lead)}</td>
                        <td>
                          <Badge variant={getStatusVariant(leadStatus)}>
                            {formatStatus(leadStatus)}
                          </Badge>
                        </td>
                        <td>{formatDate(lead?.createdAt)}</td>
                        <td>
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => handleViewLead(lead)}
                            disabled={!lead?._id && !lead?.id}
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="employee-leads-footer">
              <span>
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(
                  currentPage * ITEMS_PER_PAGE,
                  filteredLeads.length
                )} of {filteredLeads.length} leads
              </span>
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EmployeeLeadsPage;
