"use client";

import React, { forwardRef, useId } from "react";
import "./Select.css";

const Select = forwardRef(
  (
    {
      label,
      name,
      value = "",
      onChange,
      options = [],
      placeholder = "Select an option",
      error = "",
      helperText = "",
      required = false,
      disabled = false,
      fullWidth = true,
      size = "medium",
      className = "",
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const selectId = id || name || generatedId;

    const wrapperClasses = [
      "gse-select-wrapper",
      fullWidth ? "gse-select-full" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const selectClasses = [
      "gse-select-field",
      `gse-select-${size}`,
      error ? "gse-select-error" : "",
      value === "" ? "gse-select-placeholder" : "",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={wrapperClasses}>
        {label && (
          <label htmlFor={selectId} className="gse-select-label">
            {label}
            {required && (
              <span className="gse-select-required">*</span>
            )}
          </label>
        )}

        <div className="gse-select-container">
          <select
            ref={ref}
            id={selectId}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            disabled={disabled}
            className={selectClasses}
            aria-invalid={Boolean(error)}
            aria-describedby={
              error
                ? `${selectId}-error`
                : helperText
                  ? `${selectId}-helper`
                  : undefined
            }
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}

            {options.map((option, index) => {
              const isObject =
                typeof option === "object" && option !== null;

              const optionValue = isObject
                ? option.value
                : option;

              const optionLabel = isObject
                ? option.label
                : option;

              const optionDisabled = isObject
                ? Boolean(option.disabled)
                : false;

              return (
                <option
                  key={`${optionValue}-${index}`}
                  value={optionValue}
                  disabled={optionDisabled}
                >
                  {optionLabel}
                </option>
              );
            })}
          </select>

          <span className="gse-select-arrow" aria-hidden="true">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M6 9L12 15L18 9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>

        {error ? (
          <p
            id={`${selectId}-error`}
            className="gse-select-message gse-select-error-message"
          >
            {error}
          </p>
        ) : helperText ? (
          <p
            id={`${selectId}-helper`}
            className="gse-select-message"
          >
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;