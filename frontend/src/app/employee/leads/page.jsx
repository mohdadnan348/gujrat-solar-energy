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
import leadService from "@/services/lead.service";

const EmployeeLeadsPage = () => {
  const { user, logout, loading: authLoading } = useAuth();

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const loadLeads = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await leadService.getAssignedLeads(user?._id || user?.id);

      const items =
        response?.data?.leads ||
        response?.data?.items ||
        response?.leads ||
        response?.items ||
        response?.data ||
        [];

      setLeads(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error("Failed to load employee leads:", err);
      setError(
        err?.message || "Unable to load leads. Please try again."
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

  const filteredLeads = useMemo(() => {
    const query = search.trim().toLowerCase();

    return leads.filter((lead) => {
      const leadStatus =
        lead?.status ||
        lead?.leadStatus ||
        "";

      const matchesStatus =
        !status ||
        leadStatus.toLowerCase() === status.toLowerCase();

      const searchableText = [
        lead?.name,
        lead?.customerName,
        lead?.companyName,
        lead?.phone,
        lead?.mobile,
        lead?.email,
        lead?.city,
        lead?.source,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !query || searchableText.includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [leads, search, status]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredLeads.length / limit)
  );

  const paginatedLeads = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredLeads.slice(start, start + limit);
  }, [filteredLeads, page, limit]);

  useEffect(() => {
    setPage(1);
  }, [search, status]);

  const getLeadName = (lead) =>
    lead?.name ||
    lead?.customerName ||
    lead?.contactPerson ||
    "Unnamed Lead";

  const getLeadPhone = (lead) =>
    lead?.phone ||
    lead?.mobile ||
    lead?.contactNumber ||
    "—";

  const getStatus = (lead) =>
    lead?.status ||
    lead?.leadStatus ||
    "NEW";

  const getStatusVariant = (leadStatus) => {
    const value = leadStatus.toLowerCase();

    if (["converted", "won", "closed_won"].includes(value)) {
      return "success";
    }

    if (["lost", "closed_lost", "cancelled"].includes(value)) {
      return "danger";
    }

    if (["in_progress", "follow_up", "contacted"].includes(value)) {
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

  const handleSearch = (value) => {
    setSearch(value);
  };

  const handleViewLead = (lead) => {
    const id = lead?._id || lead?.id;

    if (id) {
      window.location.href = `/employee/leads/${id}`;
    }
  };

  if (authLoading) {
    return (
      <div className="employee-leads-loading">
        <Loader />
      </div>
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
          >
            Refresh
          </Button>
        </div>

        <div className="employee-leads-toolbar">
          <SearchBox
            value={search}
            onChange={handleSearch}
            placeholder="Search leads..."
          />

          <Select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            options={[
              { value: "", label: "All Statuses" },
              { value: "NEW", label: "New" },
              { value: "CONTACTED", label: "Contacted" },
              { value: "FOLLOW_UP", label: "Follow Up" },
              { value: "IN_PROGRESS", label: "In Progress" },
              { value: "CONVERTED", label: "Converted" },
              { value: "LOST", label: "Lost" },
            ]}
          />
        </div>

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

        <div className="employee-leads-card">
          {loading ? (
            <div className="employee-leads-loader">
              <Loader />
            </div>
          ) : paginatedLeads.length === 0 ? (
            <div className="employee-leads-empty">
              <div className="employee-leads-empty-icon">☀</div>

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
                    {paginatedLeads.map((lead) => {
                      const id = lead?._id || lead?.id;
                      const leadStatus = getStatus(lead);

                      return (
                        <tr key={id || getLeadName(lead)}>
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

                          <td>{getLeadPhone(lead)}</td>

                          <td>
                            {lead?.city ||
                              lead?.location ||
                              "—"}
                          </td>

                          <td>
                            {lead?.source || "—"}
                          </td>

                          <td>
                            <Badge
                              variant={getStatusVariant(leadStatus)}
                            >
                              {leadStatus.replaceAll("_", " ")}
                            </Badge>
                          </td>

                          <td>
                            {formatDate(
                              lead?.createdAt ||
                                lead?.createdDate
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
                  {filteredLeads.length === 0
                    ? 0
                    : (page - 1) * limit + 1}{" "}
                  -{" "}
                  {Math.min(
                    page * limit,
                    filteredLeads.length
                  )}{" "}
                  of {filteredLeads.length} leads
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

export default EmployeeLeadsPage;