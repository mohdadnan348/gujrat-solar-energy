"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import SearchBox from "@/components/common/SearchBox";
import Pagination from "@/components/common/Pagination";
import Loader from "@/components/common/Loader";

import leadService from "@/services/lead.service";
import solarRequirementService from "@/services/solarRequirement.service";

import "./requirements.css";

const ITEMS_PER_PAGE = 10;

function extractArray(response, keys = []) {
  const candidates = [
    response,
    response?.data,
    response?.requirements,
    response?.solarRequirements,
    response?.leads,
    response?.results,
    response?.items,
    response?.data?.requirements,
    response?.data?.solarRequirements,
    response?.data?.leads,
    response?.data?.results,
    response?.data?.items,
  ];

  for (const value of candidates) {
    if (Array.isArray(value)) return value;
  }

  for (const key of keys) {
    if (Array.isArray(response?.[key])) return response[key];
    if (Array.isArray(response?.data?.[key])) return response.data[key];
  }

  return [];
}

function extractObject(response) {
  const candidates = [
    response?.data?.requirement,
    response?.data?.solarRequirement,
    response?.data?.data,
    response?.data,
    response?.requirement,
    response?.solarRequirement,
    response,
  ];

  return candidates.find(
    (value) => value && typeof value === "object" && !Array.isArray(value)
  ) || null;
}

function getLeadId(lead) {
  return lead?._id || lead?.id || lead?.leadId || lead?.lead?._id || lead?.lead?.id || "";
}

function getRequirementId(item) {
  return item?.requirementNumber || item?.requirementId || item?._id || item?.id || "";
}

function getName(person) {
  if (!person) return "—";
  if (typeof person === "string") return person;
  const fullName = `${person?.firstName || ""} ${person?.lastName || ""}`.trim();
  return person?.name || person?.fullName || person?.customerName || fullName || person?.email || "—";
}

function getCustomer(item) {
  return item?.customer || item?.customerId || item?.lead || item?.leadId || null;
}

function getCustomerName(item) {
  const customer = getCustomer(item);
  return item?.customerName || item?.customer?.name || item?.customer?.fullName ||
    item?.lead?.customerName || item?.lead?.name || getName(customer);
}

function getCustomerPhone(item) {
  return item?.phone || item?.mobile || item?.customer?.phone || item?.customer?.mobile ||
    item?.lead?.phone || item?.lead?.mobile || item?.lead?.contactNumber || "";
}

function getCustomerEmail(item) {
  return item?.email || item?.customer?.email || item?.lead?.email || "";
}

function getCapacity(item) {
  const value = item?.requiredKw ?? item?.requiredKW ?? item?.kw ?? item?.systemSize ??
    item?.capacity ?? item?.requiredCapacity ?? item?.plantCapacity;
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isNaN(number) ? value : number;
}

function getSystemType(item) {
  return item?.systemType || item?.requirementType || item?.solarType || item?.type || "—";
}

function getConnectionType(item) {
  return item?.connectionType || item?.connection || "—";
}

function getLocation(item) {
  const location = item?.location;
  if (location && typeof location === "object") {
    return location?.city || location?.name || location?.address || "—";
  }
  return item?.city || location || item?.siteAddress || item?.address || "—";
}

function normalizeStatus(status) {
  return String(status || "PENDING").trim().toUpperCase().replace(/[\s-]+/g, "_");
}

function getStatusVariant(status) {
  const value = normalizeStatus(status);
  if (["COMPLETE", "COMPLETED", "APPROVED", "CONVERTED", "ACTIVE"].some((s) => value.includes(s))) return "success";
  if (["REJECT", "CANCEL", "FAILED"].some((s) => value.includes(s))) return "danger";
  if (["PENDING", "DRAFT", "PROGRESS", "NEW"].some((s) => value.includes(s))) return "warning";
  return "info";
}

function formatStatus(status) {
  return normalizeStatus(status).replace(/_/g, " ").toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function formatNumber(value) {
  if (value === null || value === undefined || value === "") return "—";
  const number = Number(value);
  return Number.isNaN(number) ? String(value) : number.toLocaleString("en-IN");
}

export default function EmployeeSolarRequirementsPage() {
  const router = useRouter();

  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  const loadRequirements = useCallback(async (refresh = false) => {
    try {
      if (refresh) setRefreshing(true);
      else setLoading(true);
      setError("");

      // Do not call GET /solar-requirements: backend restricts that endpoint
      // to Admin, Manager and HR. Employee data is loaded via their own leads.
      const leadResponse = await leadService.getMyLeads({ page: 1, limit: 100 });
      const leads = extractArray(leadResponse, ["leads", "results", "items"]);

      if (leads.length === 0) {
        setRequirements([]);
        return;
      }

      const results = await Promise.allSettled(
        leads.map(async (lead) => {
          const leadId = getLeadId(lead);
          if (!leadId) return [];
          const response = await solarRequirementService.getSolarRequirementsByLead(leadId);
          const list = extractArray(response, ["requirements", "solarRequirements", "items"]);
          if (list.length) return list;

          const item = extractObject(response);
          return item && (getRequirementId(item) || item.lead || item.leadId || item.customer)
            ? [item]
            : [];
        })
      );

      const found = [];
      results.forEach((result) => {
        if (result.status === "fulfilled") found.push(...result.value);
      });

      const unique = new Map();
      found.forEach((item, index) => {
        const id = getRequirementId(item) || `${getLeadId(item?.lead || item)}-${index}`;
        if (id) unique.set(String(id), item);
      });

      setRequirements(Array.from(unique.values()));

      if (found.length === 0 && results.every((result) => result.status === "rejected")) {
        const firstError = results.find((result) => result.status === "rejected")?.reason;
        throw firstError || new Error("Unable to load solar requirements for your leads.");
      }
    } catch (err) {
      console.error("Failed to load employee solar requirements:", err);
      const status = err?.response?.status;
      const message = err?.response?.data?.message || err?.response?.data?.error;
      setRequirements([]);
      if (status === 401) {
        setError(message || "Your session has expired. Please sign in again.");
      } else if (status === 403) {
        setError(message || "Your account is not authorized to view these requirements. Please verify Employee role permissions.");
      } else {
        setError(message || err?.message || "Unable to load solar requirements. Please try again.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadRequirements();
  }, [loadRequirements]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, typeFilter]);

  const filteredRequirements = useMemo(() => {
    const query = search.trim().toLowerCase();
    return requirements.filter((item) => {
      const searchable = [
        getRequirementId(item), getCustomerName(item), getCustomerPhone(item),
        getCustomerEmail(item), getLocation(item), getSystemType(item),
        getConnectionType(item), item?.status, getCapacity(item),
      ].filter((value) => value !== null && value !== undefined && value !== "")
        .map((value) => typeof value === "object" ? JSON.stringify(value) : String(value))
        .join(" ").toLowerCase();

      const matchesSearch = !query || searchable.includes(query);
      const matchesStatus = statusFilter === "ALL" || normalizeStatus(item?.status) === statusFilter;
      const normalizedType = String(getSystemType(item)).toUpperCase().replace(/[\s-]+/g, "_");
      const matchesType = typeFilter === "ALL" || normalizedType === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [requirements, search, statusFilter, typeFilter]);

  const statusOptions = useMemo(
    () => [...new Set(requirements.map((item) => normalizeStatus(item?.status)).filter(Boolean))],
    [requirements]
  );

  const typeOptions = useMemo(
    () => [...new Set(requirements.map((item) => String(getSystemType(item)).toUpperCase().replace(/[\s-]+/g, "_")).filter((value) => value && value !== "—"))],
    [requirements]
  );

  const stats = useMemo(() => {
    const statuses = requirements.map((item) => normalizeStatus(item?.status));
    return {
      total: requirements.length,
      pending: statuses.filter((status) => ["PENDING", "NEW", "DRAFT"].includes(status)).length,
      inProgress: statuses.filter((status) => ["IN_PROGRESS", "PROCESSING"].includes(status)).length,
      approved: statuses.filter((status) => ["APPROVED", "COMPLETED", "ACTIVE", "CONVERTED"].includes(status)).length,
    };
  }, [requirements]);

  const totalPages = Math.max(1, Math.ceil(filteredRequirements.length / ITEMS_PER_PAGE));
  const page = Math.min(currentPage, totalPages);
  const paginatedRequirements = filteredRequirements.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleCreate = () => router.push("/employee/solar-requirements/create");

  const handleView = (item) => {
    const id = item?._id || item?.id || item?.requirementId;
    if (!id) {
      setError("Requirement ID is missing, so this item cannot be opened.");
      return;
    }
    router.push(`/employee/solar-requirements/${id}`);
  };

  if (loading) {
    return <div className="admin-requirements-loading"><Loader /></div>;
  }

  return (
    <div className="admin-requirements-page">
      <div className="admin-requirements-header">
        <div className="admin-requirements-heading">
          <span className="admin-page-eyebrow">Solar Management · Employee</span>
          <h1>My Solar Requirements</h1>
          <p>View solar requirements linked to your leads.</p>
        </div>
        <div className="admin-requirements-header-actions">
          <Button variant="secondary" onClick={() => loadRequirements(true)} disabled={refreshing}>
            {refreshing ? "Refreshing..." : "↻ Refresh"}
          </Button>
          <Button onClick={handleCreate}>+ Create Requirement</Button>
        </div>
      </div>

      {error && (
        <div className="admin-requirements-error" role="alert">
          <div><strong>Something went wrong</strong><p>{error}</p></div>
          <Button variant="secondary" onClick={() => loadRequirements(true)} disabled={refreshing}>Try Again</Button>
        </div>
      )}

      <div className="admin-requirements-stats">
        <div className="admin-requirement-stat-card"><div className="admin-stat-icon total">☀</div><div><span>My Requirements</span><strong>{stats.total}</strong></div></div>
        <div className="admin-requirement-stat-card"><div className="admin-stat-icon pending">◷</div><div><span>Pending</span><strong>{stats.pending}</strong></div></div>
        <div className="admin-requirement-stat-card"><div className="admin-stat-icon progress">↻</div><div><span>In Progress</span><strong>{stats.inProgress}</strong></div></div>
        <div className="admin-requirement-stat-card"><div className="admin-stat-icon approved">✓</div><div><span>Approved / Completed</span><strong>{stats.approved}</strong></div></div>
      </div>

      <div className="admin-requirements-toolbar">
        <div className="admin-requirements-search">
          <SearchBox value={search} onChange={setSearch} placeholder="Search requirement, customer, city..." />
        </div>
        <div className="admin-requirements-filters">
          <select className="admin-filter-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="ALL">All Statuses</option>
            {statusOptions.map((status) => <option key={status} value={status}>{formatStatus(status)}</option>)}
          </select>
          <select className="admin-filter-select" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
            <option value="ALL">All Types</option>
            {typeOptions.map((type) => <option key={type} value={type}>{formatStatus(type)}</option>)}
          </select>
        </div>
      </div>

      <div className="admin-requirements-card">
        <div className="admin-requirements-card-header">
          <div><h2>My Requirements</h2><p>Showing <strong>{filteredRequirements.length}</strong> requirement{filteredRequirements.length === 1 ? "" : "s"}</p></div>
          <div className="admin-results-count">{filteredRequirements.length} Results</div>
        </div>

        {paginatedRequirements.length === 0 ? (
          <div className="admin-requirements-empty">
            <div className="admin-empty-icon">☀</div>
            <h3>{error ? "Unable to load requirements" : "No requirements found"}</h3>
            <p>{error ? "Retry the request. If this continues, verify the employee API permissions." : search || statusFilter !== "ALL" || typeFilter !== "ALL" ? "Try changing your search or filters." : "No solar requirements are linked to your leads yet."}</p>
            {!error && <Button onClick={handleCreate}>+ Create Requirement</Button>}
          </div>
        ) : (
          <div className="admin-requirements-table-wrapper">
            <table className="admin-requirements-table">
              <thead><tr><th>Requirement</th><th>Customer</th><th>System Type</th><th>Capacity</th><th>Location</th><th>Status</th><th>Created</th><th>Action</th></tr></thead>
              <tbody>
                {paginatedRequirements.map((item, index) => {
                  const id = getRequirementId(item) || `requirement-${index}`;
                  const capacity = getCapacity(item);
                  return (
                    <tr key={String(item?._id || item?.id || id)}>
                      <td><div className="admin-requirement-id"><span className="admin-mini-icon">☀</span><div><strong>{id || "—"}</strong><small>{formatDate(item?.createdAt)}</small></div></div></td>
                      <td><div className="admin-customer-cell"><strong>{getCustomerName(item)}</strong>{getCustomerPhone(item) && <small>{getCustomerPhone(item)}</small>}{getCustomerEmail(item) && <small>{getCustomerEmail(item)}</small>}</div></td>
                      <td><div className="admin-system-type-cell"><span className="admin-type-text">{getSystemType(item)}</span>{getConnectionType(item) !== "—" && <small>{getConnectionType(item)}</small>}</div></td>
                      <td><strong className="admin-capacity">{capacity !== null && capacity !== undefined ? `${formatNumber(capacity)} kW` : "—"}</strong></td>
                      <td><span className="admin-location-text">{getLocation(item)}</span></td>
                      <td><Badge variant={getStatusVariant(item?.status)}>{formatStatus(item?.status)}</Badge></td>
                      <td><span className="admin-date-text">{formatDate(item?.createdAt)}</span></td>
                      <td><button type="button" className="admin-view-button" onClick={() => handleView(item)}>View</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {filteredRequirements.length > ITEMS_PER_PAGE && (
          <div className="admin-requirements-pagination">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        )}
      </div>
    </div>
  );
}
