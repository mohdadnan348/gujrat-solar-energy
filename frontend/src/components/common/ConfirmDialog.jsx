"use client";

import React from "react";
import Modal from "./Modal";
import Button from "./Button";
import "./ConfirmDialog.css";

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to continue?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  loading = false,
  icon,
  className = "",
}) => {
  const handleConfirm = async () => {
    if (loading) return;
    await onConfirm?.();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={loading ? undefined : onClose}
      title={title}
      size="small"
      closeOnOverlayClick={!loading}
      closeOnEsc={!loading}
      className={`gse-confirm-dialog ${className}`}
      footer={
        <div className="gse-confirm-dialog-actions">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>

          <Button
            type="button"
            variant={variant}
            onClick={handleConfirm}
            loading={loading}
            disabled={loading}
          >
            {confirmText}
          </Button>
        </div>
      }
    >
      <div className="gse-confirm-dialog-content">
        {icon && (
          <div className="gse-confirm-dialog-icon">
            {icon}
          </div>
        )}

        <p className="gse-confirm-dialog-message">
          {message}
        </p>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;