const puppeteer = require("puppeteer");
const pdfService = require("../services/pdf.service");

// Reuse one Chrome process instead of starting Chrome for every PDF request.
// Each request still gets its own page, so simultaneous downloads stay isolated.
let browserInstance = null;
let browserLaunchPromise = null;

const HTML_CONTENT_TIMEOUT = 20000;
const IMAGE_LOAD_TIMEOUT = 4000;

const getBrowser = async () => {
  if (browserInstance && browserInstance.connected) {
    return browserInstance;
  }

  if (browserLaunchPromise) {
    return browserLaunchPromise;
  }

  browserLaunchPromise = puppeteer
    .launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--no-zygote",
      ],
    })
    .then((browser) => {
      browserInstance = browser;

      browser.once("disconnected", () => {
        if (browserInstance === browser) {
          browserInstance = null;
        }
        browserLaunchPromise = null;
      });

      return browser;
    })
    .catch((error) => {
      browserInstance = null;
      browserLaunchPromise = null;
      throw error;
    });

  return browserLaunchPromise;
};

const generatePdfFromHtml = async (html) => {
  let page;

  try {
    const browser = await getBrowser();
    page = await browser.newPage();

    await page.setViewport({
      width: 1240,
      height: 1754,
      deviceScaleFactor: 1,
    });

    // HTML uses embedded/data-URI assets; avoid waiting for external network idle.
    await page.setContent(html, {
      waitUntil: "domcontentloaded",
      timeout: HTML_CONTENT_TIMEOUT,
    });

    // Wait for images in parallel, with a short upper bound for broken assets.
    await page.evaluate((imageTimeout) => {
      const images = Array.from(document.images);

      return Promise.all(
        images.map((img) => {
          if (img.complete) return Promise.resolve();

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

    // One frame is enough here; the previous double-frame wait added latency.
    await page.evaluate(
      () => new Promise((resolve) => requestAnimationFrame(resolve))
    );

    return await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });
  } finally {
    // Close only the tab; keep the shared Chrome process warm for the next PDF.
    if (page) {
      try {
        await page.close();
      } catch (closeError) {
        console.error("Failed to close Puppeteer page:", closeError);
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
