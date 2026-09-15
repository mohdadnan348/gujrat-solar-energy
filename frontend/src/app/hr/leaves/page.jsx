"use client";

import React, { useEffect, useMemo, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import SearchBox from "@/components/common/SearchBox";
import Pagination from "@/components/common/Pagination";
import Loader from "@/components/common/Loader";
import Modal from "@/components/common/Modal";
import { useAuth } from "@/hooks/useAuth";
import leaveService from "@/services/leave.service";

const ITEMS_PER_PAGE = 10;

const STATUS_OPTIONS = [
  { value: "ALL", label: "All Status" },
  { value: "Pending", label: "Pending" },
  { value: "Approved", label: "Approved" },
  { value: "Rejected", label: "Rejected" },
  { value: "Cancelled", label: "Cancelled" },
];

const normalizeResponse = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.leaves)) {
    return response.data.leaves;
  }

  if (Array.isArray(response?.data?.leaveRequests)) {
    return response.data.leaveRequests;
  }

  if (Array.isArray(response?.data?.records)) {
    return response.data.records;
  }

  if (Array.isArray(response?.leaves)) {
    return response.leaves;
  }

  if (Array.isArray(response?.leaveRequests)) {
    return response.leaveRequests;
  }

  return [];
};

const HrLeavesPage = () => {
  const { user, logout, loading: authLoading } = useAuth();

  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [leaveTypeFilter, setLeaveTypeFilter] =
    useState("ALL");
  const [dateFilter, setDateFilter] = useState("");

  const [page, setPage] = useState(1);

  const [selectedLeave, setSelectedLeave] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const loadLeaves = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const params = {};

      if (statusFilter !== "ALL") {
        params.status = statusFilter;
      }

      if (dateFilter) {
        params.date = dateFilter;
      }

      const response =
        await leaveService.getLeaves(params);

      setLeaves(normalizeResponse(response));
    } catch (err) {
      console.error(
        "HR leaves loading error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load leave requests."
      );

      setLeaves([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadLeaves();
  }, [statusFilter, dateFilter]);

  const getEmployee = (leave) => {
    return (
      leave?.employee ||
      leave?.user ||
      leave?.employeeDetails ||
      {}
    );
  };

  const getEmployeeName = (leave) => {
    const employee = getEmployee(leave);

    if (typeof employee === "string") {
      return employee;
    }

    if (employee?.name) {
      return employee.name;
    }

    const firstName =
      employee?.firstName ||
      leave?.employeeName?.split(" ")?.[0] ||
      "";

    const lastName =
      employee?.lastName ||
      leave?.employeeName
        ?.split(" ")
        ?.slice(1)
        .join(" ") ||
      "";

    return (
      `${firstName} ${lastName}`.trim() ||
      leave?.employeeName ||
      "Unknown Employee"
    );
  };

  const getEmployeeId = (leave) => {
    const employee = getEmployee(leave);

    if (typeof employee === "string") {
      return leave?.employeeId || "—";
    }

    return (
      employee?.employeeId ||
      employee?.empId ||
      employee?.code ||
      leave?.employeeId ||
      "—"
    );
  };

  const getEmployeeEmail = (leave) => {
    const employee = getEmployee(leave);

    if (typeof employee === "string") {
      return leave?.email || "—";
    }

    return (
      employee?.email ||
      leave?.email ||
      "—"
    );
  };

  const getLeaveType = (leave) => {
    return (
      leave?.leaveType ||
      leave?.type ||
      leave?.category ||
      "Other"
    );
  };

  const getStatus = (leave) => {
    return leave?.status || "Pending";
  };

  const getStartDate = (leave) => {
    return (
      leave?.startDate ||
      leave?.fromDate ||
      leave?.from ||
      leave?.date ||
      null
    );
  };

  const getEndDate = (leave) => {
    return (
      leave?.endDate ||
      leave?.toDate ||
      leave?.to ||
      getStartDate(leave)
    );
  };

  const getDuration = (leave) => {
    if (
      leave?.duration !== undefined &&
      leave?.duration !== null
    ) {
      return leave.duration;
    }

    if (
      leave?.totalDays !== undefined &&
      leave?.totalDays !== null
    ) {
      return leave.totalDays;
    }

    const start = getStartDate(leave);
    const end = getEndDate(leave);

    if (!start || !end) {
      return "—";
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime())
    ) {
      return "—";
    }

    const startDay = new Date(startDate);
    const endDay = new Date(endDate);

    startDay.setHours(0, 0, 0, 0);
    endDay.setHours(0, 0, 0, 0);

    const difference =
      Math.floor(
        (endDay.getTime() - startDay.getTime()) /
          86400000
      ) + 1;

    return difference > 0 ? difference : "—";
  };

  const formatDate = (value) => {
    if (!value) {
      return "—";
    }

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

  const formatText = (value) => {
    if (!value) {
      return "—";
    }

    return String(value)
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  const normalizeStatus = (status) => {
    return String(status)
      .replace(/_/g, " ")
      .trim()
      .toLowerCase();
  };

  const getStatusVariant = (status) => {
    const normalized =
      normalizeStatus(status);

    if (normalized === "approved") {
      return "success";
    }

    if (normalized === "rejected") {
      return "danger";
    }

    if (normalized === "cancelled") {
      return "secondary";
    }

    if (normalized === "pending") {
      return "warning";
    }

    return "secondary";
  };

  const normalizedLeaves = useMemo(() => {
    return leaves.map((leave) => ({
      ...leave,
      displayName: getEmployeeName(leave),
      displayEmployeeId: getEmployeeId(leave),
      displayEmail: getEmployeeEmail(leave),
      displayType: getLeaveType(leave),
      displayStatus: getStatus(leave),
      displayStartDate: getStartDate(leave),
      displayEndDate: getEndDate(leave),
      displayDuration: getDuration(leave),
    }));
  }, [leaves]);

  const leaveTypes = useMemo(() => {
    const types = normalizedLeaves
      .map((leave) =>
        String(leave.displayType || "")
          .trim()
          .toUpperCase()
      )
      .filter(Boolean);

    return [...new Set(types)];
  }, [normalizedLeaves]);

  const filteredLeaves = useMemo(() => {
    const searchValue =
      search.trim().toLowerCase();

    return normalizedLeaves.filter((leave) => {
      const name = String(
        leave.displayName || ""
      ).toLowerCase();

      const employeeId = String(
        leave.displayEmployeeId || ""
      ).toLowerCase();

      const email = String(
        leave.displayEmail || ""
      ).toLowerCase();

      const type = String(
        leave.displayType || ""
      ).toLowerCase();

      const matchesSearch =
        !searchValue ||
        name.includes(searchValue) ||
        employeeId.includes(searchValue) ||
        email.includes(searchValue) ||
        type.includes(searchValue);

      const matchesStatus =
        statusFilter === "ALL" ||
        normalizeStatus(
          leave.displayStatus
        ) === normalizeStatus(statusFilter);

      const matchesType =
        leaveTypeFilter === "ALL" ||
        String(
          leave.displayType || ""
        ).toUpperCase() === leaveTypeFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesType
      );
    });
  }, [
    normalizedLeaves,
    search,
    statusFilter,
    leaveTypeFilter,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredLeaves.length /
        ITEMS_PER_PAGE
    )
  );

  const currentPage = Math.min(
    page,
    totalPages
  );

  const paginatedLeaves = useMemo(() => {
    const start =
      (currentPage - 1) *
      ITEMS_PER_PAGE;

    return filteredLeaves.slice(
      start,
      start + ITEMS_PER_PAGE
    );
  }, [filteredLeaves, currentPage]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const stats = useMemo(() => {
    const total = normalizedLeaves.length;

    const pending =
      normalizedLeaves.filter(
        (leave) =>
          normalizeStatus(
            leave.displayStatus
          ) === "pending"
      ).length;

    const approved =
      normalizedLeaves.filter(
        (leave) =>
          normalizeStatus(
            leave.displayStatus
          ) === "approved"
      ).length;

    const rejected =
      normalizedLeaves.filter(
        (leave) =>
          normalizeStatus(
            leave.displayStatus
          ) === "rejected"
      ).length;

    return {
      total,
      pending,
      approved,
      rejected,
    };
  }, [normalizedLeaves]);

  const getInitials = (name) => {
    const words = String(name)
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (!words.length) {
      return "E";
    }

    return words
      .slice(0, 2)
      .map((word) =>
        word.charAt(0).toUpperCase()
      )
      .join("");
  };

  const openDetails = (leave) => {
    setSelectedLeave(leave);
    setShowDetails(true);
  };

  const closeDetails = () => {
    setSelectedLeave(null);
    setShowDetails(false);
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setLeaveTypeFilter("ALL");
    setDateFilter("");
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
        <div className="hr-leaves-loading">
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
      <div className="hr-leaves-page">
        <div className="hr-leaves-header">
          <div>
            <div className="hr-leaves-breadcrumb">
              HR <span>/</span> Leaves
            </div>

            <h1>Leave Management</h1>

            <p>
              Review employee leave requests and
              monitor leave records.
            </p>
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={() => loadLeaves(true)}
            disabled={refreshing}
          >
            {refreshing
              ? "Refreshing..."
              : "↻ Refresh"}
          </Button>
        </div>

        <div className="hr-leaves-stats">
          <div className="hr-leaves-stat-card">
            <div className="hr-leaves-stat-icon">
              📋
            </div>

            <div>
              <span>Total Requests</span>
              <strong>{stats.total}</strong>
            </div>
          </div>

          <div className="hr-leaves-stat-card">
            <div className="hr-leaves-stat-icon">
              ◷
            </div>

            <div>
              <span>Pending</span>
              <strong>{stats.pending}</strong>
            </div>
          </div>

          <div className="hr-leaves-stat-card">
            <div className="hr-leaves-stat-icon">
              ✓
            </div>

            <div>
              <span>Approved</span>
              <strong>{stats.approved}</strong>
            </div>
          </div>

          <div className="hr-leaves-stat-card">
            <div className="hr-leaves-stat-icon">
              ✕
            </div>

            <div>
              <span>Rejected</span>
              <strong>{stats.rejected}</strong>
            </div>
          </div>
        </div>

        <div className="hr-leaves-toolbar">
          <div className="hr-leaves-search">
            <SearchBox
              value={search}
              onChange={handleSearch}
              placeholder="Search employee, ID or email..."
            />
          </div>

          <div className="hr-leaves-filters">
            <select
              className="hr-leaves-filter-select"
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(
                  event.target.value
                );
                setPage(1);
              }}
            >
              {STATUS_OPTIONS.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>

            <select
              className="hr-leaves-filter-select"
              value={leaveTypeFilter}
              onChange={(event) => {
                setLeaveTypeFilter(
                  event.target.value
                );
                setPage(1);
              }}
            >
              <option value="ALL">
                All Leave Types
              </option>

              {leaveTypes.map((type) => (
                <option
                  key={type}
                  value={type}
                >
                  {formatText(type)}
                </option>
              ))}
            </select>

            <input
              type="date"
              className="hr-leaves-date-input"
              value={dateFilter}
              onChange={(event) => {
                setDateFilter(
                  event.target.value
                );
                setPage(1);
              }}
            />

            {(search ||
              statusFilter !== "ALL" ||
              leaveTypeFilter !== "ALL" ||
              dateFilter) && (
              <button
                type="button"
                className="hr-leaves-clear-btn"
                onClick={clearFilters}
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="hr-leaves-error">
            <span>{error}</span>

            <button
              type="button"
              onClick={() => loadLeaves()}
            >
              Try Again
            </button>
          </div>
        )}

        <div className="hr-leaves-card">
          <div className="hr-leaves-card-header">
            <div>
              <h2>Leave Requests</h2>

              <p>
                {filteredLeaves.length} request
                {filteredLeaves.length !== 1
                  ? "s"
                  : ""}{" "}
                found
              </p>
            </div>

            {dateFilter && (
              <div className="hr-leaves-selected-date">
                {formatDate(dateFilter)}
              </div>
            )}
          </div>

          {paginatedLeaves.length === 0 ? (
            <div className="hr-leaves-empty">
              <div className="hr-leaves-empty-icon">
                🌴
              </div>

              <h3>
                No leave requests found
              </h3>

              <p>
                Try changing your search or
                filter criteria.
              </p>

              {(search ||
                statusFilter !== "ALL" ||
                leaveTypeFilter !== "ALL" ||
                dateFilter) && (
                <button
                  type="button"
                  className="hr-leaves-empty-clear"
                  onClick={clearFilters}
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="hr-leaves-table-wrapper">
                <table className="hr-leaves-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Leave Type</th>
                      <th>From</th>
                      <th>To</th>
                      <th>Duration</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedLeaves.map(
                      (leave, index) => {
                        const key =
                          leave._id ||
                          leave.id ||
                          `${leave.displayEmployeeId}-${leave.displayStartDate}-${index}`;

                        return (
                          <tr key={key}>
                            <td>
                              <div className="hr-leave-employee">
                                <div className="hr-leave-avatar">
                                  {getInitials(
                                    leave.displayName
                                  )}
                                </div>

                                <div>
                                  <strong>
                                    {
                                      leave.displayName
                                    }
                                  </strong>

                                  <span>
                                    {
                                      leave.displayEmployeeId
                                    }
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td>
                              <span className="hr-leave-type">
                                {formatText(
                                  leave.displayType
                                )}
                              </span>
                            </td>

                            <td>
                              {formatDate(
                                leave.displayStartDate
                              )}
                            </td>

                            <td>
                              {formatDate(
                                leave.displayEndDate
                              )}
                            </td>

                            <td>
                              <span className="hr-leave-duration">
                                {leave.displayDuration}

                                {typeof leave.displayDuration ===
                                  "number" &&
                                  ` day${
                                    leave.displayDuration !==
                                    1
                                      ? "s"
                                      : ""
                                  }`}
                              </span>
                            </td>

                            <td>
                              <Badge
                                variant={getStatusVariant(
                                  leave.displayStatus
                                )}
                              >
                                {formatText(
                                  leave.displayStatus
                                )}
                              </Badge>
                            </td>

                            <td>
                              <button
                                type="button"
                                className="hr-leave-view-btn"
                                onClick={() =>
                                  openDetails(
                                    leave
                                  )
                                }
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="hr-leaves-pagination">
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

        {showDetails && selectedLeave && (
          <Modal
            isOpen={showDetails}
            onClose={closeDetails}
            title="Leave Request Details"
          >
            <div className="hr-leave-details">
              <div className="hr-leave-details-profile">
                <div className="hr-leave-details-avatar">
                  {getInitials(
                    getEmployeeName(
                      selectedLeave
                    )
                  )}
                </div>

                <div>
                  <h3>
                    {getEmployeeName(
                      selectedLeave
                    )}
                  </h3>

                  <p>
                    {getEmployeeId(
                      selectedLeave
                    )}
                  </p>

                  <Badge
                    variant={getStatusVariant(
                      getStatus(selectedLeave)
                    )}
                  >
                    {formatText(
                      getStatus(selectedLeave)
                    )}
                  </Badge>
                </div>
              </div>

              <div className="hr-leave-details-grid">
                <div>
                  <span>Employee ID</span>
                  <strong>
                    {getEmployeeId(
                      selectedLeave
                    )}
                  </strong>
                </div>

                <div>
                  <span>Email</span>
                  <strong>
                    {getEmployeeEmail(
                      selectedLeave
                    )}
                  </strong>
                </div>

                <div>
                  <span>Leave Type</span>
                  <strong>
                    {formatText(
                      getLeaveType(
                        selectedLeave
                      )
                    )}
                  </strong>
                </div>

                <div>
                  <span>Status</span>
                  <strong>
                    {formatText(
                      getStatus(selectedLeave)
                    )}
                  </strong>
                </div>

                <div>
                  <span>Start Date</span>
                  <strong>
                    {formatDate(
                      getStartDate(
                        selectedLeave
                      )
                    )}
                  </strong>
                </div>

                <div>
                  <span>End Date</span>
                  <strong>
                    {formatDate(
                      getEndDate(selectedLeave)
                    )}
                  </strong>
                </div>

                <div>
                  <span>Duration</span>
                  <strong>
                    {getDuration(
                      selectedLeave
                    )}

                    {typeof getDuration(
                      selectedLeave
                    ) === "number" &&
                      ` day${
                        getDuration(
                          selectedLeave
                        ) !== 1
                          ? "s"
                          : ""
                      }`}
                  </strong>
                </div>

                <div>
                  <span>Applied On</span>
                  <strong>
                    {formatDate(
                      selectedLeave.createdAt ||
                        selectedLeave.appliedAt
                    )}
                  </strong>
                </div>

                {selectedLeave.approvedAt && (
                  <div>
                    <span>Approved On</span>
                    <strong>
                      {formatDate(
                        selectedLeave.approvedAt
                      )}
                    </strong>
                  </div>
                )}

                {selectedLeave.rejectedAt && (
                  <div>
                    <span>Rejected On</span>
                    <strong>
                      {formatDate(
                        selectedLeave.rejectedAt
                      )}
                    </strong>
                  </div>
                )}
              </div>

              {selectedLeave.reason && (
                <div className="hr-leave-details-reason">
                  <span>Reason</span>
                  <p>
                    {selectedLeave.reason}
                  </p>
                </div>
              )}

              {selectedLeave.notes && (
                <div className="hr-leave-details-reason">
                  <span>Notes</span>
                  <p>
                    {selectedLeave.notes}
                  </p>
                </div>
              )}

              {selectedLeave.rejectionReason && (
                <div className="hr-leave-details-reason hr-leave-rejection">
                  <span>
                    Rejection Reason
                  </span>

                  <p>
                    {
                      selectedLeave.rejectionReason
                    }
                  </p>
                </div>
              )}

              <div className="hr-leave-details-footer">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={closeDetails}
                >
                  Close
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </MainLayout>
  );
};

export default HrLeavesPage;