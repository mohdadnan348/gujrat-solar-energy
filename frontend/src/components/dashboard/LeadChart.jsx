"use client";

import React, { useMemo } from "react";
import "./LeadChart.css";

const LeadChart = ({
  data = [],
  title = "Lead Overview",
  subtitle = "Lead performance over time",
  loading = false,
  height = 280,
}) => {
  const chartData = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }

    return data.map((item, index) => ({
      label:
        item?.label ??
        item?.name ??
        item?.date ??
        `Item ${index + 1}`,
      value: Number(item?.value ?? item?.count ?? item?.total ?? 0),
    }));
  }, [data]);

  const maxValue = useMemo(() => {
    if (!chartData.length) return 1;

    return Math.max(...chartData.map((item) => item.value), 1);
  }, [chartData]);

  if (loading) {
    return (
      <div className="gse-lead-chart">
        <div className="gse-lead-chart-header">
          <div>
            <h3>Lead Overview</h3>
            <p>Lead performance over time</p>
          </div>
        </div>

        <div
          className="gse-lead-chart-loading"
          style={{ minHeight: `${height}px` }}
        >
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
      </div>
    );
  }

  return (
    <div className="gse-lead-chart">
      <div className="gse-lead-chart-header">
        <div>
          <h3>{title}</h3>
          {subtitle && <p>{subtitle}</p>}
        </div>

        <div className="gse-lead-chart-total">
          <span>Total</span>
          <strong>
            {chartData.reduce((sum, item) => sum + item.value, 0)}
          </strong>
        </div>
      </div>

      {chartData.length === 0 ? (
        <div
          className="gse-lead-chart-empty"
          style={{ minHeight: `${height}px` }}
        >
          <div className="gse-lead-chart-empty-icon">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 3v18h18" />
              <path d="m7 16 4-5 3 3 5-7" />
            </svg>
          </div>

          <strong>No lead data available</strong>
          <span>Lead statistics will appear here.</span>
        </div>
      ) : (
        <div
          className="gse-lead-chart-body"
          style={{ minHeight: `${height}px` }}
        >
          <div className="gse-lead-chart-grid">
            <span />
            <span />
            <span />
            <span />
          </div>

          <div className="gse-lead-chart-bars">
            {chartData.map((item, index) => {
              const percentage = Math.max(
                (item.value / maxValue) * 100,
                item.value > 0 ? 4 : 0
              );

              return (
                <div
                  className="gse-lead-chart-bar-wrapper"
                  key={`${item.label}-${index}`}
                >
                  <div className="gse-lead-chart-bar-value">
                    {item.value}
                  </div>

                  <div className="gse-lead-chart-bar-track">
                    <div
                      className="gse-lead-chart-bar"
                      style={{ height: `${percentage}%` }}
                      title={`${item.label}: ${item.value}`}
                    />
                  </div>

                  <span className="gse-lead-chart-label">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadChart;