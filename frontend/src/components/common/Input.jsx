"use client";

import React, { forwardRef, useId } from "react";
import "./Input.css";

const Input = forwardRef(
  (
    {
      label,
      name,
      type = "text",
      value = "",
      onChange,
      placeholder = "",
      error = "",
      helperText = "",
      required = false,
      disabled = false,
      readOnly = false,
      fullWidth = true,
      size = "medium",
      leftIcon = null,
      rightIcon = null,
      className = "",
      id,
      min,
      max,
      step,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || name || generatedId;

    const wrapperClasses = [
      "gse-input-wrapper",
      fullWidth ? "gse-input-full" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const inputClasses = [
      "gse-input-field",
      `gse-input-${size}`,
      leftIcon ? "gse-input-with-left-icon" : "",
      rightIcon ? "gse-input-with-right-icon" : "",
      error ? "gse-input-error" : "",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={wrapperClasses}>
        {label && (
          <label htmlFor={inputId} className="gse-input-label">
            {label}
            {required && <span className="gse-input-required">*</span>}
          </label>
        )}

        <div className="gse-input-container">
          {leftIcon && (
            <span className="gse-input-icon gse-input-icon-left">
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            readOnly={readOnly}
            min={min}
            max={max}
            step={step}
            className={inputClasses}
            aria-invalid={Boolean(error)}
            aria-describedby={
              error
                ? `${inputId}-error`
                : helperText
                  ? `${inputId}-helper`
                  : undefined
            }
            {...props}
          />

          {rightIcon && (
            <span className="gse-input-icon gse-input-icon-right">
              {rightIcon}
            </span>
          )}
        </div>

        {error ? (
          <p
            id={`${inputId}-error`}
            className="gse-input-message gse-input-error-message"
          >
            {error}
          </p>
        ) : helperText ? (
          <p
            id={`${inputId}-helper`}
            className="gse-input-message"
          >
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;