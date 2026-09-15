"use client";

import React from "react";
import Button from "../common/Button";
import "./ReportFilters.css";

const ReportFilters = ({
  filters = {},
  employees = [],
  onChange,
  onApply,
  onReset,
  loading = false,
}) => {
  const currentFilters = {
    dateFrom: "",
    dateTo: "",
    employeeId: "",
    status: "",
    ...filters,
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    onChange?.({
      ...currentFilters,
      [name]: value,
    });
  };

  const handleReset = () => {
    onReset?.();
  };

  return (
    <div className="report-filters">
      <div className="report-filters__header">
        <div>
          <h3>Report Filters</h3>
          <p>
            Select the criteria you want to use for this report.
          </p>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="small"
          onClick={handleReset}
          disabled={loading}
        >
          Reset
        </Button>
      </div>

      <div className="report-filters__grid">
        <div className="report-filters__field">
          <label htmlFor="report-date-from">
            From Date
          </label>

          <input
            id="report-date-from"
            name="dateFrom"
            type="date"
            value={currentFilters.dateFrom}
            onChange={handleChange}
          />
        </div>

        <div className="report-filters__field">
          <label htmlFor="report-date-to">To Date</label>

          <input
            id="report-date-to"
            name="dateTo"
            type="date"
            value={currentFilters.dateTo}
            onChange={handleChange}
          />
        </div>

        {employees.length > 0 && (
          <div className="report-filters__field">
            <label htmlFor="report-employee">
              Employee
            </label>

            <select
              id="report-employee"
              name="employeeId"
              value={currentFilters.employeeId}
              onChange={handleChange}
            >
              <option value="">All Employees</option>

              {employees.map((employee) => {
                const id = employee._id || employee.id;

                const name =
                  employee.name ||
                  employee.fullName ||
                  employee.employeeName ||
                  "Employee";

                return (
                  <option key={id} value={id}>
                    {name}
                  </option>
                );
              })}
            </select>
          </div>
        )}

        <div className="report-filters__field">
          <label htmlFor="report-status">Status</label>

          <select
            id="report-status"
            name="status"
            value={currentFilters.status}
            onChange={handleChange}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="success">Success</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="not_interested">
              Not Interested
            </option>
          </select>
        </div>
      </div>

      {onApply && (
        <div className="report-filters__actions">
          <Button
            type="button"
            variant="primary"
            size="small"
            loading={loading}
            disabled={loading}
            onClick={() => onApply(currentFilters)}
          >
            Apply Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default ReportFilters;