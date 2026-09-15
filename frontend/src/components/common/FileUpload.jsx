"use client";

import React, { useId, useRef, useState } from "react";
import "./FileUpload.css";

const FileUpload = ({
  label,
  name,
  value,
  onChange,
  onRemove,
  accept,
  multiple = false,
  maxFiles,
  maxSize,
  disabled = false,
  required = false,
  error,
  helperText,
  dragAndDrop = true,
  preview = true,
  className = "",
  id,
  ...props
}) => {
  const generatedId = useId();
  const inputId = id || `gse-file-${generatedId}`;
  const inputRef = useRef(null);

  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState("");

  const files = value
    ? Array.isArray(value)
      ? value
      : [value]
    : [];

  const validateFiles = (selectedFiles) => {
    const fileList = Array.from(selectedFiles || []);

    if (!multiple && fileList.length > 1) {
      return {
        error: "Please select only one file.",
        files: fileList.slice(0, 1),
      };
    }

    if (multiple && maxFiles && fileList.length > maxFiles) {
      return {
        error: `You can upload a maximum of ${maxFiles} files.`,
        files: fileList.slice(0, maxFiles),
      };
    }

    if (maxSize) {
      const invalidFile = fileList.find(
        (file) => file.size > maxSize
      );

      if (invalidFile) {
        const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);

        return {
          error: `${invalidFile.name} exceeds the ${maxSizeMB} MB size limit.`,
          files: [],
        };
      }
    }

    return {
      error: "",
      files: fileList,
    };
  };

  const handleFiles = (selectedFiles) => {
    const result = validateFiles(selectedFiles);

    setLocalError(result.error);

    if (result.error) {
      return;
    }

    onChange?.(
      multiple ? result.files : result.files[0] || null
    );
  };

  const handleInputChange = (event) => {
    handleFiles(event.target.files);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();

    if (disabled) return;

    setIsDragging(false);

    handleFiles(event.dataTransfer.files);
  };

  const handleDragOver = (event) => {
    event.preventDefault();

    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleBrowse = () => {
    if (!disabled) {
      inputRef.current?.click();
    }
  };

  const handleRemove = (index) => {
    setLocalError("");

    if (onRemove) {
      onRemove(files[index], index);
      return;
    }

    if (multiple) {
      onChange?.(files.filter((_, fileIndex) => fileIndex !== index));
    } else {
      onChange?.(null);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 B";

    const units = ["B", "KB", "MB", "GB"];
    const unitIndex = Math.floor(
      Math.log(bytes) / Math.log(1024)
    );

    return `${(
      bytes / Math.pow(1024, unitIndex)
    ).toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
  };

  const getFileName = (file) => {
    return file?.name || file?.fileName || "Uploaded file";
  };

  const getFileSize = (file) => {
    if (file?.size) {
      return formatFileSize(file.size);
    }

    if (file?.fileSize) {
      return formatFileSize(file.fileSize);
    }

    return "";
  };

  const isImage = (file) => {
    if (!file) return false;

    if (file.type?.startsWith("image/")) {
      return true;
    }

    return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(
      getFileName(file)
    );
  };

  const getPreviewUrl = (file) => {
    if (!file) return null;

    if (file instanceof File || file instanceof Blob) {
      return URL.createObjectURL(file);
    }

    return file.url || file.path || file.preview || null;
  };

  const displayError = error || localError;

  const uploadClasses = [
    "gse-file-upload",
    isDragging ? "gse-file-upload-dragging" : "",
    disabled ? "gse-file-upload-disabled" : "",
    displayError ? "gse-file-upload-error" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={uploadClasses}>
      {label && (
        <label
          htmlFor={inputId}
          className="gse-file-upload-label"
        >
          {label}
          {required && (
            <span
              className="gse-file-upload-required"
              aria-hidden="true"
            >
              *
            </span>
          )}
        </label>
      )}

      <input
        ref={inputRef}
        id={inputId}
        name={name}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        required={required && files.length === 0}
        onChange={handleInputChange}
        className="gse-file-upload-input"
        {...props}
      />

      {dragAndDrop ? (
        <div
          className="gse-file-upload-dropzone"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleBrowse}
          role="button"
          tabIndex={disabled ? -1 : 0}
          onKeyDown={(event) => {
            if (
              event.key === "Enter" ||
              event.key === " "
            ) {
              handleBrowse();
            }
          }}
          aria-disabled={disabled}
        >
          <div className="gse-file-upload-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 16V4" />
              <path d="m7 9 5-5 5 5" />
              <path d="M5 20h14" />
            </svg>
          </div>

          <div className="gse-file-upload-content">
            <p className="gse-file-upload-title">
              Drag & drop your file here
            </p>

            <p className="gse-file-upload-subtitle">
              or{" "}
              <span className="gse-file-upload-browse">
                browse files
              </span>
            </p>
          </div>

          {accept && (
            <p className="gse-file-upload-format">
              Accepted: {accept}
            </p>
          )}
        </div>
      ) : (
        <button
          type="button"
          className="gse-file-upload-browse-button"
          onClick={handleBrowse}
          disabled={disabled}
        >
          Choose File
        </button>
      )}

      {files.length > 0 && (
        <div className="gse-file-upload-list">
          {files.map((file, index) => {
            const previewUrl = preview
              ? getPreviewUrl(file)
              : null;

            return (
              <div
                className="gse-file-upload-item"
                key={`${getFileName(file)}-${index}`}
              >
                {previewUrl && isImage(file) ? (
                  <img
                    src={previewUrl}
                    alt={getFileName(file)}
                    className="gse-file-upload-preview"
                  />
                ) : (
                  <div className="gse-file-upload-file-icon">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <path d="M14 2v6h6" />
                      <path d="M8 13h8" />
                      <path d="M8 17h5" />
                    </svg>
                  </div>
                )}

                <div className="gse-file-upload-file-info">
                  <span className="gse-file-upload-file-name">
                    {getFileName(file)}
                  </span>

                  {getFileSize(file) && (
                    <span className="gse-file-upload-file-size">
                      {getFileSize(file)}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  className="gse-file-upload-remove"
                  onClick={() => handleRemove(index)}
                  disabled={disabled}
                  aria-label={`Remove ${getFileName(file)}`}
                  title="Remove file"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      )}

      {(displayError || helperText) && (
        <p
          className={`gse-file-upload-message ${
            displayError ? "error" : ""
          }`}
        >
          {displayError || helperText}
        </p>
      )}
    </div>
  );
};

export default FileUpload;