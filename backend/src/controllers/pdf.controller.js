const puppeteer = require("puppeteer");
const pdfService = require("../services/pdf.service");

const HTML_CONTENT_TIMEOUT = 60000;
const IMAGE_LOAD_TIMEOUT = 10000;

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

    // Do not wait for networkidle0: external images/fonts can keep network
    // activity open and cause intermittent 30-second navigation timeouts.
    await page.setContent(html, {
      waitUntil: "domcontentloaded",
      timeout: HTML_CONTENT_TIMEOUT,
    });

    // Wait for images that are actually present in the HTML, but never let a
    // broken/unreachable image block PDF generation indefinitely.
    await page.evaluate((imageTimeout) => {
      const images = Array.from(document.images);

      return Promise.all(
        images.map((img) => {
          if (img.complete) {
            return Promise.resolve();
          }

          return new Promise((resolve) => {
            let settled = false;

            const finish = () => {
              if (settled) return;
              settled = true;
              img.removeEventListener("load", finish);
              img.removeEventListener("error", finish);
              resolve();
            };

            img.addEventListener("load", finish, { once: true });
            img.addEventListener("error", finish, { once: true });

            setTimeout(finish, imageTimeout);
          });
        })
      );
    }, IMAGE_LOAD_TIMEOUT);

    // Allow CSS/layout to settle after images have either loaded or timed out.
    await page.evaluate(
      () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
    );

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
      try {
        await browser.close();
      } catch (closeError) {
        console.error("Failed to close Puppeteer browser:", closeError);
      }
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
    return next(error);
  }
};

const generateInvoicePdf = async (req, res, next) => {
  try {
    const result = await pdfService.getInvoicePdfData(req.params.id);
    const pdfBuffer = await generatePdfFromHtml(result.html);
    const filename = `${result.invoiceNumber || "invoice"}.pdf`;

    return sendPdf(res, pdfBuffer, filename);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  generateQuotationPdf,
  generateInvoicePdf,
};
