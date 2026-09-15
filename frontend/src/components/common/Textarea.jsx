"use client";

import React, { forwardRef, useId } from "react";
import "./Textarea.css";

const Textarea = forwardRef(
  (
    {
      label,
      name,
      value = "",
      onChange,
      placeholder = "",
      error = "",
      helperText = "",
      required = false,
      disabled = false,
      readOnly = false,
      rows = 4,
      maxLength,
      showCount = false,
      fullWidth = true,
      size = "medium",
      resize = "vertical",
      className = "",
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const textareaId = id || name || generatedId;

    const wrapperClasses = [
      "gse-textarea-wrapper",
      fullWidth ? "gse-textarea-full" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const textareaClasses = [
      "gse-textarea-field",
      `gse-textarea-${size}`,
      `gse-textarea-resize-${resize}`,
      error ? "gse-textarea-error" : "",
    ]
      .filter(Boolean)
      .join(" ");

    const currentLength =
      typeof value === "string" ? value.length : 0;

    return (
      <div className={wrapperClasses}>
        {label && (
          <label
            htmlFor={textareaId}
            className="gse-textarea-label"
          >
            {label}
            {required && (
              <span className="gse-textarea-required">*</span>
            )}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          readOnly={readOnly}
          rows={rows}
          maxLength={maxLength}
          className={textareaClasses}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error
              ? `${textareaId}-error`
              : helperText
                ? `${textareaId}-helper`
                : undefined
          }
          {...props}
        />

        <div className="gse-textarea-footer">
          <div>
            {error ? (
              <p
                id={`${textareaId}-error`}
                className="gse-textarea-message gse-textarea-error-message"
              >
                {error}
              </p>
            ) : helperText ? (
              <p
                id={`${textareaId}-helper`}
                className="gse-textarea-message"
              >
                {helperText}
              </p>
            ) : null}
          </div>

          {showCount && maxLength && (
            <span className="gse-textarea-count">
              {currentLength}/{maxLength}
            </span>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export default Textarea;