"use client";

import React from "react";
import "./Pagination.css";

const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  siblingCount = 1,
  showFirstLast = true,
  showPrevNext = true,
  showPageInfo = true,
  disabled = false,
  className = "",
}) => {
  const getPageNumbers = () => {
    if (totalPages <= 1) return [1];

    const pages = [];
    const totalVisiblePages = siblingCount * 2 + 5;

    if (totalPages <= totalVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }

      return pages;
    }

    const leftSibling = Math.max(currentPage - siblingCount, 1);
    const rightSibling = Math.min(
      currentPage + siblingCount,
      totalPages
    );

    const showLeftDots = leftSibling > 2;
    const showRightDots = rightSibling < totalPages - 1;

    if (!showLeftDots && showRightDots) {
      const leftItemCount = 3 + siblingCount * 2;

      for (let i = 1; i <= leftItemCount; i++) {
        pages.push(i);
      }

      pages.push("dots-right");
      pages.push(totalPages);

      return pages;
    }

    if (showLeftDots && !showRightDots) {
      pages.push(1);
      pages.push("dots-left");

      const rightItemCount = 3 + siblingCount * 2;

      for (
        let i = totalPages - rightItemCount + 1;
        i <= totalPages;
        i++
      ) {
        pages.push(i);
      }

      return pages;
    }

    pages.push(1);
    pages.push("dots-left");

    for (let i = leftSibling; i <= rightSibling; i++) {
      pages.push(i);
    }

    pages.push("dots-right");
    pages.push(totalPages);

    return pages;
  };

  const handlePageChange = (page) => {
    if (
      disabled ||
      page === currentPage ||
      page < 1 ||
      page > totalPages
    ) {
      return;
    }

    onPageChange?.(page);
  };

  const pages = getPageNumbers();

  if (totalPages <= 1 && !showPageInfo) {
    return null;
  }

  return (
    <nav
      className={`gse-pagination ${className}`}
      aria-label="Pagination"
    >
      {showPageInfo && (
        <div className="gse-pagination-info">
          Page <strong>{currentPage}</strong> of{" "}
          <strong>{totalPages}</strong>
        </div>
      )}

      {totalPages > 1 && (
        <div className="gse-pagination-controls">
          {showFirstLast && (
            <button
              type="button"
              className="gse-pagination-button gse-pagination-first"
              onClick={() => handlePageChange(1)}
              disabled={disabled || currentPage === 1}
              aria-label="First page"
              title="First page"
            >
              «
            </button>
          )}

          {showPrevNext && (
            <button
              type="button"
              className="gse-pagination-button"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={disabled || currentPage === 1}
              aria-label="Previous page"
              title="Previous page"
            >
              ‹
            </button>
          )}

          <div className="gse-pagination-pages">
            {pages.map((page, index) => {
              if (
                page === "dots-left" ||
                page === "dots-right"
              ) {
                return (
                  <span
                    key={`${page}-${index}`}
                    className="gse-pagination-dots"
                    aria-hidden="true"
                  >
                    …
                  </span>
                );
              }

              const isActive = page === currentPage;

              return (
                <button
                  key={page}
                  type="button"
                  className={`gse-pagination-button ${
                    isActive ? "active" : ""
                  }`}
                  onClick={() => handlePageChange(page)}
                  disabled={disabled}
                  aria-current={isActive ? "page" : undefined}
                  aria-label={`Page ${page}`}
                >
                  {page}
                </button>
              );
            })}
          </div>

          {showPrevNext && (
            <button
              type="button"
              className="gse-pagination-button"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={
                disabled || currentPage === totalPages
              }
              aria-label="Next page"
              title="Next page"
            >
              ›
            </button>
          )}

          {showFirstLast && (
            <button
              type="button"
              className="gse-pagination-button gse-pagination-last"
              onClick={() => handlePageChange(totalPages)}
              disabled={
                disabled || currentPage === totalPages
              }
              aria-label="Last page"
              title="Last page"
            >
              »
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Pagination;