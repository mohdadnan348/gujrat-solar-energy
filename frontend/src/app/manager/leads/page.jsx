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

const ManagerLeadsPage = () => {
  const { user, logout, loading: authLoading } = useAuth();

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const limit = 10;

  const loadLeads = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await leadService.getLeads();

      const items =
        response?.data?.leads ||
        response?.data?.items ||
        response?.leads ||
        response?.items ||
        response?.data ||
        [];

      setLeads(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error("Failed to load manager leads:", err);

      setError(
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

  const filteredLeads = useMemo(() => {
    const query = search.trim().toLowerCase();

    return leads.filter((lead) => {
      const leadStatus =
        lead?.status ||
        lead?.leadStatus ||
        "";

      const searchableText = [
        lead?.leadNumber,
        lead?.leadNo,
        lead?.name,
        lead?.customerName,
        lead?.phone,
        lead?.mobile,
        lead?.email,
        lead?.city,
        lead?.source,
        lead?.assignedTo?.name,
        lead?.assignedTo?.fullName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !query ||
        searchableText.includes(query);

      const matchesStatus =
        !status ||
        leadStatus.toLowerCase() ===
          status.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [leads, search, status]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredLeads.length / limit)
  );

  const paginatedLeads = useMemo(() => {
    const start = (page - 1) * limit;

    return filteredLeads.slice(
      start,
      start + limit
    );
  }, [filteredLeads, page]);

  const getLeadName = (lead) =>
    lead?.name ||
    lead?.customerName ||
    lead?.customer?.name ||
    "Unnamed Lead";

  const getLeadNumber = (lead) =>
    lead?.leadNumber ||
    lead?.leadNo ||
    lead?.referenceNumber ||
    "—";

  const getPhone = (lead) =>
    lead?.phone ||
    lead?.mobile ||
    lead?.contactNumber ||
    "—";

  const getStatus = (lead) =>
    lead?.status ||
    lead?.leadStatus ||
    "NEW";

  const getStatusVariant = (value) => {
    const statusValue = String(value).toLowerCase();

    if (
      ["converted", "closed", "won"].includes(
        statusValue
      )
    ) {
      return "success";
    }

    if (
      ["lost", "rejected", "cancelled"].includes(
        statusValue
      )
    ) {
      return "danger";
    }

    if (
      ["contacted", "qualified", "in_progress"].includes(
        statusValue
      )
    ) {
      return "warning";
    }

    return "default";
  };

  const getAssignedEmployee = (lead) => {
    return (
      lead?.assignedTo?.name ||
      lead?.assignedTo?.fullName ||
      lead?.employee?.name ||
      lead?.employee?.fullName ||
      lead?.assignedEmployee?.name ||
      "Unassigned"
    );
  };

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleViewLead = (lead) => {
    const id = lead?._id || lead?.id;

    if (id) {
      window.location.href =
        `/manager/leads/${id}`;
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  if (authLoading) {
    return (
      <div className="manager-leads-loading">
        <Loader />
      </div>
    );
  }

  return (
    <MainLayout
      user={user}
      onLogout={handleLogout}
      notificationCount={0}
    >
      <div className="manager-leads-page">
        <div className="manager-leads-header">
          <div>
            <span className="manager-leads-eyebrow">
              Manager Portal
            </span>

            <h1>Leads</h1>

            <p>
              Monitor and manage all leads assigned
              across your team.
            </p>
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={loadLeads}
          >
            Refresh
          </Button>
        </div>

        {error && (
          <div className="manager-leads-error">
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

        <div className="manager-leads-toolbar">
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
            options={[
              {
                value: "",
                label: "All Statuses",
              },
              {
                value: "NEW",
                label: "New",
              },
              {
                value: "CONTACTED",
                label: "Contacted",
              },
              {
                value: "QUALIFIED",
                label: "Qualified",
              },
              {
                value: "IN_PROGRESS",
                label: "In Progress",
              },
              {
                value: "CONVERTED",
                label: "Converted",
              },
              {
                value: "LOST",
                label: "Lost",
              },
            ]}
          />
        </div>

        <div className="manager-leads-summary">
          <div>
            <strong>{filteredLeads.length}</strong>
            <span>Total Leads</span>
          </div>

          <div>
            <strong>
              {
                filteredLeads.filter(
                  (lead) =>
                    String(getStatus(lead)).toLowerCase() ===
                    "new"
                ).length
              }
            </strong>
            <span>New</span>
          </div>

          <div>
            <strong>
              {
                filteredLeads.filter(
                  (lead) =>
                    String(getStatus(lead)).toLowerCase() ===
                    "qualified"
                ).length
              }
            </strong>
            <span>Qualified</span>
          </div>

          <div>
            <strong>
              {
                filteredLeads.filter(
                  (lead) =>
                    String(getStatus(lead)).toLowerCase() ===
                    "converted"
                ).length
              }
            </strong>
            <span>Converted</span>
          </div>
        </div>

        <div className="manager-leads-card">
          {loading ? (
            <div className="manager-leads-loader">
              <Loader />
            </div>
          ) : paginatedLeads.length === 0 ? (
            <div className="manager-leads-empty">
              <div className="manager-leads-empty-icon">
                L
              </div>

              <h3>No leads found</h3>

              <p>
                {search || status
                  ? "Try changing your search or filters."
                  : "There are no leads available yet."}
              </p>
            </div>
          ) : (
            <>
              <div className="manager-leads-table-wrapper">
                <table className="manager-leads-table">
                  <thead>
                    <tr>
                      <th>Lead No.</th>
                      <th>Customer</th>
                      <th>Contact</th>
                      <th>Location</th>
                      <th>Assigned To</th>
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
                              <span className="manager-lead-number">
                                {getLeadNumber(lead)}
                              </span>
                            </td>

                            <td>
                              <div className="manager-lead-customer">
                                {getLeadName(lead)}
                              </div>

                              {lead?.email && (
                                <div className="manager-lead-email">
                                  {lead.email}
                                </div>
                              )}
                            </td>

                            <td>
                              {getPhone(lead)}
                            </td>

                            <td>
                              {lead?.city ||
                                lead?.location ||
                                lead?.address?.city ||
                                "—"}
                            </td>

                            <td>
                              <span
                                className={
                                  getAssignedEmployee(
                                    lead
                                  ) === "Unassigned"
                                    ? "manager-lead-unassigned"
                                    : "manager-lead-assigned"
                                }
                              >
                                {getAssignedEmployee(
                                  lead
                                )}
                              </span>
                            </td>

                            <td>
                              <Badge
                                variant={getStatusVariant(
                                  leadStatus
                                )}
                              >
                                {String(
                                  leadStatus
                                ).replaceAll(
                                  "_",
                                  " "
                                )}
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

              <div className="manager-leads-footer">
                <span>
                  Showing{" "}
                  {(page - 1) * limit + 1} -{" "}
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

export default ManagerLeadsPage;