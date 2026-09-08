const Quotation = require("../models/Quotation");
const { QUOTATION_STATUS } = require("../config/constants");

/**
 * Mark expired quotations.
 *
 * A quotation becomes expired when:
 * - validUntil is before the current date/time
 * - status is Draft or Sent
 * - it has not already been Accepted/Rejected/Expired
 */
const markExpiredQuotations = async () => {
  try {
    const now = new Date();

    const result = await Quotation.updateMany(
      {
        validUntil: { $lt: now },
        status: {
          $in: [
            QUOTATION_STATUS.DRAFT,
            QUOTATION_STATUS.SENT,
          ],
        },
      },
      {
        $set: {
          status: QUOTATION_STATUS.EXPIRED,
          updatedAt: now,
        },
      }
    );

    console.log(
      `[Quotation Expiry Job] Checked at ${now.toISOString()} | Updated: ${result.modifiedCount}`
    );

    return result;
  } catch (error) {
    console.error("[Quotation Expiry Job] Failed:", error.message);
    throw error;
  }
};

module.exports = {
  markExpiredQuotations,
};