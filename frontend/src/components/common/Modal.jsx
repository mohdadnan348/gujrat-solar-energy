"use client";

import React, { useEffect } from "react";
import "./Modal.css";

const Modal = ({
  isOpen = false,
  onClose,
  title = "",
  children,
  size = "medium",
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEsc = true,
  footer = null,
  className = "",
}) => {
  useEffect(() => {
    if (!isOpen || !closeOnEsc) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, closeOnEsc, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const modalClasses = [
    "gse-modal",
    `gse-modal-${size}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const handleOverlayClick = (event) => {
    if (
      closeOnOverlayClick &&
      event.target === event.currentTarget
    ) {
      onClose?.();
    }
  };

  return (
    <div
      className="gse-modal-overlay"
      onMouseDown={handleOverlayClick}
      role="presentation"
    >
      <div
        className={modalClasses}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "gse-modal-title" : undefined}
      >
        {(title || showCloseButton) && (
          <div className="gse-modal-header">
            {title && (
              <h2 id="gse-modal-title" className="gse-modal-title">
                {title}
              </h2>
            )}

            {showCloseButton && (
              <button
                type="button"
                className="gse-modal-close"
                onClick={onClose}
                aria-label="Close modal"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M6 6L18 18M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            )}
          </div>
        )}

        <div className="gse-modal-body">
          {children}
        </div>

        {footer && (
          <div className="gse-modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;