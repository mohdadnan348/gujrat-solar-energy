const isValidDate = (value) => {
  if (!value) return false;

  const date = value instanceof Date
    ? value
    : new Date(value);

  return !Number.isNaN(date.getTime());
};

/* =========================
   Date Conversion
========================= */

export const toDate = (value) => {
  if (!value) return null;

  const date = value instanceof Date
    ? new Date(value.getTime())
    : new Date(value);

  return isValidDate(date) ? date : null;
};

export const toISOString = (value) => {
  const date = toDate(value);

  return date ? date.toISOString() : "";
};

export const toDateInputValue = (value) => {
  const date = toDate(value);

  if (!date) return "";

  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");
  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

/* =========================
   Start / End of Day
========================= */

export const startOfDay = (value = new Date()) => {
  const date = toDate(value);

  if (!date) return null;

  date.setHours(0, 0, 0, 0);

  return date;
};

export const endOfDay = (value = new Date()) => {
  const date = toDate(value);

  if (!date) return null;

  date.setHours(23, 59, 59, 999);

  return date;
};

/* =========================
   Start / End of Week
========================= */

export const startOfWeek = (
  value = new Date(),
  weekStartsOn = 1
) => {
  const date = startOfDay(value);

  if (!date) return null;

  const day = date.getDay();

  const difference =
    (day - weekStartsOn + 7) % 7;

  date.setDate(
    date.getDate() - difference
  );

  return date;
};

export const endOfWeek = (
  value = new Date(),
  weekStartsOn = 1
) => {
  const start = startOfWeek(
    value,
    weekStartsOn
  );

  if (!start) return null;

  const end = new Date(start);

  end.setDate(
    end.getDate() + 6
  );

  return endOfDay(end);
};

/* =========================
   Start / End of Month
========================= */

export const startOfMonth = (
  value = new Date()
) => {
  const date = startOfDay(value);

  if (!date) return null;

  date.setDate(1);

  return date;
};

export const endOfMonth = (
  value = new Date()
) => {
  const date = startOfMonth(value);

  if (!date) return null;

  date.setMonth(
    date.getMonth() + 1,
    0
  );

  return endOfDay(date);
};

/* =========================
   Start / End of Year
========================= */

export const startOfYear = (
  value = new Date()
) => {
  const date = startOfDay(value);

  if (!date) return null;

  date.setMonth(0, 1);

  return date;
};

export const endOfYear = (
  value = new Date()
) => {
  const date = startOfYear(value);

  if (!date) return null;

  date.setMonth(11, 31);

  return endOfDay(date);
};

/* =========================
   Date Comparisons
========================= */

export const isSameDay = (
  firstDate,
  secondDate
) => {
  const first = toDate(firstDate);
  const second = toDate(secondDate);

  if (!first || !second) return false;

  return (
    first.getFullYear() ===
      second.getFullYear() &&
    first.getMonth() ===
      second.getMonth() &&
    first.getDate() ===
      second.getDate()
  );
};

export const isSameMonth = (
  firstDate,
  secondDate
) => {
  const first = toDate(firstDate);
  const second = toDate(secondDate);

  if (!first || !second) return false;

  return (
    first.getFullYear() ===
      second.getFullYear() &&
    first.getMonth() ===
      second.getMonth()
  );
};

export const isSameYear = (
  firstDate,
  secondDate
) => {
  const first = toDate(firstDate);
  const second = toDate(secondDate);

  if (!first || !second) return false;

  return (
    first.getFullYear() ===
    second.getFullYear()
  );
};

export const isBefore = (
  firstDate,
  secondDate
) => {
  const first = toDate(firstDate);
  const second = toDate(secondDate);

  if (!first || !second) return false;

  return first.getTime() < second.getTime();
};

export const isAfter = (
  firstDate,
  secondDate
) => {
  const first = toDate(firstDate);
  const second = toDate(secondDate);

  if (!first || !second) return false;

  return first.getTime() > second.getTime();
};

export const isDateInRange = (
  value,
  fromDate,
  toDateValue
) => {
  const date = toDate(value);
  const from = toDate(fromDate);
  const to = toDate(toDateValue);

  if (!date || !from || !to) {
    return false;
  }

  return (
    date.getTime() >= from.getTime() &&
    date.getTime() <= to.getTime()
  );
};

/* =========================
   Date Difference
========================= */

export const differenceInMilliseconds = (
  firstDate,
  secondDate
) => {
  const first = toDate(firstDate);
  const second = toDate(secondDate);

  if (!first || !second) return 0;

  return Math.abs(
    first.getTime() - second.getTime()
  );
};

export const differenceInSeconds = (
  firstDate,
  secondDate
) => {
  return Math.floor(
    differenceInMilliseconds(
      firstDate,
      secondDate
    ) / 1000
  );
};

export const differenceInMinutes = (
  firstDate,
  secondDate
) => {
  return Math.floor(
    differenceInMilliseconds(
      firstDate,
      secondDate
    ) / (1000 * 60)
  );
};

export const differenceInHours = (
  firstDate,
  secondDate
) => {
  return Math.floor(
    differenceInMilliseconds(
      firstDate,
      secondDate
    ) / (1000 * 60 * 60)
  );
};

export const differenceInDays = (
  firstDate,
  secondDate
) => {
  return Math.floor(
    differenceInMilliseconds(
      firstDate,
      secondDate
    ) / (1000 * 60 * 60 * 24)
  );
};

export const differenceInMonths = (
  firstDate,
  secondDate
) => {
  const first = toDate(firstDate);
  const second = toDate(secondDate);

  if (!first || !second) return 0;

  return Math.abs(
    (first.getFullYear() -
      second.getFullYear()) *
      12 +
      (first.getMonth() -
        second.getMonth())
  );
};

export const differenceInYears = (
  firstDate,
  secondDate
) => {
  const first = toDate(firstDate);
  const second = toDate(secondDate);

  if (!first || !second) return 0;

  return Math.abs(
    first.getFullYear() -
      second.getFullYear()
  );
};

/* =========================
   Date Arithmetic
========================= */

export const addDays = (
  value,
  amount
) => {
  const date = toDate(value);

  if (!date) return null;

  date.setDate(
    date.getDate() + Number(amount || 0)
  );

  return date;
};

export const subtractDays = (
  value,
  amount
) => {
  return addDays(
    value,
    -Number(amount || 0)
  );
};

export const addWeeks = (
  value,
  amount
) => {
  return addDays(
    value,
    Number(amount || 0) * 7
  );
};

export const subtractWeeks = (
  value,
  amount
) => {
  return addWeeks(
    value,
    -Number(amount || 0)
  );
};

export const addMonths = (
  value,
  amount
) => {
  const date = toDate(value);

  if (!date) return null;

  date.setMonth(
    date.getMonth() + Number(amount || 0)
  );

  return date;
};

export const subtractMonths = (
  value,
  amount
) => {
  return addMonths(
    value,
    -Number(amount || 0)
  );
};

export const addYears = (
  value,
  amount
) => {
  const date = toDate(value);

  if (!date) return null;

  date.setFullYear(
    date.getFullYear() + Number(amount || 0)
  );

  return date;
};

export const subtractYears = (
  value,
  amount
) => {
  return addYears(
    value,
    -Number(amount || 0)
  );
};

/* =========================
   Date Range Helpers
========================= */

export const getTodayRange = () => ({
  from: startOfDay(),
  to: endOfDay(),
});

export const getThisWeekRange = () => ({
  from: startOfWeek(),
  to: endOfWeek(),
});

export const getThisMonthRange = () => ({
  from: startOfMonth(),
  to: endOfMonth(),
});

export const getThisYearRange = () => ({
  from: startOfYear(),
  to: endOfYear(),
});

export const getDateRange = (
  fromDate,
  toDateValue
) => ({
  from: startOfDay(fromDate),
  to: endOfDay(toDateValue),
});

/* =========================
   Date Labels
========================= */

export const getDayName = (
  value,
  format = "long"
) => {
  const date = toDate(value);

  if (!date) return "";

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      weekday: format,
    }
  ).format(date);
};

export const getMonthName = (
  value,
  format = "long"
) => {
  const date = toDate(value);

  if (!date) return "";

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      month: format,
    }
  ).format(date);
};

export const getYear = (value) => {
  const date = toDate(value);

  return date ? date.getFullYear() : null;
};

export const getMonth = (value) => {
  const date = toDate(value);

  return date ? date.getMonth() + 1 : null;
};

export const getDay = (value) => {
  const date = toDate(value);

  return date ? date.getDate() : null;
};

/* =========================
   Relative Date Helpers
========================= */

export const isToday = (value) =>
  isSameDay(value, new Date());

export const isYesterday = (value) =>
  isSameDay(
    value,
    subtractDays(new Date(), 1)
  );

export const isTomorrow = (value) =>
  isSameDay(
    value,
    addDays(new Date(), 1)
  );

export const isPast = (value) => {
  const date = toDate(value);

  if (!date) return false;

  return date.getTime() < Date.now();
};

export const isFuture = (value) => {
  const date = toDate(value);

  if (!date) return false;

  return date.getTime() > Date.now();
};

export const isOverdue = (value) => {
  const date = toDate(value);

  if (!date) return false;

  return date.getTime() < Date.now();
};

/* =========================
   Working Days
========================= */

export const isWeekend = (value) => {
  const date = toDate(value);

  if (!date) return false;

  const day = date.getDay();

  return day === 0 || day === 6;
};

export const isWeekday = (value) =>
  !isWeekend(value);

export const countWorkingDays = (
  fromDate,
  toDateValue
) => {
  const start = startOfDay(fromDate);
  const end = startOfDay(toDateValue);

  if (!start || !end || end < start) {
    return 0;
  }

  let count = 0;
  const current = new Date(start);

  while (current <= end) {
    if (!isWeekend(current)) {
      count += 1;
    }

    current.setDate(
      current.getDate() + 1
    );
  }

  return count;
};

/* =========================
   Date Validation
========================= */

export const validateDate = (value) => {
  return isValidDate(value);
};

export const validateDateRange = (
  fromDate,
  toDateValue
) => {
  const from = toDate(fromDate);
  const to = toDate(toDateValue);

  if (!from || !to) {
    return false;
  }

  return from.getTime() <= to.getTime();
};

/* =========================
   Default Export
========================= */

export default {
  toDate,
  toISOString,
  toDateInputValue,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  isSameDay,
  isSameMonth,
  isSameYear,
  isBefore,
  isAfter,
  isDateInRange,
  differenceInMilliseconds,
  differenceInSeconds,
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
  differenceInMonths,
  differenceInYears,
  addDays,
  subtractDays,
  addWeeks,
  subtractWeeks,
  addMonths,
  subtractMonths,
  addYears,
  subtractYears,
  getTodayRange,
  getThisWeekRange,
  getThisMonthRange,
  getThisYearRange,
  getDateRange,
  getDayName,
  getMonthName,
  getYear,
  getMonth,
  getDay,
  isToday,
  isYesterday,
  isTomorrow,
  isPast,
  isFuture,
  isOverdue,
  isWeekend,
  isWeekday,
  countWorkingDays,
  validateDate,
  validateDateRange,
};