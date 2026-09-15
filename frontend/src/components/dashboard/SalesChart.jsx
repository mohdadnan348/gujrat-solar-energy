"use client";

import React, { useMemo } from "react";
import "./SalesChart.css";

const SalesChart = ({
  data = [],
  title = "Sales Overview",
  subtitle = "Sales performance over time",
  loading = false,
  height = 280,
  currency = "₹",
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
      value: Number(
        item?.value ??
          item?.amount ??
          item?.sales ??
          item?.total ??
          0
      ),
    }));
  }, [data]);

  const maxValue = useMemo(() => {
    if (!chartData.length) return 1;

    return Math.max(
      ...chartData.map((item) => item.value),
      1
    );
  }, [chartData]);

  const totalSales = useMemo(() => {
    return chartData.reduce(
      (sum, item) => sum + item.value,
      0
    );
  }, [chartData]);

  const formatCurrency = (value) => {
    if (value >= 10000000) {
      return `${currency}${(value / 10000000).toFixed(1)}Cr`;
    }

    if (value >= 100000) {
      return `${currency}${(value / 100000).toFixed(1)}L`;
    }

    if (value >= 1000) {
      return `${currency}${(value / 1000).toFixed(1)}K`;
    }

    return `${currency}${value.toLocaleString("en-IN")}`;
  };

  if (loading) {
    return (
      <div className="gse-sales-chart">
        <div className="gse-sales-chart-header">
          <div>
            <h3>Sales Overview</h3>
            <p>Sales performance over time</p>
          </div>
        </div>

        <div
          className="gse-sales-chart-loading"
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
    <div className="gse-sales-chart">
      <div className="gse-sales-chart-header">
        <div>
          <h3>{title}</h3>

          {subtitle && (
            <p>{subtitle}</p>
          )}
        </div>

        <div className="gse-sales-chart-total">
          <span>Total Sales</span>

          <strong>
            {formatCurrency(totalSales)}
          </strong>
        </div>
      </div>

      {chartData.length === 0 ? (
        <div
          className="gse-sales-chart-empty"
          style={{ minHeight: `${height}px` }}
        >
          <div className="gse-sales-chart-empty-icon">
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

          <strong>
            No sales data available
          </strong>

          <span>
            Sales statistics will appear here.
          </span>
        </div>
      ) : (
        <div
          className="gse-sales-chart-body"
          style={{ minHeight: `${height}px` }}
        >
          <div className="gse-sales-chart-grid">
            <span />
            <span />
            <span />
            <span />
          </div>

          <div className="gse-sales-chart-bars">
            {chartData.map((item, index) => {
              const percentage = Math.max(
                (item.value / maxValue) * 100,
                item.value > 0 ? 4 : 0
              );

              return (
                <div
                  className="gse-sales-chart-bar-wrapper"
                  key={`${item.label}-${index}`}
                >
                  <div className="gse-sales-chart-bar-value">
                    {formatCurrency(item.value)}
                  </div>

                  <div className="gse-sales-chart-bar-track">
                    <div
                      className="gse-sales-chart-bar"
                      style={{
                        height: `${percentage}%`,
                      }}
                      title={`${item.label}: ${formatCurrency(
                        item.value
                      )}`}
                    />
                  </div>

                  <span className="gse-sales-chart-label">
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

export default SalesChart;