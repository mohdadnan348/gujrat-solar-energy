"use client";

import React, { useEffect } from "react";
import Sidebar from "./Sidebar";
import "./MobileSidebar.css";

const MobileSidebar = ({
  user,
  isOpen = false,
  onClose,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

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

  return (
    <div
      className="gse-mobile-sidebar"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile navigation"
    >
      <button
        type="button"
        className="gse-mobile-sidebar-overlay"
        onClick={onClose}
        aria-label="Close navigation"
      />

      <div className="gse-mobile-sidebar-panel">
        <Sidebar
          user={user}
          isOpen={true}
          onClose={onClose}
          collapsed={false}
        />
      </div>
    </div>
  );
};

export default MobileSidebar;