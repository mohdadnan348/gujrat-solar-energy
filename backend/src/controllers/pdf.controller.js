const puppeteer = require("puppeteer");
const pdfService = require("../services/pdf.service");

const generatePdfFromHtml = async (html) => {
  let browser;

  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
      ],
    });

    const page = await browser.newPage();

    await page.setViewport({
      width: 1240,
      height: 1754,
      deviceScaleFactor: 1,
    });

    await page.setContent(html, {
      waitUntil: ["load", "networkidle0"],
    });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: "0",
        right: "0",
        bottom: "0",
        left: "0",
      },
    });

    return pdfBuffer;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

const sendPdf = (res, buffer, filename) => {
  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename="${filename}"`,
    "Content-Length": buffer.length,
    "Cache-Control": "no-store",
  });

  return res.status(200).send(buffer);
};

const generateQuotationPdf = async (req, res, next) => {
  try {
    const result = await pdfService.getQuotationPdfData(req.params.id);

    const pdfBuffer = await generatePdfFromHtml(result.html);

    const filename = `${result.quotationNumber || "quotation"}.pdf`;

    return sendPdf(res, pdfBuffer, filename);
  } catch (error) {
    next(error);
  }
};

const generateInvoicePdf = async (req, res, next) => {
  try {
    const result = await pdfService.getInvoicePdfData(req.params.id);

    const pdfBuffer = await generatePdfFromHtml(result.html);

    const filename = `${result.invoiceNumber || "invoice"}.pdf`;

    return sendPdf(res, pdfBuffer, filename);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateQuotationPdf,
  generateInvoicePdf,
};