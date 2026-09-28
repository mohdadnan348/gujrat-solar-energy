"use client";

import React, { useEffect, useMemo, useState } from "react";
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
  { value: "New", label: "New" },
  { value: "Assigned", label: "Assigned" },
  { value: "Contacted", label: "Contacted" },
  { value: "Qualified", label: "Qualified" },
  { value: "Site Visit", label: "Site Visit" },
  { value: "Quotation", label: "Quotation" },
  { value: "Won", label: "Won" },
  { value: "Lost", label: "Lost" },
];

const EmployeeLeadsPage = () => {
  const router = useRouter();

  const { user, loading: authLoading } = useAuth();

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const loadLeads = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await leadService.getMyLeads({
        page: 1,
        limit: 100,
      });

      const items =
        response?.data ||
        response?.leads ||
        [];

      setLeads(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error("Failed to load employee leads:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load leads. Please try again."
      );

      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      loadLeads();
    }
  }, [authLoading, user]);

  useEffect(() => {
    setPage(1);
  }, [search, status]);

  const getLeadName = (lead) =>
    lead?.customerName ||
    lead?.name ||
    lead?.contactPerson ||
    "Unnamed Lead";

  const getLeadNumber = (lead) =>
    lead?.leadId ||
    lead?.leadNumber ||
    lead?.leadNo ||
    lead?._id ||
    "—";

  const getLeadPhone = (lead) =>
    lead?.mobile ||
    lead?.phone ||
    lead?.contactNumber ||
    "—";

  const getStatus = (lead) =>
    lead?.status ||
    lead?.leadStatus ||
    "New";

  const getSource = (lead) =>
    lead?.leadSource ||
    lead?.source ||
    "Other";

  const getStatusVariant = (leadStatus) => {
    switch (String(leadStatus).toLowerCase()) {
      case "new":
        return "info";

      case "assigned":
        return "info";

      case "contacted":
        return "warning";

      case "qualified":
        return "success";

      case "site visit":
        return "warning";

      case "quotation":
        return "info";

      case "won":
        return "success";

      case "lost":
        return "danger";

      default:
        return "secondary";
    }
  };

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

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

  const filteredLeads = useMemo(() => {
    const query = search.trim().toLowerCase();

    return leads.filter((lead) => {
      const leadStatus = getStatus(lead);

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
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !query || searchableText.includes(query);

      const matchesStatus =
        !status || leadStatus === status;

      return matchesSearch && matchesStatus;
    });
  }, [leads, search, status]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredLeads.length / ITEMS_PER_PAGE)
  );

  const currentPage = Math.min(page, totalPages);

  const paginatedLeads = useMemo(() => {
    const start =
      (currentPage - 1) * ITEMS_PER_PAGE;

    return filteredLeads.slice(
      start,
      start + ITEMS_PER_PAGE
    );
  }, [filteredLeads, currentPage]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const handleViewLead = (lead) => {
    const id = lead?._id || lead?.id;

    if (id) {
      router.push(`/employee/leads/${id}`);
    }
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
      {/* Header */}
      <div className="employee-leads-header">
        <div>
          <span className="employee-leads-eyebrow">
            Sales Management
          </span>

          <h1>My Leads</h1>

          <p>
            View and manage the leads assigned to you.
          </p>
        </div>

        <Button
          type="button"
          onClick={loadLeads}
          variant="secondary"
          disabled={loading}
        >
          Refresh
        </Button>
      </div>

      {/* Toolbar */}
      <div className="employee-leads-toolbar">
        <SearchBox
          value={search}
          onChange={setSearch}
          placeholder="Search leads..."
        />

        <Select
          value={status}
          onChange={(event) =>
            setStatus(event.target.value)
          }
          options={STATUS_OPTIONS}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="employee-leads-error">
          <span>{error}</span>

          <Button
            type="button"
            variant="secondary"
            onClick={loadLeads}
          >
            Retry
          </Button>
        </div>
      )}

      {/* Leads */}
      <div className="employee-leads-card">
        {paginatedLeads.length === 0 ? (
          <div className="employee-leads-empty">
            <div className="employee-leads-empty-icon">
              ☀
            </div>

            <h3>
              {error ? "Unable to load leads" : "No leads found"}
            </h3>

            <p>
              {error
                ? "Please retry after checking the connection."
                : search || status
                ? "Try changing your search or filters."
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
                    const id =
                      lead?._id ||
                      lead?.id ||
                      index;

                    const leadStatus = getStatus(lead);

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

                        <td>
                          {getLeadPhone(lead)}
                        </td>

                        <td>
                          {[
                            lead?.city,
                            lead?.state,
                          ]
                            .filter(Boolean)
                            .join(", ") || "—"}
                        </td>

                        <td>
                          {getSource(lead)}
                        </td>

                        <td>
                          <Badge
                            variant={getStatusVariant(
                              leadStatus
                            )}
                          >
                            {leadStatus}
                          </Badge>
                        </td>

                        <td>
                          {formatDate(
                            lead?.createdAt
                          )}
                        </td>

                        <td>
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() =>
                              handleViewLead(lead)
                            }
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
                Showing{" "}
                {(currentPage - 1) *
                  ITEMS_PER_PAGE +
                  1}{" "}
                -{" "}
                {Math.min(
                  currentPage *
                    ITEMS_PER_PAGE,
                  filteredLeads.length
                )}{" "}
                of {filteredLeads.length} leads
              </span>

              <Pagination
                currentPage={currentPage}
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

export default EmployeeLeadsPage;