"use client";

import React, { forwardRef, useId } from "react";
import "./SearchBox.css";

const SearchBox = forwardRef(
  (
    {
      value = "",
      onChange,
      onSearch,
      placeholder = "Search...",
      disabled = false,
      loading = false,
      size = "medium",
      fullWidth = false,
      leftIcon,
      rightIcon,
      clearable = true,
      onClear,
      className = "",
      id,
      name = "search",
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || `gse-search-${generatedId}`;

    const handleChange = (event) => {
      onChange?.(event);
    };

    const handleKeyDown = (event) => {
      if (event.key === "Enter") {
        onSearch?.(event.target.value);
      }

      if (event.key === "Escape" && clearable && value) {
        onClear?.();
      }
    };

    const handleClear = () => {
      if (disabled || loading) return;

      if (onClear) {
        onClear();
        return;
      }

      onChange?.({
        target: {
          name,
          value: "",
        },
      });
    };

    const searchClasses = [
      "gse-searchbox",
      `gse-searchbox-${size}`,
      fullWidth ? "gse-searchbox-full-width" : "",
      loading ? "gse-searchbox-loading" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={searchClasses}>
        {leftIcon ? (
          <span className="gse-searchbox-left-icon" aria-hidden="true">
            {leftIcon}
          </span>
        ) : (
          <span className="gse-searchbox-default-icon" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </span>
        )}

        <input
          ref={ref}
          id={inputId}
          name={name}
          type="search"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || loading}
          autoComplete="off"
          aria-label={props["aria-label"] || "Search"}
          {...props}
        />

        {loading && (
          <span
            className="gse-searchbox-loader"
            aria-label="Searching"
            role="status"
          />
        )}

        {!loading && clearable && value && (
          <button
            type="button"
            className="gse-searchbox-clear"
            onClick={handleClear}
            disabled={disabled}
            aria-label="Clear search"
            title="Clear search"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        )}

        {!loading && rightIcon && !value && (
          <span className="gse-searchbox-right-icon" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </div>
    );
  }
);

SearchBox.displayName = "SearchBox";

export default SearchBox;