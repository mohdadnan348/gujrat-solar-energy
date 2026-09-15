"use client";

import React, { useMemo } from "react";
import "./ReportChart.css";

const ReportChart = ({
  data = [],
  title = "Report Overview",
  type = "bar",
  labelKey = "label",
  valueKey = "value",
  height = 300,
  emptyMessage = "No chart data available.",
  showValues = true,
}) => {
  const chartData = useMemo(() => {
    if (!Array.isArray(data)) return [];

    return data
      .map((item) => ({
        label: item?.[labelKey] ?? "Unknown",
        value: Number(item?.[valueKey]) || 0,
      }))
      .slice(0, 12);
  }, [data, labelKey, valueKey]);

  const maxValue = useMemo(() => {
    if (!chartData.length) return 1;

    return Math.max(...chartData.map((item) => item.value), 1);
  }, [chartData]);

  const totalValue = useMemo(
    () =>
      chartData.reduce(
        (total, item) => total + item.value,
        0
      ),
    [chartData]
  );

  const isLineChart = type === "line";
  const isDonutChart = type === "donut";

  const points = useMemo(() => {
    if (!chartData.length) return "";

    const width = 100;
    const chartHeight = 100;

    return chartData
      .map((item, index) => {
        const x =
          chartData.length === 1
            ? width / 2
            : (index / (chartData.length - 1)) * width;

        const y =
          chartHeight -
          (item.value / maxValue) * chartHeight;

        return `${x},${y}`;
      })
      .join(" ");
  }, [chartData, maxValue]);

  const getBarHeight = (value) =>
    `${Math.max((value / maxValue) * 100, value > 0 ? 3 : 0)}%`;

  const getPercentage = (value) =>
    totalValue > 0
      ? Math.round((value / totalValue) * 100)
      : 0;

  if (!chartData.length) {
    return (
      <div className="report-chart">
        <div className="report-chart__header">
          <h3>{title}</h3>
        </div>

        <div
          className="report-chart__empty"
          style={{ minHeight: height }}
        >
          <div className="report-chart__empty-icon">
            —
          </div>

          <strong>No Data Available</strong>
          <p>{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="report-chart">
      <div className="report-chart__header">
        <div>
          <h3>{title}</h3>
          <span>
            Total:{" "}
            {totalValue.toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      <div
        className={`report-chart__body report-chart__body--${type}`}
        style={{ minHeight: height }}
      >
        {isDonutChart ? (
          <>
            <div
              className="report-chart__donut"
              style={{
                background: `conic-gradient(
                  #16a34a 0deg,
                  #16a34a 360deg
                )`,
              }}
            >
              <div className="report-chart__donut-center">
                <strong>{totalValue}</strong>
                <span>Total</span>
              </div>
            </div>

            <div className="report-chart__legend">
              {chartData.map((item, index) => (
                <div
                  className="report-chart__legend-item"
                  key={`${item.label}-${index}`}
                >
                  <span className="report-chart__legend-dot" />
                  <span className="report-chart__legend-label">
                    {item.label}
                  </span>
                  <strong>
                    {getPercentage(item.value)}%
                  </strong>
                </div>
              ))}
            </div>
          </>
        ) : isLineChart ? (
          <div className="report-chart__line-wrapper">
            <div className="report-chart__grid-lines">
              <span />
              <span />
              <span />
              <span />
            </div>

            <svg
              className="report-chart__line-svg"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              role="img"
              aria-label={title}
            >
              <polyline
                points={points}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />

              {chartData.map((item, index) => {
                const x =
                  chartData.length === 1
                    ? 50
                    : (index /
                        (chartData.length - 1)) *
                      100;

                const y =
                  100 -
                  (item.value / maxValue) * 100;

                return (
                  <circle
                    key={`${item.label}-${index}`}
                    cx={x}
                    cy={y}
                    r="2"
                    fill="currentColor"
                    vectorEffect="non-scaling-stroke"
                  />
                );
              })}
            </svg>

            <div className="report-chart__x-axis">
              {chartData.map((item, index) => (
                <span key={`${item.label}-${index}`}>
                  {item.label}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="report-chart__bar-chart">
            <div className="report-chart__y-axis">
              <span>{maxValue}</span>
              <span>{Math.round(maxValue * 0.75)}</span>
              <span>{Math.round(maxValue * 0.5)}</span>
              <span>{Math.round(maxValue * 0.25)}</span>
              <span>0</span>
            </div>

            <div className="report-chart__bars">
              {chartData.map((item, index) => (
                <div
                  className="report-chart__bar-group"
                  key={`${item.label}-${index}`}
                >
                  <div className="report-chart__bar-area">
                    {showValues && (
                      <span className="report-chart__bar-value">
                        {item.value.toLocaleString("en-IN")}
                      </span>
                    )}

                    <div
                      className="report-chart__bar"
                      style={{
                        height: getBarHeight(item.value),
                      }}
                      title={`${item.label}: ${item.value}`}
                    />
                  </div>

                  <span className="report-chart__bar-label">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportChart;