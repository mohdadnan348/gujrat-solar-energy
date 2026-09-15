/**
 * Currency utility functions for GUJRAT SOLAR ENERGY
 * Default currency: INR (Indian Rupee)
 */

const DEFAULT_CURRENCY = "INR";
const DEFAULT_LOCALE = "en-IN";

/**
 * Format a number as Indian currency.
 *
 * @param {number|string} value
 * @param {object} options
 * @returns {string}
 */
export const formatCurrency = (
  value,
  {
    currency = DEFAULT_CURRENCY,
    locale = DEFAULT_LOCALE,
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    showSymbol = true,
  } = {}
) => {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return showSymbol ? "₹0.00" : "0.00";
  }

  if (!showSymbol) {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(amount);
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amount);
};

/**
 * Format INR currency.
 *
 * @param {number|string} value
 * @param {object} options
 * @returns {string}
 */
export const formatINR = (
  value,
  {
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
  } = {}
) => {
  return formatCurrency(value, {
    currency: "INR",
    locale: "en-IN",
    minimumFractionDigits,
    maximumFractionDigits,
  });
};

/**
 * Format currency without currency symbol.
 *
 * @param {number|string} value
 * @param {object} options
 * @returns {string}
 */
export const formatAmount = (
  value,
  {
    locale = DEFAULT_LOCALE,
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
  } = {}
) => {
  return formatCurrency(value, {
    locale,
    minimumFractionDigits,
    maximumFractionDigits,
    showSymbol: false,
  });
};

/**
 * Parse a currency value into a number.
 *
 * Handles values such as:
 * "₹1,25,000.00"
 * "1,25,000"
 * "125000"
 *
 * @param {number|string} value
 * @returns {number}
 */
export const parseCurrency = (value) => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value !== "string") {
    return 0;
  }

  const cleaned = value
    .replace(/[₹$€£,\s]/g, "")
    .replace(/[^\d.-]/g, "");

  const amount = Number(cleaned);

  return Number.isFinite(amount) ? amount : 0;
};

/**
 * Convert a value from one currency to another.
 *
 * This is a calculation helper only. It does not fetch live exchange rates.
 *
 * @param {number|string} amount
 * @param {number|string} rate
 * @returns {number}
 */
export const convertCurrency = (amount, rate) => {
  const value = parseCurrency(amount);
  const conversionRate = Number(rate);

  if (!Number.isFinite(value) || !Number.isFinite(conversionRate)) {
    return 0;
  }

  return value * conversionRate;
};

/**
 * Calculate percentage of an amount.
 *
 * @param {number|string} amount
 * @param {number|string} percentage
 * @returns {number}
 */
export const calculatePercentageAmount = (amount, percentage) => {
  const value = parseCurrency(amount);
  const percent = Number(percentage);

  if (!Number.isFinite(value) || !Number.isFinite(percent)) {
    return 0;
  }

  return (value * percent) / 100;
};

/**
 * Add currency values.
 *
 * @param {...(number|string)} values
 * @returns {number}
 */
export const addCurrency = (...values) => {
  return values.reduce((total, value) => {
    return total + parseCurrency(value);
  }, 0);
};

/**
 * Subtract currency values.
 *
 * @param {number|string} base
 * @param {...(number|string)} values
 * @returns {number}
 */
export const subtractCurrency = (base, ...values) => {
  return values.reduce(
    (total, value) => total - parseCurrency(value),
    parseCurrency(base)
  );
};

/**
 * Calculate discount amount.
 *
 * @param {number|string} amount
 * @param {number|string} discount
 * @param {"percentage"|"fixed"} type
 * @returns {number}
 */
export const calculateDiscount = (
  amount,
  discount,
  type = "percentage"
) => {
  const value = parseCurrency(amount);
  const discountValue = Number(discount);

  if (!Number.isFinite(value) || !Number.isFinite(discountValue)) {
    return 0;
  }

  if (type === "fixed") {
    return Math.min(Math.max(discountValue, 0), value);
  }

  return Math.min(
    Math.max((value * discountValue) / 100, 0),
    value
  );
};

/**
 * Calculate taxable amount after discount.
 *
 * @param {number|string} amount
 * @param {number|string} discount
 * @param {"percentage"|"fixed"} type
 * @returns {number}
 */
export const calculateTaxableAmount = (
  amount,
  discount = 0,
  type = "percentage"
) => {
  const value = parseCurrency(amount);
  const discountAmount = calculateDiscount(value, discount, type);

  return Math.max(value - discountAmount, 0);
};

/**
 * Calculate tax amount.
 *
 * @param {number|string} amount
 * @param {number|string} taxRate
 * @returns {number}
 */
export const calculateTax = (amount, taxRate) => {
  return calculatePercentageAmount(amount, taxRate);
};

/**
 * Calculate total including tax.
 *
 * @param {number|string} amount
 * @param {number|string} taxRate
 * @returns {number}
 */
export const calculateWithTax = (amount, taxRate) => {
  const value = parseCurrency(amount);
  const tax = calculateTax(value, taxRate);

  return value + tax;
};

/**
 * Calculate amount after discount and tax.
 *
 * @param {object} options
 * @returns {number}
 */
export const calculateFinalAmount = ({
  amount = 0,
  discount = 0,
  discountType = "percentage",
  taxRate = 0,
} = {}) => {
  const taxableAmount = calculateTaxableAmount(
    amount,
    discount,
    discountType
  );

  const taxAmount = calculateTax(taxableAmount, taxRate);

  return taxableAmount + taxAmount;
};

/**
 * Format a value for invoice/quotation documents.
 *
 * @param {number|string} value
 * @returns {string}
 */
export const formatDocumentAmount = (value) => {
  return formatINR(value, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

/**
 * Format a value without decimal places.
 *
 * @param {number|string} value
 * @returns {string}
 */
export const formatWholeCurrency = (value) => {
  return formatINR(value, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

/**
 * Format compact currency values for dashboards.
 *
 * Examples:
 * ₹1.25L
 * ₹2.50Cr
 *
 * @param {number|string} value
 * @returns {string}
 */
export const formatCompactCurrency = (value) => {
  const amount = parseCurrency(value);

  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)}Cr`;
  }

  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)}L`;
  }

  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(2)}K`;
  }

  return formatINR(amount, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

/**
 * Convert a number into Indian numbering format.
 *
 * @param {number|string} value
 * @returns {string}
 */
export const formatIndianNumber = (value) => {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "0";
  }

  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Get currency symbol.
 *
 * @param {string} currency
 * @param {string} locale
 * @returns {string}
 */
export const getCurrencySymbol = (
  currency = DEFAULT_CURRENCY,
  locale = DEFAULT_LOCALE
) => {
  try {
    return (
      new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })
        .formatToParts(0)
        .find((part) => part.type === "currency")?.value || "₹"
    );
  } catch {
    return "₹";
  }
};

/**
 * Convert currency amount to words using Indian numbering.
 *
 * Example:
 * 125000 -> "One Lakh Twenty Five Thousand Rupees Only"
 *
 * @param {number|string} value
 * @returns {string}
 */
export const amountToWords = (value) => {
  const amount = parseCurrency(value);

  if (amount === 0) {
    return "Zero Rupees Only";
  }

  const number = Math.floor(amount);
  const paise = Math.round((amount - number) * 100);

  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];

  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  const twoDigitsToWords = (num) => {
    if (num < 20) return ones[num];

    return `${tens[Math.floor(num / 10)]}${
      num % 10 ? ` ${ones[num % 10]}` : ""
    }`;
  };

  const numberToWords = (num) => {
    if (num === 0) return "";

    let result = "";

    if (num >= 10000000) {
      result += `${numberToWords(Math.floor(num / 10000000))} Crore `;
      num %= 10000000;
    }

    if (num >= 100000) {
      result += `${numberToWords(Math.floor(num / 100000))} Lakh `;
      num %= 100000;
    }

    if (num >= 1000) {
      result += `${numberToWords(Math.floor(num / 1000))} Thousand `;
      num %= 1000;
    }

    if (num >= 100) {
      result += `${ones[Math.floor(num / 100)]} Hundred `;
      num %= 100;
    }

    if (num > 0) {
      result += `${twoDigitsToWords(num)} `;
    }

    return result.trim();
  };

  let result = `${numberToWords(number)} Rupees`;

  if (paise > 0) {
    result += ` and ${twoDigitsToWords(paise)} Paise`;
  }

  return `${result} Only`;
};

/**
 * Default currency configuration.
 */
export const CURRENCY_CONFIG = {
  code: "INR",
  symbol: "₹",
  name: "Indian Rupee",
  locale: "en-IN",
  decimalPlaces: 2,
};

export default {
  formatCurrency,
  formatINR,
  formatAmount,
  parseCurrency,
  convertCurrency,
  calculatePercentageAmount,
  calculateDiscount,
  calculateTaxableAmount,
  calculateTax,
  calculateWithTax,
  calculateFinalAmount,
  formatDocumentAmount,
  formatWholeCurrency,
  formatCompactCurrency,
  formatIndianNumber,
  getCurrencySymbol,
  amountToWords,
  addCurrency,
  subtractCurrency,
  CURRENCY_CONFIG,
};