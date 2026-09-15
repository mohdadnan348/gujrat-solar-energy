"use client";

import React from "react";
import "./Button.css";

const Button = ({
  children,
  type = "button",
  variant = "primary",
  size = "medium",
  loading = false,
  disabled = false,
  fullWidth = false,
  icon = null,
  iconPosition = "left",
  onClick,
  className = "",
  title,
  ...props
}) => {
  const isDisabled = disabled || loading;

  const buttonClasses = [
    "gse-button",
    `gse-button-${variant}`,
    `gse-button-${size}`,
    fullWidth ? "gse-button-full" : "",
    loading ? "gse-button-loading" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={isDisabled}
      onClick={onClick}
      title={title}
      {...props}
    >
      {loading ? (
        <>
          <span className="gse-button-spinner" aria-hidden="true" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          {icon && iconPosition === "left" && (
            <span className="gse-button-icon gse-button-icon-left">
              {icon}
            </span>
          )}

          <span className="gse-button-text">{children}</span>

          {icon && iconPosition === "right" && (
            <span className="gse-button-icon gse-button-icon-right">
              {icon}
            </span>
          )}
        </>
      )}
    </button>
  );
};

export default Button;