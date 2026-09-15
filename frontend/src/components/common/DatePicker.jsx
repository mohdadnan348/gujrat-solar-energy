"use client";

import React, { forwardRef, useId } from "react";
import "./DatePicker.css";

const DatePicker = forwardRef(
  (
    {
      label,
      name,
      value = "",
      onChange,
      placeholder = "Select date",
      error,
      helperText,
      required = false,
      disabled = false,
      readOnly = false,
      min,
      max,
      size = "medium",
      fullWidth = false,
      className = "",
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || `gse-date-${generatedId}`;
    const messageId = `${inputId}-message`;

    const classes = [
      "gse-datepicker",
      `gse-datepicker-${size}`,
      fullWidth ? "gse-datepicker-full-width" : "",
      error ? "gse-datepicker-error" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={classes}>
        {label && (
          <label htmlFor={inputId} className="gse-datepicker-label">
            {label}
            {required && (
              <span className="gse-datepicker-required" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        <div className="gse-datepicker-input-wrapper">
          <input
            ref={ref}
            id={inputId}
            name={name}
            type="date"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            min={min}
            max={max}
            required={required}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={
              error || helperText ? messageId : undefined
            }
            className="gse-datepicker-input"
            {...props}
          />

          <span
            className="gse-datepicker-icon"
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </span>
        </div>

        {(error || helperText) && (
          <p
            id={messageId}
            className={`gse-datepicker-message ${
              error ? "error" : ""
            }`}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

DatePicker.displayName = "DatePicker";

export default DatePicker;