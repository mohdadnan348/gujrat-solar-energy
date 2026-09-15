"use client";

import React from "react";
import Button from "../common/Button";
import "./TaskFilters.css";

const TaskFilters = ({
  filters = {},
  employees = [],
  onChange,
  onReset,
}) => {
  const currentFilters = {
    search: "",
    status: "",
    priority: "",
    assignedTo: "",
    dueDate: "",
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

  const hasActiveFilters = Object.values(currentFilters).some(
    (value) => value !== "" && value !== null && value !== undefined
  );

  return (
    <div className="task-filters">
      <div className="task-filters__header">
        <div>
          <h3>Task Filters</h3>
          <p>Filter tasks by status, priority, employee, or date.</p>
        </div>

        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            size="small"
            onClick={handleReset}
          >
            Clear Filters
          </Button>
        )}
      </div>

      <div className="task-filters__grid">
        <div className="task-filters__field task-filters__field--search">
          <label htmlFor="task-filter-search">Search</label>

          <div className="task-filters__search">
            <span className="task-filters__search-icon">⌕</span>

            <input
              id="task-filter-search"
              name="search"
              type="search"
              value={currentFilters.search}
              onChange={handleChange}
              placeholder="Search tasks..."
            />
          </div>
        </div>

        <div className="task-filters__field">
          <label htmlFor="task-filter-status">Status</label>

          <select
            id="task-filter-status"
            name="status"
            value={currentFilters.status}
            onChange={handleChange}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="task-filters__field">
          <label htmlFor="task-filter-priority">Priority</label>

          <select
            id="task-filter-priority"
            name="priority"
            value={currentFilters.priority}
            onChange={handleChange}
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <div className="task-filters__field">
          <label htmlFor="task-filter-assigned-to">
            Assigned To
          </label>

          <select
            id="task-filter-assigned-to"
            name="assignedTo"
            value={currentFilters.assignedTo}
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

        <div className="task-filters__field">
          <label htmlFor="task-filter-due-date">Due Date</label>

          <select
            id="task-filter-due-date"
            name="dueDate"
            value={currentFilters.dueDate}
            onChange={handleChange}
          >
            <option value="">Any Date</option>
            <option value="today">Today</option>
            <option value="tomorrow">Tomorrow</option>
            <option value="this_week">This Week</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default TaskFilters;