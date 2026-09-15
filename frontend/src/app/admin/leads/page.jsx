// frontend/src/app/admin/leads/page.jsx

"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import SearchBox from "@/components/common/SearchBox";
import Pagination from "@/components/common/Pagination";
import Loader from "@/components/common/Loader";
import Modal from "@/components/common/Modal";
import { useAuth } from "@/hooks/useAuth";
import leadService from "@/services/lead.service";
import employeeService from "@/services/employee.service";

const ITEMS_PER_PAGE = 10;

const AdminLeadsPage = () => {
  const router = useRouter();
  const { user, logout, loading: authLoading } = useAuth();

  const [leads, setLeads] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [sourceFilter, setSourceFilter] = useState("ALL");
  const [employeeFilter, setEmployeeFilter] = useState("ALL");

  const [page, setPage] = useState(1);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const loadData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const [leadResponse, employeeResponse] =
        await Promise.all([
          leadService.getLeads(),
          employeeService.getEmployees(),
        ]);

      const leadData =
        leadResponse?.data?.leads ||
        leadResponse?.data?.data ||
        leadResponse?.leads ||
        leadResponse?.data ||
        [];

      const employeeData =
        employeeResponse?.data?.employees ||
        employeeResponse?.data?.data ||
        employeeResponse?.employees ||
        employeeResponse?.data ||
        [];

      setLeads(Array.isArray(leadData) ? leadData : []);
      setEmployees(
        Array.isArray(employeeData) ? employeeData : []
      );
    } catch (err) {
      console.error("Admin leads loading error:", err);

      setError(
        err?.message ||
          err?.response?.data?.message ||
          "Unable to load leads."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getLeadId = (lead) =>
    lead?._id || lead?.id || "—";

  const getLeadName = (lead) =>
    lead?.name ||
    lead?.customerName ||
    lead?.fullName ||
    "Unnamed Lead";

  const getCompanyName = (lead) =>
    lead?.companyName ||
    lead?.company ||
    "Individual Customer";

  const getPhone = (lead) =>
    lead?.phone ||
    lead?.mobile ||
    lead?.contactNumber ||
    "—";

  const getEmail = (lead) =>
    lead?.email || "—";

  const getStatus = (lead) =>
    String(lead?.status || "NEW").toUpperCase();

  const getPriority = (lead) =>
    String(lead?.priority || "MEDIUM").toUpperCase();

  const getSource = (lead) =>
    String(lead?.source || "OTHER").toUpperCase();

  const getAssignedEmployeeId = (lead) => {
    const assigned =
      lead?.assignedTo ||
      lead?.assignedEmployee ||
      lead?.employee;

    if (!assigned) return "";

    if (typeof assigned === "string") {
      return assigned;
    }

    return assigned?._id || assigned?.id || "";
  };

  const getAssignedEmployeeName = (lead) => {
    const assigned =
      lead?.assignedTo ||
      lead?.assignedEmployee ||
      lead?.employee;

    if (!assigned) {
      return "Unassigned";
    }

    if (typeof assigned === "string") {
      const employee = employees.find(
        (item) =>
          String(item?._id || item?.id) ===
          String(assigned)
      );

      if (employee) {
        return (
          employee?.name ||
          employee?.fullName ||
          `${employee?.firstName || ""} ${
            employee?.lastName || ""
          }`.trim() ||
          "Assigned"
        );
      }

      return "Assigned";
    }

    return (
      assigned?.name ||
      assigned?.fullName ||
      `${assigned?.firstName || ""} ${
        assigned?.lastName || ""
      }`.trim() ||
      "Assigned"
    );
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

  const formatLabel = (value) =>
    String(value || "")
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );

  const getStatusVariant = (status) => {
    switch (status) {
      case "NEW":
        return "info";
      case "CONTACTED":
        return "warning";
      case "QUALIFIED":
        return "success";
      case "PROPOSAL_SENT":
        return "info";
      case "NEGOTIATION":
        return "warning";
      case "CONVERTED":
        return "success";
      case "LOST":
        return "danger";
      case "CLOSED":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getPriorityVariant = (priority) => {
    switch (priority) {
      case "HIGH":
        return "danger";
      case "URGENT":
        return "danger";
      case "MEDIUM":
        return "warning";
      case "LOW":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const sourceOptions = useMemo(() => {
    return [
      ...new Set(
        leads
          .map((lead) => getSource(lead))
          .filter(Boolean)
      ),
    ];
  }, [leads]);

  const filteredLeads = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return leads.filter((lead) => {
      const leadName = getLeadName(lead).toLowerCase();
      const company = getCompanyName(lead).toLowerCase();
      const phone = getPhone(lead).toLowerCase();
      const email = getEmail(lead).toLowerCase();
      const status = getStatus(lead);
      const priority = getPriority(lead);
      const source = getSource(lead);
      const employeeId = getAssignedEmployeeId(lead);

      const matchesSearch =
        !searchValue ||
        leadName.includes(searchValue) ||
        company.includes(searchValue) ||
        phone.includes(searchValue) ||
        email.includes(searchValue);

      const matchesStatus =
        statusFilter === "ALL" ||
        status === statusFilter;

      const matchesPriority =
        priorityFilter === "ALL" ||
        priority === priorityFilter;

      const matchesSource =
        sourceFilter === "ALL" ||
        source === sourceFilter;

      const matchesEmployee =
        employeeFilter === "ALL" ||
        employeeId === employeeFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority &&
        matchesSource &&
        matchesEmployee
      );
    });
  }, [
    leads,
    search,
    statusFilter,
    priorityFilter,
    sourceFilter,
    employeeFilter,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredLeads.length / ITEMS_PER_PAGE
    )
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

  const stats = useMemo(() => {
    const total = leads.length;

    const newLeads = leads.filter(
      (lead) => getStatus(lead) === "NEW"
    ).length;

    const qualified = leads.filter(
      (lead) => getStatus(lead) === "QUALIFIED"
    ).length;

    const converted = leads.filter(
      (lead) => getStatus(lead) === "CONVERTED"
    ).length;

    const highPriority = leads.filter((lead) =>
      ["HIGH", "URGENT"].includes(getPriority(lead))
    ).length;

    return {
      total,
      newLeads,
      qualified,
      converted,
      highPriority,
    };
  }, [leads]);

  const openDetails = (lead) => {
    setSelectedLead(lead);
    setShowDetails(true);
  };

  const closeDetails = () => {
    setSelectedLead(null);
    setShowDetails(false);
  };

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setPriorityFilter("ALL");
    setSourceFilter("ALL");
    setEmployeeFilter("ALL");
    setPage(1);
  };

  if (authLoading || loading) {
    return (
      <MainLayout
        user={user}
        onLogout={handleLogout}
        onSearch={handleSearch}
        notificationCount={0}
      >
        <div className="admin-leads-loading">
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
      <div className="admin-leads-page">
        {/* Header */}
        <div className="admin-leads-header">
          <div>
            <div className="admin-leads-breadcrumb">
              Admin <span>/</span> Leads
            </div>

            <h1>Lead Management</h1>

            <p>
              Manage, assign and monitor all solar leads.
            </p>
          </div>

          <div className="admin-leads-header-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={() => loadData(true)}
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
                router.push("/admin/leads/create")
              }
            >
              + Create Lead
            </Button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="admin-leads-error">
            <span>{error}</span>

            <button
              type="button"
              onClick={() => loadData()}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="admin-leads-stats">
          <div className="admin-lead-stat-card">
            <div className="admin-lead-stat-icon">👥</div>

            <div>
              <span>Total Leads</span>
              <strong>{stats.total}</strong>
            </div>
          </div>

          <div className="admin-lead-stat-card">
            <div className="admin-lead-stat-icon">🆕</div>

            <div>
              <span>New Leads</span>
              <strong>{stats.newLeads}</strong>
            </div>
          </div>

          <div className="admin-lead-stat-card">
            <div className="admin-lead-stat-icon">✓</div>

            <div>
              <span>Qualified</span>
              <strong>{stats.qualified}</strong>
            </div>
          </div>

          <div className="admin-lead-stat-card">
            <div className="admin-lead-stat-icon">🏆</div>

            <div>
              <span>Converted</span>
              <strong>{stats.converted}</strong>
            </div>
          </div>

          <div className="admin-lead-stat-card">
            <div className="admin-lead-stat-icon">⚠</div>

            <div>
              <span>High Priority</span>
              <strong>{stats.highPriority}</strong>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="admin-leads-filter-card">
          <div className="admin-leads-search">
            <SearchBox
              value={search}
              onChange={handleSearch}
              placeholder="Search name, company, phone..."
            />
          </div>

          <div className="admin-leads-filter-group">
            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setPage(1);
              }}
              className="admin-leads-filter-select"
            >
              <option value="ALL">All Status</option>
              <option value="NEW">New</option>
              <option value="CONTACTED">
                Contacted
              </option>
              <option value="QUALIFIED">
                Qualified
              </option>
              <option value="PROPOSAL_SENT">
                Proposal Sent
              </option>
              <option value="NEGOTIATION">
                Negotiation
              </option>
              <option value="CONVERTED">
                Converted
              </option>
              <option value="LOST">Lost</option>
              <option value="CLOSED">Closed</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(event) => {
                setPriorityFilter(event.target.value);
                setPage(1);
              }}
              className="admin-leads-filter-select"
            >
              <option value="ALL">All Priority</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>

            <select
              value={sourceFilter}
              onChange={(event) => {
                setSourceFilter(event.target.value);
                setPage(1);
              }}
              className="admin-leads-filter-select"
            >
              <option value="ALL">All Sources</option>

              {sourceOptions.map((source) => (
                <option key={source} value={source}>
                  {formatLabel(source)}
                </option>
              ))}
            </select>

            <select
              value={employeeFilter}
              onChange={(event) => {
                setEmployeeFilter(event.target.value);
                setPage(1);
              }}
              className="admin-leads-filter-select"
            >
              <option value="ALL">
                All Employees
              </option>

              {employees.map((employee) => {
                const id =
                  employee?._id || employee?.id;

                const name =
                  employee?.name ||
                  employee?.fullName ||
                  `${employee?.firstName || ""} ${
                    employee?.lastName || ""
                  }`.trim() ||
                  "Employee";

                return (
                  <option key={id} value={id}>
                    {name}
                  </option>
                );
              })}
            </select>

            <button
              type="button"
              className="admin-leads-reset-btn"
              onClick={resetFilters}
            >
              Reset
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="admin-leads-table-card">
          <div className="admin-leads-table-header">
            <div>
              <h2>All Leads</h2>

              <p>
                {filteredLeads.length} lead
                {filteredLeads.length !== 1
                  ? "s"
                  : ""}{" "}
                found
              </p>
            </div>
          </div>

          {paginatedLeads.length === 0 ? (
            <div className="admin-leads-empty">
              <div className="admin-leads-empty-icon">
                👥
              </div>

              <h3>No leads found</h3>

              <p>
                Try changing the filters or create a new
                lead.
              </p>

              <Button
                type="button"
                variant="primary"
                onClick={() =>
                  router.push("/admin/leads/create")
                }
              >
                + Create Lead
              </Button>
            </div>
          ) : (
            <>
              <div className="admin-leads-table-wrapper">
                <table className="admin-leads-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Lead</th>
                      <th>Contact</th>
                      <th>Status</th>
                      <th>Priority</th>
                      <th>Source</th>
                      <th>Assigned To</th>
                      <th>Created</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedLeads.map((lead) => (
                      <tr key={getLeadId(lead)}>
                        <td>
                          <span className="admin-lead-id">
                            {getLeadId(lead)}
                          </span>
                        </td>

                        <td>
                          <div className="admin-lead-name-cell">
                            <strong>
                              {getLeadName(lead)}
                            </strong>

                            <span>
                              {getCompanyName(lead)}
                            </span>
                          </div>
                        </td>

                        <td>
                          <div className="admin-lead-contact-cell">
                            <span>{getPhone(lead)}</span>
                            <small>{getEmail(lead)}</small>
                          </div>
                        </td>

                        <td>
                          <Badge
                            variant={getStatusVariant(
                              getStatus(lead)
                            )}
                          >
                            {formatLabel(
                              getStatus(lead)
                            )}
                          </Badge>
                        </td>

                        <td>
                          <Badge
                            variant={getPriorityVariant(
                              getPriority(lead)
                            )}
                          >
                            {formatLabel(
                              getPriority(lead)
                            )}
                          </Badge>
                        </td>

                        <td>
                          <span className="admin-lead-source">
                            {formatLabel(
                              getSource(lead)
                            )}
                          </span>
                        </td>

                        <td>
                          <span className="admin-lead-assignee">
                            {getAssignedEmployeeName(
                              lead
                            )}
                          </span>
                        </td>

                        <td>
                          <span className="admin-lead-date">
                            {formatDate(
                              lead?.createdAt ||
                                lead?.createdDate
                            )}
                          </span>
                        </td>

                        <td>
                          <button
                            type="button"
                            className="admin-lead-view-btn"
                            onClick={() =>
                              openDetails(lead)
                            }
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="admin-leads-pagination">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Details Modal */}
        {showDetails && selectedLead && (
          <Modal
            isOpen={showDetails}
            onClose={closeDetails}
            title="Lead Details"
          >
            <div className="admin-lead-details">
              <div className="admin-lead-details-header">
                <div className="admin-lead-avatar">
                  {getLeadName(selectedLead)
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <h3>
                    {getLeadName(selectedLead)}
                  </h3>

                  <p>
                    {getCompanyName(selectedLead)}
                  </p>

                  <div className="admin-lead-details-badges">
                    <Badge
                      variant={getStatusVariant(
                        getStatus(selectedLead)
                      )}
                    >
                      {formatLabel(
                        getStatus(selectedLead)
                      )}
                    </Badge>

                    <Badge
                      variant={getPriorityVariant(
                        getPriority(selectedLead)
                      )}
                    >
                      {formatLabel(
                        getPriority(selectedLead)
                      )}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="admin-lead-details-grid">
                <div>
                  <span>Phone</span>
                  <strong>
                    {getPhone(selectedLead)}
                  </strong>
                </div>

                <div>
                  <span>Email</span>
                  <strong>
                    {getEmail(selectedLead)}
                  </strong>
                </div>

                <div>
                  <span>Source</span>
                  <strong>
                    {formatLabel(
                      getSource(selectedLead)
                    )}
                  </strong>
                </div>

                <div>
                  <span>Assigned To</span>
                  <strong>
                    {getAssignedEmployeeName(
                      selectedLead
                    )}
                  </strong>
                </div>

                <div>
                  <span>Follow-up Date</span>
                  <strong>
                    {formatDate(
                      selectedLead?.followUpDate
                    )}
                  </strong>
                </div>

                <div>
                  <span>Created Date</span>
                  <strong>
                    {formatDate(
                      selectedLead?.createdAt
                    )}
                  </strong>
                </div>
              </div>

              <div className="admin-lead-detail-block">
                <span>Requirement</span>

                <p>
                  {selectedLead?.requirement ||
                    selectedLead?.description ||
                    "No requirement information available."}
                </p>
              </div>

              <div className="admin-lead-detail-block">
                <span>Address</span>

                <p>
                  {selectedLead?.address ||
                    selectedLead?.city ||
                    "No address information available."}
                </p>
              </div>

              <div className="admin-lead-detail-block">
                <span>Notes</span>

                <p>
                  {selectedLead?.notes ||
                    "No additional notes available."}
                </p>
              </div>

              <div className="admin-lead-details-footer">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={closeDetails}
                >
                  Close
                </Button>

                <Button
                  type="button"
                  variant="primary"
                  onClick={() =>
                    router.push(
                      `/admin/leads/${getLeadId(
                        selectedLead
                      )}`
                    )
                  }
                >
                  Open Lead
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </MainLayout>
  );
};

export default AdminLeadsPage;