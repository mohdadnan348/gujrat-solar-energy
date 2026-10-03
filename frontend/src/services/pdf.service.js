import api from "@/services/api";

/**
 * PDF Service
 *
 * IMPORTANT:
 * Quotation PDF ka working backend endpoint
 * quotation.service.js me already defined hai:
 *
 * /pdf/quotation/:quotationId
 *
 * Isliye /quotations/:id/pdf use nahi karna hai.
 */

const getPdfBlob = async (url, config = {}) => {
  const response = await api.get(url, {
    ...config,
    responseType: "blob",
  });

  return response;
};

const downloadBlob = (response, filename) => {
  if (typeof window === "undefined") {
    return;
  }

  const blob =
    response?.data instanceof Blob
      ? response.data
      : new Blob([response?.data], {
          type: "application/pdf",
        });

  const url = window.URL.createObjectURL(blob);

  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = filename || "document.pdf";

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  window.setTimeout(() => {
    window.URL.revokeObjectURL(url);
  }, 1000);
};

const getFilenameFromResponse = (
  response,
  fallback
) => {
  const contentDisposition =
    response?.headers?.["content-disposition"] || "";

  const filenameMatch =
    contentDisposition.match(
      /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/i
    );

  const serverFilename =
    filenameMatch?.[1]
      ?.replace(/^["']|["']$/g, "")
      ?.trim();

  return serverFilename || fallback;
};

const openPdf = (response) => {
  if (typeof window === "undefined") {
    return;
  }

  const blob =
    response?.data instanceof Blob
      ? response.data
      : new Blob([response?.data], {
          type: "application/pdf",
        });

  const url = window.URL.createObjectURL(blob);

  window.open(
    url,
    "_blank",
    "noopener,noreferrer"
  );

  window.setTimeout(() => {
    window.URL.revokeObjectURL(url);
  }, 60000);
};

const pdfService = {
  /**
   * Download Quotation PDF
   */
  async downloadQuotationPdf(quotationId) {
    if (!quotationId) {
      throw new Error(
        "Quotation ID is required"
      );
    }

    const response = await getPdfBlob(
      `/pdf/quotation/${quotationId}`
    );

    const filename =
      getFilenameFromResponse(
        response,
        `quotation-${quotationId}.pdf`
      );

    downloadBlob(
      response,
      filename
    );

    return response;
  },

  /**
   * Download Invoice PDF
   */
  async downloadInvoicePdf(invoiceId) {
    if (!invoiceId) {
      throw new Error(
        "Invoice ID is required"
      );
    }

    const response = await getPdfBlob(
      `/pdf/invoice/${invoiceId}`
    );

    const filename =
      getFilenameFromResponse(
        response,
        `invoice-${invoiceId}.pdf`
      );

    downloadBlob(
      response,
      filename
    );

    return response;
  },

  /**
   * Download Proposal PDF
   */
  async downloadProposalPdf(quotationId) {
    if (!quotationId) {
      throw new Error(
        "Quotation ID is required"
      );
    }

    const response = await getPdfBlob(
      `/pdf/quotation/${quotationId}`,
      {
        params: {
          type: "proposal",
        },
      }
    );

    const filename =
      getFilenameFromResponse(
        response,
        `proposal-${quotationId}.pdf`
      );

    downloadBlob(
      response,
      filename
    );

    return response;
  },

  /**
   * Open Quotation PDF
   */
  async openQuotationPdf(quotationId) {
    if (!quotationId) {
      throw new Error(
        "Quotation ID is required"
      );
    }

    const response = await getPdfBlob(
      `/pdf/quotation/${quotationId}`
    );

    openPdf(response);

    return response;
  },

  /**
   * Open Invoice PDF
   */
  async openInvoicePdf(invoiceId) {
    if (!invoiceId) {
      throw new Error(
        "Invoice ID is required"
      );
    }

    const response = await getPdfBlob(
      `/pdf/invoice/${invoiceId}`
    );

    openPdf(response);

    return response;
  },
};

export default pdfService;

/* =========================================================
   NAMED EXPORTS
========================================================= */

export const downloadQuotationPdf =
  pdfService.downloadQuotationPdf.bind(
    pdfService
  );

export const downloadInvoicePdf =
  pdfService.downloadInvoicePdf.bind(
    pdfService
  );

export const downloadProposalPdf =
  pdfService.downloadProposalPdf.bind(
    pdfService
  );

export const openQuotationPdf =
  pdfService.openQuotationPdf.bind(
    pdfService
  );

export const openInvoicePdf =
  pdfService.openInvoicePdf.bind(
    pdfService
  );