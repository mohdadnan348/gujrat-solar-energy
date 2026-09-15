"use client";

import React from "react";
import Link from "next/link";
import "./StatCard.css";

const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendLabel,
  trendType = "up",
  href,
  loading = false,
  className = "",
}) => {
  const cardContent = (
    <>
      <div className="gse-stat-card-top">
        <div className="gse-stat-card-title">
          {title}
        </div>

        {icon && (
          <div className="gse-stat-card-icon">
            {icon}
          </div>
        )}
      </div>

      {loading ? (
        <div className="gse-stat-card-loading">
          <span />
          <span />
        </div>
      ) : (
        <>
          <div className="gse-stat-card-value">
            {value ?? 0}
          </div>

          {(subtitle || trend !== undefined) && (
            <div className="gse-stat-card-bottom">
              {subtitle && (
                <span className="gse-stat-card-subtitle">
                  {subtitle}
                </span>
              )}

              {trend !== undefined && trend !== null && (
                <span
                  className={`gse-stat-card-trend gse-stat-card-trend-${trendType}`}
                >
                  {trendType === "up" && "↑"}
                  {trendType === "down" && "↓"}
                  {trendType === "neutral" && "→"}
                  {trend}
                  {trendLabel && (
                    <span className="gse-stat-card-trend-label">
                      {" "}
                      {trendLabel}
                    </span>
                  )}
                </span>
              )}
            </div>
          )}
        </>
      )}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={`gse-stat-card gse-stat-card-link ${className}`}
      >
        {cardContent}
      </Link>
    );
  }

  return (
    <div className={`gse-stat-card ${className}`}>
      {cardContent}
    </div>
  );
};

export default StatCard;