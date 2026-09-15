"use client";

import React, { useEffect, useMemo, useState } from "react";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import {
  LEAD_STATUS_LABELS,
  LEAD_PRIORITY_LABELS,
  LEAD_SOURCES,
  DATE_FILTERS,
  DATE_FILTER_LABELS,
} from "@/utils/constants";

const LeadFilters = ({
  filters = {},
  onChange,
  onApply,
  onReset,
  loading = false,
  showDateFilter = true,
  showSearch = true,
  compact = false,
}) => {
  const defaultFilters = useMemo(
    () => ({
      search: "",
      status: "",
      priority: "",
      source: "",
      assignedTo: "",
      dateFilter: "",
      dateFrom: "",
      dateTo: "",
      city: "",
    }),
    []
  );

  const [localFilters, setLocalFilters] = useState({
    ...defaultFilters,
    ...filters,
  });

  useEffect(() => {
    setLocalFilters({
      ...defaultFilters,
      ...filters,
    });
  }, [filters, defaultFilters]);

  const statusOptions = useMemo(
    () => [
      { value: "", label: "All Statuses" },
      ...Object.entries(
        LEAD_STATUS_LABELS || {}
      ).map(([value, label]) => ({
        value,
        label,
      })),
    ],
    []
  );

  const priorityOptions = useMemo(
    () => [
      { value: "", label: "All Priorities" },
      ...Object.entries(
        LEAD_PRIORITY_LABELS || {}
      ).map(([value, label]) => ({
        value,
        label,
      })),
    ],
    []
  );

  const sourceOptions = useMemo(() => {
    let options = [];

    if (Array.isArray(LEAD_SOURCES)) {
      options = LEAD_SOURCES.map((source) => ({
        value:
          typeof source === "string"
            ? source
            : source?.value,
        label:
          typeof source === "string"
            ? source
            : source?.label,
      }));
    } else if (
      LEAD_SOURCES &&
      typeof LEAD_SOURCES === "object"
    ) {
      options = Object.entries(
        LEAD_SOURCES
      ).map(([value, label]) => ({
        value,
        label,
      }));
    }

    return [
      { value: "", label: "All Sources" },
      ...options.filter(
        (option) => option.value
      ),
    ];
  }, []);

  const dateOptions = useMemo(() => {
    if (
      DATE_FILTER_LABELS &&
      typeof DATE_FILTER_LABELS === "object"
    ) {
      return [
        {
          value: "",
          label: "All Dates",
        },
        ...Object.entries(
          DATE_FILTER_LABELS
        ).map(([value, label]) => ({
          value,
          label,
        })),
      ];
    }

    if (
      DATE_FILTERS &&
      typeof DATE_FILTERS === "object"
    ) {
      return [
        {
          value: "",
          label: "All Dates",
        },
        ...Object.entries(DATE_FILTERS).map(
          ([value, label]) => ({
            value,
            label:
              typeof label === "string"
                ? label
                : value,
          })
        ),
      ];
    }

    return [
      { value: "", label: "All Dates" },
      { value: "TODAY", label: "Today" },
      {
        value: "YESTERDAY",
        label: "Yesterday",
      },
      {
        value: "THIS_WEEK",
        label: "This Week",
      },
      {
        value: "THIS_MONTH",
        label: "This Month",
      },
      {
        value: "CUSTOM",
        label: "Custom Range",
      },
    ];
  }, []);

  const hasActiveFilters = useMemo(() => {
    return Object.entries(localFilters).some(
      ([key, value]) => {
        if (
          key === "dateFrom" ||
          key === "dateTo"
        ) {
          return Boolean(value);
        }

        return (
          value !== undefined &&
          value !== null &&
          value !== ""
        );
      }
    );
  }, [localFilters]);

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    const updatedFilters = {
      ...localFilters,
      [name]: value,
    };

    if (
      name === "dateFilter" &&
      value !== "CUSTOM"
    ) {
      updatedFilters.dateFrom = "";
      updatedFilters.dateTo = "";
    }

    setLocalFilters(updatedFilters);

    if (typeof onChange === "function") {
      onChange(updatedFilters);
    }
  };

  const handleApply = () => {
    if (typeof onApply === "function") {
      onApply(localFilters);
    } else if (
      typeof onChange === "function"
    ) {
      onChange(localFilters);
    }
  };

  const handleReset = () => {
    setLocalFilters(defaultFilters);

    if (typeof onReset === "function") {
      onReset(defaultFilters);
      return;
    }

    if (typeof onChange === "function") {
      onChange(defaultFilters);
    }
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === "Enter") {
      handleApply();
    }
  };

  return (
    <div
      className={`lead-filters ${
        compact ? "lead-filters-compact" : ""
      }`}
    >
      <div className="lead-filters-row">
        {showSearch && (
          <div className="lead-filter-search">
            <Input
              label="Search"
              name="search"
              value={localFilters.search}
              onChange={handleChange}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search by name, phone, email, or lead ID"
              disabled={loading}
            />
          </div>
        )}

        <div className="lead-filter-field">
          <Select
            label="Status"
            name="status"
            value={localFilters.status}
            onChange={handleChange}
            options={statusOptions}
            disabled={loading}
          />
        </div>

        <div className="lead-filter-field">
          <Select
            label="Priority"
            name="priority"
            value={localFilters.priority}
            onChange={handleChange}
            options={priorityOptions}
            disabled={loading}
          />
        </div>

        <div className="lead-filter-field">
          <Select
            label="Source"
            name="source"
            value={localFilters.source}
            onChange={handleChange}
            options={sourceOptions}
            disabled={loading}
          />
        </div>

        <div className="lead-filter-field">
          <Input
            label="City"
            name="city"
            value={localFilters.city}
            onChange={handleChange}
            placeholder="Enter city"
            disabled={loading}
          />
        </div>

        {showDateFilter && (
          <div className="lead-filter-field">
            <Select
              label="Date"
              name="dateFilter"
              value={localFilters.dateFilter}
              onChange={handleChange}
              options={dateOptions}
              disabled={loading}
            />
          </div>
        )}
      </div>

      {showDateFilter &&
        localFilters.dateFilter ===
          "CUSTOM" && (
          <div className="lead-filters-custom-date">
            <div className="lead-filter-field">
              <Input
                label="From Date"
                name="dateFrom"
                type="date"
                value={localFilters.dateFrom}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="lead-filter-field">
              <Input
                label="To Date"
                name="dateTo"
                type="date"
                value={localFilters.dateTo}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>
        )}

      <div className="lead-filters-actions">
        <Button
          type="button"
          variant="primary"
          onClick={handleApply}
          disabled={loading}
        >
          {loading ? "Applying..." : "Apply Filters"}
        </Button>

        {hasActiveFilters && (
          <Button
            type="button"
            variant="secondary"
            onClick={handleReset}
            disabled={loading}
          >
            Reset
          </Button>
        )}
      </div>
    </div>
  );
};

export default LeadFilters;