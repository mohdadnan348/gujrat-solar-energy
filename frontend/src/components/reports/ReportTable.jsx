"use client";

import React from "react";
import Badge from "../common/Badge";
import "./ReportTable.css";

const ReportTable = ({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = "No report data available.",
  rowKey,
}) => {
  const getValue = (row, key) => {
    if (!key) return "";

    return key.split(".").reduce((value, part) => {
      return value?.[part];
    }, row);
  };

  const renderCell = (column, row, index) => {
    const value = getValue(row, column.key);

    if (typeof column.render === "function") {
      return column.render(value, row, index);
    }

    if (column.type === "status") {
      return (
        <Badge
          variant={
            String(value || "").toLowerCase() === "completed"
              ? "success"
              : String(value || "").toLowerCase() === "pending"
                ? "warning"
                : "default"
          }
          size="small"
        >
          {String(value || "Unknown")
            .replace(/_/g, " ")
            .replace(/\b\w/g, (char) => char.toUpperCase())}
        </Badge>
      );
    }

    if (column.type === "currency") {
      return `₹${Number(value || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }

    if (column.type === "number") {
      return Number(value || 0).toLocaleString("en-IN");
    }

    if (column.type === "date" && value) {
      const date = new Date(value);

      if (!Number.isNaN(date.getTime())) {
        return date.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      }
    }

    return value === null ||
      value === undefined ||
      value === ""
      ? "—"
      : String(value);
  };

  if (loading) {
    return (
      <div className="report-table report-table--loading">
        <div className="report-table__spinner" />
        <span>Loading report data...</span>
      </div>
    );
  }

  return (
    <div className="report-table">
      <div className="report-table__wrapper">
        <table>
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key || column.label}
                  style={{
                    width: column.width || undefined,
                    textAlign: column.align || "left",
                  }}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.length > 0 ? (
              data.map((row, index) => (
                <tr
                  key={
                    rowKey
                      ? rowKey(row, index)
                      : row._id || row.id || index
                  }
                >
                  {columns.map((column) => (
                    <td
                      key={column.key || column.label}
                      style={{
                        textAlign: column.align || "left",
                      }}
                    >
                      {renderCell(column, row, index)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={Math.max(columns.length, 1)}
                  className="report-table__empty"
                >
                  <div className="report-table__empty-content">
                    <div className="report-table__empty-icon">
                      —
                    </div>

                    <strong>No Data Available</strong>

                    <p>{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {data.length > 0 && (
        <div className="report-table__footer">
          Showing <strong>{data.length}</strong>{" "}
          record{data.length !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
};

export default ReportTable;