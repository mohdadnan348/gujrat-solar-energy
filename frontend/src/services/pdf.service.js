import api from "@/services/api";

/**
 * PDF Service
 * -----------
 * Backend se quotation, proposal aur invoice PDFs
 * generate/download karne ke liye.
 *
 * PDF generation backend par hogi so that:
 * - calculations authoritative rahen
 * - quotation/invoice data consistent rahe
 * - frontend sirf request/download handle kare
 */

const pdfService = {
  /**
   * Generate / download quotation PDF
   */
  async downloadQuotationPdf(quotationId) {
    if (!quotationId) {
      throw new Error("Quotation ID is required");
    }

    return api.download(`/quotations/${quotationId}/pdf`);
  },

  /**
   * Generate / download invoice PDF
   */
  async downloadInvoicePdf(invoiceId) {
    if (!invoiceId) {
      throw new Error("Invoice ID is required");
    }

    return api.download(`/invoices/${invoiceId}/pdf`);
  },

  /**
   * Generate / download proposal PDF
   *
   * Proposal quotation ke basis par generate hota hai.
   */
  async downloadProposalPdf(quotationId) {
    if (!quotationId) {
      throw new Error("Quotation ID is required");
    }

    return api.download(`/quotations/${quotationId}/pdf`, {
      params: {
        type: "proposal",
      },
    });
  },

  /**
   * Open quotation PDF in a new browser tab
   */
  async openQuotationPdf(quotationId) {
    if (!quotationId) {
      throw new Error("Quotation ID is required");
    }

    const response = await api.get(`/quotations/${quotationId}/pdf`, {
      responseType: "blob",
    });

    const blob = new Blob([response.data], {
      type: "application/pdf",
    });

    const url = window.URL.createObjectURL(blob);
    window.open(url, "_blank");

    setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 60000);

    return response.data;
  },

  /**
   * Open invoice PDF in a new browser tab
   */
  async openInvoicePdf(invoiceId) {
    if (!invoiceId) {
      throw new Error("Invoice ID is required");
    }

    const response = await api.get(`/invoices/${invoiceId}/pdf`, {
      responseType: "blob",
    });

    const blob = new Blob([response.data], {
      type: "application/pdf",
    });

    const url = window.URL.createObjectURL(blob);
    window.open(url, "_blank");

    setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 60000);

    return response.data;
  },
};

export default pdfService;

// Named exports
export const downloadQuotationPdf =
  pdfService.downloadQuotationPdf.bind(pdfService);

export const downloadInvoicePdf =
  pdfService.downloadInvoicePdf.bind(pdfService);

export const downloadProposalPdf =
  pdfService.downloadProposalPdf.bind(pdfService);

export const openQuotationPdf =
  pdfService.openQuotationPdf.bind(pdfService);

export const openInvoicePdf =
  pdfService.openInvoicePdf.bind(pdfService);