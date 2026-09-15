const toNumber = (value, fallback = 0) => {
  const number = Number(value);

  return Number.isFinite(number) ? number : fallback;
};

const round = (value, decimals = 2) => {
  const factor = 10 ** decimals;

  return Math.round((toNumber(value) + Number.EPSILON) * factor) / factor;
};

/* =========================
   Basic Calculations
========================= */

export const calculateAmount = (quantity, rate) => {
  return round(
    toNumber(quantity) * toNumber(rate)
  );
};

export const calculateDiscountAmount = (
  amount,
  discount = 0,
  discountType = "PERCENTAGE"
) => {
  const baseAmount = toNumber(amount);
  const discountValue = toNumber(discount);

  if (discountType === "FIXED") {
    return round(
      Math.min(Math.max(discountValue, 0), baseAmount)
    );
  }

  return round(
    baseAmount * (Math.max(discountValue, 0) / 100)
  );
};

export const calculateTaxAmount = (
  taxableAmount,
  taxRate = 0
) => {
  return round(
    toNumber(taxableAmount) *
      (Math.max(toNumber(taxRate), 0) / 100)
  );
};

/* =========================
   Line Item Calculations
========================= */

export const calculateLineItem = (item = {}) => {
  const quantity = toNumber(item.quantity);
  const rate = toNumber(item.rate);
  const discount = toNumber(item.discount);
  const tax = toNumber(item.tax);

  const discountType =
    item.discountType || "PERCENTAGE";

  const taxType =
    item.taxType || "PERCENTAGE";

  const grossAmount = round(quantity * rate);

  const discountAmount =
    discountType === "FIXED"
      ? round(Math.min(Math.max(discount, 0), grossAmount))
      : round(
          grossAmount *
            (Math.max(discount, 0) / 100)
        );

  const taxableAmount = round(
    Math.max(grossAmount - discountAmount, 0)
  );

  const taxAmount =
    taxType === "FIXED"
      ? round(Math.max(tax, 0))
      : round(
          taxableAmount *
            (Math.max(tax, 0) / 100)
        );

  const totalAmount = round(
    taxableAmount + taxAmount
  );

  return {
    ...item,
    quantity,
    rate,
    discount,
    tax,
    grossAmount,
    discountAmount,
    taxableAmount,
    taxAmount,
    totalAmount,
  };
};

export const calculateLineItems = (items = []) => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map(calculateLineItem);
};

/* =========================
   Subtotal / Discount / Tax
========================= */

export const calculateSubtotal = (items = []) => {
  if (!Array.isArray(items)) {
    return 0;
  }

  return round(
    items.reduce((total, item) => {
      const quantity = toNumber(item.quantity);
      const rate = toNumber(item.rate);

      return total + quantity * rate;
    }, 0)
  );
};

export const calculateTotalDiscount = (
  items = []
) => {
  if (!Array.isArray(items)) {
    return 0;
  }

  return round(
    items.reduce((total, item) => {
      const calculated = calculateLineItem(item);

      return total + calculated.discountAmount;
    }, 0)
  );
};

export const calculateTaxableAmount = (
  items = []
) => {
  if (!Array.isArray(items)) {
    return 0;
  }

  return round(
    items.reduce((total, item) => {
      const calculated = calculateLineItem(item);

      return total + calculated.taxableAmount;
    }, 0)
  );
};

export const calculateTotalTax = (items = []) => {
  if (!Array.isArray(items)) {
    return 0;
  }

  return round(
    items.reduce((total, item) => {
      const calculated = calculateLineItem(item);

      return total + calculated.taxAmount;
    }, 0)
  );
};

export const calculateGrandTotal = (items = []) => {
  if (!Array.isArray(items)) {
    return 0;
  }

  return round(
    items.reduce((total, item) => {
      const calculated = calculateLineItem(item);

      return total + calculated.totalAmount;
    }, 0)
  );
};

/* =========================
   Complete Invoice / Quote
   Calculation
========================= */

export const calculateDocumentTotals = (
  items = [],
  additionalDiscount = 0,
  additionalDiscountType = "FIXED",
  additionalTaxRate = 0
) => {
  const calculatedItems = calculateLineItems(items);

  const subtotal = round(
    calculatedItems.reduce(
      (total, item) => total + item.grossAmount,
      0
    )
  );

  const itemDiscount = round(
    calculatedItems.reduce(
      (total, item) => total + item.discountAmount,
      0
    )
  );

  const itemTax = round(
    calculatedItems.reduce(
      (total, item) => total + item.taxAmount,
      0
    )
  );

  const afterItemDiscount = round(
    Math.max(subtotal - itemDiscount, 0)
  );

  const extraDiscount = calculateDiscountAmount(
    afterItemDiscount,
    additionalDiscount,
    additionalDiscountType
  );

  const taxableAmount = round(
    Math.max(afterItemDiscount - extraDiscount, 0)
  );

  const additionalTax = calculateTaxAmount(
    taxableAmount,
    additionalTaxRate
  );

  const grandTotal = round(
    taxableAmount + itemTax + additionalTax
  );

  return {
    items: calculatedItems,
    subtotal,
    itemDiscount,
    extraDiscount,
    totalDiscount: round(
      itemDiscount + extraDiscount
    ),
    taxableAmount,
    itemTax,
    additionalTax,
    totalTax: round(itemTax + additionalTax),
    grandTotal,
  };
};

/* =========================
   Solar Panel Calculations
========================= */

export const calculatePanelCapacity = (
  wattage,
  quantity
) => {
  const totalWatts =
    toNumber(wattage) * toNumber(quantity);

  return round(totalWatts / 1000);
};

export const calculateTotalPanelCapacity = (
  panels = []
) => {
  if (!Array.isArray(panels)) {
    return 0;
  }

  return round(
    panels.reduce((total, panel) => {
      return (
        total +
        calculatePanelCapacity(
          panel.wattage,
          panel.quantity
        )
      );
    }, 0)
  );
};

/* =========================
   Inverter Calculations
========================= */

export const calculateInverterCapacity = (
  capacity,
  quantity
) => {
  return round(
    toNumber(capacity) * toNumber(quantity)
  );
};

export const calculateTotalInverterCapacity = (
  inverters = []
) => {
  if (!Array.isArray(inverters)) {
    return 0;
  }

  return round(
    inverters.reduce((total, inverter) => {
      return (
        total +
        calculateInverterCapacity(
          inverter.capacity,
          inverter.quantity
        )
      );
    }, 0)
  );
};

/* =========================
   Battery Calculations
========================= */

export const calculateBatteryCapacity = (
  capacity,
  quantity
) => {
  return round(
    toNumber(capacity) * toNumber(quantity)
  );
};

export const calculateTotalBatteryCapacity = (
  batteries = []
) => {
  if (!Array.isArray(batteries)) {
    return 0;
  }

  return round(
    batteries.reduce((total, battery) => {
      return (
        total +
        calculateBatteryCapacity(
          battery.capacity,
          battery.quantity
        )
      );
    }, 0)
  );
};

/* =========================
   Percentage Calculations
========================= */

export const calculatePercentage = (
  value,
  percentage
) => {
  return round(
    toNumber(value) *
      (toNumber(percentage) / 100)
  );
};

export const calculatePercentageChange = (
  current,
  previous
) => {
  const currentValue = toNumber(current);
  const previousValue = toNumber(previous);

  if (previousValue === 0) {
    return currentValue === 0 ? 0 : 100;
  }

  return round(
    ((currentValue - previousValue) /
      Math.abs(previousValue)) *
      100
  );
};

/* =========================
   Lead Calculations
========================= */

export const calculateConversionRate = (
  convertedLeads,
  totalLeads
) => {
  const total = toNumber(totalLeads);

  if (total <= 0) {
    return 0;
  }

  return round(
    (toNumber(convertedLeads) / total) * 100
  );
};

export const calculateLostRate = (
  lostLeads,
  totalLeads
) => {
  const total = toNumber(totalLeads);

  if (total <= 0) {
    return 0;
  }

  return round(
    (toNumber(lostLeads) / total) * 100
  );
};

/* =========================
   Attendance Calculations
========================= */

export const calculateWorkingHours = (
  checkIn,
  checkOut
) => {
  if (!checkIn || !checkOut) {
    return 0;
  }

  const start = new Date(checkIn);
  const end = new Date(checkOut);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime())
  ) {
    return 0;
  }

  const milliseconds =
    end.getTime() - start.getTime();

  if (milliseconds <= 0) {
    return 0;
  }

  return round(
    milliseconds / (1000 * 60 * 60),
    2
  );
};

export const calculateWorkingMinutes = (
  checkIn,
  checkOut
) => {
  return Math.round(
    calculateWorkingHours(
      checkIn,
      checkOut
    ) * 60
  );
};

export const calculateAttendanceRate = (
  presentDays,
  totalWorkingDays
) => {
  const total = toNumber(totalWorkingDays);

  if (total <= 0) {
    return 0;
  }

  return round(
    (toNumber(presentDays) / total) * 100
  );
};

/* =========================
   Leave Calculations
========================= */

export const calculateLeaveDays = (
  fromDate,
  toDate
) => {
  if (!fromDate || !toDate) {
    return 0;
  }

  const start = new Date(fromDate);
  const end = new Date(toDate);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime())
  ) {
    return 0;
  }

  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  if (end < start) {
    return 0;
  }

  const milliseconds =
    end.getTime() - start.getTime();

  return Math.floor(
    milliseconds / (1000 * 60 * 60 * 24)
  ) + 1;
};

/* =========================
   Task Calculations
========================= */

export const calculateTaskCompletionRate = (
  completedTasks,
  totalTasks
) => {
  const total = toNumber(totalTasks);

  if (total <= 0) {
    return 0;
  }

  return round(
    (toNumber(completedTasks) / total) * 100
  );
};

/* =========================
   Dashboard Calculations
========================= */

export const calculateAverage = (
  values = []
) => {
  if (!Array.isArray(values) || values.length === 0) {
    return 0;
  }

  const validValues = values
    .map((value) => Number(value))
    .filter(Number.isFinite);

  if (validValues.length === 0) {
    return 0;
  }

  return round(
    validValues.reduce(
      (sum, value) => sum + value,
      0
    ) / validValues.length
  );
};

export const calculateTotal = (
  values = []
) => {
  if (!Array.isArray(values)) {
    return 0;
  }

  return round(
    values.reduce(
      (sum, value) => sum + toNumber(value),
      0
    )
  );
};

/* =========================
   Utility
========================= */

export const roundCurrency = (value) =>
  round(value, 2);

export const clamp = (
  value,
  min = 0,
  max = 100
) => {
  return Math.min(
    Math.max(toNumber(value), min),
    max
  );
};

export const calculateNetAmount = (
  subtotal,
  discount = 0
) => {
  return round(
    Math.max(
      toNumber(subtotal) - toNumber(discount),
      0
    )
  );
};

export const calculateTotalWithTax = (
  amount,
  taxRate = 0
) => {
  const baseAmount = toNumber(amount);
  const taxAmount = calculateTaxAmount(
    baseAmount,
    taxRate
  );

  return round(baseAmount + taxAmount);
};

export default {
  calculateAmount,
  calculateDiscountAmount,
  calculateTaxAmount,
  calculateLineItem,
  calculateLineItems,
  calculateSubtotal,
  calculateTotalDiscount,
  calculateTaxableAmount,
  calculateTotalTax,
  calculateGrandTotal,
  calculateDocumentTotals,
  calculatePanelCapacity,
  calculateTotalPanelCapacity,
  calculateInverterCapacity,
  calculateTotalInverterCapacity,
  calculateBatteryCapacity,
  calculateTotalBatteryCapacity,
  calculatePercentage,
  calculatePercentageChange,
  calculateConversionRate,
  calculateLostRate,
  calculateWorkingHours,
  calculateWorkingMinutes,
  calculateAttendanceRate,
  calculateLeaveDays,
  calculateTaskCompletionRate,
  calculateAverage,
  calculateTotal,
  roundCurrency,
  clamp,
  calculateNetAmount,
  calculateTotalWithTax,
};