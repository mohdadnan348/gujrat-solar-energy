"use client";

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import Button from "@/components/common/Button";
import SearchBox from "@/components/common/SearchBox";
import Select from "@/components/common/Select";
import Badge from "@/components/common/Badge";
import Pagination from "@/components/common/Pagination";
import Loader from "@/components/common/Loader";

import leadService from "@/services/lead.service";

import "./leads.css";

const ITEMS_PER_PAGE = 10;

const STATUS_OPTIONS = [
  {
    value: "",
    label: "All Statuses",
  },
  {
    value: "NEW",
    label: "New",
  },
  {
    value: "ASSIGNED",
    label: "Assigned",
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
    value: "SITE_VISIT",
    label: "Site Visit",
  },
  {
    value: "QUOTATION",
    label: "Quotation",
  },
  {
    value: "WON",
    label: "Won",
  },
  {
    value: "LOST",
    label: "Lost",
  },
];

const ManagerLeadsPage = () => {
  const router = useRouter();

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");
  const [status, setStatus] =
    useState("");
  const [page, setPage] =
    useState(1);

  /* =====================================================
     LOAD LEADS
  ===================================================== */

  const loadLeads = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await leadService.getLeads();

      const items =
        response?.data?.leads ||
        response?.data?.items ||
        response?.leads ||
        response?.items ||
        response?.data ||
        [];

      setLeads(
        Array.isArray(items)
          ? items
          : []
      );
    } catch (err) {
      console.error(
        "Failed to load manager leads:",
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
    loadLeads();
  }, []);

  /* =====================================================
     RESET PAGE WHEN FILTER CHANGES
  ===================================================== */

  useEffect(() => {
    setPage(1);
  }, [search, status]);

  /* =====================================================
     HELPERS
  ===================================================== */

  const getLeadName = (
    lead
  ) =>
    lead?.customerName ||
    lead?.name ||
    lead?.fullName ||
    lead?.customer?.name ||
    "Unnamed Lead";

  const getLeadNumber = (
    lead
  ) =>
    lead?.leadNumber ||
    lead?.leadNo ||
    lead?.referenceNumber ||
    lead?.leadId ||
    lead?._id ||
    "—";

  const getPhone = (
    lead
  ) =>
    lead?.mobile ||
    lead?.phone ||
    lead?.contactNumber ||
    "—";

  const getEmail = (
    lead
  ) =>
    lead?.email ||
    lead?.customer?.email ||
    "—";

  const getStatus = (
    lead
  ) =>
    String(
      lead?.status ||
        lead?.leadStatus ||
        "NEW"
    ).toUpperCase();

  const getSource = (
    lead
  ) =>
    String(
      lead?.leadSource ||
        lead?.source ||
        "OTHER"
    ).toUpperCase();

  const getAssignedEmployee = (
    lead
  ) => {
    const assigned =
      lead?.assignedTo ||
      lead?.assignedEmployee ||
      lead?.employee;

    if (!assigned) {
      return "Unassigned";
    }

    if (
      typeof assigned ===
      "string"
    ) {
      return "Assigned";
    }

    return (
      assigned?.name ||
      assigned?.fullName ||
      assigned?.employeeName ||
      "Assigned"
    );
  };

  const getStatusVariant = (
    value
  ) => {
    const statusValue =
      String(value).toUpperCase();

    switch (statusValue) {
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

  const formatLabel = (
    value
  ) =>
    String(value || "")
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(
        /\b\w/g,
        (letter) =>
          letter.toUpperCase()
      );

  const formatDate = (
    value
  ) => {
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

  /* =====================================================
     FILTER LEADS
  ===================================================== */

  const filteredLeads =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return leads.filter(
        (lead) => {
          const leadStatus =
            getStatus(lead);

          const searchableText = [
            getLeadNumber(lead),
            getLeadName(lead),
            getPhone(lead),
            getEmail(lead),
            lead?.city,
            lead?.state,
            lead?.address,
            getSource(lead),
            getAssignedEmployee(
              lead
            ),
          ]
            .filter(Boolean)
            .map((value) =>
              typeof value ===
              "object"
                ? JSON.stringify(
                    value
                  )
                : String(value)
            )
            .join(" ")
            .toLowerCase();

          const matchesSearch =
            !query ||
            searchableText.includes(
              query
            );

          const matchesStatus =
            !status ||
            leadStatus === status;

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      leads,
      search,
      status,
    ]);

  /* =====================================================
     PAGINATION
  ===================================================== */

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredLeads.length /
          ITEMS_PER_PAGE
      )
    );

  const currentPage =
    Math.min(
      page,
      totalPages
    );

  const paginatedLeads =
    useMemo(() => {
      const start =
        (currentPage - 1) *
        ITEMS_PER_PAGE;

      return filteredLeads.slice(
        start,
        start +
          ITEMS_PER_PAGE
      );
    }, [
      filteredLeads,
      currentPage,
    ]);

  useEffect(() => {
    if (
      page > totalPages
    ) {
      setPage(
        totalPages
      );
    }
  }, [
    page,
    totalPages,
  ]);

  /* =====================================================
     SUMMARY
  ===================================================== */

  const summary =
    useMemo(() => {
      const getCount =
        (targetStatus) =>
          filteredLeads.filter(
            (lead) =>
              getStatus(lead) ===
              targetStatus
          ).length;

      return {
        total:
          filteredLeads.length,

        newLeads:
          getCount("NEW"),

        qualified:
          getCount(
            "QUALIFIED"
          ),

        won:
          getCount("WON"),
      };
    }, [
      filteredLeads,
    ]);

  /* =====================================================
     CREATE LEAD
  ===================================================== */

  const handleCreateLead =
    () => {
      router.push(
        "/manager/leads/create"
      );
    };

  /* =====================================================
     VIEW LEAD
  ===================================================== */

  const handleViewLead = (
    lead
  ) => {
    const id =
      lead?._id ||
      lead?.id;

    if (!id) {
      return;
    }

    router.push(
      `/manager/leads/${id}`
    );
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="manager-leads-loading">
        <Loader />
      </div>
    );
  }

  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <div className="manager-leads-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="manager-leads-header">

        <div>

          <span className="manager-leads-eyebrow">
            Manager Portal
          </span>

          <h1>
            Leads
          </h1>

          <p>
            Monitor and manage all
            leads assigned across
            your team.
          </p>

        </div>

        <div
          style={{
            display: "flex",
            alignItems:
              "center",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >

          <Button
            type="button"
            onClick={
              handleCreateLead
            }
          >
            + Create Lead
          </Button>

          <Button
            type="button"
            variant="secondary"
            onClick={
              loadLeads
            }
            disabled={
              loading
            }
          >
            Refresh
          </Button>

        </div>

      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="manager-leads-error">

          <span>
            {error}
          </span>

          <Button
            type="button"
            variant="secondary"
            onClick={
              loadLeads
            }
          >
            Retry
          </Button>

        </div>
      )}

      {/* =================================================
          TOOLBAR
      ================================================= */}

      <div className="manager-leads-toolbar">

        <SearchBox
          value={search}
          onChange={
            setSearch
          }
          placeholder="Search leads..."
        />

        <Select
          value={status}
          onChange={(
            event
          ) =>
            setStatus(
              event.target.value
            )
          }
          options={
            STATUS_OPTIONS
          }
        />

      </div>

      {/* =================================================
          SUMMARY
      ================================================= */}

      <div className="manager-leads-summary">

        <div>
          <strong>
            {summary.total}
          </strong>

          <span>
            Total Leads
          </span>
        </div>

        <div>
          <strong>
            {summary.newLeads}
          </strong>

          <span>
            New
          </span>
        </div>

        <div>
          <strong>
            {summary.qualified}
          </strong>

          <span>
            Qualified
          </span>
        </div>

        <div>
          <strong>
            {summary.won}
          </strong>

          <span>
            Won
          </span>
        </div>

      </div>

      {/* =================================================
          LEADS TABLE
      ================================================= */}

      <div className="manager-leads-card">

        {paginatedLeads.length ===
        0 ? (

          <div className="manager-leads-empty">

            <div className="manager-leads-empty-icon">
              L
            </div>

            <h3>
              No leads found
            </h3>

            <p>
              {search ||
              status
                ? "Try changing your search or filters."
                : "There are no leads available yet."}
            </p>

            {!search &&
              !status && (
                <div
                  style={{
                    marginTop:
                      "18px",
                  }}
                >
                  <Button
                    type="button"
                    onClick={
                      handleCreateLead
                    }
                  >
                    + Create First Lead
                  </Button>
                </div>
              )}

          </div>

        ) : (

          <>

            <div className="manager-leads-table-wrapper">

              <table className="manager-leads-table">

                <thead>

                  <tr>

                    <th>
                      Lead No.
                    </th>

                    <th>
                      Customer
                    </th>

                    <th>
                      Contact
                    </th>

                    <th>
                      Location
                    </th>

                    <th>
                      Assigned To
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Created
                    </th>

                    <th>
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {paginatedLeads.map(
                    (
                      lead,
                      index
                    ) => {

                      const id =
                        lead?._id ||
                        lead?.id ||
                        index;

                      const leadStatus =
                        getStatus(
                          lead
                        );

                      const assignedEmployee =
                        getAssignedEmployee(
                          lead
                        );

                      return (
                        <tr
                          key={id}
                        >

                          <td>

                            <span className="manager-lead-number">
                              {getLeadNumber(
                                lead
                              )}
                            </span>

                          </td>

                          <td>

                            <div className="manager-lead-customer">
                              {getLeadName(
                                lead
                              )}
                            </div>

                            {getEmail(
                              lead
                            ) !==
                              "—" && (
                              <div className="manager-lead-email">
                                {getEmail(
                                  lead
                                )}
                              </div>
                            )}

                          </td>

                          <td>
                            {getPhone(
                              lead
                            )}
                          </td>

                          <td>

                            {[
                              lead?.city,
                              lead?.state,
                            ]
                              .filter(
                                Boolean
                              )
                              .join(
                                ", "
                              ) ||
                              "—"}

                          </td>

                          <td>

                            <span
                              className={
                                assignedEmployee ===
                                "Unassigned"
                                  ? "manager-lead-unassigned"
                                  : "manager-lead-assigned"
                              }
                            >
                              {
                                assignedEmployee
                              }
                            </span>

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

            {/* =================================================
                FOOTER
            ================================================= */}

            <div className="manager-leads-footer">

              <span>

                Showing{" "}

                {filteredLeads.length ===
                0
                  ? 0
                  : (currentPage -
                      1) *
                      ITEMS_PER_PAGE +
                    1}

                {" - "}

                {Math.min(
                  currentPage *
                    ITEMS_PER_PAGE,
                  filteredLeads.length
                )}

                {" of "}

                {filteredLeads.length}

                {" leads"}

              </span>

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

          </>

        )}

      </div>

    </div>
  );
};

export default ManagerLeadsPage;