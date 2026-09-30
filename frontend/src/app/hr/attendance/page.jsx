"use client";

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import SearchBox from "@/components/common/SearchBox";
import Pagination from "@/components/common/Pagination";
import Loader from "@/components/common/Loader";
import Modal from "@/components/common/Modal";

import attendanceService from "@/services/attendance.service";

import "./attendance.css";

const ITEMS_PER_PAGE = 10;

const STATUS_OPTIONS = [
  { value: "ALL", label: "All Status" },
  { value: "Present", label: "Present" },
  { value: "Absent", label: "Absent" },
  { value: "Half Day", label: "Half Day" },
  { value: "Late", label: "Late" },
];

/* =========================================================
   RESPONSE NORMALIZER
========================================================= */

const normalizeResponse = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.attendance)) {
    return response.data.attendance;
  }

  if (Array.isArray(response?.data?.records)) {
    return response.data.records;
  }

  if (Array.isArray(response?.data?.items)) {
    return response.data.items;
  }

  if (Array.isArray(response?.attendance)) {
    return response.attendance;
  }

  if (Array.isArray(response?.records)) {
    return response.records;
  }

  if (Array.isArray(response?.items)) {
    return response.items;
  }

  return [];
};

/* =========================================================
   CHECK EMPLOYEE DATA
========================================================= */

const hasEmployeeData = (record) => {
  const employee =
    record?.employee ||
    record?.employeeDetails ||
    record?.employeeData ||
    record?.employeeProfile ||
    record?.user;

  if (!employee) {
    return false;
  }

  if (typeof employee === "string") {
    return false;
  }

  return Boolean(
    employee?.name ||
      employee?.firstName ||
      employee?.employeeId ||
      employee?.empId ||
      employee?.email
  );
};

/* =========================================================
   HYDRATE ATTENDANCE RECORDS
   If list API does not contain populated employee,
   fetch the individual attendance record.
========================================================= */

const hydrateAttendanceRecords = async (records) => {
  if (!Array.isArray(records) || !records.length) {
    return [];
  }

  const hydrated = await Promise.all(
    records.map(async (record) => {
      if (hasEmployeeData(record)) {
        return record;
      }

      const attendanceId =
        record?._id || record?.id;

      if (!attendanceId) {
        return record;
      }

      try {
        const response =
          await attendanceService.getAttendanceById(
            attendanceId
          );

        const detailedRecord =
          response?.data?.data ||
          response?.data ||
          response;

        if (
          detailedRecord &&
          typeof detailedRecord === "object"
        ) {
          return {
            ...record,
            ...detailedRecord,
          };
        }
      } catch (error) {
        console.error(
          "Failed to load attendance employee details:",
          error
        );
      }

      return record;
    })
  );

  return hydrated;
};

/* =========================================================
   PAGE
========================================================= */

const HrAttendancePage = () => {
  const [attendance, setAttendance] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [dateFilter, setDateFilter] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [selectedRecord, setSelectedRecord] =
    useState(null);

  const [showDetails, setShowDetails] =
    useState(false);

  const [detailsLoading, setDetailsLoading] =
    useState(false);

  /* =====================================================
     SEARCH
  ===================================================== */

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  /* =====================================================
     LOAD ATTENDANCE
  ===================================================== */

  const loadAttendance = async (
    isRefresh = false
  ) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const params = {};

      /*
       * Backend supports attendance date
       * through date filters.
       */
      if (dateFilter) {
        params.startDate = dateFilter;
        params.endDate = dateFilter;
      }

      const response =
        await attendanceService.getAttendance(
          params
        );

      const records =
        normalizeResponse(response);

      /*
       * Make sure employee information is available.
       * Backend getAttendanceById populates employee.
       */
      const hydratedRecords =
        await hydrateAttendanceRecords(
          records
        );

      setAttendance(hydratedRecords);
    } catch (err) {
      console.error(
        "HR attendance loading error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load attendance records."
      );

      setAttendance([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, [dateFilter]);

  /* =====================================================
     EMPLOYEE HELPERS
  ===================================================== */

  const getEmployee = (record) => {
    const employee =
      record?.employee ||
      record?.employeeDetails ||
      record?.employeeData ||
      record?.employeeProfile ||
      record?.user;

    if (employee) {
      return employee;
    }

    /*
     * Some APIs may return employee data directly
     * on attendance record.
     */
    if (
      record?.employeeName ||
      record?.employeeId ||
      record?.empId ||
      record?.employeeEmail
    ) {
      return {
        name: record?.employeeName,
        employeeId:
          record?.employeeId ||
          record?.empId,
        email:
          record?.employeeEmail ||
          record?.email,
        department:
          record?.department,
        designation:
          record?.designation,
      };
    }

    return {};
  };

  const getEmployeeName = (record) => {
    const employee =
      getEmployee(record);

    if (
      typeof employee === "string"
    ) {
      return (
        record?.employeeName ||
        employee
      );
    }

    if (employee?.name) {
      return employee.name;
    }

    const firstName =
      employee?.firstName ||
      record?.firstName ||
      "";

    const lastName =
      employee?.lastName ||
      record?.lastName ||
      "";

    const combinedName =
      `${firstName} ${lastName}`.trim();

    if (combinedName) {
      return combinedName;
    }

    if (record?.employeeName) {
      return record.employeeName;
    }

    if (record?.name) {
      return record.name;
    }

    return "Unknown Employee";
  };

  const getEmployeeId = (record) => {
    const employee =
      getEmployee(record);

    if (
      typeof employee === "string"
    ) {
      return (
        record?.employeeId ||
        record?.empId ||
        "—"
      );
    }

    return (
      employee?.employeeId ||
      employee?.empId ||
      employee?.code ||
      record?.employeeId ||
      record?.empId ||
      "—"
    );
  };

  const getEmail = (record) => {
    const employee =
      getEmployee(record);

    if (
      typeof employee === "string"
    ) {
      return (
        record?.email ||
        record?.employeeEmail ||
        "—"
      );
    }

    return (
      employee?.email ||
      employee?.emailAddress ||
      record?.email ||
      record?.employeeEmail ||
      "—"
    );
  };

  const getMobile = (record) => {
    const employee =
      getEmployee(record);

    if (
      typeof employee === "string"
    ) {
      return (
        record?.mobile ||
        record?.phone ||
        "—"
      );
    }

    return (
      employee?.mobile ||
      employee?.phone ||
      record?.mobile ||
      record?.phone ||
      "—"
    );
  };

  const getDepartment = (record) => {
    const employee =
      getEmployee(record);

    if (
      typeof employee === "string"
    ) {
      return (
        record?.department ||
        "—"
      );
    }

    return (
      employee?.department ||
      record?.department ||
      "—"
    );
  };

  const getDesignation = (record) => {
    const employee =
      getEmployee(record);

    if (
      typeof employee === "string"
    ) {
      return (
        record?.designation ||
        "—"
      );
    }

    return (
      employee?.designation ||
      record?.designation ||
      "—"
    );
  };

  const getProfileImage = (record) => {
    const employee =
      getEmployee(record);

    if (
      typeof employee === "string"
    ) {
      return (
        record?.profileImage ||
        record?.avatar ||
        null
      );
    }

    return (
      employee?.profileImage ||
      employee?.avatar ||
      employee?.photo ||
      employee?.image ||
      record?.profileImage ||
      record?.avatar ||
      null
    );
  };

  /* =====================================================
     ATTENDANCE HELPERS
  ===================================================== */

  const getStatus = (record) => {
    return (
      record?.status ||
      record?.attendanceStatus ||
      "Present"
    );
  };

  const getDate = (record) => {
    return (
      record?.attendanceDate ||
      record?.date ||
      record?.createdAt ||
      null
    );
  };

  const getCheckIn = (record) => {
    return (
      record?.checkIn ||
      record?.checkInTime ||
      record?.inTime ||
      null
    );
  };

  const getCheckOut = (record) => {
    return (
      record?.checkOut ||
      record?.checkOutTime ||
      record?.outTime ||
      null
    );
  };

  const getWorkingHours = (record) => {
    if (
      record?.totalHours !== undefined &&
      record?.totalHours !== null
    ) {
      return record.totalHours;
    }

    if (
      record?.workingHours !== undefined &&
      record?.workingHours !== null
    ) {
      return record.workingHours;
    }

    const checkIn =
      getCheckIn(record);

    const checkOut =
      getCheckOut(record);

    if (!checkIn || !checkOut) {
      return "—";
    }

    const start =
      new Date(checkIn);

    const end =
      new Date(checkOut);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime()) ||
      end <= start
    ) {
      return "—";
    }

    const minutes = Math.round(
      (end.getTime() -
        start.getTime()) /
        60000
    );

    const hours =
      Math.floor(minutes / 60);

    const remainingMinutes =
      minutes % 60;

    return `${hours}h ${remainingMinutes}m`;
  };

  /* =====================================================
     FORMATTERS
  ===================================================== */

  const formatDate = (value) => {
    if (!value) {
      return "—";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "—";
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const formatTime = (value) => {
    if (!value) {
      return "—";
    }

    const date =
      new Date(value);

    if (
      !Number.isNaN(
        date.getTime()
      )
    ) {
      return date.toLocaleTimeString(
        "en-IN",
        {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }
      );
    }

    return String(value);
  };

  const normalizeStatus = (
    status
  ) => {
    return String(status)
      .replace(/_/g, " ")
      .trim()
      .toLowerCase();
  };

  const formatStatus = (
    status
  ) => {
    return String(status)
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(
        /\b\w/g,
        (letter) =>
          letter.toUpperCase()
      );
  };

  const getStatusVariant = (
    status
  ) => {
    const normalized =
      normalizeStatus(status);

    if (
      normalized === "present"
    ) {
      return "success";
    }

    if (
      normalized === "absent"
    ) {
      return "danger";
    }

    if (
      normalized === "late" ||
      normalized === "half day"
    ) {
      return "warning";
    }

    return "secondary";
  };

  /* =====================================================
     NORMALIZED ATTENDANCE
  ===================================================== */

  const normalizedAttendance =
    useMemo(() => {
      return attendance.map(
        (record) => ({
          ...record,

          displayName:
            getEmployeeName(record),

          displayEmployeeId:
            getEmployeeId(record),

          displayEmail:
            getEmail(record),

          displayMobile:
            getMobile(record),

          displayDepartment:
            getDepartment(record),

          displayDesignation:
            getDesignation(record),

          displayProfileImage:
            getProfileImage(record),

          displayStatus:
            getStatus(record),

          displayDate:
            getDate(record),

          displayCheckIn:
            getCheckIn(record),

          displayCheckOut:
            getCheckOut(record),

          displayWorkingHours:
            getWorkingHours(record),
        })
      );
    }, [attendance]);

  /* =====================================================
     FILTERING
  ===================================================== */

  const filteredAttendance =
    useMemo(() => {
      const searchValue =
        search
          .trim()
          .toLowerCase();

      return normalizedAttendance.filter(
        (record) => {
          const employeeId =
            String(
              record.displayEmployeeId ||
                ""
            ).toLowerCase();

          const email =
            String(
              record.displayEmail ||
                ""
            ).toLowerCase();

          const name =
            String(
              record.displayName ||
                ""
            ).toLowerCase();

          const mobile =
            String(
              record.displayMobile ||
                ""
            ).toLowerCase();

          const matchesSearch =
            !searchValue ||
            name.includes(
              searchValue
            ) ||
            employeeId.includes(
              searchValue
            ) ||
            email.includes(
              searchValue
            ) ||
            mobile.includes(
              searchValue
            );

          const matchesStatus =
            statusFilter === "ALL" ||
            normalizeStatus(
              record.displayStatus
            ) ===
              normalizeStatus(
                statusFilter
              );

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      normalizedAttendance,
      search,
      statusFilter,
    ]);

  /* =====================================================
     PAGINATION
  ===================================================== */

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredAttendance.length /
          ITEMS_PER_PAGE
      )
    );

  const currentPage =
    Math.min(
      page,
      totalPages
    );

  const paginatedAttendance =
    useMemo(() => {
      const start =
        (currentPage - 1) *
        ITEMS_PER_PAGE;

      return filteredAttendance.slice(
        start,
        start + ITEMS_PER_PAGE
      );
    }, [
      filteredAttendance,
      currentPage,
    ]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [
    page,
    totalPages,
  ]);

  /* =====================================================
     STATS
  ===================================================== */

  const stats =
    useMemo(() => {
      const total =
        normalizedAttendance.length;

      const present =
        normalizedAttendance.filter(
          (record) =>
            normalizeStatus(
              record.displayStatus
            ) === "present"
        ).length;

      const absent =
        normalizedAttendance.filter(
          (record) =>
            normalizeStatus(
              record.displayStatus
            ) === "absent"
        ).length;

      const late =
        normalizedAttendance.filter(
          (record) =>
            [
              "late",
              "half day",
            ].includes(
              normalizeStatus(
                record.displayStatus
              )
            )
        ).length;

      return {
        total,
        present,
        absent,
        late,
      };
    }, [
      normalizedAttendance,
    ]);

  /* =====================================================
     INITIALS
  ===================================================== */

  const getInitials = (
    name
  ) => {
    const words =
      String(name)
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (!words.length) {
      return "E";
    }

    return words
      .slice(0, 2)
      .map((word) =>
        word
          .charAt(0)
          .toUpperCase()
      )
      .join("");
  };

  /* =====================================================
     DETAILS
  ===================================================== */

  const openDetails = async (
    record
  ) => {
    setSelectedRecord(record);
    setShowDetails(true);

    const attendanceId =
      record?._id ||
      record?.id;

    if (!attendanceId) {
      return;
    }

    /*
     * Always fetch complete attendance detail
     * so employee information is populated.
     */
    try {
      setDetailsLoading(true);

      const response =
        await attendanceService.getAttendanceById(
          attendanceId
        );

      const detailedRecord =
        response?.data?.data ||
        response?.data ||
        response;

      if (
        detailedRecord &&
        typeof detailedRecord ===
          "object"
      ) {
        setSelectedRecord({
          ...record,
          ...detailedRecord,
        });
      }
    } catch (error) {
      console.error(
        "Failed to load attendance details:",
        error
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeDetails = () => {
    setSelectedRecord(null);
    setShowDetails(false);
    setDetailsLoading(false);
  };

  /* =====================================================
     CLEAR FILTERS
  ===================================================== */

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setDateFilter("");
    setPage(1);
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="hr-attendance-loading">
        <Loader />
      </div>
    );
  }

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="hr-attendance-page">

      {/* HEADER */}
      <div className="hr-attendance-header">
        <div>
          <div className="hr-attendance-breadcrumb">
            HR <span>/</span> Attendance
          </div>

          <h1>Attendance</h1>

          <p>
            Monitor employee attendance,
            check-in and check-out records.
          </p>
        </div>

        <Button
          type="button"
          variant="secondary"
          onClick={() =>
            loadAttendance(true)
          }
          disabled={refreshing}
        >
          {refreshing
            ? "Refreshing..."
            : "↻ Refresh"}
        </Button>
      </div>

      {/* STATS */}
      <div className="hr-attendance-stats">

        <div className="hr-attendance-stat-card">
          <div className="hr-attendance-stat-icon">
            📋
          </div>

          <div>
            <span>Total Records</span>
            <strong>
              {stats.total}
            </strong>
          </div>
        </div>

        <div className="hr-attendance-stat-card">
          <div className="hr-attendance-stat-icon">
            ✓
          </div>

          <div>
            <span>Present</span>
            <strong>
              {stats.present}
            </strong>
          </div>
        </div>

        <div className="hr-attendance-stat-card">
          <div className="hr-attendance-stat-icon">
            ✕
          </div>

          <div>
            <span>Absent</span>
            <strong>
              {stats.absent}
            </strong>
          </div>
        </div>

        <div className="hr-attendance-stat-card">
          <div className="hr-attendance-stat-icon">
            ◷
          </div>

          <div>
            <span>Late / Half Day</span>
            <strong>
              {stats.late}
            </strong>
          </div>
        </div>

      </div>

      {/* TOOLBAR */}
      <div className="hr-attendance-toolbar">

        <div className="hr-attendance-search">
          <SearchBox
            value={search}
            onChange={handleSearch}
            placeholder="Search employee, ID or email..."
          />
        </div>

        <div className="hr-attendance-filters">

          <select
            className="hr-attendance-filter-select"
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(
                event.target.value
              );
              setPage(1);
            }}
          >
            {STATUS_OPTIONS.map(
              (option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              )
            )}
          </select>

          <input
            type="date"
            className="hr-attendance-date-input"
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
            dateFilter) && (
            <button
              type="button"
              className="hr-attendance-clear-btn"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          )}

        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="hr-attendance-error">
          <span>{error}</span>

          <button
            type="button"
            onClick={() =>
              loadAttendance()
            }
          >
            Try Again
          </button>
        </div>
      )}

      {/* ATTENDANCE CARD */}
      <div className="hr-attendance-card">

        <div className="hr-attendance-card-header">

          <div>
            <h2>
              Attendance Records
            </h2>

            <p>
              {filteredAttendance.length}{" "}
              record
              {filteredAttendance.length !==
              1
                ? "s"
                : ""}{" "}
              found
            </p>
          </div>

          {dateFilter && (
            <div className="hr-attendance-selected-date">
              {formatDate(
                dateFilter
              )}
            </div>
          )}

        </div>

        {/* EMPTY */}
        {paginatedAttendance.length ===
        0 ? (
          <div className="hr-attendance-empty">

            <div className="hr-attendance-empty-icon">
              📅
            </div>

            <h3>
              No attendance records found
            </h3>

            <p>
              Try changing the search,
              date or status filter.
            </p>

            {(search ||
              statusFilter !==
                "ALL" ||
              dateFilter) && (
              <button
                type="button"
                className="hr-attendance-empty-clear"
                onClick={
                  clearFilters
                }
              >
                Clear Filters
              </button>
            )}

          </div>
        ) : (
          <>
            {/* TABLE */}
            <div className="hr-attendance-table-wrapper">

              <table className="hr-attendance-table">

                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Date</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Working Hours</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>

                  {paginatedAttendance.map(
                    (
                      record,
                      index
                    ) => {

                      const recordKey =
                        record._id ||
                        record.id ||
                        `${record.displayEmployeeId}-${record.displayDate}-${index}`;

                      return (
                        <tr
                          key={
                            recordKey
                          }
                        >

                          {/* EMPLOYEE */}
                          <td>
                            <div className="hr-attendance-employee">

                              <div className="hr-attendance-avatar">

                                {record.displayProfileImage ? (
                                  <img
                                    src={
                                      record.displayProfileImage
                                    }
                                    alt={
                                      record.displayName
                                    }
                                  />
                                ) : (
                                  getInitials(
                                    record.displayName
                                  )
                                )}

                              </div>

                              <div>

                                <strong>
                                  {
                                    record.displayName
                                  }
                                </strong>

                                <span>
                                  {
                                    record.displayEmployeeId
                                  }
                                </span>

                              </div>

                            </div>
                          </td>

                          {/* DATE */}
                          <td>
                            {formatDate(
                              record.displayDate
                            )}
                          </td>

                          {/* CHECK IN */}
                          <td>
                            <span className="hr-attendance-time">
                              {formatTime(
                                record.displayCheckIn
                              )}
                            </span>
                          </td>

                          {/* CHECK OUT */}
                          <td>
                            <span className="hr-attendance-time">
                              {formatTime(
                                record.displayCheckOut
                              )}
                            </span>
                          </td>

                          {/* HOURS */}
                          <td>
                            <span className="hr-attendance-hours">
                              {
                                record.displayWorkingHours
                              }
                            </span>
                          </td>

                          {/* STATUS */}
                          <td>
                            <Badge
                              variant={getStatusVariant(
                                record.displayStatus
                              )}
                            >
                              {formatStatus(
                                record.displayStatus
                              )}
                            </Badge>
                          </td>

                          {/* ACTION */}
                          <td>
                            <button
                              type="button"
                              className="hr-attendance-view-btn"
                              onClick={() =>
                                openDetails(
                                  record
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

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="hr-attendance-pagination">

                <Pagination
                  currentPage={
                    currentPage
                  }
                  totalPages={
                    totalPages
                  }
                  onPageChange={
                    setPage
                  }
                />

              </div>
            )}

          </>
        )}

      </div>

      {/* =================================================
          DETAILS MODAL
      ================================================= */}

      {showDetails &&
        selectedRecord && (
          <Modal
            isOpen={showDetails}
            onClose={
              closeDetails
            }
            title="Attendance Details"
          >

            <div className="hr-attendance-details">

              {detailsLoading ? (
                <div
                  className="hr-attendance-loading"
                  style={{
                    minHeight:
                      "260px",
                  }}
                >
                  <Loader />
                </div>
              ) : (
                <>
                  {/* PROFILE */}
                  <div className="hr-attendance-details-profile">

                    <div className="hr-attendance-details-avatar">

                      {getInitials(
                        getEmployeeName(
                          selectedRecord
                        )
                      )}

                    </div>

                    <div>

                      <h3>
                        {getEmployeeName(
                          selectedRecord
                        )}
                      </h3>

                      <p>
                        {getEmployeeId(
                          selectedRecord
                        )}
                      </p>

                      <Badge
                        variant={getStatusVariant(
                          getStatus(
                            selectedRecord
                          )
                        )}
                      >
                        {formatStatus(
                          getStatus(
                            selectedRecord
                          )
                        )}
                      </Badge>

                    </div>

                  </div>

                  {/* DETAILS GRID */}
                  <div className="hr-attendance-details-grid">

                    <div>
                      <span>
                        Employee ID
                      </span>

                      <strong>
                        {getEmployeeId(
                          selectedRecord
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Email
                      </span>

                      <strong>
                        {getEmail(
                          selectedRecord
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Mobile
                      </span>

                      <strong>
                        {getMobile(
                          selectedRecord
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Department
                      </span>

                      <strong>
                        {getDepartment(
                          selectedRecord
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Designation
                      </span>

                      <strong>
                        {getDesignation(
                          selectedRecord
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Attendance Date
                      </span>

                      <strong>
                        {formatDate(
                          getDate(
                            selectedRecord
                          )
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Status
                      </span>

                      <strong>
                        {formatStatus(
                          getStatus(
                            selectedRecord
                          )
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Check In
                      </span>

                      <strong>
                        {formatTime(
                          getCheckIn(
                            selectedRecord
                          )
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Check Out
                      </span>

                      <strong>
                        {formatTime(
                          getCheckOut(
                            selectedRecord
                          )
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Working Hours
                      </span>

                      <strong>
                        {getWorkingHours(
                          selectedRecord
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Created At
                      </span>

                      <strong>
                        {formatDate(
                          selectedRecord.createdAt
                        )}
                      </strong>
                    </div>

                  </div>

                  {/* NOTES */}
                  {selectedRecord.notes && (
                    <div className="hr-attendance-details-notes">

                      <span>
                        Notes
                      </span>

                      <p>
                        {
                          selectedRecord.notes
                        }
                      </p>

                    </div>
                  )}

                  {/* REMARK */}
                  {selectedRecord.remark && (
                    <div className="hr-attendance-details-notes">

                      <span>
                        Remark
                      </span>

                      <p>
                        {
                          selectedRecord.remark
                        }
                      </p>

                    </div>
                  )}

                  {/* REMARKS */}
                  {selectedRecord.remarks && (
                    <div className="hr-attendance-details-notes">

                      <span>
                        Remarks
                      </span>

                      <p>
                        {
                          selectedRecord.remarks
                        }
                      </p>

                    </div>
                  )}

                  {/* FOOTER */}
                  <div className="hr-attendance-details-footer">

                    <Button
                      type="button"
                      variant="secondary"
                      onClick={
                        closeDetails
                      }
                    >
                      Close
                    </Button>

                  </div>

                </>
              )}

            </div>

          </Modal>
        )}

    </div>
  );
};

export default HrAttendancePage;