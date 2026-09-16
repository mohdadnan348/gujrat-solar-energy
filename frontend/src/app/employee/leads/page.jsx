"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import Button from "@/components/common/Button";
import SearchBox from "@/components/common/SearchBox";
import Select from "@/components/common/Select";
import Badge from "@/components/common/Badge";
import Pagination from "@/components/common/Pagination";
import Loader from "@/components/common/Loader";
import { useAuth } from "@/hooks/useAuth";
import leadService from "@/services/lead.service";
import "./leads(2).css";

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

const EmployeeLeadsPage = () => {
  const router = useRouter();
  const { user, logout, loading: authLoading } = useAuth();

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

      const response =
        await leadService.getAssignedLeads(
          user?._id || user?.id
        );

      const items =
        response?.data?.leads ||
        response?.data?.items ||
        response?.leads ||
        response?.items ||
        response?.data ||
        [];

      setLeads(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error(
        "Failed to load employee leads:",
        err
      );

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
    lead?.leadNumber ||
    lead?.leadNo ||
    lead?.referenceNumber ||
    lead?.leadId ||
    lead?._id ||
    "—";

  const getLeadPhone = (lead) =>
    lead?.mobile ||
    lead?.phone ||
    lead?.contactNumber ||
    "—";

  const getStatus = (lead) =>
    String(
      lead?.status ||
        lead?.leadStatus ||
        "NEW"
    ).toUpperCase();

  const getSource = (lead) =>
    String(
      lead?.leadSource ||
        lead?.source ||
        "OTHER"
    ).toUpperCase();

  const getStatusVariant = (leadStatus) => {
    switch (
      String(leadStatus).toUpperCase()
    ) {
      case "NEW":
        return "info";

      case "ASSIGNED":
        return "info";

      case "CONTACTED":
        return "warning";

      case "QUALIFIED":
        return "success";

      case "SITE_VISIT":
        return "warning";

      case "QUOTATION":
        return "info";

      case "WON":
        return "success";

      case "LOST":
        return "danger";

      default:
        return "secondary";
    }
  };

  const formatLabel = (value) =>
    String(value || "")
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );

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

  const filteredLeads = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

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
        !query ||
        searchableText.includes(query);

      const matchesStatus =
        !status ||
        leadStatus === status;

      return (
        matchesStatus &&
        matchesSearch
      );
    });
  }, [leads, search, status]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredLeads.length /
        ITEMS_PER_PAGE
    )
  );

  const currentPage = Math.min(
    page,
    totalPages
  );

  const paginatedLeads = useMemo(() => {
    const start =
      (currentPage - 1) *
      ITEMS_PER_PAGE;

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

  const handleLogout = async () => {
    await logout();
  };

  const handleSearch = (value) => {
    setSearch(value);
  };

  const handleViewLead = (lead) => {
    const id =
      lead?._id ||
      lead?.id;

    if (id) {
      router.push(
        `/employee/leads/${id}`
      );
    }
  };

  if (authLoading || loading) {
    return (
      <MainLayout
        user={user}
        onLogout={handleLogout}
        notificationCount={0}
      >
        <div className="employee-leads-loading">
          <Loader />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      user={user}
      onLogout={handleLogout}
      onSearch={handleSearch}
      notificationCount={0}
    >
      <div className="employee-leads-page">
        {/* Header */}
        <div className="employee-leads-header">
          <div>
            <span className="employee-leads-eyebrow">
              Sales Management
            </span>

            <h1>My Leads</h1>

            <p>
              View and manage the leads assigned
              to you.
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
            onChange={handleSearch}
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

              <h3>No leads found</h3>

              <p>
                {search || status
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
                    {paginatedLeads.map(
                      (lead, index) => {
                        const id =
                          lead?._id ||
                          lead?.id ||
                          index;

                        const leadStatus =
                          getStatus(lead);

                        return (
                          <tr key={id}>
                            <td>
                              <div className="employee-lead-name">
                                {getLeadName(lead)}
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
                                .join(", ") ||
                                "—"}
                            </td>

                            <td>
                              {formatLabel(
                                getSource(lead)
                              )}
                            </td>

                            <td>
                              <Badge
                                variant={getStatusVariant(
                                  leadStatus
                                )}
                              >
                                {formatLabel(
                                  leadStatus
                                )}
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
                                  handleViewLead(
                                    lead
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

              <div className="employee-leads-footer">
                <span>
                  Showing{" "}
                  {filteredLeads.length === 0
                    ? 0
                    : (currentPage - 1) *
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
    </MainLayout>
  );
};

export default EmployeeLeadsPage;