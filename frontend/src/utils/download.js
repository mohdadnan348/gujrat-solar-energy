/**
 * Download utility functions
 * GUJRAT SOLAR ENERGY Frontend
 */

/**
 * Trigger a browser download from a Blob/File.
 *
 * @param {Blob} blob
 * @param {string} filename
 * @returns {boolean}
 */
export const downloadBlob = (blob, filename = "download") => {
  if (typeof window === "undefined" || !blob) {
    return false;
  }

  try {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;
    link.style.display = "none";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error("Failed to download file:", error);
    return false;
  }
};

/**
 * Download a file from a URL.
 *
 * @param {string} url
 * @param {string} filename
 * @returns {boolean}
 */
export const downloadFromUrl = (url, filename = "download") => {
  if (typeof window === "undefined" || !url) {
    return false;
  }

  try {
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.style.display = "none";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return true;
  } catch (error) {
    console.error("Failed to download URL:", error);
    return false;
  }
};

/**
 * Download a data URL.
 *
 * @param {string} dataUrl
 * @param {string} filename
 * @returns {boolean}
 */
export const downloadDataUrl = (
  dataUrl,
  filename = "download"
) => {
  if (typeof window === "undefined" || !dataUrl) {
    return false;
  }

  try {
    const link = document.createElement("a");

    link.href = dataUrl;
    link.download = filename;
    link.style.display = "none";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return true;
  } catch (error) {
    console.error("Failed to download data URL:", error);
    return false;
  }
};

/**
 * Download text content as a file.
 *
 * @param {string} content
 * @param {string} filename
 * @param {string} mimeType
 * @returns {boolean}
 */
export const downloadText = (
  content,
  filename = "download.txt",
  mimeType = "text/plain;charset=utf-8"
) => {
  try {
    const blob = new Blob([content], {
      type: mimeType,
    });

    return downloadBlob(blob, filename);
  } catch (error) {
    console.error("Failed to download text file:", error);
    return false;
  }
};

/**
 * Download JSON data as a .json file.
 *
 * @param {*} data
 * @param {string} filename
 * @param {number} indentation
 * @returns {boolean}
 */
export const downloadJson = (
  data,
  filename = "data.json",
  indentation = 2
) => {
  try {
    const json = JSON.stringify(data, null, indentation);

    return downloadText(
      json,
      filename,
      "application/json;charset=utf-8"
    );
  } catch (error) {
    console.error("Failed to download JSON:", error);
    return false;
  }
};

/**
 * Download CSV content.
 *
 * @param {string} csv
 * @param {string} filename
 * @returns {boolean}
 */
export const downloadCsv = (
  csv,
  filename = "data.csv"
) => {
  try {
    const blob = new Blob(["\ufeff", csv], {
      type: "text/csv;charset=utf-8",
    });

    return downloadBlob(blob, filename);
  } catch (error) {
    console.error("Failed to download CSV:", error);
    return false;
  }
};

/**
 * Convert an array of objects to CSV.
 *
 * @param {Array<object>} data
 * @param {object} options
 * @returns {string}
 */
export const arrayToCsv = (
  data = [],
  {
    columns = null,
    includeHeaders = true,
  } = {}
) => {
  if (!Array.isArray(data) || data.length === 0) {
    return "";
  }

  const keys =
    Array.isArray(columns) && columns.length > 0
      ? columns
      : Object.keys(data[0]);

  const escapeCsvValue = (value) => {
    if (value === null || value === undefined) {
      return "";
    }

    if (Array.isArray(value)) {
      value = value.join(", ");
    }

    if (typeof value === "object") {
      value = JSON.stringify(value);
    }

    const stringValue = String(value);

    if (
      stringValue.includes(",") ||
      stringValue.includes('"') ||
      stringValue.includes("\n") ||
      stringValue.includes("\r")
    ) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }

    return stringValue;
  };

  const rows = [];

  if (includeHeaders) {
    rows.push(keys.map(escapeCsvValue).join(","));
  }

  data.forEach((item) => {
    const row = keys.map((key) =>
      escapeCsvValue(item?.[key])
    );

    rows.push(row.join(","));
  });

  return rows.join("\n");
};

/**
 * Download an array of objects as CSV.
 *
 * @param {Array<object>} data
 * @param {string} filename
 * @param {object} options
 * @returns {boolean}
 */
export const downloadArrayAsCsv = (
  data,
  filename = "data.csv",
  options = {}
) => {
  const csv = arrayToCsv(data, options);

  if (!csv) {
    return false;
  }

  return downloadCsv(csv, filename);
};

/**
 * Extract a filename from a Content-Disposition header.
 *
 * @param {string} header
 * @returns {string|null}
 */
export const getFilenameFromContentDisposition = (
  header
) => {
  if (!header || typeof header !== "string") {
    return null;
  }

  const utfMatch = header.match(
    /filename\*=UTF-8''([^;]+)/i
  );

  if (utfMatch?.[1]) {
    try {
      return decodeURIComponent(utfMatch[1]);
    } catch {
      return utfMatch[1];
    }
  }

  const filenameMatch = header.match(
    /filename=["']?([^"';]+)["']?/i
  );

  return filenameMatch?.[1] || null;
};

/**
 * Get a safe filename.
 *
 * @param {string} filename
 * @param {string} fallback
 * @returns {string}
 */
export const sanitizeFilename = (
  filename,
  fallback = "download"
) => {
  if (!filename || typeof filename !== "string") {
    return fallback;
  }

  const sanitized = filename
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_")
    .replace(/\s+/g, " ")
    .replace(/\.+$/g, "");

  return sanitized || fallback;
};

/**
 * Ensure a filename has the requested extension.
 *
 * @param {string} filename
 * @param {string} extension
 * @returns {string}
 */
export const ensureExtension = (
  filename,
  extension
) => {
  if (!filename) {
    return `download${extension.startsWith(".") ? extension : `.${extension}`}`;
  }

  const normalizedExtension = extension.startsWith(".")
    ? extension
    : `.${extension}`;

  if (filename.toLowerCase().endsWith(
    normalizedExtension.toLowerCase()
  )) {
    return filename;
  }

  return `${filename}${normalizedExtension}`;
};

/**
 * Open a Blob in a new browser tab.
 *
 * Useful for PDF preview.
 *
 * @param {Blob} blob
 * @returns {string|null}
 */
export const openBlob = (blob) => {
  if (typeof window === "undefined" || !blob) {
    return null;
  }

  try {
    const url = window.URL.createObjectURL(blob);

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );

    return url;
  } catch (error) {
    console.error("Failed to open blob:", error);
    return null;
  }
};

/**
 * Open a URL in a new browser tab.
 *
 * @param {string} url
 * @returns {boolean}
 */
export const openUrl = (url) => {
  if (typeof window === "undefined" || !url) {
    return false;
  }

  try {
    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );

    return true;
  } catch (error) {
    console.error("Failed to open URL:", error);
    return false;
  }
};

/**
 * Convert an ArrayBuffer to a downloadable Blob.
 *
 * @param {ArrayBuffer|Uint8Array} data
 * @param {string} mimeType
 * @returns {Blob|null}
 */
export const bufferToBlob = (
  data,
  mimeType = "application/octet-stream"
) => {
  if (!data) {
    return null;
  }

  try {
    return new Blob([data], {
      type: mimeType,
    });
  } catch (error) {
    console.error("Failed to create Blob:", error);
    return null;
  }
};

/**
 * Download an ArrayBuffer/Uint8Array.
 *
 * @param {ArrayBuffer|Uint8Array} data
 * @param {string} filename
 * @param {string} mimeType
 * @returns {boolean}
 */
export const downloadBuffer = (
  data,
  filename = "download",
  mimeType = "application/octet-stream"
) => {
  const blob = bufferToBlob(data, mimeType);

  if (!blob) {
    return false;
  }

  return downloadBlob(blob, filename);
};

/**
 * Download a PDF Blob.
 *
 * @param {Blob} blob
 * @param {string} filename
 * @returns {boolean}
 */
export const downloadPdf = (
  blob,
  filename = "document.pdf"
) => {
  return downloadBlob(
    blob,
    ensureExtension(
      sanitizeFilename(filename, "document"),
      ".pdf"
    )
  );
};

/**
 * Download an Excel Blob.
 *
 * @param {Blob} blob
 * @param {string} filename
 * @returns {boolean}
 */
export const downloadExcel = (
  blob,
  filename = "export.xlsx"
) => {
  return downloadBlob(
    blob,
    ensureExtension(
      sanitizeFilename(filename, "export"),
      ".xlsx"
    )
  );
};

/**
 * Download an image Blob.
 *
 * @param {Blob} blob
 * @param {string} filename
 * @param {string} extension
 * @returns {boolean}
 */
export const downloadImage = (
  blob,
  filename = "image",
  extension = ".png"
) => {
  return downloadBlob(
    blob,
    ensureExtension(
      sanitizeFilename(filename, "image"),
      extension
    )
  );
};

export default {
  downloadBlob,
  downloadFromUrl,
  downloadDataUrl,
  downloadText,
  downloadJson,
  downloadCsv,
  arrayToCsv,
  downloadArrayAsCsv,
  getFilenameFromContentDisposition,
  sanitizeFilename,
  ensureExtension,
  openBlob,
  openUrl,
  bufferToBlob,
  downloadBuffer,
  downloadPdf,
  downloadExcel,
  downloadImage,
};