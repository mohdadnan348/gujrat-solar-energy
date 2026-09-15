"use client";

import React from "react";
import "./Loader.css";

const Loader = ({
  size = "medium",
  variant = "spinner",
  text = "",
  fullScreen = false,
  overlay = false,
  className = "",
}) => {
  const loaderClasses = [
    "gse-loader",
    `gse-loader-${size}`,
    `gse-loader-${variant}`,
    fullScreen ? "gse-loader-fullscreen" : "",
    overlay ? "gse-loader-overlay" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={loaderClasses}
      role="status"
      aria-live="polite"
      aria-label={text || "Loading"}
    >
      <div className="gse-loader-spinner">
        <span />
        <span />
        <span />
      </div>

      {text && (
        <span className="gse-loader-text">
          {text}
        </span>
      )}
    </div>
  );
};

export default Loader;